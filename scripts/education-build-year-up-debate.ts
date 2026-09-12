import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'year-up-debate';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const study: Record<string, string> = JSON.parse(readFileSync(`${root}/year-up-outcomes-registry.json`, 'utf8'));
const property = {
  claim: '96f859efa1ca4b229372c86ad58b694b', factual: 'da4a6c1f9d4446f9832ff3b49a4400ef',
  source: '49c5d5e1679a4dbdbfd33f618f227c94', related: 'dfa6aebe1ca94bf29faccc4cc7afb24c',
  support: '1dc6a843458848198e7a6e672268f811', oppose: '4e6ec5d14292498a84e5f607ca1a08ce',
};
const name = 'Workforce agencies should expand Year Up-style training and internships when they can sustain the long-run earnings gains shown in the PACE trial.';
const description = 'Year Up’s PACE trial found sustained seven-year earnings gains, while its employment-rate result was null and its cost-benefit analysis remains separately modeled. Expansion depends on retaining the multi-site program model and employer partnerships studied.';
const support = [study['claim/quarter-23-24-earnings'], study['claim/year-7-earnings'], study['claim/years-1-7-earnings'], study['claim/high-earnings-threshold']];
const oppose = [study['claim/year-1-earnings'], study['claim/employment-null'], study['claim/design']];
const checks: string[] = [];
for (const [id, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [property.factual, 'Checkbox'], [property.source, 'Relation'], [property.related, 'Relation'], [property.support, 'Relation'], [property.oppose, 'Relation']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id } });
  if (data.property?.dataTypeName !== type) throw Error(`Schema ${id}`);
  checks.push(`Schema ${id}`);
}
const parent = id('parent');
const found: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { id: parent, name } });
if (found.entity?.spaceIds?.length || found.entitiesConnection.pageInfo.hasNextPage || found.entitiesConnection.nodes.length) throw Error('All-space parent identity collision');
for (const claim of [...support, ...oppose]) {
  const data: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}', { variables: { id: claim, space: target.spaceId } });
  if (!data.entity?.types.some((type: any) => type.id === property.claim) || data.entity.values.pageInfo.hasNextPage || !data.entity.values.nodes.some((value: any) => value.propertyId === property.factual && value.boolean === true)) throw Error(`Invalid factual evidence ${claim}`);
}
const ops: Op[] = [...Ops.entities.update({ id: parent, name, description, values: [{ property: property.factual, type: 'boolean', value: false }] }).ops];
const edge = (key: string, from: string, type: string, to: string) => {
  registry[`p/${key}`] ??= Position.generate();
  ops.push(...Ops.relations.create({ id: id(`e/${key}`), entityId: id(`x/${key}`), fromEntity: from, type, toEntity: to, position: registry[`p/${key}`] }).ops);
};
edge('type', parent, SystemIds.TYPES_PROPERTY, property.claim);
edge('source', parent, property.source, study.article);
edge('initiative', parent, property.related, study.initiative);
for (const claim of [...support, ...oppose]) { edge(`related/${claim}`, parent, property.related, claim); edge(`reverse/${claim}`, claim, property.related, parent); }
for (const claim of support) edge(`support/${claim}`, parent, property.support, claim);
for (const claim of oppose) edge(`oppose/${claim}`, parent, property.oppose, claim);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add Year Up PACE policy debate claim', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent, support, oppose }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, rationale: 'A nonfactual policy proposition links distinct findings from one PACE trial. The time points are evidence facets, not independent studies; the unpriced source model is intentionally excluded.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
