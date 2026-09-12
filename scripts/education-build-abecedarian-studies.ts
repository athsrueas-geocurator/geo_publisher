import{readFileSync,writeFileSync,existsSync}from'node:fs';
import{randomUUID,createHash}from'node:crypto';
import{Ops,SystemIds,type Op}from'@geoprotocol/geo-sdk';
import{geoGraphqlRequest as gql}from'../src/geo-api-client';
import{EDUCATION_PUBLICATION as target}from'../src/education-bounty';
const root='data/education',prefix='abecedarian-studies',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const m=read('abecedarian-study-model'),registry:Record<string,string>=read('abecedarian-registry'),ops:Op[]=[],checks:string[]=[];
const id=(k:string)=>{if(!registry[k]){registry[k]=randomUUID().replaceAll('-','');writeFileSync(`${root}/abecedarian-registry.json`,JSON.stringify(registry,null,2)+'\n');}return registry[k]!;};
const check=(ok:any,label:string)=>{if(!ok)throw Error(label);checks.push(label);};
const source='49c5d5e1679a4dbdbfd33f618f227c94',location='95d770021faf4f7cb7deb21a7d48cda0';
check(read('abecedarian-context-discovery').complete,'Complete cross-space context discovery reviewed');
for(const[p,t]of[[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.BLOCKS,'Relation'],[source,'Relation'],[location,'Relation'],[m.designProperty,'Relation']]){const r:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Datatype ${p}`);}
for(const key of ['studyType','locationId','randomizedDesignId','sourceArticleId']){const r:any=await gql('query($id:UUID!){entity(id:$id){name description spaceIds types{id}}}',{variables:{id:m[key]}});check(!!r.entity,`Live ${key}`);if(key==='studyType')check(r.entity.types.some((t:any)=>t.id===SystemIds.SCHEMA_TYPE),'Study is Type');if(key==='locationId')check(r.entity.description.includes('North Carolina')&&r.entity.spaceIds.includes(m.locationSourceSpace),'Reuse correct Chapel Hill');}
const rel=(k:string,from:string,type:string,to:string)=>ops.push(...Ops.relations.create({id:id(`${k}/edge`),entityId:id(`${k}/entity`),fromEntity:from,type,toEntity:to}).ops);
for(const s of m.studies){
 const exact:any=await gql('query($n:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$n}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{n:s.name}});check(!exact.entitiesConnection.pageInfo.hasNextPage&&!exact.entitiesConnection.nodes.length,`Exact identity ${s.name}`);
 const entity=id(s.key),block=id(`${s.key}/context`);
 for(const k of[entity,block]){const r:any=await gql('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:k}});check(!r.entity||(!r.entity.name&&!r.entity.types.length),'Unused persistent ID');}
 ops.push(...Ops.entities.update({id:entity,name:s.name,description:s.description}).ops);
 rel(`${s.key}/type`,entity,SystemIds.TYPES_PROPERTY,m.studyType);rel(`${s.key}/source`,entity,source,m.sourceArticleId);rel(`${s.key}/location`,entity,location,m.locationId);rel(`${s.key}/design`,entity,m.designProperty,m.randomizedDesignId);
 const counts=s.key==='study/abc'?`The source describes ${s.initialFamilies} initial families and a study sample of ${s.reportedStudySubjects} subjects (${s.reportedTreatmentSubjects} treatment and ${s.reportedControlSubjects} control). These recruitment and study counts differ from outcome-specific analysis samples. School-age support involved a separate randomization.`:`The source describes ${s.initialFamilies} initial families: ${s.reportedCenterBasedFamilies} assigned to center-based childcare, ${s.reportedFamilyEducationFamilies} to family education and ${s.reportedControlFamilies} to control. The life-cycle economic analysis excludes the home-visiting-only family-education arm.`;
 const markdown=`## Cohorts and study design\n\nBirth cohorts: ${s.birthCohortYears.join('–')}. ${counts}\n\n## Relationship to the economic analysis\n\nThe economic paper pools first-phase ABC and CARE center-based treatment against their randomized controls. It does not constitute a third independent trial. Control children could attend alternative formal childcare, and life-cycle forecasts extend beyond observed follow-up.\n\n[Source: ${m.sourceSection}](${m.sourceUrl})`;
 ops.push(...Ops.entities.update({id:block,values:[{property:SystemIds.MARKDOWN_CONTENT,type:'text',value:markdown}]}).ops);rel(`${s.key}/context/type`,block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);rel(`${s.key}/context`,entity,SystemIds.BLOCKS,block);
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Add distinct ABC and CARE trial contexts for education comparisons',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,checks:checks.length,studies:m.studies.map((s:any)=>({name:s.name,id:registry[s.key]}))}));
