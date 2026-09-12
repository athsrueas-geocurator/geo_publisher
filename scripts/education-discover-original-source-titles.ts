import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education';const source=JSON.parse(readFileSync(`${root}/source/content/sources.json`,'utf8'));const rows:any[]=[];
for(const r of source){
 const row:any={key:r.id,title:r.title,nodes:[],complete:false};let after:string|null=null;const seen=new Set<string>();
 try{do{
  const d:any=await gql('query($name:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{name:r.title,after}});
  const p=d.entitiesConnection;row.nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage){row.complete=true;break;}
  if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);
 }while(true);}catch(e){row.error=String(e);}
 rows.push(row);writeFileSync(`${root}/original-source-title-discovery.json`,JSON.stringify({checkedAt:new Date().toISOString(),scope:'Exact titles across all spaces and types; candidates only',rows},null,2)+'\n');
}
console.log(JSON.stringify({rows:rows.length,matches:rows.filter(r=>r.nodes.length).length,errors:rows.filter(r=>!r.complete).length}));
