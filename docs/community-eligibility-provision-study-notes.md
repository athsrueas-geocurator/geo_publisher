# Community Eligibility Provision study notes

Primary manuscript downloaded and extracted on 2026-09-12: Marcus and Yewell, *The Effect of Free School Meals on Household Food Purchases: Evidence from the Community Eligibility Provision*. The source is the author-hosted final manuscript at `https://michellemmarcus.com/wp-content/uploads/2022/06/jhe_final_manuscript.pdf`; the catalog points to NBER working paper 29395 and the published Journal of Health Economics version.

The study uses variation in CEP adoption/exposure with household grocery-purchase and CPS food-security data. It estimates household food-purchase and food-security outcomes, not test scores, attendance, school discipline, or an individual student's causal outcome.

Table 3 gives the exact grocery-purchase estimates. For the binary post-exposure specification, the all-food coefficient is -$10.65 per household per month (SE $1.457; N=4,498,537; 5.17% of the $206.07 mean). For the continuous zero-to-100% overall-exposure contrast, it is -$38.76 (SE $11.54; N=4,369,278; 18.80% of the $206.19 mean). The source should never display those alternate exposure definitions as separate program replications.

Table 8 reports a -2.11-percentage-point effect on the study's food-insecure-household indicator after CEP exposure (SE 0.581 percentage points; N=569,293; p<.01); its reference mean is 45%. The abstract's “almost 5%” is the relative change from that particular mean, not a universal percentage-point effect. The full-exposure contrast is -12.3 percentage points (SE 3.08; N=569,288) and must remain separately labeled.

## Planned Geo representation

Create one Article, one Community Eligibility Provision Initiative, and separate factual Claims for the any-exposure grocery-spending estimate, full-exposure contrast, and food-insecurity result. Use source-specific exposure and outcome units, sample/locator information only after Table 3 and the food-security table are transcribed exactly, and a nonfactual parent about expanding universal free school meals. Link food-security and household-resource evidence to the parent without claiming academic effects or an independent study per outcome.

## Published Geo family

Article `de88c706c7644e9a8681c221d5c2536e`, Initiative `327eef80a0dd423f846fbd50def5bf87`, and the three factual Claims (`9b60b79a061f4931a20aa6147d1bed1e`, `88e3660656e74b14bb0c209134b69a41`, and `e2319933570f466ab02023b00c288464`) are indexed in Education datasets. The evidence proposal `c5867b5c102c46cf975c295b3252ac87`, its transaction `0xb525168d73add5bf3a8f465496bc6050ddc0c456a1395ce10e01af9e9e491fd3`, bounty transaction `0xea53a172f5c4c4260784083b3209c299f54bb2971e6f92fddae20af5d934b6b7`, and Fast Path vote `0x9ad05d9ee9d131459caaf0e912ad85dad68fadcd9e5413f994ae13bfb42cd0e0` are confirmed. The indexed verifier passed 45 checks.

The Article’s copied draft description was repaired on its existing ID, without altering values or relations. Repair proposal `b89861af269d424da12ee017304229c4`, bounty transaction `0xa2ea3754baae3c5f16295faa81fee0329bb83bd36eccfea87b0d1fdef6200dc7`, and vote `0x2e894af5dd1fc67b70267db9fc6ffb025a5cbea97833f261397e4b811e236b2a` are confirmed; three indexed checks passed.

The nonfactual expansion Claim `5735b8e6a62745a38b1a99652e3c6457` links the any-exposure spending and food-security Claims as Supporting. The continuous full-exposure specification is Related-only because it is an alternate estimate from the same paper. Proposal `b23567b2502e416fabf681aaf61515df`, bounty transaction `0x0e0112fde50815912f87b653d8efaf6c18165603e10c8de4ff5a3740d9117cd4`, and vote `0x1fc29ed1c6534f5f1b7481fa1276f1e91170e4d0054f7b56558bc708b2979461` are confirmed; 17 indexed checks passed. The dashboard verifier source-filters this family by Article and excludes the nonfactual parent.
## 2026-09-12 graph correction

The continuous-exposure food-spending estimate is an alternate specification from the same study, so it must be related context rather than an opposing argument. The original debate builder mistakenly placed it in the `oppose` array; `education-fix-community-eligibility-debate-relation.ts` verifies and removes only that relation, while the repaired builder keeps it in `relatedOnly`.

The correction proposal `8bcf026fc1ef481fa42d617094dcdcaa`, bounty transaction `0x7f5d58e2d9324e58ef285368734dbbdeadbd0942b321c06d03f7cc670e4a2021`, and Fast Path vote `0xb7c94252c7fb37118c02e0a280dacbb45c81d181317ac6da385043276427b9f7` are confirmed. A live relation query confirms that the old Opposing edge is absent and the existing Related edge remains.
