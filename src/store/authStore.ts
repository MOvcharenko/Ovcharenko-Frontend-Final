import { create } from 'zustand';
import { pb } from '../lib/pocketbase';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: pb.authStore.isValid,
  user: pb.authStore.model,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      set({ isAuthenticated: true, user: authData.record, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || 'Login failed' });
    }
  },

  logout: () => {
    pb.authStore.clear();
    set({ isAuthenticated: false, user: null });
  },

  setError: (error) => set({ error }),
}));