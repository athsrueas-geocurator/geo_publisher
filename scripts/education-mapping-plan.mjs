import { readFile,writeFile } from 'node:fs/promises';
const intake=JSON.parse(await readFile('data/education/intake.json','utf8'));
const mappings=new Map();
function visit(collection,value,prefix=''){
  for(const [key,item] of Object.entries(value)){
    const field=prefix?`${prefix}.${key}`:key;
    if(item && typeof item==='object'&&!Array.isArray(item)){visit(collection,item,field);continue;}
    const id=`${collection}.${field}`;
    const reference=['sourceIds','relatedDichotomySlugs','keyInitiativeSlugs','dichotomySlug'].includes(key);
    const type=Array.isArray(item)?'array':typeof item;
    const previous=mappings.get(id);
    if(previous&&previous.sourceType!==type)throw new Error(`Mixed source field types: ${id}`);
    if(previous)continue;
    const mapping={collection,field,sourceType:type,representation:reference?'ordered-entity-relations':type==='array'?'ordered-literal-items':type==='number'?'numeric-value':'text-value',propertyId:null,status:'needs-ontology-resolution'};
    if(['name','title','item','term','claim'].includes(key)&&!prefix){mapping.propertyId='a126ca530c8e48d5b88882c734c38935';mapping.status='reuse-sdk-name';}
    if(['definition','dek'].includes(key)&&!prefix){mapping.propertyId='9b1f76ff9711404c861e59dc3fa7d037';mapping.status='reuse-sdk-description';}
    if(key==='url'){mapping.propertyId='412ff593e9154012a43d4c27ec5c68b6';mapping.status='reuse-sdk-web-url';}
    if(key==='doi'){mapping.propertyId='7cb59354e30c48119e99ff62fcf61646';mapping.status='reuse-live-root-doi';}
    if(key==='sourceIds'){
      mapping.propertyId='49c5d5e1679a4dbdbfd33f618f227c94';
      mapping.status='reuse-live-root-sources';
      mapping.representation='ordered-entity-relations';
      mapping.targetResolution='Resolve each source key to its shared publication Geo ID; never publish source keys as relation targets.';
    }
    if(key==='authors'){
      mapping.candidatePropertyId='91a9e2f6e51a48f7997661de8561b690';
      mapping.status='requires-author-identity-resolution';
      mapping.representation='ordered-entity-relations';
      mapping.targetResolution='Root Authors is a Relation. Preserve original attribution text in provenance; resolve people/organizations before emitting authorship edges.';
    }
    if(key==='slug'){
      mapping.propertyId='b0305ef28312c519d954bc0efe22f013';
      mapping.status='reuse-live-route-slug';
      mapping.provenance='data/education/property-reuse-probe.json';
    }
    if(collection==='datasets'&&key==='notes'){
      mapping.propertyId='6d25739b9217e7c35103b37c3db12709';
      mapping.status='reuse-live-curator-notes';
      mapping.provenance='data/education/property-reuse-probe.json';
    }
    if(key==='category'||key==='tags'){
      mapping.propertyId=key==='category'?'06c899fb04334e679feb1fd56687c3d6':'257090341ba5406f94e4d4af90042fba';
      mapping.status='property-resolved-targets-pending';
      mapping.representation='ordered-entity-relations';
      mapping.targetResolution=`Resolve ${key==='category'?'Category':'Tag'} entities globally before creating targets; do not encode labels as text on this relation property.`;
      mapping.provenance='data/education/property-reuse-probe.json';
    }
    if(field.startsWith('continuum.')||key==='evidenceStrength')mapping.attribution='curated assessment, not measured study effect';
    if(['id','slug'].includes(key))mapping.identityRole='source identity retained alongside Geo ID; not itself a Geo ID';
    mappings.set(id,mapping);
  }
}
for(const record of intake.records)visit(record.collection,record.publicationData);
const plan={sourceCommit:intake.report.sourceCommit,targetSpaceId:intake.report.targetSpaceId,bounty:{id:'debce2de46094f299ee8e89fe244a9dc',spaceId:'ec349623f33236aee13c12dcd629ee81',required:true},collections:[...new Set(intake.records.map(r=>r.collection))],fields:[...mappings.values()],publicationReady:false};
await writeFile('data/education/mapping-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({sourceFields:plan.fields.length,propertyIdsResolved:plan.fields.filter(x=>x.propertyId).length,unresolvedPropertyIds:plan.fields.filter(x=>!x.propertyId).length,publicationReady:plan.publicationReady}));
