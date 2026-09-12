import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'pace-debate';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const study: Record<string, string> = JSON.parse(readFileSync(`${root}/pace-2019-registry.json`, 'utf8'));
const p = { claim: '96f859efa1ca4b229372c86ad58b694b', factual: 'da4a6c1f9d4446f9832ff3b49a4400ef', source: '49c5d5e1679a4dbdbfd33f618f227c94', related: 'dfa6aebe1ca94bf29faccc4cc7afb24c', support: '1dc6a843458848198e7a6e672268f811', oppose: '4e6ec5d14292498a84e5f607ca1a08ce' };
const name = 'States should treat PACE’s short-term school gains as insufficient evidence for statewide expansion.';
const description = 'PACE’s randomized evaluation found improved first-year attendance, on-track status, credit success, and suspension outcomes, but no statistically significant 18-month difference in juvenile-justice charges. The same source reports a $10,400 net societal service cost per program-group girl and says its short follow-up cannot establish later graduation, delinquency, or full cost-effectiveness outcomes.';
const support = [study['claim/net-cost'], study['claim/charge']];
const oppose = [study['claim/days-present'], study['claim/on-track'], study['claim/credit-success'], study['claim/suspension']];
const checks: string[] = [];
const check = (ok: unknown, label: string) => { if (!ok) throw new Error(label); checks.push(label); };
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.factual, 'Checkbox'], [p.source, 'Relation'], [p.related, 'Relation'], [p.support, 'Relation'], [p.oppose, 'Relation']] as const) {
  const result: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(result.property?.dataTypeName === type, `Live ${type}: ${property}`);
}
const parent = id('parent');
const collision: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { id: parent, name } });
check(!collision.entity?.spaceIds?.length, `Allocated parent unused: ${parent}`);
check(!collision.entitiesConnection.pageInfo.hasNextPage && collision.entitiesConnection.nodes.length === 0, 'Complete all-space exact-title discovery has no candidate.');
for (const claim of [...support, ...oppose]) {
  const result: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}', { variables: { id: claim, space: target.spaceId } });
  check(result.entity?.types.some((type: any) => type.id === p.claim), `Evidence Claim type: ${claim}`);
  check(!result.entity?.values.pageInfo.hasNextPage && result.entity.values.nodes.some((value: any) => value.propertyId === p.factual && value.boolean === true), `Evidence remains factual: ${claim}`);
}
const articleResult: any = await gql('query($id:UUID!){entity(id:$id){types{id}spaceIds}}', { variables: { id: study.article } });
check(articleResult.entity?.spaceIds?.includes(target.spaceId) && articleResult.entity.types.some((type: any) => type.id === 'a2a5ed0cacef46b1835de457956ce915'), 'Source Article remains available in target space.');
const ops: Op[] = [];
ops.push(...Ops.entities.update({ id: parent, name, description, values: [{ property: p.factual, type: 'boolean', value: false }] }).ops);
const edge = (key: string, from: string, type: string, to: string) => {
  registry[`position/${key}`] ??= Position.generate();
  ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position: registry[`position/${key}`] }).ops);
};
edge('type', parent, SystemIds.TYPES_PROPERTY, p.claim);
edge('source', parent, p.source, study.article);
edge('initiative', parent, p.related, study.initiative);
for (const claim of [...support, ...oppose]) { edge(`related/${claim}`, parent, p.related, claim); edge(`related-reverse/${claim}`, claim, p.related, parent); }
for (const claim of support) edge(`support/${claim}`, parent, p.support, claim);
for (const claim of oppose) edge(`oppose/${claim}`, parent, p.oppose, claim);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add PACE short-term-evidence debate claim', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent, support, oppose }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, rationale: 'The nonfactual parent invites a policy judgment about evidentiary sufficiency. The cost and null charge finding support caution; the four statistically significant first-year school outcomes are opposing considerations. Every linked record comes from the same Article and remains related context, preventing one trial from being counted as independent corroboration.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
