/**
 * Safe storage wrapper that gracefully handles restricted environments
 * (e.g. cross-origin iframes, private browsing, quota exceeded, blocked third-party storage)
 * with an in-memory fallback to prevent SecurityError / DOMException crashes.
 */

class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryStorage = new MemoryStorage();

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fallback to in-memory
      }
    }
    return memoryStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to in-memory on quota or security restriction
      }
    }
    memoryStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        // Fallback
      }
    }
    memoryStorage.removeItem(key);
  },

  getJSON<T>(key: string, fallback: T): T {
    try {
      const raw = this.getItem(key);
      if (!raw || raw === 'undefined' || raw === 'null') {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  },
};
