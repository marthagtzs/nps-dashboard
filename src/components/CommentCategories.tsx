'use client';

import { useState, useMemo } from 'react';
import { NpsResponse } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';

interface CommentCategoriesProps {
  responses: NpsResponse[];
}

interface CategoryDef {
  key: string;
  label: string;
  labelEs: string;
  color: string;
  bgColor: string;
  borderColor: string;
  patterns: RegExp[];
}

function words(...keywords: string[]): RegExp[] {
  return keywords.map((kw) => {
    // Multi-word phrases use plain includes-style match
    if (kw.includes(' ')) return new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    // Single words use word-boundary matching to avoid substring false positives
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[\\s.,;:!?¿¡"'()/])${escaped}(?:$|[\\s.,;:!?¿¡"'()/])`, 'i');
  });
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'bug',
    label: 'Bug / Issue',
    labelEs: 'Bug',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    patterns: words(
      'bug', 'error', 'crash', 'broken', 'glitch', 'freeze', 'freezes', 'stuck',
      'slow', 'loading', 'lag', 'laggy',
      // Phrases
      'doesnt work', "doesn't work", 'not working', 'failed',
      // Spanish
      'falla', 'fallo', 'no funciona', 'no sirve', 'se traba', 'lento', 'lenta',
      'se cierra', 'se cae', 'no carga', 'no abre', 'tarda',
      // Portuguese
      'travando', 'travou', 'não funciona', 'não abre', 'erro',
    ),
  },
  {
    key: 'price',
    label: 'Price / Value',
    labelEs: 'Precio',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    patterns: words(
      'price', 'pricing', 'expensive', 'cheap', 'money', 'paid',
      'subscription', 'worth', 'afford', 'charge', 'billing', 'refund',
      'chargeable',
      // Phrases
      'pay for', 'have to pay', 'locked to pay', 'must pay',
      // Spanish
      'precio', 'caro', 'cara', 'costoso', 'costosa', 'pagar', 'pagarse',
      'cobro', 'cobran', 'cobraron', 'gratis', 'gratuito', 'gratuita',
      'dinero', 'mensualidad', 'abusiva',
      // Phrases Spanish
      'se debe de pagar', 'todo es pago', 'todo se tiene que pagar',
      'requiere de pago', 'debe pagarse', 'es pago', 'vale la pena',
      'contenido gratuito', 'plan comprado', 'no tenemos plan',
      // Portuguese
      'preço', 'assinatura', 'dinheiro',
    ),
  },
  {
    key: 'content',
    label: 'Content / Activities',
    labelEs: 'Contenido',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    patterns: words(
      'activity', 'activities', 'article', 'articles', 'video', 'videos',
      'lesson', 'lessons', 'milestone', 'milestones', 'curriculum',
      'exercise', 'exercises', 'webinar', 'webinars', 'catalog',
      // Spanish
      'actividad', 'actividades', 'artículo', 'lección', 'lecciones',
      'hito', 'ejercicio', 'ejercicios', 'catálogo', 'etapa', 'etapas',
      'estimulación',
      // Portuguese
      'atividade', 'atividades', 'artigo', 'lição',
    ),
  },
  {
    key: 'feature',
    label: 'Feature Request',
    labelEs: 'Feature',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    patterns: words(
      'feature', 'improvement', 'suggestion',
      // Phrases
      'would be nice', 'should have', 'could add', 'please add',
      'i wish it', 'wish it had', 'wish there',
      // Spanish
      'ojalá', 'quisiera', 'sugerencia', 'sugiero', 'agregar',
      'añadir',
      // Phrases Spanish
      'estaría bien', 'debería tener', 'le falta', 'les falta',
      // Portuguese
      'gostaria', 'sugestão',
    ),
  },
  {
    key: 'ux',
    label: 'UX / Design',
    labelEs: 'UX',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    patterns: words(
      'confusing', 'difficult', 'intuitive', 'layout', 'complicated',
      // Phrases
      'hard to use', 'hard to find', 'hard to navigate', 'user interface',
      // Spanish
      'confuso', 'confusa', 'difícil de usar', 'navegar', 'navegación',
      'diseño', 'interfaz', 'complicado', 'complicada',
      // Portuguese
      'navegação',
    ),
  },
  {
    key: 'praise',
    label: 'Praise',
    labelEs: 'Elogio',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    patterns: words(
      'love', 'amazing', 'awesome', 'excellent', 'wonderful',
      'fantastic', 'helpful', 'perfect', 'recommend', 'enjoy',
      // Phrases
      'good app', 'great app', 'best app',
      // Spanish
      'encanta', 'excelente', 'increíble', 'genial', 'maravilloso', 'maravillosa',
      'fantástico', 'fantástica', 'perfecto', 'perfecta',
      'recomiendo', 'me gusta mucho',
      // Phrases Spanish
      'buena app', 'buena aplicación', 'muy buena', 'facilita mucho',
      // Portuguese
      'adoro', 'incrível', 'maravilhoso', 'recomendo',
      'perfeito', 'perfeita',
    ),
  },
];

function categorizeComment(comment: string): string[] {
  if (!comment || !comment.trim()) return [];
  const matched = CATEGORIES
    .filter((cat) => cat.patterns.some((re) => re.test(comment)))
    .map((cat) => cat.key);
  return matched.length > 0 ? matched : ['other'];
}

const categoryBadge: Record<string, string> = {
  Promoter: 'bg-emerald-100 text-emerald-700',
  Passive: 'bg-amber-100 text-amber-700',
  Detractor: 'bg-red-100 text-red-700',
};

export default function CommentCategories({ responses }: CommentCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const withComments = useMemo(
    () => responses.filter((r) => r.comment && r.comment.trim()),
    [responses]
  );

  const categorized = useMemo(() => {
    const map: Record<string, NpsResponse[]> = {};
    CATEGORIES.forEach((c) => { map[c.key] = []; });
    map['other'] = [];

    withComments.forEach((r) => {
      const cats = categorizeComment(r.comment);
      cats.forEach((cat) => {
        if (!map[cat]) map[cat] = [];
        map[cat].push(r);
      });
    });

    return map;
  }, [withComments]);

  const formatDate = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) return format(parsed, 'MMM d, yyyy');
    } catch { /* ignore */ }
    return dateStr;
  };

  if (withComments.length === 0) return null;

  const allCategories = [
    ...CATEGORIES,
    {
      key: 'other',
      label: 'Other',
      labelEs: 'Otro',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      keywords: [],
    },
  ];

  const visibleCategories = allCategories.filter((c) => categorized[c.key]?.length > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Comment Topics ({withComments.length} comments)
        </h3>
      </div>

      {/* Category pills */}
      <div className="p-4 flex flex-wrap gap-2">
        {visibleCategories.map((cat) => {
          const count = categorized[cat.key]?.length || 0;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(isSelected ? null : cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isSelected
                  ? `${cat.bgColor} ${cat.color} ${cat.borderColor} ring-2 ring-offset-1 ring-current`
                  : `bg-white text-gray-600 border-gray-200 hover:${cat.bgColor} hover:${cat.borderColor}`
              }`}
            >
              {cat.label}
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                isSelected ? 'bg-white/60 ' + cat.color : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded comment list */}
      {selectedCategory && categorized[selectedCategory] && (
        <div className="border-t border-gray-100">
          <div className="divide-y divide-gray-50">
            {categorized[selectedCategory].map((r, i) => (
              <div key={`${r.dedupKey}-${i}`} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Score circle */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    r.score >= 9 ? 'bg-emerald-500' : r.score >= 7 ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    {r.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Comment */}
                    <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                    {/* User attributes */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                      <span>{formatDate(r.date)}</span>
                      <span className="text-gray-200">|</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryBadge[r.category]}`}>
                        {r.category}
                      </span>
                      {r.highestPlanType && (
                        <>
                          <span className="text-gray-200">|</span>
                          <span className="capitalize">{r.highestPlanType}</span>
                        </>
                      )}
                      {r.userLocale && (
                        <>
                          <span className="text-gray-200">|</span>
                          <span className="uppercase">{r.userLocale}</span>
                        </>
                      )}
                      {r.os && (
                        <>
                          <span className="text-gray-200">|</span>
                          <span>{r.os}</span>
                        </>
                      )}
                      {r.identity && (
                        <>
                          <span className="text-gray-200">|</span>
                          <span className="text-gray-300 truncate max-w-[120px]">{r.identity}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
