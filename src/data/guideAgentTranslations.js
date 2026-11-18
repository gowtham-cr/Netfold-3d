/**
 * 5-language dictionary (English, Kannada, Tamil, Telugu, Hindi) for
 * NetFold AI Guide Agent & Interactive Website Tour.
 */
export const GUIDE_AGENT_TRANSLATIONS = Object.freeze({
  en: {
    fabLabel: 'AI Guide',
    fabTooltip: 'Open NetFold AI Guide Agent & Tour',
    panelTitle: 'NetFold AI Guide Agent',
    panelSubtitle: 'Smart navigation, personalized path & website walkthrough',
    localEngineBadge: 'Local Intent & Progress Engine · No Live Cloud LLM',
    closeLabel: 'Close Guide',
    tourButton: 'Website Tour',
    resetButton: 'Reset',
    rolePrompt: 'Select your role:',
    goalPrompt: 'What would you like to accomplish today?',
    welcomeGreeting:
      'Welcome to NetFold 3D! Tell me what you want to learn, teach, or practise—or start the interactive tour.',
    roles: {
      student: 'Student',
      teacher: 'Teacher',
      exam: 'Exam Aspirant',
    },
    roleDescriptions: {
      student: '3D shapes, cube nets, Class 10 solved lessons, mistakes & progress',
      teacher: 'Classroom 3D demonstrations, custom worksheets & class analytics',
      exam: '179 Exam Arena problems, 41 verified PYQs, mock tests & frequency charts',
    },
    tabs: {
      chat: 'Guide Chat',
      plan: 'My Plan',
      modules: 'All Modules',
    },
    voice: {
      voiceLangLabel: 'Voice Language',
      speakButton: 'Read Aloud',
      stopSpeakingButton: 'Stop Voice',
      micStartButton: 'Voice Input',
      micStopButton: 'Stop Mic',
      listeningLabel: 'Listening… speak now',
      speechUnavailable: 'Text-to-speech is not supported in this browser.',
      micUnsupportedFallback:
        'Voice microphone input is unavailable in this browser — type your question below instead.',
    },
    inputPlaceholder: 'Ask e.g. "I want to learn about cylinders" or "Take a mock test"...',
    sendButton: 'Guide Me',
    suggestedLabel: 'Try asking:',
    whyRecommendedLabel: 'Why this is recommended',
    progressFactsTitle: 'Your Real Saved Progress (This Browser)',
    noDataNotice:
      'No solved attempts or mistakes recorded yet on this profile. Start a lesson or practice quiz below — nothing is fabricated.',
    completedStepsLabel: 'Completed Lessons / Path Steps',
    incompleteStepsLabel: 'Remaining Recommended Steps',
    nextBestStepLabel: 'Next Best Activity',
    weakAreasLabel: 'Detected Weak Areas (From Your History)',
    weakAreasNone: 'No weak areas flagged yet from saved attempts.',
    openActionPrefix: 'Open',
    suggestedQueries: {
      student: [
        'I want to learn about cylinders',
        'I am weak in surface area. What should I do?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      teacher: [
        'How can I demonstrate 3D shapes to my class?',
        'How do I generate a worksheet?',
        'Where can I see class analytics?',
        'Start website tour',
      ],
      exam: [
        'Where can I find the PYQs?',
        'I want to take a mock test',
        'Where can I see PYQ frequency charts?',
        'I am weak in cone & frustum. Help me',
      ],
    },
    modules: {
      explorer: {
        name: '3D Shape Explorer',
        desc: 'Interact with all 15 3D shapes, drag fold sliders from flat net to 3D, and compute CSA/LSA, TSA & Volume.',
      },
      paths: {
        name: 'Smart Learning Paths',
        desc: 'Step-by-step Beginner, Intermediate & Advanced roadmaps tailored to Students, Teachers & Exam Prep.',
      },
      netlab: {
        name: 'Net Lab (Nets & Checker)',
        desc: 'Browse all 11 cube nets, fold cuboids/cylinders, play the Net Checker game & test edge scaling laws.',
      },
      practice: {
        name: 'Class 10 NCERT Practice',
        desc: 'Read 10 board-exam-style written solutions with 2D SVG diagrams and 3D shape inspection links.',
      },
      exam_arena: {
        name: 'Competitive Exam Arena (179Q)',
        desc: 'Solve 179 mensuration questions (41 verified PYQs + 138 practice), Timed Mocks, Question Palette & shortcuts.',
      },
      pyq_archive: {
        name: 'PYQ Archive & Frequency (1999–2026)',
        desc: 'Filter 41 source-verified historical PYQs by year, shift, exam & topic plus honest 1999–2026 frequency trends.',
      },
      teacher_studio: {
        name: 'Teacher Studio & Projector Mode',
        desc: 'Demonstrate 3D solids live in full-screen classroom mode, author lessons & save teaching notes.',
      },
      worksheet_generator: {
        name: 'Worksheet & Assignment Generator',
        desc: 'Select topics, difficulty & question counts to print custom worksheets with optional answer keys.',
      },
      hub: {
        name: 'Progress & Analytics Centre',
        desc: 'Interactive Student, Teacher & Competitive Exam analytics dashboards, histograms, heatmaps & bookmarks.',
      },
      mistake_detective: {
        name: 'Mistake Detective Coach',
        desc: 'Diagnoses formula slips (diameter vs radius, CSA vs TSA, unit traps) and builds targeted 3-question drills.',
      },
      reality_lab: {
        name: 'Shape-to-Reality Lab',
        desc: 'Match real objects (water tanks, pipes, boxes, silos) or upload photos to live 3D mensuration models.',
      },
      offline_revision: {
        name: 'Offline Vault & Smart Revision',
        desc: 'Save lessons, formulas & question packs locally to study offline with a 7-day weak-area revision calendar.',
      },
    },
    tour: {
      badge: 'Interactive Tour',
      stepOf: 'Step {current} of {total}',
      prevButton: 'Previous',
      nextButton: 'Next',
      finishButton: 'Finish Tour',
      skipButton: 'Skip Tour',
      restartButton: 'Restart Tour',
      targetHiddenNote: 'Control is inside the responsive menu on small screens.',
      steps: [
        {
          target: 'brand',
          title: 'Welcome to NetFold 3D',
          body: 'An offline-ready 3D geometry & mensuration learning platform built with interactive 3D solids, Class 10 solved boards, Teacher tools, and 179 exam drills.',
        },
        {
          target: 'audience',
          title: 'Switch Roles Any Time',
          body: 'Choose Student, Teacher, or Exam Prep. Each role keeps its own separate local progress and reorders navigation tabs for what you need fastest.',
        },
        {
          target: 'nav_tabs',
          title: 'All Workspaces & Learning Modules',
          body: 'Jump between 3D Shapes, Learning Paths, Net Lab, Class 10 Practice, Exam Arena (179 questions), PYQ Archive, Teacher Studio, Worksheets, Mistake Detective & Analytics.',
        },
        {
          target: 'welcome_btn',
          title: 'Reopen Welcome & Starter Agent',
          body: 'Click ∞ Welcome anytime to pick a role or goal or relaunch the guided onboarding experience.',
        },
        {
          target: 'offline_btn',
          title: 'Local PWA Storage & Offline Mode',
          body: 'Checks online/offline status and opens Offline & Smart Revision where you can save formulas, notes & quizzes for zero-internet study.',
        },
        {
          target: 'search_btn',
          title: 'Instant Global Search (/ or Ctrl+K)',
          body: 'Search across all 15 3D shapes, net puzzles, Class 10 solved boards, formulas & PYQs immediately from any screen.',
        },
        {
          target: 'lang_btn',
          title: '5 Languages + Voice Support',
          body: 'Switch the whole platform—including AI Guide voice output—between English, Kannada, Tamil, Telugu, and Hindi.',
        },
        {
          target: 'guide_fab',
          title: 'Your Persistent AI Guide Agent',
          body: 'Open AI Guide anytime from the bottom-right button to ask questions, check your real learning plan, or restart this website tour.',
        },
      ],
    },
  },

  kn: {
    fabLabel: 'AI ಮಾರ್ಗದರ್ಶಿ',
    fabTooltip: 'NetFold AI ಮಾರ್ಗದರ್ಶಿ ಏಜೆಂಟ್ ಮತ್ತು ವೆಬ್‌ಸೈಟ್ ಪ್ರವಾಸ ತೆರೆಯಿರಿ',
    panelTitle: 'NetFold AI ಮಾರ್ಗದರ್ಶಿ ಏಜೆಂಟ್',
    panelSubtitle: 'ಸ್ಮಾರ್ಟ್ ನ್ಯಾವಿಗೇಷನ್, ವೈಯಕ್ತಿಕ ಕಲಿಕಾ ಮಾರ್ಗ ಮತ್ತು ಮಾರ್ಗದರ್ಶಿ ಪ್ರವಾಸ',
    localEngineBadge: 'ಸ್ಥಳೀಯ ಇಂಟೆಂಟ್ ಮತ್ತು ಪ್ರಗತಿ ಎಂಜಿನ್ · ಲೈವ್ ಕ್ಲೌಡ್ LLM ಇಲ್ಲ',
    closeLabel: 'ಮಾರ್ಗದರ್ಶಿ ಮುಚ್ಚಿ',
    tourButton: 'ವೆಬ್‌ಸೈಟ್ ಪ್ರವಾಸ',
    resetButton: 'ಮರುಹೊಂದಿಸಿ',
    rolePrompt: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
    goalPrompt: 'ಇಂದು ನೀವು ಏನನ್ನು ಸಾಧಿಸಲು ಬಯಸುತ್ತೀರಿ?',
    welcomeGreeting:
      'NetFold 3D ಗೆ ಸ್ವಾಗತ! ನೀವು ಏನು ಕಲಿಯಲು, ಬೋಧಿಸಲು ಅಥವಾ ಅಭ್ಯಾಸ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಹೇಳಿ — ಅಥವಾ ಸಂವಾದಾತ್ಮಕ ಪ್ರವಾಸ ಪ್ರಾರಂಭಿಸಿ.',
    roles: {
      student: 'ವಿದ್ಯಾರ್ಥಿ',
      teacher: 'ಶಿಕ್ಷಕ',
      exam: 'ಪರೀಕ್ಷಾ ಆಕಾಂಕ್ಷಿ',
    },
    roleDescriptions: {
      student: '3D ಆಕಾರಗಳು, ನೆಟ್‌ಗಳು, 10ನೇ ತರಗತಿ ಪಾಠಗಳು, ತಪ್ಪುಗಳ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪ್ರಗತಿ',
      teacher: 'ತರಗತಿ 3D ಪ್ರದರ್ಶನ, ಕಸ್ಟಮ್ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು ಮತ್ತು ತರಗತಿ ವಿಶ್ಲೇಷಣೆ',
      exam: '179 ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆಗಳು, 41 ದೃಢೀಕೃತ PYQ ಗಳು, ಮಾಕ್ ಟೆಸ್ಟ್‌ಗಳು ಮತ್ತು ಆವರ್ತನ ಚಾರ್ಟ್‌ಗಳು',
    },
    tabs: {
      chat: 'ಮಾರ್ಗದರ್ಶಿ ಚಾಟ್',
      plan: 'ನನ್ನ ಯೋಜನೆ',
      modules: 'ಎಲ್ಲಾ ಮಾಡ್ಯೂಲ್‌ಗಳು',
    },
    voice: {
      voiceLangLabel: 'ಧ್ವನಿ ಭಾಷೆ',
      speakButton: 'ಓದಿ ಹೇಳಿ',
      stopSpeakingButton: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      micStartButton: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್',
      micStopButton: 'ಮೈಕ್ ನಿಲ್ಲಿಸಿ',
      listeningLabel: 'ಕೇಳುತ್ತಿದೆ… ಈಗ ಮಾತನಾಡಿ',
      speechUnavailable: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಪಠ್ಯ-ಓದುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.',
      micUnsupportedFallback:
        'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ — ದಯವಿಟ್ಟು ಕೆಳಗೆ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ.',
    },
    inputPlaceholder: 'ಉದಾ: "ಸಿಲಿಂಡರ್ ಬಗ್ಗೆ ಕಲಿಯಬೇಕು" ಅಥವಾ "ಮಾಕ್ ಟೆಸ್ಟ್ ತೆಗೆದುಕೊಳ್ಳಬೇಕು"...',
    sendButton: 'ಮಾರ್ಗದರ್ಶನ ನೀಡಿ',
    suggestedLabel: 'ಈ ಪ್ರಶ್ನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ:',
    whyRecommendedLabel: 'ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
    progressFactsTitle: 'ನಿಮ್ಮ ನೈಜ ಉಳಿಸಿದ ಪ್ರಗತಿ (ಈ ಬ್ರೌಸರ್)',
    noDataNotice:
      'ಈ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಯತ್ನಗಳು ದಾಖಲಾಗಿಲ್ಲ. ಕೆಳಗಿನ ಪಾಠದಿಂದ ಪ್ರಾರಂಭಿಸಿ — ಯಾವುದೇ ನಕಲಿ ಡೇಟಾ ಇಲ್ಲ.',
    completedStepsLabel: 'ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳು / ಹಂತಗಳು',
    incompleteStepsLabel: 'ಬಾಕಿ ಇರುವ ಶಿಫಾರಸು ಹಂತಗಳು',
    nextBestStepLabel: 'ಮುಂದಿನ ಉತ್ತಮ ಚಟುವಟಿಕೆ',
    weakAreasLabel: 'ದುರ್ಬಲ ವಿಷಯಗಳು (ನಿಮ್ಮ ಇತಿಹಾಸದಿಂದ)',
    weakAreasNone: 'ಉಳಿಸಿದ ಪ್ರಯತ್ನಗಳಿಂದ ಇನ್ನೂ ಯಾವುದೇ ದುರ್ಬಲ ವಿಷಯ ಕಂಡುಬಂದಿಲ್ಲ.',
    openActionPrefix: 'ತೆರೆಯಿರಿ',
    suggestedQueries: {
      student: [
        'I want to learn about cylinders',
        'I am weak in surface area. What should I do?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      teacher: [
        'How can I demonstrate 3D shapes to my class?',
        'How do I generate a worksheet?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      exam: [
        'Where can I find the PYQs?',
        'I want to take a mock test',
        'Where can I see my performance?',
        'I am weak in cone & frustum. What should I do?',
      ],
    },
    modules: {
      explorer: {
        name: '3D ಆಕಾರ ಅನ್ವೇಷಕ',
        desc: 'ಎಲ್ಲಾ 15 3D ಆಕಾರಗಳನ್ನು ತಿರುಗಿಸಿ, ಫೋಲ್ಡ್ ಸ್ಲೈಡರ್ ಬಳಸಿ ಮತ್ತು ವಿಸ್ತೀರ್ಣ-ಘನಫಲ ಲೆಕ್ಕ ಹಾಕಿ.',
      },
      paths: {
        name: 'ಸ್ಮಾರ್ಟ್ ಕಲಿಕಾ ಮಾರ್ಗಗಳು',
        desc: 'ವಿದ್ಯಾರ್ಥಿಗಳು, ಶಿಕ್ಷಕರು ಮತ್ತು ಪರೀಕ್ಷಾ ಆಕಾಂಕ್ಷಿಗಳಿಗೆ ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶಿ.',
      },
      netlab: {
        name: 'ನೆಟ್ ಲ್ಯಾಬ್ (Net Lab)',
        desc: '11 ಘನ ನೆಟ್‌ಗಳು, ಸಿಲಿಂಡರ್/ಘನಾಭ ಮಡಚುವಿಕೆ ಮತ್ತು ನೆಟ್ ಚೆಕರ್ ಆಟ.',
      },
      practice: {
        name: '10ನೇ ತರಗತಿ NCERT ಅಭ್ಯಾಸ',
        desc: '2D ರೇಖಾಚಿತ್ರಗಳು ಮತ್ತು ಬೋರ್ಡ್ ಮಾದರಿ ಲಿಖಿತ ಪರಿಹಾರಗಳೊಂದಿಗೆ 10 ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು.',
      },
      exam_arena: {
        name: 'ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷಾ ಅಖಾಡ (179Q)',
        desc: '179 ಪ್ರಶ್ನೆಗಳು (41 ದೃಢೀಕೃತ PYQ + 138 ಅಭ್ಯಾಸ), ಮಾಕ್ ಟೆಸ್ಟ್ ಮತ್ತು ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು.',
      },
      pyq_archive: {
        name: 'PYQ ಆರ್ಕೈವ್ ಮತ್ತು ಆವರ್ತನ',
        desc: 'ವರ್ಷ, ಪರೀಕ್ಷೆ ಮತ್ತು ವಿಷಯದ ಪ್ರಕಾರ 41 ಮೂಲ-ದೃಢೀಕೃತ PYQ ಗಳನ್ನು ಹುಡುಕಿ.',
      },
      teacher_studio: {
        name: 'ಶಿಕ್ಷಕರ ಸ್ಟುಡಿಯೋ ಮತ್ತು ಪ್ರೊಜೆಕ್ಟರ್',
        desc: 'ತರಗತಿಯಲ್ಲಿ ಪೂರ್ಣ-ಪರದೆಯಲ್ಲಿ 3D ಮಾದರಿಗಳನ್ನು ಪ್ರದರ್ಶಿಸಿ ಮತ್ತು ಪಾಠ ಟಿಪ್ಪಣಿಗಳನ್ನು ಉಳಿಸಿ.',
      },
      worksheet_generator: {
        name: 'ವರ್ಕ್‌ಶೀಟ್ ಜನರೇಟರ್',
        desc: 'ವಿಷಯ, ಮಟ್ಟ ಮತ್ತು ಪ್ರಶ್ನೆ ಸಂಖ್ಯೆಯನ್ನು ಆರಿಸಿ ಮುದ್ರಿಸಬಹುದಾದ ವರ್ಕ್‌ಶೀಟ್ ರಚಿಸಿ.',
      },
      hub: {
        name: 'ಪ್ರಗತಿ ಮತ್ತು ವಿಶ್ಲೇಷಣಾ ಕೇಂದ್ರ',
        desc: 'ವಿದ್ಯಾರ್ಥಿ, ಶಿಕ್ಷಕ ಮತ್ತು ಪರೀಕ್ಷಾ ವಿಶ್ಲೇಷಣೆ ಗ್ರಾಫ್‌ಗಳು ಮತ್ತು ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು.',
      },
      mistake_detective: {
        name: 'ತಪ್ಪು ಪತ್ತೇದಾರಿ ಕೋಚ್',
        desc: 'ಸೂತ್ರದ ತಪ್ಪುಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ 3-ಪ್ರಶ್ನೆಗಳ ಸುಧಾರಣಾ ಅಭ್ಯಾಸವನ್ನು ನೀಡುತ್ತದೆ.',
      },
      reality_lab: {
        name: 'ಶೇಪ್-ಟು-ರಿಯಾಲಿಟಿ ಲ್ಯಾಬ್',
        desc: 'ನೈಜ ವಸ್ತುಗಳನ್ನು (ಟ್ಯಾಂಕ್, ಪೈಪ್, ಪೆಟ್ಟಿಗೆ) ಲೈವ್ 3D ಜ್ಯಾಮಿತಿಗೆ ಹೊಂದಿಸಿ.',
      },
      offline_revision: {
        name: 'ಆಫ್‌ಲೈನ್ ಲಾಕರ್ ಮತ್ತು ಪುನರಾವರ್ತನೆ',
        desc: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಓದಲು ಪಾಠಗಳು ಮತ್ತು 7-ದಿನದ ಪುನರಾವರ್ತನೆ ಕ್ಯಾಲೆಂಡರ್ ಉಳಿಸಿ.',
      },
    },
    tour: {
      badge: 'ಸಂವಾದಾತ್ಮಕ ಪ್ರವಾಸ',
      stepOf: 'ಹಂತ {current} / {total}',
      prevButton: 'ಹಿಂದಿನದು',
      nextButton: 'ಮುಂದಿನದು',
      finishButton: 'ಪ್ರವಾಸ ಮುಗಿಸಿ',
      skipButton: 'ಪ್ರವಾಸ ಬಿಟ್ಟುಬಿಡಿ',
      restartButton: 'ಮತ್ತೆ ಪ್ರವಾಸ ಆರಂಭಿಸಿ',
      targetHiddenNote: 'ಸಣ್ಣ ಪರದೆಯಲ್ಲಿ ಈ ನಿಯಂತ್ರಣವು ಮೆನುವಿನಲ್ಲಿದೆ.',
      steps: [
        {
          target: 'brand',
          title: 'NetFold 3D ಗೆ ಸ್ವಾಗತ',
          body: '15 ಸಂವಾದಾತ್ಮಕ 3D ಆಕಾರಗಳು, ಬೋರ್ಡ್ ಅಭ್ಯಾಸ, ಶಿಕ್ಷಕರ ಸಾಧನಗಳು ಮತ್ತು 179 ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆಗಳೊಂದಿಗೆ ಆಫ್‌ಲೈನ್-ಸಿದ್ಧ ಗಣಿತ ವೇದಿಕೆ.',
        },
        {
          target: 'audience',
          title: 'ಪಾತ್ರ ಬದಲಾವಣೆ',
          body: 'ವಿದ್ಯಾರ್ಥಿ, ಶಿಕ್ಷಕ ಅಥವಾ ಪರೀಕ್ಷಾ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ. ಪ್ರತಿ ಪಾತ್ರದ ಪ್ರಗತಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಉಳಿಯುತ್ತದೆ.',
        },
        {
          target: 'nav_tabs',
          title: 'ಕಾರ್ಯಕ್ಷೇತ್ರ ಟ್ಯಾಬ್‌ಗಳು',
          body: '3D ಎಕ್ಸ್‌ಪ್ಲೋರರ್, ಕಲಿಕಾ ಮಾರ್ಗ, ನೆಟ್ ಲ್ಯಾಬ್, ಪರೀಕ್ಷಾ ಅಖಾಡ, PYQ ಮತ್ತು ವಿಶ್ಲೇಷಣೆಗೆ ತಕ್ಷಣ ತೆರಳಿ.',
        },
        {
          target: 'welcome_btn',
          title: 'ಸ್ವಾಗತ ಪರದೆ (∞)',
          body: 'ಪಾತ್ರ ಆಯ್ಕೆ ಅಥವಾ ಹೊಸ ಪ್ರಾರಂಭಕ್ಕಾಗಿ ಯಾವಾಗ ಬೇಕಾದರೂ ∞ ಸ್ವಾಗತ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
        },
        {
          target: 'offline_btn',
          title: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಮತ್ತು ಪುನರಾವರ್ತನೆ',
          body: 'ಇಂಟರ್ನೆಟ್ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಅಧ್ಯಯನ ಪ್ಯಾಕ್‌ಗಳನ್ನು ಉಳಿಸಿ.',
        },
        {
          target: 'search_btn',
          title: 'ಜಾಗತಿಕ ಹುಡುಕಾಟ (/ ಅಥವಾ Ctrl+K)',
          body: 'ಯಾವುದೇ ಪರದೆಯಿಂದ ಆಕಾರಗಳು, ಸೂತ್ರಗಳು ಮತ್ತು ಪ್ರಶ್ನೆಗಳನ್ನು ತಕ್ಷಣ ಹುಡುಕಿ.',
        },
        {
          target: 'lang_btn',
          title: '5 ಭಾಷೆಗಳು ಮತ್ತು ಧ್ವನಿ ಬೆಂಬಲ',
          body: 'ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ, ತಮಿಳು, ತೆಲುಗು ಮತ್ತು ಹಿಂದಿ ಭಾಷೆಗಳಲ್ಲಿ ಪಠ್ಯ ಮತ್ತು ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.',
        },
        {
          target: 'guide_fab',
          title: 'AI ಮಾರ್ಗದರ್ಶಿ ಬಟನ್',
          body: 'ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಲು ಅಥವಾ ಈ ಪ್ರವಾಸವನ್ನು ಮರುಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ ಬಲ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
        },
      ],
    },
  },

  ta: {
    fabLabel: 'AI வழிகாட்டி',
    fabTooltip: 'NetFold AI வழிகாட்டி மற்றும் தள சுற்றுலாவைத் திறக்கவும்',
    panelTitle: 'NetFold AI வழிகாட்டி உதவியாளர்',
    panelSubtitle: 'ஸ்மார்ட் வழிசெலுத்தல், தனிப்பட்ட கற்றல் திட்டம் & வழிகாட்டி சுற்றுலா',
    localEngineBadge: 'உள்ளூர் நோக்க மற்றும் முன்னேற்ற இயந்திரம் · நேரடி கிளவுட் LLM இல்லை',
    closeLabel: 'வழிகாட்டியை மூடு',
    tourButton: 'தள சுற்றுலா',
    resetButton: 'மீட்டமை',
    rolePrompt: 'உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்:',
    goalPrompt: 'இன்று நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
    welcomeGreeting:
      'NetFold 3D-க்கு வரவேற்கிறோம்! நீங்கள் என்ன கற்க, கற்பிக்க அல்லது பயிற்சி செய்ய விரும்புகிறீர்கள் என்று கேளுங்கள் — அல்லது வழிகாட்டி சுற்றுலாவைத் தொடங்குங்கள்.',
    roles: {
      student: 'மாணவர்',
      teacher: 'ஆசிரியர்',
      exam: 'தேர்வு ஆர்வலர்',
    },
    roleDescriptions: {
      student: '3D வடிவங்கள், வலைகள், 10ஆம் வகுப்பு பாடங்கள், தவறுகள் & முன்னேற்றம்',
      teacher: 'வகுப்பறை 3D செயல்விளக்கம், பயிற்சித் தாள்கள் & வகுப்பு பகுப்பாய்வு',
      exam: '179 தேர்வு வினாக்கள், 41 சரிபார்க்கப்பட்ட PYQகள், மாதிரி தேர்வுகள் & வரைபடங்கள்',
    },
    tabs: {
      chat: 'வழிகாட்டி உரையாடல்',
      plan: 'என் திட்டம்',
      modules: 'அனைத்து தொகுதிகள்',
    },
    voice: {
      voiceLangLabel: 'குரல் மொழி',
      speakButton: 'உரக்கப் படி',
      stopSpeakingButton: 'குரலை நிறுத்து',
      micStartButton: 'குரல் உள்ளீடு',
      micStopButton: 'மைக் நிறுத்து',
      listeningLabel: 'கேட்கிறது… இப்போது பேசுங்கள்',
      speechUnavailable: 'இந்த உலாவியில் உரை-முதல்-பேச்சு ஆதரவு இல்லை.',
      micUnsupportedFallback:
        'இந்த உலாவியில் மைக் குரல் உள்ளீடு இல்லை — கீழே உரையாகத் தட்டச்சு செய்யவும்.',
    },
    inputPlaceholder: 'எ.கா: "உருளை பற்றி கற்க வேண்டும்" அல்லது "மாதிரி தேர்வு"...',
    sendButton: 'வழிகாட்டு',
    suggestedLabel: 'இவற்றைக் கேட்டுப் பாருங்கள்:',
    whyRecommendedLabel: 'ஏன் இது பரிந்துரைக்கப்படுகிறது',
    progressFactsTitle: 'உங்கள் உண்மையான சேமித்த முன்னேற்றம் (இந்த உலாவி)',
    noDataNotice:
      'இந்தச் சுயவிவரத்தில் இன்னும் முயற்சிகள் பதிவு செய்யப்படவில்லை. கீழே உள்ள பாடத்துடன் தொடங்கவும் — கற்பனைத் தரவு எதுவுமில்லை.',
    completedStepsLabel: 'முடித்த பாடங்கள் / படிகள்',
    incompleteStepsLabel: 'மீதமுள்ள பரிந்துரைக்கப்பட்ட படிகள்',
    nextBestStepLabel: 'அடுத்த சிறந்த செயல்பாடு',
    weakAreasLabel: 'பலவீனமான தலைப்புகள் (உங்கள் வரலாற்றிலிருந்து)',
    weakAreasNone: 'சேமிக்கப்பட்ட முயற்சிகளிலிருந்து பலவீனமான தலைப்பு எதுவும் இல்லை.',
    openActionPrefix: 'திற',
    suggestedQueries: {
      student: [
        'I want to learn about cylinders',
        'I am weak in surface area. What should I do?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      teacher: [
        'How can I demonstrate 3D shapes to my class?',
        'How do I generate a worksheet?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      exam: [
        'Where can I find the PYQs?',
        'I want to take a mock test',
        'Where can I see my performance?',
        'I am weak in cone & frustum. What should I do?',
      ],
    },
    modules: {
      explorer: {
        name: '3D வடிவ ஆய்வாளர்',
        desc: '15 3D வடிவங்களை ஆராய்ந்து, மடிப்பு ஸ்லைடரை நகர்த்தி பரப்பளவு மற்றும் கனஅளவைக் கணக்கிடுங்கள்.',
      },
      paths: {
        name: 'ஸ்மார்ட் கற்றல் பாதைகள்',
        desc: 'மாணவர், ஆசிரியர் மற்றும் தேர்வு நிலைகளுக்கான படிப்படியான வழிகாட்டி.',
      },
      netlab: {
        name: 'நெட் லேப் (Net Lab)',
        desc: '11 கனசதுர வலைகள், உருளை வலை & நெட் செக்கர் விளையாட்டு.',
      },
      practice: {
        name: '10ஆம் வகுப்பு NCERT பயிற்சி',
        desc: '2D படங்களுடன் 10 முழுத் தீர்வு வினாக்கள்.',
      },
      exam_arena: {
        name: 'போட்டித் தேர்வு அரங்கம் (179Q)',
        desc: '179 வினாக்கள் (41 சரிபார்க்கப்பட்ட PYQ + 138 பயிற்சி), நேரத் தேர்வுகள் & குறுக்குவழிகள்.',
      },
      pyq_archive: {
        name: 'PYQ காப்பகம் & அதிர்வெண்',
        desc: 'ஆண்டு, தேர்வு மற்றும் தலைப்பு வாரியாக 41 சரிபார்க்கப்பட்ட PYQகளைத் தேடுங்கள்.',
      },
      teacher_studio: {
        name: 'ஆசிரியர் ஸ்டுடியோ & புரொஜெக்டர்',
        desc: 'வகுப்பில் 3D வடிவங்களை முழுத்திரையில் காட்டி பாடக் குறிப்புகளைச் சேமிக்கவும்.',
      },
      worksheet_generator: {
        name: 'பயிற்சித் தாள் உருவாக்கி',
        desc: 'தலைப்பு மற்றும் சிரம நிலையைத் தேர்ந்தெடுத்து அச்சிடக்கூடிய தாள் உருவாக்கவும்.',
      },
      hub: {
        name: 'முன்னேற்ற & பகுப்பாய்வு மையம்',
        desc: 'மாணவர், ஆசிரியர் & தேர்வு பகுப்பாய்வு வரைபடங்கள் மற்றும் புக்மார்க்குகள்.',
      },
      mistake_detective: {
        name: 'தவறு கண்டறியும் பயிற்சியாளர்',
        desc: 'சூத்திரத் தவறுகளைக் கண்டறிந்து 3-வினா திருத்தப் பயிற்சியை வழங்குகிறது.',
      },
      reality_lab: {
        name: 'நிகழ் உலக 3D ஆய்வகம்',
        desc: 'நிஜப் பொருட்களை (தொட்டி, குழாய், பெட்டி) நேரடி 3D மாதிரிகளுடன் இணைக்கவும்.',
      },
      offline_revision: {
        name: 'ஆஃப்லைன் பெட்டகம் & திருப்புதல்',
        desc: 'இணையம் இல்லாமல் படிக்க பாடங்களையும் 7-நாள் திருப்புதல் அட்டவணையையும் சேமிக்கவும்.',
      },
    },
    tour: {
      badge: 'வழிகாட்டி சுற்றுலா',
      stepOf: 'படி {current} / {total}',
      prevButton: 'முந்தையது',
      nextButton: 'அடுத்தது',
      finishButton: 'சுற்றுலாவை முடி',
      skipButton: 'தவிர்',
      restartButton: 'சுற்றுலாவை மறுதொடக்கம் செய்',
      targetHiddenNote: 'சிறிய திரையில் இந்தப் பொத்தான் மெனுவில் உள்ளது.',
      steps: [
        {
          target: 'brand',
          title: 'NetFold 3D-க்கு வரவேற்கிறோம்',
          body: '15 ஊடாடும் 3D வடிவங்கள், வாரியப் பயிற்சி, ஆசிரியர் கருவிகள் மற்றும் 179 தேர்வு வினாக்கள் கொண்ட ஆஃப்லைன்-தயார் தளம்.',
        },
        {
          target: 'audience',
          title: 'பங்கை எப்போது வேண்டுமானாலும் மாற்றலாம்',
          body: 'மாணவர், ஆசிரியர் அல்லது தேர்வுப் பயன்முறையைத் தேர்ந்தெடுக்கவும்; ஒவ்வொரு சுயவிவரமும் தனித்தனியே சேமிக்கப்படும்.',
        },
        {
          target: 'nav_tabs',
          title: 'அனைத்து கற்றல் தொகுதிகள்',
          body: '3D வடிவங்கள், கற்றல் பாதைகள், நெட் லேப், தேர்வு அரங்கம், PYQ & பகுப்பாய்வுகளுக்கு உடனே செல்லுங்கள்.',
        },
        {
          target: 'welcome_btn',
          title: 'வரவேற்புத் திரை (∞)',
          body: 'புதிய தொடக்கத்திற்கு அல்லது பங்குத் தேர்விற்கு ∞ பொத்தானை எப்போது வேண்டுமானாலும் அழுத்தவும்.',
        },
        {
          target: 'offline_btn',
          title: 'ஆஃப்லைன் நிலை & திருப்புதல்',
          body: 'இணைய நிலையைப் பார்த்து ஆஃப்லைன் பாடத் தொகுப்புகளைச் சேமிக்கவும்.',
        },
        {
          target: 'search_btn',
          title: 'உடனடித் தேடல் (/ அல்லது Ctrl+K)',
          body: 'வடிவங்கள், சூத்திரங்கள் மற்றும் வினாக்களை எங்கிருந்தும் விரைவாகத் தேடுங்கள்.',
        },
        {
          target: 'lang_btn',
          title: '5 மொழிகள் & குரல் ஆதரவு',
          body: 'ஆங்கிலம், கன்னடம், தமிழ், தெலுங்கு மற்றும் இந்தி ஆகிய 5 மொழிகளிலும் குரல் வழிகாட்டலுடன் பயன்படுத்தலாம்.',
        },
        {
          target: 'guide_fab',
          title: 'நிரந்தர AI வழிகாட்டி',
          body: 'வலது-கீழ் பொத்தானை அழுத்தி வழிகாட்டுதல் பெறவும் அல்லது இந்தச் சுற்றுலாவை மீண்டும் தொடங்கவும்.',
        },
      ],
    },
  },

  te: {
    fabLabel: 'AI గైడ్',
    fabTooltip: 'NetFold AI గైడ్ ఏజెంట్ మరియు వెబ్‌సైట్ టూర్‌ను తెరవండి',
    panelTitle: 'NetFold AI గైడ్ ఏజెంట్',
    panelSubtitle: 'స్మార్ట్ నావిగేషన్, వ్యక్తిగత అభ్యాస మార్గం & వెబ్‌సైట్ టూర్',
    localEngineBadge: 'స్థానిక ఇంటెంట్ & ప్రోగ్రెస్ ఇంజిన్ · లైవ్ క్లౌడ్ LLM లేదు',
    closeLabel: 'గైడ్ మూసివేయండి',
    tourButton: 'వెబ్‌సైట్ టూర్',
    resetButton: 'రీసెట్',
    rolePrompt: 'మీ పాత్రను ఎంచుకోండి:',
    goalPrompt: 'ఈరోజు మీరు ఏమి సాధించాలనుకుంటున్నారు?',
    welcomeGreeting:
      'NetFold 3D కి స్వాగతం! మీరు ఏమి నేర్చుకోవాలి, బోధించాలి లేదా ప్రాక్టీస్ చేయాలి అనుకుంటున్నారో చెప్పండి — లేదా ఇంటరాక్టివ్ టూర్ ప్రారంభించండి.',
    roles: {
      student: 'విద్యార్థి',
      teacher: 'ఉపాధ్యాయుడు',
      exam: 'పరీక్షా అభ్యర్థి',
    },
    roleDescriptions: {
      student: '3D ఆకారాలు, నెట్స్, 10వ తరగతి పాఠాలు, తప్పుల విశ్లేషణ & ప్రగతి',
      teacher: 'తరగతి గది 3D ప్రదర్శన, వర్క్‌షీట్‌లు & క్లాస్ అనలిటిక్స్',
      exam: '179 పరీక్షా ప్రశ్నలు, 41 ధృవీకరించబడిన PYQలు, మాక్ టెస్టులు & ఫ్రీక్వెన్సీ చార్టులు',
    },
    tabs: {
      chat: 'గైడ్ చాట్',
      plan: 'నా ప్లాన్',
      modules: 'అన్ని మాడ్యూల్స్',
    },
    voice: {
      voiceLangLabel: 'వాయిస్ భాష',
      speakButton: 'చదివి వినిపించు',
      stopSpeakingButton: 'వాయిస్ ఆపు',
      micStartButton: 'వాయిస్ ఇన్‌పుట్',
      micStopButton: 'మైక్ ఆపు',
      listeningLabel: 'వింటోంది… ఇప్పుడు మాట్లాడండి',
      speechUnavailable: 'ఈ బ్రౌజర్‌లో టెక్స్ట్-టు-స్పీచ్ అందుబాటులో లేదు.',
      micUnsupportedFallback:
        'ఈ బ్రౌజర్‌లో మైక్ వాయిస్ ఇన్‌పుట్ అందుబాటులో లేదు — దయచేసి క్రింద టైప్ చేయండి.',
    },
    inputPlaceholder: 'ఉదా: "సిలిండర్ గురించి నేర్చుకోవాలి" లేదా "మాక్ టెస్ట్ రాయాలి"...',
    sendButton: 'దారి చూపు',
    suggestedLabel: 'ఇవి అడిగి చూడండి:',
    whyRecommendedLabel: 'దీనిని ఎందుకు సిఫార్సు చేశాము',
    progressFactsTitle: 'మీ నిజమైన సేవ్ చేయబడిన ప్రగతి (ఈ బ్రౌజర్)',
    noDataNotice:
      'ఈ ప్రొఫైల్‌లో ఇంకా ఏ ప్రయత్నాలు నమోదు కాలేదు. క్రింది పాఠంతో ప్రారంభించండి — కల్పిత డేటా లేదు.',
    completedStepsLabel: 'పూర్తయిన పాఠాలు / దశలు',
    incompleteStepsLabel: 'మిగిలిన సిఫార్సు దశలు',
    nextBestStepLabel: 'తదుపరి ఉత్తమ కార్యాచరణ',
    weakAreasLabel: 'బలహీన అంశాలు (మీ చరిత్ర నుండి)',
    weakAreasNone: 'సేవ్ చేసిన ప్రయత్నాల నుండి బలహీన అంశాలు ఇంకా గుర్తించబడలేదు.',
    openActionPrefix: 'తెరవండి',
    suggestedQueries: {
      student: [
        'I want to learn about cylinders',
        'I am weak in surface area. What should I do?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      teacher: [
        'How can I demonstrate 3D shapes to my class?',
        'How do I generate a worksheet?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      exam: [
        'Where can I find the PYQs?',
        'I want to take a mock test',
        'Where can I see my performance?',
        'I am weak in cone & frustum. What should I do?',
      ],
    },
    modules: {
      explorer: {
        name: '3D ఆకార అన్వేషకుడు',
        desc: '15 3D ఆకారాలను తిప్పండి, ఫోల్డ్ స్లైడర్ వాడండి మరియు వైశాల్యం-ఘనపరిమాణం లెక్కించండి.',
      },
      paths: {
        name: 'స్మార్ట్ అభ్యాస మార్గాలు',
        desc: 'విద్యార్థులు, ఉపాధ్యాయులు & పరీక్ష అభ్యర్థులకు దశలవారీ మార్గదర్శి.',
      },
      netlab: {
        name: 'నెట్ ల్యాబ్ (Net Lab)',
        desc: '11 ఘనపు నెట్స్, సిలిండర్/దీర్ఘఘనం ఫోల్డింగ్ & నెట్ చెకర్ గేమ్.',
      },
      practice: {
        name: '10వ తరగతి NCERT ప్రాక్టీస్',
        desc: '2D రేఖాచిత్రాలు మరియు పూర్తి బోర్డ్ పరిష్కారాలతో 10 ముఖ్యమైన ప్రశ్నలు.',
      },
      exam_arena: {
        name: 'పోటీ పరీక్షల వేదిక (179Q)',
        desc: '179 ప్రశ్నలు (41 ధృవీకరించిన PYQ + 138 ప్రాక్టీస్), టైమ్డ్ మాక్ టెస్టులు & షార్ట్‌కట్‌లు.',
      },
      pyq_archive: {
        name: 'PYQ ఆర్కైవ్ & ఫ్రీక్వెన్సీ',
        desc: 'సంవత్సరం, పరీక్ష & అంశం వారీగా 41 ధృవీకరించిన PYQలను శోధించండి.',
      },
      teacher_studio: {
        name: 'టీచర్ స్టూడియో & ప్రొజెక్టర్',
        desc: 'తరగతిలో పూర్తి స్క్రీన్ 3D నమూనాలను చూపించండి మరియు పాఠ్య గమనికలను సేవ్ చేయండి.',
      },
      worksheet_generator: {
        name: 'వర్క్‌షీట్ జనరేటర్',
        desc: 'అంశం, స్థాయి & ప్రశ్నల సంఖ్యను ఎంచుకొని ప్రింట్ చేయగల వర్క్‌షీట్ రూపొందించండి.',
      },
      hub: {
        name: 'ప్రగతి & విశ్లేషణ కేంద్రం',
        desc: 'విద్యార్థి, ఉపాధ్యాయ & పరీక్ష అనలిటిక్స్ చార్టులు మరియు బుక్‌మార్క్‌లు.',
      },
      mistake_detective: {
        name: 'తప్పుల డిటెక్టివ్ కోచ్',
        desc: 'సూత్ర తప్పులను గుర్తించి 3-ప్రశ్నల పునరుద్ధరణ డ్రిల్ అందిస్తుంది.',
      },
      reality_lab: {
        name: 'షేప్-టు-రియాలిటీ ల్యాబ్',
        desc: 'నిజ జీవిత వస్తువులను (ట్యాంక్, పైప్, బాక్స్) లైవ్ 3D మోడల్స్‌తో కలపండి.',
      },
      offline_revision: {
        name: 'ఆఫ్‌లైన్ వాల్ట్ & స్మార్ట్ రివిజన్',
        desc: 'ఇంటర్నెట్ లేకుండా చదవడానికి పాఠాలు మరియు 7-రోజుల రివిజన్ క్యాలెండర్ సేవ్ చేయండి.',
      },
    },
    tour: {
      badge: 'ఇంటరాక్టివ్ టూర్',
      stepOf: 'దశ {current} / {total}',
      prevButton: 'మునుపటిది',
      nextButton: 'తదుపరిది',
      finishButton: 'టూర్ ముగించు',
      skipButton: 'టూర్ దాటవేయి',
      restartButton: 'టూర్ మళ్లీ ప్రారంభించు',
      targetHiddenNote: 'చిన్న స్క్రీన్‌లో ఈ బటన్ మెనూలో ఉంటుంది.',
      steps: [
        {
          target: 'brand',
          title: 'NetFold 3D కి స్వాగతం',
          body: '15 ఇంటరాక్టివ్ 3D ఆకారాలు, బోర్డు అభ్యాసం, ఉపాధ్యాయ సాధనాలు మరియు 179 పరీక్షా ప్రశ్నలతో కూడిన ఆఫ్‌లైన్-సిద్ధ వేదిక.',
        },
        {
          target: 'audience',
          title: 'ఎప్పుడైనా పాత్ర మార్చుకోండి',
          body: 'విద్యార్థి, ఉపాధ్యాయుడు లేదా పరీక్షా విభాగాన్ని ఎంచుకోండి. ప్రతి పాత్రకు ప్రగతి విడిగా సేవ్ అవుతుంది.',
        },
        {
          target: 'nav_tabs',
          title: 'అన్ని అభ్యాస విభాగాలు',
          body: '3D ఆకారాలు, లెర్నింగ్ పాత్స్, నెట్ ల్యాబ్, ఎగ్జామ్ అరేనా, PYQ & అనలిటిక్స్‌కి వెంటనే వెళ్లండి.',
        },
        {
          target: 'welcome_btn',
          title: 'వెల్‌కమ్ స్క్రీన్ (∞)',
          body: 'పాత్రను మార్చడానికి లేదా కొత్తగా ప్రారంభించడానికి ఎప్పుడైనా ∞ బటన్‌పై క్లిక్ చేయండి.',
        },
        {
          target: 'offline_btn',
          title: 'ఆఫ్‌లైన్ స్థితి & రివిజన్',
          body: 'ఇంటర్నెట్ స్థితిని తనిఖీ చేసి ఆఫ్‌లైన్ అధ్యయన ప్యాక్‌లను సేవ్ చేయండి.',
        },
        {
          target: 'search_btn',
          title: 'గ్లోబల్ సెర్చ్ (/ లేదా Ctrl+K)',
          body: 'ఏ స్క్రీన్ నుండైనా 3D ఆకారాలు, సూత్రాలు మరియు ప్రశ్నలను తక్షణమే వెతకండి.',
        },
        {
          target: 'lang_btn',
          title: '5 భాషలు & వాయిస్ సపోర్ట్',
          body: 'ఇంగ్లీష్, కన్నడ, తమిళం, తెలుగు మరియు హిందీలో వాయిస్ గైడెన్స్‌తో ఉపయోగించండి.',
        },
        {
          target: 'guide_fab',
          title: 'మీ AI గైడ్ బటన్',
          body: 'ఎప్పుడైనా మార్గదర్శనం పొందడానికి లేదా ఈ టూర్‌ను మళ్లీ చూడడానికి క్రింది కుడి బటన్‌పై క్లిక్ చేయండి.',
        },
      ],
    },
  },

  hi: {
    fabLabel: 'AI गाइड',
    fabTooltip: 'NetFold AI गाइड एजेंट और वेबसाइट टूर खोलें',
    panelTitle: 'NetFold AI गाइड एजेंट',
    panelSubtitle: 'स्मार्ट नेविगेशन, व्यक्तिगत सीखने का पथ और वेबसाइट टूर',
    localEngineBadge: 'स्थानीय इंटेंट और प्रगति इंजन · कोई लाइव क्लाउड LLM नहीं',
    closeLabel: 'गाइड बंद करें',
    tourButton: 'वेबसाइट टूर',
    resetButton: 'रीसेट',
    rolePrompt: 'अपनी भूमिका चुनें:',
    goalPrompt: 'आज आप क्या पूरा करना चाहते हैं?',
    welcomeGreeting:
      'NetFold 3D में आपका स्वागत है! मुझे बताएं कि आप क्या सीखना, पढ़ाना या अभ्यास करना चाहते हैं — या इंटरैक्टिव टूर शुरू करें।',
    roles: {
      student: 'छात्र',
      teacher: 'शिक्षक',
      exam: 'परीक्षा अभ्यर्थी',
    },
    roleDescriptions: {
      student: '3D आकृतियाँ, नेट लैब, कक्षा 10 हल प्रश्न, गलतियाँ और प्रगति',
      teacher: 'क्लासरूम 3D प्रदर्शन, कस्टम वर्कशीट और कक्षा एनालिटिक्स',
      exam: '179 परीक्षा प्रश्न, 41 सत्यापित PYQ, मॉक टेस्ट और आवृत्ति चार्ट',
    },
    tabs: {
      chat: 'गाइड चैट',
      plan: 'मेरी योजना',
      modules: 'सभी मॉड्यूल',
    },
    voice: {
      voiceLangLabel: 'आवाज़ की भाषा',
      speakButton: 'पढ़कर सुनाएं',
      stopSpeakingButton: 'आवाज़ रोकें',
      micStartButton: 'वॉइस इनपुट',
      micStopButton: 'माइक रोकें',
      listeningLabel: 'सुन रहा हूँ… अब बोलें',
      speechUnavailable: 'इस ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है।',
      micUnsupportedFallback:
        'इस ब्राउज़र में माइक वॉइस इनपुट उपलब्ध नहीं है — कृपया नीचे टेक्स्ट टाइप करें।',
    },
    inputPlaceholder: 'जैसे: "मुझे बेलन सीखना है" या "मॉक टेस्ट देना है"...',
    sendButton: 'मार्गदर्शन करें',
    suggestedLabel: 'यह पूछकर देखें:',
    whyRecommendedLabel: 'यह अनुशंसा क्यों की गई है',
    progressFactsTitle: 'आपकी वास्तविक सहेजी गई प्रगति (यह ब्राउज़र)',
    noDataNotice:
      'इस प्रोफ़ाइल में अभी तक कोई हल प्रश्न या गलती दर्ज नहीं है। नीचे किसी पाठ से शुरुआत करें — कोई नकली डेटा नहीं दिखाया जाता।',
    completedStepsLabel: 'पूर्ण पाठ / चरण',
    incompleteStepsLabel: 'शेष अनुशंसित चरण',
    nextBestStepLabel: 'अगली सर्वोत्तम गतिविधि',
    weakAreasLabel: 'कमज़ोर विषय (आपके वास्तविक इतिहास से)',
    weakAreasNone: 'सहेजे गए प्रयासों से अभी कोई कमज़ोर विषय नहीं मिला।',
    openActionPrefix: 'खोलें',
    suggestedQueries: {
      student: [
        'I want to learn about cylinders',
        'I am weak in surface area. What should I do?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      teacher: [
        'How can I demonstrate 3D shapes to my class?',
        'How do I generate a worksheet?',
        'Where can I see my performance?',
        'Start website tour',
      ],
      exam: [
        'Where can I find the PYQs?',
        'I want to take a mock test',
        'Where can I see my performance?',
        'I am weak in cone & frustum. What should I do?',
      ],
    },
    modules: {
      explorer: {
        name: '3D आकृति एक्सप्लोरर',
        desc: 'सभी 15 3D आकृतियों को घुमाएँ, नेट फोल्ड स्लाइडर चलाएँ और CSA, TSA व आयतन की गणना देखें।',
      },
      paths: {
        name: 'स्मार्ट लर्निंग पाथ्स',
        desc: 'छात्रों, शिक्षकों और परीक्षा अभ्यर्थियों के लिए चरण-दर-चरण रोडमैप।',
      },
      netlab: {
        name: 'नेट लैब (Net Lab)',
        desc: '11 घन नेट, बेलन/घनाभ का खुलना और नेट चेकर गेम।',
      },
      practice: {
        name: 'कक्षा 10 NCERT अभ्यास',
        desc: '2D आरेखों और बोर्ड-परीक्षा शैली के पूर्ण लिखित हल सहित 10 मुख्य प्रश्न।',
      },
      exam_arena: {
        name: 'प्रतियोगी परीक्षा अखाड़ा (179Q)',
        desc: '179 प्रश्न (41 सत्यापित PYQ + 138 अभ्यास), टाइम्ड मॉक टेस्ट और शॉर्टकट ट्रिक्स।',
      },
      pyq_archive: {
        name: 'PYQ आर्काइव और आवृत्ति (1999–2026)',
        desc: 'वर्ष, परीक्षा और विषय के अनुसार 41 स्रोत-सत्यापित PYQ खोजें।',
      },
      teacher_studio: {
        name: 'टीचर स्टूडियो और प्रोजेक्टर मोड',
        desc: 'कक्षा में फुल-स्क्रीन 3D मॉडल दिखाएँ और पाठ नोट्स सहेजें।',
      },
      worksheet_generator: {
        name: 'वर्कशीट और असाइनमेंट जनरेटर',
        desc: 'विषय, स्तर और प्रश्न संख्या चुनकर प्रिंट करने योग्य वर्कशीट बनाएँ।',
      },
      hub: {
        name: 'प्रगति और एनालिटिक्स केंद्र',
        desc: 'छात्र, शिक्षक और परीक्षा एनालिटिक्स ग्राफ़, हीटमैप और बुकमार्क।',
      },
      mistake_detective: {
        name: 'मिस्टेक डिटेक्टिव कोच',
        desc: 'सूत्र त्रुटियों को पहचानकर 3-प्रश्न सुधार अभ्यास तैयार करता है।',
      },
      reality_lab: {
        name: 'शेप-टू-रियलिटी लैब',
        desc: 'वास्तविक वस्तुओं (पानी की टंकी, पाइप, डिब्बा) को लाइव 3D मॉडल से जोड़ें।',
      },
      offline_revision: {
        name: 'ऑफ़लाइन वॉल्ट और स्मार्ट रिवीजन',
        desc: 'बिना इंटरनेट पढ़ने के लिए पाठ व प्रश्न सहेजें और 7-दिवसीय रिवीजन कैलेंडर का पालन करें।',
      },
    },
    tour: {
      badge: 'इंटरैक्टिव टूर',
      stepOf: 'चरण {current} / {total}',
      prevButton: 'पिछला',
      nextButton: 'अगला',
      finishButton: 'टूर समाप्त करें',
      skipButton: 'टूर छोड़ें',
      restartButton: 'टूर पुनः शुरू करें',
      targetHiddenNote: 'छोटी स्क्रीन पर यह नियंत्रण मेनू में स्थित है।',
      steps: [
        {
          target: 'brand',
          title: 'NetFold 3D में आपका स्वागत है',
          body: '15 इंटरैक्टिव 3D आकृतियों, कक्षा 10 हल प्रश्नों, शिक्षक उपकरणों और 179 परीक्षा प्रश्नों वाला ऑफ़लाइन-तैयार गणित मंच।',
        },
        {
          target: 'audience',
          title: 'कभी भी भूमिका बदलें',
          body: 'छात्र, शिक्षक या परीक्षा मोड चुनें। प्रत्येक भूमिका अपनी अलग स्थानीय प्रगति सहेजती है।',
        },
        {
          target: 'nav_tabs',
          title: 'सभी कार्यक्षेत्र और मॉड्यूल',
          body: '3D एक्सप्लोरर, लर्निंग पाथ, नेट लैब, परीक्षा अखाड़ा, PYQ और एनालिटिक्स पर तुरंत जाएँ।',
        },
        {
          target: 'welcome_btn',
          title: 'वेलकम स्क्रीन (∞)',
          body: 'भूमिका या लक्ष्य बदलने के लिए कभी भी ∞ बटन दबाएँ।',
        },
        {
          target: 'offline_btn',
          title: 'ऑफ़लाइन स्थिति और रिवीजन',
          body: 'इंटरनेट स्थिति देखें और ऑफ़लाइन अध्ययन पैक सहेजें।',
        },
        {
          target: 'search_btn',
          title: 'तत्काल खोज (/ या Ctrl+K)',
          body: 'किसी भी स्क्रीन से सभी 15 आकृतियाँ, सूत्र और प्रश्न तुरंत खोजें।',
        },
        {
          target: 'lang_btn',
          title: '5 भाषाएँ और वॉइस सहायता',
          body: 'अंग्रेज़ी, कन्नड़, तमिल, तेलुगु और हिंदी में वॉइस मार्गदर्शन के साथ उपयोग करें।',
        },
        {
          target: 'guide_fab',
          title: 'आपका स्थायी AI गाइड',
          body: 'कभी भी प्रश्न पूछने, अपना लर्निंग प्लान देखने या टूर दोबारा चलाने के लिए नीचे-दाएँ बटन दबाएँ।',
        },
      ],
    },
  },
})

export function getGuideTranslations(language) {
  return GUIDE_AGENT_TRANSLATIONS[language] ?? GUIDE_AGENT_TRANSLATIONS.en
}
