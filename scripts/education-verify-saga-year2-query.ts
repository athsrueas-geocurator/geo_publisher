import {readFileSync,writeFileSync} from 'node:fs';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const registry=read('saga-year2-registry'),saga=read('saga-registry'),model=read('saga-year2-model'),schema=read('saga-pooled-model'),source=read('saga-year2-transcription');
const query=readFileSync(`${root}/saga-pooled-query.graphql`,'utf8'),checks:any[]=[],tables:any[]=[];
const check=(pass:boolean,label:string)=>{checks.push({label,pass});if(!pass)throw new Error(label);};
const specs=['effect','perYear','persistentBound','twoYearBound'];
for(const [groupIndex,group] of model.groups.entries()){
 const nodes:any[]=[];let after:string|null=null;const cursors=new Set<string>();
 do{const data:any=await gql<any>(query,{variables:{table:registry[`table/${groupIndex}`],space:target.spaceId,items:SystemIds.COLLECTION_ITEM_RELATION_TYPE,after}});const p=data.relationsConnection;nodes.push(...p.nodes);if(p.pageInfo.hasNextPage){check(!!p.pageInfo.endCursor&&!cursors.has(p.pageInfo.endCursor),'Cursor advances');cursors.add(p.pageInfo.endCursor);after=p.pageInfo.endCursor;}else after=null;}while(after);
 check(nodes.length===group.count,`Complete ${group.kind}`);
 const rows=groupIndex===0?source.firstStage:source.outcomes,columns=groupIndex===0?source.firstStageColumns:source.outcomeColumns,spec=specs[groupIndex];
 for(const row of rows){
  const key=`s1/t6/${groupIndex===0?'A':'B'}/${row.key}/${spec}`,id=registry[`statistic/${key}`],matches=nodes.filter(n=>n.toEntityId===id);check(matches.length===1,`Unique source statistic ${key}`);
  const e=matches[0].toEntity;check(!e.values.pageInfo.hasNextPage&&!e.relations.pageInfo.hasNextPage,`Complete facts ${key}`);const value=(p:string,f:string)=>e.values.nodes.find((v:any)=>v.propertyId===p)?.[f];
  const cells=Object.fromEntries(columns.map((c:string,i:number)=>[c,row.values[i]])),property=groupIndex>=2?registry['property/bound']:saga['property/estimate'];
  check(Number(value(property,'decimal'))===Number(cells[spec!]),`Exact signed source value ${key}`);
  check(Number(value(saga['property/se'],'decimal'))===Number(cells[groupIndex===0?'SE':`${spec}SE`]),`Source SE ${key}`);
  check(Number(value(schema.sampleProperty,'integer'))===Number(cells.N),`Source N ${key}`);
  check(value(schema.outcomeProperty,'text')===row.label&&value(saga['property/unit'],'text')===row.unit,`Source outcome/unit ${key}`);
  check(value(saga['property/estimand'],'text')===group.estimand,`Distinct estimand ${key}`);
  check(value(saga['property/followup'],'text')==='Second postrandomization school year',`Follow-up ${key}`);
  check(value(schema.factualProperty,'boolean')===true&&Number(value(saga['property/study'],'integer'))===1,`Factual Study 1 ${key}`);
  check(e.relations.nodes.some((r:any)=>r.typeId===schema.relatedProperty&&r.toEntityId===model.studyId)&&e.relations.nodes.some((r:any)=>r.typeId===schema.sourceProperty&&r.toEntityId===model.articleId),`Trial and source ${key}`);
  check(value('60e8b11660d04c94b1e1ebe4321bedcf','decimal')===undefined&&value('2b6e1e8fa3324dc08e9b9051f3dee669','decimal')===undefined,`No fabricated CI ${key}`);
  check(value(groupIndex>=2?saga['property/estimate']:registry['property/bound'],'decimal')===undefined,`Exclusive value semantics ${key}`);
  if(groupIndex>0)check(value(SystemIds.DESCRIPTION_PROPERTY,'text').includes(`FDR q=${cells[`${spec}Q`]}`),`Specification-specific q ${key}`);
 }
 tables.push({kind:group.kind,tableId:registry[`table/${groupIndex}`],nodes});
}
const all=tables.flatMap(t=>t.nodes),effectNodes=all.filter(n=>n.toEntity.values.nodes.some((v:any)=>v.propertyId===saga['property/estimate']));
check(effectNodes.length===7,'Only three first stages and four per-year effects have Effect estimate value');
check(all.length===15&&new Set(all.map(n=>n.toEntityId)).size===15,'Fifteen distinct statistics');
const property:any=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:registry['property/bound']}});check(property.property?.dataTypeName==='Decimal','Bound property remains Decimal');
writeFileSync(`${root}/saga-year2-query-verification.json`,JSON.stringify({checkedAt:new Date().toISOString(),passed:true,checks,tables,scope:'All 15 source statistics and all four kinds; bound/effect/CI exclusion, signed values and specification-specific q-values'},null,2)+'\n');console.log(JSON.stringify({passed:true,checks:checks.length,statistics:15,groups:tables.length}));
