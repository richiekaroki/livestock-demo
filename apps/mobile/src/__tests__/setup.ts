// Global setup for React Native modules in Node test environment
vi.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (obj: any) => obj.ios },
  StyleSheet: { create: (s: any) => s },
  Alert: { alert: vi.fn() },
}));

vi.mock('react-native/Libraries/Utilities/Platform', () => ({
  default: { OS: 'ios', select: (obj: any) => obj.ios },
}));

vi.mock('sentry-expo', () => ({
  Native: { captureMessage: vi.fn() },
  Browser: { captureMessage: vi.fn() },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn().mockResolvedValue(null),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('expo-modules-core', () => ({
  requireNativeModule: vi.fn().mockReturnValue({}),
  Platform: { OS: 'ios', select: (obj: any) => obj.ios },
}));

const store = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => { store.set(key, value); },
    removeItem: async (key: string) => { store.delete(key); },
    clear: async () => { store.clear(); },
    getAllKeys: async () => [...store.keys()],
    multiGet: async (keys: string[]) => keys.map((k) => [k, store.get(k) ?? null]),
    multiSet: async (entries: [string, string][]) => entries.forEach(([k, v]) => store.set(k, v)),
    multiRemove: async (keys: string[]) => keys.forEach((k) => store.delete(k)),
  },
  __esModule: true,
}));

vi.mock('@react-native-community/netinfo', () => ({
  default: { fetch: vi.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }) },
  __esModule: true,
}));
