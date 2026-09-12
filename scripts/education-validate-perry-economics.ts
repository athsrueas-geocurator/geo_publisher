import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',prefix=`perry-economic-${process.argv.includes('--remaining')?'remaining':'pilot'}`;
const batch=JSON.parse(readFileSync(`${root}/${prefix}-batch.json`,'utf8'));
const bytes=readFileSync(batch.opsPath,'utf8'),ops=JSON.parse(bytes),registry=JSON.parse(readFileSync(batch.registry,'utf8'));
const model=JSON.parse(readFileSync(`${root}/perry-mapping-plan.json`,'utf8')),input=JSON.parse(readFileSync(model.input,'utf8'));
const validation=JSON.parse(readFileSync(batch.validationPath,'utf8'));
const checks:string[]=[];
function assert(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const prop=(key:string)=>model.reusedProperties[key]?.id??registry[`property/${key}`];
const relation=(from:string,type:string,to:string)=>ops.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===from&&o.relationType.$bytes===type&&o.to.$bytes===to);
function value(entity:string,property:string){return ops.filter((o:any)=>o.type==='updateEntity'&&o.id.$bytes===entity).flatMap((o:any)=>o.set).find((s:any)=>s.property.$bytes===property)?.value;}
function decimal(v:any){assert(v?.type==='decimal','Encoded decimal datatype');const n=BigInt(v.mantissa.value.$bigint),exp=v.exponent,digits=String(n).padStart(-exp+1,'0');return exp>=0?`${n}${'0'.repeat(exp)}`:`${digits.slice(0,exp)}.${digits.slice(exp)}`.replace(/0+$/,'').replace(/\.$/,'');}
assert(createHash('sha256').update(bytes).digest('hex')===batch.sha256,'Payload hash');
assert(validation.opsHash===batch.sha256&&Date.now()-Date.parse(validation.checkedAt)<15*60*1000,'Fresh builder live checks');
assert(batch.selected.length===(prefix.endsWith('pilot')?2:49),'Expected complete batch selection');
if(prefix.endsWith('remaining'))for(const p of model.proposedProperties.filter((p:any)=>['benefitCostRatio','deadweightLoss','economicPerspectives','murderValuation'].includes(p.key))){const live=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:prop(p.key)}});assert(live.property?.dataTypeName.toLowerCase()===p.datatype.toLowerCase(),`Published datatype ${p.key}`);}
for(const selected of batch.selected){
 const row=input.records.find((r:any)=>r.key===selected.key);assert(row,'Source row exists');
 const fields:any={standardError:row.standardError,deadweightLoss:row.deadweightLossFraction,[row.kind==='modeled-internal-return'?'internalReturn':'benefitCostRatio']:row.value};
 if(row.realDiscountRate!==null)fields.discountRate=row.realDiscountRate;
 if(row.crimeValuation!==null)fields.murderValuation=row.crimeValuation==='high'?'4100000':'13000';
 for(const [key,n] of Object.entries(fields))assert(decimal(value(selected.id,prop(key)))===n,`Exact source decimal ${selected.key}/${key}`);
 if(row.crimeValuation===null)assert(value(selected.id,prop('murderValuation'))===undefined,'No inapplicable murder valuation');
 if(row.realDiscountRate===null)assert(value(selected.id,prop('discountRate'))===undefined,'No artificial IRR discount-rate input');
 assert(value(selected.id,prop('unit'))?.value===row.unit,'Stored estimate and SE unit');
 assert(value(selected.id,prop('locator'))?.value===row.locator,'Exact citation locator');
 for(const [p,target] of [['source',registry.paper],['study',registry.study],['population',registry[`population/${row.population}`]],['economicPerspectives',registry[`perspective/${row.perspective}`]],['location',model.reusedProperties.location.targetId]])assert(relation(selected.id,prop(p!),target),'Required source/study/population/perspective/location relation');
 assert(relation(registry.dataset,'d66cd445e09a41809af46d86f083b41c',selected.id),'Dataset entry');
 assert(relation(registry[`table/${row.kind}`],SystemIds.COLLECTION_ITEM_RELATION_TYPE,selected.id),'Table item');
}
for(const op of ops){
 assert(['updateEntity','createRelation'].includes(op.type)&&!(op.unset?.length),'No deletes or unsets');
 if(op.type==='updateEntity'&&op.id.$bytes!==registry['notes/dataset'])assert(relation(op.id.$bytes,SystemIds.TYPES_PROPERTY,ops.find((r:any)=>r.type==='createRelation'&&r.from.$bytes===op.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY)?.to.$bytes),'Each new entity has type');
 if(op.type==='createRelation')assert(op.id.$bytes!==op.entity.$bytes,'Distinct edge and relation-entity IDs');
}
const edgeIds=ops.filter((o:any)=>o.type==='createRelation').map((o:any)=>o.id.$bytes);assert(new Set(edgeIds).size===edgeIds.length,'No duplicate relation operations');
writeFileSync(batch.validationPath,JSON.stringify({...validation,ready:true,checkedAt:new Date().toISOString(),checks:[...validation.checks,...checks],reason:undefined},null,2)+'\n');
console.log(JSON.stringify({ready:true,checks:checks.length,opsHash:batch.sha256}));
