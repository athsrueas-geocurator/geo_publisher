import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8'));
const batch=read('original-reused-categories-batch'),query=readFileSync(`${root}/original-category-members-query.graphql`,'utf8');
const reports:any[]=[];
for(const category of [...new Set<string>(batch.records.map((r:any)=>r.categoryId))]){
 const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql(query,{variables:{category,space:batch.spaceId,after}});const p=d.relationsConnection;nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 const expected=batch.records.filter((r:any)=>r.categoryId===category);
 const passed=expected.every((r:any)=>nodes.some(n=>n.id===r.relationId&&n.fromEntityId===r.entityId&&n.toEntityId===category&&n.spaceId===batch.spaceId));
 reports.push({category,nodes,expected,passed});
}
const report={checkedAt:new Date().toISOString(),passed:reports.every(r=>r.passed),reports};writeFileSync(`${root}/original-category-query-verification.json`,JSON.stringify(report,null,2)+'\n');
if(!report.passed)throw Error('Category traversal missing expected members');
const ledger=read('original-field-reconciliation');
for(const record of batch.records){const row=ledger.rows.find((r:any)=>r.migrationKey===record.migrationKey);const field=row.fields.find((f:any)=>f.sourceField==='category');field.status='existing-and-readable';field.verifiedGeoMappings=[{entityId:record.entityId,spaceId:batch.spaceId,propertyId:'06c899fb04334e679feb1fd56687c3d6',relationId:record.relationId,targetEntityId:record.categoryId,evidence:'original-category-query-verification.json',checkedAt:report.checkedAt}];field.reviewReason='Original educational classification reconciled to an existing cross-space topic, typed Category in destination and verified through category-member query.';}
ledger.checkedAt=report.checkedAt;ledger.scope='203 original records; reviewed field mappings only, not complete migration certification';writeFileSync(`${root}/original-field-reconciliation.json`,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,categories:reports.length,members:batch.records.length}));
