import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,SystemIds,ContentIds,Position,type Op} from '@geoprotocol/geo-sdk';
import {gql} from '../src/functions';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education';
const intake=JSON.parse(readFileSync(`${root}/intake.json`,'utf8'));
const decisions=JSON.parse(readFileSync(`${root}/glossary-identity-decisions.json`,'utf8'));
const expand=process.argv.includes('--expand-reviewed');
const prefix=expand?'glossary-expansion':'glossary';
const reviewedTerms=new Set(['Strong causal evidence','Promising causal/quasi','Mixed/conditional','Limited/descriptive','Not an outcome intervention','Dosage and intensity','Staffing ratio and adult contact','Curriculum content','Pedagogy and instructional model','Technology role','Teacher supports','Accountability and incentives','Governance and choice','Time structure','Early childhood quality','Whole-child supports','Finance and resources','Implementation and fidelity','Counterfactual context','Achievement test scores','Proficiency and cut-score metrics','Reading subskills','Math subskills and course readiness','Academic growth','Coursework and grades','Attendance and engagement','Behavior and climate','SEL and noncognitive outcomes','Grade progression','Postsecondary outcomes','Labor market and adult outcomes','Health, crime, and civic outcomes','Implementation mediators']);
const probe=JSON.parse(readFileSync(`${root}/discovery/education-initiatives-glossary.json`,'utf8'));
if(!probe.complete||probe.nodes.length)throw new Error('Resolve existing glossary dataset candidates');
const path=`${root}/glossary-registry.json`;
const ids:Record<string,string>=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
const id=(key:string)=>ids[key]??(ids[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[];const crosswalk:any[]=[];
function rel(key:string,from:string,type:string,to:string){
  const position=ids[`position/${key}`]??(ids[`position/${key}`]=Position.generate());
  const entityId=id(`edge-entity/${key}`);
  ops.push(...Ops.relations.create({id:id(`edge/${key}`),entityId,fromEntity:from,type,toEntity:to,position}).ops);
  return entityId;
}
const sourceUrl=`https://github.com/athsrueas-geocurator/Education-Initiatives/blob/${intake.report.sourceCommit}/content/glossary.json`;
const dataset=id('dataset');
ops.push(...Ops.entities.update({id:dataset,name:'Education Initiatives glossary',description:expand?'Curated definitions and interpretation guidance from the Education Initiatives source collection. Sections preserve the source organization. Publication is in progress; some entries still require identity resolution.':'Curated definitions and interpretation guidance from the Education Initiatives source collection. Entries retain their source sections; this first publication contains the RCT entry.',values:[{property:ContentIds.WEB_URL_PROPERTY,type:'text',value:sourceUrl}]}).ops);
rel('dataset/type',dataset,SystemIds.TYPES_PROPERTY,'0c4babfb43893486af827341bbf32e09');
const selected=expand?intake.records.filter((r:any)=>r.collection==='glossary'&&reviewedTerms.has(r.name)).map((r:any)=>({sourceTerm:r.name,decision:'create-reviewed-concept'})):decisions.decisions.filter((d:any)=>d.decision==='reuse');
const builtSections=new Set<string>();
for(const decision of selected){
  const rows=intake.records.filter((r:any)=>r.collection==='glossary'&&r.publicationData.term===decision.sourceTerm);
  if(rows.length!==1)throw new Error('Composite entries need a context-preserving mapping');
  const row=rows[0];const data=row.publicationData;
  let entity:any;
  if(decision.decision==='reuse'){
    ({entity}=await gql('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}}}',{id:decision.entityId}));
    if(!entity||!entity.spaceIds.some((s:string)=>decision.sourceSpaces.includes(s)))throw new Error('Reused identity changed');
  }else{
    const filename=data.term.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    for(const pre of ['', 'contains-']){
      const discovery=JSON.parse(readFileSync(`${root}/discovery/${pre}${filename}.json`,'utf8'));
      if(!discovery.complete||discovery.nodes.length||Date.now()-Date.parse(discovery.checkedAt)>30*60*1000)throw new Error(`Refresh identity review: ${data.term}`);
    }
    entity={id:id(`concept/${data.term}`),name:data.term};
  }
  ops.push(...Ops.entities.update({id:entity.id,name:entity.name,description:data.definition}).ops);
  // Add the existing conceptual Topic type only in the destination perspective.
  rel(`entry/${row.sourceKey}/type`,entity.id,SystemIds.TYPES_PROPERTY,data.section==='Evidence signal'?'e0fcc66c9e8643f480802469d8a1a93a':'5ef5a5860f274d8e8f6c59ae5b3e89e2');
  const section=id(`section/${data.section}`);
  if(!builtSections.has(data.section)){
  ops.push(...Ops.entities.update({id:section,name:data.section}).ops);
  rel(`section/${data.section}/type`,section,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);
  rel(`section/${data.section}/source`,section,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
  const attach=rel(`section/${data.section}/attach`,dataset,SystemIds.BLOCKS,section);
  rel(`section/${data.section}/view`,attach,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
  rel(`section/${data.section}/column`,attach,SystemIds.PROPERTIES,SystemIds.DESCRIPTION_PROPERTY);
  builtSections.add(data.section);
  }
  const entry=rel(`entry/${row.sourceKey}/collection`,section,SystemIds.COLLECTION_ITEM_RELATION_TYPE,entity.id);
  ops.push(...Ops.entities.update({id:entry,name:data.term,values:[{property:ContentIds.WEB_URL_PROPERTY,type:'text',value:sourceUrl}]}).ops);
  crosswalk.push({sourceKey:row.sourceKey,sourceTerm:data.term,section:data.section,entityId:entity.id,sectionBlockId:section,entryRelationEntityId:entry,sourceUrl});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:expand?'Add reviewed Education glossary input, outcome and evidence terms':'Add Education glossary with reused randomized-trial concept',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,datasetId:dataset,crosswalk,operationCount:ops.length};
writeFileSync(path,JSON.stringify(ids,null,2)+'\n');
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({checkedAt:new Date().toISOString(),ready:true,opsHash:sha256,checks:[expand?'Reviewed term allowlist; complete exact and substring cross-space searches have no candidates':'Reused RCT identity verified with source spaces','Definition read from pinned intake at runtime','Section preserved as collection block','Source term and URL retained on collection relation entity','No deletes; writes only to destination space']},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
