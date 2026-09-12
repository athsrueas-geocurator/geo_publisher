import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const query='{a:__type(name:"VotesCount"){fields{name type{kind name ofType{kind name}}}} b:__type(name:"VotesCountsOrderBy"){enumValues{name}} c:__type(name:"VotesCountFilter"){inputFields{name type{kind name}}}}';
const schema=await gql<any>(query);writeFileSync('data/education/debate-engagement-schema.json',JSON.stringify(schema,null,2));console.log(JSON.stringify(schema));
const active=new Map<string,any>();let after:string|null=null,pages=0;
do{
 const data:any=await gql<any>('query($after:Cursor){userVotesConnection(first:100,after:$after,filter:{objectType:{is:0},voteKind:{is:1},voteType:{in:[0,1]}}){nodes{objectId spaceId userId voteType}pageInfo{hasNextPage endCursor}}}',{variables:{after}});
 const page=data.userVotesConnection;
 for(const row of page.nodes)active.set(`${row.objectId}/${row.spaceId}/${row.userId}`,row);
 pages++;if(page.pageInfo.hasNextPage&&(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||pages>100))throw new Error('Incomplete active-stance pagination');
 after=page.pageInfo.hasNextPage?page.pageInfo.endCursor:null;
}while(after);
const counts=new Map<string,any>();
for(const row of active.values()){
 const key=`${row.objectId}/${row.spaceId}`,count=counts.get(key)??{id:row.objectId,spaceId:row.spaceId,positive:0,negative:0,total:0};
 count[row.voteType===0?'positive':'negative']++;count.total++;counts.set(key,count);
}
const ranked=[...counts.values()].sort((a,b)=>b.total-a.total||a.id.localeCompare(b.id)),claims:any[]=[];
for(const row of ranked){
 const data=await gql<any>('query($id:UUID!){entity(id:$id){name types{id}}}',{variables:{id:row.id}});
 if(data.entity.types.some((t:any)=>t.id==='96f859efa1ca4b229372c86ad58b694b'))claims.push({...row,name:data.entity.name});
 if(claims.length===15)break;
}
const report={checkedAt:new Date().toISOString(),scope:'All indexed active entity stance responses (voteKind=1, objectType=0, voteType=0/1), deduplicated per user/entity/space; top 15 Claim-space pairs by total responses. Not page views, curation votes, veracity responses or debates.',complete:true,pages,activeResponses:active.size,claimSpacePairs:counts.size,topClaims:claims};
writeFileSync('data/education/debate-engagement-research.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
