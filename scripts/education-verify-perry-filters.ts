import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const registry=JSON.parse(readFileSync(`${root}/perry-registry.json`,'utf8'));
const model=JSON.parse(readFileSync(`${root}/perry-mapping-plan.json`,'utf8'));
const rows=JSON.parse(readFileSync(model.input,'utf8')).records.filter((r:any)=>r.kind.startsWith('modeled-'));
if(existsSync(`${root}/perry-debate-related-publication.json`)){
 const debate=JSON.parse(readFileSync(`${root}/perry-debate-model.json`,'utf8')),ids=JSON.parse(readFileSync(`${root}/perry-debate-registry.json`,'utf8'));
 const extra=debate.evidence.find((r:any)=>r.key==='pooled-low-valuation-through-40');
 registry[`estimate/${extra.key}`]=ids[extra.key];
 rows.push({key:extra.key,kind:'modeled-benefit-cost-ratio',value:extra.value,standardError:extra.standardError,deadweightLossFraction:extra.deadweightLoss,realDiscountRate:extra.discountRate,crimeValuation:'low',population:'all',perspective:'society',unit:'ratio',locator:extra.sourceLocator,horizon:'Modeled economic horizon through age 40'});
}
const query=readFileSync(`${root}/perry-comparison-query.graphql`,'utf8');
const prop=(key:string)=>model.reusedProperties[key]?.id??registry[`property/${key}`];
const relation=(key:string,target:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:prop(key)},toEntityId:{is:target}}}});
const value=(key:string,decimal?:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:prop(key)},...(decimal!==undefined?{decimal:{is:decimal}}:{})}}});
const schema=await gql<any>('{__type(name:"BigFloatFilter"){inputFields{name}}}');
if(!schema.__type.inputFields.some((f:any)=>f.name==='is'))throw new Error('Numeric equality filter requires schema review');
const cases:any[]=[{name:'All economic estimates',conditions:[],expected:rows},
 ...['all','male','female'].map(pop=>({name:`Population ${pop}`,conditions:[relation('population',registry[`population/${pop}`])],expected:rows.filter((r:any)=>r.population===pop)})),
 ...['individual','society'].map(p=>({name:`Perspective ${p}`,conditions:[relation('economicPerspectives',registry[`perspective/${p}`])],expected:rows.filter((r:any)=>r.perspective===p)})),
 {name:'IRR tax loss 0.5',conditions:[value('internalReturn'),value('deadweightLoss','0.5')],expected:rows.filter((r:any)=>r.kind==='modeled-internal-return'&&r.deadweightLossFraction==='0.5')},
 {name:'Ratios discount 0.03',conditions:[value('benefitCostRatio'),value('discountRate','0.03')],expected:rows.filter((r:any)=>r.kind==='modeled-benefit-cost-ratio'&&r.realDiscountRate==='0.03')},
 {name:'Female societal low-valuation ratio at 7%',conditions:[value('benefitCostRatio'),relation('population',registry['population/female']),relation('economicPerspectives',registry['perspective/society']),value('discountRate','0.07'),value('murderValuation','13000')],expected:rows.filter((r:any)=>r.kind==='modeled-benefit-cost-ratio'&&r.population==='female'&&r.perspective==='society'&&r.realDiscountRate==='0.07'&&r.crimeValuation==='low')},
 {name:'Unreported individual benefit-cost ratio',conditions:[value('benefitCostRatio'),relation('economicPerspectives',registry['perspective/individual'])],expected:[]}
];
for(const age of [40,65,50]){
 const horizon=`Modeled economic horizon through age ${age}`;
 cases.push({name:`Economic benefits through age ${age}`,conditions:[{values:{some:{spaceId:{is:spaceId},propertyId:{is:prop('followup')},text:{is:horizon}}}}],expected:rows.filter((r:any)=>(r.horizon??'Modeled economic horizon through age 65')===horizon)});
}
const report:any={checkedAt:new Date().toISOString(),spaceId,scope:`All ${rows.length} economic rows, paginated destination-scoped filters and numerical/source/scenario/horizon reconciliation`,cases:[]};
for(const test of cases){
 const filter={and:[relation('study',registry.study),{or:[value('internalReturn'),value('benefitCostRatio')]},...test.conditions]};
 const result:any={name:test.name,filter,expectedIds:test.expected.map((r:any)=>registry[`estimate/${r.key}`]).sort(),pages:[],checks:[]};
 try{
  let after:string|null=null;const nodes:any[]=[];
  while(true){const data:any=await gql<any>(query,{variables:{spaceId,filter,after}});const page:any=data.entitiesConnection;result.pages.push(page);nodes.push(...page.nodes);if(!page.pageInfo.hasNextPage)break;if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||result.pages.length>20)throw new Error('Incomplete/repeated pagination');after=page.pageInfo.endCursor;}
  result.actualIds=nodes.map((n:any)=>n.id).sort();result.checks.push(JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
  for(const node of nodes){const row=test.expected.find((r:any)=>registry[`estimate/${r.key}`]===node.id);result.checks.push(!!row,!node.values.pageInfo.hasNextPage,!node.relations.pageInfo.hasNextPage);if(!row)continue;
   const v=(key:string)=>node.values.nodes.find((v:any)=>v.propertyId===prop(key));
   const r=(key:string,target:string)=>node.relations.nodes.some((r:any)=>r.typeId===prop(key)&&r.toEntityId===target);
   result.checks.push(v('followup')?.text===(row.horizon??'Modeled economic horizon through age 65'));
   result.checks.push(Number(v(row.kind==='modeled-internal-return'?'internalReturn':'benefitCostRatio')?.decimal)===Number(row.value),Number(v('standardError')?.decimal)===Number(row.standardError),Number(v('deadweightLoss')?.decimal)===Number(row.deadweightLossFraction),v('unit')?.text===row.unit,v('locator')?.text===row.locator,r('source',registry.paper),r('population',registry[`population/${row.population}`]),r('economicPerspectives',registry[`perspective/${row.perspective}`]));
   result.checks.push(row.realDiscountRate===null?v('discountRate')===undefined:Number(v('discountRate')?.decimal)===Number(row.realDiscountRate));
   result.checks.push(row.crimeValuation===null?v('murderValuation')===undefined:Number(v('murderValuation')?.decimal)===(row.crimeValuation==='high'?4100000:13000));
  }
  result.passed=result.checks.every(Boolean);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);writeFileSync(`${root}/perry-comparison-query-verification.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({name:result.name,passed:result.passed,rows:result.actualIds?.length,error:result.error}));
}
report.passed=report.cases.every((c:any)=>c.passed);writeFileSync(`${root}/perry-comparison-query-verification.json`,JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
