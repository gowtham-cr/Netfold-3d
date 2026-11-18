import { SHAPES, regularPolygonMetrics } from '../utils/mathEngine.js'
import { getLocalizedFaceName } from '../data/translations.js'
import { buildFormulaMultilingualExplanation } from '../utils/multilingualExplanations.js'
import { useGlobalSpeechState } from '../utils/speechEngine.js'
import SpeakControlsBar from './common/SpeakControlsBar.jsx'
import {
  CONE_PART_METADATA,
  CUBE_FACE_METADATA,
  CYLINDER_PART_METADATA,
  FRUSTUM_PART_METADATA,
  HEMISPHERE_PART_METADATA,
  MULTI_FACE_PALETTE,
  PYRAMID_FACE_METADATA,
  SPHERE_PART_METADATA,
} from '../utils/netGeometry.js'

function fmt(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

function fmtExactOrRounded(value, piCoefficient) {
  if (typeof piCoefficient === 'number') {
    return `${fmt(piCoefficient)}π ≈ ${value.toFixed(2)}`
  }
  return fmt(value)
}

function getFaceColor(shape, faceId) {
  if (shape === SHAPES.CYLINDER) {
    return CYLINDER_PART_METADATA[faceId]?.color ?? '#10b981'
  }
  if (shape === SHAPES.CONE) {
    return CONE_PART_METADATA[faceId]?.color ?? '#10b981'
  }
  if (shape === SHAPES.HEMISPHERE) {
    return HEMISPHERE_PART_METADATA[faceId]?.color ?? '#10b981'
  }
  if (shape === SHAPES.FRUSTUM) {
    return FRUSTUM_PART_METADATA[faceId]?.color ?? '#10b981'
  }
  if (shape === SHAPES.SQUARE_PYRAMID) {
    return (
      PYRAMID_FACE_METADATA.find((item) => item.id === faceId)?.color ??
      '#10b981'
    )
  }
  if (shape === SHAPES.SPHERE) {
    return SPHERE_PART_METADATA.surface.color
  }
  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM ||
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    if (faceId === 'bottom') return '#3b82f6'
    if (faceId === 'top') return '#f43f5e'
    if (faceId.startsWith('side_')) {
      const idx = Number(faceId.replace('side_', '')) || 0
      return MULTI_FACE_PALETTE[idx % MULTI_FACE_PALETTE.length].color
    }
  }
  if (shape === SHAPES.OCTAHEDRON) {
    const idx = Number(faceId.replace('face_', '')) || 0
    return MULTI_FACE_PALETTE[idx % MULTI_FACE_PALETTE.length].color
  }
  return (
    CUBE_FACE_METADATA.find((item) => item.id === faceId)?.color ?? '#3b82f6'
  )
}

function buildFormulaSteps(shape, mensuration, unitSymbols) {
  const { dimensions, lsa, tsa, volume, slantHeight, piCoefficients } =
    mensuration
  const lenU = unitSymbols.length
  const areaU = unitSymbols.area
  const volU = unitSymbols.volume

  if (shape === SHAPES.CUBE) {
    const a = fmt(dimensions.a)
    const a2 = fmt(dimensions.a * dimensions.a)
    return {
      slantStep: null,
      volume: {
        formula: 'V = a³',
        steps: [
          `${a} × ${a} × ${a}`,
          `${fmt(volume)} ${volU}`,
        ],
      },
      lsa: {
        formula: 'LSA = 4a²',
        steps: [`4 × ${a}² = 4 × ${a2}`, `${fmt(lsa)} ${areaU}`],
        excluded: `2 × ${a}² = ${fmt(2 * dimensions.a * dimensions.a)} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = 6a²',
        steps: [`6 × ${a}² = 6 × ${a2}`, `${fmt(tsa)} ${areaU}`],
      },
    }
  }

  if (shape === SHAPES.CUBOID) {
    const l = fmt(dimensions.l)
    const b = fmt(dimensions.b)
    const h = fmt(dimensions.h)
    const lb = fmt(dimensions.l * dimensions.b)
    const bh = fmt(dimensions.b * dimensions.h)
    const hl = fmt(dimensions.h * dimensions.l)
    return {
      slantStep: null,
      volume: {
        formula: 'V = l × b × h',
        steps: [`${l} × ${b} × ${h}`, `${fmt(volume)} ${volU}`],
      },
      lsa: {
        formula: 'LSA = 2h(l + b)',
        steps: [
          `2 × ${h} × (${l} + ${b}) = ${fmt(2 * dimensions.h)} × ${fmt(dimensions.l + dimensions.b)}`,
          `${fmt(lsa)} ${areaU}`,
        ],
        excluded: `2 × (${l} × ${b}) = ${fmt(2 * dimensions.l * dimensions.b)} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = 2(lb + bh + hl)',
        steps: [
          `2(${lb} + ${bh} + ${hl}) = 2 × ${fmt(dimensions.l * dimensions.b + dimensions.b * dimensions.h + dimensions.h * dimensions.l)}`,
          `${fmt(tsa)} ${areaU}`,
        ],
      },
    }
  }

  if (shape === SHAPES.CYLINDER) {
    const r = fmt(dimensions.r)
    const h = fmt(dimensions.h)
    return {
      slantStep: null,
      volume: {
        formula: 'V = πr²h',
        steps: [
          `π × ${r}² × ${h}`,
          `${fmtExactOrRounded(volume, piCoefficients?.volume)} ${volU}`,
        ],
      },
      lsa: {
        formula: 'CSA = 2πrh',
        steps: [
          `2π × ${r} × ${h}`,
          `${fmtExactOrRounded(lsa, piCoefficients?.lsa)} ${areaU}`,
        ],
        excluded: `2π × ${r}² = ${fmtExactOrRounded(2 * Math.PI * dimensions.r * dimensions.r, 2 * dimensions.r * dimensions.r)} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = 2πr(r + h)',
        steps: [
          `2π × ${r} × (${r} + ${h})`,
          `${fmtExactOrRounded(tsa, piCoefficients?.tsa)} ${areaU}`,
        ],
      },
    }
  }

  if (shape === SHAPES.CONE) {
    const r = fmt(dimensions.r)
    const h = fmt(dimensions.h)
    const l = fmt(slantHeight)
    const r2h2 = fmt(dimensions.r * dimensions.r + dimensions.h * dimensions.h)
    return {
      slantStep: {
        formula: 'l = √(r² + h²)',
        steps: [`√(${r}² + ${h}²) = √${r2h2}`, `${l} ${lenU}`],
      },
      volume: {
        formula: 'V = ⅓πr²h',
        steps: [
          `⅓ × π × ${r}² × ${h}`,
          `${fmtExactOrRounded(volume, piCoefficients?.volume)} ${volU}`,
        ],
      },
      lsa: {
        formula: 'LSA = πrl',
        steps: [
          `π × ${r} × ${l}`,
          `${fmtExactOrRounded(lsa, piCoefficients?.lsa)} ${areaU}`,
        ],
        excluded: `π × ${r}² = ${fmtExactOrRounded(Math.PI * dimensions.r * dimensions.r, dimensions.r * dimensions.r)} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = πr(l + r)',
        steps: [
          `π × ${r} × (${l} + ${r})`,
          `${fmtExactOrRounded(tsa, piCoefficients?.tsa)} ${areaU}`,
        ],
      },
    }
  }

  if (shape === SHAPES.SQUARE_PYRAMID) {
    const a = fmt(dimensions.a)
    const h = fmt(dimensions.h)
    const s = fmt(slantHeight)
    const halfA = fmt(dimensions.a / 2)
    const a2 = fmt(dimensions.a * dimensions.a)
    return {
      slantStep: {
        formula: 's = √(h² + (a/2)²)',
        steps: [
          `√(${h}² + ${halfA}²) = √${fmt(dimensions.h * dimensions.h + (dimensions.a / 2) * (dimensions.a / 2))}`,
          `${s} ${lenU}`,
        ],
      },
      volume: {
        formula: 'V = ⅓a²h',
        steps: [
          `⅓ × ${a}² × ${h} = ⅓ × ${a2} × ${h}`,
          `${fmt(volume)} ${volU}`,
        ],
      },
      lsa: {
        formula: 'LSA = 2as',
        steps: [`2 × ${a} × ${s}`, `${fmt(lsa)} ${areaU}`],
        excluded: `${a}² = ${a2} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = a² + 2as',
        steps: [`${a2} + ${fmt(lsa)}`, `${fmt(tsa)} ${areaU}`],
      },
    }
  }

  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PRISM
        ? 3
        : shape === SHAPES.PENTAGONAL_PRISM
          ? 5
          : 6
    const a = fmt(dimensions.a)
    const h = fmt(dimensions.h)
    const baseVal = fmt(mensuration.baseArea)
    const twoBaseVal = fmt(2 * mensuration.baseArea)
    const volFormula =
      sides === 3
        ? 'V = (√3/4)a² × h'
        : sides === 6
          ? 'V = (3√3/2)a² × h'
          : 'V = B × h'

    return {
      slantStep: null,
      volume: {
        formula: volFormula,
        steps: [`${baseVal} × ${h}`, `${fmt(volume)} ${volU}`],
      },
      lsa: {
        formula: `LSA = ${sides}ah`,
        steps: [`${sides} × ${a} × ${h}`, `${fmt(lsa)} ${areaU}`],
        excluded: `2 × B = ${twoBaseVal} ${areaU}`,
      },
      tsa: {
        formula: `TSA = 2B + ${sides}ah`,
        steps: [`${twoBaseVal} + ${fmt(lsa)}`, `${fmt(tsa)} ${areaU}`],
      },
    }
  }

  if (
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PYRAMID
        ? 3
        : shape === SHAPES.PENTAGONAL_PYRAMID
          ? 5
          : 6
    const { apothem, baseArea } = regularPolygonMetrics(sides, dimensions.a)
    const a = fmt(dimensions.a)
    const h = fmt(dimensions.h)
    const s = fmt(slantHeight)
    const ap = fmt(apothem)
    const B = fmt(baseArea)

    return {
      slantStep: {
        formula: 's = √(h² + r_in²)',
        steps: [
          `√(${h}² + ${ap}²) = √${fmt(dimensions.h * dimensions.h + apothem * apothem)}`,
          `${s} ${lenU}`,
        ],
      },
      volume: {
        formula: 'V = ⅓ × B × h',
        steps: [`⅓ × ${B} × ${h}`, `${fmt(volume)} ${volU}`],
      },
      lsa: {
        formula: `LSA = ½ × ${sides}as`,
        steps: [`½ × ${sides} × ${a} × ${s}`, `${fmt(lsa)} ${areaU}`],
        excluded: `B = ${B} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = B + LSA',
        steps: [`${B} + ${fmt(lsa)}`, `${fmt(tsa)} ${areaU}`],
      },
    }
  }

  if (shape === SHAPES.HEMISPHERE) {
    const r = fmt(dimensions.r)
    const r2 = dimensions.r * dimensions.r
    return {
      slantStep: null,
      volume: {
        formula: 'V = (2/3)πr³',
        steps: [
          `(2/3) × π × ${r}³`,
          `${fmtExactOrRounded(volume, piCoefficients?.volume)} ${volU}`,
        ],
      },
      lsa: {
        formula: 'CSA = 2πr²',
        steps: [
          `2 × π × ${r}²`,
          `${fmtExactOrRounded(lsa, piCoefficients?.lsa)} ${areaU}`,
        ],
        excluded: `π × ${r}² = ${fmtExactOrRounded(Math.PI * r2, r2)} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = 3πr²',
        steps: [
          `3 × π × ${r}²`,
          `${fmtExactOrRounded(tsa, piCoefficients?.tsa)} ${areaU}`,
        ],
      },
    }
  }

  if (shape === SHAPES.FRUSTUM) {
    const r1 = fmt(dimensions.r1)
    const r2 = fmt(dimensions.r2)
    const h = fmt(dimensions.h)
    const l = fmt(slantHeight)
    const diff = dimensions.r1 - dimensions.r2
    const capsPi = dimensions.r1 ** 2 + dimensions.r2 ** 2
    const capsArea = Math.PI * capsPi

    return {
      slantStep: {
        formula: 'l = √(h² + (r₁ - r₂)²)',
        steps: [
          `√(${h}² + (${r1} - ${r2})²) = √${fmt(dimensions.h * dimensions.h + diff * diff)}`,
          `${l} ${lenU}`,
        ],
      },
      volume: {
        formula: 'V = ⅓πh(r₁² + r₁r₂ + r₂²)',
        steps: [
          `⅓π × ${h} × (${r1}² + ${r1}×${r2} + ${r2}²)`,
          `${fmtExactOrRounded(volume, piCoefficients?.volume)} ${volU}`,
        ],
      },
      lsa: {
        formula: 'LSA = π(r₁ + r₂)l',
        steps: [
          `π × (${r1} + ${r2}) × ${l}`,
          `${fmtExactOrRounded(lsa, piCoefficients?.lsa)} ${areaU}`,
        ],
        excluded: `πr₁² + πr₂² = ${fmtExactOrRounded(capsArea, capsPi)} ${areaU}`,
      },
      tsa: {
        formula: 'TSA = π(r₁ + r₂)l + πr₁² + πr₂²',
        steps: [
          `${fmt(piCoefficients?.lsa)}π + ${fmt(capsPi)}π`,
          `${fmtExactOrRounded(tsa, piCoefficients?.tsa)} ${areaU}`,
        ],
      },
    }
  }

  if (shape === SHAPES.OCTAHEDRON) {
    const a = fmt(dimensions.a)
    const faceA = fmt(mensuration.faceArea)
    return {
      slantStep: null,
      volume: {
        formula: 'V = (√2/3)a³',
        steps: [`(√2 / 3) × ${a}³`, `${fmt(volume)} ${volU}`],
      },
      lsa: null,
      tsa: {
        formula: 'TSA = 2√3 a²',
        steps: [`8 × (√3/4 × ${a}²) = 8 × ${faceA}`, `${fmt(tsa)} ${areaU}`],
      },
    }
  }

  // Sphere
  const r = fmt(dimensions.r)
  return {
    slantStep: null,
    volume: {
      formula: 'V = (4/3)πr³',
      steps: [
        `(4/3) × π × ${r}³`,
        `${fmtExactOrRounded(volume, piCoefficients?.volume)} ${volU}`,
      ],
    },
    lsa: null,
    tsa: {
      formula: 'TSA = 4πr²',
      steps: [
        `4 × π × ${r}²`,
        `${fmtExactOrRounded(tsa, piCoefficients?.tsa)} ${areaU}`,
      ],
    },
  }
}

/**
 * Displays live step-by-step formulas with substituted dimension values and units
 * for Volume, LSA/CSA, and TSA, plus interactive 3D highlighting toggles.
 */
export default function FormulaCard({
  shape,
  mensuration,
  unit,
  highlightMode,
  onChangeHighlightMode,
  translations: t,
}) {
  const speech = useGlobalSpeechState()
  const activeLang = speech.activeLanguage || 'en'
  const formulaSpeakText = buildFormulaMultilingualExplanation(
    shape,
    mensuration,
    unit,
    activeLang,
    t,
  )
  const unitSymbols = t.unitSymbols[unit]
  const steps = buildFormulaSteps(shape, mensuration, unitSymbols)
  const isSphere = shape === SHAPES.SPHERE
  const isOctahedron = shape === SHAPES.OCTAHEDRON
  const isNoLsa = isSphere || isOctahedron
  const noLsaText = isSphere
    ? t.sphereLsaNotApplicable
    : t.octahedronLsaNotApplicable
  const lsaHeading =
    shape === SHAPES.CYLINDER || shape === SHAPES.HEMISPHERE
      ? t.csaLabel
      : t.lsaLabel
  const tsaHeading = isSphere ? t.surfaceAreaLabel : t.tsaLabel

  const toggleMode = (mode) => {
    onChangeHighlightMode(highlightMode === mode ? 'all' : mode)
  }

  return (
    <section
      aria-label={t.formulaCardTitle}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {t.formulaCardTitle}
        </h2>
        <SpeakControlsBar
          compact
          text={formulaSpeakText}
          language={activeLang}
          sourceId={`formula_${shape}`}
        />
      </div>

      {/* Slant height derivation step for Cone & Square Pyramid */}
      {steps.slantStep && (
        <div className="flex flex-col gap-1 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-rose-950">
              {t.slantHeightStepLabel}
            </span>
            <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-800">
              {steps.slantStep.formula}
            </span>
          </div>
          <p className="font-mono text-xs text-slate-700">
            = {steps.slantStep.steps[0]}
          </p>
          <p className="font-mono text-xs font-bold text-rose-800 sm:text-sm">
            = {steps.slantStep.steps[1]}
          </p>
        </div>
      )}

      {/* Volume */}
      <button
        type="button"
        onClick={() => toggleMode('volume')}
        className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition ${
          highlightMode === 'volume'
            ? 'border-sky-400 bg-sky-50/80 ring-1 ring-sky-300'
            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">
            {t.volumeLabel}
          </span>
          <span className="rounded bg-sky-100 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-800">
            {steps.volume.formula}
          </span>
        </div>
        <p className="font-mono text-xs text-slate-600">
          = {steps.volume.steps[0]}
        </p>
        <p className="font-mono text-xs font-bold text-slate-900 sm:text-sm">
          = {steps.volume.steps[1]}
        </p>
      </button>

      {/* LSA / CSA (or N/A card for Sphere & Octahedron) */}
      {isNoLsa ? (
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">
              {t.lsaLabel}
            </span>
            <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">
              —
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">{noLsaText}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => toggleMode('lsa')}
          className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition ${
            highlightMode === 'lsa'
              ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-300'
              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              {lsaHeading}
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
              {steps.lsa.formula}
            </span>
          </div>
          <p className="font-mono text-xs text-slate-600">
            = {steps.lsa.steps[0]}
          </p>
          <p className="font-mono text-xs font-bold text-slate-900 sm:text-sm">
            = {steps.lsa.steps[1]}
          </p>
          <div className="mt-1 rounded-lg bg-white/90 px-2.5 py-2 text-[11px] leading-relaxed text-slate-600 ring-1 ring-slate-200/80">
            <p className="font-bold text-slate-700">{t.lsaExcludedTitle}</p>
            <p>{t.lsaExclusionNote[shape]}</p>
            <p className="mt-0.5 font-mono font-semibold text-amber-700">
              {t.excludedCapsLabel}: {steps.lsa.excluded}
            </p>
          </div>
        </button>
      )}

      {/* TSA / Surface Area */}
      <button
        type="button"
        onClick={() => toggleMode('tsa')}
        className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition ${
          highlightMode === 'tsa'
            ? 'border-indigo-400 bg-indigo-50/80 ring-1 ring-indigo-300'
            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">{tsaHeading}</span>
          <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-800">
            {steps.tsa.formula}
          </span>
        </div>
        <p className="font-mono text-xs text-slate-600">
          = {steps.tsa.steps[0]}
        </p>
        <p className="font-mono text-xs font-bold text-slate-900 sm:text-sm">
          = {steps.tsa.steps[1]}
        </p>
      </button>
    </section>
  )
}

/**
 * Lists every individual face with its substituted area directly under the 3D canvas,
 * sums them to TSA, and synchronizes tap-selection with the 3D faces.
 */
export function FaceAreaBreakdown({
  shape,
  breakdown,
  mensuration,
  unit,
  selectedFace,
  onSelectFace,
  translations: t,
}) {
  const areaUnit = t.unitSymbols[unit].area
  const selectedItem = breakdown.faces.find((item) => item.id === selectedFace)
  const isSphere = shape === SHAPES.SPHERE

  return (
    <section
      aria-label={t.faceBreakdownTitle}
      className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold tracking-wide text-slate-700 uppercase">
            {t.faceBreakdownTitle}
          </h2>
          <p className="text-[11px] text-slate-500">
            {selectedItem
              ? `${t.selectedFacePrefix}: ${getLocalizedFaceName(t, selectedItem.id)} (${t.faceRoles[selectedItem.role]})`
              : isSphere
                ? t.sphereSurfaceBreakdownNote
                : t.tapFaceHint}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFace && (
            <button
              type="button"
              onClick={() => onSelectFace(null)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              {t.clearSelection}
            </button>
          )}
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-800 ring-1 ring-indigo-200">
            {t.sumOfFacesLabel}:{' '}
            {fmtExactOrRounded(mensuration.tsa, mensuration.piCoefficients?.tsa)}{' '}
            {areaUnit}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {breakdown.faces.map((face) => {
          const isSelected = selectedFace === face.id
          const color = getFaceColor(shape, face.id)
          const areaDisplay = fmtExactOrRounded(face.area, face.piCoefficient)

          return (
            <button
              key={face.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectFace(isSelected ? null : face.id)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition ${
                isSelected
                  ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-sm ring-1 ring-slate-900/20"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-800">
                    {getLocalizedFaceName(t, face.id)}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {t.faceRoles[face.role]}
                  </div>
                </div>
              </div>

              <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-800">
                {face.expression} = {areaDisplay} {areaUnit}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
