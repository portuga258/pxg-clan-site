import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'pxg-clan-access-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }

    apiRequest('/auth/me', { token })
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        } else {
          console.error('Não foi possível verificar a sessão:', error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  async function authenticate(endpoint, credentials) {
    const result = await apiRequest(`/auth/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem(TOKEN_KEY, result.access_token);
    setUser(result.user);
    setToken(result.access_token);
    return result.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const updateCharacter = useCallback((character) => {
    setUser((currentUser) => currentUser
      ? { ...currentUser, character: { ...currentUser.character, ...character } }
      : currentUser);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    register: (details) => authenticate('register', details),
    login: (credentials) => authenticate('login', credentials),
    updateCharacter,
    logout,
  }), [user, token, loading, updateCharacter]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
