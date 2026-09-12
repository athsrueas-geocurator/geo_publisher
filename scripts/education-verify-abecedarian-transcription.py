"""Check visually transcribed Table 6 pairs against the pinned source PDF text."""
import hashlib, json, pathlib, re
import pdfplumber

root = pathlib.Path('data/education')
model = json.loads((root / 'abecedarian-forecast-transcription.json').read_text())
source = pathlib.Path(model['sourceFile'])
assert hashlib.sha256(source.read_bytes()).hexdigest() == model['sourceSha256']
with pdfplumber.open(source) as pdf:
    text = pdf.pages[model['pdfPage'] - 1].extract_text()
table = text.split('Note:')[0]
pairs = [(float(a), float(b)) for a, b in re.findall(r'(\d+\.\d+)\s*\(s\.e\.\s*(\d+\.\d+)\)', table)]
expected = [(r[m]['value'], r[m]['se']) for r in model['rows'] for m in ['klineWaltersMethod', 'authorsMethod'] if r[m] is not None]
assert pairs == expected, (pairs, expected)
assert len(pairs) == 11
report = {'passed': True, 'numericCells': 22, 'rows': 6, 'estimates': 11, 'sourceSha256': model['sourceSha256'], 'scope': 'Table 6 numeric transcription only; not final-version or economic-denominator verification'}
(root / 'abecedarian-forecast-transcription-verification.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
