import { useMemo, useState } from 'react'
import {
  computePerformanceAnalytics,
  loadAllDemoProfileSummaries,
} from '../utils/profileStorage.js'

/**
 * Performance Analytics & Assessment module:
 * - Active profile accuracy, response speed, topic strengths/weaknesses, SVG improvement chart
 * - Printable Achievement Certificate & Progress Report
 * - Teacher View comparing local demo profiles (clearly labelled local browser storage only)
 */
export default function PerformanceAnalytics({
  translations: t,
  activeProfileId,
  activeAudience,
  profileData,
  learningProgress,
  onClearProfileAnalytics,
}) {
  const au = t.analyticsUi
  const ea = t.examArena
  const aud = t.audience

  const [viewMode, setViewMode] = useState('profile') // 'profile' | 'cohort'
  const [learnerName, setLearnerName] = useState('')
  const [reportDate] = useState(() => new Date().toLocaleDateString())

  const analytics = useMemo(
    () => computePerformanceAnalytics(profileData, learningProgress),
    [profileData, learningProgress],
  )

  const cohortRows = useMemo(
    () =>
      viewMode === 'cohort'
        ? loadAllDemoProfileSummaries(learningProgress)
        : [],
    [viewMode, learningProgress],
  )

  const displayName = learnerName.trim() || au.learnerDefaultName

  const handlePrintCertificate = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print()
    }
  }

  // SVG Improvement Chart geometry
  const chartW = 460
  const chartH = 160
  const padX = 36
  const padY = 20
  const usableW = chartW - padX * 2
  const usableH = chartH - padY * 2
  const trendPoints = analytics.trendPoints

  const coords = trendPoints.map((pt, idx) => {
    const x =
      trendPoints.length === 1
        ? padX + usableW / 2
        : padX + (idx / (trendPoints.length - 1)) * usableW
    const y = padY + (1 - Math.max(0, Math.min(100, pt.accuracy)) / 100) * usableH
    return { ...pt, x, y }
  })

  const polylineStr = coords.map((c) => `${c.x},${c.y}`).join(' ')

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 space-y-5">
      {/* Header + Profile/Teacher Switch */}
      <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {au.headerTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
              {au.headerSubtitle}
            </p>
          </div>

          <div
            role="tablist"
            aria-label={au.headerTitle}
            className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 shrink-0 self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'profile'}
              onClick={() => setViewMode('profile')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              {au.myProfileTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'cohort'}
              onClick={() => setViewMode('cohort')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'cohort'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              {au.teacherViewTab}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-900">
          <span>
            ℹ️ {aud.profileBadgePrefix}:{' '}
            <strong>{aud[activeAudience]}</strong> ({activeProfileId}) —{' '}
            {au.localDisclaimer}
          </span>
          {viewMode === 'profile' && typeof onClearProfileAnalytics === 'function' && (
            <button
              type="button"
              onClick={onClearProfileAnalytics}
              className="rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 cursor-pointer"
            >
              {au.clearProfileHistory}
            </button>
          )}
        </div>
      </section>

      {viewMode === 'profile' ? (
        <div className="space-y-5">
          {/* KPI Metrics */}
          <section className="no-print grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">
                {au.kpis.attempts}
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                {analytics.totalAttempts}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">
                {au.kpis.accuracy}
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-emerald-700">
                {analytics.overallAccuracy}%
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">
                {au.kpis.avgTime}
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-amber-700">
                {analytics.avgTimePerQuestion}s
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">
                {au.kpis.mocks}
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-indigo-700">
                {analytics.mockCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">
                {au.kpis.pathSteps}
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-sky-700">
                {analytics.completedPathStepsCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">
                {au.kpis.shapesDone}
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                {analytics.shapesExploredCount} / 15
              </div>
            </div>
          </section>

          <div className="no-print grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Topic Strengths & Weaknesses */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                {au.topicAnalysisTitle}
              </h3>

              {analytics.topicBreakdown.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-600">
                  {au.noTopicData}
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.topicBreakdown.map((item) => {
                    const barColor =
                      item.status === 'strong'
                        ? 'bg-emerald-600'
                        : item.status === 'developing'
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                    const badgeCls =
                      item.status === 'strong'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.status === 'developing'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                    return (
                      <div key={item.topic} className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                          <span className="text-slate-800">
                            {ea.topics[item.topic] ?? item.topic}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeCls}`}
                            >
                              {au.statusTags[item.status]}
                            </span>
                            <span className="font-mono text-slate-700">
                              {item.accuracy}% ({item.correct}/{item.total}) ·{' '}
                              {item.avgTimeSec}s
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${item.accuracy}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Learning Improvement SVG Chart */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                {au.trendTitle}
              </h3>

              {trendPoints.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-600">
                  {au.noTrendData}
                </div>
              ) : (
                <figure className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <svg
                    viewBox={`0 0 ${chartW} ${chartH}`}
                    role="img"
                    aria-label={au.trendTitle}
                    className="w-full h-auto max-h-48"
                  >
                    {[0, 50, 100].map((val) => {
                      const y = padY + (1 - val / 100) * usableH
                      return (
                        <g key={val}>
                          <line
                            x1={padX}
                            y1={y}
                            x2={chartW - padX}
                            y2={y}
                            stroke="#cbd5e1"
                            strokeDasharray="4 3"
                            strokeWidth="1"
                          />
                          <text
                            x={padX - 6}
                            y={y + 4}
                            fontSize="10"
                            fontWeight="600"
                            fill="#64748b"
                            textAnchor="end"
                          >
                            {val}%
                          </text>
                        </g>
                      )
                    })}

                    {coords.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={polylineStr}
                      />
                    )}

                    {coords.map((c) => (
                      <g key={c.label}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r="5"
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={c.x}
                          y={c.y - 9}
                          fontSize="10"
                          fontWeight="700"
                          fill="#1e1b4b"
                          textAnchor="middle"
                        >
                          {c.accuracy}%
                        </text>
                        <text
                          x={c.x}
                          y={chartH - 4}
                          fontSize="10"
                          fontWeight="700"
                          fill="#475569"
                          textAnchor="middle"
                        >
                          {c.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </figure>
              )}
            </section>
          </div>

          {/* Printable Completion Certificate & Assessment Summary */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="no-print flex flex-wrap items-end justify-between gap-3">
              <div className="flex-1 min-w-[220px] max-w-md">
                <label className="text-xs font-bold text-slate-700">
                  <span className="mb-1 block">{au.learnerNameLabel}</span>
                  <input
                    type="text"
                    value={learnerName}
                    onChange={(e) => setLearnerName(e.target.value)}
                    placeholder={au.learnerDefaultName}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
              >
                🖨 {au.printCertificateButton}
              </button>
            </div>

            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/60 p-6 text-center space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700">
                NetFold 3D · {au.certificateTitle}
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {au.certHeading}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {au.certAwardedTo}
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-indigo-700 border-b border-indigo-200 inline-block px-6 pb-1">
                {displayName}
              </p>
              <p className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-slate-700">
                {au.certBody}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-800">
                <span>
                  {au.kpis.accuracy}: {analytics.overallAccuracy}%
                </span>
                <span>•</span>
                <span>
                  {au.kpis.attempts}: {analytics.totalAttempts}
                </span>
                <span>•</span>
                <span>
                  {au.kpis.shapesDone}: {analytics.shapesExploredCount}/15
                </span>
                <span>•</span>
                <span>{reportDate}</span>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Teacher View: Local Demo Cohort Review */
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {au.cohortHeading}
            </h3>
            <p className="mt-1 text-xs text-slate-600">{au.cohortNote}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {cohortRows.map(({ profile, analytics: rowStats }) => (
              <div
                key={profile.id}
                className={`rounded-2xl border p-4 space-y-3 ${
                  profile.id === activeProfileId
                    ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    {aud[profile.audience]}
                  </span>
                  <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                    {profile.id}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <dt className="text-[10px] font-bold text-slate-500">
                      {au.kpis.attempts}
                    </dt>
                    <dd className="font-mono font-extrabold text-slate-900">
                      {rowStats.totalAttempts}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <dt className="text-[10px] font-bold text-slate-500">
                      {au.kpis.accuracy}
                    </dt>
                    <dd className="font-mono font-extrabold text-emerald-700">
                      {rowStats.overallAccuracy}%
                    </dd>
                  </div>
                  <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <dt className="text-[10px] font-bold text-slate-500">
                      {au.kpis.avgTime}
                    </dt>
                    <dd className="font-mono font-extrabold text-amber-700">
                      {rowStats.avgTimePerQuestion}s
                    </dd>
                  </div>
                  <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <dt className="text-[10px] font-bold text-slate-500">
                      {au.kpis.pathSteps}
                    </dt>
                    <dd className="font-mono font-extrabold text-indigo-700">
                      {rowStats.completedPathStepsCount}
                    </dd>
                  </div>
                </dl>

                {rowStats.weakTopics.length > 0 && (
                  <p className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                    {au.statusTags.weak}:{' '}
                    {rowStats.weakTopics
                      .map((tp) => ea.topics[tp] ?? tp)
                      .join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
