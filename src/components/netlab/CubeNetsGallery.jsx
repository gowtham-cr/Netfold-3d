import { useEffect, useMemo, useRef, useState } from 'react'
import { CUBE_NET_CATALOG, SHAPES, validateCubeNet } from '../../utils/mathEngine.js'
import { CUBE_FACE_METADATA } from '../../utils/netGeometry.js'
import Canvas3D from '../Canvas3D.jsx'
import NetGridSvg from './NetGridSvg.jsx'

/**
 * Interactive Cube Nets Gallery: displays all 11 valid cube nets, lets learners
 * pick any net, scrub or auto-animate 0% -> 100% 3D folding, and inspect all 6 faces.
 */
export default function CubeNetsGallery({ translations: t, theme = 'light' }) {
  const [selectedNetId, setSelectedNetId] = useState(CUBE_NET_CATALOG[0].id)
  const [foldProgress, setFoldProgress] = useState(25)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [selectedFace, setSelectedFace] = useState(null)

  const selectedNet = useMemo(
    () =>
      CUBE_NET_CATALOG.find((item) => item.id === selectedNetId) ??
      CUBE_NET_CATALOG[0],
    [selectedNetId],
  )

  const validation = useMemo(
    () => validateCubeNet(selectedNet.cells, selectedNet.rootIndex),
    [selectedNet],
  )

  const directionRef = useRef(1)
  useEffect(() => {
    if (!isAutoPlaying) return undefined

    let frameId = 0
    let lastTime = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      setFoldProgress((prev) => {
        let next = prev + directionRef.current * dt * 42
        if (next >= 100) {
          next = 100
          directionRef.current = -1
        } else if (next <= 0) {
          next = 0
          directionRef.current = 1
        }
        return Math.round(next * 10) / 10
      })
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [isAutoPlaying])

  const netText = t.netLab.gallery.nets[selectedNet.id]
  const familyLabel = t.netLab.gallery.families[selectedNet.family]
  const displayPct = Math.round(foldProgress)

  const handleSelectNet = (netId) => {
    setSelectedNetId(netId)
    setSelectedFace(null)
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
      {/* Left: 3D Interactive Folding Viewport & Fold Controls */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800 ring-1 ring-indigo-200">
              {t.netLab.gallery.familyLabel}: {familyLabel}
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-900">
              {netText.name}
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              {netText.tip}
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800 ring-1 ring-slate-200">
            {validation.faceCount} · {t.foldSectionTitle}: {displayPct}%
          </span>
        </div>

        <div className="relative h-72 w-full overflow-hidden rounded-xl ring-1 ring-slate-200 sm:h-80 lg:h-[380px]">
          <Canvas3D
            shape={SHAPES.CUBE}
            customCubeNet={{
              cells: selectedNet.cells,
              rootIndex: selectedNet.rootIndex,
            }}
            foldProgress={foldProgress}
            dimensions={{ a: 3 }}
            selectedFace={selectedFace}
            onSelectFace={setSelectedFace}
            translations={t}
            inlineScrollMode
            theme={theme}
          />
        </div>

        {/* Fold Slider + Presets + Auto-Fold */}
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="gallery-fold-slider"
              className="text-xs font-bold tracking-wide text-slate-700 uppercase"
            >
              {t.foldSectionTitle}
            </label>
            <div className="flex items-center gap-1.5">
              {[0, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setFoldProgress(preset)
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    displayPct === preset && !isAutoPlaying
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset === 0
                    ? t.foldPresets.flat
                    : preset === 50
                      ? t.foldPresets.half
                      : t.foldPresets.closed}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={isAutoPlaying}
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  isAutoPlaying
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                }`}
              >
                {isAutoPlaying
                  ? t.netLab.gallery.animatePause
                  : t.netLab.gallery.animatePlay}
              </button>
            </div>
          </div>

          <input
            id="gallery-fold-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={displayPct}
            onChange={(event) => {
              setIsAutoPlaying(false)
              setFoldProgress(Number(event.target.value))
            }}
            aria-label={t.foldSectionTitle}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
          />
        </div>

        {/* 6 Folded Cube Faces Legend */}
        <div className="flex flex-wrap gap-1.5">
          {CUBE_FACE_METADATA.map((meta) => {
            const active = selectedFace === meta.id
            return (
              <button
                key={meta.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedFace(active ? null : meta.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  active
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: meta.color }}
                />
                <span>{t.faceNames[meta.id]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: All 11 Selectable Nets Gallery Grid */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {t.netLab.gallery.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            {t.netLab.gallery.subtitle}
          </p>
        </div>

        <div
          role="group"
          aria-label={t.netLab.gallery.selectNetHint}
          className="grid max-h-[540px] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-2"
        >
          {CUBE_NET_CATALOG.map((net) => {
            const isSelected = net.id === selectedNetId
            const itemText = t.netLab.gallery.nets[net.id]
            return (
              <button
                key={net.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectNet(net.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-left transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-300'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80'
                }`}
              >
                <NetGridSvg
                  cells={net.cells}
                  rootIndex={net.rootIndex}
                  showFaceCodes
                  highlightFace={selectedFace}
                  className="h-16 w-full"
                  ariaLabel={itemText.name}
                />
                <span className="w-full truncate text-center text-[11px] font-bold text-slate-800">
                  {itemText.name}
                </span>
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                  {net.family}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
