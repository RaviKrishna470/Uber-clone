import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { OnboardingPayload, OnboardingResponse } from '@/types/auth';
import type { ProfileUpdatePayload, User } from '@/types/user';
import { apiService } from './api.service';

export const userService = {
  getMe: () => apiService.get<User>(API_ENDPOINTS.USER.ME),

  updateMe: (payload: ProfileUpdatePayload) =>
    apiService.patch<User, ProfileUpdatePayload>(API_ENDPOINTS.USER.ME, payload),

  completeOnboarding: (payload: OnboardingPayload) =>
    apiService.post<OnboardingResponse, OnboardingPayload>(API_ENDPOINTS.USER.ONBOARDING, payload),
};
