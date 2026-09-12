import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),scope:'Live program-type candidate schemas with bounded instance samples; not exhaustive instance discovery',candidates:[]};
report.typeSearches=[];
for(const term of ['program','initiative','intervention','implementation']){
 const search:any={term,complete:false,nodes:[],pages:[]};let after:string|null=null;
 while(true){
  const data:any=await gql<any>('query($term:String!,$after:Cursor){entitiesConnection(typeId:"e7d737c536764c609fa16aa64a8c90ad",first:5,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});
  const page=data.entitiesConnection;search.nodes.push(...page.nodes);search.pages.push(page.pageInfo);
  if(!page.pageInfo.hasNextPage){search.complete=true;break;}
  if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||search.pages.length>=40)throw new Error('Incomplete type discovery');after=page.pageInfo.endCursor;
 }
 report.typeSearches.push(search);writeFileSync('data/education/program-schema-candidates.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({typeSearch:term,complete:search.complete,nodes:search.nodes}));
}
for(const id of ['9ba04d040e6bed81dc2ebd593e8cd0e7','d272f19cef87485fb83e26fb68957395','b9a456d44ee44f418f9cca322871cafa','484a18c5030a499cb0f2ef588ff16d50','7f237bddd95f4d3f8686f52a5dd29386','26413b7ddd4a479e9b59e2c822d1b2eb']){
 const schema=await gql<any>('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}relations(first:30){nodes{typeId type{name}toEntityId toEntity{name description}spaceId}pageInfo{hasNextPage}}}}',{variables:{id}});
 const instances=await gql<any>('query($id:UUID!){entitiesConnection(typeId:$id,first:5){nodes{id name description spaceIds}pageInfo{hasNextPage}}}',{variables:{id}});
 report.candidates.push({id,schema,instances});
 writeFileSync('data/education/program-schema-candidates.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({id,name:schema.entity?.name,schemaComplete:!schema.entity?.relations.pageInfo.hasNextPage,instanceSample:instances.entitiesConnection.nodes.length}));
}
