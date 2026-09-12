import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='original-reused-categories',category='06c899fb04334e679feb1fd56687c3d6',categoryType='52e68966a4f743d3a7ae6cca8f838514',types='8f151ba4de204e3c9cb499ddf96f48f1';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const source=read('source/content/initiatives'),state=read('original-link-state'),discovery=read('original-category-discovery');
const mappings=[{sourceCategory:'Literacy',id:'5a86d2f3657b4b5baabef07a3393e408',name:'U.S. literacy education',reason:'Original initiatives concern US literacy education; reuse the existing educational topic as the classification, not a new generic literacy entity.'},{sourceCategory:'Early childhood',id:'0df9fad9098d4b11bacb9af0f7a79182',name:'Early childhood education',reason:'Original category groups early-childhood education programs; reuse the existing education topic rather than a new age-stage entity.'}];
const registryPath=`${root}/${prefix}-registry.json`;
const registry=existsSync(registryPath)?read(`${prefix}-registry`):{ids:{}};
const id=(key:string)=>registry.ids[key]??(registry.ids[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[];const records:any[]=[];const evidence:any[]=[];
async function relations(entityId:string){
 const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql('query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){name relations(first:50,after:$after,filter:{spaceId:{is:$space}}){nodes{id typeId toEntityId}pageInfo{hasNextPage endCursor}}}}',{variables:{id:entityId,space:target.spaceId,after}});
 if(!d.entity)throw Error('Missing entity');const p=d.entity.relations;nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)return {name:d.entity.name,nodes};if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);
 }while(true);
}
for(const property of [category,types]){const s:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});if(s.property?.dataTypeName!=='Relation')throw Error('Expected relation schema');}
function link(from:string,type:string,to:string,key:string){ops.push(...Ops.relations.create({id:id(key),entityId:id(`${key}/entity`),fromEntity:from,toEntity:to,type}).ops);}
for(const mapping of mappings){
 const search=discovery.rows.find((r:any)=>r.term===mapping.sourceCategory);
 if(!search?.searches.every((s:any)=>s.complete)||!search.searches.some((s:any)=>s.nodes.some((n:any)=>n.id===mapping.id)))throw Error('Missing all-space discovery evidence');
 const live=await relations(mapping.id);if(live.name!==mapping.name)throw Error('Category identity changed');
 if(!live.nodes.some(r=>r.typeId===types&&r.toEntityId===categoryType))link(mapping.id,types,categoryType,`type/${mapping.id}`);
 evidence.push({mapping,live});
 for(const original of source.filter((r:any)=>r.category===mapping.sourceCategory)){
  const program=state.rows.find((r:any)=>r.key===original.id);if(!program)continue;
  const current=await relations(program.id);if(current.name!==original.name)throw Error('Program identity changed');
  const existing=current.nodes.filter(r=>r.typeId===category);
  if(existing.some(r=>r.toEntityId!==mapping.id))throw Error('Conflicting category');
  const key=`category/${program.id}`;if(!existing.length)link(program.id,category,mapping.id,key);
  records.push({migrationKey:`initiatives:${original.id}`,entityId:program.id,sourceCategory:original.category,categoryId:mapping.id,relationId:existing[0]?.id??id(key)});
 }
}
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Restore literacy and early-childhood categories using existing Geo entities',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length,records};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:ops.length>0,checkedAt:new Date().toISOString(),opsHash:sha256,scope:'Existing-entity reuse, original category membership; added Category typing only in destination; no rating or effect assertions',evidence,records},null,2)+'\n');
console.log(JSON.stringify({operations:ops.length,records}));
