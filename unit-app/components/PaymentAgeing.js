'use client';

import React from 'react';
import Card from './Card';
import Button from './Button';
import { getAgeingState } from '@/lib/format';

export default function PaymentAgeing({ invoiceDate, onOpenODR, className = '' }) {
  const ageing = getAgeingState(invoiceDate);
  const { status, days, threshold, daysOverdue, daysRemaining } = ageing;

  const progressPercent = Math.min(100, Math.round((days / threshold) * 100));

  let statusConfig = {
    cardBg: 'bg-[#FAF6E9]',
    border: 'border-[#E2D4C3]',
    barColor: 'bg-[#74512D]',
    badgeBg: 'bg-[#EFE7CB] text-[#543310] border-[#AF8F6F]/40',
    icon: '⏳',
    headline: 'Healthy Payment Term',
    subtext: `${daysRemaining} days remaining until 45-day MSMED threshold`
  };

  if (status === 'APPROACHING_THRESHOLD') {
    statusConfig = {
      cardBg: 'bg-amber-50/70',
      border: 'border-amber-300',
      barColor: 'bg-amber-600',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '⚠️',
      headline: 'Payment Timeline Approaching 45 Days',
      subtext: `Only ${daysRemaining} days remaining before 45-day MSMED limit`
    };
  } else if (status === 'THRESHOLD_REACHED') {
    statusConfig = {
      cardBg: 'bg-amber-100/80',
      border: 'border-amber-400',
      barColor: 'bg-amber-700',
      badgeBg: 'bg-amber-200 text-amber-950 border-amber-400',
      icon: '🛑',
      headline: '45-Day MSMED Payment Threshold Reached',
      subtext: 'Payment timeline limit reached today'
    };
  } else if (status === 'OVERDUE') {
    statusConfig = {
      cardBg: 'bg-rose-50/90',
      border: 'border-rose-300',
      barColor: 'bg-rose-700',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
      icon: '🚨',
      headline: 'PAYMENT DELAY ALERT — MSMED Threshold Exceeded',
      subtext: `${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} beyond 45-day mandatory timeline`
    };
  }

  return (
    <Card
      className={`${statusConfig.cardBg} ${statusConfig.border} ${className}`}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{statusConfig.icon}</span>
            <h3 className="text-sm font-bold text-[#543310]">45-Day MSMED Payment Monitoring</h3>
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusConfig.badgeBg}`}>
            {days} Days Outstanding
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="font-semibold text-[#543310]">{statusConfig.headline}</span>
            <span className="font-mono text-[#74512D] font-bold">
              {days} / {threshold} days
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-[#E2D4C3] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${statusConfig.barColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-1.5 text-xs text-[#74512D]">{statusConfig.subtext}</p>
        </div>

        <div className="pt-2 border-t border-[#E2D4C3]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-[11px] text-[#AF8F6F]">
            Section 15 of MSMED Act, 2006 mandates payment within 45 days.
          </span>
          {onOpenODR && (
            <Button
              variant={status === 'OVERDUE' ? 'danger' : 'outline'}
              size="sm"
              onClick={onOpenODR}
              className="shrink-0"
            >
              <span>View ODR Complaint Draft</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
