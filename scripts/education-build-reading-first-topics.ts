import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-topics',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve existing journal');
const model=read(`${prefix}-model`),registry:Record<string,string>=read('reading-first-registry'),ops:Op[]=[],checks:string[]=[];
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const property=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:model.propertyId}});check(property.property?.dataTypeName==='Relation','Topics remains Relation');
const state=await gql<any>('query($id:UUID!,$space:UUID!,$type:UUID!){entity(id:$id){relations(first:30,filter:{spaceId:{is:$space},typeId:{is:$type}}){nodes{toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:registry.program,space:target.spaceId,type:model.propertyId}});
check(!state.entity.relations.pageInfo.hasNextPage,'Complete current topic relations');
for(const topic of model.topics){
 const data=await gql<any>('query($id:UUID!){entity(id:$id){name spaceIds types{id}}}',{variables:{id:topic.id}});
 check(data.entity.name===topic.name&&data.entity.types.some((t:any)=>t.id==='5ef5a5860f274d8e8f6c59ae5b3e89e2')&&data.entity.spaceIds.includes('b5a31f8182b042437ede0f84ee02f104'),`Reused topic ${topic.name}`);
 check(!state.entity.relations.nodes.some((r:any)=>r.toEntityId===topic.id),`No duplicate ${topic.name}`);
 ops.push(...Ops.relations.create({id:id(`relation/program/topic/${topic.key}`),entityId:id(`relation-entity/program/topic/${topic.key}`),fromEntity:registry.program!,type:model.propertyId,toEntity:topic.id}).ops);
}
check(ops.length===model.topics.length&&ops.every(o=>o.type==='createRelation'),'Only reviewed program associations; no new concepts or value edits');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Connect Reading First to existing literacy topics',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/reading-first-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
