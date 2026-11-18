import { useState } from 'react'

const STEP_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6']

function ProgressiveNetSvg({ stepIndex, t }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className="h-64 w-full max-w-md sm:h-72"
      role="img"
      aria-label={t.netLab.draw.steps[STEP_KEYS[stepIndex]].title}
    >
      {/* Background guide grid */}
      <defs>
        <pattern
          id="draw-grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="360" height="280" rx="14" fill="url(#draw-grid)" />

      {/* Step 1: Unfolding box dashed hint */}
      {stepIndex === 0 && (
        <g>
          <polygon
            points="120,90 210,90 235,68 145,68"
            fill="#dbeafe"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <rect
            x="120"
            y="90"
            width="90"
            height="80"
            fill="#d1fae5"
            stroke="#059669"
            strokeWidth="2"
          />
          <polygon
            points="210,90 235,68 235,148 210,170"
            fill="#cffafe"
            stroke="#0891b2"
            strokeWidth="2"
          />
          <path
            d="M 105 140 C 80 140, 75 185, 110 190"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />
          <path
            d="M 250 130 C 275 130, 280 180, 245 190"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />
        </g>
      )}

      {/* Step 2: Identify face cards */}
      {stepIndex === 1 && (
        <g>
          <rect x="45" y="45" width="76" height="58" rx="6" fill="#3b82f6" />
          <text x="83" y="78" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.bottom}
          </text>
          <rect x="142" y="45" width="76" height="58" rx="6" fill="#f43f5e" />
          <text x="180" y="78" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.top}
          </text>
          <rect x="239" y="45" width="76" height="58" rx="6" fill="#10b981" />
          <text x="277" y="78" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.front}
          </text>
          <rect x="45" y="128" width="76" height="58" rx="6" fill="#f59e0b" />
          <text x="83" y="161" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.back}
          </text>
          <rect x="142" y="128" width="76" height="58" rx="6" fill="#8b5cf6" />
          <text x="180" y="161" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.left}
          </text>
          <rect x="239" y="128" width="76" height="58" rx="6" fill="#06b6d4" />
          <text x="277" y="161" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.right}
          </text>
        </g>
      )}

      {/* Steps 3–6: Progressive Cross Net Drawing */}
      {stepIndex >= 2 && (
        <g>
          {/* Base face (step 3+) */}
          <rect
            x="140"
            y="140"
            width="80"
            height="56"
            fill="#3b82f6"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <text
            x="180"
            y="172"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="800"
          >
            {t.faceNames.bottom}
          </text>
        </g>
      )}

      {/* Step 4+: Attach 4 surrounding lateral faces */}
      {stepIndex >= 3 && (
        <g>
          {/* Back (above Base) */}
          <rect
            x="140"
            y="92"
            width="80"
            height="48"
            fill="#f59e0b"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <text x="180" y="120" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.back}
          </text>

          {/* Front (below Base) */}
          <rect
            x="140"
            y="196"
            width="80"
            height="48"
            fill="#10b981"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <text x="180" y="224" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.front}
          </text>

          {/* Left */}
          <rect
            x="92"
            y="140"
            width="48"
            height="56"
            fill="#8b5cf6"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <text x="116" y="172" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.left}
          </text>

          {/* Right */}
          <rect
            x="220"
            y="140"
            width="48"
            height="56"
            fill="#06b6d4"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <text x="244" y="172" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            {t.faceNames.right}
          </text>
        </g>
      )}

      {/* Step 5+: Top Lid */}
      {stepIndex >= 4 && (
        <g>
          <rect
            x="140"
            y="36"
            width="80"
            height="56"
            fill="#f43f5e"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <text x="180" y="68" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">
            {t.faceNames.top}
          </text>
        </g>
      )}

      {/* Step 6: Fold check arrows & 90° hinge callouts */}
      {stepIndex >= 5 && (
        <g stroke="#facc15" strokeWidth="2.5" fill="none">
          <path d="M 140 168 L 128 168" />
          <path d="M 220 168 L 232 168" />
          <path d="M 180 140 L 180 128" />
          <path d="M 180 196 L 180 208" />
          <path d="M 180 92 L 180 80" />
          <circle cx="180" cy="140" r="4" fill="#facc15" />
          <circle cx="180" cy="196" r="4" fill="#facc15" />
          <circle cx="140" cy="168" r="4" fill="#facc15" />
          <circle cx="220" cy="168" r="4" fill="#facc15" />
        </g>
      )}
    </svg>
  )
}

/**
 * Interactive 6-step Draw-a-Net Guide with Previous / Next controls and progressive diagrams.
 */
export default function DrawANetGuide({ translations: t }) {
  const [stepIndex, setStepIndex] = useState(0)
  const stepKey = STEP_KEYS[stepIndex]
  const stepInfo = t.netLab.draw.steps[stepKey]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEP_KEYS.length - 1

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t.netLab.draw.title}
          </h2>
          <p className="text-xs text-slate-600">{t.netLab.draw.subtitle}</p>
        </div>
        <span className="rounded-lg bg-indigo-50 px-3 py-1 font-mono text-xs font-bold text-indigo-800 ring-1 ring-indigo-200">
          {t.netLab.draw.stepPrefix} {stepIndex + 1} / {STEP_KEYS.length}
        </span>
      </div>

      {/* Step selector pills 1..6 */}
      <div className="grid grid-cols-6 gap-1.5">
        {STEP_KEYS.map((key, idx) => {
          const active = idx === stepIndex
          const done = idx < stepIndex
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setStepIndex(idx)}
              className={`rounded-xl py-2 font-mono text-xs font-bold transition ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : done
                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Diagram + Step Details */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-center">
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:col-span-6">
          <ProgressiveNetSvg stepIndex={stepIndex} t={t} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
            <h3 className="text-base font-extrabold text-indigo-950">
              {stepInfo.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              {stepInfo.body}
            </p>
            <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              ✓ {stepInfo.checklist}
            </div>
          </div>

          {isLast && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900">
              {t.netLab.draw.finishMessage}
            </div>
          )}

          {/* Previous / Next Navigation */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              ← {t.netLab.draw.previous}
            </button>

            <div className="flex items-center gap-2">
              {isLast ? (
                <button
                  type="button"
                  onClick={() => setStepIndex(0)}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
                >
                  {t.netLab.draw.restart}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setStepIndex((i) => Math.min(STEP_KEYS.length - 1, i + 1))
                  }
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  {t.netLab.draw.next} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
