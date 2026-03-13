/**
 * Geo API Demo — Querying the Knowledge Graph via GraphQL
 *
 * This script demonstrates how to use the Geo GraphQL API to:
 *   1. Get space information
 *   2. List entities in a space
 *   3. Filter entities by type
 *   4. Get entity details (values and relations)
 *   5. Query your target space
 *   6. Explore backlinks (reverse relations)
 *
 * Usage:
 *   bun run 01_api_demo.ts
 *
 * API endpoint: https://testnet-api.geobrowser.io/graphql
 *
 * Key API notes:
 *   - The API uses UUID scalar types (32-char hex, no dashes)
 *   - UUIDFilter uses `is` / `isNot` (not `equalTo`)
 *   - UUIDListFilter uses `anyEqualTo`
 *   - Top-level `spaceId` and `typeId` args on `entities` are convenient shortcuts
 */

import dotenv from "dotenv";
import { gql } from "./src/functions";
import { ROOT_SPACE_ID, TYPES } from "./src/constants";
import {
  ENTITY_CORE_FIELDS,
  RELATION_CORE_FIELDS,
  SPACE_CORE_FIELDS,
  VALUE_CORE_FIELDS,
} from "./src/graphql-fragments";
dotenv.config();

// ─── Demo 1: Get Space Information ───────────────────────────────────────────

async function demo1_getSpaceInfo() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 1: Get Space Information");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // The space() query takes a UUID! argument (not String!)
  const data = await gql<{ space: Record<string, unknown> | null }>(
    `query DemoGetSpaceInfo($spaceId: UUID!) {
      space(id: $spaceId) {
        ${SPACE_CORE_FIELDS}
      }
    }`,
    { spaceId: ROOT_SPACE_ID },
  );

  console.log("Root Space:", JSON.stringify(data.space, null, 2));
  console.log();
}

// ─── Demo 2: List Entities in a Space ────────────────────────────────────────

async function demo2_listEntities() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 2: List Entities in a Space");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Use the top-level `spaceId` arg for convenient filtering
  // Ordering options: CREATED_AT_ASC, CREATED_AT_DESC, UPDATED_AT_ASC, etc.
  const data = await gql<{ entities: Array<any> }>(
    `query DemoListEntities($spaceId: UUID!, $first: Int!) {
      entities(
        spaceId: $spaceId
        first: $first
        filter: { name: { isNull: false } }
        orderBy: UPDATED_AT_DESC
      ) {
        ${ENTITY_CORE_FIELDS}
        createdAt
        updatedAt
      }
    }`,
    { spaceId: ROOT_SPACE_ID, first: 10 },
  );

  console.log(`Recently updated entities (first 10):\n`);
  for (const entity of data.entities) {
    console.log(`  ${entity.name}`);
    console.log(`    ID: ${entity.id}`);
    if (entity.description) {
      const desc = entity.description.length > 80 ? entity.description.slice(0, 80) + "..." : entity.description;
      console.log(`    Description: ${desc}`);
    }
    console.log(`    Types: [${entity.typeIds.join(", ")}]`);
    console.log();
  }
}

// ─── Demo 3: Filter Entities by Type ─────────────────────────────────────────

async function demo3_filterByType() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 3: Filter Entities by Type (all 'Type' definitions)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Use the top-level `typeId` arg to filter by entity type
  const data = await gql<{ entities: Array<any> }>(
    `query DemoFilterByType($spaceId: UUID!, $typeId: UUID!, $first: Int!) {
      entities(
        spaceId: $spaceId
        typeId: $typeId
        first: $first
        filter: { name: { isNull: false } }
      ) {
        ${ENTITY_CORE_FIELDS}
      }
    }`,
    { spaceId: ROOT_SPACE_ID, typeId: TYPES.type, first: 15 },
  );

  console.log(`Schema Types defined in root space (first 15):\n`);
  for (const entity of data.entities) {
    const desc = entity.description ? ` — ${entity.description.slice(0, 80)}` : "";
    console.log(`  ${entity.name} (${entity.id})${desc}`);
  }
  console.log();
}

// ─── Demo 4: Get Entity Details (Values + Relations) ─────────────────────────

async function demo4_entityDetails() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 4: Get Entity Details — Values & Relations");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const personTypeId = TYPES.person;

  // Get values (property-value triples) — UUIDFilter uses `is` for equality
  const data = await gql<{ values: Array<any>; relations: Array<any> }>(
    `query DemoEntityDetails($entityId: UUID!, $spaceId: UUID!, $first: Int!) {
      values(
        filter: {
          entityId: { is: $entityId }
          spaceId: { is: $spaceId }
        }
      ) {
        ${VALUE_CORE_FIELDS}
      }
      relations(
        filter: {
          fromEntityId: { is: $entityId }
          spaceId: { is: $spaceId }
        }
        first: $first
      ) {
        ${RELATION_CORE_FIELDS}
      }
    }`,
    { entityId: personTypeId, spaceId: ROOT_SPACE_ID, first: 20 },
  );

  console.log(`Values for "Person" type (${personTypeId}):\n`);
  for (const v of data.values) {
    const propName = v.propertyEntity?.name || v.propertyId;
    const value = v.text ?? v.integer ?? v.float ?? v.boolean ?? v.date ?? v.datetime ?? "(complex)";
    console.log(`  ${propName}: ${value}`);
  }

  console.log(`\nRelations from "Person" type (schema properties):\n`);
  for (const r of data.relations) {
    const relType = r.typeEntity?.name || r.typeId;
    const target = r.toEntity?.name || r.toEntityId;
    console.log(`  --[${relType}]--> ${target}`);
  }
  console.log();
}

// ─── Demo 5: Query a Custom Space ────────────────────────────────────────────

async function demo5_customSpace() {
  const spaceId = process.env.TARGET_SPACE_ID;
  if (!spaceId) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Demo 5: Query Your Target Space (skipped — set TARGET_SPACE_ID)");
    console.log("═══════════════════════════════════════════════════════════════\n");
    console.log("  Set TARGET_SPACE_ID in .env to query your published entities.\n");
    return;
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`Demo 5: Query Your Target Space (${spaceId})`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  const data = await gql<{ space: any; entities: Array<any> }>(
    `query DemoCustomSpace($spaceId: UUID!, $first: Int!) {
      space(id: $spaceId) {
        ${SPACE_CORE_FIELDS}
      }
      entities(
        spaceId: $spaceId
        first: $first
        filter: { name: { isNull: false } }
      ) {
        ${ENTITY_CORE_FIELDS}
      }
    }`,
    { spaceId, first: 20 },
  );

  if (data.space) {
    console.log("Space:", JSON.stringify(data.space, null, 2));
  }

  console.log(`\nEntities in your space:\n`);
  for (const entity of data.entities) {
    console.log(`  ${entity.name} (${entity.id})`);
    if (entity.description) {
      console.log(`    → ${entity.description.slice(0, 100)}`);
    }
    console.log(`    Types: [${entity.typeIds.join(", ")}]`);
  }
  console.log();
}

// ─── Demo 6: Explore Backlinks (Reverse Relations) ───────────────────────────

async function demo6_backlinks() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 6: Explore Backlinks (who references an entity?)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Find relations that point TO the "Type" entity —
  // these are entities with Types: Type (i.e., type definitions)
  const typeEntityId = TYPES.type;

  const data = await gql<{ relations: Array<any> }>(
    `query DemoBacklinks($toEntityId: UUID!, $spaceId: UUID!, $first: Int!) {
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
    { toEntityId: typeEntityId, spaceId: ROOT_SPACE_ID, first: 15 },
  );

  console.log(`Entities that reference "Type" (${typeEntityId}) in root space:\n`);
  for (const r of data.relations) {
    const from = r.fromEntity?.name || r.fromEntityId;
    const relType = r.typeEntity?.name || r.typeId;
    console.log(`  ${from} --[${relType}]--> Type`);
  }
  console.log();
}

// ─── Run All Demos ───────────────────────────────────────────────────────────

async function main() {
  console.log("=== Geo API Demo: Querying the Knowledge Graph ===\n");
  console.log(`API Endpoint: https://testnet-api.geobrowser.io/graphql\n`);

  await demo1_getSpaceInfo();
  await demo2_listEntities();
  await demo3_filterByType();
  await demo4_entityDetails();
  await demo5_customSpace();
  await demo6_backlinks();

  console.log("=== Demo Complete ===");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
