import hashlib, json, re
from pathlib import Path
from decimal import Decimal
import pypdfium2 as pdfium
root=Path('data/education')
path=root/'saga-outcomes-transcription.json'
source=json.loads(path.read_text(encoding='utf8'))
assert hashlib.sha256(Path(source['sourcePdf']).read_bytes()).hexdigest()==source['sourceSha256']
pdf=pdfium.PdfDocument(source['sourcePdf'])
checks=[]; records=[]; source_rows=[]
for table in source['tables']:
    page=pdf[table['pdfPage']-1].get_textpage().get_text_range().replace('\u2212','-')
    lines=[' '.join(line.split()) for line in page.splitlines() if line.strip()]
    for row in table['rows']:
        matches=[line for line in lines if line.startswith(row['label']+' ')]
        assert len(matches)==1, (table['study'],row['label'],matches)
        numeric=matches[0][len(row['label']):]
        parsed=re.findall(r'-?\d[\d,]*(?:\.\d+)?',numeric)
        expected=row['values']
        assert len(parsed)==len(expected)==8,(row['label'],parsed)
        assert [Decimal(n.replace(',','')) for n in parsed]==[Decimal(n) for n in expected],(row['label'],parsed,expected)
        checks.append({'study':table['study'],'outcome':row['key'],'printedRow':matches[0],'allEightColumnsMatch':True})
        cells=dict(zip(source['columns'],expected))
        source_rows.append({'key':f"s{table['study']}/{row['key']}",'table':table['table'],'panel':row['panel'],'label':row['label'],**cells})
        for estimand in ['itt','tot']:
            assert Decimal(cells[estimand+'SE'])>0
            records.append({'key':f"s{table['study']}/{row['key']}/{estimand}",'study':table['study'],'measureKey':row['key'],'measure':row['label'],'estimand':estimand.upper(),'value':cells[estimand],'standardError':cells[estimand+'SE'],'n':int(cells['N']),'unit':row['unit'],'unitStatus':row.get('unitStatus','source-reviewed'),'table':table['table'],'panel':row['panel'],'printedPage':table['printedPage'],'pdfPage':table['pdfPage'],'existingKey':f"estimate/saga-s{table['study']}-y1-math-{estimand}" if row['key']=='cps-math' else None})
assert len(records)==62 and len(source_rows)==31 and len({r['key'] for r in records})==62
original=json.loads((root/'saga-extraction.json').read_text(encoding='utf8'))
for old in original['estimates']:
    row=next(r for r in records if r['existingKey']=='estimate/'+old['key'])
    assert Decimal(row['value'])==Decimal(str(old['value'])) and Decimal(row['standardError'])==Decimal(str(old['standardError'])) and row['n']==old['n']
report={'checkedAtSourceVersion':'2023 final AER article','sourceSha256':source['sourceSha256'],'transcriptionSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'status':'prepared; new outcomes not yet published','scope':'Tables 3 and 4, all 31 source rows, 62 ITT/TOT effects; four existing effects must be reused','checks':checks,'sourceRows':source_rows,'records':records,'uncertaintyPolicy':'FDR q-values remain source-row attributes; do not relabel them as p-values or infer separate ITT/TOT adjusted tests. Control complier means are estimates, not observed control means.','unresolved':['Exact unit of out-of-school suspensions','Typed source-row control/complier means and FDR q-value mapping','Later-year and pooled effects beyond Tables 3–4','Bounty-linked publication and dashboard verification of expanded outcomes']}
(root/'saga-outcomes-extraction.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({'rowsChecked':len(checks),'numericCellsChecked':len(checks)*8,'effects':len(records),'existingEffectsMatched':4,'newEffects':58,'unitsNeedingReview':sum(r['unit'] is None for r in records)}))
