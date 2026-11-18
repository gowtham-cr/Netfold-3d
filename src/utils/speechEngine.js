import { useSyncExternalStore } from 'react'
import {
  formatMathForSpeech,
  splitIntoSentences,
  splitIntoWords,
} from './mathSpeechFormatter.js'

export const LANGUAGE_STORAGE_KEY = 'netfold_lang'
export const AUTO_SPEAK_STORAGE_KEY = 'netfold_auto_speak_v1'
export const SPEECH_RATE_STORAGE_KEY = 'netfold_speech_rate_v1'

export const SPEECH_LANG_BCP47 = Object.freeze({
  en: 'en-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  hi: 'hi-IN',
})

export const SPEECH_RATE_OPTIONS = Object.freeze([0.8, 1, 1.25, 1.5])

const SUPPORTED_LANG_PREFIXES = Object.freeze({
  en: 'en',
  kn: 'kn',
  ta: 'ta',
  te: 'te',
  hi: 'hi',
})

export function loadAutoSpeakPreference() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(AUTO_SPEAK_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveAutoSpeakPreference(enabled) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUTO_SPEAK_STORAGE_KEY, String(Boolean(enabled)))
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function loadSpeechRatePreference() {
  if (typeof window === 'undefined') return 1
  try {
    const num = Number(window.localStorage.getItem(SPEECH_RATE_STORAGE_KEY))
    return SPEECH_RATE_OPTIONS.includes(num) ? num : 1
  } catch {
    return 1
  }
}

export function saveSpeechRatePreference(rate) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SPEECH_RATE_STORAGE_KEY, String(rate))
  } catch {
    // Ignore storage errors
  }
}

export function saveGlobalLanguagePreference(langCode) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, String(langCode))
  } catch {
    // Ignore storage errors
  }
}

export function loadGlobalLanguagePreference(fallback = 'en') {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return saved && SUPPORTED_LANG_PREFIXES[saved] ? saved : fallback
  } catch {
    return fallback
  }
}

export function hasSpeechSynthesisSupport() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.speechSynthesis) &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  )
}

/**
 * Inspects browser voices for the selected language.
 * Strictly avoids silently speaking in a mismatched language when a locale voice is missing.
 */
export function findVoiceForLanguage(langCode, explicitVoices = null) {
  const prefix = SUPPORTED_LANG_PREFIXES[langCode] ?? 'en'
  const bcp47 = SPEECH_LANG_BCP47[langCode] ?? 'en-IN'
  const hasApi = explicitVoices !== null || hasSpeechSynthesisSupport()

  if (!hasApi) {
    return {
      apiSupported: false,
      available: false,
      voice: null,
      voiceName: null,
      targetLocale: bcp47,
      reason: 'speech_api_unavailable',
    }
  }

  let voices = explicitVoices
  if (!voices && typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      voices = window.speechSynthesis.getVoices() ?? []
    } catch {
      voices = []
    }
  }
  const safeVoices = Array.isArray(voices) ? voices : []

  const exactMatch = safeVoices.find(
    (v) => String(v.lang ?? '').toLowerCase() === bcp47.toLowerCase(),
  )
  const prefixMatch =
    exactMatch ??
    safeVoices.find((v) =>
      String(v.lang ?? '')
        .toLowerCase()
        .startsWith(`${prefix}-`),
    ) ??
    safeVoices.find((v) => String(v.lang ?? '').toLowerCase() === prefix)

  if (prefixMatch) {
    return {
      apiSupported: true,
      available: true,
      voice: prefixMatch,
      voiceName: prefixMatch.name || bcp47,
      targetLocale: prefixMatch.lang || bcp47,
      reason: 'matched',
    }
  }

  if (safeVoices.length > 0) {
    return {
      apiSupported: true,
      available: false,
      voice: null,
      voiceName: null,
      targetLocale: bcp47,
      reason: 'voice_unavailable_for_language',
    }
  }

  if (prefix === 'en') {
    return {
      apiSupported: true,
      available: true,
      voice: null,
      voiceName: bcp47,
      targetLocale: bcp47,
      reason: 'default_locale_fallback',
    }
  }

  return {
    apiSupported: true,
    available: false,
    voice: null,
    voiceName: null,
    targetLocale: bcp47,
    reason: 'voice_unavailable_for_language',
  }
}

// =========================================================================
// UNIFIED MULTILINGUAL SPEECH COORDINATOR (BACKEND NEURAL + BROWSER FALLBACK)
// =========================================================================

const AUDIO_CACHE_LIMIT = 80
const memoryAudioCache = new Map() // cacheKey -> { url, provider, voiceName }

let activeAudioEl = null
let activeAbortController = null
let wordProgressTimer = null
let playbackSessionSeq = 0

let speechState = {
  status: 'idle', // 'idle' | 'loading' | 'speaking' | 'paused' | 'unavailable'
  activeLanguage: loadGlobalLanguagePreference('en'),
  activeSourceId: null,
  lastText: '',
  lastLang: 'en',
  sentences: [],
  sentenceIndex: 0,
  words: [],
  currentWordIndex: -1,
  wordByWord: false,
  activeVoiceName: null,
  provider: null, // 'local_mms_onnx' | 'google_cloud_tts' | 'bhashini_ulca' | 'browser_speech'
  cacheHit: false,
  errorCode: null,
  autoSpeak: loadAutoSpeakPreference(),
  rate: loadSpeechRatePreference(),
}

const listeners = new Set()

function notifyListeners() {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeSpeechState(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSpeechState() {
  return speechState
}

export function useGlobalSpeechState() {
  return useSyncExternalStore(subscribeSpeechState, getSpeechState, getSpeechState)
}

function clearTimersAndActiveMedia() {
  if (wordProgressTimer) {
    clearInterval(wordProgressTimer)
    wordProgressTimer = null
  }
  if (activeAbortController) {
    try {
      activeAbortController.abort()
    } catch {
      // Ignore abort errors
    }
    activeAbortController = null
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.onended = null
      activeAudioEl.onerror = null
      activeAudioEl.pause()
      activeAudioEl.src = ''
    } catch {
      // Ignore audio teardown errors
    }
    activeAudioEl = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore cancel errors
    }
  }
}

export function clearMemorySpeechCache() {
  for (const item of memoryAudioCache.values()) {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(item.url)
      } catch {
        // Ignore revoke error
      }
    }
  }
  memoryAudioCache.clear()
}

export function setGlobalSpeechLanguage(langCode) {
  saveGlobalLanguagePreference(langCode)
  playbackSessionSeq += 1
  clearTimersAndActiveMedia()
  speechState = {
    ...speechState,
    activeLanguage: langCode,
    status: 'idle',
    currentWordIndex: -1,
    errorCode: null,
  }
  notifyListeners()
}

export function setAutoSpeakGlobal(enabled) {
  const next = Boolean(enabled)
  saveAutoSpeakPreference(next)
  speechState = { ...speechState, autoSpeak: next }
  notifyListeners()
}

export function setSpeechRateGlobal(nextRate) {
  const safeRate = SPEECH_RATE_OPTIONS.includes(Number(nextRate)) ? Number(nextRate) : 1
  saveSpeechRatePreference(safeRate)
  if (activeAudioEl) {
    try {
      activeAudioEl.playbackRate = safeRate
    } catch {
      // Ignore playbackRate errors
    }
  }
  speechState = { ...speechState, rate: safeRate }
  notifyListeners()
}

export function setWordByWordModeGlobal(enabled) {
  speechState = { ...speechState, wordByWord: Boolean(enabled) }
  notifyListeners()
}

export function stopSpeechGlobal() {
  playbackSessionSeq += 1
  clearTimersAndActiveMedia()
  speechState = {
    ...speechState,
    status: 'idle',
    currentWordIndex: -1,
    errorCode: null,
  }
  notifyListeners()
}

export function pauseSpeechGlobal() {
  if (speechState.status !== 'speaking') return

  if (activeAudioEl) {
    try {
      activeAudioEl.pause()
      speechState = { ...speechState, status: 'paused' }
      notifyListeners()
      return
    } catch {
      stopSpeechGlobal()
      return
    }
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.pause()
      speechState = { ...speechState, status: 'paused' }
      notifyListeners()
    } catch {
      stopSpeechGlobal()
    }
  }
}

export function resumeSpeechGlobal() {
  if (speechState.status !== 'paused') return

  if (activeAudioEl) {
    try {
      activeAudioEl.playbackRate = speechState.rate
      const playPromise = activeAudioEl.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => replayCurrentSentenceGlobal())
      }
      speechState = { ...speechState, status: 'speaking' }
      notifyListeners()
      return
    } catch {
      replayCurrentSentenceGlobal()
      return
    }
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.resume()
      speechState = { ...speechState, status: 'speaking' }
      notifyListeners()
    } catch {
      replaySpeechGlobal()
    }
  }
}

async function fetchBackendTtsAudio({ spokenText, language, signal }) {
  const cacheKey = `${language}|${spokenText}`
  if (memoryAudioCache.has(cacheKey)) {
    return { ...memoryAudioCache.get(cacheKey), cacheHit: true }
  }

  if (
    typeof fetch !== 'function' ||
    typeof window === 'undefined' ||
    typeof window.Audio === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    throw new Error('browser_audio_api_unavailable')
  }

  const res = await fetch('/api/tts/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: spokenText, language, rate: 1 }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`tts_backend_http_${res.status}`)
  }

  const blob = await res.blob()
  if (!blob || blob.size === 0) {
    throw new Error('tts_backend_empty_audio')
  }

  const objectUrl = URL.createObjectURL(blob)
  const provider = res.headers.get('X-TTS-Provider') || 'local_mms_onnx'
  const voiceName = res.headers.get('X-TTS-Voice') || `${provider} (${language})`

  if (memoryAudioCache.size >= AUDIO_CACHE_LIMIT) {
    const oldestKey = memoryAudioCache.keys().next().value
    const oldestVal = memoryAudioCache.get(oldestKey)
    memoryAudioCache.delete(oldestKey)
    if (oldestVal?.url) URL.revokeObjectURL(oldestVal.url)
  }
  const entry = { url: objectUrl, provider, voiceName }
  memoryAudioCache.set(cacheKey, entry)
  return {
    ...entry,
    cacheHit: res.headers.get('X-TTS-Cache') === 'HIT',
  }
}

function speakWithBrowserFallback({
  spokenText,
  language,
  sourceId,
  explicitVoices = null,
  onComplete,
}) {
  const voiceCheck = findVoiceForLanguage(language, explicitVoices)
  if (!voiceCheck.apiSupported || !voiceCheck.available) {
    speechState = {
      ...speechState,
      status: 'unavailable',
      activeSourceId: sourceId,
      activeVoiceName: null,
      provider: null,
      errorCode: voiceCheck.reason,
    }
    notifyListeners()
    return { started: false, reason: voiceCheck.reason }
  }

  try {
    const utterance = new window.SpeechSynthesisUtterance(spokenText)
    utterance.lang = voiceCheck.targetLocale
    if (voiceCheck.voice) utterance.voice = voiceCheck.voice
    utterance.rate = speechState.wordByWord
      ? Math.max(0.65, speechState.rate * 0.8)
      : speechState.rate

    utterance.onend = () => {
      if (speechState.activeSourceId === sourceId) {
        if (typeof onComplete === 'function') {
          onComplete()
        } else {
          speechState = { ...speechState, status: 'idle', currentWordIndex: -1 }
          notifyListeners()
        }
      }
    }
    utterance.onerror = () => {
      if (speechState.activeSourceId === sourceId) {
        speechState = { ...speechState, status: 'idle', currentWordIndex: -1 }
        notifyListeners()
      }
    }

    speechState = {
      ...speechState,
      status: 'speaking',
      activeSourceId: sourceId,
      activeVoiceName: voiceCheck.voiceName,
      provider: 'browser_speech',
      cacheHit: false,
      errorCode: null,
    }
    notifyListeners()
    window.speechSynthesis.speak(utterance)
    return { started: true, voiceName: voiceCheck.voiceName, provider: 'browser_speech' }
  } catch {
    speechState = {
      ...speechState,
      status: 'unavailable',
      errorCode: 'speech_api_unavailable',
    }
    notifyListeners()
    return { started: false, reason: 'speech_api_unavailable' }
  }
}

async function playSingleBackendUnit({
  spokenUnitText,
  language,
  sourceId,
  sessionSeq,
  onComplete,
}) {
  const controller = new AbortController()
  activeAbortController = controller

  speechState = {
    ...speechState,
    status: 'loading',
    activeSourceId: sourceId,
    errorCode: null,
  }
  notifyListeners()

  const fetched = await fetchBackendTtsAudio({
    spokenText: spokenUnitText,
    language,
    signal: controller.signal,
  })
  if (sessionSeq !== playbackSessionSeq) return

  const audio = new window.Audio(fetched.url)
  activeAudioEl = audio
  audio.playbackRate = speechState.wordByWord
    ? Math.max(0.65, speechState.rate * 0.85)
    : speechState.rate

  audio.onloadedmetadata = () => {
    if (sessionSeq !== playbackSessionSeq) return
    const durMs = Math.max(400, (audio.duration || 2) * 1000 / audio.playbackRate)
    if (!speechState.wordByWord && speechState.words.length > 0) {
      const stepMs = Math.max(110, durMs / speechState.words.length)
      let wIdx = 0
      speechState = { ...speechState, currentWordIndex: 0 }
      notifyListeners()
      wordProgressTimer = setInterval(() => {
        if (sessionSeq !== playbackSessionSeq || speechState.status !== 'speaking') return
        wIdx += 1
        if (wIdx < speechState.words.length) {
          speechState = { ...speechState, currentWordIndex: wIdx }
          notifyListeners()
        } else {
          clearInterval(wordProgressTimer)
          wordProgressTimer = null
        }
      }, stepMs)
    }
  }

  audio.onended = () => {
    if (wordProgressTimer) {
      clearInterval(wordProgressTimer)
      wordProgressTimer = null
    }
    if (sessionSeq !== playbackSessionSeq) return
    onComplete?.()
  }

  audio.onerror = () => {
    if (sessionSeq !== playbackSessionSeq) return
    stopSpeechGlobal()
  }

  speechState = {
    ...speechState,
    status: 'speaking',
    activeSourceId: sourceId,
    activeVoiceName: fetched.voiceName,
    provider: fetched.provider,
    cacheHit: fetched.cacheHit,
    errorCode: null,
  }
  notifyListeners()
  await audio.play()
}

function playWordSequenceViaBackend({
  words,
  language,
  sourceId,
  sessionSeq,
  wordIdx = 0,
  onSentenceFinished,
}) {
  if (sessionSeq !== playbackSessionSeq) return
  if (wordIdx >= words.length) {
    onSentenceFinished?.()
    return
  }

  const wordText = formatMathForSpeech(words[wordIdx], language) || words[wordIdx]
  speechState = { ...speechState, currentWordIndex: wordIdx }
  notifyListeners()

  playSingleBackendUnit({
    spokenUnitText: wordText,
    language,
    sourceId,
    sessionSeq,
    onComplete: () => {
      if (sessionSeq !== playbackSessionSeq) return
      setTimeout(() => {
        playWordSequenceViaBackend({
          words,
          language,
          sourceId,
          sessionSeq,
          wordIdx: wordIdx + 1,
          onSentenceFinished,
        })
      }, 150)
    },
  }).catch(() => {
    if (sessionSeq !== playbackSessionSeq) return
    // Fallback cleanly to browser voice if backend unavailable
    speakWithBrowserFallback({
      spokenText: words.join(' '),
      language,
      sourceId,
      onComplete: onSentenceFinished,
    })
  })
}

function runSentencePlayback(targetSentenceIdx) {
  const sentences = speechState.sentences
  if (!sentences.length || targetSentenceIdx < 0 || targetSentenceIdx >= sentences.length) {
    stopSpeechGlobal()
    return
  }

  const sessionSeq = ++playbackSessionSeq
  clearTimersAndActiveMedia()

  const rawSentence = sentences[targetSentenceIdx]
  const spokenSentence = formatMathForSpeech(rawSentence, speechState.lastLang)
  const words = splitIntoWords(spokenSentence)

  speechState = {
    ...speechState,
    sentenceIndex: targetSentenceIdx,
    words,
    currentWordIndex: speechState.wordByWord ? 0 : -1,
  }
  notifyListeners()

  const handleSentenceDone = () => {
    if (sessionSeq !== playbackSessionSeq) return
    const nextIdx = targetSentenceIdx + 1
    if (nextIdx < sentences.length) {
      runSentencePlayback(nextIdx)
    } else {
      speechState = {
        ...speechState,
        status: 'idle',
        currentWordIndex: -1,
      }
      notifyListeners()
    }
  }

  // Silently pre-warm next sentence audio while current sentence starts playing
  if (!speechState.wordByWord && targetSentenceIdx + 1 < sentences.length) {
    const nextSpoken = formatMathForSpeech(
      sentences[targetSentenceIdx + 1],
      speechState.lastLang,
    )
    fetchBackendTtsAudio({
      spokenText: nextSpoken,
      language: speechState.lastLang,
    }).catch(() => {})
  }

  if (speechState.wordByWord && words.length > 0 && words.length <= 40) {
    playWordSequenceViaBackend({
      words,
      language: speechState.lastLang,
      sourceId: speechState.activeSourceId,
      sessionSeq,
      wordIdx: 0,
      onSentenceFinished: handleSentenceDone,
    })
    return
  }

  playSingleBackendUnit({
    spokenUnitText: spokenSentence,
    language: speechState.lastLang,
    sourceId: speechState.activeSourceId,
    sessionSeq,
    onComplete: handleSentenceDone,
  }).catch(() => {
    if (sessionSeq !== playbackSessionSeq) return
    speakWithBrowserFallback({
      spokenText: spokenSentence,
      language: speechState.lastLang,
      sourceId: speechState.activeSourceId,
      onComplete: handleSentenceDone,
    })
  })
}

export function nextSentenceGlobal() {
  if (!speechState.sentences.length) return
  const nextIdx = Math.min(speechState.sentences.length - 1, speechState.sentenceIndex + 1)
  runSentencePlayback(nextIdx)
}

export function prevSentenceGlobal() {
  if (!speechState.sentences.length) return
  const prevIdx = Math.max(0, speechState.sentenceIndex - 1)
  runSentencePlayback(prevIdx)
}

export function replayCurrentSentenceGlobal() {
  if (!speechState.sentences.length) {
    return replaySpeechGlobal()
  }
  runSentencePlayback(speechState.sentenceIndex)
  return { started: true }
}

/**
 * Starts speaking text in the selected language, cancelling any prior playback immediately.
 * Formats mathematical expressions cleanly, routes non-browser neural speech via the backend proxy
 * with matching-voice browser SpeechSynthesis fallback, and never speaks silently in the wrong language.
 */
export function speakTextGlobal({
  text,
  language = 'en',
  sourceId = 'global',
  explicitVoices = null,
  preferBrowserSync = false,
}) {
  const cleanText = String(text ?? '').trim()
  if (!cleanText) return { started: false, reason: 'empty_text' }

  playbackSessionSeq += 1
  clearTimersAndActiveMedia()

  const sentences = splitIntoSentences(cleanText)
  const firstSpoken = formatMathForSpeech(sentences[0] || cleanText, language)
  const words = splitIntoWords(firstSpoken)

  speechState = {
    ...speechState,
    activeLanguage: language,
    activeSourceId: sourceId,
    lastText: cleanText,
    lastLang: language,
    sentences,
    sentenceIndex: 0,
    words,
    currentWordIndex: -1,
    errorCode: null,
  }

  // Synchronous explicit browser-only test / direct-fallback path
  if (explicitVoices !== null || preferBrowserSync) {
    return speakWithBrowserFallback({
      spokenText: formatMathForSpeech(cleanText, language),
      language,
      sourceId,
      explicitVoices,
    })
  }

  // Live runtime: route via shared sentence runner (backend neural TTS first -> browser voice fallback)
  if (typeof fetch === 'function' && typeof window !== 'undefined' && typeof window.Audio !== 'undefined') {
    runSentencePlayback(0)
    return {
      started: true,
      mode: speechState.wordByWord ? 'backend_word_by_word' : 'backend_async',
    }
  }

  return speakWithBrowserFallback({
    spokenText: formatMathForSpeech(cleanText, language),
    language,
    sourceId,
  })
}

export function replaySpeechGlobal() {
  if (!speechState.lastText) return { started: false, reason: 'no_previous_text' }
  const isBrowserSync =
    typeof window !== 'undefined' &&
    (!window.Audio || speechState.provider === 'browser_speech')
  return speakTextGlobal({
    text: speechState.lastText,
    language: speechState.lastLang,
    sourceId: speechState.activeSourceId ?? 'replay',
    preferBrowserSync: isBrowserSync,
  })
}
