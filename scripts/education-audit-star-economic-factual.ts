import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';

const root = 'data/education';
const spaceId = 'dac259bad48a11adf97fe36857d85206';
const factual = 'da4a6c1f9d4446f9832ff3b49a4400ef';
const registry = JSON.parse(readFileSync(`${root}/star-economic-registry.json`, 'utf8')) as Record<string, string>;
const scenarios = Object.entries(registry).filter(([key]) => key.startsWith('scenario/')).map(([key, id]) => ({ key, id }));
if (!scenarios.length) throw new Error('No STAR economic scenario IDs in registry');
const rows: any[] = [];
for (const scenario of scenarios) {
  const response: any = await gql('query($id:UUID!,$space:UUID!){entity(id:$id){name description values(first:100,filter:{spaceId:{is:$space}}){nodes{propertyId boolean decimal integer text}pageInfo{hasNextPage}}}}', { variables: { id: scenario.id, space: spaceId } });
  const entity = response.entity;
  if (!entity || entity.values.pageInfo.hasNextPage) throw new Error(`Incomplete STAR scenario read: ${scenario.key}`);
  const flags = entity.values.nodes.filter((value: any) => value.propertyId === factual).map((value: any) => value.boolean);
  rows.push({ ...scenario, name: entity.name, description: entity.description, factualValues: flags, status: flags.length === 1 ? (flags[0] === true ? 'factual-flag-present' : 'flag-present-but-false') : flags.length === 0 ? 'missing-factual-flag' : 'ambiguous-factual-flag' });
}
const report = { version: 1, checkedAt: new Date().toISOString(), scope: 'destination STAR economic scenario factual-flag audit', scenarioCount: rows.length, missing: rows.filter((row) => row.status === 'missing-factual-flag').length, ambiguous: rows.filter((row) => row.status === 'ambiguous-factual-flag').length, rows };
writeFileSync(`${root}/star-economic-factual-audit.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ scenarios: report.scenarioCount, missing: report.missing, ambiguous: report.ambiguous, statuses: rows.reduce((all, row) => ({ ...all, [row.status]: (all[row.status] ?? 0) + 1 }), {} as Record<string, number>), output: `${root}/star-economic-factual-audit.json` }));
