import { useCallback, useEffect, useRef, useState } from 'react'
import { REPLAY_LATENCY_MS } from '../constants/demoScenarios'
import type {
  DetectionEventTypes,
  ReplayScenarioTypes,
  ReplayStepTypes,
} from '../types/dashboardTypes'
import { createLocalEventId } from '../utils/parseDetectionMessage'
import { useDashboard } from './useDashboard'

/**
 * 리플레이 스텝 → 실제 이벤트.
 * id · receivedAt 을 채우고, 지연(ms) 표시가 실제처럼 보이도록
 * detectedAt 은 "지금 - 경로별 시뮬레이션 지연" 으로 바꿔 넣는다.
 */
export const materializeReplayStep = ({ event }: ReplayStepTypes): DetectionEventTypes => {
  const receivedTime = Date.now()
  const baseLatency = event.isOnDeviceVibrated
    ? REPLAY_LATENCY_MS.onDevice
    : REPLAY_LATENCY_MS.server
  const jitter = Math.round(Math.random() * REPLAY_LATENCY_MS.jitter)

  return {
    ...event,
    id: createLocalEventId('replay'),
    detectedAt: new Date(receivedTime - baseLatency - jitter).toISOString(),
    receivedAt: new Date(receivedTime).toISOString(),
  }
}

/** scenario 의 steps 를 delayMs 간격으로 순차 dispatch. scenario 가 null 이면 비활성 */
export const useReplay = (scenario: ReplayScenarioTypes | null) => {
  const { dispatch } = useDashboard()
  const [isPlaying, setIsPlaying] = useState(false)
  const timerIdRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (timerIdRef.current !== null) {
      window.clearTimeout(timerIdRef.current)
      timerIdRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const start = useCallback(() => {
    if (!scenario || scenario.steps.length === 0) return
    stop()
    setIsPlaying(true)

    const { steps } = scenario
    let stepIndex = 0

    const scheduleNextStep = () => {
      if (stepIndex >= steps.length) {
        timerIdRef.current = null
        setIsPlaying(false)
        return
      }
      const step = steps[stepIndex]
      stepIndex += 1
      timerIdRef.current = window.setTimeout(() => {
        dispatch({ type: 'EVENT_RECEIVED', event: materializeReplayStep(step) })
        scheduleNextStep()
      }, step.delayMs)
    }

    scheduleNextStep()
  }, [scenario, stop, dispatch])

  // 시나리오가 바뀌거나 언마운트되면 타이머 정리
  useEffect(() => stop, [scenario, stop])

  return { start, stop, isPlaying }
}
