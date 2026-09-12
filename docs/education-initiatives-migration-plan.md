# Education Initiatives migration plan

Prepared 2026-09-11 from the [working handoff](education-initiatives-handoff.md), after fast-forwarding geo-publisher to `42c644a`; corrected 2026-09-12. This remains the migration-plan baseline. Its execution-status section records later verified publication work; it must not be read as proof that the full 321-record migration is complete.

## Verified baseline

Source: [Education-Initiatives commit 3cd97449ce9ca73cccb77efe22aac69cc56131e5](https://github.com/athsrueas-geocurator/Education-Initiatives/tree/3cd97449ce9ca73cccb77efe22aac69cc56131e5). Read the JSON, `src/lib/content-schema.ts`, `src/lib/content-loaders.ts`, and `scripts/generate-geobrowser-csvs.mjs` at this revision.

| Collection | Records | Identity proposal |
| --- | ---: | --- |
| Initiatives | 76 | Numeric source ID; retain slug as route/alias |
| Sources | 106 | Source `id` |
| Comparisons (`dichotomies`) | 21 | Registered source slug; preserve aliases on rename |
| Methods | 51 | Registered `(section, item)` pair |
| Glossary | 59 | Registered `(section, term)` pair |
| Landing cards | 8 | Assign persistent migration key in registry |
| Total | 321 | Excludes auxiliary ontology/provenance entities |

Read-only source checks found no duplicate initiative IDs/slugs, source IDs, comparison slugs, method pairs, or glossary pairs, and no dangling source/initiative/comparison references across the six collections. This is not full schema or semantic validation. The separate research dataset catalog contains 18 records.

The existing exporter omits glossary and initiative numeric IDs. It generates landing-card identity from truncated, editable claim text, joins arrays into text, and leaves Geo IDs blank. Treat it as a reference, not a lossless migration implementation. Preserve both directions of initiative/comparison links: their source lists express different selections and must not be assumed reciprocal.

## 1. Freeze inputs and scope

Publisher: save the pinned source files, per-file hashes, schema version, counts, and reference-edge inventory in a migration manifest. Validate every row using the source schema and report duplicate keys, unresolved links, empty fields, and continuum range/order issues. Preserve empty years as missing, never zero or an inferred date.

Proposed first release includes all six core collections. Defer the 18-record research catalog and bulk research assets to a separate mapping; record this exclusion and omit dependent dashboard views until their contract is agreed. Existing source citation URLs remain in scope. Snapshot counts describe source records, not the final number of Geo entities or operations.

Deliverable: source manifest and validation report, with every record included or explicitly excluded.

## 2. Establish the destination and ontology

Publisher: use the vendored Geo Explorer skills and schema-first reads. The active publication destination is Education datasets `dac259bad48a11adf97fe36857d85206`; `ec349623f33236aee13c12dcd629ee81` owns the separate Education dashboard bounty. A destination proposal must be followed by a personal-space bounty Submission relation for `debce2de46094f299ee8e89fe244a9dc`. The live destination is a DAO, and the configured signer is an editor using Fast Path; revalidate authority before every publication. See the [dataset inventory](education-initiatives-dataset-inventory.md). Resolve API compatibility using installed SDK `@geoprotocol/geo-sdk` 0.20.3 and the configured GraphQL endpoint; older endpoint observations are not compatibility evidence.

Discover existing types/properties/relations with source-space provenance, value types, cardinality, and schema fingerprints. Avoid reusing Course/Lesson mappings or assuming the AI taxonomy fits education. Record each mapping as accepted, pending, or excluded with a reason. Any required ontology extension remains a proposal until authorized.

| Source field group | Proposed representation; exact Geo IDs pending discovery |
| --- | --- |
| Initiative `id`, `slug`, `name`, `years`, `category` | Source identity/route plus named entity and faithful text values |
| `theoryOfAction`, `inputVariablesChanged`, `targetPopulation`, `evaluationDesigns`, `outputsMeasured`, `normalizationIssues`, `oneLineFinding`, `tags` | Separate named fields; retain original text, including raw tags |
| Initiative `methodTags`, `sourceIds`, `relatedDichotomySlugs` | Ordered/typed relations to shared designs, sources, comparisons |
| Source `id`, `title`, `authors`, `year`, `url`, `finding`, `caveat` | Shared source entity; keep author/year text without speculative parsing |
| Source `method`, `outcomeTags`; all `evidenceStrength` fields | Verified taxonomy links or faithful values; ratings identified as curated assessments |
| Comparison `slug`, `title`, `dek`, `topic`, `philosophicalDisagreement` | Identity, framing and topic fields/relations |
| `continuum.leftPole`, `rightPole`, `position`, `uncertaintyLow`, `uncertaintyHigh`, `confidence`, `explanation` | One attributable curated assessment preserving all seven fields; numeric values are editorial positions, not effect sizes |
| `whatEvidenceSuggests`, `betterQuestion`, `commonMisreadings`, `whatWouldChangeOurMind`, `landingPriority` | Distinct synthesis fields; preserve array boundaries/order and numeric priority |
| Comparison `keyInitiativeSlugs`, `sourceIds` | Explicit initiative/citation relations |
| Methods `section`, `item`, `definition`, `urls`; glossary `term`, `definition`, `section` | Definition entities with grouping and ordered reference URLs where supplied |
| Cards `claim`, `caveat`, `dichotomySlug`, `sourceIds`, `evidenceStrength` | Curated claim entity with limitations, comparison and shared citations; retain display order |

Every mapped fact must remain traceable to repository, commit, file, source key, and field. Keep findings and caveats together. Do not silently correct questionable source classifications; flag them for editorial review with the original preserved.

Deliverable: complete field-to-Geo-ID mapping and unresolved-decision report. No concrete ontology IDs or tested frontend queries have been established by this plan.

## 3. Stable identity and repeatable updates

Persist a crosswalk keyed by dataset, collection, and registered source identity, scoped to the chosen network/space. Store Geo entity ID, source aliases, last published content hash, and reuse/create rationale. Allocate new SDK-compatible IDs once, save them before building operations, and reuse them on every retry. Never incorporate commit hashes, array indexes, or editable claim text into durable identity.

The target-space scope above identifies the publication record, not an entity-identity boundary. Search other spaces as well as the destination, reuse existing Geo IDs, and retain candidate source-space provenance. An empty target-space result never establishes global absence. Search failure or incomplete pagination leaves creation unresolved. Do not copy conflicting facts from other spaces merely because their entity identity is reused.

Register initial method/glossary pairs and card keys; later renames require explicit alias matching. Review canonical IDs and exact/fuzzy duplicate candidates before allocation; titles or shared URLs alone do not prove identity. One source record stays shared across citations.

Persist relation IDs by source entity, mapped relation type, destination, and occurrence where ordering/repeats matter. Compare desired state with current space-scoped facts and last published state. An unchanged rerun must produce zero operations; changed input updates only migration-owned facts. Concurrent edits become conflicts for review. Source removals produce a removal report, not automatic deletion. Never run the Course/Lesson blanking or space-zeroing scripts for this migration.

## 4. Build and prove the read contract

Publisher and frontend: agree public endpoint, network/space, mapping version, ID crosswalk, pagination, ordering, and missing-data semantics before hardcoding queries. Produce variables-first GraphQL query files and real sample responses for initiative lists/filters, initiative detail with citations, and related comparisons; extend to methods, glossary, sources and landing cards.

Scope values and relations as well as entity membership to the intended space. Page nested relationships completely and bound request sizes. Distinguish empty results, partial data, malformed values, transport errors, and conflicting facts. Establish authentication, CORS and provider request limits; do not claim an unverified rate limit. If server filtering is unsupported, document bounded client filtering explicitly.

Deliverable: schema-checked queries, pagination/error fixtures and response-to-source adapter reconciliation. Before publishing, existing entities may prove query mechanics; only indexed migrated entities can prove this dataset contract.

## 5. Dry run, first slice, then full publication

Build a separate Education Initiatives operation generator using shared transport/mapping utilities and `publishOps`, with dry run as default. Save mapping/crosswalk versions, input hashes, operations hash, create/update/no-op counts, dependency graph, unresolved links, duplicate decisions and URL-check results. A dry run must not invoke uploads, wallet creation, signing or transactions.

Choose one initiative whose citations and comparison links pass validation. Compute its dependency closure so included comparisons retain their required citations and initiative references. If this is too large, define a clearly partial integration fixture instead of dropping links silently. Proposed batch order: approved schema dependencies, shared sources/taxonomy, initiative/comparison identities and facts, relations/assessments, then methods/glossary/cards. Set batch sizes from verified API/SDK constraints and serialized byte size, not guessed limits.

Before execution, review concrete target, mapping extensions, operations and applicable authorization. Capture edit IDs, CIDs, transaction hashes and DAO proposal/version references per batch. Check submission, governance application and indexing separately. Reconcile a batch before resuming an uncertain submission; do not blindly resend it.

Existing `publishOps` slow-path execution checks include `yesCount >= 1`; this is not proof that arbitrary DAO quorum/support thresholds passed. Verify that logic against the selected space's governance before using automatic execution. TypeScript passing does not establish transaction correctness.

## 6. Acceptance, recovery and frontend handoff

Re-query indexed content and compare all intended records, fields, ordered lists and relation targets against the manifest, not just total entity counts. Verify a zero-op rerun and a controlled single-field change on the same IDs. Record exclusions, failures and indexing deadlines; missing indexing is not success.

Frontend: render the first initiative with citations/comparisons using runtime reads; verify a subsequently authorized content change appears after indexing and refresh without rebuilding. Preserve loading/empty/unavailable/malformed/upstream-error states and never silently substitute bundled GitHub content. Check browser network destinations directly reach Geo/content gateways. Cloudflare delivery and billing/deployment prerequisites remain in the frontend workspace.

For actual IPFS assets, record CID, MIME type, gateway and persistence owner. An edit CID is not automatically a displayable file URL. Do not upload research assets merely to satisfy the frontend's separate IPFS proof-of-concept requirement.

Keep pre-migration snapshots of touched facts and a batch journal. Recovery uses narrowly scoped compensating operations reviewed against current state, preserving unrelated edits; it cannot erase transaction history. Return manifest, accepted mappings, crosswalk, tested queries, dry-run report and indexed reconciliation evidence through the working handoff.

## Current execution status — updated 2026-09-12

- Remote merge history and local handoff pointers are preserved; SDK is pinned at 0.20.3 and the Geo Explorer skill checkout is used for schema/workflow guidance.
- The plan’s earlier "pending" state is superseded for many individual evidence families. Education datasets has indexed, bounty-linked source-specific Articles, Initiatives, factual Claims, study facets, and linked policy Claims. Exact cross-space discovery, journaled SDK operations, destination Fast Path execution, personal-space bounty links, post-index verification, and dashboard contract checks are recorded per family in the handoff.
- `bun run typecheck` and `scripts/education-verify-dashboard-comparison.ts` pass against live Geo data. The current bounty scan confirms 197 executed, bounty-linked proposals; one historical malformed serialized payload was rejected before submission and is retained only as diagnostic evidence.
- The full source migration remains incomplete. The 321 core records and 18 catalog records still need per-record identity/reuse decisions, and unresolved implementation, taxonomy, catalog, glossary, comparison, and frontend-contract work must not be treated as covered by the published study families.
- As of the latest prepare-only pass, 13 additional result families have typed drafts (341 operations), three previously unmatched catalog resources have metadata drafts plus a three-operation native-catalog extension, and the full local audit covers 36 standardized artifacts. Eight older repair artifacts remain explicitly excluded because they lack the standardized operation-count field. These are hash-bound preparation evidence only; no paused batch is treated as published or indexed.
