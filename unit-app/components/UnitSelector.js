'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function UnitSelector({ selectedUnitId, onSelectUnit, className = '' }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getUnits()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.units)) {
          setUnits(res.units);
          if (!selectedUnitId && res.units.length > 0 && onSelectUnit) {
            onSelectUnit(res.units[0]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load units');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const unitId = e.target.value;
    const found = units.find((u) => u.id === unitId);
    if (found && onSelectUnit) {
      onSelectUnit(found);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2D4C3] rounded-lg text-xs text-[#74512D] ${className}`}>
        <span className="w-3 h-3 border-2 border-[#AF8F6F]/40 border-t-[#74512D] rounded-full animate-spin" />
        <span>Loading units...</span>
      </div>
    );
  }

  if (error || units.length === 0) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 ${className}`}>
        <span>Unit: Default (U001)</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold text-[#543310] uppercase tracking-wider hidden sm:inline">
        Active Unit:
      </span>
      <select
        value={selectedUnitId || (units[0] ? units[0].id : '')}
        onChange={handleChange}
        className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#AF8F6F] rounded-lg text-[#543310] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#74512D] cursor-pointer"
      >
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.id} — {unit.name} ({unit.gstNumber})
          </option>
        ))}
      </select>
    </div>
  );
}
