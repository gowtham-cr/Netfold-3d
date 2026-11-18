import { SHAPES } from '../utils/mathEngine.js'

export const PATH_AUDIENCES = Object.freeze(['student', 'teacher', 'exam'])
export const PATH_LEVELS = Object.freeze(['beginner', 'intermediate', 'advanced'])

/**
 * Curated curriculum steps for Student, Teacher, and Competitive Exam paths
 * across Beginner, Intermediate, and Advanced difficulty tiers.
 */
export const LEARNING_PATH_STEPS = Object.freeze([
  // ---------------- STUDENT PATH ----------------
  {
    id: 'st_beg_cube_nets',
    audience: 'student',
    level: 'beginner',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBE,
    dimensions: { a: 4 },
    foldProgress: 40,
    highlightMode: 'tsa',
    targetTab: 'explorer',
  },
  {
    id: 'st_beg_cuboid_walls',
    audience: 'student',
    level: 'beginner',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBOID,
    dimensions: { l: 8, b: 6, h: 4 },
    foldProgress: 65,
    highlightMode: 'lsa',
    targetTab: 'missions',
  },
  {
    id: 'st_int_cylinder_circumference',
    audience: 'student',
    level: 'intermediate',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    dimensions: { r: 3, h: 6 },
    foldProgress: 50,
    highlightMode: 'lsa',
    targetTab: 'netlab',
  },
  {
    id: 'st_int_cone_slant',
    audience: 'student',
    level: 'intermediate',
    topic: 'cone',
    shape: SHAPES.CONE,
    dimensions: { r: 3, h: 4 },
    foldProgress: 60,
    highlightMode: 'lsa',
    targetTab: 'practice',
  },
  {
    id: 'st_adv_sphere_hemisphere',
    audience: 'student',
    level: 'advanced',
    topic: 'sphere_hemisphere',
    shape: SHAPES.HEMISPHERE,
    dimensions: { r: 5 },
    foldProgress: 100,
    highlightMode: 'tsa',
    targetTab: 'practice',
  },
  {
    id: 'st_adv_frustum_pyramids',
    audience: 'student',
    level: 'advanced',
    topic: 'frustum_octahedron',
    shape: SHAPES.FRUSTUM,
    dimensions: { r1: 6, r2: 3, h: 4 },
    foldProgress: 70,
    highlightMode: 'tsa',
    targetTab: 'explorer',
  },

  // ---------------- TEACHER PATH ----------------
  {
    id: 'tc_beg_unfolding_visuals',
    audience: 'teacher',
    level: 'beginner',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBE,
    dimensions: { a: 5 },
    foldProgress: 25,
    highlightMode: 'all',
    targetTab: 'teacher_studio',
  },
  {
    id: 'tc_beg_11_cube_nets_lesson',
    audience: 'teacher',
    level: 'beginner',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBE,
    dimensions: { a: 4 },
    foldProgress: 0,
    highlightMode: 'tsa',
    targetTab: 'netlab',
  },
  {
    id: 'tc_int_lsavs_tsa_demo',
    audience: 'teacher',
    level: 'intermediate',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    dimensions: { r: 4, h: 6 },
    foldProgress: 55,
    highlightMode: 'lsa',
    targetTab: 'teacher_studio',
  },
  {
    id: 'tc_int_class10_board_prep',
    audience: 'teacher',
    level: 'intermediate',
    topic: 'sphere_hemisphere',
    shape: SHAPES.SPHERE,
    dimensions: { r: 6 },
    foldProgress: 100,
    highlightMode: 'tsa',
    targetTab: 'practice',
  },
  {
    id: 'tc_adv_custom_worksheets',
    audience: 'teacher',
    level: 'advanced',
    topic: 'combinations_conversion',
    shape: SHAPES.CONE,
    dimensions: { r: 4, h: 5 },
    foldProgress: 100,
    highlightMode: 'volume',
    targetTab: 'worksheet_generator',
  },
  {
    id: 'tc_adv_cohort_diagnostics',
    audience: 'teacher',
    level: 'advanced',
    topic: 'scaling_ratio',
    shape: SHAPES.OCTAHEDRON,
    dimensions: { a: 5 },
    foldProgress: 80,
    highlightMode: 'tsa',
    targetTab: 'analytics',
  },

  // ---------------- COMPETITIVE EXAM PATH ----------------
  {
    id: 'ex_beg_ratio_shortcuts',
    audience: 'exam',
    level: 'beginner',
    topic: 'scaling_ratio',
    shape: SHAPES.SPHERE,
    dimensions: { r: 6 },
    foldProgress: 100,
    highlightMode: 'tsa',
    targetTab: 'exam_arena',
  },
  {
    id: 'ex_beg_cube_cut_join',
    audience: 'exam',
    level: 'beginner',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBOID,
    dimensions: { l: 8, b: 4, h: 4 },
    foldProgress: 100,
    highlightMode: 'tsa',
    targetTab: 'exam_arena',
  },
  {
    id: 'ex_int_recasting_melting',
    audience: 'exam',
    level: 'intermediate',
    topic: 'combinations_conversion',
    shape: SHAPES.CYLINDER,
    dimensions: { r: 3, h: 6 },
    foldProgress: 100,
    highlightMode: 'volume',
    targetTab: 'exam_arena',
  },
  {
    id: 'ex_int_pythagorean_cones',
    audience: 'exam',
    level: 'intermediate',
    topic: 'cone',
    shape: SHAPES.CONE,
    dimensions: { r: 3, h: 4 },
    foldProgress: 100,
    highlightMode: 'lsa',
    targetTab: 'exam_arena',
  },
  {
    id: 'ex_adv_frustum_kcet_jee',
    audience: 'exam',
    level: 'advanced',
    topic: 'frustum_octahedron',
    shape: SHAPES.FRUSTUM,
    dimensions: { r1: 6, r2: 3, h: 5 },
    foldProgress: 100,
    highlightMode: 'volume',
    targetTab: 'exam_arena',
  },
  {
    id: 'ex_adv_timed_mock_mastery',
    audience: 'exam',
    level: 'advanced',
    topic: 'prism_pyramid',
    shape: SHAPES.HEXAGONAL_PRISM,
    dimensions: { a: 4, h: 6 },
    foldProgress: 100,
    highlightMode: 'volume',
    targetTab: 'analytics',
  },
])

/**
 * Recommends the next smart learning path step based on completed path steps
 * and weak topics identified by Exam Arena / Assessment analytics.
 */
export function recommendNextPathStep(
  audience = 'student',
  completedStepIds = [],
  weakTopics = [],
) {
  const pathSteps = LEARNING_PATH_STEPS.filter((s) => s.audience === audience)
  const completedSet = new Set(completedStepIds)
  const uncompleted = pathSteps.filter((s) => !completedSet.has(s.id))

  if (uncompleted.length === 0) {
    return {
      step: pathSteps[0] ?? LEARNING_PATH_STEPS[0],
      reasonType: 'all_completed',
      completedCount: pathSteps.length,
      totalCount: pathSteps.length,
    }
  }

  if (Array.isArray(weakTopics) && weakTopics.length > 0) {
    const weakSet = new Set(weakTopics)
    if (weakSet.has('cone_frustum')) {
      weakSet.add('cone')
      weakSet.add('frustum_octahedron')
    }
    if (weakSet.has('combination_of_solids') || weakSet.has('conversion_melting')) {
      weakSet.add('combinations_conversion')
    }
    const targeted = uncompleted.find((s) => weakSet.has(s.topic))
    if (targeted) {
      return {
        step: targeted,
        reasonType: 'weak_topic_remediation',
        completedCount: pathSteps.length - uncompleted.length,
        totalCount: pathSteps.length,
      }
    }
  }

  return {
    step: uncompleted[0],
    reasonType: 'next_in_sequence',
    completedCount: pathSteps.length - uncompleted.length,
    totalCount: pathSteps.length,
  }
}

export const LEARNING_PATHS_COPY = Object.freeze({
  en: {
    st_beg_cube_nets: {
      title: 'Cube Faces, Edges & 2D Nets',
      concept:
        'A cube has 6 congruent squares. Unfolding to 0% reveals why TSA = 6a² while folding encloses space V = a³.',
      practiceGoal: 'Inspect a 0% flat cube net and complete Mission 1.',
    },
    st_beg_cuboid_walls: {
      title: 'Four Walls (LSA) vs Floor & Ceiling',
      concept:
        'Lateral Surface Area 2h(l + b) counts only vertical faces, leaving out top and bottom 2lb.',
      practiceGoal: 'Complete Classroom Painter Mission with zero ceiling overlap errors.',
    },
    st_int_cylinder_circumference: {
      title: 'Why Cylinder CSA Equals 2πrh',
      concept:
        'Unrolling a cylinder wall produces a rectangle whose width matches base circumference 2πr.',
      practiceGoal: 'Explore Cylinder Net in Net Lab and solve Class 10 Q5.',
    },
    st_int_cone_slant: {
      title: 'Pythagoras Inside a Right Circular Cone',
      concept:
        'Slant height l = √(r² + h²) connects vertical height to the curved sector edge for CSA = πrl.',
      practiceGoal: 'Solve Class 10 Q6 (r = 7, h = 24, l = 25) and check Q10.',
    },
    st_adv_sphere_hemisphere: {
      title: 'Solid Sphere Cut Into Two Hemispheres',
      concept:
        'Curved spheres lack flat nets. Slicing a solid exposes two new circular faces (+πr² each), raising TSA from 4πr² to 6πr².',
      practiceGoal: 'Master Class 10 Q1, Q3, and Q8 hemisphere ratios.',
    },
    st_adv_frustum_pyramids: {
      title: 'Frustums, Polygons & Platonic Solids',
      concept:
        'A frustum slices off a smaller top cone; its LSA uses average radius π(r₁ + r₂)l.',
      practiceGoal: 'Adjust frustum radii r₁ and r₂ and compare Prism vs Pyramid volumes.',
    },
    tc_beg_unfolding_visuals: {
      title: 'Projector 3D Unfolding Demonstrations',
      concept:
        'Use full-screen Classroom Mode to smoothly animate flat nets folding up at 25%–75% intervals during live explanation.',
      practiceGoal: 'Test Classroom Demonstration Mode inside Teacher Studio.',
    },
    tc_beg_11_cube_nets_lesson: {
      title: 'Teaching All 11 Valid Cube Nets',
      concept:
        'Compare valid 1-4-1, 2-3-1, 2-2-2, and 3-3 families alongside overlapping invalid pentomino/hexomino traps.',
      practiceGoal: 'Use Cube Nets Gallery and Net Checker in class.',
    },
    tc_int_lsavs_tsa_demo: {
      title: 'Highlighting LSA vs TSA Face by Face',
      concept:
        'Switch highlight mode from TSA to LSA so students immediately see why caps disappear on open tanks and rooms.',
      practiceGoal: 'Save a Cylinder or Cuboid lesson plan in Teacher Studio.',
    },
    tc_int_class10_board_prep: {
      title: 'Board-Exam 10-Step Derivation Walk-Through',
      concept:
        'Walk students through Given → Formula → Derivation → Substitution → Units on NCERT Class 10 Q1–Q10.',
      practiceGoal: 'Bookmark 2 model board questions for revision.',
    },
    tc_adv_custom_worksheets: {
      title: 'Printable Deduplicated Worksheet Authoring',
      concept:
        'Mix NCERT syllabus items with additional speed drills, toggle Teacher Answer Keys, and print directly to PDF.',
      practiceGoal: 'Generate and preview a 6-question mixed worksheet.',
    },
    tc_adv_cohort_diagnostics: {
      title: 'Identifying Weak Topics Across Demo Profiles',
      concept:
        'Inspect topic-wise accuracy and speed metrics in Analytics to target remedial 3D demonstrations.',
      practiceGoal: 'Open Teacher Cohort View inside Performance Analytics.',
    },
    ex_beg_ratio_shortcuts: {
      title: 'k² & k³ Scaling Ratios Under 10 Seconds',
      concept:
        'Never plug full numbers twice in MCQ exams: if radius scales by k, area scales by k² and volume by k³.',
      practiceGoal: 'Solve scaling MCQs in General Aptitude & SSC tracks.',
    },
    ex_beg_cube_cut_join: {
      title: 'Joined & Sliced Solids Shortcut Patterns',
      concept:
        'Joining n cubes reduces TSA by 2(n−1) faces immediately; each straight slice of a solid adds 2 new cross-section faces.',
      practiceGoal: 'Clear SSC Easy/Medium cube-joining drills.',
    },
    ex_int_recasting_melting: {
      title: 'Volume Conservation During Melting & Recasting',
      concept:
        'Cancel π on both sides first! Write V_old = V_new symbolically before multiplying any decimals.',
      practiceGoal: 'Solve melting conversion MCQs in KCET & Banking tracks.',
    },
    ex_int_pythagorean_cones: {
      title: 'Pythagorean Triples (3-4-5, 5-12-13, 7-24-25)',
      concept:
        'Spot standard right-triangle triples instantly on cones and square pyramids to find slant height without square-root arithmetic.',
      practiceGoal: 'Attempt 5 medium cone/pyramid questions under 45s each.',
    },
    ex_adv_frustum_kcet_jee: {
      title: 'Frustum, Inscribed Solids & Multi-Shape Capacity',
      concept:
        'For cone inscribed in cube/cylinder, V_cone = ⅓ V_cylinder; for hemisphere in cube edge a, r = a/2.',
      practiceGoal: 'Complete JEE Foundation & KCET Advanced challenges.',
    },
    ex_adv_timed_mock_mastery: {
      title: 'Full Timed Mock Test & Speed Calibration',
      concept:
        'Build accuracy under countdown pressure while tracking seconds per question across all mensuration topics.',
      practiceGoal: 'Finish a Timed Mock Test with ≥ 75% accuracy.',
    },
  },
  kn: {
    st_beg_cube_nets: {
      title: 'ಘನ ಮುಖಗಳು, ಅಂಚುಗಳು & 2D ನೆಟ್‌ಗಳು',
      concept: 'ಘನಕ್ಕೆ 6 ಸಮ ಚೌಕಗಳಿವೆ. 0% ನೆಟ್‌ನಲ್ಲಿ TSA = 6a² ಮತ್ತು ಪೂರ್ಣ ಮಡಚಿದಾಗ V = a³ ಕಾಣುತ್ತದೆ.',
      practiceGoal: '0% ಘನ ನೆಟ್ ನೋಡಿ ಮಿಷನ್ 1 ಪೂರ್ಣಗೊಳಿಸಿ.',
    },
    st_beg_cuboid_walls: {
      title: '4 ಗೋಡೆಗಳ ವಿಸ್ತೀರ್ಣ (LSA) vs ನೆಲ ಮತ್ತು ಛಾವಣಿ',
      concept: 'ಪಾರ್ಶ್ವ ವಿಸ್ತೀರ್ಣ 2h(l + b) ನಲ್ಲಿ ನೆಲ ಮತ್ತು ಛಾವಣಿ 2lb ಸೇರುವುದಿಲ್ಲ.',
      practiceGoal: 'ತರಗತಿ ಕೊಠಡಿ ಬಣ್ಣಗಾರ ಮಿಷನ್ ಪೂರ್ಣಗೊಳಿಸಿ.',
    },
    st_int_cylinder_circumference: {
      title: 'ಸಿಲಿಂಡರ್ CSA = 2πrh ಏಕೆ?',
      concept: 'ಸಿಲಿಂಡರ್ ವಕ್ರ ಭಾಗವನ್ನು ತೆರೆದಾಗ ವೃತ್ತದ ಪರಿಧಿ 2πr ಉದ್ದದ ಆಯತ ಸಿಗುತ್ತದೆ.',
      practiceGoal: 'ನೆಟ್ ಲ್ಯಾಬ್‌ನಲ್ಲಿ ಸಿಲಿಂಡರ್ ನೆಟ್ ಮತ್ತು 10ನೇ ತರಗತಿ Q5 ನೋಡಿ.',
    },
    st_int_cone_slant: {
      title: 'ಶಂಕುವಿನ ಒಳಗಿನ ಪೈಥಾಗೋರಸ್ ತ್ರಿಭುಜ',
      concept: 'ಓರೆ ಎತ್ತರ l = √(r² + h²) ಮೂಲಕ CSA = πrl ಸಿಗುತ್ತದೆ.',
      practiceGoal: '10ನೇ ತರಗತಿ Q6 ಮತ್ತು Q10 ಬಿಡಿಸಿ.',
    },
    st_adv_sphere_hemisphere: {
      title: 'ಗೋಳವನ್ನು 2 ಅರ್ಧಗೋಳಗಳಾಗಿ ಕತ್ತರಿಸುವುದು',
      concept: 'ಗೋಳವನ್ನು ಕತ್ತರಿಸಿದಾಗ 2 ಹೊಸ ವೃತ್ತ ಪಾದಗಳು (+2πr²) ತೆರೆದುಕೊಳ್ಳುತ್ತವೆ.',
      practiceGoal: '10ನೇ ತರಗತಿ Q1, Q3, Q8 ಅಭ್ಯಾಸ ಮಾಡಿ.',
    },
    st_adv_frustum_pyramids: {
      title: 'ಭಿನ್ನಕ, ಪ್ರಿಸಮ್ & ಅಷ್ಟಫಲಕಗಳು',
      concept: 'ಶಂಕು ಭಿನ್ನಕದ ವಕ್ರ ವಿಸ್ತೀರ್ಣ π(r₁ + r₂)l ಸರಾಸರಿ ತ್ರಿಜ್ಯ ಬಳಸುತ್ತದೆ.',
      practiceGoal: 'ಭಿನ್ನಕದ ತ್ರಿಜ್ಯ r₁, r₂ ಬದಲಾಯಿಸಿ ಗಮನಿಸಿ.',
    },
    tc_beg_unfolding_visuals: {
      title: 'ಪ್ರೊಜೆಕ್ಟರ್ 3D ಮಡಚುವಿಕೆ ಪ್ರದರ್ಶನ',
      concept: 'ತರಗತಿಯಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸಲು Classroom ಪ್ರದರ್ಶನ ಮೋಡ್ ಬಳಸಿ.',
      practiceGoal: 'Teacher Studio ಪ್ರದರ್ಶನ ಮೋಡ್ ಪರೀಕ್ಷಿಸಿ.',
    },
    tc_beg_11_cube_nets_lesson: {
      title: 'ಎಲ್ಲಾ 11 ಘನ ನೆಟ್‌ಗಳ ಬೋಧನೆ',
      concept: '1-4-1, 2-3-1, 2-2-2 ಮತ್ತು 3-3 ಕುಟುಂಬಗಳನ್ನು ತಪ್ಪು ನೆಟ್‌ಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ.',
      practiceGoal: '11 ಘನ ನೆಟ್ ಗ್ಯಾಲರಿ ಮತ್ತು ನೆಟ್ ಪರೀಕ್ಷೆ ಬಳಸಿ.',
    },
    tc_int_lsavs_tsa_demo: {
      title: 'LSA vs TSA ಹೈಲೈಟ್ ಬೋಧನೆ',
      concept: 'LSA ಮೋಡ್ ಆನ್ ಮಾಡುವುದರಿಂದ ಮೇಲ್ಮುಚ್ಚಳ ಏಕೆ ಬಿಡಲಾಗುತ್ತದೆ ಎಂದು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ತಕ್ಷಣ ಅರ್ಥವಾಗುತ್ತದೆ.',
      practiceGoal: 'Teacher Studio ನಲ್ಲಿ ಪಾಠ ಯೋಜನೆ ಉಳಿಸಿ.',
    },
    tc_int_class10_board_prep: {
      title: 'ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ 10-ಹಂತದ ಮಾರ್ಗದರ್ಶನ',
      concept: 'ದತ್ತಾಂಶ → ಸೂತ್ರ → ವ್ಯುತ್ಪತ್ತಿ → ಉತ್ತರ ಕ್ರಮದಲ್ಲಿ 10ನೇ ತರಗತಿ Q1–Q10 ಕಲಿಸಿ.',
      practiceGoal: '2 ಮಾದರಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ.',
    },
    tc_adv_custom_worksheets: {
      title: 'ಮುದ್ರಿಸಬಹುದಾದ ವರ್ಕ್‌ಶೀಟ್ ರಚನೆ',
      concept: 'ವಿಷಯ ಮತ್ತು ಕಷ್ಟದ ಮಟ್ಟದಂತೆ ಪುನರಾವರ್ತನೆ ಇಲ್ಲದ ಪ್ರಶ್ನೆಪತ್ರಿಕೆ ಮತ್ತು ಉತ್ತರ ಕೀ ರಚಿಸಿ.',
      practiceGoal: '6 ಪ್ರಶ್ನೆಗಳ ವರ್ಕ್‌ಶೀಟ್ ರಚಿಸಿ ನೋಡಿ.',
    },
    tc_adv_cohort_diagnostics: {
      title: 'ವಿದ್ಯಾರ್ಥಿಗಳ ದುರ್ಬಲ ವಿಷಯ ಪತ್ತೆ',
      concept: 'Analytics ನಲ್ಲಿ ವಿಷಯವಾರು ನಿಖರತೆ ನೋಡಿ ಮರುಬೋಧನೆ ಮಾಡಿ.',
      practiceGoal: 'Analytics ನಲ್ಲಿ Teacher ನೋಟ ತೆರೆಯಿರಿ.',
    },
    ex_beg_ratio_shortcuts: {
      title: 'k² & k³ ಅನುಪಾತ ಶಾರ್ಟ್‌ಕಟ್',
      concept: 'ತ್ರಿಜ್ಯ k ಪಟ್ಟು ಆದರೆ ವಿಸ್ತೀರ್ಣ k² ಮತ್ತು ಘನಫಲ k³ ಪಟ್ಟು ಆಗುತ್ತದೆ.',
      practiceGoal: 'General Aptitude ಅನುಪಾತ MCQ ಬಿಡಿಸಿ.',
    },
    ex_beg_cube_cut_join: {
      title: 'ಘನ ಜೋಡಣೆ & ಕತ್ತರಿಸುವ ತಂತ್ರಗಳು',
      concept: 'n ಘನಗಳನ್ನು ಜೋಡಿಸಿದಾಗ 2(n−1) ಮುಖಗಳು ಕಡಿಮೆಯಾಗುತ್ತವೆ.',
      practiceGoal: 'SSC ಘನ ಜೋಡಣೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಬಿಡಿಸಿ.',
    },
    ex_int_recasting_melting: {
      title: 'ಕರಗಿಸಿ ಮರುರೂಪಿಸುವ ಘನಫಲ ಸಮೀಕರಣ',
      concept: 'ಮೊದಲು ಎರಡೂ ಬದಿಯಲ್ಲಿ π ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ ವೇಗವಾಗಿ ಲೆಕ್ಕ ಹಾಕಿ.',
      practiceGoal: 'KCET ಮತ್ತು Banking ಮರುರೂಪಣೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಬಿಡಿಸಿ.',
    },
    ex_int_pythagorean_cones: {
      title: 'ಪೈಥಾಗೋರಸ್ ತ್ರಿವಳಿಗಳು (3-4-5, 7-24-25)',
      concept: 'ವರ್ಗಮೂಲ ಲೆಕ್ಕವಿಲ್ಲದೆ ನೇರವಾಗಿ ಓರೆ ಎತ್ತರ l ಪತ್ತೆಹಚ್ಚಿ.',
      practiceGoal: '45 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ 5 ಶಂಕು ಪ್ರಶ್ನೆಗಳನ್ನು ಬಿಡಿಸಿ.',
    },
    ex_adv_frustum_kcet_jee: {
      title: 'ಭಿನ್ನಕ & ಅಂತರ್ಗತ ಘನಾಕೃತಿಗಳು',
      concept: 'ಘನದಲ್ಲಿ ಅಂತರ್ಗತ ಶಂಕುವಿಗೆ r = a/2, h = a ಆಗಿರುತ್ತದೆ.',
      practiceGoal: 'JEE Foundation & KCET ಕಠಿಣ ಪ್ರಶ್ನೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
    },
    ex_adv_timed_mock_mastery: {
      title: 'ಸಮಯಬದ್ಧ ಮಾಕ್ ಟೆಸ್ಟ್ ಅಭ್ಯಾಸ',
      concept: 'ಟೈಮರ್ ಒತ್ತಡದಲ್ಲಿ ವೇಗ ಮತ್ತು ನಿಖರತೆಯನ್ನು ಸಮತೋಲನಗೊಳಿಸಿ.',
      practiceGoal: '75%+ ನಿಖರತೆಯೊಂದಿಗೆ ಮಾಕ್ ಟೆಸ್ಟ್ ಮುಗಿಸಿ.',
    },
  },
  ta: {
    st_beg_cube_nets: {
      title: 'கனசதுர முகங்கள் & 2D நெட்டுகள்',
      concept: 'கனசதுரத்தில் 6 சம சதுரங்கள் உள்ளன. 0% நெட்டில் TSA = 6a² மற்றும் மடித்தால் V = a³ புரியும்.',
      practiceGoal: '0% நெட்டைப் பார்த்து இலக்கு 1 முடிக்கவும்.',
    },
    st_beg_cuboid_walls: {
      title: '4 சுவர்கள் (LSA) vs தரை & கூரை',
      concept: 'பக்கப்பரப்பு 2h(l + b) மேல் மற்றும் கீழ் பரப்பு 2lb-ஐத் தவிர்க்கிறது.',
      practiceGoal: 'வகுப்பறை வண்ணப்பூச்சாளர் இலக்கை முடிக்கவும்.',
    },
    st_int_cylinder_circumference: {
      title: 'உருளை CSA = 2πrh காரணம்',
      concept: 'உருளைச் சுவரை விரித்தால் அடி சுற்றளவு 2πr நீளமுள்ள செவ்வகம் கிடைக்கும்.',
      practiceGoal: 'நெட் ஆய்வகம் மற்றும் வகுப்பு 10 Q5 பார்க்கவும்.',
    },
    st_int_cone_slant: {
      title: 'கூம்பின் பிதாகரஸ் முக்கோணம்',
      concept: 'சாயுயரம் l = √(r² + h²) மூலம் CSA = πrl கணக்கிடப்படுகிறது.',
      practiceGoal: 'வகுப்பு 10 Q6 மற்றும் Q10 தீர்க்கவும்.',
    },
    st_adv_sphere_hemisphere: {
      title: 'கோளத்தை 2 அரைக்கோளங்களாக வெட்டுதல்',
      concept: 'வெட்டும்போது 2 புதிய வட்ட முகங்கள் (+2πr²) உருவாகி TSA 6πr² ஆகிறது.',
      practiceGoal: 'வகுப்பு 10 Q1, Q3, Q8 தேர்ச்சி பெறவும்.',
    },
    st_adv_frustum_pyramids: {
      title: 'இடைக்கண்டம், பட்டகம் & எண்முகன்',
      concept: 'இடைக்கண்ட வளைபரப்பு π(r₁ + r₂)l என சராசரி ஆரம் பயன்படுத்துகிறது.',
      practiceGoal: 'r₁, r₂ ஆரங்களை மாற்றி ஆய்வு செய்க.',
    },
    tc_beg_unfolding_visuals: {
      title: 'வகுப்பறை 3D மடிப்புக் காட்சி',
      concept: 'பெரிய திரை பிரசன்டேஷன் பயன்முறையில் மாணவர்களுக்கு நெட் மடிப்பை விளக்குங்கள்.',
      practiceGoal: 'Teacher Studio வகுப்பறை பயன்முறையை முயலுங்கள்.',
    },
    tc_beg_11_cube_nets_lesson: {
      title: '11 கனசதுர நெட்டுகள் கற்பித்தல்',
      concept: 'சரியான 11 நெட்டுகளையும் தவறான T/O வடிவங்களையும் ஒப்பிடுங்கள்.',
      practiceGoal: 'நெட் ஆய்வகத்தில் 11 நெட்டுகளையும் காட்டவும்.',
    },
    tc_int_lsavs_tsa_demo: {
      title: 'LSA vs TSA முகம் வாரியாக விளக்கம்',
      concept: 'திறந்த தொட்டி மற்றும் சுவர் கணக்குகளில் மூடிகள் நீக்கப்படுவதை ஹைலைட் செய்யுங்கள்.',
      practiceGoal: 'Teacher Studio-இல் பாடத் திட்டத்தைச் சேமிக்கவும்.',
    },
    tc_int_class10_board_prep: {
      title: 'பொதுத்தேர்வு 10-படி வழிமுறை',
      concept: 'கொடுக்கப்பட்டவை → சூத்திரம் → வழித்தோன்றல் → அலகுகள் என வகுப்பு 10 கற்பியுங்கள்.',
      practiceGoal: '2 வினாக்களைப் புக்மார்க் செய்யவும்.',
    },
    tc_adv_custom_worksheets: {
      title: 'பயிற்சித் தாள் & விடைக்குறிப்பு உருவாக்கம்',
      concept: 'நகல் இல்லாத வினாக்களுடன் அச்சிடத்தக்க PDF பயிற்சித் தாள் உருவாக்குங்கள்.',
      practiceGoal: '6-வினா பயிற்சித் தாளை உருவாக்கவும்.',
    },
    tc_adv_cohort_diagnostics: {
      title: 'மாணவர் பலவீனத் தலைப்புகள் ஆய்வு',
      concept: 'Analytics-இல் தலைப்பு வாரியான துல்லியம் பார்த்து வழிகாட்டுங்கள்.',
      practiceGoal: 'Analytics ஆசிரியர் பார்வையைத் திறக்கவும்.',
    },
    ex_beg_ratio_shortcuts: {
      title: 'k² & k³ விகிதக் குறுக்குவழிகள்',
      concept: 'பக்கம் k மடங்கானால் பரப்பு k² மடங்கும் கன அளவு k³ மடங்கும் உயரும்.',
      practiceGoal: 'General Aptitude விகித வினாக்களைத் தீர்க்கவும்.',
    },
    ex_beg_cube_cut_join: {
      title: 'கனசதுர இணைப்பு & வெட்டு சூத்திரம்',
      concept: 'n கனசதுரங்களை இணைத்தால் 2(n−1) முகங்கள் குறையும்.',
      practiceGoal: 'SSC கனசதுரப் பயிற்சிகளை முடிக்கவும்.',
    },
    ex_int_recasting_melting: {
      title: 'உருக்கி மாற்றுதலில் கன அளவு சமன்பாடு',
      concept: 'இரு பக்கமும் π-ஐ முதலில் நீக்கினால் கணக்கீடு எளிதாகும்.',
      practiceGoal: 'KCET & Banking உருக்கி மாற்றும் வினாக்களைத் தீர்க்கவும்.',
    },
    ex_int_pythagorean_cones: {
      title: 'பிதாகரஸ் மூன்றிகள் (3-4-5, 7-24-25)',
      concept: 'வர்க்கமூலம் எடுக்காமலே l மதிப்பை விரைவாகக் கண்டறியுங்கள்.',
      practiceGoal: '5 கூம்பு வினாக்களை விரைந்து தீர்க்கவும்.',
    },
    ex_adv_frustum_kcet_jee: {
      title: 'இடைக்கண்டம் & உள்வரைந்த திண்மங்கள்',
      concept: 'கனசதுரத்துள் கூம்பு எனில் r = a/2 மற்றும் h = a ஆகும்.',
      practiceGoal: 'JEE Foundation & KCET உயர் வினாக்களை முடிக்கவும்.',
    },
    ex_adv_timed_mock_mastery: {
      title: 'நேரக் கட்டுப்பாட்டு மாதிரித் தேர்வு',
      concept: 'ஒரு வினாவுக்கான நேரத்தையும் துல்லியத்தையும் ஒரே நேரத்தில் மேம்படுத்துங்கள்.',
      practiceGoal: '75%+ துல்லியத்துடன் மாதிரித் தேர்வு முடிக்கவும்.',
    },
  },
  te: {
    st_beg_cube_nets: {
      title: 'ఘనం ముఖాలు, అంచులు & 2D నెట్‌లు',
      concept: 'ఘనానికి 6 సమాన చదరాలు ఉంటాయి. 0% నెట్ TSA = 6a², మడిస్తే V = a³ అవుతుంది.',
      practiceGoal: '0% ఘన నెట్ చూసి మిషన్ 1 పూర్తి చేయండి.',
    },
    st_beg_cuboid_walls: {
      title: '4 గోడల వైశాల్యం (LSA) vs నేల & పైకప్పు',
      concept: 'పక్కతల వైశాల్యం 2h(l + b) లో నేల మరియు పైకప్పు 2lb ఉండవు.',
      practiceGoal: 'తరగతి గది పెయింటర్ మిషన్ పూర్తి చేయండి.',
    },
    st_int_cylinder_circumference: {
      title: 'స్థూపం CSA = 2πrh ఎందుకు?',
      concept: 'వక్రతలం విప్పితే వృత్త పరిధి 2πr పొడవు గల దీర్ఘచతురస్రం ఏర్పడుతుంది.',
      practiceGoal: 'నెట్ ల్యాబ్ మరియు 10వ తరగతి Q5 చూడండి.',
    },
    st_int_cone_slant: {
      title: 'శంఖువులో పైథాగరస్ త్రిభుజం',
      concept: 'ఏటవాలు ఎత్తు l = √(r² + h²) ద్వారా CSA = πrl వస్తుంది.',
      practiceGoal: '10వ తరగతి Q6 మరియు Q10 సాధించండి.',
    },
    st_adv_sphere_hemisphere: {
      title: 'గోళాన్ని 2 అర్ధగోళాలుగా కోయడం',
      concept: 'కోసినప్పుడు 2 కొత్త వృత్త తలాలు (+2πr²) తెరుచుకుంటాయి.',
      practiceGoal: '10వ తరగతి Q1, Q3, Q8 నేర్చుకోండి.',
    },
    st_adv_frustum_pyramids: {
      title: 'ఛిన్నకం, పట్టకం & అష్టముఖి',
      concept: 'శంఖు ఛిన్నకం వక్ర వైశాల్యం π(r₁ + r₂)l సగటు వ్యాసార్థం వాడుతుంది.',
      practiceGoal: 'r₁, r₂ వ్యాసార్థాలు మార్చి పరిశీలించండి.',
    },
    tc_beg_unfolding_visuals: {
      title: 'తరగతి గది 3D ప్రదర్శన విధానం',
      concept: 'ప్రొజెక్టర్ మోడ్‌లో విద్యార్థులకు నెట్ మడతలను స్పష్టంగా చూపించండి.',
      practiceGoal: 'Teacher Studio ప్రదర్శన మోడ్ పరీక్షించండి.',
    },
    tc_beg_11_cube_nets_lesson: {
      title: 'మొత్తం 11 ఘన నెట్‌ల బోధన',
      concept: 'సరైన 11 నెట్‌లను తప్పు నెట్ నమూనాలతో పోల్చి వివరించండి.',
      practiceGoal: 'నెట్ ల్యాబ్ గ్యాలరీ & నెట్ పరీక్ష వాడండి.',
    },
    tc_int_lsavs_tsa_demo: {
      title: 'LSA vs TSA ముఖం వారీగా వివరణ',
      concept: 'తెరిచిన ట్యాంక్ మరియు గది గోడలకు పై/కింది ముఖాలు ఎందుకు వదిలేస్తారో చూపండి.',
      practiceGoal: 'Teacher Studio లో పాఠ్య ప్రణాళిక సేవ్ చేయండి.',
    },
    tc_int_class10_board_prep: {
      title: 'బోర్డు పరీక్ష 10-దశల విధానం',
      concept: 'ఇచ్చినది → సూత్రం → ఉత్పాదన → సమాధానం క్రమంలో Q1–Q10 బోధించండి.',
      practiceGoal: '2 ముఖ్య ప్రశ్నలను బుక్‌మార్క్ చేయండి.',
    },
    tc_adv_custom_worksheets: {
      title: 'ప్రింటబుల్ వర్క్‌షీట్ & జవాబు కీ',
      concept: 'పునరావృతం లేని ప్రశ్నలతో PDF వర్క్‌షీట్లు రూపొందించండి.',
      practiceGoal: '6 ప్రశ్నల వర్క్‌షీట్ తయారు చేయండి.',
    },
    tc_adv_cohort_diagnostics: {
      title: 'విద్యార్థుల బలహీన అంశాల విశ్లేషణ',
      concept: 'Analytics లో టాపిక్ వారీ ఖచ్చితత్వం చూసి మార్గదర్శనం చేయండి.',
      practiceGoal: 'Analytics లో ఉపాధ్యాయ వీక్షణ తెరవండి.',
    },
    ex_beg_ratio_shortcuts: {
      title: 'k² & k³ నిష్పత్తి షార్ట్‌కట్‌లు',
      concept: 'కొలత k రెట్లు పెరిగితే వైశాల్యం k² రెట్లు, ఘనపరిమాణం k³ రెట్లు పెరుగుతుంది.',
      practiceGoal: 'General Aptitude నిష్పత్తి MCQలు సాధించండి.',
    },
    ex_beg_cube_cut_join: {
      title: 'ఘనాల కలయిక & కత్తిరింపు నియమాలు',
      concept: 'n ఘనాలను కలిపితే 2(n−1) ముఖాలు తగ్గుతాయి.',
      practiceGoal: 'SSC ఘన ప్రశ్నలను పూర్తి చేయండి.',
    },
    ex_int_recasting_melting: {
      title: 'కరిగించి మలచడంలో ఘనపరిమాణ నియమం',
      concept: 'రెండు వైపులా π ను మొదట రద్దు చేసి త్వరగా గణించండి.',
      practiceGoal: 'KCET & Banking మార్పిడి ప్రశ్నలు సాధించండి.',
    },
    ex_int_pythagorean_cones: {
      title: 'పైథాగరస్ త్రికాలు (3-4-5, 7-24-25)',
      concept: 'వర్గమూలం లేకుండా వెంటనే ఏటవాలు ఎత్తు l కనుగొనండి.',
      practiceGoal: '5 శంఖు ప్రశ్నలను వేగంగా సాధించండి.',
    },
    ex_adv_frustum_kcet_jee: {
      title: 'ఛిన్నకం & అంతర్గత ఘనాకృతులు',
      concept: 'ఘనంలో అంతర్గత శంఖువుకు r = a/2, h = a అవుతుంది.',
      practiceGoal: 'JEE Foundation & KCET కఠిన ప్రశ్నలు పూర్తి చేయండి.',
    },
    ex_adv_timed_mock_mastery: {
      title: 'టైమ్డ్ మాక్ టెస్ట్ నైపుణ్యం',
      concept: 'టైమర్ ఒత్తిడిలో ఖచ్చితత్వం మరియు ప్రశ్నకు పట్టే సమయాన్ని మెరుగుపరచండి.',
      practiceGoal: '75%+ ఖచ్చితత్వంతో మాక్ టెస్ట్ పూర్తి చేయండి.',
    },
  },
  hi: {
    st_beg_cube_nets: {
      title: 'घन के फलक, किनारे और 2D नेट',
      concept: 'घन में 6 समान वर्ग होते हैं। 0% नेट पर TSA = 6a² और मोड़ने पर V = a³ दिखता है।',
      practiceGoal: '0% घन नेट देखें और मिशन 1 पूरा करें।',
    },
    st_beg_cuboid_walls: {
      title: 'चार दीवारें (LSA) बनाम फर्श और छत',
      concept: 'पार्श्व क्षेत्रफल 2h(l + b) में फर्श और छत 2lb शामिल नहीं होते।',
      practiceGoal: 'कक्षा रंगाई मिशन को बिना त्रुटि पूरा करें।',
    },
    st_int_cylinder_circumference: {
      title: 'बेलन का CSA = 2πrh क्यों होता है',
      concept: 'बेलन का वक्र पृष्ठ खोलने पर आधार परिधि 2πr लंबाई का आयत बनता है।',
      practiceGoal: 'नेट लैब में बेलन नेट और कक्षा 10 Q5 हल करें।',
    },
    st_int_cone_slant: {
      title: 'शंकु के भीतर पाइथागोरस प्रमेय',
      concept: 'तिर्यक ऊँचाई l = √(r² + h²) से वक्र पृष्ठ CSA = πrl निकलता है।',
      practiceGoal: 'कक्षा 10 Q6 और Q10 हल करें।',
    },
    st_adv_sphere_hemisphere: {
      title: 'ठोस गोले को दो अर्धगोलों में काटना',
      concept: 'काटने पर 2 नए वृत्ताकार फलक (+2πr²) खुलते हैं, जिससे कुल TSA 6πr² हो जाता है।',
      practiceGoal: 'कक्षा 10 Q1, Q3 और Q8 में महारत पाएँ।',
    },
    st_adv_frustum_pyramids: {
      title: 'छिन्नक, प्रिज्म और सम अष्टफलक',
      concept: 'शंकु के छिन्नक का वक्र क्षेत्रफल औसत त्रिज्या π(r₁ + r₂)l से निकलता है।',
      practiceGoal: 'त्रिज्याएँ r₁ और r₂ बदलकर अंतर देखें।',
    },
    tc_beg_unfolding_visuals: {
      title: 'क्लासरूम प्रोजेक्टर 3D प्रदर्शन',
      concept: 'कक्षा में स्पष्ट रूप से दिखाने के लिए Teacher Studio के क्लासरूम मोड का उपयोग करें।',
      practiceGoal: 'Teacher Studio में क्लासरूम डेमो आज़माएँ।',
    },
    tc_beg_11_cube_nets_lesson: {
      title: 'सभी 11 मान्य घन नेट का शिक्षण',
      concept: 'सही 11 नेट और टकराने वाले गलत नेट की तुलना छात्रों को लाइव दिखाएँ।',
      practiceGoal: 'नेट लैब गैलरी और नेट चेकर का उपयोग करें।',
    },
    tc_int_lsavs_tsa_demo: {
      title: 'फलक-दर-फलक LSA बनाम TSA व्याख्या',
      concept: 'LSA हाइलाइट चुनने से छात्रों को तुरंत दिखता है कि ढक्कन व आधार क्यों छोड़े जाते हैं।',
      practiceGoal: 'Teacher Studio में पाठ योजना सहेजें।',
    },
    tc_int_class10_board_prep: {
      title: 'बोर्ड परीक्षा 10-चरणीय हल पद्धति',
      concept: 'दिया है → सूत्र → व्युत्पत्ति → गणना → मात्रक क्रम से NCERT Q1–Q10 समझाएँ।',
      practiceGoal: '2 मॉडल प्रश्न बुकमार्क करें।',
    },
    tc_adv_custom_worksheets: {
      title: 'प्रिंटेबल वर्कशीट व उत्तर कुंजी निर्माण',
      concept: 'बिना दोहराव के विषय-वार प्रश्नपत्र व विस्तृत हल PDF रूप में प्रिंट करें।',
      practiceGoal: '6 प्रश्नों की मिश्रित वर्कशीट तैयार करें।',
    },
    tc_adv_cohort_diagnostics: {
      title: 'छात्र प्रगति व कमज़ोर विषय पहचान',
      concept: 'Analytics में विषय-वार सटीकता देखकर उपचारात्मक 3D अभ्यास कराएँ।',
      practiceGoal: 'Analytics में शिक्षक दृश्य खोलें।',
    },
    ex_beg_ratio_shortcuts: {
      title: '10 सेकंड में k² और k³ अनुपात ट्रिक',
      concept: 'यदि त्रिज्या k गुना हो तो क्षेत्रफल k² और आयतन k³ गुना होता है—पूरा मान बार-बार न रखें।',
      practiceGoal: 'General Aptitude अनुपात MCQ हल करें।',
    },
    ex_beg_cube_cut_join: {
      title: 'घन जोड़ने व काटने की त्वरित विधि',
      concept: 'n घन जोड़ने पर 2(n−1) फलक घटते हैं और एक सीधी काट से 2 नए फलक जुड़ते हैं।',
      practiceGoal: 'SSC घन-संयोजन अभ्यास पूरे करें।',
    },
    ex_int_recasting_melting: {
      title: 'पिघलाने व ढालने में आयतन संरक्षण',
      concept: 'दोनों ओर से पहले π काटें! दशमलव गुणा करने से पहले सूत्र रूप में तुलना करें।',
      practiceGoal: 'KCET और Banking रूपांतरण MCQ हल करें।',
    },
    ex_int_pythagorean_cones: {
      title: 'पाइथागोरस त्रिक (3-4-5, 5-12-13, 7-24-25)',
      concept: 'शंकु व पिरामिड में वर्गमूल निकाले बिना सीधे तिर्यक ऊँचाई l पहचानें।',
      practiceGoal: '45 सेकंड प्रति प्रश्न के लक्ष्य से 5 प्रश्न हल करें।',
    },
    ex_adv_frustum_kcet_jee: {
      title: 'छिन्नक और अंतर्निहित ठोस आकृतियाँ',
      concept: 'घन के भीतर सबसे बड़े शंकु के लिए r = a/2 तथा h = a होता है।',
      practiceGoal: 'JEE Foundation व KCET कठिन प्रश्न हल करें।',
    },
    ex_adv_timed_mock_mastery: {
      title: 'टाइम्ड मॉक टेस्ट और गति संतुलन',
      concept: 'काउंटडाउन टाइमर में प्रति प्रश्न समय और सटीकता दोनों का विश्लेषण करें।',
      practiceGoal: '≥ 75% सटीकता के साथ मॉक टेस्ट पूरा करें।',
    },
  },
})
