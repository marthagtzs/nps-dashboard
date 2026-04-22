'use client';

import { useEffect, useRef } from 'react';
import { NpsFilters } from '@/lib/types';

interface FiltersPopoverProps {
  filters: NpsFilters;
  setFilters: React.Dispatch<React.SetStateAction<NpsFilters>>;
  planTypes: string[];
  locales: string[];
  categories: string[];
  osValues: string[];
  appVersions: string[];
  onClose: () => void;
}

export default function FiltersPopover({
  filters,
  setFilters,
  planTypes,
  locales,
  categories,
  osValues,
  appVersions,
  onClose,
}: FiltersPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [onClose]);

  const update = (key: keyof NpsFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearAll = () => {
    setFilters({
      ...filters,
      planType: '',
      locale: '',
      category: '',
      os: '',
      appVersion: '',
    });
  };

  const hasFilters = [filters.planType, filters.locale, filters.category, filters.os, filters.appVersion].some(Boolean);

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg p-4 z-20"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Filters</h4>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-[#2a8fc7] hover:text-blue-700 font-medium">
            Clear all
          </button>
        )}
      </div>
      <div className="space-y-3">
        <Field label="Plan type">
          <Select value={filters.planType} onChange={(v) => update('planType', v)} placeholder="All Plans">
            {planTypes.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Locale">
          <Select value={filters.locale} onChange={(v) => update('locale', v)} placeholder="All Locales">
            {locales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Category">
          <Select value={filters.category} onChange={(v) => update('category', v)} placeholder="All Categories">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="OS">
          <Select value={filters.os} onChange={(v) => update('os', v)} placeholder="All OS">
            {osValues.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="App version">
          <Select value={filters.appVersion} onChange={(v) => update('appVersion', v)} placeholder="All Versions">
            {appVersions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent bg-white"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
