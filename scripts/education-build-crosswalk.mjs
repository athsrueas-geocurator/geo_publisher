import {readFile,writeFile} from 'node:fs/promises';

const intake=JSON.parse(await readFile('data/education/intake.json','utf8'));
const key=(record)=>`${record.collection}:${record.sourceKey}`;
const urlOf=(data)=>data.url??data.website??data.link??null;
const doiOf=(data)=>data.doi??(typeof data.url==='string'&&/doi\.org\//i.test(data.url)?data.url.replace(/^https?:\/\/doi\.org\//i,''):null);
const rows=intake.records.map(record=>({
  migrationKey:key(record),
  collection:record.collection,
  sourceKey:String(record.sourceKey),
  sourcePath:record.sourcePath,
  sourceOrder:record.sourceOrder,
  name:record.name,
  aliases:record.aliases,
  url:urlOf(record.publicationData),
  doi:doiOf(record.publicationData),
  candidateGeoIds:[],
  candidateSpaces:[],
  identityEvidence:[],
  targetSpaceChanges:[],
  decision:'unresolved-discovery',
  decisionRationale:'Await graph-wide, paginated identity discovery. A destination-only miss does not authorize entity creation.',
  lastCheckedAt:null
}));

const verifiedSourceReuse={
  'src-003':{
    geoId:'d83f04c4e8594faeb657a226c26c134c',
    evidence:'Exact-title graph-wide discovery found no Article; DOI 10.3386/w15531 and NBER URL were identifier-verified before the source Article was published and indexed in Education datasets.',
    changes:'Reuse the newly published Article for every future citation to this source; do not create another Article from the URL-derived source label.'
  },
  'src-014':{
    geoId:'bb326cc9809b4bf89d161701f49b74d9',
    evidence:'Published destination-space Article has the National Reading Panel report’s full title and describes it as background literature; the source URL is the official NICHD findings page for that report.',
    changes:'Reuse the Article for background-reading citations; keep it distinct from the Reading First funding evaluation and its impact findings.'
  },
  'src-015':{
    geoId:'db0ea33548454e1780c78231066b7d71',
    evidence:'Published destination-space Article “Reading First Impact Study Final Report”; exact report identity confirmed by prior all-space discovery and source URL review.',
    changes:'Reuse the Article for citations; preserve the source record’s editorial finding and caveat as migration-owned content.'
  }
};
for(const row of rows){
  const reuse=verifiedSourceReuse[row.sourceKey];
  if(!reuse) continue;
  row.candidateGeoIds.push(reuse.geoId);
  row.candidateSpaces.push(intake.report.targetSpaceId);
  row.identityEvidence.push(reuse.evidence);
  row.targetSpaceChanges.push(reuse.changes);
  row.decision='reuse-with-target-space-additions';
  row.decisionRationale='A verified published Article supplies the shared citation identity; source-specific editorial content remains a separate migration concern.';
  row.lastCheckedAt='2026-09-12T03:40:00.000Z';
}
for(const row of rows.filter(row=>row.collection==='initiatives'&&row.sourceKey==='4')){
  row.candidateGeoIds.push('ed3fbb4f693c4785955b627ea98c03fb');
  row.candidateSpaces.push(intake.report.targetSpaceId);
  row.identityEvidence.push('Exact-title graph-wide discovery found no Initiative; the source-backed NCLB Initiative was published and indexed in Education datasets.');
  row.targetSpaceChanges.push('Use this Initiative ID for future NCLB source, claim, method and comparison relations.');
  row.decision='created-target-space';
  row.decisionRationale='A complete discovery found no semantically matching Initiative. Creation is backed by the pinned source and an indexed, bounty-linked proposal.';
  row.lastCheckedAt='2026-09-12T03:40:00.000Z';
}

// The same DOI appears under two source keys. Keep both editorial records while forcing
// a single shared-publication identity decision before any relation targets are emitted.
for(const row of rows.filter(row=>row.doi==='10.3386/w27476')){
  row.candidateGeoIds.push('76f18ade420143779ca3c67183dc1dd8');
  row.candidateSpaces.push('dac259bad48a11adf97fe36857d85206');
  row.identityEvidence.push('Exact DOI 10.3386/w27476; published Article identity verified in the destination space.');
  row.targetSpaceChanges.push('Reuse the shared Article for source relations; retain this source record’s separate editorial finding and caveat.');
  row.decision='reuse-with-target-space-additions';
  row.decisionRationale='Exact DOI and published destination-space Article establish a shared identity; editorial source records still need their own provenance and finding treatment.';
  row.lastCheckedAt='2026-09-12T03:30:00.000Z';
}
const report={
  generatedAt:new Date().toISOString(),
  sourceCommit:intake.report.sourceCommit,
  targetSpaceId:intake.report.targetSpaceId,
  bounty:{id:'debce2de46094f299ee8e89fe244a9dc',spaceId:'ec349623f33236aee13c12dcd629ee81'},
  rows,
  summary:Object.fromEntries([...new Set(rows.map(row=>row.collection))].map(collection=>[collection,rows.filter(row=>row.collection===collection).length])),
  publicationReady:false,
  nextGate:'Perform graph-wide candidate discovery, record evidence and spaces for every row, then generate only the reviewed idempotent operations.'
};
await writeFile('data/education/source-to-geo-crosswalk.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({rows:rows.length,summary:report.summary,decisions:Object.fromEntries([...new Set(rows.map(row=>row.decision))].map(decision=>[decision,rows.filter(row=>row.decision===decision).length]))},null,2));
