import type { VibrationDirectionTypes } from '../types/dashboardTypes'

/** 카메라가 공전하는 중심점 (착용자 목 부근) */
export const SCENE_TARGET: [number, number, number] = [0, 1.3, 0]
export const CAMERA_DISTANCE = 6.6
export const CAMERA_ELEVATION_RAD = 0.4
export const CAMERA_FOV = 30
export const CAMERA_SWAY_RAD = 0.08

/**
 * 방향별 카메라 방위각 (0 = 착용자 정면, π = 뒤, 양수 = 착용자 왼쪽).
 * 진동 방향이 바뀌면 카메라가 해당 모터가 잘 보이는 각도로 돌아간다.
 * 좌 · 우 · 뒤는 등 뒤에서 보여 착용자의 좌우가 화면의 좌우와 일치하게 한다.
 */
export const CAMERA_AZIMUTH_BY_DIRECTION: Record<VibrationDirectionTypes | 'IDLE', number> = {
  IDLE: -0.6,
  FRONT: 0.45,
  BACK: Math.PI,
  LEFT: 2.05,
  RIGHT: -2.05,
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
export const MOTOR_CURVE_POSITIONS: Record<'LEFT' | 'RIGHT' | 'BACK', number> = {
  LEFT: 0.045,
  BACK: 0.5,
  RIGHT: 0.955,
}

export const VIBRATION_PULSE_DURATION_S = 1.8
export const SOUND_WAVE_DISTANCE = 1.9
export const SOUND_WAVE_HEIGHT = 1.2
export const COMPASS_RADIUS = 2.3

export const SCENE_COLORS = {
  mannequin: '#3d414b',
  band: '#d9dbe0',
  motor: '#cfd2d8',
  motorGlow: '#ff2a1a',
  label: '#8b93a5',
  ring: '#2c3240',
} as const
