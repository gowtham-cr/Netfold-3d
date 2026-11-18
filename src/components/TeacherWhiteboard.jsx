import { useMemo, useRef, useState } from 'react'
import { getTeacherStudioExtended } from '../data/teacherStudioTranslations.js'
import { stopSpeechGlobal } from '../utils/speechEngine.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'

const QUICK_MATH_SYMBOLS = ['π', 'r²', 'r³', '√(', '⅓', '⅔', '⁴⁄₃', '²²⁄₇', 'cm²', 'cm³', '×', '=']

/**
 * Interactive Digital Teaching Whiteboard supporting step-by-step pedagogical reveal
 * (1–10 steps with Previous/Next/Show Complete), clickable highlight values, pinned equations,
 * teacher annotations, geometric sketchpad (HTML5 canvas + quick diagram stamps), and TTS.
 */
export default function TeacherWhiteboard({
  solved,
  language = 'en',
  isDark = false,
  classroomMode = 'teacher', // 'teacher' | 'student'
  revealedSteps,
  onSetRevealedSteps,
  teacherNotes = '',
  onChangeTeacherNotes,
  onResetBoardExtras,
  onPrintHandout,
}) {
  const tx = getTeacherStudioExtended(language)
  const steps = useMemo(() => (solved?.supported ? solved.steps ?? [] : []), [solved])

  const [pinnedExprs, setPinnedExprs] = useState([])
  const [exprInput, setExprInput] = useState('')
  const [highlightedKeys, setHighlightedKeys] = useState(() => ({}))
  const [hintVisible, setHintVisible] = useState(false)

  // Geometric Sketchpad state
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)

  // Sketchpad drawing helpers
  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / Math.max(1, rect.width)
    const scaleY = canvas.height / Math.max(1, rect.height)
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    isDrawingRef.current = true
    const pt = getCanvasPoint(e)
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
  }

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const pt = getCanvasPoint(e)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
  }

  const handlePointerUp = () => {
    isDrawingRef.current = false
  }

  const clearSketchCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const stampGeometricDiagram = (kind) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#22d3ee'
    ctx.fillStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.font = 'bold 12px monospace'

    if (kind === 'cylinder') {
      ctx.beginPath()
      ctx.ellipse(160, 42, 48, 14, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(112, 42)
      ctx.lineTo(112, 132)
      ctx.moveTo(208, 42)
      ctx.lineTo(208, 132)
      ctx.ellipse(160, 132, 48, 14, 0, 0, Math.PI)
      ctx.stroke()
      ctx.strokeStyle = '#fbbf24'
      ctx.beginPath()
      ctx.moveTo(160, 42)
      ctx.lineTo(208, 42)
      ctx.moveTo(160, 42)
      ctx.lineTo(160, 132)
      ctx.stroke()
      ctx.fillText('r', 180, 36)
      ctx.fillText('h', 148, 92)
    } else if (kind === 'cone') {
      ctx.beginPath()
      ctx.moveTo(160, 26)
      ctx.lineTo(108, 136)
      ctx.moveTo(160, 26)
      ctx.lineTo(212, 136)
      ctx.ellipse(160, 136, 52, 14, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = '#fbbf24'
      ctx.beginPath()
      ctx.moveTo(160, 26)
      ctx.lineTo(160, 136)
      ctx.lineTo(212, 136)
      ctx.stroke()
      ctx.fillText('h', 148, 92)
      ctx.fillText('r', 184, 152)
      ctx.fillText('l', 194, 78)
    } else {
      ctx.strokeRect(104, 46, 112, 86)
      ctx.strokeRect(128, 28, 112, 86)
      ctx.beginPath()
      ctx.moveTo(104, 46)
      ctx.lineTo(128, 28)
      ctx.moveTo(216, 46)
      ctx.lineTo(240, 28)
      ctx.moveTo(216, 132)
      ctx.lineTo(240, 114)
      ctx.moveTo(104, 132)
      ctx.lineTo(128, 114)
      ctx.stroke()
      ctx.fillText('l', 160, 148)
      ctx.fillText('h', 90, 92)
    }
  }

  const handleResetAllBoard = () => {
    setPinnedExprs([])
    setExprInput('')
    setHighlightedKeys({})
    setHintVisible(false)
    clearSketchCanvas()
    stopSpeechGlobal()
    onSetRevealedSteps(classroomMode === 'student' ? 0 : 1)
    onResetBoardExtras?.()
  }

  const maxSteps = steps.length
  const visibleSteps = steps.slice(0, Math.min(revealedSteps, maxSteps))
  const currentActiveStep =
    visibleSteps.length > 0 ? visibleSteps[visibleSteps.length - 1] : null

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
        isDark
          ? 'border-cyan-500/30 bg-slate-950 text-slate-100'
          : 'border-slate-800 bg-slate-900 text-slate-100'
      }`}
    >
      {/* Whiteboard Header + Stepper Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-cyan-300">
            🧑‍🏫 {tx.whiteboard.title}
          </h3>
          {solved?.supported && (
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-300">
                {solved.localizedShapeName ?? solved.topic} ·{' '}
                {tx.stepControls.stepCounter
                  .replace('{shown}', String(visibleSteps.length))
                  .replace('{total}', String(maxSteps))}
              </p>
              {solved.languageNotice && language !== 'en' && (
                <p className="text-[10px] font-medium text-cyan-200/90">
                  ℹ️ {solved.languageNotice}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {onPrintHandout && solved?.supported && (
            <button
              type="button"
              onClick={onPrintHandout}
              className="rounded-lg border border-emerald-500/50 bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-900 cursor-pointer"
            >
              🖨 {tx.printHandoutBtn}
            </button>
          )}
          <button
            type="button"
            onClick={handleResetAllBoard}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            ↺ {tx.whiteboard.resetBoard}
          </button>
        </div>
      </div>

      {/* Unsupported / Clarification Banner */}
      {solved && !solved.supported && (
        <div className="rounded-xl border border-amber-400/60 bg-amber-950/50 p-3.5 text-xs font-semibold text-amber-200">
          ⚠️ {solved.message}
        </div>
      )}

      {/* Interactive Highlighted Values Bar */}
      {solved?.supported && solved.extractedValues && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400">
            {tx.whiteboard.highlightValuesLabel}:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(solved.extractedValues).map(([k, val]) => {
              const glowing = Boolean(highlightedKeys[k])
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={glowing}
                  onClick={() =>
                    setHighlightedKeys((prev) => ({ ...prev, [k]: !prev[k] }))
                  }
                  className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition cursor-pointer ${
                    glowing
                      ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.65)]'
                      : 'border-slate-700 bg-slate-800 text-cyan-300 hover:border-cyan-400'
                  }`}
                >
                  {k}: {val}
                </button>
              )
            })}
            <span className="rounded-lg border border-indigo-500/50 bg-indigo-950/70 px-2.5 py-1 font-mono text-xs font-bold text-indigo-200">
              {solved.formulaSummary}
            </span>
          </div>
        </div>
      )}

      {/* Student Practice Mode Hint / Reveal Gate */}
      {solved?.supported && classroomMode === 'student' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/50 p-3">
          <button
            type="button"
            onClick={() => setHintVisible((v) => !v)}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
          >
            💡 {tx.studentPractice.showHint}
          </button>
          <button
            type="button"
            onClick={() => onSetRevealedSteps(maxSteps)}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
          >
            ✓ {tx.studentPractice.revealAnswer}
          </button>
          {hintVisible && (
            <p className="w-full text-xs font-semibold text-amber-200 pt-1">
              {solved.localizedHint ?? `Hint: ${solved.studentHint}`}
            </p>
          )}
        </div>
      )}

      {/* Step-by-Step Board Navigation Controls */}
      {solved?.supported && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={revealedSteps <= 0}
            onClick={() => onSetRevealedSteps(Math.max(0, revealedSteps - 1))}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            ← {tx.stepControls.prevStep}
          </button>
          <button
            type="button"
            disabled={revealedSteps >= maxSteps}
            onClick={() => onSetRevealedSteps(Math.min(maxSteps, revealedSteps + 1))}
            className="rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 disabled:opacity-40 cursor-pointer"
          >
            {tx.stepControls.nextStep} →
          </button>
          <button
            type="button"
            onClick={() => onSetRevealedSteps(maxSteps)}
            className="rounded-xl border border-indigo-400/50 bg-indigo-600/30 px-3 py-1.5 text-xs font-bold text-indigo-100 hover:bg-indigo-600/50 cursor-pointer"
          >
            {tx.stepControls.showAll}
          </button>
          <button
            type="button"
            onClick={() => onSetRevealedSteps(0)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
          >
            {tx.stepControls.resetSteps}
          </button>
          {currentActiveStep && (
            <div className="w-full pt-1">
              <SpeakControlsBar
                text={`${currentActiveStep.title}. ${currentActiveStep.body}`}
                language={language}
                sourceId="teacher_whiteboard_step"
                isDark={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Revealed Solution Steps List */}
      {solved?.supported && visibleSteps.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {visibleSteps.map((st, idx) => {
            const isLatest = idx === visibleSteps.length - 1
            return (
              <div
                key={st.stepNo}
                className={`rounded-xl border p-3 transition ${
                  isLatest
                    ? 'border-cyan-400 bg-slate-900 ring-1 ring-cyan-400/40'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-cyan-300">
                  {st.title}
                </div>
                <div className="mt-1 whitespace-pre-line font-sans text-xs sm:text-sm leading-relaxed text-slate-100">
                  {st.body}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pinned Math Expressions & Symbol Keyboard + Interactive Sketchpad Canvas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 border-t border-slate-800 pt-3">
        {/* Left: Math Expression Writer & Teacher Notes */}
        <div className="lg:col-span-6 space-y-2.5">
          <p className="text-xs font-bold text-slate-200">{tx.whiteboard.expressionLabel}</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_MATH_SYMBOLS.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setExprInput((prev) => `${prev}${sym}`)}
                className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 hover:bg-slate-700 cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!exprInput.trim()) return
              setPinnedExprs((prev) => [...prev, exprInput.trim()].slice(-8))
              setExprInput('')
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              placeholder="e.g. SA = 2πrh + 2πr² = 572 cm²"
              className="flex-1 min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 font-mono text-xs text-white"
            />
            <button
              type="submit"
              disabled={!exprInput.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer"
            >
              {tx.whiteboard.addExpressionButton}
            </button>
          </form>

          {pinnedExprs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pinnedExprs.map((ex, idx) => (
                <span
                  key={`${ex}_${idx}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/50 px-2.5 py-1 font-mono text-xs font-bold text-cyan-200"
                >
                  {ex}
                  <button
                    type="button"
                    onClick={() =>
                      setPinnedExprs((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-rose-300 hover:text-rose-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <label className="block space-y-1 pt-1">
            <span className="text-[11px] font-bold text-slate-300">
              {tx.whiteboard.teacherNotesLabel}
            </span>
            <textarea
              rows={2}
              value={teacherNotes}
              onChange={(e) => onChangeTeacherNotes?.(e.target.value)}
              placeholder={tx.whiteboard.notesPlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100"
            />
          </label>
        </div>

        {/* Right: Geometric Sketchpad Canvas */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-200">
              ✏️ {tx.whiteboard.diagramCanvasLabel}
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => stampGeometricDiagram('cylinder')}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                +Cylinder
              </button>
              <button
                type="button"
                onClick={() => stampGeometricDiagram('cone')}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                +Cone
              </button>
              <button
                type="button"
                onClick={() => stampGeometricDiagram('cuboid')}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                +Cuboid
              </button>
              <button
                type="button"
                onClick={clearSketchCanvas}
                className="rounded border border-rose-500/40 bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-900 cursor-pointer"
              >
                {tx.whiteboard.clearDrawing}
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={340}
            height={170}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-40 rounded-xl border border-slate-700 bg-slate-900 touch-none cursor-crosshair"
          />
        </div>
      </div>
    </div>
  )
}
