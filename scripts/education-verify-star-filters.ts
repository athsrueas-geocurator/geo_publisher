import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education';
const registry=JSON.parse(readFileSync(`${root}/star-experimental-registry.json`,'utf8'));
const source=JSON.parse(readFileSync(`${root}/star-experimental-extraction.json`,'utf8'));
const saga=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const query=readFileSync(`${root}/star-comparison-query.graphql`,'utf8');
const spaceId=EDUCATION_PUBLICATION.spaceId;
const related='dfa6aebe1ca94bf29faccc4cc7afb24c';
const relation=(typeId:string,toEntityId:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:typeId},toEntityId:{is:toEntityId}}}});
const cases=[
  {name:'All STAR estimates',conditions:[],expected:source.estimates},
  ...['K','1','2','3'].map(grade=>({name:`Grade ${grade}`,conditions:[relation(registry['property/grades'],registry[`grade/${grade}`])],expected:source.estimates.filter((r:any)=>r.grade===grade)})),
  ...['small','aide'].map(arm=>({name:`Arm ${arm}`,conditions:[relation(registry['property/interventionArms'],registry[`arm/${arm}`])],expected:source.estimates.filter((r:any)=>arm==='small'?r.arm==='small class':r.arm!=='small class')})),
  {name:'Grade 1, small class',conditions:[relation(registry['property/grades'],registry['grade/1']),relation(registry['property/interventionArms'],registry['arm/small'])],expected:source.estimates.filter((r:any)=>r.grade==='1'&&r.arm==='small class')}
];
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath:`${root}/star-comparison-query.graphql`,cases:[]};
for(const test of cases){
  const variables={spaceId,filter:{and:[relation(related,registry.study),...test.conditions]}};
  const data=await gql<any>(query,{variables});
  const connection=data.entitiesConnection;
  const expectedIds=test.expected.map((r:any)=>registry[`estimate/${r.key}`]).sort();
  const actualIds=connection.nodes.map((r:any)=>r.id).sort();
  const checks=[!connection.pageInfo.hasNextPage,JSON.stringify(expectedIds)===JSON.stringify(actualIds)];
  for(const node of connection.nodes){
    const row=test.expected.find((r:any)=>registry[`estimate/${r.key}`]===node.id);
    checks.push(!!row,!node.values.pageInfo.hasNextPage,!node.relations.pageInfo.hasNextPage);
    if(!row)continue;
    const v=(property:string)=>node.values.nodes.find((v:any)=>v.propertyId===property);
    checks.push(Number(v(saga['property/estimate'])?.decimal)===row.value,Number(v(saga['property/se'])?.decimal)===row.standardError,Number(v('bf0249bb71924460bfe6b35394ed0781')?.integer)===row.n,v(saga['property/unit'])?.text===source.context.unit);
    checks.push(node.relations.nodes.some((r:any)=>r.typeId===registry['property/comparisonArms']&&r.toEntityId===registry['arm/regular']));
  }
  report.cases.push({name:test.name,variables,expectedIds,actualIds,passed:checks.every(Boolean),data});
}
report.passed=report.cases.every((c:any)=>c.passed);
writeFileSync(`${root}/star-comparison-query-verification.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,cases:report.cases.map(({name,passed,actualIds}:any)=>({name,passed,rows:actualIds.length}))},null,2));
if(!report.passed)process.exitCode=1;
