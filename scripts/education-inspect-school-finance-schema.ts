import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const ids={populationProperty:'aa77da401d9b4ca3b250fd24c9b8701f',perryPopulation:'0f3db3824f9b43209048665c798bebfb',effect:'e500e2585a964d2c9df4a47b199616c3',se:'cc28953bd89e406096c9627021f4713d',populationSummary:'7a1f6d017895206e84e1988c0c74621e',populationStudiedAlternative:'234b4043dd564920961042f1c37bbe1f',inPopulation:'2f20b60b8bd287a2ba2e1e63b51e4f7d',appliesToPopulation:'e004f7846df83a54965fc71103434522'};
const report:any={checkedAt:new Date().toISOString(),entities:{}};
for(const [key,id] of Object.entries(ids)){
 const data=await gql<any>('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}relations(first:30){nodes{typeId toEntityId toEntity{name description}spaceId}pageInfo{hasNextPage}}}property(id:$id){dataTypeName}}',{variables:{id}});
 report.entities[key]=data;console.log(JSON.stringify({key,...data}));
}
writeFileSync('data/education/school-finance-jjp-schema.json',JSON.stringify(report,null,2)+'\n');
