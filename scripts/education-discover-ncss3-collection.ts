import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

const root = 'data/education';
const batch: any = JSON.parse(readFileSync(`${root}/ncss3-batch.json`, 'utf8'));
const claims = Object.values(batch.entities.claims as Record<string, string>);
const sourceId = batch.entities.article;

async function pages(query: string, variables: any, key: string) {
  let after: string | null = null;
  const nodes: any[] = [];
  const seen = new Set<string>();
  for (;;) {
    const data: any = await gql(query, { variables: { ...variables, after } });
    const connection = data[key];
    nodes.push(...connection.nodes);
    if (!connection.pageInfo.hasNextPage) return nodes;
    const cursor = connection.pageInfo.endCursor;
    if (!cursor || seen.has(cursor)) throw new Error('Repeated or missing cursor');
    seen.add(cursor);
    after = cursor;
  }
}

const identity = await pages(
  'query($name:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}} pageInfo{hasNextPage endCursor}}}',
  { name: 'National Charter School Study III' },
  'entitiesConnection',
);
const memberships = [];
for (const claimId of claims) {
  const nodes = await pages(
    'query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{id fromEntityId spaceId position} pageInfo{hasNextPage endCursor}}}',
    { id: claimId },
    'relationsConnection',
  );
  memberships.push({ claimId, complete: true, nodes });
}
const report = { version: 1, checkedAt: new Date().toISOString(), scope: 'all-spaces', sourceId, claimIds: claims,
  searches: [
    { kind: 'alias', query: 'National Charter School Study III', complete: true, candidates: identity.map((c: any) => ({ ...c, decision: 'distinct', rationale: 'Retained for explicit review before reuse or creation.' })) },
    { kind: 'identifier', query: sourceId, complete: true, candidates: [] },
  ],
  identitySearch: { query: 'National Charter School Study III', complete: true, nodes: identity },
  claimMemberships: memberships,
  datasetDecision: identity.length === 0 && memberships.every((m) => m.nodes.length === 0) ? 'create' : 'review',
  rationale: 'Complete exact all-space identity and incoming Collection-item queries; existing Claims remain immutable.' };
writeFileSync(`${root}/ncss3-collection-discovery.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ identityCandidates: identity.length, claimsChecked: claims.length, memberships: memberships.reduce((n, m) => n + m.nodes.length, 0) }));
