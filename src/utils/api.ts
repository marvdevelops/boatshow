import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ec240367`;

// Store the access token in memory
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if we have an access token
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    // Use the public anon key for unauthenticated requests
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export async function signUp(data: {
  email: string;
  password: string;
  username: string;
  role?: string;
  permissions?: string[];
}) {
  return apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function signIn(username: string, password: string) {
  const response = await apiCall('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // Store the access token
  if (response.access_token) {
    setAccessToken(response.access_token);
  }

  return response;
}

export async function signOut() {
  const response = await apiCall('/auth/signout', {
    method: 'POST',
  });
  setAccessToken(null);
  return response;
}

export async function getSession() {
  try {
    return await apiCall('/auth/session');
  } catch (error) {
    console.error('Session check error:', error);
    return { session: null };
  }
}

// ============================================================================
// ADMIN USERS API
// ============================================================================

export async function getAdminUsers() {
  return apiCall('/admin-users');
}

export async function updateAdminUser(id: string, data: any) {
  return apiCall(`/admin-users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminUser(id: string) {
  return apiCall(`/admin-users/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// SUBMISSIONS API
// ============================================================================

export async function getSubmissions() {
  return apiCall('/submissions');
}

export async function getSubmission(id: string) {
  return apiCall(`/submissions/${id}`);
}

export async function createSubmission(data: any) {
  return apiCall('/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSubmission(id: string, data: any) {
  return apiCall(`/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function approveSubmission(id: string, emailMessage: string) {
  return apiCall(`/submissions/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ emailMessage }),
  });
}

export async function rejectSubmission(id: string, emailMessage: string) {
  return apiCall(`/submissions/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ emailMessage }),
  });
}

export async function deleteSubmission(id: string) {
  return apiCall(`/submissions/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// FILE UPLOAD API
// ============================================================================

export async function uploadFile(file: File, category: string, submissionId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  formData.append('submissionId', submissionId);

  const headers: HeadersInit = {};
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function getFileUrl(path: string) {
  return apiCall(`/files/${encodeURIComponent(path)}`);
}

// ============================================================================
// EMAIL TEMPLATES API
// ============================================================================

export async function getEmailTemplates() {
  return apiCall('/email-templates');
}

export async function createEmailTemplate(data: any) {
  return apiCall('/email-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmailTemplate(id: string, data: any) {
  return apiCall(`/email-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEmailTemplate(id: string) {
  return apiCall(`/email-templates/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// EMAIL CAMPAIGNS API
// ============================================================================

export async function getEmailCampaigns() {
  return apiCall('/email-campaigns');
}

export async function createEmailCampaign(data: any) {
  return apiCall('/email-campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmailCampaign(id: string, data: any) {
  return apiCall(`/email-campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEmailCampaign(id: string) {
  return apiCall(`/email-campaigns/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// PROMO CODES API
// ============================================================================

export async function getPromoCodes() {
  return apiCall('/promo-codes');
}

export async function validatePromoCode(code: string) {
  return apiCall('/promo-codes/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function createPromoCode(data: any) {
  return apiCall('/promo-codes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePromoCode(code: string, data: any) {
  return apiCall(`/promo-codes/${code}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePromoCode(code: string) {
  return apiCall(`/promo-codes/${code}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// STATS API
// ============================================================================

export async function getStats() {
  return apiCall('/stats');
}
