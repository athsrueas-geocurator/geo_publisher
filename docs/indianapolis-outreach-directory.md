# Indianapolis Homeless Outreach Coordination Directory

Dataset key: `indianapolis-outreach-directory`. Requested September 11, 2026. Status: local research package supplied September 12; normalization, evidence reconciliation and Geo publication gates remain pending. See the [102-record intake and work plan](indianapolis-outreach-intake-2026-09-12.md). Local research is not evidence of verified live availability or Geo publication. This specification preserves the user's requested scope. Publication receipts belong in the canonical publishing queue.

## Purpose and boundaries

Build a comprehensive, verified operational directory for an outreach director or coordinator. It must answer both how providers can coordinate and where a person can get a particular service today, at what time, with what eligibility and contact. Prioritize service operations over organizational biography.

Primary geography: Indianapolis and Marion County. Secondary: immediately surrounding communities serving Indianapolis residents, including Hendricks, Hamilton, Boone, Johnson and Hancock counties. Distinguish service location from residency eligibility and label suburban-only offerings. Include nonprofits, churches, ministries, volunteer groups, government, mobile services and legitimate mutual aid.

This is a separate dataset, not education evidence or personal editorial. Keep files under `data/indianapolis-outreach-directory/`, scripts under a dataset-specific namespace, and publication journals/ID registries/query contracts separate. Never use education scripts, education bounty links, or course-blanking tools for this work. The publisher does not edit/deploy Cloudflare for this queue item.

## Geo destination and approval gate

The user selected [Public good](https://www.geobrowser.io/space/f24e3bbd26304474b7e0c2a0877f4bfe), space ID `f24e3bbd26304474b7e0c2a0877f4bfe`, relayed by the frontend task on September 11, 2026. Do not create another space. This supersedes the unresolved-destination and new-space-proposal steps below. Before publishing, still verify current signing authority, scope and schema and complete the directory's verification/privacy gates.

Read-only exact-ID verification at 23:11 UTC confirmed a DAO with topic Public good (`789068315729430884b1bff0dc9ac39b`). Complete editor/member lists both contain personal space `d00460c203779d21d96fcfc6102d7a72`; no key was loaded or transaction submitted for this check. Voting settings include duration 86,400 seconds, quorum 1, flat support threshold 1 and fast-path restrictions for new members. Evidence: `data/indianapolis-outreach-directory/destination-discovery.json`; repeatable read-only script `scripts/indianapolis-outreach-discover-space.ts`. This verifies the selected space's identity and public membership, not the directory schema or readiness to publish. Active education work remains separate.

Initial live discovery September 11, 2026: Geo `spacesConnection` queries filtering representative topic names by `Indianapolis`, then `homeless`, `housing`, `Indiana`, and `social services` returned no nodes with `hasNextPage: false`. These are complete results for those filters only; they do not establish that no suitable space exists (spaces may lack matching representative topic names). Exact-ID lookups confirmed Health datasets (`44eb138f564fbed6ed9ce543de1b849c`) and Places (`84a679ce188f061ac9a92380bac2bab5`). Neither has been approved or verified as a suitable writable home for the complete directory.

Next: inspect space page names/aliases and relevant community scope, ownership and update permissions. If no suitable existing home is found, propose a dedicated **Indianapolis Outreach Coordination** space, including description, owner/editors, governance, maintenance responsibility and any transaction costs; obtain user approval before creating it. Health/Places can supply reusable identities or links without becoming the whole directory's destination by default.

## Data organization

**Contact policy correction, September 12:** only store links to public provider-maintained contact pages/forms/social pages, neutral link labels and link-check dates. Do not retain phone/email/fax values, named contacts, contact-role identities, mailing-only contact addresses or copied details in local artifacts, Geo, prose, exports, API responses or caches. No contact Person entities or `mailto:`/`tel:` links. The [intake handoff](indianapolis-outreach-intake-2026-09-12.md#input-package-and-reproducibility) governs exclusion of contact data already present in the supplied source. Public service addresses remain separately eligible after privacy/access verification.

One master row represents one service/program/location offering. Separate a Tuesday food truck, Thursday showers and permanent pantry even under one organization. Separate distinct locations/eligibility/schedules. Recurrence windows are children of the offering, not duplicate organizations. An organization-level coordination-only record must not masquerade as a walk-in service.

Maintain normalized records for organizations, programs, service offerings, public locations, public contact-source links, schedule windows, exceptions, sources, field-level assertions and organization relationships. The master table and three compact tables are generated views of those records, not independently edited copies.

Add stable local IDs: dataset_id, organization_id, program_id, service_id, location_id, schedule_id, source_id; Geo IDs are mapped only after identity discovery. Include version, record status, valid-from/to, last-reviewed, next-review-due and change history. Dataset IDs namespace local records; verified shared Geo identities are reused across datasets.

Before creating an organization/person/place/property, search all Geo spaces by aliases and identifiers, inspect provenance and log reuse/create/review decisions. Names alone are not enough. Model Parent Organization, Affiliate, Ministry of, Operated by, Fiscal Sponsor, Shared Facility, Shared Outreach Program and Known Partnership as distinct sourced relationships. Do not assume affiliation means identical programs.

Boolean-style fields use Yes / No / Unknown / Not applicable; silence is Unknown, not No. Public contact-source links must be scoped to the appropriate organization/program. Unknown fields stay visible.

## Complete master column contract

Use the following display columns (normalized storage can differ), subject to the contact-policy correction. Preserve the disposition of every original field, excluding prohibited contact values; repeated concepts are single canonical fields reused in views.

### Organization identity

Organization Name; Program / Ministry Name; Organization Type; Website; Facebook; Instagram; Other Social Media; Parent Organization; 501(c)(3) Status if available.

### Primary contacts

Contact Source URL; Contact Link Label; Contact Link Last Checked Date. These replace the original named-contact, phone/email and preferred-contact-detail columns. Link to the provider-maintained page instead of copying its contents.

### Services provided

Hot Meals; Sack Lunches; Food Pantry; Mobile Food Distribution; Street Outreach; Shelter; Emergency Shelter; Transitional Housing; Permanent Supportive Housing; Clothing; Blankets; Hygiene Supplies; Showers; Laundry; Medical Care; Street Medicine; Mental Health Services; Substance Use / Recovery Support; Transportation; Bus Passes; ID / Birth Certificate Assistance; Benefits Assistance; Employment Assistance; Housing Navigation; Case Management; Veteran Services; Youth Services; Family Services; Women-Specific Services; Domestic Violence Services; Legal Assistance; Mail / Address Services; Phone / Charging / Internet Access; Other Services; Service Description.

### Who can receive help

Population Served; Adults; Families; Children; Youth; Veterans; Women; Men; LGBTQ+ Specific Services; Recently Incarcerated / Reentry; Chronically Homeless; Unsheltered Only; Eligibility Requirements; ID Required?; Referral Required?; Appointment Required?; Walk-ins Accepted?; Residency Restrictions; Other Restrictions.

### When help is available

Monday Hours; Tuesday Hours; Wednesday Hours; Thursday Hours; Friday Hours; Saturday Hours; Sunday Hours; Recurrence Pattern; Specific Outreach Day; Specific Outreach Time; Seasonal Schedule; Holiday Exceptions; First-Come / Capacity Limits; Schedule Last Verified Date.

Store timezone `America/Indiana/Indianapolis`, numeric weekday, start/end time, date range, recurrence (including nth weekday), exceptions and source separately. Split multiple daily windows. Handle overnight windows and daylight saving time. Distinguish office/contact hours from service hours. Do not turn appointment-only, rotating routes or a past event into weekly walk-in availability.

### Where help is available

Primary Address; Outreach Location Name; Outreach Address; Neighborhood; ZIP Code; General Area of Indianapolis; Downtown; North; Northeast; East; Southeast; South; Southwest; West; Northwest; Mobile Service?; Encampment Outreach?; Service Area; Transit Accessible?; Nearby IndyGo Route / Transit Center if easily verifiable.

Location mode: publicly advertised fixed stop / rotating locations / encampment outreach / deliberately undisclosed route. Never publish sensitive encampment locations intentionally kept private. Use a safe public contact/referral channel instead. Protect confidential shelter locations as well; no client-level records are requested.

### Food-specific information

Meal Type; Hot Meal / Cold Meal; Breakfast; Lunch; Dinner; Snacks; Grocery Distribution; Days Served; Times Served; Approximate Meals Served; Indoor / Outdoor; Mobile / Fixed; Dietary Accommodations; No-ID Meal Availability; Takeaway Meals Allowed?; People Can Receive Food Without Enrolling in Other Services?; Food Donation Accepted?; Prepared Food Donation Accepted?; Packaged Food Donation Accepted?; Commercial Kitchen Requirement?; Food Volunteer Opportunities.

### Coordination

Does Organization Perform Street Outreach?; Outreach Frequency; Typical Outreach Area; Does It Visit Encampments?; Does It Accept Referrals From Other Organizations?; Referral Process; Can Another Outreach Worker Call Ahead?; Does Organization Participate in Coordinated Entry?; CHIP / Continuum of Care Participation; HMIS Participation if publicly available; Partner Organizations; Known Regular Collaborations; Services They Commonly Refer Elsewhere; Gaps They Publicly Identify; Volunteer Needs; Donation Needs; Partnership Contact; Partnership Notes.

Do not conflate referral acceptance, coordinated entry, CoC membership and HMIS participation. Each requires independent evidence. No access to client HMIS data is requested.

### Operational information

Approximate Number Served; Outreach Frequency (same canonical field as coordination); Number of Volunteers; Number of Staff; Service Capacity; Geographic Coverage; Languages Offered; ADA Accessibility; Transportation Resources; Funding / Grant Notes; Expansion Plans; Recent Program Changes.

Preserve measurement period, unit and approximate qualifiers for counts. Avoid financial research unless materially useful for coordination.

### Source and verification

Primary Source URL; Secondary Source URL where available; Source Type; Date Source Published / Updated; Date Information Verified; Confidence Level (High / Medium / Low); Verification Notes.

Add field-level evidence for schedules, eligibility, contacts, locations and service availability: source_id, source date (nullable), accessed_at, fact-confirmed date (nullable), evidence locator/short excerpt, confidence, conflict and reviewer. A row's high confidence must not hide uncertain hours.

## Research and freshness protocol

Source priority: official website; official social accounts; government/CoC; partners; reputable local news; nonprofit directories; other sources. Google snippets, AI summaries and scraped business directories are leads only. Verify an account belongs to the provider. Prefer newer official social announcements over conflicting older official webpages while retaining and flagging the discrepancy; record effective dates.

For every seed and newly discovered provider search current weekly schedule, outreach/events/volunteer calendar, recent Facebook and Instagram posts, holiday closures and program changes. Determine actual day/time when possible. Capture both source publication/update date and date checked; retrieving an undated page today is not proof of recent schedule confirmation.

If schedule confirmation is absent or older than six months relative to review date, mark exactly **Schedule requires direct confirmation.** Retain stale/undated entries in a separate confirmation-needed view, not as confirmed help today. Even a current schedule is not a guarantee of remaining capacity. Apply known closures and exceptions before presenting availability; never fabricate real-time occupancy.

Confidence guidance: High = authoritative, applicable, current evidence; Medium = credible but incomplete/undated or needing clarification; Low = older, indirect or unresolved conflicting evidence. Assign per critical field and summarize conservatively. Missing public evidence creates a confirmation task, not inferred data.

Do not collect professional contact names or direct details. Prepare a direct-confirmation list with unresolved questions and public contact-page links only; do not send emails, social messages, forms or calls without explicit authorization for outreach.

## Research seeds (not verified operational records)

- St. Vincent de Paul Indianapolis — Unsheltered Ministry
- Hazelwood Christian Church homeless outreach
- Tear Down the Walls Ministries
- Malik's Blankets for the Homeless
- Thy Kingdom Crumb Indianapolis
- Food4Souls
- Horizon House
- Outreach Inc.
- HealthNet Homeless Initiative Program / Street Medicine
- HVAF of Indiana
- CHIP / Coalition for Homelessness Intervention & Prevention
- Urban Outreach Indy

Discover additional providers via official resource/referral/partner lists and county resources; do not stop at these twelve. Track every candidate as included, duplicate/alias, out of scope, inactive or unresolved with evidence. Distinguish coordination bodies from actual service providers. Log search coverage across all requested service categories and counties; comprehensive is a research coverage goal, not an unsupported claim of exhaustiveness.

## Deliverables

1. **Master Service Directory**: comprehensive filterable spreadsheet and machine-readable table with all master fields; data dictionary and stable IDs make it maintainable as an operational database. Seeds must not appear as verified rows.
2. **Weekly Help Schedule**: Day | Time | Organization | Service | Location | Who Can Use It | Contact | Notes. Monday–Sunday then chronological start time; preserve service_id and source links in supporting columns. Unknown times sort separately. Include eligibility, closures, call-ahead and freshness caveats where applicable.
3. **Food Outreach Schedule**: Day | Time | Organization | Meal Type | Location / Area | Mobile or Fixed | Eligibility | Contact | Verification Date. Include recurring food outreach with rotating locations, labeled accurately; do not promise a fixed stop.
4. **Organization Coordination Matrix**: Organization | Food | Street Outreach | Shelter | Medical | Housing Navigation | Area Served | Outreach Days | Primary Contact | Potential Coordination Role. Roles such as evening meals, Sunday outreach, veteran/youth specialist, medical escalation, coordinated entry, emergency shelter referral or showers must follow verified services. Proposed collaboration is labeled as analysis, not an existing partnership.

Generate all four from the same reviewed records/version. Every Contact / Primary Contact / Partnership Contact column means a public contact-source page link only, never copied values. Include supporting Sources, Confirmation Needed, Relationships and Change Log tables where useful. Escape spreadsheet formula-like untrusted text when exporting CSV/XLSX; preserve public-service ZIPs as strings. Actual workbook production should follow the spreadsheet skill when research reaches that stage.

## Gap analysis and final coordination view

Analyze days and meal times with sparse food outreach; geographic, evening, weekend and population gaps; apparent duplication and same-area/time overlap; complementary services; shared referrals, food preparation/distribution and calendar opportunities. Distinguish documented coverage gaps from gaps in research or unverified schedules. Never assume overlap is wasteful: compare population, location, eligibility, capacity and recurrence. Do not count the same shared program twice or sum incomparable service counts.

Finish with **What an Outreach Director Should Know**: who operates where/when; specialties; who should call whom using verified public channels; biggest apparent gaps; opportunities to coordinate routes/schedules; direct-confirmation priorities. Make the practical question easy to answer: What do you need, where are you now, and who can help next?

## Acceptance and maintenance gates

- [ ] Resolve destination and identity/ontology reuse with evidence; new space only after explicit user approval.
- [ ] Finish twelve seed dispositions and documented additional-discovery passes across services/counties.
- [ ] Verify each substantive offering against sources; no invented contact, time or eligibility value.
- [ ] Complete normalized ID/relationship registry, field-level evidence, uncertainty and schedule freshness flags.
- [ ] Produce four mutually consistent outputs and a confirmation-needed list; review duplication and sensitive locations.
- [ ] Validate real examples including Wednesday 14:00, weekend meals, overnight service, stale schedule, holiday closure, unknown eligibility and suburban residency restrictions.
- [ ] Complete qualified gap analysis and director summary; record unresolved coverage and source conflicts.
- [ ] Agree a maintainer and review cadence; propose monthly schedule/contact review and immediate updates for known closures, subject to capacity. No recurring automation requested yet.
- [ ] Prepare destination-scoped dry run; verify dataset membership on every service/schedule query and no education/profile facts in this batch.
- [ ] Record publication approval/scope, proposal/execution/indexing receipts separately; verify all four Geo views and source links.
- [ ] Supply frontend query contract with explicit dataset and space filters, timezone/exception semantics and stale states; frontend integration is a separate task.
