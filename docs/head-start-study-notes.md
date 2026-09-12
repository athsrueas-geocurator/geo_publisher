# Head Start evidence notes

## Result collection and unit repair — 2026-09-12

The [collection reconciliation](education-result-collection-reconciliation.md#head-start-collection-applied) records the cataloged 37-Claim result Dataset, six tables, governance/index/browser evidence, 14 missing ITT labels and two clarified fraction-scale probability units. Existing effect values and outgoing evidence links are preserved. Archive-access information stays separate from outcome evidence. Both generating scripts were corrected without rebuilding historical submissions or changing pinned extraction inputs.

## Third-grade report access diagnosis — 2026-09-12

The published Head Start third-grade follow-up Article and its three existing factual summary Claims are already indexed and bounty-linked. A direct request to the historical `acf.gov` PDF URL returned an empty response. The corresponding `acf.hhs.gov` URL returned HTTP 202 with zero bytes in this environment. An apparent ERIC fallback (`ED539213.pdf`) downloaded successfully but is a three-page concussion document, not the Head Start report; its PDF content was inspected and rejected before extraction.

Do not infer numeric third-grade estimates from the existing summary Claims or use the unrelated ERIC file. A table-level expansion requires an authenticated or otherwise verified primary copy of *Third Grade Follow-up to the Head Start Impact Study: Final Report*, with report/table/page identity checked before creating additional Claims. The existing rows preserve the report's cohort and reporter differences but are not substitutes for row-level extraction.

## Local-file provenance recheck — 2026-09-12

`tmp/head-start-third-grade.pdf` is also not the Head Start report. PDF metadata identifies it as *Concussions—The Role of the School Nurse*, a three-page National Association of School Nurses document; its SHA-256 is `bbeb73efb593236370df958af3ac43b4f4b1b3393d8c8462ef7fb93681bd7873`. Its filename does not establish source identity, and it must remain excluded from extraction.

## Correct primary report recovered — 2026-09-12

The correct ERIC record is **ED539264**, not ED539213. `tmp/head-start-third-grade-primary.pdf` is a 3,512,583-byte, 346-page copy of *Third Grade Follow-up to the Head Start Impact Study: Final Report*, OPRE Report 2012-45 (October 2012); its extracted title page names Puma et al. and OPRE. The report contains third-grade ITT exhibits for the 4-year-old cohort (Exhibit 4.1, printed page 77) and 3-year-old cohort (Exhibit 4.2, printed page 78), alongside the full appendices.

The PDF text extraction interleaves table columns, so the apparent values around Exhibits 4.1–4.2 are not yet a row-level transcription. Do not publish them until the page rendering and report columns have been reconciled against the printed exhibit. This corrects the access blocker, not the prior rule against inventing table values.

## Third-grade cognitive table publication — 2026-09-12

Rendered review of Exhibits 4.1 (4-year-old cohort, printed p. 77) and 4.2 (3-year-old cohort, printed p. 78) reconciled the columns. Ten factual Claims now retain the regression-adjusted impact and printed p value for ECLS-K Reading, PPVT, WJ III Letter-Word Identification, WJ III Applied Problems, and WJ III Calculation in each cohort. They use the report's native score units; no standard error, sample size, effect-size field, or independent-study interpretation was inferred.

Publication proposal `49a78905e0224e82a922b12388878de3`, bounty transaction `0xfcc8101da0d6e3748c72ffa96f46b44adb0aa396f1cae74d970bd8ff8b338941`, and Fast Path vote `0x0b7afaa3bb673e8bcfdc316f219620ce6003e07b75a1072dc31dfe5773138e82` are confirmed. The dashboard comparison verifier requires the ten new IDs and passes after indexing.

## Third-grade social-emotional table publication — 2026-09-12

Rendered review of Exhibits 4.3–4.4 added four significant regression-adjusted ITT rows that preserve the report’s mixed reporter/cohort pattern: favorable 4-year-old parent-reported aggression, unfavorable 4-year-old teacher-reported normal-category emotional symptoms, unfavorable 4-year-old child-reported peer relations, and favorable 3-year-old parent-reported social skills and positive approaches to learning. Units state the reporter, cohort, score direction, and category semantics where needed; these are not combined into one social-emotional effect.

Proposal `d69b02190d4d41d881b7f87bb2527840`, bounty transaction `0xbeda58f041adde823066be520535131f39658a5abc2e54ba58ad72ded503df75`, and Fast Path vote `0xefb33090d88a5538e907379cb7118a48bed57d6efdabfe2d2845c5d88332121a` are confirmed. The live dashboard verifier now requires all fourteen table-level third-grade rows.

## Third-grade health boundary — 2026-09-12

The report states that neither cohort had a statistically significant third-grade impact on its measured parent-reported health outcomes: dental care, insurance, overall health, ongoing-care need, and recent injury. It also states that the evaluation did not collect direct examinations, health records, or provider reports. One scoped factual Claim carries this conclusion, linked as opposing context to the existing expansion question; it does not claim that every health outcome or later-life health effect was measured.

Proposal `878ec744c7e84f2c8689b442d6c03954`, bounty transaction `0x3379dad238f0ec67aca844ff2cffaa6b8d377b70a793772b4c4d1c936fde1751`, and Fast Path vote `0x0effd9be2164719299b0492a3c18629297455b298ec0c1163549dc8658222e2a` are confirmed. The dashboard verifier includes this health boundary alongside the 14 table-level third-grade rows.

## Third-grade IOT counterpart estimates — 2026-09-12

Rendered Exhibits 4.9–4.10 report treatment-on-the-treated (IOT) estimates only for outcomes with significant ITT results. Five IOT Claims now provide the participation-scaled counterparts of already published ITT facts: 4-year-old ECLS-K Reading (+3.34, p=.075), parent-reported aggressive behavior (-.34, p=.043), teacher-reported normal-category emotional symptoms (-.09, p=.005), child-reported peer relations (-.21, p=.020), and 3-year-old parent-reported social skills and positive approaches (+.34, p=.025).

Each Claim carries the `Treatment on the treated (IOT)` estimand, the exact exhibit locator, Article and Initiative links, and reciprocal Related links to its named ITT counterpart. These are alternate estimands from one randomized access study, never extra studies or independent evidence; no effect size, standard error, or participant count was added where the exhibit did not report it. Proposal `eab2ee4a140f4df08dea39cfc79db1e7`, main transaction `0x56f662844aa3313b8dcdb8f6203c0b14cf8cf9e2de2438fecd77added4321fa6`, bounty transaction `0x9727e8f55c3b3d555ca5fb68db25cdaf97f60a891ff50fbc6e109df644d31c52`, and Fast Path vote `0xcf3df08523868822419131bf508dffbdccf4ab6559e0633e6afdd068e8cbee22` are confirmed. The live comparison verifier returns all 28 factual Head Start rows and verifies the linked bounty coverage.

## Third-grade paired ITT/IOT expansion — 2026-09-12

Rendered review of Exhibits 4.3, 4.7, and 4.9 added four more 4-year-old-cohort pairs. The report gives ITT/IOT estimates respectively for total problem behavior (−.50/.−.75, p=.090), closeness with teacher (−.67/−1.00, p=.060), positive teacher-child relationships (−1.33/−1.99, p=.063), and parent time spent with child (+.27/+.40, p=.001). The report’s directions matter: lower total problem behavior is favorable, while lower teacher-closeness and positive-relationship scores are unfavorable; more parent time is favorable.

Every IOT record says `Treatment on the treated (IOT)` and has a reciprocal Related edge to its corresponding ITT record. These eight rows are outcomes and alternate estimands from one randomized-access study, not eight independent studies; no missing standard errors, sample counts, standardized effects, or modelled values were supplied. Proposal `58f5f2f119874e699573a64803be4e46`, main transaction `0x5b9b1c004c5cc1637babfea08f86921306ea7e207763844daceaeb7b1fd52dcc`, bounty transaction `0xff978c8303fd65f9882e97154a3a27841a6aa5f7408cee9a730a8538cbb3a20b`, and Fast Path vote `0xcd37600cf1cf9ee92acb3f77d14507d052dd817260f9fc25d4a6793692322dab` are confirmed. After indexing, the comparison verifier returns 36 factual Head Start rows; bounty coverage records 195 confirmed executed journals, with one historical pre-submission failure retained separately.

## Next-table extraction boundary — 2026-09-12

The first extraction attempt did not transcribe or publish a promotion/retention row. The local Windows shell has no `pdftotext` executable, and prior work established that this report’s text layer interleaves columns even when extraction is available. Use a rendered printed exhibit or a verified table-aware parser, reconcile its cohort, column and p-value against the report, and preserve the raw rendered evidence before adding any record. A narrative statement about promotion is not a substitute for a checked source table.

## Third-grade promotion ITT/IOT pair — 2026-09-12

Rendered Exhibit 4.2, the accompanying report text, and Exhibit 4.10 establish one 3-year-old-cohort parent-reported school-performance pair: promotion to the next grade was 94% in the Head Start group and 95% in controls, with a regression-adjusted ITT impact of −.02 (p=.092); the corresponding IOT impact is −.03 (p=.092). Lower promotion therefore means more reported grade retention. This is a 10%-threshold, suggestive result, not evidence about all retention policy, future achievement, or every Head Start cohort.

The IOT Claim is typed `Treatment on the treated (IOT)` and has a reciprocal Related edge to the ITT Claim. The pair remains one outcome from the same randomized-access study, not two studies. Proposal `f780a21ec9a04105b249119d106e5771`, main transaction `0xf75d16187e6d2c145c723852c232e0b3fa9f2a2c9a8e364661d0d148313b0f71`, bounty transaction `0xda269ade9f37bf2f49696de6a0246266eccc43b32ab1103527b52807af582d0e`, and Fast Path vote `0x3b3cae756ec09d5a749503c0a1f98d72678617ad00fc804a588460bfece9d6a7` are confirmed. The indexed dashboard comparison verifier now returns 38 factual Head Start rows; bounty coverage is 196 confirmed executed journals, with the historical pre-submission failure recorded separately.
