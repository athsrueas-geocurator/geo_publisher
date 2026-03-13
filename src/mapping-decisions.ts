import * as fs from "node:fs";

export type MappingCandidate = {
  kind: "value" | "relation";
  id: string;
  name: string;
};

export type MappingProposal = {
  kind: "value" | "relation";
  id: string;
  name: string;
  score: number;
  confidence: "high" | "medium" | "low";
};

export type MappingDecision = {
  sourceField: string;
  status: "pending" | "accepted" | "rejected" | "ignored";
  proposed: MappingProposal | null;
  alternatives: MappingProposal[];
  accepted: MappingProposal | null;
  relation?: RelationRule;
};

export type RelationResolutionMode = "by_name" | "by_slug" | "by_source_id" | "manual_map";
export type TargetCreationPolicy = "must_exist" | "create_if_missing";

export type RelationNormalization = {
  delimiter: string;
  trim: boolean;
  lowercase: boolean;
  dedupe: boolean;
};

export type CrossFileLinkRule = {
  targetEntitySet: "course" | "lesson";
  targetKeyField: string;
};

export type RelationRule = {
  mode: RelationResolutionMode;
  targetCreation: TargetCreationPolicy;
  targetTypeId?: string;
  manualMap?: Record<string, string>;
  normalization: RelationNormalization;
  crossFile?: CrossFileLinkRule;
};

export type TypeMappingBundle = {
  typeName: string;
  typeId: string;
  schemaFingerprint: string;
  fields: MappingDecision[];
};

export type MappingDecisionFile = {
  version: 1;
  generatedAt: string;
  schemaSpaceId: string;
  targetSpaceId: string;
  source: {
    courseFile: string;
    lessonFile: string;
    courseFields: string[];
    lessonFields: string[];
  };
  types: {
    course: TypeMappingBundle;
    lesson: TypeMappingBundle;
  };
};

type FieldHint = "scalar" | "list";

type ProposalOptions = {
  relationFieldNames?: string[];
};

export const DEFAULT_MAPPING_FILE = "data_to_publish/mapping/course-lesson.mapping.decisions.json";

const DEFAULT_RELATION_NORMALIZATION: RelationNormalization = {
  delimiter: ";",
  trim: true,
  lowercase: false,
  dedupe: true,
};

const DEFAULT_RELATION_FIELDS = new Set([
  "topics",
  "skills",
  "roles",
  "tags",
  "lessons",
  "courses",
  "related spaces",
  "providers",
  "goals",
  "stages",
]);

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeFieldKey(input: string): string {
  return normalizeText(input);
}

export function defaultRelationRule(): RelationRule {
  return {
    mode: "by_name",
    targetCreation: "must_exist",
    normalization: { ...DEFAULT_RELATION_NORMALIZATION },
  };
}

function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(" ")
    .map((token) => (token.endsWith("s") && token.length > 3 ? token.slice(0, -1) : token))
    .filter(Boolean);
}

function overlapScore(sourceTokens: string[], targetTokens: string[]): number {
  if (!sourceTokens.length || !targetTokens.length) return 0;
  const source = new Set(sourceTokens);
  const target = new Set(targetTokens);
  let overlap = 0;
  for (const token of source) {
    if (target.has(token)) overlap++;
  }
  return overlap / Math.max(source.size, target.size);
}

function fuzzyScore(source: string, target: string): number {
  const s = normalizeText(source);
  const t = normalizeText(target);
  if (!s || !t) return 0;
  if (s === t) return 1;
  if (s.includes(t) || t.includes(s)) return 0.92;
  return overlapScore(tokenize(s), tokenize(t));
}

function confidence(score: number): "high" | "medium" | "low" {
  if (score >= 0.9) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}

export function proposeFieldMappings(
  sourceFields: string[],
  candidates: MappingCandidate[],
  fieldHints: Record<string, FieldHint> = {},
  options: ProposalOptions = {},
): MappingDecision[] {
  const relationFieldSet = new Set([
    ...DEFAULT_RELATION_FIELDS,
    ...(options.relationFieldNames ?? []).map(normalizeText),
  ]);

  return sourceFields.map((sourceField) => {
    const normalizedField = normalizeText(sourceField);
    const expectedKind =
      relationFieldSet.has(normalizedField)
        ? "relation"
        : normalizedField.endsWith(" id") && !normalizedField.includes("url")
        ? "relation"
        : fieldHints[sourceField] === "list"
          ? "relation"
          : "value";
    const ranked = candidates
      .map((candidate) => {
        const score = Number(fuzzyScore(sourceField, candidate.name).toFixed(3));
        const kindBonus = candidate.kind === expectedKind ? 0.03 : 0;
        const proposal: MappingProposal = {
          kind: candidate.kind,
          id: candidate.id,
          name: candidate.name,
          score,
          confidence: confidence(score),
        };
        return { proposal, rankScore: score + kindBonus };
      })
      .sort((a, b) => b.rankScore - a.rankScore)
      .map((entry) => entry.proposal);

    const proposed = ranked[0] ?? null;
    return {
      sourceField,
      status: "pending",
      proposed,
      alternatives: ranked.slice(1, 4),
      accepted: null,
      relation: proposed?.kind === "relation" ? defaultRelationRule() : undefined,
    } satisfies MappingDecision;
  });
}

export function readDecisionFile(filePath: string): MappingDecisionFile {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as MappingDecisionFile;
}

export function writeDecisionFile(filePath: string, data: MappingDecisionFile): void {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
