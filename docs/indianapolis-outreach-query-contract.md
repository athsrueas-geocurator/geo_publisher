# Indianapolis outreach query contract — draft, September 12, 2026

**Not ready for operational reads or publication.** The user approved Public good as destination; that does not mean a directory Dataset or eight service records have been published. The eight-row intake is a recommended first slice, not a verified/published pilot. This bounded handoff lets frontend work identify the actual missing mappings without waiting for all education work. Governing requirements: [intake](indianapolis-outreach-intake-2026-09-12.md) and [directory specification](indianapolis-outreach-directory.md).

## Live evidence and exact IDs

`scripts/indianapolis-outreach-review-contract.ts` recorded read-only evidence in `data/indianapolis-outreach-directory/contract-discovery.json` on September 12. It exhausts each exact-name candidate query, destination Dataset type census, space-page Blocks, and each of those blocks' destination Collection item edges. Dataset census returned zero; four page blocks have zero explicit Collection item edges. Query-style/ranking blocks may obtain content differently; these checks do not prove every service is absent throughout Geo. No contact records or raw source captures were read into this report.

| Role | Verified ID | State/meaning |
| --- | --- | --- |
| Destination | `f24e3bbd26304474b7e0c2a0877f4bfe` | Public good |
| Space page | `789068315729430884b1bff0dc9ac39b` | Not the directory Dataset |
| Directory Dataset / offerings block | Not assigned | Cross-space identity review and publication pending |
| Dataset type | `0c4babfb43893486af827341bbf32e09` | Used in live destination census |
| Service type | `2f3e568ca8cb4d6ea130829c3012648f` | Root-space type candidate; offering scope still needs semantic review |
| Organization type | `9547f4fb78744de0a9a9fdd7b4c01c0c` | Root-space type candidate |
| Place type | `783bc688e65f4e54b67fa5643d78345e` | Root-space Type; distinguish Renderable type with same name |
| Event type | `4d876b81787e41fcab5d075d4da66a3f` | Root-space type candidate for dated events |
| Types | `8f151ba4de204e3c9cb499ddf96f48f1` | Relation |
| Blocks | `beaba5cba67741a8b35377030613fc70` | Relation from Dataset/page to content block |
| Collection item | `a99f9ce12ffa4dac8c61f6310d46064a` | Relation from explicit collection block to member |
| Sources | `49c5d5e1679a4dbdbfd33f618f227c94` | Relation; source identity/provenance review required |
| Web URL | `412ff593e9154012a43d4c27ec5c68b6` | Text containing reviewed public HTTPS URL |
| Location | `95d770021faf4f7cb7deb21a7d48cda0` | Root Relation to place, not coordinate scalar |
| Start time | `2d696bf0510f403e985b8cd1e73feb9b` | Root Datetime; not a recurring weekday clock |
| End time | `c3445f6be2c04f25b73a5eb876c4f50c` | Root Datetime; unknown remains absent |

Do not select by label alone: Location candidates include Text, Relation and Point; Start time includes Text, Time and Datetime. `Schedule` property candidate `0879b8f42bdae60f475e5c4be47bd231` is Text, not proof of a typed recurrence API. Timezone candidate `537d78d9c0134cc6aa7c5d5a4e474c03` is Text outside root. Latitude/Longitude each have two Float candidates. Their definitions and established usage still need review before choosing coordinate/recurrence mappings. Exact searches for Program and Operated by were empty; this is not sufficient alias/semantic discovery to create new schema.

`Dataset entries` (`d66cd445e09a41809af46d86f083b41c`) is an education-space Relation, distinct from native Collection item. Do not assume it defines outreach membership. Proposed directory membership is Dataset → Blocks → an explicit offerings collection → Collection item → offering, with every edge scoped to Public good. Final Dataset and block IDs must be supplied after identity review; never treat all Public good entities as app members.

## Tested query shapes

Read endpoint: `https://api-testnet.geobrowser.io/graphql`, public POST without wallet credentials. HTTP success with GraphQL errors is a failed query. The following census shape was run with the destination above and returned a complete empty result:

```graphql
query OutreachDatasets($space: UUID!, $after: Cursor) {
  entitiesConnection(first: 20, after: $after, spaceId: $space,
    typeId: "0c4babfb43893486af827341bbf32e09") {
    nodes { id name }
    pageInfo { hasNextPage endCursor }
  }
}
```

This collection shape was tested against the four existing space-page blocks, returning zero explicit members. **Draft for future directory use:** `$block` must come from verified directory membership, not one of those unrelated blocks or an invented ID.

```graphql
query OutreachMembers($block: UUID!, $space: UUID!, $after: Cursor) {
  entity(id: $block) {
    relations(first: 20, after: $after, orderBy: POSITION_ASC, filter: {
      spaceId: { is: $space }
      typeId: { is: "a99f9ce12ffa4dac8c61f6310d46064a" }
    }) {
      nodes { id entityId toEntityId position }
      pageInfo { hasNextPage endCursor }
    }
  }
}
```

Fetch detail only for established offering members and only through approved property/relation allowlists. Do not request all values or arbitrary related Person records. Scope detail facts to Public good; cross-space identity reuse does not import all other spaces' facts. Exhaust cursors with repeated/missing-cursor detection; a failed later page invalidates completeness. Replace membership snapshots after a successful complete refresh, rather than append-only caching that retains removed services. Do not substitute local input JSON for missing Geo content.

## Required semantics still awaiting mappings

An offering links to its program, operator, host (when different), and explicitly public service location. Sharing a place does not merge operators or offerings. Coordination-only records remain searchable but cannot become walk-in destinations. Public contact-source links contain only reviewed HTTPS pages plus neutral labels and link-check dates; no phone/email/fax values, staff identities, copied details, contact Person relations, mailing-only addresses or contact values embedded in URLs.

Each schedule window needs a persistent ID, service membership, `America/Indiana/Indianapolis` timezone, nullable local start/end, recurrence or explicit occurrence date, validity bounds, nth-weekday support where sourced, closures/exceptions, and field-level source/review/conflict status. Root Datetime alone cannot encode recurring local hours. Unknown end time never establishes an open interval. Apply exceptions and expiry even to cached records; an undated or over-six-month-unconfirmed schedule requires direct confirmation. A reviewed web link is not provider-confirmed availability or capacity.

Each location needs verified public-access purpose, coordinates with source/precision and review state before map inclusion. All intake coordinates are absent. Unknown coordinates remain unplotted; no city centroids, headquarters substitution, staging areas, private residences, encampments or undisclosed routes. Public street address evidence alone does not establish a client entrance.

Eligibility/capability values preserve true, explicit false and unknown; missing does not mean unrestricted or unavailable. Field evidence needs source URL/locator, nullable source issue/effective date, accessed date, review expiry and unresolved conflicts. Operational schedule, source and restriction mappings, explicit collection IDs, stable service crosswalk and all publication receipts remain pending.

## First-slice source and gap queue

Snapshot path: `../Open_Data/outputs/indy-outreach-20260912/directory-data.json`; exact row key is `Service ID`. Source URLs below are allowlisted input references, **not freshly confirmed operating facts**. Raw files contain contact data and must not be copied. S038's input staff-page URL is omitted here because it does not establish coordination-service facts; find the official organizational/service page.

| Input row | Source location | Remaining review |
| --- | --- | --- |
| S019 | [Outreach services](https://www.outreachindiana.org/services) | Offering/operator identity, useful sourced description, public center access and specific hours |
| S029 | [HealthNet HIP](https://www.indyhealthnet.org/hip) | Hosted youth-clinic operator/host/place distinction; clinic end-time conflict; office move is not a clinic move |
| S038 | Input S038; official organizational page to locate | Coordination-only scope and identity; no walk-in instructions from an office |
| S076–S077 | [We Bloom Recovery Cafe](https://webloom.org/recovery-cafe/) | Member access, meal/intro versus opening hours, unknown meal end and September validity |
| S078–S079 | [September calendar](https://webloom.org/wp-content/uploads/2026/09/Sept-Calender-2026.png) | Render and reconcile dated clinic/visit entries; past dates and unknown ends; no invented weekly recurrence |
| S101 | [Gleaners updates](https://www.gleaners.org/hours-weather-updates/) | Dated pantry schedule, vehicle/no-car access, eligibility, holiday exceptions and capacity caveats |

If a URL fails or times out, search for the current official page or equivalent authoritative source and record replacement evidence. Do not treat a fetch error as a false fact or silently replace a dated event with a newer recurring schedule. Complete all-space entity reuse checks before allocating any offering, operator or place IDs.

## Frontend acceptance cases (synthetic requirements, not published responses)

| Case | Required behavior |
| --- | --- |
| Verified recurring window within validity, eligible public place | May show scheduled availability after exceptions, with capacity caveat; map only verified coordinates |
| Missing end time, unresolved hours or conflicting evidence | Searchable record; no inferred Open now interval |
| September-only event viewed in October | Expired event, excluded from current availability |
| Member-only meal or residency restriction | Preserve restriction; do not label universal access |
| Coordination-only organization | Coordination view; no walk-in map pin |
| Complete empty membership | Empty state; no static fallback or invented records |
| Failed/truncated query | Unavailable/incomplete state; no completeness or absence claim |

Current truthful handoff state is `ready: false`, `datasetId: null`, `offeringsBlockId: null`, with the gaps above. These are draft application semantics, not Geo response fields. Acceptance still requires actual field mappings, minimized source-to-Geo crosswalk, reviewed facts, receipts and rendered verification; do not mark the outreach publication queue complete.
