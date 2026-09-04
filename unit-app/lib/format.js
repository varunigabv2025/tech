/**
 * Formatting utilities for TrustFlow Unit App
 */

export function formatINR(val) {
  const num = Number(val);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(String(val).includes('T') ? val : `${val}T00:00:00Z`);
    if (isNaN(d.getTime())) return String(val);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return String(val);
  }
}

export function formatDays(days) {
  const num = Number(days);
  if (isNaN(num)) return '0 days';
  return `${num} ${num === 1 ? 'day' : 'days'}`;
}

export function formatScore(score) {
  if (score === null || score === undefined) return '—';
  const num = Number(score);
  if (isNaN(num)) return '—';
  return num.toFixed(2);
}

export function calculateDaysOutstanding(invoiceDate) {
  if (!invoiceDate) return 0;
  try {
    const invDateStr = String(invoiceDate).trim();
    const invDate = new Date(invDateStr.includes('T') ? invDateStr : `${invDateStr}T00:00:00Z`);
    if (isNaN(invDate.getTime())) return 0;
    const now = new Date();
    const diffTime = now.getTime() - invDate.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch {
    return 0;
  }
}

export function getAgeingState(invoiceDate) {
  const days = calculateDaysOutstanding(invoiceDate);
  const THRESHOLD = 45;
  const daysRemaining = THRESHOLD - days;

  if (days > THRESHOLD) {
    return {
      status: 'OVERDUE',
      days,
      threshold: THRESHOLD,
      daysOverdue: days - THRESHOLD,
      daysRemaining: 0,
      label: 'Payment Delay Alert',
      severity: 'high'
    };
  } else if (days === THRESHOLD) {
    return {
      status: 'THRESHOLD_REACHED',
      days,
      threshold: THRESHOLD,
      daysOverdue: 0,
      daysRemaining: 0,
      label: '45-Day Threshold Reached',
      severity: 'warning'
    };
  } else if (days >= 31) {
    return {
      status: 'APPROACHING_THRESHOLD',
      days,
      threshold: THRESHOLD,
      daysOverdue: 0,
      daysRemaining,
      label: 'Approaching 45 Days',
      severity: 'medium'
    };
  }
  return {
    status: 'HEALTHY',
    days,
    threshold: THRESHOLD,
    daysOverdue: 0,
    daysRemaining,
    label: 'Healthy Payment Term',
    severity: 'low'
  };
}
