import * as fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import {
  DEFAULT_MAPPING_FILE,
  defaultRelationRule,
  type MappingDecisionFile,
  normalizeFieldKey,
  proposeFieldMappings,
  writeDecisionFile,
} from "./src/mapping-decisions";
import { TYPES } from "./src/constants";
import {
  DEFAULT_SCHEMA_SPACE_ID,
  fetchTypeSchema,
  findTypeIdByName,
  fingerprintTypeSchema,
} from "./src/type-schema-live";

type Args = {
  targetSpaceId: string;
  schemaSpaceId: string;
  mappingFile: string;
  coursesCsv: string;
  lessonsCsv: string;
};

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function requiredArg(name: string): string {
  const value = getArg(name);
  if (!value) throw new Error(`Missing required argument: ${name}`);
  return value;
}

function parseArgs(): Args {
  const targetSpaceId = getArg("--target-space") ?? process.env.TARGET_SPACE_ID;
  if (!targetSpaceId) {
    throw new Error("Missing target space. Pass --target-space or set TARGET_SPACE_ID in .env");
  }

  return {
    targetSpaceId,
    schemaSpaceId: getArg("--schema-space") ?? DEFAULT_SCHEMA_SPACE_ID,
    mappingFile: getArg("--out") ?? DEFAULT_MAPPING_FILE,
    coursesCsv: getArg("--courses-csv") ?? "data_to_publish/courses.csv",
    lessonsCsv: getArg("--lessons-csv") ?? "data_to_publish/lessons.csv",
  };
}

function readHeaders(csvPath: string): string[] {
  const content = fs.readFileSync(csvPath, "utf8");
  const rows = parse(content, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>;
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
}

function inferFieldHints(csvPath: string): Record<string, "scalar" | "list"> {
  const content = fs.readFileSync(csvPath, "utf8");
  const rows = parse(content, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>;
  const hints: Record<string, "scalar" | "list"> = {};
  if (rows.length === 0) return hints;

  const headers = Object.keys(rows[0]);
  for (const header of headers) {
    const values = rows.slice(0, 20).map((row) => row[header] ?? "");
    const looksLikeList = values.some((value) => value.includes(";"));
    hints[header] = looksLikeList ? "list" : "scalar";
  }
  return hints;
}

function applyRelationPresets(payload: MappingDecisionFile) {
  const relationTargetByField: Record<string, string> = {
    "topics": TYPES.topic,
    "skills": TYPES.skill,
    "roles": TYPES.role,
    "tags": TYPES.tag,
    "goals": TYPES.goal,
    "providers": TYPES.project,
    "related spaces": TYPES.space,
    "lessons": TYPES.lesson,
    "courses": TYPES.course,
  };

  const applyToType = (typeKey: "course" | "lesson") => {
    for (const field of payload.types[typeKey].fields) {
      const key = normalizeFieldKey(field.sourceField);
      if (field.accepted?.kind !== "relation" && field.proposed?.kind !== "relation") continue;
      if (!field.relation) {
        field.relation = defaultRelationRule();
      }

      const inferredTargetTypeId = relationTargetByField[key];
      if (inferredTargetTypeId) {
        field.relation.targetTypeId = inferredTargetTypeId;
      }

      if (
        ["topics", "skills", "roles", "tags", "goals", "providers"].includes(key) &&
        field.relation.targetTypeId
      ) {
        field.relation.targetCreation = "create_if_missing";
      }

      if (key === "related spaces") {
        field.relation.targetCreation = "must_exist";
      }

      if (key === "lessons") {
        field.relation.targetCreation = "must_exist";
      }

      if (typeKey === "course" && key === "providers") {
        field.relation = {
          ...field.relation,
          mode: "by_name",
          targetCreation: "create_if_missing",
          targetTypeId: TYPES.project,
          manualMap: {
            ...(field.relation.manualMap ?? {}),
            openclaw: "OpenClaw",
          },
        };
      }

      if (typeKey === "lesson" && key === "courses") {
        field.relation = {
          ...field.relation,
          mode: "by_source_id",
          targetCreation: "must_exist",
          crossFile: {
            targetEntitySet: "course",
            targetKeyField: "course_id",
          },
        };
      }
    }
  };

  applyToType("course");
  applyToType("lesson");
}

async function main() {
  dotenv.config();
  const args = parseArgs();

  const courseTypeId = await findTypeIdByName("Course", args.schemaSpaceId);
  const lessonTypeId = await findTypeIdByName("Lesson", args.schemaSpaceId);

  const courseSchema = await fetchTypeSchema(courseTypeId, args.schemaSpaceId);
  const lessonSchema = await fetchTypeSchema(lessonTypeId, args.schemaSpaceId);

  const courseFields = readHeaders(args.coursesCsv);
  const lessonFields = readHeaders(args.lessonsCsv);
  const courseHints = inferFieldHints(args.coursesCsv);
  const lessonHints = inferFieldHints(args.lessonsCsv);

  const courseCandidates = [
    ...courseSchema.valueProperties.map((entry) => ({ kind: "value" as const, id: entry.id, name: entry.name })),
    ...courseSchema.relationProperties.map((entry) => ({ kind: "relation" as const, id: entry.id, name: entry.name })),
    ...courseSchema.relationProperties.map((entry) => ({ kind: "value" as const, id: entry.id, name: entry.name })),
  ];

  const lessonCandidates = [
    ...lessonSchema.valueProperties.map((entry) => ({ kind: "value" as const, id: entry.id, name: entry.name })),
    ...lessonSchema.relationProperties.map((entry) => ({ kind: "relation" as const, id: entry.id, name: entry.name })),
    ...lessonSchema.relationProperties.map((entry) => ({ kind: "value" as const, id: entry.id, name: entry.name })),
  ];

  const payload: MappingDecisionFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    schemaSpaceId: args.schemaSpaceId,
    targetSpaceId: args.targetSpaceId,
    source: {
      courseFile: args.coursesCsv,
      lessonFile: args.lessonsCsv,
      courseFields,
      lessonFields,
    },
    types: {
      course: {
        typeName: "Course",
        typeId: courseTypeId,
        schemaFingerprint: fingerprintTypeSchema(courseSchema),
        fields: proposeFieldMappings(courseFields, courseCandidates, courseHints),
      },
      lesson: {
        typeName: "Lesson",
        typeId: lessonTypeId,
        schemaFingerprint: fingerprintTypeSchema(lessonSchema),
        fields: proposeFieldMappings(lessonFields, lessonCandidates, lessonHints),
      },
    },
  };

  applyRelationPresets(payload);

  const outPath = path.resolve(args.mappingFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  writeDecisionFile(outPath, payload);

  console.log(`Wrote mapping proposals: ${outPath}`);
  console.log(`Course fields: ${courseFields.length}, Lesson fields: ${lessonFields.length}`);
  console.log("Next: review decisions with 08_review_mapping_decisions.ts before publishing.");
}

main().catch((error) => {
  console.error("Failed to generate mapping proposals:", error);
  process.exit(1);
});
