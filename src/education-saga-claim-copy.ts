// Content is generated from reviewed source records and reader-facing vocabulary supplied by the model file.
export function sagaClaimCopy(row:any,model:any){
 const measure=model.measures[row.measureKey],mechanism=model.mechanisms[row.estimand];
 if(!measure||!mechanism)throw new Error(`Unreviewed claim wording: ${row.key}`);
 const value=Number(row.value),magnitude=row.value.replace(/^-/,'');
 const higher=value<0?'lower':'higher',fewer=value<0?'fewer':'more';
 let finding:string;
 if(measure.kind==='score')finding=`${measure.label} ${magnitude} ${measure.unit} ${higher}`;
 else if(measure.kind==='count')finding=`${magnitude} ${fewer} ${measure.label}`;
 else if(measure.kind==='fraction'){
  // Display conversion only. The original fraction is retained in the description and numeric property.
  const points=(Math.abs(value)*100).toFixed(Math.max(0,(row.value.split('.')[1]?.length??0)-2)).replace(/\.0+$/,'');
  finding=`${measure.label} ${points} percentage ${Number(points)===1?'point':'points'} ${higher}`;
 }else if(measure.kind==='unknown')finding='';
 else throw new Error('Unreviewed unit');
 const name=measure.kind==='unknown'
  ?`Saga's Chicago study ${row.study} found no clear first-year effect of ${mechanism} on out-of-school suspensions.`
  :`Saga's Chicago study ${row.study} estimated ${finding} from ${mechanism} in year one.`;
 const n=new Intl.NumberFormat('en-US').format(row.n);
 const first=`${model.estimands[row.estimand]} estimate ${row.value}${measure.kind==='fraction'?' on the fraction scale':''} (SE ${row.standardError}; ${n} observations; Table ${row.table}, p. ${row.printedPage}).`;
 let interpretation:string;
 if(measure.kind==='unknown')interpretation='The suspension unit remains unresolved: the table does not clearly distinguish days from events.';
 else if(row.panel==='A')interpretation=model.interpretations.math;
 else if(row.measureKey==='cps-reading')interpretation=model.interpretations.reading;
 else if(row.panel==='B')interpretation=model.interpretations[row.study===1?'study1Nonmath':'study2Nonmath'];
 else interpretation=model.interpretations[row.study===1?'study1Behavior':'study2Behavior'];
 return {name,description:`${first} ${interpretation}`};
}
