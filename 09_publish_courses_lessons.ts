import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { printOps, publishOps } from "./src/functions";
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
import { TYPES } from "./src/constants";
import { validateContentPolicies } from "./src/content-policy";

dotenv.config();

type CourseRow = Record<string, unknown>;
type LessonRow = Record<string, unknown>;

type EntityIndexResult = {
  entities: Array<{ id: string; name?: string; typeIds?: string[] }>;
};

type IndexedEntity = {
  id: string;
  name: string;
  typeIds: string[];
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
  kind: "value" | "relation",
  label: string,
) {
  const entry = entries.find(
    (item) => normalizeFieldName(item.sourceField) === normalizeFieldName(sourceField),
  );
  if (!entry || entry.status !== "accepted" || !entry.accepted) {
    throw new Error(`${label}: '${sourceField}' must be accepted before publish.`);
  }
  if (entry.accepted.kind !== kind) {
    throw new Error(
      `${label}: '${sourceField}' must map to ${kind}, got ${entry.accepted.kind}. Adjust mapping decisions first.`,
    );
  }
}

function acceptedValueMappings(entries: MappingDecision[]) {
  return entries.filter((entry) => entry.status === "accepted" && entry.accepted?.kind === "value");
}

function acceptedRelationMappings(entries: MappingDecision[]) {
  return entries.filter((entry) => entry.status === "accepted" && entry.accepted?.kind === "relation");
}

function hasField(entries: MappingDecision[], sourceField: string): boolean {
  return entries.some((entry) => normalizeFieldName(entry.sourceField) === normalizeFieldName(sourceField));
}

async function loadEntityNameIndex(spaceId: string): Promise<Map<string, IndexedEntity[]>> {
  const { gql } = await import("./src/functions");
  const result = await gql<EntityIndexResult>(
    `query EntityNameIndex($spaceId: UUID!, $first: Int!) {
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

  const index = new Map<string, IndexedEntity[]>();
  for (const entity of result.entities) {
    if (!entity.name) continue;
    const normalizedName = entity.name.trim();
    const keys = [normalizedName.toLowerCase(), slugify(normalizedName)];
    const payload: IndexedEntity = {
      id: entity.id,
      name: normalizedName,
      typeIds: entity.typeIds ?? [],
    };
    for (const key of keys) {
      const existing = index.get(key) ?? [];
      existing.push(payload);
      index.set(key, existing);
    }
  }
  return index;
}

function resolveIdsByName(
  names: string[],
  index: Map<string, IndexedEntity[]>,
  rule?: RelationRule,
): string[] {
  const resolved: string[] = [];
  const targetTypeId = rule?.targetTypeId;
  const manualMap = rule?.manualMap ?? {};

  for (const name of names) {
    const mapped = manualMap[name] ?? manualMap[name.toLowerCase()] ?? name;
    const keys = [mapped.trim().toLowerCase(), slugify(mapped)];

    let hit: IndexedEntity | undefined;
    for (const key of keys) {
      const candidates = index.get(key) ?? [];
      if (targetTypeId) {
        hit = candidates.find((entry) => entry.typeIds.includes(targetTypeId));
      }
      if (!hit) {
        hit = candidates[0];
      }
      if (hit) break;
    }

    if (hit) {
      resolved.push(hit.id);
    }
  }
  return resolved;
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

function collectProposedRecords(
  courseRows: CourseRow[],
  lessonRows: LessonRow[],
  mapping: MappingDecisionFile,
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
  const result = await gql<EntityIndexResult>(
    `query ExistingEntitiesForDedupe($spaceId: UUID!, $first: Int!) {
      entities(spaceId: $spaceId, first: $first, filter: { name: { isNot: null } }) {
        id
        name
        typeIds
      }
    }`,
    {
      spaceId,
      first: 2000,
    },
  );

  const records: DedupeExistingRecord[] = [];
  for (const entity of result.entities) {
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
  return records;
}

function runPythonDedupeCheck(
  proposed: DedupeProposedRecord[],
  existing: DedupeExistingRecord[],
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
      "0.92",
      "--medium-threshold",
      "0.85",
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

    const createInput: { name: string; types?: string[] } = { name: resolvedName };
    if (rule.targetTypeId) {
      createInput.types = [rule.targetTypeId];
    }

    const newEntity = Graph.createEntity(createInput);
    allOps.push(...newEntity.ops);
    indexCreatedEntity(index, {
      id: newEntity.id,
      name: resolvedName,
      typeIds: rule.targetTypeId ? [rule.targetTypeId] : [],
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
  const strictPolicyWarnings = hasFlag("--strict-policy-warnings");
  const allowPolicyErrors = hasFlag("--allow-policy-errors");
  const shouldTrackRunlog = shouldPublish && isAgentRuntime();
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
    await ensureSchemaMatches(mappingFile);
    const mapping = readDecisionFile(mappingFile);
    runlogTargetSpace = mapping.targetSpaceId;

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
      requireFieldKind(mapping.types.lesson.fields, "lesson_num", "value", "Lesson mapping");
    }
    if (hasField(mapping.types.lesson.fields, "Lesson number")) {
      requireFieldKind(mapping.types.lesson.fields, "Lesson number", "value", "Lesson mapping");
    }

    const courseRows = readRows(coursesJsonPath);
    const lessonRows = readRows(lessonsJsonPath);

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

    const proposedRecords = collectProposedRecords(
      courseRows as CourseRow[],
      lessonRows as LessonRow[],
      mapping,
    );
    const existingRecords = await loadExistingRecords(mapping.targetSpaceId);
    const dedupeReport = runPythonDedupeCheck(proposedRecords, existingRecords);
    dedupeHighMatches = dedupeReport.summary.highMatchCount;

    console.log(
      `Fuzzy dedupe check: ${dedupeReport.summary.proposedCount} proposed vs ${dedupeReport.summary.existingCount} existing (${dedupeReport.summary.highMatchCount} high, ${dedupeReport.summary.mediumMatchCount} medium).`,
    );
    for (const match of dedupeReport.highMatches.slice(0, 10)) {
      console.log(
        `[DEDUPE HIGH] ${match.proposedName} -> ${match.bestMatch.name} score=${match.score.toFixed(3)} source=${match.sourceKind}:${match.sourceRef}`,
      );
    }

    if (dedupeHighMatches > 0 && shouldPublish && isAgentRuntime()) {
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

    const relationEntityIndex = await loadEntityNameIndex(mapping.targetSpaceId);

    const courseValueMappings = acceptedValueMappings(mapping.types.course.fields);
    const courseRelationMappings = acceptedRelationMappings(mapping.types.course.fields);

    for (const row of courseRows as CourseRow[]) {
      const courseName = String(getFieldValue(row, "name") ?? getFieldValue(row, "Name") ?? "Untitled Course");
      const rowPendingLessonLinks: Array<Omit<PendingCourseLessonLinks, "courseEntityId">> = [];

      const values = courseValueMappings
        .map((decision) => {
          const accepted = decision.accepted;
          if (!accepted) return null;
          const sourceValue = getFieldValue(row, decision.sourceField);
          if (sourceValue == null || sourceValue === "") return null;
          return {
            property: accepted.id,
            type: "text" as const,
            value: String(sourceValue),
          };
        })
        .filter((entry): entry is { property: string; type: "text"; value: string } => Boolean(entry));

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

        let targetIds = resolveIdsByName(names, relationEntityIndex, decision.relation);

        if (targetIds.length === 0) {
          targetIds = createMissingTargetsIfAllowed(
            names,
            decision.relation,
            relationEntityIndex,
            allOps,
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
    const lessonRelationMappings = acceptedRelationMappings(mapping.types.lesson.fields);

    for (const row of lessonRows as LessonRow[]) {
      const values = lessonValueMappings
        .map((decision) => {
          const accepted = decision.accepted;
          if (!accepted) return null;
          const sourceValue = getFieldValue(row, decision.sourceField);
          if (sourceValue == null || sourceValue === "") return null;
          return {
            property: accepted.id,
            type: "text" as const,
            value: String(sourceValue),
          };
        })
        .filter((entry): entry is { property: string; type: "text"; value: string } => Boolean(entry));

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
          targetIds = resolveIdsByName(names, relationEntityIndex, decision.relation);
        }

        if (
          targetIds.length === 0 &&
          decision.relation?.crossFile?.targetEntitySet === "course"
        ) {
          targetIds = findCourseLinks(names, courseIdBySourceId);
        }

        if (targetIds.length === 0) {
          targetIds = createMissingTargetsIfAllowed(
            names,
            decision.relation,
            relationEntityIndex,
            allOps,
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

    printOps(allOps, "data_to_delete", "courses_lessons_publish_ops.txt");
    console.log(`Generated ${allOps.length} ops.`);

    if (!shouldPublish) {
      console.log("Dry run complete. Add --publish to send transaction.");
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
