import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',space='dac259bad48a11adf97fe36857d85206';const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const content=read('impact-reconciled-content'),ids=read('impact-reference-registry').ids,source=read('source/content/initiatives').find((r:any)=>r.id===27);
const p={name:'a126ca530c8e48d5b88882c734c38935',description:'9b1f76ff9711404c861e59dc3fa7d037',url:'412ff593e9154012a43d4c27ec5c68b6',doi:'7cb59354e30c48119e99ff62fcf61646',slug:'b0305ef28312c519d954bc0efe22f013',types:'8f151ba4de204e3c9cb499ddf96f48f1',authors:'91a9e2f6e51a48f7997661de8561b690',sources:'49c5d5e1679a4dbdbfd33f618f227c94'};
const rows:any[]=[];const checks:any[]=[];
for(const key of ['article','initiative',...content.article.authors.map((a:string)=>`author/${a}`)]){
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:30,filter:{spaceId:{is:$space}}){nodes{id typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:ids[key],space}});
 if(!d.entity||d.entity.values.pageInfo.hasNextPage||d.entity.relations.pageInfo.hasNextPage)throw Error('Incomplete current verification');rows.push({key,id:ids[key],...d.entity});
 const expected=key==='article'?{name:content.article.name,description:content.article.description,url:content.article.url,doi:content.article.doi}:key==='initiative'?{name:content.initiative.name,description:content.initiative.description,url:content.initiative.url,slug:source.slug}:{name:key.slice(7)};
 for(const [field,value] of Object.entries(expected))checks.push({key,field,pass:d.entity.values.nodes.some((v:any)=>v.propertyId===p[field as keyof typeof p]&&v.text===value)});
 const type=key==='article'?'a2a5ed0cacef46b1835de457956ce915':key==='initiative'?'d272f19cef87485fb83e26fb68957395':'7ed45f2bc48b419e8e4664d5ff680b0d';checks.push({key,field:'type',pass:d.entity.relations.nodes.some((r:any)=>r.typeId===p.types&&r.toEntityId===type)});
}
for(const author of content.article.authors)checks.push({field:`author/${author}`,pass:rows.find(r=>r.key==='article').relations.nodes.some((r:any)=>r.typeId===p.authors&&r.toEntityId===ids[`author/${author}`])});
checks.push({field:'program/source',pass:rows.find(r=>r.key==='initiative').relations.nodes.some((r:any)=>r.typeId===p.sources&&r.toEntityId===ids.article)});
const report={checkedAt:new Date().toISOString(),passed:checks.every(c=>c.pass),checks,rows};writeFileSync(`${root}/impact-current-verification.json`,JSON.stringify(report,null,2)+'\n');if(!report.passed)throw Error('Current reference verification failed');
const ledger=read('original-field-reconciliation'),crosswalk=read('source-to-geo-crosswalk');
for(const [key,entityId,fields] of [['initiatives:27',ids.initiative,{id:null,name:p.name,slug:p.slug}],['sources:src-026',ids.article,{id:null,title:p.name,url:p.url,authors:p.authors}]] as const){
 const row=ledger.rows.find((r:any)=>r.migrationKey===key);row.candidateGeoIds=[entityId];
 for(const [name,propertyId] of Object.entries(fields)){const f=row.fields.find((f:any)=>f.sourceField===name);f.status='existing-and-readable';f.verifiedGeoMappings=[{entityId,spaceId:space,propertyId,identityOnly:propertyId===null,evidence:'impact-current-verification.json',checkedAt:report.checkedAt,...(name==='authors'?{targetEntityIds:content.article.authors.map((a:string)=>ids[`author/${a}`])}:{})}];f.reviewReason='Verified corrected DC IMPACT identity/reference; original w19403 citation and placeholder metadata are superseded by w19529. Original source snapshot preserved.';}
 const old=crosswalk.rows.find((r:any)=>r.migrationKey===key);old.candidateGeoIds=[entityId];old.candidateSpaces=[space];old.decision='created-target-space';old.decisionRationale='Complete focused cross-space discovery found no equivalent; sourced DC IMPACT program and corrected w19529 reference published and verified.';old.lastCheckedAt=report.checkedAt;
}
ledger.checkedAt=report.checkedAt;writeFileSync(`${root}/original-field-reconciliation.json`,JSON.stringify(ledger,null,2)+'\n');writeFileSync(`${root}/source-to-geo-crosswalk.json`,JSON.stringify(crosswalk,null,2)+'\n');console.log(JSON.stringify({passed:true,checks:checks.length,verifiedFieldsAdded:7}));
