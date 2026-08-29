// src/AuthContext.jsx — JWT-based authentication context
import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { loginUser, registerUser, fetchProfile, setAuthToken, getAuthToken } from './api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchProfile()
        .then(data => setUser(data))
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginUser(username, password);
    setAuthToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    return registerUser(username, email, password);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}