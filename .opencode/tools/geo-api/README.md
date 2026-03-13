# Geo API Tool

This tool wraps the Geo Browser GraphQL endpoint with validated helpers so you can explore spaces, topics, and relations without reconstructing the filter syntax yourself.

Use this tool as the default API discovery path before editing publish scripts. The workflow is:

1. Find the target space (`searchSpaces`, then confirm with `spaceInfo`).
2. Resolve the type IDs you care about (`findTopic` against the root/type space).
3. Pull full schema details for that type (`typeSchema`) from the schema space.
4. If your source has CSV/JSON fields, pass `sourceFields` to `typeSchema` to get fuzzy mapping proposals.
5. Explicitly review and accept/reject each proposal before updating publish code.

Project scripts that close this loop:

- `bun run map:propose -- --target-space <SPACE_ID>`
- `bun run map:decide -- --action list`
- `bun run map:decide -- --action accept --type lesson --field "Topics"`
- `bun run map:decide -- --action set-relation --type lesson --field "Courses" --mode by_slug --creation must_exist --cross-target-set course --cross-target-key course_id`
- `bun run publish:courses-lessons` (dry run with schema drift guard)
- `bun run geo:help` (CLI walkthrough)

## Helpers

- `spaceInfo`: fetches metadata about a single space by UUID.
- `listEntities`: lists entities within a space (optionally filtering by type).
- `searchSpaces`: looks up spaces by type/topic and optional keyword.
- `findTopic`: searches entities by name with optional space/type filters.
- `entityRelations`: shows relation/backlink nodes for a specific entity.
- `typeSchema`: reads values/relations for a type in a schema space and can propose fuzzy source-field mappings.

Each helper also declares a Zod schema so invalid UUIDs, page sizes, or missing arguments are caught before the request is sent.

## Running

Use the `helper` flag to call one of the presets and provide any `helperArgs` that the helper schema requires. Example:

```bash
/.bun/bin/bun run .opencode/tools/geo-api/tool.ts --helper searchSpaces --helperArgs '{"term":"AI","type":"PERSONAL"}'
```

When you need to send an arbitrary GraphQL document instead, supply `--query`, `--variables`, and (optionally) `--operationName`.

Example for schema + mapping proposal:

```bash
/.bun/bin/bun run .opencode/tools/geo-api/tool.ts --helper typeSchema --helperArgs '{"typeId":"ae724b5687254a098d7ea542bc587ebd","schemaSpaceId":"a19c345ab9866679b001d7d2138d88a1","sourceFields":["course_name","overview","lessons","skills","website"]}'
```

## Hardcoding Policy

- Do not hardcode Course/Lesson property/relation IDs in publish flows unless explicitly frozen for a migration.
- Default behavior should derive live schema from API calls (`typeSchema`) and then map source fields to that schema.
- Keep mapping decisions auditable: proposals are suggestions only and require user acceptance/rejection.

## Handling Failures

If the API returns errors (validation failures, rate limits, schema changes, etc.), log the response (including `errors`/`status`) alongside your reproduction steps and report back to the user. Mention whether the helper needs new arguments, relaxed validation, or a different query to accommodate the updated schema. Suggest edits to the tool (e.g., adjust the GraphQL fragment, update the Zod schema, add a new helper) and, if the problem seems recurring, add a note to `.opencode/skills/geo-api/SKILL.md` explaining how agents should handle that class of failure.
