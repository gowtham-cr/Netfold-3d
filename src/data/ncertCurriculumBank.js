import { SHAPES } from '../utils/mathEngine.js'

export const NCERT_CLASSES = Object.freeze([
  { id: 'all', label: 'All Classes (6–10)' },
  { id: '10', label: 'Class 10 · Surface Areas & Volumes (Priority)' },
  { id: '9', label: 'Class 9 · Surface Areas & Volumes' },
  { id: '8', label: 'Class 8 · Mensuration' },
  { id: '6_7', label: 'Classes 6–7 · Perimeter, Area & Units' },
])

/**
 * Curated, mathematically verified NCERT Mensuration Questions (Classes 6–10,
 * prioritizing Class 10 Surface Areas & Volumes). Exercise numbers are stated
 * ONLY where verified against NCERT Rationalized / Standard textbooks.
 */
export const NCERT_CURRICULUM_QUESTIONS = Object.freeze([
  {
    id: 'ncert_c10_cubes_joined',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 · Ex 12.1 Q1',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.CUBOID,
    questionText:
      '2 cubes each of volume 64 cm³ are joined end to end. Find the surface area of the resulting cuboid.',
    presetSolutionKey: 'two_cubes_64',
    teacherNotes:
      'Emphasize that joining two cubes hides 2 square faces inside the joint, leaving 10 outer faces (TSA of 8 × 4 × 4 cuboid = 160 cm²), NOT 2 × 96 = 192 cm².',
  },
  {
    id: 'ncert_c10_vessel_hemi_cyl',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 · Ex 12.1 Q2',
    authenticity: 'ncert_textbook',
    difficulty: 'medium',
    shape: SHAPES.CYLINDER,
    questionText:
      'A vessel is in the form of a hollow hemisphere mounted by a hollow cylinder. The diameter of the hemisphere is 14 cm and the total height of the vessel is 13 cm. Find the inner surface area of the vessel. (Take π = 22/7)',
    presetSolutionKey: 'vessel_hemi_cyl_14_13',
    teacherNotes:
      'Point out the #1 student mistake: height of cylinder is NOT 13 cm; subtract hemisphere radius (7 cm) first to get h_cyl = 6 cm.',
  },
  {
    id: 'ncert_c10_toy_cone_hemi',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 · Ex 12.1 Q3',
    authenticity: 'ncert_textbook',
    difficulty: 'medium',
    shape: SHAPES.CONE,
    questionText:
      'A toy is in the form of a cone of radius 3.5 cm mounted on a hemisphere of same radius. The total height of the toy is 15.5 cm. Find the total surface area of the toy. (Take π = 22/7)',
    presetSolutionKey: 'toy_cone_hemi_35_155',
    teacherNotes:
      'Show students how h_cone = 15.5 − 3.5 = 12 cm forms a neat Pythagorean triple (3.5, 12, 12.5)! Factor πr outside for faster calculation.',
  },
  {
    id: 'ncert_c10_capsule_cyl_2hemi',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 · Ex 12.1 Q6',
    authenticity: 'ncert_textbook',
    difficulty: 'medium',
    shape: SHAPES.CYLINDER,
    questionText:
      'A medicine capsule is in the shape of a cylinder with two hemispheres stuck to each of its ends. The length of the entire capsule is 14 mm and the diameter of the capsule is 5 mm. Find its surface area. (Take π = 22/7)',
    presetSolutionKey: 'capsule_14_5_mm',
    teacherNotes:
      'Two equal hemispheres at the ends add cleanly to 1 full sphere surface (4πr²), and the cylinder length is 14 − 2.5 − 2.5 = 9 mm.',
  },
  {
    id: 'ncert_c10_cone_on_hemi_vol',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 · Ex 12.2 Q1',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.CONE,
    questionText:
      'A solid is in the shape of a cone standing on a hemisphere with both their radii being equal to 1 cm and the height of the cone is equal to its radius. Find the volume of the solid in terms of π.',
    presetSolutionKey: 'cone_hemi_vol_r1',
    teacherNotes:
      'Visual takeaway: cone volume (⅓πr³ since h = r) + hemisphere volume (⅔πr³) combines cleanly into 1 full πr³ = π cm³!',
  },
  {
    id: 'ncert_c10_sphere_two_hemi_ratio',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Exemplar / Class 10 Board Practice',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.SPHERE,
    questionText:
      'A solid sphere is cut into two hemispheres. Find the ratio of the surface areas of the sphere to that of the two hemispheres taken together.',
    presetSolutionKey: 'sphere_two_hemi_ratio',
    teacherNotes:
      'Explain why slicing a sphere exposes two new circular discs of area πr² each, lifting total area from 4πr² to 6πr² (ratio 2 : 3).',
  },
  {
    id: 'ncert_c10_largest_cone_cube',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 Board Practice',
    authenticity: 'ncert_textbook',
    difficulty: 'medium',
    shape: SHAPES.CONE,
    questionText:
      'Find the volume of the largest right circular cone that can be carved out from a solid cube of edge 2 cm. (Take π = 22/7)',
    presetSolutionKey: 'largest_cone_cube_2cm',
    teacherNotes:
      'Demonstrate in 3D that diameter = cube edge (so radius r = 1 cm, NOT 2 cm!) and height h = edge a = 2 cm.',
  },
  {
    id: 'ncert_c10_cylinder_csa_inverse',
    classLevel: '10',
    chapter: 'Ch. 12 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 10 Practice',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.CYLINDER,
    questionText:
      'The curved surface area of a cylinder of height 5 cm is 94.2 cm². Find its radius. Take π = 3.14.',
    teacherNotes:
      'Shows algebraic rearrangement from CSA = 2πrh to r = CSA / (2πh) = 3 cm.',
  },
  {
    id: 'ncert_c9_cone_csa_canvas',
    classLevel: '9',
    chapter: 'Ch. 11 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 9 · Ex 11.1 Q1',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.CONE,
    questionText:
      'Diameter of the base of a cone is 10.5 cm and its slant height is 10 cm. Find its curved surface area. (Take π = 22/7)',
    teacherNotes:
      'Reinforce halving the diameter first: d = 10.5 cm ⇒ r = 5.25 cm before evaluating CSA = πrl = 165 cm².',
  },
  {
    id: 'ncert_c9_sphere_sa_7cm',
    classLevel: '9',
    chapter: 'Ch. 11 · Surface Areas and Volumes',
    exerciseRef: 'NCERT Class 9 · Ex 11.2 Q1(ii)',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.SPHERE,
    questionText:
      'Find the surface area of a sphere of radius 5.6 cm. (Take π = 22/7)',
    teacherNotes:
      'Demonstrate 4πr² carefully with decimals: 4 × (22/7) × 5.6 × 5.6 = 394.24 cm².',
  },
  {
    id: 'ncert_c8_cuboid_tank_litres',
    classLevel: '8',
    chapter: 'Ch. 9 · Mensuration',
    exerciseRef: 'NCERT Class 8 · Concept Practice',
    authenticity: 'ncert_textbook',
    difficulty: 'medium',
    shape: SHAPES.CUBOID,
    questionText:
      'Find the volume in litres of a rectangular cuboid water tank with length 2 m, breadth 1.5 m and height 100 cm.',
    teacherNotes:
      'Classic Class 8 unit conversion drill: convert height 100 cm → 1 m first so volume = 3 m³, then multiply by 1000 L/m³ = 3,000 litres.',
  },
  {
    id: 'ncert_c6_7_cube_tsa_vol',
    classLevel: '6_7',
    chapter: 'Perimeter, Area & Solid Nets',
    exerciseRef: 'NCERT Classes 6–7 · Concept Drill',
    authenticity: 'ncert_textbook',
    difficulty: 'easy',
    shape: SHAPES.CUBE,
    questionText:
      'Find the total surface area and volume of a cube of side 6 cm.',
    teacherNotes:
      'Unfold the 6 congruent squares in 3D (6 × 6² = 216 cm²) and contrast with space volume a³ = 216 cm³.',
  },
])

export function getNcertChaptersForClass(classId) {
  const rows =
    classId === 'all'
      ? NCERT_CURRICULUM_QUESTIONS
      : NCERT_CURRICULUM_QUESTIONS.filter((q) => q.classLevel === classId)
  return Array.from(new Set(rows.map((q) => q.chapter)))
}
