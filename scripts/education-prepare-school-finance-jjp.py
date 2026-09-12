import hashlib, json, re
from pathlib import Path
from decimal import Decimal
import pypdfium2 as pdfium
root=Path('data/education')
t=json.loads((root/'school-finance-jjp-transcription.json').read_text(encoding='utf8'))
source=Path(t['sourcePdf'])
assert hashlib.sha256(source.read_bytes()).hexdigest()==t['sourceSha256'], 'Source changed'
pdf=pdfium.PdfDocument(str(source))
checks=[]; records=[]
for outcome in t['outcomes']:
    page=pdf[outcome['pdfPage']-1].get_textpage().get_text_range()
    for values in [outcome['coefficients'],outcome['standardErrors']]:
        for value in values:
            # Visual review establishes signs and row/column alignment; this independently checks printed magnitudes.
            assert value.lstrip('-') in page, (outcome['key'],value)
            checks.append({'outcome':outcome['key'],'printedMagnitude':value,'pass':True})
    for field in ['individuals','families','personYears']:
        if outcome[field] is not None:
            assert f"{outcome[field]:,}" in page, (outcome['key'],field)
    for i,group in enumerate(t['groups']):
        assert Decimal(outcome['standardErrors'][i])>0
        records.append({'key':outcome['key']+'/'+group,'group':group,'measure':outcome['measure'],'unit':outcome['unit'],'coefficient':outcome['coefficients'][i],'standardError':outcome['standardErrors'][i],'pThreshold':outcome['pThresholds'][i],'table':outcome['table'],'column':outcome['columns'][i],'printedPage':outcome['printedPage'],'pdfPage':outcome['pdfPage'],'subgroupN':None,'modelCounts':{k:outcome[k] for k in ['individuals','families','personYears']}})
assert len(records)==15 and len({r['key'] for r in records})==15
report={'sourceSha256':t['sourceSha256'],'transcriptionSha256':hashlib.sha256((root/'school-finance-jjp-transcription.json').read_bytes()).hexdigest(),'status':'prepared, not published','scope':'15 preferred coefficients; visual row/sign review plus independent PDF magnitude and model-count checks','checks':checks,'records':records}
(root/'school-finance-jjp-extraction.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({'records':len(records),'magnitudeChecks':len(checks),'modelCountsVerified':True,'published':False}))
