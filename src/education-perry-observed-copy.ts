// Heckman et al. (2010), Table 2: descriptive group means, not adjusted effects.
export function perryObservedCopy(row:any){
 const group=`${row.population==='female'?'women':'men'} in Perry Preschool’s ${row.assignment} group`;
 if(!['female','male'].includes(row.population)||!['treatment','control'].includes(row.assignment))throw Error(`Unreviewed group ${row.key}`);
 const percent=(value:string)=>(Number(value)*100).toFixed(8).replace(/\.?0+$/,'');
 let name:string;
 if(row.outcome==='Yearly earnings')name=`Mean annual earnings for ${group} were $${Number(row.value).toLocaleString('en-US')} at ${row.followup} (2006 USD).`;
 else {
  const predicate:Record<string,string>={
   'High-school graduation':`had graduated from high school at ${row.followup}`,
   'Currently employed':`were employed at ${row.followup}`,
   'Ever on welfare':`had received welfare during ${row.followup}`,
   'Ever arrested':`had been arrested ${row.followup}`,
  };
  if(!predicate[row.outcome]||row.unit!=='fraction')throw Error(`Unreviewed outcome ${row.key}`);
  name=`${percent(row.value)}% of ${group} ${predicate[row.outcome]}.`;
 }
 const uncertainty=row.unit==='fraction'?`${percent(row.standardError)} percentage points`:`$${Number(row.standardError).toLocaleString('en-US')} in 2006 USD`;
 const description=`Heckman and colleagues (2010), Table 2, report this group mean with a standard error of ${uncertainty}. It describes the observed study group, not an adjusted causal effect or the difference between treatment and control groups.`;
 return {name,description};
}
