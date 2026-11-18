import { getMultilingualContent } from '../../data/multilingualContentTranslations.js'
import { LANGUAGE_OPTIONS } from '../../data/translations.js'
import {
  SPEECH_LANG_BCP47,
  SPEECH_RATE_OPTIONS,
  nextSentenceGlobal,
  pauseSpeechGlobal,
  prevSentenceGlobal,
  replayCurrentSentenceGlobal,
  resumeSpeechGlobal,
  setSpeechRateGlobal,
  setWordByWordModeGlobal,
  speakTextGlobal,
  stopSpeechGlobal,
  useGlobalSpeechState,
} from '../../utils/speechEngine.js'

/**
 * Unified Global Multilingual Voice Controls Bar supporting:
 * - Backend Neural TTS (Google Cloud TTS / Bhashini / Local Meta MMS-TTS ONNX) + Strict Browser Fallback
 * - Play, Pause, Resume, Stop, Replay Current Sentence, Prev/Next Sentence Navigation
 * - Speaking Speed (0.8x–1.5x) & Word-by-Word Pronunciation Mode with live highlight
 * - Loading indicator, cache status badge, and honest error banner if all TTS paths fail
 */
export default function SpeakControlsBar({
  text,
  language,
  sourceId = 'global',
  compact = false,
  isDark = false,
  showSpeedSelector = true,
  className = '',
}) {
  const speech = useGlobalSpeechState()
  const activeLang = language || speech.activeLanguage || 'en'
  const mc = getMultilingualContent(activeLang)
  const vu = mc.voiceUi

  const isThisSource = speech.activeSourceId === sourceId
  const isThisLoading = isThisSource && speech.status === 'loading'
  const isThisSpeaking = isThisSource && speech.status === 'speaking'
  const isThisPaused = isThisSource && speech.status === 'paused'
  const isThisActive = isThisLoading || isThisSpeaking || isThisPaused
  const isThisUnavailable = isThisSource && speech.status === 'unavailable'

  const langLabel =
    LANGUAGE_OPTIONS.find((o) => o.code === activeLang)?.nativeLabel ?? activeLang
  const locale = SPEECH_LANG_BCP47[activeLang] ?? 'en-IN'
  const totalSentences = speech.sentences?.length ?? 0

  const handlePlayOrToggle = () => {
    if (isThisSpeaking) {
      pauseSpeechGlobal()
      return
    }
    if (isThisPaused) {
      resumeSpeechGlobal()
      return
    }
    speakTextGlobal({ text, language: activeLang, sourceId })
  }

  const renderErrorText = () => {
    if (speech.errorCode === 'speech_api_unavailable') return vu.noApiError
    return (vu.backendErrorBanner ?? vu.voiceMissingBanner)
      .replaceAll('{lang}', langLabel)
      .replaceAll('{locale}', locale)
  }

  if (compact) {
    return (
      <div className={`inline-flex flex-col items-end gap-1 ${className}`}>
        <div className="inline-flex items-center gap-1 print:hidden">
          <button
            type="button"
            disabled={!String(text ?? '').trim()}
            onClick={handlePlayOrToggle}
            title={
              isThisLoading
                ? vu.loadingVoice?.replace('{lang}', langLabel)
                : isThisSpeaking
                  ? vu.pause
                  : isThisPaused
                    ? vu.resume
                    : vu.speakExplanation
            }
            aria-label={vu.speakExplanation}
            className={`rounded-lg border px-2 py-0.5 text-[11px] font-extrabold transition cursor-pointer disabled:opacity-40 ${
              isThisLoading
                ? 'border-indigo-400 bg-indigo-100 text-indigo-900 animate-pulse'
                : isThisSpeaking
                  ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                  : isThisPaused
                    ? 'border-amber-400 bg-amber-100 text-amber-950'
                    : isDark
                      ? 'border-slate-700 bg-slate-800 text-cyan-300 hover:bg-slate-700'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            {isThisLoading ? '⏳' : isThisSpeaking ? '⏸' : isThisPaused ? '▶' : '🔊'}
          </button>

          {isThisActive && (
            <>
              <button
                type="button"
                onClick={stopSpeechGlobal}
                title={vu.stop}
                aria-label={vu.stop}
                className="rounded-lg border border-rose-300 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                ⏹
              </button>
              <button
                type="button"
                onClick={replayCurrentSentenceGlobal}
                title={vu.replaySentence ?? vu.replay}
                aria-label={vu.replaySentence ?? vu.replay}
                className="rounded-lg border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                ↻
              </button>
            </>
          )}
        </div>

        {isThisUnavailable && (
          <span className="max-w-[240px] rounded bg-amber-50 border border-amber-300 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 text-right">
            {renderErrorText()}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-2 print:hidden ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={!String(text ?? '').trim()}
          onClick={handlePlayOrToggle}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition cursor-pointer disabled:opacity-40 ${
            isThisLoading
              ? 'border-indigo-400 bg-indigo-100 text-indigo-950 animate-pulse'
              : isThisSpeaking
                ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                : isThisPaused
                  ? 'border-amber-400 bg-amber-300 text-slate-950'
                  : isDark
                    ? 'border-cyan-500/40 bg-slate-800 text-cyan-200 hover:bg-slate-700'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
          }`}
        >
          <span>{isThisLoading ? '⏳' : isThisSpeaking ? '⏸' : isThisPaused ? '▶' : '🔊'}</span>
          <span>
            {isThisLoading
              ? (vu.loadingVoice ?? 'Loading...').replace('{lang}', langLabel)
              : isThisSpeaking
                ? vu.pause
                : isThisPaused
                  ? vu.resume
                  : vu.speakExplanation}
          </span>
        </button>

        {isThisActive && (
          <>
            <button
              type="button"
              onClick={stopSpeechGlobal}
              className="rounded-xl border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition cursor-pointer"
            >
              ⏹ {vu.stop}
            </button>
            <button
              type="button"
              onClick={replayCurrentSentenceGlobal}
              title={vu.replaySentence ?? vu.replay}
              className={`rounded-xl border px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              ↻ {vu.replaySentence ?? vu.replay}
            </button>
          </>
        )}

        {/* Sentence-by-sentence Previous / Next navigation when active */}
        {isThisActive && totalSentences > 1 && (
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-300/60 dark:border-slate-700 px-1.5 py-0.5 text-[11px] font-bold">
            <button
              type="button"
              disabled={speech.sentenceIndex <= 0}
              onClick={prevSentenceGlobal}
              title={vu.prevSentence}
              className="px-1.5 py-0.5 disabled:opacity-35 cursor-pointer"
            >
              ◀
            </button>
            <span className="font-mono">
              {(vu.sentenceBadge ?? 'Sentence {i}/{n}')
                .replace('{i}', String(speech.sentenceIndex + 1))
                .replace('{n}', String(totalSentences))}
            </span>
            <button
              type="button"
              disabled={speech.sentenceIndex >= totalSentences - 1}
              onClick={nextSentenceGlobal}
              title={vu.nextSentence}
              className="px-1.5 py-0.5 disabled:opacity-35 cursor-pointer"
            >
              ▶
            </button>
          </div>
        )}

        {/* Word-by-word pronunciation mode toggle */}
        <button
          type="button"
          aria-pressed={speech.wordByWord}
          onClick={() => setWordByWordModeGlobal(!speech.wordByWord)}
          className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
            speech.wordByWord
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : isDark
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          🔤 {vu.wordModeLabel ?? 'Word-by-Word'}
        </button>

        {showSpeedSelector && (
          <label className="inline-flex items-center gap-1 text-[11px] font-bold">
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              {vu.speedLabel}:
            </span>
            <select
              aria-label={vu.speedLabel}
              value={speech.rate}
              onChange={(e) => setSpeechRateGlobal(Number(e.target.value))}
              className={`rounded-lg border px-1.5 py-1 text-[11px] font-mono font-bold ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              {SPEECH_RATE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </select>
          </label>
        )}

        {isThisActive && speech.activeVoiceName && (
          <span className="text-[10px] font-semibold opacity-80">
            {vu.activeVoicePrefix}: {speech.activeVoiceName}
            {speech.cacheHit ? ` · ${vu.cachedBadge ?? 'Cached'}` : ''}
          </span>
        )}
      </div>

      {/* Live Sentence & Word-by-Word Highlight Ribbon */}
      {isThisActive && speech.words?.length > 0 && (
        <div
          className={`rounded-xl border px-3 py-2 text-xs leading-relaxed flex flex-wrap gap-1 ${
            isDark
              ? 'border-cyan-500/30 bg-slate-900 text-slate-200'
              : 'border-indigo-200 bg-indigo-50/70 text-slate-900'
          }`}
        >
          {speech.words.map((w, idx) => (
            <span
              key={`${idx}_${w}`}
              className={`rounded px-1 transition ${
                idx === speech.currentWordIndex
                  ? 'bg-cyan-400 text-slate-950 font-extrabold'
                  : ''
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      )}

      {isThisUnavailable && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-900">
          ℹ️ {renderErrorText()}
        </p>
      )}
    </div>
  )
}
