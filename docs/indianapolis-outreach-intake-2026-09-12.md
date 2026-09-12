# Indianapolis outreach: September 12 research intake

Requested by the user on September 12, 2026: inspect the supplied Open_Data output and improve the publisher's outreach queue. This is a local intake audit and publication work plan, not fresh verification of provider operations or evidence of Geo publication. Preserve the active education publication work. Canonical queue: [item 4](../publishing_queue.md#4-indianapolis-homeless-outreach-coordination-directory--queued). Governing scope: [directory specification](indianapolis-outreach-directory.md).

## Input package and reproducibility

**User correction — contact links only (September 12):** Do not store or publish contact names/role-holder identities, phone/fax numbers, email addresses, mailing-only contact addresses, or copied contact details, even when public. Store only a public HTTPS page URL where the provider maintains contact information (official contact/service page, contact form or official social page), plus a neutral label and link-check date. No `mailto:`, `tel:`, contact values embedded in URLs, or contact details in excerpts, notes, logs, payloads, exported tables, Geo blocks, frontend bundles or caches. Do not create contact Person entities or contact-role relationships for this dataset. Public service addresses/coordinates are a separate operational location concept and still require public-access/privacy review; never use a mailing or private contact address as a map stop.

This supersedes the original request to collect named contacts and direct details. The supplied source package already contains contact data: inspect it in place only as necessary, do not copy it wholesale into publisher storage, and do not upload its workbook, CSV, JSON, brief or source captures. Build a minimized allowlisted intake excluding contact data and audit free-text fields too. Record excluded field names/reasons, not excluded values. Leave the user's original package unchanged; this task has not deleted it or certified it contact-free. Audit any existing outreach-derived artifacts before further publication; do not claim graph history can erase previously published information.

Local source folder: `C:\Users\tfreestone\Code\athsrueas\Open_Data\outputs\indy-outreach-20260912` (from this repo: `../Open_Data/outputs/indy-outreach-20260912`). Related repository: [athsrueas/Open_Data](https://github.com/athsrueas/Open_Data). Local files were inspected; their availability on GitHub was not verified.

| File | Purpose / verified local inventory |
| --- | --- |
| `directory-data.json` | Preferred intake: `as_of`, 48 `organizations`, 102 `services`, 233 `schedule_windows` |
| `master_directory.csv` | 102 rows, 182 columns; parsed rows exactly match JSON `services` |
| `weekly_help.csv` | 262 display rows; includes unscheduled/contact-provider entries, not 262 independent services |
| `food_schedule.csv` | 111 display rows; distinguish groceries, restricted meals and public meals |
| `coordination.csv` | 48 organization/joint-provider summary rows, 13 columns |
| `Indianapolis_Outreach_Directory_2026-09-12.xlsx` | Human review copy; existing validation reports eight sheets. No workbook edits or new visual certification in this audit |
| `Outreach_Director_Brief.md` | Operational corrections, qualified gaps and Wednesday 14:00 examples |
| `research/build_data.py` | Actual record construction, overrides and export logic; inspect to distinguish defaults from sourced assertions. Do not run against the original package during intake |
| `research/sources.json`, `source_00.txt` … `source_35.txt` | Partial fetch archive: 36 attempts, 9 errors. Not a complete source/evidence registry |
| `research/recovery-calendar.png` | Local calendar image; reconcile against the cited September calendar before extracting event dates |
| `research/workbook-data.json` | Generated workbook views, including confirmation work; do not treat as an independent source |
| `research/validation.json`, `verify_export.py` | Structural/export checks, not factual verification. `verify_export.py` rewrites validation and ZIP outputs; do not execute it on the supplied snapshot merely to inspect it |

SHA-256 at intake:

```text
directory-data.json       8562fce2a0e7ce4f1b4e3bea1ba0060b1021f607fc9e506c8137bf7cb3844553
research/build_data.py   312b5bc0daca6b487c5dac94f323f1a13bdd4b4fa582caddbd2dee42f119ee7a
Outreach_Director_Brief.md 982d5340386f64cd80e47c0889f2f0e32a691c54d0ceea4fc7610c9f40506eae
```

Pin these inputs by reference in an intake manifest with relative paths, hashes, source version and review date. Keep only minimized, contact-free publisher artifacts in `data/indianapolis-outreach-directory/`; never copy raw source files containing contact data. Do not copy `node_modules`, previews, the 11 MB inspection dump or the ZIP into Geo or the frontend. The four tables must remain generated views of one normalized dataset, with contact-source links replacing contact values.

## Findings that change the publishing job

- All 102 service IDs are unique in this snapshot. Every service refers to an existing organization key; every schedule window refers to an existing service. Those checks do not establish semantic deduplication.
- `S001`–`S102` are generated with `len(rows)+1`. Inserting/reordering inputs changes future IDs. Freeze this snapshot's crosswalk before edits; allocate persistent publisher identities independently of row position. Schedule `id` is a service reference, not a unique schedule ID.
- There are 100 publicly listed service records and two coordination-only records (`S038` CHIP; `S100` Second Helpings). Preserve both coordination records without exposing them as walk-in aid.
- 97 records explicitly require schedule confirmation. Five have dated schedule evidence: `S076`–`S079` and `S101`. Four of those are September-only/date-limited; they are not durable weekly schedules. Six rows have overall High confidence, so row confidence is not a schedule-readiness test.
- 95 rows are classified primary Indianapolis/Marion and seven secondary. County geography, organization headquarters and eligibility are different facts; retain each rather than assuming every suburban program accepts Marion residents.
- No program/location/contact/schedule/source IDs, coordinates or structured timezone fields exist in the master records. `schedule_windows` contains only service reference, day, free-text time and weekday order. Typed recurrence, exceptions and map readiness still need work.
- All 102 `Service Description` values equal their program labels. They are not meaningful sourced descriptions yet. Twenty-seven rows inherit the generic population/eligibility text from `add()`. `org()` defaults include nonprofit type, primary geography, main-number contact advice and review date. Audit all defaults and preserve only source-supported facts; do not publish template assumptions as restrictions or provider preferences.
- The generator derives a public fixed site from the existence of an address before overrides. Independently verify each location's purpose and public access; an address is not evidence of a client entrance or an unrestricted service.
- There are 64 distinct primary URLs. Only 25 of the 102 records have an exact primary-URL match to a successful text fetch in the supplied 36-attempt archive. Other evidence may have been reviewed elsewhere; this is an archive coverage gap, not proof those records are false. Nine archived fetches failed (403/404/406). An error file is not supporting evidence; find an official replacement or record unresolved status.
- Review dates are not fact-confirmation dates. The package explicitly says no providers were called or messaged. `Date Information Verified` is public-source review; undated pages and inherited contact dates do not establish current hours or current personnel.

## Ordered work packages

### A. Freeze, reconcile and normalize

1. Create the intake manifest and a row disposition ledger covering all 102 service rows, all 48 organization/joint-provider keys and all twelve original seeds. Statuses: reuse, create candidate, merge/alias, coordination-only, needs evidence, exclude with reason. Recheck existing Geo content rather than assuming this queue's older absence observations still hold.
2. Search cross-space identities using aliases, official URLs, identifiers and location evidence. Keep source-space provenance and completeness of discovery. A joint provider is not automatically another independent organization; model operator, host facility, sponsor and partnership separately.
3. Establish a stable crosswalk `(dataset key, input snapshot, original service ID) -> persistent service ID -> Geo ID`. Normalize organizations, programs, offerings, public contact-source links, places, schedule windows, exceptions and sources. One offering may have multiple windows; multiple services may share a public place. Reconcile against original field names without retaining prohibited contact values.
4. Produce a complete 182-column disposition mapping: target field/relation, scope, type, source evidence, unknown handling or explicit exclusion/derived-view disposition. Contact fields are excluded/replaced with source links under the user's correction. Do not create 182 speculative Geo properties. Discover and reuse the established ontology first.
5. Normalize Unknown / Not applicable / explicit No distinctly. `Not published / not scheduled` is ambiguous and must not become Closed. Do not infer a negative service capability from a missing Yes. Keep public-service ZIPs as text. Contact data must not be retained as research-only fields either.

### B. Verify evidence and resolve high-impact conflicts

Record field-level source URL, locator or short contact-free supporting passage, source issue/update date, accessed date, applicable service, confidence and conflict state for location, hours, eligibility and capabilities. For contacts retain only the public page link and link-check metadata. Keep a separate provider-confirmed date when that evidence actually exists, without storing the staff person's identity/details. Do not inherit all organization-level services into a satellite program.

| Snapshot rows | Concrete check before publication as operational availability |
| --- | --- |
| `S008`, `S012`, `S013` | Hazelwood preparation/departure and Food4Souls staging/volunteer shifts are not client serving windows. S013 supports a Friday public stop but contains conflicting client-time evidence; retain the stop only after public-location review and leave client hours unresolved |
| `S025`–`S034`, especially `S029` vs `S019` | HealthNet office move to 3403 E Raymond applies to the office, not every hosted clinic. Reconcile the youth clinic's end time with Outreach center hours. Link host and operator rather than duplicating providers |
| `S004`, `S005`, `S051` | Reconcile SVdP distribution hours and Roberts Park co-location; Saturday basic-needs and medical services remain distinct offerings sharing a place |
| `S057`, `S059` | Cathedral's current page omits Saturday; do not restore it from an older guide. Roberts Park Wednesday heading/body conflict must retain both source assertions; choosing the earlier cutoff is a conservative routing decision, not verification. Preserve the pilot's date limit |
| `S076`, `S077` | Separate member support/opening hours from meals and introductions. September calendar expires; meal start alone does not prove meals remain available later in the afternoon |
| `S078`, `S079` | Clinic dates are September 10 and 24 only; Malik's visit is September 18 only. September 10 is already past at intake. Preserve explicit dates, unknown end times and event-specific capabilities; never expand these into weekly recurrence |
| `S038`, `S100` | CHIP is coordination and Second Helpings supplies partner programs. No public meal/shelter walk-in instructions from an office/production address |
| `S065`, `S090`, `S091`, and private/placement location modes | PourHouse has no client-service building; Trinity Haven placement is not an open shelter destination. Exclude confidential residential locations and undisclosed encampment routes from map data |
| `S092`–`S098` | Preserve each suburban residency/connection rule. Good Samaritan Network's live/work/attend-school connection is not simply Hamilton residency; do not generalize county-only restrictions |
| `S101` | August 25 Gleaners hours are a useful dated pilot candidate; vehicle/no-car access, eligibility, holiday cancellations and capacity still need separate treatment |
| `S011` | Keep TKC placeholder contact details excluded. Official social pages may be a public contact channel; do not invent phone/email values |

Create a prioritized confirmation list with service ID, exact unresolved question, supporting URLs and an official contact-page link only. Public-source research can proceed; this queue update does not authorize calls, emails, forms or social messages. Missing direct confirmation need not prevent publishing a sourced directory record with uncertainty, but it prevents treating the schedule as confirmed availability.

### C. First bounded publication slice and read contract

Recommended first slice: `S019` Outreach Near Eastside center, `S029` HealthNet hosted youth clinic, `S038` CHIP coordination, `S076`–`S079` September We Bloom activities and `S101` Gleaners pantry (eight records). This deliberately exercises shared locations, different operators, coordination-only records, dated events, restricted meals, unresolved hours and a dated recurring pantry. Reuse discovered Geo identities and publish only facts that pass review. Hold unsupported fields with explicit reasons; do not hold every well-supported directory fact for all 97 confirmations.

Then expand by reviewed provider clusters, keeping stable IDs and a reconciliation ledger. Every source row must eventually have a disposition; do not equate the pilot with the comprehensive directory.

Destination remains the user-approved **Public good** space `f24e3bbd26304474b7e0c2a0877f4bfe`. No new space, education bounty links, unrelated deletions or Cloudflare changes belong in this job. Use existing publication authorization and governance checks; record preparation, proposal, execution, indexing and rendered review separately.

Before submitting, supply `docs/indianapolis-outreach-query-contract.md` with actual discovered IDs and tested queries. Required contract:

- Exact directory dataset membership in addition to target-space scoping. Public good will contain other content; space membership alone cannot define this app's records.
- Service -> program/operator -> public location and public contact-source links; partner/host relationships without duplicate service counts. API and caches must not return contact values or contact Person records.
- Typed service categories and audience/access restrictions; true/false/unknown semantics, coordination-only and appointment/referral distinctions.
- Schedule window identity, `America/Indiana/Indianapolis` timezone, start/end (nullable), occurrence dates, valid-from/to, nth-weekday recurrence, holiday/closure exceptions and freshness/conflict state. Unknown end time cannot produce an inferred open interval.
- Public map eligibility, verified coordinates with source/precision, and service-location distinction. No coordinates exist in the input. Resolve verified places or research public service entrances; never substitute organization HQ, staging points, city centroids or private camps. Records lacking coordinates remain searchable and unplotted.
- Field-level provenance and review/expiry metadata available to the API. Frontend copy remains concise; optional source links and meaningful availability caveats are sufficient.
- Bounded paginated browser reads, filtering, ordering, change/version indicators and cache expiry semantics. Respect date limits even if a cached record has not changed. Geo remains canonical; do not ship this JSON/XLSX as a silent frontend fallback or route bulk content through Linux.
- Example responses for valid, unresolved, expired, restricted, empty and failed/truncated queries, plus a complete source-to-Geo ID crosswalk and publication receipts.

### D. Acceptance and handoff

- Reject contact columns/values, embedded contact details in prose/URLs, copied staff identities, contact Person relations and raw captures from intake, dry-run payloads, logs and exports. Check representative rendered Geo/API responses too. Use an allowlist plus content review; a phone/email regex alone does not detect named contacts or every contact format.

- Reconcile the master and the three generated views from the normalized records. The 233 raw schedule entries and 262 weekly display rows have different meanings; no forced one-to-one count requirement.
- Test Wednesday 14:00 on a concrete Indianapolis-local date, a weekend meal, a 24-hour crisis contact versus actual shelter intake, a date outside September, an expired single event, unknown meal end, holiday cancellation, unknown eligibility and a suburban-only restriction. Do not call a site Open now solely from an office clock or overall High confidence.
- Verify a shared host location gives separate service details, coordination-only entries never become walk-in pins, and undisclosed routes/private residences never appear in map results.
- Render representative Geo organization, service, schedule and dataset views; provide useful sourced descriptions rather than the current label-only descriptions. Put detailed evidence in the appropriate blocks/relations rather than long descriptions.
- Keep the brief's gaps as qualified analysis of documented coverage, not measured unmet need. Keep possible collaborations distinct from established partnerships; do not label overlap wasteful or count restricted meals as unrestricted capacity.
- Return exact dataset/service/location/property IDs, query examples, receipts, accepted/held row totals and remaining questions to Geo Companion. Frontend integration and deployment are separate work.

## Intake acceptance recorded now

Completed here: local JSON/CSV inventory, exact master equality, unique service IDs, valid organization/window references, confirmation and location-mode counts, generator-default review, partial evidence-archive review and the concrete queue update. Not completed here: fresh provider verification, workbook visual audit, Geo discovery, ontology mapping, coordinates, provider contact or publication.
