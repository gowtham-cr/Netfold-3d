import { useRef, useState } from 'react'
import { downloadCsvFile, downloadSvgAsPng } from '../../utils/chartExport.js'
import SpeakControlsBar from '../common/SpeakControlsBar.jsx'

const TAILWIND_BAR_HEX = {
  'bg-emerald-500': '#10b981',
  'bg-amber-500': '#f59e0b',
  'bg-rose-500': '#f43f5e',
  'bg-indigo-500': '#6366f1',
  'bg-cyan-600': '#0891b2',
  'bg-cyan-500': '#06b6d4',
  'bg-sky-500': '#0ea5e9',
}

function slugifyFilename(title = 'chart') {
  return (
    String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'netfold_chart'
  )
}

function ChartCard({
  title,
  subtitle,
  hoverReadout,
  empty,
  emptyMessage,
  theme = 'light',
  legendItems = [],
  onExportPng,
  onExportCsv,
  speakText,
  hasData = true,
  children,
}) {
  const isDark = theme === 'dark'
  const cardCls = isDark
    ? 'rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm text-slate-100 space-y-2.5'
    : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-900 space-y-2.5'
  const titleCls = isDark ? 'text-slate-100' : 'text-slate-800'
  const subCls = isDark ? 'text-slate-400' : 'text-slate-500'
  const btnCls = isDark
    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'

  const effectiveSpeakText =
    speakText ||
    [title, subtitle, empty ? emptyMessage : hoverReadout]
      .filter(Boolean)
      .join('. ')

  return (
    <div className={cardCls}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className={`text-xs font-extrabold uppercase tracking-wide ${titleCls}`}>
            {title}
          </h4>
          {subtitle && <p className={`text-[11px] mt-0.5 ${subCls}`}>{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 print:hidden">
          {hoverReadout && (
            <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-800">
              {hoverReadout}
            </span>
          )}
          <SpeakControlsBar
            compact
            text={effectiveSpeakText}
            sourceId={`chart_${slugifyFilename(title)}`}
            isDark={isDark}
          />
          {hasData && onExportPng && (
            <button
              type="button"
              onClick={onExportPng}
              title="Download chart image (PNG)"
              className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold transition-colors cursor-pointer ${btnCls}`}
            >
              PNG
            </button>
          )}
          {hasData && onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              title="Export underlying data (CSV)"
              className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold transition-colors cursor-pointer ${btnCls}`}
            >
              CSV
            </button>
          )}
        </div>
      </div>

      {empty ? (
        <div
          className={`rounded-xl border border-dashed p-6 text-center text-xs font-semibold ${
            isDark
              ? 'border-slate-700 bg-slate-950/60 text-slate-400'
              : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}
        >
          {emptyMessage}
        </div>
      ) : (
        <>
          {children}
          {legendItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              {legendItems.map((lg) => (
                <div
                  key={lg.label}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${subCls}`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: lg.color }}
                  />
                  <span>{lg.label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * 1. Interactive SVG Line Trend Chart
 */
export function LineTrendChart({
  title,
  subtitle,
  series = [],
  valueSuffix = '%',
  maxVal = 100,
  xAxisLabel,
  yAxisLabel,
  emptyMessage,
  strokeColor = '#4f46e5',
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const W = 460
  const H = 186
  const padX = 42
  const padY = 22
  const padBottom = 34
  const usableW = W - padX - 18
  const usableH = H - padY - padBottom
  const ceiling = Math.max(maxVal, ...series.map((s) => s.value ?? 0), 1)

  const pts = series.map((pt, idx) => {
    const x =
      series.length === 1
        ? padX + usableW / 2
        : padX + (idx / (series.length - 1)) * usableW
    const y = padY + (1 - Math.max(0, pt.value ?? 0) / ceiling) * usableH
    return { ...pt, x, y, idx }
  })

  const hovered = hoverIdx !== null ? pts[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!series || series.length === 0}
      emptyMessage={emptyMessage}
      hasData={series.length > 0}
      hoverReadout={
        hovered
          ? `${hovered.label}: ${hovered.value}${valueSuffix}${hovered.total ? ` (${hovered.correct ?? 0}/${hovered.total})` : ''}`
          : null
      }
      legendItems={[{ label: yAxisLabel || title, color: strokeColor }]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: xAxisLabel || 'Period' },
            { key: 'value', label: `Value (${valueSuffix || 'count'})` },
            { key: 'correct', label: 'Correct' },
            { key: 'total', label: 'Attempted' },
          ],
          series,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto max-h-52"
        >
          {[0, 0.5, 1].map((frac) => {
            const val = Math.round(ceiling * frac)
            const y = padY + (1 - frac) * usableH
            return (
              <g key={frac}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - 18}
                  y2={y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padX - 6}
                  y={y + 3.5}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="end"
                >
                  {val}
                  {valueSuffix}
                </text>
              </g>
            )
          })}

          {pts.length >= 2 && (
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          )}

          {pts.map((p) => {
            const showLbl =
              pts.length <= 10 || p.idx % Math.ceil(pts.length / 8) === 0 || p.idx === pts.length - 1
            return (
              <g
                key={`${p.label}_${p.idx}`}
                onMouseEnter={() => setHoverIdx(p.idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverIdx === p.idx ? 6 : 4}
                  fill={hoverIdx === p.idx ? '#0ea5e9' : strokeColor}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                />
                {showLbl && (
                  <text
                    x={p.x}
                    y={H - 12}
                    fontSize="8.8"
                    fontWeight="700"
                    fill={isDark ? '#cbd5e1' : '#475569'}
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                )}
              </g>
            )
          })}
          {xAxisLabel && (
            <text
              x={padX + usableW / 2}
              y={H - 2}
              fontSize="8.5"
              fontWeight="700"
              fill={isDark ? '#94a3b8' : '#64748b'}
              textAnchor="middle"
            >
              {xAxisLabel}
            </text>
          )}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 2. Interactive SVG Cumulative Area Chart
 */
export function AreaTrendChart({
  title,
  subtitle,
  series = [],
  valueLabel = 'Cumulative Correct',
  secondaryLabel = 'Cumulative Attempted',
  areaColor = '#0891b2',
  emptyMessage,
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const W = 460
  const H = 186
  const padX = 40
  const padY = 20
  const padBottom = 32
  const usableW = W - padX - 18
  const usableH = H - padY - padBottom

  const ceiling = Math.max(
    4,
    ...series.map((s) => Math.max(s.value ?? 0, s.cumulativeAttempted ?? 0)),
  )

  const pts = series.map((s, idx) => {
    const x =
      series.length === 1
        ? padX + usableW / 2
        : padX + (idx / (series.length - 1)) * usableW
    const y = padY + (1 - Math.max(0, s.value ?? 0) / ceiling) * usableH
    const y2 =
      s.cumulativeAttempted !== undefined
        ? padY + (1 - Math.max(0, s.cumulativeAttempted) / ceiling) * usableH
        : y
    return { ...s, x, y, y2, idx }
  })

  const hovered = hoverIdx !== null ? pts[hoverIdx] : null
  const baselineY = padY + usableH
  const areaPath =
    pts.length >= 2
      ? `M ${pts[0].x},${baselineY} L ${pts.map((p) => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1].x},${baselineY} Z`
      : ''

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!series || series.length === 0}
      emptyMessage={emptyMessage}
      hasData={series.length > 0}
      hoverReadout={
        hovered
          ? `${hovered.label}: ${hovered.value}${hovered.cumulativeAttempted !== undefined ? ` / ${hovered.cumulativeAttempted}` : ''}`
          : null
      }
      legendItems={[
        { label: valueLabel, color: areaColor },
        ...(series.some((s) => s.cumulativeAttempted !== undefined)
          ? [{ label: secondaryLabel, color: '#6366f1' }]
          : []),
      ]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Session / Date' },
            { key: 'value', label: valueLabel },
            { key: 'cumulativeAttempted', label: secondaryLabel },
          ],
          series,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto max-h-52"
        >
          {[0, 0.5, 1].map((frac) => {
            const val = Math.round(ceiling * frac)
            const y = padY + (1 - frac) * usableH
            return (
              <g key={frac}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - 18}
                  y2={y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padX - 6}
                  y={y + 3.5}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {areaPath && <path d={areaPath} fill={areaColor} fillOpacity="0.22" />}

          {pts.length >= 2 && pts.some((p) => p.cumulativeAttempted !== undefined) && (
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeDasharray="4 3"
              strokeWidth="2"
              points={pts.map((p) => `${p.x},${p.y2}`).join(' ')}
            />
          )}

          {pts.length >= 2 && (
            <polyline
              fill="none"
              stroke={areaColor}
              strokeWidth="2.8"
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          )}

          {pts.map((p) => (
            <g
              key={p.idx}
              onMouseEnter={() => setHoverIdx(p.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <circle cx={p.x} cy={p.y} r="9" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIdx === p.idx ? 5.5 : 3.2}
                fill={areaColor}
                stroke="#ffffff"
                strokeWidth="1.4"
              />
              {(pts.length <= 8 ||
                p.idx % Math.ceil(pts.length / 6) === 0 ||
                p.idx === pts.length - 1) && (
                <text
                  x={p.x}
                  y={H - 10}
                  fontSize="8.5"
                  fontWeight="700"
                  fill={isDark ? '#cbd5e1' : '#475569'}
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 3. Interactive SVG Horizontal Bar Chart (with hover tooltips, PNG & CSV export)
 */
export function HorizontalBarChart({
  title,
  subtitle,
  items = [],
  maxValue = 100,
  valueUnit = '',
  emptyMessage,
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const ceiling = Math.max(maxValue, ...items.map((it) => it.value ?? 0), 1)
  const rowH = 28
  const padTop = 10
  const labelW = 148
  const barMaxW = 228
  const rightPad = 76
  const W = labelW + barMaxW + rightPad
  const H = Math.max(70, padTop + items.length * rowH + 14)

  const hovered = hoverIdx !== null ? items[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!items || items.length === 0}
      emptyMessage={emptyMessage}
      hasData={items.length > 0}
      hoverReadout={
        hovered ? `${hovered.label}: ${hovered.displayRight ?? `${hovered.value}${valueUnit}`}` : null
      }
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Category' },
            { key: 'value', label: 'Numeric Value' },
            { key: 'displayRight', label: 'Summary' },
          ],
          items,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto"
        >
          {items.map((item, idx) => {
            const y = padTop + idx * rowH
            const ratio = Math.min(1, Math.max(0, (item.value ?? 0) / ceiling))
            const barW = Math.max(item.value > 0 ? 6 : 0, ratio * barMaxW)
            const hex =
              item.hexColor ?? TAILWIND_BAR_HEX[item.colorClass] ?? '#4f46e5'
            const isHov = hoverIdx === idx
            const lbl =
              String(item.label).length > 21
                ? `${String(item.label).slice(0, 20)}…`
                : String(item.label)

            return (
              <g
                key={item.id ?? `${idx}_${item.label}`}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <text
                  x={labelW - 8}
                  y={y + 15}
                  fontSize="10"
                  fontWeight={isHov ? '800' : '700'}
                  fill={isDark ? '#e2e8f0' : '#334155'}
                  textAnchor="end"
                >
                  {lbl}
                </text>
                <rect
                  x={labelW}
                  y={y + 5}
                  width={barMaxW}
                  height="13"
                  rx="5"
                  fill={isDark ? '#1e293b' : '#e2e8f0'}
                />
                <rect
                  x={labelW}
                  y={y + 5}
                  width={barW}
                  height="13"
                  rx="5"
                  fill={hex}
                  opacity={isHov ? 1 : 0.88}
                />
                <text
                  x={labelW + barMaxW + 8}
                  y={y + 15}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="monospace"
                  fill={isDark ? '#f8fafc' : '#0f172a'}
                >
                  {item.displayRight ?? `${item.value}${valueUnit}`}
                </text>
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 4. Interactive SVG Grouped Bar Chart (multi-series student comparison)
 */
export function GroupedBarChart({
  title,
  subtitle,
  groups = [],
  seriesMeta = [],
  maxVal = 100,
  valueSuffix = '%',
  emptyMessage,
  theme = 'light',
}) {
  const [hoverItem, setHoverItem] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const W = 460
  const H = 196
  const padX = 40
  const padY = 18
  const padBottom = 34
  const usableW = W - padX - 18
  const usableH = H - padY - padBottom
  const ceiling = Math.max(maxVal, 1)

  const nGroups = Math.max(1, groups.length)
  const groupW = usableW / nGroups
  const nSeries = Math.max(1, seriesMeta.length)
  const barW = Math.min(26, (groupW * 0.72) / nSeries)

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!groups || groups.length === 0}
      emptyMessage={emptyMessage}
      hasData={groups.length > 0}
      hoverReadout={
        hoverItem ? `${hoverItem.group} · ${hoverItem.series}: ${hoverItem.val}${valueSuffix}` : null
      }
      legendItems={seriesMeta.map((s) => ({ label: s.label, color: s.color }))}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Group' },
            ...seriesMeta.map((s) => ({ key: s.key, label: s.label })),
          ],
          groups.map((g) => ({
            label: g.label,
            ...Object.fromEntries(seriesMeta.map((s) => [s.key, g.values[s.key] ?? 0])),
          })),
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto max-h-56"
        >
          {[0, 0.5, 1].map((frac) => {
            const y = padY + (1 - frac) * usableH
            return (
              <g key={frac}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - 18}
                  y2={y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="3 3"
                />
                <text
                  x={padX - 6}
                  y={y + 3.5}
                  fontSize="9"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="end"
                >
                  {Math.round(ceiling * frac)}
                  {valueSuffix}
                </text>
              </g>
            )
          })}

          {groups.map((g, gIdx) => {
            const groupCenterX = padX + (gIdx + 0.5) * groupW
            const totalBarsW = nSeries * barW + (nSeries - 1) * 4
            const startX = groupCenterX - totalBarsW / 2
            return (
              <g key={g.id ?? g.label}>
                {seriesMeta.map((s, sIdx) => {
                  const val = Math.max(0, Number(g.values?.[s.key] ?? 0))
                  const h = (Math.min(val, ceiling) / ceiling) * usableH
                  const x = startX + sIdx * (barW + 4)
                  const y = padY + usableH - h
                  return (
                    <rect
                      key={s.key}
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(val > 0 ? 3 : 0, h)}
                      rx="3"
                      fill={s.color}
                      onMouseEnter={() =>
                        setHoverItem({ group: g.label, series: s.label, val })
                      }
                      onMouseLeave={() => setHoverItem(null)}
                      className="cursor-pointer"
                    />
                  )
                })}
                <text
                  x={groupCenterX}
                  y={H - 12}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isDark ? '#cbd5e1' : '#334155'}
                  textAnchor="middle"
                >
                  {g.label}
                </text>
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 5. SVG Stacked Bar Chart (supports 2 or 3 segments: Correct, Incorrect, optional Unanswered)
 */
export function DifficultyStackedBarChart({
  title,
  subtitle,
  rows = [],
  correctLabel = 'Correct',
  incorrectLabel = 'Incorrect',
  unansweredLabel = 'Unanswered',
  showUnanswered = false,
  emptyMessage,
  theme = 'light',
}) {
  const [hoverRow, setHoverRow] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const hasData = rows.some((r) => (r.correct ?? 0) + (r.incorrect ?? 0) + (showUnanswered ? (r.unanswered ?? 0) : 0) > 0)
  const rowH = 34
  const labelW = 110
  const barMaxW = 260
  const W = labelW + barMaxW + 84
  const H = Math.max(90, rows.length * rowH + 22)

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!hasData}
      emptyMessage={emptyMessage}
      hasData={hasData}
      hoverReadout={
        hoverRow
          ? `${hoverRow.label}: ✓${hoverRow.correct} / ✕${hoverRow.incorrect}${showUnanswered ? ` / ○${hoverRow.unanswered ?? 0}` : ''}`
          : null
      }
      legendItems={[
        { label: correctLabel, color: '#10b981' },
        { label: incorrectLabel, color: '#f43f5e' },
        ...(showUnanswered ? [{ label: unansweredLabel, color: '#94a3b8' }] : []),
      ]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Tier / Category' },
            { key: 'correct', label: correctLabel },
            { key: 'incorrect', label: incorrectLabel },
            ...(showUnanswered ? [{ key: 'unanswered', label: unansweredLabel }] : []),
          ],
          rows,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto"
        >
          {rows.map((r, idx) => {
            const c = r.correct ?? 0
            const inc = r.incorrect ?? 0
            const un = showUnanswered ? r.unanswered ?? 0 : 0
            const denom = Math.max(1, c + inc + un)
            const wC = (c / denom) * barMaxW
            const wInc = (inc / denom) * barMaxW
            const wUn = (un / denom) * barMaxW
            const y = 12 + idx * rowH

            return (
              <g
                key={r.difficulty ?? r.id ?? idx}
                onMouseEnter={() => setHoverRow(r)}
                onMouseLeave={() => setHoverRow(null)}
                className="cursor-pointer"
              >
                <text
                  x={labelW - 8}
                  y={y + 15}
                  fontSize="10"
                  fontWeight="700"
                  fill={isDark ? '#e2e8f0' : '#334155'}
                  textAnchor="end"
                >
                  {String(r.label).slice(0, 16)}
                </text>
                <rect
                  x={labelW}
                  y={y + 4}
                  width={barMaxW}
                  height="14"
                  rx="4"
                  fill={isDark ? '#1e293b' : '#e2e8f0'}
                />
                {wC > 0 && (
                  <rect x={labelW} y={y + 4} width={wC} height="14" fill="#10b981" />
                )}
                {wInc > 0 && (
                  <rect
                    x={labelW + wC}
                    y={y + 4}
                    width={wInc}
                    height="14"
                    fill="#f43f5e"
                  />
                )}
                {wUn > 0 && (
                  <rect
                    x={labelW + wC + wInc}
                    y={y + 4}
                    width={wUn}
                    height="14"
                    fill="#94a3b8"
                  />
                )}
                <text
                  x={labelW + barMaxW + 8}
                  y={y + 15}
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="monospace"
                  fill={isDark ? '#cbd5e1' : '#334155'}
                >
                  {c}/{inc}/{showUnanswered ? un : c + inc}
                </text>
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 6. Interactive SVG Topic Radar Chart
 */
export function TopicRadarChart({
  title,
  subtitle,
  axes = [],
  emptyMessage,
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const size = 250
  const cx = size / 2
  const cy = size / 2
  const maxR = 80
  const rings = [25, 50, 75, 100]

  const n = axes.length
  const points = axes.map((ax, i) => {
    const angle = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2
    const valR = (Math.max(0, Math.min(100, ax.value)) / 100) * maxR
    return {
      ...ax,
      idx: i,
      angle,
      x: cx + valR * Math.cos(angle),
      y: cy + valR * Math.sin(angle),
      outerX: cx + maxR * Math.cos(angle),
      outerY: cy + maxR * Math.sin(angle),
      lblX: cx + (maxR + 22) * Math.cos(angle),
      lblY: cy + (maxR + 22) * Math.sin(angle),
    }
  })

  const hovered = hoverIdx !== null ? points[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!axes || axes.length < 3}
      emptyMessage={emptyMessage}
      hasData={axes.length >= 3}
      hoverReadout={hovered ? `${hovered.label}: ${hovered.value}%` : null}
      legendItems={[{ label: 'Accuracy (%)', color: '#4f46e5' }]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Topic' },
            { key: 'value', label: 'Score / Accuracy (%)' },
          ],
          axes,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 flex justify-center ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={title}
          className="w-60 h-60"
        >
          {rings.map((r) => {
            const radius = (r / 100) * maxR
            const poly = points
              .map(
                (p) =>
                  `${cx + radius * Math.cos(p.angle)},${cy + radius * Math.sin(p.angle)}`,
              )
              .join(' ')
            return (
              <polygon
                key={r}
                points={poly}
                fill="none"
                stroke={isDark ? '#334155' : '#cbd5e1'}
                strokeWidth="1"
              />
            )
          })}

          {points.map((p) => (
            <line
              key={`spoke_${p.idx}`}
              x1={cx}
              y1={cy}
              x2={p.outerX}
              y2={p.outerY}
              stroke={isDark ? '#334155' : '#cbd5e1'}
              strokeWidth="1"
            />
          ))}

          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="rgba(79, 70, 229, 0.25)"
            stroke="#4f46e5"
            strokeWidth="2.4"
          />

          {points.map((p) => (
            <g
              key={p.idx}
              onMouseEnter={() => setHoverIdx(p.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <circle cx={p.x} cy={p.y} r="9" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIdx === p.idx ? 5 : 3.5}
                fill={hoverIdx === p.idx ? '#0ea5e9' : '#4f46e5'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={p.lblX}
                y={p.lblY}
                fontSize="8.5"
                fontWeight="700"
                fill={isDark ? '#e2e8f0' : '#334155'}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {p.shortLabel}
              </text>
            </g>
          ))}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 7. Interactive SVG Donut / Pie Chart
 */
export function StudyDonutChart({
  title,
  subtitle,
  segments = [],
  valueSuffix = 's',
  emptyMessage,
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const total = segments.reduce((s, seg) => s + (seg.value ?? 0), 0)
  const r = 46
  const circ = 2 * Math.PI * r
  const arcs = segments.reduce((acc, seg, idx) => {
    const pct = total > 0 ? Math.round(((seg.value ?? 0) / total) * 100) : 0
    const len = total > 0 ? ((seg.value ?? 0) / total) * circ : 0
    const offset = idx === 0 ? 0 : acc[idx - 1].offset + acc[idx - 1].len
    acc.push({ ...seg, idx, pct, len, offset })
    return acc
  }, [])

  const hovered = hoverIdx !== null ? arcs[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={total <= 0}
      emptyMessage={emptyMessage}
      hasData={total > 0}
      hoverReadout={
        hovered
          ? `${hovered.label}: ${hovered.value}${valueSuffix} (${hovered.pct}%)`
          : null
      }
      legendItems={arcs.map((a) => ({
        label: `${a.label} (${a.pct}%)`,
        color: a.color,
      }))}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Segment' },
            { key: 'value', label: `Value (${valueSuffix || 'count'})` },
            { key: 'pct', label: 'Share (%)' },
          ],
          arcs,
        )
      }
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg
          ref={svgRef}
          viewBox="0 0 130 130"
          role="img"
          aria-label={title}
          className="w-36 h-36 shrink-0"
        >
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke={isDark ? '#1e293b' : '#e2e8f0'}
            strokeWidth="18"
          />
          {arcs.map((arc) => (
            <circle
              key={arc.id ?? arc.label}
              cx="65"
              cy="65"
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={hoverIdx === arc.idx ? '21' : '18'}
              strokeDasharray={`${arc.len} ${circ - arc.len}`}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90 65 65)"
              onMouseEnter={() => setHoverIdx(arc.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer transition-all"
            />
          ))}
          <text
            x="65"
            y="63"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            fill={isDark ? '#f8fafc' : '#0f172a'}
          >
            {Math.round(total)}
            {valueSuffix}
          </text>
          <text
            x="65"
            y="77"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill={isDark ? '#94a3b8' : '#64748b'}
          >
            Total
          </text>
        </svg>

        <ul className="flex-1 w-full space-y-2 text-xs">
          {arcs.map((arc) => (
            <li
              key={arc.id ?? arc.label}
              onMouseEnter={() => setHoverIdx(arc.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-950/70'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: arc.color }}
                />
                <span>{arc.label}</span>
              </div>
              <span className="font-mono font-bold">
                {arc.value}
                {valueSuffix} ({arc.pct}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

/**
 * 8. Interactive SVG Weekly Activity Heatmap (28 Days)
 */
export function ActivityHeatmapChart({
  title,
  subtitle,
  days = [],
  legendLess = 'Less',
  legendMore = 'More',
  theme = 'light',
}) {
  const [hoverDay, setHoverDay] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const cellSize = 30
  const gap = 6
  const cols = 7
  const W = cols * (cellSize + gap) + 20
  const rows = Math.max(1, Math.ceil(days.length / cols))
  const H = rows * (cellSize + gap) + 18

  const colorFor = (cnt) => {
    if (cnt <= 0) return isDark ? '#1e293b' : '#f1f5f9'
    if (cnt <= 2) return '#6ee7b7'
    if (cnt <= 5) return '#10b981'
    return '#047857'
  }

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!days || days.length === 0}
      hasData={days.length > 0}
      hoverReadout={hoverDay ? `${hoverDay.dateKey}: ${hoverDay.count} attempts` : null}
      legendItems={[
        { label: legendLess, color: isDark ? '#1e293b' : '#f1f5f9' },
        { label: '1–2', color: '#6ee7b7' },
        { label: '3–5', color: '#10b981' },
        { label: legendMore, color: '#047857' },
      ]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'dateKey', label: 'Date' },
            { key: 'count', label: 'Attempts' },
          ],
          days,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 flex justify-center ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full max-w-md h-auto"
        >
          {days.map((d, idx) => {
            const col = idx % cols
            const row = Math.floor(idx / cols)
            const x = 10 + col * (cellSize + gap)
            const y = 8 + row * (cellSize + gap)
            return (
              <g
                key={d.dateKey ?? idx}
                onMouseEnter={() => setHoverDay(d)}
                onMouseLeave={() => setHoverDay(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx="6"
                  fill={colorFor(d.count)}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeWidth="1"
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + 3.5}
                  fontSize="9.5"
                  fontWeight="800"
                  fontFamily="monospace"
                  fill={d.count > 2 ? '#ffffff' : isDark ? '#cbd5e1' : '#334155'}
                  textAnchor="middle"
                >
                  {d.count}
                </text>
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 9. Interactive SVG Score Distribution Histogram
 */
export function HistogramChart({
  title,
  subtitle,
  bins = [],
  emptyMessage,
  barColor = '#0891b2',
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const total = bins.reduce((s, b) => s + (b.count ?? 0), 0)
  const W = 440
  const H = 180
  const padX = 36
  const padY = 18
  const padBottom = 30
  const usableW = W - padX - 18
  const usableH = H - padY - padBottom
  const maxCnt = Math.max(2, ...bins.map((b) => b.count ?? 0))
  const colW = usableW / Math.max(1, bins.length)

  const hovered = hoverIdx !== null ? bins[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={total === 0}
      emptyMessage={emptyMessage}
      hasData={total > 0}
      hoverReadout={hovered ? `${hovered.label}: ${hovered.count} sessions` : null}
      legendItems={[{ label: 'Session Count', color: barColor }]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Score Range' },
            { key: 'count', label: 'Sessions' },
          ],
          bins,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto max-h-52"
        >
          {[0, 0.5, 1].map((frac) => {
            const y = padY + (1 - frac) * usableH
            return (
              <g key={frac}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - 18}
                  y2={y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="3 3"
                />
                <text
                  x={padX - 6}
                  y={y + 3.5}
                  fontSize="9"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="end"
                >
                  {Math.round(maxCnt * frac)}
                </text>
              </g>
            )
          })}

          {bins.map((b, idx) => {
            const barW = colW * 0.72
            const x = padX + idx * colW + (colW - barW) / 2
            const h = ((b.count ?? 0) / maxCnt) * usableH
            const y = padY + usableH - h
            return (
              <g
                key={b.id ?? idx}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(b.count > 0 ? 4 : 0, h)}
                  rx="4"
                  fill={hoverIdx === idx ? '#4f46e5' : barColor}
                />
                <text
                  x={x + barW / 2}
                  y={H - 10}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isDark ? '#cbd5e1' : '#334155'}
                  textAnchor="middle"
                >
                  {b.label}
                </text>
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 10. Interactive SVG Box Plot (Min, Q1, Median, Q3, Max + Mean)
 */
export function BoxPlotChart({
  title,
  subtitle,
  rows = [],
  emptyMessage,
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const rowH = 38
  const labelW = 126
  const plotW = 260
  const W = labelW + plotW + 54
  const H = Math.max(100, rows.length * rowH + 34)
  const hovered = hoverIdx !== null ? rows[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!rows || rows.length === 0}
      emptyMessage={emptyMessage}
      hasData={rows.length > 0}
      hoverReadout={
        hovered
          ? `${hovered.label}: Min ${hovered.min}% · Q1 ${hovered.q1}% · Med ${hovered.median}% · Q3 ${hovered.q3}% · Max ${hovered.max}%`
          : null
      }
      legendItems={[
        { label: 'IQR (Q1–Q3)', color: '#6366f1' },
        { label: 'Median', color: '#f59e0b' },
      ]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Profile / Group' },
            { key: 'min', label: 'Min (%)' },
            { key: 'q1', label: 'Q1 (%)' },
            { key: 'median', label: 'Median (%)' },
            { key: 'q3', label: 'Q3 (%)' },
            { key: 'max', label: 'Max (%)' },
            { key: 'mean', label: 'Mean (%)' },
          ],
          rows,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto"
        >
          {[0, 25, 50, 75, 100].map((v) => {
            const x = labelW + (v / 100) * plotW
            return (
              <g key={v}>
                <line
                  x1={x}
                  y1={8}
                  x2={x}
                  y2={H - 22}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="2 3"
                />
                <text
                  x={x}
                  y={H - 8}
                  fontSize="8.5"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="middle"
                >
                  {v}%
                </text>
              </g>
            )
          })}

          {rows.map((r, idx) => {
            const toX = (pct) => labelW + (Math.max(0, Math.min(100, pct)) / 100) * plotW
            const cy = 20 + idx * rowH
            const xMin = toX(r.min)
            const xQ1 = toX(r.q1)
            const xMed = toX(r.median)
            const xQ3 = toX(r.q3)
            const xMax = toX(r.max)
            return (
              <g
                key={r.id ?? idx}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <text
                  x={labelW - 8}
                  y={cy + 3.5}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isDark ? '#e2e8f0' : '#334155'}
                  textAnchor="end"
                >
                  {String(r.label).slice(0, 18)}
                </text>
                <line
                  x1={xMin}
                  y1={cy}
                  x2={xMax}
                  y2={cy}
                  stroke={isDark ? '#cbd5e1' : '#475569'}
                  strokeWidth="1.5"
                />
                <line x1={xMin} y1={cy - 6} x2={xMin} y2={cy + 6} stroke="#64748b" strokeWidth="1.8" />
                <line x1={xMax} y1={cy - 6} x2={xMax} y2={cy + 6} stroke="#64748b" strokeWidth="1.8" />
                <rect
                  x={xQ1}
                  y={cy - 8}
                  width={Math.max(4, xQ3 - xQ1)}
                  height="16"
                  rx="3"
                  fill="rgba(99, 102, 241, 0.35)"
                  stroke="#6366f1"
                  strokeWidth="1.8"
                />
                <line
                  x1={xMed}
                  y1={cy - 9}
                  x2={xMed}
                  y2={cy + 9}
                  stroke="#f59e0b"
                  strokeWidth="2.8"
                />
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 11. Interactive SVG Speed vs Accuracy Scatter Plot
 */
export function SpeedAccuracyScatterChart({
  title,
  subtitle,
  points = [],
  emptyMessage,
  xAxisLabel = 'Avg Time / Q (s)',
  yAxisLabel = 'Accuracy (%)',
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const W = 440
  const H = 190
  const padX = 42
  const padY = 20
  const padBottom = 32
  const usableW = W - padX - 20
  const usableH = H - padY - padBottom
  const maxX = Math.max(30, ...points.map((p) => p.xSec), 1)
  const hovered = hoverIdx !== null ? points[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!points || points.length === 0}
      emptyMessage={emptyMessage}
      hasData={points.length > 0}
      hoverReadout={
        hovered
          ? `${hovered.label}: ${hovered.xSec}s · ${hovered.yAccuracy}% (${hovered.count}q)`
          : null
      }
      legendItems={[{ label: `${xAxisLabel} vs ${yAxisLabel}`, color: '#0891b2' }]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'label', label: 'Topic' },
            { key: 'xSec', label: xAxisLabel },
            { key: 'yAccuracy', label: yAxisLabel },
            { key: 'count', label: 'Questions' },
          ],
          points,
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto max-h-52"
        >
          {[0, 50, 100].map((val) => {
            const y = padY + (1 - val / 100) * usableH
            return (
              <g key={val}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - 20}
                  y2={y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="3 3"
                />
                <text
                  x={padX - 6}
                  y={y + 3.5}
                  fontSize="9"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            )
          })}

          {points.map((p, idx) => {
            const x = padX + Math.min(1, p.xSec / maxX) * usableW
            const y = padY + (1 - Math.min(100, Math.max(0, p.yAccuracy)) / 100) * usableH
            const rad = Math.min(11, 5 + (p.count ?? 1))
            return (
              <g
                key={p.topic ?? idx}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={hoverIdx === idx ? rad + 2.5 : rad}
                  fill={
                    p.yAccuracy >= 70
                      ? 'rgba(16, 185, 129, 0.85)'
                      : 'rgba(244, 63, 94, 0.85)'
                  }
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={y - rad - 3}
                  fontSize="8.5"
                  fontWeight="700"
                  fill={isDark ? '#e2e8f0' : '#334155'}
                  textAnchor="middle"
                >
                  {p.shortLabel}
                </text>
              </g>
            )
          })}
          <text
            x={padX + usableW / 2}
            y={H - 8}
            fontSize="9"
            fontWeight="700"
            fill={isDark ? '#94a3b8' : '#64748b'}
            textAnchor="middle"
          >
            {xAxisLabel} (0s → {Math.round(maxX)}s)
          </text>
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 12. Interactive SVG 2D Matrix Heatmap (Students × Topics OR Years × Topics)
 */
export function MatrixHeatmapChart({
  title,
  subtitle,
  rows = [], // [{ id, rowLabel, values: { colKey: numericValueOrNull } }]
  cols = [], // [{ key, label }]
  valueSuffix = '',
  emptyMessage,
  theme = 'light',
}) {
  const [hoverCell, setHoverCell] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const labelW = 122
  const cellW = 42
  const cellH = 26
  const padTop = 34
  const W = Math.max(360, labelW + cols.length * cellW + 16)
  const H = Math.max(96, padTop + rows.length * cellH + 14)

  const maxVal = Math.max(
    1,
    ...rows.flatMap((r) =>
      cols.map((c) => Number(r.values?.[c.key] ?? 0)),
    ),
  )

  const fillFor = (val) => {
    if (val === null || val === undefined) return isDark ? '#1e293b' : '#f1f5f9'
    const ratio = Math.min(1, Math.max(0, val / maxVal))
    if (ratio === 0) return isDark ? '#1e293b' : '#f8fafc'
    if (ratio < 0.35) return '#bae6fd'
    if (ratio < 0.7) return '#38bdf8'
    return '#0284c7'
  }

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={rows.length === 0 || cols.length === 0}
      emptyMessage={emptyMessage}
      hasData={rows.length > 0 && cols.length > 0}
      hoverReadout={
        hoverCell
          ? `${hoverCell.rowLabel} × ${hoverCell.colLabel}: ${
              hoverCell.val !== null && hoverCell.val !== undefined
                ? `${hoverCell.val}${valueSuffix}`
                : '—'
            }`
          : null
      }
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'rowLabel', label: 'Row' },
            ...cols.map((c) => ({ key: c.key, label: c.label })),
          ],
          rows.map((r) => ({
            rowLabel: r.rowLabel,
            ...Object.fromEntries(cols.map((c) => [c.key, r.values?.[c.key] ?? ''])),
          })),
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 overflow-x-auto ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto min-w-[440px]"
        >
          {cols.map((c, cIdx) => (
            <text
              key={c.key}
              x={labelW + cIdx * cellW + cellW / 2}
              y={20}
              fontSize="8.5"
              fontWeight="700"
              fill={isDark ? '#cbd5e1' : '#475569'}
              textAnchor="middle"
            >
              {String(c.label).slice(0, 8)}
            </text>
          ))}

          {rows.map((r, rIdx) => {
            const y = padTop + rIdx * cellH
            return (
              <g key={r.id ?? r.rowLabel}>
                <text
                  x={labelW - 8}
                  y={y + 16}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isDark ? '#e2e8f0' : '#334155'}
                  textAnchor="end"
                >
                  {String(r.rowLabel).slice(0, 17)}
                </text>
                {cols.map((c, cIdx) => {
                  const val = r.values?.[c.key] ?? null
                  const x = labelW + cIdx * cellW
                  return (
                    <g
                      key={c.key}
                      onMouseEnter={() =>
                        setHoverCell({ rowLabel: r.rowLabel, colLabel: c.label, val })
                      }
                      onMouseLeave={() => setHoverCell(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={x + 2}
                        y={y + 2}
                        width={cellW - 4}
                        height={cellH - 4}
                        rx="4"
                        fill={fillFor(val)}
                        stroke={isDark ? '#334155' : '#cbd5e1'}
                        strokeWidth="0.8"
                      />
                      <text
                        x={x + cellW / 2}
                        y={y + 16}
                        fontSize="9"
                        fontWeight="800"
                        fontFamily="monospace"
                        fill={val !== null && val > maxVal * 0.65 ? '#ffffff' : isDark ? '#cbd5e1' : '#0f172a'}
                        textAnchor="middle"
                      >
                        {val !== null ? `${val}${valueSuffix}` : '—'}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}

/**
 * 13. PYQ Year-Wise Timeline Chart (1999-2026) distinguishing Indexed Counts from Unknown Coverage
 */
export function YearCoverageTimelineChart({
  title,
  subtitle,
  years = [], // [{ year, label, count (null if unindexed), coverageUnknown }]
  indexedLabel = 'Indexed Questions',
  unknownLabel = 'Source Coverage Unknown (Not 0)',
  emptyMessage,
  theme = 'light',
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const svgRef = useRef(null)
  const isDark = theme === 'dark'
  const slug = slugifyFilename(title)

  const W = 540
  const H = 195
  const padX = 36
  const padY = 20
  const padBottom = 34
  const usableW = W - padX - 16
  const usableH = H - padY - padBottom
  const maxCnt = Math.max(4, ...years.map((y) => y.count ?? 0))
  const colW = usableW / Math.max(1, years.length)
  const hovered = hoverIdx !== null ? years[hoverIdx] : null

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      theme={theme}
      empty={!years || years.length === 0}
      emptyMessage={emptyMessage}
      hasData={years.length > 0}
      hoverReadout={
        hovered
          ? hovered.coverageUnknown
            ? `${hovered.year}: ${unknownLabel}`
            : `${hovered.year}: ${hovered.count} ${indexedLabel}`
          : null
      }
      legendItems={[
        { label: indexedLabel, color: '#0891b2' },
        { label: unknownLabel, color: '#94a3b8' },
      ]}
      onExportPng={() =>
        downloadSvgAsPng(svgRef.current, `${slug}.png`, isDark ? '#0f172a' : '#ffffff')
      }
      onExportCsv={() =>
        downloadCsvFile(
          `${slug}.csv`,
          [
            { key: 'year', label: 'Year' },
            { key: 'countDisplay', label: 'Question Count' },
            { key: 'coverageStatus', label: 'Archive Coverage Status' },
          ],
          years.map((y) => ({
            year: y.year,
            countDisplay: y.coverageUnknown ? 'Unknown' : y.count,
            coverageStatus: y.coverageUnknown ? 'Unknown (Unindexed)' : 'Indexed',
          })),
        )
      }
    >
      <figure
        className={`rounded-xl border p-2 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full h-auto max-h-56"
        >
          {[0, 0.5, 1].map((frac) => {
            const y = padY + (1 - frac) * usableH
            return (
              <g key={frac}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - 16}
                  y2={y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeDasharray="3 3"
                />
                <text
                  x={padX - 6}
                  y={y + 3.5}
                  fontSize="9"
                  fontWeight="700"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="end"
                >
                  {Math.round(maxCnt * frac)}
                </text>
              </g>
            )
          })}

          {years.map((yr, idx) => {
            const bw = Math.max(6, colW * 0.68)
            const x = padX + idx * colW + (colW - bw) / 2
            const baselineY = padY + usableH
            const isUnknown = yr.coverageUnknown || yr.count === null
            const h = isUnknown ? 12 : (yr.count / maxCnt) * usableH
            const y = baselineY - h
            const showYrLbl =
              years.length <= 14 || idx % 3 === 0 || idx === years.length - 1

            return (
              <g
                key={yr.year}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                {isUnknown ? (
                  <>
                    <rect
                      x={x}
                      y={y}
                      width={bw}
                      height={h}
                      rx="2"
                      fill="none"
                      stroke={isDark ? '#64748b' : '#94a3b8'}
                      strokeDasharray="2 2"
                      strokeWidth="1.2"
                    />
                    <text
                      x={x + bw / 2}
                      y={y + 9}
                      fontSize="7.5"
                      fontWeight="800"
                      fill={isDark ? '#94a3b8' : '#64748b'}
                      textAnchor="middle"
                    >
                      ?
                    </text>
                  </>
                ) : (
                  <rect
                    x={x}
                    y={y}
                    width={bw}
                    height={Math.max(4, h)}
                    rx="3"
                    fill={hoverIdx === idx ? '#4f46e5' : '#0891b2'}
                  />
                )}
                {showYrLbl && (
                  <text
                    x={x + bw / 2}
                    y={H - 12}
                    fontSize="8.5"
                    fontWeight="700"
                    fill={isDark ? '#cbd5e1' : '#475569'}
                    textAnchor="middle"
                  >
                    {yr.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </figure>
    </ChartCard>
  )
}
