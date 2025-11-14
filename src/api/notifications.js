const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data;
};

export const fetchNotifications = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const fetchNotificationSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications?summary=true`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const markNotificationRead = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications/read_all`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
};

export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
};


