import { Platform } from 'react-native';

const getAsyncStorage = () => {
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage module not found or failed to load:', e);
    return null;
  }
};

const nativeStorage = getAsyncStorage();
const memoryStorage = new Map<string, string>();

export const AppStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      return memoryStorage.get(key) || null;
    }
    if (nativeStorage) {
      return nativeStorage.getItem(key);
    }
    return memoryStorage.get(key) || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (e) {
        console.error('Error writing to localStorage:', e);
      }
      memoryStorage.set(key, value);
      return;
    }
    if (nativeStorage) {
      return nativeStorage.setItem(key, value);
    }
    memoryStorage.set(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
      memoryStorage.delete(key);
      return;
    }
    if (nativeStorage) {
      return nativeStorage.removeItem(key);
    }
    memoryStorage.delete(key);
  },

  clear: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
          return;
        }
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      memoryStorage.clear();
      return;
    }
    if (nativeStorage) {
      return nativeStorage.clear();
    }
    memoryStorage.clear();
  }
};

export default AppStorage;
