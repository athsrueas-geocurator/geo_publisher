import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education';
const prefix = 'cuny-asap-outcomes';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Journal exists');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const source = '536b5cd10a65417ea4e1d52b3322dcad';
const initiative = '3f6f2b82f8b94d3c85a5198a40e34199';
const associateDegree = id('claim/associate-degree-eight-year');
const costPerDegree = id('claim/cost-per-associate-degree-eight-year');
const ops: Op[] = [];

function relation(key: string, fromEntity: string, type: string, toEntity: string) {
  ops.push(...Ops.relations.create({
    id: id(`edge/${key}`),
    entityId: id(`relation/${key}`),
    fromEntity,
    type,
    toEntity,
    position: registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate()),
  }).ops);
}

ops.push(...Ops.entities.update({
  id: associateDegree,
  name: 'Eight years after study entry, CUNY ASAP increased associate-degree receipt by 12 percentage points (52% versus 39.9%).',
  description: 'MDRC reports this program-versus-control result for the original CUNY randomized trial. It is an eight-year associate-degree outcome, not a result for Ohio ASAP or a later CUNY follow-up.',
  values: [
    { property: 'da4a6c1f9d4446f9832ff3b49a4400ef', type: 'boolean', value: true },
    { property: 'e500e2585a964d2c9df4a47b199616c3', type: 'decimal', exponent: 0, mantissa: { type: 'i64', value: BigInt(12) } },
    { property: '8405509cc7354655a348591349a5f025', type: 'text', value: 'Percentage-point difference in associate-degree receipt, program minus control, eight years after study entry (52% versus 39.9%).' },
  ],
}).ops);
relation('associate-degree/type', associateDegree, SystemIds.TYPES_PROPERTY, '96f859efa1ca4b229372c86ad58b694b');
relation('associate-degree/source', associateDegree, '49c5d5e1679a4dbdbfd33f618f227c94', source);
relation('associate-degree/initiative', associateDegree, 'dfa6aebe1ca94bf29faccc4cc7afb24c', initiative);

ops.push(...Ops.entities.update({
  id: costPerDegree,
  name: 'After eight years, CUNY ASAP’s average cost per associate degree was $9,162 higher than control ($84,087 versus $74,925 in 2019 dollars).',
  description: 'This is MDRC’s CUNY educational-cost comparison per associate degree, over eight years. The report says ASAP was no longer cost-effective on this measure; it is not a benefit-cost ratio.',
  values: [
    { property: 'da4a6c1f9d4446f9832ff3b49a4400ef', type: 'boolean', value: true },
    { property: '6ba2ce00db064687b108aa8449672886', type: 'decimal', exponent: 0, mantissa: { type: 'i64', value: BigInt(9162) } },
    { property: '97e14050fc49467bb3aaf4d7eccbbb69', type: 'integer', value: BigInt(2019) },
    { property: '6e7371ca96cb44348f16932f77f55e75', type: 'text', value: 'USD' },
    { property: '3a558d71454745a992c035040f648729', type: 'text', value: 'Difference in average CUNY educational cost per associate degree earned, program minus control, over eight years.' },
  ],
}).ops);
relation('cost-per-degree/type', costPerDegree, SystemIds.TYPES_PROPERTY, '96f859efa1ca4b229372c86ad58b694b');
relation('cost-per-degree/source', costPerDegree, '49c5d5e1679a4dbdbfd33f618f227c94', source);
relation('cost-per-degree/initiative', costPerDegree, 'dfa6aebe1ca94bf29faccc4cc7afb24c', initiative);

const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = {
  name: 'Add CUNY ASAP eight-year associate-degree and cost-per-degree findings',
  spaceId: target.spaceId,
  bounty: target.bountyId,
  opsPath: `${root}/${prefix}-ops.json`,
  sha256,
  journalPath: `${root}/${prefix}-publication.json`,
  validationPath: `${root}/${prefix}-validation.json`,
  entities: { associateDegree, costPerDegree },
  operationCount: ops.length,
};
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({
  ready: true,
  checkedAt: new Date().toISOString(),
  opsHash: sha256,
  source: 'MDRC 2020, printed PDF pp. 13–14 and Table 4 discussion; direct costs are in 2019 dollars.',
  scope: 'Two separate factual observations. The cost-per-degree difference is not a benefit-cost ratio or a cross-program ranking.',
}, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
