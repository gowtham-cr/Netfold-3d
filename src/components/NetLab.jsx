import { useState } from 'react'
import CubeNetsGallery from './netlab/CubeNetsGallery.jsx'
import CuboidNetExplorer from './netlab/CuboidNetExplorer.jsx'
import CylinderNetExplorer from './netlab/CylinderNetExplorer.jsx'
import DrawANetGuide from './netlab/DrawANetGuide.jsx'
import NetCheckerGame from './netlab/NetCheckerGame.jsx'
import ScaleEnlargementLab from './netlab/ScaleEnlargementLab.jsx'

const SUB_TABS = ['gallery', 'checker', 'cuboid', 'cylinder', 'draw', 'scale']
const SUBTAB_STORAGE_KEY = 'netfold_netlab_subtab_v1'

function getInitialSubTab() {
  if (typeof window === 'undefined') return 'gallery'
  try {
    const saved = window.localStorage.getItem(SUBTAB_STORAGE_KEY)
    return SUB_TABS.includes(saved) ? saved : 'gallery'
  } catch {
    return 'gallery'
  }
}

/**
 * Tier 2 Net Lab dashboard: switches cleanly across all 6 interactive learning labs
 * (11 Cube Nets, Net Checker Game, Cuboid Net, Cylinder Net, Draw-a-Net, Volume Enlargement).
 */
export default function NetLab({
  unit = 'cm',
  translations: t,
  theme = 'light',
  requestedSubTab = null,
  onOpenShapeIn3D,
}) {
  const [activeSubTab, setActiveSubTab] = useState(() =>
    SUB_TABS.includes(requestedSubTab) ? requestedSubTab : getInitialSubTab(),
  )

  const handleSelectSubTab = (tabId) => {
    setActiveSubTab(tabId)
    try {
      window.localStorage.setItem(SUBTAB_STORAGE_KEY, tabId)
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <main className="mx-auto w-full flex-1 bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        {/* Net Lab Header & Sub-Navigation */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                {t.netLab.headerTitle}
              </h2>
              <p className="text-xs leading-relaxed text-slate-600">
                {t.netLab.headerSubtitle}
              </p>
            </div>

            <div
              role="tablist"
              aria-label={t.netLab.headerTitle}
              className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6"
            >
              {SUB_TABS.map((tabId) => {
                const active = activeSubTab === tabId
                return (
                  <button
                    key={tabId}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleSelectSubTab(tabId)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {t.netLab.subTabs[tabId]}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Active Net Lab Station */}
        {activeSubTab === 'gallery' && (
          <CubeNetsGallery translations={t} theme={theme} />
        )}
        {activeSubTab === 'checker' && (
          <NetCheckerGame translations={t} theme={theme} />
        )}
        {activeSubTab === 'cuboid' && (
          <CuboidNetExplorer
            unit={unit}
            translations={t}
            onOpenIn3D={onOpenShapeIn3D}
          />
        )}
        {activeSubTab === 'cylinder' && (
          <CylinderNetExplorer
            unit={unit}
            translations={t}
            onOpenIn3D={onOpenShapeIn3D}
          />
        )}
        {activeSubTab === 'draw' && <DrawANetGuide translations={t} />}
        {activeSubTab === 'scale' && (
          <ScaleEnlargementLab unit={unit} translations={t} />
        )}
      </div>
    </main>
  )
}
