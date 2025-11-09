const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

// Centralized API helper with automatic auth handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
  
  if (!token && !endpoint.includes('/auth/')) {
    throw new Error('Not authenticated. Please login again.');
  }

  // For FormData (file uploads), don't set Content-Type header (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData
    ? { ...(token && { Authorization: `Bearer ${token}` }) }
    : {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear auth data
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
      
      throw new Error('Session expired. Please login again.');
    }

    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // Re-throw auth errors
    if (error.message.includes('Session expired') || error.message.includes('Not authenticated')) {
      throw error;
    }
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

export { API_BASE_URL };

