import {
  CUBE_NET_CATALOG,
  validateCubeNet,
} from '../utils/mathEngine.js'

export const MISSION_IDS = Object.freeze([
  'cube_net',
  'classroom_painter',
  'water_tank',
  'packaging_optimiser',
])

const CHALLENGE_SPECS = [
  { id: 'round_1', catalogId: 'net_1_4_1_cross' },
  { id: 'round_2', catalogId: 'net_2_3_1_a' },
  { id: 'round_3', catalogId: 'net_1_4_1_zigzag' },
]

/**
 * Dynamically builds each Cube Net Challenge round from the verified 11-net catalog
 * so base and top face numbers match the true 3D folding tree.
 */
export const CUBE_NET_CHALLENGES = Object.freeze(
  CHALLENGE_SPECS.map((spec) => {
    const net =
      CUBE_NET_CATALOG.find((item) => item.id === spec.catalogId) ??
      CUBE_NET_CATALOG[0]
    const validation = validateCubeNet(net.cells, net.rootIndex)
    const topEntry = validation.assignedFaces.find((f) => f.faceId === 'top')
    return Object.freeze({
      id: spec.id,
      netId: net.id,
      cells: net.cells,
      rootIndex: net.rootIndex,
      baseFaceNumber: net.rootIndex + 1,
      topFaceNumber: topEntry ? topEntry.index + 1 : 1,
      assignedFaces: validation.assignedFaces,
    })
  }),
)

/**
 * Calculates mission completion stars (1-3) based on total attempts made.
 */
export function calculateMissionStars(attemptsUsed) {
  if (!Number.isFinite(attemptsUsed) || attemptsUsed <= 1) return 3
  if (attemptsUsed === 2) return 2
  return 1
}

/**
 * Evaluates Mission 1 (Cube Net Challenge): checks whether the selected face number
 * lands opposite the base square (`top`) when folded into a cube.
 */
export function evaluateCubeNetAnswer(challengeIndex, selectedFaceNumber) {
  const challenge =
    CUBE_NET_CHALLENGES[challengeIndex] ?? CUBE_NET_CHALLENGES[0]
  const parsed = Number(selectedFaceNumber)
  const validInput = Number.isInteger(parsed) && parsed >= 1 && parsed <= 6
  return {
    validInput,
    correct: validInput && parsed === challenge.topFaceNumber,
    baseFaceNumber: challenge.baseFaceNumber,
    expectedTopFaceNumber: challenge.topFaceNumber,
    netId: challenge.netId,
  }
}

/**
 * Evaluates Mission 2 (Classroom Painter): 4 walls area = 2h(l + b), excluding floor & ceiling.
 */
export function evaluateClassroomPainterAnswer(
  areaInput,
  { l = 8, b = 6, h = 4 } = {},
) {
  const numeric = Number(areaInput)
  const validInput = Number.isFinite(numeric) && numeric > 0
  const expectedArea = Number((2 * h * (l + b)).toFixed(4))
  const excludedArea = Number((2 * l * b).toFixed(4))
  const totalRoomArea = Number((expectedArea + excludedArea).toFixed(4))
  const diff = validInput ? Math.abs(numeric - expectedArea) : Infinity

  return {
    validInput,
    correct: validInput && diff <= 0.15,
    expectedArea,
    excludedArea,
    totalRoomArea,
    includedFloorOrCeiling: validInput && Math.abs(numeric - totalRoomArea) <= 0.5,
  }
}

/**
 * Evaluates Mission 3 (Mid-Day Meal Water Tank): checks if a student's chosen cylinder (r, h)
 * provides the target water volume (1 m³ = 1000 Litres) within ±2.5% tolerance.
 */
export function evaluateWaterTankDesign(
  radiusInput,
  heightInput,
  targetLitres = 1540,
) {
  const r = Number(radiusInput)
  const h = Number(heightInput)
  const validInput =
    Number.isFinite(r) && Number.isFinite(h) && r > 0.1 && h > 0.1 && r <= 10 && h <= 15

  if (!validInput) {
    return {
      validInput: false,
      correct: false,
      computedM3: 0,
      computedLitres: 0,
      targetLitres,
      relativeError: 1,
      status: 'invalid',
    }
  }

  const computedM3 = Math.PI * r * r * h
  const computedLitres = computedM3 * 1000
  const approx227Litres = (22 / 7) * r * r * h * 1000
  const relErrPi = Math.abs(computedLitres - targetLitres) / targetLitres
  const relErr227 = Math.abs(approx227Litres - targetLitres) / targetLitres
  const relativeError = Math.min(relErrPi, relErr227)

  const correct = relativeError <= 0.025
  let status = 'correct'
  if (!correct) {
    status = computedLitres < targetLitres ? 'too_small' : 'too_large'
  }

  return {
    validInput: true,
    correct,
    computedM3: Number(computedM3.toFixed(4)),
    computedLitres: Number(computedLitres.toFixed(1)),
    targetLitres,
    relativeError: Number(relativeError.toFixed(4)),
    status,
  }
}

/**
 * Evaluates Mission 4 (Packaging Optimiser): checks cuboid dimensions (l, b, h) for fixed volume
 * (default 64 cm³ -> optimal cube 4 × 4 × 4 gives minimal TSA 96 cm²) + reasoning selection.
 */
export function evaluatePackagingOptimiser(
  lInput,
  bInput,
  hInput,
  reasonId,
  targetVolume = 64,
) {
  const l = Number(lInput)
  const b = Number(bInput)
  const h = Number(hInput)
  const validInput =
    Number.isFinite(l) &&
    Number.isFinite(b) &&
    Number.isFinite(h) &&
    l > 0 &&
    b > 0 &&
    h > 0

  if (!validInput) {
    return {
      validInput: false,
      volumeMatches: false,
      isMinimumSurface: false,
      reasonCorrect: false,
      correct: false,
      computedVolume: 0,
      computedTsa: 0,
      minTsa: 0,
    }
  }

  const computedVolume = l * b * h
  const computedTsa = 2 * (l * b + b * h + h * l)
  const idealEdge = Math.cbrt(targetVolume)
  const minTsa = 6 * idealEdge * idealEdge
  const volumeMatches = Math.abs(computedVolume - targetVolume) <= 0.5
  const isMinimumSurface = volumeMatches && computedTsa <= minTsa + 0.5
  const reasonCorrect = reasonId === 'cube_minimises'

  return {
    validInput: true,
    volumeMatches,
    isMinimumSurface,
    reasonCorrect,
    correct: volumeMatches && isMinimumSurface && reasonCorrect,
    computedVolume: Number(computedVolume.toFixed(2)),
    computedTsa: Number(computedTsa.toFixed(2)),
    minTsa: Number(minTsa.toFixed(2)),
  }
}

export const MISSIONS_CONTENT = Object.freeze({
  en: {
    cube_net: {
      title: 'Mission 1: Cube Net Challenge',
      badge: 'Spatial Reasoning · Cube Nets',
      objective:
        'Fold a 6-square net into a closed cube and identify which numbered square forms the Top face opposite the anchored Base.',
      instructions:
        'Inspect the highlighted Base square on the 2D/3D net, use the Fold slider to fold/unfold mentally or visually, pick the numbered face (1–6) that lands on Top, then verify.',
      hints: [
        'Skip one square along a straight 4-in-a-row strip to find opposite faces cleanly.',
        'Trace 90° folds step by step from the Base square: adjacent squares become vertical walls, and two steps across lands on the Top!',
      ],
      successMessage:
        'Great spatial visualization! Your selected square folds directly opposite the Base to seal the top of the cube.',
    },
    classroom_painter: {
      title: 'Mission 2: Classroom Painter',
      badge: 'LSA · Four Walls Calculation',
      objective:
        'Calculate the total area of the 4 classroom walls to be painted, strictly excluding the floor and the ceiling.',
      instructions:
        'Room dimensions are Length l = 8 m, Breadth b = 6 m, and Height h = 4 m. Observe how only the 4 side walls are highlighted in 3D, then enter the painting area in m².',
      hints: [
        'Use Lateral Surface Area (4 walls) = 2h(l + b), NOT Total Surface Area 2(lb + bh + hl).',
        'Substitute l = 8, b = 6, h = 4 into 2 × 4 × (8 + 6) = 8 × 14 m². Floor + ceiling (96 m²) are excluded!',
      ],
      successMessage:
        'Spot-on! Only the four vertical walls (112 m²) are included while the 96 m² floor and ceiling are excluded.',
    },
    water_tank: {
      title: 'Mission 3: Mid-Day Meal Water Tank',
      badge: 'Cylinder Volume Design · 1 m³ = 1000 L',
      objective:
        'Design suitable cylindrical tank dimensions (radius r and height h in metres) to hold 1540 Litres (1.54 m³) of clean school drinking water.',
      instructions:
        'Adjust Radius r (m) and Height h (m) so that V = πr²h ≈ 1.54 m³ (1540 L ± 2.5%), watch the live 3D tank resize, and validate your design.',
      hints: [
        'Recall 1 m³ = 1000 Litres, so 1540 L = 1.54 m³. Solve r² × h ≈ 1.54 / π ≈ 0.49.',
        'Try r = 0.7 m with π ≈ 22/7: (22/7) × 0.7 × 0.7 × h = 1.54 × h, so choosing h = 1.0 m (or r = 0.5 m, h ≈ 1.96 m) hits 1540 L!',
      ],
      successMessage:
        'Mission complete! Your cylindrical water tank holds the required 1540 L cleanly with practical engineering proportions.',
    },
    packaging_optimiser: {
      title: 'Mission 4: Packaging Optimiser',
      badge: 'Surface Area Minimisation · Cardboard Saver',
      objective:
        'Find the cuboid dimensions (l, b, h) of volume 64 cm³ that require the MINIMUM cardboard area (TSA), and explain why.',
      instructions:
        'Test different boxes with l × b × h = 64 cm³, compare their Total Surface Area in 3D, find the minimum-TSA box, select the right mathematical reason, and validate.',
      hints: [
        'Compare boxes of volume 64 cm³: 1×4×16 has TSA = 168 cm²; 2×4×8 has TSA = 112 cm². Can you shrink TSA further?',
        'Among all cuboids of fixed volume 64 cm³, the cube (4 cm × 4 cm × 4 cm) achieves the global minimum TSA = 6 × 4² = 96 cm²!',
      ],
      successMessage:
        'Brilliant optimisation! A 4 × 4 × 4 cm cube cuts cardboard waste to the minimum 96 cm² because equal edges eliminate thin, stretched faces.',
      reasons: {
        cube_minimises:
          'For a fixed volume, making dimensions equal (l = b = h, a cube) minimises Total Surface Area.',
        tall_minimises:
          'Making height very large and base narrow minimises Total Surface Area.',
        volume_equals_tsa:
          'All boxes with the same volume always have the exact same Total Surface Area.',
      },
    },
  },
  kn: {
    cube_net: {
      title: 'ಮಿಷನ್ 1: ಘನ ನೆಟ್ ಸವಾಲು',
      badge: 'ಸ್ಥಳೀಯ ಕಲ್ಪನೆ · ಘನ ನೆಟ್‌ಗಳು',
      objective:
        '6 ಚೌಕಗಳ ನೆಟ್ ಅನ್ನು ಘನವಾಗಿ ಮಡಚಿ, ಆಧಾರ ಚೌಕದ ಎದುರು ಬರುವ ಮೇಲಿನ ಮುಖವನ್ನು ಗುರುತಿಸಿ.',
      instructions:
        'ಗುರುತಿಸಲಾದ ಆಧಾರ ಚೌಕವನ್ನು ಗಮನಿಸಿ, ಮಡಚುವ ಸ್ಲೈಡರ್ ಬಳಸಿ ಪರೀಕ್ಷಿಸಿ, ಮೇಲ್ಭಾಗಕ್ಕೆ ಬರುವ ಮುಖ ಸಂಖ್ಯೆ (1–6) ಆಯ್ಕೆಮಾಡಿ ಪರಿಶೀಲಿಸಿ.',
      hints: [
        'ನೇರ ಸಾಲಿನಲ್ಲಿರುವ 4 ಚೌಕಗಳಲ್ಲಿ ಒಂದು ಚೌಕವನ್ನು ಬಿಟ್ಟು ಮುಂದಿನದು ಎದುರು ಮುಖವಾಗುತ್ತದೆ.',
        'ಆಧಾರ ಚೌಕದಿಂದ 90° ಮಡಚುವಿಕೆಯನ್ನು ಹಂತ ಹಂತವಾಗಿ ಟ್ರೇಸ್ ಮಾಡಿ: ಪಕ್ಕದ ಚೌಕಗಳು ಗೋಡೆಗಳಾಗುತ್ತವೆ, 2ನೇ ಹಂತ ಮೇಲ್ಭಾಗವಾಗುತ್ತದೆ!',
      ],
      successMessage:
        'ಅದ್ಭುತ ದೃಶ್ಯ ಕಲ್ಪನೆ! ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಚೌಕವು ಘನದ ಮೇಲ್ಭಾಗವನ್ನು ಸರಿಯಾಗಿ ಮುಚ್ಚುತ್ತದೆ.',
    },
    classroom_painter: {
      title: 'ಮಿಷನ್ 2: ತರಗತಿ ಕೊಠಡಿ ಬಣ್ಣಗಾರ',
      badge: 'ಪಾರ್ಶ್ವ ವಿಸ್ತೀರ್ಣ (LSA) · 4 ಗೋಡೆಗಳು',
      objective:
        'ನೆಲ ಮತ್ತು ಮೇಲ್ಛಾವಣಿಯನ್ನು ಹೊರತುಪಡಿಸಿ ತರಗತಿ ಕೊಠಡಿಯ 4 ಗೋಡೆಗಳಿಗೆ ಬಣ್ಣ ಬಳಿಯುವ ವಿಸ್ತೀರ್ಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      instructions:
        'ಉದ್ದ l = 8 m, ಅಗಲ b = 6 m, ಎತ್ತರ h = 4 m. 3D ನಲ್ಲಿ ಕೇವಲ 4 ಗೋಡೆಗಳು ಮಾತ್ರ ಹೈಲೈಟ್ ಆಗಿರುವುದನ್ನು ಗಮನಿಸಿ, ಬಣ್ಣ ಬಳಿಯುವ ವಿಸ್ತೀರ್ಣವನ್ನು (m²) ನಮೂದಿಸಿ.',
      hints: [
        'ಪಾರ್ಶ್ವ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಸೂತ್ರ = 2h(l + b) ಬಳಸಿ; ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ 2(lb + bh + hl) ಅಲ್ಲ.',
        '2 × 4 × (8 + 6) = 8 × 14 m² ಲೆಕ್ಕಹಾಕಿ. ನೆಲ ಮತ್ತು ಮೇಲ್ಛಾವಣಿ (96 m²) ಸೇರಿಸಬೇಡಿ!',
      ],
      successMessage:
        'ಸರಿಯಾದ ಉತ್ತರ! 96 m² ನೆಲ ಮತ್ತು ಛಾವಣಿಯನ್ನು ಬಿಟ್ಟು 4 ಗೋಡೆಗಳ ವಿಸ್ತೀರ್ಣ 112 m² ಆಗಿದೆ.',
    },
    water_tank: {
      title: 'ಮಿಷನ್ 3: ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಯೂಟದ ನೀರಿನ ಟ್ಯಾಂಕ್',
      badge: 'ಸಿಲಿಂಡರ್ ಘನಫಲ ವಿನ್ಯಾಸ · 1 m³ = 1000 L',
      objective:
        '1540 ಲೀಟರ್ (1.54 m³) ಶುದ್ಧ ನೀರನ್ನು ಹಿಡಿಯಲು ಸೂಕ್ತ ಸಿಲಿಂಡರ್ ಟ್ಯಾಂಕ್‌ನ ತ್ರಿಜ್ಯ r ಮತ್ತು ಎತ್ತರ h (ಮೀಟರ್‌ನಲ್ಲಿ) ವಿನ್ಯಾಸಗೊಳಿಸಿ.',
      instructions:
        'V = πr²h ≈ 1.54 m³ (1540 L ± 2.5%) ಬರುವಂತೆ r ಮತ್ತು h ಹೊಂದಿಸಿ, 3D ಟ್ಯಾಂಕ್ ಗಮನಿಸಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ.',
      hints: [
        '1 m³ = 1000 ಲೀಟರ್ ⇒ 1540 L = 1.54 m³. ಆದ್ದರಿಂದ r² × h ≈ 1.54 / π ≈ 0.49 ಆಗಿರಬೇಕು.',
        'π ≈ 22/7 ಆದಾಗ r = 0.7 m ಮತ್ತು h = 1.0 m (ಅಥವಾ r = 0.5 m, h ≈ 1.96 m) ತೆಗೆದುಕೊಂಡರೆ ಸರಿಯಾಗಿ 1540 L ಸಿಗುತ್ತದೆ!',
      ],
      successMessage:
        'ಮಿಷನ್ ಪೂರ್ಣಗೊಂಡಿದೆ! ನಿಮ್ಮ ಸಿಲಿಂಡರ್ ಟ್ಯಾಂಕ್ 1540 ಲೀಟರ್ ನೀರನ್ನು ನಿಖರವಾಗಿ ಹಿಡಿಯುತ್ತದೆ.',
    },
    packaging_optimiser: {
      title: 'ಮಿಷನ್ 4: ಪ್ಯಾಕೇಜಿಂಗ್ ಉಳಿತಾಯಗಾರ',
      badge: 'ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಕನಿಷ್ಠೀಕರಣ · ಕಾರ್ಡ್‌ಬೋರ್ಡ್ ಉಳಿತಾಯ',
      objective:
        '64 cm³ ಘನಫಲವಿರುವ ಪೆಟ್ಟಿಗೆಗೆ ಕನಿಷ್ಠ ಕಾರ್ಡ್‌ಬೋರ್ಡ್ (TSA) ಬೇಕಾಗುವ ಆಯಾಮಗಳು (l, b, h) ಮತ್ತು ಕಾರಣವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      instructions:
        'l × b × h = 64 cm³ ಇರುವ ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಹೋಲಿಸಿ, ಕನಿಷ್ಠ TSA ಪೆಟ್ಟಿಗೆಯನ್ನು ಹುಡುಕಿ, ಸರಿಯಾದ ಕಾರಣವನ್ನು ಆರಿಸಿ ಪರಿಶೀಲಿಸಿ.',
      hints: [
        '64 cm³ ಘನಫಲಕ್ಕೆ 1×4×16 → TSA = 168 cm², 2×4×8 → TSA = 112 cm². ಇನ್ನೂ ಕಡಿಮೆ ಮಾಡಬಹುದೇ?',
        'ಸ್ಥಿರ ಘನಫಲಕ್ಕೆ ಘನ (4 × 4 × 4 cm) ಕನಿಷ್ಠ TSA = 6 × 4² = 96 cm² ನೀಡುತ್ತದೆ!',
      ],
      successMessage:
        'ಅದ್ಭುತ! 4 × 4 × 4 cm ಘನವು ಕನಿಷ್ಠ 96 cm² ಕಾರ್ಡ್‌ಬೋರ್ಡ್ ಬಳಸಿ ವ್ಯರ್ಥವನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.',
      reasons: {
        cube_minimises:
          'ಸ್ಥಿರ ಘನಫಲಕ್ಕೆ ಎಲ್ಲಾ ಅಂಚುಗಳು ಸಮನಾಗಿದ್ದರೆ (l = b = h, ಘನ) ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಕನಿಷ್ಠವಾಗುತ್ತದೆ.',
        tall_minimises:
          'ಎತ್ತರವನ್ನು ಬಹಳ ದೊಡ್ಡದಾಗಿ ಮತ್ತು ಪಾದವನ್ನು ಚಿಕ್ಕದಾಗಿ ಮಾಡಿದರೆ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಕನಿಷ್ಠವಾಗುತ್ತದೆ.',
        volume_equals_tsa:
          'ಒಂದೇ ಘನಫಲವಿರುವ ಎಲ್ಲಾ ಪೆಟ್ಟಿಗೆಗಳ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಯಾವಾಗಲೂ ಒಂದೇ ಆಗಿರುತ್ತದೆ.',
      },
    },
  },
  ta: {
    cube_net: {
      title: 'இலக்கு 1: கனசதுர நெட் சவால்',
      badge: 'முப்பரிமாண கற்பனை · கனசதுர நெட்',
      objective:
        '6-சதுர நெட்டை கனசதுரமாக மடித்து, அடிப்பக்கச் சதுரத்திற்கு நேர் எதிரே மேல் முகப்பாக வரும் எண்ணைக் கண்டறியுங்கள்.',
      instructions:
        'அடித்தளமாகக் குறிக்கப்பட்ட சதுரத்தைப் பாருங்கள், மடிப்பு ஸ்லைடரை நகர்த்தி சோதித்து, மேல் முகப்பாக (1–6) வரும் எண்ணைத் தேர்ந்தெடுத்து சரிபாருங்கள்.',
      hints: [
        'நேர்க்கோட்டில் உள்ள 4 சதுரங்களில் ஒரு சதுரத்தை விட்டு அடுத்த சதுரம் எதிர்ப்பக்கமாகும்.',
        'அடித்தளத்திலிருந்து 90° மடிப்புகளைப் பின்தொடருங்கள்: அருகிலுள்ளவை பக்கச் சுவர்கள், 2வது சதுரம் மேல் முகப்பாகும்!',
      ],
      successMessage:
        'சிறப்பு! நீங்கள் தேர்ந்தெடுத்த சதுரம் அடித்தளத்திற்கு எதிரே கனசதுரத்தின் மேல் முகப்பாகிறது.',
    },
    classroom_painter: {
      title: 'இலக்கு 2: வகுப்பறை வண்ணப்பூச்சாளர்',
      badge: 'பக்கப்பரப்பு (LSA) · 4 சுவர்கள்',
      objective:
        'தரை மற்றும் கூரையைத் தவிர்த்து வகுப்பறையின் 4 சுவர்களுக்கு மட்டும் வண்ணம் பூச வேண்டிய பரப்பைக் கணக்கிடுங்கள்.',
      instructions:
        'அறையின் நீளம் l = 8 m, அகலம் b = 6 m, உயரம் h = 4 m. 3D-இல் 4 சுவர்கள் மட்டும் ஒளிர்வதைப் பார்த்து வண்ணப் பரப்பை (m²) உள்ளிடுங்கள்.',
      hints: [
        'பக்கப்பரப்பளவு சூத்திரம் 2h(l + b) பயன்படுத்துங்கள்; மொத்தப் பரப்பு 2(lb + bh + hl) அல்ல.',
        '2 × 4 × (8 + 6) = 8 × 14 m² கணக்கிடுங்கள். தரை + கூரை (96 m²) சேர்க்கக் கூடாது!',
      ],
      successMessage:
        'மிகச் சரி! தரை மற்றும் கூரையை (96 m²) தவிர்த்து 4 சுவர்களின் பரப்பு 112 m² ஆகும்.',
    },
    water_tank: {
      title: 'இலக்கு 3: மதிய உணவுத் திட்ட நீர்த்தொட்டி',
      badge: 'உருளை கன அளவு வடிவமைப்பு · 1 m³ = 1000 L',
      objective:
        '1540 லிட்டர் (1.54 m³) குடிநீர் கொள்ளக்கூடிய உருளைத் தொட்டியின் ஆரம் r மற்றும் உயரம் h (மீட்டரில்) ஆகியவற்றை வடிவமைக்கவும்.',
      instructions:
        'V = πr²h ≈ 1.54 m³ (1540 L ± 2.5%) வருமாறு r மற்றும் h அளவுகளை மாற்றி 3D தொட்டியைச் சரிபாருங்கள்.',
      hints: [
        '1 m³ = 1000 லிட்டர் ⇒ 1540 L = 1.54 m³. எனவே r² × h ≈ 1.54 / π ≈ 0.49 ஆக இருக்க வேண்டும்.',
        'π ≈ 22/7 எனில் r = 0.7 m மற்றும் h = 1.0 m (அல்லது r = 0.5 m, h ≈ 1.96 m) சரியாக 1540 L தரும்!',
      ],
      successMessage:
        'இலக்கு நிறைவடைந்தது! உங்கள் உருளைத் தொட்டி 1540 L நீரைச் சரியாகக் கொள்ளும்.',
    },
    packaging_optimiser: {
      title: 'இலக்கு 4: பெட்டி அளவு சீரமைப்பாளர்',
      badge: 'புறப்பரப்பு குறைப்பு · அட்டை சேமிப்பு',
      objective:
        '64 cm³ கன அளவுள்ள கனசெவ்வகப் பெட்டிக்குக் குறைந்தபட்ச அட்டைப் பரப்பு (TSA) தரும் அளவுகளையும் (l, b, h) காரணத்தையும் கண்டறியுங்கள்.',
      instructions:
        'l × b × h = 64 cm³ உள்ள வெவ்வேறு பெட்டிகளை ஒப்பிட்டு குறைந்தபட்ச TSA அளவைக் கண்டறிந்து சரியான காரணத்தைத் தேர்ந்தெடுங்கள்.',
      hints: [
        '64 cm³ கன அளவுக்கு 1×4×16 → TSA = 168 cm²; 2×4×8 → TSA = 112 cm². இன்னும் குறைக்க முடியுமா?',
        'நிலையான கன அளவுக்குக் கனசதுரம் (4 × 4 × 4 cm) குறைந்தபட்ச TSA = 6 × 4² = 96 cm² தரும்!',
      ],
      successMessage:
        'அருமை! 4 × 4 × 4 cm கனசதுரப் பெட்டி அட்டைச் செலவைக் குறைந்தபட்ச 96 cm² ஆக்குகிறது.',
      reasons: {
        cube_minimises:
          'நிலையான கன அளவுக்கு l = b = h (கனசதுரம்) என சம அளவுகளாக இருந்தால் மொத்தப் புறப்பரப்பு குறைந்தபட்சமாகும்.',
        tall_minimises:
          'உயரத்தை மிகவும் அதிகமாகவும் அடிப்பகுதியைக் குறுகலாகவும் வைத்தால் புறப்பரப்பு குறையும்.',
        volume_equals_tsa:
          'ஒரே கன அளவுள்ள எல்லாப் பெட்டிகளுக்கும் எப்போதும் ஒரே மொத்தப் புறப்பரப்பு இருக்கும்.',
      },
    },
  },
  te: {
    cube_net: {
      title: 'మిషన్ 1: ఘన నెట్ సవాలు',
      badge: '3D దృశ్య అవగాహన · ఘన నెట్‌లు',
      objective:
        '6-చదరాల నెట్‌ను ఘనంగా మడిచి, ఆధార చదరానికి ఎదురుగా పైభాగంలో వచ్చే ముఖ సంఖ్యను గుర్తించండి.',
      instructions:
        'ఆధారంగా గుర్తించిన చదరాన్ని చూడండి, ఫోల్డ్ స్లైడర్‌తో పరీక్షించి, పైభాగానికి వచ్చే ముఖ సంఖ్యను (1–6) ఎంచుకుని నిర్ధారించండి.',
      hints: [
        'వరుసగా ఉన్న 4 చదరాలలో ఒక చదరం విడిచి తర్వాత చదరం ఎదురుగా ఉంటుంది.',
        'ఆధారం నుండి 90° మడతలను గమనించండి: పక్క చదరాలు గోడలవుతాయి, రెండో అడుగు పైభాగమవుతుంది!',
      ],
      successMessage:
        'అద్భుతం! మీరు ఎంచుకున్న ముఖం ఆధారానికి ఎదురుగా ఘనం పైభాగాన్ని మూసివేస్తుంది.',
    },
    classroom_painter: {
      title: 'మిషన్ 2: తరగతి గది పెయింటర్',
      badge: 'పక్కతల వైశాల్యం (LSA) · 4 గోడలు',
      objective:
        'నేల మరియు పైకప్పును మినహాయించి తరగతి గదిలోని 4 గోడలకు పెయింట్ వేయాల్సిన వైశాల్యాన్ని లెక్కించండి.',
      instructions:
        'గది పొడవు l = 8 m, వెడల్పు b = 6 m, ఎత్తు h = 4 m. 3Dలో 4 గోడలు మాత్రమే హైలైట్ కావడం చూసి వైశాల్యాన్ని (m²) నమోదు చేయండి.',
      hints: [
        'పక్కతల వైశాల్య సూత్రం 2h(l + b) వాడండి; మొత్తం వైశాల్యం 2(lb + bh + hl) కాదు.',
        '2 × 4 × (8 + 6) = 8 × 14 m² గణించండి. నేల + పైకప్పు (96 m²) కలపవద్దు!',
      ],
      successMessage:
        'సరియైన సమాధానం! 96 m² నేల మరియు పైకప్పు మినహాయించి 4 గోడల వైశాల్యం 112 m².',
    },
    water_tank: {
      title: 'మిషన్ 3: మధ్యాహ్న భోజన నీటి ట్యాంక్',
      badge: 'స్థూప ఘనపరిమాణ డిజైన్ · 1 m³ = 1000 L',
      objective:
        '1540 లీటర్ల (1.54 m³) తాగునీరు పట్టేలా స్థూపాకార ట్యాంక్ వ్యాసార్థం r మరియు ఎత్తు h (మీటర్లలో) రూపొందించండి.',
      instructions:
        'V = πr²h ≈ 1.54 m³ (1540 L ± 2.5%) వచ్చేలా r మరియు h మార్చి 3D ట్యాంక్‌ను నిర్ధారించండి.',
      hints: [
        '1 m³ = 1000 లీటర్లు ⇒ 1540 L = 1.54 m³. కాబట్టి r² × h ≈ 1.54 / π ≈ 0.49 కావాలి.',
        'π ≈ 22/7 తీసుకుంటే r = 0.7 m, h = 1.0 m (లేదా r = 0.5 m, h ≈ 1.96 m) తో సరిగ్గా 1540 L వస్తుంది!',
      ],
      successMessage:
        'మిషన్ పూర్తయింది! మీ స్థూప ట్యాంక్ 1540 లీటర్ల నీటిని ఖచ్చితంగా నిల్వ చేస్తుంది.',
    },
    packaging_optimiser: {
      title: 'మిషన్ 4: ప్యాకేజింగ్ ఆప్టిమైజర్',
      badge: 'ఉపరితల వైశాల్యం కనిష్టీకరణ · కార్డ్‌బోర్డ్ ఆదా',
      objective:
        '64 cm³ ఘనపరిమాణానికి కనిష్ట కార్డ్‌బోర్డ్ (TSA) అవసరం అయ్యే దీర్ఘఘన కొలతలు (l, b, h) మరియు కారణాన్ని కనుగొనండి.',
      instructions:
        'l × b × h = 64 cm³ ఉన్న పెట్టెలను పోల్చి, కనిష్ట TSA కొలతలు కనుగొని సరైన కారణాన్ని ఎంచుకోండి.',
      hints: [
        '64 cm³ కు 1×4×16 → TSA = 168 cm², 2×4×8 → TSA = 112 cm². ఇంకా తగ్గించవచ్చా?',
        'స్థిర ఘనపరిమాణానికి ఘనం (4 × 4 × 4 cm) కనిష్ట TSA = 6 × 4² = 96 cm² ఇస్తుంది!',
      ],
      successMessage:
        'అద్భుత ఆప్టిమైజేషన్! 4 × 4 × 4 cm ఘనం కనీసం 96 cm² కార్డ్‌బోర్డ్‌తో వృథాను తగ్గిస్తుంది.',
      reasons: {
        cube_minimises:
          'స్థిర ఘనపరిమాణానికి అన్ని అంచులు సమానంగా (l = b = h, ఘనం) ఉన్నప్పుడు మొత్తం ఉపరితల వైశాల్యం కనిష్టమవుతుంది.',
        tall_minimises:
          'ఎత్తు ఎక్కువగా ఉండి భూమి సన్నగా ఉంటే ఉపరితల వైశాల్యం కనిష్టమవుతుంది.',
        volume_equals_tsa:
          'ఒకే ఘనపరిమాణం ఉన్న అన్ని పెట్టెల ఉపరితల వైశాల్యం ఎల్లప్పుడూ సమానంగా ఉంటుంది.',
      },
    },
  },
  hi: {
    cube_net: {
      title: 'मिशन 1: घन नेट चुनौती',
      badge: 'त्रिविमीय कल्पना · घन नेट',
      objective:
        '6-वर्ग वाले नेट को घन में मोड़ें और आधार (Base) वर्ग के ठीक सामने शीर्ष (Top) फलक की पहचान करें।',
      instructions:
        'चिह्नित आधार वर्ग देखें, फोल्ड स्लाइडर से मोड़कर जांचें, शीर्ष पर आने वाला फलक नंबर (1–6) चुनें और सत्यापित करें।',
      hints: [
        'एक सीधी पंक्ति के 4 वर्गों में एक वर्ग छोड़कर अगला वर्ग विपरीत फलक होता है।',
        'आधार वर्ग से 90° मोड़ क्रमशः देखें: सटे हुए वर्ग दीवारें बनते हैं और दूसरा मोड़ शीर्ष बनता है!',
      ],
      successMessage:
        'शानदार! आपका चुना हुआ वर्ग आधार के ठीक विपरीत घन का शीर्ष फलक बनाता है।',
    },
    classroom_painter: {
      title: 'मिशन 2: कक्षा रंगाई अभियंता',
      badge: 'पार्श्व पृष्ठीय क्षेत्रफल (LSA) · 4 दीवारें',
      objective:
        'फर्श और छत को छोड़कर कक्षा की चारों दीवारों की रंगाई का कुल क्षेत्रफल ज्ञात करें।',
      instructions:
        'कमरे की लंबाई l = 8 m, चौड़ाई b = 6 m, ऊँचाई h = 4 m है। 3D में केवल 4 दीवारों का हाइलाइट देखें और क्षेत्रफल (m²) दर्ज करें।',
      hints: [
        'पार्श्व पृष्ठीय क्षेत्रफल सूत्र = 2h(l + b) प्रयोग करें; संपूर्ण पृष्ठ 2(lb + bh + hl) नहीं।',
        '2 × 4 × (8 + 6) = 8 × 14 m² निकालें। फर्श और छत (96 m²) शामिल न करें!',
      ],
      successMessage:
        'बिल्कुल सही! 96 m² फर्श व छत को छोड़कर चारों दीवारों का क्षेत्रफल 112 m² है।',
    },
    water_tank: {
      title: 'मिशन 3: मध्याह्न भोजन जल टैंक',
      badge: 'बेलन आयतन डिज़ाइन · 1 m³ = 1000 L',
      objective:
        '1540 लीटर (1.54 m³) पेयजल रखने के लिए उपयुक्त बेलनाकार टैंक की त्रिज्या r और ऊँचाई h (मीटर में) डिज़ाइन करें।',
      instructions:
        'r और h इस प्रकार चुनें कि V = πr²h ≈ 1.54 m³ (1540 L ± 2.5%) हो, लाइव 3D टैंक देखें और जांचें।',
      hints: [
        '1 m³ = 1000 लीटर ⇒ 1540 L = 1.54 m³। इसलिए r² × h ≈ 1.54 / π ≈ 0.49 होना चाहिए।',
        'π ≈ 22/7 से r = 0.7 m और h = 1.0 m (या r = 0.5 m, h ≈ 1.96 m) लेने पर ठीक 1540 L प्राप्त होता है!',
      ],
      successMessage:
        'मिशन सफल! आपका बेलनाकार टैंक 1540 लीटर जल क्षमता को सटीकता से पूरा करता है।',
    },
    packaging_optimiser: {
      title: 'मिशन 4: पैकेजिंग अनुकूलक',
      badge: 'न्यूनतम पृष्ठीय क्षेत्रफल · कार्डबोर्ड बचत',
      objective:
        '64 cm³ आयतन वाले घनाभ बॉक्स के लिए न्यूनतम कार्डबोर्ड (TSA) देने वाली विमाएँ (l, b, h) और सही कारण खोजें।',
      instructions:
        'l × b × h = 64 cm³ वाले विभिन्न डिब्बों की तुलना करें, न्यूनतम TSA खोजें और सही गणितीय तर्क चुनकर सत्यापित करें।',
      hints: [
        '64 cm³ के लिए 1×4×16 → TSA = 168 cm²; 2×4×8 → TSA = 112 cm²। क्या आप इसे और घटा सकते हैं?',
        'निश्चित आयतन के लिए घन (4 × 4 × 4 cm) न्यूनतम TSA = 6 × 4² = 96 cm² देता है!',
      ],
      successMessage:
        'उत्कृष्ट! 4 × 4 × 4 cm का घन न्यूनतम 96 cm² कार्डबोर्ड में सर्वाधिक बचत करता है।',
      reasons: {
        cube_minimises:
          'निश्चित आयतन के लिए सभी भुजाएँ बराबर (l = b = h, घन) रखने पर संपूर्ण पृष्ठीय क्षेत्रफल न्यूनतम होता है।',
        tall_minimises:
          'ऊँचाई बहुत अधिक और आधार संकरा रखने पर पृष्ठीय क्षेत्रफल न्यूनतम होता है।',
        volume_equals_tsa:
          'समान आयतन वाले सभी डिब्बों का संपूर्ण पृष्ठीय क्षेत्रफल सदैव बराबर होता है।',
      },
    },
  },
})
