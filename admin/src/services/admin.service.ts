import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { AccountStatus, AdminDriver, ApprovalStatus, DashboardStats, Page, User } from '@/types'
import { apiService } from './api.service'

export interface UserFilters {
  search?: string
  role?: string
  status?: string
  page: number
  page_size: number
}

export interface DriverFilters {
  search?: string
  approval_status?: string
  page: number
  page_size: number
}

/** Strip empty filter values so they are not sent as `?role=`. */
const clean = <T extends object>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))

export const adminService = {
  getStats: () => apiService.get<DashboardStats>(API_ENDPOINTS.ADMIN.STATS),

  listUsers: (filters: UserFilters) => apiService.get<Page<User>>(API_ENDPOINTS.ADMIN.USERS, { params: clean(filters) }),

  setUserStatus: (userId: string, status: AccountStatus) =>
    apiService.patch<User>(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { status }),

  listDrivers: (filters: DriverFilters) =>
    apiService.get<Page<AdminDriver>>(API_ENDPOINTS.ADMIN.DRIVERS, { params: clean(filters) }),

  setDriverApproval: (driverId: string, status: Exclude<ApprovalStatus, 'PENDING'>) =>
    apiService.patch<AdminDriver>(API_ENDPOINTS.ADMIN.DRIVER_APPROVAL(driverId), { status }),
}
