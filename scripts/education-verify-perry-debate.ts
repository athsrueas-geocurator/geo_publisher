import{readFileSync,writeFileSync}from'node:fs';
import{geoGraphqlRequest as gql}from'../src/geo-api-client';
import{EDUCATION_PUBLICATION as target}from'../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8')),model=read('perry-debate-model'),ids=read('perry-debate-registry');
const query=readFileSync(`${root}/education-debate-node-query.graphql`,'utf8');
const p={related:'504e5776788844f6a77dba3ee811d8f0',support:'1dc6a843458848198e7a6e672268f811',oppose:'4e6ec5d14292498a84e5f607ca1a08ce',source:'49c5d5e1679a4dbdbfd33f618f227c94',factual:'da4a6c1f9d4446f9832ff3b49a4400ef'};
const specs=[...model.parents,...model.evidence],known=new Set(specs.map(n=>ids[n.key])),nodes=new Map<string,any>(),queue=[ids['expansion-justified']],checks:any[]=[];
function check(pass:unknown,label:string){checks.push({pass:!!pass,label});if(!pass)throw Error(label);}
try{
 while(queue.length){const id=queue.shift()!;if(nodes.has(id))continue;check(known.has(id),'No unexpected debate node');let after=null,pages=0,values:any[]=[],relations:any[]=[];
  do{const d:any=await gql(query,{variables:{id,space:target.spaceId,after}});check(d.entity&&!d.entity.values.pageInfo.hasNextPage,`Complete values ${id}`);values=d.entity.values.nodes;relations.push(...d.relationsConnection.nodes);pages++;const pg=d.relationsConnection.pageInfo;check(!pg.hasNextPage||(pg.endCursor&&pg.endCursor!==after&&pages<30),'Advancing graph cursor');after=pg.hasNextPage?pg.endCursor:null;}while(after);
  nodes.set(id,{values,relations,pages});for(const edge of relations){check(edge.spaceId===target.spaceId&&edge.fromEntityId===id,'Correct edge provenance');if(edge.typeId!==p.source)queue.push(edge.toEntityId);}
 }
 check(nodes.size===6,'Six distinct Claims, not six independent studies');
 for(const n of specs){const id=ids[n.key],node=nodes.get(id),value=(property:string)=>node.values.find((v:any)=>v.propertyId===property),actual=(type:string)=>node.relations.filter((r:any)=>r.typeId===type).map((r:any)=>r.toEntityId).sort();
  check(value(p.factual)?.boolean===!model.parents.some((x:any)=>x.key===n.key),`Response kind ${n.key}`);
  check(JSON.stringify(actual(p.source))===JSON.stringify([model.source.articleId]),`Original paper ${n.key}`);
  for(const[type,kind]of[[p.related,'related'],[p.support,'SUPPORTS'],[p.oppose,'OPPOSES']]){const expected:string[]=[];for(const pair of model.pairReview){if(kind==='related'||pair.proposedBracket===kind){if(pair.a===n.key)expected.push(ids[pair.b]);if(pair.b===n.key&&(kind==='related'?pair.related==='both':pair.argumentDirection==='both'))expected.push(ids[pair.a]);}}check(JSON.stringify(actual(type))===JSON.stringify(expected.sort()),`Exact ${kind} adjacency ${n.key}`);}
  if(n.value){check(Number(value('45ce8dc80a74432e9a2483cd1c8e86e1')?.decimal)===Number(n.value)&&Number(value('cc28953bd89e406096c9627021f4713d')?.decimal)===Number(n.standardError),`Source estimate and SE ${n.key}`);}
 }
}catch(error:any){checks.push({pass:false,label:error.message});}
const report={checkedAt:new Date().toISOString(),passed:checks.every(c=>c.pass),nodes:Object.fromEntries(nodes),checks,scope:'Six-node Perry debate traversal, explicit relation roles, response kinds, original citations and ratio/SE values; does not prove dashboard rendering or causal transportability'};
writeFileSync(`${root}/perry-debate-query-verification.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,nodes:nodes.size,checks:checks.length,failed:checks.filter(c=>!c.pass)}));if(!report.passed)process.exitCode=1;
