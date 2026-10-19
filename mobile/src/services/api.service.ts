import type { AxiosRequestConfig } from 'axios';

import { httpClient } from './httpClient';

/**
 * Generic HTTP verbs. Every domain service goes through these. Each one returns the response body
 * and rejects with an AppError (see interceptors/error.interceptor.ts).
 */
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => httpClient.get<T>(url, config).then((r) => r.data),

  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    httpClient.post<T>(url, body, config).then((r) => r.data),

  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    httpClient.put<T>(url, body, config).then((r) => r.data),

  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    httpClient.patch<T>(url, body, config).then((r) => r.data),

  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<T>(url, config).then((r) => r.data),
};
