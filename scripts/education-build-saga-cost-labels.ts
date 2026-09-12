import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='saga-cost-labels',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read(`${prefix}-model`),saga=read('saga-registry'),context=read('saga-context-registry');
const checks:string[]=[],ops:Op[]=[],before:any[]=[];
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
for(const property of [SystemIds.NAME_PROPERTY,SystemIds.MARKDOWN_CONTENT]){
 const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});
 check(data.property?.dataTypeName==='Text',`Verified Text ${property}`);
}
for(const [id,property] of [[saga['cost/saga-2013-2015-annual-cost'],SystemIds.NAME_PROPERTY],[context['notes/program'],SystemIds.MARKDOWN_CONTENT]]){
 const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){id types{id} values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(data.entity?.types.length&&!data.entity.values.pageInfo.hasNextPage,`Complete typed current entity ${id}`);before.push(data.entity);
 const current=data.entity.values.nodes.find((v:any)=>v.propertyId===property)?.text;
 if(property===SystemIds.NAME_PROPERTY){check(current===model.costNameBefore,'Reviewed current cost name');ops.push(...Ops.entities.update({id,name:model.costNameAfter}).ops);}
 else {check(typeof current==='string'&&current.split(model.contextBefore).length===2,'Exactly one reviewed stale context sentence');ops.push(...Ops.entities.update({id,values:[{property,type:'text',value:current.replace(model.contextBefore,model.contextAfter)}]}).ops);}
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Align Saga cost labels with the verified nominal budget basis',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-before.json`,JSON.stringify(before,null,2)+'\n');writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
