import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {SystemIds as S,Position} from '@geoprotocol/geo-sdk';
import {buildCollection,allocatePositions,registryKeys,validatePlan,compareFact,hash,serializeOps,collectionIds,type CollectionPlan,type Fact} from '../src/education-collection';
import {validateSourceReview} from '../src/education-review';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {validateEducationTextEncoding} from '../src/education-text-encoding';
import {validateEducationDoiLinks} from '../src/education-doi';

const argument=(name:string)=>{const index=process.argv.indexOf(name);if(index<0||!process.argv[index+1]||process.argv[index+1]!.startsWith('--'))throw Error(`Required ${name} <file>`);return process.argv[index+1]!;};
const planPath=argument('--plan'),factsPath=argument('--facts'),reviewPath=argument('--review');
if(new Set([planPath,factsPath,reviewPath]).size!==3)throw Error('Plan, source facts and review must be separate files');
const load=(path:string)=>readFileSync(path,'utf8');const planBytes=load(planPath),factsBytes=load(factsPath),reviewBytes=load(reviewPath);
const plan=JSON.parse(planBytes) as CollectionPlan,facts=JSON.parse(factsBytes) as Fact[],review=JSON.parse(reviewBytes);
validatePlan(plan,facts);if(plan.spaceId!==target.spaceId||plan.bounty!==target.bountyId)throw Error('Unexpected destination/bounty');
const prefix=`data/education/${plan.key}`;if(existsSync(`${prefix}-publication.json`))throw Error('Submitted batch is immutable; prepare a separately reviewed delta');
validateSourceReview(review,hash(planBytes),hash(factsBytes),plan.sourceIds);
const rp=`${prefix}-registry.json`,registry:Record<string,string>=existsSync(rp)?JSON.parse(load(rp)):{};
for(const key of registryKeys(plan))registry[key]??=randomUUID().replaceAll('-','');
if(new Set(Object.values(registry)).size!==Object.values(registry).length)throw Error('Registry IDs collide');
writeFileSync(rp,JSON.stringify(registry,null,2)+'\n'); // Persist IDs before fallible network checks.
async function pages(query:string,variables:any,pick:(d:any)=>any){const result:any[]=[];let after:string|null=null;const seen=new Set<string>();for(let count=0;count<1000;count++){const c=pick(await gql(query,{variables:{...variables,after}}));result.push(...c.nodes);if(!c.pageInfo.hasNextPage)return result;if(!c.pageInfo.endCursor||seen.has(c.pageInfo.endCursor))throw Error('Incomplete pagination');after=c.pageInfo.endCursor;seen.add(after!);}throw Error('Pagination bound exceeded');}
const before:any[]=[];
for(const id of [...plan.sourceIds,...plan.relatedIds,plan.catalogId]){const d:any=await gql('query($id:UUID!){entity(id:$id){spaceIds types{id}}}',{variables:{id}});if(!d.entity?.spaceIds?.length)throw Error('Reused context identity absent');if(plan.sourceIds.includes(id)&&!d.entity.types.some((t:any)=>t.id==='a2a5ed0cacef46b1835de457956ce915'))throw Error('Expected source Article');if(id===plan.catalogId&&(!d.entity.spaceIds.includes(plan.spaceId)||!d.entity.types.some((t:any)=>t.id===S.DATA_BLOCK)))throw Error('Catalog must be a destination Data block');}
for(const fact of facts){
  const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name description values(first:100,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal integer boolean}pageInfo{hasNextPage}}relations(first:100,filter:{spaceId:{is:$space}}){nodes{id entityId typeId toEntityId position}pageInfo{hasNextPage}}}}',{variables:{id:fact.id,space:plan.spaceId}});compareFact(fact,d.entity,plan.allowUnlocatedContext===true);before.push({id:fact.id,...d.entity});
  const memberships=await pages('query($id:UUID!,$after:Cursor){relationsConnection(first:20,after:$after,filter:{toEntityId:{is:$id},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{id fromEntityId spaceId}pageInfo{hasNextPage endCursor}}}',{id:fact.id},d=>d.relationsConnection);
  if(memberships.length)throw Error(`Existing collection membership requires a reviewed delta: ${fact.id}`);
}
const schema=new Map<string,string>([[S.TYPES_PROPERTY,'Relation'],[S.BLOCKS,'Relation'],[S.COLLECTION_ITEM_RELATION_TYPE,'Relation'],[S.DATA_SOURCE_TYPE_RELATION_TYPE,'Relation'],[S.PROPERTIES,'Relation'],[S.VIEW_PROPERTY,'Relation'],[S.MARKDOWN_CONTENT,'Text'],[collectionIds.sources,'Relation'],[collectionIds.related,'Relation']]);
for(const c of plan.groups.flatMap(g=>g.columns)){if(schema.has(c.id)&&schema.get(c.id)!==c.dataType)throw Error('Conflicting schema requirement');schema.set(c.id,c.dataType);}
for(const [id,dataType] of schema){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});if(d.property?.dataTypeName!==dataType)throw Error(`Live schema mismatch: ${id}`);}
for(const id of Object.values(registry)){const d:any=await gql('query($id:UUID!){entity(id:$id){spaceIds}relation(id:$id){id}}',{variables:{id}});if(d.entity?.spaceIds?.length||d.relation)throw Error('Allocated ID already occupied');}
const catalog=await pages('query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){relations(first:20,after:$after,filter:{spaceId:{is:$space},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{toEntityId position toEntity{name}}pageInfo{hasNextPage endCursor}}}}',{id:plan.catalogId,space:plan.spaceId},d=>d.entity.relations);
catalog.sort((a,b)=>a.position<b.position?-1:1);if(catalog.some(m=>!m.position||!m.toEntity?.name)||new Set(catalog.map(m=>m.position)).size!==catalog.length)throw Error('Ambiguous catalog ordering');
const next=catalog.findIndex(m=>m.toEntity.name.localeCompare(plan.name,'en',{sensitivity:'base'})>0),previous=next<0?catalog.at(-1):catalog[next-1],following=next<0?null:catalog[next];
const pp=`${prefix}-positions.json`,positions=existsSync(pp)?JSON.parse(load(pp)):allocatePositions(plan);
// SDK positions include random jitter. Persist them, including catalog insertion, for repeat builds.
if(!positions['catalog/anchor']){positions['catalog/anchor']=hash(JSON.stringify(catalog));positions['catalog/member']=Position.generateBetween(previous?.position??null,following?.position??null);}
if(positions['catalog/anchor']!==hash(JSON.stringify(catalog)))throw Error('Catalog changed; review insertion and prepare a new position snapshot');
writeFileSync(pp,JSON.stringify(positions,null,2)+'\n');
const ops=buildCollection(plan,registry,positions['catalog/member'],positions);validateEducationTextEncoding(ops);validateEducationDoiLinks(ops);
const bytes=serializeOps(ops),sha256=hash(bytes),ref=(path:string)=>({path,sha256:hash(readFileSync(path))});
const binding={version:1,opsHash:sha256,inputs:[ref(planPath),ref(factsPath),ref(reviewPath),ref(rp),ref(pp),review.discovery,...review.sources.map((s:any)=>({path:s.path,sha256:s.sha256}))]};
const bindingPath=`${prefix}-review-binding.json`;writeFileSync(bindingPath,JSON.stringify(binding,null,2)+'\n');
const batch={publisherVersion:'collection-v1',name:plan.name,spaceId:plan.spaceId,bounty:plan.bounty,sha256,opsPath:`${prefix}-ops.json`,journalPath:`${prefix}-publication.json`,validationPath:`${prefix}-validation.json`,reviewBinding:ref(bindingPath),datasetId:registry.dataset,catalogId:plan.catalogId,groups:plan.groups.map(g=>({key:g.key,blockId:registry[`table/${g.key}`],memberIds:g.members})),operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${prefix}-before.json`,JSON.stringify(before,null,2)+'\n');writeFileSync(`${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,scope:'Reviewed inputs bound by hash; source-fact/live equality, cross-space memberships and schema checked. No claim of independent source judgment or rendered verification.'},null,2)+'\n');
console.log(JSON.stringify({mode:'prepared-only',batch:`${prefix}-batch.json`,operations:ops.length,reusedClaims:facts.length}));
