import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',space='dac259bad48a11adf97fe36857d85206';
const query=readFileSync(`${root}/education-debate-node-query.graphql`,'utf8');
const seeds=['44e2a08c02e74fdaaaa6f112e1581fb5','2700dd4c50a641658f29fbc176d87f31'];
const supporting='1dc6a843458848198e7a6e672268f811',opposing='4e6ec5d14292498a84e5f607ca1a08ce',sources='49c5d5e1679a4dbdbfd33f618f227c94';
const report:any={checkedAt:new Date().toISOString(),queryPath:`${root}/education-debate-node-query.graphql`,space,nodes:[],checks:[]};
const pending=[...seeds],seen=new Set<string>();
while(pending.length){
 const id=pending.shift()!;if(seen.has(id))continue;seen.add(id);let after:string|null=null;const cursors=new Set<string>();const node:any={id,relations:[],pages:0};
 do{const d:any=await gql(query,{variables:{id,space,after}});if(!d.entity||d.entity.values.pageInfo.hasNextPage)throw Error('Missing entity or truncated values');node.values=d.entity.values.nodes;node.relations.push(...d.relationsConnection.nodes);node.pages++;
 const page=d.relationsConnection.pageInfo;if(!page.hasNextPage)break;if(!page.endCursor||cursors.has(page.endCursor))throw Error('Broken cursor');after=page.endCursor;cursors.add(after!);
 }while(true);
 if(node.relations.some((r:any)=>r.spaceId!==space||r.fromEntityId!==id))throw Error('Provenance mismatch');
 for(const r of node.relations)if(r.typeId!==sources)pending.push(r.toEntityId);
 report.nodes.push(node);
 if(seen.size>30)throw Error('Unexpected debate expansion');
}
const edges=(id:string,type:string)=>report.nodes.find((n:any)=>n.id===id).relations.filter((r:any)=>r.typeId===type).map((r:any)=>r.toEntityId).sort();
function expect(label:string,actual:any,wanted:any){report.checks.push({label,pass:JSON.stringify(actual)===JSON.stringify(wanted),actual,wanted});}
expect('Economic supporters reuse one model in two representations',edges(seeds[0]!,supporting),['6db38a6c620f4ca1bc2452137457d686','b0e661c838de4b8eb406a9c5a82249b1'].sort());
expect('One-sided economic challenge',edges(seeds[0]!,opposing),['dc9f8289b4c94ed2b89c3e8f913f6d1e']);
expect('Broad-policy objection has three reasons',edges(seeds[1]!,supporting),['4b70147b5e53405590e4534fdd017eca','c050382dc2614403916342d43d2ef87a','dc9f8289b4c94ed2b89c3e8f913f6d1e'].sort());
expect('No invented reverse opposition',edges(seeds[1]!,opposing),[]);
expect('Nine unique Claim nodes, not nine studies',report.nodes.length,9);
expect('Checkable source-reported scenario',report.nodes.find((n:any)=>n.id==='b0e661c838de4b8eb406a9c5a82249b1').values.find((v:any)=>v.propertyId==='da4a6c1f9d4446f9832ff3b49a4400ef')?.boolean,true);
report.passed=report.checks.every((c:any)=>c.pass);writeFileSync(`${root}/class-size-debate-query-verification.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,nodes:report.nodes.length,pages:report.nodes.reduce((s:number,n:any)=>s+n.pages,0),checks:report.checks},null,2));if(!report.passed)process.exitCode=1;
