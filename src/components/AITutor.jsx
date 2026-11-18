import { useEffect, useMemo, useRef, useState } from 'react'
import { SHAPES } from '../utils/mathEngine.js'
import {
  getTutorConnectionStatus,
  requestTutorResponse,
} from '../utils/tutorEngine.js'

const STORAGE_KEY = 'netfold_tutor_history_v1'
const SESSION_NONCE = Math.random().toString(36).slice(2, 7)
let messageSeq = 0

function createMessageId(prefix) {
  messageSeq += 1
  return `${prefix}-${SESSION_NONCE}-${messageSeq}`
}

function fmt(val) {
  if (val === null || val === undefined) return '—'
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

function loadMessages() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(-40) : []
  } catch {
    return []
  }
}

function saveMessages(messages) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)))
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

function renderFormattedLine(line, idx) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
      {parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={pIdx}>{part}</span>
      })}
    </p>
  )
}

/**
 * Interactive AI Tutor tab with message history, 5-language support, live shape context,
 * suggested prompts, clear honesty about Demo vs Live AI mode, and key-free backend proxy adapter.
 */
export default function AITutor({
  language,
  shape,
  dimensionsByShape,
  mensuration,
  unit,
  translations: t,
  onOpenShapeIn3D,
}) {
  const [messages, setMessages] = useState(loadMessages)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showArchInfo, setShowArchInfo] = useState(false)

  const endRef = useRef(null)
  const connection = useMemo(() => getTutorConnectionStatus(), [])
  const tt = t.tutor
  const lenU = t.unitSymbols[unit].length
  const areaU = t.unitSymbols[unit].area
  const volU = t.unitSymbols[unit].volume

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length])

  const activeDims = dimensionsByShape[shape]
  const activeDimsText = Object.entries(activeDims)
    .map(([key, val]) => `${key} = ${val} ${lenU}`)
    .join(', ')

  const suggestedPrompts = useMemo(() => {
    const shapeLabel = t.shapes[shape]
    return Object.values(tt.suggested).map((tpl) =>
      tpl.replace('{shape}', shapeLabel),
    )
  }, [tt.suggested, t.shapes, shape])

  const handleAsk = async (rawQuestion) => {
    const clean = String(rawQuestion ?? '').trim()
    if (!clean || isSending) return

    const userMsg = {
      id: createMessageId('u'),
      role: 'user',
      content: clean,
    }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    saveMessages(nextHistory)
    setInputValue('')
    setIsSending(true)

    const response = await requestTutorResponse(clean, {
      language,
      activeShape: shape,
      dimensionsByShape,
      unit,
      history: nextHistory,
    })

    const botMsg = {
      id: createMessageId('a'),
      role: 'assistant',
      content: response.reply,
      mode: response.mode,
      fallbackFromError: Boolean(response.fallbackFromError),
      targetShape: response.targetShape ?? shape,
    }

    const updated = [...nextHistory, botMsg]
    setMessages(updated)
    saveMessages(updated)
    setIsSending(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleAsk(inputValue)
  }

  const handleClearChat = () => {
    setMessages([])
    saveMessages([])
  }

  const lsaText =
    mensuration.lsa === null
      ? '—'
      : `${fmt(mensuration.lsa)} ${areaU}`

  return (
    <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:grid lg:grid-cols-12">
        {/* Left Sidebar: Demo/Live Honesty Notice, Security Architecture, Live Shape Context & Suggestions */}
        <aside className="flex flex-col gap-4 lg:col-span-4">
          {/* Header & Honest Status Notice */}
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {tt.headerTitle}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {tt.headerSubtitle}
                </p>
              </div>
              <span
                data-testid="tutor-mode-badge"
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
                  connection.hasLiveEndpoint
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-300'
                    : 'bg-amber-50 text-amber-900 ring-amber-300'
                }`}
              >
                {connection.hasLiveEndpoint ? tt.liveBadge : tt.demoBadge}
              </span>
            </div>

            {!connection.hasLiveEndpoint && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                <p className="font-bold">{tt.demoNoticeTitle}</p>
                <p className="mt-1 leading-relaxed text-amber-900">
                  {tt.demoNoticeBody}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowArchInfo((prev) => !prev)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              {showArchInfo ? tt.archToggleHide : tt.archToggleShow}
            </button>

            {showArchInfo && (
              <div className="mt-2 flex flex-col gap-1.5 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
                <p className="font-bold text-slate-900">{tt.archTitle}</p>
                <p>{tt.archSteps.s1}</p>
                <p>{tt.archSteps.s2}</p>
                <p>{tt.archSteps.s3}</p>
              </div>
            )}
          </section>

          {/* Current Selected Shape Context */}
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                {tt.contextTitle}
              </h3>
              {onOpenShapeIn3D && (
                <button
                  type="button"
                  onClick={() => onOpenShapeIn3D(shape)}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
                >
                  {tt.openExplorerButton}
                </button>
              )}
            </div>

            <p className="mt-1.5 text-sm font-extrabold text-slate-900">
              {t.shapes[shape]}
            </p>
            <p className="font-mono text-xs font-semibold text-indigo-700">
              {activeDimsText}
            </p>

            <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
              <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200/80">
                <div className="font-sans text-[10px] font-bold text-slate-500">
                  {shape === SHAPES.CYLINDER || shape === SHAPES.HEMISPHERE
                    ? 'CSA'
                    : 'LSA'}
                </div>
                <div className="font-bold text-slate-900">{lsaText}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200/80">
                <div className="font-sans text-[10px] font-bold text-slate-500">
                  TSA
                </div>
                <div className="font-bold text-slate-900">
                  {fmt(mensuration.tsa)} {areaU}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200/80">
                <div className="font-sans text-[10px] font-bold text-slate-500">
                  V
                </div>
                <div className="font-bold text-slate-900">
                  {fmt(mensuration.volume)} {volU}
                </div>
              </div>
            </div>
          </section>

          {/* Suggested Question Chips */}
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
              {tt.suggestedTitle}
            </h3>
            <div className="flex flex-col gap-1.5">
              {suggestedPrompts.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  disabled={isSending}
                  onClick={() => handleAsk(promptText)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50/70 disabled:opacity-50"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Right Main Area: Chat History + Composer */}
        <section
          aria-label={tt.headerTitle}
          className="flex min-h-[480px] flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:col-span-8 lg:h-[calc(100dvh-110px)]"
        >
          {/* Chat Top Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-800">
                {connection.hasLiveEndpoint ? tt.liveBadge : tt.demoBadge}
              </span>
            </div>
            <button
              type="button"
              disabled={messages.length === 0 || isSending}
              onClick={handleClearChat}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {tt.clearChat}
            </button>
          </div>

          {/* Scrollable Message History */}
          <div
            role="log"
            aria-live="polite"
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          >
            {messages.length === 0 ? (
              <div className="m-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
                <p className="text-sm font-extrabold text-slate-900">
                  {tt.emptyTitle}
                </p>
                <p className="text-xs leading-relaxed text-slate-600">
                  {tt.emptyBody}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user'
                if (isUser) {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-xs leading-relaxed font-medium text-white shadow-sm sm:text-sm">
                        <div className="mb-0.5 text-[10px] font-bold text-indigo-200 uppercase">
                          {tt.studentLabel}
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 shadow-xs sm:text-sm">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            msg.mode === 'live'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {msg.mode === 'live'
                            ? tt.liveMessageTag
                            : tt.demoMessageTag}
                        </span>
                        {msg.targetShape && t.shapes[msg.targetShape] && (
                          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                            {t.shapes[msg.targetShape]}
                          </span>
                        )}
                      </div>

                      {msg.fallbackFromError && (
                        <p className="mb-2 rounded-lg bg-amber-100/80 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900">
                          {tt.fallbackFromErrorBanner}
                        </p>
                      )}

                      <div className="flex flex-col gap-0.5">
                        {msg.content.split('\n').map(renderFormattedLine)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                  {tt.thinkingText}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Composer Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/70 p-3"
          >
            <input
              type="text"
              value={inputValue}
              disabled={isSending}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={tt.inputPlaceholder}
              aria-label={tt.inputPlaceholder}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
            >
              {tt.sendButton}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
