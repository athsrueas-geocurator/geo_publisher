import { readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { ContentIds, Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { EDUCATION_PUBLICATION } from '../src/education-bounty';

const root='data/education';
const source=JSON.parse(readFileSync(`${root}/saga-extraction.json`,'utf8'));
const registryPath=`${root}/saga-registry.json`;
let registry:Record<string,string>={};
try { registry=JSON.parse(readFileSync(registryPath,'utf8')); } catch(e:any) { if(e.code!=='ENOENT')throw e; }
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[];
function relate(key:string,from:string,type:string,to:string,position?:string){
  const stablePosition=registry[`position/${key}`]??(registry[`position/${key}`]=position??Position.generate());
  ops.push(...Ops.relations.create({id:id(`edge/${key}`),entityId:id(`edge-entity/${key}`),fromEntity:from,type,toEntity:to,position:stablePosition}).ops);
}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
function decimal(property:string,value:number){
  const places=(String(value).split('.')[1]??'').length;
  return {property,type:'decimal' as const,exponent:-places,mantissa:{type:'i64' as const,value:BigInt(Math.round(value*10**places))}};
}
const properties=[
  ['estimate','Effect estimate value','DECIMAL','Reported numerical effect; interpret only with the stated unit, estimand and study context.'],
  ['se','Standard error','DECIMAL','Reported standard error of an estimate in the same units as that estimate.'],
  ['study','Study number','INTEGER','Source-local study or trial number; not a global study identifier.'],
  ['unit','Outcome unit','TEXT','Unit and normalization used for the reported outcome.'],
  ['followup','Follow-up period','TEXT','Time horizon at which the reported study outcome was assessed.'],
  ['estimand','Estimand','TEXT','Quantity targeted by the estimator, such as intention-to-treat or treatment-on-the-treated.'],
  ['locator','Source table','TEXT','Table, panel and printed page locating this observation in its linked source.'],
  ['entries','Dataset entries','RELATION','Entries belonging to a structured dataset; preserve the order on each relation.'],
  ['cost','Cost amount','DECIMAL','Reported monetary cost; requires currency, denominator, period and cost-accounting context.'],
  ['low','Cost lower bound','DECIMAL','Lower end of a reported cost range; not necessarily a confidence bound.'],
  ['high','Cost upper bound','DECIMAL','Upper end of a reported cost range; not necessarily a confidence bound.'],
  ['denominator','Cost denominator','TEXT','Unit of delivery or population to which the cost amount applies.'],
  ['priceYear','Price year','INTEGER','Currency purchasing-power base year. Missing means unverified, not the trial year.'],
] as const;
for(const [key,name,dataType,description] of properties){
  const probe=JSON.parse(readFileSync(`${root}/discovery/${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`,'utf8'));
  if(!probe.complete||probe.nodes.length)throw new Error(`Unresolved ontology candidates for ${name}`);
  const property=id(`property/${key}`);
  ops.push(...Ops.entities.update({id:property,name,description}).ops);
  relate(`property/${key}/type`,property,SystemIds.TYPES_PROPERTY,SystemIds.PROPERTY);
  relate(`property/${key}/datatype`,property,SystemIds.DATA_TYPE,SystemIds[dataType]);
}
const prop=(key:string)=>id(`property/${key}`);
const existing={datasetType:'0c4babfb43893486af827341bbf32e09',claimType:'96f859efa1ca4b229372c86ad58b694b',sources:'49c5d5e1679a4dbdbfd33f618f227c94',doi:'7cb59354e30c48119e99ff62fcf61646',sampleSize:'bf0249bb71924460bfe6b35394ed0781',currency:'6e7371ca96cb44348f16932f77f55e75'};
const paper=id('paper/10.1257/aer.20210434');
ops.push(...Ops.entities.update({id:paper,name:source.publication.title,description:source.publication.version,values:[text(existing.doi,source.publication.doi),text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]}).ops);
relate('paper/type',paper,SystemIds.TYPES_PROPERTY,ContentIds.ARTICLE_TYPE);
const dataset=id('dataset/saga-chicago-trials');
const datasetName='Saga tutoring: Chicago trial estimates (Guryan et al., 2023)';
ops.push(...Ops.entities.update({id:dataset,name:datasetName,description:`${source.context.geography}; ${source.context.population}; ${source.context.design}. ${source.context.instrument}. ${source.context.limitations}`,values:[text(prop('unit'),source.context.unit),text(prop('followup'),source.context.followUp),text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]}).ops);
relate('dataset/type',dataset,SystemIds.TYPES_PROPERTY,existing.datasetType);
relate('dataset/source',dataset,existing.sources,paper);
let position=Position.generate();
for(const row of source.estimates){
  const entity=id(`estimate/${row.key}`);
  ops.push(...Ops.entities.update({id:entity,name:`Saga study ${row.study}: year-one math ${row.estimand} estimate`,description:'A reported trial estimate, not an independent replication of the other estimand from this trial.',values:[decimal(prop('estimate'),row.value),decimal(prop('se'),row.standardError),integer(existing.sampleSize,row.n),integer(prop('study'),row.study),text(prop('estimand'),row.estimand),text(prop('locator'),row.locator),text(prop('unit'),source.context.unit),text(prop('followup'),source.context.followUp)]}).ops);
  relate(`${row.key}/type`,entity,SystemIds.TYPES_PROPERTY,existing.claimType);
  relate(`${row.key}/source`,entity,existing.sources,paper);
  relate(`${row.key}/dataset`,dataset,prop('entries'),entity,position);
  position=Position.generateBetween(position,null);
}
const cost=id(`cost/${source.cost.key}`);
ops.push(...Ops.entities.update({id:cost,name:'Saga tutoring: approximate annual cost per pupil, 2013–2015',description:`${source.cost.rangeKind}. Price year unverified; cost-accounting review pending. This is a cost observation, not a cost-effectiveness estimate.`,values:[decimal(prop('cost'),source.cost.approximateValue),decimal(prop('low'),source.cost.low),decimal(prop('high'),source.cost.high),text(existing.currency,source.cost.currency),text(prop('denominator'),source.cost.denominator),text(prop('locator'),source.cost.locator)]}).ops);
relate('cost/type',cost,SystemIds.TYPES_PROPERTY,existing.claimType);
relate('cost/source',cost,existing.sources,paper);
relate('cost/dataset',dataset,prop('entries'),cost,position);
const serialize=(value:unknown)=>JSON.stringify(value,(_key,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const bytes=serialize(ops);
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
writeFileSync(`${root}/saga-ops.json`,bytes);
const manifest={name:'Add Saga Chicago trial estimates with source and cost context',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,bountySpaceId:EDUCATION_PUBLICATION.bountySpaceId,datasetId:dataset,paperId:paper,registry:registryPath,opsPath:`${root}/saga-ops.json`,sha256:createHash('sha256').update(bytes).digest('hex'),operationCount:ops.length,newProperties:properties.length,estimateCount:source.estimates.length,costObservationCount:1,existingOntology:existing,status:'dry-run; identity and live schema validation required before submission',remainingScope:'Other shortlisted studies and the complete Education Initiatives migration remain unfinished.'};
writeFileSync(`${root}/saga-batch.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
