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

  // Use sessionStorage for tab-specific auth, with localStorage fallback
  useEffect(() => {
    // First check sessionStorage (tab-specific)
    let storedToken = sessionStorage.getItem('token');
    let storedUser = sessionStorage.getItem('user');
    let storedRole = sessionStorage.getItem('role');
    
    // If not in sessionStorage, check localStorage and copy to sessionStorage
    if (!storedToken) {
      storedToken = localStorage.getItem('token');
      storedUser = localStorage.getItem('user');
      storedRole = localStorage.getItem('role');
      
      // Copy to sessionStorage for this tab
      if (storedToken) {
        sessionStorage.setItem('token', storedToken);
        if (storedUser) sessionStorage.setItem('user', storedUser);
        if (storedRole) sessionStorage.setItem('role', storedRole);
      }
    }
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const role = userData.role || storedRole || 'patient';
        
        // Verify token is still valid by checking with backend
        fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Token invalid');
          }
        })
        .then(verifiedData => {
          // Use the role from backend verification
          const verifiedRole = verifiedData.role || role;
          const verifiedUser = {...verifiedData.user, role: verifiedRole};
          
          setToken(storedToken);
          setUser(verifiedUser);
          
          // Update sessionStorage with verified data
          sessionStorage.setItem('role', verifiedRole);
          sessionStorage.setItem('user', JSON.stringify(verifiedUser));
          
          setAuthChecked(true);
          setLoading(false);
        })
        .catch(error => {
          console.warn('Token verification failed:', error);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('role');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          setToken(null);
          setUser(null);
          setAuthChecked(true);
          setLoading(false);
        });
        return; // Don't set loading false yet, wait for verification
      } catch (error) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
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
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
      return false;
    }
  };

  const login = (newToken, userData, role = 'patient') => {
    // Store in both localStorage (for persistence) and sessionStorage (for tab isolation)
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({...userData, role}));
    localStorage.setItem('role', role);
    
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify({...userData, role}));
    sessionStorage.setItem('role', role);
    
    setToken(newToken);
    setUser({...userData, role});
  };

  const logout = () => {
    logoutApi();
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      // Update in both storages
      localStorage.setItem('user', JSON.stringify(updated));
      sessionStorage.setItem('user', JSON.stringify(updated));
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
