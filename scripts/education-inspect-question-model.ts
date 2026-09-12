import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),definitions:[],examples:[],complete:false};
for(const id of ['4318a1d2c441455cb76544049c45e6cf','73609ae8644c4463a50a90a3ee585746','49c5d5e1679a4dbdbfd33f618f227c94']){
 const d:any=await gql('query($id:UUID!){entity(id:$id){id name spaceIds values(first:30){nodes{propertyId text spaceId}pageInfo{hasNextPage}}relations(first:30){nodes{typeId toEntityId spaceId toEntity{name}}pageInfo{hasNextPage}}}property(id:$id){dataTypeName}}',{variables:{id}});
 if(d.entity.values.pageInfo.hasNextPage||d.entity.relations.pageInfo.hasNextPage)throw Error('Definition truncated');report.definitions.push(d);
}
let after:string|null=null;const seen=new Set<string>();
do{
 const d:any=await gql('query($after:Cursor){relationsConnection(first:20,after:$after,filter:{typeId:{is:"8f151ba4de204e3c9cb499ddf96f48f1"},toEntityId:{is:"4318a1d2c441455cb76544049c45e6cf"}}){nodes{spaceId fromEntity{id name description spaceIds}}pageInfo{hasNextPage endCursor}}}',{variables:{after}});
 const p=d.relationsConnection;report.examples.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete Question census');after=p.pageInfo.endCursor;seen.add(after!);
}while(true);
report.complete=true;writeFileSync('data/education/original-question-model-inspection.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
