import {readFileSync,writeFileSync} from 'node:fs';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const verified=read('original-questions-query-verification'),indexed=read('original-questions-index-verification'),batch=read('original-questions-batch'),ledger=read('original-field-reconciliation'),crosswalk=read('source-to-geo-crosswalk');
if(!verified.passed||!indexed.passed||verified.questions!==21)throw Error('Verification required');
for(const q of batch.crosswalk){
 const key=`dichotomies:${q.slug}`,row=ledger.rows.find((r:any)=>r.migrationKey===key),c=crosswalk.rows.find((r:any)=>r.migrationKey===key);if(!row||!c)throw Error('Missing original row');
 for(const [field,property,reason] of [['slug','b0305ef28312c519d954bc0efe22f013','Exact original route'],['title','9b1f76ff9711404c861e59dc3fa7d037','Original framing preserved with terminal period'],['betterQuestion','a126ca530c8e48d5b88882c734c38935','Exact original question as Name'],['dek','a126ca530c8e48d5b88882c734c38935','Original dek exactly duplicates betterQuestion; one stored value preserves both']]){
  const f=row.fields.find((f:any)=>f.sourceField===field);f.status='existing-and-readable';f.reviewReason=reason;f.verifiedGeoMappings=[{entityId:q.entityId,spaceId:verified.space,propertyId:property,evidence:'original-questions-query-verification.json',checkedAt:verified.checkedAt}];
 }
 row.candidateGeoIds=[q.entityId];row.fields.find((f:any)=>f.sourceField==='keyInitiativeSlugs').reviewReason='Original converter includes keyword matching and first-initiative fallback; every proposed relationship needs relevance review.';
 for(const f of row.fields.filter((f:any)=>['commonMisreadings','whatWouldChangeOurMind'].includes(f.sourceField)))f.reviewReason='Converter-generated template, not selected user editorial copy or extracted finding; held for review.';
 c.candidateGeoIds=[q.entityId];c.candidateSpaces=[verified.space];c.decision='published';c.decisionRationale='Question text/framing/route/provenance published and independently verified; remaining source fields and links held, not full row completion.';c.lastCheckedAt=verified.checkedAt;
}
ledger.checkedAt=verified.checkedAt;writeFileSync(`${root}/original-field-reconciliation.json`,JSON.stringify(ledger,null,2)+'\n');writeFileSync(`${root}/source-to-geo-crosswalk.json`,JSON.stringify(crosswalk,null,2)+'\n');console.log(JSON.stringify({verifiedFields:84,totalVerified:ledger.rows.flatMap((r:any)=>r.fields).filter((f:any)=>f.status==='existing-and-readable').length}));
