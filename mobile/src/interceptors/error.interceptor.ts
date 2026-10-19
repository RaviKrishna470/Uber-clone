import axios from 'axios';

import type { ApiErrorBody } from '@/types/api';
import { AppError } from '@/utils/appError';

/** Converts any axios failure into an AppError so screens handle one error shape. */
export const errorInterceptor = (error: unknown) => {
  // A replayed request (after token refresh) has already been normalised.
  if (error instanceof AppError) return Promise.reject(error);
  if (!axios.isAxiosError(error)) {
    return Promise.reject(new AppError('UNKNOWN', 'Something went wrong'));
  }
  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED';
    return Promise.reject(
      new AppError(
        timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
        timedOut ? 'The server took too long to respond' : 'Cannot reach the server. Check your connection.',
      ),
    );
  }

  const { status, data, headers } = error.response;
  const body = (data as Partial<ApiErrorBody> | undefined)?.error;
  return Promise.reject(
    new AppError(
      body?.code ?? `HTTP_${status}`,
      body?.message ?? 'Something went wrong',
      status,
      body?.request_id ?? (headers['x-request-id'] as string | undefined),
      body?.details,
    ),
  );
};
