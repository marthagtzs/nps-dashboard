// Stable color assignment for assignee tags.
// The 5 defaults have fixed colors; any custom name hashes into the remaining
// palette so the same name is always the same color, everywhere it's rendered.

export interface TagColor {
  // Tailwind utility classes, paired so text/border/bg always match.
  bg: string;           // strong/solid background (for selected chip/button)
  text: string;         // text on strong bg
  softBg: string;       // light tinted background (for dropdown option, row chip)
  softText: string;     // readable text on soft bg
  ring: string;         // focus ring
}

const PALETTE: Record<string, TagColor> = {
  purple: {
    bg: 'bg-purple-500',
    text: 'text-white',
    softBg: 'bg-purple-50',
    softText: 'text-purple-700',
    ring: 'focus:ring-purple-300',
  },
  pink: {
    bg: 'bg-pink-500',
    text: 'text-white',
    softBg: 'bg-pink-50',
    softText: 'text-pink-700',
    ring: 'focus:ring-pink-300',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    softBg: 'bg-orange-50',
    softText: 'text-orange-700',
    ring: 'focus:ring-orange-300',
  },
  sky: {
    bg: 'bg-sky-500',
    text: 'text-white',
    softBg: 'bg-sky-50',
    softText: 'text-sky-700',
    ring: 'focus:ring-sky-300',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    softBg: 'bg-emerald-50',
    softText: 'text-emerald-700',
    ring: 'focus:ring-emerald-300',
  },
  rose: {
    bg: 'bg-rose-500',
    text: 'text-white',
    softBg: 'bg-rose-50',
    softText: 'text-rose-700',
    ring: 'focus:ring-rose-300',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-white',
    softBg: 'bg-amber-50',
    softText: 'text-amber-700',
    ring: 'focus:ring-amber-300',
  },
  teal: {
    bg: 'bg-teal-500',
    text: 'text-white',
    softBg: 'bg-teal-50',
    softText: 'text-teal-700',
    ring: 'focus:ring-teal-300',
  },
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-white',
    softBg: 'bg-indigo-50',
    softText: 'text-indigo-700',
    ring: 'focus:ring-indigo-300',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    text: 'text-white',
    softBg: 'bg-fuchsia-50',
    softText: 'text-fuchsia-700',
    ring: 'focus:ring-fuchsia-300',
  },
};

// Fixed assignments for the 5 default team members.
const DEFAULTS: Record<string, keyof typeof PALETTE> = {
  Martha: 'purple',
  Mariana: 'pink',
  Nath: 'orange',
  Marijo: 'sky',
  Paola: 'emerald',
};

// Unassigned / empty => neutral gray.
const NEUTRAL: TagColor = {
  bg: 'bg-gray-200',
  text: 'text-gray-600',
  softBg: 'bg-gray-50',
  softText: 'text-gray-500',
  ring: 'focus:ring-gray-300',
};

// Pool of colors available for hashed custom names (everything not reserved
// for a default). Using a fixed order keeps hashing deterministic across
// loads.
const CUSTOM_POOL: (keyof typeof PALETTE)[] = [
  'rose',
  'amber',
  'teal',
  'indigo',
  'fuchsia',
];

function hash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function colorForAssignee(name: string): TagColor {
  const trimmed = (name || '').trim();
  if (!trimmed) return NEUTRAL;
  const fixed = DEFAULTS[trimmed];
  if (fixed) return PALETTE[fixed];
  const key = CUSTOM_POOL[hash(trimmed.toLowerCase()) % CUSTOM_POOL.length];
  return PALETTE[key];
}

export const NEUTRAL_TAG = NEUTRAL;
