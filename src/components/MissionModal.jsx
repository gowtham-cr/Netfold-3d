import { useEffect } from 'react'

/**
 * Accessible celebration modal shown upon completing any interactive mission.
 */
export default function MissionModal({
  isOpen,
  onClose,
  title,
  stars = 3,
  message,
  attempts = 1,
  attemptsLabel,
  starsLabel,
  closeLabel,
}) {
  useEffect(() => {
    if (!isOpen) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div
            aria-label={`${stars} / 3`}
            className="flex items-center gap-1.5 text-3xl text-amber-400"
          >
            {[1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={idx <= stars ? 'text-amber-400' : 'text-slate-300'}
              >
                ★
              </span>
            ))}
          </div>

          <h3
            id="mission-complete-title"
            className="text-lg font-extrabold text-slate-900"
          >
            {title}
          </h3>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
            {message}
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <span>
              {starsLabel}: <strong className="text-amber-600">{stars} / 3</strong>
            </span>
            <span aria-hidden="true">•</span>
            <span>
              {attemptsLabel}: <strong>{attempts}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
