import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education';
const source=JSON.parse(readFileSync(`${root}/source/content/initiatives.json`,'utf8'));
const verified=JSON.parse(readFileSync(`${root}/original-link-state.json`,'utf8')).rows.map((r:any)=>r.key);
const terms=[...new Set<string>(source.filter((r:any)=>verified.includes(r.id)).map((r:any)=>r.category))];
const report:any=existsSync(`${root}/original-category-discovery.json`)?JSON.parse(readFileSync(`${root}/original-category-discovery.json`,'utf8')):{checkedAt:new Date().toISOString(),scope:'All spaces, all types; original category names and component aliases; candidates only',rows:[]};
for(const term of terms){
 if(report.rows.some((r:any)=>r.term===term))continue;
 const searches:any[]=[];
 for(const alias of [...new Set([term,...term.split('/').filter(s=>s.length>4)])]){
  const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
  do{
   const result:any=await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term:alias,after}});
   const p=result.entitiesConnection;nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;
   if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);
  }while(true);
  searches.push({alias,complete:true,nodes});
 }
 report.rows.push({term,searches});writeFileSync(`${root}/original-category-discovery.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({term,matches:searches.map(s=>({alias:s.alias,count:s.nodes.length}))}));
}
