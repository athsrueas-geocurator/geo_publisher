import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),scope:'All-space/all-type exact statistic-property names plus complete bound-name discovery; definitions and datatypes require review before reuse',queries:[],properties:[]};
for(const name of ['Statistic value','Estimate value','Bound value','Statistic type','Estimate type','Estimand','Upper bound','Lower bound','FDR q-value','Adjusted p-value']){
 const data:any=await gql<any>('query($name:String!){entitiesConnection(first:20,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage}}}',{variables:{name}});
 if(data.entitiesConnection.pageInfo.hasNextPage)throw new Error(`Incomplete exact search ${name}`);
 report.queries.push({name,complete:true,nodes:data.entitiesConnection.nodes});
}
let after:string|null=null;const nodes:any[]=[];const cursors=new Set<string>();
do{const data:any=await gql<any>('query($after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:"bound"}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{after}});const p=data.entitiesConnection;nodes.push(...p.nodes);if(p.pageInfo.hasNextPage){if(!p.pageInfo.endCursor||cursors.has(p.pageInfo.endCursor))throw new Error('Incomplete bound search');cursors.add(p.pageInfo.endCursor);after=p.pageInfo.endCursor;}else after=null;}while(after);
report.queries.push({contains:'bound',complete:true,nodes});
const ids=new Set<string>(report.queries.flatMap((q:any)=>q.nodes.filter((n:any)=>n.types.some((t:any)=>t.id==='808a04ceb21c4d888ad12e240613e5ca')).map((n:any)=>n.id)));
for(const id of ids){const data:any=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){name description values(first:30){nodes{propertyId spaceId text}pageInfo{hasNextPage}}}}',{variables:{id}});if(data.entity?.values.pageInfo.hasNextPage)throw new Error(`Incomplete property definition ${id}`);report.properties.push({id,...data});}
writeFileSync('data/education/statistic-property-discovery.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({queries:report.queries.map((q:any)=>({name:q.name??q.contains,count:q.nodes.length,complete:q.complete})),properties:report.properties},null,2));
