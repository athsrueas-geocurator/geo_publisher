export function summarizeLedger(rows:any[]) {
  const groups:Record<string,{records:number;fields:number;statuses:Record<string,number>}>= {};
  for(const row of rows){if(typeof row.sourcePath!=='string'||!Array.isArray(row.fields))throw Error('Malformed reconciliation row');const group=groups[row.sourcePath]??={records:0,fields:0,statuses:{}};group.records++;for(const field of row.fields){if(typeof field.status!=='string')throw Error('Missing field disposition');group.fields++;group.statuses[field.status]=(group.statuses[field.status]??0)+1;}}
  return groups;
}
export function journalStages(j:any){return {submissionConfirmed:j.main?.state==='confirmed'&&j.main?.receipt?.status==='success',executionRecorded:j.chainVerification?.information?.[0]===true,bountyTransactionConfirmed:j.bounty?.state==='confirmed'&&j.bounty?.receipt?.status==='success'};}
