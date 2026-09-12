import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const registry=JSON.parse(readFileSync(`${root}/perry-registry.json`,'utf8'));
const mapping=JSON.parse(readFileSync(`${root}/perry-mapping-plan.json`,'utf8')),model=JSON.parse(readFileSync(`${root}/perry-observed-model.json`,'utf8'));
const rows=JSON.parse(readFileSync(`${root}/perry-publication-records.json`,'utf8')).records.filter((r:any)=>r.kind===model.rowKind);
const query=readFileSync(`${root}/perry-comparison-query.graphql`,'utf8');
const prop=(key:string)=>key==='outcomeMeasure'?model.outcomeMeasure.id:mapping.reusedProperties[key]?.id??registry[`property/${key}`];
const relation=(key:string,target:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:prop(key)},toEntityId:{is:target}}}});
const value=(key:string,text?:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:prop(key)},...(text!==undefined?{text:{is:text}}:{})}}});
const cases:any[]=[{name:'All observed means',conditions:[],expected:rows},
 ...['female','male'].map(p=>({name:`Population ${p}`,conditions:[relation('population',registry[`population/${p}`])],expected:rows.filter((r:any)=>r.population===p)})),
 ...['control','treatment'].map(a=>({name:`Reported arm ${a}`,conditions:[relation('studyArms',registry[`arm/${a}`])],expected:rows.filter((r:any)=>r.assignment===a)})),
 ...['fraction','USD'].map(unit=>({name:`Unit ${unit}`,conditions:[value('unit',unit)],expected:rows.filter((r:any)=>r.unit===unit)})),
 ...['age 27','age 40','ages 18–27','ages 26–40','through age 40'].map(f=>({name:`Follow-up ${f}`,conditions:[value('followup',f)],expected:rows.filter((r:any)=>r.followup===f)})),
 {name:'Female treatment graduation age 27',conditions:[relation('population',registry['population/female']),relation('studyArms',registry['arm/treatment']),value('outcomeMeasure','High-school graduation'),value('followup','age 27')],expected:rows.filter((r:any)=>r.population==='female'&&r.assignment==='treatment'&&r.outcome==='High-school graduation'&&r.followup==='age 27')},
 {name:'Unreported graduation age 40',conditions:[value('outcomeMeasure','High-school graduation'),value('followup','age 40')],expected:[]}
];
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath:`${root}/perry-comparison-query.graphql`,scope:'Observed means only: paginated arm/population/unit/measure/follow-up filtering, values and source reconciliation, no inferred outcome N or causal effects',cases:[]};
for(const test of cases){
 const filter={and:[relation('study',registry.study),{or:[value('observedProportion'),value('observedMonetaryMean')]},...test.conditions]};
 const result:any={name:test.name,filter,pages:[],expectedIds:test.expected.map((r:any)=>registry[`observed/${r.key}`]).sort(),checks:[]};
 try{let after:string|null=null;const nodes:any[]=[];
  while(true){const data:any=await gql<any>(query,{variables:{spaceId,filter,after}});const page:any=data.entitiesConnection;result.pages.push(page);nodes.push(...page.nodes);if(!page.pageInfo.hasNextPage)break;if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||result.pages.length>20)throw new Error('Incomplete pagination');after=page.pageInfo.endCursor;}
  result.actualIds=nodes.map((n:any)=>n.id).sort();result.checks.push(JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
  for(const node of nodes){const row=test.expected.find((r:any)=>registry[`observed/${r.key}`]===node.id);result.checks.push(!!row,!node.values.pageInfo.hasNextPage,!node.relations.pageInfo.hasNextPage);if(!row)continue;
   const v=(key:string)=>node.values.nodes.find((v:any)=>v.propertyId===prop(key));const r=(key:string,target:string)=>node.relations.nodes.some((r:any)=>r.typeId===prop(key)&&r.toEntityId===target);
   result.checks.push(Number(v(row.unit==='fraction'?'observedProportion':'observedMonetaryMean')?.decimal)===Number(row.value),Number(v('standardError')?.decimal)===Number(row.standardError),v('outcomeMeasure')?.text===row.outcome,v('followup')?.text===row.followup,v('unit')?.text===row.unit,v('locator')?.text===row.locator,r('source',registry.paper),r('studyArms',registry[`arm/${row.assignment}`]),r('population',registry[`population/${row.population}`]));
   result.checks.push(!node.values.nodes.some((v:any)=>['bf0249bb71924460bfe6b35394ed0781','e500e2585a964d2c9df4a47b199616c3'].includes(v.propertyId)));
   if(row.unit==='USD')result.checks.push(Number(v('priceYear')?.integer)===2006,v('currency')?.text==='USD');
  }
  result.passed=result.checks.every(Boolean);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);writeFileSync(`${root}/perry-observed-query-verification.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({name:test.name,passed:result.passed,rows:result.actualIds?.length,error:result.error}));
}
report.passed=report.cases.every((c:any)=>c.passed);writeFileSync(`${root}/perry-observed-query-verification.json`,JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
