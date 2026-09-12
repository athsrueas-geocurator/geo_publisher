import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'dcmp-cost-type-repair';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted repair payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { cost: '6ba2ce00db064687b108aa8449672886', estimate: 'e500e2585a964d2c9df4a47b199616c3' };
const claims = [
  ['cost-per-attainment', 'cbbaed6c995d4a379f2702638a91af94', -3450],
  ['cost-per-credit', 'c71243e47adb450a87ea2e816ff6edfc', 20],
] as const;
const decimal = (property: string, value: number) => {
  const [whole, fraction = ''] = String(value).split('.');
  return { property, type: 'decimal' as const, exponent: -fraction.length, mantissa: { type: 'i64' as const, value: BigInt(`${whole}${fraction}`) } };
};
const checks: string[] = [];
for (const [property, type] of [[p.cost, 'Decimal'], [p.estimate, 'Decimal']] as const) {
  const result: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  if (result.property?.dataTypeName !== type) throw new Error(`Live ${type} schema required for ${property}`);
  checks.push(`Live ${type}: ${property}`);
}
for (const [, claim] of claims) {
  const result: any = await gql('query($id:UUID!){entity(id:$id){id spaceIds}}', { variables: { id: claim } });
  if (!result.entity?.spaceIds?.includes(target.spaceId)) throw new Error(`Published DCMP claim missing from target: ${claim}`);
  checks.push(`Target contains DCMP claim: ${claim}`);
}
const ops: Op[] = [];
for (const [key, claim, value] of claims) {
  ops.push(...Ops.entities.update({ id: claim, values: [decimal(p.cost, value)], unset: [{ property: p.estimate }] }).ops);
  id(`repair/${key}`);
}
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Repair DCMP cost-per-outcome value types', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: Object.fromEntries(claims.map(([key, claim]) => [key, claim])), operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, reason: 'The two source-reported dollar cost-per-outcome figures use Cost, while non-monetary outcomes retain Decimal estimate.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
