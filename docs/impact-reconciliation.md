# DC IMPACT reference correction — 2026-09-12

The pinned `src-026` referenced unrelated NBER working paper w19403. The corrected reference is Dee and Wyckoff's October 2013 **Incentives, Selection, and Teacher Performance: Evidence from IMPACT**, NBER w19529, DOI [10.3386/w19529](https://doi.org/10.3386/w19529). The [official NBER record](https://www.nber.org/papers/w19529) and [paper](https://www.nber.org/system/files/working_papers/w19529/w19529.pdf) establish the authors, version and regression-discontinuity design. Direct web opens returned 403; search recovered the official indexed record/PDF. This is not permission to import the original generic findings or assessment unchanged.

The [DCPS system page](https://dcps.dc.gov/node/976262) establishes the program's 2009 introduction and school-based-personnel scope. The program identity is broader than the paper's teacher threshold comparisons. No finding about principals, universal student achievement gains, trust, or long-run sustainability was published in this batch.

## Published identities and receipts

| Record | Geo ID |
| --- | --- |
| DC IMPACT Initiative | `0ed2e122cee541dc93a075aeca9feace` |
| Corrected 2013 Article | `049614ea288941cabd7aed7bc67bf596` |
| Thomas Dee Person | `1dbcd6ed0592406c860efbdfcf565269` |
| James Wyckoff Person | `58f9b0ff11ab4948a04f5af0712480e7` |

Complete all-space focused title, program-name, person-name and alias searches found no matching identities. The `19529` text search returned six unrelated number/transaction/URL matches; these were not the paper. Evidence is in `impact-discovery.json`, `impact-alias-discovery.json`, and `impact-author-aliases.json`. Each created entity has an explicit type, and the original initiative slug is retained.

Initial proposal `4f4a171bd9e04bda871949d23d667c67` executed, is bounty-linked, and passed 19 operation/governance/bounty checks before the DOI display repair. The immutable payload and registry are in `impact-reference-*`. The original source files remain unchanged; corrected content is in `impact-reconciled-content.json`.

## DOI rendering correction

Browser review showed that Geo rendered the bare DOI `10.3386/w19529` as a link targeting `10.0.13.58/w19529`. Do not follow that malformed link. A Text data type alone does not guarantee sensible link rendering.

The repair stores `https://doi.org/10.3386/w19529` under the same DOI property `7cb59354e30c48119e99ff62fcf61646`. Proposal `5e5da2f747c24aeda1b2cdd9f28161de` executed and is bounty-linked; all three repair checks pass. The builder's content source now uses the full DOI resolver URL. The original submitted payload/journal are preserved, so its bare-DOI expectation is historical; use `education-verify-impact-reference.ts` for the current combined state.

The current-state verifier passes 17 checks covering both descriptions, canonical URLs/DOI, route, four entity types, both author edges and the program's source edge. Browser review confirms the Article heading, concise description, both author links, correct DOI resolver target and NBER URL. The program page confirms its two-sentence description, official DCPS URL, original route slug and Sources link. This certifies these pages only, not other existing DOI links.

## Frontend and remaining work

### Complete destination DOI-link repair

The follow-up audit expanded beyond Article entities to **all entity types** in Education datasets. Fifteen additional Article DOI values were repaired by proposal `0faf6f9daf8a47f39837101ceef529de` (17 indexed checks including execution and bounty). A broader property query then found one remaining bare DOI on the Head Start archive Dataset `3e4404bac6e842b598e0b0a809a4928f`; proposal `e41df26db90c42c3abce00ace18a255d` repaired it (three indexed checks including execution and bounty).

`scripts/education-audit-doi-links.ts` subsequently returned **17 DOI values, zero invalid resolver URLs**, using complete destination-scoped pagination across all entity types. This establishes that every DOI value currently present in this destination has resolver-URL syntax. It does not establish that every source has a DOI, that every DOI is the correct publication version, or that every external publisher is reachable. The earlier Article-only inventory missed the archive record; do not use a type-limited check to certify a property across the whole space.

The Saga Article page was reviewed in the browser and now renders its DOI target as `doi.org/10.1257/aer.20210434`, retaining its original paper URL and Claim backlinks. Combined with the earlier IMPACT review, these are two rendered examples; all 17 stored values were checked through the API. Per-record before/after values and transaction evidence are preserved in `bibliography-doi-links-*`, `remaining-doi-links-*`, and `bibliography-doi-audit.json`.

The prevention fix is `src/education-doi.ts`, called by `education-submit-saga.ts` for new dry-run payloads and immediately before new submission. A runtime check confirmed rejection of a bare DOI and acceptance of its full resolver URL; TypeScript checking passed. It does not silently rewrite operations (which would invalidate payload hashes), and it does not block confirmation/bounty recovery for already-submitted historical payloads. Old builders containing bare DOI constants must be corrected and revalidated before new submissions; historical submitted operation files remain immutable. Their old literal-DOI expectations are superseded by these repair batches, not evidence of lost study content.

Article Authors property: `91a9e2f6e51a48f7997661de8561b690`; program Sources property: `49c5d5e1679a4dbdbfd33f618f227c94`; Route slug: `b0305ef28312c519d954bc0efe22f013`; URL: `412ff593e9154012a43d4c27ec5c68b6`. Read relations/values with the Education datasets perspective `dac259bad48a11adf97fe36857d85206`, with pagination as in the existing handoff. Normalize DOI identity for comparisons by removing an optional `https://doi.org/` prefix; render resolver URLs, not raw number-like strings.

Seven source/program identity, title/name, URL/slug and authorship fields are now reconciled in the ledger (68 verified fields overall). Remaining program category/context, `src-101`, source method/outcome relations, numerical extraction, linked factual/debate Claims and imported assessments are not complete. The original `sourceIds` field still needs its second source. Audit other existing DOI links separately before claiming a global fix.
