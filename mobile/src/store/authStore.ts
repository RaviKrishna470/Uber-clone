import { create } from 'zustand';

import { ROLES } from '@/constants/roles';
import { refreshAccessToken } from '@/interceptors';
import { authService } from '@/services/auth.service';
import { tokenService } from '@/services/token.service';
import { userService } from '@/services/user.service';
import type { AuthResponse, OnboardingResponse } from '@/types/auth';
import type { User } from '@/types/user';

/**
 * loading     – restoring a saved session on app start
 * guest       – not logged in
 * onboarding  – logged in, but name/role not chosen yet
 * ready       – logged in with a complete profile
 */
export type AuthStatus = 'loading' | 'guest' | 'onboarding' | 'ready';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  hydrate: () => Promise<void>;
  signIn: (auth: AuthResponse) => Promise<void>;
  completeOnboarding: (res: OnboardingResponse) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const statusFor = (user: User): AuthStatus => (user.profile_complete ? 'ready' : 'onboarding');

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  async hydrate() {
    try {
      if (!(await tokenService.getRefreshToken())) {
        set({ status: 'guest', user: null });
        return;
      }
      await refreshAccessToken();
      const user = await userService.getMe();
      set({ user, status: statusFor(user) });
    } catch {
      await tokenService.clear();
      set({ status: 'guest', user: null });
    }
  },

  async signIn(auth) {
    await tokenService.setTokens(auth.access_token, auth.refresh_token);
    set({ user: auth.user, status: statusFor(auth.user) });
  },

  completeOnboarding(res) {
    // New access token carries the role chosen during onboarding.
    tokenService.setAccessToken(res.access_token);
    set({ user: res.user, status: statusFor(res.user) });
  },

  setUser(user) {
    set({ user, status: statusFor(user) });
  },

  async logout() {
    try {
      await authService.logout();
    } catch {
      // Server-side revoke is best effort; local credentials are cleared regardless.
    }
    await tokenService.clear();
    set({ status: 'guest', user: null });
  },
}));

// Refresh failed inside an interceptor: drop to the login screen.
tokenService.onSessionExpired(() => useAuthStore.setState({ status: 'guest', user: null }));

export const selectIsCustomer = (s: AuthState) => s.status === 'ready' && !!s.user?.roles.includes(ROLES.CUSTOMER);
export const selectIsDriver = (s: AuthState) =>
  s.status === 'ready' && !!s.user?.roles.includes(ROLES.DRIVER) && !s.user?.roles.includes(ROLES.CUSTOMER);
