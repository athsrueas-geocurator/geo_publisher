# Shared education collection workflow

Use this path for **new Dataset collections of existing, reviewed factual Claims**. It prepares files only and never submits a transaction. Data publishing is currently paused at the user's request. Do not resume signing merely because preparation passes.

This is deliberately separate from source extraction, Claim creation/repair, debate adjudication, outreach schema and edits to an existing Dataset. Those need reviewed deltas; do not force them through a collection-creation engine. Existing submitted builders and journals are historical evidence and must not be replayed.

## Inputs

Keep inputs under `data/education/`; source evidence can also live under `docs/`. The types in `src/education-collection.ts` define the exact plan/fact shape. `scripts/education-test-workflow.ts` provides a complete **synthetic, nonpublishable test example**, not research evidence.

1. **Plan JSON:** `version: 1`, unique `key`, `spaceId`, `bounty`, reviewed Dataset `name`, concise `description`, Markdown `notes`, existing `sourceIds` (Articles), `relatedIds`, existing destination `catalogId`, and ordered `groups`. Each group has a unique key, name, columns (`id`, live `dataType`) and existing Claim member IDs. Members must be unique across groups; multiple representations of one result must not imply independent studies.
2. **Source-facts JSON array:** one record per member, independently transcribed/reviewed from the source. Each has `id`, `sourceId`, exact published `locator`, `classification` (`observed`, `modeled`, `study-design`), `context`, exact `name`, exact concise `description`, and `values`. Context records population/comparator, outcome/timepoint, estimand, units and uncertainty boundaries. Each value specifies `propertyId`, `field` (`text`, `decimal`, `integer`, `boolean`) and literal `value`. Numeric values are strings, not JavaScript numbers. The exact `name` and `description` fields are checked separately from displayed property columns. The current workflow requires all displayed columns to have reviewed values; do not fill unknown cells with zero to satisfy it. Use optional `missingPropertyIds` for properties the source explicitly does not report; the live comparison then proves those properties remain absent. A reviewed study-design context row may opt into `allowUnlocatedContext: true` in the plan, use `classification: "study-design"`, omit effect columns, and omit a locator only when the source review explicitly supports that context row. This does not permit missing values on observed or modeled findings.
3. **Discovery JSON:** `checkedAt`, `scope: "all-spaces"`, `datasetDecision: "create"`, rationale and `searches`. Each search records kind (`alias` or `identifier`), actual query, `complete: true`, and candidates with ID, `decision: "distinct"`, and source-space/identity rationale. Include both search kinds. A matching Dataset candidate means reuse/delta work, not creation. Store actual query outputs alongside this artifact; an agent-written `complete` boolean is not proof the query ran. Preparation additionally checks incoming collection membership for every Claim across all spaces.
4. **Review JSON:** shown below. It binds exact plan/facts hashes, source/version evidence and discovery. Source, identity and content are separate recorded judgments; none may be inferred from a green payload test.

```json
{
  "version": 1,
  "checkedAt": "ISO timestamp of actual review",
  "reviewer": "agent or reviewer identifier",
  "planHash": "SHA-256 of exact plan bytes",
  "factsHash": "SHA-256 of exact source-facts bytes",
  "sources": [{
    "sourceId": "existing Article ID",
    "version": "exact report/manuscript version and date",
    "path": "docs/reviewed-study-notes.md",
    "sha256": "SHA-256 of exact evidence bytes"
  }],
  "discovery": {"path": "data/education/example-discovery.json", "sha256": "SHA-256"},
  "decisions": {
    "source": {"status": "accepted", "rationale": "What source locations and units were reconciled"},
    "identity": {"status": "accepted", "rationale": "Why candidates are distinct and existing Claim IDs are reused"},
    "content": {"status": "accepted", "rationale": "Header readability, description brevity, table grouping and interpretation review"}
  }
}
```

Placeholders above are intentionally invalid until genuine reviewed evidence replaces them. Do not manufacture review timestamps or duplicate payload values into a purportedly independent source table.

## Commands and output

From the publisher repository:

```powershell
bun run education:test-workflow
bun run education:check-readiness
bun run typecheck
bun run education:build-collection --plan data/education/example-plan.json --facts data/education/example-facts.json --review data/education/example-review.json
bun run education:status
```

The builder checks source-fact/live equality, source/Claim types, complete cross-space incoming memberships, live column/schema types, unused allocated IDs and catalog ordering. It refuses a submitted prefix. IDs and SDK-generated positions are persisted. Changed catalog anchors or incompatible ordering require a newly reviewed position snapshot; do not delete journals to rebuild. Files use `<key>-registry`, `-positions`, `-before`, `-ops`, `-batch`, `-validation` and `-review-binding` suffixes.

`publisherVersion: "collection-v1"` batches carry a hash-bound review artifact. The existing submission command verifies its evidence bytes before new signing; altering reviewed inputs invalidates the binding. Do not remove this field or send the operations through a legacy entry point to bypass checks. After any content change, repeat the affected source/content review and build. The shared readiness gate also requires a fresh real preflight and payload validation. Legacy batch preparation is not retroactively certified by this workflow.

When the user resumes publishing, use the existing submission/vote/verification path with the generated batch. Run `bun run education:verify-collection --batch data/education/example-batch.json` for ordered membership and preservation checks against `-before.json`; the command retains the older verifier filename for compatibility. Read all table pages and verify a dedicated Claim page before declaring the batch complete. Snapshot equality checks do not prove source accuracy or rendered usability.

## Status report boundaries

`education:status` reads the field ledger, journals, operation hashes and saved index reports. It reports submission, recorded execution and bounty transactions separately; exposes index report scope/date/hash-binding; flags unchecked queue lines that mention executed proposals for review; and lists prepared-only batches. A prepared batch with a matching variant journal such as `-pilot-publication.json`, `-expansion-publication.json` or `-repair-publication.json` is reported as superseded, not as a pending import. For `collection-v1` batches, missing, failed or unbound index evidence is a failing condition; legacy reports retain their historical unbound status for review. It neither marks queue items complete nor equates missing mappings with absent Geo entities. Its results are historical/local evidence, not a fresh chain/browser audit. Malformed files and hash mismatches return a failing exit status rather than disappearing from totals.

`education:audit-prepared` is the compact handoff check for every collection/catalog batch and every repair validation that declares an operation count: it verifies the operation hash, validation/review binding, additive operation shape for current repairs, and publication state. Older repair artifacts without the standardized operation-count field are listed explicitly as excluded legacy repairs for separate review. It does not sign, submit, vote, or certify source interpretation.

Historical Head Start and Coaching batches are classified as `historical-published` by this audit; their publication receipts and legacy format are expected and are not treated as failures. Newly prepared drafts must pass all four checks as `prepared-only`.

## Remaining judgment and engineering limits

- A source-evidence hash proves which bytes were reviewed, not that the reviewer interpreted them correctly. Study-version, causal interpretation, units and semantic identity still require actual review.
- The workflow validates existing scalar facts and creates collection structure. It now supports explicit reviewed missing-value assertions through `missingPropertyIds`. It does not yet replace all legacy publication families or implement existing-collection deltas, Claim creation or metadata repairs.
- Status inspection can nominate stale queue items, but mixed acceptance conditions still require reconciliation. It does not automatically populate the original field ledger or infer frontend integration from publishing.
