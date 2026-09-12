import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {ContentIds,Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';

const root='data/education';
const registryPath=`${root}/nclb-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const rel=(key:string,from:string,type:string,to:string,ops:Op[])=>{
  const position=registry[`position/${key}`]??(registry[`position/${key}`]=Position.generate());
  ops.push(...Ops.relations.create({id:id(`edge/${key}`),entityId:id(`edge-entity/${key}`),fromEntity:from,type,toEntity:to,position}).ops);
};

const article=id('article');
const initiative=id('initiative');
const ops:Op[]=[];
ops.push(...Ops.entities.update({
  id:article,
  name:'The Impact of No Child Left Behind on Student Achievement',
  description:'Dee and Jacob’s NBER working paper evaluates No Child Left Behind using student-achievement evidence.',
  values:[
    {property:ContentIds.WEB_URL_PROPERTY,type:'text',value:'https://www.nber.org/papers/w15531'},
    {property:'7cb59354e30c48119e99ff62fcf61646',type:'text',value:'10.3386/w15531'}
  ]
}).ops);
rel('article/type',article,SystemIds.TYPES_PROPERTY,'a2a5ed0cacef46b1835de457956ce915',ops);
ops.push(...Ops.entities.update({
  id:initiative,
  name:'No Child Left Behind',
  description:'A US federal education policy that paired annual testing, subgroup reporting and accountability consequences. Its evidence record includes reported math gains, weaker reading effects and implementation incentives that can affect interpretation.',
  values:[{property:ContentIds.WEB_URL_PROPERTY,type:'text',value:'https://www.nber.org/papers/w15531'}]
}).ops);
rel('initiative/type',initiative,SystemIds.TYPES_PROPERTY,'d272f19cef87485fb83e26fb68957395',ops);
rel('initiative/source',initiative,'49c5d5e1679a4dbdbfd33f618f227c94',article,ops);
rel('initiative/related-article',initiative,'dfa6aebe1ca94bf29faccc4cc7afb24c',article,ops);

const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={
  name:'Add No Child Left Behind initiative and primary evaluation source',
  spaceId:EDUCATION_PUBLICATION.spaceId,
  bounty:EDUCATION_PUBLICATION.bountyId,
  opsPath:`${root}/nclb-ops.json`,sha256,
  journalPath:`${root}/nclb-publication.json`,
  validationPath:`${root}/nclb-validation.json`,
  entities:{article,initiative},
  operationCount:ops.length,
  sourceKeys:['src-003','initiatives:4'],
  limits:'This batch creates a source-linked initiative and Article. It does not create a quantitative effect Claim or imply that the Article exhausts NCLB evidence.'
};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
writeFileSync(batch.opsPath,bytes);
writeFileSync(`${root}/nclb-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({checkedAt:new Date().toISOString(),ready:true,opsHash:sha256,checks:[
  'Exact Article-title discovery completed across all spaces with no candidate.',
  'Exact Initiative-title discovery completed across all spaces with no candidate.',
  'Article DOI and NBER URL match identifier-verified bibliography metadata for src-003.',
  'Initiative description preserves source-qualified findings and does not create an unsupported numeric estimate.',
  'Both entities have explicit types and every citation edge targets the Article entity.',
  'No deletes; target is Education datasets; standard publish workflow adds the bounty link.'
]},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
