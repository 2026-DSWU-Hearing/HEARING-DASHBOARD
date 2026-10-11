import type { VibrationDirectionTypes } from '../types/dashboardTypes'

/** 카메라가 공전하는 중심점 (착용자 목 부근) */
export const SCENE_TARGET: [number, number, number] = [0, 1.32, 0]
export const CAMERA_DISTANCE = 5.3
export const CAMERA_ELEVATION_RAD = 0.5
export const CAMERA_FOV = 30
export const CAMERA_SWAY_RAD = 0.08

/**
 * 방향별 카메라 방위각 (0 = 착용자 정면, π = 뒤, 양수 = 착용자 왼쪽).
 * 진동 방향이 바뀌면 카메라가 해당 모터가 잘 보이는 각도로 돌아간다.
 */
export const CAMERA_AZIMUTH_BY_DIRECTION: Record<VibrationDirectionTypes | 'IDLE', number> = {
  IDLE: -2.45,
  FRONT: 0.55,
  BACK: 2.95,
  LEFT: 0.95,
  RIGHT: -0.95,
  UNKNOWN: -2.45,
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
export const SOUND_WAVE_DISTANCE = 1.7

export const SCENE_COLORS = {
  mannequin: '#1c1f27',
  band: '#d9dbe0',
  motor: '#cfd2d8',
  motorGlow: '#ff2a1a',
  label: '#8b93a5',
  ring: '#2c3240',
} as const
