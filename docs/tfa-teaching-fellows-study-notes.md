# TFA and Teaching Fellows secondary-math evaluation notes

Primary report retrieved 2026-09-12: Clark et al. (2013), *The Effectiveness of Secondary Math Teachers from Teach For America and the Teaching Fellows Programs*, NCEE 2013-4015. It is the first large-scale random-assignment study of secondary math teachers from the two programs, comparing each with other teachers teaching the same courses in the same schools. The study does not support a direct TFA-versus-Teaching-Fellows comparison.

Table V.1 reports the TFA comparison: +0.07 SD on end-of-year student math achievement, p=0.000, with 2,292 students assigned to TFA teachers and 2,281 assigned to comparison teachers, across 111 classroom matches, 66 TFA teachers, 70 comparison teachers, and 45 schools. The report interprets this as 2.6 months of average national learning, but that conversion is an illustrative benchmark rather than a second outcome.

Table VIII.1 reports the Teaching Fellows comparison: 0.00 SD, p=0.956, with 2,127 students assigned to Teaching Fellows teachers and 1,989 assigned to comparison teachers, across 118 classroom matches, 69 Teaching Fellows teachers, 84 comparison teachers, and 44 schools. Table VIII.2 restricts to similar teaching experience and reports +0.03 SD, p=0.399, for 661 and 622 students respectively. Neither null result proves zero effect.

Figure ES.1 reports TFA comparisons of +0.09 SD against traditionally certified comparison teachers and +0.06 SD against less-selective alternative-route comparison teachers; the figure marks both significant after multiple-hypothesis adjustment. Figure ES.2 reports Teaching Fellows at +0.13 SD against less-selective alternative-route teachers and 0.00 SD against traditionally certified teachers, with the +0.13 SD figure significant after adjustment. These subgroup comparisons overlap their program-wide rows and must not be counted as independent trials.

## Geo publication record

The factual evidence package is proposal `2c59f5ec3b6e4a4fb410261ebff4e5b2`, bounty transaction `0x471561a399793183d62874e4ba081f0c424261c9fe51da5cd834b187e59c3f33`, and Fast Path vote `0x0c7e54966cd334a1b6dced6fdaa18e87dba7e6e7bb306c78add66dc718a29791`. The linked nonfactual Claim is proposal `76a001f12088419080d5b71902786f4b`, bounty transaction `0xa47477cb810ff5449d438ff1501deccf5680e102e7a132ab8b61706a7aff1003`, and vote `0xa31bcf49b460c33a33946b0bd5b7fde3fa32054b7243bbcce4bd724799009217`.

The first debate parent overgeneralized from the study by treating Teaching Fellows' null estimates as opposing evidence against recruiting alternative-route teachers. Repair proposal `96e733de054e45a8a6f91f41e7c48cac`, bounty transaction `0x90d13cdb6089b9b6946413bd8d83e88c82853b3cf9f11759277debfdcdada194`, and vote `0x19af76d02cca60091472b9cc1c9b4d0faf445d5f34d42c0067e4940fe770f2f0` retain all seven factual Claims and their Related links, remove those three erroneous Opposing links, and reclassify them as support for the narrower proposition: districts should evaluate alternative-route pipelines separately rather than generalize results from one program to another.

Collection follow-up: `bun run education:discover-tfa-collection` performs complete all-space identity and incoming-membership checks for the seven factual Claims before any result block is planned. Its output is `data/education/tfa-collection-discovery.json`; it is planning evidence only.

The 2026-09-12 run found the known Article title as one source-identity candidate, no candidate under the result-collection alias, and zero incoming `Collection-item` memberships for all seven Claims. This supports preparing a separate result block while reusing the Article and Claims; it does not authorize publication.

The shared prepare-only build now succeeds with `bun run education:prepare-tfa-collection` followed by `education:build-collection`, producing `data/education/tfa-collection-batch.json` with 22 operations and seven reused Claims. The two table columns retain the typed impact and source-defined measure; overlapping subgroup rows remain explicitly non-independent.
