import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',expansion=process.argv.includes('--expansion'),prefix=`saga-pooled-${expansion?'expansion':'pilot'}`;
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read('saga-pooled-model'),extraction=read('saga-pooled-extraction'),transcription=read('saga-pooled-transcription'),saga=read('saga-registry'),vocabulary=read('saga-claim-copy-model');
const registry:Record<string,string>=existsSync(`${root}/saga-pooled-registry.json`)?read('saga-pooled-registry'):{};
const saveRegistry=()=>writeFileSync(`${root}/saga-pooled-registry.json`,JSON.stringify(registry,null,2)+'\n');
const id=(key:string)=>{if(!registry[key]){registry[key]=randomUUID().replaceAll('-','');saveRegistry();}return registry[key]!;};
const ops:Op[]=[],checks:string[]=[],created:any[]=[],discovery:any[]=[],copy:any[]=[];
const check=(ok:unknown,label:string)=>{if(!ok)throw new Error(label);checks.push(label);};
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const records=extraction.records.filter((r:any)=>expansion?r.key!=='pooled/t5/cps-math/itt':r.key==='pooled/t5/cps-math/itt');
if(expansion){check(read('saga-pooled-pilot-index-verification').passed,'Pilot indexed');check(read('saga-pooled-pilot-browser-verification').passed,'Pilot rendered');}
function decimal(property:string,value:string){check(/^-?\d+(\.\d+)?$/.test(value),'Exact source decimal');return {property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}};}
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/${key}`);ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);return entityId;}
async function create(key:string,name:string,type:string,description?:string,values:any[]=[]){
 const data=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}',{variables:{name}});
 discovery.push({name,...data.entitiesConnection});
 check(!data.entitiesConnection.pageInfo.hasNextPage&&data.entitiesConnection.nodes.length===0,`Complete all-space exact-name check ${name}`);
 check(!description||description.length<=350,`Concise description ${key}`);
 const entity=id(key);const probe=await gql<any>('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:entity}});
 check(!probe.entity||(!probe.entity.name&&!probe.entity.types.length),`Allocated ID unused ${key}`);
 ops.push(...Ops.entities.update({id:entity,name,...(description?{description}:{}),values}).ops);rel(`${key}/type`,entity,SystemIds.TYPES_PROPERTY,type);created.push({key,id:entity,name,type});
}
check(hash(readFileSync(transcription.sourcePdf))===extraction.sourceSha256,'Reviewed PDF unchanged');
check(hash(readFileSync(`${root}/saga-pooled-transcription.json`))===extraction.transcriptionSha256&&extraction.records.length===38&&extraction.sourceRows.length===19,'Source extraction matches transcription');
check(read('saga-pooled-link-discovery').targets.every((t:any)=>t.complete),'Complete all-space source and trial neighborhoods');
// Complete broad name discovery remains independent of proposed Claim type or destination.
let after:string|null=null;const broad:any[]=[];const cursors=new Set<string>();
do{
 const data:any=await gql<any>('query($after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:"Saga"}}){nodes{id name description spaceIds}pageInfo{hasNextPage endCursor}}}',{variables:{after}});
 const p=data.entitiesConnection;broad.push(...p.nodes);
 if(p.pageInfo.hasNextPage){check(!!p.pageInfo.endCursor&&!cursors.has(p.pageInfo.endCursor),'Broad discovery cursor advances');cursors.add(p.pageInfo.endCursor);after=p.pageInfo.endCursor;}else after=null;
}while(after);
writeFileSync(`${root}/${prefix}-broad-discovery.json`,JSON.stringify({checkedAt:new Date().toISOString(),complete:true,nodes:broad},null,2)+'\n');
const publishedPilotIds=new Set<string>(expansion?read('saga-pooled-pilot-validation').created.map((e:any)=>e.id):[]);
if(expansion)for(const p of ['saga-pooled-pilot','saga-pooled-column'])publishedPilotIds.add(read(`${p}-publication`).proposalId);
const suspects=broad.filter(n=>!publishedPilotIds.has(n.id)&&/pooled|11th.grade|eleventh.grade|graduation|graduated/i.test(n.name??''));
check(suspects.length===0,`Review broad pooled/follow-up candidates: ${JSON.stringify(suspects)}`);
const properties=new Map<string,string>([[saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],[model.sampleProperty,'Integer'],[model.factualProperty,'Checkbox'],...[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY,SystemIds.MARKDOWN_CONTENT,model.outcomeProperty,saga['property/unit'],saga['property/estimand'],saga['property/locator'],saga['property/followup']].map(p=>[p,'Text'] as [string,string]),...[SystemIds.TYPES_PROPERTY,SystemIds.BLOCKS,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_ITEM_RELATION_TYPE,SystemIds.VIEW_PROPERTY,SystemIds.PROPERTIES,model.sourceProperty,model.relatedProperty,saga['property/entries']].map(p=>[p,'Relation'] as [string,string])]);
for(const [p,t] of properties){const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(data.property?.dataTypeName===t,`Live datatype ${p}: ${t}`);}
for(const type of [model.claimType,SystemIds.DATA_BLOCK,SystemIds.TEXT_BLOCK]){const data=await gql<any>('query($id:UUID!){entity(id:$id){types{id}}}',{variables:{id:type}});check(data.entity?.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),`Existing Type ${type}`);}
for(const table of model.tables.filter((t:any)=>expansion?t.sourceTable===7:t.sourceTable===5)){
 const key=`table/${table.sourceTable}`;await create(key,table.name,SystemIds.DATA_BLOCK);
 rel(`${key}/source`,id(key),SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
 const attachment=rel(`${key}/attachment`,model.datasetId,SystemIds.BLOCKS,id(key),`c${table.sourceTable}`);rel(`${key}/view`,attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
 let last:string|null=null;
 // Geo supplies Name automatically. Explicit Name metadata produces a duplicate column.
 for(const [i,p] of [model.outcomeProperty,saga['property/estimand'],saga['property/estimate'],saga['property/se'],model.sampleProperty,saga['property/unit'],saga['property/followup'],saga['property/locator']].entries()){const position=Position.generateBetween(last,null);last=position;rel(`${key}/column/${i}`,attachment,SystemIds.PROPERTIES,p as string,position);}
}
for(const r of records){
 const ordinal=extraction.records.findIndex((e:any)=>e.key===r.key);
 const key=`estimate/${r.key}`,sourceRow=extraction.sourceRows.find((s:any)=>s.key===r.sourceRowKey);
 check(!!sourceRow,'Shared source row exists');
 const aliases:Record<string,string>={discipline:'disciplinary-incidents',absence:'days-absent','grade11-math':'cps-math','grade11-gpa':'math-gpa'};
 const measure=vocabulary.measures[aliases[r.measureKey]??r.measureKey];
 const value=Number(r.value),magnitude=r.value.replace(/^-/,'');let finding:string;
 if(r.measureKey.startsWith('graduated')){
  const outcome=r.measureKey==='graduated-ontime'?'on-time graduation':'graduation within the observed window';
  finding=value===0?`no point-estimate change in ${outcome}`:`${outcome} ${(Math.abs(value)*100).toFixed(1)} percentage points ${value<0?'lower':'higher'}`;
 }else if(measure?.kind==='score')finding=`${measure.label} ${magnitude} ${measure.unit} ${value<0?'lower':'higher'}`;
 else if(measure?.kind==='count')finding=`${magnitude} ${value<0?'fewer':'more'} ${measure.label}`;
 else if(measure?.kind==='fraction')finding=`${measure.label} ${(Math.abs(value)*100).toFixed(1)} percentage points ${value<0?'lower':'higher'}`;
 else if(measure?.kind==='unknown')finding=`an out-of-school suspension effect of ${r.value} with an unresolved unit`;
 else throw new Error(`Unreviewed outcome ${r.measureKey}`);
 const period=r.table===5?'in year one':r.measureKey.startsWith('grade11')?'in the expected eleventh-grade year':'at later follow-up';
 const name=`Saga's pooled Chicago trials estimated ${finding} from ${vocabulary.mechanisms[r.estimand]} ${period}.`;
 const first=`${vocabulary.estimands[r.estimand]} estimate ${r.value}${r.unit==='proportion difference'?' on the fraction scale':''} (SE ${r.standardError}; N=${r.n}; Table ${r.table}, p. ${r.printedPage}).`;
 let interpretation:string;
 if(r.measureKey.startsWith('graduated'))interpretation='The authors describe graduation effects as imprecise; this does not establish a benefit or an absence of effect.';
 else if(!r.unit)interpretation='The source does not resolve whether suspensions count days or events; do not normalize this estimate.';
 else if(r.table===7)interpretation='The authors interpret these math outcomes as evidence of persistence, using expected grade rather than a common elapsed follow-up.';
 else interpretation=`The source row reports an FDR-adjusted q-value of ${sourceRow.fdrQ}${Number(sourceRow.fdrQ)>.05?'; the adjusted evidence does not establish an effect':''}.`;
 const description=`${first} ${interpretation}`;copy.push({key,name,description,sourceRowKey:r.sourceRowKey});
 await create(key,name,model.claimType,description,[text(model.outcomeProperty,r.measure),decimal(saga['property/estimate'],r.value),decimal(saga['property/se'],r.standardError),{property:model.sampleProperty,type:'integer',value:BigInt(r.n)},{property:model.factualProperty,type:'boolean',value:true},text(saga['property/estimand'],r.estimand),text(saga['property/followup'],r.followup),text(saga['property/locator'],`Table ${r.table}, panel ${r.panel}; printed p. ${r.printedPage}`),...(r.unit?[text(saga['property/unit'],r.unit)]:[])]);
 rel(`${key}/source`,id(key),model.sourceProperty,model.articleId);
 for(const study of model.studyIds)rel(`${key}/study/${study}`,id(key),model.relatedProperty,study);
 rel(`${key}/entry`,model.datasetId,saga['property/entries'],id(key));
 rel(`${key}/item`,id(`table/${r.table}`),SystemIds.COLLECTION_ITEM_RELATION_TYPE,id(key),`a${String(ordinal).padStart(3,'0')}`);
}
// Reciprocal links keep alternate estimands discoverable without allocating a new Study.
if(expansion)for(const row of extraction.sourceRows){const itt=id(`estimate/${row.key}/itt`),tot=id(`estimate/${row.key}/tot`);rel(`${row.key}/itt-to-tot`,itt,model.relatedProperty,tot);rel(`${row.key}/tot-to-itt`,tot,model.relatedProperty,itt);}
if(!expansion){
await create('notes','Saga pooled outcomes: methods and coverage',SystemIds.TEXT_BLOCK,undefined,[text(SystemIds.MARKDOWN_CONTENT,model.methodsMarkdown)]);
rel('notes/attachment',model.datasetId,SystemIds.BLOCKS,id('notes'),'c0');
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',encoded=JSON.parse(bytes),sha256=hash(bytes);
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions');
for(const e of created)check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===e.id&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Every created entity typed');
const batch={name:expansion?'Complete pooled and later Saga Chicago tutoring findings':'Add a pooled Saga Chicago mathematics finding',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,records:records.map((r:any)=>({key:r.key,id:registry[`estimate/${r.key}`]}))};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-identity.json`,JSON.stringify(discovery,null,2)+'\n');writeFileSync(`${root}/${prefix}-copy-review.json`,JSON.stringify(copy,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,created},null,2)+'\n');
console.log(JSON.stringify({operations:ops.length,records:copy.length,created:created.length,checks:checks.length,sha256}));
