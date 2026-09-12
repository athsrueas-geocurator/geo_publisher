import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-achievement-copy';
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const source=read('reading-first-extraction'),registry=read('reading-first-registry'),saga=read('saga-registry'),audit=read('claim-readability-audit');
const verified=read('reading-first-extraction-verification');
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const checks:string[]=[],review:any[]=[],ops:Op[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
check(verified.passed&&hash(readFileSync('tmp/pdfs/reading-first-2008.pdf'))===verified.pdfSha256,'Reviewed primary PDF unchanged');
check(hash(readFileSync(`${root}/reading-first-transcription.json`))===verified.transcriptionSha256,'Reviewed transcription unchanged');
for(const property of [SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY]){
 const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});
 check(data.property?.dataTypeName==='Text',`Live Text schema ${property}`);
}
for(const row of source.records.filter((r:any)=>r.domain==='student achievement'))for(const representation of ['native','standardized']){
 const estimate=row[representation];if(!estimate)continue;
 const key=`${row.key}/${representation}`,id=registry[`estimate/${key}`],before=audit.rows.find((r:any)=>r.id===id);
 check(before,`Existing audited identity ${key}`);
 const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(data.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!data.entity.values.pageInfo.hasNextPage,`Complete existing Claim ${key}`);
 const value=(p:string)=>data.entity.values.nodes.find((v:any)=>v.propertyId===p);
 check(value(SystemIds.NAME_PROPERTY)?.text===before.name&&value(SystemIds.DESCRIPTION_PROPERTY)?.text===before.description,`Unchanged audited copy ${key}`);
 for(const [property,expected] of [[saga['property/estimate'],estimate.value],[saga['property/se'],estimate.standardError],[registry['property/ciLower'],estimate.confidenceInterval.lower],[registry['property/ciUpper'],estimate.confidenceInterval.upper]])check(Number(value(property)?.decimal)===Number(expected),`Exact source numeric ${key} ${property}`);
 const proficiency=row.key.startsWith('sat10-grade-level'),decoding=row.key.startsWith('toswrf');
 const magnitude=estimate.value.replace(/^-/,'');
 const unit=representation==='standardized'?'SD':proficiency?'percentage points':decoding?'TOSWRF points':'SAT 10 points';
 const subject=proficiency?'share reading at or above grade level':decoding?'decoding score':'comprehension score';
 const direction=Number(estimate.value)<0?'decrease':'increase';
 const finding=proficiency?`${direction} of ${magnitude} ${unit} in grade ${row.grade} students reading at or above grade level`:`grade ${row.grade} ${subject} ${direction} of ${magnitude} ${unit}`;
 const name=`Reading First's estimated ${finding} was ${row.reportedSignificantAt05?'':'not '}statistically significant.`;
 const ci=estimate.confidenceInterval;
 const period=decoding?'Spring 2007':'Pooled springs 2005–2007';
 const description=`${period}: adjusted funding impact ${estimate.value} ${estimate.unit} versus estimated outcomes without funding (SE ${estimate.standardError}; 95% CI ${ci.lower} to ${ci.upper}; p ${row.pValue.operator} ${row.pValue.value}). RFIS Exhibits ${decoding?'2.6':'2.5'} and D.1 report this ${representation==='standardized'?'standardized form of the same contrast':'native-unit estimate'} for sampled U.S. schools.`;
 check(description.length<=350,`Concise description ${key}`);
 ops.push(...Ops.entities.update({id,name,description}).ops);
 review.push({key,id,before:{name:before.name,description:before.description},after:{name,description},sourceLocations:row.sourceLocations,estimate});
}
check(review.length===11,'All seven achievement contrasts and eleven representations');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=hash(bytes);
check(JSON.parse(bytes).every((o:any)=>o.type==='updateEntity'&&!o.unset?.length&&o.set.every((s:any)=>[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY].includes(s.property.$bytes))),'Only title/description edits; no numeric or relation changes');
const batch={name:'State Reading First achievement findings and uncertainty on Claim pages',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(review,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify({batch,review},null,2));
