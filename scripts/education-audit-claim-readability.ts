import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {SystemIds} from '@geoprotocol/geo-sdk';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
import {EDUCATION_PUBLICATION as target} from '../src/education-bounty';
const root='data/education',ids=new Map<string,string[]>();
for(const file of readdirSync(root).filter(f=>f.endsWith('-batch.json'))){
 const batch=JSON.parse(readFileSync(`${root}/${file}`,'utf8'));
 const journal=batch.journalPath??(file==='saga-batch.json'?`${root}/saga-publication.json`:'');
 if(batch.spaceId!==target.spaceId||!journal||!existsSync(journal)||JSON.parse(readFileSync(journal,'utf8')).chainVerification?.information?.[0]!==true)continue;
 for(const op of JSON.parse(readFileSync(batch.opsPath,'utf8'))){
  if(op.type==='createRelation'&&op.relationType.$bytes===SystemIds.TYPES_PROPERTY&&op.to.$bytes==='96f859efa1ca4b229372c86ad58b694b')ids.set(op.from.$bytes,[...(ids.get(op.from.$bytes)??[]),file]);
 }
}
const rows:any[]=[],entries=[...ids.entries()];
for(let start=0;start<entries.length;start+=5){
 const results=await Promise.all(entries.slice(start,start+5).map(async([id,batches])=>{
  const data=await gql<any>('query($id:UUID!,$space:UUID!){entity(id:$id){id values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}',{variables:{id,space:target.spaceId}});
  if(!data.entity||data.entity.values.pageInfo.hasNextPage)throw new Error(`Incomplete claim read ${id}`);
  const v=(p:string)=>data.entity.values.nodes.find((v:any)=>v.propertyId===p)?.text??'',name=v(SystemIds.NAME_PROPERTY),description=v(SystemIds.DESCRIPTION_PROPERTY);
  // These flags nominate manual review; they cannot prove that a proposition is scientifically justified.
  const flags:string[]=[];
  if(!/\b(estimated|estimate|reported|reports|found|finds|increased|reduced|higher|lower|cost|costs|required|assigned|showed|should|was|were|is|are|has|had|improved|earned|graduated)\b/i.test(name))flags.push('Title may label a record rather than state a finding');
  if(/^(First-year trial estimate|Preferred instrumental-variable coefficient)/.test(description))flags.push('Generic description may omit interpretation');
  if(description.length>350)flags.push('Description exceeds editorial review threshold');
  return {id,name,description,batches,flags};
 }));rows.push(...results);
}
const report={checkedAt:new Date().toISOString(),scope:'Current destination-space titles/descriptions for every Claim explicitly typed by an executed education batch; heuristic flags require source-aware human review',count:rows.length,flagged:rows.filter(r=>r.flags.length).length,rows};
writeFileSync(`${root}/claim-readability-audit.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,flagged:report.flagged,byBatch:Object.fromEntries([...new Set(rows.flatMap(r=>r.batches))].map(b=>[b,rows.filter(r=>r.batches.includes(b)&&r.flags.length).length]))},null,2));
