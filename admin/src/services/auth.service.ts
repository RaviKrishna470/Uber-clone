import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { AuthResponse, OtpRequestResponse, User } from '@/types'
import { apiService } from './api.service'

export const authService = {
  requestOtp: (phone: string) => apiService.post<OtpRequestResponse>(API_ENDPOINTS.AUTH.OTP_REQUEST, { phone }),
  verifyOtp: (phone: string, code: string) =>
    apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, { phone, code }),
  getMe: () => apiService.get<User>(API_ENDPOINTS.USER.ME),
  logout: () => apiService.post<void>(API_ENDPOINTS.AUTH.LOGOUT),
}
