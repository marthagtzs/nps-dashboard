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
  keywords: string[];
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'bug',
    label: 'Bug / Issue',
    labelEs: 'Bug',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    keywords: [
      'bug', 'error', 'crash', 'broken', 'doesnt work', "doesn't work", 'not working',
      'fail', 'failed', 'failing', 'glitch', 'freeze', 'freezes', 'stuck', 'slow',
      'loading', 'lag', 'laggy',
      // Spanish
      'falla', 'fallo', 'error', 'no funciona', 'no sirve', 'se traba', 'lento', 'lenta',
      'se cierra', 'se cae', 'no carga', 'no abre', 'tarda',
      // Portuguese
      'travando', 'travou', 'não funciona', 'não abre', 'erro',
    ],
  },
  {
    key: 'price',
    label: 'Price / Value',
    labelEs: 'Precio',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    keywords: [
      'price', 'pricing', 'expensive', 'cost', 'cheap', 'money', 'pay', 'paid',
      'subscription', 'free', 'premium', 'worth', 'afford', 'charge', 'billing', 'refund',
      // Spanish
      'precio', 'caro', 'cara', 'costoso', 'costosa', 'pagar', 'cobro', 'cobran',
      'suscripci', 'gratis', 'gratuito', 'dinero', 'vale la pena', 'mensualidad',
      // Portuguese
      'preço', 'caro', 'cara', 'pagar', 'assinatura', 'gratuito', 'dinheiro',
    ],
  },
  {
    key: 'content',
    label: 'Content / Activities',
    labelEs: 'Contenido',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    keywords: [
      'content', 'activity', 'activities', 'article', 'video', 'lesson', 'milestone',
      'curriculum', 'exercise', 'game', 'catalog', 'age', 'ages',
      // Spanish
      'contenido', 'actividad', 'actividades', 'artículo', 'video', 'lección',
      'hito', 'ejercicio', 'juego', 'catálogo', 'edad', 'edades', 'etapa',
      // Portuguese
      'conteúdo', 'atividade', 'atividades', 'artigo', 'vídeo', 'lição',
    ],
  },
  {
    key: 'feature',
    label: 'Feature Request',
    labelEs: 'Feature',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    keywords: [
      'wish', 'would be nice', 'should have', 'could add', 'please add', 'missing',
      'need', 'want', 'feature', 'option', 'improve', 'improvement', 'suggestion',
      'suggest', 'hope',
      // Spanish
      'ojalá', 'estaría bien', 'falta', 'faltan', 'necesita', 'necesito',
      'quisiera', 'quiero', 'mejorar', 'mejora', 'sugerencia', 'sugiero', 'agregar',
      'añadir', 'incluir',
      // Portuguese
      'gostaria', 'poderia', 'falta', 'precisa', 'melhorar', 'melhoria', 'sugestão',
    ],
  },
  {
    key: 'ux',
    label: 'UX / Design',
    labelEs: 'UX',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    keywords: [
      'confusing', 'hard to', 'difficult', 'navigate', 'navigation', 'intuitive',
      'design', 'layout', 'interface', 'ui', 'ux', 'button', 'menu', 'find',
      'complicated', 'simple', 'easy', 'easier',
      // Spanish
      'confuso', 'confusa', 'difícil', 'navegar', 'navegación', 'diseño', 'interfaz',
      'botón', 'menú', 'encontrar', 'complicado', 'complicada', 'sencillo', 'fácil',
      // Portuguese
      'confuso', 'difícil', 'navegar', 'navegação', 'design', 'interface', 'botão',
    ],
  },
  {
    key: 'praise',
    label: 'Praise',
    labelEs: 'Elogio',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    keywords: [
      'love', 'amazing', 'great', 'awesome', 'excellent', 'best', 'wonderful',
      'fantastic', 'helpful', 'thank', 'thanks', 'perfect', 'good app', 'recommend',
      'happy', 'enjoy',
      // Spanish
      'encanta', 'excelente', 'increíble', 'genial', 'maravilloso', 'maravillosa',
      'mejor', 'fantástico', 'fantástica', 'gracias', 'perfecto', 'perfecta',
      'buena app', 'recomiendo', 'feliz', 'me gusta', 'amo',
      // Portuguese
      'amo', 'adoro', 'excelente', 'incrível', 'maravilhoso', 'obrigado', 'obrigada',
      'perfeito', 'perfeita', 'recomendo',
    ],
  },
];

function categorizeComment(comment: string): string[] {
  if (!comment || !comment.trim()) return [];
  const lower = comment.toLowerCase();
  const matched = CATEGORIES
    .filter((cat) => cat.keywords.some((kw) => lower.includes(kw)))
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
