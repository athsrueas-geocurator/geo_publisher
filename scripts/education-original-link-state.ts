import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',space='dac259bad48a11adf97fe36857d85206';
const d=JSON.parse(readFileSync(`${root}/original-link-discovery.json`,'utf8'));
const rows:any[]=[];
for(const r of d.initiatives.filter((r:any)=>r.nodes?.length===1 && ![24,33].includes(r.key))){
 const id=r.nodes[0].id; const state:any={key:r.key,id,name:r.term,values:[],relations:[]};
 for(const kind of ['values','relations']){
  let after:string|null=null;const seen=new Set<string>();
  do{
   const fields=kind==='values'?'propertyId text spaceId':'id typeId toEntityId spaceId toEntity{name}';
   const data:any=await gql(`query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){${kind}(first:50,after:$after,filter:{spaceId:{is:$space}}){nodes{${fields}}pageInfo{hasNextPage endCursor}}}}`,{variables:{id,space,after}});
   const p=data.entity[kind];state[kind].push(...p.nodes);if(!p.pageInfo.hasNextPage)break;
   if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);
  }while(true);
 }
 rows.push(state);
}
writeFileSync(`${root}/original-link-state.json`,JSON.stringify({checkedAt:new Date().toISOString(),space,rows},null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({key:r.key,id:r.id,slug:r.values.filter((v:any)=>v.propertyId==='b0305ef28312c519d954bc0efe22f013'),sources:r.relations.filter((v:any)=>v.typeId==='49c5d5e1679a4dbdbfd33f618f227c94')})),null,2));
