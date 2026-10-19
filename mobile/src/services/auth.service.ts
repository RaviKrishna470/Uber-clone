import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type {
  AuthResponse,
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
} from '@/types/auth';
import { apiService } from './api.service';

export const authService = {
  requestOtp: (phone: string) =>
    apiService.post<OtpRequestResponse, OtpRequestPayload>(API_ENDPOINTS.AUTH.OTP_REQUEST, { phone }),

  verifyOtp: (phone: string, code: string) =>
    apiService.post<AuthResponse, OtpVerifyPayload>(API_ENDPOINTS.AUTH.OTP_VERIFY, { phone, code }),

  logout: () => apiService.post<void>(API_ENDPOINTS.AUTH.LOGOUT),
};
