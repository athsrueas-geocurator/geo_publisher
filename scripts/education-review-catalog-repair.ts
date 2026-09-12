import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Ops, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education', prefix = 'catalog-review-correction';
const catalog = JSON.parse(readFileSync(`${root}/source/research-data/dataset-catalog.json`, 'utf8'));
const descriptions: Record<string, string> = {
  'hsls-09': 'A nationally representative study follows students who were ninth-graders in fall 2009 into postsecondary education. Its observational data support analysis of educational pathways; causal effects require a separate credible study design.',
  'ssocs': 'A nationally representative cross-sectional survey describes crime and safety in U.S. public schools. It provides school-safety context rather than longitudinal estimates of program effects.',
  'what-works-clearinghouse': 'An Institute of Education Sciences resource reviews education research and summarizes findings about interventions and practices. Read its assessments alongside the underlying primary studies.',
};
const markdown = 'e3e363d1dd294ccb8e6ff3b76d99bc33';
const report: any = { checkedAt: new Date().toISOString(), scope: 'Current destination facts for three catalog records; source-catalog reconciliation', records: [] };
const ops: Op[] = [];
for (const key of Object.keys(descriptions)) {
  const source = catalog.find((r: any) => r.id === key);
  if (!source) throw Error(`Missing source ${key}`);
  const registry = JSON.parse(readFileSync(`${root}/${key}-catalog-resource-registry.json`, 'utf8'));
  const fields = [['Steward', source.steward], ['Access', source.accessMethod], ['Access URL', source.accessUrl], ['Unit', source.unitOfAnalysis], ['Coverage', source.yearsCovered], ['Geography', source.geographicLevel.join(', ')], ['Record identifiers', key === 'what-works-clearinghouse' ? 'Intervention name, study citation, and WWC review identifier.' : key === 'ssocs' ? 'Survey cycle and school record; apply survey weights for analysis.' : 'Student record, wave, and school record where permitted; apply survey weights for analysis.'], ['Measures', source.primaryMeasures.join(', ')], ['Uses', source.supportsComparisons.join(', ')]];
  const content = `## Catalog metadata\n\n${fields.map(([label, value]) => `- **${label}:** ${value}`).join('\n')}\n\n${source.notes}\n\n[Official resource](${source.sourceUrl})`;
  const expected = [{ id: registry.dataset, property: SystemIds.DESCRIPTION_PROPERTY, text: descriptions[key] }, { id: registry.block, property: markdown, text: content }];
  for (const item of expected) {
    const data: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){values(first:50,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}}', { variables: { id: item.id, space: target.spaceId } });
    if (!data.entity || data.entity.values.pageInfo.hasNextPage) throw Error(`Missing or incomplete ${item.id}`);
    const before = data.entity.values.nodes.filter((v: any) => v.propertyId === item.property);
    if (before.length !== 1) throw Error(`Ambiguous field ${item.id}`);
    report.records.push({ key, ...item, before: before[0].text, matches: before[0].text === item.text, sourceUrl: source.sourceUrl });
    if (before[0].text !== item.text) ops.push(...Ops.entities.update({ id: item.id, values: [{ property: item.property, type: 'text', value: item.text! }] }).ops);
  }
}
writeFileSync(`${root}/${prefix}-review.json`, JSON.stringify(report, null, 2) + '\n');
if (!process.argv.includes('--build')) { console.log(JSON.stringify({ fields: report.records.length, mismatches: ops.length })); process.exit(0); }
if (existsSync(`${root}/${prefix}-publication.json`)) throw Error('Preserve submitted payload; use read-only mode to verify corrections');
for (const id of [SystemIds.DESCRIPTION_PROPERTY, markdown]) {
  const data: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id } });
  if (data.property?.dataTypeName !== 'Text') throw Error('Schema mismatch');
}
const bytes = JSON.stringify(ops, (_k, v) => v instanceof Uint8Array ? { $bytes: Buffer.from(v).toString('hex') } : v, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Correct HSLS, SSOCS and WWC catalog descriptions and source metadata', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, operationCount: ops.length };
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2));
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, scope: 'Six reviewed text fields; existing entity IDs only; no numeric values or relations changed', sourcePath: `${root}/source/research-data/dataset-catalog.json` }, null, 2));
console.log(JSON.stringify(batch));
