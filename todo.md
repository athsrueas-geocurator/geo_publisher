# API Query Tooling Improvement TODO

## Tooling Architecture
- [x] Define a single query architecture doc that classifies files as `core`, `demo`, `experimental`, and `agent-tooling`, including migration targets for each existing file.
- [x] Extract a shared query core in-repo (typed request/response, error normalization, endpoint/env config) and make `01_api_demo.ts`, `05_read_knowledge_graph.ts`, and `experimental-scripts/crawl-ontology.ts` consume it.
- [x] Standardize GraphQL construction to variables-first (no direct string interpolation for IDs/filters) and centralize reusable fragments for `space`, `entity`, `relations`, and `values`.
- [x] Convert schema handling into a repeatable flow: add a schema refresh/check script around `GEO_API_SCHEMA.json` and `src/schema-utils.ts` so helper args/fields are validated against current API shape.
- [x] Document schema snapshot split: keep `GEO_API_SCHEMA(never_edit).json` immutable as full-detail baseline, and treat `GEO_API_SCHEMA.json` as the lightweight refreshable working snapshot.
- [x] Fix script/entrypoint hygiene in `package.json` (remove stale script names, add explicit query tooling scripts such as `api:demo`, `api:check`, and `api:crawl`).

## Global OpenCode Migration
- [x] Promote the Geo API helper to global custom tools at `~/.config/opencode/tools/geo-api.ts` (or split into smaller focused tools if preferred).
- [x] Keep helper presets (`spaceInfo`, `listEntities`, `searchSpaces`, `findTopic`, `entityRelations`) and add explicit pagination controls, endpoint override support, and a debug payload mode.
- [x] Create a global skill at `~/.config/opencode/skills/geo-api/SKILL.md` with YAML frontmatter (`name`, `description`) and a strict runbook: helper-first, raw query second.
- [x] Add global command shortcuts in `~/.config/opencode/commands/` (for example `/geo-space`, `/geo-find-topic`, `/geo-backlinks`) for common workflows.
- [x] Add/update `~/.config/opencode/opencode.json` only if needed for tool permission policy, while keeping project `.opencode` lean.

## De-Scattering and Cleanup
- [x] Decide canonical location policy: one source of truth for Geo API helper logic (global tool only; repo-local helper removed).
- [ ] Keep exploratory scripts behind an experimental boundary and make them import shared query core instead of carrying independent GraphQL logic.
- [x] Update docs so `README.md` and `experimental-scripts/docs.md` point to the same canonical query paths and commands.
- [x] Add a quick smoke matrix command that runs schema check, readiness checks, and demo script to catch drift early.
