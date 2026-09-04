'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import ScoreGauge from '@/components/ScoreGauge';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { api } from '@/lib/api';
import { formatINR, formatDate, calculateDaysOutstanding } from '@/lib/format';

export default function InvoiceDetailPage({ params }) {
  const invoiceId = params?.id;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInvoice(invoiceId);
      if (res.success && res.invoice) {
        setInvoice(res.invoice);
      } else {
        setError('Invoice not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <Card className="my-8">
        <LoadingState message={`Fetching details for invoice ${invoiceId}...`} />
      </Card>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Invoice ${invoiceId}`}
          actions={
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                &larr; Back to Invoices
              </Button>
            </Link>
          }
        />
        <Card>
          <ErrorState title="Invoice Not Found" message={error || 'Invoice record does not exist'} onRetry={fetchInvoice} />
        </Card>
      </div>
    );
  }

  const daysOutstanding = calculateDaysOutstanding(invoice.invoiceDate || invoice.invoice_date);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.id}`}
        description="Receivable verification status, order linkage, and TrustScore readiness."
        badge={invoice.status}
        actions={
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              &larr; Back to Invoices
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card header={<h2 className="text-sm font-bold text-[#543310]">Invoice Specification</h2>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#AF8F6F] block">Invoice ID</span>
                <span className="font-mono font-bold text-[#543310] text-sm">{invoice.id}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Associated Order</span>
                <span className="font-mono font-semibold text-[#543310] text-sm">{invoice.orderId || invoice.order_id || '—'}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Buyer Enterprise</span>
                <span className="font-semibold text-[#543310] text-sm">{invoice.buyerName || invoice.buyer_name}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Invoice Amount</span>
                <span className="font-mono font-bold text-[#543310] text-base">{formatINR(invoice.amount)}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Invoice Date</span>
                <span className="font-medium text-[#543310]">{formatDate(invoice.invoiceDate || invoice.invoice_date)}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Payment Due Date (45-Day Term)</span>
                <span className="font-medium text-[#543310]">{formatDate(invoice.dueDate || invoice.due_date)}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Days Outstanding</span>
                <span className="font-mono font-semibold text-[#543310]">
                  {daysOutstanding} {daysOutstanding === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Verification Lifecycle Status</span>
                <div className="mt-1">
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Score Gauge Preview */}
        <div className="lg:col-span-1 space-y-6">
          <ScoreGauge
            score={invoice.trustScore}
            status={invoice.status}
            breakdown={null}
          />
        </div>
      </div>
    </div>
  );
}
