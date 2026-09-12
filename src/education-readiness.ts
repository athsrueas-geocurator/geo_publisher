/** Mechanical signing prerequisites only; these checks do not certify source accuracy. */
export function validateEducationReadiness(
  batch: {sha256:string;spaceId:string}, validation:any, preflight:any, now=Date.now(),
): string {
  function fresh(value:unknown,label:string) {
    const time=typeof value==='string'?Date.parse(value):NaN;
    if(!Number.isFinite(time)||time>now||now-time>15*60*1000) {
      throw new Error(`${label} requires a valid, nonfuture timestamp within 15 minutes.`);
    }
  }
  fresh(validation?.checkedAt,'Payload validation');
  if(validation?.ready!==true||validation.opsHash!==batch.sha256) {
    throw new Error('Payload validation must explicitly be ready and match the operation hash.');
  }
  fresh(preflight?.checkedAt,'Member preflight');
  if(preflight?.member!==true||preflight.targetSpaceId!==batch.spaceId) {
    throw new Error('Member preflight must explicitly confirm membership in the batch destination.');
  }
  const personalSpace=preflight.personalSpaces?.[0]?.id;
  if(typeof personalSpace!=='string'||!(/^[a-f0-9]{32}$/i.test(personalSpace))) {
    throw new Error('Member preflight needs a valid personal-space ID.');
  }
  return personalSpace;
}
