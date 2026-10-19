import type { Role } from '@/constants/roles';

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  account_status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  roles: Role[];
  profile_complete: boolean;
  created_at: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string | null;
}
