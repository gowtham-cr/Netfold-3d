import { useMemo, useState } from 'react'
import Canvas3D from './Canvas3D.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import ShapeThumbSvg from './ShapeThumbSvg.jsx'
import {
  LEARNING_PATHS_COPY,
  LEARNING_PATH_STEPS,
  PATH_AUDIENCES,
  PATH_LEVELS,
  recommendNextPathStep,
} from '../data/learningPaths.js'

/**
 * Smart Learning Paths module providing structured Beginner, Intermediate, and Advanced
 * curriculum tracks for Student, Teacher, and Competitive Exam audiences across all 5 languages.
 */
export default function SmartLearningPaths({
  language,
  translations: t,
  theme = 'light',
  defaultAudience = 'student',
  completedStepIds = [],
  weakTopics = [],
  onToggleStepComplete,
  onLaunchTarget,
}) {
  const pu = t.pathsUi
  const ea = t.examArena
  const au = t.audience
  const copyMap = LEARNING_PATHS_COPY[language] ?? LEARNING_PATHS_COPY.en

  const [selectedAudience, setSelectedAudience] = useState(() =>
    PATH_AUDIENCES.includes(defaultAudience) ? defaultAudience : 'student',
  )
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [active3DStepId, setActive3DStepId] = useState(null)

  const recommendation = useMemo(
    () => recommendNextPathStep(selectedAudience, completedStepIds, weakTopics),
    [selectedAudience, completedStepIds, weakTopics],
  )

  const visibleSteps = useMemo(
    () =>
      LEARNING_PATH_STEPS.filter(
        (step) =>
          step.audience === selectedAudience &&
          (selectedLevel === 'all' || step.level === selectedLevel),
      ),
    [selectedAudience, selectedLevel],
  )

  const pct =
    recommendation.totalCount > 0
      ? Math.round((recommendation.completedCount / recommendation.totalCount) * 100)
      : 0

  const recStep = recommendation.step
  const recCopy = copyMap[recStep.id] ?? LEARNING_PATHS_COPY.en[recStep.id]
  const reasonText =
    recommendation.reasonType === 'weak_topic_remediation'
      ? pu.reasonWeakTopic
      : recommendation.reasonType === 'all_completed'
        ? pu.reasonAllDone
        : pu.reasonSequence

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 space-y-5">
      {/* Header + Path Switcher + Level Filter */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {pu.headerTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
              {pu.headerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800">
              {pu.progressLabel}: {recommendation.completedCount} /{' '}
              {recommendation.totalCount} ({pct}%)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Student / Teacher / Exam Paths */}
          <div
            role="tablist"
            aria-label={au.label}
            className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200"
          >
            {PATH_AUDIENCES.map((aud) => {
              const active = selectedAudience === aud
              return (
                <button
                  key={aud}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedAudience(aud)
                    setActive3DStepId(null)
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  {au[aud]}
                </button>
              )
            })}
          </div>

          {/* Beginner / Intermediate / Advanced Filter */}
          <div className="flex flex-wrap gap-1.5">
            {['all', ...PATH_LEVELS].map((lvl) => {
              const active = selectedLevel === lvl
              return (
                <button
                  key={lvl}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {pu.levels[lvl]}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recommended Next Step Banner */}
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4 sm:p-5 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
              ★ {pu.recommendedHeading}
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {recCopy.title}
            </h3>
            <p className="text-xs font-medium text-indigo-800">{reasonText}</p>
          </div>
          <button
            type="button"
            onClick={() => onLaunchTarget(recStep)}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            {pu.openLabButton} →
          </button>
        </div>
        <SpeakControlsBar
          text={`${recCopy.title}. ${recCopy.concept} ${reasonText}`}
          language={language}
          sourceId="path_recommendation"
        />
      </section>

      {/* Path Progression Cards */}
      <div className="space-y-3">
        {visibleSteps.map((step, idx) => {
          const copy = copyMap[step.id] ?? LEARNING_PATHS_COPY.en[step.id]
          const isCompleted = completedStepIds.includes(step.id)
          const showInline3D = active3DStepId === step.id
          return (
            <article
              key={step.id}
              className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition ${
                isCompleted
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                      {pu.levels[step.level]}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                      {ea.topics[step.topic]}
                    </span>
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        ✓ {pu.completedBadge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">
                    {copy.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                    {copy.concept}
                  </p>
                  <SpeakControlsBar
                    compact
                    text={`${copy.title}. ${copy.concept} ${copy.practiceGoal}`}
                    language={language}
                    sourceId={`path_step_${step.id}`}
                  />
                  <p className="text-xs font-semibold text-indigo-800 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3 py-2">
                    🎯 {pu.practiceGoalLabel}: {copy.practiceGoal}
                  </p>
                </div>

                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setActive3DStepId((prev) =>
                        prev === step.id ? null : step.id,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 cursor-pointer"
                  >
                    <ShapeThumbSvg shape={step.shape} className="h-4 w-4" />
                    <span>{pu.inline3DLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLaunchTarget(step)}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    {pu.openLabButton} →
                  </button>

                  <button
                    type="button"
                    aria-pressed={isCompleted}
                    onClick={() => onToggleStepComplete(step.id)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isCompleted
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isCompleted ? `✓ ${pu.completedBadge}` : pu.markCompleted}
                  </button>
                </div>
              </div>

              {showInline3D && (
                <div className="mt-4 h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Canvas3D
                    shape={step.shape}
                    foldProgress={step.foldProgress}
                    dimensions={step.dimensions}
                    highlightMode={step.highlightMode}
                    translations={t}
                    inlineScrollMode
                    theme={theme}
                  />
                </div>
              )}
            </article>
          )
        })}
      </div>
    </main>
  )
}
