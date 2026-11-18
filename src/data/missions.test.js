import { describe, expect, it } from 'vitest'
import {
  CUBE_NET_CHALLENGES,
  MISSION_IDS,
  MISSIONS_CONTENT,
  calculateMissionStars,
  evaluateClassroomPainterAnswer,
  evaluateCubeNetAnswer,
  evaluatePackagingOptimiser,
  evaluateWaterTankDesign,
} from './missions.js'
import { LANGUAGES, TRANSLATIONS } from './translations.js'
import { CLASS_10_PRACTICE_CONTENT } from './class10Practice.js'
import {
  CLASS_10_PRACTICE_IDS,
  SHAPES,
  validateCubeNet,
} from '../utils/mathEngine.js'
import {
  computeDashboardStats,
  createDefaultMissionsProgress,
  filterGlobalSearchResults,
  toggleBookmarkEntry,
} from '../utils/learningProgress.js'

const ALL_SHAPES = Object.values(SHAPES)

describe('Four Interactive Missions math & validation engine', () => {
  it('computes exact top-face topology for all Cube Net Challenge rounds', () => {
    expect(CUBE_NET_CHALLENGES).toHaveLength(3)
    CUBE_NET_CHALLENGES.forEach((challenge, idx) => {
      const check = validateCubeNet(challenge.cells, challenge.rootIndex)
      expect(check.valid).toBe(true)
      expect(challenge.baseFaceNumber).toBe(challenge.rootIndex + 1)
      expect(challenge.topFaceNumber).not.toBe(challenge.baseFaceNumber)

      const good = evaluateCubeNetAnswer(idx, challenge.topFaceNumber)
      expect(good.validInput).toBe(true)
      expect(good.correct).toBe(true)

      const wrong = evaluateCubeNetAnswer(idx, challenge.baseFaceNumber)
      expect(wrong.validInput).toBe(true)
      expect(wrong.correct).toBe(false)
    })
  })

  it('validates Classroom Painter 4-wall LSA while catching floor+ceiling mistake', () => {
    const correct = evaluateClassroomPainterAnswer(112, { l: 8, b: 6, h: 4 })
    expect(correct.correct).toBe(true)
    expect(correct.expectedArea).toBe(112)
    expect(correct.excludedArea).toBe(96)

    const tsaMistake = evaluateClassroomPainterAnswer(208, { l: 8, b: 6, h: 4 })
    expect(tsaMistake.correct).toBe(false)
    expect(tsaMistake.includedFloorOrCeiling).toBe(true)
  })

  it('validates Mid-Day Meal Water Tank cylindrical dimensions for 1540 L target', () => {
    const exactPi227 = evaluateWaterTankDesign(0.7, 1.0, 1540)
    expect(exactPi227.validInput).toBe(true)
    expect(exactPi227.correct).toBe(true)

    const altValid = evaluateWaterTankDesign(0.5, 1.96, 1540)
    expect(altValid.validInput).toBe(true)
    expect(altValid.correct).toBe(true)

    const undersized = evaluateWaterTankDesign(0.4, 1.0, 1540)
    expect(undersized.correct).toBe(false)
    expect(undersized.status).toBe('too_small')
  })

  it('validates Packaging Optimiser minimum TSA (cube 4x4x4 = 96 cm²) and reasoning', () => {
    const suboptimal = evaluatePackagingOptimiser(2, 4, 8, 'cube_minimises', 64)
    expect(suboptimal.volumeMatches).toBe(true)
    expect(suboptimal.computedTsa).toBe(112)
    expect(suboptimal.isMinimumSurface).toBe(false)
    expect(suboptimal.correct).toBe(false)

    const wrongReason = evaluatePackagingOptimiser(4, 4, 4, 'tall_minimises', 64)
    expect(wrongReason.volumeMatches).toBe(true)
    expect(wrongReason.isMinimumSurface).toBe(true)
    expect(wrongReason.reasonCorrect).toBe(false)
    expect(wrongReason.correct).toBe(false)

    const optimal = evaluatePackagingOptimiser(4, 4, 4, 'cube_minimises', 64)
    expect(optimal.correct).toBe(true)
    expect(optimal.computedTsa).toBe(96)
    expect(optimal.minTsa).toBe(96)
  })

  it('computes 1-3 stars cleanly by attempt count', () => {
    expect(calculateMissionStars(1)).toBe(3)
    expect(calculateMissionStars(2)).toBe(2)
    expect(calculateMissionStars(3)).toBe(1)
    expect(calculateMissionStars(5)).toBe(1)
  })

  it('tracks learning stats, bookmarks, and achievement badges accurately', () => {
    let bookmarks = { shapes: [], questions: [] }
    bookmarks = toggleBookmarkEntry(bookmarks, 'shapes', 'cone')
    bookmarks = toggleBookmarkEntry(bookmarks, 'questions', 'q1')
    expect(bookmarks).toEqual({ shapes: ['cone'], questions: ['q1'] })
    bookmarks = toggleBookmarkEntry(bookmarks, 'shapes', 'cone')
    expect(bookmarks.shapes).toEqual([])

    const missionsProgress = createDefaultMissionsProgress()
    missionsProgress.cube_net = { completed: true, stars: 3, attempts: 1 }
    missionsProgress.classroom_painter = { completed: true, stars: 2, attempts: 2 }

    const stats = computeDashboardStats({
      learningProgress: {
        exploredShapes: ALL_SHAPES,
        visitedQuestions: CLASS_10_PRACTICE_IDS,
      },
      missionsProgress,
      netCheckerSummary: { answeredCount: 10, totalPuzzles: 10, bestScore: 9 },
      bookmarks,
    })

    expect(stats.shapesCount).toBe(15)
    expect(stats.missionsCompleted).toBe(2)
    expect(stats.totalStars).toBe(5)
    expect(stats.questionsVisitedCount).toBe(10)
    expect(stats.badges.find((b) => b.id === 'master_15')?.unlocked).toBe(true)
    expect(stats.badges.find((b) => b.id === 'mission_challenger')?.unlocked).toBe(true)
    expect(stats.badges.find((b) => b.id === 'star_achiever')?.unlocked).toBe(false)
    expect(stats.badges.find((b) => b.id === 'board_scholar')?.unlocked).toBe(true)
  })

  it('provides full 5-language content parity across all 4 missions', () => {
    for (const lang of Object.values(LANGUAGES)) {
      const bundle = MISSIONS_CONTENT[lang]
      expect(bundle, `Missing missions bundle for ${lang}`).toBeDefined()
      for (const mId of MISSION_IDS) {
        const entry = bundle[mId]
        expect(entry, `Missing ${lang}.${mId}`).toBeDefined()
        expect(typeof entry.title).toBe('string')
        expect(entry.title.trim().length).toBeGreaterThan(0)
        expect(typeof entry.objective).toBe('string')
        expect(entry.objective.trim().length).toBeGreaterThan(0)
        expect(typeof entry.instructions).toBe('string')
        expect(entry.instructions.trim().length).toBeGreaterThan(0)
        expect(Array.isArray(entry.hints)).toBe(true)
        expect(entry.hints.length).toBeGreaterThanOrEqual(2)
        expect(typeof entry.successMessage).toBe('string')
        expect(entry.successMessage.trim().length).toBeGreaterThan(0)
      }
      expect(Object.keys(bundle.packaging_optimiser.reasons).sort()).toEqual([
        'cube_minimises',
        'tall_minimises',
        'volume_equals_tsa',
      ])
    }
  })

  it('indexes shapes, missions, Class 10 questions, Net Lab, and Guide sections in Global Search', () => {
    const resCone = filterGlobalSearchResults('cone', {
      translations: TRANSLATIONS.en,
      enTranslations: TRANSLATIONS.en,
      class10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      missionsBundle: MISSIONS_CONTENT.en,
    })
    expect(resCone.some((item) => item.id === 'shape:cone')).toBe(true)

    const resTank = filterGlobalSearchResults('water tank', {
      translations: TRANSLATIONS.en,
      enTranslations: TRANSLATIONS.en,
      class10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      missionsBundle: MISSIONS_CONTENT.en,
    })
    expect(resTank.some((item) => item.id === 'mission:water_tank')).toBe(true)

    const resQ6 = filterGlobalSearchResults('24 cm', {
      translations: TRANSLATIONS.kn,
      enTranslations: TRANSLATIONS.en,
      class10Bundle: CLASS_10_PRACTICE_CONTENT.kn,
      enClass10Bundle: CLASS_10_PRACTICE_CONTENT.en,
      missionsBundle: MISSIONS_CONTENT.kn,
      enMissionsBundle: MISSIONS_CONTENT.en,
    })
    expect(resQ6.some((item) => item.category === 'practice')).toBe(true)
  })
})
