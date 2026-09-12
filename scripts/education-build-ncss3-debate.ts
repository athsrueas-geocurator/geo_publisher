import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'ncss3-debate';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = { claim: '96f859efa1ca4b229372c86ad58b694b', factual: 'da4a6c1f9d4446f9832ff3b49a4400ef', source: '49c5d5e1679a4dbdbfd33f618f227c94', related: 'dfa6aebe1ca94bf29faccc4cc7afb24c', support: '1dc6a843458848198e7a6e672268f811', oppose: '4e6ec5d14292498a84e5f607ca1a08ce', unit: '8405509cc7354655a348591349a5f025', locator: '84dacbddca6a44079edb5e11a4c66b40' };
const article = 'e250e966938549269ac74b1935fa380d', study = '06ce03fee15844c18a6bfce808f03d12';
const parentName = 'Districts should expand charter schools based on NCSS3’s national matched-growth results.';
const parentDescription = 'NCSS3 reports higher average charter-student growth, but its matched comparisons are not random assignment. Wide jurisdictional variation and the reported smaller gains for charter special-education students make local evidence material to an expansion decision.';
const supporting = ['ae72d01cfc13405a9632fa9c1a0d0f61', '96553fbe54d44eb3bad7ff1e7486add7', '418b23ad246b4312855e72e56c26d46e', 'b40799e079774e74bbbda89af4d0076d', 'dc036c8ceb504035a0b7a79fdf90b54c'];
const opposing = ['442b6446a1b54fd3a6c60a85e46e9e8e', '3f1aaf1f5e754fdb8fb55926e3368dba'];
const specialEducationName = 'CREDO reports smaller learning gains for charter-school special-education students than for matched peers.';
const specialEducationDescription = 'The official NCSS3 release identifies smaller gains for this subgroup but does not print a numeric day estimate. This matched-growth finding is not a randomized charter-admission effect.';
const checks: string[] = [], ops: Op[] = [];
const check = (value: unknown, message: string) => { if (!value) throw Error(message); checks.push(message); };
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.factual, 'Checkbox'], [p.source, 'Relation'], [p.related, 'Relation'], [p.support, 'Relation'], [p.oppose, 'Relation'], [p.unit, 'Text'], [p.locator, 'Text']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } }); check(data.property?.dataTypeName === type, `Live ${type}: ${property}`);
}
for (const [key, name] of [['parent', parentName], ['special-education', specialEducationName]] as const) {
  const entityId = id(key); const data: any = await gql('query($id:UUID!,$name:String!){entity(id:$id){spaceIds}entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { id: entityId, name } });
  check(!data.entity?.spaceIds?.length, `Allocated ID unused: ${key}`); check(!data.entitiesConnection.pageInfo.hasNextPage && !data.entitiesConnection.nodes.length, `Complete all-space identity discovery: ${key}`);
}
for (const evidence of [...supporting, ...opposing]) {
  const data: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}', { variables: { id: evidence, space: target.spaceId } });
  check(data.entity?.types.some((type: any) => type.id === p.claim) && !data.entity.values.pageInfo.hasNextPage && data.entity.values.nodes.some((value: any) => value.propertyId === p.factual && value.boolean === true), `Factual evidence available: ${evidence}`);
}
const parent = id('parent'), specialEducation = id('special-education');
const edge = (key: string, from: string, type: string, to: string) => ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position: registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate()) }).ops);
ops.push(...Ops.entities.update({ id: specialEducation, name: specialEducationName, description: specialEducationDescription, values: [{ property: p.factual, type: 'boolean', value: true }, { property: p.unit, type: 'text', value: 'Matched-growth subgroup finding; numeric day estimate not reported in the official release.' }, { property: p.locator, type: 'text', value: 'Official CREDO NCSS3 release, key student-level findings, June 2023.' }] }).ops);
edge('special-education/type', specialEducation, SystemIds.TYPES_PROPERTY, p.claim); edge('special-education/source', specialEducation, p.source, article); edge('special-education/study', specialEducation, p.related, study);
ops.push(...Ops.entities.update({ id: parent, name: parentName, description: parentDescription, values: [{ property: p.factual, type: 'boolean', value: false }] }).ops);
edge('parent/type', parent, SystemIds.TYPES_PROPERTY, p.claim); edge('parent/source', parent, p.source, article); edge('parent/study', parent, p.related, study);
for (const evidence of [...supporting, ...opposing, specialEducation]) { edge(`related/${evidence}`, parent, p.related, evidence); edge(`related-reverse/${evidence}`, evidence, p.related, parent); }
for (const evidence of supporting) edge(`support/${evidence}`, parent, p.support, evidence);
for (const evidence of [...opposing, specialEducation]) edge(`oppose/${evidence}`, parent, p.oppose, evidence);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add NCSS3 charter-expansion debate and special-education qualification', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent, specialEducation, article, study, supporting, opposing }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, scope: 'One source-backed nonfactual charter-expansion Claim and one nonnumeric factual special-education qualification. National/sector matched-growth summaries support the proposition; geographic heterogeneity and the special-education subgroup finding oppose generalization. This is not presented as a randomized causal result or as independent evidence rows.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
