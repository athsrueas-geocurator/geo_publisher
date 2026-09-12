import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',registry=JSON.parse(readFileSync(`${root}/reading-first-registry.json`,'utf8'));
const report:any={checkedAt:new Date().toISOString(),scope:'Complete all-space incoming relations to the existing RFIS Article and Study, plus bounded semantic search of debate wording. Semantic ranking is recall, not exhaustive absence proof.',targets:[],semantic:[]};
for(const id of [registry.paper,registry.study]){
 const nodes:any[]=[];let after:string|null=null,pages=0;
 do{const data:any=await gql<any>('query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id}}){nodes{id fromEntityId spaceId typeId fromEntity{name description types{id}}}pageInfo{hasNextPage endCursor}}}',{variables:{id,after}});
 const p=data.relationsConnection;nodes.push(...p.nodes);pages++;
 if(p.pageInfo.hasNextPage&&(!p.pageInfo.endCursor||p.pageInfo.endCursor===after||pages>=100))throw new Error('Incomplete source-neighborhood search');after=p.pageInfo.hasNextPage?p.pageInfo.endCursor:null;
 }while(after);
 report.targets.push({id,complete:true,pages,nodes});
}
for(const query of ['Reading First decoding gains educational success','Reading First reading comprehension program failure']){
 try{const data=await gql<any>('query($query:String!){search(query:$query,first:12){id name description spaceIds types{id name}}}',{variables:{query}});report.semantic.push({query,bounded:true,data});}
 catch(error){report.semantic.push({query,failed:true,message:error instanceof Error?error.message:String(error)});}
}
writeFileSync(`${root}/reading-first-debate-discovery.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({targets:report.targets.map((t:any)=>({id:t.id,complete:t.complete,relations:t.nodes.length})),semantic:report.semantic},null,2));
