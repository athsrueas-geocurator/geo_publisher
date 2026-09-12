import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'ccd-catalog-block';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const dataset = '6bf3954ea2814e1db6f84bedbdba599c', blocks = 'beaba5cba67741a8b35377030613fc70', markdown = 'e3e363d1dd294ccb8e6ff3b76d99bc33', textBlock = '76474f2f00894e77a0410b39fb17d0bf';
const content = `## Catalog metadata\n\n- **Steward:** National Center for Education Statistics\n- **Access:** Primary annual bulk files; an Urban Institute API mirror can support bounded extracts.\n- **Unit:** Public school or local education agency, annually.\n- **Coverage:** Annual releases; select and record the exact vintage before analysis.\n- **Join keys:** NCES school ID, LEA ID, state LEA ID, and FIPS.\n- **Uses:** Directory, enrollment, staffing, grade span, locale, and charter/magnet context.\n\nCCD is an identifier and descriptive-context backbone. It cannot by itself establish that an education initiative caused an outcome.`;
const checks: string[] = [];
for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [blocks, 'Relation'], [markdown, 'Text']] as const) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  if (data.property?.dataTypeName !== type) throw Error(`Schema ${property}`);
  checks.push(`Schema ${property}`);
}
const current: any = await gql('query($id:UUID!,$space:UUID!,$property:UUID!){entity(id:$id){relations(first:20,filter:{spaceId:{is:$space},typeId:{is:$property}}){nodes{id toEntity{id}}pageInfo{hasNextPage}}}}', { variables: { id: dataset, space: target.spaceId, property: blocks } });
if (!current.entity || current.entity.relations.pageInfo.hasNextPage || current.entity.relations.nodes.length) throw Error('Existing CCD block relation requires review');
const block = id('block');
const occupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: block } });
if (occupied.entity?.spaceIds?.length) throw Error('Allocated block ID occupied');
const ops: Op[] = [...Ops.entities.update({ id: block, name: 'CCD catalog metadata', values: [{ property: markdown, type: 'text', value: content }] }).ops];
const edge = (key: string, from: string, type: string, to: string) => { registry[`position/${key}`] ??= Position.generate(); ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position: registry[`position/${key}`] }).ops); };
edge('type', block, SystemIds.TYPES_PROPERTY, textBlock); edge('attach', dataset, blocks, block);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add Common Core of Data catalog metadata block', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { dataset, block }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n'); writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, scope: 'A reader-facing catalog metadata block attached to the existing CCD Dataset. It preserves the noncausal context boundary and does not expose raw records.' }, null, 2) + '\n'); console.log(JSON.stringify(batch, null, 2));
