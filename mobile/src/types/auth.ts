import type { SelfAssignableRole } from '@/constants/roles';
import type { User } from './user';

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpRequestResponse {
  message: string;
  expires_in: number;
  resend_after: number;
  /** Only present when the backend runs with ENV=development (mock OTP provider). */
  dev_code?: string | null;
}

export interface OtpVerifyPayload {
  phone: string;
  code: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface AuthResponse extends TokenPair {
  user: User;
  is_new_user: boolean;
}

export interface OnboardingPayload {
  name: string;
  role: SelfAssignableRole;
  email?: string;
}

export interface OnboardingResponse {
  user: User;
  access_token: string;
  expires_in: number;
}
