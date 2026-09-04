const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getHeaders(customHeaders = {}) {
  return { 'Content-Type': 'application/json', ...customHeaders };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `API error (${res.status})`);
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export const api = {
  // Liveness check
  health: () =>
    fetch(`${API_BASE}/api/health`, { credentials: 'include' }).then(handleResponse),

  // Auth API
  register: (data) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(handleResponse),

  login: (data) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(handleResponse),

  getCurrentUser: () =>
    fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    })
      .then(handleResponse)
      .catch(() => ({ success: true })),

  // Unit API
  getUnits: () =>
    fetch(`${API_BASE}/api/aa/units`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  createUnit: (data) =>
    fetch(`${API_BASE}/api/units`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Orders API
  getOrders: () =>
    fetch(`${API_BASE}/api/orders`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  createOrder: (data) =>
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(handleResponse),

  deliverOrder: (id) =>
    fetch(`${API_BASE}/api/orders/${id}/deliver`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Invoices API
  getInvoices: () =>
    fetch(`${API_BASE}/api/invoices`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  getInvoice: (id) =>
    fetch(`${API_BASE}/api/invoices/${id}`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  createInvoice: (orderId) =>
    fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ orderId })
    }).then(handleResponse),

  verifyInvoice: (id) =>
    fetch(`${API_BASE}/api/invoices/${id}/verify`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  getScore: (id) =>
    fetch(`${API_BASE}/api/invoices/${id}/score`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  getInvoiceScore: (id) =>
    fetch(`${API_BASE}/api/invoices/${id}/score`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // TReDS Packaging API
  packageInvoice: (id) =>
    fetch(`${API_BASE}/api/treds/invoices/${id}/package`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  getPackage: (id) =>
    fetch(`${API_BASE}/api/treds/invoices/${id}/package`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse)
};

