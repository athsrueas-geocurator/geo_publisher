# Education description and content-block correction

## Cross-study Claim audit — 2026-09-11

`data/education/claim-readability-audit.json` is a live-read snapshot of 252 Claims explicitly typed by executed education batches. Its 148 heuristic flags nominate records for source-aware review; they are not 148 proven defects, and an unflagged record is not certified correct. Cost and benefit-cost row labels can evade the title heuristic. Preserve this snapshot as historical evidence rather than treating it as a current unresolved count.

Source review confirmed the defect in all 15 preferred school-finance coefficients. Correction proposal `7d72e27932a641359a8ef175dd5be40b` executed and passed all 32 checks, including bounty linkage (`school-finance-claim-copy-index-verification.json`). It changes only names and descriptions, preserving the original IDs, coefficients, standard errors and relations. The remaining 133 originally flagged records still require review; additional unflagged records may require corrections too.

Dedicated Claim pages for `f10830673c5e4f079c83698e147189e8` (all-sample schooling) and `e74c03470c274d0c943a5d1c60b7b0ce` (nonpoor adult poverty) were inspected in a browser after publication. Both show corrected propositions, exact coefficients and clustered SE, spending scale, population context, and the original Article link. The nonpoor title explicitly says the model did not establish a poverty reduction. This is visual evidence for these two examples, not every Claim or the whole dashboard.

User correction, 2026-09-11: descriptions should contain at most two concise sentences. Detailed study notes belong in content blocks, not the entity header.

Second user correction, 2026-09-11: the 58 new Saga outcome Claims used row-label titles and generic descriptions, so their dedicated Claim pages did not state the result despite containing typed numbers. This was a publishing-content defect, not a plan to add essential details later. A Claim title must state the finding; its concise description must show uncertainty/source context and explain what the paper concludes. Table rendering alone cannot verify Claim readability. For example, the Study 2 property-arrest TOT estimate is -0.090 with SE 0.056; the authors report no statistically significant behavioral spillovers after multiple-testing adjustment (main text p. 749). A negative point estimate must not become an unqualified crime-reduction claim. `saga-claim-copy-review.json` records the full repair review; original numeric values and IDs remain unchanged.

Repair proposal `eed34163f96a4908b0095f35ee52b184` executed, with all 118 checks passing across 58 Claims, including the indexed bounty relation. Main transaction `0x9800cac0f31871da838881d85fa9c956be3584eed855c12b1f4f9545808a958d`; bounty transaction `0x150c2324aef22a2f1a68a25429f6befe5af9946152f12215aa72862d93275ace`; execution vote `0x8c294b7d9999470ed62f6a55b486aa4a7251173474c9bfe6253e81db079cc646`. Fraction-valued estimates remain unchanged; percentage points in titles are explicit display conversions, and descriptions retain raw fraction-scale values. The shared claim-copy helper is now used by future Saga preparation; submitted historical batches are not rebuilt.

Immediate browser follow-up found a transient discrepancy: the corrected Claim's document title used the new name while its body still showed the old title/description, despite all indexed values passing. This is observed display lag, not proof that publication failed or permission to resubmit. A later fresh-page check is required before claiming the Claim body is corrected.

Follow-up completed: a fresh dedicated Claim page now displays the actual 0.090-fewer-property-arrests finding, SE 0.056, 2,710 observations, Table 4 locator, the authors' no-significant-behavioral-spillovers interpretation and the original article link. Evidence: `data/education/saga-claim-copy-browser-verification.json`. This supersedes the body-verification-pending state above. Other studies' Claim readability still needs a separate audit; the old Saga table-rendering report did not establish it.

The initial audit queried current destination-space descriptions written by executed migration batches: 76 records, with 24 flagged for editorial review. It covered Saga, STAR, the glossary, and created properties. The 350-character check is an editorial warning threshold, not an official Geo limit. Sentence splitting is heuristic: initials such as Alan B. Krueger can produce false positives, so summaries are reviewed explicitly.

Evidence and implementation:

- `data/education/description-audit.json`: complete live descriptions, source batches and review flags.
- `scripts/education-audit-descriptions.ts`: repeatable audit against Geo.
- `scripts/education-repair-descriptions.ts`: concise summaries, full details retained in Markdown text blocks, and persistent block/edge/relation-entity IDs. It checks that current descriptions still match the reviewed snapshot before changing them.
- SDK 0.20.3 `Ops.textBlocks.create` supplies the model: a Text block type, Markdown content value and parent Blocks relation. The repair uses the same structure with stable relation IDs to make retries reproducible.

The STAR dataset is the first text-block pilot. Verify its browser appearance before repairing the other reviewed descriptions. Repairing descriptions changes the expected current state of earlier batch verifiers; their original descriptions remain historical publication evidence, not the current display contract.

The pilot was verified in the browser: concise header, scenario table, then the complete Methods and interpretation block. `description-pilot-visual.json` and six passing API checks record the result. A follow-up batch repairs the other 23 reviewed descriptions, preserving their detailed notes in separate blocks; its journal and verifier use the `description-remaining` prefix. The STAR build script refuses to overwrite a batch with an existing publication journal, preventing accidental replay of superseded descriptions.

Completion evidence for description repair, 2026-09-11: 24 descriptions updated across the two executed, bounty-linked batches. The remaining batch passed 94 API checks across 46 entities. A fresh audit of all 76 descriptions found no review flags; original audit retained as `description-audit-before-repair.json`. Typecheck passes.

Browser limitation discovered: a Saga Claim page shows the short description and source but hides its attached text block, as it also hides ordinary numeric properties. The STAR Dataset overview does show its Methods and interpretation block. The notes are indexed graph data, but the dedicated Claim UI is not a reliable viewer for them. Dashboard readers must load Blocks/Markdown content explicitly, and dataset-level views should expose detailed notes. Do not claim that every Claim's notes render in Geo's dedicated Claim page.
# STAR follow-up correction — 2026-09-12 UTC

The user found that STAR experimental Claims still displayed row labels despite earlier numeric/table checks. All eight are now corrected in place with actual findings, grade, magnitude or an appropriately uncertain conclusion, comparator and SE; the source discussion distinguishes small-class gains from inconsistent aide results. Shared generator fixed, Is factual=true added, source and all numeric/relationship identities preserved. Proposal `7d564fc12ff042f2bd59217c85482c9e` executed and bounty indexed; 26 operation checks and eight numeric/filter cases pass. Dedicated kindergarten Claim body and source were verified. See `star-experimental-notes.md` for full evidence. The fresh pre-repair audit had 334 Claims and 124 heuristic flags; this is a review queue, not a count of verified defects or a certification of unflagged Claims. The broader pass remains open.

### Policy-description repair evidence — 2026-09-12

The DCMP, PACE, and San Francisco ethnic-studies policy Claims were reduced to two sentences without changing their Claim titles, factual status, structured evidence, sources, stable IDs, or relations. Their concise descriptions retain the central design or uncertainty boundary; extended methodological detail remains in their study notes and linked evidence. Proposal `4bce31e80d0e47d5ac59b1e12c25f888` and its bounty link are confirmed, with five indexed checks passing. A refreshed 545-Claim audit has 27 heuristic candidates, down from 30; review these individually rather than applying a length-only rewrite.
