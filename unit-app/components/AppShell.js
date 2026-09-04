import React from 'react';
import Navigation from './Navigation';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F4E1] flex flex-col font-sans text-[#543310]">
      <Navigation />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-[#E2D4C3] py-4 text-center text-xs text-[#74512D]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TrustFlow — Job-Work Unit Receivables Engine</span>
          <span className="font-mono text-[11px] text-[#AF8F6F]">
            Node.js + SQLite | Next.js | TReDS / RXIL Packaging Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
