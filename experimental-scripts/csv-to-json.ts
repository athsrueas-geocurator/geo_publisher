import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

type ColumnConfig = {
  field: string;
  array?: boolean;
  delimiter?: string;
  required?: boolean;
  skip?: boolean;
  transform?: "trim" | "lowercase" | "uppercase";
};

type FileConfig = {
  filename: string;
  typeName: string;
  output?: string;
  columns: Record<string, ColumnConfig>;
};

type MappingConfig = {
  files: FileConfig[];
};

type ParsedArgs = {
  inputDir: string;
  outputDir: string;
  mappingFile: string;
};

function parseArgs(): ParsedArgs {
  const cwd = process.cwd();
  const args = process.argv.slice(2);
  const result: ParsedArgs = {
    inputDir: path.join(cwd, "data_to_publish"),
    outputDir: path.join(cwd, "data_to_publish", "generated"),
    mappingFile: "",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = args[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    i++;
    switch (key) {
      case "inputDir":
        result.inputDir = path.resolve(value);
        break;
      case "outputDir":
        result.outputDir = path.resolve(value);
        break;
      case "mapping":
      case "mappingFile":
        result.mappingFile = path.resolve(value);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!result.mappingFile) throw new Error("--mapping <path> is required");
  return result;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadMapping(filePath: string): MappingConfig {
  const contents = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(contents) as MappingConfig;
  if (!Array.isArray(parsed.files)) {
    throw new Error("Mapping file must export a files array");
  }
  return parsed;
}

function parseCsv(filePath: string) {
  const contents = fs.readFileSync(filePath, "utf-8");
  return parse<Record<string, string>>(contents, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  });
}

function applyTransform(value: string, transform?: ColumnConfig["transform"]) {
  if (value == null) return value;
  let result = value.trim();
  if (transform === "lowercase") {
    result = result.toLowerCase();
  }
  if (transform === "uppercase") {
    result = result.toUpperCase();
  }
  return result;
}

function coerceValue(raw: string, config: ColumnConfig) {
  const trimmed = applyTransform(raw, config.transform);
  if (config.array) {
    const delimiter = config.delimiter ?? ";";
    return trimmed
      .split(delimiter)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (trimmed === "") return null;
  return trimmed;
}

function buildRecord(row: Record<string, string>, config: FileConfig) {
  const record: Record<string, any> = {};
  for (const [columnName, columnConfig] of Object.entries(config.columns)) {
    if (columnConfig.skip) continue;
    const rawValue = row[columnName];
    if (rawValue == null || rawValue === "") {
      if (columnConfig.required) {
        console.warn(
          `  Missing required column '${columnName}' for type '${config.typeName}'`,
        );
      }
      continue;
    }
    const value = coerceValue(rawValue, columnConfig);
    if (value == null || (Array.isArray(value) && value.length === 0)) continue;
    record[columnConfig.field] = value;
  }
  return record;
}

function deriveOutputPath(outputDir: string, config: FileConfig) {
  const outputName = config.output
    ? config.output
    : `${path.basename(config.filename, path.extname(config.filename))}.json`;
  return path.join(outputDir, outputName);
}

function run() {
  const args = parseArgs();
  ensureDir(args.outputDir);
  const mapping = loadMapping(args.mappingFile);

  for (const fileConfig of mapping.files) {
    const inputPath = path.join(args.inputDir, fileConfig.filename);
    if (!fs.existsSync(inputPath)) {
      console.warn(`Skipping missing file: ${inputPath}`);
      continue;
    }

    console.log(`Processing ${fileConfig.filename} → ${fileConfig.typeName}`);
    const rows = parseCsv(inputPath);
    if (rows.length === 0) {
      console.log("  No rows found — skipping");
      continue;
    }
    const records = rows.map((row: Record<string, string>) => buildRecord(row, fileConfig));
    const outputPath = deriveOutputPath(args.outputDir, fileConfig);
    fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
    console.log(`  Wrote ${records.length} records to ${outputPath}`);
  }
}

run();
