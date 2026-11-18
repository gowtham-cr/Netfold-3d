import { useCallback, useEffect, useMemo, useState } from 'react'
import AITutor from './components/AITutor.jsx'
import Canvas3D from './components/Canvas3D.jsx'
import Class10Practice from './components/Class10Practice.jsx'
import CompetitiveExamArena from './components/CompetitiveExamArena.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import FormulaCard, { FaceAreaBreakdown } from './components/FormulaCard.jsx'
import GlobalSearchModal from './components/GlobalSearchModal.jsx'
import LearningHub from './components/LearningHub.jsx'
import LearningPanel from './components/LearningPanel.jsx'
import MissionsDashboard from './components/MissionsDashboard.jsx'
import Navbar from './components/Navbar.jsx'
import NetFoldGuideAgent from './components/NetFoldGuideAgent.jsx'
import NetLab from './components/NetLab.jsx'
import PerformanceAnalytics from './components/PerformanceAnalytics.jsx'
import PresentationMode from './components/PresentationMode.jsx'
import PyqArchive from './components/PyqArchive.jsx'
import ShapeToRealityLab from './components/ShapeToRealityLab.jsx'
import MistakeDetective from './components/MistakeDetective.jsx'
import OfflineRevisionHub from './components/OfflineRevisionHub.jsx'
import SmartLearningPaths from './components/SmartLearningPaths.jsx'
import TeacherStudio from './components/TeacherStudio.jsx'
import WebsiteTourOverlay from './components/WebsiteTourOverlay.jsx'
import WelcomeSplash from './components/WelcomeSplash.jsx'
import WorksheetGenerator from './components/WorksheetGenerator.jsx'
import {
  LANGUAGES,
  getTranslations,
  isSupportedLanguage,
} from './data/translations.js'
import {
  createDefaultMissionsProgress,
  loadBookmarks,
  loadLearningProgress,
  loadMissionsProgress,
  loadNetCheckerSummary,
  loadThemePreference,
  saveBookmarks,
  saveLearningProgress,
  saveMissionsProgress,
  saveThemePreference,
  toggleBookmarkEntry,
} from './utils/learningProgress.js'
import {
  SHAPES,
  calculateFaceBreakdown,
  calculateShape,
} from './utils/mathEngine.js'
import {
  DEMO_PROFILES,
  computePerformanceAnalytics,
  createEmptyProfileData,
  getProfileByAudience,
  loadActiveProfileId,
  loadProfileData,
  loadWelcomeSeen,
  saveActiveProfileId,
  saveProfileData,
  saveWelcomeSeen,
} from './utils/profileStorage.js'
import { diagnoseMistake } from './utils/mistakeDetective.js'
import { analyzeGuideIntent } from './utils/guideAgentEngine.js'
import { setGlobalSpeechLanguage } from './utils/speechEngine.js'
import { useOfflineEnvironmentStatus } from './utils/offlineStatus.js'
import {
  loadOfflineLocker,
  recordOfflineQuizAnswerInLocker,
  removeOfflineQuestionSet,
  saveEssentialOfflineStudyKit,
  saveOfflineLocker,
  savePresetQuestionSetOffline,
  toggleOfflineLockerItem,
  toggleRevisionTaskCompletion,
} from './utils/offlineVault.js'

const VALID_TABS = new Set([
  'explorer',
  'paths',
  'missions',
  'netlab',
  'practice',
  'tutor',
  'exam_arena',
  'teacher_studio',
  'worksheet_generator',
  'analytics',
  'pyq_archive',
  'reality_lab',
  'mistake_detective',
  'presentation_mode',
  'offline_revision',
  'hub',
])

const INITIAL_DIMENSIONS = {
  [SHAPES.CUBE]: { a: 5 },
  [SHAPES.CUBOID]: { l: 10, b: 6, h: 4 },
  [SHAPES.CYLINDER]: { r: 3, h: 5 },
  [SHAPES.CONE]: { r: 3, h: 4 },
  [SHAPES.SQUARE_PYRAMID]: { a: 6, h: 4 },
  [SHAPES.SPHERE]: { r: 7 },
  [SHAPES.TRIANGULAR_PRISM]: { a: 4, h: 5 },
  [SHAPES.PENTAGONAL_PRISM]: { a: 4, h: 6 },
  [SHAPES.HEXAGONAL_PRISM]: { a: 4, h: 5 },
  [SHAPES.TRIANGULAR_PYRAMID]: { a: 6, h: 5 },
  [SHAPES.PENTAGONAL_PYRAMID]: { a: 4, h: 6 },
  [SHAPES.HEXAGONAL_PYRAMID]: { a: 4, h: 3 },
  [SHAPES.HEMISPHERE]: { r: 7 },
  [SHAPES.FRUSTUM]: { r1: 6, r2: 3, h: 4 },
  [SHAPES.OCTAHEDRON]: { a: 6 },
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return LANGUAGES.EN
  try {
    const saved = window.localStorage.getItem('netfold_lang')
    return isSupportedLanguage(saved) ? saved : LANGUAGES.EN
  } catch {
    return LANGUAGES.EN
  }
}

function getInitialTab() {
  if (typeof window === 'undefined') return 'explorer'
  try {
    const saved = window.localStorage.getItem('netfold_active_tab_v1')
    return VALID_TABS.has(saved) ? saved : 'explorer'
  } catch {
    return 'explorer'
  }
}

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage)
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [theme, setTheme] = useState(loadThemePreference)
  const [shape, setShape] = useState(SHAPES.CUBE)
  const [dimensionsByShape, setDimensionsByShape] = useState(INITIAL_DIMENSIONS)
  const [foldProgress, setFoldProgress] = useState(0)
  const [highlightMode, setHighlightMode] = useState('all')
  const [selectedFace, setSelectedFace] = useState(null)
  const [unit, setUnit] = useState('cm')

  // Multi-audience local demo profile & glowing infinity welcome splash
  const [activeProfileId, setActiveProfileId] = useState(loadActiveProfileId)
  const [profileData, setProfileData] = useState(() =>
    loadProfileData(loadActiveProfileId()),
  )
  const [welcomeOpen, setWelcomeOpen] = useState(() => !loadWelcomeSeen())

  // Shared Explorer / Missions / Practice progress & bookmarks
  const [bookmarks, setBookmarks] = useState(loadBookmarks)
  const [learningProgress, setLearningProgress] = useState(loadLearningProgress)
  const [missionsProgress, setMissionsProgress] = useState(loadMissionsProgress)
  const [searchOpen, setSearchOpen] = useState(false)

  // Deep-link jump counters
  const [hubSection, setHubSection] = useState('progress')
  const [practiceJump, setPracticeJump] = useState({ key: 0, idx: null })
  const [missionsJump, setMissionsJump] = useState({ key: 0, missionId: null })
  const [netLabJump, setNetLabJump] = useState({ key: 0, subTab: null })
  const [pyqJump, setPyqJump] = useState({ key: 0, questionId: null })
  const [arenaJump, setArenaJump] = useState({
    key: 0,
    mode: 'practice',
    authenticity: 'all',
    topic: 'all',
    exam: 'all',
  })
  const [guideOpen, setGuideOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [mistakeFocus, setMistakeFocus] = useState({ key: 0, diagnosis: null })
  const [offlineLocker, setOfflineLocker] = useState(() =>
    loadOfflineLocker(activeProfileId),
  )
  const networkStatus = useOfflineEnvironmentStatus()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  useEffect(() => {
    const handleGlobalKey = (event) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((prev) => !prev)
        return
      }
      if (!isTyping && event.key === '/') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [])

  const t = getTranslations(language)
  const activeDimensions = dimensionsByShape[shape]
  const activeProfileMeta =
    DEMO_PROFILES.find((p) => p.id === activeProfileId) ?? DEMO_PROFILES[0]
  const activeAudience = activeProfileMeta.audience

  const mensuration = useMemo(
    () => calculateShape(shape, activeDimensions),
    [shape, activeDimensions],
  )

  const breakdown = useMemo(
    () => calculateFaceBreakdown(shape, activeDimensions),
    [shape, activeDimensions],
  )

  const activeAnalytics = useMemo(
    () => computePerformanceAnalytics(profileData, learningProgress),
    [profileData, learningProgress],
  )

  const netCheckerSummary = useMemo(
    () => loadNetCheckerSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, hubSection],
  )

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      saveThemePreference(next)
      return next
    })
  }

  const handleChangeLanguage = (nextLang) => {
    if (!isSupportedLanguage(nextLang)) return
    setLanguage(nextLang)
    setGlobalSpeechLanguage(nextLang)
    try {
      window.localStorage.setItem('netfold_lang', nextLang)
    } catch {
      // Ignore storage errors
    }
  }

  const updateActiveProfileData = (updater) => {
    setProfileData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveProfileData(activeProfileId, next)
      return next
    })
  }

  const updateActiveOfflineLocker = (updater) => {
    setOfflineLocker((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveOfflineLocker(activeProfileId, next)
      return next
    })
  }

  const handleChangeAudience = (audienceKey, navigateToDefault = true) => {
    const prof = getProfileByAudience(audienceKey)
    setActiveProfileId(prof.id)
    saveActiveProfileId(prof.id)
    setProfileData(loadProfileData(prof.id))
    setOfflineLocker(loadOfflineLocker(prof.id))
    if (navigateToDefault) {
      handleChangeTab(prof.defaultTab)
    }
  }

  const handleSelectWelcomeAudience = (audienceKey) => {
    saveWelcomeSeen(true)
    setWelcomeOpen(false)
    handleChangeAudience(audienceKey, true)
  }

  const handleDismissWelcome = () => {
    saveWelcomeSeen(true)
    setWelcomeOpen(false)
  }

  const recordShapeExplored = useCallback((targetShape) => {
    setLearningProgress((prev) => {
      if (prev.exploredShapes.includes(targetShape)) return prev
      const next = {
        ...prev,
        exploredShapes: [...prev.exploredShapes, targetShape],
      }
      saveLearningProgress(next)
      return next
    })
  }, [])

  const handleQuestionVisited = useCallback((qId) => {
    setLearningProgress((prev) => {
      if (prev.visitedQuestions.includes(qId)) return prev
      const next = {
        ...prev,
        visitedQuestions: [...prev.visitedQuestions, qId],
      }
      saveLearningProgress(next)
      return next
    })
  }, [])

  const handleSelectShape = (nextShape) => {
    setShape(nextShape)
    setSelectedFace(null)
    recordShapeExplored(nextShape)
    if (
      (nextShape === SHAPES.SPHERE || nextShape === SHAPES.OCTAHEDRON) &&
      highlightMode === 'lsa'
    ) {
      setHighlightMode('all')
    }
  }

  const handleChangeDimension = (targetShape, key, value) => {
    setDimensionsByShape((prev) => ({
      ...prev,
      [targetShape]: {
        ...prev[targetShape],
        [key]: value,
      },
    }))
  }

  const handleChangeTab = (nextTab) => {
    const validTab = VALID_TABS.has(nextTab) ? nextTab : 'explorer'
    setActiveTab(validTab)
    try {
      window.localStorage.setItem('netfold_active_tab_v1', validTab)
    } catch {
      // Ignore storage errors
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }

  const handleOpenShapeIn3D = (targetShape, nextDims) => {
    if (nextDims && typeof nextDims === 'object') {
      setDimensionsByShape((prev) => ({
        ...prev,
        [targetShape]: { ...prev[targetShape], ...nextDims },
      }))
    }
    setShape(targetShape)
    setSelectedFace(null)
    setFoldProgress(50)
    recordShapeExplored(targetShape)
    handleChangeTab('explorer')
  }

  const handleToggleBookmark = (kind, id) => {
    setBookmarks((prev) => {
      const next = toggleBookmarkEntry(prev, kind, id)
      saveBookmarks(next)
      return next
    })
  }

  const handleUpdateMissionProgress = (missionId, nextRecord) => {
    setMissionsProgress((prev) => {
      const next = {
        ...prev,
        [missionId]: nextRecord,
      }
      saveMissionsProgress(next)
      return next
    })
  }

  const handleResetAllMissions = () => {
    const clean = createDefaultMissionsProgress()
    setMissionsProgress(clean)
    saveMissionsProgress(clean)
  }

  const handleSearchNavigate = (action) => {
    if (!action) return
    if (action.type === 'shape') {
      const targetShape = action.shapeId ?? action.shape
      if (targetShape) {
        handleOpenShapeIn3D(targetShape, action.dimensions)
      }
      return
    }
    if (action.type === 'mission') {
      setMissionsJump((prev) => ({ key: prev.key + 1, missionId: action.missionId }))
      handleChangeTab('missions')
      return
    }
    if (action.type === 'practice') {
      setPracticeJump((prev) => ({ key: prev.key + 1, idx: action.questionIndex }))
      handleChangeTab('practice')
      return
    }
    if (action.type === 'tab') {
      if (action.tabId === 'netlab') {
        setNetLabJump((prev) => ({ key: prev.key + 1, subTab: action.subTab ?? null }))
      }
      handleChangeTab(action.tabId)
      return
    }
    if (action.type === 'pyq') {
      setPyqJump((prev) => ({ key: prev.key + 1, questionId: action.questionId ?? null }))
      handleChangeTab('pyq_archive')
      return
    }
    if (action.type === 'arena') {
      setArenaJump((prev) => ({
        key: prev.key + 1,
        mode: action.mode ?? 'practice',
        authenticity: action.authenticity ?? 'all',
        topic: action.topic ?? 'all',
        exam: action.exam ?? 'all',
      }))
      handleChangeTab('exam_arena')
      return
    }
    if (action.type === 'set_role' && action.role) {
      handleChangeAudience(action.role)
      return
    }
    if (action.type === 'start_tour') {
      setGuideOpen(false)
      setTourOpen(true)
      return
    }
    if (action.type === 'hub') {
      setHubSection(action.sectionId ?? 'progress')
      handleChangeTab('hub')
    }
  }

  const handleLaunchPathStep = (step) => {
    if (!step) return
    if (step.targetTab === 'explorer' && step.shape) {
      handleOpenShapeIn3D(step.shape, step.dimensions)
      return
    }
    handleChangeTab(step.targetTab)
  }

  const handleLogDiagnosedMistake = (entry) => {
    if (!entry) return
    updateActiveProfileData((prev) => ({
      ...prev,
      mistakeLogs: [...(prev.mistakeLogs ?? []), entry].slice(-300),
    }))
  }

  const handleDiagnoseWrongAnswer = (payload) => {
    const diag = diagnoseMistake(payload)
    if (!diag) return
    const stamped = { ...diag, timestamp: Date.now() }
    handleLogDiagnosedMistake(stamped)
    setMistakeFocus((prev) => ({ key: prev.key + 1, diagnosis: stamped }))
    handleChangeTab('mistake_detective')
  }

  const bookmarkCount =
    (bookmarks?.shapes?.length ?? 0) +
    (bookmarks?.questions?.length ?? 0) +
    (bookmarks?.pyqs?.length ?? 0)

  const rootLayoutClass =
    activeTab === 'explorer'
      ? 'flex min-h-dvh w-full flex-col bg-slate-100 text-slate-900 lg:h-dvh lg:overflow-hidden'
      : 'flex min-h-dvh w-full flex-col bg-slate-100 text-slate-900 nf-honeycomb-surface'

  return (
    <div className={rootLayoutClass}>
      <Navbar
        language={language}
        onChangeLanguage={handleChangeLanguage}
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        activeAudience={activeAudience}
        onChangeAudience={handleChangeAudience}
        shape={shape}
        foldProgress={foldProgress}
        translations={t}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenWelcome={() => setWelcomeOpen(true)}
        bookmarkCount={bookmarkCount}
        networkStatus={networkStatus}
      />

      {activeTab === 'explorer' ? (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative h-[46dvh] min-h-[300px] w-full lg:h-auto lg:min-h-0 lg:flex-1">
              <Canvas3D
                shape={shape}
                foldProgress={foldProgress}
                dimensions={activeDimensions}
                highlightMode={highlightMode}
                selectedFace={selectedFace}
                onSelectFace={setSelectedFace}
                translations={t}
                theme={theme}
              />
            </div>

            <FaceAreaBreakdown
              shape={shape}
              breakdown={breakdown}
              mensuration={mensuration}
              unit={unit}
              selectedFace={selectedFace}
              onSelectFace={setSelectedFace}
              translations={t}
            />
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-slate-200 bg-slate-50/80 p-4 lg:w-[420px] lg:overflow-y-auto lg:border-t-0 lg:border-l xl:w-[460px]">
            <ControlPanel
              shape={shape}
              onSelectShape={handleSelectShape}
              dimensions={dimensionsByShape}
              mensuration={mensuration}
              onChangeDimension={handleChangeDimension}
              foldProgress={foldProgress}
              onChangeFoldProgress={setFoldProgress}
              highlightMode={highlightMode}
              onChangeHighlightMode={setHighlightMode}
              unit={unit}
              onChangeUnit={setUnit}
              translations={t}
              bookmarkedShapes={bookmarks.shapes}
              onToggleBookmarkShape={(shapeId) =>
                handleToggleBookmark('shapes', shapeId)
              }
            />

            <FormulaCard
              shape={shape}
              mensuration={mensuration}
              unit={unit}
              highlightMode={highlightMode}
              onChangeHighlightMode={setHighlightMode}
              translations={t}
            />

            <LearningPanel
              shape={shape}
              mensuration={mensuration}
              unit={unit}
              translations={t}
            />
          </aside>
        </div>
      ) : activeTab === 'paths' ? (
        <SmartLearningPaths
          language={language}
          translations={t}
          theme={theme}
          defaultAudience={activeAudience}
          completedStepIds={profileData.completedPathSteps}
          weakTopics={activeAnalytics.weakTopics}
          onToggleStepComplete={(stepId) =>
            updateActiveProfileData((prev) => {
              const exists = prev.completedPathSteps.includes(stepId)
              return {
                ...prev,
                completedPathSteps: exists
                  ? prev.completedPathSteps.filter((id) => id !== stepId)
                  : [...prev.completedPathSteps, stepId],
              }
            })
          }
          onLaunchTarget={handleLaunchPathStep}
        />
      ) : activeTab === 'exam_arena' ? (
        <CompetitiveExamArena
          key={arenaJump.key}
          language={language}
          translations={t}
          theme={theme}
          initialMode={arenaJump.mode}
          initialAuthenticity={arenaJump.authenticity}
          initialTopic={arenaJump.topic}
          initialExam={arenaJump.exam}
          bookmarks={bookmarks}
          profileData={profileData}
          onToggleBookmarkPyq={(pyqId) => handleToggleBookmark('pyqs', pyqId)}
          onRecordAttempts={(records) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              examAttempts: [...prev.examAttempts, ...records].slice(-400),
            }))
          }
          onRecordMockSession={(mockSummary, attemptRecords) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              mockSessions: [...prev.mockSessions, mockSummary].slice(-40),
              examAttempts: [...prev.examAttempts, ...attemptRecords].slice(-400),
            }))
          }
          onDiagnoseWrongAnswer={handleDiagnoseWrongAnswer}
        />
      ) : activeTab === 'teacher_studio' ? (
        <TeacherStudio
          language={language}
          translations={t}
          theme={theme}
          unit={unit}
          savedLessons={profileData.savedLessons}
          onSaveLesson={(lesson) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              savedLessons: [lesson, ...prev.savedLessons].slice(0, 30),
            }))
          }
          onDeleteLesson={(lessonId) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              savedLessons: prev.savedLessons.filter((l) => l.id !== lessonId),
            }))
          }
          onOpenTeacherAnalytics={() => {
            setHubSection('teacher_analytics')
            handleChangeTab('hub')
          }}
          onRecordClassroomPractice={(record) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              examAttempts: [...prev.examAttempts, record].slice(-400),
            }))
          }
          onDiagnoseWrongAnswer={handleDiagnoseWrongAnswer}
        />
      ) : activeTab === 'pyq_archive' ? (
        <PyqArchive
          key={pyqJump.key}
          lang={language}
          translations={t}
          theme={theme}
          bookmarks={bookmarks}
          profileData={profileData}
          initialQuestionId={pyqJump.questionId}
          onToggleBookmarkPyq={(pyqId) => handleToggleBookmark('pyqs', pyqId)}
          onRecordPyqAttempt={(record) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              pyqAttempts: [...(prev.pyqAttempts ?? []), record].slice(-300),
            }))
          }
          onInspectShape={(targetShape) => handleOpenShapeIn3D(targetShape)}
          onDiagnoseWrongAnswer={handleDiagnoseWrongAnswer}
        />
      ) : activeTab === 'reality_lab' ? (
        <ShapeToRealityLab
          language={language}
          translations={t}
          theme={theme}
          onOpenMistakeDetective={handleDiagnoseWrongAnswer}
          onRecordRealityAttempt={(ch, pickedIdx, isCorrect) => {
            const ts = Date.now()
            updateActiveProfileData((prev) => ({
              ...prev,
              pyqAttempts: [
                ...(prev.pyqAttempts ?? []),
                {
                  questionId: ch.id,
                  exam: 'general_aptitude',
                  topic: ch.topic,
                  difficulty: 'medium',
                  authenticity: 'pyq_style_practice',
                  correct: isCorrect,
                  timeSpentSec: 20,
                  timestamp: ts,
                },
              ].slice(-300),
              mistakeLogs: isCorrect
                ? prev.mistakeLogs ?? []
                : [
                    ...(prev.mistakeLogs ?? []),
                    {
                      ...diagnoseMistake({
                        question: ch,
                        wrongOptionIndex: pickedIdx,
                        questionSource: 'reality_lab',
                      }),
                      timestamp: ts,
                    },
                  ].slice(-300),
            }))
          }}
        />
      ) : activeTab === 'mistake_detective' ? (
        <MistakeDetective
          key={mistakeFocus.key}
          language={language}
          translations={t}
          theme={theme}
          profileData={profileData}
          initialDiagnosis={mistakeFocus.diagnosis}
          onLogDiagnosedMistake={handleLogDiagnosedMistake}
          onRecordRemediationSession={(sessionSummary, drillAttempts) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              remediationSessions: [
                ...(prev.remediationSessions ?? []),
                sessionSummary,
              ].slice(-60),
              pyqAttempts: [...(prev.pyqAttempts ?? []), ...drillAttempts].slice(
                -300,
              ),
            }))
          }
          onNavigateToTab={handleChangeTab}
        />
      ) : activeTab === 'presentation_mode' ? (
        <PresentationMode
          language={language}
          translations={t}
          theme={theme}
          profileData={profileData}
          learningProgress={learningProgress}
          missionsProgress={missionsProgress}
          onLogDiagnosedMistake={handleLogDiagnosedMistake}
          onRecordPyqAttempt={(record) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              pyqAttempts: [...(prev.pyqAttempts ?? []), record].slice(-300),
            }))
          }
          onRecordRemediationSession={(sessionSummary, drillAttempts) =>
            updateActiveProfileData((prev) => ({
              ...prev,
              remediationSessions: [
                ...(prev.remediationSessions ?? []),
                sessionSummary,
              ].slice(-60),
              pyqAttempts: [...(prev.pyqAttempts ?? []), ...drillAttempts].slice(
                -300,
              ),
            }))
          }
          onNavigateToTab={handleChangeTab}
        />
      ) : activeTab === 'offline_revision' ? (
        <OfflineRevisionHub
          language={language}
          translations={t}
          theme={theme}
          networkStatus={networkStatus}
          offlineLocker={offlineLocker}
          profileData={profileData}
          learningProgress={learningProgress}
          onToggleOfflineItem={(category, itemId) =>
            updateActiveOfflineLocker((prev) =>
              toggleOfflineLockerItem(prev, category, itemId),
            )
          }
          onSaveEssentialKit={(weakTopics) =>
            updateActiveOfflineLocker((prev) =>
              saveEssentialOfflineStudyKit(prev, weakTopics),
            )
          }
          onSaveTopicPack={(topic, title) =>
            updateActiveOfflineLocker((prev) =>
              savePresetQuestionSetOffline(prev, {
                id: `offline_pack_${topic}`,
                title: `${title} (6Q)`,
                topic,
                filterFn: (q) => q.topic === topic,
              }),
            )
          }
          onSaveWeakPack={(topic, title) =>
            updateActiveOfflineLocker((prev) =>
              savePresetQuestionSetOffline(prev, {
                id: `offline_pack_weak_${topic}`,
                title: `${title} Priority Pack`,
                topic,
                filterFn: (q) => q.topic === topic,
              }),
            )
          }
          onRemoveQuestionSet={(setId) =>
            updateActiveOfflineLocker((prev) =>
              removeOfflineQuestionSet(prev, setId),
            )
          }
          onRecordOfflineQuizAnswer={(setId, qItem, pickedIndex) => {
            const isCorrect = pickedIndex === qItem.correctIndex
            const ts = Date.now()
            updateActiveOfflineLocker((prev) =>
              recordOfflineQuizAnswerInLocker(prev, {
                setId,
                questionId: qItem.id,
                pickedIndex,
                correct: isCorrect,
              }),
            )
            updateActiveProfileData((prev) => ({
              ...prev,
              pyqAttempts: [
                ...(prev.pyqAttempts ?? []),
                {
                  questionId: qItem.id,
                  exam: qItem.exam || 'general_aptitude',
                  topic: qItem.topic,
                  difficulty: qItem.difficulty || 'medium',
                  authenticity: qItem.authenticity || 'pyq_style_practice',
                  correct: isCorrect,
                  timeSpentSec: 20,
                  timestamp: ts,
                },
              ].slice(-300),
              mistakeLogs: isCorrect
                ? prev.mistakeLogs ?? []
                : [
                    ...(prev.mistakeLogs ?? []),
                    {
                      ...diagnoseMistake({
                        question: qItem,
                        wrongOptionIndex: pickedIndex,
                        questionSource: 'offline_locker_quiz',
                      }),
                      timestamp: ts,
                    },
                  ].slice(-300),
            }))
          }}
          onToggleRevisionTask={(taskId) =>
            updateActiveOfflineLocker((prev) =>
              toggleRevisionTaskCompletion(prev, taskId),
            )
          }
          onNavigateToTab={handleChangeTab}
          onInspectShape={(targetShape) => handleOpenShapeIn3D(targetShape)}
        />
      ) : activeTab === 'worksheet_generator' ? (
        <WorksheetGenerator language={language} translations={t} />
      ) : activeTab === 'analytics' ? (
        <PerformanceAnalytics
          translations={t}
          activeProfileId={activeProfileId}
          activeAudience={activeAudience}
          profileData={profileData}
          learningProgress={learningProgress}
          onClearProfileAnalytics={() =>
            updateActiveProfileData(() => ({
              ...createEmptyProfileData(),
            }))
          }
        />
      ) : activeTab === 'missions' ? (
        <MissionsDashboard
          key={missionsJump.key}
          language={language}
          translations={t}
          theme={theme}
          missionsProgress={missionsProgress}
          onUpdateMissionProgress={handleUpdateMissionProgress}
          onResetAllMissions={handleResetAllMissions}
          requestedMissionId={missionsJump.missionId}
        />
      ) : activeTab === 'netlab' ? (
        <NetLab
          key={netLabJump.key}
          unit={unit}
          translations={t}
          theme={theme}
          requestedSubTab={netLabJump.subTab}
          onOpenShapeIn3D={handleOpenShapeIn3D}
        />
      ) : activeTab === 'practice' ? (
        <Class10Practice
          key={practiceJump.key}
          language={language}
          translations={t}
          theme={theme}
          requestedQuestionIndex={practiceJump.idx}
          bookmarkedQuestions={bookmarks.questions}
          onToggleBookmarkQuestion={(qId) =>
            handleToggleBookmark('questions', qId)
          }
          onQuestionVisited={handleQuestionVisited}
          onOpenShapeIn3D={handleOpenShapeIn3D}
        />
      ) : activeTab === 'tutor' ? (
        <AITutor
          language={language}
          shape={shape}
          dimensionsByShape={dimensionsByShape}
          mensuration={mensuration}
          unit={unit}
          translations={t}
          onOpenShapeIn3D={handleOpenShapeIn3D}
        />
      ) : (
        <LearningHub
          language={language}
          translations={t}
          theme={theme}
          activeSection={hubSection}
          onChangeSection={setHubSection}
          learningProgress={learningProgress}
          missionsProgress={missionsProgress}
          netCheckerSummary={netCheckerSummary}
          bookmarks={bookmarks}
          profileData={profileData}
          activeProfileId={activeProfileId}
          activeAudience={activeAudience}
          onNavigateToTab={handleChangeTab}
          onToggleBookmarkShape={(shapeId) =>
            handleToggleBookmark('shapes', shapeId)
          }
          onToggleBookmarkQuestion={(qId) =>
            handleToggleBookmark('questions', qId)
          }
          onToggleBookmarkPyq={(pyqId) =>
            handleToggleBookmark('pyqs', pyqId)
          }
          onOpenShape={(shapeId) => {
            handleSelectShape(shapeId)
            handleChangeTab('explorer')
          }}
          onOpenQuestion={(questionIdx) => {
            setPracticeJump((prev) => ({ key: prev.key + 1, idx: questionIdx }))
            handleChangeTab('practice')
          }}
          onOpenPyq={(pyqId) => {
            setPyqJump((prev) => ({ key: prev.key + 1, questionId: pyqId }))
            handleChangeTab('pyq_archive')
          }}
          onOpenMissions={() => handleChangeTab('missions')}
        />
      )}

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        language={language}
        translations={t}
        onNavigateAction={handleSearchNavigate}
      />

      <WelcomeSplash
        isOpen={welcomeOpen}
        language={language}
        onChangeLanguage={handleChangeLanguage}
        translations={t}
        onSelectAudience={handleSelectWelcomeAudience}
        onStartTour={() => {
          handleDismissWelcome()
          setGuideOpen(false)
          setTourOpen(true)
        }}
        onOpenGuideGoal={(goalText, preferredRole) => {
          handleSelectWelcomeAudience(preferredRole)
          const parsed = analyzeGuideIntent(goalText, {
            role: preferredRole,
            language,
            analytics: activeAnalytics,
          })
          if (parsed.actions?.[0]) {
            handleSearchNavigate(parsed.actions[0])
          }
          setGuideOpen(true)
        }}
        onDismiss={handleDismissWelcome}
      />

      <NetFoldGuideAgent
        isOpen={guideOpen}
        onSetOpen={setGuideOpen}
        language={language}
        activeAudience={activeAudience}
        onChangeAudience={handleChangeAudience}
        profileData={profileData}
        learningProgress={learningProgress}
        missionsProgress={missionsProgress}
        analytics={activeAnalytics}
        offlineLocker={offlineLocker}
        onNavigateAction={handleSearchNavigate}
        onStartTour={() => {
          setGuideOpen(false)
          setTourOpen(true)
        }}
        theme={theme}
      />

      <WebsiteTourOverlay
        isOpen={tourOpen}
        language={language}
        onClose={() => setTourOpen(false)}
        onOpenGuidePanel={() => setGuideOpen(true)}
      />
    </div>
  )
}
