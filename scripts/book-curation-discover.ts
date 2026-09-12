import {mkdirSync,writeFileSync} from 'node:fs';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
mkdirSync('data/book-curation',{recursive:true});
const report:any={checkedAt:new Date().toISOString(),scope:'Read-only personal/profile and Books identity/schema inspection',sdk:{pageType:SystemIds.PAGE_TYPE},entities:{}};
report.spaceSchema=await gql<any>('{__type(name:"Space"){fields{name type{kind name ofType{name}}}}}');
for(const id of ['d00460c203779d21d96fcfc6102d7a72','0477636ace64280fc43a9f440a502291']){
  report[`space/${id}`]=await gql<any>('query($id:UUID!){space(id:$id){id type topic{id name}}}',{variables:{id}});
}
for(const [key,id] of Object.entries({profile:'a525e625551246c58965df8e286b0414',zen:'d0f15b4c079f45ef89651a3f366ce2a4',postman:'0373f5e944d94ebf8c74ce87c01623eb',pirsig:'3d864e0a87f744009b74abd56e67e253',bookType:'8864304115334498b8ea6c1ae833628e',pageType:SystemIds.PAGE_TYPE,authors:'91a9e2f6e51a48f7997661de8561b690'})){
  const r=await gql<any>('query($id:UUID!){entity(id:$id){id name spaceIds types{id name}values(first:30){nodes{propertyId text spaceId}pageInfo{hasNextPage}}relations(first:30){nodes{id entityId typeId type{name}toEntityId toEntity{name}spaceId position}pageInfo{hasNextPage}}}}',{variables:{id}});
  report.entities[key]=r.entity;
  writeFileSync('data/book-curation/discovery.json',JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report,null,2));
