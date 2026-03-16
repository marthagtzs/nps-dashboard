'use client';

import { NpsResponse } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';

interface CommentsPanelProps {
  responses: NpsResponse[];
}

const categoryDot = {
  Promoter: 'bg-[#27ae60]',
  Passive: 'bg-[#e09400]',
  Detractor: 'bg-[#ee5a5a]',
};

export default function CommentsPanel({ responses }: CommentsPanelProps) {
  const commented = responses
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);

  const formatDate = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) return format(parsed, 'MMM d, HH:mm');
    } catch {
      // ignore
    }
    return dateStr;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">
          Recent Comments ({commented.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {commented.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No comments yet</div>
        ) : (
          commented.map((r, i) => (
            <div key={`${r.dedupKey}-${i}`} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    categoryDot[r.category] || 'bg-gray-400'
                  }`}
                />
                <span className="text-xs font-medium text-gray-500">
                  Score: {r.score}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                {r.highestPlanType && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400 capitalize">
                      {r.highestPlanType}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
              {r.identity && (
                <p className="text-xs text-gray-400 mt-1 truncate">— {r.identity}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
