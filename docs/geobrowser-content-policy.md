# GeoBrowser Content Policy (Baked In)

Source reference:

- https://www.geobrowser.io/space/3be38bb922bc80c6a6503fbbba28d2b0/dd5546417d00442fb353c7b10f8b7163

## Policy Highlights

- Check for existing entities before creating new ones.
- Reuse existing public types and properties whenever possible.
- Keep names semantically precise and avoid honorifics/titles for people.
- Description should be concise (around 50 words), informative, and neutral.
- Do not start description by repeating the entity name.
- Use dedicated frames for avatar/cover in Geo UI and follow image sizing guidance.

## How It Is Enforced in This Repo

- `policy:check` validates course/lesson names and descriptions before publish.
- `publish:courses-lessons` runs policy checks and blocks by default on:
  - policy errors (unless `--allow-policy-errors`)
  - policy warnings only when strict gate is enabled (`--strict-policy-warnings`)

## Commands

- Run policy check only:
  - `bun run policy:check`
- Publish with strict policy gates:
  - `bun run publish:courses-lessons -- --publish`
- Publish with explicit override:
  - `bun run publish:courses-lessons -- --allow-policy-errors --publish`
