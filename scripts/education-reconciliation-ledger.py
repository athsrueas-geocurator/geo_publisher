"""Inventory pinned source fields without inferring Geo publication coverage."""
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[1] / 'data/education'
manifest = json.loads((root / 'source/manifest.json').read_text(encoding='utf-8'))
crosswalk = json.loads((root / 'source-to-geo-crosswalk.json').read_text(encoding='utf-8'))
lookup = {r['migrationKey']: r for r in crosswalk['rows']}
rows, files = [], []
for collection, count in [('initiatives', 76), ('sources', 106), ('dichotomies', 21)]:
    relative = f'content/{collection}.json'
    raw = (root / 'source' / relative).read_bytes()
    entry = next(f for f in manifest['files'] if f['path'] == relative)
    digest = hashlib.sha256(raw).hexdigest()
    if digest != entry['sha256']:
        raise ValueError(f'Pinned source hash mismatch: {relative}')
    data = json.loads(raw)
    if len(data) != count:
        raise ValueError(f'Source count mismatch: {relative}')
    files.append({'path': relative, 'records': len(data), 'sha256': digest})
    for record in data:
        key = str(record['slug'] if collection == 'dichotomies' else record['id'])
        migration_key = f'{collection}:{key}'
        prior = lookup.get(migration_key, {})
        fields = []
        for field, value in record.items():
            items = [(f'{field}.{k}', v) for k, v in value.items()] if isinstance(value, dict) else [(field, value)]
            for path, field_value in items:
                fields.append({'sourceField': path, 'sourceValue': field_value,
                               'status': 'needs-content-review', 'verifiedGeoMappings': [],
                               'reviewReason': 'Assessment provenance and vocabulary required' if path == 'evidenceStrength' or path.startswith('continuum.') else 'Current scoped Geo facts and source equivalence not yet reconciled'})
        rows.append({'migrationKey': migration_key, 'sourcePath': relative,
                     'name': record.get('name', record.get('title')),
                     'candidateGeoIds': prior.get('candidateGeoIds', []),
                     'priorDecision': prior.get('decision'), 'fields': fields})
report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'sourceCommit': manifest['commit'],
          'scope': '203 original records; source inventory and prior candidates only, not live publication certification',
          'files': files, 'rows': rows}
output = root / 'original-field-reconciliation.json'
if output.exists():
    existing = json.loads(output.read_text(encoding='utf-8'))
    if any(f.get('verifiedGeoMappings') or f.get('status') != 'needs-content-review' for r in existing['rows'] for f in r['fields']):
        # A routine refresh must be safe for agents to run.  Never overwrite reviewed
        # mappings; report the pinned-source counts and leave explicit reconciliation
        # edits to the dedicated record scripts.
        remaining = sum(1 for r in existing['rows'] for f in r['fields'] if f.get('status') == 'needs-content-review')
        reviewed = sum(1 for r in existing['rows'] for f in r['fields'] if f.get('status') != 'needs-content-review')
        print(json.dumps({'preserved': True, 'records': len(existing['rows']),
                          'fields': sum(len(r['fields']) for r in existing['rows']),
                          'reviewedFields': reviewed, 'remainingReviewFields': remaining,
                          'sourceCommit': existing.get('sourceCommit'),
                          'message': 'Reviewed ledger preserved; use an explicit reconciliation script for updates.'}))
        raise SystemExit(0)
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'records': len(rows), 'fields': sum(len(r['fields']) for r in rows),
                  'recordsWithPriorCandidates': sum(bool(r['candidateGeoIds']) for r in rows),
                  'sourceHashesVerified': len(files), 'liveMappingsVerified': 0}))
