import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const path='data/education/population-schema.json';
const ids={eligibleDemographics:'07546da1a8a04c0d8e0dac5351dcb25b',administeredBy:'d1c6034425684b4caaf2570bee562802',grades:'98c0849922164db0822b5a78444c17b3',children:'561872867e1b4b80a5f37ddeb27570b5',demographic:'3c60617f2cde43fb8bf386a9a68d3ee9'};
const report:any={checkedAt:new Date().toISOString(),scope:'Live schemas and bounded relation samples; samples do not establish exhaustive usage',entities:{},relations:{}};
for(const [key,id] of Object.entries(ids)){
 const data=await gql<any>('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}relations(first:30){nodes{typeId type{name}toEntityId toEntity{name description}spaceId}pageInfo{hasNextPage}}}}',{variables:{id}});
 report.entities[key]=data.entity;writeFileSync(path,JSON.stringify(report,null,2)+'\n');
 if(['eligibleDemographics','administeredBy','grades'].includes(key)){
  const type=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});
  const sample=await gql<any>('query($id:UUID!){relationsConnection(first:5,filter:{typeId:{is:$id}}){nodes{fromEntity{id name}toEntity{id name}spaceId}pageInfo{hasNextPage}}}',{variables:{id}});
  report.relations[key]={datatype:type.property?.dataTypeName,sample};writeFileSync(path,JSON.stringify(report,null,2)+'\n');
 }
 console.log(JSON.stringify({key,entity:data.entity,relation:report.relations[key]}));
}
