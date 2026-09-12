import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const registry=read('saga-context-registry'),saga=read('saga-registry'),model=read('saga-context-model'),extraction=read('saga-extraction');
const outcomeRegistry=read('saga-outcomes-registry'),outcomes=read('saga-outcomes-extraction');
const queryPath=`${root}/saga-context-query.graphql`,query=readFileSync(queryPath,'utf8');
const related='dfa6aebe1ca94bf29faccc4cc7afb24c',source='49c5d5e1679a4dbdbfd33f618f227c94',location='95d770021faf4f7cb7deb21a7d48cda0';
const relation=(property:string,target:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:property},toEntityId:{is:target}}}});
const value=(property:string,text:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:property},text:{is:text}}}});
const cases:any[]=[
 {name:'Tutoring service by provider and city',typeId:model.program.type,filter:{and:[relation(model.providersProperty,registry.provider),relation(location,model.chicagoId)]},ids:[registry.program]},
 {name:'Study is not a service provider',typeId:model.program.type,filter:relation(model.providersProperty,registry['study/1']),ids:[]},
 {name:'Both studies for the tutoring service',typeId:model.studyType,filter:relation(related,registry.program),ids:model.studies.map((s:any)=>registry[`study/${s.key}`])},
 ...model.studies.map((s:any)=>({name:`Study ${s.key} population`,typeId:model.studyType,filter:{and:[relation(related,registry.program),value(model.populationProperty,s.population)]},ids:[registry[`study/${s.key}`]]})),
 ...model.studies.map((s:any)=>({name:`Study ${s.key} effects`,typeId:'96f859efa1ca4b229372c86ad58b694b',filter:relation(related,registry[`study/${s.key}`]),ids:outcomes.records.filter((r:any)=>String(r.study)===s.key).map((r:any)=>outcomeRegistry[`estimate/${r.key}`])})),
 {name:'No effect belongs to both trials',typeId:'96f859efa1ca4b229372c86ad58b694b',filter:{and:model.studies.map((s:any)=>relation(related,registry[`study/${s.key}`]))},ids:[]}
];
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath,scope:'Provider/city, trial/population and all 62 first-year estimate memberships; original four math values/SEs unchanged. Complete outcome reconciliation is in saga-outcomes-query-verification.json.',cases:[]};
for(const test of cases){
 const result:any={name:test.name,typeId:test.typeId,filter:test.filter,expectedIds:test.ids.slice().sort(),pages:[],checks:[]};
 const check=(label:string,pass:boolean)=>result.checks.push({label,pass});
 try{
  let after:string|null=null;const nodes:any[]=[],seen=new Set<string>();
  while(true){
   const data:any=await gql<any>(query,{variables:{spaceId,typeId:test.typeId,filter:test.filter,after}}),page:any=data.entitiesConnection;
   result.pages.push(page);nodes.push(...page.nodes);
   if(!page.pageInfo.hasNextPage)break;
   const cursor=page.pageInfo.endCursor;if(!cursor||seen.has(cursor)||result.pages.length>20)throw new Error('Incomplete pagination');seen.add(cursor);after=cursor;
  }
  result.actualIds=nodes.map(n=>n.id).sort();check('Exact membership',JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
  for(const node of nodes){
   check(`Complete nested facts ${node.id}`,!node.values.pageInfo.hasNextPage&&!node.relations.pageInfo.hasNextPage);
   const v=(id:string)=>node.values.nodes.find((v:any)=>v.propertyId===id);
   const r=(prop:string,to:string)=>node.relations.nodes.some((r:any)=>r.typeId===prop&&r.toEntityId===to);
   check(`Article source ${node.id}`,r(source,saga['paper/10.1257/aer.20210434']));
   const study=model.studies.find((s:any)=>registry[`study/${s.key}`]===node.id);
   if(study){check(`Trial context ${study.key}`,v(model.populationProperty)?.text===study.population&&v(model.designProperty)?.text===study.design&&Number(v(saga['property/study'])?.integer)===Number(study.key)&&r(location,model.chicagoId)&&r(related,registry.program));}
   const estimate=extraction.estimates.find((e:any)=>saga[`estimate/${e.key}`]===node.id);
   if(estimate){
    check(`Original effect ${estimate.key}`,v(saga['property/estimate'])?.decimal!=null&&Number(v(saga['property/estimate']).decimal)===estimate.value);
    check(`Original SE ${estimate.key}`,v(saga['property/se'])?.decimal!=null&&Number(v(saga['property/se']).decimal)===estimate.standardError);
    check(`Own trial only ${estimate.key}`,r(related,registry[`study/${estimate.study}`])&&!r(related,registry[`study/${estimate.study===1?2:1}`]));
   }
  }
  result.passed=result.checks.every((c:any)=>c.pass);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);console.log(JSON.stringify({name:test.name,passed:result.passed,rows:result.actualIds?.length,error:result.error}));
 writeFileSync(`${root}/saga-context-query-verification.json`,JSON.stringify(report,null,2)+'\n');
}
report.passed=report.cases.every((c:any)=>c.passed);writeFileSync(`${root}/saga-context-query-verification.json`,JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
