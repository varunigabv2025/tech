'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import ScoreGauge from '@/components/ScoreGauge';
import GSTVerificationCard from '@/components/GSTVerificationCard';
import AAConsentCard from '@/components/AAConsentCard';
import FactorBreakdown from '@/components/FactorBreakdown';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { ShieldCheckIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { formatINR, formatDate, calculateDaysOutstanding } from '@/lib/format';

export default function InvoiceDetailPage({ params }) {
  const invoiceId = params?.id;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verification & Score states
  const [gstData, setGstData] = useState(null);
  const [aaData, setAaData] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  // Loading states
  const [verifying, setVerifying] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch invoice on mount
  const fetchInvoiceDetails = async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInvoice(invoiceId);
      if (res.success && res.invoice) {
        setInvoice(res.invoice);

        // If invoice is already verified, fetch score if available
        if (res.invoice.verified && res.invoice.trustScore !== null) {
          try {
            const scoreRes = await api.getInvoiceScore(invoiceId);
            if (scoreRes.success) {
              setScoreData(scoreRes);
            }
          } catch {
            // Score endpoint may return 400 if unverified
          }
        }
      } else {
        setError('Invoice not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  // Action: Step 1 — Verify Invoice
  const handleVerifyInvoice = async () => {
    setVerifying(true);
    setActionMessage(null);
    try {
      const res = await api.verifyInvoice(invoiceId);
      if (res.success && res.invoice) {
        setInvoice(res.invoice);
        if (res.verification) {
          setGstData(res.verification.gst);
          setAaData(res.verification.accountAggregator);
        }
        setActionMessage({
          type: 'success',
          text: 'Invoice verified successfully against GST & Account Aggregator!'
        });
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Verification failed. Ensure order is delivered.'
      });
    } finally {
      setVerifying(false);
    }
  };

  // Action: Step 2 — Calculate TrustScore
  const handleCalculateScore = async () => {
    setScoring(true);
    setActionMessage(null);
    try {
      const res = await api.getInvoiceScore(invoiceId);
      if (res.success) {
        setScoreData(res);
        // Refresh invoice row to get updated status
        const updatedInv = await api.getInvoice(invoiceId);
        if (updatedInv.success && updatedInv.invoice) {
          setInvoice(updatedInv.invoice);
        }
        setActionMessage({
          type: 'success',
          text: `TrustScore calculated: ${res.trustScore} / 100 (${res.status})`
        });
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to calculate TrustScore. Verify invoice first.'
      });
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return (
      <Card className="my-8">
        <LoadingState message={`Fetching invoice ${invoiceId}...`} />
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
          <ErrorState title="Invoice Not Found" message={error || 'Invoice record does not exist'} onRetry={fetchInvoiceDetails} />
        </Card>
      </div>
    );
  }

  const daysOutstanding = calculateDaysOutstanding(invoice.invoiceDate || invoice.invoice_date);
  const isVerified = Boolean(invoice.verified);
  const currentScore = scoreData ? scoreData.trustScore : invoice.trustScore;
  const currentStatus = scoreData ? scoreData.status : invoice.status;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Invoice ${invoice.id}`}
        description="Receivable verification evidence, GST filings, bank flows, and explainable TrustScore calculation."
        badge={currentStatus}
        actions={
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              &larr; Back to Invoices
            </Button>
          </Link>
        }
      />

      {/* Guided Workflow Stepper */}
      <Card className="bg-[#FAF6E9] border-[#AF8F6F]/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#543310]">
              Verification & Scoring Workflow
            </h2>
            <p className="text-xs text-[#74512D]">
              {!isVerified
                ? 'Step 1: Run mock GST and Account Aggregator bank flow checks to verify the invoice.'
                : currentScore === null
                ? 'Step 2: Calculate rule-based TrustScore from verified signals.'
                : 'Invoice verified and scored! Proceed to review status breakdown.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isVerified ? (
              <Button
                variant="primary"
                size="md"
                disabled={verifying}
                onClick={handleVerifyInvoice}
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Verifying GST + Bank Data...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Step 1: Verify Invoice</span>
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant={currentScore !== null ? 'outline' : 'primary'}
                size="md"
                disabled={scoring}
                onClick={handleCalculateScore}
              >
                {scoring ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#74512D]/40 border-t-[#74512D] rounded-full animate-spin" />
                    <span>Calculating Score...</span>
                  </span>
                ) : (
                  <span>
                    {currentScore !== null ? 'Recalculate TrustScore' : 'Step 2: Calculate TrustScore'}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {actionMessage.text}
          </div>
        )}
      </Card>

      {/* Main Grid: Overview & Verification (Left) + TrustScore Hero (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Overview Card */}
          <Card header={<h3 className="text-sm font-bold text-[#543310]">Invoice Specification</h3>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#AF8F6F] block">Invoice ID</span>
                <span className="font-mono font-bold text-[#543310] text-sm">{invoice.id}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Associated Order ID</span>
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
                <span className="text-[#AF8F6F] block">Due Date (45-Day Term)</span>
                <span className="font-medium text-[#543310]">{formatDate(invoice.dueDate || invoice.due_date)}</span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Days Outstanding</span>
                <span className="font-mono font-semibold text-[#543310]">
                  {daysOutstanding} {daysOutstanding === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div>
                <span className="text-[#AF8F6F] block">Verification Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={currentStatus} />
                  <span className={`text-xs font-semibold ${isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isVerified ? '✓ Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* GST Verification Evidence Card */}
          {gstData && <GSTVerificationCard gstData={gstData} />}

          {/* Account Aggregator Verification Card */}
          {aaData && <AAConsentCard aaData={aaData} />}
        </div>

        {/* Right Column: Score Gauge Hero */}
        <div className="lg:col-span-1 space-y-6">
          <ScoreGauge
            score={currentScore}
            status={currentStatus}
            breakdown={scoreData ? scoreData.breakdown : null}
          />

          {/* How TrustScore Works Card */}
          <Card header={<h4 className="text-xs font-bold text-[#543310] uppercase tracking-wider">How TrustScore Works</h4>}>
            <div className="space-y-2 text-xs text-[#74512D] leading-relaxed">
              <p className="font-medium text-[#543310]">
                TrustFlow does not rely on black-box algorithms. It explains why an MSME receives a specific score using 5 rule-based signals:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>GST Filing Consistency</strong> (Max 20 pts)</li>
                <li><strong>Buyer Verification</strong> (Max 20 pts)</li>
                <li><strong>Delivery Confirmation</strong> (Max 15 pts)</li>
                <li><strong>Invoice Ageing</strong> (Max 20 pts)</li>
                <li><strong>Cash-Flow Stability</strong> (Max 25 pts)</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Factor Breakdown Section */}
      {scoreData && scoreData.breakdown && (
        <FactorBreakdown breakdown={scoreData.breakdown} />
      )}
    </div>
  );
}
