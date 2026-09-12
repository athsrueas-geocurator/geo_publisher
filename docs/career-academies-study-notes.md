# Career Academies study notes

This note records the source identity and scope used for the collection draft; it does not introduce new estimates. The source is MDRC, **Career Academies: Long-Term Impacts on Work, Education, and Transitions to Adulthood**, an eight-year randomized follow-up. The reviewed source landing page is [MDRC](https://www.mdrc.org/work/publications/career-academies-long-term-impacts-work-education-and-transitions-adulthood); the existing Article, bibliography metadata, and `career-academies-ops.json` preserve the report locators and Claim values.

The collection draft reuses four existing factual Claims. Their scopes remain separate: assignment/sample context, work/earnings, postsecondary education, and the young-men subgroup. No pooled average or newly calculated effect is added. The MDRC landing page returned HTTP 200 on September 12, 2026. Before a proposal, compare every header, source locator, source relation, and typed value against live Geo and confirm incoming memberships across all spaces.

The primary page's Key Findings supplies usable source locators for a future metadata repair: Claim `ad46bd08a240475ea7e837be5b50ffe5` maps to the evaluation-design paragraph (Key Findings context, lines 13–15); `308e7f13d2b64e5ab703ff0c6efaf02e` maps to Key Findings bullet 1 (lines 16–18); `f9e2d6635ad94fb8acbefcc9d78b15cd` maps to bullet 3 (line 19); and `7fce844370e840cc855866e85ed84b0b` maps to bullet 2 (line 18). The current Claims do not yet carry these locator values, so this is source reconciliation evidence, not a claim that the metadata has been published.

Fresh scoped reads confirmed the locator property is absent on all four Claims. `education:prepare-career-academies-locator-repair` produces a four-operation metadata delta that adds only these reviewed locator texts; it remains unsigned and unpublished.

The 2026-09-12 regeneration produced four `updateEntity` operations, zero `unset` entries, and validation hash `e79f9834ec9fcab3e29a2f9f305cdd22cd4bedbc73c7808b533ae66670b46589`. The live preconditions and operation shape passed; applying the delta still requires the paused publication workflow and post-index verification.
