# Reading First administration and funding

Research and publication findings, 2026-09-11. Administration is published and verified; numerical funding facts remain unpublished.

## Verified publication

Follow-up verification: all 11 cases in `program-audience-query-verification.json` pass, including OESE alone, OESE + Children + Kindergarten, exclusion of OESE, and a negative check that the study is not the administrator. Every returned program also retains its study/dataset, four ordered grades and three sources. The query remains scoped to Reading First; it does not prove full national program coverage. Curator's expanded list shows proposal `83340f146ff74f0ebdb48cf430f7a00b` Accepted among 27 linked proposals. The overall submission is In progress, with no payout. This supersedes the filter/Curator-pending statement below.

Frontend contract: reuse `data/education/program-audience-query.graphql`; add a destination-scoped `relations.some` filter with type `d1c6034425684b4caaf2570bee562802` and target `bbfe2860b5d04e4a98d647183af924bf`. Combine it with the existing audience and grade filters using `and`. This represents historical program administration, not actual student exposure or a school-level delivery provider. The saved verification report contains the exact query variables and returned relation IDs.

Proposal `83340f146ff74f0ebdb48cf430f7a00b` executed successfully. Ten SDK operations create typed OESE (`bbfe2860b5d04e4a98d647183af924bf`), the 2008 guide (`cb2bc5b224bb42bbb6f868db870db4dd`), and an administration context block, and link them to the existing Reading First program. All 16 API checks pass, including execution and indexed bounty attribution. Main transaction: `0x5db18ed3b4f62c016be84a63e299a0a04c82a9c2990855a3c58743df980a2460`; bounty: `0x9b89c001ebe2de353d24bc21cdf16dae3fa4162ece03886983ee9aa3c1d2a7b9`; execution vote: `0x99e487bf0755886adaf542e28e272a9f39940d5af4233abffd529396ea89e29e`.

Browser review confirms the program's short description, Administered by → OESE, all three sources, and labeled administration, grant structure and funding-limit sections. Evidence: `data/education/reading-first-administration-index-verification.json`, publication journal and model. TypeScript passes. Curator presentation and dedicated administrator filter cases remain pending.

The source was downloaded and visually reviewed locally after the web screenshot failed. `tmp/pdfs/ed-guide-reading-first.png` renders printed p. 155; the PDF SHA-256 is `47ac3549d7db46d2ec0b7f7dfa14fc4db27fd41a7d3b58e0a2d54d9489d2829c`. This supersedes the visual-verification-pending statement below. Office substring candidates were two unrelated claims, not office identities; complete office URL searches and exact text/alias probes also returned no matches before creation.

The Department of Education's [2008 Guide to Education Programs](https://files.eric.ed.gov/fulltext/ED502979.pdf), printed p. 155 (PDF page 181), identifies Reading First / Reading First State Grants, CFDA 84.357, and the Office of Elementary and Secondary Education (OESE) as administering office. State education agencies receive formula grants; eligible local education agencies seek competitive subgrants from states. Therefore national administration, state grantees, local implementation and evaluation-school assignment are distinct roles. Do not flatten them into one operator relation or infer a directory of local operators from the national study.

The table reports fiscal-year appropriations and anticipated awards. These are national program funding context, not trial delivery costs, per-student costs, expenditures actually incurred, or cost-effectiveness denominators. Retain fiscal year and funding measure if subsequently modeled. Numerical transcription awaits visual verification: web PDF screenshot retrieval failed with a cache miss, although indexed text was readable.

## Identity discovery and schema

`data/education/federal-education-identity.json` records 17 complete all-space probes across all text properties: nine exact names/aliases and eight HTTP/HTTPS, www/non-www, slash/no-slash homepage variants. No matches were returned. Complete primary-name probes for six department spellings also returned no matches; these are separate from the earlier incomplete broad U.S. Department search. This is scoped discovery evidence, not an assertion that every possible alias was searched.

Exact all-space primary-name searches for Office of Elementary and Secondary Education and OESE returned zero candidates. Before creating the office, finish its alias/identifier searches and inspect any candidates. The office is the precise historical administrator identified by the guide; the department can be represented separately with the verified parent relationship if the ontology supports it.

Reusable Federal agency type: `c3b48b961db3b34ea416b6c0948bd302`, in US Politics `4582fbbee28a16589154f7e36f1ee3c5`. It is typed Type and its definition explicitly includes executive departments, bureaus, and independent federal agencies. Inspect its live schema before operations are built.

Government agency `1c4cba01866241adade1992e35fa184a` is typed Organization type (`85c99276ee204bb4a662f0a4096215b1`), not Type. Do not use it as a Types relation target merely because its label sounds like a type. Evidence: `data/education/discovery/government-agency.json` and `federal-agency.json`.

Next: finish office identity and source identity reconciliation, verify source page visually, inspect Federal agency schema and historical relation support, then publish source-backed administration with persistent IDs through the existing SDK builder, journal, bounty-link and verification workflow. Keep descriptions short and preserve detailed role distinctions in a labeled block.
