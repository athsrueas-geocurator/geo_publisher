import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {gql} from '../src/functions';
const root='data/education';
const batchArg=process.argv.indexOf('--batch');
const batch=JSON.parse(readFileSync(batchArg>=0?process.argv[batchArg+1]!:`${root}/saga-batch.json`,'utf8'));
let ops=JSON.parse(readFileSync(batch.opsPath,'utf8'));
if(batchArg<0){
  for(const prefix of ['saga-display','saga-column']){
    const journalPath=`${root}/${prefix}-publication.json`;
    if(existsSync(journalPath)&&JSON.parse(readFileSync(journalPath,'utf8')).chainVerification?.information?.[0]===true){
      ops.push(...JSON.parse(readFileSync(`${root}/${prefix}-ops.json`,'utf8')));
    }
  }
  const values=new Map<string,any>();const relations=new Map<string,any>();
  for(const op of ops){
    if(op.type==='updateEntity')for(const set of op.set)values.set(`${op.id.$bytes}/${set.property.$bytes}`,{type:'updateEntity',id:op.id,set:[set]});
    else if(op.type==='createRelation'||op.type==='deleteRelation')relations.set(op.id.$bytes,op);
    else throw new Error(`Unsupported verification operation: ${op.type}`);
  }
  ops=[...values.values(),...relations.values()];
}
const j=JSON.parse(readFileSync(batch.journalPath??`${root}/saga-publication.json`,'utf8'));
const checks:any[]=[];
function decimalText(value:any):string{
  const mantissa=BigInt(value.mantissa.value.$bigint);
  const negative=mantissa<0n;const digits=String(negative?-mantissa:mantissa);
  const e=value.exponent;
  if(e>=0)return `${negative?'-':''}${digits}${'0'.repeat(e)}`;
  const padded=digits.padStart(-e+1,'0');
  return `${negative?'-':''}${padded.slice(0,e)}.${padded.slice(e)}`.replace(/0+$/,'').replace(/\.$/,'');
}
for(const op of ops.filter((o:any)=>o.type==='deleteRelation')){
  const {relations}=await gql('query($id:UUID!){relations(filter:{id:{is:$id}}){id spaceId}}',{id:op.id.$bytes});
  checks.push({deletedRelationId:op.id.$bytes,pass:!relations.some((r:any)=>r.spaceId===j.spaceId)});
}
const ids=[...new Set<string>(ops.filter((o:any)=>o.type!=='deleteRelation').map((o:any)=>o.type==='updateEntity'?o.id.$bytes:o.from.$bytes))];
for(const id of ids){
  const entity:any={values:{nodes:[]},relations:{nodes:[]}};
  for(const kind of ['values','relations'] as const){
    let after:string|null=null;const cursors=new Set<string>();
    const fields=kind==='values'?'propertyId spaceId text decimal integer boolean':'id entityId fromEntityId toEntityId typeId spaceId position';
    do{
      const result:any=await gql(`query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){${kind}(first:50,after:$after,filter:{spaceId:{is:$space}}){nodes{${fields}} pageInfo{hasNextPage endCursor}}}}`,{id,space:j.spaceId,after});
      if(!result.entity)throw new Error(`Entity missing: ${id}`);
      const page:any=result.entity[kind];entity[kind].nodes.push(...page.nodes);
      if(page.pageInfo.hasNextPage){
        if(!page.pageInfo.endCursor||cursors.has(page.pageInfo.endCursor))throw new Error(`Incomplete verification: ${id}/${kind}`);
        cursors.add(page.pageInfo.endCursor);after=page.pageInfo.endCursor;
      }else after=null;
    }while(after);
  }
  for(const op of ops.filter((o:any)=>o.type==='updateEntity'&&o.id.$bytes===id))for(const set of op.set){
    const expected=set.value.type==='decimal'?decimalText(set.value):set.value.value;
    const found=entity.values.nodes.some((v:any)=>v.spaceId===j.spaceId&&v.propertyId===set.property.$bytes&&String(v[set.value.type])===String(expected?.$bigint??expected));
    checks.push({entityId:id,propertyId:set.property.$bytes,pass:found});
  }
  for(const op of ops.filter((o:any)=>o.type==='createRelation'&&o.from.$bytes===id)){
    // Unordered SDK relations omit position; the API serializes that absence as null.
    // Explicit positions still require exact equality, including the empty string.
    const expectedPosition=op.position??null;
    const found=entity.relations.nodes.some((r:any)=>r.id===op.id.$bytes&&r.entityId===op.entity.$bytes&&r.spaceId===j.spaceId&&r.fromEntityId===id&&r.toEntityId===op.to.$bytes&&r.typeId===op.relationType.$bytes&&r.position===expectedPosition);
    checks.push({relationId:op.id.$bytes,pass:found});
  }
}
const result=await gql(`query($id:UUID!){proposals(condition:{id:$id}){id executedAt currentVersion} entity(id:$id){relations(first:20){nodes{id typeId toEntityId spaceId} pageInfo{hasNextPage}}}}`,{id:j.proposalId});
checks.push({requirement:'Proposal executed',pass:!!result.proposals[0]?.executedAt});
checks.push({requirement:'Bounty link indexed',pass:result.entity?.relations.nodes.some((r:any)=>r.id===j.linkIds.submissionRelationId&&r.typeId==='3b4c516ff3ac41e0a939374119a27d6e'&&r.toEntityId===j.bountyId&&r.spaceId===j.bounty.prepared.spaceId)});
const report={checkedAt:new Date().toISOString(),batchName:batch.name,scope:'All supplied batch values and relation IDs/endpoints/positions in the destination space, executed proposal, indexed bounty link',entityCount:ids.length,checks,passed:checks.every(c=>c.pass)};
writeFileSync(batch.journalPath?batch.journalPath.replace('-publication.json','-index-verification.json'):`${root}/saga-index-verification.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,entities:ids.length,checks:checks.length,failed:checks.filter(c=>!c.pass)},null,2));
if(!report.passed)process.exitCode=1;
