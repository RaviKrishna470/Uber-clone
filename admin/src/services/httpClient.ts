import axios from 'axios'

import { API_URL, HTTP_TIMEOUT_MS } from '@/constants/config'
import { registerInterceptors } from '@/interceptors'

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

registerInterceptors(httpClient)
