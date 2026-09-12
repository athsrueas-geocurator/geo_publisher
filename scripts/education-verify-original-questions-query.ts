import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',original=JSON.parse(readFileSync(`${root}/source/content/dichotomies.json`,'utf8')),registry=JSON.parse(readFileSync(`${root}/original-questions-registry.json`,'utf8'));
const space='dac259bad48a11adf97fe36857d85206',checks:string[]=[],assert=(ok:unknown,message:string)=>{if(!ok)throw Error(message);checks.push(message);};
const entries:any[]=[];let after:string|null=null,pages=0;const seen=new Set<string>();
do{const d:any=await gql('query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){relations(first:5,after:$after,filter:{spaceId:{is:$space},typeId:{is:"a99f9ce12ffa4dac8c61f6310d46064a"}}){nodes{toEntityId position spaceId}pageInfo{hasNextPage endCursor}}}}',{variables:{id:registry.block,space,after}});assert(d.entity,'Question collection exists');const p=d.entity.relations;pages++;entries.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;assert(p.pageInfo.endCursor&&!seen.has(p.pageInfo.endCursor),'Collection cursor advances');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
entries.sort((a,b)=>a.position<b.position?-1:a.position>b.position?1:0);assert(entries.length===21&&new Set(entries.map(r=>r.toEntityId)).size===21,'Exactly 21 unique Question members');
for(const [i,row] of original.entries()){
 const entityId=registry[`question/${row.slug}`];assert(entries[i].toEntityId===entityId,`Original order ${row.slug}`);
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:10,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:entityId,space}});
 assert(d.entity&&!d.entity.values.pageInfo.hasNextPage&&!d.entity.relations.pageInfo.hasNextPage,`Complete scoped question ${row.slug}`);
 const values=new Map(d.entity.values.nodes.map((v:any)=>[v.propertyId,v.text]));
 assert(values.get('a126ca530c8e48d5b88882c734c38935')===row.betterQuestion,`Original question ${row.slug}`);assert(values.get('9b1f76ff9711404c861e59dc3fa7d037')===`${row.title}.`,`Original framing ${row.slug}`);assert(values.get('b0305ef28312c519d954bc0efe22f013')===row.slug,`Original route ${row.slug}`);assert(values.get('412ff593e9154012a43d4c27ec5c68b6')==='https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/dichotomies.json',`Pinned provenance ${row.slug}`);
 assert(d.entity.relations.nodes.length===1&&d.entity.relations.nodes[0].typeId==='8f151ba4de204e3c9cb499ddf96f48f1'&&d.entity.relations.nodes[0].toEntityId==='4318a1d2c441455cb76544049c45e6cf',`Question type without invented answer/evidence links ${row.slug}`);
}
const report={checkedAt:new Date().toISOString(),passed:true,space,datasetId:registry.dataset,blockId:registry.block,pages,questions:21,checks,scope:'Independent ordered collection traversal and original-file comparison; not research-answer/assessment certification'};
writeFileSync(`${root}/original-questions-query-verification.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,pages,questions:21,checks:checks.length}));
