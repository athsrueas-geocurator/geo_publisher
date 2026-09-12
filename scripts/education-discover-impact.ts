import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const searches:any[]=[];
for(const term of ['DC IMPACT','Evidence from IMPACT','Incentives, Selection, and Teacher Performance','Thomas Dee','Thomas S. Dee','James Wyckoff']){
 const row:any={term,nodes:[],complete:false};let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}values(first:15){nodes{propertyId text}pageInfo{hasNextPage}}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});const p=d.entitiesConnection;row.nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage){row.complete=true;break;}if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 searches.push(row);writeFileSync('data/education/impact-discovery.json',JSON.stringify({checkedAt:new Date().toISOString(),scope:'All spaces and types; complete focused name/alias searches',searches},null,2)+'\n');
 console.log(JSON.stringify({term,nodes:row.nodes.map((n:any)=>({id:n.id,name:n.name,description:n.description}))}));
}
