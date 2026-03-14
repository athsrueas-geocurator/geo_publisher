# Query Tooling Architecture

This document defines the canonical structure for Geo API query tooling in this repository.

## Goals
- Keep one shared query client and one shared schema utility path for all scripts.
- Keep demos focused on usage examples, not transport or filter implementation details.
- Keep experiments isolated under `experimental-scripts/` while still using shared query primitives.
- Keep OpenCode helper tooling aligned with the same query contracts.

## Classification

### Core
- `src/geo-api-client.ts`
  - Shared GraphQL transport layer.
  - Central endpoint resolution (`GEO_API_ENDPOINT` with testnet fallback).
  - Shared error normalization (`GeoApiRequestError`).
- `src/graphql-fragments.ts`
  - Shared GraphQL field fragments for space/entity/value/relation reads.
- `src/schema-utils.ts`
  - Schema assertions and query-field checks against `GEO_API_SCHEMA.json`.
- `src/functions.ts`
  - Repo-level helper entry points (`gql`, `publishOps`, `printOps`) built on top of `src/geo-api-client.ts`.

### Demo
- `01_api_demo.ts`
  - Human-readable query examples using shared fragments and variables-first GraphQL.
- `05_read_knowledge_graph.ts`
  - Readiness/health script that checks schema assumptions then executes representative reads.

### Experimental
- `experimental-scripts/crawl-ontology.ts`
  - Ontology and instance discovery workflow.
  - Must consume shared query transport (`gql`) and variables-first query patterns.
- `experimental-scripts/csv-to-json.ts`
  - Data shaping utility (non-query), retained under experimental namespace.

### Agent Tooling
- `~/.config/opencode/tools/geo-api.ts`
  - Global OpenCode helper tool for structured API queries.
- `~/.config/opencode/skills/geo-api/SKILL.md`
  - Global skill guidance for helper-first querying.

## Migration Targets
- Move from interpolated GraphQL strings to variables-first queries in all maintained scripts.
- Keep all endpoint/config handling in shared core (`src/geo-api-client.ts`).
- Prefer shared field fragments from `src/graphql-fragments.ts` for repeated entity/space/value/relation shapes.
- Treat `05_read_knowledge_graph.ts` as the canonical schema + query smoke check entrypoint.
- Keep future query scripts out of project root unless they are demo entrypoints; place exploratory work in `experimental-scripts/`.

## Canonical Commands
- `bun run api:demo` -> runs `01_api_demo.ts`.
- `bun run api:check` -> runs `05_read_knowledge_graph.ts`.
- `bun run api:crawl` -> runs `experimental-scripts/crawl-ontology.ts` using `TARGET_SPACE_ID`.
- `bun run api:schema:check` -> compares `GEO_API_SCHEMA.json` against live introspection.
- `bun run api:schema:refresh` -> refreshes `GEO_API_SCHEMA.json` from live introspection.
- `bun run api:smoke` -> schema check + readiness check + demo query pass.
- `bun run publish:demo` -> runs `02_publish_demo.ts`.

## Schema Snapshot Policy
- `GEO_API_SCHEMA(never_edit).json` is the immutable full-fidelity baseline snapshot.
- `GEO_API_SCHEMA.json` is the lightweight operational snapshot used by current tooling.
- Keep the baseline file unchanged so deep schema details are always available for investigations.
- Continue refreshing only the lightweight file for day-to-day schema drift checks and query guardrails.

## Mapping + Publish Commands
- `bun run map:propose -- --target-space <space-id>` -> create mapping proposals from live `Course`/`Lesson` schema and CSV fields.
- `bun run map:decide -- --action list` -> list unresolved mapping decisions.
- `bun run map:decide -- --action accept|reject|ignore ...` -> persist mapping decisions.
- `bun run publish:courses-lessons` -> build publish ops from approved mappings with schema drift + dedupe guards.

## Current Publish Behavior Notes
- Source defaults are `data_to_publish/courses.csv` and `data_to_publish/lessons.csv`.
- `lessons.Courses` is resolved by cross-file key (mapped to `courses.Course ID`), used for linking not as a published Geo ID.
- `courses.Lessons` supports numbered tokens (`1. ...; 2. ...`) and plain names; ordinals are normalized before link resolution.
- Course->lesson links resolve against both existing entities and lessons created in the same run.
- Agent-mode publishes are blocked on high-similarity fuzzy dedupe hits and logged to `runlog.md`.
- Publish runs include URL reachability checks and taxonomy overlap checks against canonical AI space entities.
