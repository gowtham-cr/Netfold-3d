import { useState } from 'react'
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  calculateCylinder,
} from '../../utils/mathEngine.js'
import { CYLINDER_PART_METADATA } from '../../utils/netGeometry.js'
import Canvas3D from '../Canvas3D.jsx'

function fmt(val) {
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

/**
 * Interactive Cylinder Net Explorer: visualizes 1 rectangle (width = 2πr, height = h)
 * and 2 circles (radius r), proves circumference equality, and connects live to the 3D cylinder.
 */
export default function CylinderNetExplorer({
  unit = 'cm',
  translations: t,
  onOpenIn3D,
}) {
  const [r, setR] = useState(3)
  const [h, setH] = useState(5)
  const [cylFold, setCylFold] = useState(0)

  const metrics = calculateCylinder(r, h)
  const lenU = t.unitSymbols[unit].length
  const areaU = t.unitSymbols[unit].area
  const circumference = 2 * Math.PI * r
  const circumferencePi = fmt(2 * r)
  const capArea = Math.PI * r * r
  const capPi = fmt(r * r)
  const wallPi = fmt(2 * r * h)

  // Normalized 2D SVG diagram geometry
  const maxUnitH = h + 4 * r + 2
  const maxUnitW = Math.max(circumference, 2 * r) + 2
  const scale = Math.min(310 / maxUnitW, 240 / maxUnitH)
  const rectW = circumference * scale
  const rectH = h * scale
  const circlePx = r * scale

  const svgW = 360
  const svgH = 270
  const rx = (svgW - rectW) / 2
  const ry = (svgH - rectH) / 2

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
      {/* Left: Labelled 2D Net (Rectangle + 2 Circles) + Circumference Proof */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t.netLab.cylinder.title}
            </h2>
            <p className="text-xs text-slate-600">{t.netLab.cylinder.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="h-64 w-full max-w-md"
            role="img"
            aria-label={t.netLab.cylinder.title}
          >
            {/* Top Circle */}
            <circle
              cx={svgW / 2}
              cy={ry - circlePx}
              r={circlePx}
              fill={CYLINDER_PART_METADATA.top.color}
              stroke="#0f172a"
              strokeWidth={1.5}
              opacity={0.94}
            />
            <line
              x1={svgW / 2}
              y1={ry - circlePx}
              x2={svgW / 2 + circlePx}
              y2={ry - circlePx}
              stroke="#fef08a"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <text
              x={svgW / 2}
              y={ry - circlePx + 3.5}
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill="#ffffff"
            >
              {t.faceNames.top} (πr²)
            </text>

            {/* Curved Wall Rectangle (length = 2πr) */}
            <rect
              x={rx}
              y={ry}
              width={rectW}
              height={rectH}
              fill={CYLINDER_PART_METADATA.lateral.color}
              stroke="#0f172a"
              strokeWidth={1.5}
              opacity={0.94}
            />
            <text
              x={svgW / 2}
              y={ry + rectH / 2 - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fill="#ffffff"
            >
              {t.netLab.cylinder.rectLabel}
            </text>
            <text
              x={svgW / 2}
              y={ry + rectH / 2 + 10}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill="#f8fafc"
            >
              2πr = {circumferencePi}π ({circumference.toFixed(2)}) × h = {h}
            </text>

            {/* Dimension bracket across width */}
            <line
              x1={rx}
              y1={ry - 6}
              x2={rx + rectW}
              y2={ry - 6}
              stroke="#b45309"
              strokeWidth={1.5}
            />

            {/* Bottom Base Circle */}
            <circle
              cx={svgW / 2}
              cy={ry + rectH + circlePx}
              r={circlePx}
              fill={CYLINDER_PART_METADATA.bottom.color}
              stroke="#0f172a"
              strokeWidth={1.5}
              opacity={0.94}
            />
            <line
              x1={svgW / 2}
              y1={ry + rectH + circlePx}
              x2={svgW / 2 + circlePx}
              y2={ry + rectH + circlePx}
              stroke="#fef08a"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <text
              x={svgW / 2}
              y={ry + rectH + circlePx + 3.5}
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill="#ffffff"
            >
              {t.faceNames.bottom} (πr²)
            </text>
          </svg>
        </div>

        {/* Educational 2πr Callout */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-emerald-950">
          <h3 className="text-xs font-extrabold uppercase">
            {t.netLab.cylinder.circumferenceRuleTitle}
          </h3>
          <p className="mt-1 text-xs leading-relaxed">
            {t.netLab.cylinder.circumferenceRuleBody}
          </p>
        </div>

        {/* Sliders & Live Quantitative Breakdown */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {t.dimensionLabels.r}
              </span>
              <span className="font-mono font-bold text-indigo-700">
                {r} {lenU}
              </span>
            </div>
            <input
              type="range"
              min={MIN_DIMENSION}
              max={MAX_DIMENSION}
              step={0.5}
              value={r}
              aria-label={t.dimensionLabels.r}
              onChange={(e) => setR(Number(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {t.dimensionLabels.h}
              </span>
              <span className="font-mono font-bold text-indigo-700">
                {h} {lenU}
              </span>
            </div>
            <input
              type="range"
              min={MIN_DIMENSION}
              max={MAX_DIMENSION}
              step={0.5}
              value={h}
              aria-label={t.dimensionLabels.h}
              onChange={(e) => setH(Number(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
            <span className="font-semibold text-slate-700">
              {t.netLab.cylinder.rectWidthLabel}
            </span>
            <span className="font-mono font-bold text-slate-900">
              {circumferencePi}π ≈ {circumference.toFixed(2)} {lenU}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
            <span className="font-semibold text-slate-700">
              {t.netLab.cylinder.capAreaLabel}
            </span>
            <span className="font-mono font-bold text-slate-900">
              {capPi}π ≈ {capArea.toFixed(2)} {areaU}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
            <span className="font-semibold text-slate-700">
              {t.netLab.cylinder.curvedAreaLabel}
            </span>
            <span className="font-mono font-bold text-slate-900">
              {wallPi}π ≈ {metrics.lsa.toFixed(2)} {areaU}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Connected 3D Cylinder Preview + Launch into Explorer */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            {t.shapes.cylinder} · {t.foldSectionTitle}: {cylFold}%
          </h3>
          {onOpenIn3D && (
            <button
              type="button"
              onClick={() => onOpenIn3D(SHAPES.CYLINDER, { r, h })}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {t.netLab.cylinder.openIn3D}
            </button>
          )}
        </div>

        <div className="relative h-72 w-full overflow-hidden rounded-xl ring-1 ring-slate-200 sm:h-80 lg:flex-1">
          <Canvas3D
            shape={SHAPES.CYLINDER}
            foldProgress={cylFold}
            dimensions={{ r, h }}
            translations={t}
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase">
              {t.foldSectionTitle}
            </span>
            <div className="flex gap-1.5">
              {[0, 50, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setCylFold(pct)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                    cylFold === pct
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={cylFold}
            aria-label={t.foldSectionTitle}
            onChange={(e) => setCylFold(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
          />
        </div>
      </div>
    </div>
  )
}
