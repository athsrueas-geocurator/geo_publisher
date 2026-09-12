import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {perryEconomicCopy} from '../src/education-perry-economic-copy';
const root='data/education',prefix='perry-economic-copy',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const input=read('perry-publication-records'),registry=read('perry-registry'),mapping=read('perry-mapping-plan'),audit=read('claim-readability-audit');
const ops:Op[]=[],checks:string[]=[],review:any[]=[],factual='da4a6c1f9d4446f9832ff3b49a4400ef';
const prop=(key:string)=>mapping.reusedProperties[key]?.id??registry[`property/${key}`];
const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
check(hash(readFileSync('tmp/pdfs/perry-2010.pdf'))==='6ddac9dfc5838d03db068ddfe151c4a0a35b8385dde4cc26912da081db7df3bf','Reviewed published PDF unchanged');
check(input.sourceSha256===hash(readFileSync(`${root}/perry-economic-extraction.json`))&&read('perry-record-verification').passed,'Independent source normalization verified and unchanged');
for(const [id,type] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[factual,'Checkbox']]){const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id}});check(d.property?.dataTypeName===type,`Schema ${id}`);}
for(const row of input.records.filter((r:any)=>r.kind.startsWith('modeled-'))){
 const id=registry[`estimate/${row.key}`],before=audit.rows.find((r:any)=>r.id===id);
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){types{id} values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 check(before&&d.entity?.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&!d.entity.values.pageInfo.hasNextPage,`Complete existing Claim ${row.key}`);
 const v=(p:string)=>d.entity.values.nodes.find((v:any)=>v.propertyId===p);
 check(v(SystemIds.NAME_PROPERTY)?.text===before.name&&v(SystemIds.DESCRIPTION_PROPERTY)?.text===before.description,`Current copy matches audit ${row.key}`);
 check(Number(v(prop(row.kind==='modeled-internal-return'?'internalReturn':'benefitCostRatio'))?.decimal)===Number(row.value)&&Number(v(prop('standardError'))?.decimal)===Number(row.standardError),`Exact source mean and SE ${row.key}`);
 check(row.sampleSize===null,'No invented outcome N');
 for(const [key,expected] of [['deadweightLoss',row.deadweightLossFraction],['discountRate',row.realDiscountRate]])check(expected==null?!v(prop(key)):Number(v(prop(key))?.decimal)===Number(expected),`Exact scenario ${row.key}/${key}`);
 const murder=row.crimeValuation===null?null:row.crimeValuation==='high'?4100000:13000;
 check(murder===null?!v(prop('murderValuation')):Number(v(prop('murderValuation'))?.decimal)===murder,`Exact murder valuation ${row.key}`);
 const after=perryEconomicCopy(row);check(after.description.length<=350,`Concise description ${row.key}`);
 ops.push(...Ops.entities.update({id,...after,values:[{property:factual,type:'boolean',value:true}]}).ops);review.push({key:row.key,id,before:{name:before.name,description:before.description},after:{...after,factual:true},value:row.value,standardError:row.standardError,locator:row.locator});
}
check(review.length===51,'All 51 economic model estimates covered');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=hash(bytes);
check(JSON.parse(bytes).every((o:any)=>o.type==='updateEntity'&&!o.unset?.length&&o.set.every((s:any)=>[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY,factual].includes(s.property.$bytes))),'Only copy and factual flag; retain data and relationships');
const batch={name:'State Perry modeled returns with their assumptions and uncertainty',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(review,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify({claims:review.length,checks:checks.length,examples:review.slice(0,2).map(r=>r.after)}));
