import { useEffect } from 'react'
import { getMultilingualContent } from '../data/multilingualContentTranslations.js'
import { SHAPES, isBeyondClass8Shape } from '../utils/mathEngine.js'
import { buildShapeMultilingualExplanation } from '../utils/multilingualExplanations.js'
import { speakTextGlobal, useGlobalSpeechState } from '../utils/speechEngine.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'

function fmt(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

function getImportantDimensionChips(shape, mensuration, lenUnit, t) {
  const dims = mensuration.dimensions
  const labels = t.dimensionLabels

  if (shape === SHAPES.CUBE) {
    return [{ label: labels.a, value: `${fmt(dims.a)} ${lenUnit}` }]
  }
  if (shape === SHAPES.CUBOID) {
    return [
      { label: labels.l, value: `${fmt(dims.l)} ${lenUnit}` },
      { label: labels.b, value: `${fmt(dims.b)} ${lenUnit}` },
      { label: labels.h, value: `${fmt(dims.h)} ${lenUnit}` },
    ]
  }
  if (shape === SHAPES.CYLINDER) {
    return [
      { label: labels.r, value: `${fmt(dims.r)} ${lenUnit}` },
      { label: labels.h, value: `${fmt(dims.h)} ${lenUnit}` },
    ]
  }
  if (shape === SHAPES.CONE) {
    return [
      { label: labels.r, value: `${fmt(dims.r)} ${lenUnit}` },
      { label: labels.h, value: `${fmt(dims.h)} ${lenUnit}` },
      { label: labels.slantL, value: `${fmt(mensuration.slantHeight)} ${lenUnit}` },
    ]
  }
  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM
  ) {
    return [
      { label: labels.baseSideA, value: `${fmt(dims.a)} ${lenUnit}` },
      { label: labels.h, value: `${fmt(dims.h)} ${lenUnit}` },
    ]
  }
  if (
    shape === SHAPES.SQUARE_PYRAMID ||
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    return [
      { label: labels.baseSideA, value: `${fmt(dims.a)} ${lenUnit}` },
      { label: labels.h, value: `${fmt(dims.h)} ${lenUnit}` },
      { label: labels.slantS, value: `${fmt(mensuration.slantHeight)} ${lenUnit}` },
    ]
  }
  if (shape === SHAPES.FRUSTUM) {
    return [
      { label: labels.r1, value: `${fmt(dims.r1)} ${lenUnit}` },
      { label: labels.r2, value: `${fmt(dims.r2)} ${lenUnit}` },
      { label: labels.h, value: `${fmt(dims.h)} ${lenUnit}` },
      { label: labels.slantL, value: `${fmt(mensuration.slantHeight)} ${lenUnit}` },
    ]
  }
  if (shape === SHAPES.OCTAHEDRON) {
    return [{ label: labels.a, value: `${fmt(dims.a)} ${lenUnit}` }]
  }
  return [
    { label: labels.r, value: `${fmt(dims.r)} ${lenUnit}` },
    { label: labels.diameter, value: `${fmt(dims.r * 2)} ${lenUnit}` },
  ]
}

/**
 * Educational learning panel for each 3D shape:
 * definition, faces/edges/vertices, important dimensions, real-world example,
 * and "Did you know?" fact in English and Kannada.
 */
export default function LearningPanel({
  shape,
  mensuration,
  unit,
  translations: t,
}) {
  const speech = useGlobalSpeechState()
  const activeLang = speech.activeLanguage || 'en'
  const mc = getMultilingualContent(activeLang)
  const sn = mc.shapeNarrator
  const narrative = buildShapeMultilingualExplanation(
    shape,
    mensuration,
    unit,
    activeLang,
    t,
  )

  useEffect(() => {
    if (speech.autoSpeak) {
      speakTextGlobal({
        text: narrative.speakText,
        language: activeLang,
        sourceId: `shape_${shape}`,
      })
    }
    // Trigger automatic voice explanation cleanly ONLY when opened shape or autoSpeak setting changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, activeLang, speech.autoSpeak])

  const info = t.learningByShape[shape]
  const isBeyond = isBeyondClass8Shape(shape)
  const lenUnit = t.unitSymbols[unit].length
  const dimChips = getImportantDimensionChips(shape, mensuration, lenUnit, t)

  return (
    <section
      aria-label={t.learningPanelTitle}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {t.learningPanelTitle}
        </h2>
        {isBeyond && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
            {t.beyondClass8Badge}
          </span>
        )}
      </div>

      {/* Global Shape Text-to-Speech Controls + Live Narrator Summary */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-2">
        <p className="text-[11px] font-extrabold text-indigo-900">
          {sn.panelTitle}: {narrative.shapeLabel}
        </p>
        <SpeakControlsBar
          text={narrative.speakText}
          language={activeLang}
          sourceId={`shape_${shape}`}
        />
        <p className="text-[11px] font-semibold text-slate-700">
          {sn.liveChangeNote}: <span className="font-mono text-indigo-800">{narrative.dimensionsText}</span>
        </p>
      </div>

      {/* Definition */}
      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
        <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
          {t.definitionLabel}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-800">
          {info.definition}
        </p>
      </div>

      {/* Faces, Edges, Vertices */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
          {t.geometryStatsLabel}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-indigo-50/70 p-2.5 ring-1 ring-indigo-100">
            <p className="text-[10px] font-bold text-indigo-700 uppercase">
              {t.facesStatLabel}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-900">
              {info.faces}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 p-2.5 ring-1 ring-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase">
              {t.edgesStatLabel}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-900">
              {info.edges}
            </p>
          </div>
          <div className="rounded-xl bg-violet-50/70 p-2.5 ring-1 ring-violet-100">
            <p className="text-[10px] font-bold text-violet-700 uppercase">
              {t.verticesStatLabel}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-900">
              {info.vertices}
            </p>
          </div>
        </div>
      </div>

      {/* Important Dimensions */}
      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
        <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
          {t.importantDimensionsLabel}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          {info.dimensionsSummary}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {dimChips.map((chip) => (
            <span
              key={chip.label}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"
            >
              {chip.label}:{' '}
              <span className="font-mono font-bold text-indigo-700">
                {chip.value}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Worked Example */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
        <p className="text-[11px] font-bold tracking-wide text-indigo-800 uppercase">
          {t.workedExampleLabel}
        </p>
        <p className="mt-1 font-mono text-[11px] leading-relaxed font-semibold text-indigo-950">
          {info.workedExample}
        </p>
      </div>

      {/* Real-world Example */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3">
        <p className="text-[11px] font-bold tracking-wide text-teal-800 uppercase">
          {t.realWorldExampleLabel}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-teal-950">
          {info.realWorldExample}
        </p>
      </div>

      {/* Did you know? */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
        <p className="text-[11px] font-bold tracking-wide text-amber-800 uppercase">
          {t.didYouKnowLabel}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-amber-950">
          {info.didYouKnow}
        </p>
      </div>

      {/* 3D Structure & Common Mistake Explanation */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 space-y-1.5">
        <p className="text-[11px] font-bold tracking-wide text-rose-900 uppercase">
          {sn.structureHeading}
        </p>
        <p className="text-xs leading-relaxed text-slate-800">
          {narrative.structureText}
        </p>
        <p className="text-[11px] font-bold tracking-wide text-rose-900 uppercase pt-1">
          {sn.commonMistakeHeading}
        </p>
        <p className="text-xs leading-relaxed text-rose-950">
          {narrative.commonMistake}
        </p>
      </div>
    </section>
  )
}
