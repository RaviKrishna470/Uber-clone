/** Normalised error every service call rejects with (built by interceptors/error.interceptor.ts). */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public requestId?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const getErrorMessage = (err: unknown, fallback = 'Something went wrong'): string =>
  err instanceof AppError ? err.message : err instanceof Error ? err.message : fallback;
