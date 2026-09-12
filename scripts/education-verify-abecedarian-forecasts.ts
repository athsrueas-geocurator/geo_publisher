import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const input=read('abecedarian-forecast-records'),registry=read('abecedarian-registry'),p=input.mapping,rows=input.records;
const query=readFileSync(`${root}/abecedarian-comparison-query.graphql`,'utf8');
const SystemName='a126ca530c8e48d5b88882c734c38935',SystemDescription='9b1f76ff9711404c861e59dc3fa7d037';
const relation=(property:string,id:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:property},toEntityId:{is:id}}}});
const horizon=(text:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:p.horizon},text:{is:text}}}});
const cases=[{name:'All 11 source-reported forecasts',conditions:[],expected:rows},...['Through age 27','Through age 34','Life-cycle'].map(h=>({name:h,conditions:[horizon(h)],expected:rows.filter((r:any)=>r.horizon===h)})),{name:'Absent age-50 horizon',conditions:[horizon('Through age 50')],expected:[]}];
const report:any={checkedAt:new Date().toISOString(),scope:'Destination-scoped forecasts, numeric/source reconciliation and horizon filters; not method/benefit-scope filters or ranking eligibility',cases:[]};
for(const test of cases){
 const filter={and:[relation(p.source,rows[0].sourceArticleId),...rows[0].studyIds.map((id:string)=>relation(p.study,id)),{values:{some:{spaceId:{is:spaceId},propertyId:{is:p.value}}}},...test.conditions]};
 const result:any={name:test.name,filter,pages:[],checks:[],expectedIds:test.expected.map((r:any)=>registry[r.key]).sort()};
 try{
  const nodes:any[]=[],cursors=new Set<string>();let after:string|null=null;
  do{const d:any=await gql(query,{variables:{spaceId,filter,after}});const page=d.entitiesConnection;result.pages.push(page);nodes.push(...page.nodes);if(page.pageInfo.hasNextPage){if(!page.pageInfo.endCursor||cursors.has(page.pageInfo.endCursor))throw Error('Incomplete pagination');after=page.pageInfo.endCursor;cursors.add(after!);}else after=null;}while(after);
  result.actualIds=nodes.map(n=>n.id).sort();result.checks.push(JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
  for(const node of nodes){
   const row=test.expected.find((r:any)=>registry[r.key]===node.id);result.checks.push(!!row,!node.values.pageInfo.hasNextPage,!node.relations.pageInfo.hasNextPage);if(!row)continue;
   const value=(property:string)=>node.values.nodes.find((v:any)=>v.propertyId===property);
   const linked=(property:string,id:string)=>node.relations.nodes.some((r:any)=>r.typeId===property&&r.toEntityId===id);
   result.checks.push(value(SystemName)?.text===row.name,value(SystemDescription)?.text===row.description,Number(value(p.value)?.decimal)===Number(row.value),Number(value(p.standardError)?.decimal)===Number(row.standardError),value(p.horizon)?.text===row.horizon,value(p.unit)?.text===row.unit,value(p.locator)?.text===row.locator,value('da4a6c1f9d4446f9832ff3b49a4400ef')?.boolean===true,linked(p.source,row.sourceArticleId),...row.studyIds.map((id:string)=>linked(p.study,id)));
  }
  result.passed=result.checks.every(Boolean);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);console.log(JSON.stringify({name:result.name,rows:result.actualIds?.length,passed:result.passed,error:result.error}));
}
report.passed=report.cases.every((r:any)=>r.passed);writeFileSync(`${root}/abecedarian-comparison-query-verification.json`,JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
