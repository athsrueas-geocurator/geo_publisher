import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ops,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix=process.argv.includes('--remaining')?'remaining-doi-links':'bibliography-doi-links',property='7cb59354e30c48119e99ff62fcf61646';
if(existsSync(`${root}/${prefix}-publication.json`))throw Error('Preserve submitted payload');
let inventory=JSON.parse(readFileSync(`${root}/original-source-identity-audit.json`,'utf8'));
if(process.argv.includes('--remaining')){
 const articles:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql('query($space:UUID!,$property:UUID!,$after:Cursor){valuesConnection(first:20,after:$after,filter:{spaceId:{is:$space},propertyId:{is:$property}}){nodes{entityId text entity{name}}pageInfo{hasNextPage endCursor}}}',{variables:{space:target.spaceId,property,after}});const p=d.valuesConnection;for(const n of p.nodes){const prior=articles.find(a=>a.id===n.entityId);if(prior)prior.values.nodes.push({propertyId:property,text:n.text});else articles.push({id:n.entityId,name:n.entity.name,values:{nodes:[{propertyId:property,text:n.text}]}});}if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete DOI inventory');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 inventory={checkedAt:new Date().toISOString(),articles};
}
if(Date.now()-Date.parse(inventory.checkedAt)>15*60*1000)throw Error('Refresh Article inventory');
const schema:any=await gql('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});if(schema.property?.dataTypeName!=='Text')throw Error('Unexpected DOI schema');
const ops:Op[]=[];const records:any[]=[];
for(const article of inventory.articles){
 const values=article.values.nodes.filter((v:any)=>v.propertyId===property);
 if(values.length>1)throw Error('Conflicting DOI values need review');
 if(!values.length||values[0].text.startsWith('https://doi.org/'))continue;
 const before=values[0].text;if(!/^10\.\d{4,9}\/\S+$/.test(before))throw Error(`Unrecognized DOI ${article.id}`);
 const after=`https://doi.org/${before}`;
 ops.push(...Ops.entities.update({id:article.id,values:[{property,type:'text',value:after}]}).ops);records.push({id:article.id,name:article.name,before,after});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Repair DOI resolver links across the education bibliography',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,operationCount:ops.length,records};
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:ops.length>0,checkedAt:new Date().toISOString(),opsHash:sha256,scope:'Preserve every existing DOI identifier exactly; add explicit official resolver prefix only. No publication-version or source-content adjudication.',inventoryCheckedAt:inventory.checkedAt,records},null,2)+'\n');
console.log(JSON.stringify({operations:ops.length,records:records.map(r=>({id:r.id,before:r.before,after:r.after}))}));
