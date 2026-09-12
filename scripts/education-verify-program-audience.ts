import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const registry=read('reading-first-registry'),star=read('star-experimental-registry'),spaceId=EDUCATION_PUBLICATION.spaceId;
const query=readFileSync(`${root}/program-audience-query.graphql`,'utf8'),typeId='9ba04d040e6bed81dc2ebd593e8cd0e7';
const relation=(type:string,to:string)=>({relations:{some:{spaceId:{is:spaceId},typeId:{is:type},toEntityId:{is:to}}}});
const audience=relation('07546da1a8a04c0d8e0dac5351dcb25b','561872867e1b4b80a5f37ddeb27570b5');
const administrator=relation('d1c6034425684b4caaf2570bee562802',registry['agency/oese']);
const topicModel=read('reading-first-topics-model');
const cases=[{name:'Program linked to evaluation',conditions:[],expected:[registry.program]},
 {name:'Children audience',conditions:[audience],expected:[registry.program]},
 ...['K','1','2','3'].map(g=>({name:`Program intended grade ${g}`,conditions:[audience,relation(star['property/grades'],star[`grade/${g}`])],expected:[registry.program]})),
 {name:'Program without children audience is absent',conditions:[{not:audience}],expected:[]},
 {name:'OESE administrator',conditions:[administrator],expected:[registry.program]},
 {name:'OESE and Children and Kindergarten',conditions:[administrator,audience,relation(star['property/grades'],star['grade/K'])],expected:[registry.program]},
 {name:'Program excluding OESE is absent',conditions:[{not:administrator}],expected:[]},
 {name:'Study is not the administering agency',conditions:[relation('d1c6034425684b4caaf2570bee562802',registry.study)],expected:[]},
 ...topicModel.topics.map((t:any)=>({name:`Topic: ${t.name}`,conditions:[relation(topicModel.propertyId,t.id)],expected:[registry.program]})),
 {name:'All selected literacy topics with OESE and grade 1',conditions:[administrator,audience,relation(star['property/grades'],star['grade/1']),...topicModel.topics.map((t:any)=>relation(topicModel.propertyId,t.id))],expected:[registry.program]},
 {name:'Program excluding literacy topic is absent',conditions:[{not:relation(topicModel.propertyId,topicModel.topics[0].id)}],expected:[]}];
const report:any={checkedAt:new Date().toISOString(),spaceId,queryPath:`${root}/program-audience-query.graphql`,scope:'Reading First grant-program audience, grade, topic and historical administrator filters; not actual exposure, all programs, or student study outcomes',cases:[]};
for(const test of cases){
 const filter={and:[relation('dfa6aebe1ca94bf29faccc4cc7afb24c',registry.study),...test.conditions]};
 const result:any={name:test.name,variables:{spaceId,typeId,filter},pages:[],checks:[]};
 try{let after:string|null=null;const nodes:any[]=[];
  while(true){const data:any=await gql<any>(query,{variables:{spaceId,typeId,filter,after}}),page=data.entitiesConnection;result.pages.push(page);nodes.push(...page.nodes);if(!page.pageInfo.hasNextPage)break;if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||result.pages.length>20)throw new Error('Incomplete pagination');after=page.pageInfo.endCursor;}
  result.ids=nodes.map(n=>n.id).sort();result.checks.push(JSON.stringify(result.ids)===JSON.stringify([...test.expected].sort()));
  for(const node of nodes){result.checks.push(!node.relations.pageInfo.hasNextPage);const rels=node.relations.nodes;
   result.checks.push(rels.some((r:any)=>r.typeId==='07546da1a8a04c0d8e0dac5351dcb25b'&&r.toEntityId==='561872867e1b4b80a5f37ddeb27570b5'));
   const grades=rels.filter((r:any)=>r.typeId===star['property/grades']).sort((a:any,b:any)=>a.position<b.position?-1:a.position>b.position?1:0).map((r:any)=>r.toEntityId);
   result.checks.push(JSON.stringify(grades)===JSON.stringify(['K','1','2','3'].map(g=>star[`grade/${g}`])));
   for(const to of [registry.study,registry.dataset])result.checks.push(rels.some((r:any)=>r.typeId==='dfa6aebe1ca94bf29faccc4cc7afb24c'&&r.toEntityId===to));
   for(const to of [registry.paper,registry['source/src-014'],registry['source/ed-guide-2008']])result.checks.push(rels.some((r:any)=>r.typeId==='49c5d5e1679a4dbdbfd33f618f227c94'&&r.toEntityId===to));
   result.checks.push(rels.some((r:any)=>r.typeId==='d1c6034425684b4caaf2570bee562802'&&r.toEntityId===registry['agency/oese']));
   for(const t of topicModel.topics)result.checks.push(rels.some((r:any)=>r.typeId===topicModel.propertyId&&r.toEntityId===t.id));
  }result.passed=result.checks.every(Boolean);
 }catch(error:any){result.passed=false;result.error=error.message;}
 report.cases.push(result);writeFileSync(`${root}/program-audience-query-verification.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({name:test.name,passed:result.passed,rows:result.ids?.length,error:result.error}));
}
report.passed=report.cases.every((c:any)=>c.passed);writeFileSync(`${root}/program-audience-query-verification.json`,JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
