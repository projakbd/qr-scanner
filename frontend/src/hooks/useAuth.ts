import { useState, useEffect, useCallback } from 'react';
import { apiLogin, apiLogout, apiMe, apiRegister } from '../lib/api';
import type { User } from '../types/index';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiMe()
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const t = res.data.token;
    localStorage.setItem('auth_token', t);
    setToken(t);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    const res = await apiRegister(email, password, fullName);
    const t = res.data.token;
    localStorage.setItem('auth_token', t);
    setToken(t);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => { });
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, login, register, logout, isAuthenticated: !!token && !!user };
}
