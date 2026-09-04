import React from 'react';
import Button from './Button';

export default function EmptyState({
  title = 'No data available',
  description = 'Your items will appear here once created.',
  actionLabel,
  onAction,
  icon,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-6 rounded-xl border border-dashed border-[#AF8F6F]/60 bg-[#FAF6E9]/40 ${className}`}>
      {icon ? (
        <div className="mx-auto w-12 h-12 rounded-full bg-[#EFE7CB] flex items-center justify-center text-[#74512D] mb-4">
          {icon}
        </div>
      ) : (
        <div className="mx-auto w-12 h-12 rounded-full bg-[#EFE7CB] flex items-center justify-center text-[#74512D] mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-[#543310]">{title}</h3>
      <p className="mt-1 text-xs text-[#AF8F6F] max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
