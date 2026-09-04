const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  health: () => fetch(`${API_BASE}/api/health`).then(handleResponse),

  // Unit API
  getUnits: () => fetch(`${API_BASE}/api/aa/units`).then(handleResponse),
  createUnit: (data) =>
    fetch(`${API_BASE}/api/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Orders API
  getOrders: () => fetch(`${API_BASE}/api/orders`).then(handleResponse),
  createOrder: (data) =>
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  deliverOrder: (id) =>
    fetch(`${API_BASE}/api/orders/${id}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse),

  // Invoices API
  getInvoices: () => fetch(`${API_BASE}/api/invoices`).then(handleResponse),
  getInvoice: (id) => fetch(`${API_BASE}/api/invoices/${id}`).then(handleResponse),
  createInvoice: (orderId) =>
    fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    }).then(handleResponse),
  verifyInvoice: (id) =>
    fetch(`${API_BASE}/api/invoices/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse),
  getScore: (id) => fetch(`${API_BASE}/api/invoices/${id}/score`).then(handleResponse),
  getInvoiceScore: (id) => fetch(`${API_BASE}/api/invoices/${id}/score`).then(handleResponse),

  // TReDS Packaging API
  packageInvoice: (id) =>
    fetch(`${API_BASE}/api/treds/invoices/${id}/package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),
  getPackage: (id) => fetch(`${API_BASE}/api/treds/invoices/${id}/package`).then(handleResponse)
};
