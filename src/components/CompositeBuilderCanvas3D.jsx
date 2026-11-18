import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Grid, Html, OrbitControls, TransformControls } from '@react-three/drei'
import { SHAPES } from '../utils/mathEngine.js'
import {
  computeExplodedPosition,
  fmtCompositeNum,
  getCompositeCentroid,
} from '../utils/compositeBuilderEngine.js'

function getShapeGeometryProps(shape, dims) {
  const safe = dims ?? {}
  if (shape === SHAPES.CUBE) {
    const a = safe.a ?? 4
    return { type: 'box', args: [a, a, a], rotY: 0, offsetY: 0 }
  }
  if (shape === SHAPES.CUBOID) {
    return {
      type: 'box',
      args: [safe.l ?? 4, safe.h ?? 5, safe.b ?? 3],
      rotY: 0,
      offsetY: 0,
    }
  }
  if (shape === SHAPES.CYLINDER) {
    const r = safe.r ?? 3
    return { type: 'cylinder', args: [r, r, safe.h ?? 5, 48], rotY: 0, offsetY: 0 }
  }
  if (shape === SHAPES.CONE) {
    return { type: 'cone', args: [safe.r ?? 3, safe.h ?? 4, 48], rotY: 0, offsetY: 0 }
  }
  if (shape === SHAPES.SPHERE) {
    return { type: 'sphere', args: [safe.r ?? 3, 48, 32], rotY: 0, offsetY: 0 }
  }
  if (shape === SHAPES.HEMISPHERE) {
    const r = safe.r ?? 3
    return { type: 'hemisphere', radius: r, offsetY: -r / 2 }
  }
  if (shape === SHAPES.FRUSTUM) {
    return {
      type: 'cylinder',
      args: [safe.r2 ?? 2, safe.r1 ?? 4, safe.h ?? 4, 48],
      rotY: 0,
      offsetY: 0,
    }
  }
  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PRISM ? 3 : shape === SHAPES.PENTAGONAL_PRISM ? 5 : 6
    const a = safe.a ?? 4
    const h = safe.h ?? 5
    const circumR = a / (2 * Math.sin(Math.PI / sides))
    return { type: 'cylinder', args: [circumR, circumR, h, sides], rotY: 0, offsetY: 0 }
  }
  if (
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.SQUARE_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PYRAMID
        ? 3
        : shape === SHAPES.SQUARE_PYRAMID
          ? 4
          : shape === SHAPES.PENTAGONAL_PYRAMID
            ? 5
            : 6
    const a = safe.a ?? 4
    const h = safe.h ?? 4
    const circumR = sides === 4 ? a / Math.SQRT2 : a / (2 * Math.sin(Math.PI / sides))
    return {
      type: 'cone',
      args: [circumR, h, sides],
      rotY: sides === 4 ? Math.PI / 4 : 0,
      offsetY: 0,
    }
  }
  const R = (safe.a ?? 4) / Math.SQRT2
  return { type: 'octahedron', args: [R, 0], rotY: 0, offsetY: 0 }
}

function ComponentSolidMesh({
  component,
  index,
  targetExplodedPos,
  isSelected,
  hasSelection,
  dimUnselected,
  showDimensions,
  shapeTitle,
  unit = 'cm',
  onSelectComponent,
  onRegisterSelectedGroup,
  isGizmoTarget,
}) {
  const groupRef = useRef(null)
  const spec = useMemo(
    () => getShapeGeometryProps(component.shape, component.dimensions),
    [component.shape, component.dimensions],
  )

  useEffect(() => {
    if (isGizmoTarget && groupRef.current) {
      onRegisterSelectedGroup(groupRef.current)
    }
  }, [isGizmoTarget, component.id, onRegisterSelectedGroup])

  // Smoothly interpolate towards exploded or assembled target position when not being actively dragged
  useFrame((_, delta) => {
    if (!groupRef.current || isGizmoTarget) return
    const speed = Math.min(1, delta * 10)
    groupRef.current.position.lerp(
      new THREE.Vector3(targetExplodedPos[0], targetExplodedPos[1], targetExplodedPos[2]),
      speed,
    )
  })

  const shouldDim = dimUnselected && hasSelection && !isSelected
  const opacity = shouldDim ? 0.34 : 0.94
  const edgeColor = isSelected ? '#facc15' : '#0f172a'

  const dimBadges = Object.entries(component.dimensions ?? {})
    .map(([k, v]) => `${k}=${fmtCompositeNum(v)}${unit}`)
    .join(' · ')

  return (
    <group
      ref={groupRef}
      position={targetExplodedPos}
      rotation={component.rotation ?? [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onSelectComponent?.(component.id)
      }}
    >
      {spec.type === 'hemisphere' ? (
        <group position={[0, spec.offsetY, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[spec.radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={component.color}
              transparent
              opacity={opacity}
              roughness={0.35}
              metalness={0.08}
              emissive={isSelected ? component.color : '#000000'}
              emissiveIntensity={isSelected ? 0.28 : 0}
            />
            <Edges threshold={18} color={edgeColor} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <circleGeometry args={[spec.radius, 48]} />
            <meshStandardMaterial
              color={component.color}
              side={THREE.DoubleSide}
              transparent
              opacity={opacity}
              roughness={0.42}
            />
          </mesh>
        </group>
      ) : (
        <mesh rotation={[0, spec.rotY, 0]} castShadow receiveShadow>
          {spec.type === 'box' && <boxGeometry args={spec.args} />}
          {spec.type === 'cylinder' && <cylinderGeometry args={spec.args} />}
          {spec.type === 'cone' && <coneGeometry args={spec.args} />}
          {spec.type === 'sphere' && <sphereGeometry args={spec.args} />}
          {spec.type === 'octahedron' && <octahedronGeometry args={spec.args} />}
          <meshStandardMaterial
            color={component.color}
            transparent
            opacity={opacity}
            roughness={0.36}
            metalness={0.08}
            emissive={isSelected ? component.color : '#000000'}
            emissiveIntensity={isSelected ? 0.25 : 0}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>
      )}

      {showDimensions && (
        <Html position={[0, 0.25, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-lg border border-slate-700/70 bg-slate-950/90 px-2 py-0.5 text-[10px] font-extrabold text-cyan-200 shadow-md">
            #{index + 1} {shapeTitle}: {dimBadges}
          </div>
        </Html>
      )}
    </group>
  )
}

function ContactInterfaceMarker({ contact }) {
  const [jx, jy, jz] = contact.jointCenter
  if (contact.orientation === 'horizontal' && contact.jointRadius) {
    return (
      <mesh position={[jx, jy + 0.01, jz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[contact.jointRadius, 48]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.52}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    )
  }
  if (contact.orientation === 'horizontal') {
    return (
      <mesh position={[jx, jy + 0.01, jz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[contact.width || 3, contact.depth || 3]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    )
  }
  if (contact.orientation === 'vertical_x') {
    return (
      <mesh position={[jx + 0.01, jy, jz]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[contact.width || 3, contact.height || 3]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.52}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    )
  }
  return (
    <mesh position={[jx, jy, jz + 0.01]}>
      <planeGeometry args={[contact.width || 3, contact.height || 3]} />
      <meshBasicMaterial
        color="#fbbf24"
        transparent
        opacity={0.52}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function CameraController({ controlsRef, resetTick, zoomStep, centroidY }) {
  const { camera } = useThree()
  const targetVec = useMemo(() => new THREE.Vector3(0, centroidY, 0), [centroidY])

  useEffect(() => {
    if (resetTick === 0) return
    camera.position.set(11, Math.max(8, centroidY + 5.5), 12.5)
    camera.lookAt(0, centroidY, 0)
    if (controlsRef.current) {
      controlsRef.current.target.copy(targetVec)
      controlsRef.current.update()
    }
  }, [resetTick, camera, controlsRef, targetVec, centroidY])

  useEffect(() => {
    if (!zoomStep || zoomStep.seq === 0 || !controlsRef.current) return
    const ctrl = controlsRef.current
    const offset = camera.position.clone().sub(ctrl.target)
    offset.multiplyScalar(zoomStep.factor)
    const dist = offset.length()
    if (dist > 3 && dist < 50) {
      camera.position.copy(ctrl.target).add(offset)
      ctrl.update()
    }
  }, [zoomStep, camera, controlsRef])

  return null
}

function CompositeScene({
  components,
  selectedId,
  highlightedComponentId,
  dimUnselected,
  explodeFactor,
  showDimensions,
  transformMode,
  enableGizmo,
  contactInterfaces,
  translations,
  unit,
  theme,
  resetTick,
  zoomStep,
  enableWheelZoom,
  onSelectComponent,
  onTransformComponent,
}) {
  const controlsRef = useRef(null)
  const [draggingGizmo, setDraggingGizmo] = useState(false)
  const [selectedGroupObj, setSelectedGroupObj] = useState(null)

  const handleRegisterSelectedGroup = useCallback((node) => {
    setSelectedGroupObj((prev) => (prev === node ? prev : node))
  }, [])

  const visibleComps = useMemo(
    () => components.filter((c) => c.visible !== false),
    [components],
  )
  const centroid = useMemo(() => getCompositeCentroid(visibleComps), [visibleComps])
  const activeHighlight = highlightedComponentId || selectedId
  const selectedComp = visibleComps.find((c) => c.id === selectedId) ?? null
  const gizmoActive = Boolean(enableGizmo && selectedComp && explodeFactor === 0)

  const isDark = theme === 'dark'

  const commitTransform = () => {
    if (!selectedComp || !selectedGroupObj) return
    const p = selectedGroupObj.position
    const r = selectedGroupObj.rotation
    onTransformComponent?.(
      selectedComp.id,
      [
        Math.round(p.x * 10) / 10,
        Math.round(p.y * 10) / 10,
        Math.round(p.z * 10) / 10,
      ],
      [
        Math.round(r.x * 100) / 100,
        Math.round(r.y * 100) / 100,
        Math.round(r.z * 100) / 100,
      ],
    )
  }

  return (
    <>
      <color attach="background" args={[isDark ? '#020617' : '#f1f5f9']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[12, 18, 10]} intensity={1.1} castShadow />
      <directionalLight position={[-10, 8, -10]} intensity={0.45} />

      {visibleComps.map((comp, idx) => {
        const targetPos = computeExplodedPosition(comp, centroid, explodeFactor)
        const isTargetGizmo = Boolean(gizmoActive && comp.id === selectedComp.id)
        return (
          <ComponentSolidMesh
            key={comp.id}
            component={comp}
            index={idx}
            targetExplodedPos={targetPos}
            isSelected={comp.id === activeHighlight}
            hasSelection={Boolean(activeHighlight)}
            dimUnselected={dimUnselected}
            showDimensions={showDimensions}
            shapeTitle={translations?.shapes?.[comp.shape] ?? comp.shape}
            unit={unit}
            onSelectComponent={onSelectComponent}
            onRegisterSelectedGroup={handleRegisterSelectedGroup}
            isGizmoTarget={isTargetGizmo}
          />
        )
      })}

      {/* Highlight joined internal contact planes (excluded from External SA) */}
      {explodeFactor <= 0.15 &&
        (contactInterfaces ?? []).map((joint) => (
          <ContactInterfaceMarker key={joint.id} contact={joint} />
        ))}

      {gizmoActive && selectedGroupObj && (
        <TransformControls
          key={`${selectedComp.id}_${transformMode}`}
          object={selectedGroupObj}
          mode={transformMode}
          size={0.85}
          onMouseDown={() => setDraggingGizmo(true)}
          onMouseUp={() => {
            setDraggingGizmo(false)
            commitTransform()
          }}
        />
      )}

      <Grid
        position={[0, -0.004, 0]}
        infiniteGrid
        side={THREE.DoubleSide}
        cellSize={1}
        cellThickness={0.5}
        cellColor={isDark ? '#1e293b' : '#cbd5e1'}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={isDark ? '#334155' : '#94a3b8'}
        fadeDistance={70}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!draggingGizmo}
        enableDamping
        enableZoom={enableWheelZoom}
        dampingFactor={0.08}
        target={[centroid[0], Math.max(1.5, centroid[1]), centroid[2]]}
        minDistance={3}
        maxDistance={45}
      />

      <CameraController
        controlsRef={controlsRef}
        resetTick={resetTick}
        zoomStep={zoomStep}
        centroidY={Math.max(1.5, centroid[1])}
      />
    </>
  )
}

/**
 * Interactive 3D Composite Solid Viewport built on NetFold's Three.js / R3F / drei stack.
 * Supports multi-component grouping, gizmo translation/rotation, orbit safety, explode view,
 * contact interface markers, component selection highlighting, and floating dimension labels.
 */
export default function CompositeBuilderCanvas3D({
  components = [],
  selectedId = null,
  highlightedComponentId = null,
  dimUnselected = true,
  explodeFactor = 0,
  showDimensions = true,
  transformMode = 'translate',
  enableGizmo = true,
  contactInterfaces = [],
  translations = {},
  unit = 'cm',
  theme = 'light',
  onSelectComponent,
  onTransformComponent,
}) {
  const [resetTick, setResetTick] = useState(0)
  const [zoomUnlocked, setZoomUnlocked] = useState(false)
  const [zoomStep, setZoomStep] = useState({ seq: 0, factor: 1 })
  const cc = translations.canvasControls ?? {
    lockZoom: 'Lock Wheel',
    unlockZoom: 'Unlock Zoom',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
  }

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-slate-100">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [11, 8.5, 12.5], fov: 42, near: 0.1, far: 250 }}
        onPointerMissed={() => onSelectComponent?.(null)}
      >
        <CompositeScene
          components={components}
          selectedId={selectedId}
          highlightedComponentId={highlightedComponentId}
          dimUnselected={dimUnselected}
          explodeFactor={explodeFactor}
          showDimensions={showDimensions}
          transformMode={transformMode}
          enableGizmo={enableGizmo}
          contactInterfaces={contactInterfaces}
          translations={translations}
          unit={unit}
          theme={theme}
          resetTick={resetTick}
          zoomStep={zoomStep}
          enableWheelZoom={zoomUnlocked}
          onSelectComponent={onSelectComponent}
          onTransformComponent={onTransformComponent}
        />
      </Canvas>

      <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setZoomStep((p) => ({ seq: p.seq + 1, factor: 0.84 }))}
          aria-label={cc.zoomIn}
          className="rounded-lg bg-white/90 px-2 py-1 text-xs font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-white cursor-pointer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoomStep((p) => ({ seq: p.seq + 1, factor: 1.18 }))}
          aria-label={cc.zoomOut}
          className="rounded-lg bg-white/90 px-2 py-1 text-xs font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-white cursor-pointer"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoomUnlocked((v) => !v)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 cursor-pointer ${
            zoomUnlocked
              ? 'bg-indigo-600 text-white ring-indigo-500'
              : 'bg-white/90 text-slate-800 ring-slate-200'
          }`}
        >
          {zoomUnlocked ? cc.lockZoom : cc.unlockZoom}
        </button>
        <button
          type="button"
          onClick={() => setResetTick((v) => v + 1)}
          className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-white cursor-pointer"
        >
          {translations.resetCamera ?? 'Reset View'}
        </button>
      </div>
    </div>
  )
}
