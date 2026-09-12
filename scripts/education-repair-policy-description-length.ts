import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Ops, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'policy-description-length-repair';
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload.');
const rows = [
  ['6a17e75eef784856b20aa358a5eb7660', 'Developmental-math reforms should show statistically persuasive long-term outcomes before broad expansion.', 'DCMP’s randomized five-year follow-up found no statistically significant credential/enrollment or credit difference, alongside positive net social cost. Its lower cost per attainment is source arithmetic on a non-significant difference, not confirmed savings.'],
  ['ef2a762698ee48d1b663193758dd3ae2', 'States should treat PACE’s short-term school gains as insufficient evidence for statewide expansion.', 'PACE improved several first-year school outcomes but showed no significant 18-month difference in juvenile-justice charges. The $10,400 net societal service cost and short follow-up leave graduation, delinquency, and full cost-effectiveness unresolved.'],
  ['89724696a30644478a285d856a412b1f', 'Districts should consider well-evaluated ethnic-studies expansion when local evidence shows sustained GPA and course-failure improvements.', 'San Francisco’s expansion study reports higher GPA and fewer course failures under student-level difference-in-differences. One district’s enrollment patterns do not predict effects of every expansion.'],
] as const;
const checks: string[] = [], ops: Op[] = [];
for (const [id, name, description] of rows) {
  const entity: any = await gql('query($id:UUID!){entity(id:$id){name description}}', { variables: { id } });
  if (entity.entity?.name !== name || !entity.entity.description) throw Error(`Current identity mismatch: ${id}`);
  if (description.split(/[.!?](?:\s|$)/).filter(Boolean).length > 2) throw Error(`Description exceeds two sentences: ${id}`);
  checks.push(`Current identity and concise replacement: ${id}`);
  ops.push(...Ops.entities.update({ id, description }).ops);
}
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Shorten three policy Claim descriptions', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { claims: rows.map(([id]) => id) }, operationCount: ops.length };
writeFileSync(batch.opsPath, bytes); writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, scope: 'Description-only repair for three nonfactual policy Claims. Names, factual flags, structured values, sources, and evidence relations are unchanged.' }, null, 2) + '\n'); console.log(JSON.stringify(batch, null, 2));
