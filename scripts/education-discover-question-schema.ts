import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),searches:[]};
for(const term of ['Question','Questions','Related questions','Debate','Discussion']){
 const d:any=await gql('query($term:String!){entitiesConnection(first:30,filter:{name:{isInsensitive:$term}}){nodes{id name description spaceIds types{id name}relations(first:30){nodes{typeId toEntityId toEntity{name}}pageInfo{hasNextPage}}}pageInfo{hasNextPage endCursor}}}',{variables:{term}});
 if(d.entitiesConnection.pageInfo.hasNextPage)throw Error('Incomplete schema search');report.searches.push({term,...d.entitiesConnection});
}
writeFileSync('data/education/original-question-schema-discovery.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
