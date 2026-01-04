'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

// Component for a single post (stub)
function Post({ position, height, color = '#4a5568' }) {
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
        <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Top plate (anker ploča) at top */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

// Helper function to create a beam from point A to point B
function BeamFromTo({ from, to, size, color }) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dz = to[2] - from[2]
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

  if (length === 0) return null

  // Calculate midpoint
  const midX = (from[0] + to[0]) / 2
  const midY = (from[1] + to[1]) / 2
  const midZ = (from[2] + to[2]) / 2

  // Calculate rotation using Euler angles
  // boxGeometry extends along Y axis, so we need to rotate it to point from 'from' to 'to'
  // First, calculate the angle in the horizontal plane (XZ)
  const horizontalAngle = Math.atan2(dx, dz)
  // Then, calculate the vertical angle
  const horizontalLength = Math.sqrt(dx * dx + dz * dz)
  const verticalAngle = Math.atan2(dy, horizontalLength)

  return (
    <mesh
      position={[midX, midY, midZ]}
      rotation={[verticalAngle, horizontalAngle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[size, length, size]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

// Component for a binder - triangular or rectangular frame with vertical supports
function Binder({ position, width, padKrova, roofSlopeRatio, maxRoofHeight, profili, roznjacePositions }) {
  const mainProfile = profili?.[0] // Larger profile (e.g., 80x60)
  const crossProfile = profili?.[1] // Smaller profile (e.g., 40x40)

  // Profile dimensions (approximate based on tip like "80x60")
  const mainSize = mainProfile ? parseFloat(mainProfile.tip.split('x')[0]) / 1000 : 0.08 // Convert mm to meters
  const crossSize = crossProfile ? parseFloat(crossProfile.tip.split('x')[0]) / 1000 : 0.04

  const color = '#48bb78'
  const crossColor = '#38a169' // Slightly darker green for cross-beams

  // Calculate triangle dimensions for 2 vode
  const triangleHeight = maxRoofHeight
  const triangleBase = width
  const leftSlopeLength = Math.sqrt((triangleBase / 2) ** 2 + triangleHeight ** 2)
  const leftSlopeAngle = Math.atan2(triangleHeight, triangleBase) // Angle in YZ plane

  return (
    <group position={position}>
      {padKrova === 1 ? (
        // Single slope (1 voda) - Triangular frame
        <group>
          {/* 1. Bottom horizontal beam - lies on posts */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[mainSize, mainSize, width]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          {/* 2. Left vertical beam - stands on left post, small height */}
          <mesh position={[0, maxRoofHeight / 2, width / 2]} castShadow receiveShadow>
            <boxGeometry args={[mainSize, maxRoofHeight, mainSize]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          {/* 3. Top sloped beam - connects vertical beam to right end of bottom beam */}
          {(() => {
            const topBeamLength = Math.sqrt(width ** 2 + maxRoofHeight ** 2)
            const topBeamAngle = Math.atan2(maxRoofHeight, width)
            return (
              <mesh
                position={[0, maxRoofHeight / 2, 0]}
                rotation={[-90 + 2.2 * topBeamAngle, 0, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[mainSize, topBeamLength, mainSize]} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
              </mesh>
            )
          })()}

          {/* Vertical supports (stubici) at roznjace positions */}
          {crossProfile && roznjacePositions && roznjacePositions.map((zPos, idx) => {
            const distanceFromLeft = zPos - (-width / 2)
            const topBeamY = maxRoofHeight * (1 - distanceFromLeft / width)
            const supportHeight = maxRoofHeight - topBeamY

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
        // Two slopes (2 vode) - Triangular frame
        <group>
          {/* Bottom horizontal beam - base of triangle */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[mainSize, mainSize, width]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          {/* Left sloped beam */}
          <mesh
            position={[0, maxRoofHeight / 2, -width / 4]}
            rotation={[-90 + 1.5 * leftSlopeAngle, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[mainSize, leftSlopeLength, mainSize]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          {/* Right sloped beam */}
          <mesh
            position={[0, maxRoofHeight / 2, width / 4]}
            rotation={[90 - 1.5 * leftSlopeAngle, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[mainSize, leftSlopeLength, mainSize]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>

          {/* Vertical supports (stubici) at roznjace positions */}
          {crossProfile && roznjacePositions && roznjacePositions.map((zPos, idx) => {
            const distanceFromCenter = Math.abs(zPos)
            const topBeamY = maxRoofHeight * (1 - distanceFromCenter / (width / 2))
            const supportHeight = topBeamY

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
    </group>
  )
}

// Component for roof purlins (rožnjače) - run along the length
function RoofPurlin({ position, length, rotation, color = '#ed8936' }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[length, 0.06, 0.06]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

// Main shed structure component
function ShedStructure({ length, width, height, padKrova, brojBindera, brojStubova, brojRoznjaca, binderProfili }) {
  // Roof slope calculation - typical shed roof slope is 10-20%
  const roofSlopeRatio = 0.15 // 15% slope
  const maxRoofHeight = width * roofSlopeRatio // Maximum height difference for roof

  // Calculate post positions
  const postsPerSide = brojBindera
  const postSpacing = postsPerSide > 1 ? length / (postsPerSide - 1) : 0

  const posts = []
  if (postsPerSide > 0) {
    for (let i = 0; i < postsPerSide; i++) {
      const xPos = i === 0 ? -length / 2 : (i === postsPerSide - 1 ? length / 2 : -length / 2 + i * postSpacing)
      // Left side posts (negative Z)
      posts.push({ position: [xPos, height / 2, -width / 2], height })
      // Right side posts (positive Z)
      posts.push({ position: [xPos, height / 2, width / 2], height })
    }
  }

  // Calculate binder positions
  const binders = []
  for (let i = 0; i < brojBindera; i++) {
    const xPos = postsPerSide > 1
      ? (i === 0 ? -length / 2 : (i === postsPerSide - 1 ? length / 2 : -length / 2 + i * postSpacing))
      : 0
    binders.push({ position: [xPos, height, 0], width })
  }

  // Calculate roof purlins (rožnjače)
  const roznjaceAcrossWidth = length > 0 ? Math.max(1, Math.floor(brojRoznjaca / length)) : 1
  const purlinZSpacing = width / (roznjaceAcrossWidth + 1)

  // Calculate roznjace Z positions for vertical supports in binders
  const roznjacePositions = []
  for (let zIdx = 0; zIdx < roznjaceAcrossWidth; zIdx++) {
    const zPos = (zIdx + 1) * purlinZSpacing - width / 2
    roznjacePositions.push(zPos)
  }

  const roofPurlins = []

  // Create continuous purlins running the full length
  for (let zIdx = 0; zIdx < roznjaceAcrossWidth; zIdx++) {
    const zPos = (zIdx + 1) * purlinZSpacing - width / 2

    let yPos
    let roofAngle

    if (padKrova === 1) {
      const distanceFromLowSide = zPos - (-width / 2)
      const yOffset = (distanceFromLowSide / width) * maxRoofHeight
      yPos = height + yOffset
      roofAngle = Math.atan(roofSlopeRatio)
    } else {
      const distanceFromCenter = Math.abs(zPos)
      const yOffset = (distanceFromCenter / (width / 2)) * maxRoofHeight
      yPos = height + maxRoofHeight - yOffset
      roofAngle = Math.atan(roofSlopeRatio) * (zPos > 0 ? -1 : 1)
    }

    roofPurlins.push({
      position: [0, yPos, zPos],
      length: length,
      rotation: [roofAngle, 0, 0]
    })
  }

  return (
    <group>
      {/* Ground/base platform */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[length, 0.1, width]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
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
          roofSlopeRatio={roofSlopeRatio}
          maxRoofHeight={maxRoofHeight}
          profili={binderProfili}
          roznjacePositions={roznjacePositions}
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

// Main visualization component
export default function Shed3DVisualization({
  length,
  width,
  height,
  padKrova,
  brojBindera,
  brojStubova,
  brojRoznjaca,
  binderProfili = []
}) {
  // Calculate camera position based on shed size
  const maxDimension = Math.max(length, width, height)
  const cameraDistance = maxDimension * 2.5

  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-300 shadow-lg relative">
      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [cameraDistance, cameraDistance * 0.8, cameraDistance], fov: 50 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={maxDimension * 1.5}
          maxDistance={maxDimension * 5}
        />

        {/* Grid helper */}
        <Grid args={[maxDimension * 2, maxDimension * 2]} cellColor="#e2e8f0" sectionColor="#cbd5e0" />

        {/* Shed structure */}
        <ShedStructure
          length={length}
          width={width}
          height={height}
          padKrova={padKrova}
          brojBindera={brojBindera}
          brojStubova={brojStubova}
          brojRoznjaca={brojRoznjaca}
          binderProfili={binderProfili}
        />
      </Canvas>

      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span>Stubovi ({brojStubova})</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Binderi ({brojBindera})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Rožnjače ({brojRoznjaca})</span>
        </div>
      </div>
    </div>
  )
}

