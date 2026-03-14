## Geo API Tool Evolution

This folder now hosts the helpers and notes that let us query the Geo Browser without endlessly guessing filter syntax. The goal has been to build a single tool that reflects what the CLI demos already know about the schema and SDK, so you can ask about `spaces`, topics, and relations with predictable arguments.

### Initial Attempts
- Early work iterated directly against `curl POST https://testnet-api.geobrowser.io/graphql` calls and the raw schema (`GEO_API_SCHEMA.json`). That required trial-and-error, e.g.

```bash
curl -s -X POST https://testnet-api.geobrowser.io/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ spaces(filter: { name: { contains: \"crypto\" } }, first: 20) { ... } }"}'
```

- Those requests failed with validation errors (`Field "name" is not defined by type "SpaceFilter"`), so we kept trying different operators (`includesInsensitive`, `is`, etc.) before landing on allowable filters.

### Tool Refactor
- The global `~/.config/opencode/tools/geo-api.ts` tool imports `@opencode-ai/plugin` and defines helpers that know their own GraphQL queries, Zod argument schemas, and post-processing:
  - `searchSpaces`: keyword/type filters for the Schema `spaces` query.
  - `findTopic`: uses `EntityFilter` + `includesInsensitive` to locate topic names without guessing filters.
  - `entityRelations`: surfaces relations/backlinks for any entity, which mirrors what `@geoprotocol/geo-sdk` scripts already expect from the API.

- Each helper validates inputs (`UUID`, pagination limits) and returns structured JSON, so you don’t have to parse `curl` output yourself.

### Latest Results
- Running the helper-style queries made the new task trivial. For example, to find the Health space we ran a Python script equivalent to `searchSpaces`:

```bash
python - <<'PY'
import json, urllib.request
query = """{ spaces(first: 250) { id page { name description } } }"""
# … filter for "health" in name/description, collect space IDs
PY
```

- With the Health space ID (`52c7ae149838b6d47ce0f3b2a5974546`) in hand, we used `findTopic` (or the equivalent GraphQL call) to locate “Cushing’s Syndrome”:

```bash
python - <<'PY'
import json, urllib.request
query = """{ entities(filter: { name: { includesInsensitive: \"Cushing’s Syndrome\" }, spaceIds: { is: [\"52c7ae149838b6d47ce0f3b2a5974546\"] } }, first: 5) { id name spaceIds } }"""
# … parse response and discover entity `0f4dc3471c0443fdbdda4be78d5e5b04`
PY
```

- The global helper file now captures that workflow, so future searches only require specifying helper name + arguments instead of reconstructing queries from the schema.

### Looking Forward
- We can extend the tool with more helper presets (e.g., `spaceContent`, `topicRelations`) and even call into the Geo SDK constants for ID validation. This story should serve as a single source for why `~/.config/opencode/tools/geo-api.ts` is organized the way it is and how to operate it.

### Schema-first publishing updates
- The helper set now includes `typeSchema`, which reads values/relations for a type within a schema space and optionally performs fuzzy source-field matching.
- Publishing flows should prefer schema discovery + reviewed mappings over hardcoded Course/Lesson property IDs.
- Mapping proposals are intentionally non-final; they must be reviewed and explicitly accepted/rejected before publish logic is changed.
