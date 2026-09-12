# Education comparison dashboard: data acceptance contract

The user requires the published Geo data to satisfy both the Education programs dashboard bounty and the planned comparison dashboard. Publishing the imported records is necessary but is not sufficient. This contract supplements the handoff and bounty requirements; it does not replace their full scope.

## Required comparison structure

| Record | Required meaning and connections | Current evidence |
| --- | --- | --- |
| Program or initiative | Stable identity; distinguish an intervention model from a named provider and from a particular implementation | Imported narratives; full identity mapping pending |
| Implementation | Program, operator, location, population, dates, delivery model and dosage; explicit unknowns | Saga has narrative context; structured links pending |
| Study | Publication/version, design, study/cohort identity, treatment and comparison conditions, implementation links | Saga publication and trial-number fields applied; richer links pending |
| Outcome estimate | Study/cohort, metric/instrument, value, unit, normalization, follow-up, estimand, sample size, uncertainty, source locator | Four Saga estimates applied and rendered |
| Cost observation | Matching implementation/cohort, amount or range, currency, price year, period, denominator, perspective, included resources, incremental/total basis, source locator | Saga approximate cost applied; price year and accounting review pending |
| Economic comparison | Explicitly linked compatible cost and outcome records, formula, assumptions, horizon/discount rate where relevant, uncertainty and limitations | Not yet published; no efficiency ranking is currently justified |
| Provenance | Existing source IDs reused across spaces; source version and locator; distinguish extracted findings from imported editorial assessments | Saga citations and migration crosswalks exist; full coverage pending |

## Dashboard behaviors the data must support

1. Search and filter programs by intervention model, geography, population and period using Geo IDs and structured facts, not only substring searches over descriptions.
2. Select programs or implementations for a comparison table. Show effect, outcome unit, follow-up, population, design, uncertainty and citation together.
3. Compare costs only with visible currency, price year, denominator, period and accounting scope. Show missing values as unknown, never zero.
4. Show a cost-versus-outcome plot only for records with compatible measures and explicit cost/outcome links. Incompatible observations remain accessible in the table with a reason for exclusion.
5. Keep ITT and TOT from the same trial associated; do not count them as separate independent studies. Keep reviews separate from their included trials and working papers linked to journal versions.
6. Expose evidence detail on demand: original source, study/cohort, table/page, caveats and relevant editorial comparisons.
7. Fetch space-scoped facts from Geo. Source JSON is migration input, not a fallback presented as live Geo data. Changes in indexed Geo facts must be visible after refresh without a frontend rebuild.

## Completion evidence

- Reconcile all 339 intended source records and relationships, plus the additional selected studies. Record corrections, composite mappings and unresolved records explicitly; do not count unresolved rows as published.
- Exercise the required filters and comparisons against actual published records through saved API queries. The first multi-study comparison must involve more than one intervention model.
- Demonstrate populated and missing-data cases in the comparison dashboard, including an intentionally incompatible pair that is not ranked.
- Verify rendered fields, source links and numeric values against the source extraction, as well as transaction execution and API indexing.
- Verify proposal-to-bounty links in Geo and their presentation in the Curator bounty interface.

The currently published Saga slice and partial glossary do not satisfy these completion conditions. Next substantive research priorities remain STAR/class-size, Perry, and Reading First, with matched cost/outcome contexts rather than an unsupported universal efficiency score.

## STAR structured-filter evidence — 2026-09-11

The experimental dataset `9220554acfd249a18920b301dcbb6cf0` now supplies eight measured estimates linked to one Study, four US grade concepts, two intervention arms and a common comparison arm. Reusable relation IDs are Grade levels `98c0849922164db0822b5a78444c17b3`, Intervention arms `a0109f6192b1414fa93fb756779643ed`, and Comparison arms `061dbc4816b0413b83ebe771ef3d9875`. Study identity is `d68c6d1d10af47418fc80ed09d4e097f`, linked using Related entities; this distinguishes one experiment from its multiple estimates and publications.

`data/education/star-comparison-query.graphql` retrieves destination-scoped Claim values and relations with cursor pagination. `star-comparison-query-verification.json` includes complete variables and responses for eight passing live cases: all eight rows, two rows for each grade, four rows for each intervention, and the one grade-1 small-class row. Verification checks expected IDs, effect, SE, N, unit, common comparator and pagination completeness. This proves STAR grade/arm filtering, not cross-program comparisons or the full implementation/population/instrument model. Keep percentile-point effects separate from Saga SD effects; the STAR economic model is not an observed cost series matched to these estimates.

## Perry economic scenario filters — 2026-09-11

`data/education/perry-comparison-query.graphql` reads destination-scoped Claim values and relations with cursor pagination. `scripts/education-verify-perry-filters.ts` checks ten live cases: all 51 economic estimates; each of all/male/female populations (17 each); participant perspective (9) and societal perspective (42); nine IRRs at 50% tax deadweight loss; six ratios at a 3% discount rate; one female societal low-valuation ratio at 7%; and the intentionally empty individual benefit-cost-ratio case. Every case passes, including complete pagination and numerical, unit, citation, population, perspective and scenario-field reconciliation. Evidence: `data/education/perry-comparison-query-verification.json`.

The query distinguishes economic estimates from the cost observation through numeric-property presence and links all rows to one Study. Numeric equality uses the live `BigFloatFilter.is` input; no title parsing is needed. It preserves absent crime valuations and absent IRR discount-rate inputs. The zero-result case means not reported, not a numerical zero. This proves Perry economic filters, not the unfinished observed-outcome filters or cross-program cost-effectiveness comparisons.

## Perry observed-outcome filters — 2026-09-11

`scripts/education-verify-perry-observed-filters.ts` reuses the paginated, destination-scoped `perry-comparison-query.graphql` and passes 14 live cases. It retrieves all 32 means; female/male populations and control/treatment arms (16 each); proportions (24) and monetary means (8); all five source follow-up labels; one combined female-treatment graduation result at age 27; and no result for unreported graduation at age 40. The all-row case explicitly excludes the economic estimates and cost by requiring an observed-value property.

Every returned mean is reconciled with its source value, SE, measure, unit, follow-up, citation, population and reported arm. Monetary rows also verify USD/2006. Checks reject an inferred outcome N or a causal Effect estimate property. Evidence: `data/education/perry-observed-query-verification.json`. Outcome/follow-up filters use structured text properties; they do not establish the still-pending cross-study measurement-concept ontology or causal comparability.

## Reading First filters — 2026-09-11

Mean-query verification now passes 11 live cases using the same bounded query: all 33 pairs; 21 numeric and 12 proportion pairs; grades 1/2/3 (12/11/2); eight survey rows without a grade-specific assignment; 12 instructional-time rows; first-grade comprehension; and empty third-grade decoding and standardized-mean cases. All 66 values reconcile with exact decimal arithmetic, including percentage-to-fraction conversion. Checks preserve separate mean and impact units, existing impact values, source locators, study/arm links and missing sample sizes. Evidence: `data/education/reading-first-means-query-verification.json`; implementation: `scripts/education-verify-reading-first-means.ts`. This proves mean reads, not compatible cross-program cost-effectiveness comparisons.

`reading-first-comparison-query.graphql` scopes all facts to Education datasets and uses bounded cursor pages. Its verifier passes 12 live cases across all 33 selected contrasts / 63 representations, including grade and unit filters, reported versus missing uncertainty, exact p-value strings with operators, paired representations and an intentionally unreported grade-three decoding result. Reciprocal Related entities links identify each alternate estimate; the common Study/source links remain distinct. All 63 results render in eight separate domain/representation tables. Actual versus estimated-counterfactual means, complete program/implementation/measurement links and cost matching are not yet published. See `docs/reading-first-study-notes.md`.

## Geography query evidence

`data/education/study-location-query.graphql` filters location relations by destination space and canonical location ID. For Chicago, use `e82f3bfc991a4578aa8b7a503640b95e`, reused from geography space `84a679ce188f061ac9a92380bac2bab5`. Its existing State relation points to Illinois `e22d027da3254158ba7cdd4b8e24c44c` and Country to United States `0093d90725d94cb08903515673538d40`. Geographic hierarchy facts retain their original source-space provenance.

The filter returns study-related dataset, estimate and cost records; consumers must distinguish them by type/properties, not treat each row as a separate program. Follow `pageInfo` for larger result sets. This proves only a location lookup, not implementation/population filters or cost-effectiveness eligibility.

Verified 2026-09-11: the saved query returned exactly the six expected Saga records, all linked to the reused Chicago ID, with `hasNextPage: false`. Response: `data/education/study-location-query-result.json`. The geography batch verifier passed all eight checks, including executed proposal and indexed bounty link (`saga-geography-index-verification.json`). This supersedes the earlier indexing-pending observation.

## Multi-intervention comparison retrieval — 2026-09-12

`data/education/dashboard-comparison-query.graphql` and `scripts/education-verify-dashboard-comparison.ts` now prove destination-scoped, paginated Claim retrieval by initiative for Head Start, Chicago double-dose algebra, EWIMS, and Career Academies. The live verifier passes all four cases and saves the source response summary in `dashboard-comparison-query-verification.json`.

The query deliberately returns units rather than normalizing across records. EWIMS returns percentage-point changes in first-year risk indicators; Career Academies returns 2006-dollar annual earnings changes over eight years; Head Start and double-dose algebra include qualitative/source-scoped findings without an invented scalar. A comparison table may group and filter these records, but it must not calculate one ranking, plot mixed measures as comparable effects, or treat missing values as zero. This verifies API retrieval for multiple intervention models; it does not prove frontend rendering, population/implementation filtering, or a compatible cost-effectiveness analysis.

## Youth ChalleNGe comparison-contract extension — 2026-09-12

The multi-intervention verifier now includes National Guard Youth ChalleNGe alongside Head Start, Chicago double-dose algebra, EWIMS and Career Academies. It retrieves the three factual three-year outcomes by the Initiative relation: diploma/GED (+16 percentage points), employment (+7 percentage points) and earnings (+$2,267). The earnings unit explicitly says that its price year is not established, so it cannot be price-normalized or placed in a cost-effectiveness calculation.

The query necessarily returns all Claims related to an Initiative. The verifier therefore uses the destination-scoped **Is factual** Checkbox before constructing evidence rows and asserts that the nonfactual expansion proposition is excluded. Frontend consumers must apply the same rule; nonfactual debate parents belong in the debate view, not the numerical-comparison table. `education-verify-dashboard-comparison.ts` passes five live cases after this extension.

## Youth ChalleNGe operating-cost retrieval — 2026-09-12

The comparison query now requests the typed `integer` field as well as Decimal/text/boolean values. The live verifier requires the Youth ChalleNGe operating-cost Claim to contain $11,633, price year 2010, USD, and its per-admitted-cadet denominator. It also keeps that row separate from the observed three-year earnings difference, whose price year is unknown. Five intervention-family cases pass.

## CUNY ASAP comparison-contract extension — 2026-09-12

The multi-intervention verifier now includes CUNY ASAP and requires its indexed eight-year net-cost Claim. The row is $13,838 in 2019 USD, defined as CUNY educational cost per program-group member minus the control-group cost. It is not a social benefit, individual expense, benefit-cost ratio, or a result for the Ohio ASAP replication. The dashboard must display this perspective, period, price year and denominator before any comparison.

## CUNY ASAP outcome and cost-per-degree retrieval — 2026-09-12

The same live contract now requires all three CUNY ASAP factual rows: the $13,838 net educational cost per program-group member, the eight-year associate-degree result of +12 percentage points (52% versus 39.9%), and the $9,162 difference in average cost per associate degree (84,087 versus 74,925, 2019 USD). The verifier checks the effect, cost, price year, currency and denominator against their stable IDs. It deliberately does not convert those rows into a benefit-cost ratio, a cross-program ranking, or a conclusion that ASAP is cost-effective.

## CUNY ASAP three-year source family — 2026-09-12

The comparison verifier now keeps the original CUNY ASAP trial’s 2015 and 2020 evidence families separate with required Article filters. The 2015 MDRC Article `84231ad5631249a99f56e89dc540e3d6` returns four factual records: design, +18.3 percentage points in cumulative three-year degree receipt (40.1% versus 21.8%), +8.67 cumulative credits (SE 1.95), and +7.8 percentage points in semester-six four-year-college enrollment (25.1% versus 17.3%). The 2020 Article remains restricted to the three eight-year cost/outcome rows. Both families reuse one original-CUNY Initiative; consumers must retain the Article and horizon filter rather than treating the seven rows as a single timepoint or independent studies.

## ASAP Ohio eight-year source family — 2026-09-12

The comparison verifier includes a separate Ohio replication family, filtered to MDRC Article `2dbe6ce279734000bf3d2ef69f71764c` and its own Initiative. Its factual rows record the reported eight-year randomized differences: +15 percentage points in degree completion (46% versus 31%), +6.2 percentage points in bachelor’s-degree completion (17.6% versus 11.4%), and $3,337 in earnings for the 1,482 participants with wage records. The earnings record is limited to Ohio unemployment-insurance-covered wages, has no reported price year, and must never be transformed into a benefit-cost figure or conflated with CUNY’s New York trial.

## WorkAdvance multi-site family — 2026-09-12

The dashboard verifier now returns one Article-filtered pooled family and four Article-filtered provider families from MDRC’s 2020 WorkAdvance evaluation. The pooled 2018 rows are +$2,716 in earnings and +6.4 percentage points earning $30,000 or more (N=2,564); each provider family separately returns its 2018 earnings and threshold outcomes plus participant, government-budget, and societal net-financial-gain observations. Do not substitute the pooled result for any provider, rank providers, or convert the net gains into benefit-cost ratios: the net-gain values are source-modelled 2018-dollar, per-participant present values with a 3.5% discount rate, and projection horizons vary by provider.

## DCMP five-year source family — 2026-09-12

The dashboard verifier includes a source-filtered DCMP family from the 2023 CAPR/MDRC report. It returns the 1,411-student design, $790 five-year net social cost per program-group member in 2022 dollars, primary component cost, long-term attainment and credits differences, and the report’s cost-per-outcome arithmetic. The latter rows must display that the underlying five-year outcome differences were not statistically significant; they are neither confirmed savings nor a benefit-cost ratio or cross-program ranking.

## PACE Center for Girls source family — 2026-09-12

The comparison contract includes the 2019 MDRC Article-filtered PACE family: randomized design, 2017-dollar net societal service cost, short-term school attendance and academic-progress effects, suspension, and the 18-month null charge result. The cost covers the report’s 12-month service analysis and uses a 7.9-month average PACE stay; the outcome rows have different follow-up windows and Florida-record scope. Consumers must preserve those distinctions and must not transform the package into a full benefit-cost conclusion or a prediction of graduation or later justice effects.

## MSSI source family — 2026-09-12

The dashboard contract includes an Article-filtered 2023 MDRC family for CCBC’s Male Student Success Initiative: randomized design, real-2021-dollar intended-participant cost, first-semester course enrollment and passing, a null credits result, and the cohorts-1-to-3 fourth-semester grade finding. The $885 amount is a six-term intent-to-treat service cost, not a net cost, cost per outcome, or benefit-cost ratio. The academic results must retain their different follow-up samples and the report’s major implementation and COVID-19 limits.

## Texas Developmental Summer Bridge source family — 2026-09-12

The dashboard contract includes an Article-filtered family for the 2011 MDRC/NCPR eight-college Texas Summer Bridge evaluation: randomized design, $1,319 average resource cost per admitted student in 2009 dollars, first-college-math attempt and pass, first-college-writing pass, and the non-significant fall-registration result. The resource value includes the report’s 30% overhead assumption and may include start-up costs. Consumers must retain the one-year preliminary horizon and must not convert the source-reported resource requirement into a net cost, cost-effectiveness result, benefit-cost ratio, persistence result, or cross-study ranking.

## Viking ROADS source family — 2026-09-12

The dashboard contract includes an Article-filtered 2025 MDRC family for Viking ROADS at SUNY Westchester: the 574-student randomized design, semester-three enrollment and credits, and semester-six credential and 60-credit outcomes. The trial is a single-college, COVID-era ASAP-style replication with a usual-services control condition. This report has no complete cost analysis, so dashboard consumers must not combine it with CUNY ASAP costs, derive cost per degree, treat it as an independent replication of every ASAP component, or rank it against other interventions.

## Kingsborough Opening Doors source family — 2026-09-12

The comparison contract includes an Article-filtered family for MDRC’s 2012 Kingsborough Community College Opening Doors report: the 1,534-student randomized design, six-year degree-attainment difference of +4.6 percentage points (SE 2.7), $3,580 higher total education cost per program-group member, and $2,480 lower cost per degree earned, all in 2011 dollars. The two monetary records are group-level six-year accounting outputs based on CUNY financial data and degree rates. Consumers must retain the Kingsborough-only scope and must not transform them into a benefit-cost ratio, a general saving, a ranking, or evidence for the wider Opening Doors or Learning Communities portfolios.

## New York City Small Schools of Choice source families — 2026-09-12

The dashboard keeps two Article-filtered families under the one New York City SSC Initiative. MDRC’s 2026 longitudinal report supplies a 16,496-student lottery/instrumental-variable design record, four-year high-school graduation, immediate postsecondary enrollment, six-year four-year-degree attainment, and an employment/earnings null finding. MDRC’s 2014 accounting report separately supplies five-year direct-service expenditure and cost-per-graduate differences for earlier cohorts. Consumers must not blend these cohorts, treat either report as another trial, infer a common dollar price year, or convert the accounting records into a benefit-cost ratio or cross-study ranking.

## Early College High Schools source families — 2026-09-12

The dashboard keeps AIR’s outcome and model records in two Article-filtered families under one Early College Initiative. The outcome family represents the 2,458-applicant, ten-school/five-state admissions-lottery study and shows only Year-10 intent-to-treat estimates of an offer; it must not mix in CATE results or count its several outcomes as replications. The cost-benefit family is a separate source-reported 2017-dollar model: cost evidence is from six sites, lifetime benefits are constructed from estimated attainment differences and prior-return studies, and its 15.1 preferred and 4.6 conservative ratios are model scenarios. Show their full labeled scope and do not render them as observed earnings, universal returns, or inputs to a cross-study ranking.

## Year Up PACE seven-year earnings family — 2026-09-12

The dashboard has an Article-filtered Year Up PACE family for one 2,544-applicant randomized trial: its design record, the prespecified Quarters-23/24 earnings outcome, Year-1 earnings displacement, Year-7 and cumulative Years-1–7 earnings, high-earnings threshold, and six-year employment-null context. Earnings are National Directory of New Hires outcomes and have no inferred common price year, so consumers must not render them as costs, normalize them, or combine timepoints as replications. The report’s source-modelled financial analysis is intentionally excluded until the typed price-year question is resolved.

## Abecedarian age-30 family — 2026-09-12

The comparison query now returns all eight factual ABC age-30 Claims when filtered by the ABC Study `66657d9776214aec9cf816b8d50b644a` and Article `a72a792642aa46b497587313102bfe39`. Rows cover years of education, bachelor’s attainment, high-school credential, income-to-needs, full employment, public-aid threshold, age at first parity, and criminal conviction. They all come from one 52-treated/49-control historical follow-up and must remain one evidence family, not a study-count multiplier. The connected nonfactual policy Claim supplies explicit Supporting and Opposing edges; readers must keep its policy judgment separate from factual rows and preserve the recorded full-employment table/prose conflict.

## Head Start ITT/IOT pairing — 2026-09-12

The Head Start family now returns 28 factual rows, including five participation-scaled IOT estimates from Exhibits 4.9–4.10. Each IOT Claim has `Treatment on the treated (IOT)` as its estimand and a reciprocal Related link to its published ITT counterpart. A dashboard must surface the estimand and pair, never count both rows as independent results, and preserve their cohort, reporter, measure, and third-grade follow-up labels.

## Head Start paired-estimand expansion — 2026-09-12

The Head Start family now returns 36 factual rows. Four additional 4-year-old third-grade outcomes each have paired ITT and IOT records: total problem behavior, closeness with teacher, positive teacher-child relationships, and parent time spent with child. Consumers must show the reporter, score direction, follow-up, and `Treatment on the treated (IOT)` label, preserve the reciprocal pair relation, and never sum or study-count the two estimands as separate samples.

## Head Start promotion pair — 2026-09-12

The Head Start family now returns 38 factual rows. Its 3-year-old-cohort promotion pair is a parent-reported third-grade result: 94% versus 95% promotion, with ITT −.02 and IOT −.03 (both p=.092). Show this as a suggestive, lower-is-less-favorable school-performance result and preserve its ITT/IOT pairing; do not display it as a broad retention-policy effect or use it to infer later achievement.

## Saga dashboard retrieval boundary — 2026-09-12

Saga supports the dashboard through its verified table-specific read contracts: Tables 3–4 first-year outcomes, Tables 5 and 7 pooled follow-up, Table 6 weighted effects and assumption-dependent bounds, and Appendix Table 5 study-specific later outcomes. Each table must retain its study, table, follow-up label, estimand, unit and source Article. A broad Article-plus-Study relation filter currently returns a mixed incomplete result despite direct Claim reads confirming the expected relations, so it must not be used as the dashboard’s Saga query until the API behavior is resolved; see `docs/geo-api-diagnosis.md`.
