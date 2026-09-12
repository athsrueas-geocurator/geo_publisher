import {readFileSync,writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const root='data/education',original=JSON.parse(readFileSync(`${root}/source/content/dichotomies.json`,'utf8'));
const report:any={checkedAt:new Date().toISOString(),scope:'Complete all-space exact name and route identity searches for original question text and framing; candidates require semantic review',rows:[]};
for(const row of original){const searches:any[]=[];
 for(const [kind,term] of [['name',row.betterQuestion],['name',row.title],['slug',row.slug]]){
  const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
  do{const query=kind==='name'?'query($term:String!,$after:Cursor){entitiesConnection(first:20,after:$after,filter:{name:{isInsensitive:$term}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}':'query($term:String!,$after:Cursor){valuesConnection(first:20,after:$after,filter:{propertyId:{is:"b0305ef28312c519d954bc0efe22f013"},text:{is:$term}}){nodes{entity{id name spaceIds types{id name}}}pageInfo{hasNextPage endCursor}}}';
   const d:any=await gql(query,{variables:{term,after}});const p=d[kind==='name'?'entitiesConnection':'valuesConnection'];nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete question search');after=p.pageInfo.endCursor;seen.add(after!);
  }while(true);searches.push({kind,term,complete:true,nodes});
 }report.rows.push({slug:row.slug,searches});writeFileSync(`${root}/original-question-identity-discovery.json`,JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({rows:report.rows.length,searches:report.rows.reduce((s:number,r:any)=>s+r.searches.length,0),matches:report.rows.flatMap((r:any)=>r.searches.filter((s:any)=>s.nodes.length))},null,2));
