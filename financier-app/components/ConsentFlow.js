'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import StatusBadge from './StatusBadge';
import { IconBank, IconCheck, IconKey } from './Icons';

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
      .catch((err) => setError(err.message || 'Could not load units'));
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
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">Account Aggregator · Sahamati pattern</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Bank-data consent</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          The unit never shares a net-banking password. TrustFlow requests a purpose-bound, time-bound pull. Approval happens on the bank app — the key trust moment before GST + AA data can score an invoice.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <section className="rounded-2xl border border-line bg-ink-800/70 p-6">
          <div className="flex items-center gap-2 text-teal">
            <IconKey className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-widest">Consent artifact</h2>
          </div>

          <label className="mt-5 block text-xs uppercase tracking-widest text-slate-400" htmlFor="unit">
            Job-work unit
          </label>
          <select
            id="unit"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-teal/50"
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.id} · {unit.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!unitId || Boolean(busy)}
            onClick={requestConsent}
            className="mt-4 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-teal/90 disabled:opacity-50"
          >
            {busy === 'create' ? 'Creating request…' : 'Request AA consent'}
          </button>

          {consent ? (
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm text-white">{consent.id}</p>
                <StatusBadge status={consent.status} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">FIU</p>
                <p className="text-white">{consent.fiu.name} · {consent.fiu.product}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Purpose</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{consent.purpose}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">What is shared</p>
                <ul className="mt-2 space-y-2">
                  {consent.dataTypes.map((item) => (
                    <li key={item.code} className="rounded-xl border border-line bg-ink-900 px-4 py-3">
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Accounts</p>
                <ul className="mt-2 space-y-2">
                  {consent.fips.map((fip) => (
                    <li key={fip.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm">
                      <span className="text-slate-200">{fip.name}</span>
                      <span className="font-mono text-xs text-slate-500">{fip.accountMasked}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">Expires</p>
                  <p className="text-white">{formatDate(consent.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">Approval channel</p>
                  <p className="text-white">Bank app · not TrustFlow</p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-slate-500">
                {consent.notes.map((note) => (
                  <li key={note}>· {note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-400">
              Select {selected?.name || 'a unit'} and request consent. The unit then approves on their bank app.
            </p>
          )}
        </section>

        <aside className="flex flex-col items-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-slate-500">Approve on bank app</p>
          <div className="w-full max-w-[320px] rounded-[2.2rem] border border-line bg-ink-950 p-3 shadow-glow">
            <div className="rounded-[1.8rem] border border-line bg-ink-900 px-4 pb-6 pt-3">
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-600" />
              <div className="flex items-center gap-2 text-teal">
                <IconBank className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-widest">Linked bank</p>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">Consent request</h2>
              <p className="mt-1 text-xs text-slate-400">
                {consent ? `${consent.fiu.name} wants 6-month account data for ${consent.unitName}.` : 'Waiting for a TrustFlow request.'}
              </p>
              {consent ? (
                <>
                  <div className="mt-5 space-y-2 rounded-xl bg-ink-800 p-3 text-xs text-slate-300">
                    <p>Purpose-bound · expires {formatDate(consent.expiryDate)}</p>
                    <p>No credentials shared with TrustFlow</p>
                    <p>Revocable from this app anytime</p>
                  </div>
                  {consent.status === 'PENDING' || phoneOpen ? (
                    <div className="mt-6 grid gap-2">
                      <button
                        type="button"
                        disabled={busy || consent.status !== 'PENDING'}
                        onClick={approve}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-teal py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-50"
                      >
                        <IconCheck />
                        {busy === 'approve' ? 'Authorising…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={busy || consent.status !== 'PENDING'}
                        onClick={reject}
                        className="rounded-full border border-line py-2.5 text-sm text-slate-300 disabled:opacity-50"
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    <p className={`mt-6 rounded-xl px-3 py-3 text-sm ${consent.status === 'APPROVED' ? 'bg-teal/15 text-teal' : 'bg-rose-500/10 text-rose-200'}`}>
                      {consent.status === 'APPROVED'
                        ? 'Approved. Cash-flow data can now feed TrustScore.'
                        : 'Denied. TrustFlow cannot pull bank data.'}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-8 text-center text-xs text-slate-500">No pending request on this device.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
