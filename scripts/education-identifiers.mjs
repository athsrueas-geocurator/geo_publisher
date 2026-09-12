import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const endpoint='https://api-testnet.geobrowser.io/graphql';
const intake=JSON.parse(await readFile('data/education/intake.json','utf8'));
const explicitUrls=process.argv.slice(2);
const records=explicitUrls.length
  ? explicitUrls.map((url,index)=>({collection:'manual',sourceKey:`${index}-${new URL(url).pathname.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}`,data:{url}}))
  : intake.records.filter(r=>['sources','datasets'].includes(r.collection));
await mkdir('data/education/identifiers',{recursive:true});
for(const record of records) {
  const urls=[...new Set([record.data.url,record.data.sourceUrl,record.data.accessUrl].filter(Boolean))];
  const report={sourceKey:`${record.collection}/${record.sourceKey}`,checkedAt:new Date().toISOString(),scope:'all spaces; URL host/path or DOI substring in text values; no property restriction',probes:[],decision:'unresolved'};
  for(const url of urls) {
    const parsed=new URL(url);
    const needle=(parsed.hostname==='doi.org'?decodeURIComponent(parsed.pathname.slice(1)):parsed.hostname+parsed.pathname).replace(/\/$/,'');
    const probe={url,needle,complete:false,nodes:[],pages:[]}; report.probes.push(probe);
    let after=null;
    try {
      while(true) {
        const query=`query Identifier($text:String!,$after:Cursor) { valuesConnection(first:5,after:$after,filter:{text:{includesInsensitive:$text}}) { nodes { entity { id name } property { id name } spaceId text } pageInfo { hasNextPage endCursor } } }`;
        const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables:{text:needle,after}}),signal:AbortSignal.timeout(35000)});
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const result=await res.json();
        if(result.errors?.length) throw new Error(JSON.stringify(result.errors));
        const c=result.data?.valuesConnection;
        if(!Array.isArray(c?.nodes)||typeof c.pageInfo?.hasNextPage!=='boolean') throw new Error('Malformed connection');
        probe.nodes.push(...c.nodes);probe.pages.push(c.pageInfo);
        if(!c.pageInfo.hasNextPage){probe.complete=true;break;}
        if(!c.pageInfo.endCursor||c.pageInfo.endCursor===after)throw new Error('Missing/repeated cursor');
        after=c.pageInfo.endCursor;
        if(probe.nodes.length>=1000)throw new Error('Broad identifier query requires narrower matching; not proof of absence');
      }
    }catch(error){probe.error=error.message;}
  }
  const base=`data/education/identifiers/${record.collection}-${record.sourceKey}`;
  const identityHash=createHash('sha256').update(JSON.stringify(urls)).digest('hex').slice(0,16);
  const path=`${base}-${identityHash}.json`;
  await writeFile(path,JSON.stringify(report,null,2)+'\n');
  // Preserve old consumer paths only when they describe the same identifiers.
  let previous=null;
  try { previous=JSON.parse(await readFile(`${base}.json`,'utf8')); }
  catch(error) { if(error.code!=='ENOENT')throw error; }
  if(!previous||JSON.stringify(previous.probes.map(p=>p.url))===JSON.stringify(urls))await writeFile(`${base}.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({key:report.sourceKey,path,complete:report.probes.every(p=>p.complete),candidates:report.probes.reduce((n,p)=>n+p.nodes.length,0)}));
}
