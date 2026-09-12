import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',spaceId=EDUCATION_PUBLICATION.spaceId;
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const registry=read('reading-first-registry'),model=read('reading-first-model'),saga=read('saga-registry'),star=read('star-experimental-registry');
const rows=read('reading-first-publication-records').records;
const query=readFileSync(`${root}/reading-first-comparison-query.graphql`,'utf8');
const p={effect:saga['property/estimate'],se:saga['property/se'],unit:saga['property/unit'],followup:saga['property/followup'],locator:saga['property/locator'],lower:registry['property/ciLower'],upper:registry['property/ciUpper'],level:registry['property/ciLevel'],measure:model.outcomeMeasureProperty,pValue:model.pValueProperty,related:'dfa6aebe1ca94bf29faccc4cc7afb24c',source:'49c5d5e1679a4dbdbfd33f618f227c94',grade:star['property/grades'],arm:star['property/interventionArms'],comparison:star['property/comparisonArms']};
const relation=(property:string,target:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:property},toEntityId:{is:target}}}});
const value=(property:string,text?:string)=>({values:{some:{spaceId:{is:spaceId},propertyId:{is:property},...(text===undefined?{}:{text:{is:text}})}}});
const cases:any[]=[
  {name:'All 33 contrasts / 63 representations',conditions:[],expected:rows},
  {name:'Standardized representations',conditions:[value(p.unit,'standard deviations')],expected:rows.filter((r:any)=>r.representation==='standardized')},
  {name:'Native-unit representations',conditions:[{not:value(p.unit,'standard deviations')}],expected:rows.filter((r:any)=>r.representation==='native')},
  ...['1','2','3'].map(g=>({name:`Grade ${g}`,conditions:[relation(p.grade,star[`grade/${g}`])],expected:rows.filter((r:any)=>r.grade===g)})),
  {name:'Reported confidence intervals',conditions:[value(p.lower)],expected:rows.filter((r:any)=>r.confidenceInterval)},
  {name:'Unreported survey uncertainty',conditions:[{not:value(p.lower)}],expected:rows.filter((r:any)=>!r.confidenceInterval)},
  {name:'Spring 2007 only',conditions:[value(p.followup,'Spring 2007 only')],expected:rows.filter((r:any)=>r.followup==='Spring 2007 only')},
  {name:'Reported p-value threshold',conditions:[value(p.pValue,'P < 0.001')],expected:rows.filter((r:any)=>r.pValue.operator==='<'&&r.pValue.value==='0.001')},
  {name:'Paired first-grade comprehension representations',conditions:[relation(p.grade,star['grade/1']),value(p.measure,'Reading comprehension scaled score (SAT 10 reading comprehension)')],expected:rows.filter((r:any)=>r.contrastKey==='sat10-score-g1')},
  {name:'Unreported third-grade decoding',conditions:[relation(p.grade,star['grade/3']),value(p.measure,'Decoding skill standard score (Test of Silent Word Reading Fluency (TOSWRF))')],expected:[]}
];
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath:`${root}/reading-first-comparison-query.graphql`,scope:'Complete paginated reads of all selected Reading First effects, source values, uncertainty, grade/arm/source links and native-standardized pairing; no inferred outcome N',cases:[]};
for(const test of cases){
  const filter={and:[relation(p.related,registry.study),value(p.effect),...test.conditions]};
  const result:any={name:test.name,filter,expectedIds:test.expected.map((r:any)=>registry[`estimate/${r.key}`]).sort(),pages:[],checks:[]};
  try{
    let after:string|null=null;const nodes:any[]=[];
    while(true){
      const data:any=await gql<any>(query,{variables:{spaceId,filter,after}}),page:any=data.entitiesConnection;
      result.pages.push(page);nodes.push(...page.nodes);
      if(!page.pageInfo.hasNextPage)break;
      if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||result.pages.length>20)throw new Error('Incomplete pagination');
      after=page.pageInfo.endCursor;
    }
    result.actualIds=nodes.map(n=>n.id).sort();result.checks.push(JSON.stringify(result.actualIds)===JSON.stringify(result.expectedIds));
    for(const node of nodes){
      const row=test.expected.find((r:any)=>registry[`estimate/${r.key}`]===node.id);
      result.checks.push(!!row,!node.values.pageInfo.hasNextPage,!node.relations.pageInfo.hasNextPage);if(!row)continue;
      const v=(property:string)=>node.values.nodes.find((v:any)=>v.propertyId===property);
      const r=(property:string,target:string)=>node.relations.nodes.some((r:any)=>r.typeId===property&&r.toEntityId===target);
      const number=(property:string,expected:string|null)=>expected===null?v(property)===undefined:v(property)?.decimal!=null&&Number(v(property).decimal)===Number(expected);
      const locator=row.sourceLocations.map((l:any)=>`Exhibit ${l.exhibit}, printed p. ${l.printedPage} (PDF p. ${l.pdfPage})`).join('; ');
      result.checks.push(number(p.effect,row.value),number(p.se,row.standardError),number(p.lower,row.confidenceInterval?.lower??null),number(p.upper,row.confidenceInterval?.upper??null),number(p.level,row.confidenceInterval?.level??null),v(p.unit)?.text===row.unit,v(p.followup)?.text===row.followup,v(p.measure)?.text===`${row.measure} (${row.instrument})`,v(p.pValue)?.text===`P ${row.pValue.operator} ${row.pValue.value}`,v(p.locator)?.text===locator,r(p.source,registry.paper),r(p.related,registry.study),r(p.arm,registry['arm/funded']),r(p.comparison,registry['arm/comparison']),!v('bf0249bb71924460bfe6b35394ed0781'));
      result.checks.push(row.grade?r(p.grade,star[`grade/${row.grade}`]):!node.relations.nodes.some((e:any)=>e.typeId===p.grade));
      const pairIds=node.relations.nodes.filter((e:any)=>e.typeId===p.related&&e.toEntityId!==registry.study).map((e:any)=>e.toEntityId).sort();
      result.checks.push(JSON.stringify(pairIds)===JSON.stringify(row.pairedKey?[registry[`estimate/${row.pairedKey}`]]:[]));
    }
    result.passed=result.checks.every(Boolean);
  }catch(error:any){result.passed=false;result.error=error.message;}
  report.cases.push(result);writeFileSync(`${root}/reading-first-query-verification.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({name:test.name,passed:result.passed,rows:result.actualIds?.length,error:result.error}));
}
report.passed=report.cases.every((c:any)=>c.passed);
writeFileSync(`${root}/reading-first-query-verification.json`,JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
