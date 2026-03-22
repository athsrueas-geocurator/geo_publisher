import dotenv from "dotenv";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import { gql, printOps, publishOps } from "./src/functions";
import { DEFAULT_MAPPING_FILE, readDecisionFile } from "./src/mapping-decisions";

dotenv.config();

const ENTITY_BATCH_SIZE = 200;
const CONTENT_BATCH_SIZE = 1000;
const OUTPUT_DIR = "data_to_delete";
const OUTPUT_FILE = "blank_courses_lessons_ops.txt";

type EntitySummary = { id: string; name?: string };

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function verifySpaceExists(spaceId: string): Promise<void> {
  const result = await gql<{ space: { id: string } | null }>(
    `query VerifySpace($spaceId: UUID!) {
      space(id: $spaceId) {
        id
      }
    }`,
    { spaceId },
  );

  if (!result.space) {
    throw new Error(`Space not found: ${spaceId}`);
  }
}

async function fetchEntitiesByType(spaceId: string, typeId: string): Promise<EntitySummary[]> {
  const query = `query BlankEntitiesByType($spaceId: UUID!, $typeId: UUID!, $first: Int!, $offset: Int!) {
    entities(spaceId: $spaceId, typeId: $typeId, first: $first, offset: $offset) {
      id
      name
    }
  }`;

  const entities: EntitySummary[] = [];
  let offset = 0;

  while (true) {
    const response = await gql<{ entities: EntitySummary[] }>(query, {
      spaceId,
      typeId,
      first: ENTITY_BATCH_SIZE,
      offset,
    });

    if (!response.entities.length) break;

    entities.push(...response.entities);
    if (response.entities.length < ENTITY_BATCH_SIZE) break;
    offset += ENTITY_BATCH_SIZE;
  }

  return entities;
}

async function fetchEntityContent(entityId: string, spaceId: string) {
  const response = await gql<{
    values: Array<{ propertyId: string | null }>;
    relations: Array<{ id: string }>;
  }>(
    `query BlankEntityContent($entityId: UUID!, $spaceId: UUID!, $first: Int!) {
      values(
        filter: { entityId: { is: $entityId }, spaceId: { is: $spaceId } }
        first: $first
      ) {
        propertyId
      }
      relations(
        filter: { fromEntityId: { is: $entityId }, spaceId: { is: $spaceId } }
        first: $first
      ) {
        id
      }
    }`,
    { entityId, spaceId, first: CONTENT_BATCH_SIZE },
  );

  return {
    values: response.values.filter((value): value is { propertyId: string } => Boolean(value.propertyId)),
    relations: response.relations,
  };
}

async function buildBlankOps(entityIds: string[], spaceId: string): Promise<{ ops: Op[]; propertyClears: number; relationDeletes: number }> {
  const ops: Op[] = [];
  let propertyClears = 0;
  let relationDeletes = 0;

  for (const entityId of entityIds) {
    const content = await fetchEntityContent(entityId, spaceId);
    const propertyIds = [...new Set(content.values.map((value) => value.propertyId))];

    if (propertyIds.length > 0) {
      const update = Graph.updateEntity({
        id: entityId,
        unset: propertyIds.map((property) => ({ property })),
      });
      ops.push(...update.ops);
      propertyClears += propertyIds.length;
    }

    for (const relation of content.relations) {
      const del = Graph.deleteRelation({ id: relation.id });
      ops.push(...del.ops);
      relationDeletes += 1;
    }
  }

  return { ops, propertyClears, relationDeletes };
}

async function main() {
  const mappingFile = getArg("--mapping") ?? DEFAULT_MAPPING_FILE;
  const mapping = readDecisionFile(mappingFile);
  const targetSpace =
    getArg("--space") ?? process.env.TARGET_SPACE_ID ?? mapping.targetSpaceId;
  if (!targetSpace) {
    throw new Error("Missing target space. Pass --space or set TARGET_SPACE_ID in .env or provide a mapping file.");
  }

  await verifySpaceExists(targetSpace);

  const typeBuckets = [
    { typeId: mapping.types.course.typeId, label: mapping.types.course.typeName },
    { typeId: mapping.types.lesson.typeId, label: mapping.types.lesson.typeName },
  ];

  const resolvedEntities: Array<{ label: string; entries: EntitySummary[] }> = [];
  for (const bucket of typeBuckets) {
    console.log(`Fetching ${bucket.label} entities (type ${bucket.typeId})...`);
    const entries = await fetchEntitiesByType(targetSpace, bucket.typeId);
    console.log(`  Found ${entries.length} ${bucket.label}(s)`);
    resolvedEntities.push({ label: bucket.label, entries });
  }

  const allEntityIds = resolvedEntities.flatMap((bucket) => bucket.entries.map((entry) => entry.id));
  console.log(`Total entities to blank: ${allEntityIds.length}`);

  if (!allEntityIds.length) {
    console.log("No course or lesson entities detected; nothing to blank.");
    return;
  }

  const { ops, propertyClears, relationDeletes } = await buildBlankOps(allEntityIds, targetSpace);

  printOps(ops, OUTPUT_DIR, OUTPUT_FILE);
  console.log(`Prepared ${ops.length} ops (unset ${propertyClears} properties, delete ${relationDeletes} relations).`);

  const shouldPublish = hasFlag("--publish");
  if (!shouldPublish || !ops.length) {
    console.log("Dry run complete. Use --publish to submit the blanking transaction.");
    return;
  }

  const txHash = await publishOps(ops, "Blank course and lesson content", targetSpace);
  console.log(`Blanking transaction submitted: ${txHash}`);
}

main().catch((error) => {
  console.error("Blanking script failed:", error);
  process.exit(1);
});
