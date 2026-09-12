import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const commit = '3cd97449ce9ca73cccb77efe22aac69cc56131e5';
const repository = 'athsrueas-geocurator/Education-Initiatives';
const root = path.resolve('data/education/source');
const files = [
  ...['initiatives', 'sources', 'dichotomies', 'methods', 'glossary', 'landing-cards'].map(x => `content/${x}.json`),
  ...['dataset-catalog', 'dataset-profiles', 'initiative-dataset-links'].map(x => `research-data/${x}.json`),
  'src/lib/content-schema.ts', 'research-data/README.md',
];
const manifest = { repository, commit, targetSpaceId: 'dac259bad48a11adf97fe36857d85206', files: [] };
for (const file of files) {
  const url = `https://raw.githubusercontent.com/${repository}/${commit}/${file}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const destination = path.join(root, file);
  let existing;
  try { existing = await readFile(destination); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (existing && !existing.equals(bytes)) throw new Error(`Pinned snapshot differs: ${file}`);
  await mkdir(path.dirname(destination), { recursive: true });
  if (!existing) await writeFile(destination, bytes);
  const json = file.endsWith('.json') ? JSON.parse(bytes.toString('utf8')) : null;
  manifest.files.push({ path: file, url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), topLevelRecords: Array.isArray(json) ? json.length : null });
}
await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
