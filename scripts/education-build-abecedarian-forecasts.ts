import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';

const root='data/education',prefix='abecedarian-forecast-remaining';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const input=read('abecedarian-forecast-records'),registry:Record<string,string>=read('abecedarian-registry');
const pilotKey='forecast/lifecycle-abc-all/authorsMethod',rows=input.records.filter((r:any)=>r.key!==pilotKey);
const ops:Op[]=[],checks:string[]=[];
const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
check(rows.length===10&&read('abecedarian-forecast-pilot-index-verification').passed,'Verified pilot; ten remaining estimates');
check(read('abecedarian-forecast-transcription-verification').passed,'Verified source transcription');
check(createHash('sha256').update(readFileSync(`${root}/abecedarian-forecast-transcription.json`)).digest('hex')===input.transcriptionSha256,'Transcription hash unchanged');
const transcription=read('abecedarian-forecast-transcription');
check(createHash('sha256').update(readFileSync(transcription.sourceFile)).digest('hex')===input.sourceSha256,'Pinned source PDF unchanged');
const id=(key:string)=>{if(!registry[key]){registry[key]=randomUUID().replaceAll('-','');writeFileSync(`${root}/abecedarian-registry.json`,JSON.stringify(registry,null,2)+'\n');}return registry[key]!;};
const rel=(key:string,from:string,type:string,to:string,position?:string)=>ops.push(...Ops.relations.create({id:id(`${key}/edge`),entityId:id(`${key}/entity`),fromEntity:from,type,toEntity:to,...(position?{position}:{})}).ops);
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const dec=(property:string,value:string)=>{const [a,b='']=value.split('.');return {property,type:'decimal' as const,exponent:-b.length,mantissa:{type:'i64' as const,value:BigInt(a+b)}};};
const p=input.mapping,entries='d66cd445e09a41809af46d86f083b41c',factual='da4a6c1f9d4446f9832ff3b49a4400ef',claimType='96f859efa1ca4b229372c86ad58b694b';
for(const [property,type] of [[p.value,'Decimal'],[p.standardError,'Decimal'],[p.unit,'Text'],[p.locator,'Text'],[p.horizon,'Text'],[factual,'Checkbox'],[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[p.source,'Relation'],[p.study,'Relation'],[entries,'Relation'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.COLLECTION_ITEM_RELATION_TYPE,'Relation']]){
 const d:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});check(d.property?.dataTypeName===type,`Schema ${property}: ${type}`);
}
// All-space source-linked discovery catches differently worded estimates as well as title matches.
let after:string|null=null;const cursors=new Set<string>(),candidates:any[]=[];
do{
 const d:any=await gql('query($paper:UUID!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{relations:{some:{typeId:{is:"49c5d5e1679a4dbdbfd33f618f227c94"},toEntityId:{is:$paper}}}}){nodes{id name types{id}}pageInfo{hasNextPage endCursor}}}',{variables:{paper:rows[0].sourceArticleId,after}});
 const page=d.entitiesConnection;candidates.push(...page.nodes);
 if(page.pageInfo.hasNextPage){check(page.pageInfo.endCursor&&!cursors.has(page.pageInfo.endCursor),'Complete source discovery cursor');after=page.pageInfo.endCursor;cursors.add(after!);}else after=null;
}while(after);
check(candidates.filter(n=>n.types.some((t:any)=>t.id===claimType)).every(n=>n.id===registry[pilotKey]),'No unreviewed source-linked Claim duplicate');
for(const [entityId,type] of [[registry.dataset,'0c4babfb43893486af827341bbf32e09'],[registry['table/forecasts'],SystemIds.DATA_BLOCK],[registry['dataset/context'],SystemIds.TEXT_BLOCK],[rows[0].sourceArticleId,'a2a5ed0cacef46b1835de457956ce915'],...rows[0].studyIds.map((v:string)=>[v,'3ef269bc5f114691abc02dcbf398fd63'])]){
 const d:any=await gql('query($id:UUID!){entity(id:$id){types{id} spaceIds}}',{variables:{id:entityId}});check(d.entity?.types.some((t:any)=>t.id===type)&&d.entity.spaceIds.includes(target.spaceId),`Reuse verified target ${entityId}`);
}
for(const [index,r] of rows.entries()){
 const entityId=id(r.key);
 const d:any=await gql('query($n:String!,$id:UUID!){entitiesConnection(first:10,filter:{name:{isInsensitive:$n}}){nodes{id}pageInfo{hasNextPage}}entity(id:$id){name types{id}}}',{variables:{n:r.name,id:entityId}});
 check(!d.entitiesConnection.pageInfo.hasNextPage&&!d.entitiesConnection.nodes.length,`No exact-name duplicate: ${r.key}`);
 check(!d.entity||(!d.entity.name&&!d.entity.types.length),`Unused persisted identity: ${r.key}`);
 check(r.sourceReported&&r.rankingEligible===false&&r.studyIds.length===2,`Source-reported dependent model: ${r.key}`);
 ops.push(...Ops.entities.update({id:entityId,name:r.name,description:r.description,values:[dec(p.value,r.value),dec(p.standardError,r.standardError),text(p.unit,r.unit),text(p.locator,r.locator),text(p.horizon,r.horizon),{property:factual,type:'boolean',value:true}]}).ops);
 rel(`${r.key}/type`,entityId,SystemIds.TYPES_PROPERTY,claimType);
 rel(`${r.key}/source`,entityId,p.source,r.sourceArticleId);
 for(const study of r.studyIds)rel(`${r.key}/study/${study}`,entityId,p.study,study);
 rel(`${r.key}/entry`,registry.dataset!,entries,entityId);
 // The baseline pilot stays first; remaining source cells follow their manuscript order.
 rel(`${r.key}/item`,registry['table/forecasts']!,SystemIds.COLLECTION_ITEM_RELATION_TYPE,entityId,`a${(index+1).toString(36)}`);
}
const pilotOps=read('abecedarian-forecast-pilot-ops');
const oldBlock=pilotOps.find((o:any)=>o.type==='updateEntity'&&o.id.$bytes===registry['dataset/context']);
const oldMarkdown=oldBlock.set.find((s:any)=>s.property.$bytes===SystemIds.MARKDOWN_CONTENT).value.value;
const newMarkdown=oldMarkdown.replace("The current table contains the authors' pooled life-cycle, all-benefits model estimate: benefit/cost ratio 7.33, standard error 1.84. It is one specification from Table 6 of the August 2, 2018 author manuscript, not an independent third experiment.","The table contains all 11 reported benefit/cost ratios and standard errors from Table 6 of the August 2, 2018 author manuscript. The pooled life-cycle, all-benefits baseline (7.33; standard error 1.84) appears first, followed by the other source cells in manuscript order. These are alternative forecasts using related data, not 11 independent studies. The Kline–Walters-style estimates are García and colleagues' application of that forecasting method, not results directly reported by Kline and Walters. The missing authors'-method cell for Chetty-based age-27 inputs is not reported, not zero.");
check(newMarkdown!==oldMarkdown,'Coverage updated for full Table 6');
const live:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:registry['dataset/context'],space:target.spaceId}});
check(!live.entity.values.pageInfo.hasNextPage&&live.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT&&v.text===oldMarkdown),'Existing context matches reviewed pilot');
ops.push(...Ops.entities.update({id:registry['dataset/context']!,values:[text(SystemIds.MARKDOWN_CONTENT,newMarkdown)]}).ops);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Complete ABC/CARE Table 6 forecasting comparison',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks,candidates},null,2)+'\n');
console.log(JSON.stringify({estimates:rows.length,operations:ops.length,checks:checks.length}));
