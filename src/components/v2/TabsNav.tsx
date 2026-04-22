'use client';

export type TabKey = 'overview' | 'comments';

interface TabsNavProps {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'comments', label: 'Comment tracking' },
];

export default function TabsNav({ active, onChange }: TabsNavProps) {
  return (
    <div className="flex gap-1 -mb-px">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'text-[#2a8fc7] border-[#2a8fc7]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
