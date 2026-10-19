import axios from 'axios';

import { API_URL, HTTP_TIMEOUT_MS } from '@/constants/config';
import { registerInterceptors } from '@/interceptors';

/** The single axios instance. Only api.service.ts should use it directly. */
export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

registerInterceptors(httpClient);
