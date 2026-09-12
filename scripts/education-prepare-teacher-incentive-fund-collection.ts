import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

const root = 'data/education';
const prefix = 'teacher-incentive-fund-collection';
if (existsSync(`${root}/${prefix}-batch.json`)) throw new Error('Preserve existing prepared batch');
const sourceId = '1fcce9b53fa640279448239bba337eef';
const initiativeId = '66f8690ed0b249f6829a075a2c5976d1';
const catalogId = '2279edef1bbe479c872caeb72ee90022';
const decimal = 'e500e2585a964d2c9df4a47b199616c3';
const integer = '210e9b352b454d6eb7a32906d24d3c8d';
const context = '8405509cc7354655a348591349a5f025';
const claims = [
  ['12d7d800884d4cefaacf5be2538a2bbc', 'Year 1', 'math', '0.02', '40535', '.33'],
  ['f206b6c5510d4a759c1e309dde11c685', 'Year 1', 'reading', '0.03', '40256', '.04'],
  ['a55fb976e792432987178812b2f6bc65', 'Year 2', 'math', '0.04', '40454', '.07'],
  ['af8402d1b9a54766acecd750dd6c2444', 'Year 2', 'reading', '0.03', '40122', '.02'],
  ['ffc7228f4c98435a9e640657101e63f0', 'Year 3', 'math', '0.06', '39770', '.02'],
  ['c8fa9bf3965945a1beca67e18e6b0ee7', 'Year 3', 'reading', '0.04', '39538', '.02'],
  ['f2667ffde3fd44dabe4a65c5da53a6e4', 'Year 4', 'math', '0.04', '38939', '.13'],
  ['dcb3349e9b4043a69c65188bacac29c5', 'Year 4', 'reading', '0.04', '38929', '.08'],
];
const plan = { version: 1, key: prefix, spaceId: 'dac259bad48a11adf97fe36857d85206', bounty: 'debce2de46094f299ee8e89fe244a9dc', catalogId, name: 'Teacher Incentive Fund achievement findings', description: 'Annual achievement estimates from the Teacher Incentive Fund pay-for-performance evaluation.', notes: 'Rows reuse eight source-backed Claims from one multisite randomized experiment. The comparison is bonus-component eligibility versus a one-percent across-the-board control bonus; annual horizons are not independent studies.', sourceIds: [sourceId], relatedIds: [initiativeId], groups: [{ key: 'findings', name: 'Teacher Incentive Fund Table VI.4 findings', columns: [{ id: decimal, dataType: 'Decimal' }, { id: integer, dataType: 'Integer' }, { id: context, dataType: 'Text' }], members: claims.map(([id]) => id) }] };
const liveClaims = await Promise.all(claims.map(async ([id]) => { const result: any = await gql('query($id:UUID!){entity(id:$id){name description values(first:50){nodes{propertyId text decimal integer boolean}}}}', { variables: { id } }); if (!result.entity) throw new Error(`Missing live Claim ${id}`); return result.entity; }));
const facts = claims.map(([id, year, subject, estimate, n, p], index) => ({ id, sourceId, locator: `Table VI.4; ${year} ${subject}; p. 99.`, classification: 'observed', context: 'Multisite randomized evaluation of the pay-for-performance bonus component across 131 schools; annual rows are repeated horizons from one experiment.', name: liveClaims[index].name, description: liveClaims[index].description, values: [{ propertyId: decimal, field: 'decimal', value: estimate }, { propertyId: integer, field: 'integer', value: n }, { propertyId: context, field: 'text', value: liveClaims[index].values.nodes.find((value: any) => value.propertyId === context)?.text }] }));
const bytes = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const hash = (value: string | Uint8Array) => createHash('sha256').update(Buffer.from(value)).digest('hex');
const planBytes = bytes(plan); const factsBytes = bytes(facts);
const discoveryBytes = readFileSync(`${root}/${prefix}-discovery.json`); const notesBytes = readFileSync('docs/teacher-incentive-fund-study-notes.md');
const review = { version: 1, checkedAt: new Date().toISOString(), reviewer: 'publisher preparation review', planHash: hash(planBytes), factsHash: hash(factsBytes), sources: [{ path: 'docs/teacher-incentive-fund-study-notes.md', sha256: hash(notesBytes), sourceId, version: 'Chiang et al., NCEE 2018-4004, Table VI.4' }], discovery: { path: `${root}/${prefix}-discovery.json`, sha256: hash(discoveryBytes) }, decisions: { source: { status: 'accepted', rationale: 'Official NCEE report and study notes identify the source and its bonus-component comparison.' }, identity: { status: 'accepted', rationale: 'Complete all-space discovery found only the expected Article and no incoming Collection-item memberships for the eight Claims.' }, content: { status: 'accepted', rationale: 'Facts reuse live Claim values, locators and units; no standard errors or benefit-cost ratio are invented.' } } };
writeFileSync(`${root}/${prefix}-plan.json`, planBytes); writeFileSync(`${root}/${prefix}-facts.json`, factsBytes); writeFileSync(`${root}/${prefix}-review.json`, bytes(review));
console.log(JSON.stringify({ plan: `${root}/${prefix}-plan.json`, facts: `${root}/${prefix}-facts.json`, review: `${root}/${prefix}-review.json`, claims: claims.length }, null, 2));
