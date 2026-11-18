import { useEffect, useMemo, useState } from 'react'
import {
  REALITY_CHALLENGES,
  REALITY_PRESETS,
  computeRealityMetrics,
  normalizeForCanvas3D,
  suggestShapeFromImageMeta,
} from '../data/realityObjects.js'
import { SHAPES } from '../utils/mathEngine.js'
import { TRANSLATIONS } from '../data/translations.js'
import Canvas3D from './Canvas3D.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from './common/UiIcons.jsx'

const SUPPORTED_REALITY_SHAPES = Object.freeze([
  SHAPES.CYLINDER,
  SHAPES.CUBOID,
  SHAPES.CONE,
  SHAPES.CUBE,
  SHAPES.FRUSTUM,
  SHAPES.HEMISPHERE,
  SHAPES.TRIANGULAR_PRISM,
  SHAPES.SQUARE_PYRAMID,
])

function shapeName(t, s) {
  const entry = t.shapes?.[s]
  if (typeof entry === 'string') return entry
  if (entry && typeof entry.name === 'string') return entry.name
  return s
}

function dimensionKeysForShape(shape) {
  if (shape === SHAPES.CUBE) return ['a']
  if (shape === SHAPES.CUBOID) return ['l', 'b', 'h']
  if (shape === SHAPES.CYLINDER || shape === SHAPES.CONE) return ['r', 'h']
  if (shape === SHAPES.TRIANGULAR_PRISM || shape === SHAPES.SQUARE_PYRAMID) return ['a', 'h']
  if (shape === SHAPES.FRUSTUM) return ['r1', 'r2', 'h']
  return ['r'] // HEMISPHERE / SPHERE
}

function fmtNum(v) {
  if (!Number.isFinite(v)) return '—'
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 1 })
  return Number.isInteger(v) ? String(v) : v.toFixed(2)
}

export default function ShapeToRealityLab({
  language = 'en',
  translations: propTranslations,
  theme = 'light',
  onOpenMistakeDetective,
  onRecordRealityAttempt,
}) {
  const t = propTranslations || TRANSLATIONS[language] || TRANSLATIONS.en
  const ru = t.realityUi
  const isDark = theme === 'dark'

  const [selectedPresetId, setSelectedPresetId] = useState(REALITY_PRESETS[0].id)
  const [activeShape, setActiveShape] = useState(REALITY_PRESETS[0].shape)
  const [unit, setUnit] = useState(REALITY_PRESETS[0].defaultUnit)
  const [dimensions, setDimensions] = useState(REALITY_PRESETS[0].defaultDimensions)
  const [ratePerArea, setRatePerArea] = useState(REALITY_PRESETS[0].defaultCostRate)
  const [foldProgress, setFoldProgress] = useState(85)
  const [highlightMode, setHighlightMode] = useState('tsa')
  const [selectedFace, setSelectedFace] = useState(null)

  // Image upload state & honest unconfirmed suggestion separation
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [imageSuggestion, setImageSuggestion] = useState(null)
  const [userConfirmed, setUserConfirmed] = useState(true)

  // Real-world challenge state
  const [challengeAnswers, setChallengeAnswers] = useState({})
  const [challengeChecked, setChallengeChecked] = useState({})

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl)
      }
    }
  }, [uploadedPreviewUrl])

  const activePreset = useMemo(
    () => REALITY_PRESETS.find((p) => p.id === selectedPresetId) ?? REALITY_PRESETS[0],
    [selectedPresetId],
  )

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setActiveShape(preset.shape)
    setUnit(preset.defaultUnit)
    setDimensions({ ...preset.defaultDimensions })
    setRatePerArea(preset.defaultCostRate)
    setUserConfirmed(true)
    setSelectedFace(null)
    setFoldProgress(preset.shape === SHAPES.HEMISPHERE ? 100 : 85)
  }

  const handleUploadFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl)
    const objUrl = URL.createObjectURL(file)
    setUploadedPreviewUrl(objUrl)
    setUploadedFileName(file.name)
    const hint = suggestShapeFromImageMeta({ fileName: file.name, width: 0, height: 0 })
    setImageSuggestion(hint)
    setActiveShape(hint.suggestedShape)
    setUserConfirmed(false) // Requires explicit user confirmation
  }

  const handleImageLoaded = (e) => {
    if (!uploadedFileName) return
    const img = e.currentTarget
    const hint = suggestShapeFromImageMeta({
      fileName: uploadedFileName,
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
    setImageSuggestion(hint)
  }

  const handleClearImage = () => {
    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl)
    setUploadedPreviewUrl(null)
    setUploadedFileName('')
    setImageSuggestion(null)
    setUserConfirmed(true)
  }

  const handleChangeDim = (key, rawVal) => {
    const num = Math.max(0.5, Math.min(200, Number(rawVal) || 1))
    setDimensions((prev) => {
      const next = { ...prev, [key]: num }
      if (activeShape === SHAPES.FRUSTUM) {
        const r1 = next.r1 ?? 5
        const r2 = next.r2 ?? 3
        if (r1 <= r2 && key === 'r1') next.r1 = r2 + 1
        if (r2 >= r1 && key === 'r2') next.r2 = Math.max(1, r1 - 1)
      }
      return next
    })
    setUserConfirmed(true)
  }

  const metrics = useMemo(
    () =>
      computeRealityMetrics({
        shape: activeShape,
        dimensions,
        unit,
        ratePerAreaUnit: ratePerArea,
      }),
    [activeShape, dimensions, unit, ratePerArea],
  )

  const canvasDims = useMemo(
    () => normalizeForCanvas3D(activeShape, dimensions),
    [activeShape, dimensions],
  )

  const dimKeys = dimensionKeysForShape(activeShape)
  const effectiveFold = metrics.supportsFlatNet ? foldProgress : 100

  const handleCheckChallenge = (ch) => {
    const picked = challengeAnswers[ch.id]
    if (!Number.isInteger(picked)) return
    const isCorrect = picked === ch.correctIndex
    setChallengeChecked((prev) => ({
      ...prev,
      [ch.id]: { picked, isCorrect },
    }))
    if (onRecordRealityAttempt) {
      onRecordRealityAttempt(ch, picked, isCorrect)
    }
  }

  const surfaceCls = isDark
    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900'

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Hero Banner */}
      <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900">
              <Box className="w-3.5 h-3.5" aria-hidden="true" />
              {ru.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{ru.title}</h2>
            <p className={`text-sm max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {ru.subtitle}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 self-start lg:self-auto rounded-xl border px-3 py-1.5 text-xs font-extrabold ${
              userConfirmed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {userConfirmed ? (
              <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
            )}
            {userConfirmed ? ru.confirmedBadge : ru.unconfirmedBadge}
          </span>
        </div>
      </section>

      {/* Step 1: Image Upload + Sample Presets */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-extrabold">{ru.uploadSectionTitle}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{ru.uploadButton}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFile}
                className="sr-only"
              />
            </label>
            {uploadedPreviewUrl && (
              <button
                type="button"
                onClick={handleClearImage}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                {ru.clearImage}
              </button>
            )}
          </div>
        </div>

        {/* Honesty Banner separating image-based suggestion from user-confirmed dimensions */}
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-1">
          <p className="font-extrabold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
            {ru.photoHonestyTitle}
          </p>
          <p>{ru.photoHonestyBody}</p>
        </div>

        {/* Uploaded Image Preview + Suggestion Card */}
        {uploadedPreviewUrl && imageSuggestion && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
            <div className="h-36 overflow-hidden rounded-xl border border-indigo-200 bg-white flex items-center justify-center">
              <img
                src={uploadedPreviewUrl}
                alt={uploadedFileName || 'Uploaded real-world object'}
                onLoad={handleImageLoaded}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-extrabold text-amber-900">
                  {ru.suggestionLabel}
                </span>
                <span className="text-xs font-bold text-slate-600 truncate max-w-xs">
                  {uploadedFileName}
                </span>
              </div>
              <p className="text-sm font-extrabold text-indigo-950">
                {shapeName(t, imageSuggestion.suggestedShape)} —{' '}
                {ru.reasonHints[imageSuggestion.reasonKey]}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveShape(imageSuggestion.suggestedShape)
                  setUserConfirmed(true)
                }}
                className="rounded-xl bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-700"
              >
                ✓ {ru.confirmButton}: {shapeName(t, imageSuggestion.suggestedShape)}
              </button>
            </div>
          </div>
        )}

        {/* 8 Sample Real-World Objects */}
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            {ru.presetsTitle}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {REALITY_PRESETS.map((preset) => {
              const active = selectedPresetId === preset.id
              const copy = ru.presets[preset.id]
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    active
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xl" aria-hidden="true">
                      {preset.icon}
                    </span>
                    <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {shapeName(t, preset.shape)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-extrabold text-slate-900">
                    {copy.name}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{copy.desc}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Step 2: Interactive Shape Confirmation, Dimension Inputs & 3D + Net Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold">{ru.step2Title}</h3>
            <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
              {ru.confirmedLabel}
            </span>
          </div>

          {/* Shape Selector */}
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_REALITY_SHAPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setActiveShape(s)
                  setUserConfirmed(true)
                  setSelectedFace(null)
                  if (s === SHAPES.FRUSTUM) {
                    setDimensions({ r1: 6, r2: 3, h: 4 })
                  }
                }}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                  activeShape === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {shapeName(t, s)}
              </button>
            ))}
          </div>

          {/* Physical Unit */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-xs font-bold text-slate-700">{ru.unitLabel}</span>
            <div className="flex gap-1.5">
              {['m', 'cm'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`rounded-lg px-3 py-1 text-xs font-extrabold ${
                    unit === u
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="space-y-3">
            {dimKeys.map((dk) => {
              const val = dimensions[dk] ?? (dk === 'r1' ? 6 : 4)
              return (
                <div key={dk} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label htmlFor={`reality-dim-${dk}`} className="text-slate-700">
                      {ru.dimLabels[dk]} ({unit})
                    </label>
                    <input
                      id={`reality-dim-${dk}`}
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="200"
                      value={val}
                      onChange={(e) => handleChangeDim(dk, e.target.value)}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right font-mono text-xs font-extrabold"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={unit === 'cm' ? '60' : '20'}
                    step="0.5"
                    value={Math.min(unit === 'cm' ? 60 : 20, val)}
                    onChange={(e) => handleChangeDim(dk, e.target.value)}
                    aria-label={ru.dimLabels[dk]}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )
            })}

            {/* Cost rate input */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs font-bold text-slate-600">
              <label htmlFor="reality-rate">
                {ru.rateLabel} (₹/{unit}²)
              </label>
              <input
                id="reality-rate"
                type="number"
                min="0"
                step="0.5"
                value={ratePerArea}
                onChange={(e) => setRatePerArea(Math.max(0, Number(e.target.value) || 0))}
                className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-right font-mono text-xs"
              />
            </div>
          </div>

          {/* Interactive Net Fold Control */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-indigo-950">
              <span>{ru.foldLabel}</span>
              <span className="font-mono">{effectiveFold}%</span>
            </div>
            {metrics.supportsFlatNet ? (
              <input
                type="range"
                min="0"
                max="100"
                value={foldProgress}
                onChange={(e) => setFoldProgress(Number(e.target.value))}
                aria-label={ru.foldLabel}
                className="w-full accent-indigo-600"
              />
            ) : (
              <p className="text-[11px] font-semibold text-amber-900">
                {ru.noFlatNetNote}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {['lsa', 'tsa', 'all'].map((hm) => (
                <button
                  key={hm}
                  type="button"
                  onClick={() => setHighlightMode(hm)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase ${
                    highlightMode === hm
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-indigo-200'
                  }`}
                >
                  {hm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Interactive 3D Stage */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden shadow-sm flex flex-col">
          <div className="relative h-80 sm:h-96 w-full flex-1">
            <Canvas3D
              shape={activeShape}
              foldProgress={effectiveFold}
              dimensions={canvasDims}
              highlightMode={highlightMode}
              selectedFace={selectedFace}
              onSelectFace={setSelectedFace}
              translations={t}
              inlineScrollMode
              theme={theme}
            />
          </div>
          <div className="bg-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
            <span className="font-bold">
              {activePreset.icon} {shapeName(t, activeShape)}
            </span>
            <span className="font-mono text-cyan-300">
              TSA = {metrics.formulaTsa} · V = {metrics.formulaVol}
            </span>
          </div>
        </div>
      </div>

      {/* Step 3: Material Estimates, Formulas & Engineering Rationale */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-extrabold">{ru.metricsTitle}</h3>
          <SpeakControlsBar
            compact
            text={`${shapeName(t, activeShape)}. CSA ${fmtNum(metrics.lsa)} ${unit} squared. TSA ${fmtNum(metrics.tsa)} ${unit} squared. Volume ${fmtNum(metrics.volume)} ${unit} cubed. ${metrics.steps.join(' ')}`}
            language={language}
            sourceId={`reality_${activePreset.id}_${activeShape}`}
            isDark={false}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-500">CSA / LSA ({unit}²)</p>
            <p className="mt-1 text-lg font-black font-mono text-indigo-700">
              {fmtNum(metrics.lsa)}
            </p>
            <p className="text-[10px] font-mono text-slate-500">{metrics.formulaLsa}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-500">TSA ({unit}²)</p>
            <p className="mt-1 text-lg font-black font-mono text-emerald-700">
              {fmtNum(metrics.tsa)}
            </p>
            <p className="text-[10px] font-mono text-slate-500">{metrics.formulaTsa}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-500">Volume ({unit}³)</p>
            <p className="mt-1 text-lg font-black font-mono text-cyan-700">
              {fmtNum(metrics.volume)}
            </p>
            <p className="text-[10px] font-mono text-slate-500">{metrics.formulaVol}</p>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
            <p className="text-[11px] font-bold text-cyan-900">{ru.waterCapacityLabel}</p>
            <p className="mt-1 text-lg font-black font-mono text-cyan-800">
              {fmtNum(metrics.capacityLitres)} L
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[11px] font-bold text-amber-900">{ru.paintNeededLabel}</p>
            <p className="mt-1 text-lg font-black font-mono text-amber-800">
              {metrics.paintLitres.toFixed(2)} L
            </p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-[11px] font-bold text-indigo-900">{ru.packagingSheetLabel}</p>
            <p className="mt-1 text-sm font-black font-mono text-indigo-800">
              {fmtNum(metrics.packagingSheet)} {unit}²
            </p>
            <p className="text-[11px] font-bold text-indigo-700">
              {ru.estimatedCostLabel}: ₹{fmtNum(metrics.estimatedCost)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
              {ru.stepsTitle}
            </h4>
            <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm font-mono text-slate-800">
              {metrics.steps.map((st, idx) => (
                <li key={idx}>{st}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {ru.realLifeTitle}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-950 list-disc pl-5">
              {activePreset.realLifeUses.map((use, idx) => (
                <li key={idx}>{use}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Step 4: Interactive Real-World Challenges -> Connects to Mistake Detective! */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 space-y-4">
        <h3 className="text-sm sm:text-base font-extrabold">{ru.challengesTitle}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {REALITY_CHALLENGES.map((ch, idx) => {
            const picked = challengeAnswers[ch.id]
            const status = challengeChecked[ch.id]
            return (
              <div
                key={ch.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  #{idx + 1}. {ch.question}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ch.options.map((opt, oIdx) => {
                    const isPicked = picked === oIdx
                    const cls = status
                      ? oIdx === ch.correctIndex
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold'
                        : isPicked
                          ? 'border-rose-400 bg-rose-50 text-rose-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      : isPicked
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() =>
                          setChallengeAnswers((prev) => ({ ...prev, [ch.id]: oIdx }))
                        }
                        className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${cls}`}
                      >
                        <strong className="mr-1.5 font-mono">
                          {String.fromCharCode(65 + oIdx)}.
                        </strong>
                        {opt}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!Number.isInteger(picked)}
                    onClick={() => handleCheckChallenge(ch)}
                    className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-indigo-700 disabled:opacity-40"
                  >
                    {ru.challengeCheckBtn}
                  </button>

                  {status && (
                    <div className="flex flex-wrap items-center gap-2">
                      {status.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          {ch.options[ch.correctIndex]}
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            {ch.options[ch.correctIndex]}
                          </span>
                          {onOpenMistakeDetective && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenMistakeDetective({
                                  question: ch,
                                  wrongOptionIndex: status.picked,
                                  questionSource: 'reality_lab',
                                })
                              }
                              className="rounded-lg bg-rose-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-rose-700"
                            >
                              {ru.diagnoseWrongBtn}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
