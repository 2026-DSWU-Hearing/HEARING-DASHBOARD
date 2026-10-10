import type { FilterReasonTypes, VibrationDirectionTypes } from '../types/dashboardTypes'

export const DIRECTION_LABELS: Record<VibrationDirectionTypes, string> = {
  FRONT: '앞',
  BACK: '뒤',
  LEFT: '왼쪽',
  RIGHT: '오른쪽',
  UNKNOWN: '방향 미상',
}

/** 모터가 달린 방향 (넥밴드: 좌 · 우 · 뒤) */
export const MOTOR_DIRECTIONS: VibrationDirectionTypes[] = ['LEFT', 'RIGHT', 'BACK']

export const FILTER_REASON_LABELS: Record<FilterReasonTypes, string> = {
  not_in_mode: '현재 모드에 없는 소리',
  no_active_mode: '활성 모드 없음',
}
