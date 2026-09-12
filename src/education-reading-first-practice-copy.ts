// Source review: RFIS (2008), Exhibits 2.1–2.4, discussion pp.17–23, Appendix D.2–D.4.
const labels:Record<string,string>={
 'instruction-total':'observed time teaching the five reading components',
 'instruction-explicit':'share of observed reading intervals with highly explicit instruction',
 'instruction-practice':'share of observed reading intervals with high-quality student practice',
 'instruction-phonemic':'observed phonemic-awareness instruction',
 'instruction-phonics':'observed phonics instruction',
 'instruction-vocabulary':'observed vocabulary instruction',
 'instruction-fluency':'observed fluency instruction',
 'instruction-comprehension':'observed comprehension instruction',
 'print-engagement':'observed share of students engaged with print',
 'survey-pd-hours':'teacher-reported reading professional development',
 'survey-pd-components':'teacher-reported coverage of reading components in professional development',
 'survey-coaching':'reported share of teachers receiving coaching',
 'survey-coach-time':'reported share of coaches’ time dedicated to K–3 reading coaching',
 'survey-reading-minutes':'teacher-reported daily reading instruction',
 'survey-differentiated-materials':'reported availability of differentiated materials for struggling readers',
 'survey-extra-practice':'teacher-reported extra practice for struggling readers',
 'survey-assessments':'teacher-reported use of assessments to inform classroom practice',
};
export function readingFirstPracticeCopy(row:any,representation:string){
 const label=labels[row.key.replace(/-g[12]$/,'')],e=row[representation];
 if(!label||!e||!['native','standardized'].includes(representation))throw Error(`Unreviewed practice copy ${row.key}/${representation}`);
 const subject=`${label}${row.grade?` in grade ${row.grade}`:''}`;
 // Titles preserve native proportions; no invented percentage conversion or derived effect.
 const unit=representation==='standardized'?'SD':e.unit;
 const change=`${e.value} ${unit}`;
 const name=row.reportedSignificantAt05
  ?`Reading First increased ${subject} by an estimated ${change}.`
  :`Reading First did not establish a clear change in ${subject} (estimate: ${change}).`;
 const survey=row.key.startsWith('survey-'),print=row.key.startsWith('print-');
 const period=survey?'Spring 2007 self-reports':print?'2006–2007 school-year observations':'2005–2007 observations';
 const loc=row.sourceLocations.map((l:any)=>l.exhibit).join('/');
 const uncertainty=e.standardError===null
  ?`p ${row.pValue.operator} ${row.pValue.value}; SE and CI not reported`
  :`SE ${e.standardError}; 95% CI ${e.confidenceInterval.lower} to ${e.confidenceInterval.upper}; p ${row.pValue.operator} ${row.pValue.value}`;
 const description=`${period}: adjusted impact versus estimated outcomes without funding (${uncertainty}; RFIS ${loc}). ${representation==='standardized'?'This is the same contrast in standard deviations of the measured practice, not student achievement.':'These sampled-school findings concern teaching practices, not gains in student achievement.'}`;
 return {name,description};
}
