import {
  DEFAULT_BATTERY_PERCENT,
  DEFAULT_MODE_NAME,
  DEMO_PERSONA,
} from '../constants/demoScenarios'
import { MAX_EVENT_COUNT } from '../constants/dashboardTheme'
import type { DashboardActionTypes, DashboardStateTypes } from '../types/dashboardTypes'

export const createInitialDashboardState = (): DashboardStateTypes => ({
  persona: DEMO_PERSONA,
  currentMode: DEFAULT_MODE_NAME,
  isDeviceConnected: true,
  batteryPercent: DEFAULT_BATTERY_PERCENT,
  events: [],
  activeEvent: null,
  activeStage: null,
  isReplayMode: true,
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
        currentMode: event.modeName,
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
        batteryPercent: action.batteryPercent ?? state.batteryPercent,
      }
    case 'REPLAY_TOGGLED':
      return { ...state, isReplayMode: action.isReplayMode }
    case 'EVENTS_CLEARED':
      return { ...state, events: [], activeEvent: null, activeStage: null }
    default:
      return state
  }
}
