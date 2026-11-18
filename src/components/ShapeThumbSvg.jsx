import { SHAPES } from '../utils/mathEngine.js'

/**
 * Lightweight vector silhouette for all 15 3D shapes used inside ControlPanel cards,
 * Global Search results, and Bookmarks.
 */
export default function ShapeThumbSvg({ shape, className = 'h-4 w-4 shrink-0' }) {
  const renderIcon = () => {
    switch (shape) {
      case SHAPES.CUBE:
        return (
          <>
            <polygon points="12,3 20,7.5 12,12 4,7.5" fill="currentColor" opacity="0.25" />
            <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <polyline points="4,7.5 12,12 20,7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="1.6" />
          </>
        )
      case SHAPES.CUBOID:
        return (
          <>
            <polygon points="3,8 15,8 19,5 7,5" fill="currentColor" opacity="0.25" />
            <rect x="3" y="8" width="12" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <polyline points="3,8 7,5 19,5 19,16 15,19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <line x1="15" y1="8" x2="19" y2="5" stroke="currentColor" strokeWidth="1.6" />
          </>
        )
      case SHAPES.CYLINDER:
        return (
          <>
            <ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5,6.5 L5,17.5 A7,2.8 0 0,0 19,17.5 L19,6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </>
        )
      case SHAPES.CONE:
        return (
          <>
            <ellipse cx="12" cy="18.2" rx="7" ry="2.5" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5,18.2 L12,3.5 L19,18.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </>
        )
      case SHAPES.SPHERE:
        return (
          <>
            <circle cx="12" cy="12" r="8.2" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="12" cy="12" rx="8.2" ry="3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.5 2" />
          </>
        )
      case SHAPES.HEMISPHERE:
        return (
          <>
            <path d="M4,15 A8,8 0 0,1 20,15 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="12" cy="15" rx="8" ry="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </>
        )
      case SHAPES.FRUSTUM:
        return (
          <>
            <ellipse cx="12" cy="6.5" rx="4.5" ry="1.8" fill="currentColor" opacity="0.24" stroke="currentColor" strokeWidth="1.8" />
            <path d="M7.5,6.5 L4.5,18 A7.5,2.6 0 0,0 19.5,18 L16.5,6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </>
        )
      case SHAPES.OCTAHEDRON:
        return (
          <>
            <polygon points="12,3 20,12 12,21 4,12" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
          </>
        )
      case SHAPES.TRIANGULAR_PRISM:
      case SHAPES.PENTAGONAL_PRISM:
      case SHAPES.HEXAGONAL_PRISM:
        return (
          <>
            <polygon points="7,4 17,4 20,8 4,8" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M4,8 L4,18 L20,18 L20,8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <line x1="12" y1="8" x2="12" y2="18" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
          </>
        )
      default:
        // Pyramids (Square / Triangular / Pentagonal / Hexagonal)
        return (
          <>
            <polygon points="12,3.5 19.5,16.5 12,19.5 4.5,16.5" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <line x1="12" y1="3.5" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.5" />
          </>
        )
    }
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {renderIcon()}
    </svg>
  )
}
