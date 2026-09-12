import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

/** Prepare one source-catalog resource without publishing it. */
const key = process.argv[2];
if (!key) throw new Error('Usage: bun scripts/education-prepare-catalog-resource.ts <catalog-id>');
const root = 'data/education';
const catalog = JSON.parse(readFileSync(`${root}/source/research-data/dataset-catalog.json`, 'utf8')) as Array<Record<string, unknown>>;
const source = catalog.find((row) => row.id === key);
if (!source) throw new Error(`Unknown catalog id: ${key}`);
const title = String(source.title);
const slug = `${key}-catalog-resource`;
if (existsSync(`${root}/${slug}-publication.json`)) throw new Error('Preserve submitted payload; refusing to overwrite publication journal');

const registryPath = `${root}/${slug}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (name: string) => registry[name] ?? (registry[name] = randomUUID().replaceAll('-', ''));
const properties = {
  dataset: '0c4babfb43893486af827341bbf32e09',
  url: '412ff593e9154012a43d4c27ec5c68b6',
  blocks: 'beaba5cba67741a8b35377030613fc70',
  markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33',
  textBlock: '76474f2f00894e77a0410b39fb17d0bf',
};
const check = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
for (const [property, expected] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [properties.url, 'Text'], [properties.blocks, 'Relation'], [properties.markdown, 'Text']] as const) {
  const result: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(result.property?.dataTypeName === expected, `Schema mismatch for ${property}`);
}

const dataset = id('dataset');
const block = id('block');
const exact: any = await gql('query($name:String!){entitiesConnection(first:50,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}', { variables: { name: title } });
check(!exact.entitiesConnection.pageInfo.hasNextPage, 'Exact-title discovery is incomplete');
check(exact.entitiesConnection.nodes.length === 0, `An all-space exact-title candidate already exists for ${title}`);
for (const entityId of [dataset, block]) {
  const occupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: entityId } });
  check(!occupied.entity?.spaceIds?.length, `Persistent ID is already occupied: ${entityId}`);
}

const description = `${title} provides ${String(source.supportsComparisons ?? 'education research context')}. It is a source or access layer, so causal effects must be taken from the underlying study records.`;
const fields = [
  ['Steward', source.steward], ['Access', source.accessMethod], ['Access URL', source.accessUrl],
  ['Unit', source.unitOfAnalysis], ['Coverage', source.yearsCovered], ['Update cadence', source.updateCadence],
  ['Geography', Array.isArray(source.geographicLevel) ? source.geographicLevel.join(', ') : source.geographicLevel],
  ['Join keys', Array.isArray(source.joinKeys) ? source.joinKeys.join(', ') : source.joinKeys],
  ['Measures', Array.isArray(source.primaryMeasures) ? source.primaryMeasures.join(', ') : source.primaryMeasures],
  ['Uses', Array.isArray(source.supportsComparisons) ? source.supportsComparisons.join(', ') : source.supportsComparisons],
];
const content = `## Catalog metadata\n\n${fields.map(([label, value]) => `- **${label}:** ${value}`).join('\n')}\n\n${source.notes}\n\n[Official resource](${source.sourceUrl})`;
const ops: Op[] = [
  ...Ops.entities.update({ id: dataset, name: title, description, values: [{ property: properties.url, type: 'text', value: String(source.sourceUrl) }] }).ops,
  ...Ops.entities.update({ id: block, name: `${title} catalog metadata`, values: [{ property: properties.markdown, type: 'text', value: content }] }).ops,
];
const relation = (name: string, from: string, type: string, to: string) => ops.push(...Ops.relations.create({ id: id(`edge/${name}`), entityId: id(`relation/${name}`), fromEntity: from, type, toEntity: to, position: registry[`position/${name}`] ?? (registry[`position/${name}`] = Position.generate()) }).ops);
relation('dataset-type', dataset, SystemIds.TYPES_PROPERTY, properties.dataset);
relation('block-type', block, SystemIds.TYPES_PROPERTY, properties.textBlock);
relation('attach-block', dataset, properties.blocks, block);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: `Prepare ${title} catalog resource`, spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${slug}-ops.json`, sha256, journalPath: `${root}/${slug}-publication.json`, validationPath: `${root}/${slug}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${slug}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, source: { catalogId: key, sourcePath: `${root}/source/research-data/dataset-catalog.json`, officialUrl: source.sourceUrl }, scope: 'Prepare-only catalog metadata. No publication, raw export, derived outcome, causal claim, or unsupported initiative relation.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, title, checks: ['schema verified', 'complete all-space exact-title discovery', 'persistent IDs unused'] }, null, 2));
