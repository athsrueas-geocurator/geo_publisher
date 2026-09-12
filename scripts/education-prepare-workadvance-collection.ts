/** Prepare (never publish) a WorkAdvance collection plan from its reviewed ops.
 * The source batch is treated as immutable evidence; this script only extracts
 * existing Claim IDs and typed values into the shared collection contract.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'data/education';
const ops = JSON.parse(readFileSync(join(root, 'workadvance-2020-ops.json'), 'utf8')) as any[];
const copyOps = JSON.parse(readFileSync(join(root, 'workadvance-claim-copy-ops.json'), 'utf8')) as any[];
const bytes = (value: any) => value?.['$bytes'];
const textValue = (set: any[], propertyId: string) => set.find((entry) => bytes(entry.property) === propertyId)?.value?.value;
const decimal = (value: any) => {
  const mantissa = BigInt(value.mantissa?.value?.['$bigint']);
  const exponent = Number(value.exponent ?? 0);
  const negative = mantissa < 0n;
  const digits = (negative ? -mantissa : mantissa).toString();
  if (exponent >= 0) return `${negative ? '-' : ''}${digits}${'0'.repeat(exponent)}`;
  const places = -exponent;
  const padded = digits.padStart(places + 1, '0');
  return `${negative ? '-' : ''}${padded.slice(0, -places)}.${padded.slice(-places)}`;
};
const values = (set: any[]) => set.flatMap((entry) => {
  const propertyId = bytes(entry.property), value = entry.value;
  if (!propertyId || ['a126ca530c8e48d5b88882c734c38935', '9b1f76ff9711404c861e59dc3fa7d037', 'da4a6c1f9d4446f9832ff3b49a4400ef', '84dacbddca6a44079edb5e11a4c66b40'].includes(propertyId)) return [];
  if (value?.type === 'text') return [{ propertyId, field: 'text', value: value.value }];
  if (value?.type === 'integer') return [{ propertyId, field: 'integer', value: value.value?.['$bigint'] }];
  if (value?.type === 'decimal') return [{ propertyId, field: 'decimal', value: decimal(value) }];
  return [];
});
const sourceByClaim = new Map<string, string>();
for (const op of ops) if (op.type === 'createRelation' && bytes(op.relationType) === '49c5d5e1679a4dbdbfd33f618f227c94') sourceByClaim.set(bytes(op.from), bytes(op.to));
const repairedHeaders = new Map<string, any[]>();
for (const op of copyOps) if (op.type === 'updateEntity') repairedHeaders.set(bytes(op.id), op.set);
const facts = ops.filter((op) => op.type === 'updateEntity' && op.set?.some((entry: any) => bytes(entry.property) === 'da4a6c1f9d4446f9832ff3b49a4400ef' && entry.value?.value === true)).map((op) => {
  const id = bytes(op.id), set = op.set;
  const headers = repairedHeaders.get(id) ?? set;
  return { id, sourceId: sourceByClaim.get(id) ?? '2278407dc1df480e8a297cd9beb44a4a', locator: textValue(set, '84dacbddca6a44079edb5e11a4c66b40'), classification: /model|benefit-cost|forecast/i.test(`${textValue(headers, 'a126ca530c8e48d5b88882c734c38935')} ${textValue(headers, '9b1f76ff9711404c861e59dc3fa7d037')}`) ? 'modeled' : 'observed', context: 'WorkAdvance 2020 long-term demonstration; typed findings from the reviewed source batch and current approved Claim copy.', name: textValue(headers, 'a126ca530c8e48d5b88882c734c38935'), description: textValue(headers, '9b1f76ff9711404c861e59dc3fa7d037'), values: values(set) };
});
if (facts.length !== 23 || facts.some((fact) => !fact.locator || !fact.name || !fact.description || !fact.values.length)) throw Error(`Expected 23 complete WorkAdvance facts, got ${facts.length}`);
const groups = new Map<string, any[]>();
for (const fact of facts) { const key = fact.values.map((value: any) => `${value.propertyId}:${value.field}`).sort().join('|'); const group = groups.get(key) ?? []; group.push(fact); groups.set(key, group); }
const typeName = (field: string) => field === 'decimal' ? 'Decimal' : field === 'integer' ? 'Integer' : 'Text';
const plan = { version: 1, key: 'workadvance-collection', spaceId: 'dac259bad48a11adf97fe36857d85206', bounty: 'debce2de46094f299ee8e89fe244a9dc', catalogId: '2279edef1bbe479c872caeb72ee90022', name: 'WorkAdvance long-term findings', description: 'Source-reported WorkAdvance findings from the 2020 long-term evaluation, organized by compatible typed columns.', notes: 'These rows reuse existing source-backed Claims. Read each title and description with its locator; pooled and site-specific estimates are distinct scopes and must not be averaged. This draft requires fresh all-space identity and collection-membership review before publication.', sourceIds: ['2278407dc1df480e8a297cd9beb44a4a'], relatedIds: ['6edae2af128f47c0a7359b1ae52eba28'], groups: [...groups.values()].map((members: any[], index) => ({ key: `findings-${index + 1}`, name: `WorkAdvance findings — compatible fields ${index + 1}`, columns: members[0].values.map((value: any) => ({ id: value.propertyId, dataType: typeName(value.field) })), members: members.map((fact: any) => fact.id) })) };
writeFileSync(join(root, 'workadvance-collection-plan.json'), JSON.stringify(plan, null, 2) + '\n');
writeFileSync(join(root, 'workadvance-collection-facts.json'), JSON.stringify(facts, null, 2) + '\n');
console.log(JSON.stringify({ plan: join(root, 'workadvance-collection-plan.json'), facts: join(root, 'workadvance-collection-facts.json'), claims: facts.length, groups: plan.groups.length, mode: 'draft-only' }, null, 2));
