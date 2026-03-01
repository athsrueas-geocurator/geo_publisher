import fs from "node:fs";
import path from "node:path";
import { gql } from "../src/functions";
import { ROOT_SPACE_ID, TYPES } from "../src/constants";

type ParsedArgs = {
  targetSpace: string;
  schemaSpace: string;
  types: string[];
  depth: number;
  fuzzy: boolean;
  output?: string;
};

type ValueEntry = {
  propertyId: string;
  propertyName: string | null;
  valueKind: string;
  example: string | number | boolean | null;
};

type RelationEntry = {
  id: string;
  typeId: string;
  typeName: string | null;
  toEntityId: string;
  toEntityName: string | null;
  toEntityTypeIds: string[];
  position: string | null;
};

type EntityReport = {
  id: string;
  name: string;
  description: string | null;
  typeIds: string[];
  spaces: string[];
  values: ValueEntry[];
  relations: RelationEntry[];
  depth: number;
  discoveredBy: string;
};

type TemplateType = {
  requestedName: string;
  entityId: string;
  typeIds: string[];
  description: string | null;
  spaces: string[];
  properties: Array<{ name: string; propertyId: string; valueKind: string; example: string | number | boolean | null }>;
  relations: Array<{ name: string; relationId: string; targetTypeIds: string[] }>;
};

const OUTPUT_DIR = path.join("experimental-scripts", "crawl-output");
const DEFAULT_DEPTH = 1;

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const result: ParsedArgs = {
    targetSpace: "",
    schemaSpace: ROOT_SPACE_ID,
    types: [],
    depth: DEFAULT_DEPTH,
    fuzzy: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);

    if (key === "fuzzy") {
      result.fuzzy = true;
      continue;
    }

    const value = args[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    i++;

    switch (key) {
      case "spaceId":
      case "targetSpace":
        result.targetSpace = value;
        break;
      case "schemaSpace":
        result.schemaSpace = value;
        break;
      case "types":
        result.types = value.split(",").map((t) => t.trim()).filter(Boolean);
        break;
      case "depth":
        result.depth = Math.max(1, parseInt(value, 10));
        break;
      case "output":
        result.output = value;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!result.targetSpace) throw new Error("--spaceId or --targetSpace is required");
  if (result.types.length === 0) throw new Error("--types is required");
  return result;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function quote(value: string): string {
  return JSON.stringify(value);
}

async function fetchEntitiesByName(spaceId: string, name: string) {
  const query = `{
    entities(
      spaceId: ${quote(spaceId)}
      typeId: ${quote(TYPES.type)}
      first: 20
      filter: { name: { is: ${quote(name)} } }
    ) {
      id
      name
      description
      typeIds
      spacesIn { id }
    }
  }`;
  const response = await gql(query);
  return response.entities ?? [];
}

async function fetchTypeSamples(spaceId: string, limit = 200) {
  const query = `{
    entities(
      spaceId: ${quote(spaceId)}
      typeId: ${quote(TYPES.type)}
      first: ${limit}
      filter: { name: { isNot: null } }
    ) {
      id
      name
    }
  }`;
  const response = await gql(query);
  return response.entities ?? [];
}

async function fetchEntityDetails(entityId: string) {
  const query = `{
    entity(id: ${quote(entityId)}) {
      id
      name
      description
      typeIds
      spacesIn { id }
    }
  }`;
  const response = await gql(query);
  return response.entity;
}

async function fetchEntitiesByType(spaceId: string, typeId: string, limit = 200) {
  const query = `{
    entities(
      spaceId: ${quote(spaceId)}
      typeId: ${quote(typeId)}
      first: ${limit}
      filter: { name: { isNot: null } }
    ) {
      id
      name
      description
      typeIds
      spacesIn { id }
    }
  }`;
  const response = await gql(query);
  return response.entities ?? [];
}

async function fetchRelations(entityId: string) {
  const query = `{
    relations(
      filter: { fromEntityId: { is: ${quote(entityId)} } }
      first: 200
    ) {
      id
      typeId
      position
      toEntityId
      toEntity {
        id
        name
        typeIds
        spacesIn { id }
      }
      typeEntity { id name }
    }
  }`;
  const response = await gql(query);
  return response.relations ?? [];
}

async function fetchValues(entityId: string) {
  const query = `{
    values(
      filter: { entityId: { is: ${quote(entityId)} } }
    ) {
      id
      propertyId
      propertyEntity { id name }
      text
      integer
      float
      boolean
      date
      datetime
    }
  }`;
  const response = await gql(query);
  return response.values ?? [];
}

function describeValue(value: any): { kind: string; sample: string | number | boolean | null } {
  if (value.text != null) return { kind: "text", sample: value.text };
  if (value.integer != null) return { kind: "integer", sample: value.integer };
  if (value.float != null) return { kind: "float", sample: value.float };
  if (value.boolean != null) return { kind: "boolean", sample: value.boolean };
  if (value.date != null) return { kind: "date", sample: value.date };
  if (value.datetime != null) return { kind: "datetime", sample: value.datetime };
  return { kind: "unknown", sample: null };
}

async function buildEntityReport(id: string, depth: number, discoveredBy: string): Promise<EntityReport> {
  const [entity, relations, values] = await Promise.all([
    fetchEntityDetails(id),
    fetchRelations(id),
    fetchValues(id),
  ]);

  const formattedValues: ValueEntry[] = values.map((value: any) => {
    const descriptor = describeValue(value);
    return {
      propertyId: value.propertyId,
      propertyName: value.propertyEntity?.name ?? null,
      valueKind: descriptor.kind,
      example: descriptor.sample,
    };
  });

  const formattedRelations: RelationEntry[] = relations.map((relation: any) => ({
    id: relation.id,
    typeId: relation.typeId,
    typeName: relation.typeEntity?.name ?? null,
    toEntityId: relation.toEntityId,
    toEntityName: relation.toEntity?.name ?? null,
    toEntityTypeIds: relation.toEntity?.typeIds ?? [],
    position: relation.position ?? null,
  }));

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description ?? null,
    typeIds: entity.typeIds ?? [],
    spaces: (entity.spacesIn ?? []).map((space: any) => space.id),
    values: formattedValues,
    relations: formattedRelations,
    depth,
    discoveredBy,
  };
}

function numericId(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "_").replace(/_{2,}/g, "_");
}

async function run() {
  const args = parseArgs();
  ensureDir(OUTPUT_DIR);

  const schemaSpace = args.schemaSpace;
  const targetSpace = args.targetSpace;
  const reportPath = args.output
    ? path.resolve(args.output)
    : path.join(
        OUTPUT_DIR,
        `${targetSpace}-${Date.now()}.json`
      );

  console.log(`Crawling schema space ${schemaSpace} for types: ${args.types.join(", ")}`);
  if (targetSpace !== schemaSpace) {
    console.log(`Looking for instances in target space ${targetSpace}`);
  }
  if (args.depth > 1) {
    console.log(`Depth set to ${args.depth}`);
  }

  const queue: Array<{ id: string; depth: number; origin: string }> = [];
  const visited = new Set<string>();
  const entityReports = new Map<string, EntityReport>();
  const linkedEntities = new Map<string, RelationEntry>();
  const rootEntities: Array<{ name: string; id: string }> = [];
  const fuzzyMatches: Array<{ requested: string; suggestions: Array<{ id: string; name: string }> }> = [];

  for (const requestedType of args.types) {
    const entities = await fetchEntitiesByName(schemaSpace, requestedType);
    if (entities.length === 0) {
      if (args.fuzzy) {
        const samples = await fetchTypeSamples(schemaSpace);
        const suggestions = samples
          .map((entry: any) => ({ id: entry.id, name: entry.name }))
          .filter((entry: any) => entry.name && normalizeName(entry.name).includes(normalizeName(requestedType)))
          .slice(0, 5);
        fuzzyMatches.push({ requested: requestedType, suggestions });
      }
      console.warn(`No exact match for type "${requestedType}" in space ${schemaSpace}`);
      continue;
    }

    const entity = entities[0];
    queue.push({ id: entity.id, depth: 0, origin: requestedType });
    rootEntities.push({ name: requestedType, id: entity.id });
    console.log(`  Found type "${requestedType}" → ${entity.id}`);

    const targetEntities = await fetchEntitiesByType(targetSpace, entity.id);
    if (targetEntities.length > 0) {
      console.log(`    Found ${targetEntities.length} instances in ${targetSpace}`);
      for (const targetEntity of targetEntities) {
        if (!visited.has(targetEntity.id)) {
          queue.push({ id: targetEntity.id, depth: 0, origin: requestedType });
        }
      }
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;

    visited.add(current.id);
    const report = await buildEntityReport(current.id, current.depth, current.origin);
    entityReports.set(current.id, report);

    for (const relation of report.relations) {
      if (relation.toEntityId) {
        linkedEntities.set(relation.toEntityId, relation);
        if (current.depth + 1 <= args.depth && !visited.has(relation.toEntityId)) {
          queue.push({ id: relation.toEntityId, depth: current.depth + 1, origin: current.origin });
        }
      }
    }
  }

  const templateTypes: TemplateType[] = rootEntities
    .map((root) => {
      const report = entityReports.get(root.id);
      if (!report) return null;
      const uniqueRelations = Array.from(
        new Map(report.relations.map((rel) => [rel.typeId, rel])).values()
      );
      return {
        requestedName: root.name,
        entityId: report.id,
        typeIds: report.typeIds,
        description: report.description,
        spaces: report.spaces,
        properties: report.values.map((value) => ({
          name: value.propertyName ?? value.propertyId,
          propertyId: value.propertyId,
          valueKind: value.valueKind,
          example: value.example,
        })),
        relations: uniqueRelations.map((relation) => ({
          name: relation.typeName ?? relation.typeId,
          relationId: relation.typeId,
          targetTypeIds: relation.toEntityTypeIds,
        })),
      };
    })
    .filter((value): value is TemplateType => value !== null);

  const report = {
    generatedAt: new Date().toISOString(),
    depth: args.depth,
    requestedTypes: args.types,
    visitedCount: entityReports.size,
    types: Array.from(entityReports.values()).map((entry) => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      typeIds: entry.typeIds,
      spaces: entry.spaces,
      depth: entry.depth,
      discoveredBy: entry.discoveredBy,
      properties: entry.values,
      relations: entry.relations,
    })),
    schemaSpace,
    targetSpace,
    mappingTemplate: {
      types: templateTypes,
    },
    linkedEntities: Array.from(linkedEntities.values()).map((relation) => ({
      id: relation.toEntityId,
      name: relation.toEntityName,
      typeIds: relation.toEntityTypeIds,
    })),
    fuzzyMatches,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${reportPath}`);
  console.log("\nSuggested constants snippet:");
  console.log("export const CRAWLED_TYPES = {");
  for (const typeInfo of templateTypes) {
    console.log(`  ${numericId(typeInfo.requestedName)}: "${typeInfo.entityId}"`);
  }
  console.log("};");
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

run().catch((error) => {
  console.error("Error during crawl:", error);
  process.exit(1);
});
