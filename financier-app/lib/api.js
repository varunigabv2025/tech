const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function post(path) {
  return fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  }).then(readJson);
}

export const api = {
  health: () => fetch(`${API}/api/health`, { credentials: 'include' }).then(readJson),
  financierInvoices: () => fetch(`${API}/api/financier/invoices`, { credentials: 'include' }).then(readJson),
  financierInvoice: (id) => fetch(`${API}/api/financier/invoices/${id}`, { credentials: 'include' }).then(readJson),
  packageInvoice: (id) => post(`/api/treds/invoices/${id}/package`),
  acceptInvoice: (id) => post(`/api/financier/invoices/${id}/accept`),
  settleInvoice: (id) => post(`/api/financier/invoices/${id}/settle`),
  declineInvoice: (id) => post(`/api/financier/invoices/${id}/decline`),
  aaUnits: () => fetch(`${API}/api/aa/units`, { credentials: 'include' }).then(readJson),
  createConsent: (unitId) =>
    fetch(`${API}/api/aa/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ unitId })
    }).then(readJson),
  getConsent: (id) => fetch(`${API}/api/aa/consent/${id}`, { credentials: 'include' }).then(readJson),
  approveConsent: (id) => post(`/api/aa/consent/${id}/approve`),
  rejectConsent: (id) => post(`/api/aa/consent/${id}/reject`),
  logout: () => post('/api/auth/logout').catch(() => ({ success: true }))
};


