import { create } from 'zustand'

import { ADMIN_ROLES } from '@/constants/config'
import { refreshAccessToken } from '@/interceptors'
import { authService } from '@/services/auth.service'
import { tokenService } from '@/services/token.service'
import type { AuthResponse, User } from '@/types'
import { AppError } from '@/utils/appError'

type Status = 'loading' | 'guest' | 'authenticated'

interface AuthState {
  status: Status
  user: User | null
  hydrate: () => Promise<void>
  signIn: (auth: AuthResponse) => Promise<void>
  logout: () => Promise<void>
}

const isAdmin = (u: User) => u.roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r))

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  async hydrate() {
    if (!tokenService.getRefreshToken()) {
      set({ status: 'guest' })
      return
    }
    try {
      await refreshAccessToken()
      const user = await authService.getMe()
      if (!isAdmin(user)) throw new Error('not admin')
      set({ status: 'authenticated', user })
    } catch {
      tokenService.clear()
      set({ status: 'guest', user: null })
    }
  },

  async signIn(auth) {
    tokenService.setTokens(auth.access_token, auth.refresh_token)
    if (!isAdmin(auth.user)) {
      await authService.logout().catch(() => undefined)
      tokenService.clear()
      throw new AppError('NOT_ADMIN', 'This account does not have admin access.')
    }
    set({ status: 'authenticated', user: auth.user })
  },

  async logout() {
    await authService.logout().catch(() => undefined)
    tokenService.clear()
    set({ status: 'guest', user: null })
  },
}))

tokenService.onSessionExpired(() => useAuthStore.setState({ status: 'guest', user: null }))

export const useIsSuperAdmin = () => useAuthStore((s) => !!s.user?.roles.includes('SUPER_ADMIN'))
