import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'opony_access_token',
  refreshToken: 'opony_refresh_token',
} as const;

export const secureStorage = {
  getAccessToken: () => SecureStore.getItemAsync(KEYS.accessToken),
  setAccessToken: (token: string) => SecureStore.setItemAsync(KEYS.accessToken, token),
  getRefreshToken: () => SecureStore.getItemAsync(KEYS.refreshToken),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(KEYS.refreshToken, token),
  clearAll: async () => {
    await SecureStore.deleteItemAsync(KEYS.accessToken);
    await SecureStore.deleteItemAsync(KEYS.refreshToken);
  },
  // Zustand persist adapter
  zustandAdapter: {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  },
};
