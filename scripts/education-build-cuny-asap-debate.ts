import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'cuny-asap-debate';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload; do not rebuild a published debate batch.');
const model = JSON.parse(readFileSync(`${root}/${prefix}-model.json`, 'utf8')) as { name: string; description: string; article: string; initiative: string; support: string[]; oppose: string[]; discovery: string[] };
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { claim: '96f859efa1ca4b229372c86ad58b694b', article: 'a2a5ed0cacef46b1835de457956ce915', initiative: 'd272f19cef87485fb83e26fb68957395', factual: 'da4a6c1f9d4446f9832ff3b49a4400ef', source: '49c5d5e1679a4dbdbfd33f618f227c94', related: '504e5776788844f6a77dba3ee811d8f0', support: '1dc6a843458848198e7a6e672268f811', oppose: '4e6ec5d14292498a84e5f607ca1a08ce' };
const checks: string[] = [], edges: { from: string; property: string; to: string }[] = [], ops: Op[] = [];
const check = (ok: unknown, label: string) => { if (!ok) throw new Error(label); checks.push(label); };
for (const file of model.discovery) { const d = JSON.parse(readFileSync(file, 'utf8')); check(d.complete === true && d.nodes.length === 0, `Complete all-space discovery has no candidate: ${file}`); }
for (const [property, dataType] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.source, 'Relation'], [p.related, 'Relation'], [p.support, 'Relation'], [p.oppose, 'Relation'], [p.factual, 'Checkbox']] as const) { const d: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } }); check(d.property?.dataTypeName === dataType, `Live ${dataType} property: ${property}`); }
const parent = id('parent');
const collision: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { id: parent, name: model.name } });
check(!collision.entity?.spaceIds?.length, `Allocated parent ID is unused: ${parent}`); check(!collision.entitiesConnection.pageInfo.hasNextPage && collision.entitiesConnection.nodes.length === 0, 'No all-space exact-name parent exists');
for (const [entity, type, label] of [[model.article, p.article, 'Article'], [model.initiative, p.initiative, 'Initiative'], ...model.support.map(x => [x, p.claim, 'supporting factual Claim']), ...model.oppose.map(x => [x, p.claim, 'opposing factual Claim'])] as const) { const d: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}', { variables: { id: entity, space: target.spaceId } }); check(d.entity?.types.some((x: any) => x.id === type), `Reused ${label} has expected type: ${entity}`); if (type === p.claim) check(!d.entity.values.pageInfo.hasNextPage && d.entity.values.nodes.some((v: any) => v.propertyId === p.factual && v.boolean === true), `Evidence remains factual: ${entity}`); }
ops.push(...Ops.entities.update({ id: parent, name: model.name, description: model.description, values: [{ property: p.factual, type: 'boolean', value: false }] }).ops);
const edge = (key: string, from: string, property: string, to: string) => { ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type: property, toEntity: to, position: registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate()) }).ops); edges.push({ from, property, to }); };
edge('type', parent, SystemIds.TYPES_PROPERTY, p.claim); edge('source', parent, p.source, model.article); edge('initiative', parent, p.related, model.initiative);
for (const claim of [...model.support, ...model.oppose]) { edge(`related/${claim}`, parent, p.related, claim); edge(`related-reverse/${claim}`, claim, p.related, parent); }
for (const claim of model.support) edge(`support/${claim}`, parent, p.support, claim);
for (const claim of model.oppose) edge(`oppose/${claim}`, parent, p.oppose, claim);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add CUNY ASAP continued-investment debate claim', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n'); writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, edges, model, rationale: 'Degree completion supports continued investment; program-minus-control net cost and higher cost per degree challenge it. These roles describe relevance to the policy proposition, not independent replications or a source recommendation.' }, null, 2) + '\n'); console.log(JSON.stringify(batch, null, 2));
