import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'pxg-clan-access-token';
const CHARACTER_KEY = 'pxg-clan-active-character';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(() => localStorage.getItem(CHARACTER_KEY));
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
    setSelectedCharacterId(null);
    localStorage.removeItem(CHARACTER_KEY);
    return result.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CHARACTER_KEY);
    setToken(null);
    setUser(null);
    setSelectedCharacterId(null);
  }

  const updateCharacter = useCallback((character) => {
    setUser((currentUser) => currentUser
      ? {
          ...currentUser,
          character: currentUser.character?.id === character.id
            ? { ...currentUser.character, ...character }
            : currentUser.character,
          characters: (currentUser.characters || []).map((item) =>
            item.id === character.id ? { ...item, ...character } : item
          ),
        }
      : currentUser);
  }, []);

  const switchCharacter = useCallback((characterId) => {
    if (!user?.characters?.some((character) => character.id === characterId)) return;
    setSelectedCharacterId(characterId);
    localStorage.setItem(CHARACTER_KEY, characterId);
  }, [user?.characters]);

  const refreshAccount = useCallback(async () => {
    if (!token) return null;
    const result = await apiRequest('/auth/me', { token });
    setUser(result.user);
    return result.user;
  }, [token]);

  const activeCharacter = user?.characters?.find((character) => character.id === selectedCharacterId)
    || user?.character
    || user?.characters?.[0]
    || null;
  const currentUser = user ? { ...user, character: activeCharacter } : null;

  const value = useMemo(() => ({
    user: currentUser,
    token,
    loading,
    register: (details) => authenticate('register', details),
    login: (credentials) => authenticate('login', credentials),
    updateCharacter,
    switchCharacter,
    refreshAccount,
    logout,
  }), [currentUser, token, loading, updateCharacter, switchCharacter, refreshAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
