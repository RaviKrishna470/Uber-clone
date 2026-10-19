import { PHONE_COUNTRY_CODE, PHONE_LOCAL_LENGTH } from '@/constants/config';

export const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** Indian mobile numbers: 10 digits starting 6-9. The backend does the authoritative check. */
export const isValidLocalPhone = (digits: string) =>
  digits.length === PHONE_LOCAL_LENGTH && /^[6-9]/.test(digits);

export const toE164 = (digits: string) => `${PHONE_COUNTRY_CODE}${digits}`;

/** +919876543210 -> +91 98765 43210 */
export const formatPhone = (e164: string) => {
  const local = e164.replace(PHONE_COUNTRY_CODE, '');
  return local.length === 10 ? `${PHONE_COUNTRY_CODE} ${local.slice(0, 5)} ${local.slice(5)}` : e164;
};
