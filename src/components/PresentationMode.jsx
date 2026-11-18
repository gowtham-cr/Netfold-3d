import { useMemo, useState } from 'react'
import {
  FIFTEEN_JURY_QA,
  FIVE_MINUTE_DEMO_SCRIPT,
  PROJECT_DEFENSE_DOSSIER,
} from '../data/finalRoundDefenseData.js'
import { REALITY_CHALLENGES, computeRealityMetrics, normalizeForCanvas3D } from '../data/realityObjects.js'
import { diagnoseMistake, selectTargetedRemediationQuestions } from '../utils/mistakeDetective.js'
import {
  buildStudentAnalytics,
  summarizeMistakesAndImprovement,
} from '../utils/analyticsEngine.js'
import { currentTimestampMs } from '../utils/profileStorage.js'
import { SHAPES } from '../utils/mathEngine.js'
import { TRANSLATIONS } from '../data/translations.js'
import Canvas3D from './Canvas3D.jsx'
import { HorizontalBarChart } from './analytics/AnalyticsCharts.jsx'
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from './common/UiIcons.jsx'

const STEP_IDS = ['s1', 's2', 's3', 's4', 's5', 's6']

export default function PresentationMode({
  language = 'en',
  translations: propTranslations,
  theme = 'light',
  profileData,
  learningProgress,
  missionsProgress,
  onLogDiagnosedMistake,
  onRecordPyqAttempt,
  onRecordRemediationSession,
  onNavigateToTab,
}) {
  const t = propTranslations || TRANSLATIONS[language] || TRANSLATIONS.en
  const pu = t.presentationUi
  const mu = t.mistakeUi
  const ru = t.realityUi
  const isDark = theme === 'dark'

  const [stepIdx, setStepIdx] = useState(0)
  const [radius, setRadius] = useState(3)
  const [height, setHeight] = useState(5)
  const [foldProgress, setFoldProgress] = useState(65)
  const [nowMs] = useState(() => Date.now())

  // Step 3 -> 4 demo state
  const demoChallenge = REALITY_CHALLENGES[3] // Diameter 6 m, h 5 m tank TSA
  const [pickedOption, setPickedOption] = useState(null)
  const [diagnosis, setDiagnosis] = useState(null)

  // Step 5 3-question remediation drill state
  const [drillAnswers, setDrillAnswers] = useState({})
  const [drillDone, setDrillDone] = useState(false)

  const metrics = useMemo(
    () =>
      computeRealityMetrics({
        shape: SHAPES.CYLINDER,
        dimensions: { r: radius, h: height },
        unit: 'm',
      }),
    [radius, height],
  )

  const canvasDims = useMemo(
    () => normalizeForCanvas3D(SHAPES.CYLINDER, { r: radius, h: height }),
    [radius, height],
  )

  const activeCategory = diagnosis?.category ?? 'radius_diameter'
  const targetedQuestions = useMemo(
    () => selectTargetedRemediationQuestions(activeCategory, 'cylinder', 3),
    [activeCategory],
  )

  const mistakeSummary = useMemo(
    () => summarizeMistakesAndImprovement(profileData, 'all', nowMs),
    [profileData, nowMs],
  )

  const studentAnalytics = useMemo(
    () =>
      buildStudentAnalytics({
        profileData,
        learningProgress,
        missionsProgress,
        rangeKey: 'all',
        nowMs,
      }),
    [profileData, learningProgress, missionsProgress, nowMs],
  )

  const triggerChallengeOption = (optIdx, advanceToDiagnosis = false) => {
    setPickedOption(optIdx)
    const isCorrect = optIdx === demoChallenge.correctIndex
    const ts = currentTimestampMs()
    if (onRecordPyqAttempt) {
      onRecordPyqAttempt({
        questionId: demoChallenge.id,
        exam: 'general_aptitude',
        topic: demoChallenge.topic,
        difficulty: 'medium',
        authenticity: 'pyq_style_practice',
        correct: isCorrect,
        timeSpentSec: 18,
        timestamp: ts,
      })
    }

    if (!isCorrect) {
      const diag = diagnoseMistake({
        question: demoChallenge,
        wrongOptionIndex: optIdx,
        questionSource: 'presentation_demo',
      })
      setDiagnosis(diag)
      if (onLogDiagnosedMistake && diag) {
        onLogDiagnosedMistake({ ...diag, timestamp: ts })
      }
      if (advanceToDiagnosis) {
        setStepIdx(3)
      }
    } else {
      setDiagnosis(null)
    }
  }

  const handleAnswerDrill = (q, optIdx) => {
    const next = { ...drillAnswers, [q.id]: optIdx }
    setDrillAnswers(next)

    if (Object.keys(next).length === targetedQuestions.length && !drillDone) {
      const correctCount = targetedQuestions.filter(
        (dq) => next[dq.id] === dq.correctIndex,
      ).length
      const afterAcc = Math.round((correctCount / targetedQuestions.length) * 100)
      setDrillDone(true)

      const ts = currentTimestampMs()
      if (onRecordRemediationSession) {
        onRecordRemediationSession(
          {
            id: `pres_rem_${ts}`,
            mistakeCategory: activeCategory,
            topic: 'cylinder',
            beforeAccuracy: 0,
            afterAccuracy: afterAcc,
            score: correctCount,
            total: targetedQuestions.length,
            timestamp: ts,
          },
          targetedQuestions.map((dq) => ({
            questionId: dq.id,
            exam: 'general_aptitude',
            topic: dq.topic,
            difficulty: 'medium',
            authenticity: 'pyq_style_practice',
            correct: next[dq.id] === dq.correctIndex,
            timeSpentSec: 16,
            timestamp: ts,
          })),
        )
      }
    }
  }

  const handleRestartDemo = () => {
    setStepIdx(0)
    setRadius(3)
    setHeight(5)
    setFoldProgress(65)
    setPickedOption(null)
    setDiagnosis(null)
    setDrillAnswers({})
    setDrillDone(false)
  }

  const drillCorrectCount = targetedQuestions.filter(
    (dq) => drillAnswers[dq.id] === dq.correctIndex,
  ).length

  const surfaceCls = isDark
    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900'

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header & Stepper */}
      <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-900">
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              {pu.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{pu.title}</h2>
            <p className={`text-sm max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {pu.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRestartDemo}
            className="inline-flex items-center gap-1.5 self-start lg:self-auto rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {pu.restartDemo}
          </button>
        </div>

        {/* 6-Step Guided Timeline */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-t border-slate-200/70 pt-4">
          {STEP_IDS.map((sid, idx) => {
            const active = stepIdx === idx
            const done = idx < stepIdx
            return (
              <button
                key={sid}
                type="button"
                onClick={() => setStepIdx(idx)}
                className={`rounded-xl border p-2.5 text-left transition-all ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : done
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <p className="text-[10px] font-extrabold uppercase opacity-80">
                  {pu.stepPrefix} {idx + 1}
                </p>
                <p className="mt-0.5 text-xs font-bold leading-snug">
                  {pu.steps[sid].title}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Active Stage Content */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm text-slate-900 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-indigo-950">
              {pu.steps[STEP_IDS[stepIdx]].title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {pu.steps[STEP_IDS[stepIdx]].desc}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={stepIdx <= 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              {pu.prevStep}
            </button>
            <button
              type="button"
              disabled={stepIdx >= 5}
              onClick={() => setStepIdx((i) => Math.min(5, i + 1))}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-indigo-700 disabled:opacity-40"
            >
              {pu.nextStep}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* STEP 1 & 2: Real-World Tank -> 3D + Net */}
        {(stepIdx === 0 || stepIdx === 1) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                <p className="text-xs font-extrabold uppercase text-emerald-900">
                  🛢️ {ru.presets.water_tank.name} ({ru.confirmedBadge})
                </p>
                <p className="text-xs text-emerald-950">
                  Cylinder: r = {radius} m (Diameter d = {radius * 2} m), Height h = {height} m
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <label className="flex justify-between text-xs font-bold">
                    <span>{ru.dimLabels.r} (m)</span>
                    <span className="font-mono">{radius} m</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold">
                    <span>{ru.dimLabels.h} (m)</span>
                    <span className="font-mono">{height} m</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-indigo-900">
                    <span>{ru.foldLabel}</span>
                    <span className="font-mono">{foldProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={foldProgress}
                    onChange={(e) => setFoldProgress(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                  <p className="text-[11px] font-bold text-cyan-900">
                    {ru.waterCapacityLabel}
                  </p>
                  <p className="text-lg font-black font-mono text-cyan-800">
                    {Math.round(metrics.capacityLitres).toLocaleString()} L
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[11px] font-bold text-amber-900">
                    TSA ({metrics.formulaTsa})
                  </p>
                  <p className="text-lg font-black font-mono text-amber-900">
                    {metrics.tsa.toFixed(2)} m²
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden h-80 sm:h-96">
              <Canvas3D
                shape={SHAPES.CYLINDER}
                foldProgress={foldProgress}
                dimensions={canvasDims}
                highlightMode="tsa"
                translations={t}
                inlineScrollMode
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Trigger Wrong Answer */}
        {stepIdx === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {demoChallenge.question}
              </p>
              <button
                type="button"
                onClick={() => triggerChallengeOption(2, true)}
                className="rounded-xl bg-rose-600 text-white px-4 py-2 text-xs sm:text-sm font-extrabold hover:bg-rose-700 shadow-sm"
              >
                {pu.trapButton}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoChallenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerChallengeOption(idx, false)}
                  className={`rounded-xl border px-4 py-3 text-left text-xs sm:text-sm font-bold transition-colors ${
                    pickedOption === idx
                      ? idx === demoChallenge.correctIndex
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-rose-500 bg-rose-50 text-rose-900'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <strong className="mr-2 font-mono">
                    {String.fromCharCode(65 + idx)}.
                  </strong>
                  {opt}
                </button>
              ))}
            </div>

            {pickedOption !== null && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                {pickedOption === demoChallenge.correctIndex ? (
                  <p className="text-xs font-bold text-emerald-800">{pu.solvedRightNotice}</p>
                ) : (
                  <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    {mu.youAnswered}: {demoChallenge.options[pickedOption]} → {mu.categories[diagnosis?.category || 'radius_diameter']}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStepIdx(3)}
                  className="rounded-xl bg-rose-600 text-white px-4 py-2 text-xs font-bold hover:bg-rose-700"
                >
                  {pu.goToStep4}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Instant Mistake Detective Reveal */}
        {stepIdx === 3 && (
          <div className="space-y-4">
            {(() => {
              const shownDiag =
                diagnosis ||
                diagnoseMistake({
                  question: demoChallenge,
                  wrongOptionIndex: 2,
                  questionSource: 'presentation_demo',
                })
              return (
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-xl bg-rose-600 text-white px-3 py-1 text-xs font-extrabold">
                      <Target className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                      {mu.categories[shownDiag.category]}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStepIdx(4)}
                      className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700"
                    >
                      {pu.goToStep5}
                    </button>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
                    <h4 className="text-xs font-extrabold uppercase text-amber-900">
                      {mu.whyWrongHeading}
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-950">
                      {mu.explanations[shownDiag.category]}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1">
                    <h4 className="text-xs font-extrabold uppercase text-emerald-900">
                      {mu.correctedStepsHeading} ({shownDiag.formulaUsed})
                    </h4>
                    <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm text-emerald-950">
                      {shownDiag.correctedSteps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* STEP 5: Solve 3 Targeted Questions */}
        {stepIdx === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-900">
                {mu.drillTitle} · {drillCorrectCount} / {targetedQuestions.length}
              </span>
              {drillDone && (
                <button
                  type="button"
                  onClick={() => setStepIdx(5)}
                  className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700"
                >
                  {pu.goToStep6}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              {targetedQuestions.map((dq, idx) => {
                const picked = drillAnswers[dq.id]
                const isAnswered = Number.isInteger(picked)
                return (
                  <div
                    key={dq.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                  >
                    <p className="text-xs font-bold text-slate-900">
                      Q{idx + 1}. {dq.question}
                    </p>
                    <div className="space-y-1.5">
                      {dq.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleAnswerDrill(dq, oIdx)}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                            isAnswered
                              ? oIdx === dq.correctIndex
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-extrabold'
                                : picked === oIdx
                                  ? 'border-rose-400 bg-rose-50 text-rose-900'
                                  : 'border-slate-200 bg-white text-slate-400'
                              : 'border-slate-200 bg-white hover:bg-indigo-50 text-slate-800'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </button>
                      ))}
                    </div>
                    {isAnswered && (
                      <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        {picked === dq.correctIndex ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                        )}
                        {dq.formulaUsed}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {!drillDone && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStepIdx(5)}
                  className="rounded-xl border border-indigo-300 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-800"
                >
                  {pu.goToStep6}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Live Analytics Improvement Reveal */}
        {stepIdx === 5 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase text-emerald-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  {pu.beforeAfterLabel}
                </p>
                <p className="text-sm font-black text-emerald-950">
                  {mistakeSummary.remediationCount > 0
                    ? `${mu.beforeLabel}: ${mistakeSummary.avgBeforeAcc}% → ${mu.afterLabel}: ${mistakeSummary.avgAfterAcc}% (+${mistakeSummary.improvementGain}%)`
                    : `${studentAnalytics.attemptedCount} recorded attempts · ${studentAnalytics.accuracyPct}% overall accuracy`}
                </p>
              </div>

              {onNavigateToTab && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('hub')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700"
                  >
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    {pu.openFullDashboard}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('mistake_detective')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 text-white px-4 py-2 text-xs font-bold hover:bg-rose-700"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    {t.extraNavTabs.mistake_detective}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <HorizontalBarChart
                title={mu.improvementCardTitle}
                maxValue={100}
                emptyMessage={mu.noActiveDiagnosisBody}
                items={
                  mistakeSummary.remediationCount > 0
                    ? [
                        {
                          id: 'before',
                          label: mu.beforeLabel,
                          value: mistakeSummary.avgBeforeAcc ?? 0,
                          displayRight: `${mistakeSummary.avgBeforeAcc ?? 0}%`,
                          colorClass: 'bg-rose-500',
                        },
                        {
                          id: 'after',
                          label: mu.afterLabel,
                          value: mistakeSummary.avgAfterAcc ?? 0,
                          displayRight: `${mistakeSummary.avgAfterAcc ?? 0}%`,
                          colorClass: 'bg-emerald-500',
                        },
                      ]
                    : []
                }
              />

              <HorizontalBarChart
                title={mu.categoryBarTitle}
                maxValue={Math.max(1, ...mistakeSummary.rankedCategories.map((c) => c.count))}
                emptyMessage={mu.emptyMistakeHistory}
                items={mistakeSummary.rankedCategories
                  .filter((c) => c.count > 0)
                  .map((c) => ({
                    id: c.category,
                    label: mu.categories[c.category],
                    value: c.count,
                    displayRight: String(c.count),
                    colorClass: 'bg-amber-500',
                  }))}
              />
            </div>
          </div>
        )}
      </section>

      {/* OFFICIAL 5-MINUTE FINAL-ROUND DEMO TIMELINE (0:00 - 5:00) */}
      <section
        className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-extrabold text-white">
              Criterion 5 · Official 5-Minute Walkthrough
            </span>
            <h2 className="mt-1 text-lg font-extrabold">
              ⏱️ 5-Minute Final Round Demonstration Script (0:00–5:00)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FIVE_MINUTE_DEMO_SCRIPT.map((seg) => (
            <div
              key={seg.id}
              className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/70'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-extrabold text-cyan-300">
                    {seg.timeRange}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {seg.criterionTag}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold">{seg.title}</h3>
                <p className="text-xs opacity-85">{seg.summary}</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-80">
                  {seg.talkingPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab(seg.targetTab)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer self-start"
                >
                  Open {seg.targetTab.replace(/_/g, ' ')} →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* COMPLETE 16-SECTION PROJECT DEFENSE DOSSIER */}
      <section
        className={`rounded-2xl border p-5 shadow-sm space-y-5 ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <h2 className="text-lg font-extrabold">
          📋 Final-Round Project Defense Dossier (16 Official Sections)
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1">
            <h3 className="text-xs font-extrabold uppercase text-indigo-600">
              1. Project Introduction
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              {PROJECT_DEFENSE_DOSSIER.introduction}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1">
            <h3 className="text-xs font-extrabold uppercase text-rose-600">
              2. Problem Statement
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              {PROJECT_DEFENSE_DOSSIER.problemStatement}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1">
            <h3 className="text-xs font-extrabold uppercase text-emerald-600">
              3. Proposed Solution
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              {PROJECT_DEFENSE_DOSSIER.proposedSolution}
            </p>
          </div>
        </div>

        {/* 5. Existing vs Proposed Comparison Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase">
            5. Existing System vs Proposed NetFold 3D System
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead
                className={
                  isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                }
              >
                <tr>
                  <th className="px-3 py-2 font-extrabold">Dimension</th>
                  <th className="px-3 py-2 font-extrabold">Existing System</th>
                  <th className="px-3 py-2 font-extrabold">Proposed NetFold 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {PROJECT_DEFENSE_DOSSIER.comparisonRows.map((row) => (
                  <tr key={row.aspect}>
                    <td className="px-3 py-2 font-bold">{row.aspect}</td>
                    <td className="px-3 py-2 opacity-80">{row.existing}</td>
                    <td className="px-3 py-2 font-semibold text-indigo-700 dark:text-indigo-300">
                      {row.proposed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase">4. Core Objectives</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              {PROJECT_DEFENSE_DOSSIER.objectives.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase">6. System Architecture</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              {PROJECT_DEFENSE_DOSSIER.architectureLayers.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase">7. Technology Stack</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              {PROJECT_DEFENSE_DOSSIER.techStack.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase">
              8 &amp; 9. Main Innovations &amp; Real-World Applications
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              {PROJECT_DEFENSE_DOSSIER.mainInnovations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase">
              10 &amp; 11. Target Users, Accessibility &amp; Inclusivity
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              {PROJECT_DEFENSE_DOSSIER.accessibilityAndInclusivity.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase text-amber-900 dark:text-amber-300">
              12 &amp; 13. Technical Limitations &amp; Future Scope
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              {PROJECT_DEFENSE_DOSSIER.technicalLimitations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 space-y-1">
          <h3 className="text-xs font-extrabold uppercase text-indigo-800 dark:text-indigo-300">
            16. What Is Genuinely New About NetFold 3D
          </h3>
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            {PROJECT_DEFENSE_DOSSIER.genuinelyNewExplanation}
          </p>
        </div>
      </section>

      {/* 14 & 15. FIFTEEN LIKELY JURY QUESTIONS & TECHNICAL ANSWERS */}
      <section
        className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <h2 className="text-lg font-extrabold">
          🎤 15 Likely Jury Questions &amp; Confident Technical Answers
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {FIFTEEN_JURY_QA.map((item) => (
            <div
              key={item.q}
              className={`rounded-xl border p-3.5 space-y-1.5 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/60'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {item.q}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
