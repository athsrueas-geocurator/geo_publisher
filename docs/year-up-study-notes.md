# Year Up PACE: seven-year earnings and cost-benefit evidence

Primary source: David Fein and Samuel Dastrup, *Benefits that Last: Long-Term Impact and Cost-Benefit Findings for Year Up* (Abt Associates for ACF/OPRE, 2022), [official PDF](https://acf.gov/sites/default/files/documents/opre/year%20up%20long-term%20impact%20report_apr2022.pdf).

## Verified extraction — 2026-09-12

The federally sponsored PACE RCT randomly assigned **2,544** eligible Year Up applicants in 2013–2014. The core program operated through eight local offices in nine cities; it offered six months of full-time IT/financial-services training followed by a six-month internship. Eligible participants were 18–24 with a high-school credential; 96% of treatment members enrolled (Executive Summary pp. vii–ix; report pp. 3–4, 11).

The report's single prespecified confirmatory outcome is average quarterly earnings in follow-up Quarters 23–24. For the National Directory of New Hires sample (**1,637 treatment / 858 control**), treatment averaged **$8,797** and control **$6,901**, a **+$1,895** difference (SE **$267**, p < .001; **27.5%**) (Exhibit 2-1, report p. 14). The annual Year-7 earnings estimate is **+$8,251** ($35,589 versus $27,338; SE $1,120; p < .001), and total Years 1–7 earnings is **+$38,152** ($176,412 versus $138,260; SE $3,958; p < .001). Year 1 is **-$5,778** because participants prioritize the program; do not hide it or treat Year 7 as a separate trial (Exhibit 2-1, p. 14).

The same table reports a **+12.4 percentage-point** difference in earning at least $9,100 per quarter in Quarters 23–24 (44.1% versus 31.7%; SE 1.9; p < .001). The report also says it found no impact on six-year employment rate; do not confuse higher earnings with a documented employment-rate effect (pp. 16–17).

## Cost-benefit boundary

The source reports a seven-year **modelled** societal total cost of **$23,135**, total benefit of **$57,019**, net benefit of **$33,884** per participant, and a **2.46** benefit-to-cost ratio (Exhibit 5-6, pp. 55–56). It treats costs as treatment-minus-control costs and includes Year Up services plus other education/training/support services. Benefits include earnings, fringe benefits/taxes, stipends, and an assumed **50%** return on employers’ Year Up intern payments; actual employer returns were outside the study scope. The report’s low-return scenario is not zero-cost evidence: it reports $25,825 societal net benefit if employers receive zero financial return (pp. 47–57).

The source discounts CBA earnings at 5% annually; its sensitivity analysis uses a 5% base-case discount-plus-inflation rate (2% inflation plus 3% time value), with 3% and 8% alternatives (Supplemental Exhibits 8–9, pp. 91–92). The extracted text still does not establish a conventional common dollar price year suitable for the typed Price Year field. Do **not** publish a money record, BCR, NPV, lifetime projection, or cross-program efficiency ranking until that price-year ambiguity is resolved from the method/technical appendix. The source itself labels the seven-year values as a model; its hypothetical 20-year projection is not a study finding and must not be published as one.

## Intended Geo package

Create distinct Article and Initiative identities only after complete all-space discovery. Publish a source-filtered factual family for the RCT’s confirmatory quarterly earnings, Year 1, Year 7, cumulative Years 1–7, high-earnings threshold, and employment-null context, retaining NDNH coverage and ITT scope. If the price year and methodology are confirmed, add a separate Article-filtered source-model family with typed Cost Decimal, Currency, Price Year, denominator, BCR property, and model assumptions in reader-facing Claim text. Add structured Population and Design facets, then a bounded policy Claim which links evidence without counting timepoints as independent replications. The multi-city study does not authorize a city coordinate, service-stop, or outreach-route map relation.

## Publication correction — 2026-09-12

The initial outcome builder applied the 2,495 NDNH earnings-analysis sample to the randomized-design Claim. The source says **2,544** eligible applicants were randomized; 2,495 is appropriate only for the NDNH earnings rows. A first correction payload was rejected before submission because it serialized SDK byte IDs incorrectly. The preserved failed journal is not an executed proposal. The corrected `year-up-design-sample-fix-v2` proposal `5662fd5023af4f50bacafe21e1083138` then executed, bounty-linked, and passed three indexed checks. Builders must serialize `Uint8Array` values as `$bytes` in the operation JSON, as the standard education builders do.

## Completed linked-evidence publication — 2026-09-12

The Initiative now records structured Population and Design facets, separating the 2,544 randomized applicants from the 2,495-person NDNH analytic sample. The linked policy Claim uses the confirmatory quarterly outcome, Year-7 and cumulative earnings, and the high-earner threshold as Supporting evidence; it uses first-year earnings displacement, the employment-rate null, and the PACE design boundary as Opposing context. This is one trial with several outcome/timepoint records, not several independent studies. The source cost-benefit model remains out of Geo until its common price year can be established.

## Price-year follow-up — 2026-09-12

The supplemental appendix says the Year Up service-cost observation reflects local-office costs in 2013–2014, and it separately describes a comparison figure adjusted to 2014 dollars. It does not yet label the Chapter 5 $23,135/$57,019/$33,884/2.46 CBA totals as a single constant-dollar series. Therefore this evidence narrows the underlying cost period but does not resolve the typed `Price Year` required for publishing the model; continue to withhold those money/model records from the dashboard.
