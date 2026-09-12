import {readFileSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
import {hash} from './education-collection';
export type EvidenceRef={path:string;sha256:string};
export function evidenceBytes(ref:EvidenceRef):Buffer {
  const path=resolve(ref.path),rel=relative(process.cwd(),path);
  if(isAbsolute(rel)||rel.startsWith('..')||!(/^(data|docs)[\\/]/.test(rel))||/(^|[\\/])\.env(?:\.|$)/i.test(rel))throw Error('Evidence must be a nonsecret file under repository data/ or docs/');
  const bytes=readFileSync(path);if(hash(bytes)!==ref.sha256)throw Error(`Evidence changed: ${ref.path}`);return bytes;
}
export function validateSourceReview(review:any,planHash:string,factsHash:string,sourceIds:string[],now=Date.now()) {
  if(review?.version!==1||review.planHash!==planHash||review.factsHash!==factsHash||typeof review.reviewer!=='string'||!review.reviewer.trim())throw Error('Review must identify reviewer and exact plan/facts hashes');
  const time=Date.parse(review.checkedAt);if(!Number.isFinite(time)||time>now)throw Error('Invalid review date');
  for(const key of ['source','identity','content'])if(review.decisions?.[key]?.status!=='accepted'||!review.decisions[key].rationale?.trim())throw Error(`Missing accepted ${key} review with rationale`);
  if(!Array.isArray(review.sources)||!review.sources.length||sourceIds.some(id=>!review.sources.some((s:any)=>s.sourceId===id)))throw Error('Source evidence must cover every Article');
  for(const source of review.sources){if(!source.version?.trim())throw Error('Missing source version');evidenceBytes(source);}
  const discovery=JSON.parse(evidenceBytes(review.discovery).toString('utf8'));
  const checked=Date.parse(discovery.checkedAt);if(!Number.isFinite(checked)||checked>now||now-checked>3600000||discovery.scope!=='all-spaces'||!Array.isArray(discovery.searches)||!discovery.searches.length)throw Error('Fresh all-space discovery required');
  for(const kind of ['alias','identifier'])if(!discovery.searches.some((s:any)=>s.kind===kind))throw Error(`Missing ${kind} discovery`);
  for(const search of discovery.searches){if(search.complete!==true||!search.query?.trim()||!Array.isArray(search.candidates))throw Error('Incomplete discovery search');for(const c of search.candidates)if(c.decision!=='distinct'||!c.id||!c.rationale?.trim())throw Error('Matching or undecided Dataset candidate requires a reuse/delta workflow');}
  if(discovery.datasetDecision!=='create'||!discovery.rationale?.trim())throw Error('This builder requires a reviewed create decision; existing Datasets need a separate delta');
}
export function validateReviewBinding(batch:any) {
  if(batch.publisherVersion!=='collection-v1')return; // Historical workflows remain explicit in guidance.
  if(!batch.reviewBinding)throw Error('Collection batch lacks review binding');
  const binding=JSON.parse(evidenceBytes(batch.reviewBinding).toString('utf8'));
  if(binding.version!==1||binding.opsHash!==batch.sha256)throw Error('Review belongs to different operations');
  for(const ref of binding.inputs??[])evidenceBytes(ref);
  if(!Array.isArray(binding.inputs)||binding.inputs.length<4)throw Error('Incomplete review inputs');
}
