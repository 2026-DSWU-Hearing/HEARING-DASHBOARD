import { describe, expect, it } from 'vitest'
import type { DashboardStateTypes, DetectionMessageTypes } from '../types/dashboardTypes'
import { createInitialDashboardState, dashboardReducer } from './dashboardReducer'
import { parseDetectionMessage } from './parseDetectionMessage'

const HORN_MESSAGE: DetectionMessageTypes = {
  type: 'detection',
  data: {
    id: 1,
    sound_name: '경적',
    sound_category: '긴급',
    source: 'ondevice',
    confidence: 0.91,
    location: null,
    detected_at: '2026-10-10T09:00:00+09:00',
    direction: 'BACK',
    ondevice_vibrated: true,
  },
}

const createState = (isReplayMode: boolean): DashboardStateTypes => ({
  ...createInitialDashboardState(),
  currentMode: '외출',
  isReplayMode,
})

describe('dashboardReducer EVENT_RECEIVED', () => {
  it('리플레이에선 이벤트의 모드가 현재 모드가 된다', () => {
    const event = parseDetectionMessage(HORN_MESSAGE, '회사')
    const next = dashboardReducer(createState(true), { type: 'EVENT_RECEIVED', event })

    expect(next.currentMode).toBe('회사')
    expect(next.activeEvent).toBe(event)
    expect(next.activeStage).toBe('detected')
  })

  it('라이브에선 수동 발화(숫자 키) 이벤트가 서버에서 받은 현재 모드를 덮어쓰지 않는다', () => {
    const event = parseDetectionMessage(HORN_MESSAGE, '회사')
    const next = dashboardReducer(createState(false), { type: 'EVENT_RECEIVED', event })

    expect(next.currentMode).toBe('외출')
    expect(next.events[0]).toBe(event)
  })
})
