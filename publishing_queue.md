# Publishing queue

Canonical ordered queue shared with Geo Companion. The user requested this ordering on 2026-09-11. Existing detailed work remains in [todo.md](todo.md); this file defines sequence, not duplicate completion evidence. Advance only after each item's actual acceptance checks. Do not infer that a submitted proposal is executed or indexed.

## Living-Geo gap intake rule — September 12

Every missing-data finding from Companion belongs in this canonical queue. Record the affected screen, exact missing entity/relation/property or unresolved contract, destination, scoped read evidence (date and pagination/completeness), original source path, and acceptance criteria. Classify missing publication separately from existing graph data awaiting frontend adaptation; reconcile across spaces before adding entities. Unknown Question Answers remain research/modeling work, never invented content. Keep source details and receipts in the linked domain note rather than duplicating ledgers.

## 1. Education data — active

September 12 living-graph integration contract: follow Companion's [living Geo design](../GEO%20Site/docs/LIVING_GEO_DESIGN.md). The frontend independently reads all 21 published Questions; absent Answers are intentional pending research/model review, not a gap to fill with invented positions.

- [x] Inventory existing ordered education Dataset catalog/page collections: no explicit membership found for the 25 existing Dataset IDs, including all-space incoming checks. Published native catalog block `2279edef1bbe479c872caeb72ee90022` on the existing space page, reusing all IDs; 33 publication/104 consumer checks pass. [Entry point and scoped query](docs/education-dataset-catalog.md) supplied to Companion. Existing estimates were not republished.
- [ ] Keep narrowly identified adapter gaps in this queue with current read evidence and source provenance. A missing local registry entry is not proof of missing graph data.

September 12 frontend handoff: [bounded original-data reconciliation](docs/companion-data-reconciliation-2026-09-12.md). Reconcile the pinned 76 initiatives / 106 sources / 21 questions and exact missing fields against existing publications before creating duplicates. The source files already exist under `data/education/source/`; this is a concrete migration scope, not an unbounded request for more studies. Outreach requirements and the observed missing service contract are included separately.

- [ ] Complete and verify the currently agreed education-data publication scope, including outstanding governance/indexing, mapping, presentation and frontend-contract work.

Follow [the education handoff](docs/education-initiatives-handoff.md), [dashboard contract](docs/education-dashboard-data-contract.md), applicable design notes and the current todo list. Some batches and repairs have already been published; this queue neither resets that work nor claims the overall migration is complete. Record completion evidence here when the active scope is accepted.

## 2. Personal-profile editorial pilot — deferred until item 1

- [ ] Identify an existing editor-owned featured Post collection only if the user has already selected its membership/order. If no such curation exists, keep pending for personal selection; do not generate featured priorities or editorial text.

### Technopoly in Books — explicitly queued

Added at the user's explicit request on September 11, 2026. This is a bibliographic Book publication, independent of waiting for new personal editorial prose; it does not reinstate withdrawn assistant-authored opinions.

- [ ] Add **Technopoly: The Surrender of Culture to Technology** by Neil Postman to the existing Books space `0477636ace64280fc43a9f440a502291`. Use a work-level Book; the user does not require a particular edition. Refresh complete cross-space identity/identifier checks and reuse an existing entity if found; otherwise create a sourced Book using the established Books ontology and verified publishing authority.
- [ ] Link the resolved Book to the user's existing `Educator turned builder` post `fd024e4f126343af98c61c32ae6f917e` in personal space `d00460c203779d21d96fcfc6102d7a72`, preserving the user's text. Verify indexed Book facts, post relation and rendered result; report stable IDs to the frontend.

Context and prior lookup evidence: [curated-post-book-links.md](docs/curated-post-book-links.md). The existing Zen Book was subsequently linked to the user's post; the no-publication statement below describes the earlier withdrawn draft, not that later authorized relation.

Correction (2026-09-11): the user withdrew the assistant-authored book framing and claims through the frontend task. `../GEO Site/BOOK_CURATION.md` is withdrawn publication input. The earlier preliminary-book exception is cancelled; no book or editorial publication was submitted by this task. Await the user's own authored words before preparing personal curation for publication. Education remains active.

- [ ] Await user-authored book responses; do not publish the withdrawn preliminary collection or claims.

- [ ] Publish the first user-supplied editorial/reading list in profile space `d00460c203779d21d96fcfc6102d7a72`; verify attractive Geo rendering and direct reuse by Geo Companion.

Follow [editorial-profile publishing guidance](docs/editorial-profile-publishing.md). Published editorials and personal graph content belong on the user's Geo profile. Heavy content must be delivered from Geo infrastructure or Cloudflare, never the Google VM. The current local draft/export UI is a temporary prototype, not the target publication architecture.

## 3. Further personal content — await supplied content

- [ ] Apply the verified pilot recipe to additional user-supplied personal content, in the user's chosen order.

No extra articles, stances, imagery, or automatic publishing schedule have been requested. Add concrete items when supplied, with source/draft location, destination, dependencies, status and verification links.

## 4. Indianapolis Homeless Outreach Coordination Directory — queued

**User correction September 12: contact links only.** Do not retain/publicize contact names, phone numbers, emails or copied contact details, including in local import artifacts. Link to the provider's public contact page instead. The supplied package contains these details: build an allowlisted minimized intake, do not copy/upload the raw package, and review free-text fields. See the [intake contact rule](docs/indianapolis-outreach-intake-2026-09-12.md#input-package-and-reproducibility). This supersedes earlier named-contact columns and contact-entity modeling; public service locations remain separately governed.

September 12 input update: the user supplied `../Open_Data/outputs/indy-outreach-20260912`. Follow the [reviewed intake and ordered work packages](docs/indianapolis-outreach-intake-2026-09-12.md): 102 service records, 48 organization/joint-provider identities, 233 raw schedule entries; 97 records require schedule confirmation and no coordinates are supplied. Start from this package instead of repeating seed research. This changes the research starting point, not the active education priority or publication status.

- [x] Audit supplied JSON/CSV inventory, master equality, ID references, schedule states and generator defaults; record source hashes and exact row-level repair priorities in the intake handoff (September 12).
- [ ] A — Freeze input manifest and persistent source-to-Geo crosswalk; reconcile all 102 rows and all 182 fields, discover/reuse identities, normalize service/location/contact/schedule/source records.
- [ ] B — Recover field-level evidence and resolve the handoff's named conflicts; separate client times from volunteer/office times, dated events from recurrence and public-source review from direct confirmation.
- [ ] C — Prepare the eight-record pilot and tested dataset-scoped read/map contract described in the handoff; publish only reviewed facts under existing authorization and record receipts. Then expand by reviewed provider clusters.
- [x] Deliver bounded [draft contract](docs/indianapolis-outreach-query-contract.md) with verified collection/root property IDs, tested census/membership query shapes, source-row gap queue and explicit readiness limits. September 12 live Dataset census is empty; four space-page blocks have no explicit collection members. This does not prove absence of every service throughout Geo. The eight records remain a recommended intake slice, not a published pilot.
- [ ] D — Verify date/eligibility/privacy cases, mutually consistent views and rendered Geo pages; deliver stable IDs, query contract, held-row reasons and confirmation queue to Geo Companion. No frontend/Cloudflare edits in this item.

Added September 11, 2026 at the user's request. Separate dataset, not part of education, personal book curation or the education bounty. Preserve active education work; items waiting on user-supplied content need not block read-only planning/research for this item.

Specification and acceptance checklist: [indianapolis-outreach-directory.md](docs/indianapolis-outreach-directory.md). Local dataset namespace: `data/indianapolis-outreach-directory/`. User-selected target: **Public good**, `f24e3bbd26304474b7e0c2a0877f4bfe`; exact-ID identity and complete public editor/member lists verified read-only at 23:11 UTC on September 11. Evidence: `data/indianapolis-outreach-directory/destination-discovery.json`. No space creation or directory publication has occurred.

- [x] Capture requested fields, twelve seeds, geographic scope, four outputs, verification rules, separation model and gap analysis requirements in the specification.
- [x] Record the user's selected existing Public good space and verify its exact identity and public membership; do not create another space. Current signing authority, directory scope/schema and publication gates remain to verify before publishing.
- [ ] Research, normalize and verify offerings; produce master directory, weekly help schedule, food schedule, coordination matrix and qualified director/gap summary.
- [ ] Complete publication gates and supply the frontend query contract; maintain receipts here.

### Outreach map data — queued extension

Affected screens: Outreach directory, weekly/food availability views, coordination view and map. Missing contract: directory Dataset/offering-block IDs, reviewed service→operator/program/public-place links, typed schedule/exception/provenance mappings and verified coordinate facts. Destination is Public good above. Read evidence: `data/indianapolis-outreach-directory/contract-discovery.json`; source snapshot: `../Open_Data/outputs/indy-outreach-20260912/directory-data.json`, first-slice keys S019/S029/S038/S076–S079/S101. Acceptance: complete scoped membership reads, reviewed field mappings and source-to-Geo crosswalk, source-backed public-location coordinates, unknown/expired/restricted cases and publication/index/render receipts. Contact data is limited to verified public contact-source page links; do not copy names, phone numbers, email addresses or create contact-role Person entities. [Draft contract](docs/indianapolis-outreach-query-contract.md) identifies the exact unresolved pieces; frontend adapter work remains separate.

Frontend integration remains dependent on verified exact dataset membership, service/program/schedule relations, public fixed-location eligibility and representative source-backed records. Apply the newer contact-source-links-only intake rule to all artifacts; original requirements for copied contact details are superseded. Inventory existing graph records before treating adapter gaps as missing publication work.

- [ ] Publish dataset-member service/program/location links in Public good with verified coordinates and explicitly public fixed stops. Reuse verified entities across spaces; distinguish service/provider identity from the location where help is offered.
- [ ] Keep private encampment locations and undisclosed routes out of the published map data. Unknown coordinates remain unknown and unplotted; do not invent map positions.
- [ ] Verify dataset membership, service/program/location traversal, coordinates and public-stop provenance against live Geo data. Supply entity IDs, property IDs and tested queries to the frontend for its outreach map. Frontend implementation stays with the frontend task; no Cloudflare editing is included.

Do not publish stale hours as confirmed availability, infer missing facts, expose sensitive encampments, contact providers without authorization, mix this batch into education, or edit/deploy Cloudflare as part of publisher work.

## 5. Geo Companion primary-space icons — queued (parallel polish)

Added at the user's request on September 11, 2026 for the smaller app-selector cards. The frontend reported read-only checks finding no icon/avatar relation on these space pages; revalidate this state before writing:

| Space | Space ID | Space-page entity | Reported state |
| --- | --- | --- | --- |
| Education datasets | `dac259bad48a11adf97fe36857d85206` | `16a032fb91794444859a6c1a44a32955` | Cover only; no icon/avatar found |
| Public good | `f24e3bbd26304474b7e0c2a0877f4bfe` | `789068315729430884b1bff0dc9ac39b` | No icon/avatar found |

- [ ] Inspect Geo's established space-avatar schema and comparable space pages; identify the actual avatar relation and Image URL property rather than treating Cover as an icon.
- [ ] Select appropriate icon assets and publish the proper space-avatar relations on the existing pages, using verified authority and stable Image identities. Verify indexed facts and rendered icon URLs.
- [ ] Report the relation property ID, image URL property ID, Image/entity IDs and tested read query to the frontend. Verify suitability for the smaller cards with that task; no frontend or Cloudflare edits belong in this publisher item.

These queue additions preserve the active education scope and existing order. The icons are a separate shared-app polish task, not a prerequisite for source-overlap/category visuals, an education dataset, or an automatic education-bounty submission. Frontend renderer work belongs to GeoCompanion; publisher work ends at verified Geo records and indexed receipts.

## Visual restoration audit — September 13, 2026

- [ ] Reconcile the bounded visual-data gaps in [Companion's visual restoration audit](../GEO%20Site/docs/VISUAL_RESTORATION_AUDIT.md). This is preparation/reconciliation only and does not override the publication pause. Live capture at 2026-09-14T02:53:20Z found 27 catalog entries, 35 Initiative entities, 8 Studies and 21 Questions in Education. The question path is Dataset → Blocks → Collection item, not direct Dataset membership.
- [ ] Reconcile original initiative category/method fields and source methods with existing ontology. Three current initiatives already have Category relations (`06c899fb04334e679feb1fd56687c3d6`); Companion ignores them. Reuse and map those before proposing new classifications. Other category coverage and the old assessment axis are not established.
- [ ] Review original evidenceStrength assessments and question continuum fields with attribution, rubric, evidence/source links and bounds semantics. The 21 inspected Questions expose only identity/description/URL/slug and Types, not those visual fields. Use pinned `data/education/source/content/initiatives.json`, `sources.json`, `dichotomies.json` and the original-field reconciliation ledger. Do not invent missing Answers, positions or user-authored text.
- [ ] Return verified semantic mappings for existing numerical families (measure/instrument, unit/scale, cohort/trial, arm/comparator, follow-up, estimand, uncertainty and observation kind). Perry/Reading First/Saga/coaching already have readable result collections. The current frontend's STAR-only plot gate is an adapter limitation, not a request to republish those results. Keep prepared collections separate from indexed catalog membership.
- [ ] Reconcile map coordinate source scopes for Florida, Maryland, Ohio, Tennessee and Texas; Companion's current Geography-scoped point reader returns no point for these. This is not evidence of graph-wide absence. Preserve regional coverage versus actual implementation sites and never invent precise locations. Outreach retains its separate privacy-reviewed contract and contact-source-links-only rule.

Acceptance: exact scoped IDs and query examples; field status existing-readable / needs-link / absent-after-discovery / review-needed; attribution for assessments; source-backed units and grouping; indexed receipts only for subsequently authorized publication. Source-overlap comparison and chart-renderer work remain Companion responsibilities.
