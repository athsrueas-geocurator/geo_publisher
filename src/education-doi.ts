import type {Op} from '@geoprotocol/geo-sdk';

/** Geo renders this Text property as a URL, so bare identifiers misnavigate. */
export function validateEducationDoiLinks(ops:Op[]):void {
  for(const op of ops){
    if(op.type!=='updateEntity')continue;
    for(const value of op.set??[]){
      if(Buffer.from(value.property).toString('hex')!=='7cb59354e30c48119e99ff62fcf61646')continue;
      if(value.value.type!=='text'||!/^https:\/\/doi\.org\/10\.\d{4,9}\/\S+$/i.test(value.value.value)){
        throw new Error('DOI must use a full https://doi.org/10.… resolver URL; bare identifiers render as incorrect links. Update the builder and rebuild its validation.');
      }
    }
  }
}
