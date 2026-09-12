import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {sagaClaimCopy} from '../src/education-saga-claim-copy';
const root='data/education',expansion=process.argv.includes('--expansion'),prefix=`saga-outcomes-${expansion?'expansion':'pilot'}`;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8')),hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read('saga-outcomes-model'),extraction=read('saga-outcomes-extraction'),transcription=read('saga-outcomes-transcription'),saga=read('saga-registry'),context=read('saga-context-registry'),contextModel=read('saga-context-model');
const registry:Record<string,string>=existsSync(`${root}/saga-outcomes-registry.json`)?read('saga-outcomes-registry'):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[],created:any[]=[],discovery:any[]=[];
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const text=(property:string,value:string)=>({property,type:'text' as const,value}),integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
function decimal(property:string,value:string){check(/^-?\d+(\.\d+)?$/.test(value),'Exact source decimal');return {property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}};}
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/${key}`);ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);return entityId;}
async function create(key:string,name:string,type:string,description?:string,values:any[]=[]){
 const data=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}',{variables:{name}});
 check(!data.entitiesConnection.pageInfo.hasNextPage&&data.entitiesConnection.nodes.length===0,`Complete all-space new-entity identity ${name}`);discovery.push({name,...data.entitiesConnection});
 check(!description||description.length<=350,`Concise description ${key}`);
 ops.push(...Ops.entities.update({id:id(key),name,...(description?{description}:{}),values}).ops);rel(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);created.push({key,id:id(key),name,type});
}
check(hash(readFileSync(transcription.sourcePdf))===extraction.sourceSha256,'Reviewed final PDF unchanged');
check(hash(readFileSync(`${root}/saga-outcomes-transcription.json`))===extraction.transcriptionSha256&&extraction.records.length===62&&extraction.checks.every((c:any)=>c.allEightColumnsMatch),'All 248 source cells reconciled');
check(read('discovery/contains-saga').complete,'Complete broad all-space Saga discovery; existing outcomes reused');
check(read('saga-outcome-link-discovery').targets.every((t:any)=>t.complete),'Complete all-space source and trial backlink discovery');
if(expansion){check(read('saga-outcomes-pilot-index-verification').passed,'Pilot indexed');check(read('saga-outcomes-pilot-browser-verification').passed,'Pilot rendered');}
const source='49c5d5e1679a4dbdbfd33f618f227c94',related='dfa6aebe1ca94bf29faccc4cc7afb24c',location='95d770021faf4f7cb7deb21a7d48cda0';
const dataset=saga['dataset/saga-chicago-trials'],paper=saga['paper/10.1257/aer.20210434'];
const properties=new Map<string,string>([[saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],[saga['property/study'],'Integer'],[model.sampleProperty,'Integer'],...[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY,SystemIds.MARKDOWN_CONTENT,model.outcomeProperty,contextModel.populationProperty,saga['property/unit'],saga['property/estimand'],saga['property/locator'],saga['property/followup']].map(p=>[p,'Text'] as [string,string]),...[SystemIds.TYPES_PROPERTY,SystemIds.BLOCKS,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_ITEM_RELATION_TYPE,SystemIds.VIEW_PROPERTY,SystemIds.PROPERTIES,source,related,location,saga['property/entries']].map(p=>[p,'Relation'] as [string,string])]);
for(const [p,t] of properties){const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(data.property?.dataTypeName===t,`Live datatype ${p}`);}
for(const type of [model.claimType,SystemIds.DATA_BLOCK,SystemIds.TEXT_BLOCK]){const data=await gql<any>('query($id:UUID!){entity(id:$id){types{id}}}',{variables:{id:type}});check(data.entity?.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),`Existing Type ${type}`);}
const records=extraction.records.filter((r:any)=>expansion?r.key!==model.pilotKey:r.key===model.pilotKey);
const panels=expansion?['B','C','D']:['A'];
for(const panel of panels){
 const key=`table/${panel}`,table=id(key);await create(key,`Saga first-year estimates: ${model.panels[panel]}`,SystemIds.DATA_BLOCK);
 rel(`${key}/source`,table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
 const attachment=rel(`${key}/attachment`,dataset,SystemIds.BLOCKS,table,`b${panel.charCodeAt(0)-65}`);rel(`${key}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
 let last:string|null=null;
 for(const [i,p] of [saga['property/study'],model.outcomeProperty,saga['property/estimand'],saga['property/estimate'],saga['property/se'],model.sampleProperty,saga['property/unit'],saga['property/locator']].entries()){
  const position=Position.generateBetween(last,null);last=position;rel(`${key}/column/${i}`,attachment,SystemIds.PROPERTIES,p,position);
 }
}
for(const r of records){
 const study=context[`study/${r.study}`],cohort=contextModel.studies.find((s:any)=>s.key===String(r.study));
 const key=`estimate/${r.key}`,estimate=r.existingKey?saga[r.existingKey]:id(key);
 const values=[text(model.outcomeProperty,r.measure),text(contextModel.populationProperty,cohort.population)];
 if(r.existingKey){
  registry[key]=estimate;
  const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId decimal integer}pageInfo{hasNextPage}}}}',{variables:{id:estimate,space:target.spaceId}});
  check(!data.entity.values.pageInfo.hasNextPage&&[[saga['property/estimate'],r.value],[saga['property/se'],r.standardError]].every(([p,v])=>data.entity.values.nodes.some((n:any)=>n.propertyId===p&&Number(n.decimal)===Number(v))),`Reuse exact existing estimate ${r.key}`);
  ops.push(...Ops.entities.update({id:estimate,values}).ops);
 }else{
  const copy=sagaClaimCopy(r,read('saga-claim-copy-model'));
  await create(key,copy.name,model.claimType,copy.description,[...values,decimal(saga['property/estimate'],r.value),decimal(saga['property/se'],r.standardError),integer(saga['property/study'],r.study),integer(model.sampleProperty,r.n),text(saga['property/estimand'],r.estimand),text(saga['property/followup'],cohort.followup),text(saga['property/locator'],`Table ${r.table}, panel ${r.panel}; printed p. ${r.printedPage} (PDF p. ${r.pdfPage})`),...(r.unit?[text(saga['property/unit'],r.unit)]:[])]);
  rel(`${key}/source`,estimate,source,paper);rel(`${key}/study`,estimate,related,study);rel(`${key}/location`,estimate,location,contextModel.chicagoId);rel(`${key}/entry`,dataset,saga['property/entries'],estimate);
 }
 const ordinal=extraction.records.findIndex((row:any)=>row.key===r.key);rel(`${key}/item`,id(`table/${r.panel}`),SystemIds.COLLECTION_ITEM_RELATION_TYPE,estimate,`a${String(ordinal).padStart(3,'0')}`);
}
if(expansion){
 await create('notes/outcomes','Saga first-year outcomes: interpretation and coverage',SystemIds.TEXT_BLOCK,undefined,[text(SystemIds.MARKDOWN_CONTENT,model.methodsMarkdown)]);
 rel('notes/outcomes/attachment',dataset,SystemIds.BLOCKS,id('notes/outcomes'),'a9');
 ops.push(...Ops.entities.update({id:dataset,description:model.description,values:[text(saga['property/unit'],'varies by outcome; see individual estimates')]}).ops);
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',encoded=JSON.parse(bytes),sha256=hash(bytes);
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions');
for(const e of created)check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===e.id&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Every created entity typed');
const batch={name:expansion?'Complete Saga first-year academic, attendance, discipline and arrest estimates':'Add a source-verified Saga math GPA estimate',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,records:records.map((r:any)=>({key:r.key,id:registry[`estimate/${r.key}`],existing:!!r.existingKey,unitKnown:!!r.unit}))};
writeFileSync(`${root}/saga-outcomes-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-identity.json`,JSON.stringify(discovery,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,created},null,2)+'\n');console.log(JSON.stringify({prefix,operations:ops.length,records:records.length,created:created.length,checks:checks.length,sha256}));
