/**
 * Safe localStorage getter with JSON parsing
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe localStorage setter with JSON stringify
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
}

/**
 * Clear all localStorage items with a specific prefix
 */
export function clearStoragePrefix(prefix: string): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(prefix)
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage items:', error);
  }
}

