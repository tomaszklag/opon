import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '../lib/secure-storage';

export interface AuthUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: 'CLIENT' | 'PROVIDER';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  pendingOnboarding: boolean;
  rehydrated: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setPendingOnboarding: (value: boolean) => void;
  setRehydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      pendingOnboarding: false,
      rehydrated: false,

      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, pendingOnboarding: false }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          pendingOnboarding: false,
        }),

      setUser: (user) => set({ user }),
      setPendingOnboarding: (value) => set({ pendingOnboarding: value }),
      setRehydrated: () => set({ rehydrated: true }),
    }),
    {
      name: 'opony_auth',
      storage: createJSONStorage(() => secureStorage.zustandAdapter),
      onRehydrateStorage: () => (state) => {
        state?.setRehydrated();
      },
      // Nie persystuj flagi rehydrated
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        pendingOnboarding: state.pendingOnboarding,
      }),
    },
  ),
);
