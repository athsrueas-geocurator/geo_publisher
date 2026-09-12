"""Independently verify normalized publication cells with decimal arithmetic."""
import hashlib
import json
from decimal import Decimal
from pathlib import Path
from datetime import datetime, timezone

root = Path('data/education')
source_bytes = (root / 'perry-economic-extraction.json').read_bytes()
source = json.loads(source_bytes)
prepared = json.loads((root / 'perry-publication-records.json').read_text(encoding='utf-8'))
records = prepared['records']
checks = {'sourceHash': prepared['sourceSha256'] == hashlib.sha256(source_bytes).hexdigest(),
          'unique84Keys': len(records) == len({r['key'] for r in records}) == 84}
groups = [('modeled-internal-return', 'irrRows', 'irrColumns', 'valuesPercent', 'standardErrorsPercentagePoints', 100),
          ('modeled-benefit-cost-ratio', 'benefitCostRows', 'benefitCostColumns', 'values', 'standardErrors', 1)]
for kind, rows, columns, values, errors, divisor in groups:
    selected = [r for r in records if r['kind'] == kind]
    expected = [(row, col, i) for row in source['table1'][rows] for i, col in enumerate(source['table1'][columns])]
    checks[kind + '/count'] = len(selected) == len(expected)
    for actual, (row, col, i) in zip(selected, expected):
        checks[actual['key']] = (
            Decimal(actual['value']) == Decimal(str(row[values][i])) / divisor
            and Decimal(actual['standardError']) == Decimal(str(row[errors][i])) / divisor
            and all(actual[k] == v for k, v in col.items())
            and Decimal(actual['deadweightLossFraction']) == Decimal(str(row['deadweightLossFraction']))
            and (actual['realDiscountRate'] is None if divisor == 100 else Decimal(actual['realDiscountRate']) == Decimal(str(row['realDiscountRate']))))
selected = [r for r in records if r['kind'] == 'observed-descriptive-group-mean']
expected = [(row, col, i) for row in source['table2SelectedObservedOutcomes']['rows'] for i, col in enumerate(source['table2SelectedObservedOutcomes']['columns'])]
checks['observed/count'] = len(selected) == len(expected) == 32
for actual, (row, col, i) in zip(selected, expected):
    divisor = 100 if row['unit'] == 'percent' else 1
    checks[actual['key']] = (
        Decimal(actual['value']) == Decimal(str(row['values'][i])) / divisor
        and Decimal(actual['standardError']) == Decimal(str(row['standardErrors'][i])) / divisor
        and actual['population'] == col['population'] and actual['assignment'] == col['assignment']
        and actual['originalAssignmentN'] == col['originalN'] and actual['sampleSize'] is None
        and actual['causalEffect'] is False and actual['followup'] == row['ageOrPeriod']
        and actual['outcome'] == row['outcome'])
cost = [r for r in records if r['kind'] == 'program-cost']
checks['cost'] = len(cost) == 1 and Decimal(cost[0]['value']) == Decimal(str(source['cost']['value'])) and cost[0]['denominator'] == source['cost']['denominator'] and cost[0]['discounting'] == 'undiscounted'
report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'passed': all(checks.values()),
          'scope': 'All 84 normalized cells versus extraction; independent decimal conversion and scenario/group alignment, not live Geo verification', 'checks': checks}
(root / 'perry-record-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'passed': report['passed'], 'checkCount': len(checks), 'failed': [k for k, v in checks.items() if not v]}))
if not report['passed']:
    raise SystemExit(1)
