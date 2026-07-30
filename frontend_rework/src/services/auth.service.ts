import { MOCK_USER } from '@/constants/mockData';
import type { AuthResponse, LoginDto, RegisterDto, User } from '@/types';

const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    await delay();
    return {
      user: MOCK_USER,
      tokens: {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: Date.now() + 3600 * 1000,
      },
    };
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    await delay(1000);
    return {
      user: { ...MOCK_USER, name: dto.name, email: dto.email },
      tokens: {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: Date.now() + 3600 * 1000,
      },
    };
  },

  async getMe(): Promise<User> {
    await delay(400);
    return MOCK_USER;
  },

  async logout(): Promise<void> {
    await delay(200);
    console.log('[mock] logged out');
  },
};
