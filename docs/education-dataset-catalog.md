# Native education dataset catalog — September 12, 2026

## Inventory and scope

`catalog-collection-inventory.json` exhausts destination-space Dataset type edges (25), Blocks on those Dataset pages and the space page (26 parents), and all relations on their 43 Data blocks. It additionally exhausts **all-space** incoming Collection item relations for each of the 25 Dataset IDs. No Dataset-member catalog was found, none of those Dataset IDs belonged to an existing explicit collection, and the verified Education datasets space page had no Blocks. This is the scope of the absence evidence; it is not a census of every other entity or query-backed collection in Geo.

The new catalog reuses all 25 Dataset IDs and adds one collection Data block to the existing space page. Stored alphabetical order supplies neutral navigation, not an evidence or editorial ranking. Dataset names, descriptions, records, source versions and result blocks remain unchanged. The catalog includes study results, research resources, glossary and Questions; Dataset type alone must not enable a quantitative comparison.

This implements the [living Geo design](../../GEO%20Site/docs/LIVING_GEO_DESIGN.md): membership and order live in Geo, and compatible later changes are read without rebuilding a bundled study list. Future publisher batches must explicitly add/update catalog membership after verifying the new Dataset; a static collection is not an automatic type query. Deletions/reordering in Geo must replace refreshed frontend membership rather than union it with stale cached rows.

## Entry point and query

- Target space: `dac259bad48a11adf97fe36857d85206`.
- Existing space-page entity: `16a032fb91794444859a6c1a44a32955`.
- Catalog Data block: `2279edef1bbe479c872caeb72ee90022`, Name **Datasets**.
- Space page → Blocks: `beaba5cba67741a8b35377030613fc70`.
- Block → Collection item: `a99f9ce12ffa4dac8c61f6310d46064a`.
- Each member is explicitly typed Dataset `0c4babfb43893486af827341bbf32e09` in the destination space.

Use `data/education/dataset-catalog-members-query.graphql`, variables `block`, `space`, `after`. Exhaust `pageInfo`, reject repeated cursors, deduplicate IDs and sort `position`. Then load destination-scoped member values and supported relations; aggregated entity names are convenient search hints, not a substitute for scoped read provenance. The query returns relation IDs and relation-entity IDs separately. It uses Collection item, not Dataset entries. Do not interpret the catalog's 25 members as 25 independent studies or complete original-data migration.

## Publication evidence

Proposal `bd489cb0eac547bebd3c44f766eb37d3` executed with indexed bounty link. Main transaction `0x321b1bd2eec6ce20e0eb44e608f499b74734c325bb011273041a695ca1704a26`; bounty `0xcbb3478406684422dffecadc3848ed60a72f9fade5114ff03de42501ef9b81ce`; vote `0x3bb7ae01ad5dfc6804df44960ca221a0d0dee8fe6085f21f6a494a1ff79c0859`.

`dataset-catalog-index-verification.json` passes 33 payload/index/governance/bounty checks. `dataset-catalog-query-verification.json` independently passes 104 checks over three ten-edge pages, testing space-page reachability, exact unique membership, alphabetical positions, current scoped names and Dataset types. TypeScript passes. Browser review of the actual space Overview confirms all three pages (9/9/7 entries), current names/descriptions and links to the existing Dataset pages. The final page shows both distinct STAR datasets and the Head Start archive, preserving their different meanings. Page transitions briefly showed empty table bodies while loading; subsequent completed reads showed the expected entries, so no data was resubmitted. Frontend integration is separate.

## Remaining scope

The original 18-resource catalog includes Evidence for ESSA, National Student Clearinghouse Research Center Enrollment Insights and the SLDS Program, which did not appear among these 25 destination-typed Datasets. These need cross-space identity/version/ontology review before deciding whether to publish; this destination inventory does not establish global absence. Existing Article/Claim-only study families also need a reviewed dataset/collection mapping where the frontend requires one, without republishing their evidence.
