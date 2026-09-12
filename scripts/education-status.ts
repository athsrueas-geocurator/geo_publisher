import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {hash} from '../src/education-collection';
import {summarizeLedger,journalStages} from '../src/education-status';
const root='data/education',errors:string[]=[],rows:any[]=[];
for(const name of readdirSync(root).filter(n=>n.endsWith('-publication.json'))){
  try { const j=JSON.parse(readFileSync(`${root}/${name}`,'utf8')); const batchPath=`${root}/${name.replace('-publication.json','-batch.json')}`; let integrity='batch-missing'; let b:any=null;
    if(existsSync(batchPath)){b=JSON.parse(readFileSync(batchPath,'utf8'));integrity=b.sha256===j.opsHash&&hash(readFileSync(b.opsPath))===j.opsHash?'matching':'mismatch';if(integrity==='mismatch')errors.push(`${name}: integrity mismatch`);}else errors.push(`${name}: batch missing`);
    const collectionV1=b?.publisherVersion==='collection-v1'; const indexPath=`${root}/${name.replace('-publication.json','-index-verification.json')}`; let indexEvidence:any=null;
    if(existsSync(indexPath)){const v=JSON.parse(readFileSync(indexPath,'utf8'));indexEvidence={checkedAt:v.checkedAt??null,scope:v.scope??null,checks:Array.isArray(v.checks)?v.checks.length:null,allChecksPassed:Array.isArray(v.checks)&&v.checks.length>0&&v.checks.every((c:any)=>c.pass===true),hashBound:v.opsHash===j.opsHash};}
    if(collectionV1&&(!indexEvidence||!indexEvidence.allChecksPassed||!indexEvidence.hashBound))errors.push(`${name}: collection-v1 index evidence missing, failed or unbound`);
    rows.push({journal:name,proposalId:(j.proposalId??j.main?.prepared?.proposalId??'').replace(/^0x/,''),...journalStages(j),integrity,indexEvidence,workflow:collectionV1?'collection-v1':'legacy'});
  } catch { errors.push(`${name}: unreadable journal, batch, ops or verification`); }
}
const ledger=JSON.parse(readFileSync(`${root}/original-field-reconciliation.json`,'utf8'));
const preparedOnly=readdirSync(root).filter(n=>n.endsWith('-batch.json')).map(name=>{const prefix=name.slice(0,-'-batch.json'.length);const exact=`${prefix}-publication.json`;if(existsSync(`${root}/${exact}`))return null;const superseded=readdirSync(root).filter(candidate=>candidate.endsWith('-publication.json')&&candidate.startsWith(`${prefix}-`)).map(candidate=>candidate);return {batch:name,supersededBy:superseded};}).filter(Boolean);
const queueCandidates=readFileSync('publishing_queue.md','utf8').split(/\r?\n/).flatMap((line,index)=>line.includes('[ ]')?[...line.matchAll(/\b[a-f0-9]{32}\b/g)].filter(m=>rows.some(r=>r.proposalId===m[0]&&r.executionRecorded)).map(m=>({line:index+1,proposalId:m[0],reason:'Unchecked item references a locally recorded executed proposal; inspect remaining acceptance conditions, do not auto-complete.'})):[]);
console.log(JSON.stringify({checkedAt:new Date().toISOString(),scope:'Local evidence inventory; no fresh chain/index/browser audit, no study count or overall completion percentage',ledger:{checkedAt:ledger.checkedAt,groups:summarizeLedger(ledger.rows)},journals:{parsed:rows.length,submissionConfirmed:rows.filter(r=>r.submissionConfirmed).length,executionRecorded:rows.filter(r=>r.executionRecorded).length,bountyTransactionConfirmed:rows.filter(r=>r.bountyTransactionConfirmed).length},preparedOnly,supersededPrepared:preparedOnly.filter((r:any)=>r.supersededBy.length),unresolvedPrepared:preparedOnly.filter((r:any)=>!r.supersededBy.length),queueCandidates,errors,rows},null,2));
if(errors.length)process.exitCode=1;
