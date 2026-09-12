import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='data/education';
const source=JSON.parse(readFileSync(`${root}/school-finance-jjp-transcription.json`,'utf8'));
const input=source.costIllustration;
if(createHash('sha256').update(readFileSync(source.sourcePdf)).digest('hex')!==source.sourceSha256)throw new Error('Reviewed source changed');
const annualCost=Number(input.baselineAnnualPerPupilSpending)*Number(input.spendingIncreaseFraction);
const pv=(amount:number,start:number,count:number,rate:number)=>Array.from({length:count},(_,i)=>amount/(1+rate)**(start+i)).reduce((a,b)=>a+b,0);
const annuity=(amount:number,start:number,count:number,rate:number)=>amount*(1-(1+rate)**(-count))/rate*(1+rate)**(1-start);
const scenarios=[];
for(const wageGain of [0.072,0.077])for(const costStart of [0,1])for(const earningsStart of [20,21])for(const earningsCount of [35,36]){
 const annualBenefit=Number(input.medianAnnualEarnings)*wageGain;
 const cost=pv(annualCost,costStart,12,.06),benefit=pv(annualBenefit,earningsStart,earningsCount,.06);
 if(Math.abs(cost-annuity(annualCost,costStart,12,.06))>1e-8||Math.abs(benefit-annuity(annualBenefit,earningsStart,earningsCount,.06))>1e-8)throw new Error('Independent annuity check failed');
 let lo=0,hi=.3;
 for(let i=0;i<100;i++){const rate=(lo+hi)/2;if(pv(annualBenefit,earningsStart,earningsCount,rate)>pv(annualCost,costStart,12,rate))lo=rate;else hi=rate;}
 const irr=(lo+hi)/2;
 if(Math.abs(pv(annualBenefit,earningsStart,earningsCount,irr)-pv(annualCost,costStart,12,irr))>1e-6)throw new Error('IRR root residual');
 scenarios.push({wageGain,costStart,earningsStart,earningsCount,cost,benefit,benefitCostRatio:benefit/cost,irr});
}
const report={checkedAt:new Date().toISOString(),sourceSha256:source.sourceSha256,sourceLocator:'Printed pp. 212–213; PDF pp. 57–58',authorReported:input,
 interpretation:'Sensitivity calculations, not the authors’ confirmed cash-flow schedule. Time zero is school entry in 1980 at age five. Costs are 12 equal annual increments; earnings increments are constant, with no growth, tax, survival or employment adjustments. Start 20 corresponds to age 25; start 21 tests one-year payment timing. 35/36 payments test exclusive/inclusive age-60 endpoints. No scenario is selected as an authoritative replacement.',
 scenarios,checks:{sourceFingerprint:true,independentAnnuityAgreement:true,irrRootResidual:true},
 conclusion:'The cost stream starting at time zero gives 4851.3448 USD, close to the reported rounded 4850. Neither wage percentage and tested timing convention reproduces a ratio of 3. Preserve the author-reported ratio and roughly 10% IRR with approximate qualifiers; do not silently overwrite them or rank this illustration as a reconciled cost-effectiveness estimate.',
 computedComparisonEligible:false};
writeFileSync(`${root}/school-finance-jjp-cost-reconciliation.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scenarios:scenarios.length,bcrRange:[Math.min(...scenarios.map(s=>s.benefitCostRatio)),Math.max(...scenarios.map(s=>s.benefitCostRatio))],baseline:scenarios.find(s=>s.wageGain===.072&&s.costStart===0&&s.earningsStart===20&&s.earningsCount===36),checks:report.checks}));
