import { describe, expect, it } from 'vitest'
import {
  NCERT_CLASSES,
  NCERT_CURRICULUM_QUESTIONS,
  getNcertChaptersForClass,
} from '../data/ncertCurriculumBank.js'
import { TEACHER_STUDIO_EXTENDED } from '../data/teacherStudioTranslations.js'
import { LANGUAGES } from '../data/translations.js'
import { SHAPES } from './mathEngine.js'
import {
  askTeacherStudioAssistant,
  attemptBrowserOcr,
  generateSimilarNcertQuestions,
  normalizeDimsForCanvas3D,
  solveNcertMensurationQuestion,
} from './ncertQuestionSolver.js'

function collectLeafKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k
    if (Array.isArray(v)) return v.map((item, idx) => [`${p}[${idx}]`, item])
    if (v && typeof v === 'object') return collectLeafKeys(v, p)
    return [[p, v]]
  })
}

describe('Interactive NCERT Teacher Studio Solver — Mathematics, Combined Solids, OCR & Translations', () => {
  it('solves all representative NCERT problems (Cube, Cuboid, Cylinder, Cone, Sphere, Combined Solids, Units) with exact independent math', () => {
    // 1. Two cubes of volume 64 cm³ joined -> 160 cm²
    const twoCubes = solveNcertMensurationQuestion(
      '2 cubes each of volume 64 cm³ are joined end to end. Find the surface area of the resulting cuboid.',
    )
    expect(twoCubes.supported).toBe(true)
    expect(twoCubes.primaryShape).toBe(SHAPES.CUBOID)
    expect(twoCubes.secondaryShape).toBe(SHAPES.CUBE)
    expect(twoCubes.finalNumericValue).toBe(160)
    expect(twoCubes.finalUnit).toBe('cm²')
    expect(twoCubes.steps).toHaveLength(10)
    expect(twoCubes.partsBreakdown).toHaveLength(2)

    // 2. Vessel: hemisphere d=14, total height=13 -> 572 cm²
    const vessel = solveNcertMensurationQuestion(
      'A vessel is in the form of a hollow hemisphere mounted by a hollow cylinder. The diameter of the hemisphere is 14 cm and the total height of the vessel is 13 cm. Find the inner surface area of the vessel.',
    )
    expect(vessel.supported).toBe(true)
    expect(vessel.primaryShape).toBe(SHAPES.CYLINDER)
    expect(vessel.secondaryShape).toBe(SHAPES.HEMISPHERE)
    expect(vessel.finalNumericValue).toBeCloseTo(572, 1)

    // 3. Toy: cone r=3.5 on hemisphere, total height=15.5 -> 214.5 cm²
    const toy = solveNcertMensurationQuestion(
      'A toy is in the form of a cone of radius 3.5 cm mounted on a hemisphere of same radius. The total height of the toy is 15.5 cm. Find the total surface area of the toy.',
    )
    expect(toy.supported).toBe(true)
    expect(toy.primaryShape).toBe(SHAPES.CONE)
    expect(toy.finalNumericValue).toBeCloseTo(214.5, 1)

    // 4. Capsule: cylinder + 2 hemispheres, L=14 mm, d=5 mm -> 220 mm²
    const capsule = solveNcertMensurationQuestion(
      'A medicine capsule is in the shape of a cylinder with two hemispheres stuck to each of its ends. The length of the entire capsule is 14 mm and the diameter of the capsule is 5 mm. Find its surface area.',
    )
    expect(capsule.supported).toBe(true)
    expect(capsule.finalNumericValue).toBeCloseTo(220, 1)
    expect(capsule.finalUnit).toBe('mm²')

    // 5. Cylinder inverse CSA: CSA = 94.2, h = 5, π = 3.14 -> r = 3 cm
    const invCyl = solveNcertMensurationQuestion(
      'The curved surface area of a cylinder of height 5 cm is 94.2 cm². Find its radius. Take π = 3.14.',
    )
    expect(invCyl.supported).toBe(true)
    expect(invCyl.piLabel).toBe('3.14')
    expect(invCyl.finalNumericValue).toBeCloseTo(3, 2)

    // 6. Cuboid Unit Conversion: l=2 m, b=1.5 m, h=100 cm -> Volume = 3,000,000 cm³ / 3000 litres
    const tank = solveNcertMensurationQuestion(
      'Find the volume in litres of a rectangular cuboid water tank with length 2 m, breadth 1.5 m and height 100 cm.',
    )
    expect(tank.supported).toBe(true)
    expect(tank.primaryShape).toBe(SHAPES.CUBOID)
    expect(tank.finalNumericValue).toBeCloseTo(3000, 1)
    expect(tank.finalUnit).toBe('litres')

    // 7. Cone CSA: d=10.5 cm, l=10 cm -> 165 cm²
    const cone = solveNcertMensurationQuestion(
      'Diameter of the base of a cone is 10.5 cm and its slant height is 10 cm. Find its curved surface area.',
    )
    expect(cone.supported).toBe(true)
    expect(cone.finalNumericValue).toBeCloseTo(165, 1)

    // 8. Sphere SA: r=5.6 cm -> 394.24 cm²
    const sphere = solveNcertMensurationQuestion(
      'Find the surface area of a sphere of radius 5.6 cm. (Take π = 22/7)',
    )
    expect(sphere.supported).toBe(true)
    expect(sphere.finalNumericValue).toBeCloseTo(394.24, 2)

    // 9. Cube TSA: side 6 cm -> 216 cm²
    const cube = solveNcertMensurationQuestion(
      'Find the total surface area and volume of a cube of side 6 cm.',
    )
    expect(cube.supported).toBe(true)
    expect(cube.finalNumericValue).toBe(216)

    // Canvas normalization stays strictly inside [1..10]
    const norm = normalizeDimsForCanvas3D(SHAPES.CYLINDER, { r: 21, h: 48 })
    expect(norm.r).toBeLessThanOrEqual(10)
    expect(norm.h).toBeLessThanOrEqual(10)
    expect(norm.r).toBeGreaterThanOrEqual(1)
  })

  it('rejects out-of-scope or missing-dimension problems honestly without fabricating answers', () => {
    const outScope = solveNcertMensurationQuestion('Solve the quadratic equation x^2 - 5x + 6 = 0.')
    expect(outScope.supported).toBe(false)
    expect(outScope.reasonType).toBe('out_of_scope')

    const missingDim = solveNcertMensurationQuestion('Find the volume of a cylinder.')
    expect(missingDim.supported).toBe(false)
    expect(missingDim.reasonType).toBe('missing_values')
  })

  it('generates similar practice questions, answers Teacher Studio queries across languages, handles OCR fallback cleanly & solves every curated NCERT item', async () => {
    expect(NCERT_CLASSES.length).toBeGreaterThanOrEqual(4)
    expect(getNcertChaptersForClass('10').length).toBeGreaterThanOrEqual(1)

    for (const q of NCERT_CURRICULUM_QUESTIONS) {
      const res = solveNcertMensurationQuestion(q.questionText)
      expect(res.supported, `Failed curated question ${q.id}`).toBe(true)
      expect(res.steps).toHaveLength(10)
    }

    const cylSolved = solveNcertMensurationQuestion(
      'Find the CSA and TSA of a cylinder of radius 7 cm and height 10 cm.',
    )
    const sim = generateSimilarNcertQuestions(cylSolved, 'medium', 3)
    expect(sim).toHaveLength(3)
    for (const item of sim) {
      expect(item.authenticity).toBe('similar_practice_generated')
      expect(item.options).toHaveLength(4)
      expect(item.correctIndex).toBeGreaterThanOrEqual(0)
      expect(item.correctIndex).toBeLessThan(4)
    }

    const whyCsa = askTeacherStudioAssistant('Why do we use CSA instead of TSA?', {
      solved: cylSolved,
      language: 'en',
    })
    expect(whyCsa.modeLabel).toMatch(/Local Deterministic/)
    expect(whyCsa.answer).toMatch(/CSA/)

    const inKannada = askTeacherStudioAssistant('Explain this shape in Kannada', {
      solved: cylSolved,
      language: 'kn',
    })
    expect(inKannada.speakLang).toBe('kn')
    expect(inKannada.answer.length).toBeGreaterThan(5)

    // Graceful OCR fallback in environment without browser TextDetector
    const ocrFallback = await attemptBrowserOcr({ name: 'test.png' })
    expect(ocrFallback.supported).toBe(false)
    expect(ocrFallback.message).toMatch(/not available/i)
  })

  it('maintains 100% 5-language translation key parity across TEACHER_STUDIO_EXTENDED', () => {
    const enKeys = collectLeafKeys(TEACHER_STUDIO_EXTENDED.en).map(([k]) => k).sort()
    for (const lang of Object.values(LANGUAGES)) {
      const entries = collectLeafKeys(TEACHER_STUDIO_EXTENDED[lang])
      expect(entries.map(([k]) => k).sort(), `Mismatch in teacherStudioTranslations.${lang}`).toEqual(enKeys)
      for (const [k, val] of entries) {
        expect(typeof val, `${lang}.${k}`).toBe('string')
        expect(val.trim().length, `${lang}.${k}`).toBeGreaterThan(0)
      }
    }
  })
})
