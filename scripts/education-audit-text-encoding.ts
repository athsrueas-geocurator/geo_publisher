import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const nodes:any[]=[];let after:string|null=null;const seen=new Set<string>();let pages=0;
do{const d:any=await gql('query($after:Cursor){valuesConnection(first:50,after:$after,filter:{spaceId:{is:"dac259bad48a11adf97fe36857d85206"},text:{isNull:false}}){nodes{entityId propertyId text}pageInfo{hasNextPage endCursor}}}',{variables:{after}});const p=d.valuesConnection;nodes.push(...p.nodes);pages++;if(!p.pageInfo.hasNextPage)break;if(!p.pageInfo.endCursor||seen.has(p.pageInfo.endCursor))throw Error('Incomplete encoding audit');after=p.pageInfo.endCursor;seen.add(after!);}while(true);
const flagged=nodes.filter(n=>/[\u0080-\u009f\ufffd]|\u00e2[\u0080\u20ac]|\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]/u.test(n.text));
writeFileSync('data/education/text-encoding-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),scope:'All destination Text values, complete pagination. C1 controls, replacement characters and common UTF-8 mojibake patterns nominate review; not a semantic text audit.',complete:true,pages,total:nodes.length,flagged},null,2)+'\n');
console.log(JSON.stringify({pages,total:nodes.length,flaggedCount:flagged.length,flagged},null,2));
