import {Ops} from '@geoprotocol/geo-sdk';
import {validateEducationTextEncoding} from '../src/education-text-encoding';
const entity='03cd942d5566419bb39a1608580c6f8a';
for(const [value,reject] of [['Café: coaching’s effect, 2014–15, 日本語.',false],['coaching\ufffds',true],['CREDO\u0092s',true],['2014\u009615',true]] as const){
 const ops=Ops.entities.update({id:entity,name:value}).ops;let rejected=false;
 try{validateEducationTextEncoding(ops);}catch{rejected=true;}
 if(rejected!==reject)throw Error('Encoding guard acceptance mismatch');
}
console.log('Encoding guard: valid multilingual UTF-8 accepted; three corruption cases rejected.');
