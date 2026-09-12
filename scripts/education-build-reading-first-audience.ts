import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',prefix='reading-first-audience',read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
if(existsSync(`${root}/${prefix}-publication.json`))throw new Error('Existing journal: reconcile without rebuilding');
const registry:Record<string,string>=read('reading-first-registry'),star=read('star-experimental-registry'),source=read('reading-first-extraction');
const demographic='07546da1a8a04c0d8e0dac5351dcb25b',children='561872867e1b4b80a5f37ddeb27570b5';
const ops:Op[]=[],checks:string[]=[];
function check(ok:unknown,label:string){if(!ok)throw new Error(label);checks.push(label);}
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
function relation(key:string,from:string,type:string,to:string,position?:string){registry[`position/${key}`]??=position??Position.generate();ops.push(...Ops.relations.create({id:id(`relation/${key}`),entityId:id(`relation-entity/${key}`),fromEntity:from,type,toEntity:to,position:registry[`position/${key}`]}).ops);}
check(createHash('sha256').update(readFileSync('tmp/pdfs/reading-first-2008.pdf')).digest('hex')===source.publication.pdfSha256,'Reviewed primary report unchanged');
for(const [p,t] of [[demographic,'Relation'],[star['property/grades'],'Relation'],[SystemIds.BLOCKS,'Relation'],[SystemIds.TYPES_PROPERTY,'Relation'],[SystemIds.NAME_PROPERTY,'Text'],[SystemIds.MARKDOWN_CONTENT,'Text']]){const r=await gql<any>('query($id:UUID!){property(id:$id){dataTypeName}}',{variables:{id:p}});check(r.property?.dataTypeName===t,`Live datatype ${p}`);}
const state=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){relations(first:30,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId}pageInfo{hasNextPage}}}}',{variables:{id:registry.program,space:target.spaceId}});
check(state.entity&&!state.entity.relations.pageInfo.hasNextPage,'Complete current program relationships');
check(!state.entity.relations.nodes.some((r:any)=>[demographic,star['property/grades']].includes(r.typeId)),'Audience facts not already published');
const targets=[{id:children,type:'3c60617f2cde43fb8bf386a9a68d3ee9',name:'Children'},...['K','1','2','3'].map(g=>({id:star[`grade/${g}`],type:'5ef5a5860f274d8e8f6c59ae5b3e89e2',name:g}))];
for(const t of targets){const r=await gql<any>('query($id:UUID!){entity(id:$id){id name types{id}}}',{variables:{id:t.id}});check(r.entity?.id===t.id&&r.entity.types.some((v:any)=>v.id===t.type),`Existing typed audience target ${t.name}`);}
relation('program/audience/children',registry.program!,demographic,children);
let previous:string|null=null;
for(const g of ['K','1','2','3']){const position=Position.generateBetween(previous,null);relation(`program/grade/${g}`,registry.program!,star['property/grades'],star[`grade/${g}`],position);previous=registry[`position/program/grade/${g}`]!;}
const name='Reading First intended audience and exposure';
const matches=await gql<any>('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}',{variables:{name}});
check(!matches.entitiesConnection.pageInfo.hasNextPage&&matches.entitiesConnection.nodes.every((n:any)=>n.id===id('notes/audience')),'Cross-space audience block identity');
const markdown='## Intended audience and funding priority\n\nReading First was intended to support reading instruction from kindergarten through third grade. The Children demographic and grade links identify the intended learners; they do not mean every child or school qualified for a grant. Districts and schools with greater reading-proficiency and poverty-related need were intended to receive funding priority.\n\n## Intended coverage and actual exposure\n\nThe intended four-grade span is distinct from each student’s actual exposure. The report describes student mobility and differences in program timing that limited full exposure for some study participants. The evaluation sample, outcome-specific grade coverage and measured follow-up periods remain separate from program eligibility.\n\nSource: [Reading First Impact Study Final Report](https://ies.ed.gov/sites/default/files/migrated/nces_pubs/ncee/pdf/20094038.pdf), Executive Summary, printed p. xvii (PDF p. 18), and Chapter 3, printed p. 30 (PDF p. 59).';
ops.push(...Ops.entities.update({id:id('notes/audience'),name,values:[{property:SystemIds.MARKDOWN_CONTENT,type:'text',value:markdown}]}).ops);
relation('notes/audience/type',id('notes/audience'),SystemIds.TYPES_PROPERTY,SystemIds.TEXT_BLOCK);
relation('notes/audience/attachment',registry.program!,SystemIds.BLOCKS,id('notes/audience'));
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n',encoded=JSON.parse(bytes);
check(encoded.filter((o:any)=>o.type==='updateEntity').length===1,'Only one reader context block created');
check(encoded.filter((o:any)=>o.type==='createRelation'&&o.relationType.$bytes===star['property/grades']).length===4,'Four grade relations');
check(encoded.every((o:any)=>!o.unset?.length&&['updateEntity','createRelation'].includes(o.type)),'No removals or replacements');
const sha256=createHash('sha256').update(bytes).digest('hex'),batch={name:'Add Reading First intended population and grade coverage',spaceId:target.spaceId,bounty:target.bountyId,opsPath:`${root}/${prefix}-ops.json`,sha256,operationCount:ops.length,programId:registry.program,journalPath:`${root}/${prefix}-publication.json`,validationPath:`${root}/${prefix}-validation.json`};
writeFileSync(`${root}/reading-first-registry.json`,JSON.stringify(registry,null,2)+'\n');writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/${prefix}-batch.json`,JSON.stringify(batch,null,2)+'\n');writeFileSync(batch.validationPath,JSON.stringify({ready:true,checkedAt:new Date().toISOString(),opsHash:sha256,checks},null,2)+'\n');console.log(JSON.stringify(batch));
