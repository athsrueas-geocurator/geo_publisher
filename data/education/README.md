# Education publication preparation

The destination is Education datasets (`dac259bad48a11adf97fe36857d85206`). The configured publisher is a member. The user authorized submitting proposals and will ask Armando to vote. No data in this directory establishes that an edit was applied to Geo.

- `source/manifest.json`: pinned upstream files and SHA-256 checksums.
- `intake.json`: full original fields, stable source keys, ordered references, research profiles. Geo IDs are deliberately unallocated until identity resolution.
- `intake-report.json`: counts, link validation and shared source URLs.
- `landing-card-registry.json`: initial persistent source keys. Explicitly reconcile text edits/removals; never replace identity with a new hash of edited text.
- `discovery/`: public all-space exact-name searches, candidate provenance and pagination evidence. Complete refers only to the stated query scope, not comprehensive identity matching. Empty results do not authorize creation.
- `preflight.json`: current personal-space membership, governance and recent proposal observations. Recheck before submitting; credentials are excluded.
- `source-corrections.json`: reviewed primary-source replacements for two incorrect citations. Intake preserves `data` unchanged and places corrections in `publicationData`; downstream publication must use the latter and retain correction provenance.
- `bibliography/`: 106 metadata probes; identifier verification is not verification of the source's findings. Some return blocked/missing/rate-limited responses and remain unresolved.
- `saga-extraction.json`: initial numeric extraction with separate ITT/TOT rows, standard errors, source table/page locators, and unverified price year left null.
- `mapping-plan.json`: complete leaf-field inventory for the current intake; unresolved ontology assignments prevent operation generation. It explicitly requires the bounty link.

Commands, from geo-publisher:

```powershell
node scripts/education-snapshot.mjs
node scripts/education-intake.mjs
node scripts/education-discover.mjs --intake sources initiatives datasets
node scripts/education-bibliography.mjs
node scripts/education-identifiers.mjs
node scripts/education-mapping-plan.mjs
bun run scripts/education-preflight.ts
```

The snapshot script does not overwrite differing pinned bytes. Intake checks source hashes, source-key uniqueness, all declared citation/comparison/dataset references, and continuum bounds. It preserves fields without treating editorial assessments as experimental effect estimates. It is not yet a full source-schema validator, Geo operation generator, or publication reconciler.

The 18 catalog entries and 22 upstream profiles describe sources and acquisition metadata. They are not evidence that raw national datasets were acquired here. Contextual benchmark links must retain their non-causal role. New landmark-study extractions are additional work beyond the original 339 records.

Next: resolve source metadata and cross-space identities, verify ontology field/data types, extract the landmark study estimates, generate lossless operations with stable entity/relation IDs, dry-run, submit member proposals with a durable journal, and reconcile after governance execution and indexing. Preserve the complete migration scope; a first batch is not full completion.
