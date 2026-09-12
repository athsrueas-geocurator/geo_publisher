import{readFileSync,writeFileSync,existsSync}from'node:fs';
import{createHash}from'node:crypto';
import{isDeepStrictEqual}from'node:util';
import{createPublicClient,http}from'viem';
import{GeoTestnetConfig}from'@geoprotocol/geo-sdk';
import{publishOps}from'../src/functions';
import{geoGraphqlRequest as gql}from'../src/geo-api-client';
import{educationBountyLinkOps}from'../src/education-bounty';
const root='data/education',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const original=read('reading-first-audience-publication'),batch=read('reading-first-audience-batch'),evidence=read('reading-first-audience-bounty-chain-recheck');
if(original.proposalId!=='ab315d843a934eb582081ae23df8b68f'||!evidence.registryEvent.cidMatchesPrepared||!evidence.registryEvent.spaceTopicsMatch)throw Error('Verified recovery evidence required');
const ops=educationBountyLinkOps({proposalId:original.proposalId,proposalName:batch.name,...original.linkIds});
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v);
const expected=read('reading-first-audience-bounty-payload-inspection').edit.ops;
if(!isDeepStrictEqual(JSON.parse(bytes),expected))throw Error('Recovery differs from inspected original operations');
const path=`${root}/reading-first-audience-bounty-recovery.json`,opsHash=createHash('sha256').update(bytes).digest('hex');
const j:any=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{createdAt:new Date().toISOString(),originalTransaction:original.bounty.hash,proposalId:original.proposalId,spaceId:original.bounty.prepared.spaceId,opsHash,state:'ready'};
if(j.opsHash!==opsHash)throw Error('Recovery payload changed');
const save=()=>writeFileSync(path,JSON.stringify(j,null,2)+'\n');
const rpc=createPublicClient({transport:http(GeoTestnetConfig.chain!.rpcUrl!)});
if(j.state==='ready'){
 const preflight=read('preflight');if(Date.now()-Date.parse(preflight.checkedAt)>900000||preflight.personalSpaces[0]?.id!==j.spaceId)throw Error('Fresh matching personal-space preflight required');
 const d:any=await gql('query($from:UUID!,$to:UUID!,$ids:[UUID!]!){relationsConnection(first:5,filter:{fromEntityId:{is:$from},typeId:{is:"3b4c516ff3ac41e0a939374119a27d6e"},toEntityId:{is:$to}}){nodes{id spaceId}pageInfo{hasNextPage}}relations(first:5,filter:{id:{in:$ids}}){id fromEntityId toEntityId typeId spaceId}}',{variables:{from:original.proposalId,to:original.bountyId,ids:[original.linkIds.typeRelationId,original.linkIds.submissionRelationId]}});
 if(d.relationsConnection.pageInfo.hasNextPage||d.relationsConnection.nodes.length||d.relations.length)throw Error('Existing link or identity found; inspect before recovery');
 j.absenceCheck={checkedAt:new Date().toISOString(),...d};save();
 if(!process.argv.includes('--publish')){console.log(JSON.stringify({mode:'dry-run',proposalId:j.proposalId,spaceId:j.spaceId,operations:ops.length,opsHash,sameOriginalIds:true}));process.exit(0);}
 await publishOps(ops,`Recover bounty metadata: ${batch.name}`,j.spaceId,{proposalOnly:true,onPrepared:details=>{if(details.kind!=='personal'||details.spaceId!==j.spaceId)throw Error('Unexpected recovery route');j.prepared=details;j.state='prepared';save();},onSubmitting:()=>{j.state='submitting';save();},onSubmitted:hash=>{j.hash=hash;j.state='submitted';save();}});
}
if(!j.hash)throw Error('Recovery state uncertain; inspect existing journal without restarting');
const receipt=await rpc.waitForTransactionReceipt({hash:j.hash,timeout:45000});j.receipt={status:receipt.status,blockNumber:String(receipt.blockNumber)};j.state=receipt.status==='success'?'confirmed':'reverted';save();
console.log(JSON.stringify({proposalId:j.proposalId,recoveryTransaction:j.hash,state:j.state,originalJournalPreserved:true}));if(j.state!=='confirmed')process.exitCode=1;
