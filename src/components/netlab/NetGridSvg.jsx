import { validateCubeNet } from '../../utils/mathEngine.js'
import { CUBE_FACE_METADATA } from '../../utils/netGeometry.js'

const FACE_COLOR_MAP = Object.fromEntries(
  CUBE_FACE_METADATA.map((item) => [item.id, item.color]),
)

/**
 * Reusable 2D square-grid SVG preview for any connected or disconnected net pattern.
 */
export default function NetGridSvg({
  cells,
  rootIndex = 0,
  uniformColor = null,
  showFaceCodes = false,
  highlightFace = null,
  className = 'h-20 w-full',
  ariaLabel = '',
}) {
  if (!Array.isArray(cells) || cells.length === 0) {
    return null
  }

  let minR = Infinity
  let maxR = -Infinity
  let minC = Infinity
  let maxC = -Infinity
  for (const [r, c] of cells) {
    if (r < minR) minR = r
    if (r > maxR) maxR = r
    if (c < minC) minC = c
    if (c > maxC) maxC = c
  }

  const cols = maxC - minC + 1
  const rows = maxR - minR + 1
  const cellSize = 24
  const pad = 6
  const width = cols * cellSize + pad * 2
  const height = rows * cellSize + pad * 2

  const validation = showFaceCodes ? validateCubeNet(cells, rootIndex) : null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      {cells.map(([r, c], idx) => {
        const x = pad + (c - minC) * cellSize
        const y = pad + (r - minR) * cellSize
        const assigned = validation?.assignedFaces?.find(
          (f) => f.row === r && f.col === c,
        )
        const faceId = assigned?.faceId
        const isHighlighted = highlightFace && faceId === highlightFace
        const fill = uniformColor
          ? uniformColor
          : FACE_COLOR_MAP[faceId] ?? '#6366f1'

        return (
          <g key={`${r}-${c}-${idx}`}>
            <rect
              x={x + 1}
              y={y + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              rx={3}
              fill={fill}
              stroke={isHighlighted ? '#facc15' : '#0f172a'}
              strokeWidth={isHighlighted ? 2.5 : 1.25}
              opacity={highlightFace && !isHighlighted ? 0.45 : 0.94}
            />
            {showFaceCodes && faceId && (
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 3.5}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#ffffff"
              >
                {faceId[0].toUpperCase()}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
