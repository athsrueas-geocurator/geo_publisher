import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const source=read('saga-outcomes-transcription'),model=read('saga-outcomes-model'),registry=read('saga-outcomes-registry'),saga=read('saga-registry'),context=read('saga-context-registry'),contextModel=read('saga-context-model');
const query=readFileSync(`${root}/saga-outcomes-query.graphql`,'utf8'),spaceId=target.spaceId;
const sourceProperty='49c5d5e1679a4dbdbfd33f618f227c94',related='dfa6aebe1ca94bf29faccc4cc7afb24c';
// Expected values come directly from the independent source transcription, not publication operations.
const expected=source.tables.flatMap((table:any)=>table.rows.flatMap((row:any)=>['itt','tot'].map((estimand:string)=>{
 const cells=Object.fromEntries(source.columns.map((column:string,i:number)=>[column,row.values[i]]));
 return {id:registry[`estimate/s${table.study}/${row.key}/${estimand}`],study:table.study,panel:row.panel,measure:row.label,unit:row.unit,estimand:estimand.toUpperCase(),value:cells[estimand],se:cells[`${estimand}SE`],n:cells.N};
})));
if(expected.length!==62||expected.some((r:any)=>!r.id))throw new Error('Incomplete stable crosswalk');
const relation=(property:string,id:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:property},toEntityId:{is:id}}}});
const value=(property:string,text:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:property},text:{is:text}}}});
const base={and:[relation(sourceProperty,saga['paper/10.1257/aer.20210434']),{or:[1,2].map(s=>relation(related,context[`study/${s}`]))}]};
const cases:any[]=[{name:'All 62 first-year effects',filter:base,rows:expected}];
for(const study of [1,2])cases.push({name:`Study ${study}`,filter:{and:[base,relation(related,context[`study/${study}`])]},rows:expected.filter((r:any)=>r.study===study)});
for(const estimand of ['ITT','TOT'])cases.push({name:`Both trials, ${estimand}`,filter:{and:[base,value(saga['property/estimand'],estimand)]},rows:expected.filter((r:any)=>r.estimand===estimand)});
for(const measure of [...new Set<string>(expected.map((r:any)=>r.measure))])cases.push({name:`Outcome: ${measure}`,filter:{and:[base,value(model.outcomeProperty,measure)]},rows:expected.filter((r:any)=>r.measure===measure)});
cases.push({name:'No effect assigned to both trials',filter:{and:[base,...[1,2].map(s=>relation(related,context[`study/${s}`]))]},rows:[]});
const report:any={checkedAt:new Date().toISOString(),spaceId,scope:'All 62 Tables 3–4 effects, exact values/SE/N, unit presence/absence, study and population membership, sources and paginated outcome filters',cases:[]};
for(const test of cases){
 const result:any={name:test.name,filter:test.filter,expectedIds:test.rows.map((r:any)=>r.id).sort(),pages:[],checks:[]};
 const check=(label:string,pass:boolean)=>result.checks.push({label,pass});
 try{
  let after:string|null=null;const nodes:any[]=[],seen=new Set<string>();
  while(true){const data:any=await gql<any>(query,{variables:{spaceId,filter:test.filter,after}}),page:any=data.entitiesConnection;nodes.push(...page.nodes);result.pages.push(page);if(!page.pageInfo.hasNextPage)break;const cursor=page.pageInfo.endCursor;if(!cursor||seen.has(cursor)||result.pages.length>30)throw new Error('Incomplete pagination');seen.add(cursor);after=cursor;}
  result.actualIds=nodes.map(n=>n.id).sort();check('Exact membership',JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
  for(const node of nodes){
   const row=expected.find((r:any)=>r.id===node.id);check(`Known effect ${node.id}`,!!row);if(!row)continue;
   check(`Complete facts ${node.id}`,!node.values.pageInfo.hasNextPage&&!node.relations.pageInfo.hasNextPage);
   const v=(p:string)=>node.values.nodes.find((v:any)=>v.propertyId===p),r=(p:string,id:string)=>node.relations.nodes.some((r:any)=>r.typeId===p&&r.toEntityId===id);
   for(const [p,n] of [[saga['property/estimate'],row.value],[saga['property/se'],row.se]])check(`Exact source decimal ${node.id}/${p}`,v(p)?.decimal!=null&&Number(v(p).decimal)===Number(n));
   check(`Source N ${node.id}`,v(model.sampleProperty)?.integer!=null&&Number(v(model.sampleProperty).integer)===Number(row.n));
   check(`Unit or explicit absence ${node.id}`,row.unit?v(saga['property/unit'])?.text===row.unit:!v(saga['property/unit'])&&node.description.includes('unresolved'));
   check(`Own study only ${node.id}`,r(related,context[`study/${row.study}`])&&!r(related,context[`study/${row.study===1?2:1}`]));
   check(`Population ${node.id}`,v(contextModel.populationProperty)?.text===contextModel.studies.find((s:any)=>s.key===String(row.study)).population);
   check(`Source ${node.id}`,r(sourceProperty,saga['paper/10.1257/aer.20210434']));
   check(`Measure and estimand ${node.id}`,v(model.outcomeProperty)?.text===row.measure&&v(saga['property/estimand'])?.text===row.estimand);
  }
  result.passed=result.checks.every((c:any)=>c.pass);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);console.log(JSON.stringify({name:test.name,passed:result.passed,count:result.actualIds?.length,error:result.error}));
 writeFileSync(`${root}/saga-outcomes-query-verification.json`,JSON.stringify(report,null,2)+'\n');
}
report.passed=report.cases.every((c:any)=>c.passed);writeFileSync(`${root}/saga-outcomes-query-verification.json`,JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
