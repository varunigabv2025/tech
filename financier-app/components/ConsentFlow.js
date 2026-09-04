'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import StatusBadge from './StatusBadge';
import { IconBank, IconCheck, IconKey, IconShield } from './Icons';

export default function ConsentFlow() {
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState('');
  const [consent, setConsent] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [phoneOpen, setPhoneOpen] = useState(false);

  useEffect(() => {
    api
      .aaUnits()
      .then((payload) => {
        setUnits(payload.units || []);
        if (payload.units?.[0]) setUnitId(payload.units[0].id);
      })
      .catch((err) => setError(err.message || 'Could not load MSME units'));
  }, []);

  async function requestConsent() {
    setBusy('create');
    setError('');
    try {
      const result = await api.createConsent(unitId);
      setConsent(result.consent);
      setPhoneOpen(result.consent?.status === 'PENDING');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  async function approve() {
    if (!consent) return;
    setBusy('approve');
    setError('');
    try {
      const result = await api.approveConsent(consent.id);
      setConsent(result.consent);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  async function reject() {
    if (!consent) return;
    setBusy('reject');
    setError('');
    try {
      const result = await api.rejectConsent(consent.id);
      setConsent(result.consent);
      setPhoneOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  const selected = units.find((u) => u.id === unitId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-[#AF8F6F]/30">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFE7CB] text-[#543310] border border-[#AF8F6F]/40 mb-2">
          <IconShield className="w-3.5 h-3.5 text-[#74512D]" />
          <span>Account Aggregator Framework</span>
        </div>
        <h1 className="text-3xl font-bold text-[#543310] tracking-tight">Financial Data Consent Management</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#74512D]">
          TrustFlow uses consent-based access to retrieve financial information via Account Aggregator. Banking passwords are never shared or stored by TrustFlow.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        {/* Left Column: Consent Request Setup & Details */}
        <section className="rounded-2xl bg-white border border-[#AF8F6F]/40 p-6 shadow-warm space-y-6">
          <div className="flex items-center gap-2 text-[#543310] pb-2 border-b border-[#E2D4C3]">
            <IconKey className="w-5 h-5 text-[#74512D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Consent Request Setup</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#74512D] mb-1.5" htmlFor="unit">
              Select MSME Job-Work Unit
            </label>
            <select
              id="unit"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full rounded-xl border border-[#AF8F6F]/50 bg-[#FAF6E9] px-3.5 py-2.5 text-sm text-[#543310] font-semibold outline-none focus:ring-2 focus:ring-[#74512D]"
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.id} &bull; {unit.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={!unitId || Boolean(busy)}
            onClick={requestConsent}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#74512D] hover:bg-[#543310] shadow-sm transition-all disabled:opacity-50"
          >
            {busy === 'create' ? 'Creating Request...' : 'Initiate AA Consent Request'}
          </button>

          {consent ? (
            <div className="space-y-6 pt-4 border-t border-[#E2D4C3]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-[#AF8F6F] uppercase">Consent Artifact ID</p>
                  <p className="font-mono text-base font-bold text-[#543310]">{consent.id}</p>
                </div>
                <StatusBadge status={consent.status} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30">
                  <p className="font-semibold text-[#AF8F6F] uppercase text-[10px]">Financial Information User (FIU)</p>
                  <p className="font-bold text-[#543310] mt-0.5">{consent.fiu.name} &bull; {consent.fiu.product}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30">
                  <p className="font-semibold text-[#AF8F6F] uppercase text-[10px]">Consent Validity Expiry</p>
                  <p className="font-bold text-[#543310] mt-0.5">{formatDate(consent.expiryDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-[#74512D] uppercase tracking-wider mb-1">Purpose</p>
                <p className="text-xs text-[#543310] bg-[#FAF6E9] p-3 rounded-xl border border-[#AF8F6F]/30 leading-relaxed font-medium">
                  {consent.purpose}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-[#74512D] uppercase tracking-wider mb-2">Requested Data Types</p>
                <ul className="space-y-2">
                  {consent.dataTypes.map((item) => (
                    <li key={item.code} className="p-3 rounded-xl bg-white border border-[#AF8F6F]/30 shadow-sm">
                      <p className="text-xs font-bold text-[#543310]">{item.label}</p>
                      <p className="text-[11px] text-[#74512D]">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-[#74512D] uppercase tracking-wider mb-2">Linked Accounts</p>
                <ul className="space-y-2">
                  {consent.fips.map((fip) => (
                    <li key={fip.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30 text-xs">
                      <span className="font-semibold text-[#543310]">{fip.name}</span>
                      <span className="font-mono text-[#74512D] font-bold">{fip.accountMasked}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#74512D] italic pt-2">
              Select an MSME unit above and click &quot;Initiate AA Consent Request&quot;. The unit will receive an authorization request on their mobile banking application.
            </p>
          )}
        </section>

        {/* Right Column: Bank App Mock Simulation */}
        <aside className="flex flex-col items-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#74512D]">
            Mobile Bank App Simulation
          </p>
          <div className="w-full max-w-[320px] rounded-[2rem] border-4 border-[#543310] bg-[#FAF6E9] p-3 shadow-warmLg">
            <div className="rounded-[1.5rem] bg-white border border-[#AF8F6F]/40 p-4 space-y-4">
              <div className="mx-auto h-1.5 w-14 rounded-full bg-[#AF8F6F]" />

              <div className="flex items-center gap-2 text-[#543310] pb-2 border-b border-[#E2D4C3]">
                <IconBank className="w-4 h-4 text-[#74512D]" />
                <p className="text-xs font-bold uppercase tracking-wider">HDFC Bank AA Portal</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#543310]">Consent Authorization</h3>
                <p className="mt-1 text-xs text-[#74512D] leading-snug">
                  {consent
                    ? `${consent.fiu.name} is requesting access to 6-month account statement for ${consent.unitName}.`
                    : 'Awaiting consent request from TrustFlow.'}
                </p>
              </div>

              {consent ? (
                <>
                  <div className="p-3 rounded-xl bg-[#FAF6E9] border border-[#AF8F6F]/30 space-y-1 text-[11px] text-[#543310]">
                    <p>🔒 Purpose-bound &bull; Expires {formatDate(consent.expiryDate)}</p>
                    <p>🔑 Zero net-banking passwords stored</p>
                    <p>🛡️ Revocable from your bank app at any time</p>
                  </div>

                  {consent.status === 'PENDING' || phoneOpen ? (
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        disabled={busy || consent.status !== 'PENDING'}
                        onClick={approve}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#74512D] hover:bg-[#543310] shadow-sm transition-all disabled:opacity-50"
                      >
                        <IconCheck className="w-4 h-4" />
                        <span>{busy === 'approve' ? 'Authorizing...' : 'Approve Consent'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={busy || consent.status !== 'PENDING'}
                        onClick={reject}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        Deny Consent
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold text-center ${
                        consent.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {consent.status === 'APPROVED'
                        ? '✓ Consent Approved. Cash-flow metrics unlocked for TrustScore calculation.'
                        : '✕ Consent Denied by Unit.'}
                    </div>
                  )}
                </>
              ) : (
                <p className="py-6 text-center text-xs text-[#AF8F6F]">
                  No active consent request.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
