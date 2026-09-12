import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {readingFirstPracticeCopy} from '../src/education-reading-first-practice-copy';
const root='data/education',prefix='reading-first-practice-copy',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const source=read('reading-first-extraction'),registry=read('reading-first-registry'),saga=read('saga-registry'),audit=read('claim-readability-audit'),verified=read('reading-first-extraction-verification');
const checks:string[]=[],review:any[]=[],ops:Op[]=[],factual='da4a6c1f9d4446f9832ff3b49a4400ef';
const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
const hash=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
check(verified.passed&&hash(readFileSync('tmp/pdfs/reading-first-2008.pdf'))===verified.pdfSha256&&hash(readFileSync(`${root}/reading-first-transcription.json`))===verified.transcriptionSha256,'Verified primary PDF and transcription unchanged');
for(const [id,type] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[factual,'Checkbox']]){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});check(d.property?.dataTypeName===type,`Schema ${id}`);}
for(const row of source.records.filter((r:any)=>r.domain!=='student achievement'))for(const representation of ['native','standardized']){
 const e=row[representation],key=`${row.key}/${representation}`,id=registry[`estimate/${key}`],before=audit.rows.find((r:any)=>r.id===id);
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal boolean}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(before&&e&&d.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!d.entity.values.pageInfo.hasNextPage,`Complete existing Claim ${key}`);
 const v=(p:string)=>d.entity.values.nodes.find((v:any)=>v.propertyId===p);
 check(v(SystemIds.NAME_PROPERTY)?.text===before.name&&v(SystemIds.DESCRIPTION_PROPERTY)?.text===before.description,`Current copy matches reviewed snapshot ${key}`);
 check(Number(v(saga['property/estimate'])?.decimal)===Number(e.value),`Exact coefficient ${key}`);
 for(const [property,expected] of [[saga['property/se'],e.standardError],[registry['property/ciLower'],e.confidenceInterval?.lower],[registry['property/ciUpper'],e.confidenceInterval?.upper]])check(expected==null?!v(property):Number(v(property)?.decimal)===Number(expected),`Exact uncertainty or explicit absence ${key}/${property}`);
 const after=readingFirstPracticeCopy(row,representation);check(after.description.length<=350,`Concise description ${key}`);
 ops.push(...Ops.entities.update({id,...after,values:[{property:factual,type:'boolean',value:true}]}).ops);review.push({id,key,before:{name:before.name,description:before.description},after:{...after,factual:true},estimate:e,pValue:row.pValue,sourceLocations:row.sourceLocations});
}
check(review.length===52,'All 26 practice contrasts and 52 representations');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=hash(bytes);
check(JSON.parse(bytes).every((o:any)=>o.type==='updateEntity'&&!o.unset?.length&&o.set.every((s:any)=>[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY,factual].includes(s.property.$bytes))),'Only copy/factual updates; preserve numbers and relations');
const batch={name:'Explain Reading First instructional and implementation findings',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(review,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify({claims:review.length,checks:checks.length,examples:review.filter((r:any)=>['instruction-total-g1/native','print-engagement-g2/native','survey-reading-minutes/native'].includes(r.key)).map(r=>r.after)}));
