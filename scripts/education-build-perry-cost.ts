import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';
const root='data/education',prefix='perry-cost-pilot';
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Existing publication journal: reconcile without overwriting its operations');
const sourceBytes=readFileSync(`${root}/perry-economic-extraction.json`,'utf8');
const source=JSON.parse(sourceBytes),prepared=JSON.parse(readFileSync(`${root}/perry-publication-records.json`,'utf8'));
const saga=JSON.parse(readFileSync(`${root}/saga-registry.json`,'utf8'));
const registryPath=`${root}/perry-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[];
function assert(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
const integer=(property:string,value:number)=>({property,type:'integer' as const,value:BigInt(value)});
const decimal=(property:string,value:string)=>{const [whole,part='']=value.split('.');return {property,type:'decimal' as const,exponent:-part.length,mantissa:{type:'i64' as const,value:BigInt(whole+part)}};};
const prop=(key:string):string=>saga[`property/${key}`];
const sources='49c5d5e1679a4dbdbfd33f618f227c94',related='dfa6aebe1ca94bf29faccc4cc7afb24c',location='95d770021faf4f7cb7deb21a7d48cda0';
const doi='7cb59354e30c48119e99ff62fcf61646',currency='6e7371ca96cb44348f16932f77f55e75';
const city='03800f1056255931508ec9648111a075',studyType='3ef269bc5f114691abc02dcbf398fd63',claim='96f859efa1ca4b229372c86ad58b694b';
function relation(key:string,from:string,type:string,to:string,position?:string){
  const entityId=id(`relation-entity/${key}`);registry[`position/${key}`]??=position??Position.generate();
  ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId,fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);return entityId;
}
function notes(key:string,parent:string,markdown:string,position:string){
  const block=id(`notes/${key}`);ops.push(...Ops.entities.update({id:block,values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]}).ops);
  relation(`${key}/notes/type`,block,SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);relation(`${key}/notes`,parent,SystemIds.BLOCKS,block,position);
}
assert(prepared.sourceSha256===createHash('sha256').update(sourceBytes).digest('hex'),'Prepared records match current extraction');
assert(JSON.parse(readFileSync(`${root}/perry-record-verification.json`,'utf8')).passed===true&&source.verification.visualChecked,'Source and normalized records verified');
const row=prepared.records.find((r:any)=>r.key==='cost/initial-program');assert(row?.value==='17759'&&row.priceYear===2006,'Source cost and price year');
const definitions:[string,string,string,string][]=[
 ['dataset','Perry Preschool: costs, observed outcomes and modeled returns','Study evidence from a preschool intervention in Ypsilanti, Michigan. Costs, descriptive outcomes and modeled economic returns retain their distinct assumptions and source context.','0c4babfb43893486af827341bbf32e09'],
 ['paper',source.publication.title,'An economic analysis of the HighScope Perry Preschool experiment, published in 2010. It estimates returns while accounting for compromised randomization and uncertainty in projected outcomes.',ContentIds.ARTICLE_TYPE],
 ['study','HighScope Perry Preschool study','A preschool experiment involving 123 children in Ypsilanti, Michigan during the 1960s. Subsequent reassignment compromised the initial randomization, requiring adjustment in later analyses.',studyType],
 ['cost/initial-program','Perry Preschool initial program cost: 17,759 USD per child (2006 prices)','An undiscounted program resource cost per child, including operating expenses and classroom facilities. It is not annual expenditure or the financing-adjusted denominator for every economic scenario.',claim]
];
for(const [key,name] of definitions){
  const found=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id name}pageInfo{hasNextPage}}}',{variables:{name}});
  assert(!found.entitiesConnection.pageInfo.hasNextPage&&found.entitiesConnection.nodes.every((n:any)=>n.id===registry[key]),`Cross-space identity ${name}`);
}
for(const needle of [source.publication.doi,source.publication.workingPaperDoi]){
  const found=await gql<any>('query($needle:String!){valuesConnection(first:10,filter:{text:{includesInsensitive:$needle}}){nodes{entity{id}}pageInfo{hasNextPage}}}',{variables:{needle}});
  assert(!found.valuesConnection.pageInfo.hasNextPage&&found.valuesConnection.nodes.every((n:any)=>n.entity.id===registry.paper),`Cross-space DOI ${needle}`);
}
for(const [property,datatype] of [[prop('cost'),'Decimal'],[prop('priceYear'),'Integer'],[currency,'Text'],[doi,'Text'],[prop('denominator'),'Text'],[prop('locator'),'Text'],[ContentIds.WEB_URL_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[sources,'Relation'],[related,'Relation'],[location,'Relation'],[prop('entries'),'Relation']]){
  const found=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:property}});
  assert(found.property?.dataTypeName.toLowerCase()===datatype!.toLowerCase(),`Live datatype ${property}: ${datatype}`);
}
const place=await gql<any>('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}}}',{variables:{id:city}});
assert(place.entity?.name==='Ypsilanti'&&place.entity.spaceIds.includes('84a679ce188f061ac9a92380bac2bab5')&&place.entity.types.some((t:any)=>t.name==='City'),'Reuse geography Ypsilanti city');
for(const [key,name,description,type] of definitions){
  const values=key==='paper'?[text(doi,source.publication.doi),text(ContentIds.WEB_URL_PROPERTY,source.publication.sourceUrl)]
    :key==='cost/initial-program'?[decimal(prop('cost'),row.value),integer(prop('priceYear'),row.priceYear),text(currency,row.unit),text(prop('denominator'),row.denominator),text(prop('locator'),row.locator)]:[];
  ops.push(...Ops.entities.update({id:id(key),name,description,values}).ops);relation(`${key}/type`,id(key),SystemIds.TYPES_PROPERTY,type);
  if(key!=='paper'){relation(`${key}/source`,id(key),sources,id('paper'));relation(`${key}/location`,id(key),location,city);}
  if(key==='dataset'||key==='cost/initial-program')relation(`${key}/study`,id(key),related,id('study'));
}
relation('dataset/cost',id('dataset'),prop('entries'),id('cost/initial-program'));
const table=id('table/cost');ops.push(...Ops.entities.update({id:table,name:'Program resource cost'}).ops);
relation('table/cost/type',table,SystemIds.TYPES_PROPERTY,SystemIds.DATA_BLOCK);relation('table/cost/source',table,SystemIds.DATA_SOURCE_TYPE_RELATION_TYPE,SystemIds.COLLECTION_DATA_SOURCE);
const attachment=relation('dataset/cost-table',id('dataset'),SystemIds.BLOCKS,table,'a0');
relation('table/cost/view',attachment,SystemIds.VIEW_PROPERTY,SystemIds.TABLE_VIEW);
[prop('cost'),currency,prop('priceYear'),prop('denominator'),prop('locator')].forEach((p,i)=>relation(`table/cost/column/${i}`,attachment,SystemIds.PROPERTIES,p,`a${i}`));
relation('table/cost/item',table,SystemIds.COLLECTION_ITEM_RELATION_TYPE,id('cost/initial-program'),'a0');
notes('dataset',id('dataset'),`## Cost scope and comparison limits\n\nThe reported cost is **17,759 USD per child in 2006 prices**, undiscounted for the preschool program. It includes operating expenses (teachers and administration) and capital resources (classrooms and facilities), reported from Barnett (1996) by Heckman and colleagues. It is not a per-year cost.\n\nTax-financing assumptions alter economic costs and benefits. This initial resource cost is not the denominator for every published benefit/cost scenario. No standard error is reported for this cost.\n\n## Study and evidence coverage\n\n${source.context.population}; ${source.context.period}. Children entered at age ${source.context.entryAge}, with a planned ${source.context.plannedDurationYears}-year intervention: ${source.context.delivery}. Initial randomization was subsequently compromised by reassignment. Original sample size 123 does not establish the complete-case denominator for each outcome.\n\nObserved follow-ups and projected lifetime earnings are distinct evidence. Table 2 group means are descriptive, not adjusted causal contrasts; Table 1 economic estimates combine observations, imputations and projections through age 65.\n\nThis page currently presents the initial program cost. The extracted outcome and return tables are not yet included in this publication.\n\nSource: [${source.publication.title}](${source.publication.sourceUrl}), ${source.cost.locator}.`, 'a1');
notes('paper',id('paper'),`## Publication details\n\n${source.publication.authors.join('; ')}. ${source.publication.journal} ${source.publication.volume}(${source.publication.issues}), ${source.publication.pages} (${source.publication.year}).\n\nPublished DOI: ${source.publication.doi}. Working-paper version: https://doi.org/${source.publication.workingPaperDoi}. Values here follow the published author-hosted PDF.`, 'a0');
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes);
for(const op of encoded){assert(['updateEntity','createRelation'].includes(op.type)&&!op.unset?.length,'No deletes or unsets');if(op.type==='updateEntity')assert(encoded.some((r:any)=>r.type==='createRelation'&&r.from.$bytes===op.id.$bytes&&r.relationType.$bytes===SystemIds.TYPES_PROPERTY),'Every created entity typed');}
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Publish Perry Preschool program cost and study context',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,datasetId:id('dataset'),journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`,registry:registryPath};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
