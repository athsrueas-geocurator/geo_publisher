# Experimental Scripts

This folder houses exploratory tooling that helps you understand and adapt the live knowledge graph before pushing new data.

## Why these scripts exist

1. **Knowledge drift** — the ontology in the root/test space evolves independently, so hard-coded constants break quickly. The crawler lets you inspect the current schema for any type you plan to publish (courses, lessons, etc.) and produces a reusable snapshot rather than keeping a brittle list of UUIDs.
2. **CSV-first workflow** — your CSV files describe course/lesson data in a relational way (IDs, tags, skills). The converter bridges that format to the JSON shape the publish demo expects by pairing each column with the ontology the crawler reports.

## 1. Ontology crawler (`crawl-ontology.ts`)

- **Purpose**: Query the GraphQL API, find the type definitions you care about, gather their relations/properties, and follow linked entities one level deep (configurable) to reveal what else you need to import. The crawler now separates the schema space (where the `Course`/`Lesson` types live) from the target space (where the actual course instances reside) so you can tie your import data to the right place without duplicating entities.
- **CLI**:
  ```bash
  bun run experimental-scripts/crawl-ontology.ts \
    --schemaSpace a19c345ab9866679b001d7d2138d88a1 \
    --targetSpace 41e851610e13a19441c4d980f2f2ce6b \
    --types Course,Lesson \
    --depth 1 \
    --fuzzy
  ```
  - `--schemaSpace`: the space that hosts the type definitions (defaults to the Geo root space).
  - `--targetSpace`: the space where the current entities live (usually the space you plan to seed or link against).
  - `--types`: comma-separated type names that match your incoming JSON schema.
  - `--depth`: how many relation hops to follow (default `1`, increase for deeper discovery).
  - `--fuzzy`: enable substring matching if a type name isn’t an exact match.
- **Output**: a JSON file under `experimental-scripts/crawl-output/` that lists every discovered type definition, relation/property IDs, the linked instances in the target space, and a suggested „constants” snippet you can copy into `src/constants.ts` later.

## 2. CSV → JSON converter (`csv-to-json.ts`)

- **Purpose**: Turn your `courses.csv`/`lessons.csv` files into type-specific JSON structures by mapping each column to the properties/relations reported by the crawler. The generated JSON mirrors the format the publish demo consumes (types, `topics`, `skills`, etc.).
- **Dependency**: relies on `csv-parse` (already added to `package.json`).
- **Configuration**: edit `experimental-scripts/csv-mapping.example.json` (copy it to `csv-mapping.json` or similar) to describe how each CSV column maps to an output field. Example entries:
  ```jsonc
  {
    "files": [
      {
        "filename": "courses.csv",
        "typeName": "Course",
        "output": "courses.json",
        "columns": {
          "course_id": { "field": "id", "required": true },
          "Name": { "field": "name" },
          "Topics": { "field": "topics", "array": true, "delimiter": ";" }
        }
      }
    ]
  }
  ```
- **CLI**:
  ```bash
  bun run experimental-scripts/csv-to-json.ts --mapping experimental-scripts/csv-mapping.json
  ```
  Additional flags:
  - `--inputDir`: where the CSV files live (defaults to `data_to_publish`).
  - `--outputDir`: where the generated JSON lands (defaults to `data_to_publish/generated`).

## 3. Suggested workflow

1. Run the crawler with the course/lesson type names you plan to publish. Inspect the generated JSON to extract the relation/property IDs, and decide which fields are required vs optional.
2. Use that report to craft or update `csv-mapping.json` so every CSV column is paired with a `field`, `array`, and `delimiter` where needed.
3. Run the converter. It writes one JSON file per type (`courses.json`, `lessons.json`, etc.) that you can feed into the publish demo once you add the corresponding logic.

Keep these utilities isolated in `experimental-scripts/` so the main demo stays lean while you experiment with new data modeling patterns.
