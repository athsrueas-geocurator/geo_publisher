import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const names=['Getting married is a central part of the success sequence, the best route to economic security and personal happiness','Marriage is not necessary to validate a committed relationship','You should never hold Bitcoin on a sidechain','Supporting arguments','Opposing arguments','Related claims'];
const report:any={checkedAt:new Date().toISOString(),scope:'Exact all-space identity and complete outgoing relations of selected visible debate examples; not a popularity census',entities:[]};
for(const name of names){
 const matches:any[]=[];let cursor:string|null=null;
 do{const found:any=await gql<any>('query($name:String!,$after:Cursor){entitiesConnection(first:10,after:$after,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{name,after:cursor}});
  matches.push(...found.entitiesConnection.nodes);const page=found.entitiesConnection.pageInfo;
  if(page.hasNextPage&&(!page.endCursor||page.endCursor===cursor||matches.length>300))throw new Error('Incomplete exact-name search');cursor=page.hasNextPage?page.endCursor:null;
 }while(cursor);
 for(const e of matches){
  let after:string|null=null;const relations:any[]=[];
  do{const data:any=await gql<any>('query($id:UUID!,$after:Cursor){relationsConnection(first:10,after:$after,filter:{fromEntityId:{is:$id}}){nodes{id entityId typeId spaceId toEntityId toEntity{name}type{name}}pageInfo{hasNextPage endCursor}}}',{variables:{id:e.id,after}});
   relations.push(...data.relationsConnection.nodes);const p=data.relationsConnection.pageInfo;
   if(p.hasNextPage&&(!p.endCursor||p.endCursor===after))throw new Error('Incomplete relation pagination');after=p.hasNextPage?p.endCursor:null;
  }while(after);
  report.entities.push({...e,relations});
 }
}
const schema=await gql<any>('{__type(name:"Query"){fields{name}}}');
report.engagementQueryFields=schema.__type.fields.filter((f:any)=>/vote|rank|score|claim|stance|debate/i.test(f.name));
writeFileSync('data/education/debate-claim-research.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({entities:report.entities.map((e:any)=>({id:e.id,name:e.name,relations:e.relations.length,argumentLinks:e.relations.filter((r:any)=>['1dc6a843458848198e7a6e672268f811','4e6ec5d14292498a84e5f607ca1a08ce'].includes(r.typeId))})),engagementQueryFields:report.engagementQueryFields},null,2));
