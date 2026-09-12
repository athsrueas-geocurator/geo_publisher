import {createHash} from 'node:crypto';
import {Ops, SystemIds as S, Position, type Op} from '@geoprotocol/geo-sdk';

export const collectionIds={dataset:'0c4babfb43893486af827341bbf32e09',sources:'49c5d5e1679a4dbdbfd33f618f227c94',related:'dfa6aebe1ca94bf29faccc4cc7afb24c',factual:'da4a6c1f9d4446f9832ff3b49a4400ef'};
export type ExpectedValue={propertyId:string;field:'text'|'decimal'|'integer'|'boolean';value:string|boolean};
export type Fact={id:string;sourceId:string;locator:string;classification:'observed'|'modeled'|'study-design';context:string;name:string;description:string;values:ExpectedValue[];/** Properties reviewed as absent/not reported for this Claim. */missingPropertyIds?:string[]};
export type CollectionPlan={version:1;key:string;spaceId:string;bounty:string;name:string;description:string;notes:string;sourceIds:string[];relatedIds:string[];catalogId:string;allowUnlocatedContext?:boolean;groups:{key:string;name:string;columns:{id:string;dataType:string}[];members:string[]}[]};
export type GraphEntity={values:{nodes:any[];pageInfo:{hasNextPage:boolean}};relations:{nodes:any[];pageInfo:{hasNextPage:boolean}}};
const uuid=(s:unknown)=>typeof s==='string'&&/^[a-f0-9]{32}$/.test(s);
export const serializeOps=(ops:Op[])=>JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
export const hash=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
export function validatePlan(plan:CollectionPlan,facts:Fact[]) {
  if(plan.version!==1||!(/^[a-z0-9-]+$/.test(plan.key)))throw Error('Invalid collection plan version/key');
  for(const id of [plan.spaceId,plan.bounty,plan.catalogId,...plan.sourceIds,...plan.relatedIds,...facts.flatMap(f=>[f.id,f.sourceId,...f.values.map(v=>v.propertyId),...(f.missingPropertyIds??[])]),...plan.groups.flatMap(g=>[...g.members,...g.columns.map(c=>c.id)])])if(!uuid(id))throw Error('Invalid plan/fact ID');
  for(const text of [plan.name,plan.description,plan.notes])if(typeof text!=='string'||!text.trim())throw Error('Missing reviewed collection copy');
  if(!plan.sourceIds.length||!plan.groups.length||!facts.length)throw Error('Empty source/groups/facts');
  const members=plan.groups.flatMap(g=>g.members);
  if(new Set(members).size!==members.length||new Set(facts.map(f=>f.id)).size!==facts.length||members.length!==facts.length||members.some(id=>!facts.some(f=>f.id===id)))throw Error('Facts must cover exactly the unique collection members');
  if(new Set(plan.groups.map(g=>g.key)).size!==plan.groups.length)throw Error('Duplicate group key');
  for(const g of plan.groups)if(!/^[a-z0-9-]+$/.test(g.key)||!g.name?.trim()||!g.members.length||new Set(g.columns.map(c=>c.id)).size!==g.columns.length)throw Error('Invalid group');
  for(const f of facts){
    const contextOnly=plan.allowUnlocatedContext===true&&f.classification==='study-design';
    if((!contextOnly&&!f.locator?.trim())||!f.context?.trim()||!f.name?.trim()||!f.description?.trim()||!['observed','modeled','study-design'].includes(f.classification)||!plan.sourceIds.includes(f.sourceId)||(!contextOnly&&!f.values.length))throw Error('Fact lacks reviewed name/description/source/context/classification/values');
    if(new Set(f.values.map(v=>v.propertyId)).size!==f.values.length)throw Error('Duplicate expected property');
    if(new Set(f.missingPropertyIds??[]).size!==(f.missingPropertyIds??[]).length||f.missingPropertyIds?.some(p=>f.values.some(v=>v.propertyId===p)))throw Error('Missing-value assertions must be unique and separate from expected values');
    const group=plan.groups.find(g=>g.members.includes(f.id))!;
    for(const propertyId of group.columns.map(c=>c.id))if(!f.values.some(v=>v.propertyId===propertyId))throw Error('Source fact review must cover every displayed column');
    for(const v of f.values)if(!['text','decimal','integer','boolean'].includes(v.field)||(v.field==='boolean'?typeof v.value!=='boolean':typeof v.value!=='string'))throw Error('Expected facts need typed literal values (numeric strings preserve precision)');
  }
}
function numeric(value:unknown):string {
  if(typeof value!=='string'||!(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)))throw Error('Unsupported numeric representation; review explicitly');
  let [whole,fraction='']=value.replace(/^\+/,'').split('.');const negative=whole!.startsWith('-');whole=whole!.replace(/^-/,'').replace(/^0+/,'')||'0';fraction=fraction.replace(/0+$/,'');
  return `${negative&&(whole!=='0'||fraction)?'-':''}${whole}${fraction?'.'+fraction:''}`;
}
export function compareFact(fact:Fact,live:GraphEntity,allowUnlocatedContext=false) {
  if(!live||live.values.pageInfo.hasNextPage||live.relations.pageInfo.hasNextPage)throw Error(`Incomplete Claim read: ${fact.id}`);
  if(!live.values.nodes.some(v=>v.propertyId===collectionIds.factual&&v.boolean===true)||!live.relations.nodes.some(r=>r.typeId===collectionIds.sources&&r.toEntityId===fact.sourceId))throw Error(`Factual/source mismatch: ${fact.id}`);
  if((live as any).name!==fact.name||(live as any).description!==fact.description)throw Error(`Claim header mismatch: ${fact.id}`);
  if(!live.relations.nodes.some(r=>r.typeId===S.TYPES_PROPERTY&&r.toEntityId==='96f859efa1ca4b229372c86ad58b694b'))throw Error(`Expected Claim type in destination: ${fact.id}`);
  if(fact.locator){if(!live.values.nodes.some(v=>v.propertyId==='84dacbddca6a44079edb5e11a4c66b40'&&v.text===fact.locator))throw Error(`Source locator mismatch: ${fact.id}`);}else if(!(allowUnlocatedContext&&fact.classification==='study-design'))throw Error(`Missing source locator: ${fact.id}`);
  for(const expected of fact.values){const matches=live.values.nodes.filter(v=>v.propertyId===expected.propertyId);if(matches.length!==1)throw Error(`Missing/ambiguous expected fact: ${fact.id}/${expected.propertyId}`);const actual=matches[0][expected.field];const number=expected.field==='decimal'||expected.field==='integer';if(number?numeric(actual)!==numeric(expected.value):actual!==expected.value)throw Error(`Source-fact mismatch: ${fact.id}/${expected.propertyId}`);}
  for(const propertyId of fact.missingPropertyIds??[])if(live.values.nodes.some(v=>v.propertyId===propertyId))throw Error(`Reviewed-missing property is present: ${fact.id}/${propertyId}`);
}
/** Pure deterministic structural builder. It never updates reused Claims or publishes. */
export function buildCollection(plan:CollectionPlan,registry:Record<string,string>,catalogPosition:string,positions:Record<string,string>):Op[] {
  const ordered=(keys:string[])=>{const values=keys.map(k=>positions[k]);if(values.some(v=>!v)||values.some((v,i)=>i>0&&v!<=values[i-1]!))throw Error('Persisted positions do not match reviewed order; prepare a new position snapshot');};
  ordered(['notes/attach',...plan.groups.map(g=>`${g.key}/attach`)]);
  for(const g of plan.groups){ordered(g.columns.map(c=>`${g.key}/column/${c.id}`));ordered(g.members.map(id=>`${g.key}/member/${id}`));}
  const id=(key:string)=>{const value=registry[key];if(!uuid(value))throw Error(`Missing persisted ID: ${key}`);return value;};
  const ops:Op[]=[];const dataset=id('dataset');
  function relation(key:string,from:string,type:string,to:string,position=positions[key]){if(!position)throw Error(`Missing persisted position: ${key}`);ops.push(...Ops.relations.create({id:id(`edge/${key}`),entityId:id(`relation/${key}`),fromEntity:from,type,toEntity:to,position}).ops);}
  ops.push(...Ops.entities.update({id:dataset,name:plan.name,description:plan.description}).ops);
  relation('dataset/type',dataset,S.TYPES_PROPERTY,collectionIds.dataset);
  for(const source of plan.sourceIds)relation(`dataset/source/${source}`,dataset,collectionIds.sources,source);
  for(const related of plan.relatedIds)relation(`dataset/related/${related}`,dataset,collectionIds.related,related);
  const notes=id('notes');ops.push(...Ops.entities.update({id:notes,name:'Reading the findings',values:[{property:S.MARKDOWN_CONTENT,type:'text',value:plan.notes}]}).ops);
  relation('notes/type',notes,S.TYPES_PROPERTY,S.TEXT_BLOCK);relation('notes/attach',dataset,S.BLOCKS,notes);
  for(const g of plan.groups){const block=id(`table/${g.key}`);ops.push(...Ops.entities.update({id:block,name:g.name}).ops);relation(`${g.key}/type`,block,S.TYPES_PROPERTY,S.DATA_BLOCK);relation(`${g.key}/source`,block,S.DATA_SOURCE_TYPE_RELATION_TYPE,S.COLLECTION_DATA_SOURCE);relation(`${g.key}/attach`,dataset,S.BLOCKS,block);const attach=id(`relation/${g.key}/attach`);relation(`${g.key}/view`,attach,S.VIEW_PROPERTY,S.TABLE_VIEW);for(const c of g.columns)relation(`${g.key}/column/${c.id}`,attach,S.PROPERTIES,c.id);for(const member of g.members)relation(`${g.key}/member/${member}`,block,S.COLLECTION_ITEM_RELATION_TYPE,member);}
  relation('catalog/member',plan.catalogId,S.COLLECTION_ITEM_RELATION_TYPE,dataset,catalogPosition);return ops;
}
export function registryKeys(plan:CollectionPlan):string[]{
  const rel=['dataset/type',...plan.sourceIds.map(id=>`dataset/source/${id}`),...plan.relatedIds.map(id=>`dataset/related/${id}`),'notes/type','notes/attach','catalog/member',...plan.groups.flatMap(g=>[`${g.key}/type`,`${g.key}/source`,`${g.key}/attach`,`${g.key}/view`,...g.columns.map(c=>`${g.key}/column/${c.id}`),...g.members.map(id=>`${g.key}/member/${id}`)])];
  return ['dataset','notes',...plan.groups.map(g=>`table/${g.key}`),...rel.flatMap(k=>[`edge/${k}`,`relation/${k}`])];
}
export function allocatePositions(plan:CollectionPlan):Record<string,string>{
  const result:Record<string,string>={};for(const key of registryKeys(plan).filter(k=>k.startsWith('edge/')))result[key.slice(5)]=Position.generate();
  const order=(keys:string[])=>{let prior:string|null=null;for(const key of keys){result[key]=Position.generateBetween(prior,null);prior=result[key]!;}};
  order(['notes/attach',...plan.groups.map(g=>`${g.key}/attach`)]);
  for(const g of plan.groups){order(g.columns.map(c=>`${g.key}/column/${c.id}`));order(g.members.map(id=>`${g.key}/member/${id}`));}return result;
}
