export class AppError extends Error {
  code: string
  status?: number
  requestId?: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, status?: number, requestId?: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.requestId = requestId
    this.details = details
  }
}

export const getErrorMessage = (err: unknown, fallback = 'Something went wrong') =>
  err instanceof Error ? err.message : fallback
