/**
 * User preferences persistence utilities
 * Handles saving and loading user preferences across sessions
 */

export interface UserPreferences {
  filters: {
    type: string;
    health: string;
    county: string;
  };
  activeTab: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  animationEnabled: boolean;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  filters: {
    type: '',
    health: '',
    county: '',
  },
  activeTab: 'overview',
  theme: 'system',
  language: 'en',
  animationEnabled: true,
  compactMode: false,
};

const PREFERENCES_KEY = 'wam-mfugo-preferences';

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): void {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Failed to reset preferences:', error);
  }
}

/**
 * Get a specific preference value
 */
export function getPreference<K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] {
  const preferences = loadPreferences();
  return preferences[key];
}

/**
 * Set a specific preference value
 */
export function setPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void {
  savePreferences({ [key]: value });
}