import type { AxiosInstance } from 'axios'

import { authInterceptor } from './auth.interceptor'
import { errorInterceptor } from './error.interceptor'
import { createRefreshInterceptor } from './refresh.interceptor'
import { requestIdInterceptor } from './requestId.interceptor'

/** request: request-id -> auth;  response: refresh-on-401 -> error normalisation (last). */
export function registerInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(requestIdInterceptor)
  client.interceptors.request.use(authInterceptor)
  client.interceptors.response.use(undefined, createRefreshInterceptor(client))
  client.interceptors.response.use(undefined, errorInterceptor)
}

export { refreshAccessToken } from './refresh.interceptor'
