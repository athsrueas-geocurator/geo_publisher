import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {starExperimentalClaimCopy} from '../src/education-star-claim-copy';
const root='data/education',prefix='star-experimental-claim-copy',read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const source=read('star-experimental-extraction'),registry=read('star-experimental-registry'),saga=read('saga-registry'),audit=read('claim-readability-audit');
const ops:Op[]=[],checks:string[]=[],review:any[]=[];
const factual='da4a6c1f9d4446f9832ff3b49a4400ef';
const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
check(createHash('sha256').update(readFileSync('tmp/pdfs/star-experiment.pdf')).digest('hex')==='b970ac64cb6f3b04a941c23cdbfc1c92ce75f8d753f23995e761772eec18c93e','Reviewed journal PDF unchanged');
for(const [id,type] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[factual,'Checkbox']]){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});check(d.property?.dataTypeName===type,`Schema ${id}`);}
for(const row of source.estimates){
 const id=registry[`estimate/${row.key}`],before=audit.rows.find((r:any)=>r.id===id);
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id} values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal boolean}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(before&&d.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!d.entity.values.pageInfo.hasNextPage,`Complete existing Claim ${row.key}`);
 const v=(property:string)=>d.entity.values.nodes.find((v:any)=>v.propertyId===property);
 check(v(SystemIds.NAME_PROPERTY)?.text===before.name&&v(SystemIds.DESCRIPTION_PROPERTY)?.text===before.description,`Current text matches audit ${row.key}`);
 check(Number(v(saga['property/estimate'])?.decimal)===row.value&&Number(v(saga['property/se'])?.decimal)===row.standardError,`Source magnitude and SE ${row.key}`);
 const after=starExperimentalClaimCopy(row);check(after.description.length<=350,`Concise description ${row.key}`);
 ops.push(...Ops.entities.update({id,...after,values:[{property:factual,type:'boolean',value:true}]}).ops);
 review.push({id,key:row.key,before:{name:before.name,description:before.description,factual:v(factual)?.boolean??null},after:{...after,factual:true},locator:row.locator,value:row.value,standardError:row.standardError});
}
check(review.length===8,'All eight experimental claims reviewed');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
check(JSON.parse(bytes).every((op:any)=>op.type==='updateEntity'&&!op.unset?.length&&op.set.every((s:any)=>[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY,factual].includes(s.property.$bytes))),'Only name, description and factual classification; numeric data and relations preserved');
const batch={name:'State the actual STAR achievement findings and uncertainty',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(review,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify({claims:review.length,checks:checks.length,example:review[0].after}));
