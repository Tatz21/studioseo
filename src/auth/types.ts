export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  organization?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number; // Unix timestamp in ms
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  organization?: string;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
