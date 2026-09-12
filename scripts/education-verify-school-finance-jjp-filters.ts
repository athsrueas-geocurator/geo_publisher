import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const registry=read('school-finance-jjp-registry'),model=read('school-finance-jjp-model'),source=read('school-finance-jjp-transcription'),saga=read('saga-registry');
const rows=read('school-finance-jjp-extraction').records;
const queryPath=`${root}/school-finance-jjp-comparison-query.graphql`,query=readFileSync(queryPath,'utf8');
const p={effect:saga['property/estimate'],se:saga['property/se'],unit:saga['property/unit'],estimand:saga['property/estimand'],locator:saga['property/locator'],population:model.populationSummaryProperty,measure:model.outcomeMeasureProperty,pValue:model.pValueProperty,source:'49c5d5e1679a4dbdbfd33f618f227c94',related:'dfa6aebe1ca94bf29faccc4cc7afb24c'};
const relation=(property:string,target:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:property},toEntityId:{is:target}}}});
const value=(property:string,text?:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:property},...(text===undefined?{}:{text:{is:text}})}}});
const cases:any[]=[
 {name:'All 15 preferred coefficients',conditions:[],expected:rows},
 ...Object.keys(model.groups).map(group=>({name:`Population: ${group}`,conditions:[value(p.population,model.groups[group])],expected:rows.filter((r:any)=>r.group===group)})),
 ...source.outcomes.map((o:any)=>({name:`Outcome: ${o.key}`,conditions:[value(p.measure,o.measure)],expected:rows.filter((r:any)=>r.measure===o.measure)})),
 {name:'Reported significance threshold',conditions:[value(p.pValue)],expected:rows.filter((r:any)=>r.pThreshold!==null)},
 {name:'Unreported significance threshold',conditions:[{not:value(p.pValue)}],expected:rows.filter((r:any)=>r.pThreshold===null)},
 {name:'Nonpoor has no reported significance threshold',conditions:[value(p.population,model.groups.nonpoor),value(p.pValue)],expected:[]},
 {name:'Low-income adult poverty',conditions:[value(p.population,model.groups['low-income']),value(p.measure,rows.find((r:any)=>r.key==='adult-poverty/all').measure)],expected:rows.filter((r:any)=>r.key==='adult-poverty/low-income')}
];
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath,scope:'All 15 preferred school-finance coefficients; population/outcome and missing-significance filters, exact values and source links; no inferred subgroup N',cases:[]};
for(const test of cases){
 const filter={and:[relation(p.related,registry.study),value(p.effect),...test.conditions]};
 const result:any={name:test.name,filter,expectedIds:test.expected.map((r:any)=>registry[`estimate/${r.key}`]).sort(),pages:[],checks:[]};
 try{
  let after:string|null=null;const nodes:any[]=[],seen=new Set<string>();
  while(true){
   const data:any=await gql<any>(query,{variables:{spaceId,filter,after}}),page=data.entitiesConnection;
   result.pages.push(page);nodes.push(...page.nodes);
   if(!page.pageInfo.hasNextPage)break;
   const cursor=page.pageInfo.endCursor;
   if(!cursor||seen.has(cursor)||result.pages.length>20)throw new Error('Incomplete pagination');
   seen.add(cursor);after=cursor;
  }
  result.actualIds=nodes.map(n=>n.id).sort();
  result.checks.push({label:'Exact record membership',pass:JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds)});
  for(const node of nodes){
   const row=test.expected.find((r:any)=>registry[`estimate/${r.key}`]===node.id);
   const check=(label:string,pass:boolean)=>result.checks.push({entityId:node.id,label,pass});
   check('Complete nested values and relations',!node.values.pageInfo.hasNextPage&&!node.relations.pageInfo.hasNextPage);
   if(!row){check('Expected record',false);continue;}
   const vs=(property:string)=>node.values.nodes.filter((v:any)=>v.propertyId===property);
   for(const [prop,expected] of [[p.effect,row.coefficient],[p.se,row.standardError]])check(`Decimal ${prop}`,vs(prop).length===1&&vs(prop)[0].decimal!=null&&Number(vs(prop)[0].decimal)===Number(expected));
   for(const [prop,expected] of [[p.unit,row.unit],[p.estimand,source.specification],[p.population,model.groups[row.group]],[p.measure,row.measure],[p.locator,`Table ${row.table}, column ${row.column}; printed p. ${row.printedPage} (PDF p. ${row.pdfPage})`]])check(`Text ${prop}`,vs(prop).length===1&&vs(prop)[0].text===expected);
   check('Threshold or explicit absence',row.pThreshold===null?vs(p.pValue).length===0:vs(p.pValue).length===1&&vs(p.pValue)[0].text===row.pThreshold);
   check('No inferred subgroup N',vs('bf0249bb71924460bfe6b35394ed0781').length===0);
   for(const [prop,target] of [[p.source,registry.paper],[p.related,registry.study]])check(`Relation ${prop}`,node.relations.nodes.some((r:any)=>r.typeId===prop&&r.toEntityId===target));
  }
  result.passed=result.checks.every((c:any)=>c.pass);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);writeFileSync(`${root}/school-finance-jjp-query-verification.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({name:test.name,passed:result.passed,rows:result.actualIds?.length,error:result.error}));
}
report.passed=report.cases.every((c:any)=>c.passed);
writeFileSync(`${root}/school-finance-jjp-query-verification.json`,JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
