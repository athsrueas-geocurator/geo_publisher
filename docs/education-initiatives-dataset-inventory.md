# New-site dataset inventory

2026-09-11; corrected 2026-09-12. The active publication/test destination is [Education datasets `dac259bad48a11adf97fe36857d85206`](https://www.geobrowser.io/space/dac259bad48a11adf97fe36857d85206). `ec349623f33236aee13c12dcd629ee81` is the separate bounty-owning Education space, not the dataset destination. Every Education datasets proposal must be linked from the signer’s personal space to bounty `debce2de46094f299ee8e89fe244a9dc` after the destination-space proposal is made. This inventory identifies source content to represent, not a list of entities approved for creation.

## Required site content

Counts refer to pinned [Education-Initiatives revision 3cd97449ce9ca73cccb77efe22aac69cc56131e5](https://github.com/athsrueas-geocurator/Education-Initiatives/tree/3cd97449ce9ca73cccb77efe22aac69cc56131e5). A single source record may reuse existing entities or require several graph facts. Therefore these are not new-entity counts.

| Source | Records | Site need | Migration treatment |
| --- | ---: | --- | --- |
| `content/initiatives.json` | 76 | Explorer, detail pages, dashboard | Match initiative identity across spaces; add missing target-space descriptions, findings and evidence links |
| `content/sources.json` | 106 | Citation library and finding provenance | Match publication/report/dataset identities across spaces using titles, URLs and identifiers; preserve curated findings/caveats separately from identity |
| `content/dichotomies.json` | 21 | Comparisons and uncertainty | Preserve curated framing, continuum values, limitations and initiative/source links |
| `content/methods.json` | 51 | Method and outcome/input definitions | Reuse semantically matching definitions and taxonomy; retain grouping, definition text and reference URLs |
| `content/glossary.json` | 59 | Glossary | Reuse appropriate concept identities; add this collection's definitions with provenance |
| `content/landing-cards.json` | 8 | Editorial entry points | Preserve claim, caveat, assessment and citations; assign persistent source keys |
| `research-data/dataset-catalog.json` | 18 | Existing dashboard's data-collection count; future catalog | Recommend including metadata to preserve this dependency; match existing dataset/resource identities first |

Core explorer scope is 321 records. Including the catalog is 339 source records before reuse, supporting ontology or assessment entities. The earlier migration plan proposed deferring the catalog; this inventory recommends including its metadata if preserving the existing dashboard is intended. Raw observations are not required by the inspected `EvidenceDashboard.tsx`: it imports initiatives, sources and the catalog, and uses the catalog's length.

## Research catalog resources

These are the 18 catalog entries, not 18 interchangeable raw statistical datasets. Preserve each entry's steward, URLs, access method, units, geography, coverage/version, join keys, measures, caveats and source-reported collection status. A repository status such as `downloaded-access-documentation` is not verified possession of microdata.

| Resource | What to represent initially |
| --- | --- |
| Common Core of Data (CCD) | Public school/LEA directory dataset metadata |
| Stanford Education Data Archive (SEDA) | Dataset and release metadata; source key `seda-v5` currently labels Version 6.0—preserve identity and flag version inconsistency |
| EDFacts / Ed Data Express | Outcome/attendance data resource metadata |
| Civil Rights Data Collection (CRDC) | Civil-rights collection metadata |
| School System Finances (F-33) | Finance collection metadata |
| NAEP Data Explorer | Assessment resource metadata |
| IPEDS | Postsecondary collection metadata |
| College Scorecard | Postsecondary outcomes resource metadata |
| Urban Institute Education Data Portal | Delivery/aggregation service metadata; avoid duplicating CCD identity |
| ERIC | Literature index metadata |
| NTPS / Teacher Follow-up Survey | Survey-family/access metadata |
| ECLS-K:2011 | Longitudinal-study/access metadata |
| HSLS:09 | Longitudinal-study/access metadata |
| School Survey on Crime and Safety | Survey/access metadata |
| Evidence for ESSA | Evidence-review resource metadata |
| National Student Clearinghouse Enrollment Insights | Aggregate-report resource metadata |
| State Longitudinal Data Systems | Program/access inventory metadata, not a single national dataset |
| What Works Clearinghouse | Evidence-review resource metadata |

`research-data/dataset-profiles.json` and `research-data/initiative-dataset-links.json` also exist in the source tree. Their semantics, record counts and consumers still need inspection before including them. Bulk research files need a separate concrete feature requirement, version/access review and storage plan; do not upload them by default.

## Existing graph evidence and limitations

Follow-up: [API diagnosis](geo-api-diagnosis.md) identified `isNot: null` as the cause of the false empty named-entity list; use `isNull: false`. Smaller connection queries now returned a count of 86, and exact-name cross-space lookup succeeded. Original large inventory and broad OR search still failed after approximately 30 seconds. The observations below describe the initial attempt, not the final diagnosis.

Unauthenticated reads from `https://api-testnet.geobrowser.io/graphql` confirmed the destination is a DAO. A 25-row unfiltered entity page included universities, degree entries, schema items, proposals and unnamed records. Examples: University of Southern California (`202ba53abb8f44069e6316bd6f07f048`), Westminster College (`540099d58a0946c1b2bf2f8751398e14`), Degree (`2ca7d5e15c36...` was truncated in the captured output and is deliberately not a usable ID), and Studied at (`3c8a7056fba7463cbdee319c835f2563`). Their presence does not establish suitability for this migration.

The initial `entitiesConnection` inventory returned an internal server error. A subsequent filtered target query returned an empty list despite the unfiltered page containing names; a cross-space name search also returned an internal server error. These results cannot establish absence. Exact counts of reuse/new/update decisions remain pending reliable discovery. No signing key was needed, and no publication occurred.

## Cross-space reuse contract

Entity identity extends across spaces. The destination controls where this site's facts are published, not where candidates may be discovered.

1. Search destination, canonical/relevant spaces and graph-wide identifier/name/alias candidates. Record pagination and search completeness. Inspect candidates' types, distinguishing identifiers and source-space facts.
2. Reuse a confirmed Geo ID even when it is absent from the destination. Inspect how the current schema/API represents target-space values, relations and membership before building operations; do not copy other spaces' entire perspectives.
3. Classify each input as reuse with no changes, reuse with target-space additions/updates, ambiguous/review, unresolved discovery, or proposed new entity. Similar names/URLs alone are insufficient identity evidence.
4. Search both the citation library and catalog together so repeated references to the same resource can share identity while retaining distinct curated assessments and provenance.
5. Only propose a new ID after documented identity checks complete. A failing API or empty destination result never suffices. Preserve decisions in the source-to-Geo crosswalk for repeatable reruns.

Repository audit: the Course/Lesson resolver has cross-space type/space fallback indexes. Its separate `loadExistingRecords(spaceId)` fuzzy screen is destination-only and limited to 1,000 rows. It must not be presented as graph-wide duplicate prevention. `agents.md` now supplies these cross-space requirements when either vendored skill is used; upstream skill files remain maintained by their submodule.

Next artifact: a per-record decision table with source key, candidate Geo IDs, source spaces, evidence, target-space changes and decision. Until that exists, 321/339 records describe required content coverage, not entities to create.

## Publication and dashboard status — 2026-09-12

The inventory predates the active publication sequence. Education datasets now contains multiple source-filtered, factual study families with attached Articles, Initiatives, source links, structured values, and linked debate Claims. The current comparison verifier reads the destination space with pagination, excludes nonfactual parents via the live **Is factual** Checkbox, and uses Article filters where one Initiative has several evidence families. It verifies source-specific families including Saga, STAR, Perry, Reading First, CUNY ASAP, WorkAdvance, Early College, Year Up, Youth ChalleNGe, Boston pre-K, Tennessee pre-K, ERO, DCMP, PACE, MSSI, Texas Summer Bridge, Viking ROADS, NYC Small Schools of Choice, Project QUEST, and San Francisco ethnic studies.

This is substantial dashboard evidence coverage, but it does not complete the 321/339-record migration. Missing source records, unresolved canonical identities, structured implementation/population mappings, and noncomparable cost/outcome concepts remain explicit work; dashboard rows must continue to preserve source, Article, unit, price-year, denominator, perspective, horizon, and model/observed status rather than ranking unlike records.

### Catalog identity discovery: Common Core of Data — 2026-09-12

An all-space, paginated exact-title read found no Geo entity named **Common Core of Data (CCD) Public School and LEA Universe**. Complementary exact substring reads for “Common Core of Data” and “Public School Universe” also returned no candidates. A broad `CCD` substring is unsuitable for identity resolution because it returns proposal UUID noise and unrelated biological entities over multiple pages. This is evidence for a potential new Dataset identity, not authorization to create it: before publication, define the catalog-specific Dataset schema, source/provenance relation, version/access metadata, and only source-supported contextual links to published Initiatives.

Publication completed after that schema check: Dataset `6bf3954ea2814e1db6f84bedbdba599c` now carries the official NCES URL and concise noncausal-use boundary. Proposal `4f740c3dcfaf4b46bc1a884cc2344979`, proposal transaction `0xa438e0ad9f4177952327a0797ecf0c3ef5308503d1833534d26d1a69bf515388`, bounty transaction `0xb426daec9c783cefa9608bd89be70c8f3f93f39c3bf9c5c97b4f4f60ce5f3d8f`, and Fast Path vote `0x9551a693ef8987f96ac291eed5bf9bd921b996389c9b85ba44fd03b8cc6601c2` are confirmed. Generic verification passed six checks. The resource is a catalog/context record only: no raw CCD data, outcome, causal claim, or unsupported initiative relation was published.

Dataset block `44c758588b7b48cbb60496a704f298b4` now preserves the steward, access method, unit, coverage/vintage boundary, identifiers, and appropriate contextual uses. Block proposal `98bce0283325409d875b9af9079e5ebe`, proposal transaction `0xdb9eac8e1fc9d3fce4fc3a56ec347516d33a94bc520a489282d8c4c23ae86e79`, bounty transaction `0x3745737dccea66b4e2bc579b93ddd0a33b526daccd68c4c47161d0c4554fb250`, and Fast Path vote `0x45f5fd50e85a45e7b5dc090284e4d8049159b44964b9b49075ec71fba625b576` are confirmed. Generic verification passed six checks. The first local build used the nonexistent GraphQL field `relationTypeId`; the corrected destination-scoped check is `typeId`, documented in `docs/geo-api-diagnosis.md`.

### Catalog identity discovery: SEDA — 2026-09-12

All-space exact-title and the specific “Stanford Education Data Archive” substring search returned no candidate for the catalog’s SEDA v6 record. The acronym `SEDA` is too ambiguous for identity reuse: its first 50 global matches include Sedalia, pharmaceuticals, and unrelated financial instruments, with another page available. Do not create or reuse a Dataset from that broad result. A future SEDA batch must use the specific source URL, keep the catalog’s Version 6.0/version-key inconsistency visible, and preserve aggregation level and release documentation before dashboard use.

That bounded batch is now complete. Dataset `04a4c7047b0b414b8920890c5ca2f8a0` and metadata block `fc397c8fbbbf4d39b01b171ded7daeac` preserve the official download URL, steward, public access method, unit, supported aggregation levels, join keys, measure scope, release warning, and `seda-v5`/Version 6.0 inconsistency. Proposal `cd4493d00950495e84215aee3ef86f2b`, proposal transaction `0x877bc2a4159daf4b98deb92b76bc41b010b381d9fdc6c9573b1462957d56b21c`, bounty transaction `0x1d7a0ebd9f4d19f3bcac31648d7d076c5c98c2ffd0c999da271df6914d82cfcc`, and Fast Path vote `0x8b7a06f89275a8f89fb71e73a1e6cf2819ab69996f19feabb65a86042ba8d8f6` are confirmed. Ten indexed checks pass. This remains a noncausal catalog record: no raw SEDA data, derived result, program claim, or unsupported Initiative relation was published.

### Catalog identity discovery: EDFacts / Ed Data Express — 2026-09-12

Exact-title and three specific graph-wide alias reads—`EDFacts`, `Ed Data Express`, and `Education Data Express`—returned no candidates and completed in one page each. The source catalog identifies public custom CSV/ZIP access with file-specific data notes, annual school/district/state and subgroup scope, and joins on state, LEA/school IDs, school year, and subgroup. It is ready for the same Dataset-plus-metadata-block workflow after its public source URLs and suppression/denominator boundary are included. Do not use its current absence to infer a program effect or publish an unsourced extract.

Publication is complete. Dataset `26aa14b7c05c4b0d86260e3f405b1653` and metadata block `f47c61f312fe448f8c15db44569d4411` carry the official data-builder URL, access method, scope, joins, measures, and suppression/denominator boundary. Proposal `811818ba722c4e1ea39dc5f8693fca0c`, proposal transaction `0x4573904d8fac7e3363528f49bf56f0d16db6aa2b8527edb6e4380e2bf8cabf3b`, bounty transaction `0x47f633a8a9804aae1adfa2528e6567991f0b0376f6cfb99f9319de1b2bef2faa`, and Fast Path vote `0xc87112224ababbcb20849a85e4f9b6244baa841a63a45029ed5e70278b386a21` are confirmed. Ten indexed checks pass. It is catalog context only, with no raw extract, derived result, or causal Initiative relation.

### Catalog identity discovery: Civil Rights Data Collection — 2026-09-12

All-space exact-title plus specific `Civil Rights Data Collection` and `CRDC` reads returned no candidate in one page each. Dataset `bf490a4a56e44533b3fb140b0adc509e` and metadata block `6f090dc7fef54b9c8bf7253887ff6e22` now preserve its official OCR URL, public file access, collection-year/subgroup scope, joins, equity/climate measures, definition changes, and suppression boundary. Proposal `7813da859df442b78814dc38ee5de44b`, proposal transaction `0xb4e2cfc4b3323504198214936f2e8a96fbfeec32a40b42392d7869e3b70108ec`, bounty transaction `0x7cb57aa8fd0a442d7341f6a554faf63d69732a0e0e274da6fc7811f1e0a0f012`, and Fast Path vote `0xb85b41672f8b02f5124dde6083348a0e71eec88a1851f35401d0609f13c38c12` are confirmed. Ten indexed checks pass. It supplies catalog context only; no raw CRDC extract, derived outcome, or causal relation was published.

### Catalog identity discovery: F-33 school finance — 2026-09-12

All-space exact-title, full-name, and specific F-33 alias checks returned no candidate. Dataset `c6368f3b003d4bd5a82d24664b7432f7` with metadata block `23900d3d136b45ab929ef837a114a320` records the source URL, fiscal-year unit, API/access boundary, coverage, joins, finance measures, and required deflation/fiscal-alignment caveat. Proposal `5cdf08d4c475431784177ae42a0badce`, proposal transaction `0x55c7d24886c0da17d63712133ae3bc15e83e597cfe59be6031f0a0531e098855`, bounty transaction `0x10bef4182eb1d69b747851fbaadb104374d952eac56fd6f8d291a8f9d7d825be`, and Fast Path vote `0xb74ff1ad373d96624f337499e4943fcd0ce04ac92856aba7869565f0adba50e1` are confirmed. Two initial post-vote reads returned no entity, but the existing journal was later indexed and passes all ten verification checks; no duplicate was submitted. No raw F-33 extract, derived result, or causal relation is published.

### Catalog identity discovery: NAEP Data Explorer — 2026-09-12

Exact-title and full-name discovery returned no Dataset candidate. An acronym query returned one unrelated Oregon-specific Claim in another space; its scope and type do not establish a reusable NAEP Data Explorer identity. Dataset `86d8fd6722804e02b5ccf74de96ac3bb` and metadata block `83d913e1a1fd4f34aeeeed97c183d852` now preserve NCES access, representative unit, geography, assessment/join scope, restricted-use boundary, and the rule against school-level or causal attribution. Proposal `c7daafdf3e9d4a938cd42787a199cbc4`, proposal transaction `0x1ecf3b67c7cf16bf515a7cfb88a09ce33690acf2b7d1ad4a3cc101eb17a6096d`, bounty transaction `0x062917a5dc6c586445e7e6b70daa4fa8816009c221f66596327327f1c738d09a`, and Fast Path vote `0x04756f2bf6ae0a91dd7511319a839dfe6eec59912b29055e7a40d8525f9ef025` are confirmed. Ten indexed checks pass. It is catalog context only.

### Catalog identity discovery: IPEDS — 2026-09-12

Exact-title and full-name graph-wide checks returned no Dataset candidate. Dataset `66240fe8f30c45df935e46129b3fe2ca` and metadata block `c543c2a58e934589ae804e844ae87760` now preserve the official NCES URL, access method, institution/cohort unit, annual component boundary, geography, UNITID joins, measures, and the distinction between institution reporting and individual student follow-up. Proposal `894a134d146749a19016afda26abb2f7`, proposal transaction `0x2073604217191ae83f416d02fc1a342a50b34e150f8b6c9c28ec4c260253da87`, bounty transaction `0x126d9ec8d5f47e7548bbaf136b56e80300c631ffc8a3c05924a75fdcf80acd59`, and Fast Path vote `0x5336afc170faef7160e4dff5d36a35e896661d500ef0c3f5852fe226c67f31d1` are confirmed. Ten indexed checks pass. It is catalog context only, with no raw release or causal Initiative relation.

### Catalog identity discovery: College Scorecard — 2026-09-12

Exact-title and the `CollegeScorecard` alias returned no candidate. Dataset `fa615e21492c40b68c6f3483f1466bcb` and metadata block `31ec1a5cb1ae4d0f8256b33c681667c1` preserve official access, institution/cohort unit, joins, completion/earnings/debt/repayment/aid measures, and cohort-definition boundary. Proposal `765ebae8dd90459d89c44cc81f234fc0`, proposal transaction `0x0c0ddfd9c2d4b21208e85a83fbb818d3daafdd33647814aafe4a8d0f10432c38`, bounty transaction `0xa0a1f59acd5d4e2a1066e545e87990c161fbe87f72b757c9d05173d4d3aef884`, and Fast Path vote `0x4c4bdb86b54bad254468306da2a1e2b2b9a9cafa52acf2be2b680ee654dce5c4` are confirmed. Ten indexed checks pass. It is catalog context only, not an individual program-effect record.

### Catalog identity discovery: Urban Institute Education Data Portal — 2026-09-12

Exact-title and the specific `Education Data Portal` graph-wide reads returned no candidate. Dataset `aa8c1c45e8cb4a48a3375a1fc4776c2c` and metadata block `5a7f371a4c234c2f9834d93da8a01f6b` record the public API, source-dependent scope, joins, intended extraction and field-validation uses, and the boundary that the originating agency remains the authority for a published claim. Proposal `a69b6c73e8a640d1871be10a84ad5800`, proposal transaction `0x4802f8b4b157168fb7c0cf0fbca1406ae44d731b78e1f082f49f2a7b49891ec1`, bounty transaction `0x95d934e45602ff70729e590b869505373d1724dad9a36009b94a7578d16ca6fb`, and Fast Path vote `0x9c0e348c0a8fddbbe8af4421c333ad7c47f56a450ecbcc7d13a2250738b795e9` are confirmed. Ten indexed checks pass. It is delivery metadata only; no portal extract, derived result, causal claim, or Initiative relation was published.

### Catalog identity discovery: ERIC — 2026-09-12

Exact-title and the specific `ERIC database` graph-wide reads returned no candidate. Dataset `1745ad006731498f8c87ab5836a1a061` and metadata block `6ca572f39b124ec0a0cda880328f7263` record IES stewardship, bounded public search/API access, bibliographic unit, identifiers, contents, retrieval discipline, and the rule that a factual claim must cite its underlying study. Proposal `804eb9be9d1d412eaca0ef5b1268c035`, proposal transaction `0x94052fd03e11bda226673fc84eb5e52b617e0b19660fae033b57736323b67886`, bounty transaction `0x8e9db8fe3b8b210ac3e175dc7d969f0cdea86349814ccc8b35a6ff54fba17c9a`, and Fast Path vote `0x4af6bc40dd0ffe8f0a1cb9972037ebf56b32ddec60888dd67d9d43e06053ab10` are confirmed. Ten indexed checks pass. It is an evidence-discovery record, not an intervention-outcome dataset.

### Catalog identity discovery: NTPS and TFS — 2026-09-12

Exact-title plus specific `National Teacher and Principal Survey` and `Teacher Follow-up Survey` graph-wide reads returned no candidate. Dataset `7fa1385bd4f749e79b77fbf852555492` and metadata block `6c1f78e3f0d7486397b7d37f047129b5` record NCES stewardship, public-use and restricted-use boundaries, sampled unit, cycle and predecessor-series coverage, permitted joins, measures, weighting requirement, and noncausal survey-context use. Proposal `5ab38771181048ff8e75fd34c54b16f1`, proposal transaction `0xe5f5ba4ca3e8b6e12a81d770d5b429968e79bcb95adc1058c2535678eca5a9f9`, bounty transaction `0x6622714e63d45dd8a9447a530530c02c24b5612a87a8692029711fffb0cfcdaa`, and Fast Path vote `0xd658db87547e18101f70148f194db5ea7df5bc8501863053f229d33dceea5d04` are confirmed. Ten indexed checks pass. The official NCES pages timed out in the automated reader; this is logged in `docs/ntps-tfs-catalog-notes.md` and does not alter the documented source URLs or access limits.

### Catalog identity discovery: ECLS-K:2011 — 2026-09-12

Fresh complete graph-wide searches of the full title, “Early Childhood Longitudinal Study,” “ECLS-K:2011,” “Kindergarten Class of 2010-11,” and the official `nces.ed.gov/ecls` identifier returned no candidate. Dataset `96de62907fc94c62b0e9a6076ccea75c` and metadata block `bb3cefc2ff2041edb3527864b04ae1f7` now preserve NCES stewardship, public/restricted access, the child-and-respondent longitudinal unit, 2010–2016 cohort coverage, national scope, joins, measures, and weighted observational-use boundary. Proposal `7357486f897443ad88373aa2a673a933`, proposal transaction `0x0e5bca3ac9de9c9777e2a0a1674d1b106110bc6207ecd573dae586ba95dc802e`, bounty transaction `0x55597b705e740abd7825594f3147c0bf8375dfc92e011bcfe3ee8537a215f8ec`, and Fast Path vote `0x3fc34e02add11672218049ad36b0f4087b23b0d63c8786684a1c453d5eafba10` are confirmed. Ten indexed checks pass. It is catalog context only: no ECLS-K microdata, derived outcome, causal Claim, or Initiative-effect relation was published.
