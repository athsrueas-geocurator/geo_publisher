import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='original-route-reconciliation',property='b0305ef28312c519d954bc0efe22f013';
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload; use verifier instead');
const state=read('original-link-state'),source=read('source/content/initiatives');
if(Date.now()-Date.parse(state.checkedAt)>20*60*1000)throw Error('Refresh live state');
const schema:any=await gql('query($id:UUID!){entity(id:$id){name}property(id:$id){dataTypeName}}',{variables:{id:property}});
if(schema.property?.dataTypeName!=='Text'||schema.entity?.name!=='Route slug')throw Error('Schema changed');
// These identities were reviewed against both original populations and live descriptions.
// Boston remains a program identity; its evidence is explicitly the historical lottery cohort.
const reviewed=[46,54,70,73,74];const ops:Op[]=[];const records:any[]=[];
for(const key of reviewed){
 const row=state.rows.find((r:any)=>r.key===key),original=source.find((r:any)=>r.id===key);
 if(!row||!original||row.name!==original.name)throw Error('Identity changed');
 const old=row.values.filter((v:any)=>v.propertyId===property);
 if(old.some((v:any)=>v.text!==original.slug))throw Error('Conflicting route slug');
 if(!old.length)ops.push(...Ops.entities.update({id:row.id,values:[{property,type:'text',value:original.slug}]}).ops);
 records.push({key,entityId:row.id,name:row.name,slug:original.slug});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Restore original routes for five existing education programs',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length,records};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:ops.length>0,checkedAt:new Date().toISOString(),opsHash:sha256,schema,scope:'Existing program identities; original route slug only; no description, source, evidence, or assessment changes',records},null,2)+'\n');
console.log(JSON.stringify({operationCount:ops.length,records}));
