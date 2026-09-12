import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),scope:'Complete all-space name discovery for study-method properties and regression-discontinuity concepts; type and source-space definitions preserved',queries:[],propertyDefinitions:[]};
for(const term of ['Research methods','Study methods','Study design','Methods','Regression discontinuity']){
 const nodes:any[]=[];let after:string|null=null;const cursors=new Set<string>();
 do{const data:any=await gql<any>('query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{term,after}});const p=data.entitiesConnection;nodes.push(...p.nodes);if(p.pageInfo.hasNextPage){if(!p.pageInfo.endCursor||cursors.has(p.pageInfo.endCursor))throw new Error('Incomplete method search');cursors.add(p.pageInfo.endCursor);after=p.pageInfo.endCursor;}else after=null;}while(after);
 report.queries.push({term,complete:true,nodes});
 console.log(JSON.stringify({completedTerm:term,candidates:nodes.length}));
 writeFileSync('data/education/study-method-discovery-progress.json',JSON.stringify({...report,complete:false},null,2)+'\n');
}
const properties=new Set<string>(report.queries.flatMap((q:any)=>q.nodes.filter((n:any)=>n.types.some((t:any)=>t.id==='808a04ceb21c4d888ad12e240613e5ca')).map((n:any)=>n.id)));
for(const id of properties){const data:any=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){name description relations(first:30){nodes{typeId toEntityId spaceId toEntity{name description}}pageInfo{hasNextPage}}}}',{variables:{id}});if(data.entity?.relations.pageInfo.hasNextPage)throw new Error('Incomplete property definition');report.propertyDefinitions.push({id,...data});}
report.complete=true;
writeFileSync('data/education/study-method-discovery.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({queries:report.queries.map((q:any)=>({term:q.term,count:q.nodes.length})),properties:report.propertyDefinitions.map((p:any)=>({id:p.id,name:p.entity.name,description:p.entity.description,datatype:p.property?.dataTypeName})),regression:report.queries.find((q:any)=>q.term==='Regression discontinuity').nodes},null,2));
