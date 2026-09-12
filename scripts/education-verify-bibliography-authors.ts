import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',prefix='original-bibliography-authors',space='dac259bad48a11adf97fe36857d85206';
const read=(n:string)=>JSON.parse(readFileSync(`${root}/${n}.json`,'utf8')),content=read(`${prefix}-content`),registry=read(`${prefix}-registry`).ids;
if(!read(`${prefix}-index-verification`).passed)throw Error('Batch verification required');
const report:any={checkedAt:new Date().toISOString(),articles:[],passed:false};
const query='query($id:UUID!,$space:UUID!,$after:Cursor){entity(id:$id){relations(first:2,after:$after,filter:{typeId:{is:"91a9e2f6e51a48f7997661de8561b690"},spaceId:{is:$space}}){nodes{id toEntityId position spaceId toEntity{name}}pageInfo{hasNextPage endCursor}}}}';
for(const article of content.articles){let after:string|null=null;const seen=new Set<string>(),nodes:any[]=[];let pages=0;
 do{const d:any=await gql(query,{variables:{id:article.id,space,after}});if(!d.entity)throw Error('Article missing');const p=d.entity.relations;nodes.push(...p.nodes);pages++;if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete authors');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
 nodes.sort((a,b)=>a.position.localeCompare(b.position));const expected=article.authors.map((name:string)=>registry[`author/${name}`]);
 const pass=JSON.stringify(nodes.map(n=>n.toEntityId))===JSON.stringify(expected)&&nodes.every((n,i)=>n.spaceId===space&&n.toEntity.name===article.authors[i]);
 report.articles.push({id:article.id,sourceKeys:article.sourceKeys,nodes,pages,pass});
}
report.passed=report.articles.every((a:any)=>a.pass);writeFileSync(`${root}/${prefix}-query-verification.json`,JSON.stringify({...report,query},null,2)+'\n');if(!report.passed)throw Error('Authorship read contract failed');
const ledger=read('original-field-reconciliation');
for(const article of content.articles)for(const key of article.sourceKeys){const row=ledger.rows.find((r:any)=>r.migrationKey===`sources:${key}`);const field=row.fields.find((f:any)=>f.sourceField==='authors');field.status='existing-and-readable';field.verifiedGeoMappings=[{entityId:article.id,spaceId:space,propertyId:'91a9e2f6e51a48f7997661de8561b690',targetEntityIds:article.authors.map((name:string)=>registry[`author/${name}`]),ordered:true,evidence:`${prefix}-query-verification.json`,sourceEvidence:article.evidence,checkedAt:report.checkedAt}];field.reviewReason='Complete byline verified against the publication record; placeholder domain or and-colleagues text is replaced by source-backed authorship, not copied as a Person.';}
for(const [key,fields,reason] of [
 ['sources:src-003',['finding'],'The source w15531 evaluates NCLB; this imported finding describes pre-NCLB accountability. Bibliography identity is verified, but this finding needs a different source or scoped correction.'],
 ['sources:src-033',['method'],'Imported Lottery classification conflicts with the published matched-growth CREDO Article. Verify the 2023 methodology before creating a method edge; do not copy Lottery.']
] as const){const row=ledger.rows.find((r:any)=>r.migrationKey===key);for(const name of fields){const f=row.fields.find((f:any)=>f.sourceField===name);if(f.status==='needs-content-review')f.reviewReason=reason;}}
ledger.checkedAt=report.checkedAt;writeFileSync(`${root}/original-field-reconciliation.json`,JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({passed:true,articleCount:report.articles.length,authorshipEdges:report.articles.reduce((s:number,a:any)=>s+a.nodes.length,0),pages:report.articles.reduce((s:number,a:any)=>s+a.pages,0),reconciledAuthorFields:6,verifiedTotal:ledger.rows.flatMap((r:any)=>r.fields).filter((f:any)=>f.status==='existing-and-readable').length}));
