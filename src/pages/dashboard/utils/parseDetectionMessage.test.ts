import { describe, expect, it } from 'vitest'
import type { DetectionMessageTypes } from '../types/dashboardTypes'
import { parseDetectionMessage } from './parseDetectionMessage'

const RECEIVED_AT = '2026-10-10T09:00:00.420+09:00'

describe('parseDetectionMessage', () => {
  it('detection 메시지를 매칭된 이벤트로 변환한다', () => {
    const message: DetectionMessageTypes = {
      type: 'detection',
      data: {
        id: 1,
        sound_name: '경적',
        sound_category: '긴급',
        source: 'ai-server',
        confidence: 0.91,
        location: null,
        detected_at: '2026-10-10T09:00:00+09:00',
        direction: 'BACK',
        ondevice_vibrated: true,
      },
    }

    const event = parseDetectionMessage(message, '외출', RECEIVED_AT)

    expect(event).toEqual({
      id: '1',
      soundName: '경적',
      soundCategory: '긴급',
      confidence: 0.91,
      direction: 'BACK',
      isOnDeviceVibrated: true,
      isMatched: true,
      filterReason: null,
      modeName: '외출',
      detectedAt: '2026-10-10T09:00:00+09:00',
      receivedAt: RECEIVED_AT,
    })
  })

  it('detection_filtered 메시지를 필터링 이벤트로 변환한다', () => {
    const message: DetectionMessageTypes = {
      type: 'detection_filtered',
      data: {
        sound_name: '개 짖음',
        sound_category: '동물',
        confidence: 0.78,
        direction: 'LEFT',
        ondevice_vibrated: false,
        detected_at: '2026-10-10T09:00:03+09:00',
        reason: 'not_in_mode',
      },
    }

    const event = parseDetectionMessage(message, '외출', RECEIVED_AT)

    expect(event.id).toMatch(/^filtered-/)
    expect(event).toMatchObject({
      soundName: '개 짖음',
      soundCategory: '동물',
      confidence: 0.78,
      direction: 'LEFT',
      isOnDeviceVibrated: false,
      isMatched: false,
      filterReason: 'not_in_mode',
      modeName: '외출',
      detectedAt: '2026-10-10T09:00:03+09:00',
      receivedAt: RECEIVED_AT,
    })
  })

  it('direction · ondevice_vibrated 가 없으면 UNKNOWN · false 로 채운다', () => {
    const message: DetectionMessageTypes = {
      type: 'detection',
      data: {
        id: 7,
        sound_name: '초인종',
        sound_category: '생활음',
        source: 'ai-server',
        confidence: null,
        location: null,
        detected_at: '2026-10-10T09:00:00+09:00',
      },
    }

    const event = parseDetectionMessage(message, '집', RECEIVED_AT)

    expect(event.direction).toBe('UNKNOWN')
    expect(event.isOnDeviceVibrated).toBe(false)
    expect(event.confidence).toBeNull()
  })

  it('필터링 이벤트마다 서로 다른 id 를 생성한다', () => {
    const message: DetectionMessageTypes = {
      type: 'detection_filtered',
      data: {
        sound_name: '개 짖음',
        sound_category: '동물',
        confidence: 0.5,
        detected_at: '2026-10-10T09:00:03+09:00',
        reason: 'no_active_mode',
      },
    }

    const first = parseDetectionMessage(message, '외출', RECEIVED_AT)
    const second = parseDetectionMessage(message, '외출', RECEIVED_AT)

    expect(first.id).not.toBe(second.id)
  })
})
