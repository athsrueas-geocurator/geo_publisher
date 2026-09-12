import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root = 'data/education';
const bytes = readFileSync(`${root}/reading-first-extraction.json`);
const sourceHash = createHash('sha256').update(bytes).digest('hex');
const source = JSON.parse(bytes);
const pilot = JSON.parse(readFileSync(`${root}/reading-first-pilot-batch.json`, 'utf8'));
const transcriptionBytes = readFileSync(`${root}/reading-first-transcription.json`);
const transcription = JSON.parse(transcriptionBytes);
assert.equal(sourceHash, pilot.sourceHash, 'Extraction changed since published pilot');
assert.equal(createHash('sha256').update(transcriptionBytes).digest('hex'), source.verification.transcriptionSha256);
const reviewed = new Map(transcription.tables.flatMap(table => table.rows.map(row => [row.key, {table, row}])));
const records = [];
let checkedValues = 0;
for (const contrast of source.records) {
  const original = reviewed.get(contrast.key);
  assert.ok(original, `Missing reviewed row ${contrast.key}`);
  assert.equal(contrast.means.unit, original.row.meanUnit);
  const roles = [
    ['actual-funded', 'actualUnadjustedWithReadingFirst', 'Actual unadjusted mean with Reading First', 0],
    ['estimated-counterfactual', 'estimatedCounterfactualWithoutReadingFirst', 'Estimated mean without Reading First', 1],
  ];
  for (const [role, field, label, column] of roles) {
    const value = contrast.means[field];
    assert.match(value, /^-?\d+(\.\d+)?$/);
    assert.equal(value, original.row.main[column], `Mean mismatch ${contrast.key}/${role}`);
    checkedValues++;
    records.push({
      key: `${contrast.key}/mean/${role}`, contrastKey: contrast.key, role, label,
      value, unit: contrast.means.unit, measure: contrast.measure,
      domain: contrast.domain, instrument: contrast.instrument, grade: contrast.grade,
      analysisLevel: contrast.analysisLevel, followup: contrast.followup,
      sourceLocation: {exhibit: original.table.mainExhibit, pdfPage: original.table.mainPdfPage, printedPage: original.table.mainPrintedPage},
      standardError: null, confidenceInterval: null, outcomeSampleSize: null,
      pairedKey: `${contrast.key}/mean/${role === 'actual-funded' ? 'estimated-counterfactual' : 'actual-funded'}`,
      effectKey: `${contrast.key}/native`,
    });
  }
}
assert.equal(records.length, 66);
assert.equal(new Set(records.map(record => record.key)).size, 66);
for (const record of records) {
  const pair = records.find(candidate => candidate.key === record.pairedKey);
  assert.equal(pair?.pairedKey, record.key);
  assert.equal(pair?.contrastKey, record.contrastKey);
  assert.notEqual(pair?.role, record.role);
}
const report = {
  preparedAt: new Date().toISOString(), sourceHash,
  status: 'Source reconciled; ontology mapping and Geo publication pending',
  contrastCount: 33, recordCount: records.length, checkedSourceValues: checkedValues,
  interpretation: 'Actual funded means are unadjusted. Counterfactual means are estimated, not observed control-group means. Rounded means do not reproduce every published adjusted impact.',
  missingness: 'Mean uncertainty and outcome sample sizes are not supplied by this extraction. Effect uncertainty must not be copied onto means.',
  percentStorage: 'Source percent values remain on the 0–100 scale here. Any publication conversion to fractions must be explicit, exact and paired with verified formatting.',
  records,
};
writeFileSync(`${root}/reading-first-mean-records.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status: report.status, records: records.length, checkedSourceValues: checkedValues}));
