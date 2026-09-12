import {readFileSync,writeFileSync} from 'node:fs';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const registry=read('saga-later-registry'),saga=read('saga-registry'),model=read('saga-later-model'),schema=read('saga-pooled-model'),source=read('saga-later-transcription');
const query=readFileSync(`${root}/saga-pooled-query.graphql`,'utf8'),checks:any[]=[],nodes:any[]=[];
const check=(pass:boolean,label:string)=>{checks.push({label,pass});if(!pass)throw new Error(label);};
let after:string|null=null,pages=0;const cursors=new Set<string>();
do{
 const data:any=await gql<any>(query,{variables:{table:registry.table,space:target.spaceId,items:SystemIds.COLLECTION_ITEM_RELATION_TYPE,after}});const p=data.relationsConnection;nodes.push(...p.nodes);pages++;
 if(p.pageInfo.hasNextPage){check(!!p.pageInfo.endCursor&&!cursors.has(p.pageInfo.endCursor),'Unique table cursor');cursors.add(p.pageInfo.endCursor);after=p.pageInfo.endCursor;}else after=null;
}while(after);
check(nodes.length===16,'All sixteen table entries');
for(const study of source.studies)for(const row of study.rows)for(const estimand of ['itt','tot']){
 const key=`s${study.study}/appendix-t5/${row.key}/${estimand}`,id=registry[`estimate/${key}`];const matches=nodes.filter(n=>n.toEntityId===id);check(matches.length===1,`Unique source record ${key}`);
 const e=matches[0].toEntity;check(!e.values.pageInfo.hasNextPage&&!e.relations.pageInfo.hasNextPage,`Complete facts ${key}`);
 const value=(p:string,f:string)=>e.values.nodes.find((v:any)=>v.propertyId===p)?.[f],cells=Object.fromEntries(source.columns.map((c:string,i:number)=>[c,row.values[i]]));
 for(const [p,expected,f] of [[saga['property/estimate'],cells[estimand],'decimal'],[saga['property/se'],cells[`${estimand}SE`],'decimal'],[schema.sampleProperty,cells.N,'integer'],[saga['property/study'],study.study,'integer']])check(Number(value(p as string,f as string))===Number(expected),`Source numeric ${key}/${p}`);
 check(value(schema.outcomeProperty,'text')===row.label&&value(saga['property/unit'],'text')===row.unit,`Source outcome/unit ${key}`);
 check(value(saga['property/estimand'],'text')===estimand.toUpperCase(),`Estimand ${key}`);
 check(value(saga['property/followup'],'text')===model.followup[row.key],`Qualified follow-up ${key}`);
 check(value(saga['property/locator'],'text')==='Appendix Table 5; printed p. A-12 (PDF p. 13)',`Correct appendix locator ${key}`);
 check(value(schema.factualProperty,'boolean')===true,`Factual Claim ${key}`);
 const related=e.relations.nodes.filter((r:any)=>r.typeId===schema.relatedProperty).map((r:any)=>r.toEntityId),counterpart=registry[`estimate/s${study.study}/appendix-t5/${row.key}/${estimand==='itt'?'tot':'itt'}`];
 check(related.length===2&&related.includes(model.studyIds[study.study])&&related.includes(counterpart),`Only own trial and alternate estimand ${key}`);
 check(!related.includes(model.studyIds[study.study===1?2:1]),`Not assigned to other trial ${key}`);
 check(e.relations.nodes.some((r:any)=>r.typeId===schema.sourceProperty&&r.toEntityId===model.articleId),`Original Article ${key}`);
}
writeFileSync(`${root}/saga-later-query-verification.json`,JSON.stringify({checkedAt:new Date().toISOString(),passed:true,queryFile:'saga-pooled-query.graphql',tableId:registry.table,pages,checks,nodes,scope:'All 16 later records directly reconciled to appendix transcription and qualified follow-up; correct own-trial and alternate-estimand links'},null,2)+'\n');
console.log(JSON.stringify({passed:true,checks:checks.length,pages,records:nodes.length}));
