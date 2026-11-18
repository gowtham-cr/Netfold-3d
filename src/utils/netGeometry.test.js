import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { CUBE_NET_CATALOG } from './mathEngine.js'
import {
  CUBE_FACE_METADATA,
  buildCubeNetHingeTree,
  clampFoldProgress,
  createConeSectorGeometries,
  createCylinderWallGeometries,
  createFrustumWallGeometries,
  createRegularPolygonPlateGeometry,
  createTrianglePrismGeometry,
  evaluateConeNetState,
  evaluateCubeNetState,
  evaluateCuboidNetState,
  evaluateCustomCubeNetState,
  evaluateCylinderNetState,
  evaluateFrustumNetState,
  evaluateOctahedronNetState,
  evaluatePolygonPrismNetState,
  evaluatePolygonPyramidNetState,
  evaluateSquarePyramidNetState,
  foldProgressToRadians,
  getConeNetLayout,
  getCubeNetLayout,
  getCuboidNetLayout,
  getCylinderNetLayout,
  getFrustumNetLayout,
  getOctahedronNetLayout,
  getPolygonPrismNetLayout,
  getPolygonPyramidNetLayout,
  getSquarePyramidNetLayout,
  updateConeSectorGeometries,
  updateCylinderWallGeometries,
  updateFrustumWallGeometries,
} from './netGeometry.js'

function expectVec3Close(actual, expected, precision = 6) {
  expect(actual.x).toBeCloseTo(expected[0], precision)
  expect(actual.y).toBeCloseTo(expected[1], precision)
  expect(actual.z).toBeCloseTo(expected[2], precision)
}

describe('netGeometry helpers', () => {
  it('clamps fold progress between 0 and 100 and converts to [0, π/2]', () => {
    expect(clampFoldProgress(-20)).toBe(0)
    expect(clampFoldProgress(0)).toBe(0)
    expect(clampFoldProgress(50)).toBe(50)
    expect(clampFoldProgress(100)).toBe(100)
    expect(clampFoldProgress(150)).toBe(100)
    expect(clampFoldProgress(Number.NaN)).toBe(0)

    expect(foldProgressToRadians(0)).toBe(0)
    expect(foldProgressToRadians(50)).toBeCloseTo(Math.PI / 4, 10)
    expect(foldProgressToRadians(100)).toBeCloseTo(Math.PI / 2, 10)
  })

  it('defines 6 distinct faces with unique colors and identifiers', () => {
    expect(CUBE_FACE_METADATA).toHaveLength(6)
    const ids = new Set(CUBE_FACE_METADATA.map((face) => face.id))
    const colors = new Set(CUBE_FACE_METADATA.map((face) => face.color))
    expect(ids.size).toBe(6)
    expect(colors.size).toBe(6)
  })
})

describe('evaluateCubeNetState at 0%, 50%, and 100%', () => {
  const edgeLength = 4
  const { thickness, rootPosition } = getCubeNetLayout(edgeLength)
  const zRoot = rootPosition[2]

  it('forms a flat connected cross net on a single plane at 0% folding', () => {
    const state = evaluateCubeNetState(edgeLength, 0)

    for (const face of Object.values(state)) {
      expectVec3Close(face.innerNormal, [0, 1, 0])
      expect(face.center.y).toBeCloseTo(thickness, 6)
    }

    expectVec3Close(state.bottom.center, [0, thickness, zRoot])
    expectVec3Close(state.front.center, [0, thickness, zRoot + 4])
    expectVec3Close(state.back.center, [0, thickness, zRoot - 4])
    expectVec3Close(state.top.center, [0, thickness, zRoot - 8])
    expectVec3Close(state.left.center, [-4, thickness, zRoot])
    expectVec3Close(state.right.center, [4, thickness, zRoot])

    const centers = Object.values(state).map((f) => f.center)
    for (let i = 0; i < centers.length; i += 1) {
      for (let j = i + 1; j < centers.length; j += 1) {
        expect(centers[i].distanceTo(centers[j])).toBeGreaterThanOrEqual(
          edgeLength - 1e-6,
        )
      }
    }
  })

  it('maintains shared-edge hinge continuity at 50% intermediate folding', () => {
    const state = evaluateCubeNetState(edgeLength, 50)
    const invSqrt2 = Math.SQRT1_2

    expectVec3Close(state.bottom.innerNormal, [0, 1, 0])
    expectVec3Close(state.front.innerNormal, [0, invSqrt2, -invSqrt2])
    expectVec3Close(state.back.innerNormal, [0, invSqrt2, invSqrt2])
    expectVec3Close(state.left.innerNormal, [invSqrt2, invSqrt2, 0])
    expectVec3Close(state.right.innerNormal, [-invSqrt2, invSqrt2, 0])
    expectVec3Close(state.top.innerNormal, [0, 0, 1])

    expect(state.bottom.corners[3].distanceTo(state.front.corners[0])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[2].distanceTo(state.front.corners[1])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[0].distanceTo(state.back.corners[3])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[1].distanceTo(state.back.corners[2])).toBeCloseTo(0, 6)
    expect(state.back.corners[0].distanceTo(state.top.corners[3])).toBeCloseTo(0, 6)
    expect(state.back.corners[1].distanceTo(state.top.corners[2])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[0].distanceTo(state.left.corners[1])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[3].distanceTo(state.left.corners[2])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[1].distanceTo(state.right.corners[0])).toBeCloseTo(0, 6)
    expect(state.bottom.corners[2].distanceTo(state.right.corners[3])).toBeCloseTo(0, 6)
  })

  it('forms a watertight closed 3D cube at 100% folding with exact outward normals', () => {
    const state = evaluateCubeNetState(edgeLength, 100)
    const half = edgeLength / 2

    expectVec3Close(state.bottom.center, [0, thickness, zRoot])
    expectVec3Close(state.top.center, [0, thickness + edgeLength, zRoot])
    expectVec3Close(state.front.center, [0, thickness + half, zRoot + half])
    expectVec3Close(state.back.center, [0, thickness + half, zRoot - half])
    expectVec3Close(state.left.center, [-half, thickness + half, zRoot])
    expectVec3Close(state.right.center, [half, thickness + half, zRoot])

    expectVec3Close(state.bottom.outerNormal, [0, -1, 0])
    expectVec3Close(state.top.outerNormal, [0, 1, 0])
    expectVec3Close(state.front.outerNormal, [0, 0, 1])
    expectVec3Close(state.back.outerNormal, [0, 0, -1])
    expectVec3Close(state.left.outerNormal, [-1, 0, 0])
    expectVec3Close(state.right.outerNormal, [1, 0, 0])

    const topCorners = state.top.corners
    const expectedTopBox = [
      new THREE.Vector3(-half, thickness + edgeLength, zRoot + half),
      new THREE.Vector3(half, thickness + edgeLength, zRoot + half),
      new THREE.Vector3(half, thickness + edgeLength, zRoot - half),
      new THREE.Vector3(-half, thickness + edgeLength, zRoot - half),
    ]
    for (const target of expectedTopBox) {
      const minDistance = Math.min(
        ...topCorners.map((corner) => corner.distanceTo(target)),
      )
      expect(minDistance).toBeCloseTo(0, 6)
    }
  })
})

describe('evaluateCuboidNetState at 0%, 50%, and 100%', () => {
  const dims = { l: 10, b: 6, h: 4 }
  const { thickness, rootPosition } = getCuboidNetLayout(dims.l, dims.b, dims.h)
  const zRoot = rootPosition[2]

  it('forms a flat connected 6-face rectangular net at 0% folding', () => {
    const state = evaluateCuboidNetState(dims, 0)

    for (const face of Object.values(state)) {
      expectVec3Close(face.innerNormal, [0, 1, 0])
      expect(face.center.y).toBeCloseTo(thickness, 6)
    }

    expectVec3Close(state.bottom.center, [0, thickness, zRoot])
    expectVec3Close(state.front.center, [0, thickness, zRoot + 5]) // b/2 + h/2 = 3 + 2
    expectVec3Close(state.back.center, [0, thickness, zRoot - 5])
    expectVec3Close(state.top.center, [0, thickness, zRoot - 10]) // -b/2 - h - b/2 = -3 - 4 - 3
    expectVec3Close(state.left.center, [-7, thickness, zRoot]) // -l/2 - h/2 = -5 - 2
    expectVec3Close(state.right.center, [7, thickness, zRoot])

    // Exact rectangular face dimensions
    expect(state.bottom.width).toBe(10)
    expect(state.bottom.depth).toBe(6)
    expect(state.front.width).toBe(10)
    expect(state.front.depth).toBe(4)
    expect(state.left.width).toBe(4)
    expect(state.left.depth).toBe(6)
  })

  it('preserves shared hinge edges at 50% and keeps Top above Front across intermediate angles', () => {
    const state50 = evaluateCuboidNetState(dims, 50)

    expect(state50.bottom.corners[3].distanceTo(state50.front.corners[0])).toBeCloseTo(0, 6)
    expect(state50.bottom.corners[2].distanceTo(state50.front.corners[1])).toBeCloseTo(0, 6)
    expect(state50.bottom.corners[0].distanceTo(state50.back.corners[3])).toBeCloseTo(0, 6)
    expect(state50.bottom.corners[1].distanceTo(state50.back.corners[2])).toBeCloseTo(0, 6)
    expect(state50.back.corners[0].distanceTo(state50.top.corners[3])).toBeCloseTo(0, 6)
    expect(state50.back.corners[1].distanceTo(state50.top.corners[2])).toBeCloseTo(0, 6)
    expect(state50.bottom.corners[0].distanceTo(state50.left.corners[1])).toBeCloseTo(0, 6)
    expect(state50.bottom.corners[1].distanceTo(state50.right.corners[0])).toBeCloseTo(0, 6)

    // Verify no collision across extreme cuboid aspect ratios from 1% to 99%
    for (const testDims of [dims, { l: 8, b: 9, h: 2 }, { l: 2, b: 2, h: 9 }]) {
      for (let pct = 5; pct <= 95; pct += 10) {
        const s = evaluateCuboidNetState(testDims, pct)
        const topTipY = Math.min(s.top.corners[0].y, s.top.corners[1].y)
        const frontTopY = Math.max(s.front.corners[2].y, s.front.corners[3].y)
        expect(topTipY).toBeGreaterThan(frontTopY - 1e-6)
      }
    }
  })

  it('closes into an exact l × b × h cuboid at 100% folding', () => {
    const state = evaluateCuboidNetState(dims, 100)

    expectVec3Close(state.bottom.center, [0, thickness, zRoot])
    expectVec3Close(state.top.center, [0, thickness + 4, zRoot])
    expectVec3Close(state.front.center, [0, thickness + 2, zRoot + 3])
    expectVec3Close(state.back.center, [0, thickness + 2, zRoot - 3])
    expectVec3Close(state.left.center, [-5, thickness + 2, zRoot])
    expectVec3Close(state.right.center, [5, thickness + 2, zRoot])

    expectVec3Close(state.bottom.outerNormal, [0, -1, 0])
    expectVec3Close(state.top.outerNormal, [0, 1, 0])
    expectVec3Close(state.front.outerNormal, [0, 0, 1])
    expectVec3Close(state.back.outerNormal, [0, 0, -1])
    expectVec3Close(state.left.outerNormal, [-1, 0, 0])
    expectVec3Close(state.right.outerNormal, [1, 0, 0])
  })
})

describe('evaluateCylinderNetState and wall buffers at 0%, 50%, and 100%', () => {
  const dims = { r: 3, h: 5 }
  const { thickness, rootPosition, circumference } = getCylinderNetLayout(
    dims.r,
    dims.h,
  )
  const zRoot = rootPosition[2]

  it('lies flat as 1 rectangle (2πr × h) and 2 tangent circles at 0% folding', () => {
    const state = evaluateCylinderNetState(dims, 0)

    expectVec3Close(state.bottomCap.innerNormal, [0, 1, 0])
    expectVec3Close(state.topCap.innerNormal, [0, 1, 0])
    expectVec3Close(state.bottomCap.center, [0, thickness, zRoot])
    expectVec3Close(state.topCap.center, [0, thickness, zRoot - 2 * 3 - 5])

    // Rectangle spans x ∈ [-πr, +πr] and z ∈ [zRoot - r - h, zRoot - r]
    expectVec3Close(state.wall.leftBottom.position, [
      -circumference / 2,
      thickness,
      zRoot - 3,
    ])
    expectVec3Close(state.wall.centerBottom.position, [0, thickness, zRoot - 3])
    expectVec3Close(state.wall.rightBottom.position, [
      circumference / 2,
      thickness,
      zRoot - 3,
    ])
    expectVec3Close(state.wall.centerTop.position, [0, thickness, zRoot - 8])
  })

  it('bends smoothly with preserved arc length and zero floor clipping at 50%', () => {
    const state = evaluateCylinderNetState(dims, 50)

    // Bottom cap stays anchored; wall midpoint connects cleanly
    expectVec3Close(state.bottomCap.center, [0, thickness, zRoot])
    expectVec3Close(state.wall.centerBottom.position, [0, thickness, zRoot - 3])

    // Every point on the curved wall stays on or above the floor plane y = thickness
    for (const sample of state.wall.arcSamples) {
      expect(sample.bottom.position.y).toBeGreaterThanOrEqual(thickness - 1e-6)
      expect(sample.top.position.y).toBeGreaterThanOrEqual(thickness - 1e-6)
    }

    // Arc length along the curved sheet equals 2πr
    let arcLength = 0
    for (let i = 1; i < state.wall.arcSamples.length; i += 1) {
      arcLength += state.wall.arcSamples[i].bottom.position.distanceTo(
        state.wall.arcSamples[i - 1].bottom.position,
      )
    }
    expect(arcLength).toBeCloseTo(circumference, 1)
  })

  it('closes into an exact right circular cylinder of radius r and height h at 100%', () => {
    const state = evaluateCylinderNetState(dims, 100)

    expectVec3Close(state.bottomCap.center, [0, thickness, zRoot])
    expectVec3Close(state.bottomCap.outerNormal, [0, -1, 0])
    expectVec3Close(state.topCap.center, [0, thickness + dims.h, zRoot])
    expectVec3Close(state.topCap.outerNormal, [0, 1, 0])

    // Every sample sits on the exact cylinder radius r around axis (0, y, zRoot)
    for (const sample of state.wall.arcSamples) {
      const dx = sample.bottom.position.x
      const dz = sample.bottom.position.z - zRoot
      expect(Math.hypot(dx, dz)).toBeCloseTo(dims.r, 6)
      expect(sample.bottom.position.y).toBeCloseTo(thickness, 6)
      expect(sample.top.position.y).toBeCloseTo(thickness + dims.h, 6)
    }

    // Opposite vertical edges s = -πr and s = +πr meet seamlessly at (0, y, zRoot + r)
    expect(
      state.wall.leftBottom.position.distanceTo(state.wall.rightBottom.position),
    ).toBeCloseTo(0, 6)
    expect(
      state.wall.leftTop.position.distanceTo(state.wall.rightTop.position),
    ).toBeCloseTo(0, 6)
    expectVec3Close(state.wall.leftBottom.position, [0, thickness, zRoot + dims.r])
  })

  it('updates BufferGeometry vertices and unit normals cleanly without NaNs', () => {
    const segments = 64
    const { wallGeometry, borderGeometry } = createCylinderWallGeometries(segments)

    for (const pct of [0, 50, 100]) {
      updateCylinderWallGeometries(
        wallGeometry,
        borderGeometry,
        dims.r,
        dims.h,
        thickness,
        pct,
        segments,
      )

      const pos = wallGeometry.getAttribute('position').array
      const norm = wallGeometry.getAttribute('normal').array
      const borderPos = borderGeometry.getAttribute('position').array

      for (let i = 0; i < pos.length; i += 1) {
        expect(Number.isFinite(pos[i])).toBe(true)
        expect(Number.isFinite(norm[i])).toBe(true)
      }
      for (let i = 0; i < borderPos.length; i += 1) {
        expect(Number.isFinite(borderPos[i])).toBe(true)
      }

      // Check left & right inner seam positions match at 100%
      if (pct === 100) {
        const leftX = pos[0]
        const leftY = pos[1]
        const rightIdx = segments * 3
        expect(leftX).toBeCloseTo(pos[rightIdx], 6)
        expect(leftY).toBeCloseTo(pos[rightIdx + 1], 6)
      }
    }

    wallGeometry.dispose()
    borderGeometry.dispose()
  })
})

describe('evaluateSquarePyramidNetState at 0%, 50%, and 100%', () => {
  const dims = { a: 6, h: 4 }
  const { slantHeight, thickness } = getSquarePyramidNetLayout(dims.a, dims.h)

  it('computes exact slant height s = 5 and flat star net at 0% folding', () => {
    expect(slantHeight).toBe(5)
    const state = evaluateSquarePyramidNetState(dims, 0)

    expectVec3Close(state.bottom.innerNormal, [0, 1, 0])
    expect(state.bottom.center.y).toBeCloseTo(thickness, 6)

    for (const side of ['front', 'right', 'back', 'left']) {
      expectVec3Close(state[side].innerNormal, [0, 1, 0])
      expect(state[side].apex.y).toBeCloseTo(thickness, 6)
    }

    expectVec3Close(state.front.apex, [0, thickness, 8]) // a/2 + s = 3 + 5
    expectVec3Close(state.back.apex, [0, thickness, -8])
    expectVec3Close(state.right.apex, [8, thickness, 0])
    expectVec3Close(state.left.apex, [-8, thickness, 0])
  })

  it('keeps triangular base edges pinned at 50% intermediate folding', () => {
    const state = evaluateSquarePyramidNetState(dims, 50)

    // Front baseLeft -> bottom corner 3 (-3, y, +3), baseRight -> bottom corner 2 (+3, y, +3)
    expect(state.front.baseLeft.distanceTo(state.bottom.corners[3])).toBeCloseTo(0, 6)
    expect(state.front.baseRight.distanceTo(state.bottom.corners[2])).toBeCloseTo(0, 6)
    // Back baseLeft -> corner 1 (+3, y, -3), baseRight -> corner 0 (-3, y, -3)
    expect(state.back.baseLeft.distanceTo(state.bottom.corners[1])).toBeCloseTo(0, 6)
    expect(state.back.baseRight.distanceTo(state.bottom.corners[0])).toBeCloseTo(0, 6)
    // Right baseLeft -> corner 2 (+3, y, +3), baseRight -> corner 1 (+3, y, -3)
    expect(state.right.baseLeft.distanceTo(state.bottom.corners[2])).toBeCloseTo(0, 6)
    expect(state.right.baseRight.distanceTo(state.bottom.corners[1])).toBeCloseTo(0, 6)
    // Left baseLeft -> corner 0 (-3, y, -3), baseRight -> corner 3 (-3, y, +3)
    expect(state.left.baseLeft.distanceTo(state.bottom.corners[0])).toBeCloseTo(0, 6)
    expect(state.left.baseRight.distanceTo(state.bottom.corners[3])).toBeCloseTo(0, 6)

    for (const side of ['front', 'right', 'back', 'left']) {
      expect(state[side].apex.y).toBeGreaterThan(thickness)
    }
  })

  it('converges all four triangular apexes cleanly at (0, thickness + h, 0) at 100%', () => {
    const state = evaluateSquarePyramidNetState(dims, 100)
    const expectedApex = [0, thickness + dims.h, 0]

    for (const side of ['front', 'right', 'back', 'left']) {
      expectVec3Close(state[side].apex, expectedApex, 6)
    }

    // Triangle prism BufferGeometry initializes cleanly
    const geo = createTrianglePrismGeometry(dims.a, slantHeight, thickness)
    expect(geo.getAttribute('position').count).toBe(24)
    geo.dispose()
  })
})

describe('evaluateConeNetState and sector buffers at 0%, 50%, and 100%', () => {
  const dims = { r: 3, h: 4 }
  const { slantHeight, sectorAngle, thickness, rootPosition } = getConeNetLayout(
    dims.r,
    dims.h,
  )
  const zRoot = rootPosition[2]

  it('lies flat as base circle + tangent sector of radius l and arc 2πr at 0%', () => {
    expect(slantHeight).toBe(5)
    expect(sectorAngle).toBeCloseTo((2 * Math.PI * 3) / 5, 10)

    const state = evaluateConeNetState(dims, 0)
    expectVec3Close(state.bottomCap.center, [0, thickness, zRoot])
    expectVec3Close(state.apex, [0, thickness, zRoot - dims.r - slantHeight])

    // Every rim sample sits at y = thickness and distance l from apex
    let arcLength = 0
    for (let i = 0; i < state.rimSamples.length; i += 1) {
      const sample = state.rimSamples[i]
      expect(sample.position.y).toBeCloseTo(thickness, 6)
      expect(sample.position.distanceTo(state.apex)).toBeCloseTo(slantHeight, 6)
      if (i > 0) {
        arcLength += sample.position.distanceTo(state.rimSamples[i - 1].position)
      }
    }
    expect(arcLength).toBeCloseTo(2 * Math.PI * dims.r, 1)
  })

  it('curls without dipping below base plane and keeps rim tangent pinned at 50%', () => {
    const state = evaluateConeNetState(dims, 50)
    const midRim = state.rimSamples[Math.floor(state.rimSamples.length / 2)]
    expectVec3Close(midRim.position, [0, thickness, zRoot - dims.r])

    for (const sample of state.rimSamples) {
      expect(sample.position.y).toBeGreaterThanOrEqual(thickness - 1e-6)
      expect(sample.position.distanceTo(state.apex)).toBeCloseTo(slantHeight, 5)
    }
  })

  it('closes into an exact cone with apex (0, thickness + h, zRoot) and radius r at 100%', () => {
    const state = evaluateConeNetState(dims, 100)
    expectVec3Close(state.apex, [0, thickness + dims.h, zRoot])

    for (const sample of state.rimSamples) {
      expect(sample.position.y).toBeCloseTo(thickness, 6)
      const radialDist = Math.hypot(
        sample.position.x,
        sample.position.z - zRoot,
      )
      expect(radialDist).toBeCloseTo(dims.r, 6)
    }

    const firstRim = state.rimSamples[0].position
    const lastRim = state.rimSamples[state.rimSamples.length - 1].position
    expect(firstRim.distanceTo(lastRim)).toBeCloseTo(0, 6)
    expectVec3Close(firstRim, [0, thickness, zRoot + dims.r])
  })

  it('updates Cone BufferGeometry vertices and normals cleanly without NaNs', () => {
    const arcSegments = 48
    const radialSegments = 6
    const { sectorGeometry, borderGeometry } = createConeSectorGeometries(
      arcSegments,
      radialSegments,
    )

    for (const pct of [0, 50, 100]) {
      updateConeSectorGeometries(
        sectorGeometry,
        borderGeometry,
        dims.r,
        dims.h,
        thickness,
        pct,
        arcSegments,
        radialSegments,
      )

      const pos = sectorGeometry.getAttribute('position').array
      const norm = sectorGeometry.getAttribute('normal').array
      const borderPos = borderGeometry.getAttribute('position').array

      for (let i = 0; i < pos.length; i += 1) {
        expect(Number.isFinite(pos[i])).toBe(true)
        expect(Number.isFinite(norm[i])).toBe(true)
      }
      for (let i = 0; i < borderPos.length; i += 1) {
        expect(Number.isFinite(borderPos[i])).toBe(true)
      }
    }

    sectorGeometry.dispose()
    borderGeometry.dispose()
  })
})

describe('evaluatePolygonPrismNetState for Triangular, Pentagonal, Hexagonal Prisms', () => {
  it.each([3, 5, 6])(
    'folds %i-sided prism cleanly from 0%% flat net to 100%% closed solid',
    (sides) => {
      const dims = { a: 4, h: 5 }
      const { thickness, rootPosition } = getPolygonPrismNetLayout(
        sides,
        dims.a,
        dims.h,
      )
      const zRoot = rootPosition[2]

      const flat = evaluatePolygonPrismNetState(sides, dims, 0)
      expectVec3Close(flat.bottom.innerNormal, [0, 1, 0])
      expectVec3Close(flat.top.innerNormal, [0, 1, 0])
      expect(flat.top.center.y).toBeCloseTo(thickness, 6)
      for (const side of Object.values(flat.sides)) {
        expectVec3Close(side.innerNormal, [0, 1, 0])
        expect(side.center.y).toBeCloseTo(thickness, 6)
      }

      const mid = evaluatePolygonPrismNetState(sides, dims, 50)
      for (const side of Object.values(mid.sides)) {
        expect(side.farLeft.y).toBeGreaterThan(thickness)
      }

      const closed = evaluatePolygonPrismNetState(sides, dims, 100)
      expectVec3Close(closed.bottom.center, [0, thickness, zRoot])
      expectVec3Close(closed.top.center, [0, thickness + dims.h, zRoot])
      expectVec3Close(closed.top.outerNormal, [0, 1, 0])

      const plate = createRegularPolygonPlateGeometry(sides, dims.a, thickness)
      expect(plate.getAttribute('position').count).toBe(sides * 12)
      plate.dispose()
    },
  )
})

describe('evaluatePolygonPyramidNetState for Triangular, Pentagonal, Hexagonal Pyramids', () => {
  it.each([3, 5, 6])(
    'folds %i-sided pyramid net cleanly so all lateral apexes converge at (0, thickness + h, 0)',
    (sides) => {
      const dims = { a: 4, h: 5 }
      const { thickness, slantHeight } = getPolygonPyramidNetLayout(
        sides,
        dims.a,
        dims.h,
      )
      expect(slantHeight).toBeGreaterThan(dims.h)

      const flat = evaluatePolygonPyramidNetState(sides, dims, 0)
      for (const side of Object.values(flat.sides)) {
        expect(side.apex.y).toBeCloseTo(thickness, 6)
      }

      const closed = evaluatePolygonPyramidNetState(sides, dims, 100)
      for (const side of Object.values(closed.sides)) {
        expectVec3Close(side.apex, [0, thickness + dims.h, 0], 5)
      }
    },
  )
})

describe('evaluateOctahedronNetState at 0%, 50%, and 100%', () => {
  it('folds all 8 equilateral triangles into a closed regular octahedron', () => {
    const a = 6
    const { solidHeight, thickness } = getOctahedronNetLayout(a)

    const flat = evaluateOctahedronNetState(a, 0)
    expectVec3Close(flat.top.innerNormal, [0, 1, 0])
    expect(flat.top.vApex.y).toBeCloseTo(thickness, 6)
    for (const tri of [...flat.lower, ...flat.upper]) {
      expectVec3Close(tri.innerNormal, [0, 1, 0])
      expect(tri.vApex.y).toBeCloseTo(thickness, 6)
    }

    const closed = evaluateOctahedronNetState(a, 100)
    const topY = thickness + solidHeight
    // Top face vertices must all sit horizontally at exact topY
    expect(closed.top.vLeft.y).toBeCloseTo(topY, 5)
    expect(closed.top.vRight.y).toBeCloseTo(topY, 5)
    expect(closed.top.vApex.y).toBeCloseTo(topY, 5)

    // Upper ring apexes meet at topY
    for (const ut of closed.upper) {
      expect(ut.vApex.y).toBeCloseTo(topY, 5)
    }
  })
})

describe('evaluateFrustumNetState and wall buffers at 0%, 50%, and 100%', () => {
  it.each([
    { r1: 6, r2: 3, h: 4 },
    { r1: 4, r2: 4, h: 4 },
    { r1: 3, r2: 6, h: 4 },
  ])(
    'folds frustum (r1=$r1, r2=$r2, h=$h) cleanly from flat net to closed solid',
    (dims) => {
      const { thickness, rootPosition } = getFrustumNetLayout(
        dims.r1,
        dims.r2,
        dims.h,
      )
      const zRoot = rootPosition[2]

      const flat = evaluateFrustumNetState(dims, 0)
      for (const pt of [...flat.bottomSamples, ...flat.topSamples]) {
        expect(pt.y).toBeCloseTo(thickness, 5)
      }

      const closed = evaluateFrustumNetState(dims, 100)
      expectVec3Close(closed.topCapCenter, [0, thickness + dims.h, zRoot], 5)
      for (const pt of closed.bottomSamples) {
        expect(pt.y).toBeCloseTo(thickness, 5)
        expect(Math.hypot(pt.x, pt.z - zRoot)).toBeCloseTo(dims.r1, 5)
      }
      for (const pt of closed.topSamples) {
        expect(pt.y).toBeCloseTo(thickness + dims.h, 5)
        expect(Math.hypot(pt.x, pt.z - zRoot)).toBeCloseTo(dims.r2, 5)
      }

      const { wallGeometry, borderGeometry } = createFrustumWallGeometries(
        32,
        4,
      )
      for (const pct of [0, 50, 100]) {
        updateFrustumWallGeometries(
          wallGeometry,
          borderGeometry,
          dims.r1,
          dims.r2,
          dims.h,
          thickness,
          pct,
          32,
          4,
        )
        const pos = wallGeometry.getAttribute('position').array
        const norm = wallGeometry.getAttribute('normal').array
        for (let i = 0; i < pos.length; i += 1) {
          expect(Number.isFinite(pos[i])).toBe(true)
          expect(Number.isFinite(norm[i])).toBe(true)
        }
      }
      wallGeometry.dispose()
      borderGeometry.dispose()
    },
  )
})

describe('Tier 2: 3D hinge-tree folding for all 11 cube nets', () => {
  it.each(CUBE_NET_CATALOG)(
    'folds $id ($family) cleanly from 0% flat sheet to closed 3D cube at 100%',
    (net) => {
      const a = 3
      const treeLayout = buildCubeNetHingeTree(net.cells, a, net.rootIndex)
      expect(treeLayout).not.toBeNull()
      expect(treeLayout.connectedCount).toBe(6)
      expect(treeLayout.validation.valid).toBe(true)

      const flat = evaluateCustomCubeNetState(net.cells, a, net.rootIndex, 0)
      expect(flat.faces).toHaveLength(6)
      for (const f of flat.faces) {
        expect(f.center.y).toBeCloseTo(treeLayout.thickness, 5)
        expectVec3Close(f.innerNormal, [0, 1, 0], 5)
      }

      const closed = evaluateCustomCubeNetState(
        net.cells,
        a,
        net.rootIndex,
        100,
      )
      expect(closed.faces).toHaveLength(6)

      // All 6 face centers must be distinct and match orthogonal faces of cube [a, a, a]
      const normalKeys = new Set(
        closed.faces.map(
          (f) =>
            `${Math.round(f.innerNormal.x)},${Math.round(f.innerNormal.y)},${Math.round(f.innerNormal.z)}`,
        ),
      )
      expect(normalKeys).toEqual(
        new Set(['0,1,0', '0,-1,0', '0,0,1', '0,0,-1', '1,0,0', '-1,0,0']),
      )

      for (let i = 0; i < closed.faces.length; i += 1) {
        for (let j = i + 1; j < closed.faces.length; j += 1) {
          expect(closed.faces[i].center.distanceTo(closed.faces[j].center)).toBeGreaterThan(
            1,
          )
        }
      }
    },
  )
})
