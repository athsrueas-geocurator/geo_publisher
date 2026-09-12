# Catalog resource gaps — 2026-09-12

The pinned source catalog contains 18 entries. The live Education destination currently exposes 27 Dataset entities, including study-result datasets and catalog/context resources. A name-level reconciliation identifies three source catalog entries with no exact all-space match:

| Source catalog entry | Exact query result | Decision |
| --- | --- | --- |
| Evidence for ESSA | 0 candidates; one complete page | Needs catalog identity/schema review |
| National Student Clearinghouse Research Center Enrollment Insights | 0 candidates; one complete page | Needs catalog identity/schema review |
| State Longitudinal Data Systems (SLDS) Program | 0 candidates; one complete page | Needs catalog identity/schema review |

## Source verification notes

- **Evidence for ESSA:** [evidenceforessa.org](https://evidenceforessa.org/) resolves to the Evidence for ESSA database maintained by the Center for Research and Reform in Education at Johns Hopkins. The site describes a PK–12 evidence database with standards and procedures for reviewing programs. Treat the URL and stewardship as verified source metadata; do not infer individual program ratings or access terms from the landing page.
- **Enrollment Insights:** [nscresearchcenter.org/enrollment-insights](https://nscresearchcenter.org/enrollment-insights/) resolves to the National Student Clearinghouse Research Center's annual Enrollment Insights series. The page describes public aggregate enrollment reports and identifies the current series update date. Preserve the aggregate/public boundary and verify the exact edition before creating a resource record.
- **SLDS:** the direct NCES page timed out during one read, but the official [NCES SLDS program overview](https://nces.ed.gov/Programs/SLDS/) is indexed and describes the Statewide Longitudinal Data Systems Grant Program, state support, grants, and publications. The official [IES program page](https://ies.ed.gov/funding/research/statewide-longitudinal-data-systems-grant-program) provides the statutory purpose and eligible grantees. Use the NCES overview as the canonical resource URL and retain the IES page as corroborating context if a catalog record is prepared.

These are absence-of-exact-name observations, not permission to create entities. Before any proposal, verify official source URLs, stewardship, access/version boundaries, intended noncausal context, and all-space aliases; then use the catalog-resource workflow and link only supported initiative context. The other 15 source entries have a matching live Dataset name or a documented canonical alias in the inventory.

The URL identifier pass (`bun scripts/education-identifiers.mjs` with the three official URLs) completed all three all-space text probes with zero candidates. Evidence is retained under `data/education/identifiers/`; URL absence is corroborating identity evidence only and does not authorize creation or imply that a resource is absent under an unsearched alias.
