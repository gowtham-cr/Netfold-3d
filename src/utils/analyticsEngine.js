import { LEARNING_PATH_STEPS } from '../data/learningPaths.js'
import {
  ALL_ARCHIVE_QUESTIONS,
  ARCHIVE_END_YEAR,
  ARCHIVE_START_YEAR,
  PYQ_DIFFICULTIES,
  PYQ_EXAMS,
  PYQ_STYLE_PRACTICE,
  PYQ_TOPICS,
  VERIFIED_PYQS,
  computeArchiveFrequencyStats,
} from '../data/pyqArchive.js'
import { QUESTION_BANK } from '../data/questionBank.js'
import { MISSION_IDS } from '../data/missions.js'
import { MISTAKE_CATEGORIES } from './mistakeDetective.js'
import { DEMO_PROFILES, loadProfileData } from './profileStorage.js'

const DAY_MS = 24 * 60 * 60 * 1000
const TRACKED_QUESTION_POOL_SIZE =
  ALL_ARCHIVE_QUESTIONS.length + QUESTION_BANK.length

/**
 * Formats a timestamp as YYYY-MM-DD in local time for calendar heatmap & trend bucketing.
 */
export function toIsoDayKey(ts) {
  if (!Number.isFinite(ts)) return null
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toIsoWeekKey(ts) {
  if (!Number.isFinite(ts)) return null
  const d = new Date(ts)
  const dayNum = d.getDay() || 7
  d.setDate(d.getDate() + 4 - dayNum)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil(((d - yearStart) / DAY_MS + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function toMonthKey(ts) {
  if (!Number.isFinite(ts)) return null
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Filters records by date window ('7d' | '30d' | 'all') strictly using recorded timestamps.
 */
export function filterRecordsByDateRange(records, rangeKey = 'all', nowMs = Date.now()) {
  const list = Array.isArray(records) ? records : []
  if (rangeKey === 'all') return list
  const days = rangeKey === '7d' ? 7 : 30
  const cutoff = nowMs - days * DAY_MS
  return list.filter((rec) => Number.isFinite(rec?.timestamp) && rec.timestamp >= cutoff)
}

function combineAllAttempts(profileData, rangeKey, nowMs, topicFilter = 'all') {
  const examList = filterRecordsByDateRange(
    profileData?.examAttempts ?? [],
    rangeKey,
    nowMs,
  ).map((item) => ({ ...item, source: 'exam_arena' }))

  const pyqList = filterRecordsByDateRange(
    profileData?.pyqAttempts ?? [],
    rangeKey,
    nowMs,
  ).map((item) => ({ ...item, source: 'pyq_archive' }))

  return [...examList, ...pyqList]
    .filter((item) => topicFilter === 'all' || item.topic === topicFilter)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
}

function summarizeByTopic(attempts) {
  const map = new Map()
  for (const att of attempts) {
    const topic = att.topic || 'general'
    const curr = map.get(topic) ?? {
      topic,
      total: 0,
      correct: 0,
      incorrect: 0,
      totalSec: 0,
    }
    curr.total += 1
    if (att.correct) {
      curr.correct += 1
    } else {
      curr.incorrect += 1
    }
    curr.totalSec += Number.isFinite(att.timeSpentSec) ? att.timeSpentSec : 0
    map.set(topic, curr)
  }

  return Array.from(map.values()).map((entry) => ({
    topic: entry.topic,
    total: entry.total,
    correct: entry.correct,
    incorrect: entry.incorrect,
    accuracy: Math.round((entry.correct / entry.total) * 100),
    avgTimeSec: Number((entry.totalSec / entry.total).toFixed(1)),
    totalSec: entry.totalSec,
  }))
}

/**
 * Builds bucketed time series ('daily' | 'weekly' | 'monthly') strictly from real attempts.
 */
function buildTimeSeries(combined, granularity = 'daily') {
  if (combined.length === 0) return []
  const keyFn =
    granularity === 'weekly'
      ? toIsoWeekKey
      : granularity === 'monthly'
        ? toMonthKey
        : toIsoDayKey

  const groups = new Map()
  combined.forEach((att, idx) => {
    const rawKey = keyFn(att.timestamp)
    const bucketKey = rawKey ?? `S${Math.floor(idx / 3) + 1}`
    const g = groups.get(bucketKey) ?? { label: bucketKey, total: 0, correct: 0 }
    g.total += 1
    if (att.correct) g.correct += 1
    groups.set(bucketKey, g)
  })

  return Array.from(groups.values()).map((g) => ({
    label: /^\d{4}-\d{2}-\d{2}$/.test(g.label) ? g.label.slice(5) : g.label,
    fullKey: g.label,
    value: Math.round((g.correct / g.total) * 100),
    total: g.total,
    correct: g.correct,
  }))
}

/**
 * Builds 5-bin score distribution histogram (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
 * from actual mock sessions + remediation sessions + daily quiz accuracy buckets.
 */
export function buildScoreHistogram(scoresPct = []) {
  const bins = [
    { id: '0-20', label: '0–20%', min: 0, max: 20, count: 0 },
    { id: '21-40', label: '21–40%', min: 21, max: 40, count: 0 },
    { id: '41-60', label: '41–60%', min: 41, max: 60, count: 0 },
    { id: '61-80', label: '61–80%', min: 61, max: 80, count: 0 },
    { id: '81-100', label: '81–100%', min: 81, max: 100, count: 0 },
  ]
  for (const raw of scoresPct) {
    if (!Number.isFinite(raw)) continue
    const val = Math.max(0, Math.min(100, Math.round(raw)))
    const bin = bins.find((b) => val >= b.min && val <= b.max) ?? bins[0]
    bin.count += 1
  }
  return bins
}

/**
 * Computes 5-number summary [min, q1, median, q3, max] cleanly from numeric array.
 */
export function computeBoxPlotStats(values = []) {
  const sorted = values
    .filter((v) => Number.isFinite(v))
    .slice()
    .sort((a, b) => a - b)
  if (sorted.length === 0) return null

  const percentile = (p) => {
    const pos = (sorted.length - 1) * p
    const base = Math.floor(pos)
    const rest = pos - base
    if (sorted[base + 1] !== undefined) {
      return Number((sorted[base] + rest * (sorted[base + 1] - sorted[base])).toFixed(1))
    }
    return Number(sorted[base].toFixed(1))
  }

  const mean = Number(
    (sorted.reduce((s, v) => s + v, 0) / sorted.length).toFixed(1),
  )

  return {
    count: sorted.length,
    min: Number(sorted[0].toFixed(1)),
    q1: percentile(0.25),
    median: percentile(0.5),
    q3: percentile(0.75),
    max: Number(sorted[sorted.length - 1].toFixed(1)),
    mean,
  }
}

/**
 * Builds complete Student Analytics (Dashboard A) strictly from real stored data.
 */
export function buildStudentAnalytics({
  profileData,
  learningProgress,
  missionsProgress,
  rangeKey = 'all',
  granularity = 'daily',
  topicFilter = 'all',
  nowMs = Date.now(),
}) {
  const combined = combineAllAttempts(profileData, rangeKey, nowMs, topicFilter)
  const attemptedCount = combined.length
  const correctCount = combined.filter((a) => a.correct).length
  const incorrectCount = attemptedCount - correctCount
  const accuracyPct =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0

  const totalTimeSec = combined.reduce(
    (sum, a) => sum + (Number.isFinite(a.timeSpentSec) ? a.timeSpentSec : 0),
    0,
  )
  const avgTimePerQuestionSec =
    attemptedCount > 0 ? Number((totalTimeSec / attemptedCount).toFixed(1)) : 0

  // 1. Line Graph (Daily / Weekly / Monthly learning progress)
  const progressLineSeries = buildTimeSeries(combined, granularity)

  // 7. Cumulative Area Graph
  const cumulativeAreaSeries = []
  let cumTotal = 0
  let cumCorrect = 0
  combined.forEach((att, idx) => {
    cumTotal += 1
    if (att.correct) cumCorrect += 1
    const dateLbl = toIsoDayKey(att.timestamp)?.slice(5) ?? `#${idx + 1}`
    cumulativeAreaSeries.push({
      label: dateLbl,
      cumulativeAttempted: cumTotal,
      cumulativeCorrect: cumCorrect,
      value: cumCorrect,
    })
  })

  // 2 & 4. Topic Bar + Radar
  const topicStats = summarizeByTopic(combined).sort((a, b) => b.total - a.total)
  const radarSeries = topicStats.slice(0, 6)

  // 3. Correct vs Incorrect vs Unanswered Pie/Donut breakdown (real pool comparison)
  const distinctAttemptedQIds = new Set(
    combined.map((a) => a.questionId).filter(Boolean),
  )
  const unansweredInPool = Math.max(
    0,
    TRACKED_QUESTION_POOL_SIZE - distinctAttemptedQIds.size,
  )
  const statusPieBreakdown =
    attemptedCount > 0
      ? [
          { id: 'correct', value: correctCount, color: '#10b981' },
          { id: 'incorrect', value: incorrectCount, color: '#f43f5e' },
          { id: 'unanswered', value: unansweredInPool, color: '#94a3b8' },
        ]
      : []

  // Study time distribution donut (maintained cleanly for backwards compatibility)
  let examSec = 0
  let pyqSec = 0
  for (const att of combined) {
    const sec = Number.isFinite(att.timeSpentSec) ? att.timeSpentSec : 0
    if (att.source === 'pyq_archive') pyqSec += sec
    else examSec += sec
  }
  const studyTimeDonut = []
  if (examSec > 0) studyTimeDonut.push({ id: 'exam_arena', seconds: examSec })
  if (pyqSec > 0) studyTimeDonut.push({ id: 'pyq_archive', seconds: pyqSec })

  // 5. Weekly 28-day activity calendar heatmap from exact ISO dates
  const dayCounts = new Map()
  for (const att of combined) {
    const k = toIsoDayKey(att.timestamp)
    if (k) dayCounts.set(k, (dayCounts.get(k) ?? 0) + 1)
  }
  const calendarHeatmap = []
  for (let offset = 27; offset >= 0; offset -= 1) {
    const ts = nowMs - offset * DAY_MS
    const key = toIsoDayKey(ts)
    calendarHeatmap.push({
      dateKey: key,
      count: dayCounts.get(key) ?? 0,
    })
  }

  // 6. Histogram: quiz and mock-test score distribution
  const filteredMocks = filterRecordsByDateRange(
    profileData?.mockSessions ?? [],
    rangeKey,
    nowMs,
  )
  const filteredRem = filterRecordsByDateRange(
    profileData?.remediationSessions ?? [],
    rangeKey,
    nowMs,
  )
  const quizBucketScores = progressLineSeries.map((pt) => pt.value)
  const allScoreSamples = [
    ...filteredMocks.map((m) => m.accuracy),
    ...filteredRem.map((r) => r.afterAccuracy),
    ...(filteredMocks.length === 0 && filteredRem.length === 0 ? quizBucketScores : []),
  ]
  const scoreHistogram = buildScoreHistogram(allScoreSamples)

  // 8. Stacked bar chart: Easy / Medium / Advanced performance (Correct / Incorrect / Unanswered)
  const diffPoolCounts = { easy: 0, medium: 0, advanced: 0 }
  for (const q of ALL_ARCHIVE_QUESTIONS) {
    if (diffPoolCounts[q.difficulty] !== undefined) diffPoolCounts[q.difficulty] += 1
  }
  for (const q of QUESTION_BANK) {
    if (diffPoolCounts[q.difficulty] !== undefined) diffPoolCounts[q.difficulty] += 1
  }
  const diffMap = {
    easy: { difficulty: 'easy', correct: 0, incorrect: 0, qIds: new Set() },
    medium: { difficulty: 'medium', correct: 0, incorrect: 0, qIds: new Set() },
    advanced: { difficulty: 'advanced', correct: 0, incorrect: 0, qIds: new Set() },
  }
  for (const att of combined) {
    const key = diffMap[att.difficulty] ? att.difficulty : 'medium'
    if (att.correct) diffMap[key].correct += 1
    else diffMap[key].incorrect += 1
    if (att.questionId) diffMap[key].qIds.add(att.questionId)
  }
  const difficultyStacked = ['easy', 'medium', 'advanced'].map((key) => ({
    difficulty: key,
    correct: diffMap[key].correct,
    incorrect: diffMap[key].incorrect,
    unanswered: Math.max(0, diffPoolCounts[key] - diffMap[key].qIds.size),
    total: diffMap[key].correct + diffMap[key].incorrect,
  }))

  // Personal improvement trend comparing earlier half vs second half
  let improvementDelta = 0
  let trendStatus = 'insufficient'
  if (combined.length >= 4) {
    const mid = Math.floor(combined.length / 2)
    const firstHalf = combined.slice(0, mid)
    const secondHalf = combined.slice(mid)
    const acc1 = Math.round(
      (firstHalf.filter((x) => x.correct).length / firstHalf.length) * 100,
    )
    const acc2 = Math.round(
      (secondHalf.filter((x) => x.correct).length / secondHalf.length) * 100,
    )
    improvementDelta = acc2 - acc1
    trendStatus =
      improvementDelta > 3 ? 'up' : improvementDelta < -3 ? 'down' : 'steady'
  }

  const weakTopics = topicStats
    .filter((t) => t.accuracy < 65)
    .map((t) => t.topic)
  const completedMissions = MISSION_IDS.filter(
    (id) => missionsProgress?.[id]?.completed,
  ).length

  return {
    attemptedCount,
    correctCount,
    incorrectCount,
    accuracyPct,
    avgTimePerQuestionSec,
    shapesExploredCount: learningProgress?.exploredShapes?.length ?? 0,
    practiceReviewedCount: learningProgress?.visitedQuestions?.length ?? 0,
    completedMissions,
    completedPathSteps: (profileData?.completedPathSteps ?? []).length,
    progressLineSeries,
    cumulativeAreaSeries,
    topicStats,
    radarSeries,
    statusPieBreakdown,
    studyTimeDonut,
    totalStudySec: examSec + pyqSec,
    calendarHeatmap,
    scoreHistogram,
    hasScoreHistogramData: allScoreSamples.length > 0,
    difficultyStacked,
    improvementDelta,
    trendStatus,
    recommendedRevisionTopics: weakTopics,
  }
}

/**
 * Builds complete Teacher Analytics (Dashboard B) across local demo profiles
 * with Student, Topic, Date, and Assignment/Track filters.
 */
export function buildTeacherAnalytics({
  rangeKey = 'all',
  studentFilter = 'all',
  topicFilter = 'all',
  assignmentFilter = 'all',
  nowMs = Date.now(),
} = {}) {
  const pathStepsForFilter = LEARNING_PATH_STEPS.filter((step) => {
    if (assignmentFilter === 'student_path') return step.audience === 'student'
    if (assignmentFilter === 'exam_path') return step.audience === 'exam'
    return true
  })
  const expectedPathDenominator =
    assignmentFilter === 'student_path'
      ? pathStepsForFilter.length
      : assignmentFilter === 'exam_path'
        ? pathStepsForFilter.length
        : LEARNING_PATH_STEPS.filter((s) => s.audience === 'student').length

  const validStepIds = new Set(pathStepsForFilter.map((s) => s.id))

  const allProfilesData = DEMO_PROFILES.map((prof) => {
    const data = loadProfileData(prof.id)
    const combined = combineAllAttempts(data, rangeKey, nowMs, topicFilter)
    const attempted = combined.length
    const correct = combined.filter((a) => a.correct).length
    const incorrect = attempted - correct
    const distinctIds = new Set(combined.map((a) => a.questionId).filter(Boolean))
    const unanswered =
      attempted > 0 ? Math.max(0, TRACKED_QUESTION_POOL_SIZE - distinctIds.size) : 0
    const accuracyPct = attempted > 0 ? Math.round((correct / attempted) * 100) : null

    const mocks = filterRecordsByDateRange(data.mockSessions ?? [], rangeKey, nowMs)
    const rem = filterRecordsByDateRange(data.remediationSessions ?? [], rangeKey, nowMs)

    const completedMatchingSteps = (data.completedPathSteps ?? []).filter((id) =>
      assignmentFilter === 'all' ? true : validStepIds.has(id),
    ).length
    const completionPct =
      expectedPathDenominator > 0
        ? Math.min(100, Math.round((completedMatchingSteps / expectedPathDenominator) * 100))
        : 0

    const topicBreakdown = summarizeByTopic(combined)
    const dailyScores = buildTimeSeries(combined, 'daily').map((pt) => pt.value)
    const scoreSamples = [
      ...mocks.map((m) => m.accuracy),
      ...rem.map((r) => r.afterAccuracy),
      ...dailyScores,
    ]
    const boxStats = computeBoxPlotStats(scoreSamples)

    return {
      profileId: prof.id,
      audience: prof.audience,
      attempted,
      correct,
      incorrect,
      unanswered,
      accuracyPct,
      mocksDone: mocks.length,
      completionPct,
      completedSteps: completedMatchingSteps,
      expectedSteps: expectedPathDenominator,
      savedLessonsCount: (data.savedLessons ?? []).length,
      savedWorksheetsCount: (data.savedWorksheets ?? []).length,
      topicBreakdown,
      boxStats,
      scoreSamples,
      combined,
      trend: mocks.slice(-6).map((m, idx) => ({
        label: `M${idx + 1}`,
        value: Number.isFinite(m.accuracy) ? m.accuracy : 0,
      })),
    }
  })

  const filteredProfiles =
    studentFilter === 'all'
      ? allProfilesData
      : allProfilesData.filter((p) => p.profileId === studentFilter)

  const activeWithAttempts = filteredProfiles.filter((s) => s.attempted > 0)
  const classAverageAccuracy =
    activeWithAttempts.length > 0
      ? Math.round(
          activeWithAttempts.reduce((acc, s) => acc + (s.accuracyPct ?? 0), 0) /
            activeWithAttempts.length,
        )
      : null

  const allAttemptsFiltered = filteredProfiles
    .flatMap((p) => p.combined)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))

  // 2. Classroom improvement over time line graph
  const classImprovementLine = buildTimeSeries(allAttemptsFiltered, 'daily')

  // 8. Overall cumulative class area chart
  const classCumulativeArea = []
  let clsTotal = 0
  let clsCorrect = 0
  allAttemptsFiltered.forEach((att, idx) => {
    clsTotal += 1
    if (att.correct) clsCorrect += 1
    classCumulativeArea.push({
      label: toIsoDayKey(att.timestamp)?.slice(5) ?? `#${idx + 1}`,
      cumulativeAttempted: clsTotal,
      cumulativeCorrect: clsCorrect,
      value: clsTotal,
    })
  })

  // 7. Topic Stats & Most Difficult Topics (lowest accuracy first)
  const classTopicStats = summarizeByTopic(allAttemptsFiltered).sort(
    (a, b) => b.accuracy - a.accuracy,
  )
  const mostDifficultTopics = [...classTopicStats]
    .sort((a, b) => a.accuracy - b.accuracy || b.incorrect - a.incorrect)

  // 4. Assignment & Path Completion Pie
  const totalCompletedAssign = filteredProfiles.reduce(
    (s, p) => s + p.completedSteps + (assignmentFilter === 'worksheets' ? p.savedWorksheetsCount : 0),
    0,
  )
  const totalExpectedAssign = filteredProfiles.reduce(
    (s, p) => s + Math.max(1, p.expectedSteps),
    0,
  )
  const assignmentCompletionPie = [
    {
      id: 'completed',
      value: totalCompletedAssign,
      color: '#10b981',
    },
    {
      id: 'pending',
      value: Math.max(0, totalExpectedAssign - totalCompletedAssign),
      color: '#cbd5e1',
    },
  ]

  // 5. Heatmap: Demo Profiles vs Mensuration Topics
  const activeTopics = Array.from(
    new Set(classTopicStats.map((t) => t.topic)),
  )
  const studentTopicHeatmap = filteredProfiles.map((prof) => {
    const map = new Map(prof.topicBreakdown.map((t) => [t.topic, t]))
    return {
      profileId: prof.profileId,
      audience: prof.audience,
      cells: Object.fromEntries(
        activeTopics.map((tp) => [
          tp,
          map.has(tp)
            ? { accuracy: map.get(tp).accuracy, total: map.get(tp).total }
            : null,
        ]),
      ),
    }
  })

  // 6. Box Plots per profile + overall class
  const allClassSamples = filteredProfiles.flatMap((p) => p.scoreSamples)
  const overallBox = computeBoxPlotStats(allClassSamples)
  const classroomBoxPlots = [
    ...filteredProfiles
      .filter((p) => p.boxStats !== null)
      .map((p) => ({
        id: p.profileId,
        audience: p.audience,
        ...p.boxStats,
      })),
    ...(overallBox && filteredProfiles.length > 1
      ? [{ id: 'cohort_all', audience: 'cohort', ...overallBox }]
      : []),
  ]

  return {
    students: filteredProfiles,
    allProfiles: allProfilesData,
    activeProfilesWithDataCount: activeWithAttempts.length,
    classAverageAccuracy,
    classTopicStats,
    mostDifficultTopics,
    classImprovementLine,
    classCumulativeArea,
    assignmentCompletionPie,
    studentTopicHeatmap,
    heatmapTopics: activeTopics,
    classroomBoxPlots,
    strongestTopic: classTopicStats[0]?.topic ?? null,
    weakestTopic:
      classTopicStats.length > 0
        ? classTopicStats[classTopicStats.length - 1].topic
        : null,
  }
}

/**
 * Advanced PYQ Frequency Analysis (Section 2) strictly honoring real records:
 * Never fabricates missing years — marks unindexed years in Verified mode as coverageUnknown = true.
 */
export function buildAdvancedFrequencyAnalysis({
  yearStart = ARCHIVE_START_YEAR,
  yearEnd = ARCHIVE_END_YEAR,
  examFilter = 'all',
  topicFilter = 'all',
  difficultyFilter = 'all',
  scope = 'all', // 'verified_pyq' | 'pyq_style_practice' | 'all'
} = {}) {
  const sourceBase =
    scope === 'verified_pyq'
      ? VERIFIED_PYQS
      : scope === 'pyq_style_practice'
        ? PYQ_STYLE_PRACTICE
        : ALL_ARCHIVE_QUESTIONS

  const minY = Math.max(ARCHIVE_START_YEAR, Number(yearStart) || ARCHIVE_START_YEAR)
  const maxY = Math.min(ARCHIVE_END_YEAR, Number(yearEnd) || ARCHIVE_END_YEAR)

  const matchingQuestions = sourceBase.filter((q) => {
    if (examFilter !== 'all' && q.exam !== examFilter) return false
    if (topicFilter !== 'all' && q.topic !== topicFilter) return false
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false
    if (Number.isInteger(q.year)) {
      if (q.year < minY || q.year > maxY) return false
    } else if (scope === 'verified_pyq') {
      return false
    }
    return true
  })

  // Year-wise frequency for minY..maxY: NEVER falsify 0 for unindexed verified papers
  const byYearMap = new Map()
  for (let y = minY; y <= maxY; y += 1) {
    byYearMap.set(y, 0)
  }
  const byExam = Object.fromEntries(PYQ_EXAMS.map((e) => [e, 0]))
  const byTopic = Object.fromEntries(PYQ_TOPICS.map((t) => [t, 0]))
  const byDifficulty = Object.fromEntries(PYQ_DIFFICULTIES.map((d) => [d, 0]))

  const difficultyByExam = Object.fromEntries(
    PYQ_EXAMS.map((e) => [e, { exam: e, easy: 0, medium: 0, advanced: 0, total: 0 }]),
  )

  const conceptCounts = new Map()
  const yearTopicMatrixMap = new Map()

  for (const q of matchingQuestions) {
    if (Number.isInteger(q.year) && byYearMap.has(q.year)) {
      byYearMap.set(q.year, byYearMap.get(q.year) + 1)
      if (!yearTopicMatrixMap.has(q.year)) {
        yearTopicMatrixMap.set(q.year, Object.fromEntries(PYQ_TOPICS.map((t) => [t, 0])))
      }
      if (yearTopicMatrixMap.get(q.year)[q.topic] !== undefined) {
        yearTopicMatrixMap.get(q.year)[q.topic] += 1
      }
    }
    if (byExam[q.exam] !== undefined) byExam[q.exam] += 1
    if (byTopic[q.topic] !== undefined) byTopic[q.topic] += 1
    if (byDifficulty[q.difficulty] !== undefined) byDifficulty[q.difficulty] += 1
    if (difficultyByExam[q.exam]) {
      difficultyByExam[q.exam][q.difficulty] =
        (difficultyByExam[q.exam][q.difficulty] ?? 0) + 1
      difficultyByExam[q.exam].total += 1
    }
    if (q.formulaUsed) {
      const fKey = q.formulaUsed.trim()
      conceptCounts.set(fKey, (conceptCounts.get(fKey) ?? 0) + 1)
    }
  }

  const byYear = Array.from(byYearMap.entries()).map(([year, count]) => ({
    year,
    label: `'${String(year).slice(-2)}`,
    count: count > 0 ? count : null, // null cleanly signals unindexed / unknown coverage!
    indexedCount: count,
    coverageUnknown: count === 0,
  }))

  const indexedYearCount = byYear.filter((y) => !y.coverageUnknown).length
  const unknownYearCount = byYear.filter((y) => y.coverageUnknown).length
  const undatedPracticeCount = matchingQuestions.filter(
    (q) => !Number.isInteger(q.year),
  ).length

  const rankedTopics = PYQ_TOPICS.map((topic) => ({
    topic,
    count: byTopic[topic],
  })).sort((a, b) => b.count - a.count)

  const rankedConcepts = Array.from(conceptCounts.entries())
    .map(([formula, count]) => ({ formula, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const yearTopicTrendRows = Array.from(yearTopicMatrixMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, cells]) => ({ year, cells }))

  return {
    scope,
    yearStart: minY,
    yearEnd: maxY,
    totalMatching: matchingQuestions.length,
    verifiedMatchingCount: matchingQuestions.filter(
      (q) => q.authenticity === 'verified_pyq',
    ).length,
    stylePracticeMatchingCount: matchingQuestions.filter(
      (q) => q.authenticity === 'pyq_style_practice',
    ).length,
    undatedPracticeCount,
    indexedYearCount,
    unknownYearCount,
    byYear,
    byExam,
    byTopic,
    byDifficulty,
    difficultyByExam: Object.values(difficultyByExam),
    rankedTopics,
    rankedConcepts,
    yearTopicTrendRows,
  }
}

/**
 * Builds Competitive Exam Analytics (Dashboard C) covering all 10 required insights.
 */
export function buildCompetitiveExamAnalytics({
  profileData,
  rangeKey = 'all',
  nowMs = Date.now(),
}) {
  const combined = combineAllAttempts(profileData, rangeKey, nowMs)
  const mocks = filterRecordsByDateRange(
    profileData?.mockSessions ?? [],
    rangeKey,
    nowMs,
  )

  const mockLineSeries = mocks.map((m, idx) => ({
    label: `Mock ${idx + 1}`,
    value: Number.isFinite(m.accuracy) ? m.accuracy : 0,
    total: m.totalQuestions ?? 0,
    correct: m.correctCount ?? 0,
  }))

  const mockHistogram = buildScoreHistogram(mocks.map((m) => m.accuracy))

  const topicStats = summarizeByTopic(combined)
  const totalTimeSec = combined.reduce(
    (sum, a) => sum + (Number.isFinite(a.timeSpentSec) ? a.timeSpentSec : 0),
    0,
  )
  const avgTimePerQuestionSec =
    combined.length > 0 ? Number((totalTimeSec / combined.length).toFixed(1)) : 0

  const diffBuckets = {
    easy: { difficulty: 'easy', correct: 0, incorrect: 0, total: 0 },
    medium: { difficulty: 'medium', correct: 0, incorrect: 0, total: 0 },
    advanced: { difficulty: 'advanced', correct: 0, incorrect: 0, total: 0 },
  }
  for (const att of combined) {
    const key = diffBuckets[att.difficulty] ? att.difficulty : 'medium'
    diffBuckets[key].total += 1
    if (att.correct) diffBuckets[key].correct += 1
    else diffBuckets[key].incorrect += 1
  }
  const difficultyStacked = Object.values(diffBuckets)

  // Archive Verified + Style stats for PYQ Frequency Comparison & Radar
  const verifiedFreq = computeArchiveFrequencyStats('verified_pyq')
  const fullArchiveFreq = computeArchiveFrequencyStats('all')
  const advancedFreq = buildAdvancedFrequencyAnalysis({ scope: 'verified_pyq' })

  const topicVsPyq = Object.entries(verifiedFreq.byTopic)
    .map(([topic, pyqCount]) => {
      const userStat = topicStats.find((s) => s.topic === topic)
      return {
        topic,
        verifiedPyqCount: pyqCount,
        fullArchiveCount: fullArchiveFreq.byTopic[topic] ?? 0,
        userAccuracy: userStat ? userStat.accuracy : null,
        userAttempted: userStat ? userStat.total : 0,
      }
    })
    .filter((row) => row.verifiedPyqCount > 0 || row.userAttempted > 0)

  const speedAccuracyScatter = topicStats.map((item) => ({
    topic: item.topic,
    xSec: item.avgTimeSec,
    yAccuracy: item.accuracy,
    count: item.total,
  }))

  // Readiness Radar axes across topics attempted by user
  const readinessRadarAxes = topicStats.slice(0, 6)

  const correctCount = combined.filter((a) => a.correct).length
  const overallAccuracy =
    combined.length > 0 ? Math.round((correctCount / combined.length) * 100) : 0

  let readinessStatus = 'insufficient'
  let readinessScore = null
  if (combined.length >= 5) {
    const volumeFactor = Math.min(1, combined.length / 20)
    const speedBonus = avgTimePerQuestionSec > 0 && avgTimePerQuestionSec <= 45 ? 10 : 0
    readinessScore = Math.min(
      100,
      Math.round(overallAccuracy * 0.75 + volumeFactor * 15 + speedBonus),
    )
    readinessStatus =
      readinessScore >= 75
        ? 'ready'
        : readinessScore >= 50
          ? 'developing'
          : 'needs_work'
  }

  return {
    totalAttempts: combined.length,
    correctCount,
    incorrectCount: combined.length - correctCount,
    overallAccuracy,
    avgTimePerQuestionSec,
    mockCount: mocks.length,
    mockLineSeries,
    mockHistogram,
    topicStats,
    readinessRadarAxes,
    difficultyStacked,
    speedAccuracyScatter,
    topicVsPyq,
    verifiedFreq,
    fullArchiveFreq,
    yearCoverageSeries: advancedFreq.byYear,
    readinessStatus,
    readinessScore,
    recommendedRevisionTopics: topicStats
      .filter((t) => t.accuracy < 65)
      .map((t) => t.topic),
  }
}

/**
 * Summarizes recorded Mistake Detective logs & targeted remediation improvement
 * for Mistake Heatmap, Topic Weakness Graph, and Student / Exam Analytics.
 */
export function summarizeMistakesAndImprovement(
  profileData,
  rangeKey = 'all',
  nowMs = Date.now(),
) {
  const logs = filterRecordsByDateRange(
    profileData?.mistakeLogs ?? [],
    rangeKey,
    nowMs,
  )
  const sessions = filterRecordsByDateRange(
    profileData?.remediationSessions ?? [],
    rangeKey,
    nowMs,
  )

  const byCategory = Object.fromEntries(MISTAKE_CATEGORIES.map((c) => [c, 0]))
  const topicCounts = new Map()
  const heatmapMap = new Map()

  for (const log of logs) {
    const cat = byCategory[log.category] !== undefined ? log.category : 'calculation_error'
    byCategory[cat] += 1
    const tp = log.topic || 'general'
    topicCounts.set(tp, (topicCounts.get(tp) ?? 0) + 1)
    if (!heatmapMap.has(tp)) {
      heatmapMap.set(tp, Object.fromEntries(MISTAKE_CATEGORIES.map((c) => [c, 0])))
    }
    heatmapMap.get(tp)[cat] += 1
  }

  const rankedCategories = MISTAKE_CATEGORIES.map((cat) => ({
    category: cat,
    count: byCategory[cat],
  })).sort((a, b) => b.count - a.count)

  const weaknessByTopic = Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)

  const heatmapRows = Array.from(heatmapMap.entries()).map(([topic, cells]) => ({
    topic,
    cells,
    total: Object.values(cells).reduce((s, n) => s + n, 0),
  }))

  let avgBeforeAcc = null
  let avgAfterAcc = null
  let improvementGain = null
  if (sessions.length > 0) {
    const sumBefore = sessions.reduce(
      (s, sess) => s + (Number.isFinite(sess.beforeAccuracy) ? sess.beforeAccuracy : 0),
      0,
    )
    const sumAfter = sessions.reduce(
      (s, sess) => s + (Number.isFinite(sess.afterAccuracy) ? sess.afterAccuracy : 0),
      0,
    )
    avgBeforeAcc = Math.round(sumBefore / sessions.length)
    avgAfterAcc = Math.round(sumAfter / sessions.length)
    improvementGain = avgAfterAcc - avgBeforeAcc
  }

  const topWeakCategory =
    rankedCategories[0]?.count > 0 ? rankedCategories[0].category : null

  return {
    totalMistakes: logs.length,
    byCategory,
    rankedCategories,
    weaknessByTopic,
    heatmapRows,
    topWeakCategory,
    remediationCount: sessions.length,
    avgBeforeAcc,
    avgAfterAcc,
    improvementGain,
    latestSession: sessions.length > 0 ? sessions[sessions.length - 1] : null,
  }
}
