const FACTORS = [
  { key: 'gstConsistency', label: 'GST consistency', max: 20 },
  { key: 'buyerVerification', label: 'Buyer verification', max: 20 },
  { key: 'deliveryConfirmed', label: 'Delivery confirmed', max: 15 },
  { key: 'daysOutstanding', label: 'Days outstanding', max: 20 },
  { key: 'cashFlowStability', label: 'Cash-flow stability', max: 25 }
];

export default function FactorBreakdown({ breakdown }) {
  if (!breakdown) {
    return <p className="text-sm text-slate-400">No TrustScore breakdown available yet.</p>;
  }

  return (
    <div className="space-y-4">
      {FACTORS.map((factor) => {
        const item = breakdown[factor.key] || {};
        const score = Number(item.score) || 0;
        const max = Number(item.max) || factor.max;
        const pct = max ? Math.max(0, Math.min(100, (score / max) * 100)) : 0;
        return (
          <div key={factor.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <p className="text-sm text-slate-200">{factor.label}</p>
              <p className="font-mono text-xs text-teal">
                {score} <span className="text-slate-500">/ {max}</span>
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
              <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.explanation}</p>
          </div>
        );
      })}
    </div>
  );
}
