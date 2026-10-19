export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const API_URL = `${API_BASE_URL}/v1`
export const HTTP_TIMEOUT_MS = 15000
export const DEFAULT_PAGE_SIZE = 10

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

/** sessionStorage: the admin session ends when the browser tab closes. */
export const STORAGE_KEYS = { REFRESH_TOKEN: 'ridebook.admin.refresh_token' } as const
