import React from 'react';

export default function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-white border border-[#E2D4C3] rounded-xl shadow-warm overflow-hidden ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-[#E2D4C3] bg-[#FAF6E9]/50">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-[#E2D4C3] bg-[#FAF6E9]/30 text-xs text-[#74512D]">
          {footer}
        </div>
      )}
    </div>
  );
}
