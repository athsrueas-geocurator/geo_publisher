import { mkdirSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql, resolveGeoApiEndpoint } from '../src/geo-api-client';

type Node = { id: string; name: string; description?: string | null; spaceIds: string[]; types: Array<{ id: string; name: string }> };
type Search = { kind: 'name' | 'identifier'; term: string; nodes: Node[]; pages: Array<{ hasNextPage: boolean; endCursor: string | null }>; complete: boolean };

async function search(kind: Search['kind'], term: string): Promise<Search> {
  const result: Search = { kind, term, nodes: [], pages: [], complete: false };
  let after: string | null = null;
  const cursors = new Set<string>();
  do {
    const data: any = kind === 'name'
      ? await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}', { variables: { term, after } })
      : await gql('query($term:String!,$after:Cursor){valuesConnection(first:20,after:$after,filter:{text:{includesInsensitive:$term}}){nodes{entity{id name description spaceIds types{id name}}}pageInfo{hasNextPage endCursor}}}', { variables: { term, after } });
    const page = kind === 'name' ? data.entitiesConnection : data.valuesConnection;
    result.nodes.push(...(kind === 'name' ? page.nodes : page.nodes.map((node: any) => node.entity)));
    result.pages.push(page.pageInfo);
    if (!page.pageInfo.hasNextPage) { result.complete = true; break; }
    if (!page.pageInfo.endCursor || cursors.has(page.pageInfo.endCursor)) throw new Error(`Pagination did not advance for ${kind}: ${term}`);
    cursors.add(page.pageInfo.endCursor);
    after = page.pageInfo.endCursor;
  } while (true);
  return result;
}

const report = {
  sourceKey: 'datasets:ecls-k',
  sourceTitle: 'Early Childhood Longitudinal Study, Kindergarten Class of 2010-11 (ECLS-K:2011)',
  endpoint: resolveGeoApiEndpoint(),
  scope: 'all spaces; complete paginated title, focused-alias, and official-URL identifier searches',
  checkedAt: new Date().toISOString(),
  searches: await Promise.all([
    search('name', 'Early Childhood Longitudinal Study, Kindergarten Class of 2010-11 (ECLS-K:2011)'),
    search('name', 'Early Childhood Longitudinal Study'),
    search('name', 'ECLS-K:2011'),
    search('name', 'Kindergarten Class of 2010-11'),
    search('identifier', 'nces.ed.gov/ecls'),
  ]),
};
mkdirSync('data/education/discovery', { recursive: true });
writeFileSync('data/education/discovery/ecls-k-refresh.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ complete: report.searches.every(search => search.complete), matches: report.searches.map(search => ({ kind: search.kind, term: search.term, count: search.nodes.length, pages: search.pages.length })) }, null, 2));
