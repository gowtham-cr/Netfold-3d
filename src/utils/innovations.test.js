import { afterEach, describe, expect, it } from 'vitest'
import {
  REALITY_CHALLENGES,
  REALITY_PRESETS,
  computeRealityMetrics,
  normalizeForCanvas3D,
  suggestShapeFromImageMeta,
} from '../data/realityObjects.js'
import { REMEDIATION_QUESTIONS } from '../data/remediationQuestions.js'
import {
  MISTAKE_CATEGORIES,
  diagnoseMistake,
  selectTargetedRemediationQuestions,
} from './mistakeDetective.js'
import { summarizeMistakesAndImprovement } from './analyticsEngine.js'
import {
  createEmptyProfileData,
  loadProfileData,
  saveProfileData,
} from './profileStorage.js'
import { SHAPES, calculateShape } from './mathEngine.js'
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

describe('Shape-to-Reality Lab — Presets, Heuristics, Math & Canvas Normalization', () => {
  it('provides 8 sample real-world presets and 4 applied challenges with distractor metadata', () => {
    expect(REALITY_PRESETS).toHaveLength(8)
    expect(REALITY_CHALLENGES).toHaveLength(4)
    for (const ch of REALITY_CHALLENGES) {
      expect(ch.options).toHaveLength(4)
      expect(ch.distractorDiagnosis).toBeDefined()
    }
  })

  it('proposes candidate shapes honestly from photo metadata without fabricating dimensions', () => {
    expect(
      suggestShapeFromImageMeta({ fileName: 'rooftop_water_tank.jpg', width: 800, height: 1200 }),
    ).toMatchObject({ suggestedShape: SHAPES.CYLINDER, reasonKey: 'filename_cylinder' })

    expect(
      suggestShapeFromImageMeta({ fileName: 'shipping_box.png', width: 1200, height: 800 }),
    ).toMatchObject({ suggestedShape: SHAPES.CUBOID, reasonKey: 'filename_cuboid' })

    expect(
      suggestShapeFromImageMeta({ fileName: 'IMG_0421.jpg', width: 1600, height: 900 }),
    ).toMatchObject({ suggestedShape: SHAPES.CUBOID, reasonKey: 'aspect_wide' })
  })

  it('computes exact mensuration, capacity in litres, paint & packaging waste matching mathEngine', () => {
    const cyl = computeRealityMetrics({
      shape: SHAPES.CYLINDER,
      dimensions: { r: 3, h: 5 },
      unit: 'm',
    })
    const core = calculateShape(SHAPES.CYLINDER, { r: 3, h: 5 })
    expect(cyl.lsa).toBeCloseTo(core.lsa, 6)
    expect(cyl.tsa).toBeCloseTo(core.tsa, 6)
    expect(cyl.volume).toBeCloseTo(core.volume, 6)
    expect(cyl.capacityLitres).toBeCloseTo(core.volume * 1000, 3)
    expect(cyl.packagingSheet).toBeCloseTo(core.tsa * 1.1, 6)
    expect(cyl.supportsFlatNet).toBe(true)

    const dome = computeRealityMetrics({
      shape: SHAPES.HEMISPHERE,
      dimensions: { r: 4 },
      unit: 'm',
    })
    expect(dome.supportsFlatNet).toBe(false)
  })

  it('normalizes oversized real dimensions safely into [1, 10] for Canvas3D', () => {
    const norm = normalizeForCanvas3D(SHAPES.CUBOID, { l: 50, b: 40, h: 25 })
    expect(norm.l).toBeGreaterThanOrEqual(1)
    expect(norm.l).toBeLessThanOrEqual(10)
    expect(norm.b).toBeGreaterThanOrEqual(1)
    expect(norm.b).toBeLessThanOrEqual(10)

    const normFrust = normalizeForCanvas3D(SHAPES.FRUSTUM, { r1: 20, r2: 20, h: 30 })
    expect(normFrust.r1).toBeGreaterThan(normFrust.r2)
  })
})

describe('Mistake Detective — Classification Engine, Targeted 3Q Coach & Heatmap', () => {
  it('diagnoses explicit distractor traps AND quantitative numeric errors across all 6 categories', () => {
    const tankDiag = diagnoseMistake({
      question: REALITY_CHALLENGES[0], // water tank diameter = 2 m
      wrongOptionIndex: 1, // 44,000 Litres (d used as r)
      questionSource: 'reality_lab',
    })
    expect(tankDiag.category).toBe('radius_diameter')
    expect(tankDiag.matchConfidence).toBe('exact_distractor_map')

    // Pure quantitative heuristic WITHOUT distractorDiagnosis
    const coneFormulaTrap = diagnoseMistake({
      question: {
        id: 'raw_cone',
        topic: 'cone_frustum',
        question: 'Find the volume of a cone with radius 3 cm and height 7 cm.',
        options: ['66 cm³', '198 cm³', '132 cm³', '33 cm³'],
        correctIndex: 0,
        formulaUsed: 'V = ⅓πr²h',
        solutionSteps: ['V = 66'],
      },
      wrongOptionIndex: 1, // 198 = 3×66 -> missed ⅓ factor
      questionSource: 'pyq_archive',
    })
    expect(coneFormulaTrap.category).toBe('formula_selection')

    const unitTrap = diagnoseMistake({
      question: {
        id: 'raw_unit',
        topic: 'volume',
        question: 'A water tank holds 2.5 m³. How many Litres of water does it hold?',
        options: ['2500 L', '2.5 L', '25 L', '250 L'],
        correctIndex: 0,
        formulaUsed: '1 m³ = 1000 L',
        solutionSteps: ['2.5 × 1000 = 2500 L'],
      },
      wrongOptionIndex: 1, // factor 0.001 off
      questionSource: 'exam_arena',
    })
    expect(unitTrap.category).toBe('unit_conversion')
  })

  it('has 18 remediation items and always returns 3 targeted questions per category', () => {
    expect(REMEDIATION_QUESTIONS).toHaveLength(18)
    for (const cat of MISTAKE_CATEGORIES) {
      const picked = selectTargetedRemediationQuestions(cat, 'cylinder', 3)
      expect(picked).toHaveLength(3)
      const uniqueIds = new Set(picked.map((p) => p.id))
      expect(uniqueIds.size).toBe(3)
    }
  })

  it('tracks repeated mistake logs and before/after remediation gains in profile storage', () => {
    installMemoryWindow()
    const nowMs = Date.UTC(2026, 4, 18, 12, 0, 0)

    const profile = {
      ...createEmptyProfileData(),
      mistakeLogs: [
        { topic: 'cylinder', category: 'radius_diameter', timestamp: nowMs - 5000 },
        { topic: 'cylinder', category: 'radius_diameter', timestamp: nowMs - 4000 },
        { topic: 'cone_frustum', category: 'formula_selection', timestamp: nowMs - 3000 },
      ],
      remediationSessions: [
        {
          id: 'rem_1',
          mistakeCategory: 'radius_diameter',
          topic: 'cylinder',
          beforeAccuracy: 0,
          afterAccuracy: 100,
          score: 3,
          total: 3,
          timestamp: nowMs - 1000,
        },
      ],
    }

    saveProfileData('student_demo', profile)
    const loaded = loadProfileData('student_demo')
    expect(loaded.mistakeLogs).toHaveLength(3)
    expect(loaded.remediationSessions).toHaveLength(1)

    const summary = summarizeMistakesAndImprovement(loaded, 'all', nowMs)
    expect(summary.totalMistakes).toBe(3)
    expect(summary.topWeakCategory).toBe('radius_diameter')
    expect(summary.byCategory.radius_diameter).toBe(2)
    expect(summary.heatmapRows).toHaveLength(2)
    expect(summary.avgBeforeAcc).toBe(0)
    expect(summary.avgAfterAcc).toBe(100)
    expect(summary.improvementGain).toBe(100)
  })
})

describe('5-Language Parity — Reality Lab, Mistake Detective & Presentation Mode', () => {
  it('maintains identical non-empty UI keys across en, kn, ta, te, hi', () => {
    const enRel = collectLeaves(TRANSLATIONS.en.realityUi).map(([k]) => k).sort()
    const enMis = collectLeaves(TRANSLATIONS.en.mistakeUi).map(([k]) => k).sort()
    const enPre = collectLeaves(TRANSLATIONS.en.presentationUi).map(([k]) => k).sort()

    const langCodes = Object.keys(TRANSLATIONS)
    expect(langCodes).toEqual(['en', 'kn', 'ta', 'te', 'hi'])
    for (const lang of langCodes) {
      const tr = TRANSLATIONS[lang]
      expect(tr.extraNavTabs.reality_lab.trim().length).toBeGreaterThan(0)
      expect(tr.extraNavTabs.mistake_detective.trim().length).toBeGreaterThan(0)
      expect(tr.extraNavTabs.presentation_mode.trim().length).toBeGreaterThan(0)

      expect(collectLeaves(tr.realityUi).map(([k]) => k).sort()).toEqual(enRel)
      expect(collectLeaves(tr.mistakeUi).map(([k]) => k).sort()).toEqual(enMis)
      expect(collectLeaves(tr.presentationUi).map(([k]) => k).sort()).toEqual(enPre)
    }
  })
})
