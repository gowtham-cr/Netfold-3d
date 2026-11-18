import { SHAPES } from '../utils/mathEngine.js'

export const REALITY_PRESETS = Object.freeze([
  {
    id: 'water_tank',
    shape: SHAPES.CYLINDER,
    icon: '🛢️',
    categoryKey: 'water_tank',
    defaultUnit: 'm',
    defaultDimensions: { r: 2, h: 5 },
    realLifeUses: [
      'Municipal & rooftop cylindrical tanks resist outward water pressure evenly around curved walls.',
      'Vertical cylinders minimise seam welding compared to rectangular boxes for the same stored volume.',
    ],
    defaultCostRate: 180,
    materialMode: 'paint_and_capacity',
  },
  {
    id: 'shipping_box',
    shape: SHAPES.CUBOID,
    icon: '📦',
    categoryKey: 'shipping_box',
    defaultUnit: 'cm',
    defaultDimensions: { l: 40, b: 30, h: 25 },
    realLifeUses: [
      'Rectilinear cartons stack flush inside shipping containers with zero wasted shelf gaps.',
      'Box manufacturers compute TSA plus a 10% flap/overlap allowance when cutting corrugated sheets.',
    ],
    defaultCostRate: 0.15,
    materialMode: 'packaging',
  },
  {
    id: 'conical_tent',
    shape: SHAPES.CONE,
    icon: '⛺',
    categoryKey: 'conical_tent',
    defaultUnit: 'm',
    defaultDimensions: { r: 3, h: 4 },
    realLifeUses: [
      'Conical tents shed heavy rain & snow downward while requiring cloth only for CSA = πrl.',
      'Traffic cones, grain funnels, and megaphone horns rely on slant height l = √(r² + h²).',
    ],
    defaultCostRate: 250,
    materialMode: 'canvas_csa',
  },
  {
    id: 'storage_crate',
    shape: SHAPES.CUBE,
    icon: '🧊',
    categoryKey: 'storage_crate',
    defaultUnit: 'm',
    defaultDimensions: { a: 2 },
    realLifeUses: [
      'Among rectangular cuboids of a given volume, a cube always requires the least total surface area (Cardboard/Paint).',
      'Equal faces make modular warehouse crates interchangeable along all 3 axes.',
    ],
    defaultCostRate: 220,
    materialMode: 'paint_and_capacity',
  },
  {
    id: 'hopper_bucket',
    shape: SHAPES.FRUSTUM,
    icon: '🪣',
    categoryKey: 'hopper_bucket',
    defaultUnit: 'cm',
    defaultDimensions: { r1: 18, r2: 12, h: 24 },
    realLifeUses: [
      'Tapered frustum buckets & grain hoppers stack cleanly inside each other during delivery.',
      'An open-top frustum uses CSA + bottom circle area πr₂², omitting the top circular opening.',
    ],
    defaultCostRate: 0.4,
    materialMode: 'capacity_open_top',
  },
  {
    id: 'dome_pavilion',
    shape: SHAPES.HEMISPHERE,
    icon: '🏛️',
    categoryKey: 'dome_pavilion',
    defaultUnit: 'm',
    defaultDimensions: { r: 5 },
    realLifeUses: [
      'Hemispherical domes distribute roof compression symmetrically to circular walls.',
      'Curved domes cannot flatten onto a single rectangular metal sheet without radial gore strips (no exact flat net).',
    ],
    defaultCostRate: 340,
    materialMode: 'construction_dome',
  },
  {
    id: 'cabin_roof',
    shape: SHAPES.TRIANGULAR_PRISM,
    icon: '🏠',
    categoryKey: 'cabin_roof',
    defaultUnit: 'm',
    defaultDimensions: { a: 6, h: 8 },
    realLifeUses: [
      'Triangular attic prisms resist heavy snow loads and unfold into 2 triangular ends + 3 rectangular panels.',
      'Optical prisms use the exact same cross-sectional symmetry to refract light uniformly.',
    ],
    defaultCostRate: 280,
    materialMode: 'construction_roof',
  },
  {
    id: 'glass_atrium',
    shape: SHAPES.SQUARE_PYRAMID,
    icon: '🔺',
    categoryKey: 'glass_atrium',
    defaultUnit: 'm',
    defaultDimensions: { a: 6, h: 4 },
    realLifeUses: [
      'Modern museums & shopping atriums glaze 4 triangular slanted faces (LSA = 2al) for natural daylighting.',
      'Square pyramids illustrate how slant height on the face differs from vertical apex height.',
    ],
    defaultCostRate: 450,
    materialMode: 'construction_cladding',
  },
])

/**
 * Transparent local metadata/aspect heuristic for uploaded object photos.
 * NEVER claims physical metric measurements from an uncalibrated 2D photo.
 */
export function suggestShapeFromImageMeta({ fileName = '', width = 0, height = 0 }) {
  const lower = String(fileName).toLowerCase()
  if (/tank|drum|pipe|bottle|can|barrel|cylinder|water/.test(lower)) {
    return {
      suggestedShape: SHAPES.CYLINDER,
      reasonKey: 'filename_cylinder',
    }
  }
  if (/box|carton|package|crate|brick|room|building|cabinet|container/.test(lower)) {
    return {
      suggestedShape: SHAPES.CUBOID,
      reasonKey: 'filename_cuboid',
    }
  }
  if (/cone|funnel|tent|ice|cap|hat|tipi/.test(lower)) {
    return {
      suggestedShape: SHAPES.CONE,
      reasonKey: 'filename_cone',
    }
  }
  if (/dome|bowl|igloo|hemisphere|globe|ball|sphere/.test(lower)) {
    return {
      suggestedShape: SHAPES.HEMISPHERE,
      reasonKey: 'filename_dome',
    }
  }
  if (/bucket|pail|lamp|hopper|frustum/.test(lower)) {
    return {
      suggestedShape: SHAPES.FRUSTUM,
      reasonKey: 'filename_frustum',
    }
  }
  if (/pyramid|tent|monument/.test(lower)) {
    return {
      suggestedShape: SHAPES.SQUARE_PYRAMID,
      reasonKey: 'filename_pyramid',
    }
  }
  if (/cube|dice|rubik/.test(lower)) {
    return {
      suggestedShape: SHAPES.CUBE,
      reasonKey: 'filename_cube',
    }
  }

  if (width > 0 && height > 0) {
    const aspect = width / height
    if (aspect < 0.85) {
      return {
        suggestedShape: SHAPES.CYLINDER,
        reasonKey: 'aspect_tall',
      }
    }
    if (aspect > 1.25) {
      return {
        suggestedShape: SHAPES.CUBOID,
        reasonKey: 'aspect_wide',
      }
    }
  }

  return {
    suggestedShape: SHAPES.CYLINDER,
    reasonKey: 'default_visual',
  }
}

function pos(val, fallback = 1) {
  const n = Number(val)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * Computes exact physical mensuration + material quantities for any real-world dimensions
 * without restricting realistic dimensions to the [1, 10] 3D viewer range.
 */
export function computeRealityMetrics({
  shape = SHAPES.CYLINDER,
  dimensions = {},
  unit = 'm',
  paintCoverageM2PerLitre = 10,
  wastagePct = 10,
  ratePerAreaUnit = 150,
}) {
  const pi = Math.PI
  let lsa
  let tsa
  let volume
  let slantHeight = null
  let formulaLsa
  let formulaTsa
  let formulaVol
  let steps

  if (shape === SHAPES.CUBE) {
    const a = pos(dimensions.a, 2)
    lsa = 4 * a * a
    tsa = 6 * a * a
    volume = a * a * a
    formulaLsa = '4a²'
    formulaTsa = '6a²'
    formulaVol = 'a³'
    steps = [
      `LSA = 4 × ${a}² = ${lsa.toFixed(2)} ${unit}²`,
      `TSA = 6 × ${a}² = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = ${a}³ = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.CUBOID) {
    const l = pos(dimensions.l, 4)
    const b = pos(dimensions.b, 3)
    const h = pos(dimensions.h, 2)
    lsa = 2 * h * (l + b)
    tsa = 2 * (l * b + b * h + h * l)
    volume = l * b * h
    formulaLsa = '2h(l + b)'
    formulaTsa = '2(lb + bh + hl)'
    formulaVol = 'l × b × h'
    steps = [
      `LSA (4 walls) = 2 × ${h} × (${l} + ${b}) = ${lsa.toFixed(2)} ${unit}²`,
      `TSA = 2(${l}×${b} + ${b}×${h} + ${h}×${l}) = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = ${l} × ${b} × ${h} = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.CYLINDER) {
    const r = pos(dimensions.r, 2)
    const h = pos(dimensions.h, 5)
    lsa = 2 * pi * r * h
    tsa = 2 * pi * r * (r + h)
    volume = pi * r * r * h
    formulaLsa = '2πrh'
    formulaTsa = '2πr(r + h)'
    formulaVol = 'πr²h'
    steps = [
      `CSA (curved wall) = 2π × ${r} × ${h} = ${lsa.toFixed(2)} ${unit}²`,
      `TSA (with top & base) = 2π × ${r} × (${r} + ${h}) = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = π × ${r}² × ${h} = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.CONE) {
    const r = pos(dimensions.r, 3)
    const h = pos(dimensions.h, 4)
    slantHeight = Math.hypot(r, h)
    lsa = pi * r * slantHeight
    tsa = pi * r * (r + slantHeight)
    volume = (pi * r * r * h) / 3
    formulaLsa = 'πrl'
    formulaTsa = 'πr(r + l)'
    formulaVol = '⅓πr²h'
    steps = [
      `Slant height l = √(${r}² + ${h}²) = ${slantHeight.toFixed(2)} ${unit}`,
      `CSA (canvas slope) = π × ${r} × ${slantHeight.toFixed(2)} = ${lsa.toFixed(2)} ${unit}²`,
      `TSA = π × ${r} × (${r} + ${slantHeight.toFixed(2)}) = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = ⅓π × ${r}² × ${h} = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.SQUARE_PYRAMID) {
    const a = pos(dimensions.a, 4)
    const h = pos(dimensions.h, 5)
    slantHeight = Math.hypot(a / 2, h)
    lsa = 2 * a * slantHeight
    tsa = a * a + lsa
    volume = (a * a * h) / 3
    formulaLsa = '2al'
    formulaTsa = 'a² + 2al'
    formulaVol = '⅓a²h'
    steps = [
      `Slant height l = √((${a}/2)² + ${h}²) = ${slantHeight.toFixed(2)} ${unit}`,
      `LSA (4 glass triangles) = 2 × ${a} × ${slantHeight.toFixed(2)} = ${lsa.toFixed(2)} ${unit}²`,
      `TSA = ${a}² + ${lsa.toFixed(2)} = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = ⅓ × ${a}² × ${h} = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.TRIANGULAR_PRISM) {
    const a = pos(dimensions.a, 4)
    const h = pos(dimensions.h, 6)
    const baseArea = (Math.sqrt(3) / 4) * a * a
    lsa = 3 * a * h
    tsa = lsa + 2 * baseArea
    volume = baseArea * h
    formulaLsa = '3ah'
    formulaTsa = '3ah + (√3/2)a²'
    formulaVol = '(√3/4)a²h'
    steps = [
      `Base equilateral triangle area = (√3/4) × ${a}² = ${baseArea.toFixed(2)} ${unit}²`,
      `LSA (3 rectangular panels) = 3 × ${a} × ${h} = ${lsa.toFixed(2)} ${unit}²`,
      `TSA = ${lsa.toFixed(2)} + 2×${baseArea.toFixed(2)} = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = ${baseArea.toFixed(2)} × ${h} = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.FRUSTUM) {
    const r1 = pos(dimensions.r1, 5)
    const r2 = pos(dimensions.r2, 3)
    const h = pos(dimensions.h, 4)
    slantHeight = Math.hypot(h, Math.abs(r1 - r2))
    lsa = pi * (r1 + r2) * slantHeight
    tsa = lsa + pi * r1 * r1 + pi * r2 * r2
    volume = (pi * h * (r1 * r1 + r1 * r2 + r2 * r2)) / 3
    formulaLsa = 'π(r₁ + r₂)l'
    formulaTsa = 'π(r₁ + r₂)l + πr₁² + πr₂²'
    formulaVol = '⅓πh(r₁² + r₁r₂ + r₂²)'
    steps = [
      `Slant height l = √(${h}² + |${r1} − ${r2}|²) = ${slantHeight.toFixed(2)} ${unit}`,
      `CSA = π(${r1} + ${r2}) × ${slantHeight.toFixed(2)} = ${lsa.toFixed(2)} ${unit}²`,
      `TSA = ${tsa.toFixed(2)} ${unit}² (Open-top bucket area = CSA + πr₂² = ${(lsa + pi * r2 * r2).toFixed(2)} ${unit}²)`,
      `Volume = ⅓π × ${h} × (${r1}² + ${r1}×${r2} + ${r2}²) = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else if (shape === SHAPES.HEMISPHERE) {
    const r = pos(dimensions.r, 4)
    lsa = 2 * pi * r * r
    tsa = 3 * pi * r * r
    volume = (2 * pi * r * r * r) / 3
    formulaLsa = '2πr²'
    formulaTsa = '3πr²'
    formulaVol = '⅔πr³'
    steps = [
      `CSA (dome shell) = 2π × ${r}² = ${lsa.toFixed(2)} ${unit}²`,
      `TSA (shell + flat floor) = 3π × ${r}² = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = ⅔π × ${r}³ = ${volume.toFixed(2)} ${unit}³`,
    ]
  } else {
    // SPHERE fallback
    const r = pos(dimensions.r, 4)
    lsa = 4 * pi * r * r
    tsa = lsa
    volume = (4 * pi * r * r * r) / 3
    formulaLsa = '4πr²'
    formulaTsa = '4πr²'
    formulaVol = '(4/3)πr³'
    steps = [
      `Total Surface Area = 4π × ${r}² = ${tsa.toFixed(2)} ${unit}²`,
      `Volume = (4/3)π × ${r}³ = ${volume.toFixed(2)} ${unit}³`,
    ]
  }

  const volumeM3 = unit === 'm' ? volume : volume / 1_000_000
  const capacityLitres = volumeM3 * 1000
  const areaM2 = unit === 'm' ? tsa : tsa / 10_000
  const paintLitres = paintCoverageM2PerLitre > 0 ? areaM2 / paintCoverageM2PerLitre : 0
  const packagingSheet = tsa * (1 + wastagePct / 100)
  const estimatedCost = Number((tsa * ratePerAreaUnit).toFixed(2))

  return {
    shape,
    unit,
    lsa,
    tsa,
    volume,
    slantHeight,
    formulaLsa,
    formulaTsa,
    formulaVol,
    steps,
    capacityLitres,
    paintLitres,
    packagingSheet,
    estimatedCost,
    supportsFlatNet: shape !== SHAPES.SPHERE && shape !== SHAPES.HEMISPHERE,
  }
}

/**
 * Scales arbitrary real-world physical dimensions cleanly into [1, 10] for Canvas3D visualization.
 */
export function normalizeForCanvas3D(shape, dimensions = {}) {
  const vals = Object.values(dimensions).filter((v) => Number.isFinite(v) && v > 0)
  const maxVal = vals.length > 0 ? Math.max(...vals) : 4
  const scale = maxVal > 10 ? 8 / maxVal : maxVal < 1 ? 3 / maxVal : 1
  const out = {}
  for (const [k, v] of Object.entries(dimensions)) {
    if (Number.isFinite(v)) {
      out[k] = Math.min(10, Math.max(1, Number((v * scale).toFixed(2))))
    }
  }
  if (shape === SHAPES.FRUSTUM && out.r1 <= out.r2) {
    out.r1 = Math.min(10, out.r2 + 2)
  }
  return out
}

export const REALITY_CHALLENGES = Object.freeze([
  {
    id: 'real_ch_tank_diameter',
    shape: SHAPES.CYLINDER,
    topic: 'cylinder',
    question:
      'Water Tank Capacity Challenge: A cylindrical rooftop tank has DIAMETER 2 m and height 3.5 m. How many LITRES of water does it hold? (Take π = 22/7, 1 m³ = 1,000 L)',
    options: ['11,000 Litres', '44,000 Litres', '11 Litres', '22,000 Litres'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'radius_diameter', // Used diameter 2 as radius r -> 4× volume!
      2: 'unit_conversion', // Forgot × 1000 to convert m³ -> Litres!
      3: 'formula_selection', // Used 2πrh CSA instead of πr²h volume!
    },
    formulaUsed: 'V = πr²h, Capacity = V × 1,000 Litres',
    solutionSteps: [
      'Radius r = Diameter / 2 = 2 / 2 = 1 m (classic trap: do NOT plug d = 2 as r!).',
      'Volume = (22/7) × 1² × 3.5 = 22 × 0.5 = 11 m³.',
      'Convert to Litres: 11 × 1,000 = 11,000 Litres.',
    ],
  },
  {
    id: 'real_ch_paint_csa_tsa',
    shape: SHAPES.CUBOID,
    topic: 'cube_cuboid',
    question:
      'Packaging Material Challenge: A closed rectangular cardboard box measures 50 cm × 40 cm × 30 cm. Find the total cardboard area needed (in cm²).',
    options: ['9,400 cm²', '5,400 cm²', '60,000 cm²', '4,700 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'csa_vs_tsa', // Computed only 4 lateral walls 2h(l+b) = 5400, omitted top & bottom!
      2: 'conceptual_misunderstanding', // Computed Volume l×b×h instead of Surface Area!
      3: 'formula_selection', // Forgot factor of 2 in TSA = 2(lb + bh + hl)!
    },
    formulaUsed: 'TSA = 2(lb + bh + hl)',
    solutionSteps: [
      'Sum of single face pairs: lb + bh + hl = 2000 + 1200 + 1500 = 4,700 cm².',
      'Multiply by 2 for all 6 faces: TSA = 2 × 4,700 = 9,400 cm².',
    ],
  },
  {
    id: 'real_ch_tent_canvas',
    shape: SHAPES.CONE,
    topic: 'cone_frustum',
    question:
      'Construction Fabric Challenge: A conical exhibition tent has base radius 7 m and vertical height 24 m. How many m² of canvas are required for its conical roof (no floor cloth)? (Take π = 22/7)',
    options: ['550 m²', '704 m²', '528 m²', '1,232 m²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'csa_vs_tsa', // Added floor circle πr² -> 704 m² TSA!
      2: 'calculation_error', // Used vertical height 24 instead of slant height 25 (22×24 = 528)!
      3: 'formula_selection', // Used cone volume ⅓πr²h = 1,232 instead of CSA = πrl!
    },
    formulaUsed: 'l = √(r² + h²), Canvas CSA = πrl',
    solutionSteps: [
      'Slant height l = √(7² + 24²) = √625 = 25 m (7-24-25 Pythagorean triple).',
      'Canvas needed (CSA only) = (22/7) × 7 × 25 = 22 × 25 = 550 m².',
    ],
  },
  {
    id: 'real_ch_tank_diameter_paint',
    shape: SHAPES.CYLINDER,
    topic: 'cylinder',
    question:
      'Tank Exterior Paint Challenge: A closed cylindrical storage drum has DIAMETER 6 m and height 5 m. Including top and bottom lids, find the total surface area to paint (take π = 3.14).',
    options: ['150.72 m²', '94.20 m²', '414.48 m²', '141.30 m²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'csa_vs_tsa', // Paint only curved wall 2πrh = 94.2 m² (forgot circular lids)!
      2: 'radius_diameter', // Plugged diameter d = 6 as radius r -> 2π(6)(11) = 414.48 m²!
      3: 'formula_selection', // Used πr²h volume instead of TSA = 2πr(r + h)!
    },
    formulaUsed: 'r = d/2 = 3 m; TSA = 2πr(r + h)',
    solutionSteps: [
      'Divide diameter by 2 first: r = 6 / 2 = 3 m.',
      'TSA = 2 × 3.14 × 3 × (3 + 5) = 18.84 × 8 = 150.72 m².',
    ],
  },
])
