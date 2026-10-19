/** All backend paths, relative to `${API_BASE_URL}/v1`. Services use these — never inline URLs. */
export const API_ENDPOINTS = {
  AUTH: {
    OTP_REQUEST: '/auth/otp/request',
    OTP_VERIFY: '/auth/otp/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    ME: '/me',
  },
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
    DRIVERS: '/admin/drivers',
    DRIVER_APPROVAL: (driverId: string) => `/admin/drivers/${driverId}/approval`,
  },
} as const

export const AUTH_FREE_ENDPOINTS: string[] = [
  API_ENDPOINTS.AUTH.OTP_REQUEST,
  API_ENDPOINTS.AUTH.OTP_VERIFY,
  API_ENDPOINTS.AUTH.REFRESH,
]
