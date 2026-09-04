'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardIcon, OrdersIcon, InvoicesIcon } from './Icons';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: DashboardIcon },
    { href: '/orders', label: 'Orders', icon: OrdersIcon },
    { href: '/invoices', label: 'Invoices', icon: InvoicesIcon }
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-[#E2D4C3] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Mode / User Badge */}
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

            {user ? (
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 ml-1" title={`Logged in as ${user.email}`}>
                👤 {user.name} ({user.role})
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFE7CB] text-[#543310] border border-[#AF8F6F]/40 ml-1">
                {isAuthPage ? 'TRUSTFLOW PLATFORM' : 'UNIT VIEW'}
              </span>
            )}
          </div>

          {/* Center: Main Nav Links */}
          {!isAuthPage && (
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
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
          )}

          {/* Right: Auth Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/login'
                      ? 'bg-[#74512D] text-white'
                      : 'text-[#543310] hover:bg-[#FAF6E9]'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#543310] hover:bg-[#74512D] shadow-sm transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
