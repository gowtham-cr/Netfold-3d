import { SHAPES } from '../utils/mathEngine.js'

/**
 * 18 high-signal targeted practice questions — 3 focused questions per Mistake Category —
 * ensuring Mistake Detective always provides a structured 3-question remediation drill.
 */
export const REMEDIATION_QUESTIONS = Object.freeze([
  // 1. Radius vs Diameter Confusion (3 questions)
  {
    id: 'rem_rd_1',
    mistakeCategory: 'radius_diameter',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    question:
      'A cylindrical tank has DIAMETER 14 cm and height 10 cm. Find its curved surface area (π = 22/7).',
    options: ['440 cm²', '880 cm²', '220 cm²', '1,540 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'radius_diameter',
      2: 'calculation_error',
      3: 'formula_selection',
    },
    formulaUsed: 'r = d / 2 = 7 cm; CSA = 2πrh = πdh',
    solutionSteps: [
      'Always halve the diameter first: r = 14 / 2 = 7 cm.',
      'CSA = 2 × (22/7) × 7 × 10 = 440 cm².',
    ],
  },
  {
    id: 'rem_rd_2',
    mistakeCategory: 'radius_diameter',
    topic: 'sphere_hemisphere',
    shape: SHAPES.HEMISPHERE,
    question:
      'A hemispherical bowl has internal DIAMETER 10 cm (leave π in answer). What is its outer curved surface area?',
    options: ['50π cm²', '200π cm²', '75π cm²', '100π cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'radius_diameter',
      2: 'csa_vs_tsa',
      3: 'formula_selection',
    },
    formulaUsed: 'r = d / 2 = 5 cm; CSA = 2πr²',
    solutionSteps: [
      'Radius r = 10 / 2 = 5 cm.',
      'Hemisphere CSA = 2π(5²) = 50π cm² (NOT 2π(10²) = 200π).',
    ],
  },
  {
    id: 'rem_rd_3',
    mistakeCategory: 'radius_diameter',
    topic: 'cone_frustum',
    shape: SHAPES.CONE,
    question:
      'A cone has base DIAMETER 12 cm and vertical height 8 cm. Find its volume (in terms of π).',
    options: ['96π cm³', '384π cm³', '288π cm³', '32π cm³'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'radius_diameter',
      2: 'formula_selection',
      3: 'calculation_error',
    },
    formulaUsed: 'r = d / 2 = 6 cm; V = ⅓πr²h',
    solutionSteps: [
      'Base radius r = 12 / 2 = 6 cm.',
      'Volume = ⅓ × π × 6² × 8 = ⅓ × 288π = 96π cm³.',
    ],
  },

  // 2. CSA vs TSA Confusion (3 questions)
  {
    id: 'rem_csa_tsa_1',
    mistakeCategory: 'csa_vs_tsa',
    topic: 'sphere_hemisphere',
    shape: SHAPES.HEMISPHERE,
    question:
      'A solid wooden hemisphere has radius 7 cm. What is its TOTAL surface area to varnish (π = 22/7)?',
    options: ['462 cm²', '308 cm²', '616 cm²', '154 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'csa_vs_tsa',
      2: 'formula_selection',
      3: 'calculation_error',
    },
    formulaUsed: 'Solid Hemisphere TSA = 2πr² (dome) + πr² (flat base) = 3πr²',
    solutionSteps: [
      'For a SOLID hemisphere, cutting exposes a circular base of area πr².',
      'TSA = 3 × (22/7) × 7² = 3 × 154 = 462 cm² (308 cm² omits the flat circular base).',
    ],
  },
  {
    id: 'rem_csa_tsa_2',
    mistakeCategory: 'csa_vs_tsa',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBOID,
    question:
      'You are painting ONLY the 4 walls of a rectangular hall (l = 8 m, b = 6 m, h = 4 m), skipping floor and ceiling. Find the painting area.',
    options: ['112 m²', '208 m²', '160 m²', '192 m²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'csa_vs_tsa',
      2: 'calculation_error',
      3: 'conceptual_misunderstanding',
    },
    formulaUsed: '4-Wall Area (LSA) = 2h(l + b)',
    solutionSteps: [
      'Exclude floor and ceiling: use Lateral Surface Area (LSA), not TSA.',
      'LSA = 2 × 4 × (8 + 6) = 8 × 14 = 112 m².',
    ],
  },
  {
    id: 'rem_csa_tsa_3',
    mistakeCategory: 'csa_vs_tsa',
    topic: 'cylinder',
    question:
      'An open-top cylindrical pen stand has radius 3.5 cm and height 10 cm. How much cardboard is needed (CSA + 1 bottom circle, π = 22/7)?',
    options: ['258.5 cm²', '220 cm²', '297 cm²', '385 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'csa_vs_tsa',
      2: 'csa_vs_tsa',
      3: 'formula_selection',
    },
    formulaUsed: 'Open-top Cylinder Area = 2πrh + πr²',
    solutionSteps: [
      'CSA (curved side) = 2 × (22/7) × 3.5 × 10 = 220 cm².',
      'Bottom circle ONLY (top is open!) = (22/7) × 3.5² = 38.5 cm².',
      'Total = 220 + 38.5 = 258.5 cm².',
    ],
  },

  // 3. Formula Selection Error (3 questions)
  {
    id: 'rem_form_1',
    mistakeCategory: 'formula_selection',
    topic: 'cone_frustum',
    shape: SHAPES.CONE,
    question:
      'A conical cup and a cylindrical cup have equal radius 3 cm and height 7 cm. What is the volume of the CONE (π = 22/7)?',
    options: ['66 cm³', '198 cm³', '75.4 cm³', '132 cm³'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'formula_selection',
      2: 'csa_vs_tsa',
      3: 'calculation_error',
    },
    formulaUsed: 'Cone Volume = ⅓πr²h (one-third of cylinder πr²h!)',
    solutionSteps: [
      'A cone holds ⅓ the volume of a cylinder with identical r and h.',
      'V = ⅓ × (22/7) × 9 × 7 = 66 cm³ (198 cm³ forgot the ⅓ factor).',
    ],
  },
  {
    id: 'rem_form_2',
    mistakeCategory: 'formula_selection',
    topic: 'prism_pyramid',
    shape: SHAPES.SQUARE_PYRAMID,
    question:
      'A right square pyramid has base side 6 cm and vertical height 4 cm. Find its VOLUME.',
    options: ['48 cm³', '144 cm³', '72 cm³', '96 cm³'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'formula_selection',
      2: 'calculation_error',
      3: 'csa_vs_tsa',
    },
    formulaUsed: 'Pyramid Volume = ⅓ × Base Area × h = ⅓a²h',
    solutionSteps: [
      'All pyramids taper to an apex, so Volume has the ⅓ multiplier.',
      'V = ⅓ × 6² × 4 = ⅓ × 144 = 48 cm³.',
    ],
  },
  {
    id: 'rem_form_3',
    mistakeCategory: 'formula_selection',
    topic: 'sphere_hemisphere',
    shape: SHAPES.SPHERE,
    question:
      'What is the volume of a solid sphere of radius 3 cm (in terms of π)?',
    options: ['36π cm³', '108π cm³', '27π cm³', '18π cm³'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'formula_selection',
      2: 'formula_selection',
      3: 'csa_vs_tsa',
    },
    formulaUsed: 'Sphere Volume = (4/3)πr³',
    solutionSteps: [
      'Sphere volume uses factor 4/3 with r³: V = (4/3) × π × 3³ = 4 × 9π = 36π cm³.',
    ],
  },

  // 4. Unit Conversion Error (3 questions)
  {
    id: 'rem_unit_1',
    mistakeCategory: 'unit_conversion',
    topic: 'volume',
    shape: SHAPES.CUBOID,
    question:
      'A rectangular fish tank measures 1 m × 0.5 m × 0.4 m. How many LITRES of water fill it completely?',
    options: ['200 Litres', '0.2 Litres', '2,000 Litres', '20 Litres'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'unit_conversion',
      2: 'unit_conversion',
      3: 'calculation_error',
    },
    formulaUsed: '1 m³ = 1,000 Litres',
    solutionSteps: [
      'Volume in m³ = 1 × 0.5 × 0.4 = 0.2 m³.',
      'Multiply m³ by 1,000 for Litres: 0.2 × 1,000 = 200 Litres.',
    ],
  },
  {
    id: 'rem_unit_2',
    mistakeCategory: 'unit_conversion',
    topic: 'conversion_melting',
    shape: SHAPES.CUBE,
    question:
      'How many 1 cm side solid cubes fit inside a cubical box of side 1 metre?',
    options: ['1,000,000', '100', '10,000', '1,000'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'unit_conversion',
      2: 'unit_conversion',
      3: 'unit_conversion',
    },
    formulaUsed: '1 m = 100 cm ⇒ 1 m³ = 100³ cm³ = 10⁶ cm³',
    solutionSteps: [
      'Side in cm = 100 cm.',
      'Number of 1 cm³ cubes = 100 × 100 × 100 = 1,000,000 (not 100 or 10,000!).',
    ],
  },
  {
    id: 'rem_unit_3',
    mistakeCategory: 'unit_conversion',
    topic: 'real_life',
    shape: SHAPES.CYLINDER,
    question:
      'A pipe has radius 7 cm and water flows inside to fill 7.7 m³. How many cm³ is 7.7 m³?',
    options: ['7,700,000 cm³', '770 cm³', '77,000 cm³', '7,700 cm³'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'unit_conversion',
      2: 'unit_conversion',
      3: 'unit_conversion',
    },
    formulaUsed: '1 m³ = 10⁶ cm³',
    solutionSteps: ['Multiply m³ by 10⁶: 7.7 × 1,000,000 = 7,700,000 cm³.'],
  },

  // 5. Calculation Error (3 questions)
  {
    id: 'rem_calc_1',
    mistakeCategory: 'calculation_error',
    topic: 'cone_frustum',
    shape: SHAPES.CONE,
    question:
      'A cone has radius r = 7 cm and height h = 24 cm. Find its CSA (π = 22/7).',
    options: ['550 cm²', '528 cm²', '154 cm²', '704 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'calculation_error',
      2: 'calculation_error',
      3: 'csa_vs_tsa',
    },
    formulaUsed: 'l = √(7² + 24²) = 25 cm; CSA = πrl',
    solutionSteps: [
      'Compute slant height first: l = √(49 + 576) = √625 = 25 cm (not h = 24!).',
      'CSA = (22/7) × 7 × 25 = 550 cm².',
    ],
  },
  {
    id: 'rem_calc_2',
    mistakeCategory: 'calculation_error',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    question:
      'Find 2 × (22/7) × 3.5 × 8 carefully (Cylinder CSA for r = 3.5 cm, h = 8 cm).',
    options: ['176 cm²', '154 cm²', '88 cm²', '352 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'calculation_error',
      2: 'calculation_error',
      3: 'radius_diameter',
    },
    formulaUsed: '2 × (22/7) × 3.5 = 22 cleanly!',
    solutionSteps: [
      'Spot 2 × 3.5 = 7 first so the 7 denominator cancels: (22/7) × 7 = 22.',
      '22 × 8 = 176 cm².',
    ],
  },
  {
    id: 'rem_calc_3',
    mistakeCategory: 'calculation_error',
    topic: 'frustum',
    shape: SHAPES.FRUSTUM,
    question:
      'A frustum has r₁ = 8 cm, r₂ = 3 cm, and height h = 12 cm. Find its slant height l.',
    options: ['13 cm', '17 cm', '√169 − 5 cm', '15 cm'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'calculation_error',
      2: 'calculation_error',
      3: 'formula_selection',
    },
    formulaUsed: 'l = √(h² + (r₁ − r₂)²)',
    solutionSteps: [
      'Subtract radii first: r₁ − r₂ = 8 − 3 = 5 cm (do NOT add them inside l!).',
      'l = √(12² + 5²) = √(144 + 25) = √169 = 13 cm.',
    ],
  },

  // 6. Conceptual Misunderstanding (3 questions)
  {
    id: 'rem_conc_1',
    mistakeCategory: 'conceptual_misunderstanding',
    topic: 'combination_of_solids',
    shape: SHAPES.CUBE,
    question:
      'Two cubes each of edge 4 cm are joined end-to-end into one cuboid (8 × 4 × 4). What is the TSA of the resulting cuboid?',
    options: ['160 cm²', '192 cm²', '128 cm²', '144 cm²'],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'conceptual_misunderstanding',
      2: 'csa_vs_tsa',
      3: 'calculation_error',
    },
    formulaUsed: 'Joining 2 cubes hides 2 glued faces ⇒ 10 faces remain = 10a²',
    solutionSteps: [
      'Two separate cubes have 12 square faces, NOT 12 exterior faces after joining!',
      'Gluing hides 2 touching faces ⇒ 10 exterior faces × 4² = 160 cm².',
    ],
  },
  {
    id: 'rem_conc_2',
    mistakeCategory: 'conceptual_misunderstanding',
    topic: 'volume',
    shape: SHAPES.CUBE,
    question:
      'If every edge of a cube is DOUBLED (scale factor k = 2), what happens to its Surface Area vs Volume?',
    options: [
      'Area × 4 (k²), Volume × 8 (k³)',
      'Area × 2 (k), Volume × 6',
      'Both Area and Volume double (× 2)',
      'Area × 8 (k³), Volume × 4 (k²)',
    ],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'conceptual_misunderstanding',
      2: 'conceptual_misunderstanding',
      3: 'conceptual_misunderstanding',
    },
    formulaUsed: 'Surface Area scales by k², Volume scales by k³',
    solutionSteps: [
      'Area multiplies 2 linear dimensions ⇒ k² = 2² = 4×.',
      'Volume multiplies 3 linear dimensions ⇒ k³ = 2³ = 8×.',
    ],
  },
  {
    id: 'rem_conc_3',
    mistakeCategory: 'conceptual_misunderstanding',
    topic: 'sphere_hemisphere',
    shape: SHAPES.SPHERE,
    question:
      'A solid metal sphere is melted and recast into 8 identical small solid spheres. Comparing the total material VOLUME vs total SURFACE AREA:',
    options: [
      'Total Volume stays conserved; Total Surface Area doubles (increases)!',
      'Both Volume and Surface Area stay equal.',
      'Total Volume multiplies by 8; Surface Area stays constant.',
      'Total Surface Area decreases by half.',
    ],
    correctIndex: 0,
    distractorDiagnosis: {
      1: 'conceptual_misunderstanding',
      2: 'conceptual_misunderstanding',
      3: 'conceptual_misunderstanding',
    },
    formulaUsed: 'Melting conserves Volume V, NEVER Surface Area',
    solutionSteps: [
      'Mass and volume are conserved when melting and recasting solids.',
      'Splitting 1 sphere (r) into 8 spheres (r/2) creates 8 × 4π(r/2)² = 8πr² = DOUBLE the surface area!',
    ],
  },
])
