import { useState } from 'react'
import {
  MAX_SCALE_FACTOR,
  MIN_SCALE_FACTOR,
  SHAPES,
  calculateScaleEnlargement,
} from '../../utils/mathEngine.js'

const SCALE_SOLIDS = [
  { shape: SHAPES.CUBE, dims: { a: 2 } },
  { shape: SHAPES.CUBOID, dims: { l: 4, b: 3, h: 2 } },
  { shape: SHAPES.CYLINDER, dims: { r: 2, h: 4 } },
  { shape: SHAPES.CONE, dims: { r: 3, h: 4 } },
  { shape: SHAPES.SQUARE_PYRAMID, dims: { a: 6, h: 4 } },
  { shape: SHAPES.SPHERE, dims: { r: 3 } },
]

const PRESET_SCALES = [1, 1.5, 2, 2.5, 3]

function fmt(val) {
  if (val === null || val === undefined) return '—'
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

function formatDimsMap(dims, lenU, t) {
  return Object.entries(dims)
    .map(([key, val]) => `${key}=${fmt(val)} ${lenU}`)
    .join(', ')
    .replace('r1=', `${t.dimensionLabels.r1.split(' ')[0]}=`)
}

/**
 * Volume & Surface Area Enlargement Simulator (scale factor 1x to 3x):
 * demonstrates linear scaling k, surface area scaling k^2, and volume scaling k^3 live.
 */
export default function ScaleEnlargementLab({ unit = 'cm', translations: t }) {
  const [selectedShape, setSelectedShape] = useState(SHAPES.CUBE)
  const [scaleFactor, setScaleFactor] = useState(2)

  const solid =
    SCALE_SOLIDS.find((s) => s.shape === selectedShape) ?? SCALE_SOLIDS[0]
  const result = calculateScaleEnlargement(
    solid.shape,
    solid.dims,
    scaleFactor,
  )

  const lenU = t.unitSymbols[unit].length
  const areaU = t.unitSymbols[unit].area
  const volU = t.unitSymbols[unit].volume
  const scaleText = t.netLab.scale

  const barMetrics = [
    {
      label: `${scaleText.dimensionsRow} (${fmt(scaleFactor)}×)`,
      ratio: result.scaleFactor,
      maxRatio: 3,
      color: 'bg-indigo-500',
    },
    {
      label: `${scaleText.tsaRow} (${fmt(result.areaFactor)}×)`,
      ratio: result.areaFactor,
      maxRatio: 9,
      color: 'bg-emerald-500',
    },
    {
      label: `${scaleText.volumeRow} (${fmt(result.volumeFactor)}×)`,
      ratio: result.volumeFactor,
      maxRatio: 27,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
      {/* Left: Scale Factor Controls + Visual Bar Multipliers */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {scaleText.title}
          </h2>
          <p className="text-xs text-slate-600">{scaleText.subtitle}</p>
        </div>

        {/* Shape Selector */}
        <div>
          <p className="mb-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
            {scaleText.shapeLabel}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {SCALE_SOLIDS.map((item) => {
              const active = item.shape === selectedShape
              return (
                <button
                  key={item.shape}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedShape(item.shape)}
                  className={`rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.shapes[item.shape]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scale Factor Slider 1x to 3x */}
        <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="scale-factor-slider"
              className="text-xs font-bold tracking-wide text-slate-700 uppercase"
            >
              {scaleText.scaleFactorLabel}
            </label>
            <span
              data-testid="scale-factor-badge"
              className="rounded-lg bg-indigo-600 px-2.5 py-0.5 font-mono text-xs font-extrabold text-white"
            >
              {fmt(scaleFactor)}×
            </span>
          </div>

          <input
            id="scale-factor-slider"
            type="range"
            min={MIN_SCALE_FACTOR}
            max={MAX_SCALE_FACTOR}
            step={0.25}
            value={scaleFactor}
            onChange={(e) => setScaleFactor(Number(e.target.value))}
            aria-label={scaleText.scaleFactorLabel}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
          />

          <div className="mt-2.5 grid grid-cols-5 gap-1.5">
            {PRESET_SCALES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setScaleFactor(preset)}
                className={`rounded-lg py-1 font-mono text-xs font-bold transition ${
                  scaleFactor === preset
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset}×
              </button>
            ))}
          </div>
        </div>

        {/* Visual Multiplier Progress Bars */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          {barMetrics.map((bar) => {
            const widthPct = Math.min(100, (bar.ratio / bar.maxRatio) * 100)
            return (
              <div key={bar.label} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{bar.label}</span>
                  <span className="font-mono">{fmt(bar.ratio)}×</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${bar.color}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Live Comparison Table + Visual Proportional Boxes + k^2 / k^3 Insight */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-6">
        {/* Side-by-side 1x vs kx Proportional Box SVG */}
        <div className="flex items-center justify-around rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 90 90" className="h-20 w-20" aria-hidden="true">
              <rect
                x="30"
                y="45"
                width="24"
                height="24"
                fill="#3b82f6"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <polygon
                points="30,45 40,35 64,35 54,45"
                fill="#60a5fa"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <polygon
                points="54,45 64,35 64,59 54,69"
                fill="#2563eb"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-xs font-bold text-slate-700">
              {scaleText.originalHeader}
            </span>
          </div>

          <span className="font-mono text-lg font-extrabold text-indigo-600">
            × {fmt(scaleFactor)} →
          </span>

          <div className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 110 110" className="h-24 w-24" aria-hidden="true">
              {(() => {
                const sz = 20 * scaleFactor
                const x = (96 - sz) / 2
                const y = 96 - sz
                const d = sz * 0.28
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={sz}
                      height={sz}
                      fill="#10b981"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${x},${y} ${x + d},${y - d} ${x + sz + d},${y - d} ${x + sz},${y}`}
                      fill="#34d399"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${x + sz},${y} ${x + sz + d},${y - d} ${x + sz + d},${y + sz - d} ${x + sz},${y + sz}`}
                      fill="#059669"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  </g>
                )
              })()}
            </svg>
            <span className="text-xs font-bold text-emerald-700">
              {scaleText.scaledHeader} ({fmt(scaleFactor)}×)
            </span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="px-3 py-2">{t.shapes[selectedShape]}</th>
                <th className="px-3 py-2">{scaleText.originalHeader}</th>
                <th className="px-3 py-2">
                  {scaleText.scaledHeader} ({fmt(scaleFactor)}×)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              <tr>
                <td className="px-3 py-2 font-sans font-semibold text-slate-700">
                  {scaleText.dimensionsRow}
                </td>
                <td className="px-3 py-2 text-slate-800">
                  {formatDimsMap(result.base.dimensions, lenU, t)}
                </td>
                <td className="px-3 py-2 font-bold text-indigo-700">
                  {formatDimsMap(result.scaled.dimensions, lenU, t)}
                </td>
              </tr>
              {result.base.lsa !== null && (
                <tr>
                  <td className="px-3 py-2 font-sans font-semibold text-slate-700">
                    {scaleText.lsaRow}
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {fmt(result.base.lsa)} {areaU}
                  </td>
                  <td className="px-3 py-2 font-bold text-emerald-700">
                    {fmt(result.scaled.lsa)} {areaU} ({fmt(result.areaFactor)}×)
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-3 py-2 font-sans font-semibold text-slate-700">
                  {scaleText.tsaRow}
                </td>
                <td className="px-3 py-2 text-slate-800">
                  {fmt(result.base.tsa)} {areaU}
                </td>
                <td className="px-3 py-2 font-bold text-emerald-700">
                  {fmt(result.scaled.tsa)} {areaU} ({fmt(result.areaFactor)}×)
                </td>
              </tr>
              <tr className="bg-amber-50/60">
                <td className="px-3 py-2 font-sans font-semibold text-amber-950">
                  {scaleText.volumeRow}
                </td>
                <td className="px-3 py-2 text-slate-800">
                  {fmt(result.base.volume)} {volU}
                </td>
                <td className="px-3 py-2 font-extrabold text-amber-800">
                  {fmt(result.scaled.volume)} {volU} ({fmt(result.volumeFactor)}×)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Educational Insight */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-indigo-950">
          <div className="flex flex-wrap gap-2 pb-1.5">
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-900">
              {scaleText.areaScaleFormula}: {fmt(scaleFactor)}² ={' '}
              {fmt(result.areaFactor)}×
            </span>
            <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900">
              {scaleText.volumeScaleFormula}: {fmt(scaleFactor)}³ ={' '}
              {fmt(result.volumeFactor)}×
            </span>
          </div>
          <h3 className="text-xs font-extrabold">{scaleText.insightTitle}</h3>
          <p className="mt-1 text-xs leading-relaxed">{scaleText.insightBody}</p>
        </div>
      </div>
    </div>
  )
}
