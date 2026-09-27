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

/**
 * Utility functions for phone number normalization and comparison.
 * Supports Algerian phone formats (+213, 00213, 05/06/07), raw short test numbers (e.g., 6666666),
 * and various punctuation/spacing styles.
 */
export const normalizePhoneNumber = (raw: string): string => {
  if (!raw) return '';
  // Extract all digit characters
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Remove Algerian international prefix: 00213 or 213
  if (digits.startsWith('00213')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('213') && digits.length >= 8) {
    digits = digits.slice(3);
  }

  // Remove leading zeros (e.g. 0666 -> 666, 0550 -> 550)
  digits = digits.replace(/^0+/, '');

  return digits;
};

export const arePhoneNumbersEqual = (phone1: string, phone2: string): boolean => {
  if (!phone1 || !phone2) return false;
  const norm1 = normalizePhoneNumber(phone1);
  const norm2 = normalizePhoneNumber(phone2);

  if (!norm1 || !norm2) return false;

  // Direct exact match of normalized digits
  if (norm1 === norm2) return true;

  // Check matching suffix when both have at least 6 digits
  const minLen = Math.min(norm1.length, norm2.length);
  if (minLen >= 6) {
    if (norm1.slice(-minLen) === norm2.slice(-minLen)) {
      return true;
    }
  }

  return false;
};
