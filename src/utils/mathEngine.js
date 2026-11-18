/**
 * Minimum allowed dimension value (inclusive) in NCERT Mensuration lab units.
 * @type {number}
 */
export const MIN_DIMENSION = 1

/**
 * Maximum allowed dimension value (inclusive) in NCERT Mensuration lab units.
 * @type {number}
 */
export const MAX_DIMENSION = 10

/**
 * Supported 3D geometric shapes for mensuration calculations.
 * @readonly
 * @enum {string}
 */
export const SHAPES = Object.freeze({
  CUBE: 'cube',
  CUBOID: 'cuboid',
  CYLINDER: 'cylinder',
  CONE: 'cone',
  SQUARE_PYRAMID: 'square_pyramid',
  SPHERE: 'sphere',
  TRIANGULAR_PRISM: 'triangular_prism',
  TRIANGULAR_PYRAMID: 'triangular_pyramid',
  PENTAGONAL_PRISM: 'pentagonal_prism',
  HEXAGONAL_PRISM: 'hexagonal_prism',
  PENTAGONAL_PYRAMID: 'pentagonal_pyramid',
  HEXAGONAL_PYRAMID: 'hexagonal_pyramid',
  HEMISPHERE: 'hemisphere',
  FRUSTUM: 'frustum',
  OCTAHEDRON: 'octahedron',
})

/**
 * Class 8 NCERT Mensuration shapes.
 * @type {ReadonlyArray<string>}
 */
export const CLASS_8_SHAPES = Object.freeze([
  SHAPES.CUBE,
  SHAPES.CUBOID,
  SHAPES.CYLINDER,
])

/**
 * Beyond Class 8 shapes grouped for clean selector organization.
 */
export const BEYOND_CLASS_8_GROUPS = Object.freeze({
  prisms: Object.freeze([
    SHAPES.TRIANGULAR_PRISM,
    SHAPES.PENTAGONAL_PRISM,
    SHAPES.HEXAGONAL_PRISM,
  ]),
  pyramids: Object.freeze([
    SHAPES.TRIANGULAR_PYRAMID,
    SHAPES.SQUARE_PYRAMID,
    SHAPES.PENTAGONAL_PYRAMID,
    SHAPES.HEXAGONAL_PYRAMID,
  ]),
  curvedAndPlatonic: Object.freeze([
    SHAPES.CONE,
    SHAPES.FRUSTUM,
    SHAPES.SPHERE,
    SHAPES.HEMISPHERE,
    SHAPES.OCTAHEDRON,
  ]),
})

/**
 * Beyond Class 8 (Class 9/10+) mensuration shapes.
 * @type {ReadonlyArray<string>}
 */
export const BEYOND_CLASS_8_SHAPES = Object.freeze([
  SHAPES.CONE,
  SHAPES.SQUARE_PYRAMID,
  SHAPES.SPHERE,
  SHAPES.TRIANGULAR_PRISM,
  SHAPES.TRIANGULAR_PYRAMID,
  SHAPES.PENTAGONAL_PRISM,
  SHAPES.HEXAGONAL_PRISM,
  SHAPES.PENTAGONAL_PYRAMID,
  SHAPES.HEXAGONAL_PYRAMID,
  SHAPES.HEMISPHERE,
  SHAPES.FRUSTUM,
  SHAPES.OCTAHEDRON,
])

/**
 * Returns true if the shape belongs to the Beyond Class 8 tier.
 *
 * @param {string} shape - Shape identifier.
 * @returns {boolean}
 */
export function isBeyondClass8Shape(shape) {
  return BEYOND_CLASS_8_SHAPES.includes(shape)
}

/**
 * Structured calculation result for a 3D shape.
 * @typedef {Object} MensurationResult
 * @property {string} shape - Shape identifier.
 * @property {Object.<string, number>} dimensions - Validated input dimensions.
 * @property {number|null} lsa - Lateral/curved surface area, or null when not applicable (sphere).
 * @property {number} tsa - Total surface area.
 * @property {number} volume - Enclosed volume.
 * @property {number} [slantHeight] - Slant height (`l` for cone, `s` for square pyramid).
 * @property {number} [surfaceArea] - Surface area alias for sphere (`4πr²`).
 * @property {{lsa: number|null, tsa: number, surfaceArea?: number, volume: number}} [piCoefficients] - Exact coefficients of π.
 */

/**
 * Validates that a single dimension is a finite number within [MIN_DIMENSION, MAX_DIMENSION].
 *
 * @param {number} value - Dimension value to validate.
 * @param {string} [name='dimension'] - Descriptive label used in validation errors.
 * @returns {number} The validated numeric dimension.
 * @throws {TypeError} When the value is missing, not a number, or not finite.
 * @throws {RangeError} When the value is zero, negative, or outside [1, 10].
 */
export function validateDimension(value, name = 'dimension') {
  if (value === undefined || value === null) {
    throw new TypeError(`${name} is required.`)
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a valid finite number.`)
  }

  if (value <= 0) {
    throw new RangeError(
      `${name} must be greater than 0 and between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`,
    )
  }

  if (value < MIN_DIMENSION || value > MAX_DIMENSION) {
    throw new RangeError(
      `${name} must be between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`,
    )
  }

  return value
}

/**
 * Calculates Lateral Surface Area, Total Surface Area, and Volume of a cube.
 *
 * Formulas (Class 8 NCERT Mensuration):
 * - LSA = 4a²
 * - TSA = 6a²
 * - Volume = a³
 *
 * @param {number} a - Side length of the cube (between 1 and 10).
 * @returns {MensurationResult} Calculated cube measurements.
 * @throws {TypeError|RangeError} When `a` is missing, non-numeric, or outside [1, 10].
 */
export function calculateCube(a) {
  const side = validateDimension(a, 'side (a)')

  return {
    shape: SHAPES.CUBE,
    dimensions: { a: side },
    lsa: 4 * side * side,
    tsa: 6 * side * side,
    volume: side * side * side,
  }
}

/**
 * Calculates Lateral Surface Area, Total Surface Area, and Volume of a cuboid.
 *
 * Formulas (Class 8 NCERT Mensuration):
 * - LSA = 2h(l + b)
 * - TSA = 2(lb + bh + hl)
 * - Volume = l × b × h
 *
 * @param {number} l - Length of the cuboid (between 1 and 10).
 * @param {number} b - Breadth of the cuboid (between 1 and 10).
 * @param {number} h - Height of the cuboid (between 1 and 10).
 * @returns {MensurationResult} Calculated cuboid measurements.
 * @throws {TypeError|RangeError} When any dimension is missing, non-numeric, or outside [1, 10].
 */
export function calculateCuboid(l, b, h) {
  const length = validateDimension(l, 'length (l)')
  const breadth = validateDimension(b, 'breadth (b)')
  const height = validateDimension(h, 'height (h)')

  return {
    shape: SHAPES.CUBOID,
    dimensions: { l: length, b: breadth, h: height },
    lsa: 2 * height * (length + breadth),
    tsa: 2 * (length * breadth + breadth * height + height * length),
    volume: length * breadth * height,
  }
}

/**
 * Calculates Curved/Lateral Surface Area, Total Surface Area, and Volume of a right circular cylinder.
 *
 * Formulas (Class 8 NCERT Mensuration):
 * - LSA = 2πrh
 * - TSA = 2πr(r + h)
 * - Volume = πr²h
 *
 * @param {number} r - Radius of the cylinder base (between 1 and 10).
 * @param {number} h - Height of the cylinder (between 1 and 10).
 * @returns {MensurationResult} Calculated cylinder measurements using `Math.PI`, plus exact π coefficients.
 * @throws {TypeError|RangeError} When `r` or `h` is missing, non-numeric, or outside [1, 10].
 */
export function calculateCylinder(r, h) {
  const radius = validateDimension(r, 'radius (r)')
  const height = validateDimension(h, 'height (h)')

  const lsaCoefficient = 2 * radius * height
  const tsaCoefficient = 2 * radius * (radius + height)
  const volumeCoefficient = radius * radius * height

  return {
    shape: SHAPES.CYLINDER,
    dimensions: { r: radius, h: height },
    lsa: 2 * Math.PI * radius * height,
    tsa: 2 * Math.PI * radius * (radius + height),
    volume: Math.PI * radius * radius * height,
    piCoefficients: {
      lsa: lsaCoefficient,
      tsa: tsaCoefficient,
      volume: volumeCoefficient,
    },
  }
}

/**
 * Calculates Slant Height, Curved/Lateral Surface Area, Total Surface Area, and Volume of a right circular cone.
 *
 * Formulas (Beyond Class 8 - Class 9/10):
 * - Slant height l = √(r² + h²)
 * - LSA = πrl
 * - TSA = πr(l + r)
 * - Volume = (1/3)πr²h
 *
 * @param {number} r - Base radius of the cone (between 1 and 10).
 * @param {number} h - Vertical height of the cone (between 1 and 10).
 * @returns {MensurationResult} Calculated cone measurements using `Math.PI`.
 * @throws {TypeError|RangeError} When `r` or `h` is missing, non-numeric, or outside [1, 10].
 */
export function calculateCone(r, h) {
  const radius = validateDimension(r, 'radius (r)')
  const height = validateDimension(h, 'height (h)')
  const slantHeight = Math.hypot(radius, height)

  const lsaCoefficient = radius * slantHeight
  const tsaCoefficient = radius * (slantHeight + radius)
  const volumeCoefficient = (radius * radius * height) / 3

  return {
    shape: SHAPES.CONE,
    dimensions: { r: radius, h: height },
    slantHeight,
    lsa: Math.PI * radius * slantHeight,
    tsa: Math.PI * radius * (slantHeight + radius),
    volume: (1 / 3) * Math.PI * radius * radius * height,
    piCoefficients: {
      lsa: lsaCoefficient,
      tsa: tsaCoefficient,
      volume: volumeCoefficient,
    },
  }
}

/**
 * Calculates Slant Height, Lateral Surface Area, Total Surface Area, and Volume of a right square pyramid.
 *
 * Formulas (Beyond Class 8 - Class 9/10):
 * - Slant height s = √(h² + (a/2)²)
 * - LSA = 2as
 * - TSA = a² + 2as
 * - Volume = (1/3)a²h
 *
 * @param {number} a - Base side length of the square pyramid (between 1 and 10).
 * @param {number} h - Vertical height of the square pyramid (between 1 and 10).
 * @returns {MensurationResult} Calculated square pyramid measurements.
 * @throws {TypeError|RangeError} When `a` or `h` is missing, non-numeric, or outside [1, 10].
 */
export function calculateSquarePyramid(a, h) {
  const side = validateDimension(a, 'base side (a)')
  const height = validateDimension(h, 'height (h)')
  const slantHeight = Math.hypot(height, side / 2)

  const lsa = 2 * side * slantHeight
  const tsa = side * side + lsa
  const volume = (1 / 3) * side * side * height

  return {
    shape: SHAPES.SQUARE_PYRAMID,
    dimensions: { a: side, h: height },
    slantHeight,
    lsa,
    tsa,
    volume,
  }
}

/**
 * Calculates Surface Area and Volume of a sphere.
 * Lateral Surface Area is not applicable to a sphere (`lsa: null`).
 *
 * Formulas (Beyond Class 8 - Class 9/10):
 * - Surface Area (TSA) = 4πr²
 * - Volume = (4/3)πr³
 *
 * @param {number} r - Radius of the sphere (between 1 and 10).
 * @returns {MensurationResult} Calculated sphere measurements using `Math.PI`.
 * @throws {TypeError|RangeError} When `r` is missing, non-numeric, or outside [1, 10].
 */
export function calculateSphere(r) {
  const radius = validateDimension(r, 'radius (r)')
  const surfaceAreaCoefficient = 4 * radius * radius
  const volumeCoefficient = (4 * radius * radius * radius) / 3
  const surfaceArea = 4 * Math.PI * radius * radius

  return {
    shape: SHAPES.SPHERE,
    dimensions: { r: radius },
    lsa: null,
    tsa: surfaceArea,
    surfaceArea,
    volume: (4 / 3) * Math.PI * radius * radius * radius,
    piCoefficients: {
      lsa: null,
      tsa: surfaceAreaCoefficient,
      surfaceArea: surfaceAreaCoefficient,
      volume: volumeCoefficient,
    },
  }
}

/**
 * Computes apothem, circumradius, and base area for a regular n-sided polygon.
 *
 * @param {number} sides - Number of polygon sides (`n >= 3`).
 * @param {number} sideLength - Length of each edge (`a`).
 * @returns {{ apothem: number, circumradius: number, baseArea: number }}
 */
export function regularPolygonMetrics(sides, sideLength) {
  const apothem = sideLength / (2 * Math.tan(Math.PI / sides))
  const circumradius = sideLength / (2 * Math.sin(Math.PI / sides))
  const baseArea = (sides * sideLength * apothem) / 2
  return { apothem, circumradius, baseArea }
}

function calculateRegularPrismInternal(shape, sides, a, h) {
  const side = validateDimension(a, 'base side (a)')
  const height = validateDimension(h, 'height (h)')
  const { baseArea } = regularPolygonMetrics(sides, side)
  const lsa = sides * side * height
  const tsa = 2 * baseArea + lsa
  const volume = baseArea * height

  return {
    shape,
    dimensions: { a: side, h: height },
    baseArea,
    lsa,
    tsa,
    volume,
  }
}

function calculateRegularPyramidInternal(shape, sides, a, h) {
  const side = validateDimension(a, 'base side (a)')
  const height = validateDimension(h, 'height (h)')
  const { apothem, baseArea } = regularPolygonMetrics(sides, side)
  const slantHeight = Math.hypot(height, apothem)
  const lsa = 0.5 * sides * side * slantHeight
  const tsa = baseArea + lsa
  const volume = (1 / 3) * baseArea * height

  return {
    shape,
    dimensions: { a: side, h: height },
    baseArea,
    slantHeight,
    lsa,
    tsa,
    volume,
  }
}

/**
 * Calculates Base Area, LSA, TSA, and Volume of an equilateral triangular prism.
 *
 * @param {number} a - Equilateral triangle base side length (1 to 10).
 * @param {number} h - Prism length/height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateTriangularPrism(a, h) {
  return calculateRegularPrismInternal(SHAPES.TRIANGULAR_PRISM, 3, a, h)
}

/**
 * Calculates Base Area, LSA, TSA, and Volume of a regular pentagonal prism.
 *
 * @param {number} a - Pentagon base side length (1 to 10).
 * @param {number} h - Prism height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculatePentagonalPrism(a, h) {
  return calculateRegularPrismInternal(SHAPES.PENTAGONAL_PRISM, 5, a, h)
}

/**
 * Calculates Base Area, LSA, TSA, and Volume of a regular hexagonal prism.
 *
 * @param {number} a - Hexagon base side length (1 to 10).
 * @param {number} h - Prism height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateHexagonalPrism(a, h) {
  return calculateRegularPrismInternal(SHAPES.HEXAGONAL_PRISM, 6, a, h)
}

/**
 * Calculates Slant Height, Base Area, LSA, TSA, and Volume of a triangular pyramid (equilateral base).
 * When `h = a * √(2/3)`, this matches a regular tetrahedron (`TSA = √3 a²`, `V = a³/(6√2)`).
 *
 * @param {number} a - Base triangle side length (1 to 10).
 * @param {number} h - Vertical height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateTriangularPyramid(a, h) {
  return calculateRegularPyramidInternal(SHAPES.TRIANGULAR_PYRAMID, 3, a, h)
}

/**
 * Calculates Slant Height, Base Area, LSA, TSA, and Volume of a regular pentagonal pyramid.
 *
 * @param {number} a - Base pentagon side length (1 to 10).
 * @param {number} h - Vertical height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculatePentagonalPyramid(a, h) {
  return calculateRegularPyramidInternal(SHAPES.PENTAGONAL_PYRAMID, 5, a, h)
}

/**
 * Calculates Slant Height, Base Area, LSA, TSA, and Volume of a regular hexagonal pyramid.
 *
 * @param {number} a - Base hexagon side length (1 to 10).
 * @param {number} h - Vertical height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateHexagonalPyramid(a, h) {
  return calculateRegularPyramidInternal(SHAPES.HEXAGONAL_PYRAMID, 6, a, h)
}

/**
 * Calculates Curved Surface Area (LSA = 2πr²), Total Surface Area (TSA = 3πr²),
 * and Volume ((2/3)πr³) of a solid hemisphere.
 *
 * @param {number} r - Radius of the hemisphere (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateHemisphere(r) {
  const radius = validateDimension(r, 'radius (r)')
  const lsaCoeff = 2 * radius * radius
  const tsaCoeff = 3 * radius * radius
  const volumeCoeff = (2 * radius * radius * radius) / 3

  return {
    shape: SHAPES.HEMISPHERE,
    dimensions: { r: radius },
    lsa: Math.PI * lsaCoeff,
    tsa: Math.PI * tsaCoeff,
    volume: Math.PI * volumeCoeff,
    piCoefficients: {
      lsa: lsaCoeff,
      tsa: tsaCoeff,
      volume: volumeCoeff,
    },
  }
}

/**
 * Calculates Slant Height, Curved Surface Area (LSA), Total Surface Area (TSA),
 * and Volume of a frustum of a right circular cone.
 *
 * Formulas:
 * - l = √(h² + (r₁ - r₂)²)
 * - LSA = π(r₁ + r₂)l
 * - TSA = π(r₁ + r₂)l + πr₁² + πr₂²
 * - Volume = (1/3)πh(r₁² + r₁r₂ + r₂²)
 *
 * @param {number} r1 - Bottom radius (1 to 10).
 * @param {number} r2 - Top radius (1 to 10).
 * @param {number} h - Vertical height (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateFrustum(r1, r2, h) {
  const bottomR = validateDimension(r1, 'bottom radius (r1)')
  const topR = validateDimension(r2, 'top radius (r2)')
  const height = validateDimension(h, 'height (h)')

  const slantHeight = Math.hypot(height, bottomR - topR)
  const lsaCoeff = (bottomR + topR) * slantHeight
  const tsaCoeff = lsaCoeff + bottomR * bottomR + topR * topR
  const volumeCoeff =
    (height * (bottomR * bottomR + bottomR * topR + topR * topR)) / 3

  return {
    shape: SHAPES.FRUSTUM,
    dimensions: { r1: bottomR, r2: topR, h: height },
    slantHeight,
    lsa: Math.PI * lsaCoeff,
    tsa: Math.PI * tsaCoeff,
    volume: Math.PI * volumeCoeff,
    piCoefficients: {
      lsa: lsaCoeff,
      tsa: tsaCoeff,
      volume: volumeCoeff,
    },
  }
}

/**
 * Calculates Total Surface Area (2√3 a²) and Volume ((√2/3)a³) of a regular octahedron.
 * Because all 8 faces are identical equilateral triangles without distinct caps, `lsa` is `null`.
 *
 * @param {number} a - Edge length (1 to 10).
 * @returns {MensurationResult}
 */
export function calculateOctahedron(a) {
  const side = validateDimension(a, 'edge (a)')
  const faceArea = (Math.sqrt(3) / 4) * side * side
  const tsa = 8 * faceArea
  const volume = (Math.SQRT2 / 3) * side * side * side

  return {
    shape: SHAPES.OCTAHEDRON,
    dimensions: { a: side },
    faceArea,
    lsa: null,
    tsa,
    surfaceArea: tsa,
    volume,
  }
}

/**
 * Computes mensuration results for a given shape name and dimension object.
 *
 * @param {string} shape - Target 3D shape identifier.
 * @param {Object} dimensions - Dimension map for the shape.
 * @returns {MensurationResult} Calculated mensuration results for the requested shape.
 * @throws {TypeError|RangeError|Error} When the shape is unknown or any dimension is invalid.
 */
export function calculateShape(shape, dimensions) {
  if (typeof shape !== 'string' || !shape.trim()) {
    throw new TypeError('shape must be a non-empty string.')
  }

  if (
    dimensions === null ||
    typeof dimensions !== 'object' ||
    Array.isArray(dimensions)
  ) {
    throw new TypeError('dimensions must be a plain object.')
  }

  switch (shape) {
    case SHAPES.CUBE:
      return calculateCube(dimensions.a)
    case SHAPES.CUBOID:
      return calculateCuboid(dimensions.l, dimensions.b, dimensions.h)
    case SHAPES.CYLINDER:
      return calculateCylinder(dimensions.r, dimensions.h)
    case SHAPES.CONE:
      return calculateCone(dimensions.r, dimensions.h)
    case SHAPES.SQUARE_PYRAMID:
      return calculateSquarePyramid(dimensions.a, dimensions.h)
    case SHAPES.SPHERE:
      return calculateSphere(dimensions.r)
    case SHAPES.TRIANGULAR_PRISM:
      return calculateTriangularPrism(dimensions.a, dimensions.h)
    case SHAPES.TRIANGULAR_PYRAMID:
      return calculateTriangularPyramid(dimensions.a, dimensions.h)
    case SHAPES.PENTAGONAL_PRISM:
      return calculatePentagonalPrism(dimensions.a, dimensions.h)
    case SHAPES.HEXAGONAL_PRISM:
      return calculateHexagonalPrism(dimensions.a, dimensions.h)
    case SHAPES.PENTAGONAL_PYRAMID:
      return calculatePentagonalPyramid(dimensions.a, dimensions.h)
    case SHAPES.HEXAGONAL_PYRAMID:
      return calculateHexagonalPyramid(dimensions.a, dimensions.h)
    case SHAPES.HEMISPHERE:
      return calculateHemisphere(dimensions.r)
    case SHAPES.FRUSTUM:
      return calculateFrustum(dimensions.r1, dimensions.r2, dimensions.h)
    case SHAPES.OCTAHEDRON:
      return calculateOctahedron(dimensions.a)
    default:
      throw new Error(
        `Unsupported shape "${shape}". Expected one of: ${Object.values(SHAPES).join(', ')}.`,
      )
  }
}

/**
 * Threshold above which dimensions expressed in metres trigger a unit-check hint.
 * @type {number}
 */
export const LARGE_METRE_THRESHOLD = 5

/**
 * Formats a dimension number cleanly for formula expressions without trailing zeroes.
 *
 * @param {number} value
 * @returns {string}
 */
function formatDim(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

/**
 * Computes an individual face-area breakdown and verifies that face areas sum to TSA
 * while lateral faces sum to LSA.
 *
 * @param {('cube'|'cuboid'|'cylinder')} shape - Target 3D shape identifier.
 * @param {Object} dimensions - Dimension map (`{ a }`, `{ l, b, h }`, or `{ r, h }`).
 * @returns {{
 *   shape: ('cube'|'cuboid'|'cylinder'),
 *   faces: Array<{
 *     id: string,
 *     role: ('base'|'top'|'lateral'|'curved'),
 *     isLateral: boolean,
 *     expression: string,
 *     area: number,
 *     piCoefficient?: number
 *   }>,
 *   lsaSum: number,
 *   tsaSum: number,
 *   excludedCapsArea: number,
 *   excludedCapsPiCoefficient?: number
 * }}
 */
export function calculateFaceBreakdown(shape, dimensions) {
  const result = calculateShape(shape, dimensions)

  if (shape === SHAPES.CUBE) {
    const { a } = result.dimensions
    const faceArea = a * a
    const expr = `${formatDim(a)} × ${formatDim(a)}`
    const faces = [
      { id: 'bottom', role: 'base', isLateral: false, expression: expr, area: faceArea },
      { id: 'front', role: 'lateral', isLateral: true, expression: expr, area: faceArea },
      { id: 'back', role: 'lateral', isLateral: true, expression: expr, area: faceArea },
      { id: 'top', role: 'top', isLateral: false, expression: expr, area: faceArea },
      { id: 'left', role: 'lateral', isLateral: true, expression: expr, area: faceArea },
      { id: 'right', role: 'lateral', isLateral: true, expression: expr, area: faceArea },
    ]

    return {
      shape,
      faces,
      lsaSum: 4 * faceArea,
      tsaSum: 6 * faceArea,
      excludedCapsArea: 2 * faceArea,
    }
  }

  if (shape === SHAPES.CUBOID) {
    const { l, b, h } = result.dimensions
    const capArea = l * b
    const frontBackArea = l * h
    const leftRightArea = b * h
    const capExpr = `${formatDim(l)} × ${formatDim(b)}`
    const fbExpr = `${formatDim(l)} × ${formatDim(h)}`
    const lrExpr = `${formatDim(b)} × ${formatDim(h)}`

    const faces = [
      { id: 'bottom', role: 'base', isLateral: false, expression: capExpr, area: capArea },
      { id: 'front', role: 'lateral', isLateral: true, expression: fbExpr, area: frontBackArea },
      { id: 'back', role: 'lateral', isLateral: true, expression: fbExpr, area: frontBackArea },
      { id: 'top', role: 'top', isLateral: false, expression: capExpr, area: capArea },
      { id: 'left', role: 'lateral', isLateral: true, expression: lrExpr, area: leftRightArea },
      { id: 'right', role: 'lateral', isLateral: true, expression: lrExpr, area: leftRightArea },
    ]

    return {
      shape,
      faces,
      lsaSum: 2 * (frontBackArea + leftRightArea),
      tsaSum: 2 * (capArea + frontBackArea + leftRightArea),
      excludedCapsArea: 2 * capArea,
    }
  }

  if (shape === SHAPES.CYLINDER) {
    const { r, h } = result.dimensions
    const capPi = r * r
    const capArea = Math.PI * capPi
    const wallPi = 2 * r * h
    const wallArea = Math.PI * wallPi
    const capExpr = `π × ${formatDim(r)}²`
    const wallExpr = `2π × ${formatDim(r)} × ${formatDim(h)}`

    const faces = [
      {
        id: 'bottom',
        role: 'base',
        isLateral: false,
        expression: capExpr,
        area: capArea,
        piCoefficient: capPi,
      },
      {
        id: 'lateral',
        role: 'curved',
        isLateral: true,
        expression: wallExpr,
        area: wallArea,
        piCoefficient: wallPi,
      },
      {
        id: 'top',
        role: 'top',
        isLateral: false,
        expression: capExpr,
        area: capArea,
        piCoefficient: capPi,
      },
    ]

    return {
      shape,
      faces,
      lsaSum: wallArea,
      tsaSum: wallArea + 2 * capArea,
      excludedCapsArea: 2 * capArea,
      excludedCapsPiCoefficient: 2 * capPi,
    }
  }

  if (shape === SHAPES.CONE) {
    const { r } = result.dimensions
    const l = result.slantHeight
    const basePi = r * r
    const baseArea = Math.PI * basePi
    const wallPi = r * l
    const wallArea = Math.PI * wallPi

    const faces = [
      {
        id: 'bottom',
        role: 'base',
        isLateral: false,
        expression: `π × ${formatDim(r)}²`,
        area: baseArea,
        piCoefficient: basePi,
      },
      {
        id: 'lateral',
        role: 'curved',
        isLateral: true,
        expression: `π × ${formatDim(r)} × ${formatDim(l)}`,
        area: wallArea,
        piCoefficient: wallPi,
      },
    ]

    return {
      shape,
      faces,
      lsaSum: wallArea,
      tsaSum: wallArea + baseArea,
      excludedCapsArea: baseArea,
      excludedCapsPiCoefficient: basePi,
    }
  }

  if (shape === SHAPES.SQUARE_PYRAMID) {
    const { a } = result.dimensions
    const s = result.slantHeight
    const baseArea = a * a
    const triArea = 0.5 * a * s
    const baseExpr = `${formatDim(a)} × ${formatDim(a)}`
    const triExpr = `½ × ${formatDim(a)} × ${formatDim(s)}`

    const faces = [
      { id: 'bottom', role: 'base', isLateral: false, expression: baseExpr, area: baseArea },
      { id: 'front', role: 'lateral', isLateral: true, expression: triExpr, area: triArea },
      { id: 'back', role: 'lateral', isLateral: true, expression: triExpr, area: triArea },
      { id: 'left', role: 'lateral', isLateral: true, expression: triExpr, area: triArea },
      { id: 'right', role: 'lateral', isLateral: true, expression: triExpr, area: triArea },
    ]

    return {
      shape,
      faces,
      lsaSum: 4 * triArea,
      tsaSum: baseArea + 4 * triArea,
      excludedCapsArea: baseArea,
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
    const { a, h } = result.dimensions
    const { baseArea } = regularPolygonMetrics(sides, a)
    const sideArea = a * h
    const aStr = formatDim(a)
    const hStr = formatDim(h)
    const baseExpr =
      sides === 3
        ? `(√3/4) × ${aStr}²`
        : sides === 6
          ? `(3√3/2) × ${aStr}²`
          : `(5/4) × ${aStr}² ÷ tan(36°)`
    const sideExpr = `${aStr} × ${hStr}`

    const faces = [
      { id: 'bottom', role: 'base', isLateral: false, expression: baseExpr, area: baseArea },
      { id: 'top', role: 'top', isLateral: false, expression: baseExpr, area: baseArea },
      ...Array.from({ length: sides }, (_, idx) => ({
        id: `side_${idx}`,
        role: 'lateral',
        isLateral: true,
        expression: sideExpr,
        area: sideArea,
      })),
    ]

    return {
      shape,
      faces,
      lsaSum: sides * sideArea,
      tsaSum: 2 * baseArea + sides * sideArea,
      excludedCapsArea: 2 * baseArea,
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
    const { a } = result.dimensions
    const s = result.slantHeight
    const baseArea = result.baseArea
    const triArea = 0.5 * a * s
    const aStr = formatDim(a)
    const sStr = formatDim(s)
    const baseExpr =
      sides === 3
        ? `(√3/4) × ${aStr}²`
        : sides === 6
          ? `(3√3/2) × ${aStr}²`
          : `(5/4) × ${aStr}² ÷ tan(36°)`
    const triExpr = `½ × ${aStr} × ${sStr}`

    const faces = [
      { id: 'bottom', role: 'base', isLateral: false, expression: baseExpr, area: baseArea },
      ...Array.from({ length: sides }, (_, idx) => ({
        id: `side_${idx}`,
        role: 'lateral',
        isLateral: true,
        expression: triExpr,
        area: triArea,
      })),
    ]

    return {
      shape,
      faces,
      lsaSum: sides * triArea,
      tsaSum: baseArea + sides * triArea,
      excludedCapsArea: baseArea,
    }
  }

  if (shape === SHAPES.HEMISPHERE) {
    const { r } = result.dimensions
    const basePi = r * r
    const domePi = 2 * r * r
    const baseArea = Math.PI * basePi
    const domeArea = Math.PI * domePi
    const rStr = formatDim(r)

    return {
      shape,
      faces: [
        {
          id: 'bottom',
          role: 'base',
          isLateral: false,
          expression: `π × ${rStr}²`,
          area: baseArea,
          piCoefficient: basePi,
        },
        {
          id: 'lateral',
          role: 'curved',
          isLateral: true,
          expression: `2π × ${rStr}²`,
          area: domeArea,
          piCoefficient: domePi,
        },
      ],
      lsaSum: domeArea,
      tsaSum: domeArea + baseArea,
      excludedCapsArea: baseArea,
      excludedCapsPiCoefficient: basePi,
    }
  }

  if (shape === SHAPES.FRUSTUM) {
    const { r1, r2 } = result.dimensions
    const l = result.slantHeight
    const botPi = r1 * r1
    const topPi = r2 * r2
    const wallPi = (r1 + r2) * l
    const botArea = Math.PI * botPi
    const topArea = Math.PI * topPi
    const wallArea = Math.PI * wallPi

    return {
      shape,
      faces: [
        {
          id: 'bottom',
          role: 'base',
          isLateral: false,
          expression: `π × ${formatDim(r1)}²`,
          area: botArea,
          piCoefficient: botPi,
        },
        {
          id: 'lateral',
          role: 'curved',
          isLateral: true,
          expression: `π(${formatDim(r1)}+${formatDim(r2)})×${formatDim(l)}`,
          area: wallArea,
          piCoefficient: wallPi,
        },
        {
          id: 'top',
          role: 'top',
          isLateral: false,
          expression: `π × ${formatDim(r2)}²`,
          area: topArea,
          piCoefficient: topPi,
        },
      ],
      lsaSum: wallArea,
      tsaSum: wallArea + botArea + topArea,
      excludedCapsArea: botArea + topArea,
      excludedCapsPiCoefficient: botPi + topPi,
    }
  }

  if (shape === SHAPES.OCTAHEDRON) {
    const { a } = result.dimensions
    const faceArea = result.faceArea
    const expr = `(√3/4) × ${formatDim(a)}²`
    const faces = Array.from({ length: 8 }, (_, idx) => ({
      id: `face_${idx}`,
      role: 'face',
      isLateral: false,
      expression: expr,
      area: faceArea,
    }))

    return {
      shape,
      faces,
      lsaSum: null,
      tsaSum: 8 * faceArea,
      excludedCapsArea: 0,
    }
  }

  // Sphere: continuous single closed surface, LSA not applicable
  const { r } = result.dimensions
  const surfacePi = 4 * r * r
  const surfaceArea = Math.PI * surfacePi

  return {
    shape,
    faces: [
      {
        id: 'surface',
        role: 'curved',
        isLateral: false,
        expression: `4π × ${formatDim(r)}²`,
        area: surfaceArea,
        piCoefficient: surfacePi,
      },
    ],
    lsaSum: null,
    tsaSum: surfaceArea,
    excludedCapsArea: 0,
  }
}

/**
 * Determines whether to display a unit-check hint when the user selects metres (`m`)
 * with large numeric dimensions that are commonly intended as centimetres (`cm`).
 *
 * @param {string} shape - Active shape identifier.
 * @param {Object} dimensions - Current dimension map.
 * @param {('cm'|'m')} unit - Active length unit.
 * @returns {boolean} True when unit is `'m'` and any relevant dimension >= LARGE_METRE_THRESHOLD.
 */
export function shouldShowUnitHint(shape, dimensions, unit) {
  if (unit !== 'm' || !dimensions || typeof dimensions !== 'object') {
    return false
  }

  let values = []
  if (shape === SHAPES.CUBE || shape === SHAPES.OCTAHEDRON) {
    values = [dimensions.a]
  } else if (shape === SHAPES.CUBOID) {
    values = [dimensions.l, dimensions.b, dimensions.h]
  } else if (shape === SHAPES.CYLINDER || shape === SHAPES.CONE) {
    values = [dimensions.r, dimensions.h]
  } else if (shape === SHAPES.FRUSTUM) {
    values = [dimensions.r1, dimensions.r2, dimensions.h]
  } else if (
    shape === SHAPES.SQUARE_PYRAMID ||
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM ||
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    values = [dimensions.a, dimensions.h]
  } else if (shape === SHAPES.SPHERE || shape === SHAPES.HEMISPHERE) {
    values = [dimensions.r]
  }

  return values.some(
    (val) =>
      typeof val === 'number' &&
      Number.isFinite(val) &&
      val >= LARGE_METRE_THRESHOLD,
  )
}

/**
 * Minimum and maximum linear scale factor multipliers for the Volume Enlargement lab.
 */
export const MIN_SCALE_FACTOR = 1
export const MAX_SCALE_FACTOR = 3

/**
 * All 11 mathematically distinct valid nets of a cube, grouped by spine family.
 * Coordinates are `[row, col]` integers where each square shares at least one edge.
 */
export const CUBE_NET_CATALOG = Object.freeze([
  {
    id: 'net_1_4_1_cross',
    family: '1-4-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 1],
    ]),
  },
  {
    id: 'net_1_4_1_same_end',
    family: '1-4-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
    ]),
  },
  {
    id: 'net_1_4_1_step_01',
    family: '1-4-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 1],
    ]),
  },
  {
    id: 'net_1_4_1_step_02',
    family: '1-4-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 2],
    ]),
  },
  {
    id: 'net_1_4_1_opposite_ends',
    family: '1-4-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 3],
    ]),
  },
  {
    id: 'net_1_4_1_zigzag',
    family: '1-4-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 2],
    ]),
  },
  {
    id: 'net_2_3_1_a',
    family: '2-3-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 1],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
    ]),
  },
  {
    id: 'net_2_3_1_b',
    family: '2-3-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 2],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
    ]),
  },
  {
    id: 'net_2_3_1_c',
    family: '2-3-1',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 3],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
    ]),
  },
  {
    id: 'net_2_2_2_stairs',
    family: '2-2-2',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 3],
    ]),
  },
  {
    id: 'net_3_3_twin',
    family: '3-3',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [1, 4],
    ]),
  },
])

/**
 * Curated valid & invalid cube-net puzzles for the interactive Net Checker Game.
 */
export const NET_CHECKER_PUZZLES = Object.freeze([
  {
    id: 'puzzle_valid_cross',
    isValid: true,
    explanationKey: 'valid141',
    rootIndex: 2,
    cells: CUBE_NET_CATALOG[0].cells,
  },
  {
    id: 'puzzle_invalid_same_side',
    isValid: false,
    explanationKey: 'invalidSameSide',
    rootIndex: 3,
    cells: Object.freeze([
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ]),
  },
  {
    id: 'puzzle_valid_stairs',
    isValid: true,
    explanationKey: 'valid222',
    rootIndex: 2,
    cells: CUBE_NET_CATALOG[9].cells,
  },
  {
    id: 'puzzle_invalid_line',
    isValid: false,
    explanationKey: 'invalidLine',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
    ]),
  },
  {
    id: 'puzzle_valid_33',
    isValid: true,
    explanationKey: 'valid33',
    rootIndex: 2,
    cells: CUBE_NET_CATALOG[10].cells,
  },
  {
    id: 'puzzle_invalid_2x2',
    isValid: false,
    explanationKey: 'invalid2x2',
    rootIndex: 3,
    cells: Object.freeze([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 1],
    ]),
  },
  {
    id: 'puzzle_valid_231',
    isValid: true,
    explanationKey: 'valid231',
    rootIndex: 2,
    cells: CUBE_NET_CATALOG[7].cells,
  },
  {
    id: 'puzzle_invalid_disconnected',
    isValid: false,
    explanationKey: 'invalidDisconnected',
    rootIndex: 1,
    cells: Object.freeze([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ]),
  },
  {
    id: 'puzzle_valid_opposite_ends',
    isValid: true,
    explanationKey: 'validOppositeEnds',
    rootIndex: 2,
    cells: CUBE_NET_CATALOG[4].cells,
  },
  {
    id: 'puzzle_invalid_u_ring',
    isValid: false,
    explanationKey: 'invalidURing',
    rootIndex: 3,
    cells: Object.freeze([
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [2, 0],
      [2, 1],
    ]),
  },
  {
    id: 'puzzle_valid_zigzag',
    isValid: true,
    explanationKey: 'valid141',
    rootIndex: 2,
    cells: CUBE_NET_CATALOG[5].cells,
  },
  {
    id: 'puzzle_invalid_five',
    isValid: false,
    explanationKey: 'invalidCount',
    rootIndex: 2,
    cells: Object.freeze([
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ]),
  },
])

const NORMAL_TO_CUBE_FACE = Object.freeze({
  '0,1,0': 'bottom',
  '0,-1,0': 'top',
  '0,0,-1': 'front',
  '0,0,1': 'back',
  '1,0,0': 'left',
  '-1,0,0': 'right',
})

function negateVec3(vec) {
  return [-vec[0] || 0, -vec[1] || 0, -vec[2] || 0]
}

/**
 * Validates whether a set of 2D grid squares (`[row, col]`) folds orthogonally
 * into a closed 3D cube with 6 distinct non-overlapping faces.
 *
 * @param {Array<[number, number]>} cells - 2D grid coordinates of squares.
 * @param {number} [rootIndex=0] - Index of the stationary root (`bottom`) square.
 * @returns {{
 *   valid: boolean,
 *   reason: 'valid'|'invalid_input'|'count'|'duplicate'|'disconnected'|'overlap',
 *   faceCount: number,
 *   overlapCount: number,
 *   coveredFaces: string[],
 *   assignedFaces: Array<{ index: number, row: number, col: number, faceId: string|null, overlapping: boolean }>
 * }}
 */
export function validateCubeNet(cells, rootIndex = 0) {
  if (!Array.isArray(cells)) {
    return {
      valid: false,
      reason: 'invalid_input',
      faceCount: 0,
      overlapCount: 0,
      coveredFaces: [],
      assignedFaces: [],
    }
  }

  const normalized = []
  const byKey = new Map()
  let hasDuplicate = false

  for (let i = 0; i < cells.length; i += 1) {
    const raw = cells[i]
    const row = Array.isArray(raw) ? raw[0] : raw?.row
    const col = Array.isArray(raw) ? raw[1] : raw?.col
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      return {
        valid: false,
        reason: 'invalid_input',
        faceCount: i,
        overlapCount: 0,
        coveredFaces: [],
        assignedFaces: [],
      }
    }
    const key = `${row},${col}`
    if (byKey.has(key)) {
      hasDuplicate = true
    } else {
      const entry = { index: i, row, col, key }
      normalized.push(entry)
      byKey.set(key, entry)
    }
  }

  if (hasDuplicate) {
    return {
      valid: false,
      reason: 'duplicate',
      faceCount: normalized.length,
      overlapCount: cells.length - normalized.length,
      coveredFaces: [],
      assignedFaces: [],
    }
  }

  if (normalized.length !== 6) {
    return {
      valid: false,
      reason: 'count',
      faceCount: normalized.length,
      overlapCount: 0,
      coveredFaces: [],
      assignedFaces: [],
    }
  }

  const safeRootIdx =
    Number.isInteger(rootIndex) && rootIndex >= 0 && rootIndex < normalized.length
      ? rootIndex
      : 0

  const root = normalized[safeRootIdx]
  // Basis aligned to Three.js XZ ground (+col = +X, +row = +Z, inner normal = +Y)
  const startState = {
    n: [0, 1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
  }

  const visited = new Map([[root.key, startState]])
  const queue = [root]

  while (queue.length > 0) {
    const curr = queue.shift()
    const st = visited.get(curr.key)
    const steps = [
      // East (+col): roll around -Z / +u into +Y
      [0, 1, { n: negateVec3(st.u), u: st.n, v: st.v }],
      // West (-col)
      [0, -1, { n: st.u, u: negateVec3(st.n), v: st.v }],
      // South (+row)
      [1, 0, { n: negateVec3(st.v), u: st.u, v: st.n }],
      // North (-row)
      [-1, 0, { n: st.v, u: st.u, v: negateVec3(st.n) }],
    ]

    for (const [dr, dc, nextState] of steps) {
      const neighborKey = `${curr.row + dr},${curr.col + dc}`
      if (byKey.has(neighborKey) && !visited.has(neighborKey)) {
        visited.set(neighborKey, nextState)
        queue.push(byKey.get(neighborKey))
      }
    }
  }

  if (visited.size !== 6) {
    return {
      valid: false,
      reason: 'disconnected',
      faceCount: 6,
      overlapCount: 0,
      coveredFaces: Array.from(visited.values()).map(
        (s) => NORMAL_TO_CUBE_FACE[s.n.join(',')],
      ),
      assignedFaces: normalized.map((c) => {
        const s = visited.get(c.key)
        return {
          index: c.index,
          row: c.row,
          col: c.col,
          faceId: s ? NORMAL_TO_CUBE_FACE[s.n.join(',')] : null,
          overlapping: false,
        }
      }),
    }
  }

  const seenFaceIds = new Set()
  let overlapCount = 0
  const assignedFaces = normalized.map((c) => {
    const s = visited.get(c.key)
    const faceId = NORMAL_TO_CUBE_FACE[s.n.join(',')]
    const overlapping = seenFaceIds.has(faceId)
    if (overlapping) {
      overlapCount += 1
    } else {
      seenFaceIds.add(faceId)
    }
    return {
      index: c.index,
      row: c.row,
      col: c.col,
      faceId,
      overlapping,
    }
  })

  return {
    valid: overlapCount === 0 && seenFaceIds.size === 6,
    reason: overlapCount === 0 ? 'valid' : 'overlap',
    faceCount: 6,
    overlapCount,
    coveredFaces: Array.from(seenFaceIds),
    assignedFaces,
  }
}

/**
 * Calculates linear (`k`), surface area (`k²`), and volume (`k³`) scaling
 * for any supported 3D shape given valid base dimensions and scale factor `k`.
 *
 * @param {string} shape - Active shape identifier from SHAPES.
 * @param {Object.<string, number>} dimensions - Base dimensions in [1, 10].
 * @param {number} scaleFactor - Positive scale factor `k` (1 to 3 in lab UI).
 * @returns {{
 *   shape: string,
 *   scaleFactor: number,
 *   areaFactor: number,
 *   volumeFactor: number,
 *   base: MensurationResult,
 *   scaled: {
 *     dimensions: Object.<string, number>,
 *     slantHeight?: number,
 *     baseArea?: number,
 *     faceArea?: number,
 *     surfaceArea?: number,
 *     lsa: number|null,
 *     tsa: number,
 *     volume: number,
 *     piCoefficients?: Object
 *   }
 * }}
 */
export function calculateScaleEnlargement(shape, dimensions, scaleFactor) {
  if (scaleFactor === undefined || scaleFactor === null) {
    throw new TypeError('scaleFactor is required.')
  }
  if (typeof scaleFactor !== 'number' || !Number.isFinite(scaleFactor)) {
    throw new TypeError('scaleFactor must be a finite number.')
  }
  if (scaleFactor <= 0) {
    throw new RangeError('scaleFactor must be greater than 0.')
  }

  const base = calculateShape(shape, dimensions)
  const k = scaleFactor
  const areaFactor = k * k
  const volumeFactor = k * k * k

  const scaledDimensions = {}
  for (const [key, val] of Object.entries(base.dimensions)) {
    scaledDimensions[key] = val * k
  }

  const scaled = {
    dimensions: scaledDimensions,
    lsa: base.lsa === null ? null : base.lsa * areaFactor,
    tsa: base.tsa * areaFactor,
    volume: base.volume * volumeFactor,
  }

  if (typeof base.slantHeight === 'number') {
    scaled.slantHeight = base.slantHeight * k
  }
  if (typeof base.baseArea === 'number') {
    scaled.baseArea = base.baseArea * areaFactor
  }
  if (typeof base.faceArea === 'number') {
    scaled.faceArea = base.faceArea * areaFactor
  }
  if (typeof base.surfaceArea === 'number') {
    scaled.surfaceArea = base.surfaceArea * areaFactor
  }
  if (base.piCoefficients) {
    scaled.piCoefficients = {
      lsa:
        base.piCoefficients.lsa === null
          ? null
          : base.piCoefficients.lsa * areaFactor,
      tsa: base.piCoefficients.tsa * areaFactor,
      volume: base.piCoefficients.volume * volumeFactor,
      ...(typeof base.piCoefficients.surfaceArea === 'number'
        ? { surfaceArea: base.piCoefficients.surfaceArea * areaFactor }
        : {}),
    }
  }

  return {
    shape,
    scaleFactor: k,
    areaFactor,
    volumeFactor,
    base,
    scaled,
  }
}

export const CLASS_10_PRACTICE_IDS = Object.freeze([
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'q7',
  'q8',
  'q9',
  'q10',
])

/**
 * Computes and mathematically verifies all 10 NCERT Class 10 Mensuration
 * board-examination practice problems using NetFold 3D's core shape formulas.
 *
 * @returns {Object} Verified numerical & ratio results keyed by `q1`..`q10`.
 */
export function calculateClass10PracticeSolutions() {
  // Q1: Solid sphere cut into two hemispheres -> ratio of TSA(sphere) : 2 * TSA(hemisphere)
  const unitSphere = calculateSphere(1)
  const unitHemi = calculateHemisphere(1)
  const q1SpherePi = unitSphere.piCoefficients.tsa
  const q1TwoHemiPi = 2 * unitHemi.piCoefficients.tsa

  // Q2: Largest right circular cone carved out from cube edge a = 2 cm (r = 1, h = 2)
  const q2Cone = calculateCone(1, 2)

  // Q3: Ratio of solid hemisphere TSA to r^2
  const q3Sample = calculateHemisphere(2)
  const q3RatioOverPi = q3Sample.tsa / (Math.PI * 2 * 2)

  // Q4: Two cubes of edge a joined end to end -> cuboid (2a, a, a)
  const q4Sample = calculateCuboid(2, 1, 1)

  // Q5: Cylinder CSA = 94.2 cm^2, h = 5 cm, pi = 3.14 -> r
  const q5Radius = 94.2 / (2 * 3.14 * 5)

  // Q6: Cone r = 7 cm, h = 24 cm -> l = 25 cm, CSA = pi * r * l (scaled from r=1.75, h=6 by 4x)
  const q6Scaled = calculateScaleEnlargement(SHAPES.CONE, { r: 1.75, h: 6 }, 4)
  const q6CsaNcert = (22 / 7) * 7 * q6Scaled.scaled.slantHeight

  // Q7: Closed hollow cylinder r = 0.7 m, h = 2.4 m (scaled from r=1.4, h=4.8 by 0.5x)
  const q7Scaled = calculateScaleEnlargement(
    SHAPES.CYLINDER,
    { r: 1.4, h: 4.8 },
    0.5,
  )
  const q7TsaNcert = 2 * (22 / 7) * 0.7 * (0.7 + 2.4)

  // Q8: Solid hemisphere TSA in terms of diameter d = 2r -> (3/4) * pi * d^2
  const q8Diameter = 2
  const q8CoeffOfPiD2 =
    calculateHemisphere(q8Diameter / 2).piCoefficients.tsa /
    (q8Diameter * q8Diameter)

  // Q9: Area of semicircle of diameter d -> (1/8) * pi * d^2
  const q9CoeffOfPiD2 = 0.5 * (1 / 4)

  // Q10: Cone base area B = 51 cm^2, volume V = 85 cm^3 -> h = 3V / B
  const q10Height = (3 * 85) / 51

  return {
    q1: {
      sphereTsaPiCoeff: q1SpherePi,
      twoHemispheresTsaPiCoeff: q1TwoHemiPi,
      simplifiedRatio: [2, 3],
      decimalRatio: unitSphere.tsa / (2 * unitHemi.tsa),
    },
    q2: {
      cubeEdge: 2,
      coneRadius: 1,
      coneHeight: 2,
      volume: q2Cone.volume,
      volumePiCoefficient: q2Cone.piCoefficients.volume,
    },
    q3: {
      tsaPiCoefficient: unitHemi.piCoefficients.tsa,
      ratioExactCoefficientOfPi: q3RatioOverPi,
      ratioNumeric: q3Sample.tsa / 4,
    },
    q4: {
      cuboidTsaCoefficientOfASquared: q4Sample.tsa,
    },
    q5: {
      csa: 94.2,
      height: 5,
      piUsed: 3.14,
      radius: q5Radius,
    },
    q6: {
      radius: 7,
      height: 24,
      slantHeight: q6Scaled.scaled.slantHeight,
      csaExactPiCoefficient: q6Scaled.scaled.piCoefficients.lsa,
      csaExact: q6Scaled.scaled.lsa,
      csaNcertPi22Over7: q6CsaNcert,
    },
    q7: {
      radius: 0.7,
      height: 2.4,
      tsaExactPiCoefficient: q7Scaled.scaled.piCoefficients.tsa,
      tsaExact: q7Scaled.scaled.tsa,
      tsaNcertPi22Over7: q7TsaNcert,
    },
    q8: {
      coeffOfPiDSquared: q8CoeffOfPiD2,
    },
    q9: {
      coeffOfPiDSquared: q9CoeffOfPiD2,
    },
    q10: {
      baseArea: 51,
      volume: 85,
      height: q10Height,
    },
  }
}


