export default function ScoreGauge({ score = 0, status = '' }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    status === 'FINANCE_READY' || value >= 90
      ? '#2DD4BF'
      : status === 'REVIEW' || value >= 70
        ? '#FBBF24'
        : '#FB7185';

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1A2D45" strokeWidth="10" />
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
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-semibold text-white">{value.toFixed(1)}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">/ 100</span>
      </div>
    </div>
  );
}
