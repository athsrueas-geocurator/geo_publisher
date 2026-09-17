# Publication review and corrections

## 2026-09-17: personal quiz delivery corrections

The Knowledge Gap post was indexed in personal space `d00460c203779d21d96fcfc6102d7a72`, but the supplied `/entity/d850f645745745bab44627e7cfaf28b4` link did not resolve. The browser subsequently rendered its five ordered text blocks at the [space-scoped URL](https://www.geobrowser.io/space/d00460c203779d21d96fcfc6102d7a72/d850f645745745bab44627e7cfaf28b4). This was a delivery-link error, not a missing vote. The separate Books proposal has its own governance lifecycle; do not infer either item's state from the other.

Code corrections: `src/publication-evidence.ts` generates validated scoped URLs and checks complete ordered block identity/text. The quiz publisher now merges journal milestones so submission retains preparation evidence, records the submitting boundary, and labels its output submitted rather than live. The read-only `scripts/verify-knowledge-gap-quiz.ts` emits a separate indexing receipt; it does not claim browser verification. Regression tests cover malformed links, evidence preservation, changed/missing/reordered blocks and incomplete traversal. Historical submitted journals remain unchanged.

The previous Books preparer's exact-title/ISBN search is bounded evidence, not exhaustive duplicate clearance. Its ISBN query searched text despite the ISBN property being Integer, and its validation claimed Person-type verification without a direct check. Do not replay that proposal or treat its validation prose as proof of complete discovery. Future Book creation must inspect identifier datatype, title aliases and author identity with the shared discovery workflow before signing.

Communication corrections: draft requested Discord copy rather than trying to access/send Discord; keep the answer hidden until the requested reveal; distinguish Markdown text blocks from interactive quiz controls. Verify actual editor controls before giving UI steps. The user selected the three statements, but incidental assistant-written headings are not a substitute for the user's editorial voice.

`scripts/push-noninteractive.ps1` runs ordinary Git with credential-manager and terminal prompts disabled, restores its environment afterward, and fails visibly if existing credentials cannot authenticate. It never launches an account-selection flow.

## 2026-09-12: confirmed catalog errors

Direct reads of the builders and current destination-space text confirmed copy-substitution errors in HSLS:09, SSOCS, and What Works Clearinghouse. All three described a kindergarten cohort. SSOCS retained longitudinal language, student join keys and incorrect geography/access text. WWC retained NCES stewardship, DataLab access, survey weights and longitudinal language. These were published errors, not merely unsubmitted drafts.

The earlier ten-check verifier reconciles Geo against operations. It cannot establish that those operations represent the source correctly. Earlier claims that these checks certified source accuracy, or that WWC's block required primary-study citations, were incorrect. The discovery guards read only an old exact-title report while claiming title/alias/URL coverage. Do not treat those messages as complete duplicate-review evidence.

The correction reads the pinned catalog at runtime, uses the existing six entity IDs, and changes only descriptions and metadata blocks. Primary identity checks: [HSLS overview](https://nces.ed.gov/surveys/hsls09/), [SSOCS overview](https://nces.ed.gov/surveys/ssocs/index.asp?FType=4), [IES](https://www.ed.gov/about/ed-offices/ies). Preserve original operations and journals as historical evidence; do not rebuild or replay the three superseded catalog builders. Use `education-review-catalog-repair.ts` for the correction and subsequent field reconciliation.

## Reporting defect

Correction proposal `7eb23beab424480cab5c95820c1fc19c` executed and its bounty link is indexed. Eight verification checks pass; the independent source-derived six-field comparison has zero mismatches. The three defective builders are retired to prevent regeneration. Original payloads remain historical evidence. SSOCS also contained Windows-encoded text; its retired source file was normalized to UTF-8.

An integrity scan covered 201 batches with explicit existing publication journals and found no missing operation files or batch/journal hash mismatches. See `data/education/publication-review-integrity.json`. This checks file integrity, not research semantics or current chain state.

`education-bounty-coverage.mjs` counted confirmed submission transactions as executed proposals and silently skipped unreadable journals. It now distinguishes confirmed submissions from recorded execution and reports parse failures. It remains a local-journal summary, not a fresh chain/index audit, a count of unique studies, or proof of bounty acceptance.

## Open review requirements

- Reconcile the remaining catalog metadata, crosswalk decisions and official access URLs; local validation files for the three affected builders also contain copied keys/URLs.
- Recheck cross-space identity candidates; an exact-title miss is insufficient to certify alias/identifier discovery.
- Review all source families for semantic accuracy independently of payload/index equality, including uncertainty, model versus observed metrics, and linked debate direction.
- Verify repaired pages visually. A fresh API match does not establish rendered correctness.
- Full migration/dashboard completion remains unproven. Earlier blocked status citing missing study scope was unjustified: documented migration, review and dashboard work remains actionable.
