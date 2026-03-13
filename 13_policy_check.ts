import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { validateContentPolicies, type PolicyIssue } from "./src/content-policy";

dotenv.config();

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function printIssue(issue: PolicyIssue) {
  console.log(
    `- [${issue.level.toUpperCase()}] ${issue.entityKind}:${issue.rowId} ${issue.field} -> ${issue.message}`,
  );
}

async function main() {
  const coursesPath =
    getArg("--courses-json") ?? getArg("--courses-csv") ?? "data_to_publish/courses.csv";
  const lessonsPath =
    getArg("--lessons-json") ?? getArg("--lessons-csv") ?? "data_to_publish/lessons.csv";

  const readRows = (filePath: string) => {
    if (filePath.toLowerCase().endsWith(".csv")) {
      const csv = readFileSync(filePath, "utf8");
      return parse(csv, { columns: true, skip_empty_lines: true }) as Array<Record<string, unknown>>;
    }
    return JSON.parse(readFileSync(filePath, "utf8")) as Array<Record<string, unknown>>;
  };

  const courses = readRows(coursesPath);
  const lessons = readRows(lessonsPath);

  const report = validateContentPolicies(courses, lessons);
  console.log(`Policy check: ${report.errorCount} errors, ${report.warningCount} warnings`);

  for (const issue of report.issues.slice(0, 120)) {
    printIssue(issue);
  }
  if (report.issues.length > 120) {
    console.log(`... ${report.issues.length - 120} more issues not shown`);
  }

  if (report.errorCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Policy check failed:", error);
  process.exit(1);
});
