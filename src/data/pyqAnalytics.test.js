import { afterEach, describe, expect, it } from 'vitest'
import {
  ALL_ARCHIVE_QUESTIONS,
  ARCHIVE_END_YEAR,
  ARCHIVE_START_YEAR,
  PYQ_DIFFICULTIES,
  PYQ_EXAMS,
  PYQ_STYLE_PRACTICE,
  PYQ_TOPICS,
  PYQ_TYPES,
  VERIFIED_PYQS,
  computeArchiveFrequencyStats,
  filterArchiveQuestions,
  parseNumericalInput,
  validateArchiveAnswer,
} from './pyqArchive.js'
import {
  buildCompetitiveExamAnalytics,
  buildStudentAnalytics,
  buildTeacherAnalytics,
  filterRecordsByDateRange,
  toIsoDayKey,
} from '../utils/analyticsEngine.js'
import {
  createEmptyProfileData,
  loadProfileData,
  saveProfileData,
} from '../utils/profileStorage.js'
import {
  filterGlobalSearchResults,
  loadBookmarks,
  toggleBookmarkEntry,
} from '../utils/learningProgress.js'
import { recommendNextPathStep } from './learningPaths.js'
import { CLASS_10_PRACTICE_CONTENT } from './class10Practice.js'
import { MISSIONS_CONTENT } from './missions.js'
import { LANGUAGES, TRANSLATIONS } from './translations.js'

const originalWindow = globalThis.window

afterEach(() => {
  if (originalWindow === undefined) {
    delete globalThis.window
  } else {
    globalThis.window = originalWindow
  }
})

function installMemoryWindow() {
  const store = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    },
  }
  return store
}

function collectLeaves(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...collectLeaves(v, p))
    } else {
      out.push([p, v])
    }
  }
  return out
}

describe('Mensuration PYQ Archive — Authenticity, Metadata & Search', () => {
  it('enforces exact counts and strict separation between Verified PYQs and PYQ-Style Practice', () => {
    expect(VERIFIED_PYQS).toHaveLength(41)
    expect(PYQ_STYLE_PRACTICE).toHaveLength(113)
    expect(ALL_ARCHIVE_QUESTIONS).toHaveLength(154)

    const seenIds = new Set()
    for (const q of ALL_ARCHIVE_QUESTIONS) {
      expect(seenIds.has(q.id)).toBe(false)
      seenIds.add(q.id)
      expect(PYQ_EXAMS).toContain(q.exam)
      expect(PYQ_TOPICS).toContain(q.topic)
      expect(PYQ_DIFFICULTIES).toContain(q.difficulty)
      expect(PYQ_TYPES).toContain(q.questionType)
      expect(q.options).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect(q.solutionSteps.length).toBeGreaterThan(0)
      expect(typeof q.formulaUsed).toBe('string')
      expect(q.formulaUsed.trim().length).toBeGreaterThan(0)
    }
  })

  it('requires year, paperSession, sourceName and HTTPS sourceUrl on every Verified PYQ and null metadata on synthetic items', () => {
    for (const v of VERIFIED_PYQS) {
      expect(v.authenticity).toBe('verified_pyq')
      expect(Number.isInteger(v.year)).toBe(true)
      expect(v.year).toBeGreaterThanOrEqual(ARCHIVE_START_YEAR)
      expect(v.year).toBeLessThanOrEqual(ARCHIVE_END_YEAR)
      expect(v.paperSession.trim().length).toBeGreaterThan(2)
      expect(v.sourceName.trim().length).toBeGreaterThan(2)
      expect(v.sourceUrl.startsWith('https://')).toBe(true)
    }

    for (const p of PYQ_STYLE_PRACTICE) {
      expect(p.authenticity).toBe('pyq_style_practice')
      expect(p.year ?? null).toBeNull()
      expect(p.paperSession ?? null).toBeNull()
      expect(p.sourceUrl ?? null).toBeNull()
    }
  })

  it('covers all 6 exam categories and all 10 mensuration topics across the archive', () => {
    const coveredExams = new Set(ALL_ARCHIVE_QUESTIONS.map((q) => q.exam))
    const coveredTopics = new Set(ALL_ARCHIVE_QUESTIONS.map((q) => q.topic))
    for (const ex of PYQ_EXAMS) expect(coveredExams.has(ex)).toBe(true)
    for (const tp of PYQ_TOPICS) expect(coveredTopics.has(tp)).toBe(true)
  })

  it('parses numerical inputs and validates both MCQ and Numerical answers accurately', () => {
    expect(parseNumericalInput('19.95 cm')).toBe(19.95)
    expect(parseNumericalInput('₹2,328.48')).toBe(2328.48)
    expect(parseNumericalInput('invalid text')).toBeNull()

    const mcqSample = VERIFIED_PYQS.find((q) => q.questionType === 'mcq')
    expect(
      validateArchiveAnswer(mcqSample, { optionIndex: mcqSample.correctIndex }),
    ).toMatchObject({ validInput: true, correct: true })
    expect(
      validateArchiveAnswer(mcqSample, {
        optionIndex: (mcqSample.correctIndex + 1) % 4,
      }),
    ).toMatchObject({ validInput: true, correct: false })

    const numSample = ALL_ARCHIVE_QUESTIONS.find(
      (q) => q.questionType === 'numerical' && Number.isFinite(q.numericAnswer),
    )
    expect(
      validateArchiveAnswer(numSample, {
        numericInput: String(numSample.numericAnswer),
      }),
    ).toMatchObject({ validInput: true, correct: true })
    expect(
      validateArchiveAnswer(numSample, {
        numericInput: String(numSample.numericAnswer * 2 + 50),
      }),
    ).toMatchObject({ validInput: true, correct: false })
    expect(
      validateArchiveAnswer(numSample, { numericInput: 'not a number' }),
    ).toMatchObject({ validInput: false, correct: false })
  })

  it('filters questions by collection, year, exam, topic, difficulty, type and keyword search', () => {
    expect(filterArchiveQuestions({ collection: 'verified_pyq' })).toHaveLength(41)
    expect(
      filterArchiveQuestions({ collection: 'pyq_style_practice' }),
    ).toHaveLength(113)

    const only2019 = filterArchiveQuestions({ year: '2019' })
    expect(only2019.length).toBeGreaterThan(0)
    expect(only2019.every((q) => q.year === 2019)).toBe(true)

    const bankingList = filterArchiveQuestions({ exam: 'banking' })
    expect(bankingList.length).toBeGreaterThan(0)
    expect(bankingList.every((q) => q.exam === 'banking')).toBe(true)

    const kcetHits = filterArchiveQuestions({ query: 'kcet' })
    expect(kcetHits.some((q) => q.exam === 'kcet')).toBe(true)

    const tetra = filterArchiveQuestions({ query: 'tetrahedron' })
    expect(tetra.some((q) => q.id.includes('2012') || /tetrahedron/i.test(q.question))).toBe(
      true,
    )
  })

  it('computes Frequency Intelligence stats accurately without fabricating unindexed years', () => {
    const vStats = computeArchiveFrequencyStats('verified_pyq')
    expect(vStats.totalInScope).toBe(41)
    expect(vStats.verifiedCount).toBe(41)
    expect(vStats.stylePracticeCount).toBe(113)
    expect(vStats.totalArchiveCount).toBe(154)
    expect(vStats.byExam.banking).toBe(0) // Honestly 0 indexed dated Banking papers
    expect(vStats.verifiedYearsPresent).toEqual([
      2012, 2014, 2017, 2019, 2020, 2021, 2022, 2023, 2024,
    ])
    expect(vStats.missingVerifiedYears).toContain(1999)
    expect(vStats.missingVerifiedYears).toContain(2025)
    expect(vStats.missingVerifiedYears).toContain(2026)

    const examSum = Object.values(vStats.byExam).reduce((s, n) => s + n, 0)
    const topicSum = Object.values(vStats.byTopic).reduce((s, n) => s + n, 0)
    const diffSum = Object.values(vStats.byDifficulty).reduce((s, n) => s + n, 0)
    expect(examSum).toBe(41)
    expect(topicSum).toBe(41)
    expect(diffSum).toBe(41)

    const matrixSum = PYQ_TOPICS.reduce(
      (sum, tp) =>
        sum +
        PYQ_EXAMS.reduce(
          (inner, ex) => inner + (vStats.topicByExam[tp]?.[ex] ?? 0),
          0,
        ),
      0,
    )
    expect(matrixSum).toBe(41)
  })
})

describe('Advanced Analytics Engine & Local Profile Separation', () => {
  it('returns honest empty stats with zero fabricated figures for untouched profiles', () => {
    const empty = createEmptyProfileData()
    const nowMs = Date.UTC(2026, 4, 15, 12, 0, 0)

    const st = buildStudentAnalytics({
      profileData: empty,
      learningProgress: { exploredShapes: [], visitedQuestions: [], netCheckerBestScore: 0 },
      missionsProgress: {},
      rangeKey: 'all',
      nowMs,
    })
    expect(st.attemptedCount).toBe(0)
    expect(st.correctCount).toBe(0)
    expect(st.progressLineSeries).toEqual([])
    expect(st.studyTimeDonut).toEqual([])
    expect(st.calendarHeatmap).toHaveLength(28)
    expect(st.calendarHeatmap.every((d) => d.count === 0)).toBe(true)
    expect(st.trendStatus).toBe('insufficient')

    const ex = buildCompetitiveExamAnalytics({
      profileData: empty,
      rangeKey: 'all',
      nowMs,
    })
    expect(ex.totalAttempts).toBe(0)
    expect(ex.readinessStatus).toBe('insufficient')
    expect(ex.readinessScore).toBeNull()
    expect(ex.mockLineSeries).toEqual([])
  })

  it('filters records accurately by date window and computes Student + Exam charts & readiness', () => {
    const nowMs = new Date(2026, 4, 18, 12, 0, 0).getTime()
    const twoDaysAgo = nowMs - 2 * 24 * 60 * 60 * 1000
    const twelveDaysAgo = nowMs - 12 * 24 * 60 * 60 * 1000
    const fortyDaysAgo = nowMs - 40 * 24 * 60 * 60 * 1000

    const profile = {
      ...createEmptyProfileData(),
      examAttempts: [
        { topic: 'cylinder', difficulty: 'easy', correct: true, timeSpentSec: 18, timestamp: fortyDaysAgo },
        { topic: 'cone_frustum', difficulty: 'medium', correct: false, timeSpentSec: 40, timestamp: twelveDaysAgo },
        { topic: 'cone_frustum', difficulty: 'medium', correct: false, timeSpentSec: 36, timestamp: twelveDaysAgo + 5000 },
      ],
      pyqAttempts: [
        { questionId: 'vpyq_jee_main_2014', topic: 'sphere_hemisphere', difficulty: 'medium', correct: true, timeSpentSec: 22, timestamp: twoDaysAgo },
        { questionId: 'vpyq_ssc_2024_cyl', topic: 'cylinder', difficulty: 'easy', correct: true, timeSpentSec: 15, timestamp: twoDaysAgo + 2000 },
        { questionId: 'vpyq_ssc_2022_cuboid', topic: 'cube_cuboid', difficulty: 'easy', correct: true, timeSpentSec: 12, timestamp: twoDaysAgo + 4000 },
      ],
      mockSessions: [
        { id: 'm1', accuracy: 60, totalQuestions: 5, correctCount: 3, timestamp: twelveDaysAgo },
        { id: 'm2', accuracy: 80, totalQuestions: 5, correctCount: 4, timestamp: twoDaysAgo },
      ],
    }

    expect(filterRecordsByDateRange(profile.pyqAttempts, '7d', nowMs)).toHaveLength(3)
    expect(filterRecordsByDateRange(profile.examAttempts, '30d', nowMs)).toHaveLength(2)
    expect(filterRecordsByDateRange(profile.examAttempts, 'all', nowMs)).toHaveLength(3)

    const studentAll = buildStudentAnalytics({
      profileData: profile,
      learningProgress: { exploredShapes: ['cube', 'cone'], visitedQuestions: ['q1'] },
      missionsProgress: { m1: { completed: true } },
      rangeKey: 'all',
      nowMs,
    })
    expect(studentAll.attemptedCount).toBe(6)
    expect(studentAll.correctCount).toBe(4)
    expect(studentAll.accuracyPct).toBe(67)
    expect(studentAll.radarSeries.length).toBe(4)
    expect(studentAll.studyTimeDonut).toHaveLength(2)
    expect(studentAll.totalStudySec).toBe(143)
    expect(studentAll.trendStatus).toBe('up')
    expect(studentAll.recommendedRevisionTopics).toContain('cone_frustum')

    const activeDayKey = toIsoDayKey(twoDaysAgo)
    const activeHeatmapCell = studentAll.calendarHeatmap.find(
      (c) => c.dateKey === activeDayKey,
    )
    expect(activeHeatmapCell?.count).toBe(3)

    const examAll = buildCompetitiveExamAnalytics({
      profileData: profile,
      rangeKey: 'all',
      nowMs,
    })
    expect(examAll.totalAttempts).toBe(6)
    expect(examAll.mockLineSeries).toHaveLength(2)
    expect(examAll.speedAccuracyScatter).toHaveLength(4)
    expect(examAll.readinessStatus).toBe('developing')
    expect(examAll.readinessScore).toBeGreaterThanOrEqual(50)

    const readyProfile = {
      ...profile,
      pyqAttempts: [
        ...profile.pyqAttempts,
        { questionId: 'a1', topic: 'cylinder', difficulty: 'easy', correct: true, timeSpentSec: 12, timestamp: twoDaysAgo },
        { questionId: 'a2', topic: 'sphere_hemisphere', difficulty: 'easy', correct: true, timeSpentSec: 14, timestamp: twoDaysAgo },
        { questionId: 'a3', topic: 'cube_cuboid', difficulty: 'easy', correct: true, timeSpentSec: 15, timestamp: twoDaysAgo },
        { questionId: 'a4', topic: 'cylinder', difficulty: 'medium', correct: true, timeSpentSec: 18, timestamp: twoDaysAgo },
      ],
    }
    const readyExam = buildCompetitiveExamAnalytics({
      profileData: readyProfile,
      rangeKey: 'all',
      nowMs,
    })
    expect(readyExam.readinessStatus).toBe('ready')
    expect(readyExam.readinessScore).toBeGreaterThanOrEqual(75)
  })

  it('isolates Demo Profiles cleanly in storage and aggregates Teacher Analytics cohort accurately', () => {
    installMemoryWindow()
    const nowMs = Date.UTC(2026, 4, 18, 12, 0, 0)

    const stuData = {
      ...createEmptyProfileData(),
      pyqAttempts: [
        { topic: 'cylinder', difficulty: 'easy', correct: true, timeSpentSec: 20, timestamp: nowMs - 1000 },
        { topic: 'cone_frustum', difficulty: 'hard', correct: false, timeSpentSec: 50, timestamp: nowMs - 500 },
      ],
      completedPathSteps: ['s1', 's2'],
    }
    saveProfileData('student_demo', stuData)

    const examDemo = loadProfileData('exam_demo')
    expect(examDemo.pyqAttempts).toEqual([])
    expect(examDemo.completedPathSteps).toEqual([])

    const teacherSummary = buildTeacherAnalytics({ rangeKey: 'all', nowMs })
    expect(teacherSummary.activeProfilesWithDataCount).toBe(1)
    expect(teacherSummary.classAverageAccuracy).toBe(50)
    expect(teacherSummary.strongestTopic).toBe('cylinder')
    expect(teacherSummary.weakestTopic).toBe('cone_frustum')
  })
})

describe('Integration: Bookmarks, Search, Learning Paths & 5-Language Parity', () => {
  it('supports PYQ bookmarks, Smart Learning Path weak-topic mapping, and Global Search indexing', () => {
    installMemoryWindow()
    const initial = loadBookmarks()
    expect(initial.pyqs).toEqual([])

    const added = toggleBookmarkEntry(initial, 'pyqs', 'vpyq_kcet_2020_cube')
    expect(added.pyqs).toEqual(['vpyq_kcet_2020_cube'])

    const nextStep = recommendNextPathStep('exam', [], ['cone_frustum'])
    expect(nextStep.reasonType).toBe('weak_topic_remediation')
    expect(['cone', 'frustum_octahedron']).toContain(nextStep.step.topic)

    const hits = filterGlobalSearchResults('2023', {
      translations: TRANSLATIONS.en,
      enTranslations: TRANSLATIONS.en,
      class10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      enClass10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      missionsBundle: MISSIONS_CONTENT.en,
      enMissionsBundle: MISSIONS_CONTENT.en,
    })
    expect(hits.some((item) => item.action?.type === 'pyq')).toBe(true)
  })

  it('maintains identical non-empty advAnalytics and pyqUi keys across all 5 languages', () => {
    const enAdv = collectLeaves(TRANSLATIONS.en.advAnalytics).map(([k]) => k).sort()
    const enPyq = collectLeaves(TRANSLATIONS.en.pyqUi).map(([k]) => k).sort()
    const langCodes = Array.isArray(LANGUAGES)
      ? LANGUAGES.map((entry) => (typeof entry === 'string' ? entry : entry.code))
      : Object.keys(TRANSLATIONS)

    for (const lang of langCodes) {
      const tr = TRANSLATIONS[lang]
      expect(typeof tr.extraNavTabs.pyq_archive).toBe('string')
      expect(tr.extraNavTabs.pyq_archive.trim().length).toBeGreaterThan(0)

      const lAdv = collectLeaves(tr.advAnalytics)
      const lPyq = collectLeaves(tr.pyqUi)
      expect(lAdv.map(([k]) => k).sort()).toEqual(enAdv)
      expect(lPyq.map(([k]) => k).sort()).toEqual(enPyq)
      for (const [, val] of [...lAdv, ...lPyq]) {
        expect(typeof val).toBe('string')
        expect(val.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
