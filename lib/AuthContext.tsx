import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './apiClient';

export interface User {
      id: string; // no Spring usamos o email como identificador primário neste contexto
      email: string;
}

export interface Session {
      user: User;
}

interface AuthContextType {
      user: User | null;
      session: Session | null;
      loading: boolean;
      signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
      signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
      signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CACHE_KEY = 'auth_user';

const readCachedUser = (): User | null => {
      try {
            const raw = localStorage.getItem(AUTH_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && parsed.email ? { id: parsed.email, email: parsed.email } : null;
      } catch {
            return null;
      }
};

const writeCachedUser = (u: User | null): void => {
      if (u) {
            localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(u));
      } else {
            localStorage.removeItem(AUTH_CACHE_KEY);
      }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      const cached = readCachedUser();
      const [user, setUser] = useState<User | null>(cached);
      const [session, setSession] = useState<Session | null>(cached ? { user: cached } : null);
      const [loading, setLoading] = useState(!cached);

      useEffect(() => {
            // Check active session against our Spring Boot backend
            const checkSession = async () => {
                  try {
                        const data = await api.get('/api/v1/auth/me');
                        if (data && data.email) {
                              const currentUser = { id: data.email, email: data.email };
                              setUser(currentUser);
                              setSession({ user: currentUser });
                              writeCachedUser(currentUser);
                        } else {
                              setUser(null);
                              setSession(null);
                              writeCachedUser(null);
                        }
                  } catch (error) {
                        if (error instanceof TypeError) {
                              // Sem rede: mantem o estado local — a sessao pode continuar valida no servidor
                              console.warn('Sem conexão ao validar a sessão; mantendo estado local.');
                        } else {
                              // Resposta HTTP (ex.: 401): sessao invalida de verdade
                              setUser(null);
                              setSession(null);
                              writeCachedUser(null);
                        }
                  } finally {
                        setLoading(false);
                  }
            };

            checkSession();
      }, []);

      const signIn = async (email: string, password: string) => {
            try {
                  await api.post('/api/v1/auth/login', { email, password });
                  // Após o login, vamos checar a sessão novamente
                  const data = await api.get('/api/v1/auth/me');
                  if (data && data.email) {
                        const currentUser = { id: data.email, email: data.email };
                        setUser(currentUser);
                        setSession({ user: currentUser });
                        writeCachedUser(currentUser);
                  }
                  return { error: null };
            } catch (error: any) {
                  return { error: new Error(error.message || 'Login falhou') };
            }
      };

      const signUp = async (email: string, password: string) => {
            // Se houver um endpoint de signUp real, usaremos ele aqui.
            // Temporariamente mockado ou podemos simular um erro amigável
            return { error: new Error("O registro está temporariamente desativado. Use uma conta existente.") };
      };

      const signOut = async () => {
            try {
                  await api.post('/api/v1/auth/logout');
            } catch (e) {
                  console.error("Erro ao fazer logout", e);
            } finally {
                  setUser(null);
                  setSession(null);
                  writeCachedUser(null);
            }
      };

      const value = {
            user,
            session,
            loading,
            signIn,
            signUp,
            signOut
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
            throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
};
