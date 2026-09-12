import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='original-program-aliases',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const review=read('original-program-alias-review'),originals=read('source/content/initiatives'),slug='b0305ef28312c519d954bc0efe22f013',ops:Op[]=[];
const schema:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:slug}});if(schema.property?.dataTypeName!=='Text')throw Error('Route schema mismatch');
for(const row of review.accepted){
 const original=originals.find((r:any)=>r.id===row.originalId);
 const d:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name values(first:20,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}relations(first:20,filter:{spaceId:{is:$space},typeId:{is:"8f151ba4de204e3c9cb499ddf96f48f1"}}){nodes{toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:row.entityId,space:target.spaceId}});
 if(d.entity?.name!==row.expectedName||d.entity.values.pageInfo.hasNextPage||d.entity.relations.pageInfo.hasNextPage||!d.entity.relations.nodes.some((r:any)=>r.toEntityId==='d272f19cef87485fb83e26fb68957395'))throw Error('Program identity changed');
 if(d.entity.values.nodes.some((v:any)=>v.propertyId===slug))throw Error('Existing route needs review');
 const collisions:any=await gql('query($text:String!,$space:UUID!){valuesConnection(first:5,filter:{text:{is:$text},propertyId:{is:"b0305ef28312c519d954bc0efe22f013"},spaceId:{is:$space}}){nodes{entity{id name}}pageInfo{hasNextPage}}}',{variables:{text:original.slug,space:target.spaceId}});if(collisions.valuesConnection.nodes.length||collisions.valuesConnection.pageInfo.hasNextPage)throw Error('Route collision');
 ops.push(...Ops.entities.update({id:row.entityId,values:[{property:slug,type:'text',value:original.slug}]}).ops);
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Restore original routes for three existing education programs',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,review},null,2)+'\n');console.log(JSON.stringify({operations:ops.length,accepted:review.accepted}));
