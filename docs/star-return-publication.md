# STAR modeled return publication

All three Table 5 annual real internal returns are applied in the [existing economic dataset](https://www.geobrowser.io/space/dac259bad48a11adf97fe36857d85206/4874a8385a594633ab244f47889f9cab), verified 2026-09-11. This completes its 15 sensitivity scenarios plus three return rows; the eight measured experimental outcomes remain a separate dataset.

| Annual real wage growth | Annual real IRR | Geo entity |
| --- | --- | --- |
| 0% | 5.2% | `3e69566289c14f80b6fb19a84a0300e4` |
| 1% | 6.2% | `6db38a6c620f4ca1bc2452137457d686` |
| 2% | 7.3% | `cc14cee1099d4271841287a2455d9045` |

`scripts/education-build-star-returns.ts` reads the extraction at runtime, reuses the IRR and wage-growth properties, verifies declared types and fractional-percentage formats, preserves stable IDs and refuses to overwrite journaled batches. The source table was visually rechecked at F56/PDF page 23. A complete IRR-property value probe found no prior rows before the pilot; exact cross-space row-name checks found no conflicting identities.

The new table `8676d367bcf14892944f14a22d273053` follows the scenarios and precedes its interpretation and shared methods blocks. These are modeled returns under related assumptions, not observed investments, independent experiments or confidence bounds. No cost or benefit amount is imputed at the internal rate.

## Execution and verification

- Pilot proposal `a695203a9248447c87a5e5dfb5f0a8fa`: 17 operations, executed and bounty-linked. Transaction/CID/vote evidence is in `data/education/star-returns-pilot-publication.json`; all 24 API checks pass.
- Remaining-two proposal `969cf9d7fd8e4739b7895441f51deef2`: 10 operations, executed and bounty-linked. Evidence is in `data/education/star-returns-remaining-publication.json`; all 22 API checks pass.
- Both verifiers cover all batch values, exact relation and relation-entity IDs, endpoints, positions, executed proposals and indexed bounty links. Reports use the same prefixes with `-index-verification.json`.
- `star-returns-full-visual.json` confirms the three rows render as 5.2%, 6.2%, 7.3% in ascending wage-growth order from stored fractions.
- The pilot also sets Price year Format to `group-off precision-integer` in Education datasets. All nine scenario rows on the first browser page display `1998`; stored integer values are unchanged. This resolves the grouping issue.
- TypeScript checking passes. The refreshed description audit covers 102 published descriptions with no review flags.

The full bounty, migration and comparison-dashboard contract remain open. This publication does not establish cross-program cost-effectiveness comparability or accepted bounty credit.

## Claim-copy repair — 2026-09-12 UTC

The three modeled-return Claims now state the actual source values in their titles: 5.2% at 0% assumed real wage growth, 6.2% at 1%, and 7.3% at 2%. Their one-sentence descriptions preserve the projected age-18–65 earnings horizon and make clear that these are author-model calculations, not observed investment returns or confidence bounds. The Decimal IRR/growth values, sources, dataset links and stable entity IDs were preserved; **Is factual** is now set for Verify/Dispute treatment.

The follow-up audit on 2026-09-12 read all 15 scenario Claims completely: one already had `Is factual=true`, while 14 had no flag. `bun run education:prepare-star-economic-factual-repair` prepared a 14-operation additive delta (hash `af314bf271bf71dc46b036914a18b2e395741dbfcea7516e6eb92b4cd173add0`) that sets only the missing flags; names, descriptions, modeled numbers and relations are unchanged. The delta is unsigned while publication is paused.

Proposal `706b634e17694c3081d02452c70667b4` executed. Main transaction `0xbb0e0e21e0bae59481dd234b9741e96b5ebd4ae24383ba1f5776ac7a2d90d43e`, bounty transaction `0x7fe671d92cdbd8217a366dbf3ace8c5cecf969262cf5f170c5703fc1bf6af91f`, and vote `0xc083a270c3a40cde335bfaa987bd10bf68401ec9cb736ee3b3d425da7b713156` are confirmed. The batch passes 11 indexed checks. The live readability audit drops from 21 to 18 heuristic candidates; those remaining candidates require individual source review rather than automatic rewriting.
