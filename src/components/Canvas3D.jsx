import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Grid, Line, OrbitControls } from '@react-three/drei'
import { SHAPES } from '../utils/mathEngine.js'
import { TRANSLATIONS } from '../data/translations.js'
import {
  CONE_PART_METADATA,
  CUBE_FACE_METADATA,
  CUBOID_FACE_METADATA,
  CYLINDER_PART_METADATA,
  FRUSTUM_PART_METADATA,
  HEMISPHERE_PART_METADATA,
  MULTI_FACE_PALETTE,
  PYRAMID_FACE_METADATA,
  SPHERE_PART_METADATA,
  buildCubeNetHingeTree,
  clampFoldProgress,
  createConeSectorGeometries,
  createCylinderWallGeometries,
  createFrustumWallGeometries,
  createRegularPolygonPlateGeometry,
  createTrianglePrismGeometry,
  foldProgressToRadians,
  getConeNetLayout,
  getCuboidNetLayout,
  getCylinderNetLayout,
  getFrustumNetLayout,
  getOctahedronNetLayout,
  getPolygonPrismNetLayout,
  getPolygonPyramidNetLayout,
  getRegularPolygonVerticesXZ,
  getSquarePyramidNetLayout,
  sampleFrustumWallPoint,
  updateConeSectorGeometries,
  updateCylinderWallGeometries,
  updateFrustumWallGeometries,
} from '../utils/netGeometry.js'

/**
 * Generates an offscreen 2D canvas with educational color, proportional grid
 * (or circular/triangular/spherical/sector guidelines), border trim, and high-contrast badge.
 */
function createFaceCanvas({
  label,
  sublabel,
  color,
  widthUnits = 1,
  heightUnits = 1,
  variant = 'rect', // 'rect' | 'circle' | 'triangle' | 'sector' | 'sphere'
}) {
  if (typeof document === 'undefined') {
    return null
  }

  const maxUnits = Math.max(widthUnits, heightUnits, 1)
  const basePx = 640
  const isSquareCanvas =
    variant === 'circle' ||
    variant === 'sphere' ||
    variant === 'sector' ||
    variant === 'polygon'
  const width = isSquareCanvas
    ? 512
    : Math.max(128, Math.round((widthUnits / maxUnits) * basePx))
  const height = isSquareCanvas
    ? 512
    : Math.max(128, Math.round((heightUnits / maxUnits) * basePx))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }

  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)

  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.min(width, height) * 0.08,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.7,
  )
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.16)')
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0.14)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (variant === 'circle') {
    const cx = width / 2
    const cy = height / 2
    const radius = width * 0.44

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.setLineDash([10, 8])
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + radius, cy)
    ctx.stroke()
    ctx.setLineDash([])
  } else if (variant === 'triangle') {
    // Slant height dashed altitude along center (x = width/2, bottom to top)
    ctx.setLineDash([10, 8])
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(width / 2, height)
    ctx.lineTo(width / 2, 0)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = 2
    const rows = 4
    for (let j = 1; j < rows; j += 1) {
      const y = (j / rows) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  } else if (variant === 'sector') {
    // Radial slant spokes and concentric arc bands
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 2
    for (let i = 1; i < 8; i += 1) {
      const x = (i / 8) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let j = 1; j < 4; j += 1) {
      const y = (j / 4) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  } else if (variant === 'sphere') {
    // Clean longitude / latitude meridian bands
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)'
    ctx.lineWidth = 2
    for (let i = 1; i < 8; i += 1) {
      const x = (i / 8) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let j = 1; j < 6; j += 1) {
      const y = (j / 6) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  } else if (variant === 'polygon') {
    const cx = width / 2
    const cy = height / 2
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(cx, cy, width * 0.24, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  } else {
    const cols = Math.max(1, Math.min(12, Math.round(widthUnits)))
    const rows = Math.max(1, Math.min(12, Math.round(heightUnits)))
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)'
    ctx.lineWidth = 2

    const stepX = width / cols
    for (let i = 1; i < cols; i += 1) {
      const x = Math.round(i * stepX) + 0.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    const stepY = height / rows
    for (let j = 1; j < rows; j += 1) {
      const y = Math.round(j * stepY) + 0.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.lineWidth = 8
    ctx.strokeRect(8, 8, width - 16, height - 16)
  }

  // Place badge slightly lower on triangles so it sits cleanly inside the wider base region
  const badgeCenterY = variant === 'triangle' ? height * 0.66 : height * 0.5
  const pillWidth = Math.min(
    variant === 'triangle' ? 220 : 280,
    width * (variant === 'triangle' ? 0.54 : 0.82),
  )
  const pillHeight = Math.min(104, height * 0.68)
  const pillX = (width - pillWidth) / 2
  const pillY = badgeCenterY - pillHeight / 2
  const cornerRadius = Math.min(24, pillHeight * 0.28)

  ctx.fillStyle = 'rgba(15, 23, 42, 0.56)'
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, cornerRadius)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  const titleSize = Math.max(16, Math.min(30, Math.round(pillHeight * 0.31)))
  const subSize = Math.max(13, Math.min(20, Math.round(pillHeight * 0.21)))
  const maxTextWidth = pillWidth - 18

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${titleSize}px system-ui, -apple-system, sans-serif`
  ctx.fillText(label, width / 2, badgeCenterY - pillHeight * 0.14, maxTextWidth)

  ctx.fillStyle = 'rgba(226, 232, 240, 0.94)'
  ctx.font = `600 ${subSize}px system-ui, -apple-system, sans-serif`
  ctx.fillText(sublabel, width / 2, badgeCenterY + pillHeight * 0.22, maxTextWidth)

  return canvas
}

function makeCanvasTexture(canvas, rotation = 0) {
  if (!canvas) return null
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  if (rotation !== 0) {
    texture.center.set(0.5, 0.5)
    texture.rotation = rotation
  }
  texture.needsUpdate = true
  return texture
}

function getFaceVisualState({
  faceId,
  isLateral,
  highlightMode,
  selectedFace,
  baseColor,
  edgeColor,
  opaqueFallback = 1,
}) {
  const isSelected = selectedFace === faceId

  if (isSelected) {
    return {
      opacity: highlightMode === 'volume' ? 0.88 : 1,
      transparent: highlightMode === 'volume',
      depthWrite: highlightMode !== 'volume',
      emissive: '#fde047',
      emissiveIntensity: 0.3,
      outlineColor: '#facc15',
      outlineWidth: 2.5,
      tint: '#ffffff',
      sideTint: edgeColor,
    }
  }

  if (highlightMode === 'lsa') {
    if (isLateral) {
      return {
        opacity: 1,
        transparent: false,
        depthWrite: true,
        emissive: baseColor,
        emissiveIntensity: 0.16,
        outlineColor: '#0f172a',
        outlineWidth: 1.75,
        tint: '#ffffff',
        sideTint: edgeColor,
      }
    }
    return {
      opacity: 0.22,
      transparent: true,
      depthWrite: false,
      emissive: '#000000',
      emissiveIntensity: 0,
      outlineColor: '#94a3b8',
      outlineWidth: 1.0,
      tint: '#cbd5e1',
      sideTint: '#cbd5e1',
    }
  }

  if (highlightMode === 'tsa') {
    return {
      opacity: 1,
      transparent: false,
      depthWrite: true,
      emissive: baseColor,
      emissiveIntensity: 0.16,
      outlineColor: '#0f172a',
      outlineWidth: 1.7,
      tint: '#ffffff',
      sideTint: edgeColor,
    }
  }

  if (highlightMode === 'volume') {
    return {
      opacity: 0.38,
      transparent: true,
      depthWrite: false,
      emissive: '#000000',
      emissiveIntensity: 0,
      outlineColor: '#334155',
      outlineWidth: 1.25,
      tint: '#ffffff',
      sideTint: edgeColor,
    }
  }

  return {
    opacity: opaqueFallback,
    transparent: opaqueFallback < 1,
    depthWrite: opaqueFallback === 1,
    emissive: '#000000',
    emissiveIntensity: 0,
    outlineColor: '#0f172a',
    outlineWidth: 1.35,
    tint: '#ffffff',
    sideTint: edgeColor,
  }
}

function RectangularFace({
  face,
  label,
  sublabel,
  width,
  depth,
  thickness,
  position = [0, 0, 0],
  isLateral,
  highlightMode,
  selectedFace,
  onSelectFace,
}) {
  const { innerTexture, outerTexture } = useMemo(() => {
    const innerCanvas = createFaceCanvas({
      label,
      sublabel,
      color: face.color,
      widthUnits: width,
      heightUnits: depth,
    })

    const isQuarterTurn =
      Math.abs(Math.abs(face.outerTextureRotation ?? 0) - Math.PI / 2) < 1e-4
    const outerCanvas = isQuarterTurn
      ? createFaceCanvas({
          label,
          sublabel,
          color: face.color,
          widthUnits: depth,
          heightUnits: width,
        })
      : innerCanvas

    return {
      innerTexture: makeCanvasTexture(innerCanvas, 0),
      outerTexture: makeCanvasTexture(
        outerCanvas,
        face.outerTextureRotation ?? 0,
      ),
    }
  }, [face, label, sublabel, width, depth])

  useEffect(() => {
    return () => {
      innerTexture?.dispose()
      outerTexture?.dispose()
    }
  }, [innerTexture, outerTexture])

  const visual = getFaceVisualState({
    faceId: face.id,
    isLateral,
    highlightMode,
    selectedFace,
    baseColor: face.color,
    edgeColor: face.edgeColor,
  })

  const sideMatProps = {
    color: visual.sideTint,
    roughness: 0.5,
    metalness: 0.08,
    transparent: visual.transparent,
    opacity: visual.opacity,
    depthWrite: visual.depthWrite,
  }

  return (
    <mesh
      position={position}
      castShadow={!visual.transparent}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta <= 5) {
          onSelectFace?.(face.id)
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <boxGeometry args={[width, thickness, depth]} />
      <meshStandardMaterial attach="material-0" {...sideMatProps} />
      <meshStandardMaterial attach="material-1" {...sideMatProps} />
      <meshStandardMaterial
        attach="material-2"
        map={innerTexture}
        color={innerTexture ? visual.tint : face.color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial
        attach="material-3"
        map={outerTexture}
        color={outerTexture ? visual.tint : face.color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial attach="material-4" {...sideMatProps} />
      <meshStandardMaterial attach="material-5" {...sideMatProps} />
      <Edges
        threshold={15}
        lineWidth={visual.outlineWidth}
        color={visual.outlineColor}
      />
    </mesh>
  )
}

function HingePin({ axis, length, thickness }) {
  const rotation =
    axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]

  return (
    <mesh rotation={rotation} castShadow>
      <cylinderGeometry
        args={[thickness * 0.36, thickness * 0.36, length * 0.96, 12]}
      />
      <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.45} />
    </mesh>
  )
}

function BoxVolumeFill({ l, b, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const inset = Math.min(0.03, Math.min(l, b, h) * 0.02)
  const fillW = Math.max(0.1, l - inset * 2)
  const fillD = Math.max(0.1, b - inset * 2)
  const fillH = Math.max(0.1, h - inset * 2)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      11,
      dt,
    )
    smoothedFillRef.current = next

    if (fillRef.current) {
      const clampedScale = Math.max(0.001, next)
      fillRef.current.scale.set(1, clampedScale, 1)
      fillRef.current.position.y = inset + (fillH * clampedScale) / 2
      fillRef.current.visible = next > 0.015
    }
  })

  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[fillW, fillH, fillD]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
        <Edges threshold={15} lineWidth={1.1} color="#0284c7" />
      </mesh>

      <mesh ref={fillRef} position={[0, h / 2, 0]}>
        <boxGeometry args={[fillW, fillH, fillD]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.22}
          transparent
          opacity={0.46}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function CylinderVolumeFill({ r, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const inset = Math.min(0.03, Math.min(r, h) * 0.02)
  const fillR = Math.max(0.1, r - inset)
  const fillH = Math.max(0.1, h - inset * 2)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      11,
      dt,
    )
    smoothedFillRef.current = next

    if (fillRef.current) {
      const clampedScale = Math.max(0.001, next)
      fillRef.current.scale.set(1, clampedScale, 1)
      fillRef.current.position.y = inset + (fillH * clampedScale) / 2
      fillRef.current.visible = next > 0.015
    }
  })

  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[fillR, fillR, fillH, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
        <Edges threshold={18} lineWidth={1.1} color="#0284c7" />
      </mesh>

      <mesh ref={fillRef} position={[0, h / 2, 0]}>
        <cylinderGeometry args={[fillR, fillR, fillH, 48]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.22}
          transparent
          opacity={0.46}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function BoxNet({
  l,
  b,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
}) {
  const layout = useMemo(() => getCuboidNetLayout(l, b, h), [l, b, h])
  const faceMap = useMemo(
    () =>
      Object.fromEntries(CUBOID_FACE_METADATA.map((face) => [face.id, face])),
    [],
  )

  const frontRef = useRef(null)
  const backRef = useRef(null)
  const topRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const smoothedAngleRef = useRef(foldProgressToRadians(foldProgress))

  const targetAngle = foldProgressToRadians(foldProgress)
  const { thickness, rootPosition, faces, hinges } = layout

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const angle = THREE.MathUtils.damp(
      smoothedAngleRef.current,
      targetAngle,
      11,
      dt,
    )
    smoothedAngleRef.current = angle

    if (frontRef.current) {
      frontRef.current.rotation.x = hinges.front.sign * angle
    }
    if (backRef.current) {
      backRef.current.rotation.x = hinges.back.sign * angle
    }
    if (topRef.current) {
      topRef.current.rotation.x = hinges.top.sign * angle
    }
    if (leftRef.current) {
      leftRef.current.rotation.z = hinges.left.sign * angle
    }
    if (rightRef.current) {
      rightRef.current.rotation.z = hinges.right.sign * angle
    }
  })

  const labelFor = (id) => faceNames?.[id] ?? id.toUpperCase()
  const sublabelFor = (face) => `${faceBadgePrefix} ${face.badge}`

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <BoxVolumeFill l={l} b={b} h={h} foldProgress={foldProgress} />
      )}

      <RectangularFace
        face={faceMap.bottom}
        label={labelFor('bottom')}
        sublabel={sublabelFor(faceMap.bottom)}
        width={faces.bottom.width}
        depth={faces.bottom.depth}
        thickness={thickness}
        position={[0, -thickness / 2, 0]}
        isLateral={false}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      <group ref={frontRef} position={hinges.front.position}>
        <HingePin axis="x" length={hinges.front.pinLength} thickness={thickness} />
        <RectangularFace
          face={faceMap.front}
          label={labelFor('front')}
          sublabel={sublabelFor(faceMap.front)}
          width={faces.front.width}
          depth={faces.front.depth}
          thickness={thickness}
          position={hinges.front.panelOffset}
          isLateral
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />
      </group>

      <group ref={backRef} position={hinges.back.position}>
        <HingePin axis="x" length={hinges.back.pinLength} thickness={thickness} />
        <RectangularFace
          face={faceMap.back}
          label={labelFor('back')}
          sublabel={sublabelFor(faceMap.back)}
          width={faces.back.width}
          depth={faces.back.depth}
          thickness={thickness}
          position={hinges.back.panelOffset}
          isLateral
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />

        <group ref={topRef} position={hinges.top.position}>
          <HingePin axis="x" length={hinges.top.pinLength} thickness={thickness} />
          <RectangularFace
            face={faceMap.top}
            label={labelFor('top')}
            sublabel={sublabelFor(faceMap.top)}
            width={faces.top.width}
            depth={faces.top.depth}
            thickness={thickness}
            position={hinges.top.panelOffset}
            isLateral={false}
            highlightMode={highlightMode}
            selectedFace={selectedFace}
            onSelectFace={onSelectFace}
          />
        </group>
      </group>

      <group ref={leftRef} position={hinges.left.position}>
        <HingePin axis="z" length={hinges.left.pinLength} thickness={thickness} />
        <RectangularFace
          face={faceMap.left}
          label={labelFor('left')}
          sublabel={sublabelFor(faceMap.left)}
          width={faces.left.width}
          depth={faces.left.depth}
          thickness={thickness}
          position={hinges.left.panelOffset}
          isLateral
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />
      </group>

      <group ref={rightRef} position={hinges.right.position}>
        <HingePin axis="z" length={hinges.right.pinLength} thickness={thickness} />
        <RectangularFace
          face={faceMap.right}
          label={labelFor('right')}
          sublabel={sublabelFor(faceMap.right)}
          width={faces.right.width}
          depth={faces.right.depth}
          thickness={thickness}
          position={hinges.right.panelOffset}
          isLateral
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />
      </group>
    </group>
  )
}

function CircularBaseCap({
  part,
  label,
  radius,
  thickness,
  position = [0, 0, 0],
  highlightMode,
  selectedFace,
  onSelectFace,
}) {
  const { innerTexture, outerTexture } = useMemo(() => {
    const canvas = createFaceCanvas({
      label,
      sublabel: part.badge,
      color: part.color,
      variant: 'circle',
    })

    return {
      innerTexture: makeCanvasTexture(canvas, Math.PI / 2),
      outerTexture: makeCanvasTexture(canvas, -Math.PI / 2),
    }
  }, [part, label])

  useEffect(() => {
    return () => {
      innerTexture?.dispose()
      outerTexture?.dispose()
    }
  }, [innerTexture, outerTexture])

  const visual = getFaceVisualState({
    faceId: part.id,
    isLateral: false,
    highlightMode,
    selectedFace,
    baseColor: part.color,
    edgeColor: part.edgeColor,
  })

  return (
    <mesh
      position={position}
      castShadow={!visual.transparent}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta <= 5) {
          onSelectFace?.(part.id)
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <cylinderGeometry args={[radius, radius, thickness, 64]} />
      <meshStandardMaterial
        attach="material-0"
        color={visual.sideTint}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.5}
        metalness={0.08}
      />
      <meshStandardMaterial
        attach="material-1"
        map={innerTexture}
        color={innerTexture ? visual.tint : part.color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial
        attach="material-2"
        map={outerTexture}
        color={outerTexture ? visual.tint : part.color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <Edges
        threshold={15}
        lineWidth={visual.outlineWidth}
        color={visual.outlineColor}
      />
    </mesh>
  )
}

function CylinderNet({
  r,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
}) {
  const layout = useMemo(() => getCylinderNetLayout(r, h), [r, h])
  const { circumference, thickness, rootPosition, hinges } = layout
  const segments = 64

  const wallHingeRef = useRef(null)
  const topHingeRef = useRef(null)
  const smoothedProgressRef = useRef(clampFoldProgress(foldProgress))
  const lastRenderedRef = useRef({ progress: null, wallGeometry: null })

  const { wallGeometry, borderGeometry } = useMemo(() => {
    const geos = createCylinderWallGeometries(segments)
    updateCylinderWallGeometries(
      geos.wallGeometry,
      geos.borderGeometry,
      layout.r,
      layout.h,
      layout.thickness,
      0,
      segments,
    )
    return geos
  }, [layout.r, layout.h, layout.thickness, segments])

  useEffect(() => {
    return () => {
      wallGeometry.dispose()
      borderGeometry.dispose()
    }
  }, [wallGeometry, borderGeometry])

  const lateralLabel = faceNames?.lateral ?? CYLINDER_PART_METADATA.lateral.label
  const bottomLabel = faceNames?.bottom ?? CYLINDER_PART_METADATA.bottom.label
  const topLabel = faceNames?.top ?? CYLINDER_PART_METADATA.top.label

  const { wallInnerTexture, wallOuterTexture } = useMemo(() => {
    const canvas = createFaceCanvas({
      label: lateralLabel,
      sublabel: CYLINDER_PART_METADATA.lateral.badge,
      color: CYLINDER_PART_METADATA.lateral.color,
      widthUnits: circumference,
      heightUnits: layout.h,
    })

    return {
      wallInnerTexture: makeCanvasTexture(canvas, 0),
      wallOuterTexture: makeCanvasTexture(canvas, 0),
    }
  }, [lateralLabel, circumference, layout.h])

  useEffect(() => {
    return () => {
      wallInnerTexture?.dispose()
      wallOuterTexture?.dispose()
    }
  }, [wallInnerTexture, wallOuterTexture])

  const targetProgress = clampFoldProgress(foldProgress)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const nextProgress = THREE.MathUtils.damp(
      smoothedProgressRef.current,
      targetProgress,
      11,
      dt,
    )
    smoothedProgressRef.current = nextProgress

    const angle = foldProgressToRadians(nextProgress)
    if (wallHingeRef.current) {
      wallHingeRef.current.rotation.x = hinges.wall.sign * angle
    }
    if (topHingeRef.current) {
      topHingeRef.current.rotation.x = hinges.topCap.sign * angle
    }

    if (
      lastRenderedRef.current.wallGeometry !== wallGeometry ||
      lastRenderedRef.current.progress === null ||
      Math.abs(nextProgress - lastRenderedRef.current.progress) > 1e-4
    ) {
      updateCylinderWallGeometries(
        wallGeometry,
        borderGeometry,
        layout.r,
        layout.h,
        layout.thickness,
        nextProgress,
        segments,
      )
      lastRenderedRef.current = { progress: nextProgress, wallGeometry }
    }
  })

  const wallVisual = getFaceVisualState({
    faceId: 'lateral',
    isLateral: true,
    highlightMode,
    selectedFace,
    baseColor: CYLINDER_PART_METADATA.lateral.color,
    edgeColor: CYLINDER_PART_METADATA.lateral.edgeColor,
  })

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <CylinderVolumeFill r={layout.r} h={layout.h} foldProgress={foldProgress} />
      )}

      <CircularBaseCap
        part={CYLINDER_PART_METADATA.bottom}
        label={bottomLabel}
        radius={layout.r}
        thickness={thickness}
        position={[0, -thickness / 2, 0]}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      <group ref={wallHingeRef} position={hinges.wall.position}>
        <HingePin axis="x" length={layout.r * 0.9} thickness={thickness} />
        <mesh
          geometry={wallGeometry}
          castShadow={!wallVisual.transparent}
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            if (e.delta <= 5) {
              onSelectFace?.('lateral')
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <meshStandardMaterial
            attach="material-0"
            map={wallInnerTexture}
            color={
              wallInnerTexture
                ? wallVisual.tint
                : CYLINDER_PART_METADATA.lateral.color
            }
            emissive={wallVisual.emissive}
            emissiveIntensity={wallVisual.emissiveIntensity}
            transparent={wallVisual.transparent}
            opacity={wallVisual.opacity}
            depthWrite={wallVisual.depthWrite}
            roughness={0.42}
            metalness={0.05}
          />
          <meshStandardMaterial
            attach="material-1"
            map={wallOuterTexture}
            color={
              wallOuterTexture
                ? wallVisual.tint
                : CYLINDER_PART_METADATA.lateral.color
            }
            emissive={wallVisual.emissive}
            emissiveIntensity={wallVisual.emissiveIntensity}
            transparent={wallVisual.transparent}
            opacity={wallVisual.opacity}
            depthWrite={wallVisual.depthWrite}
            roughness={0.42}
            metalness={0.05}
          />
          <meshStandardMaterial
            attach="material-2"
            color={wallVisual.sideTint}
            transparent={wallVisual.transparent}
            opacity={wallVisual.opacity}
            depthWrite={wallVisual.depthWrite}
            roughness={0.5}
            metalness={0.08}
          />
        </mesh>

        <lineSegments geometry={borderGeometry}>
          <lineBasicMaterial color={wallVisual.outlineColor} />
        </lineSegments>

        <group ref={topHingeRef} position={hinges.topCap.position}>
          <HingePin axis="x" length={layout.r * 0.9} thickness={thickness} />
          <CircularBaseCap
            part={CYLINDER_PART_METADATA.top}
            label={topLabel}
            radius={layout.r}
            thickness={thickness}
            position={hinges.topCap.capOffset}
            highlightMode={highlightMode}
            selectedFace={selectedFace}
            onSelectFace={onSelectFace}
          />
        </group>
      </group>
    </group>
  )
}

function ConeVolumeFill({ r, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const inset = Math.min(0.03, Math.min(r, h) * 0.02)
  const fillR = Math.max(0.1, r - inset)
  const fillH = Math.max(0.1, h - inset * 2)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      11,
      dt,
    )
    smoothedFillRef.current = next

    if (fillRef.current) {
      const clampedScale = Math.max(0.001, next)
      fillRef.current.scale.set(clampedScale, clampedScale, clampedScale)
      fillRef.current.position.y = inset + (fillH * clampedScale) / 2
      fillRef.current.visible = next > 0.02
    }
  })

  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <coneGeometry args={[fillR, fillH, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
        <Edges threshold={20} lineWidth={1.1} color="#0284c7" />
      </mesh>

      <mesh ref={fillRef} position={[0, h / 2, 0]}>
        <coneGeometry args={[fillR, fillH, 48]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.24}
          transparent
          opacity={0.48}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function ConeNet({
  r,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
}) {
  const layout = useMemo(() => getConeNetLayout(r, h), [r, h])
  const { thickness, rootPosition, slantHeight } = layout
  const arcSegments = 48
  const radialSegments = 6

  const smoothedProgressRef = useRef(clampFoldProgress(foldProgress))
  const lastRenderedRef = useRef({ progress: null, sectorGeometry: null })

  const { sectorGeometry, borderGeometry } = useMemo(() => {
    const geos = createConeSectorGeometries(arcSegments, radialSegments)
    updateConeSectorGeometries(
      geos.sectorGeometry,
      geos.borderGeometry,
      layout.r,
      layout.h,
      layout.thickness,
      0,
      arcSegments,
      radialSegments,
    )
    return geos
  }, [layout.r, layout.h, layout.thickness])

  useEffect(() => {
    return () => {
      sectorGeometry.dispose()
      borderGeometry.dispose()
    }
  }, [sectorGeometry, borderGeometry])

  const bottomLabel = faceNames?.bottom ?? CONE_PART_METADATA.bottom.label
  const lateralLabel = faceNames?.lateral ?? CONE_PART_METADATA.lateral.label

  const { sectorInnerTexture, sectorOuterTexture } = useMemo(() => {
    const canvas = createFaceCanvas({
      label: lateralLabel,
      sublabel: CONE_PART_METADATA.lateral.badge,
      color: CONE_PART_METADATA.lateral.color,
      variant: 'sector',
    })

    return {
      sectorInnerTexture: makeCanvasTexture(canvas, 0),
      sectorOuterTexture: makeCanvasTexture(canvas, 0),
    }
  }, [lateralLabel])

  useEffect(() => {
    return () => {
      sectorInnerTexture?.dispose()
      sectorOuterTexture?.dispose()
    }
  }, [sectorInnerTexture, sectorOuterTexture])

  const targetProgress = clampFoldProgress(foldProgress)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const nextProgress = THREE.MathUtils.damp(
      smoothedProgressRef.current,
      targetProgress,
      11,
      dt,
    )
    smoothedProgressRef.current = nextProgress

    if (
      lastRenderedRef.current.sectorGeometry !== sectorGeometry ||
      lastRenderedRef.current.progress === null ||
      Math.abs(nextProgress - lastRenderedRef.current.progress) > 1e-4
    ) {
      updateConeSectorGeometries(
        sectorGeometry,
        borderGeometry,
        layout.r,
        layout.h,
        layout.thickness,
        nextProgress,
        arcSegments,
        radialSegments,
      )
      lastRenderedRef.current = { progress: nextProgress, sectorGeometry }
    }
  })

  const wallVisual = getFaceVisualState({
    faceId: 'lateral',
    isLateral: true,
    highlightMode,
    selectedFace,
    baseColor: CONE_PART_METADATA.lateral.color,
    edgeColor: CONE_PART_METADATA.lateral.edgeColor,
  })

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <ConeVolumeFill r={layout.r} h={layout.h} foldProgress={foldProgress} />
      )}

      {/* Circular base with radius line */}
      <CircularBaseCap
        part={CONE_PART_METADATA.bottom}
        label={bottomLabel}
        radius={layout.r}
        thickness={thickness}
        position={[0, -thickness / 2, 0]}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      {/* Base radius guide r, vertical height guide h, and slant height guide l */}
      <Line
        points={[
          [0, 0.015, 0],
          [layout.r, 0.015, 0],
        ]}
        color="#f59e0b"
        lineWidth={2.5}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, layout.h, 0],
        ]}
        color="#0284c7"
        lineWidth={2}
        dashed
        dashSize={0.22}
        gapSize={0.14}
      />
      <mesh position={[0, layout.h, 0]}>
        <sphereGeometry args={[Math.max(0.06, slantHeight * 0.018), 16, 16]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>
      {foldProgress >= 85 && (
        <Line
          points={[
            [layout.r + 0.02, 0.02, 0],
            [0, layout.h + 0.02, 0],
          ]}
          color="#e11d48"
          lineWidth={2.5}
        />
      )}

      {/* Tangent hinge pin at (0, 0, -r) */}
      <group position={[0, 0, -layout.r]}>
        <HingePin axis="x" length={layout.r * 0.9} thickness={thickness} />
      </group>

      {/* Deforming circular sector net */}
      <mesh
        geometry={sectorGeometry}
        castShadow={!wallVisual.transparent}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta <= 5) {
            onSelectFace?.('lateral')
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <meshStandardMaterial
          attach="material-0"
          map={sectorInnerTexture}
          color={
            sectorInnerTexture
              ? wallVisual.tint
              : CONE_PART_METADATA.lateral.color
          }
          emissive={wallVisual.emissive}
          emissiveIntensity={wallVisual.emissiveIntensity}
          transparent={wallVisual.transparent}
          opacity={wallVisual.opacity}
          depthWrite={wallVisual.depthWrite}
          roughness={0.42}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-1"
          map={sectorOuterTexture}
          color={
            sectorOuterTexture
              ? wallVisual.tint
              : CONE_PART_METADATA.lateral.color
          }
          emissive={wallVisual.emissive}
          emissiveIntensity={wallVisual.emissiveIntensity}
          transparent={wallVisual.transparent}
          opacity={wallVisual.opacity}
          depthWrite={wallVisual.depthWrite}
          roughness={0.42}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-2"
          color={wallVisual.sideTint}
          transparent={wallVisual.transparent}
          opacity={wallVisual.opacity}
          depthWrite={wallVisual.depthWrite}
          roughness={0.5}
          metalness={0.08}
        />
      </mesh>

      <lineSegments geometry={borderGeometry}>
        <lineBasicMaterial color={wallVisual.outlineColor} />
      </lineSegments>
    </group>
  )
}

function PyramidVolumeFill({ a, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const inset = Math.min(0.03, Math.min(a, h) * 0.02)
  // 4-sided cone rotated 45° gives an axis-aligned square base of side a
  const fillR = Math.max(0.1, (a - inset * 2) / Math.SQRT2)
  const fillH = Math.max(0.1, h - inset * 2)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      11,
      dt,
    )
    smoothedFillRef.current = next

    if (fillRef.current) {
      const clampedScale = Math.max(0.001, next)
      fillRef.current.scale.set(clampedScale, clampedScale, clampedScale)
      fillRef.current.position.y = inset + (fillH * clampedScale) / 2
      fillRef.current.visible = next > 0.02
    }
  })

  return (
    <group>
      <mesh position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[fillR, fillH, 4]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
        <Edges threshold={15} lineWidth={1.1} color="#0284c7" />
      </mesh>

      <mesh ref={fillRef} position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[fillR, fillH, 4]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.24}
          transparent
          opacity={0.48}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function PyramidTriangleFace({
  face,
  label,
  sublabel,
  baseWidth,
  slantHeight,
  geometry,
  highlightMode,
  selectedFace,
  onSelectFace,
}) {
  const { innerTexture, outerTexture } = useMemo(() => {
    const canvas = createFaceCanvas({
      label,
      sublabel,
      color: face.color,
      widthUnits: baseWidth,
      heightUnits: slantHeight,
      variant: 'triangle',
    })

    return {
      innerTexture: makeCanvasTexture(canvas, 0),
      outerTexture: makeCanvasTexture(canvas, 0),
    }
  }, [face, label, sublabel, baseWidth, slantHeight])

  useEffect(() => {
    return () => {
      innerTexture?.dispose()
      outerTexture?.dispose()
    }
  }, [innerTexture, outerTexture])

  const visual = getFaceVisualState({
    faceId: face.id,
    isLateral: true,
    highlightMode,
    selectedFace,
    baseColor: face.color,
    edgeColor: face.edgeColor,
  })

  return (
    <mesh
      geometry={geometry}
      castShadow={!visual.transparent}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta <= 5) {
          onSelectFace?.(face.id)
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <meshStandardMaterial
        attach="material-0"
        map={innerTexture}
        color={innerTexture ? visual.tint : face.color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial
        attach="material-1"
        map={outerTexture}
        color={outerTexture ? visual.tint : face.color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial
        attach="material-2"
        color={visual.sideTint}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.5}
        metalness={0.08}
      />
      <Edges
        threshold={15}
        lineWidth={visual.outlineWidth}
        color={visual.outlineColor}
      />
    </mesh>
  )
}

function SquarePyramidNet({
  a,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
}) {
  const layout = useMemo(() => getSquarePyramidNetLayout(a, h), [a, h])
  const { thickness, rootPosition, slantHeight, maxFoldAngle, hingeDistance } =
    layout

  const triangleGeometry = useMemo(
    () => createTrianglePrismGeometry(layout.a, slantHeight, thickness),
    [layout.a, slantHeight, thickness],
  )

  useEffect(() => {
    return () => {
      triangleGeometry.dispose()
    }
  }, [triangleGeometry])

  const baseFace = PYRAMID_FACE_METADATA[0]
  const sideFaces = useMemo(() => PYRAMID_FACE_METADATA.slice(1), [])

  const hingeRefs = useRef({})
  const smoothedAngleRef = useRef(
    (clampFoldProgress(foldProgress) / 100) * maxFoldAngle,
  )
  const targetAngle = (clampFoldProgress(foldProgress) / 100) * maxFoldAngle

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const angle = THREE.MathUtils.damp(
      smoothedAngleRef.current,
      targetAngle,
      11,
      dt,
    )
    smoothedAngleRef.current = angle

    for (const side of sideFaces) {
      const node = hingeRefs.current[side.id]
      if (node) {
        node.rotation.x = -angle
      }
    }
  })

  const labelFor = (id, fallback) => faceNames?.[id] ?? fallback

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <PyramidVolumeFill a={layout.a} h={layout.h} foldProgress={foldProgress} />
      )}

      {/* Square base */}
      <RectangularFace
        face={baseFace}
        label={labelFor('bottom', baseFace.label)}
        sublabel={baseFace.badge}
        width={layout.a}
        depth={layout.a}
        thickness={thickness}
        position={[0, -thickness / 2, 0]}
        isLateral={false}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      {/* Vertical height axis guide (h) */}
      <Line
        points={[
          [0, 0, 0],
          [0, layout.h, 0],
        ]}
        color="#0284c7"
        lineWidth={2}
        dashed
        dashSize={0.22}
        gapSize={0.14}
      />
      <mesh position={[0, layout.h, 0]}>
        <sphereGeometry args={[Math.max(0.06, slantHeight * 0.018), 16, 16]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>

      {/* Four triangular lateral faces around the 4 base edges */}
      {sideFaces.map((side) => (
        <group key={side.id} rotation={[0, side.rotY, 0]}>
          <group
            ref={(el) => {
              hingeRefs.current[side.id] = el
            }}
            position={[0, 0, hingeDistance]}
          >
            <HingePin axis="x" length={layout.a} thickness={thickness} />
            <PyramidTriangleFace
              face={side}
              label={labelFor(side.id, side.label)}
              sublabel={side.badge}
              baseWidth={layout.a}
              slantHeight={slantHeight}
              geometry={triangleGeometry}
              highlightMode={highlightMode}
              selectedFace={selectedFace}
              onSelectFace={onSelectFace}
            />
            {side.id === 'front' && (
              <Line
                points={[
                  [0, 0.015, 0],
                  [0, 0.015, slantHeight],
                ]}
                color="#e11d48"
                lineWidth={2.4}
              />
            )}
          </group>
        </group>
      ))}
    </group>
  )
}

function SphereModel({
  r,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
}) {
  const radius = typeof r === 'number' && Number.isFinite(r) && r > 0 ? r : 4
  const spinRef = useRef(null)
  const part = SPHERE_PART_METADATA.surface
  const surfaceLabel = faceNames?.surface ?? part.label

  const sphereTexture = useMemo(() => {
    const canvas = createFaceCanvas({
      label: surfaceLabel,
      sublabel: part.badge,
      color: part.color,
      variant: 'sphere',
    })
    return makeCanvasTexture(canvas, 0)
  }, [surfaceLabel, part])

  useEffect(() => {
    return () => {
      sphereTexture?.dispose()
    }
  }, [sphereTexture])

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += Math.min(delta, 0.1) * 0.32
    }
  })

  // Note: LSA is N/A for sphere, so treat 'lsa' identically to normal 'all'
  const effectiveMode = highlightMode === 'lsa' ? 'all' : highlightMode
  const visual = getFaceVisualState({
    faceId: 'surface',
    isLateral: false,
    highlightMode: effectiveMode,
    selectedFace,
    baseColor: part.color,
    edgeColor: part.edgeColor,
    opaqueFallback: 0.86,
  })

  return (
    <group position={[0, radius, 0]}>
      <group ref={spinRef}>
        {/* Outer sphere surface */}
        <mesh
          castShadow={effectiveMode === 'tsa'}
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            if (e.delta <= 5) {
              onSelectFace?.('surface')
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <sphereGeometry args={[radius, 48, 32]} />
          <meshStandardMaterial
            map={sphereTexture}
            color={sphereTexture ? visual.tint : part.color}
            emissive={visual.emissive}
            emissiveIntensity={visual.emissiveIntensity}
            transparent={visual.transparent}
            opacity={visual.opacity}
            depthWrite={visual.depthWrite}
            roughness={0.35}
            metalness={0.08}
          />
        </mesh>

        {/* Equatorial ring highlighting radius circle */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[radius + 0.008, Math.max(0.025, radius * 0.012), 12, 64]}
          />
          <meshStandardMaterial
            color={selectedFace === 'surface' ? '#facc15' : '#1e293b'}
            roughness={0.4}
          />
        </mesh>

        {/* Center dot & radius (r) rod visible inside sphere */}
        <mesh>
          <sphereGeometry args={[Math.max(0.08, radius * 0.035), 16, 16]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <Line
          points={[
            [0, 0, 0],
            [radius, 0, 0],
          ]}
          color="#f59e0b"
          lineWidth={3}
        />
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[Math.max(0.06, radius * 0.026), 12, 12]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* Volume mode glowing inner solid fill */}
      {effectiveMode === 'volume' && (
        <mesh>
          <sphereGeometry args={[radius * 0.94, 48, 32]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.28}
            transparent
            opacity={0.56}
            roughness={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

function PolygonFace({
  faceId,
  geometry,
  label,
  sublabel,
  color,
  edgeColor,
  isLateral = false,
  highlightMode,
  selectedFace,
  onSelectFace,
}) {
  const { innerTexture, outerTexture } = useMemo(() => {
    const canvas = createFaceCanvas({
      label,
      sublabel,
      color,
      variant: 'polygon',
    })
    return {
      innerTexture: makeCanvasTexture(canvas, 0),
      outerTexture: makeCanvasTexture(canvas, 0),
    }
  }, [label, sublabel, color])

  useEffect(() => {
    return () => {
      innerTexture?.dispose()
      outerTexture?.dispose()
    }
  }, [innerTexture, outerTexture])

  const visual = getFaceVisualState({
    faceId,
    isLateral,
    highlightMode,
    selectedFace,
    baseColor: color,
    edgeColor,
  })

  return (
    <mesh
      geometry={geometry}
      castShadow={!visual.transparent}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta <= 5) {
          onSelectFace?.(faceId)
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <meshStandardMaterial
        attach="material-0"
        map={innerTexture}
        color={innerTexture ? visual.tint : color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial
        attach="material-1"
        map={outerTexture}
        color={outerTexture ? visual.tint : color}
        emissive={visual.emissive}
        emissiveIntensity={visual.emissiveIntensity}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.42}
        metalness={0.05}
      />
      <meshStandardMaterial
        attach="material-2"
        color={visual.sideTint}
        transparent={visual.transparent}
        opacity={visual.opacity}
        depthWrite={visual.depthWrite}
        roughness={0.5}
        metalness={0.08}
      />
      <Edges
        threshold={15}
        lineWidth={visual.outlineWidth}
        color={visual.outlineColor}
      />
    </mesh>
  )
}

function PolygonPrismVolumeFill({ sides, a, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const inset = Math.min(0.03, Math.min(a, h) * 0.02)
  const fillSide = Math.max(0.1, a - inset * 2)
  const fillH = Math.max(0.1, h - inset * 2)

  const volumeGeo = useMemo(() => {
    const geo = createRegularPolygonPlateGeometry(sides, fillSide, fillH, false)
    geo.translate(0, fillH, 0)
    return geo
  }, [sides, fillSide, fillH])

  useEffect(() => {
    return () => {
      volumeGeo.dispose()
    }
  }, [volumeGeo])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      10,
      dt,
    )
    smoothedFillRef.current = next
    if (fillRef.current) {
      fillRef.current.scale.y = Math.max(0.001, next)
      fillRef.current.visible = next > 0.02
    }
  })

  return (
    <group ref={fillRef} position={[0, inset, 0]}>
      <mesh geometry={volumeGeo}>
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.28}
          transparent
          opacity={0.56}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function PolygonPrismNet({
  sides,
  a,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
}) {
  const layout = useMemo(() => getPolygonPrismNetLayout(sides, a, h), [sides, a, h])
  const { thickness, rootPosition, sideEdges } = layout

  const baseGeo = useMemo(
    () => createRegularPolygonPlateGeometry(sides, layout.a, thickness, false),
    [sides, layout.a, thickness],
  )
  const topGeo = useMemo(
    () => createRegularPolygonPlateGeometry(sides, layout.a, thickness, true),
    [sides, layout.a, thickness],
  )

  useEffect(() => {
    return () => {
      baseGeo.dispose()
      topGeo.dispose()
    }
  }, [baseGeo, topGeo])

  const hingeRefs = useRef({})
  const topHingeRef = useRef(null)
  const smoothedAngleRef = useRef(foldProgressToRadians(foldProgress))
  const targetAngle = foldProgressToRadians(foldProgress)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const angle = THREE.MathUtils.damp(
      smoothedAngleRef.current,
      targetAngle,
      11,
      dt,
    )
    smoothedAngleRef.current = angle
    sideEdges.forEach((edge) => {
      const node = hingeRefs.current[edge.id]
      if (node) {
        node.rotation.x = -angle
      }
    })
    if (topHingeRef.current) {
      topHingeRef.current.rotation.x = -angle
    }
  })

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <PolygonPrismVolumeFill
          sides={sides}
          a={layout.a}
          h={layout.h}
          foldProgress={foldProgress}
        />
      )}

      {/* Vertical height guide h */}
      <Line
        points={[
          [0, 0, 0],
          [0, layout.h, 0],
        ]}
        color="#0284c7"
        lineWidth={2}
        dashed
        dashSize={0.22}
        gapSize={0.14}
      />

      <PolygonFace
        faceId="bottom"
        geometry={baseGeo}
        label={faceNames?.bottom ?? 'Base'}
        sublabel={`${faceBadgePrefix} B`}
        color="#3b82f6"
        edgeColor="#1d4ed8"
        isLateral={false}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      {sideEdges.map((edge, idx) => {
        const palette = MULTI_FACE_PALETTE[idx % MULTI_FACE_PALETTE.length]
        const wallLabel = faceNames?.[edge.id] ?? `${faceBadgePrefix} ${idx + 1}`

        return (
          <group key={edge.id} rotation={[0, edge.rotY, 0]}>
            <group
              ref={(el) => {
                hingeRefs.current[edge.id] = el
              }}
              position={[0, 0, edge.hingeDistance]}
            >
              <HingePin axis="x" length={layout.a * 0.9} thickness={thickness} />
              <RectangularFace
                face={{
                  id: edge.id,
                  color: palette.color,
                  edgeColor: palette.edgeColor,
                  badge: String(idx + 1),
                }}
                label={wallLabel}
                sublabel={`${faceBadgePrefix} ${idx + 1}`}
                width={layout.a}
                depth={layout.h}
                thickness={thickness}
                position={[0, -thickness / 2, layout.h / 2]}
                isLateral={true}
                highlightMode={highlightMode}
                selectedFace={selectedFace}
                onSelectFace={onSelectFace}
              />

              {idx === 0 && (
                <group ref={topHingeRef} position={[0, 0, layout.h]}>
                  <HingePin
                    axis="x"
                    length={layout.a * 0.9}
                    thickness={thickness}
                  />
                  <PolygonFace
                    faceId="top"
                    geometry={topGeo}
                    label={faceNames?.top ?? 'Top'}
                    sublabel={`${faceBadgePrefix} T`}
                    color="#f43f5e"
                    edgeColor="#be123c"
                    isLateral={false}
                    highlightMode={highlightMode}
                    selectedFace={selectedFace}
                    onSelectFace={onSelectFace}
                  />
                </group>
              )}
            </group>
          </group>
        )
      })}
    </group>
  )
}

function PolygonPyramidVolumeFill({ sides, a, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const insetFactor = 0.94
  const fillSide = Math.max(0.1, a * insetFactor)
  const fillH = Math.max(0.1, h * insetFactor)
  const yBase = (h - fillH) * 0.35

  const volumeGeo = useMemo(() => {
    const verts = getRegularPolygonVerticesXZ(sides, fillSide)
    const coords = []
    for (let i = 0; i < verts.length; i += 1) {
      const v0 = verts[i]
      const v1 = verts[(i + 1) % verts.length]
      // Base triangle
      coords.push(0, 0, 0, v0.x, 0, v0.z, v1.x, 0, v1.z)
      // Side triangle to apex
      coords.push(v0.x, 0, v0.z, 0, fillH, 0, v1.x, 0, v1.z)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3))
    geo.computeVertexNormals()
    return geo
  }, [sides, fillSide, fillH])

  useEffect(() => {
    return () => {
      volumeGeo.dispose()
    }
  }, [volumeGeo])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      10,
      dt,
    )
    smoothedFillRef.current = next
    if (fillRef.current) {
      fillRef.current.scale.y = Math.max(0.001, next)
      fillRef.current.visible = next > 0.02
    }
  })

  return (
    <group ref={fillRef} position={[0, yBase, 0]}>
      <mesh geometry={volumeGeo}>
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.28}
          transparent
          opacity={0.56}
          roughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function PolygonPyramidNet({
  sides,
  a,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
}) {
  const layout = useMemo(
    () => getPolygonPyramidNetLayout(sides, a, h),
    [sides, a, h],
  )
  const { thickness, rootPosition, slantHeight, maxFoldAngle, hingeDistance, sideEdges } =
    layout

  const baseGeo = useMemo(
    () => createRegularPolygonPlateGeometry(sides, layout.a, thickness, false),
    [sides, layout.a, thickness],
  )
  const triangleGeo = useMemo(
    () => createTrianglePrismGeometry(layout.a, slantHeight, thickness),
    [layout.a, slantHeight, thickness],
  )

  useEffect(() => {
    return () => {
      baseGeo.dispose()
      triangleGeo.dispose()
    }
  }, [baseGeo, triangleGeo])

  const hingeRefs = useRef({})
  const smoothedAngleRef = useRef(
    (clampFoldProgress(foldProgress) / 100) * maxFoldAngle,
  )
  const targetAngle = (clampFoldProgress(foldProgress) / 100) * maxFoldAngle

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const angle = THREE.MathUtils.damp(
      smoothedAngleRef.current,
      targetAngle,
      11,
      dt,
    )
    smoothedAngleRef.current = angle
    sideEdges.forEach((edge) => {
      const node = hingeRefs.current[edge.id]
      if (node) {
        node.rotation.x = -angle
      }
    })
  })

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <PolygonPyramidVolumeFill
          sides={sides}
          a={layout.a}
          h={layout.h}
          foldProgress={foldProgress}
        />
      )}

      {/* Vertical height guide h and slant height guide s */}
      <Line
        points={[
          [0, 0, 0],
          [0, layout.h, 0],
        ]}
        color="#0284c7"
        lineWidth={2}
        dashed
        dashSize={0.22}
        gapSize={0.14}
      />
      <mesh position={[0, layout.h, 0]}>
        <sphereGeometry args={[Math.max(0.06, slantHeight * 0.018), 16, 16]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>
      {foldProgress >= 85 && (
        <Line
          points={[
            [0, 0.02, -layout.apothem - 0.02],
            [0, layout.h + 0.02, 0],
          ]}
          color="#e11d48"
          lineWidth={2.5}
        />
      )}

      <PolygonFace
        faceId="bottom"
        geometry={baseGeo}
        label={faceNames?.bottom ?? 'Base'}
        sublabel={`${faceBadgePrefix} B`}
        color="#3b82f6"
        edgeColor="#1d4ed8"
        isLateral={false}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      {sideEdges.map((edge, idx) => {
        const palette = MULTI_FACE_PALETTE[idx % MULTI_FACE_PALETTE.length]
        const label = faceNames?.[edge.id] ?? `${faceBadgePrefix} ${idx + 1}`

        return (
          <group key={edge.id} rotation={[0, edge.rotY, 0]}>
            <group
              ref={(el) => {
                hingeRefs.current[edge.id] = el
              }}
              position={[0, 0, hingeDistance]}
            >
              <HingePin axis="x" length={layout.a * 0.85} thickness={thickness} />
              <PyramidTriangleFace
                face={{
                  id: edge.id,
                  color: palette.color,
                  edgeColor: palette.edgeColor,
                  badge: String(idx + 1),
                }}
                label={label}
                sublabel={`${faceBadgePrefix} ${idx + 1}`}
                geometry={triangleGeo}
                highlightMode={highlightMode}
                selectedFace={selectedFace}
                onSelectFace={onSelectFace}
              />
            </group>
          </group>
        )
      })}
    </group>
  )
}

function OctahedronVolumeFill({ a, solidHeight, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const s = 0.94

  const volumeGeo = useMemo(() => {
    const verts = getRegularPolygonVerticesXZ(3, a * s)
    const yLo = ((1 - s) * solidHeight) / 2
    const yHi = solidHeight - yLo
    const b0 = [verts[0].x, yLo, verts[0].z]
    const b1 = [verts[1].x, yLo, verts[1].z]
    const b2 = [verts[2].x, yLo, verts[2].z]
    const t0 = [-verts[0].x, yHi, -verts[0].z]
    const t1 = [-verts[1].x, yHi, -verts[1].z]
    const t2 = [-verts[2].x, yHi, -verts[2].z]

    const coords = [
      ...b0, ...b1, ...b2,
      ...t0, ...t1, ...t2,
      ...b0, ...b1, ...t2,
      ...b1, ...b2, ...t0,
      ...b2, ...b0, ...t1,
      ...t0, ...t1, ...b2,
      ...t1, ...t2, ...b0,
      ...t2, ...t0, ...b1,
    ]
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3))
    geo.computeVertexNormals()
    return geo
  }, [a, solidHeight])

  useEffect(() => {
    return () => {
      volumeGeo.dispose()
    }
  }, [volumeGeo])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      10,
      dt,
    )
    smoothedFillRef.current = next
    if (fillRef.current) {
      fillRef.current.scale.y = Math.max(0.001, next)
      fillRef.current.visible = next > 0.02
    }
  })

  return (
    <group ref={fillRef} position={[0, 0, 0]}>
      <mesh geometry={volumeGeo}>
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.28}
          transparent
          opacity={0.56}
          roughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function OctahedronNet({
  a,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
}) {
  const layout = useMemo(() => getOctahedronNetLayout(a), [a])
  const {
    apothem,
    triangleHeight,
    solidHeight,
    thickness,
    maxFoldAngle,
    rootPosition,
    lowerEdgeRots,
  } = layout

  const baseGeo = useMemo(
    () => createRegularPolygonPlateGeometry(3, layout.a, thickness, false),
    [layout.a, thickness],
  )
  const triGeo = useMemo(
    () => createTrianglePrismGeometry(layout.a, triangleHeight, thickness),
    [layout.a, triangleHeight, thickness],
  )

  useEffect(() => {
    return () => {
      baseGeo.dispose()
      triGeo.dispose()
    }
  }, [baseGeo, triGeo])

  // Note: LSA is N/A for regular octahedron (all 8 equilateral faces are identical)
  const effectiveMode = highlightMode === 'lsa' ? 'all' : highlightMode

  const lowerRefs = useRef([])
  const upperRefs = useRef([])
  const topRef = useRef(null)
  const smoothedAngleRef = useRef(
    (clampFoldProgress(foldProgress) / 100) * maxFoldAngle,
  )
  const targetAngle = (clampFoldProgress(foldProgress) / 100) * maxFoldAngle

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const angle = THREE.MathUtils.damp(
      smoothedAngleRef.current,
      targetAngle,
      11,
      dt,
    )
    smoothedAngleRef.current = angle
    lowerRefs.current.forEach((node) => {
      if (node) node.rotation.x = -angle
    })
    upperRefs.current.forEach((node) => {
      if (node) node.rotation.x = -angle
    })
    if (topRef.current) {
      topRef.current.rotation.x = -angle
    }
  })

  const makeFaceObj = (idx) => {
    const pal = MULTI_FACE_PALETTE[idx % MULTI_FACE_PALETTE.length]
    const id = `face_${idx}`
    return {
      face: {
        id,
        color: pal.color,
        edgeColor: pal.edgeColor,
        badge: String(idx + 1),
      },
      label: faceNames?.[id] ?? `${faceBadgePrefix} ${idx + 1}`,
      sublabel: `${faceBadgePrefix} ${idx + 1}`,
    }
  }

  const face0 = makeFaceObj(0)
  const face7 = makeFaceObj(7)

  return (
    <group position={rootPosition}>
      {effectiveMode === 'volume' && (
        <OctahedronVolumeFill
          a={layout.a}
          solidHeight={solidHeight}
          foldProgress={foldProgress}
        />
      )}

      <PolygonFace
        faceId="face_0"
        geometry={baseGeo}
        label={face0.label}
        sublabel={face0.sublabel}
        color={face0.face.color}
        edgeColor={face0.face.edgeColor}
        isLateral={false}
        highlightMode={effectiveMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      {lowerEdgeRots.map((rotY, idx) => {
        const lowerData = makeFaceObj(idx + 1)
        const upperData = makeFaceObj(idx + 4)

        return (
          <group key={lowerData.face.id} rotation={[0, rotY, 0]}>
            <group
              ref={(el) => {
                lowerRefs.current[idx] = el
              }}
              position={[0, 0, apothem]}
            >
              <HingePin axis="x" length={layout.a * 0.8} thickness={thickness} />
              <PyramidTriangleFace
                face={lowerData.face}
                label={lowerData.label}
                sublabel={lowerData.sublabel}
                geometry={triGeo}
                highlightMode={effectiveMode}
                selectedFace={selectedFace}
                onSelectFace={onSelectFace}
              />

              <group
                position={[layout.a / 4, 0, triangleHeight / 2]}
                rotation={[0, Math.PI / 3, 0]}
              >
                <group
                  ref={(el) => {
                    upperRefs.current[idx] = el
                  }}
                >
                  <HingePin
                    axis="x"
                    length={layout.a * 0.78}
                    thickness={thickness}
                  />
                  <PyramidTriangleFace
                    face={upperData.face}
                    label={upperData.label}
                    sublabel={upperData.sublabel}
                    geometry={triGeo}
                    highlightMode={effectiveMode}
                    selectedFace={selectedFace}
                    onSelectFace={onSelectFace}
                  />

                  {idx === 0 && (
                    <group
                      position={[-layout.a / 4, 0, triangleHeight / 2]}
                      rotation={[0, -Math.PI / 3, 0]}
                    >
                      <group ref={topRef}>
                        <HingePin
                          axis="x"
                          length={layout.a * 0.78}
                          thickness={thickness}
                        />
                        <PyramidTriangleFace
                          face={face7.face}
                          label={face7.label}
                          sublabel={face7.sublabel}
                          geometry={triGeo}
                          highlightMode={effectiveMode}
                          selectedFace={selectedFace}
                          onSelectFace={onSelectFace}
                        />
                      </group>
                    </group>
                  )}
                </group>
              </group>
            </group>
          </group>
        )
      })}
    </group>
  )
}

function FrustumVolumeFill({ r1, r2, h, foldProgress }) {
  const fillRef = useRef(null)
  const smoothedFillRef = useRef(clampFoldProgress(foldProgress) / 100)
  const targetFill = clampFoldProgress(foldProgress) / 100
  const inset = Math.min(0.03, Math.min(r1, r2, h) * 0.02)
  const fillR1 = Math.max(0.08, r1 - inset)
  const fillR2 = Math.max(0.08, r2 - inset)
  const fillH = Math.max(0.1, h - inset * 2)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const next = THREE.MathUtils.damp(
      smoothedFillRef.current,
      targetFill,
      10,
      dt,
    )
    smoothedFillRef.current = next
    if (fillRef.current) {
      fillRef.current.scale.y = Math.max(0.001, next)
      fillRef.current.visible = next > 0.02
    }
  })

  return (
    <group ref={fillRef} position={[0, inset, 0]}>
      <mesh position={[0, fillH / 2, 0]}>
        <cylinderGeometry args={[fillR2, fillR1, fillH, 48]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.28}
          transparent
          opacity={0.56}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function FrustumNet({
  r1,
  r2,
  h,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
}) {
  const layout = useMemo(() => getFrustumNetLayout(r1, r2, h), [r1, r2, h])
  const { thickness, rootPosition } = layout
  const arcSegments = 48
  const heightSegments = 4

  const smoothedProgressRef = useRef(clampFoldProgress(foldProgress))
  const topCapGroupRef = useRef(null)
  const lastRenderedRef = useRef({ progress: null, wallGeometry: null })

  const { wallGeometry, borderGeometry } = useMemo(() => {
    const geos = createFrustumWallGeometries(arcSegments, heightSegments)
    updateFrustumWallGeometries(
      geos.wallGeometry,
      geos.borderGeometry,
      layout.r1,
      layout.r2,
      layout.h,
      layout.thickness,
      0,
      arcSegments,
      heightSegments,
    )
    return geos
  }, [layout.r1, layout.r2, layout.h, layout.thickness])

  useEffect(() => {
    return () => {
      wallGeometry.dispose()
      borderGeometry.dispose()
    }
  }, [wallGeometry, borderGeometry])

  const bottomLabel = faceNames?.bottom ?? FRUSTUM_PART_METADATA.bottom.label
  const lateralLabel = faceNames?.lateral ?? FRUSTUM_PART_METADATA.lateral.label
  const topLabel = faceNames?.top ?? FRUSTUM_PART_METADATA.top.label

  const { wallInnerTexture, wallOuterTexture } = useMemo(() => {
    const canvas = createFaceCanvas({
      label: lateralLabel,
      sublabel: FRUSTUM_PART_METADATA.lateral.badge,
      color: FRUSTUM_PART_METADATA.lateral.color,
      variant: 'sector',
    })
    return {
      wallInnerTexture: makeCanvasTexture(canvas, 0),
      wallOuterTexture: makeCanvasTexture(canvas, 0),
    }
  }, [lateralLabel])

  useEffect(() => {
    return () => {
      wallInnerTexture?.dispose()
      wallOuterTexture?.dispose()
    }
  }, [wallInnerTexture, wallOuterTexture])

  const targetProgress = clampFoldProgress(foldProgress)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const nextProgress = THREE.MathUtils.damp(
      smoothedProgressRef.current,
      targetProgress,
      11,
      dt,
    )
    smoothedProgressRef.current = nextProgress

    if (
      lastRenderedRef.current.wallGeometry !== wallGeometry ||
      lastRenderedRef.current.progress === null ||
      Math.abs(nextProgress - lastRenderedRef.current.progress) > 1e-4
    ) {
      updateFrustumWallGeometries(
        wallGeometry,
        borderGeometry,
        layout.r1,
        layout.r2,
        layout.h,
        layout.thickness,
        nextProgress,
        arcSegments,
        heightSegments,
      )
      if (topCapGroupRef.current) {
        const anchor = sampleFrustumWallPoint(
          1,
          0,
          layout.r1,
          layout.r2,
          layout.h,
          nextProgress,
        )
        topCapGroupRef.current.position.copy(anchor.position)
        topCapGroupRef.current.rotation.x =
          (clampFoldProgress(nextProgress) / 100) * Math.PI
      }
      lastRenderedRef.current = { progress: nextProgress, wallGeometry }
    }
  })

  const wallVisual = getFaceVisualState({
    faceId: 'lateral',
    isLateral: true,
    highlightMode,
    selectedFace,
    baseColor: FRUSTUM_PART_METADATA.lateral.color,
    edgeColor: FRUSTUM_PART_METADATA.lateral.edgeColor,
  })

  return (
    <group position={rootPosition}>
      {highlightMode === 'volume' && (
        <FrustumVolumeFill
          r1={layout.r1}
          r2={layout.r2}
          h={layout.h}
          foldProgress={foldProgress}
        />
      )}

      <CircularBaseCap
        part={FRUSTUM_PART_METADATA.bottom}
        label={bottomLabel}
        radius={layout.r1}
        thickness={thickness}
        position={[0, -thickness / 2, 0]}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />

      {/* Base radius r1, vertical height h, top radius r2, and slant height l guides */}
      <Line
        points={[
          [0, 0.015, 0],
          [layout.r1, 0.015, 0],
        ]}
        color="#f59e0b"
        lineWidth={2.5}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, layout.h, 0],
        ]}
        color="#0284c7"
        lineWidth={2}
        dashed
        dashSize={0.22}
        gapSize={0.14}
      />
      {foldProgress >= 85 && (
        <>
          <Line
            points={[
              [0, layout.h + 0.015, 0],
              [layout.r2, layout.h + 0.015, 0],
            ]}
            color="#f59e0b"
            lineWidth={2.5}
          />
          <Line
            points={[
              [layout.r1 + 0.02, 0.02, 0],
              [layout.r2 + 0.02, layout.h + 0.02, 0],
            ]}
            color="#e11d48"
            lineWidth={2.5}
          />
        </>
      )}

      <group position={[0, 0, -layout.r1]}>
        <HingePin axis="x" length={layout.r1 * 0.9} thickness={thickness} />
      </group>

      <mesh
        geometry={wallGeometry}
        castShadow={!wallVisual.transparent}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta <= 5) {
            onSelectFace?.('lateral')
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <meshStandardMaterial
          attach="material-0"
          map={wallInnerTexture}
          color={
            wallInnerTexture
              ? wallVisual.tint
              : FRUSTUM_PART_METADATA.lateral.color
          }
          emissive={wallVisual.emissive}
          emissiveIntensity={wallVisual.emissiveIntensity}
          transparent={wallVisual.transparent}
          opacity={wallVisual.opacity}
          depthWrite={wallVisual.depthWrite}
          roughness={0.42}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-1"
          map={wallOuterTexture}
          color={
            wallOuterTexture
              ? wallVisual.tint
              : FRUSTUM_PART_METADATA.lateral.color
          }
          emissive={wallVisual.emissive}
          emissiveIntensity={wallVisual.emissiveIntensity}
          transparent={wallVisual.transparent}
          opacity={wallVisual.opacity}
          depthWrite={wallVisual.depthWrite}
          roughness={0.42}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-2"
          color={wallVisual.sideTint}
          transparent={wallVisual.transparent}
          opacity={wallVisual.opacity}
          depthWrite={wallVisual.depthWrite}
          roughness={0.5}
          metalness={0.08}
        />
      </mesh>

      <lineSegments geometry={borderGeometry}>
        <lineBasicMaterial color={wallVisual.outlineColor} />
      </lineSegments>

      <group ref={topCapGroupRef}>
        <HingePin axis="x" length={layout.r2 * 0.85} thickness={thickness} />
        <CircularBaseCap
          part={FRUSTUM_PART_METADATA.top}
          label={topLabel}
          radius={layout.r2}
          thickness={thickness}
          position={[0, -thickness / 2, -layout.r2]}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />
      </group>
    </group>
  )
}

function HemisphereModel({
  r,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
}) {
  const radius = typeof r === 'number' && Number.isFinite(r) && r > 0 ? r : 4
  const thickness = Math.max(0.02, radius * 0.015)
  const spinRef = useRef(null)
  const domePart = HEMISPHERE_PART_METADATA.lateral
  const basePart = HEMISPHERE_PART_METADATA.bottom
  const domeLabel = faceNames?.lateral ?? domePart.label
  const baseLabel = faceNames?.bottom ?? basePart.label

  const domeTexture = useMemo(() => {
    const canvas = createFaceCanvas({
      label: domeLabel,
      sublabel: domePart.badge,
      color: domePart.color,
      variant: 'sphere',
    })
    return makeCanvasTexture(canvas, 0)
  }, [domeLabel, domePart])

  useEffect(() => {
    return () => {
      domeTexture?.dispose()
    }
  }, [domeTexture])

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += Math.min(delta, 0.1) * 0.25
    }
  })

  const domeVisual = getFaceVisualState({
    faceId: 'lateral',
    isLateral: true,
    highlightMode,
    selectedFace,
    baseColor: domePart.color,
    edgeColor: domePart.edgeColor,
    opaqueFallback: 0.9,
  })

  return (
    <group position={[0, thickness, 0]}>
      <group ref={spinRef}>
        {/* Upper hemisphere dome (CSA = 2πr²) */}
        <mesh
          castShadow={!domeVisual.transparent}
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            if (e.delta <= 5) {
              onSelectFace?.('lateral')
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <sphereGeometry
            args={[radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial
            map={domeTexture}
            color={domeTexture ? domeVisual.tint : domePart.color}
            emissive={domeVisual.emissive}
            emissiveIntensity={domeVisual.emissiveIntensity}
            transparent={domeVisual.transparent}
            opacity={domeVisual.opacity}
            depthWrite={domeVisual.depthWrite}
            side={THREE.DoubleSide}
            roughness={0.38}
            metalness={0.08}
          />
        </mesh>

        {/* Equatorial rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[radius + 0.006, Math.max(0.025, radius * 0.012), 12, 64]}
          />
          <meshStandardMaterial
            color={selectedFace === 'lateral' ? '#facc15' : '#1e293b'}
            roughness={0.4}
          />
        </mesh>

        {/* Flat circular base disc (πr²) */}
        <CircularBaseCap
          part={basePart}
          label={baseLabel}
          radius={radius}
          thickness={thickness}
          position={[0, -thickness / 2, 0]}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />

        {/* Radius rod r and vertical height = r dashed guide */}
        <mesh position={[0, 0.01, 0]}>
          <sphereGeometry args={[Math.max(0.07, radius * 0.03), 16, 16]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <Line
          points={[
            [0, 0.015, 0],
            [radius, 0.015, 0],
          ]}
          color="#f59e0b"
          lineWidth={3}
        />
        <Line
          points={[
            [0, 0, 0],
            [0, radius, 0],
          ]}
          color="#0284c7"
          lineWidth={2}
          dashed
          dashSize={0.22}
          gapSize={0.14}
        />
      </group>

      {highlightMode === 'volume' && (
        <group>
          <mesh>
            <sphereGeometry
              args={[radius * 0.94, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0284c7"
              emissiveIntensity={0.28}
              transparent
              opacity={0.56}
              roughness={0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[radius * 0.94, 48]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0284c7"
              emissiveIntensity={0.28}
              transparent
              opacity={0.56}
              roughness={0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

function getSceneMetrics(shape, dimensions) {
  if (shape === SHAPES.CUBOID) {
    const l = dimensions?.l ?? 4
    const b = dimensions?.b ?? 3
    const h = dimensions?.h ?? 2
    return {
      extent: Math.max(l + 2 * h, 2 * b + 2 * h, 8),
      targetY: h * 0.25,
    }
  }
  if (shape === SHAPES.CYLINDER) {
    const r = dimensions?.r ?? 1.5
    const h = dimensions?.h ?? 4
    return {
      extent: Math.max(2 * Math.PI * r, 4 * r + h, 8),
      targetY: h * 0.25,
    }
  }
  if (shape === SHAPES.CONE) {
    const r = dimensions?.r ?? 3
    const h = dimensions?.h ?? 4
    const l = Math.hypot(r, h)
    return {
      extent: Math.max(2 * l, 2 * r + l, 8),
      targetY: h * 0.3,
    }
  }
  if (shape === SHAPES.SQUARE_PYRAMID) {
    const a = dimensions?.a ?? 6
    const h = dimensions?.h ?? 4
    const s = Math.hypot(h, a / 2)
    return {
      extent: Math.max(a + 2 * s, 8),
      targetY: h * 0.3,
    }
  }
  if (shape === SHAPES.SPHERE) {
    const r = dimensions?.r ?? 4
    return {
      extent: Math.max(3.2 * r, 8),
      targetY: r,
    }
  }
  if (
    shape === SHAPES.TRIANGULAR_PRISM ||
    shape === SHAPES.PENTAGONAL_PRISM ||
    shape === SHAPES.HEXAGONAL_PRISM
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PRISM
        ? 3
        : shape === SHAPES.PENTAGONAL_PRISM
          ? 5
          : 6
    const a = dimensions?.a ?? 4
    const h = dimensions?.h ?? 5
    const circumradius = a / (2 * Math.sin(Math.PI / sides))
    return {
      extent: Math.max(2 * (circumradius + h) + a, 9),
      targetY: h * 0.35,
    }
  }
  if (
    shape === SHAPES.TRIANGULAR_PYRAMID ||
    shape === SHAPES.PENTAGONAL_PYRAMID ||
    shape === SHAPES.HEXAGONAL_PYRAMID
  ) {
    const sides =
      shape === SHAPES.TRIANGULAR_PYRAMID
        ? 3
        : shape === SHAPES.PENTAGONAL_PYRAMID
          ? 5
          : 6
    const a = dimensions?.a ?? 5
    const h = dimensions?.h ?? 5
    const apothem = a / (2 * Math.tan(Math.PI / sides))
    const s = Math.hypot(h, apothem)
    return {
      extent: Math.max(2 * (apothem + s), 9),
      targetY: h * 0.32,
    }
  }
  if (shape === SHAPES.HEMISPHERE) {
    const r = dimensions?.r ?? 7
    return {
      extent: Math.max(3.2 * r, 8),
      targetY: r * 0.48,
    }
  }
  if (shape === SHAPES.FRUSTUM) {
    const r1 = dimensions?.r1 ?? 6
    const r2 = dimensions?.r2 ?? 3
    const h = dimensions?.h ?? 4
    const l = Math.hypot(h, r1 - r2)
    return {
      extent: Math.max(2 * r1 + 2 * l + 2 * r2, Math.PI * (r1 + r2), 10),
      targetY: h * 0.35,
    }
  }
  if (shape === SHAPES.OCTAHEDRON) {
    const a = dimensions?.a ?? 6
    return {
      extent: Math.max(3.2 * a, 9),
      targetY: a * 0.4,
    }
  }
  const a = dimensions?.a ?? 3
  return {
    extent: Math.max(4 * a, 8),
    targetY: a * 0.25,
  }
}

function CameraController({
  shape,
  extent,
  targetY,
  controlsRef,
  resetTick,
  zoomStep,
}) {
  const { camera } = useThree()
  const prevRef = useRef({ shape: null, resetTick: 0, extent: null, zoomSeq: 0 })
  const offsetVecRef = useRef(new THREE.Vector3())

  useEffect(() => {
    const idealDist = Math.max(9.5, 4.5 + extent * 0.78)
    const minDist = Math.max(2.5, extent * 0.25)
    const maxDist = Math.max(40, extent * 3.4)
    const prev = prevRef.current
    const shouldResetPose =
      prev.shape !== shape || prev.resetTick !== resetTick

    if (shouldResetPose) {
      const dir = new THREE.Vector3(0.62, 0.56, 0.76).normalize()
      camera.position.set(
        dir.x * idealDist,
        targetY + dir.y * idealDist,
        dir.z * idealDist,
      )
      if (controlsRef.current) {
        controlsRef.current.target.set(0, targetY, 0)
        controlsRef.current.update()
      }
    } else if (zoomStep && zoomStep.seq !== prev.zoomSeq && controlsRef.current) {
      const target = controlsRef.current.target
      offsetVecRef.current.copy(camera.position).sub(target)
      const currentDist = offsetVecRef.current.length()
      if (currentDist > 0.01) {
        const nextDist = Math.max(
          minDist,
          Math.min(maxDist, currentDist * zoomStep.factor),
        )
        offsetVecRef.current.normalize().multiplyScalar(nextDist)
        camera.position.copy(target).add(offsetVecRef.current)
        controlsRef.current.update()
      }
    } else if (prev.extent !== extent && controlsRef.current) {
      const target = controlsRef.current.target
      offsetVecRef.current.copy(camera.position).sub(target)
      const currentDist = offsetVecRef.current.length()
      if (currentDist > 0.01) {
        const prevIdeal = Math.max(9.5, 4.5 + (prev.extent ?? extent) * 0.78)
        const nextDist = currentDist * (idealDist / prevIdeal)
        offsetVecRef.current.normalize().multiplyScalar(nextDist)
        target.set(0, targetY, 0)
        camera.position.copy(target).add(offsetVecRef.current)
        controlsRef.current.update()
      }
    }

    prevRef.current = {
      shape,
      resetTick,
      extent,
      zoomSeq: zoomStep?.seq ?? 0,
    }
  }, [shape, extent, targetY, resetTick, zoomStep, camera, controlsRef])

  return null
}

function CubeNetBranch({
  node,
  a,
  thickness,
  isRoot,
  isValidNet,
  registerHinge,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
  maskFaceRoles = false,
}) {
  const palette = MULTI_FACE_PALETTE[node.index % MULTI_FACE_PALETTE.length]
  const meta =
    CUBE_FACE_METADATA.find((item) => item.id === node.faceId) ??
    CUBE_FACE_METADATA[0]

  const faceId = isValidNet && !maskFaceRoles ? node.faceId : `tile_${node.index}`
  const faceColor =
    isValidNet && !maskFaceRoles
      ? meta.color
      : node.overlapping
        ? '#ef4444'
        : palette.color
  const faceEdgeColor =
    isValidNet && !maskFaceRoles
      ? meta.edgeColor
      : node.overlapping
        ? '#991b1b'
        : palette.edgeColor

  const faceObj = {
    id: faceId,
    color: faceColor,
    edgeColor: faceEdgeColor,
    badge: String(node.index + 1),
    outerTextureRotation: 0,
  }
  const label =
    isValidNet && !maskFaceRoles
      ? (faceNames?.[node.faceId] ?? meta.label)
      : `${faceBadgePrefix} ${node.index + 1}`
  const sublabel = maskFaceRoles && isRoot
    ? `${faceBadgePrefix} ${node.index + 1} · BASE`
    : `${faceBadgePrefix} ${node.index + 1}`
  const isLateral = node.faceId !== 'bottom' && node.faceId !== 'top'

  if (isRoot) {
    return (
      <>
        <RectangularFace
          face={faceObj}
          label={label}
          sublabel={sublabel}
          width={a}
          depth={a}
          thickness={thickness}
          position={node.panelOffset}
          isLateral={isLateral}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
        />
        {node.children.map((child) => (
          <CubeNetBranch
            key={child.index}
            node={child}
            a={a}
            thickness={thickness}
            isRoot={false}
            isValidNet={isValidNet}
            registerHinge={registerHinge}
            highlightMode={highlightMode}
            selectedFace={selectedFace}
            onSelectFace={onSelectFace}
            faceNames={faceNames}
            faceBadgePrefix={faceBadgePrefix}
            maskFaceRoles={maskFaceRoles}
          />
        ))}
      </>
    )
  }

  return (
    <group
      ref={(el) => registerHinge(node.index, el, node.axis, node.sign)}
      position={node.hingePosition}
    >
      <HingePin axis={node.axis} length={node.pinLength} thickness={thickness} />
      <RectangularFace
        face={faceObj}
        label={label}
        sublabel={sublabel}
        width={a}
        depth={a}
        thickness={thickness}
        position={node.panelOffset}
        isLateral={isLateral}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
      />
      <group position={node.localCenterOffset}>
        {node.children.map((child) => (
          <CubeNetBranch
            key={child.index}
            node={child}
            a={a}
            thickness={thickness}
            isRoot={false}
            isValidNet={isValidNet}
            registerHinge={registerHinge}
            highlightMode={highlightMode}
            selectedFace={selectedFace}
            onSelectFace={onSelectFace}
            faceNames={faceNames}
            faceBadgePrefix={faceBadgePrefix}
            maskFaceRoles={maskFaceRoles}
          />
        ))}
      </group>
    </group>
  )
}

function CustomCubeNetTree({
  cells,
  rootIndex = 0,
  a = 3,
  foldProgress,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
  maskFaceRoles = false,
}) {
  const layout = useMemo(
    () => buildCubeNetHingeTree(cells, a, rootIndex),
    [cells, a, rootIndex],
  )
  const hingesRef = useRef({})
  const smoothedAngleRef = useRef(foldProgressToRadians(foldProgress))
  const targetAngle = foldProgressToRadians(foldProgress)

  const registerHinge = useCallback((idx, el, axis, sign) => {
    if (el) {
      hingesRef.current[idx] = { el, axis, sign }
    } else {
      delete hingesRef.current[idx]
    }
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const angle = THREE.MathUtils.damp(
      smoothedAngleRef.current,
      targetAngle,
      11,
      dt,
    )
    smoothedAngleRef.current = angle
    Object.values(hingesRef.current).forEach(({ el, axis, sign }) => {
      el.rotation[axis] = sign * angle
    })
  })

  if (!layout) return null

  return (
    <group position={layout.rootPosition}>
      <CubeNetBranch
        node={layout.tree}
        a={layout.a}
        thickness={layout.thickness}
        isRoot
        isValidNet={layout.validation.valid}
        registerHinge={registerHinge}
        highlightMode={highlightMode}
        selectedFace={selectedFace}
        onSelectFace={onSelectFace}
        faceNames={faceNames}
        faceBadgePrefix={faceBadgePrefix}
        maskFaceRoles={maskFaceRoles}
      />
    </group>
  )
}

function SceneContent({
  shape,
  foldProgress,
  dimensions,
  highlightMode,
  selectedFace,
  onSelectFace,
  faceNames,
  faceBadgePrefix,
  resetTick,
  zoomStep,
  enableWheelZoom,
  theme,
  customCubeNet,
}) {
  const controlsRef = useRef(null)
  const baseMetrics = getSceneMetrics(shape, dimensions)
  const extent = customCubeNet?.cells
    ? Math.max(baseMetrics.extent, (dimensions?.a ?? 3) * 4.8)
    : baseMetrics.extent
  const targetY = baseMetrics.targetY
  const shadowExtent = Math.max(12, extent * 1.15)
  const isDark = theme === 'dark'

  return (
    <>
      <color attach="background" args={[isDark ? '#0f172a' : '#f1f5f9']} />
      <fog attach="fog" args={[isDark ? '#0f172a' : '#f1f5f9', 40, 140]} />

      <ambientLight intensity={isDark ? 0.72 : 0.62} />
      <hemisphereLight args={['#ffffff', isDark ? '#334155' : '#cbd5e1', 0.55]} />
      <directionalLight
        position={[12, 18, 14]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={1}
        shadow-camera-far={Math.max(60, extent * 5)}
      />
      <directionalLight position={[-10, 8, -10]} intensity={0.35} color="#e0f2fe" />

      {shape === SHAPES.CUBE && customCubeNet?.cells && (
        <CustomCubeNetTree
          key={`${JSON.stringify(customCubeNet.cells)}-${customCubeNet.rootIndex ?? 0}`}
          cells={customCubeNet.cells}
          rootIndex={customCubeNet.rootIndex ?? 0}
          a={dimensions?.a ?? 3}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
          maskFaceRoles={Boolean(customCubeNet.maskFaceRoles)}
        />
      )}

      {shape === SHAPES.CUBE && !customCubeNet?.cells && (
        <BoxNet
          l={dimensions?.a ?? 3}
          b={dimensions?.a ?? 3}
          h={dimensions?.a ?? 3}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.CUBOID && (
        <BoxNet
          l={dimensions?.l ?? 4}
          b={dimensions?.b ?? 3}
          h={dimensions?.h ?? 2}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.CYLINDER && (
        <CylinderNet
          r={dimensions?.r ?? 1.5}
          h={dimensions?.h ?? 4}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
        />
      )}

      {shape === SHAPES.CONE && (
        <ConeNet
          r={dimensions?.r ?? 3}
          h={dimensions?.h ?? 4}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
        />
      )}

      {shape === SHAPES.SQUARE_PYRAMID && (
        <SquarePyramidNet
          a={dimensions?.a ?? 6}
          h={dimensions?.h ?? 4}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
        />
      )}

      {shape === SHAPES.SPHERE && (
        <SphereModel
          r={dimensions?.r ?? 4}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
        />
      )}

      {shape === SHAPES.TRIANGULAR_PRISM && (
        <PolygonPrismNet
          sides={3}
          a={dimensions?.a ?? 4}
          h={dimensions?.h ?? 5}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.PENTAGONAL_PRISM && (
        <PolygonPrismNet
          sides={5}
          a={dimensions?.a ?? 4}
          h={dimensions?.h ?? 6}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.HEXAGONAL_PRISM && (
        <PolygonPrismNet
          sides={6}
          a={dimensions?.a ?? 4}
          h={dimensions?.h ?? 5}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.TRIANGULAR_PYRAMID && (
        <PolygonPyramidNet
          sides={3}
          a={dimensions?.a ?? 6}
          h={dimensions?.h ?? 5}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.PENTAGONAL_PYRAMID && (
        <PolygonPyramidNet
          sides={5}
          a={dimensions?.a ?? 4}
          h={dimensions?.h ?? 6}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.HEXAGONAL_PYRAMID && (
        <PolygonPyramidNet
          sides={6}
          a={dimensions?.a ?? 4}
          h={dimensions?.h ?? 3}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      {shape === SHAPES.HEMISPHERE && (
        <HemisphereModel
          r={dimensions?.r ?? 7}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
        />
      )}

      {shape === SHAPES.FRUSTUM && (
        <FrustumNet
          r1={dimensions?.r1 ?? 6}
          r2={dimensions?.r2 ?? 3}
          h={dimensions?.h ?? 4}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
        />
      )}

      {shape === SHAPES.OCTAHEDRON && (
        <OctahedronNet
          a={dimensions?.a ?? 6}
          foldProgress={foldProgress}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={faceNames}
          faceBadgePrefix={faceBadgePrefix}
        />
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.002, 0]}
        receiveShadow
      >
        <planeGeometry args={[160, 160]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>

      <Grid
        position={[0, -0.005, 0]}
        infiniteGrid
        side={THREE.DoubleSide}
        cellSize={1}
        cellThickness={0.6}
        cellColor={isDark ? '#1e293b' : '#cbd5e1'}
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor={isDark ? '#334155' : '#94a3b8'}
        fadeDistance={85}
        fadeStrength={1.5}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        enableZoom={enableWheelZoom}
        dampingFactor={0.08}
        target={[0, targetY, 0]}
        minDistance={Math.max(2.5, extent * 0.25)}
        maxDistance={Math.max(40, extent * 3.4)}
        maxPolarAngle={Math.PI * 0.85}
      />

      <CameraController
        shape={shape}
        extent={extent}
        targetY={targetY}
        controlsRef={controlsRef}
        resetTick={resetTick}
        zoomStep={zoomStep}
      />
    </>
  )
}

/**
 * Interactive 3D geometry canvas supporting Class 8 shapes, Beyond Class 8 solids,
 * inline scroll-safe mode (prevents wheel zoom trapping on scrollable pages),
 * light/dark theme integration, and Mission cube net masking.
 */
export default function Canvas3D({
  shape = SHAPES.CUBE,
  foldProgress = 0,
  dimensions = { a: 3 },
  highlightMode = 'all',
  selectedFace = null,
  onSelectFace,
  translations = TRANSLATIONS.en,
  customCubeNet = null,
  inlineScrollMode = false,
  theme = 'light',
}) {
  const [resetTick, setResetTick] = useState(0)
  const [zoomUnlocked, setZoomUnlocked] = useState(!inlineScrollMode)
  const [zoomStep, setZoomStep] = useState({ seq: 0, factor: 1 })

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const handleResetView = useCallback(() => {
    setResetTick((prev) => prev + 1)
  }, [])

  const handleStepZoom = useCallback((factor) => {
    setZoomStep((prev) => ({ seq: prev.seq + 1, factor }))
  }, [])

  const isSphere = shape === SHAPES.SPHERE
  const isHemisphere = shape === SHAPES.HEMISPHERE
  const hasNoNet = isSphere || isHemisphere
  const cc = translations.canvasControls ?? {
    lockZoom: 'Lock Wheel',
    unlockZoom: 'Unlock Zoom',
    zoomIn: 'Zoom in 3D view',
    zoomOut: 'Zoom out 3D view',
    scrollSafeNote: 'Scroll moves page · drag rotates 3D',
  }

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-slate-100">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{
          position: [8.5, 7.6, 10.2],
          fov: 42,
          near: 0.1,
          far: 300,
        }}
        onPointerMissed={() => onSelectFace?.(null)}
      >
        <SceneContent
          shape={shape}
          foldProgress={foldProgress}
          dimensions={dimensions}
          highlightMode={highlightMode}
          selectedFace={selectedFace}
          onSelectFace={onSelectFace}
          faceNames={translations.faceNames}
          faceBadgePrefix={translations.faceBadgePrefix}
          resetTick={resetTick}
          zoomStep={zoomStep}
          enableWheelZoom={inlineScrollMode ? zoomUnlocked : true}
          theme={theme}
          customCubeNet={customCubeNet}
        />
      </Canvas>

      <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleStepZoom(0.84)}
          aria-label={cc.zoomIn}
          title={cc.zoomIn}
          className="rounded-lg bg-white/90 px-2 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-indigo-700 cursor-pointer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleStepZoom(1.18)}
          aria-label={cc.zoomOut}
          title={cc.zoomOut}
          className="rounded-lg bg-white/90 px-2 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-indigo-700 cursor-pointer"
        >
          −
        </button>
        {inlineScrollMode && (
          <button
            type="button"
            aria-pressed={zoomUnlocked}
            onClick={() => setZoomUnlocked((prev) => !prev)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 backdrop-blur transition cursor-pointer ${
              zoomUnlocked
                ? 'bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-700'
                : 'bg-white/90 text-slate-700 ring-slate-200 hover:bg-white hover:text-indigo-700'
            }`}
          >
            {zoomUnlocked ? cc.lockZoom : cc.unlockZoom}
          </button>
        )}
        <button
          type="button"
          onClick={handleResetView}
          className="rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-indigo-700 cursor-pointer"
        >
          {translations.resetCamera}
        </button>
      </div>

      {highlightMode === 'volume' && !hasNoNet && foldProgress < 100 && (
        <div className="pointer-events-none absolute top-3 left-3 max-w-[60%] rounded-lg bg-sky-50/95 px-3 py-1.5 text-xs font-medium text-sky-800 shadow-sm ring-1 ring-sky-200 backdrop-blur">
          {translations.volumeFoldHint}
        </div>
      )}

      {hasNoNet && (
        <div className="pointer-events-none absolute top-3 left-3 max-w-[60%] rounded-lg bg-amber-50/95 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm ring-1 ring-amber-300 backdrop-blur">
          {isSphere
            ? translations.sphereNoNetMessage
            : translations.hemisphereNoNetMessage}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 hidden rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80 backdrop-blur sm:block">
        {inlineScrollMode && !zoomUnlocked
          ? cc.scrollSafeNote
          : hasNoNet
            ? translations.noNetCanvasHint
            : translations.canvasHint}
      </div>

      {(shape === SHAPES.CONE ||
        shape === SHAPES.SQUARE_PYRAMID ||
        shape === SHAPES.TRIANGULAR_PRISM ||
        shape === SHAPES.PENTAGONAL_PRISM ||
        shape === SHAPES.HEXAGONAL_PRISM ||
        shape === SHAPES.TRIANGULAR_PYRAMID ||
        shape === SHAPES.PENTAGONAL_PYRAMID ||
        shape === SHAPES.HEXAGONAL_PYRAMID ||
        shape === SHAPES.FRUSTUM ||
        isSphere ||
        isHemisphere) && (
        <div className="pointer-events-none absolute right-3 bottom-3 flex flex-wrap items-center gap-2 rounded-xl bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          {(shape === SHAPES.CONE ||
            shape === SHAPES.FRUSTUM ||
            isSphere ||
            isHemisphere) && (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-full bg-amber-500" />
              {translations.guideLabels.radius}
            </span>
          )}
          {(shape === SHAPES.CONE ||
            shape === SHAPES.SQUARE_PYRAMID ||
            shape === SHAPES.TRIANGULAR_PRISM ||
            shape === SHAPES.PENTAGONAL_PRISM ||
            shape === SHAPES.HEXAGONAL_PRISM ||
            shape === SHAPES.TRIANGULAR_PYRAMID ||
            shape === SHAPES.PENTAGONAL_PYRAMID ||
            shape === SHAPES.HEXAGONAL_PYRAMID ||
            shape === SHAPES.FRUSTUM ||
            isHemisphere) && (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-full bg-sky-600" />
              {translations.guideLabels.height}
            </span>
          )}
          {(shape === SHAPES.CONE || shape === SHAPES.FRUSTUM) && (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-full bg-rose-600" />
              {translations.guideLabels.slantL}
            </span>
          )}
          {(shape === SHAPES.SQUARE_PYRAMID ||
            shape === SHAPES.TRIANGULAR_PYRAMID ||
            shape === SHAPES.PENTAGONAL_PYRAMID ||
            shape === SHAPES.HEXAGONAL_PYRAMID) && (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-full bg-rose-600" />
              {translations.guideLabels.slantS}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
