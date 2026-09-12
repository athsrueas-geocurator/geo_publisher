import assert from 'node:assert/strict';
import {validateEducationReadiness} from '../src/education-readiness';
const now=Date.parse('2026-09-12T12:00:00Z');
const batch={sha256:'reviewed-hash',spaceId:'dac259bad48a11adf97fe36857d85206'};
const validation={ready:true,opsHash:batch.sha256,checkedAt:new Date(now).toISOString()};
const preflight={member:true,targetSpaceId:batch.spaceId,checkedAt:validation.checkedAt,personalSpaces:[{id:'d00460c203779d21d96fcfc6102d7a72'}]};
assert.equal(validateEducationReadiness(batch,validation,preflight,now),preflight.personalSpaces[0]!.id);
for(const checkedAt of [undefined,'invalid',new Date(now+1).toISOString(),new Date(now-900001).toISOString()]) {
  assert.throws(()=>validateEducationReadiness(batch,{...validation,checkedAt},preflight,now));
  assert.throws(()=>validateEducationReadiness(batch,validation,{...preflight,checkedAt},now));
}
for(const patch of [{ready:'true'},{ready:false},{opsHash:'different'}]) {
  assert.throws(()=>validateEducationReadiness(batch,{...validation,...patch},preflight,now));
}
for(const patch of [{member:'true'},{member:false},{targetSpaceId:'wrong'}, {personalSpaces:[]}, {personalSpaces:[{id:'invalid'}]}]) {
  assert.throws(()=>validateEducationReadiness(batch,validation,{...preflight,...patch},now));
}
assert.doesNotThrow(()=>validateEducationReadiness(batch,{...validation,checkedAt:new Date(now-900000).toISOString()},preflight,now));
console.log('Readiness: valid inputs and age boundary accepted; 16 malformed, stale, future, mismatched or unconfirmed cases rejected.');
