const TONES = {
  ready: 'bg-teal/15 text-teal border-teal/30',
  review: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  risk: 'bg-rose-500/10 text-rose-300 border-rose-400/30',
  listed: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  disbursed: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  settled: 'bg-gold/15 text-gold border-gold/30',
  declined: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  pending: 'bg-white/5 text-slate-300 border-white/10',
  approved: 'bg-teal/15 text-teal border-teal/30'
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
  FINANCE_READY: 'Finance ready',
  REVIEW: 'Review',
  AT_RISK: 'At risk',
  LISTED: 'Listed on RXIL',
  DISBURSED: '90% disbursed',
  SETTLED: 'Buyer paid',
  DECLINED: 'Declined',
  PENDING: 'Awaiting bank approval',
  APPROVED: 'Consent approved',
  REJECTED: 'Consent denied'
};

export default function StatusBadge({ status, label }) {
  if (!status) return <span className="text-slate-500">—</span>;
  const tone = STATUS_TONE[status] || 'pending';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone]}`}>
      {label || LABELS[status] || status.replaceAll('_', ' ')}
    </span>
  );
}
