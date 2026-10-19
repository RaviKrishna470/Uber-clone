import type { InternalAxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';

/** Adds X-Request-Id so a request can be traced in backend logs. */
export const requestIdInterceptor = (config: InternalAxiosRequestConfig) => {
  config.headers.set('X-Request-Id', Crypto.randomUUID().replace(/-/g, ''));
  return config;
};
