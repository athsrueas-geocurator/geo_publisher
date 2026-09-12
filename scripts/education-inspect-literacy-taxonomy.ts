import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const ids={focusAreas:'02d0b9117c4f119d4b986ded266d7028',topics:'806d52bc27e94c9193c057978b093351',literacyEducation:'5a86d2f3657b4b5baabef07a3393e408',coaches:'06d0bc4860de4838a222c240a46fc8b0',phonics:'09d90bfac91545de8b218e03c026338f',comprehension:'5c028b0a8a484ee9ae29e07028a1e7d1'};
const report:any={checkedAt:new Date().toISOString(),scope:'Cross-space candidate identity/schema inspection; backlinks limited to five examples, not exhaustive',entities:{}};
for(const [key,id] of Object.entries(ids)){
 const data=await gql<any>('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}values(first:20){nodes{propertyId text spaceId}pageInfo{hasNextPage}}relations(first:30){nodes{typeId toEntityId toEntity{name description}spaceId}pageInfo{hasNextPage}}backlinks(first:5){nodes{type{name}fromEntity{id name}spaceId}pageInfo{hasNextPage}}}property(id:$id){dataTypeName}}',{variables:{id}});
 report.entities[key]=data;writeFileSync('data/education/literacy-taxonomy-inspection.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({key,...data}));
}
