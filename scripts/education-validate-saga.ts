import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
const root='data/education';
const batch=JSON.parse(readFileSync(`${root}/saga-batch.json`,'utf8'));
const source=JSON.parse(readFileSync(`${root}/saga-extraction.json`,'utf8'));
const registry=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const raw=readFileSync(batch.opsPath,'utf8');
const operations=JSON.parse(raw);
const report:any={checkedAt:new Date().toISOString(),opsHash:createHash('sha256').update(raw).digest('hex'),checks:[],ready:false};
const assert=(value:unknown,message:string)=>{if(!value)throw new Error(message);report.checks.push(message);};
try{
  assert(report.opsHash===batch.sha256,'Operation hash matches manifest');
  assert(operations.every((op:any)=>['updateEntity','createRelation'].includes(op.type)),'No delete or unset operations');
  assert(operations.filter((op:any)=>op.type==='updateEntity').every((op:any)=>!op.unset?.length),'No existing property removals');
  const sourceData=await gql<any>(`query SourceIdentity($doi:String!) { valuesConnection(first:5,filter:{text:{includesInsensitive:$doi}}) { nodes { entity { id name } } pageInfo { hasNextPage } } }`,{variables:{doi:source.publication.doi}});
  assert(!sourceData.valuesConnection.pageInfo.hasNextPage&&sourceData.valuesConnection.nodes.length===0,'No existing cross-space DOI candidate');
  for(const [key,propertyId] of Object.entries(registry).filter(([k])=>k.startsWith('property/'))){
    const update=operations.find((op:any)=>op.type==='updateEntity'&&op.id.$bytes===propertyId);
    const name=update.set.find((s:any)=>s.property.$bytes==='a126ca530c8e48d5b88882c734c38935').value.value;
    const candidates=await gql<any>(`query PropertyIdentity($name:String!) { entitiesConnection(first:5,filter:{name:{isInsensitive:$name}}) { nodes { id name } pageInfo { hasNextPage } } }`,{variables:{name}});
    assert(!candidates.entitiesConnection.pageInfo.hasNextPage&&candidates.entitiesConnection.nodes.length===0,`New property ${name}: exact-name discovery complete`);
  }
  for(const row of source.estimates){
    const op=operations.find((op:any)=>op.type==='updateEntity'&&op.id.$bytes===registry[`estimate/${row.key}`]);
    const value=(property:string)=>op.set.find((s:any)=>s.property.$bytes===property)?.value;
    const effect=value(registry['property/estimate']);
    const se=value(registry['property/se']);
    const numeric=(v:any)=>Number(v.value?.mantissa?.value?.$bigint??v.mantissa?.value?.$bigint)*10**(v.value?.exponent??v.exponent);
    assert(Math.abs(numeric(effect)-row.value)<1e-10,`${row.key}: encoded effect equals source`);
    assert(Math.abs(numeric(se)-row.standardError)<1e-10,`${row.key}: encoded standard error equals source`);
    assert(value(registry['property/estimand']).value===row.estimand,`${row.key}: estimand preserved`);
    assert(Number(value(batch.existingOntology.sampleSize).value?.$bigint??value(batch.existingOntology.sampleSize).value)===row.n,`${row.key}: sample size preserved`);
    assert(value(registry['property/locator']).value===row.locator,`${row.key}: source locator preserved`);
    assert(operations.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===registry[`estimate/${row.key}`]&&r.to.$bytes===batch.paperId&&r.relationType.$bytes===batch.existingOntology.sources),`${row.key}: linked to the publication`);
  }
  report.ready=true;
}catch(error:any){report.error=error.message;process.exitCode=1;}
writeFileSync(`${root}/saga-validation.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
