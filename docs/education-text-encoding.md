# Education text encoding repair

## Observed and diagnosed — 2026-09-12

The program-page review exposed damaged punctuation in a coaching Claim backlink. A complete destination-scoped `valuesConnection` scan checked 5,044 non-null Text values over 101 cursor pages. Eight values contain C1 control characters or U+FFFD replacement characters: three coaching titles, two CREDO comparison descriptions, the CREDO program description, a teacher-induction retention description and a CEP policy description. This audit nominates encoding damage; it does not certify factual correctness or detect every possible wording defect.

Review showed Windows-1252 apostrophe/en-dash bytes persisted as Unicode controls U+0092/U+0096 in some published strings. Three coaching apostrophes had already been irreversibly decoded to U+FFFD, but their exact `coaching� s` possessive context (without the space) makes the intended punctuation unambiguous. The correction changes apostrophes and academic-year en dashes only. No words, effect sizes, units, p values or graph edges change.

Two local builders (`education-build-ncss3.ts`, `education-build-teacher-induction-rct.ts`) were not valid UTF-8; strict decoding located raw 0x92/0x96 bytes. They were confirmed untracked before conversion. Selective decoding preserved existing valid UTF-8 and converted only those known invalid bytes, rather than decoding the whole file as Windows-1252 and damaging valid text. The third untracked builder (`education-build-teacher-coaching-meta-analysis.ts`) had three U+FFFD apostrophes and was repaired at those exact contexts. Historical published payloads and journals remain unchanged.

## Prevention

`src/education-text-encoding.ts` rejects C1 controls and U+FFFD in new education Text writes. `education-submit-saga.ts` invokes it for new dry runs and just before signing new operations. It never rewrites payloads or interferes with confirmation/bounty recovery for already-submitted transactions. A runtime exercise accepts valid multilingual UTF-8 and rejects each of the three observed corruption forms. Future builders that reproduce damage must be corrected and their reviewed payload rebuilt.

`education-build-text-encoding-repair.ts` accepts only the eight reviewed IDs, checks each current value still equals the reviewed text, applies the specific punctuation repairs, verifies all numerical tokens are unchanged, and validates the resulting ops. `text-encoding-repair-validation.json` preserves every before/after string. No source-result reanalysis is implied by this copy repair.

## Verified publication

Proposal `75e7cc23e1224872b8db5128d4532e78` executed and is bounty-linked. Main transaction `0x9dfc439df135ff9195fba535fefc2cb790bb7affaabaece6394246d1cd813505`; bounty transaction `0x2659ef4357459626b49818909af58a1c7ba106352b65af9ce2953c77c8953e39`; vote `0xc2a49610f2453e4c0f52b06733c3260486725c9fef73465d5c1950cd30a43199`. All ten batch checks pass for the eight corrected values, execution and bounty.

A fresh full scan completed 101 pages over 5,047 currently indexed Text values and found zero C1 controls, replacement characters or the audited common mojibake patterns (`text-encoding-audit.json`). The increased total is a later graph snapshot, not an assertion that this eight-update repair created three text records. Local strict UTF-8 scans of `scripts/*.ts` and `src/*.ts` now find no invalid bytes or actual C1/replacement characters. TypeScript and the guard exercise pass.

The dedicated general-practice coaching Claim `03cd942d5566419bb39a1608580c6f8a` renders its corrected apostrophe, unchanged 0.068 SD estimate, 0.056 robust SE, 11 effect sizes/five studies, significance qualification and source link. This is one browser example; every changed text value was verified through the API. Historical batch verifiers expecting damaged text are superseded for those values, not rewritten. The original migration ledger remains at 88 verified fields: a punctuation repair does not certify more original source-content mappings.
