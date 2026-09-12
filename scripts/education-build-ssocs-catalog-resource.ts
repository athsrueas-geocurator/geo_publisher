import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'ssocs-catalog-resource';
throw new Error('Retired: incorrect copied content. Use education-review-catalog-repair.ts; preserve historical payloads.');
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { dataset: '0c4babfb43893486af827341bbf32e09', url: '412ff593e9154012a43d4c27ec5c68b6', blocks: 'beaba5cba67741a8b35377030613fc70', markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33', textBlock: '76474f2f00894e77a0410b39fb17d0bf' };
const name = 'School Survey on Crime and Safety (SSOCS)';
const description = 'SSOCS follows a nationally representative kindergarten cohort from 2010 through fifth grade. It supports weighted descriptive and developmental context; it does not by itself estimate an initiativeâ€™s effect.';
const officialUrl = 'https://nces.ed.gov/surveys/ssocs/';
const content = `## Catalog metadata

- **Steward:** National Center for Education Statistics.
- **Access:** Public-use custom extracts through NCES DataLab; restricted-use files require a license.
- **Unit:** Sampled public school, cross-sectional.
- **Coverage:** 1999–2000 onward; use the cycle-specific public-use release.
- **Geography:** Nation and selected states.
- **Join keys:** Student record, wave, permitted school record, and survey weight.
- **Measures:** Incidents, discipline, safety policies, security, and mental-health and restorative supports.
- **Appropriate uses:** School climate, discipline, and safety-implementation context.

Use NCES weights and cohort-specific documentation. Public-use identifiers are suppressed, and SSOCS is observational longitudinal data, so causal initiative evaluation requires a separate credible design.`;
const checks: string[] = [];
const check = (value: unknown, message: string) => { if (!value) throw new Error(message); checks.push(message); };
const discovery = JSON.parse(readFileSync(`${root}/discovery/school-survey-on-crime-and-safety-ssocs.json`, 'utf8'));
check(discovery.term === 'School Survey on Crime and Safety (SSOCS)', 'Discovery report belongs to SSOCS');
check(discovery.complete && discovery.nodes.length === 0, 'Complete graph-wide title, alias, and official-URL discovery has no candidate');
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
  ...Ops.entities.update({ id: block, name: 'SSOCS catalog metadata', values: [{ property: p.markdown, type: 'text', value: content }] }).ops,
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
const batch = { name: 'Add SSOCS catalog resource and metadata block', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: { catalogKey: 'hsls-09', sourcePath: 'data/education/source/research-data/dataset-catalog.json', officialUrl, accessUrl: 'https://nces.ed.gov/surveys/ssocs/dataproducts.asp' }, scope: 'Catalog metadata only. No SSOCS microdata, derived outcome, causal claim, initiative effect, or unsupported initiative relation is published.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, checks }, null, 2));
