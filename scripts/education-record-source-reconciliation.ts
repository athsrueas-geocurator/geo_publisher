import {readFileSync,writeFileSync} from 'node:fs';
const root='data/education';const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const audit=read('original-source-identity-audit'),ledger=read('original-field-reconciliation'),crosswalk=read('source-to-geo-crosswalk');
const accepted=['src-003','src-033','src-060','src-068','src-071','src-080','src-088','src-093'];
const reviews:any={
 'src-026':'Original NBER w19403 resolves to Exporting Liquidity: Branch Banking and Financial Integration, unrelated to the supplied teacher-evaluation finding. NBER w19529 is a relevant replacement candidate, not an automatic correction to every original assertion.',
 'src-034':'Original NBER w16832 resolves to Reestablishing the Income-Democracy Nexus, unrelated to charter schools. NBER w17332 is a relevant replacement candidate with Massachusetts-specific scope, not evidence for every imported national charter assertion.',
 'src-045':'Existing Article combines NBER working-paper PDF w28756 with QJE DOI 10.1093/qje/qjac036. Reconcile publication-version identity and extraction provenance before mapping the original 2021 working paper.',
 'src-061':'Original 2016 NBER working paper matches the title of the existing 2017 journal Article. Preserve version distinction; title match alone is insufficient.',
 'src-066':'Original 2021 NBER working paper matches the title of an existing Article using a 2022 author-hosted final journal manuscript. Verify version before mapping.',
 'src-070':'Original 2021 journal article DOI 10.1080/19345747.2020.1862374 matches the title of the existing 2019 AIR report ED602451. These are publication versions, not an automatic same-version identity match.',
 'src-096':'Imported DOI 10.1257/app.20180293 conflicts with the publisher-verified DOI 10.3102/0002831216677002 for the stated 2017 Dee/Penner paper. Existing Geo Article already has the correct DOI; do not overwrite it.'
};
for(const key of accepted){
 const original=audit.rows.find((r:any)=>r.key===key);if(original.candidates.length!==1)throw Error('Ambiguous identity');
 const c=original.candidates[0];if(!c.signals.some((s:string)=>s==='exact-url'||s.startsWith('doi:')||s.startsWith('nber:')))throw Error('No identifier match');
 const row=ledger.rows.find((r:any)=>r.migrationKey===`sources:${key}`);row.candidateGeoIds=[c.id];
 for(const fieldName of ['id','title','url']){
  const field=row.fields.find((f:any)=>f.sourceField===fieldName);field.status='existing-and-readable';
  field.verifiedGeoMappings=[{entityId:c.id,spaceId:audit.space,...(fieldName==='id'?{identityOnly:true}:{propertyId:fieldName==='title'?'a126ca530c8e48d5b88882c734c38935':'412ff593e9154012a43d4c27ec5c68b6'}),identifierEvidence:c.identifiers,evidence:'original-source-identity-audit.json',checkedAt:audit.checkedAt}];
  field.reviewReason=fieldName==='title'?'Identity verified by URL/DOI/report number; use the existing canonical Article title instead of any URL-derived placeholder.':fieldName==='url'?'Canonical Article URL and matching publication identifier verified; DOI URLs may resolve to the canonical accessible paper URL.':'Verified publication identity; local source ID is retained in this crosswalk, not as a new Article.';
 }
 const old=crosswalk.rows.find((r:any)=>r.migrationKey===row.migrationKey);old.candidateGeoIds=[c.id];old.candidateSpaces=[audit.space];old.decision='reuse-existing';old.lastCheckedAt=audit.checkedAt;old.decisionRationale='Publication identifiers and canonical bibliography fields verified; remaining source content fields require individual review.';
 old.identityEvidence=[...new Set([...(old.identityEvidence??[]),'2026-09-12: original-source-identity-audit.json confirms URL/DOI/report-number identity against current scoped Article facts.'])];
}
for(const [key,reason] of Object.entries(reviews)){
 const row=ledger.rows.find((r:any)=>r.migrationKey===`sources:${key}`);for(const f of row.fields)if(f.status==='needs-content-review')f.reviewReason=reason;
}
ledger.checkedAt=audit.checkedAt;ledger.scope='203 original records; individually verified initiative/category/bibliography mappings; remaining fields and publication-version conflicts explicit';
writeFileSync(`${root}/original-field-reconciliation.json`,JSON.stringify(ledger,null,2)+'\n');writeFileSync(`${root}/source-to-geo-crosswalk.json`,JSON.stringify(crosswalk,null,2)+'\n');
writeFileSync(`${root}/original-source-reconciliation-decisions.json`,JSON.stringify({checkedAt:audit.checkedAt,accepted,review:reviews,pinnedSourceModified:false,scope:'Identity, canonical title and URL only; no source findings, assessments or authorship certified'},null,2)+'\n');
console.log(JSON.stringify({sourceRowsVerified:accepted.length,sourceFieldsVerified:accepted.length*3,reviewCases:Object.keys(reviews).length,verifiedTotal:ledger.rows.flatMap((r:any)=>r.fields).filter((f:any)=>f.status==='existing-and-readable').length}));
