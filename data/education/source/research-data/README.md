# Research Data Intake

This directory is the evidence intake layer for future initiative additions. It separates:

- **cataloged datasets**: reproducible external outcome, context, and evidence sources;
- **snapshots**: small, versioned collection samples that verify access and field shape;
- **initiative candidates**: the historical research intake that prompted new dossier additions;
- **comparison claims**: the row-level structure required before an initiative can be compared on outcomes, cost, and implementation.

Large national extracts are intentionally excluded from Git. They must be fetched from their primary source, documented with a vintage and codebook, then transformed into a bounded analysis table outside the static website build.

## Files

- `dataset-catalog.json`: source-of-truth catalog for external datasets and evidence repositories.
- `initiative-candidates.json`: audited intake history for the seven candidates promoted to the dossier, including their published initiative slugs.
- `comparison-claims.template.csv`: required fields for a comparable study-outcome claim.
- `snapshots/urban-ccd-dc-2022.json`: a small, reproducible CCD directory sample used to verify public API access and NCES join fields.
- `download-plan.json`: current public-download plan and documented constraints for every catalog source.
- `ingestion-report.json`: generated manifest with paths, record counts, sizes, checksums, and access limitations.
- `dataset-profiles.json`: generated table and field inventory for acquired raw artifacts.
- `initiative-dataset-links.json`: explicit, non-causal roles for datasets when comparing published initiatives.
- `wwc-dossier-index.json`: complete list of cited What Works Clearinghouse records, mapped to their source IDs and related initiatives.
- `source-coverage-audit.json`: generated, initiative-by-initiative source coverage and the current research queue.

## Added National Sources

The intake now includes ERIC; NTPS/TFS; ECLS-K; HSLS:09; SSOCS; Evidence for ESSA; National Student Clearinghouse Research Center enrollment reporting; and the NCES State Longitudinal Data Systems program.

Some of these are downloadable public files, while others are controlled-access systems or evidence repositories. The download plan captures a versioned official access artifact for every source. Do not describe those captures as microdata downloads when NCES DataLab, a restricted-use license, a state agreement, or a separate research arrangement is required.

In particular, SLDS is an integration target rather than a national dataset: future state extracts require the state's approval, data dictionary, disclosure controls, and a study-specific comparison design.

## Collection

Run the bounded CCD sample collector:

```bash
npm run research:collect-metadata
```

The collector supports an alternate public school-directory slice without modifying the catalog:

```bash
node scripts/collect-research-metadata.mjs --year=2022 --fips=11
```

To acquire every currently automatable artifact in the download plan, use:

```bash
npm run research:download
```

Then profile the acquired archives and tables:

```bash
npm run research:profile
```

Raw files are placed in `research-data/raw/` and excluded from Git because they are third-party source artifacts, not site content. The generated `ingestion-report.json` records each exact artifact URL, size, and checksum.

To verify the manifest against a local acquisition, run:

```bash
node scripts/validate-research-data.mjs --verify-raw
```

To regenerate the source-expansion queue after adding or reviewing sources, run:

```bash
npm run research:audit-sources
```

Use `NCES_ID` / `ncessch` for schools and `LEAID` / `leaid` for districts. Never infer a causal effect by joining outcome trends to an initiative name; comparison claims must retain their study design, comparator, population, and study-period metadata.

## Admission Rule

An initiative moves into `content/initiatives.json` only after it has:

1. a stable primary source or peer-reviewed study link;
2. a normalized research design and finding, including null or negative findings;
3. an explicit population, setting, outcomes, and comparison condition; and
4. at least one related dichotomy or a documented reason it is a standalone case.
