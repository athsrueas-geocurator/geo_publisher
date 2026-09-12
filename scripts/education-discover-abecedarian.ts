import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const path='data/education/abecedarian-discovery.json';
const report:any={checkedAt:new Date().toISOString(),complete:false,scope:'All spaces and types; name aliases only, identifier matching and semantic adjudication still required',queries:[]};
for(const term of ['Abecedarian','Carolina Approach to Responsive Education','Quantifying the Life','Prototypical Early Childhood','Influential Early-Childhood']){
 const row:any={term,complete:false,nodes:[]};report.queries.push(row);
 let after:string|null=null;const cursors=new Set<string>();
 do{
  const data:any=await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});
  const page=data.entitiesConnection;row.nodes.push(...page.nodes);
  if(page.pageInfo.hasNextPage){if(!page.pageInfo.endCursor||cursors.has(page.pageInfo.endCursor))throw new Error('Incomplete pagination');after=page.pageInfo.endCursor;cursors.add(after!);}else{after=null;row.complete=true;}
  writeFileSync(path,JSON.stringify(report,null,2)+'\n');
 }while(after);
 console.log(JSON.stringify({term,count:row.nodes.length,complete:row.complete}));
}
report.complete=true;writeFileSync(path,JSON.stringify(report,null,2)+'\n');
