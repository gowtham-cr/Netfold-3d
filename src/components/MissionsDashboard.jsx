import { useMemo, useState } from 'react'
import Canvas3D from './Canvas3D.jsx'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import MissionModal from './MissionModal.jsx'
import NetGridSvg from './netlab/NetGridSvg.jsx'
import {
  CUBE_NET_CHALLENGES,
  MISSION_IDS,
  MISSIONS_CONTENT,
  calculateMissionStars,
  evaluateClassroomPainterAnswer,
  evaluateCubeNetAnswer,
  evaluatePackagingOptimiser,
  evaluateWaterTankDesign,
} from '../data/missions.js'
import { SHAPES } from '../utils/mathEngine.js'
import { stopSpeechGlobal } from '../utils/speechEngine.js'

function getMissionCanvasConfig({
  missionId,
  cubeChallengeIdx,
  cubeFold,
  cubeSolvedVisual,
  tankRadius,
  tankHeight,
  packL,
  packB,
  packH,
}) {
  if (missionId === 'cube_net') {
    const ch =
      CUBE_NET_CHALLENGES[cubeChallengeIdx] ?? CUBE_NET_CHALLENGES[0]
    return {
      shape: SHAPES.CUBE,
      foldProgress: cubeFold,
      dimensions: { a: 3 },
      highlightMode: 'all',
      customCubeNet: {
        cells: ch.cells,
        rootIndex: ch.rootIndex,
        maskFaceRoles: !cubeSolvedVisual,
      },
    }
  }
  if (missionId === 'classroom_painter') {
    return {
      shape: SHAPES.CUBOID,
      foldProgress: 100,
      dimensions: { l: 8, b: 6, h: 4 },
      highlightMode: 'lsa',
      customCubeNet: null,
    }
  }
  if (missionId === 'water_tank') {
    // Scale tank proportionally inside [1..10] canvas bounds while keeping true aspect ratio
    const safeR = Math.max(0.2, Math.min(5, Number(tankRadius) || 0.7))
    const safeH = Math.max(0.2, Math.min(8, Number(tankHeight) || 1.0))
    const scale = 3.2
    return {
      shape: SHAPES.CYLINDER,
      foldProgress: 100,
      dimensions: {
        r: Math.max(0.8, Math.min(8, safeR * scale)),
        h: Math.max(0.8, Math.min(10, safeH * scale)),
      },
      highlightMode: 'volume',
      customCubeNet: null,
    }
  }
  return {
    shape: SHAPES.CUBOID,
    foldProgress: 100,
    dimensions: {
      l: Math.max(0.6, Math.min(16, Number(packL) || 2)),
      b: Math.max(0.6, Math.min(16, Number(packB) || 4)),
      h: Math.max(0.6, Math.min(16, Number(packH) || 8)),
    },
    highlightMode: 'tsa',
    customCubeNet: null,
  }
}

/**
 * Interactive STEM Missions Dashboard covering 4 curriculum missions:
 * 1) Cube Net Challenge, 2) Classroom Painter, 3) Mid-Day Meal Water Tank,
 * 4) Packaging Optimiser — with 3D previews, hints after 2 mistakes, voice read-aloud,
 * 1-3 stars, localStorage persistence, and full 5-language support.
 */
export default function MissionsDashboard({
  language,
  translations: t,
  theme = 'light',
  missionsProgress,
  onUpdateMissionProgress,
  onResetAllMissions,
  requestedMissionId = null,
}) {
  const ui = t.missionsUi
  const content = MISSIONS_CONTENT[language] ?? MISSIONS_CONTENT.en

  const [activeMission, setActiveMission] = useState(() =>
    MISSION_IDS.includes(requestedMissionId) ? requestedMissionId : MISSION_IDS[0],
  )
  const [selectedFace, setSelectedFace] = useState(null)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', text: string }
  const [modalState, setModalState] = useState(null)

  // Mission 1: Cube Net Challenge
  const [cubeRoundIdx, setCubeRoundIdx] = useState(0)
  const [cubeFold, setCubeFold] = useState(15)
  const [chosenTopFace, setChosenTopFace] = useState(null)
  const [cubeSolvedVisual, setCubeSolvedVisual] = useState(false)

  // Mission 2: Classroom Painter
  const [wallsAreaInput, setWallsAreaInput] = useState('')

  // Mission 3: Mid-Day Meal Water Tank
  const [tankRadius, setTankRadius] = useState(1.0)
  const [tankHeight, setTankHeight] = useState(1.0)

  // Mission 4: Packaging Optimiser
  const [packL, setPackL] = useState(2)
  const [packB, setPackB] = useState(4)
  const [packH, setPackH] = useState(8)
  const [packReason, setPackReason] = useState('')

  const handleSelectMission = (missionId) => {
    stopSpeechGlobal()
    setActiveMission(missionId)
    setFeedback(null)
    setSelectedFace(null)
  }

  const mData = content[activeMission] ?? content.cube_net
  const mState = missionsProgress?.[activeMission] ?? {
    completed: false,
    stars: 0,
    attempts: 0,
  }

  const completedCount = MISSION_IDS.filter(
    (id) => missionsProgress?.[id]?.completed,
  ).length
  const totalStarsEarned = MISSION_IDS.reduce(
    (sum, id) => sum + (missionsProgress?.[id]?.stars ?? 0),
    0,
  )

  const canvasConfig = getMissionCanvasConfig({
    missionId: activeMission,
    cubeChallengeIdx: cubeRoundIdx,
    cubeFold,
    cubeSolvedVisual,
    tankRadius,
    tankHeight,
    packL,
    packB,
    packH,
  })

  const tankLiveEval = useMemo(
    () => evaluateWaterTankDesign(tankRadius, tankHeight, 1540),
    [tankRadius, tankHeight],
  )

  const packLiveEval = useMemo(
    () => evaluatePackagingOptimiser(packL, packB, packH, packReason, 64),
    [packL, packB, packH, packReason],
  )

  const recordOutcome = (missionId, isSuccess, customFeedbackText) => {
    const prev = missionsProgress?.[missionId] ?? {
      completed: false,
      stars: 0,
      attempts: 0,
    }
    const nextAttempts = prev.attempts + 1

    if (isSuccess) {
      const earnedStars = Math.max(
        prev.stars ?? 0,
        calculateMissionStars(nextAttempts),
      )
      onUpdateMissionProgress(missionId, {
        completed: true,
        stars: earnedStars,
        attempts: nextAttempts,
      })
      setFeedback({ type: 'success', text: customFeedbackText })
      setModalState({
        title: ui.successTitle,
        stars: earnedStars,
        message: customFeedbackText,
        attempts: nextAttempts,
      })
    } else {
      onUpdateMissionProgress(missionId, {
        ...prev,
        attempts: nextAttempts,
      })
      setFeedback({ type: 'error', text: customFeedbackText })
    }
  }

  const handleVerifyMission = (e) => {
    e.preventDefault()

    if (activeMission === 'cube_net') {
      const res = evaluateCubeNetAnswer(cubeRoundIdx, chosenTopFace)
      if (res.correct) {
        setCubeSolvedVisual(true)
        setCubeFold(100)
        recordOutcome('cube_net', true, mData.successMessage)
      } else {
        recordOutcome('cube_net', false, mData.hints[0])
      }
      return
    }

    if (activeMission === 'classroom_painter') {
      const res = evaluateClassroomPainterAnswer(wallsAreaInput, {
        l: 8,
        b: 6,
        h: 4,
      })
      if (res.correct) {
        recordOutcome('classroom_painter', true, mData.successMessage)
      } else {
        const msg = res.includedFloorOrCeiling
          ? ui.mistakeFloorCeiling
          : mData.hints[0]
        recordOutcome('classroom_painter', false, msg)
      }
      return
    }

    if (activeMission === 'water_tank') {
      const res = evaluateWaterTankDesign(tankRadius, tankHeight, 1540)
      if (res.correct) {
        recordOutcome('water_tank', true, mData.successMessage)
      } else {
        const msg =
          res.status === 'too_small'
            ? ui.mistakeTooSmall
            : res.status === 'too_large'
              ? ui.mistakeTooLarge
              : mData.hints[0]
        recordOutcome('water_tank', false, msg)
      }
      return
    }

    if (activeMission === 'packaging_optimiser') {
      const res = evaluatePackagingOptimiser(packL, packB, packH, packReason, 64)
      if (res.correct) {
        recordOutcome('packaging_optimiser', true, mData.successMessage)
      } else if (!res.volumeMatches) {
        recordOutcome('packaging_optimiser', false, ui.mistakeVolumeMismatch)
      } else if (!res.isMinimumSurface) {
        recordOutcome('packaging_optimiser', false, ui.mistakeNotMinimum)
      } else {
        recordOutcome('packaging_optimiser', false, ui.mistakeSelectReason)
      }
    }
  }

  const handleResetCurrentMission = () => {
    stopSpeechGlobal()
    setFeedback(null)
    onUpdateMissionProgress(activeMission, {
      completed: false,
      stars: 0,
      attempts: 0,
    })
    if (activeMission === 'cube_net') {
      setCubeFold(15)
      setChosenTopFace(null)
      setCubeSolvedVisual(false)
    } else if (activeMission === 'classroom_painter') {
      setWallsAreaInput('')
    } else if (activeMission === 'water_tank') {
      setTankRadius(1.0)
      setTankHeight(1.0)
    } else {
      setPackL(2)
      setPackB(4)
      setPackH(8)
      setPackReason('')
    }
  }

  const activeChallenge =
    CUBE_NET_CHALLENGES[cubeRoundIdx] ?? CUBE_NET_CHALLENGES[0]
  const unlockedHintCount =
    mState.attempts >= 3 ? 2 : mState.attempts >= 2 ? 1 : 0

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 space-y-5">
      {/* Header Summary Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {ui.headerTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
              {ui.headerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-800">
              {ui.progressBadge}: {completedCount} / {MISSION_IDS.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">
              <span aria-hidden="true">★</span>
              {ui.starsEarnedLabel}: {totalStarsEarned} / {MISSION_IDS.length * 3}
            </span>
            <button
              type="button"
              onClick={() => {
                stopSpeechGlobal()
                setFeedback(null)
                onResetAllMissions()
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {ui.resetAllButton}
            </button>
          </div>
        </div>

        {/* 4-Mission Selector Grid */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {MISSION_IDS.map((mId, idx) => {
            const info = content[mId]
            const prog = missionsProgress?.[mId] ?? {
              completed: false,
              stars: 0,
              attempts: 0,
            }
            const isActive = activeMission === mId
            return (
              <button
                key={mId}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelectMission(mId)}
                className={`flex flex-col justify-between gap-2 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-0.5 text-sm">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={
                          s <= (prog.stars ?? 0)
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {info.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
                    <span
                      className={
                        prog.completed ? 'text-emerald-700' : 'text-slate-500'
                      }
                    >
                      {prog.completed ? ui.completedTag : ui.inProgressTag}
                    </span>
                    <span className="text-slate-500">
                      {ui.attemptsLabel}: {prog.attempts ?? 0}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Active Mission Interactive Workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Live 3D Visualisation & Interactive Net */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800">
              {mData.badge}
            </span>
          </div>

          <SpeakControlsBar
            text={`${mData.title}. ${mData.objective} ${mData.instructions}`}
            language={language}
            sourceId={`mission_${activeMission}`}
          />

          <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <Canvas3D
              shape={canvasConfig.shape}
              foldProgress={canvasConfig.foldProgress}
              dimensions={canvasConfig.dimensions}
              highlightMode={canvasConfig.highlightMode}
              selectedFace={selectedFace}
              onSelectFace={setSelectedFace}
              customCubeNet={canvasConfig.customCubeNet}
              translations={t}
              inlineScrollMode
              theme={theme}
            />
          </div>

          {/* Cube Net 2D Pattern Sync (Mission 1) or Live Telemetry Bar */}
          {activeMission === 'cube_net' && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="sm:col-span-4 flex items-center justify-center">
                <NetGridSvg
                  cells={activeChallenge.cells}
                  rootIndex={activeChallenge.rootIndex}
                  showFaceCodes={cubeSolvedVisual}
                  className="h-20 w-full max-w-[140px]"
                  ariaLabel={mData.title}
                />
              </div>
              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{ui.foldTestLabel}</span>
                  <span className="font-mono text-indigo-700">{cubeFold}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cubeFold}
                  onChange={(e) => setCubeFold(Number(e.target.value))}
                  aria-label={ui.foldTestLabel}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeMission === 'classroom_painter' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-900">
              {ui.roomDimensionsTag}
            </div>
          )}

          {activeMission === 'water_tank' && (
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[11px] font-bold text-slate-500">
                  {ui.targetLabel}
                </div>
                <div className="font-mono text-sm font-extrabold text-indigo-700">
                  1540 {ui.litresUnit} (1.54 m³)
                </div>
              </div>
              <div
                className={`rounded-xl border p-2.5 ${
                  tankLiveEval.correct
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500">
                  {ui.computedLabel}
                </div>
                <div className="font-mono text-sm font-extrabold text-slate-900">
                  {tankLiveEval.computedLitres} {ui.litresUnit} ({tankLiveEval.computedM3} m³)
                </div>
              </div>
            </div>
          )}

          {activeMission === 'packaging_optimiser' && (
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[11px] font-bold text-slate-500">
                  {ui.targetLabel} · {t.volumeLabel}
                </div>
                <div
                  className={`font-mono text-sm font-extrabold ${
                    packLiveEval.volumeMatches
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {packLiveEval.computedVolume} / 64 {t.unitSymbols.cm.volume}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[11px] font-bold text-slate-500">
                  {t.highlightModes.tsa} (l={packL}, b={packB}, h={packH})
                </div>
                <div
                  className={`font-mono text-sm font-extrabold ${
                    packLiveEval.isMinimumSurface
                      ? 'text-emerald-700'
                      : 'text-indigo-700'
                  }`}
                >
                  {packLiveEval.computedTsa} {t.unitSymbols.cm.area}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right: Mission Objective, Interactive Inputs, Validation & Hints */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm lg:col-span-6 flex flex-col gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              {mData.title}
            </h3>
            <p className="mt-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-sm font-semibold text-slate-900">
              {mData.objective}
            </p>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              {mData.instructions}
            </p>
          </div>

          <form onSubmit={handleVerifyMission} className="space-y-4">
            {/* Mission 1 Controls */}
            {activeMission === 'cube_net' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    {ui.selectChallenge}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {CUBE_NET_CHALLENGES.map((ch, idx) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setCubeRoundIdx(idx)
                          setChosenTopFace(null)
                          setCubeSolvedVisual(false)
                          setCubeFold(15)
                          setFeedback(null)
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                          cubeRoundIdx === idx
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800">
                  {ui.baseFaceTag}:{' '}
                  <strong className="text-indigo-700">
                    {ui.faceOptionPrefix} {activeChallenge.baseFaceNumber}
                  </strong>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-slate-800">
                    {ui.chooseTopFace}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => {
                      const isBase = num === activeChallenge.baseFaceNumber
                      const selected = chosenTopFace === num
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isBase}
                          onClick={() => setChosenTopFace(num)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                            isBase
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                              : selected
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          {ui.faceOptionPrefix} {num}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Mission 2 Controls */}
            {activeMission === 'classroom_painter' && (
              <div>
                <label
                  htmlFor="painter-area-input"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  {ui.enterWallsArea}
                </label>
                <input
                  id="painter-area-input"
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={wallsAreaInput}
                  onChange={(e) => setWallsAreaInput(e.target.value)}
                  placeholder="e.g. 112"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            )}

            {/* Mission 3 Controls */}
            {activeMission === 'water_tank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label
                    htmlFor="tank-radius-input"
                    className="mb-1 block text-xs font-bold text-slate-700"
                  >
                    {ui.radiusLabel}
                  </label>
                  <input
                    id="tank-radius-input"
                    type="number"
                    step="0.05"
                    min="0.2"
                    max="5"
                    required
                    value={tankRadius}
                    onChange={(e) => setTankRadius(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-900"
                  />
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.05"
                    value={Math.min(2.5, Math.max(0.2, tankRadius))}
                    onChange={(e) => setTankRadius(Number(e.target.value))}
                    aria-label={ui.radiusLabel}
                    className="mt-2 w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label
                    htmlFor="tank-height-input"
                    className="mb-1 block text-xs font-bold text-slate-700"
                  >
                    {ui.heightLabel}
                  </label>
                  <input
                    id="tank-height-input"
                    type="number"
                    step="0.05"
                    min="0.2"
                    max="8"
                    required
                    value={tankHeight}
                    onChange={(e) => setTankHeight(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-900"
                  />
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.05"
                    value={Math.min(4.0, Math.max(0.2, tankHeight))}
                    onChange={(e) => setTankHeight(Number(e.target.value))}
                    aria-label={ui.heightLabel}
                    className="mt-2 w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Mission 4 Controls */}
            {activeMission === 'packaging_optimiser' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label
                      htmlFor="pack-l"
                      className="mb-1 block text-[11px] font-bold text-slate-700"
                    >
                      {ui.lengthLabel}
                    </label>
                    <input
                      id="pack-l"
                      type="number"
                      step="1"
                      min="1"
                      max="64"
                      required
                      value={packL}
                      onChange={(e) => setPackL(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pack-b"
                      className="mb-1 block text-[11px] font-bold text-slate-700"
                    >
                      {ui.breadthLabel}
                    </label>
                    <input
                      id="pack-b"
                      type="number"
                      step="1"
                      min="1"
                      max="64"
                      required
                      value={packB}
                      onChange={(e) => setPackB(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pack-h"
                      className="mb-1 block text-[11px] font-bold text-slate-700"
                    >
                      {t.dimensionLabels.h} ({t.unitSymbols.cm.length})
                    </label>
                    <input
                      id="pack-h"
                      type="number"
                      step="1"
                      min="1"
                      max="64"
                      required
                      value={packH}
                      onChange={(e) => setPackH(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-bold text-slate-800">
                    {ui.selectReasonLabel}
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(mData.reasons).map(([reasonKey, reasonText]) => (
                      <label
                        key={reasonKey}
                        className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${
                          packReason === reasonKey
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="packaging-reason"
                          value={reasonKey}
                          checked={packReason === reasonKey}
                          onChange={() => setPackReason(reasonKey)}
                          className="mt-0.5 accent-indigo-600"
                        />
                        <span>{reasonText}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons: Check + Retry/Reset */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={activeMission === 'cube_net' && !chosenTopFace}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {ui.checkAnswer}
              </button>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {ui.retryButton}
              </button>
              <button
                type="button"
                onClick={handleResetCurrentMission}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {ui.resetButton}
              </button>
            </div>
          </form>

          {/* Validation Feedback Alert */}
          {feedback && (
            <div
              role="status"
              className={`rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
                feedback.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Progressive Hint Box (Reveals automatically after 2 incorrect attempts) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
            {unlockedHintCount === 0 ? (
              <p className="text-xs font-semibold text-amber-900">
                💡 {ui.hintLockedNote} ({ui.attemptsLabel}: {mState.attempts})
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                  💡 {ui.hintUnlockedTitle}
                </p>
                {mData.hints.slice(0, unlockedHintCount).map((hint, idx) => (
                  <p key={idx} className="text-xs leading-relaxed text-amber-950">
                    <strong>
                      {ui.hintFormulaPrefix} {idx + 1}:
                    </strong>{' '}
                    {hint}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <MissionModal
        isOpen={Boolean(modalState)}
        onClose={() => setModalState(null)}
        title={modalState?.title ?? ui.successTitle}
        stars={modalState?.stars ?? 3}
        message={modalState?.message ?? ''}
        attempts={modalState?.attempts ?? 1}
        attemptsLabel={ui.attemptsLabel}
        starsLabel={ui.starsEarnedLabel}
        closeLabel={ui.closeModal}
      />
    </main>
  )
}
