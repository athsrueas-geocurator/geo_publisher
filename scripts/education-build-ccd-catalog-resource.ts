import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'ccd-catalog-resource';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const datasetType = '0c4babfb43893486af827341bbf32e09', url = '412ff593e9154012a43d4c27ec5c68b6';
const name = 'Common Core of Data (CCD) Public School and LEA Universe';
const description = 'NCES’s annual public directory of U.S. public schools and local education agencies. It supplies identifiers and descriptive context; it does not estimate program effects.';
const officialUrl = 'https://nces.ed.gov/ccd/pubschuniv.asp', checks: string[] = [];
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [url, 'Text']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  if (data.property?.dataTypeName !== type) throw Error(`Schema ${property}`);
  checks.push(`Schema ${property}`);
}
const dataset = id('dataset');
const exact: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}', { variables: { id: dataset, name } });
if (exact.entity?.spaceIds?.length || exact.entitiesConnection.pageInfo.hasNextPage || exact.entitiesConnection.nodes.length) throw Error('Exact all-space Dataset identity collision');
for (const term of ['Common Core of Data', 'Public School Universe']) {
  const found: any = await gql('query($term:String!){entitiesConnection(first:50,filter:{name:{includesInsensitive:$term}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}', { variables: { term } });
  if (found.entitiesConnection.pageInfo.hasNextPage || found.entitiesConnection.nodes.length) throw Error(`Semantic discovery candidate requires review: ${term}`);
  checks.push(`Complete all-space substring discovery has no candidate: ${term}`);
}
const ops: Op[] = [...Ops.entities.update({ id: dataset, name, description, values: [{ property: url, type: 'text', value: officialUrl }] }).ops];
registry['position/type'] ??= Position.generate();
ops.push(...Ops.relations.create({ id: id('edge/type'), entityId: id('relation/type'), fromEntity: dataset, type: SystemIds.TYPES_PROPERTY, toEntity: datasetType, position: registry['position/type'] }).ops);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add Common Core of Data catalog resource', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: { catalogKey: 'ccd-public-school-directory', sourcePath: 'Education-Initiatives/research-data/dataset-catalog.json', officialUrl, accessMethod: 'Primary bulk files; optional Urban Institute API mirror for bounded extracts' }, scope: 'Catalog metadata only. No raw CCD data, derived outcome, causal claim, initiative effect, or unsupported initiative relation is published.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
