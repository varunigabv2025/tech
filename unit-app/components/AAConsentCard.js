import React from 'react';
import Card from './Card';
import { formatINR } from '@/lib/format';

export default function AAConsentCard({ aaData }) {
  if (!aaData) return null;

  const {
    monthsAnalyzed = 6,
    averageMonthlyInflow = 0,
    monthlyInflows = [],
    cashFlowStability = 0
  } = aaData;

  const maxInflow = Math.max(...monthlyInflows, 1);

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#74512D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-sm font-bold text-[#543310]">Account Aggregator Bank Flows</h3>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#EFE7CB] text-[#543310] border border-[#AF8F6F]/40">
            MOCK AA DATA
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-[#FAF6E9] rounded-lg border border-[#E2D4C3]">
            <span className="text-[#AF8F6F] block font-medium">Avg. Monthly Banking Inflow</span>
            <span className="font-mono font-bold text-[#543310] text-base mt-0.5 block">
              {formatINR(averageMonthlyInflow)}
            </span>
            <span className="text-[11px] text-[#74512D]">Over {monthsAnalyzed} months analyzed</span>
          </div>

          <div className="p-3 bg-[#FAF6E9] rounded-lg border border-[#E2D4C3]">
            <span className="text-[#AF8F6F] block font-medium">Cash-Flow Stability Index</span>
            <span className="font-mono font-bold text-[#543310] text-base mt-0.5 block">
              {cashFlowStability}%
            </span>
            <span className="text-[11px] text-[#74512D]">Inverse coefficient of variation</span>
          </div>
        </div>

        {/* Monthly Inflow Bar Chart */}
        {monthlyInflows.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#74512D] uppercase tracking-wider block mb-2">
              Monthly Inflow Trend (Last {monthlyInflows.length} Months)
            </span>
            <div className="flex items-end gap-2 h-24 pt-4 px-2 bg-[#FAF6E9]/60 rounded-lg border border-[#E2D4C3]/60">
              {monthlyInflows.map((val, idx) => {
                const heightPercent = Math.max(12, Math.round((val / maxInflow) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div
                      className="w-full bg-[#74512D] hover:bg-[#543310] rounded-t transition-all relative"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-[#543310] text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 pointer-events-none font-mono">
                        {formatINR(val)}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#AF8F6F] font-mono">M{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
