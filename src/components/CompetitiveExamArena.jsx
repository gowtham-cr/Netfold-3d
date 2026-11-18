import { useEffect, useMemo, useRef, useState } from 'react'
import Canvas3D from './Canvas3D.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import LiveChallengePanel from './LiveChallengePanel.jsx'
import ShapeThumbSvg from './ShapeThumbSvg.jsx'
import { buildArenaQuestionMultilingualWrapper } from '../utils/multilingualExplanations.js'
import {
  SYLLABUS_TAGS,
} from '../data/questionBank.js'
import {
  UNIFIED_BANK_STATS,
  UNIFIED_DIFFICULTIES,
  UNIFIED_EXAM_BANK,
  UNIFIED_EXAMS,
  UNIFIED_TOPICS,
  UNIFIED_TYPES,
  evaluateUnifiedMockSession,
  filterUnifiedExamQuestions,
  generateUnifiedQuestionSet,
  getArenaQuestionLocale,
  validateUnifiedQuestionAnswer,
} from '../utils/examArenaBank.js'

function fmtSeconds(sec) {
  const safe = Math.max(0, Math.floor(sec))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Competitive Exam Preparation Arena integrating the full unified 179-question
 * Mensuration bank (Verified Historical PYQs 1999–2026 + PYQ-Style Practice + Core Tracks)
 * with MCQ & Numerical solving, Question Palette, Incorrect Revision, Unlimited Timed Mocks,
 * Speed Shortcuts, Step-by-Step Solutions, and interactive 3D aids.
 */
export default function CompetitiveExamArena({
  language,
  translations: t,
  theme = 'light',
  initialMode = 'practice',
  initialAuthenticity = 'all',
  initialTopic = 'all',
  initialExam = 'all',
  bookmarks = null,
  profileData = null,
  onToggleBookmarkPyq = null,
  onRecordAttempts,
  onRecordMockSession,
  onDiagnoseWrongAnswer,
}) {
  const ea = t.examArena
  const pyqUi = t.pyqUi
  const isDark = theme === 'dark'

  const [mode, setMode] = useState(initialMode || 'practice') // 'practice' | 'mock'

  // Unified filters (Practice & Mock Source Pool)
  const [selectedAuthenticity, setSelectedAuthenticity] = useState(
    initialAuthenticity || 'all',
  )
  const [selectedExam, setSelectedExam] = useState(initialExam || 'all')
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || 'all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSyllabus, setSelectedSyllabus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [practiceSetSize, setPracticeSetSize] = useState('all') // '10' | '25' | '50' | 'all'
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)
  const [reviseIncorrectOnly, setReviseIncorrectOnly] = useState(false)

  // Live bookmark & incorrect question lookup derived from user history
  const bookmarkedSet = useMemo(
    () => new Set(Array.isArray(bookmarks?.pyqs) ? bookmarks.pyqs : []),
    [bookmarks],
  )

  const [sessionAttemptStatus, setSessionAttemptStatus] = useState(() => ({}))

  const historicalIncorrectIds = useMemo(() => {
    const latestByQ = new Map()
    const combined = [
      ...(profileData?.examAttempts ?? []),
      ...(profileData?.pyqAttempts ?? []),
    ]
    for (const att of combined) {
      if (att?.questionId) {
        latestByQ.set(att.questionId, Boolean(att.correct))
      }
    }
    const wrongSet = new Set()
    for (const [qId, wasCorrect] of latestByQ.entries()) {
      if (!wasCorrect) wrongSet.add(qId)
    }
    for (const [qId, status] of Object.entries(sessionAttemptStatus)) {
      if (status === 'wrong') wrongSet.add(qId)
      else if (status === 'correct') wrongSet.delete(qId)
    }
    return wrongSet
  }, [profileData, sessionAttemptStatus])

  const combinedAttemptMap = useMemo(() => {
    const map = {}
    const combined = [
      ...(profileData?.examAttempts ?? []),
      ...(profileData?.pyqAttempts ?? []),
    ]
    for (const att of combined) {
      if (att?.questionId) {
        map[att.questionId] = att.correct ? 'correct' : 'wrong'
      }
    }
    for (const [qId, status] of Object.entries(sessionAttemptStatus)) {
      map[qId] = status
    }
    return map
  }, [profileData, sessionAttemptStatus])

  const availableYears = useMemo(
    () => UNIFIED_BANK_STATS.distinctYears,
    [],
  )

  // Practice State
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [pickedOption, setPickedOption] = useState(null)
  const [numericInput, setNumericInput] = useState('')
  const [practiceValidation, setPracticeValidation] = useState(null) // null | { validInput, correct, expectedDisplay }
  const [show3D, setShow3D] = useState(false)
  const practiceStartedAtRef = useRef(0)

  // Timed Mock Test State
  const [mockPhase, setMockPhase] = useState('setup') // 'setup' | 'running' | 'results'
  const [mockCountChoice, setMockCountChoice] = useState('25') // '10' | '25' | '50' | 'all'
  const [mockMinutes, setMockMinutes] = useState(25)
  const [mockSeed, setMockSeed] = useState(1)
  const [mockQuestions, setMockQuestions] = useState([])
  const [mockCurrentIdx, setMockCurrentIdx] = useState(0)
  const [mockAnswers, setMockAnswers] = useState({})
  const [mockNumericAnswers, setMockNumericAnswers] = useState({})
  const [mockTimings, setMockTimings] = useState({})
  const [mockRemainingSec, setMockRemainingSec] = useState(25 * 60)
  const [mockEvaluation, setMockEvaluation] = useState(null)
  const mockStepStartedRef = useRef(0)

  const matchingPool = useMemo(
    () =>
      filterUnifiedExamQuestions({
        authenticity: selectedAuthenticity,
        exam: selectedExam,
        topic: selectedTopic,
        year: selectedYear,
        difficulty: selectedDifficulty,
        syllabusTag: selectedSyllabus,
        questionType: selectedType,
        query: searchQuery,
        bookmarkedOnly,
        bookmarkedSet,
        incorrectOnly: reviseIncorrectOnly,
        incorrectIdsSet: historicalIncorrectIds,
        limit: 'all',
      }),
    [
      selectedAuthenticity,
      selectedExam,
      selectedTopic,
      selectedYear,
      selectedDifficulty,
      selectedSyllabus,
      selectedType,
      searchQuery,
      bookmarkedOnly,
      bookmarkedSet,
      reviseIncorrectOnly,
      historicalIncorrectIds,
    ],
  )

  const filteredQuestions = useMemo(() => {
    if (practiceSetSize === 'all') return matchingPool
    const limit = Math.max(1, Number(practiceSetSize) || matchingPool.length)
    return matchingPool.slice(0, limit)
  }, [matchingPool, practiceSetSize])

  const safePracticeIdx =
    filteredQuestions.length > 0
      ? Math.min(practiceIdx, filteredQuestions.length - 1)
      : 0
  const activeQuestion = filteredQuestions[safePracticeIdx] ?? null
  const activeLocale = getArenaQuestionLocale(activeQuestion, language)

  const authenticityCounts = useMemo(() => {
    let verified = 0
    let practice = 0
    for (const q of UNIFIED_EXAM_BANK) {
      if (q.authenticity === 'verified_pyq') verified += 1
      else practice += 1
    }
    return {
      all: UNIFIED_EXAM_BANK.length,
      verified_pyq: verified,
      pyq_style_practice: practice,
    }
  }, [])

  const resetPracticeSelection = (nextIdx = 0) => {
    setPracticeIdx(nextIdx)
    setPickedOption(null)
    setNumericInput('')
    setPracticeValidation(null)
    practiceStartedAtRef.current = Date.now()
  }

  useEffect(() => {
    practiceStartedAtRef.current = Date.now()
  }, [safePracticeIdx])

  const resetAllFilters = () => {
    setSelectedAuthenticity('all')
    setSelectedExam('all')
    setSelectedTopic('all')
    setSelectedYear('all')
    setSelectedDifficulty('all')
    setSelectedType('all')
    setSelectedSyllabus('all')
    setSearchQuery('')
    setPracticeSetSize('all')
    setBookmarkedOnly(false)
    setReviseIncorrectOnly(false)
    resetPracticeSelection(0)
  }

  const recordMockElapsedForCurrent = () => {
    const activeMockQ = mockQuestions[mockCurrentIdx]
    if (!activeMockQ) return mockTimings
    const now = Date.now()
    const base = mockStepStartedRef.current || now
    const delta = Math.max(1, Math.round((now - base) / 1000))
    mockStepStartedRef.current = now
    const next = {
      ...mockTimings,
      [activeMockQ.id]: (mockTimings[activeMockQ.id] ?? 0) + delta,
    }
    setMockTimings(next)
    return next
  }

  const finishMockTest = (finalTimings = mockTimings) => {
    const evaluation = evaluateUnifiedMockSession(
      mockQuestions,
      mockAnswers,
      mockNumericAnswers,
      finalTimings,
    )
    setMockEvaluation(evaluation)
    setMockPhase('results')

    const now = Date.now()
    const statusUpdates = {}
    const attemptRecords = evaluation.perQuestion.map((pq) => {
      statusUpdates[pq.id] = pq.correct ? 'correct' : 'wrong'
      return {
        questionId: pq.id,
        topic: pq.topic,
        exam: pq.exam,
        examTrack: pq.examTrack,
        difficulty: pq.difficulty,
        authenticity: pq.authenticity,
        year: pq.year,
        correct: pq.correct,
        timeSpentSec: pq.timeSpentSec,
        mode: 'mock',
        timestamp: now,
      }
    })
    setSessionAttemptStatus((prev) => ({ ...prev, ...statusUpdates }))

    onRecordMockSession?.(
      {
        id: `mock_${now}`,
        examTrack: selectedExam,
        accuracy: evaluation.accuracy,
        correctCount: evaluation.correctCount,
        totalQuestions: evaluation.totalQuestions,
        totalTimeSec: evaluation.totalTimeSec,
        avgTimeSec: evaluation.avgTimeSec,
        timestamp: now,
      },
      attemptRecords,
    )
  }

  // Live countdown timer during active mock test
  useEffect(() => {
    if (mode !== 'mock' || mockPhase !== 'running') return undefined
    const id = window.setInterval(() => {
      setMockRemainingSec((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [mode, mockPhase])

  // Auto-submit once countdown reaches zero
  useEffect(() => {
    if (mode === 'mock' && mockPhase === 'running' && mockRemainingSec === 0) {
      const autoTimer = window.setTimeout(() => {
        finishMockTest()
      }, 0)
      return () => window.clearTimeout(autoTimer)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mockPhase, mockRemainingSec])

  const canSubmitPractice =
    activeQuestion &&
    (pickedOption !== null ||
      (activeQuestion.questionType === 'numerical' &&
        String(numericInput).trim() !== ''))

  const handleCheckPractice = () => {
    if (!activeQuestion || !canSubmitPractice) return
    const validation = validateUnifiedQuestionAnswer(activeQuestion, {
      optionIndex: pickedOption,
      numericInput,
    })
    if (!validation.validInput) return

    const now = Date.now()
    const base = practiceStartedAtRef.current || now
    const elapsed = Math.max(1, Math.round((now - base) / 1000))

    setPracticeValidation(validation)
    setSessionAttemptStatus((prev) => ({
      ...prev,
      [activeQuestion.id]: validation.correct ? 'correct' : 'wrong',
    }))

    onRecordAttempts?.([
      {
        questionId: activeQuestion.id,
        topic: activeQuestion.topic,
        exam: activeQuestion.exam,
        examTrack: activeQuestion.examTrack,
        difficulty: activeQuestion.difficulty,
        authenticity: activeQuestion.authenticity,
        year: activeQuestion.year,
        correct: validation.correct,
        timeSpentSec: elapsed,
        mode: 'practice',
        timestamp: now,
      },
    ])
  }

  const handlePrevPractice = () => {
    if (filteredQuestions.length === 0) return
    const prevIdx =
      safePracticeIdx > 0 ? safePracticeIdx - 1 : filteredQuestions.length - 1
    resetPracticeSelection(prevIdx)
  }

  const handleNextPractice = () => {
    if (filteredQuestions.length === 0) return
    const nextIdx = (safePracticeIdx + 1) % filteredQuestions.length
    resetPracticeSelection(nextIdx)
  }

  const handleStartMock = () => {
    const requested =
      mockCountChoice === 'all' ? 'all' : Math.max(1, Number(mockCountChoice) || 10)
    const { questions } = generateUnifiedQuestionSet({
      authenticity: selectedAuthenticity,
      exam: selectedExam,
      topic: selectedTopic,
      year: selectedYear,
      difficulty: selectedDifficulty,
      syllabusTag: selectedSyllabus,
      questionType: selectedType,
      incorrectOnly: reviseIncorrectOnly,
      incorrectIdsSet: historicalIncorrectIds,
      count: requested,
      seed: mockSeed,
    })
    if (questions.length === 0) return
    setMockSeed((s) => s + 1)
    setMockQuestions(questions)
    setMockCurrentIdx(0)
    setMockAnswers({})
    setMockNumericAnswers({})
    setMockTimings({})
    setMockEvaluation(null)
    setMockRemainingSec(mockMinutes * 60)
    mockStepStartedRef.current = Date.now()
    setMockPhase('running')
  }

  const activeMockQ = mockQuestions[mockCurrentIdx] ?? null
  const activeMockLocale = getArenaQuestionLocale(activeMockQ, language)

  const formatExamLabel = (examKey) =>
    pyqUi?.exams?.[examKey] ?? ea.tracks?.[examKey] ?? examKey

  const formatTopicLabel = (topicKey) =>
    pyqUi?.topics?.[topicKey] ?? ea.topics?.[topicKey] ?? topicKey

  const isActiveBookmarked = Boolean(
    activeQuestion && bookmarkedSet.has(activeQuestion.id),
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 space-y-5">
      {/* Header + Unified Question Bank Transparency Banner */}
      <section
        className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold">{ea.headerTitle}</h2>
              <span className="rounded-full bg-indigo-600 px-3 py-0.5 font-mono text-xs font-extrabold text-white">
                {UNIFIED_BANK_STATS.totalQuestions} Questions
              </span>
            </div>
            <p
              className={`mt-1 text-xs sm:text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {ea.headerSubtitle}
            </p>
          </div>

          {/* Mode Toggle */}
          <div
            role="tablist"
            aria-label={ea.headerTitle}
            className={`inline-flex rounded-xl p-1 ring-1 shrink-0 self-start ${
              isDark
                ? 'bg-slate-800 ring-slate-700'
                : 'bg-slate-100 ring-slate-200'
            }`}
          >
            {['practice', 'mock', 'challenge'].map((m) => {
              const selected = mode === m
              const label =
                m === 'challenge'
                  ? '⚡ Live Challenge (10/15/20Q)'
                  : (ea.modes[m] ?? m)
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-200 hover:bg-slate-700'
                        : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Transparent Source-Verified PYQ vs Practice Breakdown KPI Bar */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div
            className={`rounded-xl border p-3 ${
              isDark
                ? 'border-slate-700 bg-slate-800/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {ea.poolStatsPrefix}
            </div>
            <div className="mt-0.5 font-mono text-lg font-extrabold">
              {UNIFIED_BANK_STATS.totalQuestions}
            </div>
          </div>
          <div
            className={`rounded-xl border p-3 ${
              isDark
                ? 'border-emerald-800/70 bg-emerald-950/30'
                : 'border-emerald-200 bg-emerald-50/70'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              ✓ {ea.verifiedBadgeShort}
            </div>
            <div className="mt-0.5 font-mono text-lg font-extrabold text-emerald-800 dark:text-emerald-200">
              {UNIFIED_BANK_STATS.verifiedPyqCount}
              <span className="ml-1 text-[11px] font-semibold opacity-75">
                / 100 target
              </span>
            </div>
          </div>
          <div
            className={`rounded-xl border p-3 ${
              isDark
                ? 'border-sky-800/70 bg-sky-950/30'
                : 'border-sky-200 bg-sky-50/70'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              {ea.practiceBadgeShort}
            </div>
            <div className="mt-0.5 font-mono text-lg font-extrabold text-sky-800 dark:text-sky-200">
              {UNIFIED_BANK_STATS.practiceStyleCount}
            </div>
          </div>
          <div
            className={`rounded-xl border p-3 ${
              isDark
                ? 'border-amber-800/70 bg-amber-950/30'
                : 'border-amber-200 bg-amber-50/80'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              {ea.reviseWrongOnly}
            </div>
            <div className="mt-0.5 font-mono text-lg font-extrabold text-amber-900 dark:text-amber-200">
              {historicalIncorrectIds.size}
            </div>
          </div>
        </div>

        <p
          className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
            isDark
              ? 'border-amber-800 bg-amber-950/40 text-amber-200'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          ℹ️ {ea.disclaimerBanner} Verified PYQs: {UNIFIED_BANK_STATS.verifiedPyqCount} source-cited
          single-paper problems (gap of {UNIFIED_BANK_STATS.verifiedGapTo100} to reach 100
          verified PYQs); remaining {UNIFIED_BANK_STATS.practiceStyleCount} items are cleanly
          labelled {ea.practiceBadgeShort}.
        </p>

        {/* Authenticity Separation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            ['all', `${pyqUi.authenticityTabs.all} (${authenticityCounts.all})`],
            [
              'verified_pyq',
              `✓ ${pyqUi.authenticityTabs.verified_pyq} (${authenticityCounts.verified_pyq})`,
            ],
            [
              'pyq_style_practice',
              `${pyqUi.authenticityTabs.pyq_style_practice} (${authenticityCounts.pyq_style_practice})`,
            ],
          ].map(([authKey, label]) => {
            const active = selectedAuthenticity === authKey
            return (
              <button
                key={authKey}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedAuthenticity(authKey)
                  resetPracticeSelection(0)
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? authKey === 'verified_pyq'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Exam Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['all', ...UNIFIED_EXAMS].map((examKey) => {
            const active = selectedExam === examKey
            const count =
              examKey === 'all'
                ? UNIFIED_BANK_STATS.totalQuestions
                : (UNIFIED_BANK_STATS.byExam[examKey] ?? 0)
            return (
              <button
                key={examKey}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedExam(examKey)
                  resetPracticeSelection(0)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {examKey === 'all' ? ea.tracks.all : formatExamLabel(examKey)}{' '}
                <span className="opacity-75">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Detailed Search & Multi-Facet Filter Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6 pt-1">
          <label className="lg:col-span-2 text-xs font-bold">
            <span className="mb-1 block">{t.search?.button ?? 'Search'}</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                resetPracticeSelection(0)
              }}
              placeholder={pyqUi.filters.searchPlaceholder}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            />
          </label>

          <label className="text-xs font-bold">
            <span className="mb-1 block">{pyqUi.filters.topicLabel}</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value)
                resetPracticeSelection(0)
              }}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="all">{pyqUi.filters.allTopics}</option>
              {UNIFIED_TOPICS.map((top) => (
                <option key={top} value={top}>
                  {formatTopicLabel(top)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold">
            <span className="mb-1 block">{pyqUi.filters.yearLabel}</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value)
                resetPracticeSelection(0)
              }}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="all">{pyqUi.filters.allYears}</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold">
            <span className="mb-1 block">{pyqUi.filters.difficultyLabel}</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value)
                resetPracticeSelection(0)
              }}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="all">{ea.difficulties.all}</option>
              {UNIFIED_DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {ea.difficulties[diff]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold">
            <span className="mb-1 block">{ea.setSizeLabel}</span>
            <select
              value={practiceSetSize}
              onChange={(e) => {
                setPracticeSetSize(e.target.value)
                resetPracticeSelection(0)
              }}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="10">10 {ea.questionCountLabel}</option>
              <option value="25">25 {ea.questionCountLabel}</option>
              <option value="50">50 {ea.questionCountLabel}</option>
              <option value="all">
                {ea.allAvailableLabel} ({matchingPool.length})
              </option>
            </select>
          </label>
        </div>

        {/* Secondary Action Filters: Type, Syllabus, Bookmarks, Revise Wrong, Reset */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <select
            aria-label={pyqUi.filters.typeLabel}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              resetPracticeSelection(0)
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100'
                : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}
          >
            <option value="all">{pyqUi.filters.allTypes}</option>
            {UNIFIED_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {pyqUi.types[tp]}
              </option>
            ))}
          </select>

          <select
            aria-label={ea.syllabusFilterLabel}
            value={selectedSyllabus}
            onChange={(e) => {
              setSelectedSyllabus(e.target.value)
              resetPracticeSelection(0)
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100'
                : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}
          >
            <option value="all">{ea.allSyllabus}</option>
            {SYLLABUS_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {ea.syllabusTags[tag]}
              </option>
            ))}
          </select>

          {onToggleBookmarkPyq && (
            <button
              type="button"
              aria-pressed={bookmarkedOnly}
              onClick={() => {
                setBookmarkedOnly((v) => !v)
                resetPracticeSelection(0)
              }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                bookmarkedOnly
                  ? 'border-amber-400 bg-amber-100 text-amber-950'
                  : isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              ★ {pyqUi.filters.bookmarkedOnly}
            </button>
          )}

          <button
            type="button"
            aria-pressed={reviseIncorrectOnly}
            onClick={() => {
              setReviseIncorrectOnly((v) => !v)
              resetPracticeSelection(0)
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              reviseIncorrectOnly
                ? 'border-rose-400 bg-rose-100 text-rose-950'
                : isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            ↺ {ea.reviseWrongOnly} ({historicalIncorrectIds.size})
          </button>

          <button
            type="button"
            onClick={resetAllFilters}
            className={`ml-auto rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {pyqUi.filters.clearFilters}
          </button>
        </div>
      </section>

      {/* TOPIC PRACTICE MODE */}
      {mode === 'practice' && (
        <section className="space-y-4">
          {!activeQuestion ? (
            <div
              className={`rounded-2xl border border-dashed p-8 text-center text-sm font-semibold ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-300'
                  : 'border-slate-300 bg-white text-slate-600'
              }`}
            >
              {ea.emptyFilterMessage}
            </div>
          ) : (
            <div
              className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              {/* Question Counter & Authenticity / Citation Strip */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white dark:bg-indigo-600">
                    {ea.questionCounterPrefix} {safePracticeIdx + 1} {ea.ofLabel}{' '}
                    {filteredQuestions.length}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                      activeQuestion.authenticity === 'verified_pyq'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
                    }`}
                  >
                    {activeQuestion.authenticity === 'verified_pyq'
                      ? `✓ ${pyqUi.authenticityBadges.verified_pyq}`
                      : pyqUi.authenticityBadges.pyq_style_practice}
                  </span>
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-200">
                    {formatExamLabel(activeQuestion.exam)}
                  </span>
                  {activeQuestion.paperSession && (
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200">
                      {activeQuestion.paperSession}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {formatTopicLabel(activeQuestion.topic)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {ea.difficulties[activeQuestion.difficulty]}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                      activeQuestion.syllabusTag === 'ncert_core'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {ea.syllabusTags[activeQuestion.syllabusTag]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onToggleBookmarkPyq && (
                    <button
                      type="button"
                      onClick={() => onToggleBookmarkPyq(activeQuestion.id)}
                      className={`rounded-xl border px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        isActiveBookmarked
                          ? 'border-amber-400 bg-amber-100 text-amber-950'
                          : isDark
                            ? 'border-slate-700 bg-slate-800 text-slate-200'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {isActiveBookmarked
                        ? `★ ${pyqUi.practiceControls.bookmarkRemove}`
                        : `☆ ${pyqUi.practiceControls.bookmarkAdd}`}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShow3D((v) => !v)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ShapeThumbSvg shape={activeQuestion.shape} className="h-4 w-4" />
                    {ea.show3DAid}
                  </button>
                </div>
              </div>

              {/* Compact Interactive Question Palette */}
              <div
                className={`rounded-xl border p-3 space-y-2 ${
                  isDark
                    ? 'border-slate-800 bg-slate-950/40'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
                  <span>
                    {ea.paletteTitle} ({filteredQuestions.length}{' '}
                    {ea.questionCountLabel}
                    {matchingPool.length > filteredQuestions.length
                      ? ` / ${matchingPool.length}`
                      : ''}
                    )
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" /> ✓
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 inline-block" /> ✕
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600 inline-block" />{' '}
                      {safePracticeIdx + 1}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {filteredQuestions.map((qItem, idx) => {
                    const isCurr = idx === safePracticeIdx
                    const st = combinedAttemptMap[qItem.id]
                    const isBm = bookmarkedSet.has(qItem.id)
                    let cls = isDark
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-white text-slate-700 border-slate-200'
                    if (isCurr) {
                      cls = 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300'
                    } else if (st === 'correct') {
                      cls = 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    } else if (st === 'wrong') {
                      cls = 'bg-rose-100 text-rose-900 border-rose-300'
                    }
                    return (
                      <button
                        key={qItem.id}
                        type="button"
                        onClick={() => resetPracticeSelection(idx)}
                        className={`h-7 min-w-[28px] px-1.5 rounded-lg border font-mono text-[11px] font-bold transition cursor-pointer ${cls} ${
                          isBm && !isCurr ? 'ring-1 ring-amber-400' : ''
                        }`}
                        title={qItem.paperSession || qItem.id}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div
                  className={
                    show3D ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'
                  }
                >
                  <p className="text-base sm:text-lg font-bold leading-snug">
                    {activeLocale.question}
                  </p>

                  {/* Optional Numerical Direct Entry alongside 4 MCQ options */}
                  {activeQuestion.questionType === 'numerical' &&
                    Number.isFinite(activeQuestion.numericAnswer) && (
                      <div className="max-w-sm">
                        <label className="block text-xs font-bold mb-1">
                          {pyqUi.types.numerical}
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={Boolean(practiceValidation)}
                          value={numericInput}
                          onChange={(e) => setNumericInput(e.target.value)}
                          placeholder={pyqUi.practiceControls.numericalPlaceholder}
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm font-mono font-bold ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 text-slate-100'
                              : 'border-slate-300 bg-slate-50 text-slate-900'
                          }`}
                        />
                      </div>
                    )}

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {activeQuestion.options.map((opt, idx) => {
                      const picked = pickedOption === idx
                      const isCorrectOpt = idx === activeQuestion.correctIndex

                      let cardCls = isDark
                        ? 'border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-white'
                      if (practiceValidation) {
                        if (isCorrectOpt) {
                          cardCls =
                            'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100'
                        } else if (picked && !isCorrectOpt) {
                          cardCls =
                            'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/60 dark:text-rose-100'
                        }
                      } else if (picked) {
                        cardCls =
                          'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-100'
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={Boolean(practiceValidation)}
                          onClick={() => setPickedOption(idx)}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition cursor-pointer disabled:cursor-default ${cardCls}`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Check / Previous / Next Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevPractice}
                        className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                          isDark
                            ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        ← {pyqUi.practiceControls.prevQuestion}
                      </button>

                      {!practiceValidation ? (
                        <button
                          type="button"
                          disabled={!canSubmitPractice}
                          onClick={handleCheckPractice}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          {ea.checkAnswer}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextPractice}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                        >
                          {ea.nextQuestion} →
                        </button>
                      )}
                    </div>

                    {!practiceValidation && (
                      <button
                        type="button"
                        onClick={handleNextPractice}
                        className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                          isDark
                            ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pyqUi.practiceControls.nextQuestion} →
                      </button>
                    )}
                  </div>

                  {/* Speed Shortcut & Full Solution */}
                  {practiceValidation && (
                    <div className="space-y-3 pt-2">
                      <div
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold ${
                          practiceValidation.correct
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : 'border-rose-300 bg-rose-50 text-rose-900'
                        }`}
                      >
                        <span>
                          {practiceValidation.correct
                            ? `✓ ${ea.correctBanner}`
                            : `✕ ${ea.wrongBanner}`}
                        </span>
                        {!practiceValidation.correct && onDiagnoseWrongAnswer && (
                          <button
                            type="button"
                            onClick={() => {
                              onDiagnoseWrongAnswer({
                                question: {
                                  ...activeQuestion,
                                  question: activeLocale.question,
                                  solutionSteps: activeLocale.solutionSteps,
                                },
                                wrongOptionIndex:
                                  pickedOption !== null ? pickedOption : -1,
                                questionSource: 'exam_arena',
                              })
                            }}
                            className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                          >
                            🔍 {t.mistakeUi?.diagnoseButton ?? 'Diagnose with Mistake Detective'}
                          </button>
                        )}
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-950">
                        <p className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                          ⚡ {ea.speedShortcutLabel}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm font-medium">
                          {activeLocale.shortcutTip}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl border p-4 space-y-2 ${
                          isDark
                            ? 'border-slate-700 bg-slate-800/70'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-extrabold uppercase tracking-wide">
                            {ea.solutionTitle}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <SpeakControlsBar
                              compact
                              text={
                                buildArenaQuestionMultilingualWrapper(
                                  activeQuestion,
                                  activeLocale,
                                  language,
                                  t,
                                )?.speakText ?? ''
                              }
                              language={language}
                              sourceId={`arena_${activeQuestion.id}`}
                              isDark={isDark}
                            />
                            <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-700">
                              {ea.formulaLabel}: {activeQuestion.formulaUsed}
                            </span>
                          </div>
                        </div>
                        <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
                          {activeLocale.solutionSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                        {activeQuestion.sourceName && (
                          <div className="pt-1 text-[11px] font-semibold opacity-80">
                            {pyqUi.practiceControls.sourceLabel}:{' '}
                            {activeQuestion.sourceUrl ? (
                              <a
                                href={activeQuestion.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-indigo-600 dark:text-indigo-400"
                              >
                                {activeQuestion.sourceName}
                              </a>
                            ) : (
                              activeQuestion.sourceName
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {show3D && (
                  <div className="lg:col-span-5">
                    <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <Canvas3D
                        shape={activeQuestion.shape}
                        foldProgress={100}
                        dimensions={activeQuestion.dimensions}
                        highlightMode="tsa"
                        translations={t}
                        inlineScrollMode
                        theme={theme}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TIMED MOCK TEST MODE */}
      {mode === 'mock' && (
        <section
          className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-100'
              : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          {mockPhase === 'setup' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold">{ea.mockConfigTitle}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
                <label className="text-xs font-bold">
                  <span className="mb-1 block">{ea.questionCountLabel}</span>
                  <select
                    value={mockCountChoice}
                    onChange={(e) => setMockCountChoice(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-bold ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}
                  >
                    <option value="10">10 {ea.questionCountLabel}</option>
                    <option value="25">25 {ea.questionCountLabel}</option>
                    <option value="50">50 {ea.questionCountLabel}</option>
                    <option value="all">
                      {ea.allAvailableLabel} ({matchingPool.length})
                    </option>
                  </select>
                </label>

                <label className="text-xs font-bold">
                  <span className="mb-1 block">{ea.durationMinutesLabel}</span>
                  <select
                    value={mockMinutes}
                    onChange={(e) => setMockMinutes(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-bold ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}
                  >
                    {[10, 20, 25, 45, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                disabled={matchingPool.length === 0}
                onClick={handleStartMock}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-45 transition cursor-pointer"
              >
                {ea.startMockButton}
              </button>
            </div>
          )}

          {mockPhase === 'running' && activeMockQ && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-indigo-600">
                    {ea.questionCounterPrefix} {mockCurrentIdx + 1} {ea.ofLabel}{' '}
                    {mockQuestions.length}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                      activeMockQ.authenticity === 'verified_pyq'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    {activeMockQ.authenticity === 'verified_pyq'
                      ? activeMockQ.paperSession || ea.verifiedBadgeShort
                      : ea.practiceBadgeShort}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-sm font-extrabold text-amber-900">
                    ⏱ {ea.timeRemainingLabel}: {fmtSeconds(mockRemainingSec)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextT = recordMockElapsedForCurrent()
                      finishMockTest(nextT)
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    {ea.submitMockButton}
                  </button>
                </div>
              </div>

              {/* Palette Strip */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {mockQuestions.map((mq, idx) => {
                  const answered =
                    Number.isInteger(mockAnswers[mq.id]) ||
                    String(mockNumericAnswers[mq.id] ?? '').trim() !== ''
                  const current = idx === mockCurrentIdx
                  return (
                    <button
                      key={mq.id}
                      type="button"
                      onClick={() => {
                        recordMockElapsedForCurrent()
                        setMockCurrentIdx(idx)
                      }}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                        current
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                          : answered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isDark
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              <p className="text-base font-bold">{activeMockLocale.question}</p>

              {activeMockQ.questionType === 'numerical' &&
                Number.isFinite(activeMockQ.numericAnswer) && (
                  <div className="max-w-sm">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={mockNumericAnswers[activeMockQ.id] ?? ''}
                      onChange={(e) =>
                        setMockNumericAnswers((prev) => ({
                          ...prev,
                          [activeMockQ.id]: e.target.value,
                        }))
                      }
                      placeholder={pyqUi.practiceControls.numericalPlaceholder}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm font-mono font-bold ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-100'
                          : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>
                )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeMockQ.options.map((opt, idx) => {
                  const picked = mockAnswers[activeMockQ.id] === idx
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setMockAnswers((prev) => ({
                          ...prev,
                          [activeMockQ.id]: idx,
                        }))
                      }
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition cursor-pointer ${
                        picked
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-200'
                          : isDark
                            ? 'border-slate-700 bg-slate-800 text-slate-100'
                            : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-white'
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={mockCurrentIdx === 0}
                  onClick={() => {
                    recordMockElapsedForCurrent()
                    setMockCurrentIdx((i) => Math.max(0, i - 1))
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  ← {t.practice.previousButton}
                </button>
                <button
                  type="button"
                  disabled={mockCurrentIdx === mockQuestions.length - 1}
                  onClick={() => {
                    recordMockElapsedForCurrent()
                    setMockCurrentIdx((i) =>
                      Math.min(mockQuestions.length - 1, i + 1),
                    )
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 cursor-pointer"
                >
                  {t.practice.nextButton} →
                </button>
              </div>
            </div>
          )}

          {mockPhase === 'results' && mockEvaluation && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-extrabold">
                  {ea.reviewSolutionsHeading}
                </h3>
                <button
                  type="button"
                  onClick={() => setMockPhase('setup')}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  {ea.retakeMockButton}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">
                    {ea.scoreLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-extrabold text-indigo-700">
                    {mockEvaluation.correctCount} / {mockEvaluation.totalQuestions}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">
                    {ea.accuracyLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-extrabold text-emerald-700">
                    {mockEvaluation.accuracy}%
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">
                    {ea.totalTimeLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-extrabold text-slate-900">
                    {fmtSeconds(mockEvaluation.totalTimeSec)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">
                    {ea.avgTimeLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-extrabold text-amber-700">
                    {mockEvaluation.avgTimeSec}s
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {mockQuestions.map((mq, idx) => {
                  const res = mockEvaluation.perQuestion[idx]
                  const loc = getArenaQuestionLocale(mq, language)
                  return (
                    <div
                      key={mq.id}
                      className={`rounded-xl border p-4 space-y-2 ${
                        res.correct
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-extrabold">
                          Q{idx + 1}. {loc.question}
                        </span>
                        <span className="font-mono text-xs font-bold">
                          {res.correct ? '✓' : '✕'} ({mq.options[mq.correctIndex]}) ·{' '}
                          {res.timeSpentSec}s
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                        ⚡ {loc.shortcutTip}
                      </p>
                      <p className="text-xs opacity-90">
                        {loc.solutionSteps.join(' ')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* LIVE CHALLENGE MODE (10 / 15 / 20Q + SIMULATED DEMO PARTICIPANTS + TEACHER CHALLENGES) */}
      {mode === 'challenge' && (
        <LiveChallengePanel
          language={language}
          translations={t}
          theme={theme}
          onRecordMockSession={onRecordMockSession}
        />
      )}
    </main>
  )
}
