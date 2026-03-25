import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { Graph, type Op, type TypedValue, type PropertyValueParam } from "@geoprotocol/geo-sdk";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { fetchSpaceIdsWithType, gql, printOps, publishOps } from "./src/functions";
import {
  DEFAULT_MAPPING_FILE,
  type MappingDecision,
  type MappingDecisionFile,
  type RelationRule,
  normalizeFieldKey,
  readDecisionFile,
} from "./src/mapping-decisions";
import {
  fetchTypeSchema,
  fingerprintTypeSchema,
} from "./src/type-schema-live";
import { TYPES, PROPERTIES, VIEWS, QUERY_DATA_SOURCE } from "./src/constants";
import { validateContentPolicies } from "./src/content-policy";
import {
  checkCsvWebUrls,
  checkTaxonomyOverlap,
  DEFAULT_CANONICAL_AI_SPACE_ID,
} from "./src/prepublish-checks";

dotenv.config();

type CourseRow = Record<string, unknown>;
type LessonRow = Record<string, unknown>;

type EntityIndexNode = {
  id: string;
  name?: string | null;
  typeIds?: string[] | null;
  spaceIds?: string[] | null;
};

type EntityIndexResult = {
  entitiesConnection?: {
    nodes: EntityIndexNode[];
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string | null;
    };
  };
};

type EntityIndexStats = {
  queries: number;
  nodes: number;
};

type EntityConnectionPageInfo = {
  hasNextPage: boolean;
  endCursor?: string | null;
};

type EntitiesListResult = {
  entities: Array<{ id: string; name?: string; typeIds?: string[] }>;
};

type IndexedEntity = {
  id: string;
  name: string;
  typeIds: string[];
  spaceIds: string[];
};

type DedupeProposedRecord = {
  entityName: string;
  entityTypeId: string | null;
  sourceKind: string;
  sourceRef: string;
};

type DedupeExistingRecord = {
  id: string;
  name: string;
  typeId: string | null;
};

type DedupeMatch = {
  sourceKind?: string;
  sourceRef?: string;
  proposedName: string;
  proposedTypeId?: string | null;
  bestMatch: {
    id: string;
    name: string;
    typeId?: string | null;
  };
  score: number;
};

type DedupeReport = {
  summary: {
    proposedCount: number;
    existingCount: number;
    highThreshold: number;
    mediumThreshold: number;
    highMatchCount: number;
    mediumMatchCount: number;
  };
  highMatches: DedupeMatch[];
  mediumMatches: DedupeMatch[];
};

type PendingCourseLessonLinks = {
  courseEntityId: string;
  courseName: string;
  relationTypeId: string;
  relationRule?: RelationRule;
  lessonTokens: string[];
};

type CourseLessonBlockPlan = {
  lessonIds: Set<string>;
  courseName: string;
};

type BlockRelationFetch = {
  relations: Array<{
    id: string;
    fromEntityId: string;
    toEntity?: { id?: string } | null;
  }>;
};

const TAXONOMY_DIR = path.join("data_to_publish", "taxonomy");
const TAXONOMY_TARGET_TYPE_IDS = new Set<string>([
  TYPES.goal,
  TYPES.skill,
  TYPES.topic,
  TYPES.tag,
  TYPES.role,
  TYPES.project,
]);
const GEO_ROOT_SPACE_ID = "a19c345ab9866679b001d7d2138d88a1";
const ADDITIONAL_TAXONOMY_FIELD_KEYS = new Set<string>(["providers"]);

const LESSON_BLOCK_COLUMNS = [
  PROPERTIES.lesson_number,
  PROPERTIES.description,
  PROPERTIES.web_url,
  PROPERTIES.topics,
];

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function normalizeFieldName(value: string): string {
  return normalizeFieldKey(value).replace(/[^a-z0-9]/g, "");
}

function normalizeFieldVariants(value: string): string[] {
  const base = normalizeFieldName(value);
  const variants = new Set<string>([base]);
  if (base.endsWith("s") && base.length > 3) {
    variants.add(base.slice(0, -1));
  }
  return [...variants];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

type TaxonomyEntry = {
  name: string;
  description?: string;
};

function normalizeTaxonomyKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’'`]+/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function listTaxonomyFiles(dir = TAXONOMY_DIR): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(dir)) return map;
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.toLowerCase().endsWith(".csv")) continue;
    const key = normalizeTaxonomyKey(path.parse(entry).name);
    map.set(key, path.join(dir, entry));
  }
  return map;
}

function loadTaxonomyEntries(filePath: string): Map<string, TaxonomyEntry> {
  const entries = new Map<string, TaxonomyEntry>();
  const rows = readRows(filePath);
  for (const row of rows) {
    const name = String(row["Name"] ?? row["name"] ?? "").trim();
    if (!name) continue;
    const description = String(row["Description"] ?? row["description"] ?? "").trim();
    const key = normalizeTaxonomyKey(name);
    if (!entries.has(key)) {
      entries.set(key, { name, description: description || undefined });
    }
  }
  return entries;
}

type TaxonomyLookupResult = {
  lookup: Map<string, Map<string, TaxonomyEntry>>;
  missing: string[];
};

function buildTaxonomyLookup(fieldNames: Set<string>, fileMap: Map<string, string>): TaxonomyLookupResult {
  const lookup = new Map<string, Map<string, TaxonomyEntry>>();
  const missing: string[] = [];
  for (const field of fieldNames) {
    const key = normalizeTaxonomyKey(field);
    const filePath = fileMap.get(key);
    if (!filePath) {
      missing.push(field);
      continue;
    }
    lookup.set(key, loadTaxonomyEntries(filePath));
  }
  return { lookup, missing };
}

function shouldLoadTaxonomyForDecision(decision: MappingDecision): boolean {
  const normalizedField = normalizeTaxonomyKey(decision.sourceField ?? "");
  if (decision.relation?.targetTypeId && TAXONOMY_TARGET_TYPE_IDS.has(decision.relation.targetTypeId)) {
    return true;
  }
  return ADDITIONAL_TAXONOMY_FIELD_KEYS.has(normalizedField);
}

function getFieldValue(row: Record<string, unknown>, sourceField: string): unknown {
  if (sourceField in row) return row[sourceField];
  const normalizedTargets = normalizeFieldVariants(sourceField);
  for (const [key, value] of Object.entries(row)) {
    const keyVariants = normalizeFieldVariants(key);
    if (keyVariants.some((variant) => normalizedTargets.includes(variant))) return value;
  }
  return undefined;
}

function splitRelationValues(value: unknown, rule?: RelationRule): string[] {
  const delimiter = rule?.normalization.delimiter ?? ";";
  const trim = rule?.normalization.trim ?? true;
  const lowercase = rule?.normalization.lowercase ?? false;
  const dedupe = rule?.normalization.dedupe ?? true;

  const normalizeOne = (raw: string) => {
    let next = raw;
    if (trim) next = next.trim();
    if (lowercase) next = next.toLowerCase();
    return next;
  };

  let tokens: string[] = [];
  if (Array.isArray(value)) {
    tokens = value.map((v) => normalizeOne(String(v))).filter(Boolean);
  }
  if (typeof value === "string") {
    tokens = value
      .split(delimiter)
      .map((v) => normalizeOne(v))
      .filter(Boolean);
  }
  if (dedupe) {
    return [...new Set(tokens)];
  }
  return tokens;
}

function inferTypedValue(sourceValue: unknown): {
  type: "text" | "number" | "checkbox";
  value: string | number | boolean;
} {
  if (typeof sourceValue === "number") {
    return { type: "number", value: sourceValue };
  }

  if (typeof sourceValue === "boolean") {
    return { type: "checkbox", value: sourceValue };
  }

  const raw = String(sourceValue).trim();
  if (/^(true|false)$/i.test(raw)) {
    return { type: "checkbox", value: raw.toLowerCase() === "true" };
  }

  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return { type: "number", value: Number(raw) };
  }

  return { type: "text", value: raw };
}

function stripListOrdinalPrefix(value: string): string {
  return value.replace(/^\s*\d+\s*\.\s*/, "").trim();
}

function relationLookupKeys(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return [trimmed.toLowerCase(), slugify(trimmed)];
}

function indexPlannedEntity(index: Map<string, string[]>, name: string, id: string) {
  for (const key of relationLookupKeys(name)) {
    const next = index.get(key) ?? [];
    next.push(id);
    index.set(key, next);
  }
}

function resolvePlannedIdsByName(names: string[], index: Map<string, string[]>): string[] {
  const hits: string[] = [];
  for (const name of names) {
    for (const key of relationLookupKeys(name)) {
      const bucket = index.get(key);
      if (bucket && bucket.length > 0) {
        hits.push(...bucket);
      }
    }
  }
  return [...new Set(hits)];
}

function expandLessonLookupNames(raw: string, rule?: RelationRule): string[] {
  const mapped = resolveNameWithManualMap(raw, rule).trim();
  if (!mapped) return [];
  const stripped = stripListOrdinalPrefix(mapped);
  return [...new Set([mapped, stripped].filter(Boolean))];
}

async function fetchExistingBlockRelations(courseIds: string[], spaceId: string): Promise<BlockRelationFetch["relations"]> {
  if (courseIds.length === 0) return [];
  const result = await gql<BlockRelationFetch>(
    `query CourseBlockRelations($spaceId: UUID!, $courseIds: [UUID!]!, $relationType: UUID!, $first: Int!) {
      relations(
        filter: {
          fromEntityId: { in: $courseIds },
          spaceId: { is: $spaceId },
          typeId: { is: $relationType },
        }
        first: $first
      ) {
        id
        fromEntityId
        toEntity { id }
      }
    }`,
    {
      spaceId,
      courseIds,
      relationType: PROPERTIES.blocks,
      first: Math.max(1000, courseIds.length * 2),
    },
  );
  return result.relations;
}

async function ensureLessonBlocks(
  plans: Map<string, CourseLessonBlockPlan>,
  spaceId: string,
  ops: Op[],
  skipTableView: boolean,
) {
  if (plans.size === 0) return;

  const courseIds = [...plans.keys()];
  const existing = await fetchExistingBlockRelations(courseIds, spaceId);
  for (const relation of existing) {
    ops.push(...Graph.deleteRelation({ id: relation.id }).ops);
  }

  for (const [courseId, plan] of plans) {
    if (plan.lessonIds.size === 0) continue;
    const blockName = plan.courseName ? `${plan.courseName} lessons` : "Lessons";
    const blockFilter = JSON.stringify({
      spaceId: { in: [spaceId] },
      filter: {
        [PROPERTIES.types]: { is: TYPES.lesson },
        [PROPERTIES.courses]: { is: courseId },
      },
      orderBy: [{ propertyId: PROPERTIES.lesson_number, direction: "ASC" }],
    });

    const block = Graph.createEntity({
      name: blockName,
      types: [TYPES.data_block],
      values: [
        {
          property: PROPERTIES.filter,
          type: "text",
          value: blockFilter,
        },
        {
          property: PROPERTIES.name,
          type: "text",
          value: blockName,
        },
      ],
      relations: {
        [PROPERTIES.data_source_type]: { toEntity: QUERY_DATA_SOURCE },
      },
    });
    ops.push(...block.ops);

    const relationData: Record<string, Array<{ toEntity: string }>> = {};
    if (!skipTableView) {
      relationData[PROPERTIES.view] = [{ toEntity: VIEWS.table }];
      relationData[PROPERTIES.properties] = LESSON_BLOCK_COLUMNS.map((column) => ({ toEntity: column }));
    }

    const attach = Graph.createRelation({
      fromEntity: courseId,
      toEntity: block.id,
      type: PROPERTIES.blocks,
      ...(skipTableView ? {} : { entityRelations: relationData }),
    });
    ops.push(...attach.ops);
  }
}

function isAgentRuntime(): boolean {
  return process.env.AGENT === "1" || process.env.OPENCODE === "1";
}

function sanitizeMdCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

function appendRunlogRow(entry: {
  targetSpaceId: string;
  published: boolean;
  reason: string;
  dedupeHighMatches: number;
  txHash?: string;
}) {
  const runlogPath = path.resolve("runlog.md");
  if (!fs.existsSync(runlogPath)) {
    const header =
      "# Agent Publish Runlog\n\n" +
      "| timestamp | actor | target_space | publish_attempted | published | dedupe_high_matches | tx_hash | reason |\n" +
      "| --- | --- | --- | --- | --- | --- | --- | --- |\n";
    fs.writeFileSync(runlogPath, header, "utf8");
  }

  const row =
    `| ${new Date().toISOString()} | agent | ${sanitizeMdCell(entry.targetSpaceId)} | yes | ${
      entry.published ? "yes" : "no"
    } | ${entry.dedupeHighMatches} | ${sanitizeMdCell(entry.txHash ?? "") || "-"} | ${sanitizeMdCell(
      entry.reason,
    )} |\n`;
  fs.appendFileSync(runlogPath, row, "utf8");
}

function requireAccepted(entries: MappingDecision[], label: string): void {
  const pending = entries.filter((entry) => entry.status === "pending");
  if (pending.length > 0) {
    throw new Error(
      `${label} has pending mapping decisions (${pending
        .map((entry) => entry.sourceField)
        .join(", ")}). Resolve them with 08_review_mapping_decisions.ts first.`,
    );
  }
}

function requireFieldKind(
  entries: MappingDecision[],
  sourceField: string,
  kind: "value" | "relation" | Array<"value" | "relation">,
  label: string,
) {
  const entry = entries.find(
    (item) => normalizeFieldName(item.sourceField) === normalizeFieldName(sourceField),
  );
  if (!entry || entry.status !== "accepted" || !entry.accepted) {
    throw new Error(`${label}: '${sourceField}' must be accepted before publish.`);
  }
  const allowedKinds = Array.isArray(kind) ? kind : [kind];
  const kindLabel = Array.isArray(kind) ? kind.join(" or ") : kind;
  if (!allowedKinds.includes(entry.accepted.kind)) {
    throw new Error(
      `${label}: '${sourceField}' must map to ${kindLabel}, got ${entry.accepted.kind}. Adjust mapping decisions first.`,
    );
  }
}

function acceptedValueMappings(entries: MappingDecision[]) {
  return entries.filter((entry) => entry.status === "accepted" && entry.accepted?.kind === "value");
}

function acceptedRelationMappings(entries: MappingDecision[]) {
  return entries.filter((entry) => entry.status === "accepted" && entry.accepted?.kind === "relation");
}

function analyzeRelationTargetTypes(entries: MappingDecision[]) {
  const typeIds = new Set<string>();
  let requiresUntypedIndex = false;
  for (const entry of entries) {
    if (entry.relation?.targetTypeId) {
      typeIds.add(entry.relation.targetTypeId);
    } else {
      requiresUntypedIndex = true;
    }
  }
  return { typeIds, requiresUntypedIndex };
}

function hasField(entries: MappingDecision[], sourceField: string): boolean {
  return entries.some((entry) => normalizeFieldName(entry.sourceField) === normalizeFieldName(sourceField));
}

async function loadEntityNameIndex(
  spaceIds: string | string[],
  options?: { typeFilter?: Iterable<string | null | undefined>; includeAllEntities?: boolean },
): Promise<Map<string, IndexedEntity[]>> {
  const ids = (Array.isArray(spaceIds) ? spaceIds : [spaceIds]).filter((value): value is string => Boolean(value));
  if (!ids.length) return new Map();

  const typeIds = options?.typeFilter
    ? Array.from(new Set(Array.from(options.typeFilter).filter((value): value is string => Boolean(value))))
    : [];

  const stats: EntityIndexStats = { queries: 0, nodes: 0 };
  const start = Date.now();
  const requiresFullSpaceFetch = options?.includeAllEntities || typeIds.length === 0;
  const mode = requiresFullSpaceFetch ? "space" : "type";
  const index = requiresFullSpaceFetch
    ? await loadEntityNameIndexBySpace(ids, stats)
    : await loadEntityNameIndexByType(ids, typeIds, stats);
  const durationMs = Date.now() - start;
  console.log(
    `[entity-index] mode=${mode} spaces=${ids.length} types=${mode === "space" ? "ALL" : typeIds.length} nodes=${stats.nodes} queries=${stats.queries} duration=${durationMs}ms`,
  );
  return index;
}

async function loadEntityNameIndexBySpace(
  spaceIds: string[],
  stats: EntityIndexStats,
): Promise<Map<string, IndexedEntity[]>> {
  const index = new Map<string, IndexedEntity[]>();
  const pageSize = 1000;
  let cursor: string | null = null;
  while (true) {
    stats.queries++;
    const result: EntityIndexResult = await gql<EntityIndexResult>(
      `query EntityNameIndex($spaceIds: UUIDFilter, $first: Int!, $after: Cursor) {
        entitiesConnection(
          spaceIds: $spaceIds
          first: $first
          after: $after
          filter: { name: { isNot: null } }
        ) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            name
            typeIds
            spaceIds
          }
        }
      }`,
      {
        spaceIds: { in: spaceIds },
        first: pageSize,
        after: cursor,
      },
    );

    stats.nodes += ingestEntityIndexNodes(index, result.entitiesConnection?.nodes ?? []);

    const pageInfo: EntityConnectionPageInfo | undefined = result.entitiesConnection?.pageInfo;
    if (!pageInfo || !pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor ?? null;
    if (!cursor) break;
  }

  return index;
}

async function loadEntityNameIndexByType(
  spaceIds: string[],
  typeIds: string[],
  stats: EntityIndexStats,
): Promise<Map<string, IndexedEntity[]>> {
  const index = new Map<string, IndexedEntity[]>();
  const pageSize = 500;
  for (const spaceId of spaceIds) {
    for (const typeId of typeIds) {
      let cursor: string | null = null;
      while (true) {
        stats.queries++;
        const result: EntityIndexResult = await gql<EntityIndexResult>(
          `query EntityNameIndexByType($spaceId: UUID!, $typeId: UUID!, $first: Int!, $after: Cursor) {
            entitiesConnection(
              spaceId: $spaceId
              typeId: $typeId
              first: $first
              after: $after
              filter: { name: { isNot: null } }
            ) {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                id
                name
                typeIds
                spaceIds
              }
            }
          }`,
          {
            spaceId,
            typeId,
            first: pageSize,
            after: cursor,
          },
        );

        stats.nodes += ingestEntityIndexNodes(index, result.entitiesConnection?.nodes ?? []);

        const pageInfo: EntityConnectionPageInfo | undefined = result.entitiesConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        cursor = pageInfo.endCursor ?? null;
        if (!cursor) break;
      }
    }
  }

  return index;
}

function ingestEntityIndexNodes(index: Map<string, IndexedEntity[]>, nodes: EntityIndexNode[] = []) {
  let ingested = 0;
  for (const entity of nodes) {
    if (!entity?.name) continue;
    const normalizedName = entity.name.trim();
    if (!normalizedName) continue;
    const keys = [normalizedName.toLowerCase(), slugify(normalizedName)];
    const payload: IndexedEntity = {
      id: entity.id,
      name: normalizedName,
      typeIds: entity.typeIds ?? [],
      spaceIds: entity.spaceIds ?? [],
    };
    for (const key of keys) {
      const existing = index.get(key) ?? [];
      existing.push(payload);
      index.set(key, existing);
    }
    ingested++;
  }
  return ingested;
}

async function buildFallbackTypeIndexes(
  typeIds: Set<string>,
  canonicalSpaceId: string,
): Promise<Map<string, Map<string, IndexedEntity[]>>> {
  const started = Date.now();
  let lookupCalls = 0;
  let indexedTypes = 0;
  const spaceCounts: string[] = [];
  const fallback = new Map<string, Map<string, IndexedEntity[]>>();
  for (const typeId of typeIds) {
    if (!typeId) continue;
    const spaces = await fetchSpaceIdsWithType(typeId);
    lookupCalls++;
    const ids = new Set<string>([canonicalSpaceId]);
    for (const space of spaces) {
      if (space.id) ids.add(space.id);
    }
    const candidateIds = [...ids].filter(Boolean);
    if (!candidateIds.length) continue;
    fallback.set(
      typeId,
      await loadEntityNameIndex(candidateIds, { typeFilter: [typeId] }),
    );
    indexedTypes++;
    spaceCounts.push(`${typeId}:${candidateIds.length}`);
  }
  const durationMs = Date.now() - started;
  console.log(
    `[fallback-index] types=${indexedTypes}/${typeIds.size} spaceLookups=${lookupCalls} details=${spaceCounts.join(",")} duration=${durationMs}ms`,
  );
  return fallback;
}

async function verifyTargetSpaceReadable(spaceId: string): Promise<void> {
  await gql(
    `query VerifyTargetSpace($spaceId: UUID!) {
      space(id: $spaceId) {
        id
      }
    }`,
    { spaceId },
  );
}

function resolveIdsByName(
  names: string[],
  index: Map<string, IndexedEntity[]>,
  rule?: RelationRule,
  options?: { preferredSpaceIds?: string[] },
): string[] {
  const resolved: string[] = [];
  const targetTypeId = rule?.targetTypeId;
  const manualMap = rule?.manualMap ?? {};
  const preferred = options?.preferredSpaceIds ?? [];

  for (const name of names) {
    const mapped = manualMap[name] ?? manualMap[name.toLowerCase()] ?? name;
    const keys = [mapped.trim().toLowerCase(), slugify(mapped)];

    let hit: IndexedEntity | undefined;
    for (const key of keys) {
      const candidates = index.get(key) ?? [];
      if (!candidates.length) continue;
      hit = pickPreferredCandidate(candidates, targetTypeId, preferred);
      if (hit) break;
    }

    if (hit) {
      resolved.push(hit.id);
    }
  }
  return resolved;
}

function pickPreferredCandidate(
  candidates: IndexedEntity[],
  targetTypeId?: string,
  preferredSpaceIds: string[] = [],
): IndexedEntity | undefined {
  if (targetTypeId) {
    for (const spaceId of preferredSpaceIds) {
      const candidate = candidates.find(
        (entry) => entry.typeIds.includes(targetTypeId) && entry.spaceIds.includes(spaceId),
      );
      if (candidate) return candidate;
    }
    const typeMatch = candidates.find((entry) => entry.typeIds.includes(targetTypeId));
    if (typeMatch) return typeMatch;
  }

  for (const spaceId of preferredSpaceIds) {
    const candidate = candidates.find((entry) => entry.spaceIds.includes(spaceId));
    if (candidate) return candidate;
  }

  return candidates[0];
}

async function ensureSchemaMatches(filePath: string): Promise<void> {
  const mapping = readDecisionFile(filePath);

  const courseLive = await fetchTypeSchema(mapping.types.course.typeId, mapping.schemaSpaceId);
  const lessonLive = await fetchTypeSchema(mapping.types.lesson.typeId, mapping.schemaSpaceId);

  const courseFingerprint = fingerprintTypeSchema(courseLive);
  const lessonFingerprint = fingerprintTypeSchema(lessonLive);

  if (courseFingerprint !== mapping.types.course.schemaFingerprint) {
    throw new Error(
      `Course schema drift detected. Regenerate mappings with 07_generate_mapping_proposals.ts before publishing.`,
    );
  }
  if (lessonFingerprint !== mapping.types.lesson.schemaFingerprint) {
    throw new Error(
      `Lesson schema drift detected. Regenerate mappings with 07_generate_mapping_proposals.ts before publishing.`,
    );
  }
}

function readJsonArray(filePath: string): Record<string, unknown>[] {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>[];
}

function readRows(filePath: string): Record<string, unknown>[] {
  if (filePath.toLowerCase().endsWith(".csv")) {
    const csv = fs.readFileSync(filePath, "utf8");
    return parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, unknown>[];
  }
  return readJsonArray(filePath);
}

function setCourseKeys(index: Map<string, string>, row: Record<string, unknown>, generatedId: string) {
  const courseId = getFieldValue(row, "course_id");
  const id = courseId ? String(courseId).trim() : "";
  const name = String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "").trim();
  if (id) index.set(id.toLowerCase(), generatedId);
  if (name) {
    index.set(name.toLowerCase(), generatedId);
    index.set(slugify(name), generatedId);
  }
}

function findCourseLinks(values: string[], index: Map<string, string>): string[] {
  const links: string[] = [];
  for (const value of values) {
    const keys = [value.toLowerCase(), slugify(value)];
    const hit = keys.map((k) => index.get(k)).find(Boolean);
    if (hit) links.push(hit);
  }
  return [...new Set(links)];
}

function resolveNameWithManualMap(raw: string, rule?: RelationRule): string {
  if (!rule?.manualMap) return raw;
  return rule.manualMap[raw] ?? rule.manualMap[raw.toLowerCase()] ?? raw;
}

function resolveExistingTargets(
  names: string[],
  relation: RelationRule | undefined,
  relationIndex: Map<string, IndexedEntity[]>,
  rootIndex: Map<string, IndexedEntity[]>,
  typeFallbackIndex?: Map<string, IndexedEntity[]>,
  context?: { targetSpaceId?: string; canonicalSpaceId?: string },
): string[] {
  if (!relation) return [];
  const canonical = context?.canonicalSpaceId ?? GEO_ROOT_SPACE_ID;
  const indexes: Array<{ index: Map<string, IndexedEntity[]>; priority: string[] }> = [];
  if (relationIndex.size > 0) {
    indexes.push({ index: relationIndex, priority: context?.targetSpaceId ? [context.targetSpaceId] : [] });
  }
  if (rootIndex.size > 0) {
    indexes.push({ index: rootIndex, priority: [canonical] });
  }
  if (typeFallbackIndex) {
    indexes.push({ index: typeFallbackIndex, priority: [canonical] });
  }

  for (const entry of indexes) {
    const resolved = resolveIdsByName(names, entry.index, relation, {
      preferredSpaceIds: entry.priority,
    });
    if (resolved.length > 0) return resolved;
  }
  return [];
}

function collectProposedRecords(
  courseRows: CourseRow[],
  lessonRows: LessonRow[],
  mapping: MappingDecisionFile,
  relationIndex: Map<string, IndexedEntity[]>,
  rootIndex: Map<string, IndexedEntity[]>,
  typeFallbackIndexes: Map<string, Map<string, IndexedEntity[]>>,
): DedupeProposedRecord[] {
  const records: DedupeProposedRecord[] = [];

  for (const row of courseRows) {
    const name = String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "").trim();
    if (!name) continue;
    const sourceRef = String(getFieldValue(row, "course_id") ?? name);
    records.push({
      entityName: name,
      entityTypeId: mapping.types.course.typeId,
      sourceKind: "course",
      sourceRef,
    });
  }

  for (const row of lessonRows) {
    const name = String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "").trim();
    if (!name) continue;
    const sourceRef = String(getFieldValue(row, "lesson_id") ?? name);
    records.push({
      entityName: name,
      entityTypeId: mapping.types.lesson.typeId,
      sourceKind: "lesson",
      sourceRef,
    });
  }

  const includeCreateIfMissing = (
    rows: Array<Record<string, unknown>>,
    decisions: MappingDecision[],
    sourceKind: string,
  ) => {
    const relationMappings = decisions.filter(
      (entry) =>
        entry.status === "accepted" &&
        entry.accepted?.kind === "relation" &&
        entry.relation?.targetCreation === "create_if_missing",
    );

    for (const row of rows) {
      for (const decision of relationMappings) {
        const sourceValue = getFieldValue(row, decision.sourceField);
        const names = splitRelationValues(sourceValue, decision.relation).map((name) =>
          resolveNameWithManualMap(name, decision.relation),
        );
        const fallbackIndex = decision.relation?.targetTypeId
          ? typeFallbackIndexes.get(decision.relation.targetTypeId)
          : undefined;
        const existingTargetIds = resolveExistingTargets(
          names,
          decision.relation,
          relationIndex,
          rootIndex,
          fallbackIndex,
          {
            targetSpaceId: mapping.targetSpaceId,
            canonicalSpaceId: GEO_ROOT_SPACE_ID,
          },
        );
        if (existingTargetIds.length > 0) continue;
        for (const name of names) {
          records.push({
            entityName: name,
            entityTypeId: decision.relation?.targetTypeId ?? null,
            sourceKind,
            sourceRef: decision.sourceField,
          });
        }
      }
    }
  };

  includeCreateIfMissing(courseRows, mapping.types.course.fields, "course_relation_target");
  includeCreateIfMissing(lessonRows, mapping.types.lesson.fields, "lesson_relation_target");

  const deduped = new Map<string, DedupeProposedRecord>();
  for (const record of records) {
    const key = `${record.entityTypeId ?? ""}::${record.entityName.toLowerCase()}::${record.sourceKind}`;
    if (!deduped.has(key)) deduped.set(key, record);
  }
  return [...deduped.values()];
}

async function loadExistingRecords(spaceId: string): Promise<DedupeExistingRecord[]> {
  const { gql } = await import("./src/functions");
  const started = Date.now();
  const result = await gql<EntitiesListResult>(
    `query ExistingEntitiesForDedupe($spaceId: UUID!, $first: Int!) {
      entities(spaceId: $spaceId, first: $first, filter: { name: { isNot: null } }) {
        id
        name
        typeIds
      }
    }`,
    {
      spaceId,
      first: 1000,
    },
  );

  const records: DedupeExistingRecord[] = [];
  for (const entity of result.entities ?? []) {
    if (!entity.name) continue;
    const typeIds = entity.typeIds && entity.typeIds.length > 0 ? entity.typeIds : [null];
    for (const typeId of typeIds) {
      records.push({
        id: entity.id,
        name: entity.name,
        typeId,
      });
    }
  }
  console.log(
    `[dedupe-existing] space=${spaceId} fetched=${result.entities?.length ?? 0} expanded=${records.length} duration=${Date.now() - started}ms`,
  );
  return records;
}

function runPythonDedupeCheck(
  proposed: DedupeProposedRecord[],
  existing: DedupeExistingRecord[],
  thresholds: { high: number; medium: number } = { high: 0.99, medium: 0.92 },
): DedupeReport {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "geo-dedupe-"));
  const proposedPath = path.join(tempDir, "proposed.json");
  const existingPath = path.join(tempDir, "existing.json");
  const outPath = path.join(tempDir, "report.json");
  const scriptPath = path.resolve("data_to_publish/scripts/fuzzy_dedupe_check.py");

  fs.writeFileSync(proposedPath, `${JSON.stringify(proposed, null, 2)}\n`, "utf8");
  fs.writeFileSync(existingPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");

  const run = spawnSync(
    "python3",
    [
      scriptPath,
      "--proposed",
      proposedPath,
      "--existing",
      existingPath,
      "--out",
      outPath,
      "--high-threshold",
      String(thresholds.high),
      "--medium-threshold",
      String(thresholds.medium),
    ],
    { encoding: "utf8" },
  );

  if (run.status !== 0) {
    throw new Error(
      `Python dedupe check failed (code ${run.status}). stderr: ${(run.stderr || "").trim() || "(empty)"}`,
    );
  }

  return JSON.parse(fs.readFileSync(outPath, "utf8")) as DedupeReport;
}

function indexCreatedEntity(index: Map<string, IndexedEntity[]>, entity: IndexedEntity) {
  const keys = [entity.name.toLowerCase(), slugify(entity.name)];
  for (const key of keys) {
    const existingEntries = index.get(key) ?? [];
    existingEntries.push(entity);
    index.set(key, existingEntries);
  }
}

function createMissingTargetsIfAllowed(
  names: string[],
  rule: RelationRule | undefined,
  index: Map<string, IndexedEntity[]>,
  allOps: Op[],
  targetSpaceId: string,
  taxonomyEntries?: Map<string, TaxonomyEntry>,
): string[] {
  if (!rule || rule.targetCreation !== "create_if_missing") {
    return [];
  }

  const created: string[] = [];
  for (const rawName of names) {
    const resolvedName = resolveNameWithManualMap(rawName, rule);
    const existing = resolveIdsByName([resolvedName], index, rule);
    if (existing.length > 0) {
      created.push(...existing);
      continue;
    }

    const normalizedTargetName = normalizeTaxonomyKey(resolvedName);
    const descriptor = taxonomyEntries?.get(normalizedTargetName);
    const createInput: { name: string; types?: string[]; description?: string } = {
      name: resolvedName,
      description: descriptor?.description,
    };
    if (rule.targetTypeId) {
      createInput.types = [rule.targetTypeId];
    }

    const newEntity = Graph.createEntity(createInput);
    allOps.push(...newEntity.ops);
    indexCreatedEntity(index, {
      id: newEntity.id,
      name: resolvedName,
      typeIds: rule.targetTypeId ? [rule.targetTypeId] : [],
      spaceIds: [targetSpaceId],
    });
    created.push(newEntity.id);
  }

  return [...new Set(created)];
}

async function main() {
  const mappingFile = getArg("--mapping-file") ?? DEFAULT_MAPPING_FILE;
  const coursesJsonPath =
    getArg("--courses-json") ?? getArg("--courses-csv") ?? "data_to_publish/courses.csv";
  const lessonsJsonPath =
    getArg("--lessons-json") ?? getArg("--lessons-csv") ?? "data_to_publish/lessons.csv";
    const editName = getArg("--edit-name") ?? "Schema-mapped publish: courses and lessons";
    const shouldPublish = hasFlag("--publish");
    const explicitDryRun = hasFlag("--dry-run");
    const strictPolicyWarnings = hasFlag("--strict-policy-warnings");
  const allowPolicyErrors = hasFlag("--allow-policy-errors");
  const allowBrokenUrls = hasFlag("--allow-broken-urls");
  const allowTaxonomySimilar = hasFlag("--allow-taxonomy-similar");
  const skipUrlCheck = hasFlag("--skip-url-check");
  const skipTaxonomyCheck = hasFlag("--skip-taxonomy-check");
  const canonicalTaxonomySpaceId =
    getArg("--canonical-taxonomy-space") ??
    process.env.CANONICAL_TAXONOMY_SPACE_ID ??
    DEFAULT_CANONICAL_AI_SPACE_ID;
    const shouldSendTransaction = shouldPublish && !explicitDryRun;
    const shouldTrackRunlog = shouldSendTransaction && isAgentRuntime();
  let runlogWritten = false;
  let runlogTargetSpace = process.env.TARGET_SPACE_ID ?? "(unknown)";
  let dedupeHighMatches = 0;

  const logAgentPublishRun = (published: boolean, reason: string, txHash?: string) => {
    if (!shouldTrackRunlog || runlogWritten) return;
    appendRunlogRow({
      targetSpaceId: runlogTargetSpace,
      published,
      reason,
      dedupeHighMatches,
      txHash,
    });
    runlogWritten = true;
  };

  try {
    const mapping = readDecisionFile(mappingFile);
    const envTargetSpaceId = process.env.TARGET_SPACE_ID;
    if (envTargetSpaceId && envTargetSpaceId !== mapping.targetSpaceId) {
      console.log(
        `Overriding mapping target space ${mapping.targetSpaceId} with TARGET_SPACE_ID=${envTargetSpaceId} from .env`,
      );
      mapping.targetSpaceId = envTargetSpaceId;
    }
    runlogTargetSpace = mapping.targetSpaceId;
    await verifyTargetSpaceReadable(mapping.targetSpaceId);
    await ensureSchemaMatches(mappingFile);

    requireAccepted(mapping.types.course.fields, "Course mapping");
    requireAccepted(mapping.types.lesson.fields, "Lesson mapping");
    requireFieldKind(mapping.types.course.fields, "Name", "value", "Course mapping");
    requireFieldKind(mapping.types.lesson.fields, "Name", "value", "Lesson mapping");
    if (hasField(mapping.types.lesson.fields, "course_id")) {
      requireFieldKind(mapping.types.lesson.fields, "course_id", "relation", "Lesson mapping");
    }
    if (hasField(mapping.types.lesson.fields, "Courses")) {
      requireFieldKind(mapping.types.lesson.fields, "Courses", "relation", "Lesson mapping");
    }
    if (hasField(mapping.types.lesson.fields, "lesson_num")) {
      requireFieldKind(
        mapping.types.lesson.fields,
        "lesson_num",
        ["value", "relation"],
        "Lesson mapping",
      );
    }
    if (hasField(mapping.types.lesson.fields, "Lesson number")) {
      requireFieldKind(
        mapping.types.lesson.fields,
        "Lesson number",
        ["value", "relation"],
        "Lesson mapping",
      );
    }

    let courseRows = readRows(coursesJsonPath);
    let lessonRows = readRows(lessonsJsonPath);

    if (!skipUrlCheck) {
      const urlReport = await checkCsvWebUrls([coursesJsonPath, lessonsJsonPath]);
      console.log(
        `URL check: ${urlReport.checkedCount} checked, ${urlReport.restrictedCount} restricted, ${urlReport.failureCount} failures.`,
      );
      for (const restricted of urlReport.restricted.slice(0, 20)) {
        console.log(
          `[URL RESTRICTED] ${restricted.filePath}:${restricted.rowNumber} ${restricted.entityName} -> ${restricted.url} (${restricted.error})`,
        );
      }
      for (const failure of urlReport.failures.slice(0, 20)) {
        console.log(
          `[URL ERROR] ${failure.filePath}:${failure.rowNumber} ${failure.entityName} -> ${failure.url} (${failure.error})`,
        );
      }
      if (urlReport.failureCount > 0 && !allowBrokenUrls) {
        throw new Error(
          `URL check failed with ${urlReport.failureCount} broken URL(s). Fix URLs or rerun with --allow-broken-urls.`,
        );
      }
    }

    if (!skipTaxonomyCheck) {
      const taxonomyReport = await checkTaxonomyOverlap({
        filePaths: [coursesJsonPath, lessonsJsonPath],
        canonicalSpaceId: canonicalTaxonomySpaceId,
      });
      console.log(
        `Taxonomy overlap (${taxonomyReport.canonicalSpaceName}): exact=${taxonomyReport.totalExact}, similar=${taxonomyReport.totalSimilar}, unmatched=${taxonomyReport.totalUnmatched}`,
      );
      for (const field of taxonomyReport.fields) {
        if (field.similarCount === 0) continue;
        for (const similar of field.similar.slice(0, 10)) {
          console.log(
            `[TAXONOMY SIMILAR] ${field.field}: ${similar.value} -> ${similar.matchedEntity} score=${similar.score.toFixed(3)}`,
          );
        }
      }
      if (taxonomyReport.totalSimilar > 0 && !allowTaxonomySimilar) {
        throw new Error(
          `Taxonomy overlap found ${taxonomyReport.totalSimilar} similar value(s). Review terms or rerun with --allow-taxonomy-similar.`,
        );
      }
    }

    const policyReport = validateContentPolicies(courseRows, lessonRows);
    if (policyReport.errorCount > 0 && !allowPolicyErrors) {
      const examples = policyReport.issues.slice(0, 20);
      for (const issue of examples) {
        console.log(
          `[POLICY ${issue.level.toUpperCase()}] ${issue.entityKind}:${issue.rowId} ${issue.field} - ${issue.message}`,
        );
      }
      throw new Error(
        `Content policy check failed with ${policyReport.errorCount} errors. Fix data or pass --allow-policy-errors.`,
      );
    }
    if (policyReport.warningCount > 0) {
      const examples = policyReport.issues.filter((i) => i.level === "warning").slice(0, 20);
      for (const issue of examples) {
        console.log(
          `[POLICY WARNING] ${issue.entityKind}:${issue.rowId} ${issue.field} - ${issue.message}`,
        );
      }
      console.log(`Policy warnings: ${policyReport.warningCount}.`);
      if (strictPolicyWarnings) {
        throw new Error(
          "Policy warnings present and --strict-policy-warnings is enabled. Fix data or run without strict warning gate.",
        );
      }
    }

    const courseValueMappings = acceptedValueMappings(mapping.types.course.fields);
    const courseRelationMappings = acceptedRelationMappings(mapping.types.course.fields);
    const lessonRelationMappings = acceptedRelationMappings(mapping.types.lesson.fields);
    const relationTypeAnalysis = analyzeRelationTargetTypes([
      ...courseRelationMappings,
      ...lessonRelationMappings,
    ]);
    const relationEntityIndex = await loadEntityNameIndex(mapping.targetSpaceId, {
      typeFilter: relationTypeAnalysis.typeIds,
      includeAllEntities: relationTypeAnalysis.requiresUntypedIndex,
    });
    const rootEntityIndex = await loadEntityNameIndex(GEO_ROOT_SPACE_ID, {
      typeFilter: relationTypeAnalysis.typeIds,
      includeAllEntities: relationTypeAnalysis.requiresUntypedIndex,
    });
    const typeFallbackIndexes = await buildFallbackTypeIndexes(
      relationTypeAnalysis.typeIds,
      canonicalTaxonomySpaceId,
    );

    const proposedRecords = collectProposedRecords(
      courseRows as CourseRow[],
      lessonRows as LessonRow[],
      mapping,
      relationEntityIndex,
      rootEntityIndex,
      typeFallbackIndexes,
    );
    const existingRecords = await loadExistingRecords(mapping.targetSpaceId);
    const dedupeReport = runPythonDedupeCheck(proposedRecords, existingRecords, {
      high: 0.99,
      medium: 0.92,
    });
    dedupeHighMatches = dedupeReport.summary.highMatchCount;

    console.log(
      `Fuzzy dedupe check: ${dedupeReport.summary.proposedCount} proposed vs ${dedupeReport.summary.existingCount} existing (${dedupeReport.summary.highMatchCount} high, ${dedupeReport.summary.mediumMatchCount} medium).`,
    );
    for (const match of dedupeReport.highMatches.slice(0, 10)) {
      console.log(
        `[DEDUPE HIGH] ${match.proposedName} -> ${match.bestMatch.name} score=${match.score.toFixed(3)} source=${match.sourceKind}:${match.sourceRef}`,
      );
    }

    const skipCourseNames = new Set(
      dedupeReport.highMatches
        .filter((match) => match.sourceKind === "course")
        .map((match) => match.proposedName.trim().toLowerCase()),
    );
    const skipLessonNames = new Set(
      dedupeReport.highMatches
        .filter((match) => match.sourceKind === "lesson")
        .map((match) => match.proposedName.trim().toLowerCase()),
    );

    if (skipCourseNames.size || skipLessonNames.size) {
      console.log(
        `Skipping ${skipCourseNames.size} course(s) and ${skipLessonNames.size} lesson(s) because they already exist.`,
      );
    }

    const normalizeRowName = (row: Record<string, unknown>) =>
      String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "").trim().toLowerCase();

    if (skipCourseNames.size) {
      courseRows = courseRows.filter((row) => {
        const normalized = normalizeRowName(row);
        return normalized && !skipCourseNames.has(normalized);
      });
    }
    if (skipLessonNames.size) {
      lessonRows = lessonRows.filter((row) => {
        const normalized = normalizeRowName(row);
        return normalized && !skipLessonNames.has(normalized);
      });
    }

    if (dedupeHighMatches > 0 && shouldSendTransaction && isAgentRuntime()) {
      logAgentPublishRun(
        false,
        `Blocked by dedupe gate: ${dedupeHighMatches} high-similarity matches detected (threshold ${dedupeReport.summary.highThreshold}).`,
      );
      throw new Error(
        `Agent publish blocked by dedupe gate: ${dedupeHighMatches} high-similarity candidate(s) detected. Review mappings/data and rerun.`,
      );
    }

    const allOps: Op[] = [];
    const courseIdBySourceId = new Map<string, string>();
    const plannedLessonIdsByName = new Map<string, string[]>();
    const pendingCourseLessonLinks: PendingCourseLessonLinks[] = [];
    const courseLessonPlans = new Map<string, CourseLessonBlockPlan>();

    const taxonomyFieldNames = new Set<string>();
    const collectTaxonomyField = (decision: MappingDecision) => {
      if (shouldLoadTaxonomyForDecision(decision)) {
        taxonomyFieldNames.add(decision.sourceField);
      }
    };
    courseRelationMappings.forEach(collectTaxonomyField);
    lessonRelationMappings.forEach(collectTaxonomyField);

    const taxonomyFileMap = listTaxonomyFiles();
    const { lookup: taxonomyLookup, missing: missingTaxonomyFields } = buildTaxonomyLookup(
      taxonomyFieldNames,
      taxonomyFileMap,
    );
    if (missingTaxonomyFields.length > 0) {
      const missingList = missingTaxonomyFields.join(", ");
      console.warn(
        `Warning: taxonomy data missing for ${missingList}. Add matching CSVs under ${TAXONOMY_DIR} to supply descriptions for those linked entities.`,
      );
    }

    for (const row of courseRows as CourseRow[]) {
      const courseName = String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "Untitled Course");
      const rowPendingLessonLinks: Array<Omit<PendingCourseLessonLinks, "courseEntityId">> = [];

      const values = courseValueMappings
        .map<PropertyValueParam | null>((decision) => {
          const accepted = decision.accepted;
          if (!accepted) return null;
          const sourceValue = getFieldValue(row, decision.sourceField);
          if (sourceValue == null || sourceValue === "") return null;
          const typed = inferTypedValue(sourceValue);
          const typedValue: TypedValue =
            typed.type === "text"
              ? { type: "text", value: String(typed.value) }
              : typed.type === "checkbox"
              ? { type: "boolean", value: Boolean(typed.value) }
              : (() => {
                  const numeric = Number(typed.value);
                  if (Number.isInteger(numeric)) {
                    return { type: "integer", value: numeric };
                  }
                  return { type: "float", value: numeric };
                })();
          const typedProperty: PropertyValueParam = {
            property: accepted.id,
            ...typedValue,
          };
          return typedProperty;
        })
        .filter((entry): entry is PropertyValueParam => entry !== null);

      const relations: Record<string, Array<{ toEntity: string }>> = {};
      for (const decision of courseRelationMappings) {
        const accepted = decision.accepted;
        if (!accepted) continue;
        const sourceValue = getFieldValue(row, decision.sourceField);
        const names = splitRelationValues(sourceValue, decision.relation);

        const isCourseLessonsRelation =
          normalizeFieldName(decision.sourceField) === normalizeFieldName("Lessons") &&
          decision.relation?.targetTypeId === mapping.types.lesson.typeId;
        if (isCourseLessonsRelation) {
          if (names.length > 0) {
            rowPendingLessonLinks.push({
              courseName,
              relationTypeId: accepted.id,
              relationRule: decision.relation,
              lessonTokens: names,
            });
          }
          continue;
        }

        const fallbackIndex = decision.relation?.targetTypeId
          ? typeFallbackIndexes.get(decision.relation.targetTypeId)
          : undefined;
        let targetIds = resolveExistingTargets(
          names,
          decision.relation,
          relationEntityIndex,
          rootEntityIndex,
          fallbackIndex,
          {
            targetSpaceId: mapping.targetSpaceId,
            canonicalSpaceId: GEO_ROOT_SPACE_ID,
          },
        );

        if (targetIds.length === 0) {
          const normalizedFieldKey = normalizeTaxonomyKey(decision.sourceField);
        const taxonomyEntries = taxonomyLookup.get(normalizedFieldKey);
        targetIds = createMissingTargetsIfAllowed(
          names,
          decision.relation,
          relationEntityIndex,
          allOps,
          mapping.targetSpaceId,
          taxonomyEntries,
        );
        }

        if (targetIds.length > 0) {
          relations[accepted.id] = targetIds.map((toEntity) => ({ toEntity }));
        }
      }

      const descriptionRaw = getFieldValue(row, "description") ?? getFieldValue(row, "Description");

      const result = Graph.createEntity({
        name: courseName,
        description: descriptionRaw ? String(descriptionRaw) : undefined,
        types: [mapping.types.course.typeId],
        values,
        relations,
      });
      allOps.push(...result.ops);

      for (const pending of rowPendingLessonLinks) {
        pendingCourseLessonLinks.push({
          courseEntityId: result.id,
          ...pending,
        });
      }

      setCourseKeys(courseIdBySourceId, row, result.id);
    }

    const lessonValueMappings = acceptedValueMappings(mapping.types.lesson.fields);

    for (const row of lessonRows as LessonRow[]) {
      const values = lessonValueMappings
      .map<PropertyValueParam | null>((decision) => {
        const accepted = decision.accepted;
        if (!accepted) return null;
        const sourceValue = getFieldValue(row, decision.sourceField);
        if (sourceValue == null || sourceValue === "") return null;
        const typed = inferTypedValue(sourceValue);
        const typedValue: TypedValue =
          typed.type === "text"
            ? { type: "text", value: String(typed.value) }
            : typed.type === "checkbox"
            ? { type: "boolean", value: Boolean(typed.value) }
            : (() => {
                const numeric = Number(typed.value);
                if (Number.isInteger(numeric)) {
                  return { type: "integer", value: numeric };
                }
                return { type: "float", value: numeric };
              })();
        return {
          property: accepted.id,
          ...typedValue,
        };
      })
      .filter((entry): entry is PropertyValueParam => entry !== null);

      const relations: Record<string, Array<{ toEntity: string }>> = {};
      for (const decision of lessonRelationMappings) {
        const accepted = decision.accepted;
        if (!accepted) continue;
        let sourceValue = getFieldValue(row, decision.sourceField);
        if (
          (sourceValue === undefined || sourceValue === null || sourceValue === "") &&
          decision.relation?.crossFile?.targetKeyField
        ) {
          sourceValue = getFieldValue(row, decision.relation.crossFile.targetKeyField);
        }
        const names = splitRelationValues(sourceValue, decision.relation);

        let targetIds: string[] = [];
        if (decision.relation?.mode === "by_source_id") {
          targetIds = findCourseLinks(names, courseIdBySourceId);
        } else if (decision.relation?.mode === "by_slug") {
          targetIds = findCourseLinks(names.map((name) => slugify(name)), courseIdBySourceId);
        } else {
          const fallbackIndex = decision.relation?.targetTypeId
            ? typeFallbackIndexes.get(decision.relation.targetTypeId)
            : undefined;
          targetIds = resolveExistingTargets(
            names,
            decision.relation,
            relationEntityIndex,
            rootEntityIndex,
            fallbackIndex,
            {
              targetSpaceId: mapping.targetSpaceId,
              canonicalSpaceId: GEO_ROOT_SPACE_ID,
            },
          );
        }

        if (
          targetIds.length === 0 &&
          decision.relation?.crossFile?.targetEntitySet === "course"
        ) {
          targetIds = findCourseLinks(names, courseIdBySourceId);
        }

        if (targetIds.length === 0) {
          const normalizedFieldKey = normalizeTaxonomyKey(decision.sourceField);
          const taxonomyEntries = taxonomyLookup.get(normalizedFieldKey);
          targetIds = createMissingTargetsIfAllowed(
            names,
            decision.relation,
            relationEntityIndex,
            allOps,
            mapping.targetSpaceId,
            taxonomyEntries,
          );
        }

        if (targetIds.length > 0) {
          relations[accepted.id] = targetIds.map((toEntity) => ({ toEntity }));
        }
      }

      const name = String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "Untitled Lesson");
      const descriptionRaw = getFieldValue(row, "description") ?? getFieldValue(row, "Description");

      const result = Graph.createEntity({
        name,
        description: descriptionRaw ? String(descriptionRaw) : undefined,
        types: [mapping.types.lesson.typeId],
        values,
        relations,
      });
      allOps.push(...result.ops);
      indexPlannedEntity(plannedLessonIdsByName, name, result.id);
    }

    const unresolvedCourseLessonLinks: string[] = [];
    for (const pending of pendingCourseLessonLinks) {
      if (!pending.courseEntityId) continue;

      const resolvedForCourse = new Set<string>();
      for (const token of pending.lessonTokens) {
        const lookupNames = expandLessonLookupNames(token, pending.relationRule);
        const existingIds = resolveIdsByName(lookupNames, relationEntityIndex, pending.relationRule);
        const plannedIds = resolvePlannedIdsByName(lookupNames, plannedLessonIdsByName);
        const targetIds = [...new Set([...existingIds, ...plannedIds])];

        if (targetIds.length === 0) {
          unresolvedCourseLessonLinks.push(`${pending.courseName} -> ${token}`);
          continue;
        }

        for (const targetId of targetIds) {
          resolvedForCourse.add(targetId);
        }
      }

        if (resolvedForCourse.size > 0) {
          const plan = courseLessonPlans.get(pending.courseEntityId) ?? {
            lessonIds: new Set<string>(),
            courseName: pending.courseName,
          };
          for (const lessonId of resolvedForCourse) {
            plan.lessonIds.add(lessonId);
          }
          courseLessonPlans.set(pending.courseEntityId, plan);
        }

        for (const lessonId of resolvedForCourse) {
        const relationResult = Graph.createRelation({
          fromEntity: pending.courseEntityId,
          toEntity: lessonId,
          type: pending.relationTypeId,
        });
        allOps.push(...relationResult.ops);
      }
    }

    if (unresolvedCourseLessonLinks.length > 0) {
      const preview = unresolvedCourseLessonLinks.slice(0, 10).join(", ");
      throw new Error(
        `Unresolved course lesson links (${unresolvedCourseLessonLinks.length}). Examples: ${preview}`,
      );
    }

    const skipTableView = hasFlag("--skip-table-view");
    await ensureLessonBlocks(courseLessonPlans, mapping.targetSpaceId, allOps, skipTableView);

    await verifyTargetSpaceReadable(mapping.targetSpaceId);
    printOps(allOps, "data_to_delete", "courses_lessons_publish_ops.txt");
    console.log(`Generated ${allOps.length} ops.`);
    console.log("Preflight summary:");
    console.log("- schema fingerprints matched");
    console.log("- URL/taxonomy/policy checks passed");
    console.log("- dedupe check completed");
    console.log("- entity ops generated");
    console.log("- course/lesson relations resolved");

    if (!shouldSendTransaction) {
      console.log("Dry run complete. Review ops and preflight output before publishing.");
      return;
    }

    const txHash = await publishOps(allOps, editName, mapping.targetSpaceId);
    console.log(`Published. Tx hash: ${txHash}`);
    logAgentPublishRun(
      true,
      `Published successfully with dedupe gate clear (${dedupeReport.summary.highMatchCount} high matches).`,
      txHash,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logAgentPublishRun(false, `Publish failed: ${message}`);
    throw error;
  }
}

main().catch((error) => {
  console.error("Course/Lesson publish failed:", error);
  process.exit(1);
});
