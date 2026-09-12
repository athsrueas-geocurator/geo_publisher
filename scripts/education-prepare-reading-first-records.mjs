import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='data/education',bytes=readFileSync(`${root}/reading-first-extraction.json`);
const source=JSON.parse(bytes),pilot=JSON.parse(readFileSync(`${root}/reading-first-pilot-batch.json`,'utf8'));
const sourceHash=createHash('sha256').update(bytes).digest('hex');
if(sourceHash!==pilot.sourceHash)throw new Error('Source changed since reviewed pilot; reconcile before expansion');
const records=[];
for(const row of source.records){
  for(const representation of ['native','standardized']){
    const value=row[representation];if(value===null)continue;
    for(const n of [value.value,value.standardError,value.confidenceInterval?.lower,value.confidenceInterval?.upper].filter(n=>n!=null))if(!/^-?\d+(\.\d+)?$/.test(n))throw new Error(`Invalid decimal: ${row.key}`);
    records.push({key:`${row.key}/${representation}`,contrastKey:row.key,representation,
      domain:row.domain,measure:row.measure,instrument:row.instrument,analysisLevel:row.analysisLevel,
      grade:row.grade,followup:row.followup,value:value.value,unit:value.unit,standardError:value.standardError,
      confidenceInterval:value.confidenceInterval,normalization:value.normalization??null,pValue:row.pValue,
      pairedKey:row.standardized?`${row.key}/${representation==='native'?'standardized':'native'}`:null,
      sourceLocations:row.sourceLocations,outcomeSampleSize:null});
  }
}
if(records.length!==63||new Set(records.map(r=>r.key)).size!==63)throw new Error('Expected 63 unique representations');
for(const r of records.filter(r=>r.pairedKey)){
  const pair=records.find(p=>p.key===r.pairedKey);
  if(pair?.pairedKey!==r.key||pair?.contrastKey!==r.contrastKey||pair?.grade!==r.grade||pair?.representation===r.representation)throw new Error(`Invalid pair: ${r.key}`);
}
const result={preparedAt:new Date().toISOString(),sourceHash,status:'63 source-backed representations; only pilot publication confirmed by this preparation',
  contrastCount:33,representationCount:63,pairedContrastCount:30,unpairedNativeCount:3,
  note:'Paired representations share one outcome contrast. Means are preserved in the extraction but require separate actual/counterfactual mapping.',records};
writeFileSync(`${root}/reading-first-publication-records.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({contrasts:33,representations:records.length,pairedContrasts:30,missingStandardized:3}));
