import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Ops, Position, SystemIds, type Op } from '@geoprotocol/geo-sdk';
import { publishOps } from '../src/functions';
import { geoEntityUrl, mergePublicationEvidence } from '../src/publication-evidence';

if (process.argv.slice(2).length !== 1 || process.argv[2] !== '--submit') {
  throw Error('Publishing requires --submit. For the existing post, run bun scripts/verify-knowledge-gap-quiz.ts; do not recreate it.');
}

const root = 'data/book-curation';
const path = `${root}/knowledge-gap-quiz-publication.json`;
const spaceId = 'd00460c203779d21d96fcfc6102d7a72';
const postType = 'f3d4461486b74d2583d89709c9d84f65';
const description = 'A three-card reading-comprehension quiz. One claim overstates what the research supports.';
const cards = [
  '## Three claims about reading comprehension\n\nOne of these overstates what the research supports. Which one?',
  '### 1. Background knowledge\n\nReading comprehension depends heavily on background knowledge, not just general reading “skills.”',
  '### 2. Decoding is not understanding\n\nStudents can struggle to understand a passage even when they can decode every word in it.',
  '### 3. Strategy instruction wins\n\nResearch shows that teaching transferable comprehension strategies like “finding the main idea” is more effective than systematically building students’ knowledge of science, history, and the arts.',
  '## Reveal coming next\n\nThe evidence review and book reference will be added here after readers have had a chance to choose.',
];
type Journal = { state: string; postId: string; blockIds: string[]; transactionHash?: string; receipt?: unknown; spaceId?: string; operationCount?: number; blocks?: string[]; editId?: string; cid?: string; url?: string };
const id = () => randomUUID().replaceAll('-', '');
let journal: Journal = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { state: 'ready', postId: id(), blockIds: cards.map(id) };
const save = (patch: Partial<Journal>) => {
  journal = mergePublicationEvidence(journal, patch);
  writeFileSync(path, JSON.stringify(journal, null, 2) + '\n');
};
if (journal.state !== 'ready') throw Error(`Quiz publication is already ${journal.state}; inspect its journal instead of retrying.`);
const ops: Op[] = [
  ...Ops.entities.create({ id: journal.postId, name: 'The Knowledge Gap: three claims', description, types: [postType] }).ops,
];
let previous: string | null = null;
for (const [index, text] of cards.entries()) {
  const position = Position.generateBetween(previous, null);
  previous = position;
  ops.push(...Ops.textBlocks.create({ id: journal.blockIds[index], fromId: journal.postId, text, position }).ops);
}
save({ state: 'prepared', spaceId, operationCount: ops.length, blocks: cards, url: geoEntityUrl(spaceId, journal.postId) });
const transactionHash = await publishOps(ops, 'Publish The Knowledge Gap reading-comprehension quiz', spaceId, {
  onPrepared: (details) => {
    if (details.kind !== 'personal' || details.spaceId.replaceAll('-', '') !== spaceId) throw Error('Expected the requested personal space');
    save({ state: 'prepared', editId: details.editId, cid: details.cid });
  },
  onSubmitting: () => save({ state: 'submitting' }),
  onSubmitted: (hash) => save({ state: 'submitted', transactionHash: hash }),
});
console.log(JSON.stringify({ state: 'submitted', url: journal.url, transactionHash, next: 'Run bun scripts/verify-knowledge-gap-quiz.ts, then inspect the rendered URL before announcing it as live.' }, null, 2));
