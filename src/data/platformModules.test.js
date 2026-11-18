import { describe, expect, it } from 'vitest'
import {
  EXAM_TRACKS,
  QUESTION_BANK,
  QUESTION_DIFFICULTIES,
  QUESTION_TOPICS,
  evaluateMockSession,
  generateQuestionSet,
} from './questionBank.js'
import {
  LEARNING_PATHS_COPY,
  LEARNING_PATH_STEPS,
  PATH_AUDIENCES,
  PATH_LEVELS,
  recommendNextPathStep,
} from './learningPaths.js'
import { PLATFORM_TRANSLATIONS } from './platformTranslations.js'
import { CLASS_10_PRACTICE_CONTENT } from './class10Practice.js'
import { MISSIONS_CONTENT } from './missions.js'
import { LANGUAGES, TRANSLATIONS } from './translations.js'
import {
  DEMO_PROFILES,
  computePerformanceAnalytics,
  createEmptyProfileData,
  getProfileByAudience,
} from '../utils/profileStorage.js'
import { filterGlobalSearchResults } from '../utils/learningProgress.js'
import {
  UNIFIED_BANK_STATS,
  UNIFIED_EXAM_BANK,
  evaluateUnifiedMockSession,
  filterUnifiedExamQuestions,
  generateUnifiedQuestionSet,
  validateUnifiedQuestionAnswer,
} from '../utils/examArenaBank.js'
import { computeArchiveFrequencyStats } from './pyqArchive.js'

function collectLeafKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectLeafKeys(value, path)
    }
    return [[path, value]]
  })
}

describe('Multi-audience platform modules (Exam Arena, Learning Paths, Worksheet Generator, Analytics)', () => {
  it('validates integrity and 5-language content across all 25 Question Bank entries', () => {
    expect(QUESTION_BANK).toHaveLength(25)
    const ids = new Set()

    for (const q of QUESTION_BANK) {
      expect(ids.has(q.id)).toBe(false)
      ids.add(q.id)
      expect(EXAM_TRACKS).toContain(q.examTrack)
      expect(QUESTION_DIFFICULTIES).toContain(q.difficulty)
      expect(QUESTION_TOPICS).toContain(q.topic)
      expect(['ncert_core', 'additional_practice']).toContain(q.syllabusTag)
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect(q.formulaUsed.trim().length).toBeGreaterThan(0)

      for (const lang of Object.values(LANGUAGES)) {
        const loc = q[lang]
        expect(loc, `Missing ${lang} on ${q.id}`).toBeDefined()
        expect(loc.question.trim().length).toBeGreaterThan(0)
        expect(loc.shortcutTip.trim().length).toBeGreaterThan(0)
        expect(Array.isArray(loc.solutionSteps)).toBe(true)
        expect(loc.solutionSteps.length).toBeGreaterThan(0)
      }
    }

    for (const track of EXAM_TRACKS) {
      expect(QUESTION_BANK.filter((q) => q.examTrack === track).length).toBe(5)
    }
  })

  it('filters questions accurately and never produces duplicate IDs in generated worksheets or mock sets', () => {
    const allGenerated = generateQuestionSet({ count: 25, seed: 3 })
    expect(allGenerated.questions).toHaveLength(25)
    expect(new Set(allGenerated.questions.map((q) => q.id)).size).toBe(25)

    const sscEasyOrAll = generateQuestionSet({ examTrack: 'ssc', count: 10, seed: 2 })
    expect(sscEasyOrAll.questions).toHaveLength(5)
    expect(sscEasyOrAll.questions.every((q) => q.examTrack === 'ssc')).toBe(true)

    const ncertOnly = generateQuestionSet({ syllabusTag: 'ncert_core', count: 20 })
    expect(ncertOnly.questions.length).toBeGreaterThan(0)
    expect(ncertOnly.questions.every((q) => q.syllabusTag === 'ncert_core')).toBe(true)
  })

  it('evaluates timed mock sessions cleanly with accuracy, timing, and per-question stats', () => {
    const sample = generateQuestionSet({ count: 4, seed: 1 }).questions
    const answers = {
      [sample[0].id]: sample[0].correctIndex,
      [sample[1].id]: sample[1].correctIndex,
      [sample[2].id]: (sample[2].correctIndex + 1) % 4,
    }
    const timings = {
      [sample[0].id]: 12,
      [sample[1].id]: 18,
      [sample[2].id]: 20,
      [sample[3].id]: 10,
    }
    const evalRes = evaluateMockSession(sample, answers, timings)
    expect(evalRes.totalQuestions).toBe(4)
    expect(evalRes.answeredCount).toBe(3)
    expect(evalRes.correctCount).toBe(2)
    expect(evalRes.accuracy).toBe(50)
    expect(evalRes.totalTimeSec).toBe(60)
    expect(evalRes.avgTimeSec).toBe(15)
  })

  it('provides Student, Teacher, and Competitive Exam learning paths and smart next-topic recommendations', () => {
    for (const audience of PATH_AUDIENCES) {
      const steps = LEARNING_PATH_STEPS.filter((s) => s.audience === audience)
      expect(steps.length).toBeGreaterThanOrEqual(6)
      for (const level of PATH_LEVELS) {
        expect(steps.some((s) => s.level === level)).toBe(true)
      }
      for (const lang of Object.values(LANGUAGES)) {
        for (const step of steps) {
          const copy = LEARNING_PATHS_COPY[lang]?.[step.id]
          expect(copy, `Missing path copy ${lang}.${step.id}`).toBeDefined()
          expect(copy.title.trim().length).toBeGreaterThan(0)
          expect(copy.concept.trim().length).toBeGreaterThan(0)
          expect(copy.practiceGoal.trim().length).toBeGreaterThan(0)
        }
      }
    }

    const firstRec = recommendNextPathStep('exam', [], [])
    expect(firstRec.reasonType).toBe('next_in_sequence')
    expect(firstRec.step.id).toBe('ex_beg_ratio_shortcuts')

    const weakRec = recommendNextPathStep('exam', ['ex_beg_ratio_shortcuts'], ['cone'])
    expect(weakRec.reasonType).toBe('weak_topic_remediation')
    expect(weakRec.step.topic).toBe('cone')

    const studentAllDone = LEARNING_PATH_STEPS.filter((s) => s.audience === 'student').map((s) => s.id)
    const doneRec = recommendNextPathStep('student', studentAllDone, [])
    expect(doneRec.reasonType).toBe('all_completed')
  })

  it('computes profile-scoped performance analytics, weak topics, and maintains 5-language translation parity', () => {
    expect(DEMO_PROFILES.map((p) => p.audience)).toEqual(['student', 'teacher', 'exam'])
    expect(getProfileByAudience('teacher').id).toBe('teacher_demo')

    const profileData = {
      ...createEmptyProfileData(),
      examAttempts: [
        { topic: 'cone', correct: false, timeSpentSec: 30 },
        { topic: 'cone', correct: false, timeSpentSec: 25 },
        { topic: 'cube_cuboid', correct: true, timeSpentSec: 15 },
        { topic: 'cube_cuboid', correct: true, timeSpentSec: 10 },
      ],
      mockSessions: [{ accuracy: 50 }, { accuracy: 75 }],
      completedPathSteps: ['st_beg_cube_nets'],
    }
    const analytics = computePerformanceAnalytics(profileData, {
      exploredShapes: ['cube', 'cone'],
      visitedQuestions: ['q1', 'q2', 'q3'],
    })
    expect(analytics.totalAttempts).toBe(4)
    expect(analytics.correctAttempts).toBe(2)
    expect(analytics.overallAccuracy).toBe(50)
    expect(analytics.avgTimePerQuestion).toBe(20)
    expect(analytics.strongTopics).toEqual(['cube_cuboid'])
    expect(analytics.weakTopics).toEqual(['cone'])
    expect(analytics.trendPoints).toEqual([
      { label: 'M1', accuracy: 50 },
      { label: 'M2', accuracy: 75 },
    ])

    const enKeys = collectLeafKeys(PLATFORM_TRANSLATIONS.en).map(([k]) => k).sort()
    for (const lang of Object.values(LANGUAGES)) {
      const entries = collectLeafKeys(PLATFORM_TRANSLATIONS[lang])
      expect(entries.map(([k]) => k).sort(), `Mismatch in platformTranslations.${lang}`).toEqual(enKeys)
      for (const [key, val] of entries) {
        expect(typeof val, `${lang}.${key}`).toBe('string')
        expect(val.trim().length, `${lang}.${key}`).toBeGreaterThan(0)
      }
    }

    const searchTeacher = filterGlobalSearchResults('teacher', {
      translations: TRANSLATIONS.hi,
      enTranslations: TRANSLATIONS.en,
      class10Bundle: CLASS_10_PRACTICE_CONTENT.hi,
      enClass10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      missionsBundle: MISSIONS_CONTENT.hi,
      enMissionsBundle: MISSIONS_CONTENT.en,
    })
    expect(searchTeacher.some((r) => r.id === 'platform:teacher_studio')).toBe(true)

    const searchExam = filterGlobalSearchResults('exam', {
      translations: TRANSLATIONS.kn,
      enTranslations: TRANSLATIONS.en,
      class10Bundle: CLASS_10_PRACTICE_CONTENT.kn,
      enClass10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      missionsBundle: MISSIONS_CONTENT.kn,
      enMissionsBundle: MISSIONS_CONTENT.en,
    })
    expect(searchExam.some((r) => r.id === 'platform:exam_arena')).toBe(true)
  })

  it('unifies all verified PYQs and practice banks into Competitive Exam Arena with >170 unique solvable questions and dynamic frequency integration', () => {
    expect(UNIFIED_BANK_STATS.verifiedPyqCount).toBe(41)
    expect(UNIFIED_BANK_STATS.totalQuestions).toBeGreaterThanOrEqual(170)
    expect(UNIFIED_BANK_STATS.verifiedPyqCount + UNIFIED_BANK_STATS.practiceStyleCount).toBe(
      UNIFIED_BANK_STATS.totalQuestions,
    )

    // Strict zero-duplicate ID & normalized text verification
    const seenIds = new Set()
    const seenNorm = new Set()
    for (const q of UNIFIED_EXAM_BANK) {
      expect(seenIds.has(q.id)).toBe(false)
      seenIds.add(q.id)
      const norm = q.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      expect(seenNorm.has(norm), `Duplicate text found for ${q.id}`).toBe(false)
      seenNorm.add(norm)
      if (q.authenticity === 'verified_pyq') {
        expect(Number.isInteger(q.year)).toBe(true)
        expect(String(q.sourceUrl ?? '')).toMatch(/^https:\/\//)
      } else {
        expect(q.year).toBeNull()
      }
    }

    // Supports set sizes > 25 (e.g. 50 & all) and filters cleanly by verified PYQs, year, and incorrect history
    const verifiedOnly = filterUnifiedExamQuestions({ authenticity: 'verified_pyq' })
    expect(verifiedOnly).toHaveLength(41)
    expect(filterUnifiedExamQuestions({ limit: 50 })).toHaveLength(50)
    expect(filterUnifiedExamQuestions({ year: 2023 }).length).toBeGreaterThanOrEqual(6)

    const wrongSet = new Set([verifiedOnly[0].id, verifiedOnly[1].id])
    expect(
      filterUnifiedExamQuestions({ incorrectOnly: true, incorrectIdsSet: wrongSet }),
    ).toHaveLength(2)

    // Mock test generator removes the old 25-question cap
    const largeMock = generateUnifiedQuestionSet({ count: 60, seed: 3 })
    expect(largeMock.questions).toHaveLength(60)
    const allMock = generateUnifiedQuestionSet({ count: 'all', seed: 2 })
    expect(allMock.questions).toHaveLength(UNIFIED_EXAM_BANK.length)

    // Validates both numerical input and MCQ evaluation inside mocks
    const cone2024 = verifiedOnly.find((q) => q.id === 'vpyq_ssc_cgl_2024_sep26_cone')
    expect(cone2024).toBeDefined()
    expect(
      validateUnifiedQuestionAnswer(cone2024, { numericInput: '231' }).correct,
    ).toBe(true)

    const evalRes = evaluateUnifiedMockSession(
      [cone2024, verifiedOnly[0]],
      { [verifiedOnly[0].id]: verifiedOnly[0].correctIndex },
      { [cone2024.id]: '231' },
      { [cone2024.id]: 15, [verifiedOnly[0].id]: 20 },
    )
    expect(evalRes.correctCount).toBe(2)
    expect(evalRes.accuracy).toBe(100)

    // Connects dynamically to Frequency Analysis stats without fabricating missing years
    const freqStats = computeArchiveFrequencyStats('verified_pyq')
    expect(freqStats.totalInScope).toBe(41)
    expect(freqStats.verifiedCount).toBe(41)
    const year2017 = freqStats.byYear.find((y) => y.year === 2017)
    expect(year2017?.count).toBeGreaterThanOrEqual(2)
  })
})
