import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,Position,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education', full=process.argv.includes('--remaining');
const prefix=full?'star-economic-remaining':'star-economic-pilot';
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('This batch has a publication journal; reconcile it or create a follow-up batch rather than overwrite its payload');
const source=JSON.parse(readFileSync(`${root}/star-economic-extraction.json`,'utf8'));
const saga=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const registryPath=`${root}/star-economic-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[], checks:string[]=[];
const assert=(ok:unknown,msg:string)=>{if(!ok)throw new Error(msg);checks.push(msg);};
const propertySpecs=[
 ['discount','Real discount rate','Annual inflation-adjusted discount rate as a fraction; 0.04 means 4%.'],
 ['growth','Annual real wage growth','Assumed annual inflation-adjusted earnings growth as a fraction; 0.01 means 1%.'],
 ['benefit','Present value of benefits','Discounted monetary benefits; interpret with currency, price year, denominator, discount rate and modeled benefit scope.'],
 ['irr','Real internal rate of return','Annual inflation-adjusted rate equating discounted costs and benefits, expressed as a fraction.']
] as const;
const prop=(key:string)=>id(`property/${key}`);
const existing={dataset:'0c4babfb43893486af827341bbf32e09',claim:'96f859efa1ca4b229372c86ad58b694b',sources:'49c5d5e1679a4dbdbfd33f618f227c94',doi:'7cb59354e30c48119e99ff62fcf61646',currency:'6e7371ca96cb44348f16932f77f55e75'};
const formatProperty='396f8c72dfd04b5791ea09c1b9321b2f';
function relate(key:string,from:string,type:string,to:string,order?:number){
 const entityId=id(`relation-entity/${key}`);
 registry[`position/${key}`]??=order===undefined?Position.generate():`a${order}`;
 ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;
}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
const decimal=(property:string,value:number)=>{const digits=(String(value).split('.')[1]??'').length;return {property,type:'decimal' as const,exponent:-digits,mantissa:{type:'i64' as const,value:BigInt(Math.round(value*10**digits))}};};
async function entity(entityId:string){return (await gql<any>('query($id:UUID!){entity(id:$id){id name spaceIds relations(first:100){nodes{typeId toEntityId spaceId}pageInfo{hasNextPage}}}}',{variables:{id:entityId}})).entity;}
async function checkDatatype(property:string,datatype:string){const e=await entity(property);assert(e&&!e.relations.pageInfo.hasNextPage&&e.relations.nodes.some((r:any)=>r.typeId===SystemIds.DATA_TYPE&&r.toEntityId===datatype),`Live datatype ${property}`);}
assert(source.publicationGates.numericExtraction.startsWith('visually verified'),'Table visually verified');
if(full){
 const visual=JSON.parse(readFileSync(`${root}/star-economic-pilot-visual-verification.json`,'utf8'));
 const indexed=JSON.parse(readFileSync(`${root}/star-economic-pilot-index-verification.json`,'utf8'));
 assert(visual.passed===true&&indexed.checks.every((c:any)=>c.pass),'Pilot visually and API verified');
}
for(const [key,name] of propertySpecs){
 const candidates=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name}});
 assert(!candidates.entitiesConnection.pageInfo.hasNextPage&&candidates.entitiesConnection.nodes.every((n:any)=>n.id===registry[`property/${key}`]),`Property identity ${name}`);
 if(full)await checkDatatype(prop(key),SystemIds.DECIMAL);
}
for(const key of ['cost'])await checkDatatype(saga[`property/${key}`],SystemIds.DECIMAL);
await checkDatatype(saga['property/priceYear'],SystemIds.INTEGER);
await checkDatatype(formatProperty,SystemIds.TEXT);
for(const p of [saga['property/locator'],saga['property/denominator'],saga['property/followup'],existing.currency,existing.doi,ContentIds.WEB_URL_PROPERTY])await checkDatatype(p,SystemIds.TEXT);
const paper=id('paper'),dataset=id('dataset'),block=id('block');
const title='STAR class-size economics: modeled costs and earnings (Krueger, 2003)';
const modelDescription=`Modeled US kindergarten entrants in ${source.context.presentValueBaseYear}; class size ${source.context.regularClassSize} to ${source.context.smallClassSize}, grades K–3, average exposure ${source.context.averageExposureYears} years. Earnings projected over ages ${source.context.earningsAgeStart}–${source.context.earningsAgeEnd}. Assumes ${source.context.mathEffectAssumptionSD} SD each in math and reading, with ${source.context.earningsIncreasePerSubjectSD*100}% earnings per subject SD. These are model inputs, not newly extracted trial effects. ${source.caveats.join(' ')}`;
if(!full){
 const doi=await gql<any>('query($text:String!){valuesConnection(first:10,filter:{text:{includesInsensitive:$text}}){nodes{entity{id}}pageInfo{hasNextPage}}}',{variables:{text:source.source.doi}});
 assert(!doi.valuesConnection.pageInfo.hasNextPage&&doi.valuesConnection.nodes.every((n:any)=>n.entity.id===paper),'No unmatched source DOI');
 for(const [key,name,description] of propertySpecs){ops.push(...Ops.entities.update({id:prop(key),name,description,values:key==='benefit'?[]:[text(formatProperty,'measure-unit/percent scale/100 precision-unlimited')]}).ops);relate(`property/${key}/type`,prop(key),SystemIds.TYPES_PROPERTY,SystemIds.PROPERTY);relate(`property/${key}/datatype`,prop(key),SystemIds.DATA_TYPE,SystemIds.DECIMAL);}
 ops.push(...Ops.entities.update({id:paper,name:source.source.title,description:`${source.source.author}; ${source.source.journal} ${source.source.volume}(${source.source.issue}), ${source.source.pages}, ${source.source.year}. Published article; working paper DOI ${source.source.workingPaperDoi}.`,values:[text(existing.doi,source.source.doi),text(ContentIds.WEB_URL_PROPERTY,source.source.url)]}).ops);
 relate('paper/type',paper,SystemIds.TYPES_PROPERTY,ContentIds.ARTICLE_TYPE);
 ops.push(...Ops.entities.update({id:dataset,name:title,description:modelDescription,values:[text(ContentIds.WEB_URL_PROPERTY,source.source.readableCopy)]}).ops);
 relate('dataset/type',dataset,SystemIds.TYPES_PROPERTY,existing.dataset);relate('dataset/source',dataset,existing.sources,paper);
 ops.push(...Ops.entities.update({id:block,name:'Modeled costs and earnings: sensitivity scenarios'}).ops);
 relate('block/type',block,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);relate('block/source',block,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
 const attachment=relate('dataset/block',dataset,SystemIds.BLOCKS,block);
 relate('block/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
 [prop('discount'),prop('growth'),saga['property/cost'],prop('benefit'),saga['property/priceYear'],existing.currency,saga['property/denominator'],saga['property/locator']].forEach((p,i)=>relate(`column/${i}`,attachment,SystemIds.PROPERTIES,p,i));
}
const selected:any[]=[];
let i=0;
for(const row of source.table5)for(const [growth,benefit] of Object.entries(row.benefitPVByAnnualWageGrowth)){
 const pilot=row.realDiscountRate===0.04&&Number(growth)===0.01;
 if(full?pilot:!pilot){i++;continue;}
 const key=`scenario/${row.realDiscountRate}/${growth}`,scenario=id(key);
 const name=`STAR model: ${row.realDiscountRate*100}% discount, ${Number(growth)*100}% wage growth; $${benefit} earnings versus $${row.costPV} cost.`;
 const values=[decimal(prop('discount'),row.realDiscountRate),decimal(prop('growth'),Number(growth)),decimal(saga['property/cost'],row.costPV),decimal(prop('benefit'),Number(benefit)),integer(saga['property/priceYear'],source.context.priceYear),text(existing.currency,source.context.currency),text(saga['property/denominator'],`${source.context.denominator}; present value of modeled incremental cost`),text(saga['property/locator'],source.source.tableLocator),text(saga['property/followup'],`Projected earnings ages ${source.context.earningsAgeStart}–${source.context.earningsAgeEnd}`)];
 // A source-reported model output is checkable, even though it is not an observed effect.
 ops.push(...Ops.entities.update({id:scenario,name,description:modelDescription,values:[...values,{property:'da4a6c1f9d4446f9832ff3b49a4400ef',type:'boolean',value:true}]}).ops);
 relate(`${key}/type`,scenario,SystemIds.TYPES_PROPERTY,existing.claim);relate(`${key}/source`,scenario,existing.sources,paper);relate(`${key}/entry`,dataset,saga['property/entries'],scenario);relate(`${key}/item`,block,SystemIds.COLLECTION_ITEM_RELATION_TYPE,scenario);
 selected.push({id:scenario,discount:row.realDiscountRate,growth:Number(growth),cost:row.costPV,benefit:Number(benefit)});i++;
}
const serialize=(v:unknown)=>JSON.stringify(v,(_k,x)=>x instanceof Uint8Array?{$bytes:Buffer.from(x).toString('hex')}:typeof x==='bigint'?{$bigint:x.toString()}:x,2)+'\n';
const bytes=serialize(ops), sha256=createHash('sha256').update(bytes).digest('hex');
const encoded=JSON.parse(bytes);
assert(encoded.every((o:any)=>o.type!=='deleteEntity'&&o.type!=='deleteRelation'&&!o.unset?.length),'No deletions or unsets');
for(const row of selected){
 const e=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===row.id);
 for(const [p,n] of [[prop('discount'),row.discount],[prop('growth'),row.growth],[saga['property/cost'],row.cost],[prop('benefit'),row.benefit]] as [string,number][]){const v=e.set.find((s:any)=>s.property.$bytes===p).value;assert(Math.abs(Number(v.mantissa.value.$bigint)*10**v.exponent-n)<1e-8,`Encoded source number ${row.id}/${p}`);}
}
for(const e of encoded.filter((o:any)=>o.type==='updateEntity'))assert(encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===e.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),`Typed entity ${e.id.$bytes}`);
const batch={name:full?'Add remaining STAR economic sensitivity scenarios':'Add STAR economic model with one reviewed scenario',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,registry:registryPath,sha256,operationCount:ops.length,datasetId:dataset,paperId:paper,blockId:block,selected,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
