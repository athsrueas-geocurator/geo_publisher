import {readFileSync,writeFileSync} from 'node:fs';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const registry=read('saga-pooled-registry'),saga=read('saga-registry'),model=read('saga-pooled-model'),source=read('saga-pooled-transcription');
const query=readFileSync(`${root}/saga-pooled-query.graphql`,'utf8'),checks:any[]=[],tables:any[]=[];
const check=(pass:boolean,label:string)=>{checks.push({label,pass});if(!pass)throw new Error(label);};
const collected:any[]=[];
for(const table of source.tables){
 const nodes:any[]=[];let after:string|null=null,pages=0;const cursors=new Set<string>();
 do{
  const response:any=await gql<any>(query,{variables:{table:registry[`table/${table.table}`],space:target.spaceId,items:SystemIds.COLLECTION_ITEM_RELATION_TYPE,after}});
  const page=response.relationsConnection;nodes.push(...page.nodes);pages++;
  if(page.pageInfo.hasNextPage){check(!!page.pageInfo.endCursor&&!cursors.has(page.pageInfo.endCursor),'Unique table cursor');cursors.add(page.pageInfo.endCursor);after=page.pageInfo.endCursor;}else after=null;
 }while(after);
 check(nodes.length===table.rows.length*2,`Table ${table.table}: complete source coverage`);
 for(const row of table.rows)for(const estimand of ['itt','tot']){
  const key=`pooled/t${table.table}/${row.key}/${estimand}`,id=registry[`estimate/${key}`];
  const matches=nodes.filter(n=>n.toEntityId===id);check(matches.length===1,`Exactly one table entry ${key}`);
  const entity=matches[0].toEntity;check(!entity.values.pageInfo.hasNextPage&&!entity.relations.pageInfo.hasNextPage,`Complete Claim facts ${key}`);
  const values=entity.values.nodes,rels=entity.relations.nodes;
  const value=(p:string,field:string)=>values.find((v:any)=>v.propertyId===p)?.[field];
  const cells=Object.fromEntries(source.columns.map((c:string,i:number)=>[c,row.values[i]]));
  for(const [p,expected,field] of [[saga['property/estimate'],cells[estimand],'decimal'],[saga['property/se'],cells[`${estimand}SE`],'decimal'],[model.sampleProperty,cells.N,'integer']])check(Number(value(p as string,field as string))===Number(expected),`Source numeric ${key}/${p}`);
  check(value(model.outcomeProperty,'text')===row.label,`Source outcome ${key}`);
  check(value(saga['property/estimand'],'text')===estimand.toUpperCase(),`Estimand ${key}`);
  check(value(saga['property/unit'],'text')===(row.unit??undefined),`Known or absent unit ${key}`);
  check(value(saga['property/study'],'integer')===undefined,`No fabricated single-trial number ${key}`);
  check(value(model.factualProperty,'boolean')===true,`Factual classification ${key}`);
  const related=rels.filter((r:any)=>r.typeId===model.relatedProperty).map((r:any)=>r.toEntityId);
  const counterpart=registry[`estimate/pooled/t${table.table}/${row.key}/${estimand==='itt'?'tot':'itt'}`];
  check(related.length===3&&[...model.studyIds,counterpart].every((id:string)=>related.includes(id)),`Two trials and alternate estimand ${key}`);
  check(rels.some((r:any)=>r.typeId===model.sourceProperty&&r.toEntityId===model.articleId),`Original article ${key}`);
  collected.push({key,id,sourceRowKey:`pooled/t${table.table}/${row.key}`,studyIds:model.studyIds});
 }
 tables.push({table:table.table,pages,nodes});
}
check(new Set(collected.map(r=>r.id)).size===38,'38 distinct representations');
check(new Set(collected.map(r=>r.sourceRowKey)).size===19,'19 shared source contrasts');
check(new Set(collected.flatMap(r=>r.studyIds)).size===2,'Two underlying trials, not 38 studies');
const report={checkedAt:new Date().toISOString(),passed:true,scope:'Complete pooled tables reconciled independently to transcription, typed values, two existing trials, reciprocal estimands, citations and factual classification',checks,tables,records:collected};
writeFileSync(`${root}/saga-pooled-query-verification.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:true,checks:checks.length,tables:tables.map(t=>({table:t.table,pages:t.pages,rows:t.nodes.length})),representations:38,contrasts:19,trials:2}));
