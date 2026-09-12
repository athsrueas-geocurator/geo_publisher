import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {Ops,Position,SystemIds,type Op} from '@geoprotocol/geo-sdk';
import {EDUCATION_PUBLICATION} from '../src/education-bounty';

const root='data/education';
const registryPath=`${root}/nclb-registry.json`;
const registry:Record<string,string>=existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):{};
const id=(key:string)=>registry[key]??(registry[key]=randomUUID().replaceAll('-',''));
const rel=(key:string,from:string,type:string,to:string,ops:Op[])=>{
  const position=registry[`position/${key}`]??(registry[`position/${key}`]=Position.generate());
  ops.push(...Ops.relations.create({id:id(`edge/${key}`),entityId:id(`edge-entity/${key}`),fromEntity:from,type,toEntity:to,position}).ops);
};
const article='d83f04c4e8594faeb657a226c26c134c';
const initiative='ed3fbb4f693c4785955b627ea98c03fb';
const claims=[
  {
    key:'grade4-math',
    name:'Dee and Jacob estimated that NCLB increased average fourth-grade math performance by an effect size of 0.22 by 2007.',
    description:'Using state-level NAEP panel data and a comparative interrupted time-series design, the paper reports a statistically significant fourth-grade math increase by 2007. The abstract reports no standard error and does not further define the effect-size scale; retain it as source-reported rather than automatically normalize it.',
    value:'0.22',unit:'Effect size as reported in the NBER abstract; scale not further specified there.'
  },
  {
    key:'grade8-math',
    name:'Dee and Jacob found evidence that NCLB improved eighth-grade math achievement, especially for lower-achieving groups and lower percentiles.',
    description:'The source reports evidence of eighth-grade math improvement, particularly among traditionally low-achieving groups and at lower percentiles. The abstract does not supply a single estimate or standard error for this finding.',
  },
  {
    key:'reading',
    name:'Dee and Jacob found no evidence that NCLB increased fourth- or eighth-grade reading achievement.',
    description:'This is the paper’s reported null finding for reading in fourth and eighth grade under its comparative interrupted time-series analysis of NAEP state panels. It does not mean that every reading estimate was exactly zero.',
  }
];
const decimal=(property:string,value:string)=>{
  const [whole,fraction='']=value.split('.');
  return {property,type:'decimal' as const,exponent:-fraction.length,mantissa:{type:'i64' as const,value:BigInt(`${whole}${fraction}`)}};
};
const ops:Op[]=[];const records=[];
for(const row of claims){
  const claim=id(`claim/${row.key}`);
  const values:any[]=[{property:'da4a6c1f9d4446f9832ff3b49a4400ef',type:'boolean',value:true}];
  if(row.value)values.push(decimal('e500e2585a964d2c9df4a47b199616c3',row.value));
  if(row.unit)values.push({property:'8405509cc7354655a348591349a5f025',type:'text',value:row.unit});
  ops.push(...Ops.entities.update({id:claim,name:row.name,description:row.description,values}).ops);
  rel(`claim/${row.key}/type`,claim,SystemIds.TYPES_PROPERTY,'96f859efa1ca4b229372c86ad58b694b',ops);
  rel(`claim/${row.key}/source`,claim,'49c5d5e1679a4dbdbfd33f618f227c94',article,ops);
  rel(`claim/${row.key}/initiative`,claim,'dfa6aebe1ca94bf29faccc4cc7afb24c',initiative,ops);
  records.push({key:row.key,id:claim,value:row.value??null,unit:row.unit??null});
}
const bytes=JSON.stringify(ops,(_k,v)=>v instanceof Uint8Array?{$bytes:Buffer.from(v).toString('hex')}:typeof v==='bigint'?{$bigint:v.toString()}:v,2)+'\n';
const sha256=createHash('sha256').update(bytes).digest('hex');
const batch={name:'Add source-backed No Child Left Behind findings',spaceId:EDUCATION_PUBLICATION.spaceId,bounty:EDUCATION_PUBLICATION.bountyId,opsPath:`${root}/nclb-findings-ops.json`,sha256,journalPath:`${root}/nclb-findings-publication.json`,validationPath:`${root}/nclb-findings-validation.json`,article,initiative,records,operationCount:ops.length};
writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
writeFileSync(batch.opsPath,bytes);writeFileSync(`${root}/nclb-findings-batch.json`,JSON.stringify(batch,null,2)+'\n');
writeFileSync(batch.validationPath,JSON.stringify({checkedAt:new Date().toISOString(),ready:true,opsHash:sha256,checks:[
  'Every Claim is factual, typed, source-linked to the indexed NBER Article and related to the indexed NCLB Initiative.',
  'The sole numeric value is the abstract-reported 0.22 fourth-grade math effect size; no standard error or scale conversion is invented.',
  'Eighth-grade math and reading Claims preserve the abstract’s qualitative evidence/null wording without invented scalar values.',
  'The underlying Article and Initiative were independently indexed before this batch was built.',
  'No deletes; standard publication workflow adds a separate bounty-link proposal.'
]},null,2)+'\n');
console.log(JSON.stringify(batch,null,2));
