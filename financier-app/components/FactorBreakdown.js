import React from 'react';

const FACTORS = [
  { key: 'gstConsistency', label: 'GST Consistency', max: 20 },
  { key: 'buyerVerification', label: 'Buyer Verification', max: 20 },
  { key: 'deliveryConfirmed', label: 'Delivery Confirmation', max: 15 },
  { key: 'daysOutstanding', label: 'Days Outstanding', max: 20 },
  { key: 'cashFlowStability', label: 'Cash-flow Stability (AA)', max: 25 }
];

export default function FactorBreakdown({ breakdown }) {
  if (!breakdown) {
    return <p className="text-sm text-[#74512D]">No TrustScore factor breakdown available yet.</p>;
  }

  return (
    <div className="space-y-4">
      {FACTORS.map((factor) => {
        const item = breakdown[factor.key] || {};
        const score = Number(item.score) || 0;
        const max = Number(item.max) || factor.max;
        const pct = max ? Math.max(0, Math.min(100, (score / max) * 100)) : 0;
        return (
          <div key={factor.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold text-[#543310]">{factor.label}</p>
              <p className="font-mono text-xs font-bold text-[#74512D]">
                {score} <span className="text-[#AF8F6F] font-normal">/ {max}</span>
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#EFE7CB]">
              <div
                className="h-full rounded-full bg-[#74512D] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {item.explanation && (
              <p className="text-[11px] leading-relaxed text-[#74512D]">{item.explanation}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
