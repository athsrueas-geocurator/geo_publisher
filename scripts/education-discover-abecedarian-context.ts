import{writeFileSync}from'node:fs';
import{geoGraphqlRequest as gql}from'../src/geo-api-client';
const path='data/education/abecedarian-context-discovery.json';
const report:any={checkedAt:new Date().toISOString(),complete:false,queries:[]};
for(const term of ['Abecedarian','Project CARE','Responsive Education','Chapel Hill','Duncan Ermini Leaf','Maria Jose Prados','María José Prados','Jorge Luis García','Jorge Luis Garcia']){
 const row:any={term,complete:false,nodes:[]};report.queries.push(row);let after:string|null=null;const seen=new Set<string>();
 do{const r:any=await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});const page=r.entitiesConnection;row.nodes.push(...page.nodes);if(page.pageInfo.hasNextPage){if(!page.pageInfo.endCursor||seen.has(page.pageInfo.endCursor))throw Error('Incomplete pagination');after=page.pageInfo.endCursor;seen.add(after!);}else{after=null;row.complete=true;}writeFileSync(path,JSON.stringify(report,null,2)+'\n');}while(after);
 console.log(JSON.stringify({term,count:row.nodes.length,complete:row.complete}));
}
report.complete=true;writeFileSync(path,JSON.stringify(report,null,2)+'\n');
