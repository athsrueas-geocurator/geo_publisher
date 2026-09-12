import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const record=read('intake').records.find((r:any)=>r.collection==='initiatives'&&r.sourceKey==='12');
const registry=read('reading-first-registry');
const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){id name values(first:20,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:30,filter:{spaceId:{is:$space}}){nodes{id entityId typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:registry.program,space:target.spaceId}});
if(data.entity.values.pageInfo.hasNextPage||data.entity.relations.pageInfo.hasNextPage)throw new Error('Incomplete live program read');
const notes:Record<string,string>={
 slug:'Published Route slug preserves reading-first on the existing program; verify the live value.',
 id:'Source record number retained in imported-context block; a dedicated typed import-key property remains pending.',
 name:'Program identity and published Name verified below.',
 years:'Imported 2002-2008 span needs historical scope review; it is not a verified exact start/end date.',
 category:'Literacy category needs cross-space concept/alias resolution and typed relation mapping.',
 theoryOfAction:'Published in program context prose; no dedicated mechanism relation yet.',
 inputVariablesChanged:'Published in context and outcome records; intervention components still need structured concepts.',
 targetPopulation:'Children and intended K-3 relations published; participating-school eligibility remains context prose.',
 evaluationDesigns:'Study context describes mixed assignment design; implementation evaluation is a separate source, not interchangeable with impact study.',
 methodTags:'RCT and regression discontinuity need explicit source-to-study method relations; no claim that the whole study is an RCT.',
 evidenceStrength:'Imported mixed-conditional label is an editorial classification, not a numeric evidence rating; rubric and mapping pending.',
 outputsMeasured:'Selected outcomes exist on contrast records; shared measurement-concept mapping remains unfinished.',
 normalizationIssues:'Published context distinguishes funding evaluation from National Reading Panel research.',
 oneLineFinding:'Source-backed effects and uncertainty published; imported summary not separately preserved as a reviewed claim.',
 sourceIds:'Verify both intended source references on program; background research is distinct from outcome evidence.',
 tags:'Program name, NCLB and literacy have different identities; taxonomy/legislation links remain unfinished.',
 relatedDichotomySlugs:'Composite debate identity and backlink mapping remain unfinished.'
};
const unknown=Object.keys(record.publicationData).filter(k=>!(k in notes));if(unknown.length)throw new Error(`Unreviewed source fields: ${unknown.join(', ')}`);
const rels=data.entity.relations.nodes;
let importedMarkdown:string|undefined,importedContextId:string|undefined;
if(existsSync(`${root}/reading-first-import-context-registry.json`)){
 importedContextId=read('reading-first-import-context-registry').block;
 const block=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:importedContextId,space:target.spaceId}});
 if(block.entity?.values.pageInfo.hasNextPage)throw new Error('Incomplete imported context');
 if(rels.some((r:any)=>r.typeId==='beaba5cba67741a8b35377030613fc70'&&r.toEntityId===importedContextId))importedMarkdown=block.entity?.values.nodes.find((v:any)=>v.propertyId==='e3e363d1dd294ccb8e6ff3b76d99bc33')?.text;
}
const has=(type:string,to:string)=>rels.some((r:any)=>r.typeId===type&&r.toEntityId===to);
const checks={publishedName:data.entity.values.nodes.some((v:any)=>v.propertyId==='a126ca530c8e48d5b88882c734c38935'&&v.text===record.name),impactSource:has('49c5d5e1679a4dbdbfd33f618f227c94',registry.paper),backgroundSource:has('49c5d5e1679a4dbdbfd33f618f227c94',registry['source/src-014']),study:has('dfa6aebe1ca94bf29faccc4cc7afb24c',registry.study),dataset:has('dfa6aebe1ca94bf29faccc4cc7afb24c',registry.dataset),administrator:has('d1c6034425684b4caaf2570bee562802',registry['agency/oese'])};
const slugComplete=data.entity.values.nodes.some((v:any)=>v.propertyId==='b0305ef28312c519d954bc0efe22f013'&&v.text===record.publicationData.slug);
const report={checkedAt:new Date().toISOString(),sourceKey:'initiatives/12',programId:registry.program,sourcePath:record.sourcePath,sourceFields:Object.entries(record.publicationData).map(([field,sourceValue])=>({field,sourceValue,mapping:notes[field],preservedInImportedContext:!!importedMarkdown?.includes(Array.isArray(sourceValue)?sourceValue.join('; '):String(sourceValue)),complete:field==='slug'?slugComplete:field==='name'?checks.publishedName:field==='sourceIds'?checks.impactSource&&checks.backgroundSource:false})),importedContextId,liveChecks:{...checks,slug:slugComplete},liveEvidence:data.entity,complete:false,next:'Complete structured component/method/editorial-comparison mappings; source preservation alone does not complete queryable semantic migration.'};
writeFileSync(`${root}/reading-first-import-reconciliation.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({fields:report.sourceFields.length,preservedInContext:report.sourceFields.filter(f=>f.preservedInImportedContext).length,liveChecks:report.liveChecks,complete:false,next:report.next}));
if(Object.values(report.liveChecks).some(x=>!x)||report.sourceFields.some(f=>!f.preservedInImportedContext))process.exitCode=1;
