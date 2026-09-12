import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const endpoint='https://api-testnet.geobrowser.io/graphql';
const terms=process.argv.slice(2);
if(!terms.length)throw new Error('Supply property names or synonym fragments');
await mkdir('data/education/property-discovery',{recursive:true});
for(const term of terms){
  const report={term,checkedAt:new Date().toISOString(),endpoint,
    scope:'all spaces; Property type; case-insensitive name substring; cursor pagination',
    complete:false,nodes:[],pages:[]};
  let after=null;
  try{
    while(true){
      const query=`query($term:String!,$after:Cursor){entitiesConnection(typeId:"808a04ceb21c4d888ad12e240613e5ca",first:5,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds}pageInfo{hasNextPage endCursor}}}`;
      const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables:{term,after}}),signal:AbortSignal.timeout(35000)});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const payload=await res.json();
      if(payload.errors?.length)throw new Error(JSON.stringify(payload.errors));
      const page=payload.data?.entitiesConnection;
      if(!Array.isArray(page?.nodes)||typeof page.pageInfo?.hasNextPage!=='boolean')throw new Error('Malformed connection');
      report.nodes.push(...page.nodes);report.pages.push(page.pageInfo);
      if(!page.pageInfo.hasNextPage){report.complete=true;break;}
      if(!page.pageInfo.endCursor||page.pageInfo.endCursor===after||report.pages.length>=40)throw new Error('Incomplete pagination');
      after=page.pageInfo.endCursor;
    }
  }catch(error){report.error=error.message;}
  const hash=createHash('sha256').update(term).digest('hex').slice(0,16);
  const path=`data/education/property-discovery/${term.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${hash}.json`;
  await writeFile(path,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({term,complete:report.complete,nodes:report.nodes,error:report.error,path}));
}
