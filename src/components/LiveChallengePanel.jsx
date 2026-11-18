import { useEffect, useRef, useState } from 'react'
import { getMultilingualContent } from '../data/multilingualContentTranslations.js'
import {
  UNIFIED_DIFFICULTIES,
  UNIFIED_TOPICS,
  getArenaQuestionLocale,
} from '../utils/examArenaBank.js'
import {
  CHALLENGE_QUESTION_COUNTS,
  SIMULATED_DEMO_PEERS,
  buildLiveChallengeQuestions,
  deleteCustomTeacherChallenge,
  evaluateLiveChallengeSession,
  loadTeacherChallenges,
  saveCustomTeacherChallenge,
} from '../utils/liveChallengeEngine.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'

function fmtSeconds(sec) {
  const safe = Math.max(0, Math.floor(sec))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Live Challenge Mode (Student vs Simulated Demo Participants + Teacher-Created Challenges)
 * supporting 10, 15, or 20 questions, difficulty selection, countdown timer, score calculation,
 * accuracy & time comparison, ranked leaderboard, final answer explanations, and analytics sync.
 */
export default function LiveChallengePanel({
  language = 'en',
  translations: t,
  theme = 'light',
  onRecordMockSession,
}) {
  const ea = t.examArena
  const pyqUi = t.pyqUi
  const lcu = getMultilingualContent(language).liveChallengeUi
  const isDark = theme === 'dark'

  const [teacherChallenges, setTeacherChallenges] = useState(loadTeacherChallenges)
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState('all')
  const [topic, setTopic] = useState('all')
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [studentName, setStudentName] = useState('You (Live Student)')
  const [seed, setSeed] = useState(1)

  // Teacher challenge quick-creator form
  const [newChallengeTitle, setNewChallengeTitle] = useState('')
  const [createdNotice, setCreatedNotice] = useState('')

  // Running & Results state
  const [phase, setPhase] = useState('setup') // 'setup' | 'running' | 'results'
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answersById, setAnswersById] = useState({})
  const [numericById, setNumericById] = useState({})
  const [timingsById, setTimingsById] = useState({})
  const [remainingSec, setRemainingSec] = useState(600)
  const [evaluation, setEvaluation] = useState(null)
  const stepStartRef = useRef(0)

  const formatTopicLabel = (topicKey) =>
    pyqUi?.topics?.[topicKey] ?? ea.topics?.[topicKey] ?? topicKey

  const handleSelectTeacherPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setQuestionCount(preset.questionCount)
    setDifficulty(preset.difficulty)
    setTopic(preset.topic)
    setDurationMinutes(preset.durationMinutes)
  }

  const handleCreateTeacherChallenge = (e) => {
    e.preventDefault()
    if (!newChallengeTitle.trim()) return
    const saved = saveCustomTeacherChallenge({
      title: newChallengeTitle.trim(),
      questionCount,
      difficulty,
      topic,
      durationMinutes,
      creator: 'Teacher Created',
    })
    setTeacherChallenges(loadTeacherChallenges())
    setSelectedPresetId(saved.id)
    setNewChallengeTitle('')
    setCreatedNotice(`Saved teacher challenge: "${saved.title}" (${saved.questionCount}Q)`)
  }

  const handleDeletePreset = (id) => {
    const updated = deleteCustomTeacherChallenge(id)
    setTeacherChallenges(updated)
    if (selectedPresetId === id) setSelectedPresetId('')
  }

  const recordCurrentStepTime = () => {
    const activeQ = questions[currentIdx]
    if (!activeQ) return timingsById
    const now = Date.now()
    const base = stepStartRef.current || now
    const delta = Math.max(1, Math.round((now - base) / 1000))
    stepStartRef.current = now
    const next = {
      ...timingsById,
      [activeQ.id]: (timingsById[activeQ.id] ?? 0) + delta,
    }
    setTimingsById(next)
    return next
  }

  const finishChallenge = (finalTimings = timingsById) => {
    const result = evaluateLiveChallengeSession({
      questions,
      selectedAnswersById: answersById,
      numericAnswersById: numericById,
      timingsById: finalTimings,
      studentName: studentName.trim() || 'You (Live Student)',
      seed,
    })
    setEvaluation(result)
    setPhase('results')

    const now = Date.now()
    const attemptRecords = result.perQuestion.map((pq) => ({
      questionId: pq.id,
      topic: pq.topic,
      exam: pq.exam,
      examTrack: pq.examTrack,
      difficulty: pq.difficulty,
      authenticity: pq.authenticity,
      year: pq.year,
      correct: pq.correct,
      timeSpentSec: pq.timeSpentSec,
      mode: 'challenge',
      timestamp: now,
    }))

    onRecordMockSession?.(
      {
        id: `challenge_${now}`,
        examTrack: topic === 'all' ? 'live_challenge' : topic,
        accuracy: result.accuracy,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        totalTimeSec: result.totalTimeSec,
        avgTimeSec: result.avgTimeSec,
        timestamp: now,
      },
      attemptRecords,
    )
  }

  useEffect(() => {
    if (phase !== 'running') return undefined
    const id = window.setInterval(() => {
      setRemainingSec((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'running' && remainingSec === 0) {
      const autoTimer = window.setTimeout(() => {
        finishChallenge()
      }, 0)
      return () => window.clearTimeout(autoTimer)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remainingSec])

  const handleStartChallenge = () => {
    const generated = buildLiveChallengeQuestions({
      questionCount,
      difficulty,
      topic,
      seed,
    })
    if (generated.length === 0) return
    setSeed((s) => s + 1)
    setQuestions(generated)
    setCurrentIdx(0)
    setAnswersById({})
    setNumericById({})
    setTimingsById({})
    setEvaluation(null)
    setRemainingSec(durationMinutes * 60)
    stepStartRef.current = Date.now()
    setPhase('running')
  }

  const activeQ = questions[currentIdx] ?? null
  const activeLoc = getArenaQuestionLocale(activeQ, language)

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm space-y-5 ${
        isDark
          ? 'border-slate-700 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      {/* Honest Simulated Demo Participant Disclosure Banner */}
      <div
        className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
          isDark
            ? 'border-amber-700/80 bg-amber-950/40 text-amber-200'
            : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}
      >
        ⚡ <strong>{lcu.bannerTitle}:</strong> {lcu.bannerDesc} (
        {SIMULATED_DEMO_PEERS.map((p) => p.name).join(', ')})
      </div>

      {phase === 'setup' && (
        <div className="space-y-5">
          {/* Teacher-Created Challenges List */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold">
              📋 {lcu.teacherChallengesHeading}
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {teacherChallenges.map((tc) => {
                const selected = selectedPresetId === tc.id
                return (
                  <div
                    key={tc.id}
                    className={`rounded-xl border p-3 flex flex-col justify-between gap-2 transition ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-300'
                        : isDark
                          ? 'border-slate-700 bg-slate-800/70'
                          : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-extrabold">{tc.title}</h4>
                        {!tc.isPreset && (
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(tc.id)}
                            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] opacity-80">
                        {tc.questionCount} · {ea.difficulties[tc.difficulty] ?? tc.difficulty}{' '}
                        · {tc.durationMinutes} min ·{' '}
                        {tc.topic === 'all' ? ea.topics.all : formatTopicLabel(tc.topic)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTeacherPreset(tc)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
                    >
                      {selected ? lcu.selectedChallenge : lcu.loadChallenge}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Configure 10 / 15 / 20 Question Challenge */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-bold">
              <span className="mb-1 block">{lcu.participantName}</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{lcu.questionCountLabel}</span>
              <select
                aria-label={lcu.questionCountLabel}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {CHALLENGE_QUESTION_COUNTS.map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt} {ea.questionCountLabel}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{lcu.difficultyLabel}</span>
              <select
                aria-label={lcu.difficultyLabel}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                <option value="all">{ea.difficulties.all}</option>
                {UNIFIED_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {ea.difficulties[d]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{lcu.topicLabel}</span>
              <select
                aria-label={lcu.topicLabel}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                <option value="all">{pyqUi.filters.allTopics}</option>
                {UNIFIED_TOPICS.map((tp) => (
                  <option key={tp} value={tp}>
                    {formatTopicLabel(tp)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{lcu.durationLabel}</span>
              <select
                aria-label={lcu.durationLabel}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {[8, 10, 12, 15, 20].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleStartChallenge}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
            >
              ⚡ {lcu.startButton} ({questionCount})
            </button>

            {/* Save as Teacher-Created Challenge */}
            <form onSubmit={handleCreateTeacherChallenge} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newChallengeTitle}
                onChange={(e) => setNewChallengeTitle(e.target.value)}
                placeholder={lcu.saveChallengePlaceholder}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              />
              <button
                type="submit"
                disabled={!newChallengeTitle.trim()}
                className="rounded-xl border border-indigo-300 bg-indigo-50 px-3.5 py-2 text-xs font-extrabold text-indigo-800 hover:bg-indigo-100 disabled:opacity-40 cursor-pointer"
              >
                {lcu.saveChallengeBtn}
              </button>
            </form>
          </div>

          {createdNotice && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ✓ {createdNotice}
            </p>
          )}
        </div>
      )}

      {phase === 'running' && activeQ && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-indigo-600 px-3 py-1 font-mono text-xs font-bold text-white">
                {ea.questionCounterPrefix} {currentIdx + 1} {ea.ofLabel} {questions.length}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold">
                {ea.difficulties[activeQ.difficulty]}
              </span>
              <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[11px] font-bold">
                vs 3 Simulated Demo Participants
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-sm font-extrabold text-amber-900">
                ⏱ {ea.timeRemainingLabel}: {fmtSeconds(remainingSec)}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextT = recordCurrentStepTime()
                  finishChallenge(nextT)
                }}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                {lcu.finishViewBoard}
              </button>
            </div>
          </div>

          {/* Question Palette */}
          <div className="flex flex-wrap gap-1.5">
            {questions.map((qItem, idx) => {
              const answered =
                Number.isInteger(answersById[qItem.id]) ||
                String(numericById[qItem.id] ?? '').trim() !== ''
              const current = idx === currentIdx
              return (
                <button
                  key={qItem.id}
                  type="button"
                  onClick={() => {
                    recordCurrentStepTime()
                    setCurrentIdx(idx)
                  }}
                  className={`h-8 w-8 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                    current
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                      : answered
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isDark
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <p className="text-base font-bold">{activeLoc.question}</p>

          {activeQ.questionType === 'numerical' &&
            Number.isFinite(activeQ.numericAnswer) && (
              <div className="max-w-sm">
                <input
                  type="text"
                  inputMode="decimal"
                  value={numericById[activeQ.id] ?? ''}
                  onChange={(e) =>
                    setNumericById((prev) => ({
                      ...prev,
                      [activeQ.id]: e.target.value,
                    }))
                  }
                  placeholder={pyqUi.practiceControls.numericalPlaceholder}
                  className={`w-full rounded-xl border px-3.5 py-2 text-sm font-mono font-bold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                />
              </div>
            )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {activeQ.options.map((opt, idx) => {
              const picked = answersById[activeQ.id] === idx
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setAnswersById((prev) => ({
                      ...prev,
                      [activeQ.id]: idx,
                    }))
                  }
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition cursor-pointer ${
                    picked
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-200'
                      : isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-white'
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => {
                recordCurrentStepTime()
                setCurrentIdx((i) => Math.max(0, i - 1))
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
            >
              ← {t.practice.previousButton}
            </button>
            <button
              type="button"
              disabled={currentIdx === questions.length - 1}
              onClick={() => {
                recordCurrentStepTime()
                setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 cursor-pointer"
            >
              {t.practice.nextButton} →
            </button>
          </div>
        </div>
      )}

      {phase === 'results' && evaluation && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold">
                🏆 {lcu.leaderboardHeading}
              </h3>
              <p className="text-xs opacity-75">{lcu.bannerDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
            >
              {lcu.newChallengeBtn}
            </button>
          </div>

          {/* Score, Rank, Accuracy & Time Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-slate-500">{lcu.rankCol}</div>
              <div className="mt-1 font-mono text-lg font-extrabold text-indigo-700">
                #{evaluation.userRank} / {evaluation.leaderboard.length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-slate-500">{lcu.pointsCol}</div>
              <div className="mt-1 font-mono text-lg font-extrabold text-indigo-700">
                {evaluation.userScorePoints} pts
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-slate-500">
                {lcu.accuracyCol}
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-emerald-700">
                {evaluation.accuracy}%{' '}
                <span className="text-xs font-bold">
                  ({evaluation.accuracyDeltaVsPeers >= 0 ? '+' : ''}
                  {evaluation.accuracyDeltaVsPeers}%)
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-slate-500">
                {lcu.timeCol}
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-slate-900">
                {fmtSeconds(evaluation.totalTimeSec)}{' '}
                <span className="text-xs font-bold text-slate-500">
                  ({fmtSeconds(evaluation.peerAvgTimeSec)})
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-slate-500">{ea.avgTimeLabel}</div>
              <div className="mt-1 font-mono text-lg font-extrabold text-amber-700">
                {evaluation.avgTimeSec}s
              </div>
            </div>
          </div>

          {/* Ranked Leaderboard Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead
                className={
                  isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                }
              >
                <tr>
                  <th className="px-3 py-2 font-extrabold">{lcu.rankCol}</th>
                  <th className="px-3 py-2 font-extrabold">{lcu.participantCol}</th>
                  <th className="px-3 py-2 font-extrabold">{lcu.typeCol}</th>
                  <th className="px-3 py-2 font-extrabold">{lcu.correctCol}</th>
                  <th className="px-3 py-2 font-extrabold">{lcu.accuracyCol}</th>
                  <th className="px-3 py-2 font-extrabold">{lcu.timeCol}</th>
                  <th className="px-3 py-2 font-extrabold">{lcu.pointsCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {evaluation.leaderboard.map((row) => (
                  <tr
                    key={row.participantId}
                    className={
                      row.isUser
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                        : ''
                    }
                  >
                    <td className="px-3 py-2.5 font-mono font-extrabold">#{row.rank}</td>
                    <td className="px-3 py-2.5 font-bold">{row.name}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          row.isUser
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {row.roleLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {row.correctCount} / {row.totalQuestions}
                    </td>
                    <td className="px-3 py-2.5 font-mono">{row.accuracy}%</td>
                    <td className="px-3 py-2.5 font-mono">{fmtSeconds(row.totalTimeSec)}</td>
                    <td className="px-3 py-2.5 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {row.scorePoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final Answer Explanations */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold">
              📖 {lcu.explanationsHeading} ({questions.length})
            </h4>
            {questions.map((mq, idx) => {
              const res = evaluation.perQuestion[idx]
              const loc = getArenaQuestionLocale(mq, language)
              return (
                <div
                  key={mq.id}
                  className={`rounded-xl border p-4 space-y-2 ${
                    res.correct
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold">
                      Q{idx + 1}. {loc.question}
                    </span>
                    <span className="font-mono text-xs font-bold">
                      {res.correct ? `✓ ${ea.correctBadge}` : `✕ ${ea.incorrectBadge}`} ({' '}
                      {mq.options[mq.correctIndex]}) · {res.timeSpentSec}s
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                    ⚡ {loc.shortcutTip}
                  </p>
                  <p className="text-xs opacity-90">{loc.solutionSteps.join(' ')}</p>
                  <SpeakControlsBar
                    compact
                    text={`${loc.question} ${loc.shortcutTip ?? ''} ${loc.solutionSteps.join(' ')}`}
                    language={language}
                    sourceId={`challenge_ans_${mq.id}`}
                    isDark={isDark}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
