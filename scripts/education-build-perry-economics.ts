import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {perryEconomicCopy} from '../src/education-perry-economic-copy';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',remaining=process.argv.includes('--remaining'),prefix=`perry-economic-${remaining?'remaining':'pilot'}`;
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Journal exists; reconcile without overwriting submitted operations');
const inputBytes=readFileSync(`${root}/perry-publication-records.json`,'utf8'),input=JSON.parse(inputBytes);
const model=JSON.parse(readFileSync(`${root}/perry-mapping-plan.json`,'utf8'));
const source=JSON.parse(readFileSync(`${root}/perry-economic-extraction.json`,'utf8'));
const registryPath=`${root}/perry-registry.json`,registry:Record<string,string>=JSON.parse(readFileSync(registryPath,'utf8'));
const id=(key:string):string=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const prop=(key:string):string=>model.reusedProperties[key]?.id??id(`property/${key}`);
const ops:Op[]=[],checks:string[]=[];
function assert(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
function decimal(property:string,value:string){assert(/^-?\d+(\.\d+)?$/.test(value),'Plain decimal string');const [whole,part='']=value.split('.');return {property,type:'decimal' as const,exponent:-part.length,mantissa:{type:'i64' as const,value:BigInt(whole+part)}};}
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/${key}`);registry[`position/${key}`]??=position??Position.generate();ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;}
async function identity(name:string,expected?:string){const found=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});assert(!found.entitiesConnection.pageInfo.hasNextPage&&found.entitiesConnection.nodes.every((n:any)=>n.id===expected),`Cross-space identity: ${name}`);}
function entity(key:string,name:string,description:string,type:string,values:any[]=[]){ops.push(...Ops.entities.update({id:id(key),...(name?{name}:{}),...(description?{description}:{}),values}).ops);rel(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);}
function notes(key:string,markdown:string,position:string){entity(key,'','',SystemIds.TEXT_BLOCK,[text(SystemIds.MARKDOWN_CONTENT,markdown)]);rel(`${key}/attachment`,registry.dataset!,SystemIds.BLOCKS,id(key),position);}
assert(input.sourceSha256===createHash('sha256').update(readFileSync(`${root}/perry-economic-extraction.json`)).digest('hex'),'Current extraction hash');
assert(JSON.parse(readFileSync(`${root}/perry-record-verification.json`,'utf8')).passed===true,'Independent normalization verified');
assert(JSON.parse(readFileSync(`${root}/perry-cost-pilot-index-verification.json`,'utf8')).passed===true,'Cost dataset indexed');
if(remaining){assert(JSON.parse(readFileSync(`${root}/perry-economic-pilot-index-verification.json`,'utf8')).passed===true,'Economic pilot indexed');assert(JSON.parse(readFileSync(`${root}/perry-economic-pilot-visual.json`,'utf8')).passed===true,'Both economic pilot tables rendered');}
for(const [key,spec] of Object.entries<any>(model.reusedProperties)){
 const value=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:spec.id}});
 assert(value.property?.dataTypeName.toLowerCase()===spec.datatype.toLowerCase(),`Reused datatype ${key}`);
}
const newProps=model.proposedProperties.filter((p:any)=>['benefitCostRatio','deadweightLoss','economicPerspectives','murderValuation'].includes(p.key));
for(const p of newProps){await identity(p.name,registry[`property/${p.key}`]);if(!remaining){entity(`property/${p.key}`,p.name,p.description,SystemIds.PROPERTY,p.format?[text('396f8c72dfd04b5791ea09c1b9321b2f',p.format)]:[]);rel(`property/${p.key}/datatype`,prop(p.key),SystemIds.DATA_TYPE,p.datatype==='Relation'?SystemIds.RELATION:SystemIds.DECIMAL);if(p.targetTypeId)rel(`property/${p.key}/range`,prop(p.key),SystemIds.RELATION_VALUE_RELATIONSHIP_TYPE,p.targetTypeId);}}
for(const p of model.populationTargets){await identity(p.name,registry[`population/${p.key}`]);if(!remaining){entity(`population/${p.key}`,p.name,p.description,p.typeId);rel(`population/${p.key}/study`,id(`population/${p.key}`),prop('study'),registry.study!);}}
for(const p of model.perspectiveTargets){await identity(p.name,registry[`perspective/${p.key}`]);if(!remaining)entity(`perspective/${p.key}`,p.name,p.description,'5ef5a5860f274d8e8f6c59ae5b3e89e2');}
const economic=input.records.filter((r:any)=>r.kind.startsWith('modeled-'));
assert(economic.length===51,'All 51 economic records in input');
const coverage=await gql<any>('query($id:UUID!){entity(id:$id){values(first:20){nodes{propertyId text spaceId}pageInfo{hasNextPage}}}}',{variables:{id:registry['notes/dataset']}});
assert(coverage.entity&&!coverage.entity.values.pageInfo.hasNextPage,'Current dataset coverage block');
const currentCoverage=coverage.entity.values.nodes.find((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT&&v.spaceId===EDUCATION_PUBLICATION.spaceId)?.text;
const before=remaining?'This page presents the initial program cost and two pilot economic estimates. The remaining economic estimates and observed outcome tables are not yet included.':'This page currently presents the initial program cost. The extracted outcome and return tables are not yet included in this publication.';
const after=remaining?'This page presents the initial program cost and all 51 extracted Table 1 economic estimates. The 32 selected descriptive outcome means are not yet included.':'This page presents the initial program cost and two pilot economic estimates. The remaining economic estimates and observed outcome tables are not yet included.';
assert(typeof currentCoverage==='string'&&currentCoverage.includes(before),'Coverage still matches reviewed prior publication');
ops.push(...Ops.entities.update({id:registry['notes/dataset']!,values:[text(SystemIds.MARKDOWN_CONTENT,currentCoverage.replace(before,after))]}).ops);
const pilotKeys=[economic.find((r:any)=>r.kind==='modeled-internal-return').key,economic.find((r:any)=>r.kind==='modeled-benefit-cost-ratio').key];
const selected=economic.filter((r:any)=>remaining?!pilotKeys.includes(r.key):pilotKeys.includes(r.key));
const tableKinds=['modeled-internal-return','modeled-benefit-cost-ratio'];
for(const kind of tableKinds){let previous:string|null=null;for(const row of economic.filter((r:any)=>r.kind===kind)){const key=`position/estimate/${row.key}/item`;if(!remaining&&/^a\d{3}$/.test(registry[key]??''))delete registry[key];registry[key]??=Position.generateBetween(previous,null);previous=registry[key]!;}}
if(!remaining){
 for(const [i,kind] of tableKinds.entries()){
  const key=`table/${kind}`,table=id(key);entity(key,kind==='modeled-internal-return'?'Modeled annual real returns':'Modeled benefit-cost ratios','',SystemIds.DATA_BLOCK);
  rel(`${key}/source`,table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const attachment=rel(`${key}/attachment`,registry.dataset!,SystemIds.BLOCKS,table,`a${i+2}`);rel(`${key}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  const columns=[kind==='modeled-internal-return'?prop('internalReturn'):prop('benefitCostRatio'),prop('standardError'),prop('unit'),prop('population'),prop('economicPerspectives'),prop('deadweightLoss'),...(kind==='modeled-benefit-cost-ratio'?[prop('discountRate')]:[]),prop('murderValuation')];
  columns.forEach((p,j)=>rel(`${key}/column/${j}`,attachment,SystemIds.PROPERTIES,p,Position.generateBetween(j?registry[`position/${key}/column/${j-1}`]!:null,null)));
 }
 notes('notes/economics',`## Economic assumptions and uncertainty\n\nThese modeled estimates share one historical experiment; they are not independent trials or confidence bounds. Individual perspective covers participants, while societal perspective also includes the wider public. Pooled results come from pooled profiles, not the average of male and female returns.\n\nInternal returns vary tax deadweight loss. Benefit-cost ratios vary the real discount rate and hold tax deadweight loss at 50%. Deadweight loss is additional welfare loss per tax dollar.\n\nThe high murder valuation is 4.1 million USD and includes statistical life; the low valuation is 13,000 USD and excludes it. These assumptions use the study's 2006-price accounting. Individual-perspective rows have no crime-valuation assumption.\n\nRate estimates display as percentages; their standard errors are fractional values: 0.018 means 1.8 percentage points. Ratio estimates and their standard errors are dimensionless ratios. Standard errors combine resampling of prediction errors and bootstrapping, not all model-assumption uncertainty.\n\nMissing earnings before age 40 are imputed; later earnings are projected through age 65. The initial program resource cost above is not every scenario's financing-adjusted denominator.\n\nSource: [${source.publication.title}](${source.publication.sourceUrl}), ${source.table1.locator}.`, 'a4');
}
for(const row of selected){
 const key=`estimate/${row.key}`,copy=perryEconomicCopy(row),name=copy.name;
 await identity(name,registry[key]);
 const values=[decimal(prop(row.kind==='modeled-internal-return'?'internalReturn':'benefitCostRatio'),row.value),decimal(prop('standardError'),row.standardError),decimal(prop('deadweightLoss'),row.deadweightLossFraction),text(prop('unit'),row.unit),text(prop('locator'),row.locator),text(prop('followup'),'Modeled economic horizon through age 65'),integer(prop('priceYear'),row.priceYear),text(prop('currency'),'USD')];
 if(row.realDiscountRate!==null)values.push(decimal(prop('discountRate'),row.realDiscountRate));
 if(row.crimeValuation!==null)values.push(decimal(prop('murderValuation'),row.crimeValuation==='high'?'4100000':'13000'));
 entity(key,name,copy.description,'96f859efa1ca4b229372c86ad58b694b',values);
 for(const [suffix,p,target] of [['source',prop('source'),registry.paper!],['study',prop('study'),registry.study!],['population',prop('population'),id(`population/${row.population}`)],['perspective',prop('economicPerspectives'),id(`perspective/${row.perspective}`)],['location',prop('location'),model.reusedProperties.location.targetId]])rel(`${key}/${suffix}`,id(key),p!,target!);
 rel(`${key}/entry`,registry.dataset!,'d66cd445e09a41809af46d86f083b41c',id(key));
 rel(`${key}/item`,id(`table/${row.kind}`),SystemIds.COLLECTION_ITEM_RELATION_TYPE,id(key),registry[`position/${key}/item`]);
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:remaining?'Complete Perry Preschool economic estimates':'Publish Perry Preschool economic pilot estimates',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:registry.dataset,selected:selected.map((r:any)=>({key:r.key,id:id(`estimate/${r.key}`)})),journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,registry:registryPath};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:false,checkedAt:new Date().toISOString(),opsHash:sha256,checks,reason:'Requires independent encoded-payload and type validation before submission'},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
