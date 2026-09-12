import { readFileSync, writeFileSync } from 'node:fs';

const root = 'data/education';
const batch: any = JSON.parse(readFileSync(`${root}/ncss3-batch.json`, 'utf8'));
const ops: any[] = JSON.parse(readFileSync(`${root}/ncss3-ops.json`, 'utf8'));
const ids = Object.values(batch.entities.claims as Record<string, string>) as string[];
const prop = {
  name: 'a126ca530c8e48d5b88882c734c38935',
  description: '9b1f76ff9711404c861e59dc3fa7d037',
  factual: 'da4a6c1f9d4446f9832ff3b49a4400ef',
  impact: 'e500e2585a964d2c9df4a47b199616c3',
  jurisdictions: '210e9b352b454d6eb7a32906d24d3c8d',
  measure: '8405509cc7354655a348591349a5f025',
  locator: '84dacbddca6a44079edb5e11a4c66b40',
};
const bytes = (x: any) => x?.['$bytes'];
// Older NCSS3 ops contain Windows-1252 punctuation decoded as C1 controls.
// Normalize those source artifacts before the live header comparison; do not
// carry the controls into a new collection payload.
const text = (x: any) => typeof x?.value === 'string' ? x.value.replace(/\u0096/g, '–').replace(/\u0092/g, '’').replace(/\u0093/g, '“').replace(/\u0094/g, '”') : x?.value;
const number = (x: any) => x.type === 'integer' ? x.value?.['$bigint'] : String(Number(x.mantissa?.value?.['$bigint']) * 10 ** (x.exponent ?? 0));
const updates = new Map<string, any>();
for (const op of ops) if (op.type === 'updateEntity') updates.set(bytes(op.id), op);
const facts = ids.map((id) => {
  const op = updates.get(id); if (!op) throw new Error(`Missing Claim update ${id}`);
  const values = new Map<string, any>();
  for (const item of op.set ?? []) values.set(bytes(item.property), item.value);
  return {
    id, sourceId: batch.entities.article, locator: text(values.get(prop.locator)), classification: 'observed',
    context: 'CREDO National Charter School Study III matched-growth analysis; repeated subject and sector rows are not independent studies.',
    name: text(values.get(prop.name)), description: text(values.get(prop.description)),
    values: [
      { propertyId: prop.impact, field: 'decimal', value: number(values.get(prop.impact)) },
      { propertyId: prop.jurisdictions, field: 'integer', value: number(values.get(prop.jurisdictions)) },
      { propertyId: prop.measure, field: 'text', value: text(values.get(prop.measure)) },
    ],
  };
});
const plan = {
  version: 1, key: 'ncss3-collection', spaceId: batch.spaceId, bounty: batch.bounty,
  catalogId: '2279edef1bbe479c872caeb72ee90022', name: 'National Charter School Study III findings',
  description: 'Matched-growth findings from the National Charter School Study III.',
  notes: 'Rows reuse existing source-backed Claims and retain the study’s matched comparison, jurisdiction scope and non-randomized design.',
  sourceIds: [batch.entities.article], relatedIds: [batch.entities.initiative],
  groups: [{ key: 'findings', name: 'NCSS3 matched-growth findings', columns: [
    { id: prop.impact, dataType: 'Decimal' }, { id: prop.jurisdictions, dataType: 'Integer' },
    { id: prop.measure, dataType: 'Text' },
  ], members: ids }],
};
writeFileSync(`${root}/ncss3-collection-plan.json`, `${JSON.stringify(plan, null, 2)}\n`);
writeFileSync(`${root}/ncss3-collection-facts.json`, `${JSON.stringify(facts, null, 2)}\n`);
console.log(JSON.stringify({ claims: facts.length, sourceId: batch.entities.article, columns: plan.groups[0].columns.length }));
