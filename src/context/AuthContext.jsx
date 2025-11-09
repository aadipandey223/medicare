import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check localStorage for token and user on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    const storedRole = sessionStorage.getItem('role') || localStorage.getItem('role');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const role = userData.role || storedRole || 'patient';
        setToken(storedToken);
        setUser({...userData, role});
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    
    setAuthChecked(true);
    setLoading(false);
  }, []);

  // Optionally verify token with backend (can be called manually)
  const verifyToken = async () => {
    if (!token) {
      return false;
    }
    
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return false;
    }
  };

  const login = (newToken, userData, role = 'patient') => {
    // Store per-tab to support simultaneous doctor/patient sessions
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify({...userData, role}));
    sessionStorage.setItem('role', role);
    
    setToken(newToken);
    setUser({...userData, role});
  };

  const logout = () => {
    logoutApi();
    // Clear both sessionStorage and localStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      // Update in both sessionStorage and localStorage
      sessionStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    verifyToken,
    isAuthenticated: !!user && !!token,
    role: user?.role || sessionStorage.getItem('role') || localStorage.getItem('role') || 'patient',
    isDoctor: (user?.role || sessionStorage.getItem('role') || localStorage.getItem('role')) === 'doctor',
    isPatient: (user?.role || sessionStorage.getItem('role') || localStorage.getItem('role')) === 'patient',
    isAdmin: (user?.role || sessionStorage.getItem('role') || localStorage.getItem('role')) === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
