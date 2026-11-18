import {
  BEYOND_CLASS_8_GROUPS,
  CLASS_8_SHAPES,
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  isBeyondClass8Shape,
  shouldShowUnitHint,
} from '../utils/mathEngine.js'
import ShapeThumbSvg from './ShapeThumbSvg.jsx'

const HIGHLIGHT_OPTIONS = ['all', 'lsa', 'tsa', 'volume']
const UNIT_OPTIONS = ['cm', 'm']

const DIMENSION_FIELDS = {
  [SHAPES.CUBE]: [{ key: 'a', labelKey: 'a' }],
  [SHAPES.CUBOID]: [
    { key: 'l', labelKey: 'l' },
    { key: 'b', labelKey: 'b' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.CYLINDER]: [
    { key: 'r', labelKey: 'r' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.CONE]: [
    { key: 'r', labelKey: 'r' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.SQUARE_PYRAMID]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.SPHERE]: [{ key: 'r', labelKey: 'r' }],
  [SHAPES.TRIANGULAR_PRISM]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.PENTAGONAL_PRISM]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.HEXAGONAL_PRISM]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.TRIANGULAR_PYRAMID]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.PENTAGONAL_PYRAMID]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.HEXAGONAL_PYRAMID]: [
    { key: 'a', labelKey: 'baseSideA' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.HEMISPHERE]: [{ key: 'r', labelKey: 'r' }],
  [SHAPES.FRUSTUM]: [
    { key: 'r1', labelKey: 'r1' },
    { key: 'r2', labelKey: 'r2' },
    { key: 'h', labelKey: 'h' },
  ],
  [SHAPES.OCTAHEDRON]: [{ key: 'a', labelKey: 'a' }],
}

function fmtDim(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

/**
 * Interactive control panel for Class 8 and Beyond Class 8 shape selection,
 * folding progress, dimension sliders (1–10), unit selection, and visual highlighting.
 */
export default function ControlPanel({
  shape,
  onSelectShape,
  dimensions,
  mensuration,
  onChangeDimension,
  foldProgress,
  onChangeFoldProgress,
  highlightMode,
  onChangeHighlightMode,
  unit,
  onChangeUnit,
  translations: t,
  bookmarkedShapes = [],
  onToggleBookmarkShape,
}) {
  const activeDims = dimensions[shape]
  const dimFields = DIMENSION_FIELDS[shape]
  const unitSymbol = t.unitSymbols[unit].length
  const showUnitHint = shouldShowUnitHint(shape, activeDims, unit)
  const isSphere = shape === SHAPES.SPHERE
  const isHemisphere = shape === SHAPES.HEMISPHERE
  const hasNoNet = isSphere || isHemisphere
  const isNoLsa = isSphere || shape === SHAPES.OCTAHEDRON
  const noNetMessage = isSphere
    ? t.sphereNoNetMessage
    : t.hemisphereNoNetMessage
  const noLsaMessage = isSphere
    ? t.sphereLsaNotApplicable
    : t.octahedronLsaNotApplicable
  const isBeyond = isBeyondClass8Shape(shape)
  const isBookmarked = bookmarkedShapes.includes(shape)
  const bt = t.bookmarks

  const foldPresets = [
    { key: 'flat', label: t.foldPresets.flat, value: 0 },
    { key: 'half', label: t.foldPresets.half, value: 50 },
    { key: 'closed', label: t.foldPresets.closed, value: 100 },
  ]

  return (
    <section
      aria-label={t.shapeSectionTitle}
      className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      {/* Categorized Shape Selector */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {t.shapeSectionTitle}
          </h2>
          {typeof onToggleBookmarkShape === 'function' && bt && (
            <button
              type="button"
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? bt.removeShape : bt.addShape}
              onClick={() => onToggleBookmarkShape(shape)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span aria-hidden="true">{isBookmarked ? '★' : '☆'}</span>
              <span>{t.shapes[shape]}</span>
            </button>
          )}
        </div>

        {/* Class 8 Shapes */}
        <div>
          <p className="mb-1 text-[11px] font-bold text-slate-500">
            {t.class8CategoryLabel}
          </p>
          <div
            role="group"
            aria-label={t.class8CategoryLabel}
            className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/70"
          >
            {CLASS_8_SHAPES.map((item) => {
              const isSelected = shape === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectShape(item)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:-translate-y-px hover:bg-white/90 hover:text-slate-900'
                  }`}
                >
                  <ShapeThumbSvg shape={item} className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t.shapes[item]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Beyond Class 8 Shapes (grouped) */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-amber-700">
            {t.beyondClass8CategoryLabel}
          </p>
          <div
            role="group"
            aria-label={t.beyondClass8CategoryLabel}
            className="flex flex-col gap-2 rounded-xl bg-amber-50/80 p-2 ring-1 ring-amber-200/80"
          >
            {Object.entries(BEYOND_CLASS_8_GROUPS).map(
              ([groupKey, groupShapes]) => (
                <div key={groupKey}>
                  <p className="mb-1 text-[10px] font-bold tracking-wide text-amber-800/90 uppercase">
                    {t.beyondSubgroups[groupKey]}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {groupShapes.map((item) => {
                      const isSelected = shape === item
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onSelectShape(item)}
                          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] leading-tight font-semibold transition-all duration-150 cursor-pointer text-left ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white/60 text-amber-950 hover:-translate-y-px hover:bg-white'
                          }`}
                        >
                          <ShapeThumbSvg shape={item} className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-2">{t.shapes[item]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {isBeyond && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            {t.beyondClass8Badge}
          </div>
        )}
      </div>

      {/* Fold Slider (disabled with clear message for Sphere / Hemisphere) */}
      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label
            htmlFor="fold-slider"
            className="text-xs font-bold tracking-wide text-slate-700 uppercase"
          >
            {t.foldSectionTitle}
          </label>
          <span
            data-testid="fold-percentage"
            className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold text-white ${
              hasNoNet ? 'bg-slate-400' : 'bg-indigo-600'
            }`}
          >
            {hasNoNet ? '—' : `${foldProgress}%`}
          </span>
        </div>

        {hasNoNet ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            {noNetMessage}
          </p>
        ) : (
          <>
            <input
              id="fold-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={foldProgress}
              onChange={(event) =>
                onChangeFoldProgress(Number(event.target.value))
              }
              aria-label={t.foldSectionTitle}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
            />

            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              {foldPresets.map((preset) => {
                const isActive = foldProgress === preset.value
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => onChangeFoldProgress(preset.value)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Dimension Sliders (1 to 10) + Unit Toggle */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {t.dimensionsSectionTitle}
          </h2>

          <div
            role="group"
            aria-label={t.unitsSectionTitle}
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 ring-1 ring-slate-200"
          >
            {UNIT_OPTIONS.map((unitKey) => {
              const active = unit === unitKey
              return (
                <button
                  key={unitKey}
                  type="button"
                  aria-pressed={active}
                  aria-label={t.unitNames[unitKey]}
                  onClick={() => onChangeUnit(unitKey)}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                    active
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.unitShort[unitKey]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {dimFields.map(({ key, labelKey }) => {
            const value = activeDims[key]
            const inputId = `dim-slider-${shape}-${key}`
            return (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor={inputId}
                    className="font-semibold text-slate-700"
                  >
                    {t.dimensionLabels[labelKey]}
                  </label>
                  <span className="font-mono font-bold text-indigo-700">
                    {value} {unitSymbol}
                  </span>
                </div>
                <input
                  id={inputId}
                  type="range"
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  step={0.5}
                  value={value}
                  onChange={(event) =>
                    onChangeDimension(shape, key, Number(event.target.value))
                  }
                  aria-label={t.dimensionLabels[labelKey]}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
                />
              </div>
            )
          })}

          {/* Derived slant height or diameter pill */}
          {typeof mensuration.slantHeight === 'number' && (
            <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-xs ring-1 ring-rose-200">
              <span className="font-semibold text-rose-900">
                {shape === SHAPES.CONE || shape === SHAPES.FRUSTUM
                  ? t.dimensionLabels.slantL
                  : t.dimensionLabels.slantS}
              </span>
              <span className="font-mono font-bold text-rose-700">
                {fmtDim(mensuration.slantHeight)} {unitSymbol}
              </span>
            </div>
          )}

          {(isSphere || isHemisphere) && (
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-1.5 text-xs ring-1 ring-indigo-200">
              <span className="font-semibold text-indigo-900">
                {t.dimensionLabels.diameter}
              </span>
              <span className="font-mono font-bold text-indigo-700">
                {fmtDim(activeDims.r * 2)} {unitSymbol}
              </span>
            </div>
          )}
        </div>

        {showUnitHint && (
          <div
            role="status"
            className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950"
          >
            <p className="font-bold">{t.unitHintTitle}</p>
            <p className="mt-0.5 leading-relaxed text-amber-900">
              {t.unitHintBody}
            </p>
            <button
              type="button"
              onClick={() => onChangeUnit('cm')}
              className="mt-2 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-amber-700"
            >
              {t.unitHintSwitch}
            </button>
          </div>
        )}
      </div>

      {/* Visual Highlight Mode */}
      <div>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
          {t.highlightSectionTitle}
        </h2>
        <div
          role="group"
          aria-label={t.highlightSectionTitle}
          className="grid grid-cols-4 gap-1.5 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/70"
        >
          {HIGHLIGHT_OPTIONS.map((mode) => {
            const isDisabledLsa = isNoLsa && mode === 'lsa'
            const isSelected = highlightMode === mode && !isDisabledLsa
            return (
              <button
                key={mode}
                type="button"
                disabled={isDisabledLsa}
                aria-pressed={isSelected}
                title={isDisabledLsa ? noLsaMessage : undefined}
                onClick={() => onChangeHighlightMode(mode)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                  isDisabledLsa
                    ? 'cursor-not-allowed text-slate-400 line-through'
                    : isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                {t.highlightModes[mode]}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {isNoLsa && highlightMode === 'lsa'
            ? noLsaMessage
            : t.highlightDescriptions[highlightMode]}
        </p>
      </div>
    </section>
  )
}
