import { readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
const root = 'data/education';
const read = async file => JSON.parse(await readFile(`${root}/source/${file}`, 'utf8'));
const manifest = await read('manifest.json');
for (const file of manifest.files) {
  const bytes = await readFile(`${root}/source/${file.path}`);
  if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Snapshot hash mismatch: ${file.path}`);
}
const collections = {};
for (const name of ['initiatives','sources','dichotomies','methods','glossary','landing-cards']) collections[name] = await read(`content/${name}.json`);
collections.datasets = await read('research-data/dataset-catalog.json');
const profiles = await read('research-data/dataset-profiles.json');
const datasetLinks = await read('research-data/initiative-dataset-links.json');
const corrections = JSON.parse(await readFile(`${root}/source-corrections.json`,'utf8'));
if(corrections.sourceCommit!==manifest.commit)throw new Error('Corrections refer to another source revision');
let cards;
try { cards = JSON.parse(await readFile(`${root}/landing-card-registry.json`,'utf8')); } catch(e) { if(e.code!=='ENOENT') throw e; cards=[]; }
for (const card of collections['landing-cards']) {
  if (!cards.some(x => x.initialClaim === card.claim)) cards.push({ sourceKey:randomUUID(), initialClaim:card.claim });
}
if (cards.some(x => !collections['landing-cards'].some(card => card.claim === x.initialClaim))) throw new Error('Landing-card text changed or a card was removed: explicitly reconcile the registry before intake.');
const keyFor = {
  initiatives:r=>String(r.id), sources:r=>r.id, dichotomies:r=>r.slug,
  methods:r=>JSON.stringify([r.section,r.item]), glossary:r=>JSON.stringify([r.section,r.term]),
  'landing-cards':r=>cards.find(x=>x.initialClaim===r.claim).sourceKey, datasets:r=>r.id,
};
const records=[];
for(const [collection,rows] of Object.entries(collections)) {
  const seen=new Set();
  for(const [order, row] of rows.entries()) {
    const key=keyFor[collection](row);
    if(seen.has(key)) throw new Error(`Duplicate source key: ${collection}/${key}`);
    seen.add(key);
    const correction=collection==='sources'?corrections.corrections.find(x=>x.sourceKey===key):null;
    if(correction&&correction.originalUrl!==row.url)throw new Error(`Correction precondition mismatch: ${key}`);
    const publicationData=correction?{...row,...correction.replacement}:row;
    records.push({ collection, sourceKey:key, sourceOrder:order, name:publicationData.name??publicationData.title??publicationData.item??publicationData.term??publicationData.claim, aliases:row.slug?[row.slug]:[], sourcePath:collection==='datasets'?'research-data/dataset-catalog.json':`content/${collection}.json`, data:row, publicationData, correction:correction??null });
  }
}
const references=[];
const resolve=(collection,key,field)=>{
  const found=records.find(r=>r.collection===collection&&(r.sourceKey===key||r.data[field]===key));
  if(!found) throw new Error(`Dangling reference: ${collection}/${key}`);
  return `${collection}/${found.sourceKey}`;
};
for(const r of records) {
  const from=`${r.collection}/${r.sourceKey}`;
  for(const [field, collection, lookup] of [['sourceIds','sources','id'],['relatedDichotomySlugs','dichotomies','slug'],['keyInitiativeSlugs','initiatives','slug']]) {
    for(const [order, id] of (r.data[field]??[]).entries()) references.push({from,field,order,to:resolve(collection,id,lookup)});
  }
  if(r.data.dichotomySlug) references.push({from,field:'dichotomySlug',order:0,to:resolve('dichotomies',r.data.dichotomySlug,'slug')});
  const c=r.data.continuum;
  if(c && !(0<=c.uncertaintyLow && c.uncertaintyLow<=c.position && c.position<=c.uncertaintyHigh && c.uncertaintyHigh<=100)) throw new Error(`Invalid editorial continuum: ${from}`);
}
for(const [order, link] of datasetLinks.entries()) references.push({from:resolve('initiatives',link.initiativeSlug,'slug'),to:resolve('datasets',link.datasetId,'id'),field:'datasetContext',order,role:link.role,use:link.use});
for(const p of profiles.profiles) resolve('datasets',p.datasetId,'id');
const urls=new Map();
for(const r of records.filter(r=>r.collection==='sources')) {
  const url=new URL(r.data.url); url.hash='';
  const normalized=url.toString().replace(/\/$/,'').toLowerCase();
  urls.set(normalized,[...(urls.get(normalized)??[]),r.sourceKey]);
}
const report={sourceCommit:manifest.commit,targetSpaceId:manifest.targetSpaceId,counts:Object.fromEntries(Object.entries(collections).map(([k,v])=>[k,v.length])),records:records.length,references:references.length,profileRecords:profiles.profiles.length,datasetContextLinks:datasetLinks.length,duplicateSourceUrls:[...urls].filter(([,ids])=>ids.length>1).map(([url,sourceKeys])=>({url,sourceKeys})),geoMappingComplete:false,published:false};
await writeFile(`${root}/landing-card-registry.json`,JSON.stringify(cards,null,2)+'\n');
await writeFile(`${root}/intake.json`,JSON.stringify({report,records,references,profiles},null,2)+'\n');
await writeFile(`${root}/intake-report.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
