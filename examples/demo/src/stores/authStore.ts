import { create } from "zustand";
import { ErmisService } from "ermis-ekyc-sdk";
import type { User } from "ermis-ekyc-sdk";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  clearError: () => void;
}

const TOKEN_KEY = "ermis_access_token";
const USER_KEY = "ermis_user";

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        const ermis = ErmisService.getInstance();
        ermis.setToken(token);
        set({ user, accessToken: token, isAuthenticated: true });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const ermis = ErmisService.getInstance();
      const result = await ermis.auth.login({ username, password });

      ermis.setToken(result.access_token);
      localStorage.setItem(TOKEN_KEY, result.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));

      set({
        user: result.user,
        accessToken: result.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    const ermis = ErmisService.getInstance();
    ermis.clearToken();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
