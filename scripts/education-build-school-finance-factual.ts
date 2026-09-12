import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Ops, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root='data/education',prefix='school-finance-factual';
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload; do not rebuild a published factual-classification batch.');
const registry=JSON.parse(readFileSync(`${root}/school-finance-jjp-registry.json`,'utf8'));
const claims=[registry['estimate/education-years/low-income'],registry['estimate/adult-poverty/low-income'],registry['cost/illustration']];
const factual='da4a6c1f9d4446f9832ff3b49a4400ef',claimType='96f859efa1ca4b229372c86ad58b694b',checks:string[]=[],ops:Op[]=[];
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const schema:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:factual}});check(schema.property?.dataTypeName==='Checkbox','Live Is factual property is Checkbox');
for(const entity of claims){const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId boolean}pageInfo{hasNextPage}}}}',{variables:{id:entity,space:target.spaceId}});check(d.entity?.types.some((x:any)=>x.id===claimType),`Claim type: ${entity}`);check(!d.entity.values.pageInfo.hasNextPage,`Complete values: ${entity}`);check(!d.entity.values.nodes.some((v:any)=>v.propertyId===factual&&v.boolean===true),`Claim not already classified factual: ${entity}`);ops.push(...Ops.entities.update({id:entity,values:[{property:factual,type:'boolean',value:true}]}).ops);}
const bytes=JSON.stringify(ops,(_key,value)=>value instanceof Uint8Array?{$bytes:Buffer.from(value).toString('hex')}:value,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');const batch={name:'Classify school-finance findings as factual claims',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,entities:{claims},operationCount:ops.length};writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,claims,scope:'Marks three source-backed observations as checkable facts. It does not attest that the community has verified them or change their values, source links, or policy relevance.'},null,2)+'\n');console.log(JSON.stringify(batch,null,2));
