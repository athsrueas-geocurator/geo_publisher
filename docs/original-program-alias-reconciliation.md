# Original program aliases and routes

## Review — 2026-09-12

The registry-based audit reads all destination values and relations for 31 known program/initiative IDs, with complete pagination (`published-program-reconciliation-audit.json`). It is not an all-Geo census or permission to create anything absent. An initial HTTP 503 with non-JSON content aborted the read; a later read succeeded. The failure was not interpreted as entity absence.

Three original rows match existing program identities despite different names: teacher coaching (22), Tennessee Voluntary Pre-K (45), and Community Eligibility Provision (72). Their existing descriptions retain evidence limits. `original-program-alias-review.json` records exact IDs, names and identity rationales. Only the missing Route slug Text values are published; no entities, source results or broader program claims are recreated.

Five candidates remain held for program/study scope: Saga-style/tech-infused tutoring, Gates-funded small high schools/NYC, Early College's national network, alternative-route teacher pipelines and charter schools overall. Their candidate IDs are retained in the crosswalk so they cannot be mistaken for undiscovered absences. Exact names alone do not settle these distinctions.

## Teacher-coaching bibliography alias

Original src-023 uses [Brown's institutional publication record](https://annenberg.brown.edu/publications/effect-teacher-coaching-instruction-and-achievement-meta-analysis-causal-evidence), a shortened title and an institutional author placeholder. That record identifies the same Kraft/Blazar/Hogan 2018 article, journal, pages and DOI as src-088 and existing Geo Article `6a85813ac8734141b55affa06793661c`. Its canonical DOI URL and the newly restored three-author byline are reused.

Consequently, initiative 22's complete `sourceIds=[src-023,src-088]` resolves to **one** existing Sources edge. Do not publish another article or another evidence link just because the original has two citations. The imported src-023 method label “RCT” is not accepted: the paper is a meta-analysis of causal evaluations, not one trial. Findings and assessment fields remain separate review work.

## Publication

Three-route proposal `c53bcf510ebf4a30a4b1d07724cf0f9e` executed. Main transaction `0x7fbe2ab65dbf59cdcca28af3fd4ab96d64f11595e490598d789df4d72ba2a05d`; bounty transaction `0x77d02d1edf859a0d69367006554d0641fdf392770ca75ef05ecf46835d68079e`; vote `0x0669da564fb9c04d2210345ccaa8391358129121a79ebd62b1ea7491aec73b58`. All five batch checks pass, including executed proposal and indexed bounty. The current-state recorder verifies the three names/routes, coaching DOI, complete ordered author list and program source edge before marking 14 fields reconciled (88 total).

Rendered teacher-coaching program review confirms the exact `teacher-coaching` slug, preserved concise scope, DOI URL and existing Sources relation. Other routes were checked through the API. The page's backlinks also show a replacement glyph in an existing general-practice Claim title; this is a separate encoding-review candidate, not introduced by the route update and not certified by this pass. Inspect stored text against source copy before any correction. No broader claim-copy or frontend-route behavior certification is implied by this program-page check. TypeScript passes.

Route property `b0305ef28312c519d954bc0efe22f013`; Sources `49c5d5e1679a4dbdbfd33f618f227c94`. Read values/edges in space `dac259bad48a11adf97fe36857d85206`. Existing names remain canonical; the routes preserve the original frontend slugs.
