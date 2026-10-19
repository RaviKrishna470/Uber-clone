import type { AVAILABILITY, DRIVER_APPROVAL, VehicleType } from '@/constants/roles';

export type ApprovalStatus = (typeof DRIVER_APPROVAL)[keyof typeof DRIVER_APPROVAL];
export type AvailabilityStatus = (typeof AVAILABILITY)[keyof typeof AVAILABILITY];

export interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_type: VehicleType;
  make_model: string | null;
  color: string | null;
  active: boolean;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  license_number: string;
  approval_status: ApprovalStatus;
  availability_status: AvailabilityStatus;
  active_vehicle: Vehicle | null;
  created_at: string;
}

export interface DriverApplyPayload {
  license_number: string;
  vehicle: {
    registration_number: string;
    vehicle_type: VehicleType;
    make_model?: string;
    color?: string;
  };
}
