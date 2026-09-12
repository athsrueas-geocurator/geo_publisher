// Wording reviewed against Krueger (1999), Table V column 7 and discussion p. 514.
export function starExperimentalClaimCopy(row:any) {
  const grade=row.grade==='K'?'kindergarten':`grade ${row.grade}`;
  const small=row.arm==='small class';
  if(!['K','1','2','3'].includes(row.grade)||(!small&&row.arm!=='regular class with full-time aide'))throw Error(`Unreviewed STAR row ${row.key}`);
  const effect=Number(row.value).toFixed(2),se=Number(row.standardError).toFixed(2);
  const name=small
    ?`In Tennessee STAR, small-class assignment raised ${grade} achievement by an estimated ${effect} percentile points.`
    :row.grade==='1'
      ?`In Tennessee STAR, full-time-aide assignment raised grade 1 achievement by an estimated ${effect} percentile points.`
      :`In Tennessee STAR, full-time-aide assignment did not clearly improve ${grade} achievement.`;
  const description=small
    ?`Compared with regular classes without a full-time aide, the estimated gain in average Stanford test percentile rank was ${effect} points (class-clustered SE ${se}). Krueger (1999), Table V column 7, reports the effect of initial assignment, not a percentage increase in test scores.`
    :`Compared with regular classes without a full-time aide, the estimated gain in average Stanford test percentile rank was ${effect} points (class-clustered SE ${se}). Krueger (1999), Table V column 7, found a statistically significant aide gain only in grade 1, not a consistent gain across grades.`;
  return {name,description};
}
