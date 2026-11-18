import { describe, expect, it } from 'vitest'
import { GUIDE_AGENT_TRANSLATIONS } from '../data/guideAgentTranslations.js'
import { LEARNING_PATH_STEPS } from '../data/learningPaths.js'
import { LANGUAGES } from '../data/translations.js'
import {
  analyzeGuideIntent,
  buildPersonalizedGuideBrief,
  getModuleDirectory,
} from './guideAgentEngine.js'
import { SHAPES } from './mathEngine.js'
import { createEmptyProfileData } from './profileStorage.js'

function collectKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k
    if (Array.isArray(v)) {
      return v.flatMap((item, idx) =>
        item && typeof item === 'object' ? collectKeys(item, `${p}[${idx}]`) : [[`${p}[${idx}]`, item]],
      )
    }
    if (v && typeof v === 'object') return collectKeys(v, p)
    return [[p, v]]
  })
}

describe('NetFold AI Guide Agent — Intent Recognition, Navigation, Recommendations & Translations', () => {
  it('recognizes all required natural user requests and maps them to working routes and targets', () => {
    const cylinders = analyzeGuideIntent('I want to learn about cylinders.', { role: 'student' })
    expect(cylinders.intentId).toBe('learn_shape')
    expect(cylinders.detectedShape).toBe(SHAPES.CYLINDER)
    expect(cylinders.actions.some((a) => a.type === 'shape' && a.shape === SHAPES.CYLINDER)).toBe(true)
    expect(cylinders.actions.some((a) => a.type === 'tab' && a.tabId === 'netlab' && a.subTab === 'cylinder')).toBe(true)

    const pyqs = analyzeGuideIntent('Where can I find the PYQs?', { role: 'exam' })
    expect(pyqs.intentId).toBe('find_pyqs')
    expect(pyqs.actions.some((a) => a.tabId === 'pyq_archive')).toBe(true)
    expect(pyqs.actions.some((a) => a.type === 'arena' && a.authenticity === 'verified_pyq')).toBe(true)

    const mock = analyzeGuideIntent('I want to take a mock test.', { role: 'exam' })
    expect(mock.intentId).toBe('take_mock_test')
    expect(mock.actions.some((a) => a.type === 'arena' && a.mode === 'mock')).toBe(true)

    const worksheet = analyzeGuideIntent('How do I generate a worksheet?', { role: 'teacher' })
    expect(worksheet.intentId).toBe('worksheet_generator')
    expect(worksheet.actions.some((a) => a.tabId === 'worksheet_generator')).toBe(true)

    const perf = analyzeGuideIntent('Where can I see my performance?', { role: 'student' })
    expect(perf.intentId).toBe('view_performance')
    expect(perf.actions.some((a) => a.type === 'hub' && a.sectionId === 'student_analytics')).toBe(true)

    const weakSa = analyzeGuideIntent('I am weak in surface area. What should I do?', {
      role: 'student',
      analytics: { totalAttempts: 0, weakTopics: [] },
    })
    expect(weakSa.intentId).toBe('weak_area_remediation')
    expect(weakSa.detectedTopic).toBe('surface_area')
    expect(weakSa.actions.some((a) => a.tabId === 'mistake_detective')).toBe(true)
    expect(weakSa.actions.some((a) => a.type === 'arena' && a.topic === 'surface_area')).toBe(true)

    const demo = analyzeGuideIntent('How can I demonstrate 3D shapes to my class?', { role: 'teacher' })
    expect(demo.intentId).toBe('classroom_demo')
    expect(demo.actions.some((a) => a.tabId === 'teacher_studio')).toBe(true)

    const tour = analyzeGuideIntent('Can you show me a tour of this website?', { role: 'student' })
    expect(tour.intentId).toBe('website_tour')
    expect(tour.actions.some((a) => a.type === 'start_tour')).toBe(true)
  })

  it('computes honest profile-based personalized recommendations without fabricating progress for empty profiles', () => {
    const emptyBrief = buildPersonalizedGuideBrief({
      role: 'student',
      profileData: createEmptyProfileData(),
      learningProgress: { exploredShapes: [], visitedQuestions: [] },
      missionsProgress: {},
      analytics: { totalAttempts: 0, overallAccuracy: 0, weakTopics: [] },
      offlineLocker: null,
      language: 'en',
    })
    expect(emptyBrief.hasRealHistory).toBe(false)
    expect(emptyBrief.totalAttempts).toBe(0)
    expect(emptyBrief.accuracyPct).toBeNull()
    expect(emptyBrief.completedCount).toBe(0)
    expect(emptyBrief.incompleteSteps.length).toBeGreaterThan(0)
    expect(emptyBrief.weakTopics).toEqual([])
    expect(emptyBrief.recommendations.length).toBeGreaterThan(0)

    // With real completed milestones & real weak topics
    const firstExamStep = LEARNING_PATH_STEPS.find((s) => s.audience === 'exam')
    expect(firstExamStep).toBeDefined()
    const richBrief = buildPersonalizedGuideBrief({
      role: 'exam',
      profileData: {
        ...createEmptyProfileData(),
        completedPathSteps: [firstExamStep.id],
        examAttempts: [
          { questionId: 'q1', topic: 'cone_frustum', correct: false, timeSpentSec: 30 },
          { questionId: 'q2', topic: 'cone_frustum', correct: false, timeSpentSec: 25 },
        ],
        mistakeLogs: [{ category: 'slant_height_confusion', topic: 'cone_frustum' }],
      },
      learningProgress: { exploredShapes: ['cone'], visitedQuestions: [0] },
      missionsProgress: { m1: { completed: true } },
      analytics: { totalAttempts: 2, overallAccuracy: 0, weakTopics: ['cone_frustum'] },
      offlineLocker: { lessons: ['cone'], formulas: [], examples: [], questionSets: [] },
      language: 'en',
    })
    expect(richBrief.hasRealHistory).toBe(true)
    expect(richBrief.totalAttempts).toBe(2)
    expect(richBrief.accuracyPct).toBe(0)
    expect(richBrief.completedCount).toBe(1)
    expect(richBrief.weakTopics).toEqual(['cone_frustum'])
    expect(richBrief.offlineSavedCount).toBe(1)
    expect(richBrief.recommendations.some((r) => r.id === 'weak_drill')).toBe(true)
  })

  it('orders role-specific modules accurately and maintains 100% 5-language translation key parity', () => {
    const teacherMods = getModuleDirectory('teacher', 'en')
    const examMods = getModuleDirectory('exam', 'en')
    expect(teacherMods[0].id).toBe('teacher_studio')
    expect(teacherMods[1].id).toBe('worksheet_generator')
    expect(examMods[0].id).toBe('exam_arena')
    expect(examMods[1].id).toBe('pyq_archive')

    const enEntries = collectKeys(GUIDE_AGENT_TRANSLATIONS.en)
    const enKeys = enEntries.map(([k]) => k).sort()
    for (const lang of Object.values(LANGUAGES)) {
      const entries = collectKeys(GUIDE_AGENT_TRANSLATIONS[lang])
      expect(entries.map(([k]) => k).sort(), `Mismatch in guideAgentTranslations.${lang}`).toEqual(enKeys)
      for (const [k, val] of entries) {
        if (typeof val === 'string') {
          expect(val.trim().length, `${lang}.${k}`).toBeGreaterThan(0)
        }
      }
    }
  })
})
