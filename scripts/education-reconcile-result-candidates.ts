/**
 * Reconcile factual Claims outside the inventoried collection blocks with the
 * local research/publication artifacts. This is a local evidence report only;
 * it never publishes, signs, or treats a missing local filename as proof that
 * an entity is absent from Geo. Cross-space identity and collection membership
 * still require a live, complete query before a plan is built.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'data/education';
const inventoryPath = join(root, 'uncollected-claims-inventory.json');
const outputPath = 'docs/education-result-candidate-reconciliation.md';
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')) as {
  checkedAt: string;
  complete: boolean;
  groups: Array<{ sourceId: string; name: string; claims: string[] }>;
};

const files = readdirSync(root)
  .filter((name) => name.endsWith('.json'))
  .map((name) => ({ name, text: readFileSync(join(root, name), 'utf8') }));

const rows = inventory.groups.map((group) => {
  const evidence = files
    .filter((file) => file.text.includes(group.sourceId))
    .map((file) => file.name);
  const publication = evidence.filter((name) => /publication|index-verification|validation/i.test(name));
  const preparation = evidence.filter((name) => /batch|ops|registry|discovery|model|extraction|transcription/i.test(name));
  const draft = evidence.filter((name) => /collection-plan|collection-facts/i.test(name));
  const planDrafts = draft.filter((name) => name.endsWith('-plan.json'));
  const preparedBatch = planDrafts.some((name) => files.some((file) => file.name === name.replace('-plan.json', '-batch.json')));
  const publishedBatch = planDrafts.some((name) => files.some((file) => file.name === name.replace('-plan.json', '-publication.json')));
  const completeFacts = files.filter((file) => /-ops\.json$/i.test(file.name) && file.text.includes(group.sourceId)).reduce((total, file) => {
    try {
      const ops = JSON.parse(file.text) as any[];
      return total + ops.filter((op) => op.type === 'updateEntity' && op.set?.some((entry: any) => entry.property?.['$bytes'] === 'da4a6c1f9d4446f9832ff3b49a4400ef' && entry.value?.value === true) && op.set.some((entry: any) => entry.property?.['$bytes'] === '84dacbddca6a44079edb5e11a4c66b40') && op.set.some((entry: any) => !['a126ca530c8e48d5b88882c734c38935', '9b1f76ff9711404c861e59dc3fa7d037', 'da4a6c1f9d4446f9832ff3b49a4400ef', '84dacbddca6a44079edb5e11a4c66b40'].includes(entry.property?.['$bytes']))).length;
    } catch { return total; }
  }, 0);
  const status = preparedBatch && !publishedBatch
    ? 'typed collection draft exists; complete discovery, live comparison and review binding pass; publication remains paused'
    : draft.length > 0
    ? 'typed collection draft exists; complete fresh review binding and cross-space membership checks'
    : publication.length > 0
    ? 'local publication/verification artifacts exist; reconcile collection membership and cross-space identities'
    : preparation.length > 0
      ? 'local preparation/research artifacts exist; complete identity, collection, and verification review'
      : 'no local artifact matched the source ID; locate or finish source-backed preparation before planning publication';
  return { ...group, evidence, publication, preparation, draft, preparedBatch, completeFacts, status };
});

const lines = [
  '# Result candidate reconciliation',
  '',
  `Generated ${new Date().toISOString()} from [uncollected-claims-inventory.json](../data/education/uncollected-claims-inventory.json), whose complete all-space destination census was checked at ${inventory.checkedAt}.`,
  '',
  'This report is a local triage aid. “Uncollected” means outside the currently inventoried Dataset/space-page blocks; it does not prove a missing Geo entity or authorize duplication. The locator/value column aggregates matching local ops artifacts and can count repeated variants; it is a readiness hint, not a Claim census. Every candidate still needs complete cross-space identity and incoming-membership queries, source/version review, and a bounded collection plan. Publication remains paused.',
  '',
  '| Source publication | Source ID | Factual Claims outside known blocks | Complete locator/value rows in local ops | Local evidence | Next action |',
  '| --- | --- | ---: | ---: | --- | --- |',
];
for (const row of rows) {
  const evidence = row.evidence.length === 0
    ? 'none'
    : row.evidence.slice(0, 6).map((name) => `\`${name}\``).join(', ') + (row.evidence.length > 6 ? ` (+${row.evidence.length - 6} more)` : '');
  lines.push(`| ${row.name.replace(/\|/g, '\\|')} | \`${row.sourceId}\` | ${row.claims.length} | ${row.completeFacts} | ${evidence} | ${row.status} |`);
}
lines.push('', '## Operating rule', '', 'A family may move from this triage report to a prepared collection only after the shared review binding records the source/version evidence, all-space discovery scope, candidate identity decisions, exact Claim IDs, compatible table divisions, and a zero-op rerun plan. Existing Article, Initiative, Claim, Dataset, and relation entities must be reused when their identity is confirmed, including entities originating in other spaces.');
writeFileSync(outputPath, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ generated: outputPath, groups: rows.length, withLocalEvidence: rows.filter((row) => row.evidence.length > 0).length, withoutLocalEvidence: rows.filter((row) => row.evidence.length === 0).length }, null, 2));
