import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hireflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and hydrate user session on mount
  useEffect(() => {
    const hydrateUser = async () => {
      const storedToken = localStorage.getItem('hireflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('hireflow_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Session hydration failed:', err.response?.data?.message || err.message);
        localStorage.removeItem('hireflow_token');
        localStorage.removeItem('hireflow_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('hireflow_token', receivedToken);
      localStorage.setItem('hireflow_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('hireflow_token', receivedToken);
      localStorage.setItem('hireflow_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('hireflow_token');
    localStorage.removeItem('hireflow_user');
    setUser(null);
    setToken(null);
  };

  const loginWithToken = (receivedToken, receivedUser) => {
    localStorage.setItem('hireflow_token', receivedToken);
    localStorage.setItem('hireflow_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  // Profile state update helper
  const updateUserState = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('hireflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithToken,
    logout,
    updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
