export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles a user can pick for themselves during onboarding. */
export type SelfAssignableRole = typeof ROLES.CUSTOMER | typeof ROLES.DRIVER;

export const DRIVER_APPROVAL = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const AVAILABILITY = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
} as const;

export const VEHICLE_TYPES = [
  { value: 'BIKE', label: 'Bike' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'CAR', label: 'Car' },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]['value'];
