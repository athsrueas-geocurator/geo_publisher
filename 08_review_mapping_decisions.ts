import {
  DEFAULT_MAPPING_FILE,
  type MappingProposal,
  type RelationResolutionMode,
  type TargetCreationPolicy,
  readDecisionFile,
  writeDecisionFile,
} from "./src/mapping-decisions";

type TypeKey = "course" | "lesson";
type Action = "accept" | "reject" | "ignore" | "list" | "set-relation";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

function requireArg(name: string): string {
  const value = getArg(name);
  if (!value) throw new Error(`Missing required argument: ${name}`);
  return value;
}

function parseAction(): Action {
  return (getArg("--action") as Action | undefined) ?? "list";
}

function parseBooleanArg(name: string): boolean | undefined {
  const value = getArg(name);
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true|false`);
}

function parseTypeKey(value: string): TypeKey {
  if (value === "course" || value === "lesson") return value;
  throw new Error(`--type must be 'course' or 'lesson', got '${value}'`);
}

function printPending(filePath: string) {
  const data = readDecisionFile(filePath);
  for (const typeKey of ["course", "lesson"] as const) {
    const entries = data.types[typeKey].fields;
    const pending = entries.filter((entry) => entry.status === "pending");
    console.log(`\n${typeKey.toUpperCase()} pending decisions: ${pending.length}`);
    for (const entry of pending) {
      const top = entry.proposed;
      const topLabel = top ? `${top.kind}:${top.name} (${top.id}) score=${top.score}` : "(no proposal)";
      const relationLabel =
        entry.relation && (top?.kind === "relation" || entry.accepted?.kind === "relation")
          ? ` [mode=${entry.relation.mode}, creation=${entry.relation.targetCreation}]`
          : "";
      console.log(`- ${entry.sourceField} -> ${topLabel}${relationLabel}`);
    }
  }
}

function resolveAcceptedCandidate(
  proposed: MappingProposal | null,
  kindArg: string | undefined,
  idArg: string | undefined,
  nameArg: string | undefined,
): MappingProposal {
  if (kindArg || idArg || nameArg) {
    if (!kindArg || !idArg || !nameArg) {
      throw new Error("Manual accept requires --kind, --target-id, and --target-name");
    }
    if (kindArg !== "value" && kindArg !== "relation") {
      throw new Error(`--kind must be value|relation, got '${kindArg}'`);
    }
    return {
      kind: kindArg,
      id: idArg,
      name: nameArg,
      score: 1,
      confidence: "high",
    };
  }
  if (!proposed) {
    throw new Error("No proposed mapping available. Supply --kind --target-id --target-name for manual acceptance.");
  }
  return proposed;
}

async function main() {
  const filePath = getArg("--file") ?? DEFAULT_MAPPING_FILE;
  const action = parseAction();

  if (action === "list") {
    printPending(filePath);
    return;
  }

  const typeKey = parseTypeKey(requireArg("--type"));
  const sourceField = requireArg("--field");

  const data = readDecisionFile(filePath);
  const bundle = data.types[typeKey];
  const entry = bundle.fields.find((field) => field.sourceField === sourceField);
  if (!entry) {
    throw new Error(`Field '${sourceField}' not found in ${typeKey} mapping decisions.`);
  }

  if (action === "accept") {
    const accepted = resolveAcceptedCandidate(
      entry.proposed,
      getArg("--kind"),
      getArg("--target-id"),
      getArg("--target-name"),
    );
    entry.status = "accepted";
    entry.accepted = accepted;
  } else if (action === "reject") {
    entry.status = "rejected";
    entry.accepted = null;
  } else if (action === "ignore") {
    entry.status = "ignored";
    entry.accepted = null;
  } else if (action === "set-relation") {
    const mode = (getArg("--mode") as RelationResolutionMode | undefined) ?? entry.relation?.mode;
    const creation =
      (getArg("--creation") as TargetCreationPolicy | undefined) ?? entry.relation?.targetCreation;
    if (!mode || !["by_name", "by_slug", "by_source_id", "manual_map"].includes(mode)) {
      throw new Error("--mode must be by_name|by_slug|by_source_id|manual_map");
    }
    if (!creation || !["must_exist", "create_if_missing"].includes(creation)) {
      throw new Error("--creation must be must_exist|create_if_missing");
    }

    const delimiter = getArg("--delimiter") ?? entry.relation?.normalization.delimiter ?? ";";
    const trim = parseBooleanArg("--trim") ?? entry.relation?.normalization.trim ?? true;
    const lowercase =
      parseBooleanArg("--lowercase") ?? entry.relation?.normalization.lowercase ?? false;
    const dedupe = parseBooleanArg("--dedupe") ?? entry.relation?.normalization.dedupe ?? true;

    const manualMapArg = getArg("--manual-map-json");
    const manualMap = manualMapArg
      ? (JSON.parse(manualMapArg) as Record<string, string>)
      : (entry.relation?.manualMap ?? undefined);

    const crossType = getArg("--cross-target-set") as "course" | "lesson" | undefined;
    const crossKey = getArg("--cross-target-key");
    const crossFile =
      crossType && crossKey
        ? { targetEntitySet: crossType, targetKeyField: crossKey }
        : (entry.relation?.crossFile ?? undefined);

    entry.relation = {
      mode,
      targetCreation: creation,
      targetTypeId: getArg("--target-type-id") ?? entry.relation?.targetTypeId,
      manualMap,
      normalization: {
        delimiter,
        trim,
        lowercase,
        dedupe,
      },
      crossFile,
    };

    if (entry.accepted?.kind !== "relation") {
      console.log(
        `Note: ${typeKey}.${sourceField} is not currently accepted as relation. Run --action accept with --kind relation to use this rule.`,
      );
    }
  }

  writeDecisionFile(filePath, data);
  if (action === "set-relation") {
    console.log(`Updated relation settings for ${typeKey}.${sourceField} in ${filePath}`);
  } else {
    console.log(`${actionPastTense(action)} mapping for ${typeKey}.${sourceField} in ${filePath}`);
  }
}

main().catch((error) => {
  console.error("Mapping decision update failed:", error);
  process.exit(1);
});
function actionPastTense(action: Action): string {
  if (action === "accept") return "accepted";
  if (action === "reject") return "rejected";
  if (action === "ignore") return "ignored";
  return action;
}
