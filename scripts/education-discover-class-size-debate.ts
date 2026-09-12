import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const searches:any[]=[];
for(const term of ['class size','class-size','Krueger','Hanushek']){
 const row:any={term,nodes:[],complete:false};let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});const p=d.entitiesConnection;row.nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage){row.complete=true;break;}if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete pagination');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 searches.push(row);writeFileSync('data/education/class-size-debate-discovery.json',JSON.stringify({checkedAt:new Date().toISOString(),scope:'All spaces and types; complete name/alias searches, subject to identity adjudication',searches},null,2)+'\n');
 console.log(JSON.stringify({term,count:row.nodes.length,complete:row.complete}));
}
const neighborhoods:any[]=[];
for(const id of ['d70f7e00c8fd4fb2b6a056df6b844b1f','efdefdaf3fbd4d02bd44228882c09359']){
 const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql('query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id}}){nodes{id fromEntityId spaceId typeId fromEntity{name description types{id name}}}pageInfo{hasNextPage endCursor}}}',{variables:{id,after}});const p=d.relationsConnection;nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete neighborhood');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 neighborhoods.push({id,complete:true,nodes});
}
const semantic:any[]=[];
for(const query of ['class size reduction economic returns','Hanushek Krueger study weighting','smaller classes teacher quality']){
 semantic.push({query,bounded:true,data:await gql('query($query:String!){search(query:$query,first:12){id name description spaceIds types{id name}}}',{variables:{query}})});
}
writeFileSync('data/education/class-size-debate-neighborhoods.json',JSON.stringify({checkedAt:new Date().toISOString(),neighborhoods,semantic},null,2)+'\n');
console.log(JSON.stringify({neighborhoods:neighborhoods.map(n=>({id:n.id,count:n.nodes.length})),semantic:semantic.map(s=>({query:s.query,data:s.data}))}));
