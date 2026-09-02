export function inr(amount, digits = 0) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(n);
}

export function inrCompact(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  if (n >= 100000) {
    return `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2)}L`;
  }
  return inr(n);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function scoreTone(status) {
  if (status === 'FINANCE_READY') return 'ready';
  if (status === 'REVIEW') return 'review';
  if (status === 'AT_RISK') return 'risk';
  return 'neutral';
}
