import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const query=readFileSync(`${root}/education-debate-node-query.graphql`,'utf8'),ids=read('reading-first-debate-registry'),rf=read('reading-first-registry'),saga=read('saga-registry'),source=read('reading-first-extraction');
const space='dac259bad48a11adf97fe36857d85206';
const p={related:'504e5776788844f6a77dba3ee811d8f0',support:'1dc6a843458848198e7a6e672268f811',oppose:'4e6ec5d14292498a84e5f607ca1a08ce',source:'49c5d5e1679a4dbdbfd33f618f227c94',factual:'da4a6c1f9d4446f9832ff3b49a4400ef'};
const nodes=new Map<string,any>(),queue=[ids['decoding-sufficient']],checks:any[]=[];
function check(ok:unknown,label:string){checks.push({label,pass:!!ok});if(!ok)throw new Error(label);}
while(queue.length){
 const id=queue.shift()!;if(nodes.has(id))continue;
 let after:string|null=null,pages=0;const relations:any[]=[];let values:any[]=[];
 do{
  const data:any=await gql(query,{variables:{id,space,after}});check(data.entity&&!data.entity.values.pageInfo.hasNextPage,`Complete bounded values ${id}`);
  values=data.entity.values.nodes;relations.push(...data.relationsConnection.nodes);pages++;
  const page=data.relationsConnection.pageInfo;check(!page.hasNextPage||(page.endCursor&&page.endCursor!==after&&pages<30),`Advancing relation cursor ${id}/${pages}`);after=page.hasNextPage?page.endCursor:null;
 }while(after);
 nodes.set(id,{id,values,relations,pages});
 for(const r of relations){check(r.spaceId===space,`Relation provenance ${r.id}`);if(r.typeId!==p.source&&!nodes.has(r.toEntityId))queue.push(r.toEntityId);}
 check(nodes.size<=20,'Bounded traversal with shared-node deduplication');
}
check(nodes.size===6,'Exactly two propositions and four distinct evidence Claims');
const linked=(key:string,type:string)=>nodes.get(ids[key]).relations.filter((r:any)=>r.typeId===type).map((r:any)=>r.toEntityId).sort();
const same=(a:string[],b:string[])=>JSON.stringify(a)===JSON.stringify([...b].sort());
check(same(linked('decoding-sufficient',p.support),[ids.decoding]),'Favorable proposition has precisely its decoding support');
check(same(linked('comprehension-required',p.support),[ids['comprehension-1'],ids['comprehension-2'],ids['comprehension-3']]),'Stricter proposition has precisely three comprehension supports');
for(const [a,b] of [['decoding-sufficient','comprehension-required'],['comprehension-required','decoding-sufficient']]){
 check(same(linked(a!,p.oppose),[ids[b!]]),`Mutual opposition ${a}`);
 check(linked(a!,p.related).length===5,`Five related neighbors ${a}`);
}
for(const [key,nodeId] of Object.entries(ids)){
 const node=nodes.get(nodeId as string),value=(property:string)=>node.values.find((v:any)=>v.propertyId===property);
 const factual=!['decoding-sufficient','comprehension-required'].includes(key);
 check(value(p.factual)?.boolean===factual,`Correct response kind ${key}`);
 check(same(linked(key,p.source),[rf.paper]),`Original report citation ${key}`);
 if(factual){
  check(linked(key,p.support).length===0&&linked(key,p.oppose).length===0,`No invented reverse evidence implication ${key}`);
  const contrast=key==='decoding'?'toswrf-decoding-g1':`sat10-score-g${key.slice(-1)}`;
  const expected=source.records.find((r:any)=>r.key===contrast).native;
  for(const [property,want] of [[saga['property/estimate'],expected.value],[saga['property/se'],expected.standardError],[rf['property/ciLower'],expected.confidenceInterval.lower],[rf['property/ciUpper'],expected.confidenceInterval.upper]])check(Number(value(property)?.decimal)===Number(want),`Exact source numeric ${key}/${property}`);
 }
}
const report={checkedAt:new Date().toISOString(),passed:true,scope:'Complete six-node traversal through Related/support/opposition, original citations, factual flags and exact source estimates/SE/CI; forced two-edge cursor pages exercise pagination. Does not verify frontend layout or the entire migration.',queryPath:`${root}/education-debate-node-query.graphql`,nodes:[...nodes.values()],checks};
writeFileSync(`${root}/education-debate-query-verification.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,nodes:nodes.size,checks:checks.length,pages:[...nodes.values()].map(n=>n.pages)}));
