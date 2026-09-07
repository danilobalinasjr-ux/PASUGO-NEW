export type ApiErrorPayload = {
  success: false;
  error: string;
  details?: unknown;
};

export type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccessPayload<T> | ApiErrorPayload;
