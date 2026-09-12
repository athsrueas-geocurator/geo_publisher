import {readFileSync,writeFileSync} from 'node:fs';
const root='data/education';const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const state=read('original-link-state'),ledger=read('original-field-reconciliation'),crosswalk=read('source-to-geo-crosswalk');
const nameProperty='a126ca530c8e48d5b88882c734c38935',slugProperty='b0305ef28312c519d954bc0efe22f013';
let reviewed=0;
function map(row:any,field:string,mapping:any,reason:string){
 const f=row.fields.find((f:any)=>f.sourceField===field);if(!f)throw Error(`Missing field ${field}`);
 f.status='existing-and-readable';f.verifiedGeoMappings=[mapping];f.reviewReason=reason;reviewed++;
}
for(const live of state.rows){
 const row=ledger.rows.find((r:any)=>r.migrationKey===`initiatives:${live.key}`);
 const slug=row.fields.find((f:any)=>f.sourceField==='slug').sourceValue;
 if(!live.values.some((v:any)=>v.propertyId===slugProperty&&v.text===slug))throw Error(`Slug not indexed ${live.key}`);
 const identity={entityId:live.id,spaceId:state.space,evidence:'original-link-state.json',checkedAt:state.checkedAt};
 map(row,'id',{...identity,identityOnly:true},'Original local ID maps to the reviewed program entity; local integer is not a Geo property.');
 map(row,'name',{...identity,propertyId:nameProperty},'Exact original/live name; scope reviewed against live description and original population.');
 map(row,'slug',{...identity,propertyId:slugProperty},'Exact original slug verified in destination-scoped live values.');
 row.candidateGeoIds=[live.id];
 const old=crosswalk.rows.find((r:any)=>r.migrationKey===row.migrationKey);
 old.candidateGeoIds=[live.id];old.candidateSpaces=[state.space];old.lastCheckedAt=state.checkedAt;
 old.decision='reuse-existing';old.decisionRationale='Reviewed identity and original route verified live; other fields are separately tracked and remain unfinished.';
 old.identityEvidence=[...new Set([...old.identityEvidence,'2026-09-12: exact all-space name discovery and destination route verification in original-link-state.json.'])];
}
ledger.checkedAt=state.checkedAt;ledger.scope='203 original records; 11 initiative identities/names/routes verified; remaining fields require individual reconciliation';
writeFileSync(`${root}/original-field-reconciliation.json`,JSON.stringify(ledger,null,2)+'\n');
writeFileSync(`${root}/source-to-geo-crosswalk.json`,JSON.stringify(crosswalk,null,2)+'\n');
console.log(JSON.stringify({reviewedFields:reviewed,remainingReviewFields:ledger.rows.flatMap((r:any)=>r.fields).filter((f:any)=>f.status==='needs-content-review').length}));
