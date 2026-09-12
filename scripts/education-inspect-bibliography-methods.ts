import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),articles:[],searches:[]},space='dac259bad48a11adf97fe36857d85206';
for(const id of ['d83f04c4e8594faeb657a226c26c134c','6a85813ac8734141b55affa06793661c']){
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){id name values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:40,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId entityId toEntity{name}}pageInfo{hasNextPage}}}}',{variables:{id,space}});if(!d.entity||d.entity.values.pageInfo.hasNextPage||d.entity.relations.pageInfo.hasNextPage)throw Error('Incomplete article read');report.articles.push(d.entity);
}
for(const term of ['Meta-analysis','Meta analysis','Comparative interrupted time series']){
 const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});const p=d.entitiesConnection;nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete method discovery');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 report.searches.push({term,nodes,complete:true});
}
writeFileSync('data/education/bibliography-method-inspection.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
