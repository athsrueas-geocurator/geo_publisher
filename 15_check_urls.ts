import dotenv from "dotenv";
import { checkCsvWebUrls, defaultCsvFilesForChecks } from "./src/prepublish-checks";

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
  const report = await checkCsvWebUrls(files);

  console.log(`URL check files: ${files.length}`);
  console.log(`URLs checked: ${report.checkedCount}`);
  console.log(`Restricted (401/403/429): ${report.restrictedCount}`);
  console.log(`Failures: ${report.failureCount}`);

  for (const restricted of report.restricted.slice(0, 25)) {
    console.log(
      `- [restricted] ${restricted.filePath}:${restricted.rowNumber} ${restricted.entityName} -> ${restricted.url} (${restricted.error})`,
    );
  }

  for (const failure of report.failures.slice(0, 50)) {
    console.log(
      `- ${failure.filePath}:${failure.rowNumber} ${failure.entityName} -> ${failure.url} (${failure.error})`,
    );
  }
  if (report.failures.length > 50) {
    console.log(`... ${report.failures.length - 50} more failures`);
  }

  if (report.failureCount > 0 && !hasFlag("--allow-broken")) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("URL check failed:", error);
  process.exit(1);
});
