## Experimental workflow recap

1. **Ontology crawler** (`crawl-ontology.ts`) now accepts a schema space (default root) and a target space, discovers the requested types (`Course`, `Lesson`), follows their relations to depth 1, and records both the ontology IDs and live instances (e.g., `OpenClaw Getting started` in the AI space). It writes `experimental-scripts/crawl-output/<space>-<timestamp>.json` plus a suggested constants snippet for later manual copy.
2. **CSV converter** (`csv-to-json.ts`) reads `data_to_publish/courses.csv`/`lessons.csv` via a column-mapping config, cleans arrays, and emits per-type JSON (`data_to_publish/generated/courses.json`, `lessons.json`) ready for the publish demo.
3. **Documentation & mapping**: `experimental-scripts/docs.md` explains the why/how, and `csv-mapping.json` mirrors the mapping template so the crawler output can seed the configuration. Tests were run by invoking both scripts, leaving the generated crawl report on disk.
