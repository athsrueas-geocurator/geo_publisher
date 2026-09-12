import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const originals=JSON.parse(readFileSync('data/education/source/content/dichotomies.json','utf8'));
const report:any={checkedAt:new Date().toISOString(),scope:'All-space all-type substring aliases and collection source identifier; candidates require manual review',searches:[]};
const searches=originals.map((r:any)=>({key:r.slug,kind:'name',term:r.title.split(' vs ')[0].trim()}));
searches.push(...['Education Initiatives questions','Education Initiatives debates','Education Initiatives dichotomies'].map(term=>({key:'collection',kind:'name',term})),{key:'collection',kind:'text',term:'Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/dichotomies.json'});
for(const search of searches){const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
 do{const d:any=await gql(search.kind==='name'?'query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{includesInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}':'query($term:String!,$after:Cursor){valuesConnection(first:20,after:$after,filter:{text:{includesInsensitive:$term}}){nodes{entity{id name description spaceIds types{id name}}}pageInfo{hasNextPage endCursor}}}',{variables:{term:search.term,after}});const p=d[search.kind==='name'?'entitiesConnection':'valuesConnection'];nodes.push(...p.nodes.map((n:any)=>search.kind==='name'?n:n.entity));if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete alias search');after=p.pageInfo.endCursor;seen.add(after!);
 }while(true);report.searches.push({...search,complete:true,nodes});writeFileSync('data/education/original-question-alias-discovery.json',JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report.searches.map((s:any)=>({key:s.key,term:s.term,nodes:s.nodes})),null,2));
