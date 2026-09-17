# Publisher reliability review — September 12, 2026

## History-driven safeguard audit — September 16, 2026

The audit scanned all 100 maintained Markdown files recursively (excluding vendor, dependency and runtime directories), checked local Markdown link targets, and surfaced 82 status-language candidates for inspection. The reproducible command is `bun run docs:audit`; `tmp/workspace-doc-audit.json` records every file and candidate. There were zero missing local link targets. This is a mechanical repository-wide scan, not independent verification of every research statement or remote URL.

Concrete fixes from the audit:

- Shared collection comparison now requires exactly one true factual flag and exactly one matching source locator. Previously `some()` accepted a true flag alongside false, or the expected locator alongside a conflicting one. Regression fixtures reject all three ambiguity cases.
- Submission checks journal payload, destination, bounty and recognized transaction state before dry run or writes. An existing ready journal no longer skips DOI/text checks. The route-repair preparer explicitly refuses a journaled prefix.
- The API client rejects null, array or scalar response envelopes/data and malformed error envelopes as `GeoApiRequestError`. A valid `{data:{entity:null}}` remains an ordinary absent-entity response; response failure never becomes absence.
- Prepared auditing validates full review/evidence hashes and reports recorded transaction stages rather than inferring publication from file existence. It discovers versioned collections from metadata as well as filenames, including observed-outcome batches. The obsolete mixed Early College draft was removed in the September 17 Education closeout; observed and model-only records are published as separate semantic views, so no stale merged payload remains to audit.
- The reconciliation recorder derives its cumulative count from ledger rows. The earlier 13-identity/39-field prose confused one exact-match slice with the cumulative ledger, which currently records 17 initiative identity/name/route triplets (51 fields). This count describes recorded mappings, not a fresh semantic certification.
- Removed the obsolete Early College membership-only discoverer and discovery binder, along with their package commands. The binder manufactured an empty complete identifier search and assigned a new timestamp without a query; the membership-only tool could overwrite richer evidence. The maintained combined discovery command replaces both. Original source, operations, journals, registries and research evidence remain intact.
- Condensed `agents.md`, removed obsolete publication-pause instructions and routine destructive blanking advice, clarified historical snapshots, and corrected the category note from four literacy edges to two literacy plus two early-childhood edges. Environment variants are ignored while `.env.example` remains available.

Skills review: the Geo Explorers publish skill supplies ontology, duplicate, data-type, relation-entity, type-required and pilot-rendering checks. These are instructions, not proof that every entry point enforces them. Its runtime-switch advice must follow journal reconciliation after an uncertain broadcast; never restart a submission simply because Bun or a poll timed out. The local audited workflow and current user authorization govern this code-only task; vendored skills were not modified.

Remaining engineering limits: 230 batch files have no versioned workflow contract. Bespoke builders can still bypass shared review and semantic checks, and scripts that stamp accepted review decisions cannot establish scientific correctness by themselves. Consolidate new repairs/creation into explicit contracts before retiring further legacy scripts. No regex can certify Claim quality, whole-category equivalence, paper version, causal interpretation, or a genuine opposing argument. Full semantic/source review and frontend acceptance remain separate work.

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

## Catalog-extension workflow corrections — September 16, 2026

The catalog-extension preflight failed after requesting proposal-history and detailed governance fields that readiness did not use. The live API still returned the destination and membership facts when queried narrowly. `education-preflight.ts` now requests only DAO identity, topic, paginated member and editor lists, which are the facts its output actually attests. A request failure remains a failure; this is query minimization, not a fallback or a fabricated preflight.

`Position.generateBetween` is nondeterministic. The catalog-extension builder now persists the three generated positions with the current final catalog-position anchor and refuses a replacement payload when that anchor changes. This prevents an agent from silently changing ordering while refreshing a stale readiness artifact.

DAO submission and FAST voting are separate on-chain actions. `education-submit-saga.ts` journals the proposal transaction and bounty link; `education-vote-submitted.ts --batch <batch>` performs one guarded YES vote for an indexed, active FAST proposal and records its receipt. It refuses a duplicate vote, non-YES history, wrong destination, missing journal receipt, or a non-FAST proposal. `education-verify-catalog-extension.ts` then records complete paginated membership, execution and bounty-link evidence. Status recognizes this explicit `execution` receipt and `passed: true` verification report rather than reporting the executed batch as pending.

After a confirmed vote, Geo can briefly expose an active FAST proposal with zero indexed YES votes. The vote helper now treats a journaled, successful vote receipt as a polling state: it re-reads proposal execution without sending another vote. A missing or unsuccessful receipt remains a stop-for-review condition. This distinguishes normal index lag from a reason to resubmit a transaction.

The same helper now recognizes both journal layouts used by maintained Education publishers: `journal.versionId` and legacy `journal.main.prepared.versionId`. A direct catalog-style FAST journal previously failed before its live proposal read because only the legacy nested field was accepted. The repair is local compatibility logic; it does not alter any proposal or permit a duplicate vote.

The catalog extension initially linked three persistent IDs before their resource-metadata updates were executed. Geo exposes such untouched IDs as empty entities, so a Collection item edge alone does not establish a usable Dataset. The resource batches were then executed and independently verified. Future catalog extensions must either include record creation in the same proposal or execute and verify the referenced Dataset records first. `education-verify-catalog-resource.ts --batch <batch>` now verifies the source-derived title, concise description, official URL, full Markdown metadata, relation types, execution, and indexed bounty link. The generator also joins list-valued uses with readable comma-space punctuation before writing the two-sentence description.

## Consolidated proposals — user requirement

September 17, 2026 UTC, clarified by the user: **publish one representative example for a new content pattern, verify it, then publish the remaining related content in one large proposal and vote once.** The pilot and consolidation rules work together. The earlier interpretation that consolidation overrides the pilot was incorrect and has been removed. Source review and safety gates remain required.

- Allocate persistent IDs before generating operations. Resolve links against both verified existing entities and IDs in the current proposal. Include records, citations, blocks, table configuration and catalog attachment together; ordinary graph references do not require their targets to be published first.
- Present one reviewer summary: intended outcome, counts by kind, provenance, interpretation decisions and exclusions. Retain per-record evidence underneath. Separate studies and observed/model tables can share a proposal without merging their semantics.
- Read and validate in bounded local batches, then assemble one immutable payload, review binding and journal. Check conflicting writes, duplicate IDs/edges, unresolved targets and preservation of existing facts across the combined change. Run all constituent semantic checks before signing and verify the entire result afterward.
- Never concatenate legacy files blindly, replay submitted ops, or remove publisherVersion to evade a gate. If a builder/CLI accepts only one small package, extend its preparation and validation contract rather than sending many tiny proposals.
- Beyond the justified pilot, splitting requires a documented reason: different spaces/governance, a verified size/gas/API limit, an unavoidable external dependency, genuinely unreviewed content to hold, or explicit user instruction. Record evidence and the smallest necessary proposal count before signing. Do not invent a size limit or split by arbitrary row counts.
- A personal-space bounty-link transaction may remain separate where the current workflow requires that scope; it is not another Education DAO proposal. Preserve required proposal/vote ordering and governance checks.
- For defects found after execution, preserve immutable history and group compatible reviewed corrections into one follow-up delta. Never knowingly ship defects to avoid a follow-up or replay successful content.

Follow the vendored skill's one-example live test when introducing a new content kind or materially changed schema/rendering pattern. The example must exercise the intended fields, links and block/table presentation. Verify execution, indexed values and actual rendering before publishing the remainder. Record the pilot IDs, tested pattern and results; reuse that evidence for unchanged patterns rather than repeating pilots for each study or script. Exclude the already-published pilot operations from the combined remainder and reference its existing IDs. Fix a failed pilot before expanding; a pilot pass does not replace full source/identity/semantic checks on the remaining records.

## Short operator procedure for a simpler agent

1. **Choose one complete, coherent proposal from the queue.** Read `publishing_queue.md`, the affected design/study notes and pinned source rows. Include compatible related work and its dependencies in the same destination space. Research and validate in manageable local batches, then consolidate them before signing; a small preparation batch is not a separate governance proposal. Do not expand into unrelated studies to avoid unresolved migration work.
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

## Discovery-copy correction — September 16, 2026

The Texas Summer Bridge discovery script searched the correct collection title but recorded the copied `dcmp-collection` string as its identifier query. That made the saved evidence describe a search that never ran. The script now records the actual all-space collection-title search and a direct stable-ID read of the cited Article, with those roles kept separate. Its fresh run found zero collection-title candidates and zero incoming memberships across all six reused Claims.

Treat copied search labels as a discovery failure, even when the underlying result set happens to be empty. Review the query text, variables, candidate set, and the source/collection distinction before binding an artifact or signing a proposal.

## Prepared-batch audit correction — September 16, 2026

`education:audit-prepared` originally treated an existing collection publication receipt as a failed `noPublicationReceipt` check. It also derived a repair journal filename by removing the word `repair`, so executed repairs appeared prepare-only. The audit now checks batch integrity independently of whether a journal exists and derives a repair journal by replacing only the `-validation.json` suffix. A fresh run reports all 37 reviewed batch/repair artifacts internally consistent, including historical publications; its two remaining prepare-only collection batches are the separately documented mixed-model holds, not audit failures.

## Post-publication note correction — September 16, 2026

The Year Up collection plan’s preparation note was rendered as a live Dataset block. After execution it still said that the draft required review before publication, which was no longer true. A dedicated one-operation correction read the exact existing Markdown value first, updated only that note entity, and then verified both the new API value and the rendered table after a browser reload.

Collection plans must separate durable reader-facing notes from temporary workflow state. Builders must reject notes containing `draft`, `prepare-only`, `pending authorization`, or `before publication` unless an explicit temporary-publication exception is reviewed. Post-publication wording fixes use an independent, narrow, hash-journaled delta; never rebuild a submitted collection payload.

## Modeled-row collection guard — 2026-09-14

The shared collection workflow accepts a local `Fact.classification`, but collection operations publish membership and table columns only; they do not emit a structured observation-kind fact. The Early College draft contains source-reported **modeled** cost-benefit rows (including the 15.1 and 4.6 scenario ratios) alongside observed lottery outcomes. Publishing that dataset would make its table membership chart-ready while silently discarding the model/observed distinction required by the dashboard contract.

A live exact-name discovery found no established `Observation kind`, `Observation type`, `Evidence kind`, `Model status`, `Modeled`, or `Observed` entity/property mapping to reuse. On September 16, bounded global `propertiesConnection` queries confirmed zero exact-name PropertyInfo records for all six names with complete cursors. `src/education-collection.ts` now fails closed for `modeled` rows until a reviewed Geo schema mapping and consumer query contract are added. This is a workflow correction, not a claim that the source-reported ratios are invented. The Early College and WorkAdvance collections remain held; their outcome and cost-model Claims may still be read separately with Article filters.

## Observed-only collection split — September 16, 2026

The guard permits a new collection only when every member is already classified `observed` in its source fact table. The Early College Year-10 lottery collection therefore contains five AIR outcome Claims and one outcome Article; its model Article and all five model Claims are explicitly excluded, not reclassified or silently omitted from their own Article view. The executed receipt and rendered-verification evidence are in [the publication note](early-college-observed-outcomes-publication-2026-09-16.md). This pattern is available only when an observed subset has a coherent source, outcome scope, compatible columns, and fresh no-membership discovery; it does not authorize removing model rows from a mixed collection plan.

The status report now classifies the original mixed Early College and WorkAdvance collection drafts as **intentionally held**, alongside the executed observed-subset journals. It no longer presents them as ordinary unresolved batches, while keeping the model-status mapping work visible and unpublishable.
# Standalone publication-journal status handling — September 16, 2026

`education:status` previously treated any executed `*-publication.json` without a matching collection `*-batch.json` as an error. The Education overview-features publication is a valid standalone graph-operation workflow: it has an executed journal and persisted `*-ops.json`, but no collection batch or hash-bound collection review. The status script now reports that state as `standalone-ops-unbound` instead of a missing-batch failure. This recognizes the workflow without upgrading its evidence to collection-v1 integrity; standalone changes still require their own live/index/render evidence.

## Regenerated catalog-plan handling — September 16, 2026

The original Initiative and Source catalog preparers can regenerate local planning artifacts after their FAST proposals have executed. Their generated operation-file hashes may therefore differ from the historical batch hash. This does not alter an immutable proposal or demonstrate live corruption.

`education:status` now reports this condition as `catalog-plan-regenerated` rather than an integrity failure. The authoritative proof is the corresponding dedicated live verifier: `education:verify-original-initiative-catalog` checks all 76 stable Initiative IDs, routes and source-record blocks; `education:verify-original-source-catalog` checks all 106 stable source IDs, original URLs and source-record blocks. Do not replay, overwrite, or hash-edit an executed catalog proposal to make a local planning file match. If either verifier fails, investigate the specific stable record with its source snapshot and publication journal.

## Comparison-verifier semantic correction — September 16, 2026

A fresh multi-intervention dashboard read initially failed because its nested `values` and `relations` pages were limited to 30 rows; large, valid Claim records exceeded that bound. The query now requests a still-bounded 100 rows and retains `pageInfo` failure checks. The same review found that WorkAdvance’s source-modelled provider net gains use the typed **Net financial gain** property, not the generic **Effect estimate** property. The verifier now asserts that exact property, along with year, currency, source relation and the reader-facing non-benefit-cost caveat. Its fresh run passes all 38 source-filtered comparison families. Use `bun run education:verify-dashboard-comparison`; the Perry and Reading First semantic verifiers are also available as package commands.

## Geography coverage diagnostic — September 16, 2026

`bun run education:verify-geography-coverage` performs two bounded, cursor-safe reads: destination-scoped Education Location relations and direct `Geo location` Point values from the reused Geography entities. It explicitly reports a missing Point as `coordinate-absent-in-geography`, never as an absent Education relation. This avoids the earlier mistake of treating an empty adapter result as a missing publication or permission to invent an implementation site. The five state-level Education scopes are documented in [the reconciliation receipt](education-geography-coordinate-reconciliation-2026-09-16.md); a shared Geography-space coordinate update needs its own authorization and proposal.

## Prepared-audit disposition correction — September 16, 2026

`education:audit-prepared` now distinguishes an immutable executed package from a current pre-signing package, and an explicitly held mixed-model draft from an ordinary pending package. A later study-note or evidence-file edit can invalidate a historical review binding without altering the already executed operations; the audit retains the operation hash and records that state as `historical-executed`. The original Early College and WorkAdvance mixed drafts are `intentionally-held`, because their observed-only subsets are separately published and the complete mixed tables still require a structured consumer mapping. These labels do not authorize reusing the old payloads. A current ready package still fails the audit if its binding is stale. The fresh audit reports zero failed artifacts, 36 historical executions and two intentional holds.
