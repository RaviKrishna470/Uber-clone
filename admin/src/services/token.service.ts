import { STORAGE_KEYS } from '@/constants/config'

let accessToken: string | null = null
let sessionExpiredListener: (() => void) | null = null

const safeSession = {
  get: (k: string) => {
    try {
      return sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v)
    } catch {
      /* storage unavailable */
    }
  },
  remove: (k: string) => {
    try {
      sessionStorage.removeItem(k)
    } catch {
      /* storage unavailable */
    }
  },
}

/** Access token in memory only; refresh token in sessionStorage. */
export const tokenService = {
  getAccessToken: () => accessToken,
  setAccessToken: (t: string | null) => {
    accessToken = t
  },
  getRefreshToken: () => safeSession.get(STORAGE_KEYS.REFRESH_TOKEN),
  setTokens(access: string, refresh: string) {
    accessToken = access
    safeSession.set(STORAGE_KEYS.REFRESH_TOKEN, refresh)
  },
  clear() {
    accessToken = null
    safeSession.remove(STORAGE_KEYS.REFRESH_TOKEN)
  },
  onSessionExpired(listener: () => void) {
    sessionExpiredListener = listener
  },
  notifySessionExpired() {
    sessionExpiredListener?.()
  },
}
