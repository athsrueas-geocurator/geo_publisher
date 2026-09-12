import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education';
const read=(p:string)=>JSON.parse(readFileSync(`${root}/${p}.json`,'utf8'));
const output=`${root}/original-link-discovery.json`;
const report:any={checkedAt:new Date().toISOString(),scope:'All-space exact original names and URL identifiers; candidates require semantic review; zero matches are not creation clearance',initiatives:[],sources:[]};
async function search(kind:string,term:string){
 const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{
  const query=kind==='name'
   ? 'query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}'
   : 'query($term:String!,$after:Cursor){valuesConnection(first:20,after:$after,filter:{propertyId:{is:"412ff593e9154012a43d4c27ec5c68b6"},text:{is:$term}}){nodes{propertyId text spaceId entity{id name description types{id name}}}pageInfo{hasNextPage endCursor}}}';
  const data:any=await gql(query,{variables:{term,after}});const page=data[kind==='name'?'entitiesConnection':'valuesConnection'];nodes.push(...page.nodes);
  if(!page.pageInfo.hasNextPage)break;
  if(!page.pageInfo.endCursor||seen.has(page.pageInfo.endCursor))throw Error('Pagination failed');
  after=page.pageInfo.endCursor;seen.add(after!);
 }while(true);
 return nodes;
}
for(const [collection,file] of [['initiatives','initiatives'],['sources','sources']]){
 for(const row of read(`source/content/${file}`)){
  const term=collection==='initiatives'?row.name:row.url;
  try{report[collection!].push({key:row.id,term,complete:true,nodes:await search(collection==='initiatives'?'name':'url',term)});}
  catch(error){report[collection!].push({key:row.id,term,complete:false,error:String(error)});}
  writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 }
 console.log(JSON.stringify({collection,rows:report[collection!].length,matches:report[collection!].filter((r:any)=>r.nodes?.length).length,errors:report[collection!].filter((r:any)=>!r.complete).length}));
}
