'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Button from '@/components/Button';
import { InvoicesIcon, OrdersIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { formatINR, formatDate, calculateDaysOutstanding } from '@/lib/format';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInvoices();
      if (res.success && Array.isArray(res.invoices)) {
        setInvoices(res.invoices);
      } else {
        setError('Failed to parse invoice data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch invoices from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receivable Invoices"
        description="Verify GST & bank flows, calculate TrustScores, and onboard receivables onto TReDS."
        badge="INVOICES"
        actions={
          <Link href="/orders">
            <Button variant="primary" size="sm">
              <OrdersIcon className="w-4 h-4" />
              <span>Go to Orders</span>
            </Button>
          </Link>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#543310]">All Invoices</h2>
        <span className="text-xs text-[#AF8F6F] font-mono">
          {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'} Found
        </span>
      </div>

      {loading ? (
        <Card>
          <LoadingState message="Loading live invoices from backend..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={fetchInvoices} />
        </Card>
      ) : invoices.length === 0 ? (
        <Card>
          <EmptyState
            title="No invoices generated yet"
            description="Invoices will appear here after a delivered order is converted into an invoice."
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
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Days Outstanding</th>
                  <th className="py-3 px-4">TrustScore</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D4C3]">
                {invoices.map((inv) => {
                  const daysOutstanding = calculateDaysOutstanding(inv.invoiceDate || inv.invoice_date);

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
                      <td className="py-3.5 px-4 text-[#74512D]">
                        {formatDate(inv.dueDate || inv.due_date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#543310]">
                        {daysOutstanding} {daysOutstanding === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#74512D]">
                        {inv.trustScore !== null && inv.trustScore !== undefined
                          ? Number(inv.trustScore).toFixed(2)
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm">
                            View Detail &rarr;
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
  );
}
