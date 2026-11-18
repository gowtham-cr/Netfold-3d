import {
  ALL_ARCHIVE_QUESTIONS,
  PYQ_DIFFICULTIES,
  PYQ_EXAMS,
  PYQ_TOPICS,
  PYQ_TYPES,
  parseNumericalInput,
  validateArchiveAnswer,
} from '../data/pyqArchive.js'
import { QUESTION_BANK } from '../data/questionBank.js'

export const UNIFIED_EXAMS = PYQ_EXAMS
export const UNIFIED_TOPICS = PYQ_TOPICS
export const UNIFIED_DIFFICULTIES = PYQ_DIFFICULTIES
export const UNIFIED_TYPES = PYQ_TYPES

function normalizeTopicFromCore(coreQ) {
  const t = coreQ.topic
  if (t === 'cone' || t === 'frustum_octahedron') return 'cone_frustum'
  if (t === 'combinations_conversion') {
    const qText = (coreQ.en?.question ?? '').toLowerCase()
    return /melt|recast|wire|drawn/.test(qText)
      ? 'conversion_melting'
      : 'combination_of_solids'
  }
  if (t === 'scaling_ratio') {
    const qText = (coreQ.en?.question ?? '').toLowerCase()
    return /surface area|area/.test(qText) ? 'surface_area' : 'volume'
  }
  return PYQ_TOPICS.includes(t) ? t : 'volume'
}

function normalizeExamFromCore(examTrack) {
  if (examTrack === 'jee_foundation') return 'jee_main'
  return PYQ_EXAMS.includes(examTrack) ? examTrack : 'general_aptitude'
}

function mapExamToTrack(exam) {
  if (exam === 'jee_main' || exam === 'jee_advanced') return 'jee_foundation'
  return exam
}

function inferArchiveSyllabus(item) {
  if (
    item.exam === 'jee_main' ||
    item.exam === 'jee_advanced' ||
    item.exam === 'kcet' ||
    item.topic === 'prism_pyramid'
  ) {
    return 'additional_practice'
  }
  return 'ncert_core'
}

function extractNumericFallback(item) {
  if (Number.isFinite(item.numericAnswer)) return item.numericAnswer
  if (item.questionType !== 'numerical') return null
  const label = item.options?.[item.correctIndex] ?? ''
  return parseNumericalInput(label)
}

function normalizeQuestionFingerprint(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function buildUnifiedExamBank() {
  const unified = []
  const seenIds = new Set()
  const seenFingerprints = new Set()

  for (const item of ALL_ARCHIVE_QUESTIONS) {
    const fp = normalizeQuestionFingerprint(item.question)
    if (seenIds.has(item.id) || (fp && seenFingerprints.has(fp))) continue
    seenIds.add(item.id)
    if (fp) seenFingerprints.add(fp)

    unified.push(
      Object.freeze({
        ...item,
        sourceOrigin: 'archive',
        examTrack: mapExamToTrack(item.exam),
        syllabusTag: inferArchiveSyllabus(item),
        en: Object.freeze({
          question: item.question,
          shortcutTip: item.shortcutTip,
          solutionSteps: item.solutionSteps,
        }),
      }),
    )
  }

  for (const coreQ of QUESTION_BANK) {
    const enText = coreQ.en?.question ?? ''
    const fp = normalizeQuestionFingerprint(enText)
    if (seenIds.has(coreQ.id) || (fp && seenFingerprints.has(fp))) continue
    seenIds.add(coreQ.id)
    if (fp) seenFingerprints.add(fp)

    const mappedExam = normalizeExamFromCore(coreQ.examTrack)
    const mappedTopic = normalizeTopicFromCore(coreQ)
    const numericAnswer = extractNumericFallback(coreQ)

    unified.push(
      Object.freeze({
        ...coreQ,
        id: coreQ.id,
        sourceOrigin: 'core_arena',
        authenticity: 'pyq_style_practice',
        exam: mappedExam,
        examTrack: coreQ.examTrack,
        year: null,
        paperSession: null,
        topic: mappedTopic,
        coreTopic: coreQ.topic,
        question: enText,
        shortcutTip: coreQ.en?.shortcutTip ?? '',
        solutionSteps: coreQ.en?.solutionSteps ?? [],
        numericAnswer,
        sourceName: 'NetFold 3D Exam Arena Core Practice Bank',
        sourceUrl: null,
      }),
    )
  }

  return Object.freeze(unified)
}

export const UNIFIED_EXAM_BANK = buildUnifiedExamBank()

export const UNIFIED_BANK_STATS = Object.freeze((() => {
  let verifiedPyqCount = 0
  let practiceStyleCount = 0
  const yearsSet = new Set()
  const byExam = Object.fromEntries(PYQ_EXAMS.map((e) => [e, 0]))
  const byTopic = Object.fromEntries(PYQ_TOPICS.map((t) => [t, 0]))

  for (const q of UNIFIED_EXAM_BANK) {
    if (q.authenticity === 'verified_pyq') verifiedPyqCount += 1
    else practiceStyleCount += 1
    if (Number.isInteger(q.year)) yearsSet.add(q.year)
    if (byExam[q.exam] !== undefined) byExam[q.exam] += 1
    if (byTopic[q.topic] !== undefined) byTopic[q.topic] += 1
  }

  return {
    totalQuestions: UNIFIED_EXAM_BANK.length,
    verifiedPyqCount,
    practiceStyleCount,
    targetPyqGoal: 100,
    verifiedGapTo100: Math.max(0, 100 - verifiedPyqCount),
    distinctYears: Array.from(yearsSet).sort((a, b) => b - a),
    byExam,
    byTopic,
  }
})())

/**
 * Returns localized `{ question, shortcutTip, solutionSteps }` for a unified exam question,
 * gracefully falling back to English for English-indexed historical PYQs.
 */
export function getArenaQuestionLocale(question, language = 'en') {
  if (!question) {
    return { question: '', shortcutTip: '', solutionSteps: [] }
  }
  const localized = question[language] ?? question.en
  return {
    question: localized?.question ?? question.question ?? '',
    shortcutTip: localized?.shortcutTip ?? question.shortcutTip ?? '',
    solutionSteps: localized?.solutionSteps ?? question.solutionSteps ?? [],
  }
}

/**
 * Filters all questions in UNIFIED_EXAM_BANK across authenticity, exam, topic,
 * year, difficulty, syllabus, questionType, search query, bookmarks, and wrong history.
 */
export function filterUnifiedExamQuestions({
  authenticity = 'all', // 'all' | 'verified_pyq' | 'pyq_style_practice'
  exam = 'all',
  topic = 'all',
  year = 'all',
  difficulty = 'all',
  syllabusTag = 'all',
  questionType = 'all',
  query = '',
  bookmarkedOnly = false,
  bookmarkedSet = null,
  incorrectOnly = false,
  incorrectIdsSet = null,
  limit = 'all', // 'all' | 10 | 25 | 50 | number
} = {}) {
  const qLower = String(query ?? '').trim().toLowerCase()
  const yearNum = year !== 'all' ? Number(year) : null

  const matched = UNIFIED_EXAM_BANK.filter((item) => {
    if (authenticity !== 'all' && item.authenticity !== authenticity) return false
    if (exam !== 'all' && item.exam !== exam) return false
    if (topic !== 'all' && item.topic !== topic) return false
    if (difficulty !== 'all' && item.difficulty !== difficulty) return false
    if (syllabusTag !== 'all' && item.syllabusTag !== syllabusTag) return false
    if (questionType !== 'all' && item.questionType !== questionType) return false
    if (yearNum !== null && item.year !== yearNum) return false
    if (bookmarkedOnly && !(bookmarkedSet && bookmarkedSet.has(item.id))) return false
    if (incorrectOnly && !(incorrectIdsSet && incorrectIdsSet.has(item.id))) return false
    if (qLower) {
      const hay = `${item.question} ${item.exam} ${item.topic} ${item.year ?? ''} ${item.paperSession ?? ''} ${item.formulaUsed ?? ''}`.toLowerCase()
      if (!hay.includes(qLower)) return false
    }
    return true
  })

  if (limit === 'all' || limit === null || limit === undefined) {
    return matched
  }
  const numericLimit = Math.max(1, Number(limit) || matched.length)
  return matched.slice(0, numericLimit)
}

/**
 * Generates an unlimited non-duplicate question set from the full UNIFIED_EXAM_BANK
 * (up to all matching questions, removing the old 25-question ceiling).
 */
export function generateUnifiedQuestionSet({
  authenticity = 'all',
  exam = 'all',
  topic = 'all',
  year = 'all',
  difficulty = 'all',
  syllabusTag = 'all',
  questionType = 'all',
  incorrectOnly = false,
  incorrectIdsSet = null,
  count = 25,
  seed = 1,
} = {}) {
  const filtered = filterUnifiedExamQuestions({
    authenticity,
    exam,
    topic,
    year,
    difficulty,
    syllabusTag,
    questionType,
    incorrectOnly,
    incorrectIdsSet,
    limit: 'all',
  })

  const requestedCount =
    count === 'all'
      ? filtered.length
      : Math.max(1, Math.min(filtered.length || 1, Number(count) || 25))

  const ordered = [...filtered]
  const n = ordered.length
  if (n > 1) {
    for (let i = n - 1; i > 0; i -= 1) {
      const j = (i * 7 + (Number(seed) || 1) * 13) % (i + 1)
      const tmp = ordered[i]
      ordered[i] = ordered[j]
      ordered[j] = tmp
    }
  }

  return {
    questions: ordered.slice(0, requestedCount),
    totalMatching: filtered.length,
  }
}

/**
 * Validates either a clicked MCQ option or a typed numerical input against a unified question.
 */
export function validateUnifiedQuestionAnswer(question, { optionIndex = null, numericInput = '' }) {
  return validateArchiveAnswer(question, { optionIndex, numericInput })
}

/**
 * Scores a completed Timed Mock Test supporting both MCQ clicks and typed numerical answers.
 */
export function evaluateUnifiedMockSession(
  questions,
  selectedAnswersById = {},
  numericAnswersById = {},
  timingsById = {},
) {
  const safeQuestions = Array.isArray(questions) ? questions : []
  let correctCount = 0
  let answeredCount = 0
  let totalTimeSec = 0

  const perQuestion = safeQuestions.map((q) => {
    const picked = selectedAnswersById?.[q.id]
    const typed = numericAnswersById?.[q.id] ?? ''
    const check = validateUnifiedQuestionAnswer(q, {
      optionIndex: Number.isInteger(picked) ? picked : null,
      numericInput: typed,
    })
    const elapsed = Number.isFinite(timingsById?.[q.id]) ? timingsById[q.id] : 0
    if (check.validInput) answeredCount += 1
    if (check.correct) correctCount += 1
    totalTimeSec += elapsed

    return {
      id: q.id,
      topic: q.topic,
      exam: q.exam,
      examTrack: q.examTrack,
      difficulty: q.difficulty,
      authenticity: q.authenticity,
      year: q.year,
      correct: check.correct,
      hasAnswered: check.validInput,
      pickedIndex: Number.isInteger(picked) ? picked : null,
      typedNumeric: String(typed ?? '').trim(),
      correctIndex: q.correctIndex,
      timeSpentSec: elapsed,
    }
  })

  const totalQuestions = safeQuestions.length
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const avgTimeSec =
    totalQuestions > 0 ? Number((totalTimeSec / totalQuestions).toFixed(1)) : 0

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    accuracy,
    totalTimeSec,
    avgTimeSec,
    perQuestion,
  }
}
