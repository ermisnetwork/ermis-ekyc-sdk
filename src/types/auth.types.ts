// ============================================================
// Auth Types – Login, Register, User, API Response
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  avatarUrl?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ============================================================
// Pagination & API Response Wrapper
// ============================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}
