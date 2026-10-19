/** Backend error envelope: {"error": {"code", "message", "request_id", "details"}} */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: Record<string, unknown>;
  };
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
