import { getMultilingualContent } from '../data/multilingualContentTranslations.js'
import { LANGUAGE_OPTIONS } from '../data/translations.js'
import { SHAPES, isBeyondClass8Shape } from '../utils/mathEngine.js'
import {
  pauseSpeechGlobal,
  resumeSpeechGlobal,
  setAutoSpeakGlobal,
  stopSpeechGlobal,
  useGlobalSpeechState,
} from '../utils/speechEngine.js'

function getFoldStageText(shape, foldProgress, t) {
  if (shape === SHAPES.SPHERE || shape === SHAPES.HEMISPHERE) {
    return t.foldStage.noNet
  }
  if (foldProgress === 0) return t.foldStage.flat
  if (foldProgress === 100) return t.foldStage.closed
  return t.foldStage.folding
}

const AUDIENCE_TAB_ORDER = {
  student: [
    'explorer',
    'paths',
    'missions',
    'netlab',
    'practice',
    'pyq_archive',
    'offline_revision',
    'reality_lab',
    'mistake_detective',
    'presentation_mode',
    'tutor',
    'hub',
    'exam_arena',
    'analytics',
    'teacher_studio',
    'worksheet_generator',
  ],
  teacher: [
    'teacher_studio',
    'worksheet_generator',
    'paths',
    'analytics',
    'offline_revision',
    'reality_lab',
    'presentation_mode',
    'explorer',
    'netlab',
    'practice',
    'pyq_archive',
    'mistake_detective',
    'missions',
    'exam_arena',
    'tutor',
    'hub',
  ],
  exam: [
    'exam_arena',
    'pyq_archive',
    'offline_revision',
    'mistake_detective',
    'paths',
    'analytics',
    'reality_lab',
    'presentation_mode',
    'worksheet_generator',
    'practice',
    'explorer',
    'netlab',
    'missions',
    'tutor',
    'hub',
    'teacher_studio',
  ],
}

const PRIMARY_COUNT_BY_AUDIENCE = {
  student: 9,
  teacher: 7,
  exam: 8,
}

/**
 * Sticky multi-audience navigation bar with Student / Teacher / Exam Prep switcher,
 * Glowing Infinity Welcome trigger, ordered workspace navigation tabs,
 * Global Search (Ctrl+K / /), Light/Dark theme switch, and 5-language selector.
 */
export default function Navbar({
  language,
  onChangeLanguage,
  activeTab = 'explorer',
  onChangeTab,
  activeAudience = 'student',
  onChangeAudience,
  shape,
  foldProgress,
  translations: t,
  theme = 'light',
  onToggleTheme,
  onOpenSearch,
  onOpenWelcome,
  bookmarkCount = 0,
  networkStatus,
}) {
  const isBeyond = isBeyondClass8Shape(shape)
  const stageLabel = getFoldStageText(shape, foldProgress, t)
  const tt = t.themeToggle
  const st = t.search
  const aud = t.audience
  const speech = useGlobalSpeechState()
  const vu = getMultilingualContent(language).voiceUi

  const tabLabels = {
    explorer: t.navTabs.explorer,
    missions: t.navTabs.missions,
    netlab: t.navTabs.netlab,
    practice: t.navTabs.practice,
    tutor: t.navTabs.tutor,
    hub: t.navTabs.hub,
    paths: t.extraNavTabs.paths,
    exam_arena: t.extraNavTabs.exam_arena,
    pyq_archive: t.extraNavTabs.pyq_archive,
    offline_revision: t.extraNavTabs.offline_revision,
    reality_lab: t.extraNavTabs.reality_lab,
    mistake_detective: t.extraNavTabs.mistake_detective,
    presentation_mode: t.extraNavTabs.presentation_mode,
    teacher_studio: t.extraNavTabs.teacher_studio,
    worksheet_generator: t.extraNavTabs.worksheet_generator,
    analytics: t.extraNavTabs.analytics,
  }

  const orderedTabs = AUDIENCE_TAB_ORDER[activeAudience] ?? AUDIENCE_TAB_ORDER.student
  const primaryLimit = PRIMARY_COUNT_BY_AUDIENCE[activeAudience] ?? 7

  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:px-6 shadow-2xs no-print">
      {/* Row 1: Brand, Audience Selector, Search, Welcome, Theme & Languages */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div data-tour="brand" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-cyan-400/50 text-sm font-extrabold text-cyan-300 shadow-sm">
              ∞
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* 3-Audience Mode Switcher (keeps demo progress separate per profile) */}
          {onChangeAudience && (
            <div
              data-tour="audience"
              role="group"
              aria-label={aud.label}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200"
            >
              {['student', 'teacher', 'exam'].map((roleKey) => {
                const isRole = activeAudience === roleKey
                return (
                  <button
                    key={roleKey}
                    type="button"
                    aria-pressed={isRole}
                    onClick={() => onChangeAudience(roleKey)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer ${
                      isRole
                        ? 'bg-slate-900 text-cyan-300 shadow-xs'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {aud[roleKey]}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'explorer' && isBeyond && (
            <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-300 2xl:inline-flex">
              {t.beyondClass8Badge}
            </span>
          )}

          {activeTab === 'explorer' && (
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 2xl:inline-flex">
              {shape === SHAPES.SPHERE || shape === SHAPES.HEMISPHERE
                ? stageLabel
                : `${stageLabel} · ${foldProgress}%`}
            </span>
          )}

          {/* Reopen Glowing Infinity Welcome Screen */}
          {typeof onOpenWelcome === 'function' && (
            <button
              type="button"
              data-tour="welcome_btn"
              onClick={onOpenWelcome}
              className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/60 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
            >
              <span>∞</span>
              <span className="hidden sm:inline">{t.welcome.reopenButton}</span>
            </button>
          )}

          {/* Local Offline / Online Indicator Pill */}
          {t.offlineUi?.statusLabels && onChangeTab && (
            <button
              type="button"
              data-tour="offline_btn"
              onClick={() => onChangeTab('offline_revision')}
              title={t.offlineUi.deviceOnlyTitle}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold transition cursor-pointer ${
                networkStatus?.isOnline === false
                  ? 'border-amber-400 bg-amber-100 text-amber-950'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  networkStatus?.isOnline === false ? 'bg-amber-600' : 'bg-emerald-500'
                }`}
              />
              <span className="hidden lg:inline">
                {networkStatus?.isOnline === false
                  ? t.offlineUi.statusLabels.offlineBadge
                  : t.offlineUi.statusLabels.onlineBadge}
              </span>
              <span className="lg:hidden">
                {networkStatus?.isOnline === false ? 'Offline' : 'PWA'}
              </span>
            </button>
          )}

          {/* Global Search Trigger */}
          {typeof onOpenSearch === 'function' && st && (
            <button
              type="button"
              data-tour="search_btn"
              onClick={onOpenSearch}
              title={st.shortcutHint}
              aria-label={st.buttonLabel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:text-indigo-700 transition cursor-pointer"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5">
                <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <line x1="13.2" y1="13.2" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">{st.buttonLabel}</span>
              <kbd className="hidden rounded bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 ring-1 ring-slate-200 lg:inline">
                /
              </kbd>
            </button>
          )}

          {/* Auto-Voice Explanation Toggle + Active Audio Mini-Controls */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-1.5 py-1">
            <button
              type="button"
              aria-pressed={speech.autoSpeak}
              aria-label={vu.autoExplainToggleAria}
              title={vu.autoExplainToggleAria}
              onClick={() => setAutoSpeakGlobal(!speech.autoSpeak)}
              className={`rounded-lg px-2 py-1 text-[11px] font-extrabold transition cursor-pointer ${
                speech.autoSpeak
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {speech.autoSpeak ? `🔊 ${vu.autoExplainOn}` : `🔈 ${vu.autoExplainOff}`}
            </button>
            {(speech.status === 'speaking' || speech.status === 'paused') && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    speech.status === 'speaking'
                      ? pauseSpeechGlobal()
                      : resumeSpeechGlobal()
                  }
                  title={speech.status === 'speaking' ? vu.pause : vu.resume}
                  className="rounded-lg bg-amber-200 px-1.5 py-1 text-[11px] font-bold text-amber-950 cursor-pointer"
                >
                  {speech.status === 'speaking' ? '⏸' : '▶'}
                </button>
                <button
                  type="button"
                  onClick={stopSpeechGlobal}
                  title={vu.stop}
                  className="rounded-lg bg-rose-100 px-1.5 py-1 text-[11px] font-bold text-rose-800 cursor-pointer"
                >
                  ⏹
                </button>
              </>
            )}
          </div>

          {/* Light / Dark Theme Toggle */}
          {typeof onToggleTheme === 'function' && tt && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? tt.switchToLight : tt.switchToDark}
              title={theme === 'dark' ? tt.switchToLight : tt.switchToDark}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:text-indigo-700 transition cursor-pointer"
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="hidden xl:inline">
                {theme === 'dark' ? tt.lightLabel : tt.darkLabel}
              </span>
            </button>
          )}

          {/* Desktop 5-language selector pills */}
          <div
            data-tour="lang_btn"
            role="group"
            aria-label={t.languageSelectAria}
            className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 md:inline-flex"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isActive = language === opt.code
              return (
                <button
                  key={opt.code}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onChangeLanguage(opt.code)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  {opt.nativeLabel}
                </button>
              )
            })}
          </div>

          {/* Mobile compact 5-language dropdown */}
          <label className="flex items-center gap-1.5 md:hidden">
            <span className="sr-only">{t.languageSelectLabel}</span>
            <select
              value={language}
              onChange={(event) => onChangeLanguage(event.target.value)}
              aria-label={t.languageSelectAria}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeLabel}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Row 2: Workspace Module Navigation */}
      {onChangeTab && (
        <nav
          data-tour="nav_tabs"
          role="tablist"
          aria-label={t.navTabs.ariaLabel}
          className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200"
        >
          {orderedTabs.map((tabId, idx) => {
            const selected = activeTab === tabId
            const isPrimary = idx < primaryLimit
            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChangeTab(tabId)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  selected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isPrimary
                      ? 'text-slate-800 hover:bg-white hover:text-indigo-700'
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                <span>{tabLabels[tabId]}</span>
                {tabId === 'hub' && bookmarkCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0 text-[10px] font-extrabold ${
                      selected
                        ? 'bg-white/25 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ★{bookmarkCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
