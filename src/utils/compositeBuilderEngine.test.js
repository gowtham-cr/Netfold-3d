import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { COMPOSITE_BUILDER_TRANSLATIONS } from '../data/compositeBuilderTranslations.js'
import { TRANSLATIONS } from '../data/translations.js'
import { MAX_DIMENSION, MIN_DIMENSION, SHAPES } from './mathEngine.js'
import {
  alignComponentToFloor,
  analyzeCompositeSolid,
  buildPresetCompositeScene,
  computeExplodedPosition,
  createBuilderComponent,
  deleteCompositeProblemItem,
  duplicateCompositeProblemItem,
  generateComposite7Steps,
  getComponentWorldBounds,
  getCompositeCentroid,
  interpretCompositeQuestionText,
  loadSavedCompositeProblems,
  saveCompositeProblemItem,
  snapComponentOnTop,
  snapComponentSideBySide,
  updateComponentDimensionAndKeepFloor,
  validateComponentDimensions,
} from './compositeBuilderEngine.js'

const ALL_LANGS = ['en', 'kn', 'ta', 'te', 'hi']

function collectKeysNonEmpty(obj, prefix = '', out = []) {
  if (typeof obj === 'string') {
    expect(obj.trim().length, `Empty string at ${prefix}`).toBeGreaterThan(0)
    out.push(prefix)
    return out
  }
  if (Array.isArray(obj)) {
    expect(obj.length, `Empty array at ${prefix}`).toBeGreaterThan(0)
    out.push(`${prefix}[]`)
    obj.forEach((item) => {
      expect(String(item).trim().length).toBeGreaterThan(0)
    })
    return out
  }
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj).sort()) {
      collectKeysNonEmpty(obj[k], prefix ? `${prefix}.${k}` : k, out)
    }
  }
  return out
}

describe('Composite 3D Solid Builder — Required Test Cases & Math Engine', () => {
  it('TEST 1: Cone placed on top of a cylinder with equal radii calculates exact combined volume', () => {
    const cyl = createBuilderComponent(SHAPES.CYLINDER, {
      dimensions: { r: 3, h: 5 },
    })
    const cone = snapComponentOnTop(
      createBuilderComponent(SHAPES.CONE, { dimensions: { r: 3, h: 4 } }),
      cyl,
    )

    const bCyl = getComponentWorldBounds(cyl)
    const bCone = getComponentWorldBounds(cone)
    expect(bCone.minY).toBeCloseTo(bCyl.maxY, 4)

    const analysis = analyzeCompositeSolid([cyl, cone])
    expect(analysis.status).toBe('ready')
    // Cylinder V = pi*9*5 = 45pi; Cone V = (1/3)*pi*9*4 = 12pi => 57pi
    expect(analysis.totalVolume).toBeCloseTo(57 * Math.PI, 4)
  })

  it('TEST 2: Hemisphere placed on top of a cylinder calculates exact combined volume', () => {
    const cyl = createBuilderComponent(SHAPES.CYLINDER, {
      dimensions: { r: 3, h: 5 },
    })
    const hemi = snapComponentOnTop(
      createBuilderComponent(SHAPES.HEMISPHERE, { dimensions: { r: 3 } }),
      cyl,
    )

    const bCyl = getComponentWorldBounds(cyl)
    const bHemi = getComponentWorldBounds(hemi)
    expect(bHemi.minY).toBeCloseTo(bCyl.maxY, 4)

    const analysis = analyzeCompositeSolid([cyl, hemi])
    expect(analysis.status).toBe('ready')
    // Cylinder V = 45pi; Hemisphere V = (2/3)*pi*27 = 18pi => 63pi
    expect(analysis.totalVolume).toBeCloseTo(63 * Math.PI, 4)
  })

  it('TEST 3: Two cuboids combined side-by-side calculate exact total volume and exclude joined side face', () => {
    const c1 = createBuilderComponent(SHAPES.CUBOID, {
      dimensions: { l: 4, b: 3, h: 5 },
    })
    const c2 = snapComponentSideBySide(
      createBuilderComponent(SHAPES.CUBOID, {
        dimensions: { l: 2, b: 3, h: 5 },
      }),
      c1,
      'x',
    )

    const analysis = analyzeCompositeSolid([c1, c2])
    expect(analysis.status).toBe('ready')
    expect(analysis.totalVolume).toBeCloseTo(90, 6) // 4*3*5 + 2*3*5
    expect(analysis.naiveTsaSum).toBeCloseTo(94 + 62, 6) // 156
    expect(analysis.excludedContactArea).toBeCloseTo(2 * (3 * 5), 6) // 30
    expect(analysis.externalSurfaceArea).toBeCloseTo(126, 6) // Equivalent single 6x3x5 cuboid TSA
  })

  it('TEST 4: Cone + Cylinder external surface area excludes BOTH joined circular contact caps', () => {
    const cyl = createBuilderComponent(SHAPES.CYLINDER, {
      dimensions: { r: 3, h: 5 },
    })
    const cone = snapComponentOnTop(
      createBuilderComponent(SHAPES.CONE, { dimensions: { r: 3, h: 4 } }), // l = 5
      cyl,
    )

    const analysis = analyzeCompositeSolid([cyl, cone])
    expect(analysis.status).toBe('ready')
    expect(analysis.contactInterfaces).toHaveLength(1)
    expect(analysis.contactInterfaces[0].singleFaceArea).toBeCloseTo(9 * Math.PI, 4)
    expect(analysis.excludedContactArea).toBeCloseTo(18 * Math.PI, 4)

    // External SA = Base(9pi) + Cyl CSA(30pi) + Cone CSA(15pi) = 54pi (naive TSA sum would be 72pi)
    expect(analysis.naiveTsaSum).toBeCloseTo(72 * Math.PI, 4)
    expect(analysis.externalSurfaceArea).toBeCloseTo(54 * Math.PI, 4)
  })

  it('TEST 5: Changing radius of a component immediately updates geometry bounds, metrics & validates bounds', () => {
    const { components } = buildPresetCompositeScene('coneOnCylinder')
    const initial = analyzeCompositeSolid(components)

    const invalidCheck = validateComponentDimensions(SHAPES.CYLINDER, { r: -4, h: 99 })
    expect(invalidCheck.valid).toBe(false)
    expect(invalidCheck.normalized.r).toBe(MIN_DIMENSION)
    expect(invalidCheck.normalized.h).toBe(MAX_DIMENSION)

    const { component: resizedCyl } = updateComponentDimensionAndKeepFloor(
      components[0],
      'r',
      6,
    )
    const snappedCone = snapComponentOnTop(components[1], resizedCyl)
    const after = analyzeCompositeSolid([resizedCyl, snappedCone])

    expect(after.totalVolume).toBeGreaterThan(initial.totalVolume)
    expect(after.componentAnalyses[0].dimensions.r).toBe(6)
    // Exposed bottom + larger top annular ring (36pi - 9pi = 27pi) are included dynamically
    expect(after.contactInterfaces[0].singleFaceArea).toBeCloseTo(9 * Math.PI, 4)
  })

  it('TEST 6: Explode view separates components outward and reassembles cleanly back to original coordinates', () => {
    const { components } = buildPresetCompositeScene('capsule')
    const centroid = getCompositeCentroid(components)

    const explodedPositions = components.map((c) =>
      computeExplodedPosition(c, centroid, 1),
    )
    const distsAssembled = components.map((c) =>
      Math.hypot(
        c.position[0] - centroid[0],
        c.position[1] - centroid[1],
        c.position[2] - centroid[2],
      ),
    )
    const distsExploded = explodedPositions.map((p) =>
      Math.hypot(p[0] - centroid[0], p[1] - centroid[1], p[2] - centroid[2]),
    )

    distsExploded.forEach((d, idx) => {
      expect(d).toBeGreaterThan(distsAssembled[idx])
    })

    const reassembledPositions = components.map((c) =>
      computeExplodedPosition(c, centroid, 0),
    )
    reassembledPositions.forEach((p, idx) => {
      expect(p).toEqual(components[idx].position)
    })
  })
})

describe('Validation Warnings, 7-Step Solutions, Question Parser & Local Persistence', () => {
  let originalWindow
  let store

  beforeEach(() => {
    originalWindow = globalThis.window
    store = new Map()
    globalThis.window = {
      localStorage: {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => {
          store.set(k, String(v))
        },
      },
    }
  })

  afterEach(() => {
    globalThis.window = originalWindow
  })

  it('flags interior overlap and disconnected solids instead of misleadingly combining them silently', () => {
    const c1 = createBuilderComponent(SHAPES.CUBE, { dimensions: { a: 4 }, position: [0, 2, 0] })
    const cOverlapping = createBuilderComponent(SHAPES.CUBE, {
      dimensions: { a: 4 },
      position: [1, 2, 0],
    })
    const overlapAnalysis = analyzeCompositeSolid([c1, cOverlapping])
    expect(overlapAnalysis.status).toBe('overlap_warning')
    expect(overlapAnalysis.overlaps).toHaveLength(1)

    const cSeparated = createBuilderComponent(SHAPES.CUBE, {
      dimensions: { a: 4 },
      position: [8, 2, 0],
    })
    const gapAnalysis = analyzeCompositeSolid([c1, cSeparated])
    expect(gapAnalysis.status).toBe('disconnected_warning')
    expect(gapAnalysis.disconnectedPairsCount).toBe(1)

    const invertedHemi = alignComponentToFloor(
      createBuilderComponent(SHAPES.HEMISPHERE, {
        dimensions: { r: 3 },
        rotation: [Math.PI, 0, 0],
      }),
    )
    expect(getComponentWorldBounds(invertedHemi).minY).toBeCloseTo(0, 4)
  })

  it('enforces 100% 5-language parity and generates 7 teaching steps in en, kn, ta, te, hi', () => {
    const enKeys = collectKeysNonEmpty(COMPOSITE_BUILDER_TRANSLATIONS.en, 'en')
    for (const lang of ALL_LANGS.filter((l) => l !== 'en')) {
      const langKeys = collectKeysNonEmpty(COMPOSITE_BUILDER_TRANSLATIONS[lang], lang)
      expect(langKeys.map((k) => k.replace(`${lang}.`, 'en.'))).toEqual(enKeys)
    }

    const { components, questionText } = buildPresetCompositeScene('coneOnCylinder')
    const analysis = analyzeCompositeSolid(components)
    for (const lang of ALL_LANGS) {
      const steps = generateComposite7Steps(analysis, questionText, lang, TRANSLATIONS[lang])
      expect(steps).toHaveLength(7)
      steps.forEach((st) => {
        expect(st.title.trim().length).toBeGreaterThan(0)
        expect(st.body.trim().length).toBeGreaterThan(0)
      })
    }
  })

  it('interprets standard composite text transparently and persists/duplicates/reopens/deletes in localStorage', () => {
    const parsed = interpretCompositeQuestionText(
      'A hemisphere of radius 3 cm stands on a cylinder of height 5 cm.',
    )
    expect(parsed.interpreted).toBe(true)
    expect(parsed.components).toHaveLength(2)

    const custom = interpretCompositeQuestionText('Some unusual irregular pyramid sculpture.')
    expect(custom.interpreted).toBe(false)

    const { record } = saveCompositeProblemItem(
      {
        title: 'Class 10 Cone+Cyl Demo',
        questionText: 'Cone on Cylinder test',
        teachingNotes: 'Remember to subtract 2*pi*r^2',
        components: parsed.components,
      },
      'teacher_demo',
    )

    const loaded = loadSavedCompositeProblems('teacher_demo')
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe(record.id)

    const afterDup = duplicateCompositeProblemItem(record.id, 'teacher_demo')
    expect(afterDup).toHaveLength(2)
    expect(afterDup[0].title).toContain('(Copy)')

    const afterDel = deleteCompositeProblemItem(record.id, 'teacher_demo')
    expect(afterDel).toHaveLength(1)
  })
})
