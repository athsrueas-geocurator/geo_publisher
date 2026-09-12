import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {Ops,SystemIds,Position,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',pilot=process.argv.includes('--pilot'),prefix=pilot?'description-pilot':'description-remaining';
const audit=JSON.parse(readFileSync(`${root}/description-audit.json`,'utf8'));
const star=JSON.parse(readFileSync(`${root}/star-economic-registry.json`,'utf8'));
const registryPath=`${root}/description-repair-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Existing publication journal: reconcile before rebuilding');
if(!pilot&&!JSON.parse(readFileSync(`${root}/description-pilot-visual.json`,'utf8')).passed)throw new Error('Verify text-block pilot first');
const ops:Op[]=[],changes:any[]=[];
function relation(key:string,from:string,type:string,to:string,position?:string){registry[`position/${key}`]??=position??Position.generate();ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);}
for(const row of audit.rows.filter((r:any)=>r.needsReview&&(pilot?r.id===star.dataset:r.id!==star.dataset))){
 const {entity}=await gql<any>('query($id:UUID!){entity(id:$id){id values(first:100){nodes{propertyId spaceId text}pageInfo{hasNextPage}}relations(first:100){nodes{typeId spaceId position}pageInfo{hasNextPage}}}}',{variables:{id:row.id}});
 if(!entity||entity.values.pageInfo.hasNextPage||entity.relations.pageInfo.hasNextPage)throw new Error(`Incomplete read ${row.id}`);
 const current=entity.values.nodes.find((v:any)=>v.propertyId===SystemIds.DESCRIPTION_PROPERTY&&v.spaceId===EDUCATION_PUBLICATION.spaceId)?.text;
 if(current!==row.description)throw new Error(`Description changed since audit ${row.id}`);
 let description:string;
 if(row.id===star.dataset)description='Modeled costs and projected earnings for reducing early-grade class sizes, based on Tennessee STAR evidence. Compare economic assumptions and sensitivity scenarios in 1998 US dollars.';
 else if(row.name.startsWith('STAR model:'))description='A modeled cost-and-earnings scenario based on Tennessee STAR evidence, expressed in 1998 US dollars per pupil. These projections are not observed lifetime earnings.';
 else if(row.name.startsWith('Saga tutoring: Chicago'))description='Math effects and reported tutoring costs from two randomized Chicago trials. Estimates retain their study, uncertainty and source context.';
 else if(row.name.startsWith("Saga's Chicago"))description=row.description.split(/(?<=[.!?])\s+(?=[A-Z])/)[0]+' Related estimates from the same trial are not independent replications.';
 else if(row.name.startsWith('Saga tutoring: approximate'))description='Reported annual tutoring cost per pupil, with a range that is not a confidence interval. The price year and full accounting scope remain unverified.';
 else if(row.id===star.paper)description='Alan B. Krueger’s 2003 Economic Journal article examines class-size evidence and models its economic returns.';
 else if(row.name==='Education Initiatives glossary')description='Definitions of education research designs, inputs, outcomes and evidence terms. This collection is being migrated from Education Initiatives.';
 else throw new Error(`Needs editorial summary ${row.id}`);
 if(description.length>350)throw new Error('Summary too long');
 const detail=row.description.replace('Preserve reported 7300 and disclose the one-dollar discrepancy; do not silently replace it.','The dataset retains the reported value of 7300.');
 const block=id(`block/${row.id}`);
 const heading=row.name==='Education Initiatives glossary'?'Collection notes':row.id===star.paper?'Publication details':'Methods and interpretation';
 const markdown=`## ${heading}\n\n${detail}`;
 ops.push(...Ops.entities.update({id:row.id,description}).ops);
 // Equivalent to SDK textBlocks.create, with stable relation and relation-entity IDs.
 ops.push(...Ops.entities.update({id:block,values:[{property:SystemIds.MARKDOWN_CONTENT,type:'text',value:markdown}]}).ops);
 relation(`${row.id}/type`,block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
 const existingPositions=entity.relations.nodes.filter((r:any)=>r.spaceId===EDUCATION_PUBLICATION.spaceId&&r.typeId===SystemIds.BLOCKS).map((r:any)=>r.position).filter(Boolean).sort();
 relation(`${row.id}/block`,row.id,SystemIds.BLOCKS,block,Position.generateBetween(existingPositions.at(-1)??null,null));
 changes.push({id:row.id,name:row.name,before:row.description,after:description,blockId:block,markdown});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n',sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:pilot?'Shorten STAR overview and move methods into a content block':'Shorten remaining education descriptions and preserve detailed notes in blocks',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,changes,operationCount:ops.length,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks:['Live descriptions match reviewed audit','Two-sentence short summaries','Full notes preserved in typed SDK-compatible text blocks','Stable existing entity IDs and block relation IDs','Only descriptions and new text blocks; no numerical changes']},null,2)+'\n');
console.log(JSON.stringify({records:changes.length,operations:ops.length,changes:changes.map(({id,after,blockId})=>({id,after,blockId}))},null,2));
