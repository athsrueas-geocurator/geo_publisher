import dotenv from "dotenv";
import { Graph, Position, type Op } from "@geoprotocol/geo-sdk";
import { gql, printOps, publishOps } from "../src/functions";
import { PROPERTIES, TYPES } from "../src/constants";

dotenv.config();

const SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";
const PAGE = 500;

type Rel = {
  id: string;
  position?: string | null;
  fromEntityId: string;
  toEntity?: { id: string; name?: string | null } | null;
};

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function lessonSortKey(num: number | undefined, name: string): [number, string] {
  return [num ?? Number.POSITIVE_INFINITY, name.toLowerCase()];
}

async function fetchAllLessonRelations(spaceId: string): Promise<Rel[]> {
  const out: Rel[] = [];
  let offset = 0;
  for (;;) {
    const data = await gql<{ relations: Rel[] }>(
      `query LessonRels($spaceId: UUID!, $typeId: UUID!, $first: Int!, $offset: Int!) {
        relations(
          filter: { spaceId: { is: $spaceId }, typeId: { is: $typeId } }
          first: $first
          offset: $offset
        ) {
          id
          position
          fromEntityId
          toEntity { id name }
        }
      }`,
      { spaceId, typeId: PROPERTIES.lessons, first: PAGE, offset },
    );
    out.push(...data.relations);
    if (data.relations.length < PAGE) break;
    offset += PAGE;
  }
  return out;
}

async function fetchLessonNumbers(spaceId: string): Promise<Map<string, number>> {
  const nums = new Map<string, number>();
  let offset = 0;
  for (;;) {
    const data = await gql<{
      values: Array<{ entityId: string; integer?: string | null; text?: string | null }>;
    }>(
      `query LessonNums($spaceId: UUID!, $propertyId: UUID!, $first: Int!, $offset: Int!) {
        values(
          filter: { spaceId: { is: $spaceId }, propertyId: { is: $propertyId } }
          first: $first
          offset: $offset
        ) {
          entityId
          integer
          text
        }
      }`,
      { spaceId, propertyId: PROPERTIES.lesson_number, first: PAGE, offset },
    );
    for (const row of data.values) {
      const raw = row.integer ?? row.text;
      if (raw == null || raw === "") continue;
      const n = Number(raw);
      if (Number.isFinite(n)) nums.set(row.entityId, n);
    }
    if (data.values.length < PAGE) break;
    offset += PAGE;
  }
  return nums;
}

function positionsForCount(count: number): string[] {
  const positions: string[] = [];
  let last: string | null = null;
  for (let i = 0; i < count; i++) {
    const pos: string = last ? Position.generateBetween(last, null) : Position.generate();
    positions.push(pos);
    last = pos;
  }
  return positions;
}

async function main() {
  const spaceId = getArg("--space") ?? process.env.TARGET_SPACE_ID ?? SPACE_ID;
  const shouldPublish = hasFlag("--publish");
  console.log(`Ordering Course→Lesson relations in ${spaceId}`);

  const [rels, numbers] = await Promise.all([
    fetchAllLessonRelations(spaceId),
    fetchLessonNumbers(spaceId),
  ]);

  const byCourse = new Map<string, Rel[]>();
  for (const rel of rels) {
    const list = byCourse.get(rel.fromEntityId) ?? [];
    list.push(rel);
    byCourse.set(rel.fromEntityId, list);
  }

  const ops: Op[] = [];
  let changed = 0;
  let unchanged = 0;

  for (const [courseId, courseRels] of byCourse) {
    const sorted = [...courseRels].sort((a, b) => {
      const [an, as] = lessonSortKey(numbers.get(a.toEntity?.id ?? ""), a.toEntity?.name ?? "");
      const [bn, bs] = lessonSortKey(numbers.get(b.toEntity?.id ?? ""), b.toEntity?.name ?? "");
      return an - bn || as.localeCompare(bs);
    });
    const positions = positionsForCount(sorted.length);
    for (let i = 0; i < sorted.length; i++) {
      const rel = sorted[i];
      const position = positions[i];
      if (rel.position === position) {
        unchanged += 1;
        continue;
      }
      const update = Graph.updateRelation({ id: rel.id, position });
      ops.push(...update.ops);
      changed += 1;
    }
    const preview = sorted
      .slice(0, 6)
      .map((rel) => `${numbers.get(rel.toEntity?.id ?? "") ?? "?"} ${rel.toEntity?.name}`)
      .join(" | ");
    console.log(`  ${courseId} (${sorted.length}): ${preview}`);
  }

  console.log(
    `Courses: ${byCourse.size}  relations: ${rels.length}  updates: ${changed}  already-matching: ${unchanged}`,
  );
  printOps(ops, "data_to_delete", "order_lesson_relations_ops.txt");

  if (!shouldPublish) {
    console.log("Dry run. Pass --publish to write positions.");
    return;
  }
  if (ops.length === 0) {
    console.log("Nothing to publish.");
    return;
  }
  const tx = await publishOps(ops, "Order course lessons by lesson number", spaceId);
  console.log("Published:", tx);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
