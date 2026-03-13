# Schema-Mapped Publishing

This workflow prevents hardcoded Course/Lesson schema assumptions by deriving publish mappings from the live API schema.

## 1) Mapping decision artifact

Generated file: `data_to_publish/mapping/course-lesson.mapping.decisions.json`

Key sections:
- `types.course` / `types.lesson`: type IDs and schema fingerprints from live API.
- `fields[]`: per-source-field proposal + `status` (`pending`, `accepted`, `rejected`, `ignored`).
- `accepted`: the selected mapping target used by publishing logic.
- `relation`: optional relation policy per field:
  - `mode`: `by_name`, `by_slug`, `by_source_id`, `manual_map`
  - `targetCreation`: `must_exist` or `create_if_missing`
  - `normalization`: delimiter/trim/lowercase/dedupe
  - `crossFile`: rules like `lessons.Courses -> courses.course_id`

## 2) Proposal + decision commands

- Generate proposals:
  - `bun run map:propose -- --target-space <SPACE_ID>`
- List pending decisions:
  - `bun run map:decide -- --action list`
- Accept a proposal:
  - `bun run map:decide -- --action accept --type lesson --field "Topics"`
- Reject or ignore:
  - `bun run map:decide -- --action reject --type course --field "Provider"`
  - `bun run map:decide -- --action ignore --type lesson --field "lesson_id"`
- Configure relation behavior:
  - `bun run map:decide -- --action set-relation --type course --field "Providers" --mode by_name --creation create_if_missing --target-type-id 484a18c5030a499cb0f2ef588ff16d50`
  - `bun run map:decide -- --action set-relation --type lesson --field "Courses" --mode by_source_id --creation must_exist --cross-target-set course --cross-target-key course_id`

## 3) Publish code integration

`09_publish_courses_lessons.ts` consumes the mapping artifact and:
- blocks if any field is still `pending`,
- applies only `accepted` mappings,
- ignores rejected/ignored fields,
- builds ops from `data_to_publish/generated/courses.json` and `data_to_publish/generated/lessons.json`.

## 4) Schema drift guard

Before generating ops, `09_publish_courses_lessons.ts` re-queries live type schema and compares fingerprints.

If fingerprints differ from the decision file, publish is blocked and you must regenerate mappings.

## 5) Python fuzzy dedupe guard

Before building publish ops, `09_publish_courses_lessons.ts` now runs `data_to_publish/scripts/fuzzy_dedupe_check.py`.

- Input 1: proposed entities DataFrame (courses, lessons, and relation targets with `create_if_missing`).
- Input 2: existing target-space entities DataFrame from live API.
- Matching: fuzzy score from Python `difflib` sequence + token-sort ratio.
- Output: high and medium match buckets, consumed by the publish script.

Agent publish policy:
- if `--publish` and agent runtime is detected (`AGENT=1` or `OPENCODE=1`), any high-similarity match blocks publish.
- every agent publish attempt appends a record to `runlog.md` (published yes/no + reason).
