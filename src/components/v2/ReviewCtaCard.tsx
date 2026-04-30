'use client';

import { NpsResponse } from '@/lib/types';

interface ReviewCtaCardProps {
  responses: NpsResponse[];
}

export default function ReviewCtaCard({ responses }: ReviewCtaCardProps) {
  const promoters = responses.filter((r) => r.category === 'Promoter');
  const totalPromoters = promoters.length;
  const clicks = promoters.filter((r) => r.reviewClicked).length;
  const rate = totalPromoters === 0 ? 0 : Math.round((clicks / totalPromoters) * 100);

  // Color band: <10% poor, 10-30% fair, >30% good (heuristic, can tune)
  const accent =
    rate >= 30 ? 'text-emerald-600' : rate >= 10 ? 'text-amber-600' : 'text-red-500';
  const barColor =
    rate >= 30 ? 'bg-emerald-500' : rate >= 10 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Review CTA click rate</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Of promoters (9&ndash;10) who saw the &ldquo;Rate Us&rdquo; screen, how many actually
            clicked through to the store.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
      {totalPromoters === 0 ? (
        <div className="text-sm text-gray-400 py-4">
          No promoters in the current filter range yet.
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${accent}`}>{rate}%</span>
            <span className="text-xs text-gray-500">click rate</span>
          </div>
          <div className="text-xs text-gray-500 mt-1.5">
            <span className="font-semibold text-gray-700">{clicks.toLocaleString()}</span> clicked
            of <span className="font-semibold text-gray-700">{totalPromoters.toLocaleString()}</span> who
            saw the screen
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
