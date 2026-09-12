import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {readingFirstPracticeCopy} from '../src/education-reading-first-practice-copy';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',prefix='reading-first-remaining';
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Publication journal exists; preserve historical payload');
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const records=read('reading-first-publication-records'),source=read('reading-first-extraction'),model=read('reading-first-model');
const saga=read('saga-registry'),star=read('star-experimental-registry'),pilot=read('reading-first-pilot-batch');
const registryPath=`${root}/reading-first-registry.json`,registry:Record<string,string>=read('reading-first-registry');
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[],selected:any[]=[],entities:any[]=[];
const assert=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const hash=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex');
const known={claim:'96f859efa1ca4b229372c86ad58b694b',sources:'49c5d5e1679a4dbdbfd33f618f227c94',related:'dfa6aebe1ca94bf29faccc4cc7afb24c',location:'95d770021faf4f7cb7deb21a7d48cda0'};
const prop=(key:string)=>registry[`property/${key}`]!;
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const decimal=(property:string,value:string)=>{
  assert(/^-?\d+(\.\d+)?$/.test(value),`Plain decimal: ${value}`);
  return {property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}};
};
function relation(key:string,from:string,type:string,to:string,position?:string){
  registry[`position/${key}`]??=position??Position.generate();
  const entityId=id(`relation-entity/${key}`);
  ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;
}
async function create(entityId:string,name:string,description:string,type:string,values:any[]=[]){
  assert(description.length<=350&&description.split(/(?<=[.!?])\s+(?=[A-Z])/).length<=2,`Concise description: ${name}`);
  const result=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});
  assert(!result.entitiesConnection.pageInfo.hasNextPage&&result.entitiesConnection.nodes.every((n:any)=>n.id===entityId),`Exact cross-space identity: ${name}`);
  ops.push(...Ops.entities.update({id:entityId,name,...(description?{description}:{}),values}).ops);relation(`${entityId}/type`,entityId,SystemIds.TYPES_PROPERTY,type);
  entities.push({id:entityId,name,type});
}
assert(records.sourceHash===pilot.sourceHash&&hash(readFileSync(`${root}/reading-first-extraction.json`))===records.sourceHash,'Reviewed source unchanged');
assert(records.records.length===63&&source.records.length===33,'Full selected extraction coverage');
assert(read('reading-first-pilot-visual').passed&&read('reading-first-pilot-index-verification').passed&&read('reading-first-notes-index-verification').passed,'Pilot and final methods verification passed');
const types=new Map<string,string>([
  [saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],
  ...['ciLower','ciUpper','ciLevel'].map(k=>[prop(k),'Decimal'] as [string,string]),
  ...['unit','followup','estimand','locator'].map(k=>[saga[`property/${k}`],'Text'] as [string,string]),
  [model.pValueProperty,'Text'],[model.outcomeMeasureProperty,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],
  ...[known.sources,known.related,known.location,saga['property/entries'],star['property/grades'],star['property/interventionArms'],star['property/comparisonArms']].map(p=>[p,'Relation'] as [string,string])
]);
for(const [property,expected] of types){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});assert(r.property?.dataTypeName===expected,`Live datatype ${property}: ${expected}`);}
const livePilot=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal}pageInfo{hasNextPage}}relations(first:30,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:registry[`estimate/${model.pilotKey}/native`],space:EDUCATION_PUBLICATION.spaceId}});
assert(!livePilot.entity.values.pageInfo.hasNextPage&&!livePilot.entity.relations.pageInfo.hasNextPage,'Complete pilot state read');
for(const [p,v] of [[saga['property/estimate'],'4.74'],[saga['property/se'],'2.72'],[prop('ciLower'),'-0.63'],[prop('ciUpper'),'10.11'],[prop('ciLevel'),'0.95']])assert(livePilot.entity.values.nodes.some((n:any)=>n.propertyId===p&&String(n.decimal)===v),`Pilot number unchanged ${p}`);
assert(livePilot.entity.relations.nodes.some((r:any)=>r.typeId===known.sources&&r.toEntityId===registry.paper),'Pilot source link unchanged');
const coverageId=registry['notes/coverage'],coverageExpected=read('reading-first-pilot-ops').find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===coverageId).set.find((s:any)=>s.property.$bytes===SystemIds.MARKDOWN_CONTENT).value.value;
const coverage=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:coverageId,space:EDUCATION_PUBLICATION.spaceId}});
assert(!coverage.entity.values.pageInfo.hasNextPage&&coverage.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT&&v.text===coverageExpected),'Coverage text precondition');

const groups=[
  {key:'achievement',domain:'student achievement',title:'Student achievement'},
  {key:'instruction',domain:'observed instructional practice',title:'Observed instructional practices'},
  {key:'engagement',domain:'observed student engagement',title:'Observed engagement with print'},
  {key:'implementation',domain:'self-reported implementation',title:'Self-reported implementation'}
];
const tables:any[]=[],lastItem=new Map<string,string|null>();let previousBlock='a0';
for(const group of groups)for(const representation of ['native','standardized']){
  const existing=group.key==='achievement'&&representation==='native';
  const tableId=existing?registry['table/achievement']:id(`table/${group.key}/${representation}`);
  const rows=records.records.filter((r:any)=>r.domain===group.domain&&r.representation===representation);
  const table={...group,representation,id:tableId,count:rows.length};tables.push(table);lastItem.set(tableId,null);
  if(existing)continue;
  await create(tableId,`${group.title}: ${representation==='native'?'native units':'standardized effects'}`,'',SystemIds.DATA_BLOCK);
  relation(`table/${group.key}/${representation}/source`,tableId,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const position=Position.generateBetween(previousBlock,'a1');previousBlock=position;
  const attachment=relation(`dataset/table/${group.key}/${representation}`,registry.dataset,SystemIds.BLOCKS,tableId,position);
  relation(`table/${group.key}/${representation}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  const columns=[model.outcomeMeasureProperty,saga['property/unit'],star['property/grades'],saga['property/estimate'],saga['property/se'],prop('ciLower'),prop('ciUpper'),model.pValueProperty,saga['property/followup'],saga['property/locator']];
  let previous:string|null=null;
  for(const [i,p] of columns.entries()){const pos=Position.generateBetween(previous,null);previous=pos;relation(`table/${group.key}/${representation}/column/${i}`,attachment,SystemIds.PROPERTIES,p,pos);}
}
for(const row of records.records){
  const estimate=id(`estimate/${row.key}`),table=tables.find(t=>t.domain===row.domain&&t.representation===row.representation);
  assert(table,`Table resolved: ${row.key}`);
  if(row.key===`${model.pilotKey}/native`){lastItem.set(table.id,registry[`position/table/item/${row.key}`]);continue;}
  const sourceRow=source.records.find((r:any)=>r.key===row.contrastKey),original=sourceRow[row.representation];
  assert(row.value===original.value&&row.standardError===original.standardError&&JSON.stringify(row.confidenceInterval)===JSON.stringify(original.confidenceInterval),`Normalized value and uncertainty: ${row.key}`);
  const numbers:Record<string,string>={[saga['property/estimate']]:row.value};
  if(row.standardError!==null)numbers[saga['property/se']]=row.standardError;
  if(row.confidenceInterval)Object.assign(numbers,{[prop('ciLower')]:row.confidenceInterval.lower,[prop('ciUpper')]:row.confidenceInterval.upper,[prop('ciLevel')]:row.confidenceInterval.level});
  const locator=row.sourceLocations.map((l:any)=>`Exhibit ${l.exhibit}, printed p. ${l.printedPage} (PDF p. ${l.pdfPage})`).join('; ');
  const values=[...Object.entries(numbers).map(([p,v])=>decimal(p,v)),text(model.pValueProperty,`P ${row.pValue.operator} ${row.pValue.value}`),text(model.outcomeMeasureProperty,`${row.measure} (${row.instrument})`),text(saga['property/unit'],row.unit),text(saga['property/followup'],row.followup),text(saga['property/estimand'],source.context.estimand),text(saga['property/locator'],locator)];
  const copy=row.domain==='student achievement'
    ?read('reading-first-achievement-copy-review').find((r:any)=>r.key===row.key)?.after
    :readingFirstPracticeCopy(sourceRow,row.representation);
  assert(copy,'Source-reviewed Claim copy required');
  await create(estimate,copy.name,copy.description,known.claim,values);
  if(row.grade)relation(`estimate/${row.key}/grade`,estimate,star['property/grades'],star[`grade/${row.grade}`]);
  for(const [key,p,to] of [['arm',star['property/interventionArms'],registry['arm/funded']],['comparison',star['property/comparisonArms'],registry['arm/comparison']],['study',known.related,registry.study],['source',known.sources,registry.paper],['location',known.location,model.countryId]])relation(`estimate/${row.key}/${key}`,estimate,p,to);
  relation(`entry/${row.key}`,registry.dataset,saga['property/entries'],estimate);
  const pos=Position.generateBetween(lastItem.get(table.id)??null,null);lastItem.set(table.id,pos);
  relation(`table/item/${row.key}`,table.id,SystemIds.COLLECTION_ITEM_RELATION_TYPE,estimate,pos);
  selected.push({...row,id:estimate,numbers});
}
// Each link targets the alternate estimate entity, not the common Study or the source.
for(const row of records.records.filter((r:any)=>r.pairedKey))relation(`pair/${row.key}`,id(`estimate/${row.key}`),known.related,id(`estimate/${row.pairedKey}`));
const normalizations=[...new Set<string>(records.records.filter((r:any)=>r.normalization).map((r:any)=>r.normalization))];
const normalizationBlock=id('notes/normalization');
await create(normalizationBlock,'Reading First standardization notes','',SystemIds.TEXT_BLOCK,[text(SystemIds.MARKDOWN_CONTENT,`## Standardization and paired estimates\n\nThe tables contain 33 outcome contrasts: 30 have native-unit and standardized versions, while three grade-level proficiency contrasts have only native-unit results. Paired estimate pages link to each other through Related entities; both versions also link to the same study and source.\n\nStandardized estimates use the report's comparison-group outcome standard deviations:\n\n${normalizations.map(n=>`- ${n}`).join('\n')}\n\nAn SD of classroom practice is not an SD of student achievement. These tables preserve the report's different measures and samples rather than establish a common effectiveness scale.`)]);
relation('notes/normalization/attachment',registry.dataset,SystemIds.BLOCKS,normalizationBlock,'a3');
ops.push(...Ops.entities.update({id:coverageId,values:[text(SystemIds.MARKDOWN_CONTENT,'## Publication coverage\n\nThe tables contain all 33 selected outcome contrasts from Exhibits 2.1–2.6, with 63 native-unit or standardized representations and reported uncertainty from D.1–D.4. Native and standardized versions are paired, not independent findings.\n\nThe source report also provides actual funded-school means and estimated counterfactual means; those means are not yet included in these tables. Matched delivery costs and complete program, implementation and measurement-concept links remain unresolved. No cost-effectiveness ranking is supported.')]}).ops);
assert(selected.length===62&&tables.reduce((n,t)=>n+t.count,0)===63,'62 additions complete 63 representations');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n',encoded=JSON.parse(bytes),sha256=hash(bytes);
for(const row of selected){
  const set=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===row.id).set;
  for(const [p,v] of Object.entries(row.numbers) as [string,string][]){const value=set.find((s:any)=>s.property.$bytes===p)?.value;assert(value?.type==='decimal'&&value.mantissa.value.$bigint===BigInt(v.replace('.','')).toString()&&value.exponent===-(v.split('.')[1]?.length??0),`Source-to-SDK ${row.key}/${p}`);}
  assert(!set.some((s:any)=>s.property.$bytes==='bf0249bb71924460bfe6b35394ed0781'),'No inferred outcome N');
  if(!row.confidenceInterval)assert(!set.some((s:any)=>[prop('ciLower'),prop('ciUpper'),prop('ciLevel'),saga['property/se']].includes(s.property.$bytes)),`Missing uncertainty preserved ${row.key}`);
}
for(const o of encoded.filter((o:any)=>o.type==='updateEntity'))assert(o.id.$bytes===coverageId||encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===o.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),`Typed entity ${o.id.$bytes}`);
assert(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions or unsets');
const batch={name:'Add remaining Reading First achievement and implementation impacts',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:registry.dataset,selected,entities,tables,sourceHash:records.sourceHash,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify({batch:`${root}/${prefix}-batch.json`,operations:ops.length,checks:checks.length,rows:selected.length,tables},null,2));
