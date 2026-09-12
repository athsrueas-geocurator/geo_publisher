import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'crdc-catalog-resource';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { dataset: '0c4babfb43893486af827341bbf32e09', url: '412ff593e9154012a43d4c27ec5c68b6', blocks: 'beaba5cba67741a8b35377030613fc70', markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33', textBlock: '76474f2f00894e77a0410b39fb17d0bf' };
const name = 'Civil Rights Data Collection (CRDC)';
const description = 'CRDC provides collection-cycle data on civil-rights conditions in U.S. public schools and districts. It supplies equity and implementation context; it does not establish that an initiative caused an outcome.';
const officialUrl = 'https://ocrdata.ed.gov/';
const content = `## Catalog metadata\n\n- **Steward:** U.S. Department of Education Office for Civil Rights.\n- **Access:** Public downloadable collection files.\n- **Unit:** Public school and district, collection-year and subgroup-disaggregated.\n- **Coverage:** Collection-cycle dependent; record the collection year and file definition.\n- **Join keys:** LEA ID, school ID, school year, and subgroup.\n- **Measures:** Discipline, restraint and seclusion, advanced-course access, staffing, preschool, and harassment/bullying.\n- **Use boundary:** Preserve changing collection definitions and suppressed values with every analytic use.\n\nCRDC can provide equity, school-climate, opportunity-to-learn, and implementation-risk context. Its released values do not alone establish that a program caused an outcome.`;
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
for (const term of ['Civil Rights Data Collection', 'CRDC']) {
  const found: any = await gql('query($term:String!){entitiesConnection(first:50,filter:{name:{includesInsensitive:$term}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { term } });
  check(!found.entitiesConnection.pageInfo.hasNextPage && found.entitiesConnection.nodes.length === 0, `Complete all-space specific discovery has no candidate: ${term}`);
}
const occupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: block } });
check(!occupied.entity?.spaceIds?.length, 'Persistent metadata block ID is unused');
const ops: Op[] = [...Ops.entities.update({ id: dataset, name, description, values: [{ property: p.url, type: 'text', value: officialUrl }] }).ops, ...Ops.entities.update({ id: block, name: 'CRDC catalog metadata', values: [{ property: p.markdown, type: 'text', value: content }] }).ops];
const relation = (key: string, from: string, type: string, to: string) => { const position = registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate()); ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position }).ops); };
relation('dataset-type', dataset, SystemIds.TYPES_PROPERTY, p.dataset); relation('block-type', block, SystemIds.TYPES_PROPERTY, p.textBlock); relation('attach-block', dataset, p.blocks, block);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add CRDC catalog resource and metadata block', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: { catalogKey: 'crdc', sourcePath: 'Education-Initiatives/research-data/dataset-catalog.json', officialUrl }, scope: 'Catalog metadata only. No raw CRDC data, derived outcome, causal claim, initiative effect, or unsupported initiative relation is published.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, checks }, null, 2));
