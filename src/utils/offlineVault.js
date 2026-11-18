import { ALL_ARCHIVE_QUESTIONS } from '../data/pyqArchive.js'
import { REMEDIATION_QUESTIONS } from '../data/remediationQuestions.js'
import { CLASS_10_PRACTICE_IDS, SHAPES, calculateShape } from './mathEngine.js'
import { currentTimestampMs, isValidProfileId } from './profileStorage.js'
import {
  buildStudentAnalytics,
  summarizeMistakesAndImprovement,
  toIsoDayKey,
} from './analyticsEngine.js'

const ALL_SHAPES = Object.values(SHAPES)
const DAY_MS = 24 * 60 * 60 * 1000

function offlineLockerKey(profileId) {
  const safeId = isValidProfileId(profileId) ? profileId : 'student_demo'
  return `netfold_profile_${safeId}_offline_locker_v1`
}

export const SHAPE_FORMULA_SHEET = Object.freeze({
  [SHAPES.CUBE]: {
    sampleDims: { a: 4 },
    lsaFormula: '4a²',
    tsaFormula: '6a²',
    volumeFormula: 'a³',
  },
  [SHAPES.CUBOID]: {
    sampleDims: { l: 6, b: 4, h: 3 },
    lsaFormula: '2h(l + b)',
    tsaFormula: '2(lb + bh + hl)',
    volumeFormula: 'l × b × h',
  },
  [SHAPES.CYLINDER]: {
    sampleDims: { r: 3, h: 7 },
    lsaFormula: '2πrh',
    tsaFormula: '2πr(r + h)',
    volumeFormula: 'πr²h',
  },
  [SHAPES.CONE]: {
    sampleDims: { r: 3, h: 4 },
    lsaFormula: 'πrl (l = √(r² + h²))',
    tsaFormula: 'πr(r + l)',
    volumeFormula: '⅓πr²h',
  },
  [SHAPES.SQUARE_PYRAMID]: {
    sampleDims: { a: 6, h: 4 },
    lsaFormula: '2as (s = √(h² + (a/2)²))',
    tsaFormula: 'a² + 2as',
    volumeFormula: '⅓a²h',
  },
  [SHAPES.SPHERE]: {
    sampleDims: { r: 4 },
    lsaFormula: '—',
    tsaFormula: '4πr²',
    volumeFormula: '(4/3)πr³',
  },
  [SHAPES.TRIANGULAR_PRISM]: {
    sampleDims: { a: 4, h: 6 },
    lsaFormula: '3ah',
    tsaFormula: '3ah + (√3/2)a²',
    volumeFormula: '(√3/4)a²h',
  },
  [SHAPES.TRIANGULAR_PYRAMID]: {
    sampleDims: { a: 6, h: 5 },
    lsaFormula: '(3/2)as',
    tsaFormula: '(√3/4)a² + (3/2)as',
    volumeFormula: '⅓ × (√3/4)a² × h',
  },
  [SHAPES.PENTAGONAL_PRISM]: {
    sampleDims: { a: 4, h: 5 },
    lsaFormula: '5ah',
    tsaFormula: '5ah + ½ × 5a × apothem',
    volumeFormula: 'Base Area × h',
  },
  [SHAPES.HEXAGONAL_PRISM]: {
    sampleDims: { a: 4, h: 5 },
    lsaFormula: '6ah',
    tsaFormula: '6ah + 3√3 a²',
    volumeFormula: '(3√3 / 2) a²h',
  },
  [SHAPES.PENTAGONAL_PYRAMID]: {
    sampleDims: { a: 4, h: 6 },
    lsaFormula: '(5/2)as',
    tsaFormula: 'Base Area + (5/2)as',
    volumeFormula: '⅓ × Base Area × h',
  },
  [SHAPES.HEXAGONAL_PYRAMID]: {
    sampleDims: { a: 4, h: 5 },
    lsaFormula: '3as',
    tsaFormula: '(3√3/2)a² + 3as',
    volumeFormula: '(√3/2)a²h',
  },
  [SHAPES.HEMISPHERE]: {
    sampleDims: { r: 4 },
    lsaFormula: '2πr²',
    tsaFormula: '3πr²',
    volumeFormula: '⅔πr³',
  },
  [SHAPES.FRUSTUM]: {
    sampleDims: { r1: 6, r2: 3, h: 4 },
    lsaFormula: 'π(r₁ + r₂)l',
    tsaFormula: 'π(r₁ + r₂)l + πr₁² + πr₂²',
    volumeFormula: '⅓πh(r₁² + r₁r₂ + r₂²)',
  },
  [SHAPES.OCTAHEDRON]: {
    sampleDims: { a: 4 },
    lsaFormula: '— (8 equilateral faces)',
    tsaFormula: '2√3 a²',
    volumeFormula: '(√2 / 3)a³',
  },
})

export function createEmptyOfflineLocker() {
  return {
    lessons: [],
    formulas: [],
    examples: [],
    questionSets: [],
    offlineQuizAnswers: {},
    completedRevisionTasks: {},
    lastUpdatedAt: null,
  }
}

export function loadOfflineLocker(profileId) {
  const fallback = createEmptyOfflineLocker()
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(offlineLockerKey(profileId))
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    return {
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      formulas: Array.isArray(parsed.formulas) ? parsed.formulas : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      questionSets: Array.isArray(parsed.questionSets) ? parsed.questionSets : [],
      offlineQuizAnswers:
        parsed.offlineQuizAnswers && typeof parsed.offlineQuizAnswers === 'object'
          ? parsed.offlineQuizAnswers
          : {},
      completedRevisionTasks:
        parsed.completedRevisionTasks &&
        typeof parsed.completedRevisionTasks === 'object'
          ? parsed.completedRevisionTasks
          : {},
      lastUpdatedAt: Number.isFinite(parsed.lastUpdatedAt)
        ? parsed.lastUpdatedAt
        : null,
    }
  } catch {
    return fallback
  }
}

export function saveOfflineLocker(profileId, lockerData) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      offlineLockerKey(profileId),
      JSON.stringify({
        ...createEmptyOfflineLocker(),
        ...lockerData,
      }),
    )
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function toggleOfflineLockerItem(locker, category, itemId) {
  const safe = { ...createEmptyOfflineLocker(), ...locker }
  const current = Array.isArray(safe[category]) ? safe[category] : []
  const exists = current.includes(itemId)
  return {
    ...safe,
    [category]: exists
      ? current.filter((x) => x !== itemId)
      : [...current, itemId],
    lastUpdatedAt: currentTimestampMs(),
  }
}

export function savePresetQuestionSetOffline(locker, { id, title, topic = 'mixed', filterFn }) {
  const safe = { ...createEmptyOfflineLocker(), ...locker }
  const pool = [...REMEDIATION_QUESTIONS, ...ALL_ARCHIVE_QUESTIONS]
  const matched = filterFn ? pool.filter(filterFn) : pool
  const selectedIds = matched.slice(0, 6).map((q) => q.id)
  if (selectedIds.length === 0) return safe

  const existingIdx = safe.questionSets.findIndex((s) => s.id === id)
  const nextSet = {
    id,
    title,
    topic,
    questionIds: selectedIds,
    savedAt: currentTimestampMs(),
  }
  const nextSets =
    existingIdx >= 0
      ? safe.questionSets.map((s, i) => (i === existingIdx ? nextSet : s))
      : [nextSet, ...safe.questionSets]

  return {
    ...safe,
    questionSets: nextSets.slice(0, 20),
    lastUpdatedAt: currentTimestampMs(),
  }
}

export function removeOfflineQuestionSet(locker, setId) {
  const safe = { ...createEmptyOfflineLocker(), ...locker }
  return {
    ...safe,
    questionSets: safe.questionSets.filter((s) => s.id !== setId),
    lastUpdatedAt: currentTimestampMs(),
  }
}

export function saveEssentialOfflineStudyKit(locker, weakTopics = []) {
  const base = { ...createEmptyOfflineLocker(), ...locker }
  const essentialShapes = [
    SHAPES.CUBE,
    SHAPES.CUBOID,
    SHAPES.CYLINDER,
    SHAPES.CONE,
    SHAPES.SPHERE,
    SHAPES.HEMISPHERE,
    SHAPES.FRUSTUM,
  ]
  const mergedLessons = Array.from(new Set([...base.lessons, ...essentialShapes]))
  const mergedFormulas = Array.from(new Set([...base.formulas, ...ALL_SHAPES]))
  const mergedExamples = Array.from(
    new Set([...base.examples, ...CLASS_10_PRACTICE_IDS.slice(0, 5)]),
  )

  let updated = {
    ...base,
    lessons: mergedLessons,
    formulas: mergedFormulas,
    examples: mergedExamples,
    lastUpdatedAt: currentTimestampMs(),
  }

  updated = savePresetQuestionSetOffline(updated, {
    id: 'offline_pack_class10_core',
    title: 'Core Solids & Surface Area Pack (6Q)',
    topic: 'surface_area',
    filterFn: (q) =>
      q.topic === 'cylinder' ||
      q.topic === 'cube_cuboid' ||
      q.topic === 'sphere_hemisphere',
  })

  if (weakTopics.length > 0) {
    const weakSet = new Set(weakTopics)
    updated = savePresetQuestionSetOffline(updated, {
      id: `offline_pack_weak_${weakTopics[0]}`,
      title: `Weak Topic Remediation: ${weakTopics[0].replace(/_/g, ' ')}`,
      topic: weakTopics[0],
      filterFn: (q) => weakSet.has(q.topic),
    })
  } else {
    updated = savePresetQuestionSetOffline(updated, {
      id: 'offline_pack_cone_frustum',
      title: 'Cone, Frustum & Volume Mixed Pack (6Q)',
      topic: 'cone_frustum',
      filterFn: (q) => q.topic === 'cone_frustum' || q.topic === 'volume',
    })
  }

  return updated
}

export function recordOfflineQuizAnswerInLocker(
  locker,
  { setId, questionId, pickedIndex, correct },
) {
  const safe = { ...createEmptyOfflineLocker(), ...locker }
  const prevSetAnswers = safe.offlineQuizAnswers[setId] ?? {}
  return {
    ...safe,
    offlineQuizAnswers: {
      ...safe.offlineQuizAnswers,
      [setId]: {
        ...prevSetAnswers,
        [questionId]: {
          pickedIndex,
          correct,
          timestamp: currentTimestampMs(),
        },
      },
    },
    lastUpdatedAt: currentTimestampMs(),
  }
}

export function toggleRevisionTaskCompletion(locker, taskId) {
  const safe = { ...createEmptyOfflineLocker(), ...locker }
  const prevDone = Boolean(safe.completedRevisionTasks[taskId])
  return {
    ...safe,
    completedRevisionTasks: {
      ...safe.completedRevisionTasks,
      [taskId]: !prevDone,
    },
    lastUpdatedAt: currentTimestampMs(),
  }
}

/**
 * Evaluates exact sample calculations cleanly using mathEngine for offline Formula Cards.
 */
export function evaluateSampleFormulaCard(shape) {
  const meta = SHAPE_FORMULA_SHEET[shape]
  if (!meta) return null
  const result = calculateShape(shape, meta.sampleDims)
  return {
    shape,
    ...meta,
    evaluated: result,
  }
}

/**
 * Resolves saved question set IDs strictly against offline static banks.
 */
export function resolveQuestionSetItems(questionIds = []) {
  const index = new Map()
  for (const q of REMEDIATION_QUESTIONS) index.set(q.id, q)
  for (const q of ALL_ARCHIVE_QUESTIONS) index.set(q.id, q)
  return questionIds.map((id) => index.get(id)).filter(Boolean)
}

/**
 * Builds the personalized Smart Revision Planner & 7-Day Daily Revision Calendar
 * strictly from actual student performance metrics, repeated mistakes, and exploration gaps.
 */
export function buildSmartRevisionPlan({
  profileData,
  learningProgress,
  offlineLocker,
  nowMs = Date.now(),
}) {
  const studentAnalytics = buildStudentAnalytics({
    profileData,
    learningProgress,
    missionsProgress: {},
    rangeKey: 'all',
    nowMs,
  })
  const mistakeSummary = summarizeMistakesAndImprovement(profileData, 'all', nowMs)

  const priorityMap = new Map()

  const addPriority = (topic, update) => {
    const existing = priorityMap.get(topic) ?? {
      topic,
      score: 0,
      accuracyPct: null,
      mistakeCount: 0,
      dominantMistakeCategory: null,
      reason: 'core_foundation',
    }
    priorityMap.set(topic, {
      ...existing,
      ...update,
      score: existing.score + (update.scoreDelta ?? 0),
    })
  }

  for (const st of studentAnalytics.topicStats) {
    if (st.accuracy < 75) {
      addPriority(st.topic, {
        accuracyPct: st.accuracy,
        reason: st.accuracy < 60 ? 'low_accuracy' : 'needs_consolidation',
        scoreDelta: Math.max(10, 100 - st.accuracy),
      })
    }
  }

  for (const hm of mistakeSummary.heatmapRows) {
    let topCat = null
    let topCatCount = 0
    for (const [cat, cnt] of Object.entries(hm.cells)) {
      if (cnt > topCatCount) {
        topCatCount = cnt
        topCat = cat
      }
    }
    addPriority(hm.topic, {
      mistakeCount: hm.total,
      dominantMistakeCategory: topCat,
      reason: hm.total >= 2 ? 'repeated_mistakes' : 'recent_mistake',
      scoreDelta: hm.total * 28,
    })
  }

  // Fill baseline core mensuration topics if the learner is just getting started
  const baselineOrder = [
    { topic: 'cube_cuboid', shape: SHAPES.CUBOID },
    { topic: 'cylinder', shape: SHAPES.CYLINDER },
    { topic: 'cone_frustum', shape: SHAPES.CONE },
    { topic: 'sphere_hemisphere', shape: SHAPES.HEMISPHERE },
    { topic: 'combination_of_solids', shape: SHAPES.CUBE },
  ]

  for (const base of baselineOrder) {
    if (!priorityMap.has(base.topic)) {
      const explored = learningProgress?.exploredShapes?.includes(base.shape)
      addPriority(base.topic, {
        reason: explored ? 'core_consolidation' : 'unexplored_topic',
        scoreDelta: explored ? 8 : 22,
      })
    }
  }

  const recommendedTopics = Array.from(priorityMap.values()).sort(
    (a, b) => b.score - a.score,
  )

  const topicToShape = {
    cube_cuboid: SHAPES.CUBOID,
    cylinder: SHAPES.CYLINDER,
    cone_frustum: SHAPES.FRUSTUM,
    sphere_hemisphere: SHAPES.HEMISPHERE,
    prism_pyramid: SHAPES.SQUARE_PYRAMID,
    surface_area: SHAPES.CYLINDER,
    volume: SHAPES.CONE,
    combination_of_solids: SHAPES.CUBE,
    conversion_melting: SHAPES.SPHERE,
    real_life: SHAPES.CYLINDER,
  }

  const completedMap = offlineLocker?.completedRevisionTasks ?? {}
  const calendarDays = []
  let totalTasksCount = 0
  let completedTasksCount = 0

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const dayTs = nowMs + dayOffset * DAY_MS
    const dateKey = toIsoDayKey(dayTs)
    const primaryRec = recommendedTopics[dayOffset % recommendedTopics.length]
    const secondaryRec =
      recommendedTopics[(dayOffset + 1) % recommendedTopics.length]

    const tasks = [
      {
        id: `rev_${dateKey}_formula_${primaryRec.topic}`,
        dayOffset,
        dateKey,
        topic: primaryRec.topic,
        targetShape: topicToShape[primaryRec.topic] ?? SHAPES.CYLINDER,
        kind: 'formula_review',
        targetTab: 'offline_revision',
        estimatedMin: 10,
      },
      {
        id:
          dayOffset % 2 === 0 && primaryRec.mistakeCount > 0
            ? `rev_${dateKey}_mistake_${primaryRec.topic}`
            : `rev_${dateKey}_practice_${secondaryRec.topic}`,
        dayOffset,
        dateKey,
        topic:
          dayOffset % 2 === 0 && primaryRec.mistakeCount > 0
            ? primaryRec.topic
            : secondaryRec.topic,
        targetShape:
          topicToShape[
            dayOffset % 2 === 0 && primaryRec.mistakeCount > 0
              ? primaryRec.topic
              : secondaryRec.topic
          ] ?? SHAPES.CUBE,
        kind:
          dayOffset % 2 === 0 && primaryRec.mistakeCount > 0
            ? 'mistake_fix'
            : 'practice_drill',
        targetTab:
          dayOffset % 2 === 0 && primaryRec.mistakeCount > 0
            ? 'mistake_detective'
            : 'pyq_archive',
        estimatedMin: 15,
      },
    ].map((task) => {
      const completed = Boolean(completedMap[task.id])
      totalTasksCount += 1
      if (completed) completedTasksCount += 1
      return { ...task, completed }
    })

    calendarDays.push({
      dayOffset,
      dateKey,
      tasks,
      allDone: tasks.every((t) => t.completed),
    })
  }

  const completionPct =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0

  return {
    recommendedTopics,
    calendarDays,
    totalTasksCount,
    completedTasksCount,
    completionPct,
    daysCompletedCount: calendarDays.filter((d) => d.allDone).length,
    hasPerformanceData:
      studentAnalytics.attemptedCount > 0 || mistakeSummary.totalMistakes > 0,
  }
}
