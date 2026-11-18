import {
  CLASS_10_PRACTICE_IDS,
  CLASS_8_SHAPES,
  NET_CHECKER_PUZZLES,
  SHAPES,
} from './mathEngine.js'
import { MISSION_IDS } from '../data/missions.js'
import { ALL_ARCHIVE_QUESTIONS } from '../data/pyqArchive.js'

const ALL_SHAPES = Object.values(SHAPES)

const THEME_STORAGE_KEY = 'netfold_theme_v1'
const BOOKMARKS_STORAGE_KEY = 'netfold_bookmarks_v1'
const LEARNING_STORAGE_KEY = 'netfold_learning_progress_v1'
const MISSIONS_STORAGE_KEY = 'netfold_missions_progress_v1'
const NET_CHECKER_STORAGE_KEY = 'netfold_net_checker_progress_v1'

export function loadThemePreference() {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveThemePreference(theme) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme === 'dark' ? 'dark' : 'light')
  } catch {
    // Ignore storage errors
  }
}

export function loadBookmarks() {
  if (typeof window === 'undefined') return { shapes: [], questions: [], pyqs: [] }
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY)
    if (!raw) return { shapes: [], questions: [], pyqs: [] }
    const parsed = JSON.parse(raw)
    return {
      shapes: Array.isArray(parsed?.shapes)
        ? parsed.shapes.filter((id) => ALL_SHAPES.includes(id))
        : [],
      questions: Array.isArray(parsed?.questions)
        ? parsed.questions.filter((id) => CLASS_10_PRACTICE_IDS.includes(id))
        : [],
      pyqs: Array.isArray(parsed?.pyqs)
        ? parsed.pyqs.filter((id) => typeof id === 'string')
        : [],
    }
  } catch {
    return { shapes: [], questions: [], pyqs: [] }
  }
}

export function saveBookmarks(bookmarks) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks))
  } catch {
    // Ignore storage errors
  }
}

export function toggleBookmarkEntry(bookmarks, kind, id) {
  const list = Array.isArray(bookmarks?.[kind]) ? bookmarks[kind] : []
  const exists = list.includes(id)
  const nextList = exists ? list.filter((item) => item !== id) : [...list, id]
  return {
    ...bookmarks,
    [kind]: nextList,
  }
}

export function loadLearningProgress() {
  if (typeof window === 'undefined') {
    return { exploredShapes: ['cube'], visitedQuestions: [] }
  }
  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY)
    if (!raw) return { exploredShapes: ['cube'], visitedQuestions: [] }
    const parsed = JSON.parse(raw)
    const exploredShapes = Array.isArray(parsed?.exploredShapes)
      ? parsed.exploredShapes.filter((id) => ALL_SHAPES.includes(id))
      : ['cube']
    const visitedQuestions = Array.isArray(parsed?.visitedQuestions)
      ? parsed.visitedQuestions.filter((id) => CLASS_10_PRACTICE_IDS.includes(id))
      : []
    return {
      exploredShapes: exploredShapes.length > 0 ? exploredShapes : ['cube'],
      visitedQuestions,
    }
  } catch {
    return { exploredShapes: ['cube'], visitedQuestions: [] }
  }
}

export function saveLearningProgress(progress) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Ignore storage errors
  }
}

export function createDefaultMissionsProgress() {
  return Object.fromEntries(
    MISSION_IDS.map((id) => [
      id,
      { completed: false, stars: 0, attempts: 0 },
    ]),
  )
}

export function loadMissionsProgress() {
  const defaults = createDefaultMissionsProgress()
  if (typeof window === 'undefined') return defaults
  try {
    const raw = window.localStorage.getItem(MISSIONS_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaults
    const next = { ...defaults }
    for (const id of MISSION_IDS) {
      const rec = parsed[id]
      if (rec && typeof rec === 'object') {
        next[id] = {
          completed: Boolean(rec.completed),
          stars: Number.isFinite(rec.stars) ? Math.max(0, Math.min(3, rec.stars)) : 0,
          attempts: Number.isFinite(rec.attempts) ? Math.max(0, rec.attempts) : 0,
        }
      }
    }
    return next
  } catch {
    return defaults
  }
}

export function saveMissionsProgress(progress) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Ignore storage errors
  }
}

export function loadNetCheckerSummary() {
  if (typeof window === 'undefined') {
    return { answeredCount: 0, totalPuzzles: NET_CHECKER_PUZZLES.length, bestScore: 0 }
  }
  try {
    const raw = window.localStorage.getItem(NET_CHECKER_STORAGE_KEY)
    if (!raw) {
      return { answeredCount: 0, totalPuzzles: NET_CHECKER_PUZZLES.length, bestScore: 0 }
    }
    const parsed = JSON.parse(raw)
    const answeredCount =
      parsed?.answers && typeof parsed.answers === 'object'
        ? Object.keys(parsed.answers).length
        : 0
    const bestScore =
      typeof parsed?.bestScore === 'number' ? Math.max(0, parsed.bestScore) : 0
    return {
      answeredCount,
      totalPuzzles: NET_CHECKER_PUZZLES.length,
      bestScore,
    }
  } catch {
    return { answeredCount: 0, totalPuzzles: NET_CHECKER_PUZZLES.length, bestScore: 0 }
  }
}

/**
 * Computes overall progress metrics and earned achievement badges across
 * Explorer (15 shapes), Missions (4), Class 10 Practice (10 questions), and Net Lab.
 */
export function computeDashboardStats({
  learningProgress,
  missionsProgress,
  netCheckerSummary,
  bookmarks,
}) {
  const exploredShapes = learningProgress?.exploredShapes ?? []
  const visitedQuestions = learningProgress?.visitedQuestions ?? []

  const missionEntries = MISSION_IDS.map(
    (id) => missionsProgress?.[id] ?? { completed: false, stars: 0, attempts: 0 },
  )
  const missionsCompleted = missionEntries.filter((m) => m.completed).length
  const totalStars = missionEntries.reduce((sum, m) => sum + (m.stars ?? 0), 0)
  const maxStars = MISSION_IDS.length * 3

  const shapesRatio = exploredShapes.length / ALL_SHAPES.length
  const missionsRatio = missionsCompleted / MISSION_IDS.length
  const practiceRatio = visitedQuestions.length / CLASS_10_PRACTICE_IDS.length
  const overallMasteryPct = Math.round(
    ((shapesRatio * 0.35 + missionsRatio * 0.4 + practiceRatio * 0.25) * 100),
  )

  const class8Done = CLASS_8_SHAPES.every((id) => exploredShapes.includes(id))
  const all15Done = ALL_SHAPES.every((id) => exploredShapes.includes(id))

  const badges = [
    {
      id: 'first_fold',
      unlocked: exploredShapes.length >= 1,
    },
    {
      id: 'class8_complete',
      unlocked: class8Done,
    },
    {
      id: 'master_15',
      unlocked: all15Done,
    },
    {
      id: 'mission_challenger',
      unlocked: missionsCompleted >= 2,
    },
    {
      id: 'star_achiever',
      unlocked: missionsCompleted === MISSION_IDS.length,
    },
    {
      id: 'board_scholar',
      unlocked: visitedQuestions.length === CLASS_10_PRACTICE_IDS.length,
    },
  ]

  return {
    shapesCount: exploredShapes.length,
    totalShapes: ALL_SHAPES.length,
    missionsCompleted,
    totalMissions: MISSION_IDS.length,
    totalStars,
    maxStars,
    questionsVisitedCount: visitedQuestions.length,
    totalQuestions: CLASS_10_PRACTICE_IDS.length,
    netCheckerBest: netCheckerSummary?.bestScore ?? 0,
    netCheckerTotal: netCheckerSummary?.totalPuzzles ?? NET_CHECKER_PUZZLES.length,
    bookmarksCount:
      (bookmarks?.shapes?.length ?? 0) +
      (bookmarks?.questions?.length ?? 0) +
      (bookmarks?.pyqs?.length ?? 0),
    overallMasteryPct,
    badges,
  }
}

/**
 * Builds searchable catalog entries for shapes, missions, Class 10 practice questions,
 * Net Lab tabs, and Learning Hub sections.
 */
export function filterGlobalSearchResults(
  query,
  {
    translations: t,
    enTranslations,
    class10Bundle,
    enClass10Bundle,
    missionsBundle,
    enMissionsBundle,
  },
) {
  const q = String(query ?? '').trim().toLowerCase()
  const items = []

  for (const shapeId of ALL_SHAPES) {
    const label = t.shapes[shapeId] ?? shapeId
    const enLabel = enTranslations?.shapes?.[shapeId] ?? shapeId
    const def = t.learningByShape?.[shapeId]?.definition ?? ''
    items.push({
      id: `shape:${shapeId}`,
      category: 'shapes',
      title: label,
      subtitle: def,
      searchText: `${label} ${enLabel} ${def} ${shapeId}`.toLowerCase(),
      action: { type: 'shape', shapeId },
    })
  }

  MISSION_IDS.forEach((missionId) => {
    const m = missionsBundle?.[missionId]
    const enM = enMissionsBundle?.[missionId]
    if (!m) return
    items.push({
      id: `mission:${missionId}`,
      category: 'missions',
      title: m.title,
      subtitle: m.objective,
      searchText: `${m.title} ${m.objective} ${m.badge} ${enM?.title ?? ''} ${enM?.objective ?? ''}`.toLowerCase(),
      action: { type: 'mission', missionId },
    })
  })

  CLASS_10_PRACTICE_IDS.forEach((qId, index) => {
    const entry = class10Bundle?.[qId]
    const enEntry = enClass10Bundle?.[qId]
    if (!entry) return
    items.push({
      id: `practice:${qId}`,
      category: 'practice',
      title: `Q${index + 1}: ${entry.title}`,
      subtitle: entry.question,
      searchText: `q${index + 1} ${entry.title} ${entry.question} ${entry.formula} ${enEntry?.title ?? ''} ${enEntry?.question ?? ''}`.toLowerCase(),
      action: { type: 'practice', questionIndex: index },
    })
  })

  for (const subId of ['gallery', 'checker', 'cuboid', 'cylinder', 'draw', 'scale']) {
    const label = t.netLab?.subTabs?.[subId]
    if (!label) continue
    items.push({
      id: `netlab:${subId}`,
      category: 'netlab',
      title: label,
      subtitle: t.netLab.headerTitle,
      searchText: `${label} ${t.netLab.headerTitle}`.toLowerCase(),
      action: { type: 'tab', tabId: 'netlab', subTab: subId },
    })
  }

  for (const [tabId, header] of [
    ['paths', t.pathsUi?.headerTitle],
    ['exam_arena', t.examArena?.headerTitle],
    ['teacher_studio', t.teacherStudioUi?.headerTitle],
    ['worksheet_generator', t.worksheetUi?.headerTitle],
    ['analytics', t.analyticsUi?.headerTitle],
  ]) {
    const label = t.extraNavTabs?.[tabId]
    if (!label) continue
    items.push({
      id: `platform:${tabId}`,
      category: 'sections',
      title: label,
      subtitle: header ?? '',
      searchText: `${label} ${header ?? ''} ${enTranslations?.extraNavTabs?.[tabId] ?? ''}`.toLowerCase(),
      action: { type: 'tab', tabId },
    })
  }

  for (const sectionId of ['progress', 'bookmarks', 'help', 'about']) {
    const label = t.hub?.tabs?.[sectionId]
    if (!label) continue
    items.push({
      id: `hub:${sectionId}`,
      category: 'sections',
      title: label,
      subtitle: t.hub.headerTitle,
      searchText: `${label} ${t.hub.headerTitle}`.toLowerCase(),
      action: { type: 'hub', sectionId },
    })
  }

  for (const extraTab of [
    'reality_lab',
    'mistake_detective',
    'presentation_mode',
    'offline_revision',
  ]) {
    const label = t.extraNavTabs?.[extraTab]
    if (!label) continue
    items.push({
      id: `tab:${extraTab}`,
      category: 'tools',
      title: label,
      subtitle:
        extraTab === 'reality_lab'
          ? t.realityUi?.subtitle
          : extraTab === 'mistake_detective'
            ? t.mistakeUi?.subtitle
            : extraTab === 'offline_revision'
              ? t.offlineUi?.subtitle
              : t.presentationUi?.subtitle,
      searchText: `${label} ${extraTab.replace(/_/g, ' ')} offline save revision calendar planner download local storage`.toLowerCase(),
      action: { type: 'tab', tabId: extraTab },
    })
  }

  for (const subId of ['teacher_analytics', 'exam_analytics', 'frequency']) {
    const viewKey =
      subId === 'teacher_analytics'
        ? 'teacher'
        : subId === 'exam_analytics'
          ? 'exam'
          : null
    const label = viewKey
      ? t.advAnalytics?.subViews?.[viewKey]
      : t.advAnalytics?.analyticsPlus?.frequencyTabLabel
    if (!label) continue
    items.push({
      id: `hub:${subId}`,
      category: 'sections',
      title: label,
      subtitle: t.advAnalytics.centreTitle,
      searchText: `${label} ${t.advAnalytics.centreTitle}`.toLowerCase(),
      action: { type: 'hub', sectionId: subId },
    })
  }

  for (const qItem of ALL_ARCHIVE_QUESTIONS) {
    const examLabel = t.pyqUi?.exams?.[qItem.exam] ?? qItem.exam
    const topicLabel = t.pyqUi?.topics?.[qItem.topic] ?? qItem.topic
    items.push({
      id: `pyq:${qItem.id}`,
      category: 'pyqs',
      title: qItem.year
        ? `${examLabel} (${qItem.year}): ${qItem.question.slice(0, 72)}…`
        : `${examLabel}: ${qItem.question.slice(0, 72)}…`,
      subtitle: `${topicLabel} · ${qItem.authenticity === 'verified_pyq' ? t.pyqUi?.authenticityBadges?.verified_pyq : t.pyqUi?.authenticityBadges?.pyq_style_practice}`,
      searchText: `${qItem.question} ${examLabel} ${topicLabel} ${qItem.year ?? ''} ${qItem.paperSession ?? ''} ${qItem.formulaUsed} pyq archive`.toLowerCase(),
      action: { type: 'pyq', questionId: qItem.id },
    })
  }

  if (!q) {
    return items.slice(0, 12)
  }

  return items.filter((item) => item.searchText.includes(q)).slice(0, 18)
}
