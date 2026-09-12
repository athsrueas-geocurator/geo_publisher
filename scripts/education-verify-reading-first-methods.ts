import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education';
const model=JSON.parse(readFileSync(`${root}/reading-first-method-model.json`,'utf8'));
const registry=JSON.parse(readFileSync(`${root}/reading-first-methods-registry.json`,'utf8'));
const space='dac259bad48a11adf97fe36857d85206';
const report:any={checkedAt:new Date().toISOString(),scope:'Reading First design-component filters and source-scoped relation metadata, not whole-study randomized classification',cases:[]};
const has=(to:string)=>({relations:{some:{spaceId:{is:space},typeId:{is:model.designProperty},toEntityId:{is:to}}}});
const query=`query($space:UUID!,$filter:EntityFilter!){entitiesConnection(spaceId:$space,first:10,filter:$filter){nodes{id name relations(first:10,filter:{spaceId:{is:$space},typeId:{is:"${model.designProperty}"}}){nodes{entityId toEntityId}pageInfo{hasNextPage}}}pageInfo{hasNextPage}}}`;
for(const [name,conditions,expected] of [
 ['Contains randomized component',[has(model.randomizedTrialId)],1],
 ['Contains regression discontinuity component',[has(registry['regression-discontinuity'])],1],
 ['Contains both design components',[has(model.randomizedTrialId),has(registry['regression-discontinuity'])],1],
 ['Excludes randomized component',[{not:has(model.randomizedTrialId)}],0]
] as const){
 const data:any=await gql(query,{variables:{space,filter:{and:[{id:{is:model.studyId}},...conditions]}}});
 const page=data.entitiesConnection;
 const pass=!page.pageInfo.hasNextPage&&page.nodes.length===expected&&page.nodes.every((n:any)=>n.id===model.studyId&&!n.relations.pageInfo.hasNextPage&&n.relations.nodes.length===2);
 report.cases.push({name,pass,data});
}
for(const key of ['randomized','regression']){
 const entityId=registry[`study/${key}/entity`];
 const data:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:20,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:20,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space}});
 const e=data.entity;
 const pass=!!e&&!e.values.pageInfo.hasNextPage&&!e.relations.pageInfo.hasNextPage&&e.values.nodes.some((v:any)=>v.propertyId==='9b1f76ff9711404c861e59dc3fa7d037'&&v.text===model.relationScopes[key])&&e.relations.nodes.some((r:any)=>r.typeId==='49c5d5e1679a4dbdbfd33f618f227c94'&&r.toEntityId===model.articleId);
 report.cases.push({name:`${key} scope and citation on relation entity`,entityId,pass,data});
}
report.passed=report.cases.every((c:any)=>c.pass);
writeFileSync(`${root}/reading-first-methods-query-verification.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,cases:report.cases.map(({name,pass}:any)=>({name,pass}))},null,2));
if(!report.passed)process.exitCode=1;
