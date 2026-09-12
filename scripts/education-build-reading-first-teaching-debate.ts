import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-teaching-debate',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const model=read(`${prefix}-model`),discovery=read(`${prefix}-discovery`),rf=read('reading-first-registry'),parents=read('reading-first-debate-registry'),copy=read('reading-first-practice-copy-review');
const registryPath=`${root}/${prefix}-registry.json`,registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>{if(!registry[key]){registry[key]=randomUUID().replaceAll('-','');writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');}return registry[key]!;};
const ops:Op[]=[],checks:string[]=[],edges:any[]=[];
const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
const p={factual:'da4a6c1f9d4446f9832ff3b49a4400ef',claim:'96f859efa1ca4b229372c86ad58b694b',related:'504e5776788844f6a77dba3ee811d8f0',support:'1dc6a843458848198e7a6e672268f811',oppose:'4e6ec5d14292498a84e5f607ca1a08ce',sources:'49c5d5e1679a4dbdbfd33f618f227c94',context:'dfa6aebe1ca94bf29faccc4cc7afb24c',topics:'806d52bc27e94c9193c057978b093351'};
check(discovery.complete&&discovery.nodes.length===95,'Complete all-space name discovery reviewed');
check(read('reading-first-practice-copy-index-verification').passed,'Repaired factual evidence indexed');
for(const [property,type] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[p.factual,'Checkbox'],...[SystemIds.TYPES_PROPERTY,p.related,p.support,p.oppose,p.sources,p.context,p.topics].map(v=>[v,'Relation'])]){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});check(d.property?.dataTypeName===type,`Schema ${property}`);}
const parent=id('parent');
const duplicates:any=await gql('query($name:String!,$id:UUID!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}entity(id:$id){name types{id}}}',{variables:{name:model.name,id:parent}});
check(!duplicates.entitiesConnection.pageInfo.hasNextPage&&!duplicates.entitiesConnection.nodes.length&&!duplicates.entity,'No existing exact name or allocated identity');
for(const key of [...model.support,...model.context]){
 const expected=copy.find((r:any)=>r.key===key),entityId=rf[`estimate/${key}`];
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text boolean}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space:target.spaceId}});
 check(expected&&d.entity?.types.some((t:any)=>t.id===p.claim)&&!d.entity.values.pageInfo.hasNextPage&&d.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.NAME_PROPERTY&&v.text===expected.after.name)&&d.entity.values.nodes.some((v:any)=>v.propertyId===p.factual&&v.boolean===true),`Reused factual evidence ${key}`);
}
for(const [entityId,type] of [[parents[model.opponentKey],p.claim],[parents[model.relatedParentKey],p.claim],[model.topicId,'5ef5a5860f274d8e8f6c59ae5b3e89e2'],[rf.paper,'a2a5ed0cacef46b1835de457956ce915'],[rf.study,'3ef269bc5f114691abc02dcbf398fd63'],[rf.dataset,'0c4babfb43893486af827341bbf32e09']]){const d:any=await gql('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:entityId}});check(d.entity?.types.some((t:any)=>t.id===type),`Reused typed target ${entityId}`);if(entityId===parents[model.opponentKey])check(d.entity.name===model.opponentName,'Opposing criterion unchanged');}
ops.push(...Ops.entities.update({id:parent,name:model.name,description:model.description,values:[{property:p.factual,type:'boolean',value:false}]}).ops);
function edge(from:string,type:string,to:string){const key=`${from}/${type}/${to}`;ops.push(...Ops.relations.create({id:id(`${key}/edge`),entityId:id(`${key}/entity`),fromEntity:from,type,toEntity:to}).ops);edges.push({from,type,to});}
edge(parent,SystemIds.TYPES_PROPERTY,p.claim);edge(parent,p.sources,rf.paper);edge(parent,p.context,rf.study);edge(parent,p.context,rf.dataset);edge(parent,p.topics,model.topicId);
for(const key of [...model.support,...model.context]){const e=rf[`estimate/${key}`];edge(parent,p.related,e);edge(e,p.related,parent);if(model.support.includes(key))edge(parent,p.support,e);}
for(const key of [model.opponentKey,model.relatedParentKey]){edge(parent,p.related,parents[key]);edge(parents[key],p.related,parent);}
edge(parent,p.oppose,parents[model.opponentKey]);edge(parents[model.opponentKey],p.oppose,parent);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Debate whether Reading First teaching improvements justify success',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,edges,model},null,2)+'\n');console.log(JSON.stringify({parent,operations:ops.length,checks:checks.length}));
