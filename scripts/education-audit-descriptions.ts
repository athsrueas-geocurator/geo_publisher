import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education', ids=new Set<string>(), batches:string[]=[];
for(const file of readdirSync(root).filter(f=>f.endsWith('-batch.json'))){
 const batch=JSON.parse(readFileSync(`${root}/${file}`,'utf8'));
 if(batch.spaceId!==EDUCATION_PUBLICATION.spaceId)continue;
 const journal=batch.journalPath??(file==='saga-batch.json'?`${root}/saga-publication.json`:'');
 if(!journal||!existsSync(journal)||JSON.parse(readFileSync(journal,'utf8')).chainVerification?.information?.[0]!==true)continue;
 batches.push(file);
 for(const op of JSON.parse(readFileSync(batch.opsPath,'utf8')))if(op.type==='updateEntity'&&op.set?.some((s:any)=>s.property.$bytes===SystemIds.DESCRIPTION_PROPERTY))ids.add(op.id.$bytes);
}
const rows:any[]=[];
for(const id of ids){
 const {entity}=await gql<any>('query($id:UUID!){entity(id:$id){id name types{id name} values(first:100){nodes{propertyId spaceId text}pageInfo{hasNextPage}}}}',{variables:{id}});
 if(!entity||entity.values.pageInfo.hasNextPage)throw new Error(`Incomplete read ${id}`);
 const description=entity.values.nodes.find((v:any)=>v.spaceId===EDUCATION_PUBLICATION.spaceId&&v.propertyId===SystemIds.DESCRIPTION_PROPERTY)?.text;
 if(description===undefined)throw new Error(`Description not indexed ${id}`);
 const sentences=description.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
 rows.push({id,name:entity.name,types:entity.types,description,characters:description.length,sentenceCount:sentences.length,needsReview:sentences.length>2||description.length>350});
}
const report={checkedAt:new Date().toISOString(),scope:'Current destination-space descriptions written by executed Education migration batches',batches,rows};
writeFileSync(`${root}/description-audit.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checked:rows.length,review:rows.filter(r=>r.needsReview).map(({id,name,characters,sentenceCount})=>({id,name,characters,sentenceCount}))},null,2));
