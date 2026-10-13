import { describe, expect, it } from 'vitest'
import { parseSocketMessage } from './dashboardSocket'

describe('parseSocketMessage', () => {
  it('detection · detection_filtered 메시지를 돌려준다', () => {
    const detection = parseSocketMessage(
      JSON.stringify({ type: 'detection', data: { id: 1, sound_name: '경적' } }),
    )
    expect(detection?.type).toBe('detection')

    const filtered = parseSocketMessage(
      JSON.stringify({ type: 'detection_filtered', data: { sound_name: '개 짖음' } }),
    )
    expect(filtered?.type).toBe('detection_filtered')
  })

  it('모르는 type · data 없음 · 깨진 JSON 은 null', () => {
    expect(parseSocketMessage(JSON.stringify({ type: 'classification', data: {} }))).toBeNull()
    expect(parseSocketMessage(JSON.stringify({ type: 'detection' }))).toBeNull()
    expect(parseSocketMessage('{not json')).toBeNull()
  })
})
