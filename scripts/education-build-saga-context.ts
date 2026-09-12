import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='saga-context',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted context payload');
const model=read('saga-context-model'),saga=read('saga-registry'),inspection=read('saga-context-inspection');
const registry:Record<string,string>=existsSync(`${root}/${prefix}-registry.json`)?read(`${prefix}-registry`):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[],evidence:any={checkedAt:new Date().toISOString(),properties:[],currentLinks:[]};
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
function rel(key:string,from:string,type:string,to:string){ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,type,toEntity:to}).ops);}
const related='dfa6aebe1ca94bf29faccc4cc7afb24c',sources='49c5d5e1679a4dbdbfd33f618f227c94',location='95d770021faf4f7cb7deb21a7d48cda0',paper=saga['paper/10.1257/aer.20210434'],dataset=saga['dataset/saga-chicago-trials'];
check(hash(readFileSync('tmp/pdfs/saga-2023.pdf'))==='16f0208e93a27d36fe4aecf9f744caadab5f40901c1a552b3f124230037fdf9c','Final article fingerprint, sample page visually reviewed');
check(inspection.aliases.every((p:any)=>p.complete&&p.nodes.length===0),'Complete all-space provider alias probes');
check(read('discovery/contains-saga').complete,'Broad all-space Saga name search complete; unrelated candidates reviewed');
for(const name of ['manual-0--370e3c21c20be17e','manual-1--ed47576a8435474f'])check(read(`identifiers/${name}`).probes.every((p:any)=>p.complete&&p.nodes.length===0),`Complete website identity ${name}`);
for(const type of [model.program.type,...model.organization.types,model.studyType,SystemIds.TEXT_BLOCK]){
 const state=await gql<any>('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:type}});check(state.entity?.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),`Existing Type ${type}`);
}
for(const [p,t] of [[model.providersProperty,'Relation'],[model.populationProperty,'Text'],[model.designProperty,'Text'],[saga['property/study'],'Integer'],...[saga['property/followup'],saga['property/locator'],ContentIds.WEB_URL_PROPERTY,SystemIds.MARKDOWN_CONTENT].map(p=>[p,'Text']),...[related,sources,location,SystemIds.TYPES_PROPERTY,SystemIds.BLOCKS].map(p=>[p,'Relation'])]){
 const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(data.property?.dataTypeName===t,`Live datatype ${p}`);evidence.properties.push({id:p,...data});
}
const source=await gql<any>('query($id:UUID!){entity(id:$id){name values(first:30){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:paper}});
check(!source.entity.values.pageInfo.hasNextPage&&source.entity.values.nodes.some((v:any)=>v.propertyId==='7cb59354e30c48119e99ff62fcf61646'&&v.text===model.sourceDoi),'Reuse exact final-article DOI identity');
const city=await gql<any>('query($id:UUID!){entity(id:$id){name}}',{variables:{id:model.chicagoId}});check(city.entity.name==='Chicago','Reuse verified Chicago identity');
const entities:any[]=[
 {key:'provider',...model.organization,values:[text(ContentIds.WEB_URL_PROPERTY,model.organization.website)]},
 {key:'program',name:model.program.name,description:model.program.description,types:[model.program.type],values:[]},
 {key:'notes/program',name:'Saga Chicago tutoring: delivery and provider context',types:[SystemIds.TEXT_BLOCK],values:[text(SystemIds.MARKDOWN_CONTENT,model.program.markdown)]}
];
for(const study of model.studies){
 entities.push({key:`study/${study.key}`,name:study.name,description:study.description,types:[model.studyType],values:[integer(saga['property/study'],Number(study.key)),text(model.populationProperty,study.population),text(model.designProperty,study.design),text(saga['property/followup'],study.followup),text(saga['property/locator'],study.locator)]});
 entities.push({key:`notes/study/${study.key}`,name:`${study.name}: sample and comparison`,types:[SystemIds.TEXT_BLOCK],values:[text(SystemIds.MARKDOWN_CONTENT,study.markdown)]});
}
for(const e of entities){
 const found=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name:e.name}});
 check(!found.entitiesConnection.pageInfo.hasNextPage&&found.entitiesConnection.nodes.every((n:any)=>n.id===id(e.key)),`Current all-space name ${e.name}`);
 check(!e.description||e.description.length<350,`Concise description ${e.key}`);
 ops.push(...Ops.entities.update({id:id(e.key),name:e.name,...(e.description?{description:e.description}:{}),values:e.values}).ops);
 for(const type of e.types)rel(`${e.key}/type/${type}`,id(e.key),SystemIds.TYPES_PROPERTY,type);
}
rel('provider/source',id('provider'),sources,paper);
rel('program/provider',id('program'),model.providersProperty,id('provider'));
rel('program/source',id('program'),sources,paper);rel('program/location',id('program'),location,model.chicagoId);
rel('program/notes',id('program'),SystemIds.BLOCKS,id('notes/program'));
rel('dataset/program-notes',dataset,SystemIds.BLOCKS,id('notes/program'));
rel('program/dataset',id('program'),related,dataset);rel('dataset/program',dataset,related,id('program'));
for(const study of model.studies){
 const key=`study/${study.key}`,studyId=id(key);
 rel(`${key}/source`,studyId,sources,paper);rel(`${key}/location`,studyId,location,model.chicagoId);
 rel(`${key}/program`,studyId,related,id('program'));rel(`program/${key}`,id('program'),related,studyId);
 rel(`${key}/dataset`,studyId,related,dataset);rel(`dataset/${key}`,dataset,related,studyId);
 rel(`${key}/notes`,studyId,SystemIds.BLOCKS,id(`notes/${key}`));
 for(const estimand of ['itt','tot']){
  const estimate=saga[`estimate/saga-s${study.key}-y1-math-${estimand}`];
  const current=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId integer}pageInfo{hasNextPage}}relations(first:30,filter:{spaceId:{is:$space},typeId:{is:"dfa6aebe1ca94bf29faccc4cc7afb24c"}}){nodes{toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:estimate,space:target.spaceId}});
  check(!current.entity.values.pageInfo.hasNextPage&&!current.entity.relations.pageInfo.hasNextPage,'Complete existing estimate read');
  check(current.entity.values.nodes.some((v:any)=>v.propertyId===saga['property/study']&&Number(v.integer)===Number(study.key)),`Correct trial for ${estimate}`);
  check(!current.entity.relations.nodes.some((r:any)=>r.toEntityId===studyId),'No duplicate study link');evidence.currentLinks.push({estimate,...current});
  rel(`${key}/${estimand}`,estimate,related,studyId);
 }
}
rel('cost/program',saga['cost/saga-2013-2015-annual-cost'],related,id('program'));
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',encoded=JSON.parse(bytes);
check(encoded.filter((o:any)=>o.type==='updateEntity').length===7,'Seven new typed context entities; existing numeric records untouched');
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No removals');
const sha256=hash(bytes),batch={name:'Connect Saga tutoring provider and separate Chicago trial contexts',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/${prefix}-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(`${root}/${prefix}-preparation.json`,JSON.stringify(evidence,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
