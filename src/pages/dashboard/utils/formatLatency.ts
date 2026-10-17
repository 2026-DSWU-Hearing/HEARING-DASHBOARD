const INVALID_LATENCY_LABEL = '—'
const MAX_REASONABLE_LATENCY_MS = 1000 * 60 * 10

/** receivedAt - detectedAt 을 ms 숫자로. 음수·비정상이면 null */
export const getLatencyMs = (detectedAt: string, receivedAt: string): number | null => {
  const detectedTime = Date.parse(detectedAt)
  const receivedTime = Date.parse(receivedAt)
  if (Number.isNaN(detectedTime) || Number.isNaN(receivedTime)) return null

  const latencyMs = receivedTime - detectedTime
  if (latencyMs < 0 || latencyMs > MAX_REASONABLE_LATENCY_MS) return null
  return Math.round(latencyMs)
}

/** 화면 표시용: "412 ms", 비정상이면 "—" */
export const formatLatency = (detectedAt: string, receivedAt: string): string => {
  const latencyMs = getLatencyMs(detectedAt, receivedAt)
  return latencyMs === null ? INVALID_LATENCY_LABEL : `${latencyMs.toLocaleString('ko-KR')} ms`
}
