'use client';

import React, { useState } from 'react';
import Button from './Button';
import { formatINR, formatDate, calculateDaysOutstanding } from '@/lib/format';

export default function ODRModal({ isOpen, onClose, invoice, unit }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !invoice) return null;

  const unitName = unit?.name || invoice.unitName || 'Kumar Knitwear Works';
  const gstNumber = unit?.gstNumber || unit?.gst_number || invoice.gstNumber || '33ABCDE1234F1Z5';
  const buyerName = invoice.buyerName || invoice.buyer_name || 'Buyer Enterprise';
  const invoiceId = invoice.id;
  const invoiceDate = formatDate(invoice.invoiceDate || invoice.invoice_date);
  const dueDate = formatDate(invoice.dueDate || invoice.due_date);
  const amount = formatINR(invoice.amount);
  const daysOutstanding = calculateDaysOutstanding(invoice.invoiceDate || invoice.invoice_date);

  const draftText = `==================================================
ONLINE DISPUTE RESOLUTION (ODR) COMPLAINT DRAFT
[DEMO DRAFT — NOT SUBMITTED TO SAMADHAAN PORTAL]
==================================================

COMPLAINANT (MSME UNIT)
Unit Name: ${unitName}
GSTIN: ${gstNumber}

RESPONDENT (BUYER ENTERPRISE)
Buyer Name: ${buyerName}

INVOICE SPECIFICATION
Invoice Reference: ${invoiceId}
Invoice Date: ${invoiceDate}
Payment Due Date: ${dueDate}
Outstanding Receivable: ${amount}
Current Ageing: ${daysOutstanding} Days Outstanding

--------------------------------------------------
STATEMENT OF ISSUE
Payment against the delivered job-work supply under invoice ${invoiceId} remains unpaid beyond the 45-day statutory timeline mandated under Section 15 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006.

--------------------------------------------------
RELIEF / REQUESTED ACTION
Initiate Online Dispute Resolution (ODR) proceedings for full recovery of the principal amount (${amount}) along with statutory interest applicable under Section 16 of the MSMED Act.
==================================================`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = draftText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-[#AF8F6F] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2D4C3] bg-[#FAF6E9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
              ⚖️
            </span>
            <div>
              <h2 className="text-base font-bold text-[#543310]">ODR Complaint Draft Generator</h2>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                DEMO DRAFT — NOT SUBMITTED
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#74512D] hover:text-[#543310] font-bold text-xl leading-none px-2 py-1 rounded hover:bg-[#EFE7CB]"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Disclaimer Banner */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs">
            <strong>Hackathon Notice:</strong> This complaint draft is automatically generated from verified invoice records for demonstration purposes. TrustFlow does not submit legal complaints directly to government portals.
          </div>

          {/* Structured Draft Display */}
          <div className="bg-[#FAF6E9] border border-[#E2D4C3] rounded-xl p-4 font-mono text-[11px] text-[#543310] space-y-3 whitespace-pre-wrap leading-relaxed shadow-inner">
            {draftText}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E2D4C3] bg-[#FAF6E9]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleCopy}>
              {copied ? '✓ Draft Copied to Clipboard!' : 'Copy Draft'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Print Draft
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
