/** Read-only verification; never republish or vote to repair an unavailable page. */
import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraphqlRequest } from '../src/geo-api-client';
import { assertOrderedBlocks, geoEntityUrl } from '../src/publication-evidence';

const journal = JSON.parse(readFileSync('data/book-curation/knowledge-gap-quiz-publication.json', 'utf8'));
const { postId, spaceId, blockIds, blocks } = journal;
const url = geoEntityUrl(spaceId, postId);
const data: any = await geoGraphqlRequest(`query($id:UUID!,$space:UUID!){entity(id:$id){id typeIds spaceIds relations(first:100,orderBy:POSITION_ASC,filter:{spaceId:{is:$space},typeId:{is:"beaba5cba67741a8b35377030613fc70"}}){nodes{toEntity{id values(first:2,filter:{spaceId:{is:$space},propertyId:{is:"e3e363d1dd294ccb8e6ff3b76d99bc33"}}){nodes{text}pageInfo{hasNextPage}}}}pageInfo{hasNextPage}}}}`, { variables: { id: postId, space: spaceId } });
const entity = data.entity;
if (!entity?.spaceIds.includes(spaceId) || !entity.typeIds.includes('f3d4461486b74d2583d89709c9d84f65')) throw Error('Expected Post is not indexed in the requested personal space');
const actual = entity.relations.nodes.map((node: any) => {
  const values = node.toEntity.values;
  if (values.pageInfo.hasNextPage || values.nodes.length !== 1) throw Error('Block text is missing, ambiguous, or incomplete');
  return { id: node.toEntity.id, text: values.nodes[0].text };
});
assertOrderedBlocks(actual, blockIds, blocks, entity.relations.pageInfo.hasNextPage);
const receipt = { state: 'indexed', checkedAt: new Date().toISOString(), url, postId, spaceId, blockCount: actual.length, renderedCheck: 'Not performed by this API verifier; open the exact URL separately.' };
writeFileSync('data/book-curation/knowledge-gap-quiz-index-verification.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt, null, 2));
