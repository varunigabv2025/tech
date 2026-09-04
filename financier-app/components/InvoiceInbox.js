'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import StatusBadge from './StatusBadge';
import { IconArrowRight, IconKey, IconShield } from './Icons';

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
        if (!cancelled)
          setError(
            err.message || 'Unable to connect to TrustFlow backend. Please check server status.'
          );
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
      {/* Header Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-[#AF8F6F]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFE7CB] text-[#543310] border border-[#AF8F6F]/40 mb-2">
            <span>TReDS Exchange Integration</span>
          </div>
          <h1 className="text-3xl font-bold text-[#543310] tracking-tight">Financing Opportunities</h1>
          <p className="mt-1 max-w-3xl text-sm text-[#74512D]">
            Evaluate verified MSME receivables, explainable TrustScores, and disburse 90% factoring advances under TReDS framework.
          </p>
        </div>
        <Link
          href="/consent"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#AF8F6F]/50 text-xs font-bold text-[#543310] hover:bg-[#FAF6E9] hover:border-[#74512D] transition-all shadow-sm"
        >
          <IconKey className="w-4 h-4 text-[#74512D]" />
          <span>AA Consent Management &rarr;</span>
        </Link>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Invoices', value: summary?.total ?? '—', hint: 'Scored Receivables' },
          { label: 'Finance Ready', value: summary?.financeReady ?? '—', hint: 'TrustScore 90+' },
          { label: 'Pending Review', value: summary?.review ?? '—', hint: 'TrustScore 70–89.9' },
          { label: 'At Risk', value: summary?.atRisk ?? '—', hint: 'TrustScore Below 70' }
        ].map((card) => (
          <div
            key={card.label}
            className="p-5 rounded-2xl bg-white border border-[#AF8F6F]/30 shadow-warm transition-all hover:shadow-warmLg"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#74512D]">{card.label}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-[#543310]">{card.value}</p>
            <p className="mt-1 text-xs text-[#AF8F6F]">{card.hint}</p>
          </div>
        ))}
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          ['ALL', 'All Invoices'],
          ['FINANCE_READY', 'Finance Ready'],
          ['REVIEW', 'Needs Review'],
          ['AT_RISK', 'At Risk'],
          ['DISBURSED', 'Disbursed (90%)'],
          ['SETTLED', 'Term Settled']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              filter === id
                ? 'bg-[#74512D] text-white border-[#74512D] shadow-sm'
                : 'bg-white text-[#543310] border-[#AF8F6F]/40 hover:bg-[#FAF6E9]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Opportunities Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#AF8F6F]/40 shadow-warm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF6E9] border-b border-[#E2D4C3] text-[11px] font-bold uppercase tracking-wider text-[#543310]">
              <tr>
                <th className="px-5 py-3.5">Invoice ID</th>
                <th className="px-5 py-3.5">MSME Unit / Buyer</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">TrustScore</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D4C3]/60">
              {!data && !error ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#74512D]">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#74512D]/30 border-t-[#74512D] rounded-full animate-spin" />
                      <span>Loading scored invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#74512D]">
                    No financing opportunities found in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAF6E9]/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-[#543310]">{row.id}</p>
                      <p className="text-xs text-[#AF8F6F] font-medium">{row.daysOutstanding} days outstanding</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#543310]">{row.unitName}</p>
                      <p className="text-xs text-[#74512D]">{row.buyerName}</p>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-[#543310]">
                      {inr(row.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#543310]">
                          {Number(row.trustScore).toFixed(1)}
                        </span>
                        <StatusBadge status={row.trustStatus} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.disbursement?.status || row.tredsStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/invoices/${row.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#74512D] bg-[#FAF6E9] border border-[#AF8F6F]/40 hover:bg-[#EFE7CB] hover:text-[#543310] transition-all"
                      >
                        <span>Underwrite</span>
                        <IconArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
