import type {
  FilterReasonTypes,
  MotorDirectionTypes,
  VibrationDirectionTypes,
} from '../types/dashboardTypes'

export const DIRECTION_LABELS: Record<VibrationDirectionTypes, string> = {
  FRONT: '앞',
  BACK: '뒤',
  LEFT: '왼쪽',
  RIGHT: '오른쪽',
  UNKNOWN: '방향 미상',
}

/** 감지 방향별로 실제 울리는 모터 (넥밴드 모터: 좌 · 우 · 뒤). 앞쪽은 모터가 없어 양쪽이 같이 울린다 */
export const ACTIVE_MOTORS_BY_DIRECTION: Record<VibrationDirectionTypes, MotorDirectionTypes[]> = {
  FRONT: ['LEFT', 'RIGHT'],
  BACK: ['BACK'],
  LEFT: ['LEFT'],
  RIGHT: ['RIGHT'],
  UNKNOWN: [],
}

export const FILTER_REASON_LABELS: Record<FilterReasonTypes, string> = {
  not_in_mode: '현재 모드에 없는 소리',
  no_active_mode: '활성 모드 없음',
}
