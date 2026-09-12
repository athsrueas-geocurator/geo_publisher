import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {starExperimentalClaimCopy} from '../src/education-star-claim-copy';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';

const root='data/education',remaining=process.argv.includes('--remaining');
const prefix=`star-experimental-${remaining?'remaining':'pilot'}`;
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Publication journal exists; preserve historical payload and reconcile before retrying');
const source=JSON.parse(readFileSync(`${root}/star-experimental-extraction.json`,'utf8'));
const model=JSON.parse(readFileSync(`${root}/star-experimental-model.json`,'utf8'));
const saga=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const economic=JSON.parse(readFileSync(`${root}/star-economic-registry.json`,'utf8'));
const registryPath=`${root}/star-experimental-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[],entities:any[]=[];
const assert=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const known={dataset:'0c4babfb43893486af827341bbf32e09',claim:'96f859efa1ca4b229372c86ad58b694b',topic:'5ef5a5860f274d8e8f6c59ae5b3e89e2',sources:'49c5d5e1679a4dbdbfd33f618f227c94',related:'dfa6aebe1ca94bf29faccc4cc7afb24c',location:'95d770021faf4f7cb7deb21a7d48cda0',doi:'7cb59354e30c48119e99ff62fcf61646',n:'bf0249bb71924460bfe6b35394ed0781',toTypes:'9eea393f17dd4971a62ea603e8bfec20'};
const prop=(key:string)=>id(`property/${key}`);
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
const decimal=(property:string,value:number)=>{const digits=(String(value).split('.')[1]??'').length;return {property,type:'decimal' as const,exponent:-digits,mantissa:{type:'i64' as const,value:BigInt(Math.round(value*10**digits))}};};
function relation(key:string,from:string,type:string,to:string,position?:string){
  registry[`position/${key}`]??=position??Position.generate();
  const entityId=id(`relation-entity/${key}`);
  ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;
}
async function identity(name:string,expected:string){
  const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name}});
  assert(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===expected),`Exact cross-space identity: ${name}`);
}
async function create(entityId:string,name:string,description:string,type:string,values:any[]=[]){
  assert(description.length<=350&&description.split(/(?<=[.!?])\s+(?=[A-Z])/).length<=2,`Concise description: ${name}`);
  await identity(name,entityId);
  ops.push(...Ops.entities.update({id:entityId,name,description,values}).ops);
  relation(`${entityId}/type`,entityId,SystemIds.TYPES_PROPERTY,type);
  entities.push({id:entityId,name,type,description});
}
function notes(key:string,parent:string,markdown:string,position?:string){
  const block=id(`notes/${key}`);
  ops.push(...Ops.entities.update({id:block,values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]}).ops);
  relation(`notes/${key}/type`,block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
  relation(`notes/${key}/attachment`,parent,SystemIds.BLOCKS,block,position);
  return block;
}
assert(source.verification.visualChecked===true&&source.estimates.length===8,'Eight visually verified source rows');
assert(source.context.unit==='percentile points'&&source.publication.column===7,'Percentile-point unit and consistent column 7');
const factualSchema=await gql<any>('query{property(id:"da4a6c1f9d4446f9832ff3b49a4400ef"){dataTypeName}}');
assert(factualSchema.property?.dataTypeName==='Checkbox','Is factual uses API Checkbox and SDK boolean');
const datatypes=new Map<string,string>([
  [saga['property/estimate'],SystemIds.DECIMAL],[saga['property/se'],SystemIds.DECIMAL],[known.n,SystemIds.INTEGER],
  ...['unit','followup','estimand','locator'].map(k=>[saga[`property/${k}`],SystemIds.TEXT] as [string,string]),
  [known.doi,SystemIds.TEXT],[ContentIds.WEB_URL_PROPERTY,SystemIds.TEXT],[SystemIds.MARKDOWN_CONTENT,SystemIds.TEXT],
  ...[known.sources,known.related,known.location,saga['property/entries'],model.studyCategoryProperty].map(p=>[p,SystemIds.RELATION] as [string,string])
]);
if(remaining)for(const p of model.properties)datatypes.set(prop(p.key),SystemIds.RELATION);
for(const [property,datatype] of datatypes){
  const {entity}=await gql<any>('query($id:UUID!){entity(id:$id){relations(first:30){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:property}});
  assert(!entity.relations.pageInfo.hasNextPage&&entity.relations.nodes.some((r:any)=>r.typeId===SystemIds.DATA_TYPE&&r.toEntityId===datatype),`Live datatype ${property}`);
}
if(remaining){
  const visual=JSON.parse(readFileSync(`${root}/star-experimental-pilot-visual.json`,'utf8'));
  const indexed=JSON.parse(readFileSync(`${root}/star-experimental-pilot-index-verification.json`,'utf8'));
  assert(visual.passed===true&&indexed.passed===true,'Pilot passes live API and rendered-field verification');
}
const dataset=id('dataset'),paper=id('paper'),study=id('study'),table=id('table'),armType=id('type/arm');
if(!remaining){
  for(const doi of [source.publication.doi,source.publication.workingPaperDoi]){
    const r=await gql<any>('query($doi:String!){valuesConnection(first:20,filter:{text:{includesInsensitive:$doi}}){nodes{entity{id}}pageInfo{hasNextPage}}}',{variables:{doi}});
    assert(!r.valuesConnection.pageInfo.hasNextPage&&r.valuesConnection.nodes.every((n:any)=>n.entity.id===paper),`Source version identity: ${doi}`);
  }
  await create(armType,model.armType.name,model.armType.description,SystemIds.SCHEMA_TYPE);
  for(const p of model.properties){
    await create(prop(p.key),p.name,p.description,SystemIds.PROPERTY);
    relation(`datatype/${p.key}`,prop(p.key),SystemIds.DATA_TYPE,SystemIds.RELATION);
    relation(`target/${p.key}`,prop(p.key),known.toTypes,p.target==='arm'?armType:known.topic);
  }
  for(const grade of model.gradeLevels)await create(id(`grade/${grade.key}`),grade.name,grade.description,known.topic);
  // Repair the missing category definition only in the destination perspective.
  ops.push(...Ops.entities.update({id:model.rctCategory,description:model.rctDescription}).ops);
  await create(study,model.studyName,'A Tennessee experiment that randomly assigned students and teachers within schools to small classes, regular classes, or regular classes with full-time aides.',model.studyType);
  relation('study/location',study,known.location,source.context.locationId);
  relation('study/category',study,model.studyCategoryProperty,model.rctCategory);
  await create(paper,source.publication.title,'A published analysis of Tennessee Project STAR’s effects on student achievement, using classroom assignment and observed class size.',ContentIds.ARTICLE_TYPE,[text(known.doi,source.publication.doi),text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]);
  relation('study/source',study,known.sources,paper);
  relation('paper/study',paper,known.related,study);
  relation('paper/economic-analysis',paper,known.related,economic.paper);
  notes('paper',paper,`## Publication details\n\n${source.publication.author}; ${source.publication.journal} ${source.publication.volume}(${source.publication.issue}), ${source.publication.pages} (${source.publication.year}).\n\nPublished DOI: ${source.publication.doi}. Earlier working-paper version: https://doi.org/${source.publication.workingPaperDoi}. This dataset extracts the published version’s Table V, column 7.`);
  for(const arm of model.arms){
    await create(id(`arm/${arm.key}`),arm.name,arm.description,armType);
    relation(`arm/${arm.key}/study`,id(`arm/${arm.key}`),known.related,study);
    relation(`arm/${arm.key}/source`,id(`arm/${arm.key}`),known.sources,paper);
  }
  await create(dataset,model.datasetName,model.datasetDescription,known.dataset,[text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]);
  relation('dataset/source',dataset,known.sources,paper);relation('dataset/study',dataset,known.related,study);relation('dataset/location',dataset,known.location,source.context.locationId);
  ops.push(...Ops.entities.update({id:table,name:'Achievement effects by grade and assigned class condition'}).ops);
  relation('table/type',table,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);
  relation('table/source',table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const attachment=relation('dataset/table',dataset,SystemIds.BLOCKS,table,'a0');
  relation('table/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  let previous:string|null=null;
  [prop('grades'),prop('interventionArms'),saga['property/estimate'],saga['property/se'],known.n,saga['property/unit'],prop('comparisonArms'),saga['property/locator']].forEach((p,i)=>{
    const position=Position.generateBetween(previous,null);previous=position;relation(`column/${i}`,attachment,SystemIds.PROPERTIES,p,position);
  });
  notes('dataset',dataset,`## Methods and interpretation\n\n${source.context.schoolYears}; within-school random assignment. The outcome is ${source.context.outcome} on the ${source.context.instrument}. ${source.context.normalization}.\n\nThese are ${source.context.estimand}s from Table V, column 7. Controls include ${source.context.controls.join(', ')}; teacher covariates are excluded. Standard errors are ${source.context.standardErrorMethod}. N is the ${source.context.sampleSizeMeaning}, not the number assigned to the intervention. Follow-up is ${source.context.followup}.\n\n${source.limitations.join('\n\n')}\n\nThe 2003 economic analysis is a separate model, not a matched observed-cost series for these eight estimates. No cost-effectiveness ranking or SD conversion is implied.\n\nSource: [${source.publication.title}](${source.publication.sourceUrl}), Table V, pp. 512–513; methods ${source.context.methodsLocator}.`,'a1');
}
const selected:any[]=[];
for(const [index,row] of source.estimates.entries()){
  const pilot=index===0;
  if(remaining?pilot:!pilot)continue;
  const arm=model.arms.find((a:any)=>a.sourceLabel===row.arm);
  assert(arm&&model.gradeLevels.some((g:any)=>g.key===row.grade),`Resolved grade and arm: ${row.key}`);
  const estimate=id(`estimate/${row.key}`),gradeLabel=row.grade==='K'?'kindergarten':`grade ${row.grade}`;
  const values=[decimal(saga['property/estimate'],row.value),decimal(saga['property/se'],row.standardError),integer(known.n,row.n),text(saga['property/unit'],source.context.unit),text(saga['property/followup'],`End of ${gradeLabel}`),text(saga['property/estimand'],source.context.estimand),text(saga['property/locator'],row.locator)];
  const copy=starExperimentalClaimCopy(row);
  await create(estimate,copy.name,copy.description,known.claim,[...values,{property:'da4a6c1f9d4446f9832ff3b49a4400ef',type:'boolean' as const,value:true}]);
  relation(`${row.key}/grade`,estimate,prop('grades'),id(`grade/${row.grade}`));
  relation(`${row.key}/arm`,estimate,prop('interventionArms'),id(`arm/${arm.key}`));
  relation(`${row.key}/comparison`,estimate,prop('comparisonArms'),id('arm/regular'));
  relation(`${row.key}/study`,estimate,known.related,study);relation(`${row.key}/source`,estimate,known.sources,paper);
  relation(`${row.key}/location`,estimate,known.location,source.context.locationId);
  relation(`${row.key}/entry`,dataset,saga['property/entries'],estimate);
  relation(`${row.key}/table`,table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,estimate,`a${index}`);
  selected.push({...row,id:estimate});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes),sha256=createHash('sha256').update(bytes).digest('hex');
assert(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'Additive facts; no deletions or unsets');
for(const row of selected){
  const sets=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===row.id).set;
  for(const [property,n] of [[saga['property/estimate'],row.value],[saga['property/se'],row.standardError]] as [string,number][]){const v=sets.find((s:any)=>s.property.$bytes===property).value;assert(Math.abs(Number(v.mantissa.value.$bigint)*10**v.exponent-n)<1e-10,`Source-to-SDK number ${row.key}/${property}`);}
  assert(sets.find((s:any)=>s.property.$bytes===known.n).value.value.$bigint===String(row.n),`Source-to-SDK N ${row.key}`);
}
for(const op of encoded.filter((o:any)=>o.type==='updateEntity')){
  assert(op.id.$bytes===model.rctCategory||encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===op.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),`Typed new entity ${op.id.$bytes}`);
}
const batch={name:remaining?'Add remaining seven STAR experimental achievement estimates':'Add STAR experimental study, structured arms and first achievement estimate',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:dataset,paperId:paper,studyId:study,blockId:table,selected,entities,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,registry:registryPath};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,limitations:model.limitations},null,2)+'\n');
console.log(JSON.stringify({batch:`${root}/${prefix}-batch.json`,operations:ops.length,datasetId:dataset,rows:selected.length,checks:checks.length,entities},null,2));
