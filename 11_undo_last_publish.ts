import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import { printOps, publishOps } from "./src/functions";

dotenv.config();

type PersistedOp = {
  type: string;
  id?: string;
  values?: Array<{ property?: string }>;
};

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readPersistedOps(filePath: string): PersistedOp[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Ops file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as PersistedOp[];
}

function buildUndoOps(persisted: PersistedOp[]): Op[] {
  const undo: Op[] = [];

  const createEntities = persisted.filter((op) => op.type === "createEntity" && op.id);
  for (const op of createEntities) {
    const entityId = op.id as string;
    const propertyIds = [...new Set((op.values ?? []).map((v) => v.property).filter(Boolean))] as string[];
    if (propertyIds.length > 0) {
      const update = Graph.updateEntity({
        id: entityId,
        unset: propertyIds.map((property) => ({ property })),
      });
      undo.push(...update.ops);
    }
  }

  const relationIds = [
    ...new Set(
      persisted
        .filter((op) => op.type === "createRelation" && op.id)
        .map((op) => op.id as string),
    ),
  ];
  for (const relationId of relationIds) {
    const del = Graph.deleteRelation({ id: relationId });
    undo.push(...del.ops);
  }

  return undo;
}

async function main() {
  const opsFile =
    getArg("--ops-file") ??
    path.resolve("data_to_delete", "courses_lessons_publish_ops.txt");
  const spaceId = getArg("--space") ?? process.env.TARGET_SPACE_ID;
  const shouldPublish = hasFlag("--publish");

  if (!spaceId) {
    throw new Error("Missing target space. Pass --space or set TARGET_SPACE_ID in .env");
  }

  const persisted = readPersistedOps(opsFile);
  const undoOps = buildUndoOps(persisted);
  printOps(undoOps, "data_to_delete", "courses_lessons_undo_ops.txt");
  console.log(`Generated ${undoOps.length} undo ops from ${opsFile}`);

  if (!shouldPublish) {
    console.log("Dry run only. Use --publish to submit undo ops.");
    return;
  }

  const txHash = await publishOps(undoOps, "Undo course/lesson publish", spaceId);
  console.log(`Undo submitted. Tx hash: ${txHash}`);
}

main().catch((error) => {
  console.error("Undo script failed:", error);
  process.exit(1);
});
