import * as THREE from 'three'

/**
 * 마네킹 흉상: 높이별 단면(초타원)을 보간해 하나의 곡면으로 만들고,
 * 얼굴 부위는 법선 방향 변위(가우시안 범프)로 조각한다.
 * 좌표: y 위, 얼굴은 +z 를 바라봄, 착용자 왼쪽 = +x
 */
interface BustKeyframeTypes {
  y: number
  halfWidth: number
  halfDepth: number
  centerZ: number
  backExponent: number // 초타원 지수 (2 = 타원, 클수록 각짐)
  frontExponent: number
}

const BUST_PROFILE: BustKeyframeTypes[] = [
  { y: 0.0, halfWidth: 1.5, halfDepth: 0.5, centerZ: 0, backExponent: 3, frontExponent: 3 },
  { y: 0.07, halfWidth: 1.7, halfDepth: 0.6, centerZ: 0, backExponent: 3, frontExponent: 3 },
  { y: 0.42, halfWidth: 1.76, halfDepth: 0.62, centerZ: 0, backExponent: 3, frontExponent: 3 },
  { y: 0.6, halfWidth: 1.62, halfDepth: 0.6, centerZ: 0, backExponent: 2.6, frontExponent: 2.6 },
  { y: 0.78, halfWidth: 1.0, halfDepth: 0.5, centerZ: 0.01, backExponent: 2.3, frontExponent: 2.3 },
  { y: 0.94, halfWidth: 0.5, halfDepth: 0.4, centerZ: 0.02, backExponent: 2.1, frontExponent: 2.1 },
  { y: 1.15, halfWidth: 0.38, halfDepth: 0.36, centerZ: 0.03, backExponent: 2, frontExponent: 2 },
  { y: 1.4, halfWidth: 0.36, halfDepth: 0.36, centerZ: 0.04, backExponent: 2, frontExponent: 2 },
  {
    y: 1.52,
    halfWidth: 0.44,
    halfDepth: 0.44,
    centerZ: 0.08,
    backExponent: 2.2,
    frontExponent: 2.6,
  },
  {
    y: 1.68,
    halfWidth: 0.54,
    halfDepth: 0.6,
    centerZ: 0.07,
    backExponent: 2.2,
    frontExponent: 2.8,
  },
  {
    y: 1.9,
    halfWidth: 0.62,
    halfDepth: 0.74,
    centerZ: 0.02,
    backExponent: 2.1,
    frontExponent: 2.8,
  },
  {
    y: 2.12,
    halfWidth: 0.66,
    halfDepth: 0.78,
    centerZ: -0.02,
    backExponent: 2.1,
    frontExponent: 2.7,
  },
  {
    y: 2.38,
    halfWidth: 0.65,
    halfDepth: 0.77,
    centerZ: -0.04,
    backExponent: 2.1,
    frontExponent: 2.4,
  },
  { y: 2.6, halfWidth: 0.54, halfDepth: 0.64, centerZ: -0.06, backExponent: 2, frontExponent: 2.1 },
  { y: 2.8, halfWidth: 0.3, halfDepth: 0.36, centerZ: -0.07, backExponent: 2, frontExponent: 2 },
  { y: 2.9, halfWidth: 0, halfDepth: 0, centerZ: -0.07, backExponent: 2, frontExponent: 2 },
]

export const BUST_TOP_Y = BUST_PROFILE[BUST_PROFILE.length - 1].y

interface FaceFeatureTypes {
  x: number
  y: number
  spreadX: number
  spreadY: number
  amount: number // + 돌출, - 함몰 (법선 방향)
  isMirrored: boolean
}

const FACE_FEATURES: FaceFeatureTypes[] = [
  // 눈두덩 함몰 + 감은 눈 볼록
  { x: 0.23, y: 2.17, spreadX: 0.16, spreadY: 0.09, amount: -0.03, isMirrored: true },
  { x: 0.22, y: 2.16, spreadX: 0.09, spreadY: 0.04, amount: 0.026, isMirrored: true },
  // 눈썹뼈
  { x: 0.26, y: 2.28, spreadX: 0.22, spreadY: 0.05, amount: 0.016, isMirrored: true },
  // 코: 콧대 · 코끝 · 콧방울
  { x: 0, y: 2.05, spreadX: 0.065, spreadY: 0.19, amount: 0.05, isMirrored: false },
  { x: 0, y: 1.9, spreadX: 0.09, spreadY: 0.075, amount: 0.08, isMirrored: false },
  { x: 0.09, y: 1.88, spreadX: 0.05, spreadY: 0.045, amount: 0.03, isMirrored: true },
  // 입: 윗입술 · 입선 · 아랫입술
  { x: 0, y: 1.745, spreadX: 0.17, spreadY: 0.028, amount: 0.022, isMirrored: false },
  { x: 0, y: 1.72, spreadX: 0.16, spreadY: 0.012, amount: -0.02, isMirrored: false },
  { x: 0, y: 1.69, spreadX: 0.13, spreadY: 0.03, amount: 0.026, isMirrored: false },
  // 턱 · 광대
  { x: 0, y: 1.56, spreadX: 0.15, spreadY: 0.08, amount: 0.035, isMirrored: false },
  { x: 0.42, y: 1.98, spreadX: 0.14, spreadY: 0.1, amount: 0.02, isMirrored: true },
]

const HEIGHT_SEGMENTS = 240
const RADIAL_SEGMENTS = 180

const signedPow = (value: number, exponent: number) =>
  Math.sign(value) * Math.pow(Math.abs(value), exponent)

const gaussian = (value: number) => Math.exp(-value * value)

const getFeatureOffset = (x: number, y: number) =>
  FACE_FEATURES.reduce((total, feature) => {
    const { spreadX, spreadY, amount, isMirrored } = feature
    const mirrorDistances = isMirrored ? [x - feature.x, x + feature.x] : [x - feature.x]
    return (
      total +
      mirrorDistances.reduce(
        (sum, dx) => sum + amount * gaussian(dx / spreadX) * gaussian((y - feature.y) / spreadY),
        0,
      )
    )
  }, 0)

export const createBustGeometry = () => {
  const shapeCurve = new THREE.CatmullRomCurve3(
    BUST_PROFILE.map(({ y, halfWidth, halfDepth }) => new THREE.Vector3(y, halfWidth, halfDepth)),
    false,
    'centripetal',
  )
  const detailCurve = new THREE.CatmullRomCurve3(
    BUST_PROFILE.map(
      ({ centerZ, backExponent, frontExponent }) =>
        new THREE.Vector3(centerZ, backExponent, frontExponent),
    ),
    false,
    'centripetal',
  )

  const positions: number[] = []
  const indices: number[] = []

  for (let row = 0; row <= HEIGHT_SEGMENTS; row += 1) {
    const t = row / HEIGHT_SEGMENTS
    const shape = shapeCurve.getPoint(t)
    const detail = detailCurve.getPoint(t)
    const y = shape.x
    const halfWidth = Math.max(shape.y, 0)
    const halfDepth = Math.max(shape.z, 0)
    const centerZ = detail.x

    for (let column = 0; column < RADIAL_SEGMENTS; column += 1) {
      const angle = (column / RADIAL_SEGMENTS) * Math.PI * 2
      const cosine = Math.cos(angle)
      const sine = Math.sin(angle)
      const exponent = Math.max(sine >= 0 ? detail.z : detail.y, 1.5)
      const x = halfWidth * signedPow(cosine, 2 / exponent)
      const z = halfDepth * signedPow(sine, 2 / exponent) + centerZ
      positions.push(x, y, z)
    }
  }

  for (let row = 0; row < HEIGHT_SEGMENTS; row += 1) {
    for (let column = 0; column < RADIAL_SEGMENTS; column += 1) {
      const nextColumn = (column + 1) % RADIAL_SEGMENTS
      const a = row * RADIAL_SEGMENTS + column
      const b = row * RADIAL_SEGMENTS + nextColumn
      const c = (row + 1) * RADIAL_SEGMENTS + column
      const d = (row + 1) * RADIAL_SEGMENTS + nextColumn
      indices.push(a, c, b, b, c, d)
    }
  }

  // 바닥 마감 (가슴 절단면)
  const bottomCenterIndex = positions.length / 3
  positions.push(0, BUST_PROFILE[0].y, BUST_PROFILE[0].centerZ)
  for (let column = 0; column < RADIAL_SEGMENTS; column += 1) {
    indices.push(bottomCenterIndex, column, (column + 1) % RADIAL_SEGMENTS)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  applyFaceFeatures(geometry)
  return geometry
}

/** 앞을 향한 정점을 법선 방향으로 밀고 당겨 이목구비를 만든다 */
const applyFaceFeatures = (geometry: THREE.BufferGeometry) => {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const normal = geometry.getAttribute('normal') as THREE.BufferAttribute
  const vertex = new THREE.Vector3()
  const vertexNormal = new THREE.Vector3()

  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index)
    vertexNormal.fromBufferAttribute(normal, index)
    const frontWeight = Math.max(0, vertexNormal.z)
    if (frontWeight < 0.05 || vertex.y < 1.45) continue

    const offset = getFeatureOffset(vertex.x, vertex.y) * frontWeight
    vertex.addScaledVector(vertexNormal, offset)
    position.setXYZ(index, vertex.x, vertex.y, vertex.z)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
}

export interface EarPlacementTypes {
  position: [number, number, number]
  rotation: [number, number, number]
}

export const EAR_PLACEMENTS: EarPlacementTypes[] = [
  { position: [0.64, 2.1, -0.02], rotation: [0, 0, -0.08] },
  { position: [-0.64, 2.1, -0.02], rotation: [0, 0, 0.08] },
]

export const EAR_SCALE: [number, number, number] = [0.055, 0.15, 0.1]
