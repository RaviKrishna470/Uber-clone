export type Role = 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN'
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface ApiErrorBody {
  error: { code: string; message: string; request_id?: string; details?: Record<string, unknown> }
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface User {
  id: string
  phone: string
  name: string | null
  email: string | null
  account_status: AccountStatus
  roles: Role[]
  profile_complete: boolean
  created_at: string
}

export interface Vehicle {
  id: string
  registration_number: string
  vehicle_type: 'BIKE' | 'AUTO' | 'CAR'
  make_model: string | null
  color: string | null
  active: boolean
}

export interface AdminDriver {
  id: string
  user_id: string
  license_number: string
  approval_status: ApprovalStatus
  availability_status: 'ONLINE' | 'OFFLINE'
  active_vehicle: Vehicle | null
  created_at: string
  user: User
}

export interface CountItem {
  label: string
  value: number
}

export interface DashboardStats {
  total_users: number
  total_drivers: number
  pending_drivers: number
  online_drivers: number
  users_by_role: CountItem[]
  drivers_by_approval: CountItem[]
  signups_last_7_days: CountItem[]
}

export interface OtpRequestResponse {
  message: string
  expires_in: number
  resend_after: number
  dev_code?: string | null
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  expires_in: number
}

export interface AuthResponse extends TokenPair {
  user: User
  is_new_user: boolean
}
