import type { AxiosRequestConfig } from 'axios'

import { httpClient } from './httpClient'

/** Generic verbs — the only place that touches the axios instance. Resolves to the body, rejects with AppError. */
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => httpClient.get<T>(url, config).then((r) => r.data),
  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    httpClient.post<T>(url, body, config).then((r) => r.data),
  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    httpClient.put<T>(url, body, config).then((r) => r.data),
  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    httpClient.patch<T>(url, body, config).then((r) => r.data),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => httpClient.delete<T>(url, config).then((r) => r.data),
}
