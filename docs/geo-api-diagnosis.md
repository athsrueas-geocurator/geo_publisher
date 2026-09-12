# Geo read failures: diagnosis

Checked 2026-09-11 against SDK 0.20.1, the pinned geo-query skill, live GraphQL introspection and [official OpenAPI](https://api-testnet.geobrowser.io/openapi). Raw query bodies, elapsed times, responses and errors are in [geo-read-diagnostics.json](geo-read-diagnostics.json). Reproduce with `node scripts/diagnose-geo-reads.mjs` from the publisher root; this only reads public API data and overwrites the diagnostic report. It does not load `.env` or import wallet/publishing helpers.

## Confirmed query bug: null comparison

The live `StringFilter` documentation defines `isNull: false` as the non-null predicate. `isNot` compares against a value; it is not the null test. On the same target space, `name: { isNot: null }` returned zero rows in 178 ms; `name: { isNull: false }` returned five named entities in 4,620 ms. The earlier empty result was a query mistake, not evidence of missing data or inconsistent indexing.

Corrected all six occurrences in `09_publish_courses_lessons.ts`, `src/prepublish-checks.ts` and `experimental-scripts/crawl-ontology.ts`. This matters especially for duplicate detection: a false empty index can hide existing entities. Cross-space scope and pagination limitations are separate remaining work.

## Confirmed latency and distinct timeout layers

| Probe | Result | Elapsed |
| --- | --- | ---: |
| Space lookup | Success, DAO | 1.2 s |
| Cursor connection, five nodes, no count | Success, next-page cursor | 5.4 s |
| Cursor connection, five nodes with count | Success, totalCount 86 | 11.7 s |
| Five entities with nested type names | Success | 2.9 s |
| Five entities at offset 25 | Success | 26.0 s |
| Cross-space exact university name | Three candidate IDs in three spaces | 0.6 s |
| Single global substring, five results requested | Success, zero matches | 0.2 s |
| Original 100-node inventory with count/descriptions/types | HTTP 200, GraphQL INTERNAL_SERVER_ERROR | 30.2 s |
| Original five-term global OR substring search, first 50 | HTTP 200, GraphQL INTERNAL_SERVER_ERROR | 30.2 s |

Both original server failures reproduced. They are resolver/runtime errors, not GraphQL unknown-field validation errors or authentication failures. Their repeatable approximately 30-second duration strongly suggests a server-side query deadline or database execution timeout. That internal mechanism remains an inference: server logs/query plans are not available, and the API only exposes `Unexpected error.`. These measurements do not establish a rate limit or prove which selected field dominates cost.

The previous PowerShell request limit was 25 seconds; a valid offset query took longer than that. The shared TypeScript transport has a separate 15-second timeout. Neither should be interpreted as an empty result. Fixed its timeout classification to recognize `TimeoutError` from `AbortSignal.timeout`, as well as `AbortError`; the timeout duration is unchanged. Raising a client timeout alone will not solve the reproduced server errors.

The earlier PowerShell loop also continued after a request error and printed `COUNT=0`. That was diagnostic-script error handling, not a returned empty API page. Use fail-fast handling and inspect GraphQL errors before reading or counting data.

## SDK and documentation findings

Installed SDK `GeoTestnetConfig.apiOrigin` matches `https://api-testnet.geobrowser.io`. The [official SDK README](https://github.com/geobrowser/geo-sdk) documents configured clients and identifies the Geo skills as usage guidance. The endpoint spelling is correct; switching to the older host is not an evidence-based fix.

The installed SDK's `geo.api.graphql(query)` sends a low-level request and returns the full envelope, including GraphQL errors. It does not make costly queries efficient or infer entity reuse. Callers must inspect errors even when HTTP status is 200. This repository's `geoGraphqlRequest` already rejects GraphQL errors; the ad hoc PowerShell probes did not consistently enforce this distinction.

The vendored skill correctly distinguishes flat lists from connections and recommends cursor pagination and smaller pages. Its `StringFilter` reference includes `isNull`, but the older repository scripts used the wrong predicate. The live schema and measured behavior take precedence over example assumptions.

## Verified working approach

- Inventory with small cursor pages and minimal fields. Avoid `totalCount` on every page; use `hasNextPage` and detect repeated/missing cursors. Fetch detailed facts only for selected IDs. A working first page is not complete inventory evidence.
- Search cross-space candidates with separate exact-name/identifier queries first, then bounded aliases or narrower searches. The successful exact-name probe returned three distinct university IDs across different spaces, illustrating why identity review is still necessary.
- For broad text discovery, the official REST `/search` endpoint supports `scope=GLOBAL`, `include_non_canonical=true`, `limit` up to 100 and `offset` up to 1,000. Set non-canonical inclusion explicitly; verify candidates by ID and space-specific facts. Do not mistake ranked search for exhaustive duplicate detection.
- A live REST search for `What Works Clearinghouse` returned promptly with loosely related token matches and total 10,000; those results are not verified identity matches. The single GraphQL substring query returned zero at this time, which also does not rule out alternate names/identifiers.
- Never convert a timeout, GraphQL error, failed page, truncated search or uncertain identity into permission to create an entity.

## Verification

`bun run typecheck` passed after the six predicate corrections and timeout fix. `bun test scripts/geo-api-client.test.mjs` passes five offline tests covering HTTP-200 GraphQL errors, non-OK/invalid/missing-data responses, both timeout names and preservation of the non-null predicate in variables. Live probes established the query behavior separately from those tests. No publishing, SDK upgrade, upstream skill edits or secret access was needed.
# Relation-filter field correction — 2026-09-12

Live schema introspection of `RelationFilter` shows the relation-kind field is `typeId`, not `relationTypeId`. A CCD catalog-block builder using `relationTypeId` received a GraphQL validation error before it generated an operations payload or submitted a transaction. The builder now uses `typeId`; retain `spaceId` alongside it when checking a destination-scoped relation. This is a schema/API field-name correction, separate from the SDK operation format.

# Unordered relation position verification — 2026-09-11

The SDK omits `position` on unordered createRelation operations; Geo's API returns `position: null` for these relations. Strict comparison of API null against omitted JavaScript undefined falsely failed all nine Reading First program relations despite their matching IDs, relation-entity IDs, endpoints and spaces. `scripts/education-inspect-program-relations.ts` records direct evidence in `data/education/reading-first-program-relation-inspection.json`.

The publication verifier now compares API position against `op.position ?? null`. Explicit positions still require exact equality; this does not ignore arbitrary ordering differences. The program batch passes all 16 checks after the correction. No duplicate relation or corrective publication was needed. Ordered tables should continue to use persistent explicit positions.

# Relation-connection verification correction — 2026-09-12

To verify a published Claim's outgoing argument edges, query `relationsConnection` with `filter: { fromEntityId: { is: $id }, spaceId: { is: $space } }`. A probe that used `relations(filter: { fromEntity: { is: $id } })` was rejected because `EntityFilter` has no `is` predicate; it was a malformed verification query, not a missing relation or an API outage. The corrected query returned the TFA/Teaching Fellows debate parent, all six Supporting edges, and no Opposing edges after the scope repair.

# Entity lookup correction — 2026-09-12

The Geo GraphQL `entities` field does not accept an `ids` argument. A pre-publication Head Start context check using `entities(ids: $ids)` was rejected by GraphQL validation before operations were generated. Use aliased single-entity selections such as `article: entity(id: $article)` when a compact multi-identity check is needed. The corrected builder passed typecheck, preflight, publishing, bounty linking, and Fast Path voting.

# Entity relation-field correction — 2026-09-12

`relationsConnection` is a root query field, not an `Entity` field. A Head Start IOT/ITT verification attempt that nested it under `entity(id:)` failed schema validation before reading any graph data. Query the bounded root `relationsConnection` alongside `entity(id:){ values(...) }`, using `fromEntityId` and `spaceId` filters; do not interpret the schema error as an empty edge set or create a replacement edge.

The corrected read verifies every IOT Claim’s factual checkbox, `Treatment on the treated (IOT)` estimand, and Related link to the appropriate existing ITT Claim. Evidence: `data/education/head-start-third-grade-iot-verification.json`.

# Saga relation-filter discrepancy — 2026-09-12

Direct destination-space reads of first-year Saga Claims `022d596aadaf40709f4e0c2f04db8c8a`, `3f178d30985c477094dbdd90937d8268`, and `36570925385b495e9de1777b82d01b9b` each return the expected outgoing Related edge to the corresponding Saga Study (`6ff69ada18b54b1db98375da1b90df65` or `86c407ce9e7e49819e1cd8d07b20f4c8`) and the expected Article edge to `8812b3d57a4c4221a10c1024557a764a`. A paginated `entitiesConnection` dashboard query using the same destination space, Claim type, Study relation predicate, and Article predicate instead returned 61/46 other Saga rows and omitted all 32/30 checked first-year IDs.

This is reproduced read behavior, not missing relations or permission to recreate them. The other returned rows include later and pooled representations that legitimately reuse the Article and Study. Keep the main dashboard verifier on its passing source families; design Saga retrieval around its already passing table-specific queries (`saga-outcomes-query.graphql`, `saga-pooled-query.graphql`, `saga-year2-query` and `saga-later` verification) until the broader relation-filter query can be minimized and reproduced against the live schema. Preserve a separate follow-up/table filter so alternate horizons and estimands do not become one comparison series.

# Shared client error contract — 2026-09-12

The shared `geoGraphqlRequest` client has offline coverage for HTTP 200 with GraphQL errors, non-OK HTTP responses, invalid JSON, missing `data`, and both `AbortError`/`TimeoutError`. All raise `GeoApiRequestError`; callers must not turn a failed page into an empty result. `bun test scripts/geo-api-client.test.mjs` passes five tests. This is transport behavior only; pagination completeness and semantic identity remain caller responsibilities.
