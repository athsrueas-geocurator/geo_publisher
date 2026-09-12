import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',space='dac259bad48a11adf97fe36857d85206';
const source=JSON.parse(readFileSync(`${root}/source/content/sources.json`,'utf8'));
const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
do{
 const d:any=await gql('query($space:UUID!,$after:Cursor){entitiesConnection(spaceId:$space,typeId:"a2a5ed0cacef46b1835de457956ce915",first:20,after:$after){nodes{id name description values(first:30,filter:{spaceId:{is:$space}}){nodes{propertyId text}pageInfo{hasNextPage}}}pageInfo{hasNextPage endCursor}}}',{variables:{space,after}});
 const p=d.entitiesConnection;for(const n of p.nodes)if(n.values.pageInfo.hasNextPage)throw Error('Incomplete source values');nodes.push(...p.nodes);
 if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Pagination failed');after=p.pageInfo.endCursor;seen.add(after!);
}while(true);
const normalize=(s:string)=>s.toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/$/,'');
const title=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function identifiers(url:string){const ids:string[]=[];const nber=url.match(/(?:nber\.org\/(?:papers|system\/files\/working_papers|sites\/default\/files\/working_papers)\/|10\.3386\/)(w\d{4,6})/i);if(nber)ids.push(`nber:${nber[1]!.toLowerCase()}`);const doi=url.match(/(?:doi\.org\/)?(10\.\d{4,9}\/[^\s?#]+)/i);if(doi)ids.push(`doi:${doi[1]!.toLowerCase()}`);return ids;}
const rows=source.map((s:any)=>{
 const sourceIds=identifiers(s.url);const candidates=nodes.flatMap(n=>{
  const values=n.values.nodes.filter((v:any)=>['412ff593e9154012a43d4c27ec5c68b6','7cb59354e30c48119e99ff62fcf61646'].includes(v.propertyId)&&v.text);
  const ids=values.flatMap((v:any)=>identifiers(v.text));const signals:string[]=[];
  if(values.some((v:any)=>normalize(v.text)===normalize(s.url)))signals.push('exact-url');
  for(const id of sourceIds)if(ids.includes(id))signals.push(id);
  if(title(s.title)===title(n.name??''))signals.push('normalized-title');
  return signals.length?[{id:n.id,name:n.name,description:n.description,identifiers:values,signals}]:[];
 });return {key:s.id,title:s.title,url:s.url,year:s.year,candidates};
});
const report={checkedAt:new Date().toISOString(),space,scope:'Complete destination Article inventory and identifier/title candidate matching; not graph-wide absence proof or automatic version merge',articles:nodes,rows};
writeFileSync(`${root}/original-source-identity-audit.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({articles:nodes.length,matchedRows:rows.filter((r:any)=>r.candidates.length).length,rows:rows.filter((r:any)=>r.candidates.length).map((r:any)=>({key:r.key,title:r.title,matches:r.candidates.map((c:any)=>({id:c.id,name:c.name,signals:c.signals}))}))},null,2));
