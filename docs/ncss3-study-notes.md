# National Charter School Study III evidence notes

Primary source retrieved 2026-09-12: CREDO at Stanford University’s official June 2023 release for *As a Matter of Fact: National Charter School Study III*. The report analyzes matched student-growth comparisons using student- and school-level administrative data from 29 states, Washington, D.C., and New York City, for school years 2014–15 through 2018–19. It is not a randomized charter-admission study.

The release reports 16 additional days of reading learning and six additional days of math learning per school year for charter students relative to matched traditional-public-school peers. CMO-affiliated schools report 27 additional reading days and 23 additional math days; stand-alone charter schools report 10 additional reading days and equivalent math progress. The source also reports that special-education students in charter schools have smaller learning gains than matched peers, but does not give a numeric day estimate in the release.

Heterogeneity is central: across the 31 data jurisdictions, the gap between the best and worst results is 109 reading days and 120 math days. At the school level, 36% of charter schools have stronger annual gains in both reading and math, while 17% have weaker reading gains and 25% have weaker math gains. These are descriptive summary rows from the matched-growth study, not independent intervention trials.

For Geo, retain the unit as additional days of learning per school year relative to matched traditional-public-school peers, the 2014–15 to 2018–19 window, the 31-jurisdiction context, and the distinction between sector, CMO, and stand-alone results. A parent debate should ask whether charter expansion is justified, with aggregate days as support and special-education/heterogeneity findings as challenge and context. Do not turn matched estimates into a universal causal claim.

## Geo publication record

The linked charter-expansion package is proposal `9df59211cbe24675b8fe70050e55ae3c`, bounty transaction `0x7aeef436b82acd38ab2082c4af98bc85a25280bc889fb2ac11ad1d3a2976c07d`, and Fast Path vote `0xa5c0c08131a3760c2995a48f20bb2a93134fa3cbfdadd12d6c49f6975a273180`. It adds a nonfactual expansion Claim, linked national and sector matched-growth Claims as support, linked jurisdictional spreads as opposing evidence, and the source-backed nonnumeric special-education qualification as opposing evidence. The package does not recast any matched-growth result as random-assignment evidence.

Collection follow-up: `bun run education:discover-ncss3-collection` performs a complete paginated all-space title search and incoming `Collection-item` checks for the seven factual Claims in the evidence package. Its output is `data/education/ncss3-collection-discovery.json`; treat the result as a planning input, not proof that a collection is absent or permission to publish.

The shared prepare-only build now succeeds with `bun run education:prepare-ncss3-collection` followed by `education:build-collection`, producing `data/education/ncss3-collection-batch.json` with 23 operations and seven reused Claims. The preparation script repairs legacy Windows-1252 punctuation before comparing headers to live Geo values; no C1 controls are carried into the draft. Publication and governance remain pending.
