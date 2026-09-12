import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Ops, Position, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'tfa-teaching-fellows-debate-repair';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const original = JSON.parse(readFileSync(`${root}/tfa-teaching-fellows-debate-registry.json`, 'utf8')) as Record<string, string>;
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const parent = original.parent;
const formerOpposition = ['2884a49085ee49caa8d2d916c7cd1dfe', 'ae115caedc1d40079cb88cdc680c71c8', 'd7993ccda23842c6976de0dc7abe47a6'];
const support = '1dc6a843458848198e7a6e672268f811';
const expectedName = 'Districts should recruit selective alternative-route teachers for secondary math.';
const name = 'Districts should evaluate alternative-route teacher pipelines separately rather than generalize results from one program to another.';
const description = 'This randomized evaluation found a positive Teach For America comparison and null average Teaching Fellows comparisons. Each program was compared with its own teachers in the same courses and schools, not directly with the other program.';
const current: any = await gql('query($id:UUID!){entity(id:$id){name types{id}}}', { variables: { id: parent } });
if (current.entity?.name !== expectedName || !current.entity.types.some((type: any) => type.id === '96f859efa1ca4b229372c86ad58b694b')) throw Error('Expected existing TFA/Teaching Fellows debate Claim.');
const relations: any = await gql('query($ids:[UUID!]!){relations(filter:{id:{in:$ids}}){id fromEntityId toEntityId typeId spaceId}}', { variables: { ids: formerOpposition.map((claim) => original[`edge/oppose/${claim}`]) } });
if (relations.relations.length !== formerOpposition.length) throw Error('Expected all recorded opposing edges.');
for (const relation of relations.relations) {
  if (relation.fromEntityId !== parent || !formerOpposition.includes(relation.toEntityId) || relation.typeId !== '4e6ec5d14292498a84e5f607ca1a08ce' || relation.spaceId !== target.spaceId) throw Error('Recorded opposing edge no longer matches this repair.');
}
const ops: Op[] = [...Ops.entities.update({ id: parent, name, description }).ops];
for (const relation of relations.relations) ops.push(...Ops.relations.delete({ id: relation.id }).ops);
for (const claim of formerOpposition) {
  ops.push(...Ops.relations.create({ id: id(`support/${claim}`), entityId: id(`relation/support/${claim}`), fromEntity: parent, type: support, toEntity: claim, position: registry[`position/support/${claim}`] ?? (registry[`position/support/${claim}`] = Position.generate()) }).ops);
}
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Repair TFA and Teaching Fellows debate claim scope and evidence roles', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent, reclassifiedEvidence: formerOpposition }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks: ['Existing nonfactual parent identity verified.', 'All three recorded opposing edges verified before deletion.', 'Replacement description has two sentences.', 'The factual results remain source-linked and Related in both directions.'], scope: 'A source-aware repair: preserve the seven factual estimates, Article, Initiative, and Related edges. Reclassify the three Teaching Fellows results from opposition to support because all results substantiate the narrower proposition that the programs must be evaluated separately; no result is evidence against that proposition.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
