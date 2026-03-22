import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  DEFAULT_GEO_API_ENDPOINT,
  geoGraphqlRequest,
  resolveGeoApiEndpoint,
} from "./src/geo-api-client";

type Mode = "check" | "write";

const INTROSPECTION_QUERY = `
  query IntrospectionSnapshot {
    __schema {
      queryType { name }
      types {
        kind
        name
        description
        fields(includeDeprecated: true) {
          name
          description
          args {
            name
            description
            defaultValue
            type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

type SchemaSnapshot = {
  __schema: {
    queryType: { name: string };
    types: Array<SchemaType>;
  };
};

type SchemaTypeRef = {
  kind: string;
  name: string | null;
  ofType?: SchemaTypeRef | null;
};

type SchemaArgument = {
  name: string;
  description: string | null;
  defaultValue: string | null;
  type: SchemaTypeRef;
};

type SchemaField = {
  name: string;
  description: string | null;
  args?: SchemaArgument[] | null;
};

type SchemaType = {
  kind: string;
  name: string | null;
  description: string | null;
  fields?: SchemaField[] | null;
};

function parseMode(argv: string[]): Mode {
  if (argv.includes("--write")) return "write";
  return "check";
}

function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function fetchSchema(endpoint?: string): Promise<SchemaSnapshot> {
  return geoGraphqlRequest<SchemaSnapshot>(INTROSPECTION_QUERY, {
    operationName: "IntrospectionSnapshot",
    endpoint,
  });
}

function normalizeSchema(schema: SchemaSnapshot): SchemaSnapshot {
  const normalizedTypes = [...schema.__schema.types]
    .map((typeEntry) => {
      const normalizedFields = typeEntry.fields
        ? [...typeEntry.fields]
            .map((field) => ({
              ...field,
              args: field.args
                ? [...field.args].sort((a, b) => a.name.localeCompare(b.name))
                : field.args,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : typeEntry.fields;
      return {
        ...typeEntry,
        fields: normalizedFields,
      };
    })
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

  return {
    __schema: {
      ...schema.__schema,
      types: normalizedTypes,
    },
  };
}

const ONTOLOGY_DRIFT_LOG = path.resolve("ontology-drift.log");
const CLOSE_MATCH_SIMILARITY_THRESHOLD = 0.95;

type OntologyLogType = "drift" | "close-match";

type OntologyLogEntry = {
  type: OntologyLogType;
  endpoint: string;
  schemaPath: string;
  previousHash: string | null;
  nextHash: string;
  similarity?: number;
  addedTypes?: number;
  removedTypes?: number;
  changedTypes?: number;
  details?: string;
};

type SchemaDiff = {
  similarity: number;
  added: string[];
  removed: string[];
  changed: string[];
  details: string;
};

function logOntologyEvent(entry: OntologyLogEntry): void {
  const timestamp = new Date().toISOString();
  const fields = [
    `timestamp=${timestamp}`,
    `type=${entry.type}`,
    `endpoint=${entry.endpoint}`,
    `schema=${entry.schemaPath}`,
    `previous=${entry.previousHash ?? "<none>"}`,
    `next=${entry.nextHash}`,
  ];
  if (typeof entry.similarity === "number") {
    fields.push(`similarity=${entry.similarity.toFixed(3)}`);
  }
  if (typeof entry.addedTypes === "number") {
    fields.push(`added=${entry.addedTypes}`);
  }
  if (typeof entry.removedTypes === "number") {
    fields.push(`removed=${entry.removedTypes}`);
  }
  if (typeof entry.changedTypes === "number") {
    fields.push(`changed=${entry.changedTypes}`);
  }
  if (entry.details) {
    fields.push(`details=${entry.details}`);
  }
  fs.appendFileSync(ONTOLOGY_DRIFT_LOG, `${fields.join(" | ")}\n`, "utf8");
}

function getTypeNames(schema: SchemaSnapshot): string[] {
  return schema.__schema.types
    .map((typeEntry) => typeEntry.name)
    .filter((name): name is string => typeof name === "string");
}

function fieldsEqual(a: SchemaField[] | null | undefined, b: SchemaField[] | null | undefined): boolean {
  const aNames = (a ?? []).map((field) => field.name);
  const bNames = (b ?? []).map((field) => field.name);
  if (aNames.length !== bNames.length) return false;
  return aNames.every((name, index) => name === bNames[index]);
}

function describeSchemaDiff(previous: SchemaSnapshot | null, next: SchemaSnapshot): SchemaDiff {
  const previousNames = previous ? getTypeNames(previous) : [];
  const nextNames = getTypeNames(next);
  const previousSet = new Set(previousNames);
  const intersection = nextNames.filter((name) => previousSet.has(name));
  const union = new Set([...previousNames, ...nextNames]);
  const similarity = union.size === 0 ? 1 : intersection.length / union.size;

  const added = nextNames.filter((name) => !previousSet.has(name));
  const removed = previousNames.filter((name) => !nextNames.includes(name));

  const changed = intersection.filter((name) => {
    const prevType = previous?.__schema.types.find((typeEntry) => typeEntry.name === name);
    const nextType = next.__schema.types.find((typeEntry) => typeEntry.name === name);
    if (!prevType || !nextType) return false;
    return !fieldsEqual(prevType.fields, nextType.fields);
  });

  const summarize = (list: string[]): string => {
    if (list.length === 0) return "none";
    const sample = list.slice(0, 5).join(", ");
    const suffix = list.length > 5 ? ", ..." : "";
    return `${list.length} (${sample}${suffix})`;
  };

  const details = `added=${summarize(added)}; removed=${summarize(removed)}; changed=${summarize(changed)}`;

  return { similarity, added, removed, changed, details };
}
function readFileIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const endpoint = resolveGeoApiEndpoint();
  const schemaPath = path.resolve("GEO_API_SCHEMA.json");

  console.log(`Schema endpoint: ${endpoint}`);
  console.log(`Schema file: ${schemaPath}`);
  console.log(`Mode: ${mode}`);

  const schema = normalizeSchema(await fetchSchema(endpoint));
  const nextContent = JSON.stringify(schema, null, 2);
  const nextHash = sha(nextContent);
  const currentContent = readFileIfExists(schemaPath);
  const currentHash = currentContent ? sha(currentContent) : null;
  const currentSchema = currentContent ? (JSON.parse(currentContent) as SchemaSnapshot) : null;

  if (mode === "check") {
    if (currentHash === nextHash) {
      console.log("Schema is up to date.");
      return;
    }
    const diff = describeSchemaDiff(currentSchema, schema);
    logOntologyEvent({
      type: "drift",
      endpoint,
      schemaPath,
      previousHash: currentHash,
      nextHash,
      similarity: diff.similarity,
      addedTypes: diff.added.length,
      removedTypes: diff.removed.length,
      changedTypes: diff.changed.length,
      details: diff.details,
    });
    if (currentHash && diff.similarity >= CLOSE_MATCH_SIMILARITY_THRESHOLD) {
      logOntologyEvent({
        type: "close-match",
        endpoint,
        schemaPath,
        previousHash: currentHash,
        nextHash,
        similarity: diff.similarity,
        addedTypes: diff.added.length,
        removedTypes: diff.removed.length,
        changedTypes: diff.changed.length,
        details: diff.details,
      });
    }
    console.error("Schema drift detected. Run: bun run api:schema:refresh");
    process.exit(1);
  }

  fs.writeFileSync(schemaPath, nextContent, "utf8");
  if (currentHash === nextHash) {
    console.log("Schema unchanged. File refreshed with normalized formatting.");
  } else {
    console.log("Schema updated from live endpoint.");
  }
}

main().catch((error) => {
  console.error("Schema sync failed:", error);
  process.exit(1);
});
