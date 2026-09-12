import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education', prefix='original-initiative-routes', property='b0305ef28312c519d954bc0efe22f013';
const read=(p:string)=>JSON.parse(readFileSync(`${root}/${p}.json`,'utf8'));
const sources=read('source/content/initiatives'), crosswalk=read('source-to-geo-crosswalk');
const schema:any=await gql('query($id:UUID!){entity(id:$id){name description}property(id:$id){dataTypeName}}',{variables:{id:property}});
if(schema.property?.dataTypeName!=='Text')throw Error('Slug property is not Text');
const report:any={checkedAt:new Date().toISOString(),property,schema,accepted:[],review:[]}; const ops:Op[]=[];
for(const row of crosswalk.rows.filter((r:any)=>r.collection==='initiatives'&&r.candidateGeoIds.length===1)){
 const source=sources.find((r:any)=>String(r.id)===row.sourceKey); if(!source)throw Error('Missing source');
 const id=row.candidateGeoIds[0];
 if(row.sourceKey==='24'){report.review.push({key:row.migrationKey,id,reason:'Published secondary-math evaluation scope is narrower than original alternate-route umbrella'});continue;}
 const data:any=await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name description values(first:50,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
 const entity=data.entity;
 if(!entity||entity.values.pageInfo.hasNextPage||entity.name!==source.name){report.review.push({key:row.migrationKey,id,sourceName:source.name,liveName:entity?.name,reason:'Identity equivalence needs review'});continue;}
 const current=entity.values.nodes.filter((v:any)=>v.propertyId===property);
 if(current.some((v:any)=>v.text!==source.slug))throw Error(`Existing conflicting slug: ${id}`);
 if(!current.length)ops.push(...Ops.entities.update({id,values:[{property,type:'text',value:source.slug}]}).ops);
 report.accepted.push({key:row.migrationKey,id,name:entity.name,slug:source.slug,state:current.length?'existing-and-readable':'missing',description:entity.description});
}
writeFileSync(`${root}/${prefix}-review.json`,JSON.stringify(report,null,2));
if(!process.argv.includes('--build')){console.log(JSON.stringify(report));process.exit(0);}
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Preserve original initiative routes on verified existing Geo identities',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2));writeFileSync(batch.validationPath,JSON.stringify({ready:ops.length>0,checkedAt:report.checkedAt,opsHash:sha256,scope:'Missing route slugs only; exact original/live identity names; existing conflicting values rejected'},null,2));console.log(JSON.stringify(report));
