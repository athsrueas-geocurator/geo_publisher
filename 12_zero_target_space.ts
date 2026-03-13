import dotenv from "dotenv";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import { gql, printOps, publishOps } from "./src/functions";

dotenv.config();

type SpaceSnapshot = {
  space: { id: string; page?: { id: string } | null } | null;
  entities: Array<{ id: string; name?: string }>;
};

type EntityDetails = {
  values: Array<{ propertyId: string }>;
  relations: Array<{ id: string }>;
};

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  const spaceId = getArg("--space") ?? process.env.TARGET_SPACE_ID;
  const shouldPublish = hasFlag("--publish");
  if (!spaceId) {
    throw new Error("Missing target space. Pass --space or set TARGET_SPACE_ID in .env");
  }

  const snapshot = await gql<SpaceSnapshot>(
    `query ZeroSpaceSnapshot($spaceId: UUID!, $first: Int!) {
      space(id: $spaceId) {
        id
        page { id }
      }
      entities(spaceId: $spaceId, first: $first) {
        id
        name
      }
    }`,
    { spaceId, first: 1000 },
  );

  if (!snapshot.space) {
    throw new Error(`Space not found: ${spaceId}`);
  }

  const protectedEntityIds = new Set<string>();
  if (snapshot.space.page?.id) {
    protectedEntityIds.add(snapshot.space.page.id);
  }

  const targetEntityIds = snapshot.entities
    .map((entity) => entity.id)
    .filter((id) => !protectedEntityIds.has(id));

  const ops: Op[] = [];
  for (const entityId of targetEntityIds) {
    const details = await gql<EntityDetails>(
      `query ZeroEntityDetails($entityId: UUID!, $spaceId: UUID!, $first: Int!) {
        values(filter: { entityId: { is: $entityId }, spaceId: { is: $spaceId } }, first: $first) {
          propertyId
        }
        relations(filter: { fromEntityId: { is: $entityId }, spaceId: { is: $spaceId } }, first: $first) {
          id
        }
      }`,
      { entityId, spaceId, first: 500 },
    );

    const propertyIds = [...new Set(details.values.map((value) => value.propertyId))];
    if (propertyIds.length > 0) {
      const update = Graph.updateEntity({
        id: entityId,
        unset: propertyIds.map((property) => ({ property })),
      });
      ops.push(...update.ops);
    }

    for (const relation of details.relations) {
      const del = Graph.deleteRelation({ id: relation.id });
      ops.push(...del.ops);
    }
  }

  printOps(ops, "data_to_delete", "zero_target_space_ops.txt");
  console.log(`Prepared ${ops.length} ops to zero space ${spaceId}.`);
  console.log(`Entities considered: ${targetEntityIds.length}. Protected: ${protectedEntityIds.size}.`);

  if (!shouldPublish) {
    console.log("Dry run only. Use --publish to submit zero-space ops.");
    return;
  }

  const txHash = await publishOps(ops, "Zero target space entities", spaceId);
  console.log(`Zero-space transaction submitted: ${txHash}`);
}

main().catch((error) => {
  console.error("Zero-space script failed:", error);
  process.exit(1);
});
