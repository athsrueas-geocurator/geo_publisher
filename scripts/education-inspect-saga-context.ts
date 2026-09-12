import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='a19c345ab9866679b001d7d2138d88a1';
const report:any={checkedAt:new Date().toISOString(),types:[],properties:[],aliases:[]};
for(const id of ['2f3e568ca8cb4d6ea130829c3012648f','9547f4fb78744de0a9a9fdd7b4c01c0c','3ef269bc5f114691abc02dcbf398fd63']){
 const schema=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){name description types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}relationsConnection(first:30,filter:{fromEntityId:{is:$id},spaceId:{is:$space}}){nodes{typeId toEntityId toEntity{name}}pageInfo{hasNextPage}}entitiesConnection(typeId:$id,first:5){nodes{id name description}pageInfo{hasNextPage}}}',{variables:{id,space:root}});
 report.types.push({id,...schema});
}
for(const id of ['261fad421cc744938acbaa4a4c74220c','7a1f6d017895206e84e1988c0c74621e','8e46e3eff9dea2b55d32a5ca7de61938']){
 const state=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){name description}relationsConnection(first:30,filter:{fromEntityId:{is:$id}}){nodes{typeId type{name}toEntityId toEntity{name}spaceId}pageInfo{hasNextPage}}}',{variables:{id}});report.properties.push({id,...state});
}
for(const text of ['Saga Education','SAGA Innovations']){
 const probe:any={text,pages:[],nodes:[],complete:false};let after:string|null=null;
 while(true){
  const data:any=await gql<any>('query($text:String!,$after:Cursor){valuesConnection(first:5,after:$after,filter:{text:{includesInsensitive:$text}}){nodes{entity{id name}property{id name}spaceId text}pageInfo{hasNextPage endCursor}}}',{variables:{text,after}}),page:any=data.valuesConnection;
  probe.pages.push(page.pageInfo);probe.nodes.push(...page.nodes);
  if(!page.pageInfo.hasNextPage){probe.complete=true;break;}
  if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||probe.pages.length>=40)throw new Error('Incomplete alias search');after=page.pageInfo.endCursor;
 }
 report.aliases.push(probe);
}
report.providerExamples=await gql<any>('query{relationsConnection(first:5,filter:{typeId:{is:"261fad421cc744938acbaa4a4c74220c"}}){nodes{fromEntity{id name types{id name}}toEntity{id name types{id name}}spaceId}pageInfo{hasNextPage}}}');
writeFileSync('data/education/saga-context-inspection.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({types:report.types.map((t:any)=>({id:t.id,name:t.entity.name,rootSchemaComplete:!t.relationsConnection.pageInfo.hasNextPage})),providerExamples:report.providerExamples,aliases:report.aliases.map((p:any)=>({text:p.text,complete:p.complete,nodes:p.nodes.map((n:any)=>({entity:n.entity,property:n.property,spaceId:n.spaceId}))}))}));
