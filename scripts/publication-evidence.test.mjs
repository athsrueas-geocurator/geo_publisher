import { test, expect } from 'bun:test';
import { geoEntityUrl, mergePublicationEvidence, assertOrderedBlocks } from '../src/publication-evidence.ts';

test('share URLs include space scope and normalize UUIDs', () => {
  expect(geoEntityUrl('d00460c2-0377-9d21-d96f-cfc6102d7a72', 'D850F645745745BAB44627E7CFAF28B4')).toBe('https://www.geobrowser.io/space/d00460c203779d21d96fcfc6102d7a72/d850f645745745bab44627e7cfaf28b4');
  expect(() => geoEntityUrl('../entity', 'bad')).toThrow();
});
test('submission retains edit, CID, and block evidence', () => {
  const prepared = { state: 'prepared', editId: 'edit', cid: 'ipfs://content', blocks: ['one'] };
  expect(mergePublicationEvidence(prepared, { state: 'submitted' })).toEqual({ ...prepared, state: 'submitted' });
});
test('verification rejects missing, reordered, changed and truncated blocks', () => {
  const actual = [{ id: 'a', text: 'one' }, { id: 'b', text: 'two' }];
  expect(() => assertOrderedBlocks(actual, ['a', 'b'], ['one', 'two'], false)).not.toThrow();
  expect(() => assertOrderedBlocks(actual.slice(1), ['a', 'b'], ['one', 'two'], false)).toThrow();
  expect(() => assertOrderedBlocks([...actual].reverse(), ['a', 'b'], ['one', 'two'], false)).toThrow();
  expect(() => assertOrderedBlocks(actual, ['a', 'b'], ['one', 'changed'], false)).toThrow();
  expect(() => assertOrderedBlocks(actual, ['a', 'b'], ['one', 'two'], true)).toThrow();
});
