import { useEffect, useMemo, useRef, useState } from 'react'
import { getGuideTranslations } from '../data/guideAgentTranslations.js'
import {
  GUIDE_SPEECH_LANG_MAP,
  GUIDE_VOICE_OPTIONS,
  analyzeGuideIntent,
  buildPersonalizedGuideBrief,
  getModuleDirectory,
} from '../utils/guideAgentEngine.js'
import { stopSpeechGlobal } from '../utils/speechEngine.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'

/**
 * Floating NetFold AI Guide Agent providing:
 * - Honest local rule-based intent classification & cross-module navigation
 * - Role-aware welcome & quick switcher (Student / Teacher / Exam Aspirant)
 * - Real saved progress & weak-area personalized plan (never fabricated)
 * - 5-language support + Speech-to-Text mic (with browser fallback) + Text-to-Speech
 * - Non-blocking floating drawer & Website Tour launcher
 */
export default function NetFoldGuideAgent({
  isOpen,
  onSetOpen,
  language = 'en',
  activeAudience = 'student',
  onChangeAudience,
  profileData,
  learningProgress,
  missionsProgress,
  analytics,
  offlineLocker,
  onNavigateAction,
  onStartTour,
  theme = 'light',
}) {
  const gt = getGuideTranslations(language)
  const isDark = theme === 'dark'

  const [panelTab, setPanelTab] = useState('chat') // 'chat' | 'plan' | 'modules'
  const [inputValue, setInputValue] = useState('')
  const [voiceLang, setVoiceLang] = useState(() => language)
  const [isListening, setIsListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState('')

  const msgSeqRef = useRef(1)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const createInitialMessages = (langCode, role) => {
    const tLocal = getGuideTranslations(langCode)
    const starterRoleModules = getModuleDirectory(role, langCode).slice(0, 3)
    return [
      {
        id: 'guide_welcome_0',
        sender: 'guide',
        text: `${tLocal.welcomeGreeting} (${tLocal.roles[role]}: ${tLocal.roleDescriptions[role]})`,
        reason: tLocal.localEngineBadge,
        steps: [],
        actions: [
          { label: tLocal.tourButton, type: 'start_tour' },
          ...starterRoleModules.map((m) => ({ label: m.name, ...m.action })),
        ],
      },
    ]
  }

  const [messages, setMessages] = useState(() =>
    createInitialMessages(language, activeAudience),
  )

  const micSupported = useMemo(() => {
    if (typeof window === 'undefined') return false
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])

  const personalizedBrief = useMemo(
    () =>
      buildPersonalizedGuideBrief({
        role: activeAudience,
        profileData,
        learningProgress,
        missionsProgress,
        analytics,
        offlineLocker,
        language,
      }),
    [
      activeAudience,
      profileData,
      learningProgress,
      missionsProgress,
      analytics,
      offlineLocker,
      language,
    ],
  )

  const moduleDirectory = useMemo(
    () => getModuleDirectory(activeAudience, language),
    [activeAudience, language],
  )

  const suggestedList = gt.suggestedQueries?.[activeAudience] ?? gt.suggestedQueries.student

  useEffect(() => {
    if (isOpen && panelTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [messages.length, isOpen, panelTab])

  useEffect(() => {
    return () => {
      stopSpeechGlobal()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore stop errors during unmount
        }
      }
    }
  }, [])

  const submitQuery = (rawText) => {
    const trimmed = String(rawText ?? '').trim()
    if (!trimmed) return

    const userMsg = {
      id: `user_${msgSeqRef.current}`,
      sender: 'user',
      text: trimmed,
    }
    msgSeqRef.current += 1

    const result = analyzeGuideIntent(trimmed, {
      role: activeAudience,
      language,
      analytics,
      personalizedBrief,
    })

    if (result.roleSuggestion && result.roleSuggestion !== activeAudience) {
      onChangeAudience?.(result.roleSuggestion)
    }

    const guideMsg = {
      id: `guide_${msgSeqRef.current}`,
      sender: 'guide',
      text: result.reply,
      reason: result.explanationReason,
      steps: result.steps ?? [],
      actions: result.actions ?? [],
    }
    msgSeqRef.current += 1

    setMessages((prev) => [...prev, userMsg, guideMsg].slice(-30))
    setInputValue('')
    setPanelTab('chat')
  }

  const handleToggleMic = () => {
    if (!micSupported) {
      setVoiceNotice(gt.voice.micUnsupportedFallback)
      return
    }
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore stop errors
      }
      setIsListening(false)
      return
    }

    setVoiceNotice('')
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    try {
      const rec = new SpeechRec()
      rec.lang = GUIDE_SPEECH_LANG_MAP[voiceLang] ?? 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript ?? ''
        if (transcript.trim()) {
          submitQuery(transcript)
        }
      }
      rec.onerror = () => {
        setIsListening(false)
        setVoiceNotice(gt.voice.micUnsupportedFallback)
      }
      rec.onend = () => {
        setIsListening(false)
      }
      recognitionRef.current = rec
      setIsListening(true)
      rec.start()
    } catch {
      setIsListening(false)
      setVoiceNotice(gt.voice.micUnsupportedFallback)
    }
  }

  const handleActionClick = (action) => {
    if (!action) return
    if (action.type === 'start_tour') {
      onStartTour?.()
      return
    }
    onNavigateAction?.(action)
  }

  return (
    <div className="no-print">
      {/* Non-blocking Floating AI Guide Panel */}
      {isOpen && (
        <aside
          role="complementary"
          aria-label={gt.panelTitle}
          className={`fixed bottom-20 right-3 sm:right-5 z-40 flex w-[calc(100vw-1.5rem)] sm:w-[440px] max-h-[78dvh] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
            isDark
              ? 'border-cyan-500/40 bg-slate-900 text-slate-100'
              : 'border-indigo-200 bg-white text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-cyan-300 text-sm">
                  ✦
                </span>
                <h3 className="truncate text-sm font-extrabold">{gt.panelTitle}</h3>
              </div>
              <p className="mt-0.5 text-[10px] font-semibold text-cyan-200/90">
                {gt.localEngineBadge}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onStartTour?.()}
                className="rounded-lg border border-cyan-400/50 bg-cyan-500/20 px-2 py-1 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/30 transition cursor-pointer"
              >
                {gt.tourButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeechGlobal()
                  setMessages(createInitialMessages(language, activeAudience))
                }}
                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition cursor-pointer"
              >
                {gt.resetButton}
              </button>
              <button
                type="button"
                aria-label={gt.closeLabel}
                onClick={() => {
                  stopSpeechGlobal()
                  onSetOpen(false)
                }}
                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-extrabold text-white hover:bg-rose-500/80 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Role Switcher + Panel Subtabs */}
          <div
            className={`border-b px-3 py-2 space-y-2 ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold opacity-80">{gt.rolePrompt}</span>
              <div className="inline-flex rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5">
                {['student', 'teacher', 'exam'].map((roleKey) => {
                  const active = activeAudience === roleKey
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChangeAudience?.(roleKey)}
                      className={`rounded-md px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-700'
                            : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {gt.roles[roleKey]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {['chat', 'plan', 'modules'].map((tabKey) => {
                const selected = panelTab === tabKey
                return (
                  <button
                    key={tabKey}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPanelTab(tabKey)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selected
                        ? 'bg-slate-900 text-cyan-300 dark:bg-cyan-500 dark:text-slate-950'
                        : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {gt.tabs[tabKey]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Scrollable Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-3">
            {panelTab === 'chat' && (
              <>
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isGuide = msg.sender === 'guide'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isGuide ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs space-y-2 ${
                            isGuide
                              ? isDark
                                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                                : 'bg-slate-100 text-slate-900 border border-slate-200'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          <p className="font-medium">{msg.text}</p>

                          {isGuide && msg.reason && (
                            <p className="text-[10px] font-semibold opacity-75">
                              ℹ️ {msg.reason}
                            </p>
                          )}

                          {isGuide && msg.steps?.length > 0 && (
                            <ol className="list-decimal pl-4 space-y-0.5 text-[11px] opacity-90">
                              {msg.steps.map((s, idx) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ol>
                          )}

                          {isGuide && msg.actions?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.actions.map((act, idx) => (
                                <button
                                  key={`${msg.id}_act_${idx}`}
                                  type="button"
                                  onClick={() => handleActionClick(act)}
                                  className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
                                >
                                  → {act.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {isGuide && (
                            <div className="pt-1">
                              <SpeakControlsBar
                                compact
                                text={msg.text}
                                language={voiceLang}
                                sourceId={`guide_${msg.id}`}
                                isDark={isDark}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested Role Prompts */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold opacity-75">{gt.suggestedLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedList.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => submitQuery(q)}
                        className={`rounded-xl border px-2.5 py-1 text-left text-[11px] font-semibold transition cursor-pointer ${
                          isDark
                            ? 'border-slate-700 bg-slate-800/80 text-cyan-200 hover:bg-slate-800'
                            : 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {panelTab === 'plan' && (
              <div className="space-y-3">
                <div
                  className={`rounded-xl border p-3 space-y-2 ${
                    isDark
                      ? 'border-slate-700 bg-slate-800/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-extrabold">{gt.progressFactsTitle}</h4>
                  {!personalizedBrief.hasRealHistory && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900">
                      {gt.noDataNotice}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                      <div className="text-[10px] font-bold opacity-70">
                        {gt.completedStepsLabel}
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-extrabold text-emerald-600">
                        {personalizedBrief.completedCount} / {personalizedBrief.totalRoleSteps}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                      <div className="text-[10px] font-bold opacity-70">
                        {gt.incompleteStepsLabel}
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-extrabold text-indigo-600">
                        {personalizedBrief.incompleteSteps.length}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <div>
                      <span className="font-bold">{gt.weakAreasLabel}: </span>
                      <span>
                        {personalizedBrief.weakTopics.length > 0
                          ? personalizedBrief.weakTopics.join(', ')
                          : gt.weakAreasNone}
                      </span>
                    </div>
                    <div className="opacity-80">
                      Attempts: {personalizedBrief.totalAttempts}
                      {personalizedBrief.accuracyPct !== null
                        ? ` (${personalizedBrief.accuracyPct}% accuracy)`
                        : ''}{' '}
                      · Mistakes: {personalizedBrief.mistakeCount} · Offline Items:{' '}
                      {personalizedBrief.offlineSavedCount}
                    </div>
                  </div>
                </div>

                {/* Next Recommended Actions with "Why" */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold">{gt.nextBestStepLabel}</h4>
                  {personalizedBrief.recommendations.map((recItem) => (
                    <div
                      key={recItem.id}
                      className={`rounded-xl border p-3 space-y-1.5 ${
                        isDark
                          ? 'border-slate-700 bg-slate-800/60'
                          : 'border-indigo-200 bg-indigo-50/50'
                      }`}
                    >
                      <p className="text-[11px] font-semibold">
                        <span className="font-extrabold">{gt.whyRecommendedLabel}: </span>
                        {recItem.reason}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleActionClick(recItem.action)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
                      >
                        → {recItem.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {panelTab === 'modules' && (
              <div className="space-y-2">
                {moduleDirectory.map((mod) => (
                  <div
                    key={mod.id}
                    className={`rounded-xl border p-3 flex items-start justify-between gap-2 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800/60'
                        : 'border-slate-200 bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-extrabold">{mod.name}</h4>
                      <p className="text-[11px] leading-snug opacity-80">
                        {mod.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleActionClick(mod.action)}
                      className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
                    >
                      {gt.openActionPrefix}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voice Language + Speech-to-Text + Text Input Footer */}
          <div
            className={`border-t p-3 space-y-2 ${
              isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold">
                <span>{gt.voice.voiceLangLabel}:</span>
                <select
                  aria-label={gt.voice.voiceLangLabel}
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  {GUIDE_VOICE_OPTIONS.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleToggleMic}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  isListening
                    ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
                    : micSupported
                      ? isDark
                        ? 'border-cyan-600 bg-cyan-950/60 text-cyan-200'
                        : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                      : isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-400'
                        : 'border-slate-200 bg-slate-100 text-slate-500'
                }`}
              >
                {isListening
                  ? `⏹ ${gt.voice.micStopButton}`
                  : `🎙️ ${gt.voice.micStartButton}`}
              </button>
            </div>

            {isListening && (
              <p className="text-[11px] font-bold text-rose-600">
                {gt.voice.listeningLabel}
              </p>
            )}
            {voiceNotice && (
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                ℹ️ {voiceNotice}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitQuery(inputValue)
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={gt.inputPlaceholder}
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 disabled:opacity-45 transition cursor-pointer"
              >
                {gt.sendButton}
              </button>
            </form>
          </div>
        </aside>
      )}

      {/* Persistent Floating Guide Button */}
      <button
        type="button"
        data-tour="guide_fab"
        aria-expanded={isOpen}
        title={gt.fabTooltip}
        onClick={() => onSetOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-xl hover:bg-indigo-700 transition cursor-pointer"
      >
        <span aria-hidden="true" className="text-cyan-300 text-base leading-none">
          ✦
        </span>
        <span>{gt.fabLabel}</span>
      </button>
    </div>
  )
}
