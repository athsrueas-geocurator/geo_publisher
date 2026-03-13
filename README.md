# Geo SDK Demo — Outline

## Task Tracking

- Active tooling and repo improvement tasks are tracked in `todo.md` at the project root.
- Before starting new implementation work, review and update `todo.md` so priorities and progress stay aligned.

## Query Tooling Map

- Architecture and ownership: `docs/query-tooling-architecture.md`
- Shared query client/fragments: `src/geo-api-client.ts`, `src/graphql-fragments.ts`
- Schema snapshot policy:
  - `GEO_API_SCHEMA(never_edit).json` is the full baseline snapshot and must remain unchanged.
  - `GEO_API_SCHEMA.json` is the lightweight working snapshot and may be refreshed as API shape evolves.
  - Use the baseline file when you need deep introspection detail (enum/input/directive/type metadata).
- Canonical query commands:
  - `bun run api:demo`
  - `bun run api:check`
  - `bun run api:crawl`
  - `bun run api:schema:check`
  - `bun run api:schema:refresh`
  - `bun run api:smoke`

## Schema-First Publish Workflow

- Full workflow reference: `docs/schema-mapped-publishing.md`
- Content policy reference: `docs/geobrowser-content-policy.md`

- Generate mapping proposals from live type schema + CSV headers:
  - `bun run map:propose -- --target-space <SPACE_ID>`
- Review/accept/reject mapping proposals:
  - `bun run map:decide -- --action list`
  - `bun run map:decide -- --action accept --type lesson --field "Topics"`
  - `bun run map:decide -- --action reject --type course --field "Provider"`
- Configure relation resolution rules (mode/creation/cross-file/manual map):
  - `bun run map:decide -- --action set-relation --type course --field "Providers" --mode by_name --creation create_if_missing --target-type-id 484a18c5030a499cb0f2ef588ff16d50`
  - `bun run map:decide -- --action set-relation --type lesson --field "Courses" --mode by_source_id --creation must_exist --cross-target-set course --cross-target-key course_id`
- Dry-run schema-gated publish (blocks on pending decisions and schema drift):
  - `bun run publish:courses-lessons`
- Run content policy checks only:
  - `bun run policy:check`
- Enforce warning-level policy gate during publish (optional):
  - `bun run publish:courses-lessons -- --strict-policy-warnings`
- Publish on-chain only after review:
  - `bun run publish:courses-lessons -- --publish`
- DAO note: publishing to a DAO space submits a proposal/edit; entities may only appear after DAO approval/application.
- Undo last publish set (from generated ops file):
  - `bun run undo:courses-lessons -- --publish`
- Add a Learn tab like AI space (clickable tab with course collection):
  - `bun run ui:learn-tab -- --publish`
- CLI walkthrough/help:
  - `bun run geo:help`

## Prerequisites (before the demo)

- `.env` configured with `TARGET_SPACE_ID`, `PK_SW`
- `bun` installed, dependencies available
- A personal space on testnet to publish to
- Geo Browser open in a tab: `https://geobrowser.io/space/<TARGET_SPACE_ID>`
- See GRC-20 spec at: [https://github.com/geobrowser/grc-20/blob/main/spec.md](https://github.com/geobrowser/grc-20/blob/main/spec.md)

---

## Part 1: Overview — What We're Building

- Walk through the **knowledge graph model**: entities, types, properties (values and relations)
- Show the JSON input files in `data_to_publish/` — this is the data we'll publish:
  - `topics.json` — simple entities (name + description only)
  - `people.json` — entities with typed values (web_url, birth_date) and topic relations
  - `projects.json` — entities with text blocks, avatar images, and topic relations
- Explain the goal: turn this flat JSON into a rich, interconnected knowledge graph on-chain

## Part 2: Walk Through `02_publish_demo.ts`

### 2a: Ontology IDs and the Property Registry

- Show the `TYPES` and `PROPERTIES` constants — these are well-known IDs from the root space ontology
- Highlight the **property registry** pattern (`VALUE_PROPERTIES` + `extractValues()`)
  - Adding a new property to the demo = one line in the registry, no other code changes
  - Date values are RFC 3339 strings (e.g. `"1994-01-31"`) — the SDK parses them internally

### 2b: Creating Entities — `Graph.createEntity()`

- **Topics** (Step 2) — simplest case: just `name`, `description`, and `types`
  - Returns `{ id, ops }` — the ID is a 32-char hex UUID, ops are the low-level operations
  - We collect all ops into `allOps` to publish in a single batch
- **People** (Step 3) — adds **values** (web_url, birth_date) and **relations** (topics)
  - Show how `extractValues()` builds the values array from JSON fields
  - Show how topic relations are built: `Record<relationTypeId, Array<{ toEntity }>>`
- **Projects** (Step 4) — same pattern, demonstrating reusability of the approach

### 2c: Content Blocks — Text, Images, Data

- **Text Blocks** (Step 5) — each block is its own entity attached via a Blocks relation
  - Blocks relation uses `position` (fractional indexing via `Position.generateBetween()`) for ordering
  - Content is markdown stored in the `markdown_content` property
  - Content comes from the `blocks` array in `projects.json`
- **Avatar Images** (Step 5b) — `Graph.createImage()` handles IPFS upload automatically
  - Returns an Image entity with IPFS CID, width, height
  - Attached to the parent via `ContentIds.AVATAR_PROPERTY` relation
- **Data Blocks** (Step 6) — two flavors:
  - **Query Data Block** — a live filter evaluated at render time (show the filter JSON structure)
  - **Collection Data Block** — a hand-picked set of entities via `collection_item` relations
  - Both support **Views** (Table, List, Gallery, Bullets) set on the relation via `entityRelations`

### 2d: Publishing

- All operations are batched into a single `allOps` array
- Show the ops summary (operation count breakdown by type)
- `publishOps()` handles everything:
  - Queries the API to determine space type (personal vs DAO)
  - For personal spaces: `personalSpace.publishEdit()`
  - For DAO spaces: resolves caller's member space from members/editors list, then `daoSpace.proposeEdit()`
  - Sends the transaction via the SDK's `getSmartAccountWalletClient` (gasless on testnet)

### 2e: Run It

```bash
bun run 02_publish_demo.ts
```

- Watch the console output walk through each step
- Open Geo Browser and verify the published entities appear in the space

---

## Part 3: Querying — Walk Through `01_api_demo.ts`

- Uses the **Geo GraphQL API** (`https://testnet-api.geobrowser.io/graphql`)
- Key API notes to mention:
  - UUID scalar types (32-char hex, no dashes)
  - `UUIDFilter` uses `is`/`isNot` (not `equalTo`)
  - Top-level `spaceId` and `typeId` args are convenient shortcuts

### Demo 1: Get Space Information
- `space(id:)` query — returns type, address, page entity

### Demo 2: List Entities in a Space
- `entities(spaceId:)` with ordering (`UPDATED_AT_DESC`) and filtering (`name isNull: false`)

### Demo 3: Filter by Type
- `entities(typeId:)` — show all Type definitions in the root space

### Demo 4: Entity Details — Values and Relations
- Query `values` and `relations` for a specific entity
- Show how property names resolve via `propertyEntity { name }`

### Demo 5: Query Your Target Space
- Point at `TARGET_SPACE_ID` — shows the entities we just published

### Demo 6: Backlinks
- Reverse relation query: `relations(filter: { toEntityId: ... })` — who references an entity?

### Run It

```bash
bun run 01_api_demo.ts
```

### Bonus: Schema-backed reader (`05_read_knowledge_graph.ts`)

- Reads the bundled `GEO_API_SCHEMA.json` to verify the root `Query` fields (`space`, `entities`, `values`, `relations`, etc.) and ensure the arguments we rely on are defined before any live requests.
- Executes a curated set of live reads (space info, recent entities, type definitions, schema values, and backlinks) to prove the GraphQL endpoint and tooling are still reading the knowledge graph correctly.
- Run it with `bun run 05_read_knowledge_graph.ts` whenever you want a quick health check before publishing data.

---

## Part 4: Cleanup — `03_delete_demo.ts`

- Reads the saved ops from `data_to_delete/demo_publish_ops.txt` (written by the publish step)
- Generates inverse operations:
  - `Graph.updateEntity({ unset })` for property values
  - `Graph.deleteRelation()` for relations
- Publishes the delete ops using the same `publishOps()` helper

```bash
bun run 03_delete_demo.ts
```

---

## Key Takeaways

1. **Everything is an entity** — types, properties, blocks, images, data blocks are all entities with relations
2. **SDK builds ops, you publish them** — `Graph.*` methods return ops arrays; batch them and publish once
3. **Ontology IDs are the glue** — type and property IDs from the root space define the schema
4. **Content model is composable** — text blocks, data blocks, and images attach to any entity via the Blocks relation
5. **Publishing is space-aware** — personal spaces publish directly; DAO spaces go through a proposal / governance flow
