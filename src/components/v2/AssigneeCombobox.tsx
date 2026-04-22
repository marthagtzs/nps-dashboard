'use client';

import { useEffect, useRef, useState } from 'react';
import { colorForAssignee } from './assigneeColors';

interface AssigneeComboboxProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function AssigneeCombobox({ value, options, onChange, disabled }: AssigneeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = typed
    ? options.filter((o) => o.toLowerCase().includes(typed.toLowerCase()))
    : options;

  const showAddNew =
    typed.trim() && !options.some((o) => o.toLowerCase() === typed.trim().toLowerCase());

  const commit = (name: string) => {
    onChange(name);
    setTyped('');
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setTyped('');
    setOpen(false);
  };

  const currentColor = colorForAssignee(value);

  return (
    <div ref={ref} className="relative w-36">
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
          value
            ? `${currentColor.bg} ${currentColor.text} border-transparent`
            : 'bg-white text-gray-500 border-gray-300 hover:border-[#2a8fc7]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate">{value || 'Unassigned'}</span>
        <svg className="w-3 h-3 ml-1 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg border border-gray-200 shadow-lg z-20 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search or add..."
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#2a8fc7] focus:border-[#2a8fc7]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && typed.trim()) {
                  commit(typed.trim());
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {value && (
              <button
                onClick={clear}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear assignment
              </button>
            )}
            {filtered.map((o) => {
              const c = colorForAssignee(o);
              const isSelected = o === value;
              return (
                <button
                  key={o}
                  onClick={() => commit(o)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between gap-2 ${
                    isSelected ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.softBg} ${c.softText}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.bg}`} />
                    {o}
                  </span>
                  {isSelected && (
                    <svg className="w-3 h-3 text-[#2a8fc7] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
            {showAddNew && (
              <button
                onClick={() => commit(typed.trim())}
                className="w-full text-left px-3 py-1.5 text-xs text-[#2a8fc7] hover:bg-blue-50 border-t border-gray-100 flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add &ldquo;{typed.trim()}&rdquo;
              </button>
            )}
            {!filtered.length && !showAddNew && (
              <div className="px-3 py-3 text-center text-xs text-gray-400">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
