import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {sagaClaimCopy} from '../src/education-saga-claim-copy';
const root='data/education',prefix='saga-claim-copy',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const extraction=read('saga-outcomes-extraction'),registry=read('saga-outcomes-registry'),saga=read('saga-registry'),model=read('saga-claim-copy-model');
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex'),checks:string[]=[],ops:Op[]=[],review:any[]=[];
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
check(hash(readFileSync('tmp/pdfs/saga-2023.pdf'))===extraction.sourceSha256,'Verified final source unchanged');
for(const property of [SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY]){const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});check(data.property?.dataTypeName==='Text',`Live Text ${property}`);}
for(const row of extraction.records.filter((r:any)=>!r.existingKey)){
 const id=registry[`estimate/${row.key}`];
 const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){id types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal integer}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(data.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!data.entity.values.pageInfo.hasNextPage,`Complete existing Claim ${row.key}`);
 const values=data.entity.values.nodes,v=(p:string)=>values.find((v:any)=>v.propertyId===p);
 const beforeName=`Saga Chicago study ${row.study}: ${row.measure} (${row.estimand}, year one)`;
 check(v(SystemIds.NAME_PROPERTY)?.text===beforeName,`Reviewed old row-label title ${row.key}`);
 check(v(SystemIds.DESCRIPTION_PROPERTY)?.text===(row.unit?'First-year trial estimate, with its reported standard error and outcome-specific sample count. ITT and TOT estimates describe the same trial.':'First-year trial estimate with reported uncertainty and sample count. Whether the suspension measure counts days or events remains unresolved.'),`Reviewed old description ${row.key}`);
 check(Number(v(saga['property/estimate'])?.decimal)===Number(row.value)&&Number(v(saga['property/se'])?.decimal)===Number(row.standardError),`Source numbers unchanged ${row.key}`);
 const copy=sagaClaimCopy(row,model);check(copy.description.length<=350,`Concise visible finding ${row.key}`);
 ops.push(...Ops.entities.update({id,...copy}).ops);review.push({key:row.key,id,beforeName,after:copy,sourceValue:row.value,sourceSE:row.standardError,unit:row.unit});
}
check(review.length===58,'All 58 new Claim titles and descriptions audited');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=hash(bytes),encoded=JSON.parse(bytes);
check(encoded.every((o:any)=>o.type==='updateEntity'&&!o.unset?.length&&o.set.every((v:any)=>[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY].includes(v.property.$bytes))),'Names and descriptions only; no numeric, identity or relation changes');
const batch={name:'State the findings and interpretation in all 58 new Saga claims',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(review,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify({batch,example:review.find(r=>r.key==='s2/arrests-property/tot')}));
