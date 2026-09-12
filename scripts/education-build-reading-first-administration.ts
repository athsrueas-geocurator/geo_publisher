import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-administration';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve existing publication');
const model=read(`${prefix}-model`),registry:Record<string,string>=read('reading-first-registry');
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
function rel(key:string,from:string,type:string,to:string){ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,type,toEntity:to}).ops);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
check(createHash('sha256').update(readFileSync(model.sourcePdf)).digest('hex')===model.sourceSha256,'Visually reviewed source fingerprint');
const discovery=read('federal-education-identity');
for(const term of [model.agencyName,'OESE',model.sourceName])check(discovery.probes.some((p:any)=>p.text===term&&p.complete&&p.nodes.length===0),`Complete all-space text identity ${term}`);
for(const file of ['manual-0-fulltext-ED502979-pdf','manual-1-about-ed-offices-oese','manual-2-']){
 const d=JSON.parse(readFileSync(`${root}/identifiers/${file}.json`,'utf8'));check(d.probes.every((p:any)=>p.complete&&p.nodes.length===0),`Complete identifier search ${file}`);
}
for(const [p,t] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[ContentIds.WEB_URL_PROPERTY,'Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.BLOCKS,'Relation'],[model.administeredById,'Relation'],['49c5d5e1679a4dbdbfd33f618f227c94','Relation']]){
 const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Live datatype ${p}`);
}
const schema=await gql<any>('query($id:UUID!){entity(id:$id){id name description types{id}relations(first:30){nodes{typeId type{name}toEntityId toEntity{name}spaceId}pageInfo{hasNextPage}}}}',{variables:{id:model.agencyTypeId}});
writeFileSync(`${root}/${prefix}-schema.json`,JSON.stringify(schema,null,2)+'\n');
check(schema.entity.name==='Federal agency'&&schema.entity.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),'Federal agency is a verified Type');
check(!schema.entity.relations.pageInfo.hasNextPage,'Complete bounded agency schema');
const state=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){relations(first:30,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:registry.program,space:target.spaceId}});
check(!state.entity.relations.pageInfo.hasNextPage&&!state.entity.relations.nodes.some((r:any)=>r.typeId===model.administeredById),'No existing administrator overwritten or duplicated');
const entities=[{key:'agency/oese',name:model.agencyName,description:model.agencyDescription,type:model.agencyTypeId,values:[]},{key:'source/ed-guide-2008',name:model.sourceName,description:model.sourceDescription,type:ContentIds.ARTICLE_TYPE,values:[text(ContentIds.WEB_URL_PROPERTY,model.sourceUrl)]},{key:'notes/administration',name:'Reading First administration and grant structure',type:SystemIds.TEXT_BLOCK,values:[text(SystemIds.MARKDOWN_CONTENT,model.markdown)]}];
for(const e of entities){
 const found=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name:e.name}});
 check(!found.entitiesConnection.pageInfo.hasNextPage&&found.entitiesConnection.nodes.every((n:any)=>n.id===id(e.key)),`Current name identity ${e.name}`);
 if(e.description)check(e.description.length<350,`Concise description ${e.key}`);
 ops.push(...Ops.entities.update({id:id(e.key),name:e.name,...(e.description?{description:e.description}:{}),values:e.values}).ops);rel(`${e.key}/type`,id(e.key),SystemIds.TYPES_PROPERTY,e.type);
}
rel('program/administered-by',registry.program!,model.administeredById,id('agency/oese'));
rel('agency/oese/source',id('agency/oese'),'49c5d5e1679a4dbdbfd33f618f227c94',id('source/ed-guide-2008'));
rel('program/administration-source',registry.program!,'49c5d5e1679a4dbdbfd33f618f227c94',id('source/ed-guide-2008'));
rel('program/administration-block',registry.program!,SystemIds.BLOCKS,id('notes/administration'));
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Document Reading First administration and grant structure',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/reading-first-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
