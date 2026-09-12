import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
import {validateEducationTextEncoding} from '../src/education-text-encoding';
const root='data/education',prefix='text-encoding-repair';
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted repair');
const audit=JSON.parse(readFileSync(`${root}/text-encoding-audit.json`,'utf8'));
const allowed=['5735b8e6a62745a38b1a99652e3c6457','1c6c7ea0742c4dc8849b983c8437296e','03cd942d5566419bb39a1608580c6f8a','ae72d01cfc13405a9632fa9c1a0d0f61','06ce03fee15844c18a6bfce808f03d12','4d20a987683a4686af61d1b9710475d2','96553fbe54d44eb3bad7ff1e7486add7','70be9dadb884480a914ce4f3595fb7b3'];
if(!audit.complete||audit.flagged.length!==8||audit.flagged.some((r:any)=>!allowed.includes(r.entityId)))throw Error('Review changed encoding candidates');
const ops:Op[]=[],records:any[]=[];
for(const row of audit.flagged){
 const before=row.text as string;
 if(before.includes('\ufffd')&&!before.includes('coaching\ufffds'))throw Error('Unreviewed replacement character');
 const after=before.replaceAll('\u0092','’').replaceAll('\u0096','–').replaceAll('coaching\ufffds','coaching’s');
 if(before===after||JSON.stringify(before.match(/[0-9.]+/g))!==JSON.stringify(after.match(/[0-9.]+/g)))throw Error('Non-punctuation change');
 const d:any=await gql('query($id:UUID!,$property:UUID!,$space:UUID!){entity(id:$id){values(first:5,filter:{propertyId:{is:$property},spaceId:{is:$space}}){nodes{text}pageInfo{hasNextPage}}}}',{variables:{id:row.entityId,property:row.propertyId,space:target.spaceId}});
 if(d.entity?.values.pageInfo.hasNextPage||d.entity?.values.nodes.length!==1||d.entity.values.nodes[0].text!==before)throw Error('Reviewed text changed');
 ops.push(...Ops.entities.update({id:row.entityId,values:[{property:row.propertyId,type:'text',value:after}]}).ops);records.push({...row,before,after});
}
validateEducationTextEncoding(ops);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Repair encoding damage in eight education text values',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,scope:'Reviewed punctuation-only decoding correction: apostrophes and academic-year en dashes. No words, numbers, hypotheses or evidence relations changed.',records},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,records:records.map(r=>({id:r.entityId,after:r.after}))},null,2));
