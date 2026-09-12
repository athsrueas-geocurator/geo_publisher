import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const properties={perspectives:'8f637e6a629743c08eb9c49e971b2b54',populationStudied:'aa77da401d9b4ca3b250fd24c9b8701f',sexApplicability:'9c5468a2c7eb27fb2da11cf2e00b1289',prevalence:'5fdb053e145566dc7fbb23c184ae9752',standardError:'cc28953bd89e406096c9627021f4713d',outcomeMeasureRegistry:'0e1320cbf9b3b4f5fe066780d1803b13',outcomeMeasureEvidence:'7e21c59657cbc9bc84e1c579e3eb9286',targetOutcomes:'6b57bd23b7324ae0a1671658768df9ad'};
const reportPath='data/education/perry-property-samples.json';
const previous=existsSync(reportPath)?JSON.parse(readFileSync(reportPath,'utf8')):{};
const report:any={checkedAt:new Date().toISOString(),scope:'Cross-space property schema and up to five actual uses; samples are not an exhaustive usage inventory',properties:previous.properties??{}};
for(const [key,id] of Object.entries(properties).filter(([key])=>process.argv.length<=2||process.argv.slice(2).includes(key))){
  try{
    const schema=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){id name spaceIds values(first:40){nodes{propertyId text spaceId}pageInfo{hasNextPage}}relations(first:40){nodes{typeId toEntityId spaceId}pageInfo{hasNextPage}}}}',{variables:{id}});
    report.properties[key]={id,checkedAt:new Date().toISOString(),schema,usageStatus:'pending'};
    writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
    const relation=schema.property?.dataTypeName==='Relation';
    const uses=await gql<any>(relation
      ? 'query($id:UUID!){relationsConnection(first:5,filter:{typeId:{is:$id}}){nodes{fromEntity{id name}toEntity{id name description types{id name}}spaceId}pageInfo{hasNextPage}}}'
      : 'query($id:UUID!){valuesConnection(first:5,filter:{propertyId:{is:$id}}){nodes{entity{id name}text decimal integer spaceId}pageInfo{hasNextPage}}}',{variables:{id}});
    report.properties[key]={id,checkedAt:new Date().toISOString(),schema,uses};
    console.log(JSON.stringify({key,...report.properties[key]}));
  }catch(error:any){report.properties[key]={...report.properties[key],id,checkedAt:new Date().toISOString(),error:error.message};console.log(JSON.stringify({key,error:error.message}));}
  writeFileSync('data/education/perry-property-samples.json',JSON.stringify(report,null,2)+'\n');
}
