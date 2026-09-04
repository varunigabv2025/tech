import React from 'react';
import StatusBadge from './StatusBadge';

export default function ScoreGauge({
  score = null,
  status = null,
  breakdown = null,
  compact = false
}) {
  const displayScore = score !== null && score !== undefined ? Number(score).toFixed(2) : '—';
  const maxScore = 100;

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
    <div className="bg-[#FAF6E9] border border-[#E2D4C3] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#74512D] uppercase tracking-wider">
          TrustScore Breakdown
        </span>
        {status && <StatusBadge status={status} />}
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-extrabold text-[#543310] font-mono">
          {displayScore}
        </span>
        <span className="text-sm font-medium text-[#AF8F6F]">/ {maxScore} pts</span>
      </div>

      {breakdown ? (
        <div className="space-y-3 pt-3 border-t border-[#E2D4C3]">
          {Object.entries(breakdown).map(([key, factor]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#543310] capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="font-mono text-[#74512D]">
                  {factor.score} / {factor.max}
                </span>
              </div>
              <div className="w-full bg-[#E2D4C3] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#74512D] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (factor.score / factor.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#AF8F6F] italic border-t border-[#E2D4C3] pt-3">
          Score breakdown will populate after verification.
        </p>
      )}
    </div>
  );
}
