import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';
import { GeoTestnetConfig } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest } from '../src/geo-api-client';

// Read-only: derive the configured signer's address; never create a wallet,
// sign, upload an edit, or send a transaction during preflight.
const target = 'dac259bad48a11adf97fe36857d85206';
try {
  const raw = parse(readFileSync('.env')).PK_SW;
  if (!raw || !/^(0x)?[a-fA-F0-9]{64}$/.test(raw)) throw new Error('PK_SW missing or malformed');
  const signer = privateKeyToAccount((raw.startsWith('0x') ? raw : `0x${raw}`) as `0x${string}`);
  const identity = await geoGraphqlRequest<{spaces: Array<{id:string;type:string}>}>(
    `query Signer($address:String!) { spaces(first:5,filter:{address:{isInsensitive:$address}}) { id type } }`,
    { variables: { address: signer.address } },
  );
  const data = await geoGraphqlRequest<{space: any}>(
    `query Target($id:UUID!) { space(id:$id) { id type topic { id name } members(first:100) { nodes { memberSpaceId } pageInfo { hasNextPage endCursor } } editors(first:100) { nodes { memberSpaceId } pageInfo { hasNextPage endCursor } } spaceVotingSetting { duration quorum partialPercentageSupportThreshold universalPercentageSupportThreshold flatSupportThreshold disableFastPathAccessForNewMembers executionGracePeriod } proposals(first:5) { id executedAt currentVersion proposalVersions { proposalVersion votingMode startTime endTime executeBy quorum threshold yesCount noCount abstainCount } } } }`,
    { variables: { id: target } },
  );
  const personalSpaces = identity.spaces.filter(x => x.type === 'PERSONAL');
  const report = { checkedAt:new Date().toISOString(), network:GeoTestnetConfig.name, targetSpaceId:target, personalSpaces, editor: data.space?.editors.nodes.some((e:any) => personalSpaces.some(p=>p.id===e.memberSpaceId)), member: data.space?.members.nodes.some((e:any) => personalSpaces.some(p=>p.id===e.memberSpaceId)), governance:data.space, writesPerformed:false };
  mkdirSync('data/education', { recursive:true });
  writeFileSync('data/education/preflight.json', JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} catch (error) {
  // Credential/provider error objects can contain request internals. Print only
  // a fixed diagnostic; no raw exception, account, key, or provider URL.
  console.error('Education read-only preflight failed; inspect credential presence and public API availability. No write attempted.');
  process.exitCode=1;
}
