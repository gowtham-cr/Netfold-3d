import { useEffect, useMemo, useRef, useState } from 'react'
import { getCompositeBuilderTranslations } from '../data/compositeBuilderTranslations.js'
import {
  COMPONENT_COLORS,
  SHAPE_PALETTE_ORDER,
  alignComponentToFloor,
  analyzeCompositeSolid,
  buildPresetCompositeScene,
  centerComponentOver,
  createBuilderComponent,
  deleteCompositeProblemItem,
  duplicateCompositeProblemItem,
  fmtCompositeNum,
  generateComposite7Steps,
  interpretCompositeQuestionText,
  loadSavedCompositeProblems,
  matchComponentRadiusOrWidth,
  saveCompositeProblemItem,
  snapComponentOnTop,
  snapComponentSideBySide,
  updateComponentDimensionAndKeepFloor,
  validateComponentDimensions,
} from '../utils/compositeBuilderEngine.js'
import { MAX_DIMENSION, MIN_DIMENSION } from '../utils/mathEngine.js'
import { attemptBrowserOcr } from '../utils/ncertQuestionSolver.js'
import CompositeBuilderCanvas3D from './CompositeBuilderCanvas3D.jsx'
import ShapeThumbSvg from './ShapeThumbSvg.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'

export default function CompositeSolidBuilder({
  language = 'en',
  translations: t,
  theme = 'light',
  unit = 'cm',
  onBackToSingleMode,
}) {
  const ct = getCompositeBuilderTranslations(language)
  const isDark = theme === 'dark'
  const initialScene = useMemo(() => buildPresetCompositeScene('coneOnCylinder', '22/7'), [])

  // Undo / Redo History for 3D scene components
  const [history, setHistory] = useState(() => ({
    past: [],
    present: initialScene.components,
    future: [],
  }))
  const components = history.present

  const [selectedId, setSelectedId] = useState(initialScene.components[1].id)
  const [dimUnselected, setDimUnselected] = useState(true)
  const [transformMode, setTransformMode] = useState('translate') // 'translate' | 'rotate'
  const [explodeFactor, setExplodeFactor] = useState(0)
  const [isExplodingAnim, setIsExplodingAnim] = useState(false)
  const explodeDirRef = useRef(0)
  const [showDimensions, setShowDimensions] = useState(true)
  const [dimErrorMsg, setDimErrorMsg] = useState('')

  // Question input, image OCR, π mode
  const [questionText, setQuestionText] = useState(initialScene.questionText)
  const [piMode, setPiMode] = useState('22/7')
  const [interpretNotice, setInterpretNotice] = useState('')
  const [uploadedImgUrl, setUploadedImgUrl] = useState(null)
  const [uploadedImgName, setUploadedImgName] = useState('')

  // Snap target selector
  const [snapTargetId, setSnapTargetId] = useState(initialScene.components[0].id)

  // "Understand & Solve" 7-Stage Solution Mode
  const [solveActive, setSolveActive] = useState(false)
  const [solveStepIndex, setSolveStepIndex] = useState(1) // 1..7, 0 means hidden in presentation quiz
  const [presentationMode, setPresentationMode] = useState(false)

  // Save & Reuse Local State
  const [saveTitle, setSaveTitle] = useState('Cone Mounted on Cylinder')
  const [teachingNotes, setTeachingNotes] = useState('')
  const [editingProblemId, setEditingProblemId] = useState(null)
  const [savedProblems, setSavedProblems] = useState(loadSavedCompositeProblems)
  const [saveToast, setSaveToast] = useState('')

  const areaUnit = t.unitSymbols?.[unit]?.area ?? `${unit}²`
  const volUnit = t.unitSymbols?.[unit]?.volume ?? `${unit}³`

  const commitComponents = (nextList) => {
    setHistory((prev) => ({
      past: [...prev.past.slice(-29), prev.present],
      present: nextList,
      future: [],
    }))
  }

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev
      const previous = prev.past[prev.past.length - 1]
      return {
        past: prev.past.slice(0, -1),
        present: previous,
        future: [prev.present, ...prev.future.slice(0, 29)],
      }
    })
  }

  const handleRedo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev
      const next = prev.future[0]
      return {
        past: [...prev.past.slice(-29), prev.present],
        present: next,
        future: prev.future.slice(1),
      }
    })
  }

  // Smooth Explode / Assemble animation loop
  useEffect(() => {
    if (!isExplodingAnim) return undefined
    let rafId = 0
    let last = performance.now()
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const dir = explodeDirRef.current
      let reached = false
      setExplodeFactor((curr) => {
        const next = Math.max(0, Math.min(1, curr + dir * dt * 1.9))
        if ((dir > 0 && next >= 1) || (dir < 0 && next <= 0)) {
          reached = true
        }
        return next
      })
      if (reached) {
        setIsExplodingAnim(false)
      } else {
        rafId = window.requestAnimationFrame(step)
      }
    }
    rafId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(rafId)
  }, [isExplodingAnim])

  useEffect(() => {
    return () => {
      if (uploadedImgUrl) URL.revokeObjectURL(uploadedImgUrl)
    }
  }, [uploadedImgUrl])

  const triggerExplodeToggle = (targetVal) => {
    explodeDirRef.current = targetVal > 0 ? 1 : -1
    setIsExplodingAnim(true)
  }

  // Analysis & 7-Stage Solution
  const analysis = useMemo(
    () => analyzeCompositeSolid(components, { piMode, unit }),
    [components, piMode, unit],
  )

  const sevenSteps = useMemo(
    () => generateComposite7Steps(analysis, questionText, language, t),
    [analysis, questionText, language, t],
  )

  const selectedComponent =
    components.find((c) => c.id === selectedId) ?? components[0] ?? null
  const activeStepObj =
    solveActive && solveStepIndex > 0
      ? sevenSteps[Math.min(solveStepIndex, sevenSteps.length) - 1]
      : null

  const otherComponents = components.filter((c) => c.id !== selectedComponent?.id)
  const resolvedSnapTarget =
    otherComponents.find((c) => c.id === snapTargetId) ?? otherComponents[0] ?? null

  // Component CRUD Handlers
  const handleAddShape = (shape) => {
    const color = COMPONENT_COLORS[components.length % COMPONENT_COLORS.length]
    const createdRaw = createBuilderComponent(shape, { color })
    let nextComp = createdRaw
    if (selectedComponent) {
      nextComp = snapComponentSideBySide(createdRaw, selectedComponent, 'x')
    }
    const nextList = [...components, nextComp]
    commitComponents(nextList)
    setSelectedId(nextComp.id)
    setSnapTargetId(selectedComponent?.id ?? nextComp.id)
    setDimErrorMsg('')
  }

  const handleDuplicateSelected = () => {
    if (!selectedComponent) return
    const cloned = createBuilderComponent(selectedComponent.shape, {
      dimensions: { ...selectedComponent.dimensions },
      rotation: [...selectedComponent.rotation],
      color: COMPONENT_COLORS[components.length % COMPONENT_COLORS.length],
    })
    const placed = snapComponentSideBySide(cloned, selectedComponent, 'x')
    commitComponents([...components, placed])
    setSelectedId(placed.id)
  }

  const handleRemoveComponent = (compId) => {
    const nextList = components.filter((c) => c.id !== compId)
    commitComponents(nextList)
    if (selectedId === compId) {
      setSelectedId(nextList[0]?.id ?? null)
    }
  }

  const handleToggleVisible = (compId) => {
    commitComponents(
      components.map((c) => (c.id === compId ? { ...c, visible: c.visible === false } : c)),
    )
  }

  const handleIsolateComponent = (compId) => {
    const onlyThisVisible = components.every((c) =>
      c.id === compId ? c.visible !== false : c.visible === false,
    )
    commitComponents(
      components.map((c) => ({
        ...c,
        visible: onlyThisVisible ? true : c.id === compId,
      })),
    )
    setSelectedId(compId)
  }

  const handleResetScene = () => {
    commitComponents([])
    setSelectedId(null)
    setExplodeFactor(0)
    setSolveActive(false)
    setDimErrorMsg('')
  }

  const handleLoadPreset = (presetId) => {
    const scene = buildPresetCompositeScene(presetId, piMode)
    commitComponents(scene.components)
    setSelectedId(scene.components[scene.components.length - 1]?.id ?? null)
    setSnapTargetId(scene.components[0]?.id ?? null)
    setQuestionText(scene.questionText)
    setSaveTitle(ct.presets[presetId] ?? 'Composite 3D Problem')
    setExplodeFactor(0)
    setSolveActive(false)
    setEditingProblemId(null)
    setDimErrorMsg('')
  }

  // Transform & Dimension Update Handlers
  const handleTransformComponent = (compId, newPos, newRot) => {
    commitComponents(
      components.map((c) =>
        c.id === compId ? { ...c, position: newPos, rotation: newRot } : c,
      ),
    )
  }

  const handleDimensionChange = (dimKey, rawVal) => {
    if (!selectedComponent) return
    const numeric = Number(rawVal)
    const check = validateComponentDimensions(selectedComponent.shape, {
      ...selectedComponent.dimensions,
      [dimKey]: numeric,
    })
    if (!check.valid) {
      setDimErrorMsg(
        ct.invalidDimAlert
          .replace('{min}', String(MIN_DIMENSION))
          .replace('{max}', String(MAX_DIMENSION)),
      )
    } else {
      setDimErrorMsg('')
    }
    const { component: updated } = updateComponentDimensionAndKeepFloor(
      selectedComponent,
      dimKey,
      numeric,
    )
    commitComponents(
      components.map((c) => (c.id === selectedComponent.id ? updated : c)),
    )
  }

  const handleManualPosChange = (axisIdx, rawVal) => {
    if (!selectedComponent) return
    const num = Number(rawVal)
    if (!Number.isFinite(num)) return
    const nextPos = [...selectedComponent.position]
    nextPos[axisIdx] = Math.max(-25, Math.min(25, Math.round(num * 100) / 100))
    commitComponents(
      components.map((c) =>
        c.id === selectedComponent.id ? { ...c, position: nextPos } : c,
      ),
    )
  }

  const handleManualRotDegChange = (axisIdx, degDeltaOrVal, isRelative = false) => {
    if (!selectedComponent) return
    const nextRot = [...(selectedComponent.rotation ?? [0, 0, 0])]
    const currentDeg = (nextRot[axisIdx] * 180) / Math.PI
    const targetDeg = isRelative ? currentDeg + degDeltaOrVal : Number(degDeltaOrVal)
    if (!Number.isFinite(targetDeg)) return
    nextRot[axisIdx] = Math.round(((targetDeg * Math.PI) / 180) * 1000) / 1000
    commitComponents(
      components.map((c) =>
        c.id === selectedComponent.id ? { ...c, rotation: nextRot } : c,
      ),
    )
  }

  // Smart Snap Handlers
  const applySmartSnap = (action) => {
    if (!selectedComponent) return
    let updated = selectedComponent
    if (action === 'alignFloor') {
      updated = alignComponentToFloor(selectedComponent)
    } else if (!resolvedSnapTarget) {
      return
    } else if (action === 'stackTop') {
      updated = snapComponentOnTop(selectedComponent, resolvedSnapTarget)
    } else if (action === 'sideX') {
      updated = snapComponentSideBySide(selectedComponent, resolvedSnapTarget, 'x')
    } else if (action === 'sideZ') {
      updated = snapComponentSideBySide(selectedComponent, resolvedSnapTarget, 'z')
    } else if (action === 'centerXZ') {
      updated = centerComponentOver(selectedComponent, resolvedSnapTarget)
    } else if (action === 'matchRadius') {
      updated = matchComponentRadiusOrWidth(selectedComponent, resolvedSnapTarget)
    }
    commitComponents(
      components.map((c) => (c.id === selectedComponent.id ? updated : c)),
    )
  }

  // Question Image Upload + Best-Effort Text Interpreter
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadedImgUrl) URL.revokeObjectURL(uploadedImgUrl)
    setUploadedImgUrl(URL.createObjectURL(file))
    setUploadedImgName(file.name)
    const ocr = await attemptBrowserOcr(file)
    setInterpretNotice(ocr.message)
    if (ocr.supported && ocr.extractedText) {
      setQuestionText(ocr.extractedText)
    }
  }

  const handleInterpretQuestion = () => {
    const res = interpretCompositeQuestionText(questionText)
    setInterpretNotice(res.message)
    if (res.interpreted && res.components) {
      commitComponents(res.components)
      setSelectedId(res.components[1]?.id ?? res.components[0]?.id ?? null)
      setSnapTargetId(res.components[0]?.id ?? null)
      setPiMode(res.piMode)
      setExplodeFactor(0)
    }
  }

  // Save / Reopen / Duplicate / Delete Composite Problems
  const handleSaveProblem = (e) => {
    e.preventDefault()
    const { record, list } = saveCompositeProblemItem({
      id: editingProblemId,
      title: saveTitle.trim() || 'Custom Composite 3D Problem',
      questionText,
      teachingNotes,
      piMode,
      components,
    })
    setSavedProblems(list)
    setEditingProblemId(record.id)
    setSaveToast(ct.saveReuse.savedToast)
  }

  const handleOpenSaved = (prob) => {
    commitComponents(prob.components ?? [])
    setSelectedId(prob.components?.[0]?.id ?? null)
    setQuestionText(prob.questionText ?? '')
    setTeachingNotes(prob.teachingNotes ?? '')
    setSaveTitle(prob.title ?? '')
    setPiMode(prob.piMode ?? '22/7')
    setEditingProblemId(prob.id)
    setExplodeFactor(0)
    setSolveActive(false)
    setSaveToast('')
  }

  const handleDuplicateSaved = (probId) => {
    setSavedProblems(duplicateCompositeProblemItem(probId))
  }

  const handleDeleteSaved = (probId) => {
    setSavedProblems(deleteCompositeProblemItem(probId))
    if (editingProblemId === probId) setEditingProblemId(null)
  }

  const cardSurface = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900'

  const selectedAnalysis =
    analysis.componentAnalyses.find((ca) => ca.id === selectedComponent?.id) ?? null

  const activeSpeakText = activeStepObj
    ? `${activeStepObj.title}. ${activeStepObj.body}`
    : `${questionText}. ${ct.totalVolumeLabel}: ${fmtCompositeNum(
        analysis.totalVolume,
      )} ${volUnit}. ${ct.externalSurfaceAreaLabel}: ${fmtCompositeNum(
        analysis.externalSurfaceArea,
      )} ${areaUnit}.`

  return (
    <div className="space-y-5">
      {/* Header & Top Action Toolbar */}
      <section className={`no-print rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${cardSurface}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold">
              🧱 {ct.title}
            </h3>
            <p className="text-xs opacity-80 max-w-3xl">{ct.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onBackToSingleMode && (
              <button
                type="button"
                onClick={onBackToSingleMode}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ← {ct.backToSingleButton}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSolveActive(true)
                setSolveStepIndex(0)
                setPresentationMode(true)
              }}
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
            >
              🖥 {ct.presentation.openBtn}
            </button>
          </div>
        </div>

        {/* Starter Presets Row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wide opacity-75">
            {ct.starterPresetsHeading}:
          </span>
          {['coneOnCylinder', 'hemiOnCylinder', 'twoCuboidsSide', 'capsule'].map((pId) => (
            <button
              key={pId}
              type="button"
              onClick={() => handleLoadPreset(pId)}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-900 hover:bg-indigo-100 cursor-pointer"
            >
              {ct.presets[pId]}
            </button>
          ))}
        </div>

        {/* Shape Library Buttons (All 15 Supported Shapes) */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide opacity-75">
            {ct.shapeLibraryHeading}:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SHAPE_PALETTE_ORDER.map((sh) => (
              <button
                key={sh}
                type="button"
                onClick={() => handleAddShape(sh)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-indigo-50 hover:border-indigo-300'
                }`}
              >
                <ShapeThumbSvg shape={sh} className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>+ {t.shapes[sh]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Responsive Split: 3D Stage (Left) + Scene Inspector & Smart Snap (Right) */}
      <section className="no-print grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Interactive 3D Workspace + Transform Gizmo + Explode Controls */}
        <div className={`lg:col-span-7 rounded-2xl border p-4 shadow-sm space-y-3 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
              {['translate', 'rotate'].map((modeKey) => (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => setTransformMode(modeKey)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                    transformMode === modeKey
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {ct.modes[modeKey]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={history.past.length === 0}
                onClick={handleUndo}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                ↩ {ct.undo}
              </button>
              <button
                type="button"
                disabled={history.future.length === 0}
                onClick={handleRedo}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                ↪ {ct.redo}
              </button>
              <button
                type="button"
                onClick={() => setShowDimensions((v) => !v)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                  showDimensions
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                    : 'border-slate-300 text-slate-600'
                }`}
              >
                📏 {showDimensions ? ct.dimToggleHide : ct.dimToggleShow}
              </button>
              <button
                type="button"
                onClick={handleResetScene}
                className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100 cursor-pointer"
              >
                🗑 {ct.resetScene}
              </button>
            </div>
          </div>

          <div className="relative h-80 sm:h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <CompositeBuilderCanvas3D
              components={components}
              selectedId={selectedComponent?.id ?? null}
              highlightedComponentId={activeStepObj?.highlightId ?? null}
              dimUnselected={dimUnselected}
              explodeFactor={explodeFactor}
              showDimensions={showDimensions}
              transformMode={transformMode}
              enableGizmo={!solveActive}
              contactInterfaces={analysis.contactInterfaces}
              translations={t}
              unit={unit}
              theme={theme}
              onSelectComponent={setSelectedId}
              onTransformComponent={handleTransformComponent}
            />
          </div>

          {/* Explode / Assemble Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30 px-3.5 py-2.5">
            <span className="text-xs font-extrabold">{ct.explodeLabel}:</span>
            <input
              type="range"
              aria-label={ct.explodeLabel}
              min={0}
              max={1}
              step={0.02}
              value={explodeFactor}
              onChange={(e) => {
                setIsExplodingAnim(false)
                setExplodeFactor(Number(e.target.value))
              }}
              className="flex-1 min-w-[120px] accent-indigo-600 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold w-10 text-right">
              {Math.round(explodeFactor * 100)}%
            </span>
            <button
              type="button"
              onClick={() => triggerExplodeToggle(explodeFactor < 0.5 ? 1 : 0)}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
            >
              {explodeFactor < 0.5 ? ct.explodeBtn : ct.assembleBtn}
            </button>
          </div>

          {/* Question Input & Image OCR Bar (Req 8) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-extrabold">{ct.questionPanel.heading}</p>
              <select
                aria-label="Pi Mode"
                value={piMode}
                onChange={(e) => setPiMode(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-xs font-bold"
              >
                <option value="22/7">π = 22/7</option>
                <option value="3.14">π = 3.14</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={ct.questionPanel.placeholder}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-medium ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-slate-300 bg-slate-50 text-slate-900'
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleInterpretQuestion}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                ⚡ {ct.questionPanel.interpretBtn}
              </button>
              <label className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                📷 {ct.questionPanel.uploadImageBtn}
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
                  }}
                  className="rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-bold text-rose-700 cursor-pointer"
                >
                  {ct.questionPanel.clearImageBtn}
                </button>
              )}
            </div>
            <p className="text-[11px] opacity-75">ℹ️ {ct.questionPanel.manualHonestyNote}</p>
            {interpretNotice && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900">
                {interpretNotice}
              </p>
            )}
            {uploadedImgUrl && (
              <img
                src={uploadedImgUrl}
                alt={uploadedImgName || 'Uploaded composite question'}
                className="max-h-28 rounded-lg border border-slate-200 bg-white object-contain p-1"
              />
            )}
          </div>
        </div>

        {/* Right: Component List, Dimension Editor, Smart Snap & Manual Transforms */}
        <div className={`lg:col-span-5 rounded-2xl border p-4 shadow-sm space-y-4 ${cardSurface}`}>
          {/* Component List */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wide">
                {ct.componentsListHeading} ({components.length})
              </h4>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimUnselected}
                  onChange={(e) => setDimUnselected(e.target.checked)}
                />
                <span>{ct.dimSelectedOnlyLabel}</span>
              </label>
            </div>

            {components.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs opacity-75">
                {ct.emptySceneNote}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {components.map((comp, idx) => {
                  const active = comp.id === selectedComponent?.id
                  const hidden = comp.visible === false
                  const isolated = components.every((x) =>
                    x.id === comp.id ? x.visible !== false : x.visible === false,
                  )
                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedId(comp.id)}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs cursor-pointer transition ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 ring-1 ring-indigo-300'
                          : isDark
                            ? 'border-slate-700 bg-slate-800/70'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: comp.color }}
                        />
                        <span className="font-extrabold truncate">
                          {ct.componentPrefix} {idx + 1}: {t.shapes[comp.shape]}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(comp.id)}
                          className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-800 cursor-pointer"
                        >
                          {hidden ? ct.showLabel : ct.hideLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIsolateComponent(comp.id)}
                          className="rounded border border-cyan-300 bg-cyan-50 px-1.5 py-0.5 text-[10px] font-bold text-cyan-900 cursor-pointer"
                        >
                          {isolated ? ct.unisolateLabel : ct.isolateLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(comp.id)}
                          className="rounded border border-rose-300 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Component Dimension Editor & Individual Contribution */}
          {selectedComponent && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold">
                  {ct.selectedDimsHeading}: {t.shapes[selectedComponent.shape]}
                </span>
                <button
                  type="button"
                  onClick={handleDuplicateSelected}
                  className="rounded-lg border border-indigo-300 bg-white px-2 py-0.5 text-[11px] font-bold text-indigo-800 cursor-pointer"
                >
                  + {ct.duplicate}
                </button>
              </div>

              {dimErrorMsg && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                  ⚠️ {dimErrorMsg}
                </p>
              )}

              <div className="space-y-2">
                {Object.entries(selectedComponent.dimensions).map(([dimKey, val]) => (
                  <label key={dimKey} className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-24 shrink-0">
                      {t.dimensionLabels?.[dimKey] ?? dimKey} ({unit})
                    </span>
                    <input
                      type="range"
                      min={MIN_DIMENSION}
                      max={MAX_DIMENSION}
                      step={0.5}
                      value={val}
                      onChange={(e) => handleDimensionChange(dimKey, e.target.value)}
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      aria-label={`${selectedComponent.shape} ${dimKey}`}
                      min={MIN_DIMENSION}
                      max={MAX_DIMENSION}
                      step={0.5}
                      value={val}
                      onChange={(e) => handleDimensionChange(dimKey, e.target.value)}
                      className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs text-slate-900"
                    />
                  </label>
                ))}
              </div>

              {selectedAnalysis && (
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-slate-900">
                    <div className="text-[10px] font-bold text-slate-500">
                      {t.highlightModes.volume}
                    </div>
                    <div className="font-mono text-xs font-extrabold text-indigo-700">
                      {fmtCompositeNum(selectedAnalysis.volume)} {volUnit}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-slate-900">
                    <div className="text-[10px] font-bold text-slate-500">
                      {t.highlightModes.tsa}
                    </div>
                    <div className="font-mono text-xs font-extrabold text-emerald-700">
                      {fmtCompositeNum(selectedAnalysis.tsa)} {areaUnit}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-slate-900">
                    <div className="text-[10px] font-bold text-slate-500">
                      {selectedAnalysis.slantHeight !== null ? 'l / s' : t.highlightModes.lsa}
                    </div>
                    <div className="font-mono text-xs font-extrabold text-amber-700">
                      {selectedAnalysis.slantHeight !== null
                        ? `${fmtCompositeNum(selectedAnalysis.slantHeight)} ${unit}`
                        : selectedAnalysis.lsa !== null
                          ? `${fmtCompositeNum(selectedAnalysis.lsa)} ${areaUnit}`
                          : '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Snap & Alignment Controls */}
          {selectedComponent && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30 p-3 space-y-2">
              <p className="text-xs font-extrabold">🧲 {ct.snapHeading}</p>
              {otherComponents.length > 0 && (
                <label className="block text-[11px] font-bold">
                  <span className="mb-1 block">{ct.snapTargetLabel}:</span>
                  <select
                    aria-label={ct.snapTargetLabel}
                    value={resolvedSnapTarget?.id ?? ''}
                    onChange={(e) => setSnapTargetId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900"
                  >
                    {otherComponents.map((oc) => {
                      const origIdx = components.findIndex((x) => x.id === oc.id)
                      return (
                        <option key={oc.id} value={oc.id}>
                          {ct.componentPrefix} {origIdx + 1}: {t.shapes[oc.shape]}
                        </option>
                      )
                    })}
                  </select>
                </label>
              )}

              <div className="flex flex-wrap gap-1.5">
                {['stackTop', 'sideX', 'sideZ', 'centerXZ', 'matchRadius'].map((act) => (
                  <button
                    key={act}
                    type="button"
                    disabled={otherComponents.length === 0}
                    onClick={() => applySmartSnap(act)}
                    className="rounded-lg border border-indigo-300 bg-white px-2 py-1 text-[11px] font-bold text-indigo-900 hover:bg-indigo-100 disabled:opacity-40 cursor-pointer"
                  >
                    {ct.snapActions[act]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => applySmartSnap('alignFloor')}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                >
                  {ct.snapActions.alignFloor}
                </button>
              </div>
            </div>
          )}

          {/* Manual X/Y/Z Position & Rotation Numeric Controls */}
          {selectedComponent && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide opacity-80">
                {ct.manualPositionHeading}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axisKey, idx) => (
                  <label key={axisKey} className="text-[11px] font-bold">
                    <span className="block mb-0.5 truncate">{ct.positionLabels[axisKey]}</span>
                    <input
                      type="number"
                      step={0.5}
                      value={selectedComponent.position[idx]}
                      onChange={(e) => handleManualPosChange(idx, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900"
                    />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['rx', 'ry', 'rz'].map((rotKey, idx) => (
                  <div key={rotKey} className="text-[11px] font-bold space-y-1">
                    <span className="block">{ct.rotationLabels[rotKey]}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleManualRotDegChange(idx, -45, true)}
                        className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-800 cursor-pointer"
                      >
                        -45°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleManualRotDegChange(idx, 45, true)}
                        className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-800 cursor-pointer"
                      >
                        +45°
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Automatic Composite Problem Analysis & Contact Surface Verification (Req 5 & 6) */}
      <section className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold">📐 {ct.combineModeHeading}</h3>
            <p className="text-xs opacity-75">{ct.combineModes.naiveWarning}</p>
          </div>
          <button
            type="button"
            disabled={analysis.status === 'empty'}
            onClick={() => {
              setSolveActive(true)
              setSolveStepIndex(1)
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-45 cursor-pointer"
          >
            🧠 {ct.understandAndSolveBtn}
          </button>
        </div>

        {/* Status Warnings for Overlap / Disconnected Solids / Empty Scene */}
        {analysis.status === 'empty' && (
          <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs font-semibold">
            {ct.warnings.noComponents}
          </p>
        )}

        {analysis.status === 'overlap_warning' && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-950 space-y-1">
            <p className="font-extrabold">⚠️ {ct.warnings.overlapTitle}</p>
            <p>{ct.warnings.overlapBody}</p>
          </div>
        )}

        {analysis.status === 'disconnected_warning' && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-1">
            <p className="font-extrabold">⚠️ {ct.warnings.disconnectedTitle}</p>
            <p>{ct.warnings.disconnectedBody}</p>
          </div>
        )}

        {/* Calculated Combined Volume & External Surface Area Metrics */}
        {analysis.componentAnalyses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-indigo-800">{ct.totalVolumeLabel}</div>
              <div className="mt-1 font-mono text-lg font-black text-indigo-950">
                {fmtCompositeNum(analysis.totalVolume)} {volUnit}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-emerald-800">
                {ct.externalSurfaceAreaLabel}
              </div>
              <div className="mt-1 font-mono text-lg font-black text-emerald-950">
                {fmtCompositeNum(analysis.externalSurfaceArea)} {areaUnit}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-slate-600">{ct.naiveTsaSumLabel}</div>
              <div className="mt-1 font-mono text-base font-extrabold text-slate-800">
                {fmtCompositeNum(analysis.naiveTsaSum)} {areaUnit}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-slate-900">
              <div className="text-[11px] font-bold text-amber-900">
                {ct.hiddenContactExcludedLabel}
              </div>
              <div className="mt-1 font-mono text-base font-extrabold text-amber-950">
                − {fmtCompositeNum(analysis.excludedContactArea)} {areaUnit}
              </div>
            </div>
          </div>
        )}

        {/* Surface Exclusion Breakdown */}
        {analysis.contactInterfaces.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-950 space-y-1">
            <p className="font-extrabold">🔎 {ct.excludedSurfacesHeading}:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              {analysis.contactInterfaces.map((ji) => (
                <li key={ji.id}>
                  {ct.componentPrefix} {ji.aIndex + 1} ↔ {ct.componentPrefix} {ji.bIndex + 1}:{' '}
                  <strong className="font-mono">
                    2 × {fmtCompositeNum(ji.singleFaceArea)} ={' '}
                    {fmtCompositeNum(ji.excludedTotalArea)} {areaUnit}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive 7-Stage Solution Mode ("Understand & Solve") */}
        {solveActive && analysis.componentAnalyses.length > 0 && (
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-950 p-4 sm:p-5 text-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-cyan-300">
                  {ct.understandAndSolveBtn} ·{' '}
                  {ct.stepControls.stepOf
                    .replace('{n}', String(solveStepIndex))
                    .replace('{total}', String(sevenSteps.length))}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={solveStepIndex <= 1}
                  onClick={() => setSolveStepIndex((s) => Math.max(1, s - 1))}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  ← {ct.stepControls.prev}
                </button>
                <button
                  type="button"
                  disabled={solveStepIndex >= sevenSteps.length}
                  onClick={() =>
                    setSolveStepIndex((s) => Math.min(sevenSteps.length, s + 1))
                  }
                  className="rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 disabled:opacity-40 cursor-pointer"
                >
                  {ct.stepControls.next} →
                </button>
                <button
                  type="button"
                  onClick={() => setSolveStepIndex(sevenSteps.length)}
                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 cursor-pointer"
                >
                  ✓ {ct.stepControls.revealAll}
                </button>
                <button
                  type="button"
                  onClick={() => setSolveStepIndex(1)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  ↺ {ct.stepControls.restart}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {sevenSteps.slice(0, solveStepIndex).map((st, idx) => {
                const isLatest = idx === solveStepIndex - 1
                return (
                  <div
                    key={st.stepNo}
                    className={`rounded-xl border p-3 ${
                      isLatest
                        ? 'border-cyan-400 bg-slate-900 ring-1 ring-cyan-400/40'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-cyan-300">{st.title}</div>
                    <p className="mt-1 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-100">
                      {st.body}
                    </p>
                  </div>
                )
              })}
            </div>

            <SpeakControlsBar
              text={activeSpeakText}
              language={language}
              sourceId="composite_builder_step"
              isDark={true}
            />
          </div>
        )}

        {/* Complete Printable Question & 7-Stage Solution Summary */}
        {analysis.componentAnalyses.length > 0 && (
          <div className="hidden print:block space-y-2 border-t border-slate-300 pt-3">
            <h4 className="text-sm font-extrabold">{saveTitle || ct.title}</h4>
            <p className="text-xs font-semibold">{questionText}</p>
            {sevenSteps.map((st) => (
              <div key={st.stepNo} className="text-xs">
                <strong>{st.title}:</strong> {st.body}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save, Reopen, Duplicate & Print Custom Composite Models (Req 9 - Local Storage Only) */}
      <section className={`no-print rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold">💾 {ct.saveReuse.heading}</h3>
            <p className="text-[11px] opacity-75">{ct.saveReuse.localOnlyNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-emerald-400 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
          >
            🖨 {ct.saveReuse.printBtn}
          </button>
        </div>

        <form onSubmit={handleSaveProblem} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder={ct.saveReuse.titlePlaceholder}
            className={`sm:col-span-5 rounded-xl border px-3 py-2 text-xs font-bold ${
              isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
            }`}
          />
          <input
            type="text"
            value={teachingNotes}
            onChange={(e) => setTeachingNotes(e.target.value)}
            placeholder={ct.saveReuse.notesPlaceholder}
            className={`sm:col-span-5 rounded-xl border px-3 py-2 text-xs ${
              isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
            }`}
          />
          <button
            type="submit"
            disabled={components.length === 0}
            className="sm:col-span-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
          >
            + {ct.saveReuse.saveBtn}
          </button>
        </form>

        {saveToast && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ {saveToast}</p>
        )}

        {savedProblems.length === 0 ? (
          <p className="text-xs opacity-70">{ct.saveReuse.emptySaved}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedProblems.map((prob) => (
              <div
                key={prob.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-extrabold">{prob.title}</h4>
                    <p className="text-[11px] opacity-75">
                      {prob.components?.length ?? 0} {ct.componentsListHeading} · π={prob.piMode}
                    </p>
                  </div>
                </div>
                {prob.teachingNotes && (
                  <p className="text-[11px] italic opacity-80 line-clamp-2">{prob.teachingNotes}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenSaved(prob)}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                  >
                    {ct.saveReuse.reopenBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateSaved(prob.id)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                  >
                    {ct.saveReuse.duplicateBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(prob.id)}
                    className="rounded-lg border border-rose-300 px-2.5 py-1 text-[11px] font-bold text-rose-600 cursor-pointer"
                  >
                    {ct.saveReuse.deleteBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Full-Screen Teacher Presentation Mode Dialog (Req 7) */}
      {presentationMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ct.presentation.title}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white p-4 sm:p-6 gap-4 overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-cyan-300">
                🖥 {ct.presentation.title}: {saveTitle || ct.title}
              </h2>
              <p className="text-xs text-slate-300">
                {ct.totalVolumeLabel}: {fmtCompositeNum(analysis.totalVolume)} {volUnit} ·{' '}
                {ct.externalSurfaceAreaLabel}: {fmtCompositeNum(analysis.externalSurfaceArea)}{' '}
                {areaUnit}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => triggerExplodeToggle(explodeFactor < 0.5 ? 1 : 0)}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer"
              >
                {explodeFactor < 0.5 ? ct.explodeBtn : ct.assembleBtn}
              </button>
              <button
                type="button"
                onClick={() => setShowDimensions((v) => !v)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                {showDimensions ? ct.dimToggleHide : ct.dimToggleShow}
              </button>
              <button
                type="button"
                onClick={() => setPresentationMode(false)}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-extrabold text-white cursor-pointer"
              >
                ✕ {ct.presentation.exitBtn}
              </button>
            </div>
          </div>

          <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 relative min-h-[260px] rounded-2xl border border-slate-800 overflow-hidden">
              <CompositeBuilderCanvas3D
                components={components}
                selectedId={selectedComponent?.id ?? null}
                highlightedComponentId={selectedId}
                dimUnselected={dimUnselected}
                explodeFactor={explodeFactor}
                showDimensions={showDimensions}
                transformMode="translate"
                enableGizmo={false}
                contactInterfaces={analysis.contactInterfaces}
                translations={t}
                unit={unit}
                theme="dark"
                onSelectComponent={setSelectedId}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-slate-900 p-4 overflow-y-auto space-y-3">
              <div className="space-y-3">
                <p className="text-sm font-bold text-white leading-snug">{questionText}</p>

                {/* Quick component highlight selector pills */}
                <div className="flex flex-wrap gap-1.5">
                  {components.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                        selectedId === c.id
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      #{idx + 1} {t.shapes[c.shape]}
                    </button>
                  ))}
                </div>

                {solveStepIndex === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-300">
                    {ct.stepControls.hiddenNote}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sevenSteps.slice(0, solveStepIndex).map((st) => (
                      <div
                        key={st.stepNo}
                        className="rounded-xl border border-cyan-500/40 bg-slate-950 p-3"
                      >
                        <div className="text-xs font-extrabold text-cyan-300">{st.title}</div>
                        <p className="mt-1 whitespace-pre-line text-xs text-slate-100">
                          {st.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={solveStepIndex <= 0}
                    onClick={() => setSolveStepIndex((s) => Math.max(0, s - 1))}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    ← {ct.stepControls.prev}
                  </button>
                  <button
                    type="button"
                    disabled={solveStepIndex >= sevenSteps.length}
                    onClick={() =>
                      setSolveStepIndex((s) => Math.min(sevenSteps.length, s + 1))
                    }
                    className="rounded-lg bg-cyan-400 px-3 py-1 text-xs font-extrabold text-slate-950 disabled:opacity-40 cursor-pointer"
                  >
                    {ct.stepControls.next} →
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolveStepIndex(sevenSteps.length)}
                    className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-extrabold text-slate-950 cursor-pointer"
                  >
                    ✓ {ct.stepControls.revealAll}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolveStepIndex(0)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold cursor-pointer"
                  >
                    ↺ {ct.stepControls.restart}
                  </button>
                </div>

                <SpeakControlsBar
                  text={activeSpeakText}
                  language={language}
                  sourceId="composite_presentation_step"
                  isDark={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
