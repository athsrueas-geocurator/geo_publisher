import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='original-bibliography-authors',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const content=read(`${prefix}-content`),discovery=read(`${prefix}-discovery`);
const registry:any=existsSync(`${root}/${prefix}-registry.json`)?read(`${prefix}-registry`):{ids:{'author/Thomas Dee':'1dbcd6ed0592406c860efbdfcf565269'}};
const id=(key:string)=>registry.ids[key]??(registry.ids[key]=randomUUID().replaceAll('-',''));
const authors='91a9e2f6e51a48f7997661de8561b690',types='8f151ba4de204e3c9cb499ddf96f48f1',person='7ed45f2bc48b419e8e4664d5ff680b0d';
for(const property of [authors,types]){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});if(d.property?.dataTypeName!=='Relation')throw Error('Schema mismatch');}
const ops:Op[]=[];
function link(from:string,type:string,to:string,key:string,position?:string){ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,toEntity:to,type,position}).ops);}
for(const row of discovery.authors){
 if(!row.complete)throw Error('Incomplete discovery');
 const candidates=row.nodes.filter((n:any)=>n.types.some((t:any)=>t.id===person));
 if(row.name==='Thomas Dee'){
  if(candidates.length!==1||candidates[0].id!==id(`author/${row.name}`))throw Error('Dee identity mismatch');
 }else{
  if(candidates.length)throw Error(`Author review needed ${row.name}`);
  const entityId=id(`author/${row.name}`);writeFileSync(`${root}/${prefix}-registry.json`,JSON.stringify(registry,null,2)+'\n');
  const d:any=await gql('query($id:UUID!){entity(id:$id){spaceIds}}',{variables:{id:entityId}});if(d.entity?.spaceIds?.length)throw Error('ID collision');
  ops.push(...Ops.entities.update({id:entityId,name:row.name}).ops);link(entityId,types,person,`author-type/${row.name}`);
 }
}
for(const article of content.articles){
 const before=discovery.articles.find((a:any)=>a.id===article.id);if(before?.name!==article.title||before.relations.nodes.length)throw Error('Review existing authors');
 const current:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name relations(first:20,filter:{typeId:{is:"91a9e2f6e51a48f7997661de8561b690"},spaceId:{is:$space}}){nodes{id}pageInfo{hasNextPage}}}}',{variables:{id:article.id,space:target.spaceId}});
 if(current.entity?.name!==article.title||current.entity.relations.nodes.length||current.entity.relations.pageInfo.hasNextPage)throw Error('Article changed');
 article.authors.forEach((name:string,i:number)=>link(article.id,authors,id(`author/${name}`),`${article.id}/${name}`,`a${i}`));
}
writeFileSync(`${root}/${prefix}-registry.json`,JSON.stringify(registry,null,2)+'\n');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Restore complete authorship for five existing education references',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,content,registry,identityDecisions:'Reuse Thomas Dee from IMPACT; Brian/Jacob co-mention and Faria substring matches are unrelated non-Person entities; no matching Person candidates for the other 17 bylines.'},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,articles:content.articles.length,authorshipEdges:content.articles.reduce((s:number,a:any)=>s+a.authors.length,0),newPeople:17,reusedPeople:1}));
