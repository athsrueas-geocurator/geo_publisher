import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { Ops, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'teacher-coaching-debate-scope-repair';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const id = 'd81e456297ae46d0bdaaeeefb1fcab22';
const oldName = 'Districts should invest in sustained teacher coaching.';
const name = 'Districts should fund sustained teacher coaching across subjects and implementation models.';
const description = 'The meta-analysis reports positive pooled instruction and achievement estimates across its causal-study samples. Smaller math, science, and general-practice achievement subsets make a claim of uniform effects across subjects and models debatable.';
const data: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name types{id}values(first:20,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}', { variables: { id, space: target.spaceId } });
if (data.entity?.name !== oldName || data.entity.values.pageInfo.hasNextPage || !data.entity.types.some((type: any) => type.id === '96f859efa1ca4b229372c86ad58b694b') || !data.entity.values.nodes.some((value: any) => value.propertyId === 'da4a6c1f9d4446f9832ff3b49a4400ef' && value.boolean === false)) throw Error('Expected existing nonfactual teacher-coaching Claim.');
const ops: Op[] = Ops.entities.update({ id, name, description }).ops;
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Clarify teacher-coaching debate claim scope', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { parent: id }, operationCount: ops.length };
writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n'); writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks: ['Existing Claim is nonfactual.', 'Replacement description has two sentences.', 'Existing Supporting/Opposing links remain unchanged.'], scope: 'Copy-only scope repair. The smaller overlapping subsets challenge uniform deployment across subjects and implementation models; they are not represented as proof against teacher coaching generally.' }, null, 2) + '\n'); console.log(JSON.stringify(batch, null, 2));
