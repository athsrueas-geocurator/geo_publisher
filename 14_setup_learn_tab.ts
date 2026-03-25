import dotenv from "dotenv";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import { gql, publishOps } from "./src/functions";
import {
  PROPERTIES,
  QUERY_DATA_SOURCE,
  ROOT_SPACE_ID,
  TYPES,
  VIEWS,
} from "./src/constants";

dotenv.config();

type SpaceSnapshot = {
  space: {
    id: string;
    page?: { id: string; name?: string } | null;
  } | null;
};

type ExistingTabQuery = {
  relations: Array<{
    id: string;
    typeId: string;
    position?: string | null;
    toEntity?: { id: string; name?: string; typeIds?: string[] } | null;
  }>;
};

type BlockRelationQuery = {
  relations: Array<{
    id: string;
    toEntity?: { id: string } | null;
  }>;
};

type ViewRelationQuery = {
  relations: Array<{
    id: string;
  }>;
};

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function buildCourseFilter(spaceId: string): string {
  const payload = {
    spaceId: { in: [spaceId] },
    filter: {
      [PROPERTIES.types]: { is: TYPES.course },
    },
  };
  return JSON.stringify(payload);
}

async function main() {
  const targetSpaceId = getArg("--space") ?? process.env.TARGET_SPACE_ID;
  if (!targetSpaceId) {
    throw new Error("Missing target space. Pass --space or set TARGET_SPACE_ID.");
  }

  const shouldPublish = hasFlag("--publish");
  const viewArg = getArg("--view") ?? "gallery";
  const viewEntity = VIEWS[viewArg as keyof typeof VIEWS];
  if (!viewEntity) {
    throw new Error(`Unknown view '${viewArg}'. Choose one of: ${Object.keys(VIEWS).join(", ")}.`);
  }
  console.log(`Using view: ${viewArg}`);

  const snapshot = await gql<SpaceSnapshot>(
    `query LearnTabSpace($spaceId: UUID!) {
      space(id: $spaceId) {
        id
        page { id name }
      }
    }`,
    { spaceId: targetSpaceId },
  );

  const ops: Op[] = [];
  let rootPageId = snapshot.space?.page?.id;
  if (!rootPageId) {
    const rootPageName = getArg("--page-name") ?? "Home";
    const rootPage = Graph.createEntity({
      name: rootPageName,
      types: [TYPES.page],
      relations: {
        [PROPERTIES.related_spaces]: [{ toEntity: targetSpaceId }],
      },
    });
    ops.push(...rootPage.ops);
    rootPageId = rootPage.id;
    console.log(
      `Created root page ${rootPageId} (${rootPageName}) and linked it to space ${targetSpaceId}.`,
    );
  }

  if (!rootPageId) {
    throw new Error(`Failed to determine root page for space ${targetSpaceId}.`);
  }
  const existing = await gql<ExistingTabQuery>(
    `query ExistingLearnTab($pageId: UUID!, $spaceId: UUID!, $first: Int!) {
      relations(
        filter: { fromEntityId: { is: $pageId }, spaceId: { is: $spaceId } }
        first: $first
      ) {
        id
        typeId
        position
        toEntity { id name typeIds }
      }
    }`,
    {
      pageId: rootPageId,
      spaceId: targetSpaceId,
      first: 500,
    },
  );

  const existingLearnTab = existing.relations.find(
    (rel) =>
      rel.typeId === PROPERTIES.tabs &&
      rel.toEntity?.typeIds?.includes(TYPES.page) &&
      rel.toEntity?.name?.toLowerCase() === "learn",
  );

  if (existingLearnTab) {
    console.log(`Learn tab already exists (${existingLearnTab.toEntity?.id}). Updating view to '${viewArg}'.`);

    const learnTabId = existingLearnTab.toEntity?.id;
    if (!learnTabId) {
      throw new Error("Existing Learn tab missing entity id");
    }

    const blocks = await gql<BlockRelationQuery>(
      `query LearnTabBlocks($pageId: UUID!, $spaceId: UUID!, $relationType: UUID!, $first: Int!) {
        relations(
          filter: { fromEntityId: { is: $pageId }, spaceId: { is: $spaceId }, typeId: { is: $relationType } }
          first: $first
        ) {
          id
          toEntity { id }
        }
      }`,
      {
        pageId: learnTabId,
        spaceId: targetSpaceId,
        relationType: PROPERTIES.blocks,
        first: 20,
      },
    );

    const blockRelation = blocks.relations[0];
    if (!blockRelation?.toEntity?.id) {
      throw new Error("Learn tab has no data block to update");
    }

    const existingViewRelations = await gql<ViewRelationQuery>(
      `query BlockViewRelations($blockId: UUID!, $spaceId: UUID!, $relationType: UUID!, $first: Int!) {
        relations(
          filter: { fromEntityId: { is: $blockId }, spaceId: { is: $spaceId }, typeId: { is: $relationType } }
          first: $first
        ) {
          id
        }
      }`,
      {
        blockId: blockRelation.toEntity.id,
        spaceId: targetSpaceId,
        relationType: PROPERTIES.view,
        first: 20,
      },
    );

    for (const relation of existingViewRelations.relations) {
      const del = Graph.deleteRelation({ id: relation.id });
      ops.push(...del.ops);
    }

    const setView = Graph.createRelation({
      fromEntity: blockRelation.toEntity.id,
      toEntity: viewEntity,
      type: PROPERTIES.view,
    });
    ops.push(...setView.ops);

    console.log(`Prepared ${ops.length} ops to adjust Learn tab view.`);
    if (!shouldPublish) {
      console.log("Dry run only. Add --publish to update the Learn tab view.");
      return;
    }

    const txHash = await publishOps(ops, "Update Learn tab view", targetSpaceId);
    console.log(`Learn tab view update tx: ${txHash}`);
    return;
  }

  // ops already seeded with root page creation if needed

  const learnCollectionBlock = Graph.createEntity({
    name: "Learn",
    types: [TYPES.data_block],
    values: [
      {
        property: PROPERTIES.filter,
        type: "text",
        value: buildCourseFilter(targetSpaceId),
      },
    ],
    relations: {
      [PROPERTIES.data_source_type]: { toEntity: QUERY_DATA_SOURCE },
      [PROPERTIES.view]: { toEntity: viewEntity },
    },
  });
  ops.push(...learnCollectionBlock.ops);

  const learnTab = Graph.createEntity({
    name: "Learn",
    types: [TYPES.page],
    relations: {
      [PROPERTIES.blocks]: [{ toEntity: learnCollectionBlock.id }],
    },
  });
  ops.push(...learnTab.ops);

  const linkFromRoot = Graph.createRelation({
    fromEntity: rootPageId,
    toEntity: learnTab.id,
    type: PROPERTIES.tabs,
  });
  ops.push(...linkFromRoot.ops);

  console.log(`Prepared ${ops.length} ops to add Learn tab to space ${targetSpaceId}.`);

  if (!shouldPublish) {
    console.log("Dry run only. Add --publish to submit the Learn tab edit.");
    return;
  }

  const txHash = await publishOps(ops, "Add Learn tab with course collection", targetSpaceId);
  console.log(`Learn tab publish tx: ${txHash}`);
  console.log(`Geo URL: https://www.geobrowser.io/space/${targetSpaceId}/${rootPageId}`);
  console.log(`Reference policy root: ${ROOT_SPACE_ID}`);
}

main().catch((error) => {
  console.error("Failed to set up Learn tab:", error);
  process.exit(1);
});
