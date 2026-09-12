import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'dcmp-geography';
const location = '95d770021faf4f7cb7deb21a7d48cda0', texas = 'f457c07ce43d4e0a8bd646e971ef63ca', us = '0093d90725d94cb08903515673538d40', geographySpace = '84a679ce188f061ac9a92380bac2bab5';
if (existsSync(`${root}/${prefix}-publication.json`)) throw new Error('Preserve submitted payload.');
const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const dcmp: Record<string, string> = JSON.parse(readFileSync(`${root}/dcmp-2023-registry.json`, 'utf8'));
const targets = [dcmp.article, dcmp.initiative, ...['design', 'net-cost', 'components', 'credential-or-enrollment', 'credits', 'cost-per-attainment', 'cost-per-credit'].map(key => dcmp[`claim/${key}`])];
const checks: string[] = [];
const canonical: any = await gql('query($id:UUID!){entity(id:$id){name types{name} relations(first:50){nodes{typeId toEntityId} pageInfo{hasNextPage}}}}', { variables: { id: texas } });
if (canonical.entity?.name !== 'Texas' || canonical.entity.relations.pageInfo.hasNextPage || !canonical.entity.types.some((type: any) => type.name === 'State') || !canonical.entity.relations.nodes.some((edge: any) => edge.typeId === '6d8cd471f7af415f941118b1ef106434' && edge.toEntityId === us)) throw new Error('Canonical Geography-space Texas State identity required.');
checks.push('Canonical Texas State in Geography space');
const ops: Op[] = [];
for (const from of targets) {
  const existing: any = await gql('query($from:UUID!,$space:UUID!,$type:UUID!,$to:UUID!){relationsConnection(first:2,filter:{fromEntityId:{is:$from},spaceId:{is:$space},typeId:{is:$type},toEntityId:{is:$to}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { from, space: target.spaceId, type: location, to: texas } });
  if (existing.relationsConnection.pageInfo.hasNextPage || existing.relationsConnection.nodes.length) throw new Error(`Location relation already exists: ${from}`);
  const key = `location/${from}`;
  registry[`position/${key}`] ??= Position.generate();
  ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type: location, toEntity: texas, toSpace: geographySpace, position: registry[`position/${key}`] }).ops);
  checks.push(`No duplicate Texas relation: ${from}`);
}
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Link DCMP evidence to canonical Texas geography', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { texas, targets }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, scope: 'The primary DCMP report names four Texas community colleges. No exact all-space identities were found for those colleges, so this package records only canonical Texas State geography and does not invent city-level map locations.' }, null, 2) + '\n');
console.log(JSON.stringify(batch, null, 2));
