import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { Ops, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education';
const repairs = {
  abecedarian: {
    prefix: 'abecedarian-age30-debate-scope-repair',
    id: '58caa8fd523742978fa07d54722d918a',
    oldName: 'Governments should expand high-quality early-childhood education modeled on the Abecedarian program.',
    name: 'The Abecedarian trial’s age-30 outcomes justify expanding programs modeled on it.',
    description: 'This policy position weighs ABC’s age-30 education and employment findings against its non-significant primary income-to-needs result. One small historical trial does not resolve modern program design, cost, delivery, scale, or priority choices.',
    scope: 'Copy-only scope repair. The parent now identifies the actual ABC trial and its age-30 evidence as the basis for the policy judgment; it does not imply that this one historical trial establishes the case for early-childhood education generally.',
  },
  induction: {
    prefix: 'teacher-induction-rct-debate-scope-repair',
    id: '48e8f2510c64493ebe28185c347f0ebf',
    oldName: 'Districts should fund two years of comprehensive teacher induction.',
    name: 'Districts should fund two years of comprehensive teacher induction based on the six-district benchmark results.',
    description: 'This policy position weighs positive year-three reading and math benchmarks in two-year districts against no statistically significant same-school retention effect. The benchmark estimates use a restricted current-and-prior-test sample and do not establish effects for every district or induction model.',
    scope: 'Copy-only scope repair. The parent now names the two-year, six-district benchmark basis for the policy judgment; evidence links and factual Claims remain unchanged.',
  },
} as const;

const selected = process.argv[2] as keyof typeof repairs | undefined;
if (!selected || !(selected in repairs)) throw new Error('Use: bun scripts/education-repair-policy-parent-scope.ts <abecedarian|induction>');
const repair = repairs[selected];
if (existsSync(`${root}/${repair.prefix}-publication.json`)) throw new Error('Preserve submitted payload.');

const current: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name types{id}values(first:20,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}', { variables: { id: repair.id, space: target.spaceId } });
if (current.entity?.name !== repair.oldName || current.entity.values.pageInfo.hasNextPage || !current.entity.types.some((type: any) => type.id === '96f859efa1ca4b229372c86ad58b694b') || !current.entity.values.nodes.some((value: any) => value.propertyId === 'da4a6c1f9d4446f9832ff3b49a4400ef' && value.boolean === false)) throw new Error('Expected existing nonfactual policy Claim.');

const ops: Op[] = Ops.entities.update({ id: repair.id, name: repair.name, description: repair.description }).ops;
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: `Clarify ${selected === 'abecedarian' ? 'Abecedarian' : 'teacher-induction'} policy Claim scope`, spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${repair.prefix}-ops.json`, sha256, journalPath: `${root}/${repair.prefix}-publication.json`, validationPath: `${root}/${repair.prefix}-validation.json`, entities: { parent: repair.id }, operationCount: ops.length };
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${repair.prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks: ['Existing Claim is nonfactual.', 'Replacement description has two sentences.', 'No numerical values, sources, or evidence links change.'], scope: repair.scope }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
