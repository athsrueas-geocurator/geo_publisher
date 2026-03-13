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

  if (mode === "check") {
    if (currentHash === nextHash) {
      console.log("Schema is up to date.");
      return;
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
