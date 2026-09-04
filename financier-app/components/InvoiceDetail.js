'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, inr } from '@/lib/format';
import StatusBadge from './StatusBadge';
import ScoreGauge from './ScoreGauge';
import FactorBreakdown from './FactorBreakdown';
import { IconArrowRight, IconCheck, IconDoc } from './Icons';

const STEPS = [
  { id: 'scored', label: 'TrustScore Generated' },
  { id: 'listed', label: 'Packaged for TReDS' },
  { id: 'disbursed', label: '90% Disbursed to Unit' },
  { id: 'settled', label: 'Term Settlement Received' }
];

function stepState(invoice, id) {
  const treds = invoice?.tredsStatus;
  const disb = invoice?.disbursement?.status;
  if (id === 'scored') return true;
  if (id === 'listed') return Boolean(treds);
  if (id === 'disbursed') return disb === 'DISBURSED' || disb === 'SETTLED';
  if (id === 'settled') return disb === 'SETTLED';
  return false;
}

export default function InvoiceDetail({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [flash, setFlash] = useState('');

  function load() {
    return api.financierInvoice(invoiceId).then((payload) => {
      setInvoice(payload.invoice);
      setError('');
    });
  }

  useEffect(() => {
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) setError(err.message || 'Could not load invoice underwriting file.');
    });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  async function run(action, fn) {
    setBusy(action);
    setFlash('');
    try {
      const result = await fn();
      if (result.invoice) setInvoice(result.invoice);
      else await load();
      setFlash(result.message || 'Operation completed successfully.');
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusy('');
    }
  }

  if (!invoice && !error) {
    return (
      <div className="flex items-center justify-center py-20 text-[#74512D]">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-5 h-5 border-2 border-[#74512D]/30 border-t-[#74512D] rounded-full animate-spin" />
          <span>Loading underwriting file...</span>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-900 space-y-2">
        <p>⚠️ {error}</p>
        <Link href="/" className="inline-block text-xs font-bold text-[#543310] underline">
          &larr; Return to Financier Desk
        </Link>
      </div>
    );
  }

  const pkg = invoice.tredsPackage?.payload;
  const disb = invoice.disbursement;
  const declined = invoice.tredsStatus === 'DECLINED';
  const canAccept = !disb && !declined;
  const canSettle = disb?.status === 'DISBURSED';

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-2 border-b border-[#AF8F6F]/30">
        <div>
          <Link href="/" className="text-xs font-bold text-[#74512D] hover:text-[#543310] transition-colors">
            &larr; Back to Financier Desk
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-mono text-3xl font-bold text-[#543310]">{invoice.id}</h1>
            <StatusBadge status={invoice.trustStatus} />
            <StatusBadge status={disb?.status || invoice.tredsStatus} />
          </div>
          <p className="mt-1 text-sm font-medium text-[#74512D]">
            {invoice.unitName} &bull; Buyer: {invoice.buyerName} &bull; Invoice Date: {formatDate(invoice.invoiceDate)}
          </p>
        </div>
      </div>

      {flash && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <span>✅</span>
          <span>{flash}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Progress Stepper */}
      <ol className="grid gap-3 sm:grid-cols-4">
        {STEPS.map((step, index) => {
          const done = stepState(invoice, step.id);
          return (
            <li
              key={step.id}
              className={`rounded-2xl border p-4 transition-all ${
                done
                  ? 'border-[#74512D] bg-[#FAF6E9] shadow-sm'
                  : 'border-[#AF8F6F]/30 bg-white opacity-70'
              }`}
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#AF8F6F]">
                0{index + 1}
              </p>
              <p className={`mt-1 text-xs font-bold ${done ? 'text-[#543310]' : 'text-[#74512D]'}`}>
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* Left Column: Underwriting File Cards */}
        <section className="space-y-6">
          {/* Invoice Information */}
          <div className="rounded-2xl bg-white border border-[#AF8F6F]/40 p-6 shadow-warm">
            <div className="flex items-center gap-2 text-[#543310] mb-4 pb-2 border-b border-[#E2D4C3]">
              <IconDoc className="w-5 h-5 text-[#74512D]" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Invoice Details</h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <dt className="text-[#AF8F6F] font-medium">Invoice Amount</dt>
                <dd className="font-mono text-xl font-bold text-[#543310]">{inr(invoice.amount)}</dd>
              </div>
              <div>
                <dt className="text-[#AF8F6F] font-medium">Payment Due Date</dt>
                <dd className="text-sm font-bold text-[#543310]">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-[#AF8F6F] font-medium">MSME GSTIN</dt>
                <dd className="font-mono text-sm font-bold text-[#543310]">{invoice.gstNumber}</dd>
              </div>
              <div>
                <dt className="text-[#AF8F6F] font-medium">Order Description</dt>
                <dd className="text-sm font-semibold text-[#543310]">{invoice.description || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* TReDS Package Information */}
          <div className="rounded-2xl bg-white border border-[#AF8F6F]/40 p-6 shadow-warm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#543310] mb-1">
              TReDS Exchange Package (RXIL)
            </h2>
            <p className="text-xs text-[#74512D] mb-4">
              Standardized TReDS factoring instrument formatted from verified delivery and GST data.
            </p>
            {pkg ? (
              <dl className="grid gap-3 text-xs sm:grid-cols-2 bg-[#FAF6E9] p-4 rounded-xl border border-[#AF8F6F]/30">
                <div>
                  <dt className="text-[#AF8F6F] font-medium">Exchange Platform</dt>
                  <dd className="font-semibold text-[#543310]">{pkg.exchange} &bull; {pkg.instrumentType}</dd>
                </div>
                <div>
                  <dt className="text-[#AF8F6F] font-medium">Package Reference ID</dt>
                  <dd className="font-mono font-bold text-[#543310]">{invoice.tredsPackage.id}</dd>
                </div>
                <div>
                  <dt className="text-[#AF8F6F] font-medium">Seller Entity</dt>
                  <dd className="font-semibold text-[#543310]">{pkg.seller?.name}</dd>
                </div>
                <div>
                  <dt className="text-[#AF8F6F] font-medium">Recourse Type</dt>
                  <dd className="font-semibold text-[#543310]">{String(pkg.recourse || '').replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-[#AF8F6F] font-medium">Disbursement Advance (90%)</dt>
                  <dd className="font-mono font-bold text-emerald-800">{inr(pkg.financingRequest?.disbursedAmount)}</dd>
                </div>
                <div>
                  <dt className="text-[#AF8F6F] font-medium">Financier Spread / Holdback (10%)</dt>
                  <dd className="font-mono font-bold text-amber-800">{inr(pkg.financingRequest?.holdbackAmount)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-xs text-[#74512D] italic">
                Not packaged yet. Click below to generate the TReDS packaging instrument.
              </p>
            )}
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => run('package', () => api.packageInvoice(invoice.id))}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#543310] bg-[#FAF6E9] border border-[#AF8F6F]/50 hover:bg-[#EFE7CB] transition-all disabled:opacity-50"
            >
              {busy === 'package' ? 'Processing...' : pkg ? 'Refresh TReDS Package' : 'Generate TReDS Package'}
            </button>
          </div>

          {/* Cash Movement & Underwriting Decision */}
          <div className="rounded-2xl bg-white border border-[#AF8F6F]/40 p-6 shadow-warm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#543310]">
              Cash Movement & Financing Decision
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-3.5 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30">
                <p className="text-[11px] font-semibold text-[#AF8F6F]">Unit Advance (90%)</p>
                <p className="mt-1 font-mono text-lg font-bold text-[#543310]">
                  {inr(invoice.financing.unitReceivesNow)}
                </p>
                <p className="text-[10px] text-[#74512D]">Disbursed to MSME</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30">
                <p className="text-[11px] font-semibold text-[#AF8F6F]">Holdback (10%)</p>
                <p className="mt-1 font-mono text-lg font-bold text-amber-800">
                  {inr(invoice.financing.holdbackAmount)}
                </p>
                <p className="text-[10px] text-[#74512D]">Financier Margin</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30">
                <p className="text-[11px] font-semibold text-[#AF8F6F]">Term Settlement</p>
                <p className="mt-1 font-mono text-lg font-bold text-[#543310]">
                  {inr(invoice.financing.financierReceivesAtTerm)}
                </p>
                <p className="text-[10px] text-[#74512D]">Paid by Buyer at Maturity</p>
              </div>
            </div>

            {disb?.status === 'SETTLED' && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-900">
                ✓ Settlement complete. Financier recovered the 90% advance and retained {inr(disb.holdbackAmount)} as financing margin.
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {canAccept && (
                <>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => run('accept', () => api.acceptInvoice(invoice.id))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#74512D] hover:bg-[#543310] shadow-sm transition-all disabled:opacity-50"
                  >
                    <IconCheck className="w-4 h-4" />
                    <span>{busy === 'accept' ? 'Disbursing 90%...' : 'Accept Financing & Disburse 90%'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => run('decline', () => api.declineInvoice(invoice.id))}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    Decline Opportunity
                  </button>
                </>
              )}
              {canSettle && (
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => run('settle', () => api.settleInvoice(invoice.id))}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#543310] hover:bg-[#74512D] shadow-sm transition-all disabled:opacity-50"
                >
                  <span>Simulate Buyer Term Settlement</span>
                  <IconArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {invoice.trustStatus === 'AT_RISK' && canAccept && (
              <p className="text-xs text-rose-600 font-semibold">
                ⚠️ Caution: TrustScore is below 70 (At Risk). Financing is permitted for evaluation, but requires heightened underwriting review.
              </p>
            )}
          </div>
        </section>

        {/* Right Column: TrustScore & Factor Breakdown */}
        <aside className="space-y-6">
          <div className="rounded-2xl bg-white border border-[#AF8F6F]/40 p-6 shadow-warm space-y-4">
            <div className="text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#74512D]">Explainable TrustScore</h3>
              <p className="text-[11px] text-[#AF8F6F]">100-Point Rule-Based Receivables Index</p>
            </div>

            <div className="my-4">
              <ScoreGauge score={invoice.trustScore} status={invoice.trustStatus} />
            </div>

            <p className="text-center text-xs text-[#74512D] leading-snug">
              Calculated deterministically from GST filing active state, physical delivery logs, buyer validation, days outstanding, and Account Aggregator cash-flow data.
            </p>

            <div className="pt-4 border-t border-[#E2D4C3]">
              <FactorBreakdown breakdown={invoice.score?.breakdown} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
