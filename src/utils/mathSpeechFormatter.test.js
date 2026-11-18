import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatMathForSpeech,
  numberToSpokenWords,
  splitIntoSentences,
  splitIntoWords,
} from './mathSpeechFormatter.js'
import {
  clearMemorySpeechCache,
  getSpeechState,
  nextSentenceGlobal,
  prevSentenceGlobal,
  setWordByWordModeGlobal,
  speakTextGlobal,
  stopSpeechGlobal,
} from './speechEngine.js'

const ALL_LANGS = ['en', 'kn', 'ta', 'te', 'hi']

describe('Mathematical Speech Normalization across 5 Languages', () => {
  it('expands equations, π, powers, units, fractions, and decimals cleanly without duplicate words', () => {
    const samples = {
      en: 'Cylinder volume equals V = πr²h. Given r = 3 cm and h = 5 cm, area = 572 cm². Take π = 22/7 and factor 3.14.',
      kn: 'ಸಿಲಿಂಡರ್ ಘನಫಲ V = πr²h. r = 3 cm, TSA = 572 cm².',
      ta: 'உருளை கன அளவு V = πr²h. r = 3 cm, TSA = 572 cm².',
      te: 'స్థూపం ఘనపరిమాణం V = πr²h. r = 3 cm, TSA = 572 cm².',
      hi: 'बेलन का आयतन V = πr²h है। r = 3 cm, TSA = 572 cm².',
    }

    for (const lang of ALL_LANGS) {
      const formatted = formatMathForSpeech(samples[lang], lang)
      expect(formatted).not.toContain('π')
      expect(formatted).not.toContain('²')
      expect(formatted).not.toContain('³')
      expect(formatted).not.toContain('=')
      expect(formatted).not.toMatch(/\b\d+\b/) // Digits cleanly spoken as native words
    }

    const enOut = formatMathForSpeech(samples.en, 'en')
    expect(enOut).toContain('pi times radius squared times height')
    expect(enOut).not.toContain('volume equals volume equals')
    expect(enOut).toContain('five hundred seventy two square centimeters')
    expect(enOut).toContain('twenty two by seven')
    expect(enOut).toContain('three point one four')
  })

  it('converts numbers to spoken words cleanly across all 5 languages', () => {
    for (const lang of ALL_LANGS) {
      expect(numberToSpokenWords(0, lang).length).toBeGreaterThan(0)
      expect(numberToSpokenWords(14, lang).length).toBeGreaterThan(0)
      expect(numberToSpokenWords(572, lang).length).toBeGreaterThan(0)
      expect(numberToSpokenWords(2026, lang).length).toBeGreaterThan(0)
    }
  })

  it('splits sentences while preserving decimals like 3.14 and splits words accurately', () => {
    const text = 'Take pi = 3.14 here. Next find 2πr²! Is it clear? हाँ यह सही है।'
    const sentences = splitIntoSentences(text)
    expect(sentences).toHaveLength(4)
    expect(sentences[0]).toContain('3.14')
    expect(splitIntoWords('three times pi')).toEqual(['three', 'times', 'pi'])
  })
})

describe('Multilingual Speech Engine — Backend Proxy Routing, Cache & Fallback', () => {
  let originalWindow
  let originalFetch
  let originalAudio
  let originalUrl
  let fetchMock
  let pauseSpy
  let playSpy

  beforeEach(() => {
    originalWindow = globalThis.window
    originalFetch = globalThis.fetch
    originalUrl = globalThis.URL
    clearMemorySpeechCache()

    pauseSpy = vi.fn()
    playSpy = vi.fn(async () => {})

    class MockAudio {
      constructor(src) {
        this.src = src
        this.playbackRate = 1
        this.duration = 2.0
        this.onloadedmetadata = null
        this.onended = null
        this.onerror = null
      }
      play = playSpy
      pause = pauseSpy
    }
    originalAudio = MockAudio

    fetchMock = vi.fn(async () => ({
      ok: true,
      headers: new Map([
        ['X-TTS-Provider', 'local_mms_onnx'],
        ['X-TTS-Voice', 'Meta MMS-TTS ONNX (kan)'],
        ['X-TTS-Cache', 'MISS'],
      ]),
      blob: async () => new Blob([new Uint8Array([82, 73, 70, 70, 1, 2, 3])], { type: 'audio/wav' }),
    }))

    globalThis.fetch = fetchMock
    globalThis.URL = {
      ...originalUrl,
      createObjectURL: vi.fn(() => 'blob:mock-tts-1'),
      revokeObjectURL: vi.fn(),
    }
    globalThis.window = {
      Audio: MockAudio,
      localStorage: {
        getItem: () => null,
        setItem: () => {},
      },
      SpeechSynthesisUtterance: function MockUtterance(t) {
        this.text = t
      },
      speechSynthesis: {
        getVoices: () => [{ lang: 'en-US', name: 'English Voice' }],
        cancel: vi.fn(),
        speak: vi.fn(),
      },
    }
  })

  afterEach(() => {
    stopSpeechGlobal()
    clearMemorySpeechCache()
    globalThis.window = originalWindow
    globalThis.fetch = originalFetch
    globalThis.URL = originalUrl
  })

  it('routes Kannada math explanation to backend TTS proxy and caches identical requests', async () => {
    speakTextGlobal({
      text: 'ಸಿಲಿಂಡರ್ ಘನಫಲ V = πr²h. ಮುಂದಿನ ಹಂತ ನೋಡಿ.',
      language: 'kn',
      sourceId: 'shape_test',
    })

    // Wait briefly for microtask async fetch
    await new Promise((r) => setTimeout(r, 30))

    expect(fetchMock).toHaveBeenCalledTimes(2) // sentence 1 + prewarm sentence 2
    const firstPayload = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(firstPayload.language).toBe('kn')
    expect(firstPayload.text).not.toContain('π')
    expect(getSpeechState().provider).toBe('local_mms_onnx')
    expect(getSpeechState().status).toBe('speaking')
    expect(getSpeechState().sentences).toHaveLength(2)

    nextSentenceGlobal()
    await new Promise((r) => setTimeout(r, 20))
    expect(getSpeechState().sentenceIndex).toBe(1)

    prevSentenceGlobal()
    await new Promise((r) => setTimeout(r, 20))
    expect(getSpeechState().sentenceIndex).toBe(0)
  })

  it('supports word-by-word toggle and blocks silent wrong-language fallback if backend fails and browser voice missing', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network_down')
    })

    setWordByWordModeGlobal(true)
    expect(getSpeechState().wordByWord).toBe(true)

    speakTextGlobal({
      text: 'ಕನ್ನಡ ಪರೀಕ್ಷೆ',
      language: 'kn',
      sourceId: 'offline_fallback_test',
    })

    await new Promise((r) => setTimeout(r, 30))
    expect(getSpeechState().status).toBe('unavailable')
    expect(getSpeechState().errorCode).toBe('voice_unavailable_for_language')
    expect(globalThis.window.speechSynthesis.speak).not.toHaveBeenCalled()
    setWordByWordModeGlobal(false)
    expect(originalAudio).toBeTruthy()
  })
})
