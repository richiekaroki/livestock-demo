import { describe, it, expect, vi, beforeEach } from 'vitest';
import NetInfo from '@react-native-community/netinfo';

// Mock enqueue used by apiCall when offline
vi.mock('../offlineQueue', () => ({
  enqueue: vi.fn().mockResolvedValue({
    id: 'offline-1',
    method: 'POST',
    path: '/vaccinations',
    body: { type: 'routine' },
    timestamp: '2026-01-01T00:00:00Z',
    retryCount: 0,
    status: 'pending',
  }),
}));

import { enqueue } from '../offlineQueue';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ success: true, data: [] }), { status: 200 })
  );
});

describe('api', () => {
  it('isOnline returns true when connected', async () => {
    const { isOnline } = await import('../api');
    const result = await isOnline();
    expect(result).toBe(true);
    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  it('isOnline returns false when disconnected', async () => {
    vi.mocked(NetInfo.fetch).mockResolvedValueOnce({ isConnected: false, isInternetReachable: false } as any);
    const { isOnline } = await import('../api');
    const result = await isOnline();
    expect(result).toBe(false);
  });

  it('apiCall online sends request to fetch', async () => {
    const { apiCall } = await import('../api');
    const result = await apiCall<{ success: boolean; data: any }>('POST', '/animals', { name: 'Cow' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/animals'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Cow' }) })
    );
    expect(result).toEqual({ success: true, data: [] });
  });

  it('apiCall offline enqueues and returns queued response', async () => {
    vi.mocked(NetInfo.fetch).mockResolvedValueOnce({ isConnected: false, isInternetReachable: false } as any);
    const { apiCall } = await import('../api');
    const result = await apiCall('POST', '/vaccinations', { type: 'routine' });
    expect(result).toEqual({
      queued: true,
      queueId: 'offline-1',
      message: 'Queued — will sync when online',
    });
    expect(enqueue).toHaveBeenCalledWith('POST', '/vaccinations', { type: 'routine' });
  });
});
