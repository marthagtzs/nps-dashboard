'use client';

import { useState, useMemo } from 'react';
import { NpsResponse } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';

interface ResponseTableProps {
  responses: NpsResponse[];
}

type SortKey = 'date' | 'score' | 'category' | 'highestPlanType' | 'userLocale';
type SortDir = 'asc' | 'desc';

const categoryBadge = {
  Promoter: 'bg-emerald-100 text-emerald-700',
  Passive: 'bg-amber-100 text-amber-700',
  Detractor: 'bg-red-100 text-red-700',
};

export default function ResponseTable({ responses }: ResponseTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const sorted = useMemo(() => {
    const arr = [...responses];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
        case 'score':
          cmp = a.score - b.score;
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
        case 'highestPlanType':
          cmp = a.highestPlanType.localeCompare(b.highestPlanType);
          break;
        case 'userLocale':
          cmp = a.userLocale.localeCompare(b.userLocale);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [responses, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) return format(parsed, 'MMM d, yyyy HH:mm');
    } catch {
      // ignore
    }
    return dateStr;
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-[#2a8fc7] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">
          Responses ({responses.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th
                className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#2a8fc7]"
                onClick={() => toggleSort('date')}
              >
                Date <SortIcon col="date" />
              </th>
              <th
                className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#2a8fc7]"
                onClick={() => toggleSort('score')}
              >
                Score <SortIcon col="score" />
              </th>
              <th
                className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#2a8fc7]"
                onClick={() => toggleSort('category')}
              >
                Category <SortIcon col="category" />
              </th>
              <th
                className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#2a8fc7]"
                onClick={() => toggleSort('highestPlanType')}
              >
                Plan <SortIcon col="highestPlanType" />
              </th>
              <th
                className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#2a8fc7]"
                onClick={() => toggleSort('userLocale')}
              >
                Locale <SortIcon col="userLocale" />
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">Identity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((r, i) => (
              <tr key={`${r.dedupKey}-${i}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {formatDate(r.date)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-800">{r.score}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      categoryBadge[r.category] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">{r.highestPlanType || '—'}</td>
                <td className="px-4 py-3 text-gray-600 uppercase">{r.userLocale || '—'}</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">
                  {r.identity || '—'}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No responses match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
