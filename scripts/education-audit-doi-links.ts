import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();
do{
 const d:any=await gql('query($after:Cursor){valuesConnection(first:20,after:$after,filter:{spaceId:{is:"dac259bad48a11adf97fe36857d85206"},propertyId:{is:"7cb59354e30c48119e99ff62fcf61646"}}){nodes{entityId text}pageInfo{hasNextPage endCursor}}}',{variables:{after}});
 const p=d.valuesConnection;nodes.push(...p.nodes);if(!p.pageInfo.hasNextPage)break;
 if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete DOI pagination');after=p.pageInfo.endCursor;seen.add(after!);
}while(true);
const invalid=nodes.filter(n=>!/^https:\/\/doi\.org\/10\.\d{4,9}\/\S+$/i.test(n.text));
writeFileSync('data/education/bibliography-doi-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),scope:'All DOI values in Education datasets, all entity types, complete pagination; URL syntax only, not DOI-source semantic certification',nodes,invalid},null,2)+'\n');
console.log(JSON.stringify({count:nodes.length,invalid}));if(invalid.length)process.exitCode=1;
