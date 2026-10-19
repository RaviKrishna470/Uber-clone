import * as SecureStore from 'expo-secure-store';

// Keychain (iOS) / Keystore-backed (Android) storage, per FR-01.
export const storageService = {
  getSecure: (key: string) => SecureStore.getItemAsync(key),
  setSecure: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeSecure: (key: string) => SecureStore.deleteItemAsync(key),
};
