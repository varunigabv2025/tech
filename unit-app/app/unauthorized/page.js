'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ExternalLinkIcon } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const FINANCIER_APP_URL = process.env.NEXT_PUBLIC_FINANCIER_URL || 'http://localhost:3001';

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-2xl shadow-sm mb-1">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-[#543310] tracking-tight">Access Restricted</h1>
          <p className="text-xs text-[#74512D]">
            Your account does not have permission to access the Unit Operations Portal.
          </p>
        </div>

        <Card className="border-amber-200 bg-[#FAF6E9] shadow-md text-center p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-xs text-[#AF8F6F] uppercase font-semibold tracking-wider block">
              Current Authenticated Role
            </span>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#543310] text-[#F8F4E1] font-mono">
              {user ? user.role : 'FINANCIER'}
            </div>
            <p className="text-xs text-[#74512D] pt-2 leading-relaxed">
              This area is reserved exclusively for registered MSME Job-Work Units. Institutional Financiers must evaluate and manage factoring opportunities on the Financier Desk.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={FINANCIER_APP_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full justify-center">
                <span>Go to Financier Desk</span>
                <ExternalLinkIcon className="w-4 h-4" />
              </Button>
            </a>

            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full justify-center">
                <span>Back to Login</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
