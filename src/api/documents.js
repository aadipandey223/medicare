const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

const authHeaders = () => {
  const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
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

export const listFolders = async () => {
  const response = await fetch(`${API_BASE_URL}/patient/folders`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const createFolder = async (name, parentId = null) => {
  const response = await fetch(`${API_BASE_URL}/patient/folders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, parent_id: parentId }),
  });
  return handleResponse(response);
};

export const deleteFolder = async (folderId) => {
  const response = await fetch(`${API_BASE_URL}/patient/folders/${folderId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
};

export const listDocuments = async ({ folderId = null, uncategorized = false } = {}) => {
  const params = new URLSearchParams();
  if (folderId !== null && folderId !== undefined) {
    params.set('folder_id', folderId);
  } else if (uncategorized) {
    params.set('uncategorized', 'true');
  }
  const response = await fetch(`${API_BASE_URL}/patient/documents?${params.toString()}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const deleteDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/patient/documents/${documentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
};

export const updateDocument = async (documentId, payload) => {
  const response = await fetch(`${API_BASE_URL}/patient/documents/${documentId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};


