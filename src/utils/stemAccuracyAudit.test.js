import { describe, expect, it } from 'vitest'
import {
  CLASS_10_PRACTICE_CONFIG,
  CLASS_10_PRACTICE_CONTENT,
} from '../data/class10Practice.js'
import {
  FIFTEEN_JURY_QA,
  FIVE_MINUTE_DEMO_SCRIPT,
  PROJECT_DEFENSE_DOSSIER,
} from '../data/finalRoundDefenseData.js'
import { MISSION_IDS, MISSIONS_CONTENT } from '../data/missions.js'
import { LANGUAGES } from '../data/translations.js'
import {
  CHALLENGE_QUESTION_COUNTS,
  SIMULATED_DEMO_PEERS,
  buildLiveChallengeQuestions,
  evaluateLiveChallengeSession,
  loadTeacherChallenges,
  saveCustomTeacherChallenge,
} from './liveChallengeEngine.js'
import {
  SHAPES,
  calculateFaceBreakdown,
  calculateShape,
} from './mathEngine.js'

const TEST_DIMS = {
  [SHAPES.CUBE]: { a: 3 },
  [SHAPES.CUBOID]: { l: 4, b: 3, h: 2 },
  [SHAPES.CYLINDER]: { r: 3, h: 4 },
  [SHAPES.CONE]: { r: 3, h: 4 },
  [SHAPES.SQUARE_PYRAMID]: { a: 4, h: 3 },
  [SHAPES.SPHERE]: { r: 3 },
  [SHAPES.TRIANGULAR_PRISM]: { a: 3, h: 4 },
  [SHAPES.PENTAGONAL_PRISM]: { a: 3, h: 4 },
  [SHAPES.HEXAGONAL_PRISM]: { a: 3, h: 4 },
  [SHAPES.TRIANGULAR_PYRAMID]: { a: 3, h: 4 },
  [SHAPES.PENTAGONAL_PYRAMID]: { a: 3, h: 4 },
  [SHAPES.HEXAGONAL_PYRAMID]: { a: 3, h: 3 },
  [SHAPES.HEMISPHERE]: { r: 3 },
  [SHAPES.FRUSTUM]: { r1: 4, r2: 2, h: 3 },
  [SHAPES.OCTAHEDRON]: { a: 3 },
}

describe('Final Round Audit — Criterion 1 (STEM Accuracy), Criterion 3D (Live Challenge) & Criterion 5 (Defense Dossier)', () => {
  it('verifies mathematical accuracy, face-area sums, and k²/k³ scaling laws across all 15 3D shapes', () => {
    const allShapes = Object.values(SHAPES)
    expect(allShapes).toHaveLength(15)

    for (const shape of allShapes) {
      const dims = TEST_DIMS[shape]
      const res = calculateShape(shape, dims)
      expect(res.tsa).toBeGreaterThan(0)
      expect(res.volume).toBeGreaterThan(0)

      if (shape === SHAPES.SPHERE || shape === SHAPES.OCTAHEDRON) {
        expect(res.lsa).toBeNull()
      } else {
        expect(res.lsa).toBeGreaterThan(0)
        expect(res.tsa).toBeGreaterThanOrEqual(res.lsa)
      }

      // Face area breakdown must sum to TSA
      const breakdown = calculateFaceBreakdown(shape, dims)
      expect(breakdown.faces.length).toBeGreaterThan(0)
      expect(breakdown.tsaSum).toBeCloseTo(res.tsa, 1)

      // Scaling factor k = 2 must scale TSA by 4 (k²) and Volume by 8 (k³)
      const scaledDims = Object.fromEntries(
        Object.entries(dims).map(([k, v]) => [k, v * 2]),
      )
      const scaled = calculateShape(shape, scaledDims)
      expect(scaled.tsa / res.tsa).toBeCloseTo(4, 2)
      expect(scaled.volume / res.volume).toBeCloseTo(8, 2)
    }
  })

  it('verifies all 10 NCERT Class 10 solved mensuration questions and all 4 STEM missions across 5 languages', () => {
    expect(CLASS_10_PRACTICE_CONFIG).toHaveLength(10)
    expect(MISSION_IDS).toHaveLength(4)

    for (const lang of Object.values(LANGUAGES)) {
      const qBundle = CLASS_10_PRACTICE_CONTENT[lang]
      expect(qBundle).toBeDefined()
      for (const cfg of CLASS_10_PRACTICE_CONFIG) {
        const qData = qBundle[cfg.id]
        expect(qData, `${lang}.${cfg.id}`).toBeDefined()
        expect(qData.question.trim().length).toBeGreaterThan(10)
        expect(qData.derivation.length).toBeGreaterThan(0)
        expect(qData.calculations.length).toBeGreaterThan(0)
        expect(qData.finalAnswer.trim().length).toBeGreaterThan(0)
      }

      const mBundle = MISSIONS_CONTENT[lang]
      expect(mBundle).toBeDefined()
      for (const mId of MISSION_IDS) {
        const m = mBundle[mId]
        expect(m, `${lang}.${mId}`).toBeDefined()
        expect(m.title.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('verifies Live Challenge Mode (10, 15, 20 questions, Teacher Challenges, Leaderboard & Demo Peer labelling)', () => {
    for (const cnt of CHALLENGE_QUESTION_COUNTS) {
      const qs = buildLiveChallengeQuestions({ questionCount: cnt, difficulty: 'medium', seed: 2 })
      expect(qs).toHaveLength(cnt)
      const ids = new Set(qs.map((q) => q.id))
      expect(ids.size).toBe(cnt)
    }

    const challengeQs = buildLiveChallengeQuestions({ questionCount: 10, seed: 5 })
    const answers = {
      [challengeQs[0].id]: challengeQs[0].correctIndex,
      [challengeQs[1].id]: challengeQs[1].correctIndex,
    }
    const timings = { [challengeQs[0].id]: 12, [challengeQs[1].id]: 18 }

    const evalRes = evaluateLiveChallengeSession({
      questions: challengeQs,
      selectedAnswersById: answers,
      timingsById: timings,
      studentName: 'Test Student',
      seed: 5,
    })

    expect(evalRes.totalQuestions).toBe(10)
    expect(evalRes.correctCount).toBe(2)
    expect(evalRes.accuracy).toBe(20)
    expect(evalRes.leaderboard).toHaveLength(1 + SIMULATED_DEMO_PEERS.length)
    expect(evalRes.multiplayerMode).toBe('simulated_demo_participants')

    const demoPeersInBoard = evalRes.leaderboard.filter((r) => !r.isUser)
    expect(demoPeersInBoard).toHaveLength(3)
    for (const peer of demoPeersInBoard) {
      expect(peer.isSimulatedDemo).toBe(true)
      expect(peer.roleLabel).toMatch(/Simulated Demo Participant/)
    }

    const customTc = saveCustomTeacherChallenge({
      title: 'Unit Test 15Q Cone Sprint',
      questionCount: 15,
      difficulty: 'advanced',
      topic: 'cone_frustum',
      durationMinutes: 12,
    })
    expect(customTc.questionCount).toBe(15)
    expect(loadTeacherChallenges().length).toBeGreaterThanOrEqual(3)
  })

  it('verifies the 5-minute demo script (7 segments), 16-section defense dossier, and 15 jury Q&As', () => {
    expect(FIVE_MINUTE_DEMO_SCRIPT).toHaveLength(7)
    expect(FIVE_MINUTE_DEMO_SCRIPT[0].timeRange).toBe('0:00–0:30')
    expect(FIVE_MINUTE_DEMO_SCRIPT[6].timeRange).toBe('4:15–5:00')

    expect(PROJECT_DEFENSE_DOSSIER.objectives.length).toBeGreaterThanOrEqual(4)
    expect(PROJECT_DEFENSE_DOSSIER.comparisonRows.length).toBeGreaterThanOrEqual(5)
    expect(PROJECT_DEFENSE_DOSSIER.technicalLimitations.length).toBeGreaterThanOrEqual(4)
    expect(PROJECT_DEFENSE_DOSSIER.genuinelyNewExplanation.length).toBeGreaterThan(40)

    expect(FIFTEEN_JURY_QA).toHaveLength(15)
    for (const qa of FIFTEEN_JURY_QA) {
      expect(qa.q.trim().length).toBeGreaterThan(10)
      expect(qa.a.trim().length).toBeGreaterThan(20)
    }
  })
})
