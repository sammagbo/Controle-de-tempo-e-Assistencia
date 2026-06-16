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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      const [user, setUser] = useState<User | null>(null);
      const [session, setSession] = useState<Session | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            // Check active session against our Spring Boot backend
            const checkSession = async () => {
                  try {
                        const data = await api.get('/api/v1/auth/me');
                        if (data && data.email) {
                              const currentUser = { id: data.email, email: data.email };
                              setUser(currentUser);
                              setSession({ user: currentUser });
                        } else {
                              setUser(null);
                              setSession(null);
                        }
                  } catch (error) {
                        setUser(null);
                        setSession(null);
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
