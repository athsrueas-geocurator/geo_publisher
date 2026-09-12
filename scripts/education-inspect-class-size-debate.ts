import {writeFileSync} from 'node:fs';
import {geoGraphqlRequest as gql} from '../src/geo-api-client';
const report:any={checkedAt:new Date().toISOString(),entities:[],identifiers:[]};
for(const id of ['d70f7e00c8fd4fb2b6a056df6b844b1f','d68c6d1d10af47418fc80ed09d4e097f','6db38a6c620f4ca1bc2452137457d686','b0e661c838de4b8eb406a9c5a82249b1','7eeddeb79af54141b58e4cffe32d93a5']){
 const d:any=await gql('query($id:UUID!){entity(id:$id){id name description spaceIds types{id name}values(first:40){nodes{propertyId text boolean spaceId}pageInfo{hasNextPage}}relations(first:60){nodes{id typeId toEntityId spaceId toEntity{name}}pageInfo{hasNextPage}}}}',{variables:{id}});
 if(!d.entity||d.entity.values.pageInfo.hasNextPage||d.entity.relations.pageInfo.hasNextPage)throw Error('Incomplete identity read');report.entities.push(d.entity);
}
for(const text of ['https://hanushek.stanford.edu/publications/evidence-politics-and-class-size-debate','https://hanushek.stanford.edu/sites/default/files/publications/Hanushek%202002%20ClassSizeDebate.pdf']){
 const d:any=await gql('query($text:String!){valuesConnection(first:20,filter:{text:{is:$text}}){nodes{propertyId entity{id name spaceIds}}pageInfo{hasNextPage}}}',{variables:{text}});if(d.valuesConnection.pageInfo.hasNextPage)throw Error('Incomplete identifier search');report.identifiers.push({text,data:d});
}
writeFileSync('data/education/class-size-debate-identity.json',JSON.stringify(report,null,2)+'\n');
const d:any=await gql('query($name:String!){entitiesConnection(first:20,filter:{name:{isInsensitive:$name}}){nodes{id name description spaceIds types{id name}}pageInfo{hasNextPage endCursor}}}',{variables:{name:'Economic Considerations and Class Size'}});
if(d.entitiesConnection.pageInfo.hasNextPage)throw Error('Incomplete exact search');
writeFileSync('data/education/discovery/economic-considerations-and-class-size.json',JSON.stringify({term:'Economic Considerations and Class Size',endpoint:'https://api-testnet.geobrowser.io/graphql',scope:'all spaces; exact case-insensitive primary name',checkedAt:report.checkedAt,complete:true,nodes:d.entitiesConnection.nodes,pages:[d.entitiesConnection.pageInfo],decision:'Reuse d70f7e00c8fd4fb2b6a056df6b844b1f, the existing 2003 journal Article; supersedes the pre-publication empty search.'},null,2)+'\n');
console.log(JSON.stringify({entities:report.entities.map((e:any)=>({id:e.id,relations:e.relations.nodes.filter((r:any)=>['806d52bc27e94c9193c057978b093351','91a9e2f6e51a48f7997661de8561b690'].includes(r.typeId))})),identifiers:report.identifiers}));
