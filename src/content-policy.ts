export type PolicyRow = {
  id?: string;
  name?: string;
  description?: string;
};

export type PolicyIssue = {
  level: "error" | "warning";
  entityKind: "course" | "lesson";
  rowId: string;
  field: "name" | "description";
  message: string;
};

const HONORIFICS = [
  "dr",
  "mr",
  "mrs",
  "ms",
  "president",
  "senator",
  "governor",
  "professor",
];

function words(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

function normalizePrefix(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function hasHonorificPrefix(name: string): boolean {
  const first = words(name)[0]?.toLowerCase().replace(/[.,]/g, "");
  if (!first) return false;
  return HONORIFICS.includes(first);
}

function isLikelyTitleCase(name: string): boolean {
  const parts = words(name).filter((part) => /[a-zA-Z]/.test(part));
  if (parts.length < 2) return false;
  let capped = 0;
  for (const part of parts) {
    if (/^[A-Z][a-z]/.test(part)) capped += 1;
  }
  return capped >= 2;
}

function startsWithEntityName(description: string, name: string): boolean {
  const d = normalizePrefix(description);
  const n = normalizePrefix(name);
  return n.length > 0 && d.startsWith(n);
}

function descriptionWordCount(description: string): number {
  return words(description).length;
}

function validateRow(kind: "course" | "lesson", row: PolicyRow): PolicyIssue[] {
  const issues: PolicyIssue[] = [];
  const rowObject = row as Record<string, unknown>;
  const rowId = String(rowObject.id ?? rowObject.lesson_id ?? rowObject.course_id ?? rowObject.name ?? rowObject.Name ?? "(unknown)");
  const name = String(rowObject.name ?? rowObject.Name ?? "").trim();
  const description = String(rowObject.description ?? rowObject.Description ?? "").trim();

  if (!name) {
    issues.push({
      level: "error",
      entityKind: kind,
      rowId,
      field: "name",
      message: "Name is required.",
    });
  } else {
    if (hasHonorificPrefix(name)) {
      issues.push({
        level: "warning",
        entityKind: kind,
        rowId,
        field: "name",
        message: "Name appears to include an honorific/title; prefer role property instead.",
      });
    }
    if (isLikelyTitleCase(name)) {
      issues.push({
        level: "warning",
        entityKind: kind,
        rowId,
        field: "name",
        message: "Name appears in title case; policy prefers sentence-style capitalization.",
      });
    }
  }

  if (!description) {
    issues.push({
      level: "error",
      entityKind: kind,
      rowId,
      field: "description",
      message: "Description is required and should be concise and informative.",
    });
  } else {
    const wc = descriptionWordCount(description);
    if (wc > 55) {
      issues.push({
        level: "warning",
        entityKind: kind,
        rowId,
        field: "description",
        message: `Description is long (${wc} words); policy target is about 50 words max.`,
      });
    }
    if (name && startsWithEntityName(description, name)) {
      issues.push({
        level: "error",
        entityKind: kind,
        rowId,
        field: "description",
        message: "Description starts by repeating the entity name; avoid redundant openings.",
      });
    }
  }

  return issues;
}

export function validateContentPolicies(
  courses: PolicyRow[],
  lessons: PolicyRow[],
): { issues: PolicyIssue[]; errorCount: number; warningCount: number } {
  const issues = [
    ...courses.flatMap((row) => validateRow("course", row)),
    ...lessons.flatMap((row) => validateRow("lesson", row)),
  ];
  const errorCount = issues.filter((issue) => issue.level === "error").length;
  const warningCount = issues.filter((issue) => issue.level === "warning").length;
  return { issues, errorCount, warningCount };
}
