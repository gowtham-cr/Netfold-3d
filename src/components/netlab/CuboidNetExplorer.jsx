import { useState } from 'react'
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  calculateCuboid,
  calculateFaceBreakdown,
} from '../../utils/mathEngine.js'
import { CUBOID_FACE_METADATA } from '../../utils/netGeometry.js'

const FACE_META = Object.fromEntries(
  CUBOID_FACE_METADATA.map((item) => [item.id, item]),
)

function fmt(val) {
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

/**
 * Interactive Labelled Cross-Shaped Cuboid Net: lets students adjust l, b, h,
 * highlights opposite matching face pairs, shows dimensions & areas per face,
 * and opens directly in the 3D Cuboid Explorer.
 */
export default function CuboidNetExplorer({
  unit = 'cm',
  translations: t,
  onOpenIn3D,
}) {
  const [l, setL] = useState(10)
  const [b, setB] = useState(6)
  const [h, setH] = useState(4)
  const [hoveredFace, setHoveredFace] = useState(null)

  const metrics = calculateCuboid(l, b, h)
  const breakdown = calculateFaceBreakdown(SHAPES.CUBOID, { l, b, h })
  const lenU = t.unitSymbols[unit].length
  const areaU = t.unitSymbols[unit].area

  // Normalize SVG cross layout coordinates
  const totalW = h + l + h
  const totalH = b + h + b + h
  const scale = Math.min(280 / totalW, 290 / totalH)
  const padX = (340 - totalW * scale) / 2
  const padY = (330 - totalH * scale) / 2

  const wL = l * scale
  const wB = b * scale
  const wH = h * scale

  // Cross layout: Top above Back above Base above Front; Left & Right flank Base
  const rects = [
    {
      id: 'top',
      x: padX + wH,
      y: padY,
      w: wL,
      h: wB,
      dimText: `${l} × ${b}`,
      area: l * b,
    },
    {
      id: 'back',
      x: padX + wH,
      y: padY + wB,
      w: wL,
      h: wH,
      dimText: `${l} × ${h}`,
      area: l * h,
    },
    {
      id: 'bottom',
      x: padX + wH,
      y: padY + wB + wH,
      w: wL,
      h: wB,
      dimText: `${l} × ${b}`,
      area: l * b,
    },
    {
      id: 'front',
      x: padX + wH,
      y: padY + wB + wH + wB,
      w: wL,
      h: wH,
      dimText: `${l} × ${h}`,
      area: l * h,
    },
    {
      id: 'left',
      x: padX,
      y: padY + wB + wH,
      w: wH,
      h: wB,
      dimText: `${h} × ${b}`,
      area: h * b,
    },
    {
      id: 'right',
      x: padX + wH + wL,
      y: padY + wB + wH,
      w: wH,
      h: wB,
      dimText: `${h} × ${b}`,
      area: h * b,
    },
  ]

  const pairs = [
    {
      title: t.netLab.cuboid.pairBaseTop,
      color: FACE_META.bottom.color,
      areaText: `2 × (${l} × ${b}) = ${fmt(2 * l * b)} ${areaU}`,
    },
    {
      title: t.netLab.cuboid.pairFrontBack,
      color: FACE_META.front.color,
      areaText: `2 × (${l} × ${h}) = ${fmt(2 * l * h)} ${areaU}`,
    },
    {
      title: t.netLab.cuboid.pairLeftRight,
      color: FACE_META.left.color,
      areaText: `2 × (${h} × ${b}) = ${fmt(2 * h * b)} ${areaU}`,
    },
  ]

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
      {/* Left: Labelled Cross-Shaped Cuboid Net Diagram */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t.netLab.cuboid.title}
            </h2>
            <p className="text-xs text-slate-600">{t.netLab.cuboid.subtitle}</p>
          </div>
          {onOpenIn3D && (
            <button
              type="button"
              onClick={() => onOpenIn3D(SHAPES.CUBOID, { l, b, h })}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {t.netLab.cuboid.openIn3D}
            </button>
          )}
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <svg
            viewBox="0 0 340 330"
            className="h-72 w-full max-w-md sm:h-80"
            role="img"
            aria-label={t.netLab.cuboid.title}
          >
            {rects.map((rect) => {
              const meta = FACE_META[rect.id]
              const isHighlighted = hoveredFace === rect.id
              return (
                <g
                  key={rect.id}
                  onMouseEnter={() => setHoveredFace(rect.id)}
                  onMouseLeave={() => setHoveredFace(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.w}
                    height={rect.h}
                    fill={meta.color}
                    stroke={isHighlighted ? '#facc15' : '#0f172a'}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    opacity={hoveredFace && !isHighlighted ? 0.65 : 0.94}
                  />
                  <text
                    x={rect.x + rect.w / 2}
                    y={rect.y + rect.h / 2 - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    {t.faceNames[rect.id]}
                  </text>
                  <text
                    x={rect.x + rect.w / 2}
                    y={rect.y + rect.h / 2 + 7}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#f8fafc"
                  >
                    {rect.dimText} = {fmt(rect.area)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 ring-1 ring-indigo-200">
          <span className="text-xs font-bold text-indigo-950">
            {t.netLab.cuboid.totalTsaLabel}
          </span>
          <span className="font-mono text-sm font-extrabold text-indigo-800">
            {fmt(metrics.tsa)} {areaU}
          </span>
        </div>
      </div>

      {/* Right: Dimension Sliders + Congruent Opposite Pairs + All 6 Faces */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {t.dimensionsSectionTitle}
          </h3>
          {[
            { key: 'l', label: t.dimensionLabels.l, val: l, setter: setL },
            { key: 'b', label: t.dimensionLabels.b, val: b, setter: setB },
            { key: 'h', label: t.dimensionLabels.h, val: h, setter: setH },
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {item.label}
                </span>
                <span className="font-mono font-bold text-indigo-700">
                  {item.val} {lenU}
                </span>
              </div>
              <input
                type="range"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                step={0.5}
                value={item.val}
                aria-label={item.label}
                onChange={(e) => item.setter(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {pairs.map((pair) => (
            <div
              key={pair.title}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
            >
              <span className="flex items-center gap-2 font-bold text-slate-800">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: pair.color }}
                />
                {pair.title}
              </span>
              <span className="font-mono font-semibold text-slate-700">
                {pair.areaText}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {breakdown.faces.map((face) => (
            <button
              key={face.id}
              type="button"
              onMouseEnter={() => setHoveredFace(face.id)}
              onMouseLeave={() => setHoveredFace(null)}
              onClick={() =>
                setHoveredFace((prev) => (prev === face.id ? null : face.id))
              }
              className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                hoveredFace === face.id
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-slate-800">
                {t.faceNames[face.id]}
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                {fmt(face.area)} {areaU}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
