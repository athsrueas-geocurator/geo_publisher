import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',stage=process.argv.includes('--arguments')?'arguments':'related',prefix=`perry-debate-${stage}`;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const model=read('perry-debate-model'),discovery=read('perry-debate-identity-review'),perry=read('perry-registry'),mapping=read('perry-mapping-plan'),copy=read('perry-economic-copy-review');
const registryPath=`${root}/perry-debate-registry.json`,registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string):string=>{if(!registry[key]){registry[key]=randomUUID().replaceAll('-','');writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');}return registry[key]!;};
const prop=(key:string)=>mapping.reusedProperties[key]?.id??perry[`property/${key}`];
const p={claim:'96f859efa1ca4b229372c86ad58b694b',factual:'da4a6c1f9d4446f9832ff3b49a4400ef',related:'504e5776788844f6a77dba3ee811d8f0',support:'1dc6a843458848198e7a6e672268f811',oppose:'4e6ec5d14292498a84e5f607ca1a08ce',topics:'806d52bc27e94c9193c057978b093351',entries:'d66cd445e09a41809af46d86f083b41c'};
const ops:Op[]=[],checks:string[]=[],edges:any[]=[];
function check(ok:unknown,label:string){if(!ok)throw Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
function dec(property:string,value:string){check(/^\d+(\.\d+)?$/.test(value),'Decimal source encoding');const[w,f='']=value.split('.');return{property,type:'decimal' as const,exponent:-f.length,mantissa:{type:'i64' as const,value:BigInt(w+f)}};}
check(createHash('sha256').update(readFileSync('tmp/pdfs/perry-2010.pdf')).digest('hex')===model.source.pdfSha256,'Reviewed source PDF unchanged');
check(discovery.sourceComplete&&discovery.exact.every((r:any)=>!r.pageInfo.hasNextPage&&!r.nodes.length),'Complete source-neighborhood and exact identity checks');
check(read('perry-debate-name-discovery').complete,'Completed broad all-space identity review');
check(read('perry-economic-copy-index-verification').passed,'Existing evidence copy indexed');
for(const e of model.evidence)if(e.id)registry[e.key]=e.id;
const fresh=[...model.parents,...model.evidence.filter((e:any)=>!e.id)];
for(const n of fresh)id(n.key);
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
if(stage==='arguments'){
 check(read('perry-debate-related-index-verification').passed,'Related grouping indexed before brackets');
 const review=read('perry-debate-argument-review');
 check(review.prerequisiteProposal===read('perry-debate-related-publication').proposalId&&review.reviewed===true,'Post-publication bracket adjudication');
 check(JSON.stringify(review.pairs)===JSON.stringify(model.pairReview),'Reviewed pair decisions unchanged');
}
for(const[property,type]of[[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[p.factual,'Checkbox'],...[SystemIds.TYPES_PROPERTY,p.related,p.support,p.oppose,p.topics,p.entries,prop('source'),prop('study'),prop('population'),prop('economicPerspectives'),SystemIds.BLOCKS,SystemIds.COLLECTION_ITEM_RELATION_TYPE].map(v=>[v,'Relation']),...['benefitCostRatio','standardError','discountRate','deadweightLoss','murderValuation'].map(k=>[prop(k),'Decimal']),...['followup','locator','unit','currency'].map(k=>[prop(k),'Text']),[prop('priceYear'),'Integer']]){
 const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});check(d.property?.dataTypeName===type,`Live datatype ${property}`);
}
const live=new Map<string,any>();
for(const entityId of [...Object.values(registry).filter(v=>model.evidence.some((e:any)=>e.id===v)),perry.paper,perry.study,perry.dataset,perry['population/all'],perry['perspective/society'],model.discovery.topicCandidate]){
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){id name description spaceIds types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text decimal boolean integer}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space:target.spaceId}});
 check(d.entity&&!d.entity.values.pageInfo.hasNextPage,`Existing endpoint ${entityId}`);live.set(entityId,d.entity);
 if(d.entity.types.some((t:any)=>t.id===p.claim))check(!d.entity.spaceIds.includes('b5a31f8182b042437ede0f84ee02f104'),`No excluded Claim residency ${entityId}`);
}
check(live.get(model.discovery.topicCandidate).name==='Early childhood education'&&live.get(model.discovery.topicCandidate).types.some((t:any)=>t.id==='5ef5a5860f274d8e8f6c59ae5b3e89e2'),'Reuse existing education Topic');
for(const e of model.evidence.filter((e:any)=>e.id)){
 const expected=copy.find((r:any)=>r.id===e.id),v=live.get(e.id).values.nodes;
 check(expected&&live.get(e.id).name===expected.after.name&&v.some((x:any)=>x.propertyId===prop('benefitCostRatio')&&Number(x.decimal)===Number(e.value))&&v.some((x:any)=>x.propertyId===prop('standardError')&&Number(x.decimal)===Number(e.standardError)),`Unchanged source evidence ${e.key}`);
}
async function edge(from:string,type:string,to:string,position?:string){
 const key=`edge/${from}/${type}/${to}`;
 const d:any=await gql('query($from:UUID!,$to:UUID!,$type:UUID!,$space:UUID!){relations(first:1,filter:{fromEntityId:{is:$from},toEntityId:{is:$to},typeId:{is:$type},spaceId:{is:$space}}){id}}',{variables:{from,to,type,space:target.spaceId}});
 if(d.relations.length)return;
 ops.push(...Ops.relations.create({id:id(key),entityId:id(`${key}/entity`),fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);edges.push({from,type,to,position});
}
for(const n of fresh){
 const entityId=id(n.key);const d:any=await gql('query($name:String!,$id:UUID!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}entity(id:$id){name spaceIds types{id}}}',{variables:{name:n.name,id:entityId}});
 check(!d.entitiesConnection.pageInfo.hasNextPage&&d.entitiesConnection.nodes.every((e:any)=>e.id===entityId),`Fresh all-space exact identity ${n.key}`);
 if(stage==='arguments'){check(d.entity?.name===n.name&&d.entity.spaceIds.includes(target.spaceId)&&!d.entity.spaceIds.includes('b5a31f8182b042437ede0f84ee02f104'),'Published Claim unchanged and eligible');continue;}
 check(!d.entity?.spaceIds?.length,'Unoccupied persistent ID');
 const values:any[]=[{property:p.factual,type:'boolean',value:n.isFactual}];
 if(n.key==='earnings-extrapolation')values.push(text(prop('locator'),n.sourceLocator));
 if(n.key==='pooled-low-valuation-through-40'){
  check(n.value==='5.4'&&n.standardError==='2.2'&&n.benefitHorizonAge===40,'Visually verified Table 7 cell');
  values.push(dec(prop('benefitCostRatio'),n.value),dec(prop('standardError'),n.standardError),dec(prop('discountRate'),n.discountRate),dec(prop('deadweightLoss'),n.deadweightLoss),dec(prop('murderValuation'),n.murderValuation),text(prop('unit'),'ratio'),text(prop('followup'),'Modeled economic horizon through age 40'),text(prop('locator'),n.sourceLocator),text(prop('currency'),'USD'),{property:prop('priceYear'),type:'integer',value:2006n});
 }
 ops.push(...Ops.entities.update({id:entityId,name:n.name,description:n.description,values}).ops);
 await edge(entityId,SystemIds.TYPES_PROPERTY,p.claim);await edge(entityId,prop('source'),perry.paper);await edge(entityId,prop('study'),perry.study);await edge(entityId,prop('study'),perry.dataset);
 if(n.key==='pooled-low-valuation-through-40'){await edge(entityId,prop('population'),perry['population/all']);await edge(entityId,prop('economicPerspectives'),perry['perspective/society']);await edge(perry.dataset,p.entries,entityId);}
 if(model.parents.some((x:any)=>x.key===n.key))await edge(perry.dataset,prop('study'),entityId);
}
if(stage==='related'){
 for(const n of [...model.parents,...model.evidence])await edge(id(n.key),p.topics,model.discovery.topicCandidate);
 const table=id('table/horizon-comparison');ops.push(...Ops.entities.update({id:table,name:'Perry benefit horizons: age 40 versus age 65'}).ops);await edge(table,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);await edge(table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
 await edge(perry.dataset,SystemIds.BLOCKS,table,'az');
 const attachment=id(`edge/${perry.dataset}/${SystemIds.BLOCKS}/${table}/entity`);
 await edge(attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
 for(const [i,k] of ['benefitCostRatio','standardError','followup','discountRate','deadweightLoss','murderValuation','locator'].entries())await edge(attachment,SystemIds.PROPERTIES,prop(k),`a${i}`);
 await edge(table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,id('pooled-low-valuation-through-40'),'a0');await edge(table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,id('pooled-low-valuation-lifetime'),'a1');
 const block=id('notes/horizons');ops.push(...Ops.entities.update({id:block,values:[text(SystemIds.MARKDOWN_CONTENT,'## Interpreting the preschool debate\n\nThe policy Claims express competing judgments about expanding publicly funded preschool; they are not recommendations attributed to the paper. Their linked estimates come from one historical experiment and do not establish the returns of every new preschool program.\n\nThe comparison holds the pooled sample, 3% discount rate, 50% tax-financing welfare loss and $13,000 murder valuation fixed. Table 7 uses separate arrest ratios and reports modeled benefit/cost ratios of 5.4 (SE 2.2) through age 40 and 7.1 (SE 2.3) through age 65. The latter reuses the existing Table 1 Claim. These are sensitivity cases, not independent studies or confidence bounds. The age-40 model still includes imputation and economic valuation; later benefits require extrapolation.\n\nSource: [Heckman and colleagues (2010)]('+model.source.url+'), Section 4.3 and Table 7, pp.125–126.')]}).ops);await edge(block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);await edge(perry.dataset,SystemIds.BLOCKS,block,'az0');
}
for(const pair of model.pairReview){
 check(pair.reason&&registry[pair.a]&&registry[pair.b],'Explicit pair rationale and endpoints');const a=id(pair.a),b=id(pair.b);
 if(stage==='related'){await edge(a,p.related,b);if(pair.related==='both')await edge(b,p.related,a);}
 else if(pair.proposedBracket!=='RELATED-ONLY'){const type=pair.proposedBracket==='SUPPORTS'?p.support:p.oppose;await edge(a,type,b);if(pair.argumentDirection==='both')await edge(b,type,a);}
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:stage==='related'?'Connect Perry preschool expansion debates and age-40 sensitivity evidence':'Link arguments in Perry preschool expansion debate',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,edges,model},null,2)+'\n');console.log(JSON.stringify({stage,operations:ops.length,checks:checks.length,claims:Object.fromEntries([...model.parents,...model.evidence].map(n=>[n.key,id(n.key)]))}));
