import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const Login: React.FC = () => {
      const navigate = useNavigate();
      const { signIn, signUp } = useAuth();
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isSignUp, setIsSignUp] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError(null);

            const result = isSignUp
                  ? await signUp(email, password)
                  : await signIn(email, password);

            if (result.error) {
                  setError(result.error.message);
                  setLoading(false);
            } else {
                  navigate('/');
            }
      };

      return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center px-4">
                  <div className="max-w-md w-full">
                        {/* Logo */}
                        <div className="text-center mb-8">
                              <img
                                    src="/logo.png"
                                    alt="Humaitá te abrasa"
                                    className="w-32 h-32 mx-auto mb-4 object-contain rounded-full"
                              />
                              <h1 className="text-3xl font-black text-white">MeetingManager</h1>
                              <p className="text-blue-200 mt-2">Controle de Tempo e Assistência</p>
                        </div>

                        {/* Login Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                                    {isSignUp ? 'Criar Conta' : 'Entrar'}
                              </h2>

                              {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                          {error}
                                    </div>
                              )}

                              <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Email
                                          </label>
                                          <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="seu@email.com"
                                          />
                                    </div>

                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Senha
                                          </label>
                                          <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="••••••••"
                                          />
                                    </div>

                                    <button
                                          type="submit"
                                          disabled={loading}
                                          className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                          {loading ? (
                                                <>
                                                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                                      Carregando...
                                                </>
                                          ) : (
                                                isSignUp ? 'Criar Conta' : 'Entrar'
                                          )}
                                    </button>
                              </form>

                              <div className="mt-6 text-center">
                                    <button
                                          onClick={() => setIsSignUp(!isSignUp)}
                                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                    >
                                          {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
                                    </button>
                              </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-blue-200 text-sm mt-6">
                              <p>© 2026 Sam Magbo. All Rights Reserved.</p>
                              <p className="mt-1">
                                    Developed with <span className="text-red-400">♥</span> by{' '}
                                    <a
                                          href="https://www.linkedin.com/in/sam-magbo-02086555/"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-white hover:underline font-medium"
                                    >
                                          Magbo Studio
                                    </a>
                              </p>
                        </div>
                  </div>
            </div>
      );
};

export default Login;
