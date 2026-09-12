import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',remaining=process.argv.includes('--remaining'),prefix=`reading-first-means-${remaining?'remaining':'pilot'}`;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Existing journal: reconcile without rebuilding');
const input=read('reading-first-mean-records'),source=read('reading-first-extraction'),registry:Record<string,string>=read('reading-first-registry');
const saga=read('saga-registry'),star=read('star-experimental-registry'),model=read('reading-first-model');
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const checks:string[]=[],ops:Op[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const fractionFormat='measure-unit/percent scale/100 precision-unlimited';
const observedProportion='73b35a4ce05f45908118a089d9995bae',measurementUnit='5c67ae17c84ce783f3b8cd8ffa063661';
const properties=[
 {key:'actualMean',name:'Actual unadjusted mean',description:'Actual unadjusted group mean in the reported measurement unit. It is not an adjusted treatment effect or an estimated counterfactual.'},
 {key:'counterfactualMean',name:'Estimated counterfactual mean',description:'Estimated group mean under the specified counterfactual condition, in the reported measurement unit. It is not an observed comparison-group mean.'},
 {key:'counterfactualProportion',name:'Estimated counterfactual proportion',description:'Estimated group proportion under the specified counterfactual condition, stored as a fraction. It is not an observed comparison-group proportion.',format:fractionFormat},
];
function relation(key:string,from:string,type:string,to:string,position?:string){
 const entityId=id(`relation-entity/${key}`);registry[`position/${key}`]??=position??Position.generate();
 ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;
}
async function identity(name:string,expected:string){const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});check(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===expected),`Cross-space identity ${name}`);}
async function datatype(id:string,expected:string){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});check(r.property?.dataTypeName===expected,`Datatype ${id}/${expected}`);}
async function create(key:string,name:string,description:string,type:string,values:any[]=[]){await identity(name,id(key));check(description.length<=350,`Short description ${name}`);ops.push(...Ops.entities.update({id:id(key),name,...(description?{description}:{}),values}).ops);relation(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);}
check(input.sourceHash===createHash('sha256').update(readFileSync(`${root}/reading-first-extraction.json`)).digest('hex'),'Reviewed source hash');
check(input.records.length===66&&input.checkedSourceValues===66,'All means source reconciled');
check(read('reading-first-remaining-index-verification').passed,'All native contrasts indexed');
if(remaining)check(read('reading-first-means-pilot-index-verification').passed&&read('reading-first-means-pilot-visual').passed,'Mean pilot indexed and rendered');
for(const [p,t] of [[observedProportion,'Decimal'],[measurementUnit,'Text'],[model.outcomeMeasureProperty,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text']])await datatype(p!,t!);
const proportionSchema=read('reading-first-property-samples').properties.observedProportion.schema;
check(proportionSchema.entity.values.nodes.some((v:any)=>v.propertyId==='396f8c72dfd04b5791ea09c1b9321b2f'&&v.text===fractionFormat),'Reused observed proportion has verified fraction format');
for(const p of properties){if(remaining)await datatype(id(`property/${p.key}`),'Decimal');else {await create(`property/${p.key}`,p.name,p.description,SystemIds.PROPERTY,p.format?[text('396f8c72dfd04b5791ea09c1b9321b2f',p.format)]:[]);relation(`property/${p.key}/datatype`,id(`property/${p.key}`),SystemIds.DATA_TYPE,SystemIds.DECIMAL);}}
const pilotKeys=['sat10-score-g1','sat10-grade-level-g1'];
const selected=source.records.filter((r:any)=>remaining?!pilotKeys.includes(r.key):pilotKeys.includes(r.key));
const fraction=(r:any)=>['percent','proportion'].includes(r.means.unit);
if(!remaining){
 for(const kind of ['numeric','proportion']){
  const key=`table/means/${kind}`;await create(key,kind==='numeric'?'Actual and counterfactual means':'Actual and counterfactual proportions','',SystemIds.DATA_BLOCK);
  relation(`${key}/source`,id(key),SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const attachment=relation(`${key}/attachment`,registry.dataset!,SystemIds.BLOCKS,id(key),Position.generateBetween('a3',null));
  relation(`${key}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  let previous:string|null=null;
  const columns=[model.outcomeMeasureProperty,star['property/grades'],kind==='numeric'?id('property/actualMean'):observedProportion,kind==='numeric'?id('property/counterfactualMean'):id('property/counterfactualProportion'),measurementUnit,saga['property/followup'],saga['property/locator']];
  for(const [i,p] of columns.entries()){const pos=Position.generateBetween(previous,null);relation(`${key}/column/${i}`,attachment,SystemIds.PROPERTIES,p!,pos);previous=pos;}
 }
 await create('notes/means','Reading First means: interpretation','',SystemIds.TEXT_BLOCK,[text(SystemIds.MARKDOWN_CONTENT,'## Actual and counterfactual means\n\nActual funded-group means are unadjusted. Without-funding means are estimated counterfactuals, not observed comparison-group results. The report derives counterfactuals using adjusted impacts; subtracting rounded displayed means does not reproduce every precise impact.\n\nPercentages display from numeric fractions. Other means retain their reported scores, minutes, hours or scale units. Uncertainty shown on the linked impact records applies to the impacts, not these means; mean uncertainty and per-outcome sample sizes remain unknown.\n\nBoth mean columns belong to the same study contrast, grade, follow-up and source. These tables add context to the existing impacts, not independent studies.')]);
 relation('notes/means/attachment',registry.dataset!,SystemIds.BLOCKS,id('notes/means'),Position.generateBetween('a3',null));
}
const expected:any[]=[];
for(const row of selected){
 const entityId=registry[`estimate/${row.key}/native`];check(entityId,`Existing native ID ${row.key}`);
 const live=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId decimal text}pageInfo{hasNextPage}}relations(first:30,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space:target.spaceId}});
 check(live.entity&&!live.entity.values.pageInfo.hasNextPage&&!live.entity.relations.pageInfo.hasNextPage,`Complete existing state ${row.key}`);
 check(live.entity.relations.nodes.some((r:any)=>r.typeId===SystemIds.TYPES_PROPERTY&&r.toEntityId==='96f859efa1ca4b229372c86ad58b694b'),'Existing typed contrast');
 check(live.entity.relations.nodes.some((r:any)=>r.typeId==='49c5d5e1679a4dbdbfd33f618f227c94'&&r.toEntityId===registry.paper),'Existing primary source');
 const numeric:any[]=[];
 for(const [field,property] of [['actualUnadjustedWithReadingFirst',fraction(row)?observedProportion:id('property/actualMean')],['estimatedCounterfactualWithoutReadingFirst',fraction(row)?id('property/counterfactualProportion'):id('property/counterfactualMean')]]){
  const value=row.means[field!];check(/^\d+(\.\d+)?$/.test(value),'Unsigned source mean');
  const exponent=-(value.split('.')[1]?.length??0)-(row.means.unit==='percent'?2:0),mantissa=BigInt(value.replace('.',''));
  check(!live.entity.values.nodes.some((v:any)=>v.propertyId===property),'New mean property does not overwrite existing fact');
  numeric.push({property,type:'decimal',exponent,mantissa:{type:'i64',value:mantissa}});
 }
 check(!live.entity.values.nodes.some((v:any)=>v.propertyId===measurementUnit),'Measurement unit will not overwrite a prior fact');
 ops.push(...Ops.entities.update({id:entityId,values:[...numeric,text(measurementUnit,fraction(row)?'fraction':row.means.unit)]}).ops);
 const kind=fraction(row)?'proportion':'numeric',key=`table/means/${kind}/item/${row.key}`;
 // Source-order ranks are generated once for all rows, including the pilot.
 let previous:string|null=null;for(const ordered of source.records.filter((r:any)=>fraction(r)===fraction(row))){const k=`position/table/means/${kind}/item/${ordered.key}`;registry[k]??=Position.generateBetween(previous,null);previous=registry[k]!;}
 relation(key,id(`table/means/${kind}`),SystemIds.COLLECTION_ITEM_RELATION_TYPE,entityId,registry[`position/${key}`]);
 expected.push({key:row.key,id:entityId,values:numeric.map(n=>({property:n.property,mantissa:n.mantissa.value.toString(),exponent:n.exponent})),unit:fraction(row)?'fraction':row.means.unit});
}
check(selected.length===(remaining?31:2),'Expected contrast selection');
if(remaining){
 const coverageId=registry['notes/coverage'];
 const state=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:coverageId,space:target.spaceId}});
 const old='The source report also provides actual funded-school means and estimated counterfactual means; those means are not yet included in these tables.';
 const current=state.entity?.values.nodes.find((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT)?.text;
 check(!state.entity.values.pageInfo.hasNextPage&&typeof current==='string'&&current.includes(old),'Existing coverage precondition');
 ops.push(...Ops.entities.update({id:coverageId!,values:[text(SystemIds.MARKDOWN_CONTENT,current.replace(old,'The mean tables include all 33 pairs of actual funded-group means and estimated without-funding counterfactual means from Exhibits 2.1–2.6. The pairs are attached to the existing native-unit contrasts.'))]}).ops);
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes);
for(const row of expected)for(const number of row.values){const actual=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===row.id)?.set.find((s:any)=>s.property.$bytes===number.property)?.value;check(actual?.type==='decimal'&&actual.exponent===number.exponent&&actual.mantissa.value.$bigint===number.mantissa,`Exact encoded mean ${row.key}/${number.property}`);}
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:remaining?'Complete Reading First actual and counterfactual means':'Add Reading First actual and counterfactual mean pilot',spaceId:target.spaceId,bounty:target.bountyId,datasetId:registry.dataset,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,selected:expected,sourceHash:input.sourceHash,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/reading-first-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:false,checkedAt:new Date().toISOString(),opsHash:sha256,checks,reason:'Independent operation review required before submission'},null,2)+'\n');
console.log(JSON.stringify({batch:`${root}/${prefix}-batch.json`,operations:ops.length,checks:checks.length,contrasts:selected.length}));
