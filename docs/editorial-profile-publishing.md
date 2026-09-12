# Geo Companion editorial and personal-profile publishing

Status: queued by the user on 2026-09-11, after the education-data work. This is future publishing guidance, not a request to interrupt the current migration or publish placeholder opinions.

## User intent and destination

The editor's published editorial and other personal content should live in their [Geo profile space](https://www.geobrowser.io/space/d00460c203779d21d96fcfc6102d7a72), ID `d00460c203779d21d96fcfc6102d7a72`, and be attractive and useful when read directly on Geo. Geo Companion should present this content from that source instead of maintaining a separate authoritative copy.

The user supplied this destination. The public web reader could not render the profile in this documentation task; no layout, ownership, publishing permissions, or current content was newly verified. Reuse applicable prior verified publisher evidence and recheck network/authority before execution. Do not confuse this personal space with Education datasets or the Education bounty's space.

## Sequence and scope

Follow [publishing_queue.md](../publishing_queue.md). Finish and verify the current education-data scope before starting this item, unless the user explicitly changes priority. If governance or indexing stalls, report the dependency rather than silently marking education complete or starting this queue item.

The initial prototype exports a reading-list object with `title`, `intro`, and ordered `picks: [{id, note}]`. Treat it as draft input to a Geo mapping, not a Geo schema. Obtain the actual user-authored selection and commentary; do not invent the editor's agenda. Articles, essays, explainers, curated collections and other personal content can use this same profile home as the user supplies them; this list does not authorize generating or publishing an unsolicited content backlog.

## A presentation that works on Geo

Before modeling, read applicable repository design guidance, especially [content policy](geobrowser-content-policy.md) and [description guidelines](education-description-guidelines.md), plus the current vendored ontology/publishing skills. Discover supported types and actual renderers; do not invent type/property IDs.

- Give each editorial or collection a clear, human-readable title and at most two concise description sentences. Put the full argument, rationale, caveats and citations in ordered, labeled content blocks.
- Present an inviting introduction, a short set of featured items in intentional order, and a clear path to further reading. Each featured item needs a readable title, the editor's reason for selecting it, and a link to the original debate/claim and relevant evidence.
- Use headings and short paragraphs so the argument is easy to scan. Prefer a compact collection/gallery when that renderer is verified; use a table only when comparing structured facts benefits the reader. Avoid long descriptions and walls of metadata.
- Use relevant, rights-cleared cover imagery only where useful and supported. Keep dimensions reasonable and include meaningful alternative text where supported. No generic decorative asset is required to complete the first editorial.
- Attribute the author's perspective and publication/update dates. Label recommendations as editorial choices, distinct from Geo's public voting signals and from source-backed factual claims. Include limitations and contrary evidence when needed to preserve the supplied material's meaning.
- Inspect how the collection is discovered from the profile: readable entry point, links or supported profile navigation. Preserve existing profile content and layout unless a specific change is needed and authorized. Do not replace or blank the profile.

Known rendering trap: the publisher observed that Geo's dedicated Claim page can hide attached text blocks and numeric properties. Therefore, an indexed Blocks relation alone does not prove the article or reading-list rationale is visible. Use an appropriate verified page/entity presentation and inspect the actual profile entry and content page on desktop and mobile before marking this complete. Record screenshots or other concrete rendering evidence locally.

## Graph mapping and frontend contract

Discover and reuse existing entities across spaces by identity. Reference the existing debate/claim/source IDs with their appropriate space context; do not create duplicate debates merely to feature them. Personal commentary belongs in the editor's space and does not authorize modifying facts in another space.

Resolve and document the mapping for author/profile, content kind, title, brief description, ordered content blocks, featured-item relations, per-item rationale, source links, relevant topics, publication/update dates and draft/published status. Preserve editorial order and distinguish a draft from published material. Keep draft exports local until the intended publication step.

Return a versioned frontend contract: network/endpoint, profile-space ID, collection/page IDs, verified types and properties, ordering rules, space-specific text/block queries, asset URLs or CIDs, missing/deleted/unpublished handling and sample responses. Geo Companion must scope the editor's content to this profile, explicitly render the relevant blocks, sanitize untrusted content, and keep factual metrics separate. Publishing an edit should be visible after indexing and refetch without a frontend rebuild.

Journal stable entity, block, edge and relation-entity IDs for idempotent retries. Record publication receipts, indexing checks and source-to-Geo mapping. Preserve prior publication evidence and avoid destructive clean-slate scripts.

## Storage and egress boundary — user requirement

All heavy content must be delivered from Geo's content infrastructure or Cloudflare. Published editorial and personal graph content have their canonical home in Geo; the companion's app bundle and any necessary derived public assets can live on Cloudflare.

- The browser reads public Geo data and retrieves media directly from a verified Geo content endpoint or appropriate gateway, or from Cloudflare hosting/storage.
- A CID alone is not proof that an asset is persistently hosted. Record the actual provider, gateway, pinning/retention responsibility, CORS behavior and applicable cost/size limits. Do not silently introduce an unverified third-party permanent-storage dependency.
- Do not place or serve article bodies, videos, audio, images, large datasets, attachments or full API-response archives on `linux-cloud`. Do not make it a bulk proxy or use a tunnel that still carries those bytes through the VM.
- If the VM later has a justified role, limit responses to small references, IDs, manifests, change notifications or bounded coordination results. Document that role and measure its bytes; a redirect does not remove upstream access restrictions.
- Keep signing keys and deployment tokens local or in approved server-side credential storage. They never belong in Geo content, public blocks, Cloudflare static assets or the browser bundle.

## Acceptance checklist

- [ ] Education-data predecessor meets its agreed acceptance criteria and the queue can advance.
- [ ] User-supplied editorial draft/picks selected; target network and personal-space authority verified.
- [ ] Existing ontology and cross-space entity reuse resolved; layout plan checked against applicable design documentation.
- [ ] One editorial/reading-list pilot publishes under the user's applicable authorization, with stable IDs and receipt evidence.
- [ ] Profile entry and complete editorial render attractively on Geo, including full rationale, source links and item order; desktop/mobile checked.
- [ ] Geo Companion reads the same published content and order directly from Geo, with explicit loading/error states and no silent static fallback.
- [ ] All heavy assets are verified on Geo infrastructure or Cloudflare; browser network inspection shows no bulk-content requests through the VM.
- [ ] Editing on Geo followed by indexing/refetch changes the companion without rebuilding it.
- [ ] Record the reusable recipe and only then queue further user-provided personal content.
