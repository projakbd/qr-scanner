export interface ScanRecord {
  id: number;
  barcodeData: string;
  format: string;
  createdAt: string;
  deviceInfo?: string;
}

export interface User {
  id: number;
  email: string;
  fullName?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: { message: string; field?: string }[];
}

export interface AuthTokens {
  token: string;
  expiresAt?: string;
}

export interface PendingScan {
  barcodeData: string;
  format: string;
  deviceInfo?: string;
  queuedAt: string;
}
