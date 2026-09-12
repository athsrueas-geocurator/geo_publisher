import { writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

// Read-only schema/membership evidence. Never reads the raw service/contact package.
const space = 'f24e3bbd26304474b7e0c2a0877f4bfe';
const page = '789068315729430884b1bff0dc9ac39b';
const report: any = { checkedAt: new Date().toISOString(), readOnly: true, readyToPublish: false, space, page, candidates: {}, properties: {}, datasets: [], blocks: [] };
async function pages(query: string, variables: Record<string, unknown>, pick: (data: any) => any) {
  const nodes: any[] = []; const seen = new Set<string>(); let after: string | null = null;
  for (let pageNo = 0; pageNo < 100; pageNo++) {
    const connection = pick(await gql(query, { variables: { ...variables, after } }));
    nodes.push(...connection.nodes);
    if (!connection.pageInfo.hasNextPage) return nodes;
    const next = connection.pageInfo.endCursor;
    if (!next || seen.has(next)) throw Error('Incomplete pagination: missing/repeated cursor');
    seen.add(next); after = next;
  }
  throw Error('Incomplete pagination: bounded page limit');
}
for (const name of ['Service', 'Program', 'Organization', 'Place', 'Location', 'Schedule', 'Event', 'Operated by', 'Location', 'Start time', 'End time', 'Timezone', 'Latitude', 'Longitude']) {
  if (report.candidates[name]) continue;
  report.candidates[name] = await pages(`query($name:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}`, { name }, d => d.entitiesConnection);
}
for (const id of ['8f151ba4de204e3c9cb499ddf96f48f1','beaba5cba67741a8b35377030613fc70','a99f9ce12ffa4dac8c61f6310d46064a','d66cd445e09a41809af46d86f083b41c','412ff593e9154012a43d4c27ec5c68b6','49c5d5e1679a4dbdbfd33f618f227c94']) {
  report.properties[id] = await gql('query($id:UUID!){entity(id:$id){id name spaceIds}property(id:$id){dataTypeName}}', { variables: { id } });
}
report.datasets = await pages(`query($space:UUID!,$after:Cursor){entitiesConnection(first:20,after:$after,spaceId:$space,typeId:"0c4babfb43893486af827341bbf32e09"){nodes{id name}pageInfo{hasNextPage endCursor}}}`, {space}, d=>d.entitiesConnection);
report.blocks = await pages(`query($page:UUID!,$space:UUID!,$after:Cursor){entity(id:$page){relations(first:20,after:$after,filter:{spaceId:{is:$space},typeId:{is:"beaba5cba67741a8b35377030613fc70"}}){nodes{id entityId toEntityId position}pageInfo{hasNextPage endCursor}}}}`, {page,space}, d=>d.entity.relations);
report.blockDetails = [];
for (const block of report.blocks) {
  const detail = await gql('query($id:UUID!){entity(id:$id){id types{id name}}}', {variables:{id:block.toEntityId}});
  const members = await pages(`query($page:UUID!,$space:UUID!,$after:Cursor){entity(id:$page){relations(first:20,after:$after,filter:{spaceId:{is:$space},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{id toEntityId position}pageInfo{hasNextPage endCursor}}}}`, {page:block.toEntityId,space},d=>d.entity.relations);
  report.blockDetails.push({detail,members});
}
report.schemaCandidates = {};
for (const nodes of Object.values(report.candidates) as any[][]) {
  for (const node of nodes) {
    if (!node.types.some((type:any)=>type.id==='808a04ceb21c4d888ad12e240613e5ca')) continue;
    report.schemaCandidates[node.id] = await gql('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){id name spaceIds}}', {variables:{id:node.id}});
  }
}
report.limitations = ['Exact-name candidates are not semantic reuse decisions or exhaustive alias discovery.', 'Dataset type census and space-page Blocks do not prove absence of every service or collection.', 'No verified offering IDs or operational field mappings exist in this report; the recommended eight-row intake is not a published pilot.'];
writeFileSync('data/indianapolis-outreach-directory/contract-discovery.json', JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checkedAt:report.checkedAt, datasets:report.datasets,blocks:report.blocks,candidates:Object.fromEntries(Object.entries(report.candidates).map(([name,nodes]:[string,any])=>[name,nodes.map((n:any)=>({id:n.id,name:n.name,types:n.types}))])),properties:report.properties},null,2));
