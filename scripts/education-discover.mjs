import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const endpoint = 'https://api-testnet.geobrowser.io/graphql';
let terms = process.argv.slice(2);
const contains=terms.includes('--contains');
terms=terms.filter(t=>t!=='--contains');
if (terms[0] === '--intake') {
  const intake = JSON.parse(await readFile('data/education/intake.json', 'utf8'));
  const collections = terms.slice(1);
  terms = [...new Set(intake.records.filter(r => !collections.length || collections.includes(r.collection)).map(r => r.name))];
}
if (terms[0] === '--bibliography') {
  const reports=await Promise.all((await readdir('data/education/bibliography')).filter(x=>x.endsWith('.json')).map(x=>readFile(`data/education/bibliography/${x}`,'utf8').then(JSON.parse)));
  terms=[...new Set(reports.filter(r=>r.status==='identifier-verified-metadata').map(r=>r.metadata.title).filter(Boolean))];
}
if (terms[0] === '--taxonomy') {
  const intake=JSON.parse(await readFile('data/education/intake.json','utf8'));
  terms=[...new Set(intake.records.flatMap(r=>{
    const d=r.publicationData;
    const tags=typeof d.tags==='string'?d.tags.split(';').map(x=>x.trim()).filter(Boolean):d.tags??[];
    return [...(d.category?[d.category]:[]),...tags];
  }))];
}
if (!terms.length) throw new Error('Supply exact identity or ontology names.');
await mkdir('data/education/discovery', { recursive: true });
for (const term of terms) {
  const report = { term, endpoint, scope: `all spaces; ${contains?'substring':'exact'} case-insensitive primary name`, checkedAt: new Date().toISOString(), complete: false, nodes: [], pages: [] };
  let after = null;
  try {
    do {
      const query = `query Identity($name:String!,$after:Cursor) { entitiesConnection(first:5,after:$after,filter:{name:{${contains?'includesInsensitive':'isInsensitive'}:$name}}) { nodes { id name description spaceIds types { id name } } pageInfo { hasNextPage endCursor } } }`;
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables: { name: term, after } }), signal: AbortSignal.timeout(35000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.errors?.length) throw new Error(JSON.stringify(result.errors));
      const connection = result.data?.entitiesConnection;
      if (!connection || !Array.isArray(connection.nodes) || typeof connection.pageInfo?.hasNextPage !== 'boolean') throw new Error('Malformed connection');
      report.nodes.push(...connection.nodes);
      report.pages.push(connection.pageInfo);
      if (!connection.pageInfo.hasNextPage) { report.complete = true; break; }
      if(report.pages.length>=40)throw new Error('Discovery page limit reached; identity remains unresolved');
      const next = connection.pageInfo.endCursor;
      if (!next || next === after) throw new Error('Missing or repeated cursor');
      after = next;
    } while (true);
  } catch (error) { report.error = error.message; }
  const filename = (contains?'contains-':'')+term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Preserve distinct probes whose punctuation collapses to the same readable slug.
  const identityHash=createHash('sha256').update(JSON.stringify({contains,term})).digest('hex').slice(0,16);
  await writeFile(`data/education/discovery/${filename}-${identityHash}.json`, JSON.stringify(report, null, 2) + '\n');
  const legacyPath=`data/education/discovery/${filename}.json`;
  let prior;
  try { prior=JSON.parse(await readFile(legacyPath,'utf8')); }
  catch(error) { if(error.code!=='ENOENT')throw error; }
  if(!prior || prior.term===term) await writeFile(legacyPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ term, complete: report.complete, candidateCount: report.nodes.length, error: report.error }));
}
