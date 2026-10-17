import { hasStoredRefreshToken } from '@/shared/stores/authStore'
import {
  DEFAULT_BATTERY_PERCENT,
  DEFAULT_MODE_NAME,
  DEMO_PERSONA,
} from '../constants/demoScenarios'
import { MAX_EVENT_COUNT } from '../constants/dashboardTheme'
import type { DashboardActionTypes, DashboardStateTypes } from '../types/dashboardTypes'

/** 리플레이 모드에서 보여주는 시연용 상태 (라이브로 바뀌면 폴링값으로 덮어씀) */
const DEMO_STATUS: Pick<
  DashboardStateTypes,
  'persona' | 'currentMode' | 'isDeviceConnected' | 'batteryPercent' | 'isDeviceActiveUser'
> = {
  persona: DEMO_PERSONA,
  currentMode: DEFAULT_MODE_NAME,
  isDeviceConnected: true,
  batteryPercent: DEFAULT_BATTERY_PERCENT,
  isDeviceActiveUser: true,
}

/** 로그인(refresh 토큰)이 남아 있으면 라이브로, 아니면 리플레이로 시작 */
export const createInitialDashboardState = (): DashboardStateTypes => ({
  ...DEMO_STATUS,
  events: [],
  activeEvent: null,
  activeStage: null,
  isReplayMode: !hasStoredRefreshToken(),
  liveConnectionStatus: 'idle',
})

export const dashboardReducer = (
  state: DashboardStateTypes,
  action: DashboardActionTypes,
): DashboardStateTypes => {
  switch (action.type) {
    case 'EVENT_RECEIVED': {
      const { event } = action
      return {
        ...state,
        events: [event, ...state.events].slice(0, MAX_EVENT_COUNT),
        activeEvent: event,
        activeStage: 'detected', // 첫 스테이지는 즉시 점등, 이후는 usePipelineAnimation 이 진행
        // 라이브의 현재 모드는 서버(폴링 · mode_changed) 값이 기준 → 리플레이에서만 이벤트의 모드를 반영
        currentMode: state.isReplayMode ? event.modeName : state.currentMode,
      }
    }
    case 'STAGE_ADVANCED':
      return { ...state, activeStage: action.stage }
    case 'ANIMATION_FINISHED':
      // activeStage === null && activeEvent 존재 → 경로 전체 점등 완료 상태
      return { ...state, activeStage: null }
    case 'MODE_CHANGED':
      return { ...state, currentMode: action.modeName }
    case 'DEVICE_STATUS_CHANGED':
      return {
        ...state,
        isDeviceConnected: action.isDeviceConnected ?? state.isDeviceConnected,
        // null 도 유효한 값("보고 없음")이라 undefined 일 때만 유지
        batteryPercent:
          action.batteryPercent === undefined ? state.batteryPercent : action.batteryPercent,
        isDeviceActiveUser: action.isDeviceActiveUser ?? state.isDeviceActiveUser,
      }
    case 'PERSONA_CHANGED':
      return { ...state, persona: action.persona }
    case 'SOCKET_STATUS_CHANGED':
      return { ...state, liveConnectionStatus: action.status }
    case 'REPLAY_TOGGLED':
      // 리플레이로 돌아가면 시연용 상태 복원, 라이브로 가면 폴링이 곧 채운다
      return action.isReplayMode
        ? { ...state, ...DEMO_STATUS, isReplayMode: true, liveConnectionStatus: 'idle' }
        : { ...state, isReplayMode: false }
    case 'EVENTS_CLEARED':
      return { ...state, events: [], activeEvent: null, activeStage: null }
    default:
      return state
  }
}
