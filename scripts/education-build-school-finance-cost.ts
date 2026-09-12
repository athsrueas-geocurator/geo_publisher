import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='school-finance-jjp-cost';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const registry:Record<string,string>=read('school-finance-jjp-registry'),saga=read('saga-registry'),star=read('star-economic-registry'),reconciliation=read('school-finance-jjp-cost-reconciliation'),transcription=read('school-finance-jjp-transcription');
const input=reconciliation.authorReported,checks:string[]=[],ops:Op[]=[],evidence:any={checkedAt:new Date().toISOString(),properties:[],identities:[]};
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const decimal=(property:string,value:string)=>({property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/cost/${key}`);ops.push(...Ops.relations.create({id:id(`relation/cost/${key}`),entityId,fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);return entityId;}
check(hash(readFileSync(transcription.sourcePdf))===reconciliation.sourceSha256,'Reviewed source unchanged');
check(reconciliation.scenarios.length===16&&Object.values(reconciliation.checks).every(Boolean)&&reconciliation.computedComparisonEligible===false,'Sensitivity calculations checked and not comparison eligible');
check(JSON.stringify(input)===JSON.stringify(transcription.costIllustration),'Reported figures match visually checked transcription');
const p={cost:saga['property/cost'],discount:star['property/discount'],priceYear:saga['property/priceYear'],currency:'6e7371ca96cb44348f16932f77f55e75',denominator:saga['property/denominator'],locator:saga['property/locator'],estimand:saga['property/estimand']};
for(const [property,datatype] of [[p.cost,'Decimal'],[p.discount,'Decimal'],[p.priceYear,'Integer'],...[p.currency,p.denominator,p.locator,p.estimand,SystemIds.MARKDOWN_CONTENT].map(p=>[p,'Text']),...[SystemIds.TYPES_PROPERTY,SystemIds.BLOCKS,SystemIds.PROPERTIES,SystemIds.VIEW_PROPERTY,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_ITEM_RELATION_TYPE,saga['property/entries'],'49c5d5e1679a4dbdbfd33f618f227c94','dfa6aebe1ca94bf29faccc4cc7afb24c'].map(p=>[p,'Relation'])]){
 const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}entity(id:$id){name description}}',{variables:{id:property}});
 evidence.properties.push({id:property,...data});check(data.property?.dataTypeName===datatype,`Live datatype ${property}`);
}
const types=await gql<any>('query{entity(id:"96f859efa1ca4b229372c86ad58b694b"){name description types{id}relations(first:30){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}');
check(types.entity.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),'Claim is a live Type');evidence.claim=types;
// Search all spaces and all types for any cost record already attached to this exact source.
const existing=await gql<any>('query($source:UUID!,$cost:UUID!){entitiesConnection(first:10,filter:{and:[{relations:{some:{typeId:{is:"49c5d5e1679a4dbdbfd33f618f227c94"},toEntityId:{is:$source}}}},{values:{some:{propertyId:{is:$cost}}}}]}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{source:registry.paper,cost:p.cost}});
evidence.sourceCost=existing;check(!existing.entitiesConnection.pageInfo.hasNextPage&&existing.entitiesConnection.nodes.length===0,'No all-space source-linked cost duplicate');
const dataset=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){relations(first:30,filter:{spaceId:{is:$space},typeId:{is:"beaba5cba67741a8b35377030613fc70"}}){nodes{toEntityId position}pageInfo{hasNextPage}}}}',{variables:{id:registry.dataset,space:target.spaceId}});
check(!dataset.entity.relations.pageInfo.hasNextPage,'Complete dataset block positions');
const positions=dataset.entity.relations.nodes.map((r:any)=>r.position).filter(Boolean).sort();let last:string|null=positions.at(-1)??null;
const markdown=`## Author-reported illustration\n\nThe final article considers a child born in 1975, entering school around 1980. Baseline annual school spending is 5,459 USD in 2013 prices; a 10% increase lasts 12 school years. The authors report an incremental present cost of 4,850 USD per pupil at a 6% discount rate. This is an illustrative spending model, not a provider invoice or an observed program price.\n\nThe earnings calculation uses median annual earnings of 28,031 USD and a 7.2% increase between ages 25 and 60. It reports benefits slightly above 10,000 USD, a benefit-cost ratio of approximately 3, and an internal rate of return around 10%. The preceding paragraph instead cites a 7.7% wage increase. These approximate source figures are preserved as reported.\n\n## Comparison limits\n\nThe authors' exact cash-flow schedule has not been independently reconciled from the stated inputs. The reported ratio and return remain qualified illustrative results, not independently reproduced estimates. All numerical figures in this block come from the article; diagnostic recalculations are not included.\n\nThe structured cost row preserves the source-reported 4,850 USD. It is not eligible for a reconciled cost-effectiveness ranking or an automatic pairing with individual regression coefficients. No subgroup-specific cost, observed benefit, or exact reported benefit-cost ratio is implied.\n\n## Source\n\nJackson, Johnson and Persico (2016), [final journal article](https://doi.org/10.1093/qje/qjv036), printed pp. 212–213 (PDF pp. 57–58). [Author-hosted full text](${read('school-finance-jjp-model').pdfUrl}).`;
const entities=[
 {key:'cost/illustration',name:'School-finance reforms: author-reported illustrative present cost (2016)',type:'96f859efa1ca4b229372c86ad58b694b',description:'A reported model of incremental spending for a sustained increase in school resources. Interpret it with the price year, discount rate and separate reproduction limitations.',values:[decimal(p.cost,input.reportedPresentCost),decimal(p.discount,input.discountRateFraction),integer(p.priceYear,input.priceYear),text(p.currency,input.currency),text(p.denominator,'per pupil; present value of incremental spending over 12 school years'),text(p.locator,'Printed pp. 212–213 (PDF pp. 57–58); benefit-cost illustration'),text(p.estimand,'Present value per pupil of incremental school spending for a 10% increase over 12 school years')]},
 {key:'notes/cost-illustration',name:'School-finance reforms: cost illustration and reproduction limits',type:SystemIds.TEXT_BLOCK,values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]},
 {key:'table/cost-illustration',name:'School-finance reforms: reported illustrative cost',type:SystemIds.DATA_BLOCK,values:[]}
];
for(const e of entities){
 const found=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name:e.name}});evidence.identities.push({name:e.name,...found});
 check(!found.entitiesConnection.pageInfo.hasNextPage&&found.entitiesConnection.nodes.every((n:any)=>n.id===id(e.key)),`All-space identity ${e.name}`);
 ops.push(...Ops.entities.update({id:id(e.key),name:e.name,...('description'in e?{description:e.description}:{}),values:e.values}).ops);rel(`${e.key}/type`,id(e.key),SystemIds.TYPES_PROPERTY,e.type);
}
rel('cost/source',id('cost/illustration'),'49c5d5e1679a4dbdbfd33f618f227c94',registry.paper!);
rel('cost/study',id('cost/illustration'),'dfa6aebe1ca94bf29faccc4cc7afb24c',registry.study!);
rel('dataset/entry',registry.dataset!,saga['property/entries'],id('cost/illustration'));
last=Position.generateBetween(last,null);const attachment=rel('dataset/table',registry.dataset!,SystemIds.BLOCKS,id('table/cost-illustration'),last);
last=Position.generateBetween(last,null);rel('dataset/notes',registry.dataset!,SystemIds.BLOCKS,id('notes/cost-illustration'),last);
rel('cost/notes',id('cost/illustration'),SystemIds.BLOCKS,id('notes/cost-illustration'));
rel('table/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
rel('table/source',id('table/cost-illustration'),SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
rel('table/item',id('table/cost-illustration'),SystemIds.COLLECTION_ITEM_RELATION_TYPE,id('cost/illustration'),'a0');
let column:string|null=null;for(const [i,property]of [p.cost,p.discount,p.priceYear,p.currency,p.denominator,p.locator].entries()){column=Position.generateBetween(column,null);rel(`table/column/${i}`,attachment,SystemIds.PROPERTIES,property,column);}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',encoded=JSON.parse(bytes);
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'Additive operations only');
for(const e of entities)check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===id(e.key)&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),`Typed ${e.key}`);
const cost=encoded.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===id('cost/illustration'));
check(cost.set.find((v:any)=>v.property.$bytes===p.cost).value.mantissa.value.$bigint==='4850','Reported cost remains 4850');
const sha256=hash(bytes),batch={name:'Document school-finance cost illustration and reproduction limits',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:registry.dataset,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/school-finance-jjp-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(`${root}/${prefix}-schema.json`,JSON.stringify(evidence,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
