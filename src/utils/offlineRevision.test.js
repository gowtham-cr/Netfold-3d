import { afterEach, describe, expect, it } from 'vitest'
import {
  buildSmartRevisionPlan,
  createEmptyOfflineLocker,
  evaluateSampleFormulaCard,
  loadOfflineLocker,
  recordOfflineQuizAnswerInLocker,
  removeOfflineQuestionSet,
  resolveQuestionSetItems,
  saveEssentialOfflineStudyKit,
  saveOfflineLocker,
  savePresetQuestionSetOffline,
  toggleOfflineLockerItem,
  toggleRevisionTaskCompletion,
} from './offlineVault.js'
import { createEmptyProfileData } from './profileStorage.js'
import { SHAPES } from './mathEngine.js'
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

describe('Offline Learning Locker — Content Saving, Offline Resolution & Local Persistence', () => {
  it('saves, toggles, resolves and persists lessons, formulas, solved examples and question sets after reload', () => {
    installMemoryWindow()

    let locker = loadOfflineLocker('student_demo')
    expect(locker.lessons).toEqual([])
    expect(locker.questionSets).toEqual([])

    locker = toggleOfflineLockerItem(locker, 'lessons', SHAPES.CYLINDER)
    locker = toggleOfflineLockerItem(locker, 'formulas', SHAPES.CONE)
    locker = toggleOfflineLockerItem(locker, 'examples', 'q1')
    locker = savePresetQuestionSetOffline(locker, {
      id: 'offline_cyl_set',
      title: 'Cylinder PYQ Pack',
      topic: 'cylinder',
      filterFn: (q) => q.topic === 'cylinder',
    })

    expect(locker.lessons).toContain(SHAPES.CYLINDER)
    expect(locker.formulas).toContain(SHAPES.CONE)
    expect(locker.examples).toContain('q1')
    expect(locker.questionSets).toHaveLength(1)

    const resolvedQs = resolveQuestionSetItems(locker.questionSets[0].questionIds)
    expect(resolvedQs.length).toBeGreaterThan(0)
    expect(resolvedQs.every((q) => q.topic === 'cylinder')).toBe(true)

    // Answer first question offline and verify reload persistence
    const firstQ = resolvedQs[0]
    locker = recordOfflineQuizAnswerInLocker(locker, {
      setId: 'offline_cyl_set',
      questionId: firstQ.id,
      pickedIndex: firstQ.correctIndex,
      correct: true,
    })

    saveOfflineLocker('student_demo', locker)

    // Simulated browser refresh with network disabled:
    const reloaded = loadOfflineLocker('student_demo')
    expect(reloaded.lessons).toEqual([SHAPES.CYLINDER])
    expect(reloaded.formulas).toEqual([SHAPES.CONE])
    expect(reloaded.examples).toEqual(['q1'])
    expect(reloaded.offlineQuizAnswers.offline_cyl_set[firstQ.id].correct).toBe(true)

    // Verify per-profile local isolation (no cloud sync)
    const examLocker = loadOfflineLocker('exam_demo')
    expect(examLocker.lessons).toEqual([])
    expect(examLocker.questionSets).toEqual([])

    // Removing a set works cleanly
    const afterRemove = removeOfflineQuestionSet(reloaded, 'offline_cyl_set')
    expect(afterRemove.questionSets).toHaveLength(0)
  })

  it('builds essential offline study kits and evaluates sample formula cards across all 15 shapes', () => {
    const kit = saveEssentialOfflineStudyKit(createEmptyOfflineLocker(), ['cone_frustum'])
    expect(kit.lessons.length).toBeGreaterThanOrEqual(7)
    expect(kit.formulas).toHaveLength(15)
    expect(kit.examples.length).toBeGreaterThanOrEqual(5)
    expect(kit.questionSets.length).toBeGreaterThanOrEqual(2)

    for (const s of Object.values(SHAPES)) {
      const card = evaluateSampleFormulaCard(s)
      expect(card).not.toBeNull()
      expect(card.evaluated.tsa).toBeGreaterThan(0)
      expect(card.evaluated.volume).toBeGreaterThan(0)
    }
  })
})

describe('Smart Revision Planner — Weakness Ranking & 7-Day Calendar Completion', () => {
  it('ranks weak & repeated-mistake topics first and tracks daily task completion across 7 days', () => {
    const nowMs = new Date(2026, 4, 18, 9, 0, 0).getTime()
    const profileData = {
      ...createEmptyProfileData(),
      pyqAttempts: [
        { topic: 'cone_frustum', correct: false, timeSpentSec: 30, timestamp: nowMs - 2000 },
        { topic: 'cone_frustum', correct: false, timeSpentSec: 28, timestamp: nowMs - 1000 },
        { topic: 'cube_cuboid', correct: true, timeSpentSec: 15, timestamp: nowMs - 500 },
      ],
      mistakeLogs: [
        { topic: 'cone_frustum', category: 'formula_selection', timestamp: nowMs - 2000 },
        { topic: 'cone_frustum', category: 'formula_selection', timestamp: nowMs - 1000 },
      ],
    }

    let locker = createEmptyOfflineLocker()
    const planInitial = buildSmartRevisionPlan({
      profileData,
      learningProgress: { exploredShapes: ['cube'], visitedQuestions: [] },
      offlineLocker: locker,
      nowMs,
    })

    expect(planInitial.hasPerformanceData).toBe(true)
    expect(planInitial.recommendedTopics[0].topic).toBe('cone_frustum')
    expect(planInitial.recommendedTopics[0].reason).toBe('repeated_mistakes')
    expect(planInitial.recommendedTopics[0].dominantMistakeCategory).toBe(
      'formula_selection',
    )

    expect(planInitial.calendarDays).toHaveLength(7)
    expect(planInitial.totalTasksCount).toBe(14)
    expect(planInitial.completedTasksCount).toBe(0)
    expect(planInitial.completionPct).toBe(0)

    // Complete both tasks for Day 1
    for (const task of planInitial.calendarDays[0].tasks) {
      locker = toggleRevisionTaskCompletion(locker, task.id)
    }

    const planUpdated = buildSmartRevisionPlan({
      profileData,
      learningProgress: { exploredShapes: ['cube'], visitedQuestions: [] },
      offlineLocker: locker,
      nowMs,
    })
    expect(planUpdated.completedTasksCount).toBe(2)
    expect(planUpdated.daysCompletedCount).toBe(1)
    expect(planUpdated.calendarDays[0].allDone).toBe(true)
    expect(planUpdated.completionPct).toBe(Math.round((2 / 14) * 100))
  })
})

describe('5-Language Parity — Offline & Smart Revision UI', () => {
  it('maintains identical non-empty offlineUi & nav keys across en, kn, ta, te, hi', () => {
    const enKeys = collectLeaves(TRANSLATIONS.en.offlineUi).map(([k]) => k).sort()
    for (const lang of Object.keys(TRANSLATIONS)) {
      const tr = TRANSLATIONS[lang]
      expect(typeof tr.extraNavTabs.offline_revision).toBe('string')
      expect(tr.extraNavTabs.offline_revision.trim().length).toBeGreaterThan(0)
      const langLeaves = collectLeaves(tr.offlineUi)
      expect(langLeaves.map(([k]) => k).sort()).toEqual(enKeys)
      for (const [, val] of langLeaves) {
        expect(typeof val).toBe('string')
        expect(val.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
