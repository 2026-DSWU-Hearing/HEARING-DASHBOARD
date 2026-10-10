import { useEffect } from 'react'
import { ANIMATION_HOLD_MS, STAGE_INTERVAL_MS } from '../constants/dashboardTheme'
import { getStagePath } from '../constants/pipelineStages'
import type { DetectionEventTypes } from '../types/dashboardTypes'
import { useDashboard } from './useDashboard'

/**
 * 이벤트가 들어오면 레인(긴급/일반)을 정해 STAGE_INTERVAL_MS 간격으로 STAGE_ADVANCED,
 * 마지막 스테이지 후 ANIMATION_HOLD_MS 뒤 ANIMATION_FINISHED.
 * 새 이벤트가 중간에 오면 effect cleanup 으로 기존 타이머를 정리하고 새로 시작한다.
 */
export const usePipelineAnimation = (event: DetectionEventTypes | null) => {
  const { dispatch } = useDashboard()

  useEffect(() => {
    if (!event) return

    const stagePath = getStagePath(event.isOnDeviceVibrated, event.isMatched)
    let nextStageIndex = 1 // 'detected' 는 EVENT_RECEIVED 에서 이미 점등
    let timerId: number | null = null

    const advance = () => {
      if (nextStageIndex < stagePath.length) {
        dispatch({ type: 'STAGE_ADVANCED', stage: stagePath[nextStageIndex] })
        nextStageIndex += 1
        timerId = window.setTimeout(advance, STAGE_INTERVAL_MS)
        return
      }
      timerId = window.setTimeout(() => {
        dispatch({ type: 'ANIMATION_FINISHED' })
      }, ANIMATION_HOLD_MS)
    }

    timerId = window.setTimeout(advance, STAGE_INTERVAL_MS)

    return () => {
      if (timerId !== null) window.clearTimeout(timerId)
    }
  }, [event, dispatch])
}
