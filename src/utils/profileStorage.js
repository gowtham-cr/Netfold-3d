export const DEMO_PROFILES = Object.freeze([
  {
    id: 'student_demo',
    audience: 'student',
    defaultTab: 'explorer',
    colorClass: 'indigo',
  },
  {
    id: 'teacher_demo',
    audience: 'teacher',
    defaultTab: 'teacher_studio',
    colorClass: 'emerald',
  },
  {
    id: 'exam_demo',
    audience: 'exam',
    defaultTab: 'exam_arena',
    colorClass: 'cyan',
  },
])

const ACTIVE_PROFILE_KEY = 'netfold_active_demo_profile_v1'
const WELCOME_SEEN_KEY = 'netfold_welcome_seen_v1'

export function isValidProfileId(profileId) {
  return DEMO_PROFILES.some((p) => p.id === profileId)
}

export function getProfileByAudience(audience) {
  return (
    DEMO_PROFILES.find((p) => p.audience === audience) ?? DEMO_PROFILES[0]
  )
}

export function loadActiveProfileId() {
  if (typeof window === 'undefined') return 'student_demo'
  try {
    const saved = window.localStorage.getItem(ACTIVE_PROFILE_KEY)
    return isValidProfileId(saved) ? saved : 'student_demo'
  } catch {
    return 'student_demo'
  }
}

export function saveActiveProfileId(profileId) {
  if (typeof window === 'undefined' || !isValidProfileId(profileId)) return
  try {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
  } catch {
    // Ignore storage errors
  }
}

export function loadWelcomeSeen() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveWelcomeSeen(seen = true) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(WELCOME_SEEN_KEY, seen ? 'true' : 'false')
  } catch {
    // Ignore storage errors
  }
}

function profileKey(profileId, section) {
  const safeId = isValidProfileId(profileId) ? profileId : 'student_demo'
  return `netfold_profile_${safeId}_${section}_v1`
}

export function currentTimestampMs() {
  return Date.now()
}

export function createEmptyProfileData() {
  return {
    examAttempts: [],
    pyqAttempts: [],
    mistakeLogs: [],
    remediationSessions: [],
    mockSessions: [],
    completedPathSteps: [],
    savedLessons: [],
    savedWorksheets: [],
  }
}

export function loadProfileData(profileId) {
  const fallback = createEmptyProfileData()
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(profileKey(profileId, 'data'))
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    return {
      examAttempts: Array.isArray(parsed.examAttempts)
        ? parsed.examAttempts.slice(-400)
        : [],
      pyqAttempts: Array.isArray(parsed.pyqAttempts)
        ? parsed.pyqAttempts.slice(-400)
        : [],
      mistakeLogs: Array.isArray(parsed.mistakeLogs)
        ? parsed.mistakeLogs.slice(-300)
        : [],
      remediationSessions: Array.isArray(parsed.remediationSessions)
        ? parsed.remediationSessions.slice(-60)
        : [],
      mockSessions: Array.isArray(parsed.mockSessions)
        ? parsed.mockSessions.slice(-40)
        : [],
      completedPathSteps: Array.isArray(parsed.completedPathSteps)
        ? parsed.completedPathSteps
        : [],
      savedLessons: Array.isArray(parsed.savedLessons)
        ? parsed.savedLessons.slice(-30)
        : [],
      savedWorksheets: Array.isArray(parsed.savedWorksheets)
        ? parsed.savedWorksheets.slice(-30)
        : [],
    }
  } catch {
    return fallback
  }
}

export function saveProfileData(profileId, data) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      profileKey(profileId, 'data'),
      JSON.stringify(data),
    )
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Computes detailed analytics for a given profile's local demo attempt history.
 */
export function computePerformanceAnalytics(profileData, learningProgress) {
  const attempts = [
    ...(Array.isArray(profileData?.examAttempts) ? profileData.examAttempts : []),
    ...(Array.isArray(profileData?.pyqAttempts) ? profileData.pyqAttempts : []),
  ]
  const mocks = Array.isArray(profileData?.mockSessions)
    ? profileData.mockSessions
    : []
  const pathSteps = Array.isArray(profileData?.completedPathSteps)
    ? profileData.completedPathSteps
    : []

  const totalAttempts = attempts.length
  const correctAttempts = attempts.filter((a) => a.correct).length
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  const totalTimeSec = attempts.reduce(
    (sum, a) => sum + (Number.isFinite(a.timeSpentSec) ? a.timeSpentSec : 0),
    0,
  )
  const avgTimePerQuestion =
    totalAttempts > 0 ? Number((totalTimeSec / totalAttempts).toFixed(1)) : 0

  const topicMap = new Map()
  for (const att of attempts) {
    const topic = att.topic || 'general'
    const current = topicMap.get(topic) ?? {
      topic,
      total: 0,
      correct: 0,
      totalSec: 0,
    }
    current.total += 1
    if (att.correct) current.correct += 1
    current.totalSec += Number.isFinite(att.timeSpentSec) ? att.timeSpentSec : 0
    topicMap.set(topic, current)
  }

  const topicBreakdown = Array.from(topicMap.values()).map((item) => {
    const accuracy = Math.round((item.correct / item.total) * 100)
    const status =
      accuracy >= 75 ? 'strong' : accuracy >= 50 ? 'developing' : 'weak'
    return {
      topic: item.topic,
      total: item.total,
      correct: item.correct,
      accuracy,
      avgTimeSec: Number((item.totalSec / item.total).toFixed(1)),
      status,
    }
  })

  // Chronological accuracy trend grouped in chunks of up to 5 attempts or mock sessions
  const trendPoints = []
  if (mocks.length > 0) {
    mocks.slice(-8).forEach((mock, idx) => {
      trendPoints.push({
        label: `M${idx + 1}`,
        accuracy: Number.isFinite(mock.accuracy) ? mock.accuracy : 0,
      })
    })
  } else if (attempts.length > 0) {
    const bucketSize = Math.max(1, Math.ceil(attempts.length / 6))
    for (let i = 0; i < attempts.length; i += bucketSize) {
      const slice = attempts.slice(i, i + bucketSize)
      const acc = Math.round(
        (slice.filter((x) => x.correct).length / slice.length) * 100,
      )
      trendPoints.push({
        label: `#${trendPoints.length + 1}`,
        accuracy: acc,
      })
    }
  }

  return {
    totalAttempts,
    correctAttempts,
    overallAccuracy,
    avgTimePerQuestion,
    mockCount: mocks.length,
    completedPathStepsCount: pathSteps.length,
    shapesExploredCount: learningProgress?.exploredShapes?.length ?? 0,
    questionsReviewedCount: learningProgress?.visitedQuestions?.length ?? 0,
    topicBreakdown,
    weakTopics: topicBreakdown
      .filter((t) => t.status === 'weak')
      .map((t) => t.topic),
    strongTopics: topicBreakdown
      .filter((t) => t.status === 'strong')
      .map((t) => t.topic),
    trendPoints,
  }
}

/**
 * Loads summaries across all local demo profiles for Teacher Studio analytics review.
 * Clearly strictly local demo data in browser storage (no server/cloud accounts).
 */
export function loadAllDemoProfileSummaries(learningProgress) {
  return DEMO_PROFILES.map((prof) => {
    const data = loadProfileData(prof.id)
    const analytics = computePerformanceAnalytics(data, learningProgress)
    return {
      profile: prof,
      data,
      analytics,
    }
  })
}
