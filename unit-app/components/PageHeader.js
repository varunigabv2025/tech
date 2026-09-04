import React from 'react';

export default function PageHeader({ title, description, actions, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2D4C3]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#543310] tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#EFE7CB] text-[#543310]">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-xs sm:text-sm text-[#74512D]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
