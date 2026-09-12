import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {perryObservedCopy} from '../src/education-perry-observed-copy';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',remaining=process.argv.includes('--remaining'),prefix=`perry-observed-${remaining?'remaining':'pilot'}`;
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Publication journal exists; reconcile instead of overwriting');
const model=JSON.parse(readFileSync(`${root}/perry-observed-model.json`,'utf8'));
const mapping=JSON.parse(readFileSync(`${root}/perry-mapping-plan.json`,'utf8'));
const input=JSON.parse(readFileSync(`${root}/perry-publication-records.json`,'utf8'));
const registryPath=`${root}/perry-registry.json`,registry:Record<string,string>=JSON.parse(readFileSync(registryPath,'utf8'));
const id=(key:string):string=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const prop=(key:string):string=>key==='outcomeMeasure'?model.outcomeMeasure.id:mapping.reusedProperties[key]?.id??id(`property/${key}`);
const ops:Op[]=[],checks:string[]=[];
function assert(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
function decimal(property:string,value:string){assert(/^\d+(\.\d+)?$/.test(value),'Unsigned decimal source value');const [whole,part='']=value.split('.');return {property,type:'decimal' as const,exponent:-part.length,mantissa:{type:'i64' as const,value:BigInt(whole+part)}};}
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/${key}`);registry[`position/${key}`]??=position??Position.generate();ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;}
function entity(key:string,name:string,description:string,type:string,values:any[]=[]){ops.push(...Ops.entities.update({id:id(key),...(name?{name}:{}),...(description?{description}:{}),values}).ops);rel(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);}
async function identity(name:string,expected?:string){const result=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});assert(!result.entitiesConnection.pageInfo.hasNextPage&&result.entitiesConnection.nodes.every((n:any)=>n.id===expected),`Cross-space name ${name}`);}
async function datatype(property:string,type:string){const result=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});assert(result.property?.dataTypeName.toLowerCase()===type.toLowerCase(),`Live datatype ${property}/${type}`);}
assert(input.sourceSha256===createHash('sha256').update(readFileSync(`${root}/perry-economic-extraction.json`)).digest('hex'),'Prepared input matches source');
assert(JSON.parse(readFileSync(`${root}/perry-record-verification.json`,'utf8')).passed===true,'Independent source normalization verified');
assert(JSON.parse(readFileSync(`${root}/perry-economic-remaining-index-verification.json`,'utf8')).passed===true,'Economic expansion indexed');
if(remaining){assert(JSON.parse(readFileSync(`${root}/perry-observed-pilot-index-verification.json`,'utf8')).passed===true,'Observed pilot indexed');assert(JSON.parse(readFileSync(`${root}/perry-observed-pilot-visual.json`,'utf8')).passed===true,'Proportion and monetary pilot render');}
for(const key of ['standardError','population','source','study','location','locator','followup','unit','priceYear','currency'])await datatype(prop(key),mapping.reusedProperties[key].datatype);
await datatype(prop('outcomeMeasure'),'Text');
const properties=[...mapping.proposedProperties.filter((p:any)=>['observedProportion','observedMonetaryMean'].includes(p.key)),{key:'studyArms',name:model.studyArms.proposedProperty,description:model.studyArms.description,datatype:'Relation',targetTypeId:model.studyArms.targetTypeId}];
for(const p of properties){await identity(p.name,registry[`property/${p.key}`]);if(remaining)await datatype(prop(p.key),p.datatype);else{entity(`property/${p.key}`,p.name,p.description,SystemIds.PROPERTY,p.format?[text('396f8c72dfd04b5791ea09c1b9321b2f',p.format)]:[]);rel(`property/${p.key}/datatype`,prop(p.key),SystemIds.DATA_TYPE,p.datatype==='Relation'?SystemIds.RELATION:SystemIds.DECIMAL);if(p.targetTypeId)rel(`property/${p.key}/range`,prop(p.key),SystemIds.RELATION_VALUE_RELATIONSHIP_TYPE,p.targetTypeId);}}
for(const arm of model.studyArms.targets){await identity(arm.name,registry[`arm/${arm.key}`]);if(!remaining){entity(`arm/${arm.key}`,arm.name,arm.description,model.studyArms.targetTypeId);rel(`arm/${arm.key}/study`,id(`arm/${arm.key}`),prop('study'),registry.study!);}}
const rows=input.records.filter((r:any)=>r.kind===model.rowKind);assert(rows.length===32,'All 32 source means available');
const selected=rows.filter((r:any)=>remaining?!model.pilot.includes(r.key):model.pilot.includes(r.key));assert(selected.length===(remaining?30:2),'Expected pilot or expansion selection');
for(const unit of ['fraction','USD']){let prior:string|null=null;for(const row of rows.filter((r:any)=>r.unit===unit)){const key=`position/observed/${row.key}/item`;registry[key]??=Position.generateBetween(prior,null);prior=registry[key]!;}}
if(!remaining){
 for(const [i,unit] of ['fraction','USD'].entries()){
  const key=`table/observed-${unit}`,table=id(key);entity(key,unit==='fraction'?'Observed group proportions':'Observed yearly earnings','',SystemIds.DATA_BLOCK);rel(`${key}/source`,table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const attachment=rel(`${key}/attachment`,registry.dataset!,SystemIds.BLOCKS,table,`a${5+i}`);rel(`${key}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  const columns=[prop('outcomeMeasure'),prop('followup'),prop(unit==='fraction'?'observedProportion':'observedMonetaryMean'),prop('standardError'),prop('unit'),prop('population'),prop('studyArms'),...(unit==='USD'?[prop('priceYear')]:[])];let prior:string|null=null;columns.forEach((p,j)=>{const position=Position.generateBetween(prior,null);rel(`${key}/column/${j}`,attachment,SystemIds.PROPERTIES,p,position);prior=position;});
 }
 const markdown='## Interpreting observed outcomes\n\nThese are source-reported descriptive group means from Table 2, not adjusted causal effects. Treatment/control differences do not by themselves reproduce the economic paper\u2019s adjusted estimates. Do not interpret the groups as independent experiments.\n\nProportions display as percentages, while their standard errors remain fractional values: 0.09 means 9 percentage points. Yearly earnings and their standard errors are USD in 2006 prices. Follow-up ages and welfare observation windows differ across rows.\n\nOriginal assignment groups contained 26 female controls, 25 female treatment participants, 39 male controls and 33 male treatment participants. These counts do not establish each outcome\u2019s complete-case denominator; per-outcome sample size remains unknown. Initial randomization was subsequently compromised by reassignment.\n\nSource: [Heckman and colleagues (2010)](https://doi.org/10.1016/j.jpubeco.2009.11.001), Table 2, printed p. 117 (PDF page 4).';
 entity('notes/observed','','',SystemIds.TEXT_BLOCK,[text(SystemIds.MARKDOWN_CONTENT,markdown)]);rel('notes/observed/attachment',registry.dataset!,SystemIds.BLOCKS,id('notes/observed'),'a7');
}
for(const row of selected){
 const key=`observed/${row.key}`,copy=perryObservedCopy(row),name=copy.name;await identity(name,registry[key]);
 const values:Array<ReturnType<typeof text>|ReturnType<typeof decimal>|ReturnType<typeof integer>>=[text(prop('outcomeMeasure'),row.outcome),text(prop('followup'),row.followup),decimal(prop(row.unit==='fraction'?'observedProportion':'observedMonetaryMean'),row.value),decimal(prop('standardError'),row.standardError),text(prop('unit'),row.unit),text(prop('locator'),row.locator)];
 if(row.unit==='USD')values.push(integer(prop('priceYear'),row.priceYear),text(prop('currency'),'USD'));
 entity(key,name,copy.description,'96f859efa1ca4b229372c86ad58b694b',values);
 for(const [p,target] of [['source',registry.paper!],['study',registry.study!],['population',registry[`population/${row.population}`]!],['studyArms',id(`arm/${row.assignment}`)],['location',mapping.reusedProperties.location.targetId]])rel(`${key}/${p}`,id(key),prop(p!),target!);
 rel(`${key}/entry`,registry.dataset!,'d66cd445e09a41809af46d86f083b41c',id(key));rel(`${key}/item`,id(`table/observed-${row.unit}`),SystemIds.COLLECTION_ITEM_RELATION_TYPE,id(key),registry[`position/${key}/item`]);
}
const coverage=await gql<any>('query($id:UUID!){entity(id:$id){values(first:20){nodes{propertyId text spaceId}pageInfo{hasNextPage}}}}',{variables:{id:registry['notes/dataset']}});
assert(coverage.entity&&!coverage.entity.values.pageInfo.hasNextPage,'Current coverage block');const current=coverage.entity.values.nodes.find((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT&&v.spaceId===EDUCATION_PUBLICATION.spaceId)?.text;
const before=remaining?'The first two descriptive outcome means are included; the remaining 30 selected means are not yet published.':'The 32 selected descriptive outcome means are not yet included.';
assert(typeof current==='string'&&current.includes(before),'Reviewed prior coverage text');const after=remaining?'All 32 selected descriptive outcome means from Table 2 are included. Other source-table rows and appendices are outside this extraction.':'The first two descriptive outcome means are included; the remaining 30 selected means are not yet published.';
ops.push(...Ops.entities.update({id:registry['notes/dataset']!,values:[text(SystemIds.MARKDOWN_CONTENT,current.replace(before,after))]}).ops);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:remaining?'Complete Perry Preschool observed group outcomes':'Publish Perry Preschool observed-outcome pilot',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,datasetId:registry.dataset,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,selected:selected.map((r:any)=>({key:r.key,id:id(`observed/${r.key}`)})),journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,registry:registryPath};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:false,checkedAt:new Date().toISOString(),opsHash:sha256,checks,reason:'Independent encoded value/type/arm validation required'},null,2)+'\n');console.log(JSON.stringify(batch,null,2));
