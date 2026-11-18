import { SHAPES } from '../utils/mathEngine.js'

/**
 * 3D model and diagram metadata for NCERT Mensuration - Class 10 Solved Practice (Q1-Q10).
 */
export const CLASS_10_PRACTICE_CONFIG = Object.freeze([
  {
    id: 'q1',
    shape: SHAPES.SPHERE,
    dimensions: { r: 3 },
    highlightMode: 'tsa',
    foldProgress: 100,
    altShape: SHAPES.HEMISPHERE,
    altDimensions: { r: 3 },
    svgPrimary: false,
  },
  {
    id: 'q2',
    shape: SHAPES.CONE,
    dimensions: { r: 1, h: 2 },
    highlightMode: 'volume',
    foldProgress: 100,
    altShape: SHAPES.CUBE,
    altDimensions: { a: 2 },
    svgPrimary: false,
  },
  {
    id: 'q3',
    shape: SHAPES.HEMISPHERE,
    dimensions: { r: 4 },
    highlightMode: 'tsa',
    foldProgress: 100,
    svgPrimary: false,
  },
  {
    id: 'q4',
    shape: SHAPES.CUBOID,
    dimensions: { l: 6, b: 3, h: 3 },
    highlightMode: 'tsa',
    foldProgress: 100,
    altShape: SHAPES.CUBE,
    altDimensions: { a: 3 },
    svgPrimary: false,
  },
  {
    id: 'q5',
    shape: SHAPES.CYLINDER,
    dimensions: { r: 3, h: 5 },
    highlightMode: 'lsa',
    foldProgress: 100,
    svgPrimary: false,
  },
  {
    id: 'q6',
    shape: SHAPES.CONE,
    dimensions: { r: 1.75, h: 6 },
    highlightMode: 'lsa',
    foldProgress: 100,
    svgPrimary: false,
  },
  {
    id: 'q7',
    shape: SHAPES.CYLINDER,
    dimensions: { r: 1.4, h: 4.8 },
    highlightMode: 'tsa',
    foldProgress: 100,
    svgPrimary: false,
  },
  {
    id: 'q8',
    shape: SHAPES.HEMISPHERE,
    dimensions: { r: 4 },
    highlightMode: 'tsa',
    foldProgress: 100,
    svgPrimary: false,
  },
  {
    id: 'q9',
    shape: SHAPES.HEMISPHERE,
    dimensions: { r: 4 },
    highlightMode: 'all',
    foldProgress: 100,
    svgPrimary: true,
  },
  {
    id: 'q10',
    shape: SHAPES.CONE,
    dimensions: { r: 4.03, h: 5 },
    highlightMode: 'volume',
    foldProgress: 100,
    svgPrimary: false,
  },
])

/**
 * Multilingual 10-step NCERT Class 10 board-exam solutions in all 5 supported languages.
 */
export const CLASS_10_PRACTICE_CONTENT = Object.freeze({
  en: {
    q1: {
      title: 'Sphere vs Two Hemispheres Surface Area Ratio',
      question:
        'A solid sphere is cut into two hemispheres. What is the ratio of the surface areas of the sphere to that of the two hemispheres taken together?',
      concept:
        'A solid sphere has one continuous curved surface of area 4πr². When sliced cleanly through its center into two identical solid hemispheres, each hemisphere keeps half the curved dome (2πr²) plus a newly exposed flat circular cross-section of area πr².',
      given: 'Let the radius of the solid sphere be r units. Cutting through the center produces two congruent solid hemispheres each of radius r.',
      toFind: 'The ratio: (Surface area of the sphere) : (Combined total surface area of the two hemispheres).',
      formula: 'TSA of Sphere = 4πr² | TSA of 1 Solid Hemisphere = 2πr² + πr² = 3πr²',
      derivation: [
        'Curved surface area of each hemisphere = ½ × 4πr² = 2πr².',
        'Cutting a solid exposes a flat circle of area πr² on each half, so TSA of one solid hemisphere = 2πr² + πr² = 3πr².',
        'Combined TSA of the two solid hemispheres = 3πr² + 3πr² = 6πr².',
      ],
      substitution: 'Required Ratio = (4πr²) : (6πr²)',
      calculations: [
        'Ratio = (4πr²) / (6πr²)',
        'Cancel the common factor πr² (since r > 0): Ratio = 4 / 6',
        'Divide numerator and denominator by HCF 2: Ratio = 2 / 3',
      ],
      finalAnswer: '2 : 3 (the combined surface area increases by 50% due to two new circular faces)',
      diagramCaption: 'Sphere (4πr²) vs Two Solid Hemispheres (3πr² + 3πr² = 6πr²) · 3D scale r = 3',
    },
    q2: {
      title: 'Largest Cone Carved Out from a 2 cm Cube',
      question:
        'Find the volume of the largest right circular cone that can be carved out from a solid cube of edge 2 cm.',
      concept:
        'For a right circular cone carved out of a solid cube to have maximum volume, its circular base must fit edge-to-edge on one square face (maximum diameter d = edge a) and its apex must touch the opposite face vertically (maximum height h = edge a).',
      given: 'Edge of the solid cube (a) = 2 cm.',
      toFind: 'Volume (V) of the largest inscribed right circular cone in cm³.',
      formula: 'Volume of a Cone (V) = ⅓ π r² h',
      derivation: [
        'Diameter of the largest circle inscribed inside a square face of side a = 2 cm is d = 2 cm.',
        'Therefore, base radius r = d / 2 = 2 / 2 = 1 cm.',
        'Height of the cone reaches from bottom face to top face: h = a = 2 cm.',
      ],
      substitution: 'V = ⅓ × π × (1)² × 2',
      calculations: [
        'V = ⅓ × π × 1 × 2 = (2/3)π cm³',
        'Taking π ≈ 22/7: V ≈ (2 × 22) / (3 × 7) = 44 / 21 ≈ 2.10 cm³',
        'Using exact π ≈ 3.1416: V ≈ 2.09 cm³',
      ],
      finalAnswer: '(2π / 3) cm³ (or approximately 2.09 cm³ / 44/21 cm³)',
      diagramCaption: 'Cube a = 2 cm containing largest cone: r = 1 cm, h = 2 cm',
    },
    q3: {
      title: 'Ratio of Solid Hemisphere TSA to Radius Squared',
      question:
        'Find the ratio of the total surface area of a solid hemisphere to the square of its radius.',
      concept:
        'A solid hemisphere includes both its hemispherical curved shell (half of a sphere = 2πr²) and its flat circular base (πr²).',
      given: 'Let r be the radius of the solid hemisphere (r > 0).',
      toFind: 'Ratio = (Total Surface Area of solid hemisphere) : r².',
      formula: 'TSA of Solid Hemisphere = 2πr² + πr² = 3πr²',
      derivation: [
        'Curved Surface Area (CSA) of hemisphere = 2πr².',
        'Area of circular base = πr².',
        'Total Surface Area (TSA) = 2πr² + πr² = 3πr².',
      ],
      substitution: 'Required Ratio = (3πr²) : r²',
      calculations: [
        'Ratio = (3πr²) / r²',
        'Cancel r² (r > 0): Ratio = 3π : 1',
        'With π = 22/7: 3 × (22/7) : 1 = 66 : 7 ≈ 9.43 : 1',
      ],
      finalAnswer: '3π : 1 (approximately 66 : 7 or 9.42 : 1)',
      diagramCaption: 'Solid hemisphere: Curved Dome (2πr²) + Circular Base (πr²) = 3πr²',
    },
    q4: {
      title: 'Total Surface Area of Two Cubes Joined End to End',
      question:
        "Two identical solid cubes of side 'a' are joined end to end. Find the total surface area of the resulting cuboid.",
      concept:
        'When two identical cubes of edge a are glued face-to-face, two square faces disappear inside the joint, forming a cuboid whose length doubles to 2a while breadth and height remain a.',
      given: "Edge of each identical solid cube = a units (number of cubes = 2).",
      toFind: 'Total Surface Area (TSA) of the resulting cuboid in square units.',
      formula: 'TSA of Cuboid = 2(lb + bh + hl)',
      derivation: [
        'Dimensions of resulting cuboid: Length l = a + a = 2a, Breadth b = a, Height h = a.',
        'Cross-check via faces: 2 × (6a²) − 2 × (joined hidden face a²) = 12a² − 2a² = 10a².',
      ],
      substitution: 'TSA = 2[ (2a)(a) + (a)(a) + (a)(2a) ]',
      calculations: [
        'Inside brackets: lb = 2a², bh = a², hl = 2a²',
        'Sum inside brackets = 2a² + a² + 2a² = 5a²',
        'Multiply by 2: TSA = 2 × 5a² = 10a²',
      ],
      finalAnswer: '10a² square units',
      diagramCaption: 'Two cubes (edge a) joined end-to-end → Cuboid (l = 2a, b = a, h = a)',
    },
    q5: {
      title: 'Find Cylinder Radius from Curved Surface Area',
      question:
        'The curved surface area of a cylinder of height 5 cm is 94.2 cm². Find its radius. Take π = 3.14.',
      concept:
        'Unrolling a cylinder’s curved wall produces a rectangle of width equal to circumference 2πr and height h, giving CSA = 2πrh.',
      given: 'Curved Surface Area (CSA) = 94.2 cm², Height (h) = 5 cm, π = 3.14.',
      toFind: 'Radius (r) of the cylinder base in cm.',
      formula: 'CSA of Cylinder = 2πrh',
      derivation: [
        'Since CSA = 2πrh, isolate radius r:',
        'r = CSA / (2πh).',
      ],
      substitution: '94.2 = 2 × 3.14 × r × 5',
      calculations: [
        '2 × 5 = 10, and 10 × 3.14 = 31.4',
        '94.2 = 31.4 × r',
        'r = 94.2 / 31.4 = 942 / 314 = 3 cm',
      ],
      finalAnswer: 'Radius r = 3 cm',
      diagramCaption: 'Cylinder model at exact dimensions: r = 3 cm, h = 5 cm, CSA = 94.2 cm²',
    },
    q6: {
      title: 'Curved Surface Area of Cone (r = 7 cm, h = 24 cm)',
      question:
        'Find the curved surface area of a cone having height 24 cm and radius 7 cm.',
      concept:
        'A right circular cone’s vertical height h, base radius r, and slant height l form a right-angled triangle satisfying Pythagoras’ theorem l² = r² + h². Its curved surface equals πrl.',
      given: 'Base radius (r) = 7 cm, Vertical height (h) = 24 cm.',
      toFind: 'Curved Surface Area (CSA) of the cone in cm².',
      formula: 'Slant height l = √(r² + h²) | CSA of Cone = πrl',
      derivation: [
        'First determine slant height l using Pythagoras’ theorem because CSA depends on l, not vertical height h directly.',
        'Then substitute r and l into CSA = πrl.',
      ],
      substitution: 'l = √(7² + 24²), then CSA = (22/7) × 7 × l',
      calculations: [
        'l = √(49 + 576) = √625 = 25 cm',
        'With π = 22/7: CSA = (22 / 7) × 7 × 25 = 22 × 25 = 550 cm²',
        '(Exact π form: 175π cm² ≈ 549.78 cm²)',
      ],
      finalAnswer: '550 cm² (taking π = 22/7) · or 175π cm²',
      diagramCaption: 'Right triangle (7, 24, 25) inside Cone net · 3D model shown at 1:4 scale (r=1.75, h=6)',
    },
    q7: {
      title: 'Metal Sheet Area for Closed Hollow Cylinder',
      question:
        'Find the area of the metal sheet required to make a closed hollow cylinder of height 2.4 m and base radius 0.7 m.',
      concept:
        'Because the cylinder is closed at both ends, the metal sheet must form the curved cylindrical wall (2πrh) AND both circular end lids (2πr²), which equals Total Surface Area (TSA).',
      given: 'Height (h) = 2.4 m, Base radius (r) = 0.7 m.',
      toFind: 'Total area of metal sheet required (= TSA of cylinder) in m².',
      formula: 'TSA of Closed Cylinder = 2πr(r + h)',
      derivation: [
        'Curved wall area = 2πrh; Area of top + bottom lids = πr² + πr² = 2πr².',
        'Factor common term 2πr: TSA = 2πrh + 2πr² = 2πr(r + h).',
      ],
      substitution: 'TSA = 2 × (22 / 7) × 0.7 × (0.7 + 2.4)',
      calculations: [
        '0.7 / 7 = 0.1',
        'r + h = 0.7 + 2.4 = 3.1 m',
        'TSA = 2 × 22 × 0.1 × 3.1 = 4.4 × 3.1 = 13.64 m²',
      ],
      finalAnswer: '13.64 m² of metal sheet',
      diagramCaption: 'Closed cylinder: r = 0.7 m, h = 2.4 m, TSA = 13.64 m² · 3D model shown at 2× visual scale',
    },
    q8: {
      title: 'Total Surface Area of Solid Hemisphere of Diameter d',
      question:
        "Find the total surface area of a solid hemisphere of diameter 'd'.",
      concept:
        'A solid hemisphere has a curved dome (2πr²) plus a flat circular face (πr²), giving TSA = 3πr². Diameter d equals twice radius r, so r = d / 2.',
      given: 'Diameter of solid hemisphere = d units.',
      toFind: 'Total Surface Area (TSA) expressed strictly in terms of d.',
      formula: 'r = d / 2 | TSA of Solid Hemisphere = 3πr²',
      derivation: [
        'Total surface area = Curved surface area + Circular base area = 2πr² + πr² = 3πr².',
        'Replace r with d / 2.',
      ],
      substitution: 'TSA = 3 × π × (d / 2)²',
      calculations: [
        '(d / 2)² = d² / 4',
        'TSA = 3π × (d² / 4)',
        'TSA = (3 / 4) π d² square units',
      ],
      finalAnswer: '(3/4)πd² square units',
      diagramCaption: 'Solid hemisphere with diameter d = 2r and radius r = d/2 → TSA = ¾πd²',
    },
    q9: {
      title: 'Area of a Semicircle of Diameter d',
      question: "Find the area of a semicircle of diameter 'd'.",
      concept:
        'A semicircle is exactly half of a flat circular disc along a diameter, so its area is ½ of the full circle area πr², with radius r = d / 2.',
      given: 'Diameter of semicircle = d units.',
      toFind: 'Area of the semicircle in terms of diameter d.',
      formula: 'r = d / 2 | Area of Semicircle = ½ πr²',
      derivation: [
        'Area of full circle = πr².',
        'Area of semicircle = ½ × πr².',
        'Substitute r = d / 2 to express area solely in diameter d.',
      ],
      substitution: 'Area = ½ × π × (d / 2)²',
      calculations: [
        '(d / 2)² = d² / 4',
        'Area = (1/2) × π × (d² / 4)',
        'Area = (1 / 8) π d² square units',
      ],
      finalAnswer: '(1/8)πd² square units',
      diagramCaption: 'Flat circular base semicircle: diameter = d, radius r = d/2, Area = (1/8)πd²',
    },
    q10: {
      title: 'Vertical Height of a Cone from Base Area and Volume',
      question:
        'The area of the base of a cone is 51 cm² and its volume is 85 cm³. Find its vertical height.',
      concept:
        'The base of a right circular cone is a flat circle of area B = πr². Substituting B = πr² into the cone volume formula V = ⅓πr²h gives V = ⅓ B h directly without finding radius first.',
      given: 'Area of base (B = πr²) = 51 cm², Volume of cone (V) = 85 cm³.',
      toFind: 'Vertical height (h) of the cone in cm.',
      formula: 'Volume of Cone (V) = ⅓ × Base Area × h = ⅓ πr²h',
      derivation: [
        'Use V = ⅓ × B × h.',
        'Rearrange to solve for vertical height h = (3 × V) / B.',
      ],
      substitution: '85 = ⅓ × 51 × h',
      calculations: [
        'Simplify 51 / 3 = 17',
        'Equation becomes: 85 = 17 × h',
        'Divide both sides by 17: h = 85 / 17 = 5 cm',
      ],
      finalAnswer: 'Vertical height h = 5 cm',
      diagramCaption: 'Cone with Base Area B = 51 cm² (r ≈ 4.03 cm), h = 5 cm, V = 85 cm³',
    },
  },

  kn: {
    q1: {
      title: 'ಗೋಳ ಮತ್ತು ಎರಡು ಅರ್ಧಗೋಳಗಳ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣದ ಅನುಪಾತ',
      question:
        'ಒಂದು ಘನ ಗೋಳವನ್ನು ಎರಡು ಅರ್ಧಗೋಳಗಳಾಗಿ ಕತ್ತರಿಸಲಾಗಿದೆ. ಗೋಳದ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣಕ್ಕೂ ಮತ್ತು ಎರಡೂ ಅರ್ಧಗೋಳಗಳ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣಕ್ಕೂ ಇರುವ ಅನುಪಾತವೇನು?',
      concept:
        'ಘನ ಗೋಳವು 4πr² ವಿಸ್ತೀರ್ಣದ ಒಂದೇ ವಕ್ರ ಮೇಲ್ಮೈ ಹೊಂದಿರುತ್ತದೆ. ಕೇಂದ್ರದ ಮೂಲಕ ಕತ್ತರಿಸಿದಾಗ ಪ್ರತಿ ಅರ್ಧಗೋಳಕ್ಕೆ ಅರ್ಧ ವಕ್ರ ಗುಂಬದ (2πr²) ಜೊತೆಗೆ ಹೊಸದಾಗಿ πr² ವಿಸ್ತೀರ್ಣದ ವೃತ್ತ ಪಾದ ಸೇರುತ್ತದೆ.',
      given: 'ಘನ ಗೋಳದ ತ್ರಿಜ್ಯ = r ಮಾನಗಳು. ಎರಡು ಸಮಾನ ಘನ ಅರ್ಧಗೋಳಗಳ ತ್ರಿಜ್ಯವೂ r ಆಗಿರುತ್ತದೆ.',
      toFind: 'ಅನುಪಾತ = (ಗೋಳದ ವಿಸ್ತೀರ್ಣ) : (ಎರಡು ಅರ್ಧಗೋಳಗಳ ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ).',
      formula: 'ಗೋಳದ TSA = 4πr² | 1 ಘನ ಅರ್ಧಗೋಳದ TSA = 2πr² + πr² = 3πr²',
      derivation: [
        'ಪ್ರತಿ ಅರ್ಧಗೋಳದ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (CSA) = ½ × 4πr² = 2πr².',
        'ಕತ್ತರಿಸಿದಾಗ ಪ್ರತಿ ಭಾಗಕ್ಕೆ πr² ವೃತ್ತ ಪಾದ ಸೇರುವುದರಿಂದ 1 ಘನ ಅರ್ಧಗೋಳದ TSA = 2πr² + πr² = 3πr².',
        'ಎರಡೂ ಘನ ಅರ್ಧಗೋಳಗಳ ಒಟ್ಟು TSA = 3πr² + 3πr² = 6πr².',
      ],
      substitution: 'ಅಗತ್ಯ ಅನುಪಾತ = (4πr²) : (6πr²)',
      calculations: [
        'ಅನುಪಾತ = 4πr² / 6πr²',
        'ಸಾಮಾನ್ಯ ಪದ πr² ರದ್ದುಗೊಳಿಸಿ: = 4 / 6',
        '2 ರಿಂದ ಭಾಗಿಸಿ ಸರಳಗೊಳಿಸಿ: = 2 / 3',
      ],
      finalAnswer: '2 : 3',
      diagramCaption: 'ಗೋಳ (4πr²) ಮತ್ತು ಎರಡು ಅರ್ಧಗೋಳಗಳು (3πr² + 3πr² = 6πr²)',
    },
    q2: {
      title: '2 ಸೆಂ.ಮೀ ಘನದಿಂದ ಕೆತ್ತಬಹುದಾದ ಅತಿದೊಡ್ಡ ಶಂಕುವಿನ ಘನಫಲ',
      question:
        '2 ಸೆಂ.ಮೀ ಅಂಚಿನ ಘನದಿಂದ ಕೆತ್ತಿ ತೆಗೆಯಬಹುದಾದ ಅತಿದೊಡ್ಡ ಲಂಬ ವೃತ್ತಾಕಾರದ ಶಂಕುವಿನ ಘನಫಲವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಘನದೊಳಗೆ ಅತಿದೊಡ್ಡ ಶಂಕು ಹಿಡಿಯಬೇಕಾದರೆ ಅದರ ವೃತ್ತ ಪಾದದ ವ್ಯಾಸವು ಘನದ ಅಂಚಿಗೆ (d = a) ಸಮವಾಗಿರಬೇಕು ಮತ್ತು ಎತ್ತರವೂ ಘನದ ಅಂಚಿಗೆ (h = a) ಸಮವಾಗಿರಬೇಕು.',
      given: 'ಘನದ ಅಂಚು (a) = 2 ಸೆಂ.ಮೀ.',
      toFind: 'ಅತಿದೊಡ್ಡ ಶಂಕುವಿನ ಘನಫಲ (V).',
      formula: 'ಶಂಕುವಿನ ಘನಫಲ V = ⅓ π r² h',
      derivation: [
        'ಶಂಕುವಿನ ಪಾದದ ವ್ಯಾಸ d = a = 2 ಸೆಂ.ಮೀ ಆದ್ದರಿಂದ ತ್ರಿಜ್ಯ r = 2 / 2 = 1 ಸೆಂ.ಮೀ.',
        'ಶಂಕುವಿನ ಎತ್ತರ h = a = 2 ಸೆಂ.ಮೀ.',
      ],
      substitution: 'V = ⅓ × π × (1)² × 2',
      calculations: [
        'V = ⅓ × π × 1 × 2 = (2/3)π ಸೆಂ.ಮೀ³',
        'π ≈ 22/7 ಆದಾಗ: V ≈ 44 / 21 ≈ 2.10 ಸೆಂ.ಮೀ³ (ಅಥವಾ 2.09 ಸೆಂ.ಮೀ³)',
      ],
      finalAnswer: '(2π / 3) ಸೆಂ.ಮೀ³ (ಅಥವಾ ≈ 2.09 ಸೆಂ.ಮೀ³)',
      diagramCaption: '2 ಸೆಂ.ಮೀ ಘನದ ಒಳಗಿನ ಅತಿದೊಡ್ಡ ಶಂಕು: r = 1 ಸೆಂ.ಮೀ, h = 2 ಸೆಂ.ಮೀ',
    },
    q3: {
      title: 'ಘನ ಅರ್ಧಗೋಳದ TSA ಮತ್ತು ತ್ರಿಜ್ಯದ ವರ್ಗದ ಅನುಪಾತ',
      question:
        'ಘನ ಅರ್ಧಗೋಳದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣಕ್ಕೂ ಮತ್ತು ಅದರ ತ್ರಿಜ್ಯದ ವರ್ಗಕ್ಕೂ ಇರುವ ಅನುಪಾತವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಘನ ಅರ್ಧಗೋಳದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವು ವಕ್ರ ಮೇಲ್ಮೈ (2πr²) ಮತ್ತು ಸಮತಲ ವೃತ್ತ ಪಾದದ (πr²) ಮೊತ್ತವಾಗಿದೆ.',
      given: 'ಘನ ಅರ್ಧಗೋಳದ ತ್ರಿಜ್ಯ = r ಮಾನಗಳು.',
      toFind: 'ಅನುಪಾತ = (ಘನ ಅರ್ಧಗೋಳದ TSA) : r².',
      formula: 'ಘನ ಅರ್ಧಗೋಳದ TSA = 3πr²',
      derivation: [
        'ವಕ್ರ ಮೇಲ್ಮೈ = 2πr², ವೃತ್ತ ಪಾದ = πr².',
        'ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA) = 2πr² + πr² = 3πr².',
      ],
      substitution: 'ಅನುಪಾತ = (3πr²) : r²',
      calculations: [
        'ಅನುಪಾತ = 3πr² / r²',
        'r² ರದ್ದುಗೊಳಿಸಿ: = 3π : 1 (ಅಥವಾ π=22/7 ಆದಾಗ 66 : 7)',
      ],
      finalAnswer: '3π : 1',
      diagramCaption: 'ಘನ ಅರ್ಧಗೋಳ: ವಕ್ರ ಗುಂಬದ (2πr²) + ಪಾದ (πr²) = 3πr²',
    },
    q4: {
      title: 'ತುದಿಯಿಂದ ತುದಿಗೆ ಜೋಡಿಸಿದ ಎರಡು ಘನಗಳ ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ',
      question:
        "‘a’ ಬಾಹುವಿರುವ ಎರಡು ಒಂದೇ ರೀತಿಯ ಘನಗಳನ್ನು ತುದಿಯಿಂದ ತುದಿಗೆ ಜೋಡಿಸಲಾಗಿದೆ. ಇದರಿಂದ ಉಂಟಾಗುವ ಆಯತಘನದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.",
      concept:
        'ಎರಡು ಸಮಾನ ಘನಗಳನ್ನು ಜೋಡಿಸಿದಾಗ ಅವುಗಳ ನಡುವಿನ 2 ಮುಖಗಳು ಮುಚ್ಚಿಹೋಗುತ್ತವೆ ಮತ್ತು ಉದ್ದವು 2a ಆಗಿರುವ ಆಯತಘನ ರೂಪುಗೊಳ್ಳುತ್ತದೆ.',
      given: 'ಪ್ರತಿ ಘನದ ಅಂಚು = a ಮಾನಗಳು (ಒಟ್ಟು 2 ಘನಗಳು).',
      toFind: 'ಉಂಟಾದ ಆಯತಘನದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA).',
      formula: 'ಆಯತಘನದ TSA = 2(lb + bh + hl)',
      derivation: [
        'ಆಯತಘನದ ಉದ್ದ l = a + a = 2a, ಅಗಲ b = a, ಎತ್ತರ h = a.',
        'ಪರ್ಯಾಯವಾಗಿ: 2(6a²) − 2a² = 10a².',
      ],
      substitution: 'TSA = 2[ (2a)(a) + (a)(a) + (a)(2a) ]',
      calculations: [
        'lb = 2a², bh = a², hl = 2a²',
        'ಮೊತ್ತ = 2a² + a² + 2a² = 5a²',
        'TSA = 2 × 5a² = 10a²',
      ],
      finalAnswer: '10a² ಚದರ ಮಾನಗಳು',
      diagramCaption: 'ಜೋಡಿಸಿದ ಎರಡು ಘನಗಳು → ಆಯತಘನ (l = 2a, b = a, h = a)',
    },
    q5: {
      title: 'ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣದಿಂದ ಸಿಲಿಂಡರ್ ತ್ರಿಜ್ಯ ಕಂಡುಹಿಡಿಯುವುದು',
      question:
        '5 ಸೆಂ.ಮೀ ಎತ್ತರವಿರುವ ಸಿಲಿಂಡರ್‌ನ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವು 94.2 ಸೆಂ.ಮೀ² ಆಗಿದೆ. ಅದರ ತ್ರಿಜ್ಯವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ (π = 3.14 ತೆಗೆದುಕೊಳ್ಳಿ).',
      concept:
        'ಸಿಲಿಂಡರ್‌ನ ವಕ್ರ ಗೋಡೆಯನ್ನು ಬಿಚ್ಚಿದಾಗ ಅದು 2πr ಅಗಲ ಮತ್ತು h ಎತ್ತರದ ಆಯತವಾಗುತ್ತದೆ, ಆದ್ದರಿಂದ CSA = 2πrh.',
      given: 'CSA = 94.2 ಸೆಂ.ಮೀ², ಎತ್ತರ h = 5 ಸೆಂ.ಮೀ, π = 3.14.',
      toFind: 'ಸಿಲಿಂಡರ್‌ನ ತ್ರಿಜ್ಯ r.',
      formula: 'ಸಿಲಿಂಡರ್‌ನ CSA = 2πrh',
      derivation: ['CSA = 2πrh ⇒ r = CSA / (2πh).'],
      substitution: '94.2 = 2 × 3.14 × r × 5',
      calculations: [
        '2 × 5 × 3.14 = 10 × 3.14 = 31.4',
        '94.2 = 31.4 × r',
        'r = 94.2 / 31.4 = 3 ಸೆಂ.ಮೀ',
      ],
      finalAnswer: 'ತ್ರಿಜ್ಯ r = 3 ಸೆಂ.ಮೀ',
      diagramCaption: 'ನಿಖರ 3D ಸಿಲಿಂಡರ್: r = 3 ಸೆಂ.ಮೀ, h = 5 ಸೆಂ.ಮೀ, CSA = 94.2 ಸೆಂ.ಮೀ²',
    },
    q6: {
      title: 'ಶಂಕುವಿನ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (h = 24 ಸೆಂ.ಮೀ, r = 7 ಸೆಂ.ಮೀ)',
      question:
        '24 ಸೆಂ.ಮೀ ಎತ್ತರ ಮತ್ತು 7 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯವಿರುವ ಶಂಕುವಿನ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಶಂಕುವಿನ ಲಂಬ ಎತ್ತರ h, ತ್ರಿಜ್ಯ r ಮತ್ತು ಓರೆ ಎತ್ತರ l ಲಂಬಕೋನ ತ್ರಿಭುಜವನ್ನು ರೂಪಿಸುತ್ತವೆ: l² = r² + h². ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವು πrl ಆಗಿದೆ.',
      given: 'ತ್ರಿಜ್ಯ r = 7 ಸೆಂ.ಮೀ, ಎತ್ತರ h = 24 ಸೆಂ.ಮೀ.',
      toFind: 'ಶಂಕುವಿನ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (CSA).',
      formula: 'l = √(r² + h²) | ಶಂಕುವಿನ CSA = πrl',
      derivation: [
        'ಮೊದಲು ಪೈಥಾಗೋರಸ್ ಪ್ರಮೇಯದಿಂದ ಓರೆ ಎತ್ತರ l ಕಂಡುಹಿಡಿಯಿರಿ.',
        'ನಂತರ CSA = πrl ಸೂತ್ರದಲ್ಲಿ ಆದೇಶಿಸಿ.',
      ],
      substitution: 'l = √(7² + 24²), CSA = (22/7) × 7 × l',
      calculations: [
        'l = √(49 + 576) = √625 = 25 ಸೆಂ.ಮೀ',
        'CSA = (22 / 7) × 7 × 25 = 22 × 25 = 550 ಸೆಂ.ಮೀ² (ನಿಖರವಾಗಿ 175π ಸೆಂ.ಮೀ²)',
      ],
      finalAnswer: '550 ಸೆಂ.ಮೀ² (π = 22/7 ಆದಾಗ) · ಅಥವಾ 175π ಸೆಂ.ಮೀ²',
      diagramCaption: 'ಶಂಕು r = 7 ಸೆಂ.ಮೀ, h = 24 ಸೆಂ.ಮೀ, ಓರೆ ಎತ್ತರ l = 25 ಸೆಂ.ಮೀ (3D ಪ್ರಮಾಣ 1:4)',
    },
    q7: {
      title: 'ಮುಚ್ಚಿದ ಟೊಳ್ಳು ಸಿಲಿಂಡರ್‌ಗೆ ಬೇಕಾಗುವ ಲೋಹದ ಹಾಳೆಯ ವಿಸ್ತೀರ್ಣ',
      question:
        '2.4 ಮೀ ಎತ್ತರ ಮತ್ತು 0.7 ಮೀ ಪಾದದ ತ್ರಿಜ್ಯವಿರುವ ಮುಚ್ಚಿದ ಟೊಳ್ಳು ಸಿಲಿಂಡರ್ ತಯಾರಿಸಲು ಬೇಕಾದ ಲೋಹದ ಹಾಳೆಯ ವಿಸ್ತೀರ್ಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಎರಡೂ ತುದಿಗಳಲ್ಲಿ ಮುಚ್ಚಿರುವುದರಿಂದ ವಕ್ರ ಗೋಡೆ (2πrh) ಮತ್ತು ಎರಡು ವೃತ್ತಾಕಾರದ ಮುಚ್ಚಳಗಳು (2πr²) ಸೇರಿ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA) ಅಗತ್ಯವಾಗುತ್ತದೆ.',
      given: 'ಎತ್ತರ h = 2.4 ಮೀ, ತ್ರಿಜ್ಯ r = 0.7 ಮೀ.',
      toFind: 'ಬೇಕಾಗುವ ಲೋಹದ ಹಾಳೆಯ ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ (TSA).',
      formula: 'ಮುಚ್ಚಿದ ಸಿಲಿಂಡರ್‌ನ TSA = 2πr(r + h)',
      derivation: ['TSA = 2πrh + 2πr² = 2πr(r + h).'],
      substitution: 'TSA = 2 × (22 / 7) × 0.7 × (0.7 + 2.4)',
      calculations: [
        '0.7 / 7 = 0.1 ಮತ್ತು (0.7 + 2.4) = 3.1 ಮೀ',
        'TSA = 2 × 22 × 0.1 × 3.1 = 4.4 × 3.1 = 13.64 ಮೀ²',
      ],
      finalAnswer: '13.64 ಮೀ² ಲೋಹದ ಹಾಳೆ',
      diagramCaption: 'ಮುಚ್ಚಿದ ಸಿಲಿಂಡರ್: r = 0.7 ಮೀ, h = 2.4 ಮೀ, TSA = 13.64 ಮೀ²',
    },
    q8: {
      title: '‘d’ ವ್ಯಾಸದ ಘನ ಅರ್ಧಗೋಳದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ',
      question: '‘d’ ವ್ಯಾಸವಿರುವ ಘನ ಅರ್ಧಗೋಳದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಘನ ಅರ್ಧಗೋಳದ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವು 3πr² ಆಗಿದೆ ಮತ್ತು ತ್ರಿಜ್ಯ r = d / 2.',
      given: 'ಘನ ಅರ್ಧಗೋಳದ ವ್ಯಾಸ = d ಮಾನಗಳು.',
      toFind: 'd ಪದಗಳಲ್ಲಿ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA).',
      formula: 'r = d / 2 | ಘನ ಅರ್ಧಗೋಳದ TSA = 3πr²',
      derivation: ['TSA = 3πr² ನಲ್ಲಿ r = d / 2 ಆದೇಶಿಸಿ.'],
      substitution: 'TSA = 3 × π × (d / 2)²',
      calculations: [
        '(d / 2)² = d² / 4',
        'TSA = 3π × (d² / 4) = (3/4)πd²',
      ],
      finalAnswer: '(3/4)πd² ಚದರ ಮಾನಗಳು',
      diagramCaption: 'ಘನ ಅರ್ಧಗೋಳ: ವ್ಯಾಸ d, ತ್ರಿಜ್ಯ r = d/2 → TSA = ¾πd²',
    },
    q9: {
      title: '‘d’ ವ್ಯಾಸವಿರುವ ಅರ್ಧವೃತ್ತದ ವಿಸ್ತೀರ್ಣ',
      question: '‘d’ ವ್ಯಾಸವಿರುವ ಅರ್ಧವೃತ್ತದ ವಿಸ್ತೀರ್ಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಅರ್ಧವೃತ್ತವು ವೃತ್ತದ (πr²) ಸರಿಯಾಗಿ ಅರ್ಧ ಭಾಗವಾಗಿದೆ, ಇಲ್ಲಿ r = d / 2.',
      given: 'ಅರ್ಧವೃತ್ತದ ವ್ಯಾಸ = d ಮಾನಗಳು.',
      toFind: 'ವ್ಯಾಸ d ಪದಗಳಲ್ಲಿ ಅರ್ಧವೃತ್ತದ ವಿಸ್ತೀರ್ಣ.',
      formula: 'r = d / 2 | ಅರ್ಧವೃತ್ತದ ವಿಸ್ತೀರ್ಣ = ½ πr²',
      derivation: ['ಅರ್ಧವೃತ್ತದ ವಿಸ್ತೀರ್ಣ = ½ πr² ನಲ್ಲಿ r = d / 2 ಇರಿಸಿ.'],
      substitution: 'ವಿಸ್ತೀರ್ಣ = ½ × π × (d / 2)²',
      calculations: [
        '(d / 2)² = d² / 4',
        'ವಿಸ್ತೀರ್ಣ = (1/2) × π × (d² / 4) = (1/8)πd²',
      ],
      finalAnswer: '(1/8)πd² ಚದರ ಮಾನಗಳು',
      diagramCaption: 'ಅರ್ಧವೃತ್ತ: ವ್ಯಾಸ d, ತ್ರಿಜ್ಯ r = d/2, ವಿಸ್ತೀರ್ಣ = (1/8)πd²',
    },
    q10: {
      title: 'ಪಾದದ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಘನಫಲದಿಂದ ಶಂಕುವಿನ ಎತ್ತರ',
      question:
        'ಒಂದು ಶಂಕುವಿನ ಪಾದದ ವಿಸ್ತೀರ್ಣ 51 ಸೆಂ.ಮೀ² ಮತ್ತು ಘನಫಲ 85 ಸೆಂ.ಮೀ³ ಆಗಿದೆ. ಅದರ ಲಂಬ ಎತ್ತರವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      concept:
        'ಶಂಕುವಿನ ಪಾದದ ವಿಸ್ತೀರ್ಣ B = πr² ಆಗಿರುವುದರಿಂದ V = ⅓ πr²h = ⅓ × B × h ಆಗುತ್ತದೆ.',
      given: 'ಪಾದದ ವಿಸ್ತೀರ್ಣ (B) = 51 ಸೆಂ.ಮೀ², ಘನಫಲ (V) = 85 ಸೆಂ.ಮೀ³.',
      toFind: 'ಶಂಕುವಿನ ಲಂಬ ಎತ್ತರ (h).',
      formula: 'ಶಂಕುವಿನ ಘನಫಲ V = ⅓ × ಪಾದದ ವಿಸ್ತೀರ್ಣ × h',
      derivation: ['V = ⅓ × B × h ⇒ h = (3 × V) / B.'],
      substitution: '85 = ⅓ × 51 × h',
      calculations: [
        '51 / 3 = 17',
        '85 = 17 × h',
        'h = 85 / 17 = 5 ಸೆಂ.ಮೀ',
      ],
      finalAnswer: 'ಲಂಬ ಎತ್ತರ h = 5 ಸೆಂ.ಮೀ',
      diagramCaption: 'ಶಂಕು: ಪಾದದ ವಿಸ್ತೀರ್ಣ B = 51 ಸೆಂ.ಮೀ², ಎತ್ತರ h = 5 ಸೆಂ.ಮೀ, V = 85 ಸೆಂ.ಮೀ³',
    },
  },

  ta: {
    q1: {
      title: 'கோளம் மற்றும் இரு அரைக்கோளங்களின் புறப்பரப்பளவு விகிதம்',
      question:
        'ஒரு திண்மக் கோளம் இரு அரைக்கோளங்களாக வெட்டப்படுகிறது. கோளத்தின் புறப்பரப்பளவிற்கும் இரு அரைக்கோளங்களின் மொத்தப் புறப்பரப்பளவிற்கும் உள்ள விகிதம் என்ன?',
      concept:
        'திண்மக் கோளத்தின் பரப்பளவு 4πr². நடுவே வெட்டும்போது ஒவ்வொரு அரைக்கோளத்திலும் பாதி வளைபரப்போடு (2πr²) புதிதாக ஒரு வட்ட அடிப்பகுதி (πr²) உருவாகிறது.',
      given: 'கோளத்தின் ஆரம் = r அலகுகள். இரு அரைக்கோளங்களின் ஆரமும் r ஆகும்.',
      toFind: 'விகிதம் = (கோளத்தின் பரப்பளவு) : (இரு அரைக்கோளங்களின் மொத்தப் பரப்பளவு).',
      formula: 'கோளத்தின் TSA = 4πr² | 1 திண்ம அரைக்கோள TSA = 2πr² + πr² = 3πr²',
      derivation: [
        'ஒவ்வொரு அரைக்கோளத்தின் வளைபரப்பு = 2πr², வட்ட அடிப்பரப்பு = πr².',
        '1 திண்ம அரைக்கோளத்தின் TSA = 3πr² ⇒ இரு அரைக்கோளங்களின் மொத்த TSA = 6πr².',
      ],
      substitution: 'விகிதம் = (4πr²) : (6πr²)',
      calculations: [
        'விகிதம் = 4πr² / 6πr² = 4 / 6',
        '2 ஆல் வகுக்க: = 2 / 3',
      ],
      finalAnswer: '2 : 3',
      diagramCaption: 'கோளம் (4πr²) மற்றும் இரு அரைக்கோளங்கள் (3πr² + 3πr² = 6πr²)',
    },
    q2: {
      title: '2 செ.மீ கனசதுரத்தில் செதுக்கப்படும் மிகப்பெரிய கூம்பின் கன அளவு',
      question:
        '2 செ.மீ விளிம்பு கொண்ட திண்மக் கனசதுரத்திலிருந்து செதுக்கப்படக்கூடிய மிகப்பெரிய நேர் வட்டக் கூம்பின் கன அளவைக் காண்க.',
      concept:
        'கனசதுரத்திற்குள் பொருந்தும் மிகப்பெரிய கூம்பின் அடி விட்டமும் உயரமும் கனசதுர விளிம்பு a = 2 செ.மீ க்குச் சமமாக இருக்கும்.',
      given: 'திண்மக் கனசதுரத்தின் விளிம்பு (a) = 2 செ.மீ.',
      toFind: 'மிகப்பெரிய கூம்பின் கன அளவு (V).',
      formula: 'கூம்பின் கன அளவு V = ⅓ π r² h',
      derivation: [
        'அடி விட்டம் d = a = 2 செ.மீ ⇒ ஆரம் r = 1 செ.மீ.',
        'கூம்பின் உயரம் h = a = 2 செ.மீ.',
      ],
      substitution: 'V = ⅓ × π × (1)² × 2',
      calculations: [
        'V = (2/3)π செ.மீ³',
        'π ≈ 22/7 எனில்: V ≈ 44 / 21 ≈ 2.10 செ.மீ³ (அல்லது 2.09 செ.மீ³)',
      ],
      finalAnswer: '(2π / 3) செ.மீ³ (சுமார் 2.09 செ.மீ³)',
      diagramCaption: '2 செ.மீ கனசதுரத்திற்குள் உள்ள மிகப்பெரிய கூம்பு: r = 1 செ.மீ, h = 2 செ.மீ',
    },
    q3: {
      title: 'திண்ம அரைக்கோள TSA மற்றும் ஆர வர்க்கத்தின் விகிதம்',
      question:
        'ஒரு திண்ம அரைக்கோளத்தின் மொத்தப் புறப்பரப்பளவிற்கும் அதன் ஆரத்தின் வர்க்கத்திற்கும் உள்ள விகிதத்தைக் காண்க.',
      concept:
        'திண்ம அரைக்கோளத்தின் TSA என்பது வளைபரப்பு (2πr²) மற்றும் வட்ட அடிப்பரப்பு (πr²) ஆகியவற்றின் கூட்டுத்தொகையாகும்.',
      given: 'திண்ம அரைக்கோளத்தின் ஆரம் = r அலகுகள்.',
      toFind: 'விகிதம் = (திண்ம அரைக்கோள TSA) : r².',
      formula: 'திண்ம அரைக்கோள TSA = 3πr²',
      derivation: ['TSA = 2πr² + πr² = 3πr².'],
      substitution: 'விகிதம் = (3πr²) : r²',
      calculations: ['r² நீக்க: = 3π : 1 (π=22/7 எனில் 66 : 7)'],
      finalAnswer: '3π : 1',
      diagramCaption: 'திண்ம அரைக்கோளம்: வளைந்த குவிமாடம் (2πr²) + அடிப்பகுதி (πr²) = 3πr²',
    },
    q4: {
      title: 'இரு கனசதுரங்களை இணைப்பதால் உருவாகும் கனசெவ்வகத்தின் TSA',
      question:
        "'a' பக்க அளவுள்ள இரு சம திண்மக் கனசதுரங்கள் முனையோடு முனை இணைக்கப்படுகின்றன. உருவாகும் கனசெவ்வகத்தின் மொத்தப் புறப்பரப்பளவைக் காண்க.",
      concept:
        'இரு கனசதுரங்களை இணைக்கும்போது நீளம் 2a ஆக உயர்கிறது; அகலமும் உயரமும் a ஆகவே இருக்கும்.',
      given: 'ஒவ்வொரு கனசதுரத்தின் பக்கம் = a அலகுகள்.',
      toFind: 'உருவாகும் கனசெவ்வகத்தின் TSA.',
      formula: 'கனசெவ்வகத்தின் TSA = 2(lb + bh + hl)',
      derivation: ['l = 2a, b = a, h = a (அல்லது 12a² − 2a² = 10a²).'],
      substitution: 'TSA = 2[ (2a)(a) + (a)(a) + (a)(2a) ]',
      calculations: ['= 2(2a² + a² + 2a²) = 2 × 5a² = 10a²'],
      finalAnswer: '10a² சதுர அலகுகள்',
      diagramCaption: 'இணைக்கப்பட்ட இரு கனசதுரங்கள் → கனசெவ்வகம் (l = 2a, b = a, h = a)',
    },
    q5: {
      title: 'உருளையின் வளைபரப்பிலிருந்து ஆரம் காணுதல்',
      question:
        '5 செ.மீ உயரம் கொண்ட உருளையின் வளைபரப்பு 94.2 செ.மீ² எனில் அதன் ஆரத்தைக் காண்க (π = 3.14).',
      concept:
        'உருளையின் வளைந்த சுவர் விரிக்கப்படும்போது 2πr நீளமும் h உயரமும் கொண்ட செவ்வகமாகும் (CSA = 2πrh).',
      given: 'CSA = 94.2 செ.மீ², உயரம் h = 5 செ.மீ, π = 3.14.',
      toFind: 'உருளையின் ஆரம் (r).',
      formula: 'உருளையின் CSA = 2πrh',
      derivation: ['r = CSA / (2πh).'],
      substitution: '94.2 = 2 × 3.14 × r × 5',
      calculations: [
        '2 × 5 × 3.14 = 31.4',
        '94.2 = 31.4 × r ⇒ r = 94.2 / 31.4 = 3 செ.மீ',
      ],
      finalAnswer: 'ஆரம் r = 3 செ.மீ',
      diagramCaption: 'உருளை: r = 3 செ.மீ, h = 5 செ.மீ, CSA = 94.2 செ.மீ²',
    },
    q6: {
      title: 'கூம்பின் வளைபரப்பு (h = 24 செ.மீ, r = 7 செ.மீ)',
      question:
        '24 செ.மீ உயரமும் 7 செ.மீ ஆரமும் கொண்ட கூம்பின் வளைபரப்பைக் காண்க.',
      concept:
        'கூம்பின் உயரம் h, ஆரம் r, சாய்வு உயரம் l ஆகியவை l² = r² + h² எனும் பிதாகரஸ் தொடர்பைக் கொண்டுள்ளன.',
      given: 'ஆரம் r = 7 செ.மீ, உயரம் h = 24 செ.மீ.',
      toFind: 'கூம்பின் வளைபரப்பு (CSA).',
      formula: 'l = √(r² + h²) | கூம்பின் CSA = πrl',
      derivation: ['முதலில் சாய்வு உயரம் l கண்டுபிடித்து பின்னர் CSA = πrl இல் பிரதியிடவும்.'],
      substitution: 'l = √(7² + 24²), CSA = (22/7) × 7 × l',
      calculations: [
        'l = √(49 + 576) = √625 = 25 செ.மீ',
        'CSA = (22 / 7) × 7 × 25 = 22 × 25 = 550 செ.மீ² (175π செ.மீ²)',
      ],
      finalAnswer: '550 செ.மீ² (π = 22/7 எனில்) · அல்லது 175π செ.மீ²',
      diagramCaption: 'கூம்பு: r = 7 செ.மீ, h = 24 செ.மீ, சாய்வு உயரம் l = 25 செ.மீ (3D அளவு 1:4)',
    },
    q7: {
      title: 'மூடிய உள்ளீடற்ற உருளை செய்யத் தேவையான உலோகத் தகடு',
      question:
        '2.4 மீ உயரமும் 0.7 மீ அடி ஆரமும் கொண்ட மூடிய உள்ளீடற்ற உருளை செய்யத் தேவையான உலோகத் தகட்டின் பரப்பளவைக் காண்க.',
      concept:
        'இரு முனைகளும் மூடப்பட்ட உருளைக்கு வளைபரப்பு (2πrh) மற்றும் இரு வட்ட மூடிகள் (2πr²) சேர்ந்த மொத்தப் புறப்பரப்பளவு (TSA) தேவை.',
      given: 'உயரம் h = 2.4 மீ, ஆரம் r = 0.7 மீ.',
      toFind: 'தேவையான உலோகத் தகட்டின் பரப்பளவு (TSA).',
      formula: 'மூடிய உருளையின் TSA = 2πr(r + h)',
      derivation: ['TSA = 2πrh + 2πr² = 2πr(r + h).'],
      substitution: 'TSA = 2 × (22 / 7) × 0.7 × (0.7 + 2.4)',
      calculations: [
        '0.7 / 7 = 0.1 மற்றும் 0.7 + 2.4 = 3.1 மீ',
        'TSA = 2 × 22 × 0.1 × 3.1 = 4.4 × 3.1 = 13.64 மீ²',
      ],
      finalAnswer: '13.64 மீ² உலோகத் தகடு',
      diagramCaption: 'மூடிய உருளை: r = 0.7 மீ, h = 2.4 மீ, TSA = 13.64 மீ²',
    },
    q8: {
      title: "'d' விட்டம் கொண்ட திண்ம அரைக்கோளத்தின் TSA",
      question: "'d' விட்டம் கொண்ட திண்ம அரைக்கோளத்தின் மொத்தப் புறப்பரப்பளவைக் காண்க.",
      concept: 'திண்ம அரைக்கோளத்தின் TSA = 3πr² மற்றும் ஆரம் r = d / 2.',
      given: 'திண்ம அரைக்கோளத்தின் விட்டம் = d அலகுகள்.',
      toFind: 'd வடிவில் மொத்தப் புறப்பரப்பளவு (TSA).',
      formula: 'r = d / 2 | திண்ம அரைக்கோள TSA = 3πr²',
      derivation: ['TSA = 3πr² இல் r = d / 2 பிரதியிடவும்.'],
      substitution: 'TSA = 3 × π × (d / 2)²',
      calculations: ['TSA = 3π × (d² / 4) = (3/4)πd²'],
      finalAnswer: '(3/4)πd² சதுர அலகுகள்',
      diagramCaption: 'திண்ம அரைக்கோளம்: விட்டம் d, ஆரம் r = d/2 → TSA = ¾πd²',
    },
    q9: {
      title: "'d' விட்டம் கொண்ட அரைவட்டத்தின் பரப்பளவு",
      question: "'d' விட்டம் கொண்ட அரைவட்டத்தின் பரப்பளவைக் காண்க.",
      concept: 'அரைவட்டம் என்பது முழு வட்டத்தின் (πr²) சரியாக பாதிப் பரப்பாகும்; ஆரம் r = d / 2.',
      given: 'அரைவட்டத்தின் விட்டம் = d அலகுகள்.',
      toFind: 'd வடிவில் அரைவட்டத்தின் பரப்பளவு.',
      formula: 'r = d / 2 | அரைவட்டப் பரப்பளவு = ½ πr²',
      derivation: ['பரப்பளவு = ½ πr² இல் r = d / 2 பிரதியிடவும்.'],
      substitution: 'பரப்பளவு = ½ × π × (d / 2)²',
      calculations: ['பரப்பளவு = (1/2) × π × (d² / 4) = (1/8)πd²'],
      finalAnswer: '(1/8)πd² சதுர அலகுகள்',
      diagramCaption: 'அரைவட்டம்: விட்டம் d, ஆரம் r = d/2, பரப்பளவு = (1/8)πd²',
    },
    q10: {
      title: 'அடிப்பரப்பு மற்றும் கன அளவிலிருந்து கூம்பின் உயரம்',
      question:
        'ஒரு கூம்பின் அடிப்பகுதியின் பரப்பளவு 51 செ.மீ² மற்றும் அதன் கன அளவு 85 செ.மீ³ எனில் அதன் செங்குத்து உயரத்தைக் காண்க.',
      concept:
        'கூம்பின் வட்ட அடிப்பரப்பு B = πr² என்பதால் V = ⅓ πr²h = ⅓ × B × h ஆகும்.',
      given: 'அடிப்பரப்பு B = 51 செ.மீ², கன அளவு V = 85 செ.மீ³.',
      toFind: 'செங்குத்து உயரம் (h).',
      formula: 'கூம்பின் கன அளவு V = ⅓ × அடிப்பரப்பு × h',
      derivation: ['h = (3 × V) / B.'],
      substitution: '85 = ⅓ × 51 × h',
      calculations: [
        '51 / 3 = 17 ⇒ 85 = 17 × h',
        'h = 85 / 17 = 5 செ.மீ',
      ],
      finalAnswer: 'செங்குத்து உயரம் h = 5 செ.மீ',
      diagramCaption: 'கூம்பு: அடிப்பரப்பு B = 51 செ.மீ², உயரம் h = 5 செ.மீ, V = 85 செ.மீ³',
    },
  },

  te: {
    q1: {
      title: 'గోళం మరియు రెండు అర్ధగోళాల ఉపరితల వైశాల్య నిష్పత్తి',
      question:
        'ఒక ఘన గోళాన్ని రెండు అర్ధగోళాలుగా కత్తిరించారు. గోళం ఉపరితల వైశాల్యానికి మరియు రెండు అర్ధగోళాల మొత్తం ఉపరితల వైశాల్యానికి మధ్య గల నిష్పత్తి ఎంత?',
      concept:
        'ఘన గోళానికి 4πr² వక్ర ఉపరితల వైశాల్యం ఉంటుంది. దానిని మధ్యలో కత్తిరించినప్పుడు ప్రతి అర్ధగోళానికి సగం వక్ర ఉపరితలం (2πr²) తో పాటు πr² వైశాల్యపు వృత్తాకార భూమి ఏర్పడుతుంది.',
      given: 'గోళం వ్యాసార్థం = r యూనిట్లు. రెండు అర్ధగోళాల వ్యాసార్థం కూడా r.',
      toFind: 'నిష్పత్తి = (గోళం TSA) : (రెండు అర్ధగోళాల మొత్తం TSA).',
      formula: 'గోళం TSA = 4πr² | 1 ఘన అర్ధగోళం TSA = 2πr² + πr² = 3πr²',
      derivation: [
        'ఒక్కో అర్ధగోళం యొక్క TSA = 2πr² + πr² = 3πr².',
        'రెండు అర్ధగోళాల మొత్తం TSA = 3πr² + 3πr² = 6πr².',
      ],
      substitution: 'నిష్పత్తి = (4πr²) : (6πr²)',
      calculations: [
        'నిష్పత్తి = 4πr² / 6πr² = 4 / 6',
        '2 తో భాగించగా = 2 / 3',
      ],
      finalAnswer: '2 : 3',
      diagramCaption: 'గోళం (4πr²) vs రెండు అర్ధగోళాలు (3πr² + 3πr² = 6πr²)',
    },
    q2: {
      title: '2 సెం.మీ ఘనం నుండి చెక్కగల అతిపెద్ద శంఖువు ఘనపరిమాణం',
      question:
        '2 సెం.మీ అంచు గల ఘన ఆకారపు చెక్క నుండి చెక్కగల అతిపెద్ద లంబ వృత్తాకార శంఖువు ఘనపరిమాణాన్ని కనుగొనండి.',
      concept:
        'ఘనంలో పట్టే అతిపెద్ద శంఖువు భూమి వ్యాసం d = a మరియు ఎత్తు h = a అవుతాయి.',
      given: 'ఘనం యొక్క అంచు (a) = 2 సెం.మీ.',
      toFind: 'అతిపెద్ద శంఖువు ఘనపరిమాణం (V).',
      formula: 'శంఖువు ఘనపరిమాణం V = ⅓ π r² h',
      derivation: [
        'భూమి వ్యాసం d = 2 సెం.మీ ⇒ వ్యాసార్థం r = 1 సెం.మీ.',
        'ఎత్తు h = 2 సెం.మీ.',
      ],
      substitution: 'V = ⅓ × π × (1)² × 2',
      calculations: [
        'V = (2/3)π సెం.మీ³',
        'π ≈ 22/7 అయితే V ≈ 44 / 21 ≈ 2.10 సెం.మీ³ (లేదా 2.09 సెం.మీ³)',
      ],
      finalAnswer: '(2π / 3) సెం.మీ³ (సుమారు 2.09 సెం.మీ³)',
      diagramCaption: '2 సెం.మీ ఘనంలో అతిపెద్ద శంఖువు: r = 1 సెం.మీ, h = 2 సెం.మీ',
    },
    q3: {
      title: 'ఘన అర్ధగోళ TSA మరియు వ్యాసార్థ వర్గం నిష్పత్తి',
      question:
        'ఒక ఘన అర్ధగోళం యొక్క మొత్తం ఉపరితల వైశాల్యానికి మరియు దాని వ్యాసార్థపు వర్గానికి గల నిష్పత్తిని కనుగొనండి.',
      concept: 'ఘన అర్ధగోళ TSA వక్ర గుమ్మటం (2πr²) మరియు వృత్త భూమి (πr²) మొత్తం.',
      given: 'ఘన అర్ధగోళం వ్యాసార్థం = r యూనిట్లు.',
      toFind: 'నిష్పత్తి = (ఘన అర్ధగోళం TSA) : r².',
      formula: 'ఘన అర్ధగోళం TSA = 3πr²',
      derivation: ['TSA = 2πr² + πr² = 3πr².'],
      substitution: 'నిష్పత్తి = (3πr²) : r²',
      calculations: ['r² రద్దు చేయగా = 3π : 1'],
      finalAnswer: '3π : 1',
      diagramCaption: 'ఘన అర్ధగోళం: వక్ర గుమ్మటం (2πr²) + భూమి (πr²) = 3πr²',
    },
    q4: {
      title: 'రెండు ఘనాలను కలిపినప్పుడు వచ్చే దీర్ఘఘన TSA',
      question:
        "'a' భుజం గల రెండు ఒకేలాంటి ఘనాలను చివరి నుండి చివరికి కలిపారు. ఏర్పడే దీర్ఘఘనం యొక్క మొత్తం ఉపరితల వైశాల్యాన్ని కనుగొనండి.",
      concept:
        'రెండు ఘనాలను కలిపినప్పుడు పొడవు 2a అవుతుంది మరియు వెడల్పు, ఎత్తు a గానే ఉంటాయి.',
      given: 'ప్రతి ఘనం అంచు = a యూనిట్లు.',
      toFind: 'ఏర్పడే దీర్ఘఘనం యొక్క TSA.',
      formula: 'దీర్ఘఘనం TSA = 2(lb + bh + hl)',
      derivation: ['l = 2a, b = a, h = a.'],
      substitution: 'TSA = 2[ (2a)(a) + (a)(a) + (a)(2a) ]',
      calculations: ['= 2(2a² + a² + 2a²) = 2 × 5a² = 10a²'],
      finalAnswer: '10a² చదరపు యూనిట్లు',
      diagramCaption: 'కలిపిన రెండు ఘనాలు → దీర్ఘఘనం (l = 2a, b = a, h = a)',
    },
    q5: {
      title: 'స్థూప వక్ర ఉపరితల వైశాల్యం నుండి వ్యాసార్థం',
      question:
        '5 సెం.మీ ఎత్తు గల స్థూపం యొక్క వక్ర ఉపరితల వైశాల్యం 94.2 సెం.మీ². దాని వ్యాసార్థాన్ని కనుగొనండి (π = 3.14 తీసుకోండి).',
      concept: 'స్థూపం వక్ర ఉపరితల వైశాల్యం CSA = 2πrh.',
      given: 'CSA = 94.2 సెం.మీ², ఎత్తు h = 5 సెం.మీ, π = 3.14.',
      toFind: 'వ్యాసార్థం (r).',
      formula: 'స్థూపం CSA = 2πrh',
      derivation: ['r = CSA / (2πh).'],
      substitution: '94.2 = 2 × 3.14 × r × 5',
      calculations: ['31.4 × r = 94.2 ⇒ r = 94.2 / 31.4 = 3 సెం.మీ'],
      finalAnswer: 'వ్యాసార్థం r = 3 సెం.మీ',
      diagramCaption: 'స్థూపం: r = 3 సెం.మీ, h = 5 సెం.మీ, CSA = 94.2 సెం.మీ²',
    },
    q6: {
      title: 'శంఖువు వక్ర ఉపరితల వైశాల్యం (h = 24 సెం.మీ, r = 7 సెం.మీ)',
      question:
        '24 సెం.మీ ఎత్తు మరియు 7 సెం.మీ వ్యాసార్థం గల శంఖువు యొక్క వక్ర ఉపరితల వైశాల్యాన్ని కనుగొనండి.',
      concept: 'పైథాగరస్ సిద్ధాంతం ప్రకారం ఏటవాలు ఎత్తు l = √(r² + h²) మరియు CSA = πrl.',
      given: 'వ్యాసార్థం r = 7 సెం.మీ, ఎత్తు h = 24 సెం.మీ.',
      toFind: 'శంఖువు యొక్క CSA.',
      formula: 'l = √(r² + h²) | శంఖువు CSA = πrl',
      derivation: ['ముందుగా l కనుగొని తరువాత CSA = πrl లో ప్రతిక్షేపించండి.'],
      substitution: 'l = √(7² + 24²), CSA = (22/7) × 7 × l',
      calculations: [
        'l = √(49 + 576) = √625 = 25 సెం.మీ',
        'CSA = (22 / 7) × 7 × 25 = 550 సెం.మీ² (175π సెం.మీ²)',
      ],
      finalAnswer: '550 సెం.మీ² (π = 22/7 వద్ద) · లేదా 175π సెం.మీ²',
      diagramCaption: 'శంఖువు: r = 7 సెం.మీ, h = 24 సెం.మీ, l = 25 సెం.మీ (1:4 స్కేల్ 3D)',
    },
    q7: {
      title: 'మూసిన బోలు స్థూపానికి కావలసిన లోహపు రేకు వైశాల్యం',
      question:
        '2.4 మీ ఎత్తు మరియు 0.7 మీ భూ వ్యాసార్థం గల మూసిన బోలు స్థూపాన్ని తయారు చేయడానికి కావలసిన లోహపు రేకు వైశాల్యాన్ని కనుగొనండి.',
      concept:
        'మూసిన స్థూపానికి వక్ర గోడతో పాటు రెండు వృత్తాకార మూతలు ఉంటాయి కాబట్టి TSA = 2πr(r + h) అవసరం.',
      given: 'ఎత్తు h = 2.4 మీ, వ్యాసార్థం r = 0.7 మీ.',
      toFind: 'కావలసిన లోహపు రేకు వైశాల్యం (TSA).',
      formula: 'మూసిన స్థూప TSA = 2πr(r + h)',
      derivation: ['TSA = 2πrh + 2πr² = 2πr(r + h).'],
      substitution: 'TSA = 2 × (22 / 7) × 0.7 × (0.7 + 2.4)',
      calculations: ['= 2 × 22 × 0.1 × 3.1 = 4.4 × 3.1 = 13.64 మీ²'],
      finalAnswer: '13.64 మీ² లోహపు రేకు',
      diagramCaption: 'మూసిన స్థూపం: r = 0.7 మీ, h = 2.4 మీ, TSA = 13.64 మీ²',
    },
    q8: {
      title: "'d' వ్యాసం గల ఘన అర్ధగోళం యొక్క TSA",
      question: "'d' వ్యాసం గల ఘన అర్ధగోళం యొక్క మొత్తం ఉపరితల వైశాల్యాన్ని కనుగొనండి.",
      concept: 'ఘన అర్ధగోళ TSA = 3πr² మరియు వ్యాసార్థం r = d / 2.',
      given: 'వ్యాసం = d యూనిట్లు.',
      toFind: 'd పదాలలో TSA.',
      formula: 'r = d / 2 | TSA = 3πr²',
      derivation: ['TSA = 3πr² లో r = d / 2 ఉంచండి.'],
      substitution: 'TSA = 3 × π × (d / 2)²',
      calculations: ['TSA = 3π × (d² / 4) = (3/4)πd²'],
      finalAnswer: '(3/4)πd² చదరపు యూనిట్లు',
      diagramCaption: 'ఘన అర్ధగోళం: వ్యాసం d, వ్యాసార్థం r = d/2 → TSA = ¾πd²',
    },
    q9: {
      title: "'d' వ్యాసం గల అర్ధవృత్తం యొక్క వైశాల్యం",
      question: "'d' వ్యాసం గల అర్ధవృత్తం యొక్క వైశాల్యాన్ని కనుగొనండి.",
      concept: 'అర్ధవృత్త వైశాల్యం పూర్తి వృత్త వైశాల్యం πr² లో సగం మరియు r = d / 2.',
      given: 'వ్యాసం = d యూనిట్లు.',
      toFind: 'd పదాలలో అర్ధవృత్త వైశాల్యం.',
      formula: 'r = d / 2 | అర్ధవృత్త వైశాల్యం = ½ πr²',
      derivation: ['వైశాల్యం = ½ πr² లో r = d / 2 ప్రతిక్షేపించండి.'],
      substitution: 'వైశాల్యం = ½ × π × (d / 2)²',
      calculations: ['వైశాల్యం = (1/2) × π × (d² / 4) = (1/8)πd²'],
      finalAnswer: '(1/8)πd² చదరపు యూనిట్లు',
      diagramCaption: 'అర్ధవృత్తం: వ్యాసం d, r = d/2, వైశాల్యం = (1/8)πd²',
    },
    q10: {
      title: 'భూ వైశాల్యం మరియు ఘనపరిమాణం నుండి శంఖువు ఎత్తు',
      question:
        'ఒక శంఖువు భూ వైశాల్యం 51 సెం.మీ² మరియు ఘనపరిమాణం 85 సెం.మీ³ అయిన దాని లంబ ఎత్తును కనుగొనండి.',
      concept: 'శంఖువు భూమి B = πr² కాబట్టి V = ⅓ × B × h.',
      given: 'భూ వైశాల్యం B = 51 సెం.మీ², ఘనపరిమాణం V = 85 సెం.మీ³.',
      toFind: 'లంబ ఎత్తు (h).',
      formula: 'V = ⅓ × భూ వైశాల్యం × h',
      derivation: ['h = (3 × V) / B.'],
      substitution: '85 = ⅓ × 51 × h',
      calculations: ['17 × h = 85 ⇒ h = 85 / 17 = 5 సెం.మీ'],
      finalAnswer: 'లంబ ఎత్తు h = 5 సెం.మీ',
      diagramCaption: 'శంఖువు: భూ వైశాల్యం B = 51 సెం.మీ², ఎత్తు h = 5 సెం.మీ, V = 85 సెం.మీ³',
    },
  },

  hi: {
    q1: {
      title: 'गोले और दो अर्धगोलों के पृष्ठीय क्षेत्रफलों का अनुपात',
      question:
        'एक ठोस गोले को दो अर्धगोलों में काटा जाता है। गोले के पृष्ठीय क्षेत्रफल और दोनों अर्धगोलों के कुल पृष्ठीय क्षेत्रफल का अनुपात क्या है?',
      concept:
        'ठोस गोले का पृष्ठीय क्षेत्रफल 4πr² होता है। केंद्र से काटने पर प्रत्येक अर्धगोले में आधी वक्र सतह (2πr²) के साथ πr² क्षेत्रफल का एक नया वृत्ताकार समतल आधार जुड़ जाता है।',
      given: 'माना ठोस गोले की त्रिज्या = r इकाई है। प्रत्येक अर्धगोले की त्रिज्या भी r होगी।',
      toFind: 'अनुपात = (गोले का TSA) : (दोनों अर्धगोलों का संयुक्त TSA)।',
      formula: 'गोले का TSA = 4πr² | 1 ठोस अर्धगोले का TSA = 2πr² + πr² = 3πr²',
      derivation: [
        'प्रत्येक अर्धगोले की वक्र सतह = 2πr², और समतल वृत्ताकार आधार = πr²।',
        '1 ठोस अर्धगोले का TSA = 3πr² ⇒ दोनों अर्धगोलों का कुल TSA = 3πr² + 3πr² = 6πr²।',
      ],
      substitution: 'अभीष्ट अनुपात = (4πr²) : (6πr²)',
      calculations: [
        'अनुपात = 4πr² / 6πr²',
        'उभयनिष्ठ πr² हटाने पर = 4 / 6',
        '2 से भाग देने पर = 2 / 3',
      ],
      finalAnswer: '2 : 3',
      diagramCaption: 'गोला (4πr²) बनाम दो ठोस अर्धगोले (3πr² + 3πr² = 6πr²)',
    },
    q2: {
      title: '2 सेमी घन से काटे गए सबसे बड़े शंकु का आयतन',
      question:
        '2 सेमी किनारे वाले एक ठोस घन से काटे जा सकने वाले सबसे बड़े लंब वृत्तीय शंकु का आयतन ज्ञात कीजिए।',
      concept:
        'घन के अंदर बनने वाले सबसे बड़े शंकु के वृत्ताकार आधार का व्यास घन के किनारे a = 2 सेमी के बराबर और ऊँचाई भी घन के किनारे a = 2 सेमी के बराबर होती है।',
      given: 'ठोस घन का किनारा (a) = 2 सेमी।',
      toFind: 'सबसे बड़े शंकु का आयतन (V)।',
      formula: 'शंकु का आयतन V = ⅓ π r² h',
      derivation: [
        'आधार का व्यास d = 2 सेमी ⇒ त्रिज्या r = 2 / 2 = 1 सेमी।',
        'शंकु की ऊँचाई h = a = 2 सेमी।',
      ],
      substitution: 'V = ⅓ × π × (1)² × 2',
      calculations: [
        'V = (2/3)π सेमी³',
        'π = 22/7 लेने पर V = 44 / 21 ≈ 2.10 सेमी³ (या 2.09 सेमी³)',
      ],
      finalAnswer: '(2π / 3) सेमी³ (लगभग 2.09 सेमी³)',
      diagramCaption: '2 सेमी घन के भीतर सबसे बड़ा शंकु: r = 1 सेमी, h = 2 सेमी',
    },
    q3: {
      title: 'ठोस अर्धगोले के TSA और त्रिज्या के वर्ग का अनुपात',
      question:
        'एक ठोस अर्धगोले के कुल पृष्ठीय क्षेत्रफल और उसकी त्रिज्या के वर्ग का अनुपात ज्ञात कीजिए।',
      concept:
        'ठोस अर्धगोले का कुल पृष्ठीय क्षेत्रफल उसके वक्र भाग (2πr²) और वृत्ताकार आधार (πr²) का योग होता है।',
      given: 'ठोस अर्धगोले की त्रिज्या = r इकाई।',
      toFind: 'अनुपात = (ठोस अर्धगोले का TSA) : r²।',
      formula: 'ठोस अर्धगोले का TSA = 2πr² + πr² = 3πr²',
      derivation: ['TSA = 3πr² को r² से अनुपात रूप में लिखें।'],
      substitution: 'अनुपात = (3πr²) : r²',
      calculations: ['r² काटने पर = 3π : 1 (π=22/7 लेने पर 66 : 7)'],
      finalAnswer: '3π : 1',
      diagramCaption: 'ठोस अर्धगोला: वक्र गुंबद (2πr²) + आधार (πr²) = 3πr²',
    },
    q4: {
      title: 'दो समान घनों को जोड़ने पर बने घनाभ का TSA',
      question:
        "‘a’ भुजा वाले दो समान ठोस घनों को सिरे से सिरा मिलाकर जोड़ा गया है। प्राप्त घनाभ का कुल पृष्ठीय क्षेत्रफल ज्ञात कीजिए।",
      concept:
        'दो घनों को जोड़ने पर बने घनाभ की लंबाई दोगुनी (2a) हो जाती है, जबकि चौड़ाई और ऊँचाई a ही रहती हैं।',
      given: 'प्रत्येक घन की भुजा = a इकाई।',
      toFind: 'प्राप्त घनाभ का कुल पृष्ठीय क्षेत्रफल (TSA)।',
      formula: 'घनाभ का TSA = 2(lb + bh + hl)',
      derivation: [
        'घनाभ की विमाएँ: l = a + a = 2a, b = a, h = a।',
        '(वैकल्पिक जांच: 12a² − 2 जुड़ी हुई सतह a² = 10a²)।',
      ],
      substitution: 'TSA = 2[ (2a)(a) + (a)(a) + (a)(2a) ]',
      calculations: ['= 2(2a² + a² + 2a²) = 2 × 5a² = 10a²'],
      finalAnswer: '10a² वर्ग इकाई',
      diagramCaption: 'दो जुड़े घन (भुजा a) → घनाभ (l = 2a, b = a, h = a)',
    },
    q5: {
      title: 'बेलन के वक्र पृष्ठीय क्षेत्रफल से त्रिज्या ज्ञात करना',
      question:
        '5 सेमी ऊँचाई वाले एक बेलन का वक्र पृष्ठीय क्षेत्रफल 94.2 सेमी² है। इसकी त्रिज्या ज्ञात कीजिए (π = 3.14 लें)।',
      concept:
        'बेलन के वक्र पृष्ठ को खोलने पर 2πr चौड़ाई और h ऊँचाई का आयत बनता है, अतः CSA = 2πrh।',
      given: 'CSA = 94.2 सेमी², ऊँचाई h = 5 सेमी, π = 3.14।',
      toFind: 'बेलन की त्रिज्या (r) सेमी में।',
      formula: 'बेलन का CSA = 2πrh',
      derivation: ['r = CSA / (2πh)।'],
      substitution: '94.2 = 2 × 3.14 × r × 5',
      calculations: [
        '2 × 5 × 3.14 = 31.4',
        '31.4 × r = 94.2 ⇒ r = 94.2 / 31.4 = 3 सेमी',
      ],
      finalAnswer: 'त्रिज्या r = 3 सेमी',
      diagramCaption: 'बेलन: r = 3 सेमी, h = 5 सेमी, CSA = 94.2 सेमी²',
    },
    q6: {
      title: 'शंकु का वक्र पृष्ठीय क्षेत्रफल (h = 24 सेमी, r = 7 सेमी)',
      question:
        '24 सेमी ऊँचाई और 7 सेमी त्रिज्या वाले एक शंकु का वक्र पृष्ठीय क्षेत्रफल ज्ञात कीजिए।',
      concept:
        'शंकु में ऊँचाई h, त्रिज्या r तथा तिर्यक ऊँचाई l पाइथागोरस प्रमेय l² = r² + h² का पालन करते हैं; CSA = πrl।',
      given: 'त्रिज्या r = 7 सेमी, ऊँचाई h = 24 सेमी।',
      toFind: 'शंकु का वक्र पृष्ठीय क्षेत्रफल (CSA)।',
      formula: 'l = √(r² + h²) | शंकु का CSA = πrl',
      derivation: ['पहले पाइथागोरस प्रमेय से l निकालें और फिर CSA = πrl में मान रखें।'],
      substitution: 'l = √(7² + 24²), CSA = (22/7) × 7 × l',
      calculations: [
        'l = √(49 + 576) = √625 = 25 सेमी',
        'CSA = (22 / 7) × 7 × 25 = 22 × 25 = 550 सेमी² (या 175π सेमी²)',
      ],
      finalAnswer: '550 सेमी² (π = 22/7 लेने पर) · या 175π सेमी²',
      diagramCaption: 'शंकु: r = 7 सेमी, h = 24 सेमी, तिर्यक ऊँचाई l = 25 सेमी (1:4 स्केल 3D)',
    },
    q7: {
      title: 'बंद खोखले बेलन के लिए आवश्यक धातु की चादर',
      question:
        '2.4 मीटर ऊँचाई और 0.7 मीटर आधार त्रिज्या वाला एक बंद खोखला बेलन बनाने के लिए आवश्यक धातु की चादर का क्षेत्रफल ज्ञात कीजिए।',
      concept:
        'दोनों सिरों से बंद होने के कारण वक्र पृष्ठ (2πrh) के साथ दोनों वृत्ताकार ढक्कनों (2πr²) का भी क्षेत्रफल जुड़ेगा, अर्थात् कुल पृष्ठीय क्षेत्रफल (TSA)।',
      given: 'ऊँचाई h = 2.4 मीटर, त्रिज्या r = 0.7 मीटर।',
      toFind: 'धातु की चादर का कुल क्षेत्रफल (TSA)।',
      formula: 'बंद बेलन का TSA = 2πr(r + h)',
      derivation: ['TSA = 2πrh + 2πr² = 2πr(r + h)।'],
      substitution: 'TSA = 2 × (22 / 7) × 0.7 × (0.7 + 2.4)',
      calculations: [
        '0.7 / 7 = 0.1 और 0.7 + 2.4 = 3.1 मीटर',
        'TSA = 2 × 22 × 0.1 × 3.1 = 4.4 × 3.1 = 13.64 मीटर²',
      ],
      finalAnswer: '13.64 मीटर² धातु की चादर',
      diagramCaption: 'बंद बेलन: r = 0.7 मी, h = 2.4 मी, TSA = 13.64 मी²',
    },
    q8: {
      title: '‘d’ व्यास वाले ठोस अर्धगोले का कुल पृष्ठीय क्षेत्रफल',
      question: '‘d’ व्यास वाले एक ठोस अर्धगोले का कुल पृष्ठीय क्षेत्रफल ज्ञात कीजिए।',
      concept: 'ठोस अर्धगोले का TSA = 3πr² तथा त्रिज्या r = d / 2 होती है।',
      given: 'ठोस अर्धगोले का व्यास = d इकाई।',
      toFind: 'd के पदों में TSA।',
      formula: 'r = d / 2 | ठोस अर्धगोले का TSA = 3πr²',
      derivation: ['TSA = 3πr² में r = d / 2 प्रतिस्थापित करें।'],
      substitution: 'TSA = 3 × π × (d / 2)²',
      calculations: ['TSA = 3π × (d² / 4) = (3/4)πd²'],
      finalAnswer: '(3/4)πd² वर्ग इकाई',
      diagramCaption: 'ठोस अर्धगोला: व्यास d, त्रिज्या r = d/2 → TSA = ¾πd²',
    },
    q9: {
      title: '‘d’ व्यास वाले अर्धवृत्त का क्षेत्रफल',
      question: '‘d’ व्यास वाले एक अर्धवृत्त का क्षेत्रफल ज्ञात कीजिए।',
      concept: 'अर्धवृत्त पूरे वृत्त (πr²) का ठीक आधा होता है, जहाँ r = d / 2।',
      given: 'अर्धवृत्त का व्यास = d इकाई।',
      toFind: 'd के पदों में अर्धवृत्त का क्षेत्रफल।',
      formula: 'r = d / 2 | अर्धवृत्त का क्षेत्रफल = ½ πr²',
      derivation: ['क्षेत्रफल = ½ πr² में r = d / 2 रखें।'],
      substitution: 'क्षेत्रफल = ½ × π × (d / 2)²',
      calculations: ['क्षेत्रफल = (1/2) × π × (d² / 4) = (1/8)πd²'],
      finalAnswer: '(1/8)πd² वर्ग इकाई',
      diagramCaption: 'अर्धवृत्त: व्यास d, त्रिज्या r = d/2, क्षेत्रफल = (1/8)πd²',
    },
    q10: {
      title: 'आधार क्षेत्रफल और आयतन से शंकु की ऊर्ध्वाधर ऊँचाई',
      question:
        'एक शंकु के आधार का क्षेत्रफल 51 सेमी² है और इसका आयतन 85 सेमी³ है। इसकी ऊर्ध्वाधर ऊँचाई ज्ञात कीजिए।',
      concept: 'शंकु के वृत्ताकार आधार का क्षेत्रफल B = πr² होता है, अतः V = ⅓ × B × h।',
      given: 'आधार क्षेत्रफल B = 51 सेमी², आयतन V = 85 सेमी³।',
      toFind: 'ऊर्ध्वाधर ऊँचाई (h) सेमी में।',
      formula: 'शंकु का आयतन V = ⅓ × आधार क्षेत्रफल × h',
      derivation: ['h = (3 × V) / B।'],
      substitution: '85 = ⅓ × 51 × h',
      calculations: [
        '51 / 3 = 17 ⇒ 85 = 17 × h',
        'h = 85 / 17 = 5 सेमी',
      ],
      finalAnswer: 'ऊर्ध्वाधर ऊँचाई h = 5 सेमी',
      diagramCaption: 'शंकु: आधार क्षेत्रफल B = 51 सेमी², ऊँचाई h = 5 सेमी, V = 85 सेमी³',
    },
  },
})
