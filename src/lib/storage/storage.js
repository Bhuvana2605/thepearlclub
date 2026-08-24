/**
 * Local-First Storage Abstraction Layer
 * Provides clean access to browser storage with JSON serialization.
 * Can be migrated to IndexedDB seamlessly in future versions.
 */

const STORAGE_PREFIX = 'pearl_club_';

const getFullKey = (key, userId = null) => {
  if (!userId) return `${STORAGE_PREFIX}guest_${key}`;
  return `${STORAGE_PREFIX}user_${userId}_${key}`;
};

export const storage = {
  /**
   * Save a key-value pair to local storage (general or user-scoped)
   */
  save: (key, value, userId = null) => {
    try {
      const fullKey = getFullKey(key, userId);
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (error) {
      console.error(`[Storage] Failed to save key "${key}":`, error);
      return false;
    }
  },

  /**
   * Retrieve a value by key, returning default if not found
   */
  get: (key, defaultValue = null, userId = null) => {
    try {
      const fullKey = getFullKey(key, userId);
      const item = localStorage.getItem(fullKey);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`[Storage] Failed to read key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Remove a specific key from storage
   */
  remove: (key, userId = null) => {
    try {
      const fullKey = getFullKey(key, userId);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error(`[Storage] Failed to remove key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all Pearl Club local data for a specific user or overall
   */
  clearUser: (userId) => {
    if (!userId) return;
    try {
      const prefix = `${STORAGE_PREFIX}user_${userId}_`;
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(prefix)) {
          localStorage.removeItem(k);
        }
      });
      return true;
    } catch (error) {
      console.error(`[Storage] Failed to clear user data for "${userId}":`, error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
      return true;
    } catch (error) {
      console.error('[Storage] Failed to clear local data:', error);
      return false;
    }
  }
};
