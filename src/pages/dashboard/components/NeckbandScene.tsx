import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { DASHBOARD_THEME } from '../constants/dashboardTheme'
import {
  CAMERA_AZIMUTH_BY_DIRECTION,
  CAMERA_DISTANCE,
  CAMERA_ELEVATION_RAD,
  CAMERA_FOV,
  CAMERA_SWAY_RAD,
  COMPASS_RADIUS,
  DIRECTION_VECTORS,
  MOTOR_CURVE_POSITIONS,
  SCENE_COLORS,
  SCENE_TARGET,
  SOUND_WAVE_DISTANCE,
  SOUND_WAVE_HEIGHT,
  VIBRATION_PULSE_DURATION_S,
} from '../constants/neckbandScene'
import type { VibrationDirectionTypes } from '../types/dashboardTypes'
import { createBustGeometry, EAR_PLACEMENTS, EAR_SCALE } from '../utils/mannequinGeometry'
import {
  createGlowTexture,
  createLabelTexture,
  createNeckbandCurve,
  createNeckbandTubeGeometry,
  getCurveFrame,
} from '../utils/neckbandGeometry'

interface NeckbandScenePropTypes {
  activeDirection: VibrationDirectionTypes | null
  isVibrating: boolean
  /** 값이 바뀔 때마다 진동 펄스 1회 (이벤트 id 등) */
  pulseKey: string | null
}

interface PulseStateTypes {
  direction: VibrationDirectionTypes
  startedAt: number
}

type PulseRefTypes = RefObject<PulseStateTypes | null>
type MotorDirectionTypes = keyof typeof MOTOR_CURVE_POSITIONS

const MAX_FRAME_DELTA_S = 0.1

/** 0~1 펄스 세기: 감쇠 포락선 × 모터 떨림 */
const getPulseIntensity = (pulseRef: PulseRefTypes, now: number) => {
  const pulse = pulseRef.current
  if (!pulse) return 0
  const elapsed = (now - pulse.startedAt) / 1000
  if (elapsed < 0 || elapsed > VIBRATION_PULSE_DURATION_S) return 0
  const envelope = Math.pow(1 - elapsed / VIBRATION_PULSE_DURATION_S, 1.4)
  const buzz = 0.55 + 0.45 * Math.abs(Math.sin(elapsed * Math.PI * 5))
  return envelope * buzz
}

const CameraRig = ({ activeDirection }: { activeDirection: VibrationDirectionTypes | null }) => {
  const { camera } = useThree()
  const azimuthRef = useRef(CAMERA_AZIMUTH_BY_DIRECTION.IDLE)
  const target = useMemo(() => new THREE.Vector3(...SCENE_TARGET), [])

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, MAX_FRAME_DELTA_S)
    const goal = CAMERA_AZIMUTH_BY_DIRECTION[activeDirection ?? 'IDLE']
    const rawDiff = goal - azimuthRef.current
    const shortestDiff = Math.atan2(Math.sin(rawDiff), Math.cos(rawDiff))
    azimuthRef.current += shortestDiff * (1 - Math.exp(-clampedDelta * 2.2))

    const azimuth = azimuthRef.current + Math.sin(state.clock.elapsedTime * 0.35) * CAMERA_SWAY_RAD
    const horizontal = CAMERA_DISTANCE * Math.cos(CAMERA_ELEVATION_RAD)
    camera.position.set(
      target.x + horizontal * Math.sin(azimuth),
      target.y + CAMERA_DISTANCE * Math.sin(CAMERA_ELEVATION_RAD),
      target.z + horizontal * Math.cos(azimuth),
    )
    camera.lookAt(target)
  })

  return null
}

const Mannequin = () => {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: SCENE_COLORS.mannequin,
        roughness: 0.62,
        metalness: 0.05,
        clearcoat: 0.15,
        clearcoatRoughness: 0.5,
      }),
    [],
  )
  const bustGeometry = useMemo(() => createBustGeometry(), [])

  return (
    <group>
      <mesh geometry={bustGeometry} material={material} castShadow receiveShadow />
      {EAR_PLACEMENTS.map(({ position, rotation }) => (
        <mesh
          key={position[0]}
          material={material}
          position={position}
          rotation={rotation}
          scale={EAR_SCALE}
          castShadow
        >
          <sphereGeometry args={[1, 32, 24]} />
        </mesh>
      ))}
    </group>
  )
}

interface MotorHousingPropTypes {
  direction: MotorDirectionTypes
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  radius: number
  length: number
  pulseRef: PulseRefTypes
  glowTexture: THREE.Texture
}

const MotorHousing = ({
  direction,
  position,
  quaternion,
  radius,
  length,
  pulseRef,
  glowTexture,
}: MotorHousingPropTypes) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const haloMaterialRef = useRef<THREE.SpriteMaterial>(null)
  const baseColor = useMemo(() => new THREE.Color(SCENE_COLORS.motor), [])
  const glowColor = useMemo(() => new THREE.Color(SCENE_COLORS.motorGlow), [])

  useFrame(() => {
    const isTarget = pulseRef.current?.direction === direction
    const intensity = isTarget ? getPulseIntensity(pulseRef, performance.now()) : 0

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = intensity * 2.6
      materialRef.current.color.copy(baseColor).lerp(glowColor, intensity * 0.9)
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity * 7
    }
    if (haloRef.current && haloMaterialRef.current) {
      haloRef.current.scale.setScalar(0.5 + intensity * 1.3)
      haloMaterialRef.current.opacity = intensity * 0.95
    }
  })

  return (
    <group position={position} quaternion={quaternion}>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[radius, length, 8, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={SCENE_COLORS.motor}
          emissive={SCENE_COLORS.motorGlow}
          emissiveIntensity={0}
          roughness={0.42}
          metalness={0.08}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={SCENE_COLORS.motorGlow}
        intensity={0}
        distance={2.4}
        decay={2}
      />
      {/* 모터가 목 뒤에 가려져도 보이도록 additive 헤일로 (depthTest 없음) */}
      <sprite ref={haloRef} scale={[0, 0, 1]} renderOrder={10}>
        <spriteMaterial
          ref={haloMaterialRef}
          map={glowTexture}
          color={SCENE_COLORS.motorGlow}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
        />
      </sprite>
    </group>
  )
}

const Neckband = ({ pulseRef }: { pulseRef: PulseRefTypes }) => {
  const curve = useMemo(() => createNeckbandCurve(), [])
  const tubeGeometry = useMemo(() => createNeckbandTubeGeometry(curve), [curve])
  const glowTexture = useMemo(() => createGlowTexture(), [])
  const motorFrames = useMemo(
    () => ({
      LEFT: getCurveFrame(curve, MOTOR_CURVE_POSITIONS.LEFT),
      RIGHT: getCurveFrame(curve, MOTOR_CURVE_POSITIONS.RIGHT),
      BACK: getCurveFrame(curve, MOTOR_CURVE_POSITIONS.BACK),
    }),
    [curve],
  )

  return (
    <group>
      <mesh geometry={tubeGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={SCENE_COLORS.band} roughness={0.55} metalness={0.05} />
      </mesh>
      <MotorHousing
        direction="LEFT"
        {...motorFrames.LEFT}
        radius={0.115}
        length={0.24}
        pulseRef={pulseRef}
        glowTexture={glowTexture}
      />
      <MotorHousing
        direction="RIGHT"
        {...motorFrames.RIGHT}
        radius={0.115}
        length={0.24}
        pulseRef={pulseRef}
        glowTexture={glowTexture}
      />
      <MotorHousing
        direction="BACK"
        {...motorFrames.BACK}
        radius={0.1}
        length={0.22}
        pulseRef={pulseRef}
        glowTexture={glowTexture}
      />
    </group>
  )
}

interface SoundWavesPropTypes {
  activeDirection: VibrationDirectionTypes | null
  isVibrating: boolean
  pulseRef: PulseRefTypes
}

const WAVE_RADII = [0.3, 0.52, 0.74]
const WAVE_ARC = Math.PI * 0.6

/** 소리가 들어온 방향에서 머리 쪽으로 퍼지는 음파 아크 */
const SoundWaves = ({ activeDirection, isVibrating, pulseRef }: SoundWavesPropTypes) => {
  const materialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const color = isVibrating ? DASHBOARD_THEME.accent : DASHBOARD_THEME.filtered
  const vector =
    activeDirection && activeDirection !== 'UNKNOWN' ? DIRECTION_VECTORS[activeDirection] : null

  useFrame(() => {
    const isPulsing = pulseRef.current?.direction === activeDirection
    const intensity = isPulsing ? getPulseIntensity(pulseRef, performance.now()) : 0
    const elapsed = pulseRef.current ? (performance.now() - pulseRef.current.startedAt) / 1000 : 0

    materialRefs.current.forEach((material, index) => {
      if (!material) return
      const wave = 0.5 + 0.5 * Math.sin(2 * Math.PI * (elapsed * 1.6 - index * 0.33))
      material.opacity = 0.22 + 0.75 * wave * intensity
    })
  })

  if (!vector) return null

  const [x, , z] = vector
  const rotationY = Math.atan2(z, -x)

  return (
    <group
      position={[x * SOUND_WAVE_DISTANCE, SOUND_WAVE_HEIGHT, z * SOUND_WAVE_DISTANCE]}
      rotation={[0, rotationY, 0]}
    >
      {WAVE_RADII.map((radius, index) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, -WAVE_ARC / 2]}>
          <torusGeometry args={[radius, 0.014, 8, 48, WAVE_ARC]} />
          <meshBasicMaterial
            ref={(material) => {
              materialRefs.current[index] = material
            }}
            color={color}
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

const CompassLabels = () => {
  const labels = useMemo(
    () => [
      { text: '앞', position: [0, 0.08, COMPASS_RADIUS] as const },
      { text: '뒤', position: [0, 0.08, -COMPASS_RADIUS] as const },
      { text: '좌', position: [COMPASS_RADIUS, 0.08, 0] as const },
      { text: '우', position: [-COMPASS_RADIUS, 0.08, 0] as const },
    ],
    [],
  )
  const textures = useMemo(
    () => labels.map(({ text }) => createLabelTexture(text, SCENE_COLORS.label)),
    [labels],
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[COMPASS_RADIUS - 0.012, COMPASS_RADIUS + 0.012, 96]} />
        <meshBasicMaterial
          color={SCENE_COLORS.ring}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {labels.map(({ text, position }, index) => (
        <sprite key={text} position={[...position]} scale={[0.36, 0.36, 1]}>
          <spriteMaterial map={textures[index]} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <circleGeometry args={[2.6, 64]} />
    <shadowMaterial transparent opacity={0.4} />
  </mesh>
)

const Lights = () => (
  <>
    <ambientLight intensity={0.45} />
    <hemisphereLight args={['#dfe6ff', '#0b0d12', 0.55]} />
    <directionalLight
      position={[3, 6.5, 3.5]}
      intensity={2.4}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-4, 3, -2]} intensity={0.6} />
    <directionalLight position={[0, 4, -5]} intensity={1.1} color="#9ec5ff" />
  </>
)

const INITIAL_CAMERA_POSITION: [number, number, number] = [
  SCENE_TARGET[0] +
    CAMERA_DISTANCE * Math.cos(CAMERA_ELEVATION_RAD) * Math.sin(CAMERA_AZIMUTH_BY_DIRECTION.IDLE),
  SCENE_TARGET[1] + CAMERA_DISTANCE * Math.sin(CAMERA_ELEVATION_RAD),
  SCENE_TARGET[2] +
    CAMERA_DISTANCE * Math.cos(CAMERA_ELEVATION_RAD) * Math.cos(CAMERA_AZIMUTH_BY_DIRECTION.IDLE),
]

/**
 * 마네킹이 넥밴드를 착용한 3D 씬.
 * TODO: 실제 넥밴드 · 마네킹 GLB 가 준비되면 Neckband / Mannequin 을 useLoader(GLTFLoader) 로 교체
 */
const NeckbandScene = ({ activeDirection, isVibrating, pulseKey }: NeckbandScenePropTypes) => {
  const pulseRef = useRef<PulseStateTypes | null>(null)
  const lastPulseKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pulseKey || pulseKey === lastPulseKeyRef.current) return
    lastPulseKeyRef.current = pulseKey
    if (isVibrating && activeDirection) {
      pulseRef.current = { direction: activeDirection, startedAt: performance.now() }
    }
  }, [pulseKey, isVibrating, activeDirection])

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 40, position: INITIAL_CAMERA_POSITION }}
    >
      <CameraRig activeDirection={activeDirection} />
      <Lights />
      <Floor />
      <CompassLabels />
      <Mannequin />
      <Neckband pulseRef={pulseRef} />
      <SoundWaves activeDirection={activeDirection} isVibrating={isVibrating} pulseRef={pulseRef} />
    </Canvas>
  )
}

export default NeckbandScene
