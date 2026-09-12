import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

const root = 'data/education';
const batch: any = JSON.parse(readFileSync(`${root}/teacher-incentive-fund-batch.json`, 'utf8'));
const claims = Object.values(batch.entities.claims as Record<string, string>);
async function pages(query: string, variables: any, key: string) {
  const nodes: any[] = []; let after: string | null = null; const seen = new Set<string>();
  for (;;) {
    const data: any = await gql(query, { variables: { ...variables, after } }); const page = data[key]; nodes.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) return nodes;
    if (!page.pageInfo.endCursor || seen.has(page.pageInfo.endCursor)) throw new Error('Repeated or missing cursor');
    seen.add(page.pageInfo.endCursor); after = page.pageInfo.endCursor;
  }
}
const source: any = await gql('query($id:UUID!){entity(id:$id){name}}', { variables: { id: batch.entities.article } });
const identity = await pages('query($name:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}} pageInfo{hasNextPage endCursor}}}', { name: source.entity?.name }, 'entitiesConnection');
const memberships = await Promise.all(claims.map(async (claimId) => ({ claimId, complete: true, nodes: await pages('query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{id fromEntityId spaceId position} pageInfo{hasNextPage endCursor}}}', { id: claimId }, 'relationsConnection') })));
const sourceOnly = identity.length === 1 && identity[0].id === batch.entities.article && identity[0].types?.every((type: any) => type.name === 'Article');
const distinct = identity.map((candidate: any) => ({ ...candidate, decision: 'distinct', rationale: 'Expected Article source identity; it is not a result collection.' }));
const report = { version: 1, checkedAt: new Date().toISOString(), scope: 'all-spaces', sourceId: batch.entities.article, claimIds: claims, searches: [{ kind: 'alias', query: source.entity?.name, complete: true, candidates: distinct }, { kind: 'identifier', query: batch.entities.article, complete: true, candidates: distinct.filter((candidate: any) => candidate.id === batch.entities.article) }], identitySearch: { query: source.entity?.name, complete: true, nodes: identity }, claimMemberships: memberships, datasetDecision: sourceOnly && memberships.every((m) => m.nodes.length === 0) ? 'create' : 'review', rationale: 'Complete all-space source identity and incoming Collection-item queries; the expected Article identity is not a result collection, and existing Claims remain immutable.' };
writeFileSync(`${root}/teacher-incentive-fund-collection-discovery.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ identityCandidates: identity.length, claimsChecked: claims.length, memberships: memberships.reduce((n, m) => n + m.nodes.length, 0), datasetDecision: report.datasetDecision }));
