import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';

const root='data/education',prefix='reading-first-pilot';
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve existing publication journal and payload; reconcile before retrying');
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const source=read('reading-first-extraction'),verified=read('reading-first-extraction-verification'),model=read('reading-first-model');
const saga=read('saga-registry'),star=read('star-experimental-registry');
const registryPath=`${root}/reading-first-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const prop=(key:string)=>id(`property/${key}`);
const ops:Op[]=[],checks:string[]=[],entities:any[]=[];
const assert=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const hash=(bytes:string|Buffer)=>createHash('sha256').update(bytes).digest('hex');
const known={dataset:'0c4babfb43893486af827341bbf32e09',claim:'96f859efa1ca4b229372c86ad58b694b',sources:'49c5d5e1679a4dbdbfd33f618f227c94',related:'dfa6aebe1ca94bf29faccc4cc7afb24c',location:'95d770021faf4f7cb7deb21a7d48cda0',format:'396f8c72dfd04b5791ea09c1b9321b2f'};
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const decimal=(property:string,value:string)=>{
  assert(/^-?\d+(\.\d+)?$/.test(value),`Plain decimal string: ${value}`);
  return {property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}};
};
function relation(key:string,from:string,type:string,to:string,position?:string){
  registry[`position/${key}`]??=position??Position.generate();
  const entityId=id(`relation-entity/${key}`);
  ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);
  return entityId;
}
async function create(entityId:string,name:string,description:string,type:string,values:any[]=[]){
  assert(description.length<=350&&description.split(/(?<=[.!?])\s+(?=[A-Z])/).length<=2,`Concise description: ${name}`);
  const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name}});
  assert(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===entityId),`Exact all-space identity: ${name}`);
  ops.push(...Ops.entities.update({id:entityId,name,description,values}).ops);
  relation(`${entityId}/type`,entityId,SystemIds.TYPES_PROPERTY,type);
  entities.push({id:entityId,name,description,type});
}
function notes(key:string,parent:string,markdown:string,position:string){
  const block=id(`notes/${key}`);
  ops.push(...Ops.entities.update({id:block,values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]}).ops);
  relation(`notes/${key}/type`,block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
  relation(`notes/${key}/attachment`,parent,SystemIds.BLOCKS,block,position);
}
assert(verified.passed&&source.verification.visualChecked&&source.records.length===33,'Source tables reconciled and visually reviewed');
assert(hash(readFileSync('tmp/pdfs/reading-first-2008.pdf'))===verified.pdfSha256&&source.publication.pdfSha256===verified.pdfSha256,'Primary PDF hash matches source verification');
assert(hash(readFileSync(`${root}/reading-first-transcription.json`))===verified.transcriptionSha256,'Transcription hash matches source verification');
const row=source.records.find((r:any)=>r.key===model.pilotKey);
assert(row?.native?.confidenceInterval&&row.grade==='1'&&model.pilotRepresentation==='native','Pilot is native grade-one comprehension with reported CI');
const pvalueSamples=read('reading-first-property-samples');
for(const key of ['pValueString','studyDesignRegistry'])assert(pvalueSamples.properties[key]?.schema?.property?.dataTypeName==='Text'&&pvalueSamples.properties[key]?.uses?.valuesConnection?.nodes?.length>0,`Cross-space semantic usage reviewed: ${key}`);
for(const term of ['contains-reading-first','contains-readingfirst','contains-rfis','contains-2009-4038'])assert(read(`discovery/${term}`).complete===true,`Complete identity search: ${term}`);
const datatypes=new Map<string,string>([
  [saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],
  ...['unit','followup','estimand','locator'].map(k=>[saga[`property/${k}`],'Text'] as [string,string]),
  [model.pValueProperty,'Text'],[model.studyDesignProperty,'Text'],[model.outcomeMeasureProperty,'Text'],
  [ContentIds.WEB_URL_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[known.format,'Text'],
  ...[known.sources,known.related,known.location,saga['property/entries'],star['property/grades'],star['property/interventionArms'],star['property/comparisonArms']].map(p=>[p,'Relation'] as [string,string])
]);
for(const [property,expected] of datatypes){
  const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});
  assert(r.property?.dataTypeName===expected,`Live datatype ${property}: ${expected}`);
}
for(const [entityId,type] of [[model.studyType,SystemIds.SCHEMA_TYPE],[star['type/arm'],SystemIds.SCHEMA_TYPE],[star['grade/1'],'5ef5a5860f274d8e8f6c59ae5b3e89e2']]){
  const r=await gql<any>('query($id:UUID!){entity(id:$id){name spaceIds types{id}}}',{variables:{id:entityId}});
  assert(r.entity?.spaceIds?.length&&r.entity.types.some((t:any)=>t.id===type),`Live reused type/grade identity: ${entityId}`);
}
const dataset=id('dataset'),paper=id('paper'),study=id('study'),table=id('table/achievement');
for(const needle of ['ies.ed.gov/ncee/pubs/20094038','ies.ed.gov/sites/default/files/migrated/nces_pubs/ncee/pdf/20094038.pdf']){
  const r=await gql<any>('query($needle:String!){valuesConnection(first:10,filter:{text:{includesInsensitive:$needle}}){nodes{entity{id}}pageInfo{hasNextPage}}}',{variables:{needle}});
  assert(!r.valuesConnection.pageInfo.hasNextPage&&r.valuesConnection.nodes.every((n:any)=>n.entity.id===paper),`All-space source URL identity: ${needle}`);
}
for(const p of model.newProperties){
  await create(prop(p.key),p.name,p.description,SystemIds.PROPERTY,p.key==='ciLevel'?[text(known.format,'measure-unit/percent scale/100 precision-unlimited')]:[]);
  relation(`datatype/${p.key}`,prop(p.key),SystemIds.DATA_TYPE,SystemIds.DECIMAL);
}
await create(paper,source.publication.title,'A federal evaluation of Reading First funding, reporting achievement, instruction and implementation findings from 18 US sites.',ContentIds.ARTICLE_TYPE,[text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]);
notes('paper',paper,`## Publication details\n\n${source.publication.authors.join('; ')}. November ${source.publication.year}. ${source.publication.reportNumber}. US Department of Education, Institute of Education Sciences.\n\n${source.publication.citationNote}\n\n[Read the complete report](${source.publication.sourceUrl}). This dataset uses Exhibits 2.1–2.6 and D.1–D.4; it does not reproduce every analysis in the report.`,'a0');
await create(study,model.studyName,'An evaluation of early-reading grants using regression discontinuity in 17 sites and group random assignment in one site.',model.studyType,[text(model.studyDesignProperty,source.context.design)]);
relation('study/source',study,known.sources,paper);relation('study/location',study,known.location,model.countryId);
for(const arm of model.arms){
  await create(id(`arm/${arm.key}`),arm.name,arm.description,star['type/arm']);
  relation(`arm/${arm.key}/study`,id(`arm/${arm.key}`),known.related,study);
  relation(`arm/${arm.key}/source`,id(`arm/${arm.key}`),known.sources,paper);
}
await create(dataset,model.datasetName,model.datasetDescription,known.dataset,[text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]);
relation('dataset/source',dataset,known.sources,paper);relation('dataset/study',dataset,known.related,study);relation('dataset/location',dataset,known.location,model.countryId);
ops.push(...Ops.entities.update({id:table,name:model.tableName}).ops);
relation('table/type',table,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);
relation('table/source',table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
const attachment=relation('dataset/table',dataset,SystemIds.BLOCKS,table,'a0');
relation('table/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
const columns=[star['property/grades'],saga['property/estimate'],saga['property/se'],prop('ciLower'),prop('ciUpper'),prop('ciLevel'),model.pValueProperty,saga['property/unit'],saga['property/locator']];
let last:string|null=null;
for(const [index,p] of columns.entries()){const position=Position.generateBetween(last,null);last=position;relation(`table/column/${index}`,attachment,SystemIds.PROPERTIES,p,position);}
notes('methods',dataset,`## Study design and interpretation\n\n${source.context.design}. ${source.context.estimand} ${source.context.model}\n\nThe final sample contains 248 schools (125 funded and 123 unfunded) in 18 sites across 13 states. This is a school count, not the student N for each estimate. The study sample was selected near local funding cut-points; it is not a nationally representative sample of all schools.\n\nComprehension is measured using SAT 10. Its pooled results cover spring 2005, 2006 and 2007. Decoding uses TOSWRF and was measured only in first grade in spring 2007. Instructional observations and implementation surveys measure distinct outcomes.\n\nWhere available, estimates and uncertainty use Appendix D's reported precision. SEs and confidence bounds share the estimate's unit; the confidence level is stored as 0.95 and displayed as 95%. P-values are two-tailed and retain reported operators. Percentage-point differences are not percentage changes.\n\n${source.limitations.join('\n\n')}\n\n[Source report](${source.publication.sourceUrl}), ${source.context.methodsLocator}.`,'a1');
notes('coverage',dataset,'## Publication coverage\n\nThis initial table contains the grade-one SAT 10 impact in scaled-score points. The reviewed extraction includes 33 outcome contrasts (63 native or standardized representations); the remaining results are not yet published here.\n\nMatched delivery costs and complete program, implementation and measurement-concept links remain unresolved. No cost-effectiveness ranking is supported by this pilot.','a2');
const estimate=id(`estimate/${row.key}/native`),ci=row.native.confidenceInterval;
const numbers:Record<string,string>={
  [saga['property/estimate']]:row.native.value,[saga['property/se']]:row.native.standardError,
  [prop('ciLower')]:ci.lower,[prop('ciUpper')]:ci.upper,[prop('ciLevel')]:ci.level
};
const locator=row.sourceLocations.map((l:any)=>`Exhibit ${l.exhibit}, printed p. ${l.printedPage} (PDF p. ${l.pdfPage})`).join('; ');
const values=[...Object.entries(numbers).map(([p,v])=>decimal(p,v)),
  text(model.pValueProperty,`P ${row.pValue.operator} ${row.pValue.value}`),text(model.outcomeMeasureProperty,`${row.measure} (${row.instrument})`),
  text(saga['property/unit'],row.native.unit),text(saga['property/followup'],row.followup),
  text(saga['property/estimand'],source.context.estimand),text(saga['property/locator'],locator)];
await create(estimate,model.pilotName,model.pilotDescription,known.claim,values);
for(const [key,p,to] of [['grade',star['property/grades'],star[`grade/${row.grade}`]],['arm',star['property/interventionArms'],id('arm/funded')],['comparison',star['property/comparisonArms'],id('arm/comparison')],['study',known.related,study],['source',known.sources,paper],['location',known.location,model.countryId]])relation(`estimate/${row.key}/${key}`,estimate,p,to);
relation(`entry/${row.key}/native`,dataset,saga['property/entries'],estimate);
relation(`table/item/${row.key}/native`,table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,estimate,'a0');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes),sha256=hash(bytes);
assert(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'Additive payload with no deletion/unset');
for(const op of encoded.filter((o:any)=>o.type==='updateEntity'))assert(encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===op.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),`Every new entity typed: ${op.id.$bytes}`);
const sets=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===estimate).set;
for(const [p,value] of Object.entries(numbers)){
  const v=sets.find((s:any)=>s.property.$bytes===p)?.value;
  assert(v?.type==='decimal'&&v.mantissa.value.$bigint===BigInt(value.replace('.','')).toString()&&v.exponent===-(value.split('.')[1]?.length??0),`Exact source-to-SDK decimal: ${p}`);
}
assert(!sets.some((s:any)=>s.property.$bytes==='bf0249bb71924460bfe6b35394ed0781'),'No invented student sample size');
const batch={name:'Add Reading First study and first comprehension impact with confidence interval',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:dataset,paperId:paper,studyId:study,blockId:table,selected:[{id:estimate,key:row.key,representation:'native'}],entities,columns,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,registry:registryPath,sourceHash:hash(readFileSync(`${root}/reading-first-extraction.json`))};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,limitations:model.displayRules},null,2)+'\n');
console.log(JSON.stringify({batch:`${root}/${prefix}-batch.json`,operations:ops.length,checks:checks.length,datasetId:dataset,selected:batch.selected,entities},null,2));
