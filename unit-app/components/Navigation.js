'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon, OrdersIcon, InvoicesIcon, ExternalLinkIcon } from './Icons';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: DashboardIcon },
    { href: '/orders', label: 'Orders', icon: OrdersIcon },
    { href: '/invoices', label: 'Invoices', icon: InvoicesIcon }
  ];

  const FINANCIER_APP_URL = process.env.NEXT_PUBLIC_FINANCIER_URL || 'http://localhost:3001';

  return (
    <header className="bg-white border-b border-[#E2D4C3] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Mode Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#543310] flex items-center justify-center text-[#F8F4E1] font-bold text-lg shadow-sm group-hover:bg-[#74512D] transition-colors">
                TF
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[#543310] leading-tight tracking-tight">
                  TrustFlow
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AF8F6F]">
                  MSME Receivables
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFE7CB] text-[#543310] border border-[#AF8F6F]/40 ml-2">
              UNIT VIEW
            </span>
          </div>

          {/* Center: Main Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
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

          {/* Right: Mode Switcher (Unit <-> Financier View) */}
          <div className="flex items-center gap-2">
            <a
              href={FINANCIER_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#74512D] bg-[#FAF6E9] border border-[#AF8F6F]/50 hover:bg-[#EFE7CB] hover:border-[#74512D] transition-all"
              title="Switch to Financier View"
            >
              <span>Financier View</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-[#74512D]" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
