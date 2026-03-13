# Agent Powered SDK Geo Publisher

This repo is an opinionated Geo publishing toolchain built on `@geoprotocol/geo-sdk`.

The core design choice is simple: **always stay aligned with the live graph schema and ontology**.
We do not hardcode assumptions and hope they remain valid. We check the live API shape, verify mapping decisions against live type schema, and fail early when drift appears.

## Why this repo works

This repository works reliably because it enforces three guardrails:

1. **Schema guardrail**: query scripts check required GraphQL fields/args before making deep calls.
2. **Ontology guardrail**: mapping proposals are generated from live type schema, not guessed from CSV headers alone.
3. **Publish guardrail**: publish scripts block on pending mapping decisions, schema drift, and content-policy violations.

The result is fewer broken publishes and fewer edits that create invalid graph structure.

## Setup

1) Install dependencies

```bash
bun install
```

2) Configure environment from `.env.example`

```env
PK_SW="0x<private_key>"
TARGET_SPACE_ID="<space_id_to_publish_or_query>"
```

3) Optional endpoint override (defaults to testnet API)

```bash
export GEO_API_ENDPOINT="https://testnet-api.geobrowser.io/graphql"
```

## Repository map

- `src/geo-api-client.ts` - shared GraphQL transport and error normalization
- `src/functions.ts` - `gql`, `publishOps`, and op serialization helpers
- `src/schema-utils.ts` - query root field/arg assertions using local schema snapshot
- `src/type-schema-live.ts` - fetches live type schema + fingerprints for drift detection
- `src/mapping-decisions.ts` - accepted/pending/rejected mapping state
- `src/content-policy.ts` - dataset checks before publish
- `05_read_knowledge_graph.ts` - schema-backed API readiness check
- `06_sync_schema.ts` - refresh/check local schema snapshot
- `07_generate_mapping_proposals.ts` - propose course/lesson mappings from live schema
- `08_review_mapping_decisions.ts` - accept/reject/adjust mappings
- `09_publish_courses_lessons.ts` - dry-run or publish mapped entities

## Schema snapshot policy (important)

- `GEO_API_SCHEMA(never_edit).json` is the immutable full-detail baseline.
- `GEO_API_SCHEMA.json` is the lightweight working snapshot used by runtime checks.
- Use the baseline file when you need deep introspection details.
- Keep refreshing only the lightweight file for normal drift checks.

This split keeps day-to-day checks fast while preserving a complete forensic snapshot.

## How query transport works

All maintained scripts use one request path:

```ts
export async function geoGraphqlRequest<TData>(query: string, options = {}): Promise<TData> {
  const endpoint = resolveGeoApiEndpoint(options.endpoint);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: options.variables, operationName: options.operationName }),
  });
  // parse JSON + normalize HTTP / GraphQL errors
}
```

Why this works:
- single endpoint resolver avoids per-script config drift
- one error type (`GeoApiRequestError`) gives predictable failures
- variables-first query calls avoid brittle string interpolation

Example usage from helpers:

```ts
const data = await gql(
  `query SpaceGovernanceInfo($spaceId: UUID!) {
    space(id: $spaceId) { type address }
  }`,
  { spaceId },
);
```

## How schema guardrails work

Before deep read flows, scripts verify assumptions against `GEO_API_SCHEMA.json`:

```ts
ensureQueryFields(["space", "entities", "values", "relations"]);
assertFieldHasArgs("entities", ["spaceId", "first", "orderBy", "filter"]);
```

Why this works:
- if API removes or renames a field/arg, the script fails immediately
- prevents wasted debugging on downstream nulls/errors

The schema file itself is checked/refreshed with:

```bash
bun run api:schema:check
bun run api:schema:refresh
```

`06_sync_schema.ts` normalizes type/field/arg ordering before hashing, so drift detection is based on structure, not random ordering noise.

## How ontology-aware mapping works

The course/lesson pipeline is not "CSV in, chain out." It is schema-gated:

1. generate mapping proposals from live type schema
2. review and accept/reject each source field
3. publish only if all required mappings are accepted and fingerprints still match

Example acceptance gate:

```ts
function requireAccepted(entries: MappingDecision[], label: string): void {
  const pending = entries.filter((entry) => entry.status === "pending");
  if (pending.length > 0) {
    throw new Error(`${label} has pending mapping decisions (...)`);
  }
}
```

Example schema drift gate:

```ts
const courseLive = await fetchTypeSchema(mapping.types.course.typeId, mapping.schemaSpaceId);
const courseFingerprint = fingerprintTypeSchema(courseLive);
if (courseFingerprint !== mapping.types.course.schemaFingerprint) {
  throw new Error("Course schema drift detected...");
}
```

Why this works:
- mappings are anchored to actual live ontology shape
- publishes stop when type definitions change upstream
- avoids silently writing values/relations to wrong properties

## How publishing works

`publishOps` auto-detects personal vs DAO space and sends the correct transaction flow.

Personal flow:

```ts
const result = await personalSpace.publishEdit({
  name: editName,
  spaceId,
  ops,
  author: spaceId,
  network: "TESTNET",
});
```

DAO flow:

```ts
const result = await daoSpace.proposeEdit({
  name: editName,
  ops,
  author: callerSpaceId,
  network: "TESTNET",
  callerSpaceId: `0x${callerSpaceId}` as `0x${string}`,
  daoSpaceId: `0x${spaceId}` as `0x${string}`,
  daoSpaceAddress: daoAddress as `0x${string}`,
});
```

Why this works:
- DAO publishes require membership/editor authorization, which is checked first
- same op generation path can target either space governance model

## Daily command flow

Use this sequence for safe iteration:

```bash
# 1) verify local schema snapshot is current
bun run api:schema:check

# 2) run live query readiness checks
bun run api:check

# 3) generate/refresh mapping proposals from live schema
bun run map:propose -- --target-space <SPACE_ID>

# 4) resolve mapping decisions
bun run map:decide -- --action list

# 5) dry run publish (no transaction)
bun run publish:courses-lessons

# 6) publish when dry run is clean
bun run publish:courses-lessons -- --publish
```

## Included scripts

- Query/demo: `api:demo`, `api:check`, `api:crawl`, `api:smoke`
- Schema: `api:schema:check`, `api:schema:refresh`
- Mapping/publish: `map:propose`, `map:decide`, `publish:courses-lessons`
- Safety/ops: `policy:check`, `undo:courses-lessons`, `zero:target-space`, `ui:learn-tab`
- Helper walkthrough: `geo:help`

## FAQ

**Why not keep only one schema JSON file?**

Because we need both:
- full immutable baseline for deep debugging (`GEO_API_SCHEMA(never_edit).json`)
- lightweight operational snapshot for fast checks (`GEO_API_SCHEMA.json`)

**What does "stay in line with live schema and ontology" mean in practice?**

It means every critical step is validated against live graph reality:
- query field/arg assertions from current schema snapshot
- live type-schema fingerprints before publish
- mapping decisions tied to real type/property IDs

If live graph shape changes, this toolchain should fail loudly before it writes bad data.
