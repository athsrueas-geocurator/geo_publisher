import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
const root='data/education'; const rows=[]; const errors=[];
for(const name of readdirSync(root).filter(n=>n.endsWith('-publication.json'))){
  try { const j=JSON.parse(readFileSync(`${root}/${name}`,'utf8')); rows.push({journal:name,spaceId:j.spaceId,bountyId:j.bountyId,mainConfirmed:j.main?.state==='confirmed',executionRecorded:j.chainVerification?.information?.[0]===true,bountyConfirmed:j.bounty?.state==='confirmed',bountyTx:j.bounty?.hash??null,proposalId:j.proposalId??j.main?.prepared?.proposalId??null}); } catch { errors.push(name); }
}
const report={checkedAt:new Date().toISOString(),scope:'Local journal evidence only; not a fresh chain or indexed bounty audit',count:rows.length,submittedConfirmed:rows.filter(r=>r.mainConfirmed).length,executed:rows.filter(r=>r.executionRecorded).length,bountyConfirmed:rows.filter(r=>r.bountyConfirmed).length,missingBounty:rows.filter(r=>r.mainConfirmed&&!r.bountyConfirmed).map(r=>r.journal),errors,rows};
writeFileSync(`${root}/education-bounty-coverage.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,executed:report.executed,bountyConfirmed:report.bountyConfirmed,missingBounty:report.missingBounty},null,2));
if(errors.length) { console.error('Unreadable journals:',errors); process.exitCode=1; }
