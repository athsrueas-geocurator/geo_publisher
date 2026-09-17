/** Public Geo routes require the destination space as well as the entity. */
export function geoEntityUrl(spaceId: string, entityId: string): string {
  const normalize = (id: string) => {
    if (!/^(?:[a-f0-9]{32}|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/i.test(id)) {
      throw new Error('Expected a Geo UUID, not a URL or path');
    }
    return id.replaceAll('-', '').toLowerCase();
  };
  return `https://www.geobrowser.io/space/${normalize(spaceId)}/${normalize(entityId)}`;
}

/** Merge milestones: submission must not erase preparation evidence. */
export function mergePublicationEvidence<T extends Record<string, unknown>>(journal: T, patch: Partial<T>): T {
  return { ...journal, ...patch };
}

export function assertOrderedBlocks(actual: { id: string; text: string }[], ids: string[], texts: string[], truncated: boolean): void {
  if (truncated) throw new Error('Block traversal is incomplete; cannot verify publication');
  if (actual.length !== ids.length || ids.length !== texts.length) throw new Error('Block count differs from the publication');
  actual.forEach((block, index) => {
    if (block.id !== ids[index] || block.text !== texts[index]) throw new Error(`Block ${index + 1} identity, order, or text differs`);
  });
}
