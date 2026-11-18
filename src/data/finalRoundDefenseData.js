/**
 * Final Round Presentation Script (5-Minute Time-Boxed Demo) & Complete 16-Section
 * Technical Defense Dossier + 15 Jury Q&As for NetFold 3D (Criterion 5).
 */

export const FIVE_MINUTE_DEMO_SCRIPT = Object.freeze([
  {
    id: 'seg_1',
    timeRange: '0:00–0:30',
    title: 'Welcome Screen, Problem Statement & NetFold AI Guide Agent',
    criterionTag: 'Criterion 2C & 4',
    summary:
      'Open the Glowing Infinity Welcome Screen, switch between Student / Teacher / Exam Prep profiles, and launch the floating NetFold AI Guide Agent & Interactive Website Tour.',
    talkingPoints: [
      'Students struggle to connect flat 2D textbook formulas (CSA, LSA, TSA, Volume) to 3D solids.',
      'First-time visitors can ask the local NetFold AI Guide Agent in natural language (e.g. "I want to learn about cylinders" or "Take a mock test") or run the 8-step interactive spotlight tour.',
      'Supports 5 Indian languages (English, Kannada, Tamil, Telugu, Hindi) with Web Speech voice output and mic input fallback.',
    ],
    targetTab: 'explorer',
    actionType: 'open_welcome_or_guide',
  },
  {
    id: 'seg_2',
    timeRange: '0:30–1:15',
    title: 'Interactive 3D Geometry & Net Folding Engine',
    criterionTag: 'Criterion 1',
    summary:
      'Demonstrate real-time 3D net unfolding across 15 solids, face-by-face area breakdown, and Net Lab (11 cube nets, Net Checker game, and k²/k³ scaling laws).',
    talkingPoints: [
      'Drag the Fold Progress slider (0% flat 2D net → 100% closed 3D solid) on a Cylinder or Cube.',
      'Show how curved/lateral surface area (2πrh) and circular end caps (2πr²) sum visually to Total Surface Area.',
      'All 15 shapes, 10 NCERT Class 10 board problems, and 4 STEM missions are mathematically verified.',
    ],
    targetTab: 'netlab',
    actionType: 'demo_3d',
  },
  {
    id: 'seg_3',
    timeRange: '1:15–2:00',
    title: 'Shape-to-Reality Lab: Real-World Engineering Mensuration',
    criterionTag: 'Criterion 2A',
    summary:
      'Upload a reference object photo or select real-world presets (water tanks, grain silos, packaging boxes, conical tents) to compute capacity, paint/sheet area, and material cost.',
    talkingPoints: [
      'Clearly separates heuristic image-based shape suggestions from user-confirmed physical dimensions (never falsely claims automatic monocular photo measurement).',
      'Updates live 3D geometry, step-by-step engineering formulas, and material cost estimates.',
    ],
    targetTab: 'reality_lab',
    actionType: 'demo_reality',
  },
  {
    id: 'seg_4',
    timeRange: '2:00–2:45',
    title: 'Mistake Detective: Adaptive Error Diagnosis & Remediation',
    criterionTag: 'Criterion 2B',
    summary:
      'Submit a classic student trap answer (confusing diameter d = 6 m with radius r = 6 m) to trigger automatic error classification and a 3-question remediation drill.',
    talkingPoints: [
      'Detects 6 specific error patterns: Radius vs Diameter, CSA vs TSA, Slant Height vs Vertical Height, Wrong Formula, Unit Conversion, and Arithmetic Slips.',
      'Explains why the chosen distractor is wrong, shows the corrected derivation, and logs before/after remediation accuracy.',
    ],
    targetTab: 'mistake_detective',
    actionType: 'demo_mistake',
  },
  {
    id: 'seg_5',
    timeRange: '2:45–3:30',
    title: '179-Question Bank, Exam Arena & Live Challenge Mode',
    criterionTag: 'Criterion 3A, 3B & 3D',
    summary:
      'Solve across the unified 179-question bank (41 source-verified historical PYQs + 138 PYQ-Style Practice), run Timed Mock Tests, or launch a 10/15/20Q Live Challenge against simulated demo peers.',
    talkingPoints: [
      'Removes the old 25-question cap: students solve all 179 questions with Question Palette, MCQ + Numerical input, bookmarks, and Incorrect-Only revision.',
      'Transparently reports 41 single-paper source-verified PYQs (2012–2024 with HTTPS links; 59 gap to 100 honestly disclosed) and 138 clearly labelled PYQ-Style Practice problems.',
      'Includes Live Challenge Mode (10, 15, or 20 questions, countdown timer, Teacher-Created Challenges, and Leaderboard with clearly labelled Simulated Demo Participants).',
    ],
    targetTab: 'exam_arena',
    actionType: 'demo_exam',
  },
  {
    id: 'seg_6',
    timeRange: '3:30–4:15',
    title: 'Progress & Guide: 26 Interactive Charts & 1999–2026 Frequency Analysis',
    criterionTag: 'Criterion 3C',
    summary:
      'Inspect the 3 role-specific Analytics Dashboards (Student 8 charts, Teacher 8 charts, Competitive Exam 10 metrics/charts) and 1999–2026 PYQ Frequency Timeline with CSV & PNG export.',
    talkingPoints: [
      'Every chart is computed dynamically from stored profile attempts or question-bank records—never static placeholder art.',
      'Unindexed historical years in 1999–2026 are explicitly marked Unknown (?) rather than fabricated as zero.',
    ],
    targetTab: 'hub',
    actionType: 'demo_analytics',
  },
  {
    id: 'seg_7',
    timeRange: '4:15–5:00',
    title: 'Teacher Studio, Offline Smart Revision & Conclusion',
    criterionTag: 'Criterion 3E, 3F & 4',
    summary:
      'Show full-screen Classroom Projector Mode, custom Printable Worksheet Generator, Teacher Challenge creator, and the PWA Offline Vault & 7-Day Smart Revision Calendar.',
    talkingPoints: [
      'Teachers can project 3D nets in classroom mode, print worksheets with answer keys, and create custom 10/15/20Q challenges.',
      'Workbox PWA service worker precaches the app for zero-internet reload; saved lessons, formulas, and weak-area revision tasks persist locally on the device.',
    ],
    targetTab: 'teacher_studio',
    actionType: 'demo_teacher',
  },
])

export const PROJECT_DEFENSE_DOSSIER = Object.freeze({
  introduction:
    'NetFold 3D is an offline-capable, multilingual 3D Spatial Geometry & Mensuration Learning Platform built with React 19, Three.js / React Three Fiber, and Workbox PWA. It serves school students (Classes 8–10), mathematics teachers, and competitive exam aspirants (JEE Main/Advanced, KCET, SSC, Banking, Aptitude).',
  problemStatement:
    'In standard classrooms and exam prep platforms, 3D mensuration is taught through static 2D drawings and rote formula memorization. Students routinely confuse curved vs total surface area, radius vs diameter, and slant height vs vertical height, while teachers lack interactive projector tools and aspirants lack visual intuition tied to historical PYQs.',
  proposedSolution:
    'A unified client-side 3D mathematics studio combining continuous 2D-to-3D net folding across 15 solids, real-world object modeling (Shape-to-Reality Lab), automated misconception diagnosis (Mistake Detective), a 179-question solvable Exam Arena (41 source-verified PYQs + 138 practice items) with Live Challenge Mode, 26 interactive SVG analytics charts, an offline revision vault, and a 5-language AI Guide Agent.',
  objectives: [
    'Make every 3D mensuration formula (CSA, LSA, TSA, Volume) visually derivable through interactive net folding and face highlighting.',
    'Diagnose the exact mathematical misconception behind wrong answers and remediate it immediately with targeted 3-question drills.',
    'Provide an honest, source-verified PYQ archive and full-bank exam simulator without fabricating historical citations or user scores.',
    'Ensure inclusive access across 5 Indian languages (English, Kannada, Tamil, Telugu, Hindi) and offline PWA operation on low-connectivity devices.',
  ],
  comparisonRows: [
    {
      aspect: '3D Formula Visualization',
      existing: 'Static 2D textbook diagrams or passive videos.',
      proposed: 'Interactive 0–100% net folding across 15 solids with live face-by-face area breakdown.',
    },
    {
      aspect: 'Wrong Answer Feedback',
      existing: 'Generic Correct / Incorrect badge + static solution.',
      proposed: 'Mistake Detective classifies the exact error (e.g. d vs r, CSA vs TSA) and launches a 3-question repair drill.',
    },
    {
      aspect: 'Competitive PYQ Practice',
      existing: 'Small fixed quizzes or unverified question dumps.',
      proposed: '179 solvable questions (41 source-cited PYQs strictly separated from 138 PYQ-Style Practice) + Live Challenge Mode.',
    },
    {
      aspect: 'Analytics & Frequency',
      existing: 'Basic score percentage or decorative charts.',
      proposed: '26 interactive SVG charts across Student, Teacher & Exam views + honest 1999–2026 coverage timeline + CSV/PNG export.',
    },
    {
      aspect: 'Navigation & Accessibility',
      existing: 'English-only menus; requires constant internet.',
      proposed: '5 Indian languages, voice TTS/STT guide agent, interactive website tour, and Workbox PWA offline vault.',
    },
  ],
  architectureLayers: [
    'Application & Routing Layer: React 19 SPA (App.jsx, Navbar.jsx) managing 3 isolated role profiles (Student, Teacher, Exam), Global Search, and deep-link navigation.',
    '3D Rendering & Net Geometry Layer: Three.js, @react-three/fiber, @react-three/drei (Canvas3D.jsx, netGeometry.js) computing real-time vertex/normal buffers and hinged net rotations.',
    'Mathematical & Diagnostic Engine Layer: mathEngine.js (15 solids), mistakeDetective.js (6 error classifiers), examArenaBank.js (179 unified questions), liveChallengeEngine.js, and guideAgentEngine.js.',
    'Analytics & Export Layer: analyticsEngine.js & AnalyticsCharts.jsx generating 26 interactive SVG graphs with RFC-4180 CSV and HiDPI PNG export.',
    'Offline Persistence & Localization Layer: Workbox PWA service worker, localStorage profile/locker vaults (profileStorage.js, offlineVault.js), and 5-language dictionaries.',
  ],
  techStack: [
    'Frontend Framework: React 19 + Vite 8',
    '3D Graphics Engine: Three.js + @react-three/fiber + @react-three/drei',
    'Styling & UI: Tailwind CSS v4 + custom responsive SVG chart primitives',
    'Offline / PWA: vite-plugin-pwa + Workbox generateSW precaching',
    'Voice & Speech: Web Speech API (speechSynthesis + SpeechRecognition with text fallback)',
    'Testing & QA: Vitest 5 unit/integration suite + ESLint 9 static analysis',
  ],
  mainInnovations: [
    'Continuous 2D-to-3D Net Folding linked to live CSA/LSA/TSA face highlighting.',
    'Shape-to-Reality Lab with explicit separation between heuristic image suggestions and user-confirmed dimensions.',
    'Mistake Detective adaptive error classifier with before/after remediation tracking.',
    'NetFold AI Guide Agent with 8-step interactive DOM spotlight tour and 5-language voice support.',
    'Strict data-honesty architecture across PYQ citations (41 verified vs 138 practice) and 1999–2026 unknown-year coverage markers.',
  ],
  realWorldApplications: [
    'Civil & Municipal Engineering: Cylindrical water tank capacity and inner/outer epoxy coating cost estimation.',
    'Packaging & Logistics: Cuboid corrugated box sheet area (including flap wastage) and container volume optimization.',
    'Agriculture & Disaster Relief: Grain silo (cylinder + cone) storage and conical/frustum relief tent canvas estimation.',
    'Classroom & Exam Coaching: Interactive smartboard projection, printable worksheet generation, and timed PYQ drills.',
  ],
  targetUsers: [
    'Middle & High School Students (Classes 8–10 CBSE/State Boards): Visual net folding, NCERT solved problems, and error coaching.',
    'Mathematics Teachers: Full-screen Projector Mode, lesson plan storage, custom worksheets, and class cohort analytics.',
    'Competitive Exam Aspirants (JEE, KCET, SSC, Banking, CDS/CAT): 179-question bank, speed shortcuts, frequency intelligence, and timed mocks.',
  ],
  accessibilityAndInclusivity: [
    'Full 5-Language UI & Content parity: English, Kannada, Tamil, Telugu, and Hindi.',
    'Voice Accessibility: Text-to-Speech readout and Speech-to-Text voice input (with automatic text fallback when unsupported).',
    'Keyboard & Screen Reader Support: Semantic ARIA roles, focus rings, Escape/Arrow key handlers, and `/` or `Ctrl+K` quick search.',
    'Offline Equity: Full PWA precaching so students in low-connectivity schools can study saved lessons and quizzes offline.',
  ],
  technicalLimitations: [
    'Verified PYQ Count: 41 single-paper source-verified PYQs are currently indexed (59 short of the 100 verified target); the remaining 138 items are explicitly labelled PYQ-Style Practice.',
    'Historical Year Coverage: 9 years (2012, 2014, 2017, 2019–2024) have verified dated PYQs; the other 19 years in 1999–2026 are marked Unknown (?) rather than zero.',
    'Client-Side Storage Only: All progress, lessons, and offline lockers live in browser localStorage on the current device (no cloud backend or multi-device account sync yet).',
    'Image Upload Heuristics: Shape-to-Reality Lab suggests shapes from file metadata/aspect heuristics and requires user confirmation for physical dimensions (no monocular 3D depth camera calibration).',
    'Local AI Guide & Simulated Challenge Peers: The AI Guide uses a deterministic local intent engine (no live cloud LLM), and Live Challenge Mode uses deterministic Simulated Demo Participants rather than WebSocket multiplayer.',
  ],
  futureScope: [
    'Cloud Backend & Multi-Device Sync: Node.js/PostgreSQL or Firebase API to sync student progress and teacher assignments across classroom devices.',
    'Real-Time WebSocket Multiplayer Arena: Live room codes for synchronous classroom quiz battles.',
    'Expand Verified PYQ Archive beyond 100+ items: Index official shift PDFs from 1999–2011 AIEEE/KCET and dated IBPS/SBI memory-based papers.',
    'WebXR / AR Camera Measurement: Integrate WebXR hit-testing on supported mobile devices to measure real objects directly.',
  ],
  genuinelyNewExplanation:
    'Unlike existing tools that isolate 3D viewers (like GeoGebra) from exam question banks (like Testbook) and analytics dashboards, NetFold 3D closes the entire learning loop in one offline-ready client-side engine: a student who misses a PYQ in Exam Arena or Shape-to-Reality Lab is immediately diagnosed by Mistake Detective, shown the exact unfolding 3D net face they miscalculated, given a 3-question repair drill, and tracked in real time across 26 analytics charts in 5 Indian languages.',
})

export const FIFTEEN_JURY_QA = Object.freeze([
  {
    q: '1. How does the 2D-to-3D net folding animation work mathematically in Three.js?',
    a: 'For polyhedra (cubes, cuboids, prisms, pyramids, octahedra), netGeometry.js models the net as a hierarchical kinematic tree of faces connected along shared hinge edges. As foldProgress interpolates from 0% to 100%, each child face rotates around its parent hinge axis from 0 rad to its exact dihedral complement angle. For curved solids (cylinder and cone), we dynamically recompute BufferGeometry vertex positions and unit normals each frame as the rectangular wall or circular sector rolls into a closed surface.',
  },
  {
    q: '2. How did you verify the mathematical accuracy of all 15 shapes and formulas?',
    a: 'Every shape in mathEngine.js has automated unit tests in mathEngine.test.js and stemAccuracyAudit.test.js verifying CSA/LSA, TSA, Volume, slant height, and face-breakdown sums (verifying that the sum of individual net face areas equals TSA to within 1e-6), plus k² area and k³ volume scaling invariants.',
  },
  {
    q: '3. Does Shape-to-Reality Lab automatically measure dimensions from an uploaded photo?',
    a: 'No—and we explicitly disclose that in the UI. A single 2D photo without camera intrinsics or a fiducial scale marker cannot yield exact metric dimensions. Our module provides an unconfirmed shape suggestion from image metadata/aspect ratio and requires the student to confirm the shape and enter or adjust physical dimensions before treating calculations as confirmed.',
  },
  {
    q: '4. How does Mistake Detective know why a student got a question wrong?',
    a: 'Each diagnostic question maps its distractor options to specific mathematical misconception signatures—such as forgetting to halve diameter into radius (yielding 4× area or 8× volume), computing CSA instead of TSA (omitting base caps), or using vertical height h instead of slant height l = √(r² + h²). When a wrong answer is submitted, mistakeDetective.js matches the signature, explains the exact slip, and selects 3 remediation questions targeting that specific error category.',
  },
  {
    q: '5. How many questions in the 179-question bank are genuine historical PYQs?',
    a: 'Exactly 41 questions are single-paper source-verified historical PYQs (spanning 2012, 2014, 2017, and 2019–2024 across JEE Main, AIEEE, JEE Advanced, KCET, SSC CGL/CHSL/CPO, CAT, and UPSC CDS) with paper/shift metadata and HTTPS source links. The remaining 138 questions (113 archive drills + 25 multilingual core items) are strictly labelled PYQ-Style Practice with year: null. We transparently report the 59-question gap to 100 rather than fabricating citations.',
  },
  {
    q: '6. Why do some years between 1999 and 2026 show "?" (Unknown) on the PYQ Frequency Timeline?',
    a: 'Representing unindexed historical years as 0 questions would falsely imply that exams like JEE or SSC asked zero mensuration questions in those years. Our analyticsEngine.js sets count: null and coverageUnknown: true for the 19 unindexed years so the timeline honestly distinguishes "0 questions" from "Not Yet Indexed".',
  },
  {
    q: '7. Is the NetFold AI Guide Agent powered by an external LLM API like OpenAI or Gemini?',
    a: 'No. By default it runs on a 100% local, deterministic intent and progress engine (guideAgentEngine.js) that works offline with zero API latency or API key cost. Every UI badge explicitly states "Local Intent & Progress Engine · No Live Cloud LLM".',
  },
  {
    q: '8. How does the Personalized Learning Path avoid hallucinating student weaknesses?',
    a: 'buildPersonalizedGuideBrief() reads only actual browser-saved profileData (examAttempts, pyqAttempts, mistakeLogs, and completedPathSteps). When a profile has 0 attempts, it explicitly displays an honest empty-history notice and recommends foundational starter steps rather than inventing fake accuracy percentages.',
  },
  {
    q: '9. Is Live Challenge Mode real-time multiplayer over a server?',
    a: 'No. Because NetFold 3D is currently a pure client-side PWA without a backend server, Live Challenge Mode benchmarks the live student against 3 deterministic Simulated Demo Participants (Aarav, Diya, and Rohan) and supports Teacher-Created Challenge presets stored locally. Every screen and leaderboard row explicitly labels them as Simulated Demo Participants.',
  },
  {
    q: '10. How does the application work offline after the network is disconnected?',
    a: 'vite-plugin-pwa and Workbox generate a service worker (sw.js) that precaches the application shell, 3D engine, and question banks. In addition, OfflineRevisionHub.jsx persists user-selected lessons, formulas, solved Class 10 examples, and custom question packs in localStorage so refreshing the page offline retains full functionality.',
  },
  {
    q: '11. How are Student, Teacher, and Competitive Exam profiles kept separate?',
    a: 'profileStorage.js scopes localStorage keys by profile ID (student_demo, teacher_demo, exam_demo). Switching roles in the Navbar loads that role’s isolated attempt history, saved lessons, bookmarks, and analytics without cross-contaminating student and teacher data.',
  },
  {
    q: '12. How did you ensure translation completeness across all 5 Indian languages?',
    a: 'Automated Vitest suites (translations.test.js, platformModules.test.js, pyqAnalytics.test.js, guideAgentEngine.test.js) recursively traverse the English dictionary leaf keys and assert 100% key parity and non-empty strings across Kannada (kn), Tamil (ta), Telugu (te), and Hindi (hi).',
  },
  {
    q: '13. What happens when a browser does not support Web Speech API voice input or TTS?',
    a: 'NetFoldGuideAgent.jsx detects window.SpeechRecognition / webkitSpeechRecognition and window.speechSynthesis at runtime. When unavailable, it displays a clear fallback notice and keeps the full text chat and one-click navigation buttons active.',
  },
  {
    q: '14. How are the 26 Analytics graphs rendered and exported without external chart library bloat?',
    a: 'AnalyticsCharts.jsx renders responsive, accessible SVG charts (Line, Area, Horizontal/Grouped/Stacked Bar, Radar, Donut, Calendar Heatmap, Matrix Heatmap, Histogram, 5-Number Boxplot, Scatter, and Coverage Timeline) directly from React state. chartExport.js serializes SVG nodes to HiDPI PNG via HTML5 Canvas and exports RFC-4180 CSV files with formula-injection sanitization.',
  },
  {
    q: '15. How can this client-side prototype scale to a multi-school production deployment?',
    a: 'Because all state mutations flow through clean storage adapters (profileStorage.js, offlineVault.js, liveChallengeEngine.js), replacing localStorage with a REST/GraphQL backend + WebSocket challenge room service requires swapping only the persistence layer while keeping all 3D, math, diagnostic, and analytics modules unchanged.',
  },
])
