import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',space='dac259bad48a11adf97fe36857d85206',candidates=new Map<string,string[]>();
for(const name of readdirSync(root).filter(n=>n.endsWith('-registry.json'))){const r=JSON.parse(readFileSync(`${root}/${name}`,'utf8'));for(const key of ['initiative','program']){const id=r[key];if(typeof id==='string'&&/^[0-9a-f]{32}$/.test(id))candidates.set(id,[...(candidates.get(id)??[]),name]);}}
const rows:any[]=[];
for(const [id,registries] of candidates){const row:any={id,registries,values:[],relations:[]};
 for(const kind of ['values','relations']){let after:string|null=null;const seen=new Set<string>();
  do{const fields=kind==='values'?'propertyId text spaceId':'id typeId toEntityId spaceId toEntity{name}';const d:any=await gql(`query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){${kind}(first:30,after:$after,filter:{spaceId:{is:$space}}){nodes{${fields}}pageInfo{hasNextPage endCursor}}}}`,{variables:{id,space,after}});if(!d.entity)throw Error(`Missing published candidate ${id}`);const p=d.entity[kind];row[kind].push(...p.nodes);if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete page');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 }rows.push(row);
}
writeFileSync(`${root}/published-program-reconciliation-audit.json`,JSON.stringify({checkedAt:new Date().toISOString(),space,scope:'Complete scoped values/relations for registry-identified program/initiative candidates; not a census of all Geo entities and not creation clearance',rows},null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({id:r.id,values:r.values.map((v:any)=>v.text),sources:r.relations.filter((e:any)=>e.typeId==='49c5d5e1679a4dbdbfd33f618f227c94').map((e:any)=>({id:e.toEntityId,name:e.toEntity.name}))})),null,2));
