import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',argumentsStage=process.argv.includes('--arguments'),classification=process.argv.includes('--classification'),prefix=`class-size-debate-${classification?'classification':argumentsStage?'arguments':'related'}`;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const content=read('class-size-debate-content'),discovery=read('class-size-debate-discovery'),identity=read('class-size-debate-identity');
if(!discovery.searches.every((s:any)=>s.complete)||!identity.identifiers.every((s:any)=>s.data.valuesConnection.nodes.length===0))throw Error('Identity review unresolved');
const registry:any=existsSync(`${root}/class-size-debate-registry.json`)?read('class-size-debate-registry'):{ids:{}};
const id=(key:string):string=>registry.ids[key]??(registry.ids[key]=randomUUID().replaceAll('-',''));
const node=(key:string):string=>content.reusedClaims[key]??id(`claim/${key}`);
const p={name:'a126ca530c8e48d5b88882c734c38935',description:'9b1f76ff9711404c861e59dc3fa7d037',url:'412ff593e9154012a43d4c27ec5c68b6',types:'8f151ba4de204e3c9cb499ddf96f48f1',authors:'91a9e2f6e51a48f7997661de8561b690',sources:'49c5d5e1679a4dbdbfd33f618f227c94',related:'504e5776788844f6a77dba3ee811d8f0',supports:'1dc6a843458848198e7a6e672268f811',opposes:'4e6ec5d14292498a84e5f607ca1a08ce',topics:'806d52bc27e94c9193c057978b093351',factual:'da4a6c1f9d4446f9832ff3b49a4400ef',locator:'84dacbddca6a44079edb5e11a4c66b40'};
const types={claim:'96f859efa1ca4b229372c86ad58b694b',article:'a2a5ed0cacef46b1835de457956ce915',person:'7ed45f2bc48b419e8e4664d5ff680b0d',topic:'5ef5a5860f274d8e8f6c59ae5b3e89e2'};
for(const [key,property] of Object.entries(p)){
 const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});
 const expected=['name','description','url','locator'].includes(key)?'Text':key==='factual'?'Checkbox':'Relation';if(d.property?.dataTypeName!==expected)throw Error(`Schema mismatch ${key}`);
}
for(const [name,entityId] of Object.entries(types)){const d:any=await gql('query($id:UUID!){entity(id:$id){name}}',{variables:{id:entityId}});if(d.entity?.name?.toLowerCase()!==name)throw Error(`Type mismatch ${name}`);}
const ops:Op[]=[];const skipped:any[]=[];
async function link(from:string,type:string,to:string){
 const d:any=await gql('query($from:UUID!,$to:UUID!,$type:UUID!,$space:UUID!){relationsConnection(first:2,filter:{fromEntityId:{is:$from},toEntityId:{is:$to},typeId:{is:$type},spaceId:{is:$space}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{from,to,type,space:target.spaceId}});
 if(d.relationsConnection.nodes.length){skipped.push({from,type,to});return;}
 const key=`edge/${type}/${from}/${to}`;ops.push(...Ops.relations.create({id:id(key),entityId:id(`${key}/entity`),fromEntity:from,toEntity:to,type}).ops);
}
async function newEntity(key:string,name:string,type:string,description?:string,url?:string){
 const d:any=await gql('query($name:String!){entitiesConnection(first:20,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name}});
 if(d.entitiesConnection.pageInfo.hasNextPage||d.entitiesConnection.nodes.some((e:any)=>e.id!==id(key)))throw Error(`New identity collision ${name}`);
 const e:any=await gql('query($id:UUID!){entity(id:$id){spaceIds}}',{variables:{id:id(key)}});if(e.entity?.spaceIds?.length)throw Error(`Allocated ID already live ${key}`);
 ops.push(...Ops.entities.update({id:id(key),values:[{property:p.name,type:'text',value:name},...(description?[{property:p.description,type:'text' as const,value:description}]:[]),...(url?[{property:p.url,type:'text' as const,value:url}]:[])]}).ops);
 await link(id(key),p.types,type);
}
if(classification){
 const d:any=await gql('query($id:UUID!){entity(id:$id){name values(first:30,filter:{propertyId:{is:"da4a6c1f9d4446f9832ff3b49a4400ef"}}){nodes{boolean spaceId}pageInfo{hasNextPage}}}}',{variables:{id:node('model-scenario')}});
 if(d.entity?.name!=='STAR model: 4% discount, 1% wage growth; $15180 earnings versus $7537 cost.'||d.entity.values.pageInfo.hasNextPage)throw Error('Scenario identity changed');
 if(d.entity.values.nodes.some((v:any)=>v.spaceId===target.spaceId&&v.boolean===true))throw Error('Already classified');
 ops.push(...Ops.entities.update({id:node('model-scenario'),values:[{property:p.factual,type:'boolean',value:true}]}).ops);
}else if(!argumentsStage){
 await newEntity('author/krueger',content.sources.krueger.author,types.person);
 await newEntity('author/hanushek',content.sources.hanushek.author,types.person);
 await newEntity('source/hanushek',content.sources.hanushek.name,types.article,content.sources.hanushek.description,content.sources.hanushek.url);
 await link(content.sources.krueger.id,p.authors,id('author/krueger'));
 await link(id('source/hanushek'),p.authors,id('author/hanushek'));
 await newEntity('topic','Class-size reduction',types.topic,'Reducing the number of pupils taught together in a classroom.');
 for(const claim of content.claims){
  if(claim.description.length>350)throw Error('Description review required');
  await newEntity(`claim/${claim.key}`,claim.name,types.claim,claim.description);
  ops.push(...Ops.entities.update({id:node(claim.key),values:[{property:p.factual,type:'boolean',value:claim.factual},{property:p.locator,type:'text',value:claim.locator}]}).ops);
  await link(node(claim.key),p.sources,claim.source==='krueger'?content.sources.krueger.id:id('source/hanushek'));
 }
 for(const key of [...content.claims.map((c:any)=>c.key),...Object.keys(content.reusedClaims)])await link(node(key),p.topics,id('topic'));
 for(const pair of content.pairs){await link(node(pair.target),p.related,node(pair.argument));await link(node(pair.argument),p.related,node(pair.target));}
}else{
 if(read('class-size-debate-related-index-verification').passed!==true)throw Error('Verify Related stage first');
 const adjudication=read('class-size-debate-argument-review');
 if(!adjudication.approved||adjudication.contentHash!==createHash('sha256').update(readFileSync(`${root}/class-size-debate-content.json`)).digest('hex'))throw Error('Fresh independent bracket review required');
 for(const pair of adjudication.pairs){if(pair.bracket==='related-only')continue;if(!['supports','opposes'].includes(pair.bracket))throw Error('Unsupported bracket');await link(node(pair.target),p[pair.bracket as 'supports'|'opposes'],node(pair.argument));}
}
writeFileSync(`${root}/class-size-debate-registry.json`,JSON.stringify(registry,null,2)+'\n');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:classification?'Mark the source-reported STAR comparison scenario as checkable':argumentsStage?'Link reviewed arguments in the Krueger–Hanushek class-size debate':'Add the Krueger–Hanushek class-size debate with reused STAR evidence',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,content,skipped,registry},null,2)+'\n');console.log(JSON.stringify({prefix,operations:ops.length,skipped:skipped.length,claims:content.claims.map((c:any)=>({id:node(c.key),name:c.name}))}));
