// Source: Heckman et al. (2010), Table 1 and its notes, pp.115–117.
export function perryEconomicCopy(row:any){
 const population:Record<string,string>={all:'the pooled sample',male:'male participants',female:'female participants'};
 const group=population[row.population];
 const irr=row.kind==='modeled-internal-return';
 if(!group||!['modeled-internal-return','modeled-benefit-cost-ratio'].includes(row.kind))throw Error(`Unreviewed economic row ${row.key}`);
 const percent=(v:string)=>Number((Number(v)*100).toFixed(6)).toString();
 const perspective=row.perspective==='individual'?'participants':'society';
 const name=irr
  ?`Perry's modeled annual real return to ${perspective} is ${percent(row.value)}% for ${group} with ${percent(row.deadweightLossFraction)}% tax-financing welfare loss.`
  :`Perry's modeled societal benefit/cost ratio is ${row.value} for ${group} at a ${percent(row.realDiscountRate)}% discount rate.`;
 const uncertainty=irr?`${percent(row.standardError)} percentage points`:`${row.standardError}`;
 const crime=row.crimeValuation==='high'?'$4.1 million per murder':row.crimeValuation==='low'?'$13,000 per murder':'no public crime benefits in the participant perspective';
 const description=`Heckman and colleagues (2010), Table 1, report SE ${uncertainty}, assuming ${crime}. Tax-financing welfare loss is $${Number(row.deadweightLossFraction).toFixed(2)} per tax dollar; lifetime returns include projected earnings after age 40, not solely observed outcomes.`;
 return {name,description};
}
