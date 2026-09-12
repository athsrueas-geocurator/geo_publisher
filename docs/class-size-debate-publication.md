# Krueger–Hanushek class-size debate

## Source and interpretation review — 2026-09-12

The authorized bounded batch adds six attributed interpretive Claims and reuses existing STAR numerical Claims, datasets and Article IDs. It does not recalculate benefits, replace experimental estimates, rank interventions or attribute an editorial position to Thomas.

Read the authors' own passages, not the EPI cover introduction. [Hanushek’s Stanford chapter record](https://hanushek.stanford.edu/publications/evidence-politics-and-class-size-debate) identifies **Evidence, Politics, and the Class Size Debate**, in the 2002 EPI volume, pp. 37–65. The [author-hosted PDF](https://hanushek.stanford.edu/sites/default/files/publications/Hanushek%202002%20ClassSizeDebate.pdf) contains all 111 PDF pages. Through these chapters, zero-based PDF index = printed page + 8. Chapter 2 covers quality at pp. 46–50, STAR at pp. 55–58, policy calculations at pp. 58–60 and conclusions at p. 61. Attribute these to Hanushek's chapter, not the editors or the entire volume.

The initial NBER landing-page read failed with HTTP 403. Search recovered the official [w8875 record](https://www.nber.org/papers/w8875) and [working-paper PDF](https://www.nber.org/papers/w8875.pdf). NBER identifies April 2002 working-paper DOI 10.3386/w8875 and the subsequent 2003 Economic Journal article as separate versions. The existing Geo Article is the latter. Its [readable journal copy](https://classsizematters.org/wp-content/uploads/2011/04/economic-considerations-and-class-size.pdf) was downloaded and checked: masthead, author, 2003 copyright, volume 113 and F34–F63 match the recorded journal source. New Krueger citations use this journal version; no working-paper DOI is substituted on the existing Article.

Reviewed journal passages: Section 1 and Table 2 for study weighting; F59–F60 for interpretation and explicit limits of meta-analysis; F56–F58 for modeled costs/earnings; F58–F59 for caveats; F61 for the qualified economic conclusion. A prose sentence on F58 says “22 to 17” whereas Table 5 and the conclusion specify 22 to 15. The working paper contains the same inconsistency. Do not silently fix the source or build a new 22-to-17 estimate. Existing table-based 22-to-15 values are preserved. The 6.2% return assumes 1% annual real wage growth and projected earnings ages 18–65; it is not an observed lifetime return. The kindergarten percentile-rank estimate is not interchangeable with the economic model’s 0.20-SD inputs.

Local PDF/text evidence is in `data/education/research/class-size-debate/`. PowerShell's legacy output encoding initially failed on a Greek character; `python -X utf8` fixes extraction display without changing source text.

## Identity and relationships

`class-size-debate-discovery.json` records complete cross-space primary-name/alias searches for class size, class-size, Krueger and Hanushek. `class-size-debate-neighborhoods.json` records complete incoming neighborhoods of both existing STAR Articles (20 and 13 edges), plus bounded semantic recall. The latter returned mostly irrelevant lexical matches, so it is not evidence of exhaustive absence. Existing estimate Claims were read individually and are reused. Podcasts-space unrelated candidates are not linked.

`class-size-debate-content.json` holds exact reviewed text, source locators and per-pair decisions at runtime. Six new Claims are interpretive positions, marked nonfactual so their contested judgments invite Agree/Disagree; that classification does not certify either author's reasoning. Existing measured/model Claims retain their factual classification. Authors belong on source Articles, not Claim Authors relations.

Publish Related grouping first, then independently validate stricter argument directions. No Similar/Duplicate edges or artificial mutual opposition: a conditional early-grade economic case is not the logical negation of opposition to uniform reductions. The kindergarten finding also does not refute Hanushek’s extrapolation caution. Supporting edges run from proposition to supporting Claim. Model-return and scenario nodes represent one economic model, not two studies.

## Execution and verification

The Related stage submitted 65 operations as proposal `1d6d6f4890f246c78d60c40cc0783354`, main transaction `0xd65c7a749866b381056775192355ed3607ae2d1a5dfaac3f7c2c43996b6c0eab`, bounty transaction `0x0ef55bd68b4d0eeb7feae9311ab84139dd125e9fec376bcbe48ee94b58f0953a`. Vote `0xd8f499c1fafabb5c0cadcfee9e89d60f1ba8c6b747bab757675317f25f267eae` confirmed and the chain reports executed. The first immediate index verification still returned a missing new entity. This is an indexing delay, not grounds to resubmit. Indexed and rendered acceptance remain pending.

Schema correction during preparation: exact case-insensitive equality uses `StringFilter.isInsensitive`; `equalToInsensitive` is rejected with GraphQL errors even when HTTP status is 200. The inspector now uses the verified field and refreshed the stale Krueger discovery file with the existing Article. Exact official chapter URL/PDF value searches returned no candidates. Stable IDs and submission bytes are preserved in the registry and stage journals; no existing numerical values were edited.

### Verified result (supersedes initial index delay)

Related-stage verification passes all 82 checks. The separately adjudicated argument stage passes eight checks: five Supporting edges and one directional Opposing edge, plus execution and bounty. Its proposal is `0fd68196e44c40adbb6f318561745afc`, main transaction `0xc8084a1cf2dc24b2437bec7df05860dda90d0fde6ef0bb2b217609ad29580c7f`, bounty transaction `0x4951011fcfe5134804c8d886da4bc3e11201f80bf4e0f3c63deedbc1e7960c98`, vote `0x4a091fc30fce16bec91fc7072d08c4c280729081938a2e3ec6754956fad77d64`.

Rendered review caught a pre-existing missing factual flag on the source-reported $15,180/$7,537 scenario: it showed Agree/Disagree. Table 5, F56 was visually checked; the values are correct. A separate one-Checkbox correction sets Is factual=true without changing any number or modeled qualification. Proposal `b51609fd2c164a7c8f42dc028198b192`, main `0x55645805bee8e105fb460cf6f22bba293f4877747004574d8c575fca83abbed6`, bounty `0xb623184bb438abac41d5de0124f9db2e8cd4f4ef33d3352e3242a9ba6fecb41d`, vote `0x2caae0fedc28d70c01a7748967ddb5852884460e0030329dc917366f3b8ee625`; all three checks pass. The generating STAR template now supplies the flag for new scenarios. Other pre-existing scenarios were not included in this correction and still require a classification audit.

### Frontend contract

The corrected scenario initially continued to display its cached Agree/Disagree controls after API verification. A fresh reload rendered Verify/Dispute with the original modeled qualification and citation intact. `class-size-debate-browser-verification.json` records the exact inspected pages and limits; no resubmission was needed for that display lag.

Use `data/education/education-debate-node-query.graphql` against `https://api-testnet.geobrowser.io/graphql`, variables `id`, `space=dac259bad48a11adf97fe36857d85206`, `after=null` initially. Paginate using `relationsConnection.pageInfo.endCursor` while `hasNextPage`; values truncation must also be handled. Scope every value and edge to the destination space. Treat Sources as citation endpoints; use a visited-ID set for Claim traversal.

| Claim key | Stable Geo ID |
| --- | --- |
| Economic case (Krueger) | `44e2a08c02e74fdaaaa6f112e1581fb5` |
| Weighting interpretation (Krueger) | `21388c169ed84bbdbd26f529c390fc54` |
| Study-quality critique (Hanushek) | `c050382dc2614403916342d43d2ef87a` |
| Broad-policy objection (Hanushek) | `2700dd4c50a641658f29fbc176d87f31` |
| Projection-risk objection (Hanushek) | `dc9f8289b4c94ed2b89c3e8f913f6d1e` |
| STAR extrapolation caution (Hanushek) | `4b70147b5e53405590e4534fdd017eca` |

Source Article: Hanushek `03ab7fe708d646adb8ce086ea9e26b02`; reuse Krueger `d70f7e00c8fd4fb2b6a056df6b844b1f`. Shared Topic `4bb85899505a459da17ec72990eab81c` makes the nine Claim nodes discoverable in Geo's Related gallery. It does not assign argument roles.

Related `504e5776788844f6a77dba3ee811d8f0`; Supporting `1dc6a843458848198e7a6e672268f811`; Opposing `4e6ec5d14292498a84e5f607ca1a08ce`; Sources `49c5d5e1679a4dbdbfd33f618f227c94`; source locator Text `84dacbddca6a44079edb5e11a4c66b40`; Is factual Checkbox `da4a6c1f9d4446f9832ff3b49a4400ef`. Support/opposition edges point **from the proposition to its argument**.

The economic parent has two supporters: existing 6.2% return `6db38a6c620f4ca1bc2452137457d686` and existing scenario `b0e661c838de4b8eb406a9c5a82249b1`; its opposing argument is projection risk. The broad-policy parent has quality, projection risk and STAR scope as supporters, without a forced opposing edge. Existing kindergarten finding `7eeddeb79af54141b58e4cffe32d93a5` is Related context. These are nine unique Claims but one STAR experiment and a literature/economic debate, not nine studies or independent votes of evidence.

`education-verify-class-size-debate-query.ts` successfully exercises the frontend query with two-edge pages, checks complete traversal, scope and exact expected role sets, and verifies the repaired factual flag. Reports are `class-size-debate-*-index-verification.json` and `class-size-debate-query-verification.json`. TypeScript passes. Dedicated economic and broad-policy pages render the full short attributed descriptions, citations and Agree/Disagree. Economic gallery pagination exposes reused model/experimental evidence; the Hanushek Article renders chapter/version, author and official Stanford URL. Geo's gallery still does not label support/opposition: the comparison frontend must do that explicitly. This bounded batch is complete at the API level; it does not complete original initiative-field reconciliation or the broader migration.
