'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, inr } from '@/lib/format';
import StatusBadge from './StatusBadge';
import ScoreGauge from './ScoreGauge';
import FactorBreakdown from './FactorBreakdown';
import { IconArrowRight, IconCheck, IconDoc } from './Icons';

const STEPS = [
  { id: 'scored', label: 'TrustScore generated' },
  { id: 'listed', label: 'Packaged for RXIL' },
  { id: 'disbursed', label: '90% paid to unit' },
  { id: 'settled', label: 'Buyer pays financier' }
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
      if (!cancelled) setError(err.message || 'Could not load invoice');
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
      setFlash(result.message || 'Done');
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusy('');
    }
  }

  if (!invoice && !error) {
    return <p className="text-slate-400">Loading underwriting file…</p>;
  }

  if (error && !invoice) {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
        {error}{' '}
        <Link href="/" className="underline">
          Back to desk
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-slate-400 transition-colors hover:text-teal">
            ← Financier desk
          </Link>
          <h1 className="mt-2 font-mono text-3xl text-white">{invoice.id}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {invoice.unitName} · {invoice.buyerName} · {formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={invoice.trustStatus} />
          <StatusBadge status={disb?.status || invoice.tredsStatus} />
        </div>
      </div>

      {flash ? (
        <div className="rounded-2xl border border-teal/30 bg-teal/10 px-5 py-3 text-sm text-teal">{flash}</div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      <ol className="grid gap-3 sm:grid-cols-4">
        {STEPS.map((step, index) => {
          const done = stepState(invoice, step.id);
          return (
            <li key={step.id} className={`rounded-2xl border p-4 ${done ? 'border-teal/40 bg-teal/10' : 'border-line bg-ink-800/50'}`}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">0{index + 1}</p>
              <p className={`mt-1 text-sm ${done ? 'text-white' : 'text-slate-400'}`}>{step.label}</p>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-line bg-ink-800/60 p-6">
            <div className="flex items-center gap-2 text-teal">
              <IconDoc className="h-4 w-4" />
              <h2 className="text-sm font-semibold uppercase tracking-widest">Invoice</h2>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-mono text-lg text-white">{inr(invoice.amount)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Due date</dt>
                <dd className="text-white">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">GSTIN</dt>
                <dd className="font-mono text-slate-200">{invoice.gstNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Description</dt>
                <dd className="text-slate-200">{invoice.description || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-ink-800/60 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-teal">RXIL-style TReDS package</h2>
            <p className="mt-2 text-xs text-slate-400">
              TrustFlow does not lend. It only formats a verified receivable the way an exchange like RXIL expects.
            </p>
            {pkg ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Exchange</dt>
                  <dd className="text-white">{pkg.exchange} · {pkg.instrumentType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Package ID</dt>
                  <dd className="font-mono text-white">{invoice.tredsPackage.id}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Seller</dt>
                  <dd className="text-white">{pkg.seller?.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Recourse</dt>
                  <dd className="text-white">{String(pkg.recourse || '').replaceAll('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Advance now</dt>
                  <dd className="font-mono text-teal">{inr(pkg.financingRequest?.disbursedAmount)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Holdback / spread</dt>
                  <dd className="font-mono text-gold">{inr(pkg.financingRequest?.holdbackAmount)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Not listed yet. Accepting will package this invoice onto the mock RXIL board.</p>
            )}
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => run('package', () => api.packageInvoice(invoice.id))}
              className="mt-5 rounded-full border border-line px-4 py-2 text-sm text-slate-200 transition-colors duration-200 hover:border-teal/40 disabled:opacity-50"
            >
              {busy === 'package' ? 'Packaging…' : pkg ? 'Refresh package' : 'Send to TReDS'}
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-ink-800/60 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-teal">Cash movement</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-ink-900 p-4">
                <p className="text-xs text-slate-500">Unit receives now</p>
                <p className="mt-1 font-mono text-xl text-white">{inr(invoice.financing.unitReceivesNow)}</p>
                <p className="text-xs text-slate-500">90% of invoice</p>
              </div>
              <div className="rounded-xl bg-ink-900 p-4">
                <p className="text-xs text-slate-500">Held by financier</p>
                <p className="mt-1 font-mono text-xl text-gold">{inr(invoice.financing.holdbackAmount)}</p>
                <p className="text-xs text-slate-500">10% until buyer pays</p>
              </div>
              <div className="rounded-xl bg-ink-900 p-4">
                <p className="text-xs text-slate-500">Buyer pays at term</p>
                <p className="mt-1 font-mono text-xl text-white">{inr(invoice.financing.financierReceivesAtTerm)}</p>
                <p className="text-xs text-slate-500">Routes to financier, not the unit</p>
              </div>
            </div>

            {disb?.status === 'SETTLED' ? (
              <p className="mt-4 text-sm text-gold">
                Settlement complete. Financier recovered the 90% advance and kept {inr(disb.holdbackAmount)} as spread. The unit does not receive the remaining 10%.
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {canAccept ? (
                <>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => run('accept', () => api.acceptInvoice(invoice.id))}
                    className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-teal/90 disabled:opacity-50"
                  >
                    <IconCheck />
                    {busy === 'accept' ? 'Disbursing…' : 'Accept · disburse 90%'}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => run('decline', () => api.declineInvoice(invoice.id))}
                    className="rounded-full border border-line px-5 py-2.5 text-sm text-slate-300 transition-colors duration-200 hover:border-rose-400/40 hover:text-rose-200 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </>
              ) : null}
              {canSettle ? (
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => run('settle', () => api.settleInvoice(invoice.id))}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-gold/90 disabled:opacity-50"
                >
                  Simulate buyer payment
                  <IconArrowRight />
                </button>
              ) : null}
            </div>
            {invoice.trustStatus === 'AT_RISK' && canAccept ? (
              <p className="mt-3 text-xs text-rose-300">This file is below 70. Accepting is allowed for the demo, but a real financier would likely pass.</p>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-teal/25 bg-ink-800/80 p-6 shadow-glow">
            <p className="text-center text-[11px] uppercase tracking-[0.22em] text-slate-400">Explainable TrustScore</p>
            <div className="mt-4">
              <ScoreGauge score={invoice.trustScore} status={invoice.trustStatus} />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Rule-based, 100 points. Not machine learning. Generated from GST, delivery, buyer check, ageing, and Account Aggregator cash-flow.
            </p>
            <div className="mt-6">
              <FactorBreakdown breakdown={invoice.score?.breakdown} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
