import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storageService } from './storage.service';

/**
 * Holds the session tokens. The access token lives only in memory; the refresh token is in secure storage.
 * Interceptors read from here, which keeps them independent of the UI store (no circular imports).
 */
let accessToken: string | null = null;
let sessionExpiredListener: (() => void) | null = null;

export const tokenService = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },

  getRefreshToken: () => storageService.getSecure(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => storageService.setSecure(STORAGE_KEYS.REFRESH_TOKEN, token),

  async setTokens(access: string, refresh: string) {
    accessToken = access;
    await storageService.setSecure(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  },

  async clear() {
    accessToken = null;
    await storageService.removeSecure(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /** Called by the refresh interceptor when the session can no longer be renewed. */
  onSessionExpired(listener: () => void) {
    sessionExpiredListener = listener;
  },
  notifySessionExpired() {
    sessionExpiredListener?.();
  },
};
