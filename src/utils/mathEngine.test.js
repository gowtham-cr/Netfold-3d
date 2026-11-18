import { describe, expect, it } from 'vitest'
import {
  BEYOND_CLASS_8_GROUPS,
  BEYOND_CLASS_8_SHAPES,
  CLASS_10_PRACTICE_IDS,
  CLASS_8_SHAPES,
  CUBE_NET_CATALOG,
  LARGE_METRE_THRESHOLD,
  MAX_DIMENSION,
  MAX_SCALE_FACTOR,
  MIN_DIMENSION,
  MIN_SCALE_FACTOR,
  NET_CHECKER_PUZZLES,
  SHAPES,
  calculateClass10PracticeSolutions,
  calculateCone,
  calculateCube,
  calculateCuboid,
  calculateCylinder,
  calculateFaceBreakdown,
  calculateFrustum,
  calculateHemisphere,
  calculateHexagonalPrism,
  calculateHexagonalPyramid,
  calculateOctahedron,
  calculatePentagonalPrism,
  calculatePentagonalPyramid,
  calculateScaleEnlargement,
  calculateShape,
  calculateSphere,
  calculateSquarePyramid,
  calculateTriangularPrism,
  calculateTriangularPyramid,
  isBeyondClass8Shape,
  shouldShowUnitHint,
  validateCubeNet,
  validateDimension,
} from './mathEngine.js'

describe('mathEngine constants and dimension validation', () => {
  it('exposes the expected dimension bounds and all 15 shape constants', () => {
    expect(MIN_DIMENSION).toBe(1)
    expect(MAX_DIMENSION).toBe(10)
    expect(Object.values(SHAPES)).toHaveLength(15)
    expect(CLASS_8_SHAPES).toEqual(['cube', 'cuboid', 'cylinder'])
    expect(BEYOND_CLASS_8_SHAPES).toHaveLength(12)
    expect(
      BEYOND_CLASS_8_GROUPS.prisms.length +
        BEYOND_CLASS_8_GROUPS.pyramids.length +
        BEYOND_CLASS_8_GROUPS.curvedAndPlatonic.length,
    ).toBe(12)
    expect(isBeyondClass8Shape('cube')).toBe(false)
    expect(isBeyondClass8Shape('cone')).toBe(true)
    expect(isBeyondClass8Shape('octahedron')).toBe(true)
  })

  it('accepts boundary and in-range dimensions', () => {
    expect(validateDimension(1, 'a')).toBe(1)
    expect(validateDimension(10, 'a')).toBe(10)
    expect(validateDimension(3.5, 'r')).toBe(3.5)
  })

  it.each([
    ['undefined', undefined, TypeError],
    ['null', null, TypeError],
    ['string number', '5', TypeError],
    ['empty string', '', TypeError],
    ['boolean true', true, TypeError],
    ['boolean false', false, TypeError],
    ['object', {}, TypeError],
    ['array', [5], TypeError],
    ['NaN', Number.NaN, TypeError],
    ['Infinity', Number.POSITIVE_INFINITY, TypeError],
    ['-Infinity', Number.NEGATIVE_INFINITY, TypeError],
    ['zero', 0, RangeError],
    ['negative zero', -0, RangeError],
    ['negative integer', -3, RangeError],
    ['negative decimal', -0.5, RangeError],
    ['positive below min (0.5)', 0.5, RangeError],
    ['just below min (0.999)', 0.999, RangeError],
    ['just above max (10.001)', 10.001, RangeError],
    ['above max (11)', 11, RangeError],
  ])('rejects invalid dimension (%s)', (_label, value, ErrorClass) => {
    expect(() => validateDimension(value, 'side')).toThrow(ErrorClass)
  })
})

describe('calculateCube', () => {
  it('calculates exact LSA, TSA, and Volume for a = 5', () => {
    const result = calculateCube(5)

    expect(result).toEqual({
      shape: 'cube',
      dimensions: { a: 5 },
      lsa: 100,
      tsa: 150,
      volume: 125,
    })
  })

  it('handles lower boundary a = 1 and upper boundary a = 10', () => {
    expect(calculateCube(1)).toEqual({
      shape: 'cube',
      dimensions: { a: 1 },
      lsa: 4,
      tsa: 6,
      volume: 1,
    })

    expect(calculateCube(10)).toEqual({
      shape: 'cube',
      dimensions: { a: 10 },
      lsa: 400,
      tsa: 600,
      volume: 1000,
    })
  })

  it('handles valid decimal dimensions between 1 and 10', () => {
    const result = calculateCube(2.5)

    expect(result.shape).toBe('cube')
    expect(result.dimensions).toEqual({ a: 2.5 })
    expect(result.lsa).toBeCloseTo(25, 10)
    expect(result.tsa).toBeCloseTo(37.5, 10)
    expect(result.volume).toBeCloseTo(15.625, 10)
  })

  it('rejects missing, non-numeric, zero, negative, and out-of-range inputs', () => {
    expect(() => calculateCube()).toThrow(TypeError)
    expect(() => calculateCube(null)).toThrow(TypeError)
    expect(() => calculateCube('5')).toThrow(TypeError)
    expect(() => calculateCube(Number.NaN)).toThrow(TypeError)
    expect(() => calculateCube(0)).toThrow(RangeError)
    expect(() => calculateCube(-4)).toThrow(RangeError)
    expect(() => calculateCube(0.99)).toThrow(RangeError)
    expect(() => calculateCube(10.01)).toThrow(RangeError)
  })
})

describe('calculateCuboid', () => {
  it('calculates exact LSA = 2h(l+b), TSA = 2(lb+bh+hl), and Volume for l=10, b=6, h=4', () => {
    const result = calculateCuboid(10, 6, 4)

    expect(result).toEqual({
      shape: 'cuboid',
      dimensions: { l: 10, b: 6, h: 4 },
      lsa: 128,
      tsa: 248,
      volume: 240,
    })
  })

  it('uses height h specifically in LSA = 2h(l+b) rather than swapping axes', () => {
    const result = calculateCuboid(2, 3, 5)

    expect(result.lsa).toBe(50)
    expect(result.tsa).toBe(62)
    expect(result.volume).toBe(30)
  })

  it('handles lower and upper boundary dimensions', () => {
    expect(calculateCuboid(1, 1, 1)).toEqual({
      shape: 'cuboid',
      dimensions: { l: 1, b: 1, h: 1 },
      lsa: 4,
      tsa: 6,
      volume: 1,
    })

    expect(calculateCuboid(10, 10, 10)).toEqual({
      shape: 'cuboid',
      dimensions: { l: 10, b: 10, h: 10 },
      lsa: 400,
      tsa: 600,
      volume: 1000,
    })
  })

  it('matches cube outputs when all cuboid dimensions are equal', () => {
    for (let side = 1; side <= 10; side += 1) {
      const cube = calculateCube(side)
      const cuboid = calculateCuboid(side, side, side)

      expect(cuboid.lsa).toBe(cube.lsa)
      expect(cuboid.tsa).toBe(cube.tsa)
      expect(cuboid.volume).toBe(cube.volume)
    }
  })

  it('rejects missing, invalid, zero, negative, and out-of-range dimensions in any position', () => {
    expect(() => calculateCuboid(10, 6)).toThrow(TypeError)
    expect(() => calculateCuboid(10, undefined, 4)).toThrow(TypeError)
    expect(() => calculateCuboid(undefined, 6, 4)).toThrow(TypeError)
    expect(() => calculateCuboid('10', 6, 4)).toThrow(TypeError)
    expect(() => calculateCuboid(10, Number.NaN, 4)).toThrow(TypeError)
    expect(() => calculateCuboid(0, 6, 4)).toThrow(RangeError)
    expect(() => calculateCuboid(10, 0, 4)).toThrow(RangeError)
    expect(() => calculateCuboid(10, 6, 0)).toThrow(RangeError)
    expect(() => calculateCuboid(-1, 6, 4)).toThrow(RangeError)
    expect(() => calculateCuboid(10, -2, 4)).toThrow(RangeError)
    expect(() => calculateCuboid(10, 6, -3)).toThrow(RangeError)
    expect(() => calculateCuboid(0.5, 6, 4)).toThrow(RangeError)
    expect(() => calculateCuboid(10, 11, 4)).toThrow(RangeError)
    expect(() => calculateCuboid(10, 6, 10.5)).toThrow(RangeError)
  })
})

describe('calculateCylinder', () => {
  it('calculates exact Math.PI values for r = 3, h = 5 (LSA=30π, TSA=48π, Volume=45π)', () => {
    const result = calculateCylinder(3, 5)

    expect(result.shape).toBe('cylinder')
    expect(result.dimensions).toEqual({ r: 3, h: 5 })
    expect(result.lsa).toBeCloseTo(30 * Math.PI, 12)
    expect(result.tsa).toBeCloseTo(48 * Math.PI, 12)
    expect(result.volume).toBeCloseTo(45 * Math.PI, 12)
    expect(result.lsa).toBe(30 * Math.PI)
    expect(result.tsa).toBe(48 * Math.PI)
    expect(result.volume).toBe(45 * Math.PI)
    expect(result.piCoefficients).toEqual({
      lsa: 30,
      tsa: 48,
      volume: 45,
    })
  })

  it('handles lower boundary (r=1, h=1) and upper boundary (r=10, h=10)', () => {
    const minCyl = calculateCylinder(1, 1)
    expect(minCyl.lsa).toBeCloseTo(2 * Math.PI, 12)
    expect(minCyl.tsa).toBeCloseTo(4 * Math.PI, 12)
    expect(minCyl.volume).toBeCloseTo(Math.PI, 12)
    expect(minCyl.piCoefficients).toEqual({ lsa: 2, tsa: 4, volume: 1 })

    const maxCyl = calculateCylinder(10, 10)
    expect(maxCyl.lsa).toBeCloseTo(200 * Math.PI, 12)
    expect(maxCyl.tsa).toBeCloseTo(400 * Math.PI, 12)
    expect(maxCyl.volume).toBeCloseTo(1000 * Math.PI, 12)
    expect(maxCyl.piCoefficients).toEqual({ lsa: 200, tsa: 400, volume: 1000 })
  })

  it('satisfies TSA = LSA + 2πr² for valid decimal dimensions', () => {
    const result = calculateCylinder(3.5, 4)

    expect(result.lsa).toBeCloseTo(28 * Math.PI, 12)
    expect(result.tsa).toBeCloseTo(result.lsa + 2 * Math.PI * 3.5 * 3.5, 12)
    expect(result.volume).toBeCloseTo(49 * Math.PI, 12)
  })

  it('rejects missing, invalid, zero, negative, and out-of-range inputs', () => {
    expect(() => calculateCylinder(3)).toThrow(TypeError)
    expect(() => calculateCylinder(undefined, 5)).toThrow(TypeError)
    expect(() => calculateCylinder(null, 5)).toThrow(TypeError)
    expect(() => calculateCylinder('3', 5)).toThrow(TypeError)
    expect(() => calculateCylinder(3, Number.POSITIVE_INFINITY)).toThrow(
      TypeError,
    )
    expect(() => calculateCylinder(0, 5)).toThrow(RangeError)
    expect(() => calculateCylinder(3, 0)).toThrow(RangeError)
    expect(() => calculateCylinder(-3, 5)).toThrow(RangeError)
    expect(() => calculateCylinder(3, -5)).toThrow(RangeError)
    expect(() => calculateCylinder(0.9, 5)).toThrow(RangeError)
    expect(() => calculateCylinder(3, 10.1)).toThrow(RangeError)
  })
})

describe('calculateShape', () => {
  it('dispatches cube, cuboid, and cylinder calculations cleanly', () => {
    expect(calculateShape(SHAPES.CUBE, { a: 5 })).toEqual(calculateCube(5))
    expect(calculateShape(SHAPES.CUBOID, { l: 10, b: 6, h: 4 })).toEqual(
      calculateCuboid(10, 6, 4),
    )
    expect(calculateShape(SHAPES.CYLINDER, { r: 3, h: 5 })).toEqual(
      calculateCylinder(3, 5),
    )
  })

  it('does not mutate the input dimensions object', () => {
    const input = { l: 10, b: 6, h: 4 }
    const snapshot = { ...input }
    const result = calculateShape(SHAPES.CUBOID, input)

    expect(input).toEqual(snapshot)
    expect(result.dimensions).not.toBe(input)
  })

  it('rejects invalid shape names and malformed dimensions objects', () => {
    expect(() => calculateShape('', { a: 5 })).toThrow(TypeError)
    expect(() => calculateShape(null, { a: 5 })).toThrow(TypeError)
    expect(() => calculateShape('dodecahedron', { r: 5 })).toThrow(Error)
    expect(() => calculateShape(SHAPES.CUBE, null)).toThrow(TypeError)
    expect(() => calculateShape(SHAPES.CUBE, [5])).toThrow(TypeError)
    expect(() => calculateShape(SHAPES.CUBE, {})).toThrow(TypeError)
    expect(() => calculateShape(SHAPES.CUBOID, { l: 10, b: 6 })).toThrow(
      TypeError,
    )
  })
})

describe('Tier 1 checkpoint and calculateFaceBreakdown', () => {
  it('verifies cylinder r = 7, h = 10 volume (~1539.38) and areas', () => {
    const result = calculateCylinder(7, 10)
    expect(result.volume).toBeCloseTo(1539.38, 2)
    expect(result.lsa).toBeCloseTo(140 * Math.PI, 10)
    expect(result.tsa).toBeCloseTo(238 * Math.PI, 10)
  })

  it('computes 6 equal faces summing to TSA = 150 for cube a = 5', () => {
    const breakdown = calculateFaceBreakdown(SHAPES.CUBE, { a: 5 })
    expect(breakdown.faces).toHaveLength(6)
    expect(breakdown.faces.every((f) => f.area === 25)).toBe(true)
    const sum = breakdown.faces.reduce((acc, f) => acc + f.area, 0)
    expect(sum).toBe(150)
    expect(breakdown.tsaSum).toBe(150)
    expect(breakdown.lsaSum).toBe(100)
    expect(breakdown.excludedCapsArea).toBe(50)
  })

  it('computes 6 rectangular faces summing to TSA = 248 and lateral walls to LSA = 128 for cuboid 10, 6, 4', () => {
    const breakdown = calculateFaceBreakdown(SHAPES.CUBOID, {
      l: 10,
      b: 6,
      h: 4,
    })
    expect(breakdown.faces).toHaveLength(6)

    const byId = Object.fromEntries(breakdown.faces.map((f) => [f.id, f]))
    expect(byId.bottom.area).toBe(60)
    expect(byId.top.area).toBe(60)
    expect(byId.front.area).toBe(40)
    expect(byId.back.area).toBe(40)
    expect(byId.left.area).toBe(24)
    expect(byId.right.area).toBe(24)
    expect(byId.front.expression).toBe('10 × 4')

    const totalSum = breakdown.faces.reduce((acc, f) => acc + f.area, 0)
    const lateralSum = breakdown.faces
      .filter((f) => f.isLateral)
      .reduce((acc, f) => acc + f.area, 0)
    expect(totalSum).toBe(248)
    expect(lateralSum).toBe(128)
    expect(breakdown.tsaSum).toBe(248)
    expect(breakdown.lsaSum).toBe(128)
    expect(breakdown.excludedCapsArea).toBe(120)
  })

  it('computes 3 cylinder faces summing to TSA and excludes 2πr² from LSA', () => {
    const breakdown = calculateFaceBreakdown(SHAPES.CYLINDER, { r: 7, h: 10 })
    expect(breakdown.faces).toHaveLength(3)

    const totalSum = breakdown.faces.reduce((acc, f) => acc + f.area, 0)
    expect(totalSum).toBeCloseTo(238 * Math.PI, 10)
    expect(breakdown.tsaSum).toBeCloseTo(238 * Math.PI, 10)
    expect(breakdown.lsaSum).toBeCloseTo(140 * Math.PI, 10)
    expect(breakdown.excludedCapsArea).toBeCloseTo(98 * Math.PI, 10)
    expect(breakdown.excludedCapsPiCoefficient).toBe(98)
  })
})

describe('shouldShowUnitHint', () => {
  it('returns false when unit is cm regardless of dimension magnitude', () => {
    expect(shouldShowUnitHint(SHAPES.CUBE, { a: 10 }, 'cm')).toBe(false)
    expect(
      shouldShowUnitHint(SHAPES.CUBOID, { l: 10, b: 8, h: 6 }, 'cm'),
    ).toBe(false)
  })

  it('returns true when unit is m and any dimension meets threshold', () => {
    expect(LARGE_METRE_THRESHOLD).toBe(5)
    expect(shouldShowUnitHint(SHAPES.CUBE, { a: 5 }, 'm')).toBe(true)
    expect(shouldShowUnitHint(SHAPES.CUBOID, { l: 10, b: 2, h: 2 }, 'm')).toBe(
      true,
    )
    expect(shouldShowUnitHint(SHAPES.CYLINDER, { r: 2, h: 6 }, 'm')).toBe(true)
  })

  it('returns false when unit is m and all dimensions are below threshold', () => {
    expect(shouldShowUnitHint(SHAPES.CUBE, { a: 4 }, 'm')).toBe(false)
    expect(shouldShowUnitHint(SHAPES.CUBOID, { l: 4, b: 3, h: 2 }, 'm')).toBe(
      false,
    )
    expect(shouldShowUnitHint(SHAPES.CYLINDER, { r: 2, h: 4 }, 'm')).toBe(false)
  })
})

describe('calculateCone (Beyond Class 8)', () => {
  it('verifies checkpoint r = 3, h = 4 gives l = 5, Volume ≈ 37.70, LSA ≈ 47.12, TSA ≈ 75.40', () => {
    const result = calculateCone(3, 4)

    expect(result.shape).toBe(SHAPES.CONE)
    expect(result.dimensions).toEqual({ r: 3, h: 4 })
    expect(result.slantHeight).toBe(5)
    expect(result.volume).toBeCloseTo(12 * Math.PI, 12)
    expect(result.volume).toBeCloseTo(37.7, 2)
    expect(result.lsa).toBeCloseTo(15 * Math.PI, 12)
    expect(result.lsa).toBeCloseTo(47.12, 2)
    expect(result.tsa).toBeCloseTo(24 * Math.PI, 12)
    expect(result.tsa).toBeCloseTo(75.4, 2)
    expect(result.piCoefficients).toEqual({
      lsa: 15,
      tsa: 24,
      volume: 12,
    })
  })

  it('handles lower (1, 1) and upper (10, 10) boundaries and dispatches via calculateShape', () => {
    const minCone = calculateCone(1, 1)
    expect(minCone.slantHeight).toBeCloseTo(Math.SQRT2, 12)
    expect(minCone.tsa).toBeCloseTo(Math.PI * (Math.SQRT2 + 1), 12)
    expect(minCone.volume).toBeCloseTo(Math.PI / 3, 12)

    const maxCone = calculateCone(10, 10)
    expect(maxCone.slantHeight).toBeCloseTo(10 * Math.SQRT2, 12)
    expect(maxCone.volume).toBeCloseTo((1000 * Math.PI) / 3, 12)

    expect(calculateShape(SHAPES.CONE, { r: 3, h: 4 })).toEqual(
      calculateCone(3, 4),
    )
  })

  it('computes cone face breakdown summing to TSA and checks unit hints', () => {
    const breakdown = calculateFaceBreakdown(SHAPES.CONE, { r: 3, h: 4 })
    expect(breakdown.faces).toHaveLength(2)
    const sum = breakdown.faces.reduce((acc, f) => acc + f.area, 0)
    expect(sum).toBeCloseTo(24 * Math.PI, 12)
    expect(breakdown.tsaSum).toBeCloseTo(24 * Math.PI, 12)
    expect(breakdown.lsaSum).toBeCloseTo(15 * Math.PI, 12)
    expect(breakdown.excludedCapsArea).toBeCloseTo(9 * Math.PI, 12)

    expect(shouldShowUnitHint(SHAPES.CONE, { r: 3, h: 5 }, 'm')).toBe(true)
    expect(shouldShowUnitHint(SHAPES.CONE, { r: 3, h: 4 }, 'm')).toBe(false)
    expect(shouldShowUnitHint(SHAPES.CONE, { r: 6, h: 8 }, 'cm')).toBe(false)
  })

  it('rejects missing, invalid, zero, negative, and out-of-range dimensions', () => {
    expect(() => calculateCone(3)).toThrow(TypeError)
    expect(() => calculateCone(undefined, 4)).toThrow(TypeError)
    expect(() => calculateCone(null, 4)).toThrow(TypeError)
    expect(() => calculateCone('3', 4)).toThrow(TypeError)
    expect(() => calculateCone(0, 4)).toThrow(RangeError)
    expect(() => calculateCone(3, 0)).toThrow(RangeError)
    expect(() => calculateCone(-3, 4)).toThrow(RangeError)
    expect(() => calculateCone(3, -4)).toThrow(RangeError)
    expect(() => calculateCone(0.5, 4)).toThrow(RangeError)
    expect(() => calculateCone(3, 10.5)).toThrow(RangeError)
  })
})

describe('calculateSquarePyramid (Beyond Class 8)', () => {
  it('verifies checkpoint a = 6, h = 4 gives s = 5, Volume = 48, LSA = 60, TSA = 96', () => {
    const result = calculateSquarePyramid(6, 4)

    expect(result).toEqual({
      shape: SHAPES.SQUARE_PYRAMID,
      dimensions: { a: 6, h: 4 },
      slantHeight: 5,
      lsa: 60,
      tsa: 96,
      volume: 48,
    })
  })

  it('handles boundaries and dispatches via calculateShape', () => {
    const minPyr = calculateSquarePyramid(1, 1)
    const minS = Math.hypot(1, 0.5)
    expect(minPyr.slantHeight).toBeCloseTo(minS, 12)
    expect(minPyr.lsa).toBeCloseTo(2 * minS, 12)
    expect(minPyr.tsa).toBeCloseTo(1 + 2 * minS, 12)
    expect(minPyr.volume).toBeCloseTo(1 / 3, 12)

    const maxPyr = calculateSquarePyramid(10, 10)
    const maxS = Math.hypot(10, 5)
    expect(maxPyr.slantHeight).toBeCloseTo(maxS, 12)
    expect(maxPyr.volume).toBeCloseTo(1000 / 3, 10)

    expect(calculateShape(SHAPES.SQUARE_PYRAMID, { a: 6, h: 4 })).toEqual(
      calculateSquarePyramid(6, 4),
    )
  })

  it('computes 5-face breakdown (1 base + 4 triangles) summing to TSA = 96 and LSA = 60', () => {
    const breakdown = calculateFaceBreakdown(SHAPES.SQUARE_PYRAMID, {
      a: 6,
      h: 4,
    })
    expect(breakdown.faces).toHaveLength(5)

    const base = breakdown.faces.find((f) => f.id === 'bottom')
    const laterals = breakdown.faces.filter((f) => f.isLateral)
    expect(base.area).toBe(36)
    expect(laterals).toHaveLength(4)
    expect(laterals.every((f) => f.area === 15)).toBe(true)

    const sum = breakdown.faces.reduce((acc, f) => acc + f.area, 0)
    expect(sum).toBe(96)
    expect(breakdown.tsaSum).toBe(96)
    expect(breakdown.lsaSum).toBe(60)
    expect(breakdown.excludedCapsArea).toBe(36)

    expect(shouldShowUnitHint(SHAPES.SQUARE_PYRAMID, { a: 6, h: 4 }, 'm')).toBe(
      true,
    )
    expect(shouldShowUnitHint(SHAPES.SQUARE_PYRAMID, { a: 4, h: 4 }, 'm')).toBe(
      false,
    )
  })

  it('rejects missing, invalid, zero, negative, and out-of-range dimensions', () => {
    expect(() => calculateSquarePyramid(6)).toThrow(TypeError)
    expect(() => calculateSquarePyramid(undefined, 4)).toThrow(TypeError)
    expect(() => calculateSquarePyramid(null, 4)).toThrow(TypeError)
    expect(() => calculateSquarePyramid('6', 4)).toThrow(TypeError)
    expect(() => calculateSquarePyramid(0, 4)).toThrow(RangeError)
    expect(() => calculateSquarePyramid(6, 0)).toThrow(RangeError)
    expect(() => calculateSquarePyramid(-6, 4)).toThrow(RangeError)
    expect(() => calculateSquarePyramid(6, -4)).toThrow(RangeError)
    expect(() => calculateSquarePyramid(0.9, 4)).toThrow(RangeError)
    expect(() => calculateSquarePyramid(6, 11)).toThrow(RangeError)
  })
})

describe('calculateSphere (Beyond Class 8)', () => {
  it('verifies checkpoint r = 7 gives Volume ≈ 1436.76 and Surface Area ≈ 615.75', () => {
    const result = calculateSphere(7)

    expect(result.shape).toBe(SHAPES.SPHERE)
    expect(result.dimensions).toEqual({ r: 7 })
    expect(result.lsa).toBeNull()
    expect(result.tsa).toBeCloseTo(196 * Math.PI, 12)
    expect(result.surfaceArea).toBeCloseTo(196 * Math.PI, 12)
    expect(result.tsa).toBeCloseTo(615.75, 2)
    expect(result.volume).toBeCloseTo((4 / 3) * Math.PI * 343, 12)
    expect(result.volume).toBeCloseTo(1436.76, 2)
    expect(result.piCoefficients).toEqual({
      lsa: null,
      tsa: 196,
      surfaceArea: 196,
      volume: 1372 / 3,
    })
  })

  it('handles lower (r = 1) and upper (r = 10) boundaries and dispatches via calculateShape', () => {
    const minSphere = calculateSphere(1)
    expect(minSphere.lsa).toBeNull()
    expect(minSphere.tsa).toBeCloseTo(4 * Math.PI, 12)
    expect(minSphere.volume).toBeCloseTo((4 / 3) * Math.PI, 12)

    const maxSphere = calculateSphere(10)
    expect(maxSphere.tsa).toBeCloseTo(400 * Math.PI, 12)
    expect(maxSphere.volume).toBeCloseTo((4000 / 3) * Math.PI, 10)

    expect(calculateShape(SHAPES.SPHERE, { r: 7 })).toEqual(calculateSphere(7))
  })

  it('computes sphere face breakdown with null LSA and checks unit hints', () => {
    const breakdown = calculateFaceBreakdown(SHAPES.SPHERE, { r: 7 })
    expect(breakdown.faces).toHaveLength(1)
    expect(breakdown.faces[0].id).toBe('surface')
    expect(breakdown.faces[0].area).toBeCloseTo(196 * Math.PI, 12)
    expect(breakdown.lsaSum).toBeNull()
    expect(breakdown.tsaSum).toBeCloseTo(196 * Math.PI, 12)
    expect(breakdown.excludedCapsArea).toBe(0)

    expect(shouldShowUnitHint(SHAPES.SPHERE, { r: 7 }, 'm')).toBe(true)
    expect(shouldShowUnitHint(SHAPES.SPHERE, { r: 4 }, 'm')).toBe(false)
    expect(shouldShowUnitHint(SHAPES.SPHERE, { r: 7 }, 'cm')).toBe(false)
  })

  it('rejects missing, invalid, zero, negative, and out-of-range dimensions', () => {
    expect(() => calculateSphere()).toThrow(TypeError)
    expect(() => calculateSphere(null)).toThrow(TypeError)
    expect(() => calculateSphere('7')).toThrow(TypeError)
    expect(() => calculateSphere(Number.NaN)).toThrow(TypeError)
    expect(() => calculateSphere(0)).toThrow(RangeError)
    expect(() => calculateSphere(-7)).toThrow(RangeError)
    expect(() => calculateSphere(0.5)).toThrow(RangeError)
    expect(() => calculateSphere(10.1)).toThrow(RangeError)
  })
})

describe('Regular prisms (Triangular, Pentagonal, Hexagonal)', () => {
  it('calculates Triangular Prism (a=4, h=5) correctly', () => {
    const res = calculateTriangularPrism(4, 5)
    const base = 4 * Math.sqrt(3)
    expect(res.baseArea).toBeCloseTo(base, 10)
    expect(res.lsa).toBe(60)
    expect(res.tsa).toBeCloseTo(60 + 2 * base, 10)
    expect(res.volume).toBeCloseTo(base * 5, 10)
    expect(calculateShape(SHAPES.TRIANGULAR_PRISM, { a: 4, h: 5 })).toEqual(res)

    const bd = calculateFaceBreakdown(SHAPES.TRIANGULAR_PRISM, { a: 4, h: 5 })
    expect(bd.faces).toHaveLength(5)
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
    expect(bd.lsaSum).toBeCloseTo(res.lsa, 10)
  })

  it('calculates Pentagonal Prism (a=4, h=6) correctly', () => {
    const res = calculatePentagonalPrism(4, 6)
    const base = (5 * 16) / (4 * Math.tan(Math.PI / 5))
    expect(res.baseArea).toBeCloseTo(base, 10)
    expect(res.lsa).toBe(120)
    expect(res.tsa).toBeCloseTo(120 + 2 * base, 10)
    expect(res.volume).toBeCloseTo(base * 6, 10)
    expect(calculateShape(SHAPES.PENTAGONAL_PRISM, { a: 4, h: 6 })).toEqual(res)

    const bd = calculateFaceBreakdown(SHAPES.PENTAGONAL_PRISM, { a: 4, h: 6 })
    expect(bd.faces).toHaveLength(7)
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
  })

  it('calculates Hexagonal Prism (a=4, h=5) correctly', () => {
    const res = calculateHexagonalPrism(4, 5)
    const base = 24 * Math.sqrt(3)
    expect(res.baseArea).toBeCloseTo(base, 10)
    expect(res.lsa).toBe(120)
    expect(res.tsa).toBeCloseTo(120 + 48 * Math.sqrt(3), 10)
    expect(res.volume).toBeCloseTo(120 * Math.sqrt(3), 10)
    expect(calculateShape(SHAPES.HEXAGONAL_PRISM, { a: 4, h: 5 })).toEqual(res)

    const bd = calculateFaceBreakdown(SHAPES.HEXAGONAL_PRISM, { a: 4, h: 5 })
    expect(bd.faces).toHaveLength(8)
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
  })

  it('validates dimensions between 1 and 10 for all three prisms', () => {
    for (const fn of [
      calculateTriangularPrism,
      calculatePentagonalPrism,
      calculateHexagonalPrism,
    ]) {
      expect(() => fn(1, 1)).not.toThrow()
      expect(() => fn(10, 10)).not.toThrow()
      expect(() => fn(0, 5)).toThrow(RangeError)
      expect(() => fn(5, 11)).toThrow(RangeError)
      expect(() => fn(null, 5)).toThrow(TypeError)
      expect(() => fn(5)).toThrow(TypeError)
    }
  })
})

describe('Regular pyramids (Triangular, Pentagonal, Hexagonal)', () => {
  it('calculates Triangular Pyramid and matches Regular Tetrahedron when h = a√(2/3)', () => {
    const a = 6
    const hReg = a * Math.sqrt(2 / 3)
    const reg = calculateTriangularPyramid(a, hReg)
    expect(reg.slantHeight).toBeCloseTo((Math.sqrt(3) / 2) * a, 10)
    expect(reg.tsa).toBeCloseTo(Math.sqrt(3) * a * a, 10)
    expect(reg.volume).toBeCloseTo((a * a * a) / (6 * Math.SQRT2), 10)

    const res = calculateTriangularPyramid(6, 5)
    const bd = calculateFaceBreakdown(SHAPES.TRIANGULAR_PYRAMID, { a: 6, h: 5 })
    expect(bd.faces).toHaveLength(4)
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
    expect(bd.lsaSum).toBeCloseTo(res.lsa, 10)
  })

  it('calculates Pentagonal Pyramid and Hexagonal Pyramid accurately', () => {
    const pent = calculatePentagonalPyramid(4, 6)
    const pentApothem = 4 / (2 * Math.tan(Math.PI / 5))
    const pentS = Math.hypot(6, pentApothem)
    expect(pent.slantHeight).toBeCloseTo(pentS, 10)
    expect(pent.lsa).toBeCloseTo(0.5 * 5 * 4 * pentS, 10)
    expect(pent.tsa).toBeCloseTo(pent.baseArea + pent.lsa, 10)
    expect(pent.volume).toBeCloseTo((pent.baseArea * 6) / 3, 10)
    expect(calculateFaceBreakdown(SHAPES.PENTAGONAL_PYRAMID, { a: 4, h: 6 }).faces).toHaveLength(6)

    const hex = calculateHexagonalPyramid(4, 3)
    const hexApothem = 2 * Math.sqrt(3)
    const hexS = Math.hypot(3, hexApothem)
    expect(hex.slantHeight).toBeCloseTo(hexS, 10)
    expect(hex.lsa).toBeCloseTo(12 * hexS, 10)
    expect(hex.volume).toBeCloseTo(24 * Math.sqrt(3), 10)
    const hexBd = calculateFaceBreakdown(SHAPES.HEXAGONAL_PYRAMID, { a: 4, h: 3 })
    expect(hexBd.faces).toHaveLength(7)
    expect(hexBd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(hex.tsa, 10)
  })

  it('rejects invalid inputs for triangular, pentagonal, and hexagonal pyramids', () => {
    for (const fn of [
      calculateTriangularPyramid,
      calculatePentagonalPyramid,
      calculateHexagonalPyramid,
    ]) {
      expect(() => fn(0, 4)).toThrow(RangeError)
      expect(() => fn(4, -2)).toThrow(RangeError)
      expect(() => fn(4, 10.5)).toThrow(RangeError)
      expect(() => fn(undefined, 4)).toThrow(TypeError)
    }
  })
})

describe('Hemisphere, Frustum of Cone, and Octahedron', () => {
  it('calculates Hemisphere (r = 7) CSA=98π, TSA=147π, Volume=(686/3)π', () => {
    const res = calculateHemisphere(7)
    expect(res.lsa).toBeCloseTo(98 * Math.PI, 10)
    expect(res.tsa).toBeCloseTo(147 * Math.PI, 10)
    expect(res.volume).toBeCloseTo((686 / 3) * Math.PI, 10)
    expect(res.piCoefficients).toEqual({
      lsa: 98,
      tsa: 147,
      volume: 686 / 3,
    })

    const bd = calculateFaceBreakdown(SHAPES.HEMISPHERE, { r: 7 })
    expect(bd.faces).toHaveLength(2)
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
    expect(bd.lsaSum).toBeCloseTo(res.lsa, 10)
    expect(shouldShowUnitHint(SHAPES.HEMISPHERE, { r: 5 }, 'm')).toBe(true)
    expect(() => calculateHemisphere(0)).toThrow(RangeError)
    expect(() => calculateHemisphere(null)).toThrow(TypeError)
  })

  it('calculates Frustum of Cone (r1 = 6, r2 = 3, h = 4) l=5, LSA=45π, TSA=90π, Volume=84π', () => {
    const res = calculateFrustum(6, 3, 4)
    expect(res.slantHeight).toBe(5)
    expect(res.lsa).toBeCloseTo(45 * Math.PI, 10)
    expect(res.tsa).toBeCloseTo(90 * Math.PI, 10)
    expect(res.volume).toBeCloseTo(84 * Math.PI, 10)
    expect(res.piCoefficients).toEqual({
      lsa: 45,
      tsa: 90,
      volume: 84,
    })
    expect(calculateShape(SHAPES.FRUSTUM, { r1: 6, r2: 3, h: 4 })).toEqual(res)

    // Matches cylinder when r1 === r2
    const cylEq = calculateFrustum(4, 4, 5)
    const cyl = calculateCylinder(4, 5)
    expect(cylEq.lsa).toBeCloseTo(cyl.lsa, 10)
    expect(cylEq.tsa).toBeCloseTo(cyl.tsa, 10)
    expect(cylEq.volume).toBeCloseTo(cyl.volume, 10)

    const bd = calculateFaceBreakdown(SHAPES.FRUSTUM, { r1: 6, r2: 3, h: 4 })
    expect(bd.faces).toHaveLength(3)
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
    expect(shouldShowUnitHint(SHAPES.FRUSTUM, { r1: 6, r2: 3, h: 4 }, 'm')).toBe(
      true,
    )
    expect(() => calculateFrustum(0, 3, 4)).toThrow(RangeError)
    expect(() => calculateFrustum(6, 3)).toThrow(TypeError)
  })

  it('calculates Octahedron (a = 6) TSA=72√3 and Volume=72√2 with null LSA', () => {
    const res = calculateOctahedron(6)
    expect(res.lsa).toBeNull()
    expect(res.faceArea).toBeCloseTo(9 * Math.sqrt(3), 10)
    expect(res.tsa).toBeCloseTo(72 * Math.sqrt(3), 10)
    expect(res.volume).toBeCloseTo(72 * Math.SQRT2, 10)
    expect(calculateShape(SHAPES.OCTAHEDRON, { a: 6 })).toEqual(res)

    const bd = calculateFaceBreakdown(SHAPES.OCTAHEDRON, { a: 6 })
    expect(bd.faces).toHaveLength(8)
    expect(bd.lsaSum).toBeNull()
    expect(bd.faces.reduce((s, f) => s + f.area, 0)).toBeCloseTo(res.tsa, 10)
    expect(shouldShowUnitHint(SHAPES.OCTAHEDRON, { a: 5 }, 'm')).toBe(true)
    expect(() => calculateOctahedron(-1)).toThrow(RangeError)
    expect(() => calculateOctahedron('6')).toThrow(TypeError)
  })
})

describe('Tier 2 Net Lab: cube net validation & 11-net catalog', () => {
  it('contains all 11 mathematically distinct valid cube nets covering all 6 faces', () => {
    expect(CUBE_NET_CATALOG).toHaveLength(11)
    for (const net of CUBE_NET_CATALOG) {
      const result = validateCubeNet(net.cells, net.rootIndex)
      expect(result.valid).toBe(true)
      expect(result.reason).toBe('valid')
      expect(result.faceCount).toBe(6)
      expect(result.overlapCount).toBe(0)
      expect(new Set(result.coveredFaces)).toEqual(
        new Set(['bottom', 'front', 'back', 'top', 'left', 'right']),
      )
    }
  })

  it('matches expected validity across all Net Checker puzzles and common invalid hexominoes', () => {
    for (const puzzle of NET_CHECKER_PUZZLES) {
      const res = validateCubeNet(puzzle.cells, puzzle.rootIndex)
      expect(res.valid).toBe(puzzle.isValid)
    }

    expect(
      validateCubeNet([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
      ]),
    ).toMatchObject({ valid: false, reason: 'overlap' })

    expect(
      validateCubeNet([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 1],
      ]),
    ).toMatchObject({ valid: false, reason: 'overlap' })

    expect(
      validateCubeNet([
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 3],
        [2, 4],
      ]),
    ).toMatchObject({ valid: false, reason: 'disconnected' })

    expect(
      validateCubeNet([
        [0, 0],
        [0, 1],
        [0, 2],
      ]),
    ).toMatchObject({ valid: false, reason: 'count' })

    expect(
      validateCubeNet([
        [0, 0],
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ]),
    ).toMatchObject({ valid: false, reason: 'duplicate' })

    expect(validateCubeNet(null)).toMatchObject({
      valid: false,
      reason: 'invalid_input',
    })
  })
})

describe('Tier 2 Net Lab: scale factor k, k^2, k^3 enlargement', () => {
  it('exposes scale bounds 1x to 3x and scales Cube & Cuboid accurately', () => {
    expect(MIN_SCALE_FACTOR).toBe(1)
    expect(MAX_SCALE_FACTOR).toBe(3)

    const cube2x = calculateScaleEnlargement(SHAPES.CUBE, { a: 5 }, 2)
    expect(cube2x.areaFactor).toBe(4)
    expect(cube2x.volumeFactor).toBe(8)
    expect(cube2x.scaled.dimensions.a).toBe(10)
    expect(cube2x.scaled.lsa).toBe(400)
    expect(cube2x.scaled.tsa).toBe(600)
    expect(cube2x.scaled.volume).toBe(1000)

    const cuboid3x = calculateScaleEnlargement(
      SHAPES.CUBOID,
      { l: 10, b: 6, h: 4 },
      3,
    )
    expect(cuboid3x.areaFactor).toBe(9)
    expect(cuboid3x.volumeFactor).toBe(27)
    expect(cuboid3x.scaled.dimensions).toEqual({ l: 30, b: 18, h: 12 })
    expect(cuboid3x.scaled.lsa).toBe(128 * 9)
    expect(cuboid3x.scaled.tsa).toBe(248 * 9)
    expect(cuboid3x.scaled.volume).toBe(240 * 27)
  })

  it('scales Cylinder pi-coefficients, Sphere/Octahedron null LSA, and Frustum slant height', () => {
    const cyl = calculateScaleEnlargement(SHAPES.CYLINDER, { r: 3, h: 5 }, 1.5)
    expect(cyl.scaled.tsa).toBeCloseTo(48 * Math.PI * 2.25, 8)
    expect(cyl.scaled.volume).toBeCloseTo(45 * Math.PI * 3.375, 8)
    expect(cyl.scaled.piCoefficients.tsa).toBeCloseTo(48 * 2.25, 8)
    expect(cyl.scaled.piCoefficients.volume).toBeCloseTo(45 * 3.375, 8)

    const sphere2x = calculateScaleEnlargement(SHAPES.SPHERE, { r: 3 }, 2)
    expect(sphere2x.scaled.lsa).toBeNull()
    expect(sphere2x.scaled.tsa).toBeCloseTo(36 * Math.PI * 4, 8)
    expect(sphere2x.scaled.volume).toBeCloseTo(36 * Math.PI * 8, 8)

    const frustum2x = calculateScaleEnlargement(
      SHAPES.FRUSTUM,
      { r1: 6, r2: 3, h: 4 },
      2,
    )
    expect(frustum2x.scaled.slantHeight).toBeCloseTo(10, 8)
    expect(frustum2x.scaled.lsa).toBeCloseTo(45 * Math.PI * 4, 8)
  })

  it('rejects invalid scaleFactor values', () => {
    expect(() => calculateScaleEnlargement(SHAPES.CUBE, { a: 4 }, 0)).toThrow(
      RangeError,
    )
    expect(() => calculateScaleEnlargement(SHAPES.CUBE, { a: 4 }, -1)).toThrow(
      RangeError,
    )
    expect(() =>
      calculateScaleEnlargement(SHAPES.CUBE, { a: 4 }, Number.NaN),
    ).toThrow(TypeError)
    expect(() =>
      calculateScaleEnlargement(SHAPES.CUBE, { a: 4 }, null),
    ).toThrow(TypeError)
  })
})

describe('NCERT Mensuration Class 10 Solved Practice computations (Q1–Q10)', () => {
  it('verifies all 10 question solutions with exact numerical and symbolic agreement', () => {
    expect(CLASS_10_PRACTICE_IDS).toHaveLength(10)
    const s = calculateClass10PracticeSolutions()

    // Q1: 4πr² : 6πr² = 2 : 3
    expect(s.q1.sphereTsaPiCoeff).toBe(4)
    expect(s.q1.twoHemispheresTsaPiCoeff).toBe(6)
    expect(s.q1.simplifiedRatio).toEqual([2, 3])
    expect(s.q1.decimalRatio).toBeCloseTo(2 / 3, 10)

    // Q2: Cone (r=1, h=2) in Cube a=2 -> V = 2π/3
    expect(s.q2.coneRadius).toBe(1)
    expect(s.q2.coneHeight).toBe(2)
    expect(s.q2.volumePiCoefficient).toBeCloseTo(2 / 3, 10)
    expect(s.q2.volume).toBeCloseTo((2 * Math.PI) / 3, 10)

    // Q3: 3πr² : r² = 3π : 1
    expect(s.q3.ratioExactCoefficientOfPi).toBe(3)
    expect(s.q3.ratioNumeric).toBeCloseTo(3 * Math.PI, 10)

    // Q4: 2 joined cubes -> Cuboid(2a, a, a) TSA = 10a²
    expect(s.q4.cuboidTsaCoefficientOfASquared).toBe(10)
    expect(calculateCuboid(6, 3, 3).tsa).toBe(90)

    // Q5: 94.2 = 2 * 3.14 * r * 5 -> r = 3 cm
    expect(s.q5.radius).toBeCloseTo(3, 10)
    expect(calculateCylinder(3, 5).piCoefficients.lsa * 3.14).toBeCloseTo(
      94.2,
      10,
    )

    // Q6: Cone (r=7, h=24) -> l=25 cm, CSA = 550 cm² (with π=22/7)
    expect(s.q6.slantHeight).toBe(25)
    expect(s.q6.csaExactPiCoefficient).toBe(175)
    expect(s.q6.csaNcertPi22Over7).toBe(550)

    // Q7: Cylinder (r=0.7 m, h=2.4 m) -> TSA = 13.64 m² (with π=22/7)
    expect(s.q7.tsaExactPiCoefficient).toBeCloseTo(4.34, 10)
    expect(s.q7.tsaNcertPi22Over7).toBeCloseTo(13.64, 10)

    // Q8: Hemisphere TSA = (3/4)πd² (verified across d = 2, 4, 6)
    expect(s.q8.coeffOfPiDSquared).toBe(0.75)
    for (const d of [2, 4, 6]) {
      expect(calculateHemisphere(d / 2).tsa).toBeCloseTo(
        0.75 * Math.PI * d * d,
        10,
      )
    }

    // Q9: Semicircle Area = (1/8)πd²
    expect(s.q9.coeffOfPiDSquared).toBe(0.125)
    for (const d of [2, 4, 6]) {
      expect(0.5 * Math.PI * (d / 2) ** 2).toBeCloseTo(
        0.125 * Math.PI * d * d,
        10,
      )
    }

    // Q10: B = 51 cm², V = 85 cm³ -> h = 5 cm
    expect(s.q10.height).toBe(5)
  })
})
