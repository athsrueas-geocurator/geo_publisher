import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createPublicClient, http } from 'viem';
import { GeoTestnetConfig, type Op } from '@geoprotocol/geo-sdk';
import { publishOps, gql, type PublishOptions } from '../src/functions';
import { educationBountyLinkOps, EDUCATION_PUBLICATION } from '../src/education-bounty';
import { validateEducationDoiLinks } from '../src/education-doi';
import { validateEducationTextEncoding } from '../src/education-text-encoding';
import { validateEducationReadiness } from '../src/education-readiness';
import { validateReviewBinding } from '../src/education-review';

const batchArg=process.argv.indexOf('--batch');
const batch=JSON.parse(readFileSync(batchArg>=0?process.argv[batchArg+1]!:'data/education/saga-batch.json','utf8'));
const path=batch.journalPath??'data/education/saga-publication.json';
const bytes=readFileSync(batch.opsPath,'utf8');
if(createHash('sha256').update(bytes).digest('hex')!==batch.sha256)throw new Error('Operation hash mismatch');
if(batch.spaceId!==EDUCATION_PUBLICATION.spaceId||batch.bounty!==EDUCATION_PUBLICATION.bountyId)throw new Error('Unexpected target or bounty');
const ops=JSON.parse(bytes,(_key,v)=>v?.$bytes?new Uint8Array(Buffer.from(v.$bytes,'hex')):v?.$bigint?BigInt(v.$bigint):v) as Op[];
// Validate reviewed inputs before any new signing; historical receipt reconciliation stays possible.
const existingJournal=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):null;
if(batch.publisherVersion==='collection-v1')validateReviewBinding(batch);
if(!process.argv.includes('--publish')){
  if(!existsSync(path)){validateEducationDoiLinks(ops);validateEducationTextEncoding(ops);}
  const validation=JSON.parse(readFileSync(batch.validationPath??'data/education/saga-validation.json','utf8'));
  const preflight=JSON.parse(readFileSync('data/education/preflight.json','utf8'));
  validateEducationReadiness(batch,validation,preflight);
  console.log(JSON.stringify({mode:'dry-run',...batch,verificationScope:'Mechanical readiness only; not source accuracy, identity equivalence, execution, indexing or rendered verification.'},null,2));
}else{
  const journal:any=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{opsHash:batch.sha256,spaceId:batch.spaceId,bountyId:batch.bounty,createdAt:new Date().toISOString(),main:{state:'ready'},bounty:{state:'ready'},linkIds:Object.fromEntries(['typeRelationId','submissionRelationId','typeRelationEntityId','submissionRelationEntityId'].map(k=>[k,randomUUID().replaceAll('-','')]))};
  const save=()=>writeFileSync(path,JSON.stringify(journal,null,2)+'\n');
  const rpc=createPublicClient({transport:http(GeoTestnetConfig.chain!.rpcUrl!)});
  async function confirm(part:any){
    if(part.state==='confirmed')return;
    if(!part.hash)throw new Error('Submission state uncertain: reconcile the existing proposal before retrying');
    const receipt=await rpc.waitForTransactionReceipt({hash:part.hash,timeout:45000});
    part.receipt={status:receipt.status,blockNumber:String(receipt.blockNumber)};
    part.state=receipt.status==='success'?'confirmed':'reverted';save();
    if(part.state!=='confirmed')throw new Error('Transaction reverted');
  }
  function callbacks(part:any):PublishOptions{
    return {
      proposalOnly:true,
      onPrepared:details=>{
        if(details.to.toLowerCase()!==GeoTestnetConfig.contracts!.SPACE_REGISTRY_ADDRESS!.toLowerCase())throw new Error('Unexpected registry transaction destination');
        part.prepared=details;part.state='prepared';save();
      },
      onSubmitting:()=>{part.state='submitting';save();},
      onSubmitted:hash=>{part.hash=hash;part.state='submitted';save();},
    };
  }
  try{
    if(journal.opsHash!==batch.sha256)throw new Error('Journal belongs to different operations');
    const validation=JSON.parse(readFileSync(batch.validationPath??'data/education/saga-validation.json','utf8'));
    const preflight=JSON.parse(readFileSync('data/education/preflight.json','utf8'));
    const personalSpace=validateEducationReadiness(batch,validation,preflight);
    save();
    if(journal.main.state==='ready'){
      validateEducationDoiLinks(ops);
      validateEducationTextEncoding(ops);
      await publishOps(ops,batch.name,batch.spaceId,callbacks(journal.main));
    }
    await confirm(journal.main);
    const proposalId=journal.main.prepared.proposalId.replace(/^0x/,'');
    if(journal.bounty.state==='ready'){
      const linkOps=educationBountyLinkOps({proposalId,proposalName:batch.name,...journal.linkIds});
      await publishOps(linkOps,`Bounty link: ${batch.name}`,personalSpace,callbacks(journal.bounty));
    }
    await confirm(journal.bounty);
    journal.proposalId=proposalId;journal.status='submitted; governance execution and indexing verification pending';save();
    console.log(JSON.stringify({proposalId,proposalTransaction:journal.main.hash,bountyTransaction:journal.bounty.hash,status:journal.status},null,2));
  }catch(error:any){
    journal.lastFailure={at:new Date().toISOString(),name:error?.name??'Error'};save();
    const secret=process.env.PK_SW??'';
    let message=String(error?.message??'Publication failed');
    if(secret)message=message.replaceAll(secret,'[redacted]').replaceAll(secret.replace(/^0x/,''),'[redacted]');
    message=message.replace(/(?:0x)?[a-fA-F0-9]{64}/g,'[redacted identifier]');
    console.error(message.slice(0,1800));process.exitCode=1;
  }
}
