const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error('Invalid response from server');
  }
  
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Register with email and password
export const register = async (email, password, fullName, role = 'patient') => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name: fullName, role }),
  });
  
  return handleResponse(response);
};

// Login with email and password (unified for patient and doctor)
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await handleResponse(response);
  // Backend now returns role in response
  return data;
};

// Login/Register with Google
export const googleAuth = async (credential, role = 'patient') => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: credential, role }),
  });
  
  return handleResponse(response);
};

// Get current user
export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  
  return handleResponse(response);
};

// Update user profile
export const updateProfile = async (updates) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse(response);
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
