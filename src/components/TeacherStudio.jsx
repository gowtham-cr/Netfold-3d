import { useEffect, useMemo, useRef, useState } from 'react'
import {
  NCERT_CLASSES,
  NCERT_CURRICULUM_QUESTIONS,
  getNcertChaptersForClass,
} from '../data/ncertCurriculumBank.js'
import { getTeacherStudioExtended } from '../data/teacherStudioTranslations.js'
import { getCompositeBuilderTranslations } from '../data/compositeBuilderTranslations.js'
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  calculateShape,
} from '../utils/mathEngine.js'
import {
  askTeacherStudioAssistant,
  attemptBrowserOcr,
  generateSimilarNcertQuestions,
  solveNcertMensurationQuestion,
} from '../utils/ncertQuestionSolver.js'
import { localizeSolvedNcertResult } from '../utils/multilingualExplanations.js'
import { currentTimestampMs } from '../utils/profileStorage.js'
import Canvas3D from './Canvas3D.jsx'
import CompositeSolidBuilder from './CompositeSolidBuilder.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import ShapeThumbSvg from './ShapeThumbSvg.jsx'
import TeacherWhiteboard from './TeacherWhiteboard.jsx'
import WorksheetGenerator from './WorksheetGenerator.jsx'

const ALL_SHAPES = Object.values(SHAPES)

const DEFAULT_DEMO_DIMS = {
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

function fmt(val) {
  if (val === null || val === undefined) return '—'
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

/**
 * Interactive NCERT Mathematics Teaching & Question-Solving Classroom System:
 * 1) NCERT Classes 6–10 Question Solver + Image Upload / Browser OCR + Editable Text
 * 2) 10-Step Pedagogical Solution Engine + Interactive Digital Teaching Whiteboard
 * 3) Live 3D Visual Solver + Combined Solid Decomposition + Full-Screen Projector Mode
 * 4) Ask the Teacher Studio Assistant (transparent local engine)
 * 5) Classroom Interaction Mode (Teacher Demo / Student Practice / Similar Practice / Analytics Sync)
 * 6) Structured NCERT Lesson Builder & Printable Worksheets
 */
export default function TeacherStudio({
  language = 'en',
  translations: t,
  theme = 'light',
  unit = 'cm',
  savedLessons = [],
  onSaveLesson,
  onDeleteLesson,
  onOpenTeacherAnalytics,
  onRecordClassroomPractice,
  onDiagnoseWrongAnswer,
}) {
  const ts = t.teacherStudioUi
  const tx = getTeacherStudioExtended(language)
  const ct = getCompositeBuilderTranslations(language)
  const isDark = theme === 'dark'

  const [studioTab, setStudioTab] = useState('solver') // 'solver' | 'lessons' | 'worksheets'
  const [classroomMode, setClassroomMode] = useState('teacher') // 'teacher' | 'student'
  const [compositeBuilderOpen, setCompositeBuilderOpen] = useState(false)

  // NCERT Curriculum Selector + Custom Question Editor State
  const [selectedClass, setSelectedClass] = useState('10')
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    NCERT_CURRICULUM_QUESTIONS[1].id,
  )
  const [questionSourceType, setQuestionSourceType] = useState('ncert_textbook')
  const [questionInputText, setQuestionInputText] = useState(
    NCERT_CURRICULUM_QUESTIONS[1].questionText,
  )
  const [piMode, setPiMode] = useState('22/7') // '22/7' | '3.14'
  const [solvedResult, setSolvedResult] = useState(() =>
    solveNcertMensurationQuestion(NCERT_CURRICULUM_QUESTIONS[1].questionText, {
      piMode: '22/7',
    }),
  )
  const [revealedSteps, setRevealedSteps] = useState(10)

  // Image Upload + Browser OCR State
  const [uploadedImgUrl, setUploadedImgUrl] = useState(null)
  const [uploadedImgName, setUploadedImgName] = useState('')
  const [ocrStatusMsg, setOcrStatusMsg] = useState('')

  // Live 3D Visual Solver Controls
  const [demoShape, setDemoShape] = useState(SHAPES.CYLINDER)
  const [activeCombinedPart, setActiveCombinedPart] = useState('primary') // 'primary' | 'secondary'
  const [dimsByShape, setDimsByShape] = useState(DEFAULT_DEMO_DIMS)
  const [foldProgress, setFoldProgress] = useState(55)
  const [highlightMode, setHighlightMode] = useState('lsa')
  const [projectorMode, setProjectorMode] = useState(false)

  // Per-question Teacher Notes & Whiteboard extras
  const [teacherNotesByKey, setTeacherNotesByKey] = useState(() => {
    const map = {}
    for (const q of NCERT_CURRICULUM_QUESTIONS) {
      map[q.id] = q.teacherNotes
    }
    return map
  })

  // Classroom Student Practice & Similar Question Generator
  const [practiceDifficulty, setPracticeDifficulty] = useState('medium')
  const [similarQuestions, setSimilarQuestions] = useState(() =>
    generateSimilarNcertQuestions(
      solveNcertMensurationQuestion(NCERT_CURRICULUM_QUESTIONS[1].questionText),
      'medium',
      3,
    ),
  )
  const [pickedBySimId, setPickedBySimId] = useState({})
  const [checkedBySimId, setCheckedBySimId] = useState({})
  const [analyticsSavedToast, setAnalyticsSavedToast] = useState('')
  const practiceTimerRef = useRef(0)

  // Ask the Teacher Studio Assistant
  const [askInput, setAskInput] = useState('')
  const [askHistory, setAskHistory] = useState([])

  // Structured Lesson Builder Form
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonChapter, setLessonChapter] = useState('Class 10 · Ch. 12 Surface Areas and Volumes')
  const [lessonDuration, setLessonDuration] = useState(40)
  const [lessonObjectives, setLessonObjectives] = useState('')
  const [lessonExplanation, setLessonExplanation] = useState('')
  const [lessonSolvedQs, setLessonSolvedQs] = useState('')
  const [lessonPracticeQs, setLessonPracticeQs] = useState('')
  const [lessonHomework, setLessonHomework] = useState('')
  const [lessonNotes, setLessonNotes] = useState('')

  useEffect(() => {
    practiceTimerRef.current = Date.now()
  }, [solvedResult])

  useEffect(() => {
    if (!projectorMode) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setProjectorMode(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [projectorMode])

  useEffect(() => {
    return () => {
      if (uploadedImgUrl) URL.revokeObjectURL(uploadedImgUrl)
    }
  }, [uploadedImgUrl])

  const chaptersForClass = useMemo(
    () => getNcertChaptersForClass(selectedClass),
    [selectedClass],
  )

  const filteredNcertQuestions = useMemo(() => {
    return NCERT_CURRICULUM_QUESTIONS.filter((q) => {
      if (selectedClass !== 'all' && q.classLevel !== selectedClass) return false
      if (selectedChapter !== 'all' && q.chapter !== selectedChapter) return false
      return true
    })
  }, [selectedClass, selectedChapter])

  const activeNotesKey =
    questionSourceType === 'ncert_textbook' ? selectedQuestionId : 'custom_question'

  const runSolveOnText = (textToSolve, sourceType, nextPiMode = piMode) => {
    const res = solveNcertMensurationQuestion(textToSolve, { piMode: nextPiMode })
    setSolvedResult(res)
    setQuestionSourceType(sourceType)
    setRevealedSteps(
      classroomMode === 'student' ? 0 : res.supported ? res.steps.length : 1,
    )
    if (res.supported) {
      setDemoShape(res.primaryShape)
      setActiveCombinedPart('primary')
      setHighlightMode(res.highlightMode ?? 'tsa')
      setDimsByShape((prev) => ({
        ...prev,
        [res.primaryShape]: {
          ...prev[res.primaryShape],
          ...res.canvasDimensions,
        },
      }))
      setSimilarQuestions(
        generateSimilarNcertQuestions(res, practiceDifficulty, 3),
      )
      setPickedBySimId({})
      setCheckedBySimId({})
    }
    practiceTimerRef.current = Date.now()
  }

  const handleSelectNcertPreset = (qId) => {
    setSelectedQuestionId(qId)
    const found = NCERT_CURRICULUM_QUESTIONS.find((q) => q.id === qId)
    if (!found) return
    const nextPi = /3\.14/.test(found.questionText) ? '3.14' : '22/7'
    setPiMode(nextPi)
    setQuestionInputText(found.questionText)
    runSolveOnText(found.questionText, 'ncert_textbook', nextPi)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadedImgUrl) URL.revokeObjectURL(uploadedImgUrl)
    setUploadedImgUrl(URL.createObjectURL(file))
    setUploadedImgName(file.name)
    setQuestionSourceType('custom_question')

    const ocrRes = await attemptBrowserOcr(file)
    setOcrStatusMsg(ocrRes.message)
    if (ocrRes.supported && ocrRes.extractedText) {
      setQuestionInputText(ocrRes.extractedText)
    }
  }

  const handleSwitchClassroomMode = (nextMode) => {
    setClassroomMode(nextMode)
    if (solvedResult?.supported) {
      setRevealedSteps(nextMode === 'student' ? 0 : solvedResult.steps.length)
    }
  }

  const handleRegenerateSimilar = (nextDiff = practiceDifficulty) => {
    setPracticeDifficulty(nextDiff)
    setSimilarQuestions(generateSimilarNcertQuestions(solvedResult, nextDiff, 3))
    setPickedBySimId({})
    setCheckedBySimId({})
    setAnalyticsSavedToast('')
    practiceTimerRef.current = Date.now()
  }

  const handleCheckSimilarPractice = (simQ) => {
    const picked = pickedBySimId[simQ.id]
    if (!Number.isInteger(picked)) return
    const isCorrect = picked === simQ.correctIndex
    const now = currentTimestampMs()
    const elapsedSec = Math.max(
      4,
      Math.round((now - (practiceTimerRef.current || now)) / 1000),
    )
    practiceTimerRef.current = now

    setCheckedBySimId((prev) => ({ ...prev, [simQ.id]: isCorrect }))
    setAnalyticsSavedToast(tx.studentPractice.savedAnalyticsToast)

    onRecordClassroomPractice?.({
      questionId: simQ.id,
      topic: simQ.topic === SHAPES.CONE ? 'cone_frustum' : simQ.topic === SHAPES.CUBOID ? 'cube_cuboid' : simQ.topic,
      exam: 'general_aptitude',
      examTrack: 'general_aptitude',
      difficulty: simQ.difficulty,
      authenticity: 'pyq_style_practice',
      year: null,
      correct: isCorrect,
      timeSpentSec: elapsedSec,
      source: 'teacher_studio',
      timestamp: now,
    })
  }

  const handleAskAssistant = (rawQ) => {
    const q = String(rawQ ?? '').trim()
    if (!q) return
    const res = askTeacherStudioAssistant(q, {
      solved: solvedResult,
      language,
    })
    setAskHistory((prev) => [
      { id: `ask_${Date.now()}`, question: q, ...res },
      ...prev,
    ].slice(0, 8))
    setAskInput('')
  }

  // Lesson Builder Save / Update / Edit
  const resetLessonForm = () => {
    setEditingLessonId(null)
    setLessonTitle('')
    setLessonObjectives('')
    setLessonExplanation('')
    setLessonSolvedQs('')
    setLessonPracticeQs('')
    setLessonHomework('')
    setLessonNotes('')
    setLessonDuration(40)
  }

  const handleSaveLessonSubmit = (e) => {
    e.preventDefault()
    if (!lessonTitle.trim()) return

    if (editingLessonId) {
      onDeleteLesson?.(editingLessonId)
    }

    onSaveLesson?.({
      id: editingLessonId || `lesson-${Date.now()}`,
      title: lessonTitle.trim(),
      chapter: lessonChapter.trim(),
      durationMinutes: Number(lessonDuration) || 40,
      objectives: lessonObjectives.trim(),
      explanation: lessonExplanation.trim(),
      solvedQuestions: lessonSolvedQs.trim(),
      practiceQuestions: lessonPracticeQs.trim(),
      homework: lessonHomework.trim(),
      notes: lessonNotes.trim(),
      shape: demoShape,
      dimensions: dimsByShape[demoShape] ?? DEFAULT_DEMO_DIMS[demoShape],
      foldProgress,
      highlightMode,
    })
    resetLessonForm()
  }

  const handleEditLesson = (lesson) => {
    setStudioTab('lessons')
    setEditingLessonId(lesson.id)
    setLessonTitle(lesson.title ?? '')
    setLessonChapter(lesson.chapter ?? 'Class 10 · Ch. 12 Surface Areas and Volumes')
    setLessonDuration(lesson.durationMinutes ?? 40)
    setLessonObjectives(lesson.objectives ?? '')
    setLessonExplanation(lesson.explanation ?? '')
    setLessonSolvedQs(lesson.solvedQuestions ?? '')
    setLessonPracticeQs(lesson.practiceQuestions ?? '')
    setLessonHomework(lesson.homework ?? '')
    setLessonNotes(lesson.notes ?? '')
    if (lesson.shape) setDemoShape(lesson.shape)
  }

  const activeDims = dimsByShape[demoShape] ?? DEFAULT_DEMO_DIMS[demoShape]
  const mensuration = useMemo(
    () => calculateShape(demoShape, activeDims),
    [demoShape, activeDims],
  )
  const hasNoNet =
    demoShape === SHAPES.SPHERE || demoShape === SHAPES.HEMISPHERE
  const effectiveFold = hasNoNet ? 100 : foldProgress
  const areaUnit = t.unitSymbols[unit].area
  const volUnit = t.unitSymbols[unit].volume

  const localizedSolved = useMemo(
    () => localizeSolvedNcertResult(solvedResult, language, t),
    [solvedResult, language, t],
  )

  const activeStepObj =
    localizedSolved?.supported && revealedSteps > 0
      ? localizedSolved.steps[Math.min(revealedSteps, localizedSolved.steps.length) - 1]
      : null

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 space-y-6">
      {/* Studio Top Bar + Mode Switchers */}
      <section
        className={`no-print rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-[11px] font-extrabold text-indigo-800 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-200">
              {tx.studioBadge}
            </span>
            <h2 className="mt-1 text-lg sm:text-xl font-extrabold">
              {ts.headerTitle}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm opacity-80 max-w-3xl">
              {ts.headerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            {onOpenTeacherAnalytics && (
              <button
                type="button"
                onClick={onOpenTeacherAnalytics}
                className="shrink-0 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-900 hover:bg-emerald-100 transition cursor-pointer"
              >
                📊 {t.advAnalytics?.openTeacherAnalyticsBtn || 'Open Teacher Analytics'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setProjectorMode(true)}
              className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
            >
              🖥 {ts.enterProjector}
            </button>
          </div>
        </div>

        {/* Studio Navigation Subtabs + Classroom Interaction Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div
            role="tablist"
            aria-label={ts.headerTitle}
            className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1"
          >
            {['solver', 'lessons', 'worksheets'].map((tabKey) => {
              const active = studioTab === tabKey
              return (
                <button
                  key={tabKey}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStudioTab(tabKey)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-200 hover:bg-slate-700'
                        : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {tx.tabs[tabKey]}
                </button>
              )
            })}
          </div>

          {studioTab === 'solver' && (
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {['teacher', 'student'].map((cm) => {
                const active = classroomMode === cm
                return (
                  <button
                    key={cm}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleSwitchClassroomMode(cm)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                      active
                        ? cm === 'teacher'
                          ? 'bg-slate-900 text-cyan-300'
                          : 'bg-emerald-600 text-white'
                        : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                    }`}
                  >
                    {tx.modes[cm]}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* TAB 1: NCERT QUESTION SOLVER + LIVE 3D VISUALIZER + WHITEBOARD + ASK STUDIO */}
      {studioTab === 'solver' && (
        <div className="space-y-6">
          {/* 1. NCERT Question Selector & Image/Text Input Panel */}
          <section
            className={`no-print rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-100'
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-extrabold">
                📘 1. {tx.tabs.solver}
              </h3>
              <span
                className={`rounded-full px-3 py-0.5 text-[11px] font-bold border ${
                  questionSourceType === 'ncert_textbook'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}
              >
                {questionSourceType === 'ncert_textbook'
                  ? `✓ ${tx.authenticityNcert}`
                  : `✎ ${tx.authenticityCustom}`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-bold">
                <span className="mb-1 block">{tx.classLabel}</span>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    const cls = e.target.value
                    setSelectedClass(cls)
                    setSelectedChapter('all')
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  {NCERT_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold">
                <span className="mb-1 block">{tx.chapterLabel}</span>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  <option value="all">
                    {tx.chapterLabel} ({filteredNcertQuestions.length})
                  </option>
                  {chaptersForClass.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold">
                <span className="mb-1 block">{tx.questionSelectLabel}</span>
                <select
                  value={selectedQuestionId}
                  onChange={(e) => handleSelectNcertPreset(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  {filteredNcertQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.exerciseRef}: {q.questionText.slice(0, 52)}...
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold">
                <span className="mb-1 block">{tx.piModeLabel}</span>
                <select
                  value={piMode}
                  onChange={(e) => {
                    const nextPi = e.target.value
                    setPiMode(nextPi)
                    runSolveOnText(questionInputText, questionSourceType, nextPi)
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  <option value="22/7">π = 22/7 (Standard NCERT)</option>
                  <option value="3.14">π = 3.14</option>
                </select>
              </label>
            </div>

            {/* Editable Question Text + Image Upload OCR Row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-2">
                <label className="block text-xs font-bold">
                  <span className="mb-1 block">{tx.editPromptLabel}</span>
                  <textarea
                    rows={3}
                    value={questionInputText}
                    onChange={(e) => {
                      setQuestionInputText(e.target.value)
                      setQuestionSourceType('custom_question')
                    }}
                    placeholder={tx.customModeLabel}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100'
                        : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      runSolveOnText(questionInputText, questionSourceType, piMode)
                    }
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                  >
                    ⚡ {tx.solveButton}
                  </button>

                  <label className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold cursor-pointer hover:bg-slate-100">
                    📷 {tx.uploadImageLabel}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>

                  {uploadedImgUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(uploadedImgUrl)
                        setUploadedImgUrl(null)
                        setUploadedImgName('')
                        setOcrStatusMsg('')
                      }}
                      className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      {tx.clearImageButton}
                    </button>
                  )}
                </div>

                {ocrStatusMsg && (
                  <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                    ℹ️ {ocrStatusMsg}
                  </p>
                )}
              </div>

              <div className="lg:col-span-4">
                {uploadedImgUrl ? (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 space-y-1">
                    <div className="text-[11px] font-bold truncate">
                      Uploaded: {uploadedImgName}
                    </div>
                    <img
                      src={uploadedImgUrl}
                      alt={uploadedImgName || 'Uploaded question'}
                      className="max-h-36 w-full rounded-lg object-contain bg-white"
                    />
                  </div>
                ) : (
                  <div className="h-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-col justify-center text-xs opacity-75">
                    <p className="font-bold">{ts.selectShapeLabel}:</p>
                    <p className="mt-1">
                      {[
                        SHAPES.CUBE,
                        SHAPES.CUBOID,
                        SHAPES.CYLINDER,
                        SHAPES.CONE,
                        SHAPES.SPHERE,
                        SHAPES.HEMISPHERE,
                        SHAPES.FRUSTUM,
                      ]
                        .map((s) => t.shapes[s])
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. Live 3D Visual Solver + Interactive Digital Whiteboard / Composite 3D Builder */}
          {compositeBuilderOpen ? (
            <CompositeSolidBuilder
              language={language}
              translations={t}
              theme={theme}
              unit={unit}
              onBackToSingleMode={() => setCompositeBuilderOpen(false)}
            />
          ) : (
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Left: Live 3D Stage & Decomposition */}
              <div
                className={`no-print lg:col-span-5 rounded-2xl border p-4 shadow-sm space-y-3 ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold">
                    🧊 {ts.headerTitle} · {t.shapes[demoShape]}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCompositeBuilderOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
                  >
                    🧱 {ct.launchButton}
                  </button>
                </div>
                {solvedResult?.secondaryShape && (
                  <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCombinedPart('primary')
                        setDemoShape(solvedResult.primaryShape)
                      }}
                      className={`rounded-md px-2 py-1 cursor-pointer ${
                        activeCombinedPart === 'primary'
                          ? 'bg-indigo-600 text-white'
                          : ''
                      }`}
                    >
                      {tx.partLabel} A: {t.shapes[solvedResult.primaryShape]}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCombinedPart('secondary')
                        setDemoShape(solvedResult.secondaryShape)
                      }}
                      className={`rounded-md px-2 py-1 cursor-pointer ${
                        activeCombinedPart === 'secondary'
                          ? 'bg-indigo-600 text-white'
                          : ''
                      }`}
                    >
                      {tx.partLabel} B: {t.shapes[solvedResult.secondaryShape]}
                    </button>
                  </div>
                )}

              <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <Canvas3D
                  shape={demoShape}
                  foldProgress={effectiveFold}
                  dimensions={activeDims}
                  highlightMode={highlightMode}
                  translations={t}
                  inlineScrollMode
                  theme={theme}
                />
              </div>

              {/* Live 3D Readout Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900">
                  <div className="text-[10px] font-bold text-slate-500">
                    {t.highlightModes.lsa}
                  </div>
                  <div className="font-mono text-xs font-extrabold text-indigo-700">
                    {mensuration.lsa !== null ? `${fmt(mensuration.lsa)} ${areaUnit}` : '—'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900">
                  <div className="text-[10px] font-bold text-slate-500">
                    {t.highlightModes.tsa}
                  </div>
                  <div className="font-mono text-xs font-extrabold text-emerald-700">
                    {fmt(mensuration.tsa)} {areaUnit}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900">
                  <div className="text-[10px] font-bold text-slate-500">
                    {t.highlightModes.volume}
                  </div>
                  <div className="font-mono text-xs font-extrabold text-amber-700">
                    {fmt(mensuration.volume)} {volUnit}
                  </div>
                </div>
              </div>

              {/* Shape, Dimension, Net Fold & Highlight Controls */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-3 space-y-2.5">
                <label className="block text-xs font-bold">
                  <span className="mb-1 block">{ts.selectShapeLabel}</span>
                  <select
                    value={demoShape}
                    onChange={(e) => setDemoShape(e.target.value)}
                    className={`w-full rounded-xl border px-2.5 py-1.5 text-xs font-bold ${
                      isDark
                        ? 'border-slate-700 bg-slate-900 text-slate-100'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    {ALL_SHAPES.map((s) => (
                      <option key={s} value={s}>
                        {t.shapes[s]}
                      </option>
                    ))}
                  </select>
                </label>

                {Object.entries(activeDims).map(([dimKey, val]) => (
                  <label key={dimKey} className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-20 shrink-0">{t.dimensionLabels[dimKey] ?? dimKey}</span>
                    <input
                      type="range"
                      min={MIN_DIMENSION}
                      max={MAX_DIMENSION}
                      step={0.5}
                      value={val}
                      onChange={(e) =>
                        setDimsByShape((prev) => ({
                          ...prev,
                          [demoShape]: { ...prev[demoShape], [dimKey]: Number(e.target.value) },
                        }))
                      }
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <span className="w-8 text-right font-mono">{fmt(val)}</span>
                  </label>
                ))}

                {!hasNoNet && (
                  <label className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-20 shrink-0">{ts.foldSliderLabel}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={foldProgress}
                      onChange={(e) => setFoldProgress(Number(e.target.value))}
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <span className="w-8 text-right font-mono">{foldProgress}%</span>
                  </label>
                )}

                <div className="flex flex-wrap gap-1 pt-1">
                  {['all', 'lsa', 'tsa', 'volume'].map((hl) => (
                    <button
                      key={hl}
                      type="button"
                      aria-pressed={highlightMode === hl}
                      onClick={() => setHighlightMode(hl)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
                        highlightMode === hl
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {t.highlightModes[hl]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Combined Solids Decomposition Breakdown */}
              {solvedResult?.partsBreakdown?.length > 0 && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/40 p-3 space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300">
                    {tx.partLabel} · {t.highlightModes.tsa} / {t.highlightModes.volume}
                  </div>
                  {solvedResult.partsBreakdown.map((part, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-xs font-semibold"
                    >
                      <span>{part.label}</span>
                      <span className="font-mono text-indigo-700 dark:text-cyan-300">
                        {part.surfaceArea ?? part.volume}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Interactive Digital Teaching Whiteboard (Steps 1–10 + Canvas) */}
            <div className="lg:col-span-7">
              <TeacherWhiteboard
                solved={localizedSolved}
                language={language}
                isDark={isDark}
                classroomMode={classroomMode}
                revealedSteps={revealedSteps}
                onSetRevealedSteps={setRevealedSteps}
                teacherNotes={teacherNotesByKey[activeNotesKey] ?? ''}
                onChangeTeacherNotes={(val) =>
                  setTeacherNotesByKey((prev) => ({ ...prev, [activeNotesKey]: val }))
                }
                onPrintHandout={() => window.print()}
              />
            </div>
          </section>
          )}

          {/* 3. Classroom Student Practice (Similar Question Generator) + Ask Teacher Studio */}
          <section className="no-print grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Similar NCERT Practice & Knowledge Checks */}
            <div
              className={`lg:col-span-6 rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold">
                    🎯 {tx.studentPractice.checkKnowledge}
                  </h3>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {tx.authenticityPractice}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    aria-label="Practice Difficulty"
                    value={practiceDifficulty}
                    onChange={(e) => handleRegenerateSimilar(e.target.value)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}
                  >
                    <option value="easy">{t.examArena.difficulties.easy}</option>
                    <option value="medium">{t.examArena.difficulties.medium}</option>
                    <option value="advanced">{t.examArena.difficulties.advanced}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRegenerateSimilar(practiceDifficulty)}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    ↻ {tx.studentPractice.generateSimilar}
                  </button>
                </div>
              </div>

              {analyticsSavedToast && (
                <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">
                  ✓ {analyticsSavedToast}
                </p>
              )}

              <div className="space-y-3">
                {similarQuestions.map((sq, idx) => {
                  const picked = pickedBySimId[sq.id]
                  const checked = checkedBySimId[sq.id]
                  const isChecked = typeof checked === 'boolean'
                  return (
                    <div
                      key={sq.id}
                      className={`rounded-xl border p-3.5 space-y-2.5 ${
                        isDark
                          ? 'border-slate-700 bg-slate-800/60'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-bold">
                        Q{idx + 1}. {sq.question}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {sq.options.map((opt, oIdx) => (
                          <button
                            key={opt}
                            type="button"
                            disabled={isChecked}
                            onClick={() =>
                              setPickedBySimId((prev) => ({ ...prev, [sq.id]: oIdx }))
                            }
                            className={`rounded-lg border px-2.5 py-1.5 text-left text-xs font-bold transition cursor-pointer ${
                              isChecked
                                ? oIdx === sq.correctIndex
                                  ? 'border-emerald-500 bg-emerald-100 text-emerald-950'
                                  : picked === oIdx
                                    ? 'border-rose-400 bg-rose-100 text-rose-950'
                                    : 'border-slate-200 bg-white text-slate-400'
                                : picked === oIdx
                                  ? 'border-indigo-600 bg-indigo-100 text-indigo-950'
                                  : 'border-slate-200 bg-white text-slate-800'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </button>
                        ))}
                      </div>

                      {!isChecked ? (
                        <button
                          type="button"
                          disabled={!Number.isInteger(picked)}
                          onClick={() => handleCheckSimilarPractice(sq)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 cursor-pointer"
                        >
                          {tx.studentPractice.checkButton}
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span
                            className={`font-bold ${
                              checked ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {checked ? '✓ Correct! ' : '✕ Incorrect. '}
                            {sq.explanation}
                          </span>
                          {!checked && onDiagnoseWrongAnswer && (
                            <button
                              type="button"
                              onClick={() =>
                                onDiagnoseWrongAnswer({
                                  question: {
                                    ...sq,
                                    shape: solvedResult?.primaryShape ?? demoShape,
                                    solutionSteps: [sq.explanation],
                                  },
                                  wrongOptionIndex: picked,
                                  questionSource: 'teacher_studio',
                                })
                              }
                              className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                            >
                              🔍 Mistake Detective
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Ask the Teacher Studio Interactive Assistant */}
            <div
              className={`lg:col-span-6 rounded-2xl border p-4 sm:p-5 shadow-sm space-y-3.5 ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div>
                <h3 className="text-sm sm:text-base font-extrabold">
                  💬 {tx.askStudio.title}
                </h3>
                <p className="text-[11px] font-semibold opacity-75">
                  {tx.authenticityPractice} · {t.offlineUi?.deviceOnlyTitle ?? 'Local'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tx.askStudio.quickPrompts.map((qp) => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => handleAskAssistant(qp)}
                    className={`rounded-xl border px-2.5 py-1 text-left text-[11px] font-bold transition cursor-pointer ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-cyan-200 hover:bg-slate-700'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                    }`}
                  >
                    {qp}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAskAssistant(askInput)
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder={tx.askStudio.placeholder}
                  className={`flex-1 min-w-0 rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!askInput.trim()}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 disabled:opacity-45 cursor-pointer"
                >
                  {tx.askStudio.askButton}
                </button>
              </form>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {askHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 space-y-1 text-xs ${
                      isDark
                        ? 'border-slate-700 bg-slate-800/80'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-indigo-600 dark:text-cyan-300">
                      Q: {item.question}
                    </div>
                    <p className="leading-relaxed">{item.answer}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
                      <span className="opacity-75">{item.modeLabel}</span>
                      <SpeakControlsBar
                        compact
                        text={item.speakText ?? item.answer}
                        language={item.speakLang ?? language}
                        sourceId={`ask_studio_${item.id}`}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: STRUCTURED NCERT LESSON BUILDER */}
      {studioTab === 'lessons' && (
        <section
          className={`rounded-2xl border p-5 shadow-sm space-y-5 ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-100'
              : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          <div className="no-print flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-extrabold">
              📚 {tx.lessonBuilder.heading}
            </h3>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-1.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              🖨 {tx.lessonBuilder.printBtn}
            </button>
          </div>

          <form onSubmit={handleSaveLessonSubmit} className="no-print grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-bold">
              <span className="mb-1 block">{ts.lessonTitleLabel} *</span>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Combined Solids TSA & Volume"
                className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{tx.lessonBuilder.chapterLabel}</span>
              <input
                type="text"
                value={lessonChapter}
                onChange={(e) => setLessonChapter(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-bold">
                <span className="mb-1 block">{ts.selectShapeLabel}</span>
                <select
                  value={demoShape}
                  onChange={(e) => setDemoShape(e.target.value)}
                  className={`w-full rounded-xl border px-2.5 py-2 text-xs font-bold ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {ALL_SHAPES.map((s) => (
                    <option key={s} value={s}>{t.shapes[s]}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold">
                <span className="mb-1 block">{tx.lessonBuilder.durationLabel}</span>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </label>
            </div>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{tx.lessonBuilder.objectivesLabel}</span>
              <textarea
                rows={2}
                value={lessonObjectives}
                onChange={(e) => setLessonObjectives(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{tx.lessonBuilder.explanationLabel}</span>
              <textarea
                rows={2}
                value={lessonExplanation}
                onChange={(e) => setLessonExplanation(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{tx.lessonBuilder.solvedQsLabel}</span>
              <textarea
                rows={2}
                value={lessonSolvedQs}
                onChange={(e) => setLessonSolvedQs(e.target.value)}
                placeholder={questionInputText.slice(0, 60)}
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{tx.lessonBuilder.practiceQsLabel}</span>
              <textarea
                rows={2}
                value={lessonPracticeQs}
                onChange={(e) => setLessonPracticeQs(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{tx.lessonBuilder.homeworkLabel}</span>
              <textarea
                rows={2}
                value={lessonHomework}
                onChange={(e) => setLessonHomework(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <label className="text-xs font-bold">
              <span className="mb-1 block">{ts.lessonNotesLabel}</span>
              <textarea
                rows={2}
                value={lessonNotes}
                onChange={(e) => setLessonNotes(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </label>

            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 cursor-pointer"
              >
                {editingLessonId ? `✓ ${tx.lessonBuilder.updateExisting}` : `+ ${tx.lessonBuilder.saveNew}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLessonSolvedQs(questionInputText)
                  if (solvedResult?.supported) {
                    setLessonExplanation(solvedResult.formulaSummary)
                  }
                }}
                className="rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800 cursor-pointer"
              >
                + Insert Current Solved Question
              </button>
              {editingLessonId && (
                <button
                  type="button"
                  onClick={resetLessonForm}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  {tx.lessonBuilder.cancelEdit}
                </button>
              )}
            </div>
          </form>

          {/* Saved Lessons Library */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wide opacity-75">
              {ts.savedLessonsTitle} ({savedLessons.length})
            </h4>
            {savedLessons.length === 0 ? (
              <p className="text-xs opacity-70">{tx.lessonBuilder.emptyLessons}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {savedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800/70'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold">
                          <ShapeThumbSvg shape={lesson.shape} className="h-4 w-4 text-indigo-600" />
                          <span>{lesson.title}</span>
                        </div>
                        {lesson.durationMinutes && (
                          <span className="font-mono text-[10px] font-bold opacity-75">
                            {lesson.durationMinutes}m
                          </span>
                        )}
                      </div>
                      {lesson.chapter && (
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-cyan-300">
                          {lesson.chapter}
                        </p>
                      )}
                      {lesson.objectives && (
                        <p className="text-[11px] opacity-85 line-clamp-2">
                          Obj: {lesson.objectives}
                        </p>
                      )}
                      {lesson.homework && (
                        <p className="text-[11px] opacity-80 line-clamp-1">
                          HW: {lesson.homework}
                        </p>
                      )}
                      {lesson.notes && (
                        <p className="text-[11px] opacity-75 line-clamp-2">{lesson.notes}</p>
                      )}
                    </div>

                    <div className="no-print flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDemoShape(lesson.shape)
                          setStudioTab('solver')
                          if (lesson.solvedQuestions) {
                            setQuestionInputText(lesson.solvedQuestions)
                            runSolveOnText(lesson.solvedQuestions, 'custom_question', piMode)
                          }
                        }}
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                      >
                        {ts.loadInDemoButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditLesson(lesson)}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                      >
                        {tx.lessonBuilder.editBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLesson?.(lesson.id)}
                        className="rounded-lg border border-rose-300 px-2.5 py-1 text-[11px] font-bold text-rose-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: EMBEDDED PRINTABLE WORKSHEET & QUESTION BANK GENERATOR */}
      {studioTab === 'worksheets' && (
        <WorksheetGenerator language={language} translations={t} embedded />
      )}

      {/* FULL-SCREEN CLASSROOM PROJECTOR MODE (3D STAGE + LIVE BOARD STEP SIDE-BY-SIDE) */}
      {projectorMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ts.demoModeTitle}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white p-4 sm:p-6 gap-4 overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShapeThumbSvg shape={demoShape} className="h-6 w-6 text-cyan-400" />
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold">{t.shapes[demoShape]}</h2>
                <p className="text-xs text-slate-300">
                  {ts.liveFormulaReadout}: {t.highlightModes.lsa} ={' '}
                  {mensuration.lsa !== null ? `${fmt(mensuration.lsa)} ${areaUnit}` : '—'} |{' '}
                  {t.highlightModes.tsa} = {fmt(mensuration.tsa)} {areaUnit} |{' '}
                  {t.highlightModes.volume} = {fmt(mensuration.volume)} {volUnit}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!hasNoNet && (
                <label className="flex items-center gap-2 text-xs font-bold">
                  <span>{ts.foldSliderLabel}:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={foldProgress}
                    onChange={(e) => setFoldProgress(Number(e.target.value))}
                    className="w-36 accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono">{foldProgress}%</span>
                </label>
              )}
              <button
                type="button"
                onClick={() => setProjectorMode(false)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                {ts.exitProjector} (Esc)
              </button>
            </div>
          </div>

          <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 relative min-h-[260px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <Canvas3D
                shape={demoShape}
                foldProgress={effectiveFold}
                dimensions={activeDims}
                highlightMode={highlightMode}
                translations={t}
                theme="dark"
              />
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-slate-900 p-4 overflow-y-auto space-y-3">
              <div className="space-y-2">
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                  {solvedResult?.supported ? solvedResult.topic : t.shapes[demoShape]}
                </span>
                <p className="text-sm font-bold text-white leading-snug">{questionInputText}</p>
                {activeStepObj && (
                  <div className="rounded-xl border border-cyan-400 bg-slate-950 p-3 space-y-2">
                    <div className="text-xs font-extrabold text-cyan-300">
                      {activeStepObj.title}
                    </div>
                    <p className="whitespace-pre-line text-sm text-slate-100">
                      {activeStepObj.body}
                    </p>
                    <SpeakControlsBar
                      compact
                      text={`${activeStepObj.title}. ${activeStepObj.body}`}
                      language={language}
                      sourceId="projector_step"
                      isDark={true}
                    />
                  </div>
                )}
              </div>

              {solvedResult?.supported && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={revealedSteps <= 1}
                    onClick={() => setRevealedSteps((s) => Math.max(1, s - 1))}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    ← {tx.stepControls.prevStep}
                  </button>
                  <button
                    type="button"
                    disabled={revealedSteps >= solvedResult.steps.length}
                    onClick={() =>
                      setRevealedSteps((s) => Math.min(solvedResult.steps.length, s + 1))
                    }
                    className="rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 disabled:opacity-40 cursor-pointer"
                  >
                    {tx.stepControls.nextStep} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
