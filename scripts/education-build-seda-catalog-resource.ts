import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education';
const prefix = 'seda-catalog-resource';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');

const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, 'utf8'))
  : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const datasetType = '0c4babfb43893486af827341bbf32e09';
const url = '412ff593e9154012a43d4c27ec5c68b6';
const blocks = 'beaba5cba67741a8b35377030613fc70';
const markdown = 'e3e363d1dd294ccb8e6ff3b76d99bc33';
const textBlock = '76474f2f00894e77a0410b39fb17d0bf';
const name = 'Stanford Education Data Archive (SEDA), Version 6.0';
const description = 'SEDA provides harmonized U.S. achievement, growth, gap, and contextual data across education geographies. It is comparative context data, not evidence that an initiative caused an outcome.';
const officialUrl = 'https://edopportunity.org/opportunity/data/downloads/';
const content = `## Catalog metadata\n\n- **Steward:** Stanford Educational Opportunity Project.\n- **Access:** Public CSV and Stata downloads with codebooks.\n- **Unit:** Geographic education unit and student subgroup.\n- **Coverage:** Use the currently released Version 6 files and their technical documentation; the source key remains \`seda-v5\`, so retain that catalog-version discrepancy.\n- **Geography:** School, geographic and administrative district, county, metro area, commuting zone, and state.\n- **Join keys:** NCES-derived school/district identifiers where supplied, plus geographic codes.\n- **Uses:** Cross-state achievement, growth, gaps, and equity context.\n\nSEDA values need their release, aggregation level, population, measure, and comparison specified before use. They do not by themselves establish a program effect.`;
const checks: string[] = [];
const check = (value: unknown, message: string) => { if (!value) throw new Error(message); checks.push(message); };

for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [url, 'Text'], [blocks, 'Relation'], [markdown, 'Text']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(data.property?.dataTypeName === type, `Live ${type} property: ${property}`);
}

const dataset = id('dataset');
const exact: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}', { variables: { id: dataset, name } });
check(!exact.entity?.spaceIds?.length, 'Persistent Dataset ID is unused');
check(!exact.entitiesConnection.pageInfo.hasNextPage && exact.entitiesConnection.nodes.length === 0, 'Complete all-space exact-title discovery has no candidate');
for (const term of ['Stanford Education Data Archive', 'SEDA v6', 'Stanford Educational Opportunity Project']) {
  const found: any = await gql('query($term:String!){entitiesConnection(first:50,filter:{name:{includesInsensitive:$term}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}', { variables: { term } });
  check(!found.entitiesConnection.pageInfo.hasNextPage && found.entitiesConnection.nodes.length === 0, `Complete all-space specific discovery has no candidate: ${term}`);
}

const block = id('block');
const blockOccupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: block } });
check(!blockOccupied.entity?.spaceIds?.length, 'Persistent metadata block ID is unused');
const ops: Op[] = [
  ...Ops.entities.update({ id: dataset, name, description, values: [{ property: url, type: 'text', value: officialUrl }] }).ops,
  ...Ops.entities.update({ id: block, name: 'SEDA catalog metadata', values: [{ property: markdown, type: 'text', value: content }] }).ops,
];
const relation = (key: string, from: string, type: string, to: string) => {
  const position = registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate());
  ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position }).ops);
};
relation('dataset-type', dataset, SystemIds.TYPES_PROPERTY, datasetType);
relation('block-type', block, SystemIds.TYPES_PROPERTY, textBlock);
relation('attach-block', dataset, blocks, block);

const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add SEDA catalog resource and metadata block', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: { catalogKey: 'seda-v5', sourcePath: 'Education-Initiatives/research-data/dataset-catalog.json', officialUrl, publishedName: name }, scope: 'Catalog metadata only. No raw SEDA data, derived outcome, causal claim, initiative effect, or unsupported initiative relation is published.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, checks }, null, 2));
