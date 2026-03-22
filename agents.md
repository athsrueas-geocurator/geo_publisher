## Apply Patch

- When you need to edit tracked files, use the `apply_patch` tool rather than invoking the command in the shell; the shell command is unavailable in this environment.
- Feed it a patch envelope (`*** Begin Patch` ... `*** End Patch`) describing the hunks to change so the tool can update the file safely.

## Course/Lesson publishing workflow

- `09_publish_courses_lessons.ts` now builds every Course entity with a query-style lesson block, decorates the `Blocks` relation with the Table view + `Properties` relations (Lesson number, Description, Web URL, Topics), and orders the query by `Lesson number`. Publishing just reruns that script (pass `--publish` and the target space/flags) after data updates.
- `18_blank_courses_lessons.ts` removes all values/relations for Course/Lesson entities, producing `data_to_delete/blank_courses_lessons_ops.txt` so we can start over clean or replay a rollback. Use it first when the target space already has published content you want to flush.
- When column ordering or view metadata gets out of sync, run `tmp/refresh-course-blocks.ts` locally to rebuild each course’s block/relation metadata (or incorporate the same logic into `09_publish_courses_lessons.ts`). Always capture the resulting ops via `data_to_delete/refresh_course_blocks_ops.txt` before publishing.
