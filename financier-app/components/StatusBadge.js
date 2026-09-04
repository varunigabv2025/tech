import React from 'react';

const TONES = {
  ready: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  review: 'bg-amber-100 text-amber-900 border-amber-300',
  risk: 'bg-rose-100 text-rose-900 border-rose-300',
  listed: 'bg-sky-100 text-sky-900 border-sky-300',
  disbursed: 'bg-blue-100 text-blue-900 border-blue-300',
  settled: 'bg-purple-100 text-purple-900 border-purple-300',
  declined: 'bg-gray-100 text-gray-800 border-gray-300',
  pending: 'bg-[#F5EFE6] text-[#74512D] border-[#AF8F6F]',
  approved: 'bg-emerald-100 text-emerald-900 border-emerald-300'
};

const STATUS_TONE = {
  FINANCE_READY: 'ready',
  REVIEW: 'review',
  AT_RISK: 'risk',
  LISTED: 'listed',
  DISBURSED: 'disbursed',
  SETTLED: 'settled',
  DECLINED: 'declined',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'risk'
};

const LABELS = {
  FINANCE_READY: 'Finance Ready',
  REVIEW: 'Review',
  AT_RISK: 'At Risk',
  LISTED: 'TReDS Listed',
  DISBURSED: '90% Disbursed',
  SETTLED: 'Term Settled',
  DECLINED: 'Declined',
  PENDING: 'Awaiting Bank Approval',
  APPROVED: 'Consent Approved',
  REJECTED: 'Consent Denied'
};

export default function StatusBadge({ status, label }) {
  if (!status) return <span className="text-[#AF8F6F]">—</span>;
  const tone = STATUS_TONE[status] || 'pending';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${TONES[tone]}`}
    >
      {label || LABELS[status] || String(status).replace(/_/g, ' ')}
    </span>
  );
}
