import {mkdirSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const target='f24e3bbd26304474b7e0c2a0877f4bfe';
const data=await gql<any>('query($id:UUID!){space(id:$id){id type topic{id name}editors(first:100){nodes{editorSpaceId:memberSpaceId}pageInfo{hasNextPage}}members(first:100){nodes{memberSpaceId}pageInfo{hasNextPage}}spaceVotingSetting{duration quorum flatSupportThreshold disableFastPathAccessForNewMembers executionGracePeriod}}}',{variables:{id:target}});
const report={checkedAt:new Date().toISOString(),requestedSpaceId:target,source:'User-selected destination relayed by the frontend task',readOnly:true,writesPerformed:false,space:data.space,limitations:['Public space identity and bounded governance membership only; current signing key and write authorization have not been checked for outreach.','Directory schema, field verification, privacy review and publication gates remain incomplete.']};
mkdirSync('data/indianapolis-outreach-directory',{recursive:true});
writeFileSync('data/indianapolis-outreach-directory/destination-discovery.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
