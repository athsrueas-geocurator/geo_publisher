import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

const root = 'data/education';
const spaceId = 'dac259bad48a11adf97fe36857d85206';
const original = JSON.parse(readFileSync(`${root}/source/content/dichotomies.json`, 'utf8')) as Array<Record<string, any>>;
const batch = JSON.parse(readFileSync(`${root}/original-questions-batch.json`, 'utf8')) as { crosswalk: Array<{ slug: string; entityId: string }> };
if (original.length !== 21 || batch.crosswalk.length !== original.length) throw new Error('Question source/crosswalk count changed');

const rows: any[] = [];
for (const source of original) {
  const match = batch.crosswalk.find((row) => row.slug === source.slug);
  if (!match) throw new Error(`Missing Question crosswalk: ${source.slug}`);
  const response: any = await gql(
    'query($id:UUID!,$space:UUID!){entity(id:$id){name description spaceIds relations(first:100,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId toEntity{name types{id name}}}pageInfo{hasNextPage}}}}',
    { variables: { id: match.entityId, space: spaceId } },
  );
  const entity = response.entity;
  if (!entity || entity.relations.pageInfo.hasNextPage) throw new Error(`Incomplete Question relation read: ${source.slug}`);
  rows.push({
    slug: source.slug,
    entityId: match.entityId,
    liveName: entity.name,
    liveDescription: entity.description,
    destinationSpaces: entity.spaceIds,
    relations: entity.relations.nodes,
    sourceTopic: source.topic,
    sourceIds: source.sourceIds,
    initiativeSlugs: source.keyInitiativeSlugs,
    review: 'Relationships, synthesis, continuum and assessment fields require source-aware identity review; no edges are inferred by this report.',
  });
}
const relationCounts: Record<string, number> = {};
for (const row of rows) for (const relation of row.relations) relationCounts[relation.typeId] = (relationCounts[relation.typeId] ?? 0) + 1;
const report = {
  version: 1,
  checkedAt: new Date().toISOString(),
  scope: 'destination Question relationship reconciliation',
  completeRows: rows.length,
  relationCounts,
  pendingSourceFields: ['topic', 'sourceIds', 'keyInitiativeSlugs', 'philosophicalDisagreement', 'whatWouldChangeOurMind', 'continuum', 'evidenceStrength', 'whatEvidenceSuggests', 'commonMisreadings'],
  rows,
};
writeFileSync(`${root}/original-question-relationship-reconciliation.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ rows: rows.length, relationCounts, output: `${root}/original-question-relationship-reconciliation.json` }));
