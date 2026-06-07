'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'

// Component for a single post (stub)
function Post({ position, height, color = VIS_COLORS.post }) {
  const postRef = useRef()

  return (
    <group ref={postRef} position={position}>
      {/* Main post column */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.1, height, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Base plate (anker ploča) at bottom */}
      <mesh position={[0, -height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color={VIS_COLORS.anker} metalness={0.45} roughness={0.55} />
      </mesh>
      {/* Top plate (anker ploča) at top */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color={VIS_COLORS.anker} metalness={0.45} roughness={0.55} />
      </mesh>
    </group>
  )
}

// Helper function to create a beam from point A to point B
function BeamFromTo({ from, to, size, color }) {
  const direction = new THREE.Vector3(
    to[0] - from[0],
    to[1] - from[1],
    to[2] - from[2],
  )
  const length = direction.length()
  if (length === 0) return null

  const midpoint = new THREE.Vector3(
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  )

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  )

  return (
    <mesh
      position={midpoint}
      quaternion={quaternion}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[size, length, size]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

const SLAB_THICKNESS = 0.5 // 50 cm betonska ploča
const ANKER_PLATE_SIZE = 0.2 // anker ploča 20×20 cm
const SLAB_OVERHANG_BEYOND_ANKER = 0.1 // 10 cm iza spoljašnje ivice anker ploče
const SLAB_EDGE_INSET = ANKER_PLATE_SIZE / 2 + SLAB_OVERHANG_BEYOND_ANKER

// Paleta usklađena sa prigušenom zelenom podlogom — archviz, bez jarkih tonova
const VIS_COLORS = {
  post: '#586770',        // toplo čelično siva — stubovi
  anker: '#3f484e',       // tamna anker ploča
  binderMain: '#4a6570',  // slate plavo-zelena — glavni profili bindera
  binderCross: '#607a84', // svetliji slate — sipke i dijagonale
  purlin: '#874a3c',      // prigušeni iron oxide red — rožnjače
  slab: '#b5b0a8',        // topli beton
  background: '#d6d2cb',  // svetlija siva od betona — pozadina scene
  dimension: '#3f5860',   // tamni slate — kotirne linije
}

const ROOF_PITCH_DEGREES_1_VODA = 8.5
const ROOF_PITCH_DEGREES_2_VODE = 10

function getRoofGeometry(width, padKrova) {
  const roofPitchDegrees = padKrova === 1 ? ROOF_PITCH_DEGREES_1_VODA : ROOF_PITCH_DEGREES_2_VODE
  const roofPitchAngle = (roofPitchDegrees * Math.PI) / 180
  const roofSlopeRatio = Math.tan(roofPitchAngle)
  const slopeRun = padKrova === 1 ? width : width / 2
  const maxRoofHeight = slopeRun * roofSlopeRatio
  const slopeLength = Math.sqrt(slopeRun ** 2 + maxRoofHeight ** 2)

  return { roofSlopeRatio, roofPitchAngle, maxRoofHeight, slopeRun, slopeLength }
}

function getStubTopHeight(zPos, width, padKrova, maxRoofHeight) {
  if (padKrova === 1) {
    const distanceFromLeft = zPos - (-width / 2)
    return maxRoofHeight * (distanceFromLeft / width)
  }
  const distanceFromCenter = Math.abs(zPos)
  return maxRoofHeight * (1 - distanceFromCenter / (width / 2))
}

// Dijagonale: gornji čvor višeg polja → donji čvor sledećeg, u pravcu pada krova
function getDiagonalBraces(stubPositions, width, padKrova, maxRoofHeight) {
  const sorted = [...stubPositions].sort((a, b) => a - b)
  const braces = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const zA = sorted[i]
    const zB = sorted[i + 1]
    const midZ = (zA + zB) / 2

    let zTop, zBottom
    if (padKrova === 1) {
      // Pad ka nižoj strani (manji z)
      zTop = zB
      zBottom = zA
    } else if (midZ <= 0) {
      // Leva polovina: pad od sliva ka levoj ivici
      zTop = zB
      zBottom = zA
    } else {
      // Desna polovina: pad od sliva ka desnoj ivici
      zTop = zA
      zBottom = zB
    }

    const topY = getStubTopHeight(zTop, width, padKrova, maxRoofHeight)
    if (topY < 0.01) continue

    braces.push({
      from: [0, 0, zBottom],
      to: [0, topY, zTop],
    })
  }

  return braces
}

// Component for a binder - triangular or rectangular frame with vertical supports
function Binder({ position, width, padKrova, maxRoofHeight, profili, stubPositions }) {
  const mainProfile = profili?.[0]
  const crossProfile = profili?.[1]

  const mainSize = mainProfile ? parseFloat(mainProfile.tip.split('x')[0]) / 1000 : 0.08
  const crossSize = crossProfile ? parseFloat(crossProfile.tip.split('x')[0]) / 1000 : 0.04

  const color = VIS_COLORS.binderMain
  const crossColor = VIS_COLORS.binderCross

  const diagonalBraces = crossProfile && stubPositions
    ? getDiagonalBraces(stubPositions, width, padKrova, maxRoofHeight)
    : []

  return (
    <group position={position}>
      {padKrova === 1 ? (
        <group>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[mainSize, mainSize, width]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          <mesh position={[0, maxRoofHeight / 2, width / 2]} castShadow receiveShadow>
            <boxGeometry args={[mainSize, maxRoofHeight, mainSize]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          <BeamFromTo
            from={[0, 0, -width / 2]}
            to={[0, maxRoofHeight, width / 2]}
            size={mainSize}
            color={color}
          />

          {crossProfile && stubPositions && stubPositions.map((zPos, idx) => {
            const distanceFromLeft = zPos - (-width / 2)
            const topBeamY = maxRoofHeight * (1 - distanceFromLeft / width)
            const supportHeight = maxRoofHeight - topBeamY

            if (supportHeight < 0.01) return null

            return (
              <mesh
                key={`support-1voda-${idx}`}
                position={[0, supportHeight / 2, zPos]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[crossSize, supportHeight, crossSize]} />
                <meshStandardMaterial color={crossColor} metalness={0.3} roughness={0.7} />
              </mesh>
            )
          })}
        </group>
      ) : (
        <group>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[mainSize, mainSize, width]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          <BeamFromTo
            from={[0, 0, -width / 2]}
            to={[0, maxRoofHeight, 0]}
            size={mainSize}
            color={color}
          />
          <BeamFromTo
            from={[0, 0, width / 2]}
            to={[0, maxRoofHeight, 0]}
            size={mainSize}
            color={color}
          />

          {crossProfile && stubPositions && stubPositions.map((zPos, idx) => {
            const distanceFromCenter = Math.abs(zPos)
            const topBeamY = maxRoofHeight * (1 - distanceFromCenter / (width / 2))
            const supportHeight = topBeamY

            if (supportHeight < 0.01) return null

            return (
              <mesh
                key={`support-2vode-${idx}`}
                position={[0, supportHeight / 2, zPos]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[crossSize, supportHeight, crossSize]} />
                <meshStandardMaterial color={crossColor} metalness={0.3} roughness={0.7} />
              </mesh>
            )
          })}
        </group>
      )}

      {diagonalBraces.map((brace, idx) => (
        <BeamFromTo
          key={`diag-${idx}`}
          from={brace.from}
          to={brace.to}
          size={crossSize}
          color={crossColor}
        />
      ))}
    </group>
  )
}

const RIDGE_PURLIN_OFFSET = 0.03 // dve rožnjače priljubljene na slivu (2 vode)

// Pozicije rožnjača popreko širine
function getRoznjacePositions(width, count, padKrova) {
  if (count <= 0) return []
  if (count === 1) return [0]

  const leftEdge = -width / 2
  const rightEdge = width / 2

  // 2 vode: kraj + kraj + dve priljubljene na slivu + ravnomerno po obe polovine
  if (padKrova === 2) {
    if (count === 2) return [leftEdge, rightEdge]
    if (count === 3) return [leftEdge, 0, rightEdge]

    const leftCenter = -RIDGE_PURLIN_OFFSET
    const rightCenter = RIDGE_PURLIN_OFFSET
    const middle = count - 4
    const leftMiddleCount = Math.floor(middle / 2)
    const rightMiddleCount = middle - leftMiddleCount
    const positions = [leftEdge]

    for (let i = 1; i <= leftMiddleCount; i++) {
      positions.push(leftEdge + (i / (leftMiddleCount + 1)) * (leftCenter - leftEdge))
    }

    positions.push(leftCenter, rightCenter)

    for (let i = 1; i <= rightMiddleCount; i++) {
      positions.push(rightCenter + (i / (rightMiddleCount + 1)) * (rightEdge - rightCenter))
    }

    positions.push(rightEdge)
    return positions
  }

  // 1 voda: kraj + kraj + ravnomerno između
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push(leftEdge + i * (width / (count - 1)))
  }
  return positions
}

// Pozicije vertikalnih sipki u binderu — 2 vode: jedna na slivu, ne dve
function getBinderStubPositions(width, count, padKrova) {
  if (count <= 0) return []
  if (padKrova === 1) return getRoznjacePositions(width, count, padKrova)

  const leftEdge = -width / 2
  const rightEdge = width / 2

  if (count === 1) return [0]
  if (count === 2) return []
  if (count === 3) return [0]
  if (count === 4) return [0]

  const leftRidge = -RIDGE_PURLIN_OFFSET
  const rightRidge = RIDGE_PURLIN_OFFSET
  const middle = count - 4
  const leftMiddleCount = Math.floor(middle / 2)
  const rightMiddleCount = middle - leftMiddleCount
  const positions = []

  for (let i = 1; i <= leftMiddleCount; i++) {
    positions.push(leftEdge + (i / (leftMiddleCount + 1)) * (leftRidge - leftEdge))
  }

  positions.push(0)

  for (let i = 1; i <= rightMiddleCount; i++) {
    positions.push(rightRidge + (i / (rightMiddleCount + 1)) * (rightEdge - rightRidge))
  }

  return positions
}

// Component for roof purlins (rožnjače) - run along the length
function RoofPurlin({ position, length, rotation, color = VIS_COLORS.purlin }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[length, 0.06, 0.06]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

// Main shed structure component
function ShedStructure({ length, width, height, padKrova, brojBindera, brojStubova, brojRoznjacaPoBinderu, binderProfili }) {
  const { roofPitchAngle, maxRoofHeight } = getRoofGeometry(width, padKrova)
  const slabTopY = SLAB_THICKNESS // gornja površina ploče — od nje kreće konstrukcija

  // Calculate post positions
  const postsPerSide = brojBindera
  const postSpacing = postsPerSide > 1 ? length / (postsPerSide - 1) : 0

  const posts = []
  if (postsPerSide > 0) {
    for (let i = 0; i < postsPerSide; i++) {
      const xPos = i === 0 ? -length / 2 : (i === postsPerSide - 1 ? length / 2 : -length / 2 + i * postSpacing)
      // Left side posts (negative Z)
      posts.push({ position: [xPos, slabTopY + height / 2, -width / 2], height })
      // Right side posts (positive Z)
      posts.push({ position: [xPos, slabTopY + height / 2, width / 2], height })
    }
  }

  // Calculate binder positions
  const binders = []
  for (let i = 0; i < brojBindera; i++) {
    const xPos = postsPerSide > 1
      ? (i === 0 ? -length / 2 : (i === postsPerSide - 1 ? length / 2 : -length / 2 + i * postSpacing))
      : 0
    binders.push({ position: [xPos, slabTopY + height, 0], width })
  }

  const roznjacePositions = getRoznjacePositions(width, brojRoznjacaPoBinderu, padKrova)
  const stubPositions = getBinderStubPositions(width, brojRoznjacaPoBinderu, padKrova)

  const roofPurlins = []

  // Helper function to calculate roof purlin position
  const calculatePurlinPosition = (zPos) => {
    let yPos
    let roofAngle

    if (padKrova === 1) {
      const distanceFromLowSide = zPos - (-width / 2)
      const yOffset = (distanceFromLowSide / width) * maxRoofHeight
      yPos = slabTopY + height + yOffset
      roofAngle = roofPitchAngle
    } else {
      const distanceFromCenter = Math.abs(zPos)
      const yOffset = (distanceFromCenter / (width / 2)) * maxRoofHeight
      yPos = slabTopY + height + maxRoofHeight - yOffset
      roofAngle = roofPitchAngle * (zPos > 0 ? -1 : 1)
    }

    return {
      position: [0, yPos, zPos],
      length: length,
      rotation: [roofAngle, 0, 0]
    }
  }

  for (const zPos of roznjacePositions) {
    roofPurlins.push(calculatePurlinPosition(zPos))
  }

  return (
    <group>
      {/* Betonska ploča — donja ivica na y=0, 10 cm šire od anker ploča sa svake strane */}
      <mesh position={[0, SLAB_THICKNESS / 2, 0]}>
        <boxGeometry args={[length + 2 * SLAB_EDGE_INSET, SLAB_THICKNESS, width + 2 * SLAB_EDGE_INSET]} />
        <meshStandardMaterial color={VIS_COLORS.slab} roughness={0.92} metalness={0.04} />
      </mesh>

      {/* Posts */}
      {posts.map((post, idx) => (
        <Post key={`post-${idx}`} position={post.position} height={post.height} />
      ))}

      {/* Binders */}
      {binders.map((binder, idx) => (
        <Binder
          key={`binder-${idx}`}
          position={binder.position}
          width={binder.width}
          padKrova={padKrova}
          maxRoofHeight={maxRoofHeight}
          profili={binderProfili}
          stubPositions={stubPositions}
        />
      ))}

      {/* Roof purlins (rožnjače) */}
      {roofPurlins.map((purlin, idx) => (
        <RoofPurlin
          key={`purlin-${idx}`}
          position={purlin.position}
          length={purlin.length}
          rotation={purlin.rotation}
        />
      ))}
    </group>
  )
}

const DIMENSION_LABEL_STYLE = {
  color: '#0f172a',
  fontSize: '100px',
  fontWeight: 700,
  background: 'rgba(255,255,255,0.97)',
  padding: '8px 18px',
  borderRadius: '10px',
  border: `3px solid ${VIS_COLORS.dimension}`,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
  boxShadow: '0 2px 12px rgba(15,23,42,0.18)',
}

function DimensionLabel({ position, children, portal }) {
  return (
    <Html position={position} center distanceFactor={2} zIndexRange={[100, 0]} portal={portal}>
      <div style={DIMENSION_LABEL_STYLE}>{children}</div>
    </Html>
  )
}

function DimensionTick({ from, to, color = VIS_COLORS.dimension }) {
  return <Line points={[from, to]} color={color} lineWidth={2.5} />
}

// Kotirne linije: D (dužina), S (širina), V (visina) — strana okrenuta ka kameri
function DimensionAnnotations({ length, width, height, slabTopY, portal }) {
  const gap = Math.max(0.45, Math.min(length, width) * 0.1)
  const tick = 0.15
  const lineColor = VIS_COLORS.dimension

  const xMin = -length / 2
  const xMax = length / 2
  const zMin = -width / 2
  const zMax = width / 2
  const yBase = slabTopY
  const yTop = slabTopY + height

  // Kamera gleda sa +X, +Z — kotiramo sa te strane
  const dZ = zMax + gap
  const dY = yBase + 0.05
  const sX = xMax + gap
  const vX = xMax + gap * 0.55
  const vZ = zMax + gap * 0.55

  return (
    <group>
      {/* D — dužina */}
      <DimensionTick from={[xMin, dY, dZ]} to={[xMax, dY, dZ]} color={lineColor} />
      <DimensionTick from={[xMin, dY, dZ - tick]} to={[xMin, dY, dZ + tick]} color={lineColor} />
      <DimensionTick from={[xMax, dY, dZ - tick]} to={[xMax, dY, dZ + tick]} color={lineColor} />
      <DimensionLabel position={[(xMin + xMax) / 2, dY + 0.2, dZ]} portal={portal}>
        D = {length} m
      </DimensionLabel>

      {/* S — širina */}
      <DimensionTick from={[sX, dY, zMin]} to={[sX, dY, zMax]} color={lineColor} />
      <DimensionTick from={[sX - tick, dY, zMin]} to={[sX + tick, dY, zMin]} color={lineColor} />
      <DimensionTick from={[sX - tick, dY, zMax]} to={[sX + tick, dY, zMax]} color={lineColor} />
      <DimensionLabel position={[sX, dY + 0.2, (zMin + zMax) / 2]} portal={portal}>
        S = {width} m
      </DimensionLabel>

      {/* V — visina */}
      <DimensionTick from={[vX, yBase, vZ]} to={[vX, yTop, vZ]} color={lineColor} />
      <DimensionTick from={[vX - tick, yBase, vZ - tick]} to={[vX + tick, yBase, vZ + tick]} color={lineColor} />
      <DimensionTick from={[vX - tick, yTop, vZ - tick]} to={[vX + tick, yTop, vZ + tick]} color={lineColor} />
      <DimensionLabel position={[vX + 0.15, (yBase + yTop) / 2, vZ + 0.15]} portal={portal}>
        V = {height} m
      </DimensionLabel>
    </group>
  )
}

// Registruje funkciju za snimanje trenutnog kadra scene
function CaptureRegistrar({ onCaptureReady }) {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    if (!onCaptureReady) return
    onCaptureReady(() => {
      gl.render(scene, camera)
      return gl.domElement?.toDataURL('image/png') || null
    })
  }, [gl, scene, camera, onCaptureReady])

  return null
}

// Main visualization component
export default function Shed3DVisualization({
  length,
  width,
  height,
  padKrova,
  brojBindera,
  brojStubova,
  brojRoznjacaPoBinderu,
  ukupanBrojRoznjaca,
  binderProfili = [],
  onCaptureReady,
}) {
  const containerRef = useRef(null)
  const captureFnRef = useRef(null)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const registerCapture = useCallback((fn) => {
    captureFnRef.current = fn
  }, [])

  const captureFullImage = useCallback(async () => {
    captureFnRef.current?.()

    if (!containerRef.current) return null

    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })

    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: VIS_COLORS.background,
      scale: 2,
      useCORS: true,
      logging: false,
      ignoreElements: (el) => el.hasAttribute('data-capture-ignore'),
    })

    return canvas.toDataURL('image/png')
  }, [])

  useEffect(() => {
    if (!onCaptureReady) return
    onCaptureReady(captureFullImage)
  }, [onCaptureReady, captureFullImage])

  const handleCopyToClipboard = async () => {
    try {
      setIsCopying(true)
      const dataUrl = await captureFullImage()
      if (!dataUrl) return

      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])

      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    } catch (err) {
      console.error('Greška pri kopiranju slike:', err)
    } finally {
      setIsCopying(false)
    }
  }

  // Calculate camera position based on shed size
  const maxDimension = Math.max(length, width, height + SLAB_THICKNESS)
  const cameraDistance = maxDimension * 2.0

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-lg border border-gray-300 shadow-lg relative overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${VIS_COLORS.background}, #cac6bf)` }}
    >
      <Canvas
        className="!absolute inset-0"
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [cameraDistance, cameraDistance * 0.8, cameraDistance], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(VIS_COLORS.background)
        }}
      >
        <CaptureRegistrar onCaptureReady={registerCapture} />
        {/* Lighting — mekše, render stil */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[12, 14, 8]}
          intensity={0.85}
        />
        <directionalLight position={[-6, 8, -4]} intensity={0.25} />
        <pointLight position={[-10, 10, -10]} intensity={0.15} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={maxDimension * 0.75}
          maxDistance={maxDimension * 5}
          zoomSpeed={1.2}
        />

        {/* Shed structure */}
        <ShedStructure
          length={length}
          width={width}
          height={height}
          padKrova={padKrova}
          brojBindera={brojBindera}
          brojStubova={brojStubova}
          brojRoznjacaPoBinderu={brojRoznjacaPoBinderu}
          binderProfili={binderProfili}
        />

        <DimensionAnnotations
          length={length}
          width={width}
          height={height}
          slabTopY={SLAB_THICKNESS}
          portal={containerRef}
        />
      </Canvas>

      {/* Kompaktna legenda + kopiranje u jednom panelu */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
        <div className="pointer-events-auto inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 max-w-full bg-white/92 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 text-[11px] sm:text-xs text-slate-700">
          <span className="inline-flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: VIS_COLORS.post }} />
            Stubovi {brojStubova}
          </span>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: VIS_COLORS.binderMain }} />
            Binderi {brojBindera}
          </span>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: VIS_COLORS.purlin }} />
            Rožnjače {brojRoznjacaPoBinderu}/b · {ukupanBrojRoznjaca} m
          </span>
          <span className="hidden sm:inline text-slate-200 mx-0.5">|</span>
          <button
            type="button"
            onClick={handleCopyToClipboard}
            disabled={isCopying}
            data-capture-ignore
            className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 disabled:opacity-60 border border-slate-200 transition-colors sm:ml-0 ml-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="whitespace-nowrap">
              {copyFeedback ? 'Kopirano!' : isCopying ? '...' : 'Kopiraj'}
            </span>
          </button>
        </div>
      </div>

      {/* Dimenzije hale */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md text-xs sm:text-sm border border-slate-200">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Dimenzije hale</p>
        <p className="text-sm sm:text-base font-bold text-slate-800">
          {length} × {width} × {height} m
        </p>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1">D × S × V</p>
      </div>
    </div>
  )
}
