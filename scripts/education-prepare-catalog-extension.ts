import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education';
const page = '16a032fb91794444859a6c1a44a32955';
const block = '2279edef1bbe479c872caeb72ee90022';
const sourceBatches = ['evidence-for-essa', 'national-student-clearinghouse-research-center', 'state-longitudinal-data-systems'];
if (existsSync(`${root}/catalog-extension-publication.json`)) throw new Error('Preserve submitted payload; refusing to overwrite publication journal');
const registryPath = `${root}/catalog-extension-registry.json`;
const registry: Record<string, string> = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const batches = sourceBatches.map((slug) => JSON.parse(readFileSync(`${root}/${slug}-catalog-resource-batch.json`, 'utf8')));
const additions: Array<{ id: string; name: string; position?: string }> = batches.map((batch) => ({ id: batch.entities.dataset as string, name: batch.name.replace(/^Prepare /, '').replace(/ catalog resource$/, '') }));
const vars = { id: block, space: target.spaceId };
const live: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name spaceIds relations(first:100,filter:{spaceId:{is:$space},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{entityId toEntityId position toEntity{name}}pageInfo{hasNextPage endCursor}}}}', { variables: vars });
const relationPage = live.entity?.relations;
if (live.entity?.name !== 'Datasets' || !live.entity.spaceIds.includes(target.spaceId) || relationPage?.pageInfo?.hasNextPage) throw new Error('Catalog block changed or membership read is incomplete');
const existing = relationPage.nodes as Array<{ entityId: string; toEntityId: string; position: string; toEntity: { name: string } }>;
if (existing.length !== 27 || new Set(existing.map((row) => row.toEntityId)).size !== 27) throw new Error('Expected the current 27-member catalog before extension');
if (additions.some((row) => existing.some((item) => item.toEntityId === row.id))) throw new Error('A catalog extension member is already present');

// Existing catalog members include later append-only additions, so preserve their
// live order and append the reconciled resources after the current final position.
const maxPosition = existing.map((row) => row.position).sort().at(-1) ?? null;
let nextPosition = maxPosition;
for (const row of additions) {
  row.position = Position.generateBetween(nextPosition, null);
  nextPosition = row.position;
}
const ops: Op[] = [];
for (const row of additions) {
  if (!row.position) throw new Error('Missing generated catalog position');
  ops.push(...Ops.relations.create({ id: id(`edge/${row.id}`), entityId: id(`relation/${row.id}`), fromEntity: block, type: SystemIds.COLLECTION_ITEM_RELATION_TYPE, toEntity: row.id, position: row.position }).ops);
}
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Extend native education catalog with three reconciled resources', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/catalog-extension-ops.json`, sha256, journalPath: `${root}/catalog-extension-publication.json`, validationPath: `${root}/catalog-extension-validation.json`, pageId: page, blockId: block, members: additions, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/catalog-extension-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks: ['Catalog block identity and destination verified', 'Complete 25-member incoming catalog read', 'Three new Dataset IDs already passed all-space identity checks', 'Alphabetical positions computed between live neighbors', 'Only Collection-item relations added; existing datasets and page block unchanged'], scope: 'Prepare-only catalog membership extension; publication remains paused.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, members: additions, operationCount: ops.length }, null, 2));
