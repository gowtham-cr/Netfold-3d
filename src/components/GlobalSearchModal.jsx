import { useEffect, useMemo, useRef, useState } from 'react'
import { CLASS_10_PRACTICE_CONTENT } from '../data/class10Practice.js'
import { MISSIONS_CONTENT } from '../data/missions.js'
import { TRANSLATIONS } from '../data/translations.js'
import { filterGlobalSearchResults } from '../utils/learningProgress.js'

/**
 * Accessible Global Search modal (Ctrl+K or /) indexing all 15 shapes,
 * 4 interactive missions, 10 Class 10 solved questions, Net Lab tools, and Guide sections.
 */
export default function GlobalSearchModal({
  isOpen,
  onClose,
  language,
  translations: t,
  onNavigateAction,
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const st = t.search

  useEffect(() => {
    if (!isOpen) return undefined
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 20)
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  const results = useMemo(
    () =>
      filterGlobalSearchResults(query, {
        translations: t,
        enTranslations: TRANSLATIONS.en,
        class10Bundle:
          CLASS_10_PRACTICE_CONTENT[language] ?? CLASS_10_PRACTICE_CONTENT.en,
        enClass10Bundle: CLASS_10_PRACTICE_CONTENT.en,
        missionsBundle: MISSIONS_CONTENT[language] ?? MISSIONS_CONTENT.en,
        enMissionsBundle: MISSIONS_CONTENT.en,
      }),
    [query, t, language],
  )

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={st.buttonLabel}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-4 pt-16 sm:pt-24 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-indigo-600"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16.5"
              y1="16.5"
              x2="21"
              y2="21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={st.placeholder}
            aria-label={st.placeholder}
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2.5 space-y-1">
          {!query.trim() && (
            <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-500">
              {st.emptyPrompt}
            </p>
          )}

          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs font-semibold text-slate-500">
              {st.noResults}
            </p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigateAction(item.action)
                  setQuery('')
                  onClose()
                }}
                className="w-full flex items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left hover:bg-indigo-50/70 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {st.categories[item.category] || t.extraNavTabs?.pyq_archive || 'PYQ'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
