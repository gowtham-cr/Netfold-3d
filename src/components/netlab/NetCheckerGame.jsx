import { useMemo, useState } from 'react'
import {
  NET_CHECKER_PUZZLES,
  SHAPES,
  validateCubeNet,
} from '../../utils/mathEngine.js'
import Canvas3D from '../Canvas3D.jsx'
import NetGridSvg from './NetGridSvg.jsx'

const STORAGE_KEY = 'netfold_net_checker_progress_v1'

function loadSavedProgress() {
  if (typeof window === 'undefined') {
    return { index: 0, answers: {}, bestScore: 0 }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { index: 0, answers: {}, bestScore: 0 }
    const parsed = JSON.parse(raw)
    const idx = Number.isInteger(parsed?.index)
      ? Math.max(0, Math.min(NET_CHECKER_PUZZLES.length - 1, parsed.index))
      : 0
    const answers =
      parsed?.answers && typeof parsed.answers === 'object'
        ? parsed.answers
        : {}
    const bestScore =
      typeof parsed?.bestScore === 'number' && parsed.bestScore >= 0
        ? parsed.bestScore
        : 0
    return { index: idx, answers, bestScore }
  } catch {
    return { index: 0, answers: {}, bestScore: 0 }
  }
}

function saveProgress(state) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors in restricted environments
  }
}

/**
 * Interactive Net Checker Game: tests valid and invalid cube net patterns,
 * explains geometric reasoning, optionally demonstrates 3D folding/collisions,
 * and saves score + progress to localStorage.
 */
export default function NetCheckerGame({ translations: t, theme = 'light' }) {
  const initial = useMemo(() => loadSavedProgress(), [])
  const [puzzleIndex, setPuzzleIndex] = useState(initial.index)
  const [answers, setAnswers] = useState(initial.answers)
  const [bestScore, setBestScore] = useState(initial.bestScore)
  const [show3DPreview, setShow3DPreview] = useState(false)
  const [previewFold, setPreviewFold] = useState(100)

  const puzzle = NET_CHECKER_PUZZLES[puzzleIndex] ?? NET_CHECKER_PUZZLES[0]
  const validation = useMemo(
    () => validateCubeNet(puzzle.cells, puzzle.rootIndex),
    [puzzle],
  )
  const answeredChoice = answers[puzzle.id]
  const hasAnswered = typeof answeredChoice === 'boolean'
  const isUserCorrect = hasAnswered && answeredChoice === validation.valid

  const totalAnswered = Object.keys(answers).length
  const score = NET_CHECKER_PUZZLES.reduce(
    (acc, item) =>
      answers[item.id] === item.isValid ? acc + 1 : acc,
    0,
  )

  let streak = 0
  for (let i = puzzleIndex; i >= 0; i -= 1) {
    const item = NET_CHECKER_PUZZLES[i]
    if (answers[item.id] === undefined) {
      if (i === puzzleIndex) continue
      break
    }
    if (answers[item.id] === item.isValid) {
      streak += 1
    } else {
      break
    }
  }

  const allCompleted = totalAnswered === NET_CHECKER_PUZZLES.length

  const handleAnswer = (choice) => {
    if (hasAnswered) return
    const nextAnswers = { ...answers, [puzzle.id]: choice }
    const nextScore = NET_CHECKER_PUZZLES.reduce(
      (acc, item) =>
        nextAnswers[item.id] === item.isValid ? acc + 1 : acc,
      0,
    )
    const nextBest = Math.max(bestScore, nextScore)
    setAnswers(nextAnswers)
    setBestScore(nextBest)
    saveProgress({ index: puzzleIndex, answers: nextAnswers, bestScore: nextBest })
  }

  const handleNext = () => {
    const nextIdx = (puzzleIndex + 1) % NET_CHECKER_PUZZLES.length
    setPuzzleIndex(nextIdx)
    setShow3DPreview(false)
    setPreviewFold(100)
    saveProgress({ index: nextIdx, answers, bestScore })
  }

  const handleReset = () => {
    setPuzzleIndex(0)
    setAnswers({})
    setShow3DPreview(false)
    setPreviewFold(100)
    saveProgress({ index: 0, answers: {}, bestScore })
  }

  const checkerText = t.netLab.checker
  const explanationText = checkerText.explanations[puzzle.explanationKey]

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
      {/* Main Quiz Card */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {checkerText.title}
            </h2>
            <p className="text-xs text-slate-600">{checkerText.subtitle}</p>
          </div>
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-800 ring-1 ring-indigo-200">
            {checkerText.progressLabel} {puzzleIndex + 1} /{' '}
            {NET_CHECKER_PUZZLES.length}
          </span>
        </div>

        {/* 2D Candidate Pattern Box */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 p-6">
          <NetGridSvg
            cells={puzzle.cells}
            rootIndex={puzzle.rootIndex}
            uniformColor={
              hasAnswered
                ? validation.valid
                  ? '#10b981'
                  : '#f43f5e'
                : '#4f46e5'
            }
            showFaceCodes={hasAnswered && validation.valid}
            className="h-44 w-full max-w-xs"
            ariaLabel={checkerText.question}
          />
          <p className="mt-4 text-center text-base font-extrabold text-slate-900">
            {checkerText.question}
          </p>
        </div>

        {/* Yes / No Controls */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            disabled={hasAnswered}
            onClick={() => handleAnswer(true)}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              hasAnswered
                ? answeredChoice === true
                  ? isUserCorrect
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-rose-600 text-white shadow-sm'
                  : validation.valid
                    ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'bg-slate-100 text-slate-400'
                : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
            }`}
          >
            {checkerText.yesButton}
          </button>

          <button
            type="button"
            disabled={hasAnswered}
            onClick={() => handleAnswer(false)}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              hasAnswered
                ? answeredChoice === false
                  ? isUserCorrect
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-rose-600 text-white shadow-sm'
                  : !validation.valid
                    ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'bg-slate-100 text-slate-400'
                : 'bg-rose-600 text-white shadow-sm hover:bg-rose-700'
            }`}
          >
            {checkerText.noButton}
          </button>
        </div>

        {/* Immediate Educational Feedback */}
        {hasAnswered && (
          <div
            role="status"
            className={`flex flex-col gap-2.5 rounded-xl border p-4 ${
              isUserCorrect
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950'
                : 'border-amber-300 bg-amber-50/90 text-amber-950'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-extrabold">
                {isUserCorrect
                  ? checkerText.correctBadge
                  : checkerText.wrongBadge}
              </span>
              {puzzle.cells.length === 6 && validation.reason !== 'disconnected' && (
                <button
                  type="button"
                  onClick={() => setShow3DPreview((prev) => !prev)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-200 hover:bg-indigo-50"
                >
                  {show3DPreview ? checkerText.hide3D : checkerText.foldIn3D}
                </button>
              )}
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {explanationText}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                {checkerText.nextPuzzle}
              </button>
            </div>
          </div>
        )}

        {show3DPreview && hasAnswered && validation.reason !== 'disconnected' && (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="h-60 w-full overflow-hidden rounded-lg ring-1 ring-slate-200">
              <Canvas3D
                shape={SHAPES.CUBE}
                customCubeNet={{
                  cells: puzzle.cells,
                  rootIndex: puzzle.rootIndex,
                }}
                foldProgress={previewFold}
                dimensions={{ a: 3 }}
                translations={t}
                inlineScrollMode
                theme={theme}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-700">
                {previewFold}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={previewFold}
                onChange={(e) => setPreviewFold(Number(e.target.value))}
                aria-label={t.foldSectionTitle}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Scoreboard & Pattern Progress */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-indigo-50 p-3 text-center ring-1 ring-indigo-100">
            <p className="text-[11px] font-bold text-indigo-700 uppercase">
              {checkerText.scoreLabel}
            </p>
            <p
              data-testid="checker-score"
              className="mt-1 font-mono text-xl font-extrabold text-indigo-950"
            >
              {score} / {NET_CHECKER_PUZZLES.length}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
            <p className="text-[11px] font-bold text-emerald-700 uppercase">
              {checkerText.streakLabel}
            </p>
            <p className="mt-1 font-mono text-xl font-extrabold text-emerald-950">
              {streak}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
            <p className="text-[11px] font-bold text-amber-800 uppercase">
              {checkerText.bestLabel}
            </p>
            <p className="mt-1 font-mono text-xl font-extrabold text-amber-950">
              {bestScore}
            </p>
          </div>
        </div>

        {/* Clickable progress pills */}
        <div className="grid grid-cols-6 gap-1.5">
          {NET_CHECKER_PUZZLES.map((item, idx) => {
            const ans = answers[item.id]
            const isCurrent = idx === puzzleIndex
            const bg =
              ans === undefined
                ? 'bg-slate-100 text-slate-700'
                : ans === item.isValid
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPuzzleIndex(idx)
                  setShow3DPreview(false)
                  saveProgress({ index: idx, answers, bestScore })
                }}
                className={`rounded-lg py-2 font-mono text-xs font-bold transition ${bg} ${
                  isCurrent ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        {allCompleted && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <h3 className="text-sm font-extrabold">
              {checkerText.completedTitle}
            </h3>
            <p className="mt-1 text-xs">{checkerText.completedSummary}</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {checkerText.playAgain}
            </button>
          </div>
        )}

        <div className="mt-auto flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            {checkerText.resetProgress}
          </button>
        </div>
      </div>
    </div>
  )
}
