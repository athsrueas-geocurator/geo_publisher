import { test } from 'node:test';
import assert from 'node:assert/strict';
import { educationBountyLinkOps, EDUCATION_PUBLICATION } from '../src/education-bounty';
const input={proposalId:'11111111111141118111111111111111',proposalName:'Education evidence batch',typeRelationId:'22222222222242228222222222222222',submissionRelationId:'33333333333343338333333333333333',typeRelationEntityId:'44444444444444448444444444444444',submissionRelationEntityId:'55555555555545558555555555555555'};
test('bounty retries preserve all operation and relation IDs',()=>{
  assert.deepEqual(educationBountyLinkOps(input),educationBountyLinkOps(input));
});
test('bounty link targets the existing bounty in its owning space',()=>{
  const ops=educationBountyLinkOps(input);
  const serialized=JSON.stringify(ops,(_key,value)=>value instanceof Uint8Array?Buffer.from(value).toString('hex'):value);
  assert.ok(serialized.includes(EDUCATION_PUBLICATION.bountyId));
  assert.ok(serialized.includes(EDUCATION_PUBLICATION.bountySpaceId));
  assert.ok(!serialized.includes(EDUCATION_PUBLICATION.spaceId));
});
test('invalid or colliding journal identifiers cannot build a bounty link',()=>{
  assert.throws(()=>educationBountyLinkOps({...input,submissionRelationId:input.proposalId}));
  assert.throws(()=>educationBountyLinkOps({...input,proposalId:'not-a-proposal'}));
});
