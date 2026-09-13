import { create } from 'zustand';
import { User, Role } from '../types';
import { authService, LoginParams, RegisterParams } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  token: localStorage.getItem('next_olymp_jwt') || 'demo-jwt-token',
  isAuthenticated: true, // Default active session for easy preview
  isLoading: false,

  login: async (params) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.login(params);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (params) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.register(params);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setRole: (role: Role) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, role };
      localStorage.setItem('next_olymp_user', JSON.stringify(updated));
      return { user: updated };
    });
  },

  updateProfile: (updatedData: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updatedData };
      localStorage.setItem('next_olymp_user', JSON.stringify(updated));
      return { user: updated };
    });
  }
}));
