# Publisher reliability review — September 12, 2026

The recurring failures are workflow defects, not a reason to assume a particular model can safely remember a growing collection of notes. Smaller agents need a bounded input, explicit expected output and checks that fail before signing. Research interpretation still requires judgment; no current script certifies it.

## Repeated mistakes and evidence

| Failure | Observed examples | Required prevention |
| --- | --- | --- |
| Payload equality mistaken for source correctness | HSLS:09, SSOCS and WWC inherited kindergarten/cohort metadata despite passing operation checks | Review source-derived expected facts separately from generated ops; see [publication review](geo-publication-review.md) |
| Claim was a row label, not a proposition | Saga, STAR and school-finance repairs; typed estimates hidden on dedicated Claim pages | Read title/description alone, then inspect a dedicated Claim page; see [description guidance](education-description-guidelines.md) |
| Overlong descriptions or essential content placed where it does not render | 24 description repairs; Claim blocks hidden by native UI | Two concise sentences; full interpretation at Dataset level; essential finding stays in Claim header |
| Scope/units blurred | Head Start fraction versus percentage-point wording, study-specific policy scope, observed versus modeled returns | Record numeric scale, comparator, estimand, population, timepoint and observed/model classification before writing; see [Head Start notes](head-start-study-notes.md) |
| Weak discovery presented as proof of absence | Old exact-title catalog checks described as alias/URL discovery; destination-only lookup limit | Complete cross-space identifier/alias candidate review; failed/truncated reads stay unresolved |
| Governance and rendering conflated with submission | Bounty coverage counted confirmed submissions as executed; API matches treated as UI evidence | Separate receipts for submission, execution, bounty indexing, payload equality and rendered acceptance |
| Original source assumed reliable | Incorrect source URLs/methods; generated question links fall back to first initiative | Inspect pinned source provenance and converter defaults; preserve version conflicts and hold unsupported fields |
| Progress tracking lagged behind publishing | Original ledger still has 2,600 fields awaiting review despite hundreds of published Claims; old unchecked tasks overlap later completion | Reconcile the original field ledger and canonical queue in the same batch; publication count is not migration completion |
| Too many bespoke scripts and scattered instructions | Per-study builders repeat discovery, validation, formatting and retries | Use the short operator procedure below; next engineering work should consolidate builders, not copy another study's source text |

## Mechanical defect fixed in this review

The shared submission path used `Date.now() - Date.parse(checkedAt) > limit`. Missing/invalid timestamps produce NaN, making that comparison false; future timestamps also passed. Truthy nonboolean ready/member values were accepted. Dry runs previously printed a batch without checking freshness/member readiness.

`src/education-readiness.ts` now requires finite nonfuture timestamps within 15 minutes, literal boolean confirmations, matching payload hash/destination, and a valid personal-space ID. `education-submit-saga.ts` uses the same gate for dry run and publish, and the dry-run output explicitly limits its verification claim. Tests cover 16 rejected malformed/stale/future/mismatched/unconfirmed cases plus valid inputs and the exact age boundary. `bun run education:check-readiness` and `bun run typecheck` pass.

No Geo content was published in this reliability review. Existing submitted payloads/journals were not rewritten. These changes improve mechanical readiness only; the validator does not prove current membership without a real preflight, authorship, source equivalence, search completeness or scientific accuracy.

## Short operator procedure for a simpler agent

1. **Pick one queued, bounded batch.** Read `publishing_queue.md`, the affected design/study note and exact pinned source rows. Name the fields/relationships to reconcile. Do not expand into more studies to avoid unresolved original migration work.
2. **Prepare a source fact table before generating ops.** One row per proposed fact: original key, exact source/version and locator, population/comparator, outcome/timepoint, estimand, printed value/unit/uncertainty, observed versus modeled status, and disposition. Unknown stays unknown. Do not derive this table from the payload it will later validate.
3. **Resolve identities and schema.** Search all spaces by identifier, aliases and type; inspect plausible candidates and complete cursors. Record reuse/create/held decisions and evidence. Check actual property types and relation direction. A miss by one name is not a create decision.
4. **Draft reader-facing content.** Claim titles state a scoped finding or an explicitly evaluative policy proposition. Descriptions have at most two concise sentences. Factual Claims include essential magnitude/uncertainty/context in their visible header; detailed notes go into the Dataset. Policy Claims link reviewed evidence without pretending to be reported experimental conclusions. Use existing IDs when improving copy.
5. **Build and review the delta.** Read source data at runtime. Never clone study-specific prose by string substitution. Compare proposed facts against the independent fact table and ensure unrelated existing values/links are preserved. Resolve differences before readiness. Numerical recalc checks stay diagnostics unless separately requested and labeled.
6. **Run mechanical checks.** `bun run typecheck`; the applicable builder/validation; `bun scripts/education-preflight.ts`; `bun scripts/education-submit-saga.ts --batch <batch-file>` for the dry run. Both validation and preflight must be real, fresh artifacts; editing timestamps to satisfy a guard is not verification. Use the existing authorization and submission/vote workflow after these checks.
7. **Verify distinct outcomes.** Record transaction submission, governance execution, bounty indexing, exact live values/relations, and a consumer query with pagination. Inspect the dedicated Claim and every relevant table page. A failed view is not permission to resubmit an already-submitted transaction.
8. **Close the batch, not the whole project.** Update the original field ledger, study note and canonical queue with actual evidence. Report accepted/held fields and next work. Do not use a test count, catalog size or heuristic audit as a completeness/accuracy percentage.

If source columns, study versions, semantic identity, or relation direction remain ambiguous, keep those individual facts held and present the exact uncertainty for stronger review. Continue independently supported queued work. Do not guess and do not request redundant publication permission. This procedure does not require a second agent for routine work.

## Implementation follow-up — shared workflow now available

Implemented the [shared collection workflow](education-collection-workflow.md): typed declarative inputs, independent source-fact/live comparisons (including header, locator and displayed columns), reviewed-source/discovery hashes, source/Claim/schema checks, complete incoming-membership discovery, persisted IDs and positions, submitted-prefix protection, and submission-time input binding. The generic consumer verifier accepts a batch path. Scope is new collections of existing factual Claims; other legacy publication families still need explicit extensions.

The fact contract now also accepts optional `missingPropertyIds`. A reviewed missing-value assertion is checked against the complete destination Claim read and fails if the property is present or duplicated among expected values. This preserves an unreported standard error, sample count or unit without encoding a fabricated zero; the workflow regression test covers both accepted absence and rejected presence/overlap.

Regression testing exposed SDK random jitter in `Position.generateBetween`, which made repeated builds differ. Positions are now persisted separately from IDs and checked against reviewed ordering/catalog anchors. Tests run the actual preparation CLI twice with a synthetic transport, compare operation bytes, validate its review binding, and verify a submitted prefix refuses rebuilding. The fixture rejects unexpected queries and never signs or contacts a wallet. A live read-only check confirmed the entity/relation collision-query shape. TypeScript and readiness tests also pass.

The shared fact contract was then corrected to treat Claim `name` and `description` as entity fields, rather than ordinary Geo property values. Source-fact comparisons now check those fields directly and require only actual table columns as typed values. This avoids validating fabricated header properties; the synthetic workflow test covers the distinction.

Retry validation was tightened afterward: every `collection-v1` invocation now checks the review binding, including journals whose main transaction is already confirmed but whose bounty or later stages remain unfinished. A progressed journal cannot bypass changed evidence. The regression fixture exercises this tamper case.

`education:status` now inventories the field ledger, journals, operation integrity and saved index evidence without collapsing verification stages. The local run parsed 220 journals with no integrity/parse errors, reporting 219 confirmed submissions, recorded executions and confirmed bounty transactions separately. Collection-v1 batches fail status when index evidence is missing/failed/unbound; legacy reports expose their unbound state without retroactively failing the whole historical inventory. These are local historical observations, not current chain truth or independent-study counts. No queue candidates were auto-completed. Report: `tmp/publisher-status-review.json`.

The status tool also detects prepared-only batches that were superseded by a variant journal (for example, Saga's base batch followed by pilot/expansion publication). This prevents a historical draft from being mistaken for an unimported dataset. A batch with no exact or variant journal remains an unresolved prepared candidate and requires review; the tool never auto-publishes it.

The original-field inventory now has a named `bun run education:ledger` entry point. It verifies the pinned source hashes and emits nested field statuses without treating an incomplete cross-space lookup as absence. If an existing ledger contains reviewed mappings, the script refuses to regenerate it; update reviewed rows explicitly and retain the evidence instead of refreshing them away.

## Remaining extensions

- Extend the shared input contract to existing-collection deltas, Claim creation/repair and other legacy publication families as needed. Do not silently route unsupported operations through older scripts.
- Add fresh chain/index observations and broader semantic queue reconciliation to the local status report. It currently flags explicit executed-proposal references in unchecked queue lines; it cannot decide that mixed acceptance conditions are complete.
- Improve extraction evidence capture and source-specific comparison tests. Review artifacts bind evidence but do not automate scientific interpretation or prove an independently prepared source table was faithfully transcribed.

Do not add a regex that claims to recognize a good debate proposition, establishes causal validity, or certifies that a source URL supports a fact. Heuristics may nominate review; they cannot replace it.
