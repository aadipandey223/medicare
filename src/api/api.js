const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

// Centralized API helper with automatic auth handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  
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
    // Log API call for debugging (remove in production if needed)
    if (import.meta.env.DEV) {
      console.log(`[API] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Only clear auth and redirect if not already on auth page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth')) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
      
      throw new Error('Unauthorized. Please login to continue.');
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
      console.error('[API Error] Failed to fetch:', `${API_BASE_URL}${endpoint}`, error);
      throw new Error(`Network error: Cannot connect to backend at ${API_BASE_URL}. Please check if the backend is running and CORS is configured.`);
    }
    throw error;
  }
};

export { API_BASE_URL };

