import React from 'react';
import Card from './Card';

const FACTOR_TITLES = {
  gstConsistency: 'GST Filing Consistency',
  buyerVerification: 'Buyer Verification',
  deliveryConfirmed: 'Delivery Confirmed',
  daysOutstanding: 'Days Outstanding (Ageing)',
  cashFlowStability: 'Cash-Flow Stability'
};

export default function FactorBreakdown({ breakdown }) {
  if (!breakdown) return null;

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#543310]">Why This Score? — Factor Breakdown</h2>
          <span className="text-xs font-mono text-[#74512D]">5 Verified Signals</span>
        </div>
      }
    >
      <div className="space-y-5">
        {Object.entries(breakdown).map(([key, factor]) => {
          const title = FACTOR_TITLES[key] || key.replace(/([A-Z])/g, ' $1');
          const score = Number(factor.score) || 0;
          const max = Number(factor.max) || 1;
          const fillPercent = Math.max(0, Math.min(100, (score / max) * 100));

          // Format value display
          let formattedValue = factor.value;
          if (typeof factor.value === 'boolean') {
            formattedValue = factor.value ? 'Verified / Confirmed' : 'Not Confirmed';
          } else if (key === 'gstConsistency' || key === 'cashFlowStability') {
            formattedValue = `${factor.value}%`;
          } else if (key === 'daysOutstanding') {
            formattedValue = `${factor.value} days`;
          }

          return (
            <div key={key} className="p-3.5 bg-[#FAF6E9]/60 rounded-xl border border-[#E2D4C3] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-[#543310]">{title}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#AF8F6F]">
                    Signal: <strong className="text-[#543310]">{formattedValue}</strong>
                  </span>
                  <span className="font-mono font-bold text-[#74512D] bg-[#EFE7CB] px-2 py-0.5 rounded">
                    {score.toFixed(2)} / {max} pts
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E2D4C3] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#74512D] h-full rounded-full transition-all duration-700"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>

              {/* Explanation */}
              {factor.explanation && (
                <p className="text-[11px] text-[#74512D] leading-relaxed italic">
                  {factor.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
