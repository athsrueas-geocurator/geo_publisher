import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='school-finance-claim-copy',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const extraction=read('school-finance-jjp-extraction'),registry=read('school-finance-jjp-registry'),saga=read('saga-registry'),model=read(`${prefix}-model`),audit=read('claim-readability-audit');
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex'),checks:string[]=[],ops:Op[]=[],review:any[]=[];
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
check(hash(readFileSync('tmp/pdfs/school-finance-jjp-2016.pdf'))===extraction.sourceSha256,'Reviewed final article unchanged');
for(const property of [SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY]){const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});check(data.property?.dataTypeName==='Text',`Text property ${property}`);}
for(const row of extraction.records){
 const id=registry[`estimate/${row.key}`],before=audit.rows.find((r:any)=>r.id===id),outcome=model.outcomes[row.key.split('/')[0]];
 check(before&&outcome,`Reviewed record ${row.key}`);
 const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(data.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!data.entity.values.pageInfo.hasNextPage,`Complete existing Claim ${row.key}`);
 const v=(p:string)=>data.entity.values.nodes.find((v:any)=>v.propertyId===p);
 check(v(SystemIds.NAME_PROPERTY)?.text===before.name&&v(SystemIds.DESCRIPTION_PROPERTY)?.text===before.description,`Current copy matches audit ${row.key}`);
 check(Number(v(saga['property/estimate'])?.decimal)===Number(row.coefficient)&&Number(v(saga['property/se'])?.decimal)===Number(row.standardError),`Exact source estimate/SE ${row.key}`);
 const name=row.group==='nonpoor'
  ?`The school-finance model did not establish that higher spending ${outcome.uncertain} for ${model.groups[row.group]}.`
  :`The school-finance model estimated ${outcome.finding} from higher spending for ${model.groups[row.group]}.`;
 const unit=row.unit.replace('ln(per-pupil spending)','natural-log school-age per-pupil spending');
 const description=`Preferred IV coefficient ${row.coefficient} ${unit} (district-clustered SE ${row.standardError}${row.pThreshold?`; p ${row.pThreshold}`:''}; Table ${row.table}, p. ${row.printedPage}). ${model.context[row.group]}`;
 check(description.length<=350,`Concise description ${row.key}`);
 ops.push(...Ops.entities.update({id,name,description}).ops);review.push({key:row.key,id,before:{name:before.name,description:before.description},after:{name,description},coefficient:row.coefficient,standardError:row.standardError});
}
check(review.length===15,'All 15 preferred coefficients covered');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=hash(bytes),encoded=JSON.parse(bytes);
check(encoded.every((o:any)=>o.type==='updateEntity'&&!o.unset?.length&&o.set.every((s:any)=>[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY].includes(s.property.$bytes))),'Only text copy changes; preserve all numbers and relations');
const batch={name:'Explain the findings and uncertainty in school-finance coefficient claims',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(review,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify({batch,review},null,2));
