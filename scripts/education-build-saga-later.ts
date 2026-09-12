import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='saga-later',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Preserve submitted payload');
const model=read('saga-later-model'),extraction=read('saga-later-extraction'),source=read('saga-later-transcription'),saga=read('saga-registry'),schema=read('saga-pooled-model');
const registry:Record<string,string>=existsSync(`${root}/${prefix}-registry.json`)?read(`${prefix}-registry`):{};
const id=(key:string)=>{if(!registry[key]){registry[key]=randomUUID().replaceAll('-','');writeFileSync(`${root}/${prefix}-registry.json`,JSON.stringify(registry,null,2)+'\n');}return registry[key]!;};
const ops:Op[]=[],checks:string[]=[],created:any[]=[],identities:any[]=[],copies:any[]=[];
const check=(pass:unknown,label:string)=>{if(!pass)throw new Error(label);checks.push(label);};
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const decimal=(property:string,value:string)=>({property,type:'decimal' as const,exponent:-(value.split('.')[1]?.length??0),mantissa:{type:'i64' as const,value:BigInt(value.replace('.',''))}});
function rel(key:string,from:string,type:string,to:string,position?:string){const entityId=id(`relation-entity/${key}`);ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);return entityId;}
async function create(key:string,name:string,type:string,description:string|undefined,values:any[]=[]){
 const data=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name spaceIds}pageInfo{hasNextPage}}}',{variables:{name}});
 identities.push({name,...data.entitiesConnection});check(!data.entitiesConnection.pageInfo.hasNextPage&&!data.entitiesConnection.nodes.length,`Exact all-space identity ${key}`);
 check(!description||description.length<=350,`Concise description ${key}`);
 const entity=id(key),probe=await gql<any>('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:entity}});check(!probe.entity||(!probe.entity.name&&!probe.entity.types.length),`Unused stable ID ${key}`);
 ops.push(...Ops.entities.update({id:entity,name,...(description?{description}:{}),values}).ops);rel(`${key}/type`,entity,SystemIds.TYPES_PROPERTY,type);created.push({key,id:entity,name,type});
}
check(hash(readFileSync(source.sourcePdf))===extraction.sourceSha256&&hash(readFileSync(`${root}/${prefix}-transcription.json`))===extraction.transcriptionSha256,'Fingerprint and transcription verified');
check(extraction.records.length===16&&extraction.sourceRows.length===8,'Complete appendix scope');
const linked=read('saga-pooled-link-discovery');check(linked.targets.every((t:any)=>t.complete),'Complete source/trial neighborhoods');
const knownClaims=new Set<string>([saga,read('saga-outcomes-registry'),read('saga-pooled-registry')].flatMap(r=>Object.entries(r).filter(([key])=>key.startsWith('estimate/')).map(([,value])=>String(value))));
// Reviewed source-linked cost Claim: a budget observation, not a later outcome.
knownClaims.add('0adff420a6bc480b8973880dfdb5f296');
check(linked.candidates.filter((c:any)=>c.types?.some((t:any)=>t.id===schema.claimType)).every((c:any)=>knownClaims.has(c.id)),'All existing source-linked Claims identified in prior registries');
writeFileSync(`${root}/${prefix}-linked-discovery.json`,JSON.stringify(linked,null,2)+'\n');
check(read('saga-pooled-pilot-browser-verification').passed&&read('saga-pooled-query-verification').passed,'Existing later-outcome schema pilot rendered and queried');
// Search all spaces and types. Previously published pooled findings are distinct analyses.
const broad:any[]=[];let after:string|null=null;const cursors=new Set<string>();
do{const data:any=await gql<any>('query($after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:"Saga"}}){nodes{id name description spaceIds}pageInfo{hasNextPage endCursor}}}',{variables:{after}});const p=data.entitiesConnection;broad.push(...p.nodes);if(p.pageInfo.hasNextPage){check(!!p.pageInfo.endCursor&&!cursors.has(p.pageInfo.endCursor),'Discovery advances');cursors.add(p.pageInfo.endCursor);after=p.pageInfo.endCursor;}else after=null;}while(after);
writeFileSync(`${root}/${prefix}-broad-discovery.json`,JSON.stringify({checkedAt:new Date().toISOString(),complete:true,nodes:broad},null,2)+'\n');
const suspects=broad.filter(n=>/study [12]/i.test(n.name??'')&&/11th|eleventh|graduat|later|follow.up/i.test(n.name??''));check(!suspects.length,`Review existing trial-specific follow-up candidates ${JSON.stringify(suspects)}`);
const properties=new Map<string,string>([[saga['property/estimate'],'Decimal'],[saga['property/se'],'Decimal'],[saga['property/study'],'Integer'],[schema.sampleProperty,'Integer'],[schema.factualProperty,'Checkbox'],...[SystemIds.NAME_PROPERTY,SystemIds.DESCRIPTION_PROPERTY,SystemIds.MARKDOWN_CONTENT,schema.outcomeProperty,saga['property/unit'],saga['property/estimand'],saga['property/locator'],saga['property/followup']].map(p=>[p,'Text'] as [string,string]),...[SystemIds.TYPES_PROPERTY,SystemIds.BLOCKS,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_ITEM_RELATION_TYPE,SystemIds.VIEW_PROPERTY,SystemIds.PROPERTIES,schema.sourceProperty,schema.relatedProperty,saga['property/entries']].map(p=>[p,'Relation'] as [string,string])]);
for(const [p,t] of properties){const data=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(data.property?.dataTypeName===t,`Live datatype ${p}`);}
for(const type of [schema.claimType,SystemIds.DATA_BLOCK,SystemIds.TEXT_BLOCK]){const data=await gql<any>('query($id:UUID!){entity(id:$id){types{id}}}',{variables:{id:type}});check(data.entity?.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),`Existing type ${type}`);}
await create('table','Saga later outcomes by Chicago trial',SystemIds.DATA_BLOCK,undefined);
rel('table/source',id('table'),SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
const attachment=rel('table/attachment',model.datasetId,SystemIds.BLOCKS,id('table'),'d1');rel('table/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
let last:string|null=null;
for(const [i,p] of [saga['property/study'],schema.outcomeProperty,saga['property/estimand'],saga['property/estimate'],saga['property/se'],schema.sampleProperty,saga['property/unit'],saga['property/followup'],saga['property/locator']].entries()){const position=Position.generateBetween(last,null);last=position;rel(`table/column/${i}`,attachment,SystemIds.PROPERTIES,p as string,position);}
for(const [ordinal,r] of extraction.records.entries()){
 const key=`estimate/${r.key}`,v=Number(r.value),magnitude=r.value.replace(/^-/,'');
 const outcome=r.measureKey==='grade11-math'?'eleventh-grade CPS math scores':r.measureKey==='grade11-gpa'?'eleventh-grade math GPA':r.measureKey==='graduated-ontime'?'on-time graduation':'graduation within the observed window';
 const difference=r.unit==='proportion difference'?`${(Math.abs(v)*100).toFixed(1)} percentage points`:`${magnitude} ${r.unit==='GPA points'?'points':'standard deviations'}`;
 const name=`Saga's Chicago study ${r.study} estimated ${outcome} ${difference} ${v<0?'lower':'higher'} from ${r.estimand==='ITT'?'offering tutoring':'tutoring participation'}.`;
 const sourceRow=extraction.sourceRows.find((row:any)=>row.key===r.sourceRowKey);
 const first=`${r.estimand} estimate ${r.value}${r.unit==='proportion difference'?' on the fraction scale':''} (SE ${r.standardError}; N=${r.n}; Appendix Table 5, p. A-12).`;
 const second=r.measureKey.startsWith('graduated')?`Reported row q=${sourceRow.fdrQ}; this imprecise estimate does not establish a graduation benefit or no effect.`:`Reported row q=${sourceRow.fdrQ}; ${Number(sourceRow.fdrQ)<.05?'the adjusted evidence supports a later math improvement':'the adjusted evidence does not establish a later math improvement'}.`;
 const description=`${first} ${second}`;copies.push({key,name,description});
 await create(key,name,schema.claimType,description,[text(schema.outcomeProperty,r.measure),decimal(saga['property/estimate'],r.value),decimal(saga['property/se'],r.standardError),{property:saga['property/study'],type:'integer',value:BigInt(r.study)},{property:schema.sampleProperty,type:'integer',value:BigInt(r.n)},{property:schema.factualProperty,type:'boolean',value:true},text(saga['property/unit'],r.unit),text(saga['property/estimand'],r.estimand),text(saga['property/followup'],model.followup[r.measureKey]),text(saga['property/locator'],'Appendix Table 5; printed p. A-12 (PDF p. 13)')]);
 rel(`${key}/source`,id(key),schema.sourceProperty,model.articleId);rel(`${key}/study`,id(key),schema.relatedProperty,model.studyIds[r.study]);rel(`${key}/entry`,model.datasetId,saga['property/entries'],id(key));rel(`${key}/item`,id('table'),SystemIds.COLLECTION_ITEM_RELATION_TYPE,id(key),`a${String(ordinal).padStart(3,'0')}`);
}
for(const row of extraction.sourceRows){const itt=id(`estimate/${row.key}/itt`),tot=id(`estimate/${row.key}/tot`);rel(`${row.key}/itt-to-tot`,itt,schema.relatedProperty,tot);rel(`${row.key}/tot-to-itt`,tot,schema.relatedProperty,itt);}
await create('notes','Saga trial-specific follow-up: methods and uncertainty',SystemIds.TEXT_BLOCK,undefined,[text(SystemIds.MARKDOWN_CONTENT,model.methodsMarkdown)]);rel('notes/attachment',model.datasetId,SystemIds.BLOCKS,id('notes'),'d0');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=hash(bytes),encoded=JSON.parse(bytes);
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions');for(const e of created)check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===e.id&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Every new entity typed');
const batch={name:'Add trial-specific Saga eleventh-grade and graduation findings',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(`${root}/${prefix}-copy-review.json`,JSON.stringify(copies,null,2)+'\n');writeFileSync(`${root}/${prefix}-identity.json`,JSON.stringify(identities,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,created},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,records:copies.length,checks:checks.length,sha256}));
