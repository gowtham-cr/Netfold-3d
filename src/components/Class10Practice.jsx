import { useEffect, useState } from 'react'
import Canvas3D from './Canvas3D.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import PracticeDiagramSvg from './practice/PracticeDiagramSvg.jsx'
import {
  CLASS_10_PRACTICE_CONFIG,
  CLASS_10_PRACTICE_CONTENT,
} from '../data/class10Practice.js'
import { SHAPES } from '../utils/mathEngine.js'

const STORAGE_KEY = 'netfold_class10_practice_idx_v1'
const STEP_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10']

const TRUE_SCALE_NOTES = {
  q6: 'r = 7 cm, h = 24 cm, l = 25 cm',
  q7: 'r = 0.7 m, h = 2.4 m',
}

const NO_NET_SHAPES = new Set([SHAPES.SPHERE, SHAPES.HEMISPHERE])

function createAllStepsState(expanded) {
  return {
    s1: expanded,
    s2: expanded,
    s3: expanded,
    s4: expanded,
    s5: expanded,
    s6: expanded,
    s7: expanded,
    s8: expanded,
    s9: expanded,
    s10: expanded,
  }
}

function loadInitialQuestionIndex() {
  if (typeof window === 'undefined') return 0
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = Number.parseInt(raw, 10)
    if (
      Number.isInteger(parsed) &&
      parsed >= 0 &&
      parsed < CLASS_10_PRACTICE_CONFIG.length
    ) {
      return parsed
    }
    return 0
  } catch {
    return 0
  }
}

function saveQuestionIndex(idx) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, String(idx))
  } catch {
    // Ignore storage quota or private mode errors
  }
}

function CollapsibleStepCard({
  stepKey,
  title,
  isOpen,
  onToggle,
  toneClass,
  children,
}) {
  return (
    <section
      className={`rounded-2xl border transition-colors ${toneClass} overflow-hidden`}
    >
      <button
        type="button"
        onClick={() => onToggle(stepKey)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-900/[0.02] transition-colors cursor-pointer"
      >
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600"
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="min-w-0 break-words px-4 pb-4 pt-1 border-t border-slate-200/70 text-sm text-slate-700 leading-relaxed">
          {children}
        </div>
      )}
    </section>
  )
}

/**
 * Dedicated dashboard for NCERT Mensuration – Class 10 Solved Practice (Q1-Q10).
 * Presents one full board-exam-style written solution per screen in all 5 languages
 * with zoom-safe interactive 3D models, 2D SVG geometric diagrams, bookmarks, and
 * full-page accessible scrolling.
 */
export default function Class10Practice({
  language,
  translations,
  theme = 'light',
  requestedQuestionIndex = null,
  bookmarkedQuestions = [],
  onToggleBookmarkQuestion,
  onQuestionVisited,
  onOpenShapeIn3D,
}) {
  const t = translations
  const pt = t.practice
  const bt = t.bookmarks
  const contentBundle =
    CLASS_10_PRACTICE_CONTENT[language] ?? CLASS_10_PRACTICE_CONTENT.en

  const [questionIdx, setQuestionIdx] = useState(() =>
    typeof requestedQuestionIndex === 'number'
      ? Math.max(0, Math.min(CLASS_10_PRACTICE_CONFIG.length - 1, requestedQuestionIndex))
      : loadInitialQuestionIndex(),
  )
  const [expandedSteps, setExpandedSteps] = useState(() =>
    createAllStepsState(true),
  )
  const [useAltModel, setUseAltModel] = useState(false)
  const [foldPreview, setFoldPreview] = useState(100)
  const [selectedFace, setSelectedFace] = useState(null)

  const totalQuestions = CLASS_10_PRACTICE_CONFIG.length
  const cfg = CLASS_10_PRACTICE_CONFIG[questionIdx] ?? CLASS_10_PRACTICE_CONFIG[0]
  const qContent = contentBundle[cfg.id] ?? CLASS_10_PRACTICE_CONTENT.en[cfg.id]
  const isBookmarked = bookmarkedQuestions.includes(cfg.id)

  useEffect(() => {
    if (typeof onQuestionVisited === 'function') {
      onQuestionVisited(cfg.id)
    }
  }, [cfg.id, onQuestionVisited])

  const selectQuestion = (nextIdx) => {
    const bounded = Math.max(0, Math.min(totalQuestions - 1, nextIdx))
    setQuestionIdx(bounded)
    saveQuestionIndex(bounded)
    setUseAltModel(false)
    setFoldPreview(CLASS_10_PRACTICE_CONFIG[bounded]?.foldProgress ?? 100)
    setSelectedFace(null)
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const toggleStep = (stepKey) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }))
  }

  const setAllSteps = (expanded) => {
    setExpandedSteps(createAllStepsState(expanded))
  }

  const hasAltModel = Boolean(cfg.altShape && cfg.altDimensions)
  const activeShape =
    hasAltModel && useAltModel ? cfg.altShape : cfg.shape
  const activeDimensions =
    hasAltModel && useAltModel ? cfg.altDimensions : cfg.dimensions
  const activeShapeHasNet = !NO_NET_SHAPES.has(activeShape)
  const effectiveFold = activeShapeHasNet ? foldPreview : 100
  const scaleNote = TRUE_SCALE_NOTES[cfg.id] ?? null

  const diagramPanel = (
    <PracticeDiagramSvg
      questionId={cfg.id}
      diagramLabels={pt.diagramLabels}
      caption={qContent.diagramCaption}
    />
  )

  const model3DPanel = (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
          {pt.interactive3DTab} · {t.shapes[activeShape] ?? activeShape}
        </span>
        {hasAltModel && (
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setUseAltModel(false)
                setSelectedFace(null)
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                !useAltModel
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pt.togglePrimaryModel}
            </button>
            <button
              type="button"
              onClick={() => {
                setUseAltModel(true)
                setSelectedFace(null)
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                useAltModel
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pt.toggleCompareModel}
            </button>
          </div>
        )}
      </div>

      <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
        <Canvas3D
          shape={activeShape}
          foldProgress={effectiveFold}
          dimensions={activeDimensions}
          highlightMode={cfg.highlightMode}
          selectedFace={selectedFace}
          onSelectFace={setSelectedFace}
          translations={t}
          inlineScrollMode
          theme={theme}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {activeShapeHasNet && (
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 flex-1 min-w-[180px]">
            <span className="shrink-0">{pt.foldSliderLabel}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={foldPreview}
              onChange={(e) => setFoldPreview(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="w-9 text-right font-mono font-semibold text-indigo-700">
              {foldPreview}%
            </span>
          </label>
        )}

        {typeof onOpenShapeIn3D === 'function' && (
          <button
            type="button"
            onClick={() => onOpenShapeIn3D(activeShape, activeDimensions)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer ml-auto"
          >
            {pt.openInExplorer}
          </button>
        )}
      </div>

      {scaleNote && (
        <p className="text-[11px] leading-snug text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          {pt.scaleNoticePrefix} <span className="font-semibold">{scaleNote}</span>
        </p>
      )}
    </div>
  )

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 space-y-4">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                {pt.boardExamTag}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                {pt.writtenPracticeNote}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {pt.headerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {pt.headerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold">
              {pt.progressPrefix} {questionIdx + 1} / {totalQuestions}
            </span>
            <button
              type="button"
              onClick={() => setAllSteps(true)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {pt.expandAll}
            </button>
            <button
              type="button"
              onClick={() => setAllSteps(false)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {pt.collapseAll}
            </button>
          </div>
        </div>

        {/* Question Selector Strip + Previous/Next Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div
            role="tablist"
            aria-label={pt.questionSelectorAria}
            className="flex flex-wrap items-center gap-1.5"
          >
            {CLASS_10_PRACTICE_CONFIG.map((item, idx) => {
              const active = idx === questionIdx
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectQuestion(idx)}
                  className={`h-8 min-w-[2.25rem] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Q{idx + 1}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={questionIdx === 0}
              onClick={() => selectQuestion(questionIdx - 1)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← {pt.previousButton}
            </button>
            <button
              type="button"
              disabled={questionIdx === totalQuestions - 1}
              onClick={() => selectQuestion(questionIdx + 1)}
              className="rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {pt.nextButton} →
            </button>
          </div>
        </div>
      </div>

      {/* Solved Question Title Bar + Bookmark Toggle */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-5 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-extrabold">
            Q{questionIdx + 1}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {qContent.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SpeakControlsBar
            compact
            text={`${qContent.title}. ${qContent.question} ${qContent.concept} ${qContent.formula} ${qContent.calculations.join(' ')}`}
            language={language}
            sourceId={`class10_${cfg.id}`}
            isDark={false}
          />
          {typeof onToggleBookmarkQuestion === 'function' && (
            <button
              type="button"
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? bt.removeQuestion : bt.addQuestion}
              onClick={() => onToggleBookmarkQuestion(cfg.id)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              <span aria-hidden="true">{isBookmarked ? '★' : '☆'}</span>
              <span>{isBookmarked ? bt.removeQuestion : bt.addQuestion}</span>
            </button>
          )}
          <span className="text-xs font-semibold text-indigo-700 bg-white/80 border border-indigo-100 px-2.5 py-1 rounded-lg">
            {pt.stepBadgePrefix}: 1–{STEP_KEYS.length}
          </span>
        </div>
      </div>

      {/* 10 Board-Exam Solution Cards */}
      <div className="space-y-3">
        <CollapsibleStepCard
          stepKey="s1"
          title={pt.stepTitles.s1}
          isOpen={expandedSteps.s1}
          onToggle={toggleStep}
          toneClass="border-indigo-200 bg-indigo-50/40"
        >
          <p className="text-base font-semibold text-slate-900 leading-relaxed">
            {qContent.question}
          </p>
        </CollapsibleStepCard>

        <CollapsibleStepCard
          stepKey="s2"
          title={pt.stepTitles.s2}
          isOpen={expandedSteps.s2}
          onToggle={toggleStep}
          toneClass="border-slate-200 bg-white"
        >
          <p>{qContent.concept}</p>
        </CollapsibleStepCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CollapsibleStepCard
            stepKey="s3"
            title={pt.stepTitles.s3}
            isOpen={expandedSteps.s3}
            onToggle={toggleStep}
            toneClass="border-slate-200 bg-white"
          >
            <p>{qContent.given}</p>
          </CollapsibleStepCard>

          <CollapsibleStepCard
            stepKey="s4"
            title={pt.stepTitles.s4}
            isOpen={expandedSteps.s4}
            onToggle={toggleStep}
            toneClass="border-slate-200 bg-white"
          >
            <p className="font-medium text-slate-800">{qContent.toFind}</p>
          </CollapsibleStepCard>
        </div>

        <CollapsibleStepCard
          stepKey="s5"
          title={pt.stepTitles.s5}
          isOpen={expandedSteps.s5}
          onToggle={toggleStep}
          toneClass="border-sky-200 bg-sky-50/50"
        >
          <div className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 font-mono text-sm sm:text-base font-bold text-sky-900">
            {qContent.formula}
          </div>
        </CollapsibleStepCard>

        <CollapsibleStepCard
          stepKey="s6"
          title={pt.stepTitles.s6}
          isOpen={expandedSteps.s6}
          onToggle={toggleStep}
          toneClass="border-slate-200 bg-white"
        >
          <ol className="list-decimal pl-5 space-y-1.5">
            {qContent.derivation.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </CollapsibleStepCard>

        <CollapsibleStepCard
          stepKey="s7"
          title={pt.stepTitles.s7}
          isOpen={expandedSteps.s7}
          onToggle={toggleStep}
          toneClass="border-slate-200 bg-white"
        >
          <p className="font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
            {qContent.substitution}
          </p>
        </CollapsibleStepCard>

        <CollapsibleStepCard
          stepKey="s8"
          title={pt.stepTitles.s8}
          isOpen={expandedSteps.s8}
          onToggle={toggleStep}
          toneClass="border-slate-200 bg-white"
        >
          <ol className="list-decimal pl-5 space-y-2 font-mono text-xs sm:text-sm text-slate-800">
            {qContent.calculations.map((calcLine, i) => (
              <li key={i} className="leading-relaxed">
                {calcLine}
              </li>
            ))}
          </ol>
        </CollapsibleStepCard>

        <CollapsibleStepCard
          stepKey="s9"
          title={pt.stepTitles.s9}
          isOpen={expandedSteps.s9}
          onToggle={toggleStep}
          toneClass="border-emerald-300 bg-emerald-50/70"
        >
          <div className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-base font-bold text-emerald-800 shadow-xs">
            {qContent.finalAnswer}
          </div>
        </CollapsibleStepCard>

        <CollapsibleStepCard
          stepKey="s10"
          title={pt.stepTitles.s10}
          isOpen={expandedSteps.s10}
          onToggle={toggleStep}
          toneClass="border-slate-200 bg-slate-50/70"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {cfg.svgPrimary ? (
              <>
                {diagramPanel}
                {model3DPanel}
              </>
            ) : (
              <>
                {model3DPanel}
                {diagramPanel}
              </>
            )}
          </div>
        </CollapsibleStepCard>
      </div>

      {/* Bottom Question Navigation Footer */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">
          {pt.progressPrefix} {questionIdx + 1} / {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={questionIdx === 0}
            onClick={() => selectQuestion(questionIdx - 1)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← {pt.previousButton}
          </button>
          <button
            type="button"
            disabled={questionIdx === totalQuestions - 1}
            onClick={() => selectQuestion(questionIdx + 1)}
            className="rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {pt.nextButton} →
          </button>
        </div>
      </div>
    </main>
  )
}
