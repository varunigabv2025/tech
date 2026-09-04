'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { IconInbox, IconKey, IconShield } from './Icons';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { href: '/', label: 'Financing Desk', icon: IconInbox },
    { href: '/consent', label: 'AA Consent', icon: IconKey }
  ];

  const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3000/login';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      window.location.href = LOGIN_URL;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4E1] text-[#543310]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#E2D4C3] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-[#543310] flex items-center justify-center text-[#F8F4E1] font-bold text-lg shadow-sm group-hover:bg-[#74512D] transition-colors">
                  TF
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-[#543310] leading-tight tracking-tight">
                    TrustFlow
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#AF8F6F]">
                    Financier Desk
                  </span>
                </div>
              </Link>

              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 ml-2" title="Authenticated as Institutional Lender">
                💰 Alchemy Finance Partners (FINANCIER)
              </span>
            </div>

            {/* Center: Main Nav Links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/' || pathname?.startsWith('/invoices')
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#74512D] text-[#F8F4E1] shadow-sm font-semibold'
                        : 'text-[#543310] hover:bg-[#FAF6E9] hover:text-[#74512D]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Authenticated Logout */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
