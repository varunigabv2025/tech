'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import StatusBadge from './StatusBadge';
import { IconArrowRight } from './Icons';

export default function InvoiceInbox() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    api
      .financierInvoices()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load financier invoices. Is the backend running on port 5000?');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const invoices = data?.invoices || [];
  const filtered = useMemo(() => {
    if (filter === 'ALL') return invoices;
    if (filter === 'LISTED') return invoices.filter((row) => row.tredsStatus);
    if (filter === 'DISBURSED') return invoices.filter((row) => row.disbursement?.status === 'DISBURSED');
    if (filter === 'SETTLED') return invoices.filter((row) => row.disbursement?.status === 'SETTLED');
    return invoices.filter((row) => row.trustStatus === filter);
  }, [filter, invoices]);

  const summary = data?.summary;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">Mock RXIL · incoming paper</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Financier desk</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Scored Tirupur job-work invoices, packaged the way TReDS expects. TrustScore is rule-based and fully explained — not a black box.
          </p>
        </div>
        <Link
          href="/consent"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-slate-200 transition-colors duration-200 hover:border-teal/40 hover:text-white"
        >
          Open AA consent
          <IconArrowRight />
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{error}</div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'On the board', value: summary?.total ?? '—', hint: 'Scored invoices' },
          { label: 'Finance ready', value: summary?.financeReady ?? '—', hint: 'TrustScore 90+' },
          { label: 'Needs review', value: summary?.review ?? '—', hint: '70–89.99' },
          { label: 'At risk', value: summary?.atRisk ?? '—', hint: 'Below 70' }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-ink-800/70 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">{card.label}</p>
            <p className="mt-2 font-mono text-3xl text-white">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          ['ALL', 'All'],
          ['FINANCE_READY', 'Finance ready'],
          ['REVIEW', 'Review'],
          ['AT_RISK', 'At risk'],
          ['DISBURSED', 'Disbursed'],
          ['SETTLED', 'Settled']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              filter === id
                ? 'border-teal/50 bg-teal/15 text-teal'
                : 'border-line bg-ink-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink-800/90 text-[11px] uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Unit / buyer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">TrustScore</th>
              <th className="px-4 py-3 font-medium">TReDS</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {!data && !error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Loading scored invoices…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No invoices in this view. Seed the backend demo data, then refresh.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-t border-line/80 bg-ink-900/40 hover:bg-ink-800/60">
                  <td className="px-4 py-4">
                    <p className="font-mono text-white">{row.id}</p>
                    <p className="text-xs text-slate-500">{row.daysOutstanding} days outstanding</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-100">{row.unitName}</p>
                    <p className="text-xs text-slate-500">{row.buyerName}</p>
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-100">{inr(row.amount)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{Number(row.trustScore).toFixed(2)}</span>
                      <StatusBadge status={row.trustStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={row.disbursement?.status || row.tredsStatus} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/invoices/${row.id}`}
                      className="inline-flex items-center gap-1 text-sm text-teal transition-colors duration-200 hover:text-white"
                    >
                      Underwrite
                      <IconArrowRight />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Demo invoices: INV001 Kumar Knitwear (finance ready) · INV002 Sri Lakshmi (review) · INV003 Murugan Garments (at risk).
      </p>
    </div>
  );
}
