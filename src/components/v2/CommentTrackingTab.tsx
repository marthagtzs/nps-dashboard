'use client';

import { useMemo, useState, useEffect } from 'react';
import { NpsFilters, NpsResponse } from '@/lib/types';
import { getUniqueValues } from '@/lib/nps-calculations';
import AssigneeCombobox from './AssigneeCombobox';
import { format, parseISO } from 'date-fns';

interface CommentTrackingTabProps {
  responses: NpsResponse[];
  filtered: NpsResponse[];
  filters: NpsFilters;
  setFilters: React.Dispatch<React.SetStateAction<NpsFilters>>;
  onMutate: () => void;
}

const DEFAULT_NAMES = ['Martha', 'Mariana', 'Nath', 'Marijo', 'Paola'];

export default function CommentTrackingTab({ responses, filtered, onMutate }: CommentTrackingTabProps) {
  // Optimistic overlay: edits the user just made, keyed by dedupKey
  const [overrides, setOverrides] = useState<Record<string, { assigned?: string; followedUp?: boolean }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errorRow, setErrorRow] = useState<string | null>(null);

  const { planTypes, locales, categories, osValues, appVersions } = useMemo(
    () => getUniqueValues(responses),
    [responses]
  );

  // Only rows with a comment are meaningful for tracking; but tracking applies to every response
  // We keep all rows here (user asked for all comments with ids/language/os/attrs)
  const rows = filtered;

  // Merge server value with any pending override
  const displayValue = (r: NpsResponse) => {
    const o = overrides[r.dedupKey];
    return {
      assigned: o?.assigned !== undefined ? o.assigned : r.assigned,
      followedUp: o?.followedUp !== undefined ? o.followedUp : r.followedUp,
    };
  };

  // Once the server reflects the edit, clear the override so polling doesn't flicker stale values
  useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const key of Object.keys(next)) {
        const server = responses.find((r) => r.dedupKey === key);
        if (!server) continue;
        const o = next[key];
        const matchesAssigned = o.assigned === undefined || o.assigned === server.assigned;
        const matchesFU = o.followedUp === undefined || o.followedUp === server.followedUp;
        if (matchesAssigned && matchesFU) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [responses]);

  // Available names: defaults + any already assigned in the sheet
  const availableNames = useMemo(() => {
    const fromData = responses.map((r) => r.assigned).filter(Boolean);
    return Array.from(new Set([...DEFAULT_NAMES, ...fromData]));
  }, [responses]);

  async function updateRow(
    dedupKey: string,
    patch: { assigned?: string; followedUp?: boolean }
  ) {
    setSaving((s) => ({ ...s, [dedupKey]: true }));
    setErrorRow(null);
    setOverrides((prev) => ({ ...prev, [dedupKey]: { ...prev[dedupKey], ...patch } }));
    try {
      const res = await fetch('/api/nps-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dedupKey, ...patch }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status === 'error') throw new Error(json.message || 'Update failed');
      onMutate(); // pull fresh data
    } catch (err) {
      setErrorRow(dedupKey);
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[dedupKey];
        return next;
      });
      console.error('Update failed:', err);
    } finally {
      setSaving((s) => {
        const n = { ...s };
        delete n[dedupKey];
        return n;
      });
    }
  }

  const fmtDate = (d: string) => {
    try {
      return format(parseISO(d), 'MMM d, yyyy HH:mm');
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Comment tracking</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {rows.length.toLocaleString()} response{rows.length === 1 ? '' : 's'} (filters from Overview apply).
              Tag an assignee and check off responses you&rsquo;ve followed up on &mdash; saved to the sheet, visible to everyone.
            </p>
          </div>
        </div>
        <QuickCounts rows={rows} overrides={overrides} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <Th>Date</Th>
                <Th>Score</Th>
                <Th>Category</Th>
                <Th>Identity</Th>
                <Th>Locale</Th>
                <Th>OS</Th>
                <Th>App ver.</Th>
                <Th>Plan</Th>
                <Th>Comment</Th>
                <Th>Name</Th>
                <Th>Follow up</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-sm text-gray-400">
                    No responses match the current filters.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const v = displayValue(r);
                const isSaving = !!saving[r.dedupKey];
                const hasError = errorRow === r.dedupKey;
                return (
                  <tr key={r.dedupKey} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <Td className="whitespace-nowrap text-gray-600 text-xs">{fmtDate(r.date)}</Td>
                    <Td>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        r.score >= 9
                          ? 'bg-emerald-100 text-emerald-700'
                          : r.score >= 7
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {r.score}
                      </span>
                    </Td>
                    <Td className="text-xs text-gray-600">{r.category}</Td>
                    <Td className="text-xs text-gray-600 font-mono">{r.identity || '—'}</Td>
                    <Td className="text-xs text-gray-600 uppercase">{r.userLocale || '—'}</Td>
                    <Td className="text-xs text-gray-600">{r.os || '—'}</Td>
                    <Td className="text-xs text-gray-600">{r.appVersion || '—'}</Td>
                    <Td className="text-xs text-gray-600 capitalize">{r.highestPlanType || '—'}</Td>
                    <Td className="text-xs text-gray-700 max-w-xs">
                      {r.comment ? (
                        <span className="block truncate" title={r.comment}>{r.comment}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </Td>
                    <Td>
                      <AssigneeCombobox
                        value={v.assigned}
                        options={availableNames}
                        disabled={isSaving}
                        onChange={(name) => updateRow(r.dedupKey, { assigned: name })}
                      />
                    </Td>
                    <Td>
                      <label className={`inline-flex items-center gap-2 cursor-pointer ${isSaving ? 'opacity-50' : ''}`}>
                        <input
                          type="checkbox"
                          checked={!!v.followedUp}
                          disabled={isSaving}
                          onChange={(e) => updateRow(r.dedupKey, { followedUp: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#2a8fc7] focus:ring-[#2a8fc7]"
                        />
                        {hasError && <span className="text-[10px] text-red-500">retry?</span>}
                      </label>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Silence unused-args warning in production build */}
      <div className="hidden">{[planTypes, locales, categories, osValues, appVersions].length}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-3 py-2.5">{children}</th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2.5 ${className}`}>{children}</td>;
}

function QuickCounts({
  rows,
  overrides,
}: {
  rows: NpsResponse[];
  overrides: Record<string, { assigned?: string; followedUp?: boolean }>;
}) {
  const { assignedCount, followedUpCount } = useMemo(() => {
    let a = 0;
    let f = 0;
    rows.forEach((r) => {
      const o = overrides[r.dedupKey];
      const assigned = o?.assigned !== undefined ? o.assigned : r.assigned;
      const followedUp = o?.followedUp !== undefined ? o.followedUp : r.followedUp;
      if (assigned) a++;
      if (followedUp) f++;
    });
    return { assignedCount: a, followedUpCount: f };
  }, [rows, overrides]);

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <div>
        <span className="font-semibold text-gray-700">{assignedCount}</span> assigned
      </div>
      <div>
        <span className="font-semibold text-gray-700">{followedUpCount}</span> followed up
      </div>
      <div>
        <span className="font-semibold text-gray-700">{rows.length - followedUpCount}</span> pending
      </div>
    </div>
  );
}
