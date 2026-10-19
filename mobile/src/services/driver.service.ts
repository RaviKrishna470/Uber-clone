import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { AvailabilityStatus, DriverApplyPayload, DriverProfile } from '@/types/driver';
import { apiService } from './api.service';

export const driverService = {
  getMyProfile: () => apiService.get<DriverProfile>(API_ENDPOINTS.DRIVER.ME),

  apply: (payload: DriverApplyPayload) =>
    apiService.post<DriverProfile, DriverApplyPayload>(API_ENDPOINTS.DRIVER.APPLY, payload),

  setAvailability: (status: AvailabilityStatus) =>
    apiService.patch<DriverProfile>(API_ENDPOINTS.DRIVER.AVAILABILITY, { status }),
};
