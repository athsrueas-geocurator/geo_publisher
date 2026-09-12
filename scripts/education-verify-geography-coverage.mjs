import {writeFileSync} from 'node:fs';
const endpoint='https://api-testnet.geobrowser.io/graphql';
const spaceId='dac259bad48a11adf97fe36857d85206';
const locationType='95d770021faf4f7cb7deb21a7d48cda0';
const query=`query($space:UUID!,$type:UUID!,$after:Cursor){relationsConnection(first:100,after:$after,filter:{spaceId:{is:$space},typeId:{is:$type}}){nodes{id fromEntity{id name} toEntity{id name}} pageInfo{hasNextPage endCursor}}}`;
const rows=[]; let after=null; let hasNextPage=true;
while(hasNextPage){
  const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,variables:{space:spaceId,type:locationType,after}})});
  const body=await res.json();
  if(body.errors) throw new Error(JSON.stringify(body.errors));
  rows.push(...body.data.relationsConnection.nodes); ({hasNextPage}=body.data.relationsConnection.pageInfo); after=body.data.relationsConnection.pageInfo.endCursor;
}
const byLocation=Object.fromEntries([...new Set(rows.map(r=>r.toEntity.name))].sort().map(name=>[name,rows.filter(r=>r.toEntity.name===name).length]));
const report={checkedAt:new Date().toISOString(),spaceId,relationType:locationType,count:rows.length,hasNextPage:false,byLocation,rows};
writeFileSync('data/education/geography-coverage-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:rows.length,hasNextPage:report.hasNextPage,byLocation},null,2));
