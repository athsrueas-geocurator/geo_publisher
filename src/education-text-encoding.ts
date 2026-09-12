import type {Op} from '@geoprotocol/geo-sdk';

/** Reject decoding damage before signing; never silently rewrite immutable ops. */
export function validateEducationTextEncoding(ops:Op[]):void {
  for(const op of ops){
    if(op.type!=='updateEntity')continue;
    for(const set of op.set??[]){
      if(set.value.type==='text'&&/[\u0080-\u009f\ufffd]/u.test(set.value.value)){
        throw new Error('Education Text contains a C1 control or Unicode replacement character. Repair the source encoding and rebuild the reviewed payload.');
      }
    }
  }
}
