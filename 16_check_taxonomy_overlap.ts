import dotenv from "dotenv";
import {
  checkTaxonomyOverlap,
  defaultCsvFilesForChecks,
  DEFAULT_CANONICAL_AI_SPACE_ID,
} from "./src/prepublish-checks";

dotenv.config();

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function parseCsvListArg(name: string): string[] | undefined {
  const raw = getArg(name);
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function main() {
  const files = parseCsvListArg("--files") ?? defaultCsvFilesForChecks();
  const canonicalSpaceId =
    getArg("--canonical-space") ?? process.env.CANONICAL_TAXONOMY_SPACE_ID ?? DEFAULT_CANONICAL_AI_SPACE_ID;
  const report = await checkTaxonomyOverlap({ filePaths: files, canonicalSpaceId });

  console.log(`Canonical space: ${report.canonicalSpaceName} (${report.canonicalSpaceId})`);
  console.log(`Canonical entities scanned: ${report.canonicalEntityCount}`);
  console.log(
    `Totals -> exact: ${report.totalExact}, similar: ${report.totalSimilar}, unmatched: ${report.totalUnmatched}`,
  );

  for (const field of report.fields) {
    console.log(
      `[${field.field}] total=${field.total} exact=${field.exactCount} similar=${field.similarCount} unmatched=${field.unmatchedCount}`,
    );
    for (const similar of field.similar.slice(0, 10)) {
      console.log(
        `  ~ ${similar.value} -> ${similar.matchedEntity} (score=${similar.score.toFixed(3)})`,
      );
    }
  }

  if (report.totalSimilar > 0 && !hasFlag("--allow-similar")) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Taxonomy overlap check failed:", error);
  process.exit(1);
});
