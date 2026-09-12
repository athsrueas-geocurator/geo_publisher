import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const terms=['Reading First','tutoring','school spending','school funding','intergenerational poverty'];
const report:any={checkedAt:new Date().toISOString(),scope:'All-space, all-type name substring discovery for proposed education debate families; candidates require semantic adjudication, not automatic reuse or creation',searches:[]};
for(const term of terms){
 const nodes:any[]=[];let after:string|null=null,pages=0;
 do{
  const data:any=await gql<any>('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});
  const page=data.entitiesConnection;nodes.push(...page.nodes);pages++;
  if(page.pageInfo.hasNextPage&&(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||pages>=100))throw new Error(`Incomplete search ${term}`);
  after=page.pageInfo.hasNextPage?page.pageInfo.endCursor:null;
 }while(after);
 report.searches.push({term,complete:true,pages,nodes});
 writeFileSync('data/education/debate-proposition-discovery.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({term,pages,candidates:nodes.length,externalClaims:nodes.filter(e=>e.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!e.spaceIds.includes('dac259bad48a11adf97fe36857d85206')).map(e=>({id:e.id,name:e.name,spaces:e.spaceIds}))}));
}
