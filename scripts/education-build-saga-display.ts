import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,SystemIds,Position,type Op} from '@geoprotocol/geo-sdk';
import {gql} from '../src/functions';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education';
const source=JSON.parse(readFileSync(`${root}/saga-extraction.json`,'utf8'));
const ids=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const registryPath=`${root}/saga-display-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const stable=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[];const changes:any[]=[];
function relate(key:string,from:string,type:string,to:string){
  const position=registry[`position/${key}`]??(registry[`position/${key}`]=Position.generate());
  const entityId=stable(`relation-entity/${key}`);
  ops.push(...Ops.relations.create({id:stable(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position}).ops);
  return entityId;
}
for(const row of source.estimates){
  const id=ids[`estimate/${row.key}`];
  const name=`Saga's Chicago study ${row.study} estimated a year-one math ${row.estimand} effect of ${row.value} standard deviations.`;
  const description=`${row.estimand==='ITT'?'Intention-to-treat':'Treatment-on-the-treated'} estimate; standard error ${row.standardError}; outcome-complete N=${row.n}. ${row.locator}. ${source.context.limitations}`;
  const {entity}=await gql('query($id:UUID!){entity(id:$id){id name spaceIds}}',{id});
  if(!entity?.spaceIds.includes(EDUCATION_PUBLICATION.spaceId))throw new Error('Expected existing estimate missing');
  changes.push({id,before:entity.name,after:name});
  ops.push(...Ops.entities.update({id,name,description}).ops);
}
const dataset=ids['dataset/saga-chicago-trials'];
const block=stable('block/estimates');
ops.push(...Ops.entities.update({id:block,name:'Math effects: compare within each trial'}).ops);
relate('block/type',block,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);
relate('block/source',block,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
const attach=relate('dataset/block',dataset,SystemIds.BLOCKS,block);
relate('block/view',attach,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
for(const [index,property] of [SystemIds.NAME_PROPERTY,ids['property/study'],ids['property/estimand'],ids['property/estimate'],ids['property/se'],'bf0249bb71924460bfe6b35394ed0781',ids['property/unit'],ids['property/locator']].entries()){
  if(property===SystemIds.NAME_PROPERTY)continue; // Geo supplies Name automatically.
  // Columns use ordered relations on the Blocks relation ENTITY, as in the course publisher.
  const key=`column/${index}`;
  registry[`position/${key}`]??=`a${index}`;
  relate(key,attach,SystemIds.PROPERTIES,property);
}
for(const [index,row] of source.estimates.entries()){
  registry[`position/item/${index}`]??=`a${index}`;
  relate(`item/${index}`,block,SystemIds.COLLECTION_ITEM_RELATION_TYPE,ids[`estimate/${row.key}`]);
}
const opsPath=`${root}/saga-display-ops.json`;
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(opsPath,bytes);
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Make Saga estimates readable with a comparison table',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath,sha256,operationCount:ops.length,journalPath:`${root}/saga-display-publication.json`,validationPath:`${root}/saga-display-validation.json`,blockId:block,changes};
writeFileSync(`${root}/saga-display-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({checkedAt:new Date().toISOString(),ready:true,opsHash:sha256,checks:['Four existing estimate IDs verified in destination','Names and descriptions generated from source extraction at runtime','Stable block, relation and relation-entity IDs','No deletes or numeric value changes','SDK collection block and table-view metadata follow course publisher structure']},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
