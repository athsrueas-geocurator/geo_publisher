import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const registry=read('reading-first-registry'),star=read('star-experimental-registry'),saga=read('saga-registry');
const rows=read('reading-first-extraction').records,model=read('reading-first-model');
const query=readFileSync(`${root}/reading-first-comparison-query.graphql`,'utf8');
const p={actual:registry['property/actualMean'],estimated:registry['property/counterfactualMean'],observedProportion:'73b35a4ce05f45908118a089d9995bae',estimatedProportion:registry['property/counterfactualProportion'],unit:'5c67ae17c84ce783f3b8cd8ffa063661'};
const value=(property:string,text?:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:property},...(text===undefined?{}:{text:{is:text}})}}});
const relation=(property:string,to:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:property},toEntityId:{is:to}}}});
const proportional=(r:any)=>['percent','proportion'].includes(r.means.unit);
const cases:any[]=[
 {name:'All mean pairs',conditions:[],expected:rows},
 {name:'Numeric means',conditions:[value(p.actual)],expected:rows.filter((r:any)=>!proportional(r))},
 {name:'Proportion means',conditions:[value(p.observedProportion)],expected:rows.filter(proportional)},
 ...['1','2','3'].map(g=>({name:`Grade ${g}`,conditions:[relation(star['property/grades'],star[`grade/${g}`])],expected:rows.filter((r:any)=>r.grade===g)})),
 {name:'No grade-specific claim for survey means',conditions:[{not:{relations:{some:{spaceId:{is:spaceId},typeId:{is:star['property/grades']}}}}}],expected:rows.filter((r:any)=>!r.grade)},
 {name:'Instructional time means',conditions:[value(p.unit,'minutes per daily reading block')],expected:rows.filter((r:any)=>r.means.unit==='minutes per daily reading block')},
 {name:'First-grade comprehension means',conditions:[relation(star['property/grades'],star['grade/1']),value(model.outcomeMeasureProperty,'Reading comprehension scaled score (SAT 10 reading comprehension)')],expected:rows.filter((r:any)=>r.key==='sat10-score-g1')},
 {name:'Third-grade decoding not reported',conditions:[relation(star['property/grades'],star['grade/3']),value(model.outcomeMeasureProperty,'Decoding skill standard score (Test of Silent Word Reading Fluency (TOSWRF))')],expected:[]},
 {name:'Standardized forms do not duplicate means',conditions:[value(saga['property/unit'],'standard deviations')],expected:[]},
];
function sameDecimal(actual:string,source:string,shift=0){
 if(!/^-?\d+(\.\d+)?$/.test(actual))return false;
 const parts=(s:string)=>({n:BigInt(s.replace('.','')),e:-(s.split('.')[1]?.length??0)});
 const a=parts(actual),b=parts(source);b.e-=shift;const e=Math.min(a.e,b.e);
 return a.n*10n**BigInt(a.e-e)===b.n*10n**BigInt(b.e-e);
}
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath:`${root}/reading-first-comparison-query.graphql`,scope:'Complete bounded mean reads with exact decimal reconciliation, distinct mean/impact units and source/study/arm context',cases:[]};
for(const test of cases){
 const filter={and:[relation('dfa6aebe1ca94bf29faccc4cc7afb24c',registry.study),{or:[value(p.actual),value(p.observedProportion)]},...test.conditions]};
 const result:any={name:test.name,filter,expectedIds:test.expected.map((r:any)=>registry[`estimate/${r.key}/native`]).sort(),pages:[],checks:[]};
 try{
  let after:string|null=null;const nodes:any[]=[];
  while(true){const data:any=await gql<any>(query,{variables:{spaceId,filter,after}}),page=data.entitiesConnection;result.pages.push(page);nodes.push(...page.nodes);if(!page.pageInfo.hasNextPage)break;if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||result.pages.length>20)throw new Error('Incomplete pagination');after=page.pageInfo.endCursor;}
  result.actualIds=nodes.map(n=>n.id).sort();result.checks.push(JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
  for(const node of nodes){
   const row=test.expected.find((r:any)=>registry[`estimate/${r.key}/native`]===node.id);
   result.checks.push(!!row,!node.values.pageInfo.hasNextPage,!node.relations.pageInfo.hasNextPage);if(!row)continue;
   const v=(id:string)=>node.values.nodes.find((v:any)=>v.propertyId===id);
   const r=(type:string,to:string)=>node.relations.nodes.some((r:any)=>r.typeId===type&&r.toEntityId===to);
   const prop=proportional(row),shift=row.means.unit==='percent'?2:0;
   result.checks.push(sameDecimal(v(prop?p.observedProportion:p.actual)?.decimal??'',row.means.actualUnadjustedWithReadingFirst,shift),sameDecimal(v(prop?p.estimatedProportion:p.estimated)?.decimal??'',row.means.estimatedCounterfactualWithoutReadingFirst,shift));
   result.checks.push(!v(prop?p.actual:p.observedProportion),!v(prop?p.estimated:p.estimatedProportion),v(p.unit)?.text===(prop?'fraction':row.means.unit));
   result.checks.push(sameDecimal(v(saga['property/estimate'])?.decimal??'',row.native.value),v(saga['property/unit'])?.text===row.native.unit,v(saga['property/followup'])?.text===row.followup,v(model.outcomeMeasureProperty)?.text===`${row.measure} (${row.instrument})`);
   const locator=row.sourceLocations.map((l:any)=>`Exhibit ${l.exhibit}, printed p. ${l.printedPage} (PDF p. ${l.pdfPage})`).join('; ');
   result.checks.push(v(saga['property/locator'])?.text===locator,r('49c5d5e1679a4dbdbfd33f618f227c94',registry.paper),r('dfa6aebe1ca94bf29faccc4cc7afb24c',registry.study),r(star['property/interventionArms'],registry['arm/funded']),r(star['property/comparisonArms'],registry['arm/comparison']),!v('bf0249bb71924460bfe6b35394ed0781'));
  }
  result.passed=result.checks.every(Boolean);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);writeFileSync(`${root}/reading-first-means-query-verification.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({name:test.name,passed:result.passed,rows:result.actualIds?.length,error:result.error}));
}
report.passed=report.cases.every((c:any)=>c.passed);writeFileSync(`${root}/reading-first-means-query-verification.json`,JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
