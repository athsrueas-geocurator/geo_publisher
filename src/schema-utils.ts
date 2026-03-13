import schemaJson from "../GEO_API_SCHEMA.json";

type SchemaTypeRef = {
  kind: string;
  name: string | null;
  ofType: SchemaTypeRef | null;
};

type SchemaArgument = {
  name: string;
  description: string | null;
  type: SchemaTypeRef;
  defaultValue: string | null;
};

type SchemaField = {
  name: string;
  description: string | null;
  args: SchemaArgument[];
};

type SchemaType = {
  name: string;
  description: string | null;
  fields?: SchemaField[] | null;
};

type GeoApiSchema = {
  __schema: {
    queryType: { name: string };
    types: SchemaType[];
  };
};

const geoSchema = schemaJson as GeoApiSchema;

const queryType = geoSchema.__schema.types.find((type) => type.name === "Query");
if (!queryType || !queryType.fields) {
  throw new Error("Unable to locate Query type in GEO API schema");
}

const queryFields: SchemaField[] = queryType.fields;

export type { SchemaField, SchemaArgument };

export function getQueryField(fieldName: string): SchemaField | undefined {
  return queryFields.find((field) => field.name === fieldName);
}

export function getQueryFieldNames(): string[] {
  return queryFields.map((field) => field.name);
}

export function ensureQueryFields(fieldNames: string[]): void {
  const missing = fieldNames.filter((name) => !getQueryField(name));
  if (missing.length > 0) {
    throw new Error(`GEO API schema is missing query fields: ${missing.join(", ")}`);
  }
}

export function assertFieldHasArgs(fieldName: string, expectedArgs: string[]): void {
  const field = getQueryField(fieldName);
  if (!field) {
    throw new Error(`Query field ${fieldName} not found`);
  }
  const availableArgs = field.args.map((arg) => arg.name);
  const missing = expectedArgs.filter((arg) => !availableArgs.includes(arg));
  if (missing.length > 0) {
    throw new Error(
      `Query field ${fieldName} is missing args: ${missing.join(", ")}. ` +
        `Available args: ${availableArgs.join(", ")}`,
    );
  }
}

export function queryFieldSummary(limit = 10) {
  return queryFields.slice(0, limit).map((field) => ({
    name: field.name,
    description: field.description,
    argCount: field.args.length,
  }));
}

export function totalQueryFieldCount(): number {
  return queryFields.length;
}
