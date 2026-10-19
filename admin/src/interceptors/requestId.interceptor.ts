import type { InternalAxiosRequestConfig } from 'axios'

export const requestIdInterceptor = (config: InternalAxiosRequestConfig) => {
  config.headers.set('X-Request-Id', crypto.randomUUID().replace(/-/g, ''))
  return config
}
