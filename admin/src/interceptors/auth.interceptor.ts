import type { InternalAxiosRequestConfig } from 'axios'

import { tokenService } from '@/services/token.service'

export const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = tokenService.getAccessToken()
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
}
