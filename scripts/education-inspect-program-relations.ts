import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const batch=JSON.parse(readFileSync('data/education/reading-first-program-batch.json','utf8'));
const ops=JSON.parse(readFileSync(batch.opsPath,'utf8')).filter((o:any)=>o.type==='createRelation');
const report:any={checkedAt:new Date().toISOString(),relations:[]};
for(const id of new Set<string>(ops.map((o:any)=>o.from.$bytes))){
 const r=await gql<any>('query($id:UUID!){entity(id:$id){relations(first:100){nodes{id entityId typeId fromEntityId toEntityId spaceId position}pageInfo{hasNextPage}}}}',{variables:{id}});
 if(r.entity.relations.pageInfo.hasNextPage)throw new Error('Incomplete relations');
 for(const op of ops.filter((o:any)=>o.from.$bytes===id))report.relations.push({expected:op,actual:r.entity.relations.nodes.find((n:any)=>n.id===op.id.$bytes)??null});
}
writeFileSync('data/education/reading-first-program-relation-inspection.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.relations.map((r:any)=>({id:r.expected.id.$bytes,expectedPosition:r.expected.position??null,actualPosition:r.actual?.position,found:!!r.actual}))));
