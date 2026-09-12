# Dana Center Mathematics Pathways (DCMP) 2023 source notes

Primary source: Dan Cullinan, *Dana Center Mathematics Pathways Long-Term Follow-Up Cost Analysis* (CAPR/MDRC, November 2023), `https://www.mdrc.org/work/publications/dana-center-mathematics-pathways-long-term-follow-cost-analysis`.

The individual-level randomized trial covers 1,411 students (856 program, 555 control) across four Texas community colleges and ten campuses. It evaluates the early DCMP version: multiple pathways aligned to fields of study, a one-semester accelerated developmental sequence, student-centered curriculum/pedagogy, and student-success strategies. The evaluated version differs from later corequisite recommendations.

Publish the exact five-year cost and outcome facts from Tables 1 and 2. The net social cost is $790 per program-group member in constant 2022 dollars. The program/control difference is +2.5 percentage points for ever earning a credential or current four-year enrollment (32.7% vs 30.2%) and +0.4 college-level credits (30.7 vs 30.3); the report says neither outcome difference is statistically significant. The reported cost-per-outcome differences ($-3,450 per credential-or-enrollment and +$20 per college-level credit) are source arithmetic, but must be labelled as non-confirmatory cost-effectiveness values, not causal savings or a general ranking.

Table 1 includes primary program components $1,380 per program student; control base course costs $23,160; program total five-year cost $23,950; indirect course-taking savings −$170; foregone student-earnings savings −$420. These values are social costs and savings in constant 2022 dollars; they exclude CAPR evaluation costs, use IPEDS-derived course costs, and the source warns that IPEDS cost per credit can be overestimated. No benefit-cost ratio is created.
## Value typing correction

The source-reported $3,450 cost-per-attainment difference and $20 cost-per-credit difference are monetary values, even though both are conditional cost-effectiveness arithmetic and neither establishes a statistically significant outcome difference. The initial DCMP batch mistakenly stored them as generic Decimal estimates; `education-repair-dcmp-cost-types.ts` moves them to the `Cost` Decimal property and unsets the generic estimate, retaining the 2022 USD, denominator, locator, sample size, and cautionary descriptions. This keeps dashboard monetary formatting and filtering consistent without turning either figure into a verified saving or benefit-cost ratio.

## Geography scope

The report establishes four Texas community-college sites, but its publication does not provide a reusable Geo identity or a source-ready coordinate record for each campus. All-space exact-name discovery found no existing entity for Brookhaven College, Eastfield College, El Paso Community College, or Trinity Valley Community College. `education-build-dcmp-geography.ts` therefore links the Article, Initiative, and seven factual claims only to canonical Texas State; it deliberately does not create city pins, college organizations, or campus coordinates.

Collection discovery is available as `bun run education:discover-dcmp-collection`. It checks all seven factual Claims across spaces and records whether a result collection or incoming membership already exists; the result is preparation evidence only.

The shared prepare-only build succeeds with `bun run education:prepare-dcmp-collection` followed by `education:build-collection`, producing `data/education/dcmp-collection-batch.json` with 27 operations. The design Claim is kept in a context block without displayed metric columns; the six outcome/cost rows retain typed sample counts and source-defined measures.

## Dashboard facets

The Initiative gets source-scoped Population and Design text fields: the 1,411-student, 856/555 randomized sample across four Texas colleges and ten campuses; and an individual-level randomized, five-year follow-up of the early model. These fields describe the evaluation population and do not claim that later DCMP implementations use the same program configuration or have the same results.

## Debate mapping

The DCMP debate parent asks whether broad expansion should wait for statistically persuasive long-term outcomes. It is a nonfactual policy proposition, not a conclusion attributed to the authors. The positive net social cost and the two non-significant five-year outcome records support its evidence threshold; the report’s lower cost-per-attainment arithmetic is an opposing consideration, while remaining explicitly conditional and non-confirmatory. Every argument remains Related to the same Article and Initiative so the dashboard cannot present one trial as multiple independent studies.
