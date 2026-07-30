import { create } from 'zustand';
import type { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setOnboarded: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isOnboarded: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  setTokens: (tokens) => set({ tokens }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
}));
