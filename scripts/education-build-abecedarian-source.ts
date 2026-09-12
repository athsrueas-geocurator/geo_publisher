import{readFileSync,writeFileSync,existsSync}from'node:fs';
import{randomUUID,createHash}from'node:crypto';
import{Ops,SystemIds,type Op}from'@geoprotocol/geo-sdk';
import{geoGraphqlRequest as gql}from'../src/geo-api-client';
import{EDUCATION_PUBLICATION as target}from'../src/education-bounty';
const root='data/education',prefix='abecedarian-source',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const m=read(`${prefix}-model`),registry:Record<string,string>=existsSync(`${root}/abecedarian-registry.json`)?read('abecedarian-registry'):{};
const id=(k:string)=>{if(!registry[k]){registry[k]=randomUUID().replaceAll('-','');writeFileSync(`${root}/abecedarian-registry.json`,JSON.stringify(registry,null,2)+'\n');}return registry[k]!;};
const checks:string[]=[],check=(ok:any,s:string)=>{if(!ok)throw Error(s);checks.push(s);};
check(read('abecedarian-discovery').complete,'Complete cross-space name discovery reviewed');
const identifier=read('abecedarian-identifier-discovery').result.entitiesConnection;check(!identifier.pageInfo.hasNextPage&&!identifier.nodes.length,'Cross-space DOI/version identifier discovery empty');
const exact:any=await gql('query($n:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$n}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{n:m.name}});check(!exact.entitiesConnection.pageInfo.hasNextPage&&!exact.entitiesConnection.nodes.length,'No exact-title duplicate');
for(const[p,t]of[[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],['7cb59354e30c48119e99ff62fcf61646','Text'],['412ff593e9154012a43d4c27ec5c68b6','Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.BLOCKS,'Relation']]){const r:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Datatype ${p}`);}
const article=id('paper'),block=id('paper/context');
for(const entity of[article,block]){const r:any=await gql('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:entity}});check(!r.entity||(!r.entity.name&&!r.entity.types.length),'Persisted ID unused');}
const ops:Op[]=Ops.entities.update({id:article,name:m.name,description:m.description,values:[{property:'7cb59354e30c48119e99ff62fcf61646',type:'text',value:m.doi},{property:'412ff593e9154012a43d4c27ec5c68b6',type:'text',value:m.url}]}).ops;
const rel=(k:string,from:string,type:string,to:string)=>ops.push(...Ops.relations.create({id:id(`${k}/edge`),entityId:id(`${k}/entity`),fromEntity:from,type,toEntity:to}).ops);
rel('paper/type',article,SystemIds.TYPES_PROPERTY,m.typeId);
ops.push(...Ops.entities.update({id:block,values:[{property:SystemIds.MARKDOWN_CONTENT,type:'text',value:m.markdown}]}).ops);rel('context/type',block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);rel('paper/context',article,SystemIds.BLOCKS,block);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Add ABC and CARE life-cycle economic analysis source and interpretation',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify({article,block,operations:ops.length,checks:checks.length}));
