import { PLATFORM_TRANSLATIONS } from './platformTranslations.js'

/**
 * Central 5-language translation architecture for NetFold 3D:
 * English (en), Kannada (kn), Tamil (ta), Telugu (te), and Hindi (hi).
 * Covers all 15 3D shapes with zero hardcoded UI strings.
 */
export const LANGUAGES = Object.freeze({
  EN: 'en',
  KN: 'kn',
  TA: 'ta',
  TE: 'te',
  HI: 'hi',
})

export const LANGUAGE_OPTIONS = Object.freeze([
  { code: LANGUAGES.EN, name: 'English', nativeLabel: 'English' },
  { code: LANGUAGES.KN, name: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: LANGUAGES.TA, name: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: LANGUAGES.TE, name: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: LANGUAGES.HI, name: 'Hindi', nativeLabel: 'हिन्दी' },
])

export function isSupportedLanguage(code) {
  return Object.values(LANGUAGES).includes(code)
}

export function getTranslations(language) {
  return TRANSLATIONS[language] ?? TRANSLATIONS[LANGUAGES.EN]
}

/**
 * Resolves a localized face name for both fixed face IDs (bottom, top, front, ...)
 * and dynamic indexed face IDs (`side_0..side_5`, `face_0..face_7`).
 *
 * @param {Object} t - Active translation dictionary.
 * @param {string} faceId - Face identifier.
 * @returns {string}
 */
export function getLocalizedFaceName(t, faceId) {
  if (t.faceNames[faceId]) {
    return t.faceNames[faceId]
  }
  if (faceId.startsWith('side_')) {
    const idx = Number(faceId.slice(5)) + 1
    return `${t.sideWallPrefix} ${idx}`
  }
  if (faceId.startsWith('face_')) {
    const idx = Number(faceId.slice(5)) + 1
    return `${t.faceBadgePrefix} ${idx}`
  }
  return faceId
}

const BASE_TRANSLATIONS = {
  en: {
    appTitle: 'NetFold 3D',
    appSubtitle: 'Interactive 3D Mensuration Lab',
    languageSelectLabel: 'Language',
    languageSelectAria: 'Select application language',
    shapeSectionTitle: 'Select 3D Shape (15 Shapes)',
    class8CategoryLabel: 'Class 8 NCERT',
    beyondClass8CategoryLabel: 'Beyond Class 8',
    beyondClass8Badge: 'Beyond Class 8 (Class 9/10 topic)',
    beyondSubgroups: {
      prisms: 'Prisms',
      pyramids: 'Pyramids',
      curvedAndPlatonic: 'Curved & Platonic Solids',
    },
    shapes: {
      cube: 'Cube',
      cuboid: 'Cuboid',
      cylinder: 'Cylinder',
      cone: 'Cone',
      square_pyramid: 'Square Pyramid',
      sphere: 'Sphere',
      triangular_prism: 'Triangular Prism',
      triangular_pyramid: 'Triangular Pyramid (Tetrahedron)',
      pentagonal_prism: 'Pentagonal Prism',
      hexagonal_prism: 'Hexagonal Prism',
      pentagonal_pyramid: 'Pentagonal Pyramid',
      hexagonal_pyramid: 'Hexagonal Pyramid',
      hemisphere: 'Hemisphere',
      frustum: 'Frustum of Cone',
      octahedron: 'Octahedron',
    },
    foldSectionTitle: 'Net Folding',
    foldPresets: {
      flat: '0% Flat',
      half: '50% Half',
      closed: '100% Solid',
    },
    foldStage: {
      flat: 'Flat 2D Net',
      folding: 'Folding in Progress',
      closed: 'Closed 3D Solid',
      noNet: '3D Solid (No Exact Flat Net)',
    },
    sphereNoNetMessage: 'A sphere has no flat net, so it cannot be folded.',
    hemisphereNoNetMessage:
      'A hemisphere has no exact flat net, so its curved dome cannot be folded flat.',
    sphereLsaNotApplicable: 'Not applicable for a sphere',
    octahedronLsaNotApplicable:
      'Not applicable (all 8 equilateral faces are identical)',
    dimensionsSectionTitle: 'Dimensions',
    dimensionLabels: {
      a: 'Edge (a)',
      baseSideA: 'Base Side (a)',
      l: 'Length (l)',
      b: 'Breadth (b)',
      h: 'Height (h)',
      r: 'Radius (r)',
      r1: 'Bottom Radius (r₁)',
      r2: 'Top Radius (r₂)',
      slantL: 'Slant Height (l)',
      slantS: 'Slant Height (s)',
      diameter: 'Diameter (2r)',
    },
    unitsSectionTitle: 'Unit',
    unitNames: {
      cm: 'Centimetres (cm)',
      m: 'Metres (m)',
    },
    unitShort: {
      cm: 'cm',
      m: 'm',
    },
    unitSymbols: {
      cm: { length: 'cm', area: 'cm²', volume: 'cm³' },
      m: { length: 'm', area: 'm²', volume: 'm³' },
    },
    unitHintTitle: 'Large dimensions in metres',
    unitHintBody:
      'Values of 5 m or more represent huge objects (like a room or water tank). Did you mean centimetres (cm)?',
    unitHintSwitch: 'Switch to cm',
    highlightSectionTitle: 'Visual Highlight',
    highlightModes: {
      all: 'Normal',
      lsa: 'LSA',
      tsa: 'TSA',
      volume: 'Volume',
    },
    highlightDescriptions: {
      all: 'All faces shown in distinct educational colors.',
      lsa: 'Lateral or curved faces highlighted; base/top caps dimmed.',
      tsa: 'Every outer surface highlighted because TSA sums all faces.',
      volume: 'Translucent interior fill showing 3D capacity inside the solid.',
    },
    canvasHint: 'Drag to orbit · Scroll or pinch to zoom · Tap any face',
    noNetCanvasHint:
      'Drag to orbit · Scroll or pinch to zoom · Curved 3D solid',
    resetCamera: 'Reset View',
    volumeFoldHint: 'Fold toward 100% to enclose the full volume fill',
    tapFaceHint: 'Tap a face on the net or list to inspect it',
    clearSelection: 'Clear',
    selectedFacePrefix: 'Selected',
    faceBadgePrefix: 'Face',
    sideWallPrefix: 'Wall',
    faceNames: {
      bottom: 'Base',
      front: 'Front',
      back: 'Back',
      top: 'Top',
      left: 'Left',
      right: 'Right',
      lateral: 'Curved Surface',
      surface: 'Curved Surface',
    },
    faceRoles: {
      base: 'Base',
      top: 'Top',
      lateral: 'Lateral Face',
      curved: 'Curved Surface',
      face: 'Triangular Face',
    },
    faceBreakdownTitle: 'Face Areas (Net Breakdown)',
    sumOfFacesLabel: 'Sum of all faces = TSA',
    sphereSurfaceBreakdownNote:
      'Continuous single curved surface around all directions',
    formulaCardTitle: 'Step-by-Step Formulas & Substitution',
    slantHeightStepLabel: 'Slant Height',
    volumeLabel: 'Volume',
    lsaLabel: 'LSA (Lateral Surface Area)',
    csaLabel: 'CSA (Curved Surface Area)',
    tsaLabel: 'TSA (Total Surface Area)',
    surfaceAreaLabel: 'Surface Area (TSA)',
    lsaExcludedTitle: 'Why base/top caps are excluded from LSA',
    lsaExclusionNote: {
      cube: 'LSA counts only the 4 side walls (4a²). Top + Base (2a²) are excluded.',
      cuboid:
        'LSA counts only the 4 side walls: 2h(l + b). Top + Base (2lb) are excluded.',
      cylinder:
        'CSA counts only the curved rectangular wall (2πrh). Both circular caps (2πr²) are excluded.',
      cone: 'LSA counts only the curved cone sector (πrl). The circular base (πr²) is excluded.',
      square_pyramid:
        'LSA counts only the 4 triangular faces (2as). The square base (a²) is excluded.',
      sphere: 'Not applicable for a sphere',
      triangular_prism:
        'LSA counts only the 3 rectangular walls (3ah). Both triangular caps are excluded.',
      pentagonal_prism:
        'LSA counts only the 5 rectangular walls (5ah). Both pentagonal caps are excluded.',
      hexagonal_prism:
        'LSA counts only the 6 rectangular walls (6ah). Both hexagonal caps are excluded.',
      triangular_pyramid:
        'LSA counts only the 3 triangular side faces ((3/2)as). The triangular base is excluded.',
      pentagonal_pyramid:
        'LSA counts only the 5 triangular side faces ((5/2)as). The pentagonal base is excluded.',
      hexagonal_pyramid:
        'LSA counts only the 6 triangular side faces (3as). The hexagonal base is excluded.',
      hemisphere:
        'CSA counts only the curved hemispherical dome (2πr²). The flat circular base (πr²) is excluded.',
      frustum:
        'LSA counts only the curved slant band π(r₁ + r₂)l. Both circular caps (πr₁² + πr₂²) are excluded.',
      octahedron: 'Not applicable (all 8 equilateral faces are identical)',
    },
    excludedCapsLabel: 'Excluded',
    learningPanelTitle: 'Shape Learning Guide',
    definitionLabel: 'Definition',
    geometryStatsLabel: 'Properties (Faces, Edges & Vertices)',
    facesStatLabel: 'Faces / Surfaces',
    edgesStatLabel: 'Edges',
    verticesStatLabel: 'Vertices',
    importantDimensionsLabel: 'Important Dimensions',
    workedExampleLabel: 'Worked Example',
    realWorldExampleLabel: 'Real-World Application',
    didYouKnowLabel: 'Did You Know?',
    guideLabels: {
      radius: 'Radius (r)',
      height: 'Height (h)',
      slantL: 'Slant (l)',
      slantS: 'Slant (s)',
    },
    learningByShape: {
      cube: {
        definition:
          'A cube is a regular 3D solid bounded by six identical square faces meeting at right angles.',
        faces: '6 square faces',
        edges: '12 equal edges',
        vertices: '8 vertices',
        dimensionsSummary:
          'Only one edge length (a) defines the entire cube because length = breadth = height = a.',
        workedExample:
          'For a = 5 cm: LSA = 4 × 5² = 100 cm², TSA = 6 × 5² = 150 cm², Volume = 5³ = 125 cm³.',
        realWorldExample:
          'Rubik’s cube, board-game dice, gift boxes, and ice cubes.',
        didYouKnow:
          'A cube has 11 distinct flat nets made of 6 connected squares that can all fold into the same solid.',
      },
      cuboid: {
        definition:
          'A cuboid is a rectangular 3D box bounded by six rectangular faces whose opposite faces are identical.',
        faces: '6 rectangular faces',
        edges: '12 edges (4 each of l, b, h)',
        vertices: '8 vertices',
        dimensionsSummary:
          'Defined by three perpendicular dimensions: length (l), breadth (b), and vertical height (h).',
        workedExample:
          'For l = 10, b = 6, h = 4 cm: LSA = 2×4(10+6) = 128 cm², TSA = 248 cm², Volume = 240 cm³.',
        realWorldExample:
          'Textbooks, building bricks, shoeboxes, and shipping cartons.',
        didYouKnow:
          'Every cube is a special cuboid where l = b = h, and its 4 side walls unfold into one long rectangle of length 2(l + b).',
      },
      cylinder: {
        definition:
          'A right circular cylinder has two parallel congruent circular bases joined by one smooth curved lateral surface.',
        faces: '3 surfaces (2 flat circles + 1 curved wall)',
        edges: '2 circular edges',
        vertices: '0 vertices',
        dimensionsSummary:
          'Defined by base radius (r) and height (h). Unrolling the curved wall creates a rectangle of width 2πr and height h.',
        workedExample:
          'For r = 3 cm, h = 5 cm: CSA = 30π ≈ 94.25 cm², TSA = 48π ≈ 150.80 cm², V = 45π ≈ 141.37 cm³.',
        realWorldExample:
          'Overhead water storage tanks, steel tumblers, pipes, and food cans.',
        didYouKnow:
          'The width of a cylinder’s unwrapped rectangle equals the circumference (2πr) of its circular base, which is why CSA = 2πrh.',
      },
      cone: {
        definition:
          'A right circular cone tapers smoothly from a flat circular base up to a single pointed apex directly above its center.',
        faces: '2 surfaces (1 circular base + 1 curved surface)',
        edges: '1 circular edge',
        vertices: '1 apex vertex',
        dimensionsSummary:
          'Defined by radius (r), vertical height (h), and slant height l = √(r² + h²) along the tilted side.',
        workedExample:
          'For r = 3 cm, h = 4 cm: l = 5 cm; LSA = 15π ≈ 47.12 cm², TSA = 24π ≈ 75.40 cm², V = 12π ≈ 37.70 cm³.',
        realWorldExample:
          'Ice-cream waffle cones, traffic safety cones, funnels, and party hats.',
        didYouKnow:
          'A cone holds exactly one-third (1/3) the volume of a cylinder with the exact same radius and height!',
      },
      square_pyramid: {
        definition:
          'A right square pyramid has a square base and four congruent isosceles triangles sloping up to meet at one apex.',
        faces: '5 faces (1 square base + 4 triangles)',
        edges: '8 edges (4 base + 4 slant)',
        vertices: '5 vertices (4 base + 1 apex)',
        dimensionsSummary:
          'Defined by base side (a), vertical height (h), and triangular face slant height s = √(h² + (a/2)²).',
        workedExample:
          'For a = 6 cm, h = 4 cm: s = 5 cm; LSA = 60 cm², TSA = 96 cm², Volume = 48 cm³.',
        realWorldExample:
          'The Great Pyramid of Giza, four-sided tent roofs, and monument caps.',
        didYouKnow:
          'Just like a cone inside a cylinder, a square pyramid holds exactly one-third (1/3) the volume of a cuboid with the same base and height.',
      },
      sphere: {
        definition:
          'A sphere is a perfectly round 3D surface where every point is at the exact same distance (radius r) from its center.',
        faces: '1 continuous curved surface',
        edges: '0 edges',
        vertices: '0 vertices',
        dimensionsSummary:
          'Completely defined by a single dimension: its radius (r) from center to surface (diameter = 2r).',
        workedExample:
          'For r = 7 cm: Surface Area = 4π(7²) = 196π ≈ 615.75 cm², Volume = (4/3)π(7³) ≈ 1436.76 cm³.',
        realWorldExample:
          'Cricket balls, footballs, planets, marbles, and world globes.',
        didYouKnow:
          'A sphere cannot be flattened into an exact net without stretching or tearing—that is why world maps always distort continents!',
      },
      triangular_prism: {
        definition:
          'A triangular prism has two parallel congruent triangular bases joined by three rectangular side faces.',
        faces: '5 faces (2 triangles + 3 rectangles)',
        edges: '9 edges',
        vertices: '6 vertices',
        dimensionsSummary:
          'Defined by equilateral triangle side (a) and prism length/height (h). Base area = (√3/4)a².',
        workedExample:
          'For a = 4 cm, h = 5 cm: Base = 4√3 ≈ 6.93 cm², LSA = 60 cm², TSA ≈ 73.86 cm², V ≈ 34.64 cm³.',
        realWorldExample:
          'Glass optical prisms, Toblerone chocolate boxes, and A-frame tent roofs.',
        didYouKnow:
          'Cutting a cuboid diagonally along two opposite edges splits it into two identical triangular prisms!',
      },
      triangular_pyramid: {
        definition:
          'A triangular pyramid (tetrahedron) has a triangular base and three triangular side faces meeting at one apex.',
        faces: '4 triangular faces',
        edges: '6 edges',
        vertices: '4 vertices',
        dimensionsSummary:
          'Defined by base triangle side (a), vertical height (h), and slant height s = √(h² + (a/(2√3))²). When h = a√(2/3), it is a Regular Tetrahedron.',
        workedExample:
          'For a = 6 cm, h = 5 cm: Base ≈ 15.59 cm², s ≈ 5.29 cm, LSA ≈ 47.62 cm², TSA ≈ 63.21 cm², V ≈ 25.98 cm³.',
        realWorldExample:
          'Tetra Pak milk cartons, tetrahedral dice, and molecular models like methane (CH₄).',
        didYouKnow:
          'A tetrahedron is the simplest possible 3D polyhedron—you cannot enclose 3D space with fewer than 4 flat faces!',
      },
      pentagonal_prism: {
        definition:
          'A pentagonal prism has two parallel regular pentagon bases joined by five rectangular lateral faces.',
        faces: '7 faces (2 pentagons + 5 rectangles)',
        edges: '15 edges',
        vertices: '10 vertices',
        dimensionsSummary:
          'Defined by pentagon edge (a) and prism height (h). Base area = (5a²) / (4 tan 36°).',
        workedExample:
          'For a = 4 cm, h = 6 cm: Base ≈ 27.53 cm², LSA = 120 cm², TSA ≈ 175.06 cm², V ≈ 165.17 cm³.',
        realWorldExample:
          '5-sided architectural towers, custom nuts/bolts, and pentagonal pencil stands.',
        didYouKnow:
          'The Pentagon building in the US has the exact layout of a hollow pentagonal prism!',
      },
      hexagonal_prism: {
        definition:
          'A hexagonal prism has two parallel regular hexagon bases joined by six rectangular lateral faces.',
        faces: '8 faces (2 hexagons + 6 rectangles)',
        edges: '18 edges',
        vertices: '12 vertices',
        dimensionsSummary:
          'Defined by hexagon side (a) and height (h). A regular hexagon splits into 6 equilateral triangles, so Base = (3√3/2)a².',
        workedExample:
          'For a = 4 cm, h = 5 cm: Base = 24√3 ≈ 41.57 cm², LSA = 120 cm², TSA ≈ 203.14 cm², V ≈ 207.85 cm³.',
        realWorldExample:
          'Hexagonal pencils, honeycomb bee cells, and standard hex bolts/nuts.',
        didYouKnow:
          'Honeybees build hexagonal prisms because hexagons tile flat space with zero gaps using the least wax!',
      },
      pentagonal_pyramid: {
        definition:
          'A pentagonal pyramid has a regular pentagon base and five congruent triangular faces meeting at one apex.',
        faces: '6 faces (1 pentagon + 5 triangles)',
        edges: '10 edges (5 base + 5 slant)',
        vertices: '6 vertices (5 base + 1 apex)',
        dimensionsSummary:
          'Defined by base side (a), vertical height (h), and slant height s = √(h² + (a / (2 tan 36°))²).',
        workedExample:
          'For a = 4 cm, h = 6 cm: Base ≈ 27.53 cm², s ≈ 6.60 cm, LSA ≈ 66.04 cm², TSA ≈ 93.56 cm², V ≈ 55.06 cm³.',
        realWorldExample:
          'Star-shaped decorative lanterns, church spires, and pavilion roofs.',
        didYouKnow:
          'Any regular n-sided pyramid satisfies Euler’s formula F + V - E = 2: for a pentagon, 6 + 6 - 10 = 2!',
      },
      hexagonal_pyramid: {
        definition:
          'A hexagonal pyramid has a regular hexagon base and six congruent triangular faces tapering to a single apex.',
        faces: '7 faces (1 hexagon + 6 triangles)',
        edges: '12 edges (6 base + 6 slant)',
        vertices: '7 vertices (6 base + 1 apex)',
        dimensionsSummary:
          'Defined by hexagon base side (a), vertical height (h), and slant height s = √(h² + (√3a/2)²).',
        workedExample:
          'For a = 4 cm, h = 3 cm: Base ≈ 41.57 cm², s = √21 ≈ 4.58 cm, LSA ≈ 54.99 cm², TSA ≈ 96.56 cm², V ≈ 41.57 cm³.',
        realWorldExample:
          'Six-sided gazebos, faceted quartz crystal tips, and umbrella canopies.',
        didYouKnow:
          'In Euler’s formula F + V - E = 2, a hexagonal pyramid has equal numbers of faces and vertices (7 + 7 - 12 = 2)!',
      },
      hemisphere: {
        definition:
          'A hemisphere is exactly half of a sphere sliced through its center, creating one curved dome and one flat circular base.',
        faces: '2 surfaces (1 circular base + 1 curved dome)',
        edges: '1 circular edge',
        vertices: '0 vertices',
        dimensionsSummary:
          'Defined solely by radius (r). Curved Surface Area is 2πr², and adding the flat circle gives TSA = 3πr².',
        workedExample:
          'For r = 7 cm: CSA = 98π ≈ 307.88 cm², TSA = 147π ≈ 461.81 cm², Volume = (686/3)π ≈ 718.38 cm³.',
        realWorldExample:
          'Serving bowls, planetarium domes, igloos, and half-cut melons.',
        didYouKnow:
          'Cutting a sphere in half adds a flat circular face of area πr², so two hemispheres have 6πr² total surface area—50% more than one whole sphere!',
      },
      frustum: {
        definition:
          'A frustum of a cone is the remaining solid when the top smaller cone is sliced off parallel to the circular base.',
        faces: '3 surfaces (2 parallel circles + 1 curved wall)',
        edges: '2 circular edges',
        vertices: '0 vertices',
        dimensionsSummary:
          'Defined by bottom radius (r₁), top radius (r₂), height (h), and slant height l = √(h² + (r₁ - r₂)²).',
        workedExample:
          'For r₁ = 6, r₂ = 3, h = 4 cm: l = 5 cm; LSA = 45π ≈ 141.37 cm², TSA = 90π ≈ 282.74 cm², V = 84π ≈ 263.89 cm³.',
        realWorldExample:
          'Plastic water buckets, coffee cups, megaphones, and lampshades.',
        didYouKnow:
          'When r₁ = r₂, a frustum’s formulas automatically simplify into a cylinder (l = h, LSA = 2πrh, V = πr²h)!',
      },
      octahedron: {
        definition:
          'A regular octahedron is a Platonic solid formed by eight congruent equilateral triangles meeting four at each vertex.',
        faces: '8 equilateral triangular faces',
        edges: '12 equal edges',
        vertices: '6 vertices',
        dimensionsSummary:
          'Defined by a single edge length (a). It equals two square-based pyramids of edge a glued base-to-base.',
        workedExample:
          'For a = 6 cm: TSA = 2√3 × 36 = 72√3 ≈ 124.71 cm², Volume = (√2/3) × 216 = 72√2 ≈ 101.82 cm³.',
        realWorldExample:
          'Eight-sided tabletop gaming dice (d8), raw diamond crystals, and fluorite crystals.',
        didYouKnow:
          'The octahedron is the geometric "dual" of the cube: connecting the centers of a cube’s 6 faces forms a regular octahedron!',
      },
    },
    navTabs: {
      ariaLabel: 'Application Workspace',
      explorer: 'Shape Explorer',
      netlab: 'Net Lab',
      tutor: 'AI Tutor',
      missions: 'Missions',
      practice: 'Class 10 Practice',
      hub: 'Progress & Guide',
    },
    netLab: {
      headerTitle: 'Tier 2 · Interactive Net Lab & Scaling Explorer',
      headerSubtitle:
        'Explore all 11 cube nets, test folding intuition, inspect cuboid & cylinder nets, learn to draw nets in 6 steps, and visualize k² / k³ enlargement.',
      subTabs: {
        gallery: '11 Cube Nets',
        checker: 'Net Checker Game',
        cuboid: 'Cuboid Net',
        cylinder: 'Cylinder Net',
        draw: 'Draw-a-Net Guide',
        scale: 'Volume Enlargement',
      },
      gallery: {
        title: 'All 11 Mathematically Valid Cube Nets',
        subtitle:
          'Select any net to inspect its 2D pattern and watch all 6 faces hinge smoothly into a closed cube.',
        selectNetHint: 'Choose one of the 11 cube nets',
        familyLabel: 'Family',
        animatePlay: 'Auto-Fold',
        animatePause: 'Pause',
        selectedLabel: 'Selected Net',
        families: {
          '1-4-1': '1-4-1 Spine (6 nets)',
          '2-3-1': '2-3-1 Offset (3 nets)',
          '2-2-2': '2-2-2 Staircase (1 net)',
          '3-3': '3-3 Twin Strip (1 net)',
        },
        nets: {
          net_1_4_1_cross: {
            name: '1. Classic Cross (T-Base)',
            tip: '4 squares wrap around the middle while 2 opposite flaps form Base and Top.',
          },
          net_1_4_1_same_end: {
            name: '2. Aligned Ends',
            tip: 'Both end flaps hinge off the same column on opposite sides of the 4-square belt.',
          },
          net_1_4_1_step_01: {
            name: '3. One-Step Offset',
            tip: 'Top and bottom flaps shift by 1 square yet still land cleanly on opposite faces.',
          },
          net_1_4_1_step_02: {
            name: '4. Two-Step Offset',
            tip: 'Even separated by two columns, wrapping a 4-square loop brings the caps opposite each other.',
          },
          net_1_4_1_opposite_ends: {
            name: '5. Opposite Ends (Z-Belt)',
            tip: 'Maximal separation along the 4-square belt; closes cleanly with zero overlap.',
          },
          net_1_4_1_zigzag: {
            name: '6. Centered Zigzag',
            tip: 'Asymmetric 1-4-1 variation where the caps sit on columns 2 and 3 of the middle strip.',
          },
          net_2_3_1_a: {
            name: '7. 2-3-1 Near Cap',
            tip: '3 middle squares fold three walls; the 2-square leg wraps around to form Base/Right and Back.',
          },
          net_2_3_1_b: {
            name: '8. 2-3-1 Centered Cap',
            tip: 'Moves the top flap above the middle square of the 3-strip; still covers all 6 cube faces.',
          },
          net_2_3_1_c: {
            name: '9. 2-3-1 Far Cap',
            tip: 'Places the top flap at the far right end while the bottom L-arm closes the opposite face.',
          },
          net_2_2_2_stairs: {
            name: '10. Staircase (2-2-2)',
            tip: 'Alternating right-and-down turns wrap tightly in a diagonal spiral around the cube.',
          },
          net_3_3_twin: {
            name: '11. Twin Strips (3-3)',
            tip: 'Two 3-square strips meet at a single bridge edge, each folding half the cube!',
          },
        },
      },
      checker: {
        title: 'Net Checker Challenge',
        subtitle:
          'Decide whether each 2D arrangement folds into a closed cube without overlapping or missing faces.',
        question: 'Does this fold into a cube?',
        yesButton: 'Yes, folds into a cube',
        noButton: 'No, does not fold',
        correctBadge: 'Correct!',
        wrongBadge: 'Not quite — check why:',
        nextPuzzle: 'Next Pattern',
        playAgain: 'Play Again',
        resetProgress: 'Reset Progress',
        scoreLabel: 'Score',
        streakLabel: 'Streak',
        bestLabel: 'Best Score',
        progressLabel: 'Pattern',
        completedTitle: 'Net Checker Complete!',
        completedSummary:
          'You tested all 12 valid and invalid cube net patterns.',
        foldIn3D: 'Test Fold in 3D',
        hide3D: 'Hide 3D Preview',
        explanations: {
          valid141:
            'Valid 1-4-1 net: the central belt of 4 closes the loop while 1 flap on each side seals the Top and Bottom.',
          valid231:
            'Valid 2-3-1 net: every square rotates onto a distinct face with zero collisions.',
          valid222:
            'Valid 2-2-2 staircase net: alternating orthogonal turns cover all 6 cube faces cleanly.',
          valid33:
            'Valid 3-3 twin-strip net: each 3-square L-bend covers 3 mutually adjacent faces meeting at a corner.',
          validOppositeEnds:
            'Valid 1-4-1 opposite-ends net: distance along the 4-square spine does not prevent closing opposite caps.',
          invalidSameSide:
            'Invalid! Both side flaps lie on the same side of the belt, so they collide on one face and leave the opposite side open.',
          invalidLine:
            'Invalid! Six squares in a straight line roll around the same 4 faces and overlap twice, leaving Left and Right open.',
          invalid2x2:
            'Invalid! Any net containing a solid 2×2 block of squares cannot form a cube—its corners collide during folding.',
          invalidDisconnected:
            'Invalid! These squares only touch diagonally at one corner with no shared hinged edge.',
          invalidURing:
            'Invalid! Wrapping around in a C/U loop folds two squares onto the exact same position.',
          invalidCount:
            'Invalid! There are only 5 squares here, but a closed cube always requires 6 square faces.',
        },
      },
      cuboid: {
        title: 'Labelled Cross-Shaped Cuboid Net',
        subtitle:
          'Adjust l, b, and h to inspect how opposite rectangular face pairs share matching dimensions and sum to TSA.',
        pairBaseTop: 'Base & Top (l × b)',
        pairFrontBack: 'Front & Back (l × h)',
        pairLeftRight: 'Left & Right (h × b)',
        totalTsaLabel: 'Total Surface Area (Sum of 6 rectangles)',
        openIn3D: 'Open in 3D Cuboid',
      },
      cylinder: {
        title: 'Cylinder Net: Rectangle + 2 Circles',
        subtitle:
          'Unrolling a cylinder creates one rectangle wrapped around two identical circular lids.',
        rectLabel: 'Curved Wall (Rectangle)',
        circleTopLabel: 'Top Circle',
        circleBottomLabel: 'Base Circle',
        circumferenceRuleTitle: 'Why Rectangle Length = 2πr',
        circumferenceRuleBody:
          'When folded into a tube, the horizontal length of the rectangle wraps seamlessly once around the rim of each circle—so its exact length must equal the circle’s circumference 2πr!',
        rectWidthLabel: 'Rectangle Width = Circumference (2πr)',
        rectHeightLabel: 'Rectangle Height (h)',
        circleRadiusLabel: 'Circle Radius (r)',
        capAreaLabel: 'Each Circle Area (πr²)',
        curvedAreaLabel: 'Rectangle Area (2πr × h = 2πrh)',
        openIn3D: 'Open in 3D Cylinder Explorer',
      },
      draw: {
        title: 'Draw-a-Net in 6 Guided Steps',
        subtitle:
          'Follow these 6 clear steps whenever you sketch any 3D solid’s flat net on paper.',
        stepPrefix: 'Step',
        previous: 'Previous',
        next: 'Next',
        restart: 'Start Over',
        finishMessage: 'Ready to draw and verify any 3D net!',
        steps: {
          s1: {
            title: '1. Imagine the solid unfolded',
            body: 'Picture cutting along the taped edges of a cardboard box and pressing every flap completely flat on a table.',
            checklist: 'Notice edges that share a hinge stay attached.',
          },
          s2: {
            title: '2. Identify the faces',
            body: 'Count total faces and note their shapes: 6 squares for a cube, 3 matching rectangle pairs for a cuboid, or 1 rectangle + 2 circles for a cylinder.',
            checklist: 'Write down each face’s length and breadth first.',
          },
          s3: {
            title: '3. Draw the base',
            body: 'Sketch the bottom base face cleanly near the center of your sheet using accurate edge lengths so every flap has room.',
            checklist: 'Leave space on all 4 sides before attaching flaps.',
          },
          s4: {
            title: '4. Attach the other faces',
            body: 'Draw the adjacent side walls directly along each edge of the base—making sure shared edges are equal in length.',
            checklist: 'Example: Front wall shares length l with Base edge.',
          },
          s5: {
            title: '5. Add the remaining faces',
            body: 'Attach the opposite lid (Top) onto the outer edge of one side flap (such as Back) so it closes smoothly over the top.',
            checklist: 'Verify Top has identical l × b size to the Base.',
          },
          s6: {
            title: '6. Mentally fold to check',
            body: 'Fold every hinged flap upward by 90° in your imagination to confirm all 6 faces meet edge-to-edge with zero overlaps.',
            checklist: 'Count faces (6 for prism box) and check opposite pairs.',
          },
        },
      },
      scale: {
        title: 'Volume & Surface Area Enlargement (k, k², k³)',
        subtitle:
          'Scale every edge/radius by k (1× to 3×) and observe how Area grows by k² while Volume grows by k³.',
        scaleFactorLabel: 'Scale Factor (k)',
        shapeLabel: 'Test Solid',
        originalHeader: 'Original (1×)',
        scaledHeader: 'Enlarged (k×)',
        dimensionsRow: 'Linear Dimensions (× k)',
        lsaRow: 'LSA / CSA (× k²)',
        tsaRow: 'TSA (× k²)',
        volumeRow: 'Volume (× k³)',
        areaScaleFormula: 'Area scales by k²',
        volumeScaleFormula: 'Volume scales by k³',
        insightTitle: 'Why does Volume grow faster than Surface Area?',
        insightBody:
          'Doubling every edge (2×) makes faces 2² = 4× wider (two dimensions scale), whereas 3D space inside grows across length, width, AND height: 2³ = 8×! Tripling (3×) gives 9× area and 27× volume.',
      },
    },
    tutor: {
      headerTitle: 'Mensuration & 3D Nets Study Tutor',
      headerSubtitle:
        'Ask about any of the 15 3D shapes, surface area & volume formulas, nets, or step-by-step math problems.',
      demoBadge: 'Demo Tutor (Offline Math Engine — No Live AI)',
      liveBadge: 'Live AI Connected (Server Proxy)',
      demoNoticeTitle: 'Demo Mode Notice: Not Connected to a Live AI API',
      demoNoticeBody:
        'Replies below are generated locally by NetFold 3D’s deterministic math engine & curriculum database (Archify is a diagram skill, not an AI API). To avoid exposing secret keys in browser JS, live LLM answers require a backend proxy route (e.g. POST /api/tutor) holding GEMINI_API_KEY server-side.',
      fallbackFromErrorBanner:
        'Configured AI backend was unreachable, so this answer was generated safely by the local Demo Tutor.',
      archToggleShow: 'How Live AI Integration Works',
      archToggleHide: 'Hide Setup Architecture',
      archTitle: 'Secure Architecture Required for Live AI',
      archSteps: {
        s1: '1. Create a small backend proxy (Node/Express, Netlify/Vercel Function, or Cloudflare Worker) exposing POST /api/tutor.',
        s2: '2. Store GEMINI_API_KEY (or another LLM key) strictly in server environment variables — never in VITE_* frontend files.',
        s3: '3. Set VITE_TUTOR_ENDPOINT=/api/tutor in Netlify/Vercel env; AITutor.jsx sends shapeContext + history securely via POST.',
      },
      contextTitle: 'Current Explorer Context',
      openExplorerButton: 'Open in 3D Explorer',
      liveValuesLabel: 'Live Metrics',
      suggestedTitle: 'Suggested Questions',
      suggested: {
        s1: 'Explain {shape} step-by-step with its current dimensions',
        s2: 'What is the LSA, TSA, and Volume formula for {shape}?',
        s3: 'How does the flat 2D net of {shape} fold?',
        s4: 'How many valid cube nets exist and why do invalid ones fail?',
        s5: 'Solve: Find LSA, TSA & Volume of cuboid l=10, b=6, h=4',
      },
      clearChat: 'Clear Chat',
      emptyTitle: 'Ask your geometry question below',
      emptyBody:
        'Try tapping any suggested question above, or type a problem like "Find TSA and Volume of cylinder r=3 h=5" or "Why has a sphere no flat net?"',
      inputPlaceholder:
        'Ask about shapes, formulas, nets, or a step-by-step problem...',
      sendButton: 'Ask Tutor',
      thinkingText: 'Solving...',
      studentLabel: 'Student',
      demoMessageTag: 'Demo Tutor · Offline Math Engine',
      liveMessageTag: 'Live AI Tutor',
      templates: {
        solvedForPrefix: 'Step-by-step solution for',
        currentContextPrefix: 'Using your selected',
        netHeading: '2D Net & Folding Explanation',
        cubeNetsCountNote:
          'mathematically distinct cube nets exist across the 1-4-1 (6), 2-3-1 (3), 2-2-2 (1), and 3-3 (1) families.',
        scaleHeading: 'Scale Enlargement Analysis',
        formulaHeading: 'Formulas & Live Substitution',
        netByShape: {
          cube: 'A cube unfolds into 6 connected squares along any of 11 valid nets; invalid hexominoes like 2×2 blocks or 6-in-a-row strips overlap when folded.',
          cuboid:
            'A cuboid unfolds into a cross-shaped net of 6 rectangles arranged in 3 congruent opposite pairs: 2(l×b), 2(l×h), and 2(h×b).',
          cylinder:
            'A cylinder unfolds into 1 curved rectangle of width 2πr (matching the circle circumference) and height h, plus 2 congruent circles of area πr².',
          cone: 'A cone unfolds into a circular base (πr²) and a sector of radius l = √(r² + h²) whose arc length equals the base circumference 2πr.',
          square_pyramid:
            'A square pyramid unfolds into 1 square base (a²) with 4 congruent isosceles triangles (½as each) attached to its 4 edges.',
          sphere:
            'A sphere has positive curvature in every direction, so it has NO exact flat polygonal net—it cannot flatten onto paper without stretching or tearing.',
          triangular_prism:
            'A triangular prism unfolds into 2 congruent equilateral triangles plus 3 identical rectangular side walls (a × h each).',
          triangular_pyramid:
            'A triangular pyramid unfolds into 1 triangular base surrounded by 3 congruent triangular faces rising to an apex.',
          pentagonal_prism:
            'A pentagonal prism unfolds into 2 regular pentagons and a belt of 5 identical rectangles (each a × h).',
          hexagonal_prism:
            'A hexagonal prism unfolds into 2 regular hexagons and a belt of 6 identical rectangles (each a × h).',
          pentagonal_pyramid:
            'A pentagonal pyramid unfolds into a regular pentagon base hinged to 5 congruent lateral triangles.',
          hexagonal_pyramid:
            'A hexagonal pyramid unfolds into a regular hexagon base hinged to 6 congruent lateral triangles.',
          hemisphere:
            'Because its curved dome bends in two perpendicular directions simultaneously, a hemisphere has NO exact flat net.',
          frustum:
            'A frustum of a cone unfolds into a curved annular sector band π(r₁ + r₂)l attached to two flat circles of radii r₁ and r₂.',
          octahedron:
            'A regular octahedron unfolds into 8 connected congruent equilateral triangles that hinge by the dihedral angle to enclose space.',
        },
      },
    },
    practice: {
      headerTitle: 'NCERT Mensuration – Class 10 Solved Practice',
      headerSubtitle:
        'Board-exam-style written solutions with concepts, derivations, step-by-step calculations, labelled 3D models, and geometric diagrams (Questions 1–10).',
      boardExamTag: 'Board Exam Written Solution · Class 10 NCERT',
      progressPrefix: 'Question',
      questionSelectorAria: 'Select solved question',
      previousButton: 'Previous',
      nextButton: 'Next',
      expandAll: 'Expand All Steps',
      collapseAll: 'Collapse All',
      stepBadgePrefix: 'Step',
      diagramSectionTitle: 'Labelled 3D Model & Mathematical Diagram',
      interactive3DTab: 'Interactive 3D Model',
      diagramTab: '2D Mathematical Diagram',
      togglePrimaryModel: 'Primary Solid',
      toggleCompareModel: 'Compare Resulting Solid',
      foldSliderLabel: 'Fold / Unfold Preview',
      openInExplorer: 'Open in Shape Explorer',
      scaleNoticePrefix:
        '3D preview is scaled proportionally for clarity; exact NCERT measurements are shown in labels:',
      writtenPracticeNote: 'Detailed Written Solution Module (No MCQ Quiz)',
      diagramLabels: {
        radius: 'Radius',
        diameter: 'Diameter',
        height: 'Height',
        slantHeight: 'Slant Height',
        edge: 'Edge',
        baseArea: 'Base Area',
        surfaceArea: 'Surface Area',
        volume: 'Volume',
        cutPlane: 'Cut Plane (+πr² each)',
        joinedFace: 'Joined Face (-2a² hidden)',
        inscribedCone: 'Largest Inscribed Cone',
        hemisphereBowl: 'Hemispherical Dome',
        flatCircularBase: 'Flat Circular Base',
        semicircleArc: 'Semicircular Region',
      },
      stepTitles: {
        s1: '1. Original Question Statement',
        s2: '2. Relevant Definition & Concept',
        s3: '3. Given Information',
        s4: '4. To Find',
        s5: '5. Relevant Mathematical Formula',
        s6: '6. Step-by-Step Derivation',
        s7: '7. Substitution of Values',
        s8: '8. Detailed Calculations',
        s9: '9. Final Answer with Correct Units',
        s10: '10. Relevant Labelled 3D Model & Mathematical Diagram',
      },
    },
    themeToggle: {
      lightLabel: 'Light',
      darkLabel: 'Dark',
      switchToDark: 'Switch to dark theme',
      switchToLight: 'Switch to light theme',
    },
    canvasControls: {
      lockZoom: 'Lock Wheel',
      unlockZoom: 'Unlock Zoom',
      zoomIn: 'Zoom in 3D view',
      zoomOut: 'Zoom out 3D view',
      scrollSafeNote: 'Scroll moves page · drag rotates 3D',
    },
    search: {
      buttonLabel: 'Search',
      placeholder: 'Search 15 shapes, Class 10 Q1–Q10, missions, or guides…',
      emptyPrompt: 'Type a shape, formula topic, mission, or practice question.',
      noResults: 'No matching shapes or learning sections found.',
      closeLabel: 'Close search',
      shortcutHint: 'Press / or Ctrl+K',
      categories: {
        shapes: '3D Shape',
        missions: 'Mission',
        practice: 'Class 10 Practice',
        netlab: 'Net Lab',
        sections: 'Progress & Guide',
      },
    },
    bookmarks: {
      addShape: 'Bookmark shape',
      removeShape: 'Remove shape bookmark',
      addQuestion: 'Bookmark question',
      removeQuestion: 'Remove question bookmark',
      shapesHeading: 'Bookmarked Shapes',
      questionsHeading: 'Bookmarked Class 10 Questions',
      emptyTitle: 'No bookmarks saved yet',
      emptyHint:
        'Click the Bookmark star on any 3D shape or Class 10 practice question to save it here.',
      openButton: 'Open',
    },
    missionsUi: {
      headerTitle: 'Interactive Mensuration Missions',
      headerSubtitle:
        'Apply 3D nets, wall painting area, tank capacity, and packaging optimisation to real problems. Earn up to 3 stars per mission!',
      progressBadge: 'Missions Completed',
      starsEarnedLabel: 'Stars Earned',
      completedTag: 'Completed',
      inProgressTag: 'Not Completed',
      attemptsLabel: 'Attempts',
      selectChallenge: 'Challenge Round',
      baseFaceTag: 'Anchored Base Face',
      chooseTopFace: 'Which numbered square becomes the TOP face after folding?',
      faceOptionPrefix: 'Face',
      foldTestLabel: 'Interactive 3D Fold Preview',
      roomDimensionsTag: 'Classroom: l = 8 m, b = 6 m, h = 4 m (floor & ceiling excluded)',
      enterWallsArea: 'Enter 4-wall painting area (m²)',
      radiusLabel: 'Tank Radius r (m)',
      heightLabel: 'Tank Height h (m)',
      lengthLabel: 'Length l (cm)',
      breadthLabel: 'Breadth b (cm)',
      targetLabel: 'Target',
      computedLabel: 'Your Current Value',
      litresUnit: 'Litres',
      selectReasonLabel: 'Why does this shape minimise cardboard (TSA)?',
      checkAnswer: 'Check Solution',
      retryButton: 'Try Again',
      resetButton: 'Reset Mission',
      resetAllButton: 'Reset All Missions',
      listenButton: 'Read Aloud',
      stopAudioButton: 'Stop Voice',
      audioUnsupported: 'Voice read-aloud is unavailable in this browser.',
      hintLockedNote: 'Hints unlock automatically after 2 incorrect attempts.',
      hintUnlockedTitle: 'Guided Hint Unlocked',
      hintFormulaPrefix: 'Hint',
      mistakeFloorCeiling:
        'Close! You included the floor and ceiling (96 m²). Subtract top & bottom and use LSA = 2h(l + b).',
      mistakeVolumeMismatch:
        'Adjust your dimensions so that Volume l × b × h equals 64 cm³.',
      mistakeNotMinimum:
        'Volume is 64 cm³, but Surface Area can be made smaller! Try balancing l, b, and h equally.',
      mistakeSelectReason:
        'Your dimensions give minimum surface area — now choose the correct mathematical explanation below!',
      mistakeTooSmall:
        'Current cylinder volume is below 1540 L. Increase radius r or height h.',
      mistakeTooLarge:
        'Current cylinder volume exceeds 1540 L. Reduce radius r or height h.',
      successTitle: 'Mission Accomplished!',
      closeModal: 'Continue Learning',
    },
    hub: {
      headerTitle: 'Learning Progress, Bookmarks & Guide',
      headerSubtitle:
        'Track mastery across all 15 solids, 4 missions, Class 10 board questions, saved bookmarks, keyboard help, and architecture notes.',
      tabs: {
        progress: 'Progress & Badges',
        bookmarks: 'Bookmarks',
        help: 'Help & Keyboard',
        about: 'About & Architecture',
      },
      stats: {
        overallMastery: 'Overall Mastery',
        shapesExplored: 'Shapes Explored',
        missionsDone: 'Missions Completed',
        starsEarned: 'Mission Stars',
        practiceReviewed: 'Class 10 Reviewed',
        netCheckerBest: 'Net Checker Best',
      },
      badgesTitle: 'Achievement Badges',
      unlockedTag: 'Unlocked',
      lockedTag: 'In Progress',
      badges: {
        first_fold: {
          title: 'First Fold Explorer',
          desc: 'Inspect your first interactive 3D geometric solid.',
        },
        class8_complete: {
          title: 'Class 8 Foundation',
          desc: 'Explore Cube, Cuboid, and Cylinder in Shape Explorer.',
        },
        master_15: {
          title: 'Master of 15 Solids',
          desc: 'Explore all 15 3D shapes from Class 8 through Platonic solids.',
        },
        mission_challenger: {
          title: 'Applied Challenger',
          desc: 'Complete at least 2 interactive STEM Missions.',
        },
        star_achiever: {
          title: 'All-Mission Champion',
          desc: 'Complete all 4 real-world mensuration missions.',
        },
        board_scholar: {
          title: 'Class 10 Board Scholar',
          desc: 'Review all 10 solved NCERT Class 10 board-exam problems.',
        },
      },
      quickResumeTitle: 'Quick Jump',
      resumeExplorer: 'Open 3D Explorer',
      resumeMissions: 'Open Missions',
      resumePractice: 'Continue Class 10 Practice',
      helpTitle: 'How to Use NetFold 3D',
      helpSteps: {
        s1: {
          title: '1. Shape Explorer (15 Solids)',
          desc: 'Pick Class 8 or Beyond Class 8 shapes, drag the Fold slider from 0% flat net to 100% closed 3D solid, and click faces to inspect area formulas.',
        },
        s2: {
          title: '2. Interactive Missions (Voice + Hints)',
          desc: 'Solve 4 real-world challenges using live 3D visualisations. Hints automatically unlock after 2 wrong attempts, with browser speech read-aloud.',
        },
        s3: {
          title: '3. Net Lab & Class 10 Solved Practice',
          desc: 'Explore all 11 cube nets, play Net Checker, study scaling laws (k²/k³), and read full 10-step Class 10 board solutions with zoom-safe scrolling.',
        },
        s4: {
          title: '4. Offline Persistence & Bookmarks',
          desc: 'Progress, stars, theme, language, and bookmarks save automatically in localStorage in all 5 languages.',
        },
      },
      shortcutsTitle: 'Keyboard Accessibility & Shortcuts',
      shortcuts: {
        search: 'Press Ctrl + K or / anywhere to open Global Search',
        closeModal: 'Press Esc to close Search or Mission dialogs',
        navigateTabs: 'Use Tab / Shift + Tab with visible focus rings across controls',
        adjustSliders: 'Use Left / Right Arrow keys to fine-tune fold and dimension sliders',
      },
      aboutTitle: 'About NetFold 3D & Curriculum Design',
      aboutPurpose:
        'NetFold 3D is an offline-capable visual mathematics laboratory designed for NCERT Class 8–10 Mensuration learners. Instead of memorising formulas blindly, students watch flat 2D nets fold smoothly into 3D solids and connect each surface directly to algebraic area and volume.',
      aboutObjectivesTitle: 'Core Learning Objectives',
      aboutObjectives: {
        o1: 'Visualise how 2D nets hinge in 3D space across prisms, pyramids, cones, frustums, and Platonic solids.',
        o2: 'Distinguish Lateral Surface Area (LSA/CSA) from Total Surface Area (TSA) face by face.',
        o3: 'Understand why curved solids (Sphere & Hemisphere) do not have exact flat nets.',
        o4: 'Solve board-exam problems and real-world engineering optimisations step by step in 5 Indian languages.',
      },
      aboutArchTitle: 'Client-Side Architecture (Archify Summary)',
      aboutArchBody:
        'Built with React 19, Three.js / React Three Fiber, Tailwind CSS, and Vite PWA. Pure modules separate Application State (App.jsx), 3D Net Geometry (netGeometry.js & Canvas3D.jsx), Deterministic Math Engine (mathEngine.js), Multilingual Dictionary (translations.js), Missions, Class 10 Practice, Net Lab, and local Storage.',
      aboutHonestyNote:
        'Honest AI Notice: The built-in AI Tutor runs a deterministic local geometric solver in your browser with zero fabricated external AI calls unless an optional VITE_TUTOR_ENDPOINT proxy is explicitly configured.',
    },
  },

  kn: {
    appTitle: 'NetFold 3D',
    appSubtitle: 'ಸಂವಾದಾತ್ಮಕ 3D ಕ್ಷೇತ್ರಗಣಿತ ಪ್ರಯೋಗಾಲಯ',
    languageSelectLabel: 'ಭಾಷೆ',
    languageSelectAria: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    shapeSectionTitle: '3D ಆಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (15 ಆಕಾರಗಳು)',
    class8CategoryLabel: '8ನೇ ತರಗತಿ NCERT',
    beyondClass8CategoryLabel: '8ನೇ ತರಗತಿಗಿಂತ ಮುಂದಿನದು',
    beyondClass8Badge: '8ನೇ ತರಗತಿಗಿಂತ ಮುಂದಿನದು (9/10ನೇ ತರಗತಿ ವಿಷಯ)',
    beyondSubgroups: {
      prisms: 'ಪ್ರಿಸಮ್‌ಗಳು (Prisms)',
      pyramids: 'ಪಿರಮಿಡ್‌ಗಳು (Pyramids)',
      curvedAndPlatonic: 'ವಕ್ರ ಮತ್ತು ಘನ ಆಕೃತಿಗಳು',
    },
    shapes: {
      cube: 'ಘನ',
      cuboid: 'ಆಯತಘನ',
      cylinder: 'ಸಿಲಿಂಡರ್',
      cone: 'ಶಂಕು',
      square_pyramid: 'ಚೌಕ ಪಿರಮಿಡ್',
      sphere: 'ಗೋಳ',
      triangular_prism: 'ತ್ರಿಕೋನ ಪ್ರಿಸಮ್',
      triangular_pyramid: 'ತ್ರಿಕೋನ ಪಿರಮಿಡ್ (ಟೆಟ್ರಾಹೆಡ್ರನ್)',
      pentagonal_prism: 'ಪಂಚಭುಜ ಪ್ರಿಸಮ್',
      hexagonal_prism: 'ಷಡ್ಭುಜ ಪ್ರಿಸಮ್',
      pentagonal_pyramid: 'ಪಂಚಭುಜ ಪಿರಮಿಡ್',
      hexagonal_pyramid: 'ಷಡ್ಭುಜ ಪಿರಮಿಡ್',
      hemisphere: 'ಅರ್ಧಗೋಳ',
      frustum: 'ಶಂಕುವಿನ ಭಿನ್ನಕ (Frustum)',
      octahedron: 'ಅಷ್ಟಫಲಕ (Octahedron)',
    },
    foldSectionTitle: 'ಜಾಲ ಮಡಚುವಿಕೆ',
    foldPresets: {
      flat: '0% ಚಪ್ಪಟೆ',
      half: '50% ಅರ್ಧ',
      closed: '100% ಘನ',
    },
    foldStage: {
      flat: 'ಚಪ್ಪಟೆ 2D ಜಾಲ',
      folding: 'ಮಡಚುವಿಕೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ',
      closed: 'ಮುಚ್ಚಿದ 3D ಆಕೃತಿ',
      noNet: '3D ಆಕೃತಿ (ನಿಖರ ಚಪ್ಪಟೆ ಜಾಲವಿಲ್ಲ)',
    },
    sphereNoNetMessage:
      'ಗೋಳಕ್ಕೆ ಚಪ್ಪಟೆ ಜಾಲವಿಲ್ಲ, ಆದ್ದರಿಂದ ಅದನ್ನು ಮಡಚಲು ಸಾಧ್ಯವಿಲ್ಲ.',
    hemisphereNoNetMessage:
      'ಅರ್ಧಗೋಳಕ್ಕೆ ನಿಖರ ಚಪ್ಪಟೆ ಜಾಲವಿಲ್ಲ, ಆದ್ದರಿಂದ ಅದರ ವಕ್ರ ಗುಮ್ಮಟವನ್ನು ಚಪ್ಪಟೆಯಾಗಿ ಮಡಚಲು ಸಾಧ್ಯವಿಲ್ಲ.',
    sphereLsaNotApplicable: 'ಗೋಳಕ್ಕೆ ಅನ್ವಯಿಸುವುದಿಲ್ಲ',
    octahedronLsaNotApplicable:
      'ಅನ್ವಯಿಸುವುದಿಲ್ಲ (ಎಲ್ಲಾ 8 ಸಮಬಾಹು ತ್ರಿಕೋನ ಮುಖಗಳು ಸಮಾನವಾಗಿವೆ)',
    dimensionsSectionTitle: 'ಅಳತೆಗಳು',
    dimensionLabels: {
      a: 'ಅಂಚು (a)',
      baseSideA: 'ಪಾದದ ಬದಿ (a)',
      l: 'ಉದ್ದ (l)',
      b: 'ಅಗಲ (b)',
      h: 'ಎತ್ತರ (h)',
      r: 'ತ್ರಿಜ್ಯ (r)',
      r1: 'ಕೆಳ ತ್ರಿಜ್ಯ (r₁)',
      r2: 'ಮೇಲಿನ ತ್ರಿಜ್ಯ (r₂)',
      slantL: 'ಓರೆ ಎತ್ತರ (l)',
      slantS: 'ಓರೆ ಎತ್ತರ (s)',
      diameter: 'ವ್ಯಾಸ (2r)',
    },
    unitsSectionTitle: 'ಏಕಮಾನ',
    unitNames: {
      cm: 'ಸೆಂಟಿಮೀಟರ್ (ಸೆಂ.ಮೀ)',
      m: 'ಮೀಟರ್ (ಮೀ)',
    },
    unitShort: {
      cm: 'ಸೆಂ.ಮೀ',
      m: 'ಮೀ',
    },
    unitSymbols: {
      cm: { length: 'ಸೆಂ.ಮೀ', area: 'ಸೆಂ.ಮೀ²', volume: 'ಸೆಂ.ಮೀ³' },
      m: { length: 'ಮೀ', area: 'ಮೀ²', volume: 'ಮೀ³' },
    },
    unitHintTitle: 'ಮೀಟರ್‌ಗಳಲ್ಲಿ ದೊಡ್ಡ ಅಳತೆಗಳು',
    unitHintBody:
      '5 ಮೀ ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಅಳತೆಗಳು ಕೋಣೆ ಅಥವಾ ಟ್ಯಾಂಕ್‌ನಷ್ಟು ದೊಡ್ಡದಾಗಿರುತ್ತವೆ. ನೀವು ಸೆಂಟಿಮೀಟರ್ (cm) ಉದ್ದೇಶಿಸಿದ್ದೀರಾ?',
    unitHintSwitch: 'ಸೆಂ.ಮೀ ಗೆ ಬದಲಾಯಿಸಿ',
    highlightSectionTitle: 'ದೃಶ್ಯ ಹೈಲೈಟ್',
    highlightModes: {
      all: 'ಸಾಮಾನ್ಯ',
      lsa: 'LSA',
      tsa: 'TSA',
      volume: 'ಘನಫಲ',
    },
    highlightDescriptions: {
      all: 'ಎಲ್ಲಾ ಮುಖಗಳನ್ನು ಪ್ರತ್ಯೇಕ ಶೈಕ್ಷಣಿಕ ಬಣ್ಣಗಳಲ್ಲಿ ತೋರಿಸಲಾಗಿದೆ.',
      lsa: 'ಪಾರ್ಶ್ವ ಅಥವಾ ವಕ್ರ ಮುಖಗಳನ್ನು ಮಾತ್ರ ಹೈಲೈಟ್ ಮಾಡಲಾಗಿದೆ; ಪಾದ/ಮೇಲ್ಭಾಗ ಮಂಕಾಗಿವೆ.',
      tsa: 'ಎಲ್ಲಾ ಹೊರ ಮೇಲ್ಮೈಗಳನ್ನು ಹೈಲೈಟ್ ಮಾಡಲಾಗಿದೆ ಏಕೆಂದರೆ TSA ಎಲ್ಲಾ ಮುಖಗಳ ಮೊತ್ತವಾಗಿದೆ.',
      volume: 'ಆಕೃತಿಯ ಒಳಗಿನ ಪಾರದರ್ಶಕ ಭರ್ತಿ 3D ಘನಫಲವನ್ನು ತೋರಿಸುತ್ತದೆ.',
    },
    canvasHint:
      'ತಿರುಗಿಸಲು ಎಳೆಯಿರಿ · ಜೂಮ್ ಮಾಡಲು ಸ್ಕ್ರಾಲ್/ಪಿಂಚ್ ಮಾಡಿ · ಮುಖವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ',
    noNetCanvasHint:
      'ತಿರುಗಿಸಲು ಎಳೆಯಿರಿ · ಜೂಮ್ ಮಾಡಲು ಸ್ಕ್ರಾಲ್/ಪಿಂಚ್ ಮಾಡಿ · ವಕ್ರ 3D ಆಕೃತಿ',
    resetCamera: 'ನೋಟ ಮರುಹೊಂದಿಸಿ',
    volumeFoldHint: 'ಪೂರ್ಣ ಘನಫಲವನ್ನು ನೋಡಲು 100% ವರೆಗೆ ಮಡಚಿ',
    tapFaceHint: 'ಪರಿಶೀಲಿಸಲು ಜಾಲದ ಅಥವಾ ಪಟ್ಟಿಯ ಯಾವುದೇ ಮುಖವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ',
    clearSelection: 'ತೆರವುಗೊಳಿಸಿ',
    selectedFacePrefix: 'ಆಯ್ಕೆ',
    faceBadgePrefix: 'ಮುಖ',
    sideWallPrefix: 'ಗೋಡೆ',
    faceNames: {
      bottom: 'ಪಾದ',
      front: 'ಮುಂಭಾಗ',
      back: 'ಹಿಂಭಾಗ',
      top: 'ಮೇಲ್ಭಾಗ',
      left: 'ಎಡಭಾಗ',
      right: 'ಬಲಭಾಗ',
      lateral: 'ವಕ್ರ ಮೇಲ್ಮೈ',
      surface: 'ವಕ್ರ ಮೇಲ್ಮೈ',
    },
    faceRoles: {
      base: 'ಪಾದ',
      top: 'ಮೇಲ್ಭಾಗ',
      lateral: 'ಪಾರ್ಶ್ವ ಮುಖ',
      curved: 'ವಕ್ರ ಮೇಲ್ಮೈ',
      face: 'ತ್ರಿಕೋನ ಮುಖ',
    },
    faceBreakdownTitle: 'ಮುಖಗಳ ವಿಸ್ತೀರ್ಣ (ಜಾಲ ವಿಭಜನೆ)',
    sumOfFacesLabel: 'ಎಲ್ಲಾ ಮುಖಗಳ ಮೊತ್ತ = TSA',
    sphereSurfaceBreakdownNote:
      'ಎಲ್ಲಾ ದಿಕ್ಕುಗಳಲ್ಲಿ ನಿರಂತರವಾದ ಒಂದೇ ವಕ್ರ ಮೇಲ್ಮೈ',
    formulaCardTitle: 'ಹಂತ-ಹಂತದ ಸೂತ್ರಗಳು ಮತ್ತು ಬೆಲೆ ಆದೇಶ',
    slantHeightStepLabel: 'ಓರೆ ಎತ್ತರ',
    volumeLabel: 'ಘನಫಲ (Volume)',
    lsaLabel: 'ಪಾರ್ಶ್ವ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (LSA)',
    csaLabel: 'ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (CSA)',
    tsaLabel: 'ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA)',
    surfaceAreaLabel: 'ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA)',
    lsaExcludedTitle: 'LSA ನಲ್ಲಿ ಪಾದ/ಮೇಲ್ಭಾಗವನ್ನು ಏಕೆ ಕೈಬಿಡಲಾಗುತ್ತದೆ',
    lsaExclusionNote: {
      cube: 'LSA ಕೇವಲ 4 ಪಾರ್ಶ್ವ ಗೋಡೆಗಳನ್ನು (4a²) ಮಾತ್ರ ಎಣಿಸುತ್ತದೆ. ಮೇಲ್ಭಾಗ + ಪಾದ (2a²) ಹೊರಗಿಡಲಾಗಿದೆ.',
      cuboid:
        'LSA ಕೇವಲ 4 ಪಾರ್ಶ್ವ ಗೋಡೆಗಳನ್ನು 2h(l + b) ಎಣಿಸುತ್ತದೆ. ಮೇಲ್ಭಾಗ + ಪಾದ (2lb) ಹೊರಗಿಡಲಾಗಿದೆ.',
      cylinder:
        'CSA ಕೇವಲ ವಕ್ರ ಆಯತಾಕಾರದ ಗೋಡೆಯನ್ನು (2πrh) ಎಣಿಸುತ್ತದೆ. ಎರಡು ವೃತ್ತಾಕಾರದ ಮುಚ್ಚಳಗಳನ್ನು (2πr²) ಹೊರಗಿಡಲಾಗಿದೆ.',
      cone: 'LSA ಕೇವಲ ವಕ್ರ ಶಂಕುವಿನ ಮೇಲ್ಮೈಯನ್ನು (πrl) ಎಣಿಸುತ್ತದೆ. ವೃತ್ತಾಕಾರದ ಪಾದ (πr²) ಹೊರಗಿಡಲಾಗಿದೆ.',
      square_pyramid:
        'LSA ಕೇವಲ 4 ತ್ರಿಕೋನ ಮುಖಗಳನ್ನು (2as) ಎಣಿಸುತ್ತದೆ. ಚೌಕ ಪಾದ (a²) ಹೊರಗಿಡಲಾಗಿದೆ.',
      sphere: 'ಗೋಳಕ್ಕೆ ಅನ್ವಯಿಸುವುದಿಲ್ಲ',
      triangular_prism:
        'LSA ಕೇವಲ 3 ಆಯತಾಕಾರದ ಗೋಡೆಗಳನ್ನು (3ah) ಎಣಿಸುತ್ತದೆ. ಎರಡು ತ್ರಿಕೋನ ಮುಚ್ಚಳಗಳನ್ನು ಹೊರಗಿಡಲಾಗಿದೆ.',
      pentagonal_prism:
        'LSA ಕೇವಲ 5 ಆಯತಾಕಾರದ ಗೋಡೆಗಳನ್ನು (5ah) ಎಣಿಸುತ್ತದೆ. ಎರಡು ಪಂಚಭುಜ ಮುಚ್ಚಳಗಳನ್ನು ಹೊರಗಿಡಲಾಗಿದೆ.',
      hexagonal_prism:
        'LSA ಕೇವಲ 6 ಆಯತಾಕಾರದ ಗೋಡೆಗಳನ್ನು (6ah) ಎಣಿಸುತ್ತದೆ. ಎರಡು ಷಡ್ಭುಜ ಮುಚ್ಚಳಗಳನ್ನು ಹೊರಗಿಡಲಾಗಿದೆ.',
      triangular_pyramid:
        'LSA ಕೇವಲ 3 ತ್ರಿಕೋನ ಪಾರ್ಶ್ವ ಮುಖಗಳನ್ನು ((3/2)as) ಎಣಿಸುತ್ತದೆ. ತ್ರಿಕೋನ ಪಾದವನ್ನು ಹೊರಗಿಡಲಾಗಿದೆ.',
      pentagonal_pyramid:
        'LSA ಕೇವಲ 5 ತ್ರಿಕೋನ ಪಾರ್ಶ್ವ ಮುಖಗಳನ್ನು ((5/2)as) ಎಣಿಸುತ್ತದೆ. ಪಂಚಭುಜ ಪಾದವನ್ನು ಹೊರಗಿಡಲಾಗಿದೆ.',
      hexagonal_pyramid:
        'LSA ಕೇವಲ 6 ತ್ರಿಕೋನ ಪಾರ್ಶ್ವ ಮುಖಗಳನ್ನು (3as) ಎಣಿಸುತ್ತದೆ. ಷಡ್ಭುಜ ಪಾದವನ್ನು ಹೊರಗಿಡಲಾಗಿದೆ.',
      hemisphere:
        'CSA ಕೇವಲ ವಕ್ರ ಅರ್ಧಗೋಳದ ಗುಮ್ಮಟವನ್ನು (2πr²) ಎಣಿಸುತ್ತದೆ. ಚಪ್ಪಟೆ ವೃತ್ತಾಕಾರದ ಪಾದ (πr²) ಹೊರಗಿಡಲಾಗಿದೆ.',
      frustum:
        'LSA ಕೇವಲ ವಕ್ರ ಮೇಲ್ಮೈ π(r₁ + r₂)l ಅನ್ನು ಎಣಿಸುತ್ತದೆ. ಎರಡು ವೃತ್ತಾಕಾರದ ಮುಚ್ಚಳಗಳು (πr₁² + πr₂²) ಹೊರಗಿಡಲಾಗಿದೆ.',
      octahedron:
        'ಅನ್ವಯಿಸುವುದಿಲ್ಲ (ಎಲ್ಲಾ 8 ಸಮಬಾಹು ತ್ರಿಕೋನ ಮುಖಗಳು ಸಮಾನವಾಗಿವೆ; TSA = 2√3a² ಬಳಸಿ)',
    },
    excludedCapsLabel: 'ಹೊರಗಿಟ್ಟದ್ದು',
    learningPanelTitle: 'ಆಕೃತಿ ಕಲಿಕಾ ಮಾರ್ಗದರ್ಶಿ',
    definitionLabel: 'ವ್ಯಾಖ್ಯಾನ',
    geometryStatsLabel: 'ಗುಣಲಕ್ಷಣಗಳು (ಮುಖಗಳು, ಅಂಚುಗಳು, ಶೃಂಗಗಳು)',
    facesStatLabel: 'ಮುಖಗಳು / ಮೇಲ್ಮೈ',
    edgesStatLabel: 'ಅಂಚುಗಳು',
    verticesStatLabel: 'ಶೃಂಗಗಳು',
    importantDimensionsLabel: 'ಮುಖ್ಯ ಅಳತೆಗಳು',
    workedExampleLabel: 'ಬಿಡಿಸಿದ ಉದಾಹರಣೆ',
    realWorldExampleLabel: 'ನಿಜ ಜೀವನದ ಅನ್ವಯ',
    didYouKnowLabel: 'ನಿಮಗೆ ಗೊತ್ತೇ?',
    guideLabels: {
      radius: 'ತ್ರಿಜ್ಯ (r)',
      height: 'ಎತ್ತರ (h)',
      slantL: 'ಓರೆ (l)',
      slantS: 'ಓರೆ (s)',
    },
    learningByShape: {
      cube: {
        definition:
          'ಘನವು ಲಂಬ ಕೋನಗಳಲ್ಲಿ ಸೇರುವ ಆರು ಸಮಾನ ಚೌಕಾಕಾರದ ಮುಖಗಳಿಂದ ಸುತ್ತುವರಿದ 3D ಘನಾಕೃತಿಯಾಗಿದೆ.',
        faces: '6 ಚೌಕ ಮುಖಗಳು',
        edges: '12 ಸಮಾನ ಅಂಚುಗಳು',
        vertices: '8 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಉದ್ದ = ಅಗಲ = ಎತ್ತರ = a ಆಗಿರುವುದರಿಂದ ಕೇವಲ ಒಂದು ಅಂಚಿನ ಉದ್ದ (a) ಇಡೀ ಘನವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.',
        workedExample:
          'a = 5 ಸೆಂ.ಮೀ: LSA = 100 ಸೆಂ.ಮೀ², TSA = 150 ಸೆಂ.ಮೀ², ಘನಫಲ = 125 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ರೂಬಿಕ್ಸ್ ಕ್ಯೂಬ್, ಆಟದ ದಾಳ, ಗಿಫ್ಟ್ ಬಾಕ್ಸ್ ಮತ್ತು ಮಂಜುಗಡ್ಡೆ.',
        didYouKnow:
          '6 ಚೌಕಗಳಿಂದ ಮಾಡಿದ 11 ವಿಭಿನ್ನ ಚಪ್ಪಟೆ ಜಾಲಗಳಿದ್ದು, ಅವೆಲ್ಲವೂ ಒಂದೇ ಘನವಾಗಿ ಮಡಚಿಕೊಳ್ಳುತ್ತವೆ.',
      },
      cuboid: {
        definition:
          'ಆಯತಘನವು ಎದುರುಬದುರು ಮುಖಗಳು ಸಮಾನವಾಗಿರುವ ಆರು ಆಯತಾಕಾರದ ಮುಖಗಳಿಂದ ಕೂಡಿದ 3D ಪೆಟ್ಟಿಗೆಯಾಗಿದೆ.',
        faces: '6 ಆಯತಾಕಾರದ ಮುಖಗಳು',
        edges: '12 ಅಂಚುಗಳು (l, b, h ತಲಾ 4)',
        vertices: '8 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಮೂರು ಲಂಬ ಅಳತೆಗಳಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ: ಉದ್ದ (l), ಅಗಲ (b), ಮತ್ತು ಎತ್ತರ (h).',
        workedExample:
          'l = 10, b = 6, h = 4 ಸೆಂ.ಮೀ: LSA = 128 ಸೆಂ.ಮೀ², TSA = 248 ಸೆಂ.ಮೀ², ಘನಫಲ = 240 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಪಠ್ಯಪುಸ್ತಕ, ಇಟ್ಟಿಗೆ, ಶೂ ಬಾಕ್ಸ್ ಮತ್ತು ಜ್ಯಾಮಿತಿ ಪೆಟ್ಟಿಗೆ.',
        didYouKnow:
          'l = b = h ಆದಾಗ ಆಯತಘನವು ಘನವಾಗುತ್ತದೆ; ಇದರ 4 ಪಾರ್ಶ್ವ ಗೋಡೆಗಳನ್ನು ಬಿಡಿಸಿದಾಗ 2(l + b) ಉದ್ದದ ಆಯತವಾಗುತ್ತದೆ.',
      },
      cylinder: {
        definition:
          'ನೇರ ವೃತ್ತಾಕಾರದ ಸಿಲಿಂಡರ್ ಒಂದು ನಯವಾದ ವಕ್ರ ಮೇಲ್ಮೈಯಿಂದ ಸಂಪರ್ಕಗೊಂಡಿರುವ ಎರಡು ಸಮಾನ ವೃತ್ತಾಕಾರದ ಪಾದಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '3 ಮೇಲ್ಮೈಗಳು (2 ಚಪ್ಪಟೆ ವೃತ್ತಗಳು + 1 ವಕ್ರ ಗೋಡೆ)',
        edges: '2 ವೃತ್ತಾಕಾರದ ಅಂಚುಗಳು',
        vertices: '0 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಪಾದದ ತ್ರಿಜ್ಯ (r) ಮತ್ತು ಎತ್ತರ (h) ನಿಂದ ನಿರ್ಧರಿಸಲ್ಪಡುತ್ತದೆ. ವಕ್ರ ಗೋಡೆಯನ್ನು ತೆರೆದಾಗ 2πr ಅಗಲದ ಆಯತವಾಗುತ್ತದೆ.',
        workedExample:
          'r = 3, h = 5 ಸೆಂ.ಮೀ: CSA = 30π ≈ 94.25 ಸೆಂ.ಮೀ², TSA = 48π ≈ 150.80 ಸೆಂ.ಮೀ², V = 45π ≈ 141.37 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ನೀರಿನ ಟ್ಯಾಂಕ್, ಸ್ಟೀಲ್ ಲೋಟ, ಕೊಳವೆ ಮತ್ತು ಟಿನ್ ಡಬ್ಬಿ.',
        didYouKnow:
          'ಸಿಲಿಂಡರ್‌ನ ತೆರೆದ ಆಯತದ ಅಗಲವು ಅದರ ವೃತ್ತಾಕಾರದ ಪಾದದ ಪರಿಧಿಗೆ (2πr) ಸಮನಾಗಿರುತ್ತದೆ, ಆದ್ದರಿಂದ CSA = 2πrh.',
      },
      cone: {
        definition:
          'ನೇರ ವೃತ್ತಾಕಾರದ ಶಂಕುವು ಚಪ್ಪಟೆ ವೃತ್ತಾಕಾರದ ಪಾದದಿಂದ ನೇರವಾಗಿ ಮೇಲಿರುವ ಒಂದೇ ತುದಿ ಶೃಂಗಕ್ಕೆ ಕ್ರಮೇಣ ಚೂಪಾಗುತ್ತದೆ.',
        faces: '2 ಮೇಲ್ಮೈಗಳು (1 ವೃತ್ತಾಕಾರದ ಪಾದ + 1 ವಕ್ರ ಮೇಲ್ಮೈ)',
        edges: '1 ವೃತ್ತಾಕಾರದ ಅಂಚು',
        vertices: '1 ತುದಿ ಶೃಂಗ',
        dimensionsSummary:
          'ತ್ರಿಜ್ಯ (r), ಲಂಬ ಎತ್ತರ (h), ಮತ್ತು ಓರೆ ಬದಿಯ ಉದ್ದ l = √(r² + h²) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ.',
        workedExample:
          'r = 3, h = 4 ಸೆಂ.ಮೀ: l = 5 ಸೆಂ.ಮೀ; LSA = 15π ≈ 47.12 ಸೆಂ.ಮೀ², TSA = 24π ≈ 75.40 ಸೆಂ.ಮೀ², V = 12π ≈ 37.70 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಐಸ್‌ಕ್ರೀಮ್ ಕೋನ್, ಟ್ರಾಫಿಕ್ ಕೋನ್, ಫನಲ್ ಮತ್ತು ಹುಟ್ಟುಹಬ್ಬದ ಟೋಪಿ.',
        didYouKnow:
          'ಒಂದೇ ತ್ರಿಜ್ಯ ಮತ್ತು ಎತ್ತರವನ್ನು ಹೊಂದಿರುವ ಸಿಲಿಂಡರ್‌ನ ಘನಫಲದ ಸರಿಯಾಗಿ ಮೂರನೇ ಒಂದು ಭಾಗದಷ್ಟು (1/3) ಘನಫಲವನ್ನು ಶಂಕು ಹೊಂದಿರುತ್ತದೆ!',
      },
      square_pyramid: {
        definition:
          'ಚೌಕ ಪಿರಮಿಡ್ ಒಂದು ಚೌಕಾಕಾರದ ಪಾದವನ್ನು ಮತ್ತು ಒಂದೇ ಶೃಂಗದಲ್ಲಿ ಸೇರುವ ನಾಲ್ಕು ಸಮಾನ ಸಮದ್ವಿಬಾಹು ತ್ರಿಕೋನ ಮುಖಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '5 ಮುಖಗಳು (1 ಚೌಕ ಪಾದ + 4 ತ್ರಿಕೋನಗಳು)',
        edges: '8 ಅಂಚುಗಳು (4 ಪಾದ + 4 ಓರೆ)',
        vertices: '5 ಶೃಂಗಗಳು (4 ಪಾದ + 1 ತುದಿ ಶೃಂಗ)',
        dimensionsSummary:
          'ಪಾದದ ಬದಿ (a), ಲಂಬ ಎತ್ತರ (h), ಮತ್ತು ತ್ರಿಕೋನ ಮುಖದ ಓರೆ ಎತ್ತರ s = √(h² + (a/2)²) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ.',
        workedExample:
          'a = 6, h = 4 ಸೆಂ.ಮೀ: s = 5 ಸೆಂ.ಮೀ; LSA = 60 ಸೆಂ.ಮೀ², TSA = 96 ಸೆಂ.ಮೀ², ಘನಫಲ = 48 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಈಜಿಪ್ಟ್‌ನ ಗಿಜಾ ಪಿರಮಿಡ್ ಮತ್ತು ನಾಲ್ಕು ಬದಿಯ ಟೆಂಟ್ ಮೇಲ್ಛಾವಣಿ.',
        didYouKnow:
          'ಸಿಲಿಂಡರ್ ಒಳಗಿನ ಶಂಕುವಿನಂತೆ, ಒಂದೇ ಪಾದ ಮತ್ತು ಎತ್ತರದ ಆಯತಘನದ ಘನಫಲದ ಸರಿಯಾಗಿ 1/3 ರಷ್ಟು ಘನಫಲವನ್ನು ಚೌಕ ಪಿರಮಿಡ್ ಹೊಂದಿರುತ್ತದೆ.',
      },
      sphere: {
        definition:
          'ಗೋಳವು ಪರಿಪೂರ್ಣವಾಗಿ ದುಂಡಗಿರುವ 3D ಮೇಲ್ಮೈಯಾಗಿದ್ದು, ಅದರ ಮೇಲಿನ ಪ್ರತಿಯೊಂದು ಬಿಂದುವು ಕೇಂದ್ರದಿಂದ ಒಂದೇ ದೂರದಲ್ಲಿರುತ್ತದೆ (ತ್ರಿಜ್ಯ r).',
        faces: '1 ನಿರಂತರ ವಕ್ರ ಮೇಲ್ಮೈ',
        edges: '0 ಅಂಚುಗಳು',
        vertices: '0 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಕೇಂದ್ರದಿಂದ ಮೇಲ್ಮೈಗಿರುವ ಒಂದೇ ಅಳತೆ ತ್ರಿಜ್ಯ (r) ನಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ (ವ್ಯಾಸ = 2r).',
        workedExample:
          'r = 7 ಸೆಂ.ಮೀ: ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ = 196π ≈ 615.75 ಸೆಂ.ಮೀ², ಘನಫಲ = (4/3)π(7³) ≈ 1436.76 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಕ್ರಿಕೆಟ್ ಚೆಂಡು, ಫುಟ್‌ಬಾಲ್, ಗೋಲಿ ಮತ್ತು ಭೂಗೋಳ (ಗ್ಲೋಬ್).',
        didYouKnow:
          'ಗೋಳವನ್ನು ಎಳೆಯದೆ ಅಥವಾ ಹರಿಯದೆ ಚಪ್ಪಟೆ ಜಾಲವಾಗಿ ಹರಡಲು ಸಾಧ್ಯವಿಲ್ಲ—ಅದಕ್ಕಾಗಿಯೇ ವಿಶ್ವ ಭೂಪಟಗಳಲ್ಲಿ ಭೂಖಂಡಗಳು ಸ್ವಲ್ಪ ವಿಕೃತವಾಗಿ ಕಾಣುತ್ತವೆ!',
      },
      triangular_prism: {
        definition:
          'ತ್ರಿಕೋನ ಪ್ರಿಸಮ್ ಮೂರು ಆಯತಾಕಾರದ ಪಾರ್ಶ್ವ ಮುಖಗಳಿಂದ ಸಂಪರ್ಕಗೊಂಡಿರುವ ಎರಡು ಸಮಾನಾಂತರ ತ್ರಿಕೋನ ಪಾದಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '5 ಮುಖಗಳು (2 ತ್ರಿಕೋನಗಳು + 3 ಆಯತಗಳು)',
        edges: '9 ಅಂಚುಗಳು',
        vertices: '6 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಸಮಬಾಹು ತ್ರಿಕೋನ ಬದಿ (a) ಮತ್ತು ಪ್ರಿಸಮ್ ಉದ್ದ/ಎತ್ತರ (h) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ. ಪಾದ ವಿಸ್ತೀರ್ಣ = (√3/4)a².',
        workedExample:
          'a = 4, h = 5 ಸೆಂ.ಮೀ: ಪಾದ ≈ 6.93 ಸೆಂ.ಮೀ², LSA = 60 ಸೆಂ.ಮೀ², TSA ≈ 73.86 ಸೆಂ.ಮೀ², V ≈ 34.64 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಗಾಜಿನ ಪ್ರಿಸಮ್, ಟೋಬ್ಲೆರೋನ್ ಚಾಕೊಲೇಟ್ ಪ್ಯಾಕ್ ಮತ್ತು ಎ-ಫ್ರೇಮ್ ಟೆಂಟ್.',
        didYouKnow:
          'ಆಯತಘನವನ್ನು ಕರ್ಣೀಯವಾಗಿ ಕತ್ತರಿಸಿದರೆ ಅದು ಎರಡು ಸಮಾನ ತ್ರಿಕೋನ ಪ್ರಿಸಮ್‌ಗಳಾಗಿ ವಿಭಾಗವಾಗುತ್ತದೆ!',
      },
      triangular_pyramid: {
        definition:
          'ತ್ರಿಕೋನ ಪಿರಮಿಡ್ (ಟೆಟ್ರಾಹೆಡ್ರನ್) ಒಂದು ತ್ರಿಕೋನ ಪಾದವನ್ನು ಮತ್ತು ಒಂದೇ ಶೃಂಗದಲ್ಲಿ ಸೇರುವ ಮೂರು ತ್ರಿಕೋನ ಮುಖಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '4 ತ್ರಿಕೋನ ಮುಖಗಳು',
        edges: '6 ಅಂಚುಗಳು',
        vertices: '4 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಪಾದದ ಬದಿ (a), ಎತ್ತರ (h), ಮತ್ತು ಓರೆ ಎತ್ತರ s ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ. h = a√(2/3) ಆದಾಗ ಅದು ನಿಯಮಿತ ಟೆಟ್ರಾಹೆಡ್ರನ್ ಆಗುತ್ತದೆ.',
        workedExample:
          'a = 6, h = 5 ಸೆಂ.ಮೀ: ಪಾದ ≈ 15.59 ಸೆಂ.ಮೀ², s ≈ 5.29 ಸೆಂ.ಮೀ, LSA ≈ 47.62 ಸೆಂ.ಮೀ², TSA ≈ 63.21 ಸೆಂ.ಮೀ², V ≈ 25.98 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಟೆಟ್ರಾ ಪ್ಯಾಕ್ ಹಾಲಿನ ಪ್ಯಾಕೆಟ್, 4-ಬದಿ ದಾಳ ಮತ್ತು ಮೀಥೇನ್ (CH₄) ಅಣು ಮಾದರಿ.',
        didYouKnow:
          '4 ಕ್ಕಿಂತ ಕಡಿಮೆ ಸಮತಲ ಮುಖಗಳಿಂದ 3D ಆಕೃತಿಯನ್ನು ಮುಚ್ಚಲು ಸಾಧ್ಯವಿಲ್ಲ—ಟೆಟ್ರಾಹೆಡ್ರನ್ ಅತ್ಯಂತ ಸರಳ ಬಹುಫಲಕವಾಗಿದೆ!',
      },
      pentagonal_prism: {
        definition:
          'ಪಂಚಭುಜ ಪ್ರಿಸಮ್ ಐದು ಆಯತಾಕಾರದ ಪಾರ್ಶ್ವ ಮುಖಗಳಿಂದ ಸಂಪರ್ಕಗೊಂಡಿರುವ ಎರಡು ಸಮಾನಾಂತರ ನಿಯಮಿತ ಪಂಚಭುಜ ಪಾದಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '7 ಮುಖಗಳು (2 ಪಂಚಭುಜಗಳು + 5 ಆಯತಗಳು)',
        edges: '15 ಅಂಚುಗಳು',
        vertices: '10 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಪಂಚಭುಜ ಬದಿ (a) ಮತ್ತು ಎತ್ತರ (h) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ. ಪಾದ = (5a²) / (4 tan 36°).',
        workedExample:
          'a = 4, h = 6 ಸೆಂ.ಮೀ: ಪಾದ ≈ 27.53 ಸೆಂ.ಮೀ², LSA = 120 ಸೆಂ.ಮೀ², TSA ≈ 175.06 ಸೆಂ.ಮೀ², V ≈ 165.17 ಸೆಂ.ಮೀ³.',
        realWorldExample: '5-ಬದಿಯ ಕಟ್ಟಡಗಳು, ವಿಶೇಷ ನಟ್/ಬೋಲ್ಟ್‌ಗಳು ಮತ್ತು ಪೆನ್ಸಿಲ್ ಸ್ಟ್ಯಾಂಡ್.',
        didYouKnow:
          'ಅಮೆರಿಕದ ಪೆಂಟಗನ್ ಕಟ್ಟಡವು ಪಂಚಭುಜ ಪ್ರಿಸಮ್ ಆಕಾರದಲ್ಲಿದೆ!',
      },
      hexagonal_prism: {
        definition:
          'ಷಡ್ಭುಜ ಪ್ರಿಸಮ್ ಆರು ಆಯತಾಕಾರದ ಪಾರ್ಶ್ವ ಮುಖಗಳಿಂದ ಸಂಪರ್ಕಗೊಂಡಿರುವ ಎರಡು ನಿಯಮಿತ ಷಡ್ಭುಜ ಪಾದಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '8 ಮುಖಗಳು (2 ಷಡ್ಭುಜಗಳು + 6 ಆಯತಗಳು)',
        edges: '18 ಅಂಚುಗಳು',
        vertices: '12 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಷಡ್ಭುಜ ಬದಿ (a) ಮತ್ತು ಎತ್ತರ (h) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ. ಪಾದ ವಿಸ್ತೀರ್ಣ = (3√3/2)a².',
        workedExample:
          'a = 4, h = 5 ಸೆಂ.ಮೀ: ಪಾದ = 24√3 ≈ 41.57 ಸೆಂ.ಮೀ², LSA = 120 ಸೆಂ.ಮೀ², TSA ≈ 203.14 ಸೆಂ.ಮೀ², V ≈ 207.85 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಷಡ್ಭುಜ ಪೆನ್ಸಿಲ್, ಜೇನುಗೂಡಿನ ಕೋಣೆಗಳು ಮತ್ತು ಬೋಲ್ಟ್/ನಟ್.',
        didYouKnow:
          'ಕಡಿಮೆ ಮೇಣ ಬಳಸಿ ಸ್ಥಳವಿಲ್ಲದೆ ಜಾಗ ತುಂಬಲು ಜೇನುನೊಣಗಳು ಷಡ್ಭುಜ ಪ್ರಿಸಮ್ ಕೋಣೆಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತವೆ!',
      },
      pentagonal_pyramid: {
        definition:
          'ಪಂಚಭುಜ ಪಿರಮಿಡ್ ಒಂದು ನಿಯಮಿತ ಪಂಚಭುಜ ಪಾದವನ್ನು ಮತ್ತು ಒಂದೇ ಶೃಂಗದಲ್ಲಿ ಸೇರುವ ಐದು ತ್ರಿಕೋನ ಮುಖಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '6 ಮುಖಗಳು (1 ಪಂಚಭುಜ + 5 ತ್ರಿಕೋನಗಳು)',
        edges: '10 ಅಂಚುಗಳು',
        vertices: '6 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಪಾದ ಬದಿ (a), ಎತ್ತರ (h), ಮತ್ತು ಓರೆ ಎತ್ತರ s = √(h² + (a / (2 tan 36°))²) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ.',
        workedExample:
          'a = 4, h = 6 ಸೆಂ.ಮೀ: ಪಾದ ≈ 27.53 ಸೆಂ.ಮೀ², s ≈ 6.60 ಸೆಂ.ಮೀ, LSA ≈ 66.04 ಸೆಂ.ಮೀ², TSA ≈ 93.56 ಸೆಂ.ಮೀ², V ≈ 55.06 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ನಕ್ಷತ್ರ ದೀಪಗಳು, ಗೋಪುರದ ಶೃಂಗ ಮತ್ತು ಮಂಟಪದ ಛಾವಣಿ.',
        didYouKnow:
          'ಇದು ಯೂಲರ್ ಸೂತ್ರ F + V - E = 2 ಅನ್ನು ಪಾಲಿಸುತ್ತದೆ: 6 + 6 - 10 = 2!',
      },
      hexagonal_pyramid: {
        definition:
          'ಷಡ್ಭುಜ ಪಿರಮಿಡ್ ಒಂದು ನಿಯಮಿತ ಷಡ್ಭುಜ ಪಾದವನ್ನು ಮತ್ತು ಒಂದೇ ಶೃಂಗದಲ್ಲಿ ಸೇರುವ ಆರು ತ್ರಿಕೋನ ಮುಖಗಳನ್ನು ಹೊಂದಿದೆ.',
        faces: '7 ಮುಖಗಳು (1 ಷಡ್ಭುಜ + 6 ತ್ರಿಕೋನಗಳು)',
        edges: '12 ಅಂಚುಗಳು',
        vertices: '7 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಪಾದ ಬದಿ (a), ಎತ್ತರ (h), ಮತ್ತು ಓರೆ ಎತ್ತರ s = √(h² + (√3a/2)²) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ.',
        workedExample:
          'a = 4, h = 3 ಸೆಂ.ಮೀ: ಪಾದ ≈ 41.57 ಸೆಂ.ಮೀ², s ≈ 4.58 ಸೆಂ.ಮೀ, LSA ≈ 54.99 ಸೆಂ.ಮೀ², TSA ≈ 96.56 ಸೆಂ.ಮೀ², V ≈ 41.57 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಆರು-ಬದಿಯ ಗಝೆಬೊ ಛಾವಣಿ, ಕ್ವಾರ್ಟ್ಜ್ ಹರಳಿನ ತುದಿ ಮತ್ತು ಛತ್ರಿ ಮೇಲ್ಭಾಗ.',
        didYouKnow:
          'ಷಡ್ಭುಜ ಪಿರಮಿಡ್‌ನಲ್ಲಿ ಮುಖಗಳು ಮತ್ತು ಶೃಂಗಗಳ ಸಂಖ್ಯೆ ಸಮಾನವಾಗಿರುತ್ತದೆ (7 + 7 - 12 = 2)!',
      },
      hemisphere: {
        definition:
          'ಅರ್ಧಗೋಳವು ಗೋಳದ ಕೇಂದ್ರದ ಮೂಲಕ ಕತ್ತರಿಸಿದ ನಿಖರ ಅರ್ಧ ಭಾಗವಾಗಿದ್ದು, ಒಂದು ವಕ್ರ ಗುಮ್ಮಟ ಮತ್ತು ಒಂದು ಚಪ್ಪಟೆ ವೃತ್ತ ಪಾದವನ್ನು ಹೊಂದಿದೆ.',
        faces: '2 ಮೇಲ್ಮೈಗಳು (1 ವೃತ್ತ ಪಾದ + 1 ವಕ್ರ ಗುಮ್ಮಟ)',
        edges: '1 ವೃತ್ತಾಕಾರದ ಅಂಚು',
        vertices: '0 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಕೇವಲ ತ್ರಿಜ್ಯ (r) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ. CSA = 2πr² ಮತ್ತು ಪಾದ ಸೇರಿಸಿದಾಗ TSA = 3πr².',
        workedExample:
          'r = 7 ಸೆಂ.ಮೀ: CSA = 98π ≈ 307.88 ಸೆಂ.ಮೀ², TSA = 147π ≈ 461.81 ಸೆಂ.ಮೀ², V = (686/3)π ≈ 718.38 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಬಟ್ಟಲು, ತಾರಾಲಯದ ಗುಮ್ಮಟ, ಇಗ್ಲೂ ಮತ್ತು ಅರ್ಧ ಕತ್ತರಿಸಿದ ಕಲ್ಲಂಗಡಿ.',
        didYouKnow:
          'ಗೋಳವನ್ನು ಅರ್ಧಕ್ಕೆ ಕತ್ತರಿಸಿದಾಗ πr² ವಿಸ್ತೀರ್ಣದ ಹೊಸ ವೃತ್ತ ಪಾದ ಸೇರುತ್ತದೆ, ಆದ್ದರಿಂದ ಎರಡು ಅರ್ಧಗೋಳಗಳ ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ 6πr² ಆಗುತ್ತದೆ!',
      },
      frustum: {
        definition:
          'ಶಂಕುವಿನ ಭಿನ್ನಕ (Frustum) ಎಂದರೆ ಶಂಕುವಿನ ಮೇಲಿನ ಸಣ್ಣ ಶಂಕುವನ್ನು ಪಾದಕ್ಕೆ ಸಮಾನಾಂತರವಾಗಿ ಕತ್ತರಿಸಿ ತೆಗೆದಾಗ ಉಳಿಯುವ ಭಾಗವಾಗಿದೆ.',
        faces: '3 ಮೇಲ್ಮೈಗಳು (2 ಸಮಾನಾಂತರ ವೃತ್ತಗಳು + 1 ವಕ್ರ ಗೋಡೆ)',
        edges: '2 ವೃತ್ತಾಕಾರದ ಅಂಚುಗಳು',
        vertices: '0 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಕೆಳ ತ್ರಿಜ್ಯ (r₁), ಮೇಲಿನ ತ್ರಿಜ್ಯ (r₂), ಎತ್ತರ (h), ಮತ್ತು ಓರೆ ಎತ್ತರ l = √(h² + (r₁ - r₂)²) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ.',
        workedExample:
          'r₁ = 6, r₂ = 3, h = 4 ಸೆಂ.ಮೀ: l = 5 ಸೆಂ.ಮೀ; LSA = 45π ≈ 141.37 ಸೆಂ.ಮೀ², TSA = 90π ≈ 282.74 ಸೆಂ.ಮೀ², V = 84π ≈ 263.89 ಸೆಂ.ಮೀ³.',
        realWorldExample: 'ಪ್ಲಾಸ್ಟಿಕ್ ಬಕೆಟ್, ಕಾಫಿ ಕಪ್, ಮೆಗಾಫೋನ್ ಮತ್ತು ಲ್ಯಾಂಪ್ ಶೇಡ್.',
        didYouKnow:
          'r₁ = r₂ ಆದಾಗ ಭಿನ್ನಕದ ಸೂತ್ರಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿಲಿಂಡರ್ ಸೂತ್ರಗಳಾಗಿ ಬದಲಾಗುತ್ತವೆ!',
      },
      octahedron: {
        definition:
          'ನಿಯಮಿತ ಅಷ್ಟಫಲಕವು ಪ್ರತಿ ಶೃಂಗದಲ್ಲಿ ನಾಲ್ಕು ಸಮಬಾಹು ತ್ರಿಕೋನಗಳು ಸೇರುವ ಎಂಟು ಸಮಬಾಹು ತ್ರಿಕೋನಗಳಿಂದ ನಿರ್ಮಿತವಾದ ಪ್ಲಾಟೋನಿಕ್ ಘನವಾಗಿದೆ.',
        faces: '8 ಸಮಬಾಹು ತ್ರಿಕೋನ ಮುಖಗಳು',
        edges: '12 ಸಮಾನ ಅಂಚುಗಳು',
        vertices: '6 ಶೃಂಗಗಳು',
        dimensionsSummary:
          'ಕೇವಲ ಒಂದು ಅಂಚಿನ ಉದ್ದ (a) ನಿಂದ ವ್ಯಾಖ್ಯಾನಿಸಲಾಗಿದೆ. ಇದು ಪಾದಕ್ಕೆ ಪಾದ ಜೋಡಿಸಿದ ಎರಡು ಚೌಕ ಪಿರಮಿಡ್‌ಗಳಿಗೆ ಸಮ.',
        workedExample:
          'a = 6 ಸೆಂ.ಮೀ: TSA = 72√3 ≈ 124.71 ಸೆಂ.ಮೀ², ಘನಫಲ = 72√2 ≈ 101.82 ಸೆಂ.ಮೀ³.',
        realWorldExample: '8-ಬದಿಯ ಆಟದ ದಾಳ (d8) ಮತ್ತು ನೈಸರ್ಗಿಕ ವಜ್ರ/ಫ್ಲೋರೈಟ್ ಹರಳುಗಳು.',
        didYouKnow:
          'ಘನದ 6 ಮುಖಗಳ ಕೇಂದ್ರಗಳನ್ನು ಜೋಡಿಸಿದರೆ ಸರಿಯಾಗಿ ಒಂದು ನಿಯಮಿತ ಅಷ್ಟಫಲಕ ರೂಪುಗೊಳ್ಳುತ್ತದೆ!',
      },
    },
    navTabs: {
      ariaLabel: 'ಅಪ್ಲಿಕೇಶನ್ ಕಾರ್ಯಕ್ಷೇತ್ರ',
      explorer: 'ಆಕಾರ ಪರಿಶೋಧಕ',
      netlab: 'ನೆಟ್ ಲ್ಯಾಬ್ (Net Lab)',
      tutor: 'AI ಬೋಧಕ',
      missions: 'ಮಿಷನ್‌ಗಳು',
      practice: '10ನೇ ತರಗತಿ ಅಭ್ಯಾಸ',
      hub: 'ಪ್ರಗತಿ & ಮಾರ್ಗದರ್ಶಿ',
    },
    netLab: {
      headerTitle: 'ಹಂತ 2 · ಸಂವಾದಾತ್ಮಕ ನೆಟ್ ಲ್ಯಾಬ್ & ವಿಸ್ತರಣಾ ಪರಿಶೋಧಕ',
      headerSubtitle:
        'ಎಲ್ಲಾ 11 ಘನ ನೆಟ್‌ಗಳನ್ನು ನೋಡಿ, ಮಡಚುವಿಕೆ ಪರೀಕ್ಷಿಸಿ, ಆಯತಘನ/ಸಿಲಿಂಡರ್ ನೆಟ್ ಅಧ್ಯಯನ ಮಾಡಿ, 6 ಹಂತಗಳಲ್ಲಿ ನೆಟ್ ಬಿಡಿಸಿ ಮತ್ತು k² / k³ ಪ್ರಮಾಣವನ್ನು ಗಮನಿಸಿ.',
      subTabs: {
        gallery: '11 ಘನ ನೆಟ್‌ಗಳು',
        checker: 'ನೆಟ್ ಪರೀಕ್ಷಾ ಆಟ',
        cuboid: 'ಆಯತಘನ ನೆಟ್',
        cylinder: 'ಸಿಲಿಂಡರ್ ನೆಟ್',
        draw: 'ನೆಟ್ ಬಿಡಿಸುವ ಮಾರ್ಗದರ್ಶಿ',
        scale: 'ಘನಫಲ ವಿಸ್ತರಣೆ',
      },
      gallery: {
        title: 'ಎಲ್ಲಾ 11 ಗಣಿತೀಯವಾಗಿ ಮಾನ್ಯ ಘನ ನೆಟ್‌ಗಳು',
        subtitle:
          'ಯಾವುದೇ ನೆಟ್ ಆಯ್ಕೆಮಾಡಿ ಅದರ 2D ವಿನ್ಯಾಸ ಮತ್ತು 6 ಮುಖಗಳು ಘನವಾಗಿ ಮಡಚುವುದನ್ನು ವೀಕ್ಷಿಸಿ.',
        selectNetHint: '11 ಘನ ನೆಟ್‌ಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ',
        familyLabel: 'ವರ್ಗ',
        animatePlay: 'ಸ್ವಯಂ ಮಡಚು',
        animatePause: 'ವಿರಾಮ',
        selectedLabel: 'ಆಯ್ಕೆಯಾದ ನೆಟ್',
        families: {
          '1-4-1': '1-4-1 ಸಾಲು (6 ನೆಟ್‌ಗಳು)',
          '2-3-1': '2-3-1 ಹಂತ (3 ನೆಟ್‌ಗಳು)',
          '2-2-2': '2-2-2 ಮೆಟ್ಟಿಲು (1 ನೆಟ್)',
          '3-3': '3-3 ಜೋಡಿ ಸಾಲು (1 ನೆಟ್)',
        },
        nets: {
          net_1_4_1_cross: {
            name: '1. ಕ್ಲಾಸಿಕ್ ಶಿಲುಬೆ (Cross)',
            tip: 'ಮಧ್ಯದ 4 ಚೌಕಗಳು ಸುತ್ತುಗಟ್ಟುತ್ತವೆ ಮತ್ತು 2 ಎದುರು ರೆಕ್ಕೆಗಳು ಪಾದ ಹಾಗೂ ಮೇಲ್ಭಾಗವಾಗುತ್ತವೆ.',
          },
          net_1_4_1_same_end: {
            name: '2. ಸಮಾನ ತುದಿಗಳು',
            tip: '4-ಚೌಕದ ಸಾಲಿನ ಒಂದೇ ಕಂಬದಲ್ಲಿ ಎರಡೂ ಕಡೆ ರೆಕ್ಕೆಗಳು ಇರುತ್ತವೆ.',
          },
          net_1_4_1_step_01: {
            name: '3. ಒಂದು ಹಂತದ ಬದಲಾವಣೆ',
            tip: 'ಮೇಲಿನ ಮತ್ತು ಕೆಳಗಿನ ರೆಕ್ಕೆ 1 ಚೌಕ ಸರಿದಿದ್ದರೂ ಎದುರು ಮುಖಗಳಾಗುತ್ತವೆ.',
          },
          net_1_4_1_step_02: {
            name: '4. ಎರಡು ಹಂತದ ಬದಲಾವಣೆ',
            tip: 'ಎರಡು ಕಂಬ ದೂರವಿದ್ದರೂ 4-ಚೌಕದ ಸುತ್ತುವಿಕೆ ಅವುಗಳನ್ನು ಎದುರುಬದುರಾಗಿಸುತ್ತದೆ.',
          },
          net_1_4_1_opposite_ends: {
            name: '5. ವಿರುದ್ಧ ತುದಿಗಳು',
            tip: 'ಗರಿಷ್ಠ ಅಂತರದಲ್ಲಿದ್ದರೂ ಯಾವುದೇ ಅತಿಕ್ರಮಣವಿಲ್ಲದೆ ಸಂಪೂರ್ಣ ಘನವಾಗುತ್ತದೆ.',
          },
          net_1_4_1_zigzag: {
            name: '6. ಮಧ್ಯದ ಜಿಗ್‌ಜಾಗ್',
            tip: 'ಮಧ್ಯದ ಸಾಲಿನ 2 ಮತ್ತು 3ನೇ ಚೌಕಗಳಿಗೆ ಜೋಡಿಸಿದ ಅಸಮಮಿತ 1-4-1 ವಿನ್ಯಾಸ.',
          },
          net_2_3_1_a: {
            name: '7. 2-3-1 ಹತ್ತಿರದ ಮುಚ್ಚಳ',
            tip: '3 ಚೌಕಗಳು ಗೋಡೆಗಳಾದರೆ, 2-ಚೌಕದ ತೋಳು ಉಳಿದ ಬದಿಗಳನ್ನು ಮುಚ್ಚುತ್ತದೆ.',
          },
          net_2_3_1_b: {
            name: '8. 2-3-1 ಮಧ್ಯದ ಮುಚ್ಚಳ',
            tip: 'ಮೇಲಿನ ರೆಕ್ಕೆ ಮಧ್ಯದಲ್ಲಿದ್ದರೂ ಎಲ್ಲಾ 6 ಮುಖಗಳನ್ನು ಸರಿಯಾಗಿ ಆವರಿಸುತ್ತದೆ.',
          },
          net_2_3_1_c: {
            name: '9. 2-3-1 ದೂರದ ಮುಚ್ಚಳ',
            tip: 'ಬಲ ತುದಿಯ ರೆಕ್ಕೆ ಮತ್ತು ಕೆಳಗಿನ L-ತೋಳು ಎದುರು ಮುಖಗಳನ್ನು ಮುಚ್ಚುತ್ತವೆ.',
          },
          net_2_2_2_stairs: {
            name: '10. ಮೆಟ್ಟಿಲು ವಿನ್ಯಾಸ (2-2-2)',
            tip: 'ಬಲ ಮತ್ತು ಕೆಳಗಿನ ತಿರುವುಗಳು ಘನದ ಸುತ್ತ ಸುರುಳಿಯಾಗಿ ಮಡಚುತ್ತವೆ.',
          },
          net_3_3_twin: {
            name: '11. ಜೋಡಿ ಪಟ್ಟಿಗಳು (3-3)',
            tip: 'ಎರಡು 3-ಚೌಕದ ಪಟ್ಟಿಗಳು ಒಂದು ಅಂಚಿನಲ್ಲಿ ಸೇರಿ ಘನದ ಅರ್ಧ-ಅರ್ಧ ಭಾಗ ಮುಚ್ಚುತ್ತವೆ.',
          },
        },
      },
      checker: {
        title: 'ನೆಟ್ ಪರೀಕ್ಷಾ ಸವಾಲು',
        subtitle:
          'ಪ್ರತಿ 2D ಆಕೃತಿ ಅತಿಕ್ರಮಣವಿಲ್ಲದೆ ಮುಚ್ಚಿದ ಘನವಾಗಿ ಮಡಚುತ್ತದೆಯೇ ಎಂದು ನಿರ್ಧರಿಸಿ.',
        question: 'ಇದು ಘನವಾಗಿ ಮಡಚುತ್ತದೆಯೇ?',
        yesButton: 'ಹೌದು, ಮಡಚುತ್ತದೆ',
        noButton: 'ಇಲ್ಲ, ಮಡಚುವುದಿಲ್ಲ',
        correctBadge: 'ಸರಿ!',
        wrongBadge: 'ಸರಿ ಇಲ್ಲ — ಕಾರಣ ನೋಡಿ:',
        nextPuzzle: 'ಮುಂದಿನ ವಿನ್ಯಾಸ',
        playAgain: 'ಮತ್ತೆ ಆಡಿ',
        resetProgress: 'ಪ್ರಗತಿ ಮರುಹೊಂದಿಸಿ',
        scoreLabel: 'ಅಂಕಗಳು',
        streakLabel: 'ಸತತ ಸರಿ',
        bestLabel: 'ಅತ್ಯುತ್ತಮ ಅಂಕ',
        progressLabel: 'ವಿನ್ಯಾಸ',
        completedTitle: 'ನೆಟ್ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡಿದೆ!',
        completedSummary: 'ನೀವು ಎಲ್ಲಾ 12 ಘನ ನೆಟ್ ಮಾದರಿಗಳನ್ನು ಪರೀಕ್ಷಿಸಿದ್ದೀರಿ.',
        foldIn3D: '3D ನಲ್ಲಿ ಮಡಚಿ ನೋಡಿ',
        hide3D: '3D ಮುನ್ನೋಟ ಮರೆಮಾಡಿ',
        explanations: {
          valid141:
            'ಮಾನ್ಯ 1-4-1 ನೆಟ್: ಮಧ್ಯದ 4 ಚೌಕಗಳು ಸುತ್ತುವರಿದರೆ, ಎರಡು ಬದಿಯ ರೆಕ್ಕೆಗಳು ಮೇಲ್ಭಾಗ ಮತ್ತು ಪಾದವನ್ನು ಮುಚ್ಚುತ್ತವೆ.',
          valid231:
            'ಮಾನ್ಯ 2-3-1 ನೆಟ್: ಪ್ರತಿ ಚೌಕವೂ ಅತಿಕ್ರಮಣವಿಲ್ಲದೆ ಬೇರೆ ಬೇರೆ ಮುಖಗಳಾಗುತ್ತವೆ.',
          valid222:
            'ಮಾನ್ಯ 2-2-2 ಮೆಟ್ಟಿಲು ನೆಟ್: ಪರ್ಯಾಯ ಲಂಬ ತಿರುವುಗಳು ಎಲ್ಲಾ 6 ಮುಖಗಳನ್ನು ತುಂಬುತ್ತವೆ.',
          valid33:
            'ಮಾನ್ಯ 3-3 ನೆಟ್: ಪ್ರತಿಯೊಂದು 3-ಚೌಕದ ಗುಂಪು ಒಂದು ಮೂಲೆಯಲ್ಲಿ ಸೇರುವ 3 ಮುಖಗಳನ್ನು ಆವರಿಸುತ್ತದೆ.',
          validOppositeEnds:
            'ಮಾನ್ಯ 1-4-1 ವಿರುದ್ಧ ತುದಿ ನೆಟ್: ರೆಕ್ಕೆಗಳು ಎದುರುಬದುರು ಮುಚ್ಚಳಗಳಾಗಿ ಸೇರುತ್ತವೆ.',
          invalidSameSide:
            'ಅಮಾನ್ಯ! ಎರಡೂ ರೆಕ್ಕೆಗಳು ಒಂದೇ ಬದಿಯಲ್ಲಿರುವುದರಿಂದ ಒಂದೇ ಮುಖದಲ್ಲಿ ಢಿಕ್ಕಿಯಾಗುತ್ತವೆ ಮತ್ತು ಎದುರು ಬದಿ ತೆರೆದಿರುತ್ತದೆ.',
          invalidLine:
            'ಅಮಾನ್ಯ! ನೇರ ಸಾಲಿನಲ್ಲಿರುವ 6 ಚೌಕಗಳು 4 ಮುಖಗಳ ಮೇಲೆ ಎರಡು ಬಾರಿ ಸುತ್ತಿ ಎಡ-ಬಲವನ್ನು ತೆರೆದಿಡುತ್ತವೆ.',
          invalid2x2:
            'ಅಮಾನ್ಯ! ಘನ ನೆಟ್‌ನಲ್ಲಿ 2×2 ಚದರ ಗುಂಪು ಇದ್ದರೆ ಮಡಚುವಾಗ ಮುಖಗಳು ಒಂದರ ಮೇಲೊಂದು ಬೀಳುತ್ತವೆ.',
          invalidDisconnected:
            'ಅಮಾನ್ಯ! ಚೌಕಗಳು ಅಂಚು ಹಂಚಿಕೊಳ್ಳದೆ ಕೇವಲ ಮೂಲೆಯಲ್ಲಿ ಸ್ಪರ್ಶಿಸುತ್ತಿವೆ.',
          invalidURing:
            'ಅಮಾನ್ಯ! U/C ಆಕಾರದ ತಿರುವಿನಲ್ಲಿ ಎರಡು ಚೌಕಗಳು ಒಂದೇ ಸ್ಥಳಕ್ಕೆ ಮಡಚುತ್ತವೆ.',
          invalidCount:
            'ಅಮಾನ್ಯ! ಇಲ್ಲಿ 5 ಚೌಕಗಳು ಮಾತ್ರ ಇವೆ; ಘನಕ್ಕೆ ಯಾವಾಗಲೂ 6 ಚೌಕ ಮುಖಗಳು ಬೇಕು.',
        },
      },
      cuboid: {
        title: 'ಲೆಬಲ್ ಮಾಡಿದ ಕ್ರಾಸ್-ಆಕಾರದ ಆಯತಘನ ನೆಟ್',
        subtitle:
          'ಎದುರು ಮುಖಗಳ ಜೋಡಿಗಳು ಒಂದೇ ಆಯಾಮಗಳನ್ನು ಹೇಗೆ ಹಂಚಿಕೊಳ್ಳುತ್ತವೆ ಎಂಬುದನ್ನು l, b, h ಬದಲಿಸಿ ನೋಡಿ.',
        pairBaseTop: 'ಪಾದ & ಮೇಲ್ಭಾಗ (l × b)',
        pairFrontBack: 'ಮುಂಭಾಗ & ಹಿಂಭಾಗ (l × h)',
        pairLeftRight: 'ಎಡ & ಬಲ (h × b)',
        totalTsaLabel: 'ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (6 ಆಯತಗಳ ಮೊತ್ತ)',
        openIn3D: '3D ಆಯತಘನದಲ್ಲಿ ತೆರೆಯಿರಿ',
      },
      cylinder: {
        title: 'ಸಿಲಿಂಡರ್ ನೆಟ್: 1 ಆಯತ + 2 ವೃತ್ತಗಳು',
        subtitle:
          'ಸಿಲಿಂಡರ್ ಅನ್ನು ಬಿಚ್ಚಿದಾಗ ಒಂದು ದೊಡ್ಡ ಆಯತ ಮತ್ತು ಎರಡು ಸಮಾನ ವೃತ್ತಗಳು ಸಿಗುತ್ತವೆ.',
        rectLabel: 'ವಕ್ರ ಗೋಡೆ (ಆಯತ)',
        circleTopLabel: 'ಮೇಲಿನ ವೃತ್ತ',
        circleBottomLabel: 'ಪಾದದ ವೃತ್ತ',
        circumferenceRuleTitle: 'ಆಯತದ ಉದ್ದ = 2πr ಏಕೆ?',
        circumferenceRuleBody:
          'ಕೊಳವೆಯಾಗಿ ಮಡಚುವಾಗ ಆಯತದ ಅಗಲವು ವೃತ್ತದ ಪರಿಧಿಯ ಸುತ್ತ ಸರಿಯಾಗಿ ಸುತ್ತಬೇಕು—ಆದ್ದರಿಂದ ಅದರ ಉದ್ದವು ವೃತ್ತದ ಪರಿಧಿ 2πr ಗೆ ಸಮನಾಗಿರುತ್ತದೆ!',
        rectWidthLabel: 'ಆಯತದ ಅಗಲ = ಪರಿಧಿ (2πr)',
        rectHeightLabel: 'ಆಯತದ ಎತ್ತರ (h)',
        circleRadiusLabel: 'ವೃತ್ತದ ತ್ರಿಜ್ಯ (r)',
        capAreaLabel: 'ಪ್ರತಿ ವೃತ್ತದ ವಿಸ್ತೀರ್ಣ (πr²)',
        curvedAreaLabel: 'ಆಯತದ ವಿಸ್ತೀರ್ಣ (2πr × h = 2πrh)',
        openIn3D: '3D ಸಿಲಿಂಡರ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
      },
      draw: {
        title: '6 ಸರಳ ಹಂತಗಳಲ್ಲಿ ನೆಟ್ ಬಿಡಿಸಿ',
        subtitle:
          'ಯಾವುದೇ 3D ಘನದ 2D ನೆಟ್ ಅನ್ನು ಕಾಗದದ ಮೇಲೆ ಬಿಡಿಸುವಾಗ ಈ 6 ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ.',
        stepPrefix: 'ಹಂತ',
        previous: 'ಹಿಂದಿನದು',
        next: 'ಮುಂದಿನದು',
        restart: 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ',
        finishMessage: 'ಯಾವುದೇ 3D ನೆಟ್ ಬಿಡಿಸಲು ಮತ್ತು ಪರೀಕ್ಷಿಸಲು ಸಿದ್ಧ!',
        steps: {
          s1: {
            title: '1. ತೆರೆದ ಘನವನ್ನು ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ',
            body: 'ಒಂದು ಪೆಟ್ಟಿಗೆಯ ಅಂಚುಗಳನ್ನು ಕತ್ತರಿಸಿ ಮೇಜಿನ ಮೇಲೆ ಸಮತಟ್ಟಾಗಿ ಹರಡಿದಂತೆ ಊಹಿಸಿ.',
            checklist: 'ಜೋಡಣೆ ಅಂಚುಗಳು ಕತ್ತರಿಸದೆ ಅಂಟಿಕೊಂಡಿರಬೇಕು.',
          },
          s2: {
            title: '2. ಮುಖಗಳನ್ನು ಗುರುತಿಸಿ',
            body: 'ಎಲ್ಲಾ ಮುಖಗಳನ್ನು ಎಣಿಸಿ: ಘನಕ್ಕೆ 6 ಚೌಕಗಳು, ಆಯತಘನಕ್ಕೆ 3 ಆಯತ ಜೋಡಿಗಳು, ಸಿಲಿಂಡರ್‌ಗೆ 1 ಆಯತ + 2 ವೃತ್ತಗಳು.',
            checklist: 'ಪ್ರತಿ ಮುಖದ ಉದ್ದ ಮತ್ತು ಅಗಲವನ್ನು ಗುರುತಿಸಿ.',
          },
          s3: {
            title: '3. ಪಾದವನ್ನು ಬಿಡಿಸಿ',
            body: 'ಕಾಗದದ ಮಧ್ಯಭಾಗದಲ್ಲಿ ನಿಖರ ಅಳತೆಗಳೊಂದಿಗೆ ತಳದ ಪಾದ ಮುಖವನ್ನು ಮೊದಲು ಬಿಡಿಸಿ.',
            checklist: 'ನಾಲ್ಕು ಬದಿಗಳಲ್ಲೂ ಪಕ್ಕದ ಮುಖಗಳಿಗೆ ಜಾಗ ಬಿಡಿ.',
          },
          s4: {
            title: '4. ಪಕ್ಕದ ಗೋಡೆಗಳನ್ನು ಜೋಡಿಸಿ',
            body: 'ಪಾದದ ಪ್ರತಿ ಅಂಚಿಗೂ ಸಮಾನ ಉದ್ದವಿರುವ ಪಕ್ಕದ ಮುಖಗಳನ್ನು ಜೋಡಿಸಿ ಬಿಡಿಸಿ.',
            checklist: 'ಹಂಚಿದ ಅಂಚುಗಳ ಉದ್ದ ಸಮವಾಗಿರಬೇಕು.',
          },
          s5: {
            title: '5. ಉಳಿದ ಮುಖವನ್ನು ಸೇರಿಸಿ',
            body: 'ಮೇಲ್ಭಾಗದ ಮುಚ್ಚಳವನ್ನು (Top) ಪಕ್ಕದ ಒಂದು ರೆಕ್ಕೆಯ ಹೊರ ಅಂಚಿಗೆ ಜೋಡಿಸಿ.',
            checklist: 'ಮೇಲ್ಭಾಗ ಮತ್ತು ಪಾದದ ಅಳತೆ ಒಂದೇ (l × b) ಆಗಿರಲಿ.',
          },
          s6: {
            title: '6. ಮನಸ್ಸಿನಲ್ಲಿ ಮಡಚಿ ಪರಿಶೀಲಿಸಿ',
            body: 'ಪ್ರತಿ ರೆಕ್ಕೆಯನ್ನು 90° ಮೇಲಕ್ಕೆ ಮಡಚಿ ಯಾವ ಮುಖವೂ ಢಿಕ್ಕಿಯಾಗದೆ ಮುಚ್ಚುತ್ತದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
            checklist: 'ಎಲ್ಲಾ 6 ಮುಖಗಳು ಸರಿಯಾಗಿ ಸೇರುತ್ತವೆಯೇ ನೋಡಿ.',
          },
        },
      },
      scale: {
        title: 'ಘನಫಲ ಮತ್ತು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ವಿಸ್ತರಣೆ (k, k², k³)',
        subtitle:
          'ಪ್ರತಿ ಅಂಚನ್ನು k ಪಟ್ಟು (1× ನಿಂದ 3×) ಹೆಚ್ಚಿಸಿ ವಿಸ್ತೀರ್ಣ k² ಪಟ್ಟು ಹಾಗೂ ಘನಫಲ k³ ಪಟ್ಟು ಹೇಗೆ ಬೆಳೆಯುತ್ತದೆ ನೋಡಿ.',
        scaleFactorLabel: 'ಪ್ರಮಾಣ ಗುಣಕ (k)',
        shapeLabel: 'ಪರೀಕ್ಷಾ ಘನ',
        originalHeader: 'ಮೂಲ (1×)',
        scaledHeader: 'ವಿಸ್ತೃತ (k×)',
        dimensionsRow: 'ರೇಖೀಯ ಅಳತೆಗಳು (× k)',
        lsaRow: 'LSA / CSA (× k²)',
        tsaRow: 'TSA (× k²)',
        volumeRow: 'ಘನಫಲ (× k³)',
        areaScaleFormula: 'ವಿಸ್ತೀರ್ಣವು k² ಪಟ್ಟು ಬೆಳೆಯುತ್ತದೆ',
        volumeScaleFormula: 'ಘನಫಲವು k³ ಪಟ್ಟು ಬೆಳೆಯುತ್ತದೆ',
        insightTitle: 'ಘನಫಲ ಏಕೆ ವೇಗವಾಗಿ ಬೆಳೆಯುತ್ತದೆ?',
        insightBody:
          'ಅಂಚು ದ್ವಿಗುಣಗೊಂಡರೆ (2×) ಮುಖದ ವಿಸ್ತೀರ್ಣ 2² = 4× ಆಗುತ್ತದೆ; ಆದರೆ 3D ಘನಫಲ ಉದ್ದ, ಅಗಲ ಮತ್ತು ಎತ್ತರ ಮೂರರಲ್ಲೂ ಬೆಳೆದು 2³ = 8× ಆಗುತ್ತದೆ! 3× ಆದರೆ 9× ವಿಸ್ತೀರ್ಣ ಮತ್ತು 27× ಘನಫಲ!',
      },
    },
    tutor: {
      headerTitle: 'ಕ್ಷೇತ್ರಗಣಿತ ಮತ್ತು 3D ನೆಟ್ ಅಧ್ಯಯನ ಬೋಧಕ',
      headerSubtitle:
        '15 ಆಕಾರಗಳು, ಸೂತ್ರಗಳು, ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ, ಘನಫಲ, ನೆಟ್‌ಗಳು ಮತ್ತು ಹಂತ-ಹಂತದ ಗಣಿತ ಸಮಸ್ಯೆಗಳನ್ನು ಕೇಳಿ.',
      demoBadge: 'ಡೆಮೊ ಬೋಧಕ (ಆಫ್‌ಲೈನ್ ಗಣಿತ ಎಂಜಿನ್ — ಲೈವ್ AI ಅಲ್ಲ)',
      liveBadge: 'ಲೈವ್ AI ಸಂಪರ್ಕಗೊಂಡಿದೆ (ಸರ್ವರ್ ಪ್ರಾಕ್ಸಿ)',
      demoNoticeTitle: 'ಡೆಮೊ ಮೋಡ್ ಸೂಚನೆ: ಲೈವ್ AI API ಕೀ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ',
      demoNoticeBody:
        'ಈ ಉತ್ತರಗಳನ್ನು NetFold 3D ನ ಸ್ಥಳೀಯ ಗಣಿತ ಎಂಜಿನ್‌ನಿಂದ ರಚಿಸಲಾಗಿದೆ (Archify ಕೇವಲ ರೇಖಾಚಿತ್ರ ಕೌಶಲ್ಯವಾಗಿದೆ, AI API ಅಲ್ಲ). ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕೀಗಳು ಸುರಕ್ಷಿತವಾಗಿರಲು, ಸರ್ವರ್ ಪ್ರಾಕ್ಸಿ (POST /api/tutor) ಮತ್ತು ಸರ್ವರ್ ಪರಿಸರದ GEMINI_API_KEY ಅಗತ್ಯವಿದೆ.',
      fallbackFromErrorBanner:
        'ಸರ್ವರ್ AI ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ; ಆದ್ದರಿಂದ ಸ್ಥಳೀಯ ಡೆಮೊ ಬೋಧಕ ಉತ್ತರ ನೀಡಿದೆ.',
      archToggleShow: 'ಲೈವ್ AI ಹೇಗೆ ಜೋಡಿಸುವುದು?',
      archToggleHide: 'ವಿನ್ಯಾಸ ಮಾಹಿತಿ ಮರೆಮಾಡಿ',
      archTitle: 'ಲೈವ್ AI ಗೆ ಸುರಕ್ಷಿತ ಬ್ಯಾಕೆಂಡ್ ವಿನ್ಯಾಸ',
      archSteps: {
        s1: '1. POST /api/tutor ಒದಗಿಸುವ ಸಣ್ಣ ಬ್ಯಾಕೆಂಡ್ ಪ್ರಾಕ್ಸಿ (Node/Express, Netlify/Vercel ಅಥವಾ Cloudflare Worker) ರಚಿಸಿ.',
        s2: '2. GEMINI_API_KEY ಅನ್ನು ಸರ್ವರ್ ಪರಿಸರದಲ್ಲಿ ಮಾತ್ರ ಸಂಗ್ರಹಿಸಿ — ಫ್ರಂಟ್‌ಎಂಡ್ VITE_* ನಲ್ಲಿ ಎಂದಿಗೂ ಇಡಬೇಡಿ.',
        s3: '3. VITE_TUTOR_ENDPOINT=/api/tutor ಹೊಂದಿಸಿ; AITutor.jsx ಆಕಾರ ಸಂದರ್ಭದೊಂದಿಗೆ ಸುರಕ್ಷಿತ POST ಕಳುಹಿಸುತ್ತದೆ.',
      },
      contextTitle: 'ಪ್ರಸ್ತುತ ಆಯ್ಕೆಯಾದ ಆಕಾರ',
      openExplorerButton: '3D ಪರಿಶೋಧಕದಲ್ಲಿ ತೆರೆಯಿರಿ',
      liveValuesLabel: 'ಲೈವ್ ಮೌಲ್ಯಗಳು',
      suggestedTitle: 'ಸೂಚಿಸಿದ ಪ್ರಶ್ನೆಗಳು',
      suggested: {
        s1: '{shape} ಅನ್ನು ಪ್ರಸ್ತುತ ಅಳತೆಗಳೊಂದಿಗೆ ಹಂತ-ಹಂತವಾಗಿ ವಿವರಿಸಿ',
        s2: '{shape} ನ LSA, TSA ಮತ್ತು ಘನಫಲ ಸೂತ್ರ ಯಾವುದು?',
        s3: '{shape} ನ 2D ನೆಟ್ ಹೇಗೆ ಮಡಚುತ್ತದೆ?',
        s4: 'ಎಷ್ಟು ಮಾನ್ಯ ಘನ ನೆಟ್‌ಗಳಿವೆ ಮತ್ತು ತಪ್ಪಾದವು ಏಕೆ ಮಡಚುವುದಿಲ್ಲ?',
        s5: 'ಪರಿಹರಿಸಿ: ಆಯತಘನ l=10, b=6, h=4 ರ LSA, TSA ಮತ್ತು ಘನಫಲ ಕಂಡುಹಿಡಿಯಿರಿ',
      },
      clearChat: 'ಚಾಟ್ ಅಳಿಸಿ',
      emptyTitle: 'ನಿಮ್ಮ ಗಣಿತ ಪ್ರಶ್ನೆಯನ್ನು ಕೆಳಗೆ ಕೇಳಿ',
      emptyBody:
        'ಮೇಲಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಒತ್ತಿ ಅಥವಾ "ಸಿಲಿಂಡರ್ r=3 h=5 ರ TSA ಮತ್ತು ಘನಫಲ" ಎಂದು ಟೈಪ್ ಮಾಡಿ.',
      inputPlaceholder:
        'ಆಕಾರಗಳು, ಸೂತ್ರಗಳು, ನೆಟ್‌ಗಳು ಅಥವಾ ಲೆಕ್ಕದ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
      sendButton: 'ಬೋಧಕರನ್ನು ಕೇಳಿ',
      thinkingText: 'ಲೆಕ್ಕ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      studentLabel: 'ವಿದ್ಯಾರ್ಥಿ',
      demoMessageTag: 'ಡೆಮೊ ಬೋಧಕ · ಆಫ್‌ಲೈನ್ ಗಣಿತ ಎಂಜಿನ್',
      liveMessageTag: 'ಲೈವ್ AI ಬೋಧಕ',
      templates: {
        solvedForPrefix: 'ಹಂತ-ಹಂತದ ಪರಿಹಾರ:',
        currentContextPrefix: 'ನಿಮ್ಮ ಆಯ್ಕೆಯಾದ ಆಕಾರದ ಪ್ರಕಾರ:',
        netHeading: '2D ನೆಟ್ ಮತ್ತು ಮಡಚುವಿಕೆಯ ವಿವರಣೆ',
        cubeNetsCountNote:
          'ಗಣಿತೀಯವಾಗಿ ವಿಭಿನ್ನ ಘನ ನೆಟ್‌ಗಳು 1-4-1 (6), 2-3-1 (3), 2-2-2 (1), ಮತ್ತು 3-3 (1) ಗುಂಪುಗಳಲ್ಲಿವೆ.',
        scaleHeading: 'ಪ್ರಮಾಣ ವಿಸ್ತರಣೆ ವಿಶ್ಲೇಷಣೆ',
        formulaHeading: 'ಸೂತ್ರಗಳು ಮತ್ತು ಲೈವ್ ಲೆಕ್ಕಾಚಾರ',
        netByShape: {
          cube: 'ಘನವು 11 ಮಾನ್ಯ ನೆಟ್‌ಗಳಲ್ಲಿ ಒಂದರಂತೆ 6 ಚೌಕಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ; 2×2 ಗುಂಪು ಅಥವಾ 6-ಸಾಲಿನ ನೆಟ್‌ಗಳು ಮಡಚುವಾಗ ಢಿಕ್ಕಿಯಾಗುತ್ತವೆ.',
          cuboid:
            'ಆಯತಘನವು 3 ಸಮಾನ ಜೋಡಿಗಳಾದ 6 ಆಯತಗಳ ಕ್ರಾಸ್ ನೆಟ್ ಆಗಿ ತೆರೆಯುತ್ತದೆ: 2(l×b), 2(l×h), 2(h×b).',
          cylinder:
            'ಸಿಲಿಂಡರ್ 2πr ಅಗಲದ (ವೃತ್ತದ ಪರಿಧಿಗೆ ಸಮ) ಮತ್ತು h ಎತ್ತರದ 1 ಆಯತ ಹಾಗೂ 2 ವೃತ್ತಗಳಾಗಿ (πr²) ತೆರೆಯುತ್ತದೆ.',
          cone: 'ಶಂಕುವು ವೃತ್ತಾಕಾರದ ಪಾದ (πr²) ಮತ್ತು l = √(r² + h²) ತ್ರಿಜ್ಯದ ವೃತ್ತಖಂಡವಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          square_pyramid:
            'ಚೌಕ ಪಿರಮಿಡ್ ಒಂದು ಚೌಕ ಪಾದ ಮತ್ತು ಅದರ ಅಂಚುಗಳಿಗೆ ಜೋಡಿಸಿದ 4 ತ್ರಿಕೋನ ಮುಖಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          sphere:
            'ಗೋಳಕ್ಕೆ ಯಾವುದೇ ನಿಖರ ಸಮತಲ ನೆಟ್ ಇಲ್ಲ—ಹರಿಯದೆ ಅಥವಾ ಎಳೆಯದೆ ಕಾಗದದಂತೆ ಹರಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
          triangular_prism:
            'ತ್ರಿಕೋನ ಪ್ರಿಸಮ್ 2 ಸಮಬಾಹು ತ್ರಿಕೋನ ಪಾದಗಳು ಮತ್ತು 3 ಆಯತ ಗೋಡೆಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          triangular_pyramid:
            'ತ್ರಿಕೋನ ಪಿರಮಿಡ್ ಒಂದು ತ್ರಿಕೋನ ಪಾದ ಮತ್ತು 3 ಪಕ್ಕದ ತ್ರಿಕೋನ ಮುಖಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          pentagonal_prism:
            'ಪಂಚಭುಜ ಪ್ರಿಸಮ್ 2 ಪಂಚಭುಜ ಪಾದಗಳು ಮತ್ತು 5 ಆಯತ ಗೋಡೆಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          hexagonal_prism:
            'ಷಡ್ಭುಜ ಪ್ರಿಸಮ್ 2 ಷಡ್ಭುಜ ಪಾದಗಳು ಮತ್ತು 6 ಆಯತ ಗೋಡೆಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          pentagonal_pyramid:
            'ಪಂಚಭುಜ ಪಿರಮಿಡ್ ಒಂದು ಪಂಚಭುಜ ಪಾದ ಮತ್ತು 5 ತ್ರಿಕೋನ ಮುಖಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          hexagonal_pyramid:
            'ಷಡ್ಭುಜ ಪಿರಮಿಡ್ ಒಂದು ಷಡ್ಭುಜ ಪಾದ ಮತ್ತು 6 ತ್ರಿಕೋನ ಮುಖಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          hemisphere:
            'ಅರ್ಧಗೋಳದ ಗುಂಬದಕ್ಕೆ ಎರಡು ದಿಕ್ಕುಗಳಲ್ಲಿ ವಕ್ರತೆ ಇರುವುದರಿಂದ ನಿಖರ ಸಮತಲ ನೆಟ್ ಇಲ್ಲ.',
          frustum:
            'ಭಿನ್ನಕವು ವಕ್ರ ಪಟ್ಟಿ π(r₁ + r₂)l ಹಾಗೂ r₁ ಮತ್ತು r₂ ತ್ರಿಜ್ಯದ 2 ವೃತ್ತಗಳಾಗಿ ತೆರೆಯುತ್ತದೆ.',
          octahedron:
            'ಅಷ್ಟಫಲಕವು ಪರಸ್ಪರ ಜೋಡಿಸಿದ 8 ಸಮಬಾಹು ತ್ರಿಕೋನಗಳ ನೆಟ್ ಆಗಿ ತೆರೆಯುತ್ತದೆ.',
        },
      },
    },
    practice: {
      headerTitle: 'NCERT ಕ್ಷೇತ್ರಗಣಿತ – 10ನೇ ತರಗತಿ ಬಿಡಿಸಿದ ಅಭ್ಯಾಸ',
      headerSubtitle:
        'ಪರಿಕಲ್ಪನೆ, ವ್ಯುತ್ಪತ್ತಿ, ಹಂತ-ಹಂತದ ಲೆಕ್ಕಾಚಾರ, ಲೇಬಲ್ ಮಾಡಿದ 3D ಮಾದರಿಗಳು ಮತ್ತು ರೇಖಾಚಿತ್ರಗಳೊಂದಿಗೆ ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಶೈಲಿಯ ಲಿಖಿತ ಪರಿಹಾರಗಳು (ಪ್ರಶ್ನೆಗಳು 1–10).',
      boardExamTag: 'ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಲಿಖಿತ ಪರಿಹಾರ · 10ನೇ ತರಗತಿ NCERT',
      progressPrefix: 'ಪ್ರಶ್ನೆ',
      questionSelectorAria: 'ಬಿಡಿಸಿದ ಪ್ರಶ್ನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      previousButton: 'ಹಿಂದಿನದು',
      nextButton: 'ಮುಂದಿನದು',
      expandAll: 'ಎಲ್ಲಾ ಹಂತಗಳನ್ನು ತೆರೆಯಿರಿ',
      collapseAll: 'ಎಲ್ಲಾ ಹಂತಗಳನ್ನು ಮುಚ್ಚಿ',
      stepBadgePrefix: 'ಹಂತ',
      diagramSectionTitle: 'ಲೇಬಲ್ ಮಾಡಿದ 3D ಮಾದರಿ ಮತ್ತು ಗಣಿತ ರೇಖಾಚಿತ್ರ',
      interactive3DTab: 'ಸಂವಾದಾತ್ಮಕ 3D ಮಾದರಿ',
      diagramTab: '2D ಗಣಿತ ರೇಖಾಚಿತ್ರ',
      togglePrimaryModel: 'ಮೂಲ ಘನಾಕೃತಿ',
      toggleCompareModel: 'ಪರಿಣಾಮದ ಘನಾಕೃತಿ ಹೋಲಿಸಿ',
      foldSliderLabel: 'ಮಡಚುವಿಕೆ / ತೆರೆಯುವಿಕೆ ಮುನ್ನೋಟ',
      openInExplorer: '3D ಪರಿಶೋಧಕದಲ್ಲಿ ತೆರೆಯಿರಿ',
      scaleNoticePrefix:
        'ಸ್ಪಷ್ಟತೆಗಾಗಿ 3D ಮಾದರಿಯನ್ನು ಅನುಪಾತದಲ್ಲಿ ತೋರಿಸಲಾಗಿದೆ; ನಿಜವಾದ NCERT ಅಳತೆಗಳು ಲೇಬಲ್‌ಗಳಲ್ಲಿವೆ:',
      writtenPracticeNote: 'ವಿವರವಾದ ಲಿಖಿತ ಪರಿಹಾರ ಘಟಕ (MCQ ರಸಪ್ರಶ್ನೆ ಅಲ್ಲ)',
      diagramLabels: {
        radius: 'ತ್ರಿಜ್ಯ',
        diameter: 'ವ್ಯಾಸ',
        height: 'ಎತ್ತರ',
        slantHeight: 'ಓರೆ ಎತ್ತರ',
        edge: 'ಅಂಚು',
        baseArea: 'ಪಾದದ ವಿಸ್ತೀರ್ಣ',
        surfaceArea: 'ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ',
        volume: 'ಘನಫಲ',
        cutPlane: 'ಕತ್ತರಿಸಿದ ಸಮತಲ (+πr²)',
        joinedFace: 'ಜೋಡಿಸಿದ ಮುಖ (-2a² ಮರೆ)',
        inscribedCone: 'ಅಂತರ್ಗತ ದೊಡ್ಡ ಶಂಕು',
        hemisphereBowl: 'ಅರ್ಧಗೋಳ ಗುಮ್ಮಟ',
        flatCircularBase: 'ಸಮತಟ್ಟಾದ ವೃತ್ತಾಕಾರದ ಪಾದ',
        semicircleArc: 'ಅರ್ಧವೃತ್ತ ವಲಯ',
      },
      stepTitles: {
        s1: '1. ಮೂಲ ಪ್ರಶ್ನೆ ಹೇಳಿಕೆ',
        s2: '2. ಸಂಬಂಧಿತ ವ್ಯಾಖ್ಯಾನ ಮತ್ತು ಪರಿಕಲ್ಪನೆ',
        s3: '3. ದತ್ತ ಮಾಹಿತಿ',
        s4: '4. ಕಂಡುಹಿಡಿಯಬೇಕಾದುದು',
        s5: '5. ಸಂಬಂಧಿತ ಗಣಿತ ಸೂತ್ರ',
        s6: '6. ಹಂತ-ಹಂತದ ವ್ಯುತ್ಪತ್ತಿ',
        s7: '7. ಬೆಲೆಗಳ ಆದೇಶನ',
        s8: '8. ವಿವರವಾದ ಲೆಕ್ಕಾಚಾರಗಳು',
        s9: '9. ಸರಿಯಾದ ಏಕಮಾನಗಳೊಂದಿಗೆ ಅಂತಿಮ ಉತ್ತರ',
        s10: '10. ಸಂಬಂಧಿತ ಲೇಬಲ್ ಮಾಡಿದ 3D ಮಾದರಿ ಮತ್ತು ಗಣಿತ ರೇಖಾಚಿತ್ರ',
      },
    },
    themeToggle: {
      lightLabel: 'ಬೆಳಕು',
      darkLabel: 'ಡಾರ್ಕ್',
      switchToDark: 'ಡಾರ್ಕ್ ಥೀಮ್‌ಗೆ ಬದಲಿಸಿ',
      switchToLight: 'ಬೆಳಕಿನ ಥೀಮ್‌ಗೆ ಬದಲಿಸಿ',
    },
    canvasControls: {
      lockZoom: 'ಸ್ಕ್ರಾಲ್ ಲಾಕ್',
      unlockZoom: 'ಜೂಮ್ ತೆರೆಯಿರಿ',
      zoomIn: '3D ಹತ್ತಿರ ಮಾಡಿ',
      zoomOut: '3D ದೂರ ಮಾಡಿ',
      scrollSafeNote: 'ಸ್ಕ್ರಾಲ್ ಪುಟವನ್ನು ಚಲಿಸುತ್ತದೆ · ಡ್ರ್ಯಾಗ್ 3D ತಿರುಗಿಸುತ್ತದೆ',
    },
    search: {
      buttonLabel: 'ಹುಡುಕಿ',
      placeholder: '15 ಆಕಾರಗಳು, 10ನೇ ತರಗತಿ Q1–Q10, ಮಿಷನ್‌ಗಳು ಹುಡುಕಿ…',
      emptyPrompt: 'ಆಕಾರ, ಸೂತ್ರ, ಮಿಷನ್ ಅಥವಾ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ.',
      noResults: 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      closeLabel: 'ಹುಡುಕಾಟ ಮುಚ್ಚಿ',
      shortcutHint: '/ ಅಥವಾ Ctrl+K ಒತ್ತಿ',
      categories: {
        shapes: '3D ಆಕಾರ',
        missions: 'ಮಿಷನ್',
        practice: '10ನೇ ತರಗತಿ ಅಭ್ಯಾಸ',
        netlab: 'ನೆಟ್ ಲ್ಯಾಬ್',
        sections: 'ಪ್ರಗತಿ & ಮಾರ್ಗದರ್ಶಿ',
      },
    },
    bookmarks: {
      addShape: 'ಆಕಾರ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ',
      removeShape: 'ಬುಕ್‌ಮಾರ್ಕ್ ತೆಗೆಯಿರಿ',
      addQuestion: 'ಪ್ರಶ್ನೆ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ',
      removeQuestion: 'ಪ್ರಶ್ನೆ ಬುಕ್‌ಮಾರ್ಕ್ ತೆಗೆಯಿರಿ',
      shapesHeading: 'ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ ಆಕಾರಗಳು',
      questionsHeading: 'ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ 10ನೇ ತರಗತಿ ಪ್ರಶ್ನೆಗಳು',
      emptyTitle: 'ಇನ್ನೂ ಯಾವುದೇ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳಿಲ್ಲ',
      emptyHint: 'ಇಲ್ಲಿ ಉಳಿಸಲು ಯಾವುದೇ 3D ಆಕಾರ ಅಥವಾ ಪ್ರಶ್ನೆಯ ನಕ್ಷತ್ರ ಐಕಾನ್ ಒತ್ತಿ.',
      openButton: 'ತೆರೆಯಿರಿ',
    },
    missionsUi: {
      headerTitle: 'ಸಂವಾದಾತ್ಮಕ ಕ್ಷೇತ್ರಗಣಿತ ಮಿಷನ್‌ಗಳು',
      headerSubtitle:
        '3D ನೆಟ್‌ಗಳು, ಗೋಡೆ ಬಣ್ಣ, ನೀರಿನ ಟ್ಯಾಂಕ್ ಮತ್ತು ಪ್ಯಾಕೇಜಿಂಗ್ ಸಮಸ್ಯೆಗಳನ್ನು ಬಿಡಿಸಿ. ಪ್ರತಿ ಮಿಷನ್‌ಗೆ 3 ನಕ್ಷತ್ರಗಳವರೆಗೆ ಗಳಿಸಿ!',
      progressBadge: 'ಪೂರ್ಣಗೊಂಡ ಮಿಷನ್‌ಗಳು',
      starsEarnedLabel: 'ಗಳಿಸಿದ ನಕ್ಷತ್ರಗಳು',
      completedTag: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
      inProgressTag: 'ಪೂರ್ಣಗೊಂಡಿಲ್ಲ',
      attemptsLabel: 'ಪ್ರಯತ್ನಗಳು',
      selectChallenge: 'ಸವಾಲು ಸುತ್ತು',
      baseFaceTag: 'ಸ್ಥಿರ ಆಧಾರ ಮುಖ',
      chooseTopFace: 'ಮಡಚಿದ ನಂತರ ಯಾವ ಸಂಖ್ಯೆಯ ಚೌಕ ಮೇಲ್ಭಾಗದ (TOP) ಮುಖವಾಗುತ್ತದೆ?',
      faceOptionPrefix: 'ಮುಖ',
      foldTestLabel: 'ಸಂವಾದಾತ್ಮಕ 3D ಮಡಚುವಿಕೆ ಮುನ್ನೋಟ',
      roomDimensionsTag: 'ಕೊಠಡಿ: l = 8 m, b = 6 m, h = 4 m (ನೆಲ ಮತ್ತು ಛಾವಣಿ ಬಿಟ್ಟು)',
      enterWallsArea: '4 ಗೋಡೆಗಳ ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ (m²)',
      radiusLabel: 'ಟ್ಯಾಂಕ್ ತ್ರಿಜ್ಯ r (m)',
      heightLabel: 'ಟ್ಯಾಂಕ್ ಎತ್ತರ h (m)',
      lengthLabel: 'ಉದ್ದ l (cm)',
      breadthLabel: 'ಅಗಲ b (cm)',
      targetLabel: 'ಗುರಿ',
      computedLabel: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಮೌಲ್ಯ',
      litresUnit: 'ಲೀಟರ್‌ಗಳು',
      selectReasonLabel: 'ಈ ಆಕಾರವು ಕಾರ್ಡ್‌ಬೋರ್ಡ್ (TSA) ಕಡಿಮೆ ಮಾಡಲು ಕಾರಣವೇನು?',
      checkAnswer: 'ಉತ್ತರ ಪರಿಶೀಲಿಸಿ',
      retryButton: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      resetButton: 'ಮಿಷನ್ ಮರುಹೊಂದಿಸಿ',
      resetAllButton: 'ಎಲ್ಲಾ ಮಿಷನ್ ಮರುಹೊಂದಿಸಿ',
      listenButton: 'ಓದಿ ಹೇಳಿ',
      stopAudioButton: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      audioUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ.',
      hintLockedNote: '2 ತಪ್ಪು ಪ್ರಯತ್ನಗಳ ನಂತರ ಸುಳಿವುಗಳು ತಾನಾಗಿಯೇ ತೆರೆಯುತ್ತವೆ.',
      hintUnlockedTitle: 'ಮಾರ್ಗದರ್ಶಿ ಸುಳಿವು ತೆರೆದಿದೆ',
      hintFormulaPrefix: 'ಸುಳಿವು',
      mistakeFloorCeiling:
        'ಹತ್ತಿರದಲ್ಲಿದ್ದೀರಿ! ನೀವು ನೆಲ ಮತ್ತು ಛಾವಣಿ (96 m²) ಸೇರಿಸಿದ್ದೀರಿ. LSA = 2h(l + b) ಬಳಸಿ.',
      mistakeVolumeMismatch:
        'l × b × h = 64 cm³ ಆಗುವಂತೆ ಆಯಾಮಗಳನ್ನು ಸರಿಹೊಂದಿಸಿ.',
      mistakeNotMinimum:
        'ಘನಫಲ 64 cm³ ಇದೆ, ಆದರೆ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಇನ್ನೂ ಕಡಿಮೆ ಮಾಡಬಹುದು! ಸಮಾನ ಅಂಚುಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
      mistakeSelectReason:
        'ಆಯಾಮಗಳು ಕನಿಷ್ಠ TSA ನೀಡುತ್ತವೆ — ಈಗ ಕೆಳಗಿನ ಸರಿಯಾದ ಗಣಿತ ಕಾರಣವನ್ನು ಆರಿಸಿ!',
      mistakeTooSmall:
        'ಟ್ಯಾಂಕ್ ಘನಫಲ 1540 L ಗಿಂತ ಕಡಿಮೆಯಿದೆ. r ಅಥವಾ h ಹೆಚ್ಚಿಸಿ.',
      mistakeTooLarge:
        'ಟ್ಯಾಂಕ್ ಘನಫಲ 1540 L ಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ. r ಅಥವಾ h ಕಡಿಮೆ ಮಾಡಿ.',
      successTitle: 'ಮಿಷನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!',
      closeModal: 'ಮುಂದುವರಿಸಿ',
    },
    hub: {
      headerTitle: 'ಕಲಿಕಾ ಪ್ರಗತಿ, ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶಿ',
      headerSubtitle:
        'ಎಲ್ಲಾ 15 ಘನಾಕೃತಿಗಳು, 4 ಮಿಷನ್‌ಗಳು, 10ನೇ ತರಗತಿ ಪ್ರಶ್ನೆಗಳು, ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು ಮತ್ತು ಸಹಾಯ ಮಾಹಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
      tabs: {
        progress: 'ಪ್ರಗತಿ & ಬ್ಯಾಡ್ಜ್‌ಗಳು',
        bookmarks: 'ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು',
        help: 'ಸಹಾಯ & ಕೀಬೋರ್ಡ್',
        about: 'ಕುರಿತು & ವಿನ್ಯಾಸ',
      },
      stats: {
        overallMastery: 'ಒಟ್ಟು ಪ್ರಾವೀಣ್ಯತೆ',
        shapesExplored: 'ನೋಡಿದ ಆಕಾರಗಳು',
        missionsDone: 'ಪೂರ್ಣ ಮಿಷನ್‌ಗಳು',
        starsEarned: 'ಮಿಷನ್ ನಕ್ಷತ್ರಗಳು',
        practiceReviewed: '10ನೇ ತರಗತಿ ಅಭ್ಯಾಸ',
        netCheckerBest: 'ನೆಟ್ ಪರೀಕ್ಷಾ ಅತ್ಯುತ್ತಮ',
      },
      badgesTitle: 'ಸಾಧನೆ ಬ್ಯಾಡ್ಜ್‌ಗಳು',
      unlockedTag: 'ಅನ್‌ಲಾಕ್ ಆಗಿದೆ',
      lockedTag: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
      badges: {
        first_fold: {
          title: 'ಮೊದಲ ಮಡಚುವಿಕೆ',
          desc: 'ಮೊದಲ 3D ಘನಾಕೃತಿಯನ್ನು ಅನ್ವೇಷಿಸಿ.',
        },
        class8_complete: {
          title: '8ನೇ ತರಗತಿ ಅಡಿಪಾಯ',
          desc: 'ಘನ, ಆಯತಘನ ಮತ್ತು ಸಿಲಿಂಡರ್‌ಗಳನ್ನು ನೋಡಿ.',
        },
        master_15: {
          title: '15 ಆಕಾರಗಳ ಮಾಸ್ಟರ್',
          desc: 'ಎಲ್ಲಾ 15 3D ಆಕಾರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
        },
        mission_challenger: {
          title: 'ಅನ್ವಯಿಕ ಸವಾಲುಗಾರ',
          desc: 'ಕನಿಷ್ಠ 2 ಸಂವಾದಾತ್ಮಕ ಮಿಷನ್‌ಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
        },
        star_achiever: {
          title: 'ಸಂಪೂರ್ಣ ಮಿಷನ್ ಚಾಂಪಿಯನ್',
          desc: 'ಎಲ್ಲಾ 4 ನೈಜ-ಪ್ರಪಂಚದ ಮಿಷನ್‌ಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
        },
        board_scholar: {
          title: '10ನೇ ತರಗತಿ ಬೋರ್ಡ್ ಪಂಡಿತ',
          desc: 'ಎಲ್ಲಾ 10 NCERT 10ನೇ ತರಗತಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ.',
        },
      },
      quickResumeTitle: 'ತ್ವರಿತ ನ್ಯಾವಿಗೇಷನ್',
      resumeExplorer: '3D ಪರಿಶೋಧಕ ತೆರೆಯಿರಿ',
      resumeMissions: 'ಮಿಷನ್‌ಗಳಿಗೆ ಹೋಗಿ',
      resumePractice: '10ನೇ ತರಗತಿ ಅಭ್ಯಾಸ ತೆರೆಯಿರಿ',
      helpTitle: 'NetFold 3D ಬಳಸುವ ವಿಧಾನ',
      helpSteps: {
        s1: {
          title: '1. ಆಕಾರ ಪರಿಶೋಧಕ (15 ಆಕಾರಗಳು)',
          desc: 'ಆಕಾರ ಆರಿಸಿ, 0% ನೆಟ್‌ನಿಂದ 100% ಘನದವರೆಗೆ ಮಡಚಿ ಮತ್ತು ಪ್ರತಿ ಮುಖದ ವಿಸ್ತೀರ್ಣವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ನೋಡಿ.',
        },
        s2: {
          title: '2. ಮಿಷನ್‌ಗಳು (ಧ್ವನಿ & ಸುಳಿವುಗಳು)',
          desc: '3D ದೃಶ್ಯಗಳೊಂದಿಗೆ 4 ಪ್ರಾಯೋಗಿಕ ಸವಾಲುಗಳನ್ನು ಬಿಡಿಸಿ. 2 ತಪ್ಪು ಪ್ರಯತ್ನಗಳ ನಂತರ ಸುಳಿವು ತೆರೆಯುತ್ತದೆ.',
        },
        s3: {
          title: '3. ನೆಟ್ ಲ್ಯಾಬ್ & 10ನೇ ತರಗತಿ ಅಭ್ಯಾಸ',
          desc: '11 ಘನ ನೆಟ್‌ಗಳು, k²/k³ ಪ್ರಮಾಣ ಮತ್ತು 10 ಹಂತಗಳ ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಪರಿಹಾರಗಳನ್ನು ಸುಲಭ ಸ್ಕ್ರಾಲ್‌ನಲ್ಲಿ ಓದಿ.',
        },
        s4: {
          title: '4. ಆಫ್‌ಲೈನ್ ಉಳಿತಾಯ & ಬುಕ್‌ಮಾರ್ಕ್',
          desc: 'ಪ್ರಗತಿ, ನಕ್ಷತ್ರಗಳು, ಥೀಮ್ ಮತ್ತು ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು ಎಲ್ಲಾ 5 ಭಾಷೆಗಳಲ್ಲಿ localStorage ನಲ್ಲಿ ಉಳಿಯುತ್ತವೆ.',
        },
      },
      shortcutsTitle: 'ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು',
      shortcuts: {
        search: 'ಜಾಗತಿಕ ಹುಡುಕಾಟಕ್ಕೆ Ctrl + K ಅಥವಾ / ಒತ್ತಿ',
        closeModal: 'ಸಂವಾದ ಮುಚ್ಚಲು Esc ಒತ್ತಿ',
        navigateTabs: 'ನಿಯಂತ್ರಣಗಳ ನಡುವೆ ಚಲಿಸಲು Tab / Shift + Tab ಬಳಸಿ',
        adjustSliders: 'ಸ್ಲೈಡರ್‌ಗಳನ್ನು ಸರಿಹೊಂದಿಸಲು ಎಡ / ಬಲ ಬಾಣದ ಕೀಗಳನ್ನು ಬಳಸಿ',
      },
      aboutTitle: 'NetFold 3D ಕುರಿತು ಮತ್ತು ಕಲಿಕಾ ಉದ್ದೇಶಗಳು',
      aboutPurpose:
        'NetFold 3D ಎನ್ನುವುದು NCERT 8–10ನೇ ತರಗತಿ ಕ್ಷೇತ್ರಗಣಿತಕ್ಕಾಗಿ ರಚಿಸಲಾದ ಆಫ್‌ಲೈನ್ ದೃಶ್ಯ ಗಣಿತ ಪ್ರಯೋಗಾಲಯವಾಗಿದೆ. ಸೂತ್ರಗಳನ್ನು ಕಂಠಪಾಠ ಮಾಡುವ ಬದಲು 2D ನೆಟ್‌ಗಳು 3D ಘನಗಳಾಗಿ ಮಡಚುವುದನ್ನು ನೇರವಾಗಿ ನೋಡಬಹುದು.',
      aboutObjectivesTitle: 'ಮುಖ್ಯ ಕಲಿಕಾ ಉದ್ದೇಶಗಳು',
      aboutObjectives: {
        o1: 'ಪ್ರಿಸಮ್, ಪಿರಮಿಡ್, ಶಂಕು ಮತ್ತು ಭಿನ್ನಕಗಳ 2D ನೆಟ್ ಮಡಚುವಿಕೆಯನ್ನು ದೃಶ್ಯೀಕರಿಸುವುದು.',
        o2: 'ಪಾರ್ಶ್ವ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (LSA) ಮತ್ತು ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA) ವ್ಯತ್ಯಾಸ ಅರಿಯುವುದು.',
        o3: 'ಗೋಳ ಮತ್ತು ಅರ್ಧಗೋಳಕ್ಕೆ ನಿಖರ ಸಮತಲ ನೆಟ್ ಏಕೆ ಇಲ್ಲ ಎಂಬುದನ್ನು ತಿಳಿಯುವುದು.',
        o4: '5 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಹಂತ-ಹಂತದ ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಪರಿಹಾರಗಳನ್ನು ಕಲಿಯುವುದು.',
      },
      aboutArchTitle: 'ಕ್ಲೈಂಟ್-ಸೈಡ್ ವಿನ್ಯಾಸ (Archify ಸಾರಾಂಶ)',
      aboutArchBody:
        'React 19, Three.js / React Three Fiber, Tailwind CSS ಮತ್ತು Vite PWA ನಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ. ಶುದ್ಧ ಮಾಡ್ಯೂಲ್‌ಗಳು ಗಣಿತ ಎಂಜಿನ್, ನೆಟ್ ಜ್ಯಾಮಿತಿ, 3D ಕ್ಯಾನ್ವಾಸ್, 5-ಭಾಷಾ ಅನುವಾದ, ಮಿಷನ್‌ಗಳು ಮತ್ತು localStorage ಪ್ರಗತಿಯನ್ನು ನಿರ್ವಹಿಸುತ್ತವೆ.',
      aboutHonestyNote:
        'AI ಮಾಹಿತಿ: ಇದರಲ್ಲಿರುವ AI ಬೋಧಕವು ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಸ್ಥಳೀಯ ಗಣಿತ ಪರಿಹಾರಕವಾಗಿದೆ (ನಕಲಿ ಲೈವ್ AI ಅಲ್ಲ).',
    },
  },

  ta: {
    appTitle: 'NetFold 3D',
    appSubtitle: 'செயல்முறை 3D அளவியல் ஆய்வகம்',
    languageSelectLabel: 'மொழி',
    languageSelectAria: 'பயன்பாட்டு மொழியைத் தேர்ந்தெடுக்கவும்',
    shapeSectionTitle: '3D வடிவத்தைத் தேர்ந்தெடுக்கவும் (15 வடிவங்கள்)',
    class8CategoryLabel: 'வகுப்பு 8 NCERT',
    beyondClass8CategoryLabel: '8-ஆம் வகுப்புக்கு மேல்',
    beyondClass8Badge: '8-ஆம் வகுப்புக்கு மேல் (வகுப்பு 9/10 தலைப்பு)',
    beyondSubgroups: {
      prisms: 'அரியங்கள் (Prisms)',
      pyramids: 'பிரமிடுகள் (Pyramids)',
      curvedAndPlatonic: 'வளைந்த & பிளேட்டானிக் வடிவங்கள்',
    },
    shapes: {
      cube: 'கனசதுரம்',
      cuboid: 'கனசெவ்வகம்',
      cylinder: 'உருளை',
      cone: 'கூம்பு',
      square_pyramid: 'சதுர பிரமிடு',
      sphere: 'கோளம்',
      triangular_prism: 'முக்கோண அரியம்',
      triangular_pyramid: 'முக்கோண பிரமிடு (நான்முகன்)',
      pentagonal_prism: 'ஐங்கோண அரியம்',
      hexagonal_prism: 'அறுங்கோண அரியம்',
      pentagonal_pyramid: 'ஐங்கோண பிரமிடு',
      hexagonal_pyramid: 'அறுங்கோண பிரமிடு',
      hemisphere: 'அரைக்கோளம்',
      frustum: 'கூம்பின் இடைக்கண்டம் (Frustum)',
      octahedron: 'எண்முகன் (Octahedron)',
    },
    foldSectionTitle: 'வலை மடிப்பு',
    foldPresets: {
      flat: '0% தட்டை',
      half: '50% பாதி',
      closed: '100% வடிவம்',
    },
    foldStage: {
      flat: 'தட்டை 2D வலை',
      folding: 'மடிப்பு செயல்பாட்டில் உள்ளது',
      closed: 'மூடிய 3D வடிவம்',
      noNet: '3D வடிவம் (துல்லிய தட்டை வலை இல்லை)',
    },
    sphereNoNetMessage:
      'கோளத்திற்கு தட்டையான வலை இல்லை, எனவே அதை மடிக்க முடியாது.',
    hemisphereNoNetMessage:
      'அரைக்கோளத்திற்குத் துல்லியமான தட்டை வலை இல்லை, எனவே அதன் வளைந்த குவிமாடத்தைத் தட்டையாக மடிக்க முடியாது.',
    sphereLsaNotApplicable: 'கோளத்திற்குப் பொருந்தாது',
    octahedronLsaNotApplicable:
      'பொருந்தாது (அனைத்து 8 சமபக்க முக்கோண முகங்களும் சமமானவை)',
    dimensionsSectionTitle: 'அளவுகள்',
    dimensionLabels: {
      a: 'விளிம்பு (a)',
      baseSideA: 'அடிப்பக்க அளவு (a)',
      l: 'நீளம் (l)',
      b: 'அகலம் (b)',
      h: 'உயரம் (h)',
      r: 'ஆரம் (r)',
      r1: 'கீழ் ஆரம் (r₁)',
      r2: 'மேல் ஆரம் (r₂)',
      slantL: 'சாய்வு உயரம் (l)',
      slantS: 'சாய்வு உயரம் (s)',
      diameter: 'விட்டம் (2r)',
    },
    unitsSectionTitle: 'அலகு',
    unitNames: {
      cm: 'சென்டிமீட்டர் (செ.மீ)',
      m: 'மீட்டர் (மீ)',
    },
    unitShort: {
      cm: 'செ.மீ',
      m: 'மீ',
    },
    unitSymbols: {
      cm: { length: 'செ.மீ', area: 'செ.மீ²', volume: 'செ.மீ³' },
      m: { length: 'மீ', area: 'மீ²', volume: 'மீ³' },
    },
    unitHintTitle: 'மீட்டரில் பெரிய அளவுகள்',
    unitHintBody:
      '5 மீ அல்லது அதற்கு மேற்பட்ட அளவுகள் அறை அல்லது தொட்டி போன்ற மிகப்பெரிய பொருள்களாகும். நீங்கள் சென்டிமீட்டர் (cm) என நினைத்தீர்களா?',
    unitHintSwitch: 'செ.மீ-க்கு மாற்று',
    highlightSectionTitle: 'காட்சி சிறப்பம்சம்',
    highlightModes: {
      all: 'இயல்பு',
      lsa: 'LSA',
      tsa: 'TSA',
      volume: 'கன அளவு',
    },
    highlightDescriptions: {
      all: 'அனைத்து முகங்களும் தனித்தனி கல்வி வண்ணங்களில் காட்டப்படுகின்றன.',
      lsa: 'பக்க அல்லது வளைந்த முகங்கள் மட்டும் ஒளிரும்; அடி/மேல் பகுதிகள் மங்கலாக்கப்படும்.',
      tsa: 'TSA அனைத்து முகங்களின் கூட்டுத்தொகை என்பதால் எல்லா வெளிப் பரப்புகளும் ஒளிரும்.',
      volume: 'வடிவத்தின் உள்ளே உள்ள ஒளிபுகும் நிரப்பு 3D கன அளவைக் காட்டுகிறது.',
    },
    canvasHint:
      'சுழற்ற இழுக்கவும் · பெரிதாக்க ஸ்க்ரோல்/பின்ச் செய்யவும் · முகத்தைத் தட்டவும்',
    noNetCanvasHint:
      'சுழற்ற இழுக்கவும் · பெரிதாக்க ஸ்க்ரோல்/பின்ச் செய்யவும் · வளைந்த 3D வடிவம்',
    resetCamera: 'பார்வை மீட்டமை',
    volumeFoldHint: 'முழு கன அளவைக் காண 100% வரை மடிக்கவும்',
    tapFaceHint: 'ஆய்வு செய்ய வலையில் அல்லது பட்டியலில் ஒரு முகத்தைத் தட்டவும்',
    clearSelection: 'அழி',
    selectedFacePrefix: 'தேர்ந்தெடுக்கப்பட்டது',
    faceBadgePrefix: 'முகம்',
    sideWallPrefix: 'சுவர்',
    faceNames: {
      bottom: 'அடிப்பகுதி',
      front: 'முன்பக்கம்',
      back: 'பின்பக்கம்',
      top: 'மேற்பகுதி',
      left: 'இடப்பக்கம்',
      right: 'வலப்பக்கம்',
      lateral: 'வளைந்த பரப்பு',
      surface: 'வளைந்த பரப்பு',
    },
    faceRoles: {
      base: 'அடிப்பகுதி',
      top: 'மேற்பகுதி',
      lateral: 'பக்க முகம்',
      curved: 'வளைந்த பரப்பு',
      face: 'முக்கோண முகம்',
    },
    faceBreakdownTitle: 'முகப் பரப்பளவுகள் (வலை பிரிப்பு)',
    sumOfFacesLabel: 'அனைத்து முகங்களின் கூட்டுத்தொகை = TSA',
    sphereSurfaceBreakdownNote:
      'எல்லா திசைகளிலும் தொடர்ச்சியான ஒரே வளைந்த மேற்பரப்பு',
    formulaCardTitle: 'படிப்படியான சூத்திரங்கள் மற்றும் பிரதியிடல்',
    slantHeightStepLabel: 'சாய்வு உயரம்',
    volumeLabel: 'கன அளவு (Volume)',
    lsaLabel: 'பக்கப் பரப்பளவு (LSA)',
    csaLabel: 'வளைபரப்பு (CSA)',
    tsaLabel: 'மொத்தப் பரப்பளவு (TSA)',
    surfaceAreaLabel: 'மேற்பரப்பளவு (TSA)',
    lsaExcludedTitle: 'LSA-இல் அடி/மேல் பகுதிகள் ஏன் விலக்கப்படுகின்றன',
    lsaExclusionNote: {
      cube: 'LSA 4 பக்கச் சுவர்களை (4a²) மட்டுமே கணக்கிடுகிறது. மேல் + அடி (2a²) விலக்கப்படும்.',
      cuboid:
        'LSA 4 பக்கச் சுவர்களை 2h(l + b) மட்டுமே கணக்கிடுகிறது. மேல் + அடி (2lb) விலக்கப்படும்.',
      cylinder:
        'CSA வளைந்த செவ்வகச் சுவரை (2πrh) மட்டுமே கணக்கிடுகிறது. இரு வட்ட மூடிகள் (2πr²) விலக்கப்படும்.',
      cone: 'LSA வளைந்த கூம்புப் பகுதியை (πrl) மட்டுமே கணக்கிடுகிறது. வட்ட அடிப்பகுதி (πr²) விலக்கப்படும்.',
      square_pyramid:
        'LSA 4 முக்கோண முகங்களை (2as) மட்டுமே கணக்கிடுகிறது. சதுர அடிப்பகுதி (a²) விலக்கப்படும்.',
      sphere: 'கோளத்திற்குப் பொருந்தாது',
      triangular_prism:
        'LSA 3 செவ்வகச் சுவர்களை (3ah) மட்டுமே கணக்கிடுகிறது. இரு முக்கோண மூடிகள் விலக்கப்படும்.',
      pentagonal_prism:
        'LSA 5 செவ்வகச் சுவர்களை (5ah) மட்டுமே கணக்கிடுகிறது. இரு ஐங்கோண மூடிகள் விலக்கப்படும்.',
      hexagonal_prism:
        'LSA 6 செவ்வகச் சுவர்களை (6ah) மட்டுமே கணக்கிடுகிறது. இரு அறுங்கோண மூடிகள் விலக்கப்படும்.',
      triangular_pyramid:
        'LSA 3 முக்கோண பக்க முகங்களை ((3/2)as) மட்டுமே கணக்கிடுகிறது. முக்கோண அடி விலக்கப்படும்.',
      pentagonal_pyramid:
        'LSA 5 முக்கோண பக்க முகங்களை ((5/2)as) மட்டுமே கணக்கிடுகிறது. ஐங்கோண அடி விலக்கப்படும்.',
      hexagonal_pyramid:
        'LSA 6 முக்கோண பக்க முகங்களை (3as) மட்டுமே கணக்கிடுகிறது. அறுங்கோண அடி விலக்கப்படும்.',
      hemisphere:
        'CSA வளைந்த அரைக்கோளக் குவிமாடத்தை (2πr²) மட்டுமே கணக்கிடுகிறது. தட்டை வட்ட அடி (πr²) விலக்கப்படும்.',
      frustum:
        'LSA வளைந்த சாய்வுப் பரப்பை π(r₁ + r₂)l மட்டுமே கணக்கிடுகிறது. இரு வட்ட மூடிகள் (πr₁² + πr₂²) விலக்கப்படும்.',
      octahedron:
        'பொருந்தாது (அனைத்து 8 சமபக்க முக்கோண முகங்களும் சமமானவை; TSA = 2√3a²)',
    },
    excludedCapsLabel: 'விலக்கப்பட்டது',
    learningPanelTitle: 'வடிவக் கற்றல் வழிகாட்டி',
    definitionLabel: 'வரையறை',
    geometryStatsLabel: 'பண்புகள் (முகங்கள், விளிம்புகள், உச்சிகள்)',
    facesStatLabel: 'முகங்கள் / பரப்புகள்',
    edgesStatLabel: 'விளிம்புகள்',
    verticesStatLabel: 'உச்சிகள்',
    importantDimensionsLabel: 'முக்கிய அளவுகள்',
    workedExampleLabel: 'தீர்க்கப்பட்ட எடுத்துக்காட்டு',
    realWorldExampleLabel: 'நடைமுறைப் பயன்பாடு',
    didYouKnowLabel: 'உங்களுக்குத் தெரியுமா?',
    guideLabels: {
      radius: 'ஆரம் (r)',
      height: 'உயரம் (h)',
      slantL: 'சாய்வு (l)',
      slantS: 'சாய்வு (s)',
    },
    learningByShape: {
      cube: {
        definition:
          'கனசதுரம் என்பது செங்கோணங்களில் சந்திக்கும் ஆறு சமமான சதுர முகங்களால் ஆன 3D வடிவமாகும்.',
        faces: '6 சதுர முகங்கள்',
        edges: '12 சம விளிம்புகள்',
        vertices: '8 உச்சிகள்',
        dimensionsSummary:
          'நீளம் = அகலம் = உயரம் = a என்பதால் ஒரே ஒரு விளிம்பு அளவு (a) முழு கனசதுரத்தையும் தீர்மானிக்கிறது.',
        workedExample:
          'a = 5 செ.மீ எனில்: LSA = 100 செ.மீ², TSA = 150 செ.மீ², கன அளவு = 125 செ.மீ³.',
        realWorldExample: 'ரூபிக்ஸ் கியூப், தாயக்கட்டை, பரிசுப் பெட்டி மற்றும் பனிக்கட்டி.',
        didYouKnow:
          '6 இணைக்கப்பட்ட சதுரங்களால் ஆன 11 வெவ்வேறு தட்டை வலைகள் ஒரே கனசதுரமாக மடிகின்றன.',
      },
      cuboid: {
        definition:
          'கனசெவ்வகம் என்பது எதிரெதிர் முகங்கள் சமமாக உள்ள ஆறு செவ்வக முகங்களால் ஆன 3D பெட்டியாகும்.',
        faces: '6 செவ்வக முகங்கள்',
        edges: '12 விளிம்புகள் (l, b, h தலா 4)',
        vertices: '8 உச்சிகள்',
        dimensionsSummary:
          'நீளம் (l), அகலம் (b), மற்றும் உயரம் (h) ஆகிய மூன்று செங்குத்து அளவுகளால் வரையறுக்கப்படுகிறது.',
        workedExample:
          'l = 10, b = 6, h = 4 செ.மீ: LSA = 128 செ.மீ², TSA = 248 செ.மீ², கன அளவு = 240 செ.மீ³.',
        realWorldExample: 'பாடப்புத்தகம், செங்கல், காலணிப் பெட்டி மற்றும் பென்சில் பெட்டி.',
        didYouKnow:
          'l = b = h ஆகும்போது கனசெவ்வகம் கனசதுரமாகும்; இதன் 4 பக்கச் சுவர்களை விரித்தால் 2(l + b) நீளமுள்ள செவ்வகம் கிடைக்கும்.',
      },
      cylinder: {
        definition:
          'நேர் வட்ட உருளை என்பது வளைந்த பக்க மேற்பரப்பால் இணைக்கப்பட்ட இரண்டு சமமான இணை வட்ட அடிப்பகுதிகளைக் கொண்டது.',
        faces: '3 பரப்புகள் (2 வட்டங்கள் + 1 வளைந்த சுவர்)',
        edges: '2 வட்ட விளிம்புகள்',
        vertices: '0 உச்சிகள்',
        dimensionsSummary:
          'அடி ஆரம் (r) மற்றும் உயரம் (h) ஆகியவற்றால் வரையறுக்கப்படுகிறது. வளைந்த சுவரை விரித்தால் 2πr அகலமுள்ள செவ்வகம் உருவாகும்.',
        workedExample:
          'r = 3, h = 5 செ.மீ: CSA = 30π ≈ 94.25 செ.மீ², TSA = 48π ≈ 150.80 செ.மீ², V = 45π ≈ 141.37 செ.மீ³.',
        realWorldExample: 'தண்ணீர் தொட்டி, எஃகு டம்ளர், குழாய் மற்றும் டின் கேன்.',
        didYouKnow:
          'உருளையின் விரிக்கப்பட்ட செவ்வகத்தின் அகலம் வட்ட அடிப்பகுதியின் சுற்றளவுக்கு (2πr) சமம், எனவே CSA = 2πrh.',
      },
      cone: {
        definition:
          'நேர் வட்டக் கூம்பு தட்டையான வட்ட அடிப்பகுதியிலிருந்து அதன் மையத்திற்கு மேலே உள்ள ஒரு கூர்மையான உச்சிக்குச் சுருங்குகிறது.',
        faces: '2 பரப்புகள் (1 வட்ட அடி + 1 வளைந்த பரப்பு)',
        edges: '1 வட்ட விளிம்பு',
        vertices: '1 கூர் உச்சி',
        dimensionsSummary:
          'ஆரம் (r), செங்குத்து உயரம் (h), மற்றும் சாய்வு உயரம் l = √(r² + h²) ஆகியவற்றால் வரையறுக்கப்படுகிறது.',
        workedExample:
          'r = 3, h = 4 செ.மீ: l = 5 செ.மீ; LSA = 15π ≈ 47.12 செ.மீ², TSA = 24π ≈ 75.40 செ.மீ², V = 12π ≈ 37.70 செ.மீ³.',
        realWorldExample: 'ஐஸ்கிரீம் கோன், சாலை போக்குவரத்து கூம்பு, புனல் மற்றும் பிறந்தநாள் தொப்பி.',
        didYouKnow:
          'ஒரே ஆரம் மற்றும் உயரம் கொண்ட உருளையின் கன அளவில் சரியாக மூன்றில் ஒரு பங்கு (1/3) கன அளவைக் கூம்பு கொண்டுள்ளது!',
      },
      square_pyramid: {
        definition:
          'சதுர பிரமிடு ஒரு சதுர அடிப்பகுதியையும் ஒரே உச்சியில் சந்திக்கும் நான்கு சமமான இருசமபக்க முக்கோண முகங்களையும் கொண்டுள்ளது.',
        faces: '5 முகங்கள் (1 சதுர அடி + 4 முக்கோணங்கள்)',
        edges: '8 விளிம்புகள் (4 அடி + 4 சாய்வு)',
        vertices: '5 உச்சிகள் (4 அடி + 1 மேல் உச்சி)',
        dimensionsSummary:
          'அடிப்பக்க அளவு (a), செங்குத்து உயரம் (h), மற்றும் முக்கோண சாய்வு உயரம் s = √(h² + (a/2)²) ஆகியவற்றால் வரையறுக்கப்படுகிறது.',
        workedExample:
          'a = 6, h = 4 செ.மீ: s = 5 செ.மீ; LSA = 60 செ.மீ², TSA = 96 செ.மீ², கன அளவு = 48 செ.மீ³.',
        realWorldExample: 'எகிப்தின் கிசா பிரமிடு மற்றும் நான்கு பக்கக் கூடாரக் கூரை.',
        didYouKnow:
          'உருளைக்குள் கூம்பு போல, ஒரே அடிப்பகுதி மற்றும் உயரம் கொண்ட கனசெவ்வகத்தின் கன அளவில் 1/3 பங்கு சதுர பிரமிடுக்கு உண்டு.',
      },
      sphere: {
        definition:
          'கோளம் என்பது அதன் மேற்பரப்பில் உள்ள ஒவ்வொரு புள்ளியும் மையத்திலிருந்து சம தொலைவில் (ஆரம் r) உள்ள முழுமையான உருண்டை வடிவமாகும்.',
        faces: '1 தொடர்ச்சியான வளைந்த பரப்பு',
        edges: '0 விளிம்புகள்',
        vertices: '0 உச்சிகள்',
        dimensionsSummary:
          'மையத்திலிருந்து மேற்பரப்பு வரையிலான ஒரே அளவு ஆரம் (r) மூலம் முழுமையாக வரையறுக்கப்படுகிறது (விட்டம் = 2r).',
        workedExample:
          'r = 7 செ.மீ எனில்: மேற்பரப்பளவு = 196π ≈ 615.75 செ.மீ², கன அளவு = (4/3)π(7³) ≈ 1436.76 செ.மீ³.',
        realWorldExample: 'கிரிக்கெட் பந்து, கால்பந்து, கோலி மற்றும் உலக உருண்டை.',
        didYouKnow:
          'கோளத்தை இழுக்காமல் அல்லது கிழிக்காமல் தட்டையான வலையாக மாற்ற முடியாது—அதனால்தான் உலக வரைபடங்களில் கண்டங்கள் சற்றே மாறித் தெரிகின்றன!',
      },
      triangular_prism: {
        definition:
          'முக்கோண அரியம் மூன்று செவ்வக பக்க முகங்களால் இணைக்கப்பட்ட இரண்டு சமமான இணை முக்கோண அடிப்பகுதிகளைக் கொண்டது.',
        faces: '5 முகங்கள் (2 முக்கோணங்கள் + 3 செவ்வகங்கள்)',
        edges: '9 விளிம்புகள்',
        vertices: '6 உச்சிகள்',
        dimensionsSummary:
          'சமபக்க முக்கோணப் பக்கம் (a) மற்றும் அரியம் உயரம் (h) மூலம் வரையறுக்கப்படுகிறது. அடி பரப்பு = (√3/4)a².',
        workedExample:
          'a = 4, h = 5 செ.மீ: அடி ≈ 6.93 செ.மீ², LSA = 60 செ.மீ², TSA ≈ 73.86 செ.மீ², V ≈ 34.64 செ.மீ³.',
        realWorldExample: 'கண்ணாடி முப்பட்டகம், சாக்லேட் பெட்டி மற்றும் A-வடிவ கூடாரம்.',
        didYouKnow:
          'ஒரு கனசெவ்வகத்தை மூலைவிட்டமாக வெட்டினால் அது இரண்டு சம முக்கோண அரியங்களாகப் பிரியும்!',
      },
      triangular_pyramid: {
        definition:
          'முக்கோண பிரமிடு (நான்முகன்) ஒரு முக்கோண அடிப்பகுதியையும் ஒரே உச்சியில் சந்திக்கும் மூன்று முக்கோண முகங்களையும் கொண்டுள்ளது.',
        faces: '4 முக்கோண முகங்கள்',
        edges: '6 விளிம்புகள்',
        vertices: '4 உச்சிகள்',
        dimensionsSummary:
          'அடி பக்கம் (a), உயரம் (h), மற்றும் சாய்வு உயரம் s மூலம் வரையறுக்கப்படுகிறது. h = a√(2/3) ஆகும்போது ஒழுங்கு நான்முகன் ஆகும்.',
        workedExample:
          'a = 6, h = 5 செ.மீ: அடி ≈ 15.59 செ.மீ², s ≈ 5.29 செ.மீ, LSA ≈ 47.62 செ.மீ², TSA ≈ 63.21 செ.மீ², V ≈ 25.98 செ.மீ³.',
        realWorldExample: 'டெட்ரா பேக் பால் அட்டைப் பெட்டி மற்றும் மீத்தேன் (CH₄) மூலக்கூறு வடிவம்.',
        didYouKnow:
          '4 சமதள முகங்களுக்குக் குறைவாகக் கொண்டு எந்த 3D பன்முக வடிவத்தையும் உருவாக்க முடியாது!',
      },
      pentagonal_prism: {
        definition:
          'ஐங்கோண அரியம் ஐந்து செவ்வக பக்க முகங்களால் இணைக்கப்பட்ட இரண்டு ஒழுங்கு ஐங்கோண அடிப்பகுதிகளைக் கொண்டது.',
        faces: '7 முகங்கள் (2 ஐங்கோணங்கள் + 5 செவ்வகங்கள்)',
        edges: '15 விளிம்புகள்',
        vertices: '10 உச்சிகள்',
        dimensionsSummary:
          'ஐங்கோண பக்கம் (a) மற்றும் உயரம் (h) மூலம் வரையறுக்கப்படுகிறது. அடி = (5a²) / (4 tan 36°).',
        workedExample:
          'a = 4, h = 6 செ.மீ: அடி ≈ 27.53 செ.மீ², LSA = 120 செ.மீ², TSA ≈ 175.06 செ.மீ², V ≈ 165.17 செ.மீ³.',
        realWorldExample: '5-பக்கக் கட்டிடங்கள், சிறப்பு போல்ட் மற்றும் பென்சில் ஸ்டாண்ட்.',
        didYouKnow:
          'அமெரிக்காவின் பென்டகன் கட்டிடம் ஒரு ஐங்கோண அரியத்தின் வடிவத்தைக் கொண்டுள்ளது!',
      },
      hexagonal_prism: {
        definition:
          'அறுங்கோண அரியம் ஆறு செவ்வக பக்க முகங்களால் இணைக்கப்பட்ட இரண்டு ஒழுங்கு அறுங்கோண அடிப்பகுதிகளைக் கொண்டது.',
        faces: '8 முகங்கள் (2 அறுங்கோணங்கள் + 6 செவ்வகங்கள்)',
        edges: '18 விளிம்புகள்',
        vertices: '12 உச்சிகள்',
        dimensionsSummary:
          'அறுங்கோண பக்கம் (a) மற்றும் உயரம் (h) மூலம் வரையறுக்கப்படுகிறது. அடி = (3√3/2)a².',
        workedExample:
          'a = 4, h = 5 செ.மீ: அடி ≈ 41.57 செ.மீ², LSA = 120 செ.மீ², TSA ≈ 203.14 செ.மீ², V ≈ 207.85 செ.மீ³.',
        realWorldExample: 'அறுங்கோண பென்சில், தேன்கூடு அறைகள் மற்றும் நட்டு/போல்ட்.',
        didYouKnow:
          'குறைந்த மெழுகைப் பயன்படுத்தி இடைவெளியின்றி இடத்தை நிரப்ப தேனீக்கள் அறுங்கோண அரியங்களைக் கட்டுகின்றன!',
      },
      pentagonal_pyramid: {
        definition:
          'ஐங்கோண பிரமிடு ஒரு ஒழுங்கு ஐங்கோண அடிப்பகுதியையும் ஒரே உச்சியில் சேரும் ஐந்து முக்கோண முகங்களையும் கொண்டுள்ளது.',
        faces: '6 முகங்கள் (1 ஐங்கோணம் + 5 முக்கோணங்கள்)',
        edges: '10 விளிம்புகள்',
        vertices: '6 உச்சிகள்',
        dimensionsSummary:
          'அடி பக்கம் (a), உயரம் (h), மற்றும் சாய்வு உயரம் s = √(h² + (a / (2 tan 36°))²) மூலம் வரையறுக்கப்படுகிறது.',
        workedExample:
          'a = 4, h = 6 செ.மீ: அடி ≈ 27.53 செ.மீ², s ≈ 6.60 செ.மீ, LSA ≈ 66.04 செ.மீ², TSA ≈ 93.56 செ.மீ², V ≈ 55.06 செ.மீ³.',
        realWorldExample: 'நட்சத்திர விளக்குகள், கோபுர உச்சி மற்றும் மண்டபக் கூரை.',
        didYouKnow:
          'இது யூலரின் F + V - E = 2 விதியை நிறைவு செய்கிறது: 6 + 6 - 10 = 2!',
      },
      hexagonal_pyramid: {
        definition:
          'அறுங்கோண பிரமிடு ஒரு ஒழுங்கு அறுங்கோண அடிப்பகுதியையும் ஒரே உச்சியில் சேரும் ஆறு முக்கோண முகங்களையும் கொண்டுள்ளது.',
        faces: '7 முகங்கள் (1 அறுங்கோணம் + 6 முக்கோணங்கள்)',
        edges: '12 விளிம்புகள்',
        vertices: '7 உச்சிகள்',
        dimensionsSummary:
          'அடி பக்கம் (a), உயரம் (h), மற்றும் சாய்வு உயரம் s = √(h² + (√3a/2)²) மூலம் வரையறுக்கப்படுகிறது.',
        workedExample:
          'a = 4, h = 3 செ.மீ: அடி ≈ 41.57 செ.மீ², s ≈ 4.58 செ.மீ, LSA ≈ 54.99 செ.மீ², TSA ≈ 96.56 செ.மீ², V ≈ 41.57 செ.மீ³.',
        realWorldExample: 'அறுபக்கக் கூடாரம், குவார்ட்ஸ் படிக முனை மற்றும் குடைக் கூரை.',
        didYouKnow:
          'அறுங்கோண பிரமிடில் முகங்களின் எண்ணிக்கையும் உச்சிகளின் எண்ணிக்கையும் சமம் (7 + 7 - 12 = 2)!',
      },
      hemisphere: {
        definition:
          'அரைக்கோளம் என்பது கோளத்தை மையத்தின் வழியே பாதியாக வெட்டும்போது கிடைக்கும் ஒரு வளைந்த குவிமாடமும் ஒரு வட்ட அடிப்பகுதியும் ஆகும்.',
        faces: '2 பரப்புகள் (1 வட்ட அடி + 1 வளைந்த குவிமாடம்)',
        edges: '1 வட்ட விளிம்பு',
        vertices: '0 உச்சிகள்',
        dimensionsSummary:
          'ஆரம் (r) மூலம் மட்டுமே வரையறுக்கப்படுகிறது. CSA = 2πr², வட்ட அடியுடன் சேர்த்து TSA = 3πr².',
        workedExample:
          'r = 7 செ.மீ: CSA = 98π ≈ 307.88 செ.மீ², TSA = 147π ≈ 461.81 செ.மீ², V = (686/3)π ≈ 718.38 செ.மீ³.',
        realWorldExample: 'கிண்ணம், கோளரங்கக் குவிமாடம், இக்லூ மற்றும் பாதி வெட்டிய தர்பூசணி.',
        didYouKnow:
          'கோளத்தை இரண்டாக வெட்டும்போது πr² பரப்புள்ள புதிய வட்ட முகம் உருவாகிறது, எனவே இரு அரைக்கோளங்களின் மொத்தப் பரப்பு 6πr² ஆகும்!',
      },
      frustum: {
        definition:
          'கூம்பின் இடைக்கண்டம் (Frustum) என்பது கூம்பின் மேல் பகுதியை அடிக்கு இணையாக வெட்டி நீக்கிய பின் மிஞ்சும் திட வடிவமாகும்.',
        faces: '3 பரப்புகள் (2 இணை வட்டங்கள் + 1 வளைந்த சுவர்)',
        edges: '2 வட்ட விளிம்புகள்',
        vertices: '0 உச்சிகள்',
        dimensionsSummary:
          'கீழ் ஆரம் (r₁), மேல் ஆரம் (r₂), உயரம் (h), மற்றும் சாய்வு உயரம் l = √(h² + (r₁ - r₂)²) மூலம் வரையறுக்கப்படுகிறது.',
        workedExample:
          'r₁ = 6, r₂ = 3, h = 4 செ.மீ: l = 5 செ.மீ; LSA = 45π ≈ 141.37 செ.மீ², TSA = 90π ≈ 282.74 செ.மீ², V = 84π ≈ 263.89 செ.மீ³.',
        realWorldExample: 'பிளாஸ்டிக் வாளி, காபி கப், ஒலிபெருக்கி கூம்பு மற்றும் விளக்குத் திரை.',
        didYouKnow:
          'r₁ = r₂ ஆகும்போது இடைக்கண்டத்தின் சூத்திரங்கள் தானாகவே உருளையின் சூத்திரங்களாக மாறிவிடும்!',
      },
      octahedron: {
        definition:
          'ஒழுங்கு எண்முகன் என்பது ஒவ்வொரு உச்சியிலும் நான்கு முக்கோணங்கள் சந்திக்கும் எட்டு சமபக்க முக்கோணங்களால் ஆன பிளேட்டானிக் வடிவமாகும்.',
        faces: '8 சமபக்க முக்கோண முகங்கள்',
        edges: '12 சம விளிம்புகள்',
        vertices: '6 உச்சிகள்',
        dimensionsSummary:
          'ஒரே ஒரு விளிம்பு நீளம் (a) மூலம் வரையறுக்கப்படுகிறது. இது அடிப்பகுதியால் இணைக்கப்பட்ட இரு சதுர பிரமிடுகளுக்குச் சமம்.',
        workedExample:
          'a = 6 செ.மீ: TSA = 72√3 ≈ 124.71 செ.மீ², கன அளவு = 72√2 ≈ 101.82 செ.மீ³.',
        realWorldExample: '8-பக்க ஆட்டத் தாயக்கட்டை (d8) மற்றும் இயற்கை வைர/ஃப்ளோரைட் படிகங்கள்.',
        didYouKnow:
          'கனசதுரத்தின் 6 முகங்களின் மையங்களை இணைத்தால் சரியாக ஒரு ஒழுங்கு எண்முகன் கிடைக்கும்!',
      },
    },
    navTabs: {
      ariaLabel: 'பயன்பாட்டு பணித்தளம்',
      explorer: 'வடிவ ஆய்வகம்',
      netlab: 'நெட் ஆய்வகம் (Net Lab)',
      tutor: 'AI ஆசிரியர்',
      missions: 'இலக்குகள்',
      practice: 'வகுப்பு 10 பயிற்சி',
      hub: 'முன்னேற்றம் & வழிகாட்டி',
    },
    netLab: {
      headerTitle: 'நிலை 2 · செயல்முறை நெட் & அளவு மாற்ற ஆய்வகம்',
      headerSubtitle:
        '11 கனசதுர நெட்டுகள், நெட் சோதனை விளையாட்டு, கனசெவ்வகம் & உருளை நெட்டுகள், 6-படி வரைபடம் மற்றும் k² / k³ வளர்ச்சியைக் காணுங்கள்.',
      subTabs: {
        gallery: '11 கனசதுர நெட்டுகள்',
        checker: 'நெட் சோதனை விளையாட்டு',
        cuboid: 'கனசெவ்வக நெட்',
        cylinder: 'உருளை நெட்',
        draw: 'நெட் வரையும் வழிகாட்டி',
        scale: 'கன அளவு வளர்ச்சி',
      },
      gallery: {
        title: 'கணித ரீதியாகச் சரியான 11 கனசதுர நெட்டுகள்',
        subtitle:
          'எந்த நெட்டையும் தேர்ந்தெடுத்து அதன் 2D அமைப்பும் 6 முகங்களும் கனசதுரமாக மடிவதைப் பாருங்கள்.',
        selectNetHint: '11 நெட்டுகளில் ஒன்றைத் தேர்ந்தெடுக்கவும்',
        familyLabel: 'குடும்பம்',
        animatePlay: 'தானியங்கு மடிப்பு',
        animatePause: 'நிறுத்து',
        selectedLabel: 'தேர்ந்தெடுத்த நெட்',
        families: {
          '1-4-1': '1-4-1 வரிசை (6 நெட்டுகள்)',
          '2-3-1': '2-3-1 நிலை (3 நெட்டுகள்)',
          '2-2-2': '2-2-2 படிக்கட்டு (1 நெட்)',
          '3-3': '3-3 இரட்டைப் பட்டை (1 நெட்)',
        },
        nets: {
          net_1_4_1_cross: {
            name: '1. சிலுவை வடிவம் (Cross)',
            tip: 'நடு 4 சதுரங்கள் பக்கச் சுவர்களாகவும் எதிரெதிர் 2 மடல்கள் அடி & மேலாகவும் மடியும்.',
          },
          net_1_4_1_same_end: {
            name: '2. ஒரே முனை மடல்கள்',
            tip: '4-சதுரப் பட்டையின் ஒரே நெடுவரிசையில் இரு பக்கங்களிலும் மூடிகள் உள்ளன.',
          },
          net_1_4_1_step_01: {
            name: '3. 1-படி நகர்வு',
            tip: 'மேல்-கீழ் மடல்கள் 1 சதுரம் நகர்ந்திருந்தாலும் எதிரெதிர் முகங்களாக மூடும்.',
          },
          net_1_4_1_step_02: {
            name: '4. 2-படி நகர்வு',
            tip: 'இரு நெடுவரிசை தள்ளியிருந்தாலும் 4-சதுரச் சுழற்சி அவற்றை எதிராக்கும்.',
          },
          net_1_4_1_opposite_ends: {
            name: '5. எதிர் முனைகள்',
            tip: 'அதிகபட்ச இடைவெளியுடன் மேற்படிதல் இன்றி முழு கனசதுரமாக மூடும்.',
          },
          net_1_4_1_zigzag: {
            name: '6. நடு ஜிக்ஜாக்',
            tip: 'நடுப் பட்டையின் 2 மற்றும் 3-ஆம் சதுரங்களில் இணைந்த 1-4-1 வடிவம்.',
          },
          net_2_3_1_a: {
            name: '7. 2-3-1 அருகிலுள்ள மூடி',
            tip: '3 சதுரங்கள் மூன்று பக்கங்களை மூட, 2-சதுரக் கால் மற்ற பக்கங்களை மூடும்.',
          },
          net_2_3_1_b: {
            name: '8. 2-3-1 நடு மூடி',
            tip: 'மேல் மடல் நடு சதுரத்தின் மேலே இருந்தாலும் அனைத்து 6 முகங்களையும் நிரப்பும்.',
          },
          net_2_3_1_c: {
            name: '9. 2-3-1 தொலைவு மூடி',
            tip: 'வலது முனை மடலும் கீழ் L-பட்டையும் எதிரெதிர் முகங்களை மூடும்.',
          },
          net_2_2_2_stairs: {
            name: '10. படிக்கட்டு வடிவம் (2-2-2)',
            tip: 'வலது-கீழ் திருப்பங்கள் கனசதுரத்தைச் சுற்றிச் சுருளாக மடியும்.',
          },
          net_3_3_twin: {
            name: '11. இரட்டைப் பட்டைகள் (3-3)',
            tip: 'இரு 3-சதுரப் பட்டைகள் ஒரு விளிம்பில் இணைந்து கனசதுரத்தின் பாதிப் பாதியை மூடும்.',
          },
        },
      },
      checker: {
        title: 'நெட் சோதனைச் சவால்',
        subtitle:
          'ஒவ்வொரு 2D வடிவமும் மேற்படிதல் இன்றி முழு கனசதுரமாக மடியுமா எனச் சோதிக்கவும்.',
        question: 'இது கனசதுரமாக மடியுமா?',
        yesButton: 'ஆம், மடியும்',
        noButton: 'இல்லை, மடியாது',
        correctBadge: 'சரி!',
        wrongBadge: 'தவறு — காரணத்தைப் பாருங்கள்:',
        nextPuzzle: 'அடுத்த வடிவம்',
        playAgain: 'மீண்டும் விளையாடு',
        resetProgress: 'முன்னேற்றத்தை மீட்டமை',
        scoreLabel: 'மதிப்பெண்',
        streakLabel: 'தொடர் வெற்றி',
        bestLabel: 'சிறந்த மதிப்பெண்',
        progressLabel: 'வடிவம்',
        completedTitle: 'நெட் சோதனை முடிந்தது!',
        completedSummary: 'அனைத்து 12 கனசதுர நெட் சோதனைகளையும் முடித்துவிட்டீர்கள்.',
        foldIn3D: '3D-யில் மடித்துப் பார்',
        hide3D: '3D காட்சியை மறை',
        explanations: {
          valid141:
            'சரியான 1-4-1 நெட்: நடு 4 சதுரங்கள் சுற்ற, இரு பக்க மடல்கள் மேல் & அடியை மூடும்.',
          valid231:
            'சரியான 2-3-1 நெட்: மேற்படிதல் இன்றி ஒவ்வொரு சதுரமும் தனி முகமாக மடியும்.',
          valid222:
            'சரியான 2-2-2 படிக்கட்டு நெட்: மாற்றுத் திருப்பங்கள் 6 முகங்களையும் நிரப்பும்.',
          valid33:
            'சரியான 3-3 நெட்: ஒவ்வொரு 3-சதுரத் தொகுதியும் ஒரு முனையில் கூடும் 3 முகங்களை மூடும்.',
          validOppositeEnds:
            'சரியான 1-4-1 எதிர் முனை நெட்: இரு முனை மடல்களும் எதிரெதிர் மூடிகளாகச் சேரும்.',
          invalidSameSide:
            'தவறு! இரு மடல்களும் ஒரே பக்கத்தில் உள்ளதால் ஒன்றின் மீது ஒன்று மோதும்; எதிர் பக்கம் திறந்திருக்கும்.',
          invalidLine:
            'தவறு! நேர் வரிசையில் உள்ள 6 சதுரங்கள் ஒரே 4 முகங்களை இருமுறை சுற்றி இடது-வலதைத் திறந்துவிடும்.',
          invalid2x2:
            'தவறு! 2×2 சதுரத் தொகுதி இருந்தால் மடிக்கும்போது முகங்கள் ஒன்றோடு ஒன்று மோதும்.',
          invalidDisconnected:
            'தவறு! சதுரங்கள் பொது விளிம்பு இன்றி மூலைகளில் மட்டுமே தொடுகின்றன.',
          invalidURing:
            'தவறு! U/C வளைவில் இரு சதுரங்கள் ஒரே இடத்தில் மேற்படிகின்றன.',
          invalidCount:
            'தவறு! இங்கு 5 சதுரங்கள் மட்டுமே உள்ளன; கனசதுரத்திற்கு எப்போதும் 6 முகங்கள் தேவை.',
        },
      },
      cuboid: {
        title: 'பெயரிடப்பட்ட சிலுவை வடிவ கனசெவ்வக நெட்',
        subtitle:
          'l, b, h அளவுகளை மாற்றி எதிர் செவ்வக ஜோடிகள் எவ்வாறு TSA ஆகின்றன எனப் பாருங்கள்.',
        pairBaseTop: 'அடி & மேல் (l × b)',
        pairFrontBack: 'முன் & பின் (l × h)',
        pairLeftRight: 'இடது & வலது (h × b)',
        totalTsaLabel: 'மொத்தப் புறப்பரப்பளவு (6 செவ்வகங்களின் கூட்டு)',
        openIn3D: '3D கனசெவ்வகத்தில் திற',
      },
      cylinder: {
        title: 'உருளை நெட்: 1 செவ்வகம் + 2 வட்டங்கள்',
        subtitle:
          'உருளையை விரித்தால் ஒரு செவ்வகமும் இரு சம வட்டங்களும் கிடைக்கும்.',
        rectLabel: 'வளைந்த சுவர் (செவ்வகம்)',
        circleTopLabel: 'மேல் வட்டம்',
        circleBottomLabel: 'அடி வட்டம்',
        circumferenceRuleTitle: 'செவ்வக நீளம் = 2πr ஏன்?',
        circumferenceRuleBody:
          'குழாயாக சுருட்டும்போது செவ்வகத்தின் அகலம் வட்டத்தின் சுற்றளவைச் சரியாகச் சுற்ற வேண்டும்—எனவே அதன் நீளம் 2πr க்குச் சமம்!',
        rectWidthLabel: 'செவ்வக அகலம் = சுற்றளவு (2πr)',
        rectHeightLabel: 'செவ்வக உயரம் (h)',
        circleRadiusLabel: 'வட்ட ஆரம் (r)',
        capAreaLabel: 'ஒரு வட்டப் பரப்பு (πr²)',
        curvedAreaLabel: 'செவ்வகப் பரப்பு (2πr × h = 2πrh)',
        openIn3D: '3D உருளை ஆய்வகத்தில் திற',
      },
      draw: {
        title: '6 எளிய படிகளில் நெட் வரையவும்',
        subtitle:
          'எந்த 3D வடிவத்தின் 2D நெட்டையும் காகிதத்தில் வரைய இந்த 6 படிகளைப் பின்பற்றவும்.',
        stepPrefix: 'படி',
        previous: 'முந்தையது',
        next: 'அடுத்தது',
        restart: 'மீண்டும் தொடங்கு',
        finishMessage: 'எந்த 3D நெட்டையும் வரைந்து சரிபார்க்கத் தயார்!',
        steps: {
          s1: {
            title: '1. பிரித்த வடிவத்தைக் கற்பனை செய்',
            body: 'ஒரு அட்டைப் பெட்டியின் விளிம்புகளை வெட்டி மேசையில் சமமாக விரிப்பதைக் கற்பனை செய்யுங்கள்.',
            checklist: 'இணைக்கப்பட்ட மடிப்பு விளிம்புகள் ஒட்டியே இருக்கும்.',
          },
          s2: {
            title: '2. முகங்களை அடையாளம் காண்க',
            body: 'அனைத்து முகங்களையும் எண்ணுங்கள்: கனசதுரம் 6 சதுரங்கள், கனசெவ்வகம் 3 செவ்வக ஜோடிகள், உருளை 1 செவ்வகம் + 2 வட்டங்கள்.',
            checklist: 'ஒவ்வொரு முகத்தின் நீளம் & அகலத்தைக் குறித்துக்கொள்க.',
          },
          s3: {
            title: '3. அடிப்பக்கத்தை வரைக',
            body: 'தாளின் நடுவில் சரியான அளவுகளுடன் அடி முகத்தை முதலில் வரையவும்.',
            checklist: 'நான்கு பக்கங்களிலும் மடல்களை வரைய இடம் விடவும்.',
          },
          s4: {
            title: '4. பக்க முகங்களை இணைக்க',
            body: 'அடியின் விளிம்புகளுடன் சம நீளமுள்ள பக்கச் சுவர்களை நேரடியாக இணைத்து வரையவும்.',
            checklist: 'இணையும் விளிம்புகளின் நீளம் சமமாக இருக்க வேண்டும்.',
          },
          s5: {
            title: '5. மீதமுள்ள முகங்களைச் சேர்க்க',
            body: 'மேல் மூடியை (Top) ஒரு பக்க மடலின் வெளி விளிம்பில் இணைக்கவும்.',
            checklist: 'மேல் & அடி முகங்கள் ஒரே அளவு (l × b) கொண்டவை.',
          },
          s6: {
            title: '6. மனதில் மடித்துச் சரிபார்',
            body: 'ஒவ்வொரு மடலையும் 90° மேல்நோக்கி மடித்து மேற்படிதல் இன்றி மூடுகிறதா எனச் சரிபார்க்கவும்.',
            checklist: 'அனைத்து 6 முகங்களும் சரியாகச் சந்திக்கின்றனவா பார்.',
          },
        },
      },
      scale: {
        title: 'கன அளவு & புறப்பரப்பளவு பெருக்கம் (k, k², k³)',
        subtitle:
          'அனைத்து அளவுகளையும் k மடங்கு (1× முதல் 3×) உயர்த்தி பரப்பு k² மற்றும் கன அளவு k³ ஆக வளர்வதைக் காணுங்கள்.',
        scaleFactorLabel: 'அளவுக் காரணி (k)',
        shapeLabel: 'சோதனை வடிவம்',
        originalHeader: 'மூலம் (1×)',
        scaledHeader: 'பெருக்கியது (k×)',
        dimensionsRow: 'நேரியல் அளவுகள் (× k)',
        lsaRow: 'LSA / CSA (× k²)',
        tsaRow: 'TSA (× k²)',
        volumeRow: 'கன அளவு (× k³)',
        areaScaleFormula: 'பரப்பளவு k² மடங்கு வளரும்',
        volumeScaleFormula: 'கன அளவு k³ மடங்கு வளரும்',
        insightTitle: 'கன அளவு ஏன் வேகமாக வளர்கிறது?',
        insightBody:
          'பக்கத்தை 2× ஆக்கினால் பரப்பு 2² = 4× வளரும்; ஆனால் கன அளவு நீளம், அகலம், உயரம் என மூன்று திசைகளிலும் பெருகி 2³ = 8× ஆகும்! 3× எனில் 9× பரப்பும் 27× கன அளவும் கிடைக்கும்.',
      },
    },
    tutor: {
      headerTitle: 'அளவியல் & 3D நெட் கற்றல் ஆசிரியர்',
      headerSubtitle:
        '15 வடிவங்கள், சூத்திரங்கள், புறப்பரப்பளவு, கன அளவு, நெட்டுகள் மற்றும் படிப்படியான கணக்குகளைக் கேளுங்கள்.',
      demoBadge: 'டெமோ ஆசிரியர் (ஆஃப்லைன் கணித இயந்திரம்)',
      liveBadge: 'நேரடி AI இணைக்கப்பட்டது (சர்வர் ப்ராக்ஸி)',
      demoNoticeTitle: 'டெமோ நிலை அறிவிப்பு: நேரடி AI API இணைக்கப்படவில்லை',
      demoNoticeBody:
        'இங்குள்ள பதில்கள் NetFold 3D கணித இயந்திரத்தால் உருவாக்கப்படுகின்றன (Archify என்பது வரைபடக் கருவி, AI API அல்ல). உலாவியில் API விசை பாதுகாப்பிற்கு, சர்வரில் GEMINI_API_KEY வைத்து POST /api/tutor ப்ராக்ஸி தேவை.',
      fallbackFromErrorBanner:
        'AI சர்வரை அடைய முடியாததால், உள்ளூர் டெமோ ஆசிரியர் பதில் அளித்தது.',
      archToggleShow: 'நேரடி AI இணைக்கும் விதம்',
      archToggleHide: 'அமைப்பை மறை',
      archTitle: 'நேரடி AI-க்கு பாதுகாப்பான பின்தள அமைப்பு',
      archSteps: {
        s1: '1. POST /api/tutor வழங்கும் சிறிய சர்வர் ப்ராக்ஸியை (Node/Express, Vercel/Netlify அல்லது Worker) அமைக்கவும்.',
        s2: '2. GEMINI_API_KEY-ஐ சர்வரில் மட்டுமே சேமிக்கவும் — VITE_* முன்தளக் கோப்புகளில் வைக்க வேண்டாம்.',
        s3: '3. VITE_TUTOR_ENDPOINT=/api/tutor என அமைத்தால் AITutor.jsx பாதுகாப்பாகச் செய்தி அனுப்பும்.',
      },
      contextTitle: 'தற்போதைய வடிவத் தகவல்',
      openExplorerButton: '3D ஆய்வகத்தில் திற',
      liveValuesLabel: 'நேரடி மதிப்புகள்',
      suggestedTitle: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
      suggested: {
        s1: 'தற்போதைய அளவுகளுடன் {shape} பற்றிப் படிப்படியாக விளக்கவும்',
        s2: '{shape}-இன் LSA, TSA மற்றும் கன அளவு சூத்திரங்கள் யாவை?',
        s3: '{shape}-இன் 2D நெட் எப்படி மடியும்?',
        s4: 'எத்தனை சரியான கனசதுர நெட்டுகள் உள்ளன? தவறானவை ஏன் மடியாது?',
        s5: 'தீர்க்கவும்: கனசெவ்வகம் l=10, b=6, h=4 இன் LSA, TSA & கன அளவு',
      },
      clearChat: 'உரையாடலை அழி',
      emptyTitle: 'கணிதக் கேள்வியைக் கீழே கேளுங்கள்',
      emptyBody:
        'மேலுள்ள கேள்விகளைத் தட்டவும் அல்லது "உருளை r=3 h=5 TSA மற்றும் கன அளவு" எனத் தட்டச்சு செய்யவும்.',
      inputPlaceholder:
        'வடிவங்கள், சூத்திரங்கள், நெட்டுகள் அல்லது கணக்கு கேளுங்கள்...',
      sendButton: 'ஆசிரியரிடம் கேள்',
      thinkingText: 'கணக்கிடுகிறது...',
      studentLabel: 'மாணவர்',
      demoMessageTag: 'டெமோ ஆசிரியர் · ஆஃப்லைன் கணித இயந்திரம்',
      liveMessageTag: 'நேரடி AI ஆசிரியர்',
      templates: {
        solvedForPrefix: 'படிப்படியான தீர்வு:',
        currentContextPrefix: 'நீங்கள் தேர்ந்தெடுத்த வடிவத்தின்படி:',
        netHeading: '2D நெட் மற்றும் மடிப்பு விளக்கம்',
        cubeNetsCountNote:
          'தனித்துவமான கனசதுர நெட்டுகள் 1-4-1 (6), 2-3-1 (3), 2-2-2 (1), மற்றும் 3-3 (1) குடும்பங்களில் உள்ளன.',
        scaleHeading: 'அளவுப் பெருக்கப் பகுப்பாய்வு',
        formulaHeading: 'சூத்திரங்கள் & நேரடிக் கணக்கீடு',
        netByShape: {
          cube: 'கனசதுரம் 11 சரியான நெட்டுகளில் ஒன்றாக 6 சதுரங்களாக விரியும்; 2×2 தொகுதி அல்லது 6-நேர் வரிசை மேற்படியும்.',
          cuboid:
            'கனசெவ்வகம் 3 சம ஜோடி செவ்வகங்களாகிய 6 முகங்களின் சிலுவை நெட்டாக விரியும்: 2(l×b), 2(l×h), 2(h×b).',
          cylinder:
            'உருளை 2πr அகலமும் (வட்ட சுற்றளவு) h உயரமும் கொண்ட 1 செவ்வகம் + 2 சம வட்டங்களாக (πr²) விரியும்.',
          cone: 'கூம்பு ஒரு வட்ட அடிப்பகுதி (πr²) மற்றும் ஆரம் l = √(r² + h²) கொண்ட வட்டக்கோணப் பகுதியாக விரியும்.',
          square_pyramid:
            'சதுர பிரமிடு 1 சதுர அடியும் அதன் 4 விளிம்புகளில் இணைந்த 4 முக்கோணங்களும் கொண்டு விரியும்.',
          sphere:
            'கோளத்திற்குச் சரியான தட்டையான நெட் இல்லை—கிழிக்காமல் அல்லது இழுக்காமல் சமமாக விரிக்க முடியாது.',
          triangular_prism:
            'முக்கோண அரியம் 2 சமபக்க முக்கோண அடி/மேல் முகங்களும் 3 செவ்வகச் சுவர்களுமாக விரியும்.',
          triangular_pyramid:
            'முக்கோண பிரமிடு 1 முக்கோண அடி மற்றும் 3 பக்க முக்கோண முகங்களாக விரியும்.',
          pentagonal_prism:
            'ஐங்கோண அரியம் 2 ஐங்கோணங்களும் 5 செவ்வகச் சுவர்களுமாக விரியும்.',
          hexagonal_prism:
            'அறுகோண அரியம் 2 அறுகோணங்களும் 6 செவ்வகச் சுவர்களுமாக விரியும்.',
          pentagonal_pyramid:
            'ஐங்கோண பிரமிடு 1 ஐங்கோண அடியும் 5 முக்கோண முகங்களாகவும் விரியும்.',
          hexagonal_pyramid:
            'அறுகோண பிரமிடு 1 அறுகோண அடியும் 6 முக்கோண முகங்களாகவும் விரியும்.',
          hemisphere:
            'அரைக்கோளக் குவிமாடம் இரு திசைகளிலும் வளைந்திருப்பதால் தட்டையான நெட் இல்லை.',
          frustum:
            'இடைக்கண்டம் வளைந்த பட்டை π(r₁ + r₂)l மற்றும் r₁, r₂ ஆரமுள்ள இரு வட்டங்களாக விரியும்.',
          octahedron:
            'ஒழுங்கு எண்முகன் ஒன்றோடொன்று இணைந்த 8 சமபக்க முக்கோண நெட்டாக விரியும்.',
        },
      },
    },
    practice: {
      headerTitle: 'NCERT அளவியல் – வகுப்பு 10 தீர்க்கப்பட்ட பயிற்சி',
      headerSubtitle:
        'கருத்துக்கள், வழித்தோன்றல், படிப்படியான கணக்கீடுகள், பெயரிடப்பட்ட 3D மாதிரிகள் மற்றும் கணித வரைபடங்களுடன் பொதுத்தேர்வு பாணி எழுத்துத் தீர்வுகள் (வினாக்கள் 1–10).',
      boardExamTag: 'பொதுத்தேர்வு எழுத்துத் தீர்வு · வகுப்பு 10 NCERT',
      progressPrefix: 'வினா',
      questionSelectorAria: 'தீர்க்கப்பட்ட வினாவைத் தேர்ந்தெடுக்கவும்',
      previousButton: 'முந்தையது',
      nextButton: 'அடுத்தது',
      expandAll: 'அனைத்து படிகளையும் விரிவாக்கு',
      collapseAll: 'அனைத்தையும் சுருக்கு',
      stepBadgePrefix: 'படி',
      diagramSectionTitle: 'பெயரிடப்பட்ட 3D மாதிரி & கணித வரைபடம்',
      interactive3DTab: 'செயல்முறை 3D மாதிரி',
      diagramTab: '2D கணித வரைபடம்',
      togglePrimaryModel: 'அடிப்படை திண்மம்',
      toggleCompareModel: 'உருவான திண்மத்தை ஒப்பிடு',
      foldSliderLabel: 'மடிப்பு / விரிப்பு முன்னோட்டம்',
      openInExplorer: '3D ஆய்வகத்தில் திறக்கவும்',
      scaleNoticePrefix:
        'தெளிவுக்காக 3D மாதிரி விகிதாசாரமாகக் காட்டப்பட்டுள்ளது; சரியான NCERT அளவுகள் பெயரிடப்பட்டுள்ளன:',
      writtenPracticeNote: 'விரிவான எழுத்துத் தீர்வுப் பகுதி (MCQ வினாடி வினா அல்ல)',
      diagramLabels: {
        radius: 'ஆரம்',
        diameter: 'விட்டம்',
        height: 'உயரம்',
        slantHeight: 'சாயுயரம்',
        edge: 'விளிம்பு',
        baseArea: 'அடிப்பரப்பு',
        surfaceArea: 'புறப்பரப்பு',
        volume: 'கன அளவு',
        cutPlane: 'வெட்டுத் தளம் (+πr²)',
        joinedFace: 'இணைந்த முகம் (-2a² மறைவு)',
        inscribedCone: 'உள்வரைந்த மிகப்பெரிய கூம்பு',
        hemisphereBowl: 'அரைக்கோள வளைவு',
        flatCircularBase: 'தட்டையான வட்ட அடிப்பகுதி',
        semicircleArc: 'அரைவட்டப் பகுதி',
      },
      stepTitles: {
        s1: '1. அசல் வினா அறிக்கை',
        s2: '2. தொடர்புடைய வரையறை & கருத்து',
        s3: '3. கொடுக்கப்பட்ட தகவல்கள்',
        s4: '4. கண்டறிய வேண்டியது',
        s5: '5. தொடர்புடைய கணித சூத்திரம்',
        s6: '6. படிப்படியான வழித்தோன்றல்',
        s7: '7. மதிப்புகளைப் பிரதியிடல்',
        s8: '8. விரிவான கணக்கீடுகள்',
        s9: '9. சரியான அலகுகளுடன் இறுதி விடை',
        s10: '10. தொடர்புடைய பெயரிடப்பட்ட 3D மாதிரி & கணித வரைபடம்',
      },
    },
    themeToggle: {
      lightLabel: 'ஒளி',
      darkLabel: 'இருள்',
      switchToDark: 'இருண்ட பயன்முறைக்கு மாறு',
      switchToLight: 'ஒளி பயன்முறைக்கு மாறு',
    },
    canvasControls: {
      lockZoom: 'சக்கரப் பூட்டு',
      unlockZoom: 'பெரிதாக்கு',
      zoomIn: '3D பெரிதாக்கு',
      zoomOut: '3D சிறிதாக்கு',
      scrollSafeNote: 'ஸ்க்ரால் பக்கம் நகர்த்தும் · இழுத்து 3D சுழற்றுக',
    },
    search: {
      buttonLabel: 'தேடு',
      placeholder: '15 வடிவங்கள், வகுப்பு 10 வினாக்கள், இலக்குகளைத் தேடு…',
      emptyPrompt: 'வடிவம், சூத்திரம், இலக்கு அல்லது வினாவைத் தட்டச்சு செய்க.',
      noResults: 'பொருத்தமான முடிவுகள் எதுவும் இல்லை.',
      closeLabel: 'தேடலை மூடு',
      shortcutHint: '/ அல்லது Ctrl+K அழுத்தவும்',
      categories: {
        shapes: '3D வடிவம்',
        missions: 'இலக்கு',
        practice: 'வகுப்பு 10 பயிற்சி',
        netlab: 'நெட் ஆய்வகம்',
        sections: 'முன்னேற்றம் & வழிகாட்டி',
      },
    },
    bookmarks: {
      addShape: 'வடிவத்தைச் சேமி',
      removeShape: 'சேமிப்பிலிருந்து நீக்கு',
      addQuestion: 'வினாவைச் சேமி',
      removeQuestion: 'வினா சேமிப்பை நீக்கு',
      shapesHeading: 'சேமிக்கப்பட்ட வடிவங்கள்',
      questionsHeading: 'சேமிக்கப்பட்ட வகுப்பு 10 வினாக்கள்',
      emptyTitle: 'சேமிப்புகள் இன்னும் இல்லை',
      emptyHint: 'எந்த 3D வடிவம் அல்லது வினாவிலும் உள்ள நட்சத்திரத்தை அழுத்திச் சேமிக்கவும்.',
      openButton: 'திற',
    },
    missionsUi: {
      headerTitle: 'செயல்முறை அளவியல் இலக்குகள்',
      headerSubtitle:
        '3D நெட்டுகள், சுவர் வண்ணப்பரப்பு, நீர்த்தொட்டி கொள்ளளவு மற்றும் பெட்டி சீரமைப்பு சவால்களைத் தீர்த்து 3 நட்சத்திரங்கள் வரை பெறுங்கள்!',
      progressBadge: 'முடித்த இலக்குகள்',
      starsEarnedLabel: 'பெற்ற நட்சத்திரங்கள்',
      completedTag: 'முடிந்தது',
      inProgressTag: 'முடியவில்லை',
      attemptsLabel: 'முயற்சிகள்',
      selectChallenge: 'சவால் சுற்று',
      baseFaceTag: 'அடித்தள முகம்',
      chooseTopFace: 'மடித்த பிறகு எந்த எண் சதுரம் மேல் முகப்பாக (TOP) வரும்?',
      faceOptionPrefix: 'முகம்',
      foldTestLabel: 'செயல்முறை 3D மடிப்பு முன்னோட்டம்',
      roomDimensionsTag: 'வகுப்பறை: l = 8 m, b = 6 m, h = 4 m (தரை & கூரை நீங்கலாக)',
      enterWallsArea: '4 சுவர்களின் பரப்பளவை உள்ளிடுக (m²)',
      radiusLabel: 'தொட்டி ஆரம் r (m)',
      heightLabel: 'தொட்டி உயரம் h (m)',
      lengthLabel: 'நீளம் l (cm)',
      breadthLabel: 'அகலம் b (cm)',
      targetLabel: 'இலக்கு',
      computedLabel: 'தற்போதைய மதிப்பு',
      litresUnit: 'லிட்டர்',
      selectReasonLabel: 'இந்த வடிவம் அட்டைப் பரப்பைக் (TSA) குறைக்கக் காரணம் என்ன?',
      checkAnswer: 'சரிபார்',
      retryButton: 'மீண்டும் முயல்க',
      resetButton: 'இலக்கை மீட்டமை',
      resetAllButton: 'அனைத்து இலக்குகளையும் மீட்டமை',
      listenButton: 'ஒலித்து வாசி',
      stopAudioButton: 'ஒலியை நிறுத்து',
      audioUnsupported: 'இந்த உலாவியில் குரல் வாசிப்பு ஆதரிக்கப்படவில்லை.',
      hintLockedNote: '2 தவறான முயற்சிகளுக்குப் பிறகு குறிப்புகள் தானாகத் திறக்கும்.',
      hintUnlockedTitle: 'வழிகாட்டு குறிப்பு திறக்கப்பட்டது',
      hintFormulaPrefix: 'குறிப்பு',
      mistakeFloorCeiling:
        'நெருங்கிவிட்டீர்கள்! தரை மற்றும் கூரையை (96 m²) சேர்த்துவிட்டீர்கள். LSA = 2h(l + b) பயன்படுத்துக.',
      mistakeVolumeMismatch:
        'l × b × h = 64 cm³ ஆகுமாறு அளவுகளை மாற்றுங்கள்.',
      mistakeNotMinimum:
        'கன அளவு 64 cm³ சரி, ஆனால் புறப்பரப்பை இன்னும் குறைக்கலாம்! சம பக்கங்களை முயலுங்கள்.',
      mistakeSelectReason:
        'குறைந்தபட்ச பரப்பளவு சரி — இப்போது கீழே சரியான கணிதக் காரணத்தைத் தேர்ந்தெடுக்கவும்!',
      mistakeTooSmall:
        'தொட்டி கொள்ளளவு 1540 L-க்குக் குறைவு. r அல்லது h அதிகரிக்கவும்.',
      mistakeTooLarge:
        'தொட்டி கொள்ளளவு 1540 L-ஐ விட அதிகம். r அல்லது h குறைக்கவும்.',
      successTitle: 'இலக்கு வெற்றிகரமாக முடிந்தது!',
      closeModal: 'தொடர்க',
    },
    hub: {
      headerTitle: 'கற்றல் முன்னேற்றம், சேமிப்புகள் & வழிகாட்டி',
      headerSubtitle:
        '15 வடிவங்கள், 4 இலக்குகள், வகுப்பு 10 வினாக்கள், சேமிப்புகள், விசைப்பலகை உதவி மற்றும் கட்டமைப்பைப் பார்க்கவும்.',
      tabs: {
        progress: 'முன்னேற்றம் & பதக்கங்கள்',
        bookmarks: 'சேமிப்புகள்',
        help: 'உதவி & விசைப்பலகை',
        about: 'பற்றி & கட்டமைப்பு',
      },
      stats: {
        overallMastery: 'மொத்த தேர்ச்சி',
        shapesExplored: 'பார்த்த வடிவங்கள்',
        missionsDone: 'முடித்த இலக்குகள்',
        starsEarned: 'இலக்கு நட்சத்திரங்கள்',
        practiceReviewed: 'வகுப்பு 10 பயிற்சி',
        netCheckerBest: 'நெட் சோதனை சிறந்த மதிப்பெண்',
      },
      badgesTitle: 'சாதனைப் பதக்கங்கள்',
      unlockedTag: 'திறக்கப்பட்டது',
      lockedTag: 'முயற்சியில்',
      badges: {
        first_fold: {
          title: 'முதல் மடிப்பு ஆய்வாளர்',
          desc: 'முதல் 3D திண்மத்தை ஆய்வு செய்யுங்கள்.',
        },
        class8_complete: {
          title: 'வகுப்பு 8 அடித்தளம்',
          desc: 'கனசதுரம், கனசெவ்வகம் மற்றும் உருளையைப் பாருங்கள்.',
        },
        master_15: {
          title: '15 வடிவ வல்லுநர்',
          desc: 'அனைத்து 15 3D வடிவங்களையும் ஆய்வு செய்யுங்கள்.',
        },
        mission_challenger: {
          title: 'செயல்முறை சவாலாளர்',
          desc: 'குறைந்தது 2 செயல்முறை இலக்குகளை முடிக்கவும்.',
        },
        star_achiever: {
          title: 'அனைத்து இலக்கு வெற்றியாளர்',
          desc: 'அனைத்து 4 நிஜ உலக அளவியல் இலக்குகளையும் முடிக்கவும்.',
        },
        board_scholar: {
          title: 'வகுப்பு 10 பொதுத்தேர்வு அறிஞர்',
          desc: 'அனைத்து 10 வகுப்பு 10 NCERT வினாக்களையும் படிக்கவும்.',
        },
      },
      quickResumeTitle: 'விரைவு அணுகல்',
      resumeExplorer: '3D ஆய்வகம் திற',
      resumeMissions: 'இலக்குகளுக்குச் செல்',
      resumePractice: 'வகுப்பு 10 பயிற்சியைத் தொடர்',
      helpTitle: 'NetFold 3D பயன்படுத்தும் முறை',
      helpSteps: {
        s1: {
          title: '1. வடிவ ஆய்வகம் (15 திண்மங்கள்)',
          desc: 'வடிவத்தைத் தேர்ந்தெடுத்து 0% நெட்டிலிருந்து 100% திண்மம் வரை மடித்து முகப்புப் பரப்புகளைப் பாருங்கள்.',
        },
        s2: {
          title: '2. இலக்குகள் (குரல் & குறிப்புகள்)',
          desc: '3D காட்சியுடன் 4 நிஜ உலகக் கணக்குகளைத் தீருங்கள். 2 தவறுகளுக்குப் பின் குறிப்பு திறக்கும்.',
        },
        s3: {
          title: '3. நெட் ஆய்வகம் & வகுப்பு 10 பயிற்சி',
          desc: '11 கனசதுர நெட்டுகள், k²/k³ வளர்ச்சி மற்றும் 10-படி பொதுத்தேர்வு தீர்வுகளை எளிதாகப் படியுங்கள்.',
        },
        s4: {
          title: '4. ஆஃப்லைன் சேமிப்பு & 5 மொழிகள்',
          desc: 'முன்னேற்றம், நட்சத்திரங்கள், இருள்/ஒளி பயன்முறை மற்றும் சேமிப்புகள் தானாக சேமிக்கப்படும்.',
        },
      },
      shortcutsTitle: 'விசைப்பலகை குறுக்குவழிகள்',
      shortcuts: {
        search: 'உலகளாவிய தேடலுக்கு Ctrl + K அல்லது / அழுத்தவும்',
        closeModal: 'சாளரத்தை மூட Esc அழுத்தவும்',
        navigateTabs: 'பொத்தான்களுக்கு இடையே நகர Tab / Shift + Tab பயன்படுத்தவும்',
        adjustSliders: 'ஸ்லைடர்களை மாற்ற இடது / வலது அம்பு விசைகளைப் பயன்படுத்தவும்',
      },
      aboutTitle: 'NetFold 3D & பாடத்திட்ட நோக்கம்',
      aboutPurpose:
        'NetFold 3D என்பது NCERT வகுப்பு 8–10 அளவியலுக்காக உருவாக்கப்பட்ட ஆஃப்லைன் 3D கணித ஆய்வகம். 2D நெட்டுகள் 3D வடிவமாக மாறுவதை மாணவர்கள் நேரில் பார்க்கலாம்.',
      aboutObjectivesTitle: 'முக்கிய கற்றல் நோக்கங்கள்',
      aboutObjectives: {
        o1: 'பட்டகம், பிரமிடு, கூம்பு மற்றும் இடைக்கண்ட நெட் மடிப்புகளை 3D-இல் புரிந்துகொள்ளுதல்.',
        o2: 'பக்கப்பரப்பு (LSA) மற்றும் மொத்தப் புறப்பரப்பு (TSA) வேறுபாட்டைத் தெளிவாக அறிதல்.',
        o3: 'கோளம் மற்றும் அரைக்கோளத்திற்குத் தட்டையான நெட் ஏன் இல்லை என்பதை உணர்தல்.',
        o4: '5 இந்திய மொழிகளில் படிப்படியான பொதுத்தேர்வுத் தீர்வுகளைப் பயிற்சி செய்தல்.',
      },
      aboutArchTitle: 'கட்டமைப்பு சுருக்கம் (Archify)',
      aboutArchBody:
        'React 19, Three.js / React Three Fiber, Tailwind CSS மற்றும் Vite PWA மூலம் கட்டப்பட்டது. தனித்தனி தொகுதிகள் கணித இயந்திரம், நெட் வடிவியல், 3D காட்சி, மொழிபெயர்ப்பு மற்றும் உள்ளூர் சேமிப்பைக் கையாளுகின்றன.',
      aboutHonestyNote:
        'AI குறிப்பு: உள்ளமைந்த AI ஆசிரியர் உலாவியிலேயே இயங்கும் கணிதத் தீர்வியாகும் (போலி நேரடி AI அல்ல).',
    },
  },

  te: {
    appTitle: 'NetFold 3D',
    appSubtitle: 'ఇంటరాక్టివ్ 3D క్షేత్రగణిత ప్రయోగశాల',
    languageSelectLabel: 'భాష',
    languageSelectAria: 'అప్లికేషన్ భాషను ఎంచుకోండి',
    shapeSectionTitle: '3D ఆకారాన్ని ఎంచుకోండి (15 ఆకారాలు)',
    class8CategoryLabel: '8వ తరగతి NCERT',
    beyondClass8CategoryLabel: '8వ తరగతికి మించి',
    beyondClass8Badge: '8వ తరగతికి మించి (9/10వ తరగతి అంశం)',
    beyondSubgroups: {
      prisms: 'ప్రిజమ్‌లు (Prisms)',
      pyramids: 'పిరమిడ్‌లు (Pyramids)',
      curvedAndPlatonic: 'వక్ర మరియు ప్లాటోనిక్ ఘనాలు',
    },
    shapes: {
      cube: 'ఘనం',
      cuboid: 'దీర్ఘఘనం',
      cylinder: 'స్థూపం',
      cone: 'శంఖువు',
      square_pyramid: 'చతురస్ర పిరమిడ్',
      sphere: 'గోళం',
      triangular_prism: 'త్రిభుజాకార ప్రిజమ్',
      triangular_pyramid: 'త్రిభుజాకార పిరమిడ్ (టెట్రాహెడ్రాన్)',
      pentagonal_prism: 'పంచభుజి ప్రిజమ్',
      hexagonal_prism: 'షడ్భుజి ప్రిజమ్',
      pentagonal_pyramid: 'పంచభుజి పిరమిడ్',
      hexagonal_pyramid: 'షడ్భుజి పిరమిడ్',
      hemisphere: 'అర్ధగోళం',
      frustum: 'శంఖువు ఛిన్నకం (Frustum)',
      octahedron: 'అష్టముఖి (Octahedron)',
    },
    foldSectionTitle: 'వల మడత',
    foldPresets: {
      flat: '0% చదును',
      half: '50% సగం',
      closed: '100% ఘనం',
    },
    foldStage: {
      flat: 'చదునైన 2D వల',
      folding: 'మడత కొనసాగుతోంది',
      closed: 'మూసిన 3D ఆకారం',
      noNet: '3D ఆకారం (ఖచ్చితమైన సమతల వల లేదు)',
    },
    sphereNoNetMessage:
      'గోళానికి సమతల వల (Net) ఉండదు, కాబట్టి దీనిని మడవలేము.',
    hemisphereNoNetMessage:
      'అర్ధగోళానికి ఖచ్చితమైన సమతల వల లేదు, కాబట్టి దాని వక్ర గుమ్మటాన్ని చదునుగా మడవలేము.',
    sphereLsaNotApplicable: 'గోళానికి వర్తించదు',
    octahedronLsaNotApplicable:
      'వర్తించదు (అన్ని 8 సమబాహు త్రిభుజ ముఖాలు సమానం)',
    dimensionsSectionTitle: 'కొలతలు',
    dimensionLabels: {
      a: 'అంచు (a)',
      baseSideA: 'భూమి భుజం (a)',
      l: 'పొడవు (l)',
      b: 'వెడల్పు (b)',
      h: 'ఎత్తు (h)',
      r: 'వ్యాసార్థం (r)',
      r1: 'దిగువ వ్యాసార్థం (r₁)',
      r2: 'పై వ్యాసార్థం (r₂)',
      slantL: 'ఏటవాలు ఎత్తు (l)',
      slantS: 'ఏటవాలు ఎత్తు (s)',
      diameter: 'వ్యాసం (2r)',
    },
    unitsSectionTitle: 'యూనిట్',
    unitNames: {
      cm: 'సెంటీమీటర్లు (సెం.మీ)',
      m: 'మీటర్లు (మీ)',
    },
    unitShort: {
      cm: 'సెం.మీ',
      m: 'మీ',
    },
    unitSymbols: {
      cm: { length: 'సెం.మీ', area: 'సెం.మీ²', volume: 'సెం.మీ³' },
      m: { length: 'మీ', area: 'మీ²', volume: 'మీ³' },
    },
    unitHintTitle: 'మీటర్లలో పెద్ద కొలతలు',
    unitHintBody:
      '5 మీ లేదా అంతకంటే ఎక్కువ విలువలు గది లేదా ట్యాంక్ అంత పెద్ద వస్తువులను సూచిస్తాయి. మీరు సెంటీమీటర్లు (cm) అనుకున్నారా?',
    unitHintSwitch: 'సెం.మీ కు మార్చండి',
    highlightSectionTitle: 'దృశ్య హైలైట్',
    highlightModes: {
      all: 'సాధారణం',
      lsa: 'LSA',
      tsa: 'TSA',
      volume: 'ఘనపరిమాణం',
    },
    highlightDescriptions: {
      all: 'అన్ని ముఖాలు విభిన్న విద్యా రంగులలో చూపబడ్డాయి.',
      lsa: 'పార్శ్వ లేదా వక్ర ముఖాలు హైలైట్ చేయబడ్డాయి; భూమి/పై భాగాలు మసకబారాయి.',
      tsa: 'TSA అన్ని ముఖాల మొత్తం కాబట్టి ప్రతి బాహ్య ఉపరితలం హైలైట్ చేయబడింది.',
      volume: 'ఆకారం లోపల ఉన్న పారదర్శక పూరకం 3D ఘనపరిమాణాన్ని చూపుతుంది.',
    },
    canvasHint:
      'తిప్పడానికి లాగండి · జూమ్ చేయడానికి స్క్రోల్/పించ్ చేయండి · ముఖాన్ని తాకండి',
    noNetCanvasHint:
      'తిప్పడానికి లాగండి · జూమ్ చేయడానికి స్క్రోల్/పించ్ చేయండి · వక్ర 3D ఆకారం',
    resetCamera: 'వీక్షణ రీసెట్',
    volumeFoldHint: 'పూర్తి ఘనపరిమాణాన్ని చూడటానికి 100% వరకు మడవండి',
    tapFaceHint: 'పరిశీలించడానికి వల లేదా జాబితాలోని ముఖాన్ని తాకండి',
    clearSelection: 'తొలగించు',
    selectedFacePrefix: 'ఎంచుకున్నది',
    faceBadgePrefix: 'ముఖం',
    sideWallPrefix: 'గోడ',
    faceNames: {
      bottom: 'భూమి',
      front: 'ముందు',
      back: 'వెనుక',
      top: 'పైభాగం',
      left: 'ఎడమ',
      right: 'కుడి',
      lateral: 'వక్ర ఉపరితలం',
      surface: 'వక్ర ఉపరితలం',
    },
    faceRoles: {
      base: 'భూమి',
      top: 'పైభాగం',
      lateral: 'పార్శ్వ ముఖం',
      curved: 'వక్ర ఉపరితలం',
      face: 'త్రిభుజ ముఖం',
    },
    faceBreakdownTitle: 'ముఖ వైశాల్యాలు (వల విభజన)',
    sumOfFacesLabel: 'అన్ని ముఖాల మొత్తం = TSA',
    sphereSurfaceBreakdownNote:
      'అన్ని దిశలలో నిరంతరమైన ఒకే వక్ర ఉపరితలం',
    formulaCardTitle: 'దశలవారీ సూత్రాలు మరియు ప్రతిక్షేపణ',
    slantHeightStepLabel: 'ఏటవాలు ఎత్తు',
    volumeLabel: 'ఘనపరిమాణం (Volume)',
    lsaLabel: 'పార్శ్వ ఉపరితల వైశాల్యం (LSA)',
    csaLabel: 'వక్రతల వైశాల్యం (CSA)',
    tsaLabel: 'సంపూర్ణ ఉపరితల వైశాల్యం (TSA)',
    surfaceAreaLabel: 'ఉపరితల వైశాల్యం (TSA)',
    lsaExcludedTitle: 'LSA లో భూమి/పై భాగాలను ఎందుకు మినహాయిస్తారు',
    lsaExclusionNote: {
      cube: 'LSA కేవలం 4 పక్క గోడలను (4a²) మాత్రమే లెక్కిస్తుంది. పైభాగం + భూమి (2a²) మినహాయించబడ్డాయి.',
      cuboid:
        'LSA కేవలం 4 పక్క గోడలను 2h(l + b) లెక్కిస్తుంది. పైభాగం + భూమి (2lb) మినహాయించబడ్డాయి.',
      cylinder:
        'CSA వక్ర దీర్ఘచతురస్రాకార గోడను (2πrh) మాత్రమే లెక్కిస్తుంది. రెండు వృత్త మూతలు (2πr²) మినహాయించబడ్డాయి.',
      cone: 'LSA వక్ర శంఖువు భాగాన్ని (πrl) మాత్రమే లెక్కిస్తుంది. వృత్తాకార భూమి (πr²) మినహాయించబడింది.',
      square_pyramid:
        'LSA 4 త్రిభుజాకార ముఖాలను (2as) మాత్రమే లెక్కిస్తుంది. చతురస్ర భూమి (a²) మినహాయించబడింది.',
      sphere: 'గోళానికి వర్తించదు',
      triangular_prism:
        'LSA కేవలం 3 దీర్ఘచతురస్రాకార గోడలను (3ah) లెక్కిస్తుంది. రెండు త్రిభుజ మూతలు మినహాయించబడ్డాయి.',
      pentagonal_prism:
        'LSA కేవలం 5 దీర్ఘచతురస్రాకార గోడలను (5ah) లెక్కిస్తుంది. రెండు పంచభుజి మూతలు మినహాయించబడ్డాయి.',
      hexagonal_prism:
        'LSA కేవలం 6 దీర్ఘచతురస్రాకార గోడలను (6ah) లెక్కిస్తుంది. రెండు షడ్భుజి మూతలు మినహాయించబడ్డాయి.',
      triangular_pyramid:
        'LSA కేవలం 3 త్రిభుజాకార పక్క ముఖాలను ((3/2)as) లెక్కిస్తుంది. త్రిభుజ భూమి మినహాయించబడింది.',
      pentagonal_pyramid:
        'LSA కేవలం 5 త్రిభుజాకార పక్క ముఖాలను ((5/2)as) లెక్కిస్తుంది. పంచభుజి భూమి మినహాయించబడింది.',
      hexagonal_pyramid:
        'LSA కేవలం 6 త్రిభుజాకార పక్క ముఖాలను (3as) లెక్కిస్తుంది. షడ్భుజి భూమి మినహాయించబడింది.',
      hemisphere:
        'CSA కేవలం వక్ర అర్ధగోళ గుమ్మటాన్ని (2πr²) లెక్కిస్తుంది. సమతల వృత్త భూమి (πr²) మినహాయించబడింది.',
      frustum:
        'LSA కేవలం వక్ర ఉపరితలం π(r₁ + r₂)l ని లెక్కిస్తుంది. రెండు వృత్త మూతలు (πr₁² + πr₂²) మినహాయించబడ్డాయి.',
      octahedron:
        'వర్తించదు (అన్ని 8 సమబాహు త్రిభుజ ముఖాలు సమానం; TSA = 2√3a²)',
    },
    excludedCapsLabel: 'మినహాయించినది',
    learningPanelTitle: 'ఆకారం అభ్యాస మార్గదర్శి',
    definitionLabel: 'నిర్వచనం',
    geometryStatsLabel: 'లక్షణాలు (ముఖాలు, అంచులు, శీర్షాలు)',
    facesStatLabel: 'ముఖాలు / ఉపరితలాలు',
    edgesStatLabel: 'అంచులు',
    verticesStatLabel: 'శీర్షాలు',
    importantDimensionsLabel: 'ముఖ్య కొలతలు',
    workedExampleLabel: 'సాధించిన ఉదాహరణ',
    realWorldExampleLabel: 'నిజ జీవిత వినియోగం',
    didYouKnowLabel: 'మీకు తెలుసా?',
    guideLabels: {
      radius: 'వ్యాసార్థం (r)',
      height: 'ఎత్తు (h)',
      slantL: 'ఏటవాలు (l)',
      slantS: 'ఏటవాలు (s)',
    },
    learningByShape: {
      cube: {
        definition:
          'ఘనం అనేది లంబ కోణాలలో కలిసే ఆరు సమాన చతురస్ర ముఖాలతో కూడిన 3D ఘనాకారం.',
        faces: '6 చతురస్ర ముఖాలు',
        edges: '12 సమాన అంచులు',
        vertices: '8 శీర్షాలు',
        dimensionsSummary:
          'పొడవు = వెడల్పు = ఎత్తు = a కాబట్టి ఒకే ఒక్క అంచు పొడవు (a) మొత్తం ఘనాన్ని నిర్వచిస్తుంది.',
        workedExample:
          'a = 5 సెం.మీ అయితే: LSA = 100 సెం.మీ², TSA = 150 సెం.మీ², ఘనపరిమాణం = 125 సెం.మీ³.',
        realWorldExample: 'రూబిక్స్ క్యూబ్, పాచిక, గిఫ్ట్ బాక్స్ మరియు ఐస్ క్యూబ్.',
        didYouKnow:
          '6 చతురస్రాలతో ఏర్పడిన 11 విభిన్న చదునైన వలలు అన్నీ ఒకే ఘనంగా మడుచుకుంటాయి.',
      },
      cuboid: {
        definition:
          'దీర్ఘఘనం అనేది ఎదురెదురు ముఖాలు సమానంగా ఉండే ఆరు దీర్ఘచతురస్ర ముఖాలతో కూడిన 3D పెట్టె.',
        faces: '6 దీర్ఘచతురస్ర ముఖాలు',
        edges: '12 అంచులు (l, b, h ఒక్కొక్కటి 4)',
        vertices: '8 శీర్షాలు',
        dimensionsSummary:
          'పొడవు (l), వెడల్పు (b), మరియు ఎత్తు (h) అనే మూడు లంబ కొలతలతో నిర్వచించబడుతుంది.',
        workedExample:
          'l = 10, b = 6, h = 4 సెం.మీ: LSA = 128 సెం.మీ², TSA = 248 సెం.మీ², ఘనపరిమాణం = 240 సెం.మీ³.',
        realWorldExample: 'పాఠ్యపుస్తకం, ఇటుక, షూ బాక్స్ మరియు జామెట్రీ బాక్స్.',
        didYouKnow:
          'l = b = h అయినప్పుడు దీర్ఘఘనం ఘనమవుతుంది; దీని 4 పక్క గోడలు విప్పినప్పుడు 2(l + b) పొడవు గల దీర్ఘచతురస్రంగా మారతాయి.',
      },
      cylinder: {
        definition:
          'లంబ వృత్తాకార స్థూపం ఒక నునుపైన వక్ర ఉపరితలంతో కలిపిన రెండు సమాంతర సమాన వృత్తాకార భూములను కలిగి ఉంటుంది.',
        faces: '3 ఉపరితలాలు (2 చదును వృత్తాలు + 1 వక్ర గోడ)',
        edges: '2 వృత్తాకార అంచులు',
        vertices: '0 శీర్షాలు',
        dimensionsSummary:
          'భూమి వ్యాసార్థం (r) మరియు ఎత్తు (h) తో నిర్వచించబడుతుంది. వక్ర గోడను తెరిస్తే 2πr వెడల్పు గల దీర్ఘచతురస్రం వస్తుంది.',
        workedExample:
          'r = 3, h = 5 సెం.మీ: CSA = 30π ≈ 94.25 సెం.మీ², TSA = 48π ≈ 150.80 సెం.మీ², V = 45π ≈ 141.37 సెం.మీ³.',
        realWorldExample: 'నీటి ట్యాంక్, స్టీల్ గ్లాస్, పైపు మరియు టిన్ డబ్బా.',
        didYouKnow:
          'స్థూపం యొక్క విప్పిన దీర్ఘచతురస్రం వెడల్పు దాని వృత్తాకార భూమి చుట్టుకొలత (2πr) కు సమానం, అందుకే CSA = 2πrh.',
      },
      cone: {
        definition:
          'లంబ వృత్తాకార శంఖువు సమతల వృత్తాకార భూమి నుండి దాని కేంద్రం పైన ఉన్న ఒకే శీర్షానికి క్రమంగా మొనదేలుతుంది.',
        faces: '2 ఉపరితలాలు (1 వృత్తాకార భూమి + 1 వక్ర ఉపరితలం)',
        edges: '1 వృత్తాకార అంచు',
        vertices: '1 శీర్షం',
        dimensionsSummary:
          'వ్యాసార్థం (r), నిలువు ఎత్తు (h), మరియు ఏటవాలు ఎత్తు l = √(r² + h²) లతో నిర్వచించబడుతుంది.',
        workedExample:
          'r = 3, h = 4 సెం.మీ: l = 5 సెం.మీ; LSA = 15π ≈ 47.12 సెం.మీ², TSA = 24π ≈ 75.40 సెం.మీ², V = 12π ≈ 37.70 సెం.మీ³.',
        realWorldExample: 'ఐస్‌క్రీమ్ కోన్, ట్రాఫిక్ కోన్, గరాటు మరియు పుట్టినరోజు టోపీ.',
        didYouKnow:
          'ఒకే వ్యాసార్థం మరియు ఎత్తు ఉన్న స్థూపం ఘనపరిమాణంలో సరిగ్గా మూడవ వంతు (1/3) ఘనపరిమాణం శంఖువుకు ఉంటుంది!',
      },
      square_pyramid: {
        definition:
          'చతురస్ర పిరమిడ్ ఒక చతురస్రాకార భూమిని మరియు పైభాగంలో ఒకే శీర్షం వద్ద కలిసే నాలుగు సమద్విబాహు త్రిభుజ ముఖాలను కలిగి ఉంటుంది.',
        faces: '5 ముఖాలు (1 చతురస్ర భూమి + 4 త్రిభుజాలు)',
        edges: '8 అంచులు (4 భూమి + 4 ఏటవాలు)',
        vertices: '5 శీర్షాలు (4 భూమి + 1 పై శీర్షం)',
        dimensionsSummary:
          'భూమి భుజం (a), నిలువు ఎత్తు (h), మరియు త్రిభుజ ఏటవాలు ఎత్తు s = √(h² + (a/2)²) లతో నిర్వచించబడుతుంది.',
        workedExample:
          'a = 6, h = 4 సెం.మీ: s = 5 సెం.మీ; LSA = 60 సెం.మీ², TSA = 96 సెం.మీ², ఘనపరిమాణం = 48 సెం.మీ³.',
        realWorldExample: 'ఈజిప్ట్ గిజా పిరమిడ్ మరియు నాలుగు వైపుల టెంట్ పైకప్పు.',
        didYouKnow:
          'స్థూపంలో శంఖువు లాగే, ఒకే భూమి మరియు ఎత్తు ఉన్న దీర్ఘఘనం ఘనపరిమాణంలో 1/3 వంతు చతురస్ర పిరమిడ్‌కు ఉంటుంది.',
      },
      sphere: {
        definition:
          'గోళం అనేది దాని ఉపరితలంపై ఉన్న ప్రతి బిందువు కేంద్రం నుండి సమాన దూరంలో (వ్యాసార్థం r) ఉండే పూర్తి గుండ్రని 3D ఆకారం.',
        faces: '1 నిరంతర వక్ర ఉపరితలం',
        edges: '0 అంచులు',
        vertices: '0 శీర్షాలు',
        dimensionsSummary:
          'కేంద్రం నుండి ఉపరితలం వరకు ఉన్న ఒకే కొలత వ్యాసార్థం (r) ద్వారా పూర్తిగా నిర్వచించబడుతుంది (వ్యాసం = 2r).',
        workedExample:
          'r = 7 సెం.మీ అయితే: ఉపరితల వైశాల్యం = 196π ≈ 615.75 సెం.మీ², ఘనపరిమాణం = (4/3)π(7³) ≈ 1436.76 సెం.మీ³.',
        realWorldExample: 'క్రికెట్ బంతి, ఫుట్‌బాల్, గోళీ మరియు భూగోళం (గ్లోబ్).',
        didYouKnow:
          'గోళాన్ని సాగదీయకుండా లేదా చించకుండా సమతల వలగా మార్చలేము—అందుకే ప్రపంచ పటాలలో ఖండాల ఆకారం కొంత మారుతుంది!',
      },
      triangular_prism: {
        definition:
          'త్రిభుజాకార ప్రిజమ్ మూడు దీర్ఘచతురస్రాకార పక్క ముఖాలతో కలిపిన రెండు సమాంతర త్రిభుజాకార భూములను కలిగి ఉంటుంది.',
        faces: '5 ముఖాలు (2 త్రిభుజాలు + 3 దీర్ఘచతురస్రాలు)',
        edges: '9 అంచులు',
        vertices: '6 శీర్షాలు',
        dimensionsSummary:
          'సమబాహు త్రిభుజ భుజం (a) మరియు ప్రిజమ్ ఎత్తు (h) తో నిర్వచించబడుతుంది. భూమి = (√3/4)a².',
        workedExample:
          'a = 4, h = 5 సెం.మీ: భూమి ≈ 6.93 సెం.మీ², LSA = 60 సెం.మీ², TSA ≈ 73.86 సెం.మీ², V ≈ 34.64 సెం.మీ³.',
        realWorldExample: 'గాజు ప్రిజమ్, చాక్లెట్ ప్యాక్ మరియు టెంట్ ఆకారం.',
        didYouKnow:
          'దీర్ఘఘనాన్ని కర్ణం వెంబడి కత్తిరిస్తే అది రెండు సమాన త్రిభుజాకార ప్రిజమ్‌లుగా విడిపోతుంది!',
      },
      triangular_pyramid: {
        definition:
          'త్రిభుజాకార పిరమిడ్ (టెట్రాహెడ్రాన్) ఒక త్రిభుజ భూమిని మరియు ఒకే శీర్షం వద్ద కలిసే మూడు త్రిభుజ ముఖాలను కలిగి ఉంటుంది.',
        faces: '4 త్రిభుజ ముఖాలు',
        edges: '6 అంచులు',
        vertices: '4 శీర్షాలు',
        dimensionsSummary:
          'భూమి భుజం (a), ఎత్తు (h), మరియు ఏటవాలు ఎత్తు s తో నిర్వచించబడుతుంది. h = a√(2/3) అయితే అది క్రమ టెట్రాహెడ్రాన్.',
        workedExample:
          'a = 6, h = 5 సెం.మీ: భూమి ≈ 15.59 సెం.మీ², s ≈ 5.29 సెం.మీ, LSA ≈ 47.62 సెం.మీ², TSA ≈ 63.21 సెం.మీ², V ≈ 25.98 సెం.మీ³.',
        realWorldExample: 'టెట్రా ప్యాక్ కార్టన్, 4-ముఖాల పాచిక మరియు మీథేన్ (CH₄) అణు ఆకారం.',
        didYouKnow:
          '4 కంటే తక్కువ సమతల ముఖాలతో ఏ 3D బహుముఖాన్ని నిర్మించలేము!',
      },
      pentagonal_prism: {
        definition:
          'పంచభుజి ప్రిజమ్ ఐదు దీర్ఘచతురస్రాకార గోడలతో కలిపిన రెండు సమాంతర క్రమ పంచభుజి భూములను కలిగి ఉంటుంది.',
        faces: '7 ముఖాలు (2 పంచభుజాలు + 5 దీర్ఘచతురస్రాలు)',
        edges: '15 అంచులు',
        vertices: '10 శీర్షాలు',
        dimensionsSummary:
          'పంచభుజ భుజం (a) మరియు ఎత్తు (h) తో నిర్వచించబడుతుంది. భూమి = (5a²) / (4 tan 36°).',
        workedExample:
          'a = 4, h = 6 సెం.మీ: భూమి ≈ 27.53 సెం.మీ², LSA = 120 సెం.మీ², TSA ≈ 175.06 సెం.మీ², V ≈ 165.17 సెం.మీ³.',
        realWorldExample: '5-వైపుల భవనాలు, ప్రత్యేక నట్/బోల్ట్ మరియు పెన్సిల్ స్టాండ్.',
        didYouKnow:
          'అమెరికాలోని పెంటగాన్ భవనం ఒక పంచభుజి ప్రిజమ్ ఆకారంలో ఉంటుంది!',
      },
      hexagonal_prism: {
        definition:
          'షడ్భుజి ప్రిజమ్ ఆరు దీర్ఘచతురస్రాకార గోడలతో కలిపిన రెండు సమాంతర క్రమ షడ్భుజి భూములను కలిగి ఉంటుంది.',
        faces: '8 ముఖాలు (2 షడ్భుజాలు + 6 దీర్ఘచతురస్రాలు)',
        edges: '18 అంచులు',
        vertices: '12 శీర్షాలు',
        dimensionsSummary:
          'షడ్భుజ భుజం (a) మరియు ఎత్తు (h) తో నిర్వచించబడుతుంది. భూమి = (3√3/2)a².',
        workedExample:
          'a = 4, h = 5 సెం.మీ: భూమి ≈ 41.57 సెం.మీ², LSA = 120 సెం.మీ², TSA ≈ 203.14 సెం.మీ², V ≈ 207.85 సెం.మీ³.',
        realWorldExample: 'షడ్భుజి పెన్సిల్, తేనెపట్టు గదులు మరియు నట్/బోల్ట్.',
        didYouKnow:
          'తేనెటీగలు తక్కువ మైనంతో ఖాళీ లేకుండా స్థలాన్ని నింపడానికి షడ్భుజి ప్రిజమ్ గదులను నిర్మిస్తాయి!',
      },
      pentagonal_pyramid: {
        definition:
          'పంచభుజి పిరమిడ్ ఒక క్రమ పంచభుజి భూమిని మరియు ఒకే శీర్షం వద్ద కలిసే ఐదు త్రిభుజ ముఖాలను కలిగి ఉంటుంది.',
        faces: '6 ముఖాలు (1 పంచభుజి + 5 త్రిభుజాలు)',
        edges: '10 అంచులు',
        vertices: '6 శీర్షాలు',
        dimensionsSummary:
          'భూమి భుజం (a), ఎత్తు (h), మరియు ఏటవాలు ఎత్తు s = √(h² + (a / (2 tan 36°))²) తో నిర్వచించబడుతుంది.',
        workedExample:
          'a = 4, h = 6 సెం.మీ: భూమి ≈ 27.53 సెం.మీ², s ≈ 6.60 సెం.మీ, LSA ≈ 66.04 సెం.మీ², TSA ≈ 93.56 సెం.మీ², V ≈ 55.06 సెం.మీ³.',
        realWorldExample: 'నక్షత్ర దీపాలు, గోపుర శిఖరం మరియు పెవిలియన్ పైకప్పు.',
        didYouKnow:
          'ఇది యూలర్ సూత్రం F + V - E = 2 ను పాటిస్తుంది: 6 + 6 - 10 = 2!',
      },
      hexagonal_pyramid: {
        definition:
          'షడ్భుజి పిరమిడ్ ఒక క్రమ షడ్భుజి భూమిని మరియు ఒకే శీర్షం వద్ద కలిసే ఆరు త్రిభుజ ముఖాలను కలిగి ఉంటుంది.',
        faces: '7 ముఖాలు (1 షడ్భుజి + 6 త్రిభుజాలు)',
        edges: '12 అంచులు',
        vertices: '7 శీర్షాలు',
        dimensionsSummary:
          'భూమి భుజం (a), ఎత్తు (h), మరియు ఏటవాలు ఎత్తు s = √(h² + (√3a/2)²) తో నిర్వచించబడుతుంది.',
        workedExample:
          'a = 4, h = 3 సెం.మీ: భూమి ≈ 41.57 సెం.మీ², s ≈ 4.58 సెం.మీ, LSA ≈ 54.99 సెం.మీ², TSA ≈ 96.56 సెం.మీ², V ≈ 41.57 సెం.మీ³.',
        realWorldExample: 'ఆరు-వైపుల గెజిబో పైకప్పు, క్వార్ట్జ్ స్ఫటిక అంచు మరియు గొడుగు పైభాగం.',
        didYouKnow:
          'షడ్భుజి పిరమిడ్‌లో ముఖాలు మరియు శీర్షాల సంఖ్య సమానంగా ఉంటుంది (7 + 7 - 12 = 2)!',
      },
      hemisphere: {
        definition:
          'అర్ధగోళం అంటే గోళాన్ని కేంద్రం గుండా సగానికి కోసినప్పుడు వచ్చే ఒక వక్ర గుమ్మటం మరియు ఒక సమతల వృత్త భూమి.',
        faces: '2 ఉపరితలాలు (1 వృత్త భూమి + 1 వక్ర గుమ్మటం)',
        edges: '1 వృత్తాకార అంచు',
        vertices: '0 శీర్షాలు',
        dimensionsSummary:
          'కేవలం వ్యాసార్థం (r) తో నిర్వచించబడుతుంది. CSA = 2πr², వృత్త భూమి కలిపితే TSA = 3πr².',
        workedExample:
          'r = 7 సెం.మీ: CSA = 98π ≈ 307.88 సెం.మీ², TSA = 147π ≈ 461.81 సెం.మీ², V = (686/3)π ≈ 718.38 సెం.మీ³.',
        realWorldExample: 'గిన్నె, ప్లానిటోరియం గుమ్మటం, ఇగ్లూ మరియు సగం కోసిన పుచ్చకాయ.',
        didYouKnow:
          'గోళాన్ని సగానికి కోసినప్పుడు πr² వైశాల్యం గల కొత్త వృత్త ముఖం ఏర్పడుతుంది, కాబట్టి రెండు అర్ధగోళాల మొత్తం వైశాల్యం 6πr² అవుతుంది!',
      },
      frustum: {
        definition:
          'శంఖువు ఛిన్నకం (Frustum) అంటే శంఖువు పై భాగాన్ని భూమికి సమాంతరంగా కోసి తొలగించిన తర్వాత మిగిలే ఘనాకారం.',
        faces: '3 ఉపరితలాలు (2 సమాంతర వృత్తాలు + 1 వక్ర గోడ)',
        edges: '2 వృత్తాకార అంచులు',
        vertices: '0 శీర్షాలు',
        dimensionsSummary:
          'దిగువ వ్యాసార్థం (r₁), పై వ్యాసార్థం (r₂), ఎత్తు (h), మరియు ఏటవాలు ఎత్తు l = √(h² + (r₁ - r₂)²) తో నిర్వచించబడుతుంది.',
        workedExample:
          'r₁ = 6, r₂ = 3, h = 4 సెం.మీ: l = 5 సెం.మీ; LSA = 45π ≈ 141.37 సెం.మీ², TSA = 90π ≈ 282.74 సెం.మీ², V = 84π ≈ 263.89 సెం.మీ³.',
        realWorldExample: 'ప్లాస్టిక్ బకెట్, కాఫీ కప్పు, మెగాఫోన్ మరియు ల్యాంప్ షేడ్.',
        didYouKnow:
          'r₁ = r₂ అయినప్పుడు ఛిన్నకం సూత్రాలు ఆటోమేటిక్‌గా స్థూపం సూత్రాలుగా మారతాయి!',
      },
      octahedron: {
        definition:
          'క్రమ అష్టముఖి అనేది ప్రతి శీర్షం వద్ద నాలుగు త్రిభుజాలు కలిసే ఎనిమిది సమబాహు త్రిభుజాలతో నిర్మించిన ప్లాటోనిక్ ఘనం.',
        faces: '8 సమబాహు త్రిభుజ ముఖాలు',
        edges: '12 సమాన అಂಚులు',
        vertices: '6 శీర్షాలు',
        dimensionsSummary:
          'ఒకే ఒక అంచు పొడవు (a) తో నిర్వచించబడుతుంది. ఇది భూములతో కలిపిన రెండు చతురస్ర పిరమిడ్‌లకు సమానం.',
        workedExample:
          'a = 6 సెం.మీ: TSA = 72√3 ≈ 124.71 సెం.మీ², ఘనపరిమాణం = 72√2 ≈ 101.82 సెం.మీ³.',
        realWorldExample: '8-ముఖాల ఆట పాచిక (d8) మరియు సహజ వజ్రం/ఫ్లోరైట్ స్ఫటికాలు.',
        didYouKnow:
          'ఘనం యొక్క 6 ముఖాల కేంద్రాలను కలిపితే సరిగ్గా ఒక క్రమ అష్టముఖి ఏర్పడుతుంది!',
      },
    },
    navTabs: {
      ariaLabel: 'అప్లికేషన్ కార్యక్షేత్రం',
      explorer: 'ఆకార అన్వేషకం',
      netlab: 'నెట్ ల్యాబ్ (Net Lab)',
      tutor: 'AI ట్యూటర్',
      missions: 'మిషన్లు',
      practice: '10వ తరగతి అభ్యాసం',
      hub: 'పురోగతి & మార్గదర్శి',
    },
    netLab: {
      headerTitle: 'దశ 2 · ఇంటరాక్టివ్ నెట్ ల్యాబ్ & విస్తరణ అన్వేషకం',
      headerSubtitle:
        'అన్ని 11 ఘన నెట్‌లను చూడండి, నెట్ పరీక్ష ఆడండి, దీర్ఘఘనం/స్థూపం నెట్‌లను అధ్యయనం చేయండి, 6 దశల్లో గీయండి మరియు k² / k³ వృద్ధిని చూడండి.',
      subTabs: {
        gallery: '11 ఘన నెట్‌లు',
        checker: 'నెట్ తనిఖీ ఆట',
        cuboid: 'దీర్ఘఘన నెట్',
        cylinder: 'స్థూప నెట్',
        draw: 'నెట్ గీసే మార్గదర్శి',
        scale: 'ఘనపరిమాణ వృద్ధి',
      },
      gallery: {
        title: 'గణితపరంగా సరైన అన్ని 11 ఘన నెట్‌లు',
        subtitle:
          'ఏదైనా నెట్ ఎంచుకొని దాని 2D ఆకృతి మరియు 6 ముఖాలు ఘనంగా మడవడాన్ని చూడండి.',
        selectNetHint: '11 ఘన నెట్‌లలో ఒకదాన్ని ఎంచుకోండి',
        familyLabel: 'కుటుంబం',
        animatePlay: 'స్వయంగా మడుచు',
        animatePause: 'ఆపు',
        selectedLabel: 'ఎంచుకున్న నెట్',
        families: {
          '1-4-1': '1-4-1 వరుస (6 నెట్‌లు)',
          '2-3-1': '2-3-1 శ్రేణి (3 నెట్‌లు)',
          '2-2-2': '2-2-2 మెట్ల నెట్ (1 నెట్)',
          '3-3': '3-3 జంట వరుస (1 నెట్)',
        },
        nets: {
          net_1_4_1_cross: {
            name: '1. క్లాసిక్ సిలువ (Cross)',
            tip: 'మధ్య 4 చతురస్రాలు పక్క గోడలు కాగా, 2 ఎదురెదురు ముక్కలు భూమి మరియు పైభాగమవుతాయి.',
          },
          net_1_4_1_same_end: {
            name: '2. సమాన చివరలు',
            tip: '4-చతురస్రాల వరుసలో ఒకే నిలువు వరుసకు ఇరువైపులా మూతలు ఉంటాయి.',
          },
          net_1_4_1_step_01: {
            name: '3. 1-అడుగు మార్పు',
            tip: 'పై మరియు కింది ముక్కలు 1 చతురస్రం జరిపినా ఎదురెదురు ముఖాలవుతాయి.',
          },
          net_1_4_1_step_02: {
            name: '4. 2-అడుగుల మార్పు',
            tip: 'రెండు నిలువు వరుసల దూరం ఉన్నా 4-చతురస్రాల చుట్టు వాటిని ఎదురుగా తెస్తుంది.',
          },
          net_1_4_1_opposite_ends: {
            name: '5. వ్యతిరేక చివరలు',
            tip: 'గరిష్ట దూరంతో ఎటువంటి అతివ్యాప్తి లేకుండా పూర్తి ఘనంగా మడుచుతుంది.',
          },
          net_1_4_1_zigzag: {
            name: '6. మధ్య జిగ్‌జాగ్',
            tip: 'మధ్య వరుసలోని 2 మరియు 3వ చతురస్రాలకు అతికించిన 1-4-1 నమూనా.',
          },
          net_2_3_1_a: {
            name: '7. 2-3-1 దగ్గరి మూత',
            tip: '3 చతురస్రాలు గోడలు కాగా, 2-చతురస్రాల భాగం మిగిలిన వైపులను మూస్తుంది.',
          },
          net_2_3_1_b: {
            name: '8. 2-3-1 మధ్య మూత',
            tip: 'పైభాగ ముక్క మధ్యలో ఉన్నా మొత్తం 6 ముఖాలను సరిగ్గా కప్పుతుంది.',
          },
          net_2_3_1_c: {
            name: '9. 2-3-1 దూరపు మూత',
            tip: 'కుడి చివరి ముక్క మరియు కింది L-భాగం ఎదురెదురు ముఖాలను మూస్తాయి.',
          },
          net_2_2_2_stairs: {
            name: '10. మెట్ల ఆకారం (2-2-2)',
            tip: 'కుడి మరియు కింది మలుపులు ఘనం చుట్టూ సర్పిలంగా మడుచుతాయి.',
          },
          net_3_3_twin: {
            name: '11. జంట పట్టీలు (3-3)',
            tip: 'రెండు 3-చతురస్రాల పట్టీలు ఒక అంచు వద్ద కలిసి ఘనాన్ని సగం సగం మూస్తాయి.',
          },
        },
      },
      checker: {
        title: 'నెట్ తనిఖీ సవాలు',
        subtitle:
          'ప్రతి 2D నమూనా అతివ్యాప్తి లేకుండా ఘనంగా మడుచుతుందో లేదో నిర్ణయించండి.',
        question: 'ఇది ఘనంగా మడుచుతుందా?',
        yesButton: 'అవును, మడుచుతుంది',
        noButton: 'కాదు, మడవదు',
        correctBadge: 'సరిగ్గా చెప్పారు!',
        wrongBadge: 'తప్పు — కారణం చూడండి:',
        nextPuzzle: 'తదుపరి నమూనా',
        playAgain: 'మళ్ళీ ఆడండి',
        resetProgress: 'ప్రగతి రీసెట్ చేయండి',
        scoreLabel: 'స్కోర్',
        streakLabel: 'వరుస సరైనవి',
        bestLabel: 'ఉత్తమ స్కోర్',
        progressLabel: 'నమూనా',
        completedTitle: 'నెట్ తనిఖీ పూర్తయింది!',
        completedSummary: 'మీరు మొత్తం 12 ఘన నెట్ నమూనాలను పరీక్షించారు.',
        foldIn3D: '3D లో మడిచి చూడండి',
        hide3D: '3D ప్రివ్యూ దాచు',
        explanations: {
          valid141:
            'సరైన 1-4-1 నెట్: మధ్య 4 చతురస్రాలు గోడలు కాగా, ఇరువైపుల ముక్కలు పైభాగం మరియు భూమిని మూస్తాయి.',
          valid231:
            'సరైన 2-3-1 నెట్: ప్రతి చతురస్రం అతివ్యాప్తి లేకుండా వేర్వేరు ముఖాలపై పడుతుంది.',
          valid222:
            'సరైన 2-2-2 మెట్ల నెట్: ప్రత్యామ్నాయ లంబ మలుపులు మొత్తం 6 ముఖాలను నింపుతాయి.',
          valid33:
            'సరైన 3-3 జంట పట్టీ నెట్: ప్రతి 3-చతురస్రాల భాగం ఒక శీర్షం వద్ద కలిసే 3 ముఖాలను కప్పుతుంది.',
          validOppositeEnds:
            'సరైన 1-4-1 వ్యతిరేక చివరల నెట్: రెండు చివరలు ఎదురెదురు మూతలుగా మూసుకుంటాయి.',
          invalidSameSide:
            'తప్పు! రెండు మూతలు ఒకే వైపు ఉన్నందున ఒకదానిపై ఒకటి పడి ఎదురు వైపు తెరిచి ఉంచుతాయి.',
          invalidLine:
            'తప్పు! వరుసగా ఉన్న 6 చతురస్రాలు 4 ముఖాలపైనే రెండుసార్లు తిరిగి ఎడమ-కుడి వైపులను తెరిచి ఉంచుతాయి.',
          invalid2x2:
            'తప్పు! 2×2 చదరపు గుంపు ఉన్న నెట్ మడిచినప్పుడు ముఖాలు ఢీకొంటాయి.',
          invalidDisconnected:
            'తప్పు! చతురస్రాలు అంచు పంచుకోకుండా కేవలం మూలలో మాత్రమే తాకుతున్నాయి.',
          invalidURing:
            'తప్పు! U/C వంపులో రెండు చతురస్రాలు ఒకే స్థానంలో మడుచుతాయి.',
          invalidCount:
            'తప్పు! ఇక్కడ 5 చతురస్రాలు మాత్రమే ఉన్నాయి; ఘనానికి ఎల్లప్పుడూ 6 ముఖాలు ఉండాలి.',
        },
      },
      cuboid: {
        title: 'పేరుగల సిలువ ఆకార దీర్ఘఘన నెట్',
        subtitle:
          'l, b, h మార్చి ఎదురెదురు దీర్ఘచతురస్ర జతలు TSA గా ఎలా కలుస్తాయో చూడండి.',
        pairBaseTop: 'భూమి & పైభాగం (l × b)',
        pairFrontBack: 'ముందు & వెనుక (l × h)',
        pairLeftRight: 'ఎడమ & కుడి (h × b)',
        totalTsaLabel: 'మొత్తం ఉపరితల వైశాల్యం (6 దీర్ఘచతురస్రాల మొత్తం)',
        openIn3D: '3D దీర్ఘఘనంలో తెరవండి',
      },
      cylinder: {
        title: 'స్థూప నెట్: 1 దీర్ఘచతురస్రం + 2 వృత్తాలు',
        subtitle:
          'స్థూపాన్ని విప్పినప్పుడు ఒక దీర్ఘచతురస్రం మరియు రెండు సమాన వృత్తాలు వస్తాయి.',
        rectLabel: 'వక్ర గోడ (దీర్ఘచతురస్రం)',
        circleTopLabel: 'పై వృత్తం',
        circleBottomLabel: 'భూమి వృత్తం',
        circumferenceRuleTitle: 'దీర్ఘచతురస్రం పొడవు = 2πr ఎందుకు?',
        circumferenceRuleBody:
          'గొట్టంలా చుట్టినప్పుడు దీర్ఘచతురస్రం వెడల్పు వృత్తపు చుట్టుకొలతను ఖచ్చితంగా చుట్టుకోవాలి—కాబట్టి దీని పొడవు 2πr కు సమానం!',
        rectWidthLabel: 'దీర్ఘచతురస్రం వెడల్పు = చుట్టుకొలత (2πr)',
        rectHeightLabel: 'దీర్ఘచతురస్రం ఎత్తు (h)',
        circleRadiusLabel: 'వృత్త వ్యాసార్థం (r)',
        capAreaLabel: 'ఒక్క వృత్త వైశాల్యం (πr²)',
        curvedAreaLabel: 'దీర్ఘచతురస్ర వైశాల్యం (2πr × h = 2πrh)',
        openIn3D: '3D స్థూపంలో తెరవండి',
      },
      draw: {
        title: '6 సులభ దశల్లో నెట్ గీయండి',
        subtitle:
          'ఏదైనా 3D ఘనానికి 2D నెట్ గీసేటప్పుడు ఈ 6 దశలను అనుసరించండి.',
        stepPrefix: 'దశ',
        previous: 'వెనుకకు',
        next: 'తదుపరి',
        restart: 'మళ్ళీ ప్రారంభించండి',
        finishMessage: 'ఏ 3D నెట్ అయినా గీసి తనిఖీ చేయడానికి సిద్ధం!',
        steps: {
          s1: {
            title: '1. విప్పిన ఘనాన్ని ఊహించుకోండి',
            body: 'ఒక అట్టపెట్టె అంచులను కత్తిరించి బల్లపై చదునుగా పరిచినట్లు ఊహించండి.',
            checklist: 'మడత అంచులు కత్తిరించకుండా కలిసి ఉండాలి.',
          },
          s2: {
            title: '2. ముఖాలను గుర్తించండి',
            body: 'అన్ని ముఖాలను లెక్కించండి: ఘనానికి 6 చతురస్రాలు, దీర్ఘఘనానికి 3 జతలు, స్థూపానికి 1 దీర్ఘచతురస్రం + 2 వృత్తాలు.',
            checklist: 'ప్రతి ముఖం పొడవు, వెడల్పులను రాసుకోండి.',
          },
          s3: {
            title: '3. భూమిని గీయండి',
            body: 'కాగితం మధ్యలో ఖచ్చితమైన కొలతలతో తల/భూమి ముఖాన్ని ముందుగా గీయండి.',
            checklist: 'నాలుగు వైపులా పక్క ముఖాలకు స్థలం ఉంచండి.',
          },
          s4: {
            title: '4. ఇతర ముఖాలను జతచేయండి',
            body: 'భూమి అంచుల వెంట సమాన పొడవు గల పక్క గోడలను అతికించి గీయండి.',
            checklist: 'కలిసే అంచుల పొడవులు సమానంగా ఉండాలి.',
          },
          s5: {
            title: '5. మిగిలిన ముఖాలను చేర్చండి',
            body: 'పైభాగ మూతను (Top) ఒక పక్క గోడ బయటి అంచుకు జతచేయండి.',
            checklist: 'పైభాగం మరియు భూమి ఒకే కొలత (l × b) కలిగి ఉంటాయి.',
          },
          s6: {
            title: '6. మనస్సులో మడిచి తనిఖీ చేయండి',
            body: 'ప్రతి మడతను 90° పైకి మడిచి ఎటువంటి అతివ్యాప్తి లేకుండా మూసుకుంటుందో లేదో చూడండి.',
            checklist: 'మొత్తం 6 ముఖాలు సరిగ్గా కలుస్తున్నాయో నిర్ధారించుకోండి.',
          },
        },
      },
      scale: {
        title: 'ఘనపరిమాణం & ఉపరితల వైశాల్య విస్తరణ (k, k², k³)',
        subtitle:
          'ప్రతి కొలతను k రెట్లు (1× నుండి 3×) పెంచి వైశాల్యం k² మరియు ఘనపరిమాణం k³ రెట్లు ఎలా పెరుగుతాయో చూడండి.',
        scaleFactorLabel: 'స్కేల్ కారకం (k)',
        shapeLabel: 'పరీక్ష ఘనం',
        originalHeader: 'అసలు (1×)',
        scaledHeader: 'విస్తరించినది (k×)',
        dimensionsRow: 'రేఖీయ కొలతలు (× k)',
        lsaRow: 'LSA / CSA (× k²)',
        tsaRow: 'TSA (× k²)',
        volumeRow: 'ఘనపరిమాణం (× k³)',
        areaScaleFormula: 'వైశాల్యం k² రెట్లు పెరుగుతుంది',
        volumeScaleFormula: 'ఘనపరిమాణం k³ రెట్లు పెరుగుతుంది',
        insightTitle: 'ఘనపరిమాణం ఎందుకు వేగంగా పెరుగుతుంది?',
        insightBody:
          'అంచును రెట్టింపు (2×) చేస్తే వైశాల్యం 2² = 4× అవుతుంది; కానీ ఘనపరిమాణం పొడవు, వెడల్పు, ఎత్తు మూడు దిశల్లో పెరిగి 2³ = 8× అవుతుంది! 3× అయితే 9× వైశాల్యం, 27× ఘనపరిమాణం!',
      },
    },
    tutor: {
      headerTitle: 'క్షేత్రగణితం & 3D నెట్ అధ్యయన ట్యూటర్',
      headerSubtitle:
        '15 3D ఆకారాలు, సూత్రాలు, ఉపరితల వైశాల్యం, ఘనపరిమాణం, నెట్‌లు మరియు దశలవారీ లెక్కలను అడగండి.',
      demoBadge: 'డెమో ట్యూటర్ (ఆఫ్‌లైన్ గణిత ఇంజిన్)',
      liveBadge: 'లైవ్ AI కనెక్ట్ అయింది (సర్వర్ ప్రాక్సీ)',
      demoNoticeTitle: 'డెమో మోడ్ గమనిక: లైవ్ AI API కీ కనెక్ట్ చేయలేదు',
      demoNoticeBody:
        'ఈ సమాధానాలు NetFold 3D స్థానిక గణిత ఇంజిన్ ద్వారా రూపొందించబడ్డాయి (Archify డయాగ్రామ్ స్కిల్ మాత్రమే, AI API కాదు). బ్రౌజర్‌లో కీలు బహిర్గతం కాకుండా లైవ్ AI కోసం సర్వర్‌లో GEMINI_API_KEY తో POST /api/tutor ప్రాక్సీ అవసరం.',
      fallbackFromErrorBanner:
        'AI సర్వర్ అందకపోవడంతో స్థానిక డెమో ట్యూటర్ సమాధానం ఇచ్చింది.',
      archToggleShow: 'లైవ్ AI ఎలా కలపాలి?',
      archToggleHide: 'నిర్మాణ సమాచారం దాచు',
      archTitle: 'లైవ్ AI కోసం సురక్షిత బ్యాకెండ్ విధానం',
      archSteps: {
        s1: '1. POST /api/tutor అందించే చిన్న బ్యాకెండ్ ప్రాక్సీ (Node/Express, Netlify/Vercel లేదా Cloudflare Worker) ఏర్పాటు చేయండి.',
        s2: '2. GEMINI_API_KEY ని సర్వర్‌లో మాత్రమే ఉంచండి — ఫ్రంట్‌ఎండ్ VITE_* లో ఎప్పుడూ ఉంచకండి.',
        s3: '3. VITE_TUTOR_ENDPOINT=/api/tutor సెట్ చేస్తే AITutor.jsx ఆకార వివరాలతో సురక్షితంగా అభ్యర్థన పంపుతుంది.',
      },
      contextTitle: 'ప్రస్తుతం ఎంచుకున్న ఆకారం',
      openExplorerButton: '3D అన్వేషకంలో తెరవండి',
      liveValuesLabel: 'ప్రస్తుత విలువలు',
      suggestedTitle: 'సూచించిన ప్రశ్నలు',
      suggested: {
        s1: 'ప్రస్తుత కొలతలతో {shape} గురించి దశలవారీగా వివరించండి',
        s2: '{shape} యొక్క LSA, TSA మరియు ఘనపరిమాణ సూత్రాలు ఏమిటి?',
        s3: '{shape} యొక్క 2D నెట్ ఎలా మడుచుకుంటుంది?',
        s4: 'ఎన్ని సరైన ఘన నెట్‌లు ఉన్నాయి మరియు తప్పు నెట్‌లు ఎందుకు మడవవు?',
        s5: 'సాధించండి: దీర్ఘఘనం l=10, b=6, h=4 యొక్క LSA, TSA & ఘనపరిమాణం',
      },
      clearChat: 'చాట్ క్లియర్ చేయండి',
      emptyTitle: 'మీ గణిత ప్రశ్నను క్రింద అడగండి',
      emptyBody:
        'పై ప్రశ్నలను నొక్కండి లేదా "స్థూపం r=3 h=5 TSA మరియు ఘనపరిమాణం" అని టైప్ చేయండి.',
      inputPlaceholder:
        'ఆకారాలు, సూత్రాలు, నెట్‌లు లేదా లెక్కల గురించి అడగండి...',
      sendButton: 'ట్యూటర్‌ను అడగండి',
      thinkingText: 'లెక్కిస్తోంది...',
      studentLabel: 'విద్యార్థి',
      demoMessageTag: 'డెమో ట్యూటర్ · ఆఫ్‌లైన్ గణిత ఇంజిన్',
      liveMessageTag: 'లైవ్ AI ట్యూటర్',
      templates: {
        solvedForPrefix: 'దశలవారీ పరిష్కారం:',
        currentContextPrefix: 'మీరు ఎంచుకున్న ఆకారం ప్రకారం:',
        netHeading: '2D నెట్ మరియు మడత వివరణ',
        cubeNetsCountNote:
          'గణితపరంగా విభిన్న ఘన నెట్‌లు 1-4-1 (6), 2-3-1 (3), 2-2-2 (1), మరియు 3-3 (1) వర్గాల్లో ఉన్నాయి.',
        scaleHeading: 'స్కేల్ విస్తరణ విశ్లేషణ',
        formulaHeading: 'సూత్రాలు & ప్రత్యక్ష గణన',
        netByShape: {
          cube: 'ఘనం 11 సరైన నెట్‌లలో ఒకటిగా 6 చతురస్రాలుగా విప్పుతుంది; 2×2 బ్లాక్ లేదా 6-వరుస నెట్ మడిచినప్పుడు ఢీకొంటాయి.',
          cuboid:
            'దీర్ఘఘనం 3 జతల సమాన దీర్ఘచతురస్రాలతో 6 ముఖాల సిలువ నెట్‌గా విప్పుతుంది: 2(l×b), 2(l×h), 2(h×b).',
          cylinder:
            'స్థూపం 2πr వెడల్పు (వృత్త చుట్టుకొలత) మరియు h ఎత్తు గల 1 దీర్ఘచతురస్రం + 2 వృత్తాలుగా (πr²) విప్పుతుంది.',
          cone: 'శంఖువు వృత్తాకార భూమి (πr²) మరియు వ్యాసార్థం l = √(r² + h²) గల వృత్త ఖండంగా విప్పుతుంది.',
          square_pyramid:
            'చతురస్ర పిరమిడ్ 1 చతురస్ర భూమి మరియు దాని 4 అంచులకు కలిపిన 4 సమద్విబాహు త్రిభుజాలుగా విప్పుతుంది.',
          sphere:
            'గోళానికి ఖచ్చితమైన చదునైన నెట్ ఉండదు—సాగదీయకుండా లేదా చించకుండా కాగితంపై పరచలేము.',
          triangular_prism:
            'త్రిభుజాకార ప్రిజమ్ 2 సమబాహు త్రిభుజ భూములు మరియు 3 దీర్ఘచతురస్ర గోడలుగా విప్పుతుంది.',
          triangular_pyramid:
            'త్రిభుజాకార పిరమిడ్ 1 త్రిభుజ భూమి మరియు 3 పక్క త్రిభుజ ముఖాలుగా విప్పుతుంది.',
          pentagonal_prism:
            'పంచభుజి ప్రిజమ్ 2 పంచభుజులు మరియు 5 దీర్ఘచతురస్ర గోడలుగా విప్పుతుంది.',
          hexagonal_prism:
            'షడ్భుజి ప్రిజమ్ 2 షడ్భుజులు మరియు 6 దీర్ఘచతురస్ర గోడలుగా విప్పుతుంది.',
          pentagonal_pyramid:
            'పంచభుజి పిరమిడ్ 1 పంచభుజి భూమి మరియు 5 త్రిభుజ ముఖాలుగా విప్పుతుంది.',
          hexagonal_pyramid:
            'షడ్భుజి పిరమిడ్ 1 షడ్భుజి భూమి మరియు 6 త్రిభుజ ముఖాలుగా విప్పుతుంది.',
          hemisphere:
            'అర్ధగోళం యొక్క వక్ర గుమ్మటం రెండు దిశల్లో వంగి ఉండటం వల్ల ఖచ్చితమైన చదునైన నెట్ ఉండదు.',
          frustum:
            'శంఖు ఛిన్నకం వక్ర పట్టీ π(r₁ + r₂)l మరియు r₁, r₂ వ్యాసార్థం గల రెండు వృత్తాలుగా విప్పుతుంది.',
          octahedron:
            'క్రమ అష్టముఖి కలిసిన 8 సమబాహు త్రిభుజ ముఖాల నెట్‌గా విప్పుతుంది.',
        },
      },
    },
    practice: {
      headerTitle: 'NCERT క్షేత్రగణితం – 10వ తరగతి సాధించిన అభ్యాసం',
      headerSubtitle:
        'భావనలు, ఉత్పాదన, దశలవారీ గణనలు, లేబుల్ చేసిన 3D నమూనాలు మరియు రేఖాచిత్రాలతో బోర్డు పరీక్ష శైలి లిఖిత సమాధానాలు (ప్రశ్నలు 1–10).',
      boardExamTag: 'బోర్డు పరీక్ష లిఖిత సమాధానం · 10వ తరగతి NCERT',
      progressPrefix: 'ప్రశ్న',
      questionSelectorAria: 'సాధించిన ప్రశ్నను ఎంచుకోండి',
      previousButton: 'మునుపటిది',
      nextButton: 'తదుపరిది',
      expandAll: 'అన్ని దశలను విస్తరించండి',
      collapseAll: 'అన్నీ కుదించండి',
      stepBadgePrefix: 'దశ',
      diagramSectionTitle: 'లేబుల్ చేసిన 3D నమూనా & గణిత రేఖాచిత్రం',
      interactive3DTab: 'ఇంటరాక్టివ్ 3D నమూనా',
      diagramTab: '2D గణిత రేఖాచిత్రం',
      togglePrimaryModel: 'ప్రాథమిక ఘనాకృతి',
      toggleCompareModel: 'ఫలిత ఘనాకృతిని పోల్చండి',
      foldSliderLabel: 'మడత / విప్పు ప్రివ్యూ',
      openInExplorer: '3D అన్వేషకంలో తెరవండి',
      scaleNoticePrefix:
        'స్పష్టత కోసం 3D నమూనా నిష్పత్తిలో చూపబడింది; ఖచ్చితమైన NCERT కొలతలు లేబుళ్లలో ఉన్నాయి:',
      writtenPracticeNote: 'వివరణాత్మక లిఖిత సమాధాన విభాగం (MCQ క్విజ్ కాదు)',
      diagramLabels: {
        radius: 'వ్యాసార్థం',
        diameter: 'వ్యాసం',
        height: 'ఎత్తు',
        slantHeight: 'ఏటవాలు ఎత్తు',
        edge: 'అంచు',
        baseArea: 'భూమి వైశాల్యం',
        surfaceArea: 'ఉపరితల వైశాల్యం',
        volume: 'ఘనపరిమాణం',
        cutPlane: 'కోసిన తలం (+πr²)',
        joinedFace: 'కలిసిన ముఖం (-2a² దాచబడింది)',
        inscribedCone: 'అతిపెద్ద అంతర్గత శంఖువు',
        hemisphereBowl: 'అర్ధగోళ ఉపరితలం',
        flatCircularBase: 'సమతల వృత్తాకార భూమి',
        semicircleArc: 'అర్ధవృత్త ప్రాంతం',
      },
      stepTitles: {
        s1: '1. అసలు ప్రశ్న ప్రకటన',
        s2: '2. సంబంధిత నిర్వచనం & భావన',
        s3: '3. ఇచ్చిన సమాచారం',
        s4: '4. కనుగొనవలసినది',
        s5: '5. సంబంధిత గణిత సూత్రం',
        s6: '6. దశలవారీ ఉత్పాదన',
        s7: '7. విలువల ప్రతిక్షేపణ',
        s8: '8. వివరణాత్మక గణనలు',
        s9: '9. సరైన ప్రమాణాలతో తుది సమాధానం',
        s10: '10. సంబంధిత లేబుల్ చేసిన 3D నమూనా & గణిత రేఖాచిత్రం',
      },
    },
    themeToggle: {
      lightLabel: 'లైట్',
      darkLabel: 'డార్క్',
      switchToDark: 'డార్క్ థీమ్‌కు మార్చండి',
      switchToLight: 'లైట్ థీమ్‌కు మార్చండి',
    },
    canvasControls: {
      lockZoom: 'స్క్రోల్ లాక్',
      unlockZoom: 'జూమ్ తెరవండి',
      zoomIn: '3D జూమ్ ఇన్',
      zoomOut: '3D జూమ్ అవుట్',
      scrollSafeNote: 'స్క్రోల్ పేజీని కదుపుతుంది · డ్రాగ్ 3D తిప్పుతుంది',
    },
    search: {
      buttonLabel: 'శోధించండి',
      placeholder: '15 ఆకారాలు, 10వ తరగతి ప్రశ్నలు, మిషన్లు వెతకండి…',
      emptyPrompt: 'ఆకారం, సూత్రం, మిషన్ లేదా ప్రశ్న పేరు టైప్ చేయండి.',
      noResults: 'సరిపోయే ఫలితాలు ఏవీ కనుగొనబడలేదు.',
      closeLabel: 'శోధన మూసివేయండి',
      shortcutHint: '/ లేదా Ctrl+K నొక్కండి',
      categories: {
        shapes: '3D ఆకారం',
        missions: 'మిషన్',
        practice: '10వ తరగతి అభ్యాసం',
        netlab: 'నెట్ ల్యాబ్',
        sections: 'పురోగతి & మార్గదర్శి',
      },
    },
    bookmarks: {
      addShape: 'ఆకారం బుక్‌మార్క్ చేయండి',
      removeShape: 'బుక్‌మార్క్ తొలగించండి',
      addQuestion: 'ప్రశ్న బుక్‌మార్క్ చేయండి',
      removeQuestion: 'ప్రశ్న బుక్‌మార్క్ తొలగించండి',
      shapesHeading: 'బుక్‌మార్క్ చేసిన ఆకారాలు',
      questionsHeading: 'బుక్‌మార్క్ చేసిన 10వ తరగతి ప్రశ్నలు',
      emptyTitle: 'ఇంకా బుక్‌మార్క్‌లు లేవు',
      emptyHint: 'సేవ్ చేయడానికి ఏదైనా 3D ఆకారం లేదా ప్రశ్నపై స్టార్ బటన్ నొక్కండి.',
      openButton: 'తెరవండి',
    },
    missionsUi: {
      headerTitle: 'ఇంటరాక్టివ్ క్షేత్రగణిత మిషన్లు',
      headerSubtitle:
        '3D నెట్‌లు, గోడ పెయింటింగ్, నీటి ట్యాంక్ మరియు ప్యాకేజింగ్ సవాళ్లను పరిష్కరించి ఒక్కో మిషన్‌కు 3 నక్షత్రాల వరకు పొందండి!',
      progressBadge: 'పూర్తయిన మిషన్లు',
      starsEarnedLabel: 'సాధించిన నక్షత్రాలు',
      completedTag: 'పూర్తయింది',
      inProgressTag: 'పూర్తి కాలేదు',
      attemptsLabel: 'ప్రయత్నాలు',
      selectChallenge: 'సవాలు రౌండ్',
      baseFaceTag: 'ఆధార ముఖం',
      chooseTopFace: 'మడిచిన తర్వాత ఏ సంఖ్య చదరం పైభాగ (TOP) ముఖం అవుతుంది?',
      faceOptionPrefix: 'ముఖం',
      foldTestLabel: 'ఇంటరాక్టివ్ 3D మడత ప్రివ్యూ',
      roomDimensionsTag: 'గది: l = 8 m, b = 6 m, h = 4 m (నేల & పైకప్పు మినహాయించి)',
      enterWallsArea: '4 గోడల వైశాల్యం నమోదు చేయండి (m²)',
      radiusLabel: 'ట్యాంక్ వ్యాసార్థం r (m)',
      heightLabel: 'ట్యాంక్ ఎత్తు h (m)',
      lengthLabel: 'పొడవు l (cm)',
      breadthLabel: 'వెడల్పు b (cm)',
      targetLabel: 'లక్ష్యం',
      computedLabel: 'మీ ప్రస్తుత విలువ',
      litresUnit: 'లీటర్లు',
      selectReasonLabel: 'ఈ ఆకారం కార్డ్‌బోర్డ్ (TSA) తగ్గించడానికి కారణం ఏమిటి?',
      checkAnswer: 'సరిచూడండి',
      retryButton: 'మళ్ళీ ప్రయత్నించండి',
      resetButton: 'మిషన్ రీసెట్',
      resetAllButton: 'అన్ని మిషన్లు రీసెట్',
      listenButton: 'వాయిస్ వినండి',
      stopAudioButton: 'వాయిస్ ఆపండి',
      audioUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రీడ్-అలౌడ్ అందుబాటులో లేదు.',
      hintLockedNote: '2 తప్పు ప్రయత్నాల తర్వాత సూచనలు స్వయంచాలకంగా తెరుచుకుంటాయి.',
      hintUnlockedTitle: 'సహాయక సూచన తెరుచుకుంది',
      hintFormulaPrefix: 'సూచన',
      mistakeFloorCeiling:
        'దగ్గరగా ఉన్నారు! మీరు నేల మరియు పైకప్పు (96 m²) కలిపారు. LSA = 2h(l + b) వాడండి.',
      mistakeVolumeMismatch:
        'l × b × h = 64 cm³ వచ్చేలా కొలతలు సర్దుబాటు చేయండి.',
      mistakeNotMinimum:
        'ఘనపరిమాణం 64 cm³ సరిపోతుంది, కానీ ఉపరితల వైశాల్యం ఇంకా తగ్గించవచ్చు! సమాన అంచులు ప్రయత్నించండి.',
      mistakeSelectReason:
        'కనిష్ట వైశాల్యం సరిగ్గా ఉంది — ఇప్పుడు క్రింది సరైన గణిత కారణాన్ని ఎంచుకోండి!',
      mistakeTooSmall:
        'ట్యాంక్ ఘనపరిమాణం 1540 L కంటే తక్కువగా ఉంది. r లేదా h పెంచండి.',
      mistakeTooLarge:
        'ట్యాంక్ ఘనపరిమాణం 1540 L కంటే ఎక్కువగా ఉంది. r లేదా h తగ్గించండి.',
      successTitle: 'మిషన్ విజయవంతమైంది!',
      closeModal: 'కొనసాగండి',
    },
    hub: {
      headerTitle: 'అభ్యాస పురోగతి, బుక్‌మార్క్‌లు & మార్గదర్శి',
      headerSubtitle:
        '15 ఆకారాలు, 4 మిషన్లు, 10వ తరగతి ప్రశ్నలు, సేవ్ చేసిన బుక్‌మార్క్‌లు మరియు కీబోర్డ్ సహాయాన్ని చూడండి.',
      tabs: {
        progress: 'పురోగతి & బ్యాడ్జీలు',
        bookmarks: 'బుక్‌మార్క్‌లు',
        help: 'సహాయం & కీబోర్డ్',
        about: 'గురించి & నిర్మాణం',
      },
      stats: {
        overallMastery: 'మొత్తం నైపుణ్యం',
        shapesExplored: 'చూసిన ఆకారాలు',
        missionsDone: 'పూర్తయిన మిషన్లు',
        starsEarned: 'మిషన్ నక్షత్రాలు',
        practiceReviewed: '10వ తరగతి అభ్యాసం',
        netCheckerBest: 'నెట్ పరీక్ష అత్యుత్తమ స్కోర్',
      },
      badgesTitle: 'విజయ బ్యాడ్జీలు',
      unlockedTag: 'అన్‌లాక్ అయింది',
      lockedTag: 'ప్రగతిలో ఉంది',
      badges: {
        first_fold: {
          title: 'మొదటి మడత అన్వేషకుడు',
          desc: 'మొదటి 3D ఘనాకృతిని పరిశీలించండి.',
        },
        class8_complete: {
          title: '8వ తరగతి పునాది',
          desc: 'ఘనం, దీర్ఘఘనం మరియు స్థూపం అన్వేషించండి.',
        },
        master_15: {
          title: '15 ఆకారాల మాస్టర్',
          desc: 'అన్ని 15 3D ఆకారాలను అన్వేషించండి.',
        },
        mission_challenger: {
          title: 'అనువర్తిత సవాలుదారు',
          desc: 'కనీసం 2 ఇంటరాక్టివ్ మిషన్లను పూర్తి చేయండి.',
        },
        star_achiever: {
          title: 'అన్ని మిషన్ల ఛాంపియన్',
          desc: 'అన్ని 4 నిజ జీవిత క్షేత్రగణిత మిషన్లను పూర్తి చేయండి.',
        },
        board_scholar: {
          title: '10వ తరగతి బోర్డు పండితుడు',
          desc: 'అన్ని 10 NCERT 10వ తరగతి ప్రశ్నలను చదవండి.',
        },
      },
      quickResumeTitle: 'త్వరిత లింక్‌లు',
      resumeExplorer: '3D అన్వేషకం తెరవండి',
      resumeMissions: 'మిషన్లకు వెళ్ళండి',
      resumePractice: '10వ తరగతి అభ్యాసం కొనసాగించండి',
      helpTitle: 'NetFold 3D ఉపయోగించే విధానం',
      helpSteps: {
        s1: {
          title: '1. ఆకార అన్వేషకం (15 ఘనాకృతులు)',
          desc: 'ఆకారాన్ని ఎంచుకుని 0% నెట్ నుండి 100% ఘనం వరకు మడిచి ప్రతి ముఖ వైశాల్యాన్ని చూడండి.',
        },
        s2: {
          title: '2. మిషన్లు (వాయిస్ & సూచనలు)',
          desc: '3D దృశ్యాలతో 4 నిజ జీవిత సవాళ్లను పరిష్కరించండి. 2 తప్పు ప్రయత్నాల తర్వాత సూచన తెరుచుకుంటుంది.',
        },
        s3: {
          title: '3. నెట్ ల్యాబ్ & 10వ తరగతి అభ్యాసం',
          desc: '11 ఘన నెట్‌లు, k²/k³ పెరుగుదల మరియు 10-దశల బోర్డు పరీక్ష సమాధానాలను సులభ స్క్రోల్‌తో చదవండి.',
        },
        s4: {
          title: '4. ఆఫ్‌లైన్ సేవింగ్ & 5 భాషలు',
          desc: 'పురోగతి, నక్షత్రాలు, థీమ్ మరియు బుక్‌మార్క్‌లు localStorage లో సేవ్ అవుతాయి.',
        },
      },
      shortcutsTitle: 'కీబోర్డ్ షార్ట్‌కట్‌లు',
      shortcuts: {
        search: 'గ్లోబల్ సెర్చ్ కోసం Ctrl + K లేదా / నొక్కండి',
        closeModal: 'విండో మూసివేయడానికి Esc నొక్కండి',
        navigateTabs: 'నియంత్రణల మధ్య మారడానికి Tab / Shift + Tab ఉపయోగించండి',
        adjustSliders: 'స్లైడర్లను మార్చడానికి ఎడమ / కుడి బాణం కీలు వాడండి',
      },
      aboutTitle: 'NetFold 3D గురించి & అభ్యాస లక్ష్యాలు',
      aboutPurpose:
        'NetFold 3D అనేది NCERT 8–10వ తరగతి క్షేత్రగణితం కోసం రూపొందించిన ఆఫ్‌లైన్ 3D గణిత ప్రయోగశాల. 2D నెట్‌లు 3D ఆకారాలుగా ఎలా మడతపడతాయో విద్యార్థులు ప్రత్యక్షంగా చూడగలరు.',
      aboutObjectivesTitle: 'ప్రధాన అభ్యాస లక్ష్యాలు',
      aboutObjectives: {
        o1: 'పట్టకం, పిరమిడ్, శంఖువు మరియు ఛిన్నకం 2D నెట్ మడతలను దృశ్యమానం చేయడం.',
        o2: 'పక్కతల వైశాల్యం (LSA) మరియు సంపూర్ణ ఉపరితల వైశాల్యం (TSA) తేడాను స్పష్టంగా గ్రహించడం.',
        o3: 'గోళం & అర్ధగోళాలకు ఖచ్చితమైన సమతల నెట్ ఎందుకు లేదో అర్థం చేసుకోవడం.',
        o4: '5 భారతీయ భాషలలో దశలవారీ బోర్డు పరీక్ష సమాధానాలను అభ్యసించడం.',
      },
      aboutArchTitle: 'క్లయింట్-సైడ్ నిర్మాణం (Archify సారాంశం)',
      aboutArchBody:
        'React 19, Three.js / React Three Fiber, Tailwind CSS మరియు Vite PWA తో నిర్మించబడింది. విడివిడి మాడ్యూల్స్ గణిత ఇంజిన్, నెట్ జ్యామితి, 3D కాన్వాస్, 5-భాషల అనువాదం మరియు స్థానిక స్టోరేజ్‌ను నిర్వహిస్తాయి.',
      aboutHonestyNote:
        'AI గమనిక: ఇందులోని AI ట్యూటర్ బ్రౌజర్‌లోనే పనిచేసే స్థానిక గణిత పరిష్కారి (నకిలీ లైవ్ AI కాదు).',
    },
  },

  hi: {
    appTitle: 'NetFold 3D',
    appSubtitle: 'इंटरैक्टिव 3D क्षेत्रमिति प्रयोगशाला',
    languageSelectLabel: 'भाषा',
    languageSelectAria: 'ऐप की भाषा चुनें',
    shapeSectionTitle: '3D आकृति चुनें (15 आकृतियाँ)',
    class8CategoryLabel: 'कक्षा 8 NCERT',
    beyondClass8CategoryLabel: 'कक्षा 8 से आगे',
    beyondClass8Badge: 'कक्षा 8 से आगे (कक्षा 9/10 विषय)',
    beyondSubgroups: {
      prisms: 'प्रिज्म (Prisms)',
      pyramids: 'पिरामिड (Pyramids)',
      curvedAndPlatonic: 'वक्र और प्लेटोनी ठोस',
    },
    shapes: {
      cube: 'घन',
      cuboid: 'घनाभ',
      cylinder: 'बेलन',
      cone: 'शंकु',
      square_pyramid: 'वर्गाकार पिरामिड',
      sphere: 'गोला',
      triangular_prism: 'त्रिभुजाकार प्रिज्म',
      triangular_pyramid: 'त्रिभुजाकार पिरामिड (चतुष्फलक)',
      pentagonal_prism: 'पंचभुजाकार प्रिज्म',
      hexagonal_prism: 'षट्भुजाकार प्रिज्म',
      pentagonal_pyramid: 'पंचभुजाकार पिरामिड',
      hexagonal_pyramid: 'षट्भुजाकार पिरामिड',
      hemisphere: 'अर्धगोला',
      frustum: 'शंकु का छिन्नक (Frustum)',
      octahedron: 'अष्टफलक (Octahedron)',
    },
    foldSectionTitle: 'जाल मोड़ना',
    foldPresets: {
      flat: '0% समतल',
      half: '50% आधा',
      closed: '100% ठोस',
    },
    foldStage: {
      flat: 'समतल 2D जाल',
      folding: 'मोड़ना जारी है',
      closed: 'बंद 3D ठोस',
      noNet: '3D ठोस (कोई सटीक समतल जाल नहीं)',
    },
    sphereNoNetMessage:
      'गोले का कोई समतल जाल नहीं होता, इसलिए इसे मोड़ा नहीं जा सकता।',
    hemisphereNoNetMessage:
      'अर्धगोले का कोई सटीक समतल जाल नहीं होता, इसलिए इसके वक्र गुंबद को समतल नहीं मोड़ा जा सकता।',
    sphereLsaNotApplicable: 'गोले के लिए लागू नहीं होता',
    octahedronLsaNotApplicable:
      'लागू नहीं होता (सभी 8 समबाहु त्रिभुजाकार फलक समान हैं)',
    dimensionsSectionTitle: 'माप',
    dimensionLabels: {
      a: 'भुजा (a)',
      baseSideA: 'आधार भुजा (a)',
      l: 'लंबाई (l)',
      b: 'चौड़ाई (b)',
      h: 'ऊँचाई (h)',
      r: 'त्रिज्या (r)',
      r1: 'निचली त्रिज्या (r₁)',
      r2: 'ऊपरी त्रिज्या (r₂)',
      slantL: 'तिर्यक ऊँचाई (l)',
      slantS: 'तिर्यक ऊँचाई (s)',
      diameter: 'व्यास (2r)',
    },
    unitsSectionTitle: 'इकाई',
    unitNames: {
      cm: 'सेंटीमीटर (सेमी)',
      m: 'मीटर (मी)',
    },
    unitShort: {
      cm: 'सेमी',
      m: 'मी',
    },
    unitSymbols: {
      cm: { length: 'सेमी', area: 'सेमी²', volume: 'सेमी³' },
      m: { length: 'मी', area: 'मी²', volume: 'मी³' },
    },
    unitHintTitle: 'मीटर में बहुत बड़े मान',
    unitHintBody:
      '5 मी या अधिक के मान कमरे या टंकी जैसी बड़ी वस्तुओं को दर्शाते हैं। क्या आपका आशय सेंटीमीटर (cm) से था?',
    unitHintSwitch: 'सेमी में बदलें',
    highlightSectionTitle: 'दृश्य हाइलाइट',
    highlightModes: {
      all: 'सामान्य',
      lsa: 'LSA',
      tsa: 'TSA',
      volume: 'आयतन',
    },
    highlightDescriptions: {
      all: 'सभी फलक अलग-अलग शैक्षिक रंगों में दिखाए गए हैं।',
      lsa: 'केवल पार्श्व या वक्र फलक हाइलाइट किए गए हैं; आधार/शीर्ष धुंधले हैं।',
      tsa: 'सभी बाहरी सतहें हाइलाइट हैं क्योंकि TSA सभी फलकों का योग है।',
      volume: 'ठोस के भीतर पारदर्शी भराव 3D आयतन को दर्शाता है।',
    },
    canvasHint:
      'घुमाने के लिए खींचें · ज़ूम के लिए स्क्रॉल/पिंच करें · फलक टैप करें',
    noNetCanvasHint:
      'घुमाने के लिए खींचें · ज़ूम के लिए स्क्रॉल/पिंच करें · वक्र 3D ठोस',
    resetCamera: 'दृश्य रीसेट करें',
    volumeFoldHint: 'पूरा आयतन देखने के लिए 100% तक मोड़ें',
    tapFaceHint: 'जाँचने के लिए जाल या सूची में किसी भी फलक पर टैप करें',
    clearSelection: 'साफ़ करें',
    selectedFacePrefix: 'चयनित',
    faceBadgePrefix: 'फलक',
    sideWallPrefix: 'दीवार',
    faceNames: {
      bottom: 'आधार',
      front: 'सामने',
      back: 'पीछे',
      top: 'शीर्ष',
      left: 'बायाँ',
      right: 'दायाँ',
      lateral: 'वक्र पृष्ठ',
      surface: 'वक्र पृष्ठ',
    },
    faceRoles: {
      base: 'आधार',
      top: 'शीर्ष',
      lateral: 'पार्श्व फलक',
      curved: 'वक्र पृष्ठ',
      face: 'त्रिभुजाकार फलक',
    },
    faceBreakdownTitle: 'फलक क्षेत्रफल (जाल विवरण)',
    sumOfFacesLabel: 'सभी फलकों का योग = TSA',
    sphereSurfaceBreakdownNote: 'सभी दिशाओं में एक सतत वक्र पृष्ठ',
    formulaCardTitle: 'चरण-दर-चरण सूत्र और मान प्रतिस्थापन',
    slantHeightStepLabel: 'तिर्यक ऊँचाई',
    volumeLabel: 'आयतन (Volume)',
    lsaLabel: 'पार्श्व पृष्ठीय क्षेत्रफल (LSA)',
    csaLabel: 'वक्र पृष्ठीय क्षेत्रफल (CSA)',
    tsaLabel: 'कुल पृष्ठीय क्षेत्रफल (TSA)',
    surfaceAreaLabel: 'पृष्ठीय क्षेत्रफल (TSA)',
    lsaExcludedTitle: 'LSA में आधार/शीर्ष को क्यों छोड़ा जाता है',
    lsaExclusionNote: {
      cube: 'LSA केवल 4 पार्श्व दीवारों (4a²) को गिनता है। शीर्ष + आधार (2a²) शामिल नहीं हैं।',
      cuboid:
        'LSA केवल 4 पार्श्व दीवारों 2h(l + b) को गिनता है। शीर्ष + आधार (2lb) शामिल नहीं हैं।',
      cylinder:
        'CSA केवल वक्र आयताकार दीवार (2πrh) को गिनता है। दोनों वृत्ताकार सिरे (2πr²) शामिल नहीं हैं।',
      cone: 'LSA केवल वक्र शंकु भाग (πrl) को गिनता है। वृत्ताकार आधार (πr²) शामिल नहीं है।',
      square_pyramid:
        'LSA केवल 4 त्रिभुजाकार फलकों (2as) को गिनता है। वर्गाकार आधार (a²) शामिल नहीं है।',
      sphere: 'गोले के लिए लागू नहीं होता',
      triangular_prism:
        'LSA केवल 3 आयताकार दीवारों (3ah) को गिनता है। दोनों त्रिभुजाकार सिरे शामिल नहीं हैं।',
      pentagonal_prism:
        'LSA केवल 5 आयताकार दीवारों (5ah) को गिनता है। दोनों पंचभुज सिरे शामिल नहीं हैं।',
      hexagonal_prism:
        'LSA केवल 6 आयताकार दीवारों (6ah) को गिनता है। दोनों षट्भुज सिरे शामिल नहीं हैं।',
      triangular_pyramid:
        'LSA केवल 3 त्रिभुजाकार पार्श्व फलकों ((3/2)as) को गिनता है। त्रिभुजाकार आधार शामिल नहीं है।',
      pentagonal_pyramid:
        'LSA केवल 5 त्रिभुजाकार पार्श्व फलकों ((5/2)as) को गिनता है। पंचभुज आधार शामिल नहीं है।',
      hexagonal_pyramid:
        'LSA केवल 6 त्रिभुजाकार पार्श्व फलकों (3as) को गिनता है। षट्भुज आधार शामिल नहीं है।',
      hemisphere:
        'CSA केवल वक्र अर्धगोलाकार गुंबद (2πr²) को गिनता है। समतल वृत्ताकार आधार (πr²) शामिल नहीं है।',
      frustum:
        'LSA केवल वक्र सतह π(r₁ + r₂)l को गिनता है। दोनों वृत्ताकार सिरे (πr₁² + πr₂²) शामिल नहीं हैं।',
      octahedron:
        'लागू नहीं होता (सभी 8 समबाहु त्रिभुजाकार फलक समान हैं; TSA = 2√3a²)',
    },
    excludedCapsLabel: 'बाहर रखा गया',
    learningPanelTitle: 'आकृति शिक्षण मार्गदर्शिका',
    definitionLabel: 'परिभाषा',
    geometryStatsLabel: 'गुणधर्म (फलक, किनारे और शीर्ष)',
    facesStatLabel: 'फलक / सतह',
    edgesStatLabel: 'किनारे',
    verticesStatLabel: 'शीर्ष',
    importantDimensionsLabel: 'मुख्य माप',
    workedExampleLabel: 'हल किया गया उदाहरण',
    realWorldExampleLabel: 'वास्तविक जीवन उपयोग',
    didYouKnowLabel: 'क्या आप जानते हैं?',
    guideLabels: {
      radius: 'त्रिज्या (r)',
      height: 'ऊँचाई (h)',
      slantL: 'तिर्यक (l)',
      slantS: 'तिर्यक (s)',
    },
    learningByShape: {
      cube: {
        definition:
          'घन एक सम 3D ठोस है जो समकोण पर मिलने वाले छह समान वर्गाकार फलकों से घिरा होता है।',
        faces: '6 वर्गाकार फलक',
        edges: '12 समान किनारे',
        vertices: '8 शीर्ष',
        dimensionsSummary:
          'लंबाई = चौड़ाई = ऊँचाई = a होने के कारण केवल एक भुजा (a) पूरे घन को परिभाषित करती है।',
        workedExample:
          'a = 5 सेमी पर: LSA = 100 सेमी², TSA = 150 सेमी², आयतन = 125 सेमी³।',
        realWorldExample: 'रूबिक्स क्यूब, पासा, गिफ्ट बॉक्स और बर्फ का टुकड़ा।',
        didYouKnow:
          '6 जुड़े वर्गों से बने 11 अलग-अलग समतल जाल होते हैं जो सभी एक ही घन में मुड़ जाते हैं।',
      },
      cuboid: {
        definition:
          'घनाभ छह आयताकार फलकों से घिरा एक 3D डिब्बा है जिसके सम्मुख फलक समान होते हैं।',
        faces: '6 आयताकार फलक',
        edges: '12 किनारे (l, b, h प्रत्येक 4)',
        vertices: '8 शीर्ष',
        dimensionsSummary:
          'तीन लंबवत मापों द्वारा परिभाषित: लंबाई (l), चौड़ाई (b), और ऊँचाई (h)।',
        workedExample:
          'l = 10, b = 6, h = 4 सेमी पर: LSA = 128 सेमी², TSA = 248 सेमी², आयतन = 240 सेमी³।',
        realWorldExample: 'पाठ्यपुस्तक, ईंट, जूते का डिब्बा और ज्यामिति बॉक्स।',
        didYouKnow:
          'जब l = b = h हो तो घनाभ घन बन जाता है; इसकी 4 दीवारें खुलकर 2(l + b) लंबाई का एक आयत बनाती हैं।',
      },
      cylinder: {
        definition:
          'लंब वृत्तीय बेलन में एक चिकनी वक्र सतह से जुड़े दो समानांतर समान वृत्ताकार आधार होते हैं।',
        faces: '3 सतहें (2 समतल वृत्त + 1 वक्र दीवार)',
        edges: '2 वृत्ताकार किनारे',
        vertices: '0 शीर्ष',
        dimensionsSummary:
          'त्रिज्या (r) और ऊँचाई (h) से परिभाषित। वक्र दीवार को खोलने पर 2πr चौड़ाई और h ऊँचाई का आयत बनता है।',
        workedExample:
          'r = 3, h = 5 सेमी पर: CSA = 30π ≈ 94.25 सेमी², TSA = 48π ≈ 150.80 सेमी², V = 45π ≈ 141.37 सेमी³।',
        realWorldExample: 'पानी की टंकी, स्टील का गिलास, पाइप और टिन का डिब्बा।',
        didYouKnow:
          'बेलन की खुली आयताकार दीवार की चौड़ाई उसके वृत्ताकार आधार की परिधि (2πr) के बराबर होती है, इसलिए CSA = 2πrh।',
      },
      cone: {
        definition:
          'लंब वृत्तीय शंकु समतल वृत्ताकार आधार से ऊपर केंद्र के ठीक ऊपर स्थित एक नुकीले शीर्ष की ओर संकरा होता जाता है।',
        faces: '2 सतहें (1 वृत्ताकार आधार + 1 वक्र पृष्ठ)',
        edges: '1 वृत्ताकार किनारा',
        vertices: '1 शीर्ष बिंदु',
        dimensionsSummary:
          'त्रिज्या (r), ऊर्ध्वाधर ऊँचाई (h), और तिर्यक ऊँचाई l = √(r² + h²) से परिभाषित।',
        workedExample:
          'r = 3, h = 4 सेमी पर: l = 5 सेमी; LSA = 15π ≈ 47.12 सेमी², TSA = 24π ≈ 75.40 सेमी², V = 12π ≈ 37.70 सेमी³।',
        realWorldExample: 'आइसक्रीम कोन, ट्रैफिक कोन, कीप (फ़नल) और बर्थडे कैप।',
        didYouKnow:
          'समान त्रिज्या और ऊँचाई वाले बेलन के आयतन का ठीक एक-तिहाई (1/3) आयतन शंकु का होता है!',
      },
      square_pyramid: {
        definition:
          'वर्गाकार पिरामिड में एक वर्गाकार आधार और एक ही शीर्ष पर मिलने वाले चार समद्विबाहु त्रिभुजाकार फलक होते हैं।',
        faces: '5 फलक (1 वर्ग आधार + 4 त्रिभुज)',
        edges: '8 किनारे (4 आधार + 4 तिर्यक)',
        vertices: '5 शीर्ष (4 आधार + 1 मुख्य शीर्ष)',
        dimensionsSummary:
          'आधार भुजा (a), ऊँचाई (h), और त्रिभुज की तिर्यक ऊँचाई s = √(h² + (a/2)²) से परिभाषित।',
        workedExample:
          'a = 6, h = 4 सेमी पर: s = 5 सेमी; LSA = 60 सेमी², TSA = 96 सेमी², आयतन = 48 सेमी³।',
        realWorldExample: 'मिस्र का गीज़ा पिरामिड और चार-तरफ़ा तंबू की छत।',
        didYouKnow:
          'बेलन में शंकु की तरह, समान आधार और ऊँचाई वाले घनाभ के आयतन का ठीक 1/3 हिस्सा वर्गाकार पिरामिड में होता है।',
      },
      sphere: {
        definition:
          'गोला एक पूर्णतः गोल 3D सतह है जिसका प्रत्येक बिंदु उसके केंद्र से समान दूरी (त्रिज्या r) पर होता है।',
        faces: '1 सतत वक्र पृष्ठ',
        edges: '0 किनारे',
        vertices: '0 शीर्ष',
        dimensionsSummary:
          'केंद्र से सतह तक की केवल एक माप त्रिज्या (r) से पूरी तरह परिभाषित (व्यास = 2r)।',
        workedExample:
          'r = 7 सेमी पर: पृष्ठीय क्षेत्रफल = 196π ≈ 615.75 सेमी², आयतन = (4/3)π(7³) ≈ 1436.76 सेमी³।',
        realWorldExample: 'क्रिकेट की गेंद, फुटबॉल, कंचा और विश्व ग्लोब।',
        didYouKnow:
          'गोले को बिना खींचे या फाड़े समतल जाल में नहीं बदला जा सकता—इसीलिए विश्व मानचित्रों में महाद्वीपों का आकार थोड़ा बदल जाता है!',
      },
      triangular_prism: {
        definition:
          'त्रिभुजाकार प्रिज्म तीन आयताकार पार्श्व फलकों से जुड़े दो समानांतर समान त्रिभुजाकार आधारों से बना ठोस है।',
        faces: '5 फलक (2 त्रिभुज + 3 आयत)',
        edges: '9 किनारे',
        vertices: '6 शीर्ष',
        dimensionsSummary:
          'समबाहु त्रिभुज भुजा (a) और प्रिज्म ऊँचाई (h) से परिभाषित। आधार क्षेत्रफल = (√3/4)a²।',
        workedExample:
          'a = 4, h = 5 सेमी पर: आधार ≈ 6.93 सेमी², LSA = 60 सेमी², TSA ≈ 73.86 सेमी², V ≈ 34.64 सेमी³।',
        realWorldExample: 'काँच का प्रिज्म, चॉकलेट बॉक्स और तिकोना टेंट।',
        didYouKnow:
          'किसी घनाभ को विकर्ण के अनुदिश काटने पर वह दो समान त्रिभुजाकार प्रिज्म में बँट जाता है!',
      },
      triangular_pyramid: {
        definition:
          'त्रिभुजाकार पिरामिड (चतुष्फलक) में एक त्रिभुज आधार और एक शीर्ष पर मिलने वाले तीन त्रिभुज फलक होते हैं।',
        faces: '4 त्रिभुजाकार फलक',
        edges: '6 किनारे',
        vertices: '4 शीर्ष',
        dimensionsSummary:
          'आधार भुजा (a), ऊँचाई (h), और तिर्यक ऊँचाई s से परिभाषित। h = a√(2/3) होने पर यह सम चतुष्फलक बनता है।',
        workedExample:
          'a = 6, h = 5 सेमी पर: आधार ≈ 15.59 सेमी², s ≈ 5.29 सेमी, LSA ≈ 47.62 सेमी², TSA ≈ 63.21 सेमी², V ≈ 25.98 सेमी³।',
        realWorldExample: 'टेट्रा पैक दूध डिब्बा, 4-तरफ़ा पासा और मीथेन (CH₄) अणु मॉडल।',
        didYouKnow:
          '4 से कम समतल फलकों से किसी भी बंद 3D बहुफलक का निर्माण नहीं किया जा सकता!',
      },
      pentagonal_prism: {
        definition:
          'पंचभुजाकार प्रिज्म पाँच आयताकार दीवारों से जुड़े दो समानांतर सम पंचभुज आधारों से बना होता है।',
        faces: '7 फलक (2 पंचभुज + 5 आयत)',
        edges: '15 किनारे',
        vertices: '10 शीर्ष',
        dimensionsSummary:
          'पंचभुज भुजा (a) और ऊँचाई (h) से परिभाषित। आधार = (5a²) / (4 tan 36°)।',
        workedExample:
          'a = 4, h = 6 सेमी पर: आधार ≈ 27.53 सेमी², LSA = 120 सेमी², TSA ≈ 175.06 सेमी², V ≈ 165.17 सेमी³।',
        realWorldExample: '5-भुजी मीनारें, विशेष नट/बोल्ट और पेंसिल स्टैंड।',
        didYouKnow:
          'अमेरिका का प्रसिद्ध पेंटागन भवन एक पंचभुजाकार प्रिज्म के आकार का है!',
      },
      hexagonal_prism: {
        definition:
          'षट्भुजाकार प्रिज्म छह आयताकार दीवारों से जुड़े दो समानांतर सम षट्भुज आधारों से बना होता है।',
        faces: '8 फलक (2 षट्भुज + 6 आयत)',
        edges: '18 किनारे',
        vertices: '12 शीर्ष',
        dimensionsSummary:
          'षट्भुज भुजा (a) और ऊँचाई (h) से परिभाषित। आधार = (3√3/2)a²।',
        workedExample:
          'a = 4, h = 5 सेमी पर: आधार ≈ 41.57 सेमी², LSA = 120 सेमी², TSA ≈ 203.14 सेमी², V ≈ 207.85 सेमी³।',
        realWorldExample: 'षट्भुज पेंसिल, मधुमक्खी के छत्ते के कोष्ठ और नट/बोल्ट।',
        didYouKnow:
          'मधुमक्खियाँ कम से कम मोम में बिना जगह छोड़े छत्ता बनाने के लिए षट्भुजाकार प्रिज्म का उपयोग करती हैं!',
      },
      pentagonal_pyramid: {
        definition:
          'पंचभुजाकार पिरामिड में एक सम पंचभुज आधार और एक शीर्ष पर मिलने वाले पाँच त्रिभुजाकार फलक होते हैं।',
        faces: '6 फलक (1 पंचभुज + 5 त्रिभुज)',
        edges: '10 किनारे',
        vertices: '6 शीर्ष',
        dimensionsSummary:
          'आधार भुजा (a), ऊँचाई (h), और तिर्यक ऊँचाई s = √(h² + (a / (2 tan 36°))²) से परिभाषित।',
        workedExample:
          'a = 4, h = 6 सेमी पर: आधार ≈ 27.53 सेमी², s ≈ 6.60 सेमी, LSA ≈ 66.04 सेमी², TSA ≈ 93.56 सेमी², V ≈ 55.06 सेमी³।',
        realWorldExample: 'स्टार लालटेन, मंदिर शिखर और मंडप की छत।',
        didYouKnow:
          'यह ऑयलर सूत्र F + V - E = 2 का पालन करता है: 6 + 6 - 10 = 2!',
      },
      hexagonal_pyramid: {
        definition:
          'षट्भुजाकार पिरामिड में एक सम षट्भुज आधार और एक शीर्ष पर मिलने वाले छह त्रिभुजाकार फलक होते हैं।',
        faces: '7 फलक (1 षट्भुज + 6 त्रिभुज)',
        edges: '12 किनारे',
        vertices: '7 शीर्ष',
        dimensionsSummary:
          'आधार भुजा (a), ऊँचाई (h), और तिर्यक ऊँचाई s = √(h² + (√3a/2)²) से परिभाषित।',
        workedExample:
          'a = 4, h = 3 सेमी पर: आधार ≈ 41.57 सेमी², s ≈ 4.58 सेमी, LSA ≈ 54.99 सेमी², TSA ≈ 96.56 सेमी², V ≈ 41.57 सेमी³।',
        realWorldExample: 'छह-तरफ़ा छतरी, क्वार्ट्ज़ क्रिस्टल का सिरा और गज़ेबो छत।',
        didYouKnow:
          'षट्भुजाकार पिरामिड में फलकों और शीर्षों की संख्या बराबर होती है (7 + 7 - 12 = 2)!',
      },
      hemisphere: {
        definition:
          'अर्धगोला गोले के केंद्र से काटने पर बना ठीक आधा भाग है, जिसमें एक वक्र गुंबद और एक समतल वृत्ताकार आधार होता है।',
        faces: '2 सतहें (1 वृत्ताकार आधार + 1 वक्र गुंबद)',
        edges: '1 वृत्ताकार किनारा',
        vertices: '0 शीर्ष',
        dimensionsSummary:
          'केवल त्रिज्या (r) से परिभाषित। CSA = 2πr² और वृत्ताकार आधार जोड़ने पर TSA = 3πr²।',
        workedExample:
          'r = 7 सेमी पर: CSA = 98π ≈ 307.88 सेमी², TSA = 147π ≈ 461.81 सेमी², V = (686/3)π ≈ 718.38 सेमी³।',
        realWorldExample: 'कटोरा, तारामंडल गुंबद, इग्लू और आधा कटा तरबूज़।',
        didYouKnow:
          'गोले को आधा काटने पर πr² क्षेत्रफल की नई वृत्ताकार सतह बनती है, इसलिए दोनों अर्धगोलों का कुल क्षेत्रफल 6πr² होता है!',
      },
      frustum: {
        definition:
          'शंकु का छिन्नक (Frustum) वह ठोस है जो किसी शंकु के ऊपरी छोटे हिस्से को आधार के समानांतर काटकर हटाने पर बचता है।',
        faces: '3 सतहें (2 समानांतर वृत्त + 1 वक्र दीवार)',
        edges: '2 वृत्ताकार किनारे',
        vertices: '0 शीर्ष',
        dimensionsSummary:
          'निचली त्रिज्या (r₁), ऊपरी त्रिज्या (r₂), ऊँचाई (h), और तिर्यक ऊँचाई l = √(h² + (r₁ - r₂)²) से परिभाषित।',
        workedExample:
          'r₁ = 6, r₂ = 3, h = 4 सेमी: l = 5 सेमी; LSA = 45π ≈ 141.37 सेमी², TSA = 90π ≈ 282.74 सेमी², V = 84π ≈ 263.89 सेमी³।',
        realWorldExample: 'प्लास्टिक की बाल्टी, कॉफ़ी कप, लाउडस्पीकर हॉर्न और लैंप शेड।',
        didYouKnow:
          'जब r₁ = r₂ हो जाए, तो छिन्नक के सूत्र स्वतः बेलन के सूत्रों में बदल जाते हैं!',
      },
      octahedron: {
        definition:
          'सम अष्टफलक एक प्लेटोनी ठोस है जिसमें आठ समबाहु त्रिभुज होते हैं और प्रत्येक शीर्ष पर चार त्रिभुज मिलते हैं।',
        faces: '8 समबाहु त्रिभुजाकार फलक',
        edges: '12 समान किनारे',
        vertices: '6 शीर्ष',
        dimensionsSummary:
          'केवल एक किनारे (a) से परिभाषित। यह आधार से जुड़े दो वर्गाकार पिरामिडों के बराबर होता है।',
        workedExample:
          'a = 6 सेमी पर: TSA = 72√3 ≈ 124.71 सेमी², आयतन = 72√2 ≈ 101.82 सेमी³।',
        realWorldExample: '8-फलकीय पासा (d8) और प्राकृतिक हीरे/फ्लोराइट क्रिस्टल।',
        didYouKnow:
          'किसी घन के 6 फलकों के केंद्रों को मिलाने पर ठीक एक सम अष्टफलक बनता है!',
      },
    },
    navTabs: {
      ariaLabel: 'ऐप कार्यक्षेत्र',
      explorer: 'आकृति अन्वेषक',
      netlab: 'नेट लैब (Net Lab)',
      tutor: 'AI ट्यूटर',
      missions: 'मिशन',
      practice: 'कक्षा 10 अभ्यास',
      hub: 'प्रगति और गाइड',
    },
    netLab: {
      headerTitle: 'टियर 2 · इंटरैक्टिव नेट लैब और स्केलिंग अन्वेषक',
      headerSubtitle:
        'सभी 11 घन नेट देखें, फोल्डिंग परीक्षण खेलें, घनाभ व बेलन नेट समझें, 6 चरणों में नेट बनाना सीखें और k² / k³ वृद्धि देखें।',
      subTabs: {
        gallery: '11 घन नेट',
        checker: 'नेट जांच खेल',
        cuboid: 'घनाभ नेट',
        cylinder: 'बेलन नेट',
        draw: 'नेट बनाने के चरण',
        scale: 'आयतन विस्तार',
      },
      gallery: {
        title: 'सभी 11 गणितीय रूप से वैध घन नेट',
        subtitle:
          'किसी भी नेट को चुनें और देखें कि इसके 6 वर्ग किस प्रकार मुड़कर एक बंद घन बनाते हैं।',
        selectNetHint: '11 घन नेट में से एक चुनें',
        familyLabel: 'श्रेणी',
        animatePlay: 'ऑटो-फ़ोल्ड',
        animatePause: 'रोकें',
        selectedLabel: 'चयनित नेट',
        families: {
          '1-4-1': '1-4-1 पट्टी (6 नेट)',
          '2-3-1': '2-3-1 क्रम (3 नेट)',
          '2-2-2': '2-2-2 सीढ़ी (1 नेट)',
          '3-3': '3-3 जुड़वां पट्टी (1 नेट)',
        },
        nets: {
          net_1_4_1_cross: {
            name: '1. क्लासिक क्रॉस (Cross)',
            tip: 'बीच के 4 वर्ग चारों दीवारें बनाते हैं और दोनों तरफ़ के 2 वर्ग आधार व शीर्ष बंद करते हैं।',
          },
          net_1_4_1_same_end: {
            name: '2. समान सिरे',
            tip: '4-वर्ग पट्टी के एक ही स्तंभ पर दोनों तरफ़ ढक्कन जुड़े हैं।',
          },
          net_1_4_1_step_01: {
            name: '3. 1-कदम विस्थापन',
            tip: 'ऊपर और नीचे के ढक्कन 1 वर्ग खिसके होने पर भी आमने-सामने आते हैं।',
          },
          net_1_4_1_step_02: {
            name: '4. 2-कदम विस्थापन',
            tip: 'दो स्तंभ दूर होने पर भी 4-वर्ग लूप उन्हें विपरीत फलकों पर पहुँचा देता है।',
          },
          net_1_4_1_opposite_ends: {
            name: '5. विपरीत सिरे',
            tip: 'अधिकतम दूरी के साथ बिना किसी ओवरलैप के साफ़ घन में बंद होता है।',
          },
          net_1_4_1_zigzag: {
            name: '6. मध्य ज़िगज़ैग',
            tip: 'मध्य पट्टी के दूसरे और तीसरे वर्ग से जुड़ा असममित 1-4-1 रूप।',
          },
          net_2_3_1_a: {
            name: '7. 2-3-1 निकट ढक्कन',
            tip: '3 वर्ग दीवारें मोड़ते हैं जबकि 2-वर्ग भुजा घूमकर शेष फलक बंद करती है।',
          },
          net_2_3_1_b: {
            name: '8. 2-3-1 मध्य ढक्कन',
            tip: 'ऊपरी वर्ग मध्य में रहते हुए भी सभी 6 फलकों को पूरा ढकता है।',
          },
          net_2_3_1_c: {
            name: '9. 2-3-1 दूरस्थ ढक्कन',
            tip: 'दायाँ ऊपरी सिरा और निचली L-भुजा विपरीत फलकों को बंद करते हैं।',
          },
          net_2_2_2_stairs: {
            name: '10. सीढ़ीनुमा (2-2-2)',
            tip: 'दाएँ और नीचे बारी-बारी से मोड़ घन के चारों ओर सर्पिल की तरह लिपटते हैं।',
          },
          net_3_3_twin: {
            name: '11. जुड़वां पट्टियाँ (3-3)',
            tip: 'दो 3-वर्ग पट्टियाँ एक किनारे पर जुड़कर आधे-आधे घन को ढकती हैं।',
          },
        },
      },
      checker: {
        title: 'नेट जाँच चुनौती',
        subtitle:
          'जांचें कि दिया गया 2D पैटर्न बिना टकराए एक बंद घन में मुड़ सकता है या नहीं।',
        question: 'क्या यह मुड़कर घन बनेगा?',
        yesButton: 'हाँ, घन बनेगा',
        noButton: 'नहीं, नहीं बनेगा',
        correctBadge: 'बिल्कुल सही!',
        wrongBadge: 'सही नहीं — कारण समझें:',
        nextPuzzle: 'अगला पैटर्न',
        playAgain: 'फिर से खेलें',
        resetProgress: 'प्रगति रीसेट करें',
        scoreLabel: 'स्कोर',
        streakLabel: 'लगातार सही',
        bestLabel: 'सर्वश्रेष्ठ स्कोर',
        progressLabel: 'पैटर्न',
        completedTitle: 'नेट जाँच पूर्ण!',
        completedSummary: 'आपने सभी 12 वैध और अवैध घन नेट पैटर्न जांच लिए हैं।',
        foldIn3D: '3D में मोड़कर देखें',
        hide3D: '3D पूर्वावलोकन छुपाएँ',
        explanations: {
          valid141:
            'वैध 1-4-1 नेट: बीच के 4 वर्ग घेरा बनाते हैं और दोनों ओर के वर्ग ऊपर-नीचे के सिरे बंद करते हैं।',
          valid231:
            'वैध 2-3-1 नेट: हर वर्ग बिना ओवरलैप के अलग-अलग फलक पर बैठता है।',
          valid222:
            'वैध 2-2-2 सीढ़ी नेट: बारी-बारी के समकोण मोड़ सभी 6 फलकों को ढक लेते हैं।',
          valid33:
            'वैध 3-3 नेट: प्रत्येक 3-वर्ग समूह एक कोने पर मिलने वाले 3 फलक बनाता है।',
          validOppositeEnds:
            'वैध 1-4-1 विपरीत-सिरा नेट: दोनों सिरे ठीक आमने-सामने ढक्कन के रूप में बंद होते हैं।',
          invalidSameSide:
            'अवैध! दोनों ढक्कन एक ही तरफ़ हैं, इसलिए वे एक ही फलक पर टकराएंगे और दूसरी ओर खुला रहेगा।',
          invalidLine:
            'अवैध! सीधी पंक्ति में 6 वर्ग एक ही 4 फलकों पर दो बार घूमकर बाएँ-दाएँ को खुला छोड़ देंगे।',
          invalid2x2:
            'अवैध! 2×2 वर्गों का ठोस ब्लॉक होने से मोड़ते समय फलक आपस में टकरा जाते हैं।',
          invalidDisconnected:
            'अवैध! ये वर्ग साझा किनारे के बिना केवल कोने पर तिरछे छू रहे हैं।',
          invalidURing:
            'अवैध! U/C मोड़ में दो वर्ग ठीक एक ही स्थान पर मुड़कर ओवरलैप करते हैं।',
          invalidCount:
            'अवैध! यहाँ केवल 5 वर्ग हैं; एक बंद घन के लिए हमेशा 6 वर्ग फलक चाहिए।',
        },
      },
      cuboid: {
        title: 'नामांकित क्रॉस-आकार घनाभ नेट',
        subtitle:
          'l, b और h बदलकर देखें कि विपरीत आयताकार जोड़े समान माप साझा कर TSA कैसे बनाते हैं।',
        pairBaseTop: 'आधार व शीर्ष (l × b)',
        pairFrontBack: 'आगे व पीछे (l × h)',
        pairLeftRight: 'बायाँ व दायाँ (h × b)',
        totalTsaLabel: 'कुल पृष्ठीय क्षेत्रफल (6 आयतों का योग)',
        openIn3D: '3D घनाभ में खोलें',
      },
      cylinder: {
        title: 'बेलन नेट: 1 आयत + 2 वृत्त',
        subtitle:
          'बेलन को खोलने पर एक आयत और दो बराबर वृत्ताकार ढक्कन मिलते हैं।',
        rectLabel: 'वक्र दीवार (आयत)',
        circleTopLabel: 'ऊपरी वृत्त',
        circleBottomLabel: 'आधार वृत्त',
        circumferenceRuleTitle: 'आयत की लंबाई = 2πr क्यों होती है?',
        circumferenceRuleBody:
          'बेलन के रूप में मोड़ने पर आयत की चौड़ाई को वृत्त की परिधि को ठीक एक बार ढकना होता है—इसलिए इसकी लंबाई 2πr के बराबर होती है!',
        rectWidthLabel: 'आयत की चौड़ाई = परिधि (2πr)',
        rectHeightLabel: 'आयत की ऊँचाई (h)',
        circleRadiusLabel: 'वृत्त की त्रिज्या (r)',
        capAreaLabel: 'प्रत्येक वृत्त क्षेत्रफल (πr²)',
        curvedAreaLabel: 'आयत क्षेत्रफल (2πr × h = 2πrh)',
        openIn3D: '3D बेलन में खोलें',
      },
      draw: {
        title: '6 आसान चरणों में नेट बनाएँ',
        subtitle:
          'किसी भी 3D ठोस का 2D नेट कागज़ पर बनाने के लिए इन 6 चरणों का पालन करें।',
        stepPrefix: 'चरण',
        previous: 'पिछला',
        next: 'अगला',
        restart: 'फिर से शुरू करें',
        finishMessage: 'अब आप कोई भी 3D नेट बनाकर जांचने के लिए तैयार हैं!',
        steps: {
          s1: {
            title: '1. खुले हुए ठोस की कल्पना करें',
            body: 'कल्पना करें कि आपने एक डिब्बे के किनारों को काटा और मेज़ पर बिल्कुल चपटा बिछा दिया।',
            checklist: 'मुड़ने वाले किनारे आपस में जुड़े रहेंगे।',
          },
          s2: {
            title: '2. फलकों की पहचान करें',
            body: 'सभी फलक गिनें: घन के लिए 6 वर्ग, घनाभ के लिए 3 आयत जोड़े, बेलन के लिए 1 आयत + 2 वृत्त।',
            checklist: 'हर फलक की लंबाई और चौड़ाई नोट करें।',
          },
          s3: {
            title: '3. आधार बनाएँ',
            body: 'अपने कागज़ के बीच में सटीक माप के साथ सबसे पहले निचला आधार फलक बनाएँ।',
            checklist: 'चारों तरफ़ बगल के फलकों के लिए पर्याप्त जगह छोड़ें।',
          },
          s4: {
            title: '4. अन्य फलक जोड़ें',
            body: 'आधार के हर किनारे से बराबर लंबाई वाली बगल की दीवारें सीधे जोड़कर बनाएँ।',
            checklist: 'साझा किनारों की लंबाई बिल्कुल बराबर होनी चाहिए।',
          },
          s5: {
            title: '5. शेष फलक जोड़ें',
            body: 'ऊपरी ढक्कन (Top) को किसी एक दीवार के बाहरी किनारे पर जोड़ें ताकि वह ऊपर बंद हो सके।',
            checklist: 'शीर्ष और आधार का आकार एक समान (l × b) रखें।',
          },
          s6: {
            title: '6. मन में मोड़कर जाँचें',
            body: 'हर जुड़े फलक को मन में 90° ऊपर मोड़कर देखें कि सभी 6 फलक बिना ओवरलैप के बंद होते हैं।',
            checklist: 'फलकों की गिनती और विपरीत जोड़ों की पुष्टि करें।',
          },
        },
      },
      scale: {
        title: 'आयतन और पृष्ठीय क्षेत्रफल विस्तार (k, k², k³)',
        subtitle:
          'हर विमा को k गुना (1× से 3×) बढ़ाकर देखें कि क्षेत्रफल k² और आयतन k³ गुना कैसे बढ़ता है।',
        scaleFactorLabel: 'स्केल गुणक (k)',
        shapeLabel: 'परीक्षण ठोस',
        originalHeader: 'मूल (1×)',
        scaledHeader: 'विस्तारित (k×)',
        dimensionsRow: 'रेखीय विमाएँ (× k)',
        lsaRow: 'LSA / CSA (× k²)',
        tsaRow: 'TSA (× k²)',
        volumeRow: 'आयतन (× k³)',
        areaScaleFormula: 'क्षेत्रफल k² गुना बढ़ता है',
        volumeScaleFormula: 'आयतन k³ गुना बढ़ता है',
        insightTitle: 'आयतन क्षेत्रफल से तेज़ी से क्यों बढ़ता है?',
        insightBody:
          'किनारा दोगुना (2×) करने पर क्षेत्रफल 2² = 4× होता है; जबकि 3D आयतन लंबाई, चौड़ाई और ऊँचाई तीनों में बढ़कर 2³ = 8× हो जाता है! 3× करने पर 9× क्षेत्रफल और 27× आयतन मिलता है।',
      },
    },
    tutor: {
      headerTitle: 'क्षेत्रमिति और 3D नेट अध्ययन ट्यूटर',
      headerSubtitle:
        'सभी 15 आकृतियों, सूत्रों, पृष्ठीय क्षेत्रफल, आयतन, नेट और चरण-दर-चरण गणित प्रश्नों के बारे में पूछें।',
      demoBadge: 'डेमो ट्यूटर (ऑफ़लाइन गणित इंजन — लाइव AI नहीं)',
      liveBadge: 'लाइव AI जुड़ा है (सर्वर प्रॉक्सी)',
      demoNoticeTitle: 'डेमो मोड सूचना: कोई लाइव AI API कुंजी जुड़ी नहीं है',
      demoNoticeBody:
        'नीचे दिए गए उत्तर NetFold 3D के स्थानीय गणित इंजन और पाठ्यक्रम डेटा द्वारा तैयार किए गए हैं (Archify केवल एक डायग्राम स्किल है, AI मॉडल API नहीं)। ब्राउज़र कोड में API कुंजी छिपाने के लिए सर्वर-साइड प्रॉक्सी (POST /api/tutor) और सर्वर env में GEMINI_API_KEY आवश्यक है।',
      fallbackFromErrorBanner:
        'कॉन्फ़िगर किया गया AI सर्वर उपलब्ध नहीं था, इसलिए स्थानीय डेमो ट्यूटर ने उत्तर दिया।',
      archToggleShow: 'लाइव AI कैसे जोड़ें?',
      archToggleHide: 'आर्किटेक्चर छुपाएँ',
      archTitle: 'लाइव AI के लिए सुरक्षित आर्किटेक्चर',
      archSteps: {
        s1: '1. एक छोटा बैकएंड प्रॉक्सी (Node/Express, Netlify/Vercel फ़ंक्शन या Cloudflare Worker) बनाएँ जो POST /api/tutor चलाए।',
        s2: '2. GEMINI_API_KEY को केवल सर्वर env में रखें — VITE_* फ़्रंटएंड कोड में कभी न डालें।',
        s3: '3. VITE_TUTOR_ENDPOINT=/api/tutor सेट करें; AITutor.jsx आकृति संदर्भ सुरक्षित रूप से प्रॉक्सी को भेजेगा।',
      },
      contextTitle: 'वर्तमान चयनित आकृति',
      openExplorerButton: '3D अन्वेषक में खोलें',
      liveValuesLabel: 'लाइव मान',
      suggestedTitle: 'सुझाए गए प्रश्न',
      suggested: {
        s1: 'वर्तमान मापों के साथ {shape} को चरण-दर-चरण समझाएँ',
        s2: '{shape} के LSA, TSA और आयतन का सूत्र क्या है?',
        s3: '{shape} का समतल 2D नेट कैसे मुड़ता है?',
        s4: 'घन के कितने वैध नेट होते हैं और अवैध नेट क्यों विफल होते हैं?',
        s5: 'हल करें: घनाभ l=10, b=6, h=4 का LSA, TSA और आयतन ज्ञात करें',
      },
      clearChat: 'चैट साफ़ करें',
      emptyTitle: 'नीचे अपना ज्यामिति प्रश्न पूछें',
      emptyBody:
        'ऊपर कोई सुझाव चुनें या लिखें: "बेलन r=3 h=5 का TSA और आयतन निकालें" या "गोले का नेट क्यों नहीं होता?"',
      inputPlaceholder:
        'आकृति, सूत्र, नेट या चरण-दर-चरण प्रश्न पूछें...',
      sendButton: 'ट्यूटर से पूछें',
      thinkingText: 'हल हो रहा है...',
      studentLabel: 'छात्र',
      demoMessageTag: 'डेमो ट्यूटर · ऑफ़लाइन गणित इंजन',
      liveMessageTag: 'लाइव AI ट्यूटर',
      templates: {
        solvedForPrefix: 'चरण-दर-चरण हल:',
        currentContextPrefix: 'आपकी चयनित आकृति के अनुसार:',
        netHeading: '2D नेट और फ़ोल्डिंग व्याख्या',
        cubeNetsCountNote:
          'गणितीय रूप से अलग घन नेट 1-4-1 (6), 2-3-1 (3), 2-2-2 (1), और 3-3 (1) परिवारों में होते हैं।',
        scaleHeading: 'स्केल विस्तार विश्लेषण',
        formulaHeading: 'सूत्र और लाइव मान प्रतिस्थापन',
        netByShape: {
          cube: 'घन 11 वैध नेटों में से किसी एक रूप में 6 वर्गों में खुलता है; 2×2 ब्लॉक या 6-इन-ए-रो पट्टियाँ मोड़ने पर ओवरलैप होती हैं।',
          cuboid:
            'घनाभ 3 समान जोड़ों वाले 6 आयतों के क्रॉस-आकार नेट में खुलता है: 2(l×b), 2(l×h), और 2(h×b)।',
          cylinder:
            'बेलन 2πr चौड़ाई (वृत्त की परिधि) और h ऊँचाई वाले 1 आयत + 2 बराबर वृत्तों (πr²) में खुलता है।',
          cone: 'शंकु एक वृत्ताकार आधार (πr²) और l = √(r² + h²) त्रिज्या के त्रिज्यखंड (चाप = 2πr) में खुलता है।',
          square_pyramid:
            'वर्गाकार पिरामिड 1 वर्गाकार आधार और उसकी चारों भुजाओं से जुड़े 4 त्रिभुजों में खुलता है।',
          sphere:
            'गोले में हर दिशा में वक्रता होती है, इसलिए इसका कोई सटीक समतल बहुभुज नेट नहीं बनता।',
          triangular_prism:
            'त्रिभुजाकार प्रिज्म 2 समबाहु त्रिभुजों और 3 बराबर आयताकार दीवारों में खुलता है।',
          triangular_pyramid:
            'त्रिभुजाकार पिरामिड 1 त्रिभुज आधार और 3 पार्श्व त्रिभुजों में खुलता है।',
          pentagonal_prism:
            'पंचभुजाकार प्रिज्म 2 सम पंचभुजों और 5 आयताकार दीवारों में खुलता है।',
          hexagonal_prism:
            'षट्भुजाकार प्रिज्म 2 सम षट्भुजों और 6 आयताकार दीवारों में खुलता है।',
          pentagonal_pyramid:
            'पंचभुजाकार पिरामिड 1 पंचभुज आधार और 5 त्रिभुज फलकों में खुलता है।',
          hexagonal_pyramid:
            'षट्भुजाकार पिरामिड 1 षट्भुज आधार और 6 त्रिभुज फलकों में खुलता है।',
          hemisphere:
            'अर्धगोले का गुंबद दो दिशाओं में मुड़ा होने के कारण इसका सटीक समतल नेट नहीं बनता।',
          frustum:
            'शंकु का छिन्नक वक्र पट्टी π(r₁ + r₂)l तथा r₁ और r₂ त्रिज्या के दो समानांतर वृत्तों में खुलता है।',
          octahedron:
            'सम अष्टफलक आपस में जुड़े 8 समबाहु त्रिभुजों के नेट में खुलता है।',
        },
      },
    },
    practice: {
      headerTitle: 'NCERT क्षेत्रमिति – कक्षा 10 हल अभ्यास',
      headerSubtitle:
        'अवधारणा, व्युत्पत्ति, चरणबद्ध गणना, लेबल किए गए 3D मॉडल और ज्यामितीय आरेखों के साथ बोर्ड-परीक्षा शैली के लिखित हल (प्रश्न 1–10)।',
      boardExamTag: 'बोर्ड परीक्षा लिखित हल · कक्षा 10 NCERT',
      progressPrefix: 'प्रश्न',
      questionSelectorAria: 'हल किया गया प्रश्न चुनें',
      previousButton: 'पिछला',
      nextButton: 'अगला',
      expandAll: 'सभी चरण खोलें',
      collapseAll: 'सभी बंद करें',
      stepBadgePrefix: 'चरण',
      diagramSectionTitle: 'लेबल किया गया 3D मॉडल और गणितीय आरेख',
      interactive3DTab: 'इंटरैक्टिव 3D मॉडल',
      diagramTab: '2D गणितीय आरेख',
      togglePrimaryModel: 'मुख्य ठोस आकृति',
      toggleCompareModel: 'परिणामी ठोस तुलना',
      foldSliderLabel: 'फोल्ड / अनफोल्ड पूर्वावलोकन',
      openInExplorer: 'आकृति अन्वेषक में खोलें',
      scaleNoticePrefix:
        'स्पष्टता के लिए 3D मॉडल आनुपातिक रूप से दिखाया गया है; वास्तविक NCERT माप लेबल में हैं:',
      writtenPracticeNote: 'विस्तृत लिखित हल मॉड्यूल (MCQ क्विज़ नहीं)',
      diagramLabels: {
        radius: 'त्रिज्या',
        diameter: 'व्यास',
        height: 'ऊँचाई',
        slantHeight: 'तिर्यक ऊँचाई',
        edge: 'किनारा',
        baseArea: 'आधार क्षेत्रफल',
        surfaceArea: 'पृष्ठीय क्षेत्रफल',
        volume: 'आयतन',
        cutPlane: 'काट तल (+πr²)',
        joinedFace: 'जुड़ा हुआ फलक (-2a² छिपा)',
        inscribedCone: 'सबसे बड़ा अंतर्निहित शंकु',
        hemisphereBowl: 'अर्धगोलीय गुंबद',
        flatCircularBase: 'समतल वृत्ताकार आधार',
        semicircleArc: 'अर्धवृत्ताकार क्षेत्र',
      },
      stepTitles: {
        s1: '1. मूल प्रश्न कथन',
        s2: '2. संबंधित परिभाषा एवं अवधारणा',
        s3: '3. दिया गया विवरण',
        s4: '4. ज्ञात करना है',
        s5: '5. संबंधित गणितीय सूत्र',
        s6: '6. चरणबद्ध व्युत्पत्ति',
        s7: '7. मानों का प्रतिस्थापन',
        s8: '8. विस्तृत गणनाएँ',
        s9: '9. सही मात्रकों सहित अंतिम उत्तर',
        s10: '10. संबंधित लेबल किया गया 3D मॉडल और गणितीय आरेख',
      },
    },
    themeToggle: {
      lightLabel: 'लाइट',
      darkLabel: 'डार्क',
      switchToDark: 'डार्क थीम चालू करें',
      switchToLight: 'लाइट थीम चालू करें',
    },
    canvasControls: {
      lockZoom: 'स्क्रॉल लॉक',
      unlockZoom: 'ज़ूम खोलें',
      zoomIn: '3D ज़ूम इन',
      zoomOut: '3D ज़ूम आउट',
      scrollSafeNote: 'स्क्रॉल पेज चलाएगा · ड्रैग 3D घुमाएगा',
    },
    search: {
      buttonLabel: 'खोजें',
      placeholder: '15 आकृतियाँ, कक्षा 10 प्रश्न Q1–Q10, मिशन खोजें…',
      emptyPrompt: 'आकृति, सूत्र, मिशन या प्रश्न टाइप करें।',
      noResults: 'कोई मिलता-जुलता परिणाम नहीं मिला।',
      closeLabel: 'खोज बंद करें',
      shortcutHint: '/ या Ctrl+K दबाएँ',
      categories: {
        shapes: '3D आकृति',
        missions: 'मिशन',
        practice: 'कक्षा 10 अभ्यास',
        netlab: 'नेट लैब',
        sections: 'प्रगति और गाइड',
      },
    },
    bookmarks: {
      addShape: 'आकृति सहेजें',
      removeShape: 'बुकमार्क हटाएँ',
      addQuestion: 'प्रश्न सहेजें',
      removeQuestion: 'प्रश्न बुकमार्क हटाएँ',
      shapesHeading: 'बुकमार्क की गई आकृतियाँ',
      questionsHeading: 'बुकमार्क किए गए कक्षा 10 प्रश्न',
      emptyTitle: 'अभी कोई बुकमार्क नहीं है',
      emptyHint: 'यहाँ सहेजने के लिए किसी भी 3D आकृति या प्रश्न के स्टार बटन पर क्लिक करें।',
      openButton: 'खोलें',
    },
    missionsUi: {
      headerTitle: 'इंटरैक्टिव क्षेत्रमिति मिशन',
      headerSubtitle:
        '3D नेट, दीवार पेंटिंग, जल टैंक क्षमता और पैकेजिंग अनुकूलन की वास्तविक चुनौतियाँ हल करें। प्रत्येक मिशन में 3 सितारे तक अर्जित करें!',
      progressBadge: 'पूर्ण मिशन',
      starsEarnedLabel: 'प्राप्त सितारे',
      completedTag: 'पूर्ण',
      inProgressTag: 'अपूर्ण',
      attemptsLabel: 'प्रयास',
      selectChallenge: 'चुनौती दौर',
      baseFaceTag: 'निश्चित आधार फलक',
      chooseTopFace: 'मोड़ने के बाद कौन-सा अंकित वर्ग शीर्ष (TOP) फलक बनेगा?',
      faceOptionPrefix: 'फलक',
      foldTestLabel: 'इंटरैक्टिव 3D फोल्ड पूर्वावलोकन',
      roomDimensionsTag: 'कमरा: l = 8 m, b = 6 m, h = 4 m (फर्श व छत छोड़कर)',
      enterWallsArea: '4 दीवारों का रंगाई क्षेत्रफल दर्ज करें (m²)',
      radiusLabel: 'टैंक त्रिज्या r (m)',
      heightLabel: 'टैंक ऊँचाई h (m)',
      lengthLabel: 'लंबाई l (cm)',
      breadthLabel: 'चौड़ाई b (cm)',
      targetLabel: 'लक्ष्य',
      computedLabel: 'आपका वर्तमान मान',
      litresUnit: 'लीटर',
      selectReasonLabel: 'यह आकृति कार्डबोर्ड (TSA) क्यों घटाती है?',
      checkAnswer: 'उत्तर जाँचें',
      retryButton: 'पुनः प्रयास करें',
      resetButton: 'मिशन रीसेट',
      resetAllButton: 'सभी मिशन रीसेट',
      listenButton: 'सुनकर पढ़ें',
      stopAudioButton: 'आवाज़ रोकें',
      audioUnsupported: 'इस ब्राउज़र में वॉइस रीड-अलाउड समर्थित नहीं है।',
      hintLockedNote: '2 गलत प्रयासों के बाद संकेत स्वतः खुल जाएँगे।',
      hintUnlockedTitle: 'सहायक संकेत खुला',
      hintFormulaPrefix: 'संकेत',
      mistakeFloorCeiling:
        'लगभग सही! आपने फर्श और छत (96 m²) जोड़ लिए हैं। केवल LSA = 2h(l + b) प्रयोग करें।',
      mistakeVolumeMismatch:
        'विमाएँ इस तरह बदलें कि l × b × h = 64 cm³ हो।',
      mistakeNotMinimum:
        'आयतन 64 cm³ सही है, पर पृष्ठीय क्षेत्रफल और कम हो सकता है! बराबर भुजाएँ आज़माएँ।',
      mistakeSelectReason:
        'न्यूनतम क्षेत्रफल सही है — अब नीचे सही गणितीय कारण चुनें!',
      mistakeTooSmall:
        'टैंक का आयतन 1540 L से कम है। r या h बढ़ाएँ।',
      mistakeTooLarge:
        'टैंक का आयतन 1540 L से अधिक है। r या h घटाएँ।',
      successTitle: 'मिशन पूर्ण हुआ!',
      closeModal: 'सीखना जारी रखें',
    },
    hub: {
      headerTitle: 'अध्ययन प्रगति, बुकमार्क और गाइड',
      headerSubtitle:
        'सभी 15 आकृतियाँ, 4 मिशन, कक्षा 10 प्रश्न, सहेजे गए बुकमार्क, कीबोर्ड सहायता और आर्किटेक्चर विवरण देखें।',
      tabs: {
        progress: 'प्रगति और बैज',
        bookmarks: 'बुकमार्क',
        help: 'सहायता और कीबोर्ड',
        about: 'परिचय और संरचना',
      },
      stats: {
        overallMastery: 'कुल दक्षता',
        shapesExplored: 'देखी गई आकृतियाँ',
        missionsDone: 'पूर्ण मिशन',
        starsEarned: 'मिशन सितारे',
        practiceReviewed: 'कक्षा 10 समीक्षा',
        netCheckerBest: 'नेट चेकर सर्वश्रेष्ठ',
      },
      badgesTitle: 'उपलब्धि बैज',
      unlockedTag: 'अनलॉक',
      lockedTag: 'प्रगति पर',
      badges: {
        first_fold: {
          title: 'प्रथम फोल्ड अन्वेषक',
          desc: 'अपनी पहली 3D ज्यामितीय आकृति का निरीक्षण करें।',
        },
        class8_complete: {
          title: 'कक्षा 8 आधार',
          desc: 'घन, घनाभ और बेलन तीनों आकृतियाँ देखें।',
        },
        master_15: {
          title: '15 ठोसों का विशेषज्ञ',
          desc: 'सभी 15 3D आकृतियों का अन्वेषण करें।',
        },
        mission_challenger: {
          title: 'व्यावहारिक चुनौती विजेता',
          desc: 'कम से कम 2 इंटरैक्टिव मिशन पूर्ण करें।',
        },
        star_achiever: {
          title: 'सर्व-मिशन चैंपियन',
          desc: 'सभी 4 वास्तविक जीवन क्षेत्रमिति मिशन पूर्ण करें।',
        },
        board_scholar: {
          title: 'कक्षा 10 बोर्ड विद्वान',
          desc: 'सभी 10 हल किए गए कक्षा 10 NCERT प्रश्न पढ़ें।',
        },
      },
      quickResumeTitle: 'त्वरित जंप',
      resumeExplorer: '3D अन्वेषक खोलें',
      resumeMissions: 'मिशन खोलें',
      resumePractice: 'कक्षा 10 अभ्यास जारी रखें',
      helpTitle: 'NetFold 3D का उपयोग कैसे करें',
      helpSteps: {
        s1: {
          title: '1. आकृति अन्वेषक (15 आकृतियाँ)',
          desc: 'आकृति चुनें, फोल्ड स्लाइडर को 0% से 100% तक चलाएँ और प्रत्येक फलक के क्षेत्रफल पर क्लिक करें।',
        },
        s2: {
          title: '2. इंटरैक्टिव मिशन (वॉइस व संकेत)',
          desc: 'लाइव 3D मॉडल से 4 समस्याएँ हल करें। 2 गलत प्रयासों के बाद संकेत स्वतः खुलते हैं।',
        },
        s3: {
          title: '3. नेट लैब और कक्षा 10 अभ्यास',
          desc: '11 घन नेट, k²/k³ नियम और 10-चरणीय बोर्ड परीक्षा हल आसान स्क्रॉल के साथ पढ़ें।',
        },
        s4: {
          title: '4. ऑफ़लाइन सेव और 5 भाषाएँ',
          desc: 'प्रगति, सितारे, थीम, भाषा और बुकमार्क सभी 5 भाषाओं में स्वतः सहेजे जाते हैं।',
        },
      },
      shortcutsTitle: 'कीबोर्ड शॉर्टकट और सुगमता',
      shortcuts: {
        search: 'ग्लोबल खोज खोलने के लिए Ctrl + K या / दबाएँ',
        closeModal: 'सर्च या मिशन संवाद बंद करने के लिए Esc दबाएँ',
        navigateTabs: 'स्पष्ट फोकस रिंग के साथ Tab / Shift + Tab उपयोग करें',
        adjustSliders: 'स्लाइडर समायोजित करने के लिए बाएँ / दाएँ तीर कुंजी दबाएँ',
      },
      aboutTitle: 'NetFold 3D परिचय एवं पाठ्यक्रम उद्देश्य',
      aboutPurpose:
        'NetFold 3D कक्षा 8–10 NCERT क्षेत्रमिति के लिए बनाया गया ऑफ़लाइन 3D गणित प्रयोगशाला ऐप है। छात्र सूत्रों को रटने के बजाय 2D नेट को 3D में मुड़ते हुए देख सकते हैं।',
      aboutObjectivesTitle: 'मुख्य शैक्षिक उद्देश्य',
      aboutObjectives: {
        o1: 'प्रिज्म, पिरामिड, शंकु, छिन्नक व अष्टफलक के 2D नेट का 3D में मुड़ना समझना।',
        o2: 'पार्श्व पृष्ठीय क्षेत्रफल (LSA/CSA) और संपूर्ण पृष्ठीय क्षेत्रफल (TSA) का अंतर पहचानना।',
        o3: 'समझना कि गोले और अर्धगोले का सटीक समतल नेट क्यों नहीं होता।',
        o4: '5 भारतीय भाषाओं में चरणबद्ध बोर्ड-परीक्षा हल और व्यावहारिक समस्याएँ सीखना।',
      },
      aboutArchTitle: 'क्लाइंट-साइड आर्किटेक्चर (Archify सारांश)',
      aboutArchBody:
        'React 19, Three.js / React Three Fiber, Tailwind CSS और Vite PWA पर आधारित। स्वच्छ मॉड्यूल गणित इंजन, नेट ज्यामिति, 3D कैनवास, 5-भाषी अनुवाद, मिशन व स्थानीय स्टोरेज को अलग रखते हैं।',
      aboutHonestyNote:
        'ईमानदार AI सूचना: अंतर्निहित AI ट्यूटर आपके ब्राउज़र में चलने वाला स्थानीय गणित इंजन है (नकली लाइव AI नहीं)।',
    },
  },
}

export const TRANSLATIONS = Object.freeze({
  en: Object.freeze({ ...BASE_TRANSLATIONS.en, ...PLATFORM_TRANSLATIONS.en }),
  kn: Object.freeze({ ...BASE_TRANSLATIONS.kn, ...PLATFORM_TRANSLATIONS.kn }),
  ta: Object.freeze({ ...BASE_TRANSLATIONS.ta, ...PLATFORM_TRANSLATIONS.ta }),
  te: Object.freeze({ ...BASE_TRANSLATIONS.te, ...PLATFORM_TRANSLATIONS.te }),
  hi: Object.freeze({ ...BASE_TRANSLATIONS.hi, ...PLATFORM_TRANSLATIONS.hi }),
})
