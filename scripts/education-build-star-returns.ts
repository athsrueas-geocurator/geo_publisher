import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',remaining=process.argv.includes('--remaining');
const prefix=`star-returns-${remaining?'remaining':'pilot'}`;
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Journal exists: preserve and reconcile the submitted payload');
const source=JSON.parse(readFileSync(`${root}/star-economic-extraction.json`,'utf8'));
const economic=JSON.parse(readFileSync(`${root}/star-economic-registry.json`,'utf8'));
const saga=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const registryPath=`${root}/star-returns-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[];
const assert=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const decimal=(property:string,value:number)=>{const digits=(String(value).split('.')[1]??'').length;return {property,type:'decimal' as const,exponent:-digits,mantissa:{type:'i64' as const,value:BigInt(Math.round(value*10**digits))}};};
const format='396f8c72dfd04b5791ea09c1b9321b2f',sources='49c5d5e1679a4dbdbfd33f618f227c94',claim='96f859efa1ca4b229372c86ad58b694b';
function relation(key:string,from:string,type:string,to:string,position?:string){
  registry[`position/${key}`]??=position??Position.generate();
  const entityId=id(`relation-entity/${key}`);
  ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;
}
async function entity(entityId:string){return (await gql<any>('query($id:UUID!){entity(id:$id){id name spaceIds values(first:40){nodes{propertyId text spaceId}pageInfo{hasNextPage}}relations(first:60){nodes{typeId toEntityId spaceId position}pageInfo{hasNextPage}}}}',{variables:{id:entityId}})).entity;}
assert(source.internalRatesOfReturn.length===3&&source.publicationGates.numericExtraction.startsWith('visually verified'),'Three source-extracted Table 5 returns');
for(const [property,datatype] of [[economic['property/irr'],SystemIds.DECIMAL],[economic['property/growth'],SystemIds.DECIMAL],[saga['property/locator'],SystemIds.TEXT],[saga['property/followup'],SystemIds.TEXT],[saga['property/priceYear'],SystemIds.INTEGER],[format,SystemIds.TEXT],[SystemIds.MARKDOWN_CONTENT,SystemIds.TEXT],[sources,SystemIds.RELATION],[saga['property/entries'],SystemIds.RELATION]]){
  const e=await entity(property!);
  assert(e&&!e.relations.pageInfo.hasNextPage&&e.relations.nodes.some((r:any)=>r.typeId===SystemIds.DATA_TYPE&&r.toEntityId===datatype),`Datatype ${property}`);
  if(property===economic['property/irr']||property===economic['property/growth'])assert(!e.values.pageInfo.hasNextPage&&e.values.nodes.some((v:any)=>v.spaceId===EDUCATION_PUBLICATION.spaceId&&v.propertyId===format&&v.text==='measure-unit/percent scale/100 precision-unlimited'),`Fraction format ${property}`);
}
const dataset=await entity(economic.dataset);
assert(dataset?.spaceIds.includes(EDUCATION_PUBLICATION.spaceId)&&!dataset.relations.pageInfo.hasNextPage,'Existing destination dataset and complete block read');
if(remaining){
  assert(JSON.parse(readFileSync(`${root}/star-returns-pilot-index-verification.json`,'utf8')).passed===true,'Pilot API verification');
  assert(JSON.parse(readFileSync(`${root}/star-returns-pilot-visual.json`,'utf8')).passed===true,'Pilot rendered verification');
}
const table=id('table');
if(!remaining){
  const used=await gql<any>('query($id:UUID!){valuesConnection(first:20,filter:{propertyId:{is:$id}}){nodes{entity{id name}}pageInfo{hasNextPage}}}',{variables:{id:economic['property/irr']}});
  assert(!used.valuesConnection.pageInfo.hasNextPage&&used.valuesConnection.nodes.length===0,'No previously published IRR values to duplicate');
  ops.push(...Ops.entities.update({id:saga['property/priceYear'],values:[text(format,'group-off precision-integer')]}).ops);
  ops.push(...Ops.entities.update({id:table,name:'Modeled real returns by wage-growth assumption'}).ops);
  relation('table/type',table,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);
  relation('table/source',table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const blocks=dataset.relations.nodes.filter((r:any)=>r.spaceId===EDUCATION_PUBLICATION.spaceId&&r.typeId===SystemIds.BLOCKS).sort((a:any,b:any)=>a.position<b.position?-1:a.position>b.position?1:0);
  const prior=blocks.find((r:any)=>r.toEntityId===economic.block);
  assert(prior?.position,'Existing scenario table position');
  const next=blocks.find((r:any)=>r.position>prior.position)?.position??null;
  const tablePosition=Position.generateBetween(prior.position,next);
  const attachment=relation('dataset/table',economic.dataset,SystemIds.BLOCKS,table,tablePosition);
  relation('table/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  [economic['property/growth'],economic['property/irr'],saga['property/locator']].forEach((p,i)=>relation(`column/${i}`,attachment,SystemIds.PROPERTIES,p,`a${i}`));
  const notes=id('notes');
  const markdown=`## Interpreting the return estimates\n\nThese are modeled annual real internal rates of return for ${source.context.modeledPopulation}, not observed investment returns or independent studies. The rate equates discounted modeled class-size costs with projected earnings benefits over ages ${source.context.earningsAgeStart}–${source.context.earningsAgeEnd}.\n\nThe three rows vary annual real wage growth. They share the economic model and assumptions described below; they are not confidence bounds. Rates are dimensionless and do not require a currency symbol.\n\nSource: [${source.source.title}](${source.source.readableCopy}), ${source.source.tableLocator}, Internal Rate of Return row; methods ${source.source.methodsLocator}.`;
  ops.push(...Ops.entities.update({id:notes,values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]}).ops);
  relation('notes/type',notes,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
  relation('dataset/notes',economic.dataset,SystemIds.BLOCKS,notes,Position.generateBetween(tablePosition,next));
}
const selected:any[]=[];
for(const [index,row] of source.internalRatesOfReturn.entries()){
  if(remaining?index===0:index!==0)continue;
  const entityId=id(`return/${row.annualWageGrowth}`),name=`STAR modeled real return: ${row.annualWageGrowth*100}% annual wage growth`;
  const found=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name}});
  assert(!found.entitiesConnection.pageInfo.hasNextPage&&found.entitiesConnection.nodes.every((n:any)=>n.id===entityId),`Cross-space return identity ${name}`);
  ops.push(...Ops.entities.update({id:entityId,name,description:'A modeled annual real internal rate of return on early-grade class-size reduction. Interpret it with the wage-growth assumption and the shared economic-model limitations.',values:[decimal(economic['property/growth'],row.annualWageGrowth),decimal(economic['property/irr'],row.realAnnualIRR),text(saga['property/locator'],`${source.source.tableLocator}; Internal Rate of Return row`),text(saga['property/followup'],`Projected earnings ages ${source.context.earningsAgeStart}–${source.context.earningsAgeEnd}`)]}).ops);
  relation(`return/${index}/type`,entityId,SystemIds.TYPES_PROPERTY,claim);relation(`return/${index}/source`,entityId,sources,economic.paper);
  relation(`return/${index}/entry`,economic.dataset,saga['property/entries'],entityId);relation(`return/${index}/item`,table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,entityId,`a${index}`);
  selected.push({...row,id:entityId});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes),sha256=createHash('sha256').update(bytes).digest('hex');
for(const row of selected){
  const sets=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===row.id).set;
  for(const [p,n] of [[economic['property/growth'],row.annualWageGrowth],[economic['property/irr'],row.realAnnualIRR]] as [string,number][]){const v=sets.find((s:any)=>s.property.$bytes===p).value;assert(Math.abs(Number(v.mantissa.value.$bigint)*10**v.exponent-n)<1e-10,`Source-to-SDK rate ${row.id}/${p}`);}
}
for(const o of encoded){
  assert(['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length,'No deletion or unset');
  if(o.type==='updateEntity'&&o.id.$bytes!==saga['property/priceYear'])assert(encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===o.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),`Typed entity ${o.id.$bytes}`);
}
const batch={name:remaining?'Complete STAR modeled internal-return estimates':'Add first STAR modeled internal return and correct price-year formatting',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,selected,datasetId:economic.dataset,blockId:table,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,registry:registryPath};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
