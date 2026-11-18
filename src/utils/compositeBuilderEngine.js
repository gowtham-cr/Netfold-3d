import { getCompositeBuilderTranslations } from '../data/compositeBuilderTranslations.js'
import { TRANSLATIONS } from '../data/translations.js'
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
  SHAPES,
  calculateShape,
} from './mathEngine.js'
import { loadActiveProfileId } from './profileStorage.js'

const COMPOSITE_STORAGE_PREFIX = 'netfold_composite_models_v1'

export const DEFAULT_COMPONENT_DIMS = Object.freeze({
  [SHAPES.CUBE]: { a: 4 },
  [SHAPES.CUBOID]: { l: 4, b: 3, h: 5 },
  [SHAPES.CYLINDER]: { r: 3, h: 5 },
  [SHAPES.CONE]: { r: 3, h: 4 },
  [SHAPES.SPHERE]: { r: 3 },
  [SHAPES.HEMISPHERE]: { r: 3 },
  [SHAPES.TRIANGULAR_PRISM]: { a: 4, h: 5 },
  [SHAPES.PENTAGONAL_PRISM]: { a: 3, h: 5 },
  [SHAPES.HEXAGONAL_PRISM]: { a: 3, h: 5 },
  [SHAPES.TRIANGULAR_PYRAMID]: { a: 4, h: 4 },
  [SHAPES.SQUARE_PYRAMID]: { a: 4, h: 4 },
  [SHAPES.PENTAGONAL_PYRAMID]: { a: 3, h: 4 },
  [SHAPES.HEXAGONAL_PYRAMID]: { a: 3, h: 4 },
  [SHAPES.FRUSTUM]: { r1: 4, r2: 2, h: 4 },
  [SHAPES.OCTAHEDRON]: { a: 4 },
})

export const SHAPE_PALETTE_ORDER = Object.freeze([
  SHAPES.CYLINDER,
  SHAPES.CONE,
  SHAPES.HEMISPHERE,
  SHAPES.CUBE,
  SHAPES.CUBOID,
  SHAPES.SPHERE,
  SHAPES.TRIANGULAR_PRISM,
  SHAPES.SQUARE_PYRAMID,
  SHAPES.FRUSTUM,
  SHAPES.PENTAGONAL_PRISM,
  SHAPES.HEXAGONAL_PRISM,
  SHAPES.TRIANGULAR_PYRAMID,
  SHAPES.PENTAGONAL_PYRAMID,
  SHAPES.HEXAGONAL_PYRAMID,
  SHAPES.OCTAHEDRON,
])

export const COMPONENT_COLORS = Object.freeze([
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#db2777',
  '#7c3aed',
  '#2563eb',
])

const CIRCULAR_SHAPES = new Set([
  SHAPES.CYLINDER,
  SHAPES.CONE,
  SHAPES.SPHERE,
  SHAPES.HEMISPHERE,
  SHAPES.FRUSTUM,
])

const RECT_FLAT_SHAPES = new Set([SHAPES.CUBE, SHAPES.CUBOID])

function roundVal(val, decimals = 4) {
  if (!Number.isFinite(val)) return 0
  const factor = 10 ** decimals
  return Math.round(val * factor) / factor
}

export function fmtCompositeNum(val) {
  if (val === null || val === undefined || !Number.isFinite(val)) return '—'
  return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)))
}

export function validateComponentDimensions(shape, rawDims = {}) {
  const template = DEFAULT_COMPONENT_DIMS[shape] ?? { a: 4 }
  const normalized = {}
  const errors = []

  for (const [key, fallbackVal] of Object.entries(template)) {
    const raw = rawDims?.[key]
    const num = Number(raw)
    if (
      raw === '' ||
      raw === null ||
      raw === undefined ||
      !Number.isFinite(num) ||
      num < MIN_DIMENSION ||
      num > MAX_DIMENSION
    ) {
      errors.push(`${key}:${MIN_DIMENSION}-${MAX_DIMENSION}`)
      const clamped = Number.isFinite(num)
        ? Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, num))
        : fallbackVal
      normalized[key] = roundVal(clamped, 2)
    } else {
      normalized[key] = roundVal(num, 2)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized,
  }
}

function getPolygonCircumradius(sides, a) {
  return a / (2 * Math.sin(Math.PI / sides))
}

/**
 * Local geometric bounding half-extents (centered around local [0, 0, 0]) and
 * native top/bottom face contact descriptors for every supported solid.
 */
export function getComponentLocalSpec(shape, dims = {}) {
  const validDims = validateComponentDimensions(shape, dims).normalized
  const calc = calculateShape(shape, validDims)

  if (shape === SHAPES.CUBE) {
    const { a } = validDims
    const face = { kind: 'rect', width: a, depth: a, area: a * a }
    return {
      dims: validDims,
      calc,
      halfX: a / 2,
      halfY: a / 2,
      halfZ: a / 2,
      topFace: face,
      bottomFace: face,
    }
  }

  if (shape === SHAPES.CUBOID) {
    const { l, b, h } = validDims
    const cap = { kind: 'rect', width: l, depth: b, area: l * b }
    return {
      dims: validDims,
      calc,
      halfX: l / 2,
      halfY: h / 2,
      halfZ: b / 2,
      topFace: cap,
      bottomFace: cap,
    }
  }

  if (shape === SHAPES.CYLINDER) {
    const { r, h } = validDims
    const cap = { kind: 'circle', radius: r, area: Math.PI * r * r }
    return {
      dims: validDims,
      calc,
      halfX: r,
      halfY: h / 2,
      halfZ: r,
      topFace: cap,
      bottomFace: cap,
    }
  }

  if (shape === SHAPES.CONE) {
    const { r, h } = validDims
    return {
      dims: validDims,
      calc,
      halfX: r,
      halfY: h / 2,
      halfZ: r,
      topFace: { kind: 'point', area: 0 },
      bottomFace: { kind: 'circle', radius: r, area: Math.PI * r * r },
    }
  }

  if (shape === SHAPES.SPHERE) {
    const { r } = validDims
    return {
      dims: validDims,
      calc,
      halfX: r,
      halfY: r,
      halfZ: r,
      topFace: { kind: 'point', area: 0 },
      bottomFace: { kind: 'point', area: 0 },
    }
  }

  if (shape === SHAPES.HEMISPHERE) {
    const { r } = validDims
    return {
      dims: validDims,
      calc,
      halfX: r,
      halfY: r / 2,
      halfZ: r,
      topFace: { kind: 'point', area: 0 },
      bottomFace: { kind: 'circle', radius: r, area: Math.PI * r * r },
    }
  }

  if (shape === SHAPES.FRUSTUM) {
    const { r1, r2, h } = validDims
    const maxR = Math.max(r1, r2)
    return {
      dims: validDims,
      calc,
      halfX: maxR,
      halfY: h / 2,
      halfZ: maxR,
      topFace: { kind: 'circle', radius: r2, area: Math.PI * r2 * r2 },
      bottomFace: { kind: 'circle', radius: r1, area: Math.PI * r1 * r1 },
    }
  }

  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PRISM ? 3 : shape === SHAPES.PENTAGONAL_PRISM ? 5 : 6
    const { a, h } = validDims
    const R = getPolygonCircumradius(sides, a)
    const face = {
      kind: 'polygon',
      sides,
      radius: R,
      area: calc.baseArea,
    }
    return {
      dims: validDims,
      calc,
      halfX: R,
      halfY: h / 2,
      halfZ: R,
      topFace: face,
      bottomFace: face,
    }
  }

  if (
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.SQUARE_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PYRAMID
        ? 3
        : shape === SHAPES.SQUARE_PYRAMID
          ? 4
          : shape === SHAPES.PENTAGONAL_PYRAMID
            ? 5
            : 6
    const { a, h } = validDims
    const R = sides === 4 ? a / Math.SQRT2 : getPolygonCircumradius(sides, a)
    const baseFace =
      sides === 4
        ? { kind: 'rect', width: a, depth: a, area: calc.baseArea }
        : { kind: 'polygon', sides, radius: R, area: calc.baseArea }
    return {
      dims: validDims,
      calc,
      halfX: sides === 4 ? a / 2 : R,
      halfY: h / 2,
      halfZ: sides === 4 ? a / 2 : R,
      topFace: { kind: 'point', area: 0 },
      bottomFace: baseFace,
    }
  }

  // Regular Octahedron
  const { a } = validDims
  const R = a / Math.SQRT2
  return {
    dims: validDims,
    calc,
    halfX: R,
    halfY: R,
    halfZ: R,
    topFace: { kind: 'point', area: 0 },
    bottomFace: { kind: 'point', area: 0 },
  }
}

/**
 * Computes Euler-rotated world AABB half-extents for a component.
 */
export function getComponentWorldBounds(component) {
  const spec = getComponentLocalSpec(component.shape, component.dimensions)
  const [px, py, pz] = component.position ?? [0, spec.halfY, 0]
  const [rx, ry, rz] = component.rotation ?? [0, 0, 0]

  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)

  // Three.js intrinsic XYZ rotation matrix elements
  const m11 = cy * cz
  const m12 = -cy * sz
  const m13 = sy

  const m21 = cx * sz + sx * sy * cz
  const m22 = cx * cz - sx * sy * sz
  const m23 = -sx * cy

  const m31 = sx * sz - cx * sy * cz
  const m32 = sx * cz + cx * sy * sz
  const m33 = cx * cy

  const worldHalfX =
    Math.abs(m11) * spec.halfX + Math.abs(m12) * spec.halfY + Math.abs(m13) * spec.halfZ
  const worldHalfY =
    Math.abs(m21) * spec.halfX + Math.abs(m22) * spec.halfY + Math.abs(m23) * spec.halfZ
  const worldHalfZ =
    Math.abs(m31) * spec.halfX + Math.abs(m32) * spec.halfY + Math.abs(m33) * spec.halfZ

  // Determine whether +Y local up points up or inverted (e.g. inverted hemisphere bowl / cone)
  const upDotY = m22
  const isUpsideDown = upDotY < -0.95
  const isUpright = upDotY > 0.95

  return {
    spec,
    position: [px, py, pz],
    rotation: [rx, ry, rz],
    halfX: worldHalfX,
    halfY: worldHalfY,
    halfZ: worldHalfZ,
    minX: px - worldHalfX,
    maxX: px + worldHalfX,
    minY: py - worldHalfY,
    maxY: py + worldHalfY,
    minZ: pz - worldHalfZ,
    maxZ: pz + worldHalfZ,
    effectiveTopFace: isUpright
      ? spec.topFace
      : isUpsideDown
        ? spec.bottomFace
        : { kind: 'tilted', area: 0 },
    effectiveBottomFace: isUpright
      ? spec.bottomFace
      : isUpsideDown
        ? spec.topFace
        : { kind: 'tilted', area: 0 },
  }
}

export function createBuilderComponent(shape, overrides = {}) {
  const defaultDims = { ...(DEFAULT_COMPONENT_DIMS[shape] ?? { a: 4 }) }
  const dimensions = validateComponentDimensions(
    shape,
    overrides.dimensions ? { ...defaultDims, ...overrides.dimensions } : defaultDims,
  ).normalized
  const spec = getComponentLocalSpec(shape, dimensions)
  const id =
    overrides.id ||
    `comp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  return {
    id,
    shape,
    dimensions,
    position: overrides.position ?? [0, spec.halfY, 0],
    rotation: overrides.rotation ?? [0, 0, 0],
    visible: overrides.visible !== false,
    color: overrides.color ?? COMPONENT_COLORS[0],
  }
}

/**
 * Generates ready-to-teach classroom starter composite scenes (Cone on Cylinder,
 * Hemisphere on Cylinder, Two Cuboids Side-by-Side, and Multi-Part Solid).
 */
export function buildPresetCompositeScene(presetId, piMode = '22/7') {
  if (presetId === 'hemiOnCylinder') {
    const c1 = createBuilderComponent(SHAPES.CYLINDER, {
      id: 'preset_cyl_1',
      dimensions: { r: 3, h: 5 },
      color: COMPONENT_COLORS[0],
    })
    const c2Raw = createBuilderComponent(SHAPES.HEMISPHERE, {
      id: 'preset_hemi_2',
      dimensions: { r: 3 },
      color: COMPONENT_COLORS[1],
    })
    const c2 = snapComponentOnTop(c2Raw, c1)
    return {
      components: [c1, c2],
      questionText:
        'A hemisphere of radius 3 cm is placed on top of a solid cylinder of radius 3 cm and height 5 cm. Find the total volume and external surface area of the composite solid.',
      piMode,
    }
  }

  if (presetId === 'twoCuboidsSide') {
    const c1 = createBuilderComponent(SHAPES.CUBOID, {
      id: 'preset_cuboid_1',
      dimensions: { l: 4, b: 3, h: 5 },
      color: COMPONENT_COLORS[0],
    })
    const c2Raw = createBuilderComponent(SHAPES.CUBOID, {
      id: 'preset_cuboid_2',
      dimensions: { l: 2, b: 3, h: 5 },
      color: COMPONENT_COLORS[3],
    })
    const c2 = snapComponentSideBySide(c2Raw, c1, 'x')
    return {
      components: [c1, c2],
      questionText:
        'Two cuboids of dimensions 4 cm × 3 cm × 5 cm and 2 cm × 3 cm × 5 cm are combined side by side along their 3 cm × 5 cm face. Find total volume and external surface area.',
      piMode,
    }
  }

  if (presetId === 'capsule') {
    const hemiBotRaw = createBuilderComponent(SHAPES.HEMISPHERE, {
      id: 'preset_cap_bot',
      dimensions: { r: 2 },
      rotation: [Math.PI, 0, 0],
      color: COMPONENT_COLORS[2],
    })
    const hemiBot = alignComponentToFloor(hemiBotRaw)
    const cyl = snapComponentOnTop(
      createBuilderComponent(SHAPES.CYLINDER, {
        id: 'preset_cap_mid',
        dimensions: { r: 2, h: 4 },
        color: COMPONENT_COLORS[0],
      }),
      hemiBot,
    )
    const cone = snapComponentOnTop(
      createBuilderComponent(SHAPES.CONE, {
        id: 'preset_cap_top',
        dimensions: { r: 2, h: 3 },
        color: COMPONENT_COLORS[3],
      }),
      cyl,
    )
    return {
      components: [hemiBot, cyl, cone],
      questionText:
        'A three-part composite toy consists of an inverted hemisphere base (r = 2 cm), a cylinder body (r = 2 cm, h = 4 cm), and a top cone (r = 2 cm, h = 3 cm). Find total volume and external surface area.',
      piMode,
    }
  }

  // Default: Cone placed on top of a cylinder with equal radii
  const c1 = createBuilderComponent(SHAPES.CYLINDER, {
    id: 'preset_cc_cyl',
    dimensions: { r: 3, h: 5 },
    color: COMPONENT_COLORS[0],
  })
  const c2 = snapComponentOnTop(
    createBuilderComponent(SHAPES.CONE, {
      id: 'preset_cc_cone',
      dimensions: { r: 3, h: 4 },
      color: COMPONENT_COLORS[1],
    }),
    c1,
  )
  return {
    components: [c1, c2],
    questionText:
      'A cone of radius 3 cm and height 4 cm is placed on top of a solid cylinder of equal radius 3 cm and height 5 cm. Find the total volume and external surface area of the composite solid.',
    piMode,
  }
}

// =========================================================================
// SMART SNAP & ALIGNMENT HELPERS
// =========================================================================

export function alignComponentToFloor(component) {
  const b = getComponentWorldBounds(component)
  return {
    ...component,
    position: [roundVal(component.position[0], 3), roundVal(b.halfY, 3), roundVal(component.position[2], 3)],
  }
}

export function centerComponentOver(movingComp, targetComp) {
  return {
    ...movingComp,
    position: [
      roundVal(targetComp.position[0], 3),
      roundVal(movingComp.position[1], 3),
      roundVal(targetComp.position[2], 3),
    ],
  }
}

export function snapComponentOnTop(movingComp, targetComp) {
  const targetB = getComponentWorldBounds(targetComp)
  const movingB = getComponentWorldBounds(movingComp)
  return {
    ...movingComp,
    position: [
      roundVal(targetComp.position[0], 3),
      roundVal(targetB.maxY + movingB.halfY, 3),
      roundVal(targetComp.position[2], 3),
    ],
  }
}

export function snapComponentSideBySide(movingComp, targetComp, axis = 'x') {
  const targetB = getComponentWorldBounds(targetComp)
  const movingB = getComponentWorldBounds(movingComp)
  const nextY = roundVal(targetB.minY + movingB.halfY, 3)

  if (axis === 'z') {
    return {
      ...movingComp,
      position: [
        roundVal(targetComp.position[0], 3),
        nextY,
        roundVal(targetB.maxZ + movingB.halfZ, 3),
      ],
    }
  }

  return {
    ...movingComp,
    position: [
      roundVal(targetB.maxX + movingB.halfX, 3),
      nextY,
      roundVal(targetComp.position[2], 3),
    ],
  }
}

export function matchComponentRadiusOrWidth(movingComp, targetComp) {
  const tDims = targetComp.dimensions ?? {}
  const mDims = { ...(movingComp.dimensions ?? {}) }
  const targetR = tDims.r ?? tDims.r1 ?? (tDims.a ? tDims.a / 2 : tDims.l ? tDims.l / 2 : 3)

  if (Object.prototype.hasOwnProperty.call(mDims, 'r')) {
    mDims.r = validateComponentDimensions(movingComp.shape, { ...mDims, r: targetR }).normalized.r
  } else if (Object.prototype.hasOwnProperty.call(mDims, 'r1')) {
    mDims.r1 = validateComponentDimensions(movingComp.shape, { ...mDims, r1: targetR }).normalized.r1
  } else if (Object.prototype.hasOwnProperty.call(mDims, 'a')) {
    const side = tDims.a ?? tDims.l ?? targetR * 2
    mDims.a = validateComponentDimensions(movingComp.shape, { ...mDims, a: side }).normalized.a
  } else if (Object.prototype.hasOwnProperty.call(mDims, 'l')) {
    const nextL = tDims.l ?? tDims.a ?? targetR * 2
    const nextB = tDims.b ?? tDims.a ?? targetR * 2
    mDims.l = validateComponentDimensions(movingComp.shape, { ...mDims, l: nextL }).normalized.l
    mDims.b = validateComponentDimensions(movingComp.shape, { ...mDims, b: nextB }).normalized.b
  }

  return {
    ...movingComp,
    dimensions: mDims,
  }
}

export function updateComponentDimensionAndKeepFloor(component, dimKey, newVal) {
  const prevBounds = getComponentWorldBounds(component)
  const prevMinY = prevBounds.minY
  const validation = validateComponentDimensions(component.shape, {
    ...component.dimensions,
    [dimKey]: newVal,
  })
  const updated = {
    ...component,
    dimensions: validation.normalized,
  }
  const nextBounds = getComponentWorldBounds(updated)
  // Keep bottom plane anchored so resizing height grows upward smoothly instead of sinking through floor/lower solid
  const nextY = roundVal(prevMinY + nextBounds.halfY, 3)
  return {
    component: {
      ...updated,
      position: [component.position[0], nextY, component.position[2]],
    },
    validation,
  }
}

/**
 * Computes exploded offset position away from the composite centroid without changing
 * the component's canonical stored coordinates.
 */
export function computeExplodedPosition(component, centroid, explodeFactor = 0) {
  const safeFactor = Math.max(0, Math.min(1, Number(explodeFactor) || 0))
  if (safeFactor === 0) return component.position

  const [cx, cy, cz] = centroid
  const [px, py, pz] = component.position
  const dx = px - cx
  const dy = py - cy
  const dz = pz - cz
  const dist = Math.hypot(dx, dy, dz)

  const scaleSpread = 3.2 * safeFactor
  if (dist < 0.05) {
    return [px, roundVal(py + scaleSpread * 0.5, 3), pz]
  }
  return [
    roundVal(px + (dx / dist) * scaleSpread, 3),
    roundVal(py + (dy / dist) * scaleSpread, 3),
    roundVal(pz + (dz / dist) * scaleSpread, 3),
  ]
}

export function getCompositeCentroid(components) {
  const vis = components.filter((c) => c.visible !== false)
  if (!vis.length) return [0, 0, 0]
  let sx = 0
  let sy = 0
  let sz = 0
  for (const c of vis) {
    sx += c.position[0]
    sy += c.position[1]
    sz += c.position[2]
  }
  return [sx / vis.length, sy / vis.length, sz / vis.length]
}

// =========================================================================
// CONTACT SURFACE & AUTOMATIC COMPOSITE PROBLEM ANALYSIS
// =========================================================================

function circleIntersectionArea(r1, r2, d) {
  if (r1 <= 0 || r2 <= 0) return 0
  if (d >= r1 + r2) return 0
  if (d <= Math.abs(r1 - r2)) {
    const rMin = Math.min(r1, r2)
    return Math.PI * rMin * rMin
  }
  const d2 = d * d
  const r1Sq = r1 * r1
  const r2Sq = r2 * r2
  const part1 = r1Sq * Math.acos(Math.max(-1, Math.min(1, (d2 + r1Sq - r2Sq) / (2 * d * r1))))
  const part2 = r2Sq * Math.acos(Math.max(-1, Math.min(1, (d2 + r2Sq - r1Sq) / (2 * d * r2))))
  const part3 =
    0.5 *
    Math.sqrt(
      Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)),
    )
  return Math.max(0, part1 + part2 - part3)
}

function getEffectiveRadialFootprint(comp, bounds) {
  if (CIRCULAR_SHAPES.has(comp.shape)) {
    return Math.max(bounds.halfX, bounds.halfZ)
  }
  return null
}

function detectHorizontalFaceOverlapArea(upperComp, upperBounds, lowerComp, lowerBounds) {
  const uFace = upperBounds.effectiveBottomFace
  const lFace = lowerBounds.effectiveTopFace
  if (!uFace || !lFace || uFace.area <= 0 || lFace.area <= 0) return 0

  const dx = upperBounds.position[0] - lowerBounds.position[0]
  const dz = upperBounds.position[2] - lowerBounds.position[2]
  const dXZ = Math.hypot(dx, dz)

  if (uFace.kind === 'circle' && lFace.kind === 'circle') {
    return circleIntersectionArea(uFace.radius, lFace.radius, dXZ)
  }

  const ox = Math.max(
    0,
    Math.min(upperBounds.maxX, lowerBounds.maxX) - Math.max(upperBounds.minX, lowerBounds.minX),
  )
  const oz = Math.max(
    0,
    Math.min(upperBounds.maxZ, lowerBounds.maxZ) - Math.max(upperBounds.minZ, lowerBounds.minZ),
  )
  const rectOverlap = ox * oz
  if (rectOverlap <= 0) return 0

  return Math.min(rectOverlap, uFace.area, lFace.area)
}

function areSolidsInteriorOverlapping(compA, bA, compB, bB) {
  const oy = Math.min(bA.maxY, bB.maxY) - Math.max(bA.minY, bB.minY)
  if (oy <= 0.1) return false

  const rA = getEffectiveRadialFootprint(compA, bA)
  const rB = getEffectiveRadialFootprint(compB, bB)
  if (rA !== null && rB !== null) {
    const distXZ = Math.hypot(
      bA.position[0] - bB.position[0],
      bA.position[2] - bB.position[2],
    )
    return distXZ < rA + rB - 0.1
  }

  const ox = Math.min(bA.maxX, bB.maxX) - Math.max(bA.minX, bB.minX)
  const oz = Math.min(bA.maxZ, bB.maxZ) - Math.max(bA.minZ, bB.minZ)
  return ox > 0.1 && oz > 0.1
}

function computeGapBetweenBounds(bA, bB) {
  const gx = Math.max(0, Math.max(bA.minX, bB.minX) - Math.min(bA.maxX, bB.maxX))
  const gy = Math.max(0, Math.max(bA.minY, bB.minY) - Math.min(bA.maxY, bB.maxY))
  const gz = Math.max(0, Math.max(bA.minZ, bB.minZ) - Math.min(bA.maxZ, bB.maxZ))
  return Math.hypot(gx, gy, gz)
}

/**
 * Analyzes the complete composite 3D scene: computes each component's metrics, detects hidden
 * internal contact interfaces (horizontal stack or side-by-side faces), checks for interior
 * overlaps or disconnected solids, and produces exact combined volume & external surface area.
 */
export function analyzeCompositeSolid(components, options = {}) {
  const { piMode = '22/7', unit = 'cm' } = options
  const visible = (components ?? []).filter((c) => c.visible !== false)

  if (visible.length === 0) {
    return {
      status: 'empty',
      componentAnalyses: [],
      contactInterfaces: [],
      overlaps: [],
      disconnectedPairsCount: 0,
      totalVolume: 0,
      naiveTsaSum: 0,
      excludedContactArea: 0,
      externalSurfaceArea: 0,
      piUsed: piMode === '3.14' ? 3.14 : 22 / 7,
      piMode,
      unit,
    }
  }

  const boundsList = visible.map((c) => ({
    comp: c,
    bounds: getComponentWorldBounds(c),
  }))

  const componentAnalyses = boundsList.map(({ comp, bounds }, index) => ({
    id: comp.id,
    index,
    shape: comp.shape,
    dimensions: bounds.spec.dims,
    bounds,
    lsa: bounds.spec.calc.lsa,
    tsa: bounds.spec.calc.tsa,
    volume: bounds.spec.calc.volume,
    slantHeight: bounds.spec.calc.slantHeight ?? null,
    baseArea: bounds.spec.calc.baseArea ?? null,
    piCoefficients: bounds.spec.calc.piCoefficients ?? null,
  }))

  const contactInterfaces = []
  const overlaps = []
  const adj = Array.from({ length: visible.length }, () => new Set())

  for (let i = 0; i < boundsList.length; i += 1) {
    for (let j = i + 1; j < boundsList.length; j += 1) {
      const { comp: cA, bounds: bA } = boundsList[i]
      const { comp: cB, bounds: bB } = boundsList[j]

      if (areSolidsInteriorOverlapping(cA, bA, cB, bB)) {
        overlaps.push({ aId: cA.id, bId: cB.id, aIndex: i, bIndex: j })
        adj[i].add(j)
        adj[j].add(i)
        continue
      }

      const gap = computeGapBetweenBounds(bA, bB)
      if (gap <= 0.14) {
        adj[i].add(j)
        adj[j].add(i)
      }

      // 1. Vertical stacking flush interface (top of lower touches bottom of upper)
      const aBelowB = Math.abs(bA.maxY - bB.minY) <= 0.1
      const bBelowA = Math.abs(bB.maxY - bA.minY) <= 0.1
      if (aBelowB || bBelowA) {
        const lower = aBelowB ? boundsList[i] : boundsList[j]
        const upper = aBelowB ? boundsList[j] : boundsList[i]
        const area = detectHorizontalFaceOverlapArea(
          upper.comp,
          upper.bounds,
          lower.comp,
          lower.bounds,
        )
        if (area > 0.01) {
          const uFace = upper.bounds.effectiveBottomFace
          const lFace = lower.bounds.effectiveTopFace
          const jointRadius =
            uFace.kind === 'circle' && lFace.kind === 'circle'
              ? Math.min(uFace.radius, lFace.radius)
              : null
          contactInterfaces.push({
            id: `joint_${cA.id}_${cB.id}_y`,
            orientation: 'horizontal',
            aId: lower.comp.id,
            bId: upper.comp.id,
            aIndex: aBelowB ? i : j,
            bIndex: aBelowB ? j : i,
            singleFaceArea: area,
            excludedTotalArea: 2 * area,
            jointCenter: [
              (upper.bounds.position[0] + lower.bounds.position[0]) / 2,
              lower.bounds.maxY,
              (upper.bounds.position[2] + lower.bounds.position[2]) / 2,
            ],
            jointRadius,
            width: Math.min(upper.bounds.halfX, lower.bounds.halfX) * 2,
            depth: Math.min(upper.bounds.halfZ, lower.bounds.halfZ) * 2,
          })
          continue
        }
      }

      // 2. Side-by-side flush along X plane
      const aLeftB = Math.abs(bA.maxX - bB.minX) <= 0.1
      const bLeftA = Math.abs(bB.maxX - bA.minX) <= 0.1
      if (
        (aLeftB || bLeftA) &&
        RECT_FLAT_SHAPES.has(cA.shape) &&
        RECT_FLAT_SHAPES.has(cB.shape)
      ) {
        const oy = Math.max(0, Math.min(bA.maxY, bB.maxY) - Math.max(bA.minY, bB.minY))
        const oz = Math.max(0, Math.min(bA.maxZ, bB.maxZ) - Math.max(bA.minZ, bB.minZ))
        const area = oy * oz
        if (area > 0.01) {
          const xPlane = aLeftB ? bA.maxX : bB.maxX
          contactInterfaces.push({
            id: `joint_${cA.id}_${cB.id}_x`,
            orientation: 'vertical_x',
            aId: cA.id,
            bId: cB.id,
            aIndex: i,
            bIndex: j,
            singleFaceArea: area,
            excludedTotalArea: 2 * area,
            jointCenter: [
              xPlane,
              (Math.min(bA.maxY, bB.maxY) + Math.max(bA.minY, bB.minY)) / 2,
              (Math.min(bA.maxZ, bB.maxZ) + Math.max(bA.minZ, bB.minZ)) / 2,
            ],
            width: oz,
            height: oy,
          })
          continue
        }
      }

      // 3. Side-by-side flush along Z plane
      const aBackB = Math.abs(bA.maxZ - bB.minZ) <= 0.1
      const bBackA = Math.abs(bB.maxZ - bA.minZ) <= 0.1
      if (
        (aBackB || bBackA) &&
        RECT_FLAT_SHAPES.has(cA.shape) &&
        RECT_FLAT_SHAPES.has(cB.shape)
      ) {
        const ox = Math.max(0, Math.min(bA.maxX, bB.maxX) - Math.max(bA.minX, bB.minX))
        const oy = Math.max(0, Math.min(bA.maxY, bB.maxY) - Math.max(bA.minY, bB.minY))
        const area = ox * oy
        if (area > 0.01) {
          const zPlane = aBackB ? bA.maxZ : bB.maxZ
          contactInterfaces.push({
            id: `joint_${cA.id}_${cB.id}_z`,
            orientation: 'vertical_z',
            aId: cA.id,
            bId: cB.id,
            aIndex: i,
            bIndex: j,
            singleFaceArea: area,
            excludedTotalArea: 2 * area,
            jointCenter: [
              (Math.min(bA.maxX, bB.maxX) + Math.max(bA.minX, bB.minX)) / 2,
              (Math.min(bA.maxY, bB.maxY) + Math.max(bA.minY, bB.minY)) / 2,
              zPlane,
            ],
            width: ox,
            height: oy,
          })
        }
      }
    }
  }

  // BFS graph connectivity check
  const visited = new Set([0])
  const queue = [0]
  while (queue.length > 0) {
    const curr = queue.shift()
    for (const nbr of adj[curr]) {
      if (!visited.has(nbr)) {
        visited.add(nbr)
        queue.push(nbr)
      }
    }
  }
  const isConnected = visited.size === visible.length

  const totalVolume = componentAnalyses.reduce((s, c) => s + c.volume, 0)
  const naiveTsaSum = componentAnalyses.reduce((s, c) => s + c.tsa, 0)
  const excludedContactArea = contactInterfaces.reduce(
    (s, j) => s + j.excludedTotalArea,
    0,
  )
  const externalSurfaceArea = Math.max(0, naiveTsaSum - excludedContactArea)

  const status =
    overlaps.length > 0
      ? 'overlap_warning'
      : !isConnected && visible.length > 1
        ? 'disconnected_warning'
        : 'ready'

  return {
    status,
    componentAnalyses,
    contactInterfaces,
    overlaps,
    disconnectedPairsCount: visible.length - visited.size,
    totalVolume,
    naiveTsaSum,
    excludedContactArea,
    externalSurfaceArea,
    piUsed: piMode === '3.14' ? 3.14 : 22 / 7,
    piMode,
    unit,
  }
}

function getFormulaLabel(shape) {
  if (shape === SHAPES.CUBE) return 'V = a³, TSA = 6a²'
  if (shape === SHAPES.CUBOID) return 'V = l×b×h, TSA = 2(lb + bh + hl)'
  if (shape === SHAPES.CYLINDER) return 'V = πr²h, CSA = 2πrh, TSA = 2πr(r + h)'
  if (shape === SHAPES.CONE) return 'V = ⅓πr²h, CSA = πrl, l = √(r² + h²)'
  if (shape === SHAPES.SPHERE) return 'V = (4/3)πr³, TSA = 4πr²'
  if (shape === SHAPES.HEMISPHERE) return 'V = ⅔πr³, CSA = 2πr², TSA = 3πr²'
  if (shape === SHAPES.FRUSTUM) return 'V = ⅓πh(R² + Rr + r²), CSA = π(R + r)l'
  if (shape === SHAPES.SQUARE_PYRAMID) return 'V = ⅓a²h, TSA = a² + 2as'
  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM
  ) {
    return 'V = Base Area × h, TSA = 2×Base + LSA'
  }
  return 'V = ⅓ × Base Area × h, TSA = Base + LSA'
}

/**
 * Generates the exact 7 interactive teaching stages required for "Understand & Solve"
 * in all 5 supported languages (English, Kannada, Tamil, Telugu, Hindi).
 */
export function generateComposite7Steps(
  analysis,
  questionText = '',
  language = 'en',
  translations = null,
) {
  const t = translations ?? TRANSLATIONS[language] ?? TRANSLATIONS.en
  const ct = getCompositeBuilderTranslations(language)
  const unit = analysis?.unit ?? 'cm'
  const areaU = t.unitSymbols?.[unit]?.area ?? `${unit}²`
  const volU = t.unitSymbols?.[unit]?.volume ?? `${unit}³`

  const compSummaries = (analysis?.componentAnalyses ?? []).map((ca, idx) => {
    const sName = t.shapes?.[ca.shape] ?? ca.shape
    const dimList = Object.entries(ca.dimensions)
      .map(([k, v]) => `${k} = ${fmtCompositeNum(v)} ${unit}`)
      .join(', ')
    return {
      idx,
      compId: ca.id,
      shape: ca.shape,
      name: sName,
      dimList,
      formula: getFormulaLabel(ca.shape),
      volStr: `${fmtCompositeNum(ca.volume)} ${volU}`,
      tsaStr: `${fmtCompositeNum(ca.tsa)} ${areaU}`,
      lsaStr: ca.lsa !== null ? `${fmtCompositeNum(ca.lsa)} ${areaU}` : null,
      slantStr:
        ca.slantHeight !== null ? `, l/s = ${fmtCompositeNum(ca.slantHeight)} ${unit}` : '',
    }
  })

  const titles = ct.sevenStagesTitles

  const jointNotes = (analysis?.contactInterfaces ?? []).map(
    (ji) =>
      `${ct.componentPrefix} ${ji.aIndex + 1} ↔ ${ct.componentPrefix} ${ji.bIndex + 1}: 2 × ${fmtCompositeNum(
        ji.singleFaceArea,
      )} = ${fmtCompositeNum(ji.excludedTotalArea)} ${areaU}`,
  )

  return [
    {
      stepNo: 1,
      title: titles[0],
      visualMode: 'complete',
      highlightId: null,
      showDimensions: false,
      body:
        String(questionText ?? '').trim() ||
        `${ct.subtitle} (${compSummaries.map((c) => c.name).join(' + ')})`,
    },
    {
      stepNo: 2,
      title: titles[1],
      visualMode: 'components',
      highlightId: compSummaries[0]?.compId ?? null,
      showDimensions: false,
      body: compSummaries
        .map((c) => `• ${ct.componentPrefix} ${c.idx + 1}: ${c.name}`)
        .join('\n'),
    },
    {
      stepNo: 3,
      title: titles[2],
      visualMode: 'dimensions',
      highlightId: null,
      showDimensions: true,
      body: compSummaries
        .map((c) => `• ${ct.componentPrefix} ${c.idx + 1} (${c.name}): ${c.dimList}${c.slantStr}`)
        .join('\n'),
    },
    {
      stepNo: 4,
      title: titles[3],
      visualMode: 'formulas',
      highlightId: null,
      showDimensions: true,
      body: [
        ...compSummaries.map((c) => `• ${c.name}: ${c.formula}`),
        `• ${ct.combineModes.additiveSA}: Σ TSA − 2 × Contact Area (${ct.combineModes.naiveWarning})`,
      ].join('\n'),
    },
    {
      stepNo: 5,
      title: titles[4],
      visualMode: 'individual',
      highlightId: compSummaries[0]?.compId ?? null,
      showDimensions: true,
      body: compSummaries
        .map(
          (c) =>
            `• ${ct.componentPrefix} ${c.idx + 1} (${c.name}): V = ${c.volStr}, TSA = ${c.tsaStr}${
              c.lsaStr ? `, CSA/LSA = ${c.lsaStr}` : ''
            }`,
        )
        .join('\n'),
    },
    {
      stepNo: 6,
      title: titles[5],
      visualMode: 'combine',
      highlightId: null,
      showDimensions: true,
      body: [
        `• ${ct.totalVolumeLabel}: ${compSummaries.map((c) => c.volStr).join(' + ')} = ${fmtCompositeNum(
          analysis.totalVolume,
        )} ${volU}`,
        `• ${ct.naiveTsaSumLabel}: ${fmtCompositeNum(analysis.naiveTsaSum)} ${areaU}`,
        jointNotes.length > 0
          ? `• ${ct.hiddenContactExcludedLabel}:\n  ${jointNotes.join('\n  ')}`
          : `• ${ct.hiddenContactExcludedLabel}: 0 ${areaU}`,
        `• ${ct.externalSurfaceAreaLabel}: ${fmtCompositeNum(analysis.naiveTsaSum)} − ${fmtCompositeNum(
          analysis.excludedContactArea,
        )} = ${fmtCompositeNum(analysis.externalSurfaceArea)} ${areaU}`,
      ].join('\n'),
    },
    {
      stepNo: 7,
      title: titles[6],
      visualMode: 'final',
      highlightId: null,
      showDimensions: true,
      body: `${ct.totalVolumeLabel} = ${fmtCompositeNum(
        analysis.totalVolume,
      )} ${volU}\n${ct.externalSurfaceAreaLabel} = ${fmtCompositeNum(
        analysis.externalSurfaceArea,
      )} ${areaU}`,
    },
  ]
}

// =========================================================================
// BEST-EFFORT TEXT INTERPRETER FOR COMPOSITE QUESTIONS (HONEST & MANUAL FALLBACK)
// =========================================================================

export function interpretCompositeQuestionText(rawText) {
  const txt = String(rawText ?? '').trim().toLowerCase()
  if (!txt) {
    return {
      interpreted: false,
      components: null,
      message: 'Please type a composite solid question or add components manually.',
    }
  }

  const piMode = /3\.14/.test(txt) ? '3.14' : '22/7'
  const nums = (txt.match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite)

  // Match hemisphere + cylinder
  if (/hemisphere/.test(txt) && /cylinder/.test(txt)) {
    const r = nums.find((n) => n >= 1 && n <= 10) ?? 3
    const h = nums.find((n) => n !== r && n >= 1 && n <= 10) ?? 5
    const cyl = createBuilderComponent(SHAPES.CYLINDER, {
      dimensions: { r, h },
      color: COMPONENT_COLORS[0],
    })
    const hemi = snapComponentOnTop(
      createBuilderComponent(SHAPES.HEMISPHERE, {
        dimensions: { r },
        color: COMPONENT_COLORS[1],
      }),
      cyl,
    )
    return {
      interpreted: true,
      piMode,
      components: [cyl, hemi],
      message: `Suggested Hemisphere (r=${r}) on Cylinder (r=${r}, h=${h}). Please verify or edit manually.`,
    }
  }

  // Match cone + cylinder
  if (/cone/.test(txt) && /cylinder/.test(txt)) {
    const r = nums.find((n) => n >= 1 && n <= 10) ?? 3
    const rest = nums.filter((n) => n >= 1 && n <= 10)
    const hCyl = rest[1] ?? 5
    const hCone = rest[2] ?? 4
    const cyl = createBuilderComponent(SHAPES.CYLINDER, {
      dimensions: { r, h: hCyl },
      color: COMPONENT_COLORS[0],
    })
    const cone = snapComponentOnTop(
      createBuilderComponent(SHAPES.CONE, {
        dimensions: { r, h: hCone },
        color: COMPONENT_COLORS[1],
      }),
      cyl,
    )
    return {
      interpreted: true,
      piMode,
      components: [cyl, cone],
      message: `Suggested Cone (r=${r}, h=${hCone}) on Cylinder (r=${r}, h=${hCyl}). Please verify or edit manually.`,
    }
  }

  // Match two cubes / cuboids side by side
  if (/(?:two|2)\s+(?:cubes|cuboids)/.test(txt)) {
    const a = nums.find((n) => n >= 1 && n <= 10) ?? 4
    const c1 = createBuilderComponent(SHAPES.CUBE, {
      dimensions: { a },
      color: COMPONENT_COLORS[0],
    })
    const c2 = snapComponentSideBySide(
      createBuilderComponent(SHAPES.CUBE, {
        dimensions: { a },
        color: COMPONENT_COLORS[3],
      }),
      c1,
      'x',
    )
    return {
      interpreted: true,
      piMode,
      components: [c1, c2],
      message: `Suggested two Cube(a=${a}) components joined side-by-side. Verify and adjust dimensions manually.`,
    }
  }

  return {
    interpreted: false,
    piMode,
    components: null,
    message:
      'Automatic interpretation is unsure for this custom phrasing — please build the model directly using the 3D Shape Library and Smart Snap tools below.',
  }
}

// =========================================================================
// LOCAL DEVICE STORAGE FOR SAVING, REOPENING & DUPLICATING COMPOSITE MODELS
// =========================================================================

function getCompositeStorageKey(profileId) {
  const safeProf = profileId || loadActiveProfileId() || 'teacher_demo'
  return `${COMPOSITE_STORAGE_PREFIX}_${safeProf}`
}

export function loadSavedCompositeProblems(profileId = null) {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(getCompositeStorageKey(profileId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function persistSavedCompositeProblems(list, profileId = null) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      getCompositeStorageKey(profileId),
      JSON.stringify((list ?? []).slice(0, 30)),
    )
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function saveCompositeProblemItem(item, profileId = null) {
  const existing = loadSavedCompositeProblems(profileId)
  const record = {
    id: item.id || `comp_prob_${Date.now().toString(36)}`,
    title: String(item.title || 'Composite 3D Problem').trim(),
    questionText: String(item.questionText || ''),
    teachingNotes: String(item.teachingNotes || ''),
    piMode: item.piMode === '3.14' ? '3.14' : '22/7',
    components: Array.isArray(item.components) ? item.components : [],
    updatedAt: Date.now(),
  }
  const filtered = existing.filter((x) => x.id !== record.id)
  const next = [record, ...filtered].slice(0, 30)
  persistSavedCompositeProblems(next, profileId)
  return { record, list: next }
}

export function duplicateCompositeProblemItem(problemId, profileId = null) {
  const existing = loadSavedCompositeProblems(profileId)
  const source = existing.find((x) => x.id === problemId)
  if (!source) return existing
  const copy = {
    ...source,
    id: `comp_prob_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    title: `${source.title} (Copy)`,
    components: source.components.map((c) => ({
      ...c,
      id: `${c.id}_copy_${Math.random().toString(36).slice(2, 5)}`,
    })),
    updatedAt: Date.now(),
  }
  const next = [copy, ...existing].slice(0, 30)
  persistSavedCompositeProblems(next, profileId)
  return next
}

export function deleteCompositeProblemItem(problemId, profileId = null) {
  const existing = loadSavedCompositeProblems(profileId)
  const next = existing.filter((x) => x.id !== problemId)
  persistSavedCompositeProblems(next, profileId)
  return next
}
