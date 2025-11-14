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

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

// Doctor Management
export const listDoctors = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const addDoctor = async (doctorData) => {
  const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(doctorData),
  });
  return handleResponse(response);
};

export const updateDoctor = async (doctorId, updates) => {
  const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

export const deleteDoctor = async (doctorId) => {
  const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(response);
};

// Patient Management
export const listPatients = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/patients`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const deletePatient = async (patientId) => {
  const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const resetPatientPassword = async (patientId, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}/password`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ password: newPassword }),
  });
  return handleResponse(response);
};

// Password Reset Requests
export const listPasswordResets = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/password-resets`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const resolvePasswordReset = async (resetId, action, password, reason) => {
  const response = await fetch(`${API_BASE_URL}/admin/password-resets/${resetId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ action, password, reason }),
  });
  return handleResponse(response);
};

// Audit Logs
export const getAuditLogs = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

