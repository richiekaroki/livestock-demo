import { describe, it, expect, vi } from 'vitest';

vi.mock('../offlineQueue', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../offlineQueue')>();
  return {
    ...mod,
    enqueue: vi.fn().mockResolvedValue({
      id: 'queue-1',
      method: 'POST',
      path: '/animals',
      timestamp: '2026-01-01T00:00:00Z',
      retryCount: 0,
      status: 'pending',
    }),
  };
});

import { generateId } from '../offlineQueue';

describe('offlineQueue generateId', () => {
  it('generates a string with timestamp and random suffix', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^\d+_[a-z0-9]+$/);
  });

  it('produces unique ids on successive calls', () => {
    const ids = new Set(Array.from({ length: 200 }, () => generateId()));
    expect(ids.size).toBe(200);
  });
});
