import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='school-finance-jjp-remaining',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read('school-finance-jjp-model'),extraction=read('school-finance-jjp-extraction'),source=read('school-finance-jjp-transcription'),saga=read('saga-registry'),registry:Record<string,string>=read('school-finance-jjp-registry'),pilot=read('school-finance-jjp-pilot-batch');
const ops:Op[]=[],checks:string[]=[],newEntities:string[]=[];
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const dec=(property:string,value:string)=>({property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}});
function rel(key:string,from:string,type:string,to:string,position?:string){const e=id(`relation-entity/${key}`);ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:e,fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);return e;}
async function create(key:string,name:string,type:string,values:any[],description?:string){const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});check(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===id(key)),`Current identity ${name}`);ops.push(...Ops.entities.update({id:id(key),name,...(description?{description}:{}),values}).ops);rel(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);newEntities.push(id(key));}
check(read('school-finance-jjp-pilot-index-verification').passed,'Pilot fully indexed');
check(hash(readFileSync(source.sourcePdf))===extraction.sourceSha256&&hash(readFileSync(`${root}/school-finance-jjp-transcription.json`))===extraction.transcriptionSha256,'Source fingerprints unchanged');
const propertyTypes=new Map<string,string>([[saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],...['unit','estimand','locator'].map(k=>[saga[`property/${k}`],'Text'] as [string,string]),...[model.populationSummaryProperty,model.outcomeMeasureProperty,model.pValueProperty,SystemIds.MARKDOWN_CONTENT,'396f8c72dfd04b5791ea09c1b9321b2f'].map(p=>[p,'Text'] as [string,string])]);
for(const [p,t] of propertyTypes){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Live datatype ${p}`);}
const format='396f8c72dfd04b5791ea09c1b9321b2f';
for(const p of [saga['property/estimate'],saga['property/se']]){
 const r=await gql<any>('query($id:UUID!,$space:UUID!,$property:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space},propertyId:{is:$property}}){nodes{text}pageInfo{hasNextPage}}}}',{variables:{id:p,space:target.spaceId,property:format}});
 check(!r.entity.values.pageInfo.hasNextPage&&r.entity.values.nodes.every((v:any)=>!v.text||v.text==='precision-unlimited'),'No conflicting numeric units/scale Format');
 ops.push(...Ops.entities.update({id:p,values:[text(format,'precision-unlimited')]}).ops);
}
const methodsId=registry['notes/methods']!,pilotOps=read('school-finance-jjp-pilot-ops');
const old=pilotOps.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===methodsId).set.find((s:any)=>s.property.$bytes===SystemIds.MARKDOWN_CONTENT).value.value;
const state=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:methodsId,space:target.spaceId}});
check(!state.entity.values.pageInfo.hasNextPage&&state.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT&&v.text===old),'Existing methods unchanged');
const coverage='This publication contains all 15 selected preferred coefficients across five outcomes and three childhood-income groups. Cost-model reconciliation remains incomplete.';
const sampleLines=source.outcomes.map((o:any)=>`${o.measure}: ${o.individuals.toLocaleString('en-US')} individuals, ${o.families.toLocaleString('en-US')} childhood families${o.personYears===null?'':`, ${o.personYears.toLocaleString('en-US')} person-year observations`}.`).join('\n\n');
const markdown=`## Coverage\n\n${coverage}\n\n${model.methodsMarkdown}\n\n## Publication\n\n${model.authors.join('; ')}. Quarterly Journal of Economics 131 (2016), 157–218. DOI ${source.doi}.\n\n## Model sample counts\n\n${sampleLines}\n\nThese are model totals, not subgroup-specific sample sizes. An empty p-value field means the table gives no exact value or significance threshold for that coefficient.`;
ops.push(...Ops.entities.update({id:methodsId,values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]}).ops);
const columns=[model.populationSummaryProperty,saga['property/estimate'],saga['property/se'],model.pValueProperty,saga['property/unit'],saga['property/locator']];let previousBlock='a0';
for(const outcome of source.outcomes){
 const table=id(`table/${outcome.key}`);
 if(outcome.key!=='education-years'){
  await create(`table/${outcome.key}`,`${outcome.measure}: preferred school-spending coefficients`,SystemIds.DATA_BLOCK,[]);
  rel(`table/${outcome.key}/source`,table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const position=Position.generateBetween(previousBlock,'a1');previousBlock=position;
  const attachment=rel(`dataset/table/${outcome.key}`,registry.dataset!,SystemIds.BLOCKS,table,position);rel(`table/${outcome.key}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  let last:string|null=null;for(const [i,p] of columns.entries()){const pos=Position.generateBetween(last,null);last=pos;rel(`table/${outcome.key}/column/${i}`,attachment,SystemIds.PROPERTIES,p,pos);}
 }
 let rowPosition:string|null=outcome.key==='education-years'?'a0':null;
 for(const row of extraction.records.filter((r:any)=>r.key.startsWith(outcome.key+'/')&&r.key!==model.pilotKey)){
  const i=source.groups.indexOf(row.group);check(row.coefficient===outcome.coefficients[i]&&row.standardError===outcome.standardErrors[i],`Exact source ${row.key}`);
  const values=[dec(saga['property/estimate'],row.coefficient),dec(saga['property/se'],row.standardError),text(model.populationSummaryProperty,model.groups[row.group]),text(model.outcomeMeasureProperty,row.measure),text(saga['property/unit'],row.unit),text(saga['property/estimand'],source.specification),text(saga['property/locator'],`Table ${row.table}, column ${row.column}; printed p. ${row.printedPage} (PDF p. ${row.pdfPage})`),...(row.pThreshold?[text(model.pValueProperty,row.pThreshold)]:[])];
  const key=`estimate/${row.key}`;await create(key,`School-finance reforms: ${row.measure} (${row.group}, preferred IV)`,'96f859efa1ca4b229372c86ad58b694b',values,'Preferred instrumental-variable coefficient on school-age log per-pupil spending. Interpret with the reported unit, population and clustered standard error.');
  rel(`${key}/source`,id(key),'49c5d5e1679a4dbdbfd33f618f227c94',registry.paper!);rel(`${key}/study`,id(key),'dfa6aebe1ca94bf29faccc4cc7afb24c',registry.study!);rel(`${key}/entry`,registry.dataset!,saga['property/entries'],id(key));rowPosition=Position.generateBetween(rowPosition,null);rel(`${key}/item`,table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,id(key),rowPosition);
 }
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=hash(bytes),encoded=JSON.parse(bytes);
check(newEntities.length===18,'14 estimates and four additional tables');
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions');
for(const entityId of newEntities)check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===entityId&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Every new entity typed');
const batch={name:'Complete preferred school-finance coefficients and preserve numeric precision',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:registry.dataset,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/school-finance-jjp-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
