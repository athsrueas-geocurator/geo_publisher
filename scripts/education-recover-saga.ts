import { readFileSync, writeFileSync } from 'node:fs';
import { createPublicClient, http, encodeAbiParameters, encodeFunctionData, keccak256, toHex, zeroAddress, zeroHash } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createGeoClient, createGeoWalletClient, GeoTestnetConfig } from '@geoprotocol/geo-sdk';
import { DaoSpaceAbi, SpaceRegistryAbi } from '@geoprotocol/geo-sdk/abis';
import 'dotenv/config';

// Recovery never uploads another edit or allocates another proposal ID.
const path='data/education/saga-publication.json';
const j=JSON.parse(readFileSync(path,'utf8'));
const p=j.main.prepared;
const hex=(id:string)=>`0x${id.replace(/^0x/,'')}` as `0x${string}`;
const save=()=>writeFileSync(path,JSON.stringify(j,null,2)+'\n');
const rpc=createPublicClient({transport:http(GeoTestnetConfig.chain!.rpcUrl!)});
try {
  if(j.main.hash)throw new Error('Transaction hash already recorded; reconcile its receipt instead');
  if(j.spaceId!=='dac259bad48a11adf97fe36857d85206'||p.kind!=='proposal')throw new Error('Unexpected recovery target');
  const address=await rpc.readContract({address:GeoTestnetConfig.contracts!.SPACE_REGISTRY_ADDRESS!,abi:SpaceRegistryAbi,functionName:'spaceIdToAddress',args:[hex(j.spaceId)]});
  const version=await rpc.readContract({address,abi:DaoSpaceAbi,functionName:'latestProposalVersion',args:[hex(p.proposalId)]});
  j.recovery={checkedAt:new Date().toISOString(),onChainVersion:String(version)};save();
  if(Number(version)!==0)throw new Error('Proposal exists on chain; recover its receipt instead of resubmitting');
  // Encode the same public ABI call as SDK 0.20.3 encodeCreateProposal.
  const params={
    fromSpaceId:hex('d00460c203779d21d96fcfc6102d7a72'),daoSpaceId:hex(j.spaceId),proposalId:hex(p.proposalId),votingMode:'FAST',
    actions:[{toAddress:zeroAddress,toSpaceId:hex(j.spaceId),value:0n,data:encodeFunctionData({abi:DaoSpaceAbi,functionName:'ping',args:[keccak256(toHex('GOVERNANCE.EDITS_PUBLISHED')),zeroHash,encodeAbiParameters([{type:'bytes'},{type:'bytes'}],[toHex(p.cid),'0x'])]})}],
  };
  const data=encodeAbiParameters([{type:'bytes16'},{type:'uint8'},{type:'tuple[]',components:[{type:'address',name:'toAddress'},{type:'bytes16',name:'toSpaceId'},{type:'uint256',name:'value'},{type:'bytes',name:'data'}]}],[params.proposalId,1,params.actions]);
  const prepared={to:GeoTestnetConfig.contracts!.SPACE_REGISTRY_ADDRESS!,calldata:encodeFunctionData({abi:SpaceRegistryAbi,functionName:'enter',args:[params.fromSpaceId,params.daoSpaceId,keccak256(toHex('GOVERNANCE.PROPOSAL_CREATED')),`${params.proposalId}${'0'.repeat(32)}` as `0x${string}`,data,'0x']})};
  if(prepared.to.toLowerCase()!==p.to.toLowerCase())throw new Error('Registry mismatch');
  if(p.calldata&&p.calldata!==prepared.calldata)throw new Error('Prepared transaction mismatch');
  p.calldata=prepared.calldata;save();
  if(process.argv.includes('--submit')){
    const raw=process.env.PK_SW;if(!raw)throw new Error('Missing publishing key');
    const signer=privateKeyToAccount(hex(raw));
    const wallet=await createGeoWalletClient({signer,network:GeoTestnetConfig});
    if(!wallet.account||wallet.account.address.toLowerCase()!=='0xfaef76b3f95b1ff236624ca676a4891a1ba5c59e')throw new Error('Unexpected signer');
    j.main.state='submitting';save();
    const hash=await wallet.sendTransaction({account:wallet.account,chain:wallet.chain,to:prepared.to,data:prepared.calldata});
    j.main.hash=hash;j.main.state='submitted';save();
    console.log(JSON.stringify({hash,proposalId:p.proposalId}));
  }else console.log(JSON.stringify({proposalId:p.proposalId,onChainVersion:String(version),prepared:true}));
}catch(error:any){
  const reason=String(error?.shortMessage??'').replace(/(?:0x)?[a-fA-F0-9]{64}/g,'[redacted]').slice(0,250);
  j.recoveryFailure={at:new Date().toISOString(),name:error?.name??'Error',reason};save();
  // Wallet transport errors can contain signed operations; do not dump them.
  console.error('Recovery failed:',error?.name??'Error',reason);process.exitCode=1;
}
