"""Check the Table 1 extraction against text read independently from its PDF."""
import hashlib
import json
import re
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

import pdfplumber

root = Path('data/education')
source = json.loads((root / 'perry-economic-extraction.json').read_text(encoding='utf-8'))
pdf_path = Path(source['publication']['localPdf'])
with pdfplumber.open(pdf_path) as pdf:
    lines = pdf.pages[1].extract_text().splitlines()

actual = []
for i, line in enumerate(lines):
    match = re.match(r'^(?:IRR\s+|Benefit.*?ratios\s+)?(0|3|5|7|50|100)%\s+(.+)$', line)
    if not match:
        continue
    values = [float(n) for n in re.findall(r'\d+(?:\.\d+)?', match[2])]
    errors = [float(n) for n in re.findall(r'\((\d+(?:\.\d+)?)\)', lines[i + 1])]
    actual.append({'axisPercent': float(match[1]), 'values': values, 'errors': errors})

expected = [
    {'axisPercent': float(Decimal(str(r['deadweightLossFraction'])) * 100), 'values': r['valuesPercent'], 'errors': r['standardErrorsPercentagePoints']}
    for r in source['table1']['irrRows']
] + [
    {'axisPercent': float(Decimal(str(r['realDiscountRate'])) * 100), 'values': r['values'], 'errors': r['standardErrors']}
    for r in source['table1']['benefitCostRows']
]
checks = {
    'sevenRowsMatchPdfValuesAxesAndErrors': actual == expected,
    'irrCount': sum(len(r['valuesPercent']) for r in source['table1']['irrRows']) == 27,
    'ratioCount': sum(len(r['values']) for r in source['table1']['benefitCostRows']) == 24,
    'selectedMeansCount': sum(len(r['values']) for r in source['table2SelectedObservedOutcomes']['rows']) == 32,
    'originalGroupCounts': sum(c['originalN'] for c in source['table2SelectedObservedOutcomes']['columns']) == 123,
}
report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'pdfSha256': hashlib.sha256(pdf_path.read_bytes()).hexdigest(), 'scope': 'Table 1 numerical values, row axes and standard errors versus PDF text; structural counts for visually reviewed Table 2 selection', 'checks': checks, 'passed': all(checks.values()), 'pdfRows': actual}
(root / 'perry-extraction-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'passed': report['passed'], 'checks': checks}))
if not report['passed']:
    raise SystemExit(1)
