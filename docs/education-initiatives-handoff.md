# Education Initiatives: Geo publisher handoff

## Head Start result Dataset — 2026-09-12

Catalog now includes `bde747c9dd7b4b34a4115b1f2cf0b468`: 37 reused impact Claims in six tables, separate from the linked microdata archive. [Result collection contract](education-result-collection-reconciliation.md#head-start-collection-applied) supplies exact block IDs and interpretation boundaries. Added 14 missing ITT labels and clarified two fraction-scale probability units without changing values. Publication, preservation and browser checks pass. Catalog count at this publication is 27; discover current membership dynamically.

## Coaching result Dataset — 2026-09-12

Catalog now includes Dataset `46a483eddc824e4ea7b14cf9b8cc9180`, with three instructional-practice and six achievement estimates in ordered native collections. All nine existing Claim IDs/facts are preserved. [Result collection contract](education-result-collection-reconciliation.md) supplies block IDs, overlap semantics and verification; 36 publication/33 preservation-query checks and both rendered tables pass. Native catalog now has 26 members; read current membership rather than a frozen list of 25.

## Native Dataset catalog — 2026-09-12

Space page `16a032fb91794444859a6c1a44a32955` now links catalog Data block `2279edef1bbe479c872caeb72ee90022`. Its 25 members reuse existing Dataset IDs in stored alphabetical order. [Catalog contract](education-dataset-catalog.md) and `data/education/dataset-catalog-members-query.graphql` specify complete scoped Collection item pagination. Proposal executed/bounty indexed; 33 publication and 104 independent query checks pass. Readers must distinguish study results, research resources, Questions and glossary by supported content, not assume all Dataset members support quantitative comparison. New datasets require explicit catalog membership maintenance.

## Coaching synthesis method — 2026-09-12

Existing coaching Article `6a85813ac8734141b55affa06793661c` now has DOI `https://doi.org/10.3102/0034654318759268` and Study design `b1fdc75afb6841a18d8286427099ea44` → reused Health Meta-analysis `fd48f57b65f44436b393d448eca5d5bd`. Load relation-entity Description/Sources for scope; this describes the paper's synthesis, not each trial's assignment design. Six publication checks and Article rendering pass; [bibliography notes](original-bibliography-authorship.md) contain receipts. Original src-023's RCT label remains rejected.

## Original 21 Questions published — 2026-09-12

Dataset `b1f70bc05d4e454dab2448a0e3172195` contains Questions block `d19cf5813cf9451d9ef7d793c9b7c9d9`; traverse Collection item `a99f9ce12ffa4dac8c61f6310d46064a`, sorting stored positions after complete pagination. Each Question uses type `4318a1d2c441455cb76544049c45e6cf`, Name=original betterQuestion, Description=original contrast framing plus period, Route slug=original slug and Web URL=pinned original source. Display name and framing together. [Question reconciliation](original-question-reconciliation.md) includes stable IDs, 138 publication/157 consumer checks, all three table pages, one dedicated page, receipts and the original converter's invalid-link fallback. These are Questions, separate from nonfactual Claims; Answers targets Answer, not Claim. Research links, topics, syntheses and assessments remain under review.

## Published text encoding corrected — 2026-09-12

Eight existing Text values had damaged apostrophes/year-range punctuation; the executed and bounty-linked repair preserves all IDs, words, numbers and evidence edges. [Encoding notes](education-text-encoding.md) contain receipts and the new submission guard. A fresh complete 5,047-value scan finds no flagged encoding patterns; the coaching Claim page renders correctly. No frontend republication or new source-field completion is implied.

## Three original program routes and a duplicate source reconciled — 2026-09-12

Teacher coaching `e181f6b918e548b79304a674743753fd`, Tennessee Voluntary Pre-K `4384e208b2964c6c9432823574a5a1e2`, and CEP `327eef80a0dd423f846fbd50def5bf87` now carry their original route slugs. Original src-023 and src-088 resolve to the same coaching Article, so initiative 22's complete source list uses one existing edge. [Review and receipts](original-program-alias-reconciliation.md); field ledger now 88 verified fields. Five broader-program/narrower-study candidates remain explicitly held; do not recreate them from stale unresolved rows.

## Original bibliography authorship restored — 2026-09-12

Five existing Articles now have their 18 complete ordered author links, covering src-003, src-060, src-068/src-093, src-080 and src-088. [Notes and query contract](original-bibliography-authorship.md) identify version evidence, reused identities, receipts and remaining source-content mismatches. The field ledger contains 74 individually verified fields; the broader 2,772-field reconciliation and assessment mappings remain incomplete.

## Krueger–Hanushek debate published — 2026-09-12

Six attributed interpretive Claims now link three reused STAR evidence Claims in Education datasets. Start with economic parent `44e2a08c02e74fdaaaa6f112e1581fb5` and broad-policy parent `2700dd4c50a641658f29fbc176d87f31`. [Publication notes](class-size-debate-publication.md) contain all IDs, source versions/page locators, relationship directions, receipts and the tested paginated query contract. Related/arguments/classification batches pass 82/8/3 checks, including execution and bounty. Do not count the return and benefit-cost scenario as independent evidence; both use one economic model. Frontend integration is required, not republication.

## ECLS-K:2011 catalog resource published — 2026-09-12

The ECLS-K:2011 Dataset `96de62907fc94c62b0e9a6076ccea75c` and its metadata Block `bb3cefc2ff2041edb3527864b04ae1f7` are indexed in Education datasets. Complete graph-wide title, focused-alias, and official-URL discovery found no reuse candidate; the current crosswalk and [publication notes](ecls-k-catalog-notes.md) preserve that evidence, the source boundary, and confirmed proposal, bounty, vote, and index-verification records.

## User intent

Geo Companion's first app will let users explore the information in [Education-Initiatives](https://github.com/athsrueas-geocurator/Education-Initiatives), with the displayed data fetched live from Geo rather than bundled from GitHub JSON or spreadsheets. On 2026-09-11 the user confirmed this dataset still needs publishing and requested coordination with the agent responsible for geo-publisher.

Handoff placed in the geo-publisher repository on 2026-09-11. The user identified this repository as the publisher agent's workspace. This file is the publishing-side working handoff; record findings here. Placing this file does not establish that a running agent has read it.

## Responsibilities

Saga Table 6 applied: all 15 statistics now extend the existing Dataset, split into three participation first stages, four weighted per-year effects and eight assumption-dependent bounds. Reuse `saga-year2-registry.json` with `saga-pooled-query.graphql` for each of four table IDs. Bound property `f44acacc373c4c12a10bec95ad915ed6` is Decimal; bound records omit ordinary Effect estimate value and CI endpoints. Filter existing Estimand to keep participation effects and per-year mixtures distinct too. Independent query passes 199 source/semantics checks; expansion passes 276 publication checks including bounty linkage. Proposal `3b3b30248a174b8780cedaec05187bf2` executed. Source-specific q-values remain in concise descriptions rather than an invented ordinary-p property. See [Saga context](saga-program-context.md).

Saga Appendix Table 5 applied: 16 additional trial-specific eleventh-grade/graduation Claims now extend the existing Dataset. Use `saga-later-registry.json`; table `83c9c6a366e14992a951ec702dbc67a3` works with `saga-pooled-query.graphql`. Independent `education-verify-saga-later-query.ts` passes 228 checks over four pages; publication passes 308 including bounty linkage. Both browser table pages and one dedicated nonsignificant Study 2 math Claim are verified. Each Claim links only to its own trial plus its ITT/TOT counterpart. Preserve qualified eleventh-grade and terminal-window wording; do not infer a between-study difference from different significance results. See [Saga context](saga-program-context.md).

Saga pooled and later outcomes applied: 38 additional factual Claims from final-paper Tables 5 and 7 now extend Dataset `52448bbbf0cd4c1bb8e949ebe9d628d2`. Each links to both existing trials, omits the single-trial number, and has a reciprocal ITT/TOT counterpart link. Use `data/education/saga-pooled-registry.json` and `saga-pooled-query.graphql`; the independent live verifier passes 467 checks across eight cursor pages (38 representations, 19 source contrasts, two underlying trials). Expansion proposal `84cde81d50d543c6a679a974f5f13197` executed and is bounty-linked; 680 operation checks pass. Preserve expected-eleventh-grade versus elapsed-follow-up semantics, imprecise graduation results, unresolved terminal date for Graduated ever, and absent suspension units. Table 6 bounds and appendix study-specific follow-up remain required; this is not full Saga or migration completion. See [Saga context](saga-program-context.md).

Saga context is now published (2026-09-11): provider `bfac9c728a0e43fd9a278a288d9474a0`, studied tutoring Service `6ce956de8cc047178c33046dd525009d`, Study 1 `6ff69ada18b54b1db98375da1b90df65` and Study 2 `86c407ce9e7e49819e1cd8d07b20f4c8`. Reuse the existing Saga dataset, paper, four effect IDs and cost. Providers `261fad421cc744938acbaa4a4c74220c` links the service to Saga Education; Related entities links effects to their respective studies. Eight [query cases](../scripts/education-verify-saga-context-filters.ts) pass; [GraphQL query](../data/education/saga-context-query.graphql) supports provider/city, program/study, population and effect membership. All 62 publication checks pass, including execution and bounty; the program and Study 2 context render. Keep the two trial populations distinct and do not treat 2,710 Study 2 randomization records as distinct students. See [program context](saga-program-context.md). This does not migrate the broader imported Saga-style/technology-infused umbrella or establish comparable costs across studies.

Reading First means applied (2026-09-11): all 33 actual/counterfactual pairs are additional typed properties on the existing native contrast IDs. Pilot/expansion pass 51/127 API checks, both executed proposals are bounty-linked, and all 21 numeric plus 12 proportion rows render over five table pages. Measurement unit describes means separately from Outcome unit for impacts. Mean-specific filters and the newest Curator rows remain to verify. See `docs/reading-first-study-notes.md` for property IDs and semantics; older means-pending notes below are historical.

Reading First selected effects complete (2026-09-11): all 33 contrasts / 63 native or standardized representations are applied in dataset `02b40a84dd87410f9ad78f0481ad237a`. The expansion passes 1,456 API checks, 12 live query cases and every rendered table page. Its proposal is bounty-linked and Accepted in Curator (22 total accepted proposal rows). Reciprocal estimate links prevent double counting. Means, complete program/implementation/measurement mapping and matched costs remain pending; this does not complete the whole migration/dashboard. See `docs/reading-first-study-notes.md` and `data/education/reading-first-comparison-query.graphql`.

Reading First pilot applied (2026-09-11): dataset `02b40a84dd87410f9ad78f0481ad237a` contains the first native grade-one SAT 10 impact, 4.74 points, SE 2.72, 95% CI −0.63 to 10.11 and P = 0.083. The study records its mixed 17-site RDD/one-site randomized design. Pilot and methods correction are executed and bounty-linked, with 87/3 API checks and browser verification. All 33 selected contrasts are source-verified (298 checks), but only this first representation is published. Remaining effects, program/implementation/measurement links, matched costs and full dashboard integration remain pending. See `docs/reading-first-study-notes.md`.

Perry prepared package is fully applied (2026-09-11): all 84 records, comprising one cost, 51 economic estimates and 32 descriptive observed means. The observed pilot and expansion executed with indexed bounty links and passed 87/497 API checks. Both observed pilot tables render correctly; full observed pagination/filter checks and Curator presentation remain pending. All economic table pages and ten economic filter cases are verified. See `docs/perry-study-notes.md` and the `perry-observed-*` journals/reports. This completes publication of the selected extraction, not every source table or the full education migration.

Perry economic tables are now applied (2026-09-11): all 27 Table 1 IRRs and 24 benefit-cost ratios in dataset `7e86c7f34c614db49497272063f43485`, alongside the initial program cost. Pilot/expansion proposals `f92dd52ab5a04e0db9fef850714028f5` / `ce2113eb99024be6aa508b632afeb4bc` executed with indexed bounty links; 106/949 API checks pass. Both pilot tables and the first nine rows of each expanded table render correctly. All-page browser checks, scenario-filter verification and the 32 selected observed means remain pending. Stable IDs and evidence: `docs/perry-study-notes.md`, `data/education/perry-registry.json`.

Current verification, 2026-09-11: all 15 STAR economic scenarios, three modeled IRRs and eight separately published experimental estimates are applied. Return batches pass 24/22 API checks and all three rates render correctly; price year now shows `1998`. See `docs/star-return-publication.md`. The description audit now covers 102 records with zero flags. Curator visibly groups all 14 migration proposals under Thomas Freestone's In progress bounty submission; every proposal row says Accepted, with no payout. Evidence and display quirks: `data/education/curator-bounty-verification.json`.

Perry initial cost now applied: dataset `7e86c7f34c614db49497272063f43485`, proposal `f0122f6b2bcd4778bdcb874fdf25fe27`, with indexed bounty link, 47 passing API checks and browser-verified cost table/methods. Cost is 17,759 USD per child for the program in 2006 prices, undiscounted; it is not annual or the denominator for every economic scenario. Study/source context and reused Ypsilanti are linked. The remaining 27 IRRs, 24 benefit/cost ratios and 32 observed means are extracted and normalized but not yet published. See `docs/perry-study-notes.md` and `data/education/perry-cost-pilot-visual.json`.

STAR measured outcomes applied, 2026-09-11: dataset `9220554acfd249a18920b301dcbb6cf0` contains all eight Table V column-7 estimates from Krueger (1999), with standard errors, grade-level sample sizes, grade and arm relations, study/location/source links and page locators. Units are percentile points, not percentages or standard deviations. Both proposals are executed and bounty-linked; pilot/expansion API checks pass (105/128), and all eight rows render in source order. `data/education/star-comparison-query.graphql` and its verification report demonstrate all-study, grade, arm and combined filters. See `docs/star-experimental-notes.md` for evidence and remaining full-dashboard mappings. The refreshed description audit covers 99 records with no flags.

Description correction, 2026-09-11: audited 76 current published descriptions and shortened 24, moving the full notes into typed Markdown blocks. Follow-up proposal `a35d32175e764255926849e692cecd7d` and pilot `972391a64f8d4ff89f5da0cf6af4c64d` executed with indexed bounty links. All 94 follow-up API checks pass; the refreshed description audit has zero flags. See `docs/education-description-guidelines.md` for evidence and the dedicated Claim UI's hidden-block limitation. Frontend readers must load block content directly.

STAR expansion: all 15 Table 5 scenarios are applied; the 14-row expansion passed 212 API checks before the description-only follow-up. Proposal `ff65520e8c724875926279c81dd9caff` executed and is bounty-linked. Numeric values are unchanged by the description repair; use its overlay for current descriptions. All three internal-return observations and eight experimental estimates are now verified separately above.

STAR pilot verification completed, 2026-09-11: all 59 API checks pass, including the bounty link. Browser table confirms rates render as `4%` and `1%` from stored fractions; source, costs and projected earnings are visible. Evidence: `star-economic-pilot-index-verification.json` and `star-economic-pilot-visual-verification.json`. Remaining display issues are tracked in `docs/geo-number-formatting.md`; this verification supersedes the pilot's indexing-pending note below. Remaining STAR scenarios, actual experimental estimates and the full migration are unfinished.

STAR economic pilot submitted and executed, 2026-09-11: dataset `4874a8385a594633ab244f47889f9cab`, proposal `ffb12a9c9817460983c290f1e986b731`. It contains one modeled cost/earnings scenario, its source and four numeric properties. Proposal transaction `0x3887f052e23986be220491f5763ba9263e6d54ab5bf9106f9b4d34e89b8f0de5`; bounty-link transaction `0xab7b25fc77d29209630c78ee3d9f9d75f647268e463f7d6a9a56e724e0ed0c15`; execution vote `0x4cff3a02cc3a6c9daca19bd5f954aecb28bbda2ad649178c6c7bf3e839d4c91e`. Indexing and browser verification are separate pending checks. See [numeric-format findings](geo-number-formatting.md) for the legacy Health percentage-format issue and current ICU format. The pilot stores numeric fractions with property-level formatting; titles are not the dashboard's data source.

Geography verification update, 2026-09-11: proposal `52d430ed641248189ae55658c6c50c8c` and its bounty link are indexed. All six Saga Location relations point to existing Chicago `e82f3bfc991a4578aa8b7a503640b95e`; all eight batch verification checks pass. The destination-scoped location query returns exactly the six expected dataset/estimate/cost records with no further page. Saved evidence: `data/education/saga-geography-index-verification.json` and `data/education/study-location-query-result.json`. These are six study-related records, not six independent programs.

The user's updated goal requires both bounty coverage and comparison-dashboard support. Use [the dashboard data contract](education-dashboard-data-contract.md) as an additional acceptance checklist. Imported-record counts alone do not prove completion; structured geography/population filters and compatible, sourced cost/outcome comparisons must work against Geo data.

### First glossary record applied (2026-09-11)

Glossary dataset `3f2f83ec99644b4fa9c710584408c383` now contains the first of 59 imported glossary records, RCT, under its original `Design glossary` section. It reuses existing concept `ad9f48f68b804ddd9f9e8ffa5869ef02` from Health rather than creating a new concept for the abbreviation. The definition is written only in Education datasets' perspective. Original term `RCT` and pinned source URL are retained on collection relation entity `a352dea7181846f490c160f9f921e551`; the crosswalk is in `data/education/glossary-batch.json`. Section block: `f9630419ce50497d8560a85fbfb7b8e0`.

Proposal `159e8d1bd3244fc49bde4a0618def506` executed, with its bounty relation indexed. All 18 checks passed in `glossary-index-verification.json`. Browser verification shows the section heading and the complete imported definition in the table. Remaining glossary records still require identity and composite-entry mapping; the full migration remains incomplete.

### Verified first study publication (2026-09-11)

Saga Chicago trial data is now applied and indexed in Education datasets `dac259bad48a11adf97fe36857d85206`. Dataset: `52448bbbf0cd4c1bb8e949ebe9d628d2`; cited paper: `8812b3d57a4c4221a10c1024557a764a`. The batch contains four math estimates (ITT/TOT for two trials), one cost observation, the paper and dataset, and 13 properties. Cost price year remains unknown; the cost range is not a confidence interval. ITT/TOT rows are not independent trial replications.

Proposal `7917e16463d1408d99ecd401e5f95cbd` executed after our YES vote. The latest preflight found the configured personal space is now an editor as well as a member; this supersedes the earlier membership-only observation below. Proposal transaction: `0x65a26d8631876caa1edc412d8d8bdc4e9c0bba30085998aa9c656405331b615d`; vote: `0xda8bf9638c519193885893321660dd7aea7c9b8cffbce788a698a2695c969627`. The original nonce conflict was recovered with the same proposal ID and CID, without uploading another edit.

The Proposal → Bounty relation `fc5309a278284b47b4b38d8486a7118f` is indexed in personal space `d00460c203779d21d96fcfc6102d7a72`, targeting bounty `debce2de46094f299ee8e89fe244a9dc`. Bounty-link transaction: `0xa28092e791081283b5ff2f0be38af4cc2011947b743a87177d8a4e69ca1a2e3d`. Curator UI display has not yet been verified.

`bun run scripts/education-verify-saga.ts` passed all 129 checks across 20 entities: every encoded scalar value and relation ID, relation-entity ID, endpoint, type and position in the destination space, plus executed proposal and indexed bounty link. Evidence: `data/education/saga-index-verification.json`; stable IDs: `data/education/saga-registry.json`; transaction journal: `data/education/saga-publication.json`. Typecheck passes. This is only the first study batch; the full 339-record migration, other studies and frontend rendering remain unfinished. Earlier “nothing published” notes below describe historical preparation, not current state.

Tested API read shape (filter returned facts by `spaceId` to retain provenance):

```graphql
query SagaDataset {
  entity(id: "52448bbbf0cd4c1bb8e949ebe9d628d2") {
    id
    name
    values(first: 100) {
      nodes { propertyId spaceId text decimal integer }
      pageInfo { hasNextPage }
    }
    relations(first: 100) {
      nodes { id entityId fromEntityId toEntityId typeId spaceId position }
      pageInfo { hasNextPage }
    }
  }
}
```

Dataset entries property: `d66cd445e09a41809af46d86f083b41c`. Fetch its destination entities separately using the same bounded value query. Numeric API values are strings; SDK decimal operations use mantissa/exponent encoding, which the verifier converts before comparison.

Browser inspection after switching to Geo Explorers skills: the dataset page renders its five entry links, follow-up, outcome unit, source and URL. Individual Claim pages use Geo's specialized debate layout, which displays the title, description and source but hides the numerical property list. Therefore browser verification of every estimate field remains incomplete even though API reconciliation passed. Follow-up: make claim names self-contained statements of the numerical results, and expose the full estimates in a dataset table. Do not classify this UI gap as missing indexed data or republish duplicate entities.

Display follow-up applied: proposal `d8f3f5e5831f447994cdaa6b4559de1e` executed; its bounty link is indexed. Four estimate names now state their numeric findings, with standard errors, N and limitations in their descriptions. Dataset block `3fd5a3e82ccb4267bde900ce82fc077e` renders the four rows and numeric/source-location columns in the browser. All 27 display-batch API checks pass (`saga-display-index-verification.json`). Browser inspection found a remaining duplicate Name column: Geo supplies Name automatically, so the explicitly configured Name column should be removed from block metadata. The original batch verifier is a historical snapshot of the initial names; use the display-batch verifier for the updated names. Original numeric operations were not changed.

The redundant column was removed by executed proposal `216a06379da848fbbe0e185fb833108c`. Browser verification now shows exactly eight headers and four rows with the correct numeric values. `education-verify-saga.ts` now merges executed display changes into its expected state and passes 146 checks across 22 entities; it retains deletion checks for superseded display metadata. The source records remain unchanged. Tutoring source `src-021` metadata is corrected in the source overlay: the PDF is a 2021 design-principles research synthesis, not an RCT. Its original imported values are retained in `data`, while `publicationData` contains the verified metadata.

Geo Explorers ontology-advisor helpers confirmed root DOI (`7cb59354e30c48119e99ff62fcf61646`, Text), Sources (`49c5d5e1679a4dbdbfd33f618f227c94`, Relation), and Authors (`91a9e2f6e51a48f7997661de8561b690`, Relation). The mapping generator now reuses DOI and Sources. Authors remains unresolved until its targets have identity matches; it must not be emitted as a text value. Helpers were run with `geo_graphql.ENDPOINT` set to the verified `https://api-testnet.geobrowser.io/graphql`; the fork's helper still contains the older hostname. Bounded helper search output is candidate discovery, not proof of global absence.

Execution preparation update, 2026-09-11: cloned `../Education-Initiatives` at the pinned revision. `scripts/education-snapshot.mjs` saves the immutable source and hashes; `scripts/education-intake.mjs` preserves 339 records (321 core plus 18 catalog entries), 383 references, 22 research profiles and 26 contextual dataset links. See `data/education/intake-report.json`. Profile counts describe upstream acquisition metadata, not locally downloaded raw data or published Geo rows.

`scripts/education-preflight.ts` verified PK_SW's personal space `d00460c203779d21d96fcfc6102d7a72` is a member, not an editor, of Education datasets `dac259bad48a11adf97fe36857d85206`. The user confirmed we should publish proposals and they will ask Armando to vote. Use the member proposal workflow; no fast-path/editor assumption. Proposal submission is not applied data. No new migration proposal has yet been submitted.

Cross-space exact-primary-name evidence is saved under `data/education/discovery/`; it does not complete DOI/URL/alias identity resolution. Existing Dataset, Claim and Study types were found. The Study definitions and health-specific finding types need semantic review; matching names alone is insufficient. `src-068` and `src-093` share DOI `10.3386/w27476` and must share their resolved publication ID. Several other source titles are generated from URL filenames and need bibliographic resolution before publishing as named papers.

Bounty identified and allocated-user relation verified on 2026-09-11: [Education programs dashboard](education-bounty.md). Use `dac259bad48a11adf97fe36857d85206` for the user's initial dataset test publication; retain `ec349623f33236aee13c12dcd629ee81` as the bounty-owning Education space. The bounty requires cost-effectiveness/geographic comparisons beyond the current six-collection source contract. See the linked gap analysis before treating that migration as the complete product.

Preparation update, 2026-09-11: read and documented in the [migration plan](education-initiatives-migration-plan.md), based on pinned source commit `3cd97449ce9ca73cccb77efe22aac69cc56131e5` and publisher revision `42c644a`. The plan records 321 core records, exporter gaps, proposed mapping/identity rules, dry-run sequencing and acceptance gates. Target space, ontology IDs and live query contract remain unconfirmed; nothing has been published for this migration.

The publisher agent owns ontology discovery, mapping, migration preparation, publishing under its established user authorization, and reconciliation. The frontend task owns the browser UI, read adapter, Cloudflare hosting, and display of missing/loading/error states. Coordinate the data contract before either side hardcodes property or relation IDs.

This handoff requests a concrete mapping and publishing plan. It does not authorize speculative ontology creation, deletion of existing graph data, or immediate wallet transactions. Report the proposed target, operations, and unresolved choices before publishing unless the user's existing authorization in the publisher task already covers them. Never pass wallet keys through task messages or reports.

## Source inventory

Inspected `main` on 2026-09-11; record the exact commit before migration because the branch can change. The app is currently a static Next.js site whose `src/lib/content-loaders.ts` imports generated JSON.

| Source | Observed rows | Consumer need |
| --- | --- | --- |
| `content/initiatives.json` | 76 | Searchable initiatives and detail views |
| `content/sources.json` | 106 | Citations, findings, methods, caveats, source links |
| `content/dichotomies.json` | 21 | Evidence comparisons and uncertainty |
| `content/methods.json` | 51 | Method definitions and supporting URLs |
| `content/glossary.json` | 59 | Searchable definitions |
| `content/landing-cards.json` | Not counted | Editorial entry points linked to evidence |

Use `src/lib/content-schema.ts` as the source field contract and `scripts/generate-geobrowser-csvs.mjs` as an existing export reference to inspect. Do not assume its output matches the current ontology. The dashboard also references `research-data/dataset-catalog.json`; determine whether this dependency and any research assets belong in the first release.

## Information that must survive the mapping

- Initiatives: source ID/slug, name, years, category, theory of action, changed inputs, target population, evaluation designs/method tags, evidence strength, measured outcomes, normalization issues, finding, tags, and links to sources/comparisons.
- Sources: source ID, title, authors, year, method, outcome tags, evidence strength, finding, caveat, and original URL.
- Comparisons: title/slug, topic, framing, philosophical disagreement, left/right poles, position, uncertainty bounds, confidence, explanation, evidence strength, suggested interpretation, better question, common misreadings, revision criteria, related initiatives/sources, and editorial priority.
- Methods and glossary: definitions, groupings, and citations where available.
- Landing cards: claim, caveat, evidence strength, and links to comparisons/sources.

Keep editorial evidence ratings and continuum positions identifiable as curated assessments, with provenance. Preserve limitations alongside findings. Do not turn a descriptive source into a causal claim during migration. Do not invent numeric values for missing information.

Use existing Geo entities/types/properties where semantically appropriate. Preserve source keys in a crosswalk; do not equate a source slug or numeric ID with a Geo UUID. Shared sources should remain shared rather than duplicated for each initiative.

## Geo context to verify

- SDK: https://github.com/geobrowser/geo-sdk/blob/main/README.md
- GraphQL: https://api-testnet.geobrowser.io/graphql
- REST/OpenAPI: https://api-testnet.geobrowser.io/openapi
- Previously supplied candidate space: `784bfddae3f3976118c561bf28195b44`
- Previously supplied entity/page: `52b22516154345deac2a3d08b10e7cb2`

Both IDs exist on testnet, but this does not prove the space is the intended migration destination or that the signing wallet can publish there. Verify governance, permission, and target purpose. The sibling geo-publisher code defaults to the differently named `testnet-api.geobrowser.io` host; resolve endpoint/version compatibility explicitly.

## Return to the frontend task

1. Source commit and per-collection counts, including unresolved or excluded records.
2. Confirmed network, target space, permissions, and governance workflow.
3. Mapping from each source field to existing Geo type/property/relation IDs, including approved extensions and missing fields.
4. Stable source-to-Geo ID crosswalk, duplicate detection, and an idempotent rerun strategy.
5. Tested read-only GraphQL queries and sample responses for listing/filtering initiatives, one initiative with sources, and related comparisons. Scope facts to the intended space; do not silently merge conflicting values across spaces.
6. Publishing batch plan and dry-run report; after authorized execution, edit/transaction references, IPFS CIDs, indexing status, and reconciliation results.
7. For actual IPFS assets: MIME type, usable gateway, and persistence responsibility. Do not invent a direct-file URL for structured graph facts.

## Acceptance

The first end-to-end slice is one fully mapped initiative with its sources and available comparison links, queried directly from Geo and rendered in the frontend. The full migration must reconcile all intended source records and relationships. A changed Geo finding should appear after refresh/refetch without rebuilding the frontend, once indexed. Never silently fall back to bundled GitHub content while presenting it as live Geo data.
# School-finance comparison query handoff — 2026-09-11

Saga expansion handoff, 2026-09-11: dataset `52448bbbf0cd4c1bb8e949ebe9d628d2` now contains all 62 first-year ITT/TOT estimates from final Tables 3–4 (32 Study 1, 30 Study 2), not only the original four math effects. See `../data/education/saga-outcomes-registry.json`, `../data/education/saga-outcomes-query.graphql`, and `../scripts/education-verify-saga-outcome-filters.ts`. All 23 live query cases / 2,503 assertions pass; all four domain tables and their nine pages render. Expansion proposal `d5376b35f56d494d9b6d9ee6b5dd723b` executed and its bounty relation is indexed; 1,081 publication checks pass. The four original IDs remain reused. Cost titles/notes now describe nominal proposed budgets per available slot and the mixed-denominator range, without a constant-dollar price year.

Frontend constraints: retain study/estimand identity; do not count repeated table views as separate observations. Show four suspension estimates with unknown units and exclude them from normalized comparisons. Raw fractions for course failures and ever-arrested outcomes are not percentage-point inputs. Use exact source labels; the two CPS math labels require later instrument mapping for a combined conceptual filter. Shared control means, estimated control-complier means, FDR q-values, later-year results and broader implementation/cohort mapping remain incomplete. No new benefit-cost calculation is published. This is source-data and query readiness, not proof the frontend implemented all required comparisons.

Source-reported cost is now available as Claim `f72679e4612c4d2b9d4496626826f71c`, linked from the same dataset. Typed values: Cost amount `6ba2ce00db064687b108aa8449672886` = 4850; Real discount rate `f9d6085e34014562aae4021009f5f390` = 0.06; Price year `97e14050fc49467bb3aaf4d7eccbbb69` = 2013; Currency code `6e7371ca96cb44348f16932f77f55e75` = USD. Cost denominator `3a558d71454745a992c035040f648729` states present value per pupil over 12 school years. Dataset block `a1e1eb23fdd74a63b6ff61b54a4498e5` supplies the author model and limits. All 32 publication checks and rendered cost/percentage/year checks pass. Curator marks cost proposal `ace2e09fdff5484db2ce4b93e314b9d9` Accepted and its bounty link is indexed.

Frontend requirement: label this as an author-reported illustrative model and keep it out of automatic cost-effectiveness ranking while unreconciled. The source's approximate ratio and IRR are preserved only in qualified prose; local diagnostic recalculations are not Geo observations and must not be bundled into the dashboard as study findings. This is a display/integration requirement, not evidence that the frontend has implemented the exclusion.

Dataset `d4ed8f85a31949e0a08be2fa0ae61f93` in Education datasets `dac259bad48a11adf97fe36857d85206` now has 15 published preferred coefficients from Jackson, Johnson and Persico (2016), linked to Study `db495f402635466dbf63e71f970c67c2` and Article `4e5efbb09d0945ea98f2c3140be1cd0a`. Use [the saved GraphQL query](../data/education/school-finance-jjp-comparison-query.graphql) with the filters in [the live verifier](../scripts/education-verify-school-finance-jjp-filters.ts). All 13 cases pass; the JSON report preserves actual pages and exact-value/source checks.

Five outcomes each have all/low-income/nonpoor childhood groups. Population summary is a verified Text property with source-defined labels, not a general cohort relation. Preserve raw log-spending coefficients and clustered SE; missing p thresholds are unknown, not zero. Model totals must not become subgroup N. Do not rank cost effectiveness: the separate author cost illustration remains unreconciled. Geo's current table rounding does not change stored precision. Expansion proposal `365d868079624b4f9c0dcb64a2196f0c` has a freshly verified indexed bounty link. This adds comparison evidence and does not complete the full migration or bounty scope. See [study notes](school-finance-jjp-study-notes.md).
# Abecedarian/CARE Table 6 handoff — 2026-09-12 UTC

Live dataset: `70b356b5a7d34c6795f25ea93cdf0305`, table `e008d34703d44c448351bd46ba87b913`, source Article `ca413140fa584837a21c9eefc76e15c3`. Eleven author-reported benefit/cost ratios and SEs from the August 2, 2018 manuscript's Table 6 are published, executed and bounty-linked. Every estimate links through Related entities to both underlying trials: ABC `66657d9776214aec9cf816b8d50b644a` and CARE `32993a9fe1fa4d88b2c59405ccb8996e`. These are alternative forecasts using related data, not 11 independent studies.

Use `data/education/abecedarian-comparison-query.graphql` with destination-scoped facts. The companion query-verification report proves all-row pagination, three horizon filters and an absent-horizon case, plus exact source/numeric reconciliation. The original table is browser-verified across two pages. Reuse Benefit-cost ratio `45ce8dc80a74432e9a2483cd1c8e86e1`, Standard error `cc28953bd89e406096c9627021f4713d`, Follow-up period `c962e0fb4a3148e5ba125144691236a8`, unit `8405509cc7354655a348591349a5f025`, and locator `84dacbddca6a44079edb5e11a4c66b40`. Do not derive method/scope filters by parsing titles; dedicated mappings remain pending. Do not include these unreconciled models in a reconstructed cost-effectiveness ranking. Details, source-version limits, cost caveat and publication evidence: [Abecedarian notes](abecedarian-study-notes.md).
# Reading First Claim repair and teaching-success debate — 2026-09-12 UTC

All 52 non-achievement representations now state actual findings with appropriate uncertainty and observed/self-reported status, completing the wording repair across the 63 existing Reading First impact representations together with the prior 11 achievement repairs. IDs, estimates and links are unchanged; all 12 live Reading First filter cases pass. This statement does not cover separately published actual/counterfactual means or all other studies.

New evaluative parent `6feeeb9296154505b404e3f61b4ada04`: “Reading First's improvements in teaching justify judging the program successful.” Is factual=false. Traverse Supporting arguments `1dc6a843458848198e7a6e672268f811` for three instructional findings; Opposing arguments `4e6ec5d14292498a84e5f607ca1a08ce` connects the existing comprehension-required parent `8a6617309f7343d9994ceee76c0c550d` in both directions. Related claims `504e5776788844f6a77dba3ee811d8f0` also connects two print-engagement qualifications and the distinct decoding-success parent. Preserve these roles: nonsignificant results are not zero effects or automatically contradictions. Sources, Study, Dataset and Reading education Topic are linked. Pair rationales and exact IDs are in `reading-first-teaching-debate-model.json`, its registry/validation and `docs/education-debate-claim-design.md`.
### Perry debate and paired economic horizons (2026-09-12 UTC)

Published policy parents: sufficient grounds for preschool expansion `6d0c8aeccbfa424c8224d8d993070052`, further evidence required `2689e7979738434b8e7b1500fd9cef5f`. Their mutual Opposing arguments links and the favorable parent's directed Supporting arguments link to ratio Claim `9acd93c61285457585cc55d4853fb86e` are executed, indexed and bounty-linked. Projection caveat `480e118c24814b2fb2d13a96cbec7eaf` and sensitivity findings are Related-only. Parent Is factual=false; evidence=true. Use `education-debate-node-query.graphql`; Perry traversal passes 101 checks across six unique nodes. Render explicit roles rather than inferring them from Geo's Topic-based gallery.

New Table 7 estimate `03301dd1df1a4f3fb5ea857148b6ae53`: modeled pooled societal benefit/cost ratio 5.4, SE 2.2, through age 40, 3% discount, 50% tax-financing welfare loss, low murder valuation 13,000 USD in 2006 prices. It shares the study and assumptions with the existing age-65 ratio 7.1 (SE 2.3). A dedicated dataset table compares these two stable IDs. Do not count the two horizons as independent studies or call the age-40 model entirely observed. Exact Text horizon filters use Follow-up period `c962e0fb4a3148e5ba125144691236a8`: `Modeled economic horizon through age 40` / `Modeled economic horizon through age 65`; neither means 40/65 years elapsed. All 13 economic filter cases pass over 52 estimates, including an absent age-50 case. See [Perry notes](perry-study-notes.md) for publication receipts, schema and browser evidence. Numeric age-range filtering and broader mapping remain unfinished.
### Tutoring meta-analysis publication (2026-09-12 UTC)

Published the Nickow–Oreopoulos–Quan tutoring meta-analysis in Education datasets. Article `76f18ade420143779ca3c67183dc1dd8` and factual pooled-effect Claim `9b94180ac02b464a9bd1a2c873d75e97` are linked to the reused Early childhood education Topic. The Claim reports the source's pooled 0.37 SD effect and describes variation by tutor type, grade, subject and school-day setting; no standard error was invented. The Article page visibly renders DOI `10.3386/w27476`, NBER URL and the Claim backlink. Claim page visibly renders Verify/Dispute, source Article and the same caveat.

Proposal `f29f1aff1e134de69a1fb27b21d82c72` executed in `dac259bad48a11adf97fe36857d85206`; main transaction `0x216b5c249cfff8d8403442a128b6e03dd84fb6f50bbe7ce938dc8dbe19642a14`, bounty transaction `0x26c1815fa44bd0988ee3c9073c8fb470a78b484cd3d351bc06b566517bd27ccd`, execution vote `0x91b055f39fe08da210fc9236bdb54ca2afd9f307e054594569fac3a394cec284`. All 16 indexed operation checks pass, including the bounty relation. This is a source-level tutoring synthesis that complements, but does not replace, Saga's program-specific randomized trials.
### Tutoring meta-analysis DOI/rendering follow-up (2026-09-12 UTC)

The 2020 NBER working paper is published and bounty-linked as Article `76f18ade420143779ca3c67183dc1dd8`, with pooled-effect Claim `9b94180ac02b464a9bd1a2c873d75e97`. The Article page stores and displays the NBER URL and DOI text; its DOI link target is rendered by the current Geo frontend as `10.0.13.58/w27476`, although the source DOI is `10.3386/w27476`. Treat this as a frontend/link-rendering issue, not a changed identifier. Crossref metadata and the NBER page remain the authoritative source records.

The 2024 journal publication is now represented as Article `9f9393bc8142443ea40a7dc2fc2c1828` and Claim `25f0ec3189e4427cbdb294d2016b692d`, with its distinct pooled 0.288 SD (SE 0.029) estimate. It is linked as the same study lineage, not an independent study, and both versions remain separately queryable for dashboard comparison.
### Tutoring comparison findings publication (2026-09-12 UTC)

Three additional factual Claims were submitted to extend the tutoring meta-analysis beyond its pooled 0.37 SD result: professional/teacher and paraprofessional tutors had stronger average effects than nonprofessional/parent tutors; effects were strongest on average in earlier grades; and in-school tutoring had larger average impacts than after-school tutoring. The wording preserves the paper's “on average” qualification and does not invent subgroup magnitudes. Prepared IDs are in `data/education/tutoring-meta-comparisons-registry.json`.

Proposal `6d573806d8ff4ff59f8ffa7db5077fd7` executed and its bounty link was confirmed on chain: main `0xde76d20b6eb7c37855ab6ebf285c0b64b4f12280bd3df3a06dde7624901bf8c3`, bounty `0xa9c966ccc254f5d50b2aa009fde6f703995f9e34df4c63e66442f0784e9fefb9`, vote `0xfcd00a72b917d56b1238c5fc109e3bd614b403a9c726cdaa5eadae85cc61687a`. The generic verifier cannot consume this batch's separate comparison registry and reports missing entities; direct reads currently show the three IDs unresolved in the index. Treat this as pending indexing verification, not evidence of successful rendering. No duplicate proposal or resubmission has been made.
The three comparison Claims are now indexed. Direct verifier `tutoring-meta-comparisons-index-verification.json` passes all three IDs, types, concise descriptions, factual flags, Article links and Topic links. Browser tab 86 independently renders the professional-tutor Claim with its average-pattern caveat, reused Topic, source Article and Verify/Dispute controls. The earlier generic verifier failure was a batch-shape mismatch: it reads selected IDs from a standard field absent from this comparison batch, not a Geo data error.
### Tutoring journal-version reconciliation (2026-09-12 UTC)

The 2024 American Educational Research Journal version is a materially updated publication, not a duplicate copy of the 2020 NBER working paper. The journal page identifies first online publication on November 27, 2023, volume 61 issue 1, pages 74–107, DOI `10.3102/00028312231208687`, and reports a pooled effect size of **0.288 SD (SE 0.029, p < .001)**. It states that the largest effects tend to occur with teachers/paraprofessionals, earlier grades, at least three days per week and during school. The working paper's published abstract reports **0.37 SD** and does not provide the same SE in the abstract; these must remain separate version-specific Claims until a lineage relation and full estimate mapping are published.

Crossref metadata is saved in `data/education/tutoring-meta-journal-crossref.json`; the journal page is [SAGE/AERJ](https://journals.sagepub.com/doi/10.3102/00028312231208687). The journal Article and 0.288 SD Claim are published below as a linked version. The dashboard should expose version, publication date, pooled estimate, SE, inclusion criteria and moderator wording as distinct fields.
### 2024 tutoring journal version published (2026-09-12 UTC)

Published the American Educational Research Journal version as Article `9f9393bc8142443ea40a7dc2fc2c1828` and factual Claim `25f0ec3189e4427cbdb294d2016b692d`. The Claim reports the journal abstract's pooled effect of 0.288 standard deviations (SE 0.029, p < .001), with moderator wording for tutor type, grade, frequency and setting. It is related to, but does not overwrite, the 2020 NBER Article `76f18ade420143779ca3c67183dc1dd8` and 0.37 SD Claim `9b94180ac02b464a9bd1a2c873d75e97`; the two versions are one study lineage, not independent evidence.

Proposal `03d503fdf8614a938a514493bf24ff7d` executed with main transaction `0x37fde64533fc22fa5e927ae9b6012251b35ba2b0a676a000a1b4844f519f0e5f`, bounty transaction `0x722141eba18f84cf04afc6435636363ab32533c872a0509c60db44d026da2a06`, and vote `0x31ea92e04d676e042ad8c52c8ac78e2c1599cc8cad7dee3bdee22984171c7291`. Nineteen indexed checks pass. Browser tab 87 confirms the journal Article title and concise description; direct verification covers its Claim, source, version-lineage and bounty relations. The Article/Claim are now available for dashboard version-aware comparisons.

### Source-aware Claim readability audit (2026-09-12 UTC)

The current destination-space audit covers 344 Claims and nominates 12 for manual review. Source review confirms these are intentional evaluative parents, qualified projection/model records, aide-assignment null-result records, modeled-return scenario labels, or the tutoring pooled finding; the heuristic flags do not identify wording errors. No numeric values, factual classifications, or relations were changed. Keep `data/education/claim-readability-audit.json` as the review record and rerun it after future publication batches.

The geography coverage read now records counts by reused place: Ypsilanti 86, United States 68, Chicago 67, Tennessee 10, and Chapel Hill 2 (233 total). These counts are live relation results, not inferred study locations.

Program and audience filtering remains live and source-scoped: `scripts/education-verify-program-audience.ts` passes all 17 cases, including evaluation linkage, children audience, grades K–3, OESE administration, four literacy topics, and negative exclusions. The verifier's zero-result cases are intentional controls proving that unrelated programs and agencies are not returned.

### Education bounty coverage ledger (2026-09-12 UTC)

The aggregate journal scan in `scripts/education-bounty-coverage.mjs` found 68 executed education publication batches; all 68 have confirmed bounty-link transactions and none are missing a link. The machine-readable ledger is `data/education/education-bounty-coverage.json`. This verifies the publication mechanism across recorded batches, while the bounty's remaining content requirements still depend on completing structured program, population, implementation and comparable cost/outcome coverage.

### Cross-study geography coverage (2026-09-12 UTC)

Added a paginated, destination-scoped read at `scripts/education-verify-geography-coverage.mjs`. It resolves all 233 current Location relations (no remaining page) to five reused places: Chicago, Ypsilanti, United States, Tennessee and Chapel Hill. The result is saved in `data/education/geography-coverage-verification.json`; it is a coverage inventory for dashboard filters, not permission to infer locations for records without a source-backed relation.

### Source-to-Geo migration crosswalk initialized (2026-09-12 UTC)

`scripts/education-build-crosswalk.mjs` now creates `data/education/source-to-geo-crosswalk.json`, one durable row per all 339 pinned records: 76 initiatives, 106 sources, 21 dichotomies, 51 methods, 59 glossary entries, 8 landing cards and 18 dataset records. Each row retains source identity, aliases, URL/DOI where available, candidate Geo IDs/spaces, evidence, target-space changes and an explicit decision state. All ordinary rows are deliberately `unresolved-discovery` until graph-wide pagination supplies identity evidence; two NBER working-paper source rows (`src-068` and `src-093`) are held for one shared-Article decision. This is the idempotency and cross-space-reuse gate before generating any broad migration operations.

The first shared-identity decision is now complete: both `src-068` and `src-093` resolve by exact DOI `10.3386/w27476` to existing Article `76f18ade420143779ca3c67183dc1dd8` in Education datasets. The crosswalk records `reuse-with-target-space-additions`, so later migration operations must reuse that Article while retaining each source record’s distinct editorial finding/caveat rather than creating a second publication entity.

### Head Start Impact Study and linked expansion debate (2026-09-12 UTC)

Published the federal **Head Start Impact Study: Final Report** as Article `a0d0dfad77074f10a028bf89ccebb17f` and **Head Start** as Initiative `d03b32bd416443e49b9aa376e744cb03`. Complete all-space exact-name discovery found neither identity before creation; the migration crosswalk records both source `src-071` and initiative 43 as target-space creations. The source describes a randomized study of 4,667 children across 23 states, followed through first grade. It compares an offer of Head Start with the care arrangements available to controls, not a no-service condition.

Four factual Claims distinguish care access, end-of-program cognitive/health findings, limited sample-wide first-grade differences, and no-show/crossover interpretation. Policy parent `88d4b6e4b5f84305b2a302f803ef9e6a` asks, “Does the Head Start Impact Study support expanding Head Start?” and is explicitly `Is factual=false`. Two evidence Claims support it; the limited first-grade-differences Claim opposes it; the comparison-care Claim is Related-only. This prevents a generic “Head Start works” assertion and leaves the policy judgment open to debate. The records reuse the existing cross-space **Early childhood education** Topic `0df9fad9098d4b11bacb9af0f7a79182`.

Proposal `3eb14cdf7f1145bca187b01191ec7796` executed after fast-path YES. Main transaction `0x9c70e2a5ed95bee692dd51623ff7fcc2c9a0aa75b898f389b7f2c5040b7adc84`; bounty-link transaction `0x25e3a4fc1cadeff6bda087f7c18ea0091be5d66bbcdf9a68aaa5673f6c76b31f`; vote `0xeda7fc4e542f60e09354dc65c7e7bfb3db311aa431ee3967b1be8e852fdb7187`. `education-verify-saga.ts --batch data/education/head-start-batch.json` passes all 51 indexed value, relation, execution and bounty-link checks.

Implementation note: SDK `0.20.3` does not export `SystemIds.WEB_URL_PROPERTY`. Builders must use the live verified URL property ID `412ff593e9154012a43d4c27ec5c68b6` (Text) until the SDK adds the constant. The initial Head Start builder caught this in local construction before a payload or transaction was created; the corrected builder and `bun run typecheck` pass.

### Head Start third-grade follow-up (2026-09-12 UTC)

Published the distinct 2012 **Third Grade Follow-up to the Head Start Impact Study: Final Report** as Article `c183f28d3bc34439b797138e50d5c1f3`, Related to the 2010 report rather than treated as a second independent trial. Complete all-space exact and substring identity discovery found no pre-existing report candidate. Its three factual Claims preserve the full study horizon: early preschool improvements alongside few impacts from kindergarten through grade 3; one remaining language/literacy impact per age cohort at third grade; and social-emotional findings that differ by cohort and parent, teacher, or child reporter.

The first two follow-up Claims are directed Opposing arguments for the existing Head Start expansion question `88d4b6e4b5f84305b2a302f803ef9e6a`; the reporter/cohort qualification is Related-only. Dashboard queries must present the 2010 and 2012 reports as one trial lineage with separate follow-up horizons, and must never reduce “few impacts” to a zero-effect claim or a conclusion about unmeasured adult outcomes. The records retain the comparison-care limitation and reuse the existing cross-space Early childhood education Topic.

Proposal `a256d09afc084a659848546b70cf84f2` executed after fast-path YES. Main transaction `0xe278645e8513b3fd181bf4703cff7dbec576c04862bc5f2809d363d931477d6a`, bounty-link transaction `0xe3de34a324577622498528fc66ec9005de46e99f18f93a6526d44c290e0461b9`, and vote `0x8000803a449ec58d1eedeb48cbd413b49d5a7a9f445197fa0cd4094802efb681` are confirmed. `education-verify-saga.ts --batch data/education/head-start-third-grade-batch.json` passes all 31 indexed checks.

### Head Start third-grade data-access resource (2026-09-12 UTC)

Published Dataset `3e4404bac6e842b598e0b0a809a4928f`: **Third Grade Follow-up to the Head Start Impact Study (HSIS), United States, 2007–2008**, with ICPSR DOI `10.3886/ICPSR35003.v2` and its archive URL. It is linked to the 2012 report, Head Start initiative, and Early childhood education Topic. The associated factual access Claim `b63ab84606664cbfae0bd503922beff9` makes the boundary explicit: documentation is public, while protected analytic files require a restricted-data agreement. It does not republish, imply access to, or authorize use of restricted microdata.

Complete all-space exact Dataset-name discovery found no candidate. Proposal `69f1e88380bf428982687c92430ffb56` executed after fast-path YES; main transaction `0xc2c51bfd447da7d608c17f7980b82e635ea984a65eb5d469a4630919e9909696`, bounty transaction `0x54e187949a9f9ac118964dc8399e4884d3d2dc469ee07636f765b0a88ac2337a`, vote `0xfd6d5470bee121fdf18bdce683ba791d36287aafc676ec0916d92f8c0878e482`. The generic verifier passes all 18 indexed checks.

Builder correction: the first local TypeScript pass caught an extra third argument to the two-argument `check` helper in `education-build-head-start-data-resource.ts`. The graph payload had already been constructed and independently verified after publishing, but subsequent combined publish commands must stop immediately on any validation/typecheck failure rather than continuing to the next command. The source is corrected and `bun run typecheck` passes.

### Chicago double-dose algebra (2026-09-12 UTC)

Published Article `fc6318d0e2bd4ad588fdb77e317105fd` for Cortes, Goodman and Nomi’s 2015 *Journal of Human Resources* study, retaining its journal DOI `10.3368/jhr.50.1.108` and the NBER working-paper landing page `w20211`. Initiative `965cad4502d449579f74866a4ed922a8` represents the Chicago policy, not a universal “extra math time” intervention. It reuses the established Chicago Location (`e82f3bfc991a4578aa8b7a503640b95e`) whose Illinois parent relation was verified before publication.

Three factual Claims retain the policy’s assignment threshold, the paper’s reported credits/test/graduation/college-enrollment pattern without inventing a shared effect size, and the below-average-reading-skill heterogeneity. The descriptions preserve the regression-discontinuity scope near the cutoff and implementation/peer-composition condition; no claim generalizes the result to all students or settings. Complete all-space exact Article and Initiative discovery, plus a completed semantic-family substring search, found no existing candidate.

Proposal `a8073fbd05e64838a241cfab834045f1` executed after fast-path YES. Main transaction `0x1586b64893598dc9a9a5974dbcc41da951c6b1f09170dcea05795db7d86f8de2`, bounty transaction `0x60f5956c85c963c049ed9103916a967279d0de3e7c35382f069576823dd7a33f`, and vote `0x364b0d471ba3c4e05399a9162c7f27a7148cbcc72a206d7c887ce9471db5f0b2` are confirmed. The first indexed read occurred before the Article was indexed; the same batch was polled without resubmission and then passed all 35 value, relation, execution and bounty-link checks. Treat short-lived `Entity missing` read errors immediately after chain confirmation as indexing latency only after polling the same proposal and preserving the journal.

### EWIMS first-year randomized evaluation (2026-09-12 UTC)

Published IES/REL Midwest Article `f13bc8619a934875b46f6ca296454dd5` and EWIMS Initiative `0728c2e68dcc4d7fa50a0dd61b787cae`, both reconciled in the migration crosswalk to source `src-060` and initiative 69. The 2017 report randomly assigned 73 high schools in three Midwestern states and measures first-year results only; it must not be presented as a graduation-rate result.

The records provide separately filterable factual Claims for chronic absence (10% EWIMS vs 14% control; **−4 percentage points**), one-or-more-course failure (21% vs 26%; **−5 percentage points**), and insufficient credits (14% vs 14%; no statistically significant effect). Each stored Decimal has a unit explicitly identifying EWIMS-minus-control percentage-point risk after one year. Additional Claims preserve the school-level randomization and low/challenging implementation of the seven-step process. The dashboard must keep risk indicators, GPA, credits, and graduation as distinct outcomes; a 0 stored for the reported 14%/14% insufficient-credits comparison is a source-reported difference, not evidence that every possible effect is exactly zero.

Proposal `33947c1e40d44fb294c5223b5169699b` executed after fast-path YES. Main transaction `0x7803b8f82fda6237ae63ef716f70232394450ee1ed9e8120b5244f76c37a3ea7`, bounty transaction `0xf6f325222d3582246fd4b1a0137b79d032dd4d1145285d28f45750e08603cba2`, and vote `0x753d73dc77b7b72958aaec80ab7319ef2fd5d7439c05b9e7b1a85e8a4bf3c6e6` are confirmed. `education-verify-saga.ts --batch data/education/ewims-batch.json` passes all 48 indexed checks; TypeScript passes.

### Career Academies eight-year randomized follow-up (2026-09-12 UTC)

Published MDRC Article `724040519bc34a14b00481a30c89eb38` and Career Academies Initiative `d9a9f591762b463ba192d99ba922263d`. The report follows more than 1,400 applicants randomly assigned across nine high schools, and therefore represents the complete multi-component Academy model at participating sites rather than a single career course or generic CTE intervention.

Dashboard-ready Claims separate the historical earnings result from education outcomes: average earnings were **$2,088 per year** (11%) higher over eight years, totaling $16,704, all in **2006 dollars**; the reported young-men subgroup gain is **$3,731 per year** (17%); and there is no overall postsecondary-attainment advantage. Do not compare these nominal 2006-dollar earnings directly with current dollars, cost observations, or effect sizes. Do not present the subgroup result as an all-student result.

Proposal `1ffe20eb58e94731b78eeb88c5f8d8e8` executed after fast-path YES. Main transaction `0x227994d0ea9ca3e9ac66d4319b82e9caa65f21da411ba044545f0356a0c3dc43`, bounty transaction `0x87c5a8bc0db735f0f2b3d31efd2ba6ea18e6da2224081248fe923e9172503dde`, and vote `0x10449447a777e34d6635c5c419ba0aae0d0903427b51bc451c7376fb77948ec8` are confirmed. `education-verify-saga.ts --batch data/education/career-academies-batch.json` passes all 40 indexed checks; TypeScript passes.

The Reading First final report source `src-015` is also resolved to the existing Article `db0ea33548454e1780c78231066b7d71`, based on the exact published report identity and reviewed source URL. There are now three resolved source rows (two source keys sharing one NBER Article, plus Reading First); the remaining rows require the same graph-wide evidence before any broad entity creation.

Source `src-014`, whose short source title is “Report of the National Reading Panel,” now resolves to the existing full-title Article `bb326cc9809b4bf89d161701f49b74d9` using the official NICHD report URL and the Article’s source-specific description. It is background literature and must remain distinct from Reading First’s funding evaluation. The crosswalk now has four resolved source rows.

### No Child Left Behind migration slice submitted (2026-09-12 UTC)

The first source-driven initiative batch has been proposed and bounty-linked. It creates Article `d83f04c4e8594faeb657a226c26c134c` for Dee and Jacob’s NBER working paper *The Impact of No Child Left Behind on Student Achievement* (DOI `10.3386/w15531`) and Initiative `ed3fbb4f693c4785955b627ea98c03fb` for No Child Left Behind, with direct source and related-Article relations. Proposal `6631d503e9534d57b089f04752520d74` transaction `0x104521ebedd2d9054621a9ec913313283721beb83448075b6f926bad0b5c01a2`, bounty-link transaction `0x531021a30413c65b34948a0b16d0cb4a7656424d3f12cb1c18c72cee55ed4c9c`, and YES vote `0x7255495757c019de640eaed489299b02efed771cbf7953cfb56d06f5c7cb72dd` confirmed on chain. The immediate and 15-second index reads did not yet resolve the Article, so this remains indexing-pending; do not resubmit or create duplicates. The batch intentionally contains no numeric effect Claim until the paper’s reported estimates are extracted and source-checked.

Indexing subsequently completed: `education-verify-saga.ts --batch data/education/nclb-batch.json` passes all 13 checks for both entities, source/related-Article relations, types, values, proposal execution and bounty link. The crosswalk now records `src-003` as reusing the indexed Article and `initiatives:4` as a `created-target-space` Initiative. This establishes a safe anchor for future NCLB claims, methods and comparison relations.

### No Child Left Behind source findings published (2026-09-12 UTC)

Three factual Claims are now indexed and bounty-linked from the NBER Article and NCLB Initiative: fourth-grade math effect-size estimate `0bf6eec672674e449f3473ce134e77cd` (0.22 by 2007), eighth-grade math evidence `8a6350c64b7b49ceb5860ef6baf77e6c`, and the fourth/eighth-grade reading null finding `96e166271b344f27b932e83442381be3`. The numerical claim stores 0.22 in Effect estimate value and explicitly labels its unit as the NBER abstract’s unspecified effect-size scale; no standard error or standard-deviation conversion was invented. The other two Claims remain qualitative because the abstract does not report a single compatible scalar.

Proposal `a04e1124b8ec4ebd8f985f426ec19d6d` transaction `0xb0f4472314b8d37d8a6736f8260fd6eb88ec6f54e08e4ad99fe720ed96f43c92`, bounty-link transaction `0xb61cc28287e9b84ceaa57fb2f7ecc8980dd8934e994188beba762921d1212e55`, and YES vote `0x83b367f05c5a4f6aa164be213f4979142914e2a2f09fcd685e2a86252f828f35` confirmed. All 22 index checks pass. During the first submit, the SDK rejected a raw decimal string (`DECIMAL exponent outside int32 range`); the builder now serializes Decimal values as integer mantissa plus exponent, matching the existing publisher scripts. No operations were submitted in the failed attempt, and the corrected proposal was submitted once.

### National Guard Youth ChalleNGe three-year randomized evaluation (2026-09-12 UTC)

Published MDRC Article `cfecb9c0a0e34175b228c35f8db7cdea` and Initiative `c52c01e8bab14e64b56b8ceb7c244da5` for the ten-site randomized National Guard Youth ChalleNGe evaluation. The program is a high-intensity pathway for eligible out-of-school youth, with a 20-week residential phase and a year of mentoring; it is not evidence about ordinary classroom programs.

Three factual Claims retain the actual three-year estimates: diploma/GED attainment was 72% versus 56% (`1a7f36f09ac54d4daa4dffbaa7cacefe`), employment 58% versus 51% (`d5be2a41a8bd4c9c8a1e0d061055ab1f`), and past-12-month earnings $13,515 versus $11,248 (`83e32af1f37c4ecfa14894b1f8b7c02b`). Percentage differences are stored as typed Decimal values with explicit percentage-point units. The reviewed source does not establish an earnings price year, so the dollar observation is excluded from price-year-sensitive comparisons and is not a benefit-cost result.

Proposal `9a1b44cd2ff34904ae82d6880f7652e0` executed after fast-path YES. Main transaction `0xd218b9110c0837c43f097d21ca4f706fb58b9c5fe4df39a3535113a802bb934a`, bounty-link transaction `0xb15e2355d5ccaeafe07c2bb92a2ecb65d1256bc9a9073d74771b84b6baa20954`, and vote `0xcfd02cdd171838b861fcc07d10f8639780bcc0e79c8ef38a28eaca17ab006766` are confirmed. `education-verify-saga.ts --batch data/education/youth-challenge-batch.json` passes all 36 indexed checks.

### National Guard Youth ChalleNGe expansion debate (2026-09-12 UTC)

Published evaluative parent Claim `597e5ee8194645c4bb86936d67fca08f`: **“The three-year Youth ChalleNGe results justify expanding the program for eligible out-of-school youth.”** It is explicitly nonfactual, concise, and linked by Supporting arguments to the three factual diploma/GED, employment and earnings Claims; mutual Related links preserve navigation without falsely treating the policy judgment as a report conclusion.

The parent’s source relation reaches the MDRC Article and its Related context reaches the Initiative. All-space exact-name and semantic-family discovery returned no candidate before allocation. Proposal `e2f3a2e63f52483eb0c194e6b79f26b2` executed; main transaction `0x9ce8c38cdf0fa1ed9dd70263eaf0f46e7894b259fbfc06acd863bb4456f747c8`, bounty transaction `0x4fab42bc1c275d61cfbd176b5b0493bf0bcea97cbbdc998735b1ea316f38bcaa`, and vote `0x616174f4ce03170f3516d9baea9416e69eed219efa392a8d5ec86c6cd785d2ec` are confirmed. The generic verifier passes all 17 checks. Browser tab 88 confirms the full title, two-sentence description, Agree/Disagree controls and source Article; Geo’s native view does not label supporting edges, so the comparison frontend must traverse and label them directly.

### Dashboard contract extension: Youth ChalleNGe (2026-09-12 UTC)

`education-verify-dashboard-comparison.ts` now retrieves the three factual Youth ChalleNGe findings with the other four intervention families. It checks that the linked nonfactual expansion parent is excluded from evidence rows using the live Is factual Checkbox rather than title-based filtering. All five live cases pass. A first edit produced a local TypeScript interpolation error before the verifier ran; it was corrected before any Geo write, and `bun run typecheck` plus the live verifier pass.

### STAR modeled-return Claim repair (2026-09-12 UTC)

Repaired the three internal-return Claim titles so each states its actual model result and wage-growth assumption (5.2%/0%, 6.2%/1%, 7.3%/2%). Values and relationships are unchanged; the titles and concise descriptions now explicitly identify modeled age-18–65 earnings returns, not observed investment returns. Proposal `706b634e17694c3081d02452c70667b4` is executed, bounty-linked and index-verified (11 checks); details and receipts are in `docs/star-return-publication.md`.

## Youth ChalleNGe cost-benefit source identified — 2026-09-12 UTC

The next source-backed extension is Perez-Arce, Constant, Loughran and Karoly (RAND, 2012), *A Cost-Benefit Analysis of the National Guard Youth ChalleNGe Program* (ERIC `ED529935`; RAND technical report `TR1193`). The U.S. Department of Labor CLEAR profile identifies it as a descriptive cost-benefit analysis using the same ten participating sites as the 36-month randomized evaluation, not an additional causal-effect study.

Source-reported 2010-dollar model observations are: operating cost **$11,633 per admittee**; total societal cost **$15,436 per admittee** after opportunity costs and tax deadweight loss; modeled total societal benefits **$40,985 per admittee**; modeled net societal benefit **$25,549 per admittee**; and model return on investment **166%**. These combine observed impact estimates with lifetime earnings, welfare and crime projections. They must be linked to a separate Article/version, typed as author-model outcomes, retain the 2010 price year and per-admittee denominator, and remain excluded from automatic ranking or direct comparison with Youth ChalleNGe’s observed three-year earnings difference.

Before publication: complete cross-space Article/name/identifier discovery; inspect the RAND report tables and assumptions; reuse existing cost/benefit/price-year schema only after live validation; then publish a separately bounty-linked batch and extend the dashboard contract with explicit model/exclusion fields.

### Youth ChalleNGe operating-cost source (2026-09-12 UTC)

Published RAND Article `4abdb70198d949288df61d50f0b458cc` and factual cost Claim `8eaead9541df4ee7af83f8d952f742f0`. The Claim reports the RAND source’s **$11,633 average operating cost per admittee in 2010 USD** across the ten evaluation sites, with typed Decimal cost, Integer price year, currency and denominator. It is deliberately separate from total societal cost and the lifetime cost-benefit model.

Proposal `38e46f6a12b8445f89834d634ad94bdb` executed; main `0xaed8ceea991adbb07ec9be633732bf2c32d9909462d495f12b2c0dc6caba960b`, bounty `0xfec4e80330cc888270bb13fdb93e2fd7c921845d8fe7e5cac6d818f15857cdd4`, and vote `0x9f920a774d96dc0bcc813c432d4046b8a87c8180ff07abb0757b7128ad31a2f0` are confirmed. The generic verifier passes all 16 indexed checks. The full lifetime benefits/ROI model remains a separately transcribed future slice and must not be implied by this operating-cost observation.

### Cost-aware dashboard retrieval repair (2026-09-12 UTC)

The multi-intervention comparison query now selects Integer values and verifies the Youth ChalleNGe operating-cost Claim’s amount, USD, 2010 price year and per-admitted-cadet denominator. It continues to exclude the nonfactual policy parent and treats the separate observed earnings difference as price-year-unknown. All five live cases pass. A PowerShell template-literal interpolation error was caught by TypeScript before the live verifier ran; it was repaired locally and did not affect Geo data.

Browser verification (tab 89): the operating-cost Claim visibly renders its concise dollar/price-year title, model-scope caveat, Verify/Dispute controls and the RAND source link. The dedicated Claim page does not show the typed cost/year/denominator values, so the dashboard must use the saved GraphQL contract rather than scrape the page.

### Youth ChalleNGe modeled societal cost-benefit observations (2026-09-12 UTC)

Published three separately typed, factual-but-model-based RAND observations linked to the RAND Article and Youth ChalleNGe initiative: total societal cost `232851e4b7ca4f20895d1b754f5e8903` ($15,436), total societal benefits `b6fac88149964f25813479ea8afb6d5c` ($40,985), and net societal benefit `f89a900972f24779bc3cf7e4cf32e9e2` ($25,549), each per admittee in 2010 USD. Their descriptions preserve the lifetime-model basis and do not claim observed outcomes or a guaranteed return.

Proposal `dbdd085d63d145d68c6467eb8038d118` executed; main `0x44d0a80a649c11b8f3cde5c8fdf9ff71619264eba69d755322c8852525a4a92d`, bounty `0x2693b7da47ab3f60eaaeaed420fad7bde738430b003234288f2a8206292fd145`, and vote `0xcf6470a5e7cab29db38bdbe9a882c7b092bb89e631a227e570d2f743e19f554c` confirmed. All 32 index checks pass. The 166% ROI is deliberately withheld until its exact ratio representation and assumptions are separately mapped; no automatic cross-program ranking is authorized.

### CUNY ASAP source preparation (2026-09-12 UTC)

Created `data/education/cuny-asap-publication-record.json` for MDRC’s 2020 CUNY ASAP eight-year randomized cost analysis. It retains $13,838 net cost per program-group member, $9,162 additional cost per degree, and source-context 18/10 percentage-point three/six-year graduation effects. The reviewed primary page does **not** establish a dollar price year, so no publication batch should apply a price year, normalize the values, or rank them. Complete all-space exact and semantic identity discovery returned zero candidates. The CUNY trial, Ohio replication and 2026 14-year CUNY follow-up must remain separate lineages.

### CUNY ASAP source identity (2026-09-12 UTC)

Published MDRC Article `536b5cd10a65417ea4e1d52b3322dcad` and Initiative `3f6f2b82f8b94d3c85a5198a40e34199` for the original CUNY ASAP eight-year randomized cost-analysis lineage. No dollar observations were included because the reviewed source page does not establish their price year. Proposal `457cf41be8004220af7b196ab252a0e6`, main transaction `0x19915d73bd1a3b42aef3becf96bfc01bf156bd00a5eb5afcfa3979a5e89a21a1`, bounty `0x83395cdf28f1671b2bf2855564437fc91b1525417b9ad058850730d560fbd2c9`, and vote `0x4f4a08f05638937d9315df91a52294cd8cfc5a084ceecd9fbcf11b30991bd742` are confirmed; 11 index checks pass.

Builder lesson: every batch validation must include `ready`, `checkedAt`, and an `opsHash` identical to the batch SHA. The initial CUNY submission was rejected locally by this guard before a chain transaction; the journal then existed and blocked automatic rebuild. The unchanged payload was safely reconciled by adding the missing freshness metadata and rerunning preflight. Do not bypass the guard or rebuild a journaled payload.

CUNY price-year correction: the primary MDRC PDF’s cost-method footnote states that the average direct cost was put in **2019 dollars** before distribution across Years 1–3. The same paper reports $13,838 net CUNY cost per program-group member (43,723 versus 29,885) over eight years; $9,162 higher average cost per associate degree (84,087 versus 74,925); and a 12-percentage-point eight-year associate-degree effect (52% versus 39.9%). The previously recorded unknown-price-year gate is resolved for these direct-cost values only. Source locators: PDF pp. 13–14 (printed), especially footnote 36 and Table 4 discussion. Preserve the CUNY cost perspective and do not generalize to Ohio or earnings.

### CUNY ASAP dashboard extension (2026-09-12 UTC)

`education-verify-dashboard-comparison.ts` now includes a CUNY ASAP case and requires the stable net-cost Claim ID. The live query returns six intervention families. The first edit contained a literal PowerShell `\\n` escape and TypeScript stopped it before it ran; the repaired contract passes TypeScript and all six live cases.

### CUNY ASAP next extraction gate (2026-09-12 UTC)

The next CUNY ASAP records should be separate factual Claims for the eight-year associate-degree effect (+12 percentage points; 52% versus 39.9%) and the $9,162 difference in average cost per associate degree. Do not publish them as a single “cost effective” claim: the report explicitly says that after eight years ASAP is no longer cost-effective in terms of cost per associate degree. Keep the effect, group means, CUNY perspective, 2019-dollar basis, and eight-year period distinct. The source Article/Initiative and net-cost Claim are already live and bounty-linked.

### CUNY ASAP eight-year outcome and cost-per-degree publication (2026-09-12 UTC)

Published two separate factual Claims from MDRC’s 2020 eight-year CUNY randomized-trial cost analysis: associate-degree receipt `3f683173e12241f085f0123ba443abe0` (+12 percentage points; 52% versus 39.9%) and average cost per associate degree `df9121e211a44e76acc6fe1055f12caf` (+$9,162; $84,087 versus $74,925 in 2019 USD). Both reuse Article `536b5cd10a65417ea4e1d52b3322dcad` and Initiative `3f6f2b82f8b94d3c85a5198a40e34199`; their descriptions state that they apply to the original CUNY trial and that the cost-per-degree comparison is not a benefit-cost ratio. The source says ASAP was no longer cost-effective on this specific cost-per-degree measure after eight years, so no contrary policy or efficiency Claim was created.

Complete all-space Claim discovery returned no candidates before IDs were allocated. Proposal `92b9fbfb999f4124b914b44394a21c95` executed after Fast Path YES; main transaction `0x36f3923f0707e0d98d20695ad22cdea75b850be49e746f43ef7e4e451e3da26c`, bounty-link transaction `0x643110867c8c2a0c293491f27d59ad3d9840c91d7e6cbdc5c3aa7411ab98fbfa`, and vote `0xfbb436da9ef5c20fa1dceae37c06c5d1c5090e71552eaf889741d03c5a57753a` are confirmed. `education-verify-saga.ts` passes all 20 indexed checks; the strengthened dashboard verifier requires all three CUNY rows and passes six intervention families. Browser tab 91 confirms the associate-degree Claim’s full statement, two-sentence scope, Verify/Dispute controls and Article backlink.

Implementation finding: direct entity paths use `/space/{space-id}/{entity-id}`. The route `/entity/{entity-id}` returns a 404 in the current Geo web frontend. This affects browser verification links only; GraphQL IDs and dashboard reads remain unchanged.

### CUNY ASAP continued-investment debate publication (2026-09-12 UTC)

Published evaluative parent Claim `005ffa0ca55b4023badd4e8a777bc4ea`: “CUNY should continue investing in ASAP for eligible community-college students.” It is explicitly nonfactual, so Geo renders Agree/Disagree, and links to the MDRC Article. The +12-percentage-point associate-degree finding supports the proposition; the $13,838 net educational cost and $9,162 higher cost per degree challenge it. These role assignments state each factual record’s relevance to the policy question; they do not misattribute a recommendation to MDRC or treat one trial’s measures as independent studies.

Two complete all-space Claim searches found zero candidates before the parent ID was allocated. Proposal `4aa8fe6678fb481bbecba73deef63ff8`, main transaction `0x552dfa0262ae88caec0de30a9cf59b493f84412b9729206bbc4edc7b1adfd84b`, bounty-link transaction `0x96f59de27d09dbf9ad4b4238ec75fc8c16dfc4579f5cccccad46c47c2f72fd6a`, and Fast Path vote `0x67db4e1872f4a939b838b120d8bc16c979df9e002c828a779eb33df8bff4b18e` are confirmed. `education-verify-saga.ts` passes all 17 indexed checks. Browser tab 93 confirms the concise proposition, scope, Agree/Disagree controls and Article backlink. Geo’s native Claim page does not label support/opposition edges; the dashboard must traverse the saved argument relations and label them itself.

### School-finance factual classification and debate layer (2026-09-12 UTC)

Three source-backed JJP observations were classified as factual Claims after discovery that they still rendered Agree/Disagree: the low-income education-years estimate, low-income adult-poverty estimate, and qualified author-reported cost illustration. Classification proposal `85b14aa645634eeaab1fe1cbcffaa288` is executed, bounty-linked and index-verified; it changes only the Checkbox, not source results or policy meaning. The first immediate reads showed normal pre-index state, and a same-payload recheck passed without resubmission.

Policy parent `4b1c0a6c5d4a49af972a5d04b3e51861` is now published, bounty-linked and index-verified. It asks whether states should use school-finance reforms to increase K–12 spending for low-income students; the two low-income model estimates support it and the spending-cost illustration challenges it. It is nonfactual, uses Agree/Disagree, and preserves uncertainty about priorities, implementation and alternatives. Complete all-space duplicate discovery was recorded before creation. The dedicated dashboard must retrieve explicit Supporting/Opposing relations because Geo’s native Claim page does not label them.

Verifier maintenance: the historical coefficient batch now reports name/description mismatches because the later Claim-copy repair intentionally improved 14 Claim pages. The copy-repair batch passes; do not revert reader-facing copy to make an immutable historical payload verifier pass. Use the dedicated 15-row filter verifier for current numerical/schema coverage.

### Abecedarian age-30 observed outcomes (2026-09-12 UTC)

Published four factual Claims from Campbell et al. (2012), all tied to the existing ABC Study and observed-outcome Article `a72a792642aa46b497587313102bfe39`: more completed education (`7f43e163663249928d51b7389e00fe94`), bachelor’s-or-higher attainment (`8a99d1f35acb43aeb68bcfc8870f189b`), the non-significant income-to-needs comparison (`d6d0402187dc49e7a337f18df4743194`), and the full-employment threshold (`309aaaf476c644e69980f6173ed3bcc9`). Each page gives the study’s actual estimate and its scope, instead of a generic outcome label. The claims are ABC-only, not pooled ABC/CARE forecasts; earnings means and cost-effectiveness assertions remain unpublished.

Proposal `bb42c2f587b248f4a9ee354a926e783b`, main transaction `0xe07462e0b74e0c51b8a60ec8ed1a0dfffeca8000b448e445d17474b3b6f6c429`, bounty transaction `0xf5edaa4d356c2d64b98bf3de9bfb5ddcf4b1af10f4af0b2413d4435dbbf3e8a6`, and Fast Path vote `0x50bcc242cd1d7aefc4f717100b582ae6e0465f92148951630d8baedfd5a7e17c` are confirmed. The first vote read occurred before the DAO indexed its new proposal; after a short recheck, the same payload voted and all 35 index checks passed. Treat this as propagation lag and never respond by resubmitting the batch.

The comparison verifier now uses both ABC Study and the observed-outcome Article for this family. A Study-only query returned the four observed findings plus eleven ABC/CARE model forecasts; source filtering now returns exactly the four age-30 Claims and records the forecast IDs as intentionally excluded. This preserves the source-version boundary in the dashboard.

### Abecedarian early-childhood policy debate (2026-09-12 UTC)

Published nonfactual parent Claim `58caa8fd523742978fa07d54722d918a`: “Governments should expand high-quality early-childhood education modeled on the Abecedarian program.” The observed education-years, bachelor’s-degree, and full-employment Claims support the proposition; the non-significant income-to-needs result challenges a claim of broad economic improvement. It does not attribute a recommendation to the authors or pretend that the null result is a separate opposing study.

Proposal `c2fe1e4260224d789e64272de9f7da94`, main transaction `0x349ea36a393de1be64847f6e245ac97f4c5d8af872aa364084e8382eba008c08`, bounty transaction `0x01ed2348995bc3c6efec08fbece43e6893be75eb5e4e55afa73a9c8c3b3d30a8`, and Fast Path vote `0xda0bfcc1fa96484ae4df4d452ee5440928b0dace79b7394ff23b00ac4011308f` are confirmed. The index took about one minute to expose the parent; the same payload then passed all 20 checks without resubmission.

### Tutoring delivery-setting debate (2026-09-12 UTC)

Published nonfactual parent Claim `7237824ca62e4790b4d9d882f47ab0bd`: “School systems should prioritize tutoring delivered during the school day.” It has explicit Supporting arguments from the 2020 pooled experimental tutoring effect and the source’s in-school-versus-after-school subgroup finding; the 2024 journal pooled estimate is Related only because it is a later version of the same research lineage, not independent opposition.

Proposal `bc8b456a918b4f22a5feccc877671d66`, main transaction `0x0ac23a36007666490d33a0c2706713c4089c5f05ce86a2418b9c1be6e24d2fb6`, bounty transaction `0xed4f3ae9ba092919effd62090026e1246ed885b8cf711163578eaa9517d60506`, and Fast Path vote `0x86b66b5eab90be6ef4d478d9c460be84cd21ce606a35e593cc1f33bdce67bfc1` are confirmed. The index reached the parent after a short delay; all 15 checks pass. The proposition does not claim that the synthesis resolves implementation cost, staffing capacity, or outcomes for every local program.

Browser review confirms the parent renders its complete two-sentence rationale, Agree/Disagree controls, and the 2020 meta-analysis backlink. The three earlier tutoring batches were reverified directly (16, 20, and 19 checks) and their stale local journal labels were corrected to reflect their already indexed chain state.

### Youth ChalleNGe baseline modeled return (2026-09-12 UTC)

Published factual Claim `c6d7715eae7445609c3bf791d05168d2` from RAND TR-1193 Table 5.1: a 2.66 modeled societal benefit-cost ratio, which the report describes as a 166% return on investment. The claim preserves the 3% social discount rate, 15% tax-deadweight assumption, 2010-dollar baseline and modeled lifetime scope; it does not call the ratio a three-year observed treatment effect.

Proposal `c8411e90330f439ca8398d12062a8a3f`, main transaction `0xaad56ce2e563d14203ec735f8cdb55df18e2a305c051db6b1703cf525c3e58ce`, bounty transaction `0x7aaa092e169ca79f0d527ec44c0ff7046394453de0723b9d15cda9c817698d19`, and Fast Path vote `0xbc054bb7a807d418ef1c0045b7d606815229e5ce3b217f9f63e220c7eafef43f` are confirmed. All nine index checks pass. The comparison verifier explicitly requires the 2.66 ratio and its model assumptions, so the dashboard can present it as a labeled model result rather than an automatically rankable outcome.

Browser tab 98 confirms the concise title, full two-sentence scope, factual Verify/Dispute controls and RAND source backlink. The native page does not expose the typed ratio field, so the dashboard must use the tested GraphQL contract instead of scraping the page.

### Youth ChalleNGe modeled internal rate of return (2026-09-12 UTC)

Published factual Claim `1387520fa32c42d1bd1d4464d5c91b12` for RAND TR-1193 Table 5.1’s 6.4% internal rate of return. It is stored as the established fraction-form internal-rate Decimal `0.064` with the percent-format property, and its copy keeps the 3% discount, 15% tax-deadweight assumption, modeled lifetime scope, and distinction from the 2.66 benefit-cost ratio/166% ROI.

Proposal `20e9e29b87344de3821f5929884ad655`, main transaction `0x08ab9258665a63a5f49c1c022112b9e6876b3b10b7f9617f0787a07bf97f6529`, bounty transaction `0xd25049e26c608e24517bb61dcfca10736bbbdccc2c5a1c56cec0df3a0802a096`, and Fast Path vote `0x5ce44c50c69fc9d7de41165f3889dbe09f1f493c6ccf06a32b32a2affbf1dd98` are confirmed. All nine index checks pass. The dashboard contract now explicitly requires both the typed 2.66 ratio and 0.064 internal rate, preserving them as distinct source metrics.

### Youth ChalleNGe baseline model components (2026-09-12 UTC)

Published all eight remaining RAND TR-1193 Table 5.1 baseline components as separate factual Claims: opportunity cost ($2,058), cost-side tax deadweight ($1,745), lifetime earnings ($43,514), education-cost offset (−$4,860), welfare administration ($249), criminal activity ($662), service to community ($423), and benefit-side tax deadweight ($997), each per admittee in 2010 dollars. These are individually labeled model components, not locally recalculated totals or observed outcomes.

Proposal `1c692e73b8404193b2617d6009f8fab9`, main transaction `0xb95b075e74b03b8d58bbf518d3329d1669480e332c0f42211005578550966262`, bounty transaction `0xc0bddc6e695c126fc96db1c724363ba9a69b93d06453c8588ce0a97d709045bd`, and Fast Path vote `0x90c838256a744e8b1051dc0bbccf46ce853891ac19977ef3a5133a494209eee5` are confirmed. All 82 index checks pass. The dashboard verifier requires each stable component ID, signed amount, USD currency, and 2010 price year, preventing an aggregate-only interpretation of the model.

### Tennessee Voluntary Pre-K randomized trial — initial evidence package (2026-09-12 UTC)

Published the primary Article `732cfa110f25499ba22a3f8025c9f903` (Lipsey, Farran, and Durkin, 2018; DOI `10.1016/j.ecresq.2018.03.005`), Initiative `4384e208b2964c6c9432823574a5a1e2`, and three factual Claims. The package records the 2,990-child admission-offer/wait-list design `4fbfa11f56634a2a9206e79db9dc1d6a`, the third-grade achievement finding `3356d0eba4e54eeeab1db7a8d9691077`, and the later administrative behavior/special-education pattern `3b87b7c104cb44a6b82e8db91c163dc9`.

These Claims are deliberately bounded to the Tennessee program and its reported outcomes: early pre-K gains did not persist into the later state-test comparison, and later records contain mixed adverse patterns. They do not generalize to every public pre-K program, turn the result into a claim about adult outcomes, or manufacture a numerical estimate where the paper’s relevant result is reported narratively. The dashboard comparison verifier now includes this source-specific factual family.

Proposal `71a06485bd1144d7baccc057075d94f4`, main transaction `0x3f07ded7a469b2894d43d8ef1880b4e0cfdbfc20cf2ba3b79b760fb8d8b9f836`, bounty transaction `0x9d26530acb90a4635bc909cc02613ca7a05d462c9660db12b7ad9a2311d0442a`, and Fast Path vote `0x04a19f9031e0658f4fb5f23c900079fad17e417914b74d551ff291e26b2164ae` are confirmed. The generic verifier passed 35 checks and bounty coverage is 95/95 executed and confirmed.

Native browser review of the third-grade Claim confirms its direct Education datasets URL resolves with the full, explicit title, two-sentence scope, Verify/Dispute controls, article backlink, and linked design/behavior Claims. This verifies the route and avoids relying on a search-result preview for the public record.

### Tennessee Voluntary Pre-K policy debate (2026-09-12 UTC)

Published nonfactual parent Claim `419a5027a30c46a7aea13cf5cf986205`: **“Tennessee should reconsider expanding its voluntary pre-K model on the basis of short-term readiness gains alone.”** The third-grade achievement and mixed later-record Claims are Supporting arguments; the randomized-design Claim is Related context. This makes a testable policy proposition without misattributing it to the authors, erasing the program’s early gains, or treating a Tennessee result as evidence about every public pre-K model.

Proposal `9608e78d65db4356bd1b1640bbc4a1d0`, main transaction `0xd37877a3c917c2c6443146e9f9c46f63babe857e32d3c964880c8b35520a1c99`, bounty transaction `0xfc607b2b3e143e4f85cca9577f887bbee11ef9822ba0c239d5f5873528a38831`, and Fast Path vote `0xa5aecda16a2d2763bc18e4407ce7510b3286a449e15a945cf81c18ab92672885` are confirmed. The first verification found ordinary index propagation delay; one recheck, without resubmission, then passed all 16 checks.

Browser review confirms the parent is rendered as a Claim with Agree/Disagree controls, its complete two-sentence rationale, and the primary-article backlink. Its URL is the native `/space/{Education datasets}/{entity}` route.

### Boston universal pre-K lottery study — initial outcome package (2026-09-12 UTC)

Published the primary Article `503ab3175cbc4274997c5c64278a604f` (Gray-Lobe, Pathak, and Walters, 2023; DOI `10.1093/qje/qjac036`), Initiative `c77b1107b93643b4870dfa11c0677d8f`, and six factual 2SLS/CACE Claims. The package records on-time college enrollment `0a78c17b257e4e179a839ef7be1a60ff` (+8.3 pp), ever high-school graduation `a6edc7c918bf4de7b2e3b9ef76b4f231` (+6.0 pp), SAT taking `2002f58278474141999d44019ebab325` (+8.5 pp), stacked MCAS math `30a75bb34b4c44fe9f49971bf6eb9cb7` (+0.029 SD), stacked MCAS ELA `edcf093fb8534943966d00a093a03d17` (+0.005 SD), and juvenile incarceration `26f7adc11a164070abfcca691612a7af` (−0.8 pp).

Every claim has its source-reported 2SLS estimate, standard error, sample size, unit, and table locator. The two score estimates are explicitly imprecise null estimates, while the attainment and discipline results use their own horizons and definitions; this prevents a dashboard from treating the study as a single undifferentiated “pre-K effect” or comparing its units directly with Tennessee’s results.

Proposal `5c42d5ca2ea542f68743ff9933ae71b0`, main transaction `0x04a71efc37908dbc013ad335c2dd34a334e5a693e1cdf195b520057807c0b06f`, bounty transaction `0x9b0376c8673badb8ac0b534b1321857bf5ed9916d93403aad79e4ed78ca6c4fc`, and Fast Path vote `0x6c03daa5cf8acd3e6e88fcca5bd56a822f654b784a9c8d6548e840d58183ce35` are confirmed. Generic post-index verification passes 86 checks; the dashboard contract now has source-specific assertions for all six values, uncertainties, samples, units, and locators.

Browser review of the college-enrollment Claim confirms its explicit numeric statement, two-sentence 2SLS/SE/N scope, Verify/Dispute controls, article backlink, and related-outcome navigation. Native Claim pages do not display the typed fields directly, so dashboard use remains tied to the tested GraphQL contract rather than page scraping.

### Boston universal pre-K policy debate (2026-09-12 UTC)

Published nonfactual parent Claim `4e30d7830d9146ffb9b15fffdb3e4256`: **“Public preschool should be judged on later educational attainment and behavior, not standardized test scores alone.”** The college, graduation, SAT-taking, and juvenile-incarceration findings are Supporting arguments; the two MCAS null estimates are Related evidence, keeping their distinction visible instead of turning them into an opposing “no effect” claim.

Proposal `f61c8b212c1c4d3d803b200ef2937e8b`, main transaction `0x217083f34ee2cfebe0018f6116adae0ceac76a5f2fcbbca31733c7e6a4755328`, bounty transaction `0xf7e620c6997701349a2cbd13ae4f3e8069a00863f9d2b03a26f32ba792d10d4a`, and Fast Path vote `0xafc3ab843dcb69d99f78911af3d6c524c6cbb5cf4d3cdd2e815b30c2568ec8d1` are confirmed. All 24 post-index checks pass; 98/98 current publication journals have executed, confirmed bounty links.

Browser review confirms the parent’s concise proposition and rationale, Agree/Disagree controls, and Boston Article backlink on its native Claim page.

### Enhanced Reading Opportunities randomized evidence (2026-09-12 UTC)

Published federal-report Article `0a8658cb5ae9470bacf732add8ca1803`, Initiative `891cbf9044384a04b8a7fc47d444d749`, and four factual Claims from Somers et al. (2010; NCEE 2010-4021 / ERIC ED511811). The claims retain the pooled two-program ninth-grade reading-comprehension effect `9de409cf2a3a4fc29dc68bcc3abbe9a5` (0.09 SD), core-GPA effect `00f19327dbe44129bddd7f8a015967ee` (0.07 SD), credit-accumulation effect `37101612fbcd447f989249a7e9558e3f` (0.06 SD), and follow-up GPA estimate `322ed581e4934da8994953574296d483` (0.05 SD; p=.061).

The federal tables report impacts, standardized effect sizes, p-values, and group sample sizes, rather than standard errors. Those source fields are stated in each Claim’s copy and typed estimate/sample/unit/locator fields; no standard error was invented. The fadeout Claim is deliberately a qualified nonsignificant estimate, not a claim of zero effect.

Proposal `22224a1f6ae646b99bd976b5cf1518bb`, main transaction `0x1e562243cfad4724276b90fa8ccf50466082a26fd2873067f665ea148192ff2f`, bounty transaction `0xc91098bc028362e778f607277bc998f637d9a330587edbf377db6f9b0b3385f3`, and Fast Path vote `0x6d0abe02cf97926b59ab275ed7c6af2f1f971af9f799962da724728e4458ae1f` are confirmed. The generic verifier passes 52 checks and bounty coverage is 99/99 executed and confirmed.

The dashboard comparison verifier now includes ERO as an independent intervention family with its four factual stable IDs. The report’s p-values remain in reader-facing source copy because the published tables do not supply standard errors; consumers must not infer missing standard errors from the dashboard response.

### Enhanced Reading Opportunities policy debate (2026-09-12 UTC)

Published nonfactual parent Claim `e41e1f3f85284e11ae4c461632708404`: **“Supplemental ninth-grade literacy courses should be paired with continuing support when schools seek lasting academic effects.”** The program-year reading, GPA, and credit findings support the proposition; the later nonsignificant GPA estimate is Related context. It explicitly says the evaluation did not test a specific continuation model.

Proposal `3bc533ec649a4267ab7ab17f3e3e58c9`, main transaction `0x399165e4afc7cf74c19882ab178cc9b6525581ee7860a471a38ef2e7a1e9e549`, bounty transaction `0x0fb30528f459551368aa4fce6b2a39751fd7aa49ca9ecc927f739e66a8beb597`, and Fast Path vote `0x390ca2f3c470ef2020e1791960a023fe492231cc29f684b73483bdd06ae31803` are confirmed. The initial index check found ordinary propagation delay; one recheck passed all 19 checks without resubmission. Coverage is 100/100 executed and bounty-confirmed.

Browser review confirms the parent’s complete two-sentence qualification, Agree/Disagree controls, and primary-report backlink on the native Claim page.

### Enhanced Reading Opportunities typed p-value repair (2026-09-12 UTC)

Updated the four existing ERO factual Claims in place with the reused Text **P value** property `ba5f8fe9d1cd9a6094338d2f37b74a5e`: `P = 0.002`, `P = 0.002`, `P = 0.017`, and `P = 0.061`. This uses Geo’s established exact-string convention so operators and reported precision survive dashboard queries; standard errors remain absent rather than inferred.

Proposal `d3d14c10dbb54510b947883d59276e60`, main transaction `0xdbb3126b80a0d4d1144f1ca7eb2a2e0fd9f99d00c8aed635e2624152f7e9e06c`, bounty transaction `0x622964003ad3e718ade8043a2c4602218dbc3802c535a6d1907743b51758e0c3`, and Fast Path vote `0x7555a3cb3d4f805546ca4235508bba65c387e6b0ec1cdc2679d406f6b6c2f2d2` are confirmed. The six-check index verifier passes.

The live dashboard verifier now requires every ERO exact P value and asserts that none of the four rows acquires an invented standard error. TypeScript and all ten intervention-family dashboard cases pass; bounty coverage is 101/101 executed and confirmed.

### Claim-copy audit follow-up (2026-09-12 UTC)

The live readability audit inspected 413 published Claim pages. New Boston rows have no flags; the Tennessee, ERO, and policy-parent flags are heuristic false positives triggered by valid complete sentences such as “In the Tennessee … trial” or “should …”, not generic labels or missing findings. Their rendered titles state the estimate/design/proposition and their two-sentence descriptions retain source scope; no cosmetic rewrite was made merely to satisfy that heuristic.

### San Francisco ethnic studies local-IV evidence (2026-09-12 UTC)

Published Article `7cf51d06726242b88157ca3ea1f5b228` (Dee and Penner, 2017; DOI `10.3102/0002831216677002`), Initiative `d597ffb8910b46158a2eb2c20ad4e48b`, and three factual Claims: attendance `8197239bfd0f417ca57263877d8c2021` (+21 percentage points), GPA `385e7cb36c144d04b09508c0d49876a2` (+1.4 points), and credits `115917ad7cba4ee38e591b93a5c1426d` (+23). Each is the authors’ local-IV interpretation for ethnic-studies course takers near the San Francisco eighth-grade GPA 2.0 threshold.

The descriptions retain the Table 4 reduced-form coefficient, robust SE, sample size, and threshold-local limit. They do not store that reduced-form SE as an IV standard error or misrepresent the local result as a district-wide effect. Proposal `d56a530a4de94499b18804c5e48021d7`, main transaction `0x1f1fa567fbab5ad61d71eed8d5b11a5527c33dd34f5b7e143844947af4895654`, bounty transaction `0xd03f9edd21cc66e6f1e44e71781e6f713e8835631b0959e4d3f8f253caa9f6fe`, and Fast Path vote `0x04baa7acdfe60b1140ed1c27414700a21938ec31d000073b82a560a054436e87` are confirmed. The generic verifier passed 43 checks, coverage is 102/102, and the dashboard verifier now includes this family.

Source-identity correction: the intake snapshot's `src-096` DOI (`10.1257/app.20180293`) resolves to an unrelated article. This batch uses the primary-paper DOI (`10.3102/0002831216677002`) after source verification; the intake snapshot is retained as historical input and is not silently rewritten.

Rendered-page check: the attendance Claim shows the 21-percentage-point result in its title and the local-IV derivation, reduced-form estimate (6.328; robust SE 2.201; N=1,404), threshold scope, and Article link in its two-sentence description.

### San Francisco ethnic studies longer-run evidence (2026-09-12 UTC)

Published a separate Article `90f5100c5ccc420d8b73609ade09542a` for Bonilla, Dee, and Penner (2021), DOI `10.1073/pnas.2026386118`, linked to the existing San Francisco pilot Initiative. The three factual Claims preserve the paper’s full-control reduced-form ITT results: preferred high-school graduation `177f1777a33b4207a49132d14c958599` (+15.7 points; SE 0.073; N=1,405), fourth-year attendance `2d1f4e4cbcad4f12bf764133d60d0931` (+7.158 points; SE 1.799; N=1,304), and fourth-year credits `fc8c7a637a9949238086e3915c53d9c4` (+15.29 credits; SE 7.724; N=1,304).

This source is intentionally separate from the 2017 local-IV package: it is preregistered, measures eligibility rather than course-taking, and labels conditional-on-enrollment engagement outcomes as exploratory. Proposal `0f242c2cd2c843f5941d1510a65a6bc8`, proposal transaction `0x905a7607faaceec4df41a27feb70becec2ebf0d3ef285db621175b56c444b3ed`, bounty transaction `0xe6217d0acbfd8c96e08394c9b30d594a2b950d446d92cedcb4dd560e4f1ec6dc`, and Fast Path vote `0x05971d23a74cbabe63ccc987d1fbd792191e258ae0f1316759a0e314f3092c1c` are confirmed. The generic verifier passed 41 checks and bounty coverage is 103/103.

Dashboard lesson: one Initiative can contain several source versions. The comparison verifier now filters both San Francisco families by their Article relation and declares the stable shared Initiative ID where the later batch registry intentionally contains only newly allocated IDs; this prevents one paper’s rows from being silently mixed into the other’s comparison family.

Rendered-page check: the graduation Claim displays the 15.7-point result, full-control SE and sample size, cutoff-local interpretation, and the distinct PNAS Article link. Its description remains two sentences.

### San Francisco ethnic-studies replication debate (2026-09-12 UTC)

Published nonfactual parent Claim `1ea8732555334c1baea163ea907b1d9c`: “School systems should treat San Francisco’s ethnic-studies pilot as grounds for rigorous replication, not proof that any mandate will reproduce its gains.” It has a two-sentence scope-aware description, links to both source Articles, and connects four factual findings as Support with two longer-run conditional engagement findings as Related context. It does not invent a contrary causal result or treat the proposition itself as factual evidence.

Proposal `5d401bd5bf74409196ab6effe1d1c34a`, proposal transaction `0x2d5f7260ddccc239e63d835833eb825b360bff067670bc843418c130f23eaf00`, bounty transaction `0x4cafa70b49b7593b90df30dcaa0278b2624e44b21ccf1c3131fbb45b9c60d7eb`, and Fast Path vote `0xb44eceea44322f561791db5ff5eb5deb96021a963a99d56b7ad7fd90c7f1db11` are confirmed. The generic verifier passed 25 checks; bounty coverage is 104/104.

### San Francisco ethnic-studies districtwide expansion (2026-09-12 UTC)

Published a distinct implementation and source family for Bisht, Bonilla, Kim, and Penner (2026), AERJ DOI `10.3102/00028312261426338`: Article `4c5094291f7340f7b3ba8adca9a25b5c`, Initiative `c03236fd3748407f9e8828d2306ad8a4`, and five factual Claims. The package preserves Table 2/3 student-level two-way-fixed-effects estimates with school-clustered SEs: overall GPA +0.174 (SE 0.040; N=24,210), any D/F −5.6 points (SE 0.016; N=24,210), math GPA +0.266 (SE 0.049; N=24,246), science GPA +0.199 (SE 0.049; N=24,246), and Black-student GPA +0.228 (SE 0.042; N=1,335).

This is a districtwide enrollment-based difference-in-differences study, not the earlier fuzzy-RD pilot or a randomized trial. Its Initiative is Related to the pilot but remains distinct, and the dashboard filters it by its Article ID. Proposal `875a706a8cc34ccda1ee17fec72ceb76`, proposal transaction `0xa0c6874d5acd26e6cf066fe572a9b246a404803cea4c1cb8269bb063990916dd`, bounty transaction `0x4ab8f59c53f84fe904f1065a60425cd19ae4859c249973b77b8abf6611c426dd`, and Fast Path vote `0x89d2c644c6af56c514121549222881ab5398431a1b10b1a9e48ff79a6cf553f2` are confirmed. Generic verification passed 69 checks; bounty coverage is 105/105.

### San Francisco ethnic-studies expansion debate (2026-09-12 UTC)

Published nonfactual parent Claim `89724696a30644478a285d856a412b1f`: “Districts should consider well-evaluated ethnic-studies expansion when local evidence shows sustained GPA and course-failure improvements.” It connects four overall and subject-specific factual results as Support and the Black-student subgroup result as Related context. The two-sentence description explicitly calls out the student-level difference-in-differences design, local implementation, and enrollment-pattern limitation rather than presenting it as randomized or universal evidence.

Proposal `059726128b504af9a40af73c82c59d1f`, proposal transaction `0xcab99fa76657f3cca19251ae63d2e1627ee91a41d8eeb49b07b9cbdd67b85c3b`, bounty transaction `0x0822d3dc6abdd7c0e89901316c23aaca2c1dbc5b04e2197ae3e8f1e2b1ec8c1b`, and Fast Path vote `0xf4f05a5997258a62e8dc28957b607692295eea1ce4e11ba4726beb3a2c43c67e` are confirmed. The initial reads received an absent entity during indexing; rechecking the same batch after propagation passed 22 checks, and bounty coverage is 106/106. Do not resubmit after this kind of transient absent-entity response.

Rendered-page check: the parent displays its full proposition, the two-sentence design/scope explanation, Agree/Disagree controls, and the distinct expansion Article link.

### Project QUEST nine-year randomized evidence (2026-09-12 UTC)

Published Article `83427dac98de4da496573df368a07561`, Initiative `f557a1af0d3846ca8beaec99f30b6e1c`, and three factual Claims from Roder and Elliott (2019): the 410-person random-assignment design, year-nine annual earnings +$5,239 in current dollars, and $10,501 reported operating cost per participant. The cost record is explicitly not a net cost, does not have a source-stated price year, and cannot support a benefit-cost calculation.

Proposal `0b237d33644b46f7ae3943f3ba04a8e5`, proposal transaction `0x818e942b580b2be693018b6d8000d5b1719a7c09182756d8dfbd1ffc862e2b5d`, bounty transaction `0x9a2beffb2fdb169751977b802a45f1eeff9ff76571d4d5aa0ae5bb45850dc7f0`, and Fast Path vote `0x9402404d1b64e9a96a5f0e543fcc0908bb5b68d7e785ae384923a5f0306e4575` are confirmed. Generic verification passed 40 checks; the dashboard contract filters this family by Article and guards its current-dollar and non-net-cost limitations. Bounty coverage is 108/108.

Mapping repair: the first builder indexed the earnings sample-size tuple field as the unit and omitted the operating-cost denominator. Repair proposal `92ccf0dd030749f1bde072aeed8c5467` replaced only those text facts and the earnings locator; its proposal transaction `0x23805129bf7f80eba51bb5b0ee5ef436c46b210a0036179ba06d3e3395f8796e`, bounty transaction `0x734e5f91692e603841ad16e749d711b38012a8ad4f83376c8efd464698573614`, and Fast Path vote `0x57344d783dcb93efcbfcd8330150b4bc0cea8c0dd00cf8ac1d7bd52fe01896ff` are confirmed. Six repair checks and the full dashboard verifier pass after the correction.

Annual-series mapping: Figure 1/Figure 4 reports the current-dollar average annual earnings difference for each follow-up year. Eight new factual Claims preserve the source values for years one through eight (`-$1,801`, `-$2,369`, `+$1,881`, `+$3,925`, `+$3,980`, `+$4,691`, `+$2,176`, and `+$2,952`); the existing year-nine Claim preserves `+$5,239`. Each record uses the Decimal estimate property, `N = 410`, an explicit current-dollar annual-earnings unit, Figure 1/Figure 4 locator, the same Article, and the Project QUEST Initiative. The early negative values occur during the program’s training period; these reported annual differences are not benefit-cost estimates.

Proposal `4cff4edef5364114bf689cbea4e93ea6`, proposal transaction `0x30772e243dea62c88e4b432f613a7ed3e3a915e51e872ad8a4b3809d56eb7247`, bounty transaction `0xb9ce41e31a8eb95278e70efb1db140be8566dfc7fdb56ecdb4cb0057f8e53715`, and Fast Path vote `0xb15d2d9e24d0179a4e4729c245e18794319ed383185ae945fd6bdf375e25260f` are confirmed. Generic publication verification passed 82 checks. The dashboard contract now requires the full annual series and verifies each exact value, sample count, unit, and locator; it passes. Bounty coverage after this publication is 110/110.

### Project QUEST long-horizon debate Claim (2026-09-12 UTC)

Published nonfactual parent Claim `2ae4b31eee4e4434b54c85c1310e4806`: “Workforce programs should be evaluated long enough to capture earnings effects during training and after completion.” Its first sentence states the study’s lower year-one and year-two earnings followed by positive year-three-through-nine differences; its second sentence limits the inference to the reported nine-year horizon and explicitly says the single-site design and operating-cost record do not establish a universal payoff or benefit-cost ratio. Year-one and year-two factual Claims are Related context; the positive yearly factual Claims are Support. The parent also links the primary Article and Project QUEST Initiative.

Proposal `c5abc026408b4be3bdd85d7c6b9dd344`, proposal transaction `0x1cbc148323309c71f5f19908014aa31815128f856b755bf9258b5c01bd499595`, bounty transaction `0x70081d04635d602b67537ededb0535ebf455c1ae0db73a1055b9a07f8993457f`, and Fast Path vote `0x18b95ad1b803ee74540c9a643e6753ae0f990f9b120cb447544bf271a8e28f23` are confirmed. Generic verification passed 33 checks and bounty coverage is 111/111. Rendered-page verification confirmed the exact proposition, short explanation, Agree/Disagree controls, and primary-Article link.

Copy repair: the initial two-sentence parent description still exceeded the repository’s editorial review length threshold. It is now: “Project QUEST’s randomized study reports lower annual earnings in years one and two and positive differences in years three through nine. It supports a nine-year horizon for this program, not a universal payoff or benefit-cost ratio.” This is a copy-only change: the Claim ID and all Article, Initiative, Support, and Related edges remain intact. Proposal `6162c47203024b50bef9192dea2e5933`, proposal transaction `0x8bbfee9cab63ac360e8d4eb5c42f517354fab6499d7161d34ab6c623ff517a29`, bounty transaction `0x79d9b03c476862e0d9fa68514aa4db2a745bebbc478ee8cf1752d9d4bac29779`, and Fast Path vote `0x7143639dbfd90db9567e634fc82e237d472213f10ea26e0f2269467ece84bae7` are confirmed. Generic verification passed three checks, the dashboard verifier remains green, and bounty coverage is 112/112. The readability audit now reports only its known false-positive title heuristic; the description-length flag is gone.

### Project QUEST geography completion (2026-09-12 UTC)

Project QUEST’s Article, Initiative, randomized-design Claim, operating-cost Claim, and all nine annual earnings Claims now reuse canonical San Antonio, Texas, United States City `7f16707ade0eede0b85fca0b9a2da737` from Geography space `84a679ce188f061ac9a92380bac2bab5`. Discovery was all-space and disambiguated the many same-name cities by the City’s existing Texas relation `47b55f87c5ca4b2db1ac32296fd0c650` to `f457c07ce43d4e0a8bd646e971ef63ca` and Country relation to the United States. No geographic entity or geographic facts were copied into Education datasets.

Proposal `0704b666fc1441ed9676d384a0933e44`, proposal transaction `0x09eb0e037ab119c9d34750db34c84c924e9bbacc53dd6583624e3332fd4eeb49`, bounty transaction `0xcec5201ac25ccacc1e3c37775d39c847c0e26afde57d9f9250ed537b0cc1d3e1`, and Fast Path vote `0x67ea98c2f6051c77d386019b8dde344a46e5a00bbd946e38d96c697523041187` are confirmed. Generic verification passed 15 checks and bounty coverage is 113/113. `scripts/education-verify-project-quest-geography.ts` exercises `data/education/study-location-query.graphql` and verifies exactly the thirteen destination-scoped Project QUEST records with no additional page; save its result in `data/education/project-quest-geography-query-verification.json` for the frontend contract.

### Project QUEST intervention-model Topics (2026-09-12 UTC)

The Project QUEST Initiative `f557a1af0d3846ca8beaec99f30b6e1c` now reuses existing cross-space Topic identities through `Topic` relation `806d52bc27e94c9193c057978b093351`: Workforce development `767bf4fd04b54a0fb7cb11f3ec31b52f` and Workforce training `e81e7330b8904938812c02330533738c`. Both were discovered all-space, confirmed as Topic entities, and match the source-described occupational-training financial aid, counseling, support, and job-placement program. Do not infer a generic CTE, clinical occupation, provider, credential, or cost-effectiveness category from these two tags.

Proposal `e68aa0a6214a4f0ca44e23bc83132fba`, proposal transaction `0xd5b23440693789345c2336d15b2237e39e351828660539c0377a59b62d30a48a`, bounty transaction `0x3adaee09dbebe09869eaec5d8a30062b0080105196a73caf408d1d2f7fb0212c`, and Fast Path vote `0x1af1e2f35bef1b7f485b6283f57f94fada622931dedfda3b6f9127529d994ff9` are confirmed. Generic verification passed four checks and bounty coverage is 114/114. `scripts/education-verify-project-quest-topics.ts` saves a direct, destination-scoped filter assertion in `data/education/project-quest-topic-query-verification.json`; all Topic names/types, relation IDs, and page completeness pass.

### CUNY ASAP three-year randomized outcomes (2026-09-12 UTC)

Published a distinct primary Article `84231ad5631249a99f56e89dc540e3d6` for Scrivener et al. (MDRC, 2015), *Doubling Graduation Rates: Three-Year Effects of CUNY’s Accelerated Study in Associate Programs (ASAP) for Developmental Education Students*. It reuses the original CUNY ASAP Initiative `3f6f2b82f8b94d3c85a5198a40e34199`, but does not overwrite or conflate the 2020 eight-year cost-analysis Article.

The 896-student original-CUNY randomized trial now has source-specific factual Claims for its design (`d67b77b6641247d4bae9af3e346d7d34`), cumulative degree receipt after three years (`8bc4688bf6cd469aae76433fde1e67a2`: +18.3 points, 40.1% versus 21.8%, p < .001), cumulative credits (`413205d66d2d465380c8cab7e7960aa5`: +8.67, SE 1.95, p < .001), and semester-six four-year-college enrollment (`0beecfa08f39431b827a08d4d2076719`: +7.8 points, 25.1% versus 17.3%, p = .0040). Each preserves its table locator, source Article, three-year horizon, unit, and the full sample count. No 2015 cost value or cost-effectiveness conclusion was added because this package does not establish a price-year mapping compatible with the separate 2020 cost analysis.

Proposal `0446b492361946af8639ffe7b526a5a0`, proposal transaction `0x6c0c72b21a7c407840b9dd2671ebf51de5a38c1fa46ac515cc0ab72b4c7fb47b`, bounty transaction `0x5ba7c6ed3da36f8fadeef23a34382713e8aff7cccad574f0ddff58c801db47a1`, and Fast Path vote `0xc0885e70758a8e30ad034216455fdefbcc3f12927f07347474c233d86a4611e3` are confirmed. Generic verification passed 48 checks; bounty coverage is 115/115. The dashboard contract now has a source-filtered CUNY three-year family. During this extension, the original CUNY eight-year family was found to lack its Article filter; it now explicitly filters Article `536b5cd10a65417ea4e1d52b3322dcad`, returning its three cost/outcome records while the new Article returns four three-year records. TypeScript and all dashboard cases pass. Browser verification confirms the degree Claim’s estimate, concise scope, Verify/Dispute controls, and Article backlink.

### CUNY ASAP New York City geography completion (2026-09-12 UTC)

The original CUNY ASAP Initiative, its 2015 and 2020 Articles, both source-specific factual outcome families, and the eight-year cost records now reuse canonical New York City `deaa7d31c1e569ec5d9f27ae307f08cb` from Geography space `84a679ce188f061ac9a92380bac2bab5`. All-space discovery selected this City rather than a same-name Topic or unstructured duplicate because it has an existing State relation to New York `e65e9c18fe2846b9a07d1c8510dbdc6f` and Country relation to the United States. The MDRC reports specify Borough of Manhattan, Kingsborough, and LaGuardia community colleges; this maps the evaluated CUNY trial to New York City, not every ASAP replication.

Proposal `85eb7e25a1ba48388ad015805c0a90a8`, proposal transaction `0x27196d1a8246754c378c41aaf92d51fc2086f85b567b031c946411e7b3f8b401`, bounty transaction `0xb24bee62a99add3fae41edc6999637d5be0b196e7fbb56fb0022e3cb24003fab`, and Fast Path vote `0xca33bbe2c8381555bab03572e02ee2e10599dd7fd383e6fca26324269c1af25d` are confirmed. The first two read checks saw the normal relation-indexing delay; the same submitted batch then passed all 12 generic checks, with no resubmission. Bounty coverage is 116/116. `scripts/education-verify-cuny-asap-geography.ts` verifies exactly ten destination-scoped CUNY records through `study-location-query.graphql`; save `data/education/cuny-asap-geography-query-verification.json` for frontend use.

### San Francisco ethnic-studies expansion subgroup evidence (2026-09-12 UTC)

Added five more Table 2 factual Claims from the same source/implementation: Black-student any D/F −10.4 points (SE 0.021; N=1,335), Latine GPA +0.248 (SE 0.046; N=4,904), Latine any D/F −11.7 points (SE 0.023; N=4,904), male GPA +0.192 (SE 0.044; N=12,345), and male any D/F −6.8 points (SE 0.017; N=12,345). They remain source-specific observational estimates, not universal causal effects or duplicated studies.

Proposal `508c4cd147cf422dada449a2a1967242`, proposal transaction `0x5fdc0f71be7282bf848e3d03476c892806749db923ecd5fef78f4b433025bc4a`, bounty transaction `0xae9efe9462b566de63c73723fcc434d3b8e5aae63cb7dc103efc0e3501983aa5`, and Fast Path vote `0xda19a6a0f73d07d05207a6d2c353dd175e4892a0b528fa7c2dee9380c00b851a` are confirmed. Generic verification passed 57 checks and the dashboard contract now requires all ten districtwide-expansion rows. Bounty coverage is 107/107.

### ASAP Ohio eight-year randomized outcomes (2026-09-12 UTC)

Published a separate Ohio replication package from Miller et al. (MDRC, 2025), *From Learning to Earning: Eight-Year Findings from the ASAP Ohio Demonstration*: Article `2dbe6ce279734000bf3d2ef69f71764c`, Initiative `f0feb20028b140a18d433bec8dca94f8`, and four factual Claims. The 1,501-person randomized study reports +15 percentage points in degree receipt after eight years (46% versus 31%), +6.2 points in bachelor’s-degree receipt (17.6% versus 11.4%), and a $3,337 earnings difference for 1,482 participants with wage records. The earnings record is explicitly limited to Ohio unemployment-insurance-covered wages; the report does not state a price year, so no normalization, net-cost, benefit-cost, or comparison ranking is justified.

Proposal `afe5390991e942f6af8f76cb875e4f74`, proposal transaction `0x70343a676ae1d88b626919eaa355f3fef4b99d735b60346173c709593b732772`, bounty transaction `0x2d6770c3627017d6b55225e38d2025d896176761c57cecfe4b1512b671db3b0b`, and Fast Path vote `0xd578ef57e7a0f216fc27c063c3fc4fd28267ca6c9015b2cbfa594e03e0a1a895` are confirmed. Generic verification passed 49 checks and bounty coverage is 117/117. Browser verification confirms the degree Claim’s direct estimate, concise study scope, Verify/Dispute controls, and Article backlink. The dashboard contract has a new Article-filtered Ohio family so it cannot blend this replication with the original CUNY trial; the first dashboard retry after publication returned Geo API 503, which is logged as a transient availability failure rather than a data defect.

Verifier repair: once the API was available, the Ohio family returned its expected four IDs, but the new dashboard assertion used the shorthand `Ohio UI` while the published source-faithful description says `Ohio unemployment-insurance wage-record`. The verifier now checks the published wording; this was a verifier-only correction, with no new proposal or data mutation.

### ASAP Ohio geography completion (2026-09-12 UTC)

The ASAP Ohio Article, Initiative, randomized-design Claim, and three outcome Claims now reuse canonical Ohio State `660f8d409b664f0d943bf5b572e0e28a` from Geography space `84a679ce188f061ac9a92380bac2bab5`. All-space discovery selected the entity typed State with its existing United States relation, avoiding a same-name Region/Space. The report identifies Cincinnati State, Cuyahoga, and Lorain County community colleges, but it does not provide a verified coordinate dataset for each site; this publication therefore records only the defensible Ohio State geography.

Proposal `69b72b4cebce4dbfa85fb3c06609f05d`, proposal transaction `0x956be609f04a853149645fbf71ce15da87fb287b8799bffc04970cf1968ab544`, bounty transaction `0xfaa5f5fde7d7fa0c79ca6b7c3a252eb15642d4f411b6e5c7c693670b73192fc9`, and Fast Path vote `0x11fd3b05998ac7c260f684169abc9be7fd411a6538c26a9a3364dc76ea52c23a` are confirmed. Generic verification passed 8 checks and bounty coverage is 118/118.

### WorkAdvance multi-site outcomes and net gains (2026-09-12 UTC)

Published the primary MDRC 2020 WorkAdvance evaluation as Article `2278407dc1df480e8a297cd9beb44a4a`, umbrella Initiative `6edae2af128f47c0a7359b1ae52eba28`, and four provider/site Initiatives: Per Scholas, St. Nicks Alliance, Madison Strategies Group, and Towards Employment. The 2,564-person randomized evaluation now has an explicit design record, pooled 2018 outcomes (+$2,716 earnings and +6.4 percentage points earning at least $30,000), and provider-specific 2018 earnings and threshold outcomes. Each factual result links to both its Article and the appropriate provider/site Initiative, so the pooled finding cannot be silently substituted for a site result.

All twelve Table ES.4 net-financial-gain records are published for participant, government-budget, and societal perspectives at each provider. They use the Decimal estimate property with 2018 price year, USD, per-participant unit, perspective, and horizon; they do not use the Cost or benefit-cost-ratio fields. They are source-modelled 2018-dollar present values, inflation-adjusted and discounted at 3.5%, with a seven-year Per Scholas horizon, a ten-year St. Nicks horizon, and 62-month observation periods for Madison and Towards Employment. `docs/workadvance-study-notes.md` records the source limits and exact mapping.

Proposal `3465e40b75d94640a473b6bacf8707f2`, proposal transaction `0x79bf6151cdabf021c7ee908c2545c6c2710002b2744c0a198c2678a3662e1968`, bounty transaction `0xf254204046bba39001e6191138fdddcaacde8ffeb385257245dbc1f62aff5c02`, and Fast Path vote `0xe23423fc10fc8484e8a5a2e5641ab905768154baa040981ac864de92e8fbe618` are confirmed. Generic verification passed 286 checks and bounty coverage is 119/119. The dashboard contract now has one pooled and four provider source-filtered families; all pass. Browser verification of the Per Scholas societal-gain Claim confirms the direct dollar claim, present-value/discount caveat, Verify/Dispute controls, and Article backlink.

### WorkAdvance provider geography completion (2026-09-12 UTC)

Each WorkAdvance provider Initiative and its five provider-specific factual records now link to a reused Geography identity: Per Scholas and St. Nicks Alliance to New York City `deaa7d31c1e569ec5d9f27ae307f08cb`, Madison Strategies Group to Tulsa `ab79af5eecb793345f83a4583a4e9ad3`, and Towards Employment to Ohio State `660f8d409b664f0d943bf5b572e0e28a`. The source names Bronx and Brooklyn, which are appropriately represented by canonical New York City; it identifies the fourth site only as northeast Ohio, so the map does not invent a city. All targets reuse Geography-space identities with validated City/State, United States, and applicable state relations.

Proposal `2456244781f9469b8332edc82b72994d`, proposal transaction `0x9c5019d1fd816201222151fc44afc10353431d6e64d2f708d7dda2dd070ba01c`, bounty transaction `0x4b9fb4a02c7ce42f725befab5312c14b03b9335ce20cc259b8f95904d8e12aac`, and Fast Path vote `0x0ef918d784d481b6a36a3f859c0012e6800b4e1d1a03f6bb76f3aefcfbcc7df1` are confirmed. Generic verification passed 26 checks; bounty coverage is 120/120.

### WorkAdvance provider-heterogeneity debate Claim (2026-09-12 UTC)

Published nonfactual parent Claim `39709be28a2e4cff98bb8e62e21a25a2`: “Sector workforce programs should demonstrate provider-specific, long-horizon earnings evidence before expansion.” It states the pooled positive finding and uneven site results, links pooled/Per Scholas/St. Nicks/Madison supporting evidence, and keeps non-significant St. Nicks, Madison, and Towards Employment outcomes as Related context. Its second sentence limits the inference: the source-modelled net gains vary by provider, accounting perspective, and horizon, and do not establish a universal expansion case or cross-site ranking.

Proposal `35be781ea83448198434971749535d6d`, proposal transaction `0xd3a47d9e2c08f9f426475784a0aff21ed2f6587392cf56750334e095362fcfe9`, bounty transaction `0x3d5930bfdc4483fce5c79b4a83bd0afc43872b9da7b770f940520886cd579edd`, and Fast Path vote `0x71af3ca0c284441f82595a8fa247adf96ebcff15f0cc7baa5fa31b81ae134603` are confirmed. The generic entity verifier saw the parent absent on two immediate reads, which is an indexing delay after confirmed execution; do not republish. Bounty coverage is 121/121 while the direct entity verification remains pending the indexer.

The same submitted batch passed all 17 generic checks after index propagation; no second submission was made. This supersedes the indexing-pending wording above.

Rendered-page verification confirms the exact proposition, its two-sentence provider/horizon caveat, Agree/Disagree controls, and the primary Article backlink.

### WorkAdvance provider organizations (2026-09-12 UTC)

All-space exact-name discovery found no existing Geo identities for Per Scholas, St. Nicks Alliance, Madison Strategies Group, or Towards Employment. Four new source-scoped Organization entities therefore reuse the established `Organization` type and `Providers` relation: each is linked to the 2020 Article and to its corresponding WorkAdvance site Initiative. This makes operator identity a structured dashboard facet while keeping it distinct from the delivery site, pooled model, and evidence claims.

Proposal `1c5cced485f94300afa93071f37b3710`, proposal transaction `0x608799a72af91f0adf6db62a0871fc574efb36d2e377a82cc9178971d51929fb`, bounty transaction `0xf49398afe94c6feb71ef3cd4e3395d14f492ae36375c1e9993cf60701e9c8996`, and Fast Path vote `0xc77e658e04c0d135e780b7c6fe7bc2217e406d7ac479a74d529c7472ab60cebb` are confirmed. Generic verification passed 22 checks; bounty coverage is 122/122.

### WorkAdvance population and design facets (2026-09-12 UTC)

The WorkAdvance umbrella and each provider Initiative now carry existing structured text properties for `Population` and `Design`. The umbrella preserves the 2,564-person low-income adult study population and the 1,293/1,271 random-assignment split; each provider preserves its source-reported site sample count and provider-specific randomized analysis. These facts are intentionally scoped to the evaluation and do not assert one uniform eligibility rule across providers.

Proposal `aa2492c47448486eb48626ec089e2022`, proposal transaction `0x0b86c408a5473e57f6b78459bed2c2db70c271cb8e0c82e87acdceb18b7851ae`, bounty transaction `0xcfd13720940d432d8d4a395679793e920bf69645dcb8e8da7e753083045878c8`, and Fast Path vote `0x5a27f1b0a17be983b4bd9f96c5da288f8183cfbfb18204552262c91ac55fe179` are confirmed. The generic verifier initially saw all five updates and metadata missing despite successful receipts and a correct published payload; the same batch passed all 12 checks after approximately 45 seconds of index propagation. Do not duplicate these property writes if immediate reads are absent. Bounty coverage is 123/123.

### Dana Center Mathematics Pathways five-year cost analysis (2026-09-12 UTC)

Published the 2023 CAPR/MDRC primary Article `20203925d22447479e7a0b97ca4862e0`, its early-Texas DCMP Initiative `097afc3d226445d686915c0a07ba2c66`, and seven source-specific factual records. The 1,411-student randomized study reports a five-year net social cost of $790 per program-group member in constant 2022 dollars, a $1,380 primary-component cost per program student, and non-significant five-year outcome differences of +2.5 percentage points for credential-or-four-year enrollment and +0.4 college-level credits. The two source cost-per-outcome arithmetic values retain their explicit non-confirmatory cautions; no benefit-cost ratio, confirmed saving, or cross-study ranking is created. See `docs/dcmp-study-notes.md` for the table-level source mapping and limits.

Core proposal `50a49a27284b42f09bcc26a4e8e023a8`, proposal transaction `0xbc3f0477c636deddcf33a130921721464ca02d41ddbad00986f9fd5e2aeadc7a`, bounty transaction `0x4bb945f65c1d3bf8c4b1ef6967c3399028e9a13969936ae6fb5cf36c31a1c862`, and Fast Path vote `0x7e3cfaac2d598141e395f98775fb20f96ee4518fa772d23316ace46cc38e057b` are confirmed. Generic verification passed 92 checks and bounty coverage was 124/124. The dashboard contract has an Article-filtered seven-record DCMP family so its cost and outcome rows cannot mix with another study of the initiative.

### DCMP monetary value-type repair (2026-09-12 UTC)

The initial batch placed the report’s $3,450 cost-per-attainment difference and $20 cost-per-credit difference in generic `Decimal estimate`, despite their monetary units, price year, currency, and denominator. The narrowly scoped repair unsets that generic value and writes each to `Cost` Decimal, preserving every other value and the source warning that neither is a confirmed saving or general cost-effectiveness result. Future DCMP rebuilds use the same `Cost` mapping for monetary cost-per-outcome rows.

Repair proposal `03c11c8b0eb34fe9b69bc59da9d2920c`, proposal transaction `0x1f962fda5ff54cab32965777eef1a2fe97f1bfbdafa1323ea901ca19be54e94d`, bounty transaction `0x11505b39b5455e07942594e65e53aaaed0da39d8acc313b371d390f3db62da63`, and Fast Path vote `0x9bbdd671dbd59130c430d107455f70e97065e544ac7484632e60854145ad1a6c` are confirmed. Generic verification passed four checks, the dashboard-comparison verifier passed every family including DCMP, and bounty coverage is 125/125.

### DCMP Texas geography and dashboard facets (2026-09-12 UTC)

The DCMP Article, Initiative, and all seven factual records now reuse canonical Texas State `f457c07ce43d4e0a8bd646e971ef63ca` from Geography space `84a679ce188f061ac9a92380bac2bab5`. All-space discovery found no exact Geo identity for Brookhaven College, Eastfield College, El Paso Community College, or Trinity Valley Community College, so this batch records only the defensible state-level geography. It does not invent institution entities, city pins, campus coordinates, or a public outreach stop.

Geography proposal `dd54bee2274b4bc081a05a9b7d3ee6f7`, proposal transaction `0x3cf52989c7fa20626b41cfb195972a097ea5201ea51624a8e6ce324c48de8ff7`, bounty transaction `0x68ae6176603d53939d331ea1afb5e962a36f080c024ea57d9535c3bbf251254d`, and Fast Path vote `0xfb33ee701eaa7081a634f2bd1f3d0230fba68901ccbba14a97dcc9aba008bc9b` are confirmed. The initial query saw ordinary relation-indexing delay; the same submitted batch later passed all 11 generic checks, with no duplicate proposal. Bounty coverage is 126/126.

The DCMP Initiative now also has structured Population and Design text facets: the 1,411-student 856/555 allocation across four Texas colleges and ten campuses, and the individual-level randomized five-year follow-up of the early DCMP model. These are evaluation facts, not claims about current statewide implementation or later corequisite versions.

Facet proposal `34548e304a784705976822d1c3bbc831`, proposal transaction `0x1808e83436b83e9b9e15b6d70f9f4ce12e3b820d9aebabff14f3583d7d16eda0`, bounty transaction `0x05fa49cd7a2ce4c55f3817d3a574b778d2a7d945aae266558420c717e7cdef04`, and Fast Path vote `0xda75eab507d6bfce2305e5d1b0a8deb6f3f9ba9ea93223c6426c389098b92dac` are confirmed. Generic verification passed four checks and bounty coverage is 127/127.

### DCMP long-term-evidence debate Claim (2026-09-12 UTC)

Published nonfactual parent Claim `6a17e75eef784856b20aa358a5eb7660`: “Developmental-math reforms should show statistically persuasive long-term outcomes before broad expansion.” The $790 net social cost and the two five-year non-significant outcomes are Supporting evidence; the source’s reported $3,450-lower cost-per-attainment arithmetic is an Opposing consideration, but its wording continues to state that it rests on the same non-significant outcome difference and does not prove savings. All four facts remain Related to the parent, the same DCMP Article, and the same Initiative so a dashboard can show their roles without representing one trial as four independent studies.

Proposal `fa44b5efbdf144278856883f307582eb`, proposal transaction `0x9d7a159fbefa7beede9a280421dc4cbd0674628b918eeccfff020025424c3ee1`, bounty transaction `0x7884055e85d0738a7da7d047922bc092e030b0c18286f50d8662ae4006c83ab7`, and Fast Path vote `0x3dcf1c7b6898e13210fcabc2a3f7ab8c66bf1b86142635f3d85f8f6ba8849cac` are confirmed. Generic verification passed all 20 checks, bounty coverage is 128/128, and the rendered page confirms the proposition, two-sentence framing, Agree/Disagree controls, and Article backlink.

### PACE Center for Girls randomized cost-and-outcomes family (2026-09-12 UTC)

Published MDRC’s 2019 Article `c8303039db3946ea8c71e717ec00c9e1`, the evaluated Florida PACE Initiative `926f8ea0e9e14a17b42b8c6ef54bec66`, and seven source-specific factual records. The 1,125-person, 14-center randomized study now distinguishes first-year academic/discipline outcomes from the 18-month null charge result and from the May-2017-dollar net societal service cost of about $10,400 per program-group girl. It records short follow-up, Florida public-school scope, the high-school-only measures, the 7.9-month average PACE stay used in cost accounting, and the absence of a benefit-cost conclusion; see `docs/pace-study-notes.md`.

Proposal `c51be0a117e54c5581156ed921a19eb8`, proposal transaction `0x72a9aa47ca51ff559ff46de50fae19e1c8bbccdf88cd919d6230d31162e7360b`, bounty transaction `0x5b97c32061848fa6a5b4aca9107234032c69bf344b684a1c6daa2bea45eb4950`, and Fast Path vote `0xd143e7658229a7f16ea84a8858bb2a06535e3f7602a508b97027bd3636524bb9` are confirmed. The initial read delay resolved without resubmission: generic verification passed 89 checks, the Article-filtered dashboard family returns exactly seven rows, and bounty coverage is 129/129.

### PACE Florida geography completion (2026-09-12 UTC)

The PACE Article, Initiative, and seven factual records now reuse canonical Florida State `439e428f73a44766895c396bdea0e534` from Geography space `84a679ce188f061ac9a92380bac2bab5`. The report evaluates 14 Florida centers statewide and all-space discovery found no exact PACE Center for Girls identity, so this batch records only defensible state-level geography. It does not infer a center location, coordinate, public stop, or outreach route.

Proposal `852fb1e284a74f57a146efc1c01225bb`, proposal transaction `0x3d34dea09fa7c0e9ae86045eb444fa376d20ada5c6389b381667ae853203f27b`, bounty transaction `0xb091c151add9da7db49ed875817bf3700d328d106238d8355f2c7897400d0365`, and Fast Path vote `0x18a844a090b5b700c7d5b75ab8c1a725bb074a7b629bc2d244e6dade1e65c3b0` are confirmed. The first reads saw normal relation-indexing delay; the same batch then passed all 11 generic checks, without a duplicate publication. Bounty coverage is 130/130.

### PACE population, design, and debate completion (2026-09-12 UTC)

The evaluated PACE Initiative now has structured Population and Design facets: 1,125 eligible Florida girls aged 11–18, with the 673/452 random-assignment split across 14 centers; and an individual-level randomized evaluation with first-year public-school outcomes, 18-month juvenile-justice follow-up, and a 12-month service-cost analysis. These fields preserve the alternative-community-services control condition and the evaluation time windows; they do not describe current delivery or all girls.

Facet proposal `a6a457be1a8c4dddba858baed02dcebb`, proposal transaction `0x8025d1e12188e167a3d1dca0a148e3f9e86299507674380165f3f0a32f9a39b7`, bounty transaction `0xf495532b57c63789b55b17b91a77cf25c24eec432e143ba2fdd36de65b4db0a8`, and Fast Path vote `0xb4086c4379c8f9bc4b1585338d6ff1843ccb05ae860bb027c1d997093771faba` are confirmed. Generic verification passed four checks and bounty coverage reached 131/131.

Published nonfactual parent Claim `ef2a762698ee48d1b663193758dd3ae2`: “States should treat PACE’s short-term school gains as insufficient evidence for statewide expansion.” Its Supporting evidence is the $10,400 service cost and the null 18-month charge result; its Opposing evidence is the four statistically significant first-year attendance, on-track, credit-success, and suspension findings. All six records remain Related to the same PACE Article and Initiative, so the dashboard can show the evidence roles without counting outcomes from one trial as separate corroborating studies.

Debate proposal `6a1dafa2a5eb4cda9e0ffedf3d967449`, proposal transaction `0x3cc87d1b3c6694ad92179885867b1cbc09ffa0fd9c3518785ba26aacc4689a71`, bounty transaction `0xfc7f542f525bddfab862a48a026aafa22e9b1447eaf1ee1085219ef1e73b05ed`, and Fast Path vote `0x70900a0949e56936fb8663a880c12ee8949200ce879bf2a851268b1c75eb32a6` are confirmed. Generic verification passed 26 checks, every comparison-dashboard family passed, and bounty coverage is 132/132.

### Male Student Success Initiative randomized outcomes and cost (2026-09-12 UTC)

Published MDRC’s 2023 Article `4eb6ce035ec046b59e29ac3a49cac986`, the evaluated CCBC MSSI Initiative `a68db5eefb7c442dbd3aee5d25ebc27d`, and six source-specific factual records. The 514-student randomized evaluation separates first-semester course enrollment and passing, the null first-semester credits difference, and the cohorts-1-to-3 fourth-semester grade finding from the real-2021-dollar $885 intended-participant cost. It preserves the usual-services control condition, one-college scope, pandemic and implementation limitations, and the report’s statement that cost effectiveness could not be determined; no benefit-cost ratio, saving, or cost-per-outcome claim is created.

The Article, Initiative, and all six records reuse canonical Maryland State `629b86b1f4074326a0f14227f87a9e88` from Geography space `84a679ce188f061ac9a92380bac2bab5`. The report identifies CCBC but the complete exact-name all-space query found no established college identity, so this package does not invent a college entity, campus coordinate, or outreach stop.

Proposal `982109ae53e446b9bfb67d990d62c6c2`, proposal transaction `0x29558da0fc08432fa1f3fc0a08333c71dd89059e3410e8d963a68085e38944d0`, bounty transaction `0x21965435ca17662878c71db437a8567208e8e2c339d3375505d5f827d54640c5`, and Fast Path vote `0xe9a9763200f5716cbb5abfd4f8e864d73e1e70a1db43b9b577cf0cc65e3bcee4` are confirmed. Generic verification passed 86 checks, the Article-filtered dashboard family returns exactly six rows, and bounty coverage is 133/133.

### MSSI population, design, and debate completion (2026-09-12 UTC)

The MSSI Initiative now has structured Population and Design facets preserving the 514-student 304/210 allocation, the usual-services control condition, the 2019–2022 evaluation period, its full-sample and cohorts-1-to-3 follow-up windows, implementation research, and its six-term intent-to-treat cost analysis. These describe the study rather than current CCBC delivery or all students who identify as male students of color.

Facet proposal `bd0e7d2b3fe249a1a1264313b90698c1`, proposal transaction `0x7ac9a11e6b6ef23f8104ad4730f65349051f8c1d4579efc83d153f2fdd884a17`, bounty transaction `0xe05f7e4e2dcca774605b53da65204bc4dc47fe938abfc77f66cc9ef9292d2ef3`, and Fast Path vote `0x2616a57a62eb66611e2711044ec2d01d5c6731233a1e140db01aa34eb4ee36bd` are confirmed. Generic verification passed four checks.

Published nonfactual parent Claim `a22ddbd57ddf46d2aeee82ab7158dc63`: “Community colleges should expand culturally tailored supports for male students of color despite mixed persistence evidence.” The first-semester course outcomes and later grade record are Supporting evidence; the null credits record and the cost record, whose source says cost effectiveness cannot be determined, are Opposing context. All five facts remain Related to one Article and Initiative, preventing a dashboard from counting results of the same study as independent corroboration.

Debate proposal `bceea3b164b946fca75aa572a56ac419`, proposal transaction `0x2ac1eb796dbee9b90159643608344106ef1ad842c0750737d80903b14c020f9b`, bounty transaction `0x250986386b23b16540b7b89bb3935af050e574833821cc30bfa332dc92f2de77`, and Fast Path vote `0x65910f7946b2bfd38df0214547a8a22a96ced88356473c641d723ae16abbae36` are confirmed. Generic verification passed 23 checks, the comparison dashboard passes, and bounty coverage is 135/135.

### Texas Developmental Summer Bridge core evidence (2026-09-12 UTC)

Published MDRC/NCPR’s 2011 Article `9a01e3c8d25145ada294e929bdb75870`, the evaluated multi-site Texas Summer Bridge Initiative `85d44ca8fe064a72a586e7c64f9aa1bc`, and six source-specific factual records. The 1,318-student randomized evaluation separates the 2009-dollar $1,319 average resource requirement per admitted student from first-fall course outcomes: +8.7 percentage points attempting first college-level math, +4.4 points passing it, +5.1 points passing first college-level writing, and a non-significant +1.0-point registration difference. It records preliminary one-year scope, varied delivery across eight colleges, 30% overhead, and possible start-up costs; it does not make a cost-effectiveness, persistence, degree, or earnings claim. See `docs/texas-summer-bridge-study-notes.md`.

Core proposal `f35c40755f2748149c3087af8338ea51`, proposal transaction `0x1f5c0475d0691ffbe998ec679973dc0d6aac4497b2a99ed848798fe0a71890b3`, bounty transaction `0xc383fd0ad283099c32bf3348b0fb16252553409fbb3e4d2993e3a65dd3131b52`, and Fast Path vote `0x491de5cfcf68134c08757ae15a3fd02a756729f4a07c58375838bd90910b1fcd` are confirmed. Generic verification passed 85 checks, the bounty scan is 136/136, and the comparison dashboard now has an Article-filtered six-row family.

The Initiative’s structured facets record its 1,318 consenting-student 793/525 allocation across seven community colleges and one open-admissions four-year university, plus the individual-level randomized 2009 multi-site design and early outcome/resource-cost scope. Facet proposal `7c59aa0b418447759e592eaf50294e8f`, proposal transaction `0xc94e228d5c31f923e862f0c8cb004ff92efce6cb74f2daf130af59fc4c6dc3d0`, bounty transaction `0xf6a29223baad979b9f700345d012f151802053d2195b0e9dbfd4e08f274fd650`, and Fast Path vote `0x8f2ecfe9585544870d23037246dcf89b38d08434050e3372cdb3339dfeaab184` are confirmed. Generic verification passed four checks.

Published nonfactual parent Claim `7da8e7f4212c430e9ed2164fb43d6ac4`: “Community colleges should scale developmental summer bridge programs based on early course gains.” The three statistically significant first-fall course findings are Supporting evidence; the non-significant registration finding and the resource requirement are Opposing context. This is deliberately a contested policy proposition, while the factual evidence remains linked to one Article and Initiative and the source does not support a cost-effectiveness conclusion.

Debate proposal `7a0368e065624ac99990b03e99d89978`, proposal transaction `0xacbcdaf275e764cabf1fe91a5f1f45a5806933d3092d4b773a881e36e4af0de7`, bounty transaction `0x2454c3c918ba08f4afea50ee23f3c0805f8f525c49f9db3770a2c0bc7884be5e`, and Fast Path vote `0xca850123ac080ce635f33731daa6884fe0a2c1552bc6a3ea8bc737747c9abb2b` are confirmed. Generic verification passed 23 checks, dashboard verification passed every family, and bounty coverage is 138/138.

### Builder lesson: nullable design rows (2026-09-12 UTC)

The Texas builder initially attempted to encode a numeric estimate for its design record, whose value is intentionally null. TypeScript and decimal conversion failed before publication. Builders must only emit a Decimal or Cost value when the source row has a numeric observation; design records should retain their source-grounded sample, unit, locator, and factual flag without a fabricated zero or estimate. The corrected builder also records the report’s explicit 2009-dollar price year rather than treating it as unknown.

### WorkAdvance Claim readability repair (2026-09-12 UTC)

Twenty-two existing WorkAdvance factual Claims were repaired in place after review found table-label titles such as “earnings effect: +$2,716.” The revised titles state the underlying finding: significant earnings/threshold results say what increased; non-significant provider estimates explicitly say that they are not statistically significant; and the net-gain records identify MDRC’s model and its accounting perspective. Concise two-sentence descriptions preserve the 2018 wage source, p values, provider scope, horizon, discount rate, and the distinction between source-modelled net gain and a benefit-cost ratio. No IDs, numeric values, sources, provider relations, or factual classifications changed.

Proposal `f1974d7b428f4b84b8ad8a214023b174`, main transaction `0xb30e314ce984a5481019b8067dd562b5dc2653e93c1b81269fe1223eefd47cf5`, bounty transaction `0x01850808a14e760c22c721e2332b32c28cd2383aea94e3531adfcf54f5b5bd0b`, and Fast Path vote `0x6b86a282d647e9c5eb84e9cf9cea11b6116082d7c2cfd8b26856f2e22093c206` are confirmed. Generic verification passed 46 checks and the refreshed all-claim readability audit now has 58 heuristic review flags across 505 current claims, down from 74 flags before this repair. Bounty coverage is 139/139.

### Readability-audit proposition detection refinement (2026-09-12 UTC)

The audit initially misclassified valid finding-first titles using “randomly assigned,” “required,” “showed,” or “should” because its title heuristic recognized only a narrow verb set. These are valid factual or evaluative propositions when their surrounding wording and source context are correct. The matcher now recognizes them, while retaining a manual-review flag for labels that do not state a finding. TypeScript passes; the refreshed audit has 28 review flags across 505 Claims, and every Texas Summer Bridge factual and debate Claim has zero flags. This refines review prioritization only; it does not change any published Geo entity.

### Viking ROADS randomized replication (2026-09-12 UTC)

Published MDRC’s 2025 Article `581c4b9bd2ec40d69cbcf68b973d8803`, the evaluated SUNY Westchester Viking ROADS Initiative `0fbccd38112b486fa1e3417ac1497bec`, and five source-specific factual records. The 574-student randomized evaluation records 288/286 assignment, semester-three enrollment (+8.2 points) and credits (+3.6), six-semester credential attainment (+11.8 points; 35.5% versus 23.7%), and the 60-or-more-credit threshold (+4.4 points). It preserves the one-college, COVID-era delivery context and usual-services control condition. The report provides no complete cost analysis, so no cost, cost-per-degree, benefit-cost, or cross-program efficiency result is created; it is a distinct ASAP-style replication, not an independent confirmation of every original CUNY ASAP component.

Proposal `b6de469f8db24a4bbebb51de91fda478`, main transaction `0x19e00a257c6f1d969513eda8b86cd047841cde661fb06de3bc034356a9f5ed7a`, bounty transaction `0xbcbd2682d6ab3a9d44f7a9c63fda560f2fea71619233541683985db85ef70c95`, and Fast Path vote `0x9711c358593f61180140bc43487c259c04f8f3d5d75ac080fda508315a00352a` are confirmed. Generic verification passed 60 checks, the Article-filtered dashboard family returns exactly five rows, and bounty coverage is 140/140. See `docs/viking-roads-study-notes.md`.

Published nonfactual parent Claim `18f8c460d0d24800ad28c0d46ef9d063`: “Community colleges should replicate Viking ROADS-style comprehensive support based on its three-year degree gains.” The degree, semester-three enrollment, and credit findings are Supporting evidence. The randomized-design record and 60-credit result are Opposing context for generalization: they keep the one-college, COVID-era, no-complete-cost-analysis scope visible without pretending to be another trial.

Debate proposal `da061138254444a7a4ba86eb02952443`, main transaction `0xf92e2e891a665e3c8fc7a356ae3219393643bebe4628bd54f643fe9291023e15`, bounty transaction `0xd501d3c64f9648bdbb9bdd7340c1838c00e2b18aa0dbc894125a8d1ee7f6699c`, and Fast Path vote `0xb41510cfabafaedabdbc24a4f3c4c14fd8e95b938c0f769a9f5140577d759b17` are confirmed. Generic verification passed 23 checks and bounty coverage is 141/141.

The Viking Initiative now has structured Population and Design facets: the 574 consenting-student 288/286 allocation across three cohorts, and the individual-level usual-services RCT with six-semester transcript/Clearinghouse follow-up and COVID-era remote or hybrid delivery. These describe the evaluation, not all SUNY Westchester students or current service delivery.

Facet proposal `afee82f2ae4f41d184e36dd22fcb6dc4`, main transaction `0x525ea4e023e7b72970952bb52def22810c251461384356a69b0c0e6b570835cc`, bounty transaction `0xbe2c68627344b38236acee1132332d5b1a956b238aab17a35e4bb6a95cfeb762`, and Fast Path vote `0x56e74d19d2d642329a7efc75df372c9368325b0ef216d20bbc727a5b946b48f0` are confirmed. Generic verification passed four checks and bounty coverage is 142/142.

### No Child Left Behind math-versus-reading debate (2026-09-12 UTC)

Published nonfactual parent Claim `6644928336104cbaa5a1a409aa2d0bfc`: “Federal test-based accountability should be judged as a math-specific achievement policy rather than a general reading reform.” The source’s fourth- and eighth-grade math findings are Supporting evidence; its fourth/eighth-grade reading null finding is Opposing evidence. This keeps separate achievement domains from one NBER study explicit rather than treating them as independent studies or asserting a general policy verdict.

Proposal `6071edf18fc24086b786d57267a3cc97`, main transaction `0x98dc02327d287f1807d04a58cbd8a42d19bb99ee77907e142af2ccb21d4e41df`, bounty transaction `0x822d86a0a39b2b3b0b69633dd053d78c55973eeb343692191926f1a78dd02da5`, and Fast Path vote `0x987113580b70a477b35ed4ae7653cbba2aaf01ead24ff9e96ddbed0fb4429c40` are confirmed. Generic verification passed 17 checks and bounty coverage is 143/143.

### Kingsborough Opening Doors six-year degree and cost evidence (2026-09-12 UTC)

Published MDRC’s 2012 Article `e6329e1831db4ceea35b483e5fc50cc1`, the Kingsborough-specific Opening Doors Initiative `d87635a2d7374daba6ddea72578c3be6`, and four factual records. The 1,534-student randomized trial records the six-year degree-attainment difference of +4.6 percentage points (35.9% versus 31.3%; SE 2.7), plus the report’s 2011-dollar six-year accounting outputs: $3,580 higher total education cost per program-group member and $2,480 lower cost per degree earned. These cost records preserve their group-level CUNY financial-data and degree-rate basis; they are not benefit-cost ratios, general savings, or findings for the broader Opening Doors or Learning Communities portfolios. See `docs/opening-doors-kingsborough-study-notes.md`.

Exact-name discovery ran across spaces and stopped creation on any exact candidate or incomplete candidate page; no cross-space candidate was found. Core proposal `e811400b0f0b4efeb6dc263587b0c66b`, proposal transaction `0x77c1bf2f81d688b1a06bbb36e88e902286821a8b672d07398beb13b6f229d1d9`, bounty transaction `0xd30a83f529120c0a248b6a37f5661b4b85f4f94d363d9061c6200fa631bd576f`, and Fast Path vote `0x4815cf9bd94b98fb490d0e08d0073d7ed646e35eeeda02b495d55a4e7e59ef91` are confirmed. Generic verification passed all 57 checks; bounty coverage is 144/144. The comparison-dashboard contract contains an Article-filtered four-record family, preventing it from mixing this source with another study of the initiative.

The Initiative now has structured Population and Design facets: 1,534 first-time daytime full-time Kingsborough freshmen aged 17–34, allocated 769/765, and the individual-level one-semester learning-community versus standard-services randomized design with six-year transcript/degree follow-up. Facet proposal `abfd0c7e652b44369e200e200b2a2d1e`, proposal transaction `0xac61c1d564bcfeb0525755e5752d10f2b5311e54379cf535da5ec7d14a413101`, bounty transaction `0x93b3633f8ae9d6a12042e2376b77356449ed6f1f866ae876fd491df603292fea`, and Fast Path vote `0x503a462308034756c179fe00d488ee11fddcbbde6fba4f68e7e7e7c534a394ec` are confirmed. Generic verification passed four checks.

Published nonfactual parent Claim `c914e96becba4bf9bf1911f5145563d2`: “Community colleges should expand freshman learning communities when degree gains outweigh their added education cost.” The six-year degree and cost-per-degree records are Supporting evidence; the added per-member cost and single-study design record are Opposing context. This is a policy proposition, not a source finding: all evidence retains its same-Article, same-Initiative links and cannot be interpreted as independent replication. Debate proposal `7db9c68ad7544b038de2aa69fbe6a018`, proposal transaction `0x3cab6df367208de9258d1cb1500a81de067a221d3877e135c4be321a226e0d1e`, bounty transaction `0xcc3d57506476f6f613083899a5b2053f8ca9caffb28e771805fc4f522c7caee1`, and Fast Path vote `0x8c034bfb2e63831f8e04b05dabe5ba72b66143c47ef20ef090961d2928f1b16d` are confirmed. Generic verification passed 20 checks and bounty coverage is 146/146.

The Article, Initiative, and all four factual records now reuse canonical New York City `deaa7d31c1e569ec5d9f27ae307f08cb` from Geography space `84a679ce188f061ac9a92380bac2bab5`. Its City type and existing New York/United States hierarchy were rechecked before linking. The report identifies Kingsborough in Brooklyn, so city-level study geography is supported; this batch creates neither a college, a coordinate, a public stop, nor an outreach route. Geography proposal `34673fed4e6642ce90034395d8dc6295`, proposal transaction `0xd95d248fab5d5d0b64abcf8d544d7e977d1cfa24997ad95c04810488a90ed21f`, bounty transaction `0x68e74f2e92c2b6387cf3be50f83c11e566bd286d097140a03bb0be7c77441ab9`, and Fast Path vote `0x602211f308da9b79a70304c3644c75a1f7bdf82cec1e1949cf83d0b8689a27ab` are confirmed. Generic verification passed eight checks, the live location query returns exactly six target records, and bounty coverage is 147/147.

### New York City Small Schools of Choice source boundary (2026-09-12 UTC)

The next comprehensive package is source-verified in `docs/nyc-small-schools-study-notes.md`. MDRC’s January 2026 longitudinal outcome brief reports lottery/instrumental-variable findings for 16,496 2005–2008 SSC applicants, including +8.2 points in four-year high-school graduation, +9.5 points in immediate postsecondary enrollment, and +2.5 points in six-year four-year-degree attainment. A distinct 2014 MDRC cost paper gives five-year direct-service expenditure and cost-per-graduate accounting for earlier cohorts. These reports belong to one SSC evaluation lineage, must retain their Article and cohort filters, and must not be represented as independent replications or a universal cost-benefit claim. No Geo entities have been created from this research yet.

### New York City Small Schools of Choice longitudinal outcomes and cost evidence (2026-09-12 UTC)

Published the 2026 longitudinal Article `3a02b7c1d1ea4d8b8f29489610fd62c4`, the distinct 2014 cost-accounting Article `4f1726ca9f934e30b72c18a41f82846a`, the shared SSC Initiative `a375aee3832b4c6890352b81c7a981a2`, and seven factual records. The outcome family preserves the 16,496-student lottery/instrumental-variable design, +8.2-point four-year graduation, +9.5-point immediate postsecondary enrollment, +2.5-point six-year four-year-degree attainment, and the brief’s qualified employment/earnings null. The earlier cost family records $2,572 lower five-year direct-service expenditures and $14,674 lower cost per graduate, while retaining the absent common price year and incomplete facilities, partner-resource, and start-up accounting. These are one SSC evaluation lineage with distinct cohorts and Articles, not independent studies or a universal benefit-cost claim.

Complete all-space exact-name discovery found no candidate for either Article, the Initiative, or any Claim before creation. Proposal `750a1e2395e94a0e97699f9d20079d4e`, proposal transaction `0x8fd0beb351be7df04a66553046cad308a05c34e88b92f58b21d6b59ca682a01f`, bounty transaction `0x9a3feaae78d703aacaf349dd57b199548fe2e9bbee1bf45467699073e0fc1d51`, and Fast Path vote `0x3ca942bd672f46f75ae0d02b6678a05f851032c9ddec13e202a8439875d30bee` are confirmed. Generic verification passed all 88 checks and bounty coverage is 148/148. The dashboard has separate Article-filtered five-record outcome and two-record accounting families.

The SSC Initiative now carries structured Population and Design facets for the 16,496 rising-ninth-grade applicant cohorts and the lottery/instrumental-variable longitudinal design. Facet proposal `4a190452e6f24834bb5c798c0011e35c`, proposal transaction `0x5f5a8d0a8803adee10bbd7363491737c1702facc00088547535b6b23a07431ec`, bounty transaction `0x0bcf1b68789e687afe1cdad21f331980549f556c3236e5d21bec4e37fe5c0616`, and Fast Path vote `0x76150fe8c3836bd2502c006fde26fc6a74b3586b2129a4874b4c0bd87bc960ae` are confirmed. Generic verification passed four checks.

Published nonfactual parent Claim `f52cdadd559941108e30e386df42bce4`: “Large urban districts should expand small, nonselective high-school options when lottery evidence shows sustained attainment gains.” The graduation, postsecondary, degree, and cost-per-graduate records are Supporting evidence; the employment/earnings null, incomplete cost-accounting context, and lottery/IV design are Opposing context. All remain linked under one Initiative and source lineage. Debate proposal `a1f53f325cfa4e81b6d9d18961dc6b8d`, proposal transaction `0xf6b3265540bb4c1555b6dde6dbce971780521e1ceae9a5b3808bc79c71c09e33`, bounty transaction `0x96f37b0d27aa4cd3633aec8da80b92b6b0f9808cb1979c016b498c3e1e96e7d5`, and confirmed Fast Path vote `0x53fe4e30302ad0ddb4b7349aa3c76d73c0921942af0292975fec8a7576682eb3` are confirmed. Generic verification passed 29 checks and bounty coverage is 150/150.

The two SSC Articles, Initiative, and all seven factual records now reuse canonical New York City `deaa7d31c1e569ec5d9f27ae307f08cb` from Geography space `84a679ce188f061ac9a92380bac2bab5`. The portfolio covers more than 100 schools, so this is defensible city-level study geography only: it creates no school entity, campus coordinate, public stop, or outreach route. Geography proposal `868a6a8e48bb4880ac74a27af840275e`, proposal transaction `0xa7edb465031d7293ca09b6a62aee86e562f70aaf341fa47d578fcc1a8dcb0945`, bounty transaction `0x229ec7852506f5c930429f309fe103c1ed1679d33277e89f5d8b671372770652`, and Fast Path vote `0xe061db9984e105db775fa9e4a6f91d7257a29df2df7188f57ee56cae6a5c4495` are confirmed. Generic verification passed 12 checks, live geography retrieval returns exactly ten target records, and bounty coverage is 151/151.

### Early College High Schools source extraction (2026-09-12 UTC)

`docs/early-college-study-notes.md` records a verified next package from AIR’s 2019 lottery follow-up: 2,458 applicants across ten Early Colleges in five states, with Year-10 ITT outcomes of +7.2 points any college enrollment, +11.9 any postsecondary degree, +18.2 associate/certificate, +5.2 bachelor’s, and a non-significant +0.8-point four-year-enrollment finding. IES identifies a separate AIR cost-benefit analysis with a reported approximately $3,800 added four-year cost and $58,000 modelled lifetime benefit per student. The primary cost paper still needs price-year, discount-rate, and accounting-scope inspection before those money values can be published. No Geo entities have been created from this research yet.

### Early College High Schools: complete source-specific evidence and linked debate (2026-09-12 UTC)

The primary AIR cost paper was inspected before publication. It identifies all money as CPI-adjusted 2017 USD and reports a preferred $57,682 modelled lifetime benefit, $3,819 four-year midpoint incremental cost, $53,863 NPV, and 15.1 benefit-to-cost ratio per student; the conservative scenario has a 4.6 ratio. These are source-reported model outputs, not observed earnings: attainment effects come from the ten-site lottery study, while the cost comparison covers six sites and incompletely captures centralized nonadministrative costs such as transportation. The detail, evidence, and remaining limits are in `docs/early-college-study-notes.md`.

Published AIR’s outcome Article `038f546c2508401eb3890f0fc6954b53`, AIR’s cost-model Article `0b285e99daa5436f8d02e608fea4fb2b`, the evaluated Initiative `5c33ee4be2fc4c38ae220a4fff9a3d69`, and eleven factual records. The Year-10 outcome titles give the actual ITT estimates and comparisons, including the four-year-college-enrollment null, rather than generic labels. The five money/model titles explicitly identify them as source-reported models. Exact-name discovery ran across all spaces for every created identity and did not find a candidate or incomplete candidate page.

Core proposal `f69483093f424072921586c88b1ea4aa`, proposal transaction `0x5c81933a84a1e45caeba0aaa4515dcee4c2893204daf1e9e97f2ed6d3a855aeb`, bounty transaction `0x44fe42e17271378a2032ffc73760e404d47ad6352959e08322e4e7bf6b4dc67a`, and Fast Path vote `0x64e4d4eb3e83d310648927ae88e7dcdc0f67f40d12f0848937fb2c2276acc08c` are confirmed. Generic verification passed 145 checks. Two Article-filtered dashboard families return exactly six ITT outcome rows and five cost-model rows, so frontend consumers cannot blend a Year-10 causal estimate with model outputs or mistake multiple outcomes for independent studies.

The Initiative’s structured Population and Design facets now preserve the 2,458 applicants, 1,044/1,414 offer allocation, ten sites/five states, 2005–2008 cohorts, Year-10 ITT horizon, and six-site cost-model boundary. Facet proposal `9af39647bba541ccb079d7f4c4ba40a0`, proposal transaction `0x92660c917659e7df79911e0032fe56224a0b2d3d09342410b06bae4d2d33f52b`, bounty transaction `0x90653b3b595176be837eac753867e6c44295f284f414b0d17b4b5c882e627750`, and Fast Path vote `0x3501c32c0a9cbf3dae116e9b85c89efbfe781ef4f81162f073fd384b4e9cda73` are confirmed; generic verification passed four checks.

Published nonfactual parent Claim `d9adb8dfda8144d8b05205b38e9be903`: “Districts should expand Early College High Schools when local partnerships can deliver their documented degree gains at comparable cost.” The three degree results and preferred source-reported model ratio are Supporting evidence. The four-year-enrollment null, midpoint incremental-cost model, and multi-site/six-site design boundary are Opposing context. This is a contestable policy proposition, not a source finding, and all linked evidence stays under its Article and Initiative lineage. Debate proposal `44209c927ff641d2a3b9090a03d5b5d5`, proposal transaction `0xcf7c1a81eac61f3c097840282f1124a3d9c516bcef3566f621c2168816efb9bf`, bounty transaction `0x1785e560123d22272352427afce169839ec0a57e4976510c21041f87fa13a018`, and Fast Path vote `0x9154326890d9584346e97ea8c6f3044e8cb59563ce5679c552c152285a6791e0` are confirmed. Generic verification passed 29 checks; dashboard verification passes all families; bounty coverage is 154/154.

Rendered Claim-page review passed for the factual degree Claim `aba7c2b614334f42a245f910c8058bcf` and the policy Claim `d9adb8dfda8144d8b05205b38e9be903`: each displays its complete reader-facing proposition, concise description, Claim affordance, and AIR Article source link. This specifically confirms the essential text is visible even where structured numeric properties are not shown on Geo’s dedicated Claim page.

No location relation was created: AIR’s study scope is five states and does not establish a single city, school coordinate, public service stop, or outreach route. This preserves the map safety rule while leaving the package usable in non-map dashboard views.

### Year Up PACE seven-year package: verified extraction (2026-09-12 UTC)

The next comprehensive family is captured in `docs/year-up-study-notes.md` from Abt/ACF’s 2022 primary report. It is a 2,544-applicant PACE RCT of Year Up’s core program across eight offices/nine cities. The report’s prespecified Quarter-23/24 earnings outcome is +$1,895 (SE $267, p < .001); it also reports Year-1 earnings displacement, +$8,251 in Year 7, +$38,152 over Years 1–7, a high-quarterly-earnings threshold gain, and a six-year employment-rate null. The report’s $23,135 cost, $57,019 benefit, $33,884 net benefit and 2.46 ratio are source-model values and remain unpublished until the common price year and discounting convention are verified. No Geo entities are created from this family yet.

### Year Up PACE seven-year randomized earnings evidence (2026-09-12 UTC)

Published the Abt/ACF Article `ce3170d43bfc4a98ba1594ebc591e6d7`, the PACE-specific Year Up core-program Initiative `3d4ce15a3f0143f68e184c28cb5e1f0d`, and seven factual records. The titles and descriptions preserve the treatment/control amounts, uncertainty, p values, source-specific NDNH scope, early earnings displacement, cumulative horizon, and the employment-rate null. Exact-name discovery was completed across spaces before creation. The source’s cost-benefit model remains intentionally excluded because a conventional common dollar price year for Geo’s typed Price Year field has not been established; the dashboard must not treat the earnings rows as costs.

Proposal `3cde2492763f4a169b893f394b6a69b6`, proposal transaction `0x57d7453bb0734e96dcb3a67396db5df0822ab7fe2e9a75fff23ab5c91ee1cc2c`, bounty transaction `0x8675efef3585029d408c5069d892f70f39cdcb1f0fa398dc311b72624ffbdfee`, and Fast Path vote `0x3d433f119cc32d040c97da37865c83d35c7e0272d62ce6fb5cbf9166daa323b4` are confirmed. Generic verification passed 89 checks; bounty coverage is 155/155. The comparison-dashboard verifier now includes an Article-filtered seven-record family.

The Initiative now has structured Population and Design facets. The Population distinguishes the 2,544 randomized applicants from the 2,495-person NDNH earnings-analysis sample; the Design records individual PACE ITT assignment, the six-month training and internship sequence, and seven-year follow-up. Facet proposal `5a327d17de7f470fb5c20461277dafc9`, proposal transaction `0xd4470a0ff5184d07858a473fba8722e9d4caac2aa4d2768372b978d62d75006a`, bounty transaction `0xdf2959af0320eb62b9c444e496c24ba1be94ae8932142fa79a6a6c4f80c7e668`, and Fast Path vote `0x9430d8655e035ddc7f877139697239a36d5d18b3201d298e12649a64dc5f0f74` are confirmed. Generic verification passed four checks.

The RCT-design Claim was corrected from the 2,495 earnings-analysis sample to the source’s 2,544 randomized applicants. A first serialized payload was rejected before submission because its SDK `Uint8Array` identifiers were not represented with `$bytes`; the replacement `year-up-design-sample-fix-v2` proposal `5662fd5023af4f50bacafe21e1083138`, proposal transaction `0xf3bf3576b9592ccb03b594abeabbe18e5feb2279f08c21f733069b97f2e6cfd2`, bounty transaction `0x152da2d86929000eb1526a91d327a680bca55fa55217b55ac0b841c820557222`, and Fast Path vote `0x4b0c5d4114b192bc135144dd0dd86105daff66ea42ac44da90350f9777b8277c` are confirmed. The verified serialization fix is recorded in `docs/year-up-study-notes.md`.

Published nonfactual parent Claim `3211d1b55694499884822c26c8c45c71`: “Workforce agencies should expand Year Up-style training and internships when they can sustain the long-run earnings gains shown in the PACE trial.” The confirmatory-quarter earnings result, Year-7 and cumulative earnings gains, and high-earnings threshold are Supporting evidence. The first-year earnings displacement, six-year employment-rate null, and RCT design boundary are Opposing context; the unresolved-price cost-benefit model remains excluded. Debate proposal `0358a55414274fe1aba39983d816fcde`, proposal transaction `0xf4ac9c189566014a4c58d29cde54c5f848940450119d59d55ca35a328e4d8e54`, bounty transaction `0x9084c7a4012d8522d76e2a59d25cd2f5443d2f480de6abb9b340233f80f06552`, and Fast Path vote `0x5b7965849d379b6fb3d4130d56f2615af904bf4c82c118582468998928b38664` are confirmed. Generic verification passed 29 checks, dashboard verification passes the Article-filtered family, and bounty coverage is 158 executed and linked proposals with one historical pre-submission serialization rejection retained in the journal.

The rendered dedicated Claim page was reviewed at `https://www.geobrowser.io/space/dac259bad48a11adf97fe36857d85206/3211d1b55694499884822c26c8c45c71`: it shows the full policy proposition, two-sentence description, Claim affordance, response controls, and source Article link without relying on hidden structured fields.

### Policy Claim description-length repair (2026-09-12 UTC)

Shortened the reader-facing descriptions of the DCMP, PACE and San Francisco ethnic-studies policy Claims (`6a17e75eef784856b20aa358a5eb7660`, `ef2a762698ee48d1b663193758dd3ae2`, and `89724696a30644478a285d856a412b1f`) to two sentences each. The edit preserved names, factual flags, sources, evidence relations, numeric facts and stable IDs; it only moves the essential uncertainty into concise Claim-page prose. Proposal `4bce31e80d0e47d5ac59b1e12c25f888`, proposal transaction `0xc619c5dac737c1b6a05f3e80608f43c019826285d3818f023341a42a11426fa4`, bounty transaction `0xbfa3ba6683c64d0cdfd88426526c67d3605e7390dcd38d3efa47d9aa51e0e924`, and Fast Path vote `0x998d0c7143d44241ae263e985e65bb2d912940f71451728f6de51318ede4cbb0` are confirmed. Five post-index checks pass; the readability audit now has 27 heuristic candidates among 545 Claims, down from 30. Those remaining candidates require source-aware review, not bulk rewriting.

### SEDA catalog resource published (2026-09-12 UTC)

Published Dataset `04a4c7047b0b414b8920890c5ca2f8a0` for Stanford Education Data Archive (SEDA), Version 6.0, with reader metadata block `fc397c8fbbbf4d39b01b171ded7daeac`. Cross-space discovery was complete for the exact title, full archive name, version alias, and steward name; all returned no candidate. The acronym-only search was deliberately excluded because it is ambiguous. The dataset records only public catalog context—official URL, public download/codebook access, geography/unit, joins, measures, release caveat, and the source catalog’s `seda-v5`/Version 6.0 inconsistency—so it cannot be mistaken for raw data, causal evidence, or an Initiative effect.

Proposal `cd4493d00950495e84215aee3ef86f2b`, proposal transaction `0x877bc2a4159daf4b98deb92b76bc41b010b381d9fdc6c9573b1462957d56b21c`, bounty transaction `0x1d7a0ebd9f4d19f3bcac31648d7d076c5c98c2ffd0c999da271df6914d82cfcc`, and Fast Path vote `0x8b7a06f89275a8f89fb71e73a1e6cf2819ab69996f19feabb65a86042ba8d8f6` are confirmed. The first two indexed reads saw normal post-execution absence; the existing confirmed proposal was polled and then passed all ten generic verification checks. Bounty coverage is now 162 confirmed of 162 executed publication journals; retain the historical pre-submission serialization rejection separately.

### EDFacts catalog resource published (2026-09-12 UTC)

Published Dataset `26aa14b7c05c4b0d86260e3f405b1653` and metadata block `f47c61f312fe448f8c15db44569d4411` for EDFacts / Ed Data Express. Exact-title and all three specific alias searches completed with no graph-wide candidate before allocating IDs. The metadata explicitly retains annual/subgroup scope, source URL, access route, joins, measures, file-specific notes, suppression rules, and denominator requirement so dashboard consumers cannot turn a released administrative value into a causal program result.

Proposal `811818ba722c4e1ea39dc5f8693fca0c`, proposal transaction `0x4573904d8fac7e3363528f49bf56f0d16db6aa2b8527edb6e4380e2bf8cabf3b`, bounty transaction `0x47f633a8a9804aae1adfa2528e6567991f0b0376f6cfb99f9319de1b2bef2faa`, and Fast Path vote `0xc87112224ababbcb20849a85e4f9b6244baa841a63a45029ed5e70278b386a21` are confirmed. Generic post-index verification passed ten checks.

### Abecedarian age-30 outcome expansion (2026-09-12 UTC)

The ABC age-30 study now has eight factual outcomes plus a nonfactual parent Claim. The expanded package adds source-backed high-school credential and criminal-conviction nulls alongside public-aid and age-at-first-parity findings, each linked to the ABC Study and Article with typed source effect measures. The policy parent has reciprocal Related edges for all evidence, with the two positive findings marked Supporting and the two nulls marked Opposing. This gives the dashboard a source-scoped, two-direction evidence graph without treating outcomes from the same 101-person follow-up as independent studies.

Proposal `85ecb5f2816a4910869a3c9e0b8cfb44`, transaction `0x8f052e5f70293ce0d5cba80cb1290f99814e3b01687faf1a59de34645d326493`, bounty transaction `0x182f4eacbc1bb9257ba83f6e7fa330b714984150077c3239e6b4eae938c8fd92`, and Fast Path vote `0xcdc55a36aa536f181c0e21999cef31e8df7813c8c6f778fde6eae8b22b2cbbfd` are confirmed. Forty-six indexed checks pass. The durable full-table source review, including the full-employment table/prose conflict and earnings withholding decision, is in `docs/abecedarian-study-notes.md`.

### Debate-parent scope corrections (2026-09-12 UTC)

Two policy parents were more general than their linked evidence. ABC parent `58caa8fd523742978fa07d54722d918a` now names the age-30 trial outcomes as its basis; teacher-induction parent `48e8f2510c64493ebe28185c347f0ebf` now names the six-district benchmark basis. Each copy-only repair preserves stable IDs, factual Claims, sources, values, and evidence directions while its two-sentence header names the positive evidence and the material limitation.

ABC repair proposal `ac86708d5a264d52be1345cc607682a3` and induction repair proposal `b00f7e2d9b3d4160b4ada6c6e8e10a41` are executed, bounty-linked, and Fast-Path voted. See `docs/abecedarian-study-notes.md`, `docs/teacher-induction-study-notes.md`, and `docs/education-debate-claim-design.md` for exact copy, receipts, and the reusable correction rule.

### Head Start third-grade paired-estimand expansion (2026-09-12 UTC)

The Head Start third-grade family now has 36 factual rows. The latest package adds four exact report-table ITT/IOT pairs for 4-year-old-cohort total problem behavior, teacher closeness, positive teacher-child relationships, and parent time spent with child. IOT records carry the typed estimand and reciprocal Related edge to their ITT counterpart, so dashboard queries may compare estimands without representing them as separate studies.

Proposal `58f5f2f119874e699573a64803be4e46`, main transaction `0x5b9b1c004c5cc1637babfea08f86921306ea7e207763844daceaeb7b1fd52dcc`, bounty transaction `0xff978c8303fd65f9882e97154a3a27841a6aa5f7408cee9a730a8538cbb3a20b`, and Fast Path vote `0xcd37600cf1cf9ee92acb3f77d14507d052dd817260f9fc25d4a6793692322dab` are confirmed. The comparison verifier passes after indexing; `docs/head-start-study-notes.md` retains the exhibit-level transcription and direction caveats.

### Readability audit refresh (2026-09-12 UTC)

The latest live audit covers 623 destination-space Claims and nominates 35 for human review. The ten newly published Head Start rows have no flags: their titles identify the cohort, third-grade outcome, estimand, magnitude, and p value, while their two-sentence descriptions give reporter/direction and pairing context. The audit’s title heuristic still flags many valid claims that begin with a time, study, or policy proposition; it is a review queue, not a publication-quality score. The current count and source-aware review requirement are tracked in `todo.md`.

### Head Start third-grade promotion pair (2026-09-12 UTC)

The 3-year-old Head Start cohort has one newly verified, parent-reported promotion pair: 94% promotion in the Head Start group versus 95% in controls, regression-adjusted ITT −.02 and IOT −.03 (both p=.092). It is displayed as a suggestive, lower-is-less-favorable third-grade school-performance outcome; the IOT record is explicitly typed and reciprocally Related to ITT, so the dashboard now returns 38 factual Head Start rows without representing two estimands as two studies.

Proposal `f780a21ec9a04105b249119d106e5771`, main transaction `0xf75d16187e6d2c145c723852c232e0b3fa9f2a2c9a8e364661d0d148313b0f71`, bounty transaction `0xda269ade9f37bf2f49696de6a0246266eccc43b32ab1103527b52807af582d0e`, and Fast Path vote `0x3b3cae756ec09d5a749503c0a1f98d72678617ad00fc804a588460bfece9d6a7` are confirmed. See `docs/head-start-study-notes.md` for the rendered exhibit references and scope boundary.
