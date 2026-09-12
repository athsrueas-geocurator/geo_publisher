import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='school-finance-jjp-pilot',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read('school-finance-jjp-model'),extraction=read('school-finance-jjp-extraction'),transcription=read('school-finance-jjp-transcription'),saga=read('saga-registry');
const registryPath=`${root}/school-finance-jjp-registry.json`,registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
const ops:Op[]=[],checks:string[]=[],entities:any[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
function decimal(property:string,value:string){check(/^-?\d+(\.\d+)?$/.test(value),'Plain exact decimal');return {property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}};}
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/${key}`);ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);return entityId;}
async function entity(key:string,name:string,type:string,description?:string,values:any[]=[]){
 const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});
 check(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===id(key)),`Current all-space identity ${name}`);
 if(description)check(description.length<=350,`Short description ${name}`);
 ops.push(...Ops.entities.update({id:id(key),name,...(description?{description}:{}),values}).ops);rel(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);entities.push({id:id(key),name,type});
}
check(hash(readFileSync(transcription.sourcePdf))===extraction.sourceSha256,'Reviewed PDF unchanged');
check(hash(readFileSync(`${root}/school-finance-jjp-transcription.json`))===extraction.transcriptionSha256&&extraction.records.length===15,'Reviewed transcription unchanged');
for(const term of ['contains-school-spending','contains-school-finance'])check(read(`discovery/${term}`).complete&&read(`discovery/${term}`).nodes.length===0,`Complete specific study discovery ${term}`);
for(const file of ['manual-0-10-1093-qje-qjv036','manual-1-10-3386-w20847'])check(read(`identifiers/${file}`).probes.every((p:any)=>p.complete&&p.nodes.length===0),`Complete DOI discovery ${file}`);
const datatypes=new Map<string,string>([[saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],...[saga['property/unit'],saga['property/estimand'],saga['property/locator'],model.populationSummaryProperty,model.outcomeMeasureProperty,model.studyDesignProperty,model.pValueProperty,ContentIds.WEB_URL_PROPERTY,SystemIds.MARKDOWN_CONTENT,SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY].map(p=>[p,'Text'] as [string,string]),...[SystemIds.TYPES_PROPERTY,SystemIds.BLOCKS,SystemIds.VIEW_PROPERTY,SystemIds.PROPERTIES,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_ITEM_RELATION_TYPE,saga['property/entries'],'49c5d5e1679a4dbdbfd33f618f227c94','dfa6aebe1ca94bf29faccc4cc7afb24c','95d770021faf4f7cb7deb21a7d48cda0'].map(p=>[p,'Relation'] as [string,string])]);
for(const [p,t] of datatypes){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Live datatype ${p}`);}
const paper=id('paper'),study=id('study'),dataset=id('dataset'),table=id('table/education-years');
await entity('paper',model.paperName,ContentIds.ARTICLE_TYPE,'A study of school-finance reforms, school spending and later educational and economic outcomes. This source is the final 2016 journal article.',[text(ContentIds.WEB_URL_PROPERTY,model.paperUrl)]);
await entity('study',model.studyName,model.studyType,model.studyDescription,[text(model.studyDesignProperty,transcription.specification)]);
await entity('dataset',model.datasetName,'0c4babfb43893486af827341bbf32e09',model.datasetDescription);
for(const key of ['study','dataset']){rel(`${key}/source`,id(key),'49c5d5e1679a4dbdbfd33f618f227c94',paper);rel(`${key}/location`,id(key),'95d770021faf4f7cb7deb21a7d48cda0','0093d90725d94cb08903515673538d40');}
rel('dataset/study',dataset,'dfa6aebe1ca94bf29faccc4cc7afb24c',study);
await entity('notes/methods','School-finance reform estimates: methods and coverage',SystemIds.TEXT_BLOCK,undefined,[text(SystemIds.MARKDOWN_CONTENT,`## Coverage\n\nThis initial publication contains one all-sample education-years coefficient. The remaining 14 selected estimates and cost-model reconciliation are not yet published.\n\n${model.methodsMarkdown}\n\n## Publication\n\n${model.authors.join('; ')}. Quarterly Journal of Economics 131 (2016), 157–218. DOI ${transcription.doi}. The working-paper version has different headline values.\n\n## Sample counts for the first row\n\nTable III reports 15,353 individuals and 4,586 childhood families for the model. These are not subgroup-specific counts.`)]);
rel('dataset/methods',dataset,SystemIds.BLOCKS,id('notes/methods'),'a1');
await entity('table/education-years','Educational attainment: preferred school-spending coefficients',SystemIds.DATA_BLOCK);
rel('table/source',table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
const attachment=rel('dataset/table',dataset,SystemIds.BLOCKS,table,'a0');rel('table/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
const columns=[model.populationSummaryProperty,saga['property/estimate'],saga['property/se'],model.pValueProperty,saga['property/unit'],saga['property/locator']];let last:string|null=null;
for(const [i,p] of columns.entries()){const pos=Position.generateBetween(last,null);last=pos;rel(`table/column/${i}`,attachment,SystemIds.PROPERTIES,p,pos);}
const row=extraction.records.find((r:any)=>r.key===model.pilotKey);check(row?.coefficient==='3.1488'&&row.standardError==='0.7906'&&row.column===3,'Reviewed first coefficient');
await entity(`estimate/${row.key}`,`School-finance reforms: ${row.measure} (${row.group}, preferred IV)`,'96f859efa1ca4b229372c86ad58b694b','Preferred instrumental-variable coefficient on school-age log per-pupil spending. Interpret with the reported unit, population and clustered standard error.',[decimal(saga['property/estimate'],row.coefficient),decimal(saga['property/se'],row.standardError),text(model.populationSummaryProperty,model.groups[row.group]),text(model.outcomeMeasureProperty,row.measure),text(model.pValueProperty,row.pThreshold),text(saga['property/unit'],row.unit),text(saga['property/estimand'],transcription.specification),text(saga['property/locator'],`Table ${row.table}, column ${row.column}; printed p. ${row.printedPage} (PDF p. ${row.pdfPage})`)]);
const estimate=id(`estimate/${row.key}`);rel('estimate/source',estimate,'49c5d5e1679a4dbdbfd33f618f227c94',paper);rel('estimate/study',estimate,'dfa6aebe1ca94bf29faccc4cc7afb24c',study);rel('dataset/estimate',dataset,saga['property/entries'],estimate);rel('table/item',table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,estimate,'a0');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n';const sha256=hash(bytes),encoded=JSON.parse(bytes);
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'Additive operations only');
for(const e of entities)check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===e.id&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Every entity typed');
const batch={name:'Add school-finance reform study and first spending coefficient',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:dataset,studyId:study,paperId:paper,entities,selected:[{key:row.key,id:estimate}],journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
