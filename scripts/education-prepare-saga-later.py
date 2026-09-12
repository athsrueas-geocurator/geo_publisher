import hashlib, json, re
from decimal import Decimal
from pathlib import Path
import pypdfium2 as pdfium

root=Path('data/education')
path=root/'saga-later-transcription.json'
source=json.loads(path.read_text(encoding='utf8'))
assert hashlib.sha256(Path(source['sourcePdf']).read_bytes()).hexdigest()==source['sourceSha256']
pdf=pdfium.PdfDocument(source['sourcePdf'])
text=pdf[source['pdfPage']-1].get_textpage().get_text_range().replace('\u2212','-')
lines=[' '.join(line.split()) for line in text.splitlines() if line.strip()]
assert source['printedPage'] in lines
checks=[]; source_rows=[]; records=[]
for study in source['studies']:
    start=lines.index(f"{study['panel']}. Study {study['study']}")
    end=next((i for i in range(start+1,len(lines)) if re.match(r'[AB]\. Study \d|Notes:',lines[i])),len(lines))
    panel=lines[start+1:end]
    for row in study['rows']:
        matches=[line for line in panel if line.startswith(row['label']+' ')]
        assert len(matches)==1,(study['study'],row['key'],matches)
        parsed=re.findall(r'-?\d[\d,]*(?:\.\d+)?',matches[0][len(row['label']):])
        assert len(parsed)==len(row['values'])==8
        assert [Decimal(n.replace(',','')) for n in parsed]==[Decimal(n) for n in row['values']],(row['key'],parsed)
        key=f"s{study['study']}/appendix-t5/{row['key']}"
        cells=dict(zip(source['columns'],row['values']))
        source_rows.append({'key':key,'study':study['study'],'label':row['label'],**cells})
        checks.append({'key':key,'printedRow':matches[0],'numericCellsChecked':8})
        for estimand in ['itt','tot']:
            assert Decimal(cells[estimand+'SE'])>0
            records.append({'key':f'{key}/{estimand}','sourceRowKey':key,'study':study['study'],'measureKey':row['key'],'measure':row['label'],'unit':row['unit'],'estimand':estimand.upper(),'value':cells[estimand],'standardError':cells[estimand+'SE'],'n':int(cells['N']),'table':source['table'],'printedPage':source['printedPage'],'pdfPage':source['pdfPage']})
assert len(source_rows)==8 and len(records)==16 and len({r['key'] for r in records})==16
report={'status':'Source-verified preparation; not published','sourceSha256':source['sourceSha256'],'transcriptionSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'checks':checks,'sourceRows':source_rows,'records':records,'unresolved':['Cross-space Claim identity discovery','Eleventh-grade observation-window definition','Graduated-ever terminal date','Source-specific Claim prose, publishing, bounty linkage and dashboard verification']}
(root/'saga-later-extraction.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({'sourceRows':8,'numericCellsChecked':64,'estimates':16,'printedPage':source['printedPage'],'published':False}))
