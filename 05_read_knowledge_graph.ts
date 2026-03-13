import dotenv from "dotenv";
import { gql } from "./src/functions";
import { ROOT_SPACE_ID, TYPES } from "./src/constants";
import {
  ENTITY_CORE_FIELDS,
  RELATION_CORE_FIELDS,
  SPACE_CORE_FIELDS,
  VALUE_CORE_FIELDS,
} from "./src/graphql-fragments";
import {
  assertFieldHasArgs,
  ensureQueryFields,
  queryFieldSummary,
  totalQueryFieldCount,
} from "./src/schema-utils";

dotenv.config();

const GEM_QUERY_FIELDS = [
  "space",
  "entities",
  "values",
  "relations",
  "node",
  "editVersions",
  "editVersionsConnection",
];

type EntityPreview = {
  id: string;
  name?: string;
  description?: string;
  typeIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ValuePreview = {
  propertyId: string;
  text?: string;
  propertyEntity?: { name?: string };
};

type RelationPreview = {
  id: string;
  typeId: string;
  typeEntity?: { name?: string };
  fromEntity?: { id: string; name?: string };
};

async function runQuery<T>(label: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  process.stdout.write(`\n🤖 ${label}\n`);
  const data = await gql(query, variables);
  process.stdout.write(`✅ ${label} succeeded\n`);
  return data as T;
}

async function main() {
  console.log("=== Geo Knowledge Graph Readiness Check ===");
  ensureQueryFields(GEM_QUERY_FIELDS);
  assertFieldHasArgs("entities", ["spaceId", "first", "orderBy", "filter"]);
  assertFieldHasArgs("values", ["filter"]);
  assertFieldHasArgs("relations", ["filter"]);

  console.log(`Root query exposes ${totalQueryFieldCount()} fields. Sample:`);
  for (const field of queryFieldSummary(8)) {
    console.log(`  • ${field.name} (${field.argCount} args) — ${field.description ?? "(no description)"}`);
  }

  const spaceData = await runQuery<{ space: { id: string; type?: string; address?: string; topicId?: string; page?: { id: string; name?: string; description?: string } } }>(
    "Root space info",
    `query RootSpaceInfo($spaceId: UUID!) {
      space(id: $spaceId) {
        ${SPACE_CORE_FIELDS}
      }
    }`,
    { spaceId: ROOT_SPACE_ID },
  );

  if (!spaceData.space) {
    throw new Error(`Root space ${ROOT_SPACE_ID} returned no data`);
  }

  const rootPage = spaceData.space.page;
  console.log(
    `Root space ${spaceData.space.id} (${spaceData.space.type}). Address: ${spaceData.space.address ?? "(none)"}. Page: ${rootPage?.name ?? "(none)"}`,
  );

  const listData = await runQuery<{ entities: EntityPreview[] }>(
    "Recent root entities",
    `query RecentRootEntities($spaceId: UUID!, $first: Int!) {
      entities(
        spaceId: $spaceId
        first: $first
        orderBy: UPDATED_AT_DESC
        filter: { name: { isNull: false } }
      ) {
        ${ENTITY_CORE_FIELDS}
        createdAt
        updatedAt
      }
    }`,
    { spaceId: ROOT_SPACE_ID, first: 10 },
  );

  console.log(`Fetched ${listData.entities.length} recent entities:`);
  for (const entity of listData.entities) {
    console.log(`  • ${entity.name ?? "(untitled)"} (${entity.id}) — ${entity.typeIds?.length ?? 0} types`);
  }

  const typeList = await runQuery<{ entities: EntityPreview[] }>(
    "Type definitions",
    `query TypeDefinitions($spaceId: UUID!, $typeId: UUID!, $first: Int!) {
      entities(
        spaceId: $spaceId
        typeId: $typeId
        first: $first
        orderBy: UPDATED_AT_ASC
      ) {
        ${ENTITY_CORE_FIELDS}
      }
    }`,
    { spaceId: ROOT_SPACE_ID, typeId: TYPES.type, first: 8 },
  );

  console.log(`Type definitions retrieved: ${typeList.entities.length}. Sample values:`);
  for (const type of typeList.entities) {
    console.log(`  • ${type.name ?? "(anon)"} — ${type.description ?? "(no description)"}`);
  }

  const schemaValues = await runQuery<{ values: ValuePreview[] }>(
    "Schema values for Type",
    `query SchemaValuesForType($entityId: UUID!, $spaceId: UUID!, $first: Int!) {
      values(
        filter: {
          entityId: { is: $entityId }
          spaceId: { is: $spaceId }
        }
        first: $first
      ) {
        ${VALUE_CORE_FIELDS}
      }
    }`,
    { entityId: TYPES.type, spaceId: ROOT_SPACE_ID, first: 12 },
  );

  console.log(`Values attached to Type (${schemaValues.values.length} rows):`);
  for (const value of schemaValues.values.slice(0, 6)) {
    console.log(`  • ${value.propertyEntity?.name ?? value.propertyId} = ${value.text ?? "(no text)"}`);
  }

  const backlinks = await runQuery<{ relations: RelationPreview[] }>(
    "Backlinks to Type",
    `query BacklinksToType($toEntityId: UUID!, $spaceId: UUID!, $first: Int!) {
      relations(
        filter: {
          toEntityId: { is: $toEntityId }
          spaceId: { is: $spaceId }
        }
        first: $first
      ) {
        ${RELATION_CORE_FIELDS}
      }
    }`,
    { toEntityId: TYPES.type, spaceId: ROOT_SPACE_ID, first: 8 },
  );

  console.log(`Backlinks found: ${backlinks.relations.length}`);
  for (const relation of backlinks.relations) {
    console.log(
      `  • ${relation.fromEntity?.name ?? relation.fromEntity?.id ?? "(unknown)"} --[${relation.typeEntity?.name ?? relation.typeId}]--> Type`,
    );
  }

  const targetSpaceId = process.env.TARGET_SPACE_ID;
  if (targetSpaceId) {
    const demoData = await runQuery<{
      space: { id: string; type: string; address?: string } | null;
      entities: EntityPreview[];
    }>(
      "Target space snapshot",
      `query DemoSpaceSnapshot($spaceId: UUID!, $first: Int!) {
        space(id: $spaceId) {
          id
          type
          address
        }
        entities(
          spaceId: $spaceId
          first: $first
          filter: { name: { isNull: false } }
        ) {
          ${ENTITY_CORE_FIELDS}
        }
      }`,
      { spaceId: targetSpaceId, first: 6 },
    );

    if (demoData.space) {
      console.log(
        `Target space ${targetSpaceId}: ${demoData.space.id} (${demoData.space.type}) — address ${demoData.space.address ?? "(none)"}`,
      );
    } else {
      console.log(`Target space ${targetSpaceId} (not found)`);
    }
    console.log(`Entities in target space: ${demoData.entities.length}`);
  } else {
    console.log("TARGET_SPACE_ID not set — skipping extra space query.");
  }

  console.log("=== Readiness check complete ===");
}

main().catch((err) => {
  console.error("Knowledge graph read script failed:", err);
  process.exit(1);
});
