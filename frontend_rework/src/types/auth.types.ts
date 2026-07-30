// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  ward?: string;
  city: string;
  joinedAt: string;
  civicScore: number;
  badges: Badge[];
  stats: UserStats;
  notificationsEnabled: boolean;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export interface UserStats {
  totalReports: number;
  resolved: number;
  pending: number;
  communityPoints: number;
  rank: number;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
