import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stockflow_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // on initial page load, check if saved token is still valid with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('stockflow_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        // token expired or invalid, wipe localStorage
        console.error('Session error:', err);
        localStorage.removeItem('stockflow_token');
        localStorage.removeItem('stockflow_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // log in and save token to localStorage
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('stockflow_token', newToken);
    localStorage.setItem('stockflow_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // create a new organization and user account
  const signup = async ({ organizationName, email, password, confirmPassword }) => {
    const res = await api.post('/auth/signup', {
      organizationName,
      email,
      password,
      confirmPassword,
    });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('stockflow_token', newToken);
    localStorage.setItem('stockflow_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // clear stored credentials and log out
  const logout = () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// hook for easy consumption in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
