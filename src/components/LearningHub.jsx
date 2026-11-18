import { useMemo, useState } from 'react'
import {
  ARCHIVE_END_YEAR,
  ARCHIVE_START_YEAR,
  PYQ_DIFFICULTIES,
  PYQ_EXAMS,
  PYQ_TOPICS,
  ALL_ARCHIVE_QUESTIONS,
} from '../data/pyqArchive.js'
import { CLASS_10_PRACTICE_CONTENT } from '../data/class10Practice.js'
import { MISSION_IDS } from '../data/missions.js'
import { TRANSLATIONS } from '../data/translations.js'
import { downloadCsvFile } from '../utils/chartExport.js'
import { CLASS_10_PRACTICE_IDS, SHAPES } from '../utils/mathEngine.js'
import { DEMO_PROFILES } from '../utils/profileStorage.js'
import {
  buildAdvancedFrequencyAnalysis,
  buildCompetitiveExamAnalytics,
  buildStudentAnalytics,
  buildTeacherAnalytics,
  summarizeMistakesAndImprovement,
} from '../utils/analyticsEngine.js'
import {
  buildDashboardMultilingualExplanation,
} from '../utils/multilingualExplanations.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import {
  ActivityHeatmapChart,
  AreaTrendChart,
  BoxPlotChart,
  DifficultyStackedBarChart,
  GroupedBarChart,
  HistogramChart,
  HorizontalBarChart,
  LineTrendChart,
  MatrixHeatmapChart,
  SpeedAccuracyScatterChart,
  StudyDonutChart,
  TopicRadarChart,
  YearCoverageTimelineChart,
} from './analytics/AnalyticsCharts.jsx'
import {
  AlertTriangle,
  Award,
  BarChart2,
  BarChart3,
  BookOpen,
  Bookmark,
  Compass,
  Flame,
  HelpCircle,
  Info,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from './common/UiIcons.jsx'

const ALL_SHAPE_IDS = Object.values(SHAPES)
const SUB_TABS = [
  'progress',
  'teacher_analytics',
  'exam_analytics',
  'frequency',
  'bookmarks',
  'help',
  'about',
]
const DATE_RANGES = ['7d', '30d', 'all']
const GRANULARITIES = ['daily', 'weekly', 'monthly']
const YEARS_DESC = Array.from(
  { length: ARCHIVE_END_YEAR - ARCHIVE_START_YEAR + 1 },
  (_, idx) => ARCHIVE_END_YEAR - idx,
)

function shapeDisplayName(t, shapeId) {
  const entry = t.shapes?.[shapeId]
  if (typeof entry === 'string') return entry
  if (entry && typeof entry.name === 'string') return entry.name
  return shapeId
}

function resolveTopicLabel(topic, t) {
  if (!topic) return '—'
  if (t.pyqUi?.topics?.[topic]) return t.pyqUi.topics[topic]
  if (t.shapes?.[topic]) return shapeDisplayName(t, topic)
  const fallbackMap = {
    cube: shapeDisplayName(t, 'cube') || 'Cube',
    cuboid: shapeDisplayName(t, 'cuboid') || 'Cuboid',
    cone: shapeDisplayName(t, 'cone') || 'Cone',
    sphere: shapeDisplayName(t, 'sphere') || 'Sphere',
    frustum: shapeDisplayName(t, 'frustum') || 'Frustum',
    prism: shapeDisplayName(t, 'triangular_prism') || 'Prism',
    pyramid: shapeDisplayName(t, 'square_pyramid') || 'Pyramid',
    combination: t.pyqUi?.topics?.combination_of_solids || 'Combination of Solids',
    conversion: t.pyqUi?.topics?.conversion_melting || 'Conversion / Melting',
    general: 'General Mensuration',
  }
  return fallbackMap[topic] || topic.replace(/_/g, ' ')
}

function shortTopicLabel(topic, t) {
  const full = resolveTopicLabel(topic, t)
  if (full.length <= 12) return full
  return `${full.slice(0, 11)}…`
}

function accuracyBarColor(acc) {
  if (acc >= 75) return 'bg-emerald-500'
  if (acc >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

export function LearningHub({
  lang,
  language,
  translations: propTranslations,
  theme = 'light',
  learningProgress = { exploredShapes: [], visitedQuestions: [], netCheckerBestScore: 0 },
  missionsProgress = {},
  netCheckerSummary,
  bookmarks = { shapes: [], questions: [], pyqs: [] },
  profileData,
  activeProfileId = 'student_demo',
  activeAudience = 'student',
  requestedSubTab,
  activeSection,
  activeSubTab: controlledSubTab,
  onChangeSection,
  onSubTabChange,
  onNavigateToTab,
  onNavigateToShape,
  onOpenShape,
  onSelectShape,
  onNavigateToQuestion,
  onOpenQuestion,
  onSelectQuestion,
  onOpenPyq,
  onToggleBookmarkShape,
  onToggleBookmarkQuestion,
  onToggleBookmarkPyq,
  onResetProgress,
  stats: legacyStats,
}) {
  const effectiveLang = language || lang || 'en'
  const t = propTranslations || TRANSLATIONS[effectiveLang] || TRANSLATIONS.en
  const ht = t.hub
  const adv = t.advAnalytics
  const plus = adv.analyticsPlus
  const sv = adv.studentView
  const tv = adv.teacherView
  const ev = adv.examView
  const isDark = theme === 'dark'

  const [localSubTab, setLocalSubTab] = useState(
    requestedSubTab || activeSection || 'progress',
  )
  const [rangeKey, setRangeKey] = useState('all')
  const [granularity, setGranularity] = useState('daily')
  const [topicSearch, setTopicSearch] = useState('')
  const [selectedTeacherStudentId, setSelectedTeacherStudentId] = useState('student_demo')

  // Teacher dashboard filters
  const [teacherStudentFilter, setTeacherStudentFilter] = useState('all')
  const [teacherTopicFilter, setTeacherTopicFilter] = useState('all')
  const [teacherAssignmentFilter, setTeacherAssignmentFilter] = useState('all')

  // Frequency Analysis filters (Section 2)
  const [freqYearFrom, setFreqYearFrom] = useState(ARCHIVE_START_YEAR)
  const [freqYearTo, setFreqYearTo] = useState(ARCHIVE_END_YEAR)
  const [freqExamFilter, setFreqExamFilter] = useState('all')
  const [freqTopicFilter, setFreqTopicFilter] = useState('all')
  const [freqDiffFilter, setFreqDiffFilter] = useState('all')
  const [freqScope, setFreqScope] = useState('verified_pyq')

  const [nowMs] = useState(() => Date.now())

  const activeSubTab = controlledSubTab ?? activeSection ?? localSubTab
  const handleSelectSubTab = (tabId) => {
    if (onSubTabChange) {
      onSubTabChange(tabId)
    } else if (onChangeSection) {
      onChangeSection(tabId)
    } else {
      setLocalSubTab(tabId)
    }
  }

  const jumpToShape = onOpenShape || onNavigateToShape || onSelectShape
  const jumpToQuestion = onOpenQuestion || onNavigateToQuestion || onSelectQuestion

  const studentData = useMemo(
    () =>
      buildStudentAnalytics({
        profileData,
        learningProgress,
        missionsProgress,
        rangeKey,
        granularity,
        nowMs,
      }),
    [profileData, learningProgress, missionsProgress, rangeKey, granularity, nowMs],
  )

  const teacherData = useMemo(
    () =>
      buildTeacherAnalytics({
        rangeKey,
        studentFilter: teacherStudentFilter,
        topicFilter: teacherTopicFilter,
        assignmentFilter: teacherAssignmentFilter,
        nowMs,
      }),
    [
      rangeKey,
      teacherStudentFilter,
      teacherTopicFilter,
      teacherAssignmentFilter,
      nowMs,
    ],
  )

  const examData = useMemo(
    () =>
      buildCompetitiveExamAnalytics({
        profileData,
        rangeKey,
        nowMs,
      }),
    [profileData, rangeKey, nowMs],
  )

  const frequencyData = useMemo(
    () =>
      buildAdvancedFrequencyAnalysis({
        yearStart: Math.min(freqYearFrom, freqYearTo),
        yearEnd: Math.max(freqYearFrom, freqYearTo),
        examFilter: freqExamFilter,
        topicFilter: freqTopicFilter,
        difficultyFilter: freqDiffFilter,
        scope: freqScope,
      }),
    [
      freqYearFrom,
      freqYearTo,
      freqExamFilter,
      freqTopicFilter,
      freqDiffFilter,
      freqScope,
    ],
  )

  const mistakeSummary = useMemo(
    () => summarizeMistakesAndImprovement(profileData, rangeKey, nowMs),
    [profileData, rangeKey, nowMs],
  )

  const selectedCohortMember =
    teacherData.allProfiles.find((s) => s.profileId === selectedTeacherStudentId) ??
    teacherData.allProfiles[0]

  const studentNarrative = useMemo(
    () =>
      buildDashboardMultilingualExplanation(
        'student',
        {
          attemptedCount: studentData.attemptedCount,
          correctCount: studentData.correctCount,
          incorrectCount: studentData.incorrectCount,
          accuracyPct: studentData.accuracyPct,
          trendStatus: studentData.trendStatus,
          weakTopics: studentData.weakTopics,
        },
        effectiveLang,
        t,
      ),
    [studentData, effectiveLang, t],
  )

  const teacherNarrative = useMemo(() => {
    const donePie = teacherData.assignmentCompletionPie?.find((x) => x.id === 'completed')?.value ?? 0
    const totPie = (teacherData.assignmentCompletionPie ?? []).reduce((s, x) => s + (x.value ?? 0), 0)
    const compPct = totPie > 0 ? Math.round((donePie / totPie) * 100) : 0
    return buildDashboardMultilingualExplanation(
      'teacher',
      {
        rosterCount: teacherData.allProfiles.length,
        classAverageScore: teacherData.classAverageAccuracy,
        classAccuracy: teacherData.classAverageAccuracy,
        assignmentCompletionAvg: compPct,
        weakestTopic: teacherData.weakestTopic,
      },
      effectiveLang,
      t,
    )
  }, [teacherData, effectiveLang, t])

  const examNarrative = useMemo(() => {
    const topicEntries = Object.entries(examData.verifiedFreq?.byTopic ?? {})
    topicEntries.sort((a, b) => b[1] - a[1])
    return buildDashboardMultilingualExplanation(
      'exam',
      {
        verifiedCount: examData.verifiedFreq?.verifiedCount ?? 41,
        indexedYearsCount: examData.verifiedFreq?.verifiedYearsPresent?.length ?? 9,
        practiceCount: (examData.verifiedFreq?.stylePracticeCount ?? 113) + 25,
        mostTestedTopic: topicEntries[0]?.[0] ?? 'cone_frustum',
        readinessScore: examData.readinessScore ?? 0,
        mockCount: examData.mockCount ?? 0,
        weakTopics: examData.recommendedRevisionTopics,
      },
      effectiveLang,
      t,
    )
  }, [examData, effectiveLang, t])

  const practiceContent =
    CLASS_10_PRACTICE_CONTENT[effectiveLang] || CLASS_10_PRACTICE_CONTENT.en

  const netBestScore =
    netCheckerSummary?.bestScore ?? learningProgress?.netCheckerBestScore ?? 0

  const pyqMap = useMemo(() => {
    const m = new Map()
    for (const q of ALL_ARCHIVE_QUESTIONS) m.set(q.id, q)
    return m
  }, [])

  const bookmarkedShapes = bookmarks?.shapes ?? []
  const bookmarkedQuestions = bookmarks?.questions ?? []
  const bookmarkedPyqs = bookmarks?.pyqs ?? []

  const masteryPct =
    legacyStats?.overallMasteryPct ??
    Math.round(
      (((studentData.shapesExploredCount / Math.max(1, ALL_SHAPE_IDS.length)) +
        (studentData.completedMissions / Math.max(1, MISSION_IDS.length)) +
        (studentData.practiceReviewedCount /
          Math.max(1, CLASS_10_PRACTICE_IDS.length))) /
        3) *
        100,
    )

  const surfaceCls = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900'
  const mutedTextCls = isDark ? 'text-slate-300' : 'text-slate-600'

  const subTabLabel = (id) => {
    if (id === 'progress') return adv.subViews.student
    if (id === 'teacher_analytics') return adv.subViews.teacher
    if (id === 'exam_analytics') return adv.subViews.exam
    if (id === 'frequency') return plus.frequencyTabLabel
    return ht.tabs[id] || id
  }

  const trendBadgeInfo = (status, delta) => {
    if (status === 'up') {
      return {
        label: `${sv.trendImproving} (+${delta}%)`,
        cls: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        Icon: TrendingUp,
      }
    }
    if (status === 'down') {
      return {
        label: `${sv.trendDeclining} (${delta}%)`,
        cls: 'bg-rose-50 border-rose-200 text-rose-800',
        Icon: TrendingDown,
      }
    }
    if (status === 'steady') {
      return {
        label: `${sv.trendSteady} (${delta >= 0 ? '+' : ''}${delta}%)`,
        cls: 'bg-sky-50 border-sky-200 text-sky-800',
        Icon: Sparkles,
      }
    }
    return {
      label: sv.trendInsufficient,
      cls: 'bg-slate-100 border-slate-300 text-slate-600',
      Icon: Compass,
    }
  }

  const studentTrendBadge = trendBadgeInfo(
    studentData.trendStatus,
    studentData.improvementDelta,
  )
  const TrendIcon = studentTrendBadge.Icon

  const isDateAwareTab =
    activeSubTab === 'progress' ||
    activeSubTab === 'teacher_analytics' ||
    activeSubTab === 'exam_analytics'

  const searchQ = topicSearch.trim().toLowerCase()
  const filteredStudentTopics = studentData.topicStats.filter(
    (s) =>
      !searchQ ||
      resolveTopicLabel(s.topic, t).toLowerCase().includes(searchQ) ||
      s.topic.toLowerCase().includes(searchQ),
  )

  const handleExportProfileReportCsv = () => {
    downloadCsvFile(
      `netfold_${activeProfileId}_performance_report.csv`,
      [
        { key: 'topic', label: 'Topic' },
        { key: 'attempted', label: 'Attempted' },
        { key: 'correct', label: 'Correct' },
        { key: 'incorrect', label: 'Incorrect' },
        { key: 'accuracy', label: 'Accuracy (%)' },
        { key: 'avgTimeSec', label: 'Avg Time (s)' },
      ],
      studentData.topicStats.map((s) => ({
        topic: resolveTopicLabel(s.topic, t),
        attempted: s.total,
        correct: s.correct,
        incorrect: s.incorrect,
        accuracy: s.accuracy,
        avgTimeSec: s.avgTimeSec,
      })),
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Analytics Centre Hero Banner */}
      <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-800">
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                {t.audience.profileBadgePrefix}: {t.audience[activeAudience] || activeProfileId}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                {ht.stats.overallMastery}: {masteryPct}%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {adv.centreTitle}
            </h2>
            <p className={`text-sm max-w-3xl ${mutedTextCls}`}>
              {adv.centreSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto print:hidden">
            {isDateAwareTab && (
              <div
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
                role="group"
                aria-label="Analytics Date Range Filter"
              >
                {DATE_RANGES.map((rk) => (
                  <button
                    key={rk}
                    type="button"
                    onClick={() => setRangeKey(rk)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      rangeKey === rk
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {adv.dateRanges[rk]}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleExportProfileReportCsv}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              📥 {plus.exportReportCsv}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              {plus.printSummaryPdf}
            </button>
          </div>
        </div>

        {/* Sub-Tabs Strip */}
        <div
          className="mt-5 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4"
          role="tablist"
          aria-label={adv.centreTitle}
        >
          {SUB_TABS.map((tabId) => {
            const active = activeSubTab === tabId
            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectSubTab(tabId)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold border transition-all ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isDark
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tabId === 'progress' && <BarChart3 className="w-4 h-4" />}
                {tabId === 'teacher_analytics' && <Users className="w-4 h-4" />}
                {tabId === 'exam_analytics' && <Target className="w-4 h-4" />}
                {tabId === 'frequency' && <BarChart2 className="w-4 h-4" />}
                {tabId === 'bookmarks' && <Bookmark className="w-4 h-4" />}
                {tabId === 'help' && <HelpCircle className="w-4 h-4" />}
                {tabId === 'about' && <Info className="w-4 h-4" />}
                <span>{subTabLabel(tabId)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* VIEW A: STUDENT ANALYTICS (ALL 8 CHARTS + COMPLETE KPIS)         */}
      {/* ================================================================ */}
      {activeSubTab === 'progress' && (
        <div className="space-y-5">
          {/* 5-Language Dashboard Narrative Explanation + Voice Controls */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 dark:border-indigo-800 dark:bg-indigo-950/40 p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-cyan-300">
              📘 {studentNarrative.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100">
              {studentNarrative.body}
            </p>
            <SpeakControlsBar
              text={studentNarrative.speakText}
              language={effectiveLang}
              sourceId="dashboard_student"
              isDark={isDark}
            />
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`rounded-2xl border p-3.5 shadow-sm ${surfaceCls}`}>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">
                {sv.attemptedVsCorrect}
              </p>
              <p className="mt-1 text-xl font-black font-mono">
                {studentData.attemptedCount}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600">
                ✓ {studentData.correctCount} · ✕ {studentData.incorrectCount}
              </p>
            </div>

            <div className={`rounded-2xl border p-3.5 shadow-sm ${surfaceCls}`}>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">
                {t.analyticsUi.kpis.accuracy}
              </p>
              <p className="mt-1 text-xl font-black font-mono text-indigo-600">
                {studentData.accuracyPct}%
              </p>
              <p className="text-[11px] text-slate-500">
                {ev.avgTimePerQuestionLabel}: {studentData.avgTimePerQuestionSec}s
              </p>
            </div>

            <div className={`rounded-2xl border p-3.5 shadow-sm ${surfaceCls}`}>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">
                {plus.student.completedLessonsKpi}
              </p>
              <p className="mt-1 text-xl font-black font-mono text-cyan-600">
                {studentData.shapesExploredCount}/{ALL_SHAPE_IDS.length}
              </p>
              <p className="text-[11px] text-slate-500">
                Paths: {studentData.completedPathSteps} · Missions:{' '}
                {studentData.completedMissions}/{MISSION_IDS.length}
              </p>
            </div>

            <div className={`rounded-2xl border p-3.5 shadow-sm ${surfaceCls}`}>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">
                {plus.student.weakTopicsKpi}
              </p>
              <p className="mt-1 text-xl font-black font-mono text-rose-600">
                {studentData.recommendedRevisionTopics.length}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {studentData.recommendedRevisionTopics[0]
                  ? resolveTopicLabel(studentData.recommendedRevisionTopics[0], t)
                  : '—'}
              </p>
            </div>

            <div className={`rounded-2xl border p-3.5 shadow-sm ${surfaceCls}`}>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">
                {sv.improvementTitle}
              </p>
              <div className="mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-extrabold ${studentTrendBadge.cls}`}
                >
                  <TrendIcon className="w-3 h-3" />
                  {studentTrendBadge.label}
                </span>
              </div>
            </div>

            <div className={`rounded-2xl border p-3.5 shadow-sm ${surfaceCls}`}>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">
                {ht.stats.practiceReviewed}
              </p>
              <p className="mt-1 text-xl font-black font-mono text-emerald-600">
                {studentData.practiceReviewedCount}/{CLASS_10_PRACTICE_IDS.length}
              </p>
              <p className="text-[11px] text-slate-500">
                Net Checker: {netBestScore}
              </p>
            </div>
          </div>

          {/* Search Topic + Granularity Strip */}
          <div className={`rounded-2xl border p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 ${surfaceCls}`}>
            <div className="relative flex-1 min-w-[210px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder={plus.searchTopicPlaceholder}
                aria-label={plus.searchTopicPlaceholder}
                className={`w-full rounded-xl border pl-9 pr-3 py-1.5 text-xs font-medium ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
              {GRANULARITIES.map((gr) => (
                <button
                  key={gr}
                  type="button"
                  onClick={() => setGranularity(gr)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    granularity === gr
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {plus.granularities[gr]}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Line Graph & 2. Topic Bar Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LineTrendChart
              title={`${sv.lineTitle} (${plus.granularities[granularity]})`}
              series={studentData.progressLineSeries}
              valueSuffix="%"
              theme={theme}
              emptyMessage={sv.noAttemptsTitle}
              strokeColor="#4f46e5"
            />
            <HorizontalBarChart
              title={sv.barTitle}
              maxValue={100}
              theme={theme}
              emptyMessage={sv.noAttemptsTitle}
              items={filteredStudentTopics.map((s) => ({
                id: s.topic,
                label: resolveTopicLabel(s.topic, t),
                value: s.accuracy,
                displayRight: `${s.accuracy}% (${s.correct}/${s.total})`,
                colorClass: accuracyBarColor(s.accuracy),
              }))}
            />
          </div>

          {/* 3. Correct/Incorrect/Unanswered Donut & 4. Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StudyDonutChart
              title={plus.student.statusPieTitle}
              valueSuffix=""
              theme={theme}
              emptyMessage={sv.noAttemptsTitle}
              segments={studentData.statusPieBreakdown.map((seg) => ({
                ...seg,
                label:
                  seg.id === 'correct'
                    ? ev.correctBar
                    : seg.id === 'incorrect'
                      ? ev.incorrectBar
                      : plus.student.unansweredLabel,
              }))}
            />
            <TopicRadarChart
              title={sv.radarTitle}
              theme={theme}
              emptyMessage={sv.emptyChartsHint}
              axes={studentData.radarSeries.map((s) => ({
                label: resolveTopicLabel(s.topic, t),
                shortLabel: shortTopicLabel(s.topic, t),
                value: s.accuracy,
              }))}
            />
          </div>

          {/* 5. Activity Heatmap & 6. Score Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActivityHeatmapChart
              title={sv.heatmapTitle}
              days={studentData.calendarHeatmap}
              legendLess={sv.heatLess}
              legendMore={sv.heatMore}
              theme={theme}
            />
            <HistogramChart
              title={plus.student.histogramTitle}
              bins={studentData.scoreHistogram}
              emptyMessage={plus.student.emptyHistogram}
              theme={theme}
            />
          </div>

          {/* 7. Cumulative Area Graph & 8. Difficulty Stacked Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AreaTrendChart
              title={plus.student.cumulativeAreaTitle}
              series={studentData.cumulativeAreaSeries}
              emptyMessage={plus.student.emptyArea}
              theme={theme}
            />
            <DifficultyStackedBarChart
              title={ev.difficultyStackedTitle}
              correctLabel={ev.correctBar}
              incorrectLabel={ev.incorrectBar}
              unansweredLabel={plus.student.unansweredLabel}
              showUnanswered
              emptyMessage={sv.noAttemptsTitle}
              theme={theme}
              rows={studentData.difficultyStacked.map((row) => ({
                ...row,
                label: t.pyqUi.difficulties[row.difficulty] || row.difficulty,
              }))}
            />
          </div>

          {/* Recommended Revision + Mistake Detective Link */}
          <div className={`rounded-2xl border p-4 shadow-sm space-y-3 ${surfaceCls}`}>
            <h4 className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              {sv.recommendedTitle}
            </h4>
            {studentData.recommendedRevisionTopics.length === 0 ? (
              <p className={`text-xs ${mutedTextCls}`}>{sv.noAttemptsBody}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {studentData.recommendedRevisionTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => onNavigateToTab && onNavigateToTab('pyq_archive')}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-100"
                  >
                    {resolveTopicLabel(topic, t)} → {sv.reviseNow}
                  </button>
                ))}
              </div>
            )}
            {mistakeSummary.totalMistakes > 0 && onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('mistake_detective')}
                className="rounded-xl bg-rose-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-rose-700"
              >
                🔍 {t.extraNavTabs.mistake_detective} ({mistakeSummary.totalMistakes})
              </button>
            )}
          </div>

          {/* Achievement Badges & Reset */}
          <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${surfaceCls}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                {ht.badgesTitle}
              </h4>
              {onResetProgress && (
                <button
                  type="button"
                  onClick={onResetProgress}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.netLab?.checker?.resetProgress || 'Reset Progress'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'first_fold',
                  unlocked: studentData.shapesExploredCount >= 1,
                  title: ht.badges.first_fold.title,
                  desc: ht.badges.first_fold.desc,
                },
                {
                  id: 'class8_complete',
                  unlocked: ['cube', 'cuboid', 'cylinder'].every((s) =>
                    learningProgress?.exploredShapes?.includes(s),
                  ),
                  title: ht.badges.class8_complete.title,
                  desc: ht.badges.class8_complete.desc,
                },
                {
                  id: 'master_15',
                  unlocked: studentData.shapesExploredCount >= ALL_SHAPE_IDS.length,
                  title: ht.badges.master_15.title,
                  desc: ht.badges.master_15.desc,
                },
                {
                  id: 'mission_challenger',
                  unlocked: studentData.completedMissions >= 2,
                  title: ht.badges.mission_challenger.title,
                  desc: ht.badges.mission_challenger.desc,
                },
                {
                  id: 'star_achiever',
                  unlocked: studentData.completedMissions >= MISSION_IDS.length,
                  title: ht.badges.star_achiever.title,
                  desc: ht.badges.star_achiever.desc,
                },
                {
                  id: 'board_scholar',
                  unlocked:
                    studentData.practiceReviewedCount >= CLASS_10_PRACTICE_IDS.length,
                  title: ht.badges.board_scholar.title,
                  desc: ht.badges.board_scholar.desc,
                },
              ].map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border p-3 ${
                    b.unlocked
                      ? 'border-emerald-300 bg-emerald-50 text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-900 opacity-75'
                  }`}
                >
                  <p className="text-xs font-extrabold">
                    {b.unlocked ? '★ ' : '○ '}
                    {b.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW B: TEACHER ANALYTICS (ALL 8 CHARTS + 4 FILTERS)             */}
      {/* ================================================================ */}
      {activeSubTab === 'teacher_analytics' && (
        <div className="space-y-5">
          {/* 5-Language Teacher Dashboard Narrative + Voice Controls */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40 p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
              🧑‍🏫 {teacherNarrative.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100">
              {teacherNarrative.body}
            </p>
            <SpeakControlsBar
              text={teacherNarrative.speakText}
              language={effectiveLang}
              sourceId="dashboard_teacher"
              isDark={isDark}
            />
          </div>

          {/* Honest Local Demo Banner + 4 Teacher Filters */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm font-semibold text-amber-950">
            {tv.demoCohortWarning}
          </div>

          <div className={`rounded-2xl border p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 ${surfaceCls}`}>
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                {plus.teacher.studentFilterLabel}
              </label>
              <select
                value={teacherStudentFilter}
                onChange={(e) => setTeacherStudentFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
              >
                <option value="all">{plus.teacher.allStudents}</option>
                {DEMO_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t.audience[p.audience] || p.id} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                {t.pyqUi.filters.topicLabel}
              </label>
              <select
                value={teacherTopicFilter}
                onChange={(e) => setTeacherTopicFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
              >
                <option value="all">{t.pyqUi.filters.allTopics}</option>
                {PYQ_TOPICS.map((tp) => (
                  <option key={tp} value={tp}>
                    {resolveTopicLabel(tp, t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                {plus.teacher.assignmentFilterLabel}
              </label>
              <select
                value={teacherAssignmentFilter}
                onChange={(e) => setTeacherAssignmentFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
              >
                <option value="all">{plus.teacher.allAssignments}</option>
                <option value="student_path">{plus.teacher.studentPath}</option>
                <option value="exam_path">{plus.teacher.examPath}</option>
                <option value="worksheets">{plus.teacher.worksheetsTrack}</option>
              </select>
            </div>
          </div>

          {/* Class Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {tv.classAverageLabel}
              </p>
              <p className="mt-1.5 text-2xl font-black text-indigo-600 font-mono">
                {teacherData.classAverageAccuracy !== null
                  ? `${teacherData.classAverageAccuracy}%`
                  : '—'}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {tv.activeLearnersLabel}
              </p>
              <p className="mt-1.5 text-2xl font-black font-mono">
                {teacherData.activeProfilesWithDataCount} / {teacherData.students.length}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {tv.strongestClassTopic}
              </p>
              <p className="mt-1.5 text-sm font-extrabold text-emerald-600">
                {teacherData.strongestTopic
                  ? resolveTopicLabel(teacherData.strongestTopic, t)
                  : '—'}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {tv.weakestClassTopic}
              </p>
              <p className="mt-1.5 text-sm font-extrabold text-rose-600">
                {teacherData.weakestTopic
                  ? resolveTopicLabel(teacherData.weakestTopic, t)
                  : '—'}
              </p>
            </div>
          </div>

          {/* 1. Grouped Bar + 2. Classroom Line Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GroupedBarChart
              title={plus.teacher.groupedCompareTitle}
              maxVal={100}
              valueSuffix="%"
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              seriesMeta={[
                { key: 'accuracy', label: tv.cols.accuracy, color: '#4f46e5' },
                { key: 'completion', label: tv.cols.completion, color: '#10b981' },
              ]}
              groups={teacherData.students.map((st) => ({
                id: st.profileId,
                label: t.audience[st.audience] || st.profileId,
                values: {
                  accuracy: st.accuracyPct ?? 0,
                  completion: st.completionPct,
                },
              }))}
            />
            <LineTrendChart
              title={plus.teacher.classLineTitle}
              series={teacherData.classImprovementLine}
              valueSuffix="%"
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              strokeColor="#059669"
            />
          </div>

          {/* 3. Cohort Stacked Correct/Incorrect/Unanswered + 4. Assignment Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DifficultyStackedBarChart
              title={plus.teacher.cohortStackedTitle}
              correctLabel={ev.correctBar}
              incorrectLabel={ev.incorrectBar}
              unansweredLabel={plus.student.unansweredLabel}
              showUnanswered
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              rows={teacherData.students.map((st) => ({
                id: st.profileId,
                label: t.audience[st.audience] || st.profileId,
                correct: st.correct,
                incorrect: st.incorrect,
                unanswered: st.unanswered,
              }))}
            />
            <StudyDonutChart
              title={plus.teacher.assignmentPieTitle}
              valueSuffix=""
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              segments={teacherData.assignmentCompletionPie.map((seg) => ({
                ...seg,
                label:
                  seg.id === 'completed'
                    ? plus.teacher.completedSlice
                    : plus.teacher.pendingSlice,
              }))}
            />
          </div>

          {/* 5. Students vs Topics Heatmap & 6. Classroom Score Box Plot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MatrixHeatmapChart
              title={plus.teacher.studentTopicHeatmapTitle}
              valueSuffix="%"
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              cols={teacherData.heatmapTopics.map((tp) => ({
                key: tp,
                label: shortTopicLabel(tp, t),
              }))}
              rows={teacherData.studentTopicHeatmap.map((row) => ({
                id: row.profileId,
                rowLabel: t.audience[row.audience] || row.profileId,
                values: Object.fromEntries(
                  teacherData.heatmapTopics.map((tp) => [
                    tp,
                    row.cells[tp]?.accuracy ?? null,
                  ]),
                ),
              }))}
            />
            <BoxPlotChart
              title={plus.teacher.boxPlotTitle}
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              rows={teacherData.classroomBoxPlots.map((b) => ({
                ...b,
                label:
                  b.audience === 'cohort'
                    ? plus.teacher.allStudents
                    : t.audience[b.audience] || b.id,
              }))}
            />
          </div>

          {/* 7. Most Difficult Topics + 8. Overall Class Cumulative Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HorizontalBarChart
              title={plus.teacher.difficultTopicsTitle}
              maxValue={100}
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
              items={teacherData.mostDifficultTopics.map((item) => ({
                id: item.topic,
                label: resolveTopicLabel(item.topic, t),
                value: item.accuracy,
                displayRight: `${item.accuracy}% (✕${item.incorrect})`,
                colorClass: accuracyBarColor(item.accuracy),
              }))}
            />
            <AreaTrendChart
              title={plus.teacher.classAreaTitle}
              series={teacherData.classCumulativeArea}
              valueLabel={ev.correctBar}
              secondaryLabel={tv.cols.attempted}
              areaColor="#059669"
              theme={theme}
              emptyMessage={plus.teacher.emptyClass}
            />
          </div>

          {/* Individual Demo Profile Inspector */}
          {selectedCohortMember && (
            <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${surfaceCls}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold">
                    {tv.individualReportTitle}:{' '}
                    {t.audience[selectedCohortMember.audience] ||
                      selectedCohortMember.profileId}
                  </h4>
                  <p className={`text-xs ${mutedTextCls}`}>
                    Lessons: {selectedCohortMember.savedLessonsCount} · Worksheets:{' '}
                    {selectedCohortMember.savedWorksheetsCount} · Path:{' '}
                    {selectedCohortMember.completionPct}%
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {teacherData.allProfiles.map((st) => (
                    <button
                      key={st.profileId}
                      type="button"
                      onClick={() => setSelectedTeacherStudentId(st.profileId)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                        selectedCohortMember.profileId === st.profileId
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.audience[st.audience] || st.profileId}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW C: COMPETITIVE EXAM ANALYTICS (ALL 10 ITEMS)                */}
      {/* ================================================================ */}
      {activeSubTab === 'exam_analytics' && (
        <div className="space-y-5">
          {/* 5-Language Exam & Frequency Narrative + Voice Controls */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300">
              🏆 {examNarrative.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100">
              {examNarrative.body}
            </p>
            <SpeakControlsBar
              text={examNarrative.speakText}
              language={effectiveLang}
              sourceId="dashboard_exam"
              isDark={isDark}
            />
          </div>

          {/* Exam KPIs + Readiness Card */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {t.analyticsUi.kpis.attempts}
              </p>
              <p className="mt-1.5 text-2xl font-black font-mono">
                {examData.totalAttempts}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                ✓ {examData.correctCount} · ✕ {examData.incorrectCount}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {t.analyticsUi.kpis.accuracy}
              </p>
              <p className="mt-1.5 text-2xl font-black text-indigo-600 font-mono">
                {examData.overallAccuracy}%
              </p>
            </div>
            <div className={`rounded-2xl border p-4 shadow-sm ${surfaceCls}`}>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                {ev.avgTimePerQuestionLabel}
              </p>
              <p className="mt-1.5 text-2xl font-black text-cyan-600 font-mono">
                {examData.avgTimePerQuestionSec}s
              </p>
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm text-slate-900 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase text-indigo-900">
                  {ev.readinessTitle}
                </p>
                {examData.readinessScore !== null && (
                  <span className="rounded-lg bg-indigo-600 text-white px-2 py-0.5 font-mono text-xs font-black">
                    {examData.readinessScore}/100
                  </span>
                )}
              </div>
              <p className="text-sm font-extrabold text-indigo-950">
                {ev.readinessLevels[examData.readinessStatus]}
              </p>
              {examData.readinessStatus === 'insufficient' && (
                <p className="text-xs text-indigo-800">{ev.readinessDescInsufficient}</p>
              )}
            </div>
          </div>

          {/* 1. Year-Wise PYQ Frequency 1999-2026 + 2. Topic-Wise PYQ Frequency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <YearCoverageTimelineChart
              title={plus.exam.yearPyqFreqTitle}
              years={examData.yearCoverageSeries}
              indexedLabel={plus.freq.indexedLegend}
              unknownLabel={plus.freq.unknownLegend}
              theme={theme}
            />
            <HorizontalBarChart
              title={plus.exam.topicPyqFreqTitle}
              maxValue={Math.max(1, ...examData.verifiedFreq.rankedTopics.map((r) => r.count))}
              theme={theme}
              emptyMessage={ev.emptyScatter}
              items={examData.verifiedFreq.rankedTopics.map((r) => ({
                id: r.topic,
                label: resolveTopicLabel(r.topic, t),
                value: r.count,
                displayRight: String(r.count),
                colorClass: 'bg-cyan-600',
              }))}
            />
          </div>

          {/* 3. Exam-Wise Frequency + 4. Difficulty Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HorizontalBarChart
              title={plus.exam.examPyqFreqTitle}
              maxValue={Math.max(1, ...Object.values(examData.fullArchiveFreq.byExam))}
              theme={theme}
              emptyMessage={ev.emptyScatter}
              items={PYQ_EXAMS.map((exId) => ({
                id: exId,
                label: t.pyqUi.exams[exId],
                value: examData.fullArchiveFreq.byExam[exId] ?? 0,
                displayRight: `${examData.verifiedFreq.byExam[exId] ?? 0} PYQ / ${examData.fullArchiveFreq.byExam[exId] ?? 0} Total`,
                colorClass: 'bg-indigo-500',
              }))}
            />
            <StudyDonutChart
              title={plus.exam.difficultyDistPieTitle}
              valueSuffix=""
              theme={theme}
              emptyMessage={ev.emptyScatter}
              segments={PYQ_DIFFICULTIES.map((df) => ({
                id: df,
                label: t.pyqUi.difficulties[df],
                value: examData.fullArchiveFreq.byDifficulty[df] ?? 0,
                color:
                  df === 'easy'
                    ? '#10b981'
                    : df === 'medium'
                      ? '#f59e0b'
                      : '#f43f5e',
              }))}
            />
          </div>

          {/* 5. Mock Score Line + 6. Speed vs Accuracy Scatter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LineTrendChart
              title={ev.mockHistoryTitle}
              series={examData.mockLineSeries}
              valueSuffix="%"
              theme={theme}
              emptyMessage={ev.emptyMockHistory}
              strokeColor="#0891b2"
            />
            <SpeedAccuracyScatterChart
              title={ev.speedVsAccuracyTitle}
              xAxisLabel={ev.xSpeedSec}
              yAxisLabel={ev.yAccuracyPct}
              theme={theme}
              emptyMessage={ev.emptyScatter}
              points={examData.speedAccuracyScatter.map((pt) => ({
                ...pt,
                label: resolveTopicLabel(pt.topic, t),
                shortLabel: shortTopicLabel(pt.topic, t),
              }))}
            />
          </div>

          {/* 7. Exam Readiness Radar + 8. Mock Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopicRadarChart
              title={plus.exam.readinessRadarTitle}
              theme={theme}
              emptyMessage={sv.emptyChartsHint}
              axes={examData.readinessRadarAxes.map((s) => ({
                label: resolveTopicLabel(s.topic, t),
                shortLabel: shortTopicLabel(s.topic, t),
                value: s.accuracy,
              }))}
            />
            <HistogramChart
              title={plus.exam.mockHistogramTitle}
              bins={examData.mockHistogram}
              emptyMessage={ev.emptyMockHistory}
              theme={theme}
            />
          </div>

          {/* 9. Topic Strengths/Weaknesses + 10. Most Tested Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DifficultyStackedBarChart
              title={plus.exam.topicStrengthsTitle}
              correctLabel={ev.correctBar}
              incorrectLabel={ev.incorrectBar}
              emptyMessage={sv.noAttemptsTitle}
              theme={theme}
              rows={examData.topicStats.map((item) => ({
                id: item.topic,
                label: resolveTopicLabel(item.topic, t),
                correct: item.correct,
                incorrect: item.incorrect,
              }))}
            />
            <HorizontalBarChart
              title={plus.exam.mostTestedTitle}
              maxValue={Math.max(1, ...examData.fullArchiveFreq.rankedTopics.map((r) => r.count))}
              theme={theme}
              emptyMessage={ev.emptyScatter}
              items={examData.fullArchiveFreq.rankedTopics.map((row) => {
                const usr = examData.topicStats.find((s) => s.topic === row.topic)
                return {
                  id: row.topic,
                  label: resolveTopicLabel(row.topic, t),
                  value: row.count,
                  displayRight: usr ? `${row.count}q · ${usr.accuracy}%` : `${row.count}q`,
                  colorClass: 'bg-cyan-600',
                }
              })}
            />
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 2 DEDICATED TAB: ADVANCED PYQ FREQUENCY ANALYSIS         */}
      {/* ================================================================ */}
      {activeSubTab === 'frequency' && (
        <div className="space-y-5">
          {/* Multi-Dimensional Filter Card */}
          <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${surfaceCls}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold">{plus.freq.title}</h3>
                <p className={`text-xs ${mutedTextCls}`}>
                  {t.pyqUi.frequencyUi.totalQuestionsLabel}:{' '}
                  <strong className="font-mono">{frequencyData.totalMatching}</strong> ·{' '}
                  {plus.freq.undatedCountLabel}:{' '}
                  <strong className="font-mono">{frequencyData.undatedPracticeCount}</strong>
                </p>
                <div className="mt-2">
                  <SpeakControlsBar
                    compact
                    text={examNarrative.speakText}
                    language={language}
                    sourceId="pyq_frequency_summary"
                    isDark={isDark}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['verified_pyq', 'pyq_style_practice', 'all'].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setFreqScope(sc)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      freqScope === sc
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t.pyqUi.authenticityTabs[sc]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  {plus.freq.yearFrom}
                </label>
                <select
                  value={freqYearFrom}
                  onChange={(e) => setFreqYearFrom(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  {YEARS_DESC.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  {plus.freq.yearTo}
                </label>
                <select
                  value={freqYearTo}
                  onChange={(e) => setFreqYearTo(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  {YEARS_DESC.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  {t.pyqUi.filters.examLabel}
                </label>
                <select
                  value={freqExamFilter}
                  onChange={(e) => setFreqExamFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="all">{t.pyqUi.filters.allExams}</option>
                  {PYQ_EXAMS.map((ex) => (
                    <option key={ex} value={ex}>
                      {t.pyqUi.exams[ex]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  {t.pyqUi.filters.topicLabel}
                </label>
                <select
                  value={freqTopicFilter}
                  onChange={(e) => setFreqTopicFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="all">{t.pyqUi.filters.allTopics}</option>
                  {PYQ_TOPICS.map((tp) => (
                    <option key={tp} value={tp}>
                      {resolveTopicLabel(tp, t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  {t.pyqUi.filters.difficultyLabel}
                </label>
                <select
                  value={freqDiffFilter}
                  onChange={(e) => setFreqDiffFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="all">{t.pyqUi.filters.allDifficulties}</option>
                  {PYQ_DIFFICULTIES.map((df) => (
                    <option key={df} value={df}>
                      {t.pyqUi.difficulties[df]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <span>{plus.freq.unknownNotice}</span>
            </div>
          </div>

          {/* Year-wise 1999-2026 Unknown Coverage Timeline */}
          <YearCoverageTimelineChart
            title={t.pyqUi.frequencyUi.perYearChartTitle}
            years={frequencyData.byYear}
            indexedLabel={plus.freq.indexedLegend}
            unknownLabel={plus.freq.unknownLegend}
            theme={theme}
            emptyMessage={t.pyqUi.frequencyUi.missingExamsNote}
          />

          {/* Per Exam + Per Topic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HorizontalBarChart
              title={t.pyqUi.frequencyUi.perExamChartTitle}
              maxValue={Math.max(1, ...Object.values(frequencyData.byExam))}
              theme={theme}
              emptyMessage={t.pyqUi.frequencyUi.missingExamsNote}
              items={PYQ_EXAMS.map((exId) => ({
                id: exId,
                label: t.pyqUi.exams[exId],
                value: frequencyData.byExam[exId] ?? 0,
                displayRight: String(frequencyData.byExam[exId] ?? 0),
                colorClass: 'bg-indigo-500',
              }))}
            />
            <HorizontalBarChart
              title={t.pyqUi.frequencyUi.perTopicChartTitle}
              maxValue={Math.max(1, ...frequencyData.rankedTopics.map((r) => r.count))}
              theme={theme}
              emptyMessage={t.pyqUi.frequencyUi.missingExamsNote}
              items={frequencyData.rankedTopics.map((r) => ({
                id: r.topic,
                label: resolveTopicLabel(r.topic, t),
                value: r.count,
                displayRight: String(r.count),
                colorClass: 'bg-cyan-600',
              }))}
            />
          </div>

          {/* Difficulty Distribution by Exam + Repeated Concepts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GroupedBarChart
              title={plus.freq.diffByExamTitle}
              maxVal={Math.max(
                4,
                ...frequencyData.difficultyByExam.flatMap((d) => [
                  d.easy,
                  d.medium,
                  d.advanced,
                ]),
              )}
              valueSuffix=""
              theme={theme}
              emptyMessage={t.pyqUi.frequencyUi.missingExamsNote}
              seriesMeta={[
                { key: 'easy', label: t.pyqUi.difficulties.easy, color: '#10b981' },
                { key: 'medium', label: t.pyqUi.difficulties.medium, color: '#f59e0b' },
                { key: 'advanced', label: t.pyqUi.difficulties.advanced, color: '#f43f5e' },
              ]}
              groups={frequencyData.difficultyByExam.map((d) => ({
                id: d.exam,
                label: t.pyqUi.exams[d.exam].split(' ')[0],
                values: { easy: d.easy, medium: d.medium, advanced: d.advanced },
              }))}
            />

            <HorizontalBarChart
              title={plus.freq.repeatedConceptsTitle}
              maxValue={Math.max(1, ...frequencyData.rankedConcepts.map((c) => c.count))}
              theme={theme}
              emptyMessage={t.pyqUi.frequencyUi.missingExamsNote}
              items={frequencyData.rankedConcepts.map((c, idx) => ({
                id: `concept_${idx}`,
                label: c.formula,
                value: c.count,
                displayRight: `${c.count}×`,
                colorClass: 'bg-amber-500',
              }))}
            />
          </div>

          {/* Year-to-Year Topic Trends Matrix */}
          <MatrixHeatmapChart
            title={plus.freq.topicOverTimeTitle}
            theme={theme}
            emptyMessage={t.pyqUi.frequencyUi.missingExamsNote}
            cols={PYQ_TOPICS.map((tp) => ({
              key: tp,
              label: shortTopicLabel(tp, t),
            }))}
            rows={frequencyData.yearTopicTrendRows.map((row) => ({
              id: String(row.year),
              rowLabel: String(row.year),
              values: Object.fromEntries(
                PYQ_TOPICS.map((tp) => [
                  tp,
                  row.cells[tp] > 0 ? row.cells[tp] : null,
                ]),
              ),
            }))}
          />
        </div>
      )}

      {/* ================================================================ */}
      {/* BOOKMARKS TAB                                                    */}
      {/* ================================================================ */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-5">
          <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${surfaceCls}`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              {t.bookmarks.shapesHeading} ({bookmarkedShapes.length})
            </h3>
            {bookmarkedShapes.length === 0 ? (
              <p className={`text-xs ${mutedTextCls}`}>{t.bookmarks.emptyHint}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bookmarkedShapes.map((shapeId) => (
                  <div
                    key={shapeId}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3.5 py-2.5"
                  >
                    <span className="text-xs font-bold">
                      {shapeDisplayName(t, shapeId)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {jumpToShape && (
                        <button
                          type="button"
                          onClick={() => jumpToShape(shapeId)}
                          className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-bold"
                        >
                          {t.bookmarks.openButton}
                        </button>
                      )}
                      {onToggleBookmarkShape && (
                        <button
                          type="button"
                          onClick={() => onToggleBookmarkShape(shapeId)}
                          aria-label={t.bookmarks.removeShape}
                          className="rounded-lg border border-slate-300 p-1 text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${surfaceCls}`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              {t.bookmarks.questionsHeading} ({bookmarkedQuestions.length})
            </h3>
            {bookmarkedQuestions.length === 0 ? (
              <p className={`text-xs ${mutedTextCls}`}>{t.bookmarks.emptyTitle}</p>
            ) : (
              <div className="space-y-2.5">
                {bookmarkedQuestions.map((qId) => {
                  const qObj = practiceContent[qId]
                  const idx = CLASS_10_PRACTICE_IDS.indexOf(qId)
                  const navArg = idx >= 0 ? idx : 0
                  return (
                    <div
                      key={qId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3.5 py-2.5"
                    >
                      <span className="text-xs font-bold">{qObj?.title || qId}</span>
                      <div className="flex items-center gap-1.5">
                        {jumpToQuestion && (
                          <button
                            type="button"
                            onClick={() => jumpToQuestion(navArg)}
                            className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-bold"
                          >
                            {t.bookmarks.openButton}
                          </button>
                        )}
                        {onToggleBookmarkQuestion && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmarkQuestion(qId)}
                            aria-label={t.bookmarks.removeQuestion}
                            className="rounded-lg border border-slate-300 p-1 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${surfaceCls}`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              {adv.bookmarkPyqSectionTitle} ({bookmarkedPyqs.length})
            </h3>
            {bookmarkedPyqs.length === 0 ? (
              <p className={`text-xs ${mutedTextCls}`}>{adv.bookmarkPyqEmpty}</p>
            ) : (
              <div className="space-y-2.5">
                {bookmarkedPyqs.map((pyqId) => {
                  const item = pyqMap.get(pyqId)
                  if (!item) return null
                  return (
                    <div
                      key={pyqId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3.5 py-2.5"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-indigo-100 text-indigo-800 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">
                            {t.pyqUi.exams[item.exam] || item.exam}
                          </span>
                          {item.year && (
                            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                              {item.year}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold truncate">{item.question}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {onOpenPyq && (
                          <button
                            type="button"
                            onClick={() => onOpenPyq(pyqId)}
                            className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-bold"
                          >
                            {adv.openPyqCta}
                          </button>
                        )}
                        {onToggleBookmarkPyq && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmarkPyq(pyqId)}
                            aria-label={t.bookmarks.removeQuestion}
                            className="rounded-lg border border-slate-300 p-1 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HELP & ABOUT TABS */}
      {activeSubTab === 'help' && (
        <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-5 ${surfaceCls}`}>
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            {ht.helpTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {['s1', 's2', 's3', 's4'].map((stepKey) => (
              <div
                key={stepKey}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-900 space-y-1"
              >
                <p className="text-xs sm:text-sm font-extrabold">
                  {ht.helpSteps[stepKey].title}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ht.helpSteps[stepKey].desc}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200/70 pt-4 space-y-2">
            <h4 className="text-sm font-extrabold uppercase tracking-wide">
              {ht.shortcutsTitle}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>• {ht.shortcuts.search}</li>
              <li>• {ht.shortcuts.closeModal}</li>
              <li>• {ht.shortcuts.navigateTabs}</li>
              <li>• {ht.shortcuts.adjustSliders}</li>
            </ul>
          </div>
        </div>
      )}

      {activeSubTab === 'about' && (
        <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4 ${surfaceCls}`}>
          <h3 className="text-lg font-extrabold">{ht.aboutTitle}</h3>
          <p className={`text-sm leading-relaxed ${mutedTextCls}`}>{ht.aboutPurpose}</p>
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wide">
              {ht.aboutObjectivesTitle}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm list-disc pl-5">
              <li>{ht.aboutObjectives.o1}</li>
              <li>{ht.aboutObjectives.o2}</li>
              <li>{ht.aboutObjectives.o3}</li>
              <li>{ht.aboutObjectives.o4}</li>
            </ul>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-slate-900 space-y-1.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-indigo-900">
              {ht.aboutArchTitle}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">{ht.aboutArchBody}</p>
            <p className="text-xs font-bold text-indigo-950">{ht.aboutHonestyNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningHub
