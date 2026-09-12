// Read-only probes: no dotenv, wallet, uploads or publishing imports.
import { writeFileSync } from 'node:fs';
import { GeoTestnetConfig } from '@geoprotocol/geo-sdk';

const endpoint = `${GeoTestnetConfig.apiOrigin}/graphql`;
const spaceId = 'ec349623f33236aee13c12dcd629ee81';
const tests = [
  ['space', 'query($id: UUID!) { space(id:$id) { id type } }'],
  ['bad-null-filter', 'query($id: UUID!) { entities(spaceId:$id, first:5, filter:{name:{isNot:null}}) { id name } }'],
  ['non-null-filter', 'query($id: UUID!) { entities(spaceId:$id, first:5, filter:{name:{isNull:false}}) { id name } }'],
  ['connection-minimal', 'query($id: UUID!) { entitiesConnection(spaceId:$id, first:5) { nodes { id name } pageInfo { hasNextPage endCursor } } }'],
  ['connection-count', 'query($id: UUID!) { entitiesConnection(spaceId:$id, first:5) { totalCount nodes { id } pageInfo { hasNextPage endCursor } } }'],
  ['nested-types', 'query($id: UUID!) { entities(spaceId:$id, first:5) { id name types { id name } } }'],
  ['offset-25', 'query($id: UUID!) { entities(spaceId:$id, first:5, offset:25) { id name } }'],
  ['global-exact', 'query { entities(first:5, filter:{name:{is:"University of Southern California"}}) { id name spaceIds } }'],
  ['global-substring', 'query { entities(first:5, filter:{name:{includesInsensitive:"What Works Clearinghouse"}}) { id name spaceIds } }'],
  ['original-inventory', 'query($id:UUID!) { space(id:$id){id type topic{id name}} entitiesConnection(spaceId:$id,first:100){totalCount nodes{id name description types{id name}} pageInfo{hasNextPage endCursor}} }'],
  ['original-global-or', 'query { entities(first:50,filter:{or:[{name:{includesInsensitive:"What Works Clearinghouse"}},{name:{includesInsensitive:"National Assessment"}},{name:{includesInsensitive:"Regression discontinuity"}},{name:{includesInsensitive:"Education Data"}},{name:{includesInsensitive:"Reading First"}}]}){id name typeIds spaceIds} }'],
];
const results = [];
async function probe([name, query]) {
  const start = performance.now();
  let result;
  try {
    const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query, variables:{id:spaceId}}), signal:AbortSignal.timeout(40000)});
    const body = await response.json();
    result = {name, query, status:response.status, elapsedMs:Math.round(performance.now()-start), ...body};
  } catch(error) {
    result = {name, query, elapsedMs:Math.round(performance.now()-start), transportError:error.name};
  }
  results.push(result);
  console.log(JSON.stringify(result));
}
// Limit load to two simultaneous read-only requests.
for(let i=0; i<tests.length; i+=2) await Promise.all(tests.slice(i,i+2).map(probe));
writeFileSync('docs/geo-read-diagnostics.json', JSON.stringify({checkedAt:new Date().toISOString(), endpoint, spaceId, results},null,2)+'\n');
