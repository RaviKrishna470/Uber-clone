import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { API_ENDPOINTS, AUTH_FREE_ENDPOINTS } from '@/constants/apiEndpoints';
import { API_URL, HTTP_TIMEOUT_MS } from '@/constants/config';
import { tokenService } from '@/services/token.service';
import type { TokenPair } from '@/types/auth';

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// A bare client without interceptors, so the refresh call itself can never loop.
const refreshClient = axios.create({ baseURL: API_URL, timeout: HTTP_TIMEOUT_MS });

let inFlight: Promise<string> | null = null;

/** Exchanges the stored refresh token for a new pair. Concurrent 401s share a single refresh request. */
export function refreshAccessToken(): Promise<string> {
  if (!inFlight) {
    inFlight = (async () => {
      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await refreshClient.post<TokenPair>(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });
      await tokenService.setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    })().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/** On 401: refresh once, then replay the original request. If refresh fails, end the session. */
export const createRefreshInterceptor = (client: AxiosInstance) => async (error: AxiosError) => {
  const original = error.config as RetriableConfig | undefined;
  const isAuthFree = AUTH_FREE_ENDPOINTS.some((path) => original?.url?.endsWith(path));

  if (error.response?.status !== 401 || !original || original._retried || isAuthFree) {
    return Promise.reject(error);
  }

  original._retried = true;
  try {
    const token = await refreshAccessToken();
    original.headers.set('Authorization', `Bearer ${token}`);
    return client(original);
  } catch (refreshError) {
    await tokenService.clear();
    tokenService.notifySessionExpired();
    return Promise.reject(axios.isAxiosError(refreshError) ? refreshError : error);
  }
};
