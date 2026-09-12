import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,SystemIds,Position,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='original-questions',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const original=read('source/content/dichotomies'),exact=read('original-question-identity-discovery'),aliases=read('original-question-alias-discovery'),model=read('original-question-model-inspection');
if(original.length!==21||new Set(original.map((r:any)=>r.slug)).size!==21||original.some((r:any)=>r.dek!==r.betterQuestion))throw Error('Original shape changed');
if(exact.rows.length!==21||exact.rows.some((r:any)=>r.searches.length!==3||r.searches.some((s:any)=>!s.complete||s.nodes.length)))throw Error('Unresolved exact identity');
const unrelated=new Set(['d5e6f3451c5849ec97330f7c3a52dd4c','ed68ba85d0194f268d218788d9e46d14','ffbc2e9ff8004ae5b713d7be44c464a0']);
if(aliases.searches.length!==25||aliases.searches.some((s:any)=>!s.complete||s.nodes.some((n:any)=>!unrelated.has(n.id)))||!model.complete)throw Error('Unreviewed aliases/model');
for(const r of [exact,aliases,model])if(Date.now()-Date.parse(r.checkedAt)>60*60*1000)throw Error('Refresh discovery');
const registryPath=`${root}/${prefix}-registry.json`,registry:Record<string,string>=existsSync(registryPath)?read(`${prefix}-registry`):{},id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const p={question:'4318a1d2c441455cb76544049c45e6cf',dataset:'0c4babfb43893486af827341bbf32e09',url:'412ff593e9154012a43d4c27ec5c68b6',slug:'b0305ef28312c519d954bc0efe22f013'};
const sourceUrl='https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/dichotomies.json';
for(const [property,type] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[p.url,'Text'],[p.slug,'Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.BLOCKS,'Relation'],[SystemIds.COLLECTION_ITEM_RELATION_TYPE,'Relation'],[SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,'Relation'],[SystemIds.VIEW_PROPERTY,'Relation'],[SystemIds.PROPERTIES,'Relation']]){
 const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});if(d.property?.dataTypeName!==type)throw Error(`Schema mismatch ${property}`);
}
const ops:Op[]=[],dataset=id('dataset'),block=id('block'),crosswalk:any[]=[];
function rel(key:string,from:string,type:string,to:string,position?:string){ops.push(...Ops.relations.create({id:id(`edge/${key}`),entityId:id(`relation/${key}`),fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]??(registry[`position/${key}`]=position??Position.generate())}).ops);return id(`relation/${key}`);}
ops.push(...Ops.entities.update({id:dataset,name:'Education Initiatives questions',description:'Questions about education policy and practice from the Education Initiatives collection. Each pairs an open question with its original debate framing.',values:[{property:p.url,type:'text',value:sourceUrl}]}).ops);
rel('dataset/type',dataset,SystemIds.TYPES_PROPERTY,p.dataset);
ops.push(...Ops.entities.update({id:block,name:'Questions'}).ops);rel('block/type',block,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);rel('block/source',block,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
const attach=rel('block/attach',dataset,SystemIds.BLOCKS,block);rel('block/view',attach,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);rel('block/description',attach,SystemIds.PROPERTIES,SystemIds.DESCRIPTION_PROPERTY);
let position=Position.generate();
for(const row of original){
 const entityId=id(`question/${row.slug}`),description=`${row.title}.`;
 ops.push(...Ops.entities.update({id:entityId,name:row.betterQuestion,description,values:[{property:p.slug,type:'text',value:row.slug},{property:p.url,type:'text',value:sourceUrl}]}).ops);
 rel(`question/${row.slug}/type`,entityId,SystemIds.TYPES_PROPERTY,p.question);
 const entry=rel(`question/${row.slug}/entry`,block,SystemIds.COLLECTION_ITEM_RELATION_TYPE,entityId,position);position=Position.generateBetween(position,null);
 crosswalk.push({slug:row.slug,entityId,entryRelationEntityId:entry,sourceTitle:row.title,name:row.betterQuestion,description});
}
for(const entityId of [dataset,block,...crosswalk.map(r=>r.entityId)]){const d:any=await gql('query($id:UUID!){entity(id:$id){spaceIds}}',{variables:{id:entityId}});if(d.entity?.spaceIds?.length)throw Error('Allocated ID occupied');}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Add 21 original education questions with framing and source provenance',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,datasetId:dataset,blockId:block,sourceUrl,crosswalk,operationCount:ops.length};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,scope:'Original question texts/framing/routes/provenance only; generated relationships and assessments withheld',checks:['21 exact original questions with original framing plus terminal punctuation','63 exact and 25 alias searches complete, all candidates reviewed','Canonical Question instance semantics inspected; no unsupported Answers links','Every content entity typed; existing property data types verified','Stable IDs and ordered collection relations persisted','No existing entities modified, no Claims or asserted answers created']},null,2)+'\n');console.log(JSON.stringify({dataset,block,questions:crosswalk.length,operations:ops.length}));
