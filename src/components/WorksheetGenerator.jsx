import { useMemo, useState } from 'react'
import {
  EXAM_TRACKS,
  QUESTION_DIFFICULTIES,
  QUESTION_TOPICS,
  QUESTION_TYPES,
  generateQuestionSet,
} from '../data/questionBank.js'
import { SHAPES } from '../utils/mathEngine.js'

const ALL_SHAPES = Object.values(SHAPES)

/**
 * Organised Question Bank & Worksheet Generator: filters problems by topic, shape,
 * difficulty, question type, exam level, and syllabus scope without duplicates,
 * providing printable Answer Keys, Worked Solutions, Print/PDF export, and .txt download.
 */
export default function WorksheetGenerator({
  language,
  translations: t,
  embedded = false,
}) {
  const wu = t.worksheetUi
  const ea = t.examArena

  const [worksheetTitle, setWorksheetTitle] = useState(wu.worksheetTitleDefault)
  const [topic, setTopic] = useState('all')
  const [shape, setShape] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [examTrack, setExamTrack] = useState('all')
  const [questionType, setQuestionType] = useState('all')
  const [syllabusTag, setSyllabusTag] = useState('all')
  const [count, setCount] = useState(6)
  const [seed, setSeed] = useState(1)
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [includeSolutions, setIncludeSolutions] = useState(true)

  const { questions, totalMatching } = useMemo(
    () =>
      generateQuestionSet({
        examTrack,
        topic,
        shape,
        difficulty,
        questionType,
        syllabusTag,
        count,
        seed,
      }),
    [examTrack, topic, shape, difficulty, questionType, syllabusTag, count, seed],
  )

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print()
    }
  }

  const handleDownloadTxt = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const lines = [
      worksheetTitle || wu.worksheetTitleDefault,
      '====================================================',
      ea.disclaimerBanner,
      '',
    ]

    questions.forEach((q, idx) => {
      const loc = q[language] ?? q.en
      lines.push(
        `Q${idx + 1}. [${ea.tracks[q.examTrack]} | ${ea.difficulties[q.difficulty]} | ${ea.syllabusTags[q.syllabusTag]}]`,
      )
      lines.push(loc.question)
      q.options.forEach((opt, optIdx) => {
        lines.push(`   (${String.fromCharCode(65 + optIdx)}) ${opt}`)
      })
      lines.push('')
    })

    if (includeAnswerKey && questions.length > 0) {
      lines.push('')
      lines.push(wu.answerKeyHeading)
      lines.push('----------------------------------------------------')
      questions.forEach((q, idx) => {
        const loc = q[language] ?? q.en
        const letter = String.fromCharCode(65 + q.correctIndex)
        lines.push(
          `Q${idx + 1}: (${letter}) ${q.options[q.correctIndex]}  [${q.formulaUsed}]`,
        )
        if (includeSolutions) {
          lines.push(`  Shortcut: ${loc.shortcutTip}`)
          lines.push(`  Steps: ${loc.solutionSteps.join(' ')}`)
        }
      })
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'netfold-3d-worksheet.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const wrapperClass = embedded
    ? 'space-y-4'
    : 'mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 space-y-5'

  return (
    <div className={wrapperClass}>
      {/* Filter & Export Controls (Hidden in print output) */}
      <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {wu.headerTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
              {wu.headerSubtitle}
            </p>
          </div>
          <span className="shrink-0 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 font-mono text-xs font-bold text-indigo-800 self-start">
            {wu.matchingLabel}: {totalMatching}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-slate-700 sm:col-span-2">
            <span className="mb-1 block">{wu.filtersHeading} — Title</span>
            <input
              type="text"
              value={worksheetTitle}
              onChange={(e) => setWorksheetTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            />
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{ea.tracks.all}</span>
            <select
              value={examTrack}
              onChange={(e) => setExamTrack(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {['all', ...EXAM_TRACKS].map((tr) => (
                <option key={tr} value={tr}>
                  {ea.tracks[tr]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{ea.difficulties.all}</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {['all', ...QUESTION_DIFFICULTIES].map((d) => (
                <option key={d} value={d}>
                  {ea.difficulties[d]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{ea.topics.all}</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {['all', ...QUESTION_TOPICS].map((tp) => (
                <option key={tp} value={tp}>
                  {ea.topics[tp]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{wu.shapeFilterLabel}</span>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              <option value="all">{wu.allShapesLabel}</option>
              {ALL_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {t.shapes[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{wu.questionTypeLabel}</span>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {['all', ...QUESTION_TYPES].map((qt) => (
                <option key={qt} value={qt}>
                  {wu.types[qt]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{ea.syllabusFilterLabel}</span>
            <select
              value={syllabusTag}
              onChange={(e) => setSyllabusTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              <option value="all">{ea.allSyllabus}</option>
              <option value="ncert_core">{ea.syllabusTags.ncert_core}</option>
              <option value="additional_practice">
                {ea.syllabusTags.additional_practice}
              </option>
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            <span className="mb-1 block">{wu.countLabel}</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {[2, 4, 6, 8, 10, 15, 20].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="accent-indigo-600"
              />
              <span>{wu.toggleAnswerKey}</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="accent-indigo-600"
              />
              <span>{wu.toggleSolutions}</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100 cursor-pointer"
            >
              🔀 {wu.regenerateButton}
            </button>
            <button
              type="button"
              disabled={questions.length === 0}
              onClick={handlePrint}
              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-45 cursor-pointer"
            >
              🖨 {wu.printPdfButton}
            </button>
            <button
              type="button"
              disabled={questions.length === 0}
              onClick={handleDownloadTxt}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-45 cursor-pointer"
            >
              ⬇ {wu.downloadTextButton}
            </button>
          </div>
        </div>
      </section>

      {/* Printable Worksheet Paper Preview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900">
            {worksheetTitle || wu.worksheetTitleDefault}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {questions.length} {ea.questionCountLabel} · {ea.disclaimerBanner}
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-600">
            {wu.emptyWorksheet}
          </div>
        ) : (
          <ol className="space-y-4">
            {questions.map((q, idx) => {
              const loc = q[language] ?? q.en
              return (
                <li
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-indigo-700">
                      Q{idx + 1} · {t.shapes[q.shape]}
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className="rounded bg-white px-2 py-0.5 ring-1 ring-slate-200 text-slate-700">
                        {ea.tracks[q.examTrack]}
                      </span>
                      <span className="rounded bg-white px-2 py-0.5 ring-1 ring-slate-200 text-amber-800">
                        {ea.difficulties[q.difficulty]}
                      </span>
                      <span className="rounded bg-white px-2 py-0.5 ring-1 ring-slate-200 text-emerald-800">
                        {ea.syllabusTags[q.syllabusTag]}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {loc.question}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-800 sm:grid-cols-4">
                    {q.options.map((opt, optIdx) => (
                      <span key={opt} className="rounded bg-white px-2.5 py-1 ring-1 ring-slate-200">
                        ({String.fromCharCode(65 + optIdx)}) {opt}
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {includeAnswerKey && questions.length > 0 && (
          <div className="border-t-2 border-dashed border-slate-300 pt-5 space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              {wu.answerKeyHeading}
            </h4>
            <div className="space-y-2.5">
              {questions.map((q, idx) => {
                const loc = q[language] ?? q.en
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-slate-900">
                      <span>
                        Q{idx + 1} · {wu.answerPrefix}: ({String.fromCharCode(65 + q.correctIndex)}){' '}
                        {q.options[q.correctIndex]}
                      </span>
                      <span className="font-mono text-indigo-700">
                        {q.formulaUsed}
                      </span>
                    </div>
                    {includeSolutions && (
                      <>
                        <p className="font-semibold text-amber-900">
                          ⚡ {loc.shortcutTip}
                        </p>
                        <p className="text-slate-700">
                          {loc.solutionSteps.join(' ')}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
