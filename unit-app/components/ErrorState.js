import React from 'react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data from backend server.',
  onRetry
}) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-center">
      <div className="mx-auto w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 mb-3">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="mt-1 text-xs text-rose-700 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
