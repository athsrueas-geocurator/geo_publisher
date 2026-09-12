import hashlib, json, re
from decimal import Decimal
from pathlib import Path
import pypdfium2 as pdfium

root=Path('data/education')
path=root/'saga-pooled-transcription.json'
source=json.loads(path.read_text(encoding='utf8'))
assert hashlib.sha256(Path(source['sourcePdf']).read_bytes()).hexdigest()==source['sourceSha256']
pdf=pdfium.PdfDocument(source['sourcePdf'])
checks=[]; records=[]; source_rows=[]
for table in source['tables']:
    lines=[' '.join(line.split()) for line in pdf[table['pdfPage']-1].get_textpage().get_text_range().replace('\u2212','-').splitlines() if line.strip()]
    for row in table['rows']:
        matches=[line for line in lines if line.startswith(row['label']+' ')]
        assert len(matches)==1,(table['table'],row['key'],matches)
        parsed=re.findall(r'-?\d[\d,]*(?:\.\d+)?',matches[0][len(row['label']):])
        assert len(parsed)==len(row['values'])==8,(row['key'],parsed)
        assert [Decimal(n.replace(',','')) for n in parsed]==[Decimal(n) for n in row['values']],(row['key'],parsed,row['values'])
        cells=dict(zip(source['columns'],row['values']))
        row_key=f"pooled/t{table['table']}/{row['key']}"
        source_rows.append({'key':row_key,'table':table['table'],'printedPage':table['printedPage'],'pdfPage':table['pdfPage'],'panel':row['panel'],'label':row['label'],**cells})
        checks.append({'table':table['table'],'row':row['key'],'printedRow':matches[0],'numericCellsChecked':8})
        for estimand in ['itt','tot']:
            assert Decimal(cells[estimand+'SE'])>0,(row_key,estimand)
            records.append({'key':f"pooled/t{table['table']}/{row['key']}/{estimand}",'table':table['table'],'printedPage':table['printedPage'],'measure':row['label'],'measureKey':row['key'],'panel':row['panel'],'estimand':estimand.upper(),'value':cells[estimand],'standardError':cells[estimand+'SE'],'n':int(cells['N']),'unit':row['unit'],'followup':row.get('followup',table['period']),'analysis':source['analysis']})
assert len(checks)==19 and len(records)==38 and len(source_rows)==19
assert len({r['key'] for r in records})==38
for record in records:
    record['sourceRowKey']=record['key'].rsplit('/',1)[0]
    assert sum(r['key']==record['sourceRowKey'] for r in source_rows)==1
report={'status':'Source-verified preparation; not published','sourceSha256':source['sourceSha256'],'transcriptionSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'checks':checks,'records':records,'unresolved':['Pooled analysis identity and cross-space reuse','Graduated-ever terminal observation date','Suspension days/events unit','Separate Table 6 bound modeling','Source-row FDR/control/complier mapping','Source-specific Claim prose, publishing, bounty linkage and dashboard verification']}
report['sourceRows']=source_rows
report['uncertaintyPolicy']='FDR q-values are source-row attributes, not ordinary per-estimand p-values. Control complier means are estimated, not observed control means. ITT and TOT share a source row and are not independent evidence.'
(root/'saga-pooled-extraction.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({'rows':len(checks),'numericCells':len(checks)*8,'estimates':len(records),'published':False}))
