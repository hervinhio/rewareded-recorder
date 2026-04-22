import { safeRemoveNode } from './dom-utils';

describe('global fetch availability', () => {
  it('provides fetch in test environment', () => {
    expect(globalThis.fetch).toBeDefined();
  });
});

describe('safeRemoveNode', () => {
  it('removes node when attached to parent', () => {
    const parent = document.createElement('div');
    const child = document.createElement('a');
    parent.appendChild(child);

    safeRemoveNode(child);

    expect(parent.contains(child)).toBe(false);
  });

  it('does not throw when node is already detached', () => {
    const detached = document.createElement('a');
    expect(() => safeRemoveNode(detached)).not.toThrow();
  });
});
