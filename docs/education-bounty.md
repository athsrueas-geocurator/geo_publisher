# Education programs dashboard bounty

Verified through public Geo API reads on 2026-09-11, including the bounty's ordered text blocks and space-specific relations.

- [Bounty](https://curator.geobrowser.io/bounty/ec349623f33236aee13c12dcd629ee81/debce2de46094f299ee8e89fe244a9dc): Education programs dashboard.
- Bounty entity ID: `debce2de46094f299ee8e89fe244a9dc`.
- Bounty-owning Education space: `ec349623f33236aee13c12dcd629ee81`.
- Allocated relation points to Thomas Freestone (`a525e625551246c58965df8e286b0414`); observed status Backlog, difficulty Hard.
- User-selected initial dataset publication/test space: Education datasets (`dac259bad48a11adf97fe36857d85206`). A live read identifies this as DAO-governed too. Verify editor authority and execute the fast-path proposal rather than assuming a vote alone applies it.

## Requirements and current coverage

Research follow-up: [prioritized study shortlist](education-study-shortlist.md) identifies cost/outcome sources, citation evidence, source duplicates and extraction/access gaps.

The bounty calls for a searchable U.S. education program dashboard comparing costs, outcomes and apparent efficiency by location, population and intervention model. Users need access to source evidence, assumptions and methodology. The current six-collection migration supplies an evidence foundation, not the full cost-effectiveness product.

| Requirement | Existing foundation | Work still needed |
| --- | --- | --- |
| Searchable programs and mechanisms | Initiatives, categories, theory of action, changed inputs | Resolve program identities and distinguish broad movements from specific implementations |
| Geography and populations | Narrative target-population fields | Structured states/regions, delivery locations, populations and implementation periods |
| Actors and implementation models | Narrative descriptions | Verified organization/operator links and structured implementation facts |
| Costs | No dedicated cost fields in inspected core schema | Cost observations/estimates with currency, price year, period, denominator, coverage, source and assumptions |
| Public outcomes | Findings, outcome descriptions and citations | Comparable metric observations with units, dates, geography, population and study context |
| Cost-effectiveness comparisons | Evidence ratings and curated comparisons | Explicit comparison methodology, compatible denominators/time horizons, uncertainty and confounders; descriptive trends must not become causal effects |
| Visual exploration | Existing explorer/dashboard patterns | Geographic and cost/outcome comparison views; missing costs/outcomes remain unknown, not zero |

Inspect research profiles and initiative-dataset links before collecting replacements. Match entities across spaces before adding any program, institution, dataset or concept. No cost or effectiveness ranking is justified solely by the current narrative findings/evidence-strength labels.

## Linking proposals

### Verified current UI state — 2026-09-11

The public Curator bounty page now shows **Thomas Freestone — In progress — 14 proposals**. Expanding that row displays all 14 recorded proposal IDs, including both STAR experimental and both STAR return proposals, each marked **Accepted**. `data/education/curator-bounty-verification.json` records the complete list. This verifies that destination-space proposals linked from the personal space are discovered under the Education-owned bounty. No payout is shown; proposal acceptance is not final acceptance of the unfinished dashboard bounty. This supersedes the earlier unpublished/visibility-pending statements below.

Observed display issues: the Details summary still says `0 Total submissions` despite the populated submission row; twelve proposal titles fall back to UUID labels while the two glossary titles render. Proposal hrefs use `testnet.geobrowser.io` with the bounty-owning Education space rather than the dataset publication space. The href behavior has not been tested, so it is a routing concern, not a proven broken link. Do not republish links to chase these UI symptoms; the proposal IDs and group association are already correct.

2026-09-11 update: the user explicitly requires linking the bounty. Current geogenesis `apps/web/core/constants.ts` sets `PROPOSAL_TYPE_ID` to root entity `490a7c90ad4b4029b2b4d85d22fe203a` (live name/space verified), unlike SDK 0.20.3's `SystemIds.PROPOSAL_TYPE`. `src/education-bounty.ts` implements the pure link builder using the live root type and SDK `SUBMISSION_PROPERTY`. Its relation target-space context points to the bounty's actual owning Education space; the current web flow's submission counts query by target entity ID across spaces. Actual indexed/Curator visibility remains to verify after submission. No link has yet been published.

Both edge IDs and relation-entity IDs must be journaled: supplying only `id` to `Ops.relations.create` still generates a fresh `entityId`. Three offline tests verify deterministic retries, destination-space separation and rejection of colliding IDs. SDK upgraded to 0.20.3 and skills updated to 29099c1; typecheck plus seven transport/bounty tests passed.

The web review flow publishes the main DAO proposal, then a separate personal-space edit naming/typing that same proposal entity and linking it to the bounty with `SystemIds.SUBMISSION_PROPERTY` (`3b4c516ff3ac41e0a939374119a27d6e`, Proposal → Bounty). Source: [Geo review flow](https://github.com/geobrowser/geogenesis/blob/master/apps/web/partials/review/review-changes.tsx) and [bounty ontology](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/bounties/ontology.ts).

Retain the proposal ID, publication space and bounty-owning space separately. The web code uses the active publication space as relation target-space context; this differs from the bounty's owning space for our proposed test publication. Verify the appropriate context and Curator discovery for this cross-space case before implementing links. A test-space publication must not be assumed to count as accepted bounty work or earn a payout.

## Progress expectations

The bounty requests regular progress updates and public distribution, especially X posts; community-call participation is encouraged. These are requirements from the bounty text, not user authorization to post, message anyone, or create an automation. Prepare reviewable updates as work progresses; external posting requires the user's instruction.
# Perry verification update — 2026-09-11

Curator visibly lists all five Perry proposals as Accepted, for 19 linked proposals total under Thomas Freestone's In progress submission. No payout is shown. See `data/education/perry-curator-verification.json`; this supersedes the earlier 14-proposal count. Summary counter and fallback-title issues persist, but the links are present and must not be duplicated. Overall bounty completion still requires the comparison dashboard and remaining data scope.
# Reading First verification update — 2026-09-11

Both Reading First proposals, initial pilot `bf3fd4ba28c7411b8ac00bb89ae38d14` and methods correction `dea76dd2e4d74a9396aeb4414a8f95a3`, executed and have indexed bounty links. The live Curator table shows both Accepted: 21 accepted proposal rows total, Thomas Freestone's submission still In progress, no payout. Evidence: `data/education/reading-first-curator-verification.json`. Only the first Reading First estimate is published; the full bounty and dashboard requirements remain unfinished.
## Reading First audience bounty: chain-to-index diagnosis, 2026-09-12 UTC

Fresh verification of `reading-first-audience-batch.json` passes ten of eleven checks; the sole failure is the missing indexed bounty link for proposal `ab315d843a934eb582081ae23df8b68f`. This is not a failure of the published audience/grade facts. Full outgoing relation pagination still returns only the two main-edit relations, with no personal-space name, Proposal type or Submission relation; lookup of the journaled Submission edge also returns no result.

`data/education/reading-first-audience-bounty-chain-recheck.json` adds authoritative chain evidence: transaction `0x7f15403a9a83c47abef8a5a4ee9c82559275b7270f1aec17c083372459306de0` succeeded at block 50401 and emitted a registry event for the configured personal space. Decoding its nested ABI bytes/string payload yields exactly the prepared CID `ipfs://QmYTR4igWj7Ja5x4tBMtJ3mARpLLFF7Q3Vae3JW7SFSmDa`. Earlier saved payload inspection independently confirmed the CID contains the intended name, root Proposal type and journaled Submission edge. Thus the evidence points to a chain-to-index omission of this personal-space edit, rather than a wrong CID, destination or missing link operation; the indexer's internal cause is still unknown.

Diagnostic pitfall: the outer transaction targets ERC-4337 EntryPoint, whereas the prepared call targets the Geo registry. Direct comparisons of the outer calldata/destination with the prepared call are expected to differ and do not prove a publishing defect. Inspect the registry event inside the successful receipt instead. The report preserves the raw comparison and explicitly annotates this distinction.

Do not rebuild or resubmit the main education proposal. A bounded recovery, if needed, should replay only the verified missing personal-space metadata using the original Proposal ID and both original edge/relation-entity IDs, with a separate recovery journal and a final duplicate/absence check. Do not allocate a second bounty relation or overwrite the original confirmed receipt. No recovery transaction was sent during this diagnostic pass.
### Reading First audience bounty recovery succeeded — 2026-09-12 UTC

`scripts/education-recover-reading-first-bounty.ts` performs a bounded personal-space metadata replay with the original Proposal ID, type edge/relation entity, and Submission edge/relation entity. It compares all operations against the previously retrieved original CID, checks live absence immediately before publication, and keeps a separate recovery journal. It never resubmits the main education proposal. Recovery transaction `0x9fd5d802217b7a524178405809836d445c8c916cc23e261887d50ca7f3c891f5` is confirmed; all eleven original audience-batch checks now pass, including the bounty link. Original publication receipts remain unchanged.

The recovery's first dry run exposed a validation-only issue: JSON string equality rejected equivalent SDK and decoded operations because their object keys were ordered differently. Replaced that comparison with `isDeepStrictEqual` on normalized JSON objects, preserving array ordering and exact field/ID values. No write occurred during the failed dry run. TypeScript checks pass. This is separate from the original indexing omission, whose internal cause remains unknown.

Six additional full personal-space checks verify the intended proposal name, original root Proposal type edge, exactly one Submission edge, and both original relation-entity IDs (`reading-first-audience-bounty-recovery-verification.json`). Earlier missing-link entries are superseded by this successful indexed recovery; fresh Curator UI visibility remains a separate check.
### Curator recovery and recent-publication verification — 2026-09-12 UTC

Read-only browser tab 82 opened the actual bounty page and expanded Thomas Freestone's submission. The recovered Reading First audience proposal `ab315d843a934eb582081ae23df8b68f` is visibly **Accepted**. The submission now lists 66 proposals; the expanded table contains 66 Accepted labels. The latest Perry coverage (`d93853d0cd2b4f6786dbc85aad641444`), debate arguments (`d7f32d9db7b94b7bad738dd6671942bd`), Related/evidence (`82f98ce080a647a28e490786a521ec64`) and economic-copy (`d9ea37cc84744684b843c5b417276025`) rows are also visibly Accepted.

The overall submission remains **In progress**, with no payout. The Details summary still incorrectly appears as `0 Total submissions` alongside the populated submission table; fallback UUID titles and bounty-space governance links also persist. These presentation defects are not reasons to duplicate published bounty links. This verifies Curator visibility for the recovery and named recent proposals, not completion of the dashboard bounty or an inventory reconciliation of every local publication journal against all 66 rows.
