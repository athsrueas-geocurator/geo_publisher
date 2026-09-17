# Human publisher CLI

**One example, then one large proposal:** for a new content/schema/rendering pattern, publish one representative example and verify it live. Then consolidate the remaining related work in the same space into one proposal and vote once. Reuse prior verified pilot evidence for unchanged patterns. CLI package listings are preparation units, not instructions to publish/vote each separately. Follow the [consolidated proposal procedure](publisher-reliability-review.md#consolidated-proposals--user-requirement); where composition is unsupported, extend the validated workflow rather than loop over small submissions. This guidance does not claim the CLI already has a general package-composition command.

Start in the publisher folder with `bun run publisher`, or run `C:\Users\tfreestone\Code\athsrueas\geo-publisher\publisher.ps1` in PowerShell. The launcher locates the repository itself. No agent or GitHub login dialog is involved. Install Bun and run `bun install` once. The interactive menu offers search, inspect, check, publish, vote and verify; it exits after the chosen action so you can examine the output.

Use `bun run publisher help` for command help or `bun run publisher errors` for recovery guidance. The older `bun run geo:help` entry point now opens the same help. Noninteractive invocation without arguments prints help and never waits for input.

## Find the right data

```powershell
.\publisher.ps1 queue
.\publisher.ps1 queue education
.\publisher.ps1 list --status pending
bun run publisher find reading
bun run publisher sources literacy
bun run publisher show sources src-003
bun run publisher discover initiatives
bun run publisher list
bun run publisher inspect year-up-collection
bun run publisher geo "Early childhood education"
```

Start with `queue`: it reads unfinished checkboxes directly from `publishing_queue.md`, preserves section order and shows source line numbers and linked evidence. It does not create a second task ledger or treat a checkbox as a prepared package. Education remains active; deferred sections retain their dependencies. `list --status pending` excludes recorded executions, legacy artifacts and superseded attempts; it includes held drafts and supported unexecuted packages.

Search displays 20 results at a time. Use `--limit 1..100` and `--offset` to browse more, or narrow the search words. Package filters are `--status pending|held|submitted|executed|prepared|legacy`; these describe local records, never fresh publication readiness. `inspect` now prints a next action or names blocking flags. The menu's option 8 opens the unfinished queue.

Some journals are intentionally marked **superseded** when a failed pre-submission attempt has an executed replacement. They remain inspectable as evidence, but `list --status pending` hides them so operators do not retry obsolete payloads. The Year Up 2,554-applicant attempt is superseded by the verified 2,544-applicant v2 correction.

`list --status pending` also excludes legacy artifacts. They remain available through `inspect` for historical evidence, but need a separately reviewed contract before a new write. A missing historical journal is not treated as a malformed path or a reason to recreate the old payload.

`find` searches package names/IDs, unprepared collection plans and all original initiative, bibliography and question fields. `sources` limits results to original records. `show` prints a complete original row and its recorded source-to-Geo mapping. These records can contain known citation and classification errors; inclusion in the source is not publication clearance. Read the source-error notes before importing a finding.

Package IDs are stable names such as `year-up-collection`. Copy the ID, not a path, into inspect/check/publish. Search results distinguish prepared, held, legacy, submitted and recorded execution. An execution label reflects the saved journal; use verify for a fresh read. Completed original-catalog packages display `catalog verified; rerun …` instead of pending, because their older journals preserve only the submitted-vote state. Use `bun run education:verify-original-initiative-catalog` or `bun run education:verify-original-source-catalog` for the authoritative live check; never replay an executed catalog proposal to reconcile local hashes.

`geo` performs a paginated, case-insensitive exact-name search across all spaces and types. It displays IDs, descriptions, types and owning spaces. A timeout or truncated traversal fails; an exact-name miss still requires identifier/alias checks before entity creation. It does not automatically merge candidates or grant creation permission.

`discover initiatives` refreshes bounded, cursor-complete exact-name candidate discovery for all 76 pinned original Initiative records. It records the result in `data/education/original-initiative-exact-name-discovery.json`, but deliberately does not alter the source-to-Geo crosswalk or prepare a write. A no-candidate result requires alias, source/version, type and scope review; it is never a create decision.

## Publish a reviewed package

The reviewed `tennessee-category-v1` package is also supported through all CLI stages. It permits only the fixed program-to-category relation, with persistent IDs, bound evidence and fresh preconditions; it does not enable arbitrary taxonomy edits. Its publication and ten-check verification are recorded in [the category review](original-initiative-category-discovery-2026-09-16.md).

September 16 extension: the exact two-Claim `tutoring-metric-repair-v1` contract also supports inspect/check/publish/vote/verify. It binds the before-state and exact operations and rereads live preconditions before a new submission. This does not enable arbitrary legacy repairs. Its PowerShell publication completed with one vote, followed by eight passing preservation/governance/bounty checks; see [the correction receipt](tutoring-metric-correction.md).

1. **Inspect:** `bun run publisher inspect PACKAGE`. Review destination, bounty, operation count, hash, evidence paths and every raised flag. This CLI signs only shared `collection-v1` Education packages. Legacy batches remain searchable/inspectable but need a supported review contract before new signing.
2. **Check:** `bun run publisher check PACKAGE`. This checks local evidence and runs the existing fresh DAO preflight and guarded dry run. It does not submit a transaction. A stale validation requires preparation from genuinely reviewed inputs; the CLI does not change timestamps for you.
3. **Publish:** `bun run publisher publish PACKAGE`. It repeats checks, displays the exact package and requires typing its ID. This submits the DAO proposal and bounty link. Publication is not execution.
4. **Vote:** `bun run publisher vote PACKAGE`. Confirm the same package ID to send one FAST YES vote or inspect its existing execution state. The signer must have the applicable DAO role. A successfully journaled vote awaiting indexing is polled, never duplicated.
5. **Verify:** `bun run publisher verify PACKAGE`. This checks collection membership, preserved facts and stored ordering against live Geo. Open the printed Dataset link and review every table page and a dedicated Claim page for readable facts, units and citations.

For scripts or redirected input, writes require `--confirm PACKAGE`, exactly matching the chosen ID. There is no `--yes`, force, skip-review or gate-bypass option. No write happens merely from opening the menu, finding data or inspecting a package. An already executed package is not resubmitted.

Each write holds an exclusive per-package `.publisher-lock`. If the CLI is interrupted, first inspect whether its process still runs and reconcile the transaction journal. Remove an abandoned lock only after that review; the CLI never deletes a lock because a timer expired. This coordinates this CLI's instances; legacy scripts do not share the lock.

Keep `PK_SW` in root `.env`, configured locally in your editor. Never pass a private key as an argument. Local browsing needs no credentials; preflight/signing uses the existing publisher configuration. The CLI uses the existing Geo testnet workflow; it is not a network-switching interface.

## Preparing new data without an agent

For a new collection of existing factual Claims, author three separate files using [the collection contract](education-collection-workflow.md):

- **Plan:** name, concise description, durable notes, source IDs, ordered table groups, member IDs and columns.
- **Facts:** independently source-checked expected values, units, source version/location, readable Claim headers and observed/model classification.
- **Review:** source, identity and content decisions with exact input/evidence hashes and complete cross-space discovery records.

Then run:

```powershell
bun run publisher prepare data/education/example-plan.json data/education/example-facts.json data/education/example-review.json
bun run publisher inspect example
```

Preparation invokes the shared builder, including live schema, fact equality, identity, membership and immutable-journal checks. It writes local preparation artifacts only. Existing published collections require a separately reviewed delta, not another new collection. The interface deliberately does not auto-approve a research review, infer missing values, or turn arbitrary CSV files into Claims. General CSV mapping and legacy Course/Lesson publishing retain their separate workflow; this first CLI version does not replace those contracts.

## Raised flags and recovery

| Flag / symptom | Meaning | Action |
| --- | --- | --- |
| HELD / modeled | Required schema or consumer semantics are unresolved | Resolve the documented model-status mapping; preserve the hold. Existing observed subsets may already be published. |
| EVIDENCE / Evidence changed | Reviewed bytes no longer match | Compare changes with source evidence and review again. Preserve a submitted package; use a new delta. Never edit stored hashes just to pass. |
| HASH | Operations changed after review | Restore only from verified evidence or prepare a newly reviewed package; never retry changed submitted ops. |
| LEGACY | No supported human CLI review contract | Inspect its existing journal and notes. Migrate the workflow before signing new content. |
| TARGET | Wrong space/bounty | Education goes to Education datasets; Indianapolis outreach goes to Public good and remains tabled. |
| JOURNAL / uncertain | A previous attempt may have broadcast | Inspect the existing hash/proposal. Do not delete the journal or start over. |
| Validation older than 15 minutes | Live readiness expired | Rerun reviewed preparation for unsubmitted inputs and check again. Do not alter timestamps. |
| Missing membership/key | Signer setup or DAO authority is missing | Configure locally or arrange the DAO role; never paste a secret. |
| GraphQL / timeout / pagination | Read unavailable or incomplete | Retry the same read; consult [API diagnosis](geo-api-diagnosis.md). No absence or duplicate-creation conclusion follows. |
| Existing membership/candidate | Data may already be represented | Review the existing IDs across spaces and prepare an update if appropriate. |
| Factual/locator/value mismatch | Source expectations and live facts disagree | Review exact source version, scope, types and units. Do not overwrite facts to make a check pass. |
| Vote confirmed, execution pending | Geo has not exposed execution yet | Re-run vote against the same package; never republish. |

Exit codes: `0` command succeeded, `1` check/workflow failed, `2` usage or confirmation required. Inspection with blocking flags exits `1`. Operation output redacts 64-character identifiers defensively; full transaction hashes remain in local journals. A passing command certifies its stated stage only, not scientific validity, complete migration or frontend acceptance.

## Verification — September 16, 2026

### Bounded PowerShell trial and improvements

The launcher ran `find career`, `inspect career-academies`, `list`, and `verify year-up-collection`. Year Up live verification passed all 26 checks over seven Claims and four membership pages, refreshing its query-verification artifact. No new proposal or vote was sent. The trial stopped before new source/identity review; the remaining queue is not a set of ready submissions.

The new pending filter exposed stale execution journals for Enhanced Reading and PACE. Running `vote` with the exact package confirmations returned `already-executed` for both and updated their local journals without sending transactions. Their execution timestamps match the existing publication receipts. Recorded status is now reconciled for these two packages; other historical attempts still need individual review.

Observed friction: the old unbounded list printed 249 packages (mostly executed); finding unfinished work required opening Markdown; legacy inspection returned generic recovery advice. Added bounded search, recorded-state filters, a canonical queue reader, explicit next actions and specific legacy guidance. Corrected stale Career Academies prose describing an executed locator repair as still paused. Its local assessment script now explicitly disclaims live readiness.

Assessment: usable for finding, inspecting and verifying supported reviewed packages. Source research, review-file authoring, original-field mappings and legacy deltas still require technical work. This trial verifies read-only operation and UX improvements, not end-to-end signing usability. The menu still exits after one action; shared child workflows still print technical details. Neither limit justifies weakening publishing gates.

Validation after the improvements: ten CLI tests pass (41 assertions), TypeScript passes, and the Markdown audit reports zero broken local links across 101 files. The 78 status-language candidates are review suggestions, not a claim that all documentation is current.

TypeScript passes. Seven CLI tests cover source/package distinction, path containment, held-publication rejection before preflight/signing, unsafe options, noninteractive help, source/crosswalk preview and actionable errors. The PowerShell launcher successfully searched Year Up from the sibling frontend directory. A real terminal session completed the interactive menu → Find → Year Up flow. No proposal or vote was sent during CLI development; actual signing remains delegated to the existing guarded scripts, with confirmation and a per-package lock added by this interface.
