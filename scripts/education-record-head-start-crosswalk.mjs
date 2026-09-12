import {readFileSync,writeFileSync} from 'node:fs';
const path='data/education/source-to-geo-crosswalk.json';
const crosswalk=JSON.parse(readFileSync(path,'utf8'));
const batch=JSON.parse(readFileSync('data/education/head-start-batch.json','utf8'));
const journal=JSON.parse(readFileSync('data/education/head-start-publication.json','utf8'));
const updates=new Map([
 ['initiatives:43',{id:batch.entities.initiative,kind:'Initiative',rationale:'No exact Head Start entity existed across all spaces. Created one source-linked Initiative in Education datasets after complete exact-name discovery.'}],
 ['sources:src-071',{id:batch.entities.article,kind:'Article',rationale:'No exact Head Start Impact Study: Final Report Article or URL candidate existed across all spaces. Created the source Article in Education datasets and linked its source-backed Claims.'}]
]);
for(const row of crosswalk.rows){
 const update=updates.get(row.migrationKey);if(!update)continue;
 row.candidateGeoIds=[update.id];row.candidateSpaces=[batch.spaceId];row.identityEvidence=[`Complete all-space exact-name discovery had zero candidates before creation.`, `Published proposal ${journal.proposalId} executed; bounty link is indexed.`];
 row.targetSpaceChanges=[`Created ${update.kind} ${update.id} in Education datasets.`];row.decision='created-target-space';row.decisionRationale=update.rationale;row.lastCheckedAt=new Date().toISOString();
}
crosswalk.updatedAt=new Date().toISOString();
crosswalk.publicationReady=false;
writeFileSync(path,JSON.stringify(crosswalk,null,2)+'\n');
console.log(JSON.stringify({updated:['initiatives:43','sources:src-071'],proposalId:journal.proposalId},null,2));
