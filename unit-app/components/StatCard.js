import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeColor = 'bg-[#EFE7CB] text-[#543310]',
  className = ''
}) {
  return (
    <div className={`bg-white border border-[#E2D4C3] rounded-xl p-5 shadow-warm hover:shadow-warmLg transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#74512D]">
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#FAF6E9] border border-[#E2D4C3] flex items-center justify-center text-[#74512D]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-[#543310] font-sans">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-[#AF8F6F]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
