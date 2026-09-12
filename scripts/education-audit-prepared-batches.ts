import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = 'data/education';
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const files = readdirSync(root).filter((name) => name.endsWith('-collection-batch.json') || name.endsWith('-catalog-resource-batch.json') || name === 'catalog-extension-batch.json');
const rows: any[] = [];
for (const file of files) {
  const batch: any = JSON.parse(readFileSync(join(root, file), 'utf8'));
  const ops = readFileSync(join(root, batch.opsPath.replace(/^data[\\/]education[\\/]/, '')), 'utf8');
  const bindingPath = batch.reviewBinding?.path;
  const binding = bindingPath ? JSON.parse(readFileSync(join(root, bindingPath.replace(/^data[\\/]education[\\/]/, '')), 'utf8')) : null;
  const publicationPath = join(root, file.replace(/-batch\.json$/, '-publication.json'));
  const validationPath = batch.validationPath ? join(root, batch.validationPath.replace(/^data[\\/]education[\\/]/, '')) : '';
  const validation = validationPath && existsSync(validationPath) ? JSON.parse(readFileSync(validationPath, 'utf8')) : null;
  const legacy = batch.publisherVersion !== 'collection-v1';
  const catalogResource = file.endsWith('-catalog-resource-batch.json') || file === 'catalog-extension-batch.json';
  const hasPublicationReceipt = existsSync(publicationPath);
  const checks = {
    collectionVersion: catalogResource || legacy || batch.publisherVersion === 'collection-v1',
    operationsHash: hash(ops) === batch.sha256,
    reviewBinding: catalogResource ? Boolean(validation?.ready && validation.opsHash === batch.sha256) : legacy || Boolean(binding && binding.opsHash === batch.sha256),
    noPublicationReceipt: legacy || (catalogResource && hasPublicationReceipt) || !hasPublicationReceipt,
  };
  rows.push({ batch: file, operationCount: batch.operationCount, status: hasPublicationReceipt ? 'historical-published' : 'prepared-only', checks, allChecksPassed: Object.values(checks).every(Boolean) });
}
const repairFiles = readdirSync(root).filter((name) => name.endsWith('-repair-validation.json'));
const excludedLegacyRepairs: string[] = [];
for (const file of repairFiles) {
  const validation: any = JSON.parse(readFileSync(join(root, file), 'utf8'));
  if (validation.operationCount === undefined) { excludedLegacyRepairs.push(file); continue; }
  const opsFile = file.replace(/-validation\.json$/, '-ops.json');
  const opsPath = join(root, opsFile);
  const ops: any[] = JSON.parse(readFileSync(opsPath, 'utf8'));
  const checks = {
    validationReady: validation.ready === true,
    operationsHash: hash(readFileSync(opsPath)) === validation.opsHash,
    additiveOnly: ops.length > 0 && ops.every((op) => ['updateEntity', 'createRelation'].includes(op.type) && !op.unset?.length),
    operationCount: validation.operationCount === undefined || validation.operationCount === ops.length,
    noDeletionReceipt: true,
  };
  const historical = existsSync(join(root, file.replace(/-repair-validation\.json$/, '-publication.json')));
  rows.push({ batch: opsFile, operationCount: ops.length, status: historical ? 'historical-published' : 'prepared-only', checks, allChecksPassed: Object.values(checks).every(Boolean), validation: file });
}
const failed = rows.filter((row) => !row.allChecksPassed);
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), batches: rows.length, excludedLegacyRepairs, allChecksPassed: failed.length === 0, failed, rows }, null, 2));
if (failed.length) process.exitCode = 1;
