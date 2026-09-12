# Research-backed debate Claims

## What had to be fixed to make this work

### Scope correction rule — 2026-09-12

An attractive policy Claim still has to name the evidence boundary that makes it debatable. A title such as “Districts should fund two years of comprehensive teacher induction” can read as a universal recommendation even when its only linked achievement evidence is from a restricted six-district benchmark sample. Likewise, the ABC age-30 findings cannot silently become a claim about early-childhood education in general.

When this occurs, repair the existing nonfactual parent in place: keep the stable ID, factual evidence Claims, sources, and evidence-edge directions; make the title identify the study/result scope; and use the two-sentence header to state the positive evidence and the meaningful limitation. Record the repair in the study notes and handoff. Do not manufacture a new debate node or reframe a null result as proof against the intervention.

Verified September 11, 2026 (local time):

| Symptom | Cause and fix | Evidence |
| --- | --- | --- |
| Research Claims displayed Agree/Disagree like policy opinions. | Publish the existing root **Is factual** Checkbox using SDK `type: 'boolean'`, not Text. Apply true to the four checkable findings and false to the two evaluative parents. This marks checkability, not truth or a verification vote. | `factual-claim-pilot-index-verification.json`: 3 checks pass; actual decoding page changes to Verify/Dispute. Parent pages retain Agree/Disagree. |
| The generic publisher verifier could not validate Checkbox edits. | Add `boolean` to the GraphQL value selection in `scripts/education-verify-saga.ts`; the existing type-based comparison then checks the real boolean. | Pilot passes, and the previous 11-Claim text repair still passes all 24 checks. TypeScript passes. |
| Preparation crashed when testing an unused entity ID. | The API returned `entity: null`, whereas older skill notes expected an empty stub. Handle both null and empty-space stubs; persist allocated IDs before subsequent checks. | Successful repeat preparation produces identical Related-stage payload SHA `e7ab7286ad230558c73137188b127596f725201645249373475c31f7b95827d9`. No transaction was submitted by the failed preparation. |
| Valid Related and argument edges did not show a Related claims gallery. | Geo's current gallery queries **shared Topics in the current space**, not the explicit Related-claims property. Reuse the existing Reading education Topic across spaces and publish six Topics relations in Education datasets. Preserve explicit Related/support/oppose edges for semantic graph queries. | Official source: `apps/web/core/claims/browse/claim-related-claims.tsx`; Topic batch passes 8 checks. Browser page 1 shows four other Claims; page 2 shows the remaining grade-one comprehension Claim, covering all five neighbors. |
| API success alone could overstate usable debate navigation. | Verify the dedicated parent page, its source, response labels and both gallery pages. Keep explicit supporting/opposing visualization as an outstanding comparison-dashboard requirement because Geo's topic gallery does not label those roles. | Related/arguments/Topics batches pass 39/8/8 checks, including execution and bounty links. Both parent texts and the favorable parent's complete five-neighbor gallery were inspected. |

All publication payloads and journals are preserved under `data/education/reading-first-debate-*`; the stable IDs are in `reading-first-debate-registry.json`. No original study estimates were changed. Follow the more detailed sections below for relation directions, source limits and publication IDs.

User direction, 2026-09-11: build high-level Claims worth debating, linked to narrower research Claims that support, challenge or qualify them. Correcting table-row labels is necessary but does not by itself deliver this debate structure.

## Live engagement evidence

Read-only scan at 2026-09-12 00:03 UTC (September 11 locally): 24 complete cursor pages, 2,311 active stance responses across 771 entity/space pairs. Deduplicate by user/entity/space; count objectType=0, voteKind=1, voteType=0 or 1, following the official frontend's response semantics. Top candidates are confirmed Claim-typed. The report retains aggregate counts, not responder identities. Evidence: `data/education/debate-engagement-research.json`; reproducible script: `scripts/education-inspect-debate-engagement.ts`.

These are indexed stance counts, not page views, curation ranking votes, veracity responses, live debate counts, unique people across the whole platform, or proof of claim quality. Claim-space pairs remain separate. Default Featured and All claims ordering is not a pure response-count ranking.

| Example | Agree / disagree | Observation |
| --- | --- | --- |
| [Marriage as the best route to economic security and happiness](https://www.geobrowser.io/space/224406e0de3c48d78ef12774111b8b2f/397927c0ac3b4eed9eb7aa264cda7473) | 10 / 13 | Highest observed total: 23; dedicated page also shows two debates and Related claims. The title bundles several outcomes, which we should avoid copying. |
| [Marriage is not necessary to validate a committed relationship](https://www.geobrowser.io/space/224406e0de3c48d78ef12774111b8b2f/93facb86548441f188bdda1cb26e4641) | 14 / 6 | A clear position on one contested proposition. |
| [AI will replace most jobs soon](https://www.geobrowser.io/space/41e851610e13a19441c4d980f2f2ce6b/acaf35fd8549e3b02904378ae840de8c) | 8 / 12 | High participation; undefined “soon” is a weakness to avoid in research Claims. |
| [Never hold Bitcoin on a sidechain](https://www.geobrowser.io/space/c9f267dcb0d270718c2a3c45a64afd32/0705323efc3f426596dd62f3576640d9) | 8 / 5 in browser | Explicit graph links to three Supporting arguments and two Opposing arguments, plus two sources. Structural example, not an endorsement or independent fact-check of its incident claims. |

The Bitcoin example's fully loaded dedicated browser page showed the proposition, responses, sources, one recorded debate and a paginated Related claims section, but did not expose labeled supporting/opposing sections. Related cards included an opposing policy position (“Cross-chain Bitcoin is worth the bridge risk”) with Agree/Disagree and incident assertions with Verify/Dispute. API relation presence alone therefore does not prove that Geo's current Claim UI displays an argument tree. The comparison frontend must explicitly traverse and render the argument properties; verify its actual output. The marriage example also displayed Related claims.

## Applicable guidance and live schema

Use the user-selected Geo Explorers skills:

- `vendor/geo-skills/skills/non-actionable/ontology-advisor/references/ONTOLOGY.md`, Claim section: self-contained, neutral, one or two sentences, explicit subjects, no author on the abstract Claim. Authors belong to sources/quotes.
- `vendor/geo-skills/skills/actionable/geo-claim-grouping/SKILL.md` and `references/adjudication-rubric.md`: Related grouping first, then independently adjudicate stricter brackets. Its August 12 strict rubric supersedes older broad “Similar” examples retained later in the file. Do not mechanically copy those older examples into current bracket decisions.

Verified schema in `data/education/debate-relation-schema.json`:

| Property | Geo ID | Meaning |
| --- | --- | --- |
| Related claims | `504e5776788844f6a77dba3ee811d8f0` | Same broader issue; does not assert evidential support. |
| Supporting arguments | `1dc6a843458848198e7a6e672268f811` | Edge FROM the supported proposition TO its supporting Claim. |
| Opposing arguments | `4e6ec5d14292498a84e5f607ca1a08ce` | Edge FROM the challenged proposition TO the rebutting Claim; mirror only for genuinely mutual opposition. |
| Is factual | `da4a6c1f9d4446f9832ff3b49a4400ef` | Checkbox: evidence-checkable, not necessarily true. |

Official frontend [response-kind implementation](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/claims/response-kind.ts) reads Is factual per space to choose Verify/Dispute versus Agree/Disagree. [Response semantics](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/responses/entity-response.ts) distinguish curation=0, stance=1, veracity=2. [Summary implementation](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/responses/claim-response-summaries.ts) deduplicates active responses. These source observations do not establish a live factual-flag rendering pilot; that remains required before a bulk migration.

## Proposed education structure

Three levels, reusing existing Geo entities:

1. **Debate proposition:** a clear, consequential and bounded assertion. Policy/value judgments are labeled as such; do not present an editorial synthesis as the authors' recommendation.
2. **Evidence or counterargument Claims:** individually intelligible, cited assertions. Explain why each bears on the parent. A caveat goes under Opposing only if it actually challenges that parent's proposition; otherwise use Related claims or explanatory context.
3. **Study estimates and sources:** exact published numbers, units, uncertainty, population, period and locators. Link existing estimate Claims, Study, Article and Dataset IDs. Do not create copies merely to fit this tree.

Draft propositions for user review (not yet published or identity-cleared):

| Draft parent | Supporting evidence already in Geo | Challenges and limits |
| --- | --- | --- |
| **Public schools should offer intensive tutoring to students struggling with high-school math.** | Saga's two randomized Chicago studies found math-score/course improvements. Link distinct study-level arguments, then their existing ITT/TOT records. | Reach, staffing, nominal cost per available slot, and evidence for durable benefits constrain a policy recommendation. No claim of superiority to every alternative; first-year results do not establish graduation or earnings effects. |
| **Governments should increase school spending to reduce intergenerational poverty.** | JJP's reform-based estimates support better adult outcomes, particularly in its source-defined low-income group. | Identification/generalizability and the unreconciled cost illustration constrain the policy inference. A nonsignificant nonpoor coefficient does not refute a low-income effect or establish subgroup-effect differences by itself. |
| **Reading First's decoding gains justify treating the program as an educational success.** | The grade-one spring-2007 decoding gain and improvements in instruction are distinct evidence Claims. | No statistically significant comprehension effects in grades 1–3 directly challenge a broad success judgment. The judgment depends on the outcomes and costs prioritized; no matched program-cost comparison is established. |

The Reading First pair offers the cleanest initial debate pilot: a genuine interpretation disagreement about a measured benefit versus an unmet central outcome. A possible opposing proposition is **Reading First's lack of demonstrated comprehension gains outweighs its decoding gains when judging the program's success.** Both are explicit evaluative positions; neither is falsely attributed to the report. “No statistically significant effect” must not become “proved no effect.”

Use one study-level argument per distinct finding before exposing its alternative statistical representations. ITT/TOT, native/SD forms and multiple model specifications are not independent replications. Never manufacture opposition or add unrelated links to meet a density target. Popularity informs presentation, not the strength or truth of evidence.

## Next publication and dashboard work

### Verified dashboard read contract

`data/education/education-debate-node-query.graphql` is a tested, variables-first query for a Claim's destination-space values and its Related/support/opposition/source edges. `scripts/education-verify-debate-query.ts` traverses the live graph with a visited-ID set, keeping source Articles as citation endpoints. It forces two-edge cursor pages to exercise pagination, rejects truncated values, and checks edge provenance. The 2026-09-11 run passes 109 checks over six unique Claims and 17 relation pages (`education-debate-query-verification.json`).

Independent expectations check the favorable parent's one decoding supporter, the stricter parent's three comprehension supporters, two mutual opposing edges, five Related neighbors per parent, original report citation for every Claim, false factual flags on both evaluative parents, true flags on all four evidence Claims, and exact estimate/SE/CI from the reviewed source extraction. Evidence Claims have no reverse support/opposition edges. These are six graph nodes, not six independent studies; shared nodes and cycles must not inflate counts. The check proves this read contract, not dashboard rendering or the full education migration.

The model file's original “not yet submitted” status describes preparation history. The executed journals and live verification reports above establish current publication status; do not rebuild historical submitted payloads to update that label.

### First debate publication

Topic follow-up passes all eight checks. A complete live Topic-filter query returns exactly the six intended Claim IDs, with no further page. The refreshed favorable parent now displays Reading education and a paginated Related claims gallery: decoding and comprehension evidence cards use Verify/Dispute; the opposing evaluative parent uses Agree/Disagree. This verifies discoverability in Geo, while labeled supporting/opposing navigation remains a separate dashboard requirement.

Follow-up: Related-stage verification passes all 39 checks. Both dedicated parent pages render the full proposition, concise evaluative description, Agree/Disagree and the report link. The argument stage was separately re-adjudicated in `reading-first-debate-argument-review.json`, then published/executed as `285cea7fa50b4ff3ab297899b9b52b23`; all eight checks pass for four Supporting and two mutual Opposing edges plus execution/bounty. Main transaction `0xcd48d254627ad91df83cc9053780132938afc2766a08e68a8fd2ead5a07d8d46`; bounty transaction `0x47f26af14ca33ce1b9ae7e232e1137bf2e3936242aa25a07154d5efc805a164e`.

Rendering diagnosis: the official `apps/web/core/claims/browse/claim-related-claims.tsx` queries shared Topics (`806d52bc27e94c9193c057978b093351`) in the current space, not explicit Related claims edges. This explains why our valid Related links did not appear in that section. It also corrects any inference that the observed Related gallery proves explicit argument/Related-edge rendering. Reuse the existing Reading education Topic `4401d523f6c542d5b20020cf4a6cac50` across spaces; do not duplicate it or change its home-space facts. The six Topic relations are published/executed in `6ab736f9bb4c4549bb9e8143245641e0`, with main transaction `0xc1eb87e407d29d86799a8ad17f9eedfeb696d6c9db9b3e470adf8d39f99e63d9` and bounty transaction `0x290593582c93221d511c589e8b167a0277828dcb12c71ae95f2f05d5fdac032a`. Verify indexed/topic-gallery behavior separately; our dashboard must still label explicit evidence edges.

The Related-stage batch now has an executed chain proposal `c41cc28b337b4856bcd5c900cbf200f4`: 33 operations, including two typed evaluative parents, three factual flags on existing comprehension Claims, source/study/dataset context and 18 Related-claims edges. Parent IDs: favorable judgment `9c24572fc9ca4650a056bbb0c16c36fa`; comprehension-required judgment `8a6617309f7343d9994ceee76c0c550d`. Main transaction `0x7d4e77951074b5542f4e3b824cf328cea5bf20f5fab0559c86df350739b99264`; bounty transaction `0x9f04b59b9a603c02ee8e0b180022b12b5e6bf02236fe39b34b0abf48769edaaf`. Indexed/rendered verification is still required before the argument stage. Builder: `scripts/education-build-reading-first-debate.ts`; persistent registry: `reading-first-debate-registry.json`.

API discovery correction: a fresh random ID returned `entity: null` on September 11, contrary to the grouping skill's older statement that every absent ID returns a stub. Absence/liveness checks must handle both null and empty-space stubs. This builder now does; failed preparation did not publish anything. Repeated successful preparation produced the same payload hash `e7ab7286ad230558c73137188b127596f725201645249373475c31f7b95827d9`.

`reading-first-debate-model.json` now records two evaluative parent Claims, four reused native-unit evidence Claims and nine pair-level decisions. The parent positions disagree about whether decoding gains suffice for a success judgment; neither falsely attributes that judgment to the report. Three comprehension findings support the stricter evaluation argument, while decoding supports the more favorable evaluation. Findings acknowledged by the other parent remain Related-only rather than being forced into opposition. Parent-to-parent opposition is mutual. These are reviewed model decisions, not yet published brackets; re-adjudicate at step 2 after Related grouping is verified.

`reading-first-debate-discovery.json` completes the Article's 68 incoming relations and Study's 67 incoming relations across spaces. Their 63 unique Claim neighbors all match existing estimate IDs in the Reading First registry. Two bounded semantic searches returned program/topic/instructional-estimate candidates and no matching evaluative parents; the search cap is explicitly recorded and is not a proof of universal absence. Combined with the complete Reading First name search, this supports preparing new parent identities subject to final exact-name checks. `education-discover-reading-first-debate.ts` reproduces the investigation; TypeScript checks pass.

### Identity and factual-flag pilot follow-up

The first complete cross-space/all-type name searches are saved in `debate-proposition-discovery.json`: Reading First 85 candidates, tutoring 89, school spending 1, school funding 7, intergenerational poverty 0. These are per-query counts, not deduplicated totals. The Reading First external hit is “Reading firsthand…” and unrelated. Tutoring includes distinct general-learning, AI and news assertions; none of the listed external Claims is identical to the draft high-school policy proposition. These searches do not prove absence under other wording; source-neighborhood and semantic review remain required before new parent IDs are minted.

Several general tutoring candidates reside in Podcasts. The grouping skill explicitly excludes linking that space; no links or modifications were made there. They remain recorded as identity candidates, not silently treated as absent or automatically copied into this dataset.

SDK 0.20.3 and the publishing skill map Checkbox to `{type: 'boolean', value: true}`. The generic education verifier previously omitted `boolean` from its read selection, so it could not verify such operations; the selection now includes that field. The pilot builder validates the live Checkbox schema, existing Claim type, unchanged reviewed title/description, and absence of an existing destination classification before emitting exactly one boolean set.

Pilot proposal `a573e453c0644825b43a1aabe2ef3422` was submitted and executed for existing Reading First decoding Claim `09e38f2ef30241cb98a66ec75ac28c37`. Main transaction `0x159a91d461a9d3476c33dc539c8735e9dd0f3a817060dfac337fb88e735ca01d`; bounty transaction `0xa5dff9a74023e0077debb737e53cf024e09eee7d7a283a9cb6d3e1b43b18f992`. Payload/model/builder use prefix `factual-claim-pilot`. All three indexed checks pass (boolean value, execution, bounty link). The fresh dedicated Claim page displays “Be the first to verify this claim” and Verify/Dispute controls, with the exact estimate, uncertainty and original Article still visible. This verifies the pilot in the actual Geo UI. It classifies the assertion as checkable, not as community-verified truth; no response vote was cast.

- Discover parent and intermediate Claims across all spaces by meaning, variants and sources; reuse existing IDs where identity is established.
- Review each proposed edge with both complete assertions and source evidence. Persist pair-level rationale, direction, confidence and supporting source locations.
- Verify the Claim factual flag with the installed SDK Checkbox mapping and a dedicated-page pilot; maintain policy/factual distinctions rather than marking every Claim identically.
- Add Related grouping using stable relation/edge IDs; then publish adjudicated support/opposition relations via the existing publisher and bounty-link logic. Preserve all current numeric facts and historical payloads.
- The frontend should show the proposition, support/challenges, source strength and limitations, then expandable study rows. Traverse shared Claims as a graph with cycle protection, not duplicate tree leaves counted as new evidence.
- Verify indexed edges and rendered navigation, including cross-space reuse and source links. Existing table verification does not satisfy this acceptance condition.

The full education migration, additional study coverage, costs and comparison-dashboard requirements remain active. This debate design adds a missing layer; it does not replace those deliverables.
# Instruction-based Reading First success debate — 2026-09-12 UTC

Final browser check (tab 76): the parent gallery now visibly includes grade-2 explicit instruction (+3.00 percentage points), the uncertain grade-2 print result (-4.75 points), and instructional-time gains of 9.79 and 6.92 minutes in grades 2 and 1. Cards use Verify/Dispute while the parent uses Agree/Disagree. This verifies discovery of the factual layer after Topic publication; the gallery does not label each card as supporting or opposing. Tab 75 separately verifies the grade-1 factual Claim's body, SE/CI/p-value and source. The full 12-case numeric/filter verifier still passes after the 52 copy repairs.

Evidence Topic follow-up applied: proposal `c03b744adb6b44e19e166d02c2b350f2`, all seven checks pass including execution and bounty indexing. Main transaction `0x36b1282206afc6afb804af644c3ecb4320c564d5a256e932cd5720be8c15cd32`; bounty `0x12764cf765fcfe09c83f911d0a09d0dd98eb1c50fd919f327feefb2ca4c70e6e`; execution vote `0x64e6b8c33847ddf661c4cc1a4581bd91a84e035b6c567fe4a1c270f7c1870a34`. The five evidence Claims now share Reading education with the parent. Topic membership supplies gallery discovery; explicit supporting/opposing edge verification is in the separate 29-check parent report.

Applied: parent `6feeeb9296154505b404e3f61b4ada04`, proposal `b3970a2c1dd24bddacbe21b9d76d2c34`, 29 passing operation checks including executed proposal and indexed bounty. Main transaction `0xbe21afe7a0e2382129a0d592614093f0cc00314d9de4b05776f2ece047a2f56f`; bounty `0xd0953fa7703bc358d26a0975e632181dffa54ab3d5d65e8195555fe9d13b8561`; execution vote `0xdca1cbe7371e96fa1749ef06c72c70d3c11aeec8cbfef32486d490d848765c01`. Browser tab 74 confirms the actual evaluative title/description, Agree/Disagree, Article source and neighboring success Claims. The graph has three Supporting arguments and reciprocal opposition with the comprehension-required parent; Related-only print results remain unclassified as opposing arguments.

Rendering follow-up reproduces the Topic requirement: direct supporting/related relations alone did not put the five new evidence Claims in the page's Topic-based gallery. `education-build-reading-first-debate-evidence-topics.ts` adds the existing Reading education Topic to those five existing facts, checking complete current Topic relations first. This is discovery metadata, not a change in argumentative direction; the dashboard must use Supporting/Opposing properties for those labels, not infer them from the gallery.

User explicitly requested attractive debatable Claims linked to factual evidence during the Claim-repair pass. New proposed evaluative Claim: “Reading First's improvements in teaching justify judging the program successful.” Its description identifies the success criterion as an evaluative position, not the report's conclusion. Existing comprehension-required and decoding-sufficient Claims are reused as neighbors, not duplicated.

Model `data/education/reading-first-teaching-debate-model.json` records pair-specific reasoning: observed instructional-time improvements in grades 1/2 and grade-2 explicit instruction support the teaching-benefit premise; nonsignificant print-engagement estimates are Related-only qualifications. The comprehension-required parent opposes this sufficiency criterion in both directions. The decoding-based parent is Related-only as an alternative rationale. Supporting facts inform the judgment without logically establishing it, and the three facts share one evaluation. Only native representations are linked as evidence to avoid double-counting paired SD forms. The new parent has Is factual=false for Agree/Disagree; repaired research facts have true for Verify/Dispute. Topic, source, Study and Dataset links supply discovery and context.
