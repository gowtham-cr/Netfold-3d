import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLASS_10_PRACTICE_CONTENT } from '../data/class10Practice.js'
import { GUIDE_AGENT_TRANSLATIONS } from '../data/guideAgentTranslations.js'
import { LEARNING_PATHS_COPY } from '../data/learningPaths.js'
import { MISSIONS_CONTENT } from '../data/missions.js'
import { MULTILINGUAL_CONTENT } from '../data/multilingualContentTranslations.js'
import { NCERT_CURRICULUM_QUESTIONS } from '../data/ncertCurriculumBank.js'
import { PLATFORM_TRANSLATIONS } from '../data/platformTranslations.js'
import { QUESTION_BANK } from '../data/questionBank.js'
import { TEACHER_STUDIO_EXTENDED } from '../data/teacherStudioTranslations.js'
import { TRANSLATIONS } from '../data/translations.js'
import {
  buildArenaQuestionMultilingualWrapper,
  buildDashboardMultilingualExplanation,
  buildFormulaMultilingualExplanation,
  buildShapeMultilingualExplanation,
  localizeSolvedNcertResult,
} from './multilingualExplanations.js'
import { SHAPES, calculateShape } from './mathEngine.js'
import { solveNcertMensurationQuestion } from './ncertQuestionSolver.js'
import {
  findVoiceForLanguage,
  getSpeechState,
  loadAutoSpeakPreference,
  loadGlobalLanguagePreference,
  loadSpeechRatePreference,
  pauseSpeechGlobal,
  replaySpeechGlobal,
  resumeSpeechGlobal,
  saveGlobalLanguagePreference,
  setAutoSpeakGlobal,
  setGlobalSpeechLanguage,
  setSpeechRateGlobal,
  speakTextGlobal,
  stopSpeechGlobal,
} from './speechEngine.js'

const ALL_LANGS = ['en', 'kn', 'ta', 'te', 'hi']

const DEFAULT_SHAPE_DIMS = {
  [SHAPES.CUBE]: { a: 4 },
  [SHAPES.CUBOID]: { l: 6, b: 4, h: 3 },
  [SHAPES.CYLINDER]: { r: 3, h: 5 },
  [SHAPES.CONE]: { r: 3, h: 4 },
  [SHAPES.SQUARE_PYRAMID]: { a: 6, h: 4 },
  [SHAPES.SPHERE]: { r: 5 },
  [SHAPES.TRIANGULAR_PRISM]: { a: 4, h: 5 },
  [SHAPES.PENTAGONAL_PRISM]: { a: 4, h: 6 },
  [SHAPES.HEXAGONAL_PRISM]: { a: 4, h: 5 },
  [SHAPES.TRIANGULAR_PYRAMID]: { a: 6, h: 5 },
  [SHAPES.PENTAGONAL_PYRAMID]: { a: 4, h: 6 },
  [SHAPES.HEXAGONAL_PYRAMID]: { a: 4, h: 3 },
  [SHAPES.HEMISPHERE]: { r: 5 },
  [SHAPES.FRUSTUM]: { r1: 6, r2: 3, h: 4 },
  [SHAPES.OCTAHEDRON]: { a: 5 },
}

function collectLeafKeysAndCheckNonEmpty(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined) {
    throw new Error(`Unexpected null/undefined at ${prefix}`)
  }
  if (typeof obj === 'string') {
    expect(obj.trim().length, `Empty string at ${prefix}`).toBeGreaterThan(0)
    out.push(prefix)
    return out
  }
  if (Array.isArray(obj)) {
    expect(obj.length, `Empty array at ${prefix}`).toBeGreaterThan(0)
    out.push(`${prefix}[]`)
    obj.forEach((item, idx) => {
      if (typeof item === 'string') {
        expect(item.trim().length, `Empty string at ${prefix}[${idx}]`).toBeGreaterThan(0)
      } else {
        collectLeafKeysAndCheckNonEmpty(item, `${prefix}[${idx}]`, out)
      }
    })
    return out
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort()
    for (const k of keys) {
      collectLeafKeysAndCheckNonEmpty(
        obj[k],
        prefix ? `${prefix}.${k}` : k,
        out,
      )
    }
  }
  return out
}

describe('Multilingual Translation Parity (5 Languages)', () => {
  it('enforces 100% key parity across en, kn, ta, te, hi in all core translation dictionaries', () => {
    const bundles = [
      ['MULTILINGUAL_CONTENT', MULTILINGUAL_CONTENT],
      ['TRANSLATIONS', TRANSLATIONS],
      ['PLATFORM_TRANSLATIONS', PLATFORM_TRANSLATIONS],
      ['GUIDE_AGENT_TRANSLATIONS', GUIDE_AGENT_TRANSLATIONS],
      ['TEACHER_STUDIO_EXTENDED', TEACHER_STUDIO_EXTENDED],
      ['CLASS_10_PRACTICE_CONTENT', CLASS_10_PRACTICE_CONTENT],
      ['MISSIONS_CONTENT', MISSIONS_CONTENT],
      ['LEARNING_PATHS_COPY', LEARNING_PATHS_COPY],
    ]

    for (const [bundleName, dict] of bundles) {
      const enLeaves = collectLeafKeysAndCheckNonEmpty(dict.en, `${bundleName}.en`)
      for (const lang of ALL_LANGS.filter((l) => l !== 'en')) {
        expect(dict[lang], `Missing language ${lang} in ${bundleName}`).toBeTruthy()
        const langLeaves = collectLeafKeysAndCheckNonEmpty(
          dict[lang],
          `${bundleName}.${lang}`,
        )
        expect(
          langLeaves.map((p) => p.replace(`${bundleName}.${lang}`, '')),
          `Key mismatch in ${bundleName} for ${lang}`,
        ).toEqual(enLeaves.map((p) => p.replace(`${bundleName}.en`, '')))
      }
    }
  })
})

describe('Live 15-Shape & Formula Multilingual Explanations', () => {
  it('generates localized explanations and dynamically updates when dimensions change for all 15 shapes across all 5 languages', () => {
    const allShapes = Object.values(SHAPES)
    expect(allShapes).toHaveLength(15)

    for (const lang of ALL_LANGS) {
      for (const shape of allShapes) {
        const dims = DEFAULT_SHAPE_DIMS[shape]
        const calc1 = calculateShape(shape, dims)
        const exp1 = buildShapeMultilingualExplanation(shape, calc1, 'cm', lang)

        expect(exp1.shapeLabel.trim().length).toBeGreaterThan(0)
        expect(exp1.definition.trim().length).toBeGreaterThan(0)
        expect(exp1.dimensionsText.trim().length).toBeGreaterThan(0)
        expect(exp1.commonMistake.trim().length).toBeGreaterThan(0)
        expect(exp1.speakText).toContain(exp1.shapeLabel)

        const firstKey = Object.keys(dims)[0]
        const updatedDims = { ...dims, [firstKey]: dims[firstKey] + 3 }
        const calc2 = calculateShape(shape, updatedDims)
        const exp2 = buildShapeMultilingualExplanation(shape, calc2, 'cm', lang)

        expect(exp2.dimensionsText).not.toBe(exp1.dimensionsText)
        expect(exp2.volumeDisplay).not.toBe(exp1.volumeDisplay)
        expect(exp2.speakText).not.toBe(exp1.speakText)

        const formulaSpeak = buildFormulaMultilingualExplanation(shape, calc2, 'cm', lang)
        expect(formulaSpeak).toContain(exp2.shapeLabel)
      }
    }
  })
})

describe('Multilingual Dashboard Narratives & Question Step Localization', () => {
  it('builds localized Student, Teacher, and Exam narratives without unresolved placeholders in all 5 languages', () => {
    for (const lang of ALL_LANGS) {
      const studentEmpty = buildDashboardMultilingualExplanation(
        'student',
        { attemptedCount: 0 },
        lang,
      )
      expect(studentEmpty.isEmpty).toBe(true)
      expect(studentEmpty.body).not.toMatch(/\{[a-zA-Z0-9_]+\}/)

      const studentPopulated = buildDashboardMultilingualExplanation(
        'student',
        {
          attemptedCount: 12,
          accuracyPct: 75,
          correctCount: 9,
          incorrectCount: 3,
          trendStatus: 'up',
          weakTopics: ['cone_frustum'],
        },
        lang,
      )
      expect(studentPopulated.isEmpty).toBe(false)
      expect(studentPopulated.body).toContain('75%')
      expect(studentPopulated.body).not.toMatch(/\{[a-zA-Z0-9_]+\}/)

      const teacherNarrative = buildDashboardMultilingualExplanation(
        'teacher',
        {
          rosterCount: 5,
          classAverageScore: 72,
          classAccuracy: 74,
          assignmentCompletionAvg: 80,
          weakestTopic: 'cylinder',
        },
        lang,
      )
      expect(teacherNarrative.body).toContain('72%')
      expect(teacherNarrative.body).not.toMatch(/\{[a-zA-Z0-9_]+\}/)

      const examNarrative = buildDashboardMultilingualExplanation(
        'exam',
        {
          verifiedCount: 41,
          indexedYearsCount: 9,
          practiceCount: 138,
          mostTestedTopic: 'cylinder',
          readinessScore: 68,
          mockCount: 2,
          weakTopics: ['sphere_hemisphere'],
        },
        lang,
      )
      expect(examNarrative.body).toContain('41')
      expect(examNarrative.body).toContain('68%')
      expect(examNarrative.body).not.toMatch(/\{[a-zA-Z0-9_]+\}/)
    }
  })

  it('localizes NCERT Teacher Studio 10-step solutions while preserving question progress and numerical answers', () => {
    const baseSolved = solveNcertMensurationQuestion(
      NCERT_CURRICULUM_QUESTIONS[1].questionText,
      { piMode: '22/7' },
    )
    expect(baseSolved.supported).toBe(true)
    expect(baseSolved.steps).toHaveLength(10)
    expect(baseSolved.finalAnswerDisplay).toContain('572')

    for (const lang of ALL_LANGS) {
      const localized = localizeSolvedNcertResult(baseSolved, lang, TRANSLATIONS[lang])
      expect(localized.steps).toHaveLength(10)
      expect(localized.finalAnswerDisplay).toContain('572')
      if (lang !== 'en') {
        expect(localized.localizedHint.trim().length).toBeGreaterThan(0)
        expect(localized.localizedCommonMistake.trim().length).toBeGreaterThan(0)
        expect(localized.steps[0].title).not.toBe(baseSolved.steps[0].title)
      }
    }
  })

  it('builds multilingual Arena solution wrappers in all 5 languages', () => {
    const q = QUESTION_BANK[0]
    for (const lang of ALL_LANGS) {
      const loc = q.locales?.[lang] ?? q.locales?.en
      const wrapper = buildArenaQuestionMultilingualWrapper(q, loc, lang)
      expect(wrapper.speakText).toContain(q.options[q.correctIndex])
      expect(wrapper.labels.finalAnswerLabel.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('Global Speech Engine & Strict Language-Voice Matching', () => {
  let originalWindow
  let store
  let cancelMock
  let speakMock
  let pauseMock
  let resumeMock

  beforeEach(() => {
    originalWindow = globalThis.window
    store = new Map()
    cancelMock = vi.fn()
    speakMock = vi.fn()
    pauseMock = vi.fn()
    resumeMock = vi.fn()

    globalThis.window = {
      localStorage: {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => {
          store.set(k, String(v))
        },
      },
      SpeechSynthesisUtterance: function MockUtterance(text) {
        this.text = text
        this.lang = ''
        this.rate = 1
        this.voice = null
      },
      speechSynthesis: {
        getVoices: () => [{ lang: 'en-US', name: 'English Desktop Voice' }],
        cancel: cancelMock,
        speak: speakMock,
        pause: pauseMock,
        resume: resumeMock,
      },
    }
  })

  afterEach(() => {
    stopSpeechGlobal()
    globalThis.window = originalWindow
  })

  it('persists global language, auto-voice, and speech rate preferences across sessions', () => {
    saveGlobalLanguagePreference('te')
    expect(loadGlobalLanguagePreference()).toBe('te')

    setGlobalSpeechLanguage('kn')
    expect(getSpeechState().activeLanguage).toBe('kn')
    expect(loadGlobalLanguagePreference()).toBe('kn')
    expect(cancelMock).toHaveBeenCalled()

    setAutoSpeakGlobal(true)
    expect(loadAutoSpeakPreference()).toBe(true)

    setSpeechRateGlobal(1.25)
    expect(loadSpeechRatePreference()).toBe(1.25)
  })

  it('refuses to silently speak wrong language when non-English voice is unavailable in browser', () => {
    const onlyEnglishVoices = [{ lang: 'en-US', name: 'English Desktop Voice' }]
    const checkKn = findVoiceForLanguage('kn', onlyEnglishVoices)

    expect(checkKn.apiSupported).toBe(true)
    expect(checkKn.available).toBe(false)
    expect(checkKn.reason).toBe('voice_unavailable_for_language')

    const res = speakTextGlobal({
      text: 'ಸಿಲಿಂಡರ್ ಘನಫಲ ವಿವರಣೆ',
      language: 'kn',
      sourceId: 'shape_panel',
      explicitVoices: onlyEnglishVoices,
    })

    expect(res.started).toBe(false)
    expect(res.reason).toBe('voice_unavailable_for_language')
    expect(speakMock).not.toHaveBeenCalled()
    expect(getSpeechState().status).toBe('unavailable')
    expect(getSpeechState().errorCode).toBe('voice_unavailable_for_language')
  })

  it('speaks using matched voice, cancels previous speech to avoid overlap, and supports pause/resume/replay/stop', () => {
    const knVoices = [
      { lang: 'en-US', name: 'English Voice' },
      { lang: 'kn-IN', name: 'Kannada Voice Pack' },
    ]
    globalThis.window.speechSynthesis.getVoices = () => knVoices

    setSpeechRateGlobal(1.5)
    const res = speakTextGlobal({
      text: 'ಗೋಳದ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ 4πr².',
      language: 'kn',
      sourceId: 'shape_panel',
    })

    expect(res.started).toBe(true)
    expect(res.voiceName).toBe('Kannada Voice Pack')
    expect(cancelMock).toHaveBeenCalled()
    expect(speakMock).toHaveBeenCalledTimes(1)

    const spokenUtterance = speakMock.mock.calls[0][0]
    expect(spokenUtterance.lang).toBe('kn-IN')
    expect(spokenUtterance.rate).toBe(1.5)
    expect(getSpeechState().status).toBe('speaking')

    pauseSpeechGlobal()
    expect(pauseMock).toHaveBeenCalledTimes(1)
    expect(getSpeechState().status).toBe('paused')

    resumeSpeechGlobal()
    expect(resumeMock).toHaveBeenCalledTimes(1)
    expect(getSpeechState().status).toBe('speaking')

    replaySpeechGlobal()
    expect(speakMock).toHaveBeenCalledTimes(2)

    stopSpeechGlobal()
    expect(getSpeechState().status).toBe('idle')
  })
})
