import * as fs from "node:fs";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { Graph } from "@geoprotocol/geo-sdk";
import { printOps, publishOps } from "./src/functions";
import { TYPES } from "./src/constants";

dotenv.config();

async function main() {
  const editName = "Test OP - please deny";
  const csvPath = "data_to_publish/courses.csv";
  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  if (rows.length === 0) {
    throw new Error(`${csvPath} contains no rows to publish.`);
  }

  const topRow = rows[0] as Record<string, string>;
  const entityName = (topRow.Name ?? topRow.name ?? "Untitled Test Course").trim();
  const entityDescription = (topRow.Description ?? topRow.description ?? "No description provided").trim();

  const { ops } = Graph.createEntity({
    name: entityName,
    description: entityDescription,
    types: [TYPES.course],
  });

  printOps(ops, "data_to_delete", "test-op-please-deny.json");

  if (!process.argv.includes("--publish")) {
    console.log("Dry run complete. Run with --publish to actually submit the edit.");
    return;
  }

  const txHash = await publishOps(ops, editName);
  console.log(`${editName} submitted. Tx hash: ${txHash}`);
}

main().catch((err) => {
  console.error("Test op failed:", err);
  process.exit(1);
});
