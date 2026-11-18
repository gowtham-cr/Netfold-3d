import {
  evaluateUnifiedMockSession,
  generateUnifiedQuestionSet,
} from './examArenaBank.js'

export const CHALLENGE_QUESTION_COUNTS = Object.freeze([10, 15, 20])
const TEACHER_CHALLENGE_STORAGE_KEY = 'netfold_teacher_challenges_v1'

export const SIMULATED_DEMO_PEERS = Object.freeze([
  {
    id: 'demo_peer_aarav',
    name: 'Aarav (Demo Participant)',
    roleLabel: 'Simulated Demo Participant · Steady Accuracy',
    isSimulatedDemo: true,
    probByDifficulty: { easy: 0.9, medium: 0.78, advanced: 0.62 },
    baseSecByDifficulty: { easy: 20, medium: 32, advanced: 46 },
  },
  {
    id: 'demo_peer_diya',
    name: 'Diya (Demo Participant)',
    roleLabel: 'Simulated Demo Participant · Speed Specialist',
    isSimulatedDemo: true,
    probByDifficulty: { easy: 0.85, medium: 0.72, advanced: 0.55 },
    baseSecByDifficulty: { easy: 14, medium: 22, advanced: 34 },
  },
  {
    id: 'demo_peer_rohan',
    name: 'Rohan (Demo Participant)',
    roleLabel: 'Simulated Demo Participant · Concept Explorer',
    isSimulatedDemo: true,
    probByDifficulty: { easy: 0.8, medium: 0.66, advanced: 0.48 },
    baseSecByDifficulty: { easy: 24, medium: 36, advanced: 52 },
  },
])

export const DEFAULT_TEACHER_CHALLENGES = Object.freeze([
  {
    id: 'tc_surface_area_10',
    title: 'Class 10 Surface Area & Nets Sprint',
    creator: 'Teacher Studio Preset',
    questionCount: 10,
    difficulty: 'easy',
    topic: 'surface_area',
    durationMinutes: 8,
    isPreset: true,
  },
  {
    id: 'tc_cylinder_cone_15',
    title: 'Cylinder, Cone & Frustum Mastery Challenge',
    creator: 'Teacher Studio Preset',
    questionCount: 15,
    difficulty: 'medium',
    topic: 'cone_frustum',
    durationMinutes: 12,
    isPreset: true,
  },
  {
    id: 'tc_mensuration_champ_20',
    title: 'All-India Mensuration 20Q Championship',
    creator: 'Teacher Studio Preset',
    questionCount: 20,
    difficulty: 'advanced',
    topic: 'all',
    durationMinutes: 15,
    isPreset: true,
  },
])

export function loadTeacherChallenges() {
  if (typeof window === 'undefined') return [...DEFAULT_TEACHER_CHALLENGES]
  try {
    const raw = window.localStorage.getItem(TEACHER_CHALLENGE_STORAGE_KEY)
    if (!raw) return [...DEFAULT_TEACHER_CHALLENGES]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...DEFAULT_TEACHER_CHALLENGES]
    const custom = parsed.filter(
      (c) =>
        c &&
        typeof c.id === 'string' &&
        typeof c.title === 'string' &&
        CHALLENGE_QUESTION_COUNTS.includes(Number(c.questionCount)),
    )
    return [...custom, ...DEFAULT_TEACHER_CHALLENGES]
  } catch {
    return [...DEFAULT_TEACHER_CHALLENGES]
  }
}

export function saveCustomTeacherChallenge({
  title,
  questionCount = 10,
  difficulty = 'medium',
  topic = 'all',
  durationMinutes = 10,
  creator = 'Teacher Created',
} = {}) {
  const safeCount = CHALLENGE_QUESTION_COUNTS.includes(Number(questionCount))
    ? Number(questionCount)
    : 10
  const safeDuration = Math.max(3, Math.min(45, Number(durationMinutes) || 10))
  const cleanTitle = String(title ?? '').trim() || `Custom ${safeCount}Q Challenge`

  const newEntry = {
    id: `tc_custom_${Date.now()}`,
    title: cleanTitle,
    creator,
    questionCount: safeCount,
    difficulty: ['all', 'easy', 'medium', 'advanced'].includes(difficulty)
      ? difficulty
      : 'all',
    topic: topic || 'all',
    durationMinutes: safeDuration,
    isPreset: false,
  }

  if (typeof window !== 'undefined') {
    try {
      const existing = loadTeacherChallenges().filter((c) => !c.isPreset)
      const next = [newEntry, ...existing].slice(0, 20)
      window.localStorage.setItem(TEACHER_CHALLENGE_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage quota errors
    }
  }
  return newEntry
}

export function deleteCustomTeacherChallenge(challengeId) {
  if (typeof window === 'undefined') return loadTeacherChallenges()
  try {
    const existing = loadTeacherChallenges().filter(
      (c) => !c.isPreset && c.id !== challengeId,
    )
    window.localStorage.setItem(TEACHER_CHALLENGE_STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // Ignore storage errors
  }
  return loadTeacherChallenges()
}

/**
 * Generates a 10, 15, or 20 question set for Live Challenge Mode.
 * If a narrow topic + difficulty filter has fewer than `count` items, falls back cleanly
 * to broader difficulty/topic items so the requested 10/15/20 count is always met.
 */
export function buildLiveChallengeQuestions({
  questionCount = 10,
  difficulty = 'all',
  topic = 'all',
  exam = 'all',
  seed = 1,
} = {}) {
  const targetCount = CHALLENGE_QUESTION_COUNTS.includes(Number(questionCount))
    ? Number(questionCount)
    : 10

  const primary = generateUnifiedQuestionSet({
    difficulty,
    topic,
    exam,
    count: targetCount,
    seed,
  }).questions

  if (primary.length >= targetCount) {
    return primary.slice(0, targetCount)
  }

  const seen = new Set(primary.map((q) => q.id))
  const broaderTopic = generateUnifiedQuestionSet({
    difficulty: 'all',
    topic,
    exam: 'all',
    count: targetCount * 2,
    seed: seed + 3,
  }).questions

  const combined = [...primary]
  for (const q of broaderTopic) {
    if (!seen.has(q.id)) {
      seen.add(q.id)
      combined.push(q)
      if (combined.length >= targetCount) return combined
    }
  }

  const fullFallback = generateUnifiedQuestionSet({
    difficulty: 'all',
    topic: 'all',
    exam: 'all',
    count: targetCount * 3,
    seed: seed + 7,
  }).questions

  for (const q of fullFallback) {
    if (!seen.has(q.id)) {
      seen.add(q.id)
      combined.push(q)
      if (combined.length >= targetCount) break
    }
  }

  return combined.slice(0, targetCount)
}

function computeChallengePoints(correctCount, totalTimeSec, questionCount) {
  const basePoints = correctCount * 10
  const avgSec = questionCount > 0 ? totalTimeSec / questionCount : 60
  const speedBonusPerCorrect = Math.max(0, Math.min(5, Math.round((45 - avgSec) / 8)))
  return basePoints + correctCount * speedBonusPerCorrect
}

function simulateDeterministicPeer(peer, questions, seed = 1) {
  let correctCount = 0
  let totalTimeSec = 0

  questions.forEach((q, idx) => {
    const diff = q.difficulty || 'medium'
    const threshold = peer.probByDifficulty[diff] ?? 0.7
    const hash = ((idx + 1) * 37 + (Number(seed) || 1) * 19 + peer.id.length * 13) % 100
    const isCorrect = hash / 100 < threshold
    if (isCorrect) correctCount += 1

    const baseSec = peer.baseSecByDifficulty[diff] ?? 28
    const jitter = (hash % 9) - 4
    totalTimeSec += Math.max(6, baseSec + jitter)
  })

  const totalQuestions = questions.length
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const avgTimeSec =
    totalQuestions > 0 ? Number((totalTimeSec / totalQuestions).toFixed(1)) : 0
  const scorePoints = computeChallengePoints(correctCount, totalTimeSec, totalQuestions)

  return {
    participantId: peer.id,
    name: peer.name,
    roleLabel: peer.roleLabel,
    isUser: false,
    isSimulatedDemo: true,
    correctCount,
    totalQuestions,
    accuracy,
    totalTimeSec,
    avgTimeSec,
    scorePoints,
  }
}

/**
 * Evaluates a completed Live Challenge session and builds a ranked Leaderboard
 * comparing the student against clearly-labelled Simulated Demo Participants.
 */
export function evaluateLiveChallengeSession({
  questions = [],
  selectedAnswersById = {},
  numericAnswersById = {},
  timingsById = {},
  studentName = 'You (Live Student)',
  seed = 1,
} = {}) {
  const userEval = evaluateUnifiedMockSession(
    questions,
    selectedAnswersById,
    numericAnswersById,
    timingsById,
  )

  const userScorePoints = computeChallengePoints(
    userEval.correctCount,
    userEval.totalTimeSec,
    userEval.totalQuestions,
  )

  const userRow = {
    participantId: 'live_student_user',
    name: studentName,
    roleLabel: 'Live Device Participant (You)',
    isUser: true,
    isSimulatedDemo: false,
    correctCount: userEval.correctCount,
    totalQuestions: userEval.totalQuestions,
    accuracy: userEval.accuracy,
    totalTimeSec: userEval.totalTimeSec,
    avgTimeSec: userEval.avgTimeSec,
    scorePoints: userScorePoints,
  }

  const peerRows = SIMULATED_DEMO_PEERS.map((peer) =>
    simulateDeterministicPeer(peer, questions, seed),
  )

  const leaderboard = [userRow, ...peerRows]
    .sort((a, b) => {
      if (b.scorePoints !== a.scorePoints) return b.scorePoints - a.scorePoints
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount
      return a.totalTimeSec - b.totalTimeSec
    })
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }))

  const userRank =
    leaderboard.find((r) => r.isUser)?.rank ?? leaderboard.length
  const peerAvgAccuracy =
    peerRows.length > 0
      ? Math.round(
          peerRows.reduce((s, p) => s + p.accuracy, 0) / peerRows.length,
        )
      : 0
  const peerAvgTimeSec =
    peerRows.length > 0
      ? Math.round(
          peerRows.reduce((s, p) => s + p.totalTimeSec, 0) / peerRows.length,
        )
      : 0

  return {
    ...userEval,
    userScorePoints,
    userRank,
    peerAvgAccuracy,
    peerAvgTimeSec,
    accuracyDeltaVsPeers: userEval.accuracy - peerAvgAccuracy,
    timeDeltaVsPeersSec: userEval.totalTimeSec - peerAvgTimeSec,
    leaderboard,
    multiplayerMode: 'simulated_demo_participants',
    multiplayerDisclaimer:
      'Simulated Demo Participants Only — Opponents on this leaderboard are deterministic local demo participants for single-device benchmarking, not live real-time network multiplayer.',
  }
}
