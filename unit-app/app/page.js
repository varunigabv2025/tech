'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { InvoicesIcon, OrdersIcon, PlusIcon, ShieldCheckIcon, AlertTriangleIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { formatINR, formatDate, getAgeingState } from '@/lib/format';

export default function UnitDashboard() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, invoicesRes] = await Promise.all([
        api.getOrders().catch(() => ({ success: false, orders: [] })),
        api.getInvoices().catch(() => ({ success: false, invoices: [] }))
      ]);

      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
      }
      if (invoicesRes.success && Array.isArray(invoicesRes.invoices)) {
        setInvoices(invoicesRes.invoices);
      }
    } catch (err) {
      setError(err.message || 'Failed to sync live data from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live statistics
  const totalInvoicesCount = invoices.length;
  const totalReceivablesAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const financeReadyCount = invoices.filter((i) => i.status === 'FINANCE_READY').length;
  const atRiskCount = invoices.filter((i) => i.status === 'AT_RISK').length;

  // Compute 45-day MSMED ageing stats
  const nearingThresholdCount = invoices.filter((inv) => {
    const state = getAgeingState(inv.invoiceDate || inv.invoice_date);
    return state.status === 'APPROACHING_THRESHOLD' || state.status === 'THRESHOLD_REACHED';
  }).length;

  const overdueThresholdCount = invoices.filter((inv) => {
    const state = getAgeingState(inv.invoiceDate || inv.invoice_date);
    return state.status === 'OVERDUE';
  }).length;

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unit Operations & Receivables"
        description="Track job-work orders, verify invoice TrustScores, monitor 45-day MSMED payment terms, and onboard receivables onto TReDS."
        badge="UNIT DASHBOARD"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <OrdersIcon className="w-4 h-4" />
                <span>Manage Orders</span>
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="primary" size="sm">
                <PlusIcon className="w-4 h-4" />
                <span>New Order</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Outstanding Receivables"
          value={loading ? '...' : formatINR(totalReceivablesAmount)}
          subtitle="Total active invoice value"
          icon={<InvoicesIcon className="w-5 h-5 text-[#74512D]" />}
        />
        <StatCard
          title="Total Invoices"
          value={loading ? '...' : String(totalInvoicesCount)}
          subtitle="Generated from orders"
          icon={<OrdersIcon className="w-5 h-5 text-[#74512D]" />}
        />
        <StatCard
          title="Finance Ready"
          value={loading ? '...' : String(financeReadyCount)}
          subtitle="TrustScore ≥ 90.00"
          icon={<ShieldCheckIcon className="w-5 h-5 text-emerald-700" />}
          badgeText="90% Advance Ready"
          badgeColor="bg-emerald-100 text-emerald-900"
        />
        <StatCard
          title="At Risk / Overdue"
          value={loading ? '...' : String(atRiskCount)}
          subtitle="Score < 70 or >45 days"
          icon={<AlertTriangleIcon className="w-5 h-5 text-rose-700" />}
          badgeText="45-Day Alert"
          badgeColor="bg-rose-100 text-rose-900"
        />
      </div>

      {/* MSMED Payment Monitoring Banner */}
      <Card className="bg-[#FAF6E9] border-[#AF8F6F]/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <h3 className="text-base font-semibold text-[#543310]">
                45-Day MSMED Payment Monitoring Summary
              </h3>
            </div>
            <p className="text-xs text-[#74512D]">
              Section 15 of MSMED Act, 2006 mandates payment within 45 days. Delayed payments trigger MSME Samadhaan ODR complaint draft generation.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <span className="text-[#AF8F6F] block text-[10px] uppercase font-sans font-semibold">Nearing 45 Days</span>
              <strong className="text-sm">{loading ? '...' : nearingThresholdCount}</strong> Invoices
            </div>
            <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
              <span className="text-rose-700 block text-[10px] uppercase font-sans font-semibold">Beyond 45 Days</span>
              <strong className="text-sm">{loading ? '...' : overdueThresholdCount}</strong> Invoices
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Invoices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#543310]">Recent Invoices</h2>
          <Link href="/invoices" className="text-xs font-semibold text-[#74512D] hover:underline">
            View all invoices &rarr;
          </Link>
        </div>

        {loading ? (
          <Card>
            <LoadingState message="Loading dashboard data..." />
          </Card>
        ) : error ? (
          <Card>
            <ErrorState message={error} onRetry={fetchData} />
          </Card>
        ) : recentInvoices.length === 0 ? (
          <Card>
            <EmptyState
              title="No invoice data yet"
              description="Your generated invoices will appear here once orders are marked delivered and converted to invoices."
              actionLabel="Go to Orders"
              onAction={() => (window.location.href = '/orders')}
              icon={<InvoicesIcon className="w-6 h-6 text-[#74512D]" />}
            />
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2D4C3] bg-[#FAF6E9] text-[#74512D] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Buyer Enterprise</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Invoice Date</th>
                    <th className="py-3 px-4">Ageing & 45-Day Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D4C3]">
                  {recentInvoices.map((inv) => {
                    const ageing = getAgeingState(inv.invoiceDate || inv.invoice_date);

                    return (
                      <tr key={inv.id} className="hover:bg-[#FAF6E9]/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#543310]">
                          {inv.id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#543310]">
                          {inv.buyerName || inv.buyer_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#543310]">
                          {formatINR(inv.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-[#74512D]">
                          {formatDate(inv.invoiceDate || inv.invoice_date)}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {ageing.status === 'OVERDUE' ? (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ⚠️ {ageing.days}d ({ageing.daysOverdue}d overdue)
                            </span>
                          ) : ageing.status === 'APPROACHING_THRESHOLD' || ageing.status === 'THRESHOLD_REACHED' ? (
                            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ⚠️ {ageing.days}d ({ageing.daysRemaining}d left)
                            </span>
                          ) : (
                            <span className="text-[#543310] font-medium">
                              {ageing.days} days
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/invoices/${inv.id}`}>
                            <Button variant="outline" size="sm">
                              View &rarr;
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
