import { useMemo, useState } from 'react'
import { CLASS_10_PRACTICE_IDS, SHAPES } from '../utils/mathEngine.js'
import { CLASS_10_PRACTICE_CONTENT } from '../data/class10Practice.js'
import { PYQ_TOPICS } from '../data/pyqArchive.js'
import { TRANSLATIONS } from '../data/translations.js'
import {
  buildSmartRevisionPlan,
  evaluateSampleFormulaCard,
  resolveQuestionSetItems,
} from '../utils/offlineVault.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import {
  Award,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  XCircle,
} from './common/UiIcons.jsx'

const ALL_SHAPES = Object.values(SHAPES)

function shapeLabel(t, s) {
  const entry = t.shapes?.[s]
  if (typeof entry === 'string') return entry
  if (entry && typeof entry.name === 'string') return entry.name
  return s
}

function topicLabel(t, topic) {
  return t.pyqUi?.topics?.[topic] || topic.replace(/_/g, ' ')
}

export default function OfflineRevisionHub({
  language = 'en',
  translations: propTranslations,
  theme = 'light',
  networkStatus,
  offlineLocker,
  profileData,
  learningProgress,
  onToggleOfflineItem,
  onSaveEssentialKit,
  onSaveTopicPack,
  onSaveWeakPack,
  onRemoveQuestionSet,
  onRecordOfflineQuizAnswer,
  onToggleRevisionTask,
  onNavigateToTab,
  onInspectShape,
}) {
  const t = propTranslations || TRANSLATIONS[language] || TRANSLATIONS.en
  const ou = t.offlineUi
  const isDark = theme === 'dark'

  const [subTab, setSubTab] = useState('vault') // 'vault' | 'planner' | 'calendar'
  const [expandedLessonShape, setExpandedLessonShape] = useState(null)
  const [expandedExampleId, setExpandedExampleId] = useState(null)
  const [activeSetId, setActiveSetId] = useState(null)
  const [packTopic, setPackTopic] = useState('cylinder')
  const [selectedDayOffset, setSelectedDayOffset] = useState(0)
  const [nowMs] = useState(() => Date.now())

  const revisionPlan = useMemo(
    () =>
      buildSmartRevisionPlan({
        profileData,
        learningProgress,
        offlineLocker,
        nowMs,
      }),
    [profileData, learningProgress, offlineLocker, nowMs],
  )

  const class10Bundle =
    CLASS_10_PRACTICE_CONTENT[language] || CLASS_10_PRACTICE_CONTENT.en

  const savedLessonsCount = offlineLocker?.lessons?.length ?? 0
  const savedFormulasCount = offlineLocker?.formulas?.length ?? 0
  const savedExamplesCount = offlineLocker?.examples?.length ?? 0
  const savedSetsCount = offlineLocker?.questionSets?.length ?? 0
  const totalSavedCount =
    savedLessonsCount + savedFormulasCount + savedExamplesCount + savedSetsCount

  const teacherLessons = profileData?.savedLessons ?? []

  const activeQuestionSet =
    offlineLocker?.questionSets?.find((s) => s.id === activeSetId) ??
    offlineLocker?.questionSets?.[0] ??
    null

  const activeSetQuestions = useMemo(
    () =>
      activeQuestionSet
        ? resolveQuestionSetItems(activeQuestionSet.questionIds)
        : [],
    [activeQuestionSet],
  )

  const activeSetAnswers = useMemo(
    () =>
      activeQuestionSet
        ? offlineLocker?.offlineQuizAnswers?.[activeQuestionSet.id] ?? {}
        : {},
    [activeQuestionSet, offlineLocker?.offlineQuizAnswers],
  )

  const selectedDay =
    revisionPlan.calendarDays[selectedDayOffset] ?? revisionPlan.calendarDays[0]

  const isOnline = networkStatus?.isOnline ?? true
  const swReady = Boolean(networkStatus?.controlled || networkStatus?.registered)

  const surfaceCls = isDark
    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900'

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Hero Banner & Live Offline Indicator */}
      <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-900">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                {ou.badge}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
                  isOnline
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-100 border-amber-400 text-amber-950'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOnline ? 'bg-emerald-500' : 'bg-amber-600'
                  }`}
                />
                {isOnline ? ou.statusLabels.onlineBadge : ou.statusLabels.offlineBadge}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-[11px] font-bold text-cyan-900">
                {swReady ? ou.statusLabels.swActive : ou.statusLabels.swPending}
                {networkStatus?.cachedUrls ? ` (${networkStatus.cachedUrls})` : ''}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{ou.title}</h2>
            <p className={`text-sm max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {ou.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() =>
                onSaveEssentialKit &&
                onSaveEssentialKit(
                  revisionPlan.recommendedTopics.slice(0, 2).map((r) => r.topic),
                )
              }
              className="rounded-xl bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-indigo-700 shadow-sm"
            >
              📥 {ou.actions.saveEssentialKit}
            </button>
            <button
              type="button"
              onClick={() =>
                onSaveWeakPack &&
                onSaveWeakPack(
                  revisionPlan.recommendedTopics[0]?.topic ?? 'cylinder',
                  topicLabel(t, revisionPlan.recommendedTopics[0]?.topic ?? 'cylinder'),
                )
              }
              className="rounded-xl border border-amber-300 bg-amber-50 text-amber-950 px-3.5 py-2 text-xs font-bold hover:bg-amber-100"
            >
              🎯 {ou.actions.saveWeakPack}
            </button>
          </div>
        </div>

        {/* Strict Device-Only Storage Notice (No Cloud Sync) */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 space-y-1">
          <p className="font-extrabold">
            💾 {ou.deviceOnlyTitle} · {ou.statusLabels.savedCount}:{' '}
            <span className="font-mono">{totalSavedCount}</span>
          </p>
          <p>{ou.deviceOnlyBody}</p>
        </div>

        {/* Sub-tab Strip */}
        <div
          className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4"
          role="tablist"
        >
          {[
            { id: 'vault', label: `${ou.tabs.vault} (${totalSavedCount})`, Icon: Bookmark },
            {
              id: 'planner',
              label: `${ou.tabs.planner} (${revisionPlan.recommendedTopics.length})`,
              Icon: Target,
            },
            {
              id: 'calendar',
              label: `${ou.tabs.calendar} (${revisionPlan.completionPct}%)`,
              Icon: Clock,
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
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* TAB 1: OFFLINE STUDY VAULT (LESSONS, FORMULAS, EXAMPLES, SETS)   */}
      {/* ================================================================ */}
      {subTab === 'vault' && (
        <div className="space-y-5">
          {/* Transparent Offline Availability Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
              {ou.availabilityTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 font-semibold text-emerald-950 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{ou.availabilityRows.coreApp}</span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 font-semibold text-emerald-950 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{ou.availabilityRows.savedLocker}</span>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 font-semibold text-amber-950 flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{ou.availabilityRows.externalLinks}</span>
              </div>
            </div>
          </div>

          {/* 1A. Save & Read Lessons Offline (All 15 Solids + Teacher Lessons) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                {ou.vaultSections.lessonsTitle} ({savedLessonsCount}/{ALL_SHAPES.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ALL_SHAPES.map((shapeId) => {
                const isSaved = offlineLocker?.lessons?.includes(shapeId)
                const isOpen = expandedLessonShape === shapeId
                return (
                  <div
                    key={shapeId}
                    className={`rounded-xl border p-2.5 space-y-2 ${
                      isSaved
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-extrabold truncate">
                      {shapeLabel(t, shapeId)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleOfflineItem && onToggleOfflineItem('lessons', shapeId)
                        }
                        className={`rounded-lg px-2 py-1 text-[10px] font-extrabold ${
                          isSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSaved ? ou.actions.savedBadge : ou.actions.saveOffline}
                      </button>
                      {isSaved && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedLessonShape(isOpen ? null : shapeId)
                          }
                          className="rounded-lg bg-indigo-600 text-white px-2 py-1 text-[10px] font-bold"
                        >
                          {ou.actions.openOfflineReader}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Inline Offline Lesson Reader */}
            {expandedLessonShape && t.learningByShape?.[expandedLessonShape] && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-extrabold text-indigo-950">
                    {shapeLabel(t, expandedLessonShape)} — {ou.actions.savedBadge}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <SpeakControlsBar
                      compact
                      text={`${shapeLabel(t, expandedLessonShape)}. ${t.learningByShape[expandedLessonShape].definition} ${t.learningByShape[expandedLessonShape].workedExample}`}
                      language={language}
                      sourceId={`offline_lesson_${expandedLessonShape}`}
                      isDark={false}
                    />
                    {onInspectShape && (
                      <button
                        type="button"
                        onClick={() => onInspectShape(expandedLessonShape)}
                        className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-xs font-bold"
                      >
                        3D
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-800">
                  <strong>{t.definitionLabel}:</strong>{' '}
                  {t.learningByShape[expandedLessonShape].definition}
                </p>
                <p className="text-slate-700">
                  <strong>{t.geometryStatsLabel}:</strong>{' '}
                  {t.learningByShape[expandedLessonShape].faces} ·{' '}
                  {t.learningByShape[expandedLessonShape].edges} ·{' '}
                  {t.learningByShape[expandedLessonShape].vertices}
                </p>
                <p className="text-slate-700">
                  <strong>{t.workedExampleLabel}:</strong>{' '}
                  {t.learningByShape[expandedLessonShape].workedExample}
                </p>
                <p className="text-slate-700">
                  <strong>{t.lsaExcludedTitle}:</strong>{' '}
                  {t.lsaExclusionNote?.[expandedLessonShape]}
                </p>
              </div>
            )}

            {/* Offline Access to Teacher Studio Saved Lessons */}
            {teacherLessons.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-extrabold text-emerald-900">
                  {ou.vaultSections.teacherNotesTag} ({teacherLessons.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {teacherLessons.map((tl) => (
                    <div
                      key={tl.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs space-y-1"
                    >
                      <p className="font-extrabold text-slate-900">{tl.title}</p>
                      <p className="text-slate-700">{tl.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 1B. Saved Formula Cards (Offline Cheat Sheet) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-3">
            <h3 className="text-sm font-extrabold">
              {ou.vaultSections.formulasTitle} ({savedFormulasCount}/{ALL_SHAPES.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SHAPES.map((s) => {
                const isSaved = offlineLocker?.formulas?.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      onToggleOfflineItem && onToggleOfflineItem('formulas', s)
                    }
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                      isSaved
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSaved ? '✓ ' : '+ '}
                    {shapeLabel(t, s)}
                  </button>
                )
              })}
            </div>

            {(offlineLocker?.formulas?.length ?? 0) === 0 ? (
              <p className="text-xs text-slate-500">{ou.vaultSections.emptyHint}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {offlineLocker.formulas.map((s) => {
                  const card = evaluateSampleFormulaCard(s)
                  if (!card) return null
                  return (
                    <div
                      key={s}
                      className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-3 text-xs space-y-1"
                    >
                      <p className="font-extrabold text-cyan-950">
                        {shapeLabel(t, s)}
                      </p>
                      <p className="font-mono text-[11px] text-slate-700">
                        LSA: {card.lsaFormula} | TSA: {card.tsaFormula}
                      </p>
                      <p className="font-mono text-[11px] text-slate-700">
                        Vol: {card.volumeFormula}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-800">
                        Sample → TSA:{' '}
                        {card.evaluated.tsa.toFixed(1)}, Vol:{' '}
                        {card.evaluated.volume.toFixed(1)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* 1C. Solved Class 10 Examples (Saved Offline Reader) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-3">
            <h3 className="text-sm font-extrabold">
              {ou.vaultSections.examplesTitle} ({savedExamplesCount}/
              {CLASS_10_PRACTICE_IDS.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {CLASS_10_PRACTICE_IDS.map((qId, idx) => {
                const isSaved = offlineLocker?.examples?.includes(qId)
                const qItem = class10Bundle[qId]
                const isOpen = expandedExampleId === qId
                return (
                  <div
                    key={qId}
                    className={`rounded-xl border p-2.5 space-y-2 ${
                      isSaved
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-extrabold line-clamp-2">
                      Q{idx + 1}. {qItem?.title || qId}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleOfflineItem && onToggleOfflineItem('examples', qId)
                        }
                        className={`rounded-lg px-2 py-1 text-[10px] font-extrabold ${
                          isSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        {isSaved ? ou.actions.savedBadge : ou.actions.saveOffline}
                      </button>
                      {isSaved && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedExampleId(isOpen ? null : qId)
                          }
                          className="rounded-lg bg-indigo-600 text-white px-2 py-1 text-[10px] font-bold"
                        >
                          {ou.actions.openOfflineReader}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {expandedExampleId && class10Bundle[expandedExampleId] && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2 text-xs sm:text-sm">
                <p className="font-extrabold text-indigo-950">
                  {class10Bundle[expandedExampleId].title}
                </p>
                <p className="font-bold text-slate-900">
                  {class10Bundle[expandedExampleId].question}
                </p>
                <p className="font-mono text-xs text-cyan-900 bg-white border border-cyan-200 rounded-lg px-3 py-1.5">
                  {class10Bundle[expandedExampleId].formula}
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-800">
                  {class10Bundle[expandedExampleId].calculations.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>
                <p className="font-extrabold text-emerald-800">
                  {class10Bundle[expandedExampleId].finalAnswer}
                </p>
              </div>
            )}
          </section>

          {/* 1D. Saved Question Sets + Offline Quiz Runner */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold">
                {ou.vaultSections.questionSetsTitle} ({savedSetsCount})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={packTopic}
                  onChange={(e) => setPackTopic(e.target.value)}
                  aria-label={t.pyqUi.filters.topicLabel}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                >
                  {PYQ_TOPICS.map((tp) => (
                    <option key={tp} value={tp}>
                      {topicLabel(t, tp)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    onSaveTopicPack &&
                    onSaveTopicPack(packTopic, topicLabel(t, packTopic))
                  }
                  className="rounded-xl bg-cyan-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-cyan-700"
                >
                  + {ou.actions.buildTopicPack}
                </button>
              </div>
            </div>

            {savedSetsCount === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs text-slate-500">
                {ou.vaultSections.emptyHint}
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {offlineLocker.questionSets.map((setObj) => {
                    const isSel = activeQuestionSet?.id === setObj.id
                    const ansCount = Object.keys(
                      offlineLocker.offlineQuizAnswers?.[setObj.id] ?? {},
                    ).length
                    return (
                      <div
                        key={setObj.id}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                          isSel
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveSetId(setObj.id)}
                          className="text-left"
                        >
                          {setObj.title} ({ansCount}/{setObj.questionIds.length})
                        </button>
                        {onRemoveQuestionSet && (
                          <button
                            type="button"
                            onClick={() => onRemoveQuestionSet(setObj.id)}
                            aria-label={ou.actions.removeOffline}
                            className="opacity-75 hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Offline Interactive Question Set Runner */}
                {activeQuestionSet && activeSetQuestions.length > 0 && (
                  <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-extrabold text-indigo-950">
                        {activeQuestionSet.title}
                      </p>
                      <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        {ou.vaultSections.quizScoreLabel}:{' '}
                        {
                          Object.values(activeSetAnswers).filter((a) => a.correct)
                            .length
                        }
                        /{activeSetQuestions.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeSetQuestions.map((qItem, idx) => {
                        const saved = activeSetAnswers[qItem.id]
                        return (
                          <div
                            key={qItem.id}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5"
                          >
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              Q{idx + 1}. {qItem.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {qItem.options.map((opt, oIdx) => {
                                const picked = saved?.pickedIndex === oIdx
                                const cls = saved
                                  ? oIdx === qItem.correctIndex
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-extrabold'
                                    : picked
                                      ? 'border-rose-400 bg-rose-50 text-rose-900'
                                      : 'border-slate-200 bg-slate-50 text-slate-400'
                                  : 'border-slate-200 bg-slate-50 hover:bg-indigo-50 text-slate-800'
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={Boolean(saved)}
                                    onClick={() =>
                                      onRecordOfflineQuizAnswer &&
                                      onRecordOfflineQuizAnswer(
                                        activeQuestionSet.id,
                                        qItem,
                                        oIdx,
                                      )
                                    }
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
                            {saved && (
                              <p className="text-xs font-bold text-slate-700">
                                {saved.correct ? '✓ ' : '✕ '}
                                {qItem.formulaUsed} — {qItem.solutionSteps?.[0]}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: SMART REVISION PLANNER                                    */}
      {/* ================================================================ */}
      {subTab === 'planner' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {ou.plannerUi.title}
            </h3>
            <button
              type="button"
              onClick={() => setSubTab('calendar')}
              className="rounded-xl bg-indigo-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-indigo-700"
            >
              {ou.tabs.calendar} →
            </button>
          </div>

          {!revisionPlan.hasPerformanceData && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-950">
              {ou.plannerUi.noDataNote}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {revisionPlan.recommendedTopics.map((rec, idx) => (
              <div
                key={rec.topic}
                className={`rounded-xl border p-4 space-y-2 ${
                  rec.mistakeCount > 0 || (rec.accuracyPct !== null && rec.accuracyPct < 60)
                    ? 'border-rose-200 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    #{idx + 1}. {topicLabel(t, rec.topic)}
                  </span>
                  <span className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {ou.plannerUi.reasons[rec.reason] || rec.reason}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {rec.accuracyPct !== null && (
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200 font-bold text-indigo-800">
                      {ou.plannerUi.accuracyTag}: {rec.accuracyPct}%
                    </span>
                  )}
                  {rec.mistakeCount > 0 && (
                    <span className="rounded bg-rose-100 px-2 py-0.5 font-extrabold text-rose-900">
                      {ou.plannerUi.mistakesTag}: {rec.mistakeCount}
                      {rec.dominantMistakeCategory &&
                        ` (${t.mistakeUi?.categories?.[rec.dominantMistakeCategory] || rec.dominantMistakeCategory})`}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSaveWeakPack) {
                        onSaveWeakPack(rec.topic, topicLabel(t, rec.topic))
                      }
                      setSubTab('vault')
                    }}
                    className="rounded-lg bg-indigo-600 text-white px-3 py-1 text-[11px] font-bold hover:bg-indigo-700"
                  >
                    📥 {ou.actions.saveOffline}
                  </button>
                  {onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('pyq_archive')}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      {t.extraNavTabs.pyq_archive}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: 7-DAY REVISION CALENDAR & DAILY TASK CHECKLIST            */}
      {/* ================================================================ */}
      {subTab === 'calendar' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold">{ou.calendarUi.title}</h3>
              <p className="text-xs text-slate-500">
                {ou.calendarUi.progressLabel}:{' '}
                <strong className="font-mono text-indigo-700">
                  {revisionPlan.completedTasksCount}/{revisionPlan.totalTasksCount} (
                  {revisionPlan.completionPct}%)
                </strong>{' '}
                · {ou.calendarUi.daysCompleted}: {revisionPlan.daysCompletedCount}/7
              </p>
            </div>
            <div className="w-40 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${revisionPlan.completionPct}%` }}
              />
            </div>
          </div>

          {/* 7-Day Selector Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {revisionPlan.calendarDays.map((day) => {
              const selected = selectedDay?.dayOffset === day.dayOffset
              const doneCnt = day.tasks.filter((tk) => tk.completed).length
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => setSelectedDayOffset(day.dayOffset)}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : day.allDone
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                    <span>
                      {day.dayOffset === 0
                        ? ou.calendarUi.todayBadge
                        : `${ou.calendarUi.dayPrefix} ${day.dayOffset + 1}`}
                    </span>
                    <span className="font-mono">
                      {doneCnt}/{day.tasks.length}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs font-bold">{day.dateKey}</p>
                </button>
              )
            })}
          </div>

          {/* Daily Tasks List for Selected Day */}
          {selectedDay && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {selectedDay.dayOffset === 0
                    ? ou.calendarUi.todayBadge
                    : `${ou.calendarUi.dayPrefix} ${selectedDay.dayOffset + 1}`}{' '}
                  ({selectedDay.dateKey})
                </h4>
                {selectedDay.allDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                    <Award className="w-3.5 h-3.5" />
                    100%
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {selectedDay.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                      task.completed
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          onToggleRevisionTask && onToggleRevisionTask(task.id)
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-extrabold ${
                            task.completed
                              ? 'line-through text-slate-500'
                              : 'text-slate-900'
                          }`}
                        >
                          {ou.calendarUi.taskTypes[task.kind] || task.kind}:{' '}
                          {topicLabel(t, task.topic)}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          ~{task.estimatedMin} {ou.calendarUi.minUnit}
                        </p>
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        if (task.kind === 'formula_review' && onToggleOfflineItem) {
                          if (!offlineLocker?.formulas?.includes(task.targetShape)) {
                            onToggleOfflineItem('formulas', task.targetShape)
                          }
                          setSubTab('vault')
                        } else if (onNavigateToTab) {
                          onNavigateToTab(task.targetTab)
                        }
                      }}
                      className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-indigo-700"
                    >
                      {ou.calendarUi.openTaskAction}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
