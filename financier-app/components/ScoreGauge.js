import React from 'react';

export default function ScoreGauge({ score = 0, status = '' }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    status === 'FINANCE_READY' || value >= 90
      ? '#15803D'
      : status === 'REVIEW' || value >= 70
        ? '#B45309'
        : '#B91C1C';

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#EFE7CB" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold text-[#543310]">{value.toFixed(1)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#74512D]">/ 100</span>
      </div>
    </div>
  );
}
