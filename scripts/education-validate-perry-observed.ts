import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SystemIds} from '@geoprotocol/geo-sdk';
const root='data/education',remaining=process.argv.includes('--remaining'),prefix=`perry-observed-${remaining?'remaining':'pilot'}`;
const batch=JSON.parse(readFileSync(`${root}/${prefix}-batch.json`,'utf8')),bytes=readFileSync(batch.opsPath,'utf8'),ops=JSON.parse(bytes);
const registry=JSON.parse(readFileSync(batch.registry,'utf8')),mapping=JSON.parse(readFileSync(`${root}/perry-mapping-plan.json`,'utf8')),model=JSON.parse(readFileSync(`${root}/perry-observed-model.json`,'utf8'));
const input=JSON.parse(readFileSync(`${root}/perry-publication-records.json`,'utf8')),prior=JSON.parse(readFileSync(batch.validationPath,'utf8'));
const checks:string[]=[];function assert(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const prop=(key:string)=>key==='outcomeMeasure'?model.outcomeMeasure.id:mapping.reusedProperties[key]?.id??registry[`property/${key}`];
const value=(id:string,p:string)=>ops.filter((o:any)=>o.type==='updateEntity'&&o.id.$bytes===id).flatMap((o:any)=>o.set).find((s:any)=>s.property.$bytes===p)?.value;
const relation=(from:string,p:string,to:string)=>ops.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===from&&o.relationType.$bytes===p&&o.to.$bytes===to);
function decimal(v:any){assert(v?.type==='decimal','Encoded Decimal');const n=BigInt(v.mantissa.value.$bigint),e=v.exponent,d=String(n).padStart(-e+1,'0');return e>=0?`${n}${'0'.repeat(e)}`:`${d.slice(0,e)}.${d.slice(e)}`.replace(/0+$/,'').replace(/\.$/,'');}
assert(createHash('sha256').update(bytes).digest('hex')===batch.sha256&&prior.opsHash===batch.sha256,'Payload hash');
assert(Date.now()-Date.parse(prior.checkedAt)<15*60*1000,'Fresh builder checks');
assert(batch.selected.length===(remaining?30:2),'Expected selected row count');
const expected=input.records.filter((r:any)=>r.kind===model.rowKind&&(remaining?!model.pilot.includes(r.key):model.pilot.includes(r.key))).map((r:any)=>r.key).sort();
assert(JSON.stringify(batch.selected.map((r:any)=>r.key).sort())===JSON.stringify(expected),'All intended rows selected exactly');
for(const selected of batch.selected){
 const row=input.records.find((r:any)=>r.key===selected.key);assert(row&&row.causalEffect===false&&row.sampleSize===null,'Descriptive mean with unknown complete-case N');
 assert(decimal(value(selected.id,prop(row.unit==='fraction'?'observedProportion':'observedMonetaryMean')))===row.value,'Source mean');assert(decimal(value(selected.id,prop('standardError')))===row.standardError,'Source SE in matching units');
 for(const [p,v] of [['outcomeMeasure',row.outcome],['followup',row.followup],['unit',row.unit],['locator',row.locator]])assert(value(selected.id,prop(p!))?.value===v,`Exact ${p}`);
 for(const [p,target] of [['source',registry.paper],['study',registry.study],['population',registry[`population/${row.population}`]],['studyArms',registry[`arm/${row.assignment}`]],['location',mapping.reusedProperties.location.targetId]])assert(relation(selected.id,prop(p!),target),'Correct source/study/population/arm/location');
 assert(!value(selected.id,'bf0249bb71924460bfe6b35394ed0781'),'No inferred outcome N');assert(!value(selected.id,'e500e2585a964d2c9df4a47b199616c3'),'No causal-effect property');
 if(row.unit==='USD'){assert(value(selected.id,prop('priceYear'))?.value?.$bigint===String(row.priceYear),'Integer currency price year');assert(value(selected.id,prop('currency'))?.value==='USD','Currency');}
 assert(relation(registry.dataset,'d66cd445e09a41809af46d86f083b41c',selected.id),'Dataset entry');assert(relation(registry[`table/observed-${row.unit}`],SystemIds.COLLECTION_ITEM_RELATION_TYPE,selected.id),'Correct unit table');
}
for(const op of ops){assert(['updateEntity','createRelation'].includes(op.type)&&!op.unset?.length,'No destructive operations');if(op.type==='updateEntity'&&op.id.$bytes!==registry['notes/dataset'])assert(ops.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===op.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Created entity typed');if(op.type==='createRelation')assert(op.id.$bytes!==op.entity.$bytes,'Separate edge and relation-entity IDs');}
writeFileSync(batch.validationPath,JSON.stringify({...prior,ready:true,checkedAt:new Date().toISOString(),reason:undefined,checks:[...prior.checks,...checks]},null,2)+'\n');console.log(JSON.stringify({ready:true,checks:checks.length,opsHash:batch.sha256}));
