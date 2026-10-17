import type { MotorDirectionTypes, VibrationDirectionTypes } from '../types/dashboardTypes'

/** 카메라가 공전하는 중심점 (착용자 목 부근) */
export const SCENE_TARGET: [number, number, number] = [0, 1.4, 0]
export const CAMERA_DISTANCE = 6.4
export const CAMERA_ELEVATION_RAD = 0.38
export const CAMERA_FOV = 30
export const CAMERA_SWAY_RAD = 0.08

/**
 * 방향별 카메라 방위각 (0 = 착용자 정면, π = 뒤, 양수 = 착용자 왼쪽).
 * 진동 방향이 바뀌면 카메라가 해당 모터가 잘 보이는 각도로 돌아간다.
 * 앞 · 좌 · 우는 정면 쪽에서(좌 · 우는 그 어깨 쪽으로 살짝 돌아서) 얼굴과 가슴 앞 모터가 보이게,
 * 뒤는 등 뒤에서 뒷목 모터가 보이게 한다.
 */
export const CAMERA_AZIMUTH_BY_DIRECTION: Record<VibrationDirectionTypes | 'IDLE', number> = {
  IDLE: -0.6,
  FRONT: 0.45,
  BACK: Math.PI,
  LEFT: 0.7,
  RIGHT: -0.7,
  UNKNOWN: -0.6,
}

/** 소리가 들어온 방향 (월드 좌표, 착용자는 +z 를 바라봄 → 착용자 왼쪽 = +x) */
export const DIRECTION_VECTORS: Record<
  Exclude<VibrationDirectionTypes, 'UNKNOWN'>,
  [number, number, number]
> = {
  FRONT: [0, 0, 1],
  BACK: [0, 0, -1],
  LEFT: [1, 0, 0],
  RIGHT: [-1, 0, 0],
}

/** 모터 하우징 위치 (넥밴드 곡선 위 파라미터 u, 0 = 왼쪽 끝 · 1 = 오른쪽 끝) */
export const MOTOR_CURVE_POSITIONS: Record<MotorDirectionTypes, number> = {
  LEFT: 0.045,
  BACK: 0.5,
  RIGHT: 0.955,
}

export const VIBRATION_PULSE_DURATION_S = 1.8
export const SOUND_WAVE_DISTANCE = 1.9
export const SOUND_WAVE_HEIGHT = 1.5
export const COMPASS_RADIUS = 2.3

export const SCENE_COLORS = {
  mannequin: '#5a606b',
  band: '#d9dbe0',
  motor: '#cfd2d8',
  motorGlow: '#ff2a1a',
  label: '#8b93a5',
  ring: '#353b49',
} as const

/**
 * 사람 흉상 GLB (gltf-transform 으로 간략화 + meshopt 압축). 없거나 실패하면 번들에 내장된
 * 같은 모델의 간략판(assets/mannequinLowPoly.glb, utils/loadEmbeddedMannequin.ts)으로 대체.
 * VITE_MANNEQUIN_MODEL_URL 로 다른 경로(CDN 등)를 지정할 수 있다.
 */
export const MANNEQUIN_MODEL_URL: string =
  import.meta.env.VITE_MANNEQUIN_MODEL_URL || `${import.meta.env.BASE_URL}models/mannequin.glb`
/** 모델 전체 높이를 이 값(씬 단위)으로 맞춘다. 바닥 = y 0 */
export const MANNEQUIN_TARGET_HEIGHT = 2.85

/** 넥밴드를 흉상 목에 맞추는 값 (GLB 흉상 기준) */
export const NECKBAND_FIT = {
  centerY: 1.47, // 목 밑동 높이
  radius: 0.58, // 뒤쪽 반지름 (목 뒤 여유 포함)
  endDrop: 0.4, // 양 끝이 가슴 쪽으로 내려오는 높이
  endFlare: 0.02, // 양 끝 반지름 추가
  startAngleDeg: 62, // 왼쪽 끝 각도 (xz 평면, +x 기준 반시계)
  spanDeg: 304, // 뒤쪽으로 감기는 각도 범위
} as const
