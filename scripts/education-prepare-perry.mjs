import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Publication input only: no wallet, generated Geo IDs, or graph mutations.
const sourcePath='data/education/perry-economic-extraction.json';
const raw=await readFile(sourcePath,'utf8');
const source=JSON.parse(raw);
assert.equal(source.verification.visualChecked,true);
const records=[];
const base={publicationDoi:source.publication.doi,studyKey:'perry-original-study',priceYear:2006};
const slug=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// Decimal strings avoid binary floating point artifacts when percentages become fractions.
function fraction(value){
  const [whole,part='']=String(value).split('.');
  const digits=(whole+part).padStart(part.length+3,'0');
  const split=digits.length-part.length-2;
  return `${digits.slice(0,split)}.${digits.slice(split)}`.replace(/0+$/,'').replace(/\.$/,'');
}
for(const row of source.table1.irrRows){
  assert.equal(row.valuesPercent.length,source.table1.irrColumns.length);
  assert.equal(row.standardErrorsPercentagePoints.length,row.valuesPercent.length);
  source.table1.irrColumns.forEach((column,index)=>records.push({
    ...base,key:`irr/dwl-${row.deadweightLossFraction}/${column.perspective}/${column.crimeValuation??'not-applicable'}/${column.population}`,
    kind:'modeled-internal-return',...column,deadweightLossFraction:String(row.deadweightLossFraction),
    value:fraction(row.valuesPercent[index]),standardError:fraction(row.standardErrorsPercentagePoints[index]),
    unit:'fraction',standardErrorUnit:'fraction',sourceValue:row.valuesPercent[index],sourceStandardError:row.standardErrorsPercentagePoints[index],
    locator:source.table1.locator,realDiscountRate:null,sampleSize:null
  }));
}
for(const row of source.table1.benefitCostRows){
  assert.equal(row.values.length,source.table1.benefitCostColumns.length);
  assert.equal(row.standardErrors.length,row.values.length);
  source.table1.benefitCostColumns.forEach((column,index)=>records.push({
    ...base,key:`benefit-cost/discount-${row.realDiscountRate}/${column.crimeValuation}/${column.population}`,
    kind:'modeled-benefit-cost-ratio',...column,deadweightLossFraction:String(row.deadweightLossFraction),
    realDiscountRate:String(row.realDiscountRate),value:String(row.values[index]),standardError:String(row.standardErrors[index]),
    unit:'ratio',standardErrorUnit:'ratio',locator:source.table1.locator,sampleSize:null
  }));
}
for(const row of source.table2SelectedObservedOutcomes.rows){
  assert.equal(row.values.length,source.table2SelectedObservedOutcomes.columns.length);
  assert.equal(row.standardErrors.length,row.values.length);
  const percent=row.unit==='percent';
  source.table2SelectedObservedOutcomes.columns.forEach((column,index)=>records.push({
    ...base,key:`observed/${slug(row.outcome)}/${slug(row.ageOrPeriod)}/${column.population}/${column.assignment}`,
    kind:'observed-descriptive-group-mean',population:column.population,assignment:column.assignment,
    outcome:row.outcome,followup:row.ageOrPeriod,
    value:percent?fraction(row.values[index]):String(row.values[index]),
    standardError:percent?fraction(row.standardErrors[index]):String(row.standardErrors[index]),
    unit:percent?'fraction':'USD',standardErrorUnit:percent?'fraction':'USD',
    originalAssignmentN:column.originalN,sampleSize:null,
    locator:source.table2SelectedObservedOutcomes.locator,
    causalEffect:false
  }));
}
records.push({...base,key:'cost/initial-program',kind:'program-cost',value:String(source.cost.value),
  unit:'USD',standardError:null,sampleSize:null,denominator:source.cost.denominator,
  discounting:source.cost.discounting,scope:source.cost.scope,locator:source.cost.locator});
assert.equal(records.length,84);
assert.equal(new Set(records.map(r=>r.key)).size,84);
assert.equal(records.filter(r=>r.kind==='modeled-internal-return').length,27);
assert.equal(records.filter(r=>r.kind==='modeled-benefit-cost-ratio').length,24);
assert.equal(records.filter(r=>r.kind==='observed-descriptive-group-mean').length,32);
for(const record of records){
  assert(Number.isFinite(Number(record.value)));
  assert(record.standardError===null||Number.isFinite(Number(record.standardError)));
}
const output={schemaVersion:1,preparedAt:new Date().toISOString(),sourcePath,
  sourceSha256:createHash('sha256').update(raw).digest('hex'),
  status:'normalized publication input; Geo ontology mapping and publication pending',
  numericEncoding:'decimal strings; percent estimates and SEs both converted to fractions',
  records};
await writeFile('data/education/perry-publication-records.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({records:records.length,sourceSha256:output.sourceSha256,status:output.status}));
