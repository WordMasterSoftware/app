import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage, secureStorage } from '../utils/storage';

interface User {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loadToken: () => Promise<void>; // Load token from SecureStore on app start
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (token: string, user: User) => {
        await secureStorage.setItem('auth_token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: async () => {
        await secureStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      loadToken: async () => {
        const token = await secureStorage.getItem('auth_token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage', // Persist user info in AsyncStorage
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user object, token handles separately via SecureStore + loadToken
    }
  )
);

export default useAuthStore;
