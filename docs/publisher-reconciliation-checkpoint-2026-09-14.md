# Publisher reconciliation checkpoint — 2026-09-14

This checkpoint records fresh, read-only reconciliation evidence for the bounded Geo Companion work. It does **not** submit, vote on, or index a publication; the publication pause in `AGENTS.md` remains in force. The checked question report is `data/education/original-question-relationship-reconciliation.json`.

## Fresh status

| Package | Classification | Evidence and usable contract | Next bounded work |
| --- | --- | --- | --- |
| 1. Education categories, methods and sources | Existing and partly readable; remaining fields need content review | The pinned ledger reports 172 verified of 2,772 original fields; four source-backed category links use relation `06c899fb04334e679feb1fd56687c3d6`. `data/education/original-category-members-query.graphql` is the cursor-paginated Education-scoped member query. | Reconcile each remaining original category, `methodTags`, source method and source link against all-space identity evidence. Do not infer an RCT or category from a title. |
| 2. Observation semantics | Existing and readable; frontend-only adapter gap for the sampled families | Perry, Reading First, Saga and coaching already have source-specific registries and paginated query contracts under `data/education/`. Their typed values must remain separated as observed outcomes, effects, modeled returns, and assumption-dependent bounds. | Return a per-family property map for instrument/measure, unit and scale, cohort, arm/comparator, estimand, follow-up, uncertainty and locator. Repair only a missing sourced graph fact; do not republish a readable observation. |
| 3. Assessments and Questions | Existing Questions; relationships and assessment synthesis await review | All 21 Questions are reachable through Dataset `b1f70bc05d4e454dab2448a0e3172195` → Blocks `d19cf5813cf9451d9ef7d793c9b7c9d9` → Collection item. The fresh report confirms their only returned relation is the Question type `8f151ba4de204e3c9cb499ddf96f48f1`; source/topic/initiative/continuum/assessment fields remain pending. | Review each source relationship by source version and initiative identity. Publish an assessment only with attribution, rubric, scope and evidence. Never create Answers, numeric continuum positions, bounds, or personal editorial text to fill a chart. |
| 4. Prepared education batches | Prepared, not published | `bun run education:audit-prepared` checked 36 artifacts successfully. Sixteen current batches remain prepare-only, including the catalog extension; 341 operations are prepared across the 13 new study families. | Keep these deltas reviewable during the pause. Fresh discovery, review binding, authorization, receipt, indexing and rendered verification are required after publication resumes. |
| 5. Technopoly / profile | Absent after adequate discovery; publication queued | Complete prior substring and ISBN discovery found no Book match. The candidate work-level identity `0373f5e944d94ebf8c74ce87c01623eb` remains only a candidate. Existing post `fd024e4f126343af98c61c32ae6f917e` must retain its text. | Refresh all-space title and identifier discovery, verify Books-space authority and ontology, then prepare a sourced work-level Book and one relation to the post. No editorial copy. |
| 6. Outreach pilot | Awaiting source and semantic review | Public good `f24e3bbd26304474b7e0c2a0877f4bfe` has no discovered directory Dataset in the complete destination-scoped read. The approved intake slice is S019/S029/S038/S076–S079/S101. `docs/indianapolis-outreach-query-contract.md` remains `ready: false`. | Build the minimized source-to-Geo crosswalk and review only official public service facts. Keep coordinates/hours unknown unless verified; retain public contact-page links only and never copy contact details or private locations. |
| 7. Space icons | Existing pages; Avatar relation absent | A complete paginated read verifies that Avatar is relation `1155befffad549b7a2e0da4777b8792c`; Image IPFS URL is `8a743832c0944a62b6650c3cc2f9c7bc`. Neither requested page has Avatar. Education has only Cover → Image `fb970b88c55e46f2bb64a94188a83667`; see `data/space-icon-discovery-2026-09-14.json`. | Select suitable reusable Images, verify authority, and prepare two Avatar edges. Cover remains a distinct relation. This polish does not block substantive packages. |

## Consumer rules confirmed

- Use complete cursor pagination and inspect GraphQL errors. A timeout or failed page is unavailable, not empty.
- Preserve destination/asserting-space provenance and stable IDs. Search across spaces before creating a reusable identity.
- The Saga broad Article-plus-Study relation filter is known to return a mixed/incomplete set. Use the table-specific `saga-*-query.graphql` contracts until that API behavior changes.
- A visual can group only typed, compatible records. Similar prose labels, common units, or shared sources do not establish a comparable cohort or independent study.

## Commands run for this checkpoint

```text
bun run education:status
bun run education:ledger
bun run education:audit-prepared
bun run education:review-question-relationships
```

The audit passed all 36 standardized local artifact checks. Those checks are local preparation evidence, not fresh publication/indexing or browser-rendering proof.