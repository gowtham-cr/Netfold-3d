import * as THREE from 'three'
import { validateCubeNet } from './mathEngine.js'

/**
 * Clamp a folding percentage into the valid [0, 100] range.
 *
 * @param {number} foldProgress - Requested fold progress percentage.
 * @returns {number} Clamped fold progress in [0, 100].
 */
export function clampFoldProgress(foldProgress) {
  if (typeof foldProgress !== 'number' || !Number.isFinite(foldProgress)) {
    return 0
  }
  return Math.min(100, Math.max(0, foldProgress))
}

/**
 * Convert folding percentage [0, 100] to hinge angle in radians [0, π/2].
 *
 * @param {number} foldProgress - Fold percentage between 0 and 100.
 * @returns {number} Fold angle in radians.
 */
export function foldProgressToRadians(foldProgress) {
  return (clampFoldProgress(foldProgress) / 100) * (Math.PI / 2)
}

/**
 * Compute numerically stable sin(u) / u using Taylor expansion near zero.
 *
 * @param {number} u
 * @returns {number}
 */
function sinc(u) {
  if (Math.abs(u) < 1e-5) {
    return 1 - (u * u) / 6
  }
  return Math.sin(u) / u
}

/**
 * Educational face metadata for the 6 faces of cube and cuboid nets.
 * Each entry defines distinct colors, labels, and outer-surface texture orientation
 * so labels remain upright both flat (0%) and on the folded exterior (100%).
 *
 * @type {ReadonlyArray<{
 *   id: 'bottom'|'front'|'back'|'top'|'left'|'right',
 *   label: string,
 *   badge: string,
 *   color: string,
 *   edgeColor: string,
 *   outerTextureRotation: number
 * }>}
 */
export const CUBE_FACE_METADATA = Object.freeze([
  {
    id: 'bottom',
    label: 'BASE',
    badge: '1',
    color: '#3b82f6',
    edgeColor: '#1d4ed8',
    outerTextureRotation: 0,
  },
  {
    id: 'front',
    label: 'FRONT',
    badge: '2',
    color: '#10b981',
    edgeColor: '#047857',
    outerTextureRotation: 0,
  },
  {
    id: 'back',
    label: 'BACK',
    badge: '3',
    color: '#f59e0b',
    edgeColor: '#b45309',
    outerTextureRotation: Math.PI,
  },
  {
    id: 'top',
    label: 'TOP',
    badge: '4',
    color: '#f43f5e',
    edgeColor: '#be123c',
    outerTextureRotation: 0,
  },
  {
    id: 'left',
    label: 'LEFT',
    badge: '5',
    color: '#8b5cf6',
    edgeColor: '#6d28d9',
    outerTextureRotation: Math.PI / 2,
  },
  {
    id: 'right',
    label: 'RIGHT',
    badge: '6',
    color: '#06b6d4',
    edgeColor: '#0e7490',
    outerTextureRotation: -Math.PI / 2,
  },
])

/**
 * Shared educational face metadata for cuboid nets.
 */
export const CUBOID_FACE_METADATA = CUBE_FACE_METADATA

/**
 * Educational part metadata for the 3 faces of the cylinder net.
 */
export const CYLINDER_PART_METADATA = Object.freeze({
  bottom: {
    id: 'bottom',
    label: 'BASE',
    badge: 'πr²',
    color: '#3b82f6',
    edgeColor: '#1d4ed8',
  },
  lateral: {
    id: 'lateral',
    label: 'CURVED WALL',
    badge: '2πrh',
    color: '#10b981',
    edgeColor: '#047857',
  },
  top: {
    id: 'top',
    label: 'TOP',
    badge: 'πr²',
    color: '#f43f5e',
    edgeColor: '#be123c',
  },
})

/**
 * Educational part metadata for the cone net (circular base + sector lateral surface).
 */
export const CONE_PART_METADATA = Object.freeze({
  bottom: {
    id: 'bottom',
    label: 'BASE',
    badge: 'πr²',
    color: '#3b82f6',
    edgeColor: '#1d4ed8',
  },
  lateral: {
    id: 'lateral',
    label: 'CURVED SURFACE',
    badge: 'πrl',
    color: '#10b981',
    edgeColor: '#047857',
  },
})

/**
 * Educational face metadata for the 5 faces of the square pyramid net.
 */
export const PYRAMID_FACE_METADATA = Object.freeze([
  {
    id: 'bottom',
    label: 'BASE',
    badge: 'a²',
    color: '#3b82f6',
    edgeColor: '#1d4ed8',
  },
  {
    id: 'front',
    label: 'FRONT',
    badge: '½as',
    color: '#10b981',
    edgeColor: '#047857',
    rotY: 0,
  },
  {
    id: 'right',
    label: 'RIGHT',
    badge: '½as',
    color: '#06b6d4',
    edgeColor: '#0e7490',
    rotY: Math.PI / 2,
  },
  {
    id: 'back',
    label: 'BACK',
    badge: '½as',
    color: '#f59e0b',
    edgeColor: '#b45309',
    rotY: Math.PI,
  },
  {
    id: 'left',
    label: 'LEFT',
    badge: '½as',
    color: '#8b5cf6',
    edgeColor: '#6d28d9',
    rotY: -Math.PI / 2,
  },
])

/**
 * Educational metadata for the sphere surface.
 */
export const SPHERE_PART_METADATA = Object.freeze({
  surface: {
    id: 'surface',
    label: 'SURFACE',
    badge: '4πr²',
    color: '#8b5cf6',
    edgeColor: '#6d28d9',
  },
})

function sanitizePositive(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback
}

/**
 * Computes panel sizes, thickness, and hinge layout parameters for a cuboid (l × b × h).
 *
 * @param {number} [length=4] - Length `l` along X.
 * @param {number} [breadth=3] - Breadth `b` along Z.
 * @param {number} [height=2] - Height `h` along Y when folded.
 */
export function getCuboidNetLayout(length = 4, breadth = 3, height = 2) {
  const l = sanitizePositive(length, 4)
  const b = sanitizePositive(breadth, 3)
  const h = sanitizePositive(height, 2)
  const thickness = Math.max(0.02, Math.min(l, b, h) * 0.015)

  return {
    l,
    b,
    h,
    thickness,
    rootPosition: [0, thickness, b * 0.25],
    faces: {
      bottom: { size: [l, thickness, b], width: l, depth: b },
      front: { size: [l, thickness, h], width: l, depth: h },
      back: { size: [l, thickness, h], width: l, depth: h },
      top: { size: [l, thickness, b], width: l, depth: b },
      left: { size: [h, thickness, b], width: h, depth: b },
      right: { size: [h, thickness, b], width: h, depth: b },
    },
    hinges: {
      front: {
        position: [0, 0, b / 2],
        axis: 'x',
        sign: -1,
        pinLength: l,
        panelOffset: [0, -thickness / 2, h / 2],
      },
      back: {
        position: [0, 0, -b / 2],
        axis: 'x',
        sign: 1,
        pinLength: l,
        panelOffset: [0, -thickness / 2, -h / 2],
      },
      top: {
        position: [0, 0, -h],
        axis: 'x',
        sign: 1,
        pinLength: l,
        panelOffset: [0, -thickness / 2, -b / 2],
      },
      left: {
        position: [-l / 2, 0, 0],
        axis: 'z',
        sign: -1,
        pinLength: b,
        panelOffset: [-h / 2, -thickness / 2, 0],
      },
      right: {
        position: [l / 2, 0, 0],
        axis: 'z',
        sign: 1,
        pinLength: b,
        panelOffset: [h / 2, -thickness / 2, 0],
      },
    },
  }
}

/**
 * Computes the panel thickness and hinge layout parameters for a cube of edge `a`.
 *
 * @param {number} [edgeLength=3] - Cube side length `a`.
 */
export function getCubeNetLayout(edgeLength = 3) {
  const a = sanitizePositive(edgeLength, 3)
  const cuboidLayout = getCuboidNetLayout(a, a, a)

  return {
    a,
    thickness: cuboidLayout.thickness,
    rootPosition: cuboidLayout.rootPosition,
    hinges: cuboidLayout.hinges,
  }
}

/**
 * Evaluates world-space inner face centers, normals, and 4 inner corners
 * for all 6 faces of a cuboid (or cube when l = b = h) at `foldProgress`.
 *
 * @param {{ l: number, b: number, h: number }} dimensions
 * @param {number} foldProgress - Fold percentage [0, 100].
 * @returns {Record<'bottom'|'front'|'back'|'top'|'left'|'right', {
 *   center: THREE.Vector3,
 *   innerNormal: THREE.Vector3,
 *   outerNormal: THREE.Vector3,
 *   corners: THREE.Vector3[],
 *   width: number,
 *   depth: number
 * }>}
 */
export function evaluateCuboidNetState(dimensions, foldProgress) {
  const layout = getCuboidNetLayout(
    dimensions?.l,
    dimensions?.b,
    dimensions?.h,
  )
  const angle = foldProgressToRadians(foldProgress)
  const { thickness, faces, hinges } = layout

  const root = new THREE.Group()
  root.position.set(...layout.rootPosition)

  const createFaceSample = (parent, panelOffset) => {
    const faceNode = new THREE.Group()
    faceNode.position.set(...panelOffset)
    parent.add(faceNode)
    return faceNode
  }

  const bottomNode = createFaceSample(root, [0, -thickness / 2, 0])

  const frontHinge = new THREE.Group()
  frontHinge.position.set(...hinges.front.position)
  frontHinge.rotation.x = hinges.front.sign * angle
  root.add(frontHinge)
  const frontNode = createFaceSample(frontHinge, hinges.front.panelOffset)

  const backHinge = new THREE.Group()
  backHinge.position.set(...hinges.back.position)
  backHinge.rotation.x = hinges.back.sign * angle
  root.add(backHinge)
  const backNode = createFaceSample(backHinge, hinges.back.panelOffset)

  const topHinge = new THREE.Group()
  topHinge.position.set(...hinges.top.position)
  topHinge.rotation.x = hinges.top.sign * angle
  backHinge.add(topHinge)
  const topNode = createFaceSample(topHinge, hinges.top.panelOffset)

  const leftHinge = new THREE.Group()
  leftHinge.position.set(...hinges.left.position)
  leftHinge.rotation.z = hinges.left.sign * angle
  root.add(leftHinge)
  const leftNode = createFaceSample(leftHinge, hinges.left.panelOffset)

  const rightHinge = new THREE.Group()
  rightHinge.position.set(...hinges.right.position)
  rightHinge.rotation.z = hinges.right.sign * angle
  root.add(rightHinge)
  const rightNode = createFaceSample(rightHinge, hinges.right.panelOffset)

  root.updateMatrixWorld(true)

  const sampleNode = (node, { width, depth }) => {
    const innerLocalY = thickness / 2
    const halfW = width / 2
    const halfD = depth / 2

    const center = new THREE.Vector3(0, innerLocalY, 0).applyMatrix4(
      node.matrixWorld,
    )

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(node.matrixWorld)
    const innerNormal = new THREE.Vector3(0, 1, 0)
      .applyMatrix3(normalMatrix)
      .normalize()
    const outerNormal = innerNormal.clone().negate()

    const corners = [
      new THREE.Vector3(-halfW, innerLocalY, -halfD),
      new THREE.Vector3(halfW, innerLocalY, -halfD),
      new THREE.Vector3(halfW, innerLocalY, halfD),
      new THREE.Vector3(-halfW, innerLocalY, halfD),
    ].map((pt) => pt.applyMatrix4(node.matrixWorld))

    return { center, innerNormal, outerNormal, corners, width, depth }
  }

  return {
    bottom: sampleNode(bottomNode, faces.bottom),
    front: sampleNode(frontNode, faces.front),
    back: sampleNode(backNode, faces.back),
    top: sampleNode(topNode, faces.top),
    left: sampleNode(leftNode, faces.left),
    right: sampleNode(rightNode, faces.right),
  }
}

/**
 * Evaluates world-space inner face centers, normals, and 4 inner corners
 * for all 6 faces of the cube net at a given `edgeLength` and `foldProgress`.
 *
 * @param {number} edgeLength - Cube side length `a`.
 * @param {number} foldProgress - Fold percentage [0, 100].
 */
export function evaluateCubeNetState(edgeLength, foldProgress) {
  const a = sanitizePositive(edgeLength, 3)
  return evaluateCuboidNetState({ l: a, b: a, h: a }, foldProgress)
}

/**
 * Computes cylinder net layout parameters (radius `r`, height `h`, circumference `2πr`).
 *
 * @param {number} [radius=1.5]
 * @param {number} [height=4]
 */
export function getCylinderNetLayout(radius = 1.5, height = 4) {
  const r = sanitizePositive(radius, 1.5)
  const h = sanitizePositive(height, 4)
  const circumference = 2 * Math.PI * r
  const thickness = Math.max(0.02, Math.min(r, h) * 0.018)

  return {
    r,
    h,
    circumference,
    thickness,
    rootPosition: [0, thickness, (r + h / 2) * 0.45],
    hinges: {
      wall: {
        position: [0, 0, -r],
        axis: 'x',
        sign: 1,
      },
      topCap: {
        position: [0, 0, -h],
        axis: 'x',
        sign: 1,
        capOffset: [0, -thickness / 2, -r],
      },
    },
  }
}

/**
 * Evaluates a point and its inner unit normal on the curved lateral wall
 * inside the wall hinge's local frame (before the wall hinge pitch).
 *
 * @param {number} s - Arc-length parameter in [-πr, +πr].
 * @param {number} v - Height parameter along rectangle in [0, h].
 * @param {number} r - Cylinder radius.
 * @param {number} foldProgress - Fold percentage [0, 100].
 * @returns {{ position: THREE.Vector3, innerNormal: THREE.Vector3 }}
 */
export function sampleCylinderWallLocal(s, v, r, foldProgress) {
  const t = clampFoldProgress(foldProgress) / 100
  const theta = (s / r) * t

  const x = s * sinc(theta)
  const y = s * Math.sin(theta / 2) * sinc(theta / 2)
  const z = -v

  const innerNormal = new THREE.Vector3(
    -Math.sin(theta),
    Math.cos(theta),
    0,
  ).normalize()

  return {
    position: new THREE.Vector3(x, y, z),
    innerNormal,
  }
}

/**
 * Evaluates world-space states of the cylinder's bottom cap, top cap,
 * and key curved lateral wall sample points at `foldProgress` [0, 100].
 *
 * @param {{ r: number, h: number }} dimensions
 * @param {number} foldProgress
 */
export function evaluateCylinderNetState(dimensions, foldProgress) {
  const layout = getCylinderNetLayout(dimensions?.r, dimensions?.h)
  const { r, h, circumference, thickness, hinges } = layout
  const angle = foldProgressToRadians(foldProgress)

  const root = new THREE.Group()
  root.position.set(...layout.rootPosition)

  const bottomNode = new THREE.Group()
  bottomNode.position.set(0, -thickness / 2, 0)
  root.add(bottomNode)

  const wallHinge = new THREE.Group()
  wallHinge.position.set(...hinges.wall.position)
  wallHinge.rotation.x = hinges.wall.sign * angle
  root.add(wallHinge)

  const topHinge = new THREE.Group()
  topHinge.position.set(...hinges.topCap.position)
  topHinge.rotation.x = hinges.topCap.sign * angle
  wallHinge.add(topHinge)

  const topNode = new THREE.Group()
  topNode.position.set(...hinges.topCap.capOffset)
  topHinge.add(topNode)

  root.updateMatrixWorld(true)

  const sampleCap = (node) => {
    const innerLocalY = thickness / 2
    const center = new THREE.Vector3(0, innerLocalY, 0).applyMatrix4(
      node.matrixWorld,
    )
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(node.matrixWorld)
    const innerNormal = new THREE.Vector3(0, 1, 0)
      .applyMatrix3(normalMatrix)
      .normalize()
    const outerNormal = innerNormal.clone().negate()
    return { center, innerNormal, outerNormal, radius: r }
  }

  const wallMatrix = wallHinge.matrixWorld
  const wallNormalMatrix = new THREE.Matrix3().getNormalMatrix(wallMatrix)

  const sampleWallWorld = (s, v) => {
    const local = sampleCylinderWallLocal(s, v, r, foldProgress)
    return {
      position: local.position.clone().applyMatrix4(wallMatrix),
      innerNormal: local.innerNormal
        .clone()
        .applyMatrix3(wallNormalMatrix)
        .normalize(),
    }
  }

  const halfW = circumference / 2
  const arcSamples = Array.from({ length: 17 }, (_, index) => {
    const s = -halfW + (index / 16) * circumference
    return {
      s,
      bottom: sampleWallWorld(s, 0),
      top: sampleWallWorld(s, h),
    }
  })

  return {
    layout,
    bottomCap: sampleCap(bottomNode),
    topCap: sampleCap(topNode),
    wall: {
      leftBottom: sampleWallWorld(-halfW, 0),
      centerBottom: sampleWallWorld(0, 0),
      rightBottom: sampleWallWorld(halfW, 0),
      leftTop: sampleWallWorld(-halfW, h),
      centerTop: sampleWallWorld(0, h),
      rightTop: sampleWallWorld(halfW, h),
      arcSamples,
    },
  }
}

/**
 * Allocates pre-sized BufferGeometries for the deforming cylinder lateral wall
 * and its dynamic perimeter border lines (zero allocations during animation).
 *
 * @param {number} [segments=64]
 * @returns {{ wallGeometry: THREE.BufferGeometry, borderGeometry: THREE.BufferGeometry, segments: number }}
 */
export function createCylinderWallGeometries(segments = 64) {
  const cols = segments + 1
  const innerCount = 2 * cols
  const outerCount = 2 * cols
  const frontRimCount = 2 * cols
  const backRimCount = 2 * cols
  const sideSeamCount = 8 // 4 for left seam + 4 for right seam
  const totalVertices =
    innerCount + outerCount + frontRimCount + backRimCount + sideSeamCount

  const positions = new Float32Array(totalVertices * 3)
  const normals = new Float32Array(totalVertices * 3)
  const uvs = new Float32Array(totalVertices * 2)
  const indices = []

  // UVs for inner surface (Group 0)
  for (let j = 0; j < 2; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const idx = j * cols + i
      uvs[idx * 2] = i / segments
      uvs[idx * 2 + 1] = j
    }
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i
    const b = i + 1
    const c = cols + i + 1
    const d = cols + i
    indices.push(a, b, c, a, c, d)
  }
  const innerIndexCount = indices.length

  // UVs & indices for outer surface (Group 1, mirrored U so exterior text reads upright)
  const outerOffset = innerCount
  for (let j = 0; j < 2; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const idx = outerOffset + j * cols + i
      uvs[idx * 2] = 1 - i / segments
      uvs[idx * 2 + 1] = j
    }
  }
  const outerIndexStart = indices.length
  for (let i = 0; i < segments; i += 1) {
    const a = outerOffset + i
    const b = outerOffset + i + 1
    const c = outerOffset + cols + i + 1
    const d = outerOffset + cols + i
    indices.push(a, c, b, a, d, c)
  }
  const outerIndexCount = indices.length - outerIndexStart

  // Rim strips & vertical seams (Group 2)
  const rimIndexStart = indices.length
  const frontRimOffset = outerOffset + outerCount
  for (let i = 0; i < segments; i += 1) {
    const a = frontRimOffset + i
    const b = frontRimOffset + i + 1
    const c = frontRimOffset + cols + i + 1
    const d = frontRimOffset + cols + i
    indices.push(a, b, c, a, c, d)
  }

  const backRimOffset = frontRimOffset + frontRimCount
  for (let i = 0; i < segments; i += 1) {
    const a = backRimOffset + i
    const b = backRimOffset + i + 1
    const c = backRimOffset + cols + i + 1
    const d = backRimOffset + cols + i
    indices.push(a, b, c, a, c, d)
  }

  const leftSeamOffset = backRimOffset + backRimCount
  indices.push(
    leftSeamOffset + 0,
    leftSeamOffset + 3,
    leftSeamOffset + 2,
    leftSeamOffset + 0,
    leftSeamOffset + 2,
    leftSeamOffset + 1,
  )

  const rightSeamOffset = leftSeamOffset + 4
  indices.push(
    rightSeamOffset + 0,
    rightSeamOffset + 1,
    rightSeamOffset + 2,
    rightSeamOffset + 0,
    rightSeamOffset + 2,
    rightSeamOffset + 3,
  )
  const rimIndexCount = indices.length - rimIndexStart

  const wallGeometry = new THREE.BufferGeometry()
  wallGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  wallGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  wallGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  wallGeometry.setIndex(indices)
  wallGeometry.addGroup(0, innerIndexCount, 0)
  wallGeometry.addGroup(outerIndexStart, outerIndexCount, 1)
  wallGeometry.addGroup(rimIndexStart, rimIndexCount, 2)

  // LineSegments border: bottom arc (inner+outer), top arc (inner+outer), 2 seam verticals (inner+outer)
  const borderSegmentsCount = segments * 4 + 4
  const borderPositions = new Float32Array(borderSegmentsCount * 2 * 3)
  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(borderPositions, 3),
  )

  return { wallGeometry, borderGeometry, segments }
}

/**
 * Updates vertex positions and analytic normals of the deforming cylinder lateral wall
 * and its outline border lines for a given `foldProgress` [0, 100].
 *
 * @param {THREE.BufferGeometry} wallGeometry
 * @param {THREE.BufferGeometry} borderGeometry
 * @param {number} r
 * @param {number} h
 * @param {number} thickness
 * @param {number} foldProgress
 * @param {number} [segments=64]
 */
export function updateCylinderWallGeometries(
  wallGeometry,
  borderGeometry,
  r,
  h,
  thickness,
  foldProgress,
  segments = 64,
) {
  const cols = segments + 1
  const circumference = 2 * Math.PI * r
  const halfW = circumference / 2
  const t = clampFoldProgress(foldProgress) / 100

  const posAttr = wallGeometry.getAttribute('position')
  const normAttr = wallGeometry.getAttribute('normal')
  const pos = posAttr.array
  const norm = normAttr.array

  const outerOffset = 2 * cols
  const frontRimOffset = outerOffset + 2 * cols
  const backRimOffset = frontRimOffset + 2 * cols
  const leftSeamOffset = backRimOffset + 2 * cols
  const rightSeamOffset = leftSeamOffset + 4

  const setVertex = (idx, x, y, z, nx, ny, nz) => {
    const p3 = idx * 3
    pos[p3] = x
    pos[p3 + 1] = y
    pos[p3 + 2] = z
    norm[p3] = nx
    norm[p3 + 1] = ny
    norm[p3 + 2] = nz
  }

  for (let i = 0; i < cols; i += 1) {
    const s = -halfW + (i / segments) * circumference
    const theta = (s / r) * t
    const xIn = s * sinc(theta)
    const yIn = s * Math.sin(theta / 2) * sinc(theta / 2)
    const nx = -Math.sin(theta)
    const ny = Math.cos(theta)

    const xOut = xIn - thickness * nx
    const yOut = yIn - thickness * ny

    // Inner surface (v=0 and v=h)
    setVertex(i, xIn, yIn, 0, nx, ny, 0)
    setVertex(cols + i, xIn, yIn, -h, nx, ny, 0)

    // Outer surface (v=0 and v=h)
    setVertex(outerOffset + i, xOut, yOut, 0, -nx, -ny, 0)
    setVertex(outerOffset + cols + i, xOut, yOut, -h, -nx, -ny, 0)

    // Front rim (v=0, normal +Z)
    setVertex(frontRimOffset + i, xOut, yOut, 0, 0, 0, 1)
    setVertex(frontRimOffset + cols + i, xIn, yIn, 0, 0, 0, 1)

    // Back rim (v=h, normal -Z)
    setVertex(backRimOffset + i, xIn, yIn, -h, 0, 0, -1)
    setVertex(backRimOffset + cols + i, xOut, yOut, -h, 0, 0, -1)

    // Side seams at endpoints
    if (i === 0) {
      const lx = -Math.cos(theta)
      const ly = -Math.sin(theta)
      setVertex(leftSeamOffset + 0, xIn, yIn, 0, lx, ly, 0)
      setVertex(leftSeamOffset + 1, xOut, yOut, 0, lx, ly, 0)
      setVertex(leftSeamOffset + 2, xOut, yOut, -h, lx, ly, 0)
      setVertex(leftSeamOffset + 3, xIn, yIn, -h, lx, ly, 0)
    }
    if (i === segments) {
      const rx = Math.cos(theta)
      const ry = Math.sin(theta)
      setVertex(rightSeamOffset + 0, xIn, yIn, 0, rx, ry, 0)
      setVertex(rightSeamOffset + 1, xOut, yOut, 0, rx, ry, 0)
      setVertex(rightSeamOffset + 2, xOut, yOut, -h, rx, ry, 0)
      setVertex(rightSeamOffset + 3, xIn, yIn, -h, rx, ry, 0)
    }
  }

  posAttr.needsUpdate = true
  normAttr.needsUpdate = true
  wallGeometry.computeBoundingSphere()

  if (borderGeometry) {
    const borderAttr = borderGeometry.getAttribute('position')
    const bArr = borderAttr.array
    let ptr = 0
    const eps = 0.003

    const pushSeg = (x1, y1, z1, x2, y2, z2) => {
      bArr[ptr++] = x1
      bArr[ptr++] = y1
      bArr[ptr++] = z1
      bArr[ptr++] = x2
      bArr[ptr++] = y2
      bArr[ptr++] = z2
    }

    for (let i = 0; i < segments; i += 1) {
      const inA = i * 3
      const inB = (i + 1) * 3
      const outA = (outerOffset + i) * 3
      const outB = (outerOffset + i + 1) * 3

      const nxA = norm[inA]
      const nyA = norm[inA + 1]
      const nxB = norm[inB]
      const nyB = norm[inB + 1]

      // Inner & outer bottom arc (v=0)
      pushSeg(
        pos[inA] + nxA * eps,
        pos[inA + 1] + nyA * eps,
        eps,
        pos[inB] + nxB * eps,
        pos[inB + 1] + nyB * eps,
        eps,
      )
      pushSeg(
        pos[outA] - nxA * eps,
        pos[outA + 1] - nyA * eps,
        eps,
        pos[outB] - nxB * eps,
        pos[outB + 1] - nyB * eps,
        eps,
      )

      // Inner & outer top arc (v=h)
      pushSeg(
        pos[inA] + nxA * eps,
        pos[inA + 1] + nyA * eps,
        -h - eps,
        pos[inB] + nxB * eps,
        pos[inB + 1] + nyB * eps,
        -h - eps,
      )
      pushSeg(
        pos[outA] - nxA * eps,
        pos[outA + 1] - nyA * eps,
        -h - eps,
        pos[outB] - nxB * eps,
        pos[outB + 1] - nyB * eps,
        -h - eps,
      )
    }

    // Left and right seam vertical lines (inner & outer)
    for (const colIdx of [0, segments]) {
      const inIdx = colIdx * 3
      const outIdx = (outerOffset + colIdx) * 3
      const nx = norm[inIdx]
      const ny = norm[inIdx + 1]

      pushSeg(
        pos[inIdx] + nx * eps,
        pos[inIdx + 1] + ny * eps,
        0,
        pos[inIdx] + nx * eps,
        pos[inIdx + 1] + ny * eps,
        -h,
      )
      pushSeg(
        pos[outIdx] - nx * eps,
        pos[outIdx + 1] - ny * eps,
        0,
        pos[outIdx] - nx * eps,
        pos[outIdx + 1] - ny * eps,
        -h,
      )
    }

    borderAttr.needsUpdate = true
    borderGeometry.computeBoundingSphere()
  }
}

/**
 * Computes layout and exact closed dihedral angle for a square pyramid net
 * (`base side = a`, `vertical height = h`, `slant height s = √(h² + (a/2)²)`).
 *
 * @param {number} [baseSide=6]
 * @param {number} [height=4]
 */
export function getSquarePyramidNetLayout(baseSide = 6, height = 4) {
  const a = sanitizePositive(baseSide, 6)
  const h = sanitizePositive(height, 4)
  const slantHeight = Math.hypot(h, a / 2)
  const thickness = Math.max(0.02, Math.min(a, h) * 0.015)
  // Angle from flat plane (0) around hinge to apex (0, h, 0)
  const maxFoldAngle = Math.atan2(h, -a / 2)

  return {
    a,
    h,
    slantHeight,
    thickness,
    maxFoldAngle,
    rootPosition: [0, thickness, 0],
    hingeDistance: a / 2,
  }
}

/**
 * Creates a closed thin triangular prism BufferGeometry pointing along +Z
 * with inner surface at y = 0, outer surface at y = -thickness, base along [-a/2, +a/2],
 * and apex at (0, 0, slantHeight).
 *
 * @param {number} baseWidth
 * @param {number} slantHeight
 * @param {number} thickness
 * @returns {THREE.BufferGeometry}
 */
export function createTrianglePrismGeometry(
  baseWidth,
  slantHeight,
  thickness,
) {
  const half = baseWidth / 2
  const positions = new Float32Array([
    // Group 0: Inner triangle (y = 0, normal +Y)
    -half, 0, 0,
    0, 0, slantHeight,
    half, 0, 0,
    // Group 1: Outer triangle (y = -thickness, normal -Y)
    -half, -thickness, 0,
    half, -thickness, 0,
    0, -thickness, slantHeight,
    // Group 2: Base edge quad (z = 0, normal -Z)
    -half, -thickness, 0,
    -half, 0, 0,
    half, 0, 0,
    -half, -thickness, 0,
    half, 0, 0,
    half, -thickness, 0,
    // Group 2: Left slant edge quad
    -half, 0, 0,
    -half, -thickness, 0,
    0, -thickness, slantHeight,
    -half, 0, 0,
    0, -thickness, slantHeight,
    0, 0, slantHeight,
    // Group 2: Right slant edge quad
    half, -thickness, 0,
    half, 0, 0,
    0, 0, slantHeight,
    half, -thickness, 0,
    0, 0, slantHeight,
    0, -thickness, slantHeight,
  ])

  const uvs = new Float32Array([
    // Inner face
    0, 0,
    0.5, 1,
    1, 0,
    // Outer face
    0, 0,
    1, 0,
    0.5, 1,
    // Side rims (solid edge color)
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
  ])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.addGroup(0, 3, 0)
  geometry.addGroup(3, 3, 1)
  geometry.addGroup(6, 18, 2)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/**
 * Evaluates world-space positions, normals, base corners, and apex coordinates
 * for all 5 faces of the square pyramid net at `foldProgress` [0, 100].
 *
 * @param {{ a: number, h: number }} dimensions
 * @param {number} foldProgress
 */
export function evaluateSquarePyramidNetState(dimensions, foldProgress) {
  const layout = getSquarePyramidNetLayout(dimensions?.a, dimensions?.h)
  const { a, slantHeight, thickness, maxFoldAngle, rootPosition } = layout
  const angle = (clampFoldProgress(foldProgress) / 100) * maxFoldAngle
  const half = a / 2

  const root = new THREE.Group()
  root.position.set(...rootPosition)

  const baseNode = new THREE.Group()
  baseNode.position.set(0, -thickness / 2, 0)
  root.add(baseNode)

  const sides = {}
  const sideConfigs = [
    { id: 'front', rotY: 0 },
    { id: 'right', rotY: Math.PI / 2 },
    { id: 'back', rotY: Math.PI },
    { id: 'left', rotY: -Math.PI / 2 },
  ]

  for (const side of sideConfigs) {
    const orientGroup = new THREE.Group()
    orientGroup.rotation.y = side.rotY
    root.add(orientGroup)

    const hingeGroup = new THREE.Group()
    hingeGroup.position.set(0, 0, half)
    hingeGroup.rotation.x = -angle
    orientGroup.add(hingeGroup)

    sides[side.id] = hingeGroup
  }

  root.updateMatrixWorld(true)

  const baseCorners = [
    new THREE.Vector3(-half, thickness / 2, -half),
    new THREE.Vector3(half, thickness / 2, -half),
    new THREE.Vector3(half, thickness / 2, half),
    new THREE.Vector3(-half, thickness / 2, half),
  ].map((pt) => pt.applyMatrix4(baseNode.matrixWorld))

  const baseNormal = new THREE.Vector3(0, 1, 0)
    .applyMatrix3(new THREE.Matrix3().getNormalMatrix(baseNode.matrixWorld))
    .normalize()

  const triangleStates = {}
  for (const side of sideConfigs) {
    const node = sides[side.id]
    const nMat = new THREE.Matrix3().getNormalMatrix(node.matrixWorld)
    const innerNormal = new THREE.Vector3(0, 1, 0).applyMatrix3(nMat).normalize()
    triangleStates[side.id] = {
      innerNormal,
      outerNormal: innerNormal.clone().negate(),
      baseLeft: new THREE.Vector3(-half, 0, 0).applyMatrix4(node.matrixWorld),
      baseRight: new THREE.Vector3(half, 0, 0).applyMatrix4(node.matrixWorld),
      apex: new THREE.Vector3(0, 0, slantHeight).applyMatrix4(node.matrixWorld),
    }
  }

  return {
    layout,
    bottom: {
      center: new THREE.Vector3(0, thickness / 2, 0).applyMatrix4(
        baseNode.matrixWorld,
      ),
      innerNormal: baseNormal,
      outerNormal: baseNormal.clone().negate(),
      corners: baseCorners,
    },
    ...triangleStates,
  }
}

/**
 * Computes cone net layout parameters (`radius = r`, `height = h`, `slantHeight l = √(r² + h²)`).
 *
 * @param {number} [radius=3]
 * @param {number} [height=4]
 */
export function getConeNetLayout(radius = 3, height = 4) {
  const r = sanitizePositive(radius, 3)
  const h = sanitizePositive(height, 4)
  const slantHeight = Math.hypot(r, h)
  const sectorAngle = (2 * Math.PI * r) / slantHeight
  const thickness = Math.max(0.02, Math.min(r, h) * 0.015)

  return {
    r,
    h,
    slantHeight,
    sectorAngle,
    thickness,
    rootPosition: [0, thickness, (r + slantHeight) * 0.3],
    rimAnchor: [0, 0, -r],
  }
}

/**
 * Evaluates a point and outward unit normal on the curving cone sector
 * in the cone root frame (where base circle sits centered at (0, 0, 0) and
 * sector rim touches at (0, 0, -r)).
 *
 * @param {number} uFrac - Radial fraction from apex (0) to rim (1).
 * @param {number} p - Angular fraction across sector [-1, +1].
 * @param {number} r - Cone base radius.
 * @param {number} h - Cone vertical height.
 * @param {number} foldProgress - Fold percentage [0, 100].
 * @returns {{ position: THREE.Vector3, outwardNormal: THREE.Vector3, coneAxisWorld: THREE.Vector3 }}
 */
export function sampleConeSectorPoint(uFrac, p, r, h, foldProgress) {
  const l = Math.hypot(r, h)
  const phiNet = (2 * Math.PI * r) / l
  const t = clampFoldProgress(foldProgress) / 100

  const psiSpan = phiNet + t * (2 * Math.PI - phiNet)
  const rho = (2 * Math.PI * r) / psiSpan
  const sinB = Math.min(1, rho / l)
  const cosB = Math.sqrt(Math.max(0, 1 - sinB * sinB))
  const beta = Math.atan2(sinB, cosB)
  const betaEnd = Math.atan2(r, h)

  const alpha = -(Math.PI / 2 + beta)
  const pitch = t * (Math.PI / 2 + betaEnd)
  const totalRot = alpha + pitch

  const u = uFrac * l
  const psi = p * (psiSpan / 2)

  // Point in cone-axis coords relative to M_c = (0, -l*cosB, -l*sinB)
  const xc = u * sinB * Math.sin(psi)
  const dyc = (l - u) * cosB
  const dzc = l * sinB - u * sinB * Math.cos(psi)

  const cosR = Math.cos(totalRot)
  const sinR = Math.sin(totalRot)

  const yw = dyc * cosR - dzc * sinR
  const zw = -r + dyc * sinR + dzc * cosR

  // Outward normal in cone-axis coords: (cosB * sin(psi), +sinB, -cosB * cos(psi))
  const nxc = cosB * Math.sin(psi)
  const nyc = sinB
  const nzc = -cosB * Math.cos(psi)
  const nyw = nyc * cosR - nzc * sinR
  const nzw = nyc * sinR + nzc * cosR

  // +Y_c cone axis in world coords
  const axisYw = cosR
  const axisZw = sinR

  return {
    position: new THREE.Vector3(xc, yw, zw),
    outwardNormal: new THREE.Vector3(nxc, nyw, nzw).normalize(),
    coneAxisWorld: new THREE.Vector3(0, axisYw, axisZw).normalize(),
  }
}

/**
 * Evaluates world-space states of the cone base cap, apex, and rim samples at `foldProgress`.
 *
 * @param {{ r: number, h: number }} dimensions
 * @param {number} foldProgress
 */
export function evaluateConeNetState(dimensions, foldProgress) {
  const layout = getConeNetLayout(dimensions?.r, dimensions?.h)
  const { r, h, slantHeight, thickness, rootPosition } = layout
  const yBase = rootPosition[1]
  const zRoot = rootPosition[2]

  const toWorld = (localVec) =>
    new THREE.Vector3(localVec.x, localVec.y + yBase, localVec.z + zRoot)

  const apexSample = sampleConeSectorPoint(0, 0, r, h, foldProgress)
  const rimSamples = Array.from({ length: 17 }, (_, index) => {
    const p = -1 + (index / 8)
    const sample = sampleConeSectorPoint(1, p, r, h, foldProgress)
    return {
      p,
      position: toWorld(sample.position),
      outwardNormal: sample.outwardNormal,
    }
  })

  return {
    layout,
    bottomCap: {
      center: new THREE.Vector3(0, thickness, zRoot),
      innerNormal: new THREE.Vector3(0, 1, 0),
      outerNormal: new THREE.Vector3(0, -1, 0),
      radius: r,
    },
    apex: toWorld(apexSample.position),
    rimSamples,
    slantHeight,
  }
}

/**
 * Allocates pre-sized BufferGeometries for the deforming cone sector surface
 * and its dynamic perimeter border lines (zero per-frame allocations).
 *
 * @param {number} [arcSegments=48]
 * @param {number} [radialSegments=6]
 */
export function createConeSectorGeometries(
  arcSegments = 48,
  radialSegments = 6,
) {
  const cols = arcSegments + 1
  const rows = radialSegments + 1
  const surfaceVertCount = cols * rows
  const rimEdgeCount = 2 * cols
  const leftEdgeCount = 2 * rows
  const rightEdgeCount = 2 * rows
  const totalVertices =
    surfaceVertCount * 2 + rimEdgeCount + leftEdgeCount + rightEdgeCount

  const positions = new Float32Array(totalVertices * 3)
  const normals = new Float32Array(totalVertices * 3)
  const uvs = new Float32Array(totalVertices * 2)
  const indices = []

  const outerOffset = surfaceVertCount

  // Inner surface UVs & indices (Group 0)
  for (let j = 0; j < rows; j += 1) {
    const v = 1 - j / radialSegments
    for (let i = 0; i < cols; i += 1) {
      const idx = j * cols + i
      uvs[idx * 2] = i / arcSegments
      uvs[idx * 2 + 1] = v
    }
  }
  for (let j = 0; j < radialSegments; j += 1) {
    for (let i = 0; i < arcSegments; i += 1) {
      const a = j * cols + i
      const b = j * cols + i + 1
      const d = (j + 1) * cols + i
      const c = (j + 1) * cols + i + 1
      if (j === 0) {
        indices.push(a, d, c)
      } else {
        indices.push(a, d, c, a, c, b)
      }
    }
  }
  const innerIndexCount = indices.length

  // Outer surface UVs & indices (Group 1, mirrored U so exterior label reads upright)
  for (let j = 0; j < rows; j += 1) {
    const v = 1 - j / radialSegments
    for (let i = 0; i < cols; i += 1) {
      const idx = outerOffset + j * cols + i
      uvs[idx * 2] = 1 - i / arcSegments
      uvs[idx * 2 + 1] = v
    }
  }
  const outerIndexStart = indices.length
  for (let j = 0; j < radialSegments; j += 1) {
    for (let i = 0; i < arcSegments; i += 1) {
      const a = outerOffset + j * cols + i
      const b = outerOffset + j * cols + i + 1
      const d = outerOffset + (j + 1) * cols + i
      const c = outerOffset + (j + 1) * cols + i + 1
      if (j === 0) {
        indices.push(a, c, d)
      } else {
        indices.push(a, c, d, a, b, c)
      }
    }
  }
  const outerIndexCount = indices.length - outerIndexStart

  // Edge closure strips (Group 2)
  const rimIndexStart = indices.length
  const rimOffset = outerOffset + surfaceVertCount
  for (let i = 0; i < arcSegments; i += 1) {
    const a = rimOffset + i
    const b = rimOffset + i + 1
    const c = rimOffset + cols + i + 1
    const d = rimOffset + cols + i
    indices.push(a, b, c, a, c, d)
  }

  const leftEdgeOffset = rimOffset + rimEdgeCount
  for (let j = 0; j < radialSegments; j += 1) {
    const a = leftEdgeOffset + j
    const b = leftEdgeOffset + j + 1
    const c = leftEdgeOffset + rows + j + 1
    const d = leftEdgeOffset + rows + j
    indices.push(a, c, b, a, d, c)
  }

  const rightEdgeOffset = leftEdgeOffset + leftEdgeCount
  for (let j = 0; j < radialSegments; j += 1) {
    const a = rightEdgeOffset + j
    const b = rightEdgeOffset + j + 1
    const c = rightEdgeOffset + rows + j + 1
    const d = rightEdgeOffset + rows + j
    indices.push(a, b, c, a, c, d)
  }
  const rimIndexCount = indices.length - rimIndexStart

  const sectorGeometry = new THREE.BufferGeometry()
  sectorGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
  )
  sectorGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  sectorGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  sectorGeometry.setIndex(indices)
  sectorGeometry.addGroup(0, innerIndexCount, 0)
  sectorGeometry.addGroup(outerIndexStart, outerIndexCount, 1)
  sectorGeometry.addGroup(rimIndexStart, rimIndexCount, 2)

  // Perimeter border LineSegments: rim arc (inner + outer) + left & right slant edges (inner + outer)
  const borderSegmentsCount = arcSegments * 2 + radialSegments * 4
  const borderPositions = new Float32Array(borderSegmentsCount * 2 * 3)
  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(borderPositions, 3),
  )

  return {
    sectorGeometry,
    borderGeometry,
    arcSegments,
    radialSegments,
  }
}

/**
 * Updates vertex positions, analytical normals, and perimeter outline
 * of the deforming cone sector for a given `foldProgress` [0, 100].
 *
 * @param {THREE.BufferGeometry} sectorGeometry
 * @param {THREE.BufferGeometry} borderGeometry
 * @param {number} r
 * @param {number} h
 * @param {number} thickness
 * @param {number} foldProgress
 * @param {number} [arcSegments=48]
 * @param {number} [radialSegments=6]
 */
export function updateConeSectorGeometries(
  sectorGeometry,
  borderGeometry,
  r,
  h,
  thickness,
  foldProgress,
  arcSegments = 48,
  radialSegments = 6,
) {
  const cols = arcSegments + 1
  const rows = radialSegments + 1
  const surfaceVertCount = cols * rows
  const outerOffset = surfaceVertCount
  const rimOffset = outerOffset + surfaceVertCount
  const leftEdgeOffset = rimOffset + 2 * cols
  const rightEdgeOffset = leftEdgeOffset + 2 * rows

  const l = Math.hypot(r, h)
  const phiNet = (2 * Math.PI * r) / l
  const t = clampFoldProgress(foldProgress) / 100
  const psiSpan = phiNet + t * (2 * Math.PI - phiNet)
  const rho = (2 * Math.PI * r) / psiSpan
  const sinB = Math.min(1, rho / l)
  const cosB = Math.sqrt(Math.max(0, 1 - sinB * sinB))
  const beta = Math.atan2(sinB, cosB)
  const betaEnd = Math.atan2(r, h)

  const alpha = -(Math.PI / 2 + beta)
  const pitch = t * (Math.PI / 2 + betaEnd)
  const totalRot = alpha + pitch
  const cosR = Math.cos(totalRot)
  const sinR = Math.sin(totalRot)

  const posAttr = sectorGeometry.getAttribute('position')
  const normAttr = sectorGeometry.getAttribute('normal')
  const pos = posAttr.array
  const norm = normAttr.array

  const setV = (idx, x, y, z, nx, ny, nz) => {
    const p3 = idx * 3
    pos[p3] = x
    pos[p3 + 1] = y
    pos[p3 + 2] = z
    norm[p3] = nx
    norm[p3 + 1] = ny
    norm[p3 + 2] = nz
  }

  // Apex outer point pushed cleanly along cone axis so all apex triangles meet at one point
  const apexOuterScale = thickness / Math.max(0.25, sinB)
  const apexOuterY =
    l * cosB * cosR - l * sinB * sinR + apexOuterScale * cosR
  const apexOuterZ =
    -r + l * cosB * sinR + l * sinB * cosR + apexOuterScale * sinR

  for (let j = 0; j < rows; j += 1) {
    const uFrac = j / radialSegments
    const u = uFrac * l

    for (let i = 0; i < cols; i += 1) {
      const p = -1 + (2 * i) / arcSegments
      const psi = p * (psiSpan / 2)

      const xc = u * sinB * Math.sin(psi)
      const dyc = (l - u) * cosB
      const dzc = l * sinB - u * sinB * Math.cos(psi)

      const yIn = dyc * cosR - dzc * sinR
      const zIn = -r + dyc * sinR + dzc * cosR

      const nxc = cosB * Math.sin(psi)
      const nyc = sinB
      const nzc = -cosB * Math.cos(psi)
      const nyOut = nyc * cosR - nzc * sinR
      const nzOut = nyc * sinR + nzc * cosR

      const innerIdx = j * cols + i
      setV(innerIdx, xc, yIn, zIn, -nxc, -nyOut, -nzOut)

      const outerIdx = outerOffset + innerIdx
      if (j === 0) {
        setV(outerIdx, 0, apexOuterY, apexOuterZ, nxc, nyOut, nzOut)
      } else {
        setV(
          outerIdx,
          xc + nxc * thickness,
          yIn + nyOut * thickness,
          zIn + nzOut * thickness,
          nxc,
          nyOut,
          nzOut,
        )
      }

      if (j === radialSegments) {
        // Rim edge strip (pointing along +u generator direction)
        const rux = sinB * Math.sin(psi)
        const ruyc = -cosB
        const ruzc = -sinB * Math.cos(psi)
        const ruy = ruyc * cosR - ruzc * sinR
        const ruz = ruyc * sinR + ruzc * cosR

        setV(rimOffset + i, xc, yIn, zIn, rux, ruy, ruz)
        setV(
          rimOffset + cols + i,
          xc + nxc * thickness,
          yIn + nyOut * thickness,
          zIn + nzOut * thickness,
          rux,
          ruy,
          ruz,
        )
      }

      if (i === 0) {
        const tx = -Math.cos(psi)
        const tzc = -Math.sin(psi)
        const ty = -tzc * sinR
        const tz = tzc * cosR
        setV(leftEdgeOffset + j, xc, yIn, zIn, tx, ty, tz)
        if (j === 0) {
          setV(leftEdgeOffset + rows + j, 0, apexOuterY, apexOuterZ, tx, ty, tz)
        } else {
          setV(
            leftEdgeOffset + rows + j,
            xc + nxc * thickness,
            yIn + nyOut * thickness,
            zIn + nzOut * thickness,
            tx,
            ty,
            tz,
          )
        }
      }

      if (i === arcSegments) {
        const tx = Math.cos(psi)
        const tzc = Math.sin(psi)
        const ty = -tzc * sinR
        const tz = tzc * cosR
        setV(rightEdgeOffset + j, xc, yIn, zIn, tx, ty, tz)
        if (j === 0) {
          setV(
            rightEdgeOffset + rows + j,
            0,
            apexOuterY,
            apexOuterZ,
            tx,
            ty,
            tz,
          )
        } else {
          setV(
            rightEdgeOffset + rows + j,
            xc + nxc * thickness,
            yIn + nyOut * thickness,
            zIn + nzOut * thickness,
            tx,
            ty,
            tz,
          )
        }
      }
    }
  }

  posAttr.needsUpdate = true
  normAttr.needsUpdate = true
  sectorGeometry.computeBoundingSphere()

  if (borderGeometry) {
    const borderAttr = borderGeometry.getAttribute('position')
    const bArr = borderAttr.array
    let ptr = 0
    const eps = 0.003

    const pushSeg = (x1, y1, z1, x2, y2, z2) => {
      bArr[ptr++] = x1
      bArr[ptr++] = y1
      bArr[ptr++] = z1
      bArr[ptr++] = x2
      bArr[ptr++] = y2
      bArr[ptr++] = z2
    }

    const rimRow = radialSegments * cols
    for (let i = 0; i < arcSegments; i += 1) {
      const inA = (rimRow + i) * 3
      const inB = (rimRow + i + 1) * 3
      const outA = (outerOffset + rimRow + i) * 3
      const outB = (outerOffset + rimRow + i + 1) * 3

      pushSeg(
        pos[inA] + norm[inA] * eps,
        pos[inA + 1] + norm[inA + 1] * eps,
        pos[inA + 2] + norm[inA + 2] * eps,
        pos[inB] + norm[inB] * eps,
        pos[inB + 1] + norm[inB + 1] * eps,
        pos[inB + 2] + norm[inB + 2] * eps,
      )
      pushSeg(
        pos[outA] + norm[outA] * eps,
        pos[outA + 1] + norm[outA + 1] * eps,
        pos[outA + 2] + norm[outA + 2] * eps,
        pos[outB] + norm[outB] * eps,
        pos[outB + 1] + norm[outB + 1] * eps,
        pos[outB + 2] + norm[outB + 2] * eps,
      )
    }

    for (const colIdx of [0, arcSegments]) {
      for (let j = 0; j < radialSegments; j += 1) {
        const inA = (j * cols + colIdx) * 3
        const inB = ((j + 1) * cols + colIdx) * 3
        const outA = (outerOffset + j * cols + colIdx) * 3
        const outB = (outerOffset + (j + 1) * cols + colIdx) * 3

        pushSeg(
          pos[inA] + norm[inA] * eps,
          pos[inA + 1] + norm[inA + 1] * eps,
          pos[inA + 2] + norm[inA + 2] * eps,
          pos[inB] + norm[inB] * eps,
          pos[inB + 1] + norm[inB + 1] * eps,
          pos[inB + 2] + norm[inB + 2] * eps,
        )
        pushSeg(
          pos[outA] + norm[outA] * eps,
          pos[outA + 1] + norm[outA + 1] * eps,
          pos[outA + 2] + norm[outA + 2] * eps,
          pos[outB] + norm[outB] * eps,
          pos[outB + 1] + norm[outB + 1] * eps,
          pos[outB + 2] + norm[outB + 2] * eps,
        )
      }
    }

    borderAttr.needsUpdate = true
    borderGeometry.computeBoundingSphere()
  }
}

/**
 * Shared palette for dynamic n-sided prism, pyramid, and octahedron faces.
 */
export const MULTI_FACE_PALETTE = Object.freeze([
  { color: '#10b981', edgeColor: '#047857' },
  { color: '#06b6d4', edgeColor: '#0e7490' },
  { color: '#f59e0b', edgeColor: '#b45309' },
  { color: '#8b5cf6', edgeColor: '#6d28d9' },
  { color: '#ec4899', edgeColor: '#be185d' },
  { color: '#14b8a6', edgeColor: '#0f766e' },
  { color: '#f97316', edgeColor: '#c2410c' },
  { color: '#6366f1', edgeColor: '#4338ca' },
])

export const HEMISPHERE_PART_METADATA = Object.freeze({
  bottom: {
    id: 'bottom',
    label: 'BASE',
    badge: 'πr²',
    color: '#3b82f6',
    edgeColor: '#1d4ed8',
  },
  lateral: {
    id: 'lateral',
    label: 'CURVED DOME',
    badge: '2πr²',
    color: '#10b981',
    edgeColor: '#047857',
  },
})

export const FRUSTUM_PART_METADATA = Object.freeze({
  bottom: {
    id: 'bottom',
    label: 'BASE',
    badge: 'πr₁²',
    color: '#3b82f6',
    edgeColor: '#1d4ed8',
  },
  lateral: {
    id: 'lateral',
    label: 'CURVED SURFACE',
    badge: 'π(r₁+r₂)l',
    color: '#10b981',
    edgeColor: '#047857',
  },
  top: {
    id: 'top',
    label: 'TOP',
    badge: 'πr₂²',
    color: '#f43f5e',
    edgeColor: '#be123c',
  },
})

/**
 * Generates vertices of a regular n-gon on the XZ plane with edge 0 along z = -apothem
 * (spanning [-a/2, +a/2]).
 *
 * @param {number} sides
 * @param {number} sideLength
 * @returns {Array<{ x: number, z: number }>}
 */
export function getRegularPolygonVerticesXZ(sides, sideLength) {
  const radius = sideLength / (2 * Math.sin(Math.PI / sides))
  const startAngle = -Math.PI / 2 + Math.PI / sides
  return Array.from({ length: sides }, (_, k) => {
    const theta = startAngle + (2 * Math.PI * k) / sides
    return {
      x: radius * Math.cos(theta),
      z: radius * Math.sin(theta),
    }
  })
}

/**
 * Builds a closed thin regular n-gonal plate BufferGeometry with inner face at y = 0,
 * outer face at y = -thickness, and 3 material groups (0: inner, 1: outer, 2: rims).
 *
 * @param {number} sides
 * @param {number} sideLength
 * @param {number} thickness
 * @param {boolean} [anchorAtEdge=false] - Shifts edge 0 to z = 0 extending into +Z.
 * @returns {THREE.BufferGeometry}
 */
export function createRegularPolygonPlateGeometry(
  sides,
  sideLength,
  thickness,
  anchorAtEdge = false,
) {
  const radius = sideLength / (2 * Math.sin(Math.PI / sides))
  const apothem = sideLength / (2 * Math.tan(Math.PI / sides))
  const zShift = anchorAtEdge ? apothem : 0
  const verts = getRegularPolygonVerticesXZ(sides, sideLength).map((v) => ({
    x: v.x,
    z: v.z + zShift,
  }))
  const center = { x: 0, z: zShift }

  const positions = []
  const uvs = []

  const pushTri = (p1, p2, p3, uv1, uv2, uv3) => {
    positions.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2])
    uvs.push(uv1[0], uv1[1], uv2[0], uv2[1], uv3[0], uv3[1])
  }

  const mapUV = (vx, vz, mirrorX = false) => [
    0.5 + ((mirrorX ? -vx : vx) / (2 * radius)),
    0.5 - (vz - zShift) / (2 * radius),
  ]

  // Group 0: Inner polygon face (y = 0, normal +Y)
  for (let k = 0; k < sides; k += 1) {
    const v1 = verts[k]
    const v2 = verts[(k + 1) % sides]
    pushTri(
      [center.x, 0, center.z],
      [v2.x, 0, v2.z],
      [v1.x, 0, v1.z],
      mapUV(center.x, center.z),
      mapUV(v2.x, v2.z),
      mapUV(v1.x, v1.z),
    )
  }
  const innerCount = sides * 3

  // Group 1: Outer polygon face (y = -thickness, normal -Y)
  for (let k = 0; k < sides; k += 1) {
    const v1 = verts[k]
    const v2 = verts[(k + 1) % sides]
    pushTri(
      [center.x, -thickness, center.z],
      [v1.x, -thickness, v1.z],
      [v2.x, -thickness, v2.z],
      mapUV(center.x, center.z, true),
      mapUV(v1.x, v1.z, true),
      mapUV(v2.x, v2.z, true),
    )
  }
  const outerCount = sides * 3

  // Group 2: Side edge quads closing the thin plate
  for (let k = 0; k < sides; k += 1) {
    const v1 = verts[k]
    const v2 = verts[(k + 1) % sides]
    pushTri(
      [v1.x, -thickness, v1.z],
      [v1.x, 0, v1.z],
      [v2.x, 0, v2.z],
      [0, 0],
      [0, 1],
      [1, 1],
    )
    pushTri(
      [v1.x, -thickness, v1.z],
      [v2.x, 0, v2.z],
      [v2.x, -thickness, v2.z],
      [0, 0],
      [1, 1],
      [1, 0],
    )
  }
  const rimCount = sides * 6

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.addGroup(0, innerCount, 0)
  geometry.addGroup(innerCount, outerCount, 1)
  geometry.addGroup(innerCount + outerCount, rimCount, 2)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/**
 * Computes layout for a regular n-sided prism net (`n = 3, 5, 6`).
 */
export function getPolygonPrismNetLayout(sides, sideLength = 4, height = 5) {
  const a = sanitizePositive(sideLength, 4)
  const h = sanitizePositive(height, 5)
  const circumradius = a / (2 * Math.sin(Math.PI / sides))
  const apothem = a / (2 * Math.tan(Math.PI / sides))
  const thickness = Math.max(0.02, Math.min(a, h) * 0.015)

  const sideEdges = Array.from({ length: sides }, (_, idx) => ({
    id: `side_${idx}`,
    rotY: Math.PI + (2 * Math.PI * idx) / sides,
    hingeDistance: apothem,
  }))

  return {
    sides,
    a,
    h,
    apothem,
    circumradius,
    thickness,
    rootPosition: [0, thickness, (h + circumradius) * 0.2],
    sideEdges,
  }
}

/**
 * Evaluates world-space positions & normals of a regular n-sided prism net at `foldProgress` [0, 100].
 */
export function evaluatePolygonPrismNetState(sides, dimensions, foldProgress) {
  const layout = getPolygonPrismNetLayout(sides, dimensions?.a, dimensions?.h)
  const { a, h, apothem, thickness, rootPosition, sideEdges } = layout
  const angle = foldProgressToRadians(foldProgress)

  const root = new THREE.Group()
  root.position.set(...rootPosition)

  const bottomNode = new THREE.Group()
  bottomNode.position.set(0, -thickness / 2, 0)
  root.add(bottomNode)

  const sideNodes = {}
  let topNode = null

  for (let idx = 0; idx < sideEdges.length; idx += 1) {
    const edge = sideEdges[idx]
    const orient = new THREE.Group()
    orient.rotation.y = edge.rotY
    root.add(orient)

    const hinge = new THREE.Group()
    hinge.position.set(0, 0, apothem)
    hinge.rotation.x = -angle
    orient.add(hinge)

    const panel = new THREE.Group()
    panel.position.set(0, -thickness / 2, h / 2)
    hinge.add(panel)
    sideNodes[edge.id] = { hinge, panel }

    if (idx === 0) {
      const topHinge = new THREE.Group()
      topHinge.position.set(0, 0, h)
      topHinge.rotation.x = -angle
      hinge.add(topHinge)

      const tNode = new THREE.Group()
      tNode.position.set(0, -thickness / 2, 0)
      topHinge.add(tNode)
      topNode = { hinge: topHinge, panel: tNode }
    }
  }

  root.updateMatrixWorld(true)

  const bottomNormal = new THREE.Vector3(0, 1, 0)
    .applyMatrix3(new THREE.Matrix3().getNormalMatrix(bottomNode.matrixWorld))
    .normalize()

  const topCenter = new THREE.Vector3(0, thickness / 2, apothem).applyMatrix4(
    topNode.panel.matrixWorld,
  )
  const topNormal = new THREE.Vector3(0, 1, 0)
    .applyMatrix3(new THREE.Matrix3().getNormalMatrix(topNode.panel.matrixWorld))
    .normalize()

  const sideResults = {}
  for (const edge of sideEdges) {
    const pNode = sideNodes[edge.id].panel
    const center = new THREE.Vector3(0, thickness / 2, 0).applyMatrix4(
      pNode.matrixWorld,
    )
    const innerNormal = new THREE.Vector3(0, 1, 0)
      .applyMatrix3(new THREE.Matrix3().getNormalMatrix(pNode.matrixWorld))
      .normalize()
    const farLeft = new THREE.Vector3(-a / 2, thickness / 2, h / 2).applyMatrix4(
      pNode.matrixWorld,
    )
    const farRight = new THREE.Vector3(a / 2, thickness / 2, h / 2).applyMatrix4(
      pNode.matrixWorld,
    )
    sideResults[edge.id] = { center, innerNormal, farLeft, farRight }
  }

  return {
    layout,
    bottom: {
      center: new THREE.Vector3(0, thickness / 2, 0).applyMatrix4(
        bottomNode.matrixWorld,
      ),
      innerNormal: bottomNormal,
    },
    top: {
      center: topCenter,
      innerNormal: topNormal,
      outerNormal: topNormal.clone().negate(),
    },
    sides: sideResults,
  }
}

/**
 * Computes layout for a regular n-sided pyramid net (`n = 3, 4, 5, 6`).
 */
export function getPolygonPyramidNetLayout(sides, baseSide = 6, height = 4) {
  const a = sanitizePositive(baseSide, 6)
  const h = sanitizePositive(height, 4)
  const apothem = a / (2 * Math.tan(Math.PI / sides))
  const circumradius = a / (2 * Math.sin(Math.PI / sides))
  const slantHeight = Math.hypot(h, apothem)
  const thickness = Math.max(0.02, Math.min(a, h) * 0.015)
  const maxFoldAngle = Math.atan2(h, -apothem)

  const sideEdges = Array.from({ length: sides }, (_, idx) => ({
    id: `side_${idx}`,
    rotY: Math.PI + (2 * Math.PI * idx) / sides,
  }))

  return {
    sides,
    a,
    h,
    apothem,
    circumradius,
    slantHeight,
    thickness,
    maxFoldAngle,
    rootPosition: [0, thickness, 0],
    hingeDistance: apothem,
    sideEdges,
  }
}

/**
 * Evaluates world-space states for a regular n-sided pyramid net at `foldProgress` [0, 100].
 */
export function evaluatePolygonPyramidNetState(
  sides,
  dimensions,
  foldProgress,
) {
  const layout = getPolygonPyramidNetLayout(
    sides,
    dimensions?.a,
    dimensions?.h,
  )
  const { a, apothem, slantHeight, thickness, maxFoldAngle, rootPosition, sideEdges } =
    layout
  const angle = (clampFoldProgress(foldProgress) / 100) * maxFoldAngle
  const half = a / 2

  const root = new THREE.Group()
  root.position.set(...rootPosition)

  const sideNodes = {}
  for (const edge of sideEdges) {
    const orient = new THREE.Group()
    orient.rotation.y = edge.rotY
    root.add(orient)

    const hinge = new THREE.Group()
    hinge.position.set(0, 0, apothem)
    hinge.rotation.x = -angle
    orient.add(hinge)

    sideNodes[edge.id] = hinge
  }

  root.updateMatrixWorld(true)

  const sideStates = {}
  for (const edge of sideEdges) {
    const node = sideNodes[edge.id]
    sideStates[edge.id] = {
      baseLeft: new THREE.Vector3(-half, 0, 0).applyMatrix4(node.matrixWorld),
      baseRight: new THREE.Vector3(half, 0, 0).applyMatrix4(node.matrixWorld),
      apex: new THREE.Vector3(0, 0, slantHeight).applyMatrix4(node.matrixWorld),
    }
  }

  return {
    layout,
    bottom: {
      center: new THREE.Vector3(0, thickness, 0),
      innerNormal: new THREE.Vector3(0, 1, 0),
    },
    sides: sideStates,
  }
}

/**
 * Computes regular octahedron net layout (`8` equilateral triangles of edge `a`).
 */
export function getOctahedronNetLayout(edgeLength = 5) {
  const a = sanitizePositive(edgeLength, 5)
  const apothem = a / (2 * Math.sqrt(3))
  const circumradius = a / Math.sqrt(3)
  const triangleHeight = (Math.sqrt(3) / 2) * a
  const solidHeight = a * Math.sqrt(2 / 3)
  const thickness = Math.max(0.02, a * 0.015)
  const maxFoldAngle = Math.acos(1 / 3)

  return {
    a,
    apothem,
    circumradius,
    triangleHeight,
    solidHeight,
    thickness,
    maxFoldAngle,
    rootPosition: [0, thickness, 0],
    lowerEdgeRots: [Math.PI, Math.PI / 3, -Math.PI / 3],
  }
}

/**
 * Evaluates world-space vertices of all 8 faces of the regular octahedron net at `foldProgress` [0, 100].
 */
export function evaluateOctahedronNetState(edgeLength, foldProgress) {
  const layout = getOctahedronNetLayout(edgeLength)
  const {
    a,
    apothem,
    triangleHeight,
    thickness,
    maxFoldAngle,
    rootPosition,
    lowerEdgeRots,
  } = layout
  const angle = (clampFoldProgress(foldProgress) / 100) * maxFoldAngle
  const half = a / 2

  const root = new THREE.Group()
  root.position.set(...rootPosition)

  const lowerNodes = []
  const upperNodes = []
  let topNode = null

  lowerEdgeRots.forEach((rotY, idx) => {
    const orient = new THREE.Group()
    orient.rotation.y = rotY
    root.add(orient)

    const lHinge = new THREE.Group()
    lHinge.position.set(0, 0, apothem)
    lHinge.rotation.x = -angle
    orient.add(lHinge)
    lowerNodes.push(lHinge)

    const uOrient = new THREE.Group()
    uOrient.position.set(a / 4, 0, triangleHeight / 2)
    uOrient.rotation.y = Math.PI / 3
    lHinge.add(uOrient)

    const uHinge = new THREE.Group()
    uHinge.rotation.x = -angle
    uOrient.add(uHinge)
    upperNodes.push(uHinge)

    if (idx === 0) {
      const topOrient = new THREE.Group()
      topOrient.position.set(-a / 4, 0, triangleHeight / 2)
      topOrient.rotation.y = -Math.PI / 3
      uHinge.add(topOrient)

      const tHinge = new THREE.Group()
      tHinge.rotation.x = -angle
      topOrient.add(tHinge)
      topNode = tHinge
    }
  })

  root.updateMatrixWorld(true)

  const sampleTri = (node) => ({
    vLeft: new THREE.Vector3(-half, 0, 0).applyMatrix4(node.matrixWorld),
    vRight: new THREE.Vector3(half, 0, 0).applyMatrix4(node.matrixWorld),
    vApex: new THREE.Vector3(0, 0, triangleHeight).applyMatrix4(node.matrixWorld),
    innerNormal: new THREE.Vector3(0, 1, 0)
      .applyMatrix3(new THREE.Matrix3().getNormalMatrix(node.matrixWorld))
      .normalize(),
  })

  const baseVerts = getRegularPolygonVerticesXZ(3, a).map(
    (v) => new THREE.Vector3(v.x, thickness, v.z),
  )

  return {
    layout,
    base: {
      vertices: baseVerts,
      innerNormal: new THREE.Vector3(0, 1, 0),
    },
    lower: lowerNodes.map(sampleTri),
    upper: upperNodes.map(sampleTri),
    top: sampleTri(topNode),
  }
}

/**
 * Computes frustum of a cone net layout parameters (`r1`, `r2`, `h`, `l`).
 */
export function getFrustumNetLayout(r1 = 5, r2 = 2.5, height = 4) {
  const bottomR = sanitizePositive(r1, 5)
  const topR = sanitizePositive(r2, 2.5)
  const h = sanitizePositive(height, 4)
  const slantHeight = Math.hypot(h, bottomR - topR)
  const thickness = Math.max(0.02, Math.min(bottomR, topR, h) * 0.015)

  return {
    r1: bottomR,
    r2: topR,
    h,
    slantHeight,
    thickness,
    rootPosition: [0, thickness, (bottomR + slantHeight + topR) * 0.28],
  }
}

/**
 * Evaluates a point, outward normal, and top-cap hinge anchor on the deforming frustum wall.
 * Supports `r1 > r2`, `r1 === r2` (cylinder limit), and `r1 < r2` cleanly via Taylor `sinc`.
 *
 * @param {number} vFrac - Height fraction from bottom rim (0) to top rim (1).
 * @param {number} p - Angular fraction across wall [-1, +1].
 * @param {number} r1 - Bottom radius.
 * @param {number} r2 - Top radius.
 * @param {number} h - Vertical height.
 * @param {number} foldProgress - Fold percentage [0, 100].
 */
export function sampleFrustumWallPoint(vFrac, p, r1, r2, h, foldProgress) {
  const rDiff = r1 - r2
  const l = Math.hypot(h, rDiff)
  const t = clampFoldProgress(foldProgress) / 100
  const phiNet = (2 * Math.PI * rDiff) / l
  const targetSpan = rDiff >= 0 ? 2 * Math.PI : -2 * Math.PI
  const psiSpan = phiNet + t * (targetSpan - phiNet)
  const absSpan = Math.abs(psiSpan)

  const sinBs = absSpan < 1e-7 ? 0 : (2 * Math.PI * rDiff) / (l * absSpan)
  const cosBs = Math.sqrt(Math.max(0, 1 - sinBs * sinBs))
  const betas = Math.atan2(sinBs, cosBs)
  const betaEnd = Math.atan2(rDiff, h)
  const totalRot = -(Math.PI / 2 + betas) + t * (Math.PI / 2 + betaEnd)

  const cosR = Math.cos(totalRot)
  const sinR = Math.sin(totalRot)

  const rV = r1 + vFrac * (r2 - r1)
  const psiAbs = p * (absSpan / 2)

  const xc = p * Math.PI * rV * sinc(psiAbs)
  const dyc = vFrac * l * cosBs
  const dzc =
    p * Math.PI * r1 * Math.sin(psiAbs / 2) * sinc(psiAbs / 2) +
    vFrac * l * sinBs * Math.cos(psiAbs)

  const yw = dyc * cosR - dzc * sinR
  const zw = -r1 + dyc * sinR + dzc * cosR

  // Outward normal perpendicular to slant generator & circumference tangent
  const nxc = cosBs * Math.sin(psiAbs)
  const nyc = sinBs
  const nzc = -cosBs * Math.cos(psiAbs)
  const nyw = nyc * cosR - nzc * sinR
  const nzw = nyc * sinR + nzc * cosR

  return {
    position: new THREE.Vector3(xc, yw, zw),
    outwardNormal: new THREE.Vector3(nxc, nyw, nzw).normalize(),
  }
}

/**
 * Evaluates world-space states of the frustum bottom cap, top cap, and rim samples at `foldProgress`.
 */
export function evaluateFrustumNetState(dimensions, foldProgress) {
  const layout = getFrustumNetLayout(
    dimensions?.r1,
    dimensions?.r2,
    dimensions?.h,
  )
  const { r1, r2, h, slantHeight, thickness, rootPosition } = layout
  const t = clampFoldProgress(foldProgress) / 100
  const yBase = rootPosition[1]
  const zRoot = rootPosition[2]

  const toWorld = (localVec) =>
    new THREE.Vector3(localVec.x, localVec.y + yBase, localVec.z + zRoot)

  const topAnchorLocal = sampleFrustumWallPoint(
    1,
    0,
    r1,
    r2,
    h,
    foldProgress,
  ).position
  const topPitch = t * Math.PI
  const topCapCenterLocal = new THREE.Vector3(
    0,
    topAnchorLocal.y - -r2 * Math.sin(topPitch),
    topAnchorLocal.z + -r2 * Math.cos(topPitch),
  )

  const bottomSamples = Array.from({ length: 17 }, (_, i) =>
    toWorld(
      sampleFrustumWallPoint(0, -1 + i / 8, r1, r2, h, foldProgress).position,
    ),
  )
  const topSamples = Array.from({ length: 17 }, (_, i) =>
    toWorld(
      sampleFrustumWallPoint(1, -1 + i / 8, r1, r2, h, foldProgress).position,
    ),
  )

  return {
    layout,
    slantHeight,
    bottomCap: {
      center: new THREE.Vector3(0, thickness, zRoot),
      radius: r1,
    },
    topCapAnchor: toWorld(topAnchorLocal),
    topCapCenter: toWorld(topCapCenterLocal),
    topCapPitch: topPitch,
    bottomSamples,
    topSamples,
  }
}

/**
 * Allocates pre-sized BufferGeometries for the deforming frustum curved wall
 * and its perimeter border lines.
 */
export function createFrustumWallGeometries(
  arcSegments = 48,
  heightSegments = 4,
) {
  const cols = arcSegments + 1
  const rows = heightSegments + 1
  const surfCount = cols * rows
  const edgeCount = 2 * cols * 2 + 2 * rows * 2
  const totalVertices = surfCount * 2 + edgeCount

  const positions = new Float32Array(totalVertices * 3)
  const normals = new Float32Array(totalVertices * 3)
  const uvs = new Float32Array(totalVertices * 2)
  const indices = []

  const outerOffset = surfCount

  // Inner surface (Group 0: j=0 is bottom, j=heightSegments is top)
  for (let j = 0; j < rows; j += 1) {
    const v = j / heightSegments
    for (let i = 0; i < cols; i += 1) {
      const idx = j * cols + i
      uvs[idx * 2] = i / arcSegments
      uvs[idx * 2 + 1] = v
    }
  }
  for (let j = 0; j < heightSegments; j += 1) {
    for (let i = 0; i < arcSegments; i += 1) {
      const a = j * cols + i
      const b = j * cols + i + 1
      const c = (j + 1) * cols + i + 1
      const d = (j + 1) * cols + i
      indices.push(a, b, c, a, c, d)
    }
  }
  const innerIndexCount = indices.length

  // Outer surface (Group 1: mirrored U so exterior label reads upright)
  for (let j = 0; j < rows; j += 1) {
    const v = j / heightSegments
    for (let i = 0; i < cols; i += 1) {
      const idx = outerOffset + j * cols + i
      uvs[idx * 2] = 1 - i / arcSegments
      uvs[idx * 2 + 1] = v
    }
  }
  const outerIndexStart = indices.length
  for (let j = 0; j < heightSegments; j += 1) {
    for (let i = 0; i < arcSegments; i += 1) {
      const a = outerOffset + j * cols + i
      const b = outerOffset + j * cols + i + 1
      const c = outerOffset + (j + 1) * cols + i + 1
      const d = outerOffset + (j + 1) * cols + i
      indices.push(a, c, b, a, d, c)
    }
  }
  const outerIndexCount = indices.length - outerIndexStart

  // Rim strips (Group 2: bottom rim, top rim, left seam, right seam)
  const rimIndexStart = indices.length
  const botRimOffset = outerOffset + surfCount
  for (let i = 0; i < arcSegments; i += 1) {
    const a = botRimOffset + i
    const b = botRimOffset + i + 1
    const c = botRimOffset + cols + i + 1
    const d = botRimOffset + cols + i
    indices.push(a, c, b, a, d, c)
  }

  const topRimOffset = botRimOffset + 2 * cols
  for (let i = 0; i < arcSegments; i += 1) {
    const a = topRimOffset + i
    const b = topRimOffset + i + 1
    const c = topRimOffset + cols + i + 1
    const d = topRimOffset + cols + i
    indices.push(a, b, c, a, c, d)
  }

  const leftRimOffset = topRimOffset + 2 * cols
  for (let j = 0; j < heightSegments; j += 1) {
    const a = leftRimOffset + j
    const b = leftRimOffset + j + 1
    const c = leftRimOffset + rows + j + 1
    const d = leftRimOffset + rows + j
    indices.push(a, b, c, a, c, d)
  }

  const rightRimOffset = leftRimOffset + 2 * rows
  for (let j = 0; j < heightSegments; j += 1) {
    const a = rightRimOffset + j
    const b = rightRimOffset + j + 1
    const c = rightRimOffset + rows + j + 1
    const d = rightRimOffset + rows + j
    indices.push(a, c, b, a, d, c)
  }
  const rimIndexCount = indices.length - rimIndexStart

  const wallGeometry = new THREE.BufferGeometry()
  wallGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  wallGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  wallGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  wallGeometry.setIndex(indices)
  wallGeometry.addGroup(0, innerIndexCount, 0)
  wallGeometry.addGroup(outerIndexStart, outerIndexCount, 1)
  wallGeometry.addGroup(rimIndexStart, rimIndexCount, 2)

  const borderSegmentsCount = arcSegments * 4 + heightSegments * 4
  const borderPositions = new Float32Array(borderSegmentsCount * 2 * 3)
  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(borderPositions, 3),
  )

  return { wallGeometry, borderGeometry, arcSegments, heightSegments }
}

/**
 * Updates vertex positions, normals, and outline border lines of the deforming frustum wall.
 */
export function updateFrustumWallGeometries(
  wallGeometry,
  borderGeometry,
  r1,
  r2,
  h,
  thickness,
  foldProgress,
  arcSegments = 48,
  heightSegments = 4,
) {
  const cols = arcSegments + 1
  const rows = heightSegments + 1
  const surfCount = cols * rows
  const outerOffset = surfCount
  const botRimOffset = outerOffset + surfCount
  const topRimOffset = botRimOffset + 2 * cols
  const leftRimOffset = topRimOffset + 2 * cols
  const rightRimOffset = leftRimOffset + 2 * rows

  const posAttr = wallGeometry.getAttribute('position')
  const normAttr = wallGeometry.getAttribute('normal')
  const pos = posAttr.array
  const norm = normAttr.array

  const setV = (idx, x, y, z, nx, ny, nz) => {
    const p3 = idx * 3
    pos[p3] = x
    pos[p3 + 1] = y
    pos[p3 + 2] = z
    norm[p3] = nx
    norm[p3 + 1] = ny
    norm[p3 + 2] = nz
  }

  for (let j = 0; j < rows; j += 1) {
    const vFrac = j / heightSegments
    for (let i = 0; i < cols; i += 1) {
      const p = -1 + (2 * i) / arcSegments
      const sample = sampleFrustumWallPoint(vFrac, p, r1, r2, h, foldProgress)
      const { position: pt, outwardNormal: n } = sample

      const innerIdx = j * cols + i
      setV(innerIdx, pt.x, pt.y, pt.z, -n.x, -n.y, -n.z)

      const outerIdx = outerOffset + innerIdx
      setV(
        outerIdx,
        pt.x + n.x * thickness,
        pt.y + n.y * thickness,
        pt.z + n.z * thickness,
        n.x,
        n.y,
        n.z,
      )

      if (j === 0) {
        setV(botRimOffset + i, pt.x, pt.y, pt.z, n.x, -1, n.z)
        setV(
          botRimOffset + cols + i,
          pt.x + n.x * thickness,
          pt.y + n.y * thickness,
          pt.z + n.z * thickness,
          n.x,
          -1,
          n.z,
        )
      }

      if (j === heightSegments) {
        setV(topRimOffset + i, pt.x, pt.y, pt.z, n.x, 1, n.z)
        setV(
          topRimOffset + cols + i,
          pt.x + n.x * thickness,
          pt.y + n.y * thickness,
          pt.z + n.z * thickness,
          n.x,
          1,
          n.z,
        )
      }

      if (i === 0) {
        setV(leftRimOffset + j, pt.x, pt.y, pt.z, -1, 0, 0)
        setV(
          leftRimOffset + rows + j,
          pt.x + n.x * thickness,
          pt.y + n.y * thickness,
          pt.z + n.z * thickness,
          -1,
          0,
          0,
        )
      }

      if (i === arcSegments) {
        setV(rightRimOffset + j, pt.x, pt.y, pt.z, 1, 0, 0)
        setV(
          rightRimOffset + rows + j,
          pt.x + n.x * thickness,
          pt.y + n.y * thickness,
          pt.z + n.z * thickness,
          1,
          0,
          0,
        )
      }
    }
  }

  posAttr.needsUpdate = true
  normAttr.needsUpdate = true
  wallGeometry.computeBoundingSphere()

  if (borderGeometry) {
    const borderAttr = borderGeometry.getAttribute('position')
    const bArr = borderAttr.array
    let ptr = 0
    const eps = 0.003

    const pushSeg = (x1, y1, z1, x2, y2, z2) => {
      bArr[ptr++] = x1
      bArr[ptr++] = y1
      bArr[ptr++] = z1
      bArr[ptr++] = x2
      bArr[ptr++] = y2
      bArr[ptr++] = z2
    }

    for (const rowIdx of [0, heightSegments]) {
      const rowOffset = rowIdx * cols
      for (let i = 0; i < arcSegments; i += 1) {
        const inA = (rowOffset + i) * 3
        const inB = (rowOffset + i + 1) * 3
        const outA = (outerOffset + rowOffset + i) * 3
        const outB = (outerOffset + rowOffset + i + 1) * 3

        pushSeg(
          pos[inA] + norm[inA] * eps,
          pos[inA + 1] + norm[inA + 1] * eps,
          pos[inA + 2] + norm[inA + 2] * eps,
          pos[inB] + norm[inB] * eps,
          pos[inB + 1] + norm[inB + 1] * eps,
          pos[inB + 2] + norm[inB + 2] * eps,
        )
        pushSeg(
          pos[outA] + norm[outA] * eps,
          pos[outA + 1] + norm[outA + 1] * eps,
          pos[outA + 2] + norm[outA + 2] * eps,
          pos[outB] + norm[outB] * eps,
          pos[outB + 1] + norm[outB + 1] * eps,
          pos[outB + 2] + norm[outB + 2] * eps,
        )
      }
    }

    for (const colIdx of [0, arcSegments]) {
      for (let j = 0; j < heightSegments; j += 1) {
        const inA = (j * cols + colIdx) * 3
        const inB = ((j + 1) * cols + colIdx) * 3
        const outA = (outerOffset + j * cols + colIdx) * 3
        const outB = (outerOffset + (j + 1) * cols + colIdx) * 3

        pushSeg(
          pos[inA] + norm[inA] * eps,
          pos[inA + 1] + norm[inA + 1] * eps,
          pos[inA + 2] + norm[inA + 2] * eps,
          pos[inB] + norm[inB] * eps,
          pos[inB + 1] + norm[inB + 1] * eps,
          pos[inB + 2] + norm[inB + 2] * eps,
        )
        pushSeg(
          pos[outA] + norm[outA] * eps,
          pos[outA + 1] + norm[outA + 1] * eps,
          pos[outA + 2] + norm[outA + 2] * eps,
          pos[outB] + norm[outB] * eps,
          pos[outB + 1] + norm[outB + 1] * eps,
          pos[outB + 2] + norm[outB + 2] * eps,
        )
      }
    }

    borderAttr.needsUpdate = true
    borderGeometry.computeBoundingSphere()
  }
}

/**
 * Builds a hierarchical BFS hinge tree for any connected grid net of unit squares
 * (including all 11 valid cube nets and invalid candidate hexominoes for 3D feedback).
 *
 * @param {Array<[number, number]>} cells - 2D grid cell coordinates `[row, col]`.
 * @param {number} [edgeLength=3] - Length of each square edge `a`.
 * @param {number} [rootIndex=0] - Stationary base cell index.
 */
export function buildCubeNetHingeTree(cells, edgeLength = 3, rootIndex = 0) {
  const a = sanitizePositive(edgeLength, 3)
  const thickness = Math.max(0.02, a * 0.015)
  const validation = validateCubeNet(cells, rootIndex)

  const uniqueCells = []
  const byKey = new Map()
  if (Array.isArray(cells)) {
    for (let i = 0; i < cells.length; i += 1) {
      const raw = cells[i]
      const row = Array.isArray(raw) ? raw[0] : raw?.row
      const col = Array.isArray(raw) ? raw[1] : raw?.col
      if (Number.isInteger(row) && Number.isInteger(col)) {
        const key = `${row},${col}`
        if (!byKey.has(key)) {
          const assigned = validation.assignedFaces.find(
            (f) => f.row === row && f.col === col,
          )
          const item = {
            index: i,
            row,
            col,
            key,
            faceId: assigned?.faceId ?? 'bottom',
            overlapping: Boolean(assigned?.overlapping),
          }
          uniqueCells.push(item)
          byKey.set(key, item)
        }
      }
    }
  }

  if (uniqueCells.length === 0) {
    return null
  }

  const safeRootIdx =
    Number.isInteger(rootIndex) && rootIndex >= 0 && rootIndex < uniqueCells.length
      ? rootIndex
      : 0
  const rootCell = uniqueCells[safeRootIdx]

  let minR = Infinity
  let maxR = -Infinity
  let minC = Infinity
  let maxC = -Infinity
  for (const c of uniqueCells) {
    if (c.row < minR) minR = c.row
    if (c.row > maxR) maxR = c.row
    if (c.col < minC) minC = c.col
    if (c.col > maxC) maxC = c.col
  }
  const centerRow = (minR + maxR) / 2
  const centerCol = (minC + maxC) / 2

  const makeNode = (cell, dirFromParent) => {
    let hingePosition = [0, 0, 0]
    let axis = 'x'
    let sign = -1
    let panelOffset = [0, -thickness / 2, 0]
    let localCenterOffset = [0, 0, 0]

    if (dirFromParent === 'east') {
      hingePosition = [a / 2, 0, 0]
      axis = 'z'
      sign = 1
      panelOffset = [a / 2, -thickness / 2, 0]
      localCenterOffset = [a / 2, 0, 0]
    } else if (dirFromParent === 'west') {
      hingePosition = [-a / 2, 0, 0]
      axis = 'z'
      sign = -1
      panelOffset = [-a / 2, -thickness / 2, 0]
      localCenterOffset = [-a / 2, 0, 0]
    } else if (dirFromParent === 'south') {
      hingePosition = [0, 0, a / 2]
      axis = 'x'
      sign = -1
      panelOffset = [0, -thickness / 2, a / 2]
      localCenterOffset = [0, 0, a / 2]
    } else if (dirFromParent === 'north') {
      hingePosition = [0, 0, -a / 2]
      axis = 'x'
      sign = 1
      panelOffset = [0, -thickness / 2, -a / 2]
      localCenterOffset = [0, 0, -a / 2]
    }

    return {
      index: cell.index,
      row: cell.row,
      col: cell.col,
      faceId: cell.faceId,
      overlapping: cell.overlapping,
      dirFromParent,
      hingePosition,
      axis,
      sign,
      pinLength: a * 0.9,
      panelOffset,
      localCenterOffset,
      children: [],
    }
  }

  const rootNode = makeNode(rootCell, null)
  const visited = new Set([rootCell.key])
  const queue = [{ cell: rootCell, node: rootNode }]
  const neighborDirs = [
    ['east', 0, 1],
    ['west', 0, -1],
    ['south', 1, 0],
    ['north', -1, 0],
  ]

  while (queue.length > 0) {
    const { cell, node } = queue.shift()
    for (const [dirName, dr, dc] of neighborDirs) {
      const k = `${cell.row + dr},${cell.col + dc}`
      if (byKey.has(k) && !visited.has(k)) {
        visited.add(k)
        const childCell = byKey.get(k)
        const childNode = makeNode(childCell, dirName)
        node.children.push(childNode)
        queue.push({ cell: childCell, node: childNode })
      }
    }
  }

  return {
    a,
    thickness,
    rootPosition: [
      (rootCell.col - centerCol) * a,
      thickness,
      (rootCell.row - centerRow) * a,
    ],
    boundingSpan: Math.max((maxC - minC + 1) * a, (maxR - minR + 1) * a),
    validation,
    tree: rootNode,
    connectedCount: visited.size,
  }
}

/**
 * Evaluates world-space inner face centers and normals for any cube net hinge tree at `foldProgress`.
 */
export function evaluateCustomCubeNetState(
  cells,
  edgeLength,
  rootIndex,
  foldProgress,
) {
  const layout = buildCubeNetHingeTree(cells, edgeLength, rootIndex)
  if (!layout) return null

  const angle = foldProgressToRadians(foldProgress)
  const rootGroup = new THREE.Group()
  rootGroup.position.set(...layout.rootPosition)

  const panels = []
  const attach = (node, parentGroup, isRoot) => {
    let centerGroup = parentGroup
    if (!isRoot) {
      const hinge = new THREE.Group()
      hinge.position.set(...node.hingePosition)
      if (node.axis === 'x') {
        hinge.rotation.x = node.sign * angle
      } else {
        hinge.rotation.z = node.sign * angle
      }
      parentGroup.add(hinge)

      centerGroup = new THREE.Group()
      centerGroup.position.set(...node.localCenterOffset)
      hinge.add(centerGroup)
    }

    const panelProbe = new THREE.Group()
    panelProbe.position.set(0, 0, 0)
    centerGroup.add(panelProbe)
    panels.push({ node, probe: panelProbe })

    for (const child of node.children) {
      attach(child, centerGroup, false)
    }
  }

  attach(layout.tree, rootGroup, true)
  rootGroup.updateMatrixWorld(true)

  const normalMat = new THREE.Matrix3()
  const faces = panels.map(({ node, probe }) => {
    const center = new THREE.Vector3(0, 0, 0).applyMatrix4(probe.matrixWorld)
    const innerNormal = new THREE.Vector3(0, 1, 0)
      .applyMatrix3(normalMat.getNormalMatrix(probe.matrixWorld))
      .normalize()
    return {
      index: node.index,
      row: node.row,
      col: node.col,
      faceId: node.faceId,
      overlapping: node.overlapping,
      center,
      innerNormal,
      outerNormal: innerNormal.clone().negate(),
    }
  })

  return {
    layout,
    faces,
  }
}


