import axios from 'axios'

import type { ApiErrorBody } from '@/types'
import { AppError } from '@/utils/appError'

export const errorInterceptor = (error: unknown) => {
  if (error instanceof AppError) return Promise.reject(error)
  if (!axios.isAxiosError(error)) return Promise.reject(new AppError('UNKNOWN', 'Something went wrong'))
  if (!error.response) {
    return Promise.reject(new AppError('NETWORK_ERROR', 'Cannot reach the server. Is the API running?'))
  }
  const { status, data, headers } = error.response
  const body = (data as Partial<ApiErrorBody> | undefined)?.error
  return Promise.reject(
    new AppError(
      body?.code ?? `HTTP_${status}`,
      body?.message ?? 'Something went wrong',
      status,
      body?.request_id ?? (headers['x-request-id'] as string | undefined),
      body?.details,
    ),
  )
}
