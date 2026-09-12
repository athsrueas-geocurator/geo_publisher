# Original education questions — reconciliation, September 12, 2026

## Source and confirmed import defects

The pinned [21-question collection](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/dichotomies.json) is available; its local original is `data/education/source/content/dichotomies.json`. All 21 `dek` values exactly equal `betterQuestion`. Preserve the pinned input unchanged.

The original checkout's `scripts/convert_workbook.py:405–435` resolves representative initiatives with name fragments, then broad keyword/category matching, then **returns the first initiative when no match exists**. Eight original questions link A Nation at Risk, the first initiative. This proves that the fallback can generate an unrelated edge; it does not prove that every one of the eight links took that branch. Lines 546 onward also manufacture reverse links and category-based fallbacks. Every generated question/program edge therefore needs an explicit identity and relevance review before migration.

The same converter constructs `commonMisreadings` and `whatWouldChangeOurMind` from templates and supplies default continuum position/uncertainty values. These are not extracted statistical confidence intervals or personally selected user positions. Do not publish them as such. No source JSON or historical payload has been rewritten to conceal this defect.

## Identity and ontology review

Completed all-space exact searches for 21 question texts, 21 original titles and 21 route slugs found no candidates (`original-question-identity-discovery.json`). An additional 25 complete all-type/all-space alias and collection-identifier searches found three unrelated Claims containing “direct instruction,” about software instructions and politics, not instruction methods (`original-question-alias-discovery.json`). None is the same question. Collection aliases and the pinned source identifier had no matches.

`original-question-model-inspection.json` records all 1,113 Question type edges in the live snapshot, with cursor exhaustion. Education-related candidates included unregistered tutoring-center closure, school closure during a bear sighting, school shootings and AI teacher burnout/replacement. These are different questions from the original 21; the AI candidate asks about burnout/jobs, whereas the original asks about tutoring dosage/capacity while preserving valuable human interaction. This type census complements, rather than replaces, all-type identity discovery.

Canonical Root Question type: `4318a1d2c441455cb76544049c45e6cf`. Root has no Description, so there is no canonical prose definition to claim as verified. The inspected instance names are actual interrogative prompts, consistent with this use. Its suggested schema contains Answers, Topics, Tags and Sources. Answers `73609ae8644c4463a50a90a3ee585746` targets **Answer** `a4fa26b57a4b41559d5cd571519fe527`, not Claim. Do not automatically attach evidence Claims through Answers or reclassify a question as a Claim.

## Bounded publication contract

Preserve `betterQuestion` as Question Name, original contrast `title` as concise Description and `slug` as Route slug (`b0305ef28312c519d954bc0efe22f013`). Name and framing must be read together, since some questions use context-dependent phrases such as “this context.” Preserve the pinned file URL as Web URL and collection provenance. `dek` is an exact alias of the same question text, not a second passage.

Use a Dataset named **Education Initiatives questions**, containing an ordered Questions collection block. Every row is typed Question; none receives Is factual, Agree/Disagree framing or an invented answer. Description and Web URL are ordinary cross-cutting properties; Route slug is a deliberate frontend property beyond the Question type's suggested schema. Types and property data types must be verified during preparation.

This batch carries question text, framing, routes and provenance only. Topic identities, original sourceIds, initiative relationships, philosophical/synthesis passages and assessment fields remain pending review. Source-file provenance does not mean the research papers establish any particular answer. The existing nonfactual-Claim debate graph remains a separate collection; frontend discovery must support Question explicitly rather than treating absence from Claim queries as unpublished data.

Consumer-query correction: an initial independent verifier mistakenly used Dataset entries `d66cd445e09a41809af46d86f083b41c` to traverse the Questions block. This block uses the SDK's **Collection item** relation `a99f9ce12ffa4dac8c61f6310d46064a`. The zero-result assertion was a query defect, not missing data; all 138 payload/index/governance/bounty checks had already passed. Correct the consumer query rather than republishing the collection.

Publication receipts and final consumer/rendering evidence are recorded below when verified.

## Applied and verified

Dataset `b1f70bc05d4e454dab2448a0e3172195`, Questions block `d19cf5813cf9451d9ef7d793c9b7c9d9`. The complete 21-row stable-ID crosswalk is in `data/education/original-questions-batch.json`; persistent edge/relation IDs are in `original-questions-registry.json`.

- Proposal `8251fcde0f104f87bc2c57da72ae802c` executed.
- Main transaction `0x11b2266e89afaea4b268cfb7df2b13368f8ef4020aea3eec424fafcca2025666`.
- Bounty transaction `0x93245963ee75a419fbb2a7f126469fc13f985290e76bc7446f93d4512ead2dfc`.
- Execution vote `0x81116667f9036b65178a73e441d43cbe268e16f74794680f1aa063698c2d36be`.
- `original-questions-index-verification.json`: 138 checks pass, including all values/relations, execution and bounty.
- `original-questions-query-verification.json`: 157 checks pass over five forced five-edge pages, independently comparing all 21 members, original order, text, framing, route, provenance and Question classification against the original file.
- Browser review: all three table pages render the 21 Questions in source order (9/9/3), with their framing column and collection source link. Dedicated Seat time/mastery Question `e67fb8be0ca74c54a148ad318fefbadf` renders the full interrogative, short framing, Question label, route and source URL; screenshot confirms readable layout. No Claim response panel or invented Answer is shown. This verifies the collection and one dedicated page, not all dedicated pages or frontend integration.

The field recorder marks exactly four fields per original question: slug, title (terminal punctuation added), betterQuestion and its identical dek alias. That is 84 original fields, not 84 independent facts or completed research answers. Remaining question fields retain review status.

On 2026-09-12, `bun run education:review-question-relationships` read all 21 published Question entities with complete destination relation pages. Each currently has only its Question type edge (21 total); no Topic, Answer, source, initiative, synthesis or assessment edges were inferred. The machine-readable report is `data/education/original-question-relationship-reconciliation.json` and keeps the pinned source fields beside the live rows for the next source-aware review.
