import { useMemo, useState } from 'react'
import {
  MISTAKE_CATEGORIES,
  diagnoseMistake,
  selectTargetedRemediationQuestions,
} from '../utils/mistakeDetective.js'
import { REMEDIATION_QUESTIONS } from '../data/remediationQuestions.js'
import { summarizeMistakesAndImprovement } from '../utils/analyticsEngine.js'
import { currentTimestampMs } from '../utils/profileStorage.js'
import { TRANSLATIONS } from '../data/translations.js'
import { HorizontalBarChart } from './analytics/AnalyticsCharts.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Flame,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from './common/UiIcons.jsx'

const SAMPLE_TRAPS = [
  REMEDIATION_QUESTIONS.find((q) => q.id === 'rem_rd_1'),
  REMEDIATION_QUESTIONS.find((q) => q.id === 'rem_csa_tsa_1'),
  REMEDIATION_QUESTIONS.find((q) => q.id === 'rem_form_1'),
  REMEDIATION_QUESTIONS.find((q) => q.id === 'rem_unit_1'),
].filter(Boolean)

function topicTitle(t, tp) {
  return t.pyqUi?.topics?.[tp] || t.shapes?.[tp] || tp.replace(/_/g, ' ')
}

function heatCellClass(count) {
  if (count === 0) return 'bg-slate-50 text-slate-300 border-slate-200'
  if (count === 1) return 'bg-amber-100 text-amber-900 border-amber-300'
  if (count === 2) return 'bg-orange-200 text-orange-950 border-orange-400'
  return 'bg-rose-500 text-white border-rose-600'
}

export default function MistakeDetective({
  language = 'en',
  translations: propTranslations,
  theme = 'light',
  profileData,
  initialDiagnosis = null,
  onLogDiagnosedMistake,
  onRecordRemediationSession,
  onNavigateToTab,
}) {
  const t = propTranslations || TRANSLATIONS[language] || TRANSLATIONS.en
  const mu = t.mistakeUi
  const isDark = theme === 'dark'

  const [subTab, setSubTab] = useState('coach') // 'coach' | 'heatmap'
  const [activeDiagnosis, setActiveDiagnosis] = useState(initialDiagnosis)
  const [nowMs] = useState(() => Date.now())

  // 3-question targeted drill state
  const [drillQuestions, setDrillQuestions] = useState(() =>
    initialDiagnosis
      ? selectTargetedRemediationQuestions(
          initialDiagnosis.category,
          initialDiagnosis.topic,
          3,
        )
      : [],
  )
  const [drillOpen, setDrillOpen] = useState(Boolean(initialDiagnosis))
  const [drillAnswers, setDrillAnswers] = useState({})
  const [drillChecked, setDrillChecked] = useState({})
  const [drillCompleted, setDrillCompleted] = useState(false)

  const summary = useMemo(
    () => summarizeMistakesAndImprovement(profileData, 'all', nowMs),
    [profileData, nowMs],
  )

  const launchCoachForDiagnosis = (diagnosis, shouldLog = false) => {
    if (!diagnosis) return
    setActiveDiagnosis(diagnosis)
    const targeted = selectTargetedRemediationQuestions(
      diagnosis.category,
      diagnosis.topic,
      3,
    )
    setDrillQuestions(targeted)
    setDrillAnswers({})
    setDrillChecked({})
    setDrillCompleted(false)
    setDrillOpen(true)
    setSubTab('coach')
    if (shouldLog && onLogDiagnosedMistake) {
      onLogDiagnosedMistake({
        ...diagnosis,
        timestamp: currentTimestampMs(),
      })
    }
  }

  const handleSimulateSampleTrap = (sampleQ) => {
    const diag = diagnoseMistake({
      question: sampleQ,
      wrongOptionIndex: 1, // Deliberate trap option
      questionSource: 'mistake_detective_sample',
    })
    launchCoachForDiagnosis(diag, true)
  }

  const handleCheckDrillQuestion = (q, optIdx) => {
    setDrillAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
    const isCorrect = optIdx === q.correctIndex
    const nextChecked = { ...drillChecked, [q.id]: { picked: optIdx, isCorrect } }
    setDrillChecked(nextChecked)

    const answeredCount = Object.keys(nextChecked).length
    if (answeredCount === drillQuestions.length && !drillCompleted && activeDiagnosis) {
      const correctCount = Object.values(nextChecked).filter((r) => r.isCorrect).length
      const afterAcc = Math.round((correctCount / drillQuestions.length) * 100)
      setDrillCompleted(true)
      const ts = currentTimestampMs()
      if (onRecordRemediationSession) {
        onRecordRemediationSession(
          {
            id: `rem_${ts}`,
            mistakeCategory: activeDiagnosis.category,
            topic: activeDiagnosis.topic,
            beforeAccuracy: 0, // Failed trigger item = 0% on that attempt
            afterAccuracy: afterAcc,
            score: correctCount,
            total: drillQuestions.length,
            timestamp: ts,
          },
          drillQuestions.map((dq) => ({
            questionId: dq.id,
            exam: 'general_aptitude',
            topic: dq.topic,
            difficulty: 'medium',
            authenticity: 'pyq_style_practice',
            correct: Boolean(nextChecked[dq.id]?.isCorrect),
            timeSpentSec: 20,
            timestamp: ts,
          })),
        )
      }
    }
  }

  const handleStartPriorityDrill = (category, topic) => {
    const targeted = selectTargetedRemediationQuestions(category, topic, 3)
    setActiveDiagnosis({
      id: `prio_${category}`,
      questionId: 'priority_revision',
      source: 'heatmap_recommendation',
      topic: topic || 'cylinder',
      category,
      matchConfidence: 'pattern_rule',
      wrongDisplay: `${summary.byCategory[category] || 0}×`,
      expectedDisplay: mu.categories[category],
      formulaUsed: targeted[0]?.formulaUsed || '',
      correctedSteps: targeted[0]?.solutionSteps || [],
    })
    setDrillQuestions(targeted)
    setDrillAnswers({})
    setDrillChecked({})
    setDrillCompleted(false)
    setDrillOpen(true)
    setSubTab('coach')
  }

  const surfaceCls = isDark
    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900'

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header Banner */}
      <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-900">
              <Target className="w-3.5 h-3.5" aria-hidden="true" />
              {mu.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{mu.title}</h2>
            <p className={`text-sm max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {mu.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start lg:self-auto" role="tablist">
            {[
              { id: 'coach', label: mu.tabs.coach, Icon: Sparkles },
              {
                id: 'heatmap',
                label: `${mu.tabs.heatmap} (${summary.totalMistakes})`,
                Icon: BarChart3,
              },
            ].map(({ id, label, Icon }) => {
              const active = subTab === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSubTab(id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2.5 text-xs font-semibold text-indigo-950 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-700" aria-hidden="true" />
          <span>{mu.engineNotice}</span>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TAB 1: ACTIVE DIAGNOSIS & 3-QUESTION TARGETED COACH              */}
      {/* ================================================================ */}
      {subTab === 'coach' && (
        <div className="space-y-5">
          {/* Sample Trap Simulator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-900 space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {mu.trySampleTitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {SAMPLE_TRAPS.map((trap) => (
                <button
                  key={trap.id}
                  type="button"
                  onClick={() => handleSimulateSampleTrap(trap)}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 p-3 text-left transition-colors"
                >
                  <span className="inline-block rounded bg-rose-100 text-rose-900 px-1.5 py-0.5 text-[10px] font-extrabold">
                    {mu.categories[trap.mistakeCategory]}
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-2">
                    {trap.question}
                  </p>
                  <p className="mt-1.5 text-[11px] font-extrabold text-indigo-700">
                    {mu.sampleTrapBtn} →
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Empty or Active Diagnosis Card */}
          {!activeDiagnosis ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-700 space-y-2">
              <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <h3 className="text-base font-extrabold">{mu.noActiveDiagnosisTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {mu.noActiveDiagnosisBody}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <article className="rounded-2xl border border-rose-200 bg-white p-5 sm:p-6 shadow-sm text-slate-900 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-rose-600 text-white px-3 py-1 text-xs font-extrabold">
                      {mu.categories[activeDiagnosis.category]}
                    </span>
                    <span className="rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      {mu.confidenceLabel}:{' '}
                      {mu.confidenceTypes[activeDiagnosis.matchConfidence] ||
                        activeDiagnosis.matchConfidence}
                    </span>
                    <span className="rounded-xl bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-[11px] font-bold text-cyan-900">
                      {topicTitle(t, activeDiagnosis.topic)}
                    </span>
                  </div>

                  {!drillOpen && (
                    <button
                      type="button"
                      onClick={() => launchCoachForDiagnosis(activeDiagnosis, false)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-indigo-700"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      {mu.startDrillBtn}
                    </button>
                  )}
                </div>

                {activeDiagnosis.questionText && (
                  <p className="text-sm font-bold text-slate-900">
                    {activeDiagnosis.questionText}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
                    <p className="text-[11px] font-extrabold uppercase text-rose-800">
                      {mu.youAnswered}
                    </p>
                    <p className="mt-0.5 text-sm font-black font-mono text-rose-950">
                      {activeDiagnosis.wrongDisplay}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                    <p className="text-[11px] font-extrabold uppercase text-emerald-800">
                      {mu.correctAnswer}
                    </p>
                    <p className="mt-0.5 text-sm font-black font-mono text-emerald-950">
                      {activeDiagnosis.expectedDisplay}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                      {mu.whyWrongHeading}
                    </h4>
                    <SpeakControlsBar
                      compact
                      text={`${mu.categories[activeDiagnosis.category]}. ${mu.explanations[activeDiagnosis.category]}. ${(activeDiagnosis.correctedSteps ?? []).join(' ')}`}
                      language={language}
                      sourceId={`mistake_${activeDiagnosis.id}`}
                      isDark={false}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                    {mu.explanations[activeDiagnosis.category]}
                  </p>
                </div>

                {activeDiagnosis.correctedSteps?.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
                      {mu.correctedStepsHeading} ({activeDiagnosis.formulaUsed})
                    </h4>
                    <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm text-emerald-950">
                      {activeDiagnosis.correctedSteps.map((st, idx) => (
                        <li key={idx}>{st}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>

              {/* 3-Question Targeted Practice Drill */}
              {drillOpen && drillQuestions.length > 0 && (
                <section className="rounded-2xl border border-indigo-200 bg-white p-5 sm:p-6 shadow-sm text-slate-900 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-indigo-950">
                      {mu.drillTitle}
                    </h3>
                    <span className="rounded-xl bg-indigo-100 px-3 py-1 font-mono text-xs font-extrabold text-indigo-900">
                      {Object.values(drillChecked).filter((c) => c.isCorrect).length} /{' '}
                      {drillQuestions.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {drillQuestions.map((dq, qIdx) => {
                      const chosen = drillAnswers[dq.id]
                      const checked = drillChecked[dq.id]
                      return (
                        <div
                          key={dq.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                        >
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            Q{qIdx + 1}. {dq.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {dq.options.map((opt, oIdx) => {
                              const picked = chosen === oIdx
                              const cls = checked
                                ? oIdx === dq.correctIndex
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-extrabold'
                                  : picked
                                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                                    : 'border-slate-200 bg-white text-slate-500'
                                : 'border-slate-200 bg-white text-slate-800 hover:bg-indigo-50 hover:border-indigo-300'
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  disabled={Boolean(checked)}
                                  onClick={() => handleCheckDrillQuestion(dq, oIdx)}
                                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${cls}`}
                                >
                                  <strong className="mr-1.5 font-mono">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </strong>
                                  {opt}
                                </button>
                              )
                            })}
                          </div>

                          {checked && (
                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1">
                              <p
                                className={`font-extrabold flex items-center gap-1 ${
                                  checked.isCorrect
                                    ? 'text-emerald-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {checked.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                ) : (
                                  <XCircle className="w-4 h-4" aria-hidden="true" />
                                )}
                                {dq.formulaUsed}
                              </p>
                              <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                                {dq.solutionSteps.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {drillCompleted && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                          {mu.drillCompleteTitle}
                        </h4>
                        <p className="text-xs text-emerald-900 mt-0.5">
                          {mu.drillImprovementSummary} ({mu.beforeLabel}: 0% → {mu.afterLabel}:{' '}
                          {summary.latestSession?.afterAccuracy ??
                            Math.round(
                              (Object.values(drillChecked).filter((c) => c.isCorrect).length /
                                drillQuestions.length) *
                                100,
                            )}
                          %)
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSubTab('heatmap')}
                          className="rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-emerald-700"
                        >
                          {mu.tabs.heatmap}
                        </button>
                        {onNavigateToTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateToTab('hub')}
                            className="rounded-xl border border-emerald-300 bg-white text-emerald-900 px-3.5 py-2 text-xs font-bold hover:bg-emerald-100"
                          >
                            {t.navTabs.hub}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: MISTAKE HEATMAP, TOPIC WEAKNESS & IMPROVEMENT TRACKER     */}
      {/* ================================================================ */}
      {subTab === 'heatmap' && (
        <div className="space-y-5">
          {/* Before vs After Improvement Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-900">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                {mu.improvementCardTitle}
              </p>
              {summary.remediationCount === 0 ? (
                <p className="mt-2 text-xs text-slate-500">{mu.noActiveDiagnosisBody}</p>
              ) : (
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-lg font-bold font-mono text-rose-600">
                    {summary.avgBeforeAcc}%
                  </span>
                  <span className="text-slate-400 font-bold">→</span>
                  <span className="text-2xl font-black font-mono text-emerald-600">
                    {summary.avgAfterAcc}%
                  </span>
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800">
                    +{summary.improvementGain}% ({summary.remediationCount})
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm text-slate-900 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-950 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" aria-hidden="true" />
                {mu.recommendedRevisionTitle}
              </h4>
              {!summary.topWeakCategory ? (
                <p className="text-xs text-amber-900">{mu.emptyMistakeHistory}</p>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-bold text-amber-950">
                    {mu.categories[summary.topWeakCategory]} (
                    {summary.byCategory[summary.topWeakCategory]}×)
                    {summary.weaknessByTopic[0] &&
                      ` · ${topicTitle(t, summary.weaknessByTopic[0].topic)}`}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleStartPriorityDrill(
                        summary.topWeakCategory,
                        summary.weaknessByTopic[0]?.topic,
                      )
                    }
                    className="rounded-xl bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-amber-700"
                  >
                    {mu.startDrillBtn}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mistake Heatmap Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 overflow-x-auto space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
              {mu.heatmapTitle}
            </h4>
            {summary.heatmapRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500">
                {mu.emptyMistakeHistory}
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[660px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-extrabold text-[11px]">
                    <th className="py-2 pr-3">{t.pyqUi.filters.topicLabel}</th>
                    {MISTAKE_CATEGORIES.map((cat) => (
                      <th key={cat} className="py-2 px-1.5 text-center">
                        {mu.categories[cat].split(' ')[0]}
                      </th>
                    ))}
                    <th className="py-2 pl-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.heatmapRows.map((row) => (
                    <tr key={row.topic}>
                      <td className="py-2 pr-3 font-bold text-slate-800">
                        {topicTitle(t, row.topic)}
                      </td>
                      {MISTAKE_CATEGORIES.map((cat) => {
                        const c = row.cells[cat] ?? 0
                        return (
                          <td key={cat} className="py-2 px-1.5 text-center font-mono">
                            <span
                              className={`inline-block min-w-[28px] rounded border px-1.5 py-0.5 font-extrabold ${heatCellClass(
                                c,
                              )}`}
                            >
                              {c}
                            </span>
                          </td>
                        )
                      })}
                      <td className="py-2 pl-2 text-right font-mono font-extrabold text-rose-700">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mistake Category Bar + Topic Weakness Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HorizontalBarChart
              title={mu.categoryBarTitle}
              maxValue={Math.max(1, ...summary.rankedCategories.map((c) => c.count))}
              emptyMessage={mu.emptyMistakeHistory}
              items={summary.rankedCategories
                .filter((c) => c.count > 0)
                .map((c) => ({
                  id: c.category,
                  label: mu.categories[c.category],
                  value: c.count,
                  displayRight: String(c.count),
                  colorClass: 'bg-rose-500',
                }))}
            />
            <HorizontalBarChart
              title={mu.topicBarTitle}
              maxValue={Math.max(1, ...summary.weaknessByTopic.map((w) => w.count))}
              emptyMessage={mu.emptyMistakeHistory}
              items={summary.weaknessByTopic.map((w) => ({
                id: w.topic,
                label: topicTitle(t, w.topic),
                value: w.count,
                displayRight: String(w.count),
                colorClass: 'bg-amber-500',
              }))}
            />
          </div>
        </div>
      )}
    </div>
  )
}
