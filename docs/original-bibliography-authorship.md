# Original bibliography authorship reconciliation

## Structured coaching-method follow-up — September 12

Live scoped Article inspection confirms the NCLB and coaching descriptions already identify the correct studies. No misleading pre-NCLB finding or RCT label was found on these Article records, so do not rewrite their descriptions as if repairing a published error. The errors remain in the pinned import.

The [NBER w15531 record](https://www.nber.org/papers/w15531) identifies a November 2009 working paper using comparative interrupted time series to estimate NCLB effects. A 2011 journal version is separately listed; its year is not the working paper's year. The [Brown coaching record](https://annenberg.brown.edu/publications/effect-teacher-coaching-instruction-and-achievement-meta-analysis-causal-evidence) identifies the 2018 Review of Educational Research paper, DOI `10.3102/0034654318759268`, synthesizing 60 causal studies. Source identity does not validate either imported finding/method mismatch.

`bibliography-method-inspection.json` contains complete all-space/all-type substring discovery for Meta-analysis, Meta analysis and Comparative interrupted time series. Initial capped discovery correctly stopped on a further page; the script now exhausts cursors rather than assuming no additional candidates. Reuse Health's Meta-analysis `fd48f57b65f44436b393d448eca5d5bd`, typed Study category, for research-method categorization. Another same-named entity `dcd5d4f5649e4f7b85295963033fb104` is typed Evidence in another space; the Health category is the closer semantic match. Do not alter either home space.

The follow-up adds the DOI property to the existing coaching Article `6a85813ac8734141b55affa06793661c` (the same resolver URL already existed as Web URL) and uses the established Study design relation `b1fdc75afb6841a18d8286427099ea44` to the reused category. This is an intentional cross-cutting method property on the Article describing its analysis, beyond the Article's ordinary bibliography fields; it is not an intervention-delivery Methods edge. The relation entity carries concise scope and a Sources link back to the Article. It does not relabel the program or each constituent study a meta-analysis.

Builder/journal/verification artifacts use `coaching-bibliography-method`. Original src-023's RCT value remains rejected, not silently converted into a verified verbatim import field.

Follow-up proposal `9c47393060d14fc3b53c4ea1ffed885a` executed and bounty indexed; all six batch checks pass. Main transaction `0xa7885160d1d60dfc358083f80836ccdd191dbadfeea56d2ff629580a668c8989`, bounty `0xc170f3d3d37154a96714f6c3a3787a83335ef8c1801241f7a5a273ea37353ec6`, vote `0x75ba5ec78f1fb1d463b6f10c0c7b6e2f59bd9d2ba761545ad3d28ac33469d74b`. The Article page visibly shows all three authors, correct DOI links and Study design → Meta-analysis; its existing description and finding backlinks remain. Relation scope is indexed and verified but not shown inline on the Article page: frontend readers must fetch `relation.entityId` values and Sources, as with Reading First's scoped method links. Typecheck passes. The original-field ledger remains at 172 verified fields; this adds graph metadata without falsely certifying the wrong original RCT label.

## Source review — 2026-09-12

Five existing Article identities cover six original source rows: src-003, src-060, src-068, src-080, src-088 and src-093. The two tutoring rows intentionally share one paper. All five lacked destination-space Authors relations in a complete live read. The original `authors` field sometimes contains a web domain or “and colleagues”; these placeholders must not become Person names.

The reviewed bylines and version-specific citations are stored in `data/education/original-bibliography-authors-content.json`, sourced from the official NBER w15531/w27476 records, IES's EWIMS report record, Vanderbilt's 2018 journal PDF, and Brown's coaching article record. NBER w27476 returned HTTP 403 on direct web read; search recovered the official record and its linked PDF with the same title, authors and working-paper number. No publication version or DOI was changed.

Complete cross-space name-token searches allow middle initials and inspect all types. They found the existing Thomas Dee Person from the IMPACT publication, which is reused. The Brian/Jacob result is an unrelated co-mention in a company Claim; Faria substring results concern a Rastafarian news story and image. Neither is an author candidate. No matching Persons were found for the remaining 17 names. The batch creates those byline identities and 18 ordered author links, preserving all five existing source IDs. These are bibliography authors, not outreach contacts; no contact details are imported.

## Additional source-content errors exposed

NBER w15531 concerns the effect of **NCLB**, using comparisons with states' prior accountability systems. The imported src-003 finding describes **pre-NCLB accountability** and cannot be certified from this citation. Bibliographic identity acceptance never certified that finding. Keep the original initiative-3 finding/source association under review.

The official NBER landing page identifies w15531 as *The Impact of No Child Left Behind on Student Achievement* by Thomas Dee and Brian Jacob, a 2009 working paper: https://www.nber.org/papers/w15531. This supports the Article identity and a difference-in-differences design, but it does not by itself validate the imported wording about pre-NCLB effects; that claim remains held pending a source-specific comparison.

The original src-033 method says “Lottery,” while the existing CREDO Article is explicitly a matched-growth analysis. Do not import that method label or certify it from the bibliography match. Review the original methodology and its exact source before publishing method links. These errors are in the pinned original input; do not overwrite the input to hide them.

The CREDO National Charter School Study III materials describe comparisons of charter students with matched traditional-public-school students using the Virtual Control Record approach, rather than an admissions-lottery experiment: https://credo.stanford.edu/research-reports/charter-studies/ and https://credo.stanford.edu/expertise/credo-methodologies/. This confirms the imported `Lottery` method is incompatible with the identified CREDO source. Keep the method field held until the exact study version and a corrected mapping are reviewed.

## Publication and read contract

Proposal `87ae5726383d4cd59d4db34e7ff066cd` executed and its bounty is indexed. Main transaction `0x811892ec9d894d0d01458d5d036c5a317c611a7ec7852845aeaeba4726181826`; bounty transaction `0x64cceadae1bf4fad6d031c3e9c40e96ec58e3ca90ef319518f7210d5c5a7a104`. Immutable operations, registry and journal use the `original-bibliography-authors` prefix under `data/education/`.

The batch verifier passes all 54 checks. Vote transaction `0xe428a2b6ddc55f4b0d75339f5a9758c5aac213aa139aa1c615fe68747826638c` confirmed. The consumer query in `original-bibliography-authors-query-verification.json` independently reads all 18 links over 11 two-edge pages, checks exact bylines and source order, and rejects truncated pages. Use Article `entity(id).relations`, filter `typeId=91a9e2f6e51a48f7997661de8561b690` and `spaceId=dac259bad48a11adf97fe36857d85206`; paginate with `after`, then sort by `position`. Each result supplies `toEntityId` and `toEntity.name`. Keep the paper-version identity on the Article, not the author.

Rendered EWIMS Article review shows all seven linked author names in source order, its original concise description, official IES URL and existing program/finding backlinks. This is a rendered check for EWIMS, with full API verification for all five Articles; it is not a claim that every Article page was visually inspected. TypeScript passes.

Only the six `authors` fields were marked existing-and-readable in `original-field-reconciliation.json`, bringing its verified count to 74 of 2,772 fields. Year/method/finding/caveat/assessment fields retain their independent status. The NCLB finding mismatch and CREDO method concern are recorded directly on their unresolved fields. The old rating matrix remains unavailable.

CREDO's NCSS3 digital report timed out; search recovered the official general methodology page and older report appendices. Those older versions are not substitutes for the 2023 methods, so no new CREDO method assertion or edge was published during this pass.
