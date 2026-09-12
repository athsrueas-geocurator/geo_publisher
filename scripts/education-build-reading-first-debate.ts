import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',stage=process.argv.includes('--topics')?'topics':process.argv.includes('--arguments')?'arguments':'related',prefix=`reading-first-debate-${stage}`;
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read('reading-first-debate-model'),rf=read('reading-first-registry'),copy=read('reading-first-achievement-copy-review');
const registryPath=`${root}/reading-first-debate-registry.json`,registry=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const p={claim:'96f859efa1ca4b229372c86ad58b694b',factual:'da4a6c1f9d4446f9832ff3b49a4400ef',related:'504e5776788844f6a77dba3ee811d8f0',support:'1dc6a843458848198e7a6e672268f811',oppose:'4e6ec5d14292498a84e5f607ca1a08ce',sources:'49c5d5e1679a4dbdbfd33f618f227c94',context:'dfa6aebe1ca94bf29faccc4cc7afb24c'};
const checks:string[]=[],ops:Op[]=[],edges:any[]=[];
const topicsProperty='806d52bc27e94c9193c057978b093351';
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
for(const parent of model.parents)id(parent.key);
for(const evidence of model.evidence)registry[evidence.key]=rf[evidence.registryKey];
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
if(stage==='arguments'){
 check(read('reading-first-debate-related-index-verification').passed,'Related grouping verified before argument classification');
 const review=read('reading-first-debate-argument-review');
 check(review.prerequisiteProposal===read('reading-first-debate-related-publication').proposalId&&review.approvedPairs.length===model.pairs.length,'Post-publication bracket review');
 for(const pair of model.pairs)check(review.approvedPairs.some((p:any)=>p.a===pair.a&&p.b===pair.b&&p.bracket===pair.bracket&&(p.direction??null)===(pair.argumentDirection??null)),`Re-adjudicated pair ${pair.a}/${pair.b}`);
}
check(read('reading-first-debate-discovery').targets.every((t:any)=>t.complete),'Complete source-neighborhood discovery');
check(read('debate-proposition-discovery').searches.find((s:any)=>s.term==='Reading First')?.complete,'Complete all-space family search');
for(const [property,expected] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[p.factual,'Checkbox'],...[p.related,p.support,p.oppose,p.sources,p.context].map(v=>[v,'Relation'])]){
 const d=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});check(d.property?.dataTypeName===expected,`Schema ${property} ${expected}`);
}
for(const evidence of model.evidence){
 const entityId=registry[evidence.key],expected=copy.find((r:any)=>r.id===entityId);
 const d=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text boolean}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space:target.spaceId}});
 check(expected&&d.entity.types.some((t:any)=>t.id===p.claim)&&!d.entity.values.pageInfo.hasNextPage,`Reviewed existing evidence ${evidence.key}`);
 check(d.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.NAME_PROPERTY&&v.text===expected.after.name)&&d.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.DESCRIPTION_PROPERTY&&v.text===expected.after.description),`Current evidence copy ${evidence.key}`);
 if(stage==='related'&&!d.entity.values.nodes.some((v:any)=>v.propertyId===p.factual&&v.boolean===true)){
  check(!d.entity.values.nodes.some((v:any)=>v.propertyId===p.factual),'Do not overwrite existing factual classification');
  ops.push(...Ops.entities.update({id:entityId,values:[{property:p.factual,type:'boolean',value:true}]}).ops);
 }
}
async function edge(from:string,type:string,to:string){
 const edgeId=type.slice(0,8)+from.slice(0,12)+to.slice(0,12),entityId=type.slice(0,8)+to.slice(0,12)+from.slice(0,12);
 const existing=await gql<any>('query($from:UUID!,$to:UUID!,$type:UUID!,$space:UUID!,$id:UUID!){same:relations(first:2,filter:{fromEntityId:{is:$from},toEntityId:{is:$to},typeId:{is:$type},spaceId:{is:$space}}){id}collision:relations(first:2,filter:{id:{is:$id}}){fromEntityId toEntityId typeId spaceId}}',{variables:{from,to,type,space:target.spaceId,id:edgeId}});
 check(existing.collision.every((r:any)=>r.fromEntityId===from&&r.toEntityId===to&&r.typeId===type&&r.spaceId===target.spaceId),`No edge collision ${edgeId}`);
 if(existing.same.length)return;
 check(!edges.some(e=>e.id===edgeId),`No duplicate planned edge ${edgeId}`);
 ops.push(...Ops.relations.create({id:edgeId,entityId,fromEntity:from,type,toEntity:to}).ops);edges.push({id:edgeId,entityId,from,type,to});
}
for(const parent of model.parents){
 const entityId=registry[parent.key];
 const d=await gql<any>('query($name:String!,$id:UUID!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}entity(id:$id){spaceIds types{id}name}}',{variables:{name:parent.name,id:entityId}});
 check(!d.entitiesConnection.pageInfo.hasNextPage&&d.entitiesConnection.nodes.every((e:any)=>e.id===entityId),`Exact cross-space parent identity ${parent.key}`);
 if(stage==='related'){
  check(!d.entity?.spaceIds?.length,'New parent ID unoccupied');check(parent.description.length<=350&&!parent.isFactual,'Concise explicitly evaluative parent');
  ops.push(...Ops.entities.update({id:entityId,name:parent.name,description:parent.description,values:[{property:p.factual,type:'boolean',value:false}]}).ops);
  await edge(entityId,SystemIds.TYPES_PROPERTY,p.claim);await edge(entityId,p.sources,rf.paper);await edge(entityId,p.context,rf.study);await edge(entityId,p.context,rf.dataset);await edge(rf.dataset,p.context,entityId);
 }else check(d.entity.spaceIds.includes(target.spaceId)&&d.entity.types.some((t:any)=>t.id===p.claim)&&d.entity.name===parent.name,'Published parent unchanged');
}
if(stage==='topics'){
 const d=await gql<any>('query($id:UUID!,$property:UUID!){entity(id:$id){name spaceIds types{id}}property(id:$property){dataTypeName}}',{variables:{id:model.topicId,property:topicsProperty}});
 check(d.entity?.name===model.topicName&&d.entity.spaceIds.length&&d.entity.types.some((t:any)=>t.id==='5ef5a5860f274d8e8f6c59ae5b3e89e2')&&d.property?.dataTypeName==='Relation','Reuse verified Reading education Topic across spaces');
 for(const entityId of Object.values(registry) as string[])await edge(entityId,topicsProperty,model.topicId);
}
for(const pair of model.pairs){
 if(stage==='topics')continue;
 check(pair.confidence==='high'&&pair.reason,'Explicit per-pair rationale');const a=registry[pair.a],b=registry[pair.b];check(a&&b,'Resolved stable endpoints');
 if(stage==='related'){await edge(a,p.related,b);if(pair.related==='both')await edge(b,p.related,a);}
 else if(pair.bracket!=='RELATED-ONLY'){
  check(['SUPPORTS','OPPOSES'].includes(pair.bracket),'Supported bracket');const property=pair.bracket==='SUPPORTS'?p.support:p.oppose;
  await edge(a,property,b);if(pair.argumentDirection==='both')await edge(b,property,a);
 }
}
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:stage==='topics'?'Connect Reading First debate and evidence through Reading education':stage==='related'?'Connect Reading First success debates to their research evidence':'Add supporting and opposing arguments to Reading First success debates',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,modelHash:createHash('sha256').update(readFileSync(`${root}/reading-first-debate-model.json`)).digest('hex'),checks,edges},null,2)+'\n');console.log(JSON.stringify({batch,registry,checks:checks.length,edges:edges.length}));
