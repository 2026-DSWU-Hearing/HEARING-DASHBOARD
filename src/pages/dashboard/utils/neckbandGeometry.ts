import * as THREE from 'three'
import { NECKBAND_FIT } from '../constants/neckbandScene'

const TUBE_RADIUS = 0.08
const TUBULAR_SEGMENTS = 260
const RADIAL_SEGMENTS = 28

const RIB_START = 0.07
const RIB_END = 0.3
const RIB_PITCH = 0.0235
const RIB_HEIGHT = 0.16
const COLLAR_START = 0.318
const COLLAR_END = 0.35

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** 넥밴드 곡선 위의 점. t: 0 = 왼쪽 앞 끝, 0.5 = 뒤 중앙, 1 = 오른쪽 앞 끝 */
const getNeckbandPoint = (t: number) => {
  const mirrored = Math.min(t, 1 - t)
  const endWeight = 1 - smoothstep(0, 0.36, mirrored) // 양 끝 1, 뒤쪽 0
  const { centerY, radius: baseRadius, endDrop, endFlare, startAngleDeg, spanDeg } = NECKBAND_FIT
  const angle = THREE.MathUtils.degToRad(startAngleDeg - spanDeg * t)
  const radius = baseRadius + endFlare * endWeight

  return new THREE.Vector3(
    radius * Math.cos(angle),
    centerY - endDrop * endWeight,
    radius * Math.sin(angle),
  )
}

export const createNeckbandCurve = () => {
  const sampleCount = 96
  const points = Array.from({ length: sampleCount + 1 }, (_, index) =>
    getNeckbandPoint(index / sampleCount),
  )
  return new THREE.CatmullRomCurve3(points, false, 'centripetal')
}

/** 유연한 주름 마디(양 끝) + 이음새 칼라를 반지름 배율로 표현 */
const getRadiusFactor = (u: number) => {
  const mirrored = Math.min(u, 1 - u)
  const ribWindow =
    smoothstep(RIB_START - 0.015, RIB_START + 0.01, mirrored) *
    (1 - smoothstep(RIB_END - 0.01, RIB_END + 0.015, mirrored))
  const ribPhase = (mirrored - RIB_START) / RIB_PITCH
  const bead = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * ribPhase), 0.55)
  const collar =
    smoothstep(COLLAR_START - 0.008, COLLAR_START + 0.008, mirrored) *
    (1 - smoothstep(COLLAR_END - 0.008, COLLAR_END + 0.008, mirrored))

  return 1 + RIB_HEIGHT * bead * ribWindow + 0.07 * collar
}

/** TubeGeometry 를 만든 뒤 링별로 반지름을 조절해 주름 마디를 만든다 */
export const createNeckbandTubeGeometry = (curve: THREE.Curve<THREE.Vector3>) => {
  const geometry = new THREE.TubeGeometry(
    curve,
    TUBULAR_SEGMENTS,
    TUBE_RADIUS,
    RADIAL_SEGMENTS,
    false,
  )
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const ringSize = RADIAL_SEGMENTS + 1
  const center = new THREE.Vector3()
  const vertex = new THREE.Vector3()

  for (let ringIndex = 0; ringIndex <= TUBULAR_SEGMENTS; ringIndex += 1) {
    const u = ringIndex / TUBULAR_SEGMENTS
    const factor = getRadiusFactor(u)
    curve.getPointAt(u, center)

    for (let radialIndex = 0; radialIndex < ringSize; radialIndex += 1) {
      const index = ringIndex * ringSize + radialIndex
      vertex.fromBufferAttribute(position, index).sub(center).multiplyScalar(factor).add(center)
      position.setXYZ(index, vertex.x, vertex.y, vertex.z)
    }
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export interface CurveFrameTypes {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
}

const UP_AXIS = new THREE.Vector3(0, 1, 0)

/** 곡선 위 u 지점의 위치 + 접선 방향으로 정렬된 회전 (캡슐의 축 = Y) */
export const getCurveFrame = (curve: THREE.Curve<THREE.Vector3>, u: number): CurveFrameTypes => {
  const position = curve.getPointAt(u)
  const tangent = curve.getTangentAt(u).normalize()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP_AXIS, tangent)
  return { position, quaternion }
}

/** 한글 라벨용 캔버스 텍스처 (스프라이트) */
export const createLabelTexture = (text: string, color: string) => {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (context) {
    context.font = '700 78px "Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = color
    context.fillText(text, size / 2, size / 2 + 4)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** 모터 발광 헤일로용 방사형 그라데이션 텍스처 (스프라이트, additive) */
export const createGlowTexture = () => {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    )
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.55)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
