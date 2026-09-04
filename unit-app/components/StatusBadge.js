import React from 'react';

const STATUS_CONFIGS = {
  FINANCE_READY: {
    label: 'Finance Ready',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-600/20',
    dot: 'bg-emerald-600'
  },
  VERIFIED: {
    label: 'Verified',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dot: 'bg-emerald-500'
  },
  REVIEW: {
    label: 'Under Review',
    classes: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-600/20',
    dot: 'bg-amber-600'
  },
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    classes: 'bg-[#F5EFE6] text-[#74512D] border-[#AF8F6F]/40 ring-[#74512D]/20',
    dot: 'bg-[#74512D]'
  },
  AT_RISK: {
    label: 'At Risk',
    classes: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-600/20',
    dot: 'bg-rose-600'
  },
  VERIFICATION_FAILED: {
    label: 'Verification Failed',
    classes: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    dot: 'bg-rose-500'
  },
  DELIVERED: {
    label: 'Delivered',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-600/20',
    dot: 'bg-emerald-600'
  },
  PENDING: {
    label: 'Pending Delivery',
    classes: 'bg-[#F5EFE6] text-[#74512D] border-[#AF8F6F]/40 ring-[#74512D]/20',
    dot: 'bg-[#AF8F6F]'
  },
  LISTED: {
    label: 'Listed on TReDS',
    classes: 'bg-amber-50 text-amber-900 border-amber-300 ring-amber-700/20',
    dot: 'bg-amber-600'
  },
  DISBURSED: {
    label: 'Disbursed (90%)',
    classes: 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-emerald-700/20',
    dot: 'bg-emerald-700'
  }
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    classes: 'bg-[#F5EFE6] text-[#543310] border-[#AF8F6F]',
    dot: 'bg-[#543310]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ring-1 ring-inset transition-colors ${config.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
