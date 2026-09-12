import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',inventory=JSON.parse(readFileSync(`${root}/catalog-collection-inventory.json`,'utf8')),registry=JSON.parse(readFileSync(`${root}/dataset-catalog-registry.json`,'utf8')),space=inventory.space,checks:string[]=[];
function check(ok:unknown,message:string){if(!ok)throw Error(message);checks.push(message);}
const parent:any=await gql('query($space:UUID!){entity(id:"16a032fb91794444859a6c1a44a32955"){relations(first:10,filter:{spaceId:{is:$space},typeId:{is:"beaba5cba67741a8b35377030613fc70"}}){nodes{toEntityId}pageInfo{hasNextPage}}}}',{variables:{space}});check(!parent.entity.relations.pageInfo.hasNextPage&&parent.entity.relations.nodes.some((r:any)=>r.toEntityId===registry.block),'Catalog reachable from space page');
const query=readFileSync(`${root}/dataset-catalog-members-query.graphql`,'utf8'),members:any[]=[];let after:string|null=null,pages=0;const seen=new Set<string>();
do{const d:any=await gql(query,{variables:{block:registry.block,space,after}}),p=d.entity.relations;pages++;members.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;check(p.pageInfo.endCursor&&!seen.has(p.pageInfo.endCursor),'Catalog cursor advances');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
members.sort((a,b)=>a.position<b.position?-1:a.position>b.position?1:0);
const expected=inventory.datasets.map((r:any)=>r.fromEntity).sort((a:any,b:any)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'}));check(members.length===expected.length&&new Set(members.map(m=>m.toEntityId)).size===expected.length,'Complete unique inventory membership');
for(const [i,e] of expected.entries()){
 check(members[i].toEntityId===e.id,`Alphabetical position ${e.name}`);
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:15,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:10,filter:{spaceId:{is:$space},typeId:{is:"8f151ba4de204e3c9cb499ddf96f48f1"}}){nodes{toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:e.id,space}});
 check(d.entity&&!d.entity.values.pageInfo.hasNextPage&&!d.entity.relations.pageInfo.hasNextPage,`Complete scoped summary ${e.name}`);check(d.entity.values.nodes.some((v:any)=>v.propertyId==='a126ca530c8e48d5b88882c734c38935'&&v.text===e.name),`Existing Name ${e.name}`);check(d.entity.relations.nodes.some((r:any)=>r.toEntityId==='0c4babfb43893486af827341bbf32e09'),`Dataset classification ${e.name}`);
}
writeFileSync(`${root}/dataset-catalog-query-verification.json`,JSON.stringify({checkedAt:new Date().toISOString(),passed:true,space,block:registry.block,pages,members:members.length,checks,scope:'Space-page reachability, ordered unique catalog membership and scoped Dataset summaries; not certification of every member field or frontend rendering'},null,2)+'\n');console.log(JSON.stringify({passed:true,pages,members:members.length,checks:checks.length}));
