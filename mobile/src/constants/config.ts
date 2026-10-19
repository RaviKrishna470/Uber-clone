// EXPO_PUBLIC_* values are inlined at build time from mobile/.env
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000';
export const API_URL = `${API_BASE_URL}/v1`;
export const WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/v1/ws`;

export const HTTP_TIMEOUT_MS = 15000;

export const PHONE_COUNTRY_CODE = '+91';
export const PHONE_LOCAL_LENGTH = 10;
export const OTP_LENGTH = 6;
