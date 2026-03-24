## Apply Patch

- When you need to edit tracked files, use the `apply_patch` tool rather than invoking the command in the shell; the shell command is unavailable in this environment.
- Feed it a patch envelope (`*** Begin Patch` ... `*** End Patch`) describing the hunks to change so the tool can update the file safely.

## Course/Lesson publishing workflow

- `09_publish_courses_lessons.ts` now builds every Course entity with a query-style lesson block, decorates the `Blocks` relation with the Table view + `Properties` relations (Lesson number, Description, Web URL, Topics), and orders the query by `Lesson number`. Publishing just reruns that script (pass `--publish` and the target space/flags) after data updates.
- Pass `--skip-table-view` to the publish script if you need to rebuild entities without touching the relation metadata (useful when debugging or when the view has to be applied separately).
- `18_blank_courses_lessons.ts` removes all values/relations for Course/Lesson entities, producing `data_to_delete/blank_courses_lessons_ops.txt` so we can start over clean or replay a rollback. Use it first when the target space already has published content you want to flush.
- When column ordering or view metadata gets out of sync, run `tmp/refresh-course-blocks.ts` locally to rebuild each course’s block/relation metadata (or incorporate the same logic into `09_publish_courses_lessons.ts`). Always capture the resulting ops via `data_to_delete/refresh_course_blocks_ops.txt` before publishing.

## Geo API tooling guidance

- For any live GraphQL lookups, use the global `geo-api` skill (`~/.config/opencode/skills/geo-api/SKILL.md`) together with the matching `geo-api` tool (`~/.config/opencode/tools/geo-api.ts`). That skill states the schema-first workflow, and the tool’s helpers already validate UUIDs and sanitize `helperArgs` so you don’t need to hand-write raw `curl` calls.
- The tool exposes a new `entitySpaces` helper that fetches `spacesIn` for an entity; use it when you need to confirm whether an entity lives in both the Geo root space (`a19c345ab9866679b001d7d2138d88a1`) and another (tertiary) space. Always prefer the Geo root’s definition of the `Skill` primitive (ID `9ca6ab1f3a114e49bbaf72e0c9a985cf`) even if the tertiary space surfaces the `Practice` alias.
- Before trusting a type name, check its `spaceIds`/`spacesIn` data so you can tell which spaces currently claim the entity. If you find both `Skill` and `Practice` labels on the same ID, use the Geo root’s “Skill” text value as canonical and document any secondary alias changes.
