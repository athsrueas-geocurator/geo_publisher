import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';

// Resolve datatype and actual use before reusing similarly named properties.
const properties:Record<string,string>={
  observedProportion:'73b35a4ce05f45908118a089d9995bae',
  resultValueNumeric:'3163ea823b4c9ebf0d26ce3a20eb855f',
  measurement:'88d020ba7ff94d24b412a6e8d102a941',
  measurementUnit:'5c67ae17c84ce783f3b8cd8ffa063661',
  pValueString:'ba5f8fe9d1cd9a6094338d2f37b74a5e',
  pValueEvidence:'dbad304fc83a13a2f84b6260501a562c',
  pValueNumeric:'f6e654253ec0c1decbe6a6058f003868',
  confidenceIntervalEvidence:'d21c736598fc58e7d095633be0c1b86b',
  confidenceIntervalMusic:'1773a3b16a3e0bee4ca92124efeefcb2',
  studyDesignRegistry:'8e46e3eff9dea2b55d32a5ca7de61938',
};
const path='data/education/reading-first-property-samples.json';
const previous=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
const report:any={checkedAt:new Date().toISOString(),scope:'All-space schema reads and up to five actual uses per candidate; usage sampling is not exhaustive',properties:previous.properties??{}};
const selected=process.argv.slice(2);
for(const [key,id] of Object.entries(properties).filter(([key])=>!selected.length||selected.includes(key))){
  try{
    const schema=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){id name spaceIds values(first:30){nodes{propertyId text spaceId}pageInfo{hasNextPage}}relations(first:30){nodes{typeId toEntityId spaceId}pageInfo{hasNextPage}}}}',{variables:{id}});
    report.properties[key]={id,checkedAt:new Date().toISOString(),schema,usageStatus:'pending'};
    writeFileSync(path,JSON.stringify(report,null,2)+'\n');
    const uses=await gql<any>('query($id:UUID!){valuesConnection(first:5,filter:{propertyId:{is:$id}}){nodes{entity{id name}text decimal float integer spaceId}pageInfo{hasNextPage}}}',{variables:{id}});
    report.properties[key]={id,checkedAt:new Date().toISOString(),schema,uses};
    console.log(JSON.stringify({key,datatype:schema.property?.dataTypeName,uses}));
  }catch(error:any){
    report.properties[key]={...report.properties[key],id,checkedAt:new Date().toISOString(),error:error.message};
    console.log(JSON.stringify({key,error:error.message}));
  }
  writeFileSync(path,JSON.stringify(report,null,2)+'\n');
}
