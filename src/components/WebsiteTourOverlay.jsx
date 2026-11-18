import { useEffect, useState } from 'react'
import { getGuideTranslations } from '../data/guideAgentTranslations.js'

/**
 * Interactive Guided Website Tour highlighting real UI elements via `[data-tour="..."]`
 * with Previous, Next / Finish, and Skip controls without blocking app scrolling.
 */
export default function WebsiteTourOverlay({
  isOpen,
  language = 'en',
  onClose,
  onOpenGuidePanel,
}) {
  const gt = getGuideTranslations(language)
  const tour = gt.tour
  const steps = tour.steps
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)

  const activeStep = steps[Math.min(stepIndex, steps.length - 1)]

  useEffect(() => {
    if (!isOpen) return undefined
    const measureTarget = () => {
      if (typeof document === 'undefined' || !activeStep?.target) {
        setTargetRect(null)
        return
      }
      const el = document.querySelector(`[data-tour="${activeStep.target}"]`)
      if (!el) {
        setTargetRect(null)
        return
      }
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setTargetRect(null)
        return
      }
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    }

    const scrollAndMeasure = () => {
      if (typeof document !== 'undefined' && activeStep?.target) {
        const el = document.querySelector(`[data-tour="${activeStep.target}"]`)
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
        }
      }
      measureTarget()
    }

    const initTimer = window.setTimeout(scrollAndMeasure, 40)
    window.addEventListener('resize', measureTarget)
    window.addEventListener('scroll', measureTarget, true)
    return () => {
      window.clearTimeout(initTimer)
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget, true)
    }
  }, [isOpen, activeStep])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      else if (e.key === 'ArrowRight') {
        setStepIndex((i) => {
          if (i >= steps.length - 1) {
            onClose?.()
            return 0
          }
          return i + 1
        })
      } else if (e.key === 'ArrowLeft') {
        setStepIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, steps.length])

  if (!isOpen || !activeStep) return null

  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const stepCounterText = tour.stepOf
    .replace('{current}', String(stepIndex + 1))
    .replace('{total}', String(steps.length))

  const handleFinishOrNext = () => {
    if (isLast) {
      setStepIndex(0)
      onClose?.()
      onOpenGuidePanel?.()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  return (
    <div className="no-print">
      {/* Live Highlight Ring around Targeted UI Element */}
      {targetRect && (
        <div
          aria-hidden="true"
          style={{
            top: Math.max(4, targetRect.top - 5),
            left: Math.max(4, targetRect.left - 5),
            width: targetRect.width + 10,
            height: targetRect.height + 10,
          }}
          className="pointer-events-none fixed z-50 rounded-xl border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.35),0_0_18px_rgba(34,211,238,0.85)] transition-all duration-200"
        />
      )}

      {/* Tour Card */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label={tour.badge}
        className="fixed bottom-20 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[430px] z-50 rounded-2xl border border-cyan-400/60 bg-slate-900 p-4 text-slate-100 shadow-2xl space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-cyan-300">
              {tour.badge}
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-300">
              {stepCounterText}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setStepIndex(0)
              onClose?.()
            }}
            className="text-xs font-bold text-slate-300 hover:text-white underline underline-offset-2 cursor-pointer"
          >
            {tour.skipButton}
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-extrabold text-white">
            {activeStep.title}
          </h4>
          <p className="text-xs leading-relaxed text-slate-300">
            {activeStep.body}
          </p>
          {!targetRect && (
            <p className="text-[11px] font-semibold text-amber-300">
              ℹ️ {tour.targetHiddenNote}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            ← {tour.prevButton}
          </button>

          <button
            type="button"
            onClick={handleFinishOrNext}
            className="rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 transition cursor-pointer"
          >
            {isLast ? `${tour.finishButton} ✓` : `${tour.nextButton} →`}
          </button>
        </div>
      </div>
    </div>
  )
}
