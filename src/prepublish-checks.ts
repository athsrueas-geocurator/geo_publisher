import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "csv-parse/sync";
import { gql } from "./functions";
import { TYPES } from "./constants";

export const DEFAULT_CANONICAL_AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

export type UrlFailure = {
  filePath: string;
  rowNumber: number;
  entityName: string;
  url: string;
  error: string;
};

export type UrlCheckReport = {
  checkedCount: number;
  failureCount: number;
  restrictedCount: number;
  failures: UrlFailure[];
  restricted: UrlFailure[];
};

export type TaxonomyFieldName = "Goals" | "Skills" | "Topics" | "Tags" | "Roles" | "Stages";

export type TaxonomySimilar = {
  value: string;
  matchedEntity: string;
  score: number;
};

export type TaxonomyFieldReport = {
  field: TaxonomyFieldName;
  total: number;
  exactCount: number;
  similarCount: number;
  unmatchedCount: number;
  similar: TaxonomySimilar[];
  unmatched: string[];
};

export type TaxonomyCheckReport = {
  canonicalSpaceId: string;
  canonicalSpaceName: string;
  canonicalEntityCount: number;
  fields: TaxonomyFieldReport[];
  totalExact: number;
  totalSimilar: number;
  totalUnmatched: number;
};

type CsvRow = Record<string, unknown>;

type SpaceEntityResult = {
  space: { id: string; page?: { name?: string } | null } | null;
  entities: Array<{ id: string; name?: string | null; typeIds?: string[] | null }>;
};

const TAXONOMY_FIELDS: TaxonomyFieldName[] = ["Goals", "Skills", "Topics", "Tags", "Roles", "Stages"];

const TAXONOMY_TYPE_IDS = new Set<string>([TYPES.goal, TYPES.skill, TYPES.topic, TYPES.tag, TYPES.role]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’'`]+/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value).split(" ").filter(Boolean);
}

function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const aSet = new Set(a);
  const bSet = new Set(b);
  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function similarityScore(a: string, b: string): number {
  const normalizedA = normalizeText(a);
  const normalizedB = normalizeText(b);
  if (!normalizedA || !normalizedB) return 0;
  if (normalizedA === normalizedB) return 1;

  const tokenScore = overlapScore(tokenize(a), tokenize(b));
  const substringScore =
    normalizedA.length >= 8 && normalizedB.length >= 8 &&
    (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA))
      ? 0.9
      : 0;
  return Math.max(tokenScore, substringScore);
}

function countSharedTokens(a: string, b: string): number {
  const left = new Set(tokenize(a));
  const right = new Set(tokenize(b));
  let shared = 0;
  for (const token of left) {
    if (right.has(token)) shared += 1;
  }
  return shared;
}

function listCsvFiles(dataDir = "data_to_publish"): string[] {
  return fs
    .readdirSync(dataDir)
    .filter((entry) => entry.toLowerCase().endsWith(".csv"))
    .map((entry) => path.join(dataDir, entry))
    .sort();
}

function readRows(filePath: string): CsvRow[] {
  if (filePath.toLowerCase().endsWith(".csv")) {
    const csv = fs.readFileSync(filePath, "utf8");
    return parse(csv, { columns: true, skip_empty_lines: true }) as CsvRow[];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CsvRow[];
}

function splitSemicolonValues(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

async function fetchUrlWithFallback(url: string): Promise<{ status: number; finalUrl: string }> {
  const userAgent = "Mozilla/5.0 (geo-publisher-url-check)";
  const head = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    headers: { "User-Agent": userAgent },
  });
  if (head.ok) {
    return { status: head.status, finalUrl: head.url };
  }
  if (head.status === 405 || head.status === 403 || head.status === 400) {
    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": userAgent },
    });
    return { status: get.status, finalUrl: get.url };
  }
  return { status: head.status, finalUrl: head.url };
}

export async function checkCsvWebUrls(filePaths: string[]): Promise<UrlCheckReport> {
  let checkedCount = 0;
  const failures: UrlFailure[] = [];
  const restricted: UrlFailure[] = [];

  for (const filePath of filePaths) {
    const rows = readRows(filePath);
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const url = String(row["Web URL"] ?? "").trim();
      if (!url) continue;

      checkedCount += 1;
      const rowNumber = index + 2;
      const entityName = String(row["Name"] ?? row["Course ID"] ?? row["lesson_id"] ?? "(unknown)");

      try {
        const { status } = await fetchUrlWithFallback(url);
        if ([401, 403, 429].includes(status)) {
          restricted.push({
            filePath,
            rowNumber,
            entityName,
            url,
            error: `HTTP ${status}`,
          });
        } else if (status >= 400) {
          failures.push({
            filePath,
            rowNumber,
            entityName,
            url,
            error: `HTTP ${status}`,
          });
        }
      } catch (error) {
        failures.push({
          filePath,
          rowNumber,
          entityName,
          url,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return {
    checkedCount,
    failureCount: failures.length,
    restrictedCount: restricted.length,
    failures,
    restricted,
  };
}

export async function fetchSpaceEntityNames(spaceId: string): Promise<{
  spaceName: string;
  entities: Array<{ name: string; typeIds: string[] }>;
}> {
  const data = await gql<SpaceEntityResult>(
    `query SpaceEntityNames($spaceId: UUID!, $first: Int!) {
      space(id: $spaceId) {
        id
        page { name }
      }
      entities(
        spaceId: $spaceId
        first: $first
        orderBy: [PRIMARY_KEY_ASC]
        filter: { name: { isNot: null } }
      ) {
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

  if (!data.space) {
    throw new Error(`Space ${spaceId} not found`);
  }

  return {
    spaceName: data.space.page?.name ?? "(unnamed space)",
    entities: data.entities
      .filter((entity) => typeof entity.name === "string" && entity.name.trim().length > 0)
      .map((entity) => ({
        name: String(entity.name).trim(),
        typeIds: (entity.typeIds ?? []).filter((value): value is string => typeof value === "string"),
      })),
  };
}

function collectTaxonomyValues(filePaths: string[]): Record<TaxonomyFieldName, string[]> {
  const values = Object.fromEntries(TAXONOMY_FIELDS.map((field) => [field, new Set<string>()])) as Record<
    TaxonomyFieldName,
    Set<string>
  >;

  for (const filePath of filePaths) {
    const rows = readRows(filePath);
    for (const row of rows) {
      for (const field of TAXONOMY_FIELDS) {
        for (const token of splitSemicolonValues(row[field])) {
          values[field].add(token);
        }
      }
    }
  }

  return Object.fromEntries(
    TAXONOMY_FIELDS.map((field) => [field, [...values[field]].sort((a, b) => a.localeCompare(b))]),
  ) as Record<TaxonomyFieldName, string[]>;
}

function isTaxonomyLikeEntity(entity: { name: string; typeIds: string[] }): boolean {
  if (entity.typeIds.some((id) => TAXONOMY_TYPE_IDS.has(id))) return true;

  const wordCount = entity.name.split(/\s+/).length;
  if (entity.name.length > 80) return false;
  if (wordCount > 10) return false;
  if (/[.?!:]/.test(entity.name) && wordCount > 6) return false;
  return true;
}

export async function checkTaxonomyOverlap(args?: {
  filePaths?: string[];
  canonicalSpaceId?: string;
}): Promise<TaxonomyCheckReport> {
  const filePaths = args?.filePaths ?? listCsvFiles();
  const canonicalSpaceId = args?.canonicalSpaceId ?? DEFAULT_CANONICAL_AI_SPACE_ID;

  const taxonomyValues = collectTaxonomyValues(filePaths);
  const canonical = await fetchSpaceEntityNames(canonicalSpaceId);
  const candidates = canonical.entities.filter(isTaxonomyLikeEntity);
  const exactIndex = new Map<string, string>();
  for (const entity of candidates) {
    exactIndex.set(normalizeText(entity.name), entity.name);
  }

  const fields: TaxonomyFieldReport[] = [];
  let totalExact = 0;
  let totalSimilar = 0;
  let totalUnmatched = 0;

  for (const field of TAXONOMY_FIELDS) {
    const values = taxonomyValues[field];
    let exactCount = 0;
    const similar: TaxonomySimilar[] = [];
    const unmatched: string[] = [];

    for (const value of values) {
      const normalized = normalizeText(value);
      if (exactIndex.has(normalized)) {
        exactCount += 1;
        continue;
      }

      let bestName = "";
      let bestScore = 0;
      for (const entity of candidates) {
        const score = similarityScore(value, entity.name);
        if (score > bestScore) {
          bestScore = score;
          bestName = entity.name;
        }
      }

      const sharedTokens = countSharedTokens(value, bestName);
      const valueTokens = tokenize(value).length;
      const bestTokens = tokenize(bestName).length;
      const treatAsSimilar =
        bestScore >= 0.88 && (sharedTokens >= 2 || (valueTokens <= 2 && bestTokens <= 3 && bestScore >= 0.92));

      if (treatAsSimilar) {
        similar.push({ value, matchedEntity: bestName, score: Number(bestScore.toFixed(3)) });
      } else {
        unmatched.push(value);
      }
    }

    totalExact += exactCount;
    totalSimilar += similar.length;
    totalUnmatched += unmatched.length;
    fields.push({
      field,
      total: values.length,
      exactCount,
      similarCount: similar.length,
      unmatchedCount: unmatched.length,
      similar: similar.sort((a, b) => b.score - a.score || a.value.localeCompare(b.value)),
      unmatched,
    });
  }

  return {
    canonicalSpaceId,
    canonicalSpaceName: canonical.spaceName,
    canonicalEntityCount: canonical.entities.length,
    fields,
    totalExact,
    totalSimilar,
    totalUnmatched,
  };
}

export function defaultCsvFilesForChecks(): string[] {
  return listCsvFiles();
}
