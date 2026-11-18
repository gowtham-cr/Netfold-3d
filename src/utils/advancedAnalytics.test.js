import { afterEach, describe, expect, it } from 'vitest'
import {
  buildAdvancedFrequencyAnalysis,
  buildCompetitiveExamAnalytics,
  buildScoreHistogram,
  buildStudentAnalytics,
  buildTeacherAnalytics,
  computeBoxPlotStats,
} from './analyticsEngine.js'
import { buildCsvString, escapeCsvCell } from './chartExport.js'
import { createEmptyProfileData, saveProfileData } from './profileStorage.js'
import { TRANSLATIONS } from '../data/translations.js'

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

describe('Advanced Analytics Dashboard — Student, Teacher & Competitive Charts', () => {
  it('computes all 8 Student Analytics datasets cleanly across daily/weekly/monthly granularities', () => {
    const day1 = new Date(2026, 4, 1, 10, 0, 0).getTime()
    const day2 = new Date(2026, 4, 9, 10, 0, 0).getTime()
    const nowMs = new Date(2026, 4, 18, 12, 0, 0).getTime()

    const profile = {
      ...createEmptyProfileData(),
      pyqAttempts: [
        { questionId: 'q1', topic: 'cylinder', difficulty: 'easy', correct: true, timeSpentSec: 10, timestamp: day1 },
        { questionId: 'q2', topic: 'cylinder', difficulty: 'medium', correct: false, timeSpentSec: 20, timestamp: day1 + 5000 },
        { questionId: 'q3', topic: 'cone_frustum', difficulty: 'advanced', correct: true, timeSpentSec: 30, timestamp: day2 },
        { questionId: 'q4', topic: 'sphere_hemisphere', difficulty: 'easy', correct: true, timeSpentSec: 20, timestamp: day2 + 5000 },
      ],
      mockSessions: [
        { id: 'm1', accuracy: 50, totalQuestions: 4, correctCount: 2, timestamp: day1 },
        { id: 'm2', accuracy: 88, totalQuestions: 4, correctCount: 4, timestamp: day2 },
      ],
    }

    const daily = buildStudentAnalytics({ profileData: profile, rangeKey: 'all', granularity: 'daily', nowMs })
    const weekly = buildStudentAnalytics({ profileData: profile, rangeKey: 'all', granularity: 'weekly', nowMs })
    const monthly = buildStudentAnalytics({ profileData: profile, rangeKey: 'all', granularity: 'monthly', nowMs })

    expect(daily.attemptedCount).toBe(4)
    expect(daily.correctCount).toBe(3)
    expect(daily.incorrectCount).toBe(1)
    expect(daily.avgTimePerQuestionSec).toBe(20)
    expect(daily.progressLineSeries).toHaveLength(2)
    expect(weekly.progressLineSeries).toHaveLength(2)
    expect(monthly.progressLineSeries).toHaveLength(1)

    expect(daily.cumulativeAreaSeries).toHaveLength(4)
    expect(daily.cumulativeAreaSeries[3].cumulativeCorrect).toBe(3)
    expect(daily.cumulativeAreaSeries[3].cumulativeAttempted).toBe(4)

    expect(daily.statusPieBreakdown.find((s) => s.id === 'correct').value).toBe(3)
    expect(daily.statusPieBreakdown.find((s) => s.id === 'incorrect').value).toBe(1)
    expect(daily.statusPieBreakdown.find((s) => s.id === 'unanswered').value).toBeGreaterThan(100)

    expect(daily.hasScoreHistogramData).toBe(true)
    expect(daily.scoreHistogram.find((b) => b.id === '41-60').count).toBe(1)
    expect(daily.scoreHistogram.find((b) => b.id === '81-100').count).toBe(1)

    expect(daily.difficultyStacked.find((d) => d.difficulty === 'easy').correct).toBe(2)
    expect(daily.difficultyStacked.find((d) => d.difficulty === 'easy').unanswered).toBeGreaterThan(0)
  })

  it('computes Teacher Analytics with filters, box plots, difficult topics, heatmap, and profile isolation', () => {
    installMemoryWindow()
    const ts = new Date(2026, 4, 15, 11, 0, 0).getTime()

    saveProfileData('student_demo', {
      ...createEmptyProfileData(),
      pyqAttempts: [
        { questionId: 'a1', topic: 'cylinder', difficulty: 'easy', correct: true, timeSpentSec: 12, timestamp: ts - 2000 },
        { questionId: 'a2', topic: 'cone_frustum', difficulty: 'medium', correct: false, timeSpentSec: 35, timestamp: ts - 1000 },
      ],
      mockSessions: [
        { id: 'ms1', accuracy: 50, timestamp: ts - 2000 },
        { id: 'ms2', accuracy: 90, timestamp: ts - 1000 },
      ],
      completedPathSteps: ['stu_b1', 'stu_b2'],
    })

    saveProfileData('exam_demo', {
      ...createEmptyProfileData(),
      pyqAttempts: [
        { questionId: 'b1', topic: 'cylinder', difficulty: 'medium', correct: true, timeSpentSec: 14, timestamp: ts },
      ],
      completedPathSteps: ['ex_b1'],
    })

    const allCohort = buildTeacherAnalytics({ rangeKey: 'all', nowMs: ts + 5000 })
    expect(allCohort.students).toHaveLength(3)
    expect(allCohort.activeProfilesWithDataCount).toBe(2)
    expect(allCohort.mostDifficultTopics[0].topic).toBe('cone_frustum')
    expect(allCohort.classroomBoxPlots.length).toBeGreaterThanOrEqual(2)
    expect(allCohort.classCumulativeArea).toHaveLength(3)
    expect(allCohort.studentTopicHeatmap).toHaveLength(3)

    // Student & Topic filter check
    const onlyStudentCyl = buildTeacherAnalytics({
      rangeKey: 'all',
      studentFilter: 'student_demo',
      topicFilter: 'cylinder',
      nowMs: ts + 5000,
    })
    expect(onlyStudentCyl.students).toHaveLength(1)
    expect(onlyStudentCyl.students[0].attempted).toBe(1)
    expect(onlyStudentCyl.students[0].accuracyPct).toBe(100)
  })

  it('computes boxplot 5-number summary & score histogram accurately', () => {
    const box = computeBoxPlotStats([20, 40, 60, 80, 100])
    expect(box).toEqual({
      count: 5,
      min: 20,
      q1: 40,
      median: 60,
      q3: 80,
      max: 100,
      mean: 60,
    })

    const hist = buildScoreHistogram([10, 55, 78, 95, 100])
    expect(hist.map((b) => b.count)).toEqual([1, 0, 1, 1, 2])
  })
})

describe('Advanced PYQ Frequency Analysis & CSV Export', () => {
  it('filters 1999-2026 strictly without fabricating unindexed years as zero', () => {
    const verified = buildAdvancedFrequencyAnalysis({
      yearStart: 1999,
      yearEnd: 2026,
      scope: 'verified_pyq',
    })
    expect(verified.totalMatching).toBe(41)
    expect(verified.byYear).toHaveLength(28)

    const year2005 = verified.byYear.find((y) => y.year === 2005)
    expect(year2005.count).toBeNull()
    expect(year2005.coverageUnknown).toBe(true)

    const year2023 = verified.byYear.find((y) => y.year === 2023)
    expect(year2023.count).toBeGreaterThan(0)
    expect(year2023.coverageUnknown).toBe(false)

    expect(verified.rankedConcepts.length).toBeGreaterThan(0)
    expect(verified.difficultyByExam).toHaveLength(6)
    expect(verified.yearTopicTrendRows.length).toBe(9) // 9 indexed years: 2012, 2014, 2017, 2019..2024

    // Empty filtered exam (verified Banking currently unindexed -> 0 indexed matching, honest unknown years)
    const verifiedBanking = buildAdvancedFrequencyAnalysis({
      examFilter: 'banking',
      scope: 'verified_pyq',
    })
    expect(verifiedBanking.totalMatching).toBe(0)
    expect(verifiedBanking.unknownYearCount).toBe(28)

    // Competitive exam summary integration
    const examAna = buildCompetitiveExamAnalytics({
      profileData: createEmptyProfileData(),
      rangeKey: 'all',
      nowMs: Date.now(),
    })
    expect(examAna.readinessStatus).toBe('insufficient')
    expect(examAna.yearCoverageSeries).toHaveLength(28)
  })

  it('builds safe RFC-4180 CSV strings neutralizing leading formula prefixes', () => {
    expect(escapeCsvCell('=SUM(A1:A5)')).toBe("'=SUM(A1:A5)")
    expect(escapeCsvCell('Cone, "Frustum"')).toBe('"Cone, ""Frustum"""')

    const csv = buildCsvString(
      [
        { key: 'year', label: 'Year' },
        { key: 'status', label: 'Status' },
      ],
      [
        { year: 2005, status: 'Unknown (Unindexed)' },
        { year: 2023, status: 'Indexed' },
      ],
    )
    expect(csv).toContain('Year,Status')
    expect(csv).toContain('2005,Unknown (Unindexed)')
    expect(csv).toContain('2023,Indexed')
  })

  it('maintains identical 5-language parity for advAnalytics.analyticsPlus keys', () => {
    const enKeys = collectLeaves(TRANSLATIONS.en.advAnalytics.analyticsPlus)
      .map(([k]) => k)
      .sort()
    for (const lang of Object.keys(TRANSLATIONS)) {
      const leaves = collectLeaves(TRANSLATIONS[lang].advAnalytics.analyticsPlus)
      expect(leaves.map(([k]) => k).sort()).toEqual(enKeys)
      for (const [, v] of leaves) {
        expect(typeof v).toBe('string')
        expect(v.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
