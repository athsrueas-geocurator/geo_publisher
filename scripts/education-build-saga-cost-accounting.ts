import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='saga-cost-accounting',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const saga=read('saga-registry'),repair=read('description-repair-registry'),model=read(`${prefix}-model`),cost=saga['cost/saga-2013-2015-annual-cost'],dataset=saga['dataset/saga-chicago-trials'],block=repair[`block/${cost}`];
const registry:Record<string,string>=existsSync(`${root}/${prefix}-registry.json`)?read(`${prefix}-registry`):{},ops:Op[]=[],checks:string[]=[];
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const text=(property:string,value:string)=>({property,type:'text' as const,value});
check(hash(readFileSync(model.sourcePdf))===model.sourceSha256,'Official appendix fingerprint; cost methods and table visually reviewed');
for(const p of [SystemIds.DESCRIPTION_PROPERTY,SystemIds.MARKDOWN_CONTENT,saga['property/denominator'],saga['property/locator']]){
 const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(data.property?.dataTypeName==='Text',`Live datatype ${p}`);
}
const snapshot:any={checkedAt:new Date().toISOString(),entities:[]};
for(const entityId of [cost,block,dataset]){
 const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){id types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal integer}pageInfo{hasNextPage}}relations(first:30,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space:target.spaceId}});
 check(data.entity&&!data.entity.values.pageInfo.hasNextPage&&!data.entity.relations.pageInfo.hasNextPage,`Complete state ${entityId}`);snapshot.entities.push(data.entity);
}
const current=snapshot.entities[0],notes=snapshot.entities[1],ds=snapshot.entities[2];
const value=(entity:any,p:string)=>entity.values.nodes.find((v:any)=>v.propertyId===p);
check(value(current,SystemIds.DESCRIPTION_PROPERTY)?.text==='Reported annual tutoring cost per pupil, with a range that is not a confidence interval. The price year and full accounting scope remain unverified.','Reviewed current description');
check(value(notes,SystemIds.MARKDOWN_CONTENT)?.text==='## Methods and interpretation\n\ncost-accounting range, not confidence interval. Price year unverified; cost-accounting review pending. This is a cost observation, not a cost-effectiveness estimate.','Reviewed old cost note');
for(const [p,n] of [[saga['property/cost'],3500],[saga['property/low'],3200],[saga['property/high'],4800]])check(Number(value(current,p)?.decimal)===n,`Preserve reported numeric ${p}`);
check(!value(current,saga['property/priceYear']),'No false constant-price year present');
check(current.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b')&&notes.types.some((t:any)=>t.id===SystemIds.TEXT_BLOCK),'Reuse existing Claim and Text block');
ops.push(...Ops.entities.update({id:cost,description:model.description,values:[text(saga['property/denominator'],model.denominator),text(saga['property/locator'],model.sourceLocator)]}).ops);
ops.push(...Ops.entities.update({id:block,values:[text(SystemIds.MARKDOWN_CONTENT,model.markdown)]}).ops);
if(!ds.relations.nodes.some((r:any)=>r.typeId===SystemIds.BLOCKS&&r.toEntityId===block))ops.push(...Ops.relations.create({id:id('relation/dataset-notes'),entityId:id('relation-entity/dataset-notes'),fromEntity:dataset,type:SystemIds.BLOCKS,toEntity:block}).ops);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',encoded=JSON.parse(bytes);
check(encoded.filter((o:any)=>o.type==='updateEntity').every((o:any)=>o.set.every((s:any)=>![saga['property/cost'],saga['property/low'],saga['property/high'],saga['property/priceYear']].includes(s.property.$bytes))),'No numerical or price-year changes');
const sha256=hash(bytes),batch={name:'Clarify Saga nominal budget costs and denominator differences',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/${prefix}-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(`${root}/${prefix}-before.json`,JSON.stringify(snapshot,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
