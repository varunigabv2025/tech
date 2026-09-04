import React from 'react';
import StatusBadge from './StatusBadge';

const STATUS_DESCRIPTIONS = {
  FINANCE_READY: 'High confidence for instant financing / TReDS onboarding.',
  REVIEW: 'Manual underwriting recommended. Moderate risk profile.',
  AT_RISK: 'High risk factor present. Requires risk mitigation before listing.'
};

export default function ScoreGauge({
  score = null,
  status = null,
  breakdown = null,
  compact = false
}) {
  const displayScore = score !== null && score !== undefined ? Number(score).toFixed(2) : '—';
  const maxScore = 100;
  const description = STATUS_DESCRIPTIONS[status] || 'Verify invoice data to compute TrustScore.';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-base text-[#543310]">
          {displayScore}
        </span>
        <span className="text-xs text-[#AF8F6F]">/ 100</span>
        {status && <StatusBadge status={status} />}
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#AF8F6F]/60 rounded-xl p-6 shadow-warm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#74512D] uppercase tracking-wider">
          TrustScore Hero
        </span>
        {status ? (
          <StatusBadge status={status} />
        ) : (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#FAF6E9] text-[#74512D] border border-[#AF8F6F]/40">
            Unscored
          </span>
        )}
      </div>

      <div className="text-center py-4 bg-[#FAF6E9] rounded-xl border border-[#E2D4C3]">
        <span className="text-[11px] font-semibold text-[#74512D] uppercase tracking-wider block mb-1">
          Calculated TrustScore
        </span>
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-[#543310] font-mono tracking-tight">
            {displayScore}
          </span>
          <span className="text-sm font-semibold text-[#AF8F6F]">/ {maxScore}</span>
        </div>
      </div>

      {status && (
        <div className="p-3 rounded-lg bg-[#FAF6E9]/60 border border-[#E2D4C3] text-center">
          <span className="text-xs font-medium text-[#543310] block">{description}</span>
        </div>
      )}

      <div className="pt-2 text-center text-[11px] text-[#74512D] border-t border-[#E2D4C3]">
        <span>Deterministic 100-point formula &bull; Rule-based risk engine</span>
      </div>
    </div>
  );
}
