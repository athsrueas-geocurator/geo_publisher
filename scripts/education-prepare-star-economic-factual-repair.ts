import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Ops } from '@geoprotocol/geo-sdk';

const root = 'data/education';
const audit = JSON.parse(readFileSync(`${root}/star-economic-factual-audit.json`, 'utf8')) as { rows: Array<{ id: string; status: string }> };
const missing = audit.rows.filter((row) => row.status === 'missing-factual-flag');
if (missing.length !== 14) throw new Error(`Expected 14 missing flags after live audit, found ${missing.length}`);
const ops = missing.flatMap((row) => Ops.entities.update({ id: row.id, values: [{ property: 'da4a6c1f9d4446f9832ff3b49a4400ef', type: 'boolean', value: true }] }).ops);
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const opsHash = createHash('sha256').update(bytes).digest('hex');
writeFileSync(`${root}/star-economic-factual-repair-ops.json`, bytes);
writeFileSync(`${root}/star-economic-factual-repair-validation.json`, JSON.stringify({ version: 1, ready: true, checkedAt: new Date().toISOString(), opsHash, scope: 'Set Is factual=true on the 14 source-reported STAR economic scenario Claims that lack the flag; no names, descriptions, numbers or relations change.', claimIds: missing.map((row) => row.id), sourceAudit: 'star-economic-factual-audit.json', operationCount: ops.length }, null, 2) + '\n');
console.log(JSON.stringify({ mode: 'prepared-only', claims: missing.length, operations: ops.length, opsHash }));
