import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'ecls-k-catalog-resource';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { dataset: '0c4babfb43893486af827341bbf32e09', url: '412ff593e9154012a43d4c27ec5c68b6', blocks: 'beaba5cba67741a8b35377030613fc70', markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33', textBlock: '76474f2f00894e77a0410b39fb17d0bf' };
const name = 'Early Childhood Longitudinal Study, Kindergarten Class of 2010-11 (ECLS-K:2011)';
const description = 'ECLS-K:2011 follows a nationally representative kindergarten cohort from 2010 through fifth grade. It supports weighted descriptive and developmental context; it does not by itself estimate an initiative’s effect.';
const officialUrl = 'https://nces.ed.gov/ecls/';
const content = `## Catalog metadata

- **Steward:** National Center for Education Statistics.
- **Access:** Public-use child-level files, documentation, and setup files; restricted files require a license.
- **Unit:** Longitudinal child record with linked family, teacher, classroom, and school responses.
- **Coverage:** Kindergarten entry in 2010 through spring 2016 fifth grade for the ECLS-K:2011 cohort.
- **Geography:** Nation.
- **Join keys:** Child record, wave, respondent type, and survey weight.
- **Measures:** Direct assessments, school readiness, child development, family background, and classroom and school context.
- **Appropriate uses:** Early-childhood outcome context, developmental trajectories, and program-participation context.

Use NCES weights and cohort-specific comparability guidance. ECLS-K:2011 is observational longitudinal data, so it cannot substitute for an experimental or otherwise credible evaluation of an early-childhood initiative.`;
const checks: string[] = [];
const check = (value: unknown, message: string) => { if (!value) throw new Error(message); checks.push(message); };
const discovery = JSON.parse(readFileSync(`${root}/discovery/ecls-k-refresh.json`, 'utf8'));
check(discovery.sourceKey === 'datasets:ecls-k', 'Discovery report belongs to ECLS-K');
check(discovery.searches.every((search: any) => search.complete && search.nodes.length === 0), 'Complete graph-wide title, alias, and official-URL discovery has no candidate');
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.url, 'Text'], [p.blocks, 'Relation'], [p.markdown, 'Text']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(data.property?.dataTypeName === type, `Live ${type} property: ${property}`);
}
const dataset = id('dataset'), block = id('block');
for (const [entityId, label] of [[dataset, 'Dataset'], [block, 'metadata block']] as const) {
  const occupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: entityId } });
  check(!occupied.entity?.spaceIds?.length, `Persistent ${label} ID is unused`);
}
const ops: Op[] = [
  ...Ops.entities.update({ id: dataset, name, description, values: [{ property: p.url, type: 'text', value: officialUrl }] }).ops,
  ...Ops.entities.update({ id: block, name: 'ECLS-K:2011 catalog metadata', values: [{ property: p.markdown, type: 'text', value: content }] }).ops,
];
const relation = (key: string, from: string, type: string, to: string) => {
  const position = registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate());
  ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position }).ops);
};
relation('dataset-type', dataset, SystemIds.TYPES_PROPERTY, p.dataset);
relation('block-type', block, SystemIds.TYPES_PROPERTY, p.textBlock);
relation('attach-block', dataset, p.blocks, block);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add ECLS-K:2011 catalog resource and metadata block', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: { catalogKey: 'ecls-k', sourcePath: 'data/education/source/research-data/dataset-catalog.json', officialUrl, accessUrl: 'https://nces.ed.gov/ecls/dataproducts.asp' }, scope: 'Catalog metadata only. No ECLS-K microdata, derived outcome, causal claim, initiative effect, or unsupported initiative relation is published.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, checks }, null, 2));
