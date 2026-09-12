import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { geoGraphqlRequest as gql } from '../src/geo-api-client';
import { EDUCATION_PUBLICATION as target } from '../src/education-bounty';

const root = 'data/education';
const prefix = 'abecedarian-age30-outcomes';
if (existsSync(`${root}/${prefix}-publication.json`)) {
  throw new Error('Preserve the submitted payload; do not rebuild a published age-30 outcomes batch.');
}

const registryPath = `${root}/${prefix}-registry.json`;
const registry: Record<string, string> = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, 'utf8'))
  : {};
const id = (key: string) => registry[key] ?? (registry[key] = randomUUID().replaceAll('-', ''));
const p = {
  article: 'a2a5ed0cacef46b1835de457956ce915',
  claim: '96f859efa1ca4b229372c86ad58b694b',
  factual: 'da4a6c1f9d4446f9832ff3b49a4400ef',
  doi: '7cb59354e30c48119e99ff62fcf61646',
  source: '49c5d5e1679a4dbdbfd33f618f227c94',
  related: 'dfa6aebe1ca94bf29faccc4cc7afb24c',
  estimate: 'e500e2585a964d2c9df4a47b199616c3',
  unit: '8405509cc7354655a348591349a5f025',
};
const article = 'a72a792642aa46b497587313102bfe39';
const study = '66657d9776214aec9cf816b8d50b644a';
const checks: string[] = [];
const ops: Op[] = [];
const check = (value: unknown, label: string) => { if (!value) throw new Error(label); checks.push(label); };
const decimal = (property: string, value: string) => {
  const [whole, fraction = ''] = value.split('.');
  const negative = whole.startsWith('-');
  const digits = `${negative ? whole.slice(1) : whole}${fraction}`;
  return { property, type: 'decimal' as const, exponent: -fraction.length, mantissa: { type: 'i64' as const, value: BigInt(`${negative ? '-' : ''}${digits}`) } };
};
const relation = (key: string, from: string, type: string, to: string) => {
  const position = registry[`position/${key}`] ?? (registry[`position/${key}`] = Position.generate());
  ops.push(...Ops.relations.create({ id: id(`edge/${key}`), entityId: id(`relation/${key}`), fromEntity: from, type, toEntity: to, position }).ops);
};

const rows = [
  {
    key: 'education-years',
    name: 'At age 30, ABC-treated participants completed 1.15 more years of education than controls (13.46 vs 12.31).',
    description: 'In the ABC randomized treatment comparison, the age-30 outcome was F(1,99)=9.60, p<.01, d=0.62, with a 95% CI of 0.42 to 1.90 years. The analysis used 52 treated and 49 control participants and is ABC-only, not pooled ABC/CARE evidence.',
    effect: '0.62',
    unit: 'Cohen\'s d for completed years of education at age 30, ABC treatment versus control; source-reported standardized effect.',
    locator: 'Table 3; Education, years; p. 1038.',
  },
  {
    key: 'bachelors-degree',
    name: "At age 30, 23.08% of ABC-treated participants held a bachelor's degree or higher, versus 6.12% of controls.",
    description: 'The source reports OR=4.60 (95% CI 1.21–17.47; p=.03) for the ABC randomized treatment comparison. It corresponds to 12 treated and 3 control participants, so it is a small-sample estimate and ABC-only.',
    effect: '4.60',
    unit: "Odds ratio for bachelor's degree or higher at age 30, ABC treatment versus control; source-reported.",
    locator: "Table 3; Bachelor's degree or higher; p. 1038.",
  },
  {
    key: 'income-to-needs',
    name: 'At age 30, ABC treatment did not produce a statistically significant difference in income-to-needs ratio (3.11 vs 2.22).',
    description: 'The selected primary economic outcome had F(1,99)=1.61, p=.21, d=0.25 in 52 treated and 49 control participants. This does not establish no economic effect; it is one age-30, self-reported household-income measure.',
    effect: '0.25',
    unit: 'Cohen\'s d for income-to-needs ratio at age 30, ABC treatment versus control; source-reported standardized effect.',
    locator: 'Table 4; Income-to-needs ratio; p. 1039.',
  },
  {
    key: 'full-employment',
    name: 'At age 30, 75% of ABC-treated participants versus 59% of controls were fully employed for at least two-thirds of the prior 24 months.',
    description: 'The source reports OR=2.65, χ²(1)=5.16, p=.02 for the ABC randomized treatment comparison. This is an employment-history threshold, not earnings or a cost-benefit result.',
    effect: '2.65',
    unit: 'Odds ratio for full employment during at least two-thirds of the prior 24 months, ABC treatment versus control; source-reported.',
    locator: 'Table 4; Fully employed in previous 24 months; p. 1039.',
  },
] as const;

for (const [property, type] of [[SystemIds.TYPES_PROPERTY, 'Relation'], [p.source, 'Relation'], [p.related, 'Relation'], [p.factual, 'Checkbox'], [p.doi, 'Text'], [p.estimate, 'Decimal'], [p.unit, 'Text']] as const) {
  const response: any = await gql('query($id:UUID!){property(id:$id){dataTypeName}}', { variables: { id: property } });
  check(response.property?.dataTypeName === type, `Live ${type} property: ${property}`);
}
const existing: any = await gql('query($article:UUID!,$study:UUID!,$space:UUID!){article:entity(id:$article){types{id}values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}study:entity(id:$study){spaceIds}}', { variables: { article, study, space: target.spaceId } });
check(existing.article?.types.some((type: any) => type.id === p.article), 'Existing source remains an Article');
check(!existing.article?.values.pageInfo.hasNextPage, 'Existing source values are fully read');
check(!existing.article?.values.nodes.some((value: any) => value.propertyId === p.doi && value.text === '10.1037/a0026644'), 'DOI is not already published on source');
check(!!existing.study?.spaceIds?.length, 'Existing ABC Study is available for outcome links');
for (const row of rows) {
  const result: any = await gql('query($name:String!){entitiesConnection(first:10,filter:{name:{isInsensitive:$name}}){nodes{id}pageInfo{hasNextPage}}}', { variables: { name: row.name } });
  check(!result.entitiesConnection.pageInfo.hasNextPage && result.entitiesConnection.nodes.length === 0, `Complete all-space exact-name discovery: ${row.key}`);
  const allocated = id(`claim/${row.key}`);
  const occupied: any = await gql('query($id:UUID!){entity(id:$id){spaceIds}}', { variables: { id: allocated } });
  check(!occupied.entity?.spaceIds?.length, `Persistent Claim ID is unused: ${row.key}`);
}

ops.push(...Ops.entities.update({ id: article, values: [{ property: p.doi, type: 'text', value: '10.1037/a0026644' }] }).ops);
for (const row of rows) {
  const claim = id(`claim/${row.key}`);
  ops.push(...Ops.entities.update({ id: claim, name: row.name, description: row.description, values: [
    { property: p.factual, type: 'boolean', value: true }, decimal(p.estimate, row.effect), { property: p.unit, type: 'text', value: row.unit },
  ] }).ops);
  relation(`${row.key}/type`, claim, SystemIds.TYPES_PROPERTY, p.claim);
  relation(`${row.key}/source`, claim, p.source, article);
  relation(`${row.key}/study`, claim, p.related, study);
}
const bytes = JSON.stringify(ops, (_key, value) => value instanceof Uint8Array ? { $bytes: Buffer.from(value).toString('hex') } : typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2) + '\n';
const sha256 = createHash('sha256').update(bytes).digest('hex');
const batch = { name: 'Add Abecedarian age-30 observed outcomes', spaceId: target.spaceId, bounty: target.bountyId, opsPath: `${root}/${prefix}-ops.json`, sha256, journalPath: `${root}/${prefix}-publication.json`, validationPath: `${root}/${prefix}-validation.json`, entities: { article, study, claims: Object.fromEntries(rows.map(row => [row.key, id(`claim/${row.key}`)])) }, operationCount: ops.length };
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
writeFileSync(batch.opsPath, bytes);
writeFileSync(`${root}/${prefix}-batch.json`, JSON.stringify(batch, null, 2) + '\n');
writeFileSync(batch.validationPath, JSON.stringify({ ready: true, checkedAt: new Date().toISOString(), opsHash: sha256, checks, source: 'Campbell et al. (2012), Developmental Psychology 48(4):1033–1043, DOI 10.1037/a0026644, PMCID PMC3989926.', transcription: 'Table 3 and Table 4 were visually reviewed in the PMC source. Claim values are source-reported standardized effects or odds ratios, not locally calculated differences.', scope: 'All four are ABC-only age-30 randomized-treatment findings. They do not pool CARE, assign a price year to earnings, or construct a benefit-cost estimate.' }, null, 2) + '\n');
console.log(JSON.stringify({ batch, checks }, null, 2));
