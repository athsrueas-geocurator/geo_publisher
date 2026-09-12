import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-program';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve existing publication journal');
const model=read('reading-first-program-model'),registry:Record<string,string>=read('reading-first-registry'),saga=read('saga-registry');
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
function relation(key:string,from:string,type:string,to:string){ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,type,toEntity:to}).ops);}
async function identity(name:string,expected:string){const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});check(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===expected),`Cross-space identity ${name}`);}
const types=new Map<string,string>([[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[saga['property/locator'],'Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.BLOCKS,'Relation'],['49c5d5e1679a4dbdbfd33f618f227c94','Relation'],['dfa6aebe1ca94bf29faccc4cc7afb24c','Relation'],['95d770021faf4f7cb7deb21a7d48cda0','Relation']]);
for(const [p,t] of types){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Live datatype ${p}/${t}`);}
const type=await gql<any>('query($id:UUID!){entity(id:$id){name description types{id}}}',{variables:{id:model.typeId}});
check(type.entity?.name==='Grant program'&&type.entity.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),'Reused Grant program is a Type');
check(type.entity.description==='A funding program that provides grants to researchers, builders, or organizations.','Reviewed type meaning');
for(const key of ['study','paper','dataset']){const r=await gql<any>('query($id:UUID!){entity(id:$id){id}}',{variables:{id:registry[key]}});check(r.entity?.id===registry[key],`Existing ${key}`);}
await identity(model.name,id('program'));await identity('Reading First program and evaluation context',id('notes/program'));
check(model.description.length<=350&&model.description.split(/(?<=[.!?])\s+(?=[A-Z])/).length<=2,'Concise description');
ops.push(...Ops.entities.update({id:id('program'),name:model.name,description:model.description,values:[text(saga['property/locator'],model.locator)]}).ops);
relation('program/type',id('program'),SystemIds.TYPES_PROPERTY,model.typeId);
relation('program/source',id('program'),'49c5d5e1679a4dbdbfd33f618f227c94',registry.paper!);
relation('program/location',id('program'),'95d770021faf4f7cb7deb21a7d48cda0','0093d90725d94cb08903515673538d40');
for(const key of ['study','dataset']){relation(`program/${key}`,id('program'),'dfa6aebe1ca94bf29faccc4cc7afb24c',registry[key]!);relation(`${key}/program`,registry[key]!,'dfa6aebe1ca94bf29faccc4cc7afb24c',id('program'));}
ops.push(...Ops.entities.update({id:id('notes/program'),name:'Reading First program and evaluation context',values:[text(SystemIds.MARKDOWN_CONTENT,model.markdown)]}).ops);
relation('notes/program/type',id('notes/program'),SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
relation('notes/program/attachment',id('program'),SystemIds.BLOCKS,id('notes/program'));
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes);
check(encoded.filter((o:any)=>o.type==='updateEntity').length===2,'Only program and context block created');
for(const o of encoded.filter((o:any)=>o.type==='updateEntity'))check(encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===o.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),'New entity typed');
check(encoded.every((o:any)=>!o.unset?.length&&['updateEntity','createRelation'].includes(o.type)),'No deletions');
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Connect Reading First grant program to its evaluation and dataset',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,programId:id('program'),datasetId:registry.dataset,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/reading-first-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
