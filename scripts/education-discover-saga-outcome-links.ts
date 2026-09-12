import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const read=(n:string)=>JSON.parse(readFileSync(`data/education/${n}.json`,'utf8'));
const saga=read('saga-registry'),context=read('saga-context-registry');
const report:any={checkedAt:new Date().toISOString(),scope:'Incoming relations across all spaces and relation types to the verified final article and both trials',targets:[]};
for(const id of [saga['paper/10.1257/aer.20210434'],context['study/1'],context['study/2']]){
 const nodes:any[]=[];let after:string|null=null;let complete=false;
 do{
  const data:any=await gql<any>('query($id:UUID!,$after:Cursor){relationsConnection(first:10,after:$after,filter:{toEntityId:{is:$id}}){nodes{id fromEntityId fromEntity{name} typeId spaceId}pageInfo{hasNextPage endCursor}}}',{variables:{id,after}});
  const page:any=data.relationsConnection;nodes.push(...page.nodes);complete=!page.pageInfo.hasNextPage;after=page.pageInfo.endCursor;
 }while(!complete);
 report.targets.push({id,complete,nodes});
}
writeFileSync('data/education/saga-outcome-link-discovery.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
