import {readFileSync,writeFileSync} from 'node:fs';
import {decodeEditAuto,encodeEdit} from '@geoprotocol/grc-20';
import {educationBountyLinkOps} from '../src/education-bounty';
const path=process.argv[2];if(!path)throw new Error('Supply publication journal');
const journal=JSON.parse(readFileSync(path,'utf8'));
const cid=journal.bounty.prepared.cid;
if(!/^ipfs:\/\/Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid))throw new Error('Unexpected CID');
const report:any={checkedAt:new Date().toISOString(),cid,proposalId:journal.proposalId,gateway:'https://gateway.pinata.cloud/ipfs/',scope:'Read-only retrieval and comparison of the already-submitted bounty payload'};
const serial=(v:any):any=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:String(v)}:Array.isArray(v)?v.map(serial):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,serial(x)])):v;
try{
 const res=await fetch(report.gateway+cid.slice(7),{signal:AbortSignal.timeout(25000)});
 report.httpStatus=res.status;if(!res.ok)throw new Error(`Gateway HTTP ${res.status}`);
 const bytes=new Uint8Array(await res.arrayBuffer());report.byteLength=bytes.length;
 const edit=await decodeEditAuto(bytes);report.edit=serial(edit);
 const nameOp:any=edit.ops.find((op:any)=>op.type==='updateEntity');
 const proposalName=nameOp?.set?.find((s:any)=>s.value.type==='text')?.value.value;
 if(typeof proposalName!=='string')throw new Error('Missing proposal name');
 const expected=educationBountyLinkOps({proposalId:journal.proposalId,proposalName,...journal.linkIds});
 // Compare decoded encodings: the codec materializes omitted empty fields.
 const expectedDecoded=await decodeEditAuto(encodeEdit({...edit,ops:expected}));
 report.opsMatch=JSON.stringify(serial(edit.ops))===JSON.stringify(serial(expectedDecoded.ops));
 report.editIdMatches=Buffer.from(edit.id).toString('hex')===journal.bounty.prepared.editId;
 report.authorMatches=edit.authors.length===1&&Buffer.from(edit.authors[0]!).toString('hex')===journal.bounty.prepared.spaceId;
}catch(error){report.error=String(error);}
writeFileSync(path.replace('-publication.json','-bounty-payload-inspection.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,edit:undefined}));
if(report.error||!report.opsMatch||!report.editIdMatches||!report.authorMatches)process.exitCode=1;
