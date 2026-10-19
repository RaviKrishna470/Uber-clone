/**
 * Every backend path lives here. Services import from this file — never hardcode a URL in a service or screen.
 * Paths are relative to `${API_BASE_URL}/v1` (see constants/config.ts).
 */
export const API_ENDPOINTS = {
  AUTH: {
    OTP_REQUEST: '/auth/otp/request',
    OTP_VERIFY: '/auth/otp/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    ME: '/me',
    ONBOARDING: '/me/onboarding',
  },
  DRIVER: {
    APPLY: '/drivers/apply',
    ME: '/drivers/me',
    AVAILABILITY: '/drivers/me/availability',
    LOCATION: '/drivers/me/location',
  },

  // ---- Upcoming phases (backend not implemented yet) ----
  FARE: {
    QUOTES: '/fare-quotes',
  },
  RIDES: {
    LIST: '/rides',
    CREATE: '/rides',
    DETAIL: (rideId: string) => `/rides/${rideId}`,
    CANCEL: (rideId: string) => `/rides/${rideId}/cancel`,
    TRANSITION: (rideId: string) => `/rides/${rideId}/transition`,
  },
  OFFERS: {
    ACCEPT: (offerId: string) => `/offers/${offerId}/accept`,
    REJECT: (offerId: string) => `/offers/${offerId}/reject`,
  },
  PAYMENTS: {
    ORDERS: '/payments/orders',
    VERIFY: '/payments/verify',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
} as const;

/** Endpoints that must never trigger the refresh-and-retry flow. */
export const AUTH_FREE_ENDPOINTS: string[] = [
  API_ENDPOINTS.AUTH.OTP_REQUEST,
  API_ENDPOINTS.AUTH.OTP_VERIFY,
  API_ENDPOINTS.AUTH.REFRESH,
];
