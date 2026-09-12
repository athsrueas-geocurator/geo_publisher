import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const names=['US Department of Education','U.S. Department of Education','United States Department of Education','Department of Education (United States)','U.S. Education Department','United States Education Department','Department of Education','US ED','USDOE'];
const urls=['https://www.ed.gov','http://www.ed.gov','https://ed.gov','http://ed.gov'];
const probes=[...names,...urls.flatMap(u=>[u,u+'/']),'Office of Elementary and Secondary Education','OESE','Guide to U.S. Department of Education Programs 2008'];
const report:any={checkedAt:new Date().toISOString(),scope:'All spaces and all properties: exact case-insensitive text identity names, aliases and homepage URL variants; not proof of global absence',probes:[]};
for(const text of probes){
 const probe:any={text,complete:false,nodes:[],pages:[]};report.probes.push(probe);let after:string|null=null;
 try{while(true){
  const data:any=await gql<any>('query($text:String!,$after:Cursor){valuesConnection(first:5,after:$after,filter:{text:{isInsensitive:$text}}){nodes{entity{id name types{id name}}property{id name}spaceId text}pageInfo{hasNextPage endCursor}}}',{variables:{text,after}});
  const p:any=data.valuesConnection;probe.nodes.push(...p.nodes);probe.pages.push(p.pageInfo);
  if(!p.pageInfo.hasNextPage){probe.complete=true;break;}
  if(!p.pageInfo.endCursor||p.pageInfo.endCursor===after||probe.pages.length>=40)throw new Error('Incomplete pagination');after=p.pageInfo.endCursor;
 }}catch(error){probe.error=String(error);}
 writeFileSync('data/education/federal-education-identity.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({text,complete:probe.complete,nodes:probe.nodes,error:probe.error}));
}
