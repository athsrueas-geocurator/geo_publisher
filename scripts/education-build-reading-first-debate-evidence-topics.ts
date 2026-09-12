import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-debate-evidence-topics',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const model=read('reading-first-teaching-debate-model'),rf=read('reading-first-registry'),path=`${root}/reading-first-teaching-debate-registry.json`,registry=JSON.parse(readFileSync(path,'utf8'));
const ops:Op[]=[],checks:string[]=[];const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
const id=(key:string)=>{if(!registry[key]){registry[key]=randomUUID().replaceAll('-','');writeFileSync(path,JSON.stringify(registry,null,2)+'\n');}return registry[key];};
const property='806d52bc27e94c9193c057978b093351';
const schema:any=await gql('query($property:UUID!,$topic:UUID!){property(id:$property){dataTypeName}entity(id:$topic){name types{id}}}',{variables:{property,topic:model.topicId}});
check(schema.property?.dataTypeName==='Relation'&&schema.entity?.name==='Reading education'&&schema.entity.types.some((t:any)=>t.id==='5ef5a5860f274d8e8f6c59ae5b3e89e2'),'Reuse live Reading education Topic and relation schema');
for(const key of [...model.support,...model.context]){
 const from=rf[`estimate/${key}`];const d:any=await gql('query($id:UUID!,$space:UUID!,$type:UUID!){entity(id:$id){types{id}relations(first:30,filter:{spaceId:{is:$space},typeId:{is:$type}}){nodes{toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:from,space:target.spaceId,type:property}});
 check(d.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!d.entity.relations.pageInfo.hasNextPage,'Complete existing Claim topics');
 check(!d.entity.relations.nodes.some((r:any)=>r.toEntityId===model.topicId),`No duplicate Topic ${key}`);
 ops.push(...Ops.relations.create({id:id(`topic/${key}/edge`),entityId:id(`topic/${key}/entity`),fromEntity:from,type:property,toEntity:model.topicId}).ops);
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Expose Reading First teaching evidence in the debate gallery',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,checks:checks.length}));
