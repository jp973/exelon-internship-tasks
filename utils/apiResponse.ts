export interface ApiResponse<T = any> {
  code?: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}