# Reading First evaluation intake

## Achievement Claim correction — 2026-09-11

The dedicated Claim pages used outcome labels and generic descriptions despite having verified typed estimates. Source review of Exhibits 2.5, 2.6 and D.1 confirms that comprehension and at/above-grade-level estimates are not statistically significant, while first-grade decoding is significant (p=0.025). Preserve the precise Appendix D figures, rather than the rounded main-table figures, in Claim text. The IES report summary independently confirms the comprehension/decoding distinction.

`scripts/education-build-reading-first-achievement-copy.ts` reads the fingerprint-checked extraction at runtime, checks current identities/copy and exact coefficient/SE/CI fields, and changes only names/descriptions on the 11 achievement representations of seven contrasts. No new entity, numeric conversion, altered relation or independent-study duplication is involved. `reading-first-achievement-copy-review.json` records the complete before/after review. The other 52 Reading First representations still need the same source-aware copy repair.

Correction proposal `44ee519e60ef4931b97d2d80857c2fdc` was submitted and executed on chain. Main transaction `0xa2326bd80647aa09345f4aded5bedab11577f130f4224abd5f0a35f8a991254f`; bounty-link transaction `0xe909620dce0c6acb26cfe940a897035b9a530067e07179929ae56ad123e79020`; execution vote `0x0db751d4c7048a038b3f081768a2c39ef9237c7313b639866b172ad6bef4d27b`. After initial indexing lag, all 24 checks pass, including execution and bounty linkage. A fresh decoding Claim page shows the corrected title, 2.51-point estimate, SE 1.11, CI 0.32–4.69, p=0.025, spring 2007 and the original Article link. The 12 live Reading First query cases and TypeScript check also pass. No duplicate submission was made.

Reviewed 2026-09-11. Sources: [official IES landing page](https://ies.ed.gov/use-work/resource-library/report/evaluation-report/reading-first-impact-study-final-report) and [complete report](https://ies.ed.gov/sites/default/files/migrated/nces_pubs/ncee/pdf/20094038.pdf), NCEE 2009-4038, published November 2008. The report's suggested citation lists Gamse, Jacob, Horst, Boulay and Unlu; the title page also credits other contributing researchers.

## Correction and design

Imported `sources/src-015` said only RCT, omitted the year and used a generic finding about emerging cross-state estimates. `source-corrections.json` now supplies the verified publication metadata and findings; the original source data stays intact. The existing initiative's mention of a randomized component is not necessarily an error: Appendix B describes 17 regression-discontinuity sites and one group-randomized site. Do not replace RCT-only with an equally incomplete RDD-only label. Appendix B, printed B-3–B-5 (PDF pages 91–93), explains site assignment and the 248-school final analytic sample.

The landing-page summary reports improvements in instructional practices and first-grade decoding in spring 2007, with no statistically significant comprehension impact in grades 1–3. These are distinct outcomes; nonsignificance does not imply an exactly zero effect.

## Next extraction scope

- Exhibit 2.5: pooled spring 2005–2007 comprehension estimates, printed p. 25.
- Exhibit 2.6: first-grade spring 2007 decoding estimates, printed p. 26.
- Exhibits 2.1–2.4: instructional practices, engagement and implementation, retaining each outcome's unit and analysis level.
- Appendix D: confidence intervals, to preserve uncertainty without inventing standard errors from rounded p-values.
- Appendix A: state/site awards are potential financing context, not automatically matched per-pupil delivery costs. The evaluation contract is not program delivery cost.

## Verified extraction and modeling findings — 2026-09-11

`reading-first-transcription.json` records all 33 outcome contrasts in Exhibits 2.1–2.6, with matching uncertainty from D.1–D.4. Native and standardized forms amount to 63 representations of these same contrasts, not 63 independent outcomes. `scripts/education-prepare-reading-first.py` checks the primary PDF's numerical row sequences and emits `reading-first-extraction.json`; 298 checks pass. All ten source table pages were visually reviewed. PDF SHA-256: `7dc6d6da157522c2bb2715e4f9ceae6a97775420d8941f5328fdb87e8b44d985`.

- Appendix D supplies more precise achievement estimates than the main tables. Preserve 4.74 rather than 4.7 for first-grade SAT 10, and 2.51 rather than 2.5 for decoding; retain both source locators. Printed pp. 25/26 are PDF pages 54/55, not 53/54.
- Twenty-five contrasts have source-reported SEs and 95% intervals. The eight survey outcomes have p-values but no SE/CI in these selected exhibits. Missing uncertainty stays unknown; do not infer it from rounded p-values.
- The estimated mean without Reading First is a modeled counterfactual, not an observed control-group mean. The actual funded-school mean is unadjusted. Rounding can make their difference disagree with the printed impact; retain the published impact rather than replacing it.
- Percentage-point impacts differ from proportion differences and from percent changes. Keep source units explicit. Rounded SD confidence bounds can touch zero despite a source significance marker; preserve both the reported bounds and p-value.
- The final 248 schools are 125 funded and 123 unfunded; they are not the N of students for every outcome. The randomized site initially had five schools per arm. Program delivery cost is still unmatched.

Cross-space identity probes for Reading First, ReadingFirst, RFIS, Gamse, report number and two official URL forms found no matching report/study/program. The RFIS substring probe returned unrelated starfish/fishing entities; the Reading First substring probe found an unrelated historical-reading claim. The complete saved queries establish their stated scope, not absence under every possible alias.

Property reuse: `reading-first-property-samples.json` verifies Text P value `ba5f8fe9d1cd9a6094338d2f37b74a5e` and Text Study design `8e46e3eff9dea2b55d32a5ca7de61938` with real uses in space `03f7a1efafaeecaeae31a3b38fe9e446`. Reuse them without rewriting the source space. P value preserves `<` and `=`; the existing numeric companion is Float and mixes exact values with thresholds, so it must not be treated as an exact p-value without the string/operator.

Both discovered Confidence interval fields are Text and have no sampled uses. Existing Lower/Upper bound properties refer to biochemical flux; Cost lower/upper bound refers to cost ranges. New Decimal confidence lower/upper bounds and confidence level therefore serve a missing numeric requirement. The level uses the verified fractional percent format; bounds and SE share the effect's stated unit. Evidence: complete `property-discovery` reports for confidence, lower, upper, confidence level and interval bound.

The pilot builder reads extraction/model files at runtime, reuses grade/arm schema and the publisher's generic effect/SE properties, checks live datatypes and source identity, preserves stable IDs, and prepares an additive bounty-linked batch. Its one native grade-one comprehension row tests numerical bounds and rendering before expansion. Program identity, full implementation/measurement-concept mappings and the remaining representations are still required; the pilot does not complete this study or the dashboard contract.

## Remaining scope

All 63 selected effect representations are now executed, indexed and rendered. Preserve reported means in a separately labeled structure that distinguishes actual from estimated counterfactual values. Finish program/implementation/measurement concepts, matched costs where supported, source-to-Geo reconciliation and full dashboard integration. This report is the next selected study after the verified Perry package; it does not replace the full imported-record migration or dashboard requirements.

## Full selected-effect publication — 2026-09-11

The remaining 62 representations are applied by proposal `a507188f5f9142eb8d156c289d79c434`: 773 operations, 1,456 passing API checks across 81 entities, executed and bounty-linked. Proposal tx `0x7dbba6fb8dd3de7e94e9513524b18b54150b718afc6b611cf6e3e46f9666aaf7`; bounty tx `0xf7a3c3a5470b39e4a94b6c3eec6e6894d4c220798c4eee3a08b59fcee592d2fc`; vote tx `0x2f03feb1ec905e03f75de95766bd0c3631dee10a62614d7d2d176451fbd5a94e`.

Eight tables separate four outcome domains and native/standardized forms. All pages were checked: 7/4 achievement rows, 16/16 instructional-practice rows, 2/2 engagement rows and 8/8 survey rows. `reading-first-full-visual.json` records browser evidence. The 30 pairs have reciprocal Related entities links; each estimate also links to the common Study and source. Three native proficiency contrasts have no standardized counterpart. These are 33 contrasts, not 63 independent findings.

The saved `reading-first-comparison-query.graphql` and `education-verify-reading-first-filters.ts` pass 12 live cases: all 63, 30 standardized, 33 native, grades 1/2/3 (23/21/3), 47 with reported CI, 16 without CI, 18 spring-2007-only results, 10 p-value-threshold representations, the paired grade-one comprehension result and the empty unreported grade-three decoding case. Every returned row reconciles numeric values, missing uncertainty/N, source locators, grade/arm links and the exact alternate-representation link. Evidence: `reading-first-query-verification.json`.

The existing Normalization status property describes an extraction workflow, not an SD denominator; AI Music representation properties also have different semantics. Do not reuse them for statistical normalization. The dataset's separate standardization block preserves the four measurement families' different comparison-group SD definitions; structured measurement concepts remain future work.

Curator now shows all three Reading First proposals Accepted, with 22 accepted proposal rows in total. The submission remains In progress and unpaid. Evidence: `reading-first-remaining-curator-verification.json`. The original pilot coverage text is intentionally superseded by this batch; preserve the historical payload rather than rerunning it.

## Published pilot — 2026-09-11

[Dataset](https://www.geobrowser.io/space/dac259bad48a11adf97fe36857d85206/02b40a84dd87410f9ad78f0481ad237a): `02b40a84dd87410f9ad78f0481ad237a`. Study `d87bc8f30fb84b5fa660f98d1e770c78`; source `db0ea33548454e1780c78231066b7d71`; first native estimate `f004fa2ccffa444f9daa5e36e19ab8be`. Grade one is the reused `c66d539b68a54250889bee59b97fcfc0`. Stable arm IDs and every relation ID are in `reading-first-registry.json`.

New numeric CI properties: lower `60e8b11660d04c94b1e1ebe4321bedcf`, upper `2b6e1e8fa3324dc08e9b9051f3dee669`, level `6463e2fdc01a4b0694e40ccc499f6eca`. Live rendering confirms the 0.95 level displays as 95%, alongside 4.74, SE 2.72, bounds −0.63/10.11 and P = 0.083. No student N was inferred.

Pilot proposal `bf3fd4ba28c7411b8ac00bb89ae38d14` executed; its 61-operation batch passes 87 API checks across 14 entities, including bounty linkage. Proposal tx `0x4f129ad40242286a9e7dfa9f58a4c5a36acbcfd91984c86f3094cfbcca823306`; bounty tx `0x118514bbe27295490e5398c8626497f6edda9d2331dd8e24169ed629b6364d32`; vote tx `0x714aa37ebb051d5904b0206658f33a76297b2deb4bec4c6cf9f0cf268a9978b0`.

Reader review caught repeated cautions and storage instructions in the initial methods block. A one-value correction, proposal `dea76dd2e4d74a9396aeb4414a8f95a3`, replaces it with `reading-first-reader-methods.md`; it executed and passes three API checks including its own bounty link. Proposal tx `0xfaf51bc254aeffe9ed6f1f386f506f9070a44e1e83e28ded87c32aba0f48116b`; bounty tx `0x9dcc875d6c80e642117a2333813681d7a990b0309f7e47a2ee6258573253f14d`; vote tx `0x14cd625259f385a0100dcd3c64bd7b3c40e8e33c99a13781337b738c377e2eb0`.

The correction supersedes only the initial pilot's methods text. Keep its original payload and 87-check report as historical evidence; final-state verification must apply the notes overlay rather than expect the original text. Do not feed extraction/operational instructions straight into reader blocks in subsequent batches. The current description audit covers 212 published descriptions with zero flags. TypeScript and `git diff --check` pass. Browser evidence: `reading-first-pilot-visual.json`; the table is wide and Geo's Claim rating still appears as an unrelated 0% badge.

Curator verification: both Reading First proposals appear Accepted under Thomas Freestone's In progress submission, with 21 accepted proposal rows total and no payout. The initial pilot uses a fallback UUID title while the methods correction displays its name. The known zero-submission summary and bounty-owner governance-link quirks persist. Evidence: `reading-first-curator-verification.json`. Bounty acceptance and payout remain incomplete.
# Mean publication preparation — 2026-09-11

## Audience publication verification — 2026-09-11

Proposal `ab315d843a934eb582081ae23df8b68f` is executed. Reading First program `26c06d8c6d1d42f2b87bbf3a51806a18` now reuses the existing Children demographic and four existing Kindergarten through Third grade entities. The audience context block distinguishes intended eligibility and program duration from actual study exposure. All seven cases in `program-audience-query-verification.json` pass against live Geo, including each grade and the negative audience case. These checks cover this program only, not all imported initiatives. TypeScript checking also passes.

The batch verifier passes 10 of 11 checks: nine published content checks plus execution. The remaining check is the bounty link. Transaction `0x7f15403a9a83c47abef8a5a4ee9c82559275b7270f1aec17c083372459306de0` was confirmed at block 50401, but complete outgoing-relation inspection at 22:03:50 UTC still lacks expected edge `fd2bdc43a93c481daffcb8f27f979815`. Evidence: `reading-first-audience-publication.json`, `reading-first-audience-index-verification.json`, and `reading-first-audience-bounty-inspection.json`. Transaction success does not prove indexed bounty attribution. Preserve the journal and inspect its existing CID before considering any repair; absence alone does not authorize a duplicate submission.

Administrator identity remains unresolved. Completed all-space primary-name searches for `United States Department` and `Education Department` yield no verified US Department of Education organization. The latter returns articles, claims, and blocks rather than an agency identity. The broader `U.S. Department` search was capped and is incomplete. These observations are not graph-wide proof of absence; finish identifier/alias discovery before creating an administrator.

Follow-up at 22:06 UTC: the bounty CID is retrievable through the Pinata gateway (HTTP 200, 405 bytes). `education-inspect-bounty-payload.ts` decodes it with the installed GRC-20 codec and compares it with the existing TypeScript bounty builder. All three operations, edit ID and personal-space author match. The Submission operation includes the exact bounty ID, owner-space context, edge ID and relation-entity ID. Evidence: `reading-first-audience-bounty-payload-inspection.json`. This rules out a mismatch between the intended builder output and retrieved payload; it does not establish indexer processing or identify the missing relation's cause. No repair was submitted.

Codec comparison finding: decoded operations can materialize omitted empty fields such as `unset: []`. Compare both expected and retrieved operations after the same encode/decode normalization, rather than treating a raw object-shape difference as a content mismatch. The read-only inspection script applies that normalization; TypeScript checking passes.

Mean follow-up complete: all 11 dedicated live query cases pass, and Curator shows both mean proposals Accepted under Thomas Freestone's In progress submission (24 accepted proposal rows total, no payout). Evidence: `reading-first-means-query-verification.json` and `reading-first-means-curator-verification.json`. This supersedes the mean-query and Curator-pending statements below.

Final mean expansion verification: all 127 API checks pass after indexing, including execution and bounty link. All 33 mean pairs now exist on their original native contrast IDs. Browser pagination covers all 21 numeric rows (9/9/3) and 12 proportion rows (9/3); observed and counterfactual values and units render throughout. The coverage paragraph now states that means are included. Dedicated mean-filter cases and Curator presentation of these two newest proposals remain pending.

Publication update: mean pilot `9b0630fb4e6542b6ba86a34970aea641` executed and is bounty-linked; all 51 index checks pass. The browser renders 543.8/539.1 SAT 10 points and 46%/41.8%, with distinct actual versus counterfactual column labels. Expansion `2d3f943e0adb4c24aef0419629c161d6` has confirmed submission, bounty-link and execution-vote transactions; initial API verification ran before those edits were indexed. Recheck its existing journal, never resubmit merely because indexing lags.

Mapping correction: the 66 prepared mean records map to additional properties on the existing 33 native-unit contrasts, not 66 new Claim entities. Reuse Observed proportion `73b35a4ce05f45908118a089d9995bae` and Measurement unit `5c67ae17c84ce783f3b8cd8ffa063661`. New Decimal properties are Actual unadjusted mean `698a64065ce14aa2b0022605e6b803c1`, Estimated counterfactual mean `7711cba8c1ed4db0bc3d3afc2709d240`, and Estimated counterfactual proportion `e625ac07ee054ddc8e21c791c027791c`. Both proportion properties use the fraction-to-percent Format. Mean units and existing impact units are separate facts; impact uncertainty remains unchanged.

Live schema finding: `Result value numeric` (`3163ea823b4c9ebf0d26ce3a20eb855f`) is actually Text despite its name/description, with no uses in the bounded sample. `Measurement` (`88d020ba7ff94d24b412a6e8d102a941`) is also Text and its sampled uses describe measures. Neither supports numeric means. Complete paginated property-name searches and bounded live schema/use inspection are saved under `data/education/property-discovery/` and `reading-first-property-samples.json`; sampled uses do not establish exhaustive graph coverage.

`scripts/education-prepare-reading-first-means.mjs` prepares 66 mean records for the 33 published contrasts. All 66 values reconcile exactly with the reviewed main-exhibit transcription; extraction and transcription hashes must match the previously reviewed publication source. Output: `data/education/reading-first-mean-records.json`. These records are prepared, not yet published.

Actual funded-group means are unadjusted; the without-funding values are estimated counterfactual means, not observed control-group means. Preserve this distinction in structured properties and displayed labels. Mean SEs, confidence intervals and per-outcome sample sizes remain unknown; the impact estimate's uncertainty is not uncertainty for either mean. Source percentages remain on the 0–100 scale in this preparation, so any fraction encoding needs an explicit exact conversion and verified Format metadata. Paired mean records link back to the existing native contrast key rather than representing additional studies.

Next: inspect live cross-space properties for estimated versus observed values, reuse the existing study/arm/source IDs, then prepare SDK operations with persistent IDs and verify publication, bounty linking and rendered mean tables. Full implementation/population/measurement mappings and compatible costs remain unfinished.
# Remaining practice Claim repair — 2026-09-12 UTC

Re-read the official report's Exhibits 2.1–2.4, discussion pp.17–23 and the existing verified D.2–D.4 extraction. The 26 non-achievement contrasts have 52 native/standardized Claim representations. Their former row-label titles and generic descriptions did not state findings. `education-reading-first-practice-copy.ts` now states the measured practice, grade when applicable, magnitude/unit and a clear uncertainty-qualified conclusion; descriptions retain period, observed versus self-reported status, comparator, p-value, and reported SE/CI. Survey SE/CI remain absent. Standardized practice effects are not student-achievement SDs, and paired representations are not independent findings.

The native proportion differences remain in their source units; no percentage conversion or local recomputation is introduced. The negative second-grade print-engagement estimate (-4.75 percentage points; p=0.104) is described as no established clear change, not a proven decrease. The survey's 18.47-minute teaching result is explicitly teacher-reported, separate from observed instruction. The report's counterfactual means are estimated outcomes absent funding, not raw observed control averages.

All 52 repairs are applied under proposal `2b4878f19e6044109c575a208bbf7642`, with indexed bounty link and 158 passing operation checks. Main transaction `0x76172efda13b1575f59d21bd1decb4246c2017658acfd4ac34bb740577769fb3`; bounty `0x9f64d20a0376bb89aa65ad202a7f5751508c1ba3663e42eaaf2763e5ac25eff8`; execution vote `0xf5116eecbfd0b749e43b639e5318bfcca46169650d732e5a63e8268236efdaaf`. Only name, description and factual classification changed; source, numeric, grade/arm and paired-form relations are preserved. The original remaining-record builder now uses the shared practice helper and the already-reviewed achievement copy instead of recreating label titles. Submitted payloads remain historical.

Two tooling fixes during this review: Windows Python's default output encoding failed on the PDF's ≤ character; `sys.stdout.reconfigure(encoding='utf-8')` made extraction readable. Geo's live StringFilter rejects `containsInsensitive` with HTTP 200 plus GraphQL errors; introspection confirms `includesInsensitive`. Retrying the read with the documented live field completed the 95-entity all-space Reading First search. The failed query was not treated as evidence of no duplicates.
