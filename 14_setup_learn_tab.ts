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

  const snapshot = await gql<SpaceSnapshot>(
    `query LearnTabSpace($spaceId: UUID!) {
      space(id: $spaceId) {
        id
        page { id name }
      }
    }`,
    { spaceId: targetSpaceId },
  );

  if (!snapshot.space?.page?.id) {
    throw new Error(`Space ${targetSpaceId} has no page entity.`);
  }

  const rootPageId = snapshot.space.page.id;
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
    console.log(`Learn tab already exists (${existingLearnTab.toEntity?.id}). Nothing to do.`);
    return;
  }

  const ops: Op[] = [];

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
      [PROPERTIES.view]: { toEntity: VIEWS.gallery },
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
