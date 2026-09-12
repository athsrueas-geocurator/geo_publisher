import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const path=process.argv[2];if(!path)throw new Error('Supply publication journal');
const journal=JSON.parse(readFileSync(path,'utf8'));
const report:any={checkedAt:new Date().toISOString(),proposalId:journal.proposalId,confirmedTransaction:journal.bounty.hash,expectedRelationId:journal.linkIds.submissionRelationId,pages:[]};
let after:string|null=null;
while(true){
 const data:any=await gql<any>('query($id:UUID!,$after:Cursor){relationsConnection(first:10,after:$after,filter:{fromEntityId:{is:$id}}){nodes{id entityId typeId toEntityId spaceId}pageInfo{hasNextPage endCursor}}}',{variables:{id:journal.proposalId,after}});
 const page=data.relationsConnection;report.pages.push(page);if(!page.pageInfo.hasNextPage)break;
 if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||report.pages.length>=20)throw new Error('Incomplete pagination');after=page.pageInfo.endCursor;
}
report.matched=report.pages.flatMap((p:any)=>p.nodes).some((r:any)=>r.id===journal.linkIds.submissionRelationId&&r.entityId===journal.linkIds.submissionRelationEntityId&&r.typeId==='3b4c516ff3ac41e0a939374119a27d6e'&&r.toEntityId===journal.bountyId&&r.spaceId===journal.bounty.prepared.spaceId);
writeFileSync(path.replace('-publication.json','-bounty-inspection.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
