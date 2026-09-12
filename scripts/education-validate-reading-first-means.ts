import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',remaining=process.argv.includes('--remaining'),prefix=`reading-first-means-${remaining?'remaining':'pilot'}`;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const batch=read(`${prefix}-batch`),registry=read('reading-first-registry'),source=read('reading-first-extraction');
const bytes=readFileSync(batch.opsPath),ops=JSON.parse(bytes.toString()),checks:string[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
check(createHash('sha256').update(bytes).digest('hex')===batch.sha256,'Operation hash unchanged');
check(createHash('sha256').update(readFileSync(`${root}/reading-first-extraction.json`)).digest('hex')===batch.sourceHash,'Source hash unchanged');
const proposed=new Set(['actualMean','counterfactualMean','counterfactualProportion'].map(k=>registry[`property/${k}`]));
const values=ops.filter((o:any)=>o.type==='updateEntity').flatMap((o:any)=>o.set);
for(const p of new Set<string>(values.map((v:any)=>v.property.$bytes))){
 const expected=proposed.has(p)?'Decimal':null;
 const declaration=ops.find((o:any)=>o.type==='createRelation'&&o.from.$bytes===p&&o.relationType.$bytes===SystemIds.DATA_TYPE);
 let type=expected;
 if(expected&&!remaining)check(declaration?.to.$bytes===SystemIds.DECIMAL,`New numeric datatype ${p}`);
 else {const live=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});type=live.property?.dataTypeName;check(type,`Existing datatype ${p}`);}
 for(const v of values.filter((v:any)=>v.property.$bytes===p))check(v.value.type.toLowerCase()===type!.toLowerCase(),`Encoded value type ${p}`);
}
const rows=source.records.filter((r:any)=>remaining?!['sat10-score-g1','sat10-grade-level-g1'].includes(r.key):['sat10-score-g1','sat10-grade-level-g1'].includes(r.key));
for(const row of rows){
 const entityId=registry[`estimate/${row.key}/native`],update=ops.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===entityId);
 check(update?.set.length===3&&!update.unset?.length,`Only mean pair and unit added ${row.key}`);
 const proportional=['percent','proportion'].includes(row.means.unit);
 for(const [field,p] of [['actualUnadjustedWithReadingFirst',proportional?'73b35a4ce05f45908118a089d9995bae':registry['property/actualMean']],['estimatedCounterfactualWithoutReadingFirst',proportional?registry['property/counterfactualProportion']:registry['property/counterfactualMean']]]){
  const sourceValue=row.means[field!],actual=update.set.find((s:any)=>s.property.$bytes===p)?.value;
  // Independent decimal comparison by aligning integer powers; no floating point.
  const places=sourceValue.includes('.')?sourceValue.length-sourceValue.indexOf('.')-1:0;
  const exponent=-places-(row.means.unit==='percent'?2:0);
  const scale=Math.min(exponent,actual.exponent);
  check(BigInt(sourceValue.replace('.',''))*10n**BigInt(exponent-scale)===BigInt(actual.mantissa.value.$bigint)*10n**BigInt(actual.exponent-scale),`Source numeric mean ${row.key}/${field}`);
 }
 check(update.set.find((s:any)=>s.property.$bytes==='5c67ae17c84ce783f3b8cd8ffa063661')?.value.value===(proportional?'fraction':row.means.unit),`Mean unit ${row.key}`);
 check(ops.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===registry[`table/means/${proportional?'proportion':'numeric'}`]&&o.to.$bytes===entityId&&o.relationType.$bytes===SystemIds.COLLECTION_ITEM_RELATION_TYPE),`Mean table membership ${row.key}`);
}
if(!remaining){
 const format=ops.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===registry['property/counterfactualProportion'])?.set.find((s:any)=>s.property.$bytes==='396f8c72dfd04b5791ea09c1b9321b2f')?.value.value;
 check(format==='measure-unit/percent scale/100 precision-unlimited','Counterfactual fraction format');
 for(const o of ops.filter((o:any)=>o.type==='updateEntity'&&!rows.some((r:any)=>registry[`estimate/${r.key}/native`]===o.id.$bytes)))check(ops.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===o.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),`New entity typed ${o.id.$bytes}`);
}
check(ops.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions or unsets');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:batch.sha256,checks},null,2)+'\n');
console.log(JSON.stringify({ready:true,checks:checks.length,contrasts:rows.length}));
