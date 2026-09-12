import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

const root = 'data/education';
const plan = JSON.parse(readFileSync(`${root}/workadvance-collection-plan.json`, 'utf8')) as any;
const facts = JSON.parse(readFileSync(`${root}/workadvance-collection-facts.json`, 'utf8')) as any[];
const searches = [
  { kind: 'alias', query: plan.name },
  { kind: 'identifier', query: 'workadvance-collection' },
];
async function identity(name: string) {
  let after: string | null = null; const nodes: any[] = []; const cursors = new Set<string>();
  for (;;) {
    const result: any = await gql('query($name:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}', { variables: { name, after } });
    const page = result.entitiesConnection; nodes.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) return { complete: true, nodes };
    if (!page.pageInfo.endCursor || cursors.has(page.pageInfo.endCursor)) throw Error(`Repeated identity cursor for ${name}`);
    cursors.add(page.pageInfo.endCursor); after = page.pageInfo.endCursor;
  }
}
async function memberships(id: string) {
  let after: string | null = null; const nodes: any[] = []; const cursors = new Set<string>();
  for (;;) {
    const result: any = await gql('query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{id fromEntityId spaceId position}pageInfo{hasNextPage endCursor}}}', { variables: { id, after } });
    const page = result.relationsConnection; nodes.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) return { complete: true, nodes };
    if (!page.pageInfo.endCursor || cursors.has(page.pageInfo.endCursor)) throw Error(`Repeated membership cursor for ${id}`);
    cursors.add(page.pageInfo.endCursor); after = page.pageInfo.endCursor;
  }
}
const identityResults = []; for (const search of searches) identityResults.push({ ...search, ...(await identity(search.query)) });
const membershipResults = []; for (const fact of facts) membershipResults.push({ claimId: fact.id, ...(await memberships(fact.id)) });
const report = { version: 1, checkedAt: new Date().toISOString(), scope: 'all-spaces', sourceId: plan.sourceIds[0], searches: identityResults.map((search: any) => ({ ...search, candidates: search.nodes.map((candidate: any) => ({ ...candidate, decision: 'distinct', rationale: 'Identity candidate is retained for explicit review before any reuse or creation decision.' })) })), claimMemberships: membershipResults, datasetDecision: identityResults.every((search: any) => search.nodes.length === 0) ? 'create' : 'review', rationale: 'Exact proposed collection identity and all incoming Collection-item relations were queried with complete cursors. Existing Claims remain immutable; any discovered Dataset or membership requires a reviewed delta.' };
writeFileSync(`${root}/workadvance-collection-discovery.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output: `${root}/workadvance-collection-discovery.json`, identityCandidates: identityResults.reduce((n: number, s: any) => n + s.nodes.length, 0), claimsChecked: membershipResults.length, memberships: membershipResults.reduce((n: number, s: any) => n + s.nodes.length, 0) }, null, 2));
