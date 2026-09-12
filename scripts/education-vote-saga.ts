import {readFileSync,writeFileSync} from 'node:fs';
import {createPublicClient,http} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {createGeoClient,createGeoWalletClient,GeoTestnetConfig} from '@geoprotocol/geo-sdk';
import {DaoSpaceAbi,SpaceRegistryAbi} from '@geoprotocol/geo-sdk/abis';
import 'dotenv/config';
const journalArg=process.argv.indexOf('--journal');
const path=journalArg>=0?process.argv[journalArg+1]!:'data/education/saga-publication.json';
const j=JSON.parse(readFileSync(path,'utf8'));
const save=()=>writeFileSync(path,JSON.stringify(j,null,2)+'\n');
const hex=(s:string)=>`0x${s.replace(/^0x/,'')}` as `0x${string}`;
const author=hex('d00460c203779d21d96fcfc6102d7a72');
const rpc=createPublicClient({transport:http(GeoTestnetConfig.chain!.rpcUrl!)});
try{
  if(j.main.state!=='confirmed'||j.spaceId!=='dac259bad48a11adf97fe36857d85206')throw new Error('Unexpected publication state');
  const address=await rpc.readContract({address:GeoTestnetConfig.contracts!.SPACE_REGISTRY_ADDRESS!,abi:SpaceRegistryAbi,functionName:'spaceIdToAddress',args:[hex(j.spaceId)]});
  const proposal=hex(j.proposalId);
  const version=await rpc.readContract({address,abi:DaoSpaceAbi,functionName:'latestProposalVersion',args:[proposal]});
  if(version!==j.main.prepared.versionId)throw new Error('Proposal version changed');
  const existing=await rpc.readContract({address,abi:DaoSpaceAbi,functionName:'getProposalVote',args:[proposal,version,author]});
  if(existing!==0){console.log(JSON.stringify({existingVote:existing}));}
  else if(process.argv.includes('--vote')){
    if(j.vote?.state==='submitting'&&!j.vote.hash)throw new Error('Reconcile prior vote attempt before retrying');
    const raw=process.env.PK_SW;if(!raw)throw new Error('Missing key');
    const wallet=await createGeoWalletClient({signer:privateKeyToAccount(hex(raw)),network:GeoTestnetConfig});
    if(!wallet.account||wallet.account.address.toLowerCase()!=='0xfaef76b3f95b1ff236624ca676a4891a1ba5c59e')throw new Error('Unexpected signer');
    const vote=createGeoClient({network:GeoTestnetConfig}).daoSpaces.voteProposal({authorSpaceId:author,spaceId:hex(j.spaceId),proposalId:proposal,versionId:version,vote:'YES'});
    j.vote={state:'submitting',...vote};save();
    const hash=await wallet.sendTransaction({account:wallet.account,chain:wallet.chain,to:vote.to,data:vote.calldata});
    j.vote.hash=hash;j.vote.state='submitted';save();
    const receipt=await rpc.waitForTransactionReceipt({hash,timeout:45000});
    j.vote.state=receipt.status==='success'?'confirmed':'reverted';save();
    console.log(JSON.stringify({voteTransaction:hash,state:j.vote.state}));
  }else console.log(JSON.stringify({existingVote:existing,version}));
  const info=await rpc.readContract({address,abi:DaoSpaceAbi,functionName:'getLatestProposalInformation',args:[proposal]});
  j.chainVerification={checkedAt:new Date().toISOString(),information:info};
  writeFileSync(path,JSON.stringify(j,(_k,v)=>typeof v==='bigint'?String(v):v,2)+'\n');
  console.log(JSON.stringify(info,(_k,v)=>typeof v==='bigint'?String(v):v));
}catch(e:any){console.error('Vote check failed:',e.name);process.exitCode=1;}
