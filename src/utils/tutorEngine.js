import {
  CUBE_NET_CATALOG,
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  calculateFaceBreakdown,
  calculateScaleEnlargement,
  calculateShape,
} from './mathEngine.js'
import { TRANSLATIONS, getTranslations } from '../data/translations.js'

export const DEFAULT_SHAPE_DIMENSIONS = Object.freeze({
  [SHAPES.CUBE]: { a: 5 },
  [SHAPES.CUBOID]: { l: 10, b: 6, h: 4 },
  [SHAPES.CYLINDER]: { r: 3, h: 5 },
  [SHAPES.CONE]: { r: 3, h: 4 },
  [SHAPES.SQUARE_PYRAMID]: { a: 6, h: 4 },
  [SHAPES.SPHERE]: { r: 7 },
  [SHAPES.TRIANGULAR_PRISM]: { a: 4, h: 5 },
  [SHAPES.PENTAGONAL_PRISM]: { a: 4, h: 6 },
  [SHAPES.HEXAGONAL_PRISM]: { a: 4, h: 5 },
  [SHAPES.TRIANGULAR_PYRAMID]: { a: 6, h: 5 },
  [SHAPES.PENTAGONAL_PYRAMID]: { a: 4, h: 6 },
  [SHAPES.HEXAGONAL_PYRAMID]: { a: 4, h: 3 },
  [SHAPES.HEMISPHERE]: { r: 7 },
  [SHAPES.FRUSTUM]: { r1: 6, r2: 3, h: 4 },
  [SHAPES.OCTAHEDRON]: { a: 6 },
})

const SHAPE_KEYWORDS = [
  { shape: SHAPES.TRIANGULAR_PYRAMID, terms: ['triangular pyramid', 'tetrahedron'] },
  { shape: SHAPES.PENTAGONAL_PYRAMID, terms: ['pentagonal pyramid'] },
  { shape: SHAPES.HEXAGONAL_PYRAMID, terms: ['hexagonal pyramid'] },
  { shape: SHAPES.SQUARE_PYRAMID, terms: ['square pyramid', 'pyramid'] },
  { shape: SHAPES.TRIANGULAR_PRISM, terms: ['triangular prism'] },
  { shape: SHAPES.PENTAGONAL_PRISM, terms: ['pentagonal prism'] },
  { shape: SHAPES.HEXAGONAL_PRISM, terms: ['hexagonal prism'] },
  { shape: SHAPES.FRUSTUM, terms: ['frustum'] },
  { shape: SHAPES.HEMISPHERE, terms: ['hemisphere', 'half sphere'] },
  { shape: SHAPES.SPHERE, terms: ['sphere', 'ball'] },
  { shape: SHAPES.OCTAHEDRON, terms: ['octahedron'] },
  { shape: SHAPES.CUBOID, terms: ['cuboid', 'rectangular prism'] },
  { shape: SHAPES.CYLINDER, terms: ['cylinder'] },
  { shape: SHAPES.CONE, terms: ['cone'] },
  { shape: SHAPES.CUBE, terms: ['cube'] },
]

function fmtNum(val) {
  if (val === null || val === undefined) return '—'
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

function fmtWithPi(val, piCoeff, areaOrVolUnit) {
  if (typeof piCoeff === 'number') {
    return `${fmtNum(piCoeff)}π ≈ ${val.toFixed(2)} ${areaOrVolUnit}`
  }
  return `${fmtNum(val)} ${areaOrVolUnit}`
}

/**
 * Inspects whether a live backend proxy endpoint is configured for AI Tutor requests.
 * API keys must NEVER be stored or read in frontend code.
 *
 * @returns {{ hasLiveEndpoint: boolean, endpoint: string|null }}
 */
export function getTutorConnectionStatus() {
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_TUTOR_ENDPOINT
      : undefined
  const endpoint = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null
  return {
    hasLiveEndpoint: Boolean(endpoint),
    endpoint,
  }
}

/**
 * Detects which of the 15 shapes is referenced in a student's question
 * (checking English aliases + localized names across all 5 languages),
 * falling back cleanly to the currently selected shape.
 */
export function detectShapeInPrompt(text, fallbackShape = SHAPES.CUBE) {
  const lower = String(text ?? '').toLowerCase()
  if (!lower.trim()) {
    return { shape: fallbackShape, explicitlyNamed: false }
  }

  for (const entry of SHAPE_KEYWORDS) {
    if (entry.terms.some((term) => lower.includes(term))) {
      return { shape: entry.shape, explicitlyNamed: true }
    }
  }

  // Check native shape names across all 5 language catalogs (longest names first)
  const nativePairs = []
  for (const dict of Object.values(TRANSLATIONS)) {
    for (const [shapeId, localizedName] of Object.entries(dict.shapes)) {
      const full = localizedName.toLowerCase()
      nativePairs.push({ shape: shapeId, name: full })
      const stripped = full.replace(/\s*\([^)]*\)\s*/g, '').trim()
      if (stripped && stripped !== full) {
        nativePairs.push({ shape: shapeId, name: stripped })
      }
    }
  }
  nativePairs.sort((a, b) => b.name.length - a.name.length)
  for (const pair of nativePairs) {
    if (lower.includes(pair.name)) {
      return { shape: pair.shape, explicitlyNamed: true }
    }
  }

  return { shape: fallbackShape, explicitlyNamed: false }
}

function getExpectedKeysForShape(shape) {
  return Object.keys(
    DEFAULT_SHAPE_DIMENSIONS[shape] ?? DEFAULT_SHAPE_DIMENSIONS[SHAPES.CUBE],
  )
}

/**
 * Extracts explicit dimension numbers (e.g. "r=3 h=5", "side 6", "10 6 4") from a prompt.
 */
export function parseDimensionsFromPrompt(text, shape, fallbackDims) {
  const base = {
    ...(DEFAULT_SHAPE_DIMENSIONS[shape] ?? DEFAULT_SHAPE_DIMENSIONS[SHAPES.CUBE]),
    ...(fallbackDims ?? {}),
  }
  const str = String(text ?? '')
  if (!str.trim()) {
    return { dimensions: base, parsedFromPrompt: false }
  }

  const parsed = {}
  const keys = getExpectedKeysForShape(shape)

  const matchNumber = (regex) => {
    const m = str.match(regex)
    if (!m) return null
    const n = Number(m[1])
    return Number.isFinite(n) && n > 0 ? n : null
  }

  if (keys.includes('r1')) {
    const v = matchNumber(/\br1\s*[:=]?\s*(\d+(?:\.\d+)?)/i)
    if (v !== null) parsed.r1 = v
  }
  if (keys.includes('r2')) {
    const v = matchNumber(/\br2\s*[:=]?\s*(\d+(?:\.\d+)?)/i)
    if (v !== null) parsed.r2 = v
  }
  if (keys.includes('l')) {
    const v = matchNumber(/(?:\bl\b|length)\s*[:=]?\s*(\d+(?:\.\d+)?)/i)
    if (v !== null) parsed.l = v
  }
  if (keys.includes('b')) {
    const v = matchNumber(/(?:\bb\b|breadth|width)\s*[:=]?\s*(\d+(?:\.\d+)?)/i)
    if (v !== null) parsed.b = v
  }
  if (keys.includes('h')) {
    const v = matchNumber(/(?:\bh\b|height)\s*[:=]?\s*(\d+(?:\.\d+)?)/i)
    if (v !== null) parsed.h = v
  }
  if (keys.includes('r')) {
    const v = matchNumber(/(?:\br\b|radius)\s*[:=]?\s*(\d+(?:\.\d+)?)/i)
    if (v !== null) parsed.r = v
  }
  if (keys.includes('a')) {
    const v = matchNumber(
      /(?:\ba\b|side|edge|base\s*side)\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
    )
    if (v !== null) parsed.a = v
  }

  if (Object.keys(parsed).length > 0) {
    return {
      dimensions: { ...base, ...parsed },
      parsedFromPrompt: true,
    }
  }

  // Fallback: single-parameter shapes when user writes e.g. "volume of cube 7"
  const plainNums = Array.from(str.matchAll(/(?<![a-zA-Z0-9.])(\d+(?:\.\d+)?)/g))
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 100)

  if (keys.length === 1 && plainNums.length >= 1) {
    return {
      dimensions: { [keys[0]]: plainNums[0] },
      parsedFromPrompt: true,
    }
  }

  return { dimensions: base, parsedFromPrompt: false }
}

/**
 * Classifies the educational intent of a student question.
 */
export function detectTutorIntent(text) {
  const lower = String(text ?? '').toLowerCase()
  const hasAny = (words) => words.some((w) => lower.includes(w))

  if (
    hasAny([
      'net',
      'unfold',
      'fold',
      '11 ',
      'ನೆಟ್',
      'ಮಡಚು',
      'நெட்',
      'மடி',
      'నెట్',
      'మడత',
      'नेट',
      'मोड़',
    ])
  ) {
    return 'net'
  }

  if (
    hasAny([
      'scale',
      'enlarge',
      'double',
      'triple',
      'k²',
      'k³',
      '2x',
      '3x',
      'ಗುಣಕ',
      'ವಿಸ್ತರ',
      'மடங்கு',
      'பெருக்க',
      'రెట్లు',
      'విస్తర',
      'गुना',
      'स्केल',
    ])
  ) {
    return 'scale'
  }

  if (
    hasAny([
      'lsa',
      'csa',
      'tsa',
      'surface area',
      'volume',
      'formula',
      'calculate',
      'find',
      'solve',
      'how much',
      'why exclude',
      'excluded',
      'slant',
      '=',
      'ಸೂತ್ರ',
      'ವಿಸ್ತೀರ್ಣ',
      'ಘನಫಲ',
      'சூத்திர',
      'பரப்ப',
      'கன அளவ',
      'సూత్ర',
      'వైశాల్య',
      'ఘనపరిమాణ',
      'सूत्र',
      'क्षेत्रफल',
      'आयतन',
      'ज्ञात',
    ]) ||
    /\d/.test(lower)
  ) {
    return 'solve'
  }

  return 'overview'
}

function computeMensurationSafe(shape, rawDimensions) {
  const keys = Object.keys(rawDimensions)
  const vals = keys.map((k) => rawDimensions[k])
  const allInBounds = vals.every(
    (v) =>
      typeof v === 'number' &&
      Number.isFinite(v) &&
      v >= MIN_DIMENSION &&
      v <= MAX_DIMENSION,
  )

  if (allInBounds) {
    return {
      result: calculateShape(shape, rawDimensions),
      outOfSandboxRange: false,
    }
  }

  // Scale down proportionally to [1, 10] when student asks about e.g. side = 12 or 0.5,
  // then enlarge via mathEngine.calculateScaleEnlargement so all calculations stay in mathEngine.
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  let scaleFactor = 1
  if (maxV > MAX_DIMENSION) {
    scaleFactor = maxV / MAX_DIMENSION
  } else if (minV < MIN_DIMENSION) {
    scaleFactor = minV / MIN_DIMENSION
  }

  const normalized = {}
  let canUseEngine = true
  for (const k of keys) {
    const v = rawDimensions[k] / scaleFactor
    if (v < MIN_DIMENSION - 1e-9 || v > MAX_DIMENSION + 1e-9) {
      canUseEngine = false
    }
    normalized[k] = Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, v))
  }

  if (canUseEngine) {
    const enlarged = calculateScaleEnlargement(shape, normalized, scaleFactor)
    return {
      result: {
        shape,
        ...enlarged.scaled,
      },
      outOfSandboxRange: true,
    }
  }

  // Fallback for extreme aspect ratios outside [1, 10]: use valid default dimensions
  const fallbackDims = DEFAULT_SHAPE_DIMENSIONS[shape]
  return {
    result: calculateShape(shape, fallbackDims),
    outOfSandboxRange: false,
  }
}

function formatDimsSummary(dims, lenUnit) {
  return Object.entries(dims)
    .map(([k, v]) => `${k} = ${fmtNum(v)} ${lenUnit}`)
    .join(', ')
}

/**
 * Generates a structured, student-friendly, localized offline Demo Tutor explanation
 * backed purely by mathEngine.js and translations.js (honestly labelled as Demo mode).
 */
export function buildDemoTutorReply(
  question,
  {
    language = 'en',
    activeShape = SHAPES.CUBE,
    dimensionsByShape = DEFAULT_SHAPE_DIMENSIONS,
    unit = 'cm',
  } = {},
) {
  const t = getTranslations(language)
  const tt = t.tutor
  const lenU = t.unitSymbols[unit].length
  const areaU = t.unitSymbols[unit].area
  const volU = t.unitSymbols[unit].volume

  const { shape: targetShape } = detectShapeInPrompt(question, activeShape)
  const activeDims =
    dimensionsByShape?.[targetShape] ?? DEFAULT_SHAPE_DIMENSIONS[targetShape]
  const { dimensions: dims, parsedFromPrompt } = parseDimensionsFromPrompt(
    question,
    targetShape,
    activeDims,
  )
  const intent = detectTutorIntent(question)

  const shapeTitle = t.shapes[targetShape]
  const info = t.learningByShape[targetShape]
  const { result } = computeMensurationSafe(targetShape, dims)
  const breakdown =
    !parsedFromPrompt &&
    Object.values(result.dimensions).every(
      (v) => v >= MIN_DIMENSION && v <= MAX_DIMENSION,
    )
      ? calculateFaceBreakdown(targetShape, result.dimensions)
      : null

  const lines = []
  lines.push(
    parsedFromPrompt
      ? `${tt.templates.solvedForPrefix} ${shapeTitle} (${formatDimsSummary(result.dimensions, lenU)}):`
      : `${tt.templates.currentContextPrefix} ${shapeTitle} (${formatDimsSummary(result.dimensions, lenU)}):`,
  )

  if (intent === 'net') {
    lines.push('')
    lines.push(`**${tt.templates.netHeading}**`)
    lines.push(tt.templates.netByShape[targetShape])
    if (targetShape === SHAPES.CUBE) {
      lines.push(
        `• ${CUBE_NET_CATALOG.length} ${tt.templates.cubeNetsCountNote}`,
      )
    }
    if (targetShape === SHAPES.CYLINDER) {
      lines.push(`• 2πr = ${fmtNum(2 * result.dimensions.r)}π ≈ ${(2 * Math.PI * result.dimensions.r).toFixed(2)} ${lenU}`)
    }
    lines.push('')
    lines.push(`• ${t.facesStatLabel}: ${info.faces} | ${t.edgesStatLabel}: ${info.edges} | ${t.verticesStatLabel}: ${info.vertices}`)
  } else if (intent === 'scale') {
    const k = /triple|3x|3×/.test(String(question).toLowerCase()) ? 3 : 2
    const scaled = calculateScaleEnlargement(
      targetShape,
      activeDims,
      k,
    )
    lines.push('')
    lines.push(`**${tt.templates.scaleHeading} (${k}×)**`)
    lines.push(`• ${t.netLab.scale.dimensionsRow}: ${formatDimsSummary(scaled.base.dimensions, lenU)} → ${formatDimsSummary(scaled.scaled.dimensions, lenU)}`)
    lines.push(`• ${t.netLab.scale.tsaRow}: ${fmtNum(scaled.base.tsa)} ${areaU} × ${k}² (${scaled.areaFactor}×) = ${fmtNum(scaled.scaled.tsa)} ${areaU}`)
    lines.push(`• ${t.netLab.scale.volumeRow}: ${fmtNum(scaled.base.volume)} ${volU} × ${k}³ (${scaled.volumeFactor}×) = ${fmtNum(scaled.scaled.volume)} ${volU}`)
    lines.push(`• ${t.netLab.scale.insightBody}`)
  } else {
    // 'solve' or 'overview'
    lines.push('')
    lines.push(info.definition)
    lines.push('')
    lines.push(`**${tt.templates.formulaHeading}**`)
    if (typeof result.slantHeight === 'number') {
      const sSym =
        targetShape === SHAPES.CONE || targetShape === SHAPES.FRUSTUM ? 'l' : 's'
      lines.push(`• ${t.slantHeightStepLabel} (${sSym}): ${fmtNum(result.slantHeight)} ${lenU}`)
    }
    if (result.lsa === null) {
      const naNote =
        targetShape === SHAPES.SPHERE
          ? t.sphereLsaNotApplicable
          : t.octahedronLsaNotApplicable
      lines.push(`• ${t.lsaLabel}: ${naNote}`)
    } else {
      const lsaTitle =
        targetShape === SHAPES.CYLINDER || targetShape === SHAPES.HEMISPHERE
          ? t.csaLabel
          : t.lsaLabel
      lines.push(
        `• ${lsaTitle}: ${fmtWithPi(result.lsa, result.piCoefficients?.lsa, areaU)}`,
      )
      lines.push(`  ↳ ${t.lsaExclusionNote[targetShape]}`)
    }
    lines.push(
      `• ${t.tsaLabel}: ${fmtWithPi(result.tsa, result.piCoefficients?.tsa, areaU)}`,
    )
    lines.push(
      `• ${t.volumeLabel}: ${fmtWithPi(result.volume, result.piCoefficients?.volume, volU)}`,
    )

    if (breakdown && breakdown.faces.length <= 6) {
      lines.push('')
      lines.push(
        `• ${t.sumOfFacesLabel}: ${breakdown.faces.length} (${fmtNum(breakdown.tsaSum)} ${areaU})`,
      )
    }

    lines.push('')
    lines.push(`**${t.workedExampleLabel}:** ${info.workedExample}`)
    lines.push(`**${t.realWorldExampleLabel}:** ${info.realWorldExample}`)
  }

  return {
    reply: lines.join('\n'),
    targetShape,
    dimensions: result.dimensions,
    parsedFromPrompt,
    intent,
  }
}

/**
 * Requests a tutor reply. Uses a configured backend proxy (`VITE_TUTOR_ENDPOINT`, holding keys strictly server-side)
 * when set, and otherwise returns an honestly labelled local Demo Tutor response backed by `mathEngine.js`.
 */
export async function requestTutorResponse(question, options = {}) {
  const {
    language = 'en',
    activeShape = SHAPES.CUBE,
    dimensionsByShape = DEFAULT_SHAPE_DIMENSIONS,
    unit = 'cm',
    history = [],
  } = options

  const status = getTutorConnectionStatus()
  const activeDims =
    dimensionsByShape?.[activeShape] ?? DEFAULT_SHAPE_DIMENSIONS[activeShape]
  const mensuration = calculateShape(activeShape, activeDims)
  const t = getTranslations(language)

  if (status.hasLiveEndpoint) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(status.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: question,
          language,
          history: history.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          shapeContext: {
            shape: activeShape,
            shapeName: t.shapes[activeShape],
            dimensions: activeDims,
            unit,
            mensuration,
          },
        }),
      })
      clearTimeout(timer)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      if (typeof data?.reply === 'string' && data.reply.trim().length > 0) {
        return {
          mode: 'live',
          fallbackFromError: false,
          reply: data.reply.trim(),
          targetShape: activeShape,
          dimensions: activeDims,
        }
      }
      throw new Error('Empty AI reply')
    } catch {
      clearTimeout(timer)
      const demo = buildDemoTutorReply(question, {
        language,
        activeShape,
        dimensionsByShape,
        unit,
      })
      return {
        mode: 'demo',
        fallbackFromError: true,
        ...demo,
      }
    }
  }

  const demo = buildDemoTutorReply(question, {
    language,
    activeShape,
    dimensionsByShape,
    unit,
  })
  return {
    mode: 'demo',
    fallbackFromError: false,
    ...demo,
  }
}
