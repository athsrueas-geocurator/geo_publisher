import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education';
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const saga=read('saga-registry'),context=read('saga-context-registry');
const report:any={checkedAt:new Date().toISOString(),scope:'All-space incoming relations to the existing final article and both Chicago trials; complete cursor pagination. Candidate evidence, not automatic identity approval.',targets:[]};
for(const id of [saga['paper/10.1257/aer.20210434'],context['study/1'],context['study/2']]){
 if(!id)throw new Error('Missing canonical source or trial ID');
 const nodes:any[]=[];let after:string|null=null,pages=0;const cursors=new Set<string>();
 do{
  const data:any=await gql<any>('query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id}}){nodes{id fromEntityId spaceId typeId fromEntity{name description types{id}}}pageInfo{hasNextPage endCursor}}}',{variables:{id,after}});
  const page=data.relationsConnection;nodes.push(...page.nodes);pages++;
  if(page.pageInfo.hasNextPage){
   const cursor=page.pageInfo.endCursor;
   if(!cursor||cursors.has(cursor)||pages>=200)throw new Error('Incomplete Saga identity search');
   cursors.add(cursor);after=cursor;
  }else after=null;
 }while(after);
 report.targets.push({id,complete:true,pages,nodes});
}
const candidates=new Map<string,any>();
for(const target of report.targets)for(const edge of target.nodes){
 const entry=candidates.get(edge.fromEntityId)??{id:edge.fromEntityId,name:edge.fromEntity?.name,description:edge.fromEntity?.description,types:edge.fromEntity?.types,evidence:[]};
 entry.evidence.push({target:target.id,spaceId:edge.spaceId,typeId:edge.typeId});candidates.set(entry.id,entry);
}
report.candidates=[...candidates.values()];
writeFileSync(`${root}/saga-pooled-link-discovery.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({targets:report.targets.map((t:any)=>({id:t.id,pages:t.pages,relations:t.nodes.length,complete:t.complete})),uniqueCandidates:candidates.size,followupCandidates:report.candidates.filter((c:any)=>/pool|graduat|11th|eleventh|later|second.year/i.test(`${c.name} ${c.description}`)).map((c:any)=>({id:c.id,name:c.name,description:c.description}))},null,2));
