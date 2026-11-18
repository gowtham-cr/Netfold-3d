import { LEARNING_PATH_STEPS, recommendNextPathStep } from '../data/learningPaths.js'
import { getGuideTranslations } from '../data/guideAgentTranslations.js'
import { UNIFIED_BANK_STATS } from './examArenaBank.js'
import { SHAPES } from './mathEngine.js'
import { summarizeMistakesAndImprovement } from './analyticsEngine.js'

export const GUIDE_SPEECH_LANG_MAP = Object.freeze({
  en: 'en-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  hi: 'hi-IN',
})

export const GUIDE_VOICE_OPTIONS = Object.freeze([
  { code: 'en', bcp47: 'en-IN', label: 'English (India)' },
  { code: 'kn', bcp47: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', bcp47: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'te', bcp47: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'hi', bcp47: 'hi-IN', label: 'हिन्दी (Hindi)' },
])

const SHAPE_MATCHERS = [
  {
    shape: SHAPES.HEMISPHERE,
    topic: 'sphere_hemisphere',
    subTab: null,
    regex: /hemisphere|अर्धगोला|ಅರ್ಧಗೋಳ|அரைக்கோளம்|అర్ధగోళం/,
    label: 'Hemisphere',
  },
  {
    shape: SHAPES.SPHERE,
    topic: 'sphere_hemisphere',
    subTab: null,
    regex: /\bsphere\b|spheres|गोला|ಗೋಳ|கோளம்|గోళం/,
    label: 'Sphere',
  },
  {
    shape: SHAPES.CYLINDER,
    topic: 'cylinder',
    subTab: 'cylinder',
    regex: /cylinder|cylinders|hollow cylinder|pipe|बेलन|सिलेंडर|ಸಿಲಿಂಡರ್|உருளை|స్థూపం/,
    label: 'Cylinder',
  },
  {
    shape: SHAPES.FRUSTUM,
    topic: 'cone_frustum',
    subTab: null,
    regex: /frustum|bucket|छिन्नक|ಫ್ರಸ್ಟಮ್|இடைக்கண்டம்|ఫ్రస్టమ్/,
    label: 'Frustum',
  },
  {
    shape: SHAPES.CONE,
    topic: 'cone_frustum',
    subTab: null,
    regex: /\bcone\b|cones|conical|शंकु|ಶಂಕು|கூம்பு|శంకువు/,
    label: 'Cone',
  },
  {
    shape: SHAPES.CUBOID,
    topic: 'cube_cuboid',
    subTab: 'cuboid',
    regex: /cuboid|rectangular box|घनाभ|ಘನಾಭ|கனசெவ்வகம்|దీర్ఘఘనం/,
    label: 'Cuboid',
  },
  {
    shape: SHAPES.CUBE,
    topic: 'cube_cuboid',
    subTab: 'cube',
    regex: /\bcube\b|cubes|घन|ಘನ|கனசதுரம்|ఘనం/,
    label: 'Cube',
  },
  {
    shape: SHAPES.OCTAHEDRON,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /octahedron|अष्टफलक|ಅಷ್ಟಫಲಕ/,
    label: 'Octahedron',
  },
  {
    shape: SHAPES.HEXAGONAL_PRISM,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /hexagonal prism/,
    label: 'Hexagonal Prism',
  },
  {
    shape: SHAPES.PENTAGONAL_PRISM,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /pentagonal prism/,
    label: 'Pentagonal Prism',
  },
  {
    shape: SHAPES.TRIANGULAR_PRISM,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /\bprism\b|prisms|प्रिज़्म|ಪ್ರಿಸಂ|பட்டகம்|ప్రిజం/,
    label: 'Triangular Prism',
  },
  {
    shape: SHAPES.HEXAGONAL_PYRAMID,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /hexagonal pyramid/,
    label: 'Hexagonal Pyramid',
  },
  {
    shape: SHAPES.PENTAGONAL_PYRAMID,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /pentagonal pyramid/,
    label: 'Pentagonal Pyramid',
  },
  {
    shape: SHAPES.TRIANGULAR_PYRAMID,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /tetrahedron|triangular pyramid/,
    label: 'Triangular Pyramid',
  },
  {
    shape: SHAPES.SQUARE_PYRAMID,
    topic: 'prism_pyramid',
    subTab: null,
    regex: /\bpyramid\b|pyramids|पिरामिड|ಪಿರಮಿಡ್|பிரமிடு|పిరమిడ్/,
    label: 'Square Pyramid',
  },
]

const TOPIC_MATCHERS = [
  { topic: 'surface_area', regex: /surface area|tsa|csa|lsa|curved area|पृष्ठीय क्षेत्रफल|ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ|மேற்பரப்பு|ఉపరితల వైశాల్యం/ },
  { topic: 'volume', regex: /volume|capacity|आयतन|ಘನಫಲ|கனஅளவு|ఘనపరిమాణం/ },
  { topic: 'combination_of_solids', regex: /combination|combined solid|mounted|surmounted|संयोजन/ },
  { topic: 'conversion_melting', regex: /melt|recast|wire|conversion|पिघला/ },
  { topic: 'real_life', regex: /real.?life|water tank|paint|cloth|tent|pipe/ },
  { topic: 'cone_frustum', regex: /cone|frustum/ },
  { topic: 'cylinder', regex: /cylinder/ },
  { topic: 'cube_cuboid', regex: /cube|cuboid/ },
  { topic: 'sphere_hemisphere', regex: /sphere|hemisphere/ },
  { topic: 'prism_pyramid', regex: /prism|pyramid/ },
]

const ROLE_MODULE_ORDER = {
  student: [
    'explorer',
    'paths',
    'netlab',
    'practice',
    'mistake_detective',
    'hub',
    'reality_lab',
    'offline_revision',
    'exam_arena',
    'pyq_archive',
    'teacher_studio',
    'worksheet_generator',
  ],
  teacher: [
    'teacher_studio',
    'worksheet_generator',
    'hub',
    'explorer',
    'paths',
    'reality_lab',
    'mistake_detective',
    'practice',
    'netlab',
    'offline_revision',
    'exam_arena',
    'pyq_archive',
  ],
  exam: [
    'exam_arena',
    'pyq_archive',
    'hub',
    'mistake_detective',
    'paths',
    'offline_revision',
    'explorer',
    'reality_lab',
    'practice',
    'netlab',
    'teacher_studio',
    'worksheet_generator',
  ],
}

const MODULE_DEFAULT_ACTIONS = {
  explorer: { type: 'tab', tabId: 'explorer' },
  paths: { type: 'tab', tabId: 'paths' },
  netlab: { type: 'tab', tabId: 'netlab' },
  practice: { type: 'tab', tabId: 'practice' },
  exam_arena: { type: 'arena', authenticity: 'all', mode: 'practice' },
  pyq_archive: { type: 'tab', tabId: 'pyq_archive' },
  teacher_studio: { type: 'tab', tabId: 'teacher_studio' },
  worksheet_generator: { type: 'tab', tabId: 'worksheet_generator' },
  hub: { type: 'hub', sectionId: 'student_analytics' },
  mistake_detective: { type: 'tab', tabId: 'mistake_detective' },
  reality_lab: { type: 'tab', tabId: 'reality_lab' },
  offline_revision: { type: 'tab', tabId: 'offline_revision' },
}

function defaultAnalyticsSectionForRole(role) {
  if (role === 'teacher') return 'teacher_analytics'
  if (role === 'exam') return 'exam_analytics'
  return 'student_analytics'
}

/**
 * Returns role-ordered plain-language directory cards for every module in NetFold 3D.
 */
export function getModuleDirectory(role = 'student', language = 'en') {
  const gt = getGuideTranslations(language)
  const order = ROLE_MODULE_ORDER[role] ?? ROLE_MODULE_ORDER.student
  return order.map((moduleId) => {
    const info = gt.modules[moduleId] ?? { name: moduleId, desc: '' }
    const baseAction = MODULE_DEFAULT_ACTIONS[moduleId] ?? { type: 'tab', tabId: moduleId }
    const action =
      moduleId === 'hub'
        ? { type: 'hub', sectionId: defaultAnalyticsSectionForRole(role) }
        : baseAction
    return {
      id: moduleId,
      name: info.name,
      description: info.desc,
      action,
    }
  })
}

/**
 * Local deterministic intent & navigation classifier (explicitly offline-ready, no external LLM).
 * Parses natural requests and returns actionable cross-module deep-links & honest reasoning.
 */
export function analyzeGuideIntent(rawQuery, context = {}) {
  const query = String(rawQuery ?? '').trim()
  const lower = query.toLowerCase()
  const role = context.role ?? 'student'
  const analytics = context.analytics ?? {}
  const gt = getGuideTranslations(context.language ?? 'en')

  if (!query) {
    return {
      intentId: 'welcome',
      confidence: 1,
      reply: gt.welcomeGreeting,
      explanationReason: gt.localEngineBadge,
      steps: [],
      actions: [
        { label: gt.tourButton, type: 'start_tour' },
        { label: gt.modules.explorer.name, type: 'tab', tabId: 'explorer' },
      ],
    }
  }

  // 1. Interactive Website Tour
  if (
    /tour|walkthrough|show me around|how (do i|to) use (this|the) (site|app|website|platform)|what can i do|प्रवास|ಪ್ರವಾಸ|சுற்றுலா|టూర్|टूर/.test(
      lower,
    )
  ) {
    return {
      intentId: 'website_tour',
      confidence: 0.96,
      reply:
        'I can walk you step-by-step through NetFold 3D—including the Role Switcher, Learning Workspaces, Offline PWA status, Search (/), Language Selector, and Floating AI Guide.',
      explanationReason: 'Matched request for an interactive tour / onboarding walkthrough.',
      steps: [
        'Use Next / Previous inside the spotlight card to inspect each menu.',
        'Click Skip or Finish anytime—and restart the tour from AI Guide whenever needed.',
      ],
      actions: [{ label: gt.tourButton, type: 'start_tour' }],
    }
  }

  // 2. Weak topic / mistake / improvement coaching (prioritized before pure topic match)
  const matchedTopicObj = TOPIC_MATCHERS.find((m) => m.regex.test(lower))
  const matchedShapeObj = SHAPE_MATCHERS.find((m) => m.regex.test(lower))

  if (
    /weak|struggl|mistake|wrong|problem with|improve|help me with|remediat|कमज़ोर|दुर्बल|गलती|ತಪ್ಪು|ಬಲಹೀನ|தவறு|బలహీన/.test(
      lower,
    )
  ) {
    const weakTopic = matchedTopicObj?.topic ?? matchedShapeObj?.topic ?? analytics.weakTopics?.[0] ?? 'surface_area'
    const hasHistory = (analytics.totalAttempts ?? 0) > 0
    const historyNote = hasHistory
      ? `Based on your saved profile (${analytics.totalAttempts} logged attempts, ${analytics.overallAccuracy ?? 0}% accuracy${analytics.weakTopics?.length ? `; weak in ${analytics.weakTopics.join(', ')}` : ''}), start with targeted diagnosis and drill repair.`
      : 'No prior solved attempts are recorded on this browser profile yet, so this plan focuses directly on the area you asked about without inventing past scores.'

    return {
      intentId: 'weak_area_remediation',
      detectedTopic: weakTopic,
      detectedShape: matchedShapeObj?.shape ?? SHAPES.CUBOID,
      confidence: 0.94,
      reply: `Here is your recovery plan for ${weakTopic.replace(/_/g, ' ')}: (1) inspect the unfolding net and TSA/CSA formula visually in 3D Explorer, (2) run Mistake Detective to catch common diameter/radius or unit slips, and (3) solve targeted drills in Exam Arena.`,
      explanationReason: historyNote,
      steps: [
        'Visualize curved vs total faces using the Highlight Mode (LSA/CSA vs TSA) in 3D Explorer.',
        'Take a targeted 3-question diagnostic & repair drill in Mistake Detective.',
        `Practise verified ${weakTopic.replace(/_/g, ' ')} questions in Competitive Exam Arena.`,
      ],
      actions: [
        {
          label: gt.modules.mistake_detective.name,
          type: 'tab',
          tabId: 'mistake_detective',
        },
        {
          label: `${gt.modules.exam_arena.name}: ${weakTopic.replace(/_/g, ' ')}`,
          type: 'arena',
          topic: weakTopic,
          mode: 'practice',
        },
        {
          label: gt.modules.explorer.name,
          type: 'shape',
          shape: matchedShapeObj?.shape ?? SHAPES.CUBOID,
        },
        {
          label: gt.modules.offline_revision.name,
          type: 'tab',
          tabId: 'offline_revision',
        },
      ],
    }
  }

  // 3. Worksheet / Assignment Generation
  if (
    /worksheet|assignment|homework|printable|print paper|question paper|वर्कशीट|ಪತ್ರಿಕೆ|பணித்தாள்|వర్క్‌షీట్/.test(
      lower,
    )
  ) {
    return {
      intentId: 'worksheet_generator',
      roleSuggestion: 'teacher',
      confidence: 0.96,
      reply:
        'Open the Worksheet Generator to choose a mensuration topic, difficulty level, and question count, preview the printable sheet with optional answer keys, or print/export PDF.',
      explanationReason: 'Matched request for creating printable worksheets or assignments.',
      steps: [
        'Pick Topic, Difficulty, and Question Count inside Worksheet Generator.',
        'Toggle Include Answer Key for teachers, then click Print / Export PDF.',
      ],
      actions: [
        { label: gt.modules.worksheet_generator.name, type: 'tab', tabId: 'worksheet_generator' },
        { label: gt.modules.teacher_studio.name, type: 'tab', tabId: 'teacher_studio' },
      ],
    }
  }

  // 4. Classroom 3D Demonstration / Teaching
  if (
    /demonstrat|classroom|class|projector|teach|lesson plan|students|पढ़ा|कक्षा|ತರಗತಿ|வகுப்பு|తరగతి/.test(
      lower,
    )
  ) {
    return {
      intentId: 'classroom_demo',
      roleSuggestion: 'teacher',
      confidence: 0.95,
      reply:
        'Teacher Studio gives you a full-screen Classroom Projector 3D board to fold/unfold any of the 15 shapes live with students, save structured lesson notes, and prepare class materials.',
      explanationReason: 'Matched classroom teaching & live 3D demonstration request.',
      steps: [
        'Open Teacher Studio and pick the shape to demonstrate (e.g. Cylinder, Cone, Cube).',
        'Click Enter Classroom Projector Mode for high-contrast classroom viewing.',
      ],
      actions: [
        { label: gt.modules.teacher_studio.name, type: 'tab', tabId: 'teacher_studio' },
        { label: gt.modules.explorer.name, type: 'tab', tabId: 'explorer' },
        { label: 'Live Presentation Mode', type: 'tab', tabId: 'presentation_mode' },
      ],
    }
  }

  // 5. Timed Mock Test & Live Challenge Mode
  if (
    /mock test|timed test|mock exam|take a mock|practice test|quiz test|live challenge|student vs|leaderboard|मॉक|ಮಾಕ್|மாதிரி|మాక్/.test(
      lower,
    )
  ) {
    return {
      intentId: 'take_mock_test',
      roleSuggestion: 'exam',
      confidence: 0.96,
      reply: `You can launch a Timed Mock Test or a 10/15/20Q Live Challenge (with Teacher-Created Challenges & Leaderboard against Simulated Demo Participants) inside Competitive Exam Arena using the full ${UNIFIED_BANK_STATS.totalQuestions}-question bank.`,
      explanationReason: 'Matched request to configure and take a timed mock test or live challenge.',
      steps: [
        'Optionally filter by Exam (JEE/KCET/SSC/Banking) or Topic before starting.',
        'Choose Timed Mock Test or Live Challenge Mode (10, 15, or 20 questions) to log accuracy into Analytics.',
      ],
      actions: [
        {
          label: `Timed Mock Test (${UNIFIED_BANK_STATS.totalQuestions}Q Pool)`,
          type: 'arena',
          mode: 'mock',
        },
        {
          label: '⚡ Live Challenge Mode (10/15/20Q)',
          type: 'arena',
          mode: 'challenge',
        },
        {
          label: gt.modules.practice.name,
          type: 'tab',
          tabId: 'practice',
        },
      ],
    }
  }

  // 6. PYQ Archive & Frequency Intelligence
  if (
    /pyq|previous year|past year|frequency|archive|jee|kcet|ssc|banking|aieee|cat 20|पिछले वर्ष|ಹಿಂದಿನ|முந்தைய|గత/.test(
      lower,
    )
  ) {
    const wantsFrequency = /frequency|trend|weightage|year.?wise|how often|heatmap/.test(lower)
    return {
      intentId: wantsFrequency ? 'pyq_frequency' : 'find_pyqs',
      roleSuggestion: 'exam',
      confidence: 0.96,
      reply: `NetFold 3D currently indexes ${UNIFIED_BANK_STATS.verifiedPyqCount} source-verified historical PYQs (2012–2024 with single-paper citations & URLs, transparently 59 short of the 100 verified goal) alongside ${UNIFIED_BANK_STATS.practiceStyleCount} separately labelled PYQ-Style Practice problems.`,
      explanationReason: 'Matched Previous Year Questions / Exam frequency request.',
      steps: [
        'Browse PYQ Archive to filter by authentic source-verified papers, exam, year & topic.',
        'Or solve Verified PYQs + PYQ-Style Practice directly in Competitive Exam Arena.',
        'Inspect PYQ Frequency Analysis (1999–2026) inside Progress & Guide Analytics.',
      ],
      actions: [
        {
          label: `${gt.modules.pyq_archive.name} (${UNIFIED_BANK_STATS.verifiedPyqCount} Verified)`,
          type: 'tab',
          tabId: 'pyq_archive',
        },
        {
          label: 'Solve Verified PYQs in Exam Arena',
          type: 'arena',
          authenticity: 'verified_pyq',
          mode: 'practice',
        },
        {
          label: 'PYQ Frequency Charts (1999–2026)',
          type: 'hub',
          sectionId: 'pyq_frequency',
        },
      ],
    }
  }

  // 7. Performance, Progress, Score, Class Analytics
  if (
    /performance|progress|analytics|my score|accuracy|report|dashboard|chart|grade|प्रदर्शन|ಪ್ರಗತಿ|செயல்திறன்|పనితీరు/.test(
      lower,
    )
  ) {
    const targetSection =
      /class analytics|student comparison|teacher analytics|assignment/.test(lower)
        ? 'teacher_analytics'
        : /exam readiness|speed vs accuracy|percentile/.test(lower)
          ? 'exam_analytics'
          : defaultAnalyticsSectionForRole(role)

    const hasAttempts = (analytics.totalAttempts ?? 0) > 0
    return {
      intentId: 'view_performance',
      confidence: 0.95,
      reply: hasAttempts
        ? `Your saved profile shows ${analytics.totalAttempts} recorded question attempts (${analytics.overallAccuracy ?? 0}% overall accuracy) and ${analytics.completedStepsCount ?? 0} completed path milestones. Open Progress & Analytics Centre for interactive charts and CSV/PNG exports.`
        : 'Open Progress & Analytics Centre to view Student, Teacher, and Exam Readiness dashboards. Note: no question attempts are saved on this profile yet, so charts stay empty until you solve your first problem.',
      explanationReason: 'Matched request for performance, progress, or analytics dashboards.',
      steps: [
        'Switch between Student Analytics, Teacher Analytics, Exam Readiness & PYQ Frequency.',
        'Hover any chart point or export charts as PNG/CSV.',
      ],
      actions: [
        { label: gt.modules.hub.name, type: 'hub', sectionId: targetSection },
        { label: 'Assessment Summary & Certificate', type: 'tab', tabId: 'analytics' },
      ],
    }
  }

  // 8. Learn about a specific 3D Shape (e.g. "I want to learn about cylinders")
  if (matchedShapeObj) {
    const actions = [
      {
        label: `${gt.openActionPrefix} ${matchedShapeObj.label} in 3D Explorer`,
        type: 'shape',
        shape: matchedShapeObj.shape,
      },
      {
        label: `Practise ${matchedShapeObj.label} in Exam Arena`,
        type: 'arena',
        topic: matchedShapeObj.topic,
        mode: 'practice',
      },
    ]
    if (matchedShapeObj.subTab) {
      actions.splice(1, 0, {
        label: `${matchedShapeObj.label} Net Explorer (Net Lab)`,
        type: 'tab',
        tabId: 'netlab',
        subTab: matchedShapeObj.subTab,
      })
    }
    return {
      intentId: 'learn_shape',
      detectedShape: matchedShapeObj.shape,
      detectedTopic: matchedShapeObj.topic,
      confidence: 0.95,
      reply: `Great choice! You can rotate ${matchedShapeObj.label} in 3D, drag the Fold/Unfold slider to see how every face forms the curved and total surface area, adjust radius/height dimensions, and then test yourself on ${matchedShapeObj.label} exam problems.`,
      explanationReason: `Matched geometric solid: ${matchedShapeObj.label} (${matchedShapeObj.shape}).`,
      steps: [
        `Open ${matchedShapeObj.label} in 3D Explorer and drag Fold from 100% down to 0%.`,
        'Check CSA/LSA, TSA & Volume formulas updating live inside the Calculation Panel.',
      ],
      actions,
    }
  }

  // 9. Specific Topic without a single solid (e.g. "learn surface area" or "volume")
  if (matchedTopicObj) {
    const targetShape =
      matchedTopicObj.topic === 'surface_area' || matchedTopicObj.topic === 'volume'
        ? SHAPES.CUBOID
        : matchedTopicObj.topic === 'combination_of_solids' || matchedTopicObj.topic === 'conversion_melting'
          ? SHAPES.CYLINDER
          : SHAPES.CONE
    return {
      intentId: 'learn_topic',
      detectedTopic: matchedTopicObj.topic,
      detectedShape: targetShape,
      confidence: 0.88,
      reply: `Here are the best modules to master ${matchedTopicObj.topic.replace(/_/g, ' ')}: compare formulas visually in 3D Explorer, trace solved NCERT board steps, or practise ${matchedTopicObj.topic.replace(/_/g, ' ')} questions in Exam Arena.`,
      explanationReason: `Matched mensuration concept: ${matchedTopicObj.topic}.`,
      steps: [],
      actions: [
        { label: `Practise ${matchedTopicObj.topic.replace(/_/g, ' ')}`, type: 'arena', topic: matchedTopicObj.topic },
        { label: gt.modules.explorer.name, type: 'shape', shape: targetShape },
        { label: gt.modules.practice.name, type: 'tab', tabId: 'practice' },
      ],
    }
  }

  // 10. Net Lab / Folding / Cube Nets / Net Checker
  if (/net lab|cube net|unfold|fold|net checker|enlarge|scaling/.test(lower)) {
    const subTab = /checker|game/.test(lower) ? 'checker' : /cylinder/.test(lower) ? 'cylinder' : /cuboid/.test(lower) ? 'cuboid' : /scale/.test(lower) ? 'scale' : 'cube'
    return {
      intentId: 'net_lab',
      confidence: 0.93,
      reply: 'Net Lab lets you explore all 11 valid cube nets, interact with cuboid/cylinder unfolding, play Net Checker, and test Scale Factor effects on area (k²) and volume (k³).',
      explanationReason: 'Matched geometric net / folding / Net Lab query.',
      steps: [],
      actions: [
        { label: gt.modules.netlab.name, type: 'tab', tabId: 'netlab', subTab },
      ],
    }
  }

  // 11. Class 10 Board Solved Practice
  if (/class 10|ncert|board|written solution|ten question/.test(lower)) {
    return {
      intentId: 'class10_practice',
      confidence: 0.94,
      reply: 'Class 10 NCERT Practice provides step-by-step board-exam written solutions with 2D SVG figures and links to inspect each solid in 3D.',
      explanationReason: 'Matched Class 10 NCERT / board written practice request.',
      steps: [],
      actions: [{ label: gt.modules.practice.name, type: 'tab', tabId: 'practice' }],
    }
  }

  // 12. Offline Learning & Smart Revision Planner
  if (/offline|no internet|revision|planner|calendar|save lessons/.test(lower)) {
    return {
      intentId: 'offline_revision',
      confidence: 0.93,
      reply: 'Offline & Smart Revision saves lessons, formulas, and question sets directly to this device (browser localStorage + PWA cache—no cloud server) and generates a 7-day weak-topic revision calendar.',
      explanationReason: 'Matched offline storage or revision planner query.',
      steps: [],
      actions: [{ label: gt.modules.offline_revision.name, type: 'tab', tabId: 'offline_revision' }],
    }
  }

  // 13. Shape-to-Reality / Real-world objects
  if (/real|reality|tank|photo|upload|object|bottle|box|silo|tent/.test(lower)) {
    return {
      intentId: 'reality_lab',
      confidence: 0.9,
      reply: 'Shape-to-Reality Lab connects real-world objects—or your own uploaded reference image—to live 3D mensuration calculations and real engineering challenges.',
      explanationReason: 'Matched real-world geometry / photo modeling request.',
      steps: [],
      actions: [{ label: gt.modules.reality_lab.name, type: 'tab', tabId: 'reality_lab' }],
    }
  }

  // 14. Learning Paths / Role Recommendation / Next Lesson
  if (/path|next lesson|where should i start|beginner|start learning|plan|roadmap/.test(lower)) {
    const nextStep = context.personalizedBrief?.nextRecommendedStep
    const actions = [
      { label: gt.modules.paths.name, type: 'tab', tabId: 'paths' },
      ...(nextStep
        ? [
            {
              label: `Start: ${nextStep.id}`,
              type: nextStep.targetTab === 'explorer' && nextStep.shape ? 'shape' : 'tab',
              tabId: nextStep.targetTab,
              shape: nextStep.shape,
            },
          ]
        : []),
      { label: gt.tourButton, type: 'start_tour' },
    ]
    return {
      intentId: 'learning_path',
      confidence: 0.9,
      reply: nextStep
        ? `Based on your current ${role} role and saved progress, your next recommended milestone is step "${nextStep.id}" (${context.personalizedBrief?.completedCount ?? 0} of ${context.personalizedBrief?.totalRoleSteps ?? 0} steps done).`
        : 'Open Smart Learning Paths to follow a structured Beginner → Intermediate → Advanced progression tailored to your role.',
      explanationReason:
        context.personalizedBrief?.whyRecommended ?? 'Matched request for learning path / starting guidance.',
      steps: [],
      actions,
    }
  }

  // 15. Switch Role explicitly
  if (/i am a teacher|switch to teacher|teacher mode/.test(lower)) {
    return {
      intentId: 'switch_role_teacher',
      roleSuggestion: 'teacher',
      confidence: 0.92,
      reply: 'Switching workspace mode to Teacher! Explore Teacher Studio (Projector Demo), Worksheet Generator, and Class Analytics.',
      explanationReason: 'Detected explicit Teacher role selection.',
      steps: [],
      actions: [
        { label: gt.modules.teacher_studio.name, type: 'tab', tabId: 'teacher_studio' },
        { label: gt.modules.worksheet_generator.name, type: 'tab', tabId: 'worksheet_generator' },
        { label: 'Class Analytics', type: 'hub', sectionId: 'teacher_analytics' },
      ],
    }
  }
  if (/exam aspirant|jee aspirant|ssc|kcet prep|switch to exam/.test(lower)) {
    return {
      intentId: 'switch_role_exam',
      roleSuggestion: 'exam',
      confidence: 0.92,
      reply: `Switching to Exam Prep mode! Solve all ${UNIFIED_BANK_STATS.totalQuestions} questions in Exam Arena, filter ${UNIFIED_BANK_STATS.verifiedPyqCount} verified PYQs, and inspect 1999–2026 PYQ Frequency Charts.`,
      explanationReason: 'Detected explicit Exam Aspirant role selection.',
      steps: [],
      actions: [
        { label: gt.modules.exam_arena.name, type: 'arena', mode: 'practice' },
        { label: gt.modules.pyq_archive.name, type: 'tab', tabId: 'pyq_archive' },
      ],
    }
  }

  // 16. Fallback helpful guide with role defaults (never pretends or guesses an AI answer)
  const roleModules = getModuleDirectory(role, context.language ?? 'en').slice(0, 3)
  return {
    intentId: 'general_navigation',
    confidence: 0.45,
    reply: `I am NetFold 3D's local navigation guide. I didn't find a specific shape or tool keyword in "${query}", so here are top modules for your ${gt.roles[role] ?? role} workspace—or try asking about cylinders, PYQs, mock tests, worksheets, performance charts, or weak topics.`,
    explanationReason: 'Fallback role-based starting shortcuts (local rule engine — no cloud LLM).',
    steps: [],
    actions: [
      ...roleModules.map((m) => ({ label: m.name, ...m.action })),
      { label: gt.tourButton, type: 'start_tour' },
    ],
  }
}

/**
 * Computes an honest personalized learning plan from REAL saved profile & progress state.
 * Never fabricates past scores, accuracy, or weak areas when the profile has no history.
 */
export function buildPersonalizedGuideBrief({
  role = 'student',
  profileData = null,
  learningProgress = null,
  missionsProgress = null,
  analytics = null,
  offlineLocker = null,
  language = 'en',
} = {}) {
  const gt = getGuideTranslations(language)
  const roleSteps = LEARNING_PATH_STEPS.filter((s) => s.audience === role)
  const completedIds = Array.isArray(profileData?.completedPathSteps)
    ? profileData.completedPathSteps
    : []
  const completedSet = new Set(completedIds)

  const completedSteps = roleSteps.filter((s) => completedSet.has(s.id))
  const incompleteSteps = roleSteps.filter((s) => !completedSet.has(s.id))

  const weakTopics = Array.isArray(analytics?.weakTopics) ? analytics.weakTopics : []
  const rec = recommendNextPathStep(role, completedIds, weakTopics)

  const totalAttempts =
    (profileData?.examAttempts?.length ?? 0) + (profileData?.pyqAttempts?.length ?? 0)
  const mistakeLogs = Array.isArray(profileData?.mistakeLogs) ? profileData.mistakeLogs : []
  const mistakeSummary = summarizeMistakesAndImprovement(profileData)

  const repeatedCategories = (mistakeSummary?.repeated ?? []).map((r) => r.category)
  const accuracyPct =
    totalAttempts > 0 && Number.isFinite(analytics?.overallAccuracy)
      ? analytics.overallAccuracy
      : null

  const offlineSavedCount =
    (offlineLocker?.lessons?.length ?? 0) +
    (offlineLocker?.formulas?.length ?? 0) +
    (offlineLocker?.examples?.length ?? 0) +
    (offlineLocker?.questionSets?.length ?? 0)

  const solvedClass10Count = Array.isArray(learningProgress?.visitedQuestions)
    ? learningProgress.visitedQuestions.length
    : 0

  const completedMissionsCount = missionsProgress
    ? Object.values(missionsProgress).filter((m) => m?.completed).length
    : 0

  const hasRealHistory =
    totalAttempts > 0 ||
    completedSteps.length > 0 ||
    mistakeLogs.length > 0 ||
    solvedClass10Count > 0 ||
    completedMissionsCount > 0

  let whyRecommended = gt.noDataNotice
  if (rec.reasonKey === 'reasonWeakTopic' && weakTopics.length > 0) {
    whyRecommended = `Recommended because your saved quiz/PYQ attempts show lower accuracy in ${weakTopics[0].replace(/_/g, ' ')}.`
  } else if (rec.reasonKey === 'reasonAllDone') {
    whyRecommended = `All ${roleSteps.length} path milestones for ${gt.roles[role]} are completed! Suggested next: Timed Mock / Mistake Review.`
  } else if (incompleteSteps.length > 0) {
    whyRecommended = `Next uncompleted step (${completedSteps.length}/${roleSteps.length} completed) in your ${gt.roles[role]} Learning Path.`
  }

  // Build clickable recommendations grounded in real data + role
  const recommendations = []

  if (rec.step) {
    recommendations.push({
      id: `path_${rec.step.id}`,
      label: rec.step.targetTab === 'explorer' && rec.step.shape
        ? `${gt.openActionPrefix} ${rec.step.shape} (3D Path Step)`
        : `${gt.openActionPrefix} Path Step: ${rec.step.id}`,
      reason: whyRecommended,
      action:
        rec.step.targetTab === 'explorer' && rec.step.shape
          ? { type: 'shape', shape: rec.step.shape }
          : { type: 'tab', tabId: rec.step.targetTab },
    })
  }

  if (weakTopics.length > 0 || mistakeLogs.length > 0) {
    const focusTopic = weakTopics[0] ?? 'surface_area'
    recommendations.push({
      id: 'weak_drill',
      label: `${gt.modules.mistake_detective.name} + ${focusTopic.replace(/_/g, ' ')} PYQs`,
      reason:
        weakTopics.length > 0
          ? `Detected weak topic from your history: ${weakTopics.join(', ')}.`
          : `You have ${mistakeLogs.length} logged mistake(s) ready for targeted 3-question remediation.`,
      action: { type: 'tab', tabId: 'mistake_detective' },
    })
  } else if (role === 'exam') {
    recommendations.push({
      id: 'exam_pyqs',
      label: `${gt.modules.exam_arena.name} (${UNIFIED_BANK_STATS.verifiedPyqCount} Verified PYQs)`,
      reason: 'Recommended for Exam Prep: solve source-verified PYQs or start a Timed Mock Test.',
      action: { type: 'arena', authenticity: 'verified_pyq', mode: 'practice' },
    })
  } else if (role === 'teacher') {
    recommendations.push({
      id: 'teacher_ws',
      label: gt.modules.worksheet_generator.name,
      reason: 'Prepare printable worksheets with answer keys or present 3D solids live in Teacher Studio.',
      action: { type: 'tab', tabId: 'worksheet_generator' },
    })
  } else {
    recommendations.push({
      id: 'student_diag',
      label: gt.modules.practice.name,
      reason: 'Start with Class 10 solved written examples to build baseline progress metrics.',
      action: { type: 'tab', tabId: 'practice' },
    })
  }

  return {
    role,
    hasRealHistory,
    totalAttempts,
    accuracyPct,
    weakTopics,
    repeatedCategories,
    mistakeCount: mistakeLogs.length,
    offlineSavedCount,
    solvedClass10Count,
    completedMissionsCount,
    completedSteps,
    incompleteSteps,
    completedCount: completedSteps.length,
    totalRoleSteps: roleSteps.length,
    nextRecommendedStep: rec.step,
    reasonKey: rec.reasonKey,
    whyRecommended,
    recommendations,
  }
}
