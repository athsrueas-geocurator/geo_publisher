import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { validateContentPolicies } from "./src/content-policy";
import {
  checkCsvWebUrls,
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

function readRows(filePath: string): Array<Record<string, unknown>> {
  if (filePath.toLowerCase().endsWith(".csv")) {
    const csv = readFileSync(filePath, "utf8");
    return parse(csv, { columns: true, skip_empty_lines: true }) as Array<Record<string, unknown>>;
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as Array<Record<string, unknown>>;
}

async function main() {
  const coursesPath = getArg("--courses-csv") ?? "data_to_publish/courses.csv";
  const lessonsPath = getArg("--lessons-csv") ?? "data_to_publish/lessons.csv";
  const canonicalSpaceId =
    getArg("--canonical-space") ?? process.env.CANONICAL_TAXONOMY_SPACE_ID ?? DEFAULT_CANONICAL_AI_SPACE_ID;

  const courses = readRows(coursesPath);
  const lessons = readRows(lessonsPath);
  const policy = validateContentPolicies(courses, lessons);
  console.log(`Policy: ${policy.errorCount} errors, ${policy.warningCount} warnings`);

  const csvFiles = defaultCsvFilesForChecks();
  const urlReport = await checkCsvWebUrls(csvFiles);
  console.log(
    `URLs: checked ${urlReport.checkedCount}, restricted ${urlReport.restrictedCount}, failures ${urlReport.failureCount}`,
  );

  const taxonomy = await checkTaxonomyOverlap({
    filePaths: csvFiles,
    canonicalSpaceId,
  });
  console.log(
    `Taxonomy: exact ${taxonomy.totalExact}, similar ${taxonomy.totalSimilar}, unmatched ${taxonomy.totalUnmatched}`,
  );

  const allowPolicyWarnings = hasFlag("--allow-policy-warnings");
  const allowBrokenUrls = hasFlag("--allow-broken-urls");
  const allowTaxonomySimilar = hasFlag("--allow-taxonomy-similar");

  if (policy.errorCount > 0) {
    process.exit(1);
  }
  if (policy.warningCount > 0 && !allowPolicyWarnings) {
    process.exit(1);
  }
  if (urlReport.failureCount > 0 && !allowBrokenUrls) {
    process.exit(1);
  }
  if (taxonomy.totalSimilar > 0 && !allowTaxonomySimilar) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Prepublish check failed:", error);
  process.exit(1);
});
