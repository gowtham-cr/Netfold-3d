import { useEffect } from 'react'
import { getGuideTranslations } from '../data/guideAgentTranslations.js'
import { LANGUAGE_OPTIONS } from '../data/translations.js'

/**
 * Futuristic NetFold 3D Glowing Infinity Welcome Screen with honeycomb dark-navy backdrop,
 * neon infinity loop emblem, 5-language selector, role starter cards (Student / Teacher / Exam),
 * quick goal launch starters, and one-click Interactive Website Tour + AI Guide entry.
 */
export default function WelcomeSplash({
  isOpen,
  language,
  onChangeLanguage,
  translations: t,
  onSelectAudience,
  onStartTour,
  onOpenGuideGoal,
  onDismiss,
}) {
  const wt = t.welcome
  const gt = getGuideTranslations(language)

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onDismiss])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-infinity-title"
      className="fixed inset-0 z-50 overflow-y-auto nf-honeycomb-dark bg-slate-950/95 text-slate-100 p-4 sm:p-8 flex items-center justify-center"
    >
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 sm:p-10 shadow-2xl nf-neon-panel space-y-7 backdrop-blur">
        {/* Top Row: Local Demo Badge + 5 Languages + Close */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-[11px] font-bold text-cyan-300">
            ∞ {wt.localDemoBadge}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-800/90 p-1 ring-1 ring-slate-700">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onChangeLanguage(opt.code)}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    language === opt.code
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.nativeLabel}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Center Hero: Glowing Neon 3D Infinity Mark + Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <svg
            viewBox="0 0 220 96"
            aria-hidden="true"
            className="h-20 w-44 sm:h-24 sm:w-52 nf-infinity-glow"
          >
            <defs>
              <linearGradient id="nf-inf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path
              d="M64,48 C64,26 30,26 30,48 C30,70 64,70 84,48 L136,48 C156,26 190,26 190,48 C190,70 156,70 136,48 L84,48"
              fill="none"
              stroke="url(#nf-inf-grad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M64,48 C64,26 30,26 30,48 C30,70 64,70 84,48 L136,48 C156,26 190,26 190,48 C190,70 156,70 136,48 L84,48"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            {wt.badge}
          </span>

          <h2
            id="welcome-infinity-title"
            className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            {wt.title}
          </h2>

          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
            {wt.subtitle}
          </p>
        </div>

        {/* Three Audience Cards: Student / Teacher / Exam */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              key: 'student',
              accent: 'border-indigo-400/40 hover:border-indigo-400 bg-indigo-950/40',
              btn: 'bg-indigo-500 hover:bg-indigo-400 text-white',
            },
            {
              key: 'teacher',
              accent: 'border-emerald-400/40 hover:border-emerald-400 bg-emerald-950/40',
              btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
            },
            {
              key: 'exam',
              accent: 'border-cyan-400/40 hover:border-cyan-400 bg-cyan-950/40',
              btn: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
            },
          ].map((item) => {
            const card = wt.cards[item.key]
            return (
              <div
                key={item.key}
                className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all ${item.accent}`}
              >
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {card.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectAudience(item.key)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${item.btn}`}
                >
                  {card.cta} →
                </button>
              </div>
            )
          })}
        </div>

        {/* Interactive Goal Guide Bar & Guided Tour Launcher */}
        <div className="rounded-2xl border border-indigo-400/30 bg-slate-900/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-cyan-300">
              ✦ {gt.panelTitle}: {gt.goalPrompt}
            </span>
            {onStartTour && (
              <button
                type="button"
                onClick={onStartTour}
                className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-3 py-1 text-xs font-extrabold text-cyan-200 hover:bg-cyan-500/30 transition cursor-pointer"
              >
                🧭 {gt.tourButton}
              </button>
            )}
          </div>
          {onOpenGuideGoal && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: gt.suggestedQueries.student[0], role: 'student' },
                { label: gt.suggestedQueries.teacher[0], role: 'teacher' },
                { label: gt.suggestedQueries.exam[0], role: 'exam' },
                { label: gt.suggestedQueries.exam[1], role: 'exam' },
                { label: gt.suggestedQueries.student[1], role: 'student' },
              ].map((goal) => (
                <button
                  key={goal.label}
                  type="button"
                  onClick={() => onOpenGuideGoal(goal.label, goal.role)}
                  className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-200 transition cursor-pointer"
                >
                  → {goal.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-bold text-slate-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            {wt.enterButton}
          </button>
        </div>
      </div>
    </div>
  )
}
