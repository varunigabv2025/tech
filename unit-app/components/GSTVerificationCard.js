import React from 'react';
import Card from './Card';
import { ShieldCheckIcon } from './Icons';
import { formatINR } from '@/lib/format';

export default function GSTVerificationCard({ gstData }) {
  if (!gstData) return null;

  const {
    gstNumber,
    gstActive,
    filingConsistency,
    filingsOnTime,
    totalFilings,
    lateFilings
  } = gstData;

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-[#543310]">GST Filing Verification</h3>
          </div>
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              gstActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {gstActive ? '✓ GST Active' : '✗ GST Inactive'}
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3 bg-[#FAF6E9] rounded-lg border border-[#E2D4C3]">
          <span className="text-[#AF8F6F] block font-medium">GST Identification</span>
          <span className="font-mono font-bold text-[#543310] text-sm">{gstNumber}</span>
        </div>

        <div className="p-3 bg-[#FAF6E9] rounded-lg border border-[#E2D4C3]">
          <span className="text-[#AF8F6F] block font-medium">Filing Consistency</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono font-bold text-lg text-[#543310]">
              {filingConsistency}%
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#FAF6E9] rounded-lg border border-[#E2D4C3]">
          <span className="text-[#AF8F6F] block font-medium">Filing Track Record</span>
          <span className="font-mono font-semibold text-[#543310]">
            {filingsOnTime} / {totalFilings} on time ({lateFilings} late)
          </span>
        </div>
      </div>
    </Card>
  );
}
