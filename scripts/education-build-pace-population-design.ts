import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Ops, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'pace-population-design';
const population = '7a1f6d017895206e84e1988c0c74621e', design = '8e46e3eff9dea2b55d32a5ca7de61938';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const study: Record<string, string> = JSON.parse(readFileSync(`${root}/pace-2019-registry.json`, 'utf8'));
const checks: string[] = [];
for (const [property, type] of [[population, 'Text'], [design, 'Text']] as const) {
  const result: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  if (result.property?.dataTypeName !== type) throw new Error(`Live ${type} schema required: ${property}`);
  checks.push(`Live ${type}: ${property}`);
}
const current: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:20,filter:{spaceId:{is:$space}}){nodes{propertyId}pageInfo{hasNextPage}}}}', { variables: { id: study.initiative, space: target.spaceId } });
if (!current.entity || current.entity.values.pageInfo.hasNextPage) throw new Error('Complete current initiative values required.');
if (current.entity.values.nodes.some((value: any) => value.propertyId === population || value.propertyId === design)) throw new Error('PACE population or design already exists.');
checks.push('No duplicate PACE population/design values');
const ops: Op[] = Ops.entities.update({ id: study.initiative, values: [
  { property: population, type: 'text', value: '1,125 eligible Florida girls ages 11–18 with risk factors for juvenile-justice involvement: 673 offered PACE and 452 referred to alternative community services across 14 centers.' },
  { property: design, type: 'text', value: 'Individual-level randomized controlled evaluation with first-year Florida public-school outcomes, 18-month juvenile-justice follow-up, and a 12-month service-cost analysis.' },
] }).ops;
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add PACE structured population and design facets', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { initiative: study.initiative }, operationCount: ops.length };
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, scope: 'Source-supported PACE study population and individual-level randomized design. These fields describe the 2013–2015 Florida evaluation, not current delivery or all girls.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
