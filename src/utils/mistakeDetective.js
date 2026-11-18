import { ALL_ARCHIVE_QUESTIONS, parseNumericalInput } from '../data/pyqArchive.js'
import { REMEDIATION_QUESTIONS } from '../data/remediationQuestions.js'

export const MISTAKE_CATEGORIES = Object.freeze([
  'formula_selection',
  'radius_diameter',
  'csa_vs_tsa',
  'unit_conversion',
  'calculation_error',
  'conceptual_misunderstanding',
])

function extractNumericOption(optStr) {
  if (typeof optStr !== 'string') return null
  return parseNumericalInput(optStr)
}

function nearRatio(a, b, target, relTol = 0.08) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return false
  const r = a / b
  return Math.abs(r - target) <= target * relTol
}

/**
 * Transparent local rule-based mistake diagnosis engine (zero fake AI calls).
 * Classifies an incorrect answer into one of 6 mensuration error archetypes
 * using explicit per-question distractor tags + mathematical ratio & clue rules.
 */
export function diagnoseMistake({
  question,
  wrongOptionIndex = null,
  wrongNumericInput = '',
  questionSource = 'pyq_archive',
}) {
  if (!question) return null

  const correctOptionText =
    question.options?.[question.correctIndex] ?? String(question.numericAnswer ?? '')
  const expectedNum =
    Number.isFinite(question.numericAnswer)
      ? question.numericAnswer
      : extractNumericOption(correctOptionText)

  let wrongDisplay = String(wrongNumericInput ?? '').trim()
  let studentNum = wrongDisplay ? parseNumericalInput(wrongDisplay) : null

  if (
    wrongDisplay === '' &&
    Number.isInteger(wrongOptionIndex) &&
    question.options?.[wrongOptionIndex] !== undefined
  ) {
    wrongDisplay = question.options[wrongOptionIndex]
    studentNum = extractNumericOption(wrongDisplay)
  }

  let category = null
  let matchConfidence = 'pattern_rule'

  // 1. Explicit question distractor mapping (highest specificity)
  if (
    Number.isInteger(wrongOptionIndex) &&
    question.distractorDiagnosis?.[wrongOptionIndex] &&
    MISTAKE_CATEGORIES.includes(question.distractorDiagnosis[wrongOptionIndex])
  ) {
    category = question.distractorDiagnosis[wrongOptionIndex]
    matchConfidence = 'exact_distractor_map'
  }

  // 2. Quantitative ratio & problem-clue heuristics
  const qText = `${question.question ?? ''} ${question.formulaUsed ?? ''}`.toLowerCase()

  if (!category && Number.isFinite(studentNum) && Number.isFinite(expectedNum) && expectedNum !== 0) {
    const unitFactors = [10, 0.1, 100, 0.01, 1000, 0.001, 10000, 0.0001, 1e6, 1e-6]
    if (
      /litre|liter|cm³|m³|cm²|m²|mm|metre|meter/.test(qText) &&
      unitFactors.some((f) => nearRatio(studentNum, expectedNum, f, 0.03))
    ) {
      category = 'unit_conversion'
      matchConfidence = 'high_ratio_match'
    } else if (
      /diameter|radius/.test(qText) &&
      [2, 4, 8, 0.5, 0.25, 0.125].some((f) => nearRatio(studentNum, expectedNum, f, 0.04))
    ) {
      category = 'radius_diameter'
      matchConfidence = 'high_ratio_match'
    } else if (
      /curved surface|lateral surface|csa|lsa|tsa|total surface|open|hemisphere|lid|floor|walls/.test(
        qText,
      ) &&
      [0.667, 1.5].some((f) => nearRatio(studentNum, expectedNum, f, 0.06))
    ) {
      category = 'csa_vs_tsa'
      matchConfidence = 'high_ratio_match'
    } else if (
      [3, 0.333, 1.333, 0.75, 2, 0.5].some((f) => nearRatio(studentNum, expectedNum, f, 0.05)) &&
      /cone|pyramid|sphere|frustum|volume/.test(qText)
    ) {
      category = 'formula_selection'
      matchConfidence = 'high_ratio_match'
    } else if (Math.abs(studentNum - expectedNum) / Math.abs(expectedNum) <= 0.35) {
      category = 'calculation_error'
      matchConfidence = 'numeric_proximity'
    }
  }

  // 3. Topic & semantic clue fallback
  if (!category) {
    if (/double|scale|ratio|joined|melted|recast|percent|%/.test(qText)) {
      category = 'conceptual_misunderstanding'
    } else if (/csa|lsa|tsa|surface area|walls|paint|open/.test(qText)) {
      category = 'csa_vs_tsa'
    } else if (/diameter/.test(qText)) {
      category = 'radius_diameter'
    } else if (/litre|m³|cm³|cost|convert/.test(qText)) {
      category = 'unit_conversion'
    } else if (/cone|pyramid|frustum|sphere|volume/.test(qText)) {
      category = 'formula_selection'
    } else {
      category = 'calculation_error'
    }
  }

  return {
    id: `mist_${question.id || 'q'}_${category}`,
    questionId: question.id || 'unknown',
    source: questionSource,
    topic: question.topic || 'general',
    shape: question.shape || null,
    questionText: question.question || '',
    category,
    matchConfidence,
    wrongDisplay: wrongDisplay || '—',
    expectedDisplay: correctOptionText,
    formulaUsed: question.formulaUsed || '',
    correctedSteps: Array.isArray(question.solutionSteps) ? question.solutionSteps : [],
  }
}

/**
 * Selects exactly 3 targeted practice questions tailored to the diagnosed (category, topic).
 */
export function selectTargetedRemediationQuestions(
  category,
  topic = null,
  count = 3,
) {
  const picked = []
  const seen = new Set()

  const addIfNew = (item) => {
    if (picked.length >= count || !item || seen.has(item.id)) return
    seen.add(item.id)
    picked.push(item)
  }

  // Priority 1: Exact category + exact topic in dedicated REMEDIATION_QUESTIONS
  for (const q of REMEDIATION_QUESTIONS) {
    if (q.mistakeCategory === category && (!topic || q.topic === topic)) {
      addIfNew(q)
    }
  }
  // Priority 2: Exact mistake category in REMEDIATION_QUESTIONS
  for (const q of REMEDIATION_QUESTIONS) {
    if (q.mistakeCategory === category) {
      addIfNew(q)
    }
  }
  // Priority 3: Matching topic in PYQ archive
  if (topic) {
    for (const q of ALL_ARCHIVE_QUESTIONS) {
      if (q.topic === topic) {
        addIfNew(q)
      }
    }
  }
  // Priority 4: Any remaining remediation items so we always reach count (3)
  for (const q of REMEDIATION_QUESTIONS) {
    addIfNew(q)
  }

  return picked
}
