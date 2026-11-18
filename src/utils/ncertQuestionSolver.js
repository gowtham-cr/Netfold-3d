import { TRANSLATIONS } from '../data/translations.js'
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  calculateShape,
} from './mathEngine.js'
import { detectShapeInPrompt, getTutorConnectionStatus } from './tutorEngine.js'

const UNIT_TO_CM = Object.freeze({
  mm: 0.1,
  cm: 1,
  m: 100,
})

export function fmtCalc(val, decimals = 2) {
  if (!Number.isFinite(val)) return '—'
  const rounded = Number(val.toFixed(decimals))
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

/**
 * Safely scales arbitrary real-world/textbook dimensions into Three.js Canvas3D's [1..10]
 * bounding range while preserving aspect ratio for visual demonstration.
 */
export function normalizeDimsForCanvas3D(shape, rawDims = {}) {
  const entries = Object.entries(rawDims).filter(
    ([, v]) => Number.isFinite(v) && v > 0,
  )
  if (entries.length === 0) {
    return shape === SHAPES.CUBOID
      ? { l: 6, b: 4, h: 3 }
      : shape === SHAPES.FRUSTUM
        ? { r1: 5, r2: 3, h: 4 }
        : { r: 3, h: 5, a: 4 }
  }
  const maxVal = Math.max(...entries.map(([, v]) => v))
  const minVal = Math.min(...entries.map(([, v]) => v))
  let scale = 1
  if (maxVal > 8) scale = 8 / maxVal
  else if (maxVal < 2.5) scale = 5 / maxVal
  else if (minVal < MIN_DIMENSION) scale = MIN_DIMENSION / minVal

  const scaled = {}
  for (const [k, v] of entries) {
    const val = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, Number((v * scale).toFixed(2))))
    scaled[k] = val
  }
  return scaled
}

function getPiValue(text, piOverride = null) {
  if (piOverride === '3.14') return { pi: 3.14, piLabel: '3.14' }
  if (piOverride === '22/7') return { pi: 22 / 7, piLabel: '22/7' }
  if (/3\.14/.test(String(text ?? ''))) return { pi: 3.14, piLabel: '3.14' }
  return { pi: 22 / 7, piLabel: '22/7' }
}

function normalizeUnitToken(u) {
  const lower = String(u ?? '').toLowerCase()
  if (lower.startsWith('mm')) return 'mm'
  if (lower.startsWith('cm')) return 'cm'
  if (lower === 'm' || lower.startsWith('meter') || lower.startsWith('metre')) return 'm'
  return null
}

/**
 * Extracts labeled numeric measure + unit from question prose, ignoring `π = 3.14` / `22/7`.
 */
function extractMeasure(cleanText, patterns) {
  for (const pattern of patterns) {
    const match = cleanText.match(pattern)
    if (match) {
      const value = Number(match[1])
      if (Number.isFinite(value) && value > 0) {
        const unit = normalizeUnitToken(match[2])
        return { value, unit }
      }
    }
  }
  return null
}

function resolveCommonLengthUnit(measures) {
  const units = measures.filter(Boolean).map((m) => m.unit).filter(Boolean)
  if (units.length === 0) return { baseUnit: 'cm', hasMixedUnits: false, conversionNotes: [] }
  const distinct = Array.from(new Set(units))
  if (distinct.length === 1) {
    return { baseUnit: distinct[0], hasMixedUnits: false, conversionNotes: [] }
  }
  // Normalize mixed units cleanly to cm (except m+cm where cm keeps values exact)
  return {
    baseUnit: 'cm',
    hasMixedUnits: true,
    conversionNotes: [],
  }
}

function convertMeasureToUnit(measure, targetUnit) {
  if (!measure) return null
  const fromUnit = measure.unit ?? targetUnit
  const factor = (UNIT_TO_CM[fromUnit] ?? 1) / (UNIT_TO_CM[targetUnit] ?? 1)
  return {
    originalValue: measure.value,
    originalUnit: fromUnit,
    value: Number((measure.value * factor).toFixed(6)),
    unit: targetUnit,
    converted: fromUnit !== targetUnit && factor !== 1,
  }
}

function buildStepsPayload({
  understand,
  given,
  required,
  shapeLabel,
  formula,
  unitConversion,
  substitution,
  calculations,
  finalAnswer,
  whyCorrect,
}) {
  return [
    { stepNo: 1, title: '1. Understand the Question', body: understand },
    { stepNo: 2, title: '2. Given Information', body: given },
    { stepNo: 3, title: '3. Required Quantity', body: required },
    { stepNo: 4, title: '4. Identify the Geometric Shape', body: shapeLabel },
    { stepNo: 5, title: '5. Select the Correct Formula', body: formula },
    { stepNo: 6, title: '6. Substitute the Given Values', body: substitution },
    { stepNo: 7, title: '7. Step-by-Step Calculations', body: calculations.join('\n') },
    { stepNo: 8, title: '8. Unit Conversions & Precision', body: unitConversion },
    { stepNo: 9, title: '9. Final Answer with Units', body: finalAnswer },
    { stepNo: 10, title: '10. Why This Method Is Correct', body: whyCorrect },
  ]
}

/**
 * Deterministic NCERT Mathematics Mensuration Solver (Classes 6–10).
 * Solves single-solid, combined-solid, inverse, and unit-conversion questions step by step.
 * Never fabricates numerical answers if dimensions or scope are missing or unsupported.
 */
export function solveNcertMensurationQuestion(rawText, options = {}) {
  const originalText = String(rawText ?? '').trim()
  if (!originalText) {
    return {
      supported: false,
      reasonType: 'empty',
      message: 'Please select an NCERT question or type/paste a mensuration question to solve.',
    }
  }

  // Mask `π = 3.14` / `22/7` so parser doesn't confuse π with a dimension
  const cleanText = originalText
    .replace(/(?:take\s+|use\s+)?(?:π|pi)\s*=\s*(?:22\/7|3\.14\d*)/gi, '')
    .replace(/\bEx\s*\d+(?:\.\d+)?\s*Q?\d*/gi, '')
    .trim()
  const lower = cleanText.toLowerCase()

  // Reject non-mensuration algebra/trigonometry questions honestly
  if (
    /quadratic equation|trigonometr|sin\s*θ|cos\s*θ|tan\s*θ|polynomial|find the roots|arithmetic progression|\ba\.p\./i.test(
      lower,
    ) &&
    !/cube|cuboid|cylinder|cone|sphere|hemisphere|frustum|surface area|volume/.test(lower)
  ) {
    return {
      supported: false,
      reasonType: 'out_of_scope',
      message:
        'Scope Limitation: Teacher Studio specializes in NCERT Mensuration (Surface Areas, Volumes & 3D Nets for Classes 6–10). This question appears to belong to another topic (algebra/trigonometry) and is outside the 3D mensuration solver.',
    }
  }

  const { pi, piLabel } = getPiValue(originalText, options.piMode)
  const wantsLitres = /\blitre|liter|\bl\b/i.test(lower) && /volume|capacity|hold/i.test(lower)
  const wantsLsaOnly =
    /\bcsa\b|\blsa\b|curved surface|lateral surface|inner surface area/i.test(lower) &&
    !/total surface|surface area of a sphere/i.test(lower)
  const wantsVolOnly =
    /volume|capacity/i.test(lower) &&
    !/surface area|\btsa\b|\bcsa\b|\blsa\b/i.test(lower)

  // Special Verified Proof Question: Sphere cut into two hemispheres ratio
  if (
    /sphere/.test(lower) &&
    /hemisphere/.test(lower) &&
    /ratio/.test(lower) &&
    /surface area/.test(lower)
  ) {
    return {
      supported: true,
      topic: 'Sphere & Combined Surface Area',
      primaryShape: SHAPES.SPHERE,
      secondaryShape: SHAPES.HEMISPHERE,
      canvasDimensions: { r: 4 },
      highlightMode: 'tsa',
      piLabel,
      finalNumericValue: null,
      finalUnit: 'ratio',
      finalAnswerDisplay: '2 : 3',
      extractedValues: { r: 'r (arbitrary)' },
      formulaSummary: 'Sphere TSA = 4πr² | 2 × Solid Hemisphere TSA = 2 × 3πr² = 6πr²',
      difficulty: 'easy',
      studentHint: 'Remember that slicing a solid sphere creates two new circular flat bases of area πr² each!',
      commonMistake: 'Writing 4πr² : 2×2πr² = 1 : 1 by forgetting the flat circular cut faces.',
      partsBreakdown: [
        { label: 'Original Solid Sphere', shape: SHAPES.SPHERE, surfaceArea: '4πr²', volume: '(4/3)πr³' },
        { label: 'Two Solid Hemispheres (Total)', shape: SHAPES.HEMISPHERE, surfaceArea: '2 × (2πr² + πr²) = 6πr²', volume: '(4/3)πr³' },
      ],
      steps: buildStepsPayload({
        understand: 'Slicing one solid sphere cleanly along a diameter creates two congruent solid hemispheres, exposing two new circular flat faces.',
        given: 'Let the radius of the original solid sphere be r units (unchanged for both resulting hemispheres).',
        required: 'Ratio of (Surface area of sphere) to (Total surface area of both hemispheres combined).',
        shapeLabel: 'Sphere decomposed into two Solid Hemispheres.',
        formula: 'TSA(Sphere) = 4πr²;  TSA(1 Solid Hemisphere) = 2πr² (CSA) + πr² (flat base) = 3πr².',
        substitution: 'Ratio = 4πr² : (3πr² + 3πr²)',
        calculations: [
          'Combined surface area of 2 hemispheres = 2 × 3πr² = 6πr².',
          'Ratio = (4πr²) / (6πr²).',
          'Cancel common factor πr² ⇒ 4 / 6 = 2 / 3.',
        ],
        unitConversion: 'Ratio is dimensionless (r cancels completely).',
        finalAnswer: 'Required Ratio = 2 : 3',
        whyCorrect: 'Although volume stays conserved when cut, cutting creates two new interior circular faces (total +2πr² = +50% surface area).',
      }),
    }
  }

  // Special NCERT Pattern 1: 2 cubes each of volume V joined end to end
  if (
    (/2\s*cubes|two.*cubes/.test(lower) && /joined/.test(lower)) &&
    (/volume\s*(?:is|of|=)?\s*(\d+(?:\.\d+)?)/i.test(lower) ||
      /side\s*(?:is|of|=)?\s*'?(\d+(?:\.\d+)?)'?/i.test(lower))
  ) {
    const volMatch = lower.match(/volume\s*(?:is|of|=)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i)
    const sideMatch = lower.match(/(?:side|edge)\s*(?:is|of|=)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i)
    const unit = normalizeUnitToken(volMatch?.[2] ?? sideMatch?.[2]) ?? 'cm'
    const givenV = volMatch ? Number(volMatch[1]) : null
    const a = sideMatch ? Number(sideMatch[1]) : givenV ? Math.cbrt(givenV) : null
    if (!a || !Number.isFinite(a) || a <= 0) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: 'Could not extract cube side or volume to solve the joined cubes problem.',
      }
    }
    const l = 2 * a
    const b = a
    const h = a
    const cuboidCalc = calculateShape(SHAPES.CUBOID, {
      l: Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, l)),
      b: Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, b)),
      h: Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, h)),
    })
    const exactTsa = 2 * (l * b + b * h + h * l)
    const exactVol = l * b * h
    void cuboidCalc

    return {
      supported: true,
      topic: 'Combined Solids (Two Cubes → Cuboid)',
      primaryShape: SHAPES.CUBOID,
      secondaryShape: SHAPES.CUBE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CUBOID, { l, b, h }),
      highlightMode: 'tsa',
      piLabel,
      finalNumericValue: Number(exactTsa.toFixed(2)),
      finalUnit: `${unit}²`,
      finalAnswerDisplay: `${fmtCalc(exactTsa)} ${unit}²`,
      extractedValues: {
        ...(givenV ? { volumeEachCube: `${givenV} ${unit}³` } : {}),
        cubeEdge: `${fmtCalc(a)} ${unit}`,
        resultingCuboid: `${fmtCalc(l)} × ${fmtCalc(b)} × ${fmtCalc(h)} ${unit}`,
      },
      formulaSummary: 'a = ∛V;  Cuboid TSA = 2(lb + bh + hl) = 10a²',
      difficulty: 'easy',
      studentHint: 'Joining two cubes doubles only ONE dimension (length = 2a), while breadth and height remain a!',
      commonMistake: 'Doubling single cube TSA (2 × 6a² = 12a²) instead of subtracting the 2 glued faces (leaving 10a²).',
      partsBreakdown: [
        { label: 'Cube 1 & Cube 2 (Individual)', shape: SHAPES.CUBE, surfaceArea: `6 × ${fmtCalc(a)}² = ${fmtCalc(6 * a * a)} ${unit}²`, volume: `${fmtCalc(a * a * a)} ${unit}³` },
        { label: 'Resulting Cuboid (l=2a, b=a, h=a)', shape: SHAPES.CUBOID, surfaceArea: `${fmtCalc(exactTsa)} ${unit}² (2 joined faces subtracted)`, volume: `${fmtCalc(exactVol)} ${unit}³` },
      ],
      steps: buildStepsPayload({
        understand: 'Two identical cubes are glued flat face-to-face end to end, forming a longer cuboid while hiding two interior faces.',
        given: givenV
          ? `Volume of each cube = ${givenV} ${unit}³ (2 cubes joined).`
          : `Side of each cube a = ${fmtCalc(a)} ${unit} (2 cubes joined).`,
        required: `Total surface area of the resulting cuboid (in ${unit}²).`,
        shapeLabel: `Two Cubes joined end to end → Resulting Cuboid (${fmtCalc(l)} × ${fmtCalc(b)} × ${fmtCalc(h)} ${unit}).`,
        formula: 'Cube Volume = a³ ⇒ Cuboid TSA = 2(lb + bh + hl)',
        substitution: `a = ${fmtCalc(a)} ${unit} ⇒ l = 2×${fmtCalc(a)} = ${fmtCalc(l)}, b = ${fmtCalc(b)}, h = ${fmtCalc(h)} ⇒ TSA = 2(${fmtCalc(l)}×${fmtCalc(b)} + ${fmtCalc(b)}×${fmtCalc(h)} + ${fmtCalc(h)}×${fmtCalc(l)})`,
        calculations: [
          givenV ? `Side of cube: a³ = ${givenV} ⇒ a = ∛${givenV} = ${fmtCalc(a)} ${unit}.` : `Cube side a = ${fmtCalc(a)} ${unit}.`,
          `Cuboid dimensions: l = ${fmtCalc(l)} ${unit}, b = ${fmtCalc(b)} ${unit}, h = ${fmtCalc(h)} ${unit}.`,
          `TSA = 2(${fmtCalc(l * b)} + ${fmtCalc(b * h)} + ${fmtCalc(h * l)}) = 2(${fmtCalc(l * b + b * h + h * l)}) = ${fmtCalc(exactTsa)} ${unit}².`,
        ],
        unitConversion: `All dimensions are uniformly in ${unit}; surface area is in ${unit}².`,
        finalAnswer: `Surface area of resulting cuboid = ${fmtCalc(exactTsa)} ${unit}²`,
        whyCorrect: `Each cube has 6 faces (6a² = ${fmtCalc(6 * a * a)}). Gluing two hides 2 faces (12a² − 2a² = 10a² = 10 × ${fmtCalc(a * a)} = ${fmtCalc(exactTsa)} ${unit}²), confirming the cuboid formula.`,
      }),
    }
  }

  // Combined Solid Pattern 2: Hemisphere + Hollow Cylinder Vessel (Total height H + diameter/radius)
  if (
    /hemisphere/.test(lower) &&
    /cylinder/.test(lower) &&
    /total height|entire/.test(lower) &&
    !/capsule|two hemispheres|each of its ends/.test(lower)
  ) {
    const diamM = extractMeasure(lower, [/(?:diameter)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const radM = extractMeasure(lower, [/(?:radius)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const totalHM = extractMeasure(lower, [/(?:total height|entire height)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])

    const unit = diamM?.unit ?? radM?.unit ?? totalHM?.unit ?? 'cm'
    const r = radM ? radM.value : diamM ? diamM.value / 2 : null
    const H = totalHM?.value ?? null
    if (!r || !H || H <= r) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: 'Could not extract hemisphere radius/diameter and total vessel height (and total height must exceed radius).',
      }
    }
    const hCyl = H - r
    const csaCyl = 2 * pi * r * hCyl
    const csaHemi = 2 * pi * r * r
    const totalSa = csaCyl + csaHemi

    return {
      supported: true,
      topic: 'Combined Solids (Hollow Cylinder + Hemisphere)',
      primaryShape: SHAPES.CYLINDER,
      secondaryShape: SHAPES.HEMISPHERE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CYLINDER, { r, h: hCyl }),
      highlightMode: 'lsa',
      piLabel,
      finalNumericValue: Number(totalSa.toFixed(2)),
      finalUnit: `${unit}²`,
      finalAnswerDisplay: `${fmtCalc(totalSa)} ${unit}²`,
      extractedValues: {
        ...(diamM ? { diameter: `${diamM.value} ${unit}` } : {}),
        radius: `${fmtCalc(r)} ${unit}`,
        totalHeight: `${fmtCalc(H)} ${unit}`,
        cylinderHeight: `${fmtCalc(hCyl)} ${unit}`,
      },
      formulaSummary: 'Inner SA = CSA(Cylinder) + CSA(Hemisphere) = 2πrh + 2πr² = 2πr(h + r)',
      difficulty: 'medium',
      studentHint: 'Total height H = cylinder height h + hemisphere radius r, so h = H − r first!',
      commonMistake: 'Using total height H directly as cylinder height h, which double-counts the hemisphere height.',
      partsBreakdown: [
        { label: `Part 1: Hollow Cylinder (r=${fmtCalc(r)}, h=${fmtCalc(hCyl)})`, shape: SHAPES.CYLINDER, surfaceArea: `${fmtCalc(csaCyl)} ${unit}²` },
        { label: `Part 2: Hollow Hemisphere (r=${fmtCalc(r)})`, shape: SHAPES.HEMISPHERE, surfaceArea: `${fmtCalc(csaHemi)} ${unit}²` },
      ],
      steps: buildStepsPayload({
        understand: 'A hollow hemisphere forms the bowl bottom and a hollow cylinder rises vertically from its circular rim.',
        given: `${diamM ? `Diameter d = ${diamM.value} ${unit} ⇒ ` : ''}Radius r = ${fmtCalc(r)} ${unit}; Total height H = ${fmtCalc(H)} ${unit}.`,
        required: `Inner curved surface area of the combined vessel (in ${unit}², π = ${piLabel}).`,
        shapeLabel: 'Combined Solid = Hollow Cylinder surmounted on Hollow Hemisphere.',
        formula: 'h_cyl = H − r;  Total Inner SA = 2πr·h_cyl + 2πr² = 2πr(h_cyl + r)',
        substitution: `h_cyl = ${fmtCalc(H)} − ${fmtCalc(r)} = ${fmtCalc(hCyl)} ${unit};  SA = 2 × (${piLabel}) × ${fmtCalc(r)} × (${fmtCalc(hCyl)} + ${fmtCalc(r)})`,
        calculations: [
          `Cylinder height h_cyl = ${fmtCalc(H)} − ${fmtCalc(r)} = ${fmtCalc(hCyl)} ${unit}.`,
          `Cylinder CSA = 2 × (${piLabel}) × ${fmtCalc(r)} × ${fmtCalc(hCyl)} = ${fmtCalc(csaCyl)} ${unit}².`,
          `Hemisphere CSA = 2 × (${piLabel}) × ${fmtCalc(r)}² = ${fmtCalc(csaHemi)} ${unit}².`,
          `Combined Inner SA = ${fmtCalc(csaCyl)} + ${fmtCalc(csaHemi)} = ${fmtCalc(totalSa)} ${unit}².`,
        ],
        unitConversion: `All dimensions share unit ${unit}; area is in ${unit}².`,
        finalAnswer: `Inner surface area of vessel = ${fmtCalc(totalSa)} ${unit}²`,
        whyCorrect: 'Both curved walls meet cleanly along an open rim with no solid lid or hidden inner barrier, so only the two curved surfaces are exposed.',
      }),
    }
  }

  // Combined Solid Pattern 3: Cone mounted on Hemisphere
  if (/cone/.test(lower) && /hemisphere/.test(lower)) {
    const diamM = extractMeasure(lower, [/(?:diameter)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const radM = extractMeasure(lower, [/(?:radi(?:us|i))[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const totalHM = extractMeasure(lower, [/(?:total height|entire height)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])

    const unit = radM?.unit ?? diamM?.unit ?? totalHM?.unit ?? 'cm'
    const r = radM ? radM.value : diamM ? diamM.value / 2 : /equal to (?:its )?radius|radii.*equal to\s*1/i.test(lower) ? 1 : null
    if (!r) {
      return { supported: false, reasonType: 'missing_values', message: 'Missing radius or diameter for the cone + hemisphere solid.' }
    }

    // Sub-case A: Volume when cone h = r (Ex 12.2 Q1)
    if (wantsVolOnly && (/height of the cone is equal to (?:its )?radius/i.test(lower) || totalHM)) {
      const hCone = totalHM ? totalHM.value - r : r
      if (hCone <= 0) {
        return { supported: false, reasonType: 'missing_values', message: 'Total height must exceed hemisphere radius.' }
      }
      const vConePi = (r * r * hCone) / 3
      const vHemiPi = (2 * r * r * r) / 3
      const vTotalPi = vConePi + vHemiPi
      const numericDecimal = vTotalPi * pi
      const inTermsOfPi = /terms of (?:π|pi)/i.test(lower)

      return {
        supported: true,
        topic: 'Combined Solids (Volume: Cone + Hemisphere)',
        primaryShape: SHAPES.CONE,
        secondaryShape: SHAPES.HEMISPHERE,
        canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CONE, { r, h: hCone }),
        highlightMode: 'volume',
        piLabel,
        finalNumericValue: Number(numericDecimal.toFixed(2)),
        finalUnit: `${unit}³`,
        finalAnswerDisplay: inTermsOfPi ? `${fmtCalc(vTotalPi)}π ${unit}³` : `${fmtCalc(numericDecimal)} ${unit}³`,
        extractedValues: { radius: `${fmtCalc(r)} ${unit}`, coneHeight: `${fmtCalc(hCone)} ${unit}` },
        formulaSummary: 'Total Volume = ⅓πr²h + ⅔πr³',
        difficulty: 'easy',
        studentHint: 'When h = r on a hemisphere of radius r, ⅓πr³ + ⅔πr³ equals 1 complete πr³!',
        commonMistake: 'Using 4/3 πr³ (full sphere) instead of 2/3 πr³ for a hemisphere.',
        partsBreakdown: [
          { label: 'Top Cone', shape: SHAPES.CONE, volume: `${fmtCalc(vConePi)}π ${unit}³` },
          { label: 'Base Hemisphere', shape: SHAPES.HEMISPHERE, volume: `${fmtCalc(vHemiPi)}π ${unit}³` },
        ],
        steps: buildStepsPayload({
          understand: 'A solid cone stands atop a hemisphere of the exact same circular base radius.',
          given: `Radius r = ${fmtCalc(r)} ${unit}; Height of cone h = ${fmtCalc(hCone)} ${unit}.`,
          required: `Total volume of the combined solid${inTermsOfPi ? ' (in terms of π)' : ''}.`,
          shapeLabel: 'Cone + Hemisphere sharing base radius r.',
          formula: 'V_total = V_cone + V_hemisphere = ⅓πr²h + ⅔πr³',
          substitution: `V = ⅓π(${fmtCalc(r)})²(${fmtCalc(hCone)}) + ⅔π(${fmtCalc(r)})³`,
          calculations: [
            `Cone volume = ${fmtCalc(vConePi)}π ${unit}³.`,
            `Hemisphere volume = ${fmtCalc(vHemiPi)}π ${unit}³.`,
            `Total volume = (${fmtCalc(vConePi)} + ${fmtCalc(vHemiPi)})π = ${fmtCalc(vTotalPi)}π ${unit}³ (≈ ${fmtCalc(numericDecimal)} ${unit}³).`,
          ],
          unitConversion: `Volumes sum directly in ${unit}³.`,
          finalAnswer: inTermsOfPi ? `${fmtCalc(vTotalPi)}π ${unit}³` : `${fmtCalc(numericDecimal)} ${unit}³`,
          whyCorrect: 'Volumes of non-overlapping joined solids add unconditionally without any boundary subtraction.',
        }),
      }
    }

    // Sub-case B: Surface Area of Cone on Hemisphere (Toy)
    const H = totalHM?.value ?? null
    if (!H || H <= r) {
      return { supported: false, reasonType: 'missing_values', message: 'Provide total height of the conical toy to compute cone height & slant height.' }
    }
    const hCone = H - r
    const l = Math.hypot(r, hCone)
    const csaCone = pi * r * l
    const csaHemi = 2 * pi * r * r
    const totalSa = csaCone + csaHemi

    return {
      supported: true,
      topic: 'Combined Solids (TSA: Cone on Hemisphere)',
      primaryShape: SHAPES.CONE,
      secondaryShape: SHAPES.HEMISPHERE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CONE, { r, h: hCone }),
      highlightMode: 'tsa',
      piLabel,
      finalNumericValue: Number(totalSa.toFixed(2)),
      finalUnit: `${unit}²`,
      finalAnswerDisplay: `${fmtCalc(totalSa)} ${unit}²`,
      extractedValues: { radius: `${fmtCalc(r)} ${unit}`, totalHeight: `${fmtCalc(H)} ${unit}`, coneHeight: `${fmtCalc(hCone)} ${unit}`, slantHeight: `${fmtCalc(l)} ${unit}` },
      formulaSummary: 'h = H − r,  l = √(r² + h²),  Total SA = πrl + 2πr² = πr(l + 2r)',
      difficulty: 'medium',
      studentHint: 'Subtract radius r from total height H first to get cone height h, then compute slant height l = √(r² + h²).',
      commonMistake: 'Using vertical height h instead of slant height l inside πrl, or including the hidden circular joint face.',
      partsBreakdown: [
        { label: `Cone (r=${fmtCalc(r)}, h=${fmtCalc(hCone)}, l=${fmtCalc(l)})`, shape: SHAPES.CONE, surfaceArea: `${fmtCalc(csaCone)} ${unit}²` },
        { label: `Hemisphere (r=${fmtCalc(r)})`, shape: SHAPES.HEMISPHERE, surfaceArea: `${fmtCalc(csaHemi)} ${unit}²` },
      ],
      steps: buildStepsPayload({
        understand: 'A conical top is mounted flush onto a hemispherical base of equal radius; only exterior curved surfaces are visible.',
        given: `Radius r = ${fmtCalc(r)} ${unit}; Total height H = ${fmtCalc(H)} ${unit}.`,
        required: `Total surface area of the toy (in ${unit}², π = ${piLabel}).`,
        shapeLabel: 'Right Circular Cone + Hemisphere (same radius r).',
        formula: 'h = H − r,  l = √(r² + h²),  TSA = πrl + 2πr²',
        substitution: `h = ${fmtCalc(H)} − ${fmtCalc(r)} = ${fmtCalc(hCone)} ${unit};  l = √(${fmtCalc(r)}² + ${fmtCalc(hCone)}²) = ${fmtCalc(l)} ${unit}`,
        calculations: [
          `Cone height h = ${fmtCalc(H)} − ${fmtCalc(r)} = ${fmtCalc(hCone)} ${unit}.`,
          `Slant height l = √(${fmtCalc(r * r)} + ${fmtCalc(hCone * hCone)}) = √${fmtCalc(r * r + hCone * hCone)} = ${fmtCalc(l)} ${unit}.`,
          `Cone CSA = (${piLabel}) × ${fmtCalc(r)} × ${fmtCalc(l)} = ${fmtCalc(csaCone)} ${unit}².`,
          `Hemisphere CSA = 2 × (${piLabel}) × ${fmtCalc(r)}² = ${fmtCalc(csaHemi)} ${unit}².`,
          `Total Surface Area = ${fmtCalc(csaCone)} + ${fmtCalc(csaHemi)} = ${fmtCalc(totalSa)} ${unit}².`,
        ],
        unitConversion: `All dimensions are in ${unit}; surface area is in ${unit}².`,
        finalAnswer: `Total surface area = ${fmtCalc(totalSa)} ${unit}²`,
        whyCorrect: 'Both flat circular base faces are joined flush inside the solid, so TSA = CSA(Cone) + CSA(Hemisphere).',
      }),
    }
  }

  // Combined Solid Pattern 4: Medicine Capsule (Cylinder + 2 Hemispheres)
  if (/capsule/.test(lower) || (/cylinder/.test(lower) && /two hemispheres/.test(lower))) {
    const diamM = extractMeasure(lower, [/(?:diameter)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const radM = extractMeasure(lower, [/(?:radius)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const lenM = extractMeasure(lower, [/(?:length of the entire|total length|entire.*is)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])

    const unit = lenM?.unit ?? diamM?.unit ?? radM?.unit ?? 'mm'
    const r = radM ? radM.value : diamM ? diamM.value / 2 : null
    const L = lenM?.value ?? null
    if (!r || !L || L <= 2 * r) {
      return { supported: false, reasonType: 'missing_values', message: 'Provide capsule diameter/radius and total length L > 2r.' }
    }
    const hCyl = L - 2 * r
    const cylSa = 2 * pi * r * hCyl
    const endsSa = 4 * pi * r * r
    const totalSa = cylSa + endsSa

    return {
      supported: true,
      topic: 'Combined Solids (Cylinder + Two Hemispheres)',
      primaryShape: SHAPES.CYLINDER,
      secondaryShape: SHAPES.SPHERE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CYLINDER, { r, h: hCyl }),
      highlightMode: 'tsa',
      piLabel,
      finalNumericValue: Number(totalSa.toFixed(2)),
      finalUnit: `${unit}²`,
      finalAnswerDisplay: `${fmtCalc(totalSa)} ${unit}²`,
      extractedValues: { diameter: `${fmtCalc(2 * r)} ${unit}`, radius: `${fmtCalc(r)} ${unit}`, totalLength: `${fmtCalc(L)} ${unit}`, cylinderLength: `${fmtCalc(hCyl)} ${unit}` },
      formulaSummary: 'h_cyl = L − 2r;  SA = 2πr·h_cyl + 2(2πr²) = 2πr(h_cyl + 2r) = 2πrL',
      difficulty: 'medium',
      studentHint: 'Two hemispherical caps take length r on EACH end, leaving cylinder length h_cyl = L − 2r!',
      commonMistake: 'Subtracting only 1 radius instead of 2 radii from total capsule length L.',
      partsBreakdown: [
        { label: `Central Cylinder (r=${fmtCalc(r)}, h=${fmtCalc(hCyl)})`, shape: SHAPES.CYLINDER, surfaceArea: `${fmtCalc(cylSa)} ${unit}²` },
        { label: `Two Hemispheres (= 1 Sphere, r=${fmtCalc(r)})`, shape: SHAPES.SPHERE, surfaceArea: `${fmtCalc(endsSa)} ${unit}²` },
      ],
      steps: buildStepsPayload({
        understand: 'A central open cylinder is capped on both ends by congruent hemispheres of the same radius.',
        given: `Radius r = ${fmtCalc(r)} ${unit}${diamM ? ` (half of diameter ${diamM.value} ${unit})` : ''}; Total capsule length L = ${fmtCalc(L)} ${unit}.`,
        required: `Total outer surface area of the capsule (in ${unit}²).`,
        shapeLabel: 'Cylinder + 2 Hemispheres (forming one Sphere SA).',
        formula: 'h_cyl = L − 2r;  SA = 2πr·h_cyl + 4πr² = 2πr·L',
        substitution: `h_cyl = ${fmtCalc(L)} − 2(${fmtCalc(r)}) = ${fmtCalc(hCyl)} ${unit};  SA = 2×(${piLabel})×${fmtCalc(r)}×${fmtCalc(hCyl)} + 4×(${piLabel})×(${fmtCalc(r)})²`,
        calculations: [
          `Cylinder length h_cyl = ${fmtCalc(L)} − ${fmtCalc(2 * r)} = ${fmtCalc(hCyl)} ${unit}.`,
          `Cylinder curved SA = ${fmtCalc(cylSa)} ${unit}².`,
          `Two hemisphere ends = 1 sphere SA = 4 × (${piLabel}) × ${fmtCalc(r)}² = ${fmtCalc(endsSa)} ${unit}².`,
          `Total SA = ${fmtCalc(cylSa)} + ${fmtCalc(endsSa)} = ${fmtCalc(totalSa)} ${unit}².`,
        ],
        unitConversion: `All dimensions are uniformly in ${unit}; surface area is in ${unit}².`,
        finalAnswer: `Surface area of capsule = ${fmtCalc(totalSa)} ${unit}²`,
        whyCorrect: 'Algebraically 2πr(L − 2r) + 4πr² simplifies identically to 2πrL, giving an instant self-check!',
      }),
    }
  }

  // Largest Cone carved out from a Cube
  if (/largest.*cone|cone.*carved out.*cube/i.test(lower)) {
    const edgeM = extractMeasure(lower, [/(?:edge|side)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    if (!edgeM) {
      return { supported: false, reasonType: 'missing_values', message: 'Provide the cube edge length to calculate the largest inscribed cone volume.' }
    }
    const unit = edgeM.unit ?? 'cm'
    const a = edgeM.value
    const r = a / 2
    const h = a
    const volPi = (r * r * h) / 3
    const volNum = volPi * pi

    return {
      supported: true,
      topic: 'Inscribed Cone in a Cube',
      primaryShape: SHAPES.CONE,
      secondaryShape: SHAPES.CUBE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CONE, { r, h }),
      highlightMode: 'volume',
      piLabel,
      finalNumericValue: Number(volNum.toFixed(2)),
      finalUnit: `${unit}³`,
      finalAnswerDisplay: `${fmtCalc(volNum)} ${unit}³ (${fmtCalc(volPi)}π ${unit}³)`,
      extractedValues: { cubeEdge: `${fmtCalc(a)} ${unit}`, coneRadius: `${fmtCalc(r)} ${unit}`, coneHeight: `${fmtCalc(h)} ${unit}` },
      formulaSummary: 'Max cone fits with diameter d = a (r = a/2) and height h = a;  V = ⅓πr²h',
      difficulty: 'medium',
      studentHint: 'A cone inside an a×a×a cube has base diameter d = a, so radius is a/2!',
      commonMistake: 'Mistaking radius r = a instead of diameter d = a (which gives 4× too large a volume).',
      partsBreakdown: [
        { label: `Enclosing Cube (${fmtCalc(a)}³)`, shape: SHAPES.CUBE, volume: `${fmtCalc(a ** 3)} ${unit}³` },
        { label: `Largest Cone (r=${fmtCalc(r)}, h=${fmtCalc(h)})`, shape: SHAPES.CONE, volume: `${fmtCalc(volNum)} ${unit}³` },
      ],
      steps: buildStepsPayload({
        understand: 'The largest cone inside a cube touches all four edges of the square base (d = a) and reaches the opposite face (h = a).',
        given: `Edge of cube a = ${fmtCalc(a)} ${unit}.`,
        required: `Volume of the largest carved cone (in ${unit}³).`,
        shapeLabel: 'Right Circular Cone inscribed inside a Cube.',
        formula: 'V = ⅓ π r² h  with  r = a / 2  and  h = a',
        substitution: `r = ${fmtCalc(a)} / 2 = ${fmtCalc(r)} ${unit},  h = ${fmtCalc(h)} ${unit} ⇒ V = ⅓ × (${piLabel}) × (${fmtCalc(r)})² × ${fmtCalc(h)}`,
        calculations: [
          `Radius r = ${fmtCalc(r)} ${unit}, height h = ${fmtCalc(h)} ${unit}.`,
          `V = ⅓ × π × ${fmtCalc(r * r)} × ${fmtCalc(h)} = ${fmtCalc(volPi)}π ${unit}³.`,
          `Using π ≈ ${piLabel}: V ≈ ${fmtCalc(volNum)} ${unit}³.`,
        ],
        unitConversion: `All dimensions share unit ${unit}; volume is in ${unit}³.`,
        finalAnswer: `Volume of largest cone = ${fmtCalc(volNum)} ${unit}³ (${fmtCalc(volPi)}π ${unit}³)`,
        whyCorrect: 'Volume occupies (π/12) ≈ 26.2% of the enclosing cube volume.',
      }),
    }
  }

  // General Single-Shape Direct & Inverse Solver
  const { shape } = detectShapeInPrompt(lower, SHAPES.CUBE)

  if (shape === SHAPES.CUBE) {
    const sideM = extractMeasure(lower, [/(?:side|edge|a\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const volM = extractMeasure(lower, [/(?:volume)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const tsaM = extractMeasure(lower, [/(?:total surface area|\btsa\b|surface area)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])

    const unit = sideM?.unit ?? volM?.unit ?? tsaM?.unit ?? 'cm'
    const a = sideM ? sideM.value : volM ? Math.cbrt(volM.value) : tsaM ? Math.sqrt(tsaM.value / 6) : null
    if (!a || !Number.isFinite(a) || a <= 0) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: 'Detected Cube, but no side length, volume, or surface area value could be extracted. Please edit the text to include a measurement (e.g., "side 6 cm").',
      }
    }
    const lsa = 4 * a * a
    const tsa = 6 * a * a
    const vol = a * a * a
    const volLitres = unit === 'm' ? vol * 1000 : unit === 'cm' ? vol / 1000 : vol / 1_000_000

    const primaryAns = wantsLsaOnly
      ? `${fmtCalc(lsa)} ${unit}²`
      : wantsVolOnly
        ? wantsLitres
          ? `${fmtCalc(volLitres)} litres`
          : `${fmtCalc(vol)} ${unit}³`
        : `${fmtCalc(tsa)} ${unit}² (Volume = ${fmtCalc(vol)} ${unit}³)`

    return {
      supported: true,
      topic: 'Cube Surface Area & Volume',
      primaryShape: SHAPES.CUBE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CUBE, { a }),
      highlightMode: wantsLsaOnly ? 'lsa' : wantsVolOnly ? 'volume' : 'tsa',
      piLabel,
      finalNumericValue: Number((wantsLsaOnly ? lsa : wantsVolOnly ? (wantsLitres ? volLitres : vol) : tsa).toFixed(2)),
      finalUnit: wantsVolOnly ? (wantsLitres ? 'litres' : `${unit}³`) : `${unit}²`,
      finalAnswerDisplay: primaryAns,
      extractedValues: { edge: `${fmtCalc(a)} ${unit}` },
      formulaSummary: 'LSA = 4a²,  TSA = 6a²,  Volume = a³',
      difficulty: 'easy',
      studentHint: 'Unfold a cube in 3D to count its 6 identical squares of area a² each.',
      commonMistake: 'Confusing perimeter 12a or lateral area 4a² with total surface area 6a².',
      steps: buildStepsPayload({
        understand: 'A cube has 6 congruent square faces each of equal edge length a.',
        given: `Cube edge a = ${fmtCalc(a)} ${unit}.`,
        required: wantsVolOnly ? 'Volume of the cube.' : 'Surface Area and Volume of the cube.',
        shapeLabel: 'Cube (6 equal square faces).',
        formula: 'LSA = 4a² | TSA = 6a² | Volume = a³',
        substitution: `LSA = 4×(${fmtCalc(a)})²,  TSA = 6×(${fmtCalc(a)})²,  V = (${fmtCalc(a)})³`,
        calculations: [
          `One square face area = ${fmtCalc(a)}² = ${fmtCalc(a * a)} ${unit}².`,
          `LSA (4 walls) = 4 × ${fmtCalc(a * a)} = ${fmtCalc(lsa)} ${unit}².`,
          `TSA (6 faces) = 6 × ${fmtCalc(a * a)} = ${fmtCalc(tsa)} ${unit}².`,
          `Volume = ${fmtCalc(a)}³ = ${fmtCalc(vol)} ${unit}³.`,
        ],
        unitConversion: wantsLitres ? `1000 cm³ = 1 litre; 1 m³ = 1000 litres ⇒ Volume ≈ ${fmtCalc(volLitres)} L.` : `Units are consistent in ${unit}.`,
        finalAnswer: primaryAns,
        whyCorrect: 'Each square net panel of side a contributes a², summing cleanly to 6a² across the unfolded 6-square net.',
      }),
    }
  }

  if (shape === SHAPES.CUBOID) {
    const tripleM = cleanText.match(
      /(\d+(?:\.\d+)?)\s*(mm|cm|m)?\s*[×xX*]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?\s*[×xX*]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/,
    )
    let lenM = extractMeasure(lower, [/(?:length|long)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    let brdM = extractMeasure(lower, [/(?:breadth|width|wide)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    let hgtM = extractMeasure(lower, [/(?:height|high|deep|depth)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    if (tripleM && (!lenM || !brdM || !hgtM)) {
      const commonU = normalizeUnitToken(tripleM[6] ?? tripleM[4] ?? tripleM[2])
      lenM = { value: Number(tripleM[1]), unit: normalizeUnitToken(tripleM[2]) ?? commonU }
      brdM = { value: Number(tripleM[3]), unit: normalizeUnitToken(tripleM[4]) ?? commonU }
      hgtM = { value: Number(tripleM[5]), unit: normalizeUnitToken(tripleM[6]) ?? commonU }
    }
    if (!lenM || !brdM || !hgtM) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: 'Detected Cuboid, please include length, breadth/width, and height (e.g., "length 2 m, breadth 1.5 m, height 100 cm").',
      }
    }
    const { baseUnit, hasMixedUnits } = resolveCommonLengthUnit([lenM, brdM, hgtM])
    const cL = convertMeasureToUnit(lenM, baseUnit)
    const cB = convertMeasureToUnit(brdM, baseUnit)
    const cH = convertMeasureToUnit(hgtM, baseUnit)
    const l = cL.value
    const b = cB.value
    const h = cH.value
    const lsa = 2 * (l + b) * h
    const tsa = 2 * (l * b + b * h + h * l)
    const vol = l * b * h
    const volLitres = baseUnit === 'm' ? vol * 1000 : baseUnit === 'cm' ? vol / 1000 : vol / 1_000_000

    const primaryVal = wantsLitres ? volLitres : wantsLsaOnly ? lsa : wantsVolOnly ? vol : tsa
    const primaryUnit = wantsLitres ? 'litres' : wantsVolOnly ? `${baseUnit}³` : `${baseUnit}²`
    const primaryDisplay = `${fmtCalc(primaryVal)} ${primaryUnit}`

    return {
      supported: true,
      topic: hasMixedUnits || wantsLitres ? 'Cuboid & Unit Conversion' : 'Cuboid Mensuration',
      primaryShape: SHAPES.CUBOID,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CUBOID, { l, b, h }),
      highlightMode: wantsLsaOnly ? 'lsa' : wantsVolOnly || wantsLitres ? 'volume' : 'tsa',
      piLabel,
      finalNumericValue: Number(primaryVal.toFixed(2)),
      finalUnit: primaryUnit,
      finalAnswerDisplay: primaryDisplay,
      extractedValues: {
        length: `${fmtCalc(l)} ${baseUnit}`,
        breadth: `${fmtCalc(b)} ${baseUnit}`,
        height: `${fmtCalc(h)} ${baseUnit}`,
      },
      formulaSummary: 'LSA = 2(l + b)h,  TSA = 2(lb + bh + hl),  Volume = l × b × h',
      difficulty: hasMixedUnits || wantsLitres ? 'medium' : 'easy',
      studentHint: 'Always convert l, b, and h into the SAME unit before multiplying!',
      commonMistake: 'Multiplying meters and centimeters directly (e.g., 2 m × 100 cm without converting 100 cm → 1 m).',
      steps: buildStepsPayload({
        understand: 'A cuboid consists of 3 pairs of congruent opposite rectangles.',
        given: `l = ${lenM.value} ${lenM.unit ?? baseUnit}, b = ${brdM.value} ${brdM.unit ?? baseUnit}, h = ${hgtM.value} ${hgtM.unit ?? baseUnit}.`,
        required: wantsLitres ? 'Capacity in litres (and volume).' : wantsLsaOnly ? 'Lateral Surface Area (4 walls).' : wantsVolOnly ? 'Volume of cuboid.' : 'Total Surface Area (and Volume).',
        shapeLabel: 'Rectangular Cuboid (6 rectangular faces).',
        formula: wantsLitres || wantsVolOnly ? 'Volume = l × b × h  (1000 cm³ = 1 litre, 1 m³ = 1000 litres)' : 'LSA = 2(l+b)h | TSA = 2(lb + bh + hl)',
        substitution: `Converted in ${baseUnit}: l=${fmtCalc(l)}, b=${fmtCalc(b)}, h=${fmtCalc(h)}.`,
        calculations: [
          `Volume = ${fmtCalc(l)} × ${fmtCalc(b)} × ${fmtCalc(h)} = ${fmtCalc(vol)} ${baseUnit}³.`,
          `LSA (4 walls) = 2(${fmtCalc(l)} + ${fmtCalc(b)}) × ${fmtCalc(h)} = ${fmtCalc(lsa)} ${baseUnit}².`,
          `TSA (6 faces) = 2(${fmtCalc(l * b)} + ${fmtCalc(b * h)} + ${fmtCalc(h * l)}) = ${fmtCalc(tsa)} ${baseUnit}².`,
          ...(wantsLitres ? [`In litres: ${fmtCalc(vol)} ${baseUnit}³ = ${fmtCalc(volLitres)} litres.`] : []),
        ],
        unitConversion: [cL, cB, cH].some((c) => c.converted)
          ? [cL, cB, cH].filter((c) => c.converted).map((c) => `${c.originalValue} ${c.originalUnit} = ${fmtCalc(c.value)} ${baseUnit}`).join('; ')
          : `All lengths uniformly in ${baseUnit}.${wantsLitres ? ' 1000 cm³ = 1 litre.' : ''}`,
        finalAnswer: primaryDisplay,
        whyCorrect: 'Unfolding the cuboid net reveals two bases (lb), front/back (lh), and left/right (bh) summing exactly to TSA.',
      }),
    }
  }

  if (shape === SHAPES.CYLINDER) {
    const radM = extractMeasure(lower, [/(?:radius|r\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const diamM = extractMeasure(lower, [/(?:diameter|d\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const hgtM = extractMeasure(lower, [/(?:height|high|length|tall|deep|depth)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const csaGiven = extractMeasure(lower, [
      /(?:curved surface area|\bcsa\b|\blsa\b).*?\bis\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?(?:²|\^2)?/i,
      /(\d+(?:\.\d+)?)\s*(mm|cm|m)\s*(?:²|\^2)/i,
      /(?:curved surface area|\bcsa\b|\blsa\b)\s*(?:=|of)\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i,
    ])
    const volGiven = extractMeasure(lower, [
      /(?:volume|capacity).*?\bis\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?(?:³|\^3)?/i,
      /(\d+(?:\.\d+)?)\s*(mm|cm|m)\s*(?:³|\^3)/i,
      /(?:volume|capacity)\s*(?:=|of)\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i,
    ])

    // Inverse Cylinder: Given CSA & height -> solve for radius r (e.g. Class 10 Q5)
    if (csaGiven && hgtM && !radM && !diamM) {
      const unit = hgtM.unit ?? csaGiven.unit ?? 'cm'
      const r = csaGiven.value / (2 * pi * hgtM.value)
      return {
        supported: true,
        topic: 'Inverse Cylinder (Find Radius from CSA)',
        primaryShape: SHAPES.CYLINDER,
        canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CYLINDER, { r, h: hgtM.value }),
        highlightMode: 'lsa',
        piLabel,
        finalNumericValue: Number(r.toFixed(2)),
        finalUnit: unit,
        finalAnswerDisplay: `r = ${fmtCalc(r)} ${unit}`,
        extractedValues: { csa: `${csaGiven.value} ${unit}²`, height: `${hgtM.value} ${unit}`, radiusSolved: `${fmtCalc(r)} ${unit}` },
        formulaSummary: 'CSA = 2πrh ⇒ r = CSA / (2πh)',
        difficulty: 'medium',
        studentHint: 'Isolate r by dividing CSA by 2πh!',
        commonMistake: 'Forgetting the factor of 2 in 2πrh (returning diameter instead of radius).',
        steps: buildStepsPayload({
          understand: 'We know the curved wall area (the rectangle in the cylinder net) and height h, and work backward to find radius r.',
          given: `CSA = ${csaGiven.value} ${unit}², height h = ${hgtM.value} ${unit}, π = ${piLabel}.`,
          required: `Base radius r (in ${unit}).`,
          shapeLabel: 'Right Circular Cylinder (unfolds curved wall into a rectangle of width 2πr and height h).',
          formula: 'CSA = 2πrh ⇒ r = CSA / (2πh)',
          substitution: `${csaGiven.value} = 2 × ${piLabel} × r × ${hgtM.value}`,
          calculations: [
            `2 × ${piLabel} × ${hgtM.value} = ${fmtCalc(2 * pi * hgtM.value, 4)}.`,
            `r = ${csaGiven.value} / ${fmtCalc(2 * pi * hgtM.value, 4)} = ${fmtCalc(r)} ${unit}.`,
          ],
          unitConversion: `CSA in ${unit}² divided by h in ${unit} yields radius cleanly in ${unit}.`,
          finalAnswer: `Radius r = ${fmtCalc(r)} ${unit}`,
          whyCorrect: `Substituting back: 2 × ${piLabel} × ${fmtCalc(r)} × ${hgtM.value} = ${fmtCalc(2 * pi * r * hgtM.value)} ${unit}², matching the given CSA.`,
        }),
      }
    }

    // Inverse Cylinder: Given Volume & height -> solve for radius r
    if (volGiven && hgtM && !radM && !diamM) {
      const unit = hgtM.unit ?? volGiven.unit ?? 'cm'
      const r = Math.sqrt(volGiven.value / (pi * hgtM.value))
      return {
        supported: true,
        topic: 'Inverse Cylinder (Find Radius from Volume)',
        primaryShape: SHAPES.CYLINDER,
        canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CYLINDER, { r, h: hgtM.value }),
        highlightMode: 'volume',
        piLabel,
        finalNumericValue: Number(r.toFixed(2)),
        finalUnit: unit,
        finalAnswerDisplay: `r = ${fmtCalc(r)} ${unit}`,
        extractedValues: { volume: `${volGiven.value} ${unit}³`, height: `${hgtM.value} ${unit}`, radiusSolved: `${fmtCalc(r)} ${unit}` },
        formulaSummary: 'V = πr²h ⇒ r = √(V / (πh))',
        difficulty: 'medium',
        studentHint: 'Divide Volume by πh first, then take the square root to get r!',
        commonMistake: 'Forgetting to take the square root of r².',
        steps: buildStepsPayload({
          understand: 'Given cylinder volume and height, reverse the volume formula πr²h to isolate base radius r.',
          given: `Volume V = ${volGiven.value} ${unit}³, height h = ${hgtM.value} ${unit}, π = ${piLabel}.`,
          required: `Base radius r (in ${unit}).`,
          shapeLabel: 'Right Circular Cylinder.',
          formula: 'V = πr²h ⇒ r² = V / (πh)',
          substitution: `${volGiven.value} = (${piLabel}) × r² × ${hgtM.value}`,
          calculations: [
            `r² = ${volGiven.value} / (${piLabel} × ${hgtM.value}) = ${fmtCalc(r * r, 4)}.`,
            `r = √${fmtCalc(r * r, 4)} = ${fmtCalc(r)} ${unit}.`,
          ],
          unitConversion: `Volume in ${unit}³ divided by height in ${unit} yields r² in ${unit}².`,
          finalAnswer: `Radius r = ${fmtCalc(r)} ${unit}`,
          whyCorrect: `Check: (${piLabel}) × (${fmtCalc(r)})² × ${hgtM.value} ≈ ${fmtCalc(pi * r * r * hgtM.value)} ${unit}³.`,
        }),
      }
    }

    const effectiveR = radM ?? (diamM ? { value: diamM.value / 2, unit: diamM.unit } : null)
    if (!effectiveR || !hgtM) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: 'Detected Cylinder, please provide both radius (or diameter) and height (or CSA + height).',
      }
    }
    const { baseUnit, hasMixedUnits } = resolveCommonLengthUnit([effectiveR, hgtM])
    const cR = convertMeasureToUnit(effectiveR, baseUnit)
    const cH = convertMeasureToUnit(hgtM, baseUnit)
    const r = cR.value
    const h = cH.value
    const csa = 2 * pi * r * h
    const tsa = 2 * pi * r * (r + h)
    const vol = pi * r * r * h
    const volLitres = baseUnit === 'm' ? vol * 1000 : baseUnit === 'cm' ? vol / 1000 : vol / 1_000_000

    const primaryVal = wantsLitres ? volLitres : wantsLsaOnly ? csa : wantsVolOnly ? vol : tsa
    const primaryUnit = wantsLitres ? 'litres' : wantsVolOnly ? `${baseUnit}³` : `${baseUnit}²`

    return {
      supported: true,
      topic: hasMixedUnits || wantsLitres ? 'Cylinder & Unit Conversion' : 'Cylinder Surface Area & Volume',
      primaryShape: SHAPES.CYLINDER,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CYLINDER, { r, h }),
      highlightMode: wantsLsaOnly ? 'lsa' : wantsVolOnly || wantsLitres ? 'volume' : 'tsa',
      piLabel,
      finalNumericValue: Number(primaryVal.toFixed(2)),
      finalUnit: primaryUnit,
      finalAnswerDisplay: `${fmtCalc(primaryVal)} ${primaryUnit}`,
      extractedValues: { radius: `${fmtCalc(r)} ${baseUnit}`, height: `${fmtCalc(h)} ${baseUnit}` },
      formulaSummary: 'CSA = 2πrh,  TSA = 2πr(r + h),  Volume = πr²h',
      difficulty: 'easy',
      studentHint: 'Drag the Net Fold slider on the 3D cylinder to see its curved wall unroll into a 2πr × h rectangle!',
      commonMistake: diamM ? 'Using diameter directly instead of dividing by 2 for radius.' : 'Confusing CSA 2πrh with TSA 2πr(r+h).',
      steps: buildStepsPayload({
        understand: 'A cylinder consists of a curved lateral tube of height h and two circular bases of radius r.',
        given: `${diamM ? `Diameter d = ${diamM.value} ${diamM.unit ?? baseUnit} ⇒ ` : ''}Radius r = ${fmtCalc(r)} ${baseUnit}, Height h = ${fmtCalc(h)} ${baseUnit}.`,
        required: wantsLsaOnly ? 'Curved Surface Area (CSA).' : wantsVolOnly || wantsLitres ? 'Volume / Capacity of cylinder.' : 'Total Surface Area (and Volume).',
        shapeLabel: 'Right Circular Cylinder (rectangle 2πr × h + two circles πr²).',
        formula: 'CSA = 2πrh | TSA = 2πr(r + h) | Volume = πr²h',
        substitution: `π = ${piLabel}, r = ${fmtCalc(r)} ${baseUnit}, h = ${fmtCalc(h)} ${baseUnit}.`,
        calculations: [
          `CSA = 2 × (${piLabel}) × ${fmtCalc(r)} × ${fmtCalc(h)} = ${fmtCalc(csa)} ${baseUnit}².`,
          `Two circular ends = 2 × (${piLabel}) × ${fmtCalc(r)}² = ${fmtCalc(2 * pi * r * r)} ${baseUnit}².`,
          `TSA = ${fmtCalc(csa)} + ${fmtCalc(2 * pi * r * r)} = ${fmtCalc(tsa)} ${baseUnit}².`,
          `Volume = (${piLabel}) × ${fmtCalc(r)}² × ${fmtCalc(h)} = ${fmtCalc(vol)} ${baseUnit}³.`,
        ],
        unitConversion: wantsLitres ? `1000 cm³ = 1 L; 1 m³ = 1000 L ⇒ Capacity = ${fmtCalc(volLitres)} litres.` : `Lengths uniformly in ${baseUnit}.`,
        finalAnswer: `${fmtCalc(primaryVal)} ${primaryUnit}`,
        whyCorrect: 'Unfolding the cylinder shows circumference 2πr forms the rectangle width, directly yielding CSA = 2πrh.',
      }),
    }
  }

  if (shape === SHAPES.CONE) {
    const radM = extractMeasure(lower, [/(?:radius|r\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const diamM = extractMeasure(lower, [/(?:diameter|d\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const slantM = extractMeasure(lower, [/(?:slant height|l\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const hgtM = extractMeasure(lower, [/(?<!slant\s)(?:height|tall|deep|depth|h\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const volGiven = extractMeasure(lower, [/(?:volume)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])

    const effectiveR = radM ?? (diamM ? { value: diamM.value / 2, unit: diamM.unit } : null)
    let unit = effectiveR?.unit ?? hgtM?.unit ?? slantM?.unit ?? 'cm'
    let r = effectiveR?.value ?? null
    let h = hgtM?.value ?? null
    let l = slantM?.value ?? null

    // Inverse Cone: Volume & h -> find r -> then CSA/TSA
    if (volGiven && h && !r) {
      r = Math.sqrt((3 * volGiven.value) / (pi * h))
    }
    if (!r || (!h && !l)) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: 'Detected Cone, please include radius (or diameter) and either vertical height or slant height.',
      }
    }
    if (!l && h) l = Math.hypot(r, h)
    if (!h && l) {
      if (l <= r) {
        return { supported: false, reasonType: 'invalid_geometry', message: 'Invalid cone geometry: slant height l must be strictly greater than radius r.' }
      }
      h = Math.sqrt(l * l - r * r)
    }

    const csa = pi * r * l
    const tsa = pi * r * (r + l)
    const vol = (pi * r * r * h) / 3
    const primaryVal = wantsLsaOnly ? csa : wantsVolOnly ? vol : tsa
    const primaryUnit = wantsVolOnly ? `${unit}³` : `${unit}²`

    return {
      supported: true,
      topic: 'Cone (r, h, l & Surface Area / Volume)',
      primaryShape: SHAPES.CONE,
      canvasDimensions: normalizeDimsForCanvas3D(SHAPES.CONE, { r, h }),
      highlightMode: wantsLsaOnly ? 'lsa' : wantsVolOnly ? 'volume' : 'tsa',
      piLabel,
      finalNumericValue: Number(primaryVal.toFixed(2)),
      finalUnit: primaryUnit,
      finalAnswerDisplay: `${fmtCalc(primaryVal)} ${primaryUnit}`,
      extractedValues: {
        ...(diamM ? { diameter: `${diamM.value} ${unit}` } : {}),
        radius: `${fmtCalc(r)} ${unit}`,
        verticalHeight: `${fmtCalc(h)} ${unit}`,
        slantHeight: `${fmtCalc(l)} ${unit}`,
      },
      formulaSummary: 'l² = r² + h²,  CSA = πrl,  TSA = πr(r + l),  Volume = ⅓πr²h',
      difficulty: 'medium',
      studentHint: 'Always use slant height l = √(r² + h²) for Curved Surface Area (πrl), and vertical height h for Volume (⅓πr²h).',
      commonMistake: 'Using vertical height h inside CSA = πrl instead of slant height l.',
      steps: buildStepsPayload({
        understand: 'A right circular cone connects a circular base of radius r to an apex through vertical height h and sloped slant height l.',
        given: `${diamM ? `Diameter d = ${diamM.value} ${unit} ⇒ ` : ''}r = ${fmtCalc(r)} ${unit}${hgtM ? `, h = ${fmtCalc(h)} ${unit}` : ''}${slantM ? `, l = ${fmtCalc(l)} ${unit}` : ''}.`,
        required: wantsLsaOnly ? 'Curved Surface Area (CSA = πrl).' : wantsVolOnly ? 'Volume (⅓πr²h).' : 'Total Surface Area & Volume.',
        shapeLabel: 'Right Circular Cone (circular sector net of radius l + base circle r).',
        formula: 'l = √(r² + h²),  CSA = πrl,  TSA = πr(r + l),  V = ⅓πr²h',
        substitution: `π = ${piLabel}, r = ${fmtCalc(r)}, h = ${fmtCalc(h)}, l = ${fmtCalc(l)}.`,
        calculations: [
          `Right-triangle relation gives l = ${fmtCalc(l)} ${unit} and h = ${fmtCalc(h)} ${unit}.`,
          `CSA = (${piLabel}) × ${fmtCalc(r)} × ${fmtCalc(l)} = ${fmtCalc(csa)} ${unit}².`,
          `TSA = ${fmtCalc(csa)} + (${piLabel}) × ${fmtCalc(r)}² = ${fmtCalc(tsa)} ${unit}².`,
          `Volume = ⅓ × (${piLabel}) × ${fmtCalc(r)}² × ${fmtCalc(h)} = ${fmtCalc(vol)} ${unit}³.`,
        ],
        unitConversion: `All dimensions in ${unit}.`,
        finalAnswer: `${fmtCalc(primaryVal)} ${primaryUnit}`,
        whyCorrect: 'Unfolding the cone surface forms a circular sector of arc length 2πr and sector radius l, giving sector area ½(2πr)l = πrl.',
      }),
    }
  }

  if (shape === SHAPES.SPHERE || shape === SHAPES.HEMISPHERE) {
    const isHemi = shape === SHAPES.HEMISPHERE
    const radM = extractMeasure(lower, [/(?:radius|r\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const diamM = extractMeasure(lower, [/(?:diameter|d\s*=)[^0-9]*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i])
    const effectiveR = radM ?? (diamM ? { value: diamM.value / 2, unit: diamM.unit } : null)
    const unit = effectiveR?.unit ?? 'cm'
    if (!effectiveR) {
      return {
        supported: false,
        reasonType: 'missing_values',
        message: `Detected ${isHemi ? 'Hemisphere' : 'Sphere'}, please provide a radius or diameter.`,
      }
    }
    const r = effectiveR.value
    const csa = isHemi ? 2 * pi * r * r : 4 * pi * r * r
    const tsa = isHemi ? 3 * pi * r * r : 4 * pi * r * r
    const vol = isHemi ? (2 / 3) * pi * r ** 3 : (4 / 3) * pi * r ** 3
    const primaryVal = wantsLsaOnly ? csa : wantsVolOnly ? vol : tsa
    const primaryUnit = wantsVolOnly ? `${unit}³` : `${unit}²`

    return {
      supported: true,
      topic: `${isHemi ? 'Hemisphere' : 'Sphere'} Surface Area & Volume`,
      primaryShape: shape,
      canvasDimensions: normalizeDimsForCanvas3D(shape, { r }),
      highlightMode: wantsLsaOnly ? 'lsa' : wantsVolOnly ? 'volume' : 'tsa',
      piLabel,
      finalNumericValue: Number(primaryVal.toFixed(2)),
      finalUnit: primaryUnit,
      finalAnswerDisplay: `${fmtCalc(primaryVal)} ${primaryUnit}`,
      extractedValues: { ...(diamM ? { diameter: `${diamM.value} ${unit}` } : {}), radius: `${fmtCalc(r)} ${unit}` },
      formulaSummary: isHemi
        ? 'Hemisphere CSA = 2πr², TSA = 3πr², V = ⅔πr³'
        : 'Sphere SA = 4πr², V = (4/3)πr³',
      difficulty: 'easy',
      studentHint: isHemi ? 'Distinguish CSA (2πr², curved bowl only) vs solid TSA (3πr², curved + flat top circle)!' : 'Use r = diameter / 2 carefully before squaring or cubing.',
      commonMistake: isHemi ? 'Forgetting the +πr² flat circular top on a solid hemisphere TSA (3πr²).' : 'Forgetting the 4/3 vs 4 difference between Volume and Surface Area.',
      steps: buildStepsPayload({
        understand: isHemi ? 'A hemisphere is half a sphere, optionally capped by one flat circle of radius r.' : 'A sphere has zero flat edges and a single uniform surface defined solely by radius r.',
        given: `${diamM ? `Diameter d = ${diamM.value} ${unit} ⇒ ` : ''}Radius r = ${fmtCalc(r)} ${unit}, π = ${piLabel}.`,
        required: wantsLsaOnly ? 'Curved Surface Area.' : wantsVolOnly ? 'Volume.' : 'Surface Area (and Volume).',
        shapeLabel: isHemi ? 'Hemisphere (no flat unfoldable net).' : 'Sphere (no flat unfoldable net).',
        formula: isHemi ? 'CSA = 2πr² | TSA = 3πr² | V = ⅔πr³' : 'SA = 4πr² | V = (4/3)πr³',
        substitution: `π = ${piLabel}, r = ${fmtCalc(r)} ${unit}.`,
        calculations: [
          `r² = ${fmtCalc(r * r)} ${unit}²,  r³ = ${fmtCalc(r ** 3)} ${unit}³.`,
          ...(isHemi ? [`CSA = 2πr² = ${fmtCalc(csa)} ${unit}².`, `Solid TSA = 3πr² = ${fmtCalc(tsa)} ${unit}².`, `Volume = ⅔πr³ = ${fmtCalc(vol)} ${unit}³.`] : [`Surface Area = 4πr² = ${fmtCalc(tsa)} ${unit}².`, `Volume = (4/3)πr³ = ${fmtCalc(vol)} ${unit}³.`]),
        ],
        unitConversion: `Radius in ${unit} gives area in ${unit}² and volume in ${unit}³.`,
        finalAnswer: `${fmtCalc(primaryVal)} ${primaryUnit}`,
        whyCorrect: 'Double-check dimensional exponents: Area uses r² while Volume uses r³.',
      }),
    }
  }

  return {
    supported: false,
    reasonType: 'unsupported_shape_or_phrase',
    message:
      'Could not reliably parse exact mensuration shape & dimensions from this phrasing. Specify clearly (e.g. "Cylinder of radius 7 cm and height 10 cm" or "2 cubes of volume 64 cm³ joined end to end") rather than guessing an answer.',
  }
}

/**
 * Generates mathematically verified Similar NCERT-Level Practice Questions from a solved question.
 */
export function generateSimilarNcertQuestions(solved, difficulty = 'medium', count = 3) {
  if (!solved?.supported) return []
  const scaleMult = difficulty === 'easy' ? 1 : difficulty === 'advanced' ? 2 : 1.5
  const shape = solved.primaryShape
  const out = []

  const presetsByShape = {
    [SHAPES.CYLINDER]: [
      { r: 7, h: 10, desc: 'cylinder of radius 7 cm and height 10 cm (π = 22/7)', qMetric: 'curved surface area', ans: 440, u: 'cm²', f: '2πrh' },
      { r: 3.5 * scaleMult, h: 8, desc: `cylinder of radius ${fmtCalc(3.5 * scaleMult)} cm and height 8 cm (π = 22/7)`, qMetric: 'volume', ans: Number(((22 / 7) * (3.5 * scaleMult) ** 2 * 8).toFixed(2)), u: 'cm³', f: 'πr²h' },
      { r: 7, h: 15, desc: 'closed cylindrical tank of radius 7 cm and height 15 cm (π = 22/7)', qMetric: 'total surface area', ans: 968, u: 'cm²', f: '2πr(r + h)' },
    ],
    [SHAPES.CONE]: [
      { r: 7, h: 24, desc: 'right circular cone of radius 7 cm and height 24 cm (π = 22/7)', qMetric: 'curved surface area', ans: 550, u: 'cm²', f: 'l=25 ⇒ πrl' },
      { r: 7, h: 24, desc: 'cone of diameter 14 cm and vertical height 24 cm (π = 22/7)', qMetric: 'volume', ans: 1232, u: 'cm³', f: '⅓πr²h' },
      { r: 3.5, h: 12, desc: 'conical cap of radius 3.5 cm and height 12 cm (π = 22/7)', qMetric: 'total surface area', ans: 176, u: 'cm²', f: 'l=12.5 ⇒ πr(r + l)' },
    ],
    [SHAPES.CUBOID]: [
      { desc: 'cuboid formed by joining two cubes of edge 5 cm end to end', qMetric: 'total surface area', ans: 250, u: 'cm²', f: '10a² = 10 × 25' },
      { desc: 'cuboid box of dimensions 10 cm × 6 cm × 4 cm', qMetric: 'total surface area', ans: 248, u: 'cm²', f: '2(lb + bh + hl)' },
      { desc: 'water tank of length 2 m, breadth 1.5 m and depth 200 cm', qMetric: 'capacity in litres', ans: 6000, u: 'litres', f: 'V(m³) × 1000' },
    ],
    [SHAPES.SPHERE]: [
      { desc: 'solid sphere of diameter 14 cm (π = 22/7)', qMetric: 'surface area', ans: 616, u: 'cm²', f: '4πr² (r = 7)' },
      { desc: 'hemispherical dome of radius 7 m (π = 22/7)', qMetric: 'curved surface area', ans: 308, u: 'm²', f: '2πr²' },
      { desc: 'solid hemisphere of radius 7 cm (π = 22/7)', qMetric: 'total surface area', ans: 462, u: 'cm²', f: '3πr²' },
    ],
  }

  const pool = presetsByShape[shape] ?? presetsByShape[SHAPES.CUBOID]
  pool.slice(0, count).forEach((item, idx) => {
    const d1 = Number((item.ans * 0.5).toFixed(2))
    const d2 = Number((item.ans * 1.25).toFixed(2))
    const d3 = Number((item.ans + 44).toFixed(2))
    const opts = [`${fmtCalc(item.ans)} ${item.u}`, `${fmtCalc(d1)} ${item.u}`, `${fmtCalc(d2)} ${item.u}`, `${fmtCalc(d3)} ${item.u}`]
    const rot = idx % 4
    const correctOpt = opts[0]
    const distractors = opts.slice(1)
    distractors.splice(rot, 0, correctOpt)

    out.push({
      id: `ncert_sim_${shape}_${difficulty}_${idx}`,
      authenticity: 'similar_practice_generated',
      topic: shape,
      difficulty,
      question: `Similar Practice (${difficulty}): Find the ${item.qMetric} of a ${item.desc}.`,
      options: distractors,
      correctIndex: rot,
      formulaUsed: item.f,
      explanation: `Formula: ${item.f} ⇒ Correct answer is ${correctOpt}.`,
    })
  })

  return out
}

/**
 * Answers common classroom queries inside "Ask the Teacher Studio"
 * strictly grounded in local deterministic rules (never pretends a cloud LLM is connected).
 */
export function askTeacherStudioAssistant(rawQuery, { solved, language = 'en' } = {}) {
  const query = String(rawQuery ?? '').trim()
  const lower = query.toLowerCase()
  const conn = getTutorConnectionStatus()
  const activeShape = solved?.primaryShape ?? SHAPES.CYLINDER
  const kannadaDict = TRANSLATIONS.kn
  const targetLangDict = TRANSLATIONS[language] ?? TRANSLATIONS.en

  const modeLabel = conn.hasLiveEndpoint
    ? `Backend Endpoint (${conn.endpoint})`
    : 'Local Deterministic Teacher Engine (No Live Cloud LLM)'

  if (!query) {
    return { modeLabel, answer: 'Ask a question such as "Why do we use CSA instead of TSA?" or "Explain this shape in Kannada".', actionQuestion: null }
  }

  if (/kannada|ಕನ್ನಡ/.test(lower) || /tamil|telugu|hindi/.test(lower)) {
    const langCode = /kannada|ಕನ್ನಡ/.test(lower) ? 'kn' : /tamil/.test(lower) ? 'ta' : /telugu/.test(lower) ? 'te' : 'hi'
    const lDict = TRANSLATIONS[langCode] ?? kannadaDict
    const sName = lDict.shapes?.[activeShape] ?? activeShape
    const learn = lDict.learningByShape?.[activeShape]
    return {
      modeLabel,
      answer: `${sName}: ${learn?.meaning ?? ''} ${learn?.example ? `(${learn.example})` : ''}`.trim(),
      speakText: `${sName}. ${learn?.meaning ?? ''}`,
      speakLang: langCode,
    }
  }

  if (/why.*radius.*half|diameter/.test(lower)) {
    return {
      modeLabel,
      answer:
        'A diameter passes straight through the center from one edge of the circle to the opposite edge (distance = 2r). The radius only runs from the center to the edge, so r = d ÷ 2 always. Plugging d into r² causes 4× error in area and 8× error in volume!',
    }
  }

  if (/csa instead of tsa|csa vs tsa|why csa|curved surface/.test(lower)) {
    return {
      modeLabel,
      answer:
        'Use CSA (Curved/Lateral Surface Area) when the top/bottom circular caps are open, missing, or glued flush against another shape in a combined solid (like a cylinder + hemisphere vessel or tent). Use TSA only when all outer faces—both curved walls and closed circular/flat ends—are exposed.',
    }
  }

  if (/why.*use this formula|formula/.test(lower)) {
    return {
      modeLabel,
      answer: solved?.supported
        ? `For this problem (${solved.topic}), we apply "${solved.formulaSummary}". Why: ${solved.steps?.[9]?.body ?? 'each exposed geometric panel maps directly to that term when unfolded into a 2D net.'}`
        : `Unfolding ${targetLangDict.shapes?.[activeShape] ?? activeShape} in 3D demonstrates visually why curved lateral walls sum cleanly into ${activeShape} CSA and adding end caps forms TSA.`,
    }
  }

  if (/simple language|explain.*calculation|easy way/.test(lower)) {
    return {
      modeLabel,
      answer: solved?.supported
        ? `Plain Teaching Explanation: First read what stays exposed (${solved.steps?.[3]?.body}). Next plug in ${Object.entries(solved.extractedValues ?? {}).map(([k, v]) => `${k} = ${v}`).join(', ')} step-by-step to arrive at ${solved.finalAnswerDisplay}.`
        : 'Step 1: List every known length in matching cm or m. Step 2: Pick Volume (3D space inside) or Surface Area (outer paint/wrapping). Step 3: Multiply carefully and attach squared (cm²) or cubic (cm³) units.',
    }
  }

  if (/common mistake|mistakes|students make|error/.test(lower)) {
    return {
      modeLabel,
      answer: solved?.commonMistake
        ? `Watch out on this problem: ${solved.commonMistake} General classroom traps: (1) forgetting r = d/2, (2) mixing m and cm, (3) using height h instead of slant height l inside cone CSA = πrl.`
        : 'Top 3 NCERT mensuration mistakes: (1) using diameter instead of radius, (2) forgetting hidden faces when combining solids (two cubes / toy / capsule), (3) confusing cm² with cm³ or litres.',
    }
  }

  if (/another example|similar.*question|give.*practice/.test(lower)) {
    const sims = generateSimilarNcertQuestions(solved, 'medium', 1)
    return {
      modeLabel,
      answer: sims[0]
        ? `Similar NCERT Practice: ${sims[0].question} (Hint: ${sims[0].formulaUsed}; Answer: ${sims[0].options[sims[0].correctIndex]}).`
        : 'Try modifying the radius or height in your current question above (e.g., double radius r) and observe how area scales 4× and volume scales 8×!',
    }
  }

  return {
    modeLabel,
    answer: solved?.supported
      ? `Active Problem Summary (${solved.topic}): Formula ${solved.formulaSummary} ⇒ Answer ${solved.finalAnswerDisplay}. Ask "Why CSA instead of TSA?", "Explain calculation simply", "Common mistakes", or "Explain in Kannada".`
      : 'Paste or select an NCERT mensuration problem on the left to inspect its 10-step derivation, or ask why a mensuration formula works!',
  }
}

/**
 * Honest browser OCR adapter: tries Chromium's native `window.TextDetector` if supported,
 * and gracefully prompts manual transcription/correction whenever automatic OCR is unavailable.
 */
export async function attemptBrowserOcr(imageFile) {
  if (!imageFile) {
    return { supported: false, extractedText: '', message: 'No image file provided.' }
  }
  if (typeof window !== 'undefined' && typeof window.TextDetector === 'function' && typeof window.createImageBitmap === 'function') {
    try {
      const detector = new window.TextDetector()
      const bitmap = await window.createImageBitmap(imageFile)
      const blocks = await detector.detect(bitmap)
      const text = (blocks ?? []).map((b) => b.rawValue).filter(Boolean).join(' ').trim()
      if (text) {
        return {
          supported: true,
          extractedText: text,
          message: 'Text extracted using browser native TextDetector API. Review & correct any OCR typos before clicking Solve.',
        }
      }
    } catch {
      // Fall through cleanly to honest fallback
    }
  }

  return {
    supported: false,
    extractedText: '',
    message:
      'Automatic OCR (window.TextDetector) is not available in this browser or detected no readable text. View your uploaded image preview alongside the editor and type/paste the question text before solving.',
  }
}
