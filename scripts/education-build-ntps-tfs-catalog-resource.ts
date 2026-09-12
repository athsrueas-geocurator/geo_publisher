import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'ntps-tfs-catalog-resource';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { dataset: '0c4babfb43893486af827341bbf32e09', url: '412ff593e9154012a43d4c27ec5c68b6', blocks: 'beaba5cba67741a8b35377030613fc70', markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33', textBlock: '76474f2f00894e77a0410b39fb17d0bf' };
const name = 'National Teacher and Principal Survey (NTPS) and Teacher Follow-up Survey (TFS)';
const description = 'NTPS and TFS provide nationally representative teacher and school workforce context. They do not identify effects of a local initiative without a separate credible design.';
const officialUrl = 'https://nces.ed.gov/surveys/ntps/ntps-sass-data.asp';
const content = `## Catalog metadata

- **Steward:** National Center for Education Statistics.
- **Access:** Public-use custom extracts through NCES DataLab; restricted-use files require a license.
- **Unit:** Sampled school, teacher, principal, and follow-up teacher record.
- **Coverage:** NTPS cycles every two to three years; predecessor SASS/TFS series extends to 1987.
- **Geography:** School, state, and nation.
- **Join keys:** Survey cycle, permitted school identifier, teacher or principal record, and state.
- **Measures:** Staffing, qualifications, work conditions, professional development, retention, and mobility.
- **Uses:** Teacher-workforce, retention, and implementation context.

Use survey weights and cycle-specific documentation. This nationally representative survey is contextual evidence, not a local-program impact evaluation.`;
const checks: string[] = [];
const check = (value: unknown, message: string) => { if (!value) throw new Error(message); checks.push(message); };
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.url, 'Text'], [p.blocks, 'Relation'], [p.markdown, 'Text']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(data.property?.dataTypeName === type, `Live ${type} property: ${property}`);
}
const dataset = id('dataset'), block = id('block');
const exact: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { id: dataset, name } });
check(!exact.entity?.spaceIds?.length, 'Persistent Dataset ID is unused');
check(!exact.entitiesConnection.pageInfo.hasNextPage && exact.entitiesConnection.nodes.length === 0, 'Complete all-space exact-title discovery has no candidate');
for (const term of ['National Teacher and Principal Survey', 'Teacher Follow-up Survey']) {
  const found: any = await gql('query($term:String!){entitiesConnection(first:50,filter:{name:{includesInsensitive:$term}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { term } });
  check(!found.entitiesConnection.pageInfo.hasNextPage && found.entitiesConnection.nodes.length === 0, `Complete all-space specific discovery has no candidate: ${term}`);
}
const occupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: block } });
check(!occupied.entity?.spaceIds?.length, 'Persistent metadata block ID is unused');
const ops: Op[] = [...Ops.entities.update({ id: dataset, name, description, values: [{ property: p.url, type: 'text', value: officialUrl }] }).ops, ...Ops.entities.update({ id: block, name: 'NTPS and TFS catalog metadata', values: [{ property: p.markdown, type: 'text', value: content }] }).ops];
const relation = (key: string, from: string, type: string, to: string) => { const position = registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate()); ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position }).ops); };
relation('dataset-type', dataset, SystemIds.TYPES_PROPERTY, p.dataset); relation('block-type', block, SystemIds.TYPES_PROPERTY, p.textBlock); relation('attach-block', dataset, p.blocks, block);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add NTPS and TFS catalog resource and metadata block', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: { catalogKey: 'ntps-tfs', sourcePath: 'data/education/source/research-data/dataset-catalog.json', officialUrl }, scope: 'Catalog metadata only. No raw NTPS or TFS extract, derived outcome, causal claim, initiative effect, or unsupported initiative relation is published.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, checks }, null, 2));
