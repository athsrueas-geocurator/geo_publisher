import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education';
const prefix = 'youth-challenge-debate';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload; do not rebuild a published debate batch.');
const model = JSON.parse(readFileSync(`${root}/${prefix}-model.json`, 'utf8')) as {
  name: string; description: string; article: string; initiative: string; support: string[]; discovery: string[];
};
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = {
  article: 'a2a5ed0cacef46b1835de457956ce915', initiative: 'd272f19cef87485fb83e26fb68957395', claim: '96f859efa1ca4b229372c86ad58b694b',
  factual: 'da4a6c1f9d4446f9832ff3b49a4400ef', source: '49c5d5e1679a4dbdbfd33f618f227c94', related: '504e5776788844f6a77dba3ee811d8f0', support: '1dc6a843458848198e7a6e672268f811'
};
const checks: string[] = [], ops: Op[] = [], edges: { from: string; property: string; to: string }[] = [];
const check = (ok: unknown, label: string) => { if (!ok) throw Error(label); checks.push(label); };
for (const file of model.discovery) {
  const discovery = JSON.parse(readFileSync(file, 'utf8'));
  check(discovery.complete === true && discovery.nodes.length === 0, `Complete all-space discovery has no candidate: ${file}`);
}
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.source, 'Relation'], [p.related, 'Relation'], [p.support, 'Relation'], [p.factual, 'Checkbox']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(data.property?.dataTypeName === type, `Live ${type} property ${property}`);
}
const parent = id('parent');
const collision: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { id: parent, name: model.name } });
check(!collision.entity?.spaceIds?.length, `Allocated parent ID ${parent} is unused`);
check(!collision.entitiesConnection.pageInfo.hasNextPage && collision.entitiesConnection.nodes.length === 0, 'No all-space exact-name parent exists');
for (const [entity, type, label] of [[model.article, p.article, 'source Article'], [model.initiative, p.initiative, 'Initiative'], ...model.support.map((entity) => [entity, p.claim, 'factual support Claim'])] as const) {
  const data: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId boolean text}pageInfo{hasNextPage}}}}', { variables: { id: entity, space: target.spaceId } });
  check(data.entity?.types.some((x: any) => x.id === type), `Reused ${label} has expected type: ${entity}`);
  if (type === p.claim) check(!data.entity.values.pageInfo.hasNextPage && data.entity.values.nodes.some((v: any) => v.propertyId === p.factual && v.boolean === true), `Support Claim remains factual: ${entity}`);
}
ops.push(...Ops.entities.update({ id: parent, name: model.name, description: model.description, values: [{ property: p.factual, type: 'boolean', value: false }] }).ops);
const edge = (key: string, from: string, property: string, to: string) => {
  const position = registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate());
  ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`edge-entity/${key}`), fromEntity: from, type: property, toEntity: to, position }).ops);
  edges.push({ from, property, to });
};
edge('type', parent, SystemIds.TYPES_PROPERTY, p.claim);
edge('source', parent, p.source, model.article);
edge('initiative', parent, p.related, model.initiative);
for (const claim of model.support) { edge(`related/${claim}`, parent, p.related, claim); edge(`related-reverse/${claim}`, claim, p.related, parent); edge(`support/${claim}`, parent, p.support, claim); }
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add Youth ChalleNGe expansion debate claim', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), checks, opsHash: sha256, edges, model }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
