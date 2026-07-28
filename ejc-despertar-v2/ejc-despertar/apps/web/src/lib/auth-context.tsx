'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api-client';
import type { AuthTokens } from './types';

interface CurrentUser {
  email: string;
  roles: string[];
}

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Decodifica o payload do JWT sem validar assinatura — só para exibir
 *  e-mail/papéis na UI. A validação de verdade acontece no backend. */
function decodeJwtPayload(token: string): { email: string; roles: string[] } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email, roles: payload.roles ?? [] };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('ejc.accessToken');
    if (token) {
      const decoded = decodeJwtPayload(token);
      if (decoded) setUser(decoded);
    }
    setIsLoading(false);
  }, []);

  function persistTokens(tokens: AuthTokens) {
    localStorage.setItem('ejc.accessToken', tokens.accessToken);
    localStorage.setItem('ejc.refreshToken', tokens.refreshToken);
    // Cookie legível pelo middleware.ts (só a presença é checada — o
    // valor em si nunca é confiado no servidor Next.js, apenas repassado
    // ao backend NestJS, que é quem de fato valida a assinatura do JWT).
    document.cookie = `ejc.hasSession=1; path=/; max-age=${60 * 60 * 24 * 30}`;
  }

  async function login(email: string, password: string) {
    const tokens = await api.post<AuthTokens>('/auth/login', { email, password }, { auth: false });
    persistTokens(tokens);
    const decoded = decodeJwtPayload(tokens.accessToken);
    setUser(decoded);
    router.push('/portal/inscricoes');
  }

  async function logout() {
    const refreshToken = localStorage.getItem('ejc.refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }, { auth: false }).catch(() => undefined);
    }
    localStorage.removeItem('ejc.accessToken');
    localStorage.removeItem('ejc.refreshToken');
    document.cookie = 'ejc.hasSession=; path=/; max-age=0';
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
