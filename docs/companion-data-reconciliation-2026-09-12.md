# Publisher handoff: restore atlas coverage from the original data

September 12, 2026. This is a bounded migration/reconciliation request, not a request to choose more studies or invent content. Reuse existing Geo entities before creating anything. Keep education and outreach separate.

## Where the original data is

The publisher already has the pinned source in `C:/Users/tfreestone/Code/athsrueas/geo-publisher/data/education/source/`. Its `manifest.json` records commit `3cd97449ce9ca73cccb77efe22aac69cc56131e5` and file hashes. The original checkout also exists at `C:/Users/tfreestone/Code/athsrueas/Education-Initiatives/`.

| Original file (relative to either source root) | Records | Use |
| --- | ---: | --- |
| [content/initiatives.json](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/initiatives.json) | 76 | Program identity, intervention context, assessments and source links |
| [content/sources.json](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/sources.json) | 106 | Bibliography, findings, methods and caveats |
| [content/dichotomies.json](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/dichotomies.json) | 21 | Original questions, synthesis, program/source relationships |
| `src/lib/content-schema.ts` | — | Original field definitions |
| `research-data/dataset-catalog.json`, `dataset-profiles.json`, `initiative-dataset-links.json` | — | Dataset catalog and initiative relationships; reconcile against already published catalog resources |

The removed frontend `public/data/education.json` was an aggregate of this material, not its only copy. It remains recoverable in GeoCompanion Git history. Do not restore it as a shipped fallback.

## What the current checks establish

Complete, destination-scoped live lists returned 34 Initiative entities, 8 Study entities and 34 explicitly non-factual Claims in education space `dac259bad48a11adf97fe36857d85206`. These are different collections, not a count of independent trials or a one-to-one migration of the original 76/106/21 records.

The Initiative values inspected contain Name, Description, Web URL, Population summary and Study design. Their relations include Sources, Related, Location, Topics and Providers. The original category/evidence-rating fields were not identified in those inspected records. This does **not** prove that their equivalents are absent elsewhere on Geo.

`data/education/source-to-geo-crosswalk.json` still has unresolved-discovery rows despite newer publication journals. First reconcile it against `*-registry.json`, `*-publication.json`, `*-index-verification.json` and fresh graph reads. A stale unresolved row is not permission to create a duplicate. Do not calculate “76 minus 34 missing.”

## Exact field reconciliation requested

Publisher intake check: all three original file hashes match the pinned manifest, with 76 initiatives, 106 sources and 21 questions. `data/education/original-field-reconciliation.json` inventories 2,772 fields (continuum fields expanded) across these 203 rows. Seventeen rows have prior candidate IDs in the existing crosswalk; these are not newly verified matches. Every field remains explicitly review-needed until live facts, source equivalence and property/relation mappings are checked. `scripts/education-reconciliation-ledger.py` reproduces this initial inventory and refuses to overwrite completed field reviews. No data was republished during this intake check.

The rating matrix remains unavailable until attributed assessment mappings are verified. Additional published study families remain frontend integration work. Outreach remains a separate research/publication task in Public good, using the operational-service specification below.

For each source row, return its stable original ID/slug, verified Geo ID(s), space, property/relation mappings and status: existing-and-readable, published-needs-link, absent-after-discovery, or needs-content-review. For absent fields, publish only after the normal source and content-policy checks.

| Source fields | Required Geo representation / work |
| --- | --- |
| Initiative `id`, `slug`, `name` | Verified identity crosswalk. Retain distinctions between a broad initiative, implementation/site and evaluated study; allow one-to-many mappings. |
| `category`, `tags`, `methodTags` | Reusable typed category/topic/method entities and scoped links. Return the exact IDs. Do not infer category from a title at render time. |
| `years`, `targetPopulation`, `evaluationDesigns` | Source-backed study period, population and design. Reuse existing Population summary / Study design values where equivalent; do not overwrite study-specific distinctions with broad summaries. |
| `theoryOfAction`, `inputVariablesChanged` | Linked, sourced intervention/mechanism descriptions. |
| `outputsMeasured`, `oneLineFinding`, `normalizationIssues` | Outcome/claim links with source, unit, timepoint, population and necessary caveats. Reconcile with existing numeric publications before adding prose duplicates. |
| `evidenceStrength` (initiative/source/question) | This is an imported assessment, not an effect size or the user's personal position. Identify author/provenance and review its basis. If publishable, use an explicitly attributed assessment with a documented vocabulary. The old colored dot matrix cannot be restored accurately without this contract. |
| Initiative `sourceIds`, `relatedDichotomySlugs` | Resolve source/question IDs and publish the actual relationships; no dangling local slugs. |
| Source `id`, `title`, `authors`, `year`, `url` | Reuse verified Article/source identities; attach bibliographic fields and authorship. DOI/URL matching plus publication evidence, not title-only merging. |
| Source `method`, `outcomeTags`, `finding`, `caveat`, `evidenceStrength` | Link method/outcomes and source-supported Claims with caveats; keep imported assessments separately attributed. |
| Question `slug`, `title`, `dek`, `topic`, `philosophicalDisagreement`, `betterQuestion` | Reconcile original questions to the appropriate question/debate entities. The 34 current policy Claims are not established replacements for the 21 questions. |
| `whatEvidenceSuggests`, `commonMisreadings`, `whatWouldChangeOurMind` | Review as imported synthesis, preserve attribution, and link evidence. Do not publish this as Thomas's personal writing. |
| `continuum` (poles, position, uncertainty bounds, confidence, explanation) | Review provenance before publication. These are not statistical confidence intervals. Do not fabricate or derive new numeric positions from unrelated trial outcomes. |
| Question `keyInitiativeSlugs`, `sourceIds` | Resolve and publish question-to-initiative and question-to-source relations. Return supported/opposing claim relations where applicable. |
| `landingPriority` | Optional presentation ordering, not evidence strength. May be omitted if unused; report that decision explicitly. |

Deliver an updated field-level crosswalk plus a small verified query example for each collection, pagination and scoped property/relation IDs. Include publication receipts for actual changes and a separate review-needed list. This supplies a concrete next scope without requesting additional primary studies.

## Already published data needing frontend integration

### Original route reconciliation and source-link review

#### Bibliography reconciliation update

DOI-link rendering repair is complete for all **currently present** DOI values in Education datasets: 17 values across all entity types, zero invalid resolver URLs after the 15-Article and one-archive follow-up repairs. The [IMPACT note](impact-reconciliation.md) contains receipts, query scope, browser evidence and the new submission guard. This is a presentation/link repair; publication-version conflicts and missing bibliography fields remain separate work.

Subsequent correction: [DC IMPACT reference reconciliation](impact-reconciliation.md) publishes the verified w19529 Article, its two authors, and the missing program identity/source link. It replaces `src-026`'s faulty citation for this program while leaving unsupported original findings under review. Seven more fields are verified, bringing the current total to 68. Browser review found and repaired a bare-DOI link-rendering defect; the note contains current verification, IDs and receipts. Earlier text below describing w19529 as only a candidate is superseded for the citation/identity fields, not for numerical findings or assessments.

The latest complete destination Article inventory contains 48 Articles, recorded with their scoped URL/DOI values in `original-source-identity-audit.json`. Identifier and normalized-title comparison nominated 16 original source rows; title-only matches are not accepted automatically. Eight original rows (`src-003`, `src-033`, `src-060`, `src-068`, `src-071`, `src-080`, `src-088`, `src-093`) now have verified identity, canonical-title and canonical-URL mappings. These are seven unique Articles because `src-068` and `src-093` both refer to the same 2020 NBER tutoring paper. Do not count them as separate studies or create duplicate Article/source edges.

`original-source-reconciliation-decisions.json` records acceptance and seven explicit review cases. The field ledger now has **61 individually verified fields and 2,711 review-needed fields**, superseding the earlier incremental totals below. This does not certify the original findings, author fields, evidence assessments or the full bibliography. No new Geo entities were created during this bibliography audit; existing Article IDs are reused.

Additional source errors and version conflicts:

- `src-026` points to NBER `w19403`, **Exporting Liquidity: Branch Banking and Financial Integration**, as confirmed by the saved Crossref record and [NBER's Corporate Finance report](https://www.nber.org/reporter/program-report-corporate-finance-2017). It does not support the attached teacher-evaluation finding. The relevant [IMPACT paper](https://www.nber.org/system/files/working_papers/w19529/w19529.pdf) is Dee and Wyckoff, **w19529**, October 2013. Its RD design and threshold-specific teacher outcomes must be reviewed before substituting it for the faulty reference; the source's broader commentary about sustainability/trust is not established by this identifier correction.
- `src-034` points to [NBER w16832](https://www.nber.org/system/files/working_papers/w16832/w16832.pdf), **Reestablishing the Income-Democracy Nexus**, rather than an education paper. [Explaining Charter School Effectiveness](https://www.nber.org/papers/w17332), Angrist/Pathak/Walters, **w17332**, is a relevant replacement candidate. Its Massachusetts urban/nonurban charter scope cannot silently become a universal charter-school finding.
- `src-045` is the 2021 Boston preschool working-paper reference. Existing Article `503ab3175cbc4274997c5c64278a604f` combines a `w28756` NBER PDF URL with journal DOI `10.1093/qje/qjac036`. This may be an accessible-copy relationship, but publication identity and the extraction's version need adjudication before the original working-paper row is called reconciled. Do not replace either identifier without examining the published version and extraction.
- `src-070` identifies the 2021 journal paper DOI `10.1080/19345747.2020.1862374`. Existing Article `038f546c2508401eb3890f0fc6954b53` describes the **2019 AIR report** and points to ERIC **ED602451**. [IES lists the follow-up publications](https://ies.ed.gov/use-work/awards/air-early-college-follow-efficacy-study). Matching titles do not establish that these are the same publication version.
- `src-066` is the 2021 NBER working paper, while existing Article `de88c706c7644e9a8681c221d5c2536e` uses a 2022 author-hosted final journal manuscript. Keep version review explicit. The `src-061` working-paper/`src-096` journal DOI conflict described below remains open.

These findings explain why importing all original source prose without reconciliation would introduce false citations. The originals are preserved unchanged; accepted canonical mappings and rejected/candidate replacements live in the reconciliation files. Exact-title and DOI matches remain different evidence classes.

Category links are now published for Reading First and Enhanced Reading Opportunities → existing U.S. literacy education `5a86d2f3657b4b5baabef07a3393e408`, and Head Start and Boston pre-K → existing Early childhood education `0df9fad9098d4b11bacb9af0f7a79182`. Original labels remain `Literacy` and `Early childhood` in the source ledger. Reuse is based on the original educational scope, not generic word similarity. Both targets received Category type `52e68966a4f743d3a7ae6cca8f838514` in Education datasets; their other-space facts and Topic types were preserved. Category relation property is `06c899fb04334e679feb1fd56687c3d6`.

Proposal `1e9f7e097b344bb19cec190b8b7b1697` executed and is bounty-linked; all eight payload/governance/bounty checks pass. `data/education/original-category-members-query.graphql` is a tested cursor-paginated, destination-scoped category-members query. Supply `$space = dac259bad48a11adf97fe36857d85206` and either target above as `$category`. The independent query verifies all four expected program relations, records actual returned nodes in `original-category-query-verification.json`, and updates four category fields in the ledger. This is now 37 verified fields with 2,735 review-needed fields, not 2,735 proven missing values. Browser category rendering and the remaining category vocabulary are still unverified; do not claim the whole classification migration is complete.

`original-category-discovery.json` preserves complete cross-space name/component searches for nine original category labels, including both reused candidates. The broad Choice search was interrupted before completion and is not included as completed evidence. Composite categories such as Standards/accountability and Curriculum/pedagogy still need reviewed targets; do not substitute an individual program or narrower discipline merely to obtain a match.

Implementation finding: SDK 0.20.3 `Ops.relations.create` accepts `fromEntity` and `toEntity`; using serialized-operation names `from`/`to` caused the new builder to fail locally before any publication. Corrected against the installed declaration, then TypeScript checking passed. Stable relation and relation-entity IDs are persisted before submission in `original-reused-categories-registry.json`. No malformed batch was published.

Proposal `0d13fb00523c48c6a253b5e1b79c152f` executed and adds five original route slugs to existing Boston universal pre-K, Career Academies, San Francisco ethnic studies, National Guard Youth ChalleNGe, and Enhanced Reading Opportunities entities. Seven checks passed in `data/education/original-route-reconciliation-index-verification.json`, covering all five values, execution and the education bounty link. This changes route metadata, not research findings or dataset contents. TypeScript checking passed. No new visual design was introduced or certified.

The field ledger now records 33 verified identity/name/slug mappings for 11 initiatives, including the five earlier route additions and Reading First's existing route. The other 2,739 fields remain review-needed; that count is a reconciliation workload, not a count of absent graph values. `original-link-state.json` contains the paginated, destination-scoped values and relations. `source-to-geo-crosswalk.json` now includes the newly verified program identities.

All-space discovery completed exact-name searches for 76 initiatives (13 matching rows), exact Web URL property searches for 106 sources (6 matching rows), and exact source-title searches for 106 sources (11 matching rows), with no errors in these completed runs. These are candidates, not creation clearance. See `original-link-discovery.json` and `original-source-title-discovery.json`. Two initiative name matches remain scope-sensitive: the TFA entity describes secondary-math evaluation and the charter entity describes CREDO's national study. Unmatched sources need aliases, version and official-link reconciliation before creation.

The initial unscoped substring search of all text values timed out on some queries; its interrupted results are preserved in `original-link-substring-discovery.json`. Restricting to exact Web URL property values completed all 106 searches. This fixes the query performance issue, but exact URL matching misses landing-page/PDF variants and therefore cannot establish absence.

Source-link corrections found during review:

- `src-096` has the title/authors of Dee and Penner's 2017 ethnic-studies paper but the imported DOI `10.1257/app.20180293` is not its verified publisher DOI. The [publisher record](https://journals.sagepub.com/doi/abs/10.3102/0002831216677002) identifies `10.3102/0002831216677002`. Existing Geo Article `7cf51d06726242b88157ca3ea1f5b228` already stores the correct DOI under property `7cb59354e30c48119e99ff62fcf61646`. Preserve that fact; do not import the conflicting DOI. `src-061` is the 2016 working-paper reference and must retain its version provenance, even though its title matches. The pinned originals remain unchanged.
- Opening NBER's NCLB landing page returned HTTP 403 through the web tool. Search successfully recovered the [official page](https://www.nber.org/papers/w15531) and [official PDF](https://www.nber.org/system/files/working_papers/w15531/w15531.pdf), confirming Dee/Jacob, working paper 15531, November 2009, DOI `10.3386/w15531`. This is an access failure, not evidence of a nonexistent source.
- Search also recovered the [official Boston preschool record](https://www.nber.org/papers/w28756) and [PDF](https://www.nber.org/system/files/working_papers/w28756/w28756.pdf), identifying Gray-Lobe, Pathak and Walters, working paper 28756, May 2021. Use these identifiers when reconciling the placeholder title in `src-045`.

Next work remains substantive field reconciliation and publication: match source variants and reviewed program identities, then resolve taxonomy, original questions and their relationships. Imported assessments remain unavailable to the rating matrix until their provenance and vocabulary are verified. The five-route batch does not complete the user's missing-data request.

Original route slice: proposal `5feae38f255247dd9f7d333b773b2544` adds the source slugs for No Child Left Behind, Head Start, Chicago double-dose algebra, EWIMS and Comprehensive teacher induction to their existing Geo IDs. Property `b0305ef28312c519d954bc0efe22f013` was confirmed as Text / Route slug. TFA's broad umbrella and the Community Eligibility Provision/universal-meals mapping remain under identity review. The first post-vote index read lagged the confirmed transactions; do not resubmit. Use `original-initiative-routes-index-verification.json` for the subsequent indexed result. This slice restores route identity only; categories, assessments, source and question relationships remain unfinished.

The publisher's `docs/education-dashboard-data-contract.md` and family registries describe more than STAR, including Perry, Reading First, CUNY/Ohio ASAP and Abecedarian. Companion's numeric dashboard currently remains STAR-specific. This is an integration backlog, not evidence that those families need republishing. Preserve each family's units, denominators, populations and timepoints when adding comparisons.

## Outreach: not a restoration from education JSON

The approved destination is Public good, `f24e3bbd26304474b7e0c2a0877f4bfe`. A complete live destination query returned 14 space/navigation entities and no service directory rows. The publisher's `docs/indianapolis-outreach-directory.md` still records queued research/modeling with no verified rows or publication. Its `data/indianapolis-outreach-directory/` contains destination discovery, not a completed directory.

Use that existing specification and its original named-provider seed list. There is no verified outreach dataset in the education JSON to “add back.” Research and publish a verified initial service cohort in the approved space, then expand the full requested directory. One entity/row per service/program/location, with distinct organization, schedule and public-location relations.

Minimum frontend contract: service and organization IDs; service types; public address and verified coordinates; fixed/mobile/rotating/undisclosed location mode; service area; timezone, weekday/time/recurrence and exceptions; eligibility, referral/appointment/capacity rules; public professional contact; official source, verification dates and confidence. Unknown stays unknown. Flag schedules not confirmed within six months. Never publish intentionally private encampment locations or turn organization headquarters into a service stop without verification.

Return exact type/property/relation IDs, dataset membership, receipts and a complete sample query. That unlocks the existing outreach map and subsequent weekly-help/food/coordination views. Keep its queue, records and journals under `data/indianapolis-outreach-directory/`; no education bounty links or personal editorial content.
