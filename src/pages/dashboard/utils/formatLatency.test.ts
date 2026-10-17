import { describe, expect, it } from 'vitest'
import { formatLatency, getLatencyMs } from './formatLatency'

describe('formatLatency', () => {
  it('receivedAt - detectedAt 을 ms 로 표시한다', () => {
    expect(getLatencyMs('2026-10-10T09:00:00+09:00', '2026-10-10T09:00:00.412+09:00')).toBe(412)
    expect(formatLatency('2026-10-10T09:00:00+09:00', '2026-10-10T09:00:00.412+09:00')).toBe(
      '412 ms',
    )
  })

  it('음수 · 비정상 값은 "—" 로 표시한다', () => {
    expect(formatLatency('2026-10-10T09:00:01+09:00', '2026-10-10T09:00:00+09:00')).toBe('—')
    expect(formatLatency('invalid', '2026-10-10T09:00:00+09:00')).toBe('—')
    expect(formatLatency('2026-10-10T09:00:00+09:00', '2026-10-10T10:00:00+09:00')).toBe('—')
  })
})
