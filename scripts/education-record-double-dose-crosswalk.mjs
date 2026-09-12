import {readFileSync,writeFileSync} from 'node:fs';
const path='data/education/source-to-geo-crosswalk.json';
const crosswalk=JSON.parse(readFileSync(path,'utf8'));
const batch=JSON.parse(readFileSync('data/education/double-dose-algebra-batch.json','utf8'));
const journal=JSON.parse(readFileSync('data/education/double-dose-algebra-publication.json','utf8'));
const row=crosswalk.rows.find(r=>r.migrationKey==='initiatives:66');
if(!row)throw Error('Missing initiative 66 crosswalk row');
row.candidateGeoIds=[batch.entities.initiative];row.candidateSpaces=[batch.spaceId];row.identityEvidence=['Complete all-space exact Initiative-name and substring family searches found no candidate.',`Published proposal ${journal.proposalId} executed; bounty link is indexed.`];row.targetSpaceChanges=[`Created Initiative ${batch.entities.initiative} in Education datasets.`];row.decision='created-target-space';row.decisionRationale='No Chicago double-dose algebra Initiative existed across Geo. Created one with its source, location, threshold and implementation boundaries.';row.lastCheckedAt=new Date().toISOString();crosswalk.updatedAt=new Date().toISOString();writeFileSync(path,JSON.stringify(crosswalk,null,2)+'\n');console.log(JSON.stringify({updated:row.migrationKey,id:batch.entities.initiative,proposalId:journal.proposalId},null,2));
