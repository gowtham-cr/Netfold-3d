import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart2,
  Bookmark,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  History,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from './common/UiIcons.jsx'
import {
  ALL_ARCHIVE_QUESTIONS,
  ARCHIVE_END_YEAR,
  ARCHIVE_START_YEAR,
  PYQ_DIFFICULTIES,
  PYQ_EXAMS,
  PYQ_TOPICS,
  PYQ_TYPES,
  computeArchiveFrequencyStats,
  filterArchiveQuestions,
  validateArchiveAnswer,
} from '../data/pyqArchive.js'
import { SHAPES } from '../utils/mathEngine.js'
import { TRANSLATIONS } from '../data/translations.js'
import Canvas3D from './Canvas3D.jsx'
import {
  HorizontalBarChart,
  YearCoverageTimelineChart,
} from './analytics/AnalyticsCharts.jsx'

const ALL_YEARS = Array.from(
  { length: ARCHIVE_END_YEAR - ARCHIVE_START_YEAR + 1 },
  (_, idx) => ARCHIVE_END_YEAR - idx,
)

function defaultDimensionsForShape(shape) {
  return {
    side: 4,
    length: 5,
    breadth: 4,
    height: 5,
    radius: 3,
    radiusTop: 2,
    radiusBottom: 4,
    shape,
  }
}

export default function PyqArchive({
  lang = 'en',
  translations: propTranslations,
  theme = 'light',
  bookmarks = { pyqs: [] },
  profileData,
  initialQuestionId = null,
  onToggleBookmarkPyq,
  onRecordPyqAttempt,
  onInspectShape,
  onDiagnoseWrongAnswer,
}) {
  const t = propTranslations || TRANSLATIONS[lang] || TRANSLATIONS.en
  const py = t.pyqUi
  const isDark = theme === 'dark'

  const [viewMode, setViewMode] = useState('practice') // 'practice' | 'frequency' | 'history'
  const [collection, setCollection] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [examFilter, setExamFilter] = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  const [activeQuestionId, setActiveQuestionId] = useState(() => {
    if (initialQuestionId && ALL_ARCHIVE_QUESTIONS.some((q) => q.id === initialQuestionId)) {
      return initialQuestionId
    }
    return ALL_ARCHIVE_QUESTIONS[0]?.id ?? null
  })

  const [selectedOption, setSelectedOption] = useState(null)
  const [numericInput, setNumericInput] = useState('')
  const [checkResult, setCheckResult] = useState(null) // null | { validInput, correct, expectedDisplay, feedbackMsg }
  const [showSolution, setShowSolution] = useState(false)
  const [show3DPreview, setShow3DPreview] = useState(false)
  const [selectedFace, setSelectedFace] = useState(null)

  const [timedMode, setTimedMode] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const startedAtRef = useRef(null)

  const [frequencyScope, setFrequencyScope] = useState('verified_pyq')

  const pyqBookmarks = useMemo(() => bookmarks?.pyqs ?? [], [bookmarks?.pyqs])
  const savedAttempts = useMemo(() => profileData?.pyqAttempts ?? [], [profileData?.pyqAttempts])

  // Verified year counts for informative dropdown labels
  const verifiedYearCounts = useMemo(() => {
    const map = new Map()
    for (const q of ALL_ARCHIVE_QUESTIONS) {
      if (q.authenticity === 'verified_pyq' && Number.isInteger(q.year)) {
        map.set(q.year, (map.get(q.year) ?? 0) + 1)
      }
    }
    return map
  }, [])

  const filteredQuestions = useMemo(() => {
    const base = filterArchiveQuestions({
      collection,
      query: searchQuery,
      exam: examFilter,
      topic: topicFilter,
      difficulty: difficultyFilter,
      questionType: typeFilter,
      year: yearFilter,
    })
    if (!bookmarkedOnly) return base
    const bSet = new Set(pyqBookmarks)
    return base.filter((q) => bSet.has(q.id))
  }, [
    collection,
    searchQuery,
    examFilter,
    topicFilter,
    difficultyFilter,
    typeFilter,
    yearFilter,
    bookmarkedOnly,
    pyqBookmarks,
  ])

  const activeIndex = useMemo(() => {
    if (filteredQuestions.length === 0) return -1
    const idx = filteredQuestions.findIndex((q) => q.id === activeQuestionId)
    return idx >= 0 ? idx : 0
  }, [filteredQuestions, activeQuestionId])

  const currentQuestion =
    activeIndex >= 0 ? filteredQuestions[activeIndex] : null

  const currentQuestionId = currentQuestion?.id ?? null

  // Capture question open time in a ref without calling setState inside an effect
  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [currentQuestionId])

  // Async interval stopwatch when Timed Practice is enabled
  useEffect(() => {
    if (!timedMode || viewMode !== 'practice' || !currentQuestionId) return undefined
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [timedMode, viewMode, currentQuestionId])

  const resetQuestionInteraction = (nextId) => {
    setActiveQuestionId(nextId)
    setSelectedOption(null)
    setNumericInput('')
    setCheckResult(null)
    setShowSolution(false)
    setSelectedFace(null)
    setElapsedSec(0)
  }

  const handleResetFilters = () => {
    setCollection('all')
    setSearchQuery('')
    setExamFilter('all')
    setTopicFilter('all')
    setYearFilter('all')
    setDifficultyFilter('all')
    setTypeFilter('all')
    setBookmarkedOnly(false)
    resetQuestionInteraction(ALL_ARCHIVE_QUESTIONS[0]?.id ?? null)
  }

  const handleCheckAnswer = () => {
    if (!currentQuestion) return
    const result = validateArchiveAnswer(currentQuestion, {
      optionIndex: selectedOption,
      numericInput,
    })

    if (!result.validInput) {
      setCheckResult({
        validInput: false,
        correct: false,
        feedbackMsg: py.practiceControls.invalidNumber,
      })
      return
    }

    const measuredSec = timedMode
      ? Math.max(1, elapsedSec)
      : Math.max(
          1,
          Math.round(
            (Date.now() - (startedAtRef.current ?? Date.now())) / 1000,
          ),
        )

    setCheckResult({
      ...result,
      feedbackMsg: result.correct
        ? py.practiceControls.correctFeedback
        : py.practiceControls.incorrectFeedback,
    })
    setShowSolution(true)

    if (onRecordPyqAttempt) {
      onRecordPyqAttempt({
        questionId: currentQuestion.id,
        exam: currentQuestion.exam,
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty,
        authenticity: currentQuestion.authenticity,
        year: currentQuestion.year ?? null,
        correct: result.correct,
        timeSpentSec: measuredSec,
        timestamp: Date.now(),
      })
    }
  }

  // Latest attempt map for quick pill status dots
  const latestStatusByQid = useMemo(() => {
    const map = new Map()
    for (const att of savedAttempts) {
      map.set(att.questionId, att.correct)
    }
    return map
  }, [savedAttempts])

  const freqStats = useMemo(
    () => computeArchiveFrequencyStats(frequencyScope),
    [frequencyScope],
  )

  const archiveTitleMap = useMemo(() => {
    const map = new Map()
    for (const q of ALL_ARCHIVE_QUESTIONS) map.set(q.id, q)
    return map
  }, [])

  const surfaceCls = isDark
    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900'
  const mutedTextCls = isDark ? 'text-slate-300' : 'text-slate-600'

  const isBookmarked =
    currentQuestion && pyqBookmarks.includes(currentQuestion.id)

  const verifiedCount = freqStats.verifiedCount
  const stylePracticeCount = freqStats.stylePracticeCount
  const totalArchiveCount = freqStats.totalArchiveCount

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header Banner */}
      <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-[11px] font-extrabold text-cyan-900">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {py.bannerBadge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {py.headerTitle}
            </h2>
            <p className={`text-sm max-w-3xl ${mutedTextCls}`}>
              {py.headerSubtitle}
            </p>
          </div>

          <div
            className="flex flex-wrap gap-1.5 self-start lg:self-auto"
            role="tablist"
            aria-label={py.headerTitle}
          >
            {[
              { id: 'practice', label: py.viewModes.practice, Icon: BookOpen },
              { id: 'frequency', label: py.viewModes.frequency, Icon: BarChart2 },
              {
                id: 'history',
                label: `${py.viewModes.history} (${savedAttempts.length})`,
                Icon: History,
              },
            ].map(({ id, label, Icon }) => {
              const active = viewMode === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setViewMode(id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${
                    active
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                      : isDark
                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
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
      </section>

      {/* ================================================================ */}
      {/* VIEW 1: PRACTICE & SEARCH ARCHIVE                                */}
      {/* ================================================================ */}
      {viewMode === 'practice' && (
        <div className="space-y-4">
          {/* Authenticity Collection Switcher + Multi-Filter Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: 'all',
                    label: `${py.authenticityTabs.all} (${totalArchiveCount})`,
                  },
                  {
                    id: 'verified_pyq',
                    label: `${py.authenticityTabs.verified_pyq} (${verifiedCount})`,
                  },
                  {
                    id: 'pyq_style_practice',
                    label: `${py.authenticityTabs.pyq_style_practice} (${stylePracticeCount})`,
                  },
                ].map((tab) => {
                  const active = collection === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setCollection(tab.id)
                        setSelectedOption(null)
                        setNumericInput('')
                        setCheckResult(null)
                        setShowSolution(false)
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-extrabold border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-xs font-bold text-slate-700">
                {py.practiceControls.questionsFound}: {filteredQuestions.length}
              </span>
            </div>

            {/* Search & Dropdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              <div className="lg:col-span-2 relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCheckResult(null)
                  }}
                  placeholder={py.filters.searchPlaceholder}
                  aria-label={py.filters.searchPlaceholder}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={examFilter}
                onChange={(e) => {
                  setExamFilter(e.target.value)
                  setCheckResult(null)
                }}
                aria-label={py.filters.examLabel}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-slate-800"
              >
                <option value="all">{py.filters.allExams}</option>
                {PYQ_EXAMS.map((ex) => (
                  <option key={ex} value={ex}>
                    {py.exams[ex]}
                  </option>
                ))}
              </select>

              <select
                value={topicFilter}
                onChange={(e) => {
                  setTopicFilter(e.target.value)
                  setCheckResult(null)
                }}
                aria-label={py.filters.topicLabel}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-slate-800"
              >
                <option value="all">{py.filters.allTopics}</option>
                {PYQ_TOPICS.map((tp) => (
                  <option key={tp} value={tp}>
                    {py.topics[tp]}
                  </option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value)
                  setCheckResult(null)
                }}
                aria-label={py.filters.yearLabel}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-slate-800"
              >
                <option value="all">{py.filters.allYears}</option>
                {ALL_YEARS.map((y) => {
                  const cnt = verifiedYearCounts.get(y) ?? 0
                  return (
                    <option key={y} value={String(y)}>
                      {cnt > 0 ? `${y} (${cnt} Verified)` : `${y} (0 indexed)`}
                    </option>
                  )
                })}
              </select>

              <div className="flex gap-2">
                <select
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value)
                    setCheckResult(null)
                  }}
                  aria-label={py.filters.difficultyLabel}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="all">{py.filters.allDifficulties}</option>
                  {PYQ_DIFFICULTIES.map((df) => (
                    <option key={df} value={df}>
                      {py.difficulties[df]}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    setCheckResult(null)
                  }}
                  aria-label={py.filters.typeLabel}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="all">{py.filters.allTypes}</option>
                  {PYQ_TYPES.map((tp) => (
                    <option key={tp} value={tp}>
                      {py.types[tp]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookmarkedOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                    bookmarkedOnly
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                  {py.filters.bookmarkedOnly} ({pyqBookmarks.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimedMode((prev) => !prev)
                    setElapsedSec(0)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                    timedMode
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {py.practiceControls.timedMode}
                  {timedMode ? ` · ${elapsedSec}s` : ''}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                {py.filters.clearFilters}
              </button>
            </div>
          </div>

          {/* Empty Filter State */}
          {!currentQuestion ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3 text-slate-700">
              <Filter className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold">{py.practiceControls.emptyFiltered}</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700"
              >
                {py.filters.clearFilters}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Compact Question Selector Pills */}
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {filteredQuestions.slice(0, 60).map((q, idx) => {
                    const isCur = q.id === currentQuestion.id
                    const status = latestStatusByQid.get(q.id)
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => resetQuestionInteraction(q.id)}
                        className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold font-mono transition-colors ${
                          isCur
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : status === true
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : status === false
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>#{idx + 1}</span>
                        {q.year && (
                          <span className="text-[10px] opacity-80">'{String(q.year).slice(-2)}</span>
                        )}
                      </button>
                    )
                  })}
                  {filteredQuestions.length > 60 && (
                    <span className="text-[11px] font-semibold text-slate-500 px-2 shrink-0">
                      +{filteredQuestions.length - 60}
                    </span>
                  )}
                </div>
              </div>

              {/* Active PYQ Question Card */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm text-slate-900 space-y-5">
                {/* Metadata & Action Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-900 text-white px-2.5 py-1 font-mono text-xs font-extrabold">
                      #{activeIndex + 1} / {filteredQuestions.length}
                    </span>

                    {currentQuestion.authenticity === 'verified_pyq' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-extrabold text-emerald-900">
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        {py.authenticityBadges.verified_pyq}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-xs font-extrabold text-indigo-900">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        {py.authenticityBadges.pyq_style_practice}
                      </span>
                    )}

                    <span className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-xs font-bold text-cyan-900">
                      {py.exams[currentQuestion.exam]}
                    </span>

                    {currentQuestion.year && (
                      <span className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-extrabold text-amber-900">
                        {currentQuestion.year} · {currentQuestion.paperSession}
                      </span>
                    )}

                    <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {py.topics[currentQuestion.topic]}
                    </span>

                    <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-[11px] font-bold uppercase text-slate-600">
                      {py.difficulties[currentQuestion.difficulty]} ·{' '}
                      {py.types[currentQuestion.questionType]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onToggleBookmarkPyq && (
                      <button
                        type="button"
                        onClick={() => onToggleBookmarkPyq(currentQuestion.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                          isBookmarked
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                        {isBookmarked
                          ? py.practiceControls.bookmarkRemove
                          : py.practiceControls.bookmarkAdd}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShow3DPreview((p) => !p)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <Box className="w-3.5 h-3.5" aria-hidden="true" />
                      {py.practiceControls.toggle3D}
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </p>

                {/* Optional Collapsible Inline 3D Preview */}
                {show3DPreview && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden space-y-2">
                    <div className="relative h-64 w-full">
                      <Canvas3D
                        shape={currentQuestion.shape || SHAPES.CUBE}
                        foldProgress={100}
                        dimensions={defaultDimensionsForShape(currentQuestion.shape)}
                        highlightMode="tsa"
                        selectedFace={selectedFace}
                        onSelectFace={setSelectedFace}
                        translations={t}
                        inlineScrollMode
                        theme={theme}
                      />
                    </div>
                    {onInspectShape && currentQuestion.shape && (
                      <div className="flex justify-end bg-slate-900 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onInspectShape(currentQuestion.shape)}
                          className="rounded-lg bg-indigo-500 text-white px-3 py-1 text-xs font-bold hover:bg-indigo-600"
                        >
                          {py.practiceControls.openRelatedShape}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Options (MCQ) + Optional Numerical Input Box */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuestion.options.map((opt, idx) => {
                      const picked = selectedOption === idx
                      const isCorrectOpt = idx === currentQuestion.correctIndex
                      let optStyle =
                        'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      if (checkResult?.validInput) {
                        if (isCorrectOpt) {
                          optStyle =
                            'border-emerald-500 bg-emerald-50 text-emerald-950 font-extrabold'
                        } else if (picked && !isCorrectOpt) {
                          optStyle = 'border-rose-400 bg-rose-50 text-rose-900'
                        }
                      } else if (picked) {
                        optStyle =
                          'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-200'
                      }

                      return (
                        <button
                          key={`${currentQuestion.id}_opt_${idx}`}
                          type="button"
                          onClick={() => {
                            setSelectedOption(idx)
                            setNumericInput('')
                          }}
                          className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs sm:text-sm transition-all ${optStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-mono text-xs font-extrabold shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>

                  {currentQuestion.questionType === 'numerical' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
                      <label
                        htmlFor="pyq-numerical-input"
                        className="text-xs font-extrabold text-indigo-950 shrink-0"
                      >
                        {py.types.numerical}:
                      </label>
                      <input
                        id="pyq-numerical-input"
                        type="text"
                        inputMode="decimal"
                        value={numericInput}
                        onChange={(e) => {
                          setNumericInput(e.target.value)
                          setSelectedOption(null)
                        }}
                        placeholder={py.practiceControls.numericalPlaceholder}
                        className="flex-1 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Feedback Banner */}
                {checkResult && (
                  <div
                    role="status"
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold ${
                      !checkResult.validInput
                        ? 'border-amber-300 bg-amber-50 text-amber-950'
                        : checkResult.correct
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                          : 'border-rose-300 bg-rose-50 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {checkResult.correct ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
                      )}
                      <span>
                        {checkResult.feedbackMsg}
                        {checkResult.expectedDisplay
                          ? ` (${checkResult.expectedDisplay})`
                          : ''}
                      </span>
                    </div>
                    {checkResult.validInput &&
                      !checkResult.correct &&
                      onDiagnoseWrongAnswer && (
                        <button
                          type="button"
                          onClick={() =>
                            onDiagnoseWrongAnswer({
                              question: currentQuestion,
                              wrongOptionIndex: selectedOption,
                              wrongNumericInput: numericInput,
                              questionSource: 'pyq_archive',
                            })
                          }
                          className="rounded-lg bg-rose-600 text-white px-3 py-1 text-xs font-extrabold hover:bg-rose-700"
                        >
                          {t.mistakeUi?.diagnoseCta || '🔍 Diagnose Error'}
                        </button>
                      )}
                  </div>
                )}

                {/* Check / Toggle Solution / Prev-Next Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCheckAnswer}
                      className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-indigo-700 shadow-sm"
                    >
                      {py.practiceControls.submitAnswer}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSolution((p) => !p)}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                    >
                      {showSolution
                        ? py.practiceControls.hideSolution
                        : py.practiceControls.showSolution}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeIndex <= 0}
                      onClick={() =>
                        activeIndex > 0 &&
                        resetQuestionInteraction(filteredQuestions[activeIndex - 1].id)
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      {py.practiceControls.prevQuestion}
                    </button>
                    <button
                      type="button"
                      disabled={activeIndex >= filteredQuestions.length - 1}
                      onClick={() =>
                        activeIndex < filteredQuestions.length - 1 &&
                        resetQuestionInteraction(filteredQuestions[activeIndex + 1].id)
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      {py.practiceControls.nextQuestion}
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Formula, Shortcut, Step-by-Step Solution & Verified Source */}
                {showSolution && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-cyan-900">
                          {py.practiceControls.formulaLabel}
                        </p>
                        <p className="mt-1 font-mono font-bold text-cyan-950">
                          {currentQuestion.formulaUsed}
                        </p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-amber-900">
                          {py.practiceControls.shortcutLabel}
                        </p>
                        <p className="mt-1 font-medium text-amber-950">
                          {currentQuestion.shortcutTip}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        {py.practiceControls.stepsLabel}
                      </p>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-800">
                        {currentQuestion.solutionSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {currentQuestion.authenticity === 'verified_pyq' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-emerald-950">
                        <div>
                          <span className="font-extrabold">
                            {py.practiceControls.sourceLabel}:
                          </span>{' '}
                          {currentQuestion.sourceName} ({py.practiceControls.examSessionLabel}:{' '}
                          {currentQuestion.paperSession})
                        </div>
                        {currentQuestion.sourceUrl && (
                          <a
                            href={currentQuestion.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-emerald-800 underline hover:text-emerald-950"
                          >
                            {currentQuestion.sourceUrl}
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: PYQ FREQUENCY INTELLIGENCE                               */}
      {/* ================================================================ */}
      {viewMode === 'frequency' && (
        <div className="space-y-5">
          {/* Scope Selector & Incomplete Coverage Warning */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold">{py.frequencyUi.title}</h3>
                <p className="text-xs text-slate-500">
                  {py.frequencyUi.totalQuestionsLabel}:{' '}
                  <strong className="font-mono text-slate-900">
                    {freqStats.totalInScope}
                  </strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    id: 'verified_pyq',
                    label: `${py.authenticityTabs.verified_pyq} (${verifiedCount})`,
                  },
                  {
                    id: 'pyq_style_practice',
                    label: `${py.authenticityTabs.pyq_style_practice} (${stylePracticeCount})`,
                  },
                  {
                    id: 'all',
                    label: `${py.authenticityTabs.all} (${totalArchiveCount})`,
                  },
                ].map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setFrequencyScope(sc.id)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      frequencyScope === sc.id
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
                {py.frequencyUi.coverageWarning}
              </p>
              <p>
                <strong>{py.frequencyUi.verifiedYearsSummary}:</strong>{' '}
                {freqStats.verifiedYearsPresent.length > 0
                  ? freqStats.verifiedYearsPresent.join(', ')
                  : '—'}
              </p>
              <p>
                <strong>{py.frequencyUi.missingYearsSummary}:</strong>{' '}
                {freqStats.missingVerifiedYears.length} years (1999–2011, 2013, 2015–2018, 2025–2026) ·{' '}
                {py.frequencyUi.missingExamsNote}
              </p>
            </div>
          </div>

          {/* 1999-2026 Timeline Chart */}
          <YearCoverageTimelineChart
            title={py.frequencyUi.perYearChartTitle}
            indexedLabel={t.advAnalytics?.analyticsPlus?.freq?.indexedLegend || 'Indexed'}
            unknownLabel={t.advAnalytics?.analyticsPlus?.freq?.unknownLegend || 'Coverage Unknown (Not 0)'}
            emptyMessage={py.frequencyUi.missingExamsNote}
            years={freqStats.byYear.map((entry) => ({
              year: entry.year,
              label: `'${String(entry.year).slice(-2)}`,
              count: entry.count > 0 ? entry.count : null,
              coverageUnknown: entry.count === 0,
            }))}
          />

          {/* Per Exam + Ranked Per Topic + Difficulty */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HorizontalBarChart
              title={py.frequencyUi.perExamChartTitle}
              maxValue={Math.max(1, ...Object.values(freqStats.byExam))}
              emptyMessage={py.frequencyUi.missingExamsNote}
              items={PYQ_EXAMS.map((examId) => ({
                id: examId,
                label: py.exams[examId],
                value: freqStats.byExam[examId] ?? 0,
                displayRight: String(freqStats.byExam[examId] ?? 0),
                colorClass: 'bg-indigo-500',
              }))}
            />

            <HorizontalBarChart
              title={py.frequencyUi.rankedTopicsTitle}
              maxValue={Math.max(1, ...freqStats.rankedTopics.map((r) => r.count))}
              emptyMessage={py.frequencyUi.missingExamsNote}
              items={freqStats.rankedTopics.map((row) => ({
                id: row.topic,
                label: py.topics[row.topic],
                value: row.count,
                displayRight: String(row.count),
                colorClass: 'bg-cyan-600',
              }))}
            />
          </div>

          <HorizontalBarChart
            title={py.frequencyUi.difficultyDistTitle}
            maxValue={Math.max(1, ...Object.values(freqStats.byDifficulty))}
            emptyMessage={py.frequencyUi.missingExamsNote}
            items={PYQ_DIFFICULTIES.map((df) => ({
              id: df,
              label: py.difficulties[df],
              value: freqStats.byDifficulty[df] ?? 0,
              displayRight: String(freqStats.byDifficulty[df] ?? 0),
              colorClass:
                df === 'easy'
                  ? 'bg-emerald-500'
                  : df === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-rose-500',
            }))}
          />

          {/* Topic Distribution Across Exams Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm text-slate-900 overflow-x-auto space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
              {py.frequencyUi.matrixTitle}
            </h4>
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold text-[11px]">
                  <th className="py-2 pr-3">{py.filters.topicLabel}</th>
                  {PYQ_EXAMS.map((ex) => (
                    <th key={ex} className="py-2 px-2 text-center">
                      {py.exams[ex].split(' ')[0]}
                    </th>
                  ))}
                  <th className="py-2 pl-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PYQ_TOPICS.map((tp) => {
                  const row = freqStats.topicByExam[tp] || {}
                  const rowTotal = PYQ_EXAMS.reduce((s, ex) => s + (row[ex] ?? 0), 0)
                  return (
                    <tr key={tp} className="hover:bg-slate-50">
                      <td className="py-2 pr-3 font-bold text-slate-800">
                        {py.topics[tp]}
                      </td>
                      {PYQ_EXAMS.map((ex) => {
                        const c = row[ex] ?? 0
                        return (
                          <td key={ex} className="py-2 px-2 text-center font-mono">
                            <span
                              className={`inline-block min-w-[24px] rounded px-1.5 py-0.5 font-bold ${
                                c > 0
                                  ? 'bg-cyan-100 text-cyan-900'
                                  : 'text-slate-300'
                              }`}
                            >
                              {c}
                            </span>
                          </td>
                        )
                      })}
                      <td className="py-2 pl-2 text-right font-mono font-extrabold text-indigo-700">
                        {rowTotal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 3: ATTEMPT HISTORY LOG                                      */}
      {/* ================================================================ */}
      {viewMode === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-extrabold">{py.historyUi.title}</h3>
            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {py.historyUi.clearHistory} ({savedAttempts.length})
            </span>
          </div>

          {savedAttempts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500">
              {py.historyUi.empty}
            </p>
          ) : (
            <div className="space-y-2.5">
              {[...savedAttempts].reverse().map((att, idx) => {
                const q = archiveTitleMap.get(att.questionId)
                return (
                  <div
                    key={`${att.questionId}_${idx}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span
                          className={`rounded px-1.5 py-0.5 font-extrabold ${
                            att.correct
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.correct ? '✓' : '✕'}
                        </span>
                        <span className="font-bold text-cyan-800">
                          {py.exams[att.exam] || att.exam}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="font-semibold text-slate-700">
                          {py.topics[att.topic] || att.topic}
                        </span>
                        {att.timeSpentSec ? (
                          <span className="font-mono text-slate-500">
                            · {att.timeSpentSec}s
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {q?.question || att.questionId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('practice')
                        setCollection('all')
                        resetQuestionInteraction(att.questionId)
                      }}
                      className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-indigo-700"
                    >
                      {t.bookmarks.openButton}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
