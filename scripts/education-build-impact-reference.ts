import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='impact-reference';const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const content=read('impact-reconciled-content'),original=read('source/content/initiatives').find((r:any)=>r.id===content.originalInitiativeId);
const discovery=read('impact-discovery'),aliases=read('impact-alias-discovery');
if(!discovery.searches.every((s:any)=>s.complete&&s.nodes.length===0))throw Error('Review discovery candidates');
if(!aliases.every((s:any)=>!Object.values<any>(s.data)[0].pageInfo.hasNextPage))throw Error('Incomplete alias discovery');
const properties={name:'a126ca530c8e48d5b88882c734c38935',description:'9b1f76ff9711404c861e59dc3fa7d037',url:'412ff593e9154012a43d4c27ec5c68b6',doi:'7cb59354e30c48119e99ff62fcf61646',slug:'b0305ef28312c519d954bc0efe22f013',types:'8f151ba4de204e3c9cb499ddf96f48f1',authors:'91a9e2f6e51a48f7997661de8561b690',sources:'49c5d5e1679a4dbdbfd33f618f227c94'};
for(const [name,id] of Object.entries(properties)){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});if(d.property?.dataTypeName!==(['types','authors','sources'].includes(name)?'Relation':'Text'))throw Error(`Schema mismatch ${name}`);}
const typeIds={article:'a2a5ed0cacef46b1835de457956ce915',initiative:'d272f19cef87485fb83e26fb68957395',person:'7ed45f2bc48b419e8e4664d5ff680b0d'};
for(const [name,id] of Object.entries(typeIds)){const d:any=await gql('query($id:UUID!){entity(id:$id){name}}',{variables:{id}});if(d.entity?.name.toLowerCase()!==name)throw Error(`Type mismatch ${name}`);}
const registry=existsSync(`${root}/${prefix}-registry.json`)?read(`${prefix}-registry`):{ids:{}};
const id=(key:string)=>registry.ids[key]??(registry.ids[key]=randomUUID().replaceAll('-',''));const ops:Op[]=[];
function link(from:string,type:string,to:string,key:string){ops.push(...Ops.relations.create({id:id(key),entityId:id(`${key}/entity`),fromEntity:from,toEntity:to,type}).ops);}
function entity(key:string,type:string,values:Record<string,string>){ops.push(...Ops.entities.update({id:id(key),values:Object.entries(values).map(([property,value])=>({property,type:'text' as const,value}))}).ops);link(id(key),properties.types,type,`${key}/type`);}
entity('article',typeIds.article,{[properties.name]:content.article.name,[properties.description]:content.article.description,[properties.url]:content.article.url,[properties.doi]:content.article.doi});
entity('initiative',typeIds.initiative,{[properties.name]:content.initiative.name,[properties.description]:content.initiative.description,[properties.url]:content.initiative.url,[properties.slug]:original.slug});
for(const author of content.article.authors){entity(`author/${author}`,typeIds.person,{[properties.name]:author});link(id('article'),properties.authors,id(`author/${author}`),`authorship/${author}`);}
link(id('initiative'),properties.sources,id('article'),'initiative/source');
writeFileSync(`${root}/${prefix}-registry.json`,JSON.stringify(registry,null,2)+'\n');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Restore DC IMPACT with the corrected Dee–Wyckoff reference and authors',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,scope:'One program and corrected source with two authors; all created entities typed; no numerical findings or imported assessments',content,registry},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,registry}));
