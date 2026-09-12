import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,SystemIds,ContentIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-background';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Existing journal: preserve payload');
const registry:Record<string,string>=read('reading-first-registry'),model=read('reading-first-program-model');
const imported=read('intake').records.find((r:any)=>r.collection==='sources'&&r.sourceKey==='src-014'),source=imported.publicationData;
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const ops:Op[]=[],checks:string[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const text=(property:string,value:string)=>({property,type:'text' as const,value});
function relation(key:string,from:string,type:string,to:string){ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,type,toEntity:to}).ops);}
check(imported.correction?.status==='reviewed-primary-publication-catalog-and-topic-summary','Reviewed source correction');
check(source.year==='2000'&&source.url==='https://www.nichd.nih.gov/publications/pubs/nrp/report','Reviewed report identity');
for(const [p,t] of [[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.DESCRIPTION_PROPERTY,'Text'],[ContentIds.WEB_URL_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.BLOCKS,'Relation'],['49c5d5e1679a4dbdbfd33f618f227c94','Relation']]){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Live datatype ${p}`);}
for(const [name,expected] of [[source.title,id('source/src-014')],['National Reading Panel: publication and scope',id('notes/src-014')]]){const r=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});check(!r.entitiesConnection.pageInfo.hasNextPage&&r.entitiesConnection.nodes.every((n:any)=>n.id===expected),`Cross-space exact name ${name}`);}
const notesState=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:10,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id:registry['notes/program'],space:target.spaceId}});
check(!notesState.entity.values.pageInfo.hasNextPage&&notesState.entity.values.nodes.some((v:any)=>v.propertyId===SystemIds.MARKDOWN_CONTENT&&v.text===model.markdown),'Existing program context unchanged');
const description='A 2000 synthesis of research on reading instruction, with detailed reports from the National Reading Panel subgroups. It is background literature, not the later evaluation of Reading First funding.';
ops.push(...Ops.entities.update({id:id('source/src-014'),name:source.title,description,values:[text(ContentIds.WEB_URL_PROPERTY,source.url)]}).ops);
relation('source/src-014/type',id('source/src-014'),SystemIds.TYPES_PROPERTY,ContentIds.ARTICLE_TYPE);
const markdown=`## Publication\n\n${source.authors}. April ${source.year}. NIH publication 00-4754. The official catalog identifies this as the full subgroup report; a shorter summary and a topic findings webpage are separate presentations of the panel's work.\n\n## Scope and interpretation\n\n${source.finding}\n\n${source.caveat}\n\nThe panel's topic-specific reviews are background for reading instruction. The Reading First impact study evaluates implementation of a later funding program, not a direct replication or test of every panel finding. No pooled effect sizes from the panel report have been extracted into this dataset.\n\n## Sources\n\n[Full report and chapters](${source.url}); [official publication catalog](https://www.nichd.nih.gov/publications/product/247); [topic findings](${imported.data.url}).`;
ops.push(...Ops.entities.update({id:id('notes/src-014'),name:'National Reading Panel: publication and scope',values:[text(SystemIds.MARKDOWN_CONTENT,markdown)]}).ops);
relation('notes/src-014/type',id('notes/src-014'),SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
relation('notes/src-014/attachment',id('source/src-014'),SystemIds.BLOCKS,id('notes/src-014'));
relation('program/background-source',registry.program!,'49c5d5e1679a4dbdbfd33f618f227c94',id('source/src-014'));
const addition=`\n\n## Background reading research\n\nThe [National Reading Panel subgroup report](${source.url}) is linked as background literature on reading instruction. It synthesizes earlier studies and is distinct from the national evaluation of Reading First funding. Its findings are not additional Reading First impact estimates.`;
ops.push(...Ops.entities.update({id:registry['notes/program']!,values:[text(SystemIds.MARKDOWN_CONTENT,model.markdown+addition)]}).ops);
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const encoded=JSON.parse(bytes);check(encoded.filter((o:any)=>o.type==='updateEntity').length===3,'Two entities and one reviewed context update');
check(encoded.every((o:any)=>['updateEntity','createRelation'].includes(o.type)&&!o.unset?.length),'No deletions');
for(const key of ['source/src-014','notes/src-014'])check(encoded.some((o:any)=>o.type==='createRelation'&&o.from.$bytes===id(key)&&o.relationType.$bytes===SystemIds.TYPES_PROPERTY),'New entity typed');
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Link National Reading Panel background source to Reading First',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,sourceId:id('source/src-014'),sourceKey:'src-014',sourceData:source,programId:registry.program,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/reading-first-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
