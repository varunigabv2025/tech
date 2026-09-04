'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import { ExternalLinkIcon, CheckCircleIcon, AlertTriangleIcon, ShieldCheckIcon } from '@/components/Icons';
import { formatINR, formatDate } from '@/lib/format';
import { api } from '@/lib/api';

export default function TredsCard({ invoice, scoreData, tredsPackage, onPackageCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!invoice) return null;

  const currentStatus = scoreData ? scoreData.status : invoice.status;
  const currentScore = scoreData ? scoreData.trustScore : invoice.trustScore;
  const isVerified = Boolean(invoice.verified);
  const isFinanceReady = currentStatus === 'FINANCE_READY';
  const isPackaged = Boolean(tredsPackage);

  const handleSendToTreds = async () => {
    if (submitting || isPackaged) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.packageInvoice(invoice.id);
      if (res.success && res.tredsPackage) {
        if (onPackageCreated) {
          onPackageCreated(res.tredsPackage);
        }
      } else {
        setError(res.message || 'Failed to package invoice for TReDS');
      }
    } catch (err) {
      setError(err.message || 'Error submitting invoice to TReDS');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      className="border-[#AF8F6F]/40 shadow-sm overflow-hidden"
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#543310] flex items-center justify-center text-[#F8F4E1] font-bold text-xs">
              RXIL
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#543310]">TReDS Financing Exchange</h3>
              <p className="text-[11px] text-[#74512D]">Receivables Exchange of India Limited (TReDS Integration)</p>
            </div>
          </div>
          {isPackaged && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Listed on TReDS</span>
            </span>
          )}
        </div>
      }
    >
      {/* State 1: Already Packaged */}
      {isPackaged ? (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30 space-y-3">
            <div className="flex items-center justify-between border-b border-[#AF8F6F]/20 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-[#543310] text-sm">✓ Invoice Package Active</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#543310] text-[#F8F4E1]">
                {tredsPackage.exchange || 'RXIL'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#AF8F6F] block text-[11px]">Package ID</span>
                <span className="font-mono font-bold text-[#543310] text-sm">{tredsPackage.id}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block text-[11px]">Invoice ID</span>
                <span className="font-mono font-semibold text-[#543310] text-sm">{tredsPackage.invoiceId}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block text-[11px]">Listing Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={tredsPackage.status} />
                </div>
              </div>
              <div>
                <span className="text-[#AF8F6F] block text-[11px]">Exchange</span>
                <span className="font-semibold text-[#543310]">{tredsPackage.exchange || 'RXIL'}</span>
              </div>
            </div>

            {tredsPackage.createdAt && (
              <div className="text-[11px] text-[#74512D] pt-1">
                Listed at: <span className="font-mono">{formatDate(tredsPackage.createdAt)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#543310] text-[#F8F4E1]">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#AF8F6F]">Financier Evaluation Ready</h4>
              <p className="text-xs text-[#FAF6E9]/90">
                This invoice is live on the TReDS board. Open the Financier Desk to review bids, disburse 90% advance, or settle term payments.
              </p>
            </div>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="primary" size="md" className="bg-[#AF8F6F] hover:bg-[#74512D] text-white border-none font-bold">
                <span className="flex items-center gap-2">
                  <span>Open Financier Desk</span>
                  <ExternalLinkIcon className="w-4 h-4" />
                </span>
              </Button>
            </a>
          </div>
        </div>
      ) : isFinanceReady ? (
        /* State 2: Eligible for TReDS (FINANCE_READY) */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              <span>High TrustScore — Eligible for Immediate TReDS Packaging</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              This invoice has achieved a TrustScore of <strong>{currentScore !== null ? Number(currentScore).toFixed(2) : '—'} / 100</strong> ({currentStatus}). It meets the criteria for instant packaging on the RXIL TReDS platform for financier bidding.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-900">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30">
            <div className="space-y-1">
              <span className="text-xs text-[#74512D] block font-medium">Clicking below generates standard RXIL XML/JSON payload with GST & AA proof attached.</span>
              <span className="text-xs font-mono font-bold text-[#543310]">Invoice Amount: {formatINR(invoice.amount)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={submitting}
              onClick={handleSendToTreds}
              className="w-full sm:w-auto font-bold shrink-0"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Submitting to TReDS...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Send to TReDS</span>
                  <ExternalLinkIcon className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      ) : currentStatus === 'REVIEW' ? (
        /* State 3: REVIEW Status */
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
            <span>Manual Risk Review Required (TrustScore: {currentScore !== null ? Number(currentScore).toFixed(2) : '—'} / 100)</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            This invoice is in <strong>REVIEW</strong> status. TReDS automated packaging requires a high-trust score (≥ 90). Submission is locked until verification signals are resolved or manual underwriter approval is provided.
          </p>
          <div className="pt-1">
            <Button variant="outline" size="sm" disabled className="opacity-60 cursor-not-allowed">
              Send to TReDS (Locked — In Review)
            </Button>
          </div>
        </div>
      ) : (
        /* State 4: AT_RISK or Unverified Status */
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangleIcon className="w-5 h-5 text-rose-600" />
            <span>Ineligible for TReDS Packaging ({currentStatus || 'UNVERIFIED'})</span>
          </div>
          <p className="text-rose-800 leading-relaxed">
            {!isVerified
              ? 'Invoice has not been verified against GST & Account Aggregator signals. Complete Step 1 verification above before TReDS submission.'
              : `Invoice TrustScore is ${currentScore !== null ? Number(currentScore).toFixed(2) : '0'} / 100 (AT_RISK). High default risk or 45+ day payment delay prevents automated TReDS listing.`}
          </p>
          <div className="pt-1">
            <Button variant="outline" size="sm" disabled className="opacity-60 cursor-not-allowed">
              Send to TReDS (Ineligible)
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
